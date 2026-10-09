import React from 'react'

export interface TimeRangeModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
}

export const TimeRangeModal: React.FC<TimeRangeModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#8C6D1F]">calendar_month</span>
            <h3 className="font-sansation text-base font-bold text-slate-900">
              Tùy chỉnh khung thời gian báo cáo
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Từ ngày</label>
            <input
              type="date"
              defaultValue="2026-07-01"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">Đến ngày</label>
            <input
              type="date"
              defaultValue="2026-09-30"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">Chu kỳ phân tích định kỳ</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium cursor-pointer">
              <option>Theo Quý (3 tháng)</option>
              <option>Theo Tháng (30 ngày)</option>
              <option>Lũy kế toàn bộ chu kỳ bảo hành (12 tháng)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onApply}
            type="button"
            className="px-4 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium text-xs cursor-pointer shadow-xs"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  )
}
