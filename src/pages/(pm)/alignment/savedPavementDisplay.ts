import type { PavementLayoutInput, PavementLayoutView, PavementSegmentRange } from '../../../api/services/pavementService'
import type { RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { utm48NToWgs84 } from '../../../api/services/alignmentService'
import type { PavementPreview } from './alignmentPavementDisplay'
import type { SegmentItem, SlabItem } from './types'

export function buildSavedPavement(snapshot: PavementLayoutView, layout: PavementLayoutInput | null, srid: number, origin?: number | null, route?: RoadGeometryVersionView & { crsProfileRevisionId?: string | null; routeSystemId?: string | null; pavementSegmentRanges?: PavementSegmentRange[] | null }) {
  if (srid !== 32648) throw new Error(`engineeringSrid ${srid}: chưa có adapter footprint được hỗ trợ; không tự đoán CRS.`)
  const planned = snapshot.kind === 'PLANNED'
  const cells = snapshot.geometry.plan?.cells
  if (planned && (!cells?.length || cells.length !== snapshot.geometry.slabs.length)) throw new Error('Snapshot thiếu geometry.plan.cells/geometry.slabs tương ứng.')
  const profile = layout?.widthProfile
  if (planned && !profile?.length) throw new Error('Snapshot chưa có widthProfile nguồn để hiển thị phạm vi pavement.')
  const station = Number.isFinite(origin) ? origin! : 0
  const segments: SegmentItem[] = (profile || []).map((w, i) => ({ id: `layout-${snapshot.id}-${i}`, code: `Khoảng bề rộng ${i + 1}`,
    startKm: Number.isFinite(origin) ? (origin! + w.fromOffsetMeters) / 1000 : Number.NaN, endKm: Number.isFinite(origin) ? (origin! + w.toOffsetMeters) / 1000 : Number.NaN, lengthKm: (w.toOffsetMeters - w.fromOffsetMeters) / 1000,
    roadWidthM: w.widthMeters, laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: 'ĐÃ LƯU TRÊN MÁY CHỦ', color: '#C9A227' }))
  const backgroundSegments = [...segments]
  if (!planned) segments.splice(0, segments.length, { id: `layout-${snapshot.id}-asbuilt`, code: 'Hoàn công', startKm: Number.NaN, endKm: Number.NaN, lengthKm: Number.NaN, roadWidthM: Number.NaN, laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: 'ĐÃ LƯU TRÊN MÁY CHỦ', color: '#C9A227' })
  const empty = (): GeoJSON.FeatureCollection => ({ type: 'FeatureCollection', features: [] })
  const preview: PavementPreview = { slabsGeoJSON: empty(), slabLabelsGeoJSON: empty(), jointsGeoJSON: empty(), jointLabelsGeoJSON: empty(), edgesGeoJSON: empty(), missing: [],
    issues: [{ kind: 'contraction', message: 'Server chưa xác nhận geometry khe vật lý.' }, { kind: 'expansion', message: 'Server chưa xác nhận geometry khe vật lý.' }] }
  const slabs: (SlabItem & { segmentId: string })[] = []
  snapshot.geometry.slabs.forEach((slab, i) => {
    const cell = planned ? cells![i] : cells?.find(c => slab.plannedSequence != null && c.sequence === slab.plannedSequence)
    const index = planned ? profile!.findIndex(w => cell!.fromOffsetMeters >= w.fromOffsetMeters && cell!.toOffsetMeters <= w.toOffsetMeters) : 0
    if (planned && (index < 0 || slab.plannedSequence !== cell!.sequence || !slab.key || !(slab.lengthMeters! > 0) || !(slab.widthMeters! > 0))) throw new Error('Snapshot cell/tấm không khớp widthProfile hoặc sequence.')
    if (slab.footprint.length < 4 || !slab.footprint.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) throw new Error('Snapshot footprint chưa hợp lệ.')
    const ring = slab.footprint.map(p => utm48NToWgs84(p.x, p.y)), segment = segments[index]
    const center = ring.slice(0, -1).reduce((sum, p) => [sum[0] + p[0] / (ring.length - 1), sum[1] + p[1] / (ring.length - 1)], [0, 0])
    const stationText = cell ? `${Number.isFinite(origin) ? 'Lý trình' : 'Offset'} ${station + cell.fromOffsetMeters}–${station + cell.toOffsetMeters} m` : 'Chưa có dữ liệu'
    const lateralText = cell ? `${cell.fromLateralMeters}–${cell.toLateralMeters} m từ tim tuyến` : 'Chưa có dữ liệu'
    const properties = { id: slab.key, code: slab.key, station: stationText, lane: lateralText, edgeOffset: lateralText,
      fromOffsetMeters: cell?.fromOffsetMeters ?? null, toOffsetMeters: cell?.toOffsetMeters ?? null, fromLateralMeters: cell?.fromLateralMeters ?? null, toLateralMeters: cell?.toLateralMeters ?? null, segmentId: segment.id, segmentCode: segment.code,
      lengthM: slab.lengthMeters ?? Number.NaN, widthM: slab.widthMeters ?? Number.NaN, thicknessCm: planned ? layout?.slabThicknessCentimeters ?? Number.NaN : Number.NaN,
      startKm: cell && Number.isFinite(origin) ? (origin! + cell.fromOffsetMeters) / 1000 : null, endKm: cell && Number.isFinite(origin) ? (origin! + cell.toOffsetMeters) / 1000 : null, source: 'SERVER_SNAPSHOT', layoutId: snapshot.id,
      layoutKind: snapshot.kind, plannedSequence: slab.plannedSequence ?? null, slabSource: slab.source ?? null, provenanceStatus: slab.provenanceStatus ?? null, dimensionUnknownReason: slab.dimensionUnknownReason ?? null }
    preview.slabsGeoJSON.features.push({ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [ring] } })
    preview.slabLabelsGeoJSON.features.push({ type: 'Feature', properties, geometry: { type: 'Point', coordinates: center } })
    slabs.push({ id: slab.key, segmentId: segment.id, segmentCode: segment.code,
      stationing: stationText,
      lengthM: slab.lengthMeters ?? Number.NaN, widthM: slab.widthMeters ?? Number.NaN, thicknessCm: planned ? layout?.slabThicknessCentimeters ?? Number.NaN : Number.NaN, status: 'GOOD' })
  })
  const coordinates = route?.wgs84Centerline?.coordinates || route?.metricCenterline?.coordinates?.map(([x, y]) => utm48NToWgs84(x, y)) || []
  if (!coordinates.every(p => p.length === 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90)) throw new Error('Route server thiếu tọa độ hiển thị hợp lệ.')
  // Only a legacy metric LineString with a known engineering origin/length admits
  // cumulative metric offsets. Native ARC tessellation does not establish chainage.
  const metric = route?.metricCenterline?.type === 'LineString' ? route.metricCenterline.coordinates : null
  let offsets = [0]
  if (metric?.length && metric.every(p => p.length === 2 && p.every(Number.isFinite))) {
    for (let i = 1; i < metric.length; i++) offsets.push(offsets[i - 1] + Math.hypot(metric[i][0] - metric[i - 1][0], metric[i][1] - metric[i - 1][1]))
  }
  const routeReady = !route?.crsProfileRevisionId && !route?.routeSystemId && Number.isFinite(origin) && metric && metric.length >= 2 && offsets.length === metric.length &&
    Number.isFinite(route?.lengthMeters) && Math.abs(offsets[offsets.length - 1] - route!.lengthMeters) <= 1e-12 * Math.max(1, route!.lengthMeters)
  const previewReady = planned && routeReady
  const backgroundKmPoints = routeReady ? offsets.map(offset => (origin! + offset) / 1000) : []
  const previewCoordinates = previewReady ? metric!.map(([x, y]) => utm48NToWgs84(x, y)) : []
  const kmPoints = previewReady ? offsets.map(offset => (origin! + offset) / 1000) : []
  return { preview, segments, backgroundSegments: routeReady ? backgroundSegments : [], backgroundKmPoints, slabs, route, segmentRanges: route?.pavementSegmentRanges || null, engineeringSrid: srid, stationOriginMeters: origin, coordinates: routeReady ? metric!.map(([x, y]) => utm48NToWgs84(x, y)) : coordinates, previewCoordinates, kmPoints, previewReady: !!previewReady,
    previewBlocker: previewReady ? '' : 'Chưa đủ quan hệ tọa độ/lý trình engineering từ route server để dựng preview mới; giữ snapshot đã lưu, chưa áp dụng cấu hình PM mới.', label: planned ? `Tấm thiết kế đã lưu · Dung sai ${snapshot.geometry.displayToleranceMeters} m · Chưa được Giám sát duyệt` : `Tấm hoàn công đã lưu · Dung sai ${snapshot.geometry.displayToleranceMeters} m` }
}
