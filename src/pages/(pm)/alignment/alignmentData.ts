import { AssignedProjectOption } from './types'

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

