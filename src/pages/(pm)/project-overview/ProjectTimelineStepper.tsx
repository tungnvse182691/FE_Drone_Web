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
  return <section className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-6 shadow-2xs overflow-hidden flex flex-col gap-4 font-body">
    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C9A227] to-slate-200" />
    <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-[#EDEFF2]"><div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" /><h2 className="text-base font-bold text-slate-900">Vòng đời quản lý dự án</h2></div><p className="text-xs text-slate-500 mt-1">Tiến trình bàn giao &amp; Vòng đời bảo hành</p></div><span className="text-xs px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{project.status_label || 'Chưa cập nhật'}</span></header>
    <ol className="relative pl-6 sm:pl-8 flex flex-col gap-4 pt-2"><div className="absolute left-3 sm:left-4 top-3 bottom-4 w-0.5 bg-[#E2E5E9] -translate-x-1/2" />{[
      {label:'Tiếp nhận dự án',icon:'folder_open',description:'Hồ sơ dự án và phân công PM điều hành.',date:project.handover_date,path:null},
      {label:'Hồ sơ tuyến',icon:'alt_route',description:'Tim tuyến, hệ quy chiếu và dữ liệu kỹ thuật đã xác nhận.',date:undefined,path:`${basePath}/projects/${project.id}/alignment`},
      {label:'Khảo sát & Theo dõi nghĩa vụ',icon:'flight_takeoff',description:'Kế hoạch khảo sát và bằng chứng theo phạm vi dự án.',date:undefined,path:`${basePath}/surveys?projectId=${project.id}`},
      {label:'Theo dõi nghĩa vụ',icon:'assignment',description:'Đề xuất sửa chữa, thi công và nghiệm thu theo hồ sơ.',date:undefined,path:`${basePath}/proposals`},
      {label:'Đóng vận hành',icon:'lock',description:'Đối chiếu điều kiện và hồ sơ đóng vận hành trên máy chủ.',date:project.closed_at,path:null},
    ].map(step => <li key={step.label} className="relative flex items-start gap-4"><span className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center ring-4 ring-white shadow-2xs border border-slate-200"><Icon name={step.icon} size={14} /></span><div className="bg-slate-50 border border-[#E2E5E9] rounded-xl p-3.5 flex-1 shadow-2xs min-w-0"><div className="flex flex-wrap items-center justify-between gap-2 mb-1"><h3 className="text-xs font-bold text-slate-900">{step.label}</h3><span className="text-[11px] text-slate-500">{step.date || 'Chưa cập nhật'}</span></div><p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>{step.path && <button type="button" onClick={() => onNavigate(step.path!)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#8C6D1F]"><Icon name="arrow_forward" size={14} />{step.label === 'Hồ sơ tuyến' ? 'Xem hồ sơ tuyến' : 'Mở hồ sơ'}</button>}</div></li>)}</ol>
  </section>
}
