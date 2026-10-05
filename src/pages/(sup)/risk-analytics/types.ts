export interface ProjectConfig {
  id: string
  code: string
  name: string
  shortName: string
  route: string
  chainage: string
  serverNode: string
  met01_ratio: number
  met01_change: string
  met01_completed_text: string
  met01_target: number
  met04_mtta: number
  met04_change: string
  met04_sup_days: number
  met04_pm_days: number
  met08_recurrence: number
  met08_status: 'CẢNH BÁO' | 'ĐẠT CHUẨN' | 'BÌNH THƯỜNG'
  met08_note: string
  met11_integrity: number
  met11_items_text: string
}

export interface ExportRecord {
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
  download_url?: string
  error_message?: string
  hash_sha256?: string
  total_items?: number
}

export interface AsyncExportJob {
  id: string
  name: string
  progress: number
  processedItems: number
  totalItems: number
  estimatedSecondsRemaining: number
  tempSizeMb: number
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
}

export interface ExportFormState {
  reportType: string
  scope: string
  asOfDate: string
  includeSha256Checksum: boolean
  includeOriginalFiles: boolean
  compressRawTiff?: boolean
  format?: string
}
