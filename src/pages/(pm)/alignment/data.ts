import { AssignedProjectOption, SegmentItem } from './types'
import { getSubLineCoordinates, interpolateCoordAtKm } from './alignmentGeometryHelpers'

export const SEGMENT_COLORS = [
  '#0284C7', // Sky Blue
  '#D97706', // Amber
  '#059669', // Emerald Green
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0D9488', // Teal
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#2563EB'  // Blue
]

// Tọa độ tim tuyến chuẩn QL1A Km 1020 - Km 1045 (Chuẩn hình học không có lỗi tự cắt hay khoảng hở)
export const ROUTE_COORDINATES: [number, number][] = [
  [108.0825, 16.2731], // P0 - Km 1020+000 (Huế)
  [108.1054, 16.2589], // P1 - Km 1022+500
  [108.1287, 16.2415], // P2 - Km 1025+000 (Điểm giáp Seg 1-2)
  [108.1492, 16.2238], // P3 - Km 1027+500
  [108.1695, 16.2085], // P4 - Km 1030+000
  [108.1884, 16.1843], // P5 - Km 1035+000
  [108.2152, 16.1521], // P6 - Km 1040+000
  [108.2418, 16.1215]  // P7 - Km 1045+000 (Đà Nẵng)
]

// Các mốc lý trình ứng với các điểm trên tuyến (25.0 km)
export const ROUTE_KM_POINTS = [1020, 1022.5, 1025, 1027.5, 1030, 1035, 1040, 1045]

// Danh mục dự án mà PM Đỗ Quốc Hoàng được phân công quản lý
export const PM_ASSIGNED_PROJECTS: AssignedProjectOption[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Đoạn Km 1020 đến Km 1045',
    stationOriginText: 'Km 1020+000 (1.020.000m)',
    stationOriginKm: 1020.0,
    endKm: 1045.0,
    crs: 'EPSG:32648 (UTM Zone 48N)',
    lengthKm: 25.0,
    defaultCoords: ROUTE_COORDINATES,
    defaultKmPoints: ROUTE_KM_POINTS,
    defaultManualText: `108.0825, 16.2731
108.1054, 16.2589
108.1287, 16.2415
108.1492, 16.2238
108.1695, 16.2085
108.1884, 16.1843
108.2152, 16.1521
108.2418, 16.1215`,
    defaultSegments: [
      {
        id: 'seg-1',
        code: 'Phân đoạn #01',
        startKm: 1020.0,
        endKm: 1025.0,
        lengthKm: 5.0,
        roadWidthM: 8.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[0]
      },
      {
        id: 'seg-2',
        code: 'Phân đoạn #02',
        startKm: 1025.0,
        endKm: 1030.0,
        lengthKm: 5.0,
        roadWidthM: 10.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[1]
      },
      {
        id: 'seg-3',
        code: 'Phân đoạn #03',
        startKm: 1030.0,
        endKm: 1045.0,
        lengthKm: 15.0,
        roadWidthM: 8.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[2]
      }
    ]
  },
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan',
    stationOriginText: 'Km 0+000 (0m)',
    stationOriginKm: 0.0,
    endKm: 66.0,
    crs: 'EPSG:32648 (UTM Zone 48N)',
    lengthKm: 66.0,
    defaultCoords: [
      [107.6521, 16.2912],
      [107.7214, 16.2105],
      [107.8102, 16.1423],
      [107.9056, 16.0821],
      [108.0124, 16.0354],
      [108.1189, 15.9876]
    ],
    defaultKmPoints: [0, 15, 30, 45, 55, 66],
    defaultManualText: `107.6521, 16.2912
107.7214, 16.2105
107.8102, 16.1423
107.9056, 16.0821
108.0124, 16.0354
108.1189, 15.9876`,
    defaultSegments: [
      {
        id: 'seg-lstl-1',
        code: 'Đoạn La Sơn #01',
        startKm: 0.0,
        endKm: 20.0,
        lengthKm: 20.0,
        roadWidthM: 12.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C19.0',
        color: SEGMENT_COLORS[0]
      },
      {
        id: 'seg-lstl-2',
        code: 'Đoạn Đèo Khe Tre #02',
        startKm: 20.0,
        endKm: 45.0,
        lengthKm: 25.0,
        roadWidthM: 12.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C19.0',
        color: SEGMENT_COLORS[1]
      },
      {
        id: 'seg-lstl-3',
        code: 'Đoạn Túy Loan #03',
        startKm: 45.0,
        endKm: 66.0,
        lengthKm: 21.0,
        roadWidthM: 14.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C19.0',
        color: SEGMENT_COLORS[2]
      }
    ]
  }
]

// ==========================================
// 1. Helpers GeoJSON Alignment & Ribbon
// ==========================================

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

  const cumDists: number[] = [0]
  for (let i = 0; i < coords.length - 1; i++) {
    const dx = (coords[i + 1][0] - coords[i][0]) * metersPerDegLng
    const dy = (coords[i + 1][1] - coords[i][1]) * metersPerDegLat
    cumDists.push(cumDists[i] + (Math.sqrt(dx * dx + dy * dy) || 0.001))
  }
  const totalLenM = cumDists[cumDists.length - 1]
  if (totalLenM <= 0.2) return []

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

  const leftCoords: [number, number][] = []
  const rightCoords: [number, number][] = []

  for (let j = 0; j < K; j++) {
    const s = uniqueDists[j]
    const pt = denseCoords[j]

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
      vinY = (pt[1] - denseCoords[j - 1][0]) * metersPerDegLat
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

// ==========================================
// 2. Helpers GeoJSON Slabs & Joints
// ==========================================

export interface SlabsCustomConfig {
  slabLenM?: number
  thicknessCm?: number
  contractionSpacingM?: number
  expansionSpacingM?: number
  expansionGapMm?: number
}

export function buildSlabsAndJointsGeoJSON(
  segList: SegmentItem[],
  coords: [number, number][],
  kmPts: number[],
  customCfg?: SlabsCustomConfig
): {
  slabsGeoJSON: GeoJSON.FeatureCollection
  jointsGeoJSON: GeoJSON.FeatureCollection
  edgesGeoJSON: GeoJSON.FeatureCollection
} {
  const slabLengthM = 5.0
  const slabThicknessCm = 26
  const contractionSpacingM = 5.0
  const expansionSpacingM = 50.0
  const expansionGapMm = 20

  const activeSlabLen = Math.max(1.0, customCfg?.slabLenM ?? slabLengthM)
  const activeThick = Math.max(10, customCfg?.thicknessCm ?? slabThicknessCm)
  const activeContraction = Math.max(1.0, customCfg?.contractionSpacingM ?? contractionSpacingM)
  const activeExpansion = Math.max(5.0, customCfg?.expansionSpacingM ?? expansionSpacingM)
  const activeGap = Math.max(5, customCfg?.expansionGapMm ?? expansionGapMm)

  const slabFeatures: GeoJSON.Feature[] = []
  const jointFeatures: GeoJSON.Feature[] = []
  const edgeFeatures: GeoJSON.Feature[] = []

  let globalSlabIndex = 1

  segList.forEach((seg, segIdx) => {
    const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)
    if (!lineCoords || lineCoords.length < 2) return

    const latMid = lineCoords[0][1]
    const metersPerDegLat = 111320
    const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

    const cumDists: number[] = [0]
    for (let i = 0; i < lineCoords.length - 1; i++) {
      const dx = (lineCoords[i + 1][0] - lineCoords[i][0]) * metersPerDegLng
      const dy = (lineCoords[i + 1][1] - lineCoords[i][1]) * metersPerDegLat
      cumDists.push(cumDists[i] + (Math.sqrt(dx * dx + dy * dy) || 0.001))
    }
    const totalLenM = cumDists[cumDists.length - 1]
    if (totalLenM <= 0.5) return

    const interpolateCoord = (targetD: number): [number, number] => {
      if (targetD <= 0) return lineCoords[0]
      if (targetD >= totalLenM) return lineCoords[lineCoords.length - 1]
      for (let i = 0; i < cumDists.length - 1; i++) {
        if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
          const span = cumDists[i + 1] - cumDists[i]
          if (span <= 1e-6) return lineCoords[i]
          const t = (targetD - cumDists[i]) / span
          const lng = lineCoords[i][0] + t * (lineCoords[i + 1][0] - lineCoords[i][0])
          const lat = lineCoords[i][1] + t * (lineCoords[i + 1][1] - lineCoords[i][1])
          return [Number(lng.toFixed(7)), Number(lat.toFixed(7))]
        }
      }
      return lineCoords[lineCoords.length - 1]
    }

    const prevSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.endKm - seg.startKm) < 0.005)
    const nextSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.startKm - seg.endKm) < 0.005)
    const currentW = Math.max(2.0, Math.min(60.0, seg.roadWidthM || 8.0))
    const prevW = prevSeg ? (prevSeg.roadWidthM || 8.0) : currentW
    const nextW = nextSeg ? (nextSeg.roadWidthM || 8.0) : currentW

    const maxTaperDist = Math.min(30.0, totalLenM * 0.35)
    const needTaperStart = currentW > prevW
    const needTaperEnd = currentW > nextW

    const getWidthAtDist = (s: number): number => {
      if (needTaperStart && s < maxTaperDist) {
        const t = Math.max(0, Math.min(1, s / maxTaperDist))
        return prevW + (currentW - prevW) * (t * t * (3 - 2 * t))
      }
      if (needTaperEnd && s > totalLenM - maxTaperDist) {
        const t = Math.max(0, Math.min(1, (totalLenM - s) / maxTaperDist))
        return nextW + (currentW - nextW) * (t * t * (3 - 2 * t))
      }
      return currentW
    }

    const getNormalAtDist = (s: number): [number, number] => {
      const delta = 1.0
      const p1 = interpolateCoord(Math.max(0, s - delta))
      const p2 = interpolateCoord(Math.min(totalLenM, s + delta))
      const dx = (p2[0] - p1[0]) * metersPerDegLng
      const dy = (p2[1] - p1[1]) * metersPerDegLat
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      return [-dy / len, dx / len]
    }

    const slabLenM = activeSlabLen
    const maxSteps = Math.min(400, Math.floor(totalLenM / slabLenM))
    const expRatio = Math.max(1, Math.round(activeExpansion / slabLenM))

    for (let i = 0; i < maxSteps; i++) {
      const d0 = i * slabLenM
      const d1 = Math.min(totalLenM, (i + 1) * slabLenM)

      const c0 = interpolateCoord(d0)
      const c1 = interpolateCoord(d1)

      const w0 = getWidthAtDist(d0)
      const w1 = getWidthAtDist(d1)

      const norm0 = getNormalAtDist(d0)
      const norm1 = getNormalAtDist(d1)

      const h0 = w0 / 2.0
      const h1 = w1 / 2.0

      const left0: [number, number] = [
        Number((c0[0] + (norm0[0] * h0) / metersPerDegLng).toFixed(7)),
        Number((c0[1] + (norm0[1] * h0) / metersPerDegLat).toFixed(7))
      ]
      const left1: [number, number] = [
        Number((c1[0] + (norm1[0] * h1) / metersPerDegLng).toFixed(7)),
        Number((c1[1] + (norm1[1] * h1) / metersPerDegLat).toFixed(7))
      ]
      const right0: [number, number] = [
        Number((c0[0] - (norm0[0] * h0) / metersPerDegLng).toFixed(7)),
        Number((c0[1] - (norm0[1] * h0) / metersPerDegLat).toFixed(7))
      ]
      const right1: [number, number] = [
        Number((c1[0] - (norm1[0] * h1) / metersPerDegLng).toFixed(7)),
        Number((c1[1] - (norm1[1] * h1) / metersPerDegLat).toFixed(7))
      ]

      const slabNum = String(globalSlabIndex).padStart(3, '0')
      const kmPos = seg.startKm + d0 / 1000
      const floorKm = Math.floor(kmPos)
      const meters = Math.round((kmPos - floorKm) * 1000)
      const kmStation = `${floorKm}+${String(meters).padStart(3, '0')}`

      slabFeatures.push({
        type: 'Feature',
        properties: {
          id: `SLAB-${slabNum}L`,
          code: `SLAB-${slabNum}L`,
          lane: 'Làn Trái',
          segmentCode: seg.code,
          station: `Km ${kmStation}`,
          lengthM: Number(slabLenM.toFixed(1)),
          widthM: Number(h0.toFixed(1)),
          thicknessCm: activeThick,
          edgeOffset: `Mép Trái: -${h0.toFixed(1)}m`,
          status: i % 11 === 0 ? 'CRACKED' : 'GOOD'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[left0, c0, c1, left1, left0]]
        }
      })

      slabFeatures.push({
        type: 'Feature',
        properties: {
          id: `SLAB-${slabNum}R`,
          code: `SLAB-${slabNum}R`,
          lane: 'Làn Phải',
          segmentCode: seg.code,
          station: `Km ${kmStation}`,
          lengthM: Number(slabLenM.toFixed(1)),
          widthM: Number(h0.toFixed(1)),
          thicknessCm: activeThick,
          edgeOffset: `Mép Phải: +${h0.toFixed(1)}m`,
          status: i % 13 === 0 ? 'CRACKED' : 'GOOD'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[c0, right0, right1, c1, c0]]
        }
      })

      globalSlabIndex++

      const isExpansion = i % expRatio === 0
      jointFeatures.push({
        type: 'Feature',
        properties: {
          id: isExpansion ? `EJ-${segIdx + 1}-${Math.floor(i / expRatio) + 1}` : `CJ-${segIdx + 1}-${i + 1}`,
          isExpansion,
          name: isExpansion ? `Khe giãn nở nhiệt ${activeGap}mm (Expansion Joint)` : `Khe co giãn ${activeContraction}m (Contraction Joint)`,
          label: isExpansion ? `⚡ Khe giãn ${activeGap}mm` : `Khe co ${activeContraction}m`,
          station: `Km ${kmStation}`,
          roadWidthM: Number(w0.toFixed(1)),
          description: isExpansion
            ? `Khe giãn nở nhiệt ${activeGap}mm, cự ly ${activeExpansion}m, đệm bitum cao su đàn hồi & thanh truyền lực trượt bọc ống nhựa PVC`
            : `Khe co ngót ${activeContraction}m, cắt sâu 5cm, chèn mastic & thanh truyền lực dowel bar phi 25`
        },
        geometry: {
          type: 'LineString',
          coordinates: [left0, right0]
        }
      })

      if (isExpansion || i === 0 || i === 4) {
        edgeFeatures.push({
          type: 'Feature',
          properties: {
            isDimensionLine: true,
            label: `W = ${w0.toFixed(1)}m`
          },
          geometry: {
            type: 'LineString',
            coordinates: [left0, right0]
          }
        })

        edgeFeatures.push({
          type: 'Feature',
          properties: {
            side: 'LEFT',
            label: `Mép Trái: -${h0.toFixed(1)}m`,
            widthM: Number(h0.toFixed(1))
          },
          geometry: {
            type: 'Point',
            coordinates: left0
          }
        })

        edgeFeatures.push({
          type: 'Feature',
          properties: {
            side: 'RIGHT',
            label: `Mép Phải: +${h0.toFixed(1)}m`,
            widthM: Number(h0.toFixed(1))
          },
          geometry: {
            type: 'Point',
            coordinates: right0
          }
        })

        if (isExpansion || i === 0) {
          edgeFeatures.push({
            type: 'Feature',
            properties: {
              side: 'CENTER',
              label: `Bề rộng W = ${w0.toFixed(1)}m (Trái -${h0.toFixed(1)}m | Phải +${h0.toFixed(1)}m)`,
              widthM: Number(w0.toFixed(1))
            },
            geometry: {
              type: 'Point',
              coordinates: c0
            }
          })
        }
      }
    }
  })

  return {
    slabsGeoJSON: { type: 'FeatureCollection', features: slabFeatures },
    jointsGeoJSON: { type: 'FeatureCollection', features: jointFeatures },
    edgesGeoJSON: { type: 'FeatureCollection', features: edgeFeatures }
  }
}
