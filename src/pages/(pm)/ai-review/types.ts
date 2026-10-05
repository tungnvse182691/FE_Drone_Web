export interface TriageCase {
  id: string
  code: string
  source: 'DRONE_AI' | 'CITIZEN' | 'PATROL'
  source_label: string
  source_detail: string
  project_id: string
  project_name: string
  stationing: string
  lane: string
  defect_title: string
  defect_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY'
  time_ago: string
  created_at: string
  status: 'PENDING' | 'MERGED' | 'NEED_SURVEY' | 'VERIFIED' | 'REJECTED'
  status_label: string
  image_url: string
  gps: {
    lat: number
    lng: number
    altitude_m: number
    resolution_cm_px: number
  }
  ai_confidence: number
  area_sqm: number
  ai_area_sqm: number
  max_depth_cm: number
  ai_depth_cm: number
  pm_notes: string
  reporter_name?: string
  reporter_phone?: string
  reporter_channel?: string
  description?: string
  conclusion?: 'DEFECT_FOUND' | 'NO_DEFECT' | 'OUT_OF_SCOPE' | null
  conclusion_reason?: string
  linked_report_ids?: string[]
  master_case_id?: string
  is_assigned?: boolean
  is_published?: boolean
  published_at?: string
  public_notice?: string
  survey_assignment?: {
    mode: 'MEASURE_ONLY' | 'DRONE_RESURVEY'
    reason: string
    assigned_crew: string
    sla_hours: number
    created_at: string
  }
  cluster_duplicates?: {
    code: string
    source: string
    distance_m: number
    reporter: string
    time?: string
    image_url?: string
    selected: boolean
    is_merged?: boolean
  }[]
}

export type ViewSourceMode = 'CITIZEN_TRIAGE' | 'DRONE_AI' | 'ALL'
export type ActiveTabFilter = 'ALL' | 'PENDING' | 'MERGED' | 'NEED_SURVEY' | 'CRITICAL'
