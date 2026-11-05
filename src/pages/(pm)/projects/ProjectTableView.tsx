import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from './types'

interface ProjectTableViewProps {
  filteredProjects: HubProject[]
  totalProjectsCount: number
  isSupervisor?: boolean
  onNavigateDetail: (projectId: string) => void
  onOpenCloseModal?: (prj: HubProject) => void
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  filteredProjects,
  totalProjectsCount,
  onNavigateDetail, isSupervisor, onOpenCloseModal
}) => {
  return <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
    <table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-600"><tr>{['Dự án', 'PM chính', 'Trạng thái', 'Thao tác'].map(label => <th key={label} className="p-3 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{filteredProjects.map(project => <tr key={project.id} className="border-t border-slate-100">
        <td className="p-3"><strong>{project.name}</strong><p className="text-xs text-slate-500">{project.code}</p></td>
        <td className="p-3">{project.pm_user_id ? project.pm_name || 'Chưa cập nhật' : 'Chưa cập nhật'}</td>
        <td className="p-3">{project.status_label || 'Chưa cập nhật'}</td>
        <td className="p-3"><button onClick={() => onNavigateDetail(project.id)} className="bg-[#C9A227] hover:bg-[#B38E1E] text-white rounded-lg px-3 py-2 font-semibold whitespace-nowrap">Vào quản lý dự án</button>{isSupervisor && onOpenCloseModal && <button type="button" onClick={() => onOpenCloseModal(project)} className="ml-2 border border-[#C9A227] text-[#8C6D1F] rounded-lg px-3 py-2 whitespace-nowrap">Đóng vận hành dự án</button>}</td>
      </tr>)}</tbody>
    </table>
    {filteredProjects.length === 0 && <p className="p-4 text-slate-500">Không có dự án phù hợp.</p>}
    <p className="p-3 text-xs text-slate-500">{filteredProjects.length} / {totalProjectsCount} dự án</p>
  </div>
}
