import { apiClient } from '../client'
import type { AiCandidateFactsDto } from './surveyService'
import type { DatasetListItem, ProcessingJob } from './surveyDatasetService'
import { workflowCollection } from './workflowCollection'

interface CursorPage<T> { items: T[]; nextCursor?: string | null }
interface OffsetPage<T> { items: T[]; offset: number; limit: number; hasMore: boolean }
interface ResearchProject { projectId: string; name: string; projectCode?: string }
interface ResearchTask { id: string; projectId: string; operatorDisplayName?: string | null }
export interface ResearchDataset extends DatasetListItem { operator?: string | null }
interface AiWork { workId: string; jobId: string; currentAttemptId: string; state: string; errorCode?: string | null }
interface Detection { detectionId: string; typeCode: string; confidence?: number | null }
interface DetectionPage extends OffsetPage<Detection> { jobId: string; attemptId: string }

async function cursorRows<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const rows: T[] = [], cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const { data } = await apiClient.get<CursorPage<T>>(path, { params: { cursor, limit: 50 }, signal })
    if (!Array.isArray(data?.items) || (data.nextCursor != null && typeof data.nextCursor !== 'string')) {
      throw new Error('Danh sách trả sai cấu trúc.')
    }
    rows.push(...data.items)
    cursor = data.nextCursor || undefined
    if (cursor && cursors.has(cursor)) throw new Error('Máy chủ trả lặp trang dữ liệu.')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return rows
}

const limit = 50
function checkPage<T>(page: OffsetPage<T>, offset: number) {
  if (!Array.isArray(page?.items) || page.offset !== offset || page.limit !== limit ||
      typeof page.hasMore !== 'boolean' || (page.hasMore && page.items.length !== limit)) {
    throw new Error('Máy chủ trả sai thông tin phân trang AI.')
  }
}

export const researchSourceService = {
  async projects(signal: AbortSignal) {
    const rows = await cursorRows<ResearchProject>('/projects', signal)
    if (rows.some(row => !row.projectId || !row.name)) throw new Error('Danh sách dự án thiếu mã hoặc tên.')
    return rows
  },
  async datasets(projectId: string, signal: AbortSignal): Promise<ResearchDataset[]> {
    const tasks = await workflowCollection<ResearchTask>(`/projects/${projectId}/survey-tasks`, projectId, signal)
    const rows: ResearchDataset[] = []
    for (const task of tasks) {
      const datasets = await cursorRows<DatasetListItem>(`/survey-tasks/${task.id}/datasets`, signal)
      if (datasets.some(row => !row.id || row.surveyTaskId !== task.id || !row.version)) {
        throw new Error('Bộ dữ liệu không khớp nhiệm vụ khảo sát.')
      }
      rows.push(...datasets.map(row => ({ ...row, operator: task.operatorDisplayName })))
    }
    return rows
  },
  async works(projectId: string, dataset: ResearchDataset, signal: AbortSignal) {
    const { data: source } = await apiClient.get<{ id: string; dataVersionId: string; projectId: string; surveyTaskId: string; version: string }>(`/datasets/${dataset.id}`, { signal })
    if (source?.id !== dataset.id || source.projectId !== projectId || source.surveyTaskId !== dataset.surveyTaskId || !source.dataVersionId || !source.version) {
      throw new Error('Bộ dữ liệu AI không khớp dự án hoặc nhiệm vụ khảo sát.')
    }
    const rows: AiWork[] = []
    for (let offset = 0; ; offset += limit) {
      const { data } = await apiClient.get<OffsetPage<AiWork>>(`/projects/${projectId}/ai-videos`, { params: { datasetId: dataset.id, offset, limit }, signal })
      checkPage(data, offset)
      for (const work of data.items) {
        if (!work.workId || !work.jobId || !work.currentAttemptId || rows.some(row => row.workId === work.workId)) {
          throw new Error('Nguồn AI thiếu hoặc trùng định danh.')
        }
        rows.push(work)
      }
      if (!data.hasMore) return { rows, versionId: source.dataVersionId }
    }
  },
  async job(work: AiWork, signal: AbortSignal) {
    const { data } = await apiClient.get<ProcessingJob>(`/processing-jobs/${work.jobId}`, { signal })
    if (data?.id !== work.jobId || !data.version) throw new Error('Phản hồi không khớp lượt xử lý AI.')
    return data
  },
  async detections(projectId: string, work: AiWork, signal: AbortSignal) {
    const rows: Detection[] = [], ids = new Set<string>()
    let attemptId: string | undefined
    for (let offset = 0; ; offset += limit) {
      const { data } = await apiClient.get<DetectionPage>(`/projects/${projectId}/ai-jobs/${work.jobId}/detections`, { params: { offset, limit }, signal })
      checkPage(data, offset)
      if (data.jobId !== work.jobId || !data.attemptId || (attemptId && attemptId !== data.attemptId) ||
          data.attemptId !== work.currentAttemptId) throw new Error('Danh sách phát hiện không khớp lần xử lý AI.')
      attemptId = data.attemptId
      for (const detection of data.items) {
        if (!detection.detectionId || ids.has(detection.detectionId)) throw new Error('Danh sách phát hiện thiếu hoặc trùng định danh.')
        ids.add(detection.detectionId)
        rows.push(detection)
      }
      if (!data.hasMore) return { rows, attemptId }
    }
  },
  async candidate(projectId: string, detectionId: string, work: AiWork, versionId: string, attemptId: string, signal: AbortSignal) {
    const { data } = await apiClient.get<AiCandidateFactsDto>(`/projects/${projectId}/ai-candidates/${detectionId}`, { signal })
    if (data?.mode !== 'REAL' || data.detectionId !== detectionId || data.projectId !== projectId ||
        data.runId !== work.workId || data.jobId !== work.jobId || data.datasetVersionId !== versionId ||
        data.attemptId !== attemptId || !data.sourceVersion || !data.boundingBox) {
      throw new Error('Phát hiện không khớp nguồn AI thực đang xem.')
    }
    return data
  },
}
