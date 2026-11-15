import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TriageCase, ViewSourceMode, ActiveTabFilter } from './types'

export interface UseAIReviewFiltersProps {
  cases: TriageCase[]
}

// Exact inventory from the test worklog; opt-in display filter, never deletion or authority.
export const AUTO_TEST_CASE_IDS = new Set(['11ad1a42-cfbb-4cc6-a8a8-a770c7c4ee86', '44c53e93-8868-424a-a88a-f386897a204f', '68fb08f3-e003-4df8-b3aa-f3dfe39a811f'])

export const useAIReviewFilters = ({ cases }: UseAIReviewFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hideAutoTests, setHideAutoTests] = useState(false)
  const sourceParam = searchParams.get('source')

  // Chế độ xem: Hộp thư tiếp nhận tích hợp toàn diện
  const [viewSourceMode, setViewSourceMode] = useState<ViewSourceMode>('ALL')

  // Tabs & filters
  const [activeTab, setActiveTab] = useState<ActiveTabFilter>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [projectFilter, setProjectFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [lineTypeFilter, setLineTypeFilter] = useState<string>('ALL') // 'ALL' | 'MAIN_LINE' | 'BRANCH_LINE'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (sourceParam === 'drone') {
      setSourceFilter('DRONE_AI')
    } else if (sourceParam === 'citizen') {
      setSourceFilter('CITIZEN')
    } else if (sourceParam === 'patrol' || sourceParam === 'field') {
      setSourceFilter('PATROL')
    }
  }, [sourceParam])

  // Chuyển chế độ xem: tự động reset bộ lọc để không bao giờ bị lọc chéo ra 0 bản ghi
  const handleSetViewSourceMode = (mode: ViewSourceMode) => {
    setViewSourceMode(mode)
    setSourceFilter('ALL')
    setLineTypeFilter('ALL')
    setActiveTab('ALL')
  }

  const visibleCases = useMemo(() => cases.filter(c => !hideAutoTests || !AUTO_TEST_CASE_IDS.has(c.id.toLowerCase())), [cases, hideAutoTests])

  // Filtered cases
  const filteredCases = useMemo(() => {
    return visibleCases.filter((c) => {
      // 1. Tab filter
      if (activeTab === 'PENDING' && c.status !== 'PENDING') return false
      if (activeTab === 'MERGED' && c.status !== 'MERGED') return false
      if (activeTab === 'NEED_SURVEY' && c.status !== 'NEED_SURVEY' && c.status !== 'AWAITING_EVIDENCE') return false
      if (activeTab === 'CRITICAL' && c.severity !== 'CRITICAL') return false

      if (projectFilter === 'UNASSIGNED' && c.project_id) return false
      if (projectFilter === 'ASSIGNED' && !c.project_id) return false

      // 3. Dropdown filters: Nguồn tiếp nhận
      if (sourceFilter !== 'ALL' && c.source !== sourceFilter) return false

      // 4. Lọc theo phạm vi tuyến (Trục chính vs Tuyến nhánh theo PM-05)
      if (lineTypeFilter === 'MAIN_LINE' && c.stationing.includes('Nhánh')) return false
      if (lineTypeFilter === 'BRANCH_LINE' && !c.stationing.includes('Nhánh')) return false

      // 5. Dự án & Ưu tiên
      if (!['ALL', 'UNASSIGNED', 'ASSIGNED'].includes(projectFilter) && c.project_name !== projectFilter && c.project_id !== projectFilter) return false
      if (priorityFilter !== 'ALL' && c.severity !== priorityFilter) return false

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        return (
          c.code.toLowerCase().includes(q) ||
          c.defect_title.toLowerCase().includes(q) ||
          c.stationing.toLowerCase().includes(q) ||
          c.project_name.toLowerCase().includes(q) ||
          (c.reporter_name && c.reporter_name.toLowerCase().includes(q)) ||
          (c.reporter_phone && c.reporter_phone.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [visibleCases, viewSourceMode, activeTab, sourceFilter, lineTypeFilter, projectFilter, priorityFilter, searchQuery])

  // Count stats
  const pendingCount = visibleCases.filter((c) => c.status === 'PENDING').length
  const criticalCount = visibleCases.filter((c) => c.severity === 'CRITICAL').length
  const mergedCount = visibleCases.filter((c) => c.status === 'MERGED').length
  const surveyCount = visibleCases.filter((c) => (c.status === 'NEED_SURVEY' || c.status === 'AWAITING_EVIDENCE')).length

  const citizenCount = visibleCases.filter((c) => c.source === 'CITIZEN' || c.source === 'PATROL').length
  const unassignedCitizenCount = visibleCases.filter(
    (c) => (c.source === 'CITIZEN' || c.source === 'PATROL') && (!c.project_id || c.project_id === '')
  ).length
  const droneAICount = visibleCases.filter((c) => c.source === 'DRONE_AI').length

  return {
    visibleCases,
    hideAutoTests,
    setHideAutoTests,
    autoTestCount: cases.filter(c => AUTO_TEST_CASE_IDS.has(c.id.toLowerCase())).length,
    viewSourceMode,
    handleSetViewSourceMode,
    activeTab,
    setActiveTab,
    sourceFilter,
    setSourceFilter,
    lineTypeFilter,
    setLineTypeFilter,
    projectFilter,
    setProjectFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    filteredCases,
    pendingCount,
    criticalCount,
    mergedCount,
    surveyCount,
    citizenCount,
    unassignedCitizenCount,
    droneAICount
  }
}
