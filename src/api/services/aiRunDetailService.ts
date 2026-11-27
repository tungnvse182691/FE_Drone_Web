import { apiClient } from '../client'

// Chi tiết một lần chạy AI (GET /projects/{p}/ai-mock-runs/{runId}) — trạng thái, mã lỗi, mã tiến trình, hash manifest, version.
// `id` là runId (lần chạy AI mock); `processingJobId` là mã job xử lý do BE sinh — hai mã KHÁC nhau, dùng cho hai API khác nhau
// (runId → /ai-mock-runs/{runId}[/result]; processingJobId → /processing-jobs/{jobId}).
export interface AiRunDetail {
  workId?: string; firstDetectionId?: string | null
  id: string; projectId: string; stage?: string | null; mode?: string | null; status?: string | null
  processingJobId?: string | null; attemptId?: string | null; manifestHash?: string | null; resultId?: string | null
  fixtureVersion?: string | null; errorCode?: string | null; version?: string | null
  datasetId?: string | null; datasetVersionNo?: number | null; surveyTaskId?: string | null; createdAt?: string | null
  originCorrelationId?: string | null
  failure?: { reasonCode?: string | null; step?: string | null; field?: string | null; recovery?: string | null; originCorrelationId?: string | null } | null
}

/**
 * Văn bản lỗi API cho khu vực AI: status thật, code, reasonCode/step/field/recovery (BE mới) và correlationId của request.
 * 401 và 403 được mô tả riêng (không gộp, không nói "chỉ nhận Bearer").
 */
export function aiApiErrorText(e: any, context = ''): string {
  const r = e?.response
  const prefix = context ? `${context}: ` : ''
  if (!r) return `${prefix}${e?.message || 'Không kết nối được máy chủ'}`
  const d = (r.data && typeof r.data === 'object' ? r.data : {}) as Record<string, any>
  const hint = r.status === 401 ? 'API từ chối xác thực; nếu phiên Web còn hợp lệ, cần kiểm tra cookie eligibility phía BE' : r.status === 403 ? 'tài khoản không đủ quyền với tài nguyên này' : ''
  const cid = d.correlationId || r.headers?.['x-correlation-id']
  const parts = [
    `HTTP ${r.status}`, d.code || d.title, hint,
    d.reasonCode && `reasonCode ${d.reasonCode}`, d.step && `bước ${d.step}`, d.field && `trường ${d.field}`,
    d.detail, d.recovery && `Hướng xử lý: ${d.recovery}`, cid && `correlationId ${cid}`,
  ].filter(Boolean)
  return `${prefix}${parts.join(' · ')}`
}

export const AI_RUN_TERMINAL = ['SUCCEEDED', 'FAILED']
export const isAiRunTerminal = (status?: string | null) => AI_RUN_TERMINAL.includes(String(status || '').toUpperCase())

export const aiRunDetailService = {
  async read(projectId: string, runId: string, signal?: AbortSignal): Promise<AiRunDetail> {
    const { data } = await apiClient.get<AiRunDetail>(`/projects/${projectId}/ai-mock-runs/${runId}`, { signal })
    if (data?.id !== runId || data.projectId !== projectId) throw new Error('BE trả lần chạy AI sai ID/dự án.')
    return data
  },
  /** FT95 work discovery: offset/hasMore; job IDs are never work IDs. */
  async listForDataset(projectId: string, taskId: string, datasetId: string, signal?: AbortSignal): Promise<AiRunDetail[]> {
    const dataset = (await apiClient.get<{ id: string; projectId: string; surveyTaskId: string }>(`/datasets/${datasetId}`, { signal })).data
    if (dataset.id !== datasetId || dataset.projectId !== projectId || dataset.surveyTaskId !== taskId) throw new Error('Bộ dữ liệu không thuộc dự án/nhiệm vụ đang xem.')
    const rows: AiRunDetail[] = []
    for (let offset = 0; ; offset += 50) {
      const { data } = await apiClient.get<{ items: Array<{ workId: string; jobId: string; state: string; errorCode?: string | null }>; hasMore: boolean }>(`/projects/${projectId}/ai-videos`, { params: { datasetId, offset, limit: 50 }, signal })
      if (!Array.isArray(data?.items) || typeof data.hasMore !== 'boolean') throw new Error('BE trả danh sách work AI sai contract.')
      for (const work of data.items) {
        if (!work.workId || !work.jobId || !work.state) throw new Error('Work AI thiếu workId/jobId/state.')
        const job = (await apiClient.get<{ id: string; status: string; resultId?: string | null }>(`/processing-jobs/${work.jobId}`, { signal })).data
        if (job.id !== work.jobId || !job.status) throw new Error('BE trả job AI sai ID/trạng thái.')
        rows.push({ id: work.workId, workId: work.workId, projectId, datasetId, surveyTaskId: taskId, processingJobId: job.id, firstDetectionId: job.resultId, status: job.status, stage: work.state, errorCode: work.errorCode })
      }
      if (!data.hasMore) return rows
      if (!data.items.length) throw new Error('Phân trang work AI không tiến triển.')
    }
  },
}
