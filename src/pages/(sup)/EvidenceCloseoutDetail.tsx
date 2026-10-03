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
  SlidersHorizontal,
  CheckSquare,
  Square,
  Award,
  Calendar,
  Building,
  ExternalLink,
  Printer,
  Download,
  FileArchive,
  Hash,
  UserCheck,
  History,
  Info
} from 'lucide-react'

// --- Interfaces theo Backend v2.2 (WF-08) ---
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
  attempt_number: number
  area_m2: number
  depth_cm: number
  volume_btn_c125_kg: number
  tack_coat_crs1: string
  compaction_k98: number
  flatness_3m_gap_mm: number
  sand_patch_roughness_mm: number
  pave_temp_c: number
  compact_temp_c: number
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
  evidence_integrity_status: 'VERIFIED' | 'PENDING' | 'INTEGRITY_FAILED'
  citizen_published: boolean
  rework_reason?: string
  rework_directives?: string[]
}

// Đồng bộ Mock Data theo Dự án PRJ-QL1A-02, Gói PKG-2026-08, Vụ việc #CASE-2026-0842
const INITIAL_CASE_ITEMS: CaseItem[] = [
  {
    id: 'item-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-2026-0089',
    title: 'Ổ gà làn R1 - Nguy cơ mất an toàn giao thông',
    chainage: 'Km 1024+350 (QL1A)',
    status: 'PENDING_INSPECTION',
    status_label: 'CHỜ NGHIỆM THU HIỆN TRƯỜNG',
    track_type: 'APPROVAL_TRACK',
    attempt_number: 1,
    area_m2: 0.75,
    depth_cm: 6.5,
    volume_btn_c125_kg: 165,
    tack_coat_crs1: '0.5 kg/m²',
    compaction_k98: 0.985,
    flatness_3m_gap_mm: 2.2,
    sand_patch_roughness_mm: 0.65,
    pave_temp_c: 148,
    compact_temp_c: 92,
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
    after_equipment: 'Xe lu Hamm HD12VV • BOMAG BF300 • Dynapac F1200CS',
    evidence_integrity_status: 'VERIFIED',
    citizen_published: false
  },
  {
    id: 'item-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-2026-0095',
    title: 'Vỡ mép thảm nhựa rỗng lề phải',
    chainage: 'Km 1024+410 (QL1A)',
    status: 'ACCEPTED',
    status_label: 'ĐÃ NGHIỆM THU ĐẠT',
    track_type: 'APPROVAL_TRACK',
    attempt_number: 1,
    area_m2: 0.95,
    depth_cm: 7.0,
    volume_btn_c125_kg: 210,
    tack_coat_crs1: '0.6 kg/m²',
    compaction_k98: 0.988,
    flatness_3m_gap_mm: 2.0,
    sand_patch_roughness_mm: 0.68,
    pave_temp_c: 152,
    compact_temp_c: 95,
    before_image:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
    before_hash: '3e1a89b27f23c0d8f07172ca9938d21e4271991a',
    before_time: '15:10 12/08/2026 (UTC+7)',
    before_gps: '16.054710 N, 108.202510 E',
    before_source: 'Khảo sát Drone định kỳ đợt 3 (Mission 03)',
    after_image:
      'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80',
    after_hash: '9a8d77a4e89b21f00938b81ca742510f299188cd',
    after_time: '11:30 24/08/2026 (K98)',
    after_gps: '16.054712 N, 108.202509 E',
    after_crew: 'Tổ bảo dưỡng thường xuyên 01 - Hoàng Hải',
    after_equipment: 'Máy cắt bê tông Husqvarna • Lu rung dắt tay Sakai',
    evidence_integrity_status: 'VERIFIED',
    citizen_published: true
  },
  {
    id: 'item-03',
    item_code: '#ITEM-03',
    defect_code: 'DEF-2026-0096',
    title: 'Trám khe co giãn mố cầu chui dân sinh',
    chainage: 'Km 1024+450 (QL1A)',
    status: 'ACCEPTED',
    status_label: 'ĐÃ NGHIỆM THU ĐẠT',
    track_type: 'APPROVAL_TRACK',
    attempt_number: 1,
    area_m2: 0.40,
    depth_cm: 4.0,
    volume_btn_c125_kg: 85,
    tack_coat_crs1: 'Mastic chèn khe',
    compaction_k98: 0.99,
    flatness_3m_gap_mm: 1.5,
    sand_patch_roughness_mm: 0.7,
    pave_temp_c: 160,
    compact_temp_c: 105,
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
    after_crew: 'Đội sửa chữa cầu cống Hoàng Hải',
    after_equipment: 'Nồi nấu mastic bitum • Máy thổi bụi áp lực cao',
    evidence_integrity_status: 'VERIFIED',
    citizen_published: true
  },
  {
    id: 'item-04',
    item_code: '#ITEM-04',
    defect_code: 'DEF-2026-0102',
    title: 'Nứt lưới nhỏ nông đầu cống thoát nước',
    chainage: 'Km 1024+380 (QL1A)',
    status: 'PENDING_INSPECTION',
    status_label: 'CHỜ PM XỬ LÝ FAST TRACK',
    track_type: 'FAST_TRACK',
    attempt_number: 1,
    area_m2: 0.35,
    depth_cm: 2.0,
    volume_btn_c125_kg: 50,
    tack_coat_crs1: 'Nhũ tương Cationic',
    compaction_k98: 0.982,
    flatness_3m_gap_mm: 1.8,
    sand_patch_roughness_mm: 0.62,
    pave_temp_c: 140,
    compact_temp_c: 88,
    before_image:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    before_hash: '4d1b89a29e23c0d8f07172ca9938d21e427177ab',
    before_time: '08:30 13/08/2026 (UTC+7)',
    before_gps: '16.054550 N, 108.202350 E',
    before_source: 'Tuần kiểm tra hiện trường PM',
    after_image:
      'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=1200&q=80',
    after_hash: '7a1d55b4e89b21f00938b81ca742510f299199fa',
    after_time: '15:10 25/08/2026',
    after_gps: '16.054551 N, 108.202349 E',
    after_crew: 'Tổ cơ động Fast Track 01',
    after_equipment: 'Máy phun nhũ tương áp lực • Lu dắt tay',
    evidence_integrity_status: 'VERIFIED',
    citizen_published: false
  }
]

export const EvidenceCloseoutDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Chế độ xem vai trò (mặc định theo role đăng nhập, hỗ trợ Switcher như Stitch 11)
  const [activeRoleView, setActiveRoleView] = useState<'SUPERVISOR' | 'PROJECT_MANAGER'>(
    user?.role === RoleCode.SUPERVISOR ? 'SUPERVISOR' : 'PROJECT_MANAGER'
  )

  const isSupervisorView = activeRoleView === 'SUPERVISOR'
  const isPMView = activeRoleView === 'PROJECT_MANAGER'
  const basePath = isSupervisorView ? '/sup' : '/pm'

  // Items State
  const [caseItems, setCaseItems] = useState<CaseItem[]>(INITIAL_CASE_ITEMS)
  const [selectedItemId, setSelectedItemId] = useState<string>('item-01')

  // Current active item
  const currentItem = useMemo(() => {
    return caseItems.find((i) => i.id === selectedItemId) || caseItems[0]
  }, [caseItems, selectedItemId])

  // View mode: 'split' (side-by-side) vs 'slider' (curtain swipe) vs 'meta' (SHA-256 metadata overlay)
  const [viewMode, setViewMode] = useState<'split' | 'slider' | 'meta'>('split')
  const [sliderPosition, setSliderPosition] = useState<number>(50)

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

  // Export Dossier RPT-07 Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'PDF_A' | 'ZIP_PACKAGE'>('PDF_A')
  const [isExporting, setIsExporting] = useState(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Bất biến: Kiểm tra xem toàn bộ các hạng mục đã hoàn thành nghiệm thu chưa (BR-25, BR-26, BR-48)
  const allItemsAccepted = useMemo(() => {
    return caseItems.every((item) => item.status === 'ACCEPTED' || item.status === 'CLOSED')
  }, [caseItems])

  // Đếm số hạng mục đã hoàn thành
  const acceptedCount = useMemo(() => {
    return caseItems.filter((i) => i.status === 'ACCEPTED' || i.status === 'CLOSED').length
  }, [caseItems])

  // --- Handlers Nghiệp Vụ Chuẩn Backend v2.2 ---

  // 1. Lập lệnh Rework (POST /api/v1/repair-attempts/{id}/acceptance với reviewResult: "REWORK_REQUIRED")
  const handleSubmitRework = () => {
    const selectedDirectives: string[] = []
    if (reworkChecklist.bond_coat)
      selectedDirectives.push('Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám (Bong tróc mép)')
    if (reworkChecklist.flatness_3m)
      selectedDirectives.push('Độ bằng phẳng thước 3m vượt quá dung sai (> 3mm)')
    if (reworkChecklist.temperature_slip)
      selectedDirectives.push('Thiếu phiếu cân và biên bản đo nhiệt độ thảm tại hiện trường')
    if (reworkChecklist.compaction_k98)
      selectedDirectives.push('Độ chặt lu lèn móng K98 chưa đạt chứng chỉ kiểm định')
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

  // 2. Supervisor: Chấp thuận nghiệm thu (POST /api/v1/repair-attempts/{id}/acceptance với reviewResult: "ACCEPTED")
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
    showToast(`Supervisor đã chấp thuận nghiệm thu thành công hạng mục ${currentItem.item_code} (Xác thực toàn vẹn SHA-256)!`)
  }

  // 3. PM: Chấp thuận & Đóng lỗi Fast Track (POST /api/v1/repair-attempts/{id}/review với reviewResult: "ACCEPTED")
  const handlePMCloseFastTrack = () => {
    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return {
            ...it,
            status: 'ACCEPTED',
            status_label: 'ĐÃ ĐÓNG (FAST-TRACK RESOLVED)'
          }
        }
        return it
      })
    )
    showToast(`PM đã chấp thuận và đóng lỗi Fast Track ${currentItem.item_code}! Lỗi chuyển trạng thái RESOLVED, thông báo đã gửi Giám sát.`)
  }

  // 4. PM: Trình Supervisor nghiệm thu (POST /api/v1/repair-attempts/{id}/review với reviewResult: "SUBMIT_TO_SUPERVISOR")
  const handlePMSubmitToSupervisor = () => {
    showToast(`PM đã xác nhận đủ điều kiện và trình hồ sơ ${currentItem.item_code} lên Ban Giám sát nghiệm thu!`)
  }

  // 5. PM: Công bố kết quả sửa chữa cho người dân (POST /api/v1/cases/{caseId}/publish)
  const handleConfirmPublish = () => {
    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return { ...it, citizen_published: true }
        }
        return it
      })
    )
    setIsPublishModalOpen(false)
    setIsPublishedSuccess(true)
    showToast(`Đã công bố thành công kết quả khắc phục lên Citizen App & Cổng thông tin giao thông!`)
  }

  // 6. Supervisor: Đóng tổng thể vụ việc phức hợp (POST /api/v1/cases/{caseId}/close)
  const handleConfirmCloseCase = () => {
    if (!allItemsAccepted) {
      showToast('Lỗi CASE_HAS_OPEN_REQUIRED_ITEMS: Không thể đóng tổng vụ việc khi còn hạng mục dở dang!')
      return
    }
    setIsCloseCaseModalOpen(false)
    setIsCaseClosed(true)
    showToast(`Đã đóng tổng thể vụ việc #CASE-2026-0842 thành công! Toàn bộ hồ sơ đã được khóa cứng và lưu trữ bảo hành.`)
  }

  // 7. Xuất hồ sơ bằng chứng số RPT-07 (POST /api/v1/exports)
  const handleTriggerExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setIsExportModalOpen(false)
      showToast(
        exportFormat === 'PDF_A'
          ? `Đã tạo tệp PDF/A thành công: Bien_Ban_Nghiem_Thu_${currentItem.defect_code}_TCVN8819.pdf!`
          : `Đã đóng gói tệp nén ZIP: Dossier_${currentItem.defect_code}_SHA256_Verified.zip (Kèm file checksum.sha256)!`
      )
    }, 1200)
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
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP CONTEXT BAR & BREADCRUMB */}
      <section className="bg-white border border-[#E2E5E9] rounded-2xl p-6 shadow-xs space-y-4">
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
                Gói đề xuất sửa chữa
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
              Dự án: <strong className="text-slate-800">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</strong> • Gói đề xuất: <strong className="text-slate-800">PKG-2026-08</strong> • Hạng mục: <strong className="text-[#92700C]">{currentItem.item_code}</strong> • Phân đoạn: Thừa Thiên Huế - Đà Nẵng
            </p>
          </div>

          {/* Role Switcher Widget (Theo thiết kế chuẩn Stitch 11) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-2xs border border-slate-200" role="tablist">
              <button
                onClick={() => setActiveRoleView('SUPERVISOR')}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSupervisorView
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>[Chế độ: Supervisor]</span>
              </button>
              <button
                onClick={() => setActiveRoleView('PROJECT_MANAGER')}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isPMView
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>[Chế độ: PM]</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Quy trình WF-08</span>
            </div>
          </div>
        </div>

        {/* Status & Policy Indicator Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Track badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold shadow-2xs border ${
                currentItem.track_type === 'APPROVAL_TRACK'
                  ? 'bg-purple-100 text-purple-900 border-purple-200'
                  : currentItem.track_type === 'FAST_TRACK'
                  ? 'bg-sky-100 text-sky-900 border-sky-200'
                  : 'bg-rose-100 text-rose-900 border-rose-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              NHÁNH: {currentItem.track_type}
            </span>

            {/* Status badge */}
            {currentItem.status === 'ACCEPTED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                TRẠNG THÁI: {currentItem.status_label}
              </span>
            )}
            {currentItem.status === 'PENDING_INSPECTION' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                TRẠNG THÁI: {currentItem.status_label}
              </span>
            )}
            {currentItem.status === 'REWORK_REQUIRED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                TRẠNG THÁI: YÊU CẦU SỬA LẠI (REWORK)
              </span>
            )}

            {/* Attempt badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs">
              <History className="w-3 h-3" />
              Lần thi công: #{currentItem.attempt_number}
            </span>

            {/* SLA badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              SLA Nghiệm thu: Còn 18h
            </span>

            <span className="font-mono text-slate-500 text-[11px] px-3 py-1 bg-white rounded-full border border-slate-200 shadow-2xs">
              Mã băm SHA-256: 7B8F..A49
            </span>
          </div>

          {/* Dynamic Role Actions Container */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Nút Xuất Hồ Sơ Bằng Chứng RPT-07 */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              type="button"
              className="px-3.5 h-9 bg-white border border-[#E2E5E9] hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#C9A227]" />
              <span>Xuất hồ sơ (RPT-07)</span>
            </button>

            {/* SUPERVISOR ACTIONS */}
            {isSupervisorView && (
              <>
                <button
                  onClick={() => setIsReworkModalOpen(true)}
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
                  className={`px-4 h-9 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 ${
                    currentItem.status === 'ACCEPTED'
                      ? 'bg-emerald-700 text-white cursor-default'
                      : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white hover:opacity-95 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {currentItem.status === 'ACCEPTED' ? 'Đã nghiệm thu (Ký số)' : 'Chấp thuận nghiệm thu (Ký số)'}
                  </span>
                </button>
              </>
            )}

            {/* PROJECT MANAGER ACTIONS */}
            {isPMView && (
              <>
                {currentItem.track_type === 'FAST_TRACK' ? (
                  <button
                    onClick={handlePMCloseFastTrack}
                    disabled={currentItem.status === 'ACCEPTED'}
                    type="button"
                    className={`px-4 h-9 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer ${
                      currentItem.status === 'ACCEPTED'
                        ? 'bg-emerald-700 text-white cursor-default'
                        : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {currentItem.status === 'ACCEPTED' ? 'Fast Track đã đóng' : 'Chấp thuận & Đóng lỗi Fast Track'}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePMSubmitToSupervisor}
                      type="button"
                      className="px-3.5 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-purple-700" />
                      <span>Trình Supervisor nghiệm thu</span>
                    </button>

                    {currentItem.status !== 'ACCEPTED' ? (
                      <div className="relative group">
                        <button
                          disabled
                          type="button"
                          className="px-3.5 h-9 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Đợi Giám sát nghiệm thu</span>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-medium">
                          Hạng mục APPROVAL_TRACK yêu cầu Supervisor duyệt đạt mới được phép công bố cho người dân.
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsPublishModalOpen(true)}
                        type="button"
                        className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{currentItem.citizen_published ? 'Đã công bố (Cập nhật)' : 'Công bố kết quả (Citizen App)'}</span>
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Active Authority Micro-Banner */}
        <div className="text-xs text-slate-600 flex items-center gap-2 pt-1 font-medium">
          <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0" />
          {isSupervisorView ? (
            <span>
              Thẩm quyền: <strong className="text-slate-900">Ban Giám sát độc lập (Supervisor)</strong> — Bắt buộc ký số PKI &amp; kiểm tra các chỉ tiêu kỹ thuật TCVN 8819 (Độ chặt K98, độ phẳng thước 3m) trước khi cho phép đóng gói hoàn công.
            </span>
          ) : (
            <span>
              Thẩm quyền: <strong className="text-slate-900">Project Manager (PM Chỉ huy trưởng)</strong> — Trực tiếp đóng lỗi nhánh Fast Track trong 48h; đối với nhánh Approval Track, PM kiểm tra hiện trường, trình Giám sát duyệt rồi phát hành dữ liệu lên Citizen App.
            </span>
          )}
        </div>
      </section>

      {/* COMPOSITE CASE ALERT (Mixed Case Closeout Banner) */}
      <section className="p-6 bg-white border border-[#E2E5E9] rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#C9A227]" />
              <h3 className="font-bold text-lg text-slate-900 font-sansation">
                Vụ việc phức hợp liên quan: #CASE-2026-0842
              </h3>
              {isCaseClosed ? (
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold border border-slate-700 shadow-2xs">
                  ✓ HỒ SƠ ĐÃ ĐÓNG TỔNG THỂ &amp; LƯU TRỮ PHÁP LÝ
                </span>
              ) : allItemsAccepted ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
                  ĐÃ HOÀN THÀNH {acceptedCount}/{caseItems.length} HẠNG MỤC (ĐỦ ĐIỀU KIỆN ĐÓNG VỤ VIỆC)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs">
                  ĐÃ HOÀN THÀNH {acceptedCount}/{caseItems.length} HẠNG MỤC
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Phạm vi công trình: Đoạn Km 1024+350 - Km 1024+450 (Gói bảo trì QL1A PKG-2026-08). Nghiệm thu toàn bộ các hạng mục thành phần sẽ cho phép Supervisor bấm Đóng tổng thể vụ việc.
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
                    {item.item_code}: {item.title} ({item.track_type === 'FAST_TRACK' ? 'Fast Track' : 'Approval'})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Close Composite Case Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            {isSupervisorView ? (
              <button
                onClick={() => setIsCloseCaseModalOpen(true)}
                disabled={!allItemsAccepted || isCaseClosed}
                type="button"
                className={`px-4 h-10 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2 ${
                  isCaseClosed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : allItemsAccepted
                    ? 'border border-[#C9A227] text-[#92700C] bg-[#FEF9E7] hover:bg-[#FDF0CD] cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
                title={
                  !allItemsAccepted
                    ? 'Chặn đóng tổng theo quy tắc CASE_HAS_OPEN_REQUIRED_ITEMS: Phải nghiệm thu 100% hạng mục'
                    : undefined
                }
              >
                <FileCheck className="w-4 h-4 text-[#C9A227]" />
                <span>
                  {isCaseClosed ? 'Vụ việc đã được đóng tổng' : 'Đóng tổng thể vụ việc (Supervisor Closeout)'}
                </span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                * Chỉ Supervisor mới có quyền Đóng tổng thể vụ việc.
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          * Quy tắc kiểm soát Backend v2.2: Nút sẽ tự động vô hiệu hóa nếu còn bất kỳ hạng mục nào dở dang (
          <span className="font-mono text-slate-700 font-bold">CASE_HAS_OPEN_REQUIRED_ITEMS = {!allItemsAccepted ? 'TRUE' : 'FALSE'}</span>
          ).
        </p>
      </section>

      {/* BEFORE vs AFTER INTEGRITY AUDIT (3 MODES: SIDE-BY-SIDE / SLIDER CURTAIN / METADATA SHA-256) */}
      <section className="bg-white rounded-2xl p-6 border border-[#E2E5E9] shadow-xs space-y-4">
        {/* Section Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-sansation">
              <Camera className="w-5 h-5 text-[#C9A227]" />
              Đối chứng bằng chứng hình ảnh hiện trường (BEFORE vs AFTER Integrity Audit)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xác minh ảnh chụp gốc, tọa độ đo đạc không gian RTK và chữ ký số thiết bị máy rải/xe lu Dynapac.
            </p>
          </div>

          {/* View Mode Switcher: Song song, Vuốt trượt, Metadata */}
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
              onClick={() => setViewMode('slider')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'slider' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Vuốt trượt (Curtain)</span>
            </button>

            <button
              onClick={() => setViewMode('meta')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'meta' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-purple-700" />
              <span>Đối chiếu metadata SHA-256</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* VIEW MODE 1 & 3: SIDE-BY-SIDE HOẶC METADATA OVERLAY                      */}
        {/* ------------------------------------------------------------------------- */}
        {viewMode !== 'slider' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: BEFORE EVIDENCE */}
            <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#E2E5E9] shadow-2xs">
              {/* Column Header */}
              <div className="p-3.5 bg-slate-50 border-b border-[#E2E5E9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
                    Ảnh trước sửa (BEFORE EVIDENCE)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                  {currentItem.defect_code} • Khuyết tật ban đầu
                </span>
              </div>

              {/* Photo Container */}
              <div className="relative group aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={currentItem.before_image}
                  alt="Hiện trạng hư hỏng mặt đường trước khi sửa chữa"
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

                {/* Expandable SHA-256 HUD Overlay (khi bật viewMode === 'meta') */}
                <div
                  className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-5 text-white flex flex-col justify-between ${
                    viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                      Bảo mật tệp &amp; Cảm biến hình ảnh
                    </span>
                    <p className="font-mono text-xs text-slate-200">Hash SHA-256: {currentItem.before_hash}</p>
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
                    <span className="font-mono font-semibold text-slate-900 text-xs">{currentItem.before_gps.split(' (')[0]}</span>
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
                      PASS: {currentItem.before_hash.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: AFTER EVIDENCE */}
            <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#E2E5E9] shadow-2xs">
              {/* Column Header */}
              <div className="p-3.5 bg-slate-50 border-b border-[#E2E5E9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">
                    Ảnh sau sửa (AFTER EVIDENCE)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Đã thảm nhựa C12.5 • Đạt lu lèn K98 ({currentItem.compaction_k98})
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

                {/* Expandable SHA-256 HUD Overlay (khi bật viewMode === 'meta') */}
                <div
                  className={`transition-opacity duration-200 absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-5 text-white flex flex-col justify-between ${
                    viewMode === 'meta' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                      Chữ ký số thiết bị thi công &amp; SHA-256
                    </span>
                    <p className="font-mono text-xs text-slate-200">Hash: {currentItem.after_hash}</p>
                    <p className="text-xs text-slate-300">
                      Độ phân giải: 4000 × 3000 px • Thiết bị: Cat S62 Pro Rugged Inspection
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold">
                      Tọa độ hoàn công &amp; Nhiệt độ vật lý
                    </span>
                    <p className="font-mono text-xs text-slate-200">{currentItem.after_gps}</p>
                    <p className="text-xs text-slate-300">
                      Nhiệt độ thảm lúc rải: {currentItem.pave_temp_c}°C • Sau lu lèn: {currentItem.compact_temp_c}°C • K98: {currentItem.compaction_k98}
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
                      PASS: {currentItem.after_hash.slice(0, 8)}...
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
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* VIEW MODE 2: INTERACTIVE SLIDER CURTAIN (VUỐT TRƯỢT SO SÁNH TRỰC QUAN)     */}
        {/* ------------------------------------------------------------------------- */}
        {viewMode === 'slider' && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md select-none bg-slate-900 border border-slate-200">
              {/* After image (Lớp nền dưới) */}
              <img
                src={currentItem.after_image}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before image (Lớp phủ trên được clip theo sliderPosition) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={currentItem.before_image}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Tag BEFORE */}
                <div className="absolute top-4 left-4 bg-rose-600/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>BEFORE (Trước sửa)</span>
                </div>
              </div>

              {/* Tag AFTER */}
              <div className="absolute top-4 right-4 bg-emerald-600/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>AFTER (Sau hoàn công)</span>
              </div>

              {/* Vạch chia Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl border-2 border-[#C9A227] flex items-center justify-center text-xs font-bold pointer-events-none">
                  ↔
                </div>
              </div>

              {/* Thanh kéo input ngầm */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-semibold text-rose-700">← Kéo sang trái để xem toàn bộ ảnh AFTER</span>
              <span className="font-mono font-bold text-slate-800">Tỷ lệ vuốt: {sliderPosition}%</span>
              <span className="font-semibold text-emerald-700">Kéo sang phải để xem toàn bộ ảnh BEFORE →</span>
            </div>
          </div>
        )}
      </section>

      {/* TECHNICAL SPECIFICATIONS & AUDIT CARD (4 METRIC BOXES THEO TCVN 8819:2011) */}
      <section className="bg-white rounded-2xl p-6 border border-[#E2E5E9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-sansation">
              <FileCheck className="w-5 h-5 text-[#C9A227]" />
              Biên bản nghiệm thu kỹ thuật &amp; Pháp lý hồ sơ hoàn công
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuỗi kiểm chứng chất lượng thi công theo quy chuẩn kỹ thuật quốc gia TCVN 8819:2011 &amp; 22 TCN 211-06.
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
                {currentItem.area_m2} m² <span className="text-xs font-normal text-slate-500">(Cắt mép vuông vắn)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Quy cách cào bóc: Sâu {currentItem.depth_cm} cm (vượt chiều sâu khuyết tật 0.5 cm để triệt tiêu nứt ngầm chân móng).
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
              <span className="font-bold block text-[#92700C]">Vật liệu sử dụng:</span>
              <div>• Bê tông nhựa nóng C12.5: <strong>{currentItem.volume_btn_c125_kg} kg</strong></div>
              <div>• Nhũ tương dính bám CRS-1: <strong>{currentItem.tack_coat_crs1}</strong></div>
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
                Checksum SHA-256 đối chiếu khớp 100% thời gian thực. Không phát hiện chỉnh sửa metadata ảnh hiện trường.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Quy tắc thẩm quyền chuỗi:</span>
              <span>Đã lưu → Phân loại → Giao việc → Đã sửa → <strong className="text-emerald-700">{currentItem.status === 'ACCEPTED' ? 'ĐÃ DUYỆT' : 'ĐANG DUYỆT'}</strong> → Đã công bố.</span>
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
                K = {currentItem.compaction_k98} <span className="text-xs font-semibold text-emerald-700">(Đạt K ≥ 0.98)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Kiểm tra độ bằng phẳng thước 3m: Khe hở lớn nhất đạt ≤ {currentItem.flatness_3m_gap_mm} mm (Giới hạn: 3.0 mm).
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Độ nhám rắc cát:</span>
              <span>Đạt <strong>{currentItem.sand_patch_roughness_mm} mm</strong> (Đạt tiêu chuẩn an toàn cao tốc).</span>
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
                Cam kết bảo hành kết cấu vá mặt đường, chống lún vệt bánh xe và bong tróc mép mối nối.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Đơn vị chịu trách nhiệm:</span>
              <span>Xí nghiệp Quản lý Đường bộ 2 (Nhà thầu phụ trách tuyến Km 1020 - Km 1045).</span>
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
              <div className="font-bold text-sm text-slate-900 font-sansation">Kỹ sư Giám sát trưởng (ID: GS-2041)</div>
              <div className="text-slate-600">Kỹ sư Giám sát trưởng hiện trường • Ban Quản lý Hạ tầng Hoàng Hải Miền Trung</div>
              <div className="font-mono text-[11px] text-emerald-800">
                Mã xác thực toàn vẹn biên bản: SHA256: 540211ab89c9a227e2e5e9
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Trạng thái xác thực điện tử</span>
              <span className="text-xs text-emerald-800 font-semibold px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                {currentItem.status === 'ACCEPTED' ? 'Đã ký số xác thực thành công' : 'Khóa điện tử sẵn sàng ký số'}
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
                  <strong className="text-slate-900">{currentItem.after_crew}</strong> kèm chỉ đạo kỹ thuật.
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
                        placeholder="Nhập tên lỗi kỹ thuật phát sinh (VD: Cắt mép chưa vuông vắn, vụn nhựa chưa dọn...)"
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
                  Lưu ý: Phát lệnh Rework sẽ tự động chuyển trạng thái hồ sơ về "REWORK_REQUIRED" và gia hạn thêm SLA hoàn công 24 giờ cho nhà thầu.
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
                className={`px-5 h-9 transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 ${
                  (reworkChecklist.other_defect && !otherDefectText.trim()) ||
                  (!reworkChecklist.bond_coat &&
                    !reworkChecklist.flatness_3m &&
                    !reworkChecklist.temperature_slip &&
                    !reworkChecklist.compaction_k98 &&
                    !reworkChecklist.other_defect)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát lệnh Rework (Tạo Work Order bù)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CITIZEN APP PUBLISH PREVIEW MODAL (PM ACTION)                   */}
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

            {/* Body */}
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
                  <span className="font-bold text-blue-700">Citizen App • Bản tin giao thông cộng đồng</span>
                  <span>Vừa xong</span>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 relative bg-black">
                  <img
                    src={currentItem.after_image}
                    alt="Kết quả sau khi hoàn thành"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                    ✓ ĐÃ KHẮC PHỤC XONG
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{publishHeadline}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Vị trí: {currentItem.chainage} • Nhà thầu Hoàng Hải đã hoàn thành thảm lại bê tông nhựa phẳng phiu, đảm bảo an toàn giao thông cho người dân. Cảm ơn phản ánh của cộng đồng!
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
                className="px-5 h-9 bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Phát hành công bố ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CLOSE COMPOSITE CASE MODAL (SUPERVISOR CLOSEOUT)                 */}
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
                Toàn bộ <strong className="text-slate-900">{caseItems.length}/{caseItems.length} hạng mục</strong> trong vụ việc{' '}
                <strong className="text-slate-900">#CASE-2026-0842</strong> đã được nghiệm thu đạt chất lượng. Xác nhận đóng hồ sơ và lưu trữ bảo hành pháp lý?
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span>Mã vụ việc:</span>
                <span className="font-mono font-bold text-slate-900">#CASE-2026-0842</span>
              </div>
              <div className="flex justify-between">
                <span>Dự án:</span>
                <span className="font-semibold text-slate-900">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng diện tích khắc phục:</span>
                <span className="font-mono font-bold text-[#92700C]">2.45 m²</span>
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
                className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                Xác nhận đóng vụ việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EXPORT EVIDENCE DOSSIER RPT-07 (POST /api/v1/exports)           */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsExportModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-base font-sansation">
                  Xuất hồ sơ bằng chứng số (RPT-07 Evidence Dossier)
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Hệ thống khởi tạo tác vụ xuất bất đồng bộ (<code>POST /api/v1/exports</code>), kết xuất hồ sơ nghiệm thu kỹ thuật theo quy chuẩn pháp lý TCVN 8819:2011 kèm mã băm SHA-256 chống chỉnh sửa.
              </p>

              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Chọn định dạng hồ sơ kết xuất:</label>

                {/* Option 1: PDF/A */}
                <div
                  onClick={() => setExportFormat('PDF_A')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    exportFormat === 'PDF_A'
                      ? 'bg-[#FEF9E7] border-[#C9A227] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'PDF_A'}
                    onChange={() => setExportFormat('PDF_A')}
                    className="mt-0.5 accent-[#C9A227]"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Biên bản nghiệm thu kỹ thuật (PDF/A)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Tệp PDF chuẩn lưu trữ lâu dài (ISO 19005), tích hợp hình ảnh Before/After, thông số K98 và mã băm SHA-256 Checksum bảo mật.
                    </span>
                  </div>
                </div>

                {/* Option 2: ZIP Package */}
                <div
                  onClick={() => setExportFormat('ZIP_PACKAGE')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    exportFormat === 'ZIP_PACKAGE'
                      ? 'bg-[#FEF9E7] border-[#C9A227] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'ZIP_PACKAGE'}
                    onChange={() => setExportFormat('ZIP_PACKAGE')}
                    className="mt-0.5 accent-[#C9A227]"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Gói hồ sơ bằng chứng gốc nén (ZIP Dossier)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Chứa toàn bộ ảnh RAW độ phân giải 4K, video giám sát lu lèn, log tọa độ RTK GPS và file <code>checksum.sha256</code> chống chối bỏ.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Hạng mục:</span>
                  <span className="font-mono font-bold text-slate-900">{currentItem.defect_code} ({currentItem.item_code})</span>
                </div>
                <div className="flex justify-between">
                  <span>Vụ việc liên quan:</span>
                  <span className="font-mono font-bold text-slate-900">#CASE-2026-0842</span>
                </div>
                <div className="flex justify-between">
                  <span>Mã băm toàn vẹn:</span>
                  <span className="font-mono text-purple-700 font-bold">{currentItem.after_hash.slice(0, 16)}...</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsExportModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleTriggerExport}
                disabled={isExporting}
                type="button"
                className="px-5 h-9 bg-[#C9A227] hover:bg-[#B38E1F] text-white transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang khởi tạo Job...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải xuống hồ sơ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
