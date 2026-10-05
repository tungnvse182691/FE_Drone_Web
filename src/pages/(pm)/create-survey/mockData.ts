import { ProjectRouteConfig, AvailablePilot } from './types'

export const SURVEY_PROJECTS: ProjectRouteConfig[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    startKm: 1020.0,
    endKm: 1045.0,
    defaultCoords: [
      [108.0825, 16.2731], // P0 - Km 1020+000
      [108.1054, 16.2589], // P1 - Km 1022+500
      [108.1287, 16.2415], // P2 - Km 1025+000
      [108.1492, 16.2238], // P3 - Km 1027+500
      [108.1695, 16.2085], // P4 - Km 1030+000
      [108.1884, 16.1843], // P5 - Km 1035+000
      [108.2152, 16.1521], // P6 - Km 1040+000
      [108.2418, 16.1215]  // P7 - Km 1045+000
    ],
    defaultKmPoints: [1020, 1022.5, 1025, 1027.5, 1030, 1035, 1040, 1045]
  },
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan (Km 0 - Km 66)',
    startKm: 0.0,
    endKm: 66.0,
    defaultCoords: [
      [107.6521, 16.2912],
      [107.7214, 16.2105],
      [107.8102, 16.1423],
      [107.9056, 16.0821],
      [108.0124, 16.0354],
      [108.1189, 15.9876]
    ],
    defaultKmPoints: [0, 15, 30, 45, 55, 66]
  }
]

export const AVAILABLE_PILOTS: AvailablePilot[] = [
  {
    id: 'pilot-01',
    name: 'Lê Hoàng Long',
    roleLabel: 'Drone Pilot — Đội bay Hoàng Hải 01',
    phone: '0988.123.456',
    license: 'Cục Tác Chiến #TC-UAV-2024-089',
    device: 'DJI Matrice 350 RTK + Zenmuse P1'
  },
  {
    id: 'pilot-02',
    name: 'Trần Quang Khải',
    roleLabel: 'Drone Pilot — Đội bay Hoàng Hải 02',
    phone: '0972.555.888',
    license: 'Cục Tác Chiến #TC-UAV-2025-112',
    device: 'DJI Mavic 3 Enterprise RTK'
  },
  {
    id: 'pilot-03',
    name: 'Nguyễn Thành Đạt',
    roleLabel: 'Drone Pilot — Chuyên gia bay địa hình & SfM',
    phone: '0915.777.999',
    license: 'Cục Tác Chiến #TC-UAV-2025-240',
    device: 'DJI Matrice 300 RTK + Zenmuse H20T'
  },
  {
    id: 'pilot-04',
    name: 'Phạm Minh Tuấn',
    roleLabel: 'Drone Pilot — Đội bay dự phòng khẩn cấp',
    phone: '0903.444.222',
    license: 'Cục Tác Chiến #TC-UAV-2026-031',
    device: 'DJI Phantom 4 RTK'
  }
]

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

export function getSubLineCoordinates(
  startKm: number,
  endKm: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number][] {
  if (!coords || coords.length < 2) return coords || []
  const [minKm, maxKm] = startKm <= endKm ? [startKm, endKm] : [endKm, startKm]
  const result: [number, number][] = []

  result.push(interpolateCoordAtKm(minKm, coords, kmPoints))
  for (let i = 0; i < kmPoints.length; i++) {
    if (kmPoints[i] > minKm && kmPoints[i] < maxKm) {
      result.push(coords[i])
    }
  }
  result.push(interpolateCoordAtKm(maxKm, coords, kmPoints))

  if (result.length < 2) return coords.slice(0, 2)
  return result
}
