import { apiClient } from '../client'

// Chi tiết một lần chạy AI (GET /projects/{p}/ai-mock-runs/{runId}) — trạng thái, mã lỗi, mã tiến trình, hash manifest, version.
// `id` là runId (lần chạy AI mock); `processingJobId` là mã job xử lý do BE sinh — hai mã KHÁC nhau, dùng cho hai API khác nhau
// (runId → /ai-mock-runs/{runId}[/result]; processingJobId → /processing-jobs/{jobId}).
export interface AiRunDetail {
  id: string; projectId: string; stage?: string | null; mode?: string | null; status?: string | null
  processingJobId?: string | null; attemptId?: string | null; manifestHash?: string | null; resultId?: string | null
  fixtureVersion?: string | null; errorCode?: string | null; version?: string | null
  datasetId?: string | null; datasetVersionNo?: number | null; surveyTaskId?: string | null; createdAt?: string | null
}

export const AI_RUN_TERMINAL = ['SUCCEEDED', 'FAILED']
export const isAiRunTerminal = (status?: string | null) => AI_RUN_TERMINAL.includes(String(status || '').toUpperCase())

export const aiRunDetailService = {
  async read(projectId: string, runId: string, signal?: AbortSignal): Promise<AiRunDetail> {
    const { data } = await apiClient.get<AiRunDetail>(`/projects/${projectId}/ai-mock-runs/${runId}`, { signal })
    if (data?.id !== runId || data.projectId !== projectId) throw new Error('BE trả lần chạy AI sai ID/dự án.')
    return data
  },
  /** GET /projects/{p}/ai-mock-runs?surveyTaskId=&datasetId= — các lần chạy của đúng nhiệm vụ + bản nộp, mới nhất trước. */
  async listForDataset(projectId: string, taskId: string, datasetId: string, signal?: AbortSignal): Promise<AiRunDetail[]> {
    const rows: AiRunDetail[] = []
    let cursor: string | undefined
    for (let page = 0; page < 10; page++) {
      const { data } = await apiClient.get<{ items?: AiRunDetail[]; nextCursor?: string | null }>(`/projects/${projectId}/ai-mock-runs`, { params: { limit: 50, surveyTaskId: taskId, datasetId, cursor }, signal })
      if (!Array.isArray(data?.items)) throw new Error('BE trả danh sách lần chạy AI sai contract.')
      for (const r of data.items) {
        if (!r.id || r.projectId !== projectId || (r.surveyTaskId && r.surveyTaskId.toLowerCase() !== taskId.toLowerCase()) || (r.datasetId && r.datasetId.toLowerCase() !== datasetId.toLowerCase())) throw new Error('BE trả lần chạy AI sai dự án/nhiệm vụ/bản nộp.')
        rows.push(r)
      }
      cursor = data.nextCursor || undefined
      if (!cursor) break
    }
    return rows.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  },
}
