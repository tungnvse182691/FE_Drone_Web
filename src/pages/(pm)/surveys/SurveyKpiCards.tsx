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
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Đợt Bay</div>
          <div className="text-2xl font-bold text-brand-dark mt-1">04 <span className="text-xs font-normal text-slate-500">nhiệm vụ</span></div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>02 đợt đã khóa Baseline</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A227] flex items-center justify-center border border-amber-100">
          <PlaneTakeoff className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border-2 border-amber-200/80 rounded-xl p-4.5 shadow-2xs flex items-center justify-between bg-amber-50/20">
        <div>
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Cần Thẩm Định AI Ngay</div>
          <div className="text-2xl font-bold text-brand-error mt-1">01 <span className="text-xs font-semibold text-amber-700">đợt bay (#MS-0924)</span></div>
          <div className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>08 khiếm khuyết AI chờ xác nhận</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khối Lượng Không Ảnh SD</div>
          <div className="text-2xl font-bold text-brand-dark mt-1">6,210 <span className="text-xs font-normal text-slate-500">ảnh</span></div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <Camera className="w-3 h-3 text-slate-400" />
            <span>GSD bình quân 1.15 cm/pixel</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Độ Phủ Hành Lang (Coverage)</div>
          <div className="text-2xl font-bold text-brand-dark mt-1">94.8% <span className="text-xs font-normal text-slate-500">toàn tuyến</span></div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đạt ngưỡng chất lượng &gt; 90%</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <FileCheck2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
