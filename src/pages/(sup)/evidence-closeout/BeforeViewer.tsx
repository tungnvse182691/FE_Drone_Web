import React from 'react'
import {
  Check,
  Milestone,
  Lock,
  MapPin
} from 'lucide-react'
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
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-brand-border shadow-2xs">
      {/* Column Header */}
      <div className="p-3.5 bg-slate-50 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
            Ảnh trước sửa (BEFORE EVIDENCE)
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          {currentItem.defect_code} • Khuyết tật ban đầu
        </span>
      </div>

      {/* Photo Container */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={currentItem.before_image}
          alt="Hiện trạng hư hỏng mặt đường trước khi sửa chữa"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* HUD Overlays */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-900 shadow-xs flex items-center gap-1.5 border border-slate-200 font-medium">
          <MapPin className="w-3.5 h-3.5 text-brand-gold" />
          <span>{currentItem.chainage}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          EXIF UNALTERED
        </div>

        {/* Expandable SHA-256 HUD Overlay (khi bật viewMode === 'meta') */}
        <div
          className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-5 text-white flex flex-col justify-between ${
            viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-brand-gold font-bold">
              Bảo mật tệp &amp; Cảm biến hình ảnh
            </span>
            <p className="font-mono text-xs text-slate-200">Hash SHA-256: {currentItem.before_hash}</p>
            <p className="text-xs text-slate-300">
              Độ phân giải gốc: 4032 × 3024 px (12.2 MP) • Tiêu cự: 26mm f/1.8
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-brand-gold font-bold">
              Dữ liệu không gian RTK chuẩn
            </span>
            <p className="font-mono text-xs text-slate-200">{currentItem.before_gps}</p>
            <p className="text-xs text-slate-300">
              Vệ tinh: GPS + GLONASS (18 Sats lock) • Sai số đo đạc: ±1.8 cm
            </p>
          </div>
        </div>
      </div>

      {/* Proof Metadata Box */}
      <div className="p-4 space-y-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Milestone className="w-4 h-4 text-brand-gold shrink-0" />
          <span>
            Nguồn ghi nhận: <strong className="text-slate-900 font-semibold">{currentItem.before_source}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thời gian ghi nhận:</span>
            <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.before_time}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Tọa độ GPS chuẩn:</span>
            <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.before_gps.split(' (')[0]}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Kích thước ban đầu:</span>
            <span className="font-semibold text-slate-900 text-xs">
              Sâu {currentItem.depth_cm} cm | S = {currentItem.area_m2} m²
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold text-xs">
              <Lock className="w-3.5 h-3.5" />
              PASS: {currentItem.before_hash.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
