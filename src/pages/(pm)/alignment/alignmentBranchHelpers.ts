import type { BranchItem, SegmentItem } from './types'

export function parseBranchCoordinates(text: string): [number, number][] {
  return validateBranchCoordinates(text.trim().split(/\r?\n/).filter(line => line.trim()).map((line, index) => {
    const cells = line.trim().split(/[\s,]+/)
    if (cells.length !== 2 || cells.some(cell => !Number.isFinite(Number(cell)))) throw new Error(`Tọa độ nhánh dòng ${index + 1}: cần đúng hai số hữu hạn [kinh độ, vĩ độ].`)
    return [Number(cells[0]), Number(cells[1])]
  }))
}

export function validateBranchCoordinates(coords: [number, number][]): [number, number][] {
  if (!Array.isArray(coords) || coords.length < 2 || coords.length > 100000) throw new Error('Nhánh cần 2–100000 điểm tọa độ WGS84 có nguồn.')
  if (coords.some((p, i) => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90 || i > 0 && p[0] === coords[i - 1][0] && p[1] === coords[i - 1][1])) throw new Error('Tọa độ nhánh không hợp lệ hoặc hai điểm liền nhau trùng nhau; không tự sửa hình học.')
  return coords.map(([lng, lat]) => [lng, lat])
}

export function branchKmPoints(coords: [number, number][]): number[] {
  const points = [0], radians = Math.PI / 180
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1], b = coords[i], dLat = (b[1] - a[1]) * radians, dLng = (b[0] - a[0]) * radians
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * radians) * Math.cos(b[1] * radians) * Math.sin(dLng / 2) ** 2
    points.push(points[i - 1] + 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h))))
  }
  return points
}

export function branchJunction(coords: [number, number][], mainline: [number, number][], kmPoints: number[]) {
  if (!coords.length || mainline.length < 2 || mainline.length !== kmPoints.length || mainline.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) || kmPoints.some((km, i) => !Number.isFinite(km) || i > 0 && km <= kmPoints[i - 1])) return null
  const p = coords[0], mLng = 111320 * Math.cos(p[1] * Math.PI / 180)
  let best: { km: number; distanceMeters: number; direction: BranchItem['direction']; stationText: string } | null = null
  for (let i = 1; i < mainline.length; i++) {
    const a = mainline[i - 1], b = mainline[i], dx = (b[0] - a[0]) * mLng, dy = (b[1] - a[1]) * 111320, length2 = dx * dx + dy * dy
    if (!(length2 > 0)) continue
    const px = (p[0] - a[0]) * mLng, py = (p[1] - a[1]) * 111320, t = Math.max(0, Math.min(1, (px * dx + py * dy) / length2))
    const distanceMeters = Math.hypot(px - t * dx, py - t * dy), km = kmPoints[i - 1] + t * (kmPoints[i] - kmPoints[i - 1])
    const last = coords[coords.length - 1], cross = dx * (last[1] - p[1]) * 111320 - dy * (last[0] - p[0]) * mLng
    if (!best || distanceMeters < best.distanceMeters) best = { km, distanceMeters, direction: cross > 0 ? 'LEFT' : cross < 0 ? 'RIGHT' : 'INTERCHANGE', stationText: `Km ${Math.floor(km)}+${((km - Math.floor(km)) * 1000).toFixed(3)}` }
  }
  return best
}

export function prepareBranchPreview(input: Pick<BranchItem, 'id' | 'name' | 'coords' | 'roadWidthM' | 'laneCount' | 'surfaceMaterial'>, mainline: [number, number][], mainKmPoints: number[]): BranchItem {
  const coords = validateBranchCoordinates(input.coords!)
  if (typeof input.id !== 'string' || !input.id || typeof input.name !== 'string' || !input.name.trim() || !Number.isFinite(input.roadWidthM) || input.roadWidthM < 3 || input.roadWidthM > 60 || !Number.isInteger(input.laneCount) || input.laneCount < 1 || input.laneCount > 8 || typeof input.surfaceMaterial !== 'string' || !input.surfaceMaterial.trim()) throw new Error('Cần tên, bề rộng 3–60m, số làn 1–8 và vật liệu do người dùng nhập.')
  const junction = branchJunction(coords, mainline, mainKmPoints)
  if (!junction) throw new Error('Thiếu tọa độ/lý trình tuyến chính hiện tại để xác định lý trình tham chiếu của nhánh.')
  const points = branchKmPoints(coords), lengthKm = points[points.length - 1]
  if (!Number.isFinite(lengthKm) || !(lengthKm > 0)) throw new Error('Chiều dài nguồn nhánh không hợp lệ.')
  const id = input.id, code = `BR-${id.replace(/^br-/, '').slice(0, 8)}`
  const segment: SegmentItem = { id: `${id}-segment-1`, code: `${code} - Khoảng 1`, startKm: 0, endKm: lengthKm, lengthKm,
    roadWidthM: input.roadWidthM, laneCount: input.laneCount, surfaceMaterial: input.surfaceMaterial, status: 'VALID', statusText: 'BẢN CHỈNH CHƯA LƯU', color: '#D97706' }
  return { ...input, id, code, coords, kmPoints: points, lengthKm, branchStationKm: junction.km, branchStationText: junction.stationText,
    junctionDistanceMeters: junction.distanceMeters, direction: junction.direction, directionText: `Tham chiếu ${junction.stationText}`,
    color: '#D97706', status: 'DRAFT', previewOnly: true, segments: [segment], splitDistance: Number.NaN, splitSortOrder: 'asc' }
}

export function branchLineRange(coords: [number, number][], start: number, end: number): [number, number][] {
  if (!Array.isArray(coords) || coords.length < 2) return []
  const points = branchKmPoints(coords), total = points[points.length - 1]
  if (![start, end, total].every(Number.isFinite) || start < 0 || end <= start || end > total) return []
  if (start === 0 && end === total) return coords.map(p => [...p] as [number, number])
  const at = (km: number): [number, number] => {
    let i = 1; while (i < points.length - 1 && points[i] < km) i++
    const t = (km - points[i - 1]) / (points[i] - points[i - 1]), a = coords[i - 1], b = coords[i]
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
  }
  return [at(start), ...coords.filter((_, i) => points[i] > start && points[i] < end), at(end)]
}
