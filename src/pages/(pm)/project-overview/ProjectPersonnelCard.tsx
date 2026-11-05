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

  const [notice, setNotice] = useState('')
  return <section className="bg-white border border-[#E2E5E9] rounded-[20px] p-5 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-bold text-slate-900">Cơ cấu nhân sự thực hiện</h2>
      <button type="button" onClick={() => {
        if (canAdd) setIsAddModalOpen(true)
        else setNotice('Chỉ Chỉ huy trưởng của dự án được thêm phi công hoặc đội thi công. Tài khoản Giám sát hiện chỉ được xem danh sách thành viên.')
      }} className="inline-flex items-center gap-1 rounded-lg bg-[#C9A227] px-3 py-2 text-xs font-semibold text-[#1A1D20]">
        <Icon name="person_add" size={16} />Thêm nhân sự
      </button>
    </div>
    {notice && <p role="alert" className="text-sm text-slate-700">{notice}</p>}
    <p className="text-xs text-slate-500">Việc đổi PM chính hoặc kết thúc phân công hiện chưa được hỗ trợ trên màn hình này.</p>
    {error ? <div role="alert" className="text-sm text-rose-700">{error}
      <button onClick={onReloadMembers} className="ml-2 border border-slate-300 rounded-lg px-2 py-1 text-slate-700">Tải lại thành viên</button>
    </div> : members.length === 0 ? <p className="text-sm text-slate-500">Chưa có thành viên trong dự án.</p> :
      <ul className="divide-y divide-slate-100">{members.map(member => <li key={member.id} className="py-3 space-y-1">
        <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-900">{member.name}</span>
          {member.role_badge && <span className="text-xs text-slate-600">{member.role_badge}</span>}
        </div>
        <p className="text-xs text-slate-600">{member.role_title}</p>
        <p className="text-xs text-slate-500">{member.membership_status === 'ACTIVE' ? 'Đang tham gia' : member.membership_status === 'ENDED' ? 'Đã kết thúc' : 'Chưa có trạng thái'}
          {member.valid_from && ` · Từ ${member.valid_from}`}{member.valid_to && ` đến ${member.valid_to}`}
        </p>
      </li>)}</ul>}
    <AddProjectMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} projectId={project.id}
      projectName={project.name || project.code} onMemberAdded={async () => { await onReloadMembers?.() }} showToast={showToast} />
  </section>
}
