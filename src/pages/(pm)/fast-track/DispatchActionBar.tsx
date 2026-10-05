import React from 'react'
import { Users2, Send, Wrench, AlertOctagon, AlertTriangle, Flame } from 'lucide-react'
import { DefectItem, WorkMode } from './types'

export interface DispatchActionBarProps {
  selectedDefectIds: string[]
  surveyDistanceM: number
  selectedItems: DefectItem[]
  setSelectedDefectIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  workMode: WorkMode
  handleDispatchBatch: () => void
  handleRepairDirect: () => void
  handleEmergencyDispatch: () => void
  hasViolationItem: boolean
}

export const DispatchActionBar: React.FC<DispatchActionBarProps> = ({
  selectedDefectIds,
  surveyDistanceM,
  selectedItems,
  setSelectedDefectIds,
  showToast,
  workMode,
  handleDispatchBatch,
  handleRepairDirect,
  handleEmergencyDispatch,
  hasViolationItem
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      {/* Selection Summary */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-brand-dark text-sm">
            Đã chọn: {selectedDefectIds.length} khiếm khuyết
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">
            Tổng chiều dài khảo sát:{' '}
            <strong className="text-brand-dark font-mono font-bold">{surveyDistanceM} m</strong>
          </span>
        </div>
        <div className="text-slate-500 flex items-center gap-1.5 flex-wrap text-[11px]">
          <Users2 className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>
            Phân bổ sơ bộ: <strong className="text-brand-dark font-semibold">{selectedItems[0]?.assignedCrew || 'Chưa chỉ định'}</strong> (Bấm nút bên phải để phát lệnh chính thức)
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <button
          onClick={() => setSelectedDefectIds([])}
          type="button"
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          Hủy chọn
        </button>
        <button
          onClick={() => showToast('Đã lưu nháp cấu hình phân bổ nhiệm vụ vào hồ sơ dự án.')}
          type="button"
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          Lưu nháp phân công
        </button>

        {/* Dynamic Buttons based on workMode */}
        {workMode === 'MEASURE_ONLY' && (
          <button
            onClick={handleDispatchBatch}
            disabled={selectedDefectIds.length === 0}
            type="button"
            className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
              selectedDefectIds.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Giao việc gom lô đo đạc ({selectedDefectIds.length} khiếm khuyết)</span>
          </button>
        )}

        {workMode === 'INSPECT_AND_REPAIR' && (
          <div className="relative group">
            <button
              onClick={handleRepairDirect}
              disabled={hasViolationItem || selectedDefectIds.length !== 1}
              type="button"
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                hasViolationItem || selectedDefectIds.length !== 1
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Phát lệnh Đo & Sửa ngay (1 khiếm khuyết)</span>
            </button>
            {(hasViolationItem || selectedDefectIds.length !== 1) && (
              <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                {hasViolationItem
                  ? 'Khóa: Khiếm khuyết được chọn vượt ngưỡng chính sách Fast Track'
                  : 'Quy tắc BR-08: Chế độ Đo & Sửa ngay chỉ áp dụng cho đúng 1 lỗi đạt chuẩn'}
              </div>
            )}
          </div>
        )}

        {workMode === 'EMERGENCY' && (
          <div className="flex items-center gap-2.5">
            {selectedItems[0]?.isFastTrackEligible && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Lưu ý: Hư hỏng #{selectedItems[0]?.code} chưa vượt ngưỡng an toàn!</span>
              </div>
            )}
            <div className="relative group">
              <button
                onClick={handleEmergencyDispatch}
                disabled={selectedDefectIds.length !== 1}
                type="button"
                className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                  selectedDefectIds.length !== 1
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Phát lệnh Xử lý khẩn cấp (24/7 Priority)</span>
              </button>
              {selectedDefectIds.length !== 1 && (
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                  Chỉ chọn đúng 1 vị trí nguy hiểm để điều động xe khẩn cấp
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
