import { apiClient } from '../client'

// Chi tiết một lần chạy AI (GET /projects/{p}/ai-mock-runs/{runId}) — trạng thái, mã lỗi, mã tiến trình, hash manifest, version.
export interface AiRunDetail {
  id: string; projectId: string; stage?: string | null; mode?: string | null; status?: string | null
  processingJobId?: string | null; attemptId?: string | null; manifestHash?: string | null; resultId?: string | null
  fixtureVersion?: string | null; errorCode?: string | null; version?: string | null
}

export const aiRunDetailService = {
  async read(projectId: string, runId: string): Promise<AiRunDetail> {
    const { data } = await apiClient.get<AiRunDetail>(`/projects/${projectId}/ai-mock-runs/${runId}`)
    if (data?.id !== runId || data.projectId !== projectId) throw new Error('BE trả lần chạy AI sai ID/dự án.')
    return data
  },
}
