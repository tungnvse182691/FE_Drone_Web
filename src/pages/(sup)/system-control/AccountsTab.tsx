import React from 'react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'
import { mapBackendRoleToRoleCode } from '../../../api/services/personnelService'

interface AccountsTabProps {
  isSupervisor: boolean
  currentUser: { email?: string; [key: string]: any } | null
  filteredUsers: SystemUserAccount[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
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
  isLoading,
  error,
  onRetry,
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
              Danh sách nhân sự hệ thống
            </h2>
            <p className="text-xs text-slate-500">
              {isSupervisor
                ? 'Quản lý danh sách tài khoản, vai trò chuyên môn và phân công dự án bảo hành (100% CSDL Backend)'
                : 'Danh sách nhân sự trong ban điều hành dự án (Chế độ xem Chỉ huy trưởng PM)'}
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
            <option value={RoleCode.REPORTER}>Người phản ánh (Reporter / Dân)</option>
          </select>
        </div>
      </div>

      {/* Thông báo lỗi nếu API thất bại (Tuân thủ kỷ luật báo lỗi minh bạch, cấm fallback mock) */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0">error</span>
            <div>
              <p className="font-bold">Lỗi truy vấn dữ liệu nhân sự từ Backend:</p>
              <p className="text-rose-700 font-mono text-[11px] mt-0.5">{error}</p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer transition shadow-2xs"
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      {/* Trạng thái đang tải dữ liệu từ CSDL Docker */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Đang truy vấn danh sách nhân sự từ CSDL Backend Docker...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <span className="material-symbols-outlined text-4xl text-slate-300">person_off</span>
          <p className="text-xs font-semibold text-slate-600">Không có dữ liệu nhân sự nào trong CSDL Backend</p>
          <p className="text-[11px] text-slate-400">Vui lòng kiểm tra lại bộ lọc tìm kiếm hoặc thêm nhân sự mới vào hệ thống.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-[#E2E5E9]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] text-slate-700 font-semibold uppercase tracking-wider border-b border-[#EDEFF2] text-[12px]">
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-3">Gmail / Email</th>
                <th className="py-3 px-3">Số điện thoại</th>
                <th className="py-3 px-3">Vai trò &amp; Dự án phụ trách</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF2] text-slate-800">
              {filteredUsers.map((u, idx) => {
                const isCurrent = Boolean(
                  currentUser?.email && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase()
                )

                const isSuspended = u.status === 'SUSPENDED'
                const isInvited = u.status === 'INVITED'
                const normalizedRole = mapBackendRoleToRoleCode(u.role)

                return (
                  <tr
                    key={u.id ? `${u.id}-${idx}` : `user-${idx}`}
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
                              : normalizedRole === RoleCode.SUPERVISOR
                              ? 'bg-[#C9A227]'
                              : normalizedRole === RoleCode.PROJECT_MANAGER
                              ? 'bg-[#1E40AF]'
                              : normalizedRole === RoleCode.DRONE_OPERATOR
                              ? 'bg-amber-600'
                              : normalizedRole === RoleCode.REPAIR_CREW
                              ? 'bg-emerald-700'
                              : 'bg-teal-600'
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
                        </div>
                      </div>
                    </td>

                    {/* Gmail / Email */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11.5px]">
                        <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">mail</span>
                        <span className="hover:text-slate-900 transition-colors select-all">{u.email || '—'}</span>
                      </div>
                    </td>

                    {/* Số điện thoại */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11.5px]">
                        <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">call</span>
                        <span>{u.phone || '—'}</span>
                      </div>
                    </td>

                    {/* Vai trò & Dự án phụ trách (Gộp tinh gọn) */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                            normalizedRole === RoleCode.SUPERVISOR
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : normalizedRole === RoleCode.PROJECT_MANAGER
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : normalizedRole === RoleCode.DRONE_OPERATOR
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : normalizedRole === RoleCode.REPAIR_CREW
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-teal-100 text-teal-900 border border-teal-200'
                          }`}
                        >
                          {normalizedRole === RoleCode.SUPERVISOR
                            ? 'Giám sát (CĐT)'
                            : normalizedRole === RoleCode.PROJECT_MANAGER
                            ? 'Chỉ huy trưởng (PM)'
                            : normalizedRole === RoleCode.DRONE_OPERATOR
                            ? 'Phi công UAV'
                            : normalizedRole === RoleCode.REPAIR_CREW
                            ? 'Tổ thi công'
                            : 'Người phản ánh (Reporter)'}
                        </span>
                        <span
                          className="text-[11px] text-slate-600 font-medium truncate max-w-[220px] block"
                          title={u.project_scope}
                        >
                          {u.project_scope}
                        </span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          ĐÃ ĐÌNH CHỈ
                        </span>
                      ) : isInvited ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          CHỜ KÍCH HOẠT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          ĐANG HOẠT ĐỘNG
                        </span>
                      )}
                    </td>

                    {/* Hành động */}
                    <td className="py-3 px-2 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Nút Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => setSelectedUserDetail(u)}
                          className="p-1.5 rounded-[8px] border border-[#E2E5E9] bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs shrink-0"
                          title="Xem hồ sơ nhân sự chi tiết"
                        >
                          <span className="material-symbols-outlined text-[17px] block">
                            visibility
                          </span>
                        </button>

                        {/* Các nút hành động đặc quyền cho Giám sát */}
                        {isSupervisor && (
                          <>
                            {/* Nút Chỉnh sửa */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-[8px] border border-[#E2E5E9] bg-white hover:bg-amber-50 text-slate-600 hover:text-[#C9A227] hover:border-amber-300 transition-all cursor-pointer shadow-2xs shrink-0"
                              title="Chỉnh sửa phân quyền & tuyến phụ trách (QT01, QT02)"
                            >
                              <span className="material-symbols-outlined text-[17px] block">
                                edit
                              </span>
                            </button>

                            {/* Nút Đặt lại mật khẩu tạm thời */}
                            <button
                              type="button"
                              onClick={() => {
                                setUserToResetPassword(u)
                                setShowResetPasswordModal(true)
                              }}
                              className="p-1.5 rounded-[8px] border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer shadow-2xs shrink-0"
                              title="Đặt lại mật khẩu tạm thời cho nhân sự (API-240 / CN10)"
                            >
                              <span className="material-symbols-outlined text-[17px] block">
                                lock_reset
                              </span>
                            </button>

                            {/* Nút Đình chỉ / Khôi phục */}
                            {isSuspended ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreUser(u.id)}
                                className="p-1.5 rounded-[8px] border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer shadow-2xs shrink-0"
                                title="Khôi phục quyền truy cập tài khoản (API-239)"
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
                                title="Đình chỉ tài khoản nhân sự (API-239)"
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
      )}
    </div>
  )
}
