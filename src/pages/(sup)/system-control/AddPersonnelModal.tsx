import React, { useState } from 'react'
import { UserPlus, X, Mail, UserCheck, Send, CheckSquare, Square, FolderKanban, AlertCircle, Lock } from 'lucide-react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'

export interface AddPersonnelModalProps {
  invitationBusy?: boolean
  blockedReason?: string

  showAddPersonnelModal: boolean
  setShowAddPersonnelModal: (show: boolean) => void
  addPersonnelTab: 'NEW' | 'ASSIGN'
  setAddPersonnelTab: (tab: 'NEW' | 'ASSIGN') => void
  newPersonnelName: string
  setNewPersonnelName: (val: string) => void
  newPersonnelEmail: string
  setNewPersonnelEmail: (val: string) => void
  newPersonnelPhone: string
  setNewPersonnelPhone: (val: string) => void
  newPersonnelRole: RoleCode
  setNewPersonnelRole: (val: RoleCode) => void
  newPersonnelProjectIds: string[]
  toggleNewPersonnelProject: (id: string) => void
  selectAllNewPersonnelProjects: () => void
  clearAllNewPersonnelProjects: () => void
  assignExistingUserId: string
  setAssignExistingUserId: (val: string) => void
  assignExistingProjectIds: string[]
  toggleAssignExistingProject: (id: string) => void
  selectAllAssignExistingProjects: () => void
  clearAllAssignExistingProjects: () => void
  usersList: SystemUserAccount[]
  projectsList: Array<{ id: string; name: string; code?: string; pm_user_id?: string; pm_name?: string }>
  assignEffectiveFrom?: string
  setAssignEffectiveFrom?: (val: string) => void
  assignReason?: string
  setAssignReason?: (val: string) => void
  handleAddPersonnelSubmit: (e: React.FormEvent) => void
}

export const AddPersonnelModal: React.FC<AddPersonnelModalProps> = ({
  showAddPersonnelModal,
  invitationBusy = false,
  blockedReason = '',
  setShowAddPersonnelModal,
  addPersonnelTab,
  setAddPersonnelTab,
  newPersonnelName,
  setNewPersonnelName,
  newPersonnelEmail,
  setNewPersonnelEmail,
  newPersonnelPhone,
  setNewPersonnelPhone,
  newPersonnelRole,
  setNewPersonnelRole,
  newPersonnelProjectIds,
  toggleNewPersonnelProject,
  selectAllNewPersonnelProjects,
  clearAllNewPersonnelProjects,
  assignExistingUserId,
  setAssignExistingUserId,
  assignExistingProjectIds,
  toggleAssignExistingProject,
  selectAllAssignExistingProjects,
  clearAllAssignExistingProjects,
  usersList,
  projectsList,
  assignEffectiveFrom,
  setAssignEffectiveFrom,
  assignReason,
  setAssignReason,
  handleAddPersonnelSubmit,
}) => {
  if (!showAddPersonnelModal) return null

  const isPmRole = newPersonnelRole === RoleCode.PROJECT_MANAGER

  // Invitation acceptance creates non-primary memberships, including PM.
  const isProjectLockedForNewPm = (p: { id: string }) => !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(p.id)

  // Chọn tất cả các dự án hợp lệ cho nhân sự mới (bỏ qua những dự án đã có PM)
  const handleSelectAllValidNewProjects = () => {
    if (isPmRole) {
      const validIds = projectsList.filter((p) => !isProjectLockedForNewPm(p)).map((p) => p.id)
      validIds.forEach((id) => {
        if (!newPersonnelProjectIds.includes(id)) toggleNewPersonnelProject(id)
      })
    } else {
      selectAllNewPersonnelProjects()
    }
  }

  // Tìm thông tin của nhân sự đang được chọn trong tab Điều chuyển
  const selectedExistingUser = usersList.find((u) => u.id === assignExistingUserId)
  const isAssigningPm = selectedExistingUser?.role === RoleCode.PROJECT_MANAGER

  // Tìm dự án được chọn trong tab Điều chuyển PM
  const selectedTargetProject = projectsList.find((p) => p.id === assignExistingProjectIds[0])
  const targetProjectHasPm = Boolean(
    selectedTargetProject?.pm_user_id &&
    selectedTargetProject?.pm_name &&
    !selectedTargetProject.pm_name.toLowerCase().includes('chưa')
  )

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-brand-border max-w-xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {addPersonnelTab === 'NEW'
                  ? 'Gửi Thư Mời Kích Hoạt Nhân Sự Mới (API-032)'
                  : 'Điều Chuyển / Bàn Giao Dự Án (API-113)'}
              </h3>
              <p className="text-xs text-slate-500">
                {addPersonnelTab === 'NEW'
                  ? 'Cấp quyền truy cập hệ thống bảo hành & sửa chữa đường bộ'
                  : 'Gán tuyến quản lý phụ trách cho nhân sự đang làm việc'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPersonnelModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-1 border-b border-slate-100 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAddPersonnelTab('NEW')}
              className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                addPersonnelTab === 'NEW'
                  ? 'border-[#C9A227] text-[#8C6D15]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gửi thư mời nhân sự mới</span>
            </button>
            <button
              type="button"
              onClick={() => setAddPersonnelTab('ASSIGN')}
              className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                addPersonnelTab === 'ASSIGN'
                  ? 'border-[#C9A227] text-[#8C6D15]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Điều chuyển nhân sự hiện có</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAddPersonnelSubmit} className="p-6 overflow-y-auto space-y-3.5 text-xs">
          <p role="status" className="text-rose-700">{blockedReason}</p>
          <fieldset disabled={addPersonnelTab === 'NEW' ? invitationBusy : !!blockedReason} className="border-0 p-0 m-0 min-w-0 space-y-3.5">
          {addPersonnelTab === 'NEW' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Họ và tên nhân sự: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    title="Người nhận nhập họ tên khi chấp nhận lời mời."
                    placeholder="Người nhận nhập khi chấp nhận lời mời"
                    value={newPersonnelName}
                    onChange={(e) => setNewPersonnelName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Email công vụ nhận thư mời: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nam.nguyen@hoanghai-infra.vn"
                    value={newPersonnelEmail}
                    onChange={(e) => setNewPersonnelEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Số điện thoại liên hệ:</label>
                  <input
                    type="text"
                    disabled
                    title="Điện thoại được cập nhật qua luồng riêng sau khi kích hoạt; DTO nhận lời mời không có điện thoại."
                    placeholder="Cập nhật sau khi kích hoạt tài khoản"
                    value={newPersonnelPhone}
                    onChange={(e) => setNewPersonnelPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Vai trò phân quyền: <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={newPersonnelRole}
                    onChange={(e) => setNewPersonnelRole(e.target.value as RoleCode)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    <option value={RoleCode.PROJECT_MANAGER}>PROJECT_MANAGER (Chỉ huy trưởng PM)</option>
                    <option value={RoleCode.DRONE_OPERATOR}>DRONE_OPERATOR (Phi công UAV / Kỹ sư Drone)</option>
                    <option value={RoleCode.REPAIR_CREW}>REPAIR_CREW (Đội thi công hiện trường)</option>
                  </select>
                </div>
              </div>

              {/* Phân công dự án ban đầu (Khóa dự án đã có PM) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-[#C9A227]" />
                    <label className="font-semibold text-slate-800">
                      Dự án bảo hành phụ trách ban đầu:
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      {`Đã chọn: ${newPersonnelProjectIds.length} / ${projectsList.length} dự án`}
                    </span>
                  </div>

                  {projectsList.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllValidNewProjects}
                        className="text-[11px] text-[#8C6D15] hover:text-[#5F490E] font-bold hover:underline cursor-pointer"
                      >
                        Chọn tất cả
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={clearAllNewPersonnelProjects}
                        className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold hover:underline cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  )}
                </div>

                {projectsList.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center text-[11px]">
                    Đang tải danh sách dự án...
                  </div>
                ) : (
                  <>
                    <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 space-y-1.5 divide-y divide-slate-100">
                      {projectsList.map((p) => {
                        const isChecked = newPersonnelProjectIds.includes(p.id)
                        const isLocked = isProjectLockedForNewPm(p)

                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (!isLocked) toggleNewPersonnelProject(p.id)
                            }}
                            className={`flex items-start gap-2.5 p-2 rounded-lg transition ${
                              isLocked
                                ? 'bg-slate-100/80 border border-slate-200/70 opacity-60 cursor-not-allowed'
                                : isChecked
                                ? 'bg-amber-50/80 border border-amber-200 cursor-pointer'
                                : 'bg-white hover:bg-slate-100 border border-transparent cursor-pointer'
                            }`}
                          >
                            <div className="pt-0.5 text-[#C9A227]">
                              {isLocked ? (
                                <Lock className="w-4 h-4 text-slate-400" />
                              ) : isChecked ? (
                                <CheckSquare className="w-4 h-4 text-[#C9A227]" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.code && (
                                  <span className="font-mono font-bold text-slate-900 text-[11px]">
                                    {p.code}
                                  </span>
                                )}
                                <span className="text-slate-700 font-medium truncate">
                                  {p.name}
                                </span>
                                {isLocked ? (
                                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-medium">
                                    ⛔ Đã có PM: {p.pm_name} (Khóa)
                                  </span>
                                ) : isPmRole && !p.pm_user_id ? (
                                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                                    ✓ Trống PM
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </>
                )}
              </div>

            </>
          ) : (
            /* TAB ĐIỀU CHUYỂN NHÂN SỰ HIỆN CÓ */
            <>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Chọn nhân sự TIẾP QUẢN / NHẬN DỰ ÁN MỚI: <span className="text-rose-600">*</span>
                </label>
                <select
                  value={assignExistingUserId}
                  onChange={(e) => setAssignExistingUserId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                >
                  <option value="">-- Chọn Chỉ huy trưởng (PM) cần điều chuyển --</option>
                  {usersList
                    .filter((u) => u.role === RoleCode.PROJECT_MANAGER)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} (PM) — Hiện tại: {u.project_scope}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 italic mt-1.5">
                  <strong>Gợi ý nghiệp vụ:</strong> Dự án luôn phải có 1 PM phụ trách. Để rút dự án khỏi một PM hiện tại (giúp PM đó trở về trạng thái &quot;Chưa phân công&quot;), hãy chọn một PM khác tại đây để tiếp quản dự án đó.
                </p>
              </div>

              {/* Nếu nhân sự là PM: Điều chuyển tiếp quản làm PM chính (API-113) */}
              {isAssigningPm ? (
                <div className="space-y-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-[#C9A227]" />
                    <span>Quy trình điều chuyển &amp; bàn giao Chỉ huy trưởng chính (API-113)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">
                      Dự án tiếp quản làm PM chính: <span className="text-rose-600">*</span>
                    </label>
                    <select
                      required
                      value={assignExistingProjectIds[0] || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val) {
                          assignExistingProjectIds.length = 0
                          toggleAssignExistingProject(val)
                        } else {
                          clearAllAssignExistingProjects()
                        }
                      }}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Chọn dự án cần bàn giao cho PM này tiếp quản * --
                      </option>
                      {projectsList.map((p) => {
                        const isAlreadyPmOfThisProject = p.pm_user_id === selectedExistingUser?.id
                        if (isAlreadyPmOfThisProject) {
                          return (
                            <option key={p.id} value={p.id} disabled className="text-slate-400 bg-slate-100 font-normal">
                              {p.code ? `${p.code} — ` : ''}{p.name} (Đang do nhân sự này phụ trách — Đã là PM chính)
                            </option>
                          )
                        }

                        const hasPm = Boolean(
                          p.pm_user_id && p.pm_name && !p.pm_name.toLowerCase().includes('chưa')
                        )
                        return (
                          <option key={p.id} value={p.id}>
                            {p.code ? `${p.code} — ` : ''}{p.name}{' '}
                            {hasPm ? `(Đang do: ${p.pm_name} phụ trách ➔ Sẽ bàn giao thay thế)` : '(Trống PM)'}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  {targetProjectHasPm && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed flex items-start gap-2">
                      <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Cảnh báo bàn giao thay thế:</strong> Dự án này hiện đang do PM <strong>{selectedTargetProject?.pm_name}</strong> phụ trách. Khi xác nhận điều chuyển, hệ thống sẽ <strong>thu hồi quyền PM của {selectedTargetProject?.pm_name}</strong> và chuyển giao quyền Chỉ huy trưởng chính duy nhất cho PM <strong>{selectedExistingUser?.full_name}</strong>.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Ngày hiệu lực bàn giao:</label>
                      <input
                        type="date"
                        value={assignEffectiveFrom || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setAssignEffectiveFrom?.(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Lý do điều chuyển PM:</label>
                      <input
                        type="text"
                        value={assignReason || ''}
                        onChange={(e) => setAssignReason?.(e.target.value)}
                        placeholder="VD: Quyết định điều chuyển tuyến của Ban giám đốc"
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Nếu nhân sự là Drone Operator / Repair Crew: Cho phép tích chọn nhiều dự án */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-[#C9A227]" />
                      <label className="font-semibold text-slate-800">
                        Dự án điều chuyển sang phụ trách:
                      </label>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                        Đã chọn: {assignExistingProjectIds.length} / {projectsList.length} dự án
                      </span>
                    </div>

                    {projectsList.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllAssignExistingProjects}
                          className="text-[11px] text-[#8C6D15] hover:text-[#5F490E] font-bold hover:underline cursor-pointer"
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={clearAllAssignExistingProjects}
                          className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold hover:underline cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 space-y-1.5 divide-y divide-slate-100">
                    {projectsList.map((p) => {
                      const isChecked = assignExistingProjectIds.includes(p.id)
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleAssignExistingProject(p.id)}
                          className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition ${
                            isChecked
                              ? 'bg-amber-50/80 border border-amber-200'
                              : 'bg-white hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          <div className="pt-0.5 text-[#C9A227]">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#C9A227]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {p.code && (
                                <span className="font-mono font-bold text-slate-900 text-[11px]">
                                  {p.code}
                                </span>
                              )}
                              <span className="text-slate-700 font-medium truncate">
                                {p.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          </fieldset>
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddPersonnelModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!!blockedReason || addPersonnelTab === 'NEW' && invitationBusy ||
                addPersonnelTab === 'ASSIGN' &&
                (!assignExistingUserId ||
                  (selectedExistingUser?.role === RoleCode.PROJECT_MANAGER &&
                    assignExistingProjectIds.length === 0))
              }
              className={`px-4 py-2 text-white rounded-lg font-bold shadow-xs transition flex items-center gap-1.5 ${
                addPersonnelTab === 'ASSIGN' &&
                (!assignExistingUserId ||
                  (selectedExistingUser?.role === RoleCode.PROJECT_MANAGER &&
                    assignExistingProjectIds.length === 0))
                  ? 'bg-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer'
              }`}
            >
              {addPersonnelTab === 'NEW' ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi lời mời kích hoạt</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Xác nhận điều chuyển</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
