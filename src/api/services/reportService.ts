/**
 * reportService.ts — Mock API Báo cáo KPI, Hồ sơ giải trình & Chỉ số Rủi ro (RPT-01 đến RPT-07, BC02, BC04)
 * Tuân thủ:
 * - Kiến trúc bất đồng bộ (Async Mock API, mô phỏng network latency)
 * - KHÔNG sử dụng localStorage hay dữ liệu tĩnh chết (in-memory stateful store)
 * - Chuẩn kỹ thuật công trình đường bộ TCVN 8819:2011 & TCVN 8864
 * - 100% thuật ngữ tiếng Việt chuẩn
 */

export interface ProjectKpiMetrics {
  project_id: string
  project_code: string
  project_name: string
  chainage: string
  as_of_time: string
  
  // 1. Hiệu quả xử lý hư hỏng (Tỷ lệ xử lý đúng hạn cam kết SLA / Fast Track)
  operational_efficiency: {
    ratio: number // %
    change_text: string // ví dụ: "+4.2% so với Q2"
    completed_text: string // ví dụ: "47/60 khiếm khuyết xử lý đúng hạn"
    target_ratio: number // % mục tiêu (≥ 75%)
    status: 'DAT_MUC_TIEU' | 'CAN_CAI_THIEN'
  }

  // 2. Tốc độ thẩm duyệt hồ sơ trung bình (MTTA - Mean Time to Approve)
  review_speed: {
    average_days: number // ngày
    change_text: string // ví dụ: "-1.1 ngày so với tháng trước"
    supervisor_days: number // ngày TVGS / Chủ đầu tư thẩm duyệt
    pm_fast_track_days: number // ngày PM duyệt Fast Track
    target_days: number // ≤ 4.0 ngày
  }

  // 3. Tỷ lệ kiểm soát lún nứt & Độ bền kết cấu (TCVN 8819)
  structural_stability: {
    recurrence_rate: number // % tỷ lệ tái phát hư hỏng sau sửa chữa
    status: 'DAT_CHUAN' | 'CANH_BAO'
    status_label: string // 'ĐẠT CHUẨN' | 'CẢNH BÁO'
    technical_note: string
    threshold_rate: number // < 5.0%
  }

  // 4. Tính toàn vẹn hồ sơ pháp lý & mã băm số (SHA-256)
  dossier_integrity: {
    valid_ratio: number // %
    valid_items_text: string // ví dụ: "1,248/1,250 ảnh & biên bản hợp lệ"
    standard_name: string // "TCVN 8819:2011 • SHA-256 Hợp lệ"
  }
}

export interface ExportDossierRecord {
  id: string
  code: string
  project_id: string
  project_code: string
  quarter: 'Q3_2026' | 'Q2_2026' | 'MONTH_08_2026' | 'YTD' | string
  track: 'ALL' | 'FAST_TRACK' | 'APPROVAL_TRACK' | 'EMERGENCY'
  type: string
  type_badge_color: string
  type_category_name: string
  dossier_no: string
  scope_display: string
  as_of_time: string
  as_of_timestamp: number
  file_size: string
  file_size_mb: number
  format_display: string
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED'
  status_label: 'Đã hoàn thành' | 'Đang xử lý' | 'Thất bại'
  hash_sha256?: string
  total_items?: number
}

export interface AsyncExportWorkerJob {
  id: string
  name: string
  progress: number
  processedItems: number
  totalItems: number
  estimatedSecondsRemaining: number
  tempSizeMb: number
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  status_label: string
}

export interface CreateExportParams {
  reportType: string
  scope: string
  asOfDate: string
  includeOriginalFiles: boolean
  includeSha256Checksum: boolean
  compressRawTiff: boolean
  format: string
}

// In-Memory Data Store (Không dùng localStorage)
const IN_MEMORY_PROJECT_METRICS: Record<string, ProjectKpiMetrics> = {
  'prj-ql1a-02': {
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    project_name: 'QL1A - Giai đoạn 2 (Đèo Hải Vân)',
    chainage: 'Km 1024+000 - Km 1045+000',
    as_of_time: '21:45, 25/08/2026',
    operational_efficiency: {
      ratio: 78.4,
      change_text: '+4.2% so với Q2',
      completed_text: '47/60 khiếm khuyết xử lý đúng hạn cam kết',
      target_ratio: 75.0,
      status: 'DAT_MUC_TIEU'
    },
    review_speed: {
      average_days: 3.2,
      change_text: '-1.1 ngày so với tháng trước',
      supervisor_days: 2.1,
      pm_fast_track_days: 1.1,
      target_days: 4.0
    },
    structural_stability: {
      recurrence_rate: 4.1,
      status: 'DAT_CHUAN',
      status_label: 'ĐẠT CHUẨN',
      technical_note: 'Ngưỡng an toàn: < 5.0% (Phát hiện 2 điểm lún lại tại Km 1032)',
      threshold_rate: 5.0
    },
    dossier_integrity: {
      valid_ratio: 99.8,
      valid_items_text: '1,248/1,250 ảnh & biên bản khớp mã băm SHA-256',
      standard_name: 'TCVN 8819:2011 • SHA-256 Hợp lệ'
    }
  },
  'prj-ctbn-01': {
    project_id: 'prj-ctbn-01',
    project_code: 'PRJ-CTBN-01',
    project_name: 'Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)',
    chainage: 'Km 430+000 - Km 479+300',
    as_of_time: '20:30, 25/08/2026',
    operational_efficiency: {
      ratio: 85.0,
      change_text: '+6.5% so với Q2',
      completed_text: '34/40 khiếm khuyết xử lý đúng hạn cam kết',
      target_ratio: 80.0,
      status: 'DAT_MUC_TIEU'
    },
    review_speed: {
      average_days: 2.8,
      change_text: '-0.8 ngày so với tháng trước',
      supervisor_days: 1.9,
      pm_fast_track_days: 0.9,
      target_days: 4.0
    },
    structural_stability: {
      recurrence_rate: 2.3,
      status: 'DAT_CHUAN',
      status_label: 'ĐẠT CHUẨN',
      technical_note: 'Mặt đường bê tông nhựa chặt, độ nhám đạt TCVN 8819',
      threshold_rate: 5.0
    },
    dossier_integrity: {
      valid_ratio: 100.0,
      valid_items_text: '890/890 ảnh & log đo đạc đối soát khớp 100%',
      standard_name: 'TCVN 8819:2011 • SHA-256 Hợp lệ'
    }
  },
  'prj-lstl-05': {
    project_id: 'prj-lstl-05',
    project_code: 'PRJ-LSTL-05',
    project_name: 'Cao tốc La Sơn - Túy Loan (QL14B)',
    chainage: 'Km 35+000 - Km 42+500',
    as_of_time: '19:15, 25/08/2026',
    operational_efficiency: {
      ratio: 72.5,
      change_text: '-1.2% so với Q2',
      completed_text: '29/40 khiếm khuyết xử lý đúng hạn cam kết',
      target_ratio: 75.0,
      status: 'CAN_CAI_THIEN'
    },
    review_speed: {
      average_days: 3.9,
      change_text: '+0.4 ngày so với tháng trước',
      supervisor_days: 2.5,
      pm_fast_track_days: 1.4,
      target_days: 4.0
    },
    structural_stability: {
      recurrence_rate: 4.8,
      status: 'DAT_CHUAN',
      status_label: 'ĐẠT CHUẨN',
      technical_note: 'Dưới ngưỡng khống chế (< 5.0%), khe co giãn Hòa Vang ổn định',
      threshold_rate: 5.0
    },
    dossier_integrity: {
      valid_ratio: 99.5,
      valid_items_text: '720/724 ảnh & log hiện trường toàn vẹn',
      standard_name: 'TCVN 8819:2011 • SHA-256 Hợp lệ'
    }
  },
  'prj-ptdg-03': {
    project_id: 'prj-ptdg-03',
    project_code: 'PRJ-PTDG-03',
    project_name: 'Tuyến tránh TP. Huế (QL1A-BP)',
    chainage: 'Km 18+600 - Km 22+400',
    as_of_time: '18:50, 25/08/2026',
    operational_efficiency: {
      ratio: 68.2,
      change_text: '-3.5% so với Q2',
      completed_text: '22/32 khiếm khuyết xử lý đúng hạn cam kết',
      target_ratio: 70.0,
      status: 'CAN_CAI_THIEN'
    },
    review_speed: {
      average_days: 4.5,
      change_text: '+1.2 ngày so với tháng trước',
      supervisor_days: 3.0,
      pm_fast_track_days: 1.5,
      target_days: 4.0
    },
    structural_stability: {
      recurrence_rate: 6.2,
      status: 'CANH_BAO',
      status_label: 'CẢNH BÁO',
      technical_note: 'Vượt ngưỡng an toàn kỹ thuật (≥ 5.0%) do mưa lũ gây hằn lún bánh xe',
      threshold_rate: 5.0
    },
    dossier_integrity: {
      valid_ratio: 99.1,
      valid_items_text: '610/615 ảnh & log hiện trường hợp lệ',
      standard_name: 'TCVN 8819:2011 • SHA-256 Hợp lệ'
    }
  },
  'ALL': {
    project_id: 'ALL',
    project_code: 'ALL',
    project_name: 'Toàn bộ danh mục (4 Dự án bảo hành)',
    chainage: 'Toàn mạng lưới công trình',
    as_of_time: '21:45, 25/08/2026',
    operational_efficiency: {
      ratio: 76.8,
      change_text: '+2.1% so với Q2',
      completed_text: '132/172 khiếm khuyết xử lý đúng hạn cam kết',
      target_ratio: 75.0,
      status: 'DAT_MUC_TIEU'
    },
    review_speed: {
      average_days: 3.4,
      change_text: '-0.5 ngày so với tháng trước',
      supervisor_days: 2.3,
      pm_fast_track_days: 1.1,
      target_days: 4.0
    },
    structural_stability: {
      recurrence_rate: 4.2,
      status: 'DAT_CHUAN',
      status_label: 'ĐẠT CHUẨN',
      technical_note: 'Tỷ lệ trung bình toàn mạng lưới duy trì dưới ngưỡng an toàn 5.0%',
      threshold_rate: 5.0
    },
    dossier_integrity: {
      valid_ratio: 99.7,
      valid_items_text: '3,468/3,479 tệp ảnh & dữ liệu đo đạt chuẩn SHA-256',
      standard_name: 'TCVN 8819:2011 • SHA-256 Hợp lệ'
    }
  }
}

const IN_MEMORY_EXPORT_RECORDS: ExportDossierRecord[] = [
  {
    id: 'rec-01',
    code: 'EXP-2026-0914',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'Q3_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ hoàn công đợt sửa chữa',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200',
    type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/104-26',
    scope_display: 'Km 1024+000 - Km 1045+000',
    as_of_time: '25/08/2026 21:45',
    as_of_timestamp: 1787687100000,
    file_size: '142 MB',
    file_size_mb: 142,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    total_items: 48
  },
  {
    id: 'rec-02',
    code: 'EXP-2026-0830',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'MONTH_08_2026',
    track: 'APPROVAL_TRACK',
    type: 'Biên bản nghiệm thu Trước/Sau sửa chữa',
    type_badge_color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    type_category_name: 'Nghiệm thu đối chứng',
    dossier_no: 'BB-NTKT/103-26',
    scope_display: 'Km 1030+000 - Km 1038+000',
    as_of_time: '25/08/2026 21:30',
    as_of_timestamp: 1787686200000,
    file_size: '92.4 MB',
    file_size_mb: 92.4,
    format_display: 'ZIP',
    status: 'PROCESSING',
    status_label: 'Đang xử lý',
    total_items: 24
  },
  {
    id: 'rec-04',
    code: 'EXP-2026-0810',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'MONTH_08_2026',
    track: 'FAST_TRACK',
    type: 'Nhật ký thi công dặm vá Fast Track',
    type_badge_color: 'bg-amber-50 text-amber-800 border-amber-200',
    type_category_name: 'Nhật ký thi công',
    dossier_no: 'FT-LOG-2026-08',
    scope_display: 'Km 1025+000 - Km 1035+000',
    as_of_time: '10/08/2026 17:15',
    as_of_timestamp: 1786367700000,
    file_size: '34 MB',
    file_size_mb: 34,
    format_display: 'ZIP + CSV',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    total_items: 18
  },
  {
    id: 'rec-17',
    code: 'EXP-2026-0819-EM',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'Q3_2026',
    track: 'EMERGENCY',
    type: 'Hồ sơ đợt khẩn cấp sạt trượt taluy',
    type_badge_color: 'bg-rose-50 text-rose-800 border-rose-200',
    type_category_name: 'Hồ sơ khẩn cấp',
    dossier_no: 'BB-NTKT/099-EM',
    scope_display: 'Km 1041+200',
    as_of_time: '19/08/2026 18:20',
    as_of_timestamp: 1787146800000,
    file_size: '210 MB',
    file_size_mb: 210,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: '9f83726aef128491823901bdaf0921829031efbca128919284102948192a0192a',
    total_items: 64
  },
  {
    id: 'rec-05',
    code: 'EXP-2026-0628',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'Q2_2026',
    track: 'APPROVAL_TRACK',
    type: 'Biên bản nghiệm thu đợt thảm bù lún',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200',
    type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/078-26',
    scope_display: 'Km 1028+000 - Km 1034+000',
    as_of_time: '28/06/2026 09:30',
    as_of_timestamp: 1782639000000,
    file_size: '118 MB',
    file_size_mb: 118,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    total_items: 38
  },
  {
    id: 'rec-15',
    code: 'EXP-2026-0919',
    project_id: 'prj-ctbn-01',
    project_code: 'PRJ-CTBN-01',
    quarter: 'Q3_2026',
    track: 'FAST_TRACK',
    type: 'Biên bản xử lý hộ lan va chạm Fast Track',
    type_badge_color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    type_category_name: 'Nghiệm thu đối chứng',
    dossier_no: 'FT-2026-0919',
    scope_display: 'Km 438+100',
    as_of_time: '19/08/2026 16:40',
    as_of_timestamp: 1787140800000,
    file_size: '26 MB',
    file_size_mb: 26,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: '4f9281aef128491823901bdaf0921829031efbca128919284102948192a01928c',
    total_items: 12
  },
  {
    id: 'rec-16',
    code: 'EXP-2026-0612',
    project_id: 'prj-ctbn-01',
    project_code: 'PRJ-CTBN-01',
    quarter: 'Q2_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ hoàn công thảm bù lún mố cầu',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200',
    type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/062-26',
    scope_display: 'Km 452+200 - Km 455+000',
    as_of_time: '12/06/2026 14:15',
    as_of_timestamp: 1781254500000,
    file_size: '158 MB',
    file_size_mb: 158,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: '7c8129aef128491823901bdaf0921829031efbca128919284102948192a01928d',
    total_items: 52
  },
  {
    id: 'rec-03',
    code: 'EXP-2026-0715',
    project_id: 'prj-lstl-05',
    project_code: 'PRJ-LSTL-05',
    quarter: 'Q3_2026',
    track: 'APPROVAL_TRACK',
    type: 'Báo cáo kiểm định trắc dọc & Bình đồ GIS',
    type_badge_color: 'bg-blue-50 text-blue-800 border-blue-200',
    type_category_name: 'Trắc dọc & Bình đồ GIS',
    dossier_no: 'WGS-84 EPSG:4326',
    scope_display: 'Km 35+000 - Km 42+000',
    as_of_time: '15/08/2026 10:30',
    as_of_timestamp: 1786776600000,
    file_size: '310 MB',
    file_size_mb: 310,
    format_display: 'GeoJSON + Shapefile',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    total_items: 64
  },
  {
    id: 'rec-18',
    code: 'EXP-2026-0805',
    project_id: 'prj-lstl-05',
    project_code: 'PRJ-LSTL-05',
    quarter: 'Q3_2026',
    track: 'APPROVAL_TRACK',
    type: 'Biên bản nghiệm thu bù lún Km 38',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200',
    type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/088-26',
    scope_display: 'Km 38+200',
    as_of_time: '05/08/2026 16:30',
    as_of_timestamp: 1785934200000,
    file_size: '88 MB',
    file_size_mb: 88,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a',
    total_items: 30
  },
  {
    id: 'rec-19',
    code: 'EXP-2026-0722',
    project_id: 'prj-ptdg-03',
    project_code: 'PRJ-PTDG-03',
    quarter: 'Q3_2026',
    track: 'FAST_TRACK',
    type: 'Nhật ký trám khe nứt mặt đường bê tông',
    type_badge_color: 'bg-amber-50 text-amber-800 border-amber-200',
    type_category_name: 'Nhật ký thi công',
    dossier_no: 'FT-HUE-2026-07',
    scope_display: 'Km 18+600 - Km 20+000',
    as_of_time: '22/07/2026 11:15',
    as_of_timestamp: 1784717700000,
    file_size: '42 MB',
    file_size_mb: 42,
    format_display: 'ZIP + CSV',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    total_items: 22
  },
  {
    id: 'rec-20',
    code: 'EXP-2026-0814',
    project_id: 'prj-ptdg-03',
    project_code: 'PRJ-PTDG-03',
    quarter: 'Q3_2026',
    track: 'APPROVAL_TRACK',
    type: 'Biên bản kiểm tra định kỳ mặt đường',
    type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200',
    type_category_name: 'Hồ sơ hoàn công',
    dossier_no: 'BB-NTKT/092-26',
    scope_display: 'Km 20+000 - Km 22+400',
    as_of_time: '14/08/2026 15:45',
    as_of_timestamp: 1786709100000,
    file_size: '115 MB',
    file_size_mb: 115,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    status_label: 'Đã hoàn thành',
    hash_sha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    total_items: 36
  }
]

let inMemoryExportRecords: ExportDossierRecord[] = [...IN_MEMORY_EXPORT_RECORDS]

let currentActiveJob: AsyncExportWorkerJob | null = {
  id: 'JOB-EXP-8842',
  name: 'QL1A_Q3_2026_Final.zip',
  progress: 65,
  processedItems: 31,
  totalItems: 48,
  estimatedSecondsRemaining: 18,
  tempSizeMb: 92.4,
  status: 'PROCESSING',
  status_label: 'Đang xử lý nén'
}

export const reportService = {
  /**
   * Lấy chỉ số KPI & rủi ro kỹ thuật theo dự án, quý và phân luồng
   * (GET /api/v1/reports/kpi-metrics)
   */
  async getProjectKpiMetrics(
    projectId: string = 'prj-ql1a-02',
    timeRange: string = 'Q3_2026',
    track: string = 'ALL'
  ): Promise<ProjectKpiMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const base = IN_MEMORY_PROJECT_METRICS[projectId] || IN_MEMORY_PROJECT_METRICS['prj-ql1a-02']
    const metrics: ProjectKpiMetrics = JSON.parse(JSON.stringify(base))

    // Phân luồng kỹ thuật điều chỉnh chỉ số
    if (track === 'FAST_TRACK') {
      metrics.operational_efficiency.ratio = Math.min(94.2, +(metrics.operational_efficiency.ratio + 12.5).toFixed(1))
      metrics.operational_efficiency.completed_text = '100% khiếm khuyết xử lý dưới 24h qua luồng Fast Track'
      metrics.review_speed.average_days = Math.max(0.8, +metrics.review_speed.pm_fast_track_days.toFixed(1))
      metrics.review_speed.change_text = '-1.8 ngày'
      metrics.structural_stability.recurrence_rate = Math.max(1.2, +(metrics.structural_stability.recurrence_rate - 1.5).toFixed(1))
      metrics.structural_stability.status = 'DAT_CHUAN'
      metrics.structural_stability.status_label = 'ĐẠT CHUẨN'
      metrics.structural_stability.technical_note = 'Quy trình xử lý nhanh kiểm soát tốt tái phát nứt lún cục bộ'
    } else if (track === 'APPROVAL_TRACK') {
      metrics.operational_efficiency.ratio = Math.max(65.0, +(metrics.operational_efficiency.ratio - 4.2).toFixed(1))
      metrics.operational_efficiency.completed_text = 'Các đợt sửa chữa lớn có lập hồ sơ khối lượng & TVGS thẩm định'
      metrics.review_speed.average_days = +metrics.review_speed.supervisor_days.toFixed(1)
      metrics.review_speed.change_text = '+0.5 ngày'
    } else if (track === 'EMERGENCY') {
      metrics.operational_efficiency.ratio = Math.min(88.0, +(metrics.operational_efficiency.ratio + 5.0).toFixed(1))
      metrics.operational_efficiency.completed_text = '100% sự cố thông xe khẩn cấp dưới 4h, chuyển tiếp hồ sơ sang thẩm duyệt'
      metrics.review_speed.average_days = 0.5
      metrics.review_speed.change_text = '-2.5 ngày'
      metrics.structural_stability.technical_note = 'Sự cố sạt lở taluy & ổ gà sâu được xử lý tạm thời chống ùn tắc'
    }

    if (timeRange === 'Q2_2026') {
      metrics.operational_efficiency.ratio = Math.max(62.0, +(metrics.operational_efficiency.ratio - 4.2).toFixed(1))
      metrics.operational_efficiency.change_text = '-0.8% so với Q1'
      metrics.review_speed.average_days = +(metrics.review_speed.average_days + 1.1).toFixed(1)
      metrics.review_speed.change_text = '+1.1 ngày'
    }

    return metrics
  },

  /**
   * Lấy danh sách hồ sơ giải trình đã kết xuất
   * (GET /api/v1/reports/export-records)
   */
  async getExportRecords(filters?: {
    projectId?: string
    status?: string
    timeRange?: string
    track?: string
    query?: string
  }): Promise<ExportDossierRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 90))
    let result = [...inMemoryExportRecords]

    if (filters) {
      const { projectId, status, timeRange, track, query } = filters
      if (projectId && projectId !== 'ALL') {
        result = result.filter((r) => r.project_id === projectId)
      }
      if (status && status !== 'ALL') {
        result = result.filter((r) => r.status === status)
      }
      if (timeRange && timeRange !== 'ALL') {
        if (timeRange === 'Q3_2026') {
          result = result.filter((r) => r.quarter === 'Q3_2026' || r.quarter === 'MONTH_08_2026')
        } else if (timeRange === 'Q2_2026') {
          result = result.filter((r) => r.quarter === 'Q2_2026')
        } else if (timeRange === 'MONTH_08_2026') {
          result = result.filter((r) => r.quarter === 'MONTH_08_2026')
        }
      }
      if (track && track !== 'ALL') {
        result = result.filter((r) => r.track === track || r.track === 'ALL')
      }
      if (query && query.trim()) {
        const q = query.toLowerCase().trim()
        result = result.filter(
          (r) =>
            r.code.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            r.scope_display.toLowerCase().includes(q) ||
            r.dossier_no.toLowerCase().includes(q)
        )
      }
    }

    return JSON.parse(JSON.stringify(result))
  },

  /**
   * Lấy trạng thái của background worker hiện tại
   * (GET /api/v1/reports/active-job)
   */
  async getActiveJob(): Promise<AsyncExportWorkerJob | null> {
    await new Promise((resolve) => setTimeout(resolve, 40))
    return currentActiveJob ? JSON.parse(JSON.stringify(currentActiveJob)) : null
  },

  /**
   * Tạo yêu cầu xuất hồ sơ bất đồng bộ
   * (POST /api/v1/reports/export-jobs)
   */
  async createExportJob(params: CreateExportParams): Promise<{ job: AsyncExportWorkerJob; record: ExportDossierRecord }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const codeNum = Math.floor(1000 + Math.random() * 9000)
    const newRecordId = `rec-${Date.now()}`
    const newCode = `EXP-2026-${codeNum}`

    const typeNameMap: Record<string, string> = {
      DOSSIER_COMPLETE: 'Hồ sơ hoàn công & Bằng chứng số',
      BEFORE_AFTER_ZIP: 'Gói ảnh đối chứng Trước/Sau sửa chữa',
      GIS_GEOJSON: 'Báo cáo kiểm định trắc dọc & Bình đồ GIS',
      AUDIT_TRAIL: 'Nhật ký thi công & Báo cáo pháp lý TCVN'
    }

    const newRecord: ExportDossierRecord = {
      id: newRecordId,
      code: newCode,
      project_id: params.scope.toLowerCase(),
      project_code: params.scope,
      quarter: 'Q3_2026',
      track: 'APPROVAL_TRACK',
      type: typeNameMap[params.reportType] || 'Hồ sơ hoàn công & Bằng chứng số',
      type_badge_color: 'bg-slate-100 text-slate-800 border-slate-200',
      type_category_name: 'Hồ sơ tổng hợp',
      dossier_no: `BB-NTKT/${codeNum}-26`,
      scope_display: 'Toàn tuyến dự án',
      as_of_time: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
      as_of_timestamp: Date.now(),
      file_size: '45.2 MB',
      file_size_mb: 45.2,
      format_display: 'ZIP + PDF',
      status: 'PROCESSING',
      status_label: 'Đang xử lý',
      total_items: 32
    }

    inMemoryExportRecords.unshift(newRecord)

    const newJob: AsyncExportWorkerJob = {
      id: `JOB-${newCode}`,
      name: `${newCode}.zip`,
      progress: 10,
      processedItems: 3,
      totalItems: 32,
      estimatedSecondsRemaining: 25,
      tempSizeMb: 12.5,
      status: 'PROCESSING',
      status_label: 'Đang xử lý nén'
    }

    currentActiveJob = newJob

    return {
      job: JSON.parse(JSON.stringify(newJob)),
      record: JSON.parse(JSON.stringify(newRecord))
    }
  },

  /**
   * Hủy tác vụ xuất nền đang thực thi
   * (DELETE /api/v1/reports/export-jobs/:id)
   */
  async cancelExportJob(jobId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    if (currentActiveJob && currentActiveJob.id === jobId) {
      currentActiveJob = {
        ...currentActiveJob,
        status: 'CANCELLED',
        status_label: 'Đã hủy'
      }
    }
    return true
  },

  /**
   * Thử lại tác vụ bị lỗi
   * (POST /api/v1/reports/export-records/:id/retry)
   */
  async retryExportRecord(recordId: string): Promise<ExportDossierRecord> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryExportRecords.findIndex((r) => r.id === recordId)
    if (index === -1) {
      throw new Error(`Record ${recordId} not found`)
    }

    inMemoryExportRecords[index] = {
      ...inMemoryExportRecords[index],
      status: 'PROCESSING',
      status_label: 'Đang xử lý'
    }

    return JSON.parse(JSON.stringify(inMemoryExportRecords[index]))
  },

  /**
   * Xóa bản ghi hồ sơ đã lưu trữ
   * (DELETE /api/v1/reports/export-records/:id)
   */
  async deleteExportRecord(recordId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 90))
    inMemoryExportRecords = inMemoryExportRecords.filter((r) => r.id !== recordId)
    return true
  },

  /**
   * Tải tệp hồ sơ (mô phỏng download blob)
   * (GET /api/v1/reports/export-records/:id/download)
   */
  async downloadExportFile(recordId: string): Promise<{ downloadUrl: string; fileName: string }> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const record = inMemoryExportRecords.find((r) => r.id === recordId || r.code === recordId)
    const fileName = record ? `${record.code}.zip` : `${recordId}`
    return {
      downloadUrl: `blob:mock-file-${recordId}`,
      fileName
    }
  },

  /**
   * Lấy danh sách đoạn tuyến phân tích nguy cơ suy thoái mặt đường theo lý trình Km (RPT-06)
   * (GET /api/v1/reports/rpt-06/deterioration-risks?projectId=...)
   */
  async getRpt06DeteriorationRisks(projectId?: string): Promise<Rpt06RiskSegment[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    let items = [...inMemoryRpt06Segments]
    if (projectId && projectId !== 'ALL') {
      items = items.filter((item) => item.project_id === projectId)
    }
    return JSON.parse(JSON.stringify(items))
  },

  /**
   * Đưa đoạn tuyến vào kế hoạch bay khảo sát định kỳ tiếp theo hoặc hủy đề xuất
   * (POST /api/v1/reports/rpt-06/segments/:id/toggle-survey-plan)
   */
  async toggleSurveyPlan(segmentId: string): Promise<Rpt06RiskSegment> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryRpt06Segments.findIndex((s) => s.id === segmentId)
    if (index === -1) {
      throw new Error(`Segment ${segmentId} not found`)
    }
    inMemoryRpt06Segments[index].survey_plan_suggested = !inMemoryRpt06Segments[index].survey_plan_suggested
    return JSON.parse(JSON.stringify(inMemoryRpt06Segments[index]))
  },

  /**
   * Lấy tọa độ tim tuyến toàn tuyến của dự án (GeoJSON LineString)
   * (GET /api/v1/projects/:id/mainline-coords)
   */
  async getProjectMainline(projectId: string): Promise<[number, number][]> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return PROJECT_MAINLINES[projectId] || PROJECT_MAINLINES['prj-ql1a-02'] || []
  }
}

const PROJECT_MAINLINES: Record<string, [number, number][]> = {
  'prj-ql1a-02': [
    [108.0825, 16.2731],
    [108.1054, 16.2589],
    [108.1287, 16.2415],
    [108.1492, 16.2238],
    [108.1695, 16.2085],
    [108.1884, 16.1843],
    [108.2025, 16.1547],
    [108.2152, 16.1321],
    [108.2418, 16.1115]
  ],
  'prj-lstl-05': [
    [108.062, 16.015],
    [108.082, 15.985],
    [108.105, 15.955],
    [108.1211, 15.9324],
    [108.145, 15.905]
  ],
  'prj-ctbn-01': [
    [105.621, 18.785],
    [105.638, 18.752],
    [105.6542, 18.7231],
    [105.672, 18.691]
  ],
  'prj-ptdg-03': [
    [107.562, 16.485],
    [107.578, 16.472],
    [107.5908, 16.4637],
    [107.612, 16.448]
  ]
}

// In-Memory RPT-06 Deterioration Risk Data (TCVN 8819:2011 & TCVN 8864)
export interface Rpt06RiskSegment {
  id: string
  project_id: string
  project_name: string
  section_name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
  risk_level: 'CRITICAL' | 'WATCH' | 'MODERATE'
  risk_level_label: string
  risk_score: number
  open_defects_count: number
  defect_summary: string
  damaged_area_m2: number
  crack_length_m: number
  avg_depth_cm: number
  deterioration_rate_pct: number
  temporal_comparison: {
    baseline_epoch: string
    current_epoch: string
    growth_pct: number
    severity_progression: string
  }
  sla_remaining: string
  sla_status: 'urgent' | 'warning' | 'normal'
  gps_lat: number
  gps_lng: number
  pci_score: number
  recommended_action: string
  survey_plan_suggested: boolean
  start_km_num: number
  end_km_num: number
  coordinates: [number, number][]
}

let inMemoryRpt06Segments: Rpt06RiskSegment[] = [
  {
    id: 'rpt06-ql1a-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Đèo Hải Vân)',
    section_name: 'Đèo Hải Vân phía Bắc',
    chainage_start: 'Km 1024+200',
    chainage_end: 'Km 1025+500',
    chainage_display: 'Km 1024+200 - Km 1025+500',
    start_km_num: 1024.2,
    end_km_num: 1025.5,
    risk_level: 'CRITICAL',
    risk_level_label: 'Rất cao (Nguy cơ nứt sụt lề)',
    risk_score: 88,
    open_defects_count: 7,
    defect_summary: '3 Nứt lưới cấp 3, 2 Ổ gà sâu > 3.5cm, 2 Lún vệt bánh xe',
    damaged_area_m2: 145.2,
    crack_length_m: 68.5,
    avg_depth_cm: 3.8,
    deterioration_rate_pct: 18.5,
    temporal_comparison: {
      baseline_epoch: 'Kỳ 01 (15/06/2026): 62.0 m²',
      current_epoch: 'Kỳ 03 (20/09/2026): 145.2 m²',
      growth_pct: 134.2,
      severity_progression: 'Nứt dọc đơn lẻ phát triển lan rộng thành nứt mai rùa đan xen lún bánh xe'
    },
    sla_remaining: 'Còn 14 giờ',
    sla_status: 'urgent',
    gps_lat: 16.2415,
    gps_lng: 108.1287,
    pci_score: 58.2,
    recommended_action: 'Ưu tiên đưa vào kế hoạch bay Drone kỳ 4 & lập đợt sửa chữa cào bóc cấp bách',
    survey_plan_suggested: true,
    coordinates: [
      [108.1215, 16.2472],
      [108.1287, 16.2415],
      [108.134, 16.2368],
      [108.1395, 16.232]
    ]
  },
  {
    id: 'rpt06-ql1a-02',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Đèo Hải Vân)',
    section_name: 'Khu vực cầu Lăng Cô',
    chainage_start: 'Km 1032+000',
    chainage_end: 'Km 1033+400',
    chainage_display: 'Km 1032+000 - Km 1033+400',
    start_km_num: 1032.0,
    end_km_num: 1033.4,
    risk_level: 'WATCH',
    risk_level_label: 'Cần theo dõi (Nứt ngang mặt đường)',
    risk_score: 66,
    open_defects_count: 4,
    defect_summary: '2 Nứt ngang mặt đường, 2 Bong bật nhựa cục bộ',
    damaged_area_m2: 48.0,
    crack_length_m: 32.0,
    avg_depth_cm: 1.8,
    deterioration_rate_pct: 8.2,
    temporal_comparison: {
      baseline_epoch: 'Kỳ 01 (15/06/2026): 35.0 m²',
      current_epoch: 'Kỳ 03 (20/09/2026): 48.0 m²',
      growth_pct: 37.1,
      severity_progression: 'Vết nứt bề rộng tăng từ 2mm lên 4.5mm, chưa có biến dạng lún'
    },
    sla_remaining: 'Còn 4 ngày',
    sla_status: 'warning',
    gps_lat: 16.198,
    gps_lng: 108.177,
    pci_score: 72.0,
    recommended_action: 'Theo dõi lún nứt định kỳ, chuẩn bị vật tư trám khe nứt nhựa theo TCVN 8819',
    survey_plan_suggested: false,
    coordinates: [
      [108.172, 16.204],
      [108.177, 16.198],
      [108.183, 16.191]
    ]
  },
  {
    id: 'rpt06-ql1a-03',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Đèo Hải Vân)',
    section_name: 'Dốc Thừa Thiên - Cửa hầm Hải Vân',
    chainage_start: 'Km 1041+100',
    chainage_end: 'Km 1042+300',
    chainage_display: 'Km 1041+100 - Km 1042+300',
    start_km_num: 1041.1,
    end_km_num: 1042.3,
    risk_level: 'MODERATE',
    risk_level_label: 'Trung bình (Nứt mép lề đường)',
    risk_score: 42,
    open_defects_count: 2,
    defect_summary: '2 Vết nứt dọc mép lề đường chưa ảnh hưởng làn xe cơ giới',
    damaged_area_m2: 18.5,
    crack_length_m: 15.2,
    avg_depth_cm: 0.8,
    deterioration_rate_pct: 3.1,
    temporal_comparison: {
      baseline_epoch: 'Kỳ 01 (15/06/2026): 16.0 m²',
      current_epoch: 'Kỳ 03 (20/09/2026): 18.5 m²',
      growth_pct: 15.6,
      severity_progression: 'Tốc độ mở rộng thấp, mặt đường ổn định'
    },
    sla_remaining: 'Còn 12 ngày',
    sla_status: 'normal',
    gps_lat: 16.1265,
    gps_lng: 108.2205,
    pci_score: 84.5,
    recommended_action: 'Bảo dưỡng lề đường, phát quang rãnh thoát nước mặt',
    survey_plan_suggested: false,
    coordinates: [
      [108.216, 16.131],
      [108.2205, 16.1265],
      [108.226, 16.121]
    ]
  },
  {
    id: 'rpt06-lstl-01',
    project_id: 'prj-lstl-05',
    project_name: 'Cao tốc La Sơn - Túy Loan (QL14B)',
    section_name: 'Đoạn Hòa Vang - Nút giao Túy Loan',
    chainage_start: 'Km 35+000',
    chainage_end: 'Km 37+800',
    chainage_display: 'Km 35+000 - Km 37+800',
    start_km_num: 35.0,
    end_km_num: 37.8,
    risk_level: 'CRITICAL',
    risk_level_label: 'Rất cao (Khe co giãn tiếp giáp cầu)',
    risk_score: 82,
    open_defects_count: 4,
    defect_summary: '2 Khe co giãn bị hở bê tông, 2 Lún tiếp giáp đầu cầu',
    damaged_area_m2: 92.4,
    crack_length_m: 45.0,
    avg_depth_cm: 4.2,
    deterioration_rate_pct: 14.2,
    temporal_comparison: {
      baseline_epoch: 'Kỳ 01 (20/05/2026): 40.0 m²',
      current_epoch: 'Kỳ 03 (18/09/2026): 92.4 m²',
      growth_pct: 131.0,
      severity_progression: 'Hư hỏng khe co giãn tăng nhanh do lưu lượng xe tải trọng nặng'
    },
    sla_remaining: 'Còn 5 ngày',
    sla_status: 'urgent',
    gps_lat: 15.9324,
    gps_lng: 108.1211,
    pci_score: 64.0,
    recommended_action: 'Lập phương án sửa chữa kỹ thuật thay thế khe co giãn thép ray',
    survey_plan_suggested: true,
    coordinates: [
      [108.105, 15.955],
      [108.115, 15.942],
      [108.1211, 15.9324]
    ]
  },
  {
    id: 'rpt06-lstl-02',
    project_id: 'prj-lstl-05',
    project_name: 'Cao tốc La Sơn - Túy Loan (QL14B)',
    section_name: 'Phân đoạn taluy dương',
    chainage_start: 'Km 39+200',
    chainage_end: 'Km 41+500',
    chainage_display: 'Km 39+200 - Km 41+500',
    start_km_num: 39.2,
    end_km_num: 41.5,
    risk_level: 'WATCH',
    risk_level_label: 'Cần theo dõi (Nứt phản ánh)',
    risk_score: 58,
    open_defects_count: 3,
    defect_summary: '3 Nứt dọc bề mặt bê tông nhựa',
    damaged_area_m2: 36.0,
    crack_length_m: 28.0,
    avg_depth_cm: 1.5,
    deterioration_rate_pct: 6.5,
    temporal_comparison: {
      baseline_epoch: 'Kỳ 01 (20/05/2026): 26.0 m²',
      current_epoch: 'Kỳ 03 (18/09/2026): 36.0 m²',
      growth_pct: 38.5,
      severity_progression: 'Nứt theo vệt lu bánh xe trong quá trình thi công hoàn thiện'
    },
    sla_remaining: 'Còn 8 ngày',
    sla_status: 'warning',
    gps_lat: 15.985,
    gps_lng: 108.082,
    pci_score: 76.2,
    recommended_action: 'Trám bitum nhũ tương polymer bảo vệ lớp áo đường',
    survey_plan_suggested: false,
    coordinates: [
      [108.072, 15.998],
      [108.082, 15.985],
      [108.092, 15.972]
    ]
  },
  {
    id: 'rpt06-ctbn-01',
    project_id: 'prj-ctbn-01',
    project_name: 'Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)',
    section_name: 'Nút giao Diễn Châu',
    chainage_start: 'Km 445+200',
    chainage_end: 'Km 447+000',
    chainage_display: 'Km 445+200 - Km 447+000',
    start_km_num: 445.2,
    end_km_num: 447.0,
    risk_level: 'WATCH',
    risk_level_label: 'Cần theo dõi (Sắp hết bảo hành)',
    risk_score: 64,
    open_defects_count: 5,
    defect_summary: '5 Nứt dọc kéo dài theo vệt bánh xe cơ giới',
    damaged_area_m2: 85.0,
    crack_length_m: 85.0,
    avg_depth_cm: 1.2,
    deterioration_rate_pct: 9.0,
    temporal_comparison: {
      baseline_epoch: 'Kỳ 01 (10/04/2026): 55.0 m²',
      current_epoch: 'Kỳ 03 (15/09/2026): 85.0 m²',
      growth_pct: 54.5,
      severity_progression: 'Mặt đường chịu lực tốt, nứt co ngót nhiệt mùa hè'
    },
    sla_remaining: 'Còn 25 ngày',
    sla_status: 'warning',
    gps_lat: 18.7231,
    gps_lng: 105.6542,
    pci_score: 64.5,
    recommended_action: 'Khảo sát Drone kiểm tra toàn diện trước khi hết hạn bảo hành công trình',
    survey_plan_suggested: true,
    coordinates: [
      [105.645, 18.739],
      [105.6542, 18.7231],
      [105.663, 18.707]
    ]
  },
  {
    id: 'rpt06-ptdg-01',
    project_id: 'prj-ptdg-03',
    project_name: 'Tuyến tránh TP. Huế (QL1A-BP)',
    section_name: 'Đoạn qua Hương Trà',
    chainage_start: 'Km 18+600',
    chainage_end: 'Km 20+200',
    chainage_display: 'Km 18+600 - Km 20+200',
    start_km_num: 18.6,
    end_km_num: 20.2,
    risk_level: 'CRITICAL',
    risk_level_label: 'Rất cao (Lún vệt bánh xe nặng)',
    risk_score: 86,
    open_defects_count: 8,
    defect_summary: 'Lún vệt bánh xe sâu > 4.5cm, nứt mai rùa tại làn xe tải',
    damaged_area_m2: 220.0,
    crack_length_m: 112.0,
    avg_depth_cm: 4.5,
    deterioration_rate_pct: 22.0,
    temporal_comparison: {
      baseline_epoch: 'Kỳ 01 (05/05/2026): 80.0 m²',
      current_epoch: 'Kỳ 03 (25/09/2026): 220.0 m²',
      growth_pct: 175.0,
      severity_progression: 'Lún tăng từ 2cm lên 4.5cm kèm nứt vỡ khối nhựa'
    },
    sla_remaining: 'Còn 18 giờ',
    sla_status: 'urgent',
    gps_lat: 16.4637,
    gps_lng: 107.5908,
    pci_score: 52.8,
    recommended_action: 'Cào bóc và thảm lại bê tông nhựa chặt C19 dày 7cm theo TCVN 8819',
    survey_plan_suggested: true,
    coordinates: [
      [107.581, 16.47],
      [107.5908, 16.4637],
      [107.601, 16.455]
    ]
  }
]
