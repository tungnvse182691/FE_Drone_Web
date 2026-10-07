import React, { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'

export const AlignmentMapLegend: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false)

  return (
    <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-xl text-white shadow-xl flex flex-col gap-1.5 w-56 border border-slate-700/60 text-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-gold" />
          <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
            Chú giải bản đồ GIS
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title={isMinimized ? 'Mở rộng chú giải' : 'Thu nhỏ chú giải'}
        >
          {isMinimized ? (
            <ChevronUp className="w-3.5 h-3.5 text-brand-gold" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {!isMinimized && (
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-brand-gold"></span>
            <span className="text-slate-200 text-[11px]">Tim tuyến chính</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded bg-sky-400 inline-block"></span>
            <span className="text-sky-300 text-[11px]">Mép trái (-W/2)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded bg-amber-400 inline-block"></span>
            <span className="text-amber-300 text-[11px]">Mép phải (+W/2)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded bg-[#38BDF8] inline-block"></span>
            <span className="text-slate-200 text-[11px]">Khe co giãn</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 rounded bg-[#EF4444] inline-block"></span>
            <span className="text-slate-200 text-[11px]">Khe giãn nở</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3 rounded border border-white/80 bg-slate-700 inline-block"></span>
            <span className="text-slate-200 text-[11px]">Lưới tấm BTXM</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="w-4 h-1 border-b-2 border-dashed border-amber-400 inline-block"></span>
            <span className="text-amber-300 text-[11px]">Tuyến nhánh (Nút rẽ)</span>
          </div>
        </div>
      )}
    </div>
  )
}
