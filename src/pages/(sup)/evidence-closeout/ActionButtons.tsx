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
      {/* Nút Xuất Hồ Sơ Bằng Chứng RPT-07 (Secondary CTA) */}
      <button
        onClick={onOpenExportModal}
        type="button"
        className="px-3 h-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
        title="Kết xuất hồ sơ bằng chứng số (PDF/A hoặc ZIP)"
      >
        <span className="material-symbols-outlined text-[16px] text-slate-600">download</span>
        <span>Xuất hồ sơ</span>
      </button>

      {/* SUPERVISOR ACTIONS */}
      {isSupervisorView && (
        <>
          {/* Nút Yêu cầu sửa lại: Luôn cho phép Supervisor yêu cầu sửa lại khi chưa đóng vụ việc (kể cả khi đã bấm nghiệm thu đạt) */}
          {!isCaseClosed && (
            <button
              onClick={onOpenReworkModal}
              type="button"
              className={`px-3 h-8 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer border ${
                currentItem.status === 'ACCEPTED'
                  ? 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-300'
              }`}
              title={
                currentItem.status === 'ACCEPTED'
                  ? 'Yêu cầu đội thi công sửa lại nếu phát hiện lỗi sau khi đã nghiệm thu'
                  : 'Phát lệnh yêu cầu khắc phục, tái thi công'
              }
            >
              <span className="material-symbols-outlined text-[16px] text-rose-600">replay</span>
              <span>Yêu cầu sửa lại</span>
            </button>
          )}

          {/* Trạng thái / Nút Chấp thuận nghiệm thu */}
          {currentItem.status !== 'ACCEPTED' ? (
            <button
              onClick={onAcceptItem}
              type="button"
              className="px-3.5 h-8 font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#8C6D1F] active:bg-[#6B5219] text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Chấp thuận nghiệm thu</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
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
              {!isCaseClosed && (
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
                  onClick={onPMCloseFastTrack}
                  type="button"
                  className="px-3.5 h-8 font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#8C6D1F] active:bg-[#6B5219] text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Chấp thuận &amp; Đóng Fast Track</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Fast Track đã đóng (BR-25)</span>
                </span>
              )}
            </>
          ) : (
            <>
              {!isCaseClosed && (
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
                  className="px-3.5 h-8 bg-[#C9A227] hover:bg-[#8C6D1F] active:bg-[#6B5219] text-white font-medium text-xs rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Khai báo hoàn thành thi công theo API-110 để chuyển gói sang chờ Giám sát nghiệm thu"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                  <span>Khai Báo Hoàn Thành Thi Công (API-110)</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
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
