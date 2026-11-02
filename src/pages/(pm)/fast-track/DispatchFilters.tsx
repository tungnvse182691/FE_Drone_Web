import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { ProjectOption, CrewTeam } from './types'

export interface DispatchFiltersProps {
  projects: ProjectOption[]
  selectedProjectId: string
  onProjectChange: (projectId: string) => void
  crews: CrewTeam[]
  crewFilter: string
  setCrewFilter: (crew: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
}

export const DispatchFilters: React.FC<DispatchFiltersProps> = ({
  projects,
  selectedProjectId,
  onProjectChange,
  crews,
  crewFilter,
  setCrewFilter,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 p-4 bg-white rounded-[20px] border border-[#E2E5E9] shadow-2xs">
      {/* Dự án bảo hành (100% CSDL thật qua GET /api/v1/projects) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Dự án bảo hành áp dụng
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 hover:bg-white rounded-xl text-xs font-bold text-slate-800 border border-[#E2E5E9] focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer transition-colors"
        >
          {projects.map((p, idx) => (
            <option key={p.id ? `prj-${p.id}` : `prj-idx-${idx}`} value={p.id}>
              {p.name} ({p.projectCode})
            </option>
          ))}
        </select>
      </div>

      {/* Nhân sự / Tổ đội phụ trách (100% CSDL thật qua GET /api/v1/projects/{id}/members) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Đội hiện trường phụ trách
        </label>
        <select
          value={crewFilter}
          onChange={(e) => setCrewFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 hover:bg-white rounded-xl text-xs font-medium text-slate-700 border border-[#E2E5E9] focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer transition-colors"
        >
          <option value="ALL">Tất cả nhân sự / tổ đội</option>
          {crews.map((c, idx) => (
            <option key={c.id ? `crew-${c.id}` : `crew-idx-${idx}`} value={c.name}>
              {c.name} ({c.role || 'Thành viên'})
            </option>
          ))}
        </select>
      </div>

      {/* Bộ lọc trạng thái khiếu nại / xử lý */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Trạng thái xử lý nhanh
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 hover:bg-white rounded-xl text-xs font-medium text-slate-700 border border-[#E2E5E9] focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer transition-colors"
        >
          <option value="ALL">Tất cả trạng thái khiếm khuyết</option>
          <option value="ELIGIBLE">Chỉ hiển thị Đạt chuẩn xử lý nhanh</option>
          <option value="VIOLATION">Chỉ hiển thị Vượt ngưỡng quy chuẩn (Cần trình duyệt)</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={() => {
            setCrewFilter('ALL')
            setStatusFilter('ALL')
          }}
          type="button"
          className="w-full py-2 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-[#E2E5E9] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <Icon name="refresh" size={14} className="text-slate-500" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    </div>
  )
}
