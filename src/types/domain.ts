import { RoleCode, DefectStatus, DefectType, Severity, RepairBatchStatus, SurveyStatus, InspectionResult } from './enums'

export interface User {
  id: string
  username: string
  full_name: string
  email: string
  role: RoleCode
  must_change_password?: boolean
  avatar_url?: string
}

export interface Project {
  id: string
  code: string
  name: string
  start_km: number
  end_km: number
  warranty_start: string
  warranty_end: string
  status: 'ACTIVE' | 'EXPIRED' | 'MAINTENANCE'
  total_defects: number
  pci_score: number // Pavement Condition Index (0 - 100)
}

export interface SurveyRequest {
  id: string
  code: string
  project_id: string
  project_name: string
  start_km: number
  end_km: number
  scheduled_date: string
  pilot_name: string
  status: SurveyStatus
  total_images: number
  detected_defects_count: number
  notes?: string
}

export interface BoundingBox {
  x: number // 0 - 1 normalized
  y: number // 0 - 1 normalized
  width: number
  height: number
}

export interface Defect {
  id: string
  code: string
  survey_id: string
  project_id: string
  project_name: string
  chainage_km: number // Lý trình Km
  gps_lat: number
  gps_lng: number
  defect_type: DefectType
  severity: Severity
  confidence_score: number // 0.0 - 1.0 (AI confidence)
  status: DefectStatus
  image_url: string
  previous_epoch_image_url?: string // Ảnh kỳ trước để so sánh đa kỳ (Verify B)
  bounding_box: BoundingBox
  length_m?: number
  width_m?: number
  depth_mm?: number
  batch_id?: string
  created_at: string
}

export interface RepairItem {
  id: string
  defect_id?: string
  task_name: string
  unit: string // m2, m, vị trí
  quantity: number
}

export interface RepairBatch {
  id: string
  code: string
  name: string
  project_id: string
  project_name: string
  status: RepairBatchStatus
  items: RepairItem[]
  defects: Defect[]
  created_by_name: string
  assigned_crew_name?: string
  deadline?: string
  rejection_reason?: string
  created_at: string
  approved_at?: string
}

export interface FieldTask {
  id: string
  code: string
  defect_id: string
  defect_code: string
  measurement_type: string
  chainage_km: number
  status: 'ASSIGNED' | 'SUBMITTED' | 'VERIFIED'
  measured_value?: number
  evidence_photo_url?: string
  technician_name: string
}

export interface WorkOrder {
  id: string
  code: string
  batch_id: string
  batch_code: string
  assigned_crew_name: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  before_photo_url?: string
  after_photo_url?: string
  crew_notes?: string
  completed_at?: string
}

export interface InspectionRecord {
  id: string
  batch_id: string
  defect_id: string
  defect_code: string
  supervisor_name: string
  result: InspectionResult
  notes?: string
  inspected_at: string
}

export type ConflictType =
  | 'ASSIGNMENT_REASSIGNED'
  | 'POLICY_VERSION_MISMATCH'
  | 'DUPLICATE_WORK_ATTEMPT'
  | 'DEVICE_RESCUE_PENDING'
  | 'AGGREGATE_VERSION_CONFLICT'

export type ResolutionStatus =
  | 'CONFLICT_INTAKE'
  | 'RESOLVED_ACCEPT_INCOMING'
  | 'RESOLVED_KEEP_SERVER'
  | 'RESOLVED_FORK_ATTEMPT'
  | 'RESCUE_SUBMITTED'
  | 'RESCUE_AUTHORIZED'
  | 'RESCUE_REJECTED'

export interface SyncConflictItem {
  id: string
  conflict_code: string
  task_code: string
  defect_code: string
  defect_type_label: string
  route_name: string
  chainage: string
  conflict_type: ConflictType
  conflict_type_label: string
  severity: 'HIGH' | 'MEDIUM' | 'CRITICAL'
  status: ResolutionStatus
  status_label: string
  offline_actor: {
    name: string
    role: string
    team: string
    device_id: string
    device_model: string
    offline_duration: string
    captured_at: string
  }
  incoming_data: {
    measurement_type: string
    measured_value: string
    depth_mm: number
    area_m2: number
    photo_evidence_url: string
    photo_after_url?: string
    sha256_hash: string
    gps_coords: string
    accuracy_m: number
    notes: string
  }
  duplicate_device_a?: {
    name: string
    role: string
    team: string
    device_id: string
    device_model: string
    captured_at: string
    measurement_type: string
    measured_value: string
    photo_url: string
    sha256_hash: string
    notes: string
  }
  server_state: {
    initial_assignee?: string
    current_assignee: string
    current_status: string
    policy_version: string
    policy_summary: string
    last_updated: string
    server_photo_url: string
    server_notes: string
  }
  timeline?: {
    time: string
    event: string
    actor: string
    badge?: string
    type?: 'info' | 'warning' | 'success' | 'alert'
  }[]
  resolution?: {
    decision: string
    decided_by: string
    decided_by_role: string
    decided_at: string
    reason: string
    audit_hash: string
  }
}
// =============================================================================
// 9. BÁO CÁO KIỂM ĐỊNH KHOA HỌC RPT-09 (RESEARCH VALIDATION & CONFUSION MATRIX)
// =============================================================================
export interface AcademicMetrics {
  mAP50_95: number
  map50_95?: number
  mAP_delta: string
  map50_95_delta?: string
  precision: number
  precision_delta: string
  false_positives: number
  false_positives_ratio: number
  total_samples: number
  recall: number
  recall_delta: string
  false_negatives_ratio: number
  f1_score: number
  is_certified: boolean
}

export interface ConfusionMatrixCell {
  gt_class: string
  pred_class: string
  percentage: number
  count: number
  is_true_positive?: boolean
  is_false_negative?: boolean
  is_false_positive?: boolean
}

export interface SizeErrorBin {
  range_label: string
  percentage: number
  bar_height_percent: number
  is_center?: boolean
}

export interface FPFNInspectorItem {
  id: string
  defect_code?: string
  survey_code?: string
  frame_number: number
  type: 'FP' | 'FN' | 'MISCLASSIFICATION' | 'TP'
  gt_class: string
  pred_class: string
  chainage: string
  lane: string
  ai_confidence: number
  ground_truth_label: string
  predicted_label?: string
  description: string
  image_url: string
  suggested_action: string
  status: 'PENDING' | 'ADDED_TO_TRAIN' | 'ANNOTATED' | 'FILTER_UPDATED'
}

// v2.2 Contract & Entity Types for RPT-09 (Research Validation)
export interface ValidationPair {
  groundTruthId: string
  derivedMeasurementId: string
}

export interface ValidationRunCreate {
  pairs: Array<ValidationPair>
  modelVersionId: string
  datasetSplitId: string
  measurementType: string
  unit: string
}

export interface ValidationResult {
  id: string
  usedCount: number
  excludedCount: number
  bias: number | null
  mae: number | null
  rmse: number | null
  unit: string
  exclusionReasons: Array<string>
}

export interface GroundTruthMeasurement {
  id: string
  session_code: string
  sample_id: string
  road_section_version_id?: string
  survey_id?: string
  defect_id?: string
  defect_type_code: string
  chainage_km: number
  measurement_type: 'DEPRESSION_DEPTH' | 'SLAB_FAULTING_HEIGHT' | 'SHOULDER_EROSION_EXTENT'
  value: number
  unit: string
  instrument_name: string
  instrument_reference?: string
  measurement_method: string
  measured_by: string
  measured_at: string
  weather_condition?: string
  evidence_image_url?: string
  notes?: string
}

export interface DerivedMeasurement {
  id: string
  survey_data_version_id?: string
  sample_id: string
  measurement_type: 'DEPRESSION_DEPTH' | 'SLAB_FAULTING_HEIGHT' | 'SHOULDER_EROSION_EXTENT'
  value: number
  unit: string
  uncertainty_estimate?: number
  source_type: 'SURFACE_MODEL' | 'DSM' | 'MANUAL_DERIVED'
  algorithm_version: string
  computed_at: string
}

export interface MeasurementValidationSample {
  id: string
  validation_run_id: string
  sample_id: string
  defect_type_code: string
  defect_name_vi: string
  chainage_km: number
  ground_truth_value: number
  derived_value: number
  unit: string
  signed_error: number
  absolute_error: number
  inclusion_status: 'INCLUDED' | 'EXCLUDED' | 'OUTLIER'
  exclusion_reason?: string
  instrument_name: string
  measured_by: string
}

export interface MeasurementValidationRun {
  id: string
  run_code: string
  measurement_type: 'DEPRESSION_DEPTH' | 'SLAB_FAULTING_HEIGHT' | 'SHOULDER_EROSION_EXTENT'
  method_name: string
  algorithm_version: string
  dataset_name: string
  sample_count: number
  used_count: number
  excluded_count: number
  bias: number
  mae: number
  rmse: number
  uncertainty_value: number
  uncertainty_method: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  is_mock_data: boolean
  executed_at: string
  triggered_by_name: string
  triggered_by_role: string
  progress_percent?: number
}

export interface ValidationBenchmarkRun {
  id: string
  run_code: string
  model_name: string
  backbone: string
  dataset_name: string
  dataset_frames: number
  executed_at: string
  triggered_by_name: string
  triggered_by_role: string
  map50_95: number | null
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  status_label: string
  progress_percent?: number
  log_output?: string
}

// ==========================================
// RPT-10: NHẬT KÝ HOẠT ĐỘNG & KIỂM TOÁN DỰ ÁN (FR-34, US-29, BR-45)
// ==========================================
export interface AuditEvent {
  id: string
  event_id: string // Mã định danh sự kiện chống trùng lặp (Dedup Event ID theo US-29-AC-01 / FR-34)
  occurred_at: string // Thời điểm UTC ISO 8601
  occurred_at_local: string // Thời điểm GMT+7
  project_id: string // Mã dự án để phân định scope PM vs Supervisor (US-29-AC-02)
  project_name: string // Tên tuyến / dự án bảo hành
  actor_id: string
  actor_name: string
  actor_role: RoleCode | 'SYSTEM'
  actor_role_label: string
  actor_avatar?: string
  action_type: 
    | 'SUBMIT_BATCH'
    | 'APPROVE_BATCH'
    | 'REJECT_BATCH'
    | 'ASSIGN_CREW'
    | 'CLOSE_FAST_TRACK'
    | 'SUBMIT_WORK_ORDER'
    | 'ACCEPT_WORK_ORDER'
    | 'PUBLISH_SEGMENTS'
    | 'LOCK_LEGAL_HOLD'
  action_label_vi: string
  action_badge_style: string
  target_entity_type: 'REPAIR_BATCH' | 'DEFECT' | 'ROAD_SEGMENT' | 'WORK_ORDER' | 'LEGAL_HOLD'
  target_entity_id: string
  target_entity_name: string
  target_location?: string
  from_status?: string | null // Trạng thái trước sự kiện (IncidentCaseHistory.from_status)
  to_status: string // Trạng thái sau sự kiện (IncidentCaseHistory.to_status)
  reason: string // Lý do nghiệp vụ và căn cứ quyết định (IncidentCaseHistory.reason)
  evidence_snapshot?: {
    images?: Array<{
      url: string
      caption: string
      captured_at: string
      gps_coordinates: string
    }>
  }
  before_state?: Record<string, any>
  after_state: Record<string, any>
  is_legal_hold?: boolean // Hồ sơ tranh chấp thanh tra cấm xóa (BR-45)
}

export interface AuditTrailStats {
  total_events: number // Tổng số sự kiện ghi nhận (COUNT)
  state_transitions_count: number // Số lần chuyển đổi trạng thái hồ sơ/đợt sửa
  approval_decisions_count: number // Số quyết định phê duyệt / từ chối của Supervisor
  retention_compliance_note: string // Căn cứ thời hạn lưu trữ BR-45 (Hết bảo hành + 5 năm)
}

// ==========================================
// WF-12: QUẢN TRỊ HỆ THỐNG, MÔ HÌNH AI & LƯU TRỮ PHÁP LÝ (FR-02, FR-35, FR-36, BR-02, BR-45)
// ==========================================

export interface SystemUserAccount {
  id: string
  full_name: string
  email: string
  phone?: string
  role: RoleCode
  role_label: string
  project_scope: string
  project_id?: string
  device_info: string
  ip_address: string
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED'
  last_active: string
  is_current_user?: boolean
  certificate?: string
  joined_date?: string
}

export interface AIModelVersion {
  id: string
  name: string
  version: string
  status: 'ACTIVE' | 'DEPRECATED'
  map_50: number // Độ chính xác mAP@50 (0-100%)
  recall: number // Độ nhạy Recall (0-100%)
  f1_score: number // F1 Score
  deployed_at: string
  sha256_hash: string
  fast_track_auto: boolean
}

export interface DefectCatalogItem {
  code: string
  name: string
  description: string
  standard_ref: string // Ví dụ: TCVN 8864:2011
  default_severity: Severity
  is_active: boolean
}

export interface LegalHoldProject {
  project_id: string
  project_code: string
  project_name: string
  warranty_end_date: string
  is_warranty_expired: boolean
  years_since_warranty_end: number
  is_legal_hold: boolean
  hold_reason?: string
  hold_authority?: string // Cơ quan yêu cầu thanh tra (Bộ GTVT / Cục ĐBVN)
  hold_reference?: string // Số công văn
  hold_since?: string
}

export interface DataDeletionRequest {
  id: string
  request_code: string
  project_id: string
  project_name: string
  requested_by_id: string
  requested_by_name: string
  requested_at: string
  data_type: string
  data_description: string
  data_size_gb: number
  warranty_end_date: string
  years_since_warranty: number
  is_eligible_5years: boolean // Đủ điều kiện 5 năm theo BR-45
  status: 'PENDING_APPROVAL' | 'APPROVED_PURGED' | 'REJECTED'
  blocked_by_legal_hold: boolean
  justification_notes: string
  rejection_reason?: string
}

// ==========================================
// UNIFIED DOMAIN ENTITIES & WORKFLOW TYPES (SSOT)
// ==========================================

export interface PasswordRules {
  length: boolean
  case: boolean
  number?: boolean
  special: boolean
}

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
  inspection_standard?: string
  retention_amount?: string
}

export interface PolicyThresholdConfig {
  version: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  maxAreaM2: number
  maxDepthCm: number
  maxPerimeterM: number
  allowedSeverities: ('LOW' | 'MEDIUM' | 'HIGH' | string)[]
  slaHours: number
  activatedBy: string
  activatedAt: string
  appliedRoute: string
  description: string
}

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

export interface ProposalWorkPackage {
  id: string
  code: string
  title: string
  route_id: string
  route_name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
  segments_count: number
  defect_count: number
  defect_summary: string
  technical_scope: string
  material_scope: string
  technical_method?: string
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

export type ItemApprovalStatus =
  | 'APPROVED'
  | 'REQUEST_EVIDENCE'
  | 'REQUEST_RECONSIDER'
  | 'REJECTED'
  | 'PENDING'

export interface RepairItemDetail {
  id: string
  item_code: string
  defect_code: string
  chainage: string
  lane_info: string
  defect_title: string
  defect_measurements: string
  solution_title: string
  solution_standard: string
  volume_display: string
  volume_sub: string
  area_m2: number
  status: ItemApprovalStatus
  status_label: string
  assigned_crew: string
  supervisor_notes?: string
  evidence_directives?: string[]
  feedback_type?: 'EVIDENCE' | 'RECONSIDER' | 'REJECT'
  image_url: string
  ortho_code: string
  gps_coords: string
  resolution: string
  survey_code?: string
  drone_model?: string
  pilot_name?: string
  flight_date?: string
}



