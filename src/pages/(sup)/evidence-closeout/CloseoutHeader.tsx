import React from 'react'
import { CaseItem } from './types'
import { StatusBar } from './StatusBar'
import { ActionButtons } from './ActionButtons'
import { AcceptancePackage } from '../../../api/services/acceptanceService'

export interface CloseoutHeaderProps {
  currentPackage: AcceptancePackage | null
  currentItem: CaseItem
  caseItems: CaseItem[]
  selectedItemId: string
  setSelectedItemId: (id: string) => void
  isSupervisorView: boolean
  isPMView: boolean
  basePath: string
  isCaseClosed: boolean
  allItemsAccepted: boolean
  acceptedCount: number
  onOpenExportModal: () => void
  onOpenReworkModal: () => void
  onAcceptItem: () => void
  onPMCloseFastTrack: () => void
  onPMSubmitToSupervisor: () => void
  onOpenCloseCaseModal: () => void
  onNavigateHome: () => void
  onNavigateProposals: () => void
}

export const CloseoutHeader: React.FC<CloseoutHeaderProps> = ({
  currentPackage,
  currentItem,
  caseItems,
  selectedItemId,
  setSelectedItemId,
  isSupervisorView,
  isPMView,
  basePath: _basePath,
  isCaseClosed,
  allItemsAccepted,
  acceptedCount,
  onOpenExportModal,
  onOpenReworkModal,
  onAcceptItem,
  onPMCloseFastTrack,
  onPMSubmitToSupervisor,
  onOpenCloseCaseModal,
  onNavigateHome,
  onNavigateProposals
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
      {/* 1. BREADCRUMB & HEADER TITLE */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              onClick={onNavigateHome}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <button
              onClick={onNavigateProposals}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Nghiệm thu công trình
            </button>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-slate-700 font-mono">
              {currentPackage?.code || 'PKG-2026'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-slate-900 font-medium">{currentItem.item_code}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-sansation">
              {currentPackage ? `${currentPackage.code}: ${currentPackage.title}` : `Hồ sơ nghiệm thu: ${currentItem.defect_code}`}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              {currentItem.chainage}
            </span>
            {currentPackage?.case_code && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 font-medium">
                {currentPackage.case_code}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Dự án: <strong className="font-medium text-slate-800">{currentPackage?.project_name || 'QL1A'}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Đoạn tuyến: <strong className="font-medium text-slate-800">{currentPackage?.chainage_display || currentItem.chainage}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Đơn vị thi công: <strong className="font-medium text-slate-800">{currentPackage?.contractor_name || currentItem.after_crew}</strong></span>
          </p>
        </div>

        {/* Vai trò người dùng */}
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F8F9FA] border border-slate-200 text-slate-700">
            <span className="material-symbols-outlined text-[16px] text-[#C9A227]">
              {isSupervisorView ? 'verified_user' : 'engineering'}
            </span>
            <span>
              {isSupervisorView ? 'Kỹ sư Giám sát' : 'Chỉ huy trưởng (PM)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ITEM SELECTOR TAB STRIP & OVERALL PROGRESS */}
      <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Hàng tab chuyển hạng mục tối giản */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mr-1">
            Hạng mục:
          </span>
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#F8F9FA] border border-slate-200 gap-1">
            {caseItems.map((item) => {
              const isSelected = selectedItemId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  {item.status === 'ACCEPTED' && (
                    <span className="w-2 h-2 rounded-full bg-[#2F9E44]"></span>
                  )}
                  {item.status === 'PENDING_INSPECTION' && (
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                  )}
                  {item.status === 'REWORK_REQUIRED' && (
                    <span className="w-2 h-2 rounded-full bg-[#E5484D]"></span>
                  )}
                  <span>{item.item_code}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tiến độ tổng hợp của gói */}
        <div className="flex items-center gap-2.5 text-xs self-start md:self-auto shrink-0">
          <span className="text-slate-500 font-medium">
            Tiến độ gói: <strong className="text-slate-900 font-sansation">{acceptedCount}/{caseItems.length}</strong> đạt
          </span>
          <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allItemsAccepted ? 'bg-[#2F9E44]' : 'bg-[#C9A227]'
              }`}
              style={{ width: `${Math.round((acceptedCount / (caseItems.length || 1)) * 100)}%` }}
            ></div>
          </div>
          {isCaseClosed && (
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-semibold tracking-wider">
              ĐÃ ĐÓNG GÓI
            </span>
          )}
        </div>
      </div>

      {/* 3. STATUS BAR & ACTION BUTTONS (Minimalist Bar) */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <StatusBar currentItem={currentItem} />
        <ActionButtons
          currentItem={currentItem}
          isSupervisorView={isSupervisorView}
          isPMView={isPMView}
          allItemsAccepted={allItemsAccepted}
          isCaseClosed={isCaseClosed}
          onOpenExportModal={onOpenExportModal}
          onOpenReworkModal={onOpenReworkModal}
          onAcceptItem={onAcceptItem}
          onPMCloseFastTrack={onPMCloseFastTrack}
          onPMSubmitToSupervisor={onPMSubmitToSupervisor}
          onOpenCloseCaseModal={onOpenCloseCaseModal}
        />
      </div>
    </section>
  )
}
export default CloseoutHeader
