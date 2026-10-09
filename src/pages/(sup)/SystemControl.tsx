import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { AIModelsTab } from './system-control/AIModelsTab'
import { DefectCatalogTab } from './system-control/DefectCatalogTab'
import { RetentionLegalHoldTab } from './system-control/RetentionLegalHoldTab'
import { SystemControlHeader } from './system-control/SystemControlHeader'
import { CreateDeletionRequestModal } from './system-control/CreateDeletionRequestModal'
import { DeletionRequestDetailModal } from './system-control/DeletionRequestDetailModal'
import { ProjectRetentionDetailModal } from './system-control/ProjectRetentionDetailModal'
import { useSystemControlState } from './system-control/useSystemControlState'

export const SystemControl: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const s = useSystemControlState(user, isSupervisor)

  return (
    <div className="flex flex-col gap-5 max-w-[1720px] mx-auto w-full pb-16 bg-slate-50/50">
      {/* Thông báo thành công nổi lên */}
      {s.actionSuccessNotice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-800">
          <span className="material-symbols-outlined text-[18px] text-brand-gold">
            check_circle
          </span>
          <span>{s.actionSuccessNotice}</span>
        </div>
      )}

      {/* 1. Header chuyên biệt cho Lưu trữ hồ sơ & Phong tỏa pháp lý */}
      <SystemControlHeader
        isSupervisor={isSupervisor}
        onOpenCreateDeletion={() => s.setShowCreateDeletionRequestModal(true)}
      />

      {/* 2. Tabs Navigation (Chỉ hiển thị cho Supervisor khi cần chuyển sang AI Models hoặc Danh mục khiếm khuyết) */}
      {isSupervisor && (
        <div className="bg-white border border-slate-200 px-4 pt-2 rounded-xl shadow-xs flex items-center gap-2 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => s.setActiveTab('retention-legal-hold')}
            className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              s.activeTab === 'retention-legal-hold'
                ? 'text-slate-900 font-bold border-b-2 border-brand-gold'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                s.activeLegalHoldProject
                  ? 'text-rose-600'
                  : s.activeTab === 'retention-legal-hold'
                  ? 'text-brand-gold'
                  : 'text-slate-400'
              }`}
            >
              inventory_2
            </span>
            <span>Lưu trữ &amp; Phong tỏa pháp lý</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                s.activeLegalHoldProject
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {s.activeLegalHoldProject ? 'ĐANG BẬT' : 'BÌNH THƯỜNG'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => s.setActiveTab('ai-models')}
            className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              s.activeTab === 'ai-models'
                ? 'text-slate-900 font-bold border-b-2 border-brand-gold'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                s.activeTab === 'ai-models' ? 'text-brand-gold' : 'text-slate-400'
              }`}
            >
              psychology
            </span>
            <span>Mô hình AI &amp; Đánh giá</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                s.activeTab === 'ai-models'
                  ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
                  : 'bg-slate-100 text-slate-600 border-transparent'
              }`}
            >
              v2.4.1 Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => s.setActiveTab('defect-catalog')}
            className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              s.activeTab === 'defect-catalog'
                ? 'text-slate-900 font-bold border-b-2 border-brand-gold'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                s.activeTab === 'defect-catalog' ? 'text-brand-gold' : 'text-slate-400'
              }`}
            >
              fact_check
            </span>
            <span>Danh mục khiếm khuyết TCVN</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                s.activeTab === 'defect-catalog'
                  ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
                  : 'bg-slate-100 text-slate-600 border-transparent'
              }`}
            >
              {s.defectCatalog.length} quy tắc
            </span>
          </button>
        </div>
      )}

      {/* 3. Nội dung trang */}
      <div className="w-full">
        {s.activeTab === 'retention-legal-hold' && (
          <RetentionLegalHoldTab
            legalHoldProjects={s.legalHoldProjects}
            deletionRequests={s.deletionRequests}
            isSupervisor={isSupervisor}
            handleToggleLegalHold={s.handleToggleLegalHold}
            handleRejectDeletion={s.handleRejectDeletion}
            handleApprovePurge={s.handleApprovePurge}
            onViewDetail={s.handleViewDetail}
            onViewProjectDetail={s.handleViewProjectDetail}
          />
        )}

        {isSupervisor && s.activeTab === 'ai-models' && (
          <AIModelsTab />
        )}

        {isSupervisor && s.activeTab === 'defect-catalog' && (
          <DefectCatalogTab
            defectCatalog={s.defectCatalog}
            isSupervisor={isSupervisor}
          />
        )}
      </div>

      {/* 4. Modal tạo yêu cầu xóa dữ liệu (với cơ chế chặn tự động theo BR-45) */}
      <CreateDeletionRequestModal
        showCreateDeletionRequestModal={s.showCreateDeletionRequestModal}
        setShowCreateDeletionRequestModal={s.setShowCreateDeletionRequestModal}
        newDelProject={s.newDelProject}
        setNewDelProject={s.setNewDelProject}
        newDelDataType={s.newDelDataType}
        setNewDelDataType={s.setNewDelDataType}
        newDelSize={s.newDelSize}
        setNewDelSize={s.setNewDelSize}
        newDelJustification={s.newDelJustification}
        setNewDelJustification={s.setNewDelJustification}
        handleCreateDeletionSubmit={s.handleCreateDeletionSubmit}
        legalHoldProjects={s.legalHoldProjects}
      />

      {/* 5. Modal xem chi tiết yêu cầu xóa hồ sơ lưu trữ (GET /retention/deletion-requests/{requestId}) */}
      <DeletionRequestDetailModal
        request={s.selectedDeletionRequest}
        isOpen={s.showDetailModal}
        isSupervisor={isSupervisor}
        onClose={() => s.setShowDetailModal(false)}
        onApprove={s.handleApprovePurge}
        onReject={s.handleRejectDeletion}
      />

      {/* 6. Modal xem chi tiết hồ sơ lưu trữ & quyết định phong tỏa pháp lý của từng dự án */}
      <ProjectRetentionDetailModal
        project={s.selectedProjectForDetail}
        isOpen={s.showProjectDetailModal}
        onClose={() => s.setShowProjectDetailModal(false)}
        onOpenCreateDeletionForProject={s.handleOpenCreateDeletionForProject}
      />
    </div>
  )
}

export default SystemControl
