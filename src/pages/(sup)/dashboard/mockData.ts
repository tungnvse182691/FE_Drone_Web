import { RiskPortfolioItem } from './types'

export const REGION_PROJECTS: Record<string, { id: string; name: string }[]> = {
  CENTRAL: [
    { id: 'prj-ql1a-02', name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)' },
    { id: 'prj-lstl-05', name: 'Cao tốc La Sơn - Túy Loan (QL14B)' },
    { id: 'prj-ptdg-03', name: 'Tuyến tránh TP. Huế (QL1A-BP)' }
  ],
  NORTH: [
    { id: 'prj-ctbn-01', name: 'Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)' }
  ]
}

// Mock danh sách các điểm rủi ro bảo hành cao (RPT-06) đồng bộ với INITIAL_PROJECTS
export const MOCK_RISK_ITEMS: RiskPortfolioItem[] = [
  {
    id: 'risk-01',
    risk_level: 'Critical',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2',
    region: 'CENTRAL',
    route_code: 'QL1A',
    section_display: 'Đoạn Thừa Thiên Huế - Đà Nẵng',
    chainage_display: 'Km 1024 - Km 1045',
    open_defects_count: 12,
    defect_scope_display: 'Diện tích hư hỏng: 145 m²',
    sla_remaining: 'Còn 14 giờ',
    sla_status: 'urgent',
    pci_score: 58.2,
    gps_lat: 16.0547,
    gps_lng: 108.2025,
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    proposal_id: 'PKG-2026-08'
  },
  {
    id: 'risk-02',
    risk_level: 'Critical',
    project_id: 'prj-lstl-05',
    project_name: 'Cao tốc La Sơn - Túy Loan',
    region: 'CENTRAL',
    route_code: 'QL14B / CT',
    section_display: 'Đoạn Hòa Vang - Nút giao Túy Loan',
    chainage_display: 'Km 35+000 - Km 42+500',
    open_defects_count: 4,
    defect_scope_display: 'Khe co giãn: 2 vị trí',
    sla_remaining: 'Còn 5 ngày',
    sla_status: 'normal',
    pci_score: 68.0,
    gps_lat: 15.9324,
    gps_lng: 108.1211,
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    proposal_id: 'PKG-2026-05'
  },
  {
    id: 'risk-03',
    risk_level: 'Watch',
    project_id: 'prj-ctbn-01',
    project_name: 'Cao tốc Bắc Nam (Diễn Châu)',
    region: 'NORTH',
    route_code: 'CT01',
    section_display: 'Đoạn Diễn Châu - Bãi Vọt (Nghệ An)',
    chainage_display: 'Km 430+000 - Km 479+300',
    open_defects_count: 5,
    defect_scope_display: 'Nứt dọc mặt đường: 85 m',
    sla_remaining: 'Còn 25 ngày (Sắp hết BH)',
    sla_status: 'warning',
    pci_score: 64.5,
    gps_lat: 18.7231,
    gps_lng: 105.6542,
    pm_name: 'Trần Minh Tâm',
    pm_email: 'tam.tm@hoanghai-infra.vn',
    proposal_id: 'PKG-2026-02'
  },
  {
    id: 'risk-04',
    risk_level: 'Watch',
    project_id: 'prj-ptdg-03',
    project_name: 'Tuyến tránh TP. Huế (QL1A-BP)',
    region: 'CENTRAL',
    route_code: 'QL1A-BP',
    section_display: 'Đoạn Hương Trà - Hương Thủy',
    chainage_display: 'Km 18+600 - Km 22+400',
    open_defects_count: 8,
    defect_scope_display: 'Lún vệt bánh xe: 220 m²',
    sla_remaining: 'Còn 18 giờ',
    sla_status: 'urgent',
    pci_score: 52.8,
    gps_lat: 16.4637,
    gps_lng: 107.5908,
    pm_name: 'Lê Văn Cường',
    pm_email: 'cuong.lv@hoanghai-infra.vn',
    proposal_id: 'PKG-2026-03'
  }
]

// Mock Hoạt động gần đây (Audit Trail - RPT-10)
export const MOCK_RECENT_ACTIVITIES = [
  {
    id: 'act-01',
    tag: 'Duyệt AI',
    time: '10 phút trước',
    content: 'Hoàn tất scan AI 15km QL1A (Km 1024 - 1039), phân loại 18 khiếm khuyết.',
    type: 'ai'
  },
  {
    id: 'act-02',
    tag: 'Nghiệm thu',
    time: '45 phút trước',
    content: 'Supervisor ký xác nhận hoàn công hạng mục #ITEM-01 (Km 1024+350 QL1A).',
    type: 'acceptance'
  },
  {
    id: 'act-03',
    tag: 'Gói đề xuất',
    time: '2 giờ trước',
    content: 'Chỉ huy trưởng trình hồ sơ Gói đề xuất PKG-2026-08 (5 phân đoạn, 6.0km).',
    type: 'proposal'
  },
  {
    id: 'act-04',
    tag: 'Điều phối',
    time: '5 giờ trước',
    content: 'Phân công Đội Crew 02 cào bóc thảm nhựa polime phân đoạn Km 1033+500.',
    type: 'dispatch'
  }
]

