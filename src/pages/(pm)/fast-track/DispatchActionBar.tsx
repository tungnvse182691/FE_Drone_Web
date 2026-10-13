import React from 'react'
import { Icon } from '../../../components/ui/Icon'
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
  isSupervisor?: boolean
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
  hasViolationItem,
  isSupervisor = false
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      {/* Selection Summary */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-brand-dark text-sm">
            {isSupervisor
              ? `Hồ sơ khảo sát: ${selectedDefectIds.length} khiếm khuyết trên tuyến`
              : `Đã chọn: ${selectedDefectIds.length} khiếm khuyết`}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">
            Tổng chiều dài khảo sát:{' '}
            <strong className="text-brand-dark font-mono font-bold">{surveyDistanceM} m</strong>
          </span>
          {hasViolationItem && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <Icon name="report" size={12} className="text-rose-600" />
              {isSupervisor ? 'Có lỗi vi phạm ngưỡng Fast Track' : 'Chặn giao việc: Có lỗi vượt ngưỡng'}
            </span>
          )}
        </div>
        <div className="text-slate-500 flex items-center gap-1.5 flex-wrap text-[11px]">
          <Icon name="groups" size={14} className="text-brand-gold" />
          <span>
            {isSupervisor ? (
              <>Đội thi công phụ trách: <strong className="text-brand-dark font-semibold">{selectedItems[0]?.assignedCrew || 'Đang chờ PM phân công'}</strong></>
            ) : (
              <>Phân bổ sơ bộ: <strong className="text-brand-dark font-semibold">{selectedItems[0]?.assignedCrew || 'Chưa chỉ định'}</strong> (Bấm nút bên phải để phát lệnh chính thức)</>
            )}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        {isSupervisor ? (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <Icon name="visibility" size={16} className="text-brand-gold shrink-0" />
            <span className="font-medium">Chế độ giám sát hiện trường (Read-only) • Thẩm quyền giao việc thuộc Chỉ huy trưởng (PM)</span>
          </div>
        ) : (
          <>
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
              <div className="relative group">
                <button
                  onClick={handleDispatchBatch}
                  disabled={selectedDefectIds.length === 0 || hasViolationItem}
                  type="button"
                  className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                    selectedDefectIds.length === 0 || hasViolationItem
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                      : 'bg-brand-gold hover:bg-[#B38E1F] text-white cursor-pointer'
                  }`}
                >
                  <Icon name="send" size={14} />
                  <span>Giao việc gom lô đo đạc ({selectedDefectIds.length} khiếm khuyết)</span>
                </button>
                {hasViolationItem && (
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                    <Icon name="report" size={14} className="text-rose-400 mr-1 shrink-0" />
                    Khóa: Không thể giao việc Fast Track khi có khiếm khuyết vi phạm ngưỡng!
                  </div>
                )}
              </div>
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
                  <Icon name="build" size={14} />
                  <span>Phát lệnh Đo &amp; Sửa ngay (1 khiếm khuyết)</span>
                </button>
                {(hasViolationItem || selectedDefectIds.length !== 1) && (
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                    <Icon name="report" size={14} className="text-rose-400 mr-1 shrink-0" />
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
                    <Icon name="warning" size={16} className="text-amber-600 shrink-0" />
                    <span>Lưu ý: Hư hỏng #{selectedItems[0]?.code} chưa vượt ngưỡng an toàn!</span>
                  </div>
                )}
                {!selectedItems[0]?.isFastTrackEligible && selectedItems[0] && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-semibold">
                    <Icon name="local_fire_department" size={16} className="text-rose-600 shrink-0" />
                    <span>Hư hỏng #{selectedItems[0]?.code} vượt ngưỡng — Khắc phục tạm thông xe (Hậu kiểm sau)</span>
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
                    <Icon name="local_fire_department" size={14} />
                    <span>Phát lệnh Xử lý khẩn cấp (24/7 Priority)</span>
                  </button>
                  {selectedDefectIds.length !== 1 && (
                    <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                      <Icon name="report" size={14} className="text-rose-400 mr-1 shrink-0" />
                      Chỉ chọn đúng 1 vị trí nguy hiểm để điều động xe khẩn cấp
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
