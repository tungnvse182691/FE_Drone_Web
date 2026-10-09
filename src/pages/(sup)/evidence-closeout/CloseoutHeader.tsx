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
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* 1. BREADCRUMB & HEADER TITLE */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="space-y-1">
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
            <span className="text-slate-700 font-mono font-medium">
              {currentPackage?.code || 'PKG-2026'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-slate-900 font-medium">{currentItem.item_code}</span>
          </nav>

          <div className="flex flex-wrap items-baseline gap-2.5 pt-0.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sansation">
              {currentPackage ? `${currentPackage.code}: ${currentPackage.title}` : `Hồ sơ nghiệm thu: ${currentItem.defect_code}`}
            </h1>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-bold text-xs border border-slate-200">
              {currentItem.chainage}
            </span>
            {currentPackage?.case_code && (
              <span className="font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md text-xs font-semibold border border-amber-200">
                {currentPackage.case_code}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Dự án: <span className="font-medium text-slate-800">{currentPackage?.project_name || 'QL1A'}</span>
            {' • '}Đoạn tuyến: <span className="font-medium text-slate-800">{currentPackage?.chainage_display || currentItem.chainage}</span>
            {' • '}Đơn vị thi công: <span className="font-medium text-slate-800">{currentPackage?.contractor_name || currentItem.after_crew}</span>
          </p>
        </div>

        {/* Vai trò người dùng */}
        <div className="flex items-center gap-2 shrink-0 self-start xl:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700">
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
        {/* Hàng nút chuyển hạng mục */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mr-1">
            Hạng mục:
          </span>
          {caseItems.map((item) => {
            const isSelected = selectedItemId === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs font-semibold'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {item.status === 'ACCEPTED' && (
                  <span className="material-symbols-outlined text-[15px] text-[#2F9E44]">check_circle</span>
                )}
                {item.status === 'PENDING_INSPECTION' && (
                  <span className="material-symbols-outlined text-[15px] text-[#F59E0B]">schedule</span>
                )}
                {item.status === 'REWORK_REQUIRED' && (
                  <span className="material-symbols-outlined text-[15px] text-[#E5484D]">replay</span>
                )}
                <span>{item.item_code}</span>
              </button>
            )
          })}
        </div>

        {/* Tiến độ tổng hợp của gói */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto shrink-0">
          <span className="text-slate-600 font-medium">
            Tiến độ gói: <strong className="text-slate-900 font-sansation">{acceptedCount}/{caseItems.length}</strong> đạt
          </span>
          <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allItemsAccepted ? 'bg-[#2F9E44]' : 'bg-[#C9A227]'
              }`}
              style={{ width: `${Math.round((acceptedCount / (caseItems.length || 1)) * 100)}%` }}
            ></div>
          </div>
          {isCaseClosed && (
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-semibold">
              ĐÃ ĐÓNG GÓI
            </span>
          )}
        </div>
      </div>

      {/* 3. STATUS BAR & ACTION BUTTONS */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
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
