import { ExportRecord } from './types'

export function filterAndSortRecords(
  exportRecords: ExportRecord[],
  selectedProject: string,
  statusFilter: string,
  selectedTimeRange: string,
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
