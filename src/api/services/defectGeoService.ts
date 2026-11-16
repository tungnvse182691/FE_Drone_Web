import { apiClient } from '../client'
import { alignmentService, utm48NToWgs84 } from './alignmentService'

export type LngLat = [number, number]

export interface SegmentGeo {
  sequence: number
  coords: LngLat[]
  /** Điểm giữa (theo chiều dài) của phân đoạn - vị trí đại diện của phân đoạn do BE công bố */
  mid: LngLat
}

export interface ProjectGeo {
  /** Tim tuyến WGS84 [lng, lat] ghép từ các phân đoạn đã công bố */
  corridor: LngLat[]
  segments: Record<string, SegmentGeo>
}

interface RawSegment {
  id: string
  sequence?: number
  startStationMeters?: number
  wgs84Geometry?: { coordinates?: LngLat[] } | null
  metricGeometry?: { coordinates?: LngLat[] } | null
}

function toWgs84(coords: LngLat[] | undefined, utm: boolean): LngLat[] {
  if (!Array.isArray(coords)) return []
  return utm ? coords.map(([x, y]) => utm48NToWgs84(x, y)) : coords
}

function lineMidpoint(coords: LngLat[]): LngLat {
  if (coords.length === 1) return coords[0]
  const lens: number[] = []
  let total = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const d = Math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1])
    lens.push(d)
    total += d
  }
  let rest = total / 2
  for (let i = 0; i < lens.length; i++) {
    if (rest <= lens[i] || i === lens.length - 1) {
      const t = lens[i] === 0 ? 0 : rest / lens[i]
      return [
        coords[i][0] + t * (coords[i + 1][0] - coords[i][0]),
        coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
      ]
    }
    rest -= lens[i]
  }
  return coords[0]
}

const cache = new Map<string, Promise<ProjectGeo | null>>()

async function load(projectId: string, routeVersionId: string, segmentSetId?: string | null): Promise<ProjectGeo | null> {
  let setId = segmentSetId || ''
  if (!setId) {
    // Defect chỉ biết roadSectionVersionId: tìm tuyến hiện hành rồi lấy segment-set đã PUBLISHED từ BE
    const ctx = await alignmentService.readProjectContext(projectId)
    const section = ctx.roadSections.find((s) => s.currentVersionId === routeVersionId)
    if (!section) return null
    const list = await apiClient.get<{ items?: Array<{ id: string; status?: string }> }>(
      `/projects/${projectId}/road-sections/${section.roadSectionId}/versions/${routeVersionId}/segment-sets`
    )
    setId = (list.data?.items || []).find((i) => i.status === 'PUBLISHED')?.id || ''
    if (!setId) return null
  }

  let pkg: any
  try {
    const res = await apiClient.get(`/projects/${projectId}/geometry-package`, {
      params: { routeVersionId, segmentSetId: setId }
    })
    pkg = res.data
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 400 || status === 404) return null
    throw err
  }

  const utm = pkg?.route?.engineeringSrid === 32648
  const raw: RawSegment[] = Array.isArray(pkg?.segmentSet?.segments) ? pkg.segmentSet.segments : []
  const segments: Record<string, SegmentGeo> = {}
  const ordered: SegmentGeo[] = []
  for (const s of raw) {
    const coords = s.wgs84Geometry?.coordinates?.length
      ? s.wgs84Geometry.coordinates
      : toWgs84(s.metricGeometry?.coordinates, utm)
    if (coords.length < 2) continue
    const geo: SegmentGeo = { sequence: s.sequence ?? 0, coords, mid: lineMidpoint(coords) }
    segments[s.id] = geo
    ordered.push(geo)
  }
  ordered.sort((a, b) => a.sequence - b.sequence)

  let corridor: LngLat[] = []
  for (const g of ordered) {
    for (const p of g.coords) {
      const last = corridor[corridor.length - 1]
      if (!last || last[0] !== p[0] || last[1] !== p[1]) corridor.push(p)
    }
  }
  if (corridor.length < 2) {
    corridor = pkg?.route?.wgs84Centerline?.coordinates?.length
      ? pkg.route.wgs84Centerline.coordinates
      : toWgs84(pkg?.route?.metricCenterline?.coordinates, utm)
  }
  if (corridor.length < 2) return null
  return { corridor, segments }
}

/**
 * Tọa độ hành lang tuyến và phân đoạn WGS84 lấy từ BE (GET /projects/{p}/geometry-package).
 * Trả null khi BE chưa có hình học đã công bố; ném lỗi khi API lỗi.
 */
export function fetchProjectGeo(
  projectId?: string | null,
  routeVersionId?: string | null,
  segmentSetId?: string | null
): Promise<ProjectGeo | null> {
  if (!projectId || !routeVersionId) return Promise.resolve(null)
  const key = `${projectId}|${routeVersionId}|${segmentSetId || ''}`
  let p = cache.get(key)
  if (!p) {
    p = load(projectId, routeVersionId, segmentSetId)
    p.catch(() => cache.delete(key))
    cache.set(key, p)
  }
  return p
}

export function geoErrorMessage(err: any): string {
  return (
    err?.response?.data?.detail || err?.response?.data?.title || err?.message || 'Không tải được hình học tuyến từ máy chủ'
  )
}
