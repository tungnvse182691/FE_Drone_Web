export type RepairTrackType = 'APPROVAL_TRACK' | 'FAST_TRACK' | 'EMERGENCY'
export type ItemReviewStatus = 'PENDING_INSPECTION' | 'ACCEPTED' | 'REWORK_REQUIRED' | 'CLOSED' | 'CANCELLED'

/** Bước đang chờ của hạng mục theo RepairItemState + trạng thái task (đọc từ BE). */
export type PendingStep = 'PM_REVIEW' | 'SUPPLEMENT' | 'SUP_CONFIRM' | 'PM_CONFIRM' | 'CORRECTION' | 'ACCEPTED' | 'CANCELLED'

/** Tham chiếu ảnh của bản nộp (đọc ảnh bằng cookie qua BE, không ghép URL thủ công). */
export interface PhotoRef {
  fileId: string
  purpose: string
  taskId: string
  checksum?: string
  capturedAt?: string | null
  source: 'SUBMISSION' | 'DEFECT_SOURCE'
  contentPath?: string
}

export interface SubmissionMeasurement { sampleId?: string | null; type?: string | null; value?: number | null; state?: string | null; unit?: string | null; unknownReason?: string | null }


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
  area_m2: number | null
  depth_cm: number | null
  volume_btn_c125_kg: number | null
  tack_coat_crs1: string
  compaction_k98: number | null
  flatness_3m_gap_mm: number | null
  sand_patch_roughness_mm: number | null
  pave_temp_c: number | null
  compact_temp_c: number | null
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
  // ---- Dữ liệu thật từ BE (RepairItemState / history / FIELD submission). Thiếu nguồn thì để undefined, UI ghi "Chưa có dữ liệu".
  project_id?: string
  be_state?: string
  item_version?: string
  task_id?: string | null
  task_status?: string | null
  pending_step?: PendingStep
  submission_id?: string | null
  submission_revision?: number | null
  submitted_at?: string | null
  construction_start?: string | null
  construction_end?: string | null
  time_provenance?: string | null
  crew_id?: string | null
  crew_display?: string | null
  readiness?: string | null
  missing_reasons?: string[]
  measurements?: SubmissionMeasurement[]
  before_ref?: PhotoRef | null
  after_ref?: PhotoRef | null
  other_refs?: PhotoRef[]
  attempts_count?: number
  load_notes?: string[]
}
