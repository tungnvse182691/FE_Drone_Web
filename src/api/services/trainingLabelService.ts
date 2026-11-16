import { apiClient } from '../client'
import { validationService } from './candidate3ValidationService'

// PM gán nhãn huấn luyện AI trên khung hình do AI phát hiện (BE: chỉ PM; nguồn AI_DETECTION; bbox chuẩn hóa 0..1).
export interface LabelBox { x: number; y: number; width: number; height: number }
export interface TrainingLabel {
  id: string; projectId: string; revision: number; status: string; sourceKind: string; sourceId: string; sourceVersion: string
  fileId: string; fileVersion?: string; annotation: LabelBox & { kind: string; coordinateSpace: string }
  defectTypeCode: string; reviewedBy?: string | null; reviewedAt?: string | null; reviewReason?: string | null; version: string
}
export interface AiDetection { detectionId: string; runId: string; frameFileId: string; typeCode: string; confidence?: number; timestampMs?: number; box: LabelBox }

const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const validBox = (b: LabelBox) => [b.x, b.y, b.width, b.height].every(Number.isFinite) && b.x >= 0 && b.y >= 0 && b.width > 0 && b.height > 0 && b.x + b.width <= 1 && b.y + b.height <= 1
const annotation = (b: LabelBox) => ({ kind: 'BBOX', coordinateSpace: 'NORMALIZED', ...b })

export const trainingLabelService = {
  /** GET /projects/{p}/labels (phân trang bằng nextCursor). */
  async list(projectId: string): Promise<TrainingLabel[]> {
    const rows: TrainingLabel[] = []
    let cursor: string | undefined
    for (let i = 0; i < 20; i++) {
      const { data } = await apiClient.get<{ items?: TrainingLabel[]; nextCursor?: string | null }>(`/projects/${projectId}/labels`, { params: { pageSize: 50, cursor } })
      if (!Array.isArray(data?.items)) throw new Error('Danh sách nhãn sai contract.')
      rows.push(...data.items)
      cursor = data.nextCursor || undefined
      if (!cursor) break
    }
    return rows
  },
  /** GET /projects/{p}/labels/{id}. */
  async read(projectId: string, labelId: string): Promise<TrainingLabel> {
    const { data } = await apiClient.get<TrainingLabel>(`/projects/${projectId}/labels/${labelId}`)
    if (data?.id !== labelId || !data.version) throw new Error('BE trả nhãn sai ID/version.')
    return data
  },
  /** Các phát hiện AI của dự án: ai-mock-runs → result.detections (bbox [x,y,w,h] chuẩn hóa). */
  async detections(projectId: string): Promise<AiDetection[]> {
    const runs = await validationService.getAiMockRuns(projectId)
    const out: AiDetection[] = []
    for (const run of runs.filter((r) => r.status === 'SUCCEEDED')) {
      const result = await validationService.getAiMockRunResult(projectId, run.id)
      for (const d of (result.detections || []) as { detectionId: string; frameFileId: string; typeCode: string; confidence?: number; timestampMs?: number; bbox?: number[] }[]) {
        if (!d.detectionId || !d.frameFileId || !Array.isArray(d.bbox) || d.bbox.length !== 4) continue
        out.push({ detectionId: d.detectionId, runId: run.id, frameFileId: d.frameFileId, typeCode: d.typeCode, confidence: d.confidence, timestampMs: d.timestampMs, box: { x: d.bbox[0], y: d.bbox[1], width: d.bbox[2], height: d.bbox[3] } })
      }
    }
    return out
  },
  /** POST /projects/{p}/labels — sourceVersion/fileId lấy từ GET ai-candidates/{detectionId} (BE kiểm candidate_stale). */
  async create(projectId: string, detectionId: string, box: LabelBox, defectTypeCode: string, reason: string) {
    if (!validBox(box)) throw new Error('Khung chọn phải nằm trong ảnh (0..1, rộng/cao > 0).')
    if (!defectTypeCode.trim() || !reason.trim()) throw new Error('Cần nhập mã loại khiếm khuyết và lý do.')
    const { data: cand } = await apiClient.get<{ detectionId: string; sourceVersion: string; frameFileId: string }>(`/projects/${projectId}/ai-candidates/${detectionId}`)
    if (cand?.detectionId !== detectionId || !cand.sourceVersion || !cand.frameFileId) throw new Error('BE trả candidate AI sai contract.')
    return (await apiClient.post<TrainingLabel>(`/projects/${projectId}/labels`, {
      sourceKind: 'AI_DETECTION', sourceId: detectionId, sourceVersion: cand.sourceVersion, fileId: cand.frameFileId,
      annotation: annotation(box), defectTypeCode: defectTypeCode.trim(), reason: reason.trim(),
    }, { headers: { 'Idempotency-Key': crypto.randomUUID() } })).data
  },
  /** POST /projects/{p}/labels/{id}/revisions — If-Match = version nhãn mới nhất. */
  async revise(projectId: string, labelId: string, box: LabelBox, defectTypeCode: string, reason: string) {
    if (!validBox(box)) throw new Error('Khung chọn phải nằm trong ảnh (0..1, rộng/cao > 0).')
    if (!defectTypeCode.trim() || !reason.trim()) throw new Error('Cần nhập mã loại khiếm khuyết và lý do.')
    const label = await this.read(projectId, labelId)
    return (await apiClient.post<TrainingLabel>(`/projects/${projectId}/labels/${labelId}/revisions`, {
      fileId: label.fileId, annotation: annotation(box), defectTypeCode: defectTypeCode.trim(), reason: reason.trim(),
    }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(label.version) } })).data
  },
  /** POST /labels/{id}/review — APPROVE | REJECT, If-Match = version nhãn mới nhất. */
  async review(projectId: string, labelId: string, decision: 'APPROVE' | 'REJECT', reason: string) {
    if (!reason.trim()) throw new Error('Cần nhập lý do duyệt/từ chối.')
    const label = await this.read(projectId, labelId)
    return (await apiClient.post<TrainingLabel>(`/labels/${labelId}/review`, { decision, reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(label.version) } })).data
  },
  /** GET /files/{id}/content — ảnh khung hình để xem khi vẽ nhãn (Bearer dev, xem devFileBearer). */
  async frameUrl(fileId: string): Promise<string> {
    const { data } = await apiClient.get<Blob>(`/files/${fileId}/content`, { responseType: 'blob' })
    return URL.createObjectURL(data)
  },
}
