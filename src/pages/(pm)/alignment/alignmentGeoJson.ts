import { SegmentItem } from './types'
import { SEGMENT_COLORS } from './alignmentData'
import { getSubLineCoordinates, interpolateCoordAtKm } from './alignmentGeometryHelpers'

// Helper tính toán đa giác dải mặt đường (Road Ribbon Polygon) với kỹ thuật Bo chuyển tiếp (Tapering S-curve & Miter Bisector Join)
export function generateRoadRibbonPolygon(
  coords: [number, number][],
  widthM: number,
  prevWidthM?: number,
  nextWidthM?: number,
  prevPoint?: [number, number],
  nextPoint?: [number, number]
): [number, number][] {
  if (!coords || coords.length < 2) return []

  const currentW = Math.max(1.5, Math.min(60.0, widthM || 8.0))
  const latMid = coords[0][1]
  const metersPerDegLat = 111320
  const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

  // 1. Tính cự ly tích lũy dọc theo tim tuyến của phân đoạn
  const cumDists: number[] = [0]
  for (let i = 0; i < coords.length - 1; i++) {
    const dx = (coords[i + 1][0] - coords[i][0]) * metersPerDegLng
    const dy = (coords[i + 1][1] - coords[i][1]) * metersPerDegLat
    cumDists.push(cumDists[i] + (Math.sqrt(dx * dx + dy * dy) || 0.001))
  }
  const totalLenM = cumDists[cumDists.length - 1]
  if (totalLenM <= 0.2) return []

  // 2. Xác định các vùng vuốt nối chuyển tiếp (Taper Transition)
  const needTaperStart =
    prevWidthM !== undefined &&
    Math.abs(prevWidthM - currentW) > 0.1 &&
    currentW > prevWidthM

  const needTaperEnd =
    nextWidthM !== undefined &&
    Math.abs(nextWidthM - currentW) > 0.1 &&
    currentW > nextWidthM

  const maxTaperDist = Math.min(30.0, totalLenM * 0.35)
  const taperStartDist = needTaperStart ? maxTaperDist : 0
  const taperEndDist = needTaperEnd ? maxTaperDist : 0

  // 3. Hàm nội suy tọa độ [lng, lat] theo cự ly mét
  const interpolateCoord = (targetD: number): [number, number] => {
    if (targetD <= 0) return coords[0]
    if (targetD >= totalLenM) return coords[coords.length - 1]
    for (let i = 0; i < cumDists.length - 1; i++) {
      if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
        const span = cumDists[i + 1] - cumDists[i]
        if (span <= 1e-6) return coords[i]
        const t = (targetD - cumDists[i]) / span
        const lng = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
        const lat = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
        return [Number(lng.toFixed(7)), Number(lat.toFixed(7))]
      }
    }
    return coords[coords.length - 1]
  }

  // 4. Sinh các mốc khoảng cách (milestones) dày dặn tại vùng vuốt nối để đường cong bo tròn mượt mà
  const milestones: number[] = [...cumDists]

  if (needTaperStart && taperStartDist > 2.0) {
    const fractions = [0.15, 0.35, 0.55, 0.75, 0.90]
    fractions.forEach((f) => {
      const d = taperStartDist * f
      if (d > 0.5 && d < taperStartDist - 0.5) milestones.push(d)
    })
  }

  if (needTaperEnd && taperEndDist > 2.0) {
    const fractions = [0.15, 0.35, 0.55, 0.75, 0.90]
    fractions.forEach((f) => {
      const d = totalLenM - taperEndDist * f
      if (d > totalLenM - taperEndDist + 0.5 && d < totalLenM - 0.5) milestones.push(d)
    })
  }

  milestones.sort((a, b) => a - b)
  const uniqueDists: number[] = [milestones[0]]
  for (let i = 1; i < milestones.length; i++) {
    if (milestones[i] - uniqueDists[uniqueDists.length - 1] > 0.25) {
      uniqueDists.push(milestones[i])
    }
  }

  const denseCoords: [number, number][] = uniqueDists.map((d) => interpolateCoord(d))
  const K = denseCoords.length

  // 5. Tính toán vector pháp tuyến phân giác (Miter Bisector Normal) & bề rộng tại từng điểm
  const leftCoords: [number, number][] = []
  const rightCoords: [number, number][] = []

  for (let j = 0; j < K; j++) {
    const s = uniqueDists[j]
    const pt = denseCoords[j]

    // Bề rộng w theo hàm Hermite S-curve bo cong
    let w = currentW
    if (needTaperStart && s < taperStartDist) {
      const t = Math.max(0, Math.min(1, s / taperStartDist))
      const smoothFactor = t * t * (3 - 2 * t)
      w = prevWidthM! + (currentW - prevWidthM!) * smoothFactor
    } else if (needTaperEnd && s > totalLenM - taperEndDist) {
      const t = Math.max(0, Math.min(1, (totalLenM - s) / taperEndDist))
      const smoothFactor = t * t * (3 - 2 * t)
      w = nextWidthM! + (currentW - nextWidthM!) * smoothFactor
    }

    let vinX = 0, vinY = 0, voutX = 0, voutY = 0

    if (j === 0) {
      if (prevPoint) {
        vinX = (pt[0] - prevPoint[0]) * metersPerDegLng
        vinY = (pt[1] - prevPoint[1]) * metersPerDegLat
      } else {
        vinX = (denseCoords[1][0] - pt[0]) * metersPerDegLng
        vinY = (denseCoords[1][1] - pt[1]) * metersPerDegLat
      }
      voutX = (denseCoords[1][0] - pt[0]) * metersPerDegLng
      voutY = (denseCoords[1][1] - pt[1]) * metersPerDegLat
    } else if (j === K - 1) {
      vinX = (pt[0] - denseCoords[j - 1][0]) * metersPerDegLng
      vinY = (pt[1] - denseCoords[j - 1][1]) * metersPerDegLat
      if (nextPoint) {
        voutX = (nextPoint[0] - pt[0]) * metersPerDegLng
        voutY = (nextPoint[1] - pt[1]) * metersPerDegLat
      } else {
        voutX = vinX
        voutY = vinY
      }
    } else {
      vinX = (pt[0] - denseCoords[j - 1][0]) * metersPerDegLng
      vinY = (pt[1] - denseCoords[j - 1][1]) * metersPerDegLat
      voutX = (denseCoords[j + 1][0] - pt[0]) * metersPerDegLng
      voutY = (denseCoords[j + 1][1] - pt[1]) * metersPerDegLat
    }

    const lenIn = Math.sqrt(vinX * vinX + vinY * vinY) || 1
    const lenOut = Math.sqrt(voutX * voutX + voutY * voutY) || 1
    const uInX = vinX / lenIn, uInY = vinY / lenIn
    const uOutX = voutX / lenOut, uOutY = voutY / lenOut

    const tanX = uInX + uOutX
    const tanY = uInY + uOutY
    const tanLen = Math.sqrt(tanX * tanX + tanY * tanY)

    let normX = -uOutY
    let normY = uOutX
    let miterScale = 1.0

    if (tanLen > 1e-4) {
      const tNormX = tanX / tanLen
      const tNormY = tanY / tanLen
      normX = -tNormY
      normY = tNormX

      const cosHalf = normX * (-uOutY) + normY * uOutX
      if (cosHalf > 0.4) {
        miterScale = Math.min(1.35, 1.0 / cosHalf)
      }
    }

    const halfW = (w / 2.0) * miterScale
    const offLng = (normX * halfW) / metersPerDegLng
    const offLat = (normY * halfW) / metersPerDegLat

    leftCoords.push([
      Number((pt[0] + offLng).toFixed(7)),
      Number((pt[1] + offLat).toFixed(7))
    ])
    rightCoords.push([
      Number((pt[0] - offLng).toFixed(7)),
      Number((pt[1] - offLat).toFixed(7))
    ])
  }

  return [...leftCoords, ...rightCoords.reverse(), leftCoords[0]]
}

// Helper build GeoJSON FeatureCollection cho Segments (tim tuyến LineString)
export function buildSegmentsGeoJSON(
  segList: SegmentItem[],
  coords: [number, number][],
  kmPts: number[],
  activeSegId: string | null
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = segList.map((seg, idx) => {
    const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)

    return {
      type: 'Feature',
      properties: {
        id: seg.id,
        code: seg.code,
        startKm: seg.startKm,
        endKm: seg.endKm,
        lengthKm: seg.lengthKm,
        roadWidthM: seg.roadWidthM || 8.0,
        color: seg.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length] || '#0284C7',
        isSelected: activeSegId === 'ALL' ? true : seg.id === activeSegId
      },
      geometry: {
        type: 'LineString',
        coordinates: lineCoords
      }
    }
  })

  return {
    type: 'FeatureCollection',
    features
  }
}

// Helper sinh GeoJSON bề mặt thảm đường cho từng phân đoạn theo đúng bề rộng mét roadWidthM & bo tiếp giáp
export function buildSegmentsSurfaceGeoJSON(
  segList: SegmentItem[],
  coords: [number, number][],
  kmPts: number[],
  activeSegId: string | null
): GeoJSON.FeatureCollection {
  const minKm = kmPts[0] || 1020
  const maxKm = kmPts[kmPts.length - 1] || 1045

  const features: GeoJSON.Feature[] = segList.map((seg, idx) => {
    const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)

    const prevSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.endKm - seg.startKm) < 0.005)
    const nextSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.startKm - seg.endKm) < 0.005)

    const prevPt = seg.startKm > minKm ? interpolateCoordAtKm(Math.max(minKm, seg.startKm - 0.02), coords, kmPts) : undefined
    const nextPt = seg.endKm < maxKm ? interpolateCoordAtKm(Math.min(maxKm, seg.endKm + 0.02), coords, kmPts) : undefined

    const ribbonPolygon = generateRoadRibbonPolygon(
      lineCoords,
      seg.roadWidthM || 8.0,
      prevSeg ? (prevSeg.roadWidthM || 8.0) : undefined,
      nextSeg ? (nextSeg.roadWidthM || 8.0) : undefined,
      prevPt,
      nextPt
    )

    return {
      type: 'Feature',
      properties: {
        id: seg.id,
        code: seg.code,
        startKm: seg.startKm,
        endKm: seg.endKm,
        lengthKm: seg.lengthKm,
        roadWidthM: seg.roadWidthM || 8.0,
        color: seg.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length] || '#0284C7',
        isSelected: activeSegId === 'ALL' ? true : seg.id === activeSegId
      },
      geometry: {
        type: 'Polygon',
        coordinates: [ribbonPolygon]
      }
    }
  })

  return {
    type: 'FeatureCollection',
    features
  }
}

// Helper build GeoJSON cho Hành lang quy hoạch (Margin mở rộng mỗi bên)
export function buildPlanningCorridorGeoJSON(
  coords: [number, number][],
  marginM: number = 2.0
): GeoJSON.FeatureCollection {
  const offset = 0.00015 * (marginM / 2.0)
  const topCoords = coords.map((c) => [c[0] + offset, c[1] + offset] as [number, number])
  const bottomCoords = [...coords].reverse().map((c) => [c[0] - offset, c[1] - offset] as [number, number])
  const polygon = [...topCoords, ...bottomCoords, topCoords[0]]

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: `Hành lang an toàn quy hoạch (Margin ±${marginM}m)` },
        geometry: {
          type: 'Polygon',
          coordinates: [polygon]
        }
      }
    ]
  }
}
