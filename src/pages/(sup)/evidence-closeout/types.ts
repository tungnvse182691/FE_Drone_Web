export type RepairTrackType = 'APPROVAL_TRACK' | 'FAST_TRACK' | 'EMERGENCY'
export type ItemReviewStatus = 'PENDING_INSPECTION' | 'ACCEPTED' | 'REWORK_REQUIRED' | 'CLOSED'

export interface CaseItem {
  id: string
  package_id?: string
  package_code?: string
  item_code: string
  defect_code: string
  title: string
  chainage: string
  status: ItemReviewStatus
  status_label: string
  track_type: RepairTrackType
  attempt_number: number
  area_m2: number
  depth_cm: number
  volume_btn_c125_kg: number
  tack_coat_crs1: string
  compaction_k98: number
  flatness_3m_gap_mm: number
  sand_patch_roughness_mm: number
  pave_temp_c: number
  compact_temp_c: number
  before_image: string
  before_hash: string
  before_time: string
  before_gps: string
  before_source: string
  after_image: string
  after_hash: string
  after_time: string
  after_gps: string
  after_crew: string
  after_equipment: string
  evidence_integrity_status: 'VERIFIED' | 'PENDING' | 'INTEGRITY_FAILED'
  citizen_published: boolean
  rework_reason?: string
  rework_directives?: string[]
}
