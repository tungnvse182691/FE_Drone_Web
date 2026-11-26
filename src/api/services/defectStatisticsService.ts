import { apiClient } from '../client'

// PM xác nhận thống kê khiếm khuyết (shared part + số lượng đo) — spec PM-12, BE: POST ghi chỉ PM.
export interface StatsScope { obligationId: string; defectId: string; defectVersion: string; scopeHash: string; roadSectionId: string; routeVersionId: string; from: number; to: number; offsetFrom: number; offsetTo: number }
export interface StatsSegment { id: string; routeVersionId: string; segmentSetId: string; version: string }
export interface StatsMeasurement { id: string; defectId: string; routeVersionId: string; type: string; value?: number | null; valueState: string; unit?: string | null; version: string; unknownReason?: string | null }
export interface StatsSource { id: string; defectId: string; obligationId: string; sharedPartId: string; provenance: string; reason?: string; confirmedAtUtc?: string; supersedesId?: string | null }
export interface DefectStatisticsView {
  scopes: StatsScope[]; segments: StatsSegment[]; measurements: StatsMeasurement[]; history: StatsSource[]; version: string
  statistics: { projectDistinctDefects: number; matchedDistinctDefects: number; sharedParts: number; unmappedDefects: number; missingReasons: string[] }
}
export interface ConfirmInput { scope: StatsScope; sharedPartId: string; segmentIds: string[]; measurementIds: string[]; provenance: 'TEST_ONLY' | 'REAL_SOURCE'; reason: string }

const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const defectStatisticsService = {
  /** GET /projects/{p}/defect-statistics — ETag (64 hex) dùng cho If-Match khi xác nhận. */
  async read(projectId: string): Promise<DefectStatisticsView> {
    const { data, headers } = await apiClient.get<DefectStatisticsView>(`/projects/${projectId}/defect-statistics`)
    if (!Array.isArray(data?.scopes) || !Array.isArray(data.measurements) || !data.statistics) throw new Error('BE trả thống kê khiếm khuyết sai contract.')
    const etag = String(headers.etag || '').replace(/"/g, '')
    return { ...data, version: etag || data.version }
  },
  /** POST /projects/{p}/defect-statistics — ghim các phép đo vào một shared part. */
  async confirm(projectId: string, view: DefectStatisticsView, input: ConfirmInput) {
    if (!GUID.test(input.sharedPartId.trim())) throw new Error('Mã shared part phải là GUID.')
    if (!input.segmentIds.length) throw new Error('Chọn ít nhất một phân đoạn.')
    if (!input.reason.trim()) throw new Error('Cần nhập lý do.')
    const quantities = input.measurementIds.map((id) => {
      const m = view.measurements.find((x) => x.id === id)
      if (!m) throw new Error('Phép đo không còn trong dữ liệu BE.')
      return { measurementId: id, sourceVersion: m.version, segmentId: input.segmentIds[0] }
    })
    const body = {
      obligationId: input.scope.obligationId, scopeHash: input.scope.scopeHash, defectVersion: input.scope.defectVersion,
      sharedPartId: input.sharedPartId.trim(), segmentIds: input.segmentIds, quantities, provenance: input.provenance, reason: input.reason.trim(),
    }
    return (await apiClient.post(`/projects/${projectId}/defect-statistics`, body, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': `"${view.version}"` } })).data
  },
}
