import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export const FastTrackBanner: React.FC = () => {
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
                Hồ sơ nguồn &amp; Điều kiện xử lý
              </span>
              <span className="font-bold text-xs bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 text-amber-900 shadow-2xs">
                Chưa cập nhật
              </span>
              <span className="text-[11px] font-bold px-[14px] py-[5px] rounded-full bg-slate-50 text-slate-500 border border-slate-200">Chưa cập nhật</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hồ sơ: Chưa cập nhật • Lý trình: Chưa cập nhật. Chỉ sử dụng nguồn được xác nhận trên máy chủ, không tự chọn hoặc giao việc từ hộp thư.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="self-start sm:self-center px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-[#E2E5E9] hover:bg-slate-50 rounded-xl cursor-pointer transition-colors shadow-2xs shrink-0"
        >
          Chưa cập nhật
        </button>
      </div>
    </div>
  )
}
