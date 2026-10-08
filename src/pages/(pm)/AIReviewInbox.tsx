import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { mockProjects } from '../../data/mockData'
import { Icon } from '../../components/ui/Icon'

import { ReviewHeader } from './ai-review/ReviewHeader'
import { ReviewFilterBar } from './ai-review/ReviewFilterBar'
import { ReviewCasesTable } from './ai-review/ReviewCasesTable'
import { ReviewDetailModal } from './ai-review/ReviewDetailModal'
import { ReviewModals } from './ai-review/ReviewModals'
import { useAIReviewState } from './ai-review/useAIReviewState'

export type { TriageCase } from './ai-review/types'

export const AIReviewInbox: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const state = useAIReviewState()
  const {
    cases, viewSourceMode, handleSetViewSourceMode, expandedMasterIds, handleToggleExpandMaster,
    collapseMergedRows, setCollapseMergedRows, selectedReportIds, setSelectedReportIds,
    isLinkReportsModalOpen, setIsLinkReportsModalOpen, linkMasterCaseId, setLinkMasterCaseId,
    linkAuditNotes, setLinkAuditNotes, isTriageProjectModalOpen, setIsTriageProjectModalOpen,
    targetTriageCase, selectedProjectId, setSelectedProjectId, isNoDefectModalOpen, setIsNoDefectModalOpen,
    noDefectReason, setNoDefectReason, isPublishModalOpen, setIsPublishModalOpen, publishPublicNote,
    setPublishPublicNote, isRequestSurveyModalOpen, setIsRequestSurveyModalOpen, surveyMode, setSurveyMode,
    surveyReason, setSurveyReason, surveyAssignedCrew, setSurveyAssignedCrew, surveySlaHours, setSurveySlaHours,
    setSelectedCaseId, isDetailModalOpen, setIsDetailModalOpen, selectedCase, activeTab, setActiveTab,
    sourceFilter, setSourceFilter, lineTypeFilter, setLineTypeFilter, projectFilter, setProjectFilter, priorityFilter, setPriorityFilter,
    searchQuery, setSearchQuery, toastMessage, setToastMessage, showToast, detailViewMode, setDetailViewMode,
    modalMapType, setModalMapType, isGISModalOpen, setIsGISModalOpen, isMergeModalOpen, setIsMergeModalOpen,
    isPhotoZoomModalOpen, setIsPhotoZoomModalOpen, modalMapContainerRef, drawerMapContainerRef,
    currentSeverity, setCurrentSeverity, currentUrgency, setCurrentUrgency, currentArea, setCurrentArea,
    currentDepth, setCurrentDepth, currentNotes, setCurrentNotes, filteredCases, pendingCount,
    criticalCount, mergedCount, surveyCount, citizenCount, unassignedCitizenCount, droneAICount,
    handleResetTriageData, handleSelectCase, handleToggleClusterItem, handleVerifyDefect,
    handleOpenRequestSurveyModal, handleConfirmRequestSurvey, handleNavigateFastTrack,
    handleToggleSelectReport, handleSelectAllReports, handleOpenLinkReportsModal,
    handleConfirmLinkReports, handleUnlinkReport, handleOpenTriageProject, handleConfirmTriageProject,
    handleOpenNoDefectModal, handleConfirmNoDefect, handleConclusionOutOfScope,
    handleResetConclusion, handleOpenPublishModal, handleConfirmPublishResult,
    handleExecuteMerge, handleBulkVerify, handleBulkNeedSurvey
  } = state

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <ReviewHeader
        basePath={basePath}
        isSupervisor={isSupervisor}
        cases={cases}
        pendingCount={pendingCount}
        selectedReportIds={selectedReportIds}
        selectedCase={selectedCase}
        onOpenLinkReportsModal={handleOpenLinkReportsModal}
        onNavigateFastTrack={handleNavigateFastTrack}
        showToast={showToast}
      />

      {/* 2. Quick Filter Tabs & Search Controls */}
      <ReviewFilterBar
        cases={cases}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        mergedCount={mergedCount}
        surveyCount={surveyCount}
        criticalCount={criticalCount}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        lineTypeFilter={lineTypeFilter}
        setLineTypeFilter={setLineTypeFilter}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        setSearchQuery={setSearchQuery}
        showToast={showToast}
      />

      {/* 3. BẢNG DANH SÁCH HỒ SƠ */}
      <div className="w-full">
        <ReviewCasesTable
          viewSourceMode={viewSourceMode}
          cases={cases}
          filteredCases={filteredCases}
          selectedCase={selectedCase}
          onSelectCase={handleSelectCase}
          selectedReportIds={selectedReportIds}
          onToggleSelectReport={handleToggleSelectReport}
          onSelectAllReports={handleSelectAllReports}
          collapseMergedRows={collapseMergedRows}
          setCollapseMergedRows={setCollapseMergedRows}
          expandedMasterIds={expandedMasterIds}
          onToggleExpandMaster={handleToggleExpandMaster}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenTriageProject={handleOpenTriageProject}
          onOpenLinkReportsModal={handleOpenLinkReportsModal}
          onUnlinkReport={handleUnlinkReport}
          onOpenMergeModal={(c) => {
            handleSelectCase(c)
            setIsMergeModalOpen(true)
          }}
          onResetTriageData={handleResetTriageData}
          onClearSelectedReports={() => setSelectedReportIds([])}
          onBulkVerify={handleBulkVerify}
          onBulkNeedSurvey={handleBulkNeedSurvey}
        />
      </div>

      {/* 4. MODAL HỒ SƠ THẨM ĐỊNH */}
      <ReviewDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        selectedCase={selectedCase}
        setSelectedCaseId={setSelectedCaseId}
        cases={cases}
        detailViewMode={detailViewMode}
        setDetailViewMode={setDetailViewMode}
        drawerMapContainerRef={drawerMapContainerRef}
        currentSeverity={currentSeverity}
        setCurrentSeverity={setCurrentSeverity}
        currentUrgency={currentUrgency}
        setCurrentUrgency={setCurrentUrgency}
        currentArea={currentArea}
        setCurrentArea={setCurrentArea}
        currentDepth={currentDepth}
        setCurrentDepth={setCurrentDepth}
        currentNotes={currentNotes}
        setCurrentNotes={setCurrentNotes}
        onVerifyDefect={handleVerifyDefect}
        onOpenNoDefectModal={handleOpenNoDefectModal}
        onConclusionOutOfScope={handleConclusionOutOfScope}
        onResetConclusion={handleResetConclusion}
        onOpenRequestSurveyModal={handleOpenRequestSurveyModal}
        onOpenPublishModal={handleOpenPublishModal}
        onNavigateFastTrack={handleNavigateFastTrack}
        onUnlinkReport={handleUnlinkReport}
        onOpenTriageProject={handleOpenTriageProject}
        onOpenGISModal={() => setIsGISModalOpen(true)}
        onOpenPhotoZoomModal={() => setIsPhotoZoomModalOpen(true)}
        onOpenMergeModal={(c) => {
          handleSelectCase(c)
          setIsMergeModalOpen(true)
        }}
        onToggleClusterItem={handleToggleClusterItem}
      />

      {/* 5. MODALS HUB */}
      <ReviewModals
        selectedCase={selectedCase}
        targetTriageCase={targetTriageCase}
        cases={cases}
        selectedReportIds={selectedReportIds}
        mockProjects={mockProjects}
        isMergeModalOpen={isMergeModalOpen}
        setIsMergeModalOpen={setIsMergeModalOpen}
        onExecuteMerge={handleExecuteMerge}
        isGISModalOpen={isGISModalOpen}
        setIsGISModalOpen={setIsGISModalOpen}
        modalMapType={modalMapType}
        setModalMapType={setModalMapType}
        modalMapContainerRef={modalMapContainerRef}
        isPhotoZoomModalOpen={isPhotoZoomModalOpen}
        setIsPhotoZoomModalOpen={setIsPhotoZoomModalOpen}
        isLinkReportsModalOpen={isLinkReportsModalOpen}
        setIsLinkReportsModalOpen={setIsLinkReportsModalOpen}
        linkMasterCaseId={linkMasterCaseId}
        setLinkMasterCaseId={setLinkMasterCaseId}
        linkAuditNotes={linkAuditNotes}
        setLinkAuditNotes={setLinkAuditNotes}
        onConfirmLinkReports={handleConfirmLinkReports}
        isTriageProjectModalOpen={isTriageProjectModalOpen}
        setIsTriageProjectModalOpen={setIsTriageProjectModalOpen}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        onConfirmTriageProject={handleConfirmTriageProject}
        isNoDefectModalOpen={isNoDefectModalOpen}
        setIsNoDefectModalOpen={setIsNoDefectModalOpen}
        noDefectReason={noDefectReason}
        setNoDefectReason={setNoDefectReason}
        onConfirmNoDefect={handleConfirmNoDefect}
        isPublishModalOpen={isPublishModalOpen}
        setIsPublishModalOpen={setIsPublishModalOpen}
        publishPublicNote={publishPublicNote}
        setPublishPublicNote={setPublishPublicNote}
        onConfirmPublishResult={handleConfirmPublishResult}
        isRequestSurveyModalOpen={isRequestSurveyModalOpen}
        setIsRequestSurveyModalOpen={setIsRequestSurveyModalOpen}
        surveyMode={surveyMode}
        setSurveyMode={setSurveyMode}
        surveyReason={surveyReason}
        setSurveyReason={setSurveyReason}
        surveyAssignedCrew={surveyAssignedCrew}
        setSurveyAssignedCrew={setSurveyAssignedCrew}
        surveySlaHours={surveySlaHours}
        setSurveySlaHours={setSurveySlaHours}
        onConfirmRequestSurvey={handleConfirmRequestSurvey}
      />
    </div>
  )
}

export default AIReviewInbox
