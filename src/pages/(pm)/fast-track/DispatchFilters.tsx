import React from 'react'
import { RefreshCw } from 'lucide-react'

export interface DispatchFiltersProps {
  routeFilter: string
  handleRouteChange: (routeId: string) => void
  crewFilter: string
  setCrewFilter: (crew: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
}

export const DispatchFilters: React.FC<DispatchFiltersProps> = ({
  routeFilter,
  handleRouteChange,
  crewFilter,
  setCrewFilter,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 uppercase">Tuyáº¿n Ä‘Æ°á»ng & PhÃ¢n Ä‘oáº¡n</label>
        <select
          value={routeFilter}
          onChange={(e) => handleRouteChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
        >
          <option value="QL1A_PK04">QL1A - Giai Ä‘oáº¡n 2 (Km 1025 - Km 1045)</option>
          <option value="QL1A_PK01">QL1A - Giai Ä‘oáº¡n 1 (Km 1000 - Km 1025)</option>
          <option value="EXPRESSWAY_LINK">ÄÆ°á»ng ná»‘i Cao tá»‘c Báº¯c - Nam (Km 0 - Km 12)</option>
          <option value="PHANTHIET_DAUGIAY">Cao tá»‘c Phan Thiáº¿t - Dáº§u GiÃ¢y (Km 45 - Km 65)</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 uppercase">Äá»™i hiá»‡n trÆ°á»ng phÃ¢n bá»•</label>
        <select
          value={crewFilter}
          onChange={(e) => setCrewFilter(e.target.value)}
          className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
        >
          <option value="ALL">Táº¥t cáº£ cÃ¡c tá»• Ä‘á»™i</option>
          <option value="Tá»• tuáº§n tra sá»‘ 01">Tá»• tuáº§n tra sá»‘ 01 - Ká»¹ sÆ° KiÃªn</option>
          <option value="Tá»• Ä‘o Ä‘áº¡c sá»‘ 02">Tá»• Ä‘o Ä‘áº¡c sá»‘ 02 - Ká»¹ sÆ° Minh</option>
          <option value="Tá»• cÆ¡ Ä‘á»™ng">Tá»• cÆ¡ Ä‘á»™ng báº£o dÆ°á»¡ng Ä‘Æ°á»ng bá»™ 03</option>
          <option value="ChÆ°a chá»‰ Ä‘á»‹nh">ChÆ°a chá»‰ Ä‘á»‹nh phÃ¢n cÃ´ng</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 uppercase">Tráº¡ng thÃ¡i Fast Track</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <option value="ALL">Táº¥t cáº£ tráº¡ng thÃ¡i tiÃªu chuáº©n</option>
          <option value="ELIGIBLE">Chá»‰ hiá»ƒn thá»‹ Äáº¡t chuáº©n (â‰¤ 0.5 mÂ²)</option>
          <option value="VIOLATION">Chá»‰ hiá»ƒn thá»‹ Vi pháº¡m ngÆ°á»¡ng (&gt; 0.5 mÂ²)</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={() => {
            setCrewFilter('ALL')
            setStatusFilter('ALL')
          }}
          type="button"
          className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Äáº·t láº¡i bá»™ lá»c</span>
        </button>
      </div>
    </div>
  )
}
