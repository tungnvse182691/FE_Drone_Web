import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Milestone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileDown,
  Lock,
  Layers,
  MapPin,
  Camera,
  RotateCcw,
  X,
  Share2,
  Check,
  Sparkles,
  Fingerprint,
  Columns,
  Wrench,
  Truck,
  HardHat,
  Eye,
  AlertCircle,
  FileCheck,
  Send,
  Sliders,
  CheckSquare,
  Square,
  Award,
  Calendar,
  Building,
  ExternalLink,
  Printer
} from 'lucide-react'

// --- Interfaces for WF-08 ---
export type RepairTrackType = 'APPROVAL_TRACK' | 'FAST_TRACK' | 'EMERGENCY'
export type ItemReviewStatus = 'PENDING_INSPECTION' | 'ACCEPTED' | 'REWORK_REQUIRED' | 'CLOSED'

export interface CaseItem {
  id: string
  item_code: string
  defect_code: string
  title: string
  chainage: string
  status: ItemReviewStatus
  status_label: string
  track_type: RepairTrackType
  area_m2: number
  depth_cm: number
  before_image: string
  before_hash: string
  before_time: string
  before_gps: string
  before_source: string
  after_image: string
  after_hash: string
  after_time: string
  after_gps: string
  after_crew: string
  after_equipment: string
  rework_reason?: string
  rework_directives?: string[]
}

const INITIAL_CASE_ITEMS: CaseItem[] = [
  {
    id: 'item-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-2026-0089',
    title: 'Ổ gà làn R1 - Nguy cơ mất ATGT',
    chainage: 'Km 1024+350 (QL1A)',
    status: 'PENDING_INSPECTION',
    status_label: 'CHỜ NGHIỆM THU HIỆN TRƯỜNG',
    track_type: 'APPROVAL_TRACK',
    area_m2: 0.75,
    depth_cm: 6.5,
    before_image:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    before_hash: '8f4a29b19e23c0d8f07172ca9938d21e427184c7',
    before_time: '14:20 12/08/2026 (UTC+7)',
    before_gps: '16.054412 N, 108.202219 E (H: +14.2m)',
    before_source: 'Reporter - Người dân phản ánh qua Citizen App + Xác thực Drone Cam 04',
    after_image:
      'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=1200&q=80',
    after_hash: 'c3d788a4e89b21f00938b81ca742510f299104fa',
    after_time: '16:45 25/08/2026 (K98)',
    after_gps: '16.054414 N, 108.202218 E (Trùng khớp 99.8%)',
    after_crew: 'Đội thi công Crew 02 - Tổ máy rải Dynapac (Xí nghiệp QLĐB 2)',
    after_equipment: 'Xe lu Hamm HD12VV • BOMAG BF300 • Dynapac F1200CS'
  },
  {
    id: 'item-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-2026-0095',
    title: 'Vỡ mép thảm nhựa rỗng lề phải',
    chainage: 'Km 1024+410 (QL1A)',
    status: 'ACCEPTED',
    status_label: 'ĐÃ DUYỆT NGHIỆM THU',
    track_type: 'APPROVAL_TRACK',
    area_m2: 0.95,
    depth_cm: 7.0,
    before_image:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
    before_hash: '3e1a89b27f23c0d8f07172ca9938d21e4271991a',
    before_time: '15:10 12/08/2026 (UTC+7)',
    before_gps: '16.054710 N, 108.202510 E',
    before_source: 'Khảo sát Drone định kỳ đợt 3',
    after_image:
      'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80',
    after_hash: '9a8d77a4e89b21f00938b81ca742510f299188cd',
    after_time: '11:30 24/08/2026 (K98)',
    after_gps: '16.054712 N, 108.202509 E',
    after_crew: 'Tổ bảo dưỡng thường xuyên 01',
    after_equipment: 'Máy cắt bê tông Husqvarna • Lu rung dắt tay Sakai'
  },
  {
    id: 'item-03',
    item_code: '#ITEM-03',
    defect_code: 'DEF-2026-0096',
    title: 'Trám khe co giãn mố cầu chui dân sinh',
    chainage: 'Km 1024+450 (QL1A)',
    status: 'ACCEPTED',
    status_label: 'ĐÃ DUYỆT NGHIỆM THU',
    track_type: 'APPROVAL_TRACK',
    area_m2: 0.40,
    depth_cm: 4.0,
    before_image:
      'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=1200&q=80',
    before_hash: '7c8b29b19e23c0d8f07172ca9938d21e427166ea',
    before_time: '16:00 12/08/2026 (UTC+7)',
    before_gps: '16.055010 N, 108.202810 E',
    before_source: 'Đội tuần đường báo cáo khẩn',
    after_image:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    after_hash: '5f2c77a4e89b21f00938b81ca742510f299111ab',
    after_time: '14:15 23/08/2026',
    after_gps: '16.055011 N, 108.202809 E',
    after_crew: 'Đội sửa chữa cầu cống Cát Tường',
    after_equipment: 'Nồi nấu mastic bitum • Máy thổi bụi áp lực cao'
  }
]

export const EvidenceCloseoutDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Role detection
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Items State
  const [caseItems, setCaseItems] = useState<CaseItem[]>(INITIAL_CASE_ITEMS)
  const [selectedItemId, setSelectedItemId] = useState<string>('item-01')

  // Current active item
  const currentItem = useMemo(() => {
    return caseItems.find((i) => i.id === selectedItemId) || caseItems[0]
  }, [caseItems, selectedItemId])

  // View mode: 'split' (side-by-side) vs 'meta' (SHA-256 metadata overlay)
  const [viewMode, setViewMode] = useState<'split' | 'meta'>('split')

  // Citizen app publish checkbox state
  const [isCitizenAppPublishSelected, setIsCitizenAppPublishSelected] = useState(true)

  // Modals state
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false)
  const [reworkChecklist, setReworkChecklist] = useState({
    bond_coat: true,
    flatness_3m: false,
    temperature_slip: false,
    compaction_k98: false,
    other_defect: false
  })
  const [otherDefectText, setOtherDefectText] = useState('')
  const [reworkNotes, setReworkNotes] = useState(
    'Yêu cầu Đội Crew 02 dùng máy cắt lu lại vệt mép phía bên phải hướng Huế - Đà Nẵng, quét bổ sung nhũ tương CRS-1 và kiểm tra lại độ bằng phẳng bằng thước 3m trước 12:00 ngày mai.'
  )

  // Citizen App Publish Modal (PM action)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [publishHeadline, setPublishHeadline] = useState(
    'Hoàn tất khắc phục điểm ổ gà Km 1024+350 QL1A sau 24h phản ánh'
  )
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false)

  // Close Composite Case Modal
  const [isCloseCaseModalOpen, setIsCloseCaseModalOpen] = useState(false)
  const [isCaseClosed, setIsCaseClosed] = useState(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Check if all items in case are accepted
  const allItemsAccepted = useMemo(() => {
    return caseItems.every((item) => item.status === 'ACCEPTED')
  }, [caseItems])

  // Count accepted items
  const acceptedCount = useMemo(() => {
    return caseItems.filter((i) => i.status === 'ACCEPTED').length
  }, [caseItems])

  // --- Handlers ---
  const handleOpenReworkModal = () => {
    setIsReworkModalOpen(true)
  }

  const handleSubmitRework = () => {
    const selectedDirectives: string[] = []
    if (reworkChecklist.bond_coat)
      selectedDirectives.push('Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám (Bong tróc mép)')
    if (reworkChecklist.flatness_3m)
      selectedDirectives.push('Độ bằng phẳng thước 3m vượt quá dung sai (> 3mm)')
    if (reworkChecklist.temperature_slip)
      selectedDirectives.push('Thiếu phiếu cân và biên bản đo nhiệt độ thảm tại hiện trường')
    if (reworkChecklist.other_defect) {
      if (!otherDefectText.trim()) {
        showToast('Vui lòng nhập tên lỗi kỹ thuật phát sinh trước khi phát lệnh Rework!')
        return
      }
      selectedDirectives.push(`Lỗi phát sinh: ${otherDefectText.trim()}`)
    }

    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return {
            ...it,
            status: 'REWORK_REQUIRED',
            status_label: 'YÊU CẦU SỬA LẠI (REWORK)',
            rework_reason: reworkNotes,
            rework_directives: selectedDirectives
          }
        }
        return it
      })
    )

    setIsReworkModalOpen(false)
    showToast(
      `Đã phát Lệnh yêu cầu tái thi công (Rework) cho ${currentItem.item_code}! Trạng thái chuyển sang REWORK_REQUIRED.`
    )
  }

  // Chấp thuận nghiệm thu trực tiếp theo API Backend (POST /api/v1/repair-attempts/{id}/acceptance)
  const handleAcceptItem = () => {
    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return {
            ...it,
            status: 'ACCEPTED',
            status_label: 'ĐÃ NGHIỆM THU ĐẠT'
          }
        }
        return it
      })
    )
    showToast(`Đã chấp thuận nghiệm thu thành công hạng mục ${currentItem.item_code}!`)
  }

  // PM action: Close Fast Track item
  const handlePMCloseFastTrack = () => {
    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return {
            ...it,
            status: 'ACCEPTED',
            status_label: 'ĐÃ ĐÓNG (FAST-TRACK ACCEPTED)'
          }
        }
        return it
      })
    )
    showToast(`PM đã chấp thuận và đóng lỗi Fast Track thành công! Thông báo đã gửi tới Ban Giám sát.`)
  }

  // PM action: Publish to Citizen App
  const handleConfirmPublish = () => {
    setIsPublishModalOpen(false)
    setIsPublishedSuccess(true)
    showToast(`Đã công bố thành công kết quả khắc phục lên Citizen App & Cổng giao thông thông minh!`)
  }

  // Close Composite Case
  const handleConfirmCloseCase = () => {
    setIsCloseCaseModalOpen(false)
    setIsCaseClosed(true)
    showToast(`Đã đóng tổng thể vụ việc #CASE-2026-0842 thành công! Toàn bộ hồ sơ chuyển trạng thái LƯU TRỮ.`)
  }

  return (
    <div className="space-y-6 pb-20 text-[#1F2937]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP CONTEXT BAR & BREADCRUMB */}
      <section className="bg-white border border-[#E2E5E9] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Breadcrumb & Identity */}
          <div className="flex flex-col gap-1.5">
            <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                onClick={() => navigate(`${basePath}/dashboard`)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => navigate(`${basePath}/proposals`)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Sửa chữa &amp; Đề xuất
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">Nghiệm thu hồ sơ {currentItem.defect_code}</span>
            </nav>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sansation">
                Hồ sơ nghiệm thu kỹ thuật: {currentItem.defect_code}
              </h1>
              <span className="font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs">
                {currentItem.chainage}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Gói công việc PKG-2026-08 • Hạng mục {currentItem.item_code} • Tuyến QL1A (Km 1024 - Km 1045) • Phân đoạn:
              Thừa Thiên Huế - Đà Nẵng
            </p>
          </div>

          {/* Workflow badge */}
          <div className="flex items-center gap-2 self-start xl:self-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Quy trình kỹ thuật: WF-08 (Rà soát &amp; Nghiệm thu)</span>
            </div>
          </div>
        </div>

        {/* Status & Policy Indicator Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Track badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              NHÁNH: {currentItem.track_type}
            </span>

            {/* Status badge */}
            {currentItem.status === 'ACCEPTED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                TRẠNG THÁI: ĐÃ NGHIỆM THU ĐẠT
              </span>
            )}
            {currentItem.status === 'PENDING_INSPECTION' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                TRẠNG THÁI: CHỜ NGHIỆM THU HIỆN TRƯỜNG
              </span>
            )}
            {currentItem.status === 'REWORK_REQUIRED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                TRẠNG THÁI: YÊU CẦU SỬA LẠI (REWORK)
              </span>
            )}

            {/* SLA badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              SLA Nghiệm thu: Còn 18h
            </span>

            <span className="font-mono text-slate-500 text-[11px] px-3 py-1 bg-white rounded-full border border-slate-200 shadow-2xs">
              Mã kiểm tra: SHA256:7B8F..A49
            </span>
          </div>

          {/* Dynamic Role Actions Container */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Xuất PDF/A */}
            <button
              onClick={() => showToast(`Đang xuất biên bản nghiệm thu kỹ thuật ${currentItem.defect_code} sang PDF/A...`)}
              type="button"
              className="px-3.5 h-9 bg-white border border-[#E2E5E9] hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-slate-500" />
              <span>Xuất PDF/A</span>
            </button>

            {/* SUPERVISOR ACTIONS */}
            {isSupervisor && (
              <>
                <button
                  onClick={handleOpenReworkModal}
                  type="button"
                  className="px-3.5 h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Yêu cầu sửa lại (Rework)</span>
                </button>

                <button
                  onClick={handleAcceptItem}
                  disabled={currentItem.status === 'ACCEPTED'}
                  type="button"
                  className={`px-4 h-9 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 ${
                    currentItem.status === 'ACCEPTED'
                      ? 'bg-emerald-700 text-white cursor-default'
                      : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white hover:opacity-95 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {currentItem.status === 'ACCEPTED' ? 'Đã chấp thuận nghiệm thu' : 'Chấp thuận nghiệm thu'}
                  </span>
                </button>
              </>
            )}

            {/* PROJECT MANAGER ACTIONS */}
            {isPM && (
              <>
                {currentItem.track_type === 'FAST_TRACK' ? (
                  <button
                    onClick={handlePMCloseFastTrack}
                    type="button"
                    className="px-4 h-9 bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chấp thuận &amp; Đóng lỗi Fast Track</span>
                  </button>
                ) : currentItem.status !== 'ACCEPTED' ? (
                  <div className="relative group">
                    <button
                      disabled
                      type="button"
                      className="px-3.5 h-9 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Đợi Ban Giám sát nghiệm thu</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-medium">
                      Hạng mục thuộc nhánh APPROVAL_TRACK yêu cầu Supervisor nghiệm thu đạt trước khi PM được công bố.
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPublishModalOpen(true)}
                    type="button"
                    className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Công bố kết quả (Citizen App)</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Active Authority Micro-Banner */}
        <div className="text-xs text-slate-600 flex items-center gap-2 pt-1 font-medium">
          <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0" />
          {isSupervisor ? (
            <span>
              Thẩm quyền:{' '}
              <strong className="text-slate-900">Ban Giám sát độc lập (Supervisor)</strong> — Kiểm tra thông số kỹ
              thuật &amp; xác nhận nghiệm thu đạt chất lượng trước khi cho phép đóng gói hoàn công.
            </span>
          ) : (
            <span>
              Thẩm quyền:{' '}
              <strong className="text-slate-900">Project Manager (Điều phối &amp; Công bố)</strong> — Sau khi Giám sát
              nghiệm thu đạt, PM phát hành dữ liệu hiện trường lên Citizen App &amp; Hệ thống Đô thị Thông minh.
            </span>
          )}
        </div>
      </section>

      {/* COMPOSITE CASE ALERT (Mixed Case Closeout Banner) */}
      <section className="p-6 bg-white border border-[#E2E5E9] rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#C9A227]" />
              <h3 className="font-bold text-lg text-slate-900 font-sansation">
                Vụ việc phức hợp liên quan: #CASE-2026-0842
              </h3>
              {allItemsAccepted ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
                  ĐÃ HOÀN THÀNH 3/3 HẠNG MỤC
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs">
                  ĐÃ HOÀN THÀNH {acceptedCount}/3 HẠNG MỤC
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Phạm vi công trình: Đoạn Km 1024+350 - Km 1024+450 (Gói thầu bảo trì thường xuyên QL1A). Nghiệm thu toàn
              bộ các hạng mục sẽ cho phép đóng tổng thể vụ việc.
            </p>

            {/* List of items in this case for fast switching */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {caseItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                    selectedItemId === item.id
                      ? 'bg-[#FEF9E7] text-[#92700C] border border-[#FDE68A] shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {item.status === 'ACCEPTED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : item.status === 'REWORK_REQUIRED' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                  <span>
                    {item.item_code}: {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Close Composite Case Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCloseCaseModalOpen(true)}
              disabled={!allItemsAccepted || isCaseClosed}
              type="button"
              className={`px-4 h-10 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2 ${
                isCaseClosed
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : allItemsAccepted
                  ? 'border border-[#C9A227] text-[#92700C] bg-[#FEF9E7] hover:bg-[#FDF0CD] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <FileCheck className="w-4 h-4 text-[#C9A227]" />
              <span>
                {isCaseClosed ? 'Vụ việc đã được đóng tổng' : 'Đóng tổng thể vụ việc (Supervisor Closeout)'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          * Quy tắc kiểm soát: Nút sẽ tự động vô hiệu hóa nếu còn bất kỳ hạng mục nào dở dang (
          <span className="font-mono text-slate-700 font-bold">CASE_HAS_OPEN_REQUIRED_ITEMS = {!allItemsAccepted}</span>
          ).
        </p>
      </section>

      {/* BEFORE vs AFTER INTEGRITY AUDIT (SIDE-BY-SIDE PROOF) */}
      <section className="bg-white rounded-2xl p-6 border border-[#E2E5E9] shadow-sm space-y-4">
        {/* Section Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-sansation">
              <Camera className="w-5 h-5 text-[#C9A227]" />
              Đối chứng bằng chứng hình ảnh hiện trường (BEFORE vs AFTER Integrity Audit)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xác minh ảnh chụp gốc, tọa độ đo đạc không gian RTK và chữ ký số thiết bị máy rải/xe lu.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-2xs self-start sm:self-auto border border-slate-200">
            <button
              onClick={() => setViewMode('split')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Chế độ song song</span>
            </button>
            <button
              onClick={() => setViewMode('meta')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'meta' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Đối chiếu metadata SHA-256</span>
            </button>
          </div>
        </div>

        {/* Main Visual Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: BEFORE EVIDENCE */}
          <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#E2E5E9] shadow-xs">
            {/* Column Header */}
            <div className="p-3.5 bg-slate-50 border-b border-[#E2E5E9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
                  Ảnh trước sửa (BEFORE EVIDENCE)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                Ổ gà cấp 3 • Nguy cơ mất ATGT
              </span>
            </div>

            {/* Photo Container */}
            <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
              <img
                src={currentItem.before_image}
                alt="Hiện trạng ổ gà và nứt vỡ mặt đường trước khi thi công sửa chữa"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* HUD Overlays */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-900 shadow-xs flex items-center gap-1.5 border border-slate-200 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{currentItem.chainage}</span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                EXIF UNALTERED
              </div>

              {/* Expandable SHA-256 HUD Overlay (when viewMode === 'meta') */}
              <div
                className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/85 backdrop-blur-xs p-5 text-white flex flex-col justify-between ${
                  viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                    Bảo mật tệp &amp; Cảm biến hình ảnh
                  </span>
                  <p className="font-mono text-xs text-slate-200">Hash: {currentItem.before_hash}</p>
                  <p className="text-xs text-slate-300">
                    Độ phân giải gốc: 4032 × 3024 px (12.2 MP) • Tiêu cự: 26mm f/1.8
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                    Dữ liệu không gian RTK chuẩn
                  </span>
                  <p className="font-mono text-xs text-slate-200">{currentItem.before_gps}</p>
                  <p className="text-xs text-slate-300">
                    Vệ tinh: GPS + GLONASS (18 Sats lock) • Sai số đo đạc: ±1.8 cm
                  </p>
                </div>
              </div>
            </div>

            {/* Proof Metadata Box */}
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Milestone className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>
                  Nguồn ghi nhận: <strong className="text-slate-900 font-semibold">{currentItem.before_source}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Thời gian ghi nhận:</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.before_time}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Tọa độ GPS chuẩn:</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs">16.0544° N, 108.2022° E</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Kích thước ban đầu:</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    Sâu {currentItem.depth_cm} cm | S = {currentItem.area_m2} m²
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    PASS: 8f4a...29b1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AFTER EVIDENCE */}
          <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#E2E5E9] shadow-xs">
            {/* Column Header */}
            <div className="p-3.5 bg-slate-50 border-b border-[#E2E5E9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
                  Ảnh sau sửa (AFTER EVIDENCE)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Đã thảm nhựa C12.5 • Đạt lu lèn K98
              </span>
            </div>

            {/* Photo Container */}
            <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
              <img
                src={currentItem.after_image}
                alt="Mặt đường bê tông nhựa sau khi vá phẳng phiu, lu lèn chặt chẽ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* HUD Overlays */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-900 shadow-xs flex items-center gap-1.5 border border-slate-200 font-medium">
                <Wrench className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Crew 02 • Máy Dynapac F1200CS</span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                EXIF UNALTERED
              </div>

              {/* Expandable SHA-256 HUD Overlay (when viewMode === 'meta') */}
              <div
                className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/85 backdrop-blur-xs p-5 text-white flex flex-col justify-between ${
                  viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                    Chữ ký số thiết bị thi công
                  </span>
                  <p className="font-mono text-xs text-slate-200">Hash: {currentItem.after_hash}</p>
                  <p className="text-xs text-slate-300">
                    Độ phân giải: 4000 × 3000 px • Thiết bị: Cat S62 Pro Rugged Inspection
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                    Tọa độ hoàn công
                  </span>
                  <p className="font-mono text-xs text-slate-200">{currentItem.after_gps}</p>
                  <p className="text-xs text-slate-300">
                    Nhiệt độ thảm nhựa lúc rải: 148°C • Nhiệt độ sau lu lèn: 92°C
                  </p>
                </div>
              </div>
            </div>

            {/* Proof Metadata Box */}
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <HardHat className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>
                  Đơn vị thực hiện: <strong className="text-slate-900 font-semibold">{currentItem.after_crew}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Thời gian hoàn công:</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.after_time}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Trùng khớp vị trí:</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs">99.8% sai số &lt; 2cm</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Thiết bị thi công:</span>
                  <span className="font-semibold text-slate-900 text-xs truncate block" title={currentItem.after_equipment}>
                    {currentItem.after_equipment}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Toàn vẹn số:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    PASS: c3d7...88a4
                  </span>
                </div>
              </div>

              {/* Citizen app publish selector */}
              <label className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg">
                <input
                  type="checkbox"
                  checked={isCitizenAppPublishSelected}
                  onChange={(e) => setIsCitizenAppPublishSelected(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C9A227] accent-[#C9A227] focus:ring-[#C9A227]"
                />
                <span className="text-xs text-slate-800 font-semibold">
                  Chọn ảnh này làm ảnh chuẩn công bố cho ứng dụng dân cư (Citizen App &amp; Cổng thông tin giao thông)
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL SPECIFICATIONS & AUDIT CARD (4 METRIC BOXES) */}
      <section className="bg-white rounded-2xl p-6 border border-[#E2E5E9] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-sansation">
              <FileCheck className="w-5 h-5 text-[#C9A227]" />
              Biên bản nghiệm thu kỹ thuật &amp; Pháp lý hồ sơ hoàn công
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuỗi kiểm chứng chất lượng thi công theo quy chuẩn kỹ thuật quốc gia TCVN 8819:2011.
            </p>
          </div>
          <span className="font-mono text-xs px-3 py-1 bg-slate-100 rounded-full font-semibold border border-slate-200 text-slate-700">
            Tiêu chuẩn áp dụng: TCVN 8819 / 22 TCN 211-06
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
          {/* Metric 1: Kích thước & Khối lượng hoàn công */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">1. Khối lượng thi công</span>
                <Wrench className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                0.75 m² <span className="text-xs font-normal text-slate-500">(Cắt vuông vắn)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Quy cách cào bóc: Sâu 6.5 cm (vượt chiều sâu khuyết tật 0.5 cm để triệt tiêu nứt ngầm chân móng).
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
              <span className="font-bold block text-[#92700C]">Vật liệu sử dụng:</span>
              <div>• Bê tông nhựa nóng C12.5: <strong>165 kg</strong></div>
              <div>• Nhũ tương dính bám CRS-1: <strong>0.5 kg/m²</strong></div>
            </div>
          </div>

          {/* Metric 2: Toàn vẹn dữ liệu & Pháp lý số */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">2. Tính toàn vẹn số</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-emerald-800 flex items-center gap-1.5">
                <span>PASS</span>
                <span className="text-xs font-normal text-slate-500">(Chữ ký số hợp lệ)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Checksum SHA-256 đối chiếu khớp 100% thời gian thực. Không phát hiện chỉnh sửa metadata.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Quy tắc thẩm quyền chuỗi:</span>
              <span>Đã lưu → Phân loại → Giao việc → Đã sửa → <strong className="text-emerald-700">ĐANG DUYỆT</strong> → Đã công bố.</span>
            </div>
          </div>

          {/* Metric 3: Chỉ số kỹ thuật đo đạc nghiệm thu */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">3. Đo đạc nghiệm thu</span>
                <Sliders className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                K = 0.985 <span className="text-xs font-semibold text-emerald-700">(Đạt K ≥ 0.98)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Kiểm tra độ bằng phẳng thước 3m: Khe hở lớn nhất đạt ≤ 2.5mm (Giới hạn cho phép: 3.0mm).
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Độ nhám mặt đường:</span>
              <span>Phương pháp rắc cát: <strong>0.65 mm</strong> (Đạt tiêu chuẩn an toàn cao tốc).</span>
            </div>
          </div>

          {/* Metric 4: Đánh giá & Cam kết bảo hành */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">4. Bảo hành &amp; Pháp nhân</span>
                <Award className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                12 Tháng <span className="text-xs font-normal text-slate-500">(Đến 30/08/2027)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Cam kết bảo hành kết cấu vá ổ gà, chống lún vệt bánh xe và bong tróc mép mối nối.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Đơn vị chịu trách nhiệm:</span>
              <span>Xí nghiệp Quản lý Đường bộ 2 (Nhà thầu phụ trách tuyến Km1024 - Km1045).</span>
            </div>
          </div>
        </div>

        {/* Signatures & Authority Sign-off block */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#FEF9E7] text-[#92700C] border border-[#FDE68A] shadow-xs">
              H
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="font-bold text-sm text-slate-900 font-sansation">Kỹ sư Hoàng Hải (ID: GS-2041)</div>
              <div className="text-slate-600">Kỹ sư Giám sát trưởng hiện trường • Ban Quản lý Hạ tầng Miền Trung</div>
              <div className="font-mono text-[11px] text-purple-800">
                Chứng thư số Viettel-CA: CN=HOANG HAI, OU=SUPERVISOR, SERIAL=54:02:11:AB:89
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Trạng thái xác thực</span>
              <span className="text-xs text-emerald-800 font-semibold px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                {currentItem.status === 'ACCEPTED' ? 'Đã ký số xác thực thành công' : 'Khóa điện tử sẵn sàng'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: REWORK REQUEST MODAL                                            */}
      {/* ========================================================================= */}
      {isReworkModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsReworkModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base font-sansation">Lập lệnh yêu cầu tái thi công (Rework Order)</h3>
              </div>
              <button
                onClick={() => setIsReworkModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Hạng mục đối chiếu:</span>
                <p className="text-slate-600 leading-relaxed">
                  {currentItem.item_code}: {currentItem.title} - {currentItem.chainage}. Hồ sơ sẽ được chuyển ngược về{' '}
                  <strong className="text-slate-900">{currentItem.after_crew}</strong> kèm ghi chú kỹ thuật.
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 block">Danh mục lỗi kỹ thuật cần khắc phục:</label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.bond_coat}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, bond_coat: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám (Bong tróc mép)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.flatness_3m}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, flatness_3m: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Độ bằng phẳng thước 3m vượt quá dung sai (&gt; 3mm)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.temperature_slip}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, temperature_slip: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Thiếu phiếu cân và biên bản đo nhiệt độ thảm tại hiện trường</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.compaction_k98}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, compaction_k98: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Độ chặt lu lèn móng K98 chưa đạt chứng chỉ kiểm định</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer pt-1 border-t border-slate-200/80">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.other_defect}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, other_defect: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span className="font-semibold text-rose-700">Lỗi kỹ thuật khác ngoài danh mục</span>
                  </label>

                  {reworkChecklist.other_defect && (
                    <div className="pl-6 pt-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Nhập tên lỗi kỹ thuật phát sinh (VD: Biển báo hư hỏng, rác thi công chưa dọn...)"
                        value={otherDefectText}
                        onChange={(e) => setOtherDefectText(e.target.value)}
                        className={`w-full px-3 py-2 text-xs bg-white rounded-lg border text-slate-800 font-medium focus:outline-none transition ${
                          !otherDefectText.trim()
                            ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-400'
                            : 'border-slate-300 focus:ring-2 focus:ring-[#C9A227]'
                        }`}
                        autoFocus
                      />
                      {!otherDefectText.trim() && (
                        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Bắt buộc nhập tên lỗi kỹ thuật phát sinh mới được phát lệnh.</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes textarea */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 block">Ý kiến chỉ đạo của Kỹ sư Giám sát:</label>
                <textarea
                  rows={3}
                  value={reworkNotes}
                  onChange={(e) => setReworkNotes(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Lưu ý: Phát lệnh Rework sẽ tự động hạ trạng thái hồ sơ về "REWORK_REQUIRED" và gia hạn thêm SLA hoàn công
                  24 giờ cho nhà thầu.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsReworkModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitRework}
                disabled={
                  (reworkChecklist.other_defect && !otherDefectText.trim()) ||
                  (!reworkChecklist.bond_coat &&
                    !reworkChecklist.flatness_3m &&
                    !reworkChecklist.temperature_slip &&
                    !reworkChecklist.compaction_k98 &&
                    !reworkChecklist.other_defect)
                }
                type="button"
                className={`px-5 h-9 transition rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 ${
                  (reworkChecklist.other_defect && !otherDefectText.trim()) ||
                  (!reworkChecklist.bond_coat &&
                    !reworkChecklist.flatness_3m &&
                    !reworkChecklist.temperature_slip &&
                    !reworkChecklist.compaction_k98 &&
                    !reworkChecklist.other_defect)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                }`}
                title={
                  reworkChecklist.other_defect && !otherDefectText.trim()
                    ? 'Bắt buộc nhập tên lỗi kỹ thuật phát sinh'
                    : undefined
                }
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát lệnh Rework (Tạo Work Order bù)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CITIZEN APP PUBLISH PREVIEW MODAL (PM ACTION)                   */}
      {/* ========================================================================= */}
      {isPublishModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsPublishModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-blue-50 border-b border-blue-200 text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base font-sansation">
                  Công bố kết quả sửa chữa lên Citizen App &amp; Cổng giao thông
                </h3>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: Preview card on Citizen App */}
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Tiêu đề bản tin công bố cho người dân:</label>
                <input
                  type="text"
                  value={publishHeadline}
                  onChange={(e) => setPublishHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Citizen App Mobile Card Preview */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-blue-700">Citizen App • Bản tin giao thông</span>
                  <span>Vừa xong</span>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 relative bg-black">
                  <img
                    src={currentItem.after_image}
                    alt="Kết quả sau khi hoàn thành"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                    ✓ ĐÃ XỬ LÝ XONG
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{publishHeadline}</h4>
                  <p className="text-slate-600 text-xs">
                    Vị trí: {currentItem.chainage} • Nhà thầu Cát Tường đã hoàn thành thảm lại bê tông nhựa phẳng phiu, đảm
                    bảo an toàn giao thông cho người dân. Cảm ơn phản ánh của cộng đồng!
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmPublish}
                type="button"
                className="px-5 h-9 bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Phát hành công bố ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CLOSE COMPOSITE CASE MODAL                                      */}
      {/* ========================================================================= */}
      {isCloseCaseModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsCloseCaseModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden z-10 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <FileCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-900 font-sansation">Đóng tổng thể vụ việc phức hợp</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toàn bộ <strong className="text-slate-900">3/3 hạng mục</strong> trong vụ việc{' '}
                <strong className="text-slate-900">#CASE-2026-0842</strong> đã được nghiệm thu đạt chất lượng. Xác nhận
                đóng hồ sơ và lưu trữ bảo hành?
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Mã vụ việc:</span>
                <span className="font-mono font-bold text-slate-900">#CASE-2026-0842</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng diện tích khắc phục:</span>
                <span className="font-mono font-bold text-[#92700C]">2.10 m²</span>
              </div>
              <div className="flex justify-between">
                <span>Thời hạn bảo hành:</span>
                <span className="font-semibold text-slate-900">12 tháng (đến 30/08/2027)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsCloseCaseModalOpen(false)}
                type="button"
                className="w-1/2 h-10 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmCloseCase}
                type="button"
                className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-bold text-xs shadow-sm cursor-pointer"
              >
                Xác nhận đóng vụ việc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
