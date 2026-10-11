import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { ProjectMember } from './types'
import { HubProject } from '../projects/types'

interface ProjectPersonnelCardProps {
  members: ProjectMember[]
  project: HubProject
}

export const ProjectPersonnelCard: React.FC<ProjectPersonnelCardProps> = ({ members, project }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col gap-4 font-body">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-headline">
            <Icon name="group" size={20} className="text-brand-gold" />
            <span>Cơ cấu nhân sự thực hiện</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Phân cấp thẩm quyền &amp; phụ trách (BR-01, DA03)
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {members.length} nhân sự
        </span>
      </div>

      {/* Personnel List */}
      <div className="flex flex-col gap-3">
        {members.map((mem) => (
          <div
            key={mem.id}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-gold/50 transition-colors flex flex-col gap-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={mem.avatar}
                    alt={mem.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  {mem.is_online && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                      title="Đang trực tuyến"
                    ></span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">{mem.name}</span>
                  <span className="text-[11px] text-slate-500">{mem.role_title}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 uppercase">
                {mem.role_badge}
              </span>
            </div>

            <div className="text-[11px] bg-white border border-slate-200 p-2 rounded-lg flex flex-col gap-1 text-slate-600">
              <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                <Icon name="verified_user" size={14} className="text-brand-gold" />
                <span>{mem.authority}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <span>{mem.contact}</span>
                <span className="truncate max-w-[140px] text-right font-medium">{mem.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
