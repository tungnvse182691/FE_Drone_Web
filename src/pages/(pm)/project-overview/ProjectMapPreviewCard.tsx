import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { AlignmentGeometryWorkflow } from '../alignment/AlignmentGeometryWorkflow'
import { HubProject } from '../projects/types'
export const ProjectMapPreviewCard: React.FC<{project:HubProject; basePath:string; isSupervisor?:boolean; activeTab?:string}> = ({ project, basePath }) => {
  const [expanded, setExpanded] = useState(false)
  return <section className={`relative bg-white border border-[#E2E5E9] rounded-[20px] shadow-2xs overflow-hidden min-w-0 ${expanded ? 'fixed inset-4 z-50 overflow-y-auto' : ''}`}>
    <header className="p-5 border-b border-slate-100 flex flex-wrap justify-between gap-3"><div className="flex items-center gap-2"><Icon name="map" size={20} className="text-[#C9A227]"/><div><h2 className="font-bold text-slate-900">Bản đồ &amp; Xem trước tuyến</h2><p className="text-xs text-slate-500 mt-1">{project.name}</p></div></div><div className="flex flex-wrap gap-2"><div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">{['Vệ tinh','Bản đồ tuyến'].map(label => <button type="button" disabled key={label} className="px-3 py-1.5 text-xs text-slate-400">{label}</button>)}</div><button type="button" aria-label={expanded ? 'Thu nhỏ bản đồ dự án' : 'Phóng to bản đồ dự án'} onClick={() => setExpanded(value => !value)} className="p-2 rounded-lg border border-slate-200 text-slate-500"><Icon name={expanded ? 'fullscreen_exit' : 'fullscreen'} size={18} /></button></div></header>
    <AlignmentGeometryWorkflow embedded />
    <footer className="border-t border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-3 text-xs text-slate-500"><span className="inline-flex gap-1 items-center"><span className="w-3 h-1 bg-[#C9A227]"/>Tim tuyến</span><span>Phân đoạn: Chưa cập nhật</span></div><a href={`${basePath}/projects/${project.id}/alignment`} className="text-xs font-semibold text-[#8C6D1F] inline-flex items-center gap-1">Mở hồ sơ tuyến<Icon name="arrow_forward" size={14} /></a></footer>
  </section>
}
