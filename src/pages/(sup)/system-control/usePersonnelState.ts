import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'
import { personnelService, mapBackendRoleToRoleCode, getRoleLabel } from '../../../api/services/personnelService'
import { projectService } from '../../../api/services/projectService'
import { userDirectory } from '../../../api/services/userDirectory'
import { useAuthStore } from '../../../store/authStore'

export function usePersonnelState(triggerNotice: (msg: string) => void) {
  const { user } = useAuthStore()
  const triggerNoticeRef = useRef(triggerNotice)
  useEffect(() => {
    triggerNoticeRef.current = triggerNotice
  }, [triggerNotice])

  const [usersList, setUsersList] = useState<SystemUserAccount[]>([])
  const [projectsList, setProjectsList] = useState<
    Array<{ id: string; name: string; code?: string; pm_user_id?: string; pm_name?: string }>
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userSearchTerm, setUserSearchTerm] = useState<string>('')

  // Modal Đình chỉ
  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false)
  const [userToSuspend, setUserToSuspend] = useState<SystemUserAccount | null>(null)
  const [suspendReason, setSuspendReason] = useState<string>('Đình chỉ quyền truy cập tài khoản theo yêu cầu quản trị')

  // Modal Đặt lại mật khẩu (API-240 / CN10)
  const [userToResetPassword, setUserToResetPassword] = useState<SystemUserAccount | null>(null)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false)

  // Modal Chi tiết
  const [selectedUserDetail, setSelectedUserDetail] = useState<SystemUserAccount | null>(null)

  // Modal Sửa nhân sự
  const [userToEdit, setUserToEdit] = useState<SystemUserAccount | null>(null)
  const [editFullName, setEditFullName] = useState<string>('')
  const [editEmail, setEditEmail] = useState<string>('')
  const [editPhone, setEditPhone] = useState<string>('')
  const [editRole, setEditRole] = useState<RoleCode>(RoleCode.PROJECT_MANAGER)
  const [editProjectScope, setEditProjectScope] = useState<string>('')
  const [editSelectedProjectIds, setEditSelectedProjectIds] = useState<string[]>([])
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE')

  // Modal Thêm nhân sự / Gửi thư mời / Điều chuyển
  const [showAddPersonnelModal, setShowAddPersonnelModal] = useState<boolean>(false)
  const [addPersonnelTab, setAddPersonnelTab] = useState<'NEW' | 'ASSIGN'>('NEW')
  const [newPersonnelName, setNewPersonnelName] = useState<string>('')
  const [newPersonnelEmail, setNewPersonnelEmail] = useState<string>('')
  const [newPersonnelPhone, setNewPersonnelPhone] = useState<string>('')
  const [newPersonnelRole, setNewPersonnelRole] = useState<RoleCode>(RoleCode.PROJECT_MANAGER)
  const [newPersonnelProjectIds, setNewPersonnelProjectIds] = useState<string[]>([])
  const [assignExistingUserId, setAssignExistingUserId] = useState<string>('')
  const [assignExistingProjectIds, setAssignExistingProjectIds] = useState<string[]>([])
  const [assignEffectiveFrom, setAssignEffectiveFrom] = useState<string>(new Date().toISOString().split('T')[0])
  const [assignReason, setAssignReason] = useState<string>('Điều chuyển nhân sự theo quyết định của Ban điều hành')

  // Tải danh sách nhân sự từ Database thật (API-237 cho Supervisor, API-111 cho PM)
  const loadSequence = useRef(0)
  const loadUsers = useCallback(async () => {
    const request = ++loadSequence.current
    const actor = useAuthStore.getState().user
    const current = () => request === loadSequence.current && useAuthStore.getState().user === actor
    setIsLoading(true)
    setError(null)
    try {
      if (user?.role === RoleCode.SUPERVISOR) {
        // Supervisor: Xem toàn bộ nhân sự công ty và người phản ánh (API-237: GET /api/v1/users)
        const results = await Promise.allSettled([
          personnelService.fetchUsers(), personnelService.fetchUsers({ role: RoleCode.REPORTER })
        ])
        if (!current()) return
        const combined = new Map<string, SystemUserAccount>()
        results.forEach(result => {
          if (result.status === 'fulfilled') result.value.forEach(account => combined.set(account.id, account))
        })
        setUsersList(Array.from(combined.values()))
        const failures = results.flatMap((result, index) => result.status === 'rejected'
          ? [`${index === 0 ? 'Nhân sự' : 'Reporter'} chưa tải được: ${result.reason?.message || 'Lỗi API'}`] : [])
        if (failures.length) setError(`Danh bạ chưa đầy đủ. ${failures.join('; ')}. Bấm thử lại.`)
      } else {
        // PM: Lấy thành viên ban điều hành & tổ đội thi công của các dự án PM quản lý (API-111: GET /api/v1/projects/{projectId}/members)
        const myProjects = await projectService.fetchProjects()
        if (myProjects.length === 0) {
          setUsersList([])
        } else {
          const membersPromises = myProjects.map(async (prj) => {
            const members = await projectService.fetchProjectMembers(prj.id)
            return members.map((m: any) => {
              const matchedUser = userDirectory.findUser(m.userId, m.displayName)
              const email = matchedUser?.email || m.email || ''
              const phone = matchedUser?.phone || m.phone || ''
              const roleCode = mapBackendRoleToRoleCode(m.role || matchedUser?.role)
              const roleLabel = getRoleLabel(roleCode)

              return {
                id: m.userId || matchedUser?.id || m.membershipId || crypto.randomUUID(),
                full_name: m.displayName || matchedUser?.displayName || 'Nhân sự dự án',
                email: email || `${(m.displayName || 'nhansu').toLowerCase().replace(/[^a-z0-9]/g, '')}@hoanghai.vn`,
                role: roleCode,
                role_label: roleLabel,
                phone: phone || '—',
                status: (m.status === 'ACTIVE' || m.status === 1 ? 'ACTIVE' : 'SUSPENDED') as 'ACTIVE' | 'SUSPENDED',
                project_scope: `${prj.code ? `${prj.code} • ` : ''}${prj.name}`,
                assigned_project_ids: [prj.id],
                device_info: 'Ứng dụng Web / Mobile RoadGuard',
                ip_address: 'Hệ thống nội bộ',
                last_active: 'Vừa hoạt động',
                created_at: m.validFrom || new Date().toISOString()
              }
            })
          })
          const allMembersArrays = await Promise.all(membersPromises)
          const flatMembers = allMembersArrays.flat()

          // DEDUPLICATE theo user id để tránh trùng lặp key trong React Virtual DOM và gộp danh sách dự án
          const userMap = new Map<string, SystemUserAccount>()
          for (const member of flatMembers) {
            const existing = userMap.get(member.id)
            if (!existing) {
              userMap.set(member.id, { ...member })
            } else {
              const projectIds = new Set([
                ...(existing.assigned_project_ids || []),
                ...(member.assigned_project_ids || [])
              ])
              existing.assigned_project_ids = Array.from(projectIds)
              if (member.project_scope && !existing.project_scope?.includes(member.project_scope)) {
                existing.project_scope = `${existing.project_scope}, ${member.project_scope}`
              }
            }
          }
          if (current()) setUsersList(Array.from(userMap.values()))
        }
      }
    } catch (err: any) {
      if (!current()) return
      const errMsg = err?.response?.data?.detail || err?.message || 'Lỗi truy vấn danh sách nhân sự từ CSDL Backend'
      setError(errMsg)
      triggerNoticeRef.current(`❌ ${errMsg}`)
    } finally {
      if (current()) setIsLoading(false)
    }
  }, [user?.id, user?.role])

  // Tải danh mục dự án thật từ Database (API-134: GET /api/v1/projects)
  const loadProjects = useCallback(async () => {
    const actor = useAuthStore.getState().user
    try {
      const projects = await projectService.fetchProjects()
      const mapped = projects.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        pm_user_id: p.pm_user_id,
        pm_name: p.pm_name
      }))
      if (useAuthStore.getState().user === actor) setProjectsList(mapped)
    } catch (err: any) {
      console.warn('Không thể tải danh sách dự án cho dropdown nhân sự:', err)
    }
  }, [])

  useEffect(() => {
    loadUsers()
    loadProjects()
    return () => { loadSequence.current += 1 }
  }, [loadUsers, loadProjects])

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false
      if (userSearchTerm.trim() !== '') {
        const q = userSearchTerm.toLowerCase()
        const matchName = u.full_name.toLowerCase().includes(q)
        const matchEmail = u.email.toLowerCase().includes(q)
        const matchScope = u.project_scope.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchScope) return false
      }
      return true
    })
  }, [usersList, userRoleFilter, userSearchTerm])

  // Đình chỉ tài khoản thật trên CSDL Backend (API-239: PATCH /api/v1/users/{userId})
  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return
    try {
      await personnelService.updateUser(userToSuspend.id, {
        status: 'SUSPENDED',
        role: userToSuspend.role,
        reason: suspendReason || 'Đình chỉ tài khoản theo lệnh của Giám sát'
      })
      await loadUsers()
      setShowSuspendModal(false)
      setUserToSuspend(null)
      triggerNotice(`Đã đình chỉ tài khoản ${userToSuspend.full_name} trên CSDL Backend thành công!`)
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Lỗi khi đình chỉ tài khoản'
      triggerNotice(`❌ ${errMsg}`)
      throw err
    }
  }

  // Khôi phục tài khoản hoạt động trên CSDL Backend (API-239: PATCH /api/v1/users/{userId})
  const handleRestoreUser = async (userId: string) => {
    const targetUser = usersList.find((u) => u.id === userId)
    if (!targetUser) return
    try {
      await personnelService.updateUser(userId, {
        status: 'ACTIVE',
        role: targetUser.role,
        reason: 'Khôi phục trạng thái hoạt động cho tài khoản'
      })
      await loadUsers()
      triggerNotice(`Đã khôi phục trạng thái hoạt động cho tài khoản ${targetUser.full_name} trên CSDL Backend!`)
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Lỗi khi khôi phục tài khoản'
      triggerNotice(`❌ ${errMsg}`)
      throw err
    }
  }

  const handleOpenEdit = (u: SystemUserAccount) => {
    setUserToEdit(u)
    setEditFullName(u.full_name)
    setEditEmail(u.email)
    setEditPhone(u.phone || '')
    setEditRole(u.role)
    setEditProjectScope(u.project_scope)

    // Khởi tạo danh sách dự án đã được phân công
    if (u.assigned_project_ids && u.assigned_project_ids.length > 0) {
      setEditSelectedProjectIds(u.assigned_project_ids)
    } else {
      const matched = projectsList
        .filter((p) => u.project_scope?.includes(p.name) || (p.code && u.project_scope?.includes(p.code)))
        .map((p) => p.id)
      setEditSelectedProjectIds(matched)
    }

    setEditStatus(u.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE')
  }

  // Toggle dự án trong Edit Modal
  const toggleEditProject = (projectId: string) => {
    setEditSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    )
  }

  const selectAllEditProjects = () => {
    setEditSelectedProjectIds(projectsList.map((p) => p.id))
  }

  const clearAllEditProjects = () => {
    setEditSelectedProjectIds([])
  }

  // Toggle dự án trong Add/Invite Modal
  const toggleNewPersonnelProject = (projectId: string) => {
    setNewPersonnelProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    )
  }

  const selectAllNewPersonnelProjects = () => {
    setNewPersonnelProjectIds(projectsList.map((p) => p.id))
  }

  const clearAllNewPersonnelProjects = () => {
    setNewPersonnelProjectIds([])
  }

  // Toggle dự án trong Assign Modal
  const toggleAssignExistingProject = (projectId: string) => {
    setAssignExistingProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    )
  }

  const selectAllAssignExistingProjects = () => {
    setAssignExistingProjectIds(projectsList.map((p) => p.id))
  }

  const clearAllAssignExistingProjects = () => {
    setAssignExistingProjectIds([])
  }

  // Cập nhật thông tin / chức vụ nhân sự trên CSDL Backend (API-239: PATCH /api/v1/users/{userId} & PATCH /phone-number)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userToEdit) return
    try {
      // Đối với Người dân (REPORTER): Chỉ cập nhật trạng thái hoạt động (ACTIVE / SUSPENDED)
      if (userToEdit.role === RoleCode.REPORTER) {
        if (editStatus !== userToEdit.status) {
          await personnelService.updateUser(userToEdit.id, {
            status: editStatus,
            role: RoleCode.REPORTER,
            reason: `Giám sát cập nhật trạng thái tài khoản Người dân (${editStatus})`
          })
          await loadUsers()
          triggerNotice(`Đã cập nhật trạng thái tài khoản Người dân [${editFullName}] thành [${editStatus}] thành công!`)
        }
        setUserToEdit(null)
        return
      }

      let phoneUpdated = false
      const trimmedPhone = editPhone.trim()
      const sanitizedPhone = trimmedPhone.replace(/[\s.-]/g, '')
      const oldPhone = (userToEdit.phone || '').trim().replace(/[\s.-]/g, '')

      // Kiểm tra xem số điện thoại có thay đổi không
      if (sanitizedPhone !== oldPhone && sanitizedPhone.length > 0) {
        // Validate định dạng số điện thoại di động Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)
        const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
        if (!phoneRegex.test(sanitizedPhone)) {
          triggerNotice('❌ Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại chuẩn gồm 10 chữ số (VD: 0903111222, 0901234567)!')
          return
        }

        const isEligibleRole =
          userToEdit.role === RoleCode.PROJECT_MANAGER ||
          userToEdit.role === RoleCode.DRONE_OPERATOR ||
          userToEdit.role === RoleCode.REPAIR_CREW

        if (isEligibleRole && userToEdit.status === 'ACTIVE') {
          console.log(`📱 [SUPERVISOR] Cập nhật số điện thoại cho nhân sự ${userToEdit.id}: ${sanitizedPhone}`)
          await personnelService.updateUserPhoneNumber(userToEdit.id, sanitizedPhone)
          phoneUpdated = true
        }
      }

      // Cập nhật vai trò / trạng thái nếu có thay đổi
      const roleChanged = editRole !== userToEdit.role
      const statusChanged = editStatus !== userToEdit.status

      if (roleChanged || statusChanged || !phoneUpdated) {
        await personnelService.updateUser(userToEdit.id, {
          status: editStatus,
          role: editRole,
          reason: `Cập nhật thông tin tài khoản (Vai trò: ${editRole}, Trạng thái: ${editStatus})`
        })
      }

      await loadUsers()
      setUserToEdit(null)
      triggerNotice(
        phoneUpdated
          ? `Đã cập nhật số điện thoại [${sanitizedPhone}] và hồ sơ nhân sự [${editFullName}] vào CSDL Backend thành công!`
          : `Đã cập nhật thông tin nhân sự [${editFullName}] vào CSDL Backend thành công!`
      )
    } catch (err: any) {
      if (err?.response?.status === 412) {
        triggerNotice(`❌ Lỗi xung đột phiên bản (412 Concurrency Conflict): Dữ liệu nhân sự đã thay đổi, hệ thống đang tự làm mới...`)
        await loadUsers()
        return
      }
      if (err?.response?.data?.code === 'validation_error') {
        triggerNotice(`❌ Số điện thoại không đúng định dạng quy chuẩn của Backend (VD: 0903111222, 0901234567)!`)
        return
      }
      if (err?.response?.data?.code === 'identity_user_not_found') {
        triggerNotice(`❌ Backend chỉ cho phép cập nhật số điện thoại cho nhân sự vai trò PM, Operator, Crew!`)
        return
      }
      const data = err?.response?.data
      let errMsg = data?.detail || data?.title || err?.message || 'Lỗi khi cập nhật thông tin nhân sự'
      if (data?.errors && typeof data.errors === 'object') {
        const fieldErrors = Object.entries(data.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        errMsg = `${errMsg} (${fieldErrors})`
      }
      triggerNotice(`❌ ${errMsg}`)
      throw err
    }
  }

  // Gửi lời mời nhân sự mới hoặc điều chuyển dự án trên CSDL Backend
  const handleAddPersonnelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (addPersonnelTab === 'NEW') {
      if (!newPersonnelEmail) return
      try {
        await personnelService.createInvitation({
          email: newPersonnelEmail.trim().toLowerCase(),
          role: newPersonnelRole,
          projectIds: newPersonnelProjectIds
        })

        // Lưu thông tin phục vụ trang chấp nhận lời mời (setup-password)
        try {
          const emailKey = newPersonnelEmail.trim().toLowerCase()
          if (newPersonnelName) {
            localStorage.setItem('pending_invite_name', newPersonnelName)
            localStorage.setItem(`pending_invite_name_${emailKey}`, newPersonnelName)
          }
          const matched = projectsList.filter((p) => newPersonnelProjectIds.includes(p.id))
          if (matched.length > 0) {
            const projStr = matched.map((p) => p.name).join(', ')
            localStorage.setItem('pending_invite_project', projStr)
            localStorage.setItem(`pending_invite_project_${emailKey}`, projStr)
          }
        } catch {}

        await Promise.all([loadUsers(), loadProjects()])
        setShowAddPersonnelModal(false)
        setNewPersonnelName('')
        setNewPersonnelEmail('')
        setNewPersonnelPhone('')
        setNewPersonnelProjectIds([])
        triggerNotice(`Đã phát hành thư mời kích hoạt tài khoản qua Backend cho: [${newPersonnelEmail}]!`)
      } catch (err: any) {
        const errMsg = err?.response?.data?.detail || err?.message || 'Lỗi khi gửi lời mời nhân sự mới'
        triggerNotice(`❌ ${errMsg}`)
        throw err
      }
    } else {
      // Điều chuyển nhân sự hiện có
      if (!assignExistingUserId) return
      const targetUser = usersList.find((u) => u.id === assignExistingUserId)

      try {
        if (targetUser?.role === RoleCode.PROJECT_MANAGER) {
          if (!assignExistingProjectIds || assignExistingProjectIds.length === 0) {
            triggerNotice('❌ Nghiệp vụ BR-01: Dự án luôn phải có Chỉ huy trưởng phụ trách. Vui lòng chọn dự án cần tiếp quản để bàn giao!')
            return
          }
          // Nếu điều chuyển PM: gọi API-113 (Reassign Primary PM)
          const targetProjectId = assignExistingProjectIds[0]
          await personnelService.reassignPrimaryProjectManager(targetProjectId, {
            primaryProjectManagerUserId: targetUser.id,
            effectiveFrom: assignEffectiveFrom || new Date().toISOString().split('T')[0],
            reason: assignReason || `Bàn giao quyền Chỉ huy trưởng chính cho ${targetUser.full_name}`
          })
          triggerNotice(`Đã hoàn tất bàn giao Chỉ huy trưởng chính dự án cho PM [${targetUser.full_name}] (API-113)!`)
        } else if (
          targetUser?.role === RoleCode.DRONE_OPERATOR ||
          targetUser?.role === RoleCode.REPAIR_CREW
        ) {
          if (!assignExistingProjectIds || assignExistingProjectIds.length === 0) {
            triggerNotice('❌ Vui lòng chọn ít nhất 1 dự án để phân công nhân sự!')
            return
          }
          for (const prjId of assignExistingProjectIds) {
            await personnelService.addProjectMember(prjId, targetUser.id)
          }
          triggerNotice(`Đã phân công thành công nhân sự [${targetUser.full_name}] vào ${assignExistingProjectIds.length} dự án!`)
        } else {
          triggerNotice(`❌ Nhân sự vai trò [${targetUser?.role}] có thẩm quyền giám sát toàn diện hoặc không phân công theo dự án riêng lẻ.`)
          return
        }

        await Promise.all([loadUsers(), loadProjects()])
        setShowAddPersonnelModal(false)
        setAssignExistingUserId('')
        setAssignExistingProjectIds([])
      } catch (err: any) {
        const data = err?.response?.data
        let errMsg = data?.detail || data?.title || err?.message || 'Lỗi khi thực hiện điều chuyển nhân sự'
        if (data?.errors && typeof data.errors === 'object') {
          const fieldErrors = Object.entries(data.errors)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ')
          errMsg = `${errMsg} (${fieldErrors})`
        }
        console.error('❌ [API-113 ERROR DETAIL]:', data || err)
        triggerNotice(`❌ ${errMsg}`)
        throw err
      }
    }
  }

  // Đặt lại mật khẩu tạm qua API-240: POST /api/v1/users/{userId}/password-reset
  const handleConfirmResetPassword = async (userId: string, tempPassword: string) => {
    try {
      await personnelService.adminResetPassword(userId, tempPassword)
      triggerNotice(`Đã đặt lại mật khẩu tạm thành công cho nhân sự trên CSDL Backend!`)
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Lỗi khi đặt lại mật khẩu'
      triggerNotice(`❌ ${errMsg}`)
      throw err
    }
  }

  return {
    usersList,
    projectsList,
    isLoading,
    error,
    loadUsers,
    setUsersList,
    userRoleFilter,
    setUserRoleFilter,
    userSearchTerm,
    setUserSearchTerm,
    filteredUsers,
    showSuspendModal,
    setShowSuspendModal,
    userToSuspend,
    setUserToSuspend,
    suspendReason,
    setSuspendReason,
    userToResetPassword,
    setUserToResetPassword,
    showResetPasswordModal,
    setShowResetPasswordModal,
    handleConfirmResetPassword,
    selectedUserDetail,
    setSelectedUserDetail,
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
    showAddPersonnelModal,
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
    setAssignExistingProjectIds,
    assignEffectiveFrom,
    setAssignEffectiveFrom,
    assignReason,
    setAssignReason,
    toggleAssignExistingProject,
    selectAllAssignExistingProjects,
    clearAllAssignExistingProjects,
    handleConfirmSuspend,
    handleRestoreUser,
    handleOpenEdit,
    handleSaveEdit,
    handleAddPersonnelSubmit
  }
}
