import { apiClient } from '../client'
import { workflowCollection } from './workflowCollection'

export interface AiMockRun {
  id: string; projectId: string; stage?: string | null; mode?: string | null
  status?: string | null; processingJobId: string; resultId?: string | null
  fixtureVersion?: string | null; errorCode?: string | null; version?: string | null
}
export interface AiRunResult {
  runId: string; stage?: string | null; mode?: string | null; completedAt: string
  detections?: unknown[] | null; matches?: unknown[] | null
}
export const validationService = {
  getAiMockRuns(projectId: string, signal?: AbortSignal) {
    return workflowCollection<AiMockRun>(`/projects/${projectId}/ai-mock-runs`, projectId, signal)
  },
  async getAiMockRunResult(projectId: string, runId: string, signal?: AbortSignal): Promise<AiRunResult> {
    const { data } = await apiClient.get<AiRunResult>(`/projects/${projectId}/ai-mock-runs/${runId}/result`, { signal })
    if (data?.runId !== runId || !Number.isFinite(Date.parse(data.completedAt))) throw new Error('Kết quả AI không khớp lần chạy.')
    return data
  }
}

export interface ValidationProjectOption { id: string; name: string; code: string; chainage: string; surface_type: string }
