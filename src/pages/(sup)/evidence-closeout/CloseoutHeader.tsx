import React from 'react'
import { CaseItem } from './types'
import { StatusBar } from './StatusBar'
import { ActionButtons } from './ActionButtons'

export interface CloseoutHeaderProps {
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
  onOpenPublishModal: () => void
  onOpenCloseCaseModal: () => void
  onNavigateHome: () => void
  onNavigateProposals: () => void
}

export const CloseoutHeader: React.FC<CloseoutHeaderProps> = ({
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
  onOpenPublishModal,
  onOpenCloseCaseModal,
  onNavigateHome,
  onNavigateProposals
}) => {
  return (
    <>
      {/* TOP CONTEXT BAR & BREADCRUMB */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Breadcrumb & Identity */}
          <div className="flex flex-col gap-1.5">
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
                Gói đề xuất sửa chữa
              </button>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span className="text-slate-900 font-medium">Nghiệm thu hồ sơ {currentItem.defect_code}</span>
            </nav>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sansation">
                Hồ sơ nghiệm thu kỹ thuật: {currentItem.defect_code}
              </h1>
              <span className="font-mono bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-800 font-bold text-xs border border-slate-200">
                {currentItem.chainage}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Dự án: <span className="font-medium text-slate-700">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</span> • Gói đề xuất: <span className="font-medium text-slate-700">PKG-2026-08</span> • Hạng mục: <span className="font-medium text-[#C9A227]">{currentItem.item_code}</span> • Phân đoạn: Thừa Thiên Huế - Đà Nẵng
            </p>
          </div>

          {/* Vai trò xác thực của người dùng (Tĩnh, không có nút switch role) */}
          <div className="flex items-center gap-2 shrink-0">
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

        {/* Thanh trạng thái & Hành động xử lý */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <StatusBar currentItem={currentItem} />
          <ActionButtons
            currentItem={currentItem}
            isSupervisorView={isSupervisorView}
            isPMView={isPMView}
            onOpenExportModal={onOpenExportModal}
            onOpenReworkModal={onOpenReworkModal}
            onAcceptItem={onAcceptItem}
            onPMCloseFastTrack={onPMCloseFastTrack}
            onPMSubmitToSupervisor={onPMSubmitToSupervisor}
            onOpenPublishModal={onOpenPublishModal}
          />
        </div>
      </section>

      {/* COMPOSITE CASE PANEL (Vụ việc phức hợp liên quan) */}
      <section className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-[#C9A227]">layers</span>
              <h2 className="font-bold text-base text-slate-900 font-sansation">
                Vụ việc phức hợp: #CASE-2026-0842
              </h2>
              {isCaseClosed ? (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-medium border border-slate-700">
                  Hồ sơ đã đóng tổng thể
                </span>
              ) : allItemsAccepted ? (
                <span className="px-2.5 py-0.5 rounded-md bg-[#E9F7EC] text-[#2F9E44] text-[11px] font-medium border border-[#C3E6CB]">
                  Đã hoàn thành {acceptedCount}/{caseItems.length} hạng mục (Đủ điều kiện đóng)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-[#FEF3E2] text-[#B45309] text-[11px] font-medium border border-[#FDE68A]">
                  Đã hoàn thành {acceptedCount}/{caseItems.length} hạng mục
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Đoạn Km 1024+350 - Km 1024+450 (Gói PKG-2026-08). Nghiệm thu toàn bộ các hạng mục để đóng tổng thể vụ việc.
            </p>

            {/* Danh sách hạng mục thành phần chuyển đổi nhanh */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {caseItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${
                    selectedItemId === item.id
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {item.status === 'ACCEPTED' ? (
                    <span className="material-symbols-outlined text-[15px] text-[#2F9E44]">check_circle</span>
                  ) : item.status === 'REWORK_REQUIRED' ? (
                    <span className="material-symbols-outlined text-[15px] text-[#E5484D]">error</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  )}
                  <span>
                    {item.item_code}: {item.title} ({item.track_type === 'FAST_TRACK' ? 'Fast Track' : 'Approval'})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nút Đóng tổng thể vụ việc (Chỉ dành cho Supervisor) */}
          <div className="flex items-center gap-2 shrink-0">
            {isSupervisorView ? (
              <button
                onClick={onOpenCloseCaseModal}
                disabled={!allItemsAccepted || isCaseClosed}
                type="button"
                className={`px-3.5 h-9 rounded-md font-medium text-xs shadow-xs transition flex items-center gap-1.5 ${
                  isCaseClosed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : allItemsAccepted
                    ? 'border border-[#C9A227] text-[#C9A227] bg-amber-50 hover:bg-amber-100 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCaseClosed ? 'lock' : 'task_alt'}
                </span>
                <span>
                  {isCaseClosed ? 'Vụ việc đã đóng' : 'Đóng tổng thể vụ việc'}
                </span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                * Thẩm quyền Supervisor đóng tổng thể hồ sơ
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
export default CloseoutHeader
