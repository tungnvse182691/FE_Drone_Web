import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TriageCase, ViewSourceMode, ActiveTabFilter } from './types'

export interface UseAIReviewFiltersProps {
  cases: TriageCase[]
}

export const useAIReviewFilters = ({ cases }: UseAIReviewFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const sourceParam = searchParams.get('source')

  // Chế độ xem: Bảng tiếp nhận & điều phối phản ánh dân (PA03, PA04) vs Hộp thư Drone AI
  const [viewSourceMode, setViewSourceMode] = useState<ViewSourceMode>(() => {
    if (sourceParam === 'drone') return 'DRONE_AI'
    if (sourceParam === 'all') return 'ALL'
    return 'CITIZEN_TRIAGE'
  })

  useEffect(() => {
    if (sourceParam === 'drone') setViewSourceMode('DRONE_AI')
    else if (sourceParam === 'citizen') setViewSourceMode('CITIZEN_TRIAGE')
    else if (sourceParam === 'all') setViewSourceMode('ALL')
  }, [sourceParam])

  const handleSetViewSourceMode = (mode: ViewSourceMode) => {
    setViewSourceMode(mode)
    if (mode === 'DRONE_AI') setSearchParams({ source: 'drone' })
    else if (mode === 'CITIZEN_TRIAGE') setSearchParams({ source: 'citizen' })
    else setSearchParams({ source: 'all' })
  }

  // Tabs & filters
  const [activeTab, setActiveTab] = useState<ActiveTabFilter>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [projectFilter, setProjectFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // View Source Mode Filter
      if (viewSourceMode === 'CITIZEN_TRIAGE' && c.source === 'DRONE_AI') return false
      if (viewSourceMode === 'DRONE_AI' && c.source !== 'DRONE_AI') return false

      // Tab filter
      if (activeTab === 'PENDING' && c.status !== 'PENDING') return false
      if (activeTab === 'MERGED' && c.status !== 'MERGED') return false
      if (activeTab === 'NEED_SURVEY' && c.status !== 'NEED_SURVEY') return false
      if (activeTab === 'CRITICAL' && c.severity !== 'CRITICAL') return false

      // Dropdown filters
      if (sourceFilter !== 'ALL' && c.source !== sourceFilter) return false
      if (projectFilter !== 'ALL' && c.project_name !== projectFilter) return false
      if (priorityFilter !== 'ALL' && c.severity !== priorityFilter) return false

      // Search Query
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
  }, [cases, viewSourceMode, activeTab, sourceFilter, projectFilter, priorityFilter, searchQuery])

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
