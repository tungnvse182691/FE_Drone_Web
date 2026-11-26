import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { DefectCatalogTab } from './system-control/DefectCatalogTab'
import { RetentionLegalHoldTab } from './system-control/RetentionLegalHoldTab'
import { SystemControlHeader } from './system-control/SystemControlHeader'
import { ProjectRetentionDetailModal } from './system-control/ProjectRetentionDetailModal'
import { LegalHoldModal } from './system-control/LegalHoldModal'
import { useSystemControlState } from './system-control/useSystemControlState'

export const SystemControl: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER
  const canSeeTabs = isSupervisor || isPM

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
      />

      {/* 2. Tabs Navigation (Chỉ hiển thị cho Supervisor khi cần chuyển sang AI Models hoặc Danh mục khiếm khuyết) */}
      {canSeeTabs && (
        <div className="bg-white border-[1.5px] border-[#E2E5E9] px-4 pt-2 rounded-[20px] shadow-2xs flex items-center gap-2 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => s.setActiveTab('retention-legal-hold')}
            className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              s.activeTab === 'retention-legal-hold'
                ? 'text-slate-900 font-bold border-b-2 border-[#C9A227]'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                s.activeLegalHoldProject
                  ? 'text-rose-600'
                  : s.activeTab === 'retention-legal-hold'
                  ? 'text-[#C9A227]'
                  : 'text-slate-400'
              }`}
            >
              inventory_2
            </span>
            <span>Lưu trữ &amp; Phong tỏa pháp lý</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 ${
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
            onClick={() => s.setActiveTab('defect-catalog')}
            className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              s.activeTab === 'defect-catalog'
                ? 'text-slate-900 font-bold border-b-2 border-[#C9A227]'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                s.activeTab === 'defect-catalog' ? 'text-[#C9A227]' : 'text-slate-400'
              }`}
            >
              fact_check
            </span>
            <span>Danh mục khiếm khuyết TCVN</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 ${
                s.activeTab === 'defect-catalog'
                  ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
                  : 'bg-slate-100 text-slate-600 border-transparent'
              }`}
            >
              {isPM ? (s.defectCatalogLoading || s.defectCatalogError ? '—' : `${s.defectCatalog.length} quy tắc`) : '—'}
            </span>
          </button>
        </div>
      )}

      {/* 3. Nội dung trang */}
      <div className="w-full">
        {s.activeTab === 'retention-legal-hold' && (
          <RetentionLegalHoldTab
            legalHoldProjects={s.legalHoldProjects}
            isSupervisor={isSupervisor}
            handleToggleLegalHold={s.handleToggleLegalHold}
            onOpenLegalHoldModal={s.handleOpenLegalHoldModal}
            onViewProjectDetail={s.handleViewProjectDetail}
          />
        )}

        {canSeeTabs && s.activeTab === 'defect-catalog' && (
          <DefectCatalogTab
            defectCatalog={s.defectCatalog}
            loading={s.defectCatalogLoading}
            error={s.defectCatalogError}
            isPM={isPM}
          />
        )}
      </div>

      {/* 6. Modal xem chi tiết hồ sơ lưu trữ & quyết định phong tỏa pháp lý của từng dự án */}
      <ProjectRetentionDetailModal
        project={s.selectedProjectForDetail}
        isOpen={s.showProjectDetailModal}
        onClose={() => s.setShowProjectDetailModal(false)}
      />

      {/* 7. Modal thiết lập / gỡ bỏ phong tỏa pháp lý (Legal Hold - QT14, BR-45) */}
      <LegalHoldModal
        isOpen={s.showLegalHoldModal}
        project={s.projectToSetLegalHold}
        onClose={() => s.setShowLegalHoldModal(false)}
        onConfirm={s.handleConfirmLegalHold}
      />
    </div>
  )
}

export default SystemControl
