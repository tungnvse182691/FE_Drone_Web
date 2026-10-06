import React from 'react'
import {
  AlertTriangle,
  X,
  AlertCircle,
  Send
} from 'lucide-react'
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col">
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base font-sansation">Lập lệnh yêu cầu tái thi công (Rework Order)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
            <p>
              Hạng mục: <strong className="text-slate-900">{currentItem.defect_code} ({currentItem.item_code})</strong> • Lý trình: <span className="font-mono">{currentItem.chainage}</span>
            </p>
            <p>
              Đội thi công chịu trách nhiệm: <strong className="text-slate-900">{currentItem.after_crew}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-900 block">Chọn các tiêu chí kỹ thuật không đạt yêu cầu:</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.bond_coat}
                  onChange={(e) => setReworkChecklist(p => ({ ...p, bond_coat: e.target.checked }))}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800 font-medium">Lớp dính bám (Bond coat/Tack coat) không đạt tiêu chuẩn, có hiện tượng tróc trượt</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.flatness_3m}
                  onChange={(e) => setReworkChecklist(p => ({ ...p, flatness_3m: e.target.checked }))}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800 font-medium">Độ bằng phẳng thước 3m khe hở &gt; 5mm (Không đạt TCVN 8819)</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.temperature_slip}
                  onChange={(e) => setReworkChecklist(p => ({ ...p, temperature_slip: e.target.checked }))}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800 font-medium">Nhiệt độ thảm nhựa lúc rải thấp hơn quy định (&lt; 120°C gây nứt xé mặt bê tông)</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.compaction_k98}
                  onChange={(e) => setReworkChecklist(p => ({ ...p, compaction_k98: e.target.checked }))}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800 font-medium">Hệ số đầm nén K98 không đồng đều, có vệt hằn bánh xe lu rung</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reworkChecklist.other_defect}
                  onChange={(e) => setReworkChecklist(p => ({ ...p, other_defect: e.target.checked }))}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                />
                <span className="text-slate-800 font-medium">Lý do kỹ thuật khác (Yêu cầu ghi rõ bên dưới)</span>
              </label>
              {reworkChecklist.other_defect && (
                <div className="pl-6 pt-1 space-y-1">
                  <input
                    type="text"
                    placeholder="Mô tả tóm tắt lỗi kỹ thuật khác..."
                    value={otherDefectText}
                    onChange={(e) => setOtherDefectText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-rose-500 font-medium"
                  />
                  {!otherDefectText.trim() && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Bắt buộc nhập tên lỗi kỹ thuật phát sinh mới được phát lệnh.</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-900 block">Ý kiến chỉ đạo của Kỹ sư Giám sát:</label>
            <textarea
              rows={3}
              value={reworkNotes}
              onChange={(e) => setReworkNotes(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Lưu ý: Phát lệnh Rework sẽ tự động chuyển trạng thái hồ sơ về "REWORK_REQUIRED" và gia hạn thêm SLA hoàn công 24 giờ cho nhà thầu.
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            type="button"
            className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
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
            className={`px-5 h-9 transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 ${
              (reworkChecklist.other_defect && !otherDefectText.trim()) ||
              (!reworkChecklist.bond_coat &&
                !reworkChecklist.flatness_3m &&
                !reworkChecklist.temperature_slip &&
                !reworkChecklist.compaction_k98 &&
                !reworkChecklist.other_defect)
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Phát lệnh Rework (Tạo Work Order bù)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default ReworkModal
