import React from 'react'
import { CaseItem } from './types'

export interface AfterViewerProps {
  currentItem: CaseItem
}

export const AfterViewer: React.FC<AfterViewerProps> = ({ currentItem }) => {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      {/* Tiêu đề cột */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="text-xs text-slate-800 font-semibold uppercase tracking-wider">
            Ảnh sau khi sửa
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
          Đã hoàn thành • Đạt K98 ({currentItem.compaction_k98})
        </span>
      </div>

      {/* Vùng hiển thị ảnh */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={currentItem.after_image}
          alt="Mặt đường bê tông nhựa sau khi vá hoàn thiện"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* HUD Định vị trên ảnh */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-md text-xs text-slate-800 shadow-xs flex items-center gap-1 border border-slate-200 font-medium">
          <span className="material-symbols-outlined text-[15px] text-[#C9A227]">build</span>
          <span>{currentItem.after_crew.split(' - ')[0]}</span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-md text-white text-[11px] flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-emerald-400">check</span>
          <span>Tọa độ EXIF hợp lệ</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thời gian hoàn thành:</span>
            <span className="font-medium text-slate-800 text-xs">{currentItem.after_time}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Tọa độ GPS:</span>
            <span className="font-mono font-medium text-slate-800 text-xs">{currentItem.after_gps.split(' (')[0]}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Thiết bị thi công:</span>
            <span className="font-medium text-slate-800 text-xs truncate block" title={currentItem.after_equipment}>
              {currentItem.after_equipment}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AfterViewer
