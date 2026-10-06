import React from 'react'
import {
  FileDown,
  RotateCcw,
  CheckCircle2,
  Send,
  Lock,
  Share2
} from 'lucide-react'
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
        className="px-3.5 h-9 bg-white border border-[#E2E5E9] hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
      >
        <FileDown className="w-4 h-4 text-[#C9A227]" />
        <span>Xuất hồ sơ (RPT-07)</span>
      </button>

      {/* SUPERVISOR ACTIONS */}
      {isSupervisorView && (
        <>
          <button
            onClick={onOpenReworkModal}
            type="button"
            className="px-3.5 h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Yêu cầu sửa lại (Rework)</span>
          </button>

          <button
            onClick={onAcceptItem}
            disabled={currentItem.status === 'ACCEPTED'}
            type="button"
            className={`px-4 h-9 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 ${
              currentItem.status === 'ACCEPTED'
                ? 'bg-emerald-700 text-white cursor-default'
                : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white hover:opacity-95 cursor-pointer'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {currentItem.status === 'ACCEPTED' ? 'Đã nghiệm thu (Ký số)' : 'Chấp thuận nghiệm thu (Ký số)'}
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
              className={`px-4 h-9 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer ${
                currentItem.status === 'ACCEPTED'
                  ? 'bg-emerald-700 text-white cursor-default'
                  : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {currentItem.status === 'ACCEPTED' ? 'Fast Track đã đóng' : 'Chấp thuận & Đóng lỗi Fast Track'}
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={onPMSubmitToSupervisor}
                type="button"
                className="px-3.5 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4 text-purple-700" />
                <span>Trình Supervisor nghiệm thu</span>
              </button>

              {currentItem.status !== 'ACCEPTED' ? (
                <div className="relative group">
                  <button
                    disabled
                    type="button"
                    className="px-3.5 h-9 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Đợi Giám sát nghiệm thu</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-medium">
                    Hạng mục APPROVAL_TRACK yêu cầu Supervisor duyệt đạt mới được phép công bố cho người dân.
                  </div>
                </div>
              ) : (
                <button
                  onClick={onOpenPublishModal}
                  type="button"
                  className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{currentItem.citizen_published ? 'Đã công bố (Cập nhật)' : 'Công bố kết quả (Citizen App)'}</span>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
