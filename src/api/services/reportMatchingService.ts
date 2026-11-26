import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'

// Contract: deploy/fe-handoff/WEB-B-READ-CONTRACTS.md §B1 — GET/POST /projects/{projectId}/reports/{reportId}/matching-location (PM).
export interface MatchingEvidence { evidenceId: string; latitude: number | null; longitude: number | null; accuracyMeters: number | null; locationSource: string | null }
export interface MatchingConfirmation { id: string; sequence: number; actorId: string; confirmedAt: string; reason: string; evidenceId: string | null; segmentIds: string[]; latitude: number | null; longitude: number | null; accuracyMeters: number | null }
export interface MatchingLocationView { reportId: string; sourceVersion: string; geometryVersion: string; status: string; confirmation: MatchingConfirmation | null; evidence: MatchingEvidence[] }
export interface MatchingConfirmInput { sourceVersion: string; geometryVersion: string; evidenceId: string | null; segmentIds: string[]; reason: string }
interface PendingMatching { key: string; body: MatchingConfirmInput; fingerprint: string; receipt?: MatchingLocationView; rejected?: boolean }

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
const root = (p: string, r: string) => `/projects/${p}/reports/${r}/matching-location`
const journal = (p: string, r: string) => `rg_report_matching_${useAuthStore.getState().user?.id}_${p}_${r}`

export function matchingError(e: any): string {
  const status = e?.response?.status, code = e?.response?.data?.code, cid = e?.response?.data?.correlationId
  const known: Record<string, string> = {
    candidate_stale: 'Nguồn/hình học đã đổi; đọc lại rồi xác nhận lại.',
    matching_scope_conflict: 'Segment không thuộc bộ hình học đã pin của Case.',
    matching_evidence_location_unavailable: 'Ảnh đã chọn không thuộc Report hoặc thiếu GPS đã lưu.',
    idempotency_key_reused: 'Cùng khóa nhưng nội dung khác; không đổi nội dung lệnh đang chờ.'
  }
  if (status) return `${known[code] || 'Yêu cầu xác nhận vị trí thất bại.'} (HTTP ${status}${code ? ' ' + code : ''}${cid ? ' · mã đối chiếu ' + cid : ''})`
  return e?.message || 'Không kết nối được máy chủ.'
}

export const reportMatchingService = {
  async read(projectId: string, reportId: string, signal?: AbortSignal): Promise<MatchingLocationView> {
    const { data } = await apiClient.get<MatchingLocationView>(root(projectId, reportId), { signal })
    if (data?.reportId !== reportId || !Array.isArray(data.evidence) || !data.status) throw new Error('Xác nhận vị trí Report sai contract; không coi là rỗng.')
    return data
  },
  pending(projectId: string, reportId: string): PendingMatching | null {
    const raw = sessionStorage.getItem(journal(projectId, reportId))
    if (!raw) return null
    const p = JSON.parse(raw) as PendingMatching
    if (!p.key || !p.body || p.fingerprint !== JSON.stringify(p.body)) throw new Error('Journal xác nhận vị trí sai contract; cần đối chiếu trước khi ghi.')
    return p
  },
  discardRejected(projectId: string, reportId: string) { const p = this.pending(projectId, reportId); if (p?.rejected && !p.receipt) sessionStorage.removeItem(journal(projectId, reportId)) },
  /** POST xác nhận evidence/segment (PM). Key+body lưu trước khi gửi; retry nguyên vẹn; không đổi khóa khi chưa rõ kết quả. */
  async confirm(projectId: string, reportId: string, input: MatchingConfirmInput): Promise<MatchingLocationView> {
    if (useAuthStore.getState().user?.role !== 'PROJECT_MANAGER') throw new Error('Chỉ PM xác nhận vị trí matching.')
    if (!UUID.test(projectId) || !UUID.test(reportId) || input.evidenceId && !UUID.test(input.evidenceId)) throw new Error('ID không hợp lệ.')
    if (!input.sourceVersion || !input.geometryVersion || !input.reason.trim() || !input.evidenceId && !input.segmentIds.length) throw new Error('Cần phiên bản nguồn/hình học, lý do và ít nhất ảnh hoặc segment.')
    const body: MatchingConfirmInput = { sourceVersion: input.sourceVersion, geometryVersion: input.geometryVersion, evidenceId: input.evidenceId, segmentIds: input.segmentIds, reason: input.reason.trim() }
    const fingerprint = JSON.stringify(body), prev = this.pending(projectId, reportId)
    if (prev && prev.fingerprint !== fingerprint) throw new Error('Lệnh xác nhận trước chưa đối chiếu xong; không đổi key/nội dung.')
    if (prev?.rejected) throw new Error('Lệnh đã bị từ chối; đọc lại nguồn và lập ý định mới.')
    const cmd: PendingMatching = prev || { key: crypto.randomUUID(), body, fingerprint }
    const k = journal(projectId, reportId)
    sessionStorage.setItem(k, JSON.stringify(cmd))
    try {
      if (!cmd.receipt) {
        const res = await apiClient.post<MatchingLocationView>(root(projectId, reportId), cmd.body, { headers: { 'Idempotency-Key': cmd.key } })
        if (res.data?.reportId !== reportId || !res.data.confirmation) throw new Error('Phản hồi xác nhận vị trí sai contract; chỉ đọc lại, không POST thêm.')
        cmd.receipt = res.data; sessionStorage.setItem(k, JSON.stringify(cmd))
      }
      const fresh = await this.read(projectId, reportId)
      sessionStorage.removeItem(k)
      return fresh
    } catch (e: any) {
      const s = e?.response?.status
      if (!cmd.receipt && s >= 400 && s < 500 && s !== 408 && s !== 429) { cmd.rejected = true; sessionStorage.setItem(k, JSON.stringify(cmd)) }
      throw e
    }
  }
}
