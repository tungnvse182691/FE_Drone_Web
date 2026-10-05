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
        statusText: 'HỢP LỆ (Valid)',
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
        statusText: 'HỢP LỆ (Valid)',
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

