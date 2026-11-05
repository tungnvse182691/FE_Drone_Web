import React from 'react'
import { ProjectKpiStats } from './types'

interface ProjectListKpisProps {
  kpiStats: ProjectKpiStats
}

export const ProjectListKpis: React.FC<ProjectListKpisProps> = ({ kpiStats }) => {
  return <div className="grid grid-cols-2 gap-4">
    <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-500">Đang hoạt động</p><p className="text-xl font-bold text-slate-900">{kpiStats.activeCount}</p></div>
    <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-500">Đã đóng</p><p className="text-xl font-bold text-slate-900">{kpiStats.closedCount}</p></div>
  </div>
}
