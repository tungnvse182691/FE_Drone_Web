import type { SegmentItem, SlabItem } from './types'

export interface MainlinePavementConfig {
  stripWidthMeters?: number | string
  slabLenM?: number | string
  thicknessCm?: number | string
  contractionSpacingM?: number | string
  expansionSpacingM?: number | string
  expansionGapMm?: number | string
}

// Rendering budget, not a technical limit: refuse the entire slab preview, never truncate it.
export const MAX_PREVIEW_SLABS = 20000

export interface PavementInputIssue {
  kind: 'slab' | 'contraction' | 'expansion' | 'shared' | 'thickness'
  segmentId?: string
  message: string
}

// Keep the input text in editor state; only complete decimal numbers reach geometry.
export function pavementNumber(value: number | string | undefined): number {
  if (typeof value === 'number') return value
  return typeof value === 'string' && /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()) ? Number(value) : Number.NaN
}

export function normalizePavementConfig(input: MainlinePavementConfig = {}) {
  return { stripWidthMeters: pavementNumber(input.stripWidthMeters), slabLenM: pavementNumber(input.slabLenM), thicknessCm: pavementNumber(input.thicknessCm),
    contractionSpacingM: pavementNumber(input.contractionSpacingM), expansionSpacingM: pavementNumber(input.expansionSpacingM), expansionGapMm: pavementNumber(input.expansionGapMm) }
}

export function pavementInputIssues(segments: SegmentItem[], input: MainlinePavementConfig = {}) {
  const issues: PavementInputIssue[] = []
  const check = (value: number | string | undefined, label: string, kind: PavementInputIssue['kind'], segment?: SegmentItem) => {
    const absent = value === undefined || typeof value === 'number' && Number.isNaN(value) || typeof value === 'string' && !value.trim()
    const number = pavementNumber(value)
    if (absent || !positive(number)) issues.push({ kind, segmentId: segment?.id,
      message: `${absent ? 'Chưa nhập' : 'Không hợp lệ'}: ${label}${segment ? ` — ${segment.code}` : ''}${absent ? '' : ' (cần số hữu hạn > 0)'}` })
  }
  check(input.slabLenM, 'chiều dài tấm L', 'slab')
  check(input.stripWidthMeters, 'bề rộng tấm', 'slab')
  const thicknessAbsent = input.thicknessCm === undefined || typeof input.thicknessCm === 'number' && Number.isNaN(input.thicknessCm) || typeof input.thicknessCm === 'string' && !input.thicknessCm.trim()
  if (thicknessAbsent) issues.push({ kind: 'thickness', message: 'Chưa nhập chiều dày tấm' })
  else if (!positive(pavementNumber(input.thicknessCm))) issues.push({ kind: 'slab', message: 'Chiều dày tấm không hợp lệ' })
  for (const segment of segments) {
    check(segment.roadWidthM, 'bề rộng', 'shared', segment)
  }
  if (!issues.some(issue => issue.kind === 'slab') && segments.length) {
    const cfg = normalizePavementConfig(input), origin = segments.reduce((min, segment) => Math.min(min, segment.startKm), Infinity)
    const expected = segments.reduce((sum, segment) => sum + (positive(segment.roadWidthM) ?
      (Math.ceil((segment.endKm - origin) * 1000 / cfg.slabLenM) - Math.floor((segment.startKm - origin) * 1000 / cfg.slabLenM)) * Math.ceil(segment.roadWidthM / cfg.stripWidthMeters) : 0), 0)
    if (!Number.isSafeInteger(expected) || expected > MAX_PREVIEW_SLABS) issues.push({ kind: 'slab',
      message: `Preview dự kiến ${expected.toLocaleString('vi-VN')} tấm, vượt ngân sách hiển thị ${MAX_PREVIEW_SLABS.toLocaleString('vi-VN')} tấm; chưa sinh tấm. Giữ nguyên thông số PM.` })
  }
  check(input.contractionSpacingM, 'cự ly khe co', 'contraction')
  check(input.expansionSpacingM, 'cự ly khe giãn', 'expansion')
  check(input.expansionGapMm, 'độ hở khe giãn', 'expansion')
  return issues
}

interface PreviewSlab extends SlabItem {
  segmentId: string
  startKm: number
  endKm: number
  stripIndex: number
  roadWidthM: number
  leftOffsetM: number
  rightOffsetM: number
}

const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
const station = (km: number) => `Km ${Math.floor(km)}+${((km - Math.floor(km)) * 1000).toFixed(3)}`

export function planMainlinePavement(segments: SegmentItem[], input: MainlinePavementConfig = {}) {
  const cfg = normalizePavementConfig(input)
  const ordered = [...segments].sort((a, b) => a.startKm - b.startKm)
  const issues = pavementInputIssues(ordered, input), missing = issues.map(issue => issue.message), slabs: PreviewSlab[] = []
  if (!ordered.length || ordered.some((s, i) => !Number.isFinite(s.startKm) || !Number.isFinite(s.endKm) || s.endKm <= s.startKm || i > 0 && s.startKm !== ordered[i - 1].endKm)) {
    return { segments: [] as SegmentItem[], slabs, missing: ['phạm vi lý trình engineering liên tục'], issues: [{ kind: 'shared' as const, message: 'Thiếu phạm vi lý trình engineering liên tục' }] }
  }
  if (!issues.some(issue => issue.kind === 'slab')) {
    const origin = ordered[0].startKm, length = cfg.slabLenM!
    for (const segment of ordered) {
      if (issues.some(issue => issue.segmentId === segment.id)) continue
      const from = (segment.startKm - origin) * 1000, to = (segment.endKm - origin) * 1000
      for (let row = Math.floor(from / length); row * length < to; row++) {
        const d0 = Math.max(from, row * length), d1 = Math.min(to, (row + 1) * length)
        if (!(d1 > d0)) continue
        const startKm = d0 === from ? segment.startKm : origin + d0 / 1000
        const endKm = d1 === to ? segment.endKm : origin + d1 / 1000
        for (let strip = 0; strip < Math.ceil(segment.roadWidthM / cfg.stripWidthMeters); strip++) {
          const fromLateral = strip * cfg.stripWidthMeters, toLateral = Math.min(segment.roadWidthM, (strip + 1) * cfg.stripWidthMeters)
          const width = toLateral - fromLateral
          slabs.push({
            id: `T${slabs.length + 1}`, segmentId: segment.id, segmentCode: segment.code,
            stationing: station(startKm), startKm, endKm, lengthM: d1 - d0, widthM: width,
            thicknessCm: positive(cfg.thicknessCm) ? cfg.thicknessCm : Number.NaN, stripIndex: strip, roadWidthM: segment.roadWidthM,
            leftOffsetM: segment.roadWidthM / 2 - fromLateral,
            rightOffsetM: segment.roadWidthM / 2 - toLateral, status: 'GOOD'
          })
        }
      }
    }
  }
  return { segments: ordered, slabs, missing, issues }
}

export function buildMainlinePavementGeoJSON(segments: SegmentItem[], coords: [number, number][], kmPoints: number[], input: MainlinePavementConfig = {}) {
  const cfg = normalizePavementConfig(input)
  const plan = planMainlinePavement(segments, input)
  const slabsGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const slabLabelsGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const jointsGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const jointLabelsGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const edgesGeoJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
  const missing = [...plan.missing]
  if (!plan.segments.length) return { slabsGeoJSON, slabLabelsGeoJSON, jointsGeoJSON, jointLabelsGeoJSON, edgesGeoJSON, missing, issues: plan.issues }
  if (coords.length < 2 || coords.length !== kmPoints.length || coords.some(p => !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) ||
      kmPoints.some((km, i) => !Number.isFinite(km) || i > 0 && km <= kmPoints[i - 1]) ||
      plan.segments[0].startKm < kmPoints[0] || plan.segments[plan.segments.length - 1].endKm > kmPoints[kmPoints.length - 1] + 1e-10) {
    missing.push('tọa độ preview gắn với lý trình engineering'); plan.issues.push({ kind: 'shared', message: 'Thiếu tọa độ preview gắn với lý trình engineering' }); return { slabsGeoJSON, slabLabelsGeoJSON, jointsGeoJSON, jointLabelsGeoJSON, edgesGeoJSON, missing, issues: plan.issues }
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
    for (const [index, slab] of plan.slabs.entries()) {
      const left = along(slab.startKm, slab.endKm, slab.leftOffsetM), right = along(slab.startKm, slab.endKm, slab.rightOffsetM)
      const properties = { ...slab, sequence: index + 1, code: `T${index + 1}`, station: slab.stationing,
        lane: `Dải tấm ${slab.stripIndex + 1}`, edgeOffset: `${slab.leftOffsetM}m → ${slab.rightOffsetM}m`, contractionSpacingM: cfg.contractionSpacingM, preview: true },
      labelPoint = pointAt((slab.startKm + slab.endKm) / 2, (slab.leftOffsetM + slab.rightOffsetM) / 2)
      slabsGeoJSON.features.push({ type: 'Feature', properties,
        geometry: { type: 'Polygon', coordinates: [[...left, ...right.reverse(), left[0]]] } })
      slabLabelsGeoJSON.features.push({ type: 'Feature', properties, geometry: { type: 'Point', coordinates: labelPoint } })
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
    const jointSequence = { contraction: 0, expansion: 0 }
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
        const sequence = isExpansion ? ++jointSequence.expansion : ++jointSequence.contraction
        const properties = { id: `${isExpansion ? 'EJ' : 'CJ'}-${i}`, code: `${isExpansion ? 'KG' : 'KC'}${sequence}`, sequence, segmentId: segment.id, segmentCode: segment.code,
          isExpansion, station: station(km), offsetMeters: offset, spacingMeters: spacing, gapMm: isExpansion ? cfg.expansionGapMm : null,
          roadWidthM: segment.roadWidthM, label: `${isExpansion ? 'KG' : 'KC'}${sequence}`, name: isExpansion ? 'Khe giãn' : 'Khe co', preview: true }
        jointsGeoJSON.features.push({ type: 'Feature', properties, geometry })
        const labelPositions = isExpansion ? (geometry as GeoJSON.Polygon).coordinates[0].slice(0, -1) : [left, right]
        const labelPoint: [number, number] = [labelPositions.reduce((sum, p) => sum + p[0], 0) / labelPositions.length, labelPositions.reduce((sum, p) => sum + p[1], 0) / labelPositions.length]
        jointLabelsGeoJSON.features.push({ type: 'Feature', properties, geometry: { type: 'Point', coordinates: labelPoint } })
      }
    }
  } catch {
    slabsGeoJSON.features = []; slabLabelsGeoJSON.features = []; jointsGeoJSON.features = []; jointLabelsGeoJSON.features = []; edgesGeoJSON.features = []
    missing.push('hướng tim tuyến preview hợp lệ'); plan.issues.push({ kind: 'shared', message: 'Thiếu hướng tim tuyến preview hợp lệ' })
  }
  return { slabsGeoJSON, slabLabelsGeoJSON, jointsGeoJSON, jointLabelsGeoJSON, edgesGeoJSON, missing, issues: plan.issues }
}
