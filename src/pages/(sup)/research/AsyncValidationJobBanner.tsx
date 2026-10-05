import React from 'react'
import { RefreshCw } from 'lucide-react'

interface AsyncValidationJobBannerProps {
  valProgress: number
  onCancel: () => void
}

export const AsyncValidationJobBanner: React.FC<AsyncValidationJobBannerProps> = ({
  valProgress,
  onCancel
}) => {
  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center text-brand-goldDark flex-shrink-0 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand-dark">Tiến trình kiểm nghiệm nền: Job #VAL-2026-09</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
              HTTP 202 ACCEPTED (FR-31)
            </span>
          </div>
          <div className="text-slate-500 mt-0.5">
            Đang đối soát ma trận ghép cặp trên đoạn Km14 - Km22 (Đã hoàn thành {valProgress}%)
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-36 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-gold h-2 rounded-full transition-all duration-500"
            style={{ width: `${valProgress}%` }}
          />
        </div>
        <span className="font-bold text-brand-dark">{valProgress}%</span>
        <button
          onClick={onCancel}
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline ml-2"
        >
          Hủy tiến trình
        </button>
      </div>
    </div>
  )
}
