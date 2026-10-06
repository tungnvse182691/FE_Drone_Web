import React from 'react'
import { MapPin, X } from 'lucide-react'
import type { TriageCase } from './types'

export interface GisMapModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCase: TriageCase
  modalMapType: 'SATELLITE' | 'STREET'
  setModalMapType: (type: 'SATELLITE' | 'STREET') => void
  modalMapContainerRef: React.RefObject<HTMLDivElement | null>
}

export const GisMapModal: React.FC<GisMapModalProps> = ({
  isOpen,
  onClose,
  selectedCase,
  modalMapType,
  setModalMapType,
  modalMapContainerRef,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-gold" />
            <div>
              <h3 className="text-base font-bold text-brand-dark">Vá»‹ TrÃ­ Báº£n Äá»“ KhÃ´ng Gian (GIS WGS84)</h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedCase.code} â€¢ {selectedCase.stationing} ({selectedCase.gps.lat}Â° N, {selectedCase.gps.lng}Â° E)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalMapType('SATELLITE')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  modalMapType === 'SATELLITE'
                    ? 'bg-brand-gold text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                áº¢nh vá»‡ tinh Google (Satellite)
              </button>
              <button
                type="button"
                onClick={() => setModalMapType('STREET')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  modalMapType === 'STREET'
                    ? 'bg-brand-gold text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Báº£n Ä‘á»“ giao thÃ´ng (Vector)
              </button>
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>VÃ¹ng Ä‘á»‡m cá»¥m: 2.5m (Spatial Cluster)</span>
            </div>
          </div>

          <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
            <div ref={modalMapContainerRef} className="w-full h-full" />
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[11px] font-mono border border-white/10 z-10 pointer-events-none">
              Há»‡ quy chiáº¿u: WGS-84 / UTM Zone 32648 (EPSG:32648) â€¢ BÃ¡n kÃ­nh cá»¥m: 2.5m
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            ÄÃ³ng báº£n Ä‘á»“
          </button>
        </div>
      </div>
    </div>
  )
}
