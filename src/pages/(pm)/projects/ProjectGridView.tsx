import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from './types'

interface ProjectGridViewProps {
  filteredProjects: HubProject[]
  isSupervisor: boolean
  onOpenCreateModal: () => void
  onNavigateAlignment: (projectId: string) => void
  onNavigateDetail: (projectId: string) => void
  onOpenCloseModal?: (prj: HubProject) => void
}

export const ProjectGridView: React.FC<ProjectGridViewProps> = ({
  filteredProjects,
  onNavigateDetail, isSupervisor, onOpenCloseModal
}) => {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredProjects.map(project => <article key={project.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 min-w-0">
      <p className="text-sm text-slate-500 break-words">{project.code}</p><h2 className="font-bold text-slate-900 break-words">{project.name}</h2>
      <p className="text-xs text-slate-600">{project.status_label || 'Chưa cập nhật'}</p>
      <p className="text-sm text-slate-600">{project.pm_user_id ? `PM chính: ${project.pm_name || 'Chưa cập nhật'}` : 'PM chính: Chưa cập nhật'}</p>
      <button type="button" onClick={() => onNavigateDetail(project.id)} className="mt-auto inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B38E1E] focus-visible:ring-2 focus-visible:ring-[#C9A227] text-white rounded-lg px-4 py-2 text-sm font-semibold">Vào quản lý dự án<Icon name="arrow_forward" size={16} /></button>
      {isSupervisor && onOpenCloseModal && <button type="button" onClick={() => onOpenCloseModal(project)} className="border border-[#C9A227] text-[#8C6D1F] rounded-lg px-3 py-2 text-sm">Đóng vận hành dự án</button>}
    </article>)}
    {filteredProjects.length === 0 && <p className="text-sm text-slate-500">Không có dự án phù hợp.</p>}
  </div>
}
