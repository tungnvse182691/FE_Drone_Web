export interface HubProject {
  id: string
  code: string
  name: string
  region: string
  location_detail: string
  start_km: number
  end_km: number
  stationing_text: string
  status: 'ACTIVE' | 'NEAR_EXPIRY' | 'PENDING_ALIGNMENT' | 'RESTRICTED'
  status_label: string
  status_color: string
  pm_name: string
  pm_email: string
  pm_role_badge: string
  pm_avatar?: string
  warranty_passed_percent: number
  days_remaining: number
  length_km: number
  open_defects: number
  repair_packages: number
  image_url: string
  is_assigned: boolean
  is_restricted_for_pm?: boolean
  kml_status?: string
  retention_amount?: string
}

export type ProjectFilterTab = 'ALL' | 'ACTIVE' | 'NEAR_EXPIRY' | 'PENDING_ALIGNMENT'

export type ProjectViewMode = 'grid' | 'table'

export interface ProjectKpiStats {
  totalLength: string
  activeCount: number
  nearExpiryCount: number
  pendingAlignmentCount: number
}
