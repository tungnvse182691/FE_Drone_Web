import React, { useState } from 'react'
import { UserPlus, Users, Verified } from 'lucide-react'
import { Icon } from '../../../components/ui/Icon'
import { ProjectMember } from './types'
import { HubProject } from '../projects/types'
import { AddProjectMemberModal } from './AddProjectMemberModal'

interface ProjectPersonnelCardProps {
  members: ProjectMember[]
  project: HubProject
  onReloadMembers?: () => Promise<void> | void
  showToast?: (msg: string) => void
}

export const ProjectPersonnelCard: React.FC<ProjectPersonnelCardProps> = ({
  members,
  project,
  onReloadMembers,
  showToast = () => {}
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <>
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col gap-4 font-body">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] via-[#C9A227] to-slate-200" />
        
        <div className="flex items-center justify-between pb-3 border-b border-[#EDEFF2]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#047857] ring-4 ring-[#047857]/20" />
              <h2 className="text-base font-bold text-slate-900 font-headline">
                Cơ cấu nhân sự thực hiện
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Phân cấp thẩm quyền &amp; vai trò trách nhiệm
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {members.length} nhân sự
            </span>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Thêm Drone Operator hoặc Repair Crew vào dự án"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm nhân sự</span>
            </button>
          </div>
        </div>

        {/* Personnel List */}
        {members.length === 0 ? (
          <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center gap-2.5">
            <Users className="w-8 h-8 text-slate-300" />
            <div className="text-xs font-semibold text-slate-600">
              Chưa có Drone Operator hoặc Đội thi công trong CSDL dự án
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Chỉ huy trưởng dự án có thể phân công Drone Operator và Repair Crew vào dự án ngay.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A227] text-white text-xs font-bold hover:bg-[#B38E1E] transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Phân công nhân sự ngay</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {members.map((mem) => (
              <div
                key={mem.id}
                className="p-3.5 rounded-xl bg-slate-50/90 border border-[#E2E5E9] hover:border-[#C9A227]/50 transition-colors flex flex-col gap-2.5 shadow-2xs"
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
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#047857] ring-2 ring-white"
                          title="Đang trực tuyến"
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">{mem.name}</span>
                      <span className="text-[11px] text-slate-500">{mem.role_title}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 uppercase">
                    {mem.role_badge}
                  </span>
                </div>

                <div className="text-[11px] bg-white border border-[#E2E5E9] p-2.5 rounded-xl flex flex-col gap-1 text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Icon name="verified_user" size={14} className="text-[#C9A227]" />
                    <span>{mem.authority}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span>{mem.contact}</span>
                    <span className="truncate max-w-[140px] text-right font-medium">{mem.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Thêm Nhân Sự Vào Dự Án */}
      <AddProjectMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={project.id}
        projectName={project.name || project.code || 'Dự án'}
        onMemberAdded={async () => {
          if (onReloadMembers) {
            await onReloadMembers()
          }
        }}
        showToast={showToast}
      />
    </>
  )
}
