import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { ProjectMember } from './types'
import { HubProject } from '../projects/types'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { AddProjectMemberModal } from './AddProjectMemberModal'

interface ProjectPersonnelCardProps {
  error?: string | null
  members: ProjectMember[]
  project: HubProject
  onReloadMembers?: () => Promise<void> | void
  showToast?: (msg: string) => void
}

export const ProjectPersonnelCard: React.FC<ProjectPersonnelCardProps> = ({
  members,
  error,
  project,
  onReloadMembers,
  showToast = () => {}
}) => {
  const canAdd = useAuthStore(state => state.user?.role === RoleCode.PROJECT_MANAGER)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return <section className="relative min-w-0 bg-white border border-[#E2E5E9] rounded-[20px] p-5 space-y-4 shadow-2xs overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#047857] via-[#C9A227] to-slate-200" />
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
      <div><h2 className="font-bold text-slate-900 flex items-center gap-2"><Icon name="groups" size={20} className="text-[#047857]" />Cơ cấu nhân sự thực hiện</h2><p className="text-[11px] text-slate-500 mt-1">Phân cấp thẩm quyền &amp; vai trò trách nhiệm</p></div><div className="flex flex-wrap items-center gap-2">{!error && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{members.length} nhân sự</span>}
      {canAdd && <button type="button" onClick={() => setIsAddModalOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] focus-visible:ring-2 focus-visible:ring-[#C9A227] px-3 py-2 text-xs font-semibold text-white">
        <Icon name="person_add" size={16} />Thêm nhân sự
      </button>}</div>
    </div>
    <p className="text-xs text-slate-500">Việc đổi PM chính hoặc kết thúc phân công hiện chưa được hỗ trợ trên màn hình này.</p>
    {error ? <div role="alert" className="text-sm text-rose-700">{error}
      <button onClick={onReloadMembers} className="ml-2 border border-slate-300 rounded-lg px-2 py-1 text-slate-700">Tải lại thành viên</button>
    </div> : members.length === 0 ? <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50"><Icon name="groups" size={32} className="mx-auto text-slate-300 mb-3" /><p className="text-sm text-slate-500">Chưa có thành viên trong dự án.</p></div> :
      <ul className="space-y-3">{members.map(member => <li key={member.id} className="p-3.5 rounded-xl bg-slate-50/90 border border-[#E2E5E9] hover:border-[#C9A227]/50 transition-colors space-y-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-900 break-words min-w-0 flex items-center gap-2"><span className="rounded-full bg-white border border-slate-200 p-2 shrink-0"><Icon name="person" size={18} className="text-slate-400" /></span>{member.name}</span>
          {member.role_badge && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">{member.role_badge}</span>}
        </div>
        <p className="text-xs text-slate-600">{member.role_title}</p>
        <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-2.5">{member.membership_status === 'ACTIVE' ? 'Đang tham gia' : member.membership_status === 'ENDED' ? 'Đã kết thúc' : 'Chưa có trạng thái'}
          {member.valid_from && ` · Từ ${member.valid_from}`}{member.valid_to && ` đến ${member.valid_to}`}
        </p>
      </li>)}</ul>}
    {canAdd && <AddProjectMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} projectId={project.id}
      projectName={project.name || project.code} onMemberAdded={async () => { await onReloadMembers?.() }} showToast={showToast} />}
  </section>
}
