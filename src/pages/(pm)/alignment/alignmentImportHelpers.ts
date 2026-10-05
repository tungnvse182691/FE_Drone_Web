import { SegmentItem } from './types'
import { SEGMENT_COLORS } from './alignmentData'

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
      statusText: 'HỢP LỆ (Valid)',
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

export function parseGeoJsonText(text: string): [number, number][] {
  const parsed = JSON.parse(text)
  let rawCoords: [number, number][] = []

  if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
    let targetFeature = parsed.features.find((f: any) => {
      const type = (f.properties?.type || '').toLowerCase()
      const layer = (f.properties?.layer || '').toLowerCase()
      const name = (f.properties?.name || '').toLowerCase()
      return (
        type === 'centerline' ||
        layer.includes('tim') ||
        layer.includes('center') ||
        layer.includes('alignment') ||
        name.includes('tim') ||
        name.includes('center') ||
        name.includes('tuyến chính')
      )
    })

    if (!targetFeature) {
      const lineFeatures = parsed.features.filter(
        (f: any) =>
          (f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString') &&
          Array.isArray(f.geometry?.coordinates) &&
          f.geometry.coordinates.length >= 2
      )
      if (lineFeatures.length > 0) {
        targetFeature = lineFeatures.reduce((prev: any, curr: any) => {
          const prevLen = prev.geometry?.coordinates?.length || 0
          const currLen = curr.geometry?.coordinates?.length || 0
          return currLen > prevLen ? curr : prev
        })
      }
    }

    if (targetFeature && targetFeature.geometry) {
      const geom = targetFeature.geometry
      if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
        rawCoords = geom.coordinates.map((pt: any) => [Number(pt[0]), Number(pt[1])])
      } else if (geom.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
        rawCoords = geom.coordinates.flat(1).map((pt: any) => [Number(pt[0]), Number(pt[1])])
      }
    }
  } else if (parsed.type === 'Feature') {
    const geom = parsed.geometry
    if (geom?.type === 'LineString' && Array.isArray(geom.coordinates)) {
      rawCoords = geom.coordinates.map((pt: any) => [Number(pt[0]), Number(pt[1])])
    } else if (geom?.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
      rawCoords = geom.coordinates.flat(1).map((pt: any) => [Number(pt[0]), Number(pt[1])])
    }
  } else if (parsed.type?.toLowerCase() === 'linestring' && Array.isArray(parsed.coordinates)) {
    rawCoords = parsed.coordinates.map((pt: any) => [Number(pt[0]), Number(pt[1])])
  }

  return rawCoords
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
