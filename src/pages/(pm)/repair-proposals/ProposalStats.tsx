import React from 'react'
import { Icon } from '../../../components/ui/Icon'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 font-body">
      {/* Stat 1: Draft */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'DRAFT' ? 'ALL' : 'DRAFT')}
        className={`bg-white rounded-xl p-4 shadow-2xs border transition-colors cursor-pointer flex flex-col justify-between ${
          activeFilterTab === 'DRAFT' ? 'border-brand-gold ring-1 ring-brand-gold' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">Gói đang soạn thảo</span>
            <span className="text-2xl font-bold text-slate-900 font-headline">{stats.draft.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Icon name="edit" size={18} />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Chưa khóa trình duyệt</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-[#F8F9FA] text-[#2D3748] border border-slate-200">
            DRAFT
          </span>
        </div>
      </div>

      {/* Stat 2: Submitted */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
        className={`bg-white rounded-xl p-4 shadow-2xs border transition-colors cursor-pointer flex flex-col justify-between ${
          activeFilterTab === 'SUBMITTED' ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-amber-700">Gói chờ duyệt</span>
            <span className="text-2xl font-bold text-amber-700 font-headline">{stats.submitted.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="schedule" size={18} />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Supervisor thẩm định</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-[#FEF3E2] text-[#F59E0B] border border-amber-200">
            SUBMITTED
          </span>
        </div>
      </div>

      {/* Stat 3: Decided */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'DECIDED' ? 'ALL' : 'DECIDED')}
        className={`bg-white rounded-xl p-4 shadow-2xs border transition-colors cursor-pointer flex flex-col justify-between ${
          activeFilterTab === 'DECIDED' ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-emerald-800">Gói đã phê duyệt</span>
            <span className="text-2xl font-bold text-emerald-700 font-headline">{stats.decided.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E9F7EC] text-[#2F9E44] border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="check_circle" size={18} />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Đã phê duyệt phương án</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-[#E9F7EC] text-[#2F9E44] border border-emerald-200">
            APPROVED
          </span>
        </div>
      </div>

      {/* Stat 4: Dispatched */}
      <div
        onClick={() => onTabChange(activeFilterTab === 'DISPATCHED' ? 'ALL' : 'DISPATCHED')}
        className={`bg-white rounded-xl p-4 shadow-2xs border transition-colors cursor-pointer flex flex-col justify-between ${
          activeFilterTab === 'DISPATCHED' ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-blue-800">Gói đã giao việc</span>
            <span className="text-2xl font-bold text-blue-700 font-headline">{stats.dispatched.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="local_shipping" size={18} />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Đã phân công tổ thi công</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
            ASSIGNED
          </span>
        </div>
      </div>
    </div>
  )
}
export default ProposalStats
