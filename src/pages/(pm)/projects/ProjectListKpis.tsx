import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { ProjectKpiStats } from './types'

interface ProjectListKpisProps {
  kpiStats: ProjectKpiStats
}

export const ProjectListKpis: React.FC<ProjectListKpisProps> = ({ kpiStats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-body">
      {/* KPI 1: Tổng chiều dài */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-brand-gold shrink-0">
          <Icon name="alt_route" size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Tổng chiều dài quản lý</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {kpiStats.totalLength} <span className="text-xs font-normal text-slate-500">km</span>
          </span>
        </div>
      </div>

      {/* KPI 2: Đang bảo hành */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-[#EDF7ED] flex items-center justify-center text-[#1B5E20] shrink-0">
          <Icon name="check_circle" size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Đang bảo hành ổn định</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {kpiStats.activeCount} <span className="text-xs font-normal text-slate-500">dự án</span>
          </span>
        </div>
      </div>

      {/* KPI 3: Sắp hết hạn */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-rose-600 shrink-0">
          <Icon name="warning" size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Sắp hết hạn (&lt;30 ngày)</span>
          <span className="text-lg font-bold text-rose-600 font-mono">
            {kpiStats.nearExpiryCount} <span className="text-xs font-normal text-slate-500">dự án</span>
          </span>
        </div>
      </div>

      {/* KPI 4: Chờ định vị tim tuyến */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
          <Icon name="schedule" size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Chờ định vị tim tuyến</span>
          <span className="text-lg font-bold text-[#D97706] font-mono">
            {kpiStats.pendingAlignmentCount} <span className="text-xs font-normal text-slate-500">dự án</span>
          </span>
        </div>
      </div>
    </div>
  )
}
