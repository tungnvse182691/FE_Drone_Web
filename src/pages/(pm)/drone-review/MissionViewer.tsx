import React from 'react'
import { Icon } from '../../../components/ui/Icon'
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
  selectedItem?: AIDetectionItem | null
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
      className={`lg:col-span-7 bg-white border border-[#E2E5E9] rounded-xl shadow-2xs overflow-hidden flex flex-col ${
        isCanvasFullscreen ? 'fixed inset-4 z-50 max-w-none h-auto' : ''
      }`}
    >
      {/* Canvas Header */}
      <div className="p-3 bg-slate-50 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Icon name="photo_camera" size={18} className="text-[#C9A227]" />
          <div>
            <h3 className="font-bold text-xs text-[#1A1D20] leading-tight">
              Khung hình trích xuất {selectedItem ? `#FR-${selectedItem.id === 'DET-01' ? '1420' : selectedItem.id === 'DET-02' ? '1480' : selectedItem.id === 'DET-03' ? '1540' : selectedItem.id === 'DET-04' ? '1590' : selectedItem.id === 'DET-05' ? '1680' : selectedItem.id === 'DET-06' ? '1720' : selectedItem.id === 'DET-07' ? '1810' : '1880'}` : `#FR-${currentFrame}`}
            </h3>
            <span className="font-mono text-[11px] text-slate-500">
              {selectedItem ? `${selectedItem.stationing} (${selectedItem.lane})` : 'Toàn tuyến'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mode Switcher: Ortho vs Live MapLibre Map */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold mr-1">
            <button
              type="button"
              onClick={() => setViewerMode('ORTHO')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewerMode === 'ORTHO'
                  ? 'bg-white text-[#1A1D20] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Không ảnh
            </button>
            <button
              type="button"
              onClick={() => setViewerMode('GIS_MAP')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                viewerMode === 'GIS_MAP'
                  ? 'bg-[#C9A227] text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon name="map" size={14} />
              <span>Bản đồ GIS</span>
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
                <Icon name={isAiOverlayVisible ? 'visibility' : 'visibility_off'} size={14} />
                <span>Lớp AI ({isAiOverlayVisible ? 'Bật' : 'Tắt'})</span>
              </button>

              {/* Snapshot Button */}
              <button
                onClick={() => showToast(`Đã xuất ảnh chụp trắc địa khung hình #FR-${currentFrame}.png`)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="Chụp ảnh khung hình"
                type="button"
              >
                <Icon name="photo_camera" size={16} />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsCanvasFullscreen(!isCanvasFullscreen)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="Toàn màn hình Canvas"
                type="button"
              >
                <Icon name="fullscreen_exit" size={16} />
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
        selectedItem={selectedItem}
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
