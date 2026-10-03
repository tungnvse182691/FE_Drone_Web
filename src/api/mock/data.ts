import { RoleCode, DefectStatus, DefectType, Severity, RepairBatchStatus, SurveyStatus, InspectionResult } from '../../types/enums'
import {
  User,
  Project,
  SurveyRequest,
  Defect,
  RepairBatch,
  FieldTask,
  WorkOrder,
  SyncConflictItem
} from '../../types/domain'

// =============================================================================
// 1. TÀI KHOẢN NGƯỜI DÙNG CHUẨN XUYÊN SUỐT HỆ THỐNG (HOÀNG HẢI ROADGUARD)
// =============================================================================
export const mockUsers: User[] = [
  {
    id: 'usr-pm-01',
    username: 'pmhoang@gmail.com',
    full_name: 'Đỗ Quốc Hoàng (PM)',
    email: 'pmhoang@gmail.com',
    role: RoleCode.PROJECT_MANAGER,
    must_change_password: false,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-sup-01',
    username: 'suphoang@gmail.com',
    full_name: 'Kỹ sư Nguyễn Văn An (Giám sát)',
    email: 'suphoang@gmail.com',
    role: RoleCode.SUPERVISOR,
    must_change_password: false,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
]

// =============================================================================
// 2. DANH MỤC DỰ ÁN ĐỒNG BỘ: QUỐC LỘ 1A - GIAI ĐOẠN 2 (KM 1024 - KM 1045)
// =============================================================================
export const mockProjects: Project[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2 (Gói thầu PK-04)',
    start_km: 1024.0,
    end_km: 1045.0,
    warranty_start: '2025-01-01',
    warranty_end: '2028-01-01',
    status: 'ACTIVE',
    total_defects: 42,
    pci_score: 78.5,
  },
  {
    id: 'prj-caotoc-03',
    code: 'PRJ-CT-BN03',
    name: 'Cao tốc Bắc - Nam Phía Đông (Gói thầu XL-03)',
    start_km: 120.0,
    end_km: 165.0,
    warranty_start: '2024-06-15',
    warranty_end: '2027-06-15',
    status: 'ACTIVE',
    total_defects: 68,
    pci_score: 84.2,
  },
]

// =============================================================================
// 3. DANH SÁCH CHUYẾN BAY KHẢO SÁT DRONE (SURVEY REQUESTS)
// =============================================================================
export const mockSurveys: SurveyRequest[] = [
  {
    id: 'srv-01',
    code: 'SRV-2026-003',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    start_km: 1024.0,
    end_km: 1032.0,
    scheduled_date: '2026-08-15',
    pilot_name: 'Lê Hoàng Long (Drone Flight Operator)',
    status: SurveyStatus.COMPLETED,
    total_images: 850,
    detected_defects_count: 18,
    notes: 'Bay chụp ảnh độ phân giải cao bằng cảm biến Zenmuse P1, độ cao 25m, phủ ảnh 80%.',
  },
  {
    id: 'srv-02',
    code: 'SRV-2026-004',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    start_km: 1032.0,
    end_km: 1045.0,
    scheduled_date: '2026-09-02',
    pilot_name: 'Lê Hoàng Long (Drone Flight Operator)',
    status: SurveyStatus.COMPLETED,
    total_images: 1240,
    detected_defects_count: 24,
    notes: 'Bay quét telemetry phụ đề SRT kiểm tra hư hỏng sau đợt bão số 4.',
  },
]

// =============================================================================
// 4. DANH SÁCH KHIẾM KHUYẾT MẶT ĐƯỜNG LIỀN MẠCH VỚI MÀN 07, 08, 10, 11, 15, 16
// =============================================================================
export const mockDefects: Defect[] = [
  {
    id: 'def-0042',
    code: 'DEF-2026-0042',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage_km: 1025.4,
    gps_lat: 16.054712,
    gps_lng: 108.202509,
    defect_type: DefectType.POTHOLE,
    severity: Severity.CRITICAL,
    confidence_score: 0.94,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.32, y: 0.45, width: 0.28, height: 0.22 },
    length_m: 0.85,
    width_m: 0.65,
    depth_mm: 62,
    created_at: '2026-08-20',
  },
  {
    id: 'def-0068',
    code: 'DEF-2026-0068',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage_km: 1028.15,
    gps_lat: 16.05891,
    gps_lng: 108.20993,
    defect_type: DefectType.LONGITUDINAL_CRACK,
    severity: Severity.HIGH,
    confidence_score: 0.89,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.42, y: 0.15, width: 0.12, height: 0.75 },
    length_m: 3.2,
    width_m: 0.08,
    depth_mm: 25,
    created_at: '2026-08-21',
  },
  {
    id: 'def-0091',
    code: 'DEF-2026-0091',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage_km: 1031.9,
    gps_lat: 16.06214,
    gps_lng: 108.21445,
    defect_type: DefectType.RUTTING,
    severity: Severity.CRITICAL,
    confidence_score: 0.96,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.25, y: 0.35, width: 0.5, height: 0.35 },
    length_m: 4.8,
    width_m: 1.2,
    depth_mm: 48,
    created_at: '2026-08-22',
  },
  {
    id: 'def-0029',
    code: 'DEF-2026-0029',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage_km: 1024.85,
    gps_lat: 16.0521,
    gps_lng: 108.19985,
    defect_type: DefectType.RUTTING,
    severity: Severity.MEDIUM,
    confidence_score: 0.86,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.2, y: 0.2, width: 0.6, height: 0.5 },
    length_m: 14.0,
    width_m: 0.9,
    depth_mm: 26,
    created_at: '2026-08-22',
  },
  {
    id: 'def-0096',
    code: 'DEF-2026-0096',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage_km: 1024.45,
    gps_lat: 16.05501,
    gps_lng: 108.20281,
    defect_type: DefectType.TRANSVERSE_CRACK,
    severity: Severity.MEDIUM,
    confidence_score: 0.91,
    status: DefectStatus.VERIFIED,
    image_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    previous_epoch_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    bounding_box: { x: 0.1, y: 0.45, width: 0.8, height: 0.15 },
    length_m: 3.5,
    width_m: 0.04,
    depth_mm: 18,
    created_at: '2026-08-23',
  },
]

// =============================================================================
// 5. ĐỢT SỬA CHỮA & GÓI ĐỀ XUẤT (REPAIR BATCHES & PACKAGES)
// =============================================================================
export const mockRepairBatches: RepairBatch[] = [
  {
    id: 'pkg-05',
    code: 'PKG-2026-05',
    name: 'Xử lý võng nứt mặt đường & cào bóc thảm nhựa Km 1025 - Km 1028',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    status: RepairBatchStatus.APPROVED,
    items: [
      {
        id: 'itm-01',
        defect_id: 'def-0042',
        task_name: 'Cào bóc và thảm lại bê tông nhựa chặt C12.5 dày 5cm',
        unit: 'm2',
        quantity: 210.0,
        unit_price: 420000,
        total_price: 88200000,
      },
      {
        id: 'itm-02',
        defect_id: 'def-0068',
        task_name: 'Trám chèn khe nứt mặt đường bằng vật liệu mastic bitum polime',
        unit: 'm',
        quantity: 450.0,
        unit_price: 65000,
        total_price: 29250000,
      },
    ],
    defects: [mockDefects[0], mockDefects[1]],
    estimated_total_cost: 117450000, // 88200000 + 29250000
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    assigned_crew_name: 'Đội thi công sửa chữa Hoàng Hải 01',
    deadline: '2026-09-15',
    created_at: '2026-08-24',
    approved_at: '2026-08-25',
  },
  {
    id: 'pkg-07',
    code: 'PKG-2026-07',
    name: 'Khắc phục hằn lún bánh xe & bù phụ trắc ngang Km 1028 - Km 1033',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (PK-04)',
    status: RepairBatchStatus.IN_PROGRESS,
    items: [
      {
        id: 'itm-03',
        defect_id: 'def-0091',
        task_name: 'Cào bóc tạo phẳng vệt hằn lún bánh xe bằng máy cào 1.0m',
        unit: 'm2',
        quantity: 340.0,
        unit_price: 280000,
        total_price: 95200000,
      },
      {
        id: 'itm-04',
        defect_id: 'def-0029',
        task_name: 'Tưới nhũ tương dính bám CRS-1 tiêu chuẩn 0.5 kg/m2',
        unit: 'm2',
        quantity: 340.0,
        unit_price: 35000,
        total_price: 11900000,
      },
    ],
    defects: [mockDefects[2], mockDefects[3]],
    estimated_total_cost: 107100000,
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    assigned_crew_name: 'Đội thi công cơ giới Hoàng Hải',
    deadline: '2026-09-30',
    created_at: '2026-08-26',
    approved_at: '2026-08-27',
  },
]

// =============================================================================
// 6. NHIỆM VỤ ĐO ĐẠC BỔ SUNG NGOÀI HIỆN TRƯỜNG (FIELD TASKS)
// =============================================================================
export const mockFieldTasks: FieldTask[] = [
  {
    id: 'ft-01',
    code: 'TSK-MEAS-1025',
    defect_id: 'def-0042',
    defect_code: 'DEF-2026-0042',
    measurement_type: 'Đo dưỡng chiều sâu & diện tích ổ gà',
    chainage_km: 1025.4,
    status: 'SUBMITTED',
    measured_value: 62,
    evidence_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    technician_name: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)',
  },
  {
    id: 'ft-02',
    code: 'TSK-POL-1028',
    defect_id: 'def-0068',
    defect_code: 'DEF-2026-0068',
    measurement_type: 'Thước đo khe nứt quang học',
    chainage_km: 1028.15,
    status: 'SUBMITTED',
    measured_value: 25,
    evidence_photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
    technician_name: 'Kỹ sư Lê Quốc Tuấn (Đội tuần đường)',
  },
  {
    id: 'ft-03',
    code: 'TSK-RSC-1031',
    defect_id: 'def-0091',
    defect_code: 'DEF-2026-0091',
    measurement_type: 'Trắc địa laser độ lún chênh cốt mố cầu',
    chainage_km: 1031.9,
    status: 'SUBMITTED',
    measured_value: 48,
    evidence_photo_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    technician_name: 'Kỹ sư Hoàng Văn Bách (Tổ kết cấu)',
  },
]

// =============================================================================
// 7. LỆNH THI CÔNG & NHẬT KÝ HIỆN TRƯỜNG (WORK ORDERS)
// =============================================================================
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
    crew_notes: 'Đã hoàn tất cào bóc 210m2, lu lèn đạt K98, đang chuẩn bị vệ sinh tưới dính bám.',
    completed_at: '2026-08-28',
  },
  {
    id: 'wo-02',
    code: 'WO-2026-002',
    batch_id: 'pkg-07',
    batch_code: 'PKG-2026-07',
    assigned_crew_name: 'Đội thi công cơ giới Hoàng Hải',
    status: 'IN_PROGRESS',
    before_photo_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    crew_notes: 'Đang triển khai biển báo phân làn từ Km 1028+000.',
    completed_at: undefined,
  },
]

// =============================================================================
// 8. DATA CHUYÊN BIỆT CHO MÀN 15: TRUNG TÂM XỬ LÝ XUNG ĐỘT NGOẠI TUYẾN (FR-22 / D05 / D06 / 42A)
// =============================================================================
export const mockSyncConflicts: SyncConflictItem[] = [
  {
    id: 'conf-01',
    conflict_code: '#CONF-2026-081',
    task_code: 'TSK-MEAS-1025',
    defect_code: 'DEF-2026-0042',
    defect_type_label: 'Ổ gà sâu lòng đường (Pothole L3)',
    route_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage: 'Km 1025+400 (Làn xe cơ giới)',
    conflict_type: 'ASSIGNMENT_REASSIGNED',
    conflict_type_label: 'Đổi đội khi ngoại tuyến (D05/Q04)',
    severity: 'HIGH',
    status: 'CONFLICT_INTAKE',
    status_label: 'Chờ PM phân giải (Đổi đội)',
    offline_actor: {
      name: 'Kỹ sư Phạm Văn Hùng',
      role: 'Đội trưởng thi công',
      team: 'Tổ cơ động Hoàng Hải 02',
      device_id: 'DEV-HH-TAB-882',
      device_model: 'Samsung Galaxy Tab Active 4 Pro',
      offline_duration: '6 giờ 25 phút (vùng lõm sóng đèo)',
      captured_at: '24/08/2026 - 10:15:22',
    },
    incoming_data: {
      measurement_type: 'Đo dưỡng chiều sâu & diện tích ổ gà thực tế',
      measured_value: 'Sâu 62mm • Rộng 0.35m² (Đã vá Carboncor)',
      depth_mm: 62,
      area_m2: 0.35,
      photo_evidence_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      photo_after_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80',
      sha256_hash: '3f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
      gps_coords: '16.054712 N, 108.202509 E',
      accuracy_m: 1.2,
      notes: 'Tổ 02 đã hoàn thành vá dặm khẩn cấp bằng bê tông nhựa nguội Carboncor Asphalt do nguy cơ mất an toàn giao thông cao. Lu lèn K95 đạt chuẩn.',
    },
    server_state: {
      initial_assignee: 'Tổ cơ động Hoàng Hải 02 (Giao việc lúc 07:00)',
      current_assignee: 'Đội thi công cơ giới Hoàng Hải 01 (Lệnh tái phân công lúc 09:30)',
      current_status: 'ASSIGNED (Đội 01 đang trên đường di chuyển)',
      policy_version: 'POLICY-FT-2026-v2.1',
      policy_summary: 'Hư hỏng sâu > 50mm không cho phép Fast Track tự động, yêu cầu lập đợt sửa chữa có Giám sát nghiệm thu.',
      last_updated: '24/08/2026 - 09:30:10',
      server_photo_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=1200&q=80',
      server_notes: 'PM văn phòng đã điều chuyển việc cho Đội 01 do Đội 02 mất sóng ngoại tuyến quá 2.5 giờ, không có phản hồi xác nhận nhận việc.',
    },
    timeline: [
      {
        time: '07:00:00',
        event: 'Xuất phát & Giao việc ban đầu',
        actor: 'PM Đỗ Quốc Hoàng giao nhiệm vụ cho Tổ cơ động 02 (KS Phạm Văn Hùng). Máy tính bảng tải snapshot thành công.',
        badge: 'Phân công',
        type: 'info'
      },
      {
        time: '07:30 - 10:00',
        event: 'Tổ 02 vào vùng đèo lõm sóng ngoại tuyến',
        actor: 'Mất sóng 4G > 2.5 giờ. Tổ 02 tiến hành xúc dọn, đo dưỡng ổ gà và đầm vá khẩn cấp bằng bê tông nhựa Carboncor.',
        badge: 'Ngoại tuyến',
        type: 'warning'
      },
      {
        time: '09:30:10',
        event: 'PM phát lệnh Đổi đội trên Máy chủ',
        actor: 'Do không liên lạc được với Tổ 02, PM chuyển giao việc cho Đội cơ giới 01. Đội 01 nhận lệnh và xuất phát ra hiện trường.',
        badge: 'Đổi đội',
        type: 'alert'
      },
      {
        time: '10:15:22',
        event: 'Tổ 02 thi công hoàn tất ngoài thực địa',
        actor: 'Vá xong ổ gà đạt K95, chụp ảnh nghiệm thu & tạo mã băm SHA-256 lưu an toàn trên máy (chưa nhận được lệnh thu hồi việc).',
        badge: 'Hoàn thành',
        type: 'success'
      },
      {
        time: '11:45:00',
        event: 'Tổ 02 có sóng 4G & Đồng bộ lên Máy chủ',
        actor: 'Gói dữ liệu hoàn thành nộp lên va chạm với lệnh điều chuyển Đội 01 -> Hệ thống kích hoạt Conflict Q04/D05.',
        badge: 'Xung đột Q04',
        type: 'alert'
      }
    ]
  },
  {
    id: 'conf-02',
    conflict_code: '#CONF-2026-082',
    task_code: 'TSK-POL-1028',
    defect_code: 'DEF-2026-0068',
    defect_type_label: 'Vết nứt dọc phát triển nhanh (Longitudinal Crack)',
    route_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage: 'Km 1028+150 (Vệt bánh xe ngoài)',
    conflict_type: 'POLICY_VERSION_MISMATCH',
    conflict_type_label: 'Lệch phiên bản chính sách Fast Track',
    severity: 'MEDIUM',
    status: 'CONFLICT_INTAKE',
    status_label: 'Chờ PM phân giải (Lệch chính sách)',
    offline_actor: {
      name: 'Kỹ sư Lê Quốc Tuấn',
      role: 'Kỹ thuật viên đo đạc hiện trường',
      team: 'Đội tuần đường lưu động Hoàng Hải',
      device_id: 'DEV-HH-PHO-419',
      device_model: 'Ulefone Armor 21 (Rugged Phone)',
      offline_duration: '4 giờ 10 phút (mất sóng ven biển)',
      captured_at: '24/08/2026 - 11:45:08',
    },
    incoming_data: {
      measurement_type: 'Thước đo khe nứt quang học & đo sâu cơ học',
      measured_value: 'Rộng khe nứt: 4.8mm • Dài: 3.2m (Đạt chuẩn v1.8 < 5mm)',
      depth_mm: 25,
      area_m2: 0.18,
      photo_evidence_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
      sha256_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      gps_coords: '16.058910 N, 108.209930 E',
      accuracy_m: 0.8,
      notes: 'Kỹ sư tải snapshot chính sách lúc 07:00 sáng (v1.8 cho phép Fast Track trám khe nứt < 5mm). Đề xuất trám keo polymer đàn hồi.',
    },
    server_state: {
      current_assignee: 'Đội tuần đường lưu động Hoàng Hải',
      current_status: 'POLICY_HOLD (Chờ điều chuyển đợt sửa)',
      policy_version: 'POLICY-FT-2026-v2.2 (Ban hành mới lúc 09:00)',
      policy_summary: 'Khóa cơ chế Fast Track trên toàn đoạn Km 1027 - Km 1030 do nền đường đắp đang bị theo dõi lún cố kết. Bắt buộc chuyển sang lập đợt sửa chữa có Giám sát phê duyệt.',
      last_updated: '24/08/2026 - 09:00:00',
      server_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      server_notes: 'Supervisor yêu cầu dừng trám keo tạm thời, gom khiếm khuyết vào đợt sửa chữa chung có Giám sát nghiệm thu.',
    },
    timeline: [
      {
        time: '07:00:00',
        event: 'Tải Snapshot chính sách v1.8',
        actor: 'Kỹ sư Lê Quốc Tuấn đồng bộ snapshot lúc 07:00 (v1.8 cho phép Fast Track trám khe nứt < 5mm).',
        badge: 'Snapshot v1.8',
        type: 'info'
      },
      {
        time: '09:00:00',
        event: 'Ban hành chính sách mới v2.2',
        actor: 'Supervisor ban hành văn bản khóa cơ chế Fast Track đoạn Km 1027 - 1030 do nghi ngờ lún cố kết nền đắp.',
        badge: 'Chính sách v2.2',
        type: 'alert'
      },
      {
        time: '11:45:08',
        event: 'Đồng bộ hồ sơ hiện trường',
        actor: 'Thợ nộp đề xuất Fast Track khe nứt 4.8mm -> Xung đột với quy định khóa v2.2 của Supervisor.',
        badge: 'Lệch chính sách',
        type: 'warning'
      }
    ]
  },
  {
    id: 'conf-03',
    conflict_code: '#CONF-2026-083',
    task_code: 'TSK-RSC-1031',
    defect_code: 'DEF-2026-0091',
    defect_type_label: 'Sụt lún mố cầu chui dân sinh',
    route_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage: 'Km 1031+900 (Mố cầu vượt QL1A)',
    conflict_type: 'DEVICE_RESCUE_PENDING',
    conflict_type_label: 'Cứu dữ liệu thiết bị hỏng (Q17/D06/42A)',
    severity: 'CRITICAL',
    status: 'CONFLICT_INTAKE',
    status_label: 'Cần Supervisor ký duyệt cứu hộ',
    offline_actor: {
      name: 'Kỹ sư Hoàng Văn Bách',
      role: 'Tổ trưởng đo đạc mố cầu',
      team: 'Tổ chuyên môn Kết cấu Hoàng Hải',
      device_id: 'DEV-HH-TAB-712 (Rơi vỡ màn hình do lu rung)',
      device_model: 'Samsung Galaxy Tab Active 3',
      offline_duration: 'Ngoại tuyến vĩnh viễn (Hỏng phần cứng)',
      captured_at: '23/08/2026 - 16:30:19',
    },
    incoming_data: {
      measurement_type: 'Trích xuất trực tiếp phân vùng SQLite an toàn qua cổng ADB',
      measured_value: 'Độ lún chênh cốt: 48mm • Độ mở khe co giãn: 12mm',
      depth_mm: 48,
      area_m2: 0.85,
      photo_evidence_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80',
      photo_after_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
      sha256_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      gps_coords: '16.062140 N, 108.214450 E',
      accuracy_m: 0.5,
      notes: 'Máy tính bảng bị rơi vỡ nát màn hình khi lu rung hoạt động ngoài công trường. Dữ liệu trắc địa được Tổ kỹ thuật kết nối cáp trích xuất thô và đối soát chữ ký số thiết bị khớp chứng chỉ TPM.',
    },
    server_state: {
      current_assignee: 'Tổ chuyên môn Kết cấu Hoàng Hải',
      current_status: 'PENDING_RESCUE_VERIFICATION',
      policy_version: 'SEC-RESCUE-42A-STD',
      policy_summary: 'Theo Q17 / Decision 42A: Chỉ Supervisor mới có quyền phê duyệt gói phục hồi dữ liệu từ thiết bị hỏng trước khi đưa vào kho chứng cứ số.',
      last_updated: '24/08/2026 - 08:00:00',
      server_photo_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=1200&q=80',
      server_notes: 'Biên bản sự cố rơi vỡ ngoài hiện trường đã được Đội thi công và PM lập. Chữ ký phần cứng TPM/SE và chứng chỉ kỹ sư đã được công cụ hệ thống trích xuất & xác thực.',
    },
    timeline: [
      {
        time: '23/08 • 16:30:19',
        event: 'Sự cố vỡ màn hình do lu rung',
        actor: 'KS Hoàng Văn Bách đo cao độ lún mố cầu thì bị xe lu làm rơi vỡ nát màn hình máy DEV-HH-TAB-712.',
        badge: 'Sự cố phần cứng',
        type: 'alert'
      },
      {
        time: '24/08 • 08:00:00',
        event: 'Trích xuất an toàn qua cáp ADB',
        actor: 'Hệ thống RoadGuard kết nối thiết bị qua cáp ADB, trích xuất raw SQLite và xác thực chữ ký phần cứng TPM khớp chứng chỉ máy.',
        badge: 'Cứu hộ ADB',
        type: 'info'
      },
      {
        time: 'Hiện tại',
        event: 'Chờ Supervisor ký số phê duyệt',
        actor: 'Theo Điều 42A, chỉ Supervisor mới có thẩm quyền ký số phê duyệt đưa gói dữ liệu cứu hộ vào hệ thống.',
        badge: 'Chờ ký duyệt',
        type: 'warning'
      }
    ]
  },
  {
    id: 'conf-04',
    conflict_code: '#CONF-2026-079',
    task_code: 'TSK-DUP-1022',
    defect_code: 'DEF-2026-0029',
    defect_type_label: 'Lún vệt bánh xe (Rutting L2)',
    route_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage: 'Km 1024+850 (Làn xe tải nặng)',
    conflict_type: 'DUPLICATE_WORK_ATTEMPT',
    conflict_type_label: 'Hai thiết bị nộp cùng phạm vi',
    severity: 'MEDIUM',
    status: 'CONFLICT_INTAKE',
    status_label: 'Chờ PM phân giải (Trùng 2 máy)',
    duplicate_device_a: {
      name: 'Kỹ thuật viên Nguyễn Văn Tiến',
      role: 'Giám sát viên tổ cào bóc',
      team: 'Tổ thi công Asphalt Hoàng Hải 01',
      device_id: 'DEV-HH-TAB-210 (Máy phụ)',
      device_model: 'Samsung Galaxy Tab A7 Lite',
      captured_at: '23/08/2026 - 14:00:15',
      measurement_type: 'Quan sát mắt thường & thước cuộn sơ bộ',
      measured_value: 'Ước lượng vệt lún ~20mm (Chưa có dưỡng 3m chuẩn)',
      photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      sha256_hash: '9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f8a7b6c5d4e3f2a1b0c9d8e7f',
      notes: 'Máy phụ gửi lệnh bắt đầu thi công và báo cáo sơ bộ lúc 14:00 trước khi máy chính của tổ trưởng gửi số liệu đo chi tiết.',
    },
    offline_actor: {
      name: 'Kỹ sư Trần Đức Thắng',
      role: 'Đội trưởng cào bóc',
      team: 'Tổ thi công Asphalt Hoàng Hải 01',
      device_id: 'DEV-HH-TAB-305 (Máy chính)',
      device_model: 'Samsung Galaxy Tab Active 4 Pro',
      offline_duration: '3 giờ 15 phút',
      captured_at: '23/08/2026 - 15:10:44',
    },
    incoming_data: {
      measurement_type: 'Thước 3m đo độ gợn sóng theo TCVN 8864',
      measured_value: 'Vệt lún 26mm • Chiều dài vệt 14m (Kèm biên bản cào bóc)',
      depth_mm: 26,
      area_m2: 4.2,
      photo_evidence_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=1200&q=80',
      photo_after_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
      sha256_hash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      gps_coords: '16.052100 N, 108.199850 E',
      accuracy_m: 1.1,
      notes: 'Đã tiến hành cào bóc tạo phẳng bằng máy cào Wirtgen 1.0m. Số liệu đo bằng thước dưỡng 3m có ảnh chụp vạch số chi tiết.',
    },
    server_state: {
      current_assignee: 'Tổ thi công Asphalt Hoàng Hải 01',
      current_status: 'IN_PROGRESS (Đã nhận bản nộp máy 1 lúc 14:00)',
      policy_version: 'POLICY-FT-2026-v2.1',
      policy_summary: 'Hồ sơ đã ghi nhận lượt thi công số 1 từ Thiết bị phụ lúc 14:00.',
      last_updated: '23/08/2026 - 14:00:15',
      server_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      server_notes: 'Trùng lặp do máy phụ của giám sát đội cùng gửi lệnh start và số liệu sơ bộ trước khi máy chính nộp bản đo chuẩn.',
    },
    timeline: [
      {
        time: '23/08 • 14:00:15',
        event: 'Thiết bị 1 (Máy phụ) nộp nháp',
        actor: 'KTV Nguyễn Văn Tiến gửi lệnh start và đo sơ bộ ~20mm bằng mắt thường, chưa áp dưỡng đo 3m.',
        badge: 'Máy phụ nộp trước',
        type: 'info'
      },
      {
        time: '23/08 • 15:10:44',
        event: 'Thiết bị 2 (Máy chính) nộp bản đo chuẩn',
        actor: 'Đội trưởng Trần Đức Thắng nộp ảnh thước 3m vệt lún 26mm dài 14m và ảnh cào bóc tạo phẳng Wirtgen 1.0m.',
        badge: 'Máy chính nộp chuẩn',
        type: 'success'
      },
      {
        time: 'Hiện tại',
        event: 'Chờ PM chọn bản đo chuẩn',
        actor: 'PM đối chiếu hai bản nộp, chấp nhận bản nộp có thước 3m của máy chính và hủy bản nháp của máy phụ.',
        badge: 'Đối chiếu 2 máy',
        type: 'warning'
      }
    ]
  },
  {
    id: 'conf-05',
    conflict_code: '#CONF-2026-084',
    task_code: 'TSK-AGG-1024',
    defect_code: 'DEF-2026-0096',
    defect_type_label: 'Trám khe co giãn mố cầu chui dân sinh',
    route_name: 'QL1A - Giai đoạn 2 (PK-04)',
    chainage: 'Km 1024+450 (Mố cầu QL1A)',
    conflict_type: 'AGGREGATE_VERSION_CONFLICT',
    conflict_type_label: 'Hồ sơ đã đóng trước khi sync (BR-26)',
    severity: 'MEDIUM',
    status: 'CONFLICT_INTAKE',
    status_label: 'Chờ PM phân giải (Hồ sơ đã đóng)',
    offline_actor: {
      name: 'Kỹ sư Vũ Đức Thịnh',
      role: 'Kỹ thuật viên hiện trường',
      team: 'Đội sửa chữa cầu cống Hoàng Hải',
      device_id: 'DEV-HH-PHO-209',
      device_model: 'Ulefone Armor X13',
      offline_duration: '11 giờ 45 phút (mất sóng khu vực cống ngầm)',
      captured_at: '24/08/2026 - 14:20:10',
    },
    incoming_data: {
      measurement_type: 'Thước cặp cơ khí đo độ mở khe co giãn',
      measured_value: 'Khe co giãn 18mm • Chiều dài khe 3.5m',
      depth_mm: 18,
      area_m2: 0.14,
      photo_evidence_url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=1200&q=80',
      photo_after_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      sha256_hash: '7c8b29b19e23c0d8f07172ca9938d21e427166ea',
      gps_coords: '16.055010 N, 108.202810 E',
      accuracy_m: 0.9,
      notes: 'Đã hoàn tất rót mastic bitum nóng chèn khe mố cầu lúc 14:00 trước khi di chuyển về văn phòng bắt lại sóng.',
    },
    server_state: {
      current_assignee: 'Đội sửa chữa cầu cống Hoàng Hải',
      current_status: 'CLOSED (Hồ sơ đợt đã đóng & ký số)',
      policy_version: 'POLICY-STD-CLOSEOUT',
      policy_summary: 'Hồ sơ đợt PKG-2026-05 đã qua bước nghiệm thu đạt yêu cầu (PASSED) và được Supervisor ký đóng lúc 13:00. Theo BR-26 / Invariant #3: Hồ sơ đóng băng vĩnh viễn, không cho phép ghi đè dữ liệu trực tiếp.',
      last_updated: '24/08/2026 - 13:00:00',
      server_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      server_notes: 'Supervisor đã ký số đóng đợt lúc 13:00 trước khi thiết bị thợ có sóng đồng bộ lúc 14:20. Cần tạo phụ lục bổ sung (Fork Attempt).',
    },
    timeline: [
      {
        time: '24/08 • 13:00:00',
        event: 'Supervisor ký số đóng đợt PKG-2026-05',
        actor: 'Hồ sơ đợt hoàn tất nghiệm thu và bị khóa cứng (Read-only theo Invariant #3 & BR-26).',
        badge: 'Đóng đợt (BR-26)',
        type: 'alert'
      },
      {
        time: '24/08 • 14:00:00',
        event: 'Thợ thi công xong dưới cống ngầm',
        actor: 'KTV Vũ Đức Thịnh hoàn thành rót mastic chèn khe co giãn mố cầu lúc đang mất sóng 11h45.',
        badge: 'Xong ngoại tuyến',
        type: 'info'
      },
      {
        time: '24/08 • 14:20:10',
        event: 'Thợ có sóng 4G & nộp muộn',
        actor: 'Dữ liệu nộp lên sau khi hồ sơ đã đóng. Hệ thống từ chối chèn đè trực tiếp -> Kích hoạt xử lý tạo phụ lục đợt.',
        badge: 'Nộp muộn sau đóng',
        type: 'warning'
      }
    ]
  },
]
