import React, { useState, useMemo, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  mockSystemUserAccounts,
  mockAIModelRegistry,
  mockDefectSafetyCatalog,
  mockLegalHoldProjects,
  mockDataDeletionRequests
} from '../../api/mock/data'
import {
  SystemUserAccount,
  AIModelVersion,
  DefectCatalogItem,
  LegalHoldProject,
  DataDeletionRequest
} from '../../types/domain'
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Users,
  Cpu,
  BookmarkCheck,
  Archive,
  Search,
  Filter,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Clock,
  Layers,
  FileText,
  KeyRound,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Gavel,
  History,
  RotateCcw,
  Sliders,
  Send,
  Building2,
  Calendar,
  AlertOctagon,
  Flame,
  ArrowRight,
  Eye,
  Edit3,
  Phone,
  Mail,
  Award,
  Briefcase,
  MapPin,
  UserCheck,
  Plus
} from 'lucide-react'

export const SystemControl: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Active Tab: accounts | ai-models | defect-catalog | retention-legal-hold
  const [activeTab, setActiveTab] = useState<'accounts' | 'ai-models' | 'defect-catalog' | 'retention-legal-hold'>(
    'retention-legal-hold'
  )

  // Theo chuẩn v2.2 (FR-36, BR-02): Nếu là PM thì không được xem tab mô hình AI và danh mục khiếm khuyết
  useEffect(() => {
    if (!isSupervisor && (activeTab === 'ai-models' || activeTab === 'defect-catalog')) {
      setActiveTab('retention-legal-hold')
    }
  }, [isSupervisor, activeTab])

  // State Dữ liệu
  const [usersList, setUsersList] = useState<SystemUserAccount[]>(mockSystemUserAccounts)
  const [aiModels, setAiModels] = useState<AIModelVersion[]>(mockAIModelRegistry)
  const [defectCatalog, setDefectCatalog] = useState<DefectCatalogItem[]>(mockDefectSafetyCatalog)
  const [legalHoldProjects, setLegalHoldProjects] = useState<LegalHoldProject[]>(mockLegalHoldProjects)
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>(mockDataDeletionRequests)

  // Bộ lọc Tab Tài khoản
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userSearchTerm, setUserSearchTerm] = useState<string>('')

  // Modal States
  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false)
  const [userToSuspend, setUserToSuspend] = useState<SystemUserAccount | null>(null)
  const [handoffAssignee, setHandoffAssignee] = useState<string>('usr-01')

  // Modal Xem chi tiết nhân sự
  const [selectedUserDetail, setSelectedUserDetail] = useState<SystemUserAccount | null>(null)

  // Modal Chỉnh sửa thông tin nhân sự (Supervisor)
  const [userToEdit, setUserToEdit] = useState<SystemUserAccount | null>(null)
  const [editFullName, setEditFullName] = useState<string>('')
  const [editEmail, setEditEmail] = useState<string>('')
  const [editPhone, setEditPhone] = useState<string>('')
  const [editRole, setEditRole] = useState<RoleCode>(RoleCode.PROJECT_MANAGER)
  const [editProjectScope, setEditProjectScope] = useState<string>('')
  const [editCertificate, setEditCertificate] = useState<string>('')
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE')

  // Modal Thêm nhân sự vào dự án (Supervisor)
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

  const [showCreateDeletionRequestModal, setShowCreateDeletionRequestModal] = useState<boolean>(false)
  const [newDelProject, setNewDelProject] = useState<string>('proj-01')
  const [newDelDataType, setNewDelDataType] = useState<string>('Ảnh thô Drone (RAW)')
  const [newDelSize, setNewDelSize] = useState<number>(250)
  const [newDelJustification, setNewDelJustification] = useState<string>('')

  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null)

  // Thông báo tạm thời
  const triggerNotice = (msg: string) => {
    setActionSuccessNotice(msg)
    setTimeout(() => setActionSuccessNotice(null), 3000)
  }

  // Dự án có Legal Hold đang bật (ví dụ proj-02)
  const activeLegalHoldProject = useMemo(() => {
    return legalHoldProjects.find((p) => p.is_legal_hold)
  }, [legalHoldProjects])

  // Lọc danh sách người dùng
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

  // Thao tác: Bật / Tắt Legal Hold (Chỉ Supervisor được thao tác theo BR-45)
  const handleToggleLegalHold = (projectId: string) => {
    if (!isSupervisor) {
      alert('Chỉ tài khoản Giám sát / Chủ đầu tư (Supervisor) mới có thẩm quyền bật/tắt Legal Hold (BR-45).')
      return
    }

    setLegalHoldProjects((prev) =>
      prev.map((p) => {
        if (p.project_id === projectId) {
          const nextState = !p.is_legal_hold
          // Cập nhật luôn trạng thái chặn trong danh sách yêu cầu xóa
          setDeletionRequests((dPrev) =>
            dPrev.map((req) => {
              if (req.project_id === projectId) {
                return { ...req, blocked_by_legal_hold: nextState }
              }
              return req
            })
          )
          return {
            ...p,
            is_legal_hold: nextState,
            hold_since: nextState ? new Date().toLocaleString('vi-VN') : undefined,
            hold_reason: nextState
              ? 'Thanh tra đột xuất hồ sơ hoàn công và phân xử tranh chấp'
              : undefined,
            hold_authority: nextState ? 'Thanh tra Bộ GTVT' : undefined,
            hold_reference: nextState ? 'Công văn số 8492/BGTVT-TTr' : undefined
          }
        }
        return p
      })
    )

    triggerNotice('Đã cập nhật trạng thái Phong tỏa pháp lý (Legal Hold) cho dự án!')
  }

  // Thao tác: Phê duyệt xóa dữ liệu vĩnh viễn (Chỉ Supervisor được duyệt theo BR-45, UAT-10)
  const handleApprovePurge = (requestId: string) => {
    if (!isSupervisor) {
      alert('Chỉ Supervisor mới có quyền phê duyệt xóa dữ liệu lưu trữ hết hạn.')
      return
    }

    const req = deletionRequests.find((r) => r.id === requestId)
    if (!req) return

    // Kiểm tra điều kiện chặn BR-45
    if (req.blocked_by_legal_hold) {
      alert('LỖI LEGAL_HOLD_ACTIVE: Dự án đang có lệnh phong tỏa pháp lý thanh tra. Nghiêm cấm xóa dữ liệu!')
      return
    }

    if (!req.is_eligible_5years) {
      alert('LỖI RETENTION_NOT_EXPIRED: Dữ liệu chưa đủ thời hạn 5 năm sau bảo hành theo quy định BR-45.')
      return
    }

    setDeletionRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED_PURGED' } : r))
    )

    triggerNotice(`Đã phê duyệt xóa vĩnh viễn dữ liệu yêu cầu ${req.request_code} thành công!`)
  }

  // Thao tác: Từ chối yêu cầu xóa
  const handleRejectDeletion = (requestId: string) => {
    if (!isSupervisor) return
    const reason = prompt('Nhập lý do từ chối yêu cầu xóa dữ liệu:', 'Chưa đủ căn cứ pháp lý hết hạn')
    if (reason === null) return

    setDeletionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'REJECTED', rejection_reason: reason } : r
      )
    )
    triggerNotice('Đã từ chối yêu cầu xóa dữ liệu.')
  }

  // Thao tác: Đình chỉ tài khoản (UAT-09)
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

  // Thao tác: Khôi phục quyền tài khoản
  const handleRestoreUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'ACTIVE', device_info: 'Đã khôi phục phiên' } : u))
    )
    triggerNotice('Đã khôi phục trạng thái hoạt động cho tài khoản!')
  }

  // Thao tác: Mở modal Chỉnh sửa nhân sự (Supervisor)
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

  // Thao tác: Lưu thông tin chỉnh sửa nhân sự
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

  // Thao tác: Thêm hoặc Điều chuyển nhân sự vào dự án
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

  // Thao tác: PM Lập yêu cầu xóa dữ liệu (UAT-10, BR-45)
  const handleCreateDeletionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const proj = legalHoldProjects.find((p) => p.project_id === newDelProject)

    const isLegalHoldActive = proj?.is_legal_hold || false
    const isEligible5Y = (proj?.years_since_warranty_end || 0) >= 5

    const newReq: DataDeletionRequest = {
      id: `req-${Date.now()}`,
      request_code: `#REQ-DEL-2026-0${deletionRequests.length + 1}`,
      project_id: newDelProject,
      project_name: proj?.project_name || 'Dự án chỉ định',
      requested_by_id: user?.id || 'usr-pm',
      requested_by_name: user?.full_name || 'PM Đỗ Quốc Hoàng',
      requested_at: new Date().toLocaleString('vi-VN'),
      data_type: newDelDataType,
      data_description: `Yêu cầu xóa dữ liệu: ${newDelDataType} dung lượng ${newDelSize} GB`,
      data_size_gb: newDelSize,
      warranty_end_date: proj?.warranty_end_date || 'N/A',
      years_since_warranty: proj?.years_since_warranty_end || 0,
      is_eligible_5years: isEligible5Y,
      status: 'PENDING_APPROVAL',
      blocked_by_legal_hold: isLegalHoldActive,
      justification_notes: newDelJustification || 'Căn cứ thời hạn bảo hành dự án đã đủ thời gian lưu trữ.'
    }

    setDeletionRequests([newReq, ...deletionRequests])
    setShowCreateDeletionRequestModal(false)
    setNewDelJustification('')
    triggerNotice(`Đã gửi yêu cầu xóa dữ liệu ${newReq.request_code} tới Supervisor thẩm duyệt!`)
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1720px] mx-auto w-full pb-16 bg-[#F8F9FA]">
      {/* Thông báo thành công nổi lên */}
      {actionSuccessNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#151C27] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-[#E2E5E9]">
          <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* 1. TOP BREADCRUMB & HEADER SECTION */}
      <div className="flex flex-col gap-3 bg-white border border-[#E2E5E9] p-5 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs text-[#555F6F] font-medium">
            <span className="hover:text-[#151C27] transition-colors cursor-pointer">
              Trang chủ
            </span>
            <span className="text-[#CAC7B5]">/</span>
            <span className="hover:text-[#151C27] transition-colors cursor-pointer">Cấu hình</span>
            <span className="text-[#CAC7B5]">/</span>
            <span className="text-[#151C27] font-semibold">Quản trị hệ thống &amp; Lưu trữ pháp lý</span>
          </nav>

          <div className="flex items-center gap-2">
            {isSupervisor ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151C27] text-white font-mono text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                SUPERVISOR: TOÀN QUYỀN QUẢN TRỊ ADMIN (BR-02)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9E3F6] text-[#3D4756] font-mono text-xs font-bold shadow-sm border border-[#BAC7D9]">
                <Lock className="w-3.5 h-3.5" />
                PROJECT MANAGER: QUẢN TRỊ DỰ ÁN ĐƯỢC GIAO
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF6E9] border border-[#F3E6C4] text-[#8C6D15] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
              QUY CHUẨN BR-45 &amp; ISO 27001
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FBF6E9] text-[#8C6D15] font-mono text-xs font-bold border border-[#F3E6C4]">
                Mã màn hình: WF-12
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0F2F5] text-[#555F6F] font-mono text-xs font-medium border border-[#E2E5E9]">
                Căn cứ: FR-02, FR-35, FR-36, BR-45, UAT-09, UAT-10
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#151C27] tracking-tight">
              {isSupervisor
                ? 'Quản trị hệ thống, Kiểm soát AI & Phong tỏa pháp lý'
                : 'Lưu trữ bảo hành, Nhân sự dự án & Phong tỏa pháp lý'}
            </h1>
            <p className="text-sm text-[#555F6F] leading-relaxed">
              {isSupervisor
                ? 'Quản lý phân quyền tài khoản, thu hồi phiên làm việc tức thì và kích hoạt chế độ bảo lưu chứng cứ pháp lý (Legal Hold) theo quy định lưu trữ bảo hành công trình.'
                : 'Theo dõi tình trạng bảo lưu chứng cứ kỹ thuật, danh sách nhân sự phụ trách dự án và lập yêu cầu xóa dữ liệu hồ sơ đã hết hạn bảo hành (+5 năm).'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Nút Lập yêu cầu xóa dữ liệu (Dành cho PM và Supervisor) */}
            <button
              type="button"
              onClick={() => setShowCreateDeletionRequestModal(true)}
              className="px-4 py-2.5 rounded-lg border border-[#E2E5E9] bg-white hover:bg-[#F8F9FA] hover:border-[#C9A227] hover:text-[#C9A227] text-[#374151] font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
              <span>Lập yêu cầu xóa dữ liệu</span>
            </button>

            {/* Nút Thêm nhân sự vào dự án (Chỉ dành riêng cho Supervisor) */}
            {isSupervisor && (
              <button
                type="button"
                onClick={() => {
                  setAddPersonnelTab('NEW')
                  setShowAddPersonnelModal(true)
                }}
                className="px-4 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Thêm nhân sự vào dự án</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CẢNH BÁO LEGAL HOLD NỔI BẬT NẾU CÓ DỰ ÁN ĐANG BỊ PHONG TỎA (UAT-10, BR-45) */}
      {activeLegalHoldProject && (
        <div className="p-4 rounded-xl bg-[#FFDAD6] border border-[#FFCDD2] text-[#BA1A1A] flex flex-col md:flex-row items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#BA1A1A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Gavel className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-[#93000A]">
                LỆNH PHONG TỎA PHÁP LÝ (LEGAL HOLD = TRUE) ĐANG HIỆU LỰC
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#BA1A1A] font-mono text-[11px] font-bold border border-[#FFCDD2]">
                {activeLegalHoldProject.project_name}
              </span>
              <span className="font-mono text-xs text-[#93000A] font-semibold">
                {activeLegalHoldProject.hold_reference}
              </span>
            </div>
            <p className="text-xs text-[#93000A]/90 leading-relaxed">
              Dự án đang trong diện thanh tra phục vụ đối chiếu của <strong>{activeLegalHoldProject.hold_authority}</strong>. Theo quy tắc <strong>BR-45</strong>, toàn bộ quyền xóa dữ liệu đối với dự án này bị khóa cứng trên toàn hệ thống (mã lỗi <code className="bg-white/70 px-1 py-0.5 rounded font-bold">LEGAL_HOLD_ACTIVE</code>). Mọi hành vi tự ý tiêu hủy chứng cứ kỹ thuật đều bị nghiêm cấm.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('retention-legal-hold')}
            className="px-3.5 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold shrink-0 transition-colors shadow-sm self-center"
          >
            Xem chi tiết Legal Hold
          </button>
        </div>
      )}

      {/* 3. TABS NAVIGATION (CHỈ HIỂN THỊ CÁC TAB CẤP HỆ THỐNG CHO SUPERVISOR ADMIN; PM CHỈ THẤY LƯU TRỮ & NHÂN SỰ DỰ ÁN THEO V2.2) */}
      <div className="bg-white border border-[#E2E5E9] px-4 pt-2 rounded-xl shadow-sm flex items-center gap-2 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
            activeTab === 'accounts'
              ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
              : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'accounts' ? 'text-[#C9A227]' : ''}`} />
          <span>{isSupervisor ? 'Tài khoản & Phân quyền (FR-02)' : 'Nhân sự dự án (BR-02)'}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              activeTab === 'accounts'
                ? 'bg-[#FBF6E9] text-[#8C6D15] border-[#F3E6C4]'
                : 'bg-[#F0F2F5] text-[#555F6F] border-transparent'
            }`}
          >
            {usersList.length} thành viên
          </span>
        </button>

        {/* 2 TAB CẤU HÌNH ADMIN CẤP CÔNG TY: CHỈ DÀNH CHO SUPERVISOR (FR-36, QT03, QT04, QT06, QT07) */}
        {isSupervisor && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('ai-models')}
              className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
                activeTab === 'ai-models'
                  ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
                  : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
              }`}
            >
              <Cpu className={`w-4 h-4 ${activeTab === 'ai-models' ? 'text-[#C9A227]' : ''}`} />
              <span>Mô hình AI &amp; Đánh giá (FR-36)</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  activeTab === 'ai-models'
                    ? 'bg-[#FBF6E9] text-[#8C6D15] border-[#F3E6C4]'
                    : 'bg-[#F0F2F5] text-[#555F6F] border-transparent'
                }`}
              >
                v2.4.1 Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('defect-catalog')}
              className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
                activeTab === 'defect-catalog'
                  ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
                  : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
              }`}
            >
              <BookmarkCheck className={`w-4 h-4 ${activeTab === 'defect-catalog' ? 'text-[#C9A227]' : ''}`} />
              <span>Danh mục khiếm khuyết TCVN (FR-36)</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  activeTab === 'defect-catalog'
                    ? 'bg-[#FBF6E9] text-[#8C6D15] border-[#F3E6C4]'
                    : 'bg-[#F0F2F5] text-[#555F6F] border-transparent'
                }`}
              >
                {defectCatalog.length} quy tắc
              </span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('retention-legal-hold')}
          className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
            activeTab === 'retention-legal-hold'
              ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
              : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
          }`}
        >
          <Archive
            className={`w-4 h-4 ${
              activeLegalHoldProject ? 'text-[#BA1A1A]' : activeTab === 'retention-legal-hold' ? 'text-[#C9A227]' : ''
            }`}
          />
          <span>{isSupervisor ? 'Lưu trữ & Phong tỏa pháp lý (Legal Hold)' : 'Lưu trữ bảo hành & Hết hạn (QT11)'}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              activeLegalHoldProject
                ? 'bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFCDD2]'
                : 'bg-[#F0F2F5] text-[#555F6F]'
            }`}
          >
            {activeLegalHoldProject ? 'ĐANG BẬT' : 'BÌNH THƯỜNG'}
          </span>
        </button>
      </div>

      {/* 4. NỘI DUNG TỪNG TAB (BỌC TOÀN BỘ WIDTH TRÁNH CO RÚM) */}
      <div className="w-full">
        {/* TAB 4: LƯU TRỮ DỮ LIỆU & PHONG TỎA PHÁP LÝ (LEGAL HOLD - TRỌNG TÂM BR-45 & UAT-10) */}
        {activeTab === 'retention-legal-hold' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
            {/* Cột trái (5 cols): Cơ chế Đóng băng pháp lý (Legal Hold) */}
            <div className="lg:col-span-5 bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-[#BA1A1A]" />
                  <h2 className="text-sm font-bold text-[#151C27]">
                    Cơ chế Đóng băng pháp lý (Legal Hold)
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFDAD6] text-[#BA1A1A] font-mono text-[11px] font-bold border border-[#FFCDD2]">
                  Quy tắc BR-45
                </span>
              </div>

              <p className="text-xs text-[#555F6F] leading-relaxed">
                Thiết lập giữ hồ sơ tranh chấp thanh tra phục vụ các cơ quan quản lý nhà nước (Bộ GTVT, Cục ĐBVN). Khi kích hoạt, chức năng xóa đối với dự án này bị vô hiệu hóa hoàn toàn trên toàn bộ hệ thống.
              </p>

              {/* Danh sách các dự án và công tắc Legal Hold */}
              <div className="space-y-3">
                {legalHoldProjects.map((proj) => (
                  <div
                    key={proj.project_id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      proj.is_legal_hold
                        ? 'bg-[#FFDAD6]/30 border-[#FFCDD2]'
                        : 'bg-[#F8F9FA] border-[#E2E5E9]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#151C27]">{proj.project_name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white rounded border border-[#E2E5E9] text-[#555F6F]">
                            {proj.project_code}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#555F6F]">
                          Hạn bảo hành: <span className="font-semibold text-[#151C27]">{proj.warranty_end_date}</span>{' '}
                          {proj.is_warranty_expired ? (
                            <span className="text-[#059669] font-semibold">
                              (Hết hạn đã {proj.years_since_warranty_end.toFixed(1)} năm)
                            </span>
                          ) : (
                            <span className="text-[#3D4756] font-medium">(Đang trong bảo hành)</span>
                          )}
                        </div>
                      </div>

                      {/* Công tắc Bật/Tắt Legal Hold (CHỈ SUPERVISOR MỚI ĐƯỢC PHÉP THAO TÁC THEO BR-45) */}
                      <div className="flex flex-col items-end gap-1">
                        <label className={`relative inline-flex items-center ${isSupervisor ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input
                            type="checkbox"
                            disabled={!isSupervisor}
                            checked={proj.is_legal_hold}
                            onChange={() => handleToggleLegalHold(proj.project_id)}
                            className="sr-only peer"
                          />
                          <div
                            className={`w-10 h-5 bg-[#DCE2F3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                              !isSupervisor ? 'opacity-50' : ''
                            } peer-checked:bg-[#C9A227]`}
                          ></div>
                        </label>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            proj.is_legal_hold ? 'text-[#BA1A1A]' : 'text-[#7A7768]'
                          }`}
                        >
                          {proj.is_legal_hold ? 'HOLD BẬT' : 'HOLD TẮT'}
                        </span>
                        {!isSupervisor && (
                          <span className="text-[9px] text-[#7A7768] italic">
                            (Chỉ Giám sát mới có quyền)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chi tiết căn cứ thanh tra nếu Legal Hold đang bật */}
                    {proj.is_legal_hold && (
                      <div className="mt-2.5 pt-2 border-t border-[#FFCDD2] text-[11px] text-[#93000A] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#BA1A1A]">Cơ quan yêu cầu:</span>
                          <span className="font-semibold text-right">{proj.hold_authority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#BA1A1A]">Căn cứ văn bản:</span>
                          <span className="font-mono font-bold text-right">{proj.hold_reference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#BA1A1A]">Lý do thanh tra:</span>
                          <span className="italic text-right max-w-[240px] truncate" title={proj.hold_reason}>
                            {proj.hold_reason}
                          </span>
                        </div>
                        <div className="flex justify-between pt-0.5 text-[10px] text-[#BA1A1A]/80">
                          <span>Thời điểm niêm phong:</span>
                          <span className="font-mono">{proj.hold_since}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Ghi chú quy chuẩn BR-45 */}
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E9] text-[11px] text-[#555F6F] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#151C27]">
                  <Info className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Quy chuẩn thời hạn lưu trữ BR-45:</span>
                </div>
                <p className="leading-relaxed">
                  Hồ sơ dự án phải được lưu trữ tối thiểu đến hết thời hạn bảo hành cộng thêm <strong>5 năm</strong>. Lệnh xóa dữ liệu chỉ có hiệu lực khi do <strong>Supervisor phê duyệt</strong>; mọi hồ sơ có tranh chấp (Legal Hold) bị nghiêm cấm xóa vĩnh viễn.
                </p>
              </div>
            </div>

            {/* Cột phải (7 cols): Thẩm duyệt yêu cầu xóa dữ liệu (Deletion Requests) */}
            <div className="lg:col-span-7 bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E5E9]">
                <div>
                  <h2 className="text-sm font-bold text-[#151C27] flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
                    {isSupervisor
                      ? 'Thẩm duyệt yêu cầu xóa dữ liệu lưu trữ (FR-35, UAT-10)'
                      : 'Theo dõi yêu cầu xóa dữ liệu bảo hành (FR-35, BR-45)'}
                  </h2>
                  <p className="text-xs text-[#555F6F]">
                    {isSupervisor
                      ? 'Xử lý các đề xuất giải phóng dữ liệu hết hạn bảo hành từ PM theo quy tắc BR-45'
                      : 'Các yêu cầu giải phóng dữ liệu Drone và đo đạc đã trình lên Giám sát (Supervisor)'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FBF6E9] border border-[#F3E6C4] text-[#8C6D15] text-xs font-semibold self-start sm:self-auto">
                  {deletionRequests.filter((r) => r.status === 'PENDING_APPROVAL').length} yêu cầu chờ duyệt
                </span>
              </div>

              {/* Danh sách các yêu cầu xóa dữ liệu */}
              <div className="space-y-3">
                {deletionRequests.map((req) => {
                  const isBlockedByHold = req.blocked_by_legal_hold
                  const isRetentionNotExpired = !req.is_eligible_5years
                  const isPending = req.status === 'PENDING_APPROVAL'
                  const isPurged = req.status === 'APPROVED_PURGED'
                  const isRejected = req.status === 'REJECTED'

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                        isPurged
                          ? 'bg-[#F8F9FA]/60 border-[#E2E5E9] opacity-75'
                          : isBlockedByHold
                          ? 'bg-[#FFDAD6]/30 border-[#FFCDD2]'
                          : isRetentionNotExpired
                          ? 'bg-[#FBF6E9]/30 border-[#F3E6C4]'
                          : 'bg-white border-[#E2E5E9] shadow-sm'
                      }`}
                    >
                      {/* Header yêu cầu */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#151C27]">
                            {req.request_code}
                          </span>
                          {/* Huy hiệu trạng thái kiểm tra điều kiện */}
                          {isBlockedByHold ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFCDD2] flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              CHẶN BỞI LEGAL_HOLD_ACTIVE
                            </span>
                          ) : isRetentionNotExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFCDD2] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              CHƯA ĐỦ 5 NĂM (RETENTION_NOT_EXPIRED)
                            </span>
                          ) : isPurged ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0F2F5] text-[#555F6F]">
                              ĐÃ PHÊ DUYỆT XÓA VẬT LÝ
                            </span>
                          ) : isRejected ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFDAD6] text-[#BA1A1A]">
                              ĐÃ BÁC BỎ YÊU CẦU
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              ĐỦ ĐIỀU KIỆN 5 NĂM (ELIGIBLE)
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-[#555F6F]">
                          Người đề xuất: <strong>{req.requested_by_name}</strong> • {req.requested_at}
                        </span>
                      </div>

                      {/* Nội dung dữ liệu đề xuất xóa */}
                      <div className="text-xs text-[#151C27] leading-relaxed bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E2E5E9]">
                        <div>
                          <strong>Dự án:</strong> {req.project_name} (Hạn BH: {req.warranty_end_date})
                        </div>
                        <div>
                          <strong>Nội dung tệp:</strong> {req.data_description}
                        </div>
                        <div className="flex items-center gap-4 text-[#555F6F] mt-1">
                          <span>
                            Dung lượng: <strong className="text-[#151C27]">{req.data_size_gb} GB</strong>
                          </span>
                          <span>
                            Thời gian sau bảo hành:{' '}
                            <strong className="text-[#151C27]">
                              {req.years_since_warranty > 0 ? `${req.years_since_warranty.toFixed(1)} năm` : 'Đang bảo hành'}
                            </strong>
                          </span>
                        </div>
                        <div className="text-[#555F6F] italic mt-1">
                          "Căn cứ: {req.justification_notes}"
                        </div>
                      </div>

                      {/* Cảnh báo lý do từ chối nếu có */}
                      {req.rejection_reason && (
                        <div className="p-2 rounded-lg bg-[#FFDAD6] text-[#BA1A1A] text-[11px] flex items-center gap-1.5 font-medium border border-[#FFCDD2]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#BA1A1A]" />
                          <span>Lý do từ chối: {req.rejection_reason}</span>
                        </div>
                      )}

                      {/* Nút hành động: PHÂN ĐỊNH RÕ RỆT ROLE PM VS SUPERVISOR */}
                      {isPending && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#E2E5E9] text-xs">
                          <div className="text-[11px] text-[#555F6F]">
                            {isBlockedByHold ? (
                              <span className="text-[#BA1A1A] font-semibold flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Nút xóa bị khóa: Thanh tra đang niêm phong
                              </span>
                            ) : isRetentionNotExpired ? (
                              <span className="text-[#BA1A1A] font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Nút xóa bị khóa: Chưa hết bảo hành + 5 năm
                              </span>
                            ) : isSupervisor ? (
                              <span className="text-[#059669] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đủ điều kiện phê duyệt an toàn
                              </span>
                            ) : (
                              <span className="text-[#8C6D15] font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Đang chờ Supervisor thẩm duyệt
                              </span>
                            )}
                          </div>

                          {/* CHỈ HIỂN THỊ NÚT DUYỆT / BÁC BỎ CHO SUPERVISOR (PM KHÔNG CÓ NÚT NÀY - BR-02, BR-45) */}
                          {isSupervisor && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRejectDeletion(req.id)}
                                className="px-3 py-1.5 rounded-lg border border-[#E2E5E9] hover:bg-[#F8F9FA] text-[#374151] text-xs font-semibold transition-colors"
                              >
                                Bác bỏ
                              </button>

                              <button
                                type="button"
                                disabled={isBlockedByHold || isRetentionNotExpired}
                                onClick={() => handleApprovePurge(req.id)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                                  isBlockedByHold || isRetentionNotExpired
                                    ? 'bg-[#E2E5E9] text-[#7A7768] cursor-not-allowed border border-[#CAC7B5]'
                                    : 'bg-[#BA1A1A] hover:bg-[#93000A] text-white cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Phê duyệt xóa (Purge)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: TÀI KHOẢN & PHÂN QUYỀN (FR-02, BR-02, UAT-09) */}
        {activeTab === 'accounts' && (
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
                    // Nhận diện CHÍNH BẠN chuẩn xác 100% theo tài khoản đang đăng nhập trong AuthStore
                    const isCurrent = Boolean(
                      user?.email && u.email.toLowerCase() === user.email.toLowerCase()
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

                        {/* Hành động: PHÂN ĐỊNH RÕ RỆT THẨM QUYỀN RBAC */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Nút Xem chi tiết: Dành cho cả PM và Supervisor */}
                            <button
                              type="button"
                              onClick={() => setSelectedUserDetail(u)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#E2E5E9] bg-white hover:border-[#C9A227] hover:text-[#C9A227] text-[#151C27] font-semibold text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                              title="Xem chi tiết hồ sơ nhân sự, dự án và thiết bị"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Chi tiết</span>
                            </button>

                            {/* Quyền quản trị chỉ dành cho Supervisor */}
                            {isSupervisor && (
                              <>
                                {/* Nút Sửa nhân sự */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(u)}
                                  className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-[#8C6D15] font-semibold text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                  title="Chỉnh sửa thông tin nhân sự và dự án phụ trách"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
                                  <span>Sửa</span>
                                </button>

                                {/* Nút Đình chỉ / Khôi phục */}
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
        )}

      {/* TAB 2: MÔ HÌNH AI & ĐÁNH GIÁ (FR-36 - CHỈ DÀNH CHO SUPERVISOR ADMIN) */}
      {isSupervisor && activeTab === 'ai-models' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Cột trái: Mô hình đang chạy chính thức */}
          <div className="lg:col-span-6 bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C9A227] text-white flex items-center justify-center shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#151C27]">
                    Mô hình AI đang chạy (Road AI Engine)
                  </h3>
                  <p className="text-xs text-[#555F6F]">Phân loại &amp; đo lường vết nứt mặt đường theo thời gian thực</p>
                </div>
              </div>
              <span className="px-3 py-0.5 rounded-full text-white font-mono text-[11px] font-bold bg-[#C9A227]">
                LIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E5E9] space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm text-[#151C27]">Road-YOLOv9-Civil-Edge</span>
                  <span className="font-mono text-xs font-semibold text-[#555F6F] ml-2">
                    v2.4.1-prod
                  </span>
                </div>
                <span className="text-xs text-[#555F6F]">Triển khai: 10/08/2026</span>
              </div>

              {/* 3 Chỉ số kiểm định chất lượng AI */}
              <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                <div className="p-3 rounded-lg bg-white border border-[#E2E5E9] shadow-sm">
                  <span className="text-[11px] text-[#555F6F] block">Độ chính xác mAP@50</span>
                  <span className="text-xl font-bold text-[#C9A227] font-mono">92.4%</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#E2E5E9] shadow-sm">
                  <span className="text-[11px] text-[#555F6F] block">Độ nhạy Recall</span>
                  <span className="text-xl font-bold text-[#695587] font-mono">89.6%</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#E2E5E9] shadow-sm">
                  <span className="text-[11px] text-[#555F6F] block">F1-Score</span>
                  <span className="text-xl font-bold text-[#151C27] font-mono">0.91</span>
                </div>
              </div>

              {/* Công tắc Fast Track tự động */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E5E9]">
                <div className="space-y-0.5">
                  <span className="font-semibold text-xs text-[#151C27] block">
                    Tự động phân loại nhanh Fast-Track (&lt; 5cm)
                  </span>
                  <span className="text-[11px] text-[#555F6F] block">
                    Bỏ qua duyệt thủ công các vết nứt chân chim nhẹ theo FR-18
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-[#DCE2F3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A227]"></div>
                </label>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#555F6F] flex items-center justify-between">
              <span>Model weights SHA256: <code className="text-[#151C27]">8f3a9e...c701</code></span>
              <span className="text-[#059669] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kiểm định đạt chuẩn FR-36
              </span>
            </div>
          </div>

          {/* Cột phải: Lịch sử các phiên bản tiền nhiệm */}
          <div className="lg:col-span-6 bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#555F6F]" />
                <h3 className="text-sm font-bold text-[#151C27]">
                  Lịch sử phiên bản mô hình AI (Model Versioning)
                </h3>
              </div>
              <span className="text-xs text-[#555F6F] font-medium">Bảo tồn kết quả cũ (FR-36)</span>
            </div>

            <p className="text-xs text-[#555F6F] leading-relaxed">
              Theo quy định <strong>FR-36</strong>: Khi cập nhật mô hình mới, các phát hiện nứt lún cũ vẫn giữ nguyên vẹn phiên bản mô hình đã dùng tại thời điểm phân tích, tuyệt đối không tính toán ngược làm sai lệch hồ sơ hoàn công.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E9] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#151C27]">Road-YOLOv8-Baseline</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F0F2F5] text-[#555F6F]">
                      v1.2.0-legacy
                    </span>
                  </div>
                  <div className="text-[11px] text-[#555F6F] mt-1">
                    mAP@50: 84.1% • Triển khai: 15/01/2026 • Trọng số: 2e90f8...316d
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F0F2F5] text-[#555F6F] font-mono text-[10px] font-semibold">
                  DEPRECATED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DANH MỤC KHIẾM KHUYẾT TCVN (FR-36 - CHỈ DÀNH CHO SUPERVISOR ADMIN) */}
      {isSupervisor && activeTab === 'defect-catalog' && (
        <div className="bg-white border border-[#E2E5E9] rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
            <div>
              <h2 className="text-sm font-bold text-[#151C27]">
                Danh mục khiếm khuyết chuẩn TCVN (Safety Defect Catalog)
              </h2>
              <p className="text-xs text-[#555F6F]">
                Không cho phép xóa cứng để đảm bảo toàn vẹn dữ liệu lịch sử theo quy tắc Soft-Disable (FR-36)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#F0F2F5] text-[#555F6F] font-mono text-xs font-semibold">
              IMMUTABLE CODES
            </span>
          </div>

          <div className="space-y-2.5">
            {defectCatalog.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E9] hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.code === 'POTHOLE'
                        ? 'bg-[#BA1A1A]'
                        : item.code === 'ALLIGATOR_CRACK'
                        ? 'bg-[#C9A227]'
                        : item.code === 'RUTTING'
                        ? 'bg-[#695587]'
                        : 'bg-[#7A7768]'
                    }`}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#151C27]">{item.code}</span>
                      <span className="text-xs font-semibold text-[#151C27]">{item.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-[#E2E5E9] rounded text-[#555F6F] font-medium">
                        {item.standard_ref}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#555F6F] mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-[#C9A227]">Áp dụng</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isSupervisor}
                      defaultChecked={item.is_active}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#DCE2F3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A227]"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E9] text-[11px] text-[#555F6F] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>Hệ thống áp dụng cơ chế Soft-Disable; mã lỗi cũ vẫn được giữ nguyên vẹn trong hồ sơ hoàn công.</span>
          </div>
        </div>
      )}

      {/* Đóng wrapper w-full của toàn bộ 4 tabs (mở tại dòng 503) */}
      </div>

      {/* 5. MODAL: ĐÌNH CHỈ TÀI KHOẢN & BÀN GIAO CÔNG VIỆC (KỊCH BẢN UAT-09) */}
      {showSuspendModal && userToSuspend && (
        <div className="fixed inset-0 z-50 bg-[#151C27]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
              <div className="flex items-center gap-2 text-[#BA1A1A]">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#151C27]">
                  Đình chỉ tài khoản &amp; Bàn giao công việc (UAT-09)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="p-1 rounded-lg text-[#555F6F] hover:text-[#151C27] hover:bg-[#F8F9FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#555F6F] space-y-3">
              <p>
                Bạn đang chuẩn bị đình chỉ quyền truy cập của{' '}
                <strong className="text-[#151C27]">{userToSuspend.full_name}</strong> ({userToSuspend.email}).
              </p>

              <div className="p-3 bg-[#FFDAD6] border border-[#FFCDD2] rounded-xl text-[#BA1A1A] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Quy trình thu hồi token tức thì (UAT-09):
                </div>
                <p className="text-[11px] leading-relaxed">
                  Toàn bộ phiên làm việc (Web/Mobile) sẽ bị thu hồi ngay lập tức. Toàn bộ lịch sử thao tác của nhân sự này được bảo tồn nguyên vẹn trên Audit Trail (BR-45).
                </p>
              </div>

              {/* Bàn giao công việc dở dang */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#151C27] block">
                  Chọn nhân sự tiếp nhận bàn giao công việc dở dang:
                </label>
                <select
                  value={handoffAssignee}
                  onChange={(e) => setHandoffAssignee(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-semibold text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  <option value="usr-01">Kỹ sư Nguyễn Văn An (Supervisor / Ban Giám Sát)</option>
                  <option value="usr-04">PM Lê Tuấn (Chỉ huy trưởng QL1A-01)</option>
                  <option value="usr-03">PM Đỗ Quốc Hoàng (Chỉ huy trưởng QL1A-02)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5E9]">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-lg bg-[#F8F9FA] hover:bg-[#E2E5E9] text-[#374151] text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="px-4 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold shadow-sm transition-colors"
              >
                Xác nhận đình chỉ &amp; Bàn giao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: LẬP YÊU CẦU XÓA DỮ LIỆU LƯU TRỮ (UAT-10, BR-45 - DÀNH CHO PM VÀ SUPERVISOR) */}
      {showCreateDeletionRequestModal && (
        <div className="fixed inset-0 z-50 bg-[#151C27]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-md w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#BA1A1A]" />
                <h3 className="text-base font-bold text-[#151C27]">
                  Lập yêu cầu xóa dữ liệu hết hạn (BR-45)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateDeletionRequestModal(false)}
                className="p-1 rounded-lg text-[#555F6F] hover:text-[#151C27] hover:bg-[#F8F9FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeletionSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#151C27]">Dự án bảo hành:</label>
                <select
                  value={newDelProject}
                  onChange={(e) => setNewDelProject(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-medium text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  <option value="proj-04">Sửa chữa bảo trì Km 990 - 1000 (Hết BH năm 2020 - Đủ 5 năm)</option>
                  <option value="proj-02">QL1A - Giai đoạn 1 (Hết BH năm 2021 - Đang Legal Hold)</option>
                  <option value="proj-01">QL1A - Giai đoạn 2 (Hạn BH 31/12/2026 - Chưa hết hạn)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#151C27]">Loại tệp dữ liệu đề xuất xóa:</label>
                <select
                  value={newDelDataType}
                  onChange={(e) => setNewDelDataType(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-medium text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  <option value="Ảnh thô Drone (RAW Media)">Ảnh thô Drone phân giải cao (RAW)</option>
                  <option value="Video hành trình tuần đường">Video hành trình tuần đường xe cơ giới</option>
                  <option value="Dữ liệu cảm biến RTK">Dữ liệu thô cảm biến đo đạc RTK</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#151C27]">Dung lượng ước tính (GB):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newDelSize}
                  onChange={(e) => setNewDelSize(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs text-[#151C27] focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#151C27]">Căn cứ &amp; Giải trình hết hạn bảo hành (+5 năm):</label>
                <textarea
                  required
                  rows={3}
                  value={newDelJustification}
                  onChange={(e) => setNewDelJustification(e.target.value)}
                  placeholder="Ghi rõ thời điểm hết hạn bảo hành của công trình và tình trạng sao lưu..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs text-[#151C27] focus:outline-none focus:border-[#C9A227] resize-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E2E5E9] text-[11px] text-[#555F6F]">
                Lưu ý: Yêu cầu sẽ được chuyển đến Supervisor xem xét. Hệ thống sẽ tự động chặn nếu dự án đang có lệnh <strong>Legal Hold</strong> hoặc chưa đủ thời hạn <strong>5 năm sau bảo hành</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5E9]">
                <button
                  type="button"
                  onClick={() => setShowCreateDeletionRequestModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#F8F9FA] hover:bg-[#E2E5E9] text-[#374151] text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Gửi yêu cầu xóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: XEM CHI TIẾT NHÂN SỰ TRONG DỰ ÁN               */}
      {/* ======================================================== */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm shadow-md text-white border-2 border-white/20 ${
                    selectedUserDetail.status === 'SUSPENDED'
                      ? 'bg-slate-600'
                      : selectedUserDetail.role === RoleCode.SUPERVISOR
                      ? 'bg-[#C9A227]'
                      : selectedUserDetail.role === RoleCode.PROJECT_MANAGER
                      ? 'bg-blue-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {selectedUserDetail.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold leading-tight font-headline">
                      {selectedUserDetail.full_name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        selectedUserDetail.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : selectedUserDetail.status === 'SUSPENDED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {selectedUserDetail.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {selectedUserDetail.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Card 1: Công tác & Dự án phụ trách */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#C9A227]" />
                  <span>Nhiệm vụ &amp; Phạm vi dự án</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Vai trò phân quyền:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {selectedUserDetail.role_label}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Tuyến / Dự án phân công:</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                      {selectedUserDetail.project_scope}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 text-[11px] block">Chứng chỉ hành nghề &amp; Chuyên môn:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Award className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                      {selectedUserDetail.certificate || 'Hồ sơ lưu trữ nội bộ Hoàng Hải'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Ngày tiếp nhận công tác:</span>
                    <span className="font-mono text-slate-700">
                      {selectedUserDetail.joined_date || '15/01/2024'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Mã định danh nội bộ:</span>
                    <span className="font-mono text-slate-700">
                      {selectedUserDetail.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Liên hệ & Thiết bị */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C9A227]" />
                  <span>Thông tin liên hệ &amp; Thiết bị hiện trường</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Số điện thoại di động:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {selectedUserDetail.phone || '0988.667.234'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Email công vụ:</span>
                    <span className="font-mono text-slate-800">
                      {selectedUserDetail.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Thiết bị đăng nhập gần nhất:</span>
                    <span className="font-medium text-slate-800">
                      {selectedUserDetail.device_info}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Địa chỉ IP &amp; Lần cuối hoạt động:</span>
                    <span className="font-mono text-slate-700">
                      {selectedUserDetail.ip_address} • {selectedUserDetail.last_active}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Quyền hạn nghiệp vụ theo RBAC (v2.2) */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <h4 className="font-bold text-amber-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  <span>Ma trận quyền hạn nghiệp vụ (RBAC Spec v2.2)</span>
                </h4>
                <ul className="space-y-1.5 text-[11px] text-amber-900/90 list-disc list-inside">
                  {selectedUserDetail.role === RoleCode.SUPERVISOR ? (
                    <>
                      <li>Toàn quyền thẩm duyệt hồ sơ đợt sửa chữa &amp; dự toán chi phí (WF-12).</li>
                      <li>Quyền bật / tắt lệnh phong tỏa pháp lý (Legal Hold BR-45) khi có yêu cầu thanh tra.</li>
                      <li>Nghiệm thu chất lượng thi công hiện trường &amp; Ký số đóng đợt sửa chữa (WF-16/18).</li>
                      <li>Quản lý danh sách nhân sự, phân bổ dự án và phê duyệt hủy dữ liệu hết hạn bảo hành.</li>
                    </>
                  ) : selectedUserDetail.role === RoleCode.PROJECT_MANAGER ? (
                    <>
                      <li>Tạo và quản lý yêu cầu bay khảo sát Drone trên tuyến được giao (WF-05/06).</li>
                      <li>Thẩm định kết quả phát hiện hư hỏng tự động của AI (Bounding box &amp; Đa kỳ WF-08/09).</li>
                      <li>Gom đợt sửa chữa, lập bảng dự toán BOQ và trình duyệt hồ sơ lên Giám sát (WF-10/11).</li>
                      <li>Giao việc cho Đội thi công (Crew) và xác nhận hoàn thành công việc hiện trường (WF-14/17).</li>
                    </>
                  ) : selectedUserDetail.role === RoleCode.DRONE_OPERATOR ? (
                    <>
                      <li>Thực thi kế hoạch bay khảo sát không ảnh theo lịch trình được PM duyệt (WF-05).</li>
                      <li>Đồng bộ ảnh thô, dữ liệu trắc địa vệ tinh RTK và nhật ký tọa độ chuyến bay.</li>
                      <li>Báo cáo an toàn bay, thời tiết và hiện trạng thiết bị phần cứng UAV.</li>
                    </>
                  ) : (
                    <>
                      <li>Tiếp nhận lệnh sửa chữa (Work Order) ngoài hiện trường từ PM (WF-14).</li>
                      <li>Thực hiện vá dặm ổ gà, trám khe nứt và chụp ảnh đối chứng nghiệm thu trước/sau.</li>
                      <li>Đồng bộ biên bản thi công ngoại tuyến về máy chủ khi có mạng 4G/Wi-Fi.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                RoadGuard Security • Đã xác thực token phân quyền
              </span>
              <div className="flex items-center gap-2">
                {isSupervisor && (
                  <button
                    type="button"
                    onClick={() => {
                      const u = selectedUserDetail
                      setSelectedUserDetail(null)
                      handleOpenEdit(u)
                    }}
                    className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa nhân sự này</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedUserDetail(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CHỈNH SỬA NHÂN SỰ TRONG DỰ ÁN (SUPERVISOR)      */}
      {/* ======================================================== */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Chỉnh sửa nhân sự trong dự án
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cập nhật chức vụ, tuyến phụ trách và trạng thái tài khoản
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Họ và tên nhân sự: <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email công vụ: <span className="text-rose-600">*</span></label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Số điện thoại liên hệ:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0912.xxx.xxx"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Vai trò phân quyền: <span className="text-rose-600">*</span></label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as RoleCode)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    <option value={RoleCode.PROJECT_MANAGER}>PROJECT_MANAGER (Chỉ huy trưởng PM)</option>
                    <option value={RoleCode.SUPERVISOR}>SUPERVISOR (Giám sát / Chủ đầu tư)</option>
                    <option value={RoleCode.DRONE_OPERATOR}>DRONE_OPERATOR (Phi công UAV)</option>
                    <option value={RoleCode.REPAIR_CREW}>REPAIR_CREW (Đội thi công hiện trường)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tuyến / Dự án phân công phụ trách: <span className="text-slate-400 font-normal">(Tùy chọn)</span></label>
                <select
                  value={editProjectScope}
                  onChange={(e) => setEditProjectScope(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                >
                  <option value="">-- Để trống (Chưa phân công dự án) --</option>
                  <option value="Chưa phân công dự án">-- Chưa phân công dự án --</option>
                  <option value="QL1A - Giai đoạn 2 (Km 1024 - 1045)">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                  <option value="QL1A - Giai đoạn 1 (Km 990 - 1024)">QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
                  <option value="Cao tốc Bắc - Nam (Km 45 - 80)">Cao tốc Bắc - Nam (Km 45 - 80)</option>
                  <option value="Cao tốc Bắc Nam - Đoạn Diễn Châu">Cao tốc Bắc Nam - Đoạn Diễn Châu</option>
                  <option value="Cao tốc La Sơn - Túy Loan">Cao tốc La Sơn - Túy Loan</option>
                  <option value="Quốc lộ 14 - Đoạn Chơn Thành">Quốc lộ 14 - Đoạn Chơn Thành</option>
                  <option value="Toàn hệ thống dự án & Ban QLDA 7">Toàn hệ thống dự án &amp; Ban QLDA 7</option>
                  <option value="Cục Đường bộ Việt Nam">Cục Đường bộ Việt Nam</option>
                  <option value="Đội Bay Trắc Địa Không Ảnh 01">Đội Bay Trắc Địa Không Ảnh 01</option>
                  <option value="Tổ thi công Asphalt Hoàng Hải 01">Tổ thi công Asphalt Hoàng Hải 01</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Chứng chỉ hành nghề / Chuyên môn:</label>
                <input
                  type="text"
                  value={editCertificate}
                  onChange={(e) => setEditCertificate(e.target.value)}
                  placeholder="VD: CCHN Giám sát thi công Hạng I, Bằng phi công UAV..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Trạng thái làm việc:</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditStatus('ACTIVE')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      editStatus === 'ACTIVE'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đang hoạt động (ACTIVE)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('SUSPENDED')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      editStatus === 'SUSPENDED'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Đình chỉ phiên (SUSPENDED)</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu cập nhật nhân sự</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: THÊM & GÁN NHÂN SỰ VÀO DỰ ÁN (SUPERVISOR)       */}
      {/* ======================================================== */}
      {showAddPersonnelModal && (
        <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Quản trị nhân sự dự án
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thêm nhân sự mới hoặc phân công lại nhân sự vào tuyến đường bảo hành
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

            {/* Segmented Switch Tabs */}
            <div className="p-4 pb-0 bg-white">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddPersonnelTab('NEW')}
                  className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    addPersonnelTab === 'NEW'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>1. Thêm nhân sự mới</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddPersonnelTab('ASSIGN')}
                  className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    addPersonnelTab === 'ASSIGN'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>2. Điều chuyển nhân sự hiện có</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddPersonnelSubmit} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              {addPersonnelTab === 'NEW' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">
                        Họ và tên nhân sự: <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Kỹ sư Hoàng Nam"
                        value={newPersonnelName}
                        onChange={(e) => setNewPersonnelName(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">
                        Email công vụ: <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nam.hoang@hoanghai-infra.vn"
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
                        placeholder="0912.xxx.xxx"
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
                        <option value={RoleCode.SUPERVISOR}>SUPERVISOR (Giám sát / Chủ đầu tư)</option>
                        <option value={RoleCode.DRONE_OPERATOR}>DRONE_OPERATOR (Phi công UAV)</option>
                        <option value={RoleCode.REPAIR_CREW}>REPAIR_CREW (Đội thi công hiện trường)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">
                      Chỉ định tuyến / Dự án phụ trách: <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                    </label>
                    <select
                      value={newPersonnelProject}
                      onChange={(e) => setNewPersonnelProject(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                    >
                      <option value="">-- Để trống (Chưa phân công dự án - Có thể sửa sau) --</option>
                      <option value="QL1A - Giai đoạn 2 (Km 1024 - 1045)">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                      <option value="QL1A - Giai đoạn 1 (Km 990 - 1024)">QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
                      <option value="Cao tốc Bắc - Nam (Km 45 - 80)">Cao tốc Bắc - Nam (Km 45 - 80)</option>
                      <option value="Cao tốc Bắc Nam - Đoạn Diễn Châu">Cao tốc Bắc Nam - Đoạn Diễn Châu</option>
                      <option value="Cao tốc La Sơn - Túy Loan">Cao tốc La Sơn - Túy Loan</option>
                      <option value="Quốc lộ 14 - Đoạn Chơn Thành">Quốc lộ 14 - Đoạn Chơn Thành</option>
                    </select>
                    <p className="text-[10px] text-slate-500 italic">
                      * Có thể để trống nếu nhân sự mới chưa nhận dự án, Supervisor có thể bấm nút "Sửa" trong danh bạ để phân công dự án bất cứ lúc nào.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Chứng chỉ hành nghề / Chuyên môn:</label>
                    <input
                      type="text"
                      placeholder="VD: CCHN Chỉ huy trưởng Hạng I (Số: CHT-1234/BXD)"
                      value={newPersonnelCert}
                      onChange={(e) => setNewPersonnelCert(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed">
                    Tài khoản mới sẽ được cấp mật khẩu ban đầu và bắt buộc đổi mật khẩu khi đăng nhập lần đầu theo chính sách bảo mật RoadGuard (BR-02).
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">
                      Chọn nhân sự cần điều chuyển / phân công: <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={assignExistingUserId}
                      onChange={(e) => setAssignExistingUserId(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                    >
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email}) — Hiện tại: {u.project_scope}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">
                      Dự án điều chuyển sang phụ trách: <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={assignExistingProject}
                      onChange={(e) => setAssignExistingProject(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                    >
                      <option value="Chưa phân công dự án">-- Thu hồi dự án (Chờ phân công sau) --</option>
                      <option value="QL1A - Giai đoạn 2 (Km 1024 - 1045)">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                      <option value="QL1A - Giai đoạn 1 (Km 990 - 1024)">QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
                      <option value="Cao tốc Bắc - Nam (Km 45 - 80)">Cao tốc Bắc - Nam (Km 45 - 80)</option>
                      <option value="Cao tốc Bắc Nam - Đoạn Diễn Châu">Cao tốc Bắc Nam - Đoạn Diễn Châu</option>
                      <option value="Cao tốc La Sơn - Túy Loan">Cao tốc La Sơn - Túy Loan</option>
                      <option value="Quốc lộ 14 - Đoạn Chơn Thành">Quốc lộ 14 - Đoạn Chơn Thành</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
                    Sau khi điều chuyển, quyền hạn truy cập của nhân sự sẽ tự động chuyển sang phạm vi dự án mới, cập nhật danh bạ điều hành công trường.
                  </div>
                </>
              )}

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
                  className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {addPersonnelTab === 'NEW' ? 'Thêm nhân sự vào dự án' : 'Xác nhận điều chuyển'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemControl
