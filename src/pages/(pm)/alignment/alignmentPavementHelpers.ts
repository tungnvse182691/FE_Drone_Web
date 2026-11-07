import type { SegmentItem, SlabItem } from './types'

export interface MainlinePavementConfig {
  slabLenM?: number
  thicknessCm?: number
  contractionSpacingM?: number
  expansionSpacingM?: number
  expansionGapMm?: number
}

interface PreviewSlab extends SlabItem {
  segmentId: string
  startKm: number
  endKm: number
  laneIndex: number
  roadWidthM: number
  leftOffsetM: number
  rightOffsetM: number
}

const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
const station = (km: number) => `Km ${Math.floor(km)}+${((km - Math.floor(km)) * 1000).toFixed(3)}`

export function planMainlinePavement(segments: SegmentItem[], cfg: MainlinePavementConfig = {}) {
  const ordered = [...segments].sort((a, b) => a.startKm - b.startKm)
  const missing: string[] = [], slabs: PreviewSlab[] = []
  if (!ordered.length || ordered.some((s, i) => !Number.isFinite(s.startKm) || !Number.isFinite(s.endKm) || s.endKm <= s.startKm || i > 0 && s.startKm !== ordered[i - 1].endKm)) {
    return { segments: [] as SegmentItem[], slabs, missing: ['phạm vi lý trình engineering liên tục'] }
  }
  if (!positive(cfg.slabLenM)) missing.push('chiều dài tấm L')
  if (!positive(cfg.thicknessCm)) missing.push('chiều dày tấm')
  if (ordered.some(s => !positive(s.roadWidthM))) missing.push('bề rộng từng khoảng')
  if (ordered.some(s => !Number.isInteger(s.laneCount) || s.laneCount <= 0)) missing.push('số làn từng khoảng')
  const canMakeSlabs = !missing.length
  if (!positive(cfg.contractionSpacingM)) missing.push('cự ly khe co')
  if (!positive(cfg.expansionSpacingM)) missing.push('cự ly khe giãn')
  if (!positive(cfg.expansionGapMm)) missing.push('độ hở khe giãn')
  if (canMakeSlabs) {
    const origin = ordered[0].startKm, length = cfg.slabLenM!
    for (const segment of ordered) {
      const from = (segment.startKm - origin) * 1000, to = (segment.endKm - origin) * 1000
      for (let row = Math.floor(from / length); row * length < to; row++) {
        const d0 = Math.max(from, row * length), d1 = Math.min(to, (row + 1) * length)
        if (!(d1 > d0)) continue
        const startKm = d0 === from ? segment.startKm : origin + d0 / 1000
        const endKm = d1 === to ? segment.endKm : origin + d1 / 1000
        const width = segment.roadWidthM / segment.laneCount
        for (let lane = 0; lane < segment.laneCount; lane++) slabs.push({
          id: `SLAB-${String(slabs.length + 1).padStart(3, '0')}`, segmentId: segment.id, segmentCode: segment.code,
          stationing: station(startKm), startKm, endKm, lengthM: d1 - d0, widthM: width,
          thicknessCm: cfg.thicknessCm!, laneIndex: lane, roadWidthM: segment.roadWidthM,
          leftOffsetM: segment.roadWidthM / 2 - lane * width,
          rightOffsetM: segment.roadWidthM / 2 - (lane + 1) * width, status: 'GOOD'
        })
      }
    }
  }
  return { segments: ordered, slabs, missing }
}

export function buildMainlinePavementGeoJSON(segments: SegmentItem[], coords: [number, number][], kmPoints: number[], cfg: MainlinePavementConfig = {}) {
  const plan = planMainlinePavement(segments, cfg)
  const slabsGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const jointsGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const edgesGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const missing = [...plan.missing]
  if (!plan.segments.length) return { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON, missing }
  if (coords.length < 2 || coords.length !== kmPoints.length || coords.some(p => !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) ||
      kmPoints.some((km, i) => !Number.isFinite(km) || i > 0 && km <= kmPoints[i - 1]) ||
      plan.segments[0].startKm < kmPoints[0] || plan.segments[plan.segments.length - 1].endKm > kmPoints[kmPoints.length - 1] + 1e-10) {
    missing.push('tọa độ preview gắn với lý trình engineering'); return { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON, missing }
  }
  // Station controls placement. Longitude/latitude are used only for display offsets.
  const pointAt = (km: number, lateral = 0): [number, number] => {
    let lo = 0, hi = kmPoints.length - 1
    while (hi - lo > 1) { const mid = Math.floor((lo + hi) / 2); if (kmPoints[mid] <= km) lo = mid; else hi = mid }
    const t = Math.max(0, Math.min(1, (km - kmPoints[lo]) / (kmPoints[hi] - kmPoints[lo])))
    const a = coords[lo], b = coords[hi], lng = a[0] + t * (b[0] - a[0]), lat = a[1] + t * (b[1] - a[1])
    const mLng = 111320 * Math.cos(lat * Math.PI / 180), dx = (b[0] - a[0]) * mLng, dy = (b[1] - a[1]) * 111320, norm = Math.hypot(dx, dy)
    if (!(norm > 0) || !(mLng > 0)) throw new Error('Tim tuyến preview có hướng không xác định.')
    return [lng - dy / norm * lateral / mLng, lat + dx / norm * lateral / 111320]
  }
  const along = (start: number, end: number, offset: number) => {
    let lo = 0, hi = kmPoints.length
    while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (kmPoints[mid] <= start) lo = mid + 1; else hi = mid }
    const stations = [start]
    while (lo < kmPoints.length && kmPoints[lo] < end) stations.push(kmPoints[lo++])
    stations.push(end)
    return stations.map(km => pointAt(km, offset))
  }
  try {
    for (const slab of plan.slabs) {
      const left = along(slab.startKm, slab.endKm, slab.leftOffsetM), right = along(slab.startKm, slab.endKm, slab.rightOffsetM)
      slabsGeoJSON.features.push({ type: 'Feature', properties: { ...slab, code: slab.id, station: slab.stationing,
        lane: `Làn ${slab.laneIndex + 1}`, edgeOffset: `${slab.leftOffsetM}m → ${slab.rightOffsetM}m`, contractionSpacingM: cfg.contractionSpacingM, preview: true },
        geometry: { type: 'Polygon', coordinates: [[...left, ...right.reverse(), left[0]]] } })
    }
    for (const segment of plan.segments) {
      if (!positive(segment.roadWidthM)) continue
      const half = segment.roadWidthM / 2
      for (const [side, offset] of [['LEFT', half], ['RIGHT', -half]] as const) {
        const line = along(segment.startKm, segment.endKm, offset)
        const properties = { segmentId: segment.id, side, widthM: half, offsetMeters: offset, label: `Mép ${side === 'LEFT' ? 'Trái' : 'Phải'}: ${half}m`, preview: true }
        edgesGeoJSON.features.push({ type: 'Feature', properties: { ...properties, isDimensionLine: true }, geometry: { type: 'LineString', coordinates: line } })
        edgesGeoJSON.features.push({ type: 'Feature', properties, geometry: { type: 'Point', coordinates: line[0] } })
      }
    }
    const origin = plan.segments[0].startKm, end = plan.segments[plan.segments.length - 1].endKm, total = (end - origin) * 1000
    for (const isExpansion of [false, true]) {
      const spacing = isExpansion ? cfg.expansionSpacingM : cfg.contractionSpacingM
      if (!positive(spacing) || isExpansion && !positive(cfg.expansionGapMm)) continue
      for (let i = 1; i * spacing < total; i++) {
        const offset = i * spacing, km = origin + offset / 1000
        if (!isExpansion && positive(cfg.expansionSpacingM) && positive(cfg.expansionGapMm) && Math.abs(offset / cfg.expansionSpacingM - Math.round(offset / cfg.expansionSpacingM)) < 1e-10) continue
        const segment = plan.segments.find(s => km >= s.startKm && km < s.endKm)
        if (!segment || !positive(segment.roadWidthM)) continue
        const half = segment.roadWidthM / 2, gapKm = isExpansion ? cfg.expansionGapMm! / 2000000 : 0
        const a = Math.max(origin, km - gapKm), b = Math.min(end, km + gapKm)
        const before = plan.segments.find(s => a >= s.startKm && a < s.endKm) || segment
        const after = plan.segments.find(s => b >= s.startKm && b < s.endKm) || segment
        if (!positive(before.roadWidthM) || !positive(after.roadWidthM)) continue
        const left = pointAt(a, isExpansion ? before.roadWidthM / 2 : half), right = pointAt(a, isExpansion ? -before.roadWidthM / 2 : -half)
        const geometry: GeoJSON.Geometry = isExpansion ? { type: 'Polygon', coordinates: [[left, right, pointAt(b, -after.roadWidthM / 2), pointAt(b, after.roadWidthM / 2), left]] } : { type: 'LineString', coordinates: [left, right] }
        jointsGeoJSON.features.push({ type: 'Feature', properties: { id: `${isExpansion ? 'EJ' : 'CJ'}-${i}`, segmentId: segment.id, segmentCode: segment.code,
          isExpansion, station: station(km), offsetMeters: offset, spacingMeters: spacing, gapMm: isExpansion ? cfg.expansionGapMm : null,
          label: isExpansion ? `Khe giãn ${cfg.expansionGapMm}mm` : `Khe co ${spacing}m`, name: isExpansion ? 'Khe giãn' : 'Khe co', preview: true }, geometry })
      }
    }
  } catch {
    slabsGeoJSON.features = []; jointsGeoJSON.features = []; edgesGeoJSON.features = []
    missing.push('hướng tim tuyến preview hợp lệ')
  }
  return { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON, missing }
}
