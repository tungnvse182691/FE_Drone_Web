import React from 'react'
import { CaseItem } from './types'

export interface AfterViewerProps {
  currentItem: CaseItem
}

export const AfterViewer: React.FC<AfterViewerProps> = ({ currentItem }) => {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      {/* Tiêu đề cột */}
      <div className="px-4 py-3 bg-[#F8F9FA] border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2F9E44]"></span>
          <span className="text-xs text-slate-900 font-semibold uppercase tracking-wider">
            Ảnh sau khi sửa
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
          Đã hoàn thành • Đạt K98 ({currentItem.compaction_k98})
        </span>
      </div>

      {/* Vùng hiển thị ảnh */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={currentItem.after_image}
          alt="Mặt đường bê tông nhựa sau khi vá hoàn thiện"
          className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
        />

        {/* HUD Định vị trên ảnh */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs text-slate-800 shadow-2xs flex items-center gap-1.5 border border-slate-200/80 font-medium">
          <span className="material-symbols-outlined text-[15px] text-[#C9A227]">engineering</span>
          <span>{currentItem.after_crew.split(' - ')[0]}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-md text-white text-[11px] flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-[#2F9E44]">verified</span>
          <span>Tọa độ EXIF hợp lệ</span>
        </div>
      </div>

      {/* Thông tin đối chứng phẳng (Minimalist Grid) */}
      <div className="p-4 space-y-3 text-xs bg-white">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">groups</span>
          <span>
            Đơn vị thực hiện: <strong className="text-slate-900 font-medium">{currentItem.after_crew}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Thời gian hoàn thành</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{currentItem.after_time}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Tọa độ GPS</span>
            <span className="font-mono font-medium text-slate-800 mt-0.5 block truncate" title={currentItem.after_gps}>
              {currentItem.after_gps.split(' (')[0]}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Thiết bị thi công</span>
            <span className="font-medium text-slate-800 mt-0.5 block truncate" title={currentItem.after_equipment}>
              {currentItem.after_equipment}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AfterViewer
