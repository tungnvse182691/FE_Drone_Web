import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectHighlightsGridProps {
  project: HubProject
  mainlineLengthKm?: number
  branchesLengthKm?: number
  branchesCount?: number
}

export const ProjectHighlightsGrid: React.FC<ProjectHighlightsGridProps> = ({
  project,
  mainlineLengthKm = 0,
  branchesLengthKm = 0,
  branchesCount = 0
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-body">
      {/* Card 1: Thời hạn bảo hành (#C9A227 Gold) */}
      <div className="relative bg-white border-[1.5px] border-[#C9A227]/30 rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(201,162,39,0.15)] bg-gradient-to-b from-[#C9A227]/[0.03] via-white/50 to-white">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] to-amber-200" />
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
              <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">
                Thời hạn bảo hành công trình
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                Còn {project.days_remaining} ngày
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-[10px] bg-[#C9A227]/10 text-[#8C6D1F] flex items-center justify-center shrink-0">
            <Icon name="calendar_month" size={20} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Hết hạn: <strong className="text-slate-900 font-mono">{project.warranty_end_date || '3 năm từ bàn giao'}</strong></span>
            <span className="font-mono font-bold text-[#8C6D1F]">{project.warranty_passed_percent}% đã qua</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#C9A227] h-full rounded-full transition-all duration-500"
              style={{ width: `${project.warranty_passed_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Tuyến Chính & Tuyến Phụ (#1E40AF Blue) */}
      <div className="relative bg-white border-[1.5px] border-[#1E40AF]/25 rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(30,64,175,0.15)] bg-gradient-to-b from-[#1E40AF]/[0.03] via-white/50 to-white">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] to-blue-200" />
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
              <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">
                Khối lượng tuyến &amp; Phân đoạn
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {project.length_km > 0 ? `${project.length_km} km` : '0 km'}
              </span>
              <span className="text-[11px] font-bold text-[#1E40AF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {project.kml_status || 'Chưa duyệt tim'}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-[10px] bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center shrink-0">
            <Icon name="alt_route" size={20} />
          </div>
        </div>

        {/* Khối bóc tách chi tiết: Tuyến chính & Tuyến phụ */}
        <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
              <span>Trục chính:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {mainlineLengthKm > 0 ? `${mainlineLengthKm} km` : (project.length_km > 0 ? `${project.length_km} km` : '0 km')}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Tuyến phụ:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {branchesCount > 0 ? (
                <span className="text-amber-800 font-bold">
                  {branchesLengthKm} km ({branchesCount} nhánh)
                </span>
              ) : (
                <span className="text-slate-400 font-normal italic">0 km (0 nhánh)</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Dải lý trình trục chính:</span>
          <span className="font-mono font-semibold text-slate-700 truncate max-w-[180px]">
            {project.stationing_text}
          </span>
        </div>
      </div>

      {/* Card 3: Thống kê khiếm khuyết (#047857 Emerald / #B45309 Amber) */}
      <div className="relative bg-white border-[1.5px] border-[#047857]/25 rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(4,120,87,0.15)] bg-gradient-to-b from-[#047857]/[0.03] via-white/50 to-white">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] to-emerald-200" />
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#047857] ring-4 ring-[#047857]/20" />
              <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">
                Khiếm khuyết mặt đường
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {project.open_defects} điểm
              </span>
              <span className="text-[11px] font-bold text-[#047857] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {project.repair_packages} gói sửa chữa
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-[10px] bg-[#047857]/10 text-[#047857] flex items-center justify-center shrink-0">
            <Icon name="check_circle" size={20} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-500">
              {project.open_defects > 0 ? (
                <>Đang mở: <strong className="text-rose-600 font-bold">{project.open_defects} điểm</strong></>
              ) : (
                'Chưa phát hiện hư hỏng mặt đường'
              )}
            </span>
            <span className="font-mono font-bold text-slate-700">
              {project.open_defects === 0 ? 'Ổn định 100%' : 'Cần xử lý'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div
              className={`h-full ${project.open_defects === 0 ? 'bg-[#047857]' : 'bg-[#C9A227]'}`}
              style={{ width: `${project.open_defects === 0 ? 100 : 70}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

