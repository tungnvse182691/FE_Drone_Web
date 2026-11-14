import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { getCaseSessionKey, triageService, type CaseTriageInput, type InternalCaseDto, type PendingTriage } from './triageService'
import { triageGeometryService } from './triageGeometryService'

type ScopeIntent = PendingTriage & { status: string; receiptEtag?: string }
const busy = new Set<string>()
const journal = (id: string) => `rg_case_scope_${useAuthStore.getState().user?.id}_${id}`
const etag = (v: string) => v.startsWith('"') ? v : `"${v}"`
const validVersion = (v: string) => /^"[A-Za-z0-9+/]{11}="$/.test(v)
const uuid = (v: string) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(v)
export const caseScopeService = {
  pending(id: string): ScopeIntent | null {
    const raw = sessionStorage.getItem(journal(id))
    if (!raw) return null
    const c = JSON.parse(raw) as ScopeIntent
    if (!c.key || !validVersion(c.version) || !uuid(c.body?.projectId || '') || !uuid(c.body.routeVersionId || '') || !uuid(c.body.segmentSetId || '') || !/^[a-f0-9]{64}$/i.test(c.body.geometryVersion || '') || !['OPEN','AWAITING_EVIDENCE'].includes(c.status) || c.fingerprint !== JSON.stringify({body:c.body,version:c.version}) || !['FIELD','DRONE','EXISTING_EVIDENCE'].includes(c.body.verificationMethod || '') || !c.body.reason?.trim() || c.body.reason.length > 1000) throw new Error('Journal phạm vi Case sai contract; chưa gửi lệnh mới.')
    return c
  },
  revise(id: string) {
    const held = this.pending(id)
    if (useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER || busy.has(journal(id)) || !held?.rejected || held.received || held.receipt) throw new Error('Chỉ đối chiếu lệnh phạm vi bị từ chối xác định.')
    sessionStorage.removeItem(journal(id))
  },
  async request(id: string, input: CaseTriageInput) {
    if (useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER) throw new Error('Chỉ PM có quyền dự án được cập nhật phạm vi Case đã phân công.')
    const held = this.pending(id), key = journal(id), session = getCaseSessionKey()
    const active = () => { if (getCaseSessionKey() !== session) throw new Error('Phiên đã thay đổi; bỏ kết quả phạm vi cũ.') }
    const version = etag(input.version || '')
    const body = {projectId:input.projectId,verificationMethod:input.verificationMethod,reason:input.reason?.trim(),routeVersionId:input.routeVersionId,segmentSetId:input.segmentSetId,geometryVersion:input.geometryVersion}
    const fingerprint = JSON.stringify({body,version})
    if (!uuid(id) || !uuid(body.projectId) || !validVersion(version) || !body.reason || body.reason.length > 1000 || !['FIELD','DRONE','EXISTING_EVIDENCE'].includes(body.verificationMethod || '') || !uuid(body.routeVersionId || '') || !uuid(body.segmentSetId || '') || !/^[a-f0-9]{64}$/i.test(body.geometryVersion || '')) throw new Error('Chọn phương thức, lý do, tuyến/set PUBLISHED và hash package; cần ETag Case đã đọc.')
    if (held && held.fingerprint !== fingerprint) throw new Error('Giữ nguyên body/key/version của cập nhật phạm vi đang chờ.')
    if (held?.rejected) throw new Error('Lệnh bị từ chối; đọc lại và đối chiếu trước ý định mới.')
    if (busy.has(key)) throw new Error('Đang cập nhật phạm vi Case.')
    busy.add(key)
    let command = held
    try {
      if (!command) {
        const current = await triageService.getCaseById(id); active()
        if (!current || current.id !== id || current.project_id !== body.projectId || !['OPEN','AWAITING_EVIDENCE'].includes(current.case_status || '') || (current.etag || etag(current.version || '')) !== version) throw new Error('Case khác dự án/trạng thái hoặc ETag đã đổi; đọc lại trước khi xác nhận.')
        const roads = await triageGeometryService.routes(body.projectId); active()
        const road = roads.find(r => r.currentVersionId === body.routeVersionId)
        if (!road) throw new Error('Tuyến không còn là phiên bản hiện hành trong dự án.')
        const sets = await triageGeometryService.sets(body.projectId,road); active()
        if (!sets.some(s => s.id === body.segmentSetId)) throw new Error('Bộ phân đoạn không còn PUBLISHED thuộc tuyến đã chọn.')
        const geometry = await triageGeometryService.package(body.projectId,road,body.segmentSetId!); active()
        if (geometry.geometryVersion !== body.geometryVersion) throw new Error('Geometry-package/hash đã thay đổi; giữ lựa chọn và đọc lại trước khi gửi.')
        command = {key:crypto.randomUUID(),body,version,fingerprint,status:current.case_status!}
        sessionStorage.setItem(key,JSON.stringify(command))
      }
      if (!command.received) {
        const response = await apiClient.post<InternalCaseDto>(`/cases/${id}/triage`,command.body,{headers:{'If-Match':command.version,'Idempotency-Key':command.key},transformRequest:[(data:unknown)=>{active();return JSON.stringify(data)}]})
        active();command.received=true;command.receipt=response.data;command.receiptEtag=response.headers?.etag;sessionStorage.setItem(key,JSON.stringify(command))
      }
      const receipt=command.receipt
      if (!receipt || receipt.id!==id || receipt.projectId!==body.projectId || receipt.status!==command.status || receipt.verificationMethod!==body.verificationMethod || !validVersion(etag(receipt.version || '')) || etag(receipt.version || '')===command.version || command.receiptEtag && command.receiptEtag!==etag(receipt.version || '')) throw new Error('Receipt phạm vi sai Case/project/status/method/version; chỉ đối chiếu GET, không POST mới.')
      const current=await triageService.getCaseById(id);active()
      if (!current || current.id!==id || current.project_id!==body.projectId || current.case_status!==receipt.status || current.verification_method!==receipt.verificationMethod || current.version!==receipt.version || current.etag!==etag(receipt.version!)) throw new Error('GET chưa khớp receipt phạm vi; chỉ đọc lại, không POST mới.')
      sessionStorage.removeItem(key)
      return current
    } catch (e:any) {
      active()
      // A 4xx on a replay cannot resolve an earlier timeout.
      if (command && !held && !command.received && e.response?.status>=400 && e.response.status<500) { command.rejected=true; sessionStorage.setItem(key,JSON.stringify(command)) }
      throw e
    } finally { busy.delete(key) }
  }
}
