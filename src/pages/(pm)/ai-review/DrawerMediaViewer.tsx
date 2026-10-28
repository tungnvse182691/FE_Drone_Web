import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

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
            <span>Bản đồ số GIS</span>
          </button>
          <button
            type="button"
            onClick={() => setDetailViewMode('SIDE_BY_SIDE')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              detailViewMode === 'SIDE_BY_SIDE'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="So sánh song song ảnh chụp hiện trường và bản đồ số GIS"
          >
            <Icon name="compare" size={14} />
            <span>So sánh song song</span>
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

      {detailViewMode === 'SIDE_BY_SIDE' ? (
        /* Side-by-Side Dual Viewport: Photo on Left, Live GIS Map on Right */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-60 animate-in fade-in duration-150">
          {/* Cột trái: Ảnh hiện trường */}
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group border border-slate-200">
            <img
              src={selectedCase.image_url}
              alt={selectedCase.defect_title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            {/* Top-left Telemetry Tag */}
            <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white font-mono text-[10px] flex items-center gap-1.5 border border-white/10">
              <Icon name="photo_camera" size={12} className="text-brand-gold" />
              <span>Ảnh hiện trường</span>
            </div>

            {/* Quick Zoom Button */}
            <button
              onClick={onOpenPhotoZoomModal}
              type="button"
              className="absolute bottom-2 right-2 bg-slate-950/80 hover:bg-slate-900 text-white p-1 rounded-full text-xs shadow-md border border-white/10 cursor-pointer"
              title="Phóng to ảnh"
            >
              <Icon name="zoom_in" size={14} />
            </button>

            {/* Bottom-left Info */}
            <div className="absolute bottom-2 left-2 bg-slate-900/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border border-white/20">
              <span>{selectedCase.gps.lat}°, {selectedCase.gps.lng}°</span>
            </div>
          </div>

          {/* Cột phải: Bản đồ số GIS */}
          <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
            <div ref={drawerMapContainerRef} className="w-full h-full" />
            <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white font-mono text-[10px] flex items-center gap-1.5 border border-white/10 z-10">
              <Icon name="location_on" size={12} className="text-brand-gold" />
              <span>Bản đồ số GIS</span>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 z-10">
              {selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E
            </div>
          </div>
        </div>
      ) : detailViewMode === 'PHOTO' ? (
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
              <Icon name="location_on" size={12} className="text-brand-gold" />
              <span>
                {selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E
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
            {selectedCase.source === 'CITIZEN' && (
              <>
                <span className="opacity-40">•</span>
                <span className="opacity-90 text-amber-300">Ảnh chụp thiết bị di động</span>
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
              <Icon name="person" size={13} className="text-amber-400" />
              <span>
                Phản ánh hiện trường người dân • Chờ khảo sát kỹ thuật
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Live Mini MapLibre in Drawer */
        <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
          <div ref={drawerMapContainerRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
            {selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E
          </div>
        </div>
      )}
    </>
  )
}
