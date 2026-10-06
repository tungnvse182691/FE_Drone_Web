import React from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Map as MapIcon
} from 'lucide-react'
import { AIDetectionItem } from './types'

export interface MissionScrubberProps {
  currentFrame: number
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>
  totalFrames: number
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  playbackSpeed: number
  setPlaybackSpeed: React.Dispatch<React.SetStateAction<number>>
  selectedItem: AIDetectionItem
  detections: AIDetectionItem[]
  onSelectDetection: (item: AIDetectionItem) => void
}

export const MissionScrubber: React.FC<MissionScrubberProps> = ({
  currentFrame,
  setCurrentFrame,
  totalFrames,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  selectedItem,
  detections,
  onSelectDetection
}) => {
  return (
    <div className="p-3 bg-white flex flex-col gap-2 border-t border-slate-200">
      <div className="flex items-center justify-between font-mono text-xs text-slate-500">
        <span className="text-slate-800 font-bold">02:14</span>
        <span className="text-xs">
          Äang xem: <strong>{selectedItem.stationing}</strong> (Frame {currentFrame} / {totalFrames})
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
          className="bg-brand-gold h-full rounded-full transition-all"
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
              title={`${d.code}: ${d.type} táº¡i ${d.stationing}`}
            ></div>
          )
        })}

        {/* Scrubber thumb */}
        <div
          style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-brand-gold rounded-full shadow border-2 border-white pointer-events-none"
        ></div>
      </div>

      {/* Player buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentFrame((prev) => Math.max(1, prev - 50))}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="LÃ¹i 50 frames"
            type="button"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-brand-gold hover:bg-[#B38E1F] text-white shadow-xs flex items-center justify-center cursor-pointer transition-all"
            title={isPlaying ? 'Táº¡m dá»«ng' : 'PhÃ¡t'}
            type="button"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCurrentFrame((prev) => Math.min(totalFrames, prev + 50))}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Tiáº¿n 50 frames"
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
            <MapIcon className="w-3.5 h-3.5 text-brand-gold" />
            <span>Xem trÃªn GIS (MapLibre)</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
