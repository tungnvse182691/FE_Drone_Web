import React from 'react'
import { CaseItem } from './types'
import { EvidencePhoto } from './EvidencePhoto'
import { NO_DATA, fmtTime } from './acceptanceLabels'

export interface AfterViewerProps {
  currentItem: CaseItem
}

export const AfterViewer: React.FC<AfterViewerProps> = ({ currentItem }) => {
  const ref = currentItem.after_ref
  const finished = currentItem.construction_end
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      {/* Tiêu đề cột */}
      <div className="px-4 py-3 bg-[#F8F9FA] border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2F9E44]"></span>
          <span className="text-xs text-slate-900 font-semibold uppercase tracking-wider">
            Ảnh sau khi sửa
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
            Crew kết thúc thi công: {finished ? fmtTime(finished) : NO_DATA}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF3E2] text-[#B45309] border border-[#FDE68A]">
            Hồ sơ: {currentItem.status_label}
          </span>
        </div>
      </div>

      {/* Vùng hiển thị ảnh */}
      <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
        <EvidencePhoto projectId={currentItem.project_id} photo={ref} alt="Mặt đường sau khi sửa chữa (ảnh AFTER của bản nộp)" emptyText="Chưa có ảnh sau: bản nộp hiện hành không có ảnh AFTER" />

        {/* HUD Crew */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs text-slate-800 shadow-2xs flex items-center gap-1.5 border border-slate-200/80 font-medium max-w-[85%]">
          <span className="material-symbols-outlined text-[15px] text-[#C9A227]">engineering</span>
          <span className="truncate">{currentItem.after_crew.split(' - ')[0]}</span>
        </div>
      </div>

      {/* Thông tin đối chứng phẳng (Minimalist Grid) */}
      <div className="p-4 space-y-3 text-xs bg-white">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">groups</span>
          <span>
            Crew thực hiện: <strong className="text-slate-900 font-medium">{currentItem.after_crew}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Kết thúc thi công (Crew)</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{finished ? fmtTime(finished) : NO_DATA}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Thời điểm nộp bản nộp</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{currentItem.submitted_at ? fmtTime(currentItem.submitted_at) : NO_DATA}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Tọa độ GPS</span>
            <span className="font-mono font-medium text-slate-800 mt-0.5 block truncate" title={currentItem.after_gps}>
              {currentItem.after_gps.split(' (')[0]}
            </span>
          </div>
        </div>
        <details className="text-[11px] text-slate-500">
          <summary className="cursor-pointer text-slate-600 font-medium">Chi tiết mã</summary>
          <div className="mt-1 space-y-0.5 font-mono break-all">
            <div>Crew ID: {currentItem.crew_id || NO_DATA}</div>
            <div>Bản nộp hiện hành: {currentItem.submission_id || NO_DATA}{currentItem.submission_revision != null ? ` (bản nộp #${currentItem.submission_revision})` : ''}</div>
            <div>Tệp ảnh sau: {ref?.fileId || NO_DATA}</div>
            <div>Checksum: {ref?.checksum || NO_DATA}</div>
            <div>Nguồn mốc thời gian thi công: {currentItem.time_provenance || NO_DATA}</div>
          </div>
        </details>
      </div>
    </div>
  )
}
export default AfterViewer
