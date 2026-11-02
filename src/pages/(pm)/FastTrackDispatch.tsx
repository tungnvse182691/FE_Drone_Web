import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { Icon } from '../../components/ui/Icon'

import { PolicySection } from './fast-track/PolicySection'
import { DispatchSection } from './fast-track/DispatchSection'
import { FastTrackModals } from './fast-track/FastTrackModals'
import { FastTrackHeader } from './fast-track/FastTrackHeader'
import { RoadCoverageConfirmModal } from './fast-track/RoadCoverageConfirmModal'
import { useFastTrackState } from './fast-track/useFastTrackState'

export const FastTrackDispatch: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const {
    projects,
    selectedProjectId,
    handleProjectChange,
    toastMessage,
    setToastMessage,
    showToast,
    // Policy states
    currentPolicy,
    policyHistory,
    auditLogs,
    roadCoverage,
    isRoadCoverageModalOpen,
    setIsRoadCoverageModalOpen,
    handleConfirmRoadCoverage,
    formVersionName,
    setFormVersionName,
    formMaxArea,
    setFormMaxArea,
    formMaxDepth,
    setFormMaxDepth,
    formPolicyNote,
    setFormPolicyNote,
    isPolicyModalOpen,
    setIsPolicyModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    handleApplyPolicy,
    handleActivateDraft,
    // Dispatch states
    crewTeams,
    defects,
    selectedDefectIds,
    setSelectedDefectIds,
    crewFilter,
    setCrewFilter,
    statusFilter,
    setStatusFilter,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    selectedDispatchCrew,
    setSelectedDispatchCrew,
    dispatchNotes,
    setDispatchNotes,
    detailDefect,
    setDetailDefect,
    filteredDefects,
    selectedItems,
    hasViolationItem,
    handleToggleSelect,
    handleSelectAll,
    handleRemoveViolationItems,
    handleAssignCrew,
    handleExecuteDispatch,
    coverageError,
    isSubmittingCoverage
  } = useFastTrackState(isSupervisor)

  return (
    <div className="space-y-6">
      {/* Toast Notification (z-[9999] để luôn nổi trên tất cả các Modal) */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 ${
          toastMessage.toLowerCase().includes('lỗi')
            ? 'bg-red-950 text-white border-red-800'
            : 'bg-slate-900 text-white border-slate-700'
        }`}>
          <Icon
            name={toastMessage.toLowerCase().includes('lỗi') ? 'error' : 'check_circle'}
            size={20}
            className={toastMessage.toLowerCase().includes('lỗi') ? 'text-red-400 shrink-0' : 'text-emerald-400 shrink-0'}
          />
          <span className="text-xs font-medium max-w-md break-words">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-1">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. BREADCRUMB & HEADER SECTION */}
      <FastTrackHeader
        basePath={basePath}
        isSupervisor={isSupervisor}
        onNavigateDashboard={() => navigate(`${basePath}/dashboard`)}
        onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
        onScrollToDispatch={() => {
          const el = document.getElementById('dispatch-table-section')
          el?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* 2. SECTION A: QUY CHUẨN CHÍNH SÁCH XỬ LÝ NHANH ÁP DỤNG & ĐỘ PHỦ TUYẾN (API-175, API-176) */}
      <PolicySection
        currentPolicy={currentPolicy}
        policyHistory={policyHistory}
        auditLogs={auditLogs}
        isSupervisor={isSupervisor}
        roadCoverage={roadCoverage}
        onOpenRoadCoverageModal={() => setIsRoadCoverageModalOpen(true)}
        onActivateDraft={handleActivateDraft}
        onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
      />

      {/* 3. SECTION B: ĐIỀU PHỐI & THEO DÕI KHIẾM KHUYẾT THỰC TẾ TRONG CSDL */}
      <DispatchSection
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={handleProjectChange}
        crews={crewTeams}
        defects={defects}
        filteredDefects={filteredDefects}
        selectedDefectIds={selectedDefectIds}
        crewFilter={crewFilter}
        statusFilter={statusFilter}
        currentPolicy={currentPolicy}
        hasViolationItem={hasViolationItem}
        selectedItems={selectedItems}
        setCrewFilter={setCrewFilter}
        setStatusFilter={setStatusFilter}
        handleSelectAll={handleSelectAll}
        handleToggleSelect={handleToggleSelect}
        handleAssignCrew={handleAssignCrew}
        setDetailDefect={setDetailDefect}
        setSelectedDefectIds={setSelectedDefectIds}
        showToast={showToast}
        onRemoveViolationItems={handleRemoveViolationItems}
        onNavigateProposals={() => {
          showToast('⚡ Chuyển sang trang Gói sửa chữa để gom đợt thi công trình Giám sát duyệt!')
          navigate(`${basePath}/proposals`)
        }}
        onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
        isSupervisor={isSupervisor}
      />

      {/* MODALS */}
      <FastTrackModals
        isPolicyModalOpen={isPolicyModalOpen}
        setIsPolicyModalOpen={setIsPolicyModalOpen}
        currentPolicy={currentPolicy}
        formVersionName={formVersionName}
        setFormVersionName={setFormVersionName}
        formMaxArea={formMaxArea}
        setFormMaxArea={setFormMaxArea}
        formMaxDepth={formMaxDepth}
        setFormMaxDepth={setFormMaxDepth}
        formPolicyNote={formPolicyNote}
        setFormPolicyNote={setFormPolicyNote}
        handleApplyPolicy={handleApplyPolicy}
        isAuditModalOpen={isAuditModalOpen}
        setIsAuditModalOpen={setIsAuditModalOpen}
        auditLogs={auditLogs}
        detailDefect={detailDefect}
        setDetailDefect={setDetailDefect}
        isDispatchModalOpen={isDispatchModalOpen}
        setIsDispatchModalOpen={setIsDispatchModalOpen}
        selectedDefectIds={selectedDefectIds}
        selectedItems={selectedItems}
        selectedDispatchCrew={selectedDispatchCrew}
        setSelectedDispatchCrew={setSelectedDispatchCrew}
        crewTeams={crewTeams}
        dispatchNotes={dispatchNotes}
        setDispatchNotes={setDispatchNotes}
        handleExecuteDispatch={handleExecuteDispatch}
      />

      {/* Modal Phê duyệt độ phủ tuyến đường bảo hành (API-176 - SUP-08) */}
      {roadCoverage && (
        <RoadCoverageConfirmModal
          isOpen={isRoadCoverageModalOpen}
          onClose={() => setIsRoadCoverageModalOpen(false)}
          roadCoverage={roadCoverage}
          onConfirm={handleConfirmRoadCoverage}
          errorMessage={coverageError}
          isSubmitting={isSubmittingCoverage}
        />
      )}
    </div>
  )
}
