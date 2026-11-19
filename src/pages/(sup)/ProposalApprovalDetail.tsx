import { projectExportService, exportError } from '../../api/services/projectExportService'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
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
    loading,
    loadError,
    packageCode,
    packageName,
    routeDisplay,
    chainageDisplay,
    createdByName,
    createdAt,
    packageStatus,
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
    viewingPhotoItem,
    setViewingPhotoItem,
    isBatchApproveConfirmOpen,
    setIsBatchApproveConfirmOpen,
    toastMessage,
    setToastMessage,
    showToast,
    handleQuickApproveItem,
    handleBatchApproveAll,
    activeProjectId,
    activePackageId
  } = useProposalApprovalState(id)

  // Xuất hồ sơ theo gói: POST /projects/{p}/exports {kind:DOSSIER, repairPackageIds:[gói]} → poll SUCCEEDED → tải (BE bản mới, mục 12).
  const handleExportPackage = async () => {
    if (!activeProjectId || !activePackageId) { showToast('Chưa xác định dự án/gói để xuất hồ sơ.'); return }
    try {
      const created = await projectExportService.create(activeProjectId, { kind: 'DOSSIER', format: 'PDF', includeOriginalFiles: false, repairPackageIds: [activePackageId] })
      let job = created
      for (let i = 0; i < 60 && !['SUCCEEDED', 'FAILED'].includes(job.status); i++) { await new Promise((r) => setTimeout(r, 2000)); job = await projectExportService.detail(activeProjectId, created.id) }
      if (job.status !== 'SUCCEEDED') throw new Error(job.status === 'FAILED' ? `Máy chủ không tạo được hồ sơ (${job.errorCode || 'FAILED'}).` : 'Hồ sơ chưa hoàn tất sau 120 giây.')
      const file = await projectExportService.content(activeProjectId, created.id)
      const url = URL.createObjectURL(file.blob); const a = document.createElement('a'); a.href = url; a.download = file.fileName; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000)
      showToast(`Đã tạo và tải hồ sơ gói${job.completeness === 'PARTIAL' ? ' — chưa đầy đủ: ' + (job.missingSections || []).join(', ') : ''}.`)
    } catch (e: any) { showToast(exportError(e)) }
  }

  return (
    <div className="space-y-6 pb-20 text-[#1F2937] font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Icon name="check_circle" size={18} className="text-brand-gold shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {loadError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          Không đọc được gói sửa chữa từ máy chủ: {loadError}
        </p>
      )}
      {loading && <p role="status" className="text-xs text-slate-500">Đang đọc gói và hạng mục từ máy chủ...</p>}

      {/* Header section with Breadcrumb and Actions */}
      <ApprovalDetailHeader
        packageCode={packageCode}
        packageName={packageName}
        routeDisplay={routeDisplay}
        chainageDisplay={chainageDisplay}
        createdByName={createdByName}
        createdAt={createdAt}
        status={packageStatus}
        basePath={basePath}
        stats={stats}
        isSupervisor={isSupervisor}
        onNavigateHome={() => navigate(`${basePath}/dashboard`)}
        onNavigateProposals={() => navigate(`${basePath}/proposals`)}
        onOpenBatchApprove={() => setIsBatchApproveConfirmOpen(true)}
        onExportPdf={() => { void handleExportPackage() }}
        onOpenDispatch={() => navigate('/pm/repair-batches/assign')}
      />

      {/* Technical volume summary bar */}
      <div className="rounded-[20px] overflow-hidden border border-[#E2E5E9] bg-white shadow-2xs [&>section]:border-0 [&>section]:shadow-none [&>section]:rounded-none">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #047857 0%, #065F46 100%)' }} />
        <ApprovalStatsBar stats={stats} />
      </div>

      {/* Items table & filter toolbar */}
      <div className="rounded-[20px] overflow-hidden border border-[#E2E5E9] bg-white shadow-2xs [&>section]:border-0 [&>section]:shadow-none [&>section]:rounded-none">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C9A227 0%, #8C6D1F 100%)' }} />
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
          isSupervisor={isSupervisor}
        />
      </div>

      {/* Decision, Dispatch, Batch Approve, and Lightbox Modals */}
      <ApprovalModals
        packageCode={packageCode}
        stats={stats}
        onViewPhoto={(item) => setViewingPhotoItem(item)}
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
