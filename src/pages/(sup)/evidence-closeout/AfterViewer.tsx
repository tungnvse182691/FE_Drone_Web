import React from 'react'
import { CaseItem } from './types'

export interface AfterViewerProps {
  currentItem: CaseItem
  viewMode: 'side' | 'slider' | 'meta'
  onToggleCitizenPublish: () => void
}

export const AfterViewer: React.FC<AfterViewerProps> = ({
  currentItem,
  viewMode,
  onToggleCitizenPublish
}) => {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      {/* Tiêu đề cột */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="text-xs text-slate-800 font-semibold uppercase tracking-wider">
            Ảnh sau sửa (AFTER)
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
          Đã thảm BTN C12.5 • Đạt K98 ({currentItem.compaction_k98})
        </span>
      </div>

      {/* Vùng hiển thị ảnh */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={currentItem.after_image}
          alt="Mặt đường bê tông nhựa sau khi vá hoàn thiện"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* HUD Overlays */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-md text-xs text-slate-800 shadow-xs flex items-center gap-1 border border-slate-200 font-medium">
          <span className="material-symbols-outlined text-[15px] text-[#C9A227]">build</span>
          <span>Crew 02 • Dynapac F1200CS</span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-md text-white text-[11px] font-mono flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-emerald-400">check</span>
          <span>EXIF HỢP LỆ</span>
        </div>

        {/* Expandable SHA-256 HUD Overlay (khi bật viewMode === 'meta') */}
        <div
          className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-4 text-white flex flex-col justify-between ${
            viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-semibold">
              Chữ ký số thiết bị thi công &amp; SHA-256
            </span>
            <p className="font-mono text-xs text-slate-200">Hash: {currentItem.after_hash}</p>
            <p className="text-xs text-slate-300">
              Độ phân giải: 4000 × 3000 px • Thiết bị: Cat S62 Pro Rugged Inspection
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-semibold">
              Tọa độ hoàn công &amp; Nhiệt độ vật lý
            </span>
            <p className="font-mono text-xs text-slate-200">{currentItem.after_gps}</p>
            <p className="text-xs text-slate-300">
              Nhiệt độ rải: {currentItem.pave_temp_c}°C • Nhiệt độ lu: {currentItem.compact_temp_c}°C • K98: {currentItem.compaction_k98}
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin đối chứng */}
      <div className="p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-[#C9A227] shrink-0">engineering</span>
          <span>
            Đơn vị thực hiện: <strong className="text-slate-800 font-medium">{currentItem.after_crew}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thời gian hoàn công:</span>
            <span className="font-mono font-medium text-slate-800 text-xs">{currentItem.after_time}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Trùng khớp vị trí:</span>
            <span className="font-mono font-medium text-[#2F9E44] text-xs">99.8% sai số &lt; 2cm</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thiết bị thi công:</span>
            <span className="font-medium text-slate-800 text-xs truncate block" title={currentItem.after_equipment}>
              {currentItem.after_equipment}
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
            <span className="inline-flex items-center gap-1 text-[#2F9E44] font-mono font-medium text-xs">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>PASS: {currentItem.after_hash.slice(0, 8)}...</span>
            </span>
          </div>
        </div>

        {/* Citizen app publish selector */}
        <label className="mt-1 pt-1.5 border-t border-slate-100 flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={currentItem.citizen_published}
            onChange={onToggleCitizenPublish}
            className="w-4 h-4 rounded text-[#C9A227] accent-[#C9A227] focus:ring-[#C9A227]"
          />
          <span className="text-xs font-medium">
            Công bố ảnh hoàn công này lên Citizen App &amp; Cổng thông tin giao thông
          </span>
        </label>
      </div>
    </div>
  )
}
export default AfterViewer
