import React from 'react'
import { CaseItem } from './types'

export interface BeforeViewerProps {
  currentItem: CaseItem
}

export const BeforeViewer: React.FC<BeforeViewerProps> = ({ currentItem }) => {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      {/* Tiêu đề cột */}
      <div className="px-4 py-3 bg-[#F8F9FA] border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E5484D]"></span>
          <span className="text-xs text-slate-900 font-semibold uppercase tracking-wider">
            Ảnh trước khi sửa
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FDECEC] text-[#E5484D] border border-rose-200">
          {currentItem.defect_code} • Khuyết tật ban đầu
        </span>
      </div>

      {/* Vùng hiển thị ảnh */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={currentItem.before_image}
          alt="Hiện trạng hư hỏng mặt đường trước khi sửa chữa"
          className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
        />

        {/* HUD Định vị trên ảnh */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs text-slate-800 shadow-2xs flex items-center gap-1.5 border border-slate-200/80 font-medium">
          <span className="material-symbols-outlined text-[15px] text-[#C9A227]">location_on</span>
          <span>{currentItem.chainage}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-md text-white text-[11px] flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-[#2F9E44]">verified</span>
          <span>Tọa độ EXIF hợp lệ</span>
        </div>
      </div>

      {/* Thông tin đối chứng phẳng (Minimalist Grid) */}
      <div className="p-4 space-y-3 text-xs bg-white">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">camera</span>
          <span>
            Nguồn ảnh: <strong className="text-slate-900 font-medium">{currentItem.before_source}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Thời gian ghi nhận</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{currentItem.before_time}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Tọa độ GPS</span>
            <span className="font-mono font-medium text-slate-800 mt-0.5 block truncate" title={currentItem.before_gps}>
              {currentItem.before_gps.split(' (')[0]}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Kích thước ban đầu</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              Sâu {currentItem.depth_cm} cm • S = {currentItem.area_m2} m²
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BeforeViewer
