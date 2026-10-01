import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  FolderKanban,
  Search,
  Grid,
  Table as TableIcon,
  SlidersHorizontal,
  Download,
  PlusCircle,
  Route,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Lock,
  Shield,
  X,
  Calendar,
  MapPin,
  User as UserIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  ArrowLeftRight,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
  Check,
  TrendingUp,
  Tag,
  UserPlus,
  Mail
} from 'lucide-react'

// Interface mở rộng cho dự án trong Hub
export interface HubProject {
  id: string
  code: string
  name: string
  region: string
  location_detail: string
  start_km: number
  end_km: number
  stationing_text: string
  status: 'ACTIVE' | 'NEAR_EXPIRY' | 'PENDING_ALIGNMENT' | 'RESTRICTED'
  status_label: string
  status_color: string
  pm_name: string
  pm_email: string
  pm_role_badge: string
  pm_avatar?: string
  warranty_passed_percent: number
  days_remaining: number
  length_km: number
  open_defects: number
  repair_packages: number
  image_url: string
  is_assigned: boolean
  is_restricted_for_pm?: boolean
  escrow_budget?: string
  kml_status?: string
}

// Danh sách mock 5 dự án chuẩn theo thiết kế Stitch
const INITIAL_PROJECTS: HubProject[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Đoạn Km 1020 đến Km 1045',
    region: 'Miền Trung',
    location_detail: 'Huế - Đà Nẵng',
    start_km: 1020.0,
    end_km: 1045.0,
    stationing_text: 'Km 1020+000 → Km 1045+000',
    status: 'ACTIVE',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    pm_role_badge: 'PM Chính',
    pm_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    warranty_passed_percent: 65,
    days_remaining: 180,
    length_km: 156.0,
    open_defects: 12,
    repair_packages: 3,
    image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    escrow_budget: '8,200,000,000 VNĐ',
    kml_status: 'Đã phê duyệt'
  },
  {
    id: 'prj-ctbn-01',
    code: 'PRJ-CTBN-01',
    name: 'Cao tốc Bắc Nam - Đoạn Diễn Châu',
    region: 'Miền Bắc',
    location_detail: 'Nghệ An',
    start_km: 430.0,
    end_km: 479.3,
    stationing_text: 'Km 430+000 → Km 479+300',
    status: 'NEAR_EXPIRY',
    status_label: 'Sắp hết hạn',
    status_color: '#BA1A1A',
    pm_name: 'Trần Minh Tâm',
    pm_email: 'tam.tm@hoanghai-infra.vn',
    pm_role_badge: 'PM Tuyến',
    warranty_passed_percent: 92,
    days_remaining: 25,
    length_km: 49.3,
    open_defects: 5,
    repair_packages: 1,
    image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    escrow_budget: '5,600,000,000 VNĐ',
    kml_status: 'Đã phê duyệt'
  },
  {
    id: 'prj-dt741-04',
    code: 'PRJ-DT741-04',
    name: 'Đường tỉnh ĐT-741 (Bình Dương)',
    region: 'Miền Nam',
    location_detail: 'Bình Dương',
    start_km: 0.0,
    end_km: 32.8,
    stationing_text: 'Km 0+000 → Km 32+800',
    status: 'PENDING_ALIGNMENT',
    status_label: 'Chờ duyệt tuyến',
    status_color: '#D97706',
    pm_name: 'Chưa phân công PM',
    pm_email: 'Cần gán PM trước khi kích hoạt tim tuyến',
    pm_role_badge: 'Chưa gán',
    warranty_passed_percent: 0,
    days_remaining: 730,
    length_km: 32.8,
    open_defects: 0,
    repair_packages: 0,
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    is_assigned: false,
    is_restricted_for_pm: false,
    escrow_budget: '3,800,000,000 VNĐ',
    kml_status: 'Đang thẩm định'
  },
  {
    id: 'prj-ptdg-03',
    code: 'PRJ-PTDG-03',
    name: 'Cao tốc Phan Thiết - Dầu Giây (GĐ 1)',
    region: 'Miền Nam',
    location_detail: 'Bình Thuận - Đồng Nai',
    start_km: 0.0,
    end_km: 99.0,
    stationing_text: 'Km 0+000 → Km 99+000',
    status: 'RESTRICTED',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Lê Văn Cường',
    pm_email: 'cuong.lv@hoanghai-infra.vn',
    pm_role_badge: 'PM Phụ trách',
    warranty_passed_percent: 38,
    days_remaining: 450,
    length_km: 99.0,
    open_defects: 8,
    repair_packages: 2,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: true, // Khi PM Đỗ Quốc Hoàng xem thì bị 403 IDOR
    escrow_budget: '12,500,000,000 VNĐ',
    kml_status: 'Đã phê duyệt'
  },
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan',
    region: 'Miền Trung',
    location_detail: 'Huế - Đà Nẵng',
    start_km: 0.0,
    end_km: 66.0,
    stationing_text: 'Km 0+000 → Km 66+000',
    status: 'ACTIVE',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    pm_role_badge: 'PM Phụ trách',
    pm_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    warranty_passed_percent: 42,
    days_remaining: 310,
    length_km: 66.0,
    open_defects: 7,
    repair_packages: 2,
    image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    escrow_budget: '6,900,000,000 VNĐ',
    kml_status: 'Đã phê duyệt'
  }
]

export const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Chế độ mô phỏng vai trò (SUPERVISOR hoặc PM) để dễ dàng kiểm thử kịch bản IDOR và nút tạo dự án
  const [activeRole, setActiveRole] = useState<'SUPERVISOR' | 'PROJECT_MANAGER'>(
    user?.role === RoleCode.SUPERVISOR ? 'SUPERVISOR' : 'PROJECT_MANAGER'
  )

  const isSupervisor = activeRole === 'SUPERVISOR'

  // Projects state
  const [projects, setProjects] = useState<HubProject[]>(INITIAL_PROJECTS)
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'NEAR_EXPIRY' | 'PENDING_ALIGNMENT'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3800)
  }

  // Modal Khởi tạo dự án mới
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('Quốc lộ 14 - Đoạn Chơn Thành')
  const [newProjectCode, setNewProjectCode] = useState('PRJ-QL14-01')
  const [newProjectRegion, setNewProjectRegion] = useState('Bình Phước - Bình Dương')
  const [newProjectPM, setNewProjectPM] = useState('Đỗ Quốc Hoàng (pmhoang@gmail.com)')
  const [newPMNameCustom, setNewPMNameCustom] = useState('')
  const [newPMEmailCustom, setNewPMEmailCustom] = useState('')
  const [newStartDate, setNewStartDate] = useState('2026-10-01')
  const [newEndDate, setNewEndDate] = useState('2029-10-01')
  const [newStartKm, setNewStartKm] = useState('Km 0+000')
  const [newEndKm, setNewEndKm] = useState('Km 28+500')
  const [newLengthKm, setNewLengthKm] = useState('28.5')

  // Modal Gán PM nhanh cho dự án
  const [assignModalProject, setAssignModalProject] = useState<HubProject | null>(null)
  const [selectedPMAssign, setSelectedPMAssign] = useState('Đỗ Quốc Hoàng (pmhoang@gmail.com)')

  // Xử lý đổi vai trò mô phỏng
  const handleToggleRoleSimulation = () => {
    const nextRole = isSupervisor ? 'PROJECT_MANAGER' : 'SUPERVISOR'
    setActiveRole(nextRole)
    if (nextRole === 'SUPERVISOR') {
      showToast('Đã chuyển sang vai trò SUPERVISOR: Hiển thị nút Khởi tạo dự án & mở khóa toàn quyền truy cập.')
    } else {
      showToast('Đã chuyển sang vai trò PROJECT MANAGER: Khóa dự án ngoài phạm vi theo chính sách 403 Scope IDOR.')
    }
  }

  // Submit tạo dự án mới
  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedLength = parseFloat(newLengthKm) || 28.5
    const isInvitingNew = newProjectPM === 'INVITE_NEW'
    const pmName = isInvitingNew ? (newPMNameCustom || 'Kỹ sư mới được mời') : newProjectPM.split(' (')[0]
    const pmEmail = isInvitingNew ? (newPMEmailCustom || 'pm.moi@cat-tuong.vn') : (newProjectPM.includes('(') ? newProjectPM.split('(')[1].replace(')', '') : 'pmhoang@gmail.com')

    const newProject: HubProject = {
      id: `prj-${Date.now()}`,
      code: newProjectCode || `PRJ-AUTO-${Math.floor(Math.random() * 900 + 100)}`,
      name: newProjectName,
      region: newProjectRegion,
      location_detail: newProjectRegion,
      start_km: 0.0,
      end_km: parsedLength,
      stationing_text: `${newStartKm} → ${newEndKm}`,
      status: 'PENDING_ALIGNMENT',
      status_label: 'Chờ duyệt tuyến',
      status_color: '#D97706',
      pm_name: pmName,
      pm_email: pmEmail,
      pm_role_badge: isInvitingNew ? 'Chờ kích hoạt' : 'PM Tuyến',
      warranty_passed_percent: 0,
      days_remaining: 1095,
      length_km: parsedLength,
      open_defects: 0,
      repair_packages: 0,
      image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
      is_assigned: newProjectPM !== '-- Để trống --',
      is_restricted_for_pm: false,
      kml_status: 'Chờ phê duyệt KML'
    }

    setProjects([newProject, ...projects])
    setIsModalOpen(false)
    if (isInvitingNew) {
      showToast(`Đã khởi tạo dự án [${newProject.code}] và gửi link mời kích hoạt tới ${pmEmail}! (Mã: #IVT-2026-08F)`)
    } else {
      showToast(`Khởi tạo thành công dự án [${newProject.code}] và đã chuyển sang trạng thái Chờ phê duyệt tim tuyến (WF-02)!`)
    }
  }

  // Submit Gán PM nhanh
  const handleAssignPMSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignModalProject) return

    setProjects(
      projects.map((p) =>
        p.id === assignModalProject.id
          ? {
              ...p,
              pm_name: selectedPMAssign.split(' (')[0],
              pm_email: selectedPMAssign.includes('(') ? selectedPMAssign.split('(')[1].replace(')', '') : 'pmhoang@gmail.com',
              pm_role_badge: 'PM Chính',
              is_assigned: true
            }
          : p
      )
    )
    showToast(`Đã phân công ${selectedPMAssign.split(' (')[0]} phụ trách dự án ${assignModalProject.code}`)
    setAssignModalProject(null)
  }

  // Filter projects logic
  const filteredProjects = useMemo(() => {
    return projects.filter((prj) => {
      // Filter tab
      if (filterTab === 'ACTIVE' && prj.status !== 'ACTIVE') return false
      if (filterTab === 'NEAR_EXPIRY' && prj.status !== 'NEAR_EXPIRY') return false
      if (filterTab === 'PENDING_ALIGNMENT' && prj.status !== 'PENDING_ALIGNMENT') return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchName = prj.name.toLowerCase().includes(query)
        const matchCode = prj.code.toLowerCase().includes(query)
        const matchPM = prj.pm_name.toLowerCase().includes(query)
        const matchRegion = prj.region.toLowerCase().includes(query)
        if (!matchName && !matchCode && !matchPM && !matchRegion) return false
      }

      return true
    })
  }, [projects, filterTab, searchQuery])

  // KPI Metrics Calculation
  const totalLength = useMemo(() => projects.reduce((acc, p) => acc + p.length_km, 0).toFixed(1), [projects])
  const activeCount = useMemo(() => projects.filter((p) => p.status === 'ACTIVE' || p.status === 'RESTRICTED').length, [projects])
  const nearExpiryCount = useMemo(() => projects.filter((p) => p.status === 'NEAR_EXPIRY').length, [projects])
  const pendingAlignmentCount = useMemo(() => projects.filter((p) => p.status === 'PENDING_ALIGNMENT').length, [projects])

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TOP CONTEXT BAR: BREADCRUMB & ROLE SIMULATOR             */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span
            onClick={() => navigate(isSupervisor ? '/sup/dashboard' : '/pm/dashboard')}
            className="hover:text-[#C9A227] transition-colors cursor-pointer flex items-center gap-1"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Trang chủ
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Danh mục dự án hạ tầng</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-[#8C6D1F] bg-[#C9A227]/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            INFRA-HUB-V2.4
          </span>
        </div>

        {/* Live Scope & Security Role Simulator Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-2xs transition-all ${
              isSupervisor
                ? 'bg-[#C9A227]/10 border-[#C9A227]/30 text-[#8C6D1F]'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupervisor ? 'bg-[#C9A227] animate-pulse' : 'bg-slate-500'
              }`}
            ></span>
            <span className="font-semibold">
              Chế độ hiện tại: {isSupervisor ? 'SUPERVISOR (Toàn quyền quản trị & phân quyền)' : 'PROJECT MANAGER (Chỉ xem dự án được gán)'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleRoleSimulation}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            title="Nhấn để chuyển đổi qua lại giữa góc nhìn Supervisor và PM"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Mô phỏng đổi vai trò (PM/Super)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PAGE HEADER & PRIMARY ACTIONS                            */}
      {/* ======================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 max-w-3xl">
          <div className="w-12 h-12 rounded-xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center shrink-0 shadow-2xs">
            <FolderKanban className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight font-headline">
              Quản lý danh mục dự án bảo hành đường bộ
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Theo dõi tiến độ bảo hành, mức độ rủi ro hư hỏng mặt đường và phân bổ nguồn lực kỹ sư quản lý dự án (PM) trên toàn mạng lưới cao tốc &amp; quốc lộ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => showToast('Đang kết xuất tệp GIS GeoJSON & KML toàn tuyến mạng lưới đường bộ...')}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất dữ liệu GIS</span>
          </button>

          {/* Supervisor Only Button */}
          {isSupervisor && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.4]" />
              <span>Khởi tạo dự án mới</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* KPI SUMMARY ROW (CIVIL INFRASTRUCTURE OVERVIEW)          */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng chiều dài */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#C9A227] shrink-0">
            <Route className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-500 truncate">Tổng chiều dài quản lý</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {totalLength} <span className="text-xs font-normal text-slate-500">km</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Đang bảo hành */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EDF7ED] flex items-center justify-center text-[#1B5E20] shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-500 truncate">Đang bảo hành ổn định</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {activeCount} <span className="text-xs font-normal text-slate-500">dự án</span>
            </span>
          </div>
        </div>

        {/* KPI 3: Sắp hết hạn */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-500 truncate">Sắp hết hạn (&lt;30 ngày)</span>
            <span className="text-lg font-bold text-rose-600 font-mono">
              {nearExpiryCount} <span className="text-xs font-normal text-slate-500">dự án</span>
            </span>
          </div>
        </div>

        {/* KPI 4: Chờ định vị tim tuyến */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-500 truncate">Chờ định vị tim tuyến</span>
            <span className="text-lg font-bold text-[#D97706] font-mono">
              {pendingAlignmentCount} <span className="text-xs font-normal text-slate-500">dự án</span>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FILTER & SEARCH BAR                                      */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* State Pills / Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Tất cả</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-mono">{projects.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              filterTab === 'ACTIVE'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#1B5E20]"></span>
            <span>Đang bảo hành</span>
            <span className="text-[11px] font-mono text-slate-500">{activeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('NEAR_EXPIRY')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              filterTab === 'NEAR_EXPIRY'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Sắp hết hạn</span>
            <span className="text-[11px] font-mono text-slate-500">{nearExpiryCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('PENDING_ALIGNMENT')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              filterTab === 'PENDING_ALIGNMENT'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
            <span>Chờ duyệt tuyến</span>
            <span className="text-[11px] font-mono text-slate-500">{pendingAlignmentCount}</span>
          </button>
        </div>

        {/* Quick Search & View Toggle */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md justify-end">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên dự án, mã PRJ, hoặc PM phụ trách..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition"
            />
          </div>

          <div className="shrink-0 flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#C9A227] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng lưới"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#C9A227] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng bảng"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEW: PROJECT GRID OR TABLE                         */}
      {/* ======================================================== */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((prj) => {
            // Kiểm tra trạng thái 403 Restricted khi xem ở góc nhìn PM
            const isRestrictedForCurrentPM = !isSupervisor && prj.is_restricted_for_pm

            return (
              <div
                key={prj.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group relative"
              >
                {/* IDOR 403 Restricted Overlay khi ở vai trò PM xem dự án ngoài thẩm quyền */}
                {isRestrictedForCurrentPM && (
                  <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-[2px] p-5 flex flex-col items-center justify-center text-center gap-3 select-none">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
                      <Lock className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col gap-1 max-w-xs">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-mono px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                          403 RESTRICTED
                        </span>
                        <span className="text-xs text-rose-300 font-semibold">Chính sách Scope &amp; IDOR</span>
                      </div>
                      <span className="text-sm text-white font-bold mt-1">Dự án ngoài phạm vi phụ trách</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Bạn hiện chỉ được cấp quyền tại <strong className="text-white">QL1A - Huế</strong>. Mọi thao tác truy cập trái thẩm quyền đều được ghi lại trong chuỗi kiểm toán bảo mật.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 bg-white/10 text-slate-300 rounded-lg text-xs cursor-not-allowed border border-white/10 flex items-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Yêu cầu quyền truy cập từ Supervisor</span>
                    </button>
                  </div>
                )}

                {/* Card Banner / Spatial Reference */}
                <div className="h-32 relative bg-slate-100 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${prj.image_url}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="font-mono px-2.5 py-0.5 bg-white/95 backdrop-blur-md rounded-full text-[11px] text-slate-900 font-bold shadow-2xs">
                      {prj.code}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white font-medium">
                      {prj.region}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1 ${
                        prj.status === 'NEAR_EXPIRY'
                          ? 'bg-[#FEE2E2] text-rose-700 font-bold'
                          : prj.status === 'PENDING_ALIGNMENT'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#EDF7ED] text-[#1B5E20]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          prj.status === 'NEAR_EXPIRY'
                            ? 'bg-rose-600 animate-ping'
                            : prj.status === 'PENDING_ALIGNMENT'
                            ? 'bg-[#D97706]'
                            : 'bg-[#1B5E20]'
                        }`}
                      ></span>
                      {prj.status_label}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white/95">
                    <span className="font-mono text-xs flex items-center gap-1">
                      <Route className="w-3.5 h-3.5 text-[#C9A227]" />
                      {prj.stationing_text}
                    </span>
                    <span className="text-[11px] opacity-85">{prj.location_detail}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3.5">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#C9A227] transition-colors leading-snug font-headline">
                      {prj.name}
                    </h3>

                    {/* PM Info Block */}
                    {prj.is_assigned ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {prj.pm_avatar ? (
                            <img
                              alt={prj.pm_name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                              src={prj.pm_avatar}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {prj.pm_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-800 truncate font-semibold">{prj.pm_name}</span>
                            <span className="text-[10px] text-slate-500 truncate font-mono">{prj.pm_email}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#C9A227]/15 text-[#8C6D1F] text-[10px] font-bold shrink-0">
                          {prj.pm_role_badge}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFBEB] border border-amber-200/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-[#92400E] font-bold">Chưa phân công PM</span>
                            <span className="text-[10px] text-[#B45309] truncate">Cần PM trước khi kích hoạt tuyến</span>
                          </div>
                        </div>
                        {isSupervisor && (
                          <button
                            type="button"
                            onClick={() => setAssignModalProject(prj)}
                            className="px-2.5 py-1 bg-white hover:bg-[#C9A227] hover:text-white text-[#8C6D1F] rounded-full border border-amber-300 text-[11px] font-semibold transition shrink-0 shadow-2xs cursor-pointer"
                          >
                            Gán PM ngay
                          </button>
                        )}
                      </div>
                    )}

                    {/* Warranty Progress Metric */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {prj.status === 'NEAR_EXPIRY' ? (
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Cần lập hồ sơ quyết toán
                            </span>
                          ) : (
                            'Thời hạn bảo hành'
                          )}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            prj.status === 'NEAR_EXPIRY' ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {prj.warranty_passed_percent}%{' '}
                          <span className="font-normal text-slate-500 text-[11px]">(Còn {prj.days_remaining} ngày)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            prj.status === 'NEAR_EXPIRY'
                              ? 'bg-rose-500'
                              : prj.status === 'PENDING_ALIGNMENT'
                              ? 'bg-slate-300'
                              : 'bg-[#C9A227]'
                          }`}
                          style={{ width: `${prj.warranty_passed_percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 3-Col Mini Technical Spec Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Chiều dài</span>
                        <span className="font-mono text-xs font-bold text-slate-800">{prj.length_km} km</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Lỗi mở</span>
                        <span
                          className={`font-mono text-xs font-bold ${
                            prj.open_defects > 0 ? 'text-rose-600' : 'text-slate-600'
                          }`}
                        >
                          {prj.open_defects} điểm
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Gói sửa</span>
                        <span className="font-mono text-xs font-bold text-slate-800">{prj.repair_packages} gói</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-2 border-t border-slate-100">
                    {prj.status === 'PENDING_ALIGNMENT' ? (
                      <button
                        type="button"
                        onClick={() => {
                          const base = isSupervisor ? '/sup' : '/pm'
                          navigate(`${base}/projects/${prj.id}/alignment`)
                        }}
                        className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Route className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Xem thiết lập tuyến (WF-02)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const base = isSupervisor ? '/sup' : '/pm'
                          navigate(`${base}/projects/${prj.id}`)
                        }}
                        className="w-full py-2.5 px-3 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
                      >
                        <span>Vào quản lý dự án</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* CARD 6: CALLOUT QUICK ADD (DÀNH CHO SUPERVISOR) */}
          {isSupervisor && (
            <div
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-50/60 border-2 border-dashed border-[#C9A227]/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3.5 hover:bg-slate-100/70 hover:border-[#C9A227] transition cursor-pointer min-h-[360px] group shadow-2xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-white text-[#C9A227] shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                <Building2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex flex-col gap-1 max-w-xs">
                <h4 className="text-base font-bold text-slate-900 font-headline">Tạo hồ sơ dự án mới</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bắt đầu chu trình bàn giao từ ban quản lý dự án BOT/VEC sang bộ phận bảo hành hạ tầng.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Mở form khởi tạo</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã Dự Án</th>
                  <th className="py-3.5 px-4">Tên Tuyến Đường</th>
                  <th className="py-3.5 px-4">Khu Vực &amp; Lý Trình</th>
                  <th className="py-3.5 px-4">PM Phụ Trách</th>
                  <th className="py-3.5 px-4 text-center">Tiến Độ Bảo Hành</th>
                  <th className="py-3.5 px-4 text-center">Lỗi Mở</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((prj) => (
                  <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#8C6D1F]">{prj.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{prj.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{prj.region} ({prj.location_detail})</div>
                      <div className="font-mono text-[11px] text-slate-400">{prj.stationing_text}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {prj.is_assigned ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{prj.pm_name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                            {prj.pm_role_badge}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-semibold italic">Chưa phân công</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {prj.warranty_passed_percent}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                          prj.open_defects > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {prj.open_defects}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          prj.status === 'NEAR_EXPIRY'
                            ? 'bg-rose-100 text-rose-700'
                            : prj.status === 'PENDING_ALIGNMENT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {prj.status_label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Xem dự án ${prj.code}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#C9A227] hover:text-white text-slate-700 font-semibold transition cursor-pointer text-xs"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PAGINATION & FOOTER                                      */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <span>
            Hiển thị <strong className="text-slate-900 font-mono">1 - {filteredProjects.length}</strong> trong tổng số{' '}
            <strong className="text-slate-900 font-mono">{projects.length}</strong> dự án đường bộ
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span>Đồng bộ vệ tinh GIS: 4 phút trước</span>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
          <button
            type="button"
            disabled
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded bg-[#C9A227] text-white font-bold text-xs"
          >
            1
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded text-slate-600 hover:bg-slate-100 font-semibold text-xs"
          >
            2
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL KHỞI TẠO DỰ ÁN MỚI (DÀNH CHO SUPERVISOR)           */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Route className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight font-headline">
                    Khởi tạo dự án bảo hành đường bộ mới
                  </h2>
                  <p className="text-xs text-slate-500">
                    Hệ thống tự động thiết lập phạm vi lý trình và cấp quyền quản lý cho PM phụ trách.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateProjectSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Project Title & PRJ Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Tên dự án đường bộ <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="VD: Quốc lộ 14 - Đoạn Chơn Thành"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Mã dự án (PRJ)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={newProjectCode}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Region & PM Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Khu vực địa lý / Tỉnh thành quản lý <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectRegion}
                    onChange={(e) => setNewProjectRegion(e.target.value)}
                    placeholder="VD: Bình Phước - Bình Dương, Thừa Thiên Huế, Hà Nội..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700">
                      Chỉ định Kỹ sư PM <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#8C6D1F] bg-[#C9A227]/15 px-1.5 py-0.2 rounded">
                      CCHN Hạng I
                    </span>
                  </div>
                  <select
                    value={newProjectPM}
                    onChange={(e) => setNewProjectPM(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value="Đỗ Quốc Hoàng (pmhoang@gmail.com)">Kỹ sư Đỗ Quốc Hoàng (pmhoang@gmail.com)</option>
                    <option value="Trần Minh Tâm (tam.tm@hoanghai-infra.vn)">Kỹ sư Trần Minh Tâm (tam.tm@hoanghai-infra.vn)</option>
                    <option value="Lê Văn Cường (cuong.lv@hoanghai-infra.vn)">Kỹ sư Lê Văn Cường (cuong.lv@hoanghai-infra.vn)</option>
                    <option value="INVITE_NEW">+ Mời Kỹ sư PM mới (Gửi qua Email kích hoạt)...</option>
                    <option value="-- Để trống --">-- Để trống (Chưa gán) --</option>
                  </select>

                  {newProjectPM === 'INVITE_NEW' && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 mt-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8F7212]">
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Mời PM mới vào hệ thống (Tình huống 2)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Họ và tên PM mới <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Nguyễn Văn B..."
                            value={newPMNameCustom}
                            onChange={(e) => setNewPMNameCustom(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Email công vụ nhận thư mời <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="pm.moi@cat-tuong.vn..."
                            value={newPMEmailCustom}
                            onChange={(e) => setNewPMEmailCustom(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>Hệ thống sẽ gửi link <strong>/invite/token-...</strong> để PM tự tạo mật khẩu lần đầu.</span>
                        <a
                          href="/accept-invitation"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#8F7212] font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Xem mẫu màn hình nhận lời mời ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warranty Period */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-[#C9A227]" />
                  Khung thời gian hiệu lực bảo hành (Biên bản nghiệm thu đưa vào sử dụng)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Ngày bắt đầu hiệu lực</span>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Ngày kết thúc bảo hành (36 tháng)</span>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Phạm vi lý trình tuyến đường (Km bắt đầu - Km kết thúc - Tổng chiều dài) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Route className="w-4 h-4 text-[#C9A227]" />
                  Phạm vi lý trình &amp; Quy mô tuyến đường
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Lý trình bắt đầu <span className="text-rose-600">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={newStartKm}
                      onChange={(e) => setNewStartKm(e.target.value)}
                      placeholder="VD: Km 0+000"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Lý trình kết thúc <span className="text-rose-600">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={newEndKm}
                      onChange={(e) => setNewEndKm(e.target.value)}
                      placeholder="VD: Km 28+500"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Chiều dài tuyến (Km) <span className="text-rose-600">*</span>
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={newLengthKm}
                        onChange={(e) => setNewLengthKm(e.target.value)}
                        placeholder="28.5"
                        className="w-full pl-3 pr-9 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        km
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Note */}
              <div className="p-3 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Quy chuẩn hệ thống:</strong> Sau khi hoàn tất khởi tạo, dự án sẽ tự động chuyển sang trạng thái <em>"Chờ phê duyệt tim tuyến (WF-02)"</em> và cấp mã định danh bảo mật Token cho PM được chỉ định.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-xl font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu hồ sơ &amp; Bàn giao PM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL GÁN PM NHANH                                       */}
      {/* ======================================================== */}
      {assignModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-sm text-slate-900 font-headline">Phân công Kỹ sư Quản lý (PM)</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignPMSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Dự án công trình:</span>
                <p className="font-bold text-slate-900 text-sm">{assignModalProject.name}</p>
                <span className="font-mono text-[11px] text-slate-500">Mã: {assignModalProject.code}</span>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Chọn Kỹ sư PM đảm nhiệm:</label>
                <select
                  value={selectedPMAssign}
                  onChange={(e) => setSelectedPMAssign(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                >
                  <option value="Đỗ Quốc Hoàng (pmhoang@gmail.com)">Kỹ sư Đỗ Quốc Hoàng (pmhoang@gmail.com)</option>
                  <option value="Trần Minh Tâm (tam.tm@hoanghai-infra.vn)">Kỹ sư Trần Minh Tâm (tam.tm@hoanghai-infra.vn)</option>
                  <option value="Lê Văn Cường (cuong.lv@hoanghai-infra.vn)">Kỹ sư Lê Văn Cường (cuong.lv@hoanghai-infra.vn)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-800 leading-relaxed">
                Sau khi phân công, hệ thống sẽ tự động gửi thư mời kích hoạt tài khoản Onboarding (WF-01/02) tới email của kỹ sư phụ trách.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalProject(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác nhận phân công</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOAST FEEDBACK FLOATING NOTIFICATION                     */}
      {/* ======================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-3 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-ping shrink-0"></span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
export default ProjectList
