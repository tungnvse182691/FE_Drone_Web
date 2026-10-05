import React from 'react'
import { Link } from 'react-router-dom'
import {
  Maximize2,
  Minimize2,
  Video,
  Eye,
  EyeOff,
  PlaneTakeoff,
  Sliders,
  Layers,
  Camera,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MapPin,
  Compass,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  Map as MapIcon
} from 'lucide-react'
import { AIDetectionItem } from './types'

export interface MissionViewerProps {
  isCanvasFullscreen: boolean
  setIsCanvasFullscreen: React.Dispatch<React.SetStateAction<boolean>>
  viewerMode: 'ORTHO' | 'GIS_MAP'
  setViewerMode: (mode: 'ORTHO' | 'GIS_MAP') => void
  isAiOverlayVisible: boolean
  setIsAiOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>
  currentFrame: number
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>
  totalFrames: number
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  playbackSpeed: number
  setPlaybackSpeed: React.Dispatch<React.SetStateAction<number>>
  selectedDetectionId: string
  onSelectDetection: (item: AIDetectionItem) => void
  detections: AIDetectionItem[]
  selectedItem: AIDetectionItem
  corridorMapContainerRef: React.RefObject<HTMLDivElement | null>
  showToast: (msg: string) => void
}

export const MissionViewer: React.FC<MissionViewerProps> = ({
  isCanvasFullscreen,
  setIsCanvasFullscreen,
  viewerMode,
  setViewerMode,
  isAiOverlayVisible,
  setIsAiOverlayVisible,
  currentFrame,
  setCurrentFrame,
  totalFrames,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  selectedDetectionId,
  onSelectDetection,
  detections,
  selectedItem,
  corridorMapContainerRef,
  showToast
}) => {
  return (
        <section
          className={`lg:col-span-7 bg-white border border-brand-border rounded-xl shadow-2xs overflow-hidden flex flex-col ${
            isCanvasFullscreen ? 'fixed inset-4 z-50 max-w-none h-auto' : ''
          }`}
        >
          {/* Canvas Header */}
          <div className="p-3 bg-slate-50 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#C9A227]" />
              <div>
                <h3 className="font-bold text-xs text-brand-dark leading-tight">
                  Khung hình trích xuất #FR-{currentFrame}
                </h3>
                <span className="font-mono text-[11px] text-slate-500">
                  Đoạn trắc lượng: {selectedItem.stationing} • Cảm biến RGB Sony Alpha 7R V
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Mode Switcher: Ortho vs Live MapLibre Map */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold mr-1">
                <button
                  type="button"
                  onClick={() => setViewerMode('ORTHO')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    viewerMode === 'ORTHO'
                      ? 'bg-white text-brand-dark shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Không ảnh Drone
                </button>
                <button
                  type="button"
                  onClick={() => setViewerMode('GIS_MAP')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    viewerMode === 'GIS_MAP'
                      ? 'bg-[#C9A227] text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Bản đồ bay GIS (MapLibre)</span>
                </button>
              </div>

              {viewerMode === 'ORTHO' && (
                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  {/* Toggle AI Layer Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiOverlayVisible(!isAiOverlayVisible)
                      showToast(isAiOverlayVisible ? 'Đã tắt lớp AI Bounding Box.' : 'Đã bật lớp AI Bounding Box.')
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                      isAiOverlayVisible
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isAiOverlayVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>Lớp AI ({isAiOverlayVisible ? 'Bật' : 'Tắt'})</span>
                  </button>

                  {/* Snapshot Button */}
                  <button
                    onClick={() => showToast(`Đã xuất ảnh chụp trắc địa khung hình #FR-${currentFrame}.png`)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    title="Chụp ảnh khung hình"
                    type="button"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setIsCanvasFullscreen(!isCanvasFullscreen)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    title="Toàn màn hình Canvas"
                    type="button"
                  >
                    {isCanvasFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Viewport: Ortho Photo vs Real MapLibre Map */}
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

          {/* Video Timeline Scrubber & Player Controls */}
          <div className="p-3 bg-white flex flex-col gap-2 border-t border-slate-200">
            <div className="flex items-center justify-between font-mono text-xs text-slate-500">
              <span className="text-slate-800 font-bold">02:14</span>
              <span className="text-xs">
                Đang xem: <strong>{selectedItem.stationing}</strong> (Frame {currentFrame} / {totalFrames})
              </span>
              <span>03:45</span>
            </div>

            {/* Scrubber track */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                setCurrentFrame(Math.floor(ratio * totalFrames))
              }}
              className="w-full bg-slate-100 h-2 rounded-full relative cursor-pointer group"
            >
              <div
                className="bg-[#C9A227] h-full rounded-full transition-all"
                style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
              ></div>

              {/* Defect marker dots along timeline */}
              {detections.map((d) => {
                const percent = ((d.kmValue - 1024) / (1030 - 1024)) * 100
                const dotColor =
                  d.status === 'APPROVED'
                    ? 'bg-emerald-500'
                    : d.status === 'REJECTED'
                    ? 'bg-slate-400'
                    : d.confidence >= 90
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                return (
                  <div
                    key={d.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectDetection(d)
                    }}
                    style={{ left: `${percent}%` }}
                    className={`absolute top-0 bottom-0 w-2 ${dotColor} rounded-full transition-transform hover:scale-150`}
                    title={`${d.code}: ${d.type} tại ${d.stationing}`}
                  ></div>
                )
              })}

              {/* Scrubber thumb */}
              <div
                style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-[#C9A227] rounded-full shadow border-2 border-white pointer-events-none"
              ></div>
            </div>

            {/* Player buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentFrame((prev) => Math.max(1, prev - 50))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Lùi 50 frames"
                  type="button"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-full bg-[#C9A227] hover:bg-[#B38E1F] text-white shadow-xs flex items-center justify-center cursor-pointer transition-all"
                  title={isPlaying ? 'Tạm dừng' : 'Phát'}
                  type="button"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setCurrentFrame((prev) => Math.min(totalFrames, prev + 50))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Tiến 50 frames"
                  type="button"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Speed toggle */}
                <button
                  onClick={() => setPlaybackSpeed((s) => (s === 1.0 ? 2.0 : s === 2.0 ? 0.5 : 1.0))}
                  className="font-mono text-[11px] text-slate-500 hover:text-slate-800 ml-2 px-2 py-0.5 rounded bg-slate-100 cursor-pointer"
                >
                  {playbackSpeed}x Speed
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/pm/projects/prj-ql1a-02/alignment"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Xem trên GIS (MapLibre)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

  )
}
