import type { RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { previewCenterlineCoordinates } from './alignmentImportHelpers'

type Route = RoadGeometryVersionView & { crsProfileRevisionId?: string | null; routeSystemId?: string | null; chainageCalibration?: unknown }
const line = (shape: Route['metricCenterline']): shape is { type: string; coordinates: [number, number][] } =>
  shape?.type === 'LineString' && Array.isArray(shape.coordinates) && shape.coordinates.length >= 2 && shape.coordinates.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))
export function confirmedGeometryDisplay(route: Route) {
  const warnings: string[] = [], metric = line(route.metricCenterline) ? route.metricCenterline.coordinates : null
  const wgs = line(route.wgs84Centerline) && route.wgs84Centerline.coordinates.every(p => Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90) ? route.wgs84Centerline.coordinates : null
  let converted: [number, number][] | null = null
  if (metric) {
    try {
      // Metric coordinates must use a supported engineering adapter, never the GeoJSON degree path.
      if (route.engineeringSrid !== 32648) throw new Error(`engineeringSrid ${route.engineeringSrid}: chưa có adapter metric được hỗ trợ.`)
      converted = previewCenterlineCoordinates(metric, route.engineeringSrid)
    } catch (error) { if (!wgs) warnings.push((error as Error).message) }
  } else warnings.push('metricCenterline: cần LineString 2D hữu hạn để khôi phục lý trình engineering.')
  const coordinates = wgs || converted || []
  if (!coordinates.length && !warnings.length) warnings.push('wgs84Centerline/metricCenterline: chưa có tuyến hiển thị hợp lệ.')
  const kmPoints: number[] = []
  const origin = route.stationOriginMeters, length = route.lengthMeters
  const legacy = route.metadataStatus === 'COMPLETE' && !!route.sourceDraftId && route.sourceCrs === route.engineeringSrid &&
    !route.crsProfileRevisionId && !route.routeSystemId && !route.chainageCalibration
  if (!Number.isFinite(length) || length <= 0) warnings.push('lengthMeters: thiếu chiều dài engineering hợp lệ từ server.')
  if (!Number.isFinite(origin)) warnings.push('stationOriginMeters: thiếu lý trình gốc từ server.')
  if (metric && converted && legacy && Number.isFinite(origin) && Number.isFinite(length) && length > 0) {
    let offset = 0
    const offsets = metric.map((p, i) => { if (i) offset += Math.hypot(p[0] - metric[i - 1][0], p[1] - metric[i - 1][1]); return offset })
    const paired = coordinates.length === converted.length && coordinates.every((p, i) => Math.abs(p[0] - converted![i][0]) <= 1e-6 && Math.abs(p[1] - converted![i][1]) <= 1e-6)
    if (paired && Math.abs(offset - length) <= 1e-12 * Math.max(1, length)) kmPoints.push(...offsets.map(value => (origin! + value) / 1000))
    else warnings.push('metricCenterline/lengthMeters: chưa khớp chiều dài hoặc cặp điểm WGS84 để dựng lý trình.')
  } else if (coordinates.length) warnings.push('Chưa đủ metadata COORDINATES để ghép lý trình; không dùng native ARC tessellation hoặc chiều dài haversine.')
  return { coordinates, kmPoints, lengthKm: Number.isFinite(length) && length > 0 ? length / 1000 : 0, warnings }
}
