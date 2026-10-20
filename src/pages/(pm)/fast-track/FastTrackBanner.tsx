import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface FastTrackBannerProps {
  sourceCase: {
    code: string
    title: string
    stationing: string
    isEligible: boolean
  } | null
  onClose: () => void
}

export const FastTrackBanner: React.FC<FastTrackBannerProps> = ({
  sourceCase,
  onClose
}) => {
  if (!sourceCase) return null

  return (
    <div
      className="rounded-[20px] overflow-hidden relative shadow-2xs animate-in fade-in transition-all duration-300"
      style={{
        border: '1.5px solid #E3D28A',
        background: 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)'
      }}
    >
      {/* 4px top gradient line */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #C9A227 0%, #D97706 100%)' }}
      />

      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-800">
        <div className="flex items-start gap-3.5">
          {/* Dot 10px + Halo 4px */}
          <div className="relative flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
            <span className="absolute inset-0 rounded-full bg-[#C9A227]/20" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-[#1A1D20]">
                ĐÃ TỰ ĐỘNG CHỌN HỒ SƠ TỪ HỘP THƯ TIẾP NHẬN:
              </span>
              <span className="font-mono font-bold text-xs bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 text-amber-900 shadow-2xs">
                {sourceCase.code}
              </span>
              {sourceCase.isEligible ? (
                <span className="text-[11px] font-bold px-[14px] py-[5px] rounded-full bg-[#F0FDF7] text-[#047857] border border-[#A7C4B8]">
                  ✓ Đủ tiêu chuẩn Xử lý nhanh trực tiếp
                </span>
              ) : (
                <span className="text-[11px] font-bold px-[14px] py-[5px] rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#E6A8A8]">
                  ⚠ Vượt ngưỡng xử lý nhanh (Chuyển sang Chế độ Đo đạc)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">{sourceCase.title}</strong> • Lý trình: <span className="font-semibold text-slate-700">{sourceCase.stationing}</span>. Hệ thống đã tự động tick chọn khiếm khuyết này và thiết lập chế độ phù hợp.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="self-start sm:self-center px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-[#E2E5E9] hover:bg-slate-50 rounded-xl cursor-pointer transition-colors shadow-2xs shrink-0"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}
