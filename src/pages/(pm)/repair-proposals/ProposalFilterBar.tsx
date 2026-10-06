import React from 'react'
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react'

export interface ProposalFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  activeFilterTab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT'
  onTabChange: (tab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT') => void
  stats: {
    total: number
    draft: number
    submitted: number
    decided: number
    dispatched: number
  }
  onSetPage: (page: number) => void
  advRoute: string
  onRouteFilterChange: (route: string) => void
  advScale: string
  onScaleFilterChange: (scale: string) => void
  advContractor: string
  onContractorFilterChange: (contractor: string) => void
  onResetFilters: () => void
}

export const ProposalFilterBar: React.FC<ProposalFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilterTab,
  onTabChange,
  stats,
  onSetPage,
  advRoute,
  onRouteFilterChange,
  advScale,
  onScaleFilterChange,
  advContractor,
  onContractorFilterChange,
  onResetFilters,
}) => {
  return (
    <div className="space-y-4">
      {/* Search & Filter Tab Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value)
              onSetPage(1)
            }}
            placeholder="TÃ¬m theo mÃ£ gÃ³i, tÃªn cÃ´ng viá»‡c hoáº·c lÃ½ trÃ¬nh..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-gold transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => onTabChange('ALL')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'ALL'
                ? 'bg-brand-gold text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Táº¥t cáº£ ({stats.total})
          </button>
          <button
            onClick={() => onTabChange('SUBMITTED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'SUBMITTED'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Chá» duyá»‡t ({stats.submitted})
          </button>
          <button
            onClick={() => onTabChange('DECIDED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DECIDED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            ÄÃ£ duyá»‡t ({stats.decided})
          </button>
          <button
            onClick={() => onTabChange('DISPATCHED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DISPATCHED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Äang thi cÃ´ng ({stats.dispatched})
          </button>
          <button
            onClick={() => onTabChange('DRAFT')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'DRAFT'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Báº£n nhÃ¡p ({stats.draft})
          </button>
        </div>
      </div>

      {/* INLINE Bá»˜ Lá»ŒC TRá»°C TIáº¾P */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1 text-xs">
        <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-gold" />
          <span>Bá»™ lá»c:</span>
        </span>

        {/* Tuyáº¿n Ä‘Æ°á»ng */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Tuyáº¿n:</span>
          <select
            value={advRoute}
            onChange={(e) => {
              onRouteFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Táº¥t cáº£ tuyáº¿n Ä‘Æ°á»ng</option>
            <option value="QL1A_PK04">QL1A - Giai Ä‘oáº¡n 2 (Km 1024 - 1045)</option>
            <option value="QL1A_PK01">QL1A - Giai Ä‘oáº¡n 1 (Km 1000 - 1024)</option>
            <option value="EXPR_NORTH_SOUTH">ÄÆ°á»ng ná»‘i Cao tá»‘c Báº¯c - Nam</option>
          </select>
        </div>

        {/* Quy mÃ´ khiáº¿m khuyáº¿t */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Quy mÃ´:</span>
          <select
            value={advScale}
            onChange={(e) => {
              onScaleFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Táº¥t cáº£ quy mÃ´</option>
            <option value="LARGE">GÃ³i lá»›n (&gt; 10 khiáº¿m khuyáº¿t)</option>
            <option value="MEDIUM">GÃ³i vá»«a (5 - 10 khiáº¿m khuyáº¿t)</option>
            <option value="SMALL">GÃ³i nhá» (&lt; 5 khiáº¿m khuyáº¿t)</option>
          </select>
        </div>

        {/* Tá»• Ä‘á»™i thi cÃ´ng */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-slate-400 text-[11px] font-medium">ÄÆ¡n vá»‹ thi cÃ´ng:</span>
          <select
            value={advContractor}
            onChange={(e) => {
              onContractorFilterChange(e.target.value)
              onSetPage(1)
            }}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Táº¥t cáº£ Ä‘Æ¡n vá»‹ thi cÃ´ng</option>
            <option value="Tá»• vÃ¡ dáº·m cÆ¡ giá»›i 01">Tá»• vÃ¡ dáº·m cÆ¡ giá»›i 01</option>
            <option value="XÃ­ nghiá»‡p Cáº§u ÄÆ°á»ng 4">XÃ­ nghiá»‡p Cáº§u ÄÆ°á»ng 4</option>
            <option value="Tá»• duy tu báº£o dÆ°á»¡ng Ä‘Æ°á»ng bá»™ 03">Tá»• duy tu báº£o dÆ°á»¡ng 03</option>
            <option value="Äá»™i cÆ¡ Ä‘á»™ng">Äá»™i cÆ¡ Ä‘á»™ng kháº¯c phá»¥c sá»± cá»‘</option>
          </select>
        </div>

        {/* Reset filter button if any active */}
        {(advRoute !== 'ALL' || advScale !== 'ALL' || advContractor !== 'ALL') && (
          <button
            onClick={() => {
              onResetFilters()
              onSetPage(1)
            }}
            type="button"
            className="px-2.5 py-1.5 text-brand-gold hover:text-[#9E7B15] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Äáº·t láº¡i bá»™ lá»c</span>
          </button>
        )}
      </div>
    </div>
  )
}
