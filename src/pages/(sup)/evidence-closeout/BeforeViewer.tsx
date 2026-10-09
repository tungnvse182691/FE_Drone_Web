import React from 'react'
import { CaseItem } from './types'

export interface BeforeViewerProps {
  currentItem: CaseItem
  viewMode: 'side' | 'slider' | 'meta'
}

export const BeforeViewer: React.FC<BeforeViewerProps> = ({
  currentItem,
  viewMode
}) => {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      {/* Tiêu đề cột */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="text-xs text-slate-800 font-semibold uppercase tracking-wider">
            Ảnh trước sửa (BEFORE)
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
          {currentItem.defect_code} • Khuyết tật ban đầu
        </span>
      </div>

      {/* Vùng hiển thị ảnh */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={currentItem.before_image}
          alt="Hiện trạng hư hỏng mặt đường trước khi sửa chữa"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* HUD Overlays */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-md text-xs text-slate-800 shadow-xs flex items-center gap-1 border border-slate-200 font-medium">
          <span className="material-symbols-outlined text-[15px] text-[#C9A227]">location_on</span>
          <span>{currentItem.chainage}</span>
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
              Bảo mật tệp &amp; Cảm biến hình ảnh
            </span>
            <p className="font-mono text-xs text-slate-200">Hash SHA-256: {currentItem.before_hash}</p>
            <p className="text-xs text-slate-300">
              Độ phân giải: 4032 × 3024 px (12.2 MP) • Tiêu cự: 26mm f/1.8
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-semibold">
              Dữ liệu không gian RTK chuẩn
            </span>
            <p className="font-mono text-xs text-slate-200">{currentItem.before_gps}</p>
            <p className="text-xs text-slate-300">
              Vệ tinh: GPS + GLONASS (18 Sats lock) • Sai số đo đạc: ±1.8 cm
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin đối chứng */}
      <div className="p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-[#C9A227] shrink-0">info</span>
          <span>
            Nguồn: <strong className="text-slate-800 font-medium">{currentItem.before_source}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thời gian ghi nhận:</span>
            <span className="font-mono font-medium text-slate-800 text-xs">{currentItem.before_time}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Tọa độ GPS:</span>
            <span className="font-mono font-medium text-slate-800 text-xs">{currentItem.before_gps.split(' (')[0]}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kích thước ban đầu:</span>
            <span className="font-medium text-slate-800 text-xs">
              Sâu {currentItem.depth_cm} cm | S = {currentItem.area_m2} m²
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
            <span className="inline-flex items-center gap-1 text-[#2F9E44] font-mono font-medium text-xs">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>PASS: {currentItem.before_hash.slice(0, 8)}...</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BeforeViewer
