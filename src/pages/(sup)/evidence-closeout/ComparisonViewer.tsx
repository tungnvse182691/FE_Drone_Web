import React from 'react'
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
    <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
      {/* Section Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 font-sansation">
            <span className="material-symbols-outlined text-[20px] text-[#C9A227]">photo_camera</span>
            <span>Đối chứng hình ảnh hiện trường (BEFORE vs AFTER)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xác minh ảnh chụp gốc, tọa độ đo đạc không gian RTK và chữ ký số thiết bị thi công.
          </p>
        </div>

        {/* Chế độ xem: Song song, Vuốt trượt, Metadata */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('side')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'side'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">view_column</span>
            <span>Song song</span>
          </button>

          <button
            onClick={() => setViewMode('slider')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#C9A227]">tune</span>
            <span>Vuốt trượt</span>
          </button>

          <button
            onClick={() => setViewMode('meta')}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'meta'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-purple-700">fingerprint</span>
            <span>Metadata SHA-256</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1 & 3: SIDE-BY-SIDE HOẶC METADATA OVERLAY */}
      {viewMode !== 'slider' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
        <div className="space-y-3">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-xs select-none bg-slate-900 border border-slate-200">
            {/* After image (Lớp nền dưới) */}
            <img
              src={currentItem.after_image}
              alt="Sau thi công"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Before image (Lớp phủ trên được clip theo sliderPosition) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img
                src={currentItem.before_image}
                alt="Trước thi công"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Tag BEFORE */}
              <div className="absolute top-3 left-3 bg-rose-600/90 text-white font-medium text-xs px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>BEFORE (Trước sửa)</span>
              </div>
            </div>

            {/* Tag AFTER */}
            <div className="absolute top-3 right-3 bg-emerald-600/90 text-white font-medium text-xs px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">check</span>
              <span>AFTER (Sau hoàn công)</span>
            </div>

            {/* Vạch chia Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-7 h-7 rounded-full bg-white text-slate-800 shadow-md border border-[#C9A227] flex items-center justify-center text-xs font-bold pointer-events-none">
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

          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-600">← Kéo sang trái: Ảnh AFTER</span>
            <span className="font-mono font-medium text-slate-800">Tỷ lệ: {sliderPosition}%</span>
            <span className="text-slate-600">Kéo sang phải: Ảnh BEFORE →</span>
          </div>
        </div>
      )}
    </section>
  )
}
export default ComparisonViewer