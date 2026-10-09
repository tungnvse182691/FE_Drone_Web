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
  setShowSuspendModal
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
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
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-brand-gold transition-all"
            />
          </div>

          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-gold cursor-pointer"
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
              className="px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>+ Thêm nhân sự</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <th className="py-3 px-4">Thành viên &amp; Liên hệ</th>
              <th className="py-3 px-3">Vai trò phân quyền</th>
              <th className="py-3 px-3">Phạm vi phụ trách</th>
              <th className="py-3 px-3">Phiên &amp; Thiết bị</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {filteredUsers.map((u) => {
              const isCurrent = Boolean(
                currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()
              )

              const isSuspended = u.status === 'SUSPENDED'
              const isInvited = u.status === 'INVITED'

              return (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isSuspended ? 'bg-slate-50/50 opacity-70' : ''
                  }`}
                >
                  {/* Thành viên */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shadow-xs text-white ${
                          isSuspended
                            ? 'bg-slate-400'
                            : u.role === RoleCode.SUPERVISOR
                            ? 'bg-brand-gold'
                            : u.role === RoleCode.PROJECT_MANAGER
                            ? 'bg-slate-700'
                            : 'bg-slate-600'
                        }`}
                      >
                        {u.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className={isSuspended ? 'line-through text-slate-400' : ''}>
                            {u.full_name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-brand-goldDark font-bold font-mono">
                              (Chính bạn)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Vai trò */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
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
                  </td>

                  {/* Phạm vi phụ trách */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-800">
                    <span className="font-medium">{u.project_scope}</span>
                  </td>

                  {/* Phiên & Thiết bị */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-slate-800 font-medium flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSuspended ? 'bg-slate-400' : 'bg-brand-gold'
                        }`}
                      ></span>
                      <span>{u.device_info}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {u.last_active} • IP: {u.ip_address}
                    </div>
                  </td>

                  {/* Trạng thái 100% Tiếng Việt */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        ĐÃ TẠM KHÓA
                      </span>
                    ) : isInvited ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
                        CHỜ KÍCH HOẠT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        ĐANG HOẠT ĐỘNG
                      </span>
                    )}
                  </td>

                  {/* Hành động */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUserDetail(u)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-brand-gold hover:text-brand-goldDark text-slate-700 font-semibold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title="Xem chi tiết hồ sơ nhân sự, dự án và thiết bị"
                      >
                        <span className="material-symbols-outlined text-[15px] text-slate-500">
                          visibility
                        </span>
                        <span>Chi tiết</span>
                      </button>

                      {isSupervisor && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-semibold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="Chỉnh sửa thông tin nhân sự và dự án phụ trách"
                          >
                            <span className="material-symbols-outlined text-[15px] text-brand-gold">
                              edit
                            </span>
                            <span>Sửa</span>
                          </button>

                          {isCurrent ? (
                            <span className="text-[10px] text-slate-400 italic px-1">
                              (Hiện tại)
                            </span>
                          ) : isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreUser(u.id)}
                              className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                              title="Khôi phục quyền truy cập"
                            >
                              <span className="material-symbols-outlined text-[15px] text-emerald-600">
                                restore
                              </span>
                              <span>Khôi phục</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToSuspend(u)
                                setShowSuspendModal(true)
                              }}
                              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors border border-rose-200 cursor-pointer"
                              title="Đình chỉ nhân sự và bàn giao công việc"
                            >
                              Đình chỉ
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
