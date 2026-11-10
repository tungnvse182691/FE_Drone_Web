import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'
import { CaseReportImage } from './useCaseReportMedia'

export interface DrawerMediaViewerProps {
  selectedCase: TriageCase
  detailViewMode: 'PHOTO' | 'GIS_MAP' | 'SIDE_BY_SIDE'
  setDetailViewMode: (mode: 'PHOTO' | 'GIS_MAP' | 'SIDE_BY_SIDE') => void
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
      {/* View Mode Toggle: Photo vs Live GIS Map vs Side-by-Side Comparison */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDetailViewMode('PHOTO')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              detailViewMode === 'PHOTO'
                ? 'bg-white text-brand-dark shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ảnh chụp hiện trường
          </button>
          <button
            type="button"
            onClick={() => setDetailViewMode('GIS_MAP')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              detailViewMode === 'GIS_MAP'
                ? 'bg-brand-gold text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon name="location_on" size={14} />
            <span>Vị trí bản đồ GIS</span>
          </button>
        </div>

        <button
          onClick={onOpenGISModal}
          type="button"
          className="text-xs font-bold text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Icon name="fullscreen" size={16} />
          <span>Xem toàn màn hình GIS</span>
        </button>
      </div>

      {detailViewMode === 'PHOTO' ? (
        /* Photo Viewport with Telemetry HUD */
        <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group h-80 lg:h-[380px]">
          <CaseReportImage caseId={selectedCase.id} alt={selectedCase.defect_title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
          {/* Top-left GPS & telemetry overlay */}
          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-[10px] flex items-center gap-2 shadow-md border border-white/10">
            <div className="flex items-center gap-1 font-bold text-brand-gold">
              <Icon name="location_on" size={12} className="text-brand-gold" />
              <span>
                {selectedCase.gps.lat != null && selectedCase.gps.lng != null ? `${selectedCase.gps.lat}° N, ${selectedCase.gps.lng}° E` : 'Chưa có vị trí được xác nhận'}
              </span>
            </div>
            {selectedCase.source === 'DRONE_AI' && selectedCase.gps.altitude_m > 0 && (
              <>
                <span className="opacity-40">•</span>
                <span className="opacity-90">Alt: {selectedCase.gps.altitude_m}m</span>
              </>
            )}
            {selectedCase.source === 'DRONE_AI' && selectedCase.gps.resolution_cm_px > 0 && (
              <>
                <span className="opacity-40">•</span>
                <span className="opacity-90">Res: {selectedCase.gps.resolution_cm_px}cm/px</span>
              </>
            )}
            {selectedCase.source === 'PATROL' && (
              <>
                <span className="opacity-40">•</span>
                <span className="opacity-90 text-amber-300">Ghi nhận từ thiết bị tuần tra</span>
              </>
            )}
          </div>

          {/* Bottom-right quick view buttons */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            <button
              onClick={onOpenPhotoZoomModal}
              type="button"
              className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white p-1.5 rounded-full transition-colors flex items-center shadow-md border border-white/10 cursor-pointer"
              title="Xem ảnh gốc độ phân giải cao"
            >
              <Icon name="zoom_in" size={16} />
            </button>
            <button
              onClick={onOpenGISModal}
              type="button"
              className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 shadow-md border border-white/10 cursor-pointer"
              title="Mở vị trí trên bản đồ GIS"
            >
              <Icon name="location_on" size={14} className="text-brand-gold" />
              <span>Bản đồ GIS</span>
            </button>
          </div>

          {/* Bottom-left Information Tag */}
          {selectedCase.source === 'DRONE_AI' && selectedCase.ai_confidence > 0 ? (
            <div className="absolute bottom-2.5 left-2.5 bg-red-600/95 text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-white/20">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>
                Độ tin cậy AI: {selectedCase.ai_confidence}% • {selectedCase.defect_title}
              </span>
            </div>
          ) : (
            <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/20">
              <Icon name="engineering" size={13} className="text-amber-400" />
              <span>{selectedCase.source === 'PATROL' ? 'Ghi nhận hiện trường Đội tuần tra' : selectedCase.source === 'CITIZEN' ? 'Phản ánh từ người dân' : 'Chưa xác định nguồn tiếp nhận'}</span>
            </div>
          )}
        </div>
      ) : (
        /* Live Mini MapLibre in Drawer */
        <div className="w-full h-80 lg:h-[380px] rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
          <div ref={drawerMapContainerRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
            {selectedCase.gps.lat != null && selectedCase.gps.lng != null ? `${selectedCase.gps.lat}° N, ${selectedCase.gps.lng}° E` : 'Chưa có vị trí được xác nhận'}
          </div>
        </div>
      )}
    </>
  )
}
