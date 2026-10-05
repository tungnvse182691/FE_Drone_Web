import React, { useState, useMemo, useEffect } from 'react'
import { mockTriageCases } from '../../../data/mockData'
import { TriageCase } from './types'
import { useAIReviewFilters } from './useAIReviewFilters'
import { useAIReviewDrawer } from './useAIReviewDrawer'
import { useAIReviewActions } from './useAIReviewActions'
import { useAIReviewLinkActions } from './useAIReviewLinkActions'

const TRIAGE_STORAGE_KEY = 'roadguard_triage_cases_v2'

export const useAIReviewState = () => {
  // Dữ liệu hồ sơ tiếp nhận từ Single Source of Truth + Đồng bộ LocalStorage
  const [cases, setCases] = useState<TriageCase[]>(() => {
    try {
      const saved = localStorage.getItem(TRIAGE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (err) {
      console.error('Failed to load triage cases from storage', err)
    }
    return mockTriageCases
  })

  // Tự động lưu LocalStorage khi dữ liệu cases thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(TRIAGE_STORAGE_KEY, JSON.stringify(cases))
    } catch (err) {
      console.error('Failed to save triage cases to storage', err)
    }
  }, [cases])

  // Selected Case for Right Detail Panel
  const [selectedCaseId, setSelectedCaseId] = useState<string>('cas-05')
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0]
  }, [cases, selectedCaseId])

  // Thu gọn / Mở rộng nhóm báo cáo trùng (Accordion)
  const [expandedMasterIds, setExpandedMasterIds] = useState<string[]>(['cas-05'])
  const [collapseMergedRows, setCollapseMergedRows] = useState<boolean>(true)

  const handleToggleExpandMaster = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedMasterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Form states for selected case editing
  const [currentSeverity, setCurrentSeverity] = useState<TriageCase['severity']>(
    selectedCase?.severity || 'CRITICAL'
  )
  const [currentUrgency, setCurrentUrgency] = useState<TriageCase['urgency']>(
    selectedCase?.urgency || 'EMERGENCY'
  )
  const [currentArea, setCurrentArea] = useState<number>(selectedCase?.area_sqm || 1.45)
  const [currentDepth, setCurrentDepth] = useState<number>(selectedCase?.max_depth_cm || 8.5)
  const [currentNotes, setCurrentNotes] = useState<string>(selectedCase?.pm_notes || '')

  // Update form inputs when selectedCase changes
  const handleSelectCase = (c: TriageCase) => {
    setSelectedCaseId(c.id)
    setCurrentSeverity(c.severity)
    setCurrentUrgency(c.urgency)
    setCurrentArea(c.area_sqm)
    setCurrentDepth(c.max_depth_cm)
    setCurrentNotes(c.pm_notes)
    setIsDetailModalOpen(true)
  }

  // Checkbox toggle for duplicate cluster items
  const handleToggleClusterItem = (code: string) => {
    if (!selectedCase?.cluster_duplicates) return
    const updatedDuplicates = selectedCase.cluster_duplicates.map((dup) =>
      dup.code === code ? { ...dup, selected: !dup.selected } : dup
    )
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, cluster_duplicates: updatedDuplicates } : c
      )
    )
  }

  // Sub-hook: Filters & Search
  const filters = useAIReviewFilters({ cases })

  // Sub-hook: Drawer & GIS maps
  const drawer = useAIReviewDrawer({ selectedCase })

  // Sub-hook: Linking actions & citizen reports
  const linkActions = useAIReviewLinkActions({
    cases,
    setCases,
    selectedCaseId,
    setSelectedCaseId,
    setExpandedMasterIds,
    showToast,
    filteredCases: filters.filteredCases
  })

  // Sub-hook: Actions (Triage decisions, survey, publish, modals)
  const actions = useAIReviewActions({
    cases,
    setCases,
    selectedCase,
    setExpandedMasterIds,
    showToast,
    setIsMergeModalOpen: drawer.setIsMergeModalOpen,
    currentSeverity,
    currentUrgency,
    currentArea,
    currentDepth,
    currentNotes
  })

  // Reset dữ liệu mẫu
  const handleResetTriageData = () => {
    setCases(mockTriageCases)
    try {
      localStorage.removeItem(TRIAGE_STORAGE_KEY)
    } catch {}
    linkActions.setSelectedReportIds([])
    showToast('Đã đặt lại dữ liệu phản ánh & triage về mặc định ban đầu!')
  }

  return {
    cases,
    setCases,
    expandedMasterIds,
    handleToggleExpandMaster,
    collapseMergedRows,
    setCollapseMergedRows,
    selectedCaseId,
    setSelectedCaseId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedCase,
    toastMessage,
    setToastMessage,
    showToast,
    currentSeverity,
    setCurrentSeverity,
    currentUrgency,
    setCurrentUrgency,
    currentArea,
    setCurrentArea,
    currentDepth,
    setCurrentDepth,
    currentNotes,
    setCurrentNotes,
    handleResetTriageData,
    handleSelectCase,
    handleToggleClusterItem,

    // Spread filters
    viewSourceMode: filters.viewSourceMode,
    handleSetViewSourceMode: filters.handleSetViewSourceMode,
    activeTab: filters.activeTab,
    setActiveTab: filters.setActiveTab,
    sourceFilter: filters.sourceFilter,
    setSourceFilter: filters.setSourceFilter,
    projectFilter: filters.projectFilter,
    setProjectFilter: filters.setProjectFilter,
    priorityFilter: filters.priorityFilter,
    setPriorityFilter: filters.setPriorityFilter,
    searchQuery: filters.searchQuery,
    setSearchQuery: filters.setSearchQuery,
    filteredCases: filters.filteredCases,
    pendingCount: filters.pendingCount,
    criticalCount: filters.criticalCount,
    mergedCount: filters.mergedCount,
    surveyCount: filters.surveyCount,
    citizenCount: filters.citizenCount,
    unassignedCitizenCount: filters.unassignedCitizenCount,
    droneAICount: filters.droneAICount,

    // Spread drawer & maps
    detailViewMode: drawer.detailViewMode,
    setDetailViewMode: drawer.setDetailViewMode,
    modalMapType: drawer.modalMapType,
    setModalMapType: drawer.setModalMapType,
    isGISModalOpen: drawer.isGISModalOpen,
    setIsGISModalOpen: drawer.setIsGISModalOpen,
    isMergeModalOpen: drawer.isMergeModalOpen,
    setIsMergeModalOpen: drawer.setIsMergeModalOpen,
    isPhotoZoomModalOpen: drawer.isPhotoZoomModalOpen,
    setIsPhotoZoomModalOpen: drawer.setIsPhotoZoomModalOpen,
    modalMapContainerRef: drawer.modalMapContainerRef,
    drawerMapContainerRef: drawer.drawerMapContainerRef,

    // Spread link actions
    selectedReportIds: linkActions.selectedReportIds,
    setSelectedReportIds: linkActions.setSelectedReportIds,
    isLinkReportsModalOpen: linkActions.isLinkReportsModalOpen,
    setIsLinkReportsModalOpen: linkActions.setIsLinkReportsModalOpen,
    linkMasterCaseId: linkActions.linkMasterCaseId,
    setLinkMasterCaseId: linkActions.setLinkMasterCaseId,
    linkAuditNotes: linkActions.linkAuditNotes,
    setLinkAuditNotes: linkActions.setLinkAuditNotes,
    isTriageProjectModalOpen: linkActions.isTriageProjectModalOpen,
    setIsTriageProjectModalOpen: linkActions.setIsTriageProjectModalOpen,
    selectedProjectId: linkActions.selectedProjectId,
    setSelectedProjectId: linkActions.setSelectedProjectId,
    handleToggleSelectReport: linkActions.handleToggleSelectReport,
    handleSelectAllReports: linkActions.handleSelectAllReports,
    handleOpenLinkReportsModal: linkActions.handleOpenLinkReportsModal,
    handleConfirmLinkReports: linkActions.handleConfirmLinkReports,
    handleUnlinkReport: linkActions.handleUnlinkReport,
    handleOpenTriageProject: linkActions.handleOpenTriageProject,
    handleConfirmTriageProject: linkActions.handleConfirmTriageProject,

    // Spread triage decisions & actions
    targetTriageCase: actions.targetTriageCase,
    setTargetTriageCase: actions.setTargetTriageCase,
    isNoDefectModalOpen: actions.isNoDefectModalOpen,
    setIsNoDefectModalOpen: actions.setIsNoDefectModalOpen,
    noDefectReason: actions.noDefectReason,
    setNoDefectReason: actions.setNoDefectReason,
    isPublishModalOpen: actions.isPublishModalOpen,
    setIsPublishModalOpen: actions.setIsPublishModalOpen,
    publishPublicNote: actions.publishPublicNote,
    setPublishPublicNote: actions.setPublishPublicNote,
    isRequestSurveyModalOpen: actions.isRequestSurveyModalOpen,
    setIsRequestSurveyModalOpen: actions.setIsRequestSurveyModalOpen,
    surveyMode: actions.surveyMode,
    setSurveyMode: actions.setSurveyMode,
    surveyReason: actions.surveyReason,
    setSurveyReason: actions.setSurveyReason,
    surveyAssignedCrew: actions.surveyAssignedCrew,
    setSurveyAssignedCrew: actions.setSurveyAssignedCrew,
    surveySlaHours: actions.surveySlaHours,
    setSurveySlaHours: actions.setSurveySlaHours,
    handleVerifyDefect: actions.handleVerifyDefect,
    handleRejectDefect: actions.handleRejectDefect,
    handleOpenRequestSurveyModal: actions.handleOpenRequestSurveyModal,
    handleConfirmRequestSurvey: actions.handleConfirmRequestSurvey,
    handleNavigateFastTrack: actions.handleNavigateFastTrack,
    handleOpenNoDefectModal: actions.handleOpenNoDefectModal,
    handleConfirmNoDefect: actions.handleConfirmNoDefect,
    handleConclusionOutOfScope: actions.handleConclusionOutOfScope,
    handleResetConclusion: actions.handleResetConclusion,
    handleOpenPublishModal: actions.handleOpenPublishModal,
    handleConfirmPublishResult: actions.handleConfirmPublishResult,
    handleExecuteMerge: actions.handleExecuteMerge
  }
}
