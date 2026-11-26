import { apiClient } from '../client'
export interface TriageRouteReference { roadSectionId: string; currentVersionId: string; code: string; name?: string | null }
export interface TriagePublishedSet { id: string; routeVersionId: string; status: string }
export interface TriageGeometryPins { routeVersionId: string; segmentSetId: string; geometryVersion: string }
export const triageGeometryService = {
  async routes(projectId: string, signal?: AbortSignal): Promise<TriageRouteReference[]> {
    const {data} = await apiClient.get(`/projects/${projectId}/work-package`, {signal})
    if (data?.projectId !== projectId || !Array.isArray(data.roadSections)) throw new Error('Work-package sai project hoặc thiếu danh sách tuyến.')
    const routes = data.roadSections.filter((r: TriageRouteReference) => !!r.currentVersionId) as TriageRouteReference[]
    if (routes.some((r, i) => !r.roadSectionId || typeof r.currentVersionId !== 'string' || routes.findIndex(other => other.roadSectionId === r.roadSectionId) !== i)) throw new Error('Reference tuyến hiện hành thiếu ID hoặc bị trùng.')
    return routes
  },
  async sets(projectId: string, road: TriageRouteReference, signal?: AbortSignal): Promise<TriagePublishedSet[]> {
    const rows: TriagePublishedSet[] = [], cursors = new Set<string>(); let cursor: string | undefined
    do {
      const {data} = await apiClient.get(`/projects/${projectId}/road-sections/${road.roadSectionId}/versions/${road.currentVersionId}/segment-sets`, {params: {pageSize: 100, cursor}, signal})
      if (!Array.isArray(data?.items) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor)) throw new Error('Danh sách bộ phân đoạn sai contract.')
      for (const row of data.items as TriagePublishedSet[]) {
        if (!row.id || row.routeVersionId !== road.currentVersionId || !['DRAFT','PUBLISHED','SUPERSEDED'].includes(row.status) || rows.some(r => r.id === row.id)) throw new Error('Bộ phân đoạn sai phiên bản tuyến hoặc trùng reference.')
        rows.push(row)
      }
      cursor = data.nextCursor || undefined
      if (cursor && cursors.has(cursor)) throw new Error('Cursor phân đoạn lặp.')
      if (cursor) cursors.add(cursor)
    } while (cursor)
    return rows.filter(r => r.status === 'PUBLISHED')
  },
  async package(projectId: string, road: TriageRouteReference, setId: string, signal?: AbortSignal) {
    const response = await apiClient.get(`/projects/${projectId}/geometry-package`, {params: {routeVersionId: road.currentVersionId, segmentSetId: setId}, signal})
    const p = response.data
    if (p?.projectId !== projectId || p.route?.projectId !== projectId || p.route.roadSectionId !== road.roadSectionId || p.route.routeVersionId !== road.currentVersionId || p.route.isCurrent !== true || p.segmentSet?.id !== setId || p.segmentSet.routeVersionId !== road.currentVersionId || p.segmentSet.status !== 'PUBLISHED') throw new Error('Geometry-package sai project/tuyến/phiên bản hoặc bộ chưa công bố.')
    if (p.route.metadataStatus !== 'COMPLETE' || p.segmentSet.metadataStatus !== 'COMPLETE') throw new Error('Geometry-package thiếu metadata COMPLETE của tuyến hoặc bộ phân đoạn; phạm vi chưa sẵn sàng.')
    const packageEtag = response.headers?.etag
    if (typeof packageEtag !== 'string' || !/^"[a-f0-9]{64}"$/i.test(packageEtag)) throw new Error('Geometry-package thiếu ETag content-hash hợp lệ.')
    // Handoff BE 4b46a6a: package ETag wraps result.Version; producer expects the raw value.
    return {packageEtag, routeVersionId: road.currentVersionId, segmentSetId: setId, geometryVersion: packageEtag.slice(1, -1)}
  }
}
