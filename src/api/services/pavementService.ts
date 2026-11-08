import { apiClient } from '../client'
import { alignmentService, type WidthProfileItem } from './alignmentService'

export interface PavementLayoutInput {
  stripWidthMeters: number; slabLengthMeters: number; widthProfile: WidthProfileItem[]
  slabThicknessCentimeters?: number | null; contractionJointSpacingMeters?: number | null
  expansionJointSpacingMeters?: number | null; expansionJointGapMillimeters?: number | null
}
export interface PavementPlanInput { layout: PavementLayoutInput; displayToleranceMeters: number }
export interface PavementLayoutView {
  id: string; projectId: string; routeVersionId: string; segmentSetId: string
  sourcePlanId?: string | null; crsProfileRevisionId?: string | null; kind: string; contentHash: string
  layout?: PavementLayoutInput | null
  geometry: {
    displayToleranceMeters: number
    plan?: { analyticLengthMeters: number; cells: Array<{ sequence: number; fromOffsetMeters: number; toOffsetMeters: number; fromLateralMeters: number; toLateralMeters: number }> } | null
    slabs: Array<{ key: string; plannedSequence?: number | null; lengthMeters?: number | null; widthMeters?: number | null; footprint: Array<{ x: number; y: number }> }>
  }
}
export interface PavementPins { projectId: string; roadSectionId: string; routeVersionId: string; segmentSetId: string; lengthMeters: number }
export const pavementService = {
  async discover(projectId: string, sectionId?: string, routeId?: string, setId?: string): Promise<PavementPins> {
    const context = await alignmentService.readProjectContext(projectId)
    if ((context as typeof context & { status?: string }).status !== 'ACTIVE') throw new Error('Project server chưa có trạng thái ACTIVE; chưa tạo pavement plan.')
    const roads = context.roadSections.filter(road => !sectionId || road.roadSectionId === sectionId)
    if (roads.length !== 1) throw new Error('Cần đúng một tuyến trong context server để lưu cấu hình tấm/khe.')
    const road = roads[0], version = routeId || road.currentVersionId
    const route = await alignmentService.readConfirmedGeometry(projectId, road.roadSectionId, version)
    if (route.projectId !== projectId || route.roadSectionId !== road.roadSectionId || route.routeVersionId !== version || !(route.lengthMeters > 0)) throw new Error('Route version trả sai phạm vi hoặc thiếu lengthMeters.')
    const base = `/projects/${projectId}/road-sections/${road.roadSectionId}/versions/${version}/segment-sets`
    const sets: Array<{ id: string; routeVersionId: string; status: string }> = [], seen = new Set<string>()
    let cursor: string | undefined
    do {
      const response = await apiClient.get(base, { params: { pageSize: 100, cursor } })
      if (!Array.isArray(response.data?.items)) throw new Error('Danh sách segment set trả sai contract.')
      sets.push(...response.data.items); cursor = response.data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor segment set bị lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    if (sets.some(set => set.routeVersionId !== version)) throw new Error('Segment set không thuộc route version đã đọc.')
    const published = sets.filter(set => set.status === 'PUBLISHED' && (!setId || set.id === setId))
    if (published.length !== 1) throw new Error(`Route ${version}: cần đúng một segment set PUBLISHED từ server; hiện ${sets.length} set, ${published.length} set phù hợp. Chưa lưu tấm/khe.`)
    const set = (await apiClient.get(`${base}/${published[0].id}`)).data
    if (set.id !== published[0].id || set.routeVersionId !== version || set.status !== 'PUBLISHED') throw new Error('Segment set đã thay đổi hoặc không đúng phạm vi.')
    return { projectId, roadSectionId: road.roadSectionId, routeVersionId: version, segmentSetId: set.id, lengthMeters: route.lengthMeters }
  },
  async create(pins: PavementPins, input: PavementPlanInput, key: string): Promise<PavementLayoutView> {
    return (await apiClient.post(`/projects/${pins.projectId}/route-versions/${pins.routeVersionId}/segment-sets/${pins.segmentSetId}/pavement-plans`, input, { headers: { 'Idempotency-Key': key } })).data
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
