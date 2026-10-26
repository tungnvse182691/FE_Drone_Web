import React from 'react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'

interface AccountsTabProps {
  isSupervisor: boolean
  currentUser: { email?: string; [key: string]: any } | null
  filteredUsers: SystemUserAccount[]
  userSearchTerm: string
  setUserSearchTerm: (term: string) => void
  userRoleFilter: string
  setUserRoleFilter: (role: string) => void
  setAddPersonnelTab: (tab: 'NEW' | 'ASSIGN') => void
  setShowAddPersonnelModal: (show: boolean) => void
  setSelectedUserDetail: (u: SystemUserAccount | null) => void
  handleOpenEdit: (u: SystemUserAccount) => void
  handleRestoreUser: (id: string) => void
  setUserToSuspend: (u: SystemUserAccount | null) => void
  setShowSuspendModal: (show: boolean) => void
  setUserToResetPassword: (u: SystemUserAccount | null) => void
  setShowResetPasswordModal: (show: boolean) => void
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  isSupervisor,
  currentUser,
  filteredUsers,
  userSearchTerm,
  setUserSearchTerm,
  userRoleFilter,
  setUserRoleFilter,
  setAddPersonnelTab,
  setShowAddPersonnelModal,
  setSelectedUserDetail,
  handleOpenEdit,
  handleRestoreUser,
  setUserToSuspend,
  setShowSuspendModal,
  setUserToResetPassword,
  setShowResetPasswordModal
}) => {
  return (
    <div className="bg-white border-[1.5px] border-[#E2E5E9] rounded-[20px] shadow-2xs p-5 flex flex-col gap-4 w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] via-[#C9A227] to-slate-200" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EDEFF2]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <span className="material-symbols-outlined text-[18px]">group</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Danh sách nhân sự &amp; Thiết bị hiện trường
            </h2>
            <p className="text-xs text-slate-500">
              {isSupervisor
                ? 'Quản lý phiên đăng nhập thực tế, thiết bị thu thập dữ liệu hiện trường và kiểm soát tài khoản'
                : 'Danh sách nhân sự và thiết bị trong ban điều hành dự án (Chế độ xem Chỉ huy trưởng PM)'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-64">
            <span className="material-symbols-outlined text-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Tìm tên, email, dự án..."
              className="w-full pl-9 pr-3 py-1.5 rounded-[10px] border border-[#E2E5E9] bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all"
            />
          </div>

          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-[10px] border border-[#E2E5E9] bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer transition-all"
          >
            <option value="all">Tất cả vai trò</option>
            <option value={RoleCode.SUPERVISOR}>Giám sát (Supervisor)</option>
            <option value={RoleCode.PROJECT_MANAGER}>Chỉ huy trưởng (PM)</option>
            <option value={RoleCode.DRONE_OPERATOR}>Kỹ sư Drone</option>
            <option value={RoleCode.REPAIR_CREW}>Đội trưởng thi công</option>
          </select>

          {isSupervisor && (
            <button
              type="button"
              onClick={() => {
                setAddPersonnelTab('NEW')
                setShowAddPersonnelModal(true)
              }}
              className="px-3.5 py-1.5 rounded-[10px] bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>+ Gửi lời mời nhân sự</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-[#E2E5E9]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8F9FA] text-slate-700 font-semibold uppercase tracking-wider border-b border-[#EDEFF2] text-[12px]">
              <th className="py-3 px-4">Thành viên &amp; Liên hệ</th>
              <th className="py-3 px-3">Vai trò &amp; Dự án phụ trách</th>
              <th className="py-3 px-3">Phiên &amp; Thiết bị</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEFF2] text-slate-800">
            {filteredUsers.map((u) => {
              const isCurrent = Boolean(
                currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()
              )

              const isSuspended = u.status === 'SUSPENDED'
              const isInvited = u.status === 'INVITED'

              return (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSuspended ? 'bg-slate-50/50 opacity-70' : ''
                  }`}
                >
                  {/* Thành viên */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-[11px] shadow-2xs text-white shrink-0 ${
                          isSuspended
                            ? 'bg-slate-400'
                            : u.role === RoleCode.SUPERVISOR
                            ? 'bg-[#C9A227]'
                            : u.role === RoleCode.PROJECT_MANAGER
                            ? 'bg-[#1E40AF]'
                            : 'bg-slate-600'
                        }`}
                      >
                        {u.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5 leading-tight">
                          <span className={isSuspended ? 'line-through text-slate-400' : ''}>
                            {u.full_name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-[#8C6D1F] font-bold font-mono shrink-0">
                              (Chính bạn)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Vai trò & Dự án phụ trách (Gộp tinh gọn) */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                          u.role === RoleCode.SUPERVISOR
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : u.role === RoleCode.PROJECT_MANAGER
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : u.role === RoleCode.DRONE_OPERATOR
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {u.role === RoleCode.SUPERVISOR
                          ? 'Giám sát (CĐT)'
                          : u.role === RoleCode.PROJECT_MANAGER
                          ? 'Chỉ huy trưởng (PM)'
                          : u.role === RoleCode.DRONE_OPERATOR
                          ? 'Phi công UAV'
                          : 'Tổ thi công'}
                      </span>
                      <span
                        className="text-[11px] text-slate-600 font-medium truncate max-w-[240px] block"
                        title={u.project_scope}
                      >
                        {u.project_scope}
                      </span>
                    </div>
                  </td>

                  {/* Phiên & Thiết bị */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-0.5">
                      <div
                        className="text-slate-800 font-medium flex items-center gap-1.5 text-xs truncate max-w-[200px]"
                        title={u.device_info}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isSuspended ? 'bg-slate-400' : 'bg-emerald-500'
                          }`}
                        ></span>
                        <span className="truncate">{u.device_info}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                        {u.last_active} • {u.ip_address}
                      </div>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        ĐÃ TẠM KHÓA
                      </span>
                    ) : isInvited ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                        CHỜ KÍCH HOẠT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        ĐANG HOẠT ĐỘNG
                      </span>
                    )}
                  </td>

                  {/* Hành động (Gọn gàng với Icon Buttons + Tooltips) */}
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedUserDetail(u)}
                        className="p-1.5 rounded-[8px] border border-slate-200 bg-white hover:border-[#C9A227] hover:text-[#8C6D1F] text-slate-600 transition-all cursor-pointer shadow-2xs shrink-0"
                        title="Xem chi tiết hồ sơ nhân sự, dự án và thiết bị"
                      >
                        <span className="material-symbols-outlined text-[17px] block">
                          visibility
                        </span>
                      </button>

                      {isSupervisor && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-[8px] border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 transition-all cursor-pointer shadow-2xs shrink-0"
                            title="Chỉnh sửa thông tin nhân sự và dự án phụ trách"
                          >
                            <span className="material-symbols-outlined text-[17px] text-[#C9A227] block">
                              edit
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setUserToResetPassword(u)
                              setShowResetPasswordModal(true)
                            }}
                            className="p-1.5 rounded-[8px] border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 transition-all cursor-pointer shadow-2xs shrink-0"
                            title="Đặt lại mật khẩu tạm thời & kích hoạt buộc đổi mật khẩu (CN10)"
                          >
                            <span className="material-symbols-outlined text-[17px] block">
                              lock_reset
                            </span>
                          </button>

                          {isCurrent ? (
                            <span className="text-[10px] text-slate-400 italic px-1">
                              (Hiện tại)
                            </span>
                          ) : isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreUser(u.id)}
                              className="p-1.5 rounded-[8px] border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer shadow-2xs shrink-0"
                              title="Khôi phục quyền truy cập tài khoản (QT01)"
                            >
                              <span className="material-symbols-outlined text-[17px] block">
                                restore
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToSuspend(u)
                                setShowSuspendModal(true)
                              }}
                              className="p-1.5 rounded-[8px] border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer shadow-2xs shrink-0"
                              title="Đình chỉ nhân sự và bàn giao công việc (QT01, QT02)"
                            >
                              <span className="material-symbols-outlined text-[17px] block">
                                block
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
