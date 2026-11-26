import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { triageService, getCaseSessionKey, type InternalCaseDto } from './triageService'
import { caseReportService } from './caseReportService'

interface NoDefectIntent {
  key: string; projectId: string; version: string
  body: { outcome: 'NO_DEFECT'; reason: string; evidenceIds: string[]; defectIds: string[] }
  received?: boolean; receipt?: InternalCaseDto; receiptEtag?: string; rejected?: boolean
}
const busy = new Set<string>()
const uuid = (v: string) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(v)
const etag = (v: string) => v.startsWith('"') ? v : `"${v}"`
const validVersion = (v: string) => /^"[A-Za-z0-9+/]{11}="$/.test(v)
const journal = (id: string) => `rg_case_conclusion_${useAuthStore.getState().user?.id}_${id}`
export const caseNoDefectService = {
  pending(id: string): NoDefectIntent | null {
    const raw = sessionStorage.getItem(journal(id)); if (!raw) return null
    const v = JSON.parse(raw) as NoDefectIntent
    if (!uuid(v.key) || !uuid(v.projectId) || !validVersion(v.version) || v.body?.outcome !== 'NO_DEFECT' || !v.body.reason?.trim() || !Array.isArray(v.body.evidenceIds) || v.body.evidenceIds.length !== 1 || !v.body.evidenceIds.every(uuid) || !Array.isArray(v.body.defectIds) || v.body.defectIds.length !== 0) throw new Error('Có lệnh kết luận cũ chưa đối chiếu; giữ nguyên lệnh, không gửi mới.')
    return v
  },
  async reviewRejected(id: string, projectId: string) {
    const key = journal(id), held = this.pending(id), session = getCaseSessionKey()
    if (useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER || busy.has(key) || !held?.rejected || held.received || held.projectId !== projectId) throw new Error('Chỉ đối chiếu lệnh bị từ chối rõ ràng; không bỏ lệnh chưa rõ kết quả.')
    const current = await triageService.getCaseById(id)
    if (getCaseSessionKey() !== session) throw new Error('Phiên đã thay đổi.')
    if (!current || current.id !== id || current.project_id !== projectId || current.case_status !== 'OPEN' || !validVersion(current.etag || etag(current.version || ''))) throw new Error('Case không còn OPEN hoặc sai phạm vi; không chuẩn bị kết luận mới.')
    sessionStorage.removeItem(key)
    return current
  },
  async request(id: string, projectId: string, reason: string, version: string, evidenceId: string) {
    if (useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER) throw new Error('Chỉ PM thuộc dự án được kết luận Case.')
    if (!uuid(id) || !uuid(projectId) || !reason.trim() || !uuid(evidenceId) || !validVersion(etag(version))) throw new Error('Cần Case/dự án, lý do, bằng chứng đã chọn và ETag hợp lệ.')
    const key = journal(id), session = getCaseSessionKey(), active = () => { if (getCaseSessionKey() !== session) throw new Error('Phiên đã thay đổi; bỏ kết quả cũ.') }
    const held = this.pending(id)
    if (!held && sessionStorage.getItem(`rg_case_evidence_${useAuthStore.getState().user?.id}_${id}`)) throw new Error('Yêu cầu bổ sung bằng chứng chưa đối chiếu xong; chưa kết luận mới.')
    const command: NoDefectIntent = held || { key: crypto.randomUUID(), projectId, version: etag(version), body: { outcome: 'NO_DEFECT', reason: reason.trim(), evidenceIds: [evidenceId], defectIds: [] } }
    if (command.projectId !== projectId || command.version !== etag(version) || command.body.reason !== reason.trim() || command.body.evidenceIds[0] !== evidenceId) throw new Error('Giữ nguyên bằng chứng, lý do, key và phiên bản của lệnh đang chờ.')
    if (command.rejected) throw new Error('Lệnh bị từ chối; hãy đọc lại và đối chiếu trước khi tạo ý định mới.')
    if (busy.has(key)) throw new Error('Đang xử lý kết luận Case.')
    busy.add(key)
    try {
      active()
      if (!held) {
        const current = await triageService.getCaseById(id); active()
        if (current?.id !== id || current.project_id !== projectId || current.case_status !== 'OPEN' || (current.etag || etag(current.version || '')) !== command.version) throw new Error('Case/quyền hoặc ETag thay đổi; chỉ kết luận Case OPEN đã phân công, hãy đọc lại.')
        const reports = await caseReportService.read(id); active()
        if (!reports.some(report => [...report.originalEvidence, ...report.supplements.flatMap(s => s.evidence)].some(e => e.evidenceId === evidenceId))) throw new Error('Bằng chứng đã chọn không còn thuộc hồ sơ server.')
        sessionStorage.setItem(key, JSON.stringify(command))
      }
      if (!command.received) {
        const response = await apiClient.post<InternalCaseDto>(`/cases/${id}/conclusions`, command.body, {headers: {'If-Match': command.version, 'Idempotency-Key': command.key}, transformRequest: [(body: unknown) => { active(); return JSON.stringify(body) }]})
        active(); command.received = true; command.receipt = response.data; command.receiptEtag = response.headers?.etag; sessionStorage.setItem(key, JSON.stringify(command))
      }
      const receipt = command.receipt
      if (!receipt || receipt.id !== id || receipt.projectId !== projectId || receipt.status !== 'CONCLUDED' || !validVersion(etag(receipt.version || '')) || receipt.conclusion?.outcome !== 'NO_DEFECT' || receipt.conclusion.reason !== command.body.reason || receipt.conclusion.evidenceIds?.length !== 1 || receipt.conclusion.evidenceIds[0] !== evidenceId || command.receiptEtag && command.receiptEtag !== etag(receipt.version || '')) throw new Error('Receipt không khớp hồ sơ/kết luận; chỉ đọc lại, không POST lần nữa.')
      const current = await triageService.getCaseById(id); active()
      if (!current || current.id !== id || current.project_id !== projectId || !['OPEN','CONCLUDED','AWAITING_EVIDENCE','LINKED'].includes(current.case_status || '') || !validVersion(etag(current.version || '')) || current.etag && current.etag !== etag(current.version || '') || current.version === command.version.replace(/"/g, '')) throw new Error('Chưa GET xác nhận đúng hồ sơ/phiên bản; chỉ đọc lại.')
      const verified = current.version === receipt.version
      if (verified && (current.case_status !== 'CONCLUDED' || current.conclusion !== 'NO_DEFECT' || current.conclusion_reason !== command.body.reason)) throw new Error('GET cùng phiên bản không khớp receipt; chỉ đọc lại.')
      sessionStorage.removeItem(key); return {record: current, verified}
    } catch (e: any) {
      active()
      if (!command.received && e.response?.status >= 400 && e.response.status < 500) command.rejected = true
      if (held || sessionStorage.getItem(key)) sessionStorage.setItem(key, JSON.stringify(command))
      throw e
    } finally { busy.delete(key) }
  }
}
