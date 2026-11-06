import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem } from './types'

export interface DispatchActionBarProps {
  selectedDefectIds: string[]
  selectedItems: DefectItem[]
  setSelectedDefectIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  onOpenDispatchModal?: () => void
  hasViolationItem: boolean
  isSupervisor?: boolean
  eligibilityMap?: Record<string, { eligible: boolean; missingReasons: string[]; loading: boolean }>
}

export const DispatchActionBar: React.FC<DispatchActionBarProps> = ({
  selectedDefectIds,
  selectedItems,
  setSelectedDefectIds,
  showToast,
  onOpenDispatchModal,
  hasViolationItem,
  isSupervisor = false,
  eligibilityMap
}) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#C9A227] shadow-2xs">
          <Icon name="checklist" size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {isSupervisor
              ? 'Chế độ Giám sát: Theo dõi điều phối'
              : `Thao tác xử lý nhanh (${selectedDefectIds.length} hạng mục đã chọn)`}
          </h4>
          <p className="text-xs text-slate-500">
            {isSupervisor
              ? 'Theo dõi tiến độ, kiểm tra điều kiện kỹ thuật và ghi nhận phạm vi xử lý'
              : 'Phát lệnh thi công trực tiếp cho các hạng mục thỏa mãn quy chuẩn kỹ thuật'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {isSupervisor ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/70 text-slate-700 text-xs font-semibold">
            <Icon name="info" size={14} className="text-slate-500" />
            <span>Vai trò Giám sát: Không có quyền phát lệnh (Chỉ xem)</span>
          </span>
        ) : (
          <>
            <button
              onClick={() => setSelectedDefectIds([])}
              disabled={selectedDefectIds.length === 0}
              type="button"
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Bỏ chọn
            </button>

            <button type="button" disabled title="Chưa tích hợp lưu nháp phân công từ màn hình này" className="px-3.5 py-2 bg-white text-slate-400 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs">Lưu nháp phân công</button>
            <button type="button" disabled title="Chưa xác minh đầy đủ điều kiện lệnh đo đạc tại đây" className="px-3.5 py-2 bg-white text-slate-400 text-xs font-semibold rounded-xl border border-slate-200">Giao việc gom lô đo đạc</button>
            <button type="button" disabled title="Chưa tích hợp lệnh khẩn cấp tại đây" className="px-3.5 py-2 bg-white text-slate-400 text-xs font-semibold rounded-xl border border-slate-200">Giao việc khẩn cấp</button>
            {onOpenDispatchModal && (
              <button
                onClick={onOpenDispatchModal}
                disabled={selectedDefectIds.length === 0 || hasViolationItem}
                type="button"
                className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                  selectedDefectIds.length === 0 || hasViolationItem
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white cursor-pointer'
                }`}
              >
                <Icon name="send" size={16} />
                <span>Phát lệnh xử lý nhanh ({selectedDefectIds.length})</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
