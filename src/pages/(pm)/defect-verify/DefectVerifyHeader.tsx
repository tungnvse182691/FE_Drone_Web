import React from 'react'
import { ArrowLeft, Layers, SplitSquareHorizontal, Map as MapIcon } from 'lucide-react'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Defect } from '../../../types/domain'
import { Severity } from '../../../types/enums'

interface DefectVerifyHeaderProps {
  defect: Defect
  severity: Severity
  viewMode: 'SINGLE' | 'TEMPORAL' | 'GIS_MAP'
  setViewMode: (mode: 'SINGLE' | 'TEMPORAL' | 'GIS_MAP') => void
  onBack: () => void
}

export const DefectVerifyHeader: React.FC<DefectVerifyHeaderProps> = ({
  defect,
  severity,
  viewMode,
  setViewMode,
  onBack
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              Tháº©m Äá»‹nh Chi Tiáº¿t HÆ° Há»ng: {defect.code}
            </h1>
            <StatusBadge status={defect.status} />
            <StatusBadge status={severity} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            LÃ½ trÃ¬nh: Km{defect.chainage_km} â€¢ Tá»a Ä‘á»™ GPS: ({defect.gps_lat}, {defect.gps_lng})
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          onClick={() => setViewMode('SINGLE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            viewMode === 'SINGLE'
              ? 'bg-white text-brand-dark shadow-xs'
              : 'text-slate-600 hover:text-brand-dark'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          MÃ n 08: ÄÆ¡n Ká»³ (Bounding Box)
        </button>
        <button
          onClick={() => setViewMode('TEMPORAL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            viewMode === 'TEMPORAL'
              ? 'bg-white text-brand-goldDark shadow-xs'
              : 'text-slate-600 hover:text-brand-dark'
          }`}
        >
          <SplitSquareHorizontal className="w-3.5 h-3.5" />
          MÃ n 09: Äa Ká»³ (TrÆ°á»›c/Sau)
        </button>
        <button
          onClick={() => setViewMode('GIS_MAP')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            viewMode === 'GIS_MAP'
              ? 'bg-brand-gold text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-brand-dark'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          Báº£n Äá»“ GIS (MapLibre)
        </button>
      </div>
    </div>
  )
}
