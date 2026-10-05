import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { ProposalHeader } from './repair-proposals/ProposalHeader'
import { ProposalStats } from './repair-proposals/ProposalStats'
import { ProposalTable } from './repair-proposals/ProposalTable'
import { ProposalModals } from './repair-proposals/ProposalModals'
import { useRepairProposalsState } from './repair-proposals/useRepairProposalsState'
import { AVAILABLE_ROUTES, DEFECTS_BY_SEGMENT } from './repair-proposals/mockData'
import type {
  ProposalWorkPackage,
  UnassignedDefectItem,
  RouteSegmentOption,
  RouteOption,
} from './repair-proposals/types'

// Re-export types and constants for 100% backward-compatibility
export type {
  ProposalWorkPackage,
  UnassignedDefectItem,
  RouteSegmentOption,
  RouteOption,
}
export { AVAILABLE_ROUTES, DEFECTS_BY_SEGMENT }

export const RepairProposals: React.FC = () => {
  const {
    isSupervisor,
    isPM,
    basePath,
    packages,
    searchTerm,
    setSearchTerm,
    activeFilterTab,
    handleTabChange,
    isPDFPreviewModalOpen,
    setIsPDFPreviewModalOpen,
    toastMessage,
    setToastMessage,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    advRoute,
    setAdvRoute,
    advScale,
    setAdvScale,
    advContractor,
    setAdvContractor,
    selectedPackageForDetail,
    setSelectedPackageForDetail,
    showToast,
    isCreateModalOpen,
    setIsCreateModalOpen,
    formRouteId,
    formSegmentId,
    formPackageName,
    setFormPackageName,
    formContractor,
    setFormContractor,
    formDurationDays,
    setFormDurationDays,
    formTechnicalMethod,
    setFormTechnicalMethod,
    currentRoute,
    currentRouteSegments,
    currentSegment,
    unassignedDefects,
    handleRouteChange,
    handleSegmentChange,
    modalCalculations,
    handleToggleDefect,
    handleSaveDraft,
    handleSubmitDraftPackage,
    handleDeleteDraft,
    handleQuickApprove,
    stats,
    filteredPackages,
    paginatedPackages,
  } = useRepairProposalsState()

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. WORKSPACE HEADER & BREADCRUMB */}
      <ProposalHeader
        basePath={basePath}
        totalPackagesCount={packages.length}
        isPM={isPM}
        onOpenPDFPreviewModal={() => setIsPDFPreviewModalOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 2. STATS SUMMARY CARDS */}
      <ProposalStats
        stats={stats}
        activeFilterTab={activeFilterTab}
        onTabChange={handleTabChange}
      />

      {/* 3. PACKAGES TABLE & ACTION HUB */}
      <ProposalTable
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setCurrentPage(1)
        }}
        activeFilterTab={activeFilterTab}
        onTabChange={handleTabChange}
        stats={stats}
        packages={packages}
        paginatedPackages={paginatedPackages}
        filteredPackages={filteredPackages}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onSetPage={setCurrentPage}
        basePath={basePath}
        isSupervisor={isSupervisor}
        isPM={isPM}
        onSubmitDraft={handleSubmitDraftPackage}
        onDeleteDraft={handleDeleteDraft}
        onQuickApprove={handleQuickApprove}
        showToast={showToast}
        advRoute={advRoute}
        onRouteFilterChange={setAdvRoute}
        advScale={advScale}
        onScaleFilterChange={setAdvScale}
        advContractor={advContractor}
        onContractorFilterChange={setAdvContractor}
        onResetFilters={() => {
          setAdvRoute('ALL')
          setAdvScale('ALL')
          setAdvContractor('ALL')
          setCurrentPage(1)
          showToast('Đã đặt lại tất cả bộ lọc.')
        }}
      />

      {/* 4. MODALS HUB */}
      <ProposalModals
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        formPackageName={formPackageName}
        setFormPackageName={setFormPackageName}
        formRouteId={formRouteId}
        handleRouteChange={handleRouteChange}
        availableRoutes={AVAILABLE_ROUTES}
        formSegmentId={formSegmentId}
        handleSegmentChange={handleSegmentChange}
        currentRouteSegments={currentRouteSegments}
        currentSegment={currentSegment}
        currentRoute={currentRoute}
        formContractor={formContractor}
        setFormContractor={setFormContractor}
        formDurationDays={formDurationDays}
        setFormDurationDays={setFormDurationDays}
        formTechnicalMethod={formTechnicalMethod}
        setFormTechnicalMethod={setFormTechnicalMethod}
        unassignedDefects={unassignedDefects}
        handleToggleDefect={handleToggleDefect}
        modalCalculations={modalCalculations}
        handleSaveDraft={handleSaveDraft}
        isPDFPreviewModalOpen={isPDFPreviewModalOpen}
        setIsPDFPreviewModalOpen={setIsPDFPreviewModalOpen}
        packages={packages}
        showToast={showToast}
        selectedPackageForDetail={selectedPackageForDetail}
        setSelectedPackageForDetail={setSelectedPackageForDetail}
        isSupervisor={isSupervisor}
        isPM={isPM}
        handleQuickApprove={handleQuickApprove}
        handleSubmitDraftPackage={handleSubmitDraftPackage}
      />
    </div>
  )
}
