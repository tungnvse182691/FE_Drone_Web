import React from 'react'
import {
  Check,
  Wrench,
  Lock,
  HardHat
} from 'lucide-react'
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
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-brand-border shadow-2xs">
      {/* Column Header */}
      <div className="p-3.5 bg-slate-50 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
            Ảnh sau sửa (AFTER EVIDENCE)
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Đã thảm nhựa C12.5 • Đạt lu lèn K98 ({currentItem.compaction_k98})
        </span>
      </div>

      {/* Photo Container */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={currentItem.after_image}
          alt="Mặt đường bê tông nhựa sau khi vá phẳng phiu, lu lèn chặt chẽ"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* HUD Overlays */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-900 shadow-xs flex items-center gap-1.5 border border-slate-200 font-medium">
          <Wrench className="w-3.5 h-3.5 text-brand-gold" />
          <span>Crew 02 • Máy Dynapac F1200CS</span>
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
              Chữ ký số thiết bị thi công &amp; SHA-256
            </span>
            <p className="font-mono text-xs text-slate-200">Hash: {currentItem.after_hash}</p>
            <p className="text-xs text-slate-300">
              Độ phân giải: 4000 × 3000 px • Thiết bị: Cat S62 Pro Rugged Inspection
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-brand-gold font-bold">
              Tọa độ hoàn công &amp; Nhiệt độ vật lý
            </span>
            <p className="font-mono text-xs text-slate-200">{currentItem.after_gps}</p>
            <p className="text-xs text-slate-300">
              Nhiệt độ thảm lúc rải: {currentItem.pave_temp_c}°C • Sau lu lèn: {currentItem.compact_temp_c}°C • K98: {currentItem.compaction_k98}
            </p>
          </div>
        </div>
      </div>

      {/* Proof Metadata Box */}
      <div className="p-4 space-y-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <HardHat className="w-4 h-4 text-brand-gold shrink-0" />
          <span>
            Đơn vị thực hiện: <strong className="text-slate-900 font-semibold">{currentItem.after_crew}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thời gian hoàn công:</span>
            <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.after_time}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Trùng khớp vị trí:</span>
            <span className="font-mono font-bold text-emerald-700 text-xs">99.8% sai số &lt; 2cm</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thiết bị thi công:</span>
            <span className="font-semibold text-slate-900 text-xs truncate block" title={currentItem.after_equipment}>
              {currentItem.after_equipment}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold text-xs">
              <Lock className="w-3.5 h-3.5" />
              PASS: {currentItem.after_hash.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Citizen app publish selector */}
        <label className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg">
          <input
            type="checkbox"
            checked={currentItem.citizen_published}
            onChange={onToggleCitizenPublish}
            className="w-4 h-4 rounded text-brand-gold accent-brand-gold focus:ring-brand-gold"
          />
          <span className="text-xs text-slate-800 font-semibold">
            Chọn ảnh này làm ảnh chuẩn công bố cho ứng dụng dân cư (Citizen App &amp; Cổng thông tin giao thông)
          </span>
        </label>
      </div>
    </div>
  )
}
