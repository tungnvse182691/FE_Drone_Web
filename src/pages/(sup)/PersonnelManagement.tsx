import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { AccountsTab } from './system-control/AccountsTab'
import { SuspendUserModal } from './system-control/SuspendUserModal'
import { UserDetailModal } from './system-control/UserDetailModal'
import { EditUserModal } from './system-control/EditUserModal'
import { AddPersonnelModal } from './system-control/AddPersonnelModal'
import { usePersonnelState } from './system-control/usePersonnelState'

export const PersonnelManagement: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const [notice, setNotice] = useState<string | null>(null)
  const triggerNotice = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  const p = usePersonnelState(triggerNotice)

  return (
    <div className="flex flex-col gap-5 max-w-[1720px] mx-auto w-full pb-16 bg-slate-50/50">
      {/* Toast thông báo */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-800">
          <span className="material-symbols-outlined text-[18px] text-brand-gold">
            check_circle
          </span>
          <span>{notice}</span>
        </div>
      )}

      {/* Header trang Quản lý nhân sự (KHÔNG CÓ nút lập yêu cầu xóa dữ liệu) */}
      <div className="flex flex-col gap-3 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">
              Trang chủ
            </span>
            <span className="text-slate-300">/</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">
              {isSupervisor ? 'Báo cáo & Quản trị' : 'Báo cáo & Hồ sơ'}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">
              {isSupervisor ? 'Nhân sự & Phân quyền' : 'Nhân sự dự án'}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <span className="material-symbols-outlined text-[15px] text-brand-gold">
                {isSupervisor ? 'admin_panel_settings' : 'engineering'}
              </span>
              <span>
                {isSupervisor
                  ? 'Giám sát: Toàn quyền quản trị tài khoản & phân quyền'
                  : 'Chỉ huy trưởng: Quản lý nhân sự ban điều hành dự án'}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1 max-w-4xl">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isSupervisor
                ? 'Quản Trị Tài Khoản, Phân Quyền & Nhân Sự Hệ Thống'
                : 'Nhân Sự Ban Điều Hành Dự Án & Thiết Bị Hiện Trường'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isSupervisor
                ? 'Quản lý cấp phát tài khoản, phân quyền vai trò chuyên môn (PM, Giám sát, Kỹ sư Drone, Tổ thi công) và kiểm soát phiên làm việc trên toàn hệ thống.'
                : 'Theo dõi danh sách kỹ sư, tổ thi công hiện trường và thiết bị làm việc được biên chế trong ban điều hành dự án.'}
            </p>
          </div>

          {/* Nút hành động chuyên biệt cho nhân sự (KHÔNG CÓ nút xóa dữ liệu) */}
          {isSupervisor && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  p.setAddPersonnelTab('NEW')
                  p.setShowAddPersonnelModal(true)
                }}
                className="px-3.5 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>+ Thêm nhân sự vào dự án</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nội dung danh sách nhân sự */}
      <div className="w-full">
        <AccountsTab
          isSupervisor={isSupervisor}
          currentUser={user}
          filteredUsers={p.filteredUsers}
          userSearchTerm={p.userSearchTerm}
          setUserSearchTerm={p.setUserSearchTerm}
          userRoleFilter={p.userRoleFilter}
          setUserRoleFilter={p.setUserRoleFilter}
          setAddPersonnelTab={p.setAddPersonnelTab}
          setShowAddPersonnelModal={p.setShowAddPersonnelModal}
          setSelectedUserDetail={p.setSelectedUserDetail}
          handleOpenEdit={p.handleOpenEdit}
          handleRestoreUser={p.handleRestoreUser}
          setUserToSuspend={p.setUserToSuspend}
          setShowSuspendModal={p.setShowSuspendModal}
        />
      </div>

      {/* Các Modals quản lý tài khoản & nhân sự */}
      <SuspendUserModal
        showSuspendModal={p.showSuspendModal}
        setShowSuspendModal={p.setShowSuspendModal}
        userToSuspend={p.userToSuspend}
        handoffAssignee={p.handoffAssignee}
        setHandoffAssignee={p.setHandoffAssignee}
        handleConfirmSuspend={p.handleConfirmSuspend}
      />

      <UserDetailModal
        selectedUserDetail={p.selectedUserDetail}
        setSelectedUserDetail={p.setSelectedUserDetail}
        isSupervisor={isSupervisor}
        handleOpenEdit={p.handleOpenEdit}
      />

      <EditUserModal
        userToEdit={p.userToEdit}
        setUserToEdit={p.setUserToEdit}
        editFullName={p.editFullName}
        setEditFullName={p.setEditFullName}
        editEmail={p.editEmail}
        setEditEmail={p.setEditEmail}
        editPhone={p.editPhone}
        setEditPhone={p.setEditPhone}
        editRole={p.editRole}
        setEditRole={p.setEditRole}
        editProjectScope={p.editProjectScope}
        setEditProjectScope={p.setEditProjectScope}
        editCertificate={p.editCertificate}
        setEditCertificate={p.setEditCertificate}
        editStatus={p.editStatus}
        setEditStatus={p.setEditStatus}
        handleSaveEdit={p.handleSaveEdit}
      />

      <AddPersonnelModal
        showAddPersonnelModal={p.showAddPersonnelModal}
        setShowAddPersonnelModal={p.setShowAddPersonnelModal}
        addPersonnelTab={p.addPersonnelTab}
        setAddPersonnelTab={p.setAddPersonnelTab}
        newPersonnelName={p.newPersonnelName}
        setNewPersonnelName={p.setNewPersonnelName}
        newPersonnelEmail={p.newPersonnelEmail}
        setNewPersonnelEmail={p.setNewPersonnelEmail}
        newPersonnelPhone={p.newPersonnelPhone}
        setNewPersonnelPhone={p.setNewPersonnelPhone}
        newPersonnelRole={p.newPersonnelRole}
        setNewPersonnelRole={p.setNewPersonnelRole}
        newPersonnelProject={p.newPersonnelProject}
        setNewPersonnelProject={p.setNewPersonnelProject}
        newPersonnelCert={p.newPersonnelCert}
        setNewPersonnelCert={p.setNewPersonnelCert}
        assignExistingUserId={p.assignExistingUserId}
        setAssignExistingUserId={p.setAssignExistingUserId}
        assignExistingProject={p.assignExistingProject}
        setAssignExistingProject={p.setAssignExistingProject}
        usersList={p.usersList}
        handleAddPersonnelSubmit={p.handleAddPersonnelSubmit}
      />
    </div>
  )
}

export default PersonnelManagement
