import React from 'react'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'

export interface ConflictFilterBarProps {
  conflicts: SyncConflictItem[]
  filterType: string
  setFilterType: (type: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  stats: {
    total: number
    pending: number
    reassign: number
    policyMismatch: number
    rescuePending: number
  }
}

export const ConflictFilterBar: React.FC<ConflictFilterBarProps> = ({
  conflicts,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  stats
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-brand-border shadow-2xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-brand-gold text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({conflicts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'PENDING'
              ? 'bg-brand-gold text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chờ phân giải ({stats.pending})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('RESCUE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'RESCUE'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cứu dữ liệu thiết bị ({stats.rescuePending})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'RESOLVED'
              ? 'bg-brand-gold text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã phân giải ({conflicts.length - stats.pending})
        </button>
      </div>

      <div className="relative min-w-[280px]">
        <Icon name="search" size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm mã xung đột, mã lỗi, lý trình, thợ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>
    </div>
  )
}
