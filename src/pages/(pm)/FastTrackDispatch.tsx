import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { CheckCircle2, X } from 'lucide-react'

import { PolicySection } from './fast-track/PolicySection'
import { DispatchSection } from './fast-track/DispatchSection'
import { FastTrackModals } from './fast-track/FastTrackModals'
import { FastTrackHeader } from './fast-track/FastTrackHeader'
import { FastTrackBanner } from './fast-track/FastTrackBanner'
import { useFastTrackState } from './fast-track/useFastTrackState'

export type { RouteConfig } from './fast-track/types'
export { ROUTE_CONFIGS } from './fast-track/mockData'

export const FastTrackDispatch: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const {
    autoDispatchedSourceCase,
    setAutoDispatchedSourceCase,
    currentPolicy,
    policyHistory,
    auditLogs,
    formVersionName,
    setFormVersionName,
    formMaxArea,
    setFormMaxArea,
    formMaxDepth,
    setFormMaxDepth,
    formSlaHours,
    setFormSlaHours,
    formMaxPerimeter,
    setFormMaxPerimeter,
    formPolicyNote,
    setFormPolicyNote,
    handleApplyPolicy,
    handleActivateDraft,
    crewTeams,
    defects,
    selectedDefectIds,
    setSelectedDefectIds,
    workMode,
    routeFilter,
    crewFilter,
    setCrewFilter,
    statusFilter,
    setStatusFilter,
    isPolicyModalOpen,
    setIsPolicyModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    selectedDispatchCrew,
    setSelectedDispatchCrew,
    dispatchNotes,
    setDispatchNotes,
    detailDefect,
    setDetailDefect,
    toastMessage,
    setToastMessage,
    showToast,
    currentRouteConfig,
    handleRouteChange,
    mapContainerRef,
    mapLayer,
    setMapLayer,
    filteredDefects,
    selectedItems,
    hasViolationItem,
    surveyDistanceM,
    handleToggleSelect,
    handleSelectAll,
    handleChangeWorkMode,
    handleAssignCrew,
    handleDispatchBatch,
    handleRepairDirect,
    handleEmergencyDispatch,
    handleExecuteDispatch
  } = useFastTrackState()

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. BREADCRUMB & HEADER SECTION */}
      <FastTrackHeader
        basePath={basePath}
        onNavigateDashboard={() => navigate(`${basePath}/dashboard`)}
        onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
        onScrollToDispatch={() => {
          const el = document.getElementById('dispatch-table-section')
          el?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* 2. SECTION A: QUẢN LÝ PHIÊN BẢN CHÍNH SÁCH FAST TRACK */}
      <PolicySection
        currentPolicy={currentPolicy}
        policyHistory={policyHistory}
        onActivateDraft={handleActivateDraft}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* Banner thông báo tự động điều phối khiếm khuyết từ Triage Inbox */}
      <FastTrackBanner
        sourceCase={autoDispatchedSourceCase}
        onClose={() => setAutoDispatchedSourceCase(null)}
      />

      {/* 3. SECTION B: ĐIỀU PHỐI & GIAO VIỆC ĐO ĐẠC HIỆN TRƯỜNG */}
      <DispatchSection
        defects={defects}
        filteredDefects={filteredDefects}
        selectedDefectIds={selectedDefectIds}
        workMode={workMode}
        routeFilter={routeFilter}
        crewFilter={crewFilter}
        statusFilter={statusFilter}
        currentPolicy={currentPolicy}
        currentRouteConfig={currentRouteConfig}
        mapLayer={mapLayer}
        mapContainerRef={mapContainerRef}
        hasViolationItem={hasViolationItem}
        surveyDistanceM={surveyDistanceM}
        selectedItems={selectedItems}
        handleChangeWorkMode={handleChangeWorkMode}
        handleRouteChange={handleRouteChange}
        setCrewFilter={setCrewFilter}
        setStatusFilter={setStatusFilter}
        handleSelectAll={handleSelectAll}
        handleToggleSelect={handleToggleSelect}
        handleAssignCrew={handleAssignCrew}
        setDetailDefect={setDetailDefect}
        setMapLayer={setMapLayer}
        setSelectedDefectIds={setSelectedDefectIds}
        showToast={showToast}
        handleDispatchBatch={handleDispatchBatch}
        handleRepairDirect={handleRepairDirect}
        handleEmergencyDispatch={handleEmergencyDispatch}
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
        formSlaHours={formSlaHours}
        setFormSlaHours={setFormSlaHours}
        formMaxPerimeter={formMaxPerimeter}
        setFormMaxPerimeter={setFormMaxPerimeter}
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
        workMode={workMode}
        currentRouteConfig={currentRouteConfig}
        selectedDefectIds={selectedDefectIds}
        surveyDistanceM={surveyDistanceM}
        selectedItems={selectedItems}
        selectedDispatchCrew={selectedDispatchCrew}
        setSelectedDispatchCrew={setSelectedDispatchCrew}
        crewTeams={crewTeams}
        dispatchNotes={dispatchNotes}
        setDispatchNotes={setDispatchNotes}
        handleExecuteDispatch={handleExecuteDispatch}
      />
    </div>
  )
}
