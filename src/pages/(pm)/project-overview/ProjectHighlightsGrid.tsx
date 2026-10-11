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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
      {/* Card 1: Thời hạn bảo hành */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Thời hạn bảo hành công trình
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                Còn {project.days_remaining} ngày
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-brand-gold flex items-center justify-center">
            <Icon name="calendar_month" size={20} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Hết hạn: <strong className="text-slate-900 font-mono">{project.warranty_end_date || '3 năm từ bàn giao'}</strong></span>
            <span className="font-mono font-semibold text-brand-gold">{project.warranty_passed_percent}% đã qua</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-gold h-full rounded-full transition-all duration-500"
              style={{ width: `${project.warranty_passed_percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card 2: Tuyến Chính & Tuyến Phụ (Phân định rõ ràng) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Khối lượng tuyến &amp; Phân đoạn
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {project.length_km > 0 ? `${project.length_km} km` : '0 km'}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {project.kml_status || 'Chưa duyệt tim'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Icon name="alt_route" size={20} />
          </div>
        </div>

        {/* Khối bóc tách chi tiết: Tuyến chính & Tuyến phụ */}
        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/80 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
              <span>Trục chính (Mainline):</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {mainlineLengthKm > 0 ? `${mainlineLengthKm} km` : (project.length_km > 0 ? `${project.length_km} km` : '0 km')}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Tuyến phụ (Branches):</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {branchesCount > 0 ? (
                <span className="text-amber-800">
                  {branchesLengthKm} km ({branchesCount} nhánh)
                </span>
              ) : (
                <span className="text-slate-400 font-normal italic">0 km (0 nhánh)</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Dải lý trình trục chính:</span>
          <span className="font-mono font-semibold text-slate-700 truncate max-w-[180px]">
            {project.stationing_text}
          </span>
        </div>
      </div>

      {/* Card 3: Thống kê khiếm khuyết */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Khiếm khuyết mặt đường
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {project.open_defects} điểm
              </span>
              <span className="text-xs font-semibold text-[#1B5E20] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {project.repair_packages} gói sửa chữa
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
            <Icon name="check_circle" size={20} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">
              {project.open_defects > 0 ? (
                <>Đang mở: <strong className="text-rose-600">{project.open_defects} điểm</strong></>
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
              className={`h-full ${project.open_defects === 0 ? 'bg-emerald-500' : 'bg-brand-gold'}`}
              style={{ width: `${project.open_defects === 0 ? 100 : 70}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
