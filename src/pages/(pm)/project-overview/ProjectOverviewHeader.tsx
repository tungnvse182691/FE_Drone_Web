import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectOverviewHeaderProps {
  project: HubProject
  basePath: string
  isSupervisor: boolean
  onNavigate: (path: string) => void
  onCloseProject?: () => void
  mainlineLengthKm?: number
  branchesLengthKm?: number
  branchesCount?: number
}

export const ProjectOverviewHeader: React.FC<ProjectOverviewHeaderProps> = ({ project, basePath, isSupervisor, onNavigate }) =>
  <header className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-4">
    <button type="button" onClick={() => onNavigate(`${basePath}/projects`)} className="text-sm text-slate-600 hover:text-[#8C6D1F] inline-flex gap-1 items-center"><Icon name="arrow_back" size={16} />Dự án</button>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h1 className="text-xl font-bold text-slate-900 break-words">{project.name}</h1><p className="text-sm text-slate-500">{project.code}</p></div>
      <span className="text-xs border border-slate-200 rounded-full px-3 py-1">{project.status_label || 'Chưa cập nhật'}</span>
    </div>
    {project.pm_user_id && <p className="text-sm">PM chính: {project.pm_name || 'Chưa cập nhật'}</p>}
    <button type="button" onClick={() => onNavigate(`${basePath}/proposals`)} className="w-full sm:w-auto max-w-full inline-flex flex-wrap justify-center items-center gap-2 bg-[#C9A227] hover:bg-[#B38E1E] focus-visible:ring-2 focus-visible:ring-[#C9A227] text-white rounded-lg px-4 py-2 text-sm font-semibold">
      {isSupervisor ? 'Xem các đề xuất' : 'Xem các đề xuất đã trình'}<Icon name="arrow_forward" size={16} />
    </button>
  </header>
