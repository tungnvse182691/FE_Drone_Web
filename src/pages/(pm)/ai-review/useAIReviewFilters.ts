import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TriageCase, ViewSourceMode, ActiveTabFilter } from './types'

export interface UseAIReviewFiltersProps {
  cases: TriageCase[]
}

export const useAIReviewFilters = ({ cases }: UseAIReviewFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
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
    } else if (sourceParam === 'patrol') {
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

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Tab filter
      if (activeTab === 'PENDING' && c.status !== 'PENDING') return false
      if (activeTab === 'MERGED' && c.status !== 'MERGED') return false
      if (activeTab === 'NEED_SURVEY' && c.status !== 'NEED_SURVEY') return false
      if (activeTab === 'CRITICAL' && c.severity !== 'CRITICAL') return false

      // 3. Dropdown filters: Nguồn tiếp nhận
      if (sourceFilter !== 'ALL' && c.source !== sourceFilter) return false

      // 4. Lọc theo phạm vi tuyến (Trục chính vs Tuyến nhánh theo PM-05)
      if (lineTypeFilter === 'MAIN_LINE' && c.stationing.includes('Nhánh')) return false
      if (lineTypeFilter === 'BRANCH_LINE' && !c.stationing.includes('Nhánh')) return false

      // 5. Dự án & Ưu tiên
      if (projectFilter !== 'ALL' && c.project_name !== projectFilter) return false
      if (priorityFilter !== 'ALL' && c.severity !== priorityFilter) return false

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
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
  }, [cases, viewSourceMode, activeTab, sourceFilter, lineTypeFilter, projectFilter, priorityFilter, searchQuery])

  // Count stats
  const pendingCount = cases.filter((c) => c.status === 'PENDING').length
  const criticalCount = cases.filter((c) => c.severity === 'CRITICAL').length
  const mergedCount = cases.filter((c) => c.status === 'MERGED').length
  const surveyCount = cases.filter((c) => c.status === 'NEED_SURVEY').length

  const citizenCount = cases.filter((c) => c.source === 'CITIZEN' || c.source === 'PATROL').length
  const unassignedCitizenCount = cases.filter(
    (c) => (c.source === 'CITIZEN' || c.source === 'PATROL') && (!c.project_id || c.project_id === '')
  ).length
  const droneAICount = cases.filter((c) => c.source === 'DRONE_AI').length

  return {
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
