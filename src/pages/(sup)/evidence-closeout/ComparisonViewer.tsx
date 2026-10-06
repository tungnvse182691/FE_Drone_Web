import React from 'react'
import {
  Check,
  Columns,
  SlidersHorizontal,
  Fingerprint,
  Camera
} from 'lucide-react'
import { CaseItem } from './types'
import { BeforeViewer } from './BeforeViewer'
import { AfterViewer } from './AfterViewer'

export interface ComparisonViewerProps {
  currentItem: CaseItem
  viewMode: 'side' | 'slider' | 'meta'
  setViewMode: (mode: 'side' | 'slider' | 'meta') => void
  sliderPosition: number
  setSliderPosition: (pos: number) => void
  isPMView: boolean
  onToggleCitizenPublish: () => void
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  currentItem,
  viewMode,
  setViewMode,
  sliderPosition,
  setSliderPosition,
  isPMView: _isPMView,
  onToggleCitizenPublish
}) => {
  return (
    <section className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
      {/* Section Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-sansation">
            <Camera className="w-5 h-5 text-brand-gold" />
            Đối chứng bằng chứng hình ảnh hiện trường (BEFORE vs AFTER Integrity Audit)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xác minh ảnh chụp gốc, tọa độ đo đạc không gian RTK và chữ ký số thiết bị máy rải/xe lu Dynapac.
          </p>
        </div>

        {/* View Mode Switcher: Song song, Vuốt trượt, Metadata */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-2xs self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('side')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'side' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Chế độ song song</span>
          </button>

          <button
            onClick={() => setViewMode('slider')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'slider' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-gold" />
            <span>Vuốt trượt (Curtain)</span>
          </button>

          <button
            onClick={() => setViewMode('meta')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'meta' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-purple-700" />
            <span>Đối chiếu metadata SHA-256</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1 & 3: SIDE-BY-SIDE HOẶC METADATA OVERLAY */}
      {viewMode !== 'slider' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BeforeViewer currentItem={currentItem} viewMode={viewMode} />
          <AfterViewer
            currentItem={currentItem}
            viewMode={viewMode}
            onToggleCitizenPublish={onToggleCitizenPublish}
          />
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE SLIDER CURTAIN */}
      {viewMode === 'slider' && (
        <div className="space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md select-none bg-slate-900 border border-slate-200">
            {/* After image (Lớp nền dưới) */}
            <img
              src={currentItem.after_image}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Before image (Lớp phủ trên được clip theo sliderPosition) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img
                src={currentItem.before_image}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Tag BEFORE */}
              <div className="absolute top-4 left-4 bg-rose-600/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>BEFORE (Trước sửa)</span>
              </div>
            </div>

            {/* Tag AFTER */}
            <div className="absolute top-4 right-4 bg-emerald-600/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>AFTER (Sau hoàn công)</span>
            </div>

            {/* Vạch chia Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl border-2 border-brand-gold flex items-center justify-center text-xs font-bold pointer-events-none">
                ↔
              </div>
            </div>

            {/* Thanh kéo input ngầm */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="font-semibold text-rose-700">← Kéo sang trái để xem toàn bộ ảnh AFTER</span>
            <span className="font-mono font-bold text-slate-800">Tỷ lệ vuốt: {sliderPosition}%</span>
            <span className="font-semibold text-emerald-700">Kéo sang phải để xem toàn bộ ảnh BEFORE →</span>
          </div>
        </div>
      )}
    </section>
  )
}
export default ComparisonViewer