import {
  ProposalWorkPackage,
  ItemApprovalStatus,
  RepairItemDetail,
} from '../../types/domain'

export type { ProposalWorkPackage, ItemApprovalStatus, RepairItemDetail }

// Dữ liệu gói khởi tạo mô phỏng API
export const INITIAL_PACKAGES: ProposalWorkPackage[] = [
  {
    id: 'pkg-19',
    code: 'PKG-2026-19',
    title: 'Gói khắc phục hư hỏng khẩn cấp phân đoạn 14',
    route_id: 'ROUTE_EXP_01',
    route_name: 'Đường nối Cao tốc Bắc - Nam',
    chainage_start: 'Km 0+000',
    chainage_end: 'Km 15+500',
    chainage_display: 'Km 0+000 - Km 15+500',
    segments_count: 1,
    defect_count: 2,
    defect_summary: '2 điểm hư hỏng gom mới (SEG-EXP1)',
    technical_scope: 'Cào bóc thảm: 2.00 m²',
    material_scope: 'Vật tư theo phương án kỹ thuật',
    duration_days: 2,
    date_range: 'Dự kiến 2 ngày',
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    created_by_initials: 'ĐH',
    created_by_role: 'Chỉ huy trưởng dự án',
    created_at: '25/08/2026 - 10:15',
    status: 'SUBMITTED',
    status_label: 'Chờ duyệt',
    approved_items: 0,
    total_items: 2,
    contractor_name: 'Đội thi công sửa chữa Hoàng Hải 01'
  },
  {
    id: 'pkg-18',
    code: 'PKG-2026-18',
    title: 'Xử lý nứt rạn & lún cục bộ đoạn Km 1028 - 1033',
    route_id: 'QL1A_PK04',
    route_name: 'QL1A - Giai đoạn 2 (Km 1024 - Km 1045)',
    chainage_start: 'Km 1028+000',
    chainage_end: 'Km 1033+500',
    chainage_display: 'Km 1028+000 - Km 1033+500',
    segments_count: 1,
    defect_count: 3,
    defect_summary: '3 điểm hư hỏng gom mới (SEG-02)',
    technical_scope: 'Cào bóc thảm: 2.55 m²',
    material_scope: 'Vật tư theo phương án kỹ thuật',
    duration_days: 3,
    date_range: 'Dự kiến 3 ngày',
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    created_by_initials: 'ĐH',
    created_by_role: 'Chỉ huy trưởng dự án',
    created_at: '24/08/2026 - 16:40',
    status: 'SUBMITTED',
    status_label: 'Chờ duyệt',
    approved_items: 1,
    total_items: 3,
    contractor_name: 'Tổ cơ động sửa chữa BTXM 02'
  },
  {
    id: 'pkg-08',
    code: 'PKG-2026-08',
    title: 'Khắc phục ổ gà & lún nứt đợt 3',
    route_id: 'QL1A_PK04',
    route_name: 'QL1A - Giai đoạn 2 (Km 1024 - Km 1045)',
    chainage_start: 'Km 1024+000',
    chainage_end: 'Km 1030+000',
    chainage_display: 'Km 1024+000 - Km 1030+000',
    segments_count: 5,
    defect_count: 4,
    defect_summary: '4 điểm hư hỏng gom mới (SEG-01)',
    technical_scope: 'Cào bóc thảm: 70.7 m²',
    material_scope: 'Bê tông nhựa C19: 14 m³',
    duration_days: 3,
    date_range: '18/08 - 21/08/2026',
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    created_by_initials: 'ĐH',
    created_by_role: 'Chỉ huy trưởng dự án',
    created_at: '18/08/2026 - 09:30',
    status: 'SUBMITTED',
    status_label: 'Chờ duyệt',
    approved_items: 2,
    total_items: 4,
    contractor_name: 'Đội thi công sửa chữa Hoàng Hải 01'
  },
  {
    id: 'pkg-07',
    code: 'PKG-2026-07',
    title: 'Vá cào bóc thảm nhựa polime',
    route_id: 'QL1A_PK04',
    route_name: 'QL1A - Giai đoạn 2 (Km 1024 - Km 1045)',
    chainage_start: 'Km 1033+500',
    chainage_end: 'Km 1038+000',
    chainage_display: 'Km 1033+500 - Km 1038+000',
    segments_count: 3,
    defect_count: 5,
    defect_summary: '5 điểm hư hỏng mặt lớp trên',
    technical_scope: 'Cào bóc thảm: 144.5 m²',
    material_scope: 'Bù vênh lu lèn: 22 tấn',
    duration_days: 2,
    date_range: '16/08 - 18/08/2026',
    created_by_name: 'Lê Văn Tùng (PM)',
    created_by_initials: 'LT',
    created_by_role: 'Kỹ sư cầu đường',
    created_at: '16/08/2026 - 15:45',
    status: 'DECIDED',
    status_label: 'Đã phê duyệt',
    approved_items: 5,
    total_items: 5,
    contractor_name: 'Tổ thi công Asphalt 01'
  },
  {
    id: 'pkg-09',
    code: 'PKG-2026-09',
    title: 'Xử lý nứt rạn mai rùa phân đoạn đèo',
    route_id: 'QL1A_PK04',
    route_name: 'QL1A - Giai đoạn 2 (Km 1024 - Km 1045)',
    chainage_start: 'Km 1042+000',
    chainage_end: 'Km 1045+500',
    chainage_display: 'Km 1042+000 - Km 1045+500',
    segments_count: 2,
    defect_count: 3,
    defect_summary: '3 điểm hư hỏng nứt lưới',
    technical_scope: 'Xử lý móng CPĐD: 95 m²',
    material_scope: 'Lưới địa kỹ thuật: 150 m²',
    duration_days: 4,
    date_range: '19/08 - 23/08/2026',
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    created_by_initials: 'ĐH',
    created_by_role: 'Chỉ huy trưởng dự án',
    created_at: '19/08/2026 - 08:15',
    status: 'DRAFT',
    status_label: 'Bản nháp',
    approved_items: 0,
    total_items: 3,
    contractor_name: 'Chưa phân công'
  }
]

// Dữ liệu items ban đầu của từng gói
export const PKG_19_ITEMS: RepairItemDetail[] = [
  {
    id: 'item-19-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-EXP-0012',
    chainage: 'Km 2+450',
    lane_info: 'Làn phải R1 • Tuyến nối cao tốc',
    defect_title: 'Ổ gà mặt đường sâu 4.5cm',
    defect_measurements: 'Sâu 4.5cm • S = 0.85 m²',
    solution_title: 'Trám vá nhựa nguội khẩn cấp',
    solution_standard: 'Tiêu chuẩn vá nhanh TCVN 8819',
    volume_display: '0.85 m²',
    volume_sub: 'Sâu 4.5 cm',
    area_m2: 0.85,
    status: 'PENDING',
    status_label: 'CHỜ DUYỆT',
    assigned_crew: 'Đội thi công sửa chữa Hoàng Hải 01',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_EXP_0012_ORTHO.JPG',
    gps_coords: '16.1420, 108.0825',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  },
  {
    id: 'item-19-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-EXP-0015',
    chainage: 'Km 5+120',
    lane_info: 'Làn trái L1 • Tuyến nối cao tốc',
    defect_title: 'Nứt dọc mép bó vỉa 3.8m',
    defect_measurements: 'Rộng 6mm • Dài 3.8m • S = 1.15 m²',
    solution_title: 'Cắt rãnh & rót mastic chèn khe co giãn',
    solution_standard: 'Quy trình xử lý nứt AASHTO',
    volume_display: '1.15 m²',
    volume_sub: 'Dài 3.8 m',
    area_m2: 1.15,
    status: 'PENDING',
    status_label: 'CHỜ DUYỆT',
    assigned_crew: 'Đội thi công sửa chữa Hoàng Hải 01',
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_EXP_0015_CRACK.JPG',
    gps_coords: '16.1650, 108.1120',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  }
]

export const PKG_18_ITEMS: RepairItemDetail[] = [
  {
    id: 'item-18-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-2026-0071',
    chainage: 'Km 1028+350',
    lane_info: 'Làn phải R1 • Tấm #22',
    defect_title: 'Lún vệt bánh xe sâu 22mm',
    defect_measurements: 'Dài 8.5m • S = 0.95 m²',
    solution_title: 'Cào bóc 5cm & thảm lại BTN C12.5',
    solution_standard: 'Tiêu chuẩn cào bóc TCVN 8819',
    volume_display: '0.95 m²',
    volume_sub: 'Sâu 5.0 cm',
    area_m2: 0.95,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ cơ động sửa chữa BTXM 02',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1028_R1_RUT.JPG',
    gps_coords: '16.2215, 108.1512',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  },
  {
    id: 'item-18-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-2026-0074',
    chainage: 'Km 1030+100',
    lane_info: 'Làn giữa M1 • Tấm #38',
    defect_title: 'Vỡ mép góc tấm bê tông',
    defect_measurements: 'Sâu 6.0cm • S = 0.80 m²',
    solution_title: 'Trám vá nhựa nguội khẩn cấp',
    solution_standard: 'Tiêu chuẩn vá nhanh TCVN 8819',
    volume_display: '0.80 m²',
    volume_sub: 'Sâu 6.0 cm',
    area_m2: 0.80,
    status: 'PENDING',
    status_label: 'CHỜ DUYỆT',
    assigned_crew: 'Tổ cơ động sửa chữa BTXM 02',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1030_M1_SPALL.JPG',
    gps_coords: '16.2280, 108.1590',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  },
  {
    id: 'item-18-03',
    item_code: '#ITEM-03',
    defect_code: 'DEF-2026-0078',
    chainage: 'Km 1032+240',
    lane_info: 'Làn trái L2 • Tấm #54',
    defect_title: 'Nứt chân chim mai rùa cục bộ',
    defect_measurements: 'Rộng 4mm • S = 0.80 m²',
    solution_title: 'Xử lý móng CPĐD + thảm 2 lớp',
    solution_standard: 'Gia cố móng TCVN 8859',
    volume_display: '0.80 m²',
    volume_sub: 'Sâu 8.0 cm',
    area_m2: 0.80,
    status: 'PENDING',
    status_label: 'CHỜ DUYỆT',
    assigned_crew: 'Tổ cơ động sửa chữa BTXM 02',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1032_L2_ALLIG.JPG',
    gps_coords: '16.2345, 108.1680',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  }
]

export const PKG_08_ITEMS: RepairItemDetail[] = [
  {
    id: 'item-08-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-2026-0089',
    chainage: 'Km 1024+350',
    lane_info: 'Làn phải R1 • Tấm #42',
    defect_title: 'Ổ gà mặt đường cấp 3',
    defect_measurements: 'Sâu 6.0cm • S = 0.70 m²',
    solution_title: 'Trám vá nhựa nguội khẩn cấp',
    solution_standard: 'Tiêu chuẩn vá nhanh TCVN 8819',
    volume_display: '18.5 m²',
    volume_sub: 'Sâu 5.0 cm',
    area_m2: 18.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1024_R1_ORTHO.JPG',
    gps_coords: '15.8245, 108.2140',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  },
  {
    id: 'item-08-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-2026-0092',
    chainage: 'Km 1024+500',
    lane_info: 'Làn trái L2 • Tấm #48',
    defect_title: 'Nứt dọc kéo dài 4.2m',
    defect_measurements: 'Rộng 8mm • Sâu 4.5cm',
    solution_title: 'Cắt rãnh & rót mastic chèn khe',
    solution_standard: 'Quy trình xử lý nứt AASHTO',
    volume_display: '4.2 m',
    volume_sub: 'Rót chèn khe',
    area_m2: 0.8,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1024_L2_CRACK.JPG',
    gps_coords: '15.8260, 108.2155',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  },
  {
    id: 'item-08-03',
    item_code: '#ITEM-03',
    defect_code: 'DEF-2026-0095',
    chainage: 'Km 1025+120',
    lane_info: 'Làn giữa M1 • Tấm #60',
    defect_title: 'Lún vệt bánh xe sâu 25mm',
    defect_measurements: 'Chiều dài vệt 12m',
    solution_title: 'Cào bóc 5cm & thảm lại BTN C12.5',
    solution_standard: 'Tiêu chuẩn cào bóc TCVN 8819',
    volume_display: '36.0 m²',
    volume_sub: 'Dày 5.0 cm',
    area_m2: 36.0,
    status: 'REQUEST_EVIDENCE',
    status_label: 'YÊU CẦU BẰNG CHỨNG',
    assigned_crew: 'Chưa giao việc',
    supervisor_notes: 'Hình ảnh Drone chưa rõ độ sâu đáy lún. Đề nghị Tổ đo đạc bổ sung ảnh chụp thước đo cốt đáy.',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1025_M1_RUT.JPG',
    gps_coords: '15.8290, 108.2180',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  },
  {
    id: 'item-08-04',
    item_code: '#ITEM-04',
    defect_code: 'DEF-2026-0098',
    chainage: 'Km 1025+400',
    lane_info: 'Làn phải R1 • Tấm #68',
    defect_title: 'Nứt mạng lưới mai rùa diện rộng',
    defect_measurements: 'Diện tích nứt 3.5 m²',
    solution_title: 'Xử lý móng CPĐD + thảm 2 lớp',
    solution_standard: 'Gia cố móng TCVN 8859',
    volume_display: '12.0 m²',
    volume_sub: 'Cào bóc sâu 8cm',
    area_m2: 12.0,
    status: 'PENDING',
    status_label: 'CHỜ DUYỆT',
    assigned_crew: 'Chưa giao việc',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1025_R1_ALLIG.JPG',
    gps_coords: '15.8310, 108.2200',
    resolution: '4K • 3840x2160',
    pilot_name: 'Kỹ sư UAV Trần Hùng',
    drone_model: 'DJI Matrice 350 RTK'
  }
]

export const PKG_07_ITEMS: RepairItemDetail[] = [
  {
    id: 'item-07-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-2026-0021',
    chainage: 'Km 1033+620',
    lane_info: 'Làn phải R1 • Tấm #12',
    defect_title: 'Ổ gà mặt đường sâu 5cm',
    defect_measurements: 'Diện tích 25 m² • Sâu 5.0cm',
    solution_title: 'Cào bóc 5cm & thảm lại BTN C12.5',
    solution_standard: 'Tiêu chuẩn TCVN 8819',
    volume_display: '25.0 m²',
    volume_sub: 'Sâu 5.0 cm',
    area_m2: 25.0,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1033_R1_POTHOLE.JPG',
    gps_coords: '15.8245, 108.2140',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-07-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-2026-0023',
    chainage: 'Km 1034+150',
    lane_info: 'Làn trái L2 • Tấm #24',
    defect_title: 'Nứt dọc kéo dài kèm sứt mép',
    defect_measurements: 'Dài 18m • Rộng 12mm',
    solution_title: 'Xẻ rãnh chữ U rót Mastic đàn hồi',
    solution_standard: 'Quy trình AASHTO M324',
    volume_display: '18.0 m',
    volume_sub: 'Rót chèn khe',
    area_m2: 1.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Đội cơ giới Sửa chữa 02',
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1034_L2_CRACK.JPG',
    gps_coords: '15.8260, 108.2155',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-07-03',
    item_code: '#ITEM-03',
    defect_code: 'DEF-2026-0025',
    chainage: 'Km 1034+780',
    lane_info: 'Làn giữa M1 • Tấm #45',
    defect_title: 'Lún vệt bánh xe sâu 28mm',
    defect_measurements: 'Chiều dài vệt 35m',
    solution_title: 'Cào bóc san phẳng bù vênh lu lèn',
    solution_standard: 'Tiêu chuẩn lu lèn K98',
    volume_display: '55.0 m²',
    volume_sub: 'Dày 5.0 cm',
    area_m2: 55.0,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1034_M1_RUT.JPG',
    gps_coords: '15.8290, 108.2180',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-07-04',
    item_code: '#ITEM-04',
    defect_code: 'DEF-2026-0028',
    chainage: 'Km 1035+220',
    lane_info: 'Làn phải R1 • Tấm #56',
    defect_title: 'Bong bật bong tróc lớp thảm mặt',
    defect_measurements: 'Diện tích 32 m² • Sâu 3.5cm',
    solution_title: 'Cào bóc sâu 4cm thảm lớp hao mòn C9.5',
    solution_standard: 'Tiêu chuẩn TCVN 8819',
    volume_display: '32.0 m²',
    volume_sub: 'Dày 4.0 cm',
    area_m2: 32.0,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1035_R1_RAVEL.JPG',
    gps_coords: '15.8310, 108.2200',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-07-05',
    item_code: '#ITEM-05',
    defect_code: 'DEF-2026-0030',
    chainage: 'Km 1035+800',
    lane_info: 'Làn trái L1 • Tấm #68',
    defect_title: 'Ổ gà cục bộ mép dải phân cách',
    defect_measurements: 'Diện tích 16.5 m² • Sâu 4.0cm',
    solution_title: 'Trám vá nhựa nguội Carboncor đầm K95',
    solution_standard: 'Định mức TCVN 8819',
    volume_display: '16.5 m²',
    volume_sub: 'Dày 4.0 cm',
    area_m2: 16.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1035_L1_POTHOLE.JPG',
    gps_coords: '15.8350, 108.2240',
    resolution: '4K • 3840x2160'
  }
]

// =============================================================================
// MOCK API STORE SINGLETON (Độc lập trong bộ nhớ, không dùng localStorage)
// =============================================================================
let apiPackages: ProposalWorkPackage[] = [...INITIAL_PACKAGES]
const apiItemsByPackage: Record<string, RepairItemDetail[]> = {
  'pkg-19': [...PKG_19_ITEMS],
  'PKG-2026-19': [...PKG_19_ITEMS],
  'pkg-18': [...PKG_18_ITEMS],
  'PKG-2026-18': [...PKG_18_ITEMS],
  'pkg-08': [...PKG_08_ITEMS],
  'PKG-2026-08': [...PKG_08_ITEMS],
  'pkg-07': [...PKG_07_ITEMS],
  'PKG-2026-07': [...PKG_07_ITEMS]
}

const dispatchMockChangeEvent = () => {
  window.dispatchEvent(new CustomEvent('roadguard_repair_api_change'))
}

// Hàm sinh items động tương thích chính xác với thông tin của một gói
function generateDynamicItemsForPackage(pkg: ProposalWorkPackage): RepairItemDetail[] {
  const count = Math.max(1, pkg.defect_count || pkg.total_items || 2)
  const results: RepairItemDetail[] = []
  
  const sampleDefectTypes = [
    { title: 'Ổ gà mặt đường sâu cấp 3', standard: 'Tiêu chuẩn vá nhanh TCVN 8819', solution: 'Trám vá nhựa nguội khẩn cấp', depth: '4.5 cm' },
    { title: 'Nứt dọc kéo dài mép làn', standard: 'Quy trình xử lý nứt AASHTO', solution: 'Cắt rãnh & rót mastic chèn khe', depth: '3.0 cm' },
    { title: 'Lún vệt bánh xe sâu', standard: 'Tiêu chuẩn cào bóc TCVN 8819', solution: 'Cào bóc 5cm & thảm lại BTN C12.5', depth: '5.0 cm' },
    { title: 'Nứt rạn mai rùa diện rộng', standard: 'Gia cố móng TCVN 8859', solution: 'Xử lý móng CPĐD + thảm 2 lớp', depth: '7.5 cm' }
  ]

  for (let i = 0; i < count; i++) {
    const tIdx = i % sampleDefectTypes.length
    const t = sampleDefectTypes[tIdx]
    const itemCode = `#ITEM-${String(i + 1).padStart(2, '0')}`
    const defectCode = `DEF-${pkg.code.replace('PKG-', '')}-${String(i + 1).padStart(2, '0')}`
    const area = +(1.2 + i * 0.85).toFixed(2)

    results.push({
      id: `item-${pkg.id}-${i + 1}`,
      item_code: itemCode,
      defect_code: defectCode,
      chainage: `${pkg.chainage_start || 'Km 0+000'} + ${i * 450}m`,
      lane_info: `Làn phải R1 • Phân đoạn ${i + 1}`,
      defect_title: t.title,
      defect_measurements: `Diện tích ${area} m² • Sâu ${t.depth}`,
      solution_title: t.solution,
      solution_standard: t.standard,
      volume_display: `${area} m²`,
      volume_sub: `Sâu ${t.depth}`,
      area_m2: area,
      status: pkg.status === 'DECIDED' ? 'APPROVED' : 'PENDING',
      status_label: pkg.status === 'DECIDED' ? 'APPROVED' : 'CHỜ DUYỆT',
      assigned_crew: pkg.contractor_name || 'Chưa phân công',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      ortho_code: `ORTHO_${defectCode}.JPG`,
      gps_coords: '16.1520, 108.0950',
      resolution: '4K • 3840x2160',
      pilot_name: 'Kỹ sư UAV Trần Hùng',
      drone_model: 'DJI Matrice 350 RTK'
    })
  }

  return results
}

export const repairService = {
  // --- SYNC API METHODS ---
  getPackages(): ProposalWorkPackage[] {
    return [...apiPackages]
  },

  getPackageById(id: string): ProposalWorkPackage | undefined {
    if (!id) return undefined
    const cleanId = id.trim().toLowerCase()
    return apiPackages.find(
      (p) => p.id.toLowerCase() === cleanId || p.code.toLowerCase() === cleanId
    )
  },

  createPackage(data: Partial<ProposalWorkPackage>, items?: RepairItemDetail[]): ProposalWorkPackage {
    const list = this.getPackages()
    const newCode = data.code || `PKG-2026-${String(list.length + 10).padStart(2, '0')}`
    const newId = data.id || `pkg-${Date.now()}`

    const newPkg: ProposalWorkPackage = {
      id: newId,
      code: newCode,
      title: data.title || 'Gói đề xuất sửa chữa kỹ thuật mới',
      route_id: data.route_id || 'QL1A_PK04',
      route_name: data.route_name || 'QL1A - Giai đoạn 2',
      chainage_start: data.chainage_start || 'Km 1024+000',
      chainage_end: data.chainage_end || 'Km 1030+000',
      chainage_display: data.chainage_display || `${data.chainage_start} - ${data.chainage_end}`,
      segments_count: data.segments_count || 1,
      defect_count: data.defect_count || (items ? items.length : 0),
      defect_summary: data.defect_summary || 'Các khiếm khuyết được gom vào gói',
      technical_scope: data.technical_scope || 'Xử lý kỹ thuật mặt đường',
      material_scope: data.material_scope || 'Vật liệu quy chuẩn TCVN',
      technical_method: data.technical_method,
      duration_days: data.duration_days || 3,
      date_range: data.date_range || 'Trong tuần này',
      created_by_name: data.created_by_name || 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: data.created_by_initials || 'ĐH',
      created_by_role: data.created_by_role || 'Chỉ huy trưởng dự án',
      created_at: data.created_at || new Date().toLocaleDateString('vi-VN') + ' - ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: data.status || 'DRAFT',
      status_label: data.status_label || (data.status === 'SUBMITTED' ? 'Chờ duyệt' : 'Bản nháp'),
      approved_items: data.approved_items || 0,
      total_items: data.total_items || (items ? items.length : data.defect_count || 0),
      contractor_name: data.contractor_name || 'Chưa phân công',
      description: data.description
    }

    apiPackages = [newPkg, ...apiPackages]

    // Lưu danh sách items thật nếu có, hoặc tạo động gắn liền với gói này
    const finalItems = items && items.length > 0 ? [...items] : generateDynamicItemsForPackage(newPkg)
    apiItemsByPackage[newId] = finalItems
    apiItemsByPackage[newCode] = finalItems

    dispatchMockChangeEvent()
    return newPkg
  },

  submitPackage(packageId: string): ProposalWorkPackage | null {
    let submittedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    apiPackages = apiPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
        submittedPkg = {
          ...pkg,
          status: 'SUBMITTED',
          status_label: 'Chờ duyệt'
        }
        return submittedPkg
      }
      return pkg
    })

    if (submittedPkg) {
      dispatchMockChangeEvent()
    }
    return submittedPkg
  },

  deletePackage(packageId: string): boolean {
    const cleanId = packageId.trim().toLowerCase()
    apiPackages = apiPackages.filter(
      (p) => p.id.toLowerCase() !== cleanId && p.code.toLowerCase() !== cleanId
    )
    delete apiItemsByPackage[packageId]
    dispatchMockChangeEvent()
    return true
  },

  getItems(packageId?: string): RepairItemDetail[] {
    if (!packageId) return [...PKG_19_ITEMS]
    const cleanId = packageId.trim().toLowerCase()
    const targetPkg = this.getPackageById(packageId)

    // 1. Tìm trong store theo id hoặc code
    for (const [key, storedItems] of Object.entries(apiItemsByPackage)) {
      if (key.toLowerCase() === cleanId && storedItems && storedItems.length > 0) {
        if (targetPkg && targetPkg.status === 'DECIDED') {
          return storedItems.map((it) => ({
            ...it,
            status: 'APPROVED',
            status_label: 'APPROVED'
          }))
        }
        return [...storedItems]
      }
    }

    // 2. Tra cứu package tương ứng trong API packages
    if (targetPkg) {
      for (const [key, storedItems] of Object.entries(apiItemsByPackage)) {
        if (
          (key.toLowerCase() === targetPkg.id.toLowerCase() ||
            key.toLowerCase() === targetPkg.code.toLowerCase()) &&
          storedItems &&
          storedItems.length > 0
        ) {
          if (targetPkg.status === 'DECIDED') {
            return storedItems.map((it) => ({
              ...it,
              status: 'APPROVED',
              status_label: 'APPROVED'
            }))
          }
          return [...storedItems]
        }
      }

      // Chưa có items -> Sinh động đúng số lượng defect_count và thông tin của gói đó
      const generated = generateDynamicItemsForPackage(targetPkg)
      apiItemsByPackage[targetPkg.id] = generated
      apiItemsByPackage[targetPkg.code] = generated
      return [...generated]
    }

    // 3. Fallback an toàn: Tạo 2 items động dựa trên ID được gọi
    const tempPkg: ProposalWorkPackage = {
      id: packageId,
      code: packageId.toUpperCase().startsWith('PKG-') ? packageId.toUpperCase() : `PKG-2026-${packageId.slice(-4)}`,
      title: 'Gói đề xuất sửa chữa kỹ thuật',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1024+000',
      chainage_end: 'Km 1030+000',
      chainage_display: 'Km 1024+000 - Km 1030+000',
      segments_count: 1,
      defect_count: 2,
      defect_summary: '2 điểm hư hỏng mặt đường',
      technical_scope: 'Cào bóc thảm: 2.0 m²',
      material_scope: 'Vật tư TCVN 8819',
      duration_days: 3,
      date_range: 'Dự kiến 3 ngày',
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: 'Hôm nay',
      status: 'SUBMITTED',
      status_label: 'Chờ duyệt',
      approved_items: 0,
      total_items: 2,
      contractor_name: 'Đội thi công sửa chữa Hoàng Hải 01'
    }
    const fallbackGenerated = generateDynamicItemsForPackage(tempPkg)
    apiItemsByPackage[packageId] = fallbackGenerated
    return [...fallbackGenerated]
  },

  setPackageItems(packageId: string, items: RepairItemDetail[]): void {
    const cleanId = packageId.trim().toLowerCase()
    apiItemsByPackage[packageId] = [...items]
    apiItemsByPackage[cleanId] = [...items]
    const targetPkg = this.getPackageById(packageId)
    if (targetPkg) {
      apiItemsByPackage[targetPkg.id] = [...items]
      apiItemsByPackage[targetPkg.id.toLowerCase()] = [...items]
      apiItemsByPackage[targetPkg.code] = [...items]
      apiItemsByPackage[targetPkg.code.toLowerCase()] = [...items]
    }
    dispatchMockChangeEvent()
  },

  updateItemDecision(
    packageId: string,
    itemId: string,
    decisionOrPatch: ItemApprovalStatus | Partial<RepairItemDetail>,
    notes?: string
  ): RepairItemDetail | null {
    const currentItems = this.getItems(packageId)
    let updatedItem: RepairItemDetail | null = null

    const updatedItems = currentItems.map((it) => {
      if (it.id === itemId || it.item_code === itemId) {
        if (typeof decisionOrPatch === 'string') {
          updatedItem = {
            ...it,
            status: decisionOrPatch,
            status_label: decisionOrPatch,
            supervisor_notes: notes || it.supervisor_notes
          }
        } else {
          updatedItem = {
            ...it,
            ...decisionOrPatch
          }
        }
        return updatedItem
      }
      return it
    })

    if (updatedItem) {
      this.setPackageItems(packageId, updatedItems)
      this.recalculatePackageStats(packageId, updatedItems)
    }
    return updatedItem
  },

  signPackageApproval(packageId: string, supervisorName = 'Giám sát trưởng (Supervisor)'): ProposalWorkPackage | null {
    const targetPkg = this.getPackageById(packageId)
    const items = this.getItems(packageId)

    const updatedItems = items.map((it) => ({
      ...it,
      status: 'APPROVED' as ItemApprovalStatus,
      status_label: 'APPROVED',
      supervisor_notes: it.supervisor_notes || `Phê duyệt kỹ thuật bởi ${supervisorName}`
    }))

    this.setPackageItems(packageId, updatedItems)
    if (targetPkg) {
      this.setPackageItems(targetPkg.id, updatedItems)
      this.setPackageItems(targetPkg.code, updatedItems)
    }

    let approvedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    apiPackages = apiPackages.map((pkg) => {
      if (
        pkg.id.toLowerCase() === cleanId ||
        pkg.code.toLowerCase() === cleanId ||
        (targetPkg && (pkg.id === targetPkg.id || pkg.code === targetPkg.code))
      ) {
        approvedPkg = {
          ...pkg,
          status: 'DECIDED',
          status_label: 'Đã phê duyệt',
          approved_items: updatedItems.length,
          total_items: updatedItems.length
        }
        return approvedPkg
      }
      return pkg
    })

    if (approvedPkg) {
      dispatchMockChangeEvent()
    }
    return approvedPkg
  },

  approvePackage(packageId: string): ProposalWorkPackage | null {
    return this.signPackageApproval(packageId)
  },

  dispatchPackage(packageId: string, crewName: string, _deadline?: string): ProposalWorkPackage | null {
    let dispatchedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    apiPackages = apiPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
        dispatchedPkg = {
          ...pkg,
          status: 'DISPATCHED',
          status_label: 'Đã giao việc',
          contractor_name: crewName
        }
        return dispatchedPkg
      }
      return pkg
    })

    if (dispatchedPkg) {
      dispatchMockChangeEvent()
    }
    return dispatchedPkg
  },

  recalculatePackageStats(packageId: string, items: RepairItemDetail[]): void {
    const approvedCount = items.filter((i) => i.status === 'APPROVED').length
    const cleanId = packageId.trim().toLowerCase()

    apiPackages = apiPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
        return {
          ...pkg,
          approved_items: approvedCount,
          total_items: items.length
        }
      }
      return pkg
    })
    dispatchMockChangeEvent()
  },

  // --- ASYNC MOCK API PROMISES ---
  async fetchPackages(): Promise<ProposalWorkPackage[]> {
    await new Promise((res) => setTimeout(res, 60))
    return this.getPackages()
  },

  async fetchPackageById(id: string): Promise<ProposalWorkPackage | undefined> {
    await new Promise((res) => setTimeout(res, 40))
    return this.getPackageById(id)
  },

  async fetchItems(packageId?: string): Promise<RepairItemDetail[]> {
    await new Promise((res) => setTimeout(res, 50))
    return this.getItems(packageId)
  }
}
