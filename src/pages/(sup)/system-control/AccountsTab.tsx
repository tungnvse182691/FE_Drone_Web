import React from 'react'
import {
  Search,
  UserPlus,
  Eye,
  Edit3,
  RotateCcw
} from 'lucide-react'
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
    <div className="bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E5E9]">
        <div>
          <h2 className="text-sm font-bold text-[#151C27]">
            Danh sách nhân sự &amp; Thiết bị hiện trường
          </h2>
          <p className="text-xs text-[#555F6F]">
            {isSupervisor
              ? 'Quản lý phiên đăng nhập thực tế, thiết bị thu thập GIS/RTK và thu hồi token tức thì (UAT-09)'
              : 'Danh sách nhân sự và thiết bị trong ban điều hành dự án (Chế độ xem Chỉ huy trưởng PM)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555F6F]" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Tìm tên, email, dự án..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs text-[#151C27] focus:outline-none focus:border-[#C9A227] transition-all"
            />
          </div>

          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-semibold text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value={RoleCode.SUPERVISOR}>SUPERVISOR</option>
            <option value={RoleCode.PROJECT_MANAGER}>PM (Project Manager)</option>
            <option value={RoleCode.DRONE_OPERATOR}>DRONE_OPERATOR</option>
            <option value={RoleCode.REPAIR_CREW}>CREW_LEAD</option>
          </select>

          {isSupervisor && (
            <button
              type="button"
              onClick={() => {
                setAddPersonnelTab('NEW')
                setShowAddPersonnelModal(true)
              }}
              className="px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Thêm nhân sự</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8F9FA] text-[#555F6F] font-semibold uppercase tracking-wider border-b border-[#E2E5E9] text-[11px]">
              <th className="py-3 px-4">Thành viên &amp; Liên hệ</th>
              <th className="py-3 px-3">Vai trò phân quyền</th>
              <th className="py-3 px-3">Phạm vi phụ trách</th>
              <th className="py-3 px-3">Phiên &amp; Thiết bị</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E5E9] text-[#151C27]">
            {filteredUsers.map((u) => {
              const isCurrent = Boolean(
                currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()
              )

              const isSuspended = u.status === 'SUSPENDED'
              const isInvited = u.status === 'INVITED'

              return (
                <tr
                  key={u.id}
                  className={`hover:bg-[#F8F9FA] transition-colors ${
                    isSuspended ? 'bg-[#F8F9FA]/40 opacity-70' : ''
                  }`}
                >
                  {/* Thành viên */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shadow-sm text-white ${
                          isSuspended
                            ? 'bg-[#CAC7B5] text-[#555F6F]'
                            : u.role === RoleCode.SUPERVISOR
                            ? 'bg-[#C9A227]'
                            : u.role === RoleCode.PROJECT_MANAGER
                            ? 'bg-[#555F6F]'
                            : 'bg-[#7A7768]'
                        }`}
                      >
                        {u.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[#151C27] flex items-center gap-1.5">
                          <span className={isSuspended ? 'line-through text-[#7A7768]' : ''}>
                            {u.full_name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-[#C9A227] font-bold font-mono">
                              (Chính bạn)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#555F6F] font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Vai trò */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        u.role === RoleCode.SUPERVISOR
                          ? 'bg-[#ECDCFF] text-[#24113F]'
                          : u.role === RoleCode.PROJECT_MANAGER
                          ? 'bg-[#D9E3F6] text-[#3D4756]'
                          : u.role === RoleCode.DRONE_OPERATOR
                          ? 'bg-[#FBF6E9] border border-[#F3E6C4] text-[#8C6D15]'
                          : 'bg-[#F0F2F5] text-[#555F6F]'
                      }`}
                    >
                      {u.role === RoleCode.SUPERVISOR ? 'SUPERVISOR' : u.role === RoleCode.PROJECT_MANAGER ? 'PM' : u.role}
                    </span>
                  </td>

                  {/* Phạm vi phụ trách */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[#151C27]">
                    <span className="font-medium">{u.project_scope}</span>
                  </td>

                  {/* Phiên & Thiết bị */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-[#151C27] font-medium flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSuspended ? 'bg-[#7A7768]' : 'bg-[#C9A227]'
                        }`}
                      ></span>
                      <span>{u.device_info}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#555F6F]">
                      {u.last_active} • IP: {u.ip_address}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F1F3F5] text-[#555F6F] font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#555F6F]"></span>
                        SUSPENDED
                      </span>
                    ) : isInvited ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBF6E9] border border-[#F3E6C4] text-[#8C6D15] font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                        INVITED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                        ACTIVE
                      </span>
                    )}
                  </td>

                  {/* Hành động */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUserDetail(u)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E2E5E9] bg-white hover:border-[#C9A227] hover:text-[#C9A227] text-[#151C27] font-semibold text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        title="Xem chi tiết hồ sơ nhân sự, dự án và thiết bị"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Chi tiết</span>
                      </button>

                      {isSupervisor && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-[#8C6D15] font-semibold text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                            title="Chỉnh sửa thông tin nhân sự và dự án phụ trách"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span>Sửa</span>
                          </button>

                          {isCurrent ? (
                            <span className="text-[10px] text-[#7A7768] italic px-1">
                              (Hiện tại)
                            </span>
                          ) : isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreUser(u.id)}
                              className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                              title="Khôi phục quyền truy cập"
                            >
                              <RotateCcw className="w-3 h-3 text-emerald-600" />
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
                              title="Đình chỉ nhân sự và bàn giao công việc theo kịch bản UAT-09"
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
