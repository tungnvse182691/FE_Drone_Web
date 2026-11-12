import React, { useState, useMemo, useEffect } from 'react'
import { TriageCase } from './types'
import { useCaseIntake } from './useCaseIntake'
import { useCaseEvidenceRequest } from './useCaseEvidenceRequest'
import { useAIReviewFilters } from './useAIReviewFilters'
import { useAIReviewDrawer } from './useAIReviewDrawer'
import { useAIReviewActions } from './useAIReviewActions'
import { useAIReviewLinkActions } from './useAIReviewLinkActions'

export const useAIReviewState = () => {
  const intake = useCaseIntake('ALL')
  const { cases, setCases } = intake
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const selectedCaseId = intake.caseId
  const setSelectedCaseId = (id: string) => intake.openCase(id)
  const selectedCase = useMemo(() => {
    if (!intake.selected) return {} as TriageCase
    const project = intake.projects.find(p => p.id === intake.selected!.project_id)
    return project ? {...intake.selected, project_name: project.name, project_code: project.code} : intake.selected
  }, [intake.selected, intake.projects])
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }
  useEffect(() => { setIsDetailModalOpen(!!intake.caseId) }, [intake.caseId])
  useEffect(() => { if (intake.message) showToast(intake.message) }, [intake.message])

  // Thu gọn / Mở rộng nhóm báo cáo trùng (Accordion)
  const [expandedMasterIds, setExpandedMasterIds] = useState<string[]>([])
  const [collapseMergedRows, setCollapseMergedRows] = useState<boolean>(true)

  const handleToggleExpandMaster = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedMasterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Form states for selected case editing
  const [currentSeverity, setCurrentSeverity] = useState<TriageCase['severity']>(
    selectedCase?.severity || 'UNKNOWN'
  )
  const [currentUrgency, setCurrentUrgency] = useState<TriageCase['urgency']>(
    selectedCase?.urgency || 'UNKNOWN'
  )
  const [currentArea, setCurrentArea] = useState<number>(selectedCase?.area_sqm ?? Number.NaN)
  const [currentDepth, setCurrentDepth] = useState<number>(selectedCase?.max_depth_cm ?? Number.NaN)
  const [currentNotes, setCurrentNotes] = useState<string>(selectedCase?.pm_notes || '')
  const evidenceRequest = useCaseEvidenceRequest(intake.selected, currentNotes, intake.applyReadback)

  useEffect(() => {
    if (!intake.selected) return
    setCurrentSeverity(intake.selected.severity)
    setCurrentUrgency(intake.selected.urgency)
    setCurrentArea(intake.selected.area_sqm)
    setCurrentDepth(intake.selected.max_depth_cm)
    setCurrentNotes(intake.selected.pm_notes)
  }, [intake.selected])

  const handleSelectCase = (c: TriageCase) => {
    intake.openCase(c.id)
    setIsDetailModalOpen(true)
  }
  const handleOpenTriageProject = (c: TriageCase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!intake.isSupervisor) return
    if (intake.selected?.id === c.id) intake.openTriage()
    else intake.openCase(c.id, true)
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
    currentNotes,
    setIsDetailModalOpen
  })

  // Chưa tích hợp các lệnh này; không mô phỏng thay đổi Case trên FE.
  const handleBulkVerify = () => {}
  const handleBulkNeedSurvey = () => {}

  return {
    intake,
    evidenceRequest,
    projects: intake.projects,
    loadError: intake.listError,
    retryLoad: intake.retry,
    reloadCases: intake.retry,
    cases,
    setCases,
    isLoading: intake.listLoading,
    expandedMasterIds,
    handleToggleExpandMaster,
    collapseMergedRows,
    setCollapseMergedRows,
    selectedCaseId,
    setSelectedCaseId,
    isDetailModalOpen,
    setIsDetailModalOpen: (open: boolean) => { setIsDetailModalOpen(open); if (!open) intake.openCase('') },
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
    handleSelectCase,
    handleToggleClusterItem,

    // Spread filters
    viewSourceMode: filters.viewSourceMode,
    handleSetViewSourceMode: filters.handleSetViewSourceMode,
    activeTab: filters.activeTab,
    setActiveTab: filters.setActiveTab,
    sourceFilter: filters.sourceFilter,
    setSourceFilter: filters.setSourceFilter,
    lineTypeFilter: filters.lineTypeFilter,
    setLineTypeFilter: filters.setLineTypeFilter,
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
    isTriageProjectModalOpen: intake.triageOpen,
    setIsTriageProjectModalOpen: (open: boolean) => { if (open) intake.openTriage(); else intake.closeTriage() },
    selectedProjectId: intake.projectId,
    setSelectedProjectId: intake.setProjectId,
    handleToggleSelectReport: linkActions.handleToggleSelectReport,
    handleSelectAllReports: linkActions.handleSelectAllReports,
    handleOpenLinkReportsModal: linkActions.handleOpenLinkReportsModal,
    handleConfirmLinkReports: linkActions.handleConfirmLinkReports,
    handleUnlinkReport: linkActions.handleUnlinkReport,
    handleOpenTriageProject,
    handleConfirmTriageProject: intake.execute,

    // Spread triage decisions & actions
    targetTriageCase: intake.triageOpen ? intake.selected : actions.targetTriageCase,
    setTargetTriageCase: (c: import('./types').TriageCase | null) => {
      actions.setTargetTriageCase(c)
    },
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
    handleVerifyDefect: evidenceRequest.execute,
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
    handleExecuteMerge: actions.handleExecuteMerge,
    handleBulkVerify,
    handleBulkNeedSurvey
  }
}
