import { ProjectConfig, ExportRecord } from './types'

export function computeProjectMetrics(
  base: ProjectConfig,
  selectedTrack: string,
  selectedTimeRange: string
): ProjectConfig {
  if (selectedTrack === 'FAST_TRACK') {
    return {
      ...base,
      met01_ratio: Math.min(94.2, +(base.met01_ratio + 12.5).toFixed(1)),
      met01_completed_text: '100% khiếm khuyết xử lý dưới 24h không qua Ban thẩm duyệt',
      met04_mtta: Math.max(0.8, +base.met04_pm_days.toFixed(1)),
      met04_change: '-1.8 ngày',
      met08_recurrence: Math.max(1.2, +(base.met08_recurrence - 1.5).toFixed(1)),
      met08_status: 'ĐẠT CHUẨN' as const,
      met08_note: 'Quy trình xử lý khẩn cấp kiểm soát tốt tái phát nứt lún cục bộ'
    }
  }

  if (selectedTrack === 'APPROVAL_TRACK') {
    return {
      ...base,
      met01_ratio: Math.max(65.0, +(base.met01_ratio - 4.2).toFixed(1)),
      met01_completed_text: 'Các đợt sửa chữa lớn có lập hồ sơ khối lượng & TVGS thẩm định',
      met04_mtta: +base.met04_sup_days.toFixed(1),
      met04_change: '+0.5 ngày'
    }
  }

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
}

export function filterAndSortRecords(
  exportRecords: ExportRecord[],
  selectedProject: string,
  statusFilter: string,
  selectedTimeRange: string,
  selectedTrack: string,
  searchQuery: string,
  sortField: 'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status',
  sortAsc: boolean
): ExportRecord[] {
  const result = exportRecords.filter((rec) => {
    if (selectedProject !== 'ALL' && rec.project_id !== selectedProject) return false
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false

    if (selectedTimeRange === 'Q3_2026') {
      if (rec.quarter !== 'Q3_2026' && rec.quarter !== 'MONTH_08_2026') return false
    } else if (selectedTimeRange === 'Q2_2026') {
      if (rec.quarter !== 'Q2_2026') return false
    } else if (selectedTimeRange === 'MONTH_08_2026') {
      if (rec.quarter !== 'MONTH_08_2026') return false
    }

    if (selectedTrack !== 'ALL') {
      if (rec.track !== 'ALL' && (rec.track as string) !== selectedTrack) return false
    }

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
}
