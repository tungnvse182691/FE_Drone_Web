import { useAuthStore } from '../../store/authStore'
import { apiClient } from '../client'

export interface CaseReportEvidence {
  evidenceId: string; fileId: string; fileVersion: string; supplementId: string | null
  capturedAt: string | null; locationSource: string
  location: { latitude: number | null; longitude: number | null; accuracyMeters: number | null } | null
  contentPath: string
}
export interface CaseReportDetail {
  caseId: string; reportId: string; reporterUserId: string; reporterDisplayName: string
  reporterPhoneNumber: string | null; reporterPhoneNumberConfirmed: boolean
  description: string; receivedAt: string; originalEvidence: CaseReportEvidence[]
  supplements: Array<{ id: string; description: string; receivedAt: string; evidence: CaseReportEvidence[] }>
}

export const caseReportService = {
  async read(caseId: string, signal?: AbortSignal): Promise<CaseReportDetail[]> {
    const epoch = useAuthStore.getState().authEpoch
    const items = new Map<string, CaseReportDetail>()
    const seen = new Set<string>()
    let cursor: string | undefined
    do {
      const response = await apiClient.get<{ items: CaseReportDetail[]; nextCursor: string | null }>(`/cases/${caseId}/reports`, {
        params: { limit: 20, cursor }, signal
      })
      if (signal?.aborted || useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đọc phản ánh đã thay đổi.')
      if (!Array.isArray(response.data?.items) || response.data.nextCursor != null && (typeof response.data.nextCursor !== 'string' || !response.data.nextCursor)) throw new Error('Danh sách Report sai contract; không coi là rỗng.')
      for (const report of response.data.items) {
        if (!report.reportId || report.caseId !== caseId) throw new Error('Report trả về sai Case.')
        if (report.originalEvidence != null && !Array.isArray(report.originalEvidence) || report.supplements != null && !Array.isArray(report.supplements)) throw new Error('Report evidence/supplements sai contract.')
        if (items.has(report.reportId)) throw new Error('Report ID bị trùng giữa các trang.')
        items.set(report.reportId, {...report, originalEvidence: report.originalEvidence || [], supplements: (report.supplements || []).map(s=>({...s,evidence:s.evidence || []}))})
      }
      cursor = response.data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor Report bị lặp; danh sách chưa đầy đủ.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return [...items.values()]
  },

  contentUrl(caseId: string, reportId: string, evidence: CaseReportEvidence): string {
    const api = new URL(apiClient.defaults.baseURL || '/api/v1', window.location.origin)
    if (typeof evidence.contentPath !== 'string' || !evidence.contentPath || !evidence.evidenceId) throw new Error('Evidence thiếu contentPath/reference; không tự ghép đường ảnh.')
    const url = new URL(evidence.contentPath, api)
    const expected = `/api/v1/cases/${caseId}/reports/${reportId}/evidence/${evidence.evidenceId}/content`
    if (url.origin !== api.origin || url.pathname !== expected || url.search || url.hash) {
      throw new Error('Đường ảnh không thuộc API origin và evidence của Report đã chọn.')
    }
    return url.href
  },

  async image(caseId: string, reportId: string, evidence: CaseReportEvidence, signal?: AbortSignal): Promise<Blob> {
    const epoch = useAuthStore.getState().authEpoch
    try {
      const response = await apiClient.get(this.contentUrl(caseId, reportId, evidence), { responseType: 'blob', signal })
      if (signal?.aborted || useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đọc ảnh đã thay đổi.')
      if (response.headers?.etag && response.headers.etag !== `"${evidence.fileVersion}"`) throw new Error('Ảnh không khớp fileVersion đã đọc.')
      if (!['image/jpeg', 'image/png'].includes(response.data.type.split(';')[0])) throw new Error('Ảnh trả về không đúng JPEG/PNG.')
      return response.data
    } catch (error: any) {
      // Axios keeps ProblemDetails in a Blob for binary requests. Preserve the
      // original status/error while exposing its actual structured problem.
      if (error.response?.data instanceof Blob && error.response.data.type.includes('json')) {
        try { error.response.data = JSON.parse(await error.response.data.text()) } catch { /* retain original HTTP error */ }
      }
      throw error
    }
  }
}
