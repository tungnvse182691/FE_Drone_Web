import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem, CrewTeam, PolicyThresholdConfig } from './types'

export interface FastTrackDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDefectIds: string[]
  selectedItems: DefectItem[]
  selectedDispatchCrew: string
  setSelectedDispatchCrew: (crew: string) => void
  crewTeams: CrewTeam[]
  dispatchNotes: string
  setDispatchNotes: (notes: string) => void
  handleExecuteDispatch: () => void
  currentPolicy?: PolicyThresholdConfig | null
}

export const FastTrackDispatchModal: React.FC<FastTrackDispatchModalProps> = ({
  isOpen,
  onClose,
  selectedDefectIds,
  selectedItems,
  selectedDispatchCrew,
  setSelectedDispatchCrew,
  crewTeams,
  dispatchNotes,
  setDispatchNotes,
  handleExecuteDispatch
}) => {
  if (!isOpen) return null

  const hasViolation = selectedItems.some((item) => !item.isFastTrackEligible)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="send" size={18} className="text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Phát Lệnh Xử Lý Nhanh Hiện Trường</h3>
              <span className="text-[10px] text-slate-500">Chỉ huy trưởng (PM) điều phối nhân sự thi công</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Thông tin tóm tắt */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Số lượng hạng mục:</span>
              <strong className="text-slate-900">{selectedDefectIds.length} vị trí</strong>
            </div>
          </div>

          {/* Cảnh báo vi phạm */}
          {hasViolation ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Icon name="error" size={16} className="text-rose-600" />
                <span>Không thể phát lệnh: Có khiếm khuyết vi phạm quy chuẩn!</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Vui lòng bỏ chọn các khiếm khuyết vượt ngưỡng để phát lệnh Fast Track.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <Icon name="check_circle" size={16} className="text-emerald-600" />
              <span className="font-semibold">Tất cả {selectedDefectIds.length} vị trí đều thỏa mãn tiêu chuẩn xử lý nhanh!</span>
            </div>
          )}

          {/* Chọn đội thi công */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Phân công nhân sự / tổ đội phụ trách</label>
            <select
              value={selectedDispatchCrew}
              onChange={(e) => setSelectedDispatchCrew(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
            >
              {crewTeams.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.role || 'Thành viên'})
                </option>
              ))}
            </select>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Ghi chú chỉ đạo hiện trường</label>
            <textarea
              rows={2}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleExecuteDispatch}
            disabled={hasViolation || selectedDefectIds.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-[#C9A227] hover:bg-[#b08d20] rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Xác nhận phát lệnh
          </button>
        </div>
      </div>
    </div>
  )
}
