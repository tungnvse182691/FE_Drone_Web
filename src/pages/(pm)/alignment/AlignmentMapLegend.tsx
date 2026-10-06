import React from 'react'

export const AlignmentMapLegend: React.FC = () => {
  return (
    <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-xl text-white shadow-xl flex flex-col gap-1.5 w-56 border border-slate-700/60 text-xs">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
        ChÃº giáº£i báº£n Ä‘á»“ GIS
      </span>
      <div className="flex items-center gap-2">
        <span className="w-4 h-1.5 rounded-full bg-brand-gold"></span>
        <span className="text-slate-200 text-[11px]">Tim tuyáº¿n chÃ­nh</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-1 rounded bg-sky-400 inline-block"></span>
        <span className="text-sky-300 text-[11px]">MÃ©p trÃ¡i</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-1 rounded bg-amber-400 inline-block"></span>
        <span className="text-amber-300 text-[11px]">MÃ©p pháº£i</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-1 rounded bg-[#38BDF8] inline-block"></span>
        <span className="text-slate-200 text-[11px]">Khe co giÃ£n</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-1.5 rounded bg-[#EF4444] inline-block"></span>
        <span className="text-slate-200 text-[11px]">Khe giÃ£n ná»Ÿ</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3 rounded border border-white/80 bg-slate-700 inline-block"></span>
        <span className="text-slate-200 text-[11px]">LÆ°á»›i táº¥m BTXM</span>
      </div>
    </div>
  )
}
