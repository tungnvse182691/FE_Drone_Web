import React from 'react'
import { MapPin, Maximize2, ZoomIn } from 'lucide-react'
import type { TriageCase } from './types'

export interface DrawerMediaViewerProps {
  selectedCase: TriageCase
  detailViewMode: 'PHOTO' | 'GIS_MAP'
  setDetailViewMode: (mode: 'PHOTO' | 'GIS_MAP') => void
  drawerMapContainerRef: React.RefObject<HTMLDivElement | null>
  onOpenPhotoZoomModal: () => void
  onOpenGISModal: () => void
}

export const DrawerMediaViewer: React.FC<DrawerMediaViewerProps> = ({
  selectedCase,
  detailViewMode,
  setDetailViewMode,
  drawerMapContainerRef,
  onOpenPhotoZoomModal,
  onOpenGISModal,
}) => {
  return (
    <>
      {/* View Mode Toggle: Photo vs Live MapLibre Map */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDetailViewMode('PHOTO')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              detailViewMode === 'PHOTO'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            áº¢nh chá»¥p hiá»‡n trÆ°á»ng
          </button>
          <button
            type="button"
            onClick={() => setDetailViewMode('GIS_MAP')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              detailViewMode === 'GIS_MAP'
                ? 'bg-brand-gold text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Báº£n Ä‘á»“ MapLibre</span>
          </button>
        </div>

        <button
          onClick={onOpenGISModal}
          type="button"
          className="text-xs font-bold text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>PhÃ³ng to GIS</span>
        </button>
      </div>

      {detailViewMode === 'PHOTO' ? (
        /* Photo Viewport with Telemetry HUD */
        <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group h-52">
          <img
            src={selectedCase.image_url}
            alt={selectedCase.defect_title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {/* Top-left GPS & telemetry overlay */}
          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-[10px] flex items-center gap-2 shadow-md border border-white/10">
            <div className="flex items-center gap-1 font-bold text-brand-gold">
              <MapPin className="w-3 h-3 text-brand-gold" />
              <span>
                {selectedCase.gps.lat}Â° N, {selectedCase.gps.lng}Â° E
              </span>
            </div>
            <span className="opacity-40">â€¢</span>
            <span className="opacity-90">Alt: {selectedCase.gps.altitude_m}m</span>
            <span className="opacity-40">â€¢</span>
            <span className="opacity-90">Res: {selectedCase.gps.resolution_cm_px}cm/px</span>
          </div>

          {/* Bottom-right quick view buttons */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            <button
              onClick={onOpenPhotoZoomModal}
              type="button"
              className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white p-1.5 rounded-full transition-colors flex items-center shadow-md border border-white/10 cursor-pointer"
              title="Xem áº£nh gá»‘c Ä‘á»™ phÃ¢n giáº£i cao"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenGISModal}
              type="button"
              className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 shadow-md border border-white/10 cursor-pointer"
              title="Má»Ÿ vá»‹ trÃ­ trÃªn báº£n Ä‘á»“ GIS"
            >
              <MapPin className="w-3 h-3 text-brand-gold" />
              <span>Báº£n Ä‘á»“ GIS</span>
            </button>
          </div>

          {/* Bottom-left AI Confidence Tag */}
          <div className="absolute bottom-2.5 left-2.5 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>
              AI Confidence: {selectedCase.ai_confidence}% ({selectedCase.defect_title})
            </span>
          </div>
        </div>
      ) : (
        /* Live Mini MapLibre in Drawer */
        <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
          <div ref={drawerMapContainerRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
            {selectedCase.gps.lat}Â° N, {selectedCase.gps.lng}Â° E
          </div>
        </div>
      )}
    </>
  )
}
