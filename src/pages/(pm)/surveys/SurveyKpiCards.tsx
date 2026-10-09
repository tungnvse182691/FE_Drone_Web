import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export const SurveyKpiCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng đợt bay */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-brand-gold shrink-0 border border-amber-100">
          <Icon name="flight_takeoff" size={22} className="text-[#8C6D1F]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Tổng đợt bay</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            04 <span className="text-xs font-normal text-slate-500 font-sans">nhiệm vụ</span>
          </span>
          <div className="text-[11px] text-[#2F9E44] font-medium flex items-center gap-1 mt-0.5">
            <Icon name="check_circle" size={13} className="text-[#2F9E44]" />
            <span className="truncate">02 đợt đã khóa Baseline</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Cần thẩm định AI */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-rose-600 shrink-0 border border-red-100">
          <Icon name="auto_awesome" size={22} className="text-[#E5484D]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Cần thẩm định AI ngay</span>
          <span className="text-lg font-bold text-[#E5484D] font-mono">
            01 <span className="text-xs font-semibold text-rose-600 font-sans">đợt bay (#MS-0924)</span>
          </span>
          <div className="text-[11px] text-[#E5484D] font-medium flex items-center gap-1 mt-0.5">
            <Icon name="warning" size={13} className="text-[#E5484D]" />
            <span className="truncate">08 khiếm khuyết AI chờ xác nhận</span>
          </div>
        </div>
      </div>

      {/* KPI 3: Khối lượng ảnh chụp */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
          <Icon name="photo_library" size={22} className="text-blue-600" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Khối lượng không ảnh RGB</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            6,210 <span className="text-xs font-normal text-slate-500 font-sans">ảnh</span>
          </span>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <Icon name="photo_camera" size={13} className="text-slate-400" />
            <span className="truncate">GSD bình quân 1.15 cm/pixel</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Độ phủ hành lang */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#EDF7ED] flex items-center justify-center text-[#1B5E20] shrink-0 border border-emerald-100">
          <Icon name="verified" size={22} className="text-[#2F9E44]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Độ phủ hành lang (Coverage)</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            94.8% <span className="text-xs font-normal text-slate-500 font-sans">toàn tuyến</span>
          </span>
          <div className="text-[11px] text-[#2F9E44] font-medium flex items-center gap-1 mt-0.5">
            <Icon name="check_circle" size={13} className="text-[#2F9E44]" />
            <span className="truncate">Đạt ngưỡng chất lượng &gt; 90%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
