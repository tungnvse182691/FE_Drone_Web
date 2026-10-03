import React, { useState, useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { mockAuditEvents, mockAuditStats } from '../../api/mock/data'
import { AuditEvent } from '../../types/domain'
import {
  ShieldCheck,
  History,
  Lock,
  Fingerprint,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ExternalLink,
  Database,
  GitCompare,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  Eye,
  Gavel,
  Zap,
  Code,
  Calendar,
  Layers,
  ArrowLeft,
  KeyRound,
  FileCheck
} from 'lucide-react'

export const AuditTrail: React.FC = () => {
  const { user } = useAuthStore()
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Dữ liệu sự kiện kiểm toán
  const [events] = useState<AuditEvent[]>(mockAuditEvents)
  const [selectedEventId, setSelectedEventId] = useState<string>(mockAuditEvents[0]?.id || '')

  // Bộ lọc
  const [selectedActor, setSelectedActor] = useState<string>('all')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedEntity, setSelectedEntity] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [quickFilter, setQuickFilter] = useState<'24h' | '7d' | 'month' | 'critical' | 'all'>('month')

  // Trạng thái tương tác
  const [copiedTrace, setCopiedTrace] = useState<boolean>(false)
  const [isVerifyingHash, setIsVerifyingHash] = useState<boolean>(false)
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false)
  const [verifyStep, setVerifyStep] = useState<number>(0)
  const [showExportModal, setShowExportModal] = useState<boolean>(false)
  const [exportFormat, setExportFormat] = useState<'CSV' | 'PDF'>('PDF')
  const [exportSuccess, setExportSuccess] = useState<boolean>(false)

  // Sự kiện đang được chọn để soi Diff
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0]
  }, [events, selectedEventId])

  // Lọc dữ liệu theo điều kiện
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Lọc theo người thao tác
      if (selectedActor !== 'all') {
        if (selectedActor === 'an' && ev.actor_name !== 'Nguyễn Văn An') return false
        if (selectedActor === 'hoang' && ev.actor_name !== 'Đỗ Quốc Hoàng') return false
        if (selectedActor === 'hung' && ev.actor_name !== 'Lê Văn Hùng') return false
        if (selectedActor === 'sys' && ev.actor_name !== 'Admin Hệ Thống') return false
      }

      // Lọc theo nhóm hành động
      if (selectedAction !== 'all' && ev.action_type !== selectedAction) {
        return false
      }

      // Lọc theo thực thể
      if (selectedEntity !== 'all' && ev.entity_type !== selectedEntity) {
        return false
      }

      // Lọc nhanh
      if (quickFilter === 'critical' && !ev.is_critical) {
        return false
      }

      // Tìm kiếm từ khóa
      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase()
        const matchTrace = ev.trace_id.toLowerCase().includes(q)
        const matchActor = ev.actor_name.toLowerCase().includes(q)
        const matchEntity = ev.entity_name.toLowerCase().includes(q)
        const matchAction = ev.action_label_vi.toLowerCase().includes(q)
        if (!matchTrace && !matchActor && !matchEntity && !matchAction) {
          return false
        }
      }

      return true
    })
  }, [events, selectedActor, selectedAction, selectedEntity, quickFilter, searchKeyword])

  // Hàm sao chép Trace ID
  const handleCopyTrace = (traceId: string) => {
    navigator.clipboard.writeText(traceId)
    setCopiedTrace(true)
    setTimeout(() => setCopiedTrace(false), 2000)
  }

  // Chạy xác thực chuỗi Hash
  const handleRunVerify = () => {
    setShowVerifyModal(true)
    setIsVerifyingHash(true)
    setVerifyStep(1)
    setTimeout(() => setVerifyStep(2), 700)
    setTimeout(() => setVerifyStep(3), 1400)
    setTimeout(() => {
      setVerifyStep(4)
      setIsVerifyingHash(false)
    }, 2000)
  }

  // Xử lý xuất file kiểm toán
  const handleExport = () => {
    setExportSuccess(true)
    setTimeout(() => {
      setExportSuccess(false)
      setShowExportModal(false)
    }, 1800)
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1720px] mx-auto w-full pb-16">
      {/* 1. TOP BREADCRUMB & INTEGRITY STATUS RIBBON */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 hover:text-brand-dark transition-colors">
            Trang chủ
          </span>
          <span>/</span>
          <span className="hover:text-brand-dark transition-colors">Báo cáo</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Nhật ký kiểm toán (Audit Trail)</span>
        </nav>

        {/* System Integrity Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="font-mono text-[11px] tracking-wide uppercase">
            HỆ THỐNG GHI NHẬN TOÀN VẸN (100% SHA-256 VERIFIED)
          </span>
        </div>
      </div>

      {/* 2. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-brand-goldDark font-mono text-xs font-semibold border border-amber-200">
              Mã báo cáo: RPT-10
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200">
              Cấp độ truy cập: READ-ONLY AUDIT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Nhật ký kiểm toán &amp; Truy vết chuỗi khối hệ thống (RPT-10)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hộp đen ghi nhận mọi thao tác biên tập dữ liệu, bảo mật bằng chuỗi mã băm SHA-256 bất biến phục vụ thanh tra và đối soát pháp lý (BR-45).
          </p>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRunVerify}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors border border-slate-200 shadow-xs"
          >
            <Gavel className="w-4 h-4 text-brand-gold" />
            <span>Xác thực chuỗi Hash</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-white font-semibold text-sm hover:bg-brand-goldDark transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Xuất nhật ký kiểm toán (CSV/PDF)</span>
          </button>
        </div>
      </div>

      {/* 3. 3 SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng số bản ghi (Log Volume)
              </span>
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                {mockAuditStats.total_records.toLocaleString()}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Database className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold">+{mockAuditStats.records_24h} thao tác</span>
              <span className="text-slate-500 font-normal">trong 24h qua</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              100% bản ghi bất biến (Immutable Ledger)
            </span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Thao tác nhạy cảm (Critical)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                  {mockAuditStats.critical_actions_count}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  Triage Cao
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
              <KeyRound className="w-4 h-4 text-brand-gold" />
              <span>Đã ký số điện tử Viettel-CA xác thực</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 truncate">
              Khóa tuyến (WF-02), Từ chối gói (WF-07), Kích hoạt Legal Hold
            </span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Xung đột &amp; Lỗi 412 (Concurrency)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                  0{mockAuditStats.concurrency_conflicts_count}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  Diff Merged
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <GitCompare className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-blue-800 font-medium">
              <History className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Snapshot tự động phục hồi</span>
              <span className="text-slate-500 font-normal">không mất mát</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Precondition Failed (HTTP 412) - Đã đối soát
            </span>
          </div>
        </Card>
      </div>

      {/* 4. FILTER BAR CONTAINER */}
      <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter 1: Actor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Người thao tác (Actor)</label>
            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              <option value="all">Tất cả nhân sự &amp; Bot</option>
              <option value="an">Nguyễn Văn An (Supervisor)</option>
              <option value="hoang">Đỗ Quốc Hoàng (PM Dự án)</option>
              <option value="hung">Lê Văn Hùng (Crew Lead)</option>
              <option value="sys">Admin Hệ Thống (Legal Admin)</option>
            </select>
          </div>

          {/* Filter 2: Action Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Nhóm hành động (Action Type)</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              <option value="all">Tất cả hành động</option>
              <option value="APPROVE_ITEM">Phê duyệt hạng mục (APPROVE_ITEM)</option>
              <option value="CLOSE_FAST_TRACK">Đóng Fast-Track (CLOSE_FAST_TRACK)</option>
              <option value="REJECT_PROPOSAL">Từ chối gói đề xuất (REJECT_PROPOSAL)</option>
              <option value="CONFIRM_ALIGNMENT">Khóa tim tuyến (CONFIRM_ALIGNMENT)</option>
              <option value="LOCK_LEGAL_HOLD">Khóa Legal Hold (LOCK_LEGAL_HOLD)</option>
              <option value="UPLOAD_EVIDENCE">Tải lên bằng chứng (UPLOAD_EVIDENCE)</option>
            </select>
          </div>

          {/* Filter 3: Entity Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Thực thể tác động (Entity)</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              <option value="all">Tất cả thực thể</option>
              <option value="WORK_PACKAGE_ITEM">Hạng mục gói (WorkPackageItem)</option>
              <option value="DEFECT">Hư hỏng khiếm khuyết (Defect)</option>
              <option value="PROPOSAL">Gói sửa chữa đề xuất (Proposal)</option>
              <option value="ALIGNMENT">Tim tuyến &amp; Phân đoạn (Alignment)</option>
              <option value="LEGAL_HOLD">Hồ sơ pháp lý (Legal Hold)</option>
              <option value="EVIDENCE">Bằng chứng hiện trường (Evidence)</option>
            </select>
          </div>

          {/* Filter 4: Keyword Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Tìm kiếm Trace ID / Từ khóa</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập tr-..., tên người, tên gói..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* Quick chips & Apply buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">Lọc nhanh:</span>
            <button
              type="button"
              onClick={() => setQuickFilter('24h')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                quickFilter === '24h'
                  ? 'bg-brand-navy text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              24 giờ qua
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('7d')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                quickFilter === '7d'
                  ? 'bg-brand-navy text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('month')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                quickFilter === 'month'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tháng này (T8/2026)
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter(quickFilter === 'critical' ? 'all' : 'critical')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                quickFilter === 'critical'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Chỉ xem Thao tác nhạy cảm</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedActor('all')
                setSelectedAction('all')
                setSelectedEntity('all')
                setSearchKeyword('')
                setQuickFilter('all')
              }}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Đặt lại bộ lọc
            </button>
            <div className="text-xs text-slate-500 font-medium font-mono">
              Đang hiển thị {filteredEvents.length} bản ghi
            </div>
          </div>
        </div>
      </Card>

      {/* 5. MAIN GRID: EVENT TABLE (LEFT 8 COLS) + DIFF INSPECTOR DRAWER (RIGHT 4 COLS) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Table Section (8 Columns) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Table Header Control */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-bold text-slate-900">
                Dòng sự kiện kiểm toán hệ thống
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                Hiển thị {filteredEvents.length} / {mockAuditStats.total_records.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chế độ kiểm toán pháp lý không thể đảo ngược (BR-45)</span>
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
                  <th className="py-3 px-4">Thời gian (GMT+7)</th>
                  <th className="py-3 px-3">Người thực hiện</th>
                  <th className="py-3 px-3">Hành động</th>
                  <th className="py-3 px-3">Đối tượng tác động</th>
                  <th className="py-3 px-3">Trace ID</th>
                  <th className="py-3 px-3">IP &amp; Thiết bị</th>
                  <th className="py-3 px-4 text-right">Biến động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Không tìm thấy bản ghi kiểm toán nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => {
                    const isSelected = ev.id === selectedEventId
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
                        {/* 1. Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-xs font-semibold text-slate-900">
                            {ev.timestamp_local}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            UTC: {ev.timestamp_utc.replace('T', ' ').replace('Z', '')}
                          </div>
                        </td>

                        {/* 2. Actor */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                              {ev.actor_initials}
                            </div>
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

                        {/* 3. Action */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-mono font-semibold ${ev.action_badge_style}`}
                          >
                            {ev.action_type}
                          </span>
                        </td>

                        {/* 4. Entity */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-900 truncate max-w-[170px]" title={ev.entity_name}>
                            {ev.entity_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {ev.entity_location || ev.entity_id}
                          </div>
                        </td>

                        {/* 5. Trace ID */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            {ev.trace_id}
                          </span>
                        </td>

                        {/* 6. IP & Device */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                          <div className="font-mono text-xs">{ev.ip_address}</div>
                          <div className="text-[10px] text-slate-400">{ev.device_info}</div>
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
                            <span>Diff JSON</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Cursor-based Pagination Footer (v2.2 convention) */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-700 font-medium">
                Hiển thị bản ghi từ{' '}
                <code className="font-mono font-bold text-brand-goldDark">
                  {filteredEvents[0]?.trace_id || 'tr-start'}
                </code>{' '}
                đến{' '}
                <code className="font-mono font-bold text-brand-goldDark">
                  {filteredEvents[filteredEvents.length - 1]?.trace_id || 'tr-end'}
                </code>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Cursor token: eyJpZCI6MTQ4MjAsInRzIjoxNzI0NjA2NTM1LCJyZXYiOiJ2MyJ9...
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

        {/* Diff Inspector Drawer Section (Right 4 Columns - Sticky) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-4 sticky top-20">
          {/* Drawer Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-gold text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  TRACE INSPECTION
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {selectedEvent.timestamp_local.split(' ')[0]}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Chi tiết biến động bản ghi
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500 font-medium">Trace:</span>
                <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-semibold">
                  {selectedEvent.trace_id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyTrace(selectedEvent.trace_id)}
                  className="p-1 text-slate-400 hover:text-brand-gold transition-colors"
                  title="Sao chép Trace ID"
                >
                  {copiedTrace ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Block 1: Entity & Actor Verification Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Thực thể đích:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedEvent.entity_type} ({selectedEvent.entity_id})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Người thẩm tra / Tác nhân:</span>
              <span className="font-semibold text-slate-900">
                {selectedEvent.actor_name} {selectedEvent.actor_role_label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Chữ ký số CA:</span>
              <span className="font-mono text-brand-goldDark font-semibold">
                {selectedEvent.digital_signature
                  ? `${selectedEvent.digital_signature.provider} ${selectedEvent.digital_signature.serial}`
                  : 'Xác thực hệ thống nội bộ'}
              </span>
            </div>
            {selectedEvent.change_reason && (
              <div className="flex flex-col gap-1 pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Lý do thay đổi nghiệp vụ:</span>
                <span className="text-slate-800 italic">
                  "{selectedEvent.change_reason}"
                </span>
              </div>
            )}
          </div>

          {/* Block 2: Visual Side-by-side JSON Diff */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <GitCompare className="w-4 h-4 text-slate-500" />
                So sánh trạng thái Diff (Before / After)
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                RFC-6902 Patch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Left: Before (Red tone) */}
              <div className="rounded-xl bg-red-50/70 border border-red-200 p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-red-700 font-bold border-b border-red-100 pb-1">
                  <span>DỮ LIỆU CŨ (BEFORE)</span>
                  <span>{selectedEvent.before_version || 'v1.0'}</span>
                </div>
                <pre className="font-mono text-[10px] text-red-900 leading-relaxed overflow-x-auto p-1 font-medium max-h-44">
                  {JSON.stringify(selectedEvent.before_state, null, 2)}
                </pre>
              </div>

              {/* Right: After (Green tone) */}
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-emerald-700 font-bold border-b border-emerald-100 pb-1">
                  <span>DỮ LIỆU MỚI (AFTER)</span>
                  <span>{selectedEvent.after_version || 'v1.1'}</span>
                </div>
                <pre className="font-mono text-[10px] text-emerald-900 leading-relaxed overflow-x-auto p-1 font-medium max-h-44">
                  {JSON.stringify(selectedEvent.after_state, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Block 3: Merkle / Blockchain Checksum Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-brand-gold" />
                Mã băm bất biến (SHA-256)
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                MERKLE TREE
              </span>
            </div>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 break-all select-all font-semibold leading-tight">
              {selectedEvent.sha256_checksum}
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Chuỗi liên kết Merkle Tree hợp lệ • Không bị can thiệp</span>
            </div>
          </div>

          {/* Block 4: Legal Disclaimer Note (BR-45) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
            <Lock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Quy chuẩn lưu trữ pháp lý:</span>{' '}
              Bản ghi kiểm toán tuân thủ quy tắc lưu trữ <strong>BR-45</strong> (tối thiểu hết bảo hành + 5 năm) và Nghị định 130/2018/NĐ-CP về chữ ký số. Hồ sơ có đánh dấu tranh chấp (Legal Hold) bị nghiêm cấm xóa vĩnh viễn.
            </div>
          </div>
        </div>
      </div>

      {/* 6. MODAL: XÁC THỰC CHUỖI HASH (HASH VERIFICATION MODAL) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-brand-gold" />
                <h3 className="text-base font-bold text-slate-900">
                  Xác thực tính toàn vẹn chuỗi băm (SHA-256)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <p className="text-slate-600">
                Hệ thống đang rà soát đối chiếu toàn bộ các nhánh Merkle Tree từ block khởi tạo đến bản ghi mới nhất:
              </p>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">1. Quét 14,820 bản ghi Ledger:</span>
                  {verifyStep >= 1 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Hoàn tất
                    </span>
                  ) : (
                    <span className="text-slate-400">Đang quét...</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">2. Tính toán lại Merkle Root Hash:</span>
                  {verifyStep >= 2 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Khớp 100%
                    </span>
                  ) : (
                    <span className="text-slate-400">Chờ...</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">3. Đối soát chữ ký số Viettel-CA:</span>
                  {verifyStep >= 3 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Hợp lệ
                    </span>
                  ) : (
                    <span className="text-slate-400">Chờ...</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">4. Rà soát Legal Hold &amp; BR-45:</span>
                  {verifyStep >= 4 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Đạt chuẩn
                    </span>
                  ) : (
                    <span className="text-slate-400">Chờ...</span>
                  )}
                </div>
              </div>

              {verifyStep >= 4 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    XÁC THỰC THÀNH CÔNG: Không có bất kỳ bản ghi nào bị thay đổi hoặc giả mạo. Toàn vẹn chuỗi đạt 100%.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: XUẤT NHẬT KÝ KIỂM TOÁN (EXPORT AUDIT LOG MODAL - FR-35, US-16) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-brand-gold" />
                <h3 className="text-base font-bold text-slate-900">
                  Xuất hồ sơ kiểm toán (RPT-10)
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
                <label className="text-slate-700 font-semibold">Chọn định dạng tệp xuất:</label>
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
                    <span>CSV Dữ liệu thô + Hash</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Số lượng bản ghi:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {filteredEvents.length} bản ghi
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mã băm SHA-256 Manifest:</span>
                  <span className="font-mono text-[10px] text-slate-700">b7a8...c491</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời điểm xuất:</span>
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
