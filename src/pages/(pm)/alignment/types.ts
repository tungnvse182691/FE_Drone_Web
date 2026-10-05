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
  defaultManualText: string
}
