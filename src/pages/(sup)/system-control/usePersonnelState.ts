import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'
import { personnelService, getRoleLabel, invitationInput } from '../../../api/services/personnelService'
import { projectService } from '../../../api/services/projectService'
import { accountRow, PersonnelUiError, reviseRejectedPersonnelStatus, pendingPersonnelStatus, savePersonnelStatus, acceptPhoneVersion, pendingPersonnelPhone, personnelBlocks, personnelMessage, personnelRole, personnelSnapshot, readPersonnelProjects, reviseRejectedPhone, savePersonnelPhone, type PersonnelNoticeKind } from '../../../api/services/personnelScreen'
import { useAuthStore } from '../../../store/authStore'

export function usePersonnelState(triggerNotice: (msg: string, kind?: PersonnelNoticeKind) => void) {
  const { user, authEpoch } = useAuthStore()
  const triggerNoticeRef = useRef(triggerNotice)
  useEffect(() => {
    triggerNoticeRef.current = triggerNotice
  }, [triggerNotice])

  const [usersList, setUsersList] = useState<SystemUserAccount[]>([])
  const [projectsList, setProjectsList] = useState<
    Array<{ id: string; name: string; code?: string; pm_user_id?: string; pm_name?: string }>
  >([])
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof personnelSnapshot>> | null>(null)
  const [freshSnapshot, setFreshSnapshot] = useState<Awaited<ReturnType<typeof personnelSnapshot>> | null>(null)
  const [detailLoading, setDetailLoading] = useState(false), [detailError, setDetailError] = useState('')
  const [commandBusy, setCommandBusy] = useState(false), [phonePending, setPhonePending] = useState<ReturnType<typeof pendingPersonnelPhone>>(null)
  const [historyLoading, setHistoryLoading] = useState(false), [historyLoaded, setHistoryLoaded] = useState(false)
  const [history, setHistory] = useState<SystemUserAccount['project_memberships']>([]), [historyError, setHistoryError] = useState('')
  const detailAttempt = useRef(0), historyAttempt = useRef(0), commandRunning = useRef(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userSearchTerm, setUserSearchTerm] = useState<string>('')

  // Modal Đình chỉ
  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false)
  const [userToSuspend, setUserToSuspend] = useState<SystemUserAccount | null>(null)
  const [suspendReason, setSuspendReason] = useState<string>('')

  const [statusAction, setStatusAction] = useState<'ACTIVE' | 'SUSPENDED'>('SUSPENDED')
  const [statusSnapshot, setStatusSnapshot] = useState<Awaited<ReturnType<typeof personnelSnapshot>> | null>(null)
  const [statusLoading, setStatusLoading] = useState(false), [statusBusy, setStatusBusy] = useState(false), [statusError, setStatusError] = useState('')
  const [statusPending, setStatusPending] = useState<ReturnType<typeof pendingPersonnelStatus>>(null)
  const statusAttempt = useRef(0), statusRunning = useRef(false)
  useEffect(() => { setShowSuspendModal(false); setUserToSuspend(null); setStatusSnapshot(null); setStatusPending(null); setStatusError(''); setStatusBusy(false); setSuspendReason(''); return () => { statusAttempt.current++; statusRunning.current = false } }, [authEpoch, user?.id])

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
  const invitationRunning = useRef(false)
  const [invitationBusy, setInvitationBusy] = useState(false)
  useEffect(() => {
    const allowed = [RoleCode.PROJECT_MANAGER, RoleCode.DRONE_OPERATOR, RoleCode.REPAIR_CREW].includes(newPersonnelRole)
    setNewPersonnelProjectIds(ids => ids.filter(id => allowed && projectsList.some(p => p.id === id) && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)))
  }, [newPersonnelRole, projectsList])
  const [assignExistingUserId, setAssignExistingUserId] = useState<string>('')
  const [assignExistingProjectIds, setAssignExistingProjectIds] = useState<string[]>([])
  const [assignEffectiveFrom, setAssignEffectiveFrom] = useState<string>(new Date().toISOString().split('T')[0])
  const [assignReason, setAssignReason] = useState<string>('Điều chuyển nhân sự theo quyết định của Ban điều hành')

  // Directory accounts and effective project memberships are independent read models.
  const loadSequence = useRef(0), projectSequence = useRef(0)
  const groups = useRef<{ staff: SystemUserAccount[]; reporter: SystemUserAccount[] }>({ staff: [], reporter: [] })
  const loadProjects = useCallback(async () => {
    const attempt = ++projectSequence.current, epoch = authEpoch
    try {
      const projects = await readPersonnelProjects()
      if (attempt !== projectSequence.current || useAuthStore.getState().authEpoch !== epoch) return null
      setProjectsList(projects); setProjectsError(null); return projects
    } catch (error) {
      if (attempt === projectSequence.current && useAuthStore.getState().authEpoch === epoch) setProjectsError(`Chưa tải đầy đủ danh sách dự án. ${personnelMessage(error)}`)
      return null
    }
  }, [authEpoch])
  const loadUsers = useCallback(async () => {
    const request = ++loadSequence.current, epoch = authEpoch
    const current = () => request === loadSequence.current && useAuthStore.getState().authEpoch === epoch
    setIsLoading(true); setError(null)
    const errors: string[] = []
    try {
      if (user?.role === RoleCode.SUPERVISOR) {
        const loadGroup = async (group: 'staff' | 'reporter') => {
          try {
            const rows = await personnelService.fetchStaffDirectory(group === 'reporter' ? { role: 'REPORTER' } : {})
            if (!current()) return
            groups.current[group] = rows.map(accountRow)
          } catch (error) { if (current()) errors.push(`${group === 'staff' ? 'Nhân sự' : 'Người phản ánh'}: ${personnelMessage(error)}`) }
          if (current()) {
            setUsersList([...new Map([...groups.current.staff, ...groups.current.reporter].map(row => [row.id, row])).values()])
            setError(errors.length ? errors.join(' ') : null)
          }
        }
        await Promise.all([loadGroup('staff'), loadGroup('reporter')])
        if (!current()) return
      }
      const projects = await loadProjects()
      if (!current()) return false
      const memberships: NonNullable<SystemUserAccount['project_memberships']> = []
      if (projects) {
        const results = await Promise.allSettled(projects.map(async project => {
          const result = await projectService.fetchProjectMembers(project.id)
          return result.map((member: any) => { if (!member.userId || !member.membershipId) throw Error(); return { userId: member.userId, displayName: member.displayName, projectId: project.id, projectName: project.name, membershipId: member.membershipId, role: member.role, status: member.status, isPrimary: member.isPrimary, validFrom: member.validFrom, validTo: member.validTo } })
        }))
        if (!current()) return false
        results.forEach((result, index) => { if (result.status === 'fulfilled') memberships.push(...result.value); else errors.push(`Chưa tải thành viên dự án ${projects[index].name}.`) })
      } else errors.push('Phạm vi dự án chưa tải đầy đủ; chưa kết luận phân công.')
      let accounts: SystemUserAccount[]
      if (user?.role === RoleCode.SUPERVISOR) accounts = [...new Map([...groups.current.staff, ...groups.current.reporter].map(account => [account.id, account])).values()]
      else {
        const byUser = new Map<string, SystemUserAccount>()
        for (const member of memberships as Array<(typeof memberships)[number] & { userId: string }>) {
          if (!byUser.has(member.userId)) {
            const role = personnelRole(member.role)
            byUser.set(member.userId, { id: member.userId, full_name: (member as any).displayName || 'Chưa có thông tin', email: '', phone: '', role, role_label: getRoleLabel(role), status: 'UNKNOWN', project_scope: '', assigned_project_ids: [], device_info: '', ip_address: '', last_active: '' })
          }
        }
        // The member read includes displayName; it never supplies account status/contact.
        accounts = [...byUser.values()]
      }
      const mapped = accounts.map(account => {
        const memberRows = memberships.filter((m: any) => m.userId === account.id)
        return { ...account, project_memberships: memberRows, assigned_project_ids: [...new Set(memberRows.map(m => m.projectId))], project_scope: memberRows.length ? [...new Set(memberRows.map(m => m.projectName))].join(', ') : errors.length ? 'Chưa tải đầy đủ phân công' : 'Không có membership hiệu lực trong phạm vi đã đọc' }
      })
      if (current()) { setUsersList(mapped); setError(errors.length ? errors.join(' ') : null) }
      return errors.length === 0
    } catch (error) { if (current()) setError(personnelMessage(error)); return false }
    finally { if (current()) setIsLoading(false) }
  }, [user?.id, user?.role, authEpoch, loadProjects])
  useEffect(() => {
    groups.current = { staff: [], reporter: [] }; setUserRoleFilter('all'); setUserSearchTerm(''); setUsersList([]); setProjectsList([]); setProjectsError(null)
    setSelectedUserDetail(null); setUserToEdit(null); setShowSuspendModal(false); setShowAddPersonnelModal(false); setShowResetPasswordModal(false)
    setSnapshot(null); setFreshSnapshot(null); setPhonePending(null); setDetailLoading(false); setDetailError(''); setHistory([]); setHistoryError(''); setHistoryLoading(false); setHistoryLoaded(false); setCommandBusy(false); commandRunning.current = false
    void loadUsers()
    return () => { loadSequence.current++; projectSequence.current++; detailAttempt.current++; historyAttempt.current++ }
  }, [loadUsers])

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

  const blocked = (message: string) => triggerNoticeRef.current(message, 'error')
  const openStatus = async (account: SystemUserAccount | null, action: 'ACTIVE' | 'SUSPENDED') => {
    const attempt = ++statusAttempt.current, epoch = authEpoch
    setUserToSuspend(account); setStatusAction(action); setSuspendReason(''); setStatusSnapshot(null); setStatusError(''); setStatusPending(null); setStatusBusy(false); statusRunning.current = false
    if (!account || user?.role !== RoleCode.SUPERVISOR) { setShowSuspendModal(false); return }
    setShowSuspendModal(true); setStatusLoading(true)
    const current = () => statusAttempt.current === attempt && useAuthStore.getState().authEpoch === epoch && useAuthStore.getState().user?.id === user?.id
    try {
      const held = pendingPersonnelStatus()
      if (held && (held.userId !== account.id || held.payload.status !== action)) throw new PersonnelUiError('Có yêu cầu trạng thái tài khoản khác đang chờ; cần đối chiếu trước.')
      if (held) { setSuspendReason(held.payload.reason); setStatusPending(held) }
      const value = await personnelSnapshot(account.id)
      if (!current()) return
      setStatusSnapshot(value); setUserToSuspend({ ...account, ...value.account })
    } catch (error) { if (current()) setStatusError(personnelMessage(error)) }
    finally { if (current()) setStatusLoading(false) }
  }
  const closeStatus = (open: boolean) => { if (open) return; statusAttempt.current++; setShowSuspendModal(false); setStatusLoading(false); setStatusBusy(false); statusRunning.current = false }
  const handleConfirmSuspend = async () => {
    if (statusRunning.current || !userToSuspend || user?.role !== RoleCode.SUPERVISOR) return
    if (statusPending?.rejected) {
      try { reviseRejectedPersonnelStatus(); setStatusPending(null); setStatusError('Yêu cầu cũ bị từ chối. Giữ lý do để sửa; chưa gửi lệnh mới.') }
      catch (error) { setStatusError(personnelMessage(error)) }
      return
    }
    if (!suspendReason.trim() || !statusSnapshot && !statusPending) { setStatusError('Cần đọc snapshot tài khoản và nhập lý do không để trống.'); return }
    const attempt = statusAttempt.current, epoch = authEpoch, target = userToSuspend.id
    const current = () => attempt === statusAttempt.current && useAuthStore.getState().authEpoch === epoch && useAuthStore.getState().user?.id === user?.id
    statusRunning.current = true; setStatusBusy(true); setStatusError('')
    try {
      const value = await savePersonnelStatus(target, statusAction, suspendReason, statusSnapshot, !!statusPending)
      if (!current()) return
      setUsersList(rows => rows.map(row => row.id === target ? { ...row, ...value.account, project_memberships: row.project_memberships, assigned_project_ids: row.assigned_project_ids, project_scope: row.project_scope } : row))
      setStatusPending(null); setShowSuspendModal(false)
      triggerNoticeRef.current(statusAction === 'SUSPENDED' ? 'Đã đình chỉ và đọc lại trạng thái tài khoản.' : 'Đã khôi phục và đọc lại trạng thái tài khoản.', 'success')
    } catch (error) {
      if (!current()) return
      let held: ReturnType<typeof pendingPersonnelStatus> = null
      try { held = pendingPersonnelStatus(); setStatusPending(held) } catch { /* Surface original command error. */ }
      const text = held && !held.receipt && !(error as any)?.response && !(error instanceof PersonnelUiError) ? 'Chưa rõ kết quả trạng thái trên máy chủ. Giữ nguyên yêu cầu; chỉ thử lại đúng key/payload.' : personnelMessage(error)
      setStatusError(text); triggerNoticeRef.current(text, 'error')
    } finally { if (current()) { statusRunning.current = false; setStatusBusy(false) } }
  }
  const handleRestoreUser = async (userId: string) => { const account = usersList.find(row => row.id === userId); if (account) await openStatus(account, 'ACTIVE'); else blocked('Chưa có tài khoản để đọc snapshot khôi phục.') }
  const handleOpenEdit = async (account: SystemUserAccount) => {
    if (commandRunning.current) return
    if (user?.role !== RoleCode.SUPERVISOR) return blocked('Chỉ Giám sát được xem hồ sơ chỉnh sửa tài khoản.')
    const request = ++detailAttempt.current, epoch = authEpoch
    setUserToEdit(account); setSnapshot(null); setPhonePending(null); setFreshSnapshot(null); setDetailError(''); setDetailLoading(true)
    setEditFullName(account.full_name); setEditEmail(account.email); setEditPhone(account.phone || ''); setEditRole(account.role)
    setEditSelectedProjectIds(account.assigned_project_ids || []); setEditProjectScope(account.project_scope)
    setEditStatus(account.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE')
    try {
      const result = await personnelSnapshot(account.id)
      if (request !== detailAttempt.current || useAuthStore.getState().authEpoch !== epoch) return
      setSnapshot(result); setUserToEdit({ ...account, ...result.account, project_memberships: account.project_memberships, assigned_project_ids: account.assigned_project_ids, project_scope: account.project_scope })
      setEditFullName(result.account.full_name); setEditEmail(result.account.email); setEditPhone(result.account.phone || ''); setEditRole(result.account.role); setEditStatus(result.account.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE')
      const held = pendingPersonnelPhone(); setPhonePending(held)
      if (held?.userId === account.id) setEditPhone(held.phone)
    } catch (error) { if (request === detailAttempt.current && useAuthStore.getState().authEpoch === epoch) setDetailError(personnelMessage(error)) }
    finally { if (request === detailAttempt.current && useAuthStore.getState().authEpoch === epoch) setDetailLoading(false) }
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
    if (!projectsList.some(p => p.id === projectId) || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(projectId)) return
    setNewPersonnelProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    )
  }

  const selectAllNewPersonnelProjects = () => {
    setNewPersonnelProjectIds(projectsList.filter(p => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(p.id)).map((p) => p.id))
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

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!userToEdit || !snapshot || detailLoading || commandRunning.current) return
    const epoch = authEpoch, target = userToEdit.id, request = detailAttempt.current
    const current = () => useAuthStore.getState().authEpoch === epoch && request === detailAttempt.current
    if (user?.role !== RoleCode.SUPERVISOR) return blocked('Chỉ Giám sát được sửa số điện thoại nhân sự.')
    if (snapshot.account.status !== 'ACTIVE' || ![RoleCode.PROJECT_MANAGER, RoleCode.DRONE_OPERATOR, RoleCode.REPAIR_CREW].includes(snapshot.account.role)) return blocked('Chỉ sửa số điện thoại cho PM, Operator hoặc Crew đang hoạt động.')
    if (editRole !== snapshot.account.role || editStatus !== 'ACTIVE') return blocked(personnelBlocks.account)
    const phone = editPhone.trim().replace(/[\s.-]/g, '')
    if (!/^\+?[0-9]{7,15}$/.test(phone)) return blocked('Số điện thoại cần 7–15 chữ số, có thể có dấu + ở đầu.')
    if (!phonePending && phone === snapshot.account.phone) return triggerNoticeRef.current('Chưa có thay đổi số điện thoại để lưu.', 'info')
    commandRunning.current = true; setCommandBusy(true)
    try {
      await savePersonnelPhone(target, phone, phonePending?.etag || snapshot.etag, !!phonePending)
      if (!current()) return
      setPhonePending(null); setUserToEdit(null); commandRunning.current = false; setCommandBusy(false)
      const refreshed = await loadUsers()
      if (current()) triggerNoticeRef.current(refreshed ? 'Đã lưu và đọc lại số điện thoại. Không thay đổi các thông tin tài khoản khác.' : 'Đã lưu số điện thoại; danh sách chưa tải lại đầy đủ. Hãy thử tải lại.', refreshed ? 'success' : 'warning')
    } catch (error: any) {
      if (!current()) return
      const held = pendingPersonnelPhone()
      const message = held && !held.receipt && !held.conflict && !held.keyConflict && !held.rejected && (!error?.response || error.response.status >= 500)
        ? 'Chưa rõ kết quả trên máy chủ. Hãy đối chiếu hoặc gửi lại đúng yêu cầu số điện thoại đã giữ.' : personnelMessage(error)
      setPhonePending(held); setDetailError(message); triggerNoticeRef.current(message, 'error')
    } finally { if (current()) { commandRunning.current = false; setCommandBusy(false) } }
  }
  const readFreshPhone = async () => {
    if (!userToEdit || commandRunning.current) return
    const epoch = authEpoch, request = ++detailAttempt.current
    setFreshSnapshot(null)
    setDetailLoading(true)
    try { const fresh = await personnelSnapshot(userToEdit.id); if (epoch === useAuthStore.getState().authEpoch && request === detailAttempt.current) setFreshSnapshot(fresh) }
    catch (error) { if (epoch === useAuthStore.getState().authEpoch && request === detailAttempt.current) setDetailError(personnelMessage(error)) }
    finally { if (epoch === useAuthStore.getState().authEpoch && request === detailAttempt.current) setDetailLoading(false) }
  }
  const acceptFreshPhone = () => {
    if (!freshSnapshot) return
    acceptPhoneVersion(); setSnapshot(freshSnapshot); setEditRole(freshSnapshot.account.role); setEditStatus(freshSnapshot.account.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'); setEditFullName(freshSnapshot.account.full_name); setEditEmail(freshSnapshot.account.email); setUserToEdit(old => old ? { ...old, ...freshSnapshot.account, project_memberships: old.project_memberships, assigned_project_ids: old.assigned_project_ids, project_scope: old.project_scope } : null); setPhonePending(null); setFreshSnapshot(null); setDetailError('Đã giữ số mới và chọn phiên bản vừa đọc. Hãy kiểm tra rồi lưu lại.')
  }
  const handleAddPersonnelSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (addPersonnelTab !== 'NEW') return blocked(personnelBlocks.primary)
    if (invitationRunning.current) return
    if (user?.role !== RoleCode.SUPERVISOR) return blocked('Chỉ Giám sát được gửi lời mời nhân sự.')
    if (projectsError || isLoading) return blocked('Cần tải đầy đủ phạm vi dự án trước khi gửi lời mời.')
    if (newPersonnelProjectIds.some(id => !projectsList.some(p => p.id === id))) return blocked('Dự án đã chọn không còn trong phạm vi máy chủ.')
    let input
    try { input = invitationInput({ email: newPersonnelEmail, role: newPersonnelRole, projectIds: newPersonnelProjectIds }) }
    catch { return blocked('Email, vai trò hoặc dự án nhận lời mời chưa hợp lệ.') }
    const epoch = authEpoch
    invitationRunning.current = true; setInvitationBusy(true)
    try {
      const receipt = await personnelService.createInvitation({ email: input.email, role: newPersonnelRole, projectIds: input.projectIds })
      if (useAuthStore.getState().authEpoch !== epoch) return
      if (!receipt?.id || !receipt.version || !receipt.status || !Number.isFinite(Date.parse(receipt.expiresAt))) throw new Error('invalid_receipt')
      triggerNoticeRef.current('Máy chủ đã tiếp nhận lời mời nhân sự.', 'success')
      setShowAddPersonnelModal(false)
    } catch (error: any) {
      if (useAuthStore.getState().authEpoch === epoch) blocked(error?.response?.status === 401 && useAuthStore.getState().isAuthenticated
        ? 'Chưa gửi được lời mời bằng phiên Web.'
        : !error?.response || error.response.status >= 500
        ? 'Chưa rõ kết quả gửi lời mời. Giữ nguyên nội dung để thử lại.' : personnelMessage(error))
    } finally { invitationRunning.current = false; if (useAuthStore.getState().authEpoch === epoch) setInvitationBusy(false) }
  }
  const handleConfirmResetPassword = async (_userId: string, _password: string) => { blocked(personnelBlocks.reset); throw Error('web_cookie_unsupported') }
  const loadMembershipHistory = async () => {
    if (!selectedUserDetail || user?.role !== RoleCode.SUPERVISOR) return
    if (isLoading) { setHistoryError('Danh sách dự án chưa tải xong. Hãy thử lại sau.'); return }
    setHistoryLoading(true); setHistoryLoaded(false)
    const request = ++historyAttempt.current, epoch = authEpoch, target = selectedUserDetail.id
    const results = await Promise.allSettled(projectsList.map(async project => (await projectService.fetchProjectMembers(project.id, true)).filter(m => m.userId === target).map(m => ({ ...m, projectId: project.id, projectName: project.name }))))
    if (request !== historyAttempt.current || useAuthStore.getState().authEpoch !== epoch) return
    setHistoryLoading(false); setHistoryLoaded(true)
    setHistory(results.flatMap(r => r.status === 'fulfilled' ? r.value : [])); setHistoryError(results.some(r => r.status === 'rejected') || projectsError ? 'Lịch sử chưa tải đầy đủ. Hãy thử lại.' : '')
  }

  return {
    usersList,
    projectsList, projectsError, loadProjects, snapshotReady: !!snapshot, detailLoading, detailError, commandBusy, phonePending, freshSnapshot, readFreshPhone, acceptFreshPhone, history, historyError, historyLoading, historyLoaded, loadMembershipHistory, revisePhone: () => { reviseRejectedPhone(); setPhonePending(null) },
    closeEdit: () => { if (commandRunning.current) return; detailAttempt.current++; setUserToEdit(null) },
    openDetail: (account: SystemUserAccount | null) => { historyAttempt.current++; setHistory([]); setHistoryError(''); setHistoryLoading(false); setHistoryLoaded(false); setSelectedUserDetail(account) },
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
    setShowSuspendModal: closeStatus,
    statusAction, statusBusy, statusLoading, statusError, statusPending,
    statusBlockedReason: statusBusy ? 'Đang gửi/đọc lại yêu cầu.' : statusLoading ? 'Đang đọc snapshot tài khoản.' : statusPending?.conflict ? 'Xung đột phiên bản; giữ lý do để đối chiếu.' : !statusSnapshot && !statusPending ? 'Chưa đọc được snapshot tài khoản.' : '',
    userToSuspend,
    setUserToSuspend: (account: SystemUserAccount | null) => { void openStatus(account, 'SUSPENDED') },
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
    invitationBusy,
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
