import React, { useState, useEffect } from 'react'
import { Defect } from '../../../types/domain'
import { Icon } from '../../../components/ui/Icon'
import { DefectType } from '../../../types/enums'
import { formatDefectTypeLabel } from '../../../api/services/surveyService'

export interface BoundingBoxCoords {
  x: number // 0..1 (left)
  y: number // 0..1 (top)
  width: number // 0..1
  height: number // 0..1
}

interface DefectBoundingBoxViewerProps {
  defect: Defect
  currentType?: DefectType | string
  customTypeLabel?: string
}

export const DefectBoundingBoxViewer: React.FC<DefectBoundingBoxViewerProps> = ({
  defect,
  currentType,
  customTypeLabel
}) => {
  const bbox = defect.bounding_box
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  useEffect(() => setImageLoadFailed(false), [defect.id, defect.image_url])

  const displayType = currentType || defect.defect_type
  const displayTypeLabel = formatDefectTypeLabel(displayType, customTypeLabel)
  const stationingLabel = !Number.isFinite(defect.chainage_km) ? 'Chưa có lý trình từ server' : `Km ${Math.floor(defect.chainage_km)}+${String(Math.round((defect.chainage_km % 1) * 1000)).padStart(3, '0')}`

  return (
    <div className="space-y-3">
      {/* Thanh công cụ tương tác Khung nhận diện */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Icon name="crop_free" size={16} className="text-[#C9A227]" />
            <span>Thẩm định khung nhận diện AI</span>
          </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Khung nhận diện ({(defect.confidence_score * 100).toFixed(0)}%)
            </span>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-[#14171A] aspect-video flex items-center justify-center select-none">
        {defect.image_url && !imageLoadFailed ? (
          <img
            src={defect.image_url}
            alt={defect.code}
            onError={() => setImageLoadFailed(true)}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          /* Khung trực giao kỹ thuật khi tệp CSDL là khung hình mô phỏng */
          <div className="absolute inset-0 bg-[#1B1F24] flex flex-col justify-between p-4 pointer-events-none">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                backgroundSize: '36px 36px'
              }}
            />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[72%] bg-[#22272E] border-x-2 border-slate-500/40">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-amber-400/50" />
            </div>
            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700">
                Vị trí: {stationingLabel}
                {defect.timestamp_ms != null ? ` • Trích xuất tại mốc ${defect.timestamp_ms}ms (${(defect.timestamp_ms / 1000).toFixed(2)}s)` : ''}
              </span>
              <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700">
                Mô hình AI: {defect.fixture_version || 'Road-YOLOv9'}
              </span>
            </div>
          </div>
        )}

        <div
          className="absolute border-2 border-[#C9A227] bg-[#C9A227]/15 pointer-events-none z-20"
          style={{
            left: `${bbox.x * 100}%`,
            top: `${bbox.y * 100}%`,
            width: `${bbox.width * 100}%`,
            height: `${bbox.height * 100}%`
          }}
        >
          {/* Nhãn loại lỗi & nhận diện AI phía trên khung */}
          <div className="absolute -top-6 left-0 flex items-center gap-1 bg-[#1A1D20]/95 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-md border border-white/20 whitespace-nowrap pointer-events-none">
            <span className="text-[#C9A227]">{displayTypeLabel}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200 font-mono">
              {(defect.confidence_score * 100).toFixed(0)}%
            </span>
          </div>

        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-end text-[11px] text-white/80 bg-slate-950/75 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none z-20">
          <div className="text-amber-300 font-mono font-semibold text-[11px]">
            Khung bao: [{bbox.x.toFixed(2)}, {bbox.y.toFixed(2)}, {bbox.width.toFixed(2)}, {bbox.height.toFixed(2)}]
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefectBoundingBoxViewer
