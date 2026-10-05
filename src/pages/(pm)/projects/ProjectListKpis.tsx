import React from 'react'
import {
  Route,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { ProjectKpiStats } from './types'

interface ProjectListKpisProps {
  kpiStats: ProjectKpiStats
}

export const ProjectListKpis: React.FC<ProjectListKpisProps> = ({ kpiStats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng chiều dài */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#C9A227] shrink-0">
          <Route className="w-5 h-5 stroke-[2.2]" />
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
        <div className="w-11 h-11 rounded-xl bg-[#EDF7ED] flex items-center justify-center text-[#1B5E20] shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
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
        <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-rose-600 shrink-0">
          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
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
        <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
          <Clock className="w-5 h-5 stroke-[2.2]" />
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
