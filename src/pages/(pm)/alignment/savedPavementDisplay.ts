import type { PavementLayoutInput, PavementLayoutView } from '../../../api/services/pavementService'
import type { RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { utm48NToWgs84 } from '../../../api/services/alignmentService'
import type { PavementPreview } from './alignmentPavementDisplay'
import type { SegmentItem, SlabItem } from './types'

export function buildSavedPavement(snapshot: PavementLayoutView, layout: PavementLayoutInput | null, srid: number, origin?: number | null, route?: RoadGeometryVersionView) {
  if (srid !== 32648) throw new Error(`engineeringSrid ${srid}: chưa có adapter footprint được hỗ trợ; không tự đoán CRS.`)
  const cells = snapshot.geometry.plan?.cells
  if (!cells?.length || cells.length !== snapshot.geometry.slabs.length) throw new Error('Snapshot thiếu geometry.plan.cells/geometry.slabs tương ứng.')
  const profile = layout?.widthProfile
  if (!profile?.length) throw new Error('Snapshot chưa có widthProfile nguồn để hiển thị phạm vi pavement.')
  const station = Number.isFinite(origin) ? origin! : 0
  const segments: SegmentItem[] = profile.map((w, i) => ({ id: `layout-${snapshot.id}-${i}`, code: `Layout ${snapshot.id} · ${i + 1}`,
    startKm: (station + w.fromOffsetMeters) / 1000, endKm: (station + w.toOffsetMeters) / 1000, lengthKm: (w.toOffsetMeters - w.fromOffsetMeters) / 1000,
    roadWidthM: w.widthMeters, laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: 'SNAPSHOT MÁY CHỦ', color: '#C9A227' }))
  const empty = (): GeoJSON.FeatureCollection => ({ type: 'FeatureCollection', features: [] })
  const preview: PavementPreview = { slabsGeoJSON: empty(), slabLabelsGeoJSON: empty(), jointsGeoJSON: empty(), jointLabelsGeoJSON: empty(), edgesGeoJSON: empty(), missing: [],
    issues: [{ kind: 'contraction', message: 'Server chưa xác nhận geometry khe vật lý.' }, { kind: 'expansion', message: 'Server chưa xác nhận geometry khe vật lý.' }] }
  const slabs: (SlabItem & { segmentId: string })[] = []
  snapshot.geometry.slabs.forEach((slab, i) => {
    const cell = cells[i], index = profile.findIndex(w => cell.fromOffsetMeters >= w.fromOffsetMeters && cell.toOffsetMeters <= w.toOffsetMeters)
    if (index < 0 || slab.plannedSequence !== cell.sequence || !slab.key || !(slab.lengthMeters! > 0) || !(slab.widthMeters! > 0)) throw new Error('Snapshot cell/tấm không khớp widthProfile hoặc sequence.')
    if (slab.footprint.length < 4 || !slab.footprint.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) throw new Error('Snapshot footprint chưa hợp lệ.')
    const ring = slab.footprint.map(p => utm48NToWgs84(p.x, p.y)), segment = segments[index]
    const center = ring.slice(0, -1).reduce((sum, p) => [sum[0] + p[0] / (ring.length - 1), sum[1] + p[1] / (ring.length - 1)], [0, 0])
    const properties = { id: slab.key, code: slab.key, segmentId: segment.id, segmentCode: segment.code,
      lengthM: slab.lengthMeters!, widthM: slab.widthMeters!, thicknessCm: layout?.slabThicknessCentimeters ?? Number.NaN,
      startKm: (station + cell.fromOffsetMeters) / 1000, endKm: (station + cell.toOffsetMeters) / 1000, source: 'SERVER_SNAPSHOT', layoutId: snapshot.id }
    preview.slabsGeoJSON.features.push({ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [ring] } })
    preview.slabLabelsGeoJSON.features.push({ type: 'Feature', properties, geometry: { type: 'Point', coordinates: center } })
    slabs.push({ id: slab.key, segmentId: segment.id, segmentCode: segment.code,
      stationing: `${Number.isFinite(origin) ? 'Lý trình' : 'Offset'} ${station + cell.fromOffsetMeters}–${station + cell.toOffsetMeters} m`,
      lengthM: slab.lengthMeters!, widthM: slab.widthMeters!, thicknessCm: layout?.slabThicknessCentimeters ?? Number.NaN, status: 'GOOD' })
  })
  const coordinates = route?.wgs84Centerline?.coordinates || route?.metricCenterline?.coordinates?.map(([x, y]) => utm48NToWgs84(x, y)) || []
  if (!coordinates.every(p => p.length === 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90)) throw new Error('Route server thiếu tọa độ hiển thị hợp lệ.')
  return { preview, segments, slabs, coordinates, label: `Snapshot server ${snapshot.id} · dung sai hiển thị ${snapshot.geometry.displayToleranceMeters} m · chưa phải Sup duyệt` }
}
