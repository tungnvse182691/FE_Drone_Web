import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export const SurveyKpiCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng đợt bay */}
      <div className="bg-white border border-[#E2E5E9] rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Tổng Đợt Bay
          </div>
          <div className="text-2xl font-bold text-[#1A1D20] font-sansation mt-1">
            04 <span className="text-xs font-normal text-slate-500 font-sans">nhiệm vụ</span>
          </div>
          <div className="text-[11px] text-[#2F9E44] font-medium mt-1 flex items-center gap-1">
            <Icon name="check_circle" size={14} className="text-[#2F9E44]" />
            <span>02 đợt đã khóa Baseline</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#8C6D1F] flex items-center justify-center border border-amber-100">
          <Icon name="flight_takeoff" size={20} className="text-[#C9A227]" />
        </div>
      </div>

      {/* KPI 2: Cần thẩm định AI */}
      <div className="bg-white border-2 border-amber-300 rounded-xl p-4.5 shadow-2xs flex items-center justify-between bg-amber-50/20">
        <div>
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Cần Thẩm Định AI Ngay
          </div>
          <div className="text-2xl font-bold text-[#E5484D] font-sansation mt-1">
            01 <span className="text-xs font-semibold text-amber-700 font-sans">đợt bay (#MS-0924)</span>
          </div>
          <div className="text-[11px] text-[#E5484D] font-medium mt-1 flex items-center gap-1">
            <Icon name="warning" size={14} className="text-[#E5484D]" />
            <span>08 khiếm khuyết AI chờ xác nhận</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
          <Icon name="auto_awesome" size={20} className="text-[#E5484D]" />
        </div>
      </div>

      {/* KPI 3: Khối lượng ảnh chụp */}
      <div className="bg-white border border-[#E2E5E9] rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Khối Lượng Không Ảnh RGB
          </div>
          <div className="text-2xl font-bold text-[#1A1D20] font-sansation mt-1">
            6,210 <span className="text-xs font-normal text-slate-500 font-sans">ảnh</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <Icon name="photo_camera" size={14} className="text-slate-400" />
            <span>GSD bình quân 1.15 cm/pixel</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
          <Icon name="photo_library" size={20} className="text-blue-600" />
        </div>
      </div>

      {/* KPI 4: Độ phủ hành lang */}
      <div className="bg-white border border-[#E2E5E9] rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Độ Phủ Hành Lang (Coverage)
          </div>
          <div className="text-2xl font-bold text-[#1A1D20] font-sansation mt-1">
            94.8% <span className="text-xs font-normal text-slate-500 font-sans">toàn tuyến</span>
          </div>
          <div className="text-[11px] text-[#2F9E44] font-medium mt-1 flex items-center gap-1">
            <Icon name="check_circle" size={14} className="text-[#2F9E44]" />
            <span>Đạt ngưỡng chất lượng &gt; 90%</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#2F9E44] flex items-center justify-center border border-emerald-100">
          <Icon name="verified" size={20} className="text-[#2F9E44]" />
        </div>
      </div>
    </div>
  )
}
