import { apiClient } from '../client'

// Dữ liệu thật từ BE (SurveyV2 / SurveyAssessments / ProcessingV2). Route chưa mở cookie đi qua Bearer tạm [TEMP-BEARER].
export type Verdict = 'PASS' | 'FAIL' | 'UNKNOWN'
export interface BandScope { routeVersionId: string; segmentSetId: string; segmentIds: string[]; targetBand: 'SURFACE' | 'LEFT_EDGE' | 'RIGHT_EDGE' }
export interface DatasetDetail {
  id: string; surveyTaskId: string; projectId: string; submittedAt?: string | null; recordedAt?: string | null
  scope: BandScope[]; integrityStatus?: string | null; telemetryStatus?: string | null; version: string
  sourceFiles: { fileId: string; checksumSha256?: string; sizeBytes?: number; mediaType?: string; purpose?: string }[]
}
export interface CoverageItem { scope: BandScope; positionCoverage?: string; qualityCoverage?: string; overallCoverage?: string; reasons?: string[]; coverageStatus?: string | null }
export interface DatasetCoverage { datasetId: string; items: CoverageItem[]; methodVersion?: string | null; assessmentId?: string | null; version?: string | null }
export interface AssessmentItem { routeVersionId: string; segmentSetId: string; segmentId: string; targetBand: string; positionStatus: Verdict; qualityStatus: Verdict; coverageStatus: Verdict; reason: string; evidence: { fileId: string; fromMilliseconds: number; toMilliseconds: number }[] }
export interface AssessmentView { id: string; datasetId: string; methodVersion?: string | null; reviewedBy?: string; reviewedAt?: string; items: AssessmentItem[]; version?: string | null }
export interface ProcessingJob { id: string; status: string; resultId?: string | null; attemptNumber?: number; version: string; jobType?: string; error?: unknown }

const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const surveyDatasetService = {
  /** GET /datasets/{id}. Kiểm dataset đúng nhiệm vụ + dự án đang xem. */
  async dataset(datasetId: string, expect: { taskId: string; projectId: string }) {
    if (!GUID.test(datasetId.trim())) throw new Error('Mã bộ dữ liệu phải là GUID.')
    const { data, headers } = await apiClient.get<DatasetDetail>(`/datasets/${datasetId.trim()}`)
    if (data?.id !== datasetId.trim().toLowerCase() || !data.version) throw new Error('BE trả bộ dữ liệu sai ID/version.')
    if (data.projectId !== expect.projectId || data.surveyTaskId !== expect.taskId) throw new Error('Bộ dữ liệu này không thuộc nhiệm vụ/dự án đang xem.')
    return { dataset: data, etag: (headers.etag as string | undefined) || quote(data.version) }
  },
  /** GET /datasets/{datasetId}/coverage. */
  async coverage(datasetId: string) {
    const { data } = await apiClient.get<DatasetCoverage>(`/datasets/${datasetId}/coverage`)
    if (data?.datasetId !== datasetId || !Array.isArray(data.items)) throw new Error('BE trả độ phủ sai dataset/contract.')
    return data
  },
  /** GET /survey-tasks/{taskId}/work-package — gói công việc của nhiệm vụ khảo sát (hạn, phạm vi, tham chiếu hình học). */
  async workPackage(taskId: string) {
    const { data } = await apiClient.get<{ schemaVersion?: string; task?: { id: string; status?: string; operatorId?: string }; dueAt?: string; geometryRefs?: { routeVersionId: string; segmentSetId: string; segmentIds: string[] }[]; scopeVersion?: string }>(`/survey-tasks/${taskId}/work-package`)
    if (data?.task?.id !== taskId) throw new Error('BE trả gói công việc sai nhiệm vụ.')
    return data
  },
  /** GET /datasets/{id}/assessments/{assessmentId}. */
  async assessment(datasetId: string, assessmentId: string) {
    const { data } = await apiClient.get<AssessmentView>(`/datasets/${datasetId}/assessments/${assessmentId}`)
    if (data?.id !== assessmentId || data.datasetId !== datasetId) throw new Error('BE trả đánh giá sai reference.')
    return data
  },
  /** POST /datasets/{id}/assessments — If-Match = ETag dataset, Idempotency-Key. */
  async createAssessment(datasetId: string, etag: string, items: AssessmentItem[]) {
    if (!items.length) throw new Error('Chưa có phân đoạn để đánh giá.')
    if (items.some((i) => !i.reason.trim() || !i.evidence.length)) throw new Error('Mỗi phân đoạn cần lý do và bằng chứng.')
    const { data } = await apiClient.post<AssessmentView>(
      `/datasets/${datasetId}/assessments`,
      { methodVersion: 'pm-evidence-review.v1', items },
      { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(etag) } }
    )
    return data
  },
  /** POST /projects/{projectId}/baseline-selections — khóa baseline cho các phân đoạn của dataset đã được đánh giá. */
  async lockBaseline(projectId: string, dataset: DatasetDetail, assessmentId: string, reason: string) {
    const { data: existing } = await apiClient.get<{ items: { selectionId: string; routeVersionId: string; segmentSetId: string; segmentId: string; targetBand: string }[] }>(`/projects/${projectId}/baseline-selections`)
    if (!Array.isArray(existing?.items)) throw new Error('BE trả baseline-selections sai contract.')
    const items = dataset.scope.flatMap((s) => s.segmentIds.map((segmentId) => {
      const prev = existing.items.find((e) => e.routeVersionId === s.routeVersionId && e.segmentSetId === s.segmentSetId && e.segmentId === segmentId && e.targetBand === s.targetBand)
      return { routeVersionId: s.routeVersionId, segmentSetId: s.segmentSetId, segmentId, targetBand: s.targetBand, datasetId: dataset.id, assessmentId, ...(prev ? { expectedBaselineSelectionId: prev.selectionId } : {}) }
    }))
    const res = await apiClient.post(`/projects/${projectId}/baseline-selections`, { items, reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
    return res.data
  },
  /** GET /projects/{p}/baseline-selections/{id} — id là mã lần khóa baseline do POST trả về. */
  async baselineView(projectId: string, id: string) {
    if (!GUID.test(id.trim())) throw new Error('Mã lần khóa baseline phải là GUID.')
    const { data } = await apiClient.get<{ id: string; items: { selectionId: string; segmentId: string; targetBand: string; datasetId: string; assessmentId: string }[]; selectedBy?: string; selectedAt?: string; version?: string }>(`/projects/${projectId}/baseline-selections/${id.trim()}`)
    if (data?.id !== id.trim().toLowerCase() || !Array.isArray(data.items)) throw new Error('BE trả lần khóa baseline sai contract.')
    return data
  },
  // --- processing-jobs (spec PM-07) ---
  /** GET /projects/{p}/processing-jobs (phân trang cursor). */
  async jobs(projectId: string): Promise<ProcessingJob[]> {
    const rows: ProcessingJob[] = []
    let cursor: string | undefined
    for (let i = 0; i < 20; i++) {
      const { data } = await apiClient.get<{ items?: ProcessingJob[]; nextCursor?: string | null }>(`/projects/${projectId}/processing-jobs`, { params: { limit: 100, cursor } })
      if (!Array.isArray(data?.items)) throw new Error('Danh sách job sai contract.')
      rows.push(...data.items)
      cursor = data.nextCursor || undefined
      if (!cursor) break
    }
    return rows
  },
  /** GET /processing-jobs/{jobId}. */
  async job(jobId: string) {
    if (!GUID.test(jobId.trim())) throw new Error('Mã job phải là GUID.')
    const { data, headers } = await apiClient.get<ProcessingJob>(`/processing-jobs/${jobId.trim()}`)
    if (data?.id !== jobId.trim().toLowerCase() || !data.status || !data.version) throw new Error('BE trả job sai ID/status/version.')
    return { job: data, etag: (headers.etag as string | undefined) || quote(data.version) }
  },
  /** POST /processing-jobs — 202. Phạm vi lấy từ scope của dataset. */
  async createJob(dataset: DatasetDetail, input: { scopeIndex: number; mode: 'MOCK' | 'REAL'; preprocessingVersion: string; configVersion: string; modelVersionId: string }) {
    const scope = dataset.scope[input.scopeIndex]
    if (!scope) throw new Error('Chọn phạm vi dataset.')
    if (!input.preprocessingVersion.trim() || !input.configVersion.trim()) throw new Error('Cần preprocessingVersion và configVersion.')
    if (!GUID.test(input.modelVersionId.trim())) throw new Error('Cần mã phiên bản mô hình (GUID); BE bắt buộc modelVersionId.')
    const body = { datasetId: dataset.id, scope, mode: input.mode, modelVersionId: input.modelVersionId.trim(), preprocessingVersion: input.preprocessingVersion.trim(), configVersion: input.configVersion.trim() }
    return (await apiClient.post(`/processing-jobs`, body, { headers: { 'Idempotency-Key': crypto.randomUUID() } })).data
  },
  /** Gợi ý fixtureVersion và expectedGeometryVersion từ các lần chạy/phát hiện AI đã có của dự án (BE không có API riêng cho các giá trị này). */
  async aiRunHints(projectId: string, segmentSetId: string) {
    const { data: runs } = await apiClient.get<{ items?: { id: string; fixtureVersion?: string | null; status?: string | null }[] }>(`/projects/${projectId}/ai-mock-runs`)
    const fixtures = Array.from(new Set((runs?.items || []).map((r) => r.fixtureVersion).filter((v): v is string => !!v)))
    let geometryVersion = ''
    for (const r of (runs?.items || []).filter((x) => x.status === 'SUCCEEDED')) {
      const { data: res } = await apiClient.get<{ detections?: { detectionId: string }[] }>(`/projects/${projectId}/ai-mock-runs/${r.id}/result`)
      for (const d of res?.detections || []) {
        const { data: c } = await apiClient.get<{ segmentSetId?: string; geometryVersion?: string }>(`/projects/${projectId}/ai-candidates/${d.detectionId}`)
        if (c?.segmentSetId === segmentSetId && c.geometryVersion) { geometryVersion = c.geometryVersion; break }
      }
      if (geometryVersion) break
    }
    return { fixtures, geometryVersion }
  },
  /** POST /projects/{p}/ai-mock-runs — 202; dataset + phạm vi lấy từ bộ dữ liệu đã đọc. */
  async createAiRun(projectId: string, dataset: DatasetDetail, input: { scopeIndex: number; stage: 'VIDEO_ANALYSIS' | 'DUPLICATE_MATCHING'; modelVersionId: string; preprocessingVersion: string; configVersion: string; fixtureVersion: string; expectedGeometryVersion: string }) {
    const scope = dataset.scope[input.scopeIndex]
    if (!scope) throw new Error('Chọn phạm vi dataset.')
    if (!GUID.test(input.modelVersionId.trim())) throw new Error('Cần mã phiên bản mô hình (GUID).')
    if (!input.preprocessingVersion.trim() || !input.configVersion.trim() || !input.fixtureVersion.trim() || !input.expectedGeometryVersion.trim()) throw new Error('Cần nhập đủ phiên bản tiền xử lý, cấu hình, fixture và phiên bản hình học.')
    const body = { datasetId: dataset.id, scope, modelVersionId: input.modelVersionId.trim(), preprocessingVersion: input.preprocessingVersion.trim(), configVersion: input.configVersion.trim(), fixtureVersion: input.fixtureVersion.trim(), stage: input.stage, expectedGeometryVersion: input.expectedGeometryVersion.trim() }
    return (await apiClient.post(`/projects/${projectId}/ai-mock-runs`, body, { headers: { 'Idempotency-Key': crypto.randomUUID() } })).data as { id: string; status?: string }
  },
  /** POST /processing-jobs/{jobId}/retry — If-Match = version job. */
  async retryJob(jobId: string, reason: string) {
    if (!reason.trim()) throw new Error('Cần nhập lý do chạy lại.')
    const { job } = await this.job(jobId)
    return (await apiClient.post(`/processing-jobs/${job.id}/retry`, { reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(job.version) } })).data
  },
}
