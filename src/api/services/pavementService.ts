import { apiClient } from '../client'
import { alignmentService, type WidthProfileItem } from './alignmentService'
import { publishedSetForRoute, type SegmentSummary } from './segmentSetService'

export interface PavementLayoutInput {
  stripWidthMeters: number; slabLengthMeters: number; widthProfile: WidthProfileItem[]
  slabThicknessCentimeters?: number | null; contractionJointSpacingMeters?: number | null
  expansionJointSpacingMeters?: number | null; expansionJointGapMillimeters?: number | null
}
export interface PavementPlanInput { layout: PavementLayoutInput; displayToleranceMeters: number }
export interface AsBuiltSlabInput {
  key: string; plannedSequence?: number | null; footprint: Array<{ x: number; y: number }>
  lengthMeters?: number | null; widthMeters?: number | null; dimensionUnknownReason?: string | null
  source: string; sourceFileId?: string | null
}
export interface AsBuiltLayoutInput { sourcePlanId: string; slabs: AsBuiltSlabInput[]; reason: string }
export interface PavementLayoutView {
  id: string; projectId: string; routeVersionId: string; segmentSetId: string
  sourcePlanId?: string | null; crsProfileRevisionId?: string | null; kind: string; contentHash: string
  layout?: PavementLayoutInput | null
  geometry: {
    displayToleranceMeters: number
    plan?: { analyticLengthMeters: number; cells: Array<{ sequence: number; fromOffsetMeters: number; toOffsetMeters: number; fromLateralMeters: number; toLateralMeters: number }> } | null
    slabs: Array<Omit<AsBuiltSlabInput, 'source'> & { source?: string; provenanceStatus?: string }>
  }
}
export interface PavementPins { projectId: string; roadSectionId: string; routeVersionId: string; segmentSetId: string; lengthMeters: number }
export interface PavementLayoutSummary {
  layoutId: string; projectId: string; roadSectionId: string; routeVersionId: string; segmentSetId: string
  kind: 'PLANNED' | 'AS_BUILT'; sourcePlanId: string | null; createdAt: string; contentHash: string
}
export const pavementService = {
  async list(pins: PavementPins): Promise<PavementLayoutSummary[]> {
    const all: PavementLayoutSummary[] = [], seen = new Set<string>()
    let cursor: string | undefined
    do {
      const {data} = await apiClient.get(`/projects/${pins.projectId}/road-sections/${pins.roadSectionId}/versions/${pins.routeVersionId}/segment-sets/${pins.segmentSetId}/pavement-layouts`, {params: {pageSize: 100, cursor}})
      if (!Array.isArray(data?.items) || !(data.nextCursor === null || typeof data.nextCursor === 'string' && !!data.nextCursor)) throw new Error('Danh sách layout sai contract/phân trang.')
      for (const row of data.items as PavementLayoutSummary[]) {
        if (!row.layoutId || row.projectId !== pins.projectId || row.roadSectionId !== pins.roadSectionId || row.routeVersionId !== pins.routeVersionId || row.segmentSetId !== pins.segmentSetId || !['PLANNED','AS_BUILT'].includes(row.kind) || !Number.isFinite(Date.parse(row.createdAt)) || !/^[a-f0-9]{64}$/i.test(row.contentHash) || !(row.sourcePlanId === null || typeof row.sourcePlanId === 'string' && !!row.sourcePlanId) || all.some(item => item.layoutId === row.layoutId)) throw new Error('Layout summary sai reference/metadata hoặc trùng ID.')
        all.push(row)
      }
      cursor = data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor layout bị lặp; chưa đọc đầy đủ danh sách.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return all
  },
  async discover(projectId: string, sectionId?: string, routeId?: string, setId?: string): Promise<PavementPins> {
    const context = await alignmentService.readProjectContext(projectId)
    if ((context as typeof context & { status?: string }).status !== 'ACTIVE') throw new Error('Project server chưa có trạng thái ACTIVE; chưa tạo pavement plan.')
    const roads = context.roadSections.filter(road => !sectionId || road.roadSectionId === sectionId)
    if (roads.length !== 1) throw new Error('Cần đúng một tuyến trong context server để lưu cấu hình tấm/khe.')
    const road = roads[0], version = routeId || road.currentVersionId
    const route = await alignmentService.readConfirmedGeometry(projectId, road.roadSectionId, version)
    if (route.projectId !== projectId || route.roadSectionId !== road.roadSectionId || route.routeVersionId !== version || !(route.lengthMeters > 0)) throw new Error('Route version trả sai phạm vi hoặc thiếu lengthMeters.')
    const base = `/projects/${projectId}/road-sections/${road.roadSectionId}/versions/${version}/segment-sets`
    const sets: SegmentSummary[] = [], seen = new Set<string>()
    let cursor: string | undefined
    do {
      const response = await apiClient.get(base, { params: { pageSize: 100, cursor } })
      if (!Array.isArray(response.data?.items)) throw new Error('Danh sách segment set trả sai contract.')
      sets.push(...response.data.items); cursor = response.data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor segment set bị lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    const published = publishedSetForRoute(sets, version)
    if (!published) throw new Error(`PM chưa công bố phân đoạn: route ${version}, ${sets.length} set, 0 set PUBLISHED. Chưa lưu tấm/khe.`)
    if (setId && setId !== published.id) throw new Error(`Reference segment set ${setId} không khớp PUBLISHED ${published.id} của route ${version}; chưa lưu tấm/khe.`)
    const set = (await apiClient.get(`${base}/${published.id}`)).data
    if (set.id !== published.id || set.routeVersionId !== version || set.status !== 'PUBLISHED') throw new Error('Segment set đã thay đổi hoặc không đúng phạm vi.')
    return { projectId, roadSectionId: road.roadSectionId, routeVersionId: version, segmentSetId: set.id, lengthMeters: route.lengthMeters }
  },
  async layoutRoute(projectId: string, layout: PavementLayoutView, sectionId?: string, routeId?: string, setId?: string) {
    if (layout.projectId !== projectId || routeId && routeId !== layout.routeVersionId || setId && setId !== layout.segmentSetId) throw new Error('Layout không khớp project/routeVersionId/segmentSetId đang mở.')
    const context = await alignmentService.readProjectContext(projectId)
    const roads = context.roadSections.filter(road => sectionId ? road.roadSectionId === sectionId : road.currentVersionId === layout.routeVersionId)
    if (roads.length !== 1) throw new Error('Cần roadSectionId server để đối chiếu route của layout; không dùng tuyến draft khác.')
    const route = await alignmentService.readConfirmedGeometry(projectId, roads[0].roadSectionId, layout.routeVersionId)
    if (route.projectId !== projectId || route.roadSectionId !== roads[0].roadSectionId || route.routeVersionId !== layout.routeVersionId) throw new Error('Geometry route của layout sai scope.')
    const set = (await apiClient.get(`/projects/${projectId}/road-sections/${roads[0].roadSectionId}/versions/${layout.routeVersionId}/segment-sets/${layout.segmentSetId}`)).data
    if (set.id !== layout.segmentSetId || set.routeVersionId !== layout.routeVersionId) throw new Error('Layout segment set không thuộc route server.')
    return route
  },
  async create(pins: PavementPins, input: PavementPlanInput, key: string): Promise<PavementLayoutView> {
    return (await apiClient.post(`/projects/${pins.projectId}/route-versions/${pins.routeVersionId}/segment-sets/${pins.segmentSetId}/pavement-plans`, input, { headers: { 'Idempotency-Key': key } })).data
  },
  async createAsBuilt(projectId: string, input: AsBuiltLayoutInput, sourceHash: string, key: string): Promise<PavementLayoutView> {
    if (!/^[a-f0-9]{64}$/i.test(sourceHash)) throw new Error('Thiếu contentHash PLANNED nguồn hợp lệ.')
    return (await apiClient.post(`/projects/${projectId}/pavement-layouts/as-built`, input, { headers: { 'Idempotency-Key': key, 'If-Match': `"${sourceHash}"` } })).data
  },
  async read(projectId: string, layoutId: string): Promise<PavementLayoutView> {
    const value = (await apiClient.get(`/projects/${projectId}/pavement-layouts/${layoutId}`)).data
    if (value?.id !== layoutId || value.projectId !== projectId || !value.routeVersionId || !value.segmentSetId || !value.geometry || !Array.isArray(value.geometry.slabs)) throw new Error('Pavement layout trả sai project/ID hoặc thiếu geometry server.')
    if (value.layout != null) {
      const input = value.layout
      if (typeof input.stripWidthMeters !== 'number' || !Number.isFinite(input.stripWidthMeters) || !(input.stripWidthMeters > 0) || typeof input.slabLengthMeters !== 'number' || !Number.isFinite(input.slabLengthMeters) || !(input.slabLengthMeters > 0) || !Array.isArray(input.widthProfile) || !input.widthProfile.length ||
        !input.widthProfile.every((w: WidthProfileItem) => [w.fromOffsetMeters, w.toOffsetMeters, w.widthMeters].every(Number.isFinite))) throw new Error('response.layout thiếu kích thước hoặc widthProfile hợp lệ; không nạp mặc định.')
      for (const field of ['slabThicknessCentimeters', 'contractionJointSpacingMeters', 'expansionJointSpacingMeters', 'expansionJointGapMillimeters']) {
        const n = input[field]
        if (n != null && (typeof n !== 'number' || !Number.isFinite(n) || (field === 'expansionJointGapMillimeters' ? n < 0 : n <= 0))) throw new Error(`response.layout.${field} chưa hợp lệ.`)
      }
    }
    return value
  },
  async readConfiguration(projectId: string, layoutId: string) {
    const snapshot = await this.read(projectId, layoutId)
    if (snapshot.layout != null) return { snapshot, configuration: snapshot }
    if (snapshot.kind === 'AS_BUILT' && snapshot.sourcePlanId) {
      if (snapshot.sourcePlanId === snapshot.id) throw new Error('sourcePlanId tự tham chiếu.')
      const source = await this.read(projectId, snapshot.sourcePlanId)
      if (source.kind !== 'PLANNED' || source.routeVersionId !== snapshot.routeVersionId || source.segmentSetId !== snapshot.segmentSetId || !source.layout) throw new Error('sourcePlanId không trả đúng cấu hình PLANNED nguồn.')
      return { snapshot, configuration: source }
    }
    return { snapshot, configuration: null }
  }
}
