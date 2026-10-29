import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { SurveyMissionItem } from '../../../api/services/surveyService'

interface SurveyKpiCardsProps {
  missions?: SurveyMissionItem[]
}

export const SurveyKpiCards: React.FC<SurveyKpiCardsProps> = ({ missions = [] }) => {
  const totalMissions = missions.length
  const lockedCount = missions.filter((m) => m.status === 'BASELINE_LOCKED').length
  const pendingReviewMissions = missions.filter((m) => m.status === 'PENDING_AI_REVIEW')
  const scheduledMissions = missions.filter((m) => m.status === 'SCHEDULED')
  const totalAiDefects = missions.reduce((acc, m) => acc + (m.ai_defects_count || 0), 0)

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
            {String(totalMissions).padStart(2, '0')}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">nhiệm vụ</span>
          </span>
          <div className="text-[11px] text-[#2F9E44] font-medium flex items-center gap-1 mt-0.5">
            <Icon name="check_circle" size={13} className="text-[#2F9E44]" />
            <span className="truncate">{String(lockedCount).padStart(2, '0')} đợt đã khóa Baseline</span>
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
            {String(pendingReviewMissions.length).padStart(2, '0')}{' '}
            <span className="text-xs font-semibold text-rose-600 font-sans">đợt bay</span>
          </span>
          <div className="text-[11px] text-[#E5484D] font-medium flex items-center gap-1 mt-0.5">
            <Icon name="warning" size={13} className="text-[#E5484D]" />
            <span className="truncate">{totalAiDefects} khiếm khuyết AI phát hiện</span>
          </div>
        </div>
      </div>

      {/* KPI 3: Kế hoạch chờ bay */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
          <Icon name="schedule" size={22} className="text-blue-600" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Kế hoạch lên lịch</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {String(scheduledMissions.length).padStart(2, '0')}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">đợt bay</span>
          </span>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <Icon name="flight_takeoff" size={13} className="text-slate-400" />
            <span className="truncate">Sẵn sàng cất cánh khảo sát</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Đã khóa Baseline */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#EDF7ED] flex items-center justify-center text-[#1B5E20] shrink-0 border border-emerald-100">
          <Icon name="verified" size={22} className="text-[#2F9E44]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Đã khóa Baseline</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {String(lockedCount).padStart(2, '0')}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">đợt bay</span>
          </span>
          <div className="text-[11px] text-[#2F9E44] font-medium flex items-center gap-1 mt-0.5">
            <Icon name="check_circle" size={13} className="text-[#2F9E44]" />
            <span className="truncate">Đạt tiêu chuẩn hoàn công số</span>
          </div>
        </div>
      </div>
    </div>
  )
}
