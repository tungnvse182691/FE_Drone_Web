import React from 'react'
import { Edit3, X, CheckCircle2, XCircle, Check, FolderKanban, Lock, Phone } from 'lucide-react'
import { personnelBlocks } from '../../../api/services/personnelScreen'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'
import { useAuthStore } from '../../../store/authStore'

export interface EditUserModalProps {
  detailLoading?: boolean
  snapshotReady?: boolean
  detailError?: string
  commandBusy?: boolean
  phonePending?: { receipt?: boolean; conflict?: boolean; rejected?: boolean; keyConflict?: boolean } | null
  onRetryDetail?: () => void
  onReadFresh?: () => void
  onAcceptFresh?: () => void
  hasFresh?: boolean
  onRevisePhone?: () => void

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
  detailLoading = false, snapshotReady = false, detailError = '', commandBusy = false, phonePending = null, onRetryDetail, onReadFresh, onAcceptFresh, hasFresh = false, onRevisePhone,
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
  const currentUser = useAuthStore((s) => s.user)
  if (!userToEdit) return null
  const isSupervisorUser = currentUser?.role === RoleCode.SUPERVISOR
  const isReporter = userToEdit.role === RoleCode.REPORTER

  // Áp dụng đổi SĐT chỉ cho tài khoản active có role PM, OPERATOR, CREW (Người dân tự quản lý SĐT qua OTP, Sup không can thiệp)
  const targetRoleAllowsPhoneEdit =
    userToEdit.role === RoleCode.PROJECT_MANAGER ||
    userToEdit.role === RoleCode.DRONE_OPERATOR ||
    userToEdit.role === RoleCode.REPAIR_CREW
  const phoneEligible = !isReporter && isSupervisorUser && targetRoleAllowsPhoneEdit && userToEdit.status === 'ACTIVE'
  const canEditPhone = phoneEligible && snapshotReady && !detailLoading && !commandBusy && !phonePending

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
                {isReporter
                  ? 'Quản lý tài khoản Người dân (Reporter)'
                  : 'Chỉnh sửa nhân sự trong CSDL Backend'}
              </h3>
              <p className="text-xs text-slate-500">
                {isReporter
                  ? 'Kiểm soát trạng thái hoạt động và đình chỉ tài khoản người phản ánh'
                  : 'Cập nhật vai trò chuyên môn, phân công dự án và trạng thái hoạt động'}
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
          <p className="text-xs text-slate-600">{personnelBlocks.account} Họ tên/email và phân công dự án là thông tin chỉ đọc ở form này.</p>
          {detailLoading && <p role="status">Đang đọc hồ sơ và phiên bản...</p>}
          {detailError && <p role="alert" className="text-xs text-rose-700">{detailError}</p>}
          {!snapshotReady && !detailLoading && <button type="button" className="underline" onClick={onRetryDetail}>Đọc lại hồ sơ</button>}
          {phonePending && <div className="text-xs space-y-2">
            <p>{phonePending.receipt ? 'Số mới đã được lưu; chỉ đọc lại kết quả.' : 'Đang giữ nguyên yêu cầu số điện thoại trước để đối chiếu.'}</p>
            {phonePending.conflict && <><button type="button" onClick={onReadFresh} disabled={detailLoading || commandBusy} className="underline">Đọc hồ sơ mới để đối chiếu</button><button type="button" onClick={onAcceptFresh} disabled={!hasFresh || commandBusy} className="ml-3 underline">Giữ số mới và dùng phiên bản vừa đọc</button></>}
            {phonePending.rejected && <button type="button" onClick={onRevisePhone} className="underline">Giữ bản nhập để sửa yêu cầu bị từ chối</button>}
            {phonePending.keyConflict && <p>Khóa yêu cầu xung đột nội dung; không tự tạo khóa mới để gửi lại.</p>}
          </div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                {isReporter ? 'Họ và tên người phản ánh:' : 'Họ và tên nhân sự:'}
              </label>
              <input
                type="text"
                disabled
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                title={isReporter ? 'Họ và tên do người dân tự đặt khi đăng ký tài khoản' : 'Họ và tên do nhân sự tự quản lý trong hồ sơ cá nhân'}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                {isReporter ? 'Email liên hệ:' : 'Email công vụ:'}
              </label>
              <input
                type="email"
                disabled
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 font-mono focus:outline-none cursor-not-allowed"
                title="Email tài khoản được cố định"
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isReporter ? '' : 'sm:grid-cols-2'} gap-3`}>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{isReporter ? 'Số điện thoại định danh (OTP):' : 'Số điện thoại công vụ:'}</span>
              </label>
              <input
                type="tel"
                disabled={!canEditPhone}
                value={editPhone}
                placeholder="VD: 0901234567"
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d+]/g, '')
                  setEditPhone(cleaned)
                }}
                className={`w-full h-9 px-3 rounded-lg border text-xs font-mono transition-colors ${
                  canEditPhone
                    ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]'
                    : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                }`}
                title={
                  isReporter
                    ? 'Số điện thoại là tài khoản định danh nhận mã OTP, do người dân tự đăng ký và quản lý trên ứng dụng Mobile.'
                    : canEditPhone
                    ? 'Supervisor có thẩm quyền đặt/sửa số điện thoại liên lạc công vụ'
                    : 'Chỉ Supervisor mới có quyền cập nhật số điện thoại cho PM, Operator, Crew'
                }
              />
              {isReporter && (
                <p className="text-[10.5px] text-slate-500 italic">
                  Theo quy định bảo mật, Số điện thoại định danh nhận OTP do người dân tự quản lý qua Mobile App.
                </p>
              )}
            </div>

            {/* Vai trò phân quyền: Ẩn hoàn toàn cho Reporter (người dân không có chức vụ nhà thầu) */}
            {!isReporter && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Vai trò phân quyền: <span className="text-rose-600">*</span>
                </label>
                <select
                  disabled
                  title={personnelBlocks.account}
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
            )}
          </div>

          {/* Thông tin dự án đang phụ trách trong CSDL - chỉ hiện cho nhân sự nội bộ (non-Supervisor & non-Reporter) */}
          {!isSupervisorRole && !isReporter && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-[#C9A227]" />
                <label className="font-semibold text-slate-800">
                  Dự án bảo hành đang phụ trách (CSDL):
                </label>
              </div>

              {userToEdit.assigned_project_ids && userToEdit.assigned_project_ids.length > 0 ? (
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
                          {userToEdit.project_memberships?.some(m => m.projectId === p.id && m.isPrimary) && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                              Chỉ huy trưởng chính
                            </span>
                          )}
                        </span>
                      ))}
                  </div>
                  {isPmRole && (
                    <p className="text-[11px] text-slate-500 italic leading-relaxed pt-1 border-t border-slate-200">
                      <strong>Lưu ý nghiệp vụ:</strong> Phân công hoặc bàn giao dự án cho Chỉ huy trưởng (PM) phải thực hiện qua quy trình pháp lý tại nút <strong>"Điều chuyển &amp; Bàn giao dự án"</strong> (API-113) ngoài danh bạ, không thể tự ý gỡ bỏ qua form cập nhật thông tin chung.
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
            <label className="font-semibold text-slate-700">
              {isReporter ? 'Trạng thái tài khoản:' : 'Trạng thái làm việc:'}
            </label>
            {userToEdit.status === 'UNKNOWN' ? <p>Chưa có thông tin trạng thái tài khoản.</p> : <fieldset disabled title={personnelBlocks.account} className="grid grid-cols-2 gap-2 pt-1">
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
                <span>{isReporter ? 'Khóa tài khoản (SUSPENDED)' : 'Đình chỉ phiên (SUSPENDED)'}</span>
              </button>
            </fieldset>}
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
              disabled={!phoneEligible || !snapshotReady || detailLoading || commandBusy || !!phonePending?.conflict || !!phonePending?.keyConflict}
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{commandBusy ? 'Đang đối chiếu...' : phonePending?.receipt ? 'Đọc lại kết quả' : phonePending ? 'Gửi lại đúng yêu cầu' : 'Lưu số điện thoại'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
