import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectTimelineStepperProps {
  project: HubProject
  basePath: string
  isSupervisor?: boolean
  onNavigate: (path: string) => void
}

export const ProjectTimelineStepper: React.FC<ProjectTimelineStepperProps> = ({
  project,
  basePath,
  isSupervisor = false,
  onNavigate
}) => {
  return <section className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-6 shadow-2xs space-y-5 overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C9A227] to-slate-200" />
    <div className="border-b border-slate-100 pb-3"><h2 className="text-base font-bold text-slate-900">Vòng đời quản lý dự án</h2><p className="text-xs text-slate-500 mt-1">Trạng thái hoạt động: {project.status_label || 'Chưa cập nhật'}</p></div>
    <ol className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[{label:'Tiếp nhận dự án',icon:'folder_open'},{label:'Hồ sơ tuyến',icon:'alt_route'},{label:'Theo dõi nghĩa vụ',icon:'assignment'},{label:'Đóng vận hành',icon:'lock'}].map(step => <li key={step.label} className="text-center space-y-2"><span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-slate-500"><Icon name={step.icon} size={20}/></span><p className="text-xs font-semibold text-slate-700">{step.label}</p><p className="text-xs text-slate-500">Chưa cập nhật</p></li>)}</ol>
    <button type="button" onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)} className="rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white px-4 py-2 text-xs font-semibold">Xem hồ sơ tuyến</button>
  </section>
}
