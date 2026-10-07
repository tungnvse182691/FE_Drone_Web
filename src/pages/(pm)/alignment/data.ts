import { AssignedProjectOption, SegmentItem } from './types'
import {
  calculateCoordsLengthKm,
  getSubLineCoordinates,
  interpolateCoordAtKm,
  smoothRoadPolyline
} from './alignmentGeometryHelpers'

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
        statusText: 'HỢP LỆ',
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
        statusText: 'HỢP LỆ',
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
        statusText: 'HỢP LỆ',
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
        statusText: 'HỢP LỆ',
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
        statusText: 'HỢP LỆ',
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
        statusText: 'HỢP LỆ',
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

// Tính vector pháp tuyến chuẩn hóa toàn cục tại mốc lý trình km để đảm bảo 100% khớp mép giữa các phân đoạn
export function getAlignmentNormalAtKm(
  km: number,
  coords: [number, number][],
  kmPts: number[],
  metersPerDegLng: number,
  metersPerDegLat: number
): { normX: number; normY: number } {
  if (!coords || coords.length < 2 || !kmPts || kmPts.length < 2) {
    return { normX: 0, normY: 1 }
  }
  const minKm = kmPts[0]
  const maxKm = kmPts[kmPts.length - 1]
  const stepKm = 0.002 // cự ly mẫu ±2m dọc theo tim tuyến
  const pBack = interpolateCoordAtKm(Math.max(minKm, km - stepKm), coords, kmPts)
  const pFwd = interpolateCoordAtKm(Math.min(maxKm, km + stepKm), coords, kmPts)
  const dx = (pFwd[0] - pBack[0]) * metersPerDegLng
  const dy = (pFwd[1] - pBack[1]) * metersPerDegLat
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return {
    normX: -dy / len,
    normY: dx / len
  }
}

export function generateRoadRibbonPolygon(
  coords: [number, number][],
  widthM: number,
  prevWidthM?: number,
  nextWidthM?: number,
  prevPoint?: [number, number],
  nextPoint?: [number, number],
  startNormal?: { normX: number; normY: number },
  endNormal?: { normX: number; normY: number }
): [number, number][] {
  if (!coords || coords.length < 2) return []

  // 1. Lọc bỏ các điểm liên tiếp có khoảng cách quá nhỏ (< 0.35m) để tránh nhiễu vector tiếp tuyến
  const latMid = coords[0][1]
  const metersPerDegLat = 111320
  const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

  const cleanCoords: [number, number][] = [coords[0]]
  for (let i = 1; i < coords.length; i++) {
    const dx = (coords[i][0] - cleanCoords[cleanCoords.length - 1][0]) * metersPerDegLng
    const dy = (coords[i][1] - cleanCoords[cleanCoords.length - 1][1]) * metersPerDegLat
    if (Math.sqrt(dx * dx + dy * dy) >= 0.35 || i === coords.length - 1) {
      cleanCoords.push(coords[i])
    }
  }
  if (cleanCoords.length < 2) return []

  const currentW = Math.max(1.5, Math.min(60.0, widthM || 8.0))

  const cumDists: number[] = [0]
  for (let i = 0; i < cleanCoords.length - 1; i++) {
    const dx = (cleanCoords[i + 1][0] - cleanCoords[i][0]) * metersPerDegLng
    const dy = (cleanCoords[i + 1][1] - cleanCoords[i][1]) * metersPerDegLat
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
    if (targetD <= 0) return cleanCoords[0]
    if (targetD >= totalLenM) return cleanCoords[cleanCoords.length - 1]
    for (let i = 0; i < cumDists.length - 1; i++) {
      if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
        const span = cumDists[i + 1] - cumDists[i]
        if (span <= 1e-6) return cleanCoords[i]
        const t = (targetD - cumDists[i]) / span
        const lng = cleanCoords[i][0] + t * (cleanCoords[i + 1][0] - cleanCoords[i][0])
        const lat = cleanCoords[i][1] + t * (cleanCoords[i + 1][1] - cleanCoords[i][1])
        return [Number(lng.toFixed(7)), Number(lat.toFixed(7))]
      }
    }
    return cleanCoords[cleanCoords.length - 1]
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
  if (K < 2) return []

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
      vinY = (pt[1] - denseCoords[j - 1][0]) * metersPerDegLat
      voutX = (denseCoords[j + 1][0] - pt[0]) * metersPerDegLng
      voutY = (denseCoords[j + 1][1] - pt[1]) * metersPerDegLat
    }

    const lenIn = Math.sqrt(vinX * vinX + vinY * vinY) || 1
    const lenOut = Math.sqrt(voutX * voutX + voutY * voutY) || 1
    const uInX = vinX / lenIn, uInY = vinY / lenIn
    const uOutX = voutX / lenOut, uOutY = voutY / lenOut

    let normX = 0
    let normY = 0
    let miterScale = 1.0

    if (j === 0) {
      // Đầu đoạn: Cắt ngang vuông góc 90 độ phẳng hoàn toàn với hướng xuất phát uOut
      if (startNormal) {
        normX = startNormal.normX
        normY = startNormal.normY
      } else {
        normX = -uOutY
        normY = uOutX
      }
      miterScale = 1.0
    } else if (j === K - 1) {
      // Cuối đoạn: Cắt ngang vuông góc 90 độ phẳng hoàn toàn với hướng tới uIn (triệt tiêu mọi góc vát chéo lung tung)
      if (endNormal) {
        normX = endNormal.normX
        normY = endNormal.normY
      } else {
        normX = -uInY
        normY = uInX
      }
      miterScale = 1.0
    } else {
      // Đỉnh trung gian: Tính vector pháp tuyến trung bình và kiểm tra chống xoắn mép (anti-twist)
      const normInX = -uInY, normInY = uInX
      const normOutX = -uOutY, normOutY = uOutX
      const avgNormX = normInX + normOutX
      const avgNormY = normInY + normOutY
      const avgLen = Math.sqrt(avgNormX * avgNormX + avgNormY * avgNormY) || 0.001

      // Kiểm tra góc cua uIn và uOut
      const dotTurn = uInX * uOutX + uInY * uOutY
      if (dotTurn < 0.25 || avgLen < 0.4) {
        // Cua gắt > 75 độ: dùng trực tiếp pháp tuyến đoạn tới để chống vẹo/chéo cánh bướm
        normX = normInX
        normY = normInY
        miterScale = 1.0
      } else {
        normX = avgNormX / avgLen
        normY = avgNormY / avgLen
        const cosAngle = normX * normOutX + normY * normOutY
        miterScale = cosAngle > 0.5 ? Math.min(1.25, 1.0 / cosAngle) : 1.0
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
  const features: GeoJSON.Feature[] = []

  segList.forEach((seg, idx) => {
    const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)

    // 1. Tim tuyến phân đoạn
    features.push({
      type: 'Feature',
      properties: {
        id: seg.id,
        code: seg.code,
        startKm: seg.startKm,
        endKm: seg.endKm,
        lengthKm: seg.lengthKm,
        roadWidthM: seg.roadWidthM || 8.0,
        color: seg.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length] || '#0284C7',
        isSelected: activeSegId === 'ALL' ? true : seg.id === activeSegId,
        isLine: true,
        isLabelPoint: false
      },
      geometry: {
        type: 'LineString',
        coordinates: lineCoords
      }
    })

    // 2. Điểm nhãn nằm bên ngoài mép đường (tránh bị che bởi tấm BTXM hay tim đường)
    if (coords.length >= 2 && kmPts.length >= 2) {
      const midKm = (seg.startKm + seg.endKm) / 2
      const centerPt = interpolateCoordAtKm(midKm, coords, kmPts)
      const pPrev = interpolateCoordAtKm(Math.max(kmPts[0], midKm - 0.02), coords, kmPts)
      const pNext = interpolateCoordAtKm(Math.min(kmPts[kmPts.length - 1], midKm + 0.02), coords, kmPts)

      const latMid = centerPt[1]
      const mPerDegLat = 111320
      const mPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))
      const dx = (pNext[0] - pPrev[0]) * mPerDegLng
      const dy = (pNext[1] - pPrev[1]) * mPerDegLat
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001

      const normX = -dy / len
      const normY = dx / len
      // Đẩy ra ngoài mép đường: nửa bề rộng + 3.2m ra lề ngoài
      const offsetM = ((seg.roadWidthM || 8.0) / 2.0) + 3.2
      const labelLng = Number((centerPt[0] + (normX * offsetM) / mPerDegLng).toFixed(7))
      const labelLat = Number((centerPt[1] + (normY * offsetM) / mPerDegLat).toFixed(7))

      features.push({
        type: 'Feature',
        properties: {
          id: `label-${seg.id}`,
          segmentId: seg.id,
          code: seg.code,
          isLine: false,
          isLabelPoint: true
        },
        geometry: {
          type: 'Point',
          coordinates: [labelLng, labelLat]
        }
      })
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

  const features: GeoJSON.Feature[] = []

  segList.forEach((seg, idx) => {
    const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)
    if (!lineCoords || lineCoords.length < 2) return

    const prevSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.endKm - seg.startKm) < 0.005)
    const nextSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.startKm - seg.endKm) < 0.005)

    const prevPt = seg.startKm > minKm ? interpolateCoordAtKm(Math.max(minKm, seg.startKm - 0.02), coords, kmPts) : undefined
    const nextPt = seg.endKm < maxKm ? interpolateCoordAtKm(Math.min(maxKm, seg.endKm + 0.02), coords, kmPts) : undefined

    const latMid = coords[0] ? coords[0][1] : 16.0
    const metersPerDegLat = 111320
    const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

    const startNorm = getAlignmentNormalAtKm(seg.startKm, coords, kmPts, metersPerDegLng, metersPerDegLat)
    const endNorm = getAlignmentNormalAtKm(seg.endKm, coords, kmPts, metersPerDegLng, metersPerDegLat)

    let ribbonPolygon = generateRoadRibbonPolygon(
      lineCoords,
      seg.roadWidthM || 8.0,
      prevSeg ? (prevSeg.roadWidthM || 8.0) : undefined,
      nextSeg ? (nextSeg.roadWidthM || 8.0) : undefined,
      prevPt,
      nextPt,
      startNorm,
      endNorm
    )

    // Fallback: nếu thuật toán trả về < 4 điểm, tự tạo dải dải phẳng chuẩn trực tiếp từ lineCoords
    if (!ribbonPolygon || ribbonPolygon.length < 4) {
      const halfW = (seg.roadWidthM || 8.0) / 2.0
      const left: [number, number][] = []
      const right: [number, number][] = []
      for (let k = 0; k < lineCoords.length; k++) {
        const pt = lineCoords[k]
        const nextK = lineCoords[Math.min(lineCoords.length - 1, k + 1)]
        const prevK = lineCoords[Math.max(0, k - 1)]
        const dLng = (nextK[0] - prevK[0]) * metersPerDegLng
        const dLat = (nextK[1] - prevK[1]) * metersPerDegLat
        const dLen = Math.sqrt(dLng * dLng + dLat * dLat) || 1
        const nX = -dLat / dLen
        const nY = dLng / dLen
        left.push([
          Number((pt[0] + (nX * halfW) / metersPerDegLng).toFixed(7)),
          Number((pt[1] + (nY * halfW) / metersPerDegLat).toFixed(7))
        ])
        right.push([
          Number((pt[0] - (nX * halfW) / metersPerDegLng).toFixed(7)),
          Number((pt[1] - (nY * halfW) / metersPerDegLat).toFixed(7))
        ])
      }
      ribbonPolygon = [...left, ...right.reverse(), left[0]]
    }

    if (ribbonPolygon && ribbonPolygon.length >= 4) {
      features.push({
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
      })
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

export function getBranchLineCoords(
  startKm: number,
  endKm: number,
  bCoords: [number, number][],
  totalLenKm: number
): [number, number][] {
  if (!bCoords || bCoords.length < 2) return []
  if (startKm <= 0 && endKm >= totalLenKm) return bCoords

  const latMid = bCoords[0][1]
  const mLat = 111320
  const mLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

  const cumDists: number[] = [0]
  for (let i = 0; i < bCoords.length - 1; i++) {
    const dx = (bCoords[i + 1][0] - bCoords[i][0]) * mLng
    const dy = (bCoords[i + 1][1] - bCoords[i][1]) * mLat
    cumDists.push(cumDists[i] + (Math.sqrt(dx * dx + dy * dy) || 0.001))
  }
  const fullM = cumDists[cumDists.length - 1]
  if (fullM <= 0.5) return bCoords

  const startM = Math.max(0, (startKm / Math.max(0.001, totalLenKm)) * fullM)
  const endM = Math.min(fullM, (endKm / Math.max(0.001, totalLenKm)) * fullM)

  const interp = (targetM: number): [number, number] => {
    if (targetM <= 0) return bCoords[0]
    if (targetM >= fullM) return bCoords[bCoords.length - 1]
    for (let i = 0; i < cumDists.length - 1; i++) {
      if (targetM >= cumDists[i] && targetM <= cumDists[i + 1]) {
        const span = cumDists[i + 1] - cumDists[i]
        if (span <= 1e-6) return bCoords[i]
        const t = (targetM - cumDists[i]) / span
        return [
          Number((bCoords[i][0] + t * (bCoords[i + 1][0] - bCoords[i][0])).toFixed(7)),
          Number((bCoords[i][1] + t * (bCoords[i + 1][1] - bCoords[i][1])).toFixed(7))
        ]
      }
    }
    return bCoords[bCoords.length - 1]
  }

  const result: [number, number][] = [interp(startM)]
  for (let i = 0; i < cumDists.length; i++) {
    if (cumDists[i] > startM && cumDists[i] < endM) {
      result.push(bCoords[i])
    }
  }
  result.push(interp(endM))
  return result
}

export function buildSlabsAndJointsGeoJSON(
  segList: SegmentItem[],
  coords: [number, number][],
  kmPts: number[],
  customCfg?: SlabsCustomConfig,
  branchList: any[] = []
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

  // 1. SINH TẤM & KHE CHO TRỤC CHÍNH
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
      const kmAtS = seg.startKm + (s / Math.max(0.001, totalLenM)) * (seg.endKm - seg.startKm)
      const norm = getAlignmentNormalAtKm(kmAtS, coords, kmPts, metersPerDegLng, metersPerDegLat)
      return [norm.normX, norm.normY]
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
          segmentId: seg.id,
          lane: 'Làn Trái',
          roadWidthM: Number(w0.toFixed(1)),
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
          segmentId: seg.id,
          lane: 'Làn Phải',
          roadWidthM: Number(w0.toFixed(1)),
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
          segmentId: seg.id,
          segmentCode: seg.code,
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

  // 2. SINH ĐẦY ĐỦ TẤM BÊ TÔNG, KHE CO, KHE GIÃN & THÔNG SỐ 2 MÉP CHO CÁC TUYẾN NHÁNH PHỤ
  branchList.forEach((br) => {
    let branchCoords: [number, number][] = br.coords
    const branchStation = br.branchStationKm || kmPts[0] || 1020

    if (!branchCoords || branchCoords.length < 2) {
      if (coords.length >= 2) {
        const startPt = interpolateCoordAtKm(branchStation, coords, kmPts)
        const stepAheadKm = Math.min(branchStation + 0.1, kmPts[kmPts.length - 1] || branchStation + 0.1)
        const nextPt = interpolateCoordAtKm(stepAheadKm, coords, kmPts)

        const dx = nextPt[0] - startPt[0]
        const dy = nextPt[1] - startPt[1]
        const len = Math.sqrt(dx * dx + dy * dy) || 0.001
        const ux = dx / len
        const uy = dy / len

        const sign = br.direction === 'LEFT' ? -1 : 1
        const perpX = uy * sign
        const perpY = -ux * sign

        const angleUx = ux * 0.707 + perpX * 0.707
        const angleUy = uy * 0.707 + perpY * 0.707

        const targetLenKm = br.lengthKm || 1.85
        const latMid = startPt[1]
        const metersPerDegLat = 111320
        const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

        const totalMeters = targetLenKm * 1000
        const deltaX = (angleUx * totalMeters) / metersPerDegLng
        const deltaY = (angleUy * totalMeters) / metersPerDegLat

        const midPt: [number, number] = [
          Number((startPt[0] + deltaX * 0.45).toFixed(7)),
          Number((startPt[1] + deltaY * 0.45).toFixed(7))
        ]
        const endPt: [number, number] = [
          Number((startPt[0] + deltaX).toFixed(7)),
          Number((startPt[1] + deltaY).toFixed(7))
        ]
        branchCoords = [startPt, midPt, endPt]
      }
    }

    if (!branchCoords || branchCoords.length < 2) return
    branchCoords = smoothRoadPolyline(branchCoords)
    const actualBranchKm = calculateCoordsLengthKm(branchCoords) || br.lengthKm || 1.0
    const maxSegKm = Math.max(actualBranchKm, ...(br.segments || []).map((s: any) => s.endKm || 0))
    const totalBranchKm = Math.max(0.01, maxSegKm)

    const brSegments: any[] = (br.segments && br.segments.length > 0)
      ? br.segments
      : [{
          id: `br-seg-${br.id}-01`,
          code: `${br.code} - Toàn tuyến`,
          startKm: 0.0,
          endKm: totalBranchKm,
          lengthKm: totalBranchKm,
          roadWidthM: br.roadWidthM || 8.0
        }]

    brSegments.forEach((seg: any, segIdx: number) => {
      const lineCoords = getBranchLineCoords(seg.startKm, seg.endKm, branchCoords, totalBranchKm)
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

      const interp = (targetD: number): [number, number] => {
        if (targetD <= 0) return lineCoords[0]
        if (targetD >= totalLenM) return lineCoords[lineCoords.length - 1]
        for (let i = 0; i < cumDists.length - 1; i++) {
          if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
            const span = cumDists[i + 1] - cumDists[i]
            if (span <= 1e-6) return lineCoords[i]
            const t = (targetD - cumDists[i]) / span
            return [
              Number((lineCoords[i][0] + t * (lineCoords[i + 1][0] - lineCoords[i][0])).toFixed(7)),
              Number((lineCoords[i][1] + t * (lineCoords[i + 1][1] - lineCoords[i][1])).toFixed(7))
            ]
          }
        }
        return lineCoords[lineCoords.length - 1]
      }

      const currentW = Math.max(2.0, Math.min(60.0, seg.roadWidthM || br.roadWidthM || 8.0))
      const slabLenM = activeSlabLen
      const maxSteps = Math.min(300, Math.floor(totalLenM / slabLenM))
      const expRatio = Math.max(1, Math.round(activeExpansion / slabLenM))

      const getNormalAtD = (d: number): [number, number] => {
        const dFwd = Math.min(totalLenM, d + 3.0)
        const dBack = Math.max(0, d - 3.0)
        const pF = interp(dFwd)
        const pB = interp(dBack)
        const dx = (pF[0] - pB[0]) * metersPerDegLng
        const dy = (pF[1] - pB[1]) * metersPerDegLat
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        return [-dy / len, dx / len]
      }

      for (let i = 0; i < maxSteps; i++) {
        const d0 = i * slabLenM
        const d1 = Math.min(totalLenM, (i + 1) * slabLenM)

        const c0 = interp(d0)
        const c1 = interp(d1)

        const norm0 = getNormalAtD(d0)
        const norm1 = getNormalAtD(d1)

        const h0 = currentW / 2.0
        const h1 = currentW / 2.0

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
        const kmStation = `${br.code} Km ${floorKm}+${String(meters).padStart(3, '0')}`

        slabFeatures.push({
          type: 'Feature',
          properties: {
            id: `SLAB-${br.code}-${slabNum}L`,
            code: `SLAB-${br.code}-${slabNum}L`,
            segmentId: seg.id,
            branchId: br.id,
            branchCode: br.code,
            lane: 'Làn Trái (Nhánh)',
            segmentCode: seg.code,
            roadWidthM: Number(currentW.toFixed(1)),
            station: kmStation,
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
            id: `SLAB-${br.code}-${slabNum}R`,
            code: `SLAB-${br.code}-${slabNum}R`,
            segmentId: seg.id,
            branchId: br.id,
            branchCode: br.code,
            lane: 'Làn Phải (Nhánh)',
            segmentCode: seg.code,
            roadWidthM: Number(currentW.toFixed(1)),
            station: kmStation,
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
            id: isExpansion ? `EJ-${br.code}-${segIdx + 1}-${Math.floor(i / expRatio) + 1}` : `CJ-${br.code}-${segIdx + 1}-${i + 1}`,
            segmentId: seg.id,
            segmentCode: seg.code,
            branchId: br.id,
            branchCode: br.code,
            isExpansion,
            name: isExpansion ? `Khe giãn nở nhiệt ${activeGap}mm (${br.code})` : `Khe co giãn ${activeContraction}m (${br.code})`,
            label: isExpansion ? `⚡ Khe giãn ${activeGap}mm` : `Khe co ${activeContraction}m`,
            station: kmStation,
            roadWidthM: Number(currentW.toFixed(1)),
            description: isExpansion
              ? `Khe giãn nở nhiệt ${activeGap}mm tuyến nhánh ${br.code}, cự ly ${activeExpansion}m`
              : `Khe co ngót ${activeContraction}m tuyến nhánh ${br.code}, cắt sâu 5cm`
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
              label: `W = ${currentW.toFixed(1)}m`
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
                label: `Bề rộng W = ${currentW.toFixed(1)}m (Trái -${h0.toFixed(1)}m | Phải +${h0.toFixed(1)}m)`,
                widthM: Number(currentW.toFixed(1))
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
  })

  return {
    slabsGeoJSON: { type: 'FeatureCollection', features: slabFeatures },
    jointsGeoJSON: { type: 'FeatureCollection', features: jointFeatures },
    edgesGeoJSON: { type: 'FeatureCollection', features: edgeFeatures }
  }
}

// Xây dựng GeoJSON dải bề mặt đường Polygon cho các Tuyến nhánh (Branch Surfaces)
export function buildBranchesSurfaceGeoJSON(
  branchList: any[],
  coords: [number, number][],
  kmPts: number[],
  selectedBranchId: string | null = null
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []

  branchList.forEach((br) => {
    let branchCoords: [number, number][] = br.coords
    const branchStation = br.branchStationKm || kmPts[0] || 1020

    if (!branchCoords || branchCoords.length < 2) {
      if (coords.length >= 2) {
        const startPt = interpolateCoordAtKm(branchStation, coords, kmPts)
        const stepAheadKm = Math.min(branchStation + 0.1, kmPts[kmPts.length - 1] || branchStation + 0.1)
        const nextPt = interpolateCoordAtKm(stepAheadKm, coords, kmPts)

        const dx = nextPt[0] - startPt[0]
        const dy = nextPt[1] - startPt[1]
        const len = Math.sqrt(dx * dx + dy * dy) || 0.001
        const ux = dx / len
        const uy = dy / len

        const sign = br.direction === 'LEFT' ? -1 : 1
        const perpX = uy * sign
        const perpY = -ux * sign

        const angleUx = ux * 0.707 + perpX * 0.707
        const angleUy = uy * 0.707 + perpY * 0.707

        const targetLenKm = br.lengthKm || 1.85
        const latMid = startPt[1]
        const metersPerDegLat = 111320
        const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

        const totalMeters = targetLenKm * 1000
        const deltaX = (angleUx * totalMeters) / metersPerDegLng
        const deltaY = (angleUy * totalMeters) / metersPerDegLat

        const midPt: [number, number] = [
          Number((startPt[0] + deltaX * 0.45).toFixed(7)),
          Number((startPt[1] + deltaY * 0.45).toFixed(7))
        ]
        const endPt: [number, number] = [
          Number((startPt[0] + deltaX).toFixed(7)),
          Number((startPt[1] + deltaY).toFixed(7))
        ]
        branchCoords = [startPt, midPt, endPt]
      } else {
        branchCoords = []
      }
    }

    if (branchCoords && branchCoords.length >= 2) {
      branchCoords = smoothRoadPolyline(branchCoords)
      const actualBranchKm = calculateCoordsLengthKm(branchCoords) || br.lengthKm || 1.0
      const maxSegKm = Math.max(actualBranchKm, ...(br.segments || []).map((s: any) => s.endKm || 0))
      const totalBranchKm = Math.max(0.01, maxSegKm)

      const brSegments: any[] = (br.segments && br.segments.length > 0)
        ? br.segments
        : [{
            id: br.id,
            code: br.code,
            name: br.name,
            startKm: 0.0,
            endKm: totalBranchKm,
            lengthKm: totalBranchKm,
            roadWidthM: br.roadWidthM || 8.0,
            color: br.color || '#D97706'
          }]

      brSegments.forEach((seg: any) => {
        const segCoords = getBranchLineCoords(seg.startKm, seg.endKm, branchCoords, totalBranchKm)
        if (segCoords && segCoords.length >= 2) {
          const roadW = seg.roadWidthM || br.roadWidthM || 8.0
          let ring = generateRoadRibbonPolygon(segCoords, roadW)
          if (!ring || ring.length < 4) {
            const halfW = roadW / 2.0
            const left: [number, number][] = []
            const right: [number, number][] = []
            const latMid = segCoords[0][1]
            const mLat = 111320
            const mLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))
            for (let k = 0; k < segCoords.length; k++) {
              const pt = segCoords[k]
              const nextK = segCoords[Math.min(segCoords.length - 1, k + 1)]
              const prevK = segCoords[Math.max(0, k - 1)]
              const dLng = (nextK[0] - prevK[0]) * mLng
              const dLat = (nextK[1] - prevK[1]) * mLat
              const dLen = Math.sqrt(dLng * dLng + dLat * dLat) || 1
              const nX = -dLat / dLen
              const nY = dLng / dLen
              left.push([
                Number((pt[0] + (nX * halfW) / mLng).toFixed(7)),
                Number((pt[1] + (nY * halfW) / mLat).toFixed(7))
              ])
              right.push([
                Number((pt[0] - (nX * halfW) / mLng).toFixed(7)),
                Number((pt[1] - (nY * halfW) / mLat).toFixed(7))
              ])
            }
            ring = [...left, ...right.reverse(), left[0]]
          }

          if (ring && ring.length >= 4) {
            features.push({
              type: 'Feature',
              properties: {
                id: seg.id,
                code: seg.code,
                name: `${br.name} - ${seg.code}`,
                branchId: br.id,
                branchCode: br.code,
                startKm: seg.startKm,
                endKm: seg.endKm,
                lengthKm: seg.lengthKm,
                color: seg.color || br.color || '#D97706',
                isSelected: selectedBranchId === seg.id || selectedBranchId === br.id,
                roadWidthM: roadW,
                isBranch: true
              },
              geometry: {
                type: 'Polygon',
                coordinates: [ring]
              }
            })
          }
        }
      })
    }
  })

  return {
    type: 'FeatureCollection',
    features
  }
}

// Xây dựng GeoJSON cho tim tuyến và nhãn các Tuyến nhánh (Branch Alignments)
export function buildBranchesGeoJSON(
  branchList: any[],
  coords: [number, number][],
  kmPts: number[]
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []

  branchList.forEach((br) => {
    let branchCoords: [number, number][] = br.coords
    const branchStation = br.branchStationKm || kmPts[0] || 1020

    if (!branchCoords || branchCoords.length < 2) {
      if (coords.length >= 2) {
        const startPt = interpolateCoordAtKm(branchStation, coords, kmPts)
        const stepAheadKm = Math.min(branchStation + 0.1, kmPts[kmPts.length - 1] || branchStation + 0.1)
        const nextPt = interpolateCoordAtKm(stepAheadKm, coords, kmPts)

        const dx = nextPt[0] - startPt[0]
        const dy = nextPt[1] - startPt[1]
        const len = Math.sqrt(dx * dx + dy * dy) || 0.001
        const ux = dx / len
        const uy = dy / len

        const sign = br.direction === 'LEFT' ? -1 : 1
        const perpX = uy * sign
        const perpY = -ux * sign

        const angleUx = ux * 0.707 + perpX * 0.707
        const angleUy = uy * 0.707 + perpY * 0.707

        const targetLenKm = br.lengthKm || 1.85
        const latMid = startPt[1]
        const metersPerDegLat = 111320
        const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

        const totalMeters = targetLenKm * 1000
        const deltaX = (angleUx * totalMeters) / metersPerDegLng
        const deltaY = (angleUy * totalMeters) / metersPerDegLat

        const midPt: [number, number] = [
          Number((startPt[0] + deltaX * 0.45).toFixed(7)),
          Number((startPt[1] + deltaY * 0.45).toFixed(7))
        ]
        const endPt: [number, number] = [
          Number((startPt[0] + deltaX).toFixed(7)),
          Number((startPt[1] + deltaY).toFixed(7))
        ]
        branchCoords = [startPt, midPt, endPt]
      } else {
        branchCoords = []
      }
    }

    if (branchCoords && branchCoords.length >= 2) {
      branchCoords = smoothRoadPolyline(branchCoords)
      features.push({
        type: 'Feature',
        properties: {
          id: br.id,
          branchId: br.id,
          branchCode: br.code,
          code: br.code,
          name: br.name,
          color: br.color || '#D97706',
          roadWidthM: br.roadWidthM || 8.0,
          lengthKm: br.lengthKm,
          stationText: br.branchStationText,
          directionText: br.directionText,
          isBranch: true,
          isLine: true
        },
        geometry: {
          type: 'LineString',
          coordinates: branchCoords
        }
      })
    }
  })

  return {
    type: 'FeatureCollection',
    features
  }
}

