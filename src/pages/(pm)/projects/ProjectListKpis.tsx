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
      {/* KPI 1: Tá»•ng chiá»u dÃ i */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-brand-gold shrink-0">
          <Route className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Tá»•ng chiá»u dÃ i quáº£n lÃ½</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {kpiStats.totalLength} <span className="text-xs font-normal text-slate-500">km</span>
          </span>
        </div>
      </div>

      {/* KPI 2: Äang báº£o hÃ nh */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#EDF7ED] flex items-center justify-center text-[#1B5E20] shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Äang báº£o hÃ nh á»•n Ä‘á»‹nh</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {kpiStats.activeCount} <span className="text-xs font-normal text-slate-500">dá»± Ã¡n</span>
          </span>
        </div>
      </div>

      {/* KPI 3: Sáº¯p háº¿t háº¡n */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-rose-600 shrink-0">
          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Sáº¯p háº¿t háº¡n (&lt;30 ngÃ y)</span>
          <span className="text-lg font-bold text-rose-600 font-mono">
            {kpiStats.nearExpiryCount} <span className="text-xs font-normal text-slate-500">dá»± Ã¡n</span>
          </span>
        </div>
      </div>

      {/* KPI 4: Chá» Ä‘á»‹nh vá»‹ tim tuyáº¿n */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 truncate">Chá» Ä‘á»‹nh vá»‹ tim tuyáº¿n</span>
          <span className="text-lg font-bold text-[#D97706] font-mono">
            {kpiStats.pendingAlignmentCount} <span className="text-xs font-normal text-slate-500">dá»± Ã¡n</span>
          </span>
        </div>
      </div>
    </div>
  )
}
