import React, { useState, useCallback } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { AccountsTab } from './system-control/AccountsTab'
import { SuspendUserModal } from './system-control/SuspendUserModal'
import { UserDetailModal } from './system-control/UserDetailModal'
import { EditUserModal } from './system-control/EditUserModal'
import { AddPersonnelModal } from './system-control/AddPersonnelModal'
import { ResetPasswordModal } from './system-control/ResetPasswordModal'
import { usePersonnelState } from './system-control/usePersonnelState'

export const PersonnelManagement: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const [notice, setNotice] = useState<string | null>(null)
  const triggerNotice = useCallback((msg: string) => {
    setNotice(msg)
    const isError = msg.includes('❌') || msg.toLowerCase().includes('lỗi')
    setTimeout(() => setNotice(null), isError ? 8000 : 4000)
  }, [])

  const p = usePersonnelState(triggerNotice)

  return (
    <div className="flex flex-col gap-5 max-w-[1720px] mx-auto w-full pb-16 bg-slate-50/50">
      {/* Toast thông báo - z-[9999] để luôn nổi trên tất cả modal */}
      {notice && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md bg-slate-900/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 border border-slate-700/80">
          <span className="material-symbols-outlined text-[20px] text-[#C9A227] shrink-0 mt-0.5">
            {notice.includes('❌') ? 'error' : 'check_circle'}
          </span>
          <div className="flex-1 leading-relaxed break-words">{notice}</div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header trang Quản lý nhân sự */}
      <div className="flex flex-col gap-3 bg-white border-[1.5px] border-[#E2E5E9] p-5 rounded-[20px] shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-[#1E40AF] to-slate-200" />
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
              <span className="material-symbols-outlined text-[15px] text-[#C9A227]">
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
                : 'Nhân Sự Ban Điều Hành Dự Án'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isSupervisor
                ? 'Quản lý cấp phát tài khoản, phân quyền vai trò chuyên môn (PM, Giám sát, Kỹ sư Drone, Tổ thi công) và kiểm soát phiên làm việc trên toàn hệ thống.'
                : 'Theo dõi danh sách kỹ sư và tổ thi công hiện trường được biên chế trong ban điều hành dự án.'}
            </p>
          </div>

          {/* Nút hành động chuyên biệt cho nhân sự */}
          {isSupervisor && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  p.setAddPersonnelTab('ASSIGN')
                  p.setShowAddPersonnelModal(true)
                }}
                className="px-3.5 py-2 rounded-[10px] bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer border border-[#B38E1F]"
              >
                <span className="material-symbols-outlined text-[16px] text-white">swap_horiz</span>
                <span>Điều chuyển & Bàn giao dự án</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  p.setAddPersonnelTab('NEW')
                  p.setShowAddPersonnelModal(true)
                }}
                className="px-3.5 py-2 rounded-[10px] bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer border border-[#B38E1F]"
              >
                <span className="material-symbols-outlined text-[16px] text-white">mail</span>
                <span>+ Gửi lời mời nhân sự mới</span>
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
          isLoading={p.isLoading}
          error={p.error}
          onRetry={p.loadUsers}
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
          setUserToResetPassword={p.setUserToResetPassword}
          setShowResetPasswordModal={p.setShowResetPasswordModal}
        />
      </div>

      {/* Các Modals quản lý tài khoản & nhân sự */}
      <SuspendUserModal
        showSuspendModal={p.showSuspendModal}
        setShowSuspendModal={p.setShowSuspendModal}
        userToSuspend={p.userToSuspend}
        suspendReason={p.suspendReason}
        setSuspendReason={p.setSuspendReason}

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
        editSelectedProjectIds={p.editSelectedProjectIds}
        toggleEditProject={p.toggleEditProject}
        selectAllEditProjects={p.selectAllEditProjects}
        clearAllEditProjects={p.clearAllEditProjects}
        editStatus={p.editStatus}
        setEditStatus={p.setEditStatus}
        projectsList={p.projectsList}
        handleSaveEdit={p.handleSaveEdit}
      />

      <AddPersonnelModal
        usersList={p.usersList}
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
        newPersonnelProjectIds={p.newPersonnelProjectIds}
        toggleNewPersonnelProject={p.toggleNewPersonnelProject}
        selectAllNewPersonnelProjects={p.selectAllNewPersonnelProjects}
        clearAllNewPersonnelProjects={p.clearAllNewPersonnelProjects}
        assignExistingUserId={p.assignExistingUserId}
        setAssignExistingUserId={p.setAssignExistingUserId}
        assignExistingProjectIds={p.assignExistingProjectIds}
        toggleAssignExistingProject={p.toggleAssignExistingProject}
        selectAllAssignExistingProjects={p.selectAllAssignExistingProjects}
        clearAllAssignExistingProjects={p.clearAllAssignExistingProjects}
        assignEffectiveFrom={p.assignEffectiveFrom}
        setAssignEffectiveFrom={p.setAssignEffectiveFrom}
        assignReason={p.assignReason}
        setAssignReason={p.setAssignReason}

        projectsList={p.projectsList}
        handleAddPersonnelSubmit={p.handleAddPersonnelSubmit}
      />

      <ResetPasswordModal
        isOpen={p.showResetPasswordModal}
        user={p.userToResetPassword}
        onClose={() => p.setShowResetPasswordModal(false)}
        onConfirm={p.handleConfirmResetPassword}
      />
    </div>
  )
}

export default PersonnelManagement
