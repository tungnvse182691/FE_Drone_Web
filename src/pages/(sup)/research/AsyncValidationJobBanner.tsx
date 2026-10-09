import React from 'react'

interface AsyncValidationJobBannerProps {
  valProgress: number
  onCancel: () => void
}

export const AsyncValidationJobBanner: React.FC<AsyncValidationJobBannerProps> = ({
  valProgress,
  onCancel
}) => {
  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
          <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Tiến trình kiểm nghiệm nền: Job #VAL-2026-09</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
              HTTP 202 ACCEPTED (FR-31)
            </span>
          </div>
          <div className="text-slate-600 mt-0.5">
            Đang đối soát ma trận ghép cặp trên đoạn Km 1025 - Km 1038 (Đã hoàn thành {valProgress}%)
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-32 bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-brand-gold h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${valProgress}%` }}
          />
        </div>
        <span className="font-mono font-bold text-slate-800">{valProgress}%</span>
        <button
          onClick={onCancel}
          type="button"
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer ml-1"
        >
          Hủy tiến trình
        </button>
      </div>
    </div>
  )
}
