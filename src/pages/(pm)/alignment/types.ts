export interface SegmentItem {
  id: string
  code: string
  startKm: number
  endKm: number
  lengthKm: number
  roadWidthM: number // Bề rộng mặt đường (RoadWidthProfile v2.2 - mét)
  status: 'VALID' | 'GAP_WARNING'
  statusText: string
  laneCount: number
  surfaceMaterial: string
  color: string
  hasGap?: boolean
  gapDistance?: number
}

export interface SlabItem {
  id: string
  segmentCode: string
  stationing: string
  lengthM: number
  widthM: number
  thicknessCm: number
  status: 'GOOD' | 'CRACKED' | 'SETTLEMENT'
}

export interface BranchItem {
  id: string
  code: string
  name: string
  branchStationKm: number // Lý trình rẽ từ trục chính (Km)
  branchStationText: string // ví dụ Km 1024+500
  direction: 'RIGHT' | 'LEFT' | 'INTERCHANGE'
  directionText: string
  lengthKm: number
  roadWidthM: number
  laneCount: number
  surfaceMaterial: string
  color: string
  status: 'DRAFT' | 'CONFIRMED'
  coords?: [number, number][] // Tọa độ tim tuyến nhánh [lng, lat][]
  segments: SegmentItem[] // Danh sách các phân đoạn của riêng tuyến nhánh này
  splitDistance?: number
}

export interface AssignedProjectOption {
  id: string
  code: string
  name: string
  stationOriginText: string
  stationOriginKm: number
  endKm: number
  crs: string
  lengthKm: number
  defaultCoords: [number, number][]
  defaultKmPoints: number[]
  defaultSegments: SegmentItem[]
  defaultBranches?: BranchItem[]
  defaultManualText: string
}
