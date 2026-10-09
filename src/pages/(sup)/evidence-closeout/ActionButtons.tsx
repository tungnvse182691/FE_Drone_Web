import React from 'react'
import { CaseItem } from './types'

export interface ActionButtonsProps {
  currentItem: CaseItem
  isSupervisorView: boolean
  isPMView: boolean
  allItemsAccepted?: boolean
  isCaseClosed?: boolean
  onOpenExportModal: () => void
  onOpenReworkModal: () => void
  onAcceptItem: () => void
  onPMCloseFastTrack: () => void
  onPMSubmitToSupervisor: () => void
  onOpenCloseCaseModal?: () => void
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentItem,
  isSupervisorView,
  isPMView,
  allItemsAccepted = false,
  isCaseClosed = false,
  onOpenExportModal,
  onOpenReworkModal,
  onAcceptItem,
  onPMCloseFastTrack,
  onPMSubmitToSupervisor,
  onOpenCloseCaseModal
}) => {
  return (
    <div className="flex items-center flex-wrap gap-2">
      {/* Nút Xuất Hồ Sơ Bằng Chứng RPT-07 */}
      <button
        onClick={onOpenExportModal}
        type="button"
        className="px-3 h-8 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px] text-slate-600">download</span>
        <span>Xuất hồ sơ</span>
      </button>

      {/* SUPERVISOR ACTIONS */}
      {isSupervisorView && (
        <>
          {currentItem.status !== 'ACCEPTED' && (
            <button
              onClick={onOpenReworkModal}
              type="button"
              className="px-3 h-8 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-rose-600">replay</span>
              <span>Yêu cầu sửa lại</span>
            </button>
          )}

          {currentItem.status !== 'ACCEPTED' ? (
            <button
              onClick={onAcceptItem}
              type="button"
              className="px-3.5 h-8 font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#8C6D1F] text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Chấp thuận nghiệm thu</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span>Đã nghiệm thu đạt</span>
            </span>
          )}

          {/* Nút Đóng đợt thi công cho Giám sát khi 100% đạt */}
          {allItemsAccepted && !isCaseClosed && onOpenCloseCaseModal && (
            <button
              onClick={onOpenCloseCaseModal}
              type="button"
              className="px-3.5 h-8 bg-[#2D3748] hover:bg-[#1A1D20] text-white font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">lock</span>
              <span>Đóng đợt thi công</span>
            </button>
          )}
        </>
      )}

      {/* PROJECT MANAGER ACTIONS */}
      {isPMView && (
        <>
          {currentItem.track_type === 'FAST_TRACK' ? (
            <>
              {currentItem.status !== 'ACCEPTED' ? (
                <>
                  <button
                    onClick={onOpenReworkModal}
                    type="button"
                    className="px-3 h-8 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-rose-600">replay</span>
                    <span>Yêu cầu sửa lại</span>
                  </button>
                  <button
                    onClick={onPMCloseFastTrack}
                    type="button"
                    className="px-3.5 h-8 font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#8C6D1F] text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>Chấp thuận &amp; Đóng Fast Track</span>
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Fast Track đã đóng (BR-25)</span>
                </span>
              )}
            </>
          ) : (
            <>
              {currentItem.status !== 'ACCEPTED' && (
                <button
                  onClick={onOpenReworkModal}
                  type="button"
                  className="px-3 h-8 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-600">replay</span>
                  <span>Yêu cầu sửa lại</span>
                </button>
              )}

              {currentItem.status !== 'ACCEPTED' ? (
                <button
                  onClick={onPMSubmitToSupervisor}
                  type="button"
                  className="px-3.5 h-8 bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium text-xs rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Trình Giám sát nghiệm thu</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Giám sát đã phê duyệt</span>
                </span>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
export default ActionButtons
