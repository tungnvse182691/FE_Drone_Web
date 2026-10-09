import React from 'react'
import { CaseItem } from './types'

export interface StatusBarProps {
  currentItem: CaseItem
}

export const StatusBar: React.FC<StatusBarProps> = ({ currentItem }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Phân loại luồng thi công (Track badge) */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
          currentItem.track_type === 'APPROVAL_TRACK'
            ? 'bg-slate-100 text-slate-800 border-slate-200'
            : currentItem.track_type === 'FAST_TRACK'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}
      >
        <span className="material-symbols-outlined text-[14px] text-slate-600">
          {currentItem.track_type === 'FAST_TRACK' ? 'bolt' : 'route'}
        </span>
        <span>
          {currentItem.track_type === 'APPROVAL_TRACK'
            ? 'Nhánh: Phê duyệt tiêu chuẩn'
            : currentItem.track_type === 'FAST_TRACK'
            ? 'Nhánh: Cấp bách Fast Track'
            : 'Nhánh: Điều phối khẩn'}
        </span>
      </span>

      {/* Trạng thái nghiệm thu */}
      {currentItem.status === 'ACCEPTED' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
          <span className="material-symbols-outlined text-[15px] leading-none">check_circle</span>
          <span>{currentItem.status_label}</span>
        </span>
      )}
      {currentItem.status === 'PENDING_INSPECTION' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#FEF3E2] text-[#B45309] border border-[#FDE68A]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>{currentItem.status_label}</span>
        </span>
      )}
      {currentItem.status === 'REWORK_REQUIRED' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#FDECEC] text-[#E5484D] border border-[#F8B4B4]">
          <span className="material-symbols-outlined text-[15px] leading-none">error</span>
          <span>YÊU CẦU SỬA LẠI</span>
        </span>
      )}

      {/* Lần thi công */}
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <span className="material-symbols-outlined text-[14px]">history</span>
        <span>Lần #{currentItem.attempt_number}</span>
      </span>

      {/* SLA Nghiệm thu */}
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
        <span className="material-symbols-outlined text-[14px]">schedule</span>
        <span>SLA: Còn 18h</span>
      </span>

      {/* Mã băm kiểm toán SHA-256 */}
      <span className="font-mono text-slate-500 text-[11px] px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200">
        SHA-256: 7B8F..A49
      </span>
    </div>
  )
}
export default StatusBar
