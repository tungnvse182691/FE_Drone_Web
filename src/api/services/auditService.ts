import { AuditEvent, AuditTrailStats } from '../../types/domain'
import { RoleCode } from '../../types/enums'

export interface AuditFilterParams {
  projectId?: string
  actorRole?: string
  actionType?: string
  entityType?: string
  searchKeyword?: string
  timeFilter?: '24h' | '7d' | '30d' | 'all'
}

export interface AuditProjectOption {
  id: string
  name: string
  code: string
}

export const AUDIT_PROJECT_OPTIONS: AuditProjectOption[] = [
  { id: 'all', name: 'Tất cả dự án phụ trách', code: 'ALL_SYSTEM' },
  { id: 'proj-01', name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)', code: 'QL1A-02' },
  { id: 'proj-02', name: 'Cao tốc Bắc - Nam XL-03 (Km 14 - Km 22)', code: 'CTBN-XL03' }
]

// Dữ liệu dòng sự kiện bất biến phong phú, phân bổ theo các mốc thời gian thực tế
// Giả định mốc thời gian hiện tại của hệ thống: 10/10/2026
const IN_MEMORY_EVENTS: AuditEvent[] = [
  // --- 1. TRONG 24 GIỜ QUA (10/10/2026) ---
  {
    id: 'evt-001',
    event_id: 'EVT-2026-1010-01',
    occurred_at: '2026-10-10T02:15:00Z',
    occurred_at_local: '10/10/2026 09:15:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-sup-01',
    actor_name: 'Kỹ sư Nguyễn Văn An',
    actor_role: RoleCode.SUPERVISOR,
    actor_role_label: 'Kỹ sư Giám sát',
    action_type: 'ACCEPT_WORK_ORDER',
    action_label_vi: 'Nghiệm thu hoàn công',
    action_badge_style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    target_entity_type: 'WORK_ORDER',
    target_entity_id: 'wo-2026-088',
    target_entity_name: 'Phiếu hoàn công WO-2026-088',
    target_location: 'Km 1026+300',
    from_status: 'PENDING_INSPECTION',
    to_status: 'ACCEPTED',
    reason: 'Đã kiểm tra hiện trường: độ bằng phẳng mặt đường đạt chuẩn TCVN 8864, khe trám kín khít.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
          caption: 'Biên bản nghiệm thu độ bằng phẳng thước thẳng 3m',
          captured_at: '10/10/2026 08:50:00',
          gps_coordinates: '16.1284, 108.1920'
        }
      ]
    },
    before_state: {
      trang_thai: 'Chờ nghiệm thu',
      hang_muc: 'Trám khe co giãn BTXM',
      ket_qua: 'Chưa kiểm tra'
    },
    after_state: {
      trang_thai: 'Nghiệm thu đạt',
      nguoi_duyet: 'usr-sup-01',
      ket_qua: 'Đạt chuẩn TCVN 8864'
    }
  },
  {
    id: 'evt-002',
    event_id: 'EVT-2026-1010-02',
    occurred_at: '2026-10-09T23:30:00Z',
    occurred_at_local: '10/10/2026 06:30:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-pm-01',
    actor_name: 'Đỗ Quốc Hoàng',
    actor_role: RoleCode.PROJECT_MANAGER,
    actor_role_label: 'Chỉ huy trưởng',
    action_type: 'ASSIGN_CREW',
    action_label_vi: 'Phân công đội thi công',
    action_badge_style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    target_entity_type: 'WORK_ORDER',
    target_entity_id: 'wo-2026-089',
    target_entity_name: 'Phiếu giao việc WO-2026-089',
    target_location: 'Km 1032+150',
    from_status: 'UNASSIGNED',
    to_status: 'ASSIGNED',
    reason: 'Giao Đội thi công 02 xử lý cào bóc lún vệt bánh xe trước đợt kiểm tra hiện trường.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80',
          caption: 'Hiện trường khảo sát lún vệt bánh xe Km 1032+150',
          captured_at: '10/10/2026 06:15:00',
          gps_coordinates: '16.1310, 108.1965'
        }
      ]
    },
    before_state: {
      doi_thi_cong: null,
      trang_thai: 'Chưa phân công',
      han_hoan_thanh: null
    },
    after_state: {
      doi_thi_cong: 'Tổ cơ động 02',
      trang_thai: 'Đã phân công',
      han_hoan_thanh: '14/10/2026'
    }
  },

  // --- 2. TRONG 7 NGÀY QUA (04/10/2026 - 09/10/2026) ---
  {
    id: 'evt-003',
    event_id: 'EVT-2026-1008-03',
    occurred_at: '2026-10-08T07:10:00Z',
    occurred_at_local: '08/10/2026 14:10:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-sup-01',
    actor_name: 'Kỹ sư Nguyễn Văn An',
    actor_role: RoleCode.SUPERVISOR,
    actor_role_label: 'Kỹ sư Giám sát',
    action_type: 'APPROVE_BATCH',
    action_label_vi: 'Phê duyệt đợt sửa chữa',
    action_badge_style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    target_entity_type: 'REPAIR_BATCH',
    target_entity_id: 'pkg-08',
    target_entity_name: 'Đợt sửa chữa PKG-2026-08',
    target_location: 'Km 1025+400 - Km 1030+000',
    from_status: 'PENDING_APPROVAL',
    to_status: 'APPROVED',
    reason: 'Đã thẩm định phương án kỹ thuật cào bóc và trám mastic bitum-polyme theo định mức TCVN.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=800&q=80',
          caption: 'Biên bản kiểm tra hiện trường đợt sửa chữa PKG-08',
          captured_at: '08/10/2026 13:30:00',
          gps_coordinates: '16.1305, 108.1942'
        }
      ]
    },
    before_state: {
      trang_thai: 'Chờ duyệt',
      tong_hu_hong: 8,
      phuong_an: 'TCVN 8819:2011'
    },
    after_state: {
      trang_thai: 'Đã phê duyệt',
      nguoi_duyet: 'usr-sup-01',
      thoi_diem_khoa: '2026-10-08T07:10:00Z'
    }
  },
  {
    id: 'evt-004',
    event_id: 'EVT-2026-1007-04',
    occurred_at: '2026-10-07T09:40:00Z',
    occurred_at_local: '07/10/2026 16:40:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-pm-01',
    actor_name: 'Đỗ Quốc Hoàng',
    actor_role: RoleCode.PROJECT_MANAGER,
    actor_role_label: 'Chỉ huy trưởng',
    action_type: 'SUBMIT_BATCH',
    action_label_vi: 'Trình duyệt hồ sơ đợt sửa',
    action_badge_style: 'bg-blue-50 text-blue-700 border-blue-200',
    target_entity_type: 'REPAIR_BATCH',
    target_entity_id: 'pkg-08',
    target_entity_name: 'Đợt sửa chữa PKG-2026-08',
    target_location: 'Km 1025+400 - Km 1030+000',
    from_status: 'DRAFT',
    to_status: 'PENDING_APPROVAL',
    reason: 'Gom các hư hỏng nứt vỡ mặt đường phát hiện từ đợt bay khảo sát Drone kỳ 4.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
          caption: 'Ảnh khảo sát UAV phát hiện nứt lưới mặt đường kỳ 4',
          captured_at: '07/10/2026 15:20:00',
          gps_coordinates: '16.1292, 108.1934'
        }
      ]
    },
    before_state: {
      trang_thai: 'Bản nháp',
      tong_hu_hong: 8
    },
    after_state: {
      trang_thai: 'Chờ duyệt',
      nguoi_trinh: 'usr-pm-01'
    }
  },
  {
    id: 'evt-005',
    event_id: 'EVT-2026-1005-05',
    occurred_at: '2026-10-05T03:20:00Z',
    occurred_at_local: '05/10/2026 10:20:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-pm-01',
    actor_name: 'Đỗ Quốc Hoàng',
    actor_role: RoleCode.PROJECT_MANAGER,
    actor_role_label: 'Chỉ huy trưởng',
    action_type: 'CLOSE_FAST_TRACK',
    action_label_vi: 'Đóng hồ sơ xử lý nhanh',
    action_badge_style: 'bg-amber-50 text-amber-700 border-amber-200',
    target_entity_type: 'DEFECT',
    target_entity_id: 'def-ft-021',
    target_entity_name: 'Hư hỏng khẩn cấp FT-021',
    target_location: 'Km 1028+900',
    from_status: 'IN_PROGRESS',
    to_status: 'RESOLVED',
    reason: 'Đã hoàn tất rào chắn và dặm vá ổ gà sâu > 5cm bảo đảm an toàn giao thông.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
          caption: 'Hiện trường hoàn tất dặm vá ổ gà khẩn cấp bảo đảm ATGT',
          captured_at: '05/10/2026 09:50:00',
          gps_coordinates: '16.1340, 108.1980'
        }
      ]
    },
    before_state: {
      muc_do: 'Khẩn cấp',
      trang_thai: 'Đang thi công'
    },
    after_state: {
      trang_thai: 'Đã xử lý xong',
      nguoi_dong: 'usr-pm-01'
    }
  },

  // --- 3. TRONG 30 NGÀY QUA (15/09/2026 - 03/10/2026) ---
  {
    id: 'evt-006',
    event_id: 'EVT-2026-0928-06',
    occurred_at: '2026-09-28T08:00:00Z',
    occurred_at_local: '28/09/2026 15:00:00',
    project_id: 'proj-02',
    project_name: 'Cao tốc Bắc - Nam XL-03 (Km 14 - Km 22)',
    actor_id: 'usr-sup-01',
    actor_name: 'Kỹ sư Nguyễn Văn An',
    actor_role: RoleCode.SUPERVISOR,
    actor_role_label: 'Kỹ sư Giám sát',
    action_type: 'REJECT_BATCH',
    action_label_vi: 'Yêu cầu sửa lại đợt sửa',
    action_badge_style: 'bg-rose-50 text-rose-700 border-rose-200',
    target_entity_type: 'REPAIR_BATCH',
    target_entity_id: 'pkg-ctbn-03',
    target_entity_name: 'Đợt sửa chữa PKG-CTBN-03',
    target_location: 'Km 17+200 - Km 19+800',
    from_status: 'PENDING_APPROVAL',
    to_status: 'REVISION_REQUIRED',
    reason: 'Khối lượng cào bóc nhựa Asphalt chưa khớp với số đo độ sâu lún từ LiDAR 3D.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
          caption: 'Biên bản đối soát trắc đạc độ lún LiDAR hiện trường',
          captured_at: '28/09/2026 14:15:00',
          gps_coordinates: '16.1412, 108.2050'
        }
      ]
    },
    before_state: {
      trang_thai: 'Chờ duyệt',
      tong_hu_hong: 5
    },
    after_state: {
      trang_thai: 'Yêu cầu sửa lại',
      ghi_chu: 'Cần đo đạc bổ sung độ sâu mặt đường'
    }
  },
  {
    id: 'evt-007',
    event_id: 'EVT-2026-0924-07',
    occurred_at: '2026-09-24T05:15:00Z',
    occurred_at_local: '24/09/2026 12:15:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-pm-01',
    actor_name: 'Đỗ Quốc Hoàng',
    actor_role: RoleCode.PROJECT_MANAGER,
    actor_role_label: 'Chỉ huy trưởng',
    action_type: 'ASSIGN_CREW',
    action_label_vi: 'Phân công đội thi công',
    action_badge_style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    target_entity_type: 'WORK_ORDER',
    target_entity_id: 'wo-2026-074',
    target_entity_name: 'Phiếu giao việc WO-2026-074',
    target_location: 'Km 1034+200',
    from_status: 'UNASSIGNED',
    to_status: 'ASSIGNED',
    reason: 'Giao Đội thi công 01 xử lý võng lún khu vực đầu cống Km1034.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80',
          caption: 'Hiện trường khảo sát võng lún đầu cống Km 1034',
          captured_at: '24/09/2026 11:45:00',
          gps_coordinates: '16.1360, 108.2010'
        }
      ]
    },
    before_state: {
      trang_thai: 'Chưa phân công',
      doi_thi_cong: null
    },
    after_state: {
      trang_thai: 'Đã phân công',
      doi_thi_cong: 'Tổ kết cấu 01',
      han_hoan_thanh: '30/09/2026'
    }
  },
  {
    id: 'evt-008',
    event_id: 'EVT-2026-0920-08',
    occurred_at: '2026-09-20T02:00:00Z',
    occurred_at_local: '20/09/2026 09:00:00',
    project_id: 'proj-02',
    project_name: 'Cao tốc Bắc - Nam XL-03 (Km 14 - Km 22)',
    actor_id: 'usr-sup-01',
    actor_name: 'Kỹ sư Nguyễn Văn An',
    actor_role: RoleCode.SUPERVISOR,
    actor_role_label: 'Kỹ sư Giám sát',
    action_type: 'ACCEPT_WORK_ORDER',
    action_label_vi: 'Nghiệm thu hoàn công',
    action_badge_style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    target_entity_type: 'WORK_ORDER',
    target_entity_id: 'wo-ctbn-015',
    target_entity_name: 'Phiếu hoàn công WO-CTBN-015',
    target_location: 'Km 15+200',
    from_status: 'PENDING_INSPECTION',
    to_status: 'ACCEPTED',
    reason: 'Độ nhám và độ bằng phẳng mặt đường nhựa sau bù lún đạt tiêu chuẩn nghiệm thu.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
          caption: 'Kiểm tra độ nhám và độ bằng phẳng mặt đường hoàn công',
          captured_at: '20/09/2026 08:30:00',
          gps_coordinates: '16.1430, 108.2090'
        }
      ]
    },
    before_state: {
      trang_thai: 'Chờ nghiệm thu',
      ket_qua: 'Chờ nghiệm thu'
    },
    after_state: {
      trang_thai: 'Nghiệm thu đạt',
      nguoi_duyet: 'usr-sup-01',
      ket_qua: 'Đạt chuẩn TCVN'
    }
  },
  {
    id: 'evt-009',
    event_id: 'EVT-2026-0916-09',
    occurred_at: '2026-09-16T08:30:00Z',
    occurred_at_local: '16/09/2026 15:30:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-sup-01',
    actor_name: 'Kỹ sư Nguyễn Văn An',
    actor_role: RoleCode.SUPERVISOR,
    actor_role_label: 'Kỹ sư Giám sát',
    action_type: 'LOCK_LEGAL_HOLD',
    action_label_vi: 'Kích hoạt khóa lưu trữ',
    action_badge_style: 'bg-purple-50 text-purple-700 border-purple-200',
    target_entity_type: 'LEGAL_HOLD',
    target_entity_id: 'hold-2026-02',
    target_entity_name: 'Hồ sơ lưu trữ đoạn Km 1024 - Km 1026',
    target_location: 'Km 1024 - Km 1026',
    from_status: 'ACTIVE',
    to_status: 'LOCKED',
    reason: 'Khóa lưu trữ hồ sơ phục vụ thanh tra công trình bảo hành theo quy định.',
    before_state: {
      trang_thai: 'Đang lưu trữ'
    },
    after_state: {
      trang_thai: 'Khóa thanh tra',
      nguoi_khoa: 'usr-sup-01',
      thoi_diem_khoa: '2026-09-16T08:30:00Z'
    }
  },

  // --- 4. TOÀN BỘ THỜI GIAN (THÁNG 8/2026 TRỞ VỀ TRƯỚC) ---
  {
    id: 'evt-010',
    event_id: 'EVT-2026-0825-10',
    occurred_at: '2026-08-25T08:30:00Z',
    occurred_at_local: '25/08/2026 15:30:00',
    project_id: 'proj-01',
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
    target_entity_name: 'Đợt sửa chữa PKG-2026-05',
    target_location: 'Km 1025+400 - Km 1028+150',
    from_status: 'PENDING_APPROVAL',
    to_status: 'APPROVED',
    reason: 'Đã thẩm duyệt giải pháp đục tẩy góc bản vỡ và trám mastic bitum-polyme theo TCVN 8864.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
          caption: 'Biên bản kiểm tra kích thước hình học bản bê tông xi măng',
          captured_at: '25/08/2026 14:40:00',
          gps_coordinates: '16.1284, 108.1920'
        }
      ]
    },
    before_state: {
      trang_thai: 'Chờ duyệt',
      tong_hu_hong: 6,
      phuong_an: 'TCVN 8864 (Trám mastic bitum-polyme)'
    },
    after_state: {
      trang_thai: 'Đã phê duyệt',
      nguoi_duyet: 'usr-sup-01',
      thoi_diem_khoa: '2026-08-25T08:30:00Z'
    }
  },
  {
    id: 'evt-011',
    event_id: 'EVT-2026-0824-11',
    occurred_at: '2026-08-24T10:15:00Z',
    occurred_at_local: '24/08/2026 17:15:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-pm-01',
    actor_name: 'Đỗ Quốc Hoàng',
    actor_role: RoleCode.PROJECT_MANAGER,
    actor_role_label: 'Chỉ huy trưởng',
    action_type: 'SUBMIT_BATCH',
    action_label_vi: 'Trình duyệt hồ sơ đợt sửa',
    action_badge_style: 'bg-blue-50 text-blue-700 border-blue-200',
    target_entity_type: 'REPAIR_BATCH',
    target_entity_id: 'pkg-05',
    target_entity_name: 'Đợt sửa chữa PKG-2026-05',
    target_location: 'Km 1025+400 - Km 1028+150',
    from_status: 'DRAFT',
    to_status: 'PENDING_APPROVAL',
    reason: 'Gom các hư hỏng nứt vỡ bản BTXM sau chuyến bay khảo sát kỳ 3.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=800&q=80',
          caption: 'Ảnh khảo sát vết nứt góc tấm bê tông Km 1026+400',
          captured_at: '24/08/2026 16:30:00',
          gps_coordinates: '16.1290, 108.1925'
        }
      ]
    },
    before_state: {
      trang_thai: 'Bản nháp',
      tong_hu_hong: 6
    },
    after_state: {
      trang_thai: 'Chờ duyệt',
      nguoi_trinh: 'usr-pm-01'
    }
  },
  {
    id: 'evt-012',
    event_id: 'EVT-2026-0822-12',
    occurred_at: '2026-08-22T09:20:00Z',
    occurred_at_local: '22/08/2026 16:20:00',
    project_id: 'proj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    actor_id: 'usr-sup-01',
    actor_name: 'Kỹ sư Nguyễn Văn An',
    actor_role: RoleCode.SUPERVISOR,
    actor_role_label: 'Kỹ sư Giám sát',
    action_type: 'ACCEPT_WORK_ORDER',
    action_label_vi: 'Nghiệm thu hoàn công',
    action_badge_style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    target_entity_type: 'WORK_ORDER',
    target_entity_id: 'wo-2026-039',
    target_entity_name: 'Phiếu hoàn công WO-2026-039',
    target_location: 'Km 1032+600',
    from_status: 'PENDING_INSPECTION',
    to_status: 'ACCEPTED',
    reason: 'Kiểm tra thước thẳng 3m đạt độ bằng phẳng theo TCVN 8864.',
    evidence_snapshot: {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
          caption: 'Biên bản kiểm tra thước thẳng 3m Km 1032+600',
          captured_at: '22/08/2026 15:50:00',
          gps_coordinates: '16.1320, 108.1950'
        }
      ]
    },
    before_state: {
      trang_thai: 'Chờ nghiệm thu',
      ket_qua: 'Chờ kiểm tra'
    },
    after_state: {
      trang_thai: 'Nghiệm thu đạt',
      nguoi_duyet: 'usr-sup-01',
      ket_qua: 'Đạt chuẩn TCVN 8864'
    }
  },
  {
    id: 'evt-013',
    event_id: 'EVT-2026-0819-13',
    occurred_at: '2026-08-19T06:30:00Z',
    occurred_at_local: '19/08/2026 13:30:00',
    project_id: 'proj-02',
    project_name: 'Cao tốc Bắc - Nam XL-03 (Km 14 - Km 22)',
    actor_id: 'usr-sys-01',
    actor_name: 'Quản trị hệ thống',
    actor_role: 'SYSTEM',
    actor_role_label: 'Hệ thống tự động',
    action_type: 'PUBLISH_SEGMENTS',
    action_label_vi: 'Công bố phân đoạn tim tuyến',
    action_badge_style: 'bg-slate-100 text-slate-700 border-slate-200',
    target_entity_type: 'ROAD_SEGMENT',
    target_entity_id: 'seg-ctbn-v2',
    target_entity_name: 'Tập phân đoạn Km 14 - Km 22',
    target_location: 'Toàn gói XL-03',
    from_status: 'DRAFT',
    to_status: 'PUBLISHED',
    reason: 'Cập nhật lại tim tuyến phục vụ đối soát vị trí sau đợt khảo sát trắc địa GPS RTK.',
    before_state: {
      phien_ban: '2.0',
      trang_thai: 'Bản nháp'
    },
    after_state: {
      phien_ban: '2.1',
      trang_thai: 'Đã công bố'
    }
  }
]

export const auditService = {
  getProjectOptions(): AuditProjectOption[] {
    return AUDIT_PROJECT_OPTIONS
  },

  /**
   * Lấy danh sách sự kiện hoạt động có lọc theo khoảng thời gian thực tế
   */
  async getAuditEvents(params?: AuditFilterParams): Promise<AuditEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    let result = [...IN_MEMORY_EVENTS]

    if (!params) return result

    // 1. Lọc theo dự án
    if (params.projectId && params.projectId !== 'all') {
      result = result.filter((e) => e.project_id === params.projectId)
    }

    // 2. Lọc theo khoảng thời gian (So với mốc hiện tại 10/10/2026)
    if (params.timeFilter && params.timeFilter !== 'all') {
      const now = new Date('2026-10-10T12:00:00Z').getTime()
      result = result.filter((e) => {
        const evTime = new Date(e.occurred_at).getTime()
        const diffHours = (now - evTime) / (1000 * 60 * 60)
        if (params.timeFilter === '24h') return diffHours <= 24 && diffHours >= 0
        if (params.timeFilter === '7d') return diffHours <= 7 * 24 && diffHours >= 0
        if (params.timeFilter === '30d') return diffHours <= 30 * 24 && diffHours >= 0
        return true
      })
    }

    // 3. Lọc theo vai trò tác nhân
    if (params.actorRole && params.actorRole !== 'all') {
      result = result.filter((e) => e.actor_role === params.actorRole)
    }

    // 4. Lọc theo loại hành động
    if (params.actionType && params.actionType !== 'all') {
      result = result.filter((e) => e.action_type === params.actionType)
    }

    // 5. Lọc theo loại thực thể
    if (params.entityType && params.entityType !== 'all') {
      result = result.filter((e) => e.target_entity_type === params.entityType)
    }

    // 6. Tìm kiếm từ khóa
    if (params.searchKeyword && params.searchKeyword.trim() !== '') {
      const q = params.searchKeyword.toLowerCase().trim()
      result = result.filter((e) =>
        e.event_id.toLowerCase().includes(q) ||
        e.actor_name.toLowerCase().includes(q) ||
        e.target_entity_name.toLowerCase().includes(q) ||
        e.action_label_vi.toLowerCase().includes(q) ||
        (e.target_location && e.target_location.toLowerCase().includes(q)) ||
        e.reason.toLowerCase().includes(q)
      )
    }

    return result
  },

  async getAuditStats(projectId: string = 'all'): Promise<AuditTrailStats> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const events =
      projectId === 'all'
        ? IN_MEMORY_EVENTS
        : IN_MEMORY_EVENTS.filter((e) => e.project_id === projectId)

    const stateTransitions = events.filter((e) => Boolean(e.from_status && e.to_status)).length
    const approvalDecisions = events.filter((e) =>
      ['APPROVE_BATCH', 'REJECT_BATCH', 'ACCEPT_WORK_ORDER', 'LOCK_LEGAL_HOLD'].includes(e.action_type)
    ).length

    return {
      total_events: events.length,
      state_transitions_count: stateTransitions,
      approval_decisions_count: approvalDecisions,
      retention_compliance_note: 'Tuân thủ thời hạn lưu trữ theo quy chuẩn (Hết bảo hành + 5 năm)'
    }
  },

  async exportAuditTrail(
    format: 'PDF' | 'CSV',
    projectId: string = 'all'
  ): Promise<{ fileName: string; rowCount: number }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const events =
      projectId === 'all'
        ? IN_MEMORY_EVENTS
        : IN_MEMORY_EVENTS.filter((e) => e.project_id === projectId)

    const prefix = projectId === 'all' ? 'TOAN_HE_THONG' : projectId.toUpperCase()
    return {
      fileName: `Nhat-Ky-Hoat-Dong-${prefix}.${format.toLowerCase()}`,
      rowCount: events.length
    }
  }
}
