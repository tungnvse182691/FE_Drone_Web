import React, { useState, useMemo, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { AccountsTab } from './system-control/AccountsTab'
import { AIModelsTab } from './system-control/AIModelsTab'
import { DefectCatalogTab } from './system-control/DefectCatalogTab'
import { RetentionLegalHoldTab } from './system-control/RetentionLegalHoldTab'
import { SystemControlModals } from './system-control/SystemControlModals'
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
        {activeTab === 'retention-legal-hold' && (
          <RetentionLegalHoldTab
            legalHoldProjects={legalHoldProjects}
            deletionRequests={deletionRequests}
            isSupervisor={isSupervisor}
            handleToggleLegalHold={handleToggleLegalHold}
            handleRejectDeletion={handleRejectDeletion}
            handleApprovePurge={handleApprovePurge}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab
            isSupervisor={isSupervisor}
            currentUser={user}
            filteredUsers={filteredUsers}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            userRoleFilter={userRoleFilter}
            setUserRoleFilter={setUserRoleFilter}
            setAddPersonnelTab={setAddPersonnelTab}
            setShowAddPersonnelModal={setShowAddPersonnelModal}
            setSelectedUserDetail={setSelectedUserDetail}
            handleOpenEdit={handleOpenEdit}
            handleRestoreUser={handleRestoreUser}
            setUserToSuspend={setUserToSuspend}
            setShowSuspendModal={setShowSuspendModal}
          />
        )}

        {isSupervisor && activeTab === 'ai-models' && (
          <AIModelsTab />
        )}

        {isSupervisor && activeTab === 'defect-catalog' && (
          <DefectCatalogTab
            defectCatalog={defectCatalog}
            isSupervisor={isSupervisor}
          />
        )}
      </div>

      {/* 5. MODALS */}
      <SystemControlModals
        showSuspendModal={showSuspendModal}
        setShowSuspendModal={setShowSuspendModal}
        userToSuspend={userToSuspend}
        handoffAssignee={handoffAssignee}
        setHandoffAssignee={setHandoffAssignee}
        handleConfirmSuspend={handleConfirmSuspend}

        showCreateDeletionRequestModal={showCreateDeletionRequestModal}
        setShowCreateDeletionRequestModal={setShowCreateDeletionRequestModal}
        newDelProject={newDelProject}
        setNewDelProject={setNewDelProject}
        newDelDataType={newDelDataType}
        setNewDelDataType={setNewDelDataType}
        newDelSize={newDelSize}
        setNewDelSize={setNewDelSize}
        newDelJustification={newDelJustification}
        setNewDelJustification={setNewDelJustification}
        handleCreateDeletionSubmit={handleCreateDeletionSubmit}

        selectedUserDetail={selectedUserDetail}
        setSelectedUserDetail={setSelectedUserDetail}
        isSupervisor={isSupervisor}
        handleOpenEdit={handleOpenEdit}

        userToEdit={userToEdit}
        setUserToEdit={setUserToEdit}
        editFullName={editFullName}
        setEditFullName={setEditFullName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editRole={editRole}
        setEditRole={setEditRole}
        editProjectScope={editProjectScope}
        setEditProjectScope={setEditProjectScope}
        editCertificate={editCertificate}
        setEditCertificate={setEditCertificate}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        handleSaveEdit={handleSaveEdit}

        showAddPersonnelModal={showAddPersonnelModal}
        setShowAddPersonnelModal={setShowAddPersonnelModal}
        addPersonnelTab={addPersonnelTab}
        setAddPersonnelTab={setAddPersonnelTab}
        newPersonnelName={newPersonnelName}
        setNewPersonnelName={setNewPersonnelName}
        newPersonnelEmail={newPersonnelEmail}
        setNewPersonnelEmail={setNewPersonnelEmail}
        newPersonnelPhone={newPersonnelPhone}
        setNewPersonnelPhone={setNewPersonnelPhone}
        newPersonnelRole={newPersonnelRole}
        setNewPersonnelRole={setNewPersonnelRole}
        newPersonnelProject={newPersonnelProject}
        setNewPersonnelProject={setNewPersonnelProject}
        newPersonnelCert={newPersonnelCert}
        setNewPersonnelCert={setNewPersonnelCert}
        assignExistingUserId={assignExistingUserId}
        setAssignExistingUserId={setAssignExistingUserId}
        assignExistingProject={assignExistingProject}
        setAssignExistingProject={setAssignExistingProject}
        usersList={usersList}
        handleAddPersonnelSubmit={handleAddPersonnelSubmit}
      />
    </div>
  )
}

export default SystemControl
