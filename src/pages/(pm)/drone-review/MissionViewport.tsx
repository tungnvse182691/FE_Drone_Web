import React from 'react'
import { PlaneTakeoff, AlertTriangle, Sliders, MapPin } from 'lucide-react'
import { AIDetectionItem } from './types'

export interface MissionViewportProps {
  viewerMode: 'ORTHO' | 'GIS_MAP'
  corridorMapContainerRef: React.RefObject<HTMLDivElement | null>
  isAiOverlayVisible: boolean
  detections: AIDetectionItem[]
  selectedDetectionId: string
  onSelectDetection: (item: AIDetectionItem) => void
}

export const MissionViewport: React.FC<MissionViewportProps> = ({
  viewerMode,
  corridorMapContainerRef,
  isAiOverlayVisible,
  detections,
  selectedDetectionId,
  onSelectDetection
}) => {
  return (
    <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden select-none group">
      {viewerMode === 'GIS_MAP' ? (
        <div className="w-full h-full relative">
          <div ref={corridorMapContainerRef} className="w-full h-full" />
          <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-white font-mono text-[11px] border border-white/10 z-10 pointer-events-none shadow-lg">
            <div className="flex items-center gap-1.5 font-bold text-[#C9A227]">
              <PlaneTakeoff className="w-3.5 h-3.5" />
              <span>Hành lang bay Drone 6.0 km (Km 1024+000 → Km 1030+000)</span>
            </div>
            <div className="text-slate-300 text-[10px] mt-0.5">
              8 điểm phát hiện AI được ghim trực tiếp theo tọa độ WGS84 • Bấm marker để xem chi tiết
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Ảnh chụp trắc địa mặt đường thực tế từ trên cao */}
          <img
            alt="Surface Road Drone Frame"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1578873375969-d65275e7a938?w=1400&auto=format&fit=crop&q=80"
          />

          {/* Vignette Gradient Shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>

          {/* AI Bounding Boxes (Chỉ hiển thị khi isAiOverlayVisible === true) */}
          {isAiOverlayVisible && (
            <>
              {/* Bounding Box 1: Ổ gà DET-01 */}
              <div
                onClick={() => onSelectDetection(detections[0])}
                style={{
                  top: detections[0].bbox.top,
                  left: detections[0].bbox.left,
                  width: detections[0].bbox.width,
                  height: detections[0].bbox.height,
                  borderColor: detections[0].bbox.borderColor
                }}
                className={`absolute border-2 rounded-lg transition-all cursor-pointer ${
                  selectedDetectionId === 'DET-01'
                    ? 'shadow-[0_0_20px_rgba(239,68,68,0.8)] ring-2 ring-white scale-102'
                    : 'shadow-[0_0_12px_rgba(239,68,68,0.4)] opacity-90 hover:opacity-100'
                }`}
              >
                {/* Corner marks */}
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white"></div>

                {/* Label tag */}
                <div className="absolute -top-7 left-0 bg-red-600 text-white px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap text-[11px] font-mono font-bold">
                  <AlertTriangle className="w-3 h-3 text-white" />
                  <span>{detections[0].bbox.label}</span>
                </div>

                {/* Dimensions badge */}
                <div className="absolute -bottom-6 right-0 bg-slate-900/90 backdrop-blur-md text-white px-2 py-0.5 rounded font-mono text-[10px] shadow">
                  {detections[0].bbox.dims}
                </div>
              </div>

              {/* Bounding Box 2: Nứt dọc DET-02 */}
              <div
                onClick={() => onSelectDetection(detections[1])}
                style={{
                  top: detections[1].bbox.top,
                  left: detections[1].bbox.left,
                  width: detections[1].bbox.width,
                  height: detections[1].bbox.height,
                  borderColor: detections[1].bbox.borderColor
                }}
                className={`absolute border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                  selectedDetectionId === 'DET-02'
                    ? 'shadow-[0_0_20px_rgba(249,115,22,0.8)] ring-2 ring-white scale-102'
                    : 'shadow-[0_0_12px_rgba(249,115,22,0.4)] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="absolute -top-7 left-0 bg-amber-600 text-white px-2 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap text-[10px] font-mono font-bold">
                  <Sliders className="w-3 h-3" />
                  <span>{detections[1].bbox.label}</span>
                </div>
                <div className="absolute -bottom-6 left-0 bg-slate-900/85 backdrop-blur-md text-white px-1.5 py-0.5 rounded font-mono text-[10px]">
                  {detections[1].bbox.dims}
                </div>
              </div>
            </>
          )}

          {/* Drone Nadir Reticle (Tâm ngắm trắc địa) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Telemetry HUD Overlay Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2.5 text-[11px] font-mono pointer-events-none shadow-md border border-slate-700/60">
            <span className="flex items-center gap-1 text-sky-300">
              <MapPin className="w-3.5 h-3.5" />
              16.0544° N, 108.2022° E
            </span>
            <span className="text-slate-500">|</span>
            <span>AGL: 45.0m</span>
            <span className="text-slate-500">|</span>
            <span>V: 4.2 m/s</span>
            <span className="text-slate-500">|</span>
            <span className="text-[#FEF08A] font-bold">GSD: 0.35 cm/px</span>
          </div>
        </>
      )}
    </div>
  )
}
