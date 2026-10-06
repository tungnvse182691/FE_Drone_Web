import React from 'react'
import { Search } from 'lucide-react'
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
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-brand-gold text-white shadow-xs font-sansation'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Táº¥t cáº£ ({conflicts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'PENDING'
              ? 'bg-brand-gold text-white shadow-xs font-sansation'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chá» phÃ¢n giáº£i ({stats.pending})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('RESCUE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'RESCUE'
              ? 'bg-purple-600 text-white shadow-xs font-sansation'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cá»©u dá»¯ liá»‡u thiáº¿t bá»‹ ({stats.rescuePending})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'RESOLVED'
              ? 'bg-brand-gold text-white shadow-xs font-sansation'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ÄÃ£ phÃ¢n giáº£i ({conflicts.length - stats.pending})
        </button>
      </div>

      <div className="relative min-w-[280px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="TÃ¬m mÃ£ xung Ä‘á»™t, mÃ£ lá»—i, lÃ½ trÃ¬nh, thá»£..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
        />
      </div>
    </div>
  )
}
