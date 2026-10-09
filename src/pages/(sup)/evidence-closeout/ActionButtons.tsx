import React from 'react'
import { CaseItem } from './types'

export interface ActionButtonsProps {
  currentItem: CaseItem
  isSupervisorView: boolean
  isPMView: boolean
  onOpenExportModal: () => void
  onOpenReworkModal: () => void
  onAcceptItem: () => void
  onPMCloseFastTrack: () => void
  onPMSubmitToSupervisor: () => void
  onOpenPublishModal: () => void
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentItem,
  isSupervisorView,
  isPMView,
  onOpenExportModal,
  onOpenReworkModal,
  onAcceptItem,
  onPMCloseFastTrack,
  onPMSubmitToSupervisor,
  onOpenPublishModal
}) => {
  return (
    <div className="flex items-center flex-wrap gap-2">
      {/* Nút Xuất Hồ Sơ Bằng Chứng RPT-07 */}
      <button
        onClick={onOpenExportModal}
        type="button"
        className="px-3 h-8 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px] text-[#C9A227]">download</span>
        <span>Xuất hồ sơ</span>
      </button>

      {/* SUPERVISOR ACTIONS */}
      {isSupervisorView && (
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
            onClick={onAcceptItem}
            disabled={currentItem.status === 'ACCEPTED'}
            type="button"
            className={`px-3.5 h-8 font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 ${
              currentItem.status === 'ACCEPTED'
                ? 'bg-[#2F9E44] text-white cursor-default'
                : 'bg-[#C9A227] hover:bg-[#8C6D1F] text-white cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {currentItem.status === 'ACCEPTED' ? 'task_alt' : 'verified'}
            </span>
            <span>
              {currentItem.status === 'ACCEPTED' ? 'Đã ký số nghiệm thu' : 'Chấp thuận nghiệm thu (Ký số)'}
            </span>
          </button>
        </>
      )}

      {/* PROJECT MANAGER ACTIONS */}
      {isPMView && (
        <>
          {currentItem.track_type === 'FAST_TRACK' ? (
            <button
              onClick={onPMCloseFastTrack}
              disabled={currentItem.status === 'ACCEPTED'}
              type="button"
              className={`px-3.5 h-8 font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                currentItem.status === 'ACCEPTED'
                  ? 'bg-[#2F9E44] text-white cursor-default'
                  : 'bg-[#C9A227] hover:bg-[#8C6D1F] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {currentItem.status === 'ACCEPTED' ? 'check_circle' : 'bolt'}
              </span>
              <span>
                {currentItem.status === 'ACCEPTED' ? 'Fast Track đã đóng' : 'Chấp thuận & Đóng Fast Track'}
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={onPMSubmitToSupervisor}
                type="button"
                className="px-3 h-8 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-md border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-700">send</span>
                <span>Trình Giám sát</span>
              </button>

              {currentItem.status !== 'ACCEPTED' ? (
                <div className="relative group">
                  <button
                    disabled
                    type="button"
                    className="px-3 h-8 bg-slate-100 text-slate-400 font-medium text-xs rounded-md border border-slate-200 flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span>Chờ Giám sát duyệt</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenPublishModal}
                  type="button"
                  className="px-3.5 h-8 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-md shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  <span>{currentItem.citizen_published ? 'Đã công bố Citizen' : 'Công bố kết quả'}</span>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
export default ActionButtons
