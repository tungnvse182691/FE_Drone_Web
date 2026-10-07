import React from 'react'
import {
  Edit3,
  Clock,
  CheckCircle2,
  Construction
} from 'lucide-react'

export interface ProposalStatsProps {
  stats: {
    draft: number
    submitted: number
    decided: number
    dispatched: number
  }
  activeFilterTab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT'
  onTabChange: (tab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT') => void
}

export const ProposalStats: React.FC<ProposalStatsProps> = ({
  stats,
  activeFilterTab,
  onTabChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Stat 1: Draft */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'DRAFT' ? 'ALL' : 'DRAFT')}
        className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${activeFilterTab === 'DRAFT' ? 'border-brand-gold ring-2 ring-brand-gold/20' : 'border-slate-200'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Gói đang soạn thảo</span>
            <span className="text-3xl font-bold text-brand-dark">{stats.draft.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Chưa khóa trình duyệt, đang gom lỗi</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 text-slate-600">
            DRAFT
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-400"></div>
      </div>

      {/* Stat 2: Submitted */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
        className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${activeFilterTab === 'SUBMITTED' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700">Gói chờ duyệt</span>
            <span className="text-3xl font-bold text-amber-600">{stats.submitted.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Supervisor thẩm định (SLA &le; 14h)</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-800">
            SUBMITTED
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
      </div>

      {/* Stat 3: Decided */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'DECIDED' ? 'ALL' : 'DECIDED')}
        className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${activeFilterTab === 'DECIDED' ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-800">Gói đã phê duyệt</span>
            <span className="text-3xl font-bold text-emerald-700">{stats.decided.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Đã ký số, chuẩn bị phát lệnh</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
            DECIDED
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600"></div>
      </div>

      {/* Stat 4: Dispatched */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'DISPATCHED' ? 'ALL' : 'DISPATCHED')}
        className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${activeFilterTab === 'DISPATCHED' ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-200'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[11px] uppercase tracking-wider text-blue-800">Gói đang thi công</span>
            <span className="text-3xl font-bold text-blue-700">{stats.dispatched.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Construction className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Tổ thi công rải thảm và vá dặm</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-blue-100 text-blue-800">
            DISPATCHED
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
      </div>
    </div>
  )
}
