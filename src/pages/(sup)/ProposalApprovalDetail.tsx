import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { ItemApprovalStatus, RepairItemDetail } from './proposal-approval/types'
import { ApprovalDetailHeader } from './proposal-approval/ApprovalDetailHeader'
import { ApprovalStatsBar } from './proposal-approval/ApprovalStatsBar'
import { ApprovalItemsTable } from './proposal-approval/ApprovalItemsTable'
import { ApprovalModals } from './proposal-approval/ApprovalModals'
import { useProposalApprovalState } from './proposal-approval/useProposalApprovalState'

export type { ItemApprovalStatus, RepairItemDetail }

export const ProposalApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Role detection
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const {
    packageCode,
    packageName,
    items,
    stats,
    filterTab,
    setFilterTab,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    displayedItems,
    activeModalItem,
    setActiveModalItem,
    modalFeedbackType,
    setModalFeedbackType,
    modalNotes,
    setModalNotes,
    modalDirectives,
    setModalDirectives,
    viewingPhotoItem,
    setViewingPhotoItem,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    dispatchDeadline,
    setDispatchDeadline,
    dispatchNotice,
    setDispatchNotice,
    isBatchApproveConfirmOpen,
    setIsBatchApproveConfirmOpen,
    toastMessage,
    setToastMessage,
    showToast,
    handleQuickApproveItem,
    handleOpenDecisionModal,
    handleSubmitDecisionModal,
    handleBatchApproveAll,
    handleCrewChange,
    handleConfirmDispatch
  } = useProposalApprovalState(id)

  return (
    <div className="space-y-6 pb-20 text-[#1F2937]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-brand-gold shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header section with Breadcrumb and Actions */}
      <ApprovalDetailHeader
        packageCode={packageCode}
        packageName={packageName}
        basePath={basePath}
        stats={stats}
        isSupervisor={isSupervisor}
        onNavigateHome={() => navigate(`${basePath}/dashboard`)}
        onNavigateProposals={() => navigate(`${basePath}/proposals`)}
        onOpenBatchApprove={() => setIsBatchApproveConfirmOpen(true)}
        onExportPdf={() => showToast(`Đang kết xuất hồ sơ thẩm duyệt gói [${packageCode}] sang tệp PDF tiêu chuẩn...`)}
        onOpenDispatch={() => setIsDispatchModalOpen(true)}
      />

      {/* Technical volume summary bar */}
      <ApprovalStatsBar stats={stats} />

      {/* Items table & filter toolbar */}
      <ApprovalItemsTable
        items={items}
        filteredItems={filteredItems}
        displayedItems={displayedItems}
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        stats={stats}
        onViewPhoto={(item) => setViewingPhotoItem(item)}
        onQuickApprove={handleQuickApproveItem}
        onOpenDecisionModal={handleOpenDecisionModal}
        onCrewChange={handleCrewChange}
        isSupervisor={isSupervisor}
      />

      {/* Decision, Dispatch, Batch Approve, and Lightbox Modals */}
      <ApprovalModals
        activeModalItem={activeModalItem}
        onCloseDecisionModal={() => setActiveModalItem(null)}
        modalFeedbackType={modalFeedbackType}
        setModalFeedbackType={setModalFeedbackType}
        modalNotes={modalNotes}
        setModalNotes={setModalNotes}
        modalDirectives={modalDirectives}
        setModalDirectives={setModalDirectives}
        onSubmitDecisionModal={handleSubmitDecisionModal}
        onViewPhoto={(item) => setViewingPhotoItem(item)}

        isDispatchModalOpen={isDispatchModalOpen}
        onCloseDispatchModal={() => setIsDispatchModalOpen(false)}
        packageCode={packageCode}
        items={items}
        stats={stats}
        dispatchDeadline={dispatchDeadline}
        setDispatchDeadline={setDispatchDeadline}
        dispatchNotice={dispatchNotice}
        setDispatchNotice={setDispatchNotice}
        onConfirmDispatch={handleConfirmDispatch}

        isBatchApproveConfirmOpen={isBatchApproveConfirmOpen}
        onCloseBatchApproveConfirm={() => setIsBatchApproveConfirmOpen(false)}
        onBatchApproveAll={handleBatchApproveAll}

        viewingPhotoItem={viewingPhotoItem}
        onCloseViewingPhoto={() => setViewingPhotoItem(null)}
      />
    </div>
  )
}
export default ProposalApprovalDetail
