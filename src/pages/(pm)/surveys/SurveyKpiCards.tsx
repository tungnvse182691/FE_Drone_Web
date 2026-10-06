import React from 'react'
import {
  PlaneTakeoff,
  Sparkles,
  Layers,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Camera
} from 'lucide-react'

export const SurveyKpiCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tá»•ng Äá»£t Bay</div>
          <div className="text-2xl font-bold text-brand-dark mt-1">04 <span className="text-xs font-normal text-slate-500">nhiá»‡m vá»¥</span></div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>02 Ä‘á»£t Ä‘Ã£ khÃ³a Baseline</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-gold flex items-center justify-center border border-amber-100">
          <PlaneTakeoff className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border-2 border-amber-200/80 rounded-xl p-4.5 shadow-2xs flex items-center justify-between bg-amber-50/20">
        <div>
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Cáº§n Tháº©m Äá»‹nh AI Ngay</div>
          <div className="text-2xl font-bold text-brand-error mt-1">01 <span className="text-xs font-semibold text-amber-700">Ä‘á»£t bay (#MS-0924)</span></div>
          <div className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>08 khiáº¿m khuyáº¿t AI chá» xÃ¡c nháº­n</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khá»‘i LÆ°á»£ng KhÃ´ng áº¢nh SD</div>
          <div className="text-2xl font-bold text-brand-dark mt-1">6,210 <span className="text-xs font-normal text-slate-500">áº£nh</span></div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <Camera className="w-3 h-3 text-slate-400" />
            <span>GSD bÃ¬nh quÃ¢n 1.15 cm/pixel</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Äá»™ Phá»§ HÃ nh Lang (Coverage)</div>
          <div className="text-2xl font-bold text-brand-dark mt-1">94.8% <span className="text-xs font-normal text-slate-500">toÃ n tuyáº¿n</span></div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Äáº¡t ngÆ°á»¡ng cháº¥t lÆ°á»£ng &gt; 90%</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <FileCheck2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
