import { Segment, ProjectMember } from './types'

export const INITIAL_SEGMENTS: Segment[] = [
  {
    code: 'SEG-01',
    stationing: 'Km 1024+000 – Km 1028+000',
    length_km: 4.0,
    status_label: 'Tốt (Mặt phẳng)',
    status_type: 'GOOD',
    open_defects: '0 điểm',
    defects_count: 0
  },
  {
    code: 'SEG-02',
    stationing: 'Km 1028+000 – Km 1033+500',
    length_km: 5.5,
    status_label: 'Cảnh báo (Lún bánh xe)',
    status_type: 'WARNING',
    open_defects: '5 điểm lún',
    defects_count: 5
  },
  {
    code: 'SEG-03',
    stationing: 'Km 1033+500 – Km 1038+000',
    length_km: 4.5,
    status_label: 'Đang sửa chữa (WF-07)',
    status_type: 'REPAIRING',
    open_defects: '3 điểm',
    defects_count: 3
  },
  {
    code: 'SEG-04',
    stationing: 'Km 1038+000 – Km 1042+000',
    length_km: 4.0,
    status_label: 'Bình thường (Đạt PCI)',
    status_type: 'NORMAL',
    open_defects: '2 điểm nhẹ',
    defects_count: 2
  },
  {
    code: 'SEG-05',
    stationing: 'Km 1042+000 – Km 1045+500',
    length_km: 3.5,
    status_label: 'Đang theo dõi nứt mỏi',
    status_type: 'MONITORING',
    open_defects: '2 điểm nứt',
    defects_count: 2
  }
]

export const INITIAL_MEMBERS: ProjectMember[] = [
  {
    id: 'mem-01',
    name: 'Nguyễn Văn An',
    role_code: 'SUPERVISOR',
    role_title: 'Giám sát trưởng (Supervisor)',
    role_badge: 'SUPERVISOR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    is_online: true,
    authority: 'Phê duyệt phương án sửa chữa, nghiệm thu & ký đóng hồ sơ pháp lý',
    contact: 'an.nv@hoanghai-infra.vn • 0912.888.666',
    unit: 'Ban Giám sát Hoàng Hải / Chủ đầu tư'
  },
  {
    id: 'mem-02',
    name: 'Đỗ Quốc Hoàng',
    role_code: 'PM',
    role_title: 'Quản lý dự án (Project Manager)',
    role_badge: 'PM CHÍNH',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    is_online: true,
    authority: 'Điều phối hiện trường, lập gói sửa chữa kỹ thuật, quản lý tiến độ SLA',
    contact: 'hoang.ks@hoanghai-infra.vn • Hoạt động 12p trước',
    unit: 'Ban Chỉ huy Công trường'
  },
  {
    id: 'mem-03',
    name: 'Lê Văn Hùng',
    role_code: 'CREW_LEAD',
    role_title: 'Trưởng đội sửa chữa (Crew Lead)',
    role_badge: 'CREW LEAD',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    is_online: false,
    authority: 'Tiếp nhận lệnh công tác, tổ chức thi công dặm vá, nạp ảnh hiện trường',
    contact: 'hung.crew@hoanghai-infra.vn',
    equipment: 'App Mobile Crew (Tablet bọc cao su chống va đập)',
    unit: 'Tổ thi công nguội & vá dặm mặt đường 01'
  },
  {
    id: 'mem-04',
    name: 'Phạm Văn Đức',
    role_code: 'DRONE_PILOT',
    role_title: 'Phi công Drone (Drone Pilot)',
    role_badge: 'DRONE PILOT',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    is_online: false,
    authority: 'Thực hiện bay chụp ảnh RGB/Thermal, nạp thẻ SD, kiểm soát tọa độ bay',
    contact: 'duc.pilot@hoanghai-infra.vn',
    equipment: 'RTK Matrice 300 • Giấy phép bay Cục Tác chiến',
    unit: 'Đội bay không ảnh trắc địa Miền Trung'
  }
]
