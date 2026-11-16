import React, { useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { FieldTask, Project, HubProject } from '../../../types/domain'

export interface FieldTasksHeaderProps {
  isSupervisor: boolean
  isPM: boolean
  fieldTasks: FieldTask[]
  projects: (Project | HubProject)[]
  selectedProjectId: string
  onSelectProject: (projectId: string) => void
}

export const FieldTasksHeader: React.FC<FieldTasksHeaderProps> = ({
  isSupervisor,
  isPM: _isPM,
  fieldTasks,
  projects,
  selectedProjectId,
  onSelectProject
}) => {
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId)
  }, [projects, selectedProjectId])

  // Thống kê nhanh các trạng thái đo đạc
  const taskStats = useMemo(() => {
    const assigned = fieldTasks.filter((t) => t.status === 'ASSIGNED').length
    const inProgress = fieldTasks.filter((t) => t.status === 'IN_PROGRESS').length
    const submitted = fieldTasks.filter((t) => t.status === 'SUBMITTED').length
    const verified = fieldTasks.filter((t) => t.status === 'VERIFIED').length
    return { assigned, inProgress, submitted, verified }
  }, [fieldTasks])

  return (
    <div className="space-y-4">
      {/* 1. BREADCRUMB */}
      <nav aria-label="Đường dẫn trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <a href={isSupervisor ? '#/sup/dashboard' : '#/pm/dashboard'} className="hover:text-[#C9A227] transition-colors flex items-center gap-1">
          <Icon name="home" size={14} />
          <span>Trang chủ</span>
        </a>
        <Icon name="chevron_right" size={14} className="text-slate-400" />
        <span className="font-semibold text-slate-800">
          {isSupervisor ? 'Nghiệm thu hiện trường' : 'Nhiệm vụ & Đo đạc hiện trường'}
        </span>
      </nav>

      {/* 2. HEADER SECTION (WITH PROJECT / ROUTE SELECTOR) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-[#E2E5E9] shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {isSupervisor ? 'Nghiệm Thu Hiện Trường' : 'Nhiệm Vụ & Đo Đạc Hiện Trường'}
            </h1>
            {currentProject && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-900 border border-amber-300">
                {currentProject.code}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentProject ? (
              <>
                Dự án: <strong className="text-slate-800 font-semibold">{currentProject.name}</strong> • Lý trình Km {currentProject.start_km} - Km {currentProject.end_km} • Tiếp nhận kết quả đo thực địa & quản lý phiếu giao việc đo đạc.
              </>
            ) : (
              <>
                Phạm vi: <strong className="text-slate-800 font-semibold">Toàn bộ dự án & tuyến đường phụ trách ({projects.length} tuyến)</strong> • Tiếp nhận kết quả đo thực địa & quản lý phiếu giao việc đo đạc.
              </>
            )}
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Bộ chọn tuyến đường / dự án */}
          <div className="relative min-w-[270px]">
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="w-full px-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C9A227] text-xs cursor-pointer appearance-none font-semibold transition-all shadow-2xs"
              title="Lọc nhiệm vụ đo đạc theo tuyến đường dự án mà vai trò được phân công"
            >
              <option value="ALL">
                Toàn bộ tuyến đường ({projects.length} Dự án)
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} • {p.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Icon name="expand_more" size={16} />
            </div>
          </div>

          {/* Action & Role Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium ${
                isSupervisor
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Icon name="verified_user" size={15} className={isSupervisor ? 'text-purple-600' : 'text-amber-600'} />
              <span>
                {isSupervisor ? 'Giám sát (Nghiệm thu)' : 'Chỉ huy trưởng (PM)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 THẺ KPI CHUYÊN BIỆT CHO NHIỆM VỤ ĐO ĐẠC */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1: Cần thực hiện */}
        <div
          className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          style={{
            border: '1.5px solid #CBD5E1',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #ffffff 45%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#64748B'
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(100, 116, 139, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#CBD5E1'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #64748B, #94A3B8)' }} />
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: '#64748B', boxShadow: '0 0 0 4px rgba(100, 116, 139, 0.15)' }}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Cần thực hiện
                </span>
              </div>
              <Icon name="schedule" size={16} className="text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900">{taskStats.assigned}</span>
              <span className="text-xs text-slate-500 font-medium">phiếu</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Đang đo đạc */}
        <div
          className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          style={{
            border: '1.5px solid #B8C5D9',
            background: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 45%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1E40AF'
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(30, 64, 175, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#B8C5D9'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #1E40AF, #3B82F6)' }} />
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: '#1E40AF', boxShadow: '0 0 0 4px rgba(30, 64, 175, 0.15)' }}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Đang đo đạc
                </span>
              </div>
              <Icon name="more_horiz" size={16} className="text-[#1E40AF]" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900">{taskStats.inProgress}</span>
              <span className="text-xs text-slate-500 font-medium">hiện trường</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Đã có số đo */}
        <div
          className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          style={{
            border: '1.5px solid #E3D3AC',
            background: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#B45309'
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(180, 83, 9, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E3D3AC'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #B45309, #F59E0B)' }} />
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: '#B45309', boxShadow: '0 0 0 4px rgba(180, 83, 9, 0.15)' }}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Đã có số đo
                </span>
              </div>
              <Icon name="format_list_numbered" size={16} className="text-[#B45309]" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-[#B45309]">{taskStats.submitted}</span>
              <span className="text-xs text-slate-500 font-medium">chờ duyệt</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Đã xác minh */}
        <div
          className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          style={{
            border: '1.5px solid #A7C4B8',
            background: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#047857'
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(4, 120, 87, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#A7C4B8'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #047857, #10B981)' }} />
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: '#047857', boxShadow: '0 0 0 4px rgba(4, 120, 87, 0.15)' }}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Đã xác minh
                </span>
              </div>
              <Icon name="check_circle" size={16} className="text-[#047857]" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-[#047857]">{taskStats.verified}</span>
              <span className="text-xs text-slate-500 font-medium">hoàn tất</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FieldTasksHeader
