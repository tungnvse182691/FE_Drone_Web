import { useState, useMemo } from 'react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'
import { mockSystemUserAccounts } from '../../../api/mock/data'

export function usePersonnelState(triggerNotice: (msg: string) => void) {
  const [usersList, setUsersList] = useState<SystemUserAccount[]>(mockSystemUserAccounts)
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userSearchTerm, setUserSearchTerm] = useState<string>('')

  // Modal Đình chỉ
  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false)
  const [userToSuspend, setUserToSuspend] = useState<SystemUserAccount | null>(null)
  const [handoffAssignee, setHandoffAssignee] = useState<string>('usr-01')

  // Modal Chi tiết
  const [selectedUserDetail, setSelectedUserDetail] = useState<SystemUserAccount | null>(null)

  // Modal Sửa
  const [userToEdit, setUserToEdit] = useState<SystemUserAccount | null>(null)
  const [editFullName, setEditFullName] = useState<string>('')
  const [editEmail, setEditEmail] = useState<string>('')
  const [editPhone, setEditPhone] = useState<string>('')
  const [editRole, setEditRole] = useState<RoleCode>(RoleCode.PROJECT_MANAGER)
  const [editProjectScope, setEditProjectScope] = useState<string>('')
  const [editCertificate, setEditCertificate] = useState<string>('')
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE')

  // Modal Thêm nhân sự
  const [showAddPersonnelModal, setShowAddPersonnelModal] = useState<boolean>(false)
  const [addPersonnelTab, setAddPersonnelTab] = useState<'NEW' | 'ASSIGN'>('NEW')
  const [newPersonnelName, setNewPersonnelName] = useState<string>('')
  const [newPersonnelEmail, setNewPersonnelEmail] = useState<string>('')
  const [newPersonnelPhone, setNewPersonnelPhone] = useState<string>('')
  const [newPersonnelRole, setNewPersonnelRole] = useState<RoleCode>(RoleCode.PROJECT_MANAGER)
  const [newPersonnelProject, setNewPersonnelProject] = useState<string>('')
  const [newPersonnelCert, setNewPersonnelCert] = useState<string>('')
  const [assignExistingUserId, setAssignExistingUserId] = useState<string>('usr-04')
  const [assignExistingProject, setAssignExistingProject] = useState<string>('QL1A - Giai đoạn 2 (Km 1024 - 1045)')

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

  const handleConfirmSuspend = () => {
    if (!userToSuspend) return
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userToSuspend.id
          ? {
              ...u,
              status: 'SUSPENDED',
              device_info: 'Thu hồi toàn bộ token & quyền truy cập',
              last_active: `Đình chỉ lúc: ${new Date().toLocaleDateString('vi-VN')}`
            }
          : u
      )
    )
    setShowSuspendModal(false)
    setUserToSuspend(null)
    triggerNotice(`Đã đình chỉ tài khoản ${userToSuspend.full_name} và bàn giao công việc thành công!`)
  }

  const handleRestoreUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'ACTIVE', device_info: 'Đã khôi phục phiên' } : u))
    )
    triggerNotice('Đã khôi phục trạng thái hoạt động cho tài khoản!')
  }

  const handleOpenEdit = (u: SystemUserAccount) => {
    setUserToEdit(u)
    setEditFullName(u.full_name)
    setEditEmail(u.email)
    setEditPhone(u.phone || '')
    setEditRole(u.role)
    setEditProjectScope(u.project_scope)
    setEditCertificate(u.certificate || '')
    setEditStatus(u.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE')
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userToEdit) return

    const updatedRoleLabel =
      editRole === RoleCode.PROJECT_MANAGER
        ? 'PROJECT MANAGER (CHỈ HUY TRƯỞNG)'
        : editRole === RoleCode.SUPERVISOR
        ? 'SUPERVISOR (GIÁM SÁT TRƯỞNG)'
        : editRole === RoleCode.DRONE_OPERATOR
        ? 'DRONE OPERATOR (PHI CÔNG KHẢO SÁT)'
        : 'CREW LEAD (ĐỘI TRƯỞNG THI CÔNG)'

    const updatedUser: SystemUserAccount = {
      ...userToEdit,
      full_name: editFullName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      role_label: updatedRoleLabel,
      project_scope: editProjectScope.trim() === '' ? 'Chưa phân công dự án' : editProjectScope,
      certificate: editCertificate,
      status: editStatus,
      device_info: editStatus === 'SUSPENDED' ? 'Thu hồi quyền truy cập' : userToEdit.device_info,
      ip_address: editStatus === 'SUSPENDED' ? 'Đình chỉ phiên' : userToEdit.ip_address
    }

    setUsersList((prev) => prev.map((u) => (u.id === userToEdit.id ? updatedUser : u)))
    if (selectedUserDetail?.id === userToEdit.id) {
      setSelectedUserDetail(updatedUser)
    }
    setUserToEdit(null)
    triggerNotice(`Đã cập nhật thông tin nhân sự [${editFullName}] thành công!`)
  }

  const handleAddPersonnelSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (addPersonnelTab === 'NEW') {
      if (!newPersonnelName || !newPersonnelEmail) return

      const roleLabel =
        newPersonnelRole === RoleCode.PROJECT_MANAGER
          ? 'PROJECT MANAGER (CHỈ HUY TRƯỞNG)'
          : newPersonnelRole === RoleCode.SUPERVISOR
          ? 'SUPERVISOR (GIÁM SÁT TRƯỞNG)'
          : newPersonnelRole === RoleCode.DRONE_OPERATOR
          ? 'DRONE OPERATOR (PHI CÔNG KHẢO SÁT)'
          : 'CREW LEAD (ĐỘI TRƯỞNG THI CÔNG)'

      const finalScope = newPersonnelProject.trim() === '' ? 'Chưa phân công dự án' : newPersonnelProject

      const newUser: SystemUserAccount = {
        id: `usr-${Date.now()}`,
        full_name: newPersonnelName,
        email: newPersonnelEmail,
        phone: newPersonnelPhone || '0988.xxx.xxx',
        role: newPersonnelRole,
        role_label: roleLabel,
        project_scope: finalScope,
        device_info: 'Thiết bị mới • Chờ đăng nhập lần đầu',
        ip_address: 'Chưa có phiên',
        status: 'ACTIVE',
        last_active: 'Vừa thêm mới',
        certificate: newPersonnelCert || 'Hồ sơ nhân sự lưu trữ nội bộ',
        joined_date: new Date().toLocaleDateString('vi-VN')
      }

      setUsersList([newUser, ...usersList])
      setShowAddPersonnelModal(false)
      setNewPersonnelName('')
      setNewPersonnelEmail('')
      setNewPersonnelPhone('')
      setNewPersonnelCert('')
      setNewPersonnelProject('')
      triggerNotice(
        newPersonnelProject.trim() === ''
          ? `Đã thêm nhân sự [${newPersonnelName}] (Để trống tuyến - Có thể phân công sau)!`
          : `Đã thêm nhân sự [${newPersonnelName}] vào dự án [${newPersonnelProject}]!`
      )
    } else {
      if (!assignExistingUserId) return
      const targetUser = usersList.find((u) => u.id === assignExistingUserId)
      if (!targetUser) return

      const updatedUser: SystemUserAccount = {
        ...targetUser,
        project_scope: assignExistingProject
      }

      setUsersList((prev) => prev.map((u) => (u.id === assignExistingUserId ? updatedUser : u)))
      if (selectedUserDetail?.id === assignExistingUserId) {
        setSelectedUserDetail(updatedUser)
      }
      setShowAddPersonnelModal(false)
      triggerNotice(`Đã điều chuyển nhân sự [${targetUser.full_name}] sang phụ trách [${assignExistingProject}]!`)
    }
  }

  return {
    usersList,
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
    handoffAssignee,
    setHandoffAssignee,
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
    editCertificate,
    setEditCertificate,
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
    newPersonnelProject,
    setNewPersonnelProject,
    newPersonnelCert,
    setNewPersonnelCert,
    assignExistingUserId,
    setAssignExistingUserId,
    assignExistingProject,
    setAssignExistingProject,
    handleConfirmSuspend,
    handleRestoreUser,
    handleOpenEdit,
    handleSaveEdit,
    handleAddPersonnelSubmit
  }
}
