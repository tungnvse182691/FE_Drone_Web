export interface RiskPortfolioItem {
  id: string
  risk_level: 'Critical' | 'Watch' | 'Moderate'
  project_id: string
  project_name: string
  region: 'CENTRAL' | 'NORTH'
  route_code: string
  section_display: string
  chainage_display: string
  open_defects_count: number
  defect_scope_display: string
  sla_remaining: string
  sla_status: 'urgent' | 'warning' | 'normal'
  pci_score: number
  gps_lat: number
  gps_lng: number
  pm_name: string
  pm_email: string
  proposal_id: string
}
