/**
 * Tiện ích trắc địa và hình học tuyến đường dự án (Project Geodesy & Road Centerline)
 * Đồng bộ vị trí không gian WGS84 (EPSG:4326) giữa đợt bay drone và thẩm định chi tiết lỗi AI
 */

import { getFromStorage } from '../api/services/storageHelper'

export interface ProjectBounds {
  startKm: number
  endKm: number
  lengthKm: number
  roadCode: string
  roadName: string
}

export const PROJECT_BOUNDS_MAP: Record<string, ProjectBounds> = {
  // Synthetic Project A (SBX-A)
  '72f84201-c001-4000-8000-000000000001': {
    startKm: 0.0,
    endKm: 0.702,
    lengthKm: 0.702,
    roadCode: 'MOCK-A',
    roadName: 'Tuyến cao tốc SBX-A'
  },
  // Synthetic Project B (SBX-B)
  '72f84201-c001-4000-8000-000000000002': {
    startKm: 0.0,
    endKm: 0.702,
    lengthKm: 0.702,
    roadCode: 'DEMO-B',
    roadName: 'Tuyến tránh đô thị SBX-B'
  },
  // Synthetic Project C (BLL0-SPC-1)
  '9d3edc50-ed2c-48d0-a087-93aa496a6667': {
    startKm: 0.0,
    endKm: 0.702,
    lengthKm: 0.702,
    roadCode: 'SEC-C-01',
    roadName: 'Tuyến Synthetic Project C'
  },
  // Synthetic Project D (BLLÐ-SPD-2)
  '74801443-31b8-426e-b4e0-5f796098ebc4': {
    startKm: 0.0,
    endKm: 1.0,
    lengthKm: 1.0,
    roadCode: 'SEC-D-01',
    roadName: 'Tuyến Synthetic Project D'
  },
  // Synthetic Project E (BLLÐ-SPE-3)
  '1a81e200-6bf8-4a98-a635-a0049de6caa7': {
    startKm: 0.0,
    endKm: 0.702,
    lengthKm: 0.702,
    roadCode: 'SEC-E-01',
    roadName: 'Tuyến Synthetic Project E'
  },
  // test1 (123)
  'f4de3849-fe4e-43bc-b6d3-36e111d629dd': {
    startKm: 0.0,
    endKm: 1.0,
    lengthKm: 1.0,
    roadCode: 'SEC-T-01',
    roadName: 'Tuyến dự án test1'
  }
}

export const PROJECT_COORDS_MAP: Record<string, [number, number][]> = {
  // Synthetic Project A (SBX-A) - Khu vực Hòa Cầm / Hòa Vang
  '72f84201-c001-4000-8000-000000000001': [
    [108.194, 16.049],
    [108.1952, 16.0505],
    [108.1965, 16.052],
    [108.1978, 16.0535],
    [108.199, 16.055]
  ],
  // Synthetic Project B (SBX-B) - Khu vực Nam Kỳ Khởi Nghĩa
  '72f84201-c001-4000-8000-000000000002': [
    [108.21, 16.06],
    [108.212, 16.0615],
    [108.214, 16.063],
    [108.216, 16.0645],
    [108.218, 16.066]
  ],
  // Synthetic Project C (BLL0-SPC-1) - Tuyến Quốc Lộ 14B
  '9d3edc50-ed2c-48d0-a087-93aa496a6667': [
    [108.23, 16.07],
    [108.232, 16.0715],
    [108.234, 16.073],
    [108.236, 16.0745],
    [108.238, 16.076]
  ],
  // Synthetic Project D (BLLÐ-SPD-2) - Tuyến tránh Hải Vân
  '74801443-31b8-426e-b4e0-5f796098ebc4': [
    [108.25, 16.08],
    [108.252, 16.0815],
    [108.254, 16.083],
    [108.256, 16.0845],
    [108.258, 16.086]
  ],
  // Synthetic Project E (BLLÐ-SPE-3) - Tuyến cao tốc La Sơn - Túy Loan
  '1a81e200-6bf8-4a98-a635-a0049de6caa7': [
    [108.27, 16.09],
    [108.272, 16.0915],
    [108.274, 16.093],
    [108.276, 16.0945],
    [108.278, 16.096]
  ],
  // test1 (123) - Tuyến đường trục khu công nghiệp Hòa Khánh
  'f4de3849-fe4e-43bc-b6d3-36e111d629dd': [
    [108.29, 16.1],
    [108.292, 16.1015],
    [108.294, 16.103],
    [108.296, 16.1045],
    [108.298, 16.106]
  ]
}

/**
 * Lấy tọa độ tim tuyến trắc địa chuẩn của dự án (WGS84 EPSG:4326)
 * Ưu tiên: Dữ liệu tim tuyến đã thiết lập và phê duyệt trong CSDL/LocalStorage -> Cấu hình tọa độ trắc địa theo dự án
 */
export function getProjectCorridorCoords(projectId?: string): [number, number][] {
  if (projectId) {
    const cleanId = projectId.toLowerCase().replace(/^branch-/, '')
    try {
      const alignData =
        getFromStorage<any>(`roadguard_alignment_data_${projectId}`, null) ||
        getFromStorage<any>(`roadguard_alignment_data_${cleanId}`, null)
      if (alignData?.coords && Array.isArray(alignData.coords) && alignData.coords.length >= 2) {
        return alignData.coords
      }
    } catch {}

    const matched = Object.keys(PROJECT_COORDS_MAP).find(
      (k) => k === cleanId || k.replace(/-/g, '') === cleanId.replace(/-/g, '')
    )
    if (matched && PROJECT_COORDS_MAP[matched]) {
      return PROJECT_COORDS_MAP[matched]
    }
  }

  // Mặc định trả về tọa độ của Synthetic Project E nếu đang ở Project E hoặc fallback dự án A
  return PROJECT_COORDS_MAP['1a81e200-6bf8-4a98-a635-a0049de6caa7'] || [
    [108.27, 16.09],
    [108.272, 16.0915],
    [108.274, 16.093],
    [108.276, 16.0945],
    [108.278, 16.096]
  ]
}

/**
 * Nội suy tọa độ chính xác [lng, lat] nằm trực tiếp trên tim tuyến đa giác (Polyline) theo tỷ lệ khoảng cách
 */
export function interpolateCoordAlongPolyline(
  coords: [number, number][],
  ratio: number
): [number, number] {
  if (!coords || coords.length === 0) return [108.27, 16.09]
  if (coords.length === 1 || ratio <= 0) return coords[0]
  if (ratio >= 1) return coords[coords.length - 1]

  const distances: number[] = [0]
  let totalDist = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const dx = coords[i + 1][0] - coords[i][0]
    const dy = coords[i + 1][1] - coords[i][1]
    const d = Math.sqrt(dx * dx + dy * dy)
    totalDist += d
    distances.push(totalDist)
  }

  if (totalDist === 0) return coords[0]
  const targetDist = Math.max(0, Math.min(totalDist, ratio * totalDist))

  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
      const segLen = distances[i + 1] - distances[i]
      const segT = segLen === 0 ? 0 : (targetDist - distances[i]) / segLen
      const lng = coords[i][0] + segT * (coords[i + 1][0] - coords[i][0])
      const lat = coords[i][1] + segT * (coords[i + 1][1] - coords[i][1])
      return [Number(lng.toFixed(6)), Number(lat.toFixed(6))]
    }
  }

  return coords[coords.length - 1]
}

/**
 * Lấy tọa độ GPS WGS84 chính xác của khiếm khuyết đặt trực tiếp trên tim tuyến của dự án
 */
export function getDefectGpsCoordinates(
  projectId?: string,
  chainageKm?: number,
  customRatio?: number
): { lng: number; lat: number; coords: [number, number][]; ratio: number } {
  const coords = getProjectCorridorCoords(projectId)
  const cleanId = (projectId || '').toLowerCase().replace(/^branch-/, '')
  const bounds =
    PROJECT_BOUNDS_MAP[cleanId] ||
    Object.entries(PROJECT_BOUNDS_MAP).find(
      ([k]) => k.replace(/-/g, '') === cleanId.replace(/-/g, '')
    )?.[1] ||
    PROJECT_BOUNDS_MAP['1a81e200-6bf8-4a98-a635-a0049de6caa7']

  let ratio = 0.35
  if (typeof customRatio === 'number' && !isNaN(customRatio)) {
    ratio = Math.max(0.05, Math.min(0.95, customRatio))
  } else if (typeof chainageKm === 'number' && !isNaN(chainageKm)) {
    const span = Math.max(0.1, bounds.endKm - bounds.startKm)
    ratio = Math.max(0.05, Math.min(0.95, (chainageKm - bounds.startKm) / span))
  }

  const [lng, lat] = interpolateCoordAlongPolyline(coords, ratio)
  return { lng, lat, coords, ratio }
}

