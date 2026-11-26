/**
 * reportService.ts — chỉ còn khai báo kiểu cho báo cáo KPI/RPT-06.
 * Toàn bộ dữ liệu mẫu in-memory đã bị xóa: dữ liệu báo cáo phải lấy từ API BE (xem projectReportingService).
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
    baseline_area_m2?: number
    delta_area_m2?: number
  }
  sla_remaining: string
  sla_status: 'urgent' | 'warning' | 'normal'
  gps_lat: number
  gps_lng: number
  pci_score: number
  start_km_num: number
  end_km_num: number
  coordinates: [number, number][]
}
