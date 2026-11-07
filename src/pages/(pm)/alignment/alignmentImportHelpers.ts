import { SegmentItem } from './types'
import { SEGMENT_COLORS } from './data'
import { smoothRoadPolyline } from './alignmentGeometryHelpers'

// Tính khoảng cách Haversine giữa 2 tọa độ GPS (km)
export function calculateHaversineKm(c1: [number, number], c2: [number, number]): number {
  const R = 6371
  const dLat = ((c2[1] - c1[1]) * Math.PI) / 180
  const dLon = ((c2[0] - c1[0]) * Math.PI) / 180
  const lat1 = (c1[1] * Math.PI) / 180
  const lat2 = (c2[1] * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface ExtractedRouteData {
  coords: [number, number][]
  kmPoints: number[]
  totalLengthKm: number
  segments: SegmentItem[]
}

export function parseExtractedCoordinates(
  rawCoords: [number, number][],
  originKm: number,
  splitDistance: number,
  roadWidthM: number
): ExtractedRouteData | null {
  if (rawCoords.length < 2) return null

  // Tự động nhận diện và đảo thứ tự nếu chứa [lat, lng] thay vì [lng, lat]
  let extracted = rawCoords
  const sample = extracted[0]
  if (sample[0] >= 8 && sample[0] <= 24 && sample[1] >= 100 && sample[1] <= 112) {
    extracted = extracted.map(([lat, lng]) => [lng, lat])
  }

  // Lọc bỏ tọa độ trùng lặp liên tiếp
  const cleanCoords: [number, number][] = []
  for (let i = 0; i < extracted.length; i++) {
    if (
      i === 0 ||
      Math.abs(extracted[i][0] - extracted[i - 1][0]) > 1e-7 ||
      Math.abs(extracted[i][1] - extracted[i - 1][1]) > 1e-7
    ) {
      cleanCoords.push(extracted[i])
    }
  }

  if (cleanCoords.length < 2) return null

  extracted = cleanCoords

  // Nếu tọa độ thưa (ví dụ nhập 3-20 điểm cọc), tự động bo tròn mượt đường cong tim tuyến
  if (extracted.length >= 3 && extracted.length < 25) {
    extracted = smoothRoadPolyline(extracted)
  }

  let totalLen = 0
  const kmPts: number[] = [originKm]
  for (let i = 0; i < extracted.length - 1; i++) {
    const d = calculateHaversineKm(extracted[i], extracted[i + 1])
    totalLen += d
    kmPts.push(Number((originKm + totalLen).toFixed(3)))
  }
  totalLen = parseFloat(Math.max(totalLen, 0.05).toFixed(3))

  let dist = splitDistance || 5.0
  if (totalLen <= 1.0) {
    dist = parseFloat((totalLen / 3).toFixed(2)) || 0.25
  } else if (totalLen <= 2.5) {
    dist = parseFloat((totalLen / 3).toFixed(2)) || 0.5
  }

  const count = Math.max(1, Math.ceil(totalLen / dist))
  const newSegs: SegmentItem[] = []
  let cur = originKm
  for (let i = 1; i <= count; i++) {
    const next = i === count ? originKm + totalLen : Math.min(cur + dist, originKm + totalLen)
    newSegs.push({
      id: `seg-${i}`,
      code: `Phân đoạn #${String(i).padStart(2, '0')}`,
      startKm: parseFloat(cur.toFixed(3)),
      endKm: parseFloat(next.toFixed(3)),
      lengthKm: parseFloat((next - cur).toFixed(3)),
      roadWidthM: roadWidthM || 8.0,
      status: 'VALID',
      statusText: 'HỢP LỆ',
      laneCount: 4,
      surfaceMaterial: i % 2 === 0 ? 'Mặt BTN C19' : 'Mặt BTN C12.5',
      color: SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
    })
    cur = next
  }

  return {
    coords: extracted,
    kmPoints: kmPts,
    totalLengthKm: totalLen,
    segments: newSegs
  }
}

export interface GeoJsonCenterlineReview {
  declaredSrid?: number
  metadata?: Record<string, unknown>
  declaredCrs?: unknown
  coords: [number, number][]
  featureName: string
  layer: string
  ignoredFeatureCount: number
  sourceCrs: string
  estimatedLengthMeters: number | null
  declaredLengthMeters?: number
  roadWidthHintMeters?: number
  adjacentDuplicates: number
  repeatedVertices: number
  selfIntersections: number | null
}

export class GeoJsonValidationError extends Error {}

// Only inspect the input. This does not create chainage, survey accuracy or segments.
export function inspectGeoJsonCenterline(text: string): GeoJsonCenterlineReview {
  let parsed: any
  try { parsed = JSON.parse(text) } catch { throw new GeoJsonValidationError('Tệp GeoJSON sai cú pháp JSON.') }
  if (!parsed || typeof parsed !== 'object') throw new GeoJsonValidationError('Tệp GeoJSON không hợp lệ.')
  const features = parsed.type === 'FeatureCollection' ? parsed.features
    : parsed.type === 'Feature' ? [parsed] : parsed.type === 'LineString' ? [{ geometry: parsed, properties: {} }] : []
  if (!Array.isArray(features)) throw new GeoJsonValidationError('FeatureCollection không hợp lệ.')
  if (features.some((f: any) => !f || typeof f !== 'object' || Array.isArray(f) || parsed.type === 'FeatureCollection' && f.type !== 'Feature' ||
      f.properties != null && (typeof f.properties !== 'object' || Array.isArray(f.properties)))) throw new GeoJsonValidationError('Feature hoặc properties không hợp lệ.')
  const centerlines = features.filter((f: any) => f.properties?.type === 'Centerline' || f.properties?.layer === 'TIM_TUYEN_CHINH')
  const lines = features.filter((f: any) => f.geometry?.type === 'LineString' && !['RoadEdge', 'RoadSurface'].includes(f.properties?.type) && !/^MEP_/.test(f.properties?.layer || ''))
  if (!centerlines.length && !lines.length) {
    if (!['FeatureCollection', 'Feature', 'LineString'].includes(parsed.type) || features.some((f: any) => f.geometry && f.geometry.type !== 'LineString')) {
      throw new GeoJsonValidationError('Geometry không hỗ trợ: cần tim tuyến LineString, không dùng Polygon hoặc MultiLineString.')
    }
    throw new GeoJsonValidationError('Không chọn được tim tuyến: cần đúng một Centerline rõ nguồn; không dùng mép đường thay tim tuyến.')
  }
  const candidates = centerlines.length ? centerlines : lines
  if (candidates.length !== 1) throw new GeoJsonValidationError('Cần đúng một Centerline rõ nguồn; không ghép nhiều tuyến/mép đường thành tim tuyến.')
  const feature = candidates[0]
  if (feature.geometry?.type !== 'LineString') throw new GeoJsonValidationError('Centerline phải là LineString; không dùng Polygon hoặc ghép MultiLineString khi chưa có topology.')
  const declarations = [parsed.crs, feature.crs, feature.geometry.crs].filter(value => value != null)
  const declaredSrids = declarations.map(value => {
    const name = value?.type === 'name' ? value.properties?.name : undefined
    const match = typeof name === 'string' ? /^(?:EPSG:|urn:ogc:def:crs:EPSG::)(4326|32648|32649)$/.exec(name) : null
    if (!match) throw new GeoJsonValidationError('Tệp khai báo CRS riêng; chưa xác minh được hệ quy chiếu và đơn vị để ghi hình học.')
    return Number(match[1])
  })
  if (new Set(declaredSrids).size > 1) throw new GeoJsonValidationError('Khai báo CRS của tim tuyến mâu thuẫn với tệp; chưa xác minh được hệ quy chiếu.')
  const raw = feature.geometry.coordinates
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > 100000) throw new GeoJsonValidationError('Tim tuyến cần 2–100000 đỉnh.')
  const coords: [number, number][] = raw.map((p: any) => {
    if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== 'number' || typeof p[1] !== 'number' || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) {
      throw new GeoJsonValidationError('Tọa độ phải là cặp số hữu hạn; chưa xác định trục hoặc đơn vị khi thiếu hệ quy chiếu.')
    }
    return [p[0], p[1]]
  })
  let adjacentDuplicates = 0, selfIntersections = 0
  const cross = (a: number[], b: number[], c: number[]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
  const on = (a: number[], b: number[], p: number[]) => cross(a,b,p) === 0 && p[0] >= Math.min(a[0],b[0]) && p[0] <= Math.max(a[0],b[0]) && p[1] >= Math.min(a[1],b[1]) && p[1] <= Math.max(a[1],b[1])
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i-1], b = coords[i]

    if (a[0] === b[0] && a[1] === b[1]) adjacentDuplicates++
    // Bounded input QA; BE remains geometry authority for large files.
    if (coords.length <= 2000) for (let j = i + 2; j < coords.length; j++) {
      const c = coords[j-1], d = coords[j]
      const abC = cross(a,b,c), abD = cross(a,b,d), cdA = cross(c,d,a), cdB = cross(c,d,b)
      if ((abC * abD < 0 && cdA * cdB < 0) || on(a,b,c) || on(a,b,d) || on(c,d,a) || on(c,d,b)) selfIntersections++
    }
  }
  if (coords.every(point => point[0] === coords[0][0] && point[1] === coords[0][1])) throw new GeoJsonValidationError('Tim tuyến chỉ có một vị trí lặp lại.')
  const width = features.find((f: any) => f.properties?.type === 'RoadSurface')?.properties?.roadWidth
  const declared = feature.properties?.totalLength ?? parsed.totalLengthMeters
  return {
    declaredSrid: declaredSrids[0], declaredCrs: declarations[0],
    metadata: { ...(feature.properties || {}) },
    coords, featureName: feature.properties?.name || 'LineString', layer: feature.properties?.layer || '',
    ignoredFeatureCount: features.length - 1, sourceCrs: 'UNKNOWN — Chưa xác định hệ quy chiếu, trục và đơn vị',
    estimatedLengthMeters: null, adjacentDuplicates, repeatedVertices: coords.length - new Set(coords.map(p => JSON.stringify(p))).size,
    selfIntersections: coords.length <= 2000 ? selfIntersections : null, declaredLengthMeters: typeof declared === 'number' && Number.isFinite(declared) ? declared : undefined,
    roadWidthHintMeters: typeof width === 'number' && width > 0 ? width : undefined,
  }
}

export function parseGeoJsonText(text: string): [number, number][] {
  return inspectGeoJsonCenterline(text).coords
}

export function parseManualCoordinatesText(text: string): [number, number][] {
  let coords: [number, number][] = []
  const trimmed = text.trim()

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        coords = parsed.map((p: any) => [Number(p[0]), Number(p[1])])
      } else if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
        const line = parsed.features.find((f: any) => f.geometry?.type === 'LineString')
        if (line?.geometry?.coordinates) {
          coords = line.geometry.coordinates.map((p: any) => [Number(p[0]), Number(p[1])])
        }
      }
    } catch {
      // Fallback line by line
    }
  }

  if (coords.length < 2) {
    const lines = trimmed.split('\n')
    for (const line of lines) {
      const cleaned = line.trim().replace(/[\[\]\(\);]/g, '')
      if (!cleaned) continue
      const parts = cleaned.split(/[\s,]+/).filter(Boolean)
      if (parts.length >= 2) {
        const num1 = parseFloat(parts[0])
        const num2 = parseFloat(parts[1])
        if (!isNaN(num1) && !isNaN(num2)) {
          coords.push([num1, num2])
        }
      }
    }
  }

  return coords
}
