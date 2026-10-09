import { ProjectConfig, ExportRecord } from './types'

// ==========================================
// 1. CẤU HÌNH DỰ ÁN & CHỈ SỐ METRICS (PROJECTS CONFIG)
// ==========================================
export const PROJECTS_CONFIG: Record<string, ProjectConfig> = {
  'prj-ql1a-02': {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2 (Đèo Hải Vân)',
    shortName: 'QL1A',
    route: 'QL1A',
    chainage: 'Km 1024 - Km 1045',
    serverNode: 'Trạm giám sát QL1A',
    met01_ratio: 78.4,
    met01_change: '+4.2% so với Q2',
    met01_completed_text: '47/60 khiếm khuyết xử lý đúng hạn cam kết',
    met01_target: 75.0,
    met04_mtta: 3.2,
    met04_change: '-1.1 ngày',
    met04_sup_days: 2.1,
    met04_pm_days: 1.1,
    met08_recurrence: 4.1,
    met08_status: 'ĐẠT CHUẨN',
    met08_note: 'Ngưỡng an toàn: < 5.0% (Phát hiện 2 điểm lún lại tại Km 1032)',
    met11_integrity: 99.8,
    met11_items_text: '1,248/1,250 ảnh & biên bản khớp mã băm SHA-256'
  },
  'prj-ctbn-01': {
    id: 'prj-ctbn-01',
    code: 'PRJ-CTBN-01',
    name: 'Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)',
    shortName: 'CT01 Diễn Châu',
    route: 'CT01',
    chainage: 'Km 430+000 - Km 479+300',
    serverNode: 'Trạm giám sát CT01',
    met01_ratio: 85.0,
    met01_change: '+6.5% so với Q2',
    met01_completed_text: '34/40 khiếm khuyết xử lý đúng hạn cam kết',
    met01_target: 80.0,
    met04_mtta: 2.8,
    met04_change: '-0.8 ngày',
    met04_sup_days: 1.9,
    met04_pm_days: 0.9,
    met08_recurrence: 2.3,
    met08_status: 'ĐẠT CHUẨN',
    met08_note: 'Mặt đường bê tông nhựa chặt, độ nhám đạt TCVN 8819',
    met11_integrity: 100.0,
    met11_items_text: '890/890 ảnh & log đo đạc đối soát khớp 100%'
  },
  'prj-lstl-05': {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan (QL14B)',
    shortName: 'La Sơn - Túy Loan',
    route: 'QL14B / CT',
    chainage: 'Km 35+000 - Km 42+500',
    serverNode: 'Trạm giám sát QL14B',
    met01_ratio: 72.5,
    met01_change: '-1.2% so với Q2',
    met01_completed_text: '29/40 khiếm khuyết xử lý đúng hạn cam kết',
    met01_target: 75.0,
    met04_mtta: 3.9,
    met04_change: '+0.4 ngày',
    met04_sup_days: 2.5,
    met04_pm_days: 1.4,
    met08_recurrence: 4.8,
    met08_status: 'ĐẠT CHUẨN',
    met08_note: 'Dưới ngưỡng khống chế (< 5.0%), khe co giãn Hòa Vang ổn định',
    met11_integrity: 99.5,
    met11_items_text: '720/724 ảnh & log hiện trường toàn vẹn'
  },
  'prj-ptdg-03': {
    id: 'prj-ptdg-03',
    code: 'PRJ-PTDG-03',
    name: 'Tuyến tránh TP. Huế (QL1A-BP)',
    shortName: 'Tránh TP. Huế',
    route: 'QL1A-BP',
    chainage: 'Km 18+600 - Km 22+400',
    serverNode: 'Trạm giám sát Huế',
    met01_ratio: 68.2,
    met01_change: '-3.5% so với Q2',
    met01_completed_text: '22/32 khiếm khuyết xử lý đúng hạn cam kết',
    met01_target: 70.0,
    met04_mtta: 4.5,
    met04_change: '+1.2 ngày',
    met04_sup_days: 3.0,
    met04_pm_days: 1.5,
    met08_recurrence: 6.2,
    met08_status: 'CẢNH BÁO',
    met08_note: 'Vượt ngưỡng an toàn kỹ thuật (≥ 5.0%) do mưa lũ gây hằn lún bánh xe',
    met11_integrity: 99.1,
    met11_items_text: '610/615 ảnh & log hiện trường hợp lệ'
  },
  'ALL': {
    id: 'ALL',
    code: 'ALL',
    name: 'Toàn bộ danh mục 4 dự án',
    shortName: 'Toàn danh mục',
    route: 'Liên tỉnh',
    chainage: '4 Dự án bảo hành trọng điểm',
    serverNode: 'Cụm quản lý dự án',
    met01_ratio: 76.8,
    met01_change: '+2.1% so với Q2',
    met01_completed_text: '132/172 khiếm khuyết xử lý đúng hạn cam kết',
    met01_target: 75.0,
    met04_mtta: 3.4,
    met04_change: '-0.5 ngày',
    met04_sup_days: 2.3,
    met04_pm_days: 1.1,
    met08_recurrence: 4.2,
    met08_status: 'ĐẠT CHUẨN',
    met08_note: 'Tỷ lệ trung bình toàn mạng lưới duy trì dưới ngưỡng an toàn 5.0%',
    met11_integrity: 99.7,
    met11_items_text: '3,468/3,479 tệp ảnh & dữ liệu đo đạt chuẩn SHA-256'
  }
}

// ==========================================
// 2. HỒ SƠ KẾT XUẤT LƯU TRỮ (EXPORT RECORDS)
// ==========================================
export const INITIAL_EXPORT_RECORDS: ExportRecord[] = [
  // PRJ-QL1A-02 (Huế - Đà Nẵng)
  {
    id: 'rec-01', code: 'EXP-2026-0914', project_id: 'prj-ql1a-02', project_code: 'PRJ-QL1A-02',
    quarter: 'Q3_2026', track: 'APPROVAL_TRACK', type: 'Hồ sơ hoàn công đợt sửa chữa',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200', type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/104-26', scope_display: 'Km 1024+000 - Km 1045+000', as_of_time: '25/08/2026 21:45',
    as_of_timestamp: 1787687100000, file_size: '142 MB', file_size_mb: 142, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', total_items: 48
  },
  {
    id: 'rec-02', code: 'EXP-2026-0830', project_id: 'prj-ql1a-02', project_code: 'PRJ-QL1A-02',
    quarter: 'MONTH_08_2026', track: 'APPROVAL_TRACK', type: 'Biên bản nghiệm thu Trước/Sau sửa chữa',
    type_badge_color: 'bg-emerald-50 text-emerald-800 border-emerald-200', type_category_name: 'Nghiệm thu đối chứng',
    dossier_no: 'BB-NTKT/103-26', scope_display: 'Km 1030+000 - Km 1038+000', as_of_time: '25/08/2026 21:30',
    as_of_timestamp: 1787686200000, file_size: '92.4 MB', file_size_mb: 92.4, format_display: 'ZIP',
    status: 'PROCESSING', total_items: 24
  },
  {
    id: 'rec-17', code: 'EXP-2026-0819-EM', project_id: 'prj-ql1a-02', project_code: 'PRJ-QL1A-02',
    quarter: 'Q3_2026', track: 'EMERGENCY', type: 'Hồ sơ đợt khẩn cấp sạt trượt taluy',
    type_badge_color: 'bg-rose-50 text-rose-800 border-rose-200', type_category_name: 'Hồ sơ khẩn cấp',
    dossier_no: 'BB-NTKT/099-EM', scope_display: 'Km 1041+200', as_of_time: '19/08/2026 18:20',
    as_of_timestamp: 1787146800000, file_size: '210 MB', file_size_mb: 210, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: '9f83726aef128491823901bdaf0921829031efbca128919284102948192a0192a', total_items: 64
  },
  {
    id: 'rec-04', code: 'EXP-2026-0810', project_id: 'prj-ql1a-02', project_code: 'PRJ-QL1A-02',
    quarter: 'MONTH_08_2026', track: 'FAST_TRACK', type: 'Nhật ký thi công dặm vá Fast Track',
    type_badge_color: 'bg-amber-50 text-amber-800 border-amber-200', type_category_name: 'Nhật ký thi công',
    dossier_no: 'FT-LOG-2026-08', scope_display: 'Km 1025+000 - Km 1035+000', as_of_time: '10/08/2026 17:15',
    as_of_timestamp: 1786367700000, file_size: '34 MB', file_size_mb: 34, format_display: 'ZIP + CSV',
    status: 'COMPLETED', hash_sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', total_items: 18
  },
  {
    id: 'rec-05', code: 'EXP-2026-0628', project_id: 'prj-ql1a-02', project_code: 'PRJ-QL1A-02',
    quarter: 'Q2_2026', track: 'APPROVAL_TRACK', type: 'Biên bản nghiệm thu đợt thảm bù lún',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200', type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/078-26', scope_display: 'Km 1028+000 - Km 1034+000', as_of_time: '28/06/2026 09:30',
    as_of_timestamp: 1782639000000, file_size: '118 MB', file_size_mb: 118, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e', total_items: 38
  },
  {
    id: 'rec-06', code: 'EXP-2026-0515', project_id: 'prj-ql1a-02', project_code: 'PRJ-QL1A-02',
    quarter: 'Q2_2026', track: 'APPROVAL_TRACK', type: 'Hồ sơ pháp lý nghiệm thu bàn giao đợt 1',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200', type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/045-26', scope_display: 'Km 1024+000 - Km 1045+000', as_of_time: '15/05/2026 14:00',
    as_of_timestamp: 1778832000000, file_size: '205 MB', file_size_mb: 205, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: 'b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5', total_items: 72
  },

  // PRJ-CTBN-01 (Cao tốc Bắc Nam)
  {
    id: 'rec-15', code: 'EXP-2026-0919', project_id: 'prj-ctbn-01', project_code: 'PRJ-CTBN-01',
    quarter: 'Q3_2026', track: 'FAST_TRACK', type: 'Biên bản xử lý hộ lan va chạm Fast Track',
    type_badge_color: 'bg-emerald-50 text-emerald-800 border-emerald-200', type_category_name: 'Nghiệm thu đối chứng',
    dossier_no: 'FT-2026-0919', scope_display: 'Km 438+100', as_of_time: '19/08/2026 16:40',
    as_of_timestamp: 1787140800000, file_size: '26 MB', file_size_mb: 26, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: '4f9281aef128491823901bdaf0921829031efbca128919284102948192a01928c', total_items: 12
  },
  {
    id: 'rec-16', code: 'EXP-2026-0612', project_id: 'prj-ctbn-01', project_code: 'PRJ-CTBN-01',
    quarter: 'Q2_2026', track: 'APPROVAL_TRACK', type: 'Hồ sơ hoàn công thảm bù lún mố cầu',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200', type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/062-26', scope_display: 'Km 452+200 - Km 455+000', as_of_time: '12/06/2026 14:15',
    as_of_timestamp: 1781254500000, file_size: '158 MB', file_size_mb: 158, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: '7c8129aef128491823901bdaf0921829031efbca128919284102948192a01928d', total_items: 52
  },

  // PRJ-LSTL-05 (Cao tốc La Sơn - Túy Loan)
  {
    id: 'rec-03', code: 'EXP-2026-0715', project_id: 'prj-lstl-05', project_code: 'PRJ-LSTL-05',
    quarter: 'Q3_2026', track: 'APPROVAL_TRACK', type: 'Báo cáo kiểm định trắc dọc & Bình đồ GIS',
    type_badge_color: 'bg-blue-50 text-blue-800 border-blue-200', type_category_name: 'Trắc dọc & Bình đồ GIS',
    dossier_no: 'WGS-84 EPSG:4326', scope_display: 'Km 35+000 - Km 42+000', as_of_time: '15/08/2026 10:30',
    as_of_timestamp: 1786776600000, file_size: '310 MB', file_size_mb: 310, format_display: 'GeoJSON + Shapefile',
    status: 'COMPLETED', hash_sha256: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', total_items: 64
  },
  {
    id: 'rec-18', code: 'EXP-2026-0805', project_id: 'prj-lstl-05', project_code: 'PRJ-LSTL-05',
    quarter: 'Q3_2026', track: 'APPROVAL_TRACK', type: 'Biên bản nghiệm thu bù lún Km 38',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200', type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/088-26', scope_display: 'Km 38+200', as_of_time: '05/08/2026 16:30',
    as_of_timestamp: 1785934200000, file_size: '88 MB', file_size_mb: 88, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a', total_items: 30
  },

  // PRJ-PTDG-03 (Tuyến tránh Huế)
  {
    id: 'rec-19', code: 'EXP-2026-0722', project_id: 'prj-ptdg-03', project_code: 'PRJ-PTDG-03',
    quarter: 'Q3_2026', track: 'FAST_TRACK', type: 'Nhật ký trám khe nứt mặt đường bê tông',
    type_badge_color: 'bg-amber-50 text-amber-800 border-amber-200', type_category_name: 'Nhật ký thi công',
    dossier_no: 'FT-HUE-2026-07', scope_display: 'Km 18+600 - Km 20+000', as_of_time: '22/07/2026 11:15',
    as_of_timestamp: 1784717700000, file_size: '42 MB', file_size_mb: 42, format_display: 'ZIP + CSV',
    status: 'COMPLETED', hash_sha256: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b', total_items: 22
  },
  {
    id: 'rec-20', code: 'EXP-2026-0814', project_id: 'prj-ptdg-03', project_code: 'PRJ-PTDG-03',
    quarter: 'Q3_2026', track: 'APPROVAL_TRACK', type: 'Biên bản kiểm tra định kỳ mặt đường',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200', type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/092-26', scope_display: 'Km 20+000 - Km 22+400', as_of_time: '14/08/2026 15:45',
    as_of_timestamp: 1786709100000, file_size: '115 MB', file_size_mb: 115, format_display: 'ZIP + PDF',
    status: 'COMPLETED', hash_sha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c', total_items: 36
  }
]
