import { SegmentItem, SlabItem } from './types'

// Hàm nội suy tọa độ [lng, lat] theo Km lý trình
export function interpolateCoordAtKm(
  km: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number] {
  if (km <= kmPoints[0]) return coords[0]
  if (km >= kmPoints[kmPoints.length - 1]) return coords[coords.length - 1]

  for (let i = 0; i < kmPoints.length - 1; i++) {
    if (km >= kmPoints[i] && km <= kmPoints[i + 1]) {
      const span = kmPoints[i + 1] - kmPoints[i]
      if (span === 0) return coords[i]
      const t = (km - kmPoints[i]) / span
      const lng = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
      const lat = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
      return [Number(lng.toFixed(6)), Number(lat.toFixed(6))]
    }
  }
  return coords[coords.length - 1]
}

// Trích xuất chuỗi tọa độ LineString cho một phân đoạn từ startKm đến endKm
export function getSubLineCoordinates(
  startKm: number,
  endKm: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number][] {
  if (!coords || coords.length < 2) return coords || []

  // Nếu phân đoạn bao phủ toàn tuyến hoặc chỉ có 1 phân đoạn
  if (startKm <= kmPoints[0] && endKm >= kmPoints[kmPoints.length - 1]) {
    return coords
  }

  const result: [number, number][] = []
  result.push(interpolateCoordAtKm(startKm, coords, kmPoints))

  for (let i = 0; i < kmPoints.length; i++) {
    if (kmPoints[i] > startKm && kmPoints[i] < endKm) {
      result.push(coords[i])
    }
  }

  result.push(interpolateCoordAtKm(endKm, coords, kmPoints))

  // Đảm bảo LineString trong GeoJSON luôn có ít nhất 2 tọa độ hợp lệ
  if (result.length < 2) {
    return coords.slice(0, 2)
  }
  // Nếu 2 điểm đầu cuối trùng nhau, tạo độ lệch vi mô để LineString luôn render được trên MapLibre
  if (
    result.length === 2 &&
    Math.abs(result[0][0] - result[1][0]) < 1e-7 &&
    Math.abs(result[0][1] - result[1][1]) < 1e-7
  ) {
    return [result[0], [result[0][0] + 0.0001, result[0][1] + 0.0001]]
  }

  return result
}

// Hàm kiểm tra tính liên tục, khoảng hở (GAP) hoặc chồng lấn (OVERLAP) theo quy tắc v2.2 (WF-02.F04)
export function checkAndEnrichSegmentsContinuity(segs: SegmentItem[]): SegmentItem[] {
  const sorted = [...segs].sort((a, b) => a.startKm - b.startKm)
  return sorted.map((seg, idx) => {
    if (idx === 0) {
      return {
        ...seg,
        status: 'VALID',
        statusText: 'HỢP LỆ',
        hasGap: false,
        gapDistance: 0
      }
    }
    const prevEnd = sorted[idx - 1].endKm
    const curStart = seg.startKm
    const diff = Number((curStart - prevEnd).toFixed(3))

    if (diff > 0.001) {
      // Có khoảng hở giữa 2 phân đoạn (Gap)
      const gapM = Math.round(diff * 1000)
      return {
        ...seg,
        status: 'GAP_WARNING',
        statusText: `CẢNH BÁO HỞ (+${gapM}m)`,
        hasGap: true,
        gapDistance: gapM
      }
    } else if (diff < -0.001) {
      // Chồng lấn giữa 2 phân đoạn (Overlap)
      const overlapM = Math.round(Math.abs(diff) * 1000)
      return {
        ...seg,
        status: 'GAP_WARNING',
        statusText: `CHỒNG LẤN (-${overlapM}m)`,
        hasGap: true,
        gapDistance: -overlapM
      }
    } else {
      return {
        ...seg,
        status: 'VALID',
        statusText: 'HỢP LỆ',
        hasGap: false,
        gapDistance: 0
      }
    }
  })
}

// Tạo danh sách tấm Slab mẫu
export function generateMockSlabs(segmentCount: number): SlabItem[] {
  const slabs: SlabItem[] = []
  const statuses: ('GOOD' | 'CRACKED' | 'SETTLEMENT')[] = ['GOOD', 'GOOD', 'GOOD', 'GOOD', 'CRACKED', 'GOOD', 'SETTLEMENT']
  for (let i = 1; i <= 24; i++) {
    const segIdx = ((i - 1) % segmentCount) + 1
    const kmOffset = 1020 + (i * 0.2)
    slabs.push({
      id: `SLAB-${String(i).padStart(3, '0')}`,
      segmentCode: `Phân đoạn #${String(segIdx).padStart(2, '0')}`,
      stationing: `Km ${kmOffset.toFixed(3)}`,
      lengthM: 5.0,
      widthM: 3.75,
      thicknessCm: 26,
      status: statuses[i % statuses.length]
    })
  }
  return slabs
}

// Tính tổng chiều dài thực tế (km) của chuỗi tọa độ WGS84 bằng công thức Haversine
export function calculateCoordsLengthKm(coords: [number, number][]): number {
  if (!coords || coords.length < 2) return 0
  let totalMeters = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i]
    const p2 = coords[i + 1]
    const lat1 = (p1[1] * Math.PI) / 180
    const lat2 = (p2[1] * Math.PI) / 180
    const dLat = ((p2[1] - p1[1]) * Math.PI) / 180
    const dLng = ((p2[0] - p1[0]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    totalMeters += 6371000 * c
  }
  return parseFloat((totalMeters / 1000).toFixed(3))
}

// Chiếu một điểm tọa độ bất kỳ [lng, lat] lên tim tuyến chính để tìm lý trình Km chuẩn xác nhất
export function calculateStationFromCoordinate(
  point: [number, number],
  coords: [number, number][],
  kmPoints: number[]
): { km: number; stationText: string; distanceMeters: number } {
  if (!coords || coords.length === 0 || !kmPoints || kmPoints.length === 0) {
    return { km: 0, stationText: 'Km 0+000', distanceMeters: 0 }
  }
  if (coords.length === 1) {
    const km = kmPoints[0] || 0
    const kmInt = Math.floor(km)
    const m = Math.round((km - kmInt) * 1000)
    return { km, stationText: `Km ${kmInt}+${String(m).padStart(3, '0')}`, distanceMeters: 0 }
  }

  const pLng = point[0]
  const pLat = point[1]
  const metersPerDegLat = 111320
  const metersPerDegLng = 111320 * Math.cos((pLat * Math.PI) / 180)

  let minDistanceM = Infinity
  let bestKm = kmPoints[0] || 0

  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i]
    const b = coords[i + 1]
    const kmA = kmPoints[i]
    const kmB = kmPoints[i + 1]

    // Chuyển sang hệ tọa độ mét cục bộ
    const abX = (b[0] - a[0]) * metersPerDegLng
    const abY = (b[1] - a[1]) * metersPerDegLat
    const apX = (pLng - a[0]) * metersPerDegLng
    const apY = (pLat - a[1]) * metersPerDegLat

    const abLenSq = abX * abX + abY * abY
    let t = 0
    if (abLenSq > 1e-4) {
      t = (apX * abX + apY * abY) / abLenSq
      t = Math.max(0, Math.min(1, t))
    }

    const projX = abX * t
    const projY = abY * t
    const distM = Math.sqrt((apX - projX) * (apX - projX) + (apY - projY) * (apY - projY))

    if (distM < minDistanceM) {
      minDistanceM = distM
      bestKm = kmA + t * (kmB - kmA)
    }
  }

  const kmFinal = parseFloat(bestKm.toFixed(3))
  const kmInt = Math.floor(kmFinal)
  const meters = Math.round((kmFinal - kmInt) * 1000)
  return {
    km: kmFinal,
    stationText: `Km ${kmInt}+${String(meters).padStart(3, '0')}`,
    distanceMeters: Math.round(minDistanceM)
  }
}

// Bo tròn mềm mại các đoạn cua gấp khúc của tim tuyến đường (Chaikin Corner Fillet & Curve Smoothing)
export function smoothRoadPolyline(
  rawCoords: [number, number][],
  _maxFilletRadiusM: number = 25.0
): [number, number][] {
  if (!rawCoords || rawCoords.length < 3) return rawCoords || []
  // Nếu tọa độ đã được làm mượt từ trước (đủ mật độ điểm), không làm mượt lặp lại để tránh co rút đường
  if (rawCoords.length >= 20) return rawCoords

  const latMid = rawCoords[0][1]
  const mLat = 111320
  const mLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

  // 1. Lọc bỏ các điểm liên tiếp có khoảng cách quá nhỏ (< 1.2m) hoặc điểm trùng nhau
  const pts: [number, number][] = [rawCoords[0]]
  for (let i = 1; i < rawCoords.length; i++) {
    const isLast = i === rawCoords.length - 1
    const prev = pts[pts.length - 1]
    const dx = (rawCoords[i][0] - prev[0]) * mLng
    const dy = (rawCoords[i][1] - prev[1]) * mLat
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist >= 1.2 || isLast) {
      pts.push(rawCoords[i])
    }
  }
  if (pts.length < 3) return pts

  // 2. Thuật toán Chaikin Corner Smoothing (2 lượt lặp) để bo tròn hoàn hảo mọi khúc cua gấp
  let smoothed = pts
  const iterations = 2

  for (let it = 0; it < iterations; it++) {
    const nextPts: [number, number][] = [smoothed[0]] // Luôn cố định điểm gốc
    for (let i = 0; i < smoothed.length - 1; i++) {
      const p0 = smoothed[i]
      const p1 = smoothed[i + 1]

      // Điểm 1/4 (25%) và điểm 3/4 (75%)
      const qX = 0.75 * p0[0] + 0.25 * p1[0]
      const qY = 0.75 * p0[1] + 0.25 * p1[1]
      const rX = 0.25 * p0[0] + 0.75 * p1[0]
      const rY = 0.25 * p0[1] + 0.75 * p1[1]

      nextPts.push([Number(qX.toFixed(7)), Number(qY.toFixed(7))])
      nextPts.push([Number(rX.toFixed(7)), Number(rY.toFixed(7))])
    }
    nextPts.push(smoothed[smoothed.length - 1]) // Luôn cố định điểm ngọn cuối
    smoothed = nextPts
  }

  // 3. Lọc bỏ điểm gần nhau sau khi bo cong (< 0.6m) để đường cong mượt và hiệu năng cao
  const finalCoords: [number, number][] = [smoothed[0]]
  for (let i = 1; i < smoothed.length; i++) {
    const isLast = i === smoothed.length - 1
    const last = finalCoords[finalCoords.length - 1]
    const dx = (smoothed[i][0] - last[0]) * mLng
    const dy = (smoothed[i][1] - last[1]) * mLat
    if (Math.sqrt(dx * dx + dy * dy) >= 0.6 || isLast) {
      finalCoords.push(smoothed[i])
    }
  }

  return finalCoords
}

