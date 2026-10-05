import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  Search,
  SlidersHorizontal,
  FileText,
  Plus,
  Edit3,
  Clock,
  CheckCircle2,
  Construction,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  X,
  MoreVertical,
  Send,
  Eye,
  Trash2,
  Layers,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Users2,
  Sparkles,
  Info,
  Check
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { repairService } from '../../api/services'
import { ProposalHeader } from './repair-proposals/ProposalHeader'
import { ProposalStats } from './repair-proposals/ProposalStats'
import { ProposalTable } from './repair-proposals/ProposalTable'
import { ProposalModals } from './repair-proposals/ProposalModals'

// Interface cho Gói đề xuất sửa chữa kỹ thuật (Work Package / Repair Proposal)
export interface ProposalWorkPackage {
  id: string
  code: string // PKG-2026-08
  title: string
  route_id: string
  route_name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
  segments_count: number
  defect_count: number
  defect_summary: string
  technical_scope: string // Cào bóc & thảm: 180 m²
  material_scope: string // Bê tông nhựa C19: 14 m³
  technical_method?: string // methodDescription theo Spec v2.2
  duration_days: number
  date_range: string
  created_by_name: string
  created_by_initials: string
  created_by_role: string
  created_at: string
  status: 'DRAFT' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED'
  status_label: string
  approved_items: number
  total_items: number
  contractor_name: string
  description?: string
}

// Interface cho khiếm khuyết chưa gán gói trong modal
export interface UnassignedDefectItem {
  id: string
  code: string
  title: string
  stationing: string
  lane_detail: string
  severity_label: string
  selected: boolean
  area_m2: number
  depth_cm: number
}

// Cấu trúc Tuyến đường & Phân đoạn lý trình phân cấp
export interface RouteSegmentOption {
  id: string
  code: string
  name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
}

export interface RouteOption {
  id: string
  name: string
  code: string
  segments: RouteSegmentOption[]
}

export const AVAILABLE_ROUTES: RouteOption[] = [
  {
    id: 'QL1A_PK04',
    name: 'QL1A - Giai đoạn 2 (Km 1024 - Km 1045)',
    code: 'QL1A-PK04',
    segments: [
      {
        id: 'seg-02',
        code: 'SEG-02',
        name: 'Km 1028+000 đến Km 1033+500',
        chainage_start: 'Km 1028+000',
        chainage_end: 'Km 1033+500',
        chainage_display: 'Km 1028+000 - Km 1033+500'
      },
      {
        id: 'seg-01',
        code: 'SEG-01',
        name: 'Km 1024+000 đến Km 1028+000',
        chainage_start: 'Km 1024+000',
        chainage_end: 'Km 1028+000',
        chainage_display: 'Km 1024+000 - Km 1028+000'
      },
      {
        id: 'seg-03',
        code: 'SEG-03',
        name: 'Km 1033+500 đến Km 1039+000',
        chainage_start: 'Km 1033+500',
        chainage_end: 'Km 1039+000',
        chainage_display: 'Km 1033+500 - Km 1039+000'
      },
      {
        id: 'seg-04',
        code: 'SEG-04',
        name: 'Km 1039+000 đến Km 1045+500',
        chainage_start: 'Km 1039+000',
        chainage_end: 'Km 1045+500',
        chainage_display: 'Km 1039+000 - Km 1045+500'
      }
    ]
  },
  {
    id: 'QL1A_PK01',
    name: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1024)',
    code: 'QL1A-PK01',
    segments: [
      {
        id: 'seg-101',
        code: 'SEG-101',
        name: 'Km 1000+000 đến Km 1012+000',
        chainage_start: 'Km 1000+000',
        chainage_end: 'Km 1012+000',
        chainage_display: 'Km 1000+000 - Km 1012+000'
      },
      {
        id: 'seg-102',
        code: 'SEG-102',
        name: 'Km 1012+000 đến Km 1024+000',
        chainage_start: 'Km 1012+000',
        chainage_end: 'Km 1024+000',
        chainage_display: 'Km 1012+000 - Km 1024+000'
      }
    ]
  },
  {
    id: 'EXPR_NORTH_SOUTH',
    name: 'Đường nối Cao tốc Bắc - Nam',
    code: 'EXPR-NS',
    segments: [
      {
        id: 'seg-exp1',
        code: 'SEG-EXP1',
        name: 'Km 0+000 đến Km 15+500 (Nút giao)',
        chainage_start: 'Km 0+000',
        chainage_end: 'Km 15+500',
        chainage_display: 'Km 0+000 - Km 15+500'
      },
      {
        id: 'seg-exp2',
        code: 'SEG-EXP2',
        name: 'Km 15+500 đến Km 28+200 (Trạm thu phí)',
        chainage_start: 'Km 15+500',
        chainage_end: 'Km 28+200',
        chainage_display: 'Km 15+500 - Km 28+200'
      }
    ]
  }
]

// Mock dữ liệu khiếm khuyết tồn đọng riêng theo từng phân đoạn
export const DEFECTS_BY_SEGMENT: Record<string, UnassignedDefectItem[]> = {
  'seg-02': [
    {
      id: 'def-102',
      code: 'DEF-102',
      title: 'Ổ gà sâu 5cm làn phải',
      stationing: 'Km 1029+200',
      lane_detail: 'Vị trí: Làn phải sát lề • Mức độ: Khẩn cấp',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 0.45,
      depth_cm: 5.2
    },
    {
      id: 'def-105',
      code: 'DEF-105',
      title: 'Nứt dọc 2.1m tim đường',
      stationing: 'Km 1029+800',
      lane_detail: 'Vị trí: Giữa hai làn xe • Cần xẻ rãnh rót nhựa mastic',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.85,
      depth_cm: 3.1
    },
    {
      id: 'def-108',
      code: 'DEF-108',
      title: 'Lún vệt bánh xe 18mm',
      stationing: 'Km 1030+150',
      lane_detail: 'Chiều dài: 45 mét vệt lún • Nguy cơ đọng nước mưa',
      severity_label: 'Nghiêm trọng (L3)',
      selected: true,
      area_m2: 1.25,
      depth_cm: 4.5
    },
    {
      id: 'def-114',
      code: 'DEF-114',
      title: 'Nứt chân chim mai rùa',
      stationing: 'Km 1031+400',
      lane_detail: 'Mức độ nhẹ, chưa lan tỏa mặt đường lớn',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 0.35,
      depth_cm: 1.8
    }
  ],
  'seg-01': [
    {
      id: 'def-101',
      code: 'DEF-101',
      title: 'Ổ gà lún sụt gần trạm thu phí',
      stationing: 'Km 1025+300',
      lane_detail: 'Làn xe tải nặng • Có nguy cơ bật mảng bê tông',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 0.60,
      depth_cm: 6.0
    },
    {
      id: 'def-103',
      code: 'DEF-103',
      title: 'Nứt ngang mặt đường 3.5m',
      stationing: 'Km 1026+750',
      lane_detail: 'Nứt thấu lớp bê tông nhựa C19',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.70,
      depth_cm: 2.5
    },
    {
      id: 'def-104',
      code: 'DEF-104',
      title: 'Bong tróc lớp tạo nhám mặt đường',
      stationing: 'Km 1027+400',
      lane_detail: 'Mặt đường trơn trượt khi mưa lớn',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 1.10,
      depth_cm: 1.5
    }
  ],
  'seg-03': [
    {
      id: 'def-115',
      code: 'DEF-115',
      title: 'Hằn lún bánh xe vệt ngoài',
      stationing: 'Km 1034+200',
      lane_detail: 'Đoạn cua dốc nhẹ • Lún sâu 22mm',
      severity_label: 'Nghiêm trọng (L3)',
      selected: true,
      area_m2: 1.50,
      depth_cm: 4.8
    },
    {
      id: 'def-117',
      code: 'DEF-117',
      title: 'Nứt rạn mai rùa diện tích lớn',
      stationing: 'Km 1036+500',
      lane_detail: 'Hư hỏng cấu trúc lớp mặt bê tông nhựa',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 4.20,
      depth_cm: 5.0
    },
    {
      id: 'def-119',
      code: 'DEF-119',
      title: 'Trám mastic cũ bị bong bật',
      stationing: 'Km 1038+100',
      lane_detail: 'Cần cào bóc làm sạch và rót lại',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 0.50,
      depth_cm: 2.0
    }
  ],
  'seg-04': [
    {
      id: 'def-121',
      code: 'DEF-121',
      title: 'Nứt trượt taluy âm mép đường đèo',
      stationing: 'Km 1042+100',
      lane_detail: 'Phân đoạn cua đèo • Nguy cơ mất an toàn cao',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 2.10,
      depth_cm: 7.5
    },
    {
      id: 'def-123',
      code: 'DEF-123',
      title: 'Sụt lún mép rãnh thoát nước bê tông',
      stationing: 'Km 1044+300',
      lane_detail: 'Rãnh bê tông hở mép đọng bùn rác',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 1.80,
      depth_cm: 3.5
    }
  ],
  'seg-101': [
    {
      id: 'def-201',
      code: 'DEF-201',
      title: 'Ổ gà sâu mép cầu vượt',
      stationing: 'Km 1005+200',
      lane_detail: 'Làn xe cơ giới 01 • Cần vá dặm khẩn cấp',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 0.55,
      depth_cm: 5.5
    },
    {
      id: 'def-204',
      code: 'DEF-204',
      title: 'Nứt dọc kéo dài 15m',
      stationing: 'Km 1009+800',
      lane_detail: 'Giữa tim đường và làn 1',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 1.05,
      depth_cm: 2.8
    }
  ],
  'seg-102': [
    {
      id: 'def-210',
      code: 'DEF-210',
      title: 'Lún vệt bánh xe Km 1018',
      stationing: 'Km 1018+400',
      lane_detail: 'Làn xe tải nặng • Hằn lún 16mm',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.90,
      depth_cm: 3.2
    },
    {
      id: 'def-212',
      code: 'DEF-212',
      title: 'Nứt chân chim diện rộng',
      stationing: 'Km 1022+100',
      lane_detail: 'Làn khẩn cấp sát lề',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 0.80,
      depth_cm: 1.5
    }
  ],
  'seg-exp1': [
    {
      id: 'def-301',
      code: 'DEF-301',
      title: 'Lún gối mố cầu vượt nút giao',
      stationing: 'Km 05+200',
      lane_detail: 'Đoạn chuyển tiếp mố cầu cao tốc',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 1.40,
      depth_cm: 4.2
    },
    {
      id: 'def-305',
      code: 'DEF-305',
      title: 'Nứt vỡ gờ chắn bánh bê tông',
      stationing: 'Km 11+400',
      lane_detail: 'Dải phân cách giữa cao tốc',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.60,
      depth_cm: 3.0
    }
  ],
  'seg-exp2': [
    {
      id: 'def-310',
      code: 'DEF-310',
      title: 'Lún cục bộ trước làn thu phí',
      stationing: 'Km 22+800',
      lane_detail: 'Khu vực giảm tốc trạm ETC',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 1.80,
      depth_cm: 5.0
    }
  ]
}

export const RepairProposals: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = !isSupervisor
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Danh sách các gói đề xuất sửa chữa kỹ thuật phong phú (14 gói theo Stitch)
  const [packages, setPackages] = useState<ProposalWorkPackage[]>(() => repairService.getPackages())

  // Đồng bộ real-time giữa PM và Supervisor qua CustomEvent
  useEffect(() => {
    const handleStateChange = () => {
      setPackages(repairService.getPackages())
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [])


  // Trạng thái tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT'>('ALL')
  const [isPDFPreviewModalOpen, setIsPDFPreviewModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Phân trang thực tế
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  // Bộ lọc trực tiếp inline (Tuyến đường, Quy mô, Đơn vị thi công)
  const [advRoute, setAdvRoute] = useState<string>('ALL')
  const [advScale, setAdvScale] = useState<string>('ALL')
  const [advContractor, setAdvContractor] = useState<string>('ALL')

  // Xem chi tiết hồ sơ gói đề xuất (Modal / Drawer)
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<ProposalWorkPackage | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // MODAL TẠO GÓI ĐỀ XUẤT MỚI STATE
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formRouteId, setFormRouteId] = useState('QL1A_PK04')
  const [formSegmentId, setFormSegmentId] = useState('seg-02')
  const [formPackageName, setFormPackageName] = useState('Khắc phục hằn lún bánh xe & trám nứt Km 1028 - Km 1033')
  const [formContractor, setFormContractor] = useState('Đội thi công sửa chữa Hoàng Hải 01')
  const [formDurationDays, setFormDurationDays] = useState(3)

  // Phương án kỹ thuật sửa chữa tổng quát do PM nhập (methodDescription theo Spec v2.2)
  const [formTechnicalMethod, setFormTechnicalMethod] = useState('')

  // Tuyến đường và phân đoạn hiện tại đang chọn trong form
  const currentRoute = useMemo(() => {
    return AVAILABLE_ROUTES.find((r) => r.id === formRouteId) || AVAILABLE_ROUTES[0]
  }, [formRouteId])

  const currentRouteSegments = useMemo(() => {
    return currentRoute.segments
  }, [currentRoute])

  const currentSegment = useMemo(() => {
    return (
      currentRouteSegments.find((s) => s.id === formSegmentId) ||
      currentRouteSegments[0]
    )
  }, [currentRouteSegments, formSegmentId])

  // Danh sách khiếm khuyết chưa gán gói trong Modal (khởi tạo với seg-02)
  const [unassignedDefects, setUnassignedDefects] = useState<UnassignedDefectItem[]>(
    DEFECTS_BY_SEGMENT['seg-02'] || []
  )

  // Xử lý khi chọn Tuyến đường khác -> tự động lọc phân đoạn và cập nhật khiếm khuyết
  const handleRouteChange = (newRouteId: string) => {
    setFormRouteId(newRouteId)
    const targetRoute = AVAILABLE_ROUTES.find((r) => r.id === newRouteId) || AVAILABLE_ROUTES[0]
    const defaultSeg = targetRoute.segments[0]
    setFormSegmentId(defaultSeg.id)
    setUnassignedDefects(DEFECTS_BY_SEGMENT[defaultSeg.id] || [])
    setFormPackageName(`Bảo trì mặt đường & xử lý hư hỏng ${defaultSeg.chainage_display}`)
  }

  // Xử lý khi chọn Phân đoạn khác trong cùng tuyến đường
  const handleSegmentChange = (newSegmentId: string) => {
    setFormSegmentId(newSegmentId)
    const targetSeg = currentRouteSegments.find((s) => s.id === newSegmentId) || currentRouteSegments[0]
    setUnassignedDefects(DEFECTS_BY_SEGMENT[newSegmentId] || [])
    setFormPackageName(`Bảo trì mặt đường & xử lý hư hỏng ${targetSeg.chainage_display}`)
  }

  // Tính toán khối lượng kỹ thuật tự động trong Modal
  const modalCalculations = useMemo(() => {
    const selected = unassignedDefects.filter((d) => d.selected)
    const count = selected.length
    const totalArea = selected.reduce((sum, item) => sum + item.area_m2, 0).toFixed(2)
    const totalLength = count * 15
    return {
      count,
      totalArea,
      totalLength,
      description: count > 0 ? `${totalArea} m² cào bóc / ${totalLength}m trám` : 'Chưa chọn khiếm khuyết'
    }
  }, [unassignedDefects])

  const handleToggleDefect = (id: string) => {
    setUnassignedDefects((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    )
  }

  // Xử lý lưu bản nháp hoặc trình duyệt gói đề xuất mới
  const handleSaveDraft = (submitDirectly: boolean = false) => {
    if (modalCalculations.count === 0) {
      showToast('Vui lòng chọn ít nhất 1 khiếm khuyết để khởi tạo gói đề xuất!')
      return
    }

    const newPackage: ProposalWorkPackage = {
      id: `pkg-${Date.now()}`,
      code: `PKG-2026-${Math.floor(10 + Math.random() * 90)}`,
      title: formPackageName,
      route_id: currentRoute.id,
      route_name: currentRoute.name,
      chainage_start: currentSegment.chainage_start,
      chainage_end: currentSegment.chainage_end,
      chainage_display: currentSegment.chainage_display,
      segments_count: 1,
      defect_count: modalCalculations.count,
      defect_summary: `${modalCalculations.count} điểm hư hỏng gom mới (${currentSegment.code})`,
      technical_scope: `Cào bóc thảm: ${modalCalculations.totalArea} m²`,
      material_scope: 'Vật tư theo phương án kỹ thuật',
      technical_method: formTechnicalMethod.trim() || 'Cào bóc vá dặm xử lý theo quy trình bảo trì mặt đường',
      duration_days: formDurationDays,
      date_range: `Dự kiến ${formDurationDays} ngày`,
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: 'Vừa tạo - Hôm nay',
      status: submitDirectly ? 'SUBMITTED' : 'DRAFT',
      status_label: submitDirectly ? 'Chờ duyệt' : 'Bản nháp',
      approved_items: 0,
      total_items: modalCalculations.count,
      contractor_name: formContractor
    }

    repairService.createPackage(newPackage)
    setPackages(repairService.getPackages())
    setIsCreateModalOpen(false)
    setCurrentPage(1)
    showToast(
      submitDirectly
        ? `Đã tạo và gửi trình duyệt Gói đề xuất [${newPackage.code}] sang Giám sát trưởng!`
        : `Đã lưu bản nháp Gói đề xuất [${newPackage.code}] thành công!`
    )
  }

  // Khóa & Trình duyệt gói nháp
  const handleSubmitDraftPackage = (id: string, code: string) => {
    repairService.submitPackage(id)
    setPackages(repairService.getPackages())
    showToast(`Đã khóa hồ sơ và gửi gói [${code}] lên Giám sát trưởng phê duyệt!`)
  }

  // Xóa gói nháp
  const handleDeleteDraft = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản nháp [${code}]?`)) {
      setPackages((prev) => prev.filter((p) => p.id !== id))
      showToast(`Đã xóa bản nháp [${code}].`)
    }
  }

  // Giám sát phê duyệt nhanh
  const handleQuickApprove = (id: string, code: string) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'DECIDED',
              status_label: 'Đã phê duyệt',
              approved_items: p.total_items
            }
          : p
      )
    )
    showToast(`[GIÁM SÁT]: Đã phê duyệt chính thức gói [${code}] và ban hành lệnh công tác!`)
  }

  // Thống kê 4 Card
  const stats = useMemo(() => {
    const draft = packages.filter((p) => p.status === 'DRAFT').length
    const submitted = packages.filter((p) => p.status === 'SUBMITTED').length
    const decided = packages.filter((p) => p.status === 'DECIDED').length
    const dispatched = packages.filter((p) => p.status === 'DISPATCHED').length
    return { draft, submitted, decided, dispatched, total: packages.length }
  }, [packages])

  // Lọc danh sách gói hiển thị
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      // Tab status filter
      if (activeFilterTab !== 'ALL' && p.status !== activeFilterTab) return false
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchCode = p.code.toLowerCase().includes(term)
        const matchTitle = p.title.toLowerCase().includes(term)
        const matchChainage = p.chainage_display.toLowerCase().includes(term)
        const matchContractor = p.contractor_name.toLowerCase().includes(term)
        if (!matchCode && !matchTitle && !matchChainage && !matchContractor) return false
      }
      // Lọc nâng cao tuyến đường
      if (advRoute !== 'ALL' && p.route_id !== advRoute) return false
      // Lọc nâng cao quy mô
      if (advScale === 'LARGE' && p.defect_count < 10) return false
      if (advScale === 'MEDIUM' && (p.defect_count < 5 || p.defect_count >= 10)) return false
      if (advScale === 'SMALL' && p.defect_count >= 5) return false
      // Lọc nâng cao tổ đội
      if (advContractor !== 'ALL' && !p.contractor_name.includes(advContractor)) return false

      return true
    })
  }, [packages, activeFilterTab, searchTerm, advRoute, advScale, advContractor])

  // Tính toán trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize))
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPackages.slice(start, start + pageSize)
  }, [filteredPackages, currentPage, pageSize])

  const handleTabChange = (tab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT') => {
    setActiveFilterTab(tab)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. WORKSPACE HEADER & BREADCRUMB */}
      <ProposalHeader
        basePath={basePath}
        totalPackagesCount={packages.length}
        isPM={isPM}
        onOpenPDFPreviewModal={() => setIsPDFPreviewModalOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 2. STATS SUMMARY CARDS */}
      <ProposalStats
        stats={stats}
        activeFilterTab={activeFilterTab}
        onTabChange={handleTabChange}
      />

      {/* 3. PACKAGES TABLE & ACTION HUB */}
      <ProposalTable
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setCurrentPage(1)
        }}
        activeFilterTab={activeFilterTab}
        onTabChange={handleTabChange}
        stats={{
          total: stats.total,
          draft: stats.draft,
          submitted: stats.submitted,
          decided: stats.decided,
          dispatched: stats.dispatched,
        }}
        packages={packages}
        paginatedPackages={paginatedPackages}
        filteredPackages={filteredPackages}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onSetPage={setCurrentPage}
        basePath={basePath}
        isSupervisor={isSupervisor}
        isPM={isPM}
        onSubmitDraft={handleSubmitDraftPackage}
        onDeleteDraft={handleDeleteDraft}
        onQuickApprove={handleQuickApprove}
        showToast={showToast}
        advRoute={advRoute}
        onRouteFilterChange={setAdvRoute}
        advScale={advScale}
        onScaleFilterChange={setAdvScale}
        advContractor={advContractor}
        onContractorFilterChange={setAdvContractor}
        onResetFilters={() => {
          setAdvRoute('ALL')
          setAdvScale('ALL')
          setAdvContractor('ALL')
          setCurrentPage(1)
          showToast('Đã đặt lại tất cả bộ lọc.')
        }}
      />

      {/* 4. MODALS HUB */}
      <ProposalModals
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        formPackageName={formPackageName}
        setFormPackageName={setFormPackageName}
        formRouteId={formRouteId}
        handleRouteChange={handleRouteChange}
        availableRoutes={AVAILABLE_ROUTES}
        formSegmentId={formSegmentId}
        handleSegmentChange={handleSegmentChange}
        currentRouteSegments={currentRouteSegments}
        currentSegment={currentSegment}
        currentRoute={currentRoute}
        formContractor={formContractor}
        setFormContractor={setFormContractor}
        formDurationDays={formDurationDays}
        setFormDurationDays={setFormDurationDays}
        formTechnicalMethod={formTechnicalMethod}
        setFormTechnicalMethod={setFormTechnicalMethod}
        unassignedDefects={unassignedDefects}
        handleToggleDefect={handleToggleDefect}
        modalCalculations={modalCalculations}
        handleSaveDraft={handleSaveDraft}
        isPDFPreviewModalOpen={isPDFPreviewModalOpen}
        setIsPDFPreviewModalOpen={setIsPDFPreviewModalOpen}
        packages={packages}
        showToast={showToast}
        selectedPackageForDetail={selectedPackageForDetail}
        setSelectedPackageForDetail={setSelectedPackageForDetail}
        isSupervisor={isSupervisor}
        isPM={isPM}
        handleQuickApprove={handleQuickApprove}
        handleSubmitDraftPackage={handleSubmitDraftPackage}
      />
    </div>
  )
}
