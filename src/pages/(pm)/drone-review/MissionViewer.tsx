import React from 'react'
import {
  Maximize2,
  Minimize2,
  Video,
  Eye,
  EyeOff,
  Camera,
  Map as MapIcon
} from 'lucide-react'
import { AIDetectionItem } from './types'
import { MissionViewport } from './MissionViewport'
import { MissionScrubber } from './MissionScrubber'

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
          <Video className="w-4 h-4 text-brand-gold" />
          <div>
            <h3 className="font-bold text-xs text-brand-dark leading-tight">
              Khung hÃ¬nh trÃ­ch xuáº¥t #FR-{currentFrame}
            </h3>
            <span className="font-mono text-[11px] text-slate-500">
              Äoáº¡n tráº¯c lÆ°á»£ng: {selectedItem.stationing} â€¢ Cáº£m biáº¿n RGB Sony Alpha 7R V
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
              KhÃ´ng áº£nh Drone
            </button>
            <button
              type="button"
              onClick={() => setViewerMode('GIS_MAP')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewerMode === 'GIS_MAP'
                  ? 'bg-brand-gold text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Báº£n Ä‘á»“ bay GIS (MapLibre)</span>
            </button>
          </div>

          {viewerMode === 'ORTHO' && (
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {/* Toggle AI Layer Button */}
              <button
                type="button"
                onClick={() => {
                  setIsAiOverlayVisible(!isAiOverlayVisible)
                  showToast(isAiOverlayVisible ? 'ÄÃ£ táº¯t lá»›p AI Bounding Box.' : 'ÄÃ£ báº­t lá»›p AI Bounding Box.')
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  isAiOverlayVisible
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isAiOverlayVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Lá»›p AI ({isAiOverlayVisible ? 'Báº­t' : 'Táº¯t'})</span>
              </button>

              {/* Snapshot Button */}
              <button
                onClick={() => showToast(`ÄÃ£ xuáº¥t áº£nh chá»¥p tráº¯c Ä‘á»‹a khung hÃ¬nh #FR-${currentFrame}.png`)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="Chá»¥p áº£nh khung hÃ¬nh"
                type="button"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsCanvasFullscreen(!isCanvasFullscreen)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="ToÃ n mÃ n hÃ¬nh Canvas"
                type="button"
              >
                {isCanvasFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Viewport: Ortho Photo vs Real MapLibre Map */}
      <MissionViewport
        viewerMode={viewerMode}
        corridorMapContainerRef={corridorMapContainerRef}
        isAiOverlayVisible={isAiOverlayVisible}
        detections={detections}
        selectedDetectionId={selectedDetectionId}
        onSelectDetection={onSelectDetection}
      />

      {/* Video Timeline Scrubber & Player Controls */}
      <MissionScrubber
        currentFrame={currentFrame}
        setCurrentFrame={setCurrentFrame}
        totalFrames={totalFrames}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
        selectedItem={selectedItem}
        detections={detections}
        onSelectDetection={onSelectDetection}
      />
    </section>
  )
}
