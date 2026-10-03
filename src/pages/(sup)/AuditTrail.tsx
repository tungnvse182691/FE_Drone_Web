import React, { useState, useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { mockAuditEvents } from '../../api/mock/data'
import { AuditEvent } from '../../types/domain'
import {
  ShieldCheck,
  History,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  Code,
  Calendar,
  Layers,
  FileCheck,
  Camera,
  MapPin,
  Maximize2,
  Building2,
  RefreshCw,
  Info
} from 'lucide-react'

export const AuditTrail: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Dữ liệu dòng sự kiện hoạt động (Activity Timeline / Audit Log) theo v2.2 (RPT-10, US-29, FR-34)
  const [events, setEvents] = useState<AuditEvent[]>(mockAuditEvents)
  const [selectedEventId, setSelectedEventId] = useState<string>(mockAuditEvents[0]?.id || '')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Phân định phạm vi dự án theo vai trò (Role Scope - US-29-AC-02 & UAT-08)
  // PM: Khóa cứng ở dự án phụ trách 'proj-01' (QL1A - Giai đoạn 2)
  // Supervisor: Xem toàn hệ thống ('all') hoặc từng dự án cụ thể
  const [selectedProject, setSelectedProject] = useState<string>(isPM ? 'proj-01' : 'all')

  // Bộ lọc chuẩn theo v2.2 Phần 11.4
  const [selectedActorRole, setSelectedActorRole] = useState<string>('all')
  const [selectedActionType, setSelectedActionType] = useState<string>('all')
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('30d')

  // Trạng thái sao chép và Modal
  const [copiedEventId, setCopiedEventId] = useState<boolean>(false)
  const [showExportModal, setShowExportModal] = useState<boolean>(false)
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV'>('PDF')
  const [exportSuccess, setExportSuccess] = useState<boolean>(false)

  // Xem ảnh phóng to (Lightbox)
  const [activeImageModal, setActiveImageModal] = useState<{
    url: string
    caption: string
    captured_at: string
    gps_coordinates: string
  } | null>(null)

  // Danh mục các dự án bảo hành trong hệ thống Hoàng Hải
  const projectList = [
    { id: 'all', name: 'Tất cả dự án (Toàn hệ thống)', code: 'ALL_SYSTEM' },
    { id: 'proj-01', name: 'QL1A - Giai đoạn 2 (Km 1024 - 1045)', code: 'QL1A-02' },
    { id: 'proj-02', name: 'QL1A - Giai đoạn 1 (Km 990 - 1024)', code: 'QL1A-01' },
    { id: 'proj-03', name: 'Cao tốc Bắc - Nam (Km 45 - Km 80)', code: 'CT03-BN' }
  ]

  // Lọc dữ liệu theo vai trò và tiêu chí lọc nghiệp vụ (v2.2 US-29, Phần 11.4)
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Phân định quyền truy cập theo vai trò (Role Scope - BR-45 & US-29-AC-02 & UAT-08)
      // PM chỉ được xem các sự kiện thuộc dự án được phân công (proj-01)
      if (isPM && ev.project_id !== 'proj-01') {
        return false
      }

      // Supervisor có thể lọc theo dự án được chọn
      if (isSupervisor && selectedProject !== 'all' && ev.project_id !== selectedProject) {
        return false
      }

      // 2. Lọc theo vai trò tác nhân (Actor Role)
      if (selectedActorRole !== 'all') {
        if (ev.actor_role !== selectedActorRole) return false
      }

      // 3. Lọc theo loại hành động nghiệp vụ (Action Type)
      if (selectedActionType !== 'all') {
        if (ev.action_type !== selectedActionType) return false
      }

      // 4. Lọc theo loại thực thể tác động (Entity Type)
      if (selectedEntityType !== 'all') {
        if (ev.target_entity_type !== selectedEntityType) return false
      }

      // 5. Tìm kiếm từ khóa (Mã sự kiện event_id, Tên người, Tên thực thể, Lý trình, Lý do nghiệp vụ)
      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase()
        const matchId = ev.event_id.toLowerCase().includes(q)
        const matchActor = ev.actor_name.toLowerCase().includes(q)
        const matchEntity = ev.target_entity_name.toLowerCase().includes(q)
        const matchAction = ev.action_label_vi.toLowerCase().includes(q)
        const matchLocation = ev.target_location?.toLowerCase().includes(q) || false
        const matchReason = ev.reason.toLowerCase().includes(q)
        if (!matchId && !matchActor && !matchEntity && !matchAction && !matchLocation && !matchReason) {
          return false
        }
      }

      return true
    })
  }, [events, isPM, isSupervisor, selectedProject, selectedActorRole, selectedActionType, selectedEntityType, searchKeyword])

  // Sự kiện đang được chọn để soi chi tiết trong Drawer bên phải
  const selectedEvent = useMemo(() => {
    return filteredEvents.find((e) => e.id === selectedEventId) || filteredEvents[0] || events[0]
  }, [filteredEvents, selectedEventId, events])

  // Thống kê số liệu thực tế trong phạm vi dự án hiện hành (Chuẩn v2.2 Phần 11.2 - RPT-10)
  const calculatedStats = useMemo(() => {
    const totalEventsInScope = filteredEvents.length
    // Đếm các sự kiện có chuyển đổi trạng thái (from_status -> to_status)
    const stateTransitions = filteredEvents.filter((e) => Boolean(e.from_status && e.to_status)).length
    // Đếm số quyết định phê duyệt / từ chối / nghiệm thu của Supervisor
    const approvalDecisions = filteredEvents.filter(
      (e) =>
        e.action_type === 'APPROVE_BATCH' ||
        e.action_type === 'ACCEPT_WORK_ORDER' ||
        e.action_type === 'REJECT_BATCH' ||
        e.action_type === 'LOCK_LEGAL_HOLD'
    ).length

    return {
      total_events: totalEventsInScope,
      state_transitions: stateTransitions,
      approval_decisions: approvalDecisions
    }
  }, [filteredEvents])

  // Hàm sao chép Event ID
  const handleCopyEventId = (eventId: string) => {
    navigator.clipboard.writeText(eventId)
    setCopiedEventId(true)
    setTimeout(() => setCopiedEventId(false), 2000)
  }

  // Thao tác làm mới dữ liệu (Refresh theo v2.2 Điều 11.1)
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setEvents([...mockAuditEvents])
      setIsRefreshing(false)
    }, 500)
  }

  // Xử lý xuất báo cáo lịch sử hoạt động (FR-35, US-16, Điều 11.5)
  const handleExport = () => {
    setExportSuccess(true)
    setTimeout(() => {
      setExportSuccess(false)
      setShowExportModal(false)
    }, 1800)
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1720px] mx-auto w-full pb-16">
      {/* 1. TOP BREADCRUMB & ROLE SCOPE RIBBON */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 hover:text-brand-dark transition-colors">
            Trang chủ
          </span>
          <span>/</span>
          <span className="hover:text-brand-dark transition-colors">Báo cáo &amp; Giám sát</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Lịch sử hoạt động (RPT-10)</span>
        </nav>

        {/* Role Scope Badges (v2.2 US-29-AC-02 & BR-45) */}
        <div className="flex items-center gap-2.5">
          {/* Phân định vai trò hiển thị rõ ràng */}
          {isSupervisor ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
              <span>GIÁM SÁT / CHỦ ĐẦU TƯ (THEO DÕI TOÀN HỆ THỐNG)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-semibold shadow-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>PROJECT MANAGER (CHỈ XEM DỰ ÁN PHỤ TRÁCH - US-29-AC-02)</span>
            </div>
          )}

          {/* Lưu trữ bảo hành BR-45 */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>LƯU TRỮ BR-45 (HẾT BẢO HÀNH +5 NĂM)</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER SECTION & PROJECT SCOPE SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1.5 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-brand-goldDark font-mono text-xs font-semibold border border-amber-200">
              Mã báo cáo: RPT-10
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200">
              Căn cứ: FR-34, US-29, BR-45
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-xs font-medium border border-emerald-200">
              Chế độ: CHỈ ĐỌC (READ-ONLY)
            </span>
            {isPM && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Khóa phạm vi: QL1A - Giai đoạn 2
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Lịch sử hoạt động &amp; Nhật ký kiểm toán dự án (RPT-10)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hộp đen ghi nhận mọi sự kiện nghiệp vụ thành công theo thời gian thực (Durable Events), lưu trữ lịch sử tác nghiệp bất biến phục vụ công tác đối chiếu, kiểm tra và bảo hành hạ tầng đường bộ (BR-45, US-29).
          </p>

          {/* Cảnh báo phạm vi quyền hạn cho PM theo US-29-AC-02 & UAT-08 */}
          {isPM && (
            <div className="mt-1 flex items-center gap-2 text-xs text-blue-800 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-200">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Tuân thủ US-29-AC-02:</strong> Chỉ huy trưởng (PM) chỉ có thẩm quyền theo dõi dòng sự kiện trong phạm vi dự án được phân công (QL1A - Giai đoạn 2). Dữ liệu của các tuyến khác không thuộc quyền quản lý bị tự động ẩn.
              </span>
            </div>
          )}
        </div>

        {/* Action Group & Project Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Thanh chọn Dự án - Khóa cứng nếu là PM, mở chọn nếu là Supervisor */}
          <div className="flex flex-col gap-1 min-w-[250px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Phạm vi Tuyến / Dự án</span>
              {isPM ? (
                <span className="text-blue-700 flex items-center gap-0.5 font-normal">
                  <Lock className="w-3 h-3" /> Bị khóa cứng
                </span>
              ) : (
                <span className="text-emerald-700 font-normal">Toàn quyền giám sát</span>
              )}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                disabled={isPM}
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className={`w-full h-10 pl-9 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold border transition-all ${
                  isPM
                    ? 'bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed opacity-90'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 cursor-pointer shadow-xs'
                }`}
              >
                {isSupervisor && (
                  <option value="all">🌐 Tất cả dự án (Toàn hệ thống)</option>
                )}
                <option value="proj-01">📍 QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                {isSupervisor && (
                  <>
                    <option value="proj-02">📍 QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
                    <option value="proj-03">📍 Cao tốc Bắc - Nam (Km 45 - Km 80)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            {/* Nút Làm mới dữ liệu (Refresh theo v2.2 Điều 11.1) */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors border border-slate-200 shadow-xs"
              title="Tải mới dữ liệu (Cập nhật sau 60 giây theo v2.2)"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin text-brand-gold' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {/* Nút xuất báo cáo RPT-10 (CTA màu vàng đồng Hoàng Hải - Brand Color) */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-white font-semibold text-xs hover:bg-brand-goldDark transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất nhật ký (PDF/CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 3 SUMMARY METRICS CARDS (Chuẩn nghiệp vụ v2.2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Tổng số sự kiện bền vững ghi nhận trong scope */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng sự kiện ghi nhận (Durable Events)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                  {calculatedStats.total_events}
                </span>
                <span className="text-xs text-slate-500 font-medium">sự kiện trong scope</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <History className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold">Mỗi sự kiện có Event ID độc nhất</span>
              <span className="text-slate-500 font-normal">(Dedup theo US-29-AC-01)</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Không sửa / không xóa để che giấu lịch sử (US-29-AC-03)
            </span>
          </div>
        </Card>

        {/* Metric 2: Số lần chuyển đổi trạng thái hồ sơ/đợt sửa */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chuyển đổi trạng thái (State Transitions)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                  {calculatedStats.state_transitions}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                  From → To Status
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
              <ArrowRight className="w-4 h-4 text-brand-gold" />
              <span>Ghi nhận chi tiết vào IncidentCaseHistory</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 truncate">
              {isSupervisor
                ? 'Duyệt đợt sửa, từ chối gói, nghiệm thu hoàn công'
                : 'Trình duyệt đợt sửa, phân công đội thi công'}
            </span>
          </div>
        </Card>

        {/* Metric 3: Quyết định thẩm duyệt của Supervisor */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quyết định thẩm duyệt (Supervisor Actions)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                  0{calculatedStats.approval_decisions}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  Duyệt / Từ chối
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Thẩm tra giải pháp kỹ thuật &amp; biên bản thi công</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Lưu trữ bảo hành tối thiểu +5 năm (BR-45 &amp; UAT-10)
            </span>
          </div>
        </Card>
      </div>

      {/* 4. FILTER BAR CONTAINER (v2.2 Phần 11.4) */}
      <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter 1: Actor Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Vai trò tác nhân (Actor Role)</label>
            <select
              value={selectedActorRole}
              onChange={(e) => setSelectedActorRole(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value={RoleCode.SUPERVISOR}>Giám sát viên (SUPERVISOR)</option>
              <option value={RoleCode.PROJECT_MANAGER}>Chỉ huy trưởng (PROJECT_MANAGER)</option>
              <option value={RoleCode.REPAIR_CREW}>Đội thi công hiện trường (REPAIR_CREW)</option>
              {isSupervisor && (
                <option value="SYSTEM">Hệ thống &amp; Thanh tra (SYSTEM)</option>
              )}
            </select>
          </div>

          {/* Filter 2: Action Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Loại hành động nghiệp vụ</label>
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              <option value="all">Tất cả hành động</option>
              {isSupervisor && (
                <>
                  <option value="APPROVE_BATCH">Phê duyệt đợt sửa chữa (APPROVE_BATCH)</option>
                  <option value="REJECT_BATCH">Yêu cầu sửa lại đợt sửa (REJECT_BATCH)</option>
                  <option value="ACCEPT_WORK_ORDER">Nghiệm thu hoàn công (ACCEPT_WORK_ORDER)</option>
                  <option value="LOCK_LEGAL_HOLD">Kích hoạt giữ hồ sơ thanh tra (LOCK_LEGAL_HOLD)</option>
                </>
              )}
              <option value="SUBMIT_BATCH">Trình duyệt đợt sửa chữa (SUBMIT_BATCH)</option>
              <option value="ASSIGN_CREW">Phân công đội thi công (ASSIGN_CREW)</option>
              <option value="CLOSE_FAST_TRACK">Đóng hồ sơ Fast-Track (CLOSE_FAST_TRACK)</option>
              <option value="PUBLISH_SEGMENTS">Công bố bộ Segment tuyến (PUBLISH_SEGMENTS)</option>
              <option value="SUBMIT_WORK_ORDER">Báo cáo hoàn thành thi công (SUBMIT_WORK_ORDER)</option>
            </select>
          </div>

          {/* Filter 3: Entity Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Thực thể tác động (Target Entity)</label>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              <option value="all">Tất cả thực thể</option>
              <option value="REPAIR_BATCH">Đợt sửa chữa (RepairBatch)</option>
              <option value="DEFECT">Hư hỏng / Khiếm khuyết (Defect)</option>
              <option value="WORK_ORDER">Phiếu giao việc (WorkOrder)</option>
              <option value="ROAD_SEGMENT">Phân đoạn tim tuyến (RoadSegment)</option>
              {isSupervisor && (
                <option value="LEGAL_HOLD">Hồ sơ thanh tra (Legal Hold)</option>
              )}
            </select>
          </div>

          {/* Filter 4: Keyword Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Tìm kiếm Mã sự kiện / Lý trình / Lý do</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập EV-..., Km 1032, nứt lún..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* Quick chips & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">Khoảng thời gian:</span>
            <button
              type="button"
              onClick={() => setTimeFilter('24h')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                timeFilter === '24h'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              24 giờ qua
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                timeFilter === '7d'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('30d')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                timeFilter === '30d'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tháng này (T8/2026)
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Toàn bộ lịch sử
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedActorRole('all')
                setSelectedActionType('all')
                setSelectedEntityType('all')
                setSearchKeyword('')
                setTimeFilter('30d')
              }}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Đặt lại bộ lọc
            </button>
            <div className="text-xs text-slate-500 font-medium font-mono">
              Hiển thị {filteredEvents.length} sự kiện hợp lệ
            </div>
          </div>
        </div>
      </Card>

      {/* 5. MAIN GRID: EVENT TABLE (LEFT 8 COLS) + DETAIL INSPECTOR DRAWER (RIGHT 4 COLS) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Table Section (8 Columns) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Table Header Control */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-bold text-slate-900">
                Dòng sự kiện hoạt động dự án (Timeline - FR-34)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                {filteredEvents.length} bản ghi
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chế độ kiểm toán pháp lý không thể sửa/xóa (US-29-AC-03, BR-45)</span>
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
                  <th className="py-3 px-4">Thời điểm (GMT+7)</th>
                  <th className="py-3 px-3">Tác nhân thực hiện</th>
                  <th className="py-3 px-3">Hành động nghiệp vụ</th>
                  <th className="py-3 px-3">Đối tượng &amp; Lý trình</th>
                  <th className="py-3 px-3">Chuyển trạng thái</th>
                  <th className="py-3 px-3">Mã sự kiện (Event ID)</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Không tìm thấy sự kiện kiểm toán nào khớp với tiêu chí lọc.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => {
                    const isSelected = ev.id === selectedEvent.id
                    return (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedEventId(ev.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/70 border-l-4 border-l-brand-gold'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* 1. Timestamp (Theo giờ địa phương v2.2 Điều 11.3) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-xs font-semibold text-slate-900">
                            {ev.occurred_at_local}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            UTC: {ev.occurred_at.replace('T', ' ').substring(0, 19)}
                          </div>
                        </td>

                        {/* 2. Actor */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {ev.actor_avatar ? (
                              <img
                                src={ev.actor_avatar}
                                alt={ev.actor_name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-xs"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                                {ev.actor_name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col leading-tight">
                              <span className="font-semibold text-slate-900">
                                {ev.actor_name}
                              </span>
                              <span className="font-mono text-[10px] text-brand-goldDark font-semibold">
                                {ev.actor_role_label}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Action Badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${ev.action_badge_style}`}
                          >
                            {ev.action_label_vi}
                          </span>
                        </td>

                        {/* 4. Target Entity & Location */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-900 truncate max-w-[170px]" title={ev.target_entity_name}>
                            {ev.target_entity_name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]" title={ev.target_location || ev.project_name}>
                            {ev.target_location || ev.project_name}
                          </div>
                        </td>

                        {/* 5. State Transition (from_status -> to_status) */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {ev.from_status ? (
                            <div className="flex items-center gap-1 font-mono text-[10px]">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                {ev.from_status}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                                {ev.to_status}
                              </span>
                            </div>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-mono text-[10px] font-semibold border border-emerald-200">
                              {ev.to_status}
                            </span>
                          )}
                        </td>

                        {/* 6. Event ID (Dedup ID theo US-29-AC-01) */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                            {ev.event_id}
                          </span>
                        </td>

                        {/* 7. Action Button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEventId(ev.id)
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                              isSelected
                                ? 'bg-brand-gold text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Soi chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-700 font-medium">
                Phạm vi dòng sự kiện: từ{' '}
                <code className="font-mono font-bold text-brand-goldDark">
                  {filteredEvents[0]?.event_id || 'EV-START'}
                </code>{' '}
                đến{' '}
                <code className="font-mono font-bold text-brand-goldDark">
                  {filteredEvents[filteredEvents.length - 1]?.event_id || 'EV-END'}
                </code>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Tuân thủ quy tắc lưu trữ BR-45 &amp; truy vết IncidentCaseHistory
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trang trước</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors shadow-xs"
              >
                <span>Trang kế tiếp</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail Inspector Drawer Section (Right 4 Columns - Sticky) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-4 sticky top-20">
          {/* Drawer Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-gold text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  THÔNG TIN CHI TIẾT SỰ KIỆN
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {selectedEvent.occurred_at_local.split(' ')[1]}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Đối chiếu biến động &amp; Căn cứ
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500 font-medium">Mã sự kiện:</span>
                <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-semibold">
                  {selectedEvent.event_id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyEventId(selectedEvent.event_id)}
                  className="p-1 text-slate-400 hover:text-brand-gold transition-colors"
                  title="Sao chép Mã sự kiện"
                >
                  {copiedEventId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Block 1: Entity, Project & Actor Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Dự án / Tuyến đường:</span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[210px]" title={selectedEvent.project_name}>
                {selectedEvent.project_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Thực thể tác động:</span>
              <span className="font-mono font-bold text-slate-900 truncate max-w-[210px]" title={selectedEvent.target_entity_name}>
                {selectedEvent.target_entity_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Vị trí / Lý trình:</span>
              <span className="font-mono text-slate-700 text-right truncate max-w-[210px]">
                {selectedEvent.target_location || 'Hệ thống'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
              <span className="text-slate-500 font-medium">Tác nhân thực hiện:</span>
              <div className="flex items-center gap-1.5">
                {selectedEvent.actor_avatar && (
                  <img
                    src={selectedEvent.actor_avatar}
                    alt={selectedEvent.actor_name}
                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                  />
                )}
                <span className="font-semibold text-slate-900">
                  {selectedEvent.actor_name}
                </span>
                <span className="text-[10px] text-brand-goldDark font-bold font-mono">
                  {selectedEvent.actor_role_label}
                </span>
              </div>
            </div>

            {/* Lý do nghiệp vụ và căn cứ quyết định (IncidentCaseHistory.reason) */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Lý do nghiệp vụ (Căn cứ quyết định):</span>
              <span className="text-slate-800 italic leading-relaxed">
                "{selectedEvent.reason}"
              </span>
            </div>
          </div>

          {/* Block 2: Evidence Photos Gallery (Minh chứng hình ảnh thực tế hiện trường) */}
          {selectedEvent.evidence_snapshot?.images && selectedEvent.evidence_snapshot.images.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Bằng chứng hiện trường ({selectedEvent.evidence_snapshot.images.length} ảnh)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  EXIF GPS Validated
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedEvent.evidence_snapshot.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageModal(img)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-md transition-all bg-slate-100"
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-1.5 text-white">
                      <span className="text-[10px] font-medium truncate leading-tight">
                        {img.caption}
                      </span>
                      <span className="text-[9px] font-mono text-slate-300 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-brand-gold shrink-0" />
                        {img.gps_coordinates.split(',')[0]}
                      </span>
                    </div>
                    <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block 3: Visual Side-by-side State Diff (Trước / Sau) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                Đối chiếu trạng thái dữ liệu (Before / After)
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                v2.2 Diff
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Left: Before State (Red tone) */}
              <div className="rounded-xl bg-red-50/70 border border-red-200 p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-red-700 font-bold border-b border-red-100 pb-1">
                  <span>DỮ LIỆU TRƯỚC (BEFORE)</span>
                  <span>{selectedEvent.from_status || 'Khởi tạo'}</span>
                </div>
                <pre className="font-mono text-[10px] text-red-900 leading-relaxed overflow-x-auto p-1 font-medium max-h-40">
                  {JSON.stringify(selectedEvent.before_state || { status: selectedEvent.from_status || 'INITIAL' }, null, 2)}
                </pre>
              </div>

              {/* Right: After State (Green tone) */}
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-emerald-700 font-bold border-b border-emerald-100 pb-1">
                  <span>DỮ LIỆU SAU (AFTER)</span>
                  <span>{selectedEvent.to_status}</span>
                </div>
                <pre className="font-mono text-[10px] text-emerald-900 leading-relaxed overflow-x-auto p-1 font-medium max-h-40">
                  {JSON.stringify(selectedEvent.after_state, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Block 4: Legal Disclaimer Note (BR-45, UAT-10) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
            <Lock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Quy chuẩn lưu trữ bảo hành BR-45:</span>{' '}
              Hồ sơ dự án bảo hành phải được lưu trữ tối thiểu đến hết thời hạn bảo hành cộng <strong>5 năm</strong>. Hồ sơ có đánh dấu tranh chấp (<strong>Legal Hold</strong>) bị nghiêm cấm xóa vĩnh viễn theo Luật Thanh tra.
            </div>
          </div>
        </div>
      </div>

      {/* 6. MODAL: XEM ẢNH PHÓNG TO & METADATA HIỆN TRƯỜNG (LIGHTBOX MODAL) */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {activeImageModal.caption}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveImageModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[420px]">
              <img
                src={activeImageModal.url}
                alt={activeImageModal.caption}
                className="w-full h-auto max-h-[420px] object-contain"
              />
            </div>

            {/* EXIF Metadata Card */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Thời điểm ghi nhận:
                </span>
                <span className="font-mono font-semibold">{activeImageModal.captured_at}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Tọa độ GPS EXIF:
                </span>
                <span className="font-mono font-semibold text-brand-goldDark">{activeImageModal.gps_coordinates}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveImageModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Đóng ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: XUẤT NHẬT KÝ KIỂM TOÁN (EXPORT AUDIT LOG MODAL - FR-35, US-16, Điều 11.5) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-brand-gold" />
                <h3 className="text-base font-bold text-slate-900">
                  Xuất hồ sơ lịch sử hoạt động (RPT-10)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Chọn định dạng tệp xuất (FR-35, Điều 11.5):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat('PDF')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      exportFormat === 'PDF'
                        ? 'border-brand-gold bg-amber-50/50 text-brand-goldDark font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-red-600" />
                    <span>PDF Báo cáo pháp lý</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('CSV')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      exportFormat === 'CSV'
                        ? 'border-brand-gold bg-amber-50/50 text-brand-goldDark font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span>CSV Bảng kê sự kiện</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Phạm vi xuất:</span>
                  <span className="font-semibold text-slate-900">
                    {isPM
                      ? 'Dự án QL1A - Giai đoạn 2'
                      : selectedProject === 'all'
                      ? 'Toàn bộ các dự án hệ thống'
                      : projectList.find((p) => p.id === selectedProject)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Số lượng sự kiện:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {filteredEvents.length} sự kiện
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Thời điểm kết xuất:</span>
                  <span className="font-mono text-slate-900">
                    {new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {exportSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tệp hồ sơ kiểm toán RPT-10 đã được tải xuống thành công!</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 rounded-xl bg-brand-gold text-white text-xs font-semibold hover:bg-brand-goldDark transition-colors shadow-xs"
              >
                Tải xuống tệp {exportFormat}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditTrail
