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

