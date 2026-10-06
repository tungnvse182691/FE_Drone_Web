import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Layers,
  RefreshCw
} from 'lucide-react'
import { RiskPortfolioItem } from './types'
import { MOCK_RISK_ITEMS } from './mockData'

export interface DashboardRiskMapProps {
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapLayer: 'satellite' | 'vector'
  setMapLayer: (l: 'satellite' | 'vector') => void
  activePinItem: RiskPortfolioItem | undefined
  filteredRiskItems: RiskPortfolioItem[]
  onZoomIn: () => void
  onZoomOut: () => void
  onFitBounds: () => void
}

export const DashboardRiskMap: React.FC<DashboardRiskMapProps> = ({
  mapContainerRef,
  mapLayer,
  setMapLayer,
  activePinItem,
  filteredRiskItems,
  onZoomIn,
  onZoomOut,
  onFitBounds
}) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xs border border-slate-200">
      <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-gold" />
          <h3 className="font-sansation font-bold text-slate-900 text-sm">
            Bản đồ danh mục rủi ro hư hỏng (GIS Risk Portfolio)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[11px] font-bold text-rose-700 bg-red-100/80 rounded-full border border-red-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            High Risk ({filteredRiskItems.filter((i: RiskPortfolioItem) => i.risk_level === 'Critical').length})
          </span>
          <span className="px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 bg-sky-100 rounded-full border border-sky-200">
            Watch ({MOCK_RISK_ITEMS.filter((i) => i.risk_level === 'Watch').length})
          </span>
        </div>
      </div>

      {/* Map Viewport Area with real MapLibre GL */}
      <div className="relative w-full h-[400px] bg-slate-900 overflow-hidden select-none">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Map HUD Detail on Active Pin */}
        {activePinItem && (
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 text-white text-xs space-y-1.5 max-w-xs shadow-xl pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-brand-gold">{activePinItem.project_name}</span>
              <span
                className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                  activePinItem.risk_level === 'Critical' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
                }`}
              >
                {activePinItem.risk_level}
              </span>
            </div>
            <p className="text-slate-300 font-mono text-[11px]">{activePinItem.chainage_display}</p>
            <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>{activePinItem.defect_scope_display}</span>
              <span className="font-bold text-rose-400">{activePinItem.sla_remaining}</span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Độ gồ ghề PCI: <strong className="text-white font-mono">{activePinItem.pci_score}</strong></span>
              <button
                onClick={() => navigate('/sup/proposals')}
                className="text-brand-gold hover:underline font-semibold cursor-pointer"
              >
                Xem gói đề xuất &gt;
              </button>
            </div>
          </div>
        )}

        {/* Map Control Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 shadow-md pointer-events-auto">
          <button
            onClick={() => onZoomIn()}
            type="button"
            className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
            title="Phóng to"
          >
            +
          </button>
          <button
            onClick={() => onZoomOut()}
            type="button"
            className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
            title="Thu nhỏ"
          >
            -
          </button>
          <button
            onClick={() => setMapLayer(mapLayer === 'satellite' ? 'vector' : 'satellite')}
            type="button"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-xs cursor-pointer border ${
              mapLayer === 'satellite'
                ? 'bg-brand-gold text-white border-brand-gold'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
            title={mapLayer === 'satellite' ? 'Đang bật vệ tinh (Bấm đổi Street)' : 'Đang bật Street (Bấm đổi Vệ tinh)'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitBounds}
            type="button"
            className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-bold transition shadow-xs cursor-pointer border border-slate-200"
            title="Đặt lại góc nhìn toàn tuyến"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
