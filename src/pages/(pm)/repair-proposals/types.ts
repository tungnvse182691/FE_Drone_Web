export interface ProposalWorkPackage {
  id: string
  code: string // PKG-2026-08
  title: string
  route_id: string
  route_name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
  segments_count: number
  defect_count: number
  defect_summary: string
  technical_scope: string // Cào bóc & thảm: 180 m²
  material_scope: string // Bê tông nhựa C19: 14 m³
  technical_method?: string // Phương án kỹ thuật sửa chữa tổng quát (methodDescription theo Spec v2.2)
  duration_days: number
  date_range: string
  created_by_name: string
  created_by_initials: string
  created_by_role: string
  created_at: string
  status: 'DRAFT' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED'
  status_label: string
  approved_items: number
  total_items: number
  contractor_name: string
  description?: string
}

export interface UnassignedDefectItem {
  id: string
  code: string
  title: string
  stationing: string
  lane_detail: string
  severity_label: string
  selected: boolean
  area_m2: number
  depth_cm: number
}

export interface RouteSegmentOption {
  id: string
  code: string
  name: string
  chainage_start?: string
  chainage_end?: string
  chainage_display?: string
  startKm?: number
  endKm?: number
}

export interface RouteOption {
  id: string
  name: string
  code: string
  segments: RouteSegmentOption[]
}


