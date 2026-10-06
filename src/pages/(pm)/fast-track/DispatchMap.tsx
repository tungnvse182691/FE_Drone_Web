import React from 'react'
import { MapPin, Users2 } from 'lucide-react'
import { RouteConfig } from './types'

export interface DispatchMapProps {
  currentRouteConfig: RouteConfig
  mapLayer: 'SATELLITE' | 'VECTOR'
  setMapLayer: (layer: 'SATELLITE' | 'VECTOR') => void
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  selectedDefectIds: string[]
}

export const DispatchMap: React.FC<DispatchMapProps> = ({
  currentRouteConfig,
  mapLayer,
  setMapLayer,
  mapContainerRef,
  selectedDefectIds
}) => {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-gold" />
          <span className="text-xs font-bold text-brand-dark">
            Báº£n Äá»“ Hiá»‡n TrÆ°á»ng GIS & Lá»™ TrÃ¬nh Tuyáº¿n: {currentRouteConfig.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-[11px] shadow-2xs">
            <button
              type="button"
              onClick={() => setMapLayer('SATELLITE')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                mapLayer === 'SATELLITE' ? 'bg-brand-gold text-white font-bold' : 'text-slate-600'
              }`}
            >
              Vá»‡ tinh
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('VECTOR')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                mapLayer === 'VECTOR' ? 'bg-brand-gold text-white font-bold' : 'text-slate-600'
              }`}
            >
              Vector OSM
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-inner border border-slate-300 bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-mono border border-white/10 pointer-events-none z-10 shadow-md">
          <div className="flex items-center gap-1.5 text-brand-gold font-bold">
            <Users2 className="w-3.5 h-3.5" />
            <span>{currentRouteConfig.code}: {currentRouteConfig.stationRange}</span>
          </div>
          <div className="text-slate-300 mt-0.5">
            {selectedDefectIds.length} Ä‘iá»ƒm Ä‘Ã£ chá»n â€¢ Xanh lÃ¡: Äáº¡t chuáº©n â€¢ Äá» nháº¥p nhÃ¡y: Vi pháº¡m ngÆ°á»¡ng
          </div>
        </div>
      </div>
    </div>
  )
}
