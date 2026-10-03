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
  unit_price: number // VND
  total_price: number // Derived: quantity * unit_price
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
  estimated_total_cost: number // Derived: SUM(items.total_price)
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
