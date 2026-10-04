/**
 * ROADGUARD SINGLE SOURCE OF TRUTH (SSOT) MOCK DATA
 * Hệ thống Dữ liệu Tập trung & Toàn vẹn 100% (Relational Graph 5 Tầng)
 * 
 * Tuân thủ tiêu chuẩn:
 * - TCVN 8864:2011 (Mặt đường ô tô - Đo độ gồ ghề & hư hỏng)
 * - TCVN 10380:2014 (Đường giao thông nông thôn - Mặt đường bê tông xi măng)
 * - Routing Contracts theo React Router v7 trong src/App.tsx
 */

import {
  RoleCode,
  DefectStatus,
  DefectType,
  Severity,
  RepairBatchStatus,
  SurveyStatus,
  InspectionResult
} from '../types/enums'

import {
  User,
  Project,
  SurveyRequest,
  Defect,
  RepairItem,
  RepairBatch,
  FieldTask,
  WorkOrder,
  InspectionRecord,
  SyncConflictItem,
  AcademicMetrics,
  ConfusionMatrixCell,
  SizeErrorBin,
  FPFNInspectorItem,
  ValidationBenchmarkRun,
  MeasurementValidationSample,
  MeasurementValidationRun,
  AuditEvent,
  AuditTrailStats,
  SystemUserAccount,
  AIModelVersion,
  DefectCatalogItem,
  LegalHoldProject,
  DataDeletionRequest
} from '../types/domain'

// =============================================================================
// TẦNG 1: PARENT ENTITIES (NGƯỜI DÙNG, ĐỘI THI CÔNG, TUYẾN ĐƯỜNG & PHÂN ĐOẠN)
// =============================================================================

export interface TeamEntity {
  id: string
  code: string
  name: string
  leader_name: string
  leader_phone: string
  members_count: number
  specialty: 'CONCRETE_REPAIR' | 'DRONE_SURVEY' | 'PAVEMENT_TESTING' | 'TRAFFIC_CONTROL'
  status: 'ACTIVE' | 'STANDBY' | 'ON_LEAVE'
}

export interface RouteSegmentEntity {
  id: string
  code: string
  project_id: string
  name: string
  start_km: number
  end_km: number
  length_km: number
  road_width_m: number
  slab_length_m: number
  slab_width_m: number
  slab_thickness_cm: number
  concrete_grade: 'M250' | 'M300' | 'M350'
  joint_spacing_m: number
  expansion_joint_spacing_m: number
  total_slabs_calculated: number
  status: 'VALID' | 'GAP_WARNING'
}

export interface PavementSlabEntity {
  id: string
  segment_id: string
  segment_code: string
  stationing: string
  chainage_km: number
  slab_index: number
  length_m: number
  width_m: number
  thickness_cm: number
  gps_lat: number
  gps_lng: number
  status: 'GOOD' | 'CRACKED' | 'FAULTING' | 'CORNER_BREAK' | 'SPALLING'
  defects_count: number
}

// 1.1 Người dùng hệ thống (Chuẩn vai trò & quyền hạn)
export const mockUsers: User[] = [
  {
    id: 'usr-pm-01',
    username: 'pmhoang@gmail.com',
    full_name: 'Đỗ Quốc Hoàng (PM)',
    email: 'pmhoang@gmail.com',
    role: RoleCode.PROJECT_MANAGER,
    must_change_password: false,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-sup-01',
    username: 'suphoang@gmail.com',
    full_name: 'Kỹ sư Nguyễn Văn An (Giám sát)',
    email: 'suphoang@gmail.com',
    role: RoleCode.SUPERVISOR,
    must_change_password: false,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-pilot-01',
    username: 'long.pilot@hoanghai.vn',
    full_name: 'Lê Hoàng Long (Drone Pilot)',
    email: 'long.pilot@hoanghai.vn',
    role: RoleCode.DRONE_OPERATOR,
    must_change_password: false,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-crew-01',
    username: 'hung.crew@hoanghai.vn',
    full_name: 'Phạm Văn Hùng (Tổ trưởng thi công BTXM)',
    email: 'hung.crew@hoanghai.vn',
    role: RoleCode.REPAIR_CREW,
    must_change_password: false,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  }
]

// 1.2 Đội thi công & khảo sát
export const mockTeams: TeamEntity[] = [
  {
    id: 'team-hh-01',
    code: 'CREW-HH-01',
    name: 'Đội thi công sửa chữa Hoàng Hải 01',
    leader_name: 'Kỹ sư Phạm Văn Hùng',
    leader_phone: '0912.845.221',
    members_count: 8,
    specialty: 'CONCRETE_REPAIR',
    status: 'ACTIVE'
  },
  {
    id: 'team-hh-02',
    code: 'CREW-HH-02',
    name: 'Tổ cơ động sửa chữa BTXM 02',
    leader_name: 'Kỹ sư Trần Đình Trọng',
    leader_phone: '0983.114.908',
    members_count: 6,
    specialty: 'CONCRETE_REPAIR',
    status: 'ACTIVE'
  },
  {
    id: 'team-hh-pilot',
    code: 'DRONE-CAM-04',
    name: 'Tổ bay quét Drone Cam 04 (Matrice 300 RTK)',
    leader_name: 'Lê Hoàng Long',
    leader_phone: '0905.789.332',
    members_count: 3,
    specialty: 'DRONE_SURVEY',
    status: 'ACTIVE'
  }
]

// 1.3 Danh mục Tuyến đường / Dự án bảo hành
export const mockProjects: Project[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    start_km: 1020.0,
    end_km: 1045.0,
    warranty_start: '2025-01-01',
    warranty_end: '2028-01-01',
    status: 'ACTIVE',
    total_defects: 5,
    pci_score: 78.5
  },
  {
    id: 'prj-gtnt-hailang',
    code: 'PRJ-GTNT-HL01',
    name: 'Đường BTXM liên xã Hải Lăng - Quảng Trị',
    start_km: 0.0,
    end_km: 5.2,
    warranty_start: '2024-06-15',
    warranty_end: '2027-06-15',
    status: 'ACTIVE',
    total_defects: 1,
    pci_score: 82.0
  }
]

// 1.4 Phân đoạn tuyến (Segments) với thông số tấm BTXM & khe nối chuẩn TCVN
export const mockRouteSegments: RouteSegmentEntity[] = [
  {
    id: 'seg-01',
    code: 'SEG-01',
    project_id: 'prj-ql1a-02',
    name: 'Phân đoạn 1: Km 1020+000 - Km 1025+000',
    start_km: 1020.0,
    end_km: 1025.0,
    length_km: 5.0,
    road_width_m: 7.5,
    slab_length_m: 5.0,
    slab_width_m: 3.75,
    slab_thickness_cm: 26,
    concrete_grade: 'M300',
    joint_spacing_m: 5.0,
    expansion_joint_spacing_m: 250.0,
    total_slabs_calculated: 2000,
    status: 'VALID'
  },
  {
    id: 'seg-02',
    code: 'SEG-02',
    project_id: 'prj-ql1a-02',
    name: 'Phân đoạn 2: Km 1025+000 - Km 1035+000',
    start_km: 1025.0,
    end_km: 1035.0,
    length_km: 10.0,
    road_width_m: 7.5,
    slab_length_m: 5.0,
    slab_width_m: 3.75,
    slab_thickness_cm: 26,
    concrete_grade: 'M300',
    joint_spacing_m: 5.0,
    expansion_joint_spacing_m: 250.0,
    total_slabs_calculated: 4000,
    status: 'VALID'
  },
  {
    id: 'seg-03',
    code: 'SEG-03',
    project_id: 'prj-ql1a-02',
    name: 'Phân đoạn 3: Km 1035+000 - Km 1045+000',
    start_km: 1035.0,
    end_km: 1045.0,
    length_km: 10.0,
    road_width_m: 7.5,
    slab_length_m: 5.0,
    slab_width_m: 3.75,
    slab_thickness_cm: 26,
    concrete_grade: 'M300',
    joint_spacing_m: 5.0,
    expansion_joint_spacing_m: 250.0,
    total_slabs_calculated: 4000,
    status: 'VALID'
  },
  {
    id: 'seg-hl-01',
    code: 'SEG-HL-01',
    project_id: 'prj-gtnt-hailang',
    name: 'Tuyến BTXM Nông Thôn Hải Lăng (Km 0+000 - Km 5+200)',
    start_km: 0.0,
    end_km: 5.2,
    length_km: 5.2,
    road_width_m: 4.0,
    slab_length_m: 4.0,
    slab_width_m: 4.0,
    slab_thickness_cm: 20,
    concrete_grade: 'M250',
    joint_spacing_m: 4.0,
    expansion_joint_spacing_m: 160.0,
    total_slabs_calculated: 1300,
    status: 'VALID'
  }
]

// 1.5 Tấm Slab bê tông xi măng cụ thể đại diện cho các vị trí hư hỏng
export const mockPavementSlabs: PavementSlabEntity[] = [
  {
    id: 'slab-1025-08',
    segment_id: 'seg-02',
    segment_code: 'SEG-02',
    stationing: 'Km 1025+400',
    chainage_km: 1025.4,
    slab_index: 81,
    length_m: 5.0,
    width_m: 3.75,
    thickness_cm: 26,
    gps_lat: 16.2405,
    gps_lng: 108.1310,
    status: 'CORNER_BREAK',
    defects_count: 1
  },
  {
    id: 'slab-1028-03',
    segment_id: 'seg-02',
    segment_code: 'SEG-02',
    stationing: 'Km 1028+150',
    chainage_km: 1028.15,
    slab_index: 631,
    length_m: 5.0,
    width_m: 3.75,
    thickness_cm: 26,
    gps_lat: 16.2215,
    gps_lng: 108.1512,
    status: 'CRACKED',
    defects_count: 1
  },
  {
    id: 'slab-1031-18',
    segment_id: 'seg-02',
    segment_code: 'SEG-02',
    stationing: 'Km 1031+900',
    chainage_km: 1031.9,
    slab_index: 1381,
    length_m: 5.0,
    width_m: 3.75,
    thickness_cm: 26,
    gps_lat: 16.1985,
    gps_lng: 108.1755,
    status: 'FAULTING',
    defects_count: 1
  },
  {
    id: 'slab-1024-22',
    segment_id: 'seg-01',
    segment_code: 'SEG-01',
    stationing: 'Km 1024+450',
    chainage_km: 1024.45,
    slab_index: 891,
    length_m: 5.0,
    width_m: 3.75,
    thickness_cm: 26,
    gps_lat: 16.2458,
    gps_lng: 108.1245,
    status: 'CRACKED',
    defects_count: 1
  }
]

// =============================================================================
// TẦNG 2: EXECUTION ENTITIES (CHUYẾN BAY KHẢO SÁT DRONE / SURVEILLANCE)
// =============================================================================

export const mockSurveys: SurveyRequest[] = [
  {
    id: 'srv-01',
    code: 'SRV-2026-003',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    start_km: 1024.0,
    end_km: 1032.0,
    scheduled_date: '2026-08-15',
    pilot_name: 'Lê Hoàng Long (Drone Pilot)',
    status: SurveyStatus.COMPLETED,
    total_images: 850,
    detected_defects_count: 5,
    notes: 'Bay quét không ảnh trực giao Orthomosaic bằng cảm biến Zenmuse P1, độ cao 25m, phát hiện nứt tấm BTXM và vỡ góc bản.'
  },
  {
    id: 'srv-02',
    code: 'SRV-2026-004',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    start_km: 1032.0,
    end_km: 1045.0,
    scheduled_date: '2026-09-02',
    pilot_name: 'Lê Hoàng Long (Drone Pilot)',
    status: SurveyStatus.COMPLETED,
    total_images: 1240,
    detected_defects_count: 0,
    notes: 'Bay quét kiểm tra tình trạng khe giãn nở và độ chênh cốt mố cầu sau đợt bão số 4.'
  },
  {
    id: 'srv-03',
    code: 'SRV-2026-005',
    project_id: 'prj-gtnt-hailang',
    project_name: 'Đường BTXM liên xã Hải Lăng - Quảng Trị',
    start_km: 0.0,
    end_km: 5.2,
    scheduled_date: '2026-09-10',
    pilot_name: 'Lê Hoàng Long (Drone Pilot)',
    status: SurveyStatus.COMPLETED,
    total_images: 450,
    detected_defects_count: 1,
    notes: 'Bay khảo sát định kỳ tuyến đường nông thôn theo tiêu chuẩn TCVN 10380:2014.'
  }
]

// =============================================================================
// TẦNG 3: OBSERVATION ENTITIES (HƯ HỎNG MẶT ĐƯỜNG BTXM DO AI PHÁT HIỆN)
// =============================================================================

export const mockDefects: Defect[] = [
  {
    id: 'def-0042',
    code: 'DEF-2026-0042',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_km: 1025.4,
    gps_lat: 16.2405,
    gps_lng: 108.1310,
    defect_type: DefectType.POTHOLE, // Vỡ góc bản / ổ gà góc tấm BTXM
    severity: Severity.CRITICAL,
    confidence_score: 0.94,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.32, y: 0.45, width: 0.28, height: 0.22 },
    length_m: 0.85,
    width_m: 0.65,
    depth_mm: 62,
    batch_id: 'pkg-05',
    created_at: '2026-08-20'
  },
  {
    id: 'def-0068',
    code: 'DEF-2026-0068',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_km: 1028.15,
    gps_lat: 16.2215,
    gps_lng: 108.1512,
    defect_type: DefectType.LONGITUDINAL_CRACK, // Nứt dọc mép tấm BTXM
    severity: Severity.HIGH,
    confidence_score: 0.89,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.42, y: 0.15, width: 0.12, height: 0.75 },
    length_m: 3.2,
    width_m: 0.08,
    depth_mm: 25,
    batch_id: 'pkg-05',
    created_at: '2026-08-21'
  },
  {
    id: 'def-0091',
    code: 'DEF-2026-0091',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_km: 1031.9,
    gps_lat: 16.1985,
    gps_lng: 108.1755,
    defect_type: DefectType.RUTTING, // Lún chênh cốt mác bê tông / Slab faulting
    severity: Severity.CRITICAL,
    confidence_score: 0.96,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.25, y: 0.35, width: 0.5, height: 0.35 },
    length_m: 4.8,
    width_m: 1.2,
    depth_mm: 48,
    batch_id: 'pkg-07',
    created_at: '2026-08-22'
  },
  {
    id: 'def-0029',
    code: 'DEF-2026-0029',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_km: 1024.85,
    gps_lat: 16.2432,
    gps_lng: 108.1278,
    defect_type: DefectType.RUTTING, // Lún lệch khe nối bản BTXM
    severity: Severity.MEDIUM,
    confidence_score: 0.86,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.2, y: 0.2, width: 0.6, height: 0.5 },
    length_m: 14.0,
    width_m: 0.9,
    depth_mm: 26,
    batch_id: 'pkg-07',
    created_at: '2026-08-22'
  },
  {
    id: 'def-0096',
    code: 'DEF-2026-0096',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_km: 1024.45,
    gps_lat: 16.2458,
    gps_lng: 108.1245,
    defect_type: DefectType.TRANSVERSE_CRACK, // Nứt ngang tấm do ứng suất nhiệt
    severity: Severity.MEDIUM,
    confidence_score: 0.91,
    status: DefectStatus.OPEN, // Đang chờ thẩm định
    image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.1, y: 0.45, width: 0.8, height: 0.15 },
    length_m: 3.5,
    width_m: 0.04,
    depth_mm: 18,
    batch_id: undefined,
    created_at: '2026-08-23'
  }
]

// 3.2 Triage Cases đồng bộ 1:1 với Defects & Hộp thư tiếp nhận
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
  // Thông tin mở rộng cho tiếp nhận & điều phối phản ánh người dân (PA03, PA04)
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
  // Cụm trùng lặp lân cận (Spatial cluster)
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

export const mockTriageCases: TriageCase[] = [
  {
    id: 'cas-01',
    code: '#CAS-2026-0842',
    source: 'DRONE_AI',
    source_label: 'Drone AI Scan',
    source_detail: 'Hệ thống Drone AI Scan (Tổ bay Cam 04 - Matrice 300 RTK)',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    stationing: 'Km 1025+400',
    lane: 'Làn xe cơ giới',
    defect_title: 'Vỡ góc bản bê tông xi măng (Corner Break L3)',
    defect_type: 'POTHOLE',
    severity: 'CRITICAL',
    urgency: 'EMERGENCY',
    time_ago: '15 phút trước',
    created_at: '21:30, 25/08/2026',
    status: 'VERIFIED',
    status_label: 'Đã xác minh',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.2405,
      lng: 108.1310,
      altitude_m: 25.0,
      resolution_cm_px: 0.4
    },
    ai_confidence: 94.0,
    area_sqm: 0.85,
    ai_area_sqm: 0.82,
    max_depth_cm: 6.2,
    ai_depth_cm: 6.0,
    pm_notes: 'Đã kiểm tra góc bản vỡ tại khe co giãn tấm SLAB-1025-08. Yêu cầu đục tẩy cấy thép dowel phi 28 và đổ bê tông ninh kết nhanh M350.',
    cluster_duplicates: [
      {
        code: '#CAS-2026-0839',
        source: 'Citizen App',
        distance_m: 1.8,
        reporter: 'Nguyễn Văn A báo lúc 19:40',
        selected: true
      }
    ]
  },
  {
    id: 'cas-02',
    code: '#CAS-2026-0841',
    source: 'DRONE_AI',
    source_label: 'Drone AI Scan',
    source_detail: 'Hệ thống Drone AI Scan (Tổ bay Cam 04 - Matrice 300 RTK)',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    stationing: 'Km 1028+150',
    lane: 'Làn mép ngoài',
    defect_title: 'Nứt dọc mép tấm bê tông (Longitudinal Crack)',
    defect_type: 'LONGITUDINAL_CRACK',
    severity: 'HIGH',
    urgency: 'URGENT',
    time_ago: '45 phút trước',
    created_at: '20:45, 25/08/2026',
    status: 'VERIFIED',
    status_label: 'Đã xác minh',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.2215,
      lng: 108.1512,
      altitude_m: 25.0,
      resolution_cm_px: 0.4
    },
    ai_confidence: 89.0,
    area_sqm: 0.25,
    ai_area_sqm: 0.24,
    max_depth_cm: 2.5,
    ai_depth_cm: 2.4,
    pm_notes: 'Vết nứt dọc dài 3.2m trên tấm SLAB-1028-03. Cắt mở rộng và trám mastic bitum-polyme theo TCVN 8864.'
  },
  {
    id: 'cas-03',
    code: '#CAS-2026-0840',
    source: 'DRONE_AI',
    source_label: 'Drone AI Scan',
    source_detail: 'Hệ thống Drone AI Scan (Tổ bay Cam 04 - Matrice 300 RTK)',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    stationing: 'Km 1031+900',
    lane: 'Làn xe cơ giới',
    defect_title: 'Lún chênh cốt tấm khe co giãn (Slab Faulting)',
    defect_type: 'RUTTING',
    severity: 'CRITICAL',
    urgency: 'EMERGENCY',
    time_ago: '1 giờ trước',
    created_at: '20:15, 25/08/2026',
    status: 'VERIFIED',
    status_label: 'Đã xác minh',
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.1985,
      lng: 108.1755,
      altitude_m: 25.0,
      resolution_cm_px: 0.4
    },
    ai_confidence: 96.0,
    area_sqm: 5.76,
    ai_area_sqm: 5.70,
    max_depth_cm: 4.8,
    ai_depth_cm: 4.6,
    pm_notes: 'Độ chênh cốt mép tấm vượt 48mm tại khe JT-1031-18. Bơm vữa xi măng không co ngót nâng tấm.'
  },
  {
    id: 'cas-04',
    code: '#CAS-2026-0836',
    source: 'DRONE_AI',
    source_label: 'Drone AI Scan',
    source_detail: 'Hệ thống Drone AI Scan (Tổ bay Cam 04)',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    stationing: 'Km 1024+450',
    lane: 'Làn giữa',
    defect_title: 'Nứt ngang co ngót nhiệt tấm BTXM',
    defect_type: 'TRANSVERSE_CRACK',
    severity: 'MEDIUM',
    urgency: 'NORMAL',
    time_ago: '2 giờ trước',
    created_at: '19:30, 25/08/2026',
    status: 'PENDING',
    status_label: 'Chờ thẩm định',
    image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.2458,
      lng: 108.1245,
      altitude_m: 25.0,
      resolution_cm_px: 0.4
    },
    ai_confidence: 91.0,
    area_sqm: 0.14,
    ai_area_sqm: 0.13,
    max_depth_cm: 1.8,
    ai_depth_cm: 1.8,
    pm_notes: 'Vết nứt ngang giữa tấm SLAB-1024-22. Cần kiểm tra độ mở rộng vết nứt.'
  },
  {
    id: 'cas-05',
    code: '#REP-2026-0012',
    source: 'CITIZEN',
    source_label: 'Citizen App',
    source_detail: 'Phản ánh người dân qua App Dịch Vụ Công Đường Bộ',
    reporter_name: 'Nguyễn Văn Nam',
    reporter_phone: '0912.334.891',
    reporter_channel: 'Ứng dụng Di động Citizen',
    description: 'Ổ gà sâu khoảng 7-8cm ngay trước mố cầu vượt, gờ sắt hở ra rất nguy hiểm cho xe máy vào ban đêm.',
    project_id: '',
    project_name: 'Chưa điều phối dự án',
    is_assigned: false,
    stationing: 'Km 1025+390',
    lane: 'Làn xe máy / Mép phải',
    defect_title: 'Ổ gà sâu cạnh khe co giãn (Pothole)',
    defect_type: 'POTHOLE',
    severity: 'HIGH',
    urgency: 'URGENT',
    time_ago: '25 phút trước',
    created_at: '21:05, 25/08/2026',
    status: 'PENDING',
    status_label: 'Chờ tiếp nhận & điều phối',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.2406,
      lng: 108.1311,
      altitude_m: 24.5,
      resolution_cm_px: 1.2
    },
    ai_confidence: 88.0,
    area_sqm: 0.75,
    ai_area_sqm: 0.70,
    max_depth_cm: 7.5,
    ai_depth_cm: 7.0,
    pm_notes: '',
    cluster_duplicates: [
      {
        code: '#REP-2026-0013',
        source: 'Hotline 1900-8864',
        distance_m: 1.5,
        reporter: 'Trần Thị Mai (0983.124.556)',
        selected: true
      }
    ]
  },
  {
    id: 'cas-06',
    code: '#REP-2026-0013',
    source: 'CITIZEN',
    source_label: 'Hotline 1900-8864',
    source_detail: 'Tổng đài Đường Dây Nóng Hoàng Hải tiếp nhận',
    reporter_name: 'Trần Thị Mai',
    reporter_phone: '0983.124.556',
    reporter_channel: 'Hotline Tiếp Nhận 1900-8864',
    description: 'Xe tải nặng đánh lái làm vỡ mép tấm đan bê tông trước quán cơm Km 1025+410, đất đá vụn rơi vãi ra mặt đường.',
    project_id: '',
    project_name: 'Chưa điều phối dự án',
    is_assigned: false,
    stationing: 'Km 1025+410',
    lane: 'Làn xe thô sơ',
    defect_title: 'Vỡ cạnh mép tấm BTXM lân cận',
    defect_type: 'POTHOLE',
    severity: 'HIGH',
    urgency: 'URGENT',
    time_ago: '35 phút trước',
    created_at: '20:55, 25/08/2026',
    status: 'PENDING',
    status_label: 'Chờ tiếp nhận & điều phối',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.2404,
      lng: 108.1309,
      altitude_m: 24.8,
      resolution_cm_px: 1.5
    },
    ai_confidence: 85.0,
    area_sqm: 0.60,
    ai_area_sqm: 0.55,
    max_depth_cm: 5.5,
    ai_depth_cm: 5.0,
    pm_notes: '',
    cluster_duplicates: [
      {
        code: '#REP-2026-0012',
        source: 'Citizen App',
        distance_m: 1.5,
        reporter: 'Nguyễn Văn Nam (0912.334.891)',
        selected: true
      }
    ]
  },
  {
    id: 'cas-07',
    code: '#REP-2026-0015',
    source: 'PATROL',
    source_label: 'Tuần tra hiện trường',
    source_detail: 'Xe tuần kiểm Hạt QLĐB Hải Lăng - Đội tuần số 02',
    reporter_name: 'Tổ tuần kiểm Đội 02',
    reporter_phone: '0905.789.123',
    reporter_channel: 'Xe tuần kiểm Hạt QLĐB',
    description: 'Phát hiện nứt dọc dạng rạn chân chim kéo dài 15m trên tuyến BTXM liên xã Hải Lăng, nước mưa thấm xuống móng gây bùn.',
    project_id: 'prj-gtnt-hailang',
    project_name: 'Đường BTXM liên xã Hải Lăng - Quảng Trị',
    is_assigned: true,
    stationing: 'Km 03+250',
    lane: 'Làn trái',
    defect_title: 'Nứt rạn chân chim & lún cục bộ',
    defect_type: 'ALLIGATOR_CRACK',
    severity: 'MEDIUM',
    urgency: 'NORMAL',
    time_ago: '3 giờ trước',
    created_at: '18:30, 25/08/2026',
    status: 'PENDING',
    status_label: 'Chờ thẩm định',
    image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.6980,
      lng: 107.2510,
      altitude_m: 15.0,
      resolution_cm_px: 0.8
    },
    ai_confidence: 92.0,
    area_sqm: 4.2,
    ai_area_sqm: 4.0,
    max_depth_cm: 2.0,
    ai_depth_cm: 2.0,
    pm_notes: ''
  },
  {
    id: 'cas-08',
    code: '#REP-2026-0009',
    source: 'CITIZEN',
    source_label: 'Citizen App',
    source_detail: 'Phản ánh người dân qua App Dịch Vụ Công',
    reporter_name: 'Lê Hoàng Long',
    reporter_phone: '0935.667.889',
    reporter_channel: 'Ứng dụng Di động Citizen',
    description: 'Rác và bùn đất tràn mặt đường mép rãnh thoát nước sau mưa, không có hiện tượng nứt vỡ kết cấu bê tông.',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    is_assigned: true,
    stationing: 'Km 1022+100',
    lane: 'Làn xe máy',
    defect_title: 'Bùn đất tràn mép đường',
    defect_type: 'OTHER',
    severity: 'LOW',
    urgency: 'NORMAL',
    time_ago: '5 giờ trước',
    created_at: '16:15, 25/08/2026',
    status: 'REJECTED',
    status_label: 'Đã từ chối (No Defect)',
    conclusion: 'NO_DEFECT',
    conclusion_reason: 'Không thuộc hạng mục hư hỏng kết cấu bê tông xi măng bảo hành. Đã chuyển Công ty Môi trường đô thị xử lý thu dọn bùn rãnh.',
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.2410,
      lng: 108.1280,
      altitude_m: 23.0,
      resolution_cm_px: 1.0
    },
    ai_confidence: 65.0,
    area_sqm: 1.5,
    ai_area_sqm: 1.2,
    max_depth_cm: 0.0,
    ai_depth_cm: 0.0,
    pm_notes: '[TỪ CHỐI - NO_DEFECT] Không thuộc hư hỏng kết cấu bảo hành.'
  }
]

// =============================================================================
// TẦNG 4: ACTION ENTITIES (ĐỢT SỬA CHỮA, LỆNH THI CÔNG & NHIỆM VỤ HIỆN TRƯỜNG)
// =============================================================================

// 4.1 Chi tiết hạng mục thi công (BOQ) - Chi phí phái sinh từ số lượng * đơn giá
export const mockRepairItems: RepairItem[] = [
  {
    id: 'itm-01',
    defect_id: 'def-0042',
    task_name: 'Đục tẩy góc bản BTXM vỡ, khoan cấy thép dowel và đổ bê tông ninh kết nhanh M350',
    unit: 'm2',
    quantity: 12.5,
    unit_price: 1850000,
    total_price: 23125000 // 12.5 * 1850000
  },
  {
    id: 'itm-02',
    defect_id: 'def-0068',
    task_name: 'Cắt mở rộng và trám chèn khe nứt mặt đường BTXM bằng mastic bitum-polyme nóng TCVN 8864',
    unit: 'm',
    quantity: 45.0,
    unit_price: 95000,
    total_price: 4275000 // 45 * 95000
  },
  {
    id: 'itm-03',
    defect_id: 'def-0091',
    task_name: 'Bơm vữa xi măng không co ngót nâng tấm bản BTXM bị lún chênh cốt (Slab jacking)',
    unit: 'vị trí',
    quantity: 2,
    unit_price: 18500000,
    total_price: 37000000 // 2 * 18500000
  },
  {
    id: 'itm-04',
    defect_id: 'def-0029',
    task_name: 'Sửa chữa khe co giãn ngang, thay thế thanh truyền lực dowel bar phi 28 và chèn đệm xốp',
    unit: 'm',
    quantity: 15.0,
    unit_price: 450000,
    total_price: 6750000 // 15 * 450000
  }
]

// 4.2 Đợt sửa chữa (Repair Batches / Proposals)
export const mockRepairBatches: RepairBatch[] = [
  {
    id: 'pkg-05',
    code: 'PKG-2026-05',
    name: 'Xử lý vỡ góc bản & trám chèn khe nứt BTXM Km 1025 - Km 1028',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    status: RepairBatchStatus.APPROVED,
    items: [mockRepairItems[0], mockRepairItems[1]],
    defects: [mockDefects[0], mockDefects[1]],
    estimated_total_cost: 27400000, // 23125000 + 4275000 (SUM chính xác)
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    assigned_crew_name: 'Đội thi công sửa chữa Hoàng Hải 01',
    deadline: '2026-09-15',
    created_at: '2026-08-24',
    approved_at: '2026-08-25'
  },
  {
    id: 'pkg-07',
    code: 'PKG-2026-07',
    name: 'Nâng chốt dowel & bù phụ chênh cốt tấm BTXM Km 1028 - Km 1033',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    status: RepairBatchStatus.IN_PROGRESS,
    items: [mockRepairItems[2], mockRepairItems[3]],
    defects: [mockDefects[2], mockDefects[3]],
    estimated_total_cost: 43750000, // 37000000 + 6750000 (SUM chính xác)
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    assigned_crew_name: 'Tổ cơ động sửa chữa BTXM 02',
    deadline: '2026-09-30',
    created_at: '2026-08-26',
    approved_at: '2026-08-27'
  }
]

// 4.3 Nhiệm vụ đo đạc bổ sung ngoài hiện trường (Field Tasks)
export const mockFieldTasks: FieldTask[] = [
  {
    id: 'ft-01',
    code: 'TSK-MEAS-1025',
    defect_id: 'def-0042',
    defect_code: 'DEF-2026-0042',
    measurement_type: 'Đo dưỡng chiều sâu vỡ góc bản BTXM & diện tích bóc tách',
    chainage_km: 1025.4,
    status: 'SUBMITTED',
    measured_value: 62,
    evidence_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    technician_name: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)'
  },
  {
    id: 'ft-02',
    code: 'TSK-POL-1028',
    defect_id: 'def-0068',
    defect_code: 'DEF-2026-0068',
    measurement_type: 'Thước đo kính hiển vi quang học độ mở rộng khe nứt BTXM',
    chainage_km: 1028.15,
    status: 'SUBMITTED',
    measured_value: 25,
    evidence_photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
    technician_name: 'Kỹ sư Lê Quốc Tuấn (Đội tuần đường)'
  },
  {
    id: 'ft-03',
    code: 'TSK-RSC-1031',
    defect_id: 'def-0091',
    defect_code: 'DEF-2026-0091',
    measurement_type: 'Thước laser trắc địa đo độ chênh cốt hai mép khe co giãn tấm BTXM',
    chainage_km: 1031.9,
    status: 'SUBMITTED',
    measured_value: 48,
    evidence_photo_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    technician_name: 'Kỹ sư Hoàng Văn Bách (Tổ kết cấu)'
  }
]

// 4.4 Lệnh thi công (Work Orders)
export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-01',
    code: 'WO-2026-001',
    batch_id: 'pkg-05',
    batch_code: 'PKG-2026-05',
    assigned_crew_name: 'Đội thi công sửa chữa Hoàng Hải 01',
    status: 'IN_PROGRESS',
    before_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    after_photo_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    crew_notes: 'Đã hoàn tất đục tẩy góc bản vỡ 12.5m2, cấy thanh dowel phi 28, đang đổ bê tông ninh kết nhanh M350.',
    completed_at: '2026-08-28'
  },
  {
    id: 'wo-02',
    code: 'WO-2026-002',
    batch_id: 'pkg-07',
    batch_code: 'PKG-2026-07',
    assigned_crew_name: 'Tổ cơ động sửa chữa BTXM 02',
    status: 'IN_PROGRESS',
    before_photo_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    crew_notes: 'Đang triển khai kích nâng tấm bản và bơm vữa không co ngót dưới gầm tấm.',
    completed_at: undefined
  }
]

// 4.5 Biên bản nghiệm thu (Inspection Records)
export const mockInspectionRecords: InspectionRecord[] = [
  {
    id: 'insp-01',
    batch_id: 'pkg-05',
    defect_id: 'def-0042',
    defect_code: 'DEF-2026-0042',
    supervisor_name: 'Kỹ sư Nguyễn Văn An (Giám sát)',
    result: InspectionResult.PASSED,
    notes: 'Bê tông ninh kết nhanh M350 đạt cường độ nén R3 > 30MPa, phẳng phiu bằng phẳng với mép tấm lân cận.',
    inspected_at: '2026-08-29'
  }
]

// 4.6 Xử lý xung đột ngoại tuyến (Sync Conflicts)
export const mockSyncConflicts: SyncConflictItem[] = [
  {
    id: 'conf-01',
    conflict_code: '#CONF-2026-081',
    task_code: 'TSK-MEAS-1025',
    defect_code: 'DEF-2026-0042',
    defect_type_label: 'Vỡ góc bản bê tông xi măng (Corner Break)',
    route_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage: 'Km 1025+400 (Làn xe cơ giới)',
    conflict_type: 'ASSIGNMENT_REASSIGNED',
    conflict_type_label: 'Đổi đội khi ngoại tuyến (D05/Q04)',
    severity: 'HIGH',
    status: 'CONFLICT_INTAKE',
    status_label: 'Chờ PM phân giải (Đổi đội)',
    offline_actor: {
      name: 'Kỹ sư Phạm Văn Hùng',
      role: 'Đội trưởng thi công',
      team: 'Tổ cơ động sửa chữa BTXM 02',
      device_id: 'DEV-HH-TAB-882',
      device_model: 'Samsung Galaxy Tab Active 4 Pro',
      offline_duration: '6 giờ 25 phút (vùng lõm sóng đèo)',
      captured_at: '24/08/2026 - 10:15:22'
    },
    incoming_data: {
      measurement_type: 'Đo dưỡng chiều sâu & diện tích vỡ góc bản thực tế',
      measured_value: '62 mm (Sâu) / 0.85 m² (Diện tích vỡ)',
      depth_mm: 62,
      area_m2: 0.85,
      photo_evidence_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
      sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      gps_coords: '16.2405° N, 108.1310° E (Sai số ±0.03m RTK)',
      accuracy_m: 0.03,
      notes: 'Đã dùng thước góc đo cẩn thận, vết vỡ ăn sâu xuống lớp móng CPĐD.'
    },
    server_state: {
      initial_assignee: 'Đội thi công cơ giới Hoàng Hải',
      current_assignee: 'Đội thi công sửa chữa Hoàng Hải 01',
      current_status: 'ASSIGNED',
      policy_version: 'POL-MNT-2026-v2',
      policy_summary: 'Ưu tiên đội chuyên trách BTXM',
      last_updated: '24/08/2026 - 08:00:00',
      server_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      server_notes: 'Chỉ định lại cho Đội 01 để tập trung vật tư xi măng đặc chủng.'
    }
  }
]

// =============================================================================
// TẦNG 5: AGGREGATED STATS & DERIVED ANALYTICS (TÍNH TOÁN TRỰC TIẾP, KHÔNG TỰ BỊA)
// =============================================================================

export function getPMDashboardStats() {
  const totalSurveys = mockSurveys.length
  const openDefects = mockDefects.filter(d => d.status === DefectStatus.OPEN).length
  const criticalDefects = mockDefects.filter(d => d.severity === Severity.CRITICAL).length
  const activeBatches = mockRepairBatches.filter(
    b => b.status === RepairBatchStatus.IN_PROGRESS || b.status === RepairBatchStatus.PENDING_APPROVAL
  ).length
  const totalEstimatedCost = mockRepairBatches.reduce((acc, b) => acc + b.estimated_total_cost, 0)

  return {
    totalSurveys,
    openDefects,
    criticalDefects,
    activeBatches,
    totalEstimatedCost
  }
}

export function getSupervisorStats() {
  const pendingApprovals = mockRepairBatches.filter(
    b => b.status === RepairBatchStatus.PENDING_APPROVAL
  ).length
  const verifiedDefects = mockDefects.filter(d => d.status === DefectStatus.VERIFIED).length
  const completedWorkOrders = mockWorkOrders.filter(w => w.status === 'COMPLETED').length
  const activeWorkOrders = mockWorkOrders.filter(w => w.status === 'IN_PROGRESS').length

  return {
    pendingApprovals,
    verifiedDefects,
    completedWorkOrders,
    activeWorkOrders
  }
}

export function getDefectDistributionByType() {
  return mockDefects.reduce((acc, d) => {
    acc[d.defect_type] = (acc[d.defect_type] || 0) + 1
    return acc
  }, {} as Record<DefectType, number>)
}

export function getDefectDistributionBySeverity() {
  return mockDefects.reduce((acc, d) => {
    acc[d.severity] = (acc[d.severity] || 0) + 1
    return acc
  }, {} as Record<Severity, number>)
}

// =============================================================================
// KIỂM ĐỊNH KHOA HỌC RPT-09 (RESEARCH VALIDATION & BENCHMARK)
// =============================================================================

export const mockAcademicMetrics: AcademicMetrics = {
  mAP50_95: 89.4,
  map50_95: 89.4,
  mAP_delta: '+2.3% vs v2.3.0',
  map50_95_delta: '+2.3% vs v2.3.0',
  precision: 92.1,
  precision_delta: '+1.5% vs v2.3.0',
  false_positives: 24,
  false_positives_ratio: 0.042,
  total_samples: 1250,
  recall: 88.6,
  recall_delta: '-0.8%',
  false_negatives_ratio: 0.058,
  f1_score: 0.903,
  is_certified: true
}

export const mockConfusionMatrixHeaders = [
  'Vỡ góc bản (Corner Break)',
  'Nứt dọc (Longitudinal)',
  'Nứt ngang (Transverse)',
  'Lệch tấm (Slab Fault)',
  'Mặt đường tốt (Normal)'
]

export const mockConfusionMatrixRows: {
  gt_name: string
  cells: ConfusionMatrixCell[]
}[] = [
  {
    gt_name: 'Vỡ góc bản BTXM (Corner Break / Pothole)',
    cells: [
      { gt_class: 'CornerBreak', pred_class: 'CornerBreak', percentage: 94.2, count: 242, is_true_positive: true },
      { gt_class: 'CornerBreak', pred_class: 'Longit', percentage: 2.1, count: 5 },
      { gt_class: 'CornerBreak', pred_class: 'Transverse', percentage: 2.4, count: 6 },
      { gt_class: 'CornerBreak', pred_class: 'SlabFault', percentage: 0.5, count: 1 },
      { gt_class: 'CornerBreak', pred_class: 'Normal', percentage: 0.8, count: 2, is_false_negative: true }
    ]
  },
  {
    gt_name: 'Nứt dọc mép tấm (Longitudinal Crack)',
    cells: [
      { gt_class: 'Longit', pred_class: 'CornerBreak', percentage: 1.1, count: 4 },
      { gt_class: 'Longit', pred_class: 'Longit', percentage: 89.8, count: 310, is_true_positive: true },
      { gt_class: 'Longit', pred_class: 'Transverse', percentage: 5.2, count: 18 },
      { gt_class: 'Longit', pred_class: 'SlabFault', percentage: 1.7, count: 6 },
      { gt_class: 'Longit', pred_class: 'Normal', percentage: 2.2, count: 8, is_false_negative: true }
    ]
  },
  {
    gt_name: 'Nứt ngang co ngót nhiệt (Transverse Crack)',
    cells: [
      { gt_class: 'Transverse', pred_class: 'CornerBreak', percentage: 1.2, count: 4 },
      { gt_class: 'Transverse', pred_class: 'Longit', percentage: 4.8, count: 17 },
      { gt_class: 'Transverse', pred_class: 'Transverse', percentage: 91.0, count: 320, is_true_positive: true },
      { gt_class: 'Transverse', pred_class: 'SlabFault', percentage: 1.5, count: 5 },
      { gt_class: 'Transverse', pred_class: 'Normal', percentage: 1.5, count: 5, is_false_negative: true }
    ]
  },
  {
    gt_name: 'Lệch mức khe nối tấm (Slab Faulting)',
    cells: [
      { gt_class: 'SlabFault', pred_class: 'CornerBreak', percentage: 0.3, count: 1 },
      { gt_class: 'SlabFault', pred_class: 'Longit', percentage: 2.1, count: 7 },
      { gt_class: 'SlabFault', pred_class: 'Transverse', percentage: 3.4, count: 11 },
      { gt_class: 'SlabFault', pred_class: 'SlabFault', percentage: 87.1, count: 284, is_true_positive: true },
      { gt_class: 'SlabFault', pred_class: 'Normal', percentage: 7.1, count: 23, is_false_negative: true }
    ]
  },
  {
    gt_name: 'Mặt đường bình thường (Normal Surface)',
    cells: [
      { gt_class: 'Normal', pred_class: 'CornerBreak', percentage: 0.5, count: 4, is_false_positive: true },
      { gt_class: 'Normal', pred_class: 'Longit', percentage: 2.8, count: 22, is_false_positive: true },
      { gt_class: 'Normal', pred_class: 'Transverse', percentage: 1.1, count: 9, is_false_positive: true },
      { gt_class: 'Normal', pred_class: 'SlabFault', percentage: 0.9, count: 7, is_false_positive: true },
      { gt_class: 'Normal', pred_class: 'Normal', percentage: 94.7, count: 745, is_true_positive: true }
    ]
  }
]

export const mockConfusionMatrix: ConfusionMatrixCell[] = [
  { gt_class: 'POTHOLE', pred_class: 'POTHOLE', percentage: 94.2, count: 242, is_true_positive: true },
  { gt_class: 'POTHOLE', pred_class: 'LONGITUDINAL_CRACK', percentage: 2.1, count: 5, is_false_negative: true },
  { gt_class: 'POTHOLE', pred_class: 'TRANSVERSE_CRACK', percentage: 3.7, count: 9, is_false_negative: true },
  { gt_class: 'LONGITUDINAL_CRACK', pred_class: 'LONGITUDINAL_CRACK', percentage: 89.5, count: 310, is_true_positive: true },
  { gt_class: 'LONGITUDINAL_CRACK', pred_class: 'TRANSVERSE_CRACK', percentage: 8.2, count: 28, is_false_negative: true },
  { gt_class: 'TRANSVERSE_CRACK', pred_class: 'TRANSVERSE_CRACK', percentage: 91.0, count: 320, is_true_positive: true },
  { gt_class: 'TRANSVERSE_CRACK', pred_class: 'LONGITUDINAL_CRACK', percentage: 7.4, count: 26, is_false_negative: true }
]

export const mockSizeErrorBins: SizeErrorBin[] = [
  { range_label: '< -10 mm', percentage: 1.4, bar_height_percent: 6 },
  { range_label: '-8 mm', percentage: 4.2, bar_height_percent: 16 },
  { range_label: '-4 mm', percentage: 14.8, bar_height_percent: 48 },
  { range_label: '±0 mm', percentage: 48.2, bar_height_percent: 94, is_center: true },
  { range_label: '+4 mm', percentage: 22.1, bar_height_percent: 64 },
  { range_label: '+8 mm', percentage: 6.5, bar_height_percent: 22 },
  { range_label: '> +10 mm', percentage: 2.8, bar_height_percent: 10 }
]

export const mockSizeErrorDistribution = mockSizeErrorBins

export const mockFPFNInspectorItems: FPFNInspectorItem[] = [
  {
    id: 'fpfn-01',
    defect_code: 'DEF-QL1A-KM1025-042',
    survey_code: 'SRV-2026-003',
    frame_number: 1042,
    type: 'FP',
    gt_class: 'Normal',
    pred_class: 'Longit',
    chainage: 'Km 1025+400',
    lane: 'Làn xe cơ giới 1',
    ai_confidence: 54.2,
    ground_truth_label: 'Mặt đường BTXM bình thường (Có bóng râm cây xanh)',
    predicted_label: 'Nứt dọc mép tấm (LONGITUDINAL_CRACK)',
    description: 'Bóng râm cành cây ven taluy vào lúc 14:15 bị mô hình trích xuất thành vết nứt dọc do tương phản quang học. Cần loại trừ nhãn giả theo FR-36.',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    suggested_action: 'PM duyệt từ chối nhãn (REJECT) theo FR-36',
    status: 'PENDING'
  },
  {
    id: 'fpfn-02',
    defect_code: 'DEF-QL1A-KM1028-150',
    survey_code: 'SRV-2026-003',
    frame_number: 1820,
    type: 'FN',
    gt_class: 'Transverse',
    pred_class: 'Normal',
    chainage: 'Km 1028+150',
    lane: 'Làn xe cơ giới 2',
    ai_confidence: 0.0,
    ground_truth_label: 'Nứt ngang co ngót nhiệt tấm BTXM (TRANSVERSE_CRACK)',
    predicted_label: 'Bỏ sót (Missed Detection / False Negative)',
    description: 'Bề mặt tấm còn đọng nước sau mưa làm giảm độ tương phản, mô hình bỏ sót vết nứt tế vi dưới 2mm.',
    image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=800&q=80',
    suggested_action: 'Gán nhãn bổ sung cho tập huấn luyện (Retrain Dataset)',
    status: 'PENDING'
  }
]

export const mockMeasurementValidationSamples: MeasurementValidationSample[] = [
  {
    id: 'sample-01',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1025-001',
    defect_type_code: 'POTHOLE',
    defect_name_vi: 'Vỡ góc bản BTXM',
    chainage_km: 1025.4,
    ground_truth_value: 62.0,
    derived_value: 60.5,
    unit: 'mm',
    signed_error: -1.5,
    absolute_error: 1.5,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước nêm cơ học & Thước góc đo sâu điện tử',
    measured_by: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)'
  },
  {
    id: 'sample-02',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1028-002',
    defect_type_code: 'SLAB_FAULTING',
    defect_name_vi: 'Chênh cốt mép khe co giãn tấm BTXM',
    chainage_km: 1031.9,
    ground_truth_value: 48.0,
    derived_value: 46.8,
    unit: 'mm',
    signed_error: -1.2,
    absolute_error: 1.2,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước thẳng 3m & Thước trắc địa laser',
    measured_by: 'Kỹ sư Hoàng Văn Bách (Tổ kết cấu)'
  }
]

export const mockActiveValidationRun: MeasurementValidationRun = {
  id: 'val-run-01',
  run_code: 'VAL-RUN-2026-03',
  measurement_type: 'DEPRESSION_DEPTH',
  method_name: 'Mô hình bề mặt DSM tái tạo từ Drone (GSD 0.8cm/px) vs Thước nêm cơ học tiêu chuẩn TCVN 8864',
  algorithm_version: 'RoadGuard-Surface-Reconstruction v2.4.1',
  dataset_name: 'Tập dữ liệu kiểm định hiện trường QL1A-GT-2026 (Km 1020 - Km 1045)',
  sample_count: 120,
  used_count: 112,
  excluded_count: 8,
  bias: 1.2,
  mae: 3.8,
  rmse: 5.2,
  uncertainty_value: 2.4,
  uncertainty_method: 'Bootstrap 95% Confidence Interval (1,000 resamples)',
  status: 'COMPLETED',
  is_mock_data: false,
  executed_at: '26/08/2026 15:00',
  triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
  triggered_by_role: 'Chỉ huy trưởng (PM)',
  progress_percent: 100
}

export const mockMeasurementValidationRuns: MeasurementValidationRun[] = [
  mockActiveValidationRun,
  {
    id: 'val-run-02',
    run_code: 'VAL-RUN-2026-02',
    measurement_type: 'SLAB_FAULTING_HEIGHT',
    method_name: 'Mô hình 3D đám mây điểm LiDAR vs Thước thẳng 3m cơ học',
    algorithm_version: 'LiDAR-PointCloud-Surface v2.1.0',
    dataset_name: 'QL1A-Pilot-Phase1 (Km 1020 - Km 1030)',
    sample_count: 85,
    used_count: 80,
    excluded_count: 5,
    bias: -0.6,
    mae: 2.9,
    rmse: 4.1,
    uncertainty_value: 1.8,
    uncertainty_method: 'Standard Gaussian 2-sigma',
    status: 'COMPLETED',
    is_mock_data: false,
    executed_at: '15/08/2026 09:30',
    triggered_by_name: 'Kỹ sư Nguyễn Văn An',
    triggered_by_role: 'Giám sát trưởng (Supervisor)',
    progress_percent: 100
  }
]

export const mockValidationBenchmarks: ValidationBenchmarkRun[] = [
  {
    id: 'val-09',
    run_code: 'VAL-2026-09',
    model_name: 'RoadGuard-AI-Core',
    backbone: 'v2.4.1 (YOLO-RoadInfrastructure)',
    dataset_name: 'QL1A-GT-Val-Split-B3',
    dataset_frames: 1200,
    executed_at: '25/08/2026 14:30',
    triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
    triggered_by_role: 'Chỉ huy trưởng (PM)',
    map50_95: 89.4,
    status: 'RUNNING',
    status_label: 'Đang chạy 42%',
    progress_percent: 42,
    log_output: 'Tiến trình Job #VAL-2026-09: Đang tính ma trận ghép cặp đối soát IoU... Đã xử lý 4,200/10,000 frames. Ước lượng mAP@0.5:0.95 = 0.894.'
  }
]

// =============================================================================
// NHẬT KÝ KIỂM TOÁN RPT-10 (AUDIT TRAIL) TRỎ ĐÚNG ROUTE VÀ ENTITY ID THẬT
// =============================================================================

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'evt-001',
    event_id: 'DEDUP-EVT-2026-001',
    occurred_at: '2026-08-25T08:30:00Z',
    occurred_at_local: '25/08/2026 15:30:00',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-sup-01',
    actor_name: 'Kỹ sư Nguyễn Văn An',
    actor_role: RoleCode.SUPERVISOR,
    actor_role_label: 'Kỹ sư Giám sát',
    action_type: 'APPROVE_BATCH',
    action_label_vi: 'Phê duyệt đợt sửa chữa',
    action_badge_style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    target_entity_type: 'REPAIR_BATCH',
    target_entity_id: 'pkg-05',
    target_entity_name: 'Gói sửa chữa PKG-2026-05',
    target_location: 'Km 1025+400 - Km 1028+150',
    from_status: RepairBatchStatus.PENDING_APPROVAL,
    to_status: RepairBatchStatus.APPROVED,
    reason: 'Đã thẩm duyệt giải pháp đục tẩy góc bản vỡ và trám mastic bitum-polyme theo TCVN 8864.',
    after_state: { status: 'APPROVED', approved_by: 'usr-sup-01' }
  },
  {
    id: 'evt-002',
    event_id: 'DEDUP-EVT-2026-002',
    occurred_at: '2026-08-24T10:15:00Z',
    occurred_at_local: '24/08/2026 17:15:00',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-pm-01',
    actor_name: 'Đỗ Quốc Hoàng',
    actor_role: RoleCode.PROJECT_MANAGER,
    actor_role_label: 'Chỉ huy trưởng (PM)',
    action_type: 'SUBMIT_BATCH',
    action_label_vi: 'Trình duyệt hồ sơ đợt sửa',
    action_badge_style: 'bg-blue-50 text-blue-700 border-blue-200',
    target_entity_type: 'REPAIR_BATCH',
    target_entity_id: 'pkg-05',
    target_entity_name: 'Gói sửa chữa PKG-2026-05',
    target_location: 'Km 1025+400 - Km 1028+150',
    from_status: RepairBatchStatus.DRAFT,
    to_status: RepairBatchStatus.PENDING_APPROVAL,
    reason: 'Gom các hư hỏng nứt vỡ BTXM sau chuyến bay khảo sát SRV-2026-003.',
    after_state: { status: 'PENDING_APPROVAL', submitted_by: 'usr-pm-01' }
  }
]

export const mockAuditTrailStats: AuditTrailStats = {
  total_events: mockAuditEvents.length,
  state_transitions_count: 2,
  approval_decisions_count: 1,
  retention_compliance_note: 'Tuân thủ thời hạn lưu trữ BR-45 (Hết bảo hành + 5 năm)'
}

export const mockAuditStats = mockAuditTrailStats

// =============================================================================
// BẢNG THÔNG TIN QUẢN TRỊ HỆ THỐNG & PHÁP LÝ (WF-12)
// =============================================================================

export const mockSystemUserAccounts: SystemUserAccount[] = [
  {
    id: 'usr-pm-01',
    full_name: 'Đỗ Quốc Hoàng',
    email: 'pmhoang@gmail.com',
    phone: '0905.123.456',
    role: RoleCode.PROJECT_MANAGER,
    role_label: 'Chỉ huy trưởng (PM)',
    project_scope: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    project_id: 'prj-ql1a-02',
    device_info: 'MacBook Pro M2 / Chrome 128',
    ip_address: '113.161.44.82 (Đà Nẵng)',
    status: 'ACTIVE',
    last_active: 'Vừa xong',
    is_current_user: true
  },
  {
    id: 'usr-sup-01',
    full_name: 'Kỹ sư Nguyễn Văn An',
    email: 'suphoang@gmail.com',
    phone: '0913.456.789',
    role: RoleCode.SUPERVISOR,
    role_label: 'Giám sát kỹ thuật',
    project_scope: 'Toàn bộ gói thầu Hoàng Hải',
    device_info: 'Dell XPS 15 / Chrome 128',
    ip_address: '14.162.180.20 (Huế)',
    status: 'ACTIVE',
    last_active: '10 phút trước'
  }
]

export const mockAIModelRegistry: AIModelVersion[] = [
  {
    id: 'mod-yolo-v9',
    name: 'RoadGuard YOLOv9-Concrete-V4',
    version: 'v4.2.1-prod',
    status: 'ACTIVE',
    map_50: 89.4,
    recall: 86.8,
    f1_score: 88.1,
    deployed_at: '15/07/2026',
    sha256_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    fast_track_auto: true
  }
]

export const mockDefectSafetyCatalog: DefectCatalogItem[] = [
  {
    code: 'POTHOLE',
    name: 'Vỡ góc bản / Ổ gà BTXM',
    description: 'Bong bật vỡ góc hoặc vỡ mép tấm bê tông xi măng, chiều sâu > 25mm gây xóc nảy xe cơ giới.',
    standard_ref: 'TCVN 8864:2011',
    default_severity: Severity.CRITICAL,
    is_active: true
  },
  {
    code: 'LONGITUDINAL_CRACK',
    name: 'Nứt dọc mép tấm',
    description: 'Vết nứt chạy dọc theo chiều dài tấm BTXM hoặc theo vệt bánh xe, thường do mỏi uốn hoặc lún cục bộ lớp móng.',
    standard_ref: 'TCVN 8864:2011',
    default_severity: Severity.HIGH,
    is_active: true
  },
  {
    code: 'TRANSVERSE_CRACK',
    name: 'Nứt ngang co ngót nhiệt',
    description: 'Vết nứt vuông góc với tim tuyến xuyên suốt chiều rộng tấm do ứng suất kéo uốn nhiệt độ hoặc khe co giãn bị kẹt.',
    standard_ref: 'TCVN 8864:2011',
    default_severity: Severity.MEDIUM,
    is_active: true
  },
  {
    code: 'RUTTING',
    name: 'Lún chênh cốt tấm (Slab Faulting)',
    description: 'Hiện tượng chênh lệch cao độ giữa hai mép tấm bê tông tại khe co giãn ngang vượt quá 5mm.',
    standard_ref: 'TCVN 8864:2011',
    default_severity: Severity.HIGH,
    is_active: true
  }
]

export const mockLegalHoldProjects: LegalHoldProject[] = [
  {
    project_id: 'prj-ql1a-01',
    project_code: 'QL1A-01',
    project_name: 'Dự án QL1A - Giai đoạn 1 (Km 990 - Km 1020)',
    warranty_end_date: '01/01/2021',
    is_warranty_expired: true,
    years_since_warranty_end: 5.6,
    is_legal_hold: true,
    hold_reason: 'Thanh tra đột xuất hồ sơ hoàn công và kiểm tra chất lượng khe co giãn BTXM',
    hold_authority: 'Ban QLDA Thăng Long & Cục Đường Bộ Việt Nam',
    hold_reference: 'Công văn số 8492/BGTVT-TTr',
    hold_since: '18/08/2026 - 09:30:14 GMT+7'
  }
]

export const mockDataDeletionRequests: DataDeletionRequest[] = [
  {
    id: 'req-01',
    request_code: '#REQ-DEL-2026-01',
    project_id: 'prj-ql1a-01',
    project_name: 'Dự án QL1A - Giai đoạn 1 (Km 990 - Km 1020)',
    requested_by_id: 'usr-pm-01',
    requested_by_name: 'PM Đỗ Quốc Hoàng',
    requested_at: '24/08/2026 10:15:00',
    data_type: 'RAW_DRONE_MEDIA',
    data_description: 'Ảnh thô độ phân giải cao đợt bay quét QL1A Km 990 - Km 1010',
    data_size_gb: 420,
    warranty_end_date: '01/01/2021',
    years_since_warranty: 5.6,
    is_eligible_5years: true,
    status: 'PENDING_APPROVAL',
    blocked_by_legal_hold: true,
    justification_notes: 'Dự án đã kết thúc bảo hành trên 5 năm theo quy định BR-45.'
  }
]
