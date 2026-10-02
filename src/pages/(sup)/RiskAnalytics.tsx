import React, { useState, useEffect, useMemo } from 'react'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  RefreshCw,
  Archive,
  FolderArchive,
  Eye,
  Trash2,
  Search,
  Check,
  Layers,
  ChevronRight,
  HardHat,
  Lock,
  Key,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Zap,
  Activity,
  FileCheck2,
  Share2,
  X,
  Sparkles,
  Server,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react'

// Cấu hình thông số và KPI chuẩn cho từng dự án bảo hành
interface ProjectConfig {
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

const PROJECTS_CONFIG: Record<string, ProjectConfig> = {
  'prj-ql1a-02': {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2 (Đèo Hải Vân)',
    shortName: 'QL1A',
    route: 'QL1A',
    chainage: 'Km 1024 - Km 1045',
    serverNode: 'Đồng bộ máy chủ miền Trung (DN-NODE-03)',
    met01_ratio: 78.4,
    met01_change: '+4.2% Q2',
    met01_completed_text: '47/60 khiếm khuyết LOW/MEDIUM tự đóng đúng hạn',
    met01_target: 75.0,
    met04_mtta: 3.2,
    met04_change: '-1.1 ngày',
    met04_sup_days: 2.1,
    met04_pm_days: 1.1,
    met08_recurrence: 4.1,
    met08_status: 'CẢNH BÁO',
    met08_note: 'Ngưỡng khống chế: < 5.0% (Phát hiện 2 điểm lún lại)',
    met11_integrity: 99.8,
    met11_items_text: '1,248/1,250 ảnh & log SHA-256 hợp lệ không biến dạng EXIF'
  },
  'prj-ctbn-01': {
    id: 'prj-ctbn-01',
    code: 'PRJ-CTBN-01',
    name: 'Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)',
    shortName: 'CT01 Diễn Châu',
    route: 'CT01',
    chainage: 'Km 430+000 - Km 479+300',
    serverNode: 'Đồng bộ máy chủ miền Bắc (NA-NODE-01)',
    met01_ratio: 85.0,
    met01_change: '+6.5% Q2',
    met01_completed_text: '34/40 khiếm khuyết LOW/MEDIUM tự đóng đúng hạn',
    met01_target: 80.0,
    met04_mtta: 2.8,
    met04_change: '-0.8 ngày',
    met04_sup_days: 1.9,
    met04_pm_days: 0.9,
    met08_recurrence: 2.3,
    met08_status: 'ĐẠT CHUẨN',
    met08_note: 'Mặt đường bê tông nhựa chặt, độ nhám đạt TCVN 8819',
    met11_integrity: 100.0,
    met11_items_text: '890/890 ảnh & log SHA-256 đối soát khớp 100%'
  },
  'prj-lstl-05': {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan (QL14B)',
    shortName: 'La Sơn - Túy Loan',
    route: 'QL14B / CT',
    chainage: 'Km 35+000 - Km 42+500',
    serverNode: 'Đồng bộ máy chủ miền Trung (DN-NODE-02)',
    met01_ratio: 72.5,
    met01_change: '-1.2% Q2',
    met01_completed_text: '29/40 khiếm khuyết LOW/MEDIUM tự đóng đúng hạn',
    met01_target: 75.0,
    met04_mtta: 3.9,
    met04_change: '+0.4 ngày',
    met04_sup_days: 2.5,
    met04_pm_days: 1.4,
    met08_recurrence: 4.8,
    met08_status: 'ĐẠT CHUẨN',
    met08_note: 'Tỷ lệ kiểm soát tốt (< 5.0%), khe co giãn Hòa Vang ổn định',
    met11_integrity: 99.5,
    met11_items_text: '720/724 ảnh & log SHA-256 đã xác thực toàn vẹn'
  },
  'prj-ptdg-03': {
    id: 'prj-ptdg-03',
    code: 'PRJ-PTDG-03',
    name: 'Tuyến tránh TP. Huế (QL1A-BP)',
    shortName: 'Tránh TP. Huế',
    route: 'QL1A-BP',
    chainage: 'Km 18+600 - Km 22+400',
    serverNode: 'Đồng bộ máy chủ miền Trung (HUE-NODE-01)',
    met01_ratio: 68.2,
    met01_change: '-3.5% Q2',
    met01_completed_text: '22/32 khiếm khuyết LOW/MEDIUM tự đóng đúng hạn',
    met01_target: 70.0,
    met04_mtta: 4.5,
    met04_change: '+1.2 ngày',
    met04_sup_days: 3.0,
    met04_pm_days: 1.5,
    met08_recurrence: 6.2,
    met08_status: 'CẢNH BÁO',
    met08_note: 'Vượt ngưỡng an toàn do mưa lũ gây lún bánh xe cục bộ',
    met11_integrity: 99.1,
    met11_items_text: '610/615 ảnh & log SHA-256 đã được kiểm duyệt'
  },
  'ALL': {
    id: 'ALL',
    code: 'ALL',
    name: 'Toàn bộ danh mục 4 dự án',
    shortName: 'Toàn danh mục',
    route: 'Liên tỉnh',
    chainage: '4 Dự án bảo hành trọng điểm',
    serverNode: 'Cụm máy chủ phân tán (Global Multi-Region)',
    met01_ratio: 76.8,
    met01_change: '+2.1% Q2',
    met01_completed_text: '132/172 khiếm khuyết LOW/MEDIUM tự đóng đúng hạn',
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

// Interface cho một bản ghi hồ sơ xuất (RPT-07)
export interface ExportRecord {
  id: string
  code: string
  project_id: string
  project_code: string
  quarter: 'Q3_2026' | 'Q2_2026' | 'MONTH_08_2026' | 'YTD'
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

// Danh sách mock hồ sơ đồng bộ cho 4 dự án kèm phân loại Quý và Nhánh
const INITIAL_EXPORT_RECORDS: ExportRecord[] = [
  // PRJ-QL1A-02 (Huế - Đà Nẵng)
  {
    id: 'rec-01',
    code: '#EXP-2026-0914',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'Q3_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ hoàn công đợt sửa chữa',
    type_badge_color: 'bg-purple-100 text-purple-900 border-purple-200',
    type_category_name: 'Dossier Hoàn công',
    dossier_no: 'BB-NTKT/104-26',
    scope_display: 'QL1A Km 1024 - 1045',
    as_of_time: '25/08/2026 21:45',
    as_of_timestamp: 1787687100000,
    file_size: '142 MB',
    file_size_mb: 142,
    format_display: 'ZIP + PDF/A-1a',
    status: 'COMPLETED',
    hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    total_items: 48
  },
  {
    id: 'rec-02',
    code: '#EXP-2026-0830',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'MONTH_08_2026',
    track: 'APPROVAL_TRACK',
    type: 'Biên bản nghiệm thu Before/After',
    type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    type_category_name: 'Nghiệm thu Đối chứng',
    dossier_no: 'SHA-256 Checksum Verified',
    scope_display: 'QL1A Km 1030 - 1038',
    as_of_time: '25/08/2026 21:30',
    as_of_timestamp: 1787686200000,
    file_size: '92.4 MB',
    file_size_mb: 92.4,
    format_display: 'Đang đóng gói ZIP',
    status: 'PROCESSING',
    total_items: 24
  },
  {
    id: 'rec-17',
    code: '#EXP-2026-0819-EM',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'MONTH_08_2026',
    track: 'EMERGENCY',
    type: 'Biên bản ứng cứu sạt trượt khẩn cấp 24/7',
    type_badge_color: 'bg-rose-100 text-rose-900 border-rose-200',
    type_category_name: 'Ứng cứu Khẩn cấp',
    dossier_no: 'EM-2026-0819',
    scope_display: 'QL1A Km 1026+800',
    as_of_time: '19/08/2026 23:15',
    as_of_timestamp: 1787163300000,
    file_size: '54 MB',
    file_size_mb: 54,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    hash_sha256: '9e1281aef128491823901bdaf0921829031efbca128919284102948192a01928f',
    total_items: 8
  },
  {
    id: 'rec-04',
    code: '#EXP-2026-0620',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'Q2_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ trắc địa cao độ mặt đường',
    type_badge_color: 'bg-amber-100 text-amber-900 border-amber-200',
    type_category_name: 'Thí nghiệm Vật liệu',
    dossier_no: 'TCVN 8819:2011',
    scope_display: 'QL1A Km 1040 - 1045',
    as_of_time: '01/08/2026 18:00',
    as_of_timestamp: 1785600000000,
    file_size: '--',
    file_size_mb: 0,
    format_display: 'Lỗi bộ nhớ Node worker',
    status: 'FAILED',
    error_message: 'Out of memory during GeoTIFF orthomosaic tiling.',
    total_items: 12
  },
  {
    id: 'rec-08',
    code: '#EXP-2026-0925',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'Q3_2026',
    track: 'FAST_TRACK',
    type: 'Biên bản xử lý cấp bách Fast Track',
    type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    type_category_name: 'Nghiệm thu Đối chứng',
    dossier_no: 'FT-2026-0881',
    scope_display: 'QL1A Km 1025+400',
    as_of_time: '25/08/2026 11:15',
    as_of_timestamp: 1787649300000,
    file_size: '45 MB',
    file_size_mb: 45,
    format_display: 'ZIP + PDF/A-1a',
    status: 'COMPLETED',
    hash_sha256: '5a819b18928491823901bdaf0921829031efbca128919284102948192a01928a',
    total_items: 16
  },
  {
    id: 'rec-09',
    code: '#EXP-2026-0518',
    project_id: 'prj-ql1a-02',
    project_code: 'PRJ-QL1A-02',
    quarter: 'Q2_2026',
    track: 'FAST_TRACK',
    type: 'Biên bản vá ổ gà khẩn cấp Fast Track',
    type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    type_category_name: 'Nghiệm thu Đối chứng',
    dossier_no: 'FT-2026-0522',
    scope_display: 'QL1A Km 1028+300',
    as_of_time: '18/05/2026 09:30',
    as_of_timestamp: 1779093000000,
    file_size: '32 MB',
    file_size_mb: 32,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    hash_sha256: '6b912aef128491823901bdaf0921829031efbca128919284102948192a01928b',
    total_items: 10
  },

  // PRJ-CTBN-01 (Cao tốc Bắc Nam Diễn Châu)
  {
    id: 'rec-05',
    code: '#EXP-2026-0902',
    project_id: 'prj-ctbn-01',
    project_code: 'PRJ-CTBN-01',
    quarter: 'Q3_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ nghiệm thu nứt dọc mạ mặt CT01',
    type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    type_category_name: 'Nghiệm thu Đối chứng',
    dossier_no: 'BB-NTKT/088-26',
    scope_display: 'CT01 Km 435 - Km 442',
    as_of_time: '20/08/2026 15:30',
    as_of_timestamp: 1787230200000,
    file_size: '115 MB',
    file_size_mb: 115,
    format_display: 'ZIP + PDF/A-1a',
    status: 'COMPLETED',
    hash_sha256: '9a4f21e0b5c192d77a94efbc1249826189af0e74cb29471928dfb81a029381ea',
    total_items: 38
  },
  {
    id: 'rec-06',
    code: '#EXP-2026-0810',
    project_id: 'prj-ctbn-01',
    project_code: 'PRJ-CTBN-01',
    quarter: 'MONTH_08_2026',
    track: 'APPROVAL_TRACK',
    type: 'Báo cáo độ nhám & Chỉ số IRI Diễn Châu',
    type_badge_color: 'bg-blue-100 text-blue-900 border-blue-200',
    type_category_name: 'Trắc dọc & Bình đồ GIS',
    dossier_no: 'TCVN 8864:2011',
    scope_display: 'CT01 Km 450 - Km 465',
    as_of_time: '10/08/2026 09:15',
    as_of_timestamp: 1786343700000,
    file_size: '64 MB',
    file_size_mb: 64,
    format_display: 'CSV + PDF',
    status: 'COMPLETED',
    hash_sha256: '3c8192aef128491823901bdaf0921829031efbca128919284102948192a01928',
    total_items: 20
  },
  {
    id: 'rec-15',
    code: '#EXP-2026-0919',
    project_id: 'prj-ctbn-01',
    project_code: 'PRJ-CTBN-01',
    quarter: 'Q3_2026',
    track: 'FAST_TRACK',
    type: 'Biên bản xử lý hộ lan va chạm Fast Track',
    type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    type_category_name: 'Nghiệm thu Đối chứng',
    dossier_no: 'FT-2026-0919',
    scope_display: 'CT01 Km 438+100',
    as_of_time: '19/08/2026 16:40',
    as_of_timestamp: 1787140800000,
    file_size: '26 MB',
    file_size_mb: 26,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    hash_sha256: '4f9281aef128491823901bdaf0921829031efbca128919284102948192a01928c',
    total_items: 12
  },
  {
    id: 'rec-16',
    code: '#EXP-2026-0612',
    project_id: 'prj-ctbn-01',
    project_code: 'PRJ-CTBN-01',
    quarter: 'Q2_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ hoàn công thảm bù lún mố cầu',
    type_badge_color: 'bg-purple-100 text-purple-900 border-purple-200',
    type_category_name: 'Dossier Hoàn công',
    dossier_no: 'BB-NTKT/062-26',
    scope_display: 'CT01 Km 452+200 - 455+000',
    as_of_time: '12/06/2026 14:15',
    as_of_timestamp: 1781254500000,
    file_size: '158 MB',
    file_size_mb: 158,
    format_display: 'ZIP + PDF/A-1a',
    status: 'COMPLETED',
    hash_sha256: '7c8129aef128491823901bdaf0921829031efbca128919284102948192a01928d',
    total_items: 52
  },

  // PRJ-LSTL-05 (Cao tốc La Sơn - Túy Loan)
  {
    id: 'rec-03',
    code: '#EXP-2026-0715',
    project_id: 'prj-lstl-05',
    project_code: 'PRJ-LSTL-05',
    quarter: 'Q3_2026',
    track: 'APPROVAL_TRACK',
    type: 'Báo cáo kiểm định trắc dọc GIS',
    type_badge_color: 'bg-blue-100 text-blue-900 border-blue-200',
    type_category_name: 'Trắc dọc & Bình đồ GIS',
    dossier_no: 'WGS-84 EPSG:4326',
    scope_display: 'La Sơn - Túy Loan Km 35 - 42',
    as_of_time: '15/08/2026 10:30',
    as_of_timestamp: 1786780200000,
    file_size: '88 MB',
    file_size_mb: 88,
    format_display: 'ZIP + GeoJSON',
    status: 'COMPLETED',
    hash_sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    total_items: 36
  },
  {
    id: 'rec-10',
    code: '#EXP-2026-0818',
    project_id: 'prj-lstl-05',
    project_code: 'PRJ-LSTL-05',
    quarter: 'Q3_2026',
    track: 'FAST_TRACK',
    type: 'Biên bản xử lý sạt trượt lề đường Fast Track',
    type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    type_category_name: 'Nghiệm thu Đối chứng',
    dossier_no: 'FT-2026-0712',
    scope_display: 'La Sơn - Túy Loan Km 38+200',
    as_of_time: '18/08/2026 08:30',
    as_of_timestamp: 1787041800000,
    file_size: '38 MB',
    file_size_mb: 38,
    format_display: 'ZIP + PDF/A-1a',
    status: 'COMPLETED',
    hash_sha256: '2a9128fba102938102938102938102938102938102938102938102938102938e',
    total_items: 15
  },
  {
    id: 'rec-11',
    code: '#EXP-2026-0524',
    project_id: 'prj-lstl-05',
    project_code: 'PRJ-LSTL-05',
    quarter: 'Q2_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ hoàn công sửa chữa khe co giãn',
    type_badge_color: 'bg-purple-100 text-purple-900 border-purple-200',
    type_category_name: 'Dossier Hoàn công',
    dossier_no: 'BB-NTKT/055-26',
    scope_display: 'Cầu vượt Hòa Vang Km 40+100',
    as_of_time: '24/05/2026 15:00',
    as_of_timestamp: 1779625200000,
    file_size: '128 MB',
    file_size_mb: 128,
    format_display: 'ZIP + PDF/A-1a',
    status: 'COMPLETED',
    hash_sha256: '5d91823901bdaf0921829031efbca128919284102948192a01928a5a819b189f',
    total_items: 42
  },
  {
    id: 'rec-12',
    code: '#EXP-2026-0828',
    project_id: 'prj-lstl-05',
    project_code: 'PRJ-LSTL-05',
    quarter: 'MONTH_08_2026',
    track: 'APPROVAL_TRACK',
    type: 'Báo cáo trắc ngang lún vệt bánh xe',
    type_badge_color: 'bg-blue-100 text-blue-900 border-blue-200',
    type_category_name: 'Trắc dọc & Bình đồ GIS',
    dossier_no: 'QL14B/882-26',
    scope_display: 'La Sơn - Túy Loan Km 36 - 39',
    as_of_time: '28/08/2026 11:20',
    as_of_timestamp: 1787908800000,
    file_size: '72 MB',
    file_size_mb: 72,
    format_display: 'Đang kết xuất GeoJSON',
    status: 'PROCESSING',
    total_items: 22
  },

  // PRJ-PTDG-03 (Tuyến tránh TP. Huế)
  {
    id: 'rec-07',
    code: '#EXP-2026-0822',
    project_id: 'prj-ptdg-03',
    project_code: 'PRJ-PTDG-03',
    quarter: 'MONTH_08_2026',
    track: 'APPROVAL_TRACK',
    type: 'Báo cáo trắc ngang lún vệt bánh xe',
    type_badge_color: 'bg-blue-100 text-blue-900 border-blue-200',
    type_category_name: 'Trắc dọc & Bình đồ GIS',
    dossier_no: 'QL1A-BP/220-26',
    scope_display: 'QL1A-BP Km 18+600 - 22+400',
    as_of_time: '22/08/2026 14:00',
    as_of_timestamp: 1787397600000,
    file_size: '76 MB',
    file_size_mb: 76,
    format_display: 'ZIP + GeoJSON',
    status: 'COMPLETED',
    hash_sha256: '8b712891fa819284019284019284019284019284019284019284019284019284',
    total_items: 28
  },
  {
    id: 'rec-13',
    code: '#EXP-2026-0908',
    project_id: 'prj-ptdg-03',
    project_code: 'PRJ-PTDG-03',
    quarter: 'Q3_2026',
    track: 'FAST_TRACK',
    type: 'Biên bản xử lý lún ổ gà khẩn cấp Fast Track',
    type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    type_category_name: 'Nghiệm thu Đối chứng',
    dossier_no: 'FT-2026-0908',
    scope_display: 'QL1A-BP Km 20+150',
    as_of_time: '08/08/2026 10:45',
    as_of_timestamp: 1786178700000,
    file_size: '31 MB',
    file_size_mb: 31,
    format_display: 'ZIP + PDF',
    status: 'COMPLETED',
    hash_sha256: '9f8128491823901bdaf0921829031efbca128919284102948192a01928a5a819',
    total_items: 14
  },
  {
    id: 'rec-14',
    code: '#EXP-2026-0604',
    project_id: 'prj-ptdg-03',
    project_code: 'PRJ-PTDG-03',
    quarter: 'Q2_2026',
    track: 'APPROVAL_TRACK',
    type: 'Hồ sơ hoàn công gia cố taluy âm',
    type_badge_color: 'bg-purple-100 text-purple-900 border-purple-200',
    type_category_name: 'Dossier Hoàn công',
    dossier_no: 'BB-NTKT/044-26',
    scope_display: 'QL1A-BP Km 21+000 - 22+000',
    as_of_time: '04/06/2026 16:30',
    as_of_timestamp: 1780564200000,
    file_size: '145 MB',
    file_size_mb: 145,
    format_display: 'ZIP + PDF/A-1a',
    status: 'COMPLETED',
    hash_sha256: '3a8129031efbca128919284102948192a01928a5a819b18928491823901bdaf0',
    total_items: 46
  }
]

export const RiskAnalytics: React.FC = () => {
  // State Bộ lọc đa chiều
  const [selectedProject, setSelectedProject] = useState('prj-ql1a-02')
  const [selectedTimeRange, setSelectedTimeRange] = useState('Q3_2026')
  const [selectedTrack, setSelectedTrack] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'FAILED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // State Sắp xếp (Sort)
  const [sortField, setSortField] = useState<'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status'>('as_of_timestamp')
  const [sortAsc, setSortAsc] = useState(false) // Mặc định: mới nhất trước

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Current project config kết hợp biến thiên theo Nhánh và Kỳ hạn
  const currentProject = useMemo(() => {
    const base = PROJECTS_CONFIG[selectedProject] || PROJECTS_CONFIG['prj-ql1a-02']
    
    // Nếu lọc theo Nhánh Fast Track
    if (selectedTrack === 'FAST_TRACK') {
      return {
        ...base,
        met01_ratio: Math.min(94.2, +(base.met01_ratio + 12.5).toFixed(1)),
        met01_completed_text: '100% khiếm khuyết xử lý dưới 24h không qua Ban thẩm duyệt',
        met04_mtta: Math.max(0.8, +(base.met04_pm_days).toFixed(1)),
        met04_change: '-1.8 ngày',
        met08_recurrence: Math.max(1.2, +(base.met08_recurrence - 1.5).toFixed(1)),
        met08_status: 'ĐẠT CHUẨN' as const,
        met08_note: 'Quy trình xử lý khẩn cấp kiểm soát tốt tái phát nứt lún cục bộ'
      }
    }

    // Nếu lọc theo Nhánh Approval Track
    if (selectedTrack === 'APPROVAL_TRACK') {
      return {
        ...base,
        met01_ratio: Math.max(65.0, +(base.met01_ratio - 4.2).toFixed(1)),
        met01_completed_text: 'Các đợt sửa chữa lớn có lập dự toán BOQ & TVGS thẩm định',
        met04_mtta: +(base.met04_sup_days).toFixed(1),
        met04_change: '+0.5 ngày'
      }
    }

    // Nếu lọc theo Nhánh Emergency
    if (selectedTrack === 'EMERGENCY') {
      return {
        ...base,
        met01_ratio: Math.min(88.0, +(base.met01_ratio + 5.0).toFixed(1)),
        met01_completed_text: '100% sự cố thông xe khẩn cấp dưới 4h, chuyển tiếp hồ sơ sang Approval Track',
        met04_mtta: 0.5,
        met04_change: '-2.5 ngày',
        met08_recurrence: base.met08_recurrence,
        met08_note: 'Sự cố sạt lở & ổ gà sâu được xử lý tạm thời chống ùn tắc giao thông'
      }
    }

    // Nếu lọc theo Quý 2
    if (selectedTimeRange === 'Q2_2026') {
      return {
        ...base,
        met01_ratio: Math.max(62.0, +(base.met01_ratio - 4.2).toFixed(1)),
        met01_change: '-0.8% Q1',
        met04_mtta: +(base.met04_mtta + 1.1).toFixed(1),
        met04_change: '+1.1 ngày'
      }
    }

    return base
  }, [selectedProject, selectedTrack, selectedTimeRange])

  // State Hàng đợi xuất bất đồng bộ (Async Export Worker)
  const [activeJob, setActiveJob] = useState<{
    id: string
    name: string
    progress: number
    processedItems: number
    totalItems: number
    estimatedSecondsRemaining: number
    tempSizeMb: number
    status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  } | null>({
    id: 'JOB-EXP-8842',
    name: 'QL1A_Q3_2026.zip',
    progress: 65,
    processedItems: 31,
    totalItems: 48,
    estimatedSecondsRemaining: 18,
    tempSizeMb: 92.4,
    status: 'PROCESSING'
  })

  // State Danh mục hồ sơ giải trình
  const [exportRecords, setExportRecords] = useState<ExportRecord[]>(INITIAL_EXPORT_RECORDS)

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isTimeRangeModalOpen, setIsTimeRangeModalOpen] = useState(false)
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ExportRecord | null>(null)

  // Form state cho modal New Export chuẩn theo Backend v2.2 ExportRequest
  const [exportForm, setExportForm] = useState({
    reportType: 'DOSSIER_COMPLETE',
    scope: 'PRJ-QL1A-02',
    asOfDate: '2026-08-25T21:45',
    includeOriginalFiles: true,
    includeSha256Checksum: true,
    compressRawTiff: false,
    format: 'ZIP_PDF'
  })

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Tự động tăng nhẹ tiến độ active job để giao diện sinh động và trung thực
  useEffect(() => {
    if (!activeJob || activeJob.status !== 'PROCESSING') return
    const interval = setInterval(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'PROCESSING') return prev
        if (prev.progress >= 98) {
          showToast('Tác vụ #JOB-EXP-8842 đã đóng gói thành công!')
          return {
            ...prev,
            progress: 100,
            status: 'COMPLETED',
            estimatedSecondsRemaining: 0
          }
        }
        const nextProgress = Math.min(prev.progress + 2, 98)
        const nextItems = Math.min(Math.floor((nextProgress / 100) * prev.totalItems), prev.totalItems)
        const nextTime = Math.max(Math.round(((100 - nextProgress) / 100) * 24), 2)
        return {
          ...prev,
          progress: nextProgress,
          processedItems: nextItems,
          estimatedSecondsRemaining: nextTime
        }
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [activeJob?.status])

  // Lọc và Sắp xếp danh sách hồ sơ (Filter & Sort Engine)
  const processedRecords = useMemo(() => {
    let result = exportRecords.filter((rec) => {
      // 1. Lọc theo Dự án
      if (selectedProject !== 'ALL' && rec.project_id !== selectedProject) {
        return false
      }

      // 2. Lọc theo Trạng thái xuất
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
        return false
      }

      // 3. Lọc theo Khung kỳ hạn (Quý / Thời gian)
      if (selectedTimeRange === 'Q3_2026') {
        if (rec.quarter !== 'Q3_2026' && rec.quarter !== 'MONTH_08_2026') return false
      } else if (selectedTimeRange === 'Q2_2026') {
        if (rec.quarter !== 'Q2_2026') return false
      } else if (selectedTimeRange === 'MONTH_08_2026') {
        if (rec.quarter !== 'MONTH_08_2026') return false
      }

      // 4. Lọc theo Nhánh quy trình
      if (selectedTrack !== 'ALL') {
        if (rec.track !== 'ALL' && rec.track !== selectedTrack) return false
      }

      // 5. Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchCode = rec.code.toLowerCase().includes(query)
        const matchType = rec.type.toLowerCase().includes(query)
        const matchScope = rec.scope_display.toLowerCase().includes(query)
        const matchDossier = rec.dossier_no.toLowerCase().includes(query)
        if (!matchCode && !matchType && !matchScope && !matchDossier) return false
      }
      return true
    })

    // Sắp xếp
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'as_of_timestamp') {
        comparison = a.as_of_timestamp - b.as_of_timestamp
      } else if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code)
      } else if (sortField === 'scope_display') {
        comparison = a.scope_display.localeCompare(b.scope_display)
      } else if (sortField === 'file_size_mb') {
        comparison = a.file_size_mb - b.file_size_mb
      } else if (sortField === 'status') {
        const statusOrder = { PROCESSING: 1, COMPLETED: 2, FAILED: 3 }
        comparison = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
      }
      return sortAsc ? comparison : -comparison
    })

    return result
  }, [exportRecords, selectedProject, statusFilter, selectedTimeRange, selectedTrack, searchQuery, sortField, sortAsc])

  // Đổi cột sort
  const handleToggleSort = (field: 'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false) // default desc for new field
    }
  }

  // Xử lý tạo yêu cầu xuất hồ sơ mới
  const handleCreateExportJob = (e: React.FormEvent) => {
    e.preventDefault()
    setIsExportModalOpen(false)
    const newJobId = `JOB-EXP-${Math.floor(Math.random() * 8999 + 1000)}`
    const newExportCode = `#EXP-2026-${Math.floor(Math.random() * 899 + 100)}`

    // Đặt active job
    setActiveJob({
      id: newJobId,
      name: `BaoCao_KiemToan_${currentProject.shortName.replace(/\s+/g, '_')}_Q3.zip`,
      progress: 5,
      processedItems: 2,
      totalItems: 42,
      estimatedSecondsRemaining: 32,
      tempSizeMb: 14.5,
      status: 'PROCESSING'
    })

    // Bổ sung vào danh sách hồ sơ
    const newRecord: ExportRecord = {
      id: `rec-${Date.now()}`,
      code: newExportCode,
      project_id: selectedProject === 'ALL' ? 'prj-ql1a-02' : selectedProject,
      project_code: currentProject.code,
      quarter: 'Q3_2026',
      track: selectedTrack === 'FAST_TRACK' ? 'FAST_TRACK' : 'APPROVAL_TRACK',
      type:
        exportForm.reportType === 'DOSSIER_COMPLETE'
          ? 'Hồ sơ kiểm toán & Bằng chứng số tổng hợp'
          : exportForm.reportType === 'BEFORE_AFTER_ZIP'
          ? 'Gói ảnh nghiệm thu Before/After (Gốc)'
          : 'Báo cáo trắc dọc & Bình đồ GIS',
      type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      type_category_name: 'Dossier Hoàn công',
      dossier_no: 'SHA-256 Checksum Verified',
      scope_display: currentProject.chainage,
      as_of_time: '25/08/2026 21:50',
      as_of_timestamp: Date.now(),
      file_size: 'Đang nén...',
      file_size_mb: 45,
      format_display: 'Đang xếp hàng đợi',
      status: 'PROCESSING',
      total_items: 42
    }

    setExportRecords([newRecord, ...exportRecords])
    showToast(`Đã khởi tạo lệnh xuất bất đồng bộ (${newJobId})!`)
  }

  // Hủy tác vụ đang chạy
  const handleCancelActiveJob = () => {
    if (!activeJob) return
    setActiveJob((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null))
    showToast(`Đã dừng tác vụ ${activeJob.id}`)
  }

  // Thao tác xóa bản ghi
  const handleDeleteRecord = (id: string, code: string) => {
    setExportRecords((prev) => prev.filter((r) => r.id !== id))
    showToast(`Đã xóa hồ sơ lưu trữ ${code}`)
  }

  // Thử lại bản ghi FAILED
  const handleRetryRecord = (id: string) => {
    setExportRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'PROCESSING',
            format_display: 'Đang xếp lại hàng đợi',
            file_size: 'Đang nén...'
          }
        }
        return r
      })
    )
    showToast('Đã gửi yêu cầu chạy lại tiến trình xuất!')
  }

  // Tải file mô phỏng
  const handleDownloadFile = (filename: string) => {
    showToast(`Đang tải tệp: ${filename} (Chứng thực chữ ký số SHA-256 hợp lệ)`)
  }

  // Làm mới danh sách
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Dữ liệu chỉ số KPI và hàng đợi xuất đã được đồng bộ mới nhất!')
    }, 600)
  }

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BREADCRUMB & METADATA OVERLINE                                         */}
      {/* ========================================================================= */}
      <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <a href="#/sup/dashboard" className="hover:text-slate-800 transition-colors flex items-center gap-1">
          <span>Trang chủ</span>
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600">Báo cáo & Giám sát</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#C9A227] font-semibold">Chỉ số vận hành & Hồ sơ giải trình</span>
      </nav>

      {/* ========================================================================= */}
      {/* 2. PAGE HEADER & ACTION CONTROLS                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-sansation text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                Chỉ số bảo hành & Kết xuất hồ sơ bằng chứng ({currentProject.shortName})
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                {currentProject.chainage}
              </span>
            </div>

            {/* As-Of Metadata Bar */}
            <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
                <RefreshCw className={`w-3.5 h-3.5 text-[#C9A227] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>
                  Dữ liệu chốt lúc (As-Of): <strong className="text-slate-800 font-semibold font-mono">21:45, 25/08/2026</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[#C9A227] font-medium">Tự động cập nhật mỗi 60s</span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-slate-100/70 px-3 py-1 rounded-full text-[11px] text-slate-600 border border-slate-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                <span>{currentProject.serverNode}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={() => setIsTimeRangeModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Tùy chỉnh khung thời gian</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs lg:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Tạo yêu cầu xuất hồ sơ (Export ZIP/PDF)</span>
            </button>

            <button
              onClick={handleRefresh}
              type="button"
              title="Làm mới dữ liệu"
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MULTI-DIMENSIONAL FILTER ROW & ADVANCED SORT CONTROLS                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        {/* Row 1: Primary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
            {/* Project Selector */}
            <div className="relative min-w-[240px]">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value)
                  showToast(`Đã chuyển bộ số liệu sang: ${PROJECTS_CONFIG[e.target.value]?.name || 'Dự án'}`)
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-semibold"
              >
                <option value="prj-ql1a-02">QL1A - Giai đoạn 2 (Km 1024 - Km 1045)</option>
                <option value="prj-ctbn-01">Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)</option>
                <option value="prj-lstl-05">Cao tốc La Sơn - Túy Loan (QL14B)</option>
                <option value="prj-ptdg-03">Tuyến tránh TP. Huế (QL1A-BP)</option>
                <option value="ALL">Toàn bộ danh mục (4 Dự án)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Time Period Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedTimeRange}
                onChange={(e) => {
                  setSelectedTimeRange(e.target.value)
                  showToast('Đã lọc lại số liệu theo mốc kỳ hạn mới')
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-medium"
              >
                <option value="Q3_2026">Quý 3 / 2026 (01/07/2026 - 30/09/2026)</option>
                <option value="Q2_2026">Quý 2 / 2026 (01/04/2026 - 30/06/2026)</option>
                <option value="MONTH_08_2026">Tháng 08/2026 (Kỳ giải trình thanh tra)</option>
                <option value="YTD">Lũy kế 12 tháng gần nhất (Year-To-Date)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Workflow Track Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedTrack}
                onChange={(e) => {
                  setSelectedTrack(e.target.value)
                  const trackLabel = 
                    e.target.value === 'FAST_TRACK' 
                      ? 'Nhánh Fast Track' 
                      : e.target.value === 'APPROVAL_TRACK' 
                      ? 'Nhánh Ban Duy tu & TVGS thẩm duyệt' 
                      : e.target.value === 'EMERGENCY'
                      ? 'Nhánh Xử lý khẩn cấp (Emergency 24/7)'
                      : 'Tất cả nhánh'
                  showToast(`Đã lọc danh sách theo: ${trackLabel}`)
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-medium"
              >
                <option value="ALL">Tất cả nhánh (Fast Track, Approval Track, Emergency)</option>
                <option value="FAST_TRACK">Chỉ nhánh Fast Track (Sửa nhanh &lt; 24h)</option>
                <option value="APPROVAL_TRACK">Chỉ nhánh Ban Duy tu &amp; TVGS thẩm duyệt (Có BOQ)</option>
                <option value="EMERGENCY">Chỉ nhánh Xử lý khẩn cấp (Emergency 24/7)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSelectedProject('prj-ql1a-02')
                setSelectedTimeRange('Q3_2026')
                setSelectedTrack('ALL')
                setStatusFilter('ALL')
                setSearchQuery('')
                setSortField('as_of_timestamp')
                setSortAsc(false)
                showToast('Đã đặt lại toàn bộ bộ lọc và sắp xếp mặc định')
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer border border-transparent hover:border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Right Live Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
              <span>Thời gian thực (Live Sync)</span>
            </span>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kết nối: Hoạt động bình thường (200 OK)</span>
            </div>
          </div>
        </div>

        {/* Row 2: Sort, Status Filter & Search Controls */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sắp xếp theo (Sort By) Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Sắp xếp:</span>
              </span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="as_of_timestamp">Mốc thời gian As-Of</option>
                <option value="code">Mã gói hồ sơ (#EXP)</option>
                <option value="scope_display">Phạm vi / Lý trình</option>
                <option value="file_size_mb">Dung lượng tệp (MB)</option>
                <option value="status">Trạng thái xử lý</option>
              </select>

              {/* Nút đảo chiều sắp xếp */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                type="button"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 transition cursor-pointer"
                title={sortAsc ? 'Đang sắp xếp: Tăng dần (Bấm đổi Giảm dần)' : 'Đang sắp xếp: Giảm dần (Bấm đổi Tăng dần)'}
              >
                {sortAsc ? (
                  <span className="inline-flex items-center text-[11px] font-bold text-[#C9A227]">
                    <ArrowUp className="w-3.5 h-3.5 mr-0.5" /> Tăng dần
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-bold text-[#C9A227]">
                    <ArrowDown className="w-3.5 h-3.5 mr-0.5" /> Giảm dần
                  </span>
                )}
              </button>
            </div>

            {/* Lọc nhanh trạng thái */}
            <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setStatusFilter('ALL')}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({processedRecords.length})
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  statusFilter === 'COMPLETED' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Hoàn tất
              </button>
              <button
                onClick={() => setStatusFilter('PROCESSING')}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  statusFilter === 'PROCESSING' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                Đang xử lý
              </button>
              <button
                onClick={() => setStatusFilter('FAILED')}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  statusFilter === 'FAILED' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Lỗi
              </button>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã gói, tuyến, số biên bản..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 4-COLUMN CORE METRICS GRID (MET-01, MET-04, MET-08, MET-11)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* MET-01: FAST TRACK RATIO */}
        <div className="rounded-2xl p-5 shadow-2xs flex flex-col justify-between bg-[#EAF4FB] text-slate-800 border border-blue-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sansation font-bold tracking-wider text-[#2B78C5] uppercase flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4" />
                <span>MET-01 • HIỆU QUẢ VẬN HÀNH</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#2B78C5] font-sansation text-[11px] font-bold border border-blue-200">
                {currentProject.met01_change}
              </span>
            </div>
            <div className="pt-1">
              <span className="font-sansation text-3xl font-bold tracking-tight text-[#2B78C5]">
                {currentProject.met01_ratio}%
              </span>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {currentProject.met01_completed_text}
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-1.5">
            <div className="w-full bg-[#D3E8F8] h-2 rounded-full overflow-hidden">
              <div className="bg-[#2B78C5] h-full rounded-full transition-all duration-700" style={{ width: `${currentProject.met01_ratio}%` }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 font-medium">
              <span>Tiến độ cam kết SLA</span>
              <span className="font-bold text-slate-900">Mục tiêu: ≥ {currentProject.met01_target}%</span>
            </div>
          </div>
        </div>

        {/* MET-04: MEAN TIME TO ACCEPT (MTTA) */}
        <div className="rounded-2xl p-5 shadow-2xs flex flex-col justify-between bg-[#F5EFE6] text-slate-800 border border-amber-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sansation font-bold tracking-wider text-[#8C6D46] uppercase flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4" />
                <span>MET-04 • TỐC ĐỘ THẨM DUYỆT</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#8C6D46] font-sansation text-[11px] font-bold border border-amber-200">
                {currentProject.met04_change}
              </span>
            </div>
            <div className="pt-1">
              <div className="flex items-baseline gap-1">
                <span className="font-sansation text-3xl font-bold tracking-tight text-[#8C6D46]">
                  {currentProject.met04_mtta}
                </span>
                <span className="font-sansation text-lg font-bold text-[#8C6D46]">ngày</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Giảm so với tháng trước (Mục tiêu: ≤ 4.0 ngày)
              </p>
            </div>
          </div>

          <div className="pt-4">
            <div className="bg-white/90 border border-amber-200/80 rounded-xl p-2 flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Supervisor duyệt</span>
                <span className="font-mono font-bold text-slate-800">{currentProject.met04_sup_days} ngày</span>
              </div>
              <span className="text-slate-300 font-light">|</span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">PM Fast Track</span>
                <span className="font-mono font-bold text-[#8C6D46]">{currentProject.met04_pm_days} ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* MET-08: RECURRENCE RATE (DYNAMIC ALERT VS SAFE STYLING) */}
        <div className={`rounded-2xl p-5 shadow-2xs flex flex-col justify-between border transition-all duration-300 ${
          currentProject.met08_recurrence >= 5.0 
            ? 'bg-[#FDEAEB] text-slate-800 border-rose-200/80 ring-1 ring-rose-200/50' 
            : 'bg-[#EDF7ED] text-slate-800 border-emerald-200/80'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className={`font-sansation font-bold tracking-wider uppercase flex items-center gap-1.5 text-xs ${
                currentProject.met08_recurrence >= 5.0 ? 'text-[#D9383A]' : 'text-[#1B5E20]'
              }`}>
                {currentProject.met08_recurrence >= 5.0 ? (
                  <AlertTriangle className="w-4 h-4 text-[#D9383A]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                )}
                <span>MET-08 • ĐỘ BỀN KẾT CẤU</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-white font-sansation text-[10px] font-bold tracking-wide shadow-2xs ${
                currentProject.met08_recurrence >= 5.0 ? 'bg-[#D9383A]' : 'bg-emerald-600'
              }`}>
                {currentProject.met08_recurrence >= 5.0 ? 'CẢNH BÁO' : 'ĐẠT CHUẨN'}
              </span>
            </div>
            <div className="pt-1">
              <span className={`font-sansation text-3xl font-bold tracking-tight ${
                currentProject.met08_recurrence >= 5.0 ? 'text-[#D9383A]' : 'text-[#1B5E20]'
              }`}>
                {currentProject.met08_recurrence}%
              </span>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {currentProject.met08_note}
              </p>
            </div>
          </div>

          <div className="pt-4">
            {currentProject.met08_recurrence >= 5.0 ? (
              <div className="inline-flex items-center justify-center gap-1.5 w-full bg-rose-100/90 border border-rose-300 py-1.5 px-3 rounded-full text-xs font-sansation font-bold text-[#D9383A]">
                <AlertTriangle className="w-4 h-4 text-[#D9383A]" />
                <span>VƯỢT NGƯỠNG AN TOÀN KỸ THUẬT (≥ 5.0%)</span>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center gap-1.5 w-full bg-white/90 border border-emerald-300 py-1.5 px-3 rounded-full text-xs font-sansation font-bold text-[#1B5E20]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ĐẠT CHUẨN AN TOÀN KỸ THUẬT (&lt; 5.0%)</span>
              </div>
            )}
          </div>
        </div>

        {/* MET-11: INTEGRITY PASS RATE */}
        <div className="rounded-2xl p-5 shadow-2xs flex flex-col justify-between bg-[#EDF7ED] text-slate-800 border border-emerald-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sansation font-bold tracking-wider text-[#1B5E20] uppercase flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>MET-11 • PHÁP LÝ & BẢO MẬT SỐ</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#1B5E20] font-sansation text-[10px] font-bold border border-emerald-200 font-mono">
                SHA-256
              </span>
            </div>
            <div className="pt-1">
              <span className="font-sansation text-3xl font-bold tracking-tight text-[#1B5E20]">
                {currentProject.met11_integrity}%
              </span>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {currentProject.met11_items_text}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center justify-center gap-1.5 w-full bg-[#1B5E20]/10 border border-[#1B5E20]/20 py-1.5 px-3 rounded-full text-xs font-sansation font-bold text-[#1B5E20]">
              <Lock className="w-3.5 h-3.5 text-[#1B5E20]" />
              <span className="truncate">MÃ BĂM BLOCKCHAIN / TCVN SẴN SÀNG</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ASYNC EXPORT WORKER QUEUE CARD (RPT-07)                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 lg:p-6 shadow-2xs space-y-4">
        {/* Queue Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] text-[#C9A227] border border-amber-200/70 flex items-center justify-center shrink-0">
              <FolderArchive className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-sansation text-lg font-bold text-slate-900">
                  Hàng đợi xuất dữ liệu bất đồng bộ (Async Export Worker)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200">
                  Mã phiên: {activeJob ? `#${activeJob.id}` : 'Không có tác vụ chạy'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Xử lý kết xuất tệp bằng chứng nén ZIP và báo cáo đối soát PDF chuẩn A-1a
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeJob && activeJob.status === 'PROCESSING' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
                <span>Đang thực thi nền (202 Accepted)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Worker rảnh rỗi (Ready)</span>
              </span>
            )}
          </div>
        </div>

        {/* Active Export Progress Module */}
        {activeJob && activeJob.status === 'PROCESSING' && (
          <div className="bg-slate-50 rounded-xl border border-slate-200/90 p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#C9A227] animate-spin" />
                <span className="font-semibold text-slate-800 text-sm">
                  Đang đóng gói hồ sơ nghiệm thu {activeJob.name}...
                </span>
                <span className="font-sansation text-[#C9A227] font-bold text-base">
                  {activeJob.progress}%
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span>
                  Đã ghép: <strong className="text-slate-800 font-semibold font-mono">{activeJob.processedItems}/{activeJob.totalItems} mục</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Còn lại: <strong className="text-slate-800 font-semibold font-mono">{activeJob.estimatedSecondsRemaining} giây</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Dung lượng tạm: <strong className="text-slate-800 font-semibold font-mono">{activeJob.tempSizeMb} MB</strong>
                </span>
              </div>
            </div>

            {/* Animated Striped Progress Bar */}
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
              <div
                className="h-full bg-[#C9A227] rounded-full transition-all duration-500 relative"
                style={{
                  width: `${activeJob.progress}%`,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25) 10px, transparent 10px, transparent 20px)'
                }}
              ></div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Ghi chú kỹ thuật: Đang ghép 48 cặp ảnh BEFORE/AFTER và biên bản nghiệm thu TCVN 8819 kèm tọa độ WGS-84.
              </span>
              <button
                onClick={handleCancelActiveJob}
                type="button"
                className="text-rose-600 hover:text-rose-800 hover:underline self-start sm:self-auto font-semibold cursor-pointer"
              >
                Hủy tác vụ này
              </button>
            </div>
          </div>
        )}

        {/* Completed Output Mock Preview Controls */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Bản sao lưu gần nhất:</span>
            <span className="font-mono font-semibold text-slate-800">{currentProject.code}_Final.zip (142 MB)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadFile(`${currentProject.code}_Final.zip`)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải gói ZIP (142 MB)</span>
            </button>

            <button
              onClick={() => {
                const completedRec = processedRecords.find((r) => r.status === 'COMPLETED') || exportRecords[0]
                if (completedRec) {
                  setSelectedRecordForDetail(completedRec)
                  setIsPreviewModalOpen(true)
                }
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Xem trước báo cáo PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. RECENT EXPORTS TABLE CARD WITH SORTABLE COLUMNS & COLOR LEGEND         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {/* Table Header & Controls */}
        <div className="p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-sansation text-lg lg:text-xl font-bold text-slate-900">
                Danh mục hồ sơ giải trình đã kết xuất
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                {processedRecords.length} / {exportRecords.length} gói lưu trữ
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Lịch sử lưu trữ hồ sơ hoàn công, biên bản đối chứng nghiệm thu và gói bằng chứng số phục vụ giám sát kỹ thuật, kiểm định công trình hạ tầng
            </p>

            {/* CHÚ GIẢI MÀU SẮC PHÂN LOẠI TÀI LIỆU KỸ THUẬT */}
            <div className="pt-1.5 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Màu phân loại chứng từ:</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-medium">
                🟣 Dossier Hoàn công
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium">
                🟢 Nghiệm thu Đối chứng
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-blue-100 text-blue-900 border border-blue-200 font-medium">
                🔵 Trắc dọc & Bình đồ GIS
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-medium">
                🟡 Thí nghiệm Vật liệu
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 italic">Trạng thái xử lý hiển thị ở cột bên phải</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleRefresh}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition border border-slate-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px] select-none">
              <tr>
                {/* Cột 1: Mã gói xuất */}
                <th
                  onClick={() => handleToggleSort('code')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Mã gói"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mã gói xuất</span>
                    {sortField === 'code' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Cột 2: Loại hồ sơ */}
                <th className="py-3 px-4">Loại hồ sơ</th>

                {/* Cột 3: Phạm vi / Tuyến */}
                <th
                  onClick={() => handleToggleSort('scope_display')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Phạm vi / Tuyến"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Phạm vi / Tuyến</span>
                    {sortField === 'scope_display' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Cột 4: Mốc As-Of */}
                <th
                  onClick={() => handleToggleSort('as_of_timestamp')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Thời gian As-Of"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mốc As-Of</span>
                    {sortField === 'as_of_timestamp' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Cột 5: Kích thước & Định dạng */}
                <th
                  onClick={() => handleToggleSort('file_size_mb')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Dung lượng tệp"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kích thước & Định dạng</span>
                    {sortField === 'file_size_mb' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Cột 6: Trạng thái */}
                <th
                  onClick={() => handleToggleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Trạng thái"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Trạng thái</span>
                    {sortField === 'status' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Cột 7: Thao tác */}
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <Archive className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại</p>
                    <p className="text-xs text-slate-400">Hãy thử đổi dự án, điều chỉnh quý/nhánh hoặc nhấn "Đặt lại".</p>
                  </td>
                </tr>
              ) : (
                processedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Mã gói xuất */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C9A227]">
                      {record.code}
                    </td>

                    {/* Loại hồ sơ */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${record.type_badge_color}`}>
                          {record.type}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 mt-1">
                          Mã DA: {record.project_code} • {record.dossier_no}
                        </span>
                      </div>
                    </td>

                    {/* Phạm vi / Tuyến */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                      {record.scope_display}
                    </td>

                    {/* Mốc As-Of */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {record.as_of_time}
                    </td>

                    {/* Kích thước & Định dạng */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{record.file_size}</span>
                        <span className="text-slate-500 text-[11px]">({record.format_display})</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4">
                      {record.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          COMPLETED
                        </span>
                      ) : record.status === 'PROCESSING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                          PROCESSING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          FAILED
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleDownloadFile(`${record.code}.zip`)}
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#C9A227] hover:bg-slate-100 transition cursor-pointer"
                            title="Tải xuống gói hồ sơ"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedRecordForDetail(record)
                            setIsPreviewModalOpen(true)
                          }}
                          type="button"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Xem chi tiết hồ sơ & mã băm SHA-256"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        {record.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryRecord(record.id)}
                            type="button"
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                            title="Thử lại (Retry)"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRecord(record.id, record.code)}
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa hồ sơ khỏi kho"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination Minimal */}
        <div className="p-4 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/90 font-medium">
          <span>Hiển thị {processedRecords.length} trong tổng số {exportRecords.length} hồ sơ lưu trữ điện tử</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              type="button"
              className="px-3 py-1 rounded-full bg-white text-slate-400 shadow-2xs border border-slate-200 cursor-not-allowed opacity-60"
            >
              Trước
            </button>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-mono text-slate-800 font-semibold shadow-2xs">
              1 / {Math.max(1, Math.ceil(processedRecords.length / 5))}
            </span>
            <button
              type="button"
              className="px-3 py-1 rounded-full bg-white text-slate-700 hover:text-slate-900 shadow-2xs border border-slate-200 cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 7. LEGAL & SECURITY AUDIT STRIP (BACKEND V2.2 SHA-256 COMPLIANT)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 lg:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3 flex-1">
          <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-sansation text-sm text-slate-900 block font-bold">
              Tiêu chuẩn pháp lý & Toàn vẹn chứng từ số (RPT-07)
            </span>
            <p className="text-slate-500 leading-relaxed text-[11px] lg:text-xs">
              Hồ sơ kỹ thuật xuất từ hệ thống RoadGuard (Nhà thầu Cát Tường) tự động đính kèm mã băm SHA-256 Checksum cho từng tệp ảnh và gói nén, đáp ứng đầy đủ tiêu chuẩn nghiệm thu và kiểm toán kỹ thuật công trình giao thông (TCVN 8819 &amp; TCVN 8864).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="font-sansation font-bold text-slate-900 text-xs">Mã băm SHA-256: Toàn vẹn</span>
            <span className="font-mono text-[10px] text-slate-500 font-semibold">Chuẩn đối soát bảo hành: v2.2</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TẠO YÊU CẦU XUẤT HỒ SƠ MỚI (NEW EXPORT MODAL)                    */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-sansation text-lg font-bold text-slate-900">
                  Khởi tạo yêu cầu xuất hồ sơ (Export Job)
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExportJob} className="space-y-4 text-xs">
              {/* Loại báo cáo / hồ sơ */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Loại hồ sơ kỹ thuật cần xuất</label>
                <select
                  value={exportForm.reportType}
                  onChange={(e) => setExportForm({ ...exportForm, reportType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium cursor-pointer"
                >
                  <option value="DOSSIER_COMPLETE">Hồ sơ hoàn công & Bằng chứng số tổng hợp (PDF + ZIP)</option>
                  <option value="BEFORE_AFTER_ZIP">Gói ảnh đối chứng Before/After độ phân giải gốc (ZIP)</option>
                  <option value="GIS_GEOJSON">Báo cáo kiểm định trắc dọc & Bình đồ GIS (GeoJSON / CSV)</option>
                  <option value="AUDIT_TRAIL">Nhật ký xử lý & Báo cáo pháp lý TCVN (PDF/A-1a)</option>
                </select>
              </div>

              {/* Phạm vi dự án */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Dự án & Phân đoạn bảo hành</label>
                <select
                  value={exportForm.scope}
                  onChange={(e) => setExportForm({ ...exportForm, scope: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium cursor-pointer"
                >
                  <option value="PRJ-QL1A-02">QL1A - Giai đoạn 2 (Km 1024 - Km 1045, Đèo Hải Vân)</option>
                  <option value="PRJ-CTBN-01">Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt, Km 430 - 479)</option>
                  <option value="PRJ-LSTL-05">Cao tốc La Sơn - Túy Loan (Km 35+000 - Km 42+500)</option>
                  <option value="PRJ-PTDG-03">Tuyến tránh TP. Huế (QL1A-BP, Km 18+600 - Km 22+400)</option>
                </select>
              </div>

              {/* Mốc thời gian As-Of */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mốc thời gian khóa số liệu (As-Of Timestamp)</label>
                <input
                  type="datetime-local"
                  value={exportForm.asOfDate}
                  onChange={(e) => setExportForm({ ...exportForm, asOfDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono font-medium"
                />
              </div>

              {/* Tùy chọn cấu hình chuẩn Backend v2.2 ExportRequest */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Cấu hình xuất dữ liệu & Toàn vẹn số (Backend v2.2)
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportForm.includeSha256Checksum}
                    onChange={(e) => setExportForm({ ...exportForm, includeSha256Checksum: e.target.checked })}
                    className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-700">Sinh mã băm SHA-256 Checksum cho từng ảnh gốc (BR-20)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportForm.includeOriginalFiles}
                    onChange={(e) => setExportForm({ ...exportForm, includeOriginalFiles: e.target.checked })}
                    className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">Đính kèm ảnh/video gốc độ phân giải cao (includeOriginalFiles)</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold cursor-pointer transition shadow-2xs"
                >
                  Bắt đầu xuất hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: XEM CHI TIẾT HỒ SƠ & MÃ BĂM (DOSSIER DETAIL MODAL)              */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-sansation text-lg font-bold text-slate-900">
                  Chi tiết hồ sơ kết xuất: {selectedRecordForDetail.code}
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Loại tài liệu:</span>
                  <span className="font-semibold text-slate-800">{selectedRecordForDetail.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Dự án:</span>
                  <span className="font-semibold text-slate-800">{selectedRecordForDetail.project_code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Phạm vi tuyến:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedRecordForDetail.scope_display}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mốc thời gian As-Of:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedRecordForDetail.as_of_time}</span>
                </div>
              </div>

              {/* Hash Verification */}
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Xác thực tính toàn vẹn (Integrity Verified)</span>
                </div>
                <div className="font-mono text-[11px] break-all bg-white p-2 rounded-lg border border-emerald-200/80 text-slate-700">
                  {selectedRecordForDetail.hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">
                  Đã kiểm tra đối soát 48/48 tệp ảnh gốc khớp mã băm SHA-256 không bị can thiệp.
                </p>
              </div>

              {/* Metadata Items */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Dung lượng lưu trữ:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedRecordForDetail.file_size}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Định dạng gói:</span>
                  <span className="font-semibold text-slate-800">{selectedRecordForDetail.format_display}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Kiểm tra toàn vẹn tệp:</span>
                  <span className="font-semibold text-emerald-700 font-mono">SHA-256 Checksum Hợp lệ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleDownloadFile(`${selectedRecordForDetail.code}.zip`)
                  setIsPreviewModalOpen(false)
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp nén</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TÙY CHỈNH KHUNG THỜI GIAN (TIME RANGE MODAL)                     */}
      {/* ========================================================================= */}
      {isTimeRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-sansation text-lg font-bold text-slate-900">
                  Tùy chỉnh khung thời gian báo cáo
                </h3>
              </div>
              <button
                onClick={() => setIsTimeRangeModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Từ ngày</label>
                <input
                  type="date"
                  defaultValue="2026-07-01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Đến ngày</label>
                <input
                  type="date"
                  defaultValue="2026-09-30"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Chu kỳ phân tích định kỳ</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium cursor-pointer">
                  <option>Theo Quý (Quarterly Breakdown)</option>
                  <option>Theo Tháng (Monthly Breakdown)</option>
                  <option>Lũy kế chu kỳ bảo hành (Full Warranty Lifecycle)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsTimeRangeModalOpen(false)}
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setIsTimeRangeModalOpen(false)
                  showToast('Đã áp dụng khung thời gian mới cho toàn bộ chỉ số KPI!')
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
