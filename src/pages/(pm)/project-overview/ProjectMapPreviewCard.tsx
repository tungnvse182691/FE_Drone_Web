import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { AlignmentGeometryWorkflow } from '../alignment/AlignmentGeometryWorkflow'
import { HubProject } from '../projects/types'
export const ProjectMapPreviewCard: React.FC<{project:HubProject; basePath:string; isSupervisor?:boolean; activeTab?:string}> = () =>
  <section className="relative bg-white border border-[#E2E5E9] rounded-[20px] shadow-2xs overflow-hidden min-w-0">
    <div className="p-5 border-b border-slate-100 flex items-center gap-2"><Icon name="map" size={20} className="text-[#C9A227]"/><h2 className="font-bold text-slate-900">Bản đồ & Xem trước tuyến</h2></div>
    <AlignmentGeometryWorkflow embedded />
  </section>
