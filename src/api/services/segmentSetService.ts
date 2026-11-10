import { apiClient } from '../client'

export interface SegmentPins { projectId: string; roadSectionId: string; routeVersionId: string }
export interface SegmentDefinition { targetLengthMeters: number; remainderMode: 'KEEP' | 'MERGE_PREVIOUS'; boundariesMeters?: number[] | null }
export interface SegmentGeometry {
  id: string | null; sequence: number; fromOffsetMeters: number; toOffsetMeters: number
  startStationMeters: number; endStationMeters: number; lengthMeters: number
  metricGeometry: { type: string; coordinates: [number, number][] }; wgs84Geometry?: { type: string; coordinates: [number, number][] } | null
  missingMetadata?: string[]
}
export interface SegmentPreview { routeVersionId: string; totalLengthMeters: number; boundariesMeters: number[]; segments: SegmentGeometry[]; definitionHash: string }
export interface SegmentSummary { id: string; routeVersionId: string; status: string; version: string }
export function publishedSetForRoute(sets: SegmentSummary[], routeVersionId: string): SegmentSummary | null {
  if (sets.some(set => !set.id || set.routeVersionId !== routeVersionId || !['DRAFT', 'PUBLISHED', 'SUPERSEDED'].includes(set.status))) throw new Error('Segment set không thuộc route version hoặc sai contract.')
  if (new Set(sets.map(set => set.id)).size !== sets.length) throw new Error('Danh sách segment set trùng ID.')
  const published = sets.filter(set => set.status === 'PUBLISHED')
  if (published.length > 1) throw new Error('Dữ liệu bất thường: nhiều segment set PUBLISHED trên cùng route version.')
  return published[0] || null
}
export interface ServerSegmentSet extends SegmentSummary {
  definition: SegmentDefinition | null; geometryHash: string | null; segments: SegmentGeometry[]
  metadataStatus: string; missingMetadata: string[]; publishedBy?: string | null; publishedAt?: string | null
}
export const segmentBase = (pins: SegmentPins) => `/projects/${pins.projectId}/road-sections/${pins.roadSectionId}/versions/${pins.routeVersionId}/segment-sets`
export const validSetEtag = (value: string) => /^"[A-Za-z0-9+/]+={0,2}"$/.test(value)
export function sameDefinition(a: SegmentDefinition | null, b: SegmentDefinition): boolean {
  return !!a && a.targetLengthMeters === b.targetLengthMeters && a.remainderMode === b.remainderMode && JSON.stringify(a.boundariesMeters ?? null) === JSON.stringify(b.boundariesMeters ?? null)
}
export function verifySegments(segments: SegmentGeometry[], requireIds: boolean): void {
  if (!Array.isArray(segments) || !segments.length) throw new Error('Máy chủ chưa trả hình học phân đoạn.')
  let end = 0
  const ids = new Set<string>()
  for (const [index, s] of segments.entries()) {
    if (s.sequence !== index + 1 || ![s.fromOffsetMeters, s.toOffsetMeters, s.startStationMeters, s.endStationMeters, s.lengthMeters].every(Number.isFinite) || s.fromOffsetMeters !== end || !(s.toOffsetMeters > end) || !(s.lengthMeters > 0) || Math.abs(s.lengthMeters - (s.toOffsetMeters - s.fromOffsetMeters)) > 1e-12 * Math.max(1, s.lengthMeters) || s.metricGeometry?.type !== 'LineString' || !Array.isArray(s.metricGeometry.coordinates) || s.metricGeometry.coordinates.length < 2 || s.metricGeometry.coordinates.some(p => p.length !== 2 || !p.every(Number.isFinite)) || s.missingMetadata?.length) throw new Error('Phân đoạn server thiếu metadata/geometry hoặc sai thứ tự/phạm vi.')
    if (requireIds && (!s.id || ids.has(s.id))) throw new Error('Phân đoạn server thiếu hoặc trùng ID.')
    if (s.id) ids.add(s.id)
    end = s.toOffsetMeters
  }
}
export const segmentSetService = {
  async list(pins: SegmentPins): Promise<SegmentSummary[]> {
    const all: SegmentSummary[] = [], seen = new Set<string>()
    let cursor: string | undefined
    do {
      const { data } = await apiClient.get(segmentBase(pins), { params: { pageSize: 100, cursor } })
      if (!Array.isArray(data?.items) || data.items.some((s: SegmentSummary) => !s.id || s.routeVersionId !== pins.routeVersionId || !['DRAFT', 'PUBLISHED', 'SUPERSEDED'].includes(s.status))) throw new Error('Danh sách segment set sai contract/phạm vi.')
      all.push(...data.items); cursor = data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor segment set lặp; chưa đọc đầy đủ danh sách.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    if (new Set(all.map(s => s.id)).size !== all.length) throw new Error('Danh sách segment set trùng ID.')
    return all
  },
  async read(pins: SegmentPins, setId: string) {
    const response = await apiClient.get<ServerSegmentSet>(`${segmentBase(pins)}/${setId}`), value = response.data
    const etag = response.headers.etag || (value?.version ? `"${value.version}"` : '')
    if (value?.id !== setId || value.routeVersionId !== pins.routeVersionId || !['DRAFT', 'PUBLISHED', 'SUPERSEDED'].includes(value.status) || !validSetEtag(etag) || etag !== `"${value.version}"`) throw new Error('Segment set trả sai ID/route/version/ETag.')
    if (value.metadataStatus !== 'COMPLETE' || value.missingMetadata?.length || !value.definition || !value.geometryHash) throw new Error('Segment set chưa có metadata COMPLETE từ server.')
    verifySegments(value.segments, true)
    if (!Number.isFinite(value.definition.targetLengthMeters) || value.definition.targetLengthMeters <= 0 || !['KEEP', 'MERGE_PREVIOUS'].includes(value.definition.remainderMode)) throw new Error('Định nghĩa phân đoạn server thiếu cự ly/remainderMode hợp lệ.')
    return { data: value, etag }
  },
  async preview(pins: SegmentPins, input: SegmentDefinition): Promise<SegmentPreview> {
    const { data } = await apiClient.post<SegmentPreview>(`${segmentBase(pins)}/preview`, input, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
    if (data?.routeVersionId !== pins.routeVersionId || !(data.totalLengthMeters > 0) || !data.definitionHash || !Array.isArray(data.boundariesMeters)) throw new Error('Preview phân đoạn sai route/phạm vi.')
    verifySegments(data.segments, false)
    if (data.boundariesMeters.length !== data.segments.length + 1 || data.boundariesMeters[0] !== 0 || data.boundariesMeters.at(-1) !== data.totalLengthMeters || data.segments.some((s, i) => s.fromOffsetMeters !== data.boundariesMeters[i] || s.toOffsetMeters !== data.boundariesMeters[i + 1])) throw new Error('Preview boundaries không khớp geometry server.')
    return data
  },
  async write(pins: SegmentPins, setId: string | null, input: SegmentDefinition, key: string, etag?: string): Promise<ServerSegmentSet> {
    const headers = { 'Idempotency-Key': key, ...(etag ? { 'If-Match': etag } : {}) }
    return (setId ? await apiClient.put<ServerSegmentSet>(`${segmentBase(pins)}/${setId}`, input, { headers }) : await apiClient.post<ServerSegmentSet>(segmentBase(pins), input, { headers })).data
  },
  async publish(pins: SegmentPins, setId: string, input: { expectedPublishedSetId: string | null; reason: string }, key: string, etag: string): Promise<ServerSegmentSet> {
    return (await apiClient.post<ServerSegmentSet>(`${segmentBase(pins)}/${setId}/publish`, input, { headers: { 'Idempotency-Key': key, 'If-Match': etag } })).data
  }
}
