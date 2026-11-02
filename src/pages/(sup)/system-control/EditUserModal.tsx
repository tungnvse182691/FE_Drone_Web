import React from 'react'
import { Edit3, X, CheckCircle2, XCircle, Check, FolderKanban, Lock, Phone } from 'lucide-react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'
import { useAuthStore } from '../../../store/authStore'

export interface EditUserModalProps {
  userToEdit: SystemUserAccount | null
  setUserToEdit: (u: SystemUserAccount | null) => void
  editFullName: string
  setEditFullName: (val: string) => void
  editEmail: string
  setEditEmail: (val: string) => void
  editPhone: string
  setEditPhone: (val: string) => void
  editRole: RoleCode
  setEditRole: (val: RoleCode) => void
  editProjectScope: string
  setEditProjectScope: (val: string) => void
  editSelectedProjectIds: string[]
  toggleEditProject: (projectId: string) => void
  selectAllEditProjects: () => void
  clearAllEditProjects: () => void
  editStatus: 'ACTIVE' | 'SUSPENDED'
  setEditStatus: (val: 'ACTIVE' | 'SUSPENDED') => void
  projectsList: Array<{ id: string; name: string; code?: string; pm_user_id?: string; pm_name?: string }>
  handleSaveEdit: (e: React.FormEvent) => void
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  userToEdit,
  setUserToEdit,
  editFullName,
  setEditFullName,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editRole,
  setEditRole,
  editProjectScope,
  setEditProjectScope,
  editSelectedProjectIds,
  toggleEditProject,
  selectAllEditProjects,
  clearAllEditProjects,
  editStatus,
  setEditStatus,
  projectsList,
  handleSaveEdit,
}) => {
  if (!userToEdit) return null

  const currentUser = useAuthStore((s) => s.user)
  const isSupervisorUser = currentUser?.role === RoleCode.SUPERVISOR
  // Áp dụng cho tài khoản active có role PM, OPERATOR, CREW
  const targetRoleAllowsPhoneEdit =
    userToEdit.role === RoleCode.PROJECT_MANAGER ||
    userToEdit.role === RoleCode.DRONE_OPERATOR ||
    userToEdit.role === RoleCode.REPAIR_CREW
  const canEditPhone = isSupervisorUser && targetRoleAllowsPhoneEdit && userToEdit.status === 'ACTIVE'

  const isSupervisorRole = editRole === RoleCode.SUPERVISOR
  const isPmRole = editRole === RoleCode.PROJECT_MANAGER

  // Kiểm tra dự án có bị PM khác nắm giữ hay không
  const isProjectLockedForPm = (p: { pm_user_id?: string; pm_name?: string }) => {
    if (!isPmRole) return false
    return Boolean(
      p.pm_user_id &&
      p.pm_user_id !== userToEdit.id &&
      p.pm_name &&
      !p.pm_name.toLowerCase().includes('chưa')
    )
  }

  // Chọn tất cả các dự án hợp lệ (bỏ qua những dự án đã có PM khác)
  const handleSelectAllValidProjects = () => {
    if (isPmRole) {
      const validIds = projectsList.filter((p) => !isProjectLockedForPm(p)).map((p) => p.id)
      validIds.forEach((id) => {
        if (!editSelectedProjectIds.includes(id)) toggleEditProject(id)
      })
    } else {
      selectAllEditProjects()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-brand-border max-w-xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Chỉnh sửa nhân sự trong CSDL Backend
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật vai trò chuyên môn, phân công dự án và trạng thái hoạt động
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUserToEdit(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Họ và tên nhân sự:
              </label>
              <input
                type="text"
                disabled
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                title="Họ và tên do nhân sự tự quản lý trong hồ sơ cá nhân"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Email công vụ:
              </label>
              <input
                type="email"
                disabled
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 font-mono focus:outline-none cursor-not-allowed"
                title="Email tài khoản được cố định theo thư mời định danh"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Số điện thoại công vụ:</span>
              </label>
              <input
                type="tel"
                disabled={!canEditPhone}
                value={editPhone}
                placeholder="VD: 0901234567"
                onChange={(e) => {
                  // Tự động chuẩn hóa: chỉ giữ chữ số và dấu + ở đầu (loại bỏ dấu chấm, khoảng trắng)
                  const cleaned = e.target.value.replace(/[^\d+]/g, '')
                  setEditPhone(cleaned)
                }}
                className={`w-full h-9 px-3 rounded-lg border text-xs font-mono transition-colors ${
                  canEditPhone
                    ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]'
                    : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                }`}
                title={
                  canEditPhone
                    ? 'Supervisor có thẩm quyền đặt/sửa số điện thoại liên lạc công vụ'
                    : userToEdit.role === RoleCode.SUPERVISOR
                    ? 'Theo nghiệp vụ bảo mật Backend Candidate3, tài khoản Giám sát viên không thể đổi số điện thoại qua API này'
                    : 'Chỉ Supervisor mới có quyền cập nhật số điện thoại cho PM, Operator, Crew'
                }
              />

            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Vai trò phân quyền: <span className="text-rose-600">*</span>
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as RoleCode)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
              >
                <option value={RoleCode.PROJECT_MANAGER}>PROJECT_MANAGER (Chỉ huy trưởng PM)</option>
                <option value={RoleCode.SUPERVISOR}>SUPERVISOR (Giám sát / Chủ đầu tư)</option>
                <option value={RoleCode.DRONE_OPERATOR}>DRONE_OPERATOR (Phi công UAV)</option>
                <option value={RoleCode.REPAIR_CREW}>REPAIR_CREW (Đội thi công hiện trường)</option>
              </select>
            </div>
          </div>

          {/* Thông tin dự án đang phụ trách trong CSDL - chỉ hiện cho non-Supervisor */}
          {!isSupervisorRole && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-[#C9A227]" />
              <label className="font-semibold text-slate-800">
                Dự án bảo hành đang phụ trách (CSDL):
              </label>
            </div>

            {!isSupervisorRole && userToEdit.assigned_project_ids && userToEdit.assigned_project_ids.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {projectsList
                    .filter((p) => userToEdit.assigned_project_ids?.includes(p.id))
                    .map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-xs"
                      >
                        <span className="font-mono text-[#8C6D15]">{p.code || 'PRJ'}</span>
                        <span>{p.name}</span>
                        {isPmRole && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                            Chỉ huy trưởng chính
                          </span>
                        )}
                      </span>
                    ))}
                </div>
                {isPmRole && (
                  <p className="text-[11px] text-slate-500 italic leading-relaxed pt-1 border-t border-slate-200">
                    💡 <strong>Lưu ý nghiệp vụ:</strong> Phân công hoặc bàn giao dự án cho Chỉ huy trưởng (PM) phải thực hiện qua quy trình pháp lý tại nút <strong>"Điều chuyển &amp; Bàn giao dự án"</strong> (API-113) ngoài danh bạ, không thể tự ý gỡ bỏ qua form cập nhật thông tin chung.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px]">
                Nhân sự hiện chưa được phân công quản lý dự án nào trong CSDL.
              </div>
            )}
          </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Trạng thái làm việc:</label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditStatus('ACTIVE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  editStatus === 'ACTIVE'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đang hoạt động (ACTIVE)</span>
              </button>
              <button
                type="button"
                onClick={() => setEditStatus('SUSPENDED')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  editStatus === 'SUSPENDED'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Đình chỉ phiên (SUSPENDED)</span>
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUserToEdit(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu cập nhật nhân sự</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
