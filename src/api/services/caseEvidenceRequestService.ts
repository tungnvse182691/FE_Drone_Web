import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { triageService, getCaseSessionKey, type InternalCaseDto } from './triageService'

interface EvidenceIntent {
  key: string
  projectId: string
  version: string
  body: { outcome: 'NEEDS_EVIDENCE'; reason: string; evidenceIds: string[]; defectIds: string[] }
  receipt?: InternalCaseDto
  receiptEtag?: string
  received?: boolean
  rejected?: boolean
}
const running = new Set<string>()
const uuid = (value: string) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value)
const journalKey = (caseId: string) => `rg_case_evidence_${useAuthStore.getState().user?.id}_${caseId}`
const etag = (value: string) => value.startsWith('"') ? value : `"${value}"`

export const caseEvidenceRequestService = {
  pending(caseId: string): EvidenceIntent | null {
    const saved = sessionStorage.getItem(journalKey(caseId))
    if (!saved) return null
    const intent = JSON.parse(saved) as EvidenceIntent
    if (!uuid(intent.key) || !uuid(intent.projectId) || !/^"[A-Za-z0-9+/]{11}="$/.test(intent.version) || intent.body?.outcome !== 'NEEDS_EVIDENCE' || !intent.body.reason?.trim()) throw new Error('Không đọc được yêu cầu bổ sung đang chờ; chưa gửi lệnh mới.')
    return intent
  },
  async request(caseId: string, projectId: string, reason: string, version: string) {
    if (useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER) throw new Error('Chỉ PM thuộc dự án được yêu cầu bổ sung bằng chứng.')
    if (!uuid(caseId) || !uuid(projectId) || !reason.trim() || !/^"[A-Za-z0-9+/]{11}="$/.test(etag(version))) throw new Error('Thiếu Case/dự án, lý do hoặc phiên bản hồ sơ đã đọc.')
    const key = journalKey(caseId), session = getCaseSessionKey()
    const active = () => { if (session !== getCaseSessionKey()) throw new Error('Phiên đã thay đổi; bỏ kết quả yêu cầu cũ.') }
    const previous = this.pending(caseId)
    if (!previous && sessionStorage.getItem(`rg_case_conclusion_${useAuthStore.getState().user?.id}_${caseId}`)) throw new Error('Còn lệnh kết luận trước chưa đối chiếu; giữ nguyên lệnh đó, chưa tạo yêu cầu bổ sung mới.')
    const command: EvidenceIntent = previous || { key: crypto.randomUUID(), projectId, version: etag(version), body: { outcome: 'NEEDS_EVIDENCE', reason: reason.trim(), evidenceIds: [], defectIds: [] } }
    if (command.projectId !== projectId || command.version !== etag(version) || command.body.reason !== reason.trim()) throw new Error('Yêu cầu trước chưa đối chiếu xong; giữ nguyên key, lý do và phiên bản.')
    if (command.rejected) throw new Error('Yêu cầu đã bị từ chối; đọc lại và chủ động đối chiếu trước khi gửi yêu cầu mới.')
    if (running.has(key)) throw new Error('Đang xử lý yêu cầu bổ sung bằng chứng.')
    running.add(key)
    try {
      active(); sessionStorage.setItem(key, JSON.stringify(command))
      if (!previous) {
        const current = await triageService.getCaseById(caseId); active()
        if (!current || current.id !== caseId || current.project_id !== projectId || current.case_status !== 'OPEN' || (current.etag || etag(current.version || '')) !== command.version) {
          command.rejected = true
          throw new Error('Hồ sơ hoặc phiên bản đã thay đổi; chỉ yêu cầu bổ sung trên Case OPEN đã phân công. Hãy đọc lại để đối chiếu.')
        }
      }
      if (!command.received) {
        const response = await apiClient.post<InternalCaseDto>(`/cases/${caseId}/conclusions`, command.body, {
          headers: { 'If-Match': command.version, 'Idempotency-Key': command.key },
          transformRequest: [(body: unknown) => { active(); return JSON.stringify(body) }]
        })
        active(); command.receipt = response.data; command.receiptEtag = response.headers?.etag; command.received = true
        sessionStorage.setItem(key, JSON.stringify(command))
      }
      const receipt = command.receipt
      if (command.receiptEtag && command.receiptEtag !== etag(receipt?.version || '')) throw new Error('Receipt trả ETag không khớp; chỉ đọc lại, không gửi lần nữa.')
      if (!receipt || receipt.id !== caseId || receipt.projectId !== projectId || receipt.status !== 'AWAITING_EVIDENCE' || !/^"[A-Za-z0-9+/]{11}="$/.test(etag(receipt.version || '')) || receipt.conclusion?.outcome !== 'NEEDS_EVIDENCE' || receipt.conclusion.reason !== command.body.reason) throw new Error('Receipt yêu cầu bổ sung sai hồ sơ/trạng thái/nội dung; không gửi lại.')
      const fresh = await triageService.getCaseById(caseId); active()
      if (!fresh || fresh.id !== caseId || fresh.project_id !== projectId || !['OPEN', 'AWAITING_EVIDENCE', 'CONCLUDED', 'LINKED'].includes(fresh.case_status || '') || !fresh.version || !/^"[A-Za-z0-9+/]{11}="$/.test(etag(fresh.version)) || fresh.etag && fresh.etag !== etag(fresh.version) || fresh.version === command.version.replace(/"/g, '')) throw new Error('Chưa GET xác nhận đúng hồ sơ/phiên bản; chỉ đọc lại kết quả.')
      const requestVerified = fresh.version === receipt.version
      if (requestVerified && (fresh.case_status !== 'AWAITING_EVIDENCE' || fresh.conclusion !== 'NEEDS_EVIDENCE' || fresh.conclusion_reason !== command.body.reason)) throw new Error('GET cùng phiên bản nhưng không khớp nội dung receipt; chỉ đọc lại kết quả.')
      // GET is the current read model. A different version can reflect a later
      // action (e.g. Reporter supplement); never replay an acknowledged write
      // just to force the Case back to the receipt's historical state.
      sessionStorage.removeItem(key)
      return { record: fresh, requestVerified }
    } catch (error: any) {
      active()
      if (!command.received && error.response?.status >= 400 && error.response.status < 500) command.rejected = true
      sessionStorage.setItem(key, JSON.stringify(command))
      throw error
    } finally { running.delete(key) }
  },
  revise(caseId: string) {
    const key = journalKey(caseId), pending = this.pending(caseId)
    if (running.has(key) || !pending?.rejected || pending.received) throw new Error('Chỉ đối chiếu yêu cầu đã bị từ chối rõ ràng; không bỏ yêu cầu chưa rõ kết quả.')
    sessionStorage.removeItem(key)
  }
}
