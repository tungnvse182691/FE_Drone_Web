import React from 'react'
import { Layers, Wrench, Flame } from 'lucide-react'
import { WorkMode } from './types'

export interface DispatchModeSelectorProps {
  workMode: WorkMode
  selectedDefectIds: string[]
  handleChangeWorkMode: (mode: WorkMode) => void
}

export const DispatchModeSelector: React.FC<DispatchModeSelectorProps> = ({
  workMode,
  selectedDefectIds,
  handleChangeWorkMode
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
        Cháº¿ Ä‘á»™ giao viá»‡c (Work Dispatch Mode)
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tab 1: Gom lÃ´ Ä‘o Ä‘áº¡c (MEASURE_ONLY) */}
        <label
          onClick={() => handleChangeWorkMode('MEASURE_ONLY')}
          className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
            workMode === 'MEASURE_ONLY'
              ? 'bg-amber-50/50 border-2 border-brand-gold shadow-xs'
              : 'bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-brand-gold">
                <Layers className="w-5 h-5 text-brand-gold" />
              </span>
              <span className="font-bold text-sm text-brand-dark">Gom lÃ´ Ä‘o Ä‘áº¡c</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-gold text-white">
              ÄÃ£ chá»n {selectedDefectIds.length} lá»—i
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Gom nhiá»u khiáº¿m khuyáº¿t cÃ¹ng tuyáº¿n Ä‘á»ƒ Ä‘á»™i Crew Ä‘o 1 lÆ°á»£t, nghiÃªm cáº¥m tá»± Ã½ sá»­a khi chÆ°a láº­p phÆ°Æ¡ng Ã¡n.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-[#8F7212]">
            <span className="px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200 text-[10px]">
              MEASURE_ONLY
            </span>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-gold flex items-center justify-center">
              {workMode === 'MEASURE_ONLY' && <span className="w-2 h-2 rounded-full bg-brand-gold"></span>}
            </span>
          </div>
        </label>

        {/* Tab 2: Äo vÃ  Sá»­a ngay (INSPECT_AND_REPAIR) */}
        <label
          onClick={() => handleChangeWorkMode('INSPECT_AND_REPAIR')}
          className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
            workMode === 'INSPECT_AND_REPAIR'
              ? 'bg-emerald-50/60 border-2 border-emerald-600 shadow-xs'
              : 'bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-brand-dark">Äo vÃ  Sá»­a ngay</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Fast Track Direct
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Chá»‰ Ã¡p dá»¥ng cho 1 lá»—i má»©c LOW Ä‘Æ¡n láº» thá»a mÃ£n policy Fast Track. Cho phÃ©p mang váº­t liá»‡u vÃ¡ nguá»™i trá»±c tiáº¿p.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-emerald-700">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[10px]">
              INSPECT_AND_REPAIR
            </span>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
              {workMode === 'INSPECT_AND_REPAIR' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
            </span>
          </div>
        </label>

        {/* Tab 3: Xá»­ lÃ½ kháº©n cáº¥p (EMERGENCY) */}
        <label
          onClick={() => handleChangeWorkMode('EMERGENCY')}
          className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
            workMode === 'EMERGENCY'
              ? 'bg-rose-50/60 border-2 border-rose-600 shadow-xs'
              : 'bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-sm text-brand-dark">Xá»­ lÃ½ kháº©n cáº¥p</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              24/7 Priority
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Kháº¯c phá»¥c táº¡m thá»i Ä‘á»ƒ thÃ´ng xe nhanh, phÃ¢n luá»“ng an toÃ n kháº©n cáº¥p, khÃ´ng Ä‘Ã³ng lá»—i gá»‘c trÃªn há»‡ thá»‘ng.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-rose-700">
            <span className="px-2 py-0.5 rounded-full bg-rose-100/80 border border-rose-200 text-[10px]">
              EMERGENCY_DISPATCH
            </span>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-rose-600 flex items-center justify-center">
              {workMode === 'EMERGENCY' && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
            </span>
          </div>
        </label>
      </div>
    </div>
  )
}
