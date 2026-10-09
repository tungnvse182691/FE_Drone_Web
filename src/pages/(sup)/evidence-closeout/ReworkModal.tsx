import React from 'react'
import { CaseItem } from './types'

export interface ReworkModalProps {
  isOpen: boolean
  onClose: () => void
  currentItem: CaseItem
  reworkChecklist: {
    bond_coat: boolean
    flatness_3m: boolean
    temperature_slip: boolean
    compaction_k98: boolean
    other_defect: boolean
  }
  setReworkChecklist: React.Dispatch<React.SetStateAction<{
    bond_coat: boolean
    flatness_3m: boolean
    temperature_slip: boolean
    compaction_k98: boolean
    other_defect: boolean
  }>>
  otherDefectText: string
  setOtherDefectText: (s: string) => void
  reworkNotes: string
  setReworkNotes: (s: string) => void
  onSubmitRework: () => void
}

export const ReworkModal: React.FC<ReworkModalProps> = ({
  isOpen,
  onClose,
  currentItem,
  reworkChecklist,
  setReworkChecklist,
  otherDefectText,
  setOtherDefectText,
  reworkNotes,
  setReworkNotes,
  onSubmitRework
}) => {
  if (!isOpen) return null

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden z-10 flex flex-col">
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-rose-600">warning</span>
            <h3 className="font-bold text-sm font-sansation">Lập lệnh yêu cầu sửa lại (Rework Order)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600">Hạng mục: <strong>{currentItem.item_code}</strong> ({currentItem.defect_code})</span>
            <span className="text-slate-600">Lý trình: <strong>{currentItem.chainage}</strong></span>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">Các chỉ tiêu chưa đạt kỹ thuật (TCVN 8819:2011):</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.bond_coat}
                  onChange={(e) => setReworkChecklist((prev) => ({ ...prev, bond_coat: e.target.checked }))}
                  className="rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800">Mép nối chưa tưới đủ nhũ tương dính bám CRS-1</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.flatness_3m}
                  onChange={(e) => setReworkChecklist((prev) => ({ ...prev, flatness_3m: e.target.checked }))}
                  className="rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800">Độ bằng phẳng thước 3m vượt dung sai (&gt; 3mm)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.temperature_slip}
                  onChange={(e) => setReworkChecklist((prev) => ({ ...prev, temperature_slip: e.target.checked }))}
                  className="rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800">Thiếu phiếu cân hoặc biên bản đo nhiệt độ thảm rải</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.compaction_k98}
                  onChange={(e) => setReworkChecklist((prev) => ({ ...prev, compaction_k98: e.target.checked }))}
                  className="rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800">Độ chặt lu lèn móng K98 chưa đạt kiểm định</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.other_defect}
                  onChange={(e) => setReworkChecklist((prev) => ({ ...prev, other_defect: e.target.checked }))}
                  className="rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800">Lý do kỹ thuật khác...</span>
              </label>

              {reworkChecklist.other_defect && (
                <input
                  type="text"
                  placeholder="Nhập nội dung sai sót phát sinh..."
                  value={otherDefectText}
                  onChange={(e) => setOtherDefectText(e.target.value)}
                  className="w-full p-2 bg-white rounded-md border border-slate-300 text-xs focus:outline-none focus:border-rose-500"
                />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-800 block">Chỉ đạo của Giám sát:</label>
            <textarea
              rows={2}
              value={reworkNotes}
              onChange={(e) => setReworkNotes(e.target.value)}
              className="w-full p-2 bg-white rounded-md border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="p-2.5 bg-amber-50 rounded-md border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5 leading-relaxed">
            <span className="material-symbols-outlined text-[15px] text-amber-700 shrink-0 mt-0.5">info</span>
            <span>
              Hồ sơ sẽ chuyển về trạng thái REWORK_REQUIRED và thông báo đến PM và Đội thi công.
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 h-8 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition rounded-md font-medium text-xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onSubmitRework}
            disabled={
              (reworkChecklist.other_defect && !otherDefectText.trim()) ||
              (!reworkChecklist.bond_coat &&
                !reworkChecklist.flatness_3m &&
                !reworkChecklist.temperature_slip &&
                !reworkChecklist.compaction_k98 &&
                !reworkChecklist.other_defect)
            }
            type="button"
            className={`px-4 h-8 transition rounded-md font-medium text-xs shadow-xs flex items-center gap-1.5 ${
              (reworkChecklist.other_defect && !otherDefectText.trim()) ||
              (!reworkChecklist.bond_coat &&
                !reworkChecklist.flatness_3m &&
                !reworkChecklist.temperature_slip &&
                !reworkChecklist.compaction_k98 &&
                !reworkChecklist.other_defect)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">send</span>
            <span>Phát lệnh sửa lại</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default ReworkModal
