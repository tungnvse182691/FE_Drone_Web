import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { repairService } from '../../api/services'
import { mockRepairBatches } from '../../data/mockData'
import {
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Milestone,
  User,
  AlertTriangle,
  CheckCheck,
  FileDown,
  Truck,
  Check,
  Camera,
  RotateCcw,
  X,
  Search,
  Filter,
  Eye,
  Info,
  Layers,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ZoomIn,
  Send,
  HardHat,
  ArrowLeft,
  Share2,
  Maximize2
} from 'lucide-react'

// --- Interfaces for WF-07 ---
export type ItemApprovalStatus =
  | 'APPROVED'
  | 'REQUEST_EVIDENCE'
  | 'REQUEST_RECONSIDER'
  | 'REJECTED'
  | 'PENDING'

export interface RepairItemDetail {
  id: string
  item_code: string
  defect_code: string
  chainage: string
  lane_info: string
  defect_title: string
  defect_measurements: string
  solution_title: string
  solution_standard: string
  volume_display: string
  volume_sub: string
  area_m2: number
  status: ItemApprovalStatus
  status_label: string
  assigned_crew: string
  supervisor_notes?: string
  evidence_directives?: string[]
  feedback_type?: 'EVIDENCE' | 'RECONSIDER' | 'REJECT'
  image_url: string
  ortho_code: string
  gps_coords: string
  resolution: string
}

// Initial 12 Items for PKG-2026-08 (matching Stitch 10 and WF-07 specifications)
const INITIAL_ITEMS: RepairItemDetail[] = [
  {
    id: 'item-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-2026-0089',
    chainage: 'Km 1024+350',
    lane_info: 'Làn phải R1 • Tấm #42',
    defect_title: 'Ổ gà mặt đường cấp 3',
    defect_measurements: 'Sâu 6.0cm • S = 0.70 m²',
    solution_title: 'Trám vá nhựa nguội khẩn cấp',
    solution_standard: 'Tiêu chuẩn vá nhanh TCVN 8819',
    volume_display: '18.5 m²',
    volume_sub: 'Sâu 5.0 cm',
    area_m2: 18.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1024_R1_ORTHO.JPG',
    gps_coords: '15.8245, 108.2140',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-2026-0092',
    chainage: 'Km 1028+120',
    lane_info: 'Làn giữa M1 • Tấm #88',
    defect_title: 'Nứt rạn cá sấu & Lún vệt bánh',
    defect_measurements: 'Sâu 2.5cm - 5cm • S = 1.85 m²',
    solution_title: 'Cắt cào & thảm lại BTN C12.5 (d=5cm)',
    solution_standard: 'Trám vết nứt (BTN C12.5)',
    volume_display: '45.0 m',
    volume_sub: 'Trám vết nứt (BTN C12.5)',
    area_m2: 24.5,
    status: 'REQUEST_EVIDENCE',
    status_label: 'REQUEST_EVIDENCE',
    assigned_crew: '',
    supervisor_notes:
      'Hình ảnh hiện trường từ Drone chưa làm rõ được độ sụt lún của lớp móng CPĐD. Đề nghị Tổ đo đạc bổ sung ảnh chụp thước đo cốt cao độ đáy ổ gà và kết quả đo độ nẩy bánh xe trước khi duyệt định mức bóc tách 5cm BTN.',
    evidence_directives: [
      'Yêu cầu đo đạc lại hiện trường bằng máy laser thủy bình hoặc thước 3m',
      'Chụp ảnh cận cảnh kèm thước đo tỷ lệ chuẩn 50cm'
    ],
    feedback_type: 'EVIDENCE',
    image_url:
      'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1028_M1_ORTHO.JPG',
    gps_coords: '15.8291, 108.2198',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-03',
    item_code: '#ITEM-03',
    defect_code: 'DEF-2026-0095',
    chainage: 'Km 1032+450',
    lane_info: 'Lề đường phải • Tấm #12',
    defect_title: 'Vỡ mép thảm nhựa rỗng',
    defect_measurements: 'Sâu 7.5cm • S = 0.95 m²',
    solution_title: 'Xử lý bù lún cấp phối & chèn Mastic',
    solution_standard: 'Trám khe co giãn nhựa đường 60/70',
    volume_display: '2.5 m³',
    volume_sub: 'Bù lún cấp phối & Mastic',
    area_m2: 12.0,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Đội cơ giới Sửa chữa 02',
    image_url:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1032_R_ORTHO.JPG',
    gps_coords: '15.8340, 108.2250',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-04',
    item_code: '#ITEM-04',
    defect_code: 'DEF-2026-0101',
    chainage: 'Km 1038+800',
    lane_info: 'Làn trái L1 • Dải phân cách',
    defect_title: 'Trồi lún cục bộ lớp mặt',
    defect_measurements: 'Độ nhô 4.0cm • S = 1.20 m²',
    solution_title: 'Cào gọt phẳng & lu nén lại',
    solution_standard: 'Đơn giá định mức ca máy cào bóc',
    volume_display: '14.2 m²',
    volume_sub: 'Cào bóc san phẳng',
    area_m2: 14.2,
    status: 'REJECTED',
    status_label: 'REJECTED',
    assigned_crew: '',
    supervisor_notes:
      'Phương án cào gọt đơn thuần không giải quyết được nguyên nhân chảy nhựa do quá tải. Yêu cầu bóc toàn bộ 7cm lớp BTN rỗng và bù bằng BTN Polyme.',
    evidence_directives: ['Khoan mẫu kiểm tra độ chặt và biến dạng dẻo'],
    feedback_type: 'REJECT',
    image_url:
      'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1038_L1_ORTHO.JPG',
    gps_coords: '15.8412, 108.2312',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-05',
    item_code: '#ITEM-05',
    defect_code: 'DEF-2026-0105',
    chainage: 'Km 1042+100',
    lane_info: 'Làn giữa M1 • Tấm #210',
    defect_title: 'Rạn nứt chân chim kéo dài',
    defect_measurements: 'Dài 14.5m • S = 3.20 m²',
    solution_title: 'Tưới nhựa láng mặt & dải sợi thủy tinh',
    solution_standard: 'Chống nứt phản xạ mặt đường BTN',
    volume_display: '32.0 m²',
    volume_sub: 'Tưới nhựa & dải sợi TT',
    area_m2: 32.0,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Đội bảo dưỡng Thường xuyên',
    image_url:
      'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1042_M1_ORTHO.JPG',
    gps_coords: '15.8470, 108.2385',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-06',
    item_code: '#ITEM-06',
    defect_code: 'DEF-2026-0108',
    chainage: 'Km 1025+850',
    lane_info: 'Làn phải R2 • Tấm #55',
    defect_title: 'Ổ gà đường kính 45cm',
    defect_measurements: 'Sâu 5.5cm • S = 0.50 m²',
    solution_title: 'Vá dặm nóng bê tông nhựa chặt',
    solution_standard: 'Quy trình thi công và nghiệm thu TCVN 8819',
    volume_display: '15.0 m²',
    volume_sub: 'Sâu 5.0 cm BTN C12.5',
    area_m2: 15.0,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1025_R2_ORTHO.JPG',
    gps_coords: '15.8260, 108.2162',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-07',
    item_code: '#ITEM-07',
    defect_code: 'DEF-2026-0112',
    chainage: 'Km 1029+400',
    lane_info: 'Làn vượt L2 • Tấm #130',
    defect_title: 'Hằn lún vệt bánh xe chiều dài 22m',
    defect_measurements: 'Sâu 3.2cm • Rộng 35cm',
    solution_title: 'Cào bóc tái sinh nguội tại chỗ',
    solution_standard: 'Định mức kỹ thuật cào bóc lu lèn',
    volume_display: '28.0 m²',
    volume_sub: 'Bề dày xử lý 6.0 cm',
    area_m2: 28.0,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Đội cơ giới Sửa chữa 02',
    image_url:
      'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1029_L2_ORTHO.JPG',
    gps_coords: '15.8305, 108.2215',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-08',
    item_code: '#ITEM-08',
    defect_code: 'DEF-2026-0119',
    chainage: 'Km 1034+200',
    lane_info: 'Mép dải phân cách giữa',
    defect_title: 'Nứt khối mạng lưới kết cấu',
    defect_measurements: 'Dài 18m • Rộng khe nứt 8mm',
    solution_title: 'Bơm keo Epoxy & chèn sợi Carbon',
    solution_standard: 'Tiêu chuẩn gia cố chống thấm mặt đường',
    volume_display: '16.8 m',
    volume_sub: 'Bơm keo trám kín',
    area_m2: 8.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Đội bảo dưỡng Thường xuyên',
    image_url:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1034_MED_ORTHO.JPG',
    gps_coords: '15.8362, 108.2278',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-09',
    item_code: '#ITEM-09',
    defect_code: 'DEF-2026-0125',
    chainage: 'Km 1037+600',
    lane_info: 'Làn xe tải R1 • Tấm #175',
    defect_title: 'Ổ gà sâu đọng nước sau mưa',
    defect_measurements: 'Sâu 8.0cm • S = 1.10 m²',
    solution_title: 'Cắt mép vuông & thảm BTN C19 + C12.5',
    solution_standard: 'Kết cấu 2 lớp hoàn trả chịu lực',
    volume_display: '21.5 m²',
    volume_sub: 'Kết cấu 2 lớp bù lún',
    area_m2: 21.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url:
      'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1037_R1_ORTHO.JPG',
    gps_coords: '15.8398, 108.2295',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-10',
    item_code: '#ITEM-10',
    defect_code: 'DEF-2026-0130',
    chainage: 'Km 1041+050',
    lane_info: 'Làn giữa M1 • Tấm #198',
    defect_title: 'Lún cục bộ quanh giếng thu nước',
    defect_measurements: 'Chênh cao 4.5cm • S = 0.85 m²',
    solution_title: 'Nâng cổ hố ga & đệm bê tông M300',
    solution_standard: 'Định mức xây lắp hạ tầng kỹ thuật',
    volume_display: '1.2 m³',
    volume_sub: 'Bê tông M300 đông kết nhanh',
    area_m2: 4.8,
    status: 'REQUEST_EVIDENCE',
    status_label: 'REQUEST_EVIDENCE',
    assigned_crew: '',
    supervisor_notes:
      'Chưa có biên bản kiểm tra liên ngành với đơn vị thoát nước đô thị. Cần bổ sung ảnh chụp cao độ miệng hố ga sau khi mở nắp gang.',
    evidence_directives: ['Bổ sung ảnh kiểm tra lòng cống và cổ hố ga'],
    feedback_type: 'EVIDENCE',
    image_url:
      'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1041_M1_ORTHO.JPG',
    gps_coords: '15.8455, 108.2360',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-11',
    item_code: '#ITEM-11',
    defect_code: 'DEF-2026-0136',
    chainage: 'Km 1043+750',
    lane_info: 'Làn khẩn cấp • Tấm #230',
    defect_title: 'Bong bật cốt liệu tạo bề mặt trơn nhẵn',
    defect_measurements: 'Diện tích 60m² • Chiều dài 40m',
    solution_title: 'Phun nhũ tương nhựa đường láng cát',
    solution_standard: 'Bảo dưỡng phòng ngừa chống trượt',
    volume_display: '60.0 m²',
    volume_sub: 'Láng nhựa 1 lớp',
    area_m2: 60.0,
    status: 'REJECTED',
    status_label: 'REJECTED',
    assigned_crew: '',
    supervisor_notes:
      'Đoạn này chuẩn bị đại tu theo kế hoạch quý 4. Từ chối giải pháp phun nhũ tương để tránh trùng lặp khối lượng gói thầu lớn.',
    evidence_directives: ['Đối chiếu kế hoạch trung tu quý 4/2026'],
    feedback_type: 'REJECT',
    image_url:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1043_EMG_ORTHO.JPG',
    gps_coords: '15.8490, 108.2410',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-12',
    item_code: '#ITEM-12',
    defect_code: 'DEF-2026-0142',
    chainage: 'Km 1044+900',
    lane_info: 'Làn phải R1 • Đầu dốc cầu',
    defect_title: 'Vết nứt ngang cầu dốc',
    defect_measurements: 'Rộng 12mm • Sâu 4.0cm • Dài 7m',
    solution_title: 'Cắt rãnh & rót mastic chèn khe biến dạng',
    solution_standard: 'Tiêu chuẩn chèn khe nối mố cầu',
    volume_display: '7.0 m',
    volume_sub: 'Mastic bitum cải tiến',
    area_m2: 3.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url:
      'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1044_R1_ORTHO.JPG',
    gps_coords: '15.8520, 108.2455',
    resolution: '4K • 3840x2160'
  }
]

const CREW_OPTIONS = [
  'Tổ thi công Asphalt 01',
  'Đội cơ giới Sửa chữa 02',
  'Đội bảo dưỡng Thường xuyên',
  'Tổ vá dặm cơ động Hoàng Hải'
]

export const ProposalApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Role detection
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER
  const basePath = isSupervisor ? '/sup' : '/pm'

  const matchedBatch = useMemo(() => {
    if (!id) return null
    return mockRepairBatches.find(
      (b) => b.id.toLowerCase() === id.toLowerCase() || b.code.toLowerCase() === id.toLowerCase()
    )
  }, [id])

  // Package Data State
  const [packageCode] = useState(matchedBatch?.code || (id?.toUpperCase().startsWith('PKG-') ? id.toUpperCase() : `PKG-2026-${id?.toUpperCase() || '05'}`))
  const [packageName] = useState(matchedBatch?.name || 'Gói đề xuất sửa chữa mặt đường BTXM')
  const [items, setItems] = useState<RepairItemDetail[]>(() => repairService.getItems(packageCode))

  useEffect(() => {
    const handleStateChange = () => {
      setItems(repairService.getItems(packageCode))
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [packageCode])

  // Filter State
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REQUEST_EVIDENCE' | 'REJECTED'>(
    'ALL'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Modal States
  const [activeModalItem, setActiveModalItem] = useState<RepairItemDetail | null>(null)
  const [modalFeedbackType, setModalFeedbackType] = useState<'EVIDENCE' | 'RECONSIDER' | 'REJECT'>('EVIDENCE')
  const [modalNotes, setModalNotes] = useState('')
  const [modalDirectives, setModalDirectives] = useState<{ [key: string]: boolean }>({
    laser: true,
    height: false,
    close_photo: false,
    core_sample: false
  })

  // Lightbox Modal for Defect Photo
  const [viewingPhotoItem, setViewingPhotoItem] = useState<RepairItemDetail | null>(null)

  // Dispatch Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [dispatchDeadline, setDispatchDeadline] = useState('28/08/2026')
  const [dispatchNotice, setDispatchNotice] = useState(
    'Yêu cầu rào chắn cọc tiêu phản quang 50m trước vị trí thi công, bố trí 2 người điều tiết giao thông theo TCVN.'
  )

  // Batch Approve Modal
  const [isBatchApproveConfirmOpen, setIsBatchApproveConfirmOpen] = useState(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // --- Derived Statistics ---
  const stats = useMemo(() => {
    const total = items.length
    const approved = items.filter((i) => i.status === 'APPROVED').length
    const evidence = items.filter((i) => i.status === 'REQUEST_EVIDENCE').length
    const reconsider = items.filter((i) => i.status === 'REQUEST_RECONSIDER').length
    const rejected = items.filter((i) => i.status === 'REJECTED').length
    const pending = items.filter((i) => i.status === 'PENDING').length

    const approvedArea = items
      .filter((i) => i.status === 'APPROVED')
      .reduce((sum, item) => sum + item.area_m2, 0)
    const totalProposedArea = items.reduce((sum, item) => sum + item.area_m2, 0)

    const percent = total > 0 ? Math.round((approved / total) * 1000) / 10 : 0

    return {
      total,
      approved,
      evidence,
      reconsider,
      rejected,
      pending,
      percent,
      approvedArea: Math.round(approvedArea * 10) / 10,
      totalProposedArea: Math.round(totalProposedArea * 10) / 10
    }
  }, [items])

  // --- Filtering & Pagination ---
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (filterTab === 'APPROVED' && item.status !== 'APPROVED') return false
      if (filterTab === 'PENDING' && item.status !== 'PENDING') return false
      if (filterTab === 'REQUEST_EVIDENCE' && item.status !== 'REQUEST_EVIDENCE' && item.status !== 'REQUEST_RECONSIDER')
        return false
      if (filterTab === 'REJECTED' && item.status !== 'REJECTED') return false

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchCode = item.item_code.toLowerCase().includes(q)
        const matchDefect = item.defect_code.toLowerCase().includes(q)
        const matchChainage = item.chainage.toLowerCase().includes(q)
        const matchTitle = item.defect_title.toLowerCase().includes(q)
        const matchSol = item.solution_title.toLowerCase().includes(q)
        return matchCode || matchDefect || matchChainage || matchTitle || matchSol
      }

      return true
    })
  }, [items, filterTab, searchTerm])

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1
  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  // --- Supervisor Decision Handlers ---
  const handleQuickApproveItem = (itemId: string) => {
    const autoCrew = 'Tổ thi công Asphalt 01'
    repairService.updateItemDecision(packageCode, itemId, {
      status: 'APPROVED',
      status_label: 'APPROVED',
      assigned_crew: autoCrew,
      supervisor_notes: 'Đã phê duyệt thông qua phương án kỹ thuật và khối lượng bóc tách.'
    })
    setItems(repairService.getItems(packageCode))
    showToast(`Hạng mục ${itemId.toUpperCase()} đã được Supervisor phê duyệt (APPROVED)!`)
  }

  const handleOpenDecisionModal = (item: RepairItemDetail, initialType: 'EVIDENCE' | 'RECONSIDER' | 'REJECT') => {
    setActiveModalItem(item)
    setModalFeedbackType(initialType)
    if (initialType === 'EVIDENCE') {
      setModalNotes(
        item.supervisor_notes ||
          'Hình ảnh hiện trường từ Drone chưa làm rõ được độ sụt lún của lớp móng CPĐD. Đề nghị Tổ đo đạc bổ sung ảnh chụp thước đo cốt cao độ đáy ổ gà và kết quả đo độ nẩy bánh xe trước khi duyệt định mức bóc tách.'
      )
    } else if (initialType === 'RECONSIDER') {
      setModalNotes(
        item.supervisor_notes ||
          'Đề nghị PM xem xét lại giải pháp kỹ thuật: cần tăng chiều sâu cào bóc từ 5cm lên 7cm hoặc thay đổi mác bê tông nhựa để đảm bảo tuổi thọ khai thác.'
      )
    } else {
      setModalNotes(
        item.supervisor_notes ||
          'Phương án kỹ thuật đề xuất không phù hợp với quy chuẩn TCVN hoặc trùng lặp với kế hoạch đại tu. Từ chối duyệt phương án này.'
      )
    }
  }

  const handleSubmitDecisionModal = () => {
    if (!activeModalItem) return
    if (!modalNotes.trim()) {
      alert('Vui lòng nhập nội dung giải trình kỹ thuật của Supervisor trước khi gửi!')
      return
    }

    const selectedDirectivesList: string[] = []
    if (modalDirectives.laser)
      selectedDirectivesList.push('Yêu cầu đo đạc lại hiện trường bằng máy laser thủy bình hoặc thước 3m')
    if (modalDirectives.height)
      selectedDirectivesList.push('Yêu cầu đo đạc lại cao độ trắc dọc và bề dày lớp móng cấp phối đá dăm')
    if (modalDirectives.close_photo)
      selectedDirectivesList.push('Chụp lại ảnh cận cảnh có đặt thước tỷ lệ 50cm')
    if (modalDirectives.core_sample)
      selectedDirectivesList.push('Khoan mẫu kiểm tra độ chặt lớp móng K98')

    let nextStatus: ItemApprovalStatus = 'REQUEST_EVIDENCE'
    if (modalFeedbackType === 'RECONSIDER') nextStatus = 'REQUEST_RECONSIDER'
    if (modalFeedbackType === 'REJECT') nextStatus = 'REJECTED'

    repairService.updateItemDecision(packageCode, activeModalItem.id, {
      status: nextStatus,
      status_label: nextStatus,
      assigned_crew: nextStatus === 'REJECTED' ? '' : activeModalItem.assigned_crew,
      supervisor_notes: modalNotes,
      evidence_directives: selectedDirectivesList,
      feedback_type: modalFeedbackType
    })
    setItems(repairService.getItems(packageCode))

    const labelMap = {
      EVIDENCE: 'yêu cầu bổ sung bằng chứng (REQUEST_EVIDENCE)',
      RECONSIDER: 'yêu cầu xem lại phương án (REQUEST_RECONSIDER)',
      REJECT: 'từ chối giải pháp kỹ thuật (REJECTED)'
    }

    showToast(`Đã gửi phản hồi ${labelMap[modalFeedbackType]} cho hạng mục ${activeModalItem.item_code}!`)
    setActiveModalItem(null)
  }

  // Batch Approve All
  const handleBatchApproveAll = () => {
    items.forEach((it) => {
      if (it.status !== 'APPROVED') {
        repairService.updateItemDecision(packageCode, it.id, {
          status: 'APPROVED',
          status_label: 'APPROVED',
          assigned_crew: it.assigned_crew || 'Tổ thi công Asphalt 01',
          supervisor_notes: 'Đã thẩm duyệt phê duyệt hàng loạt thông qua.'
        })
      }
    })
    setItems(repairService.getItems(packageCode))
    setIsBatchApproveConfirmOpen(false)
    showToast('Đã phê duyệt nhanh toàn bộ các hạng mục hợp lệ trong gói đề xuất!')
  }

  // PM Assign Crew handler
  const handleCrewChange = (itemId: string, newCrew: string) => {
    repairService.updateItemDecision(packageCode, itemId, { assigned_crew: newCrew })
    setItems(repairService.getItems(packageCode))
    showToast(`Đã cập nhật phân công đội thi công: [${newCrew}] cho hạng mục!`)
  }

  // Dispatch Work Order submit
  const handleConfirmDispatch = () => {
    repairService.dispatchPackage(packageCode, dispatchDeadline, dispatchNotice)
    setIsDispatchModalOpen(false)
    showToast(
      `Đã phát Lệnh công tác thi công (Work Order) thành công cho ${stats.approved} hạng mục đã APPROVED! Hạn hoàn thành: ${dispatchDeadline}`
    )
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

      {/* 1. BREADCRUMB & WORKFLOW STEP IDENTIFIER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav aria-label="Đường dẫn trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
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
          <span className="font-semibold text-slate-900">Gói đề xuất {packageCode}</span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate(`${basePath}/proposals`)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E5E9] hover:bg-slate-100 text-slate-700 rounded-full text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
            <span>Quy trình kỹ thuật: WF-07 (Thẩm duyệt &amp; Điều phối)</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER SECTION (Stitch 10 High Architectural Contrast) */}
      <div className="bg-white border border-[#E2E5E9] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sansation">
                {packageName} ({packageCode})
              </h1>
              {stats.approved === stats.total ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DECIDED - Đã phê duyệt 100%</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping opacity-75"></span>
                  <span>SUBMITTED - Chờ Supervisor phê duyệt</span>
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Milestone className="w-4 h-4 text-[#C9A227]" />
                <span>Tuyến QL1A • Đoạn Km 1024 - Km 1045</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                <span>Lập bởi PM Lê Tuấn • 25/08/2026</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-[#C9A227] font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Mức độ ưu tiên: Khẩn cấp cấp II</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons (Supervisor vs PM Hand-off) */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* Nút duyệt nhanh cho Supervisor */}
            {isSupervisor && (
              <button
                onClick={() => setIsBatchApproveConfirmOpen(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-[#E2E5E9] text-slate-800 hover:bg-slate-50 transition-colors rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Duyệt nhanh tất cả mục hợp lệ</span>
              </button>
            )}

            {/* Nút Xuất PDF */}
            <button
              onClick={() => showToast(`Đang kết xuất hồ sơ thẩm duyệt gói [${packageCode}] sang tệp PDF tiêu chuẩn...`)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-[#E2E5E9] text-slate-800 hover:bg-slate-50 transition-colors rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-slate-600" />
              <span>Xuất hồ sơ gói (PDF)</span>
            </button>

            {/* Nút Phát lệnh xuất quân Dispatch */}
            <div className="relative group">
              <button
                onClick={() => setIsDispatchModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#C9A227] text-white hover:bg-[#B38E1F] transition-all rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Giao việc cho đội thi công (Dispatch)</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-medium">
                Đã sẵn sàng giao {stats.approved}/{stats.total} hạng mục kỹ thuật đã có phê duyệt chính thức từ
                Supervisor.
              </div>
            </div>
          </div>
        </div>

        {/* Role Guard Compliance Alert Banner */}
        <div className="flex items-start gap-3 bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl text-xs text-slate-700">
          <ShieldAlert className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <strong className="text-slate-900 font-bold">Quy định thẩm quyền kỹ thuật:</strong>{' '}
            Supervisor chịu trách nhiệm phê duyệt giải pháp vật liệu, phương pháp kỹ thuật &amp; khối lượng thi công từng
            vị trí hỏng hóc. PM chỉ được phát lệnh hiện trường (Dispatch) cho các hạng mục đã hoàn tất phê duyệt (
            <strong className="text-emerald-700 font-bold">APPROVED</strong>).
          </div>
        </div>
      </div>

      {/* 3. APPROVAL SUMMARY BAR & TECHNICAL BREAKDOWN (Zero Money!) */}
      <section className="bg-white border border-[#E2E5E9] p-6 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Stacked Progress & Metric Pills */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-base text-slate-900">Tiến độ thẩm định kỹ thuật</span>
                <span className="font-mono text-xs bg-slate-100 px-3 py-0.5 rounded-full text-slate-700 font-semibold border border-slate-200">
                  {stats.approved}/{stats.total} Hạng mục
                </span>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Tỷ lệ thông qua: <strong className="text-slate-900 font-bold">{stats.percent}%</strong>
              </span>
            </div>

            {/* Stacked Multi-Segment Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3.5 flex overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-[#C9A227] h-full rounded-l-full transition-all duration-300"
                style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                title={`${stats.approved} Đã duyệt`}
              ></div>
              <div
                className="bg-[#0284C7] h-full transition-all duration-300"
                style={{ width: `${(stats.evidence / stats.total) * 100}%` }}
                title={`${stats.evidence} Cần bổ sung bằng chứng`}
              ></div>
              <div
                className="bg-[#DC2626] h-full rounded-r-full transition-all duration-300"
                style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
                title={`${stats.rejected} Từ chối`}
              ></div>
            </div>

            {/* Metric Pills Cluster (All rounded-full) */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 font-medium border border-[#E2E5E9]">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>
                  Tổng: <strong>{stats.total}</strong> hạng mục
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF9E7] text-[#92700C] font-semibold border border-[#FDE68A]">
                <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                <span>
                  Đã duyệt: <strong>{stats.approved}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold border border-[#BAE6FD]">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                <span>
                  Cần bằng chứng: <strong>{stats.evidence}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-semibold border border-[#FECACA]">
                <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                <span>
                  Từ chối: <strong>{stats.rejected}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Technical Volume Breakdown (Zero Money / Zero VNĐ) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#F8F9FA] border border-[#E2E5E9] p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-[#92700C] font-bold uppercase tracking-wider block">
                Tổng diện tích thi công đã duyệt:
              </span>
              <span className="text-xl font-black text-[#92700C] block">
                {stats.approvedArea} <span className="text-xs font-normal text-slate-500">m²</span>
              </span>
              <span className="text-[11px] text-slate-500 block">
                Trên tổng số {stats.totalProposedArea} m² đề xuất
              </span>
            </div>

            <div className="bg-[#F8F9FA] border border-[#E2E5E9] p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                Thời gian thi công dự kiến:
              </span>
              <span className="text-xl font-bold text-slate-900 block">
                4 <span className="text-xs font-normal text-slate-500">ngày</span>
              </span>
              <span className="text-[11px] text-slate-500 block">Thời hạn hoàn thành: 28/08/2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORK PACKAGE ITEMS LIST TABLE SECTION */}
      <section className="bg-white border border-[#E2E5E9] rounded-2xl shadow-sm p-6 space-y-4">
        {/* Table Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-lg text-slate-900 font-sansation">
              Danh sách hạng mục kỹ thuật trong gói đề xuất
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm tra cao độ, khối lượng bóc tách và phân công tổ thi công cơ giới
            </p>
          </div>

          {/* Quick Filter Pills (Rounded Full) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-[#E2E5E9] text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => {
                setFilterTab('ALL')
                setCurrentPage(1)
              }}
              type="button"
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => {
                setFilterTab('PENDING')
                setCurrentPage(1)
              }}
              type="button"
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'PENDING'
                  ? 'bg-white text-amber-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ duyệt ({stats.pending})
            </button>
            <button
              onClick={() => {
                setFilterTab('APPROVED')
                setCurrentPage(1)
              }}
              type="button"
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'APPROVED'
                  ? 'bg-white text-[#1B5E20] shadow-2xs font-bold'
                  : 'text-[#1B5E20] hover:bg-white/50'
              }`}
            >
              Đã duyệt ({stats.approved})
            </button>
            <button
              onClick={() => {
                setFilterTab('REQUEST_EVIDENCE')
                setCurrentPage(1)
              }}
              type="button"
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'REQUEST_EVIDENCE'
                  ? 'bg-white text-[#0284C7] shadow-2xs font-bold'
                  : 'text-[#0284C7] hover:bg-white/50'
              }`}
            >
              Cần bằng chứng ({stats.evidence + stats.reconsider})
            </button>
            <button
              onClick={() => {
                setFilterTab('REJECTED')
                setCurrentPage(1)
              }}
              type="button"
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'REJECTED'
                  ? 'bg-white text-[#DC2626] shadow-2xs font-bold'
                  : 'text-[#DC2626] hover:bg-white/50'
              }`}
            >
              Từ chối ({stats.rejected})
            </button>
          </div>
        </div>

        {/* Search Row */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo mã item, defect, lý trình, giải pháp..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#C9A227] transition-all font-medium"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            Hiển thị {displayedItems.length} trên {filteredItems.length} hạng mục phù hợp
          </span>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8F9FA] border-y border-[#E2E5E9] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Mã &amp; Khuyết tật</th>
                <th className="py-3 px-3">Vị trí &amp; Lý trình</th>
                <th className="py-3 px-3">Hư hại &amp; Đo đạc</th>
                <th className="py-3 px-3">Phương án kỹ thuật</th>
                <th className="py-3 px-3 text-right">Khối lượng kỹ thuật</th>
                <th className="py-3 px-3 text-center">Trạng thái duyệt</th>
                <th className="py-3 px-3 text-center">Thao tác Thẩm định</th>
                <th className="py-3 px-3 rounded-r-lg">Phân công Crew (PM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9]">
              {displayedItems.map((item) => {
                const isItemApproved = item.status === 'APPROVED'
                const isItemEvidence = item.status === 'REQUEST_EVIDENCE'
                const isItemReconsider = item.status === 'REQUEST_RECONSIDER'
                const isItemRejected = item.status === 'REJECTED'

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/70 ${
                      isItemEvidence || isItemReconsider ? 'bg-sky-50/20' : ''
                    }`}
                  >
                    {/* Cột 1: Mã & Khuyết tật */}
                    <td className="py-3.5 px-3 align-top whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        {/* Thumbnail ảnh hiện trường bấm để phóng to */}
                        <div
                          onClick={() => setViewingPhotoItem(item)}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer relative group"
                          title="Bấm để xem ảnh chi tiết"
                        >
                          <img
                            src={item.image_url}
                            alt={item.defect_title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div>
                          <span className="font-mono font-bold text-slate-900 block">{item.item_code}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{item.defect_code}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Vị trí & Lý trình */}
                    <td className="py-3.5 px-3 align-top whitespace-nowrap">
                      <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold text-slate-800 border border-slate-200">
                        {item.chainage}
                      </span>
                      <span className="block text-slate-500 text-[11px] mt-1 font-medium">{item.lane_info}</span>
                    </td>

                    {/* Cột 3: Hư hại & Đo đạc */}
                    <td className="py-3.5 px-3 align-top min-w-[180px]">
                      <span className="font-semibold text-slate-900 block">{item.defect_title}</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">{item.defect_measurements}</span>
                    </td>

                    {/* Cột 4: Phương án kỹ thuật */}
                    <td className="py-3.5 px-3 align-top min-w-[220px]">
                      <span className="text-slate-900 font-medium block">{item.solution_title}</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">{item.solution_standard}</span>
                      {/* Ghi chú phản hồi nếu có */}
                      {isItemEvidence && (
                        <div className="text-[#0284C7] text-[11px] font-semibold flex items-center gap-1 mt-1 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>Đang mở phiên giải trình bổ sung bằng chứng</span>
                        </div>
                      )}
                      {isItemReconsider && (
                        <div className="text-amber-700 text-[11px] font-semibold flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          <span>Yêu cầu PM xem xét lại giải pháp</span>
                        </div>
                      )}
                      {isItemRejected && item.supervisor_notes && (
                        <div className="text-rose-700 text-[11px] font-medium flex items-start gap-1 mt-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.supervisor_notes}</span>
                        </div>
                      )}
                    </td>

                    {/* Cột 5: Khối lượng kỹ thuật (Zero Money) */}
                    <td className="py-3.5 px-3 align-top text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 text-sm">{item.volume_display}</span>
                      <span className="text-[11px] text-slate-500 block">{item.volume_sub}</span>
                    </td>

                    {/* Cột 6: Trạng thái duyệt */}
                    <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                      {isItemApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDF7ED] text-[#1B5E20] font-bold text-[11px] border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          APPROVED
                        </span>
                      )}
                      {isItemEvidence && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-[11px] border border-sky-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          REQUEST_EVIDENCE
                        </span>
                      )}
                      {isItemReconsider && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                          <RotateCcw className="w-3.5 h-3.5" />
                          RECONSIDER
                        </span>
                      )}
                      {isItemRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-bold text-[11px] border border-rose-200">
                          <X className="w-3.5 h-3.5" />
                          REJECTED
                        </span>
                      )}
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
                          <Clock className="w-3.5 h-3.5" />
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Cột 7: Thao tác Thẩm định (4 Nút tròn chuẩn Stitch 10) */}
                    <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-[#E2E5E9]">
                        {/* Nút 1: Duyệt */}
                        <button
                          onClick={() => handleQuickApproveItem(item.id)}
                          type="button"
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                            isItemApproved
                              ? 'bg-[#EDF7ED] text-[#1B5E20] shadow-xs ring-1 ring-emerald-300'
                              : 'bg-white text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title="Phê duyệt mục này (APPROVED)"
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        {/* Nút 2: Yêu cầu thêm bằng chứng */}
                        <button
                          onClick={() => handleOpenDecisionModal(item, 'EVIDENCE')}
                          type="button"
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                            isItemEvidence
                              ? 'bg-[#0284C7] text-white shadow-xs'
                              : 'bg-white text-slate-500 hover:text-[#0284C7] hover:bg-sky-50'
                          }`}
                          title="Yêu cầu bổ sung ảnh/thước đo thực địa (REQUEST_EVIDENCE)"
                        >
                          <Camera className="w-4 h-4" />
                        </button>

                        {/* Nút 3: Yêu cầu xem xét lại */}
                        <button
                          onClick={() => handleOpenDecisionModal(item, 'RECONSIDER')}
                          type="button"
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                            isItemReconsider
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                          title="Yêu cầu PM xem xét lại giải pháp (REQUEST_RECONSIDER)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Nút 4: Từ chối */}
                        <button
                          onClick={() => handleOpenDecisionModal(item, 'REJECT')}
                          type="button"
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                            isItemRejected
                              ? 'bg-[#DC2626] text-white shadow-xs'
                              : 'bg-white text-slate-500 hover:text-[#DC2626] hover:bg-rose-50'
                          }`}
                          title="Từ chối giải pháp kỹ thuật (REJECTED)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Cột 8: Phân công Crew (PM) */}
                    <td className="py-3.5 px-3 align-top whitespace-nowrap">
                      {isItemApproved ? (
                        <select
                          value={item.assigned_crew}
                          onChange={(e) => handleCrewChange(item.id, e.target.value)}
                          className="w-48 bg-white border border-[#E2E5E9] text-slate-800 text-xs py-1.5 px-2.5 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium cursor-pointer"
                        >
                          {CREW_OPTIONS.map((crew) => (
                            <option key={crew} value={crew}>
                              {crew}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative group/sel">
                          <select
                            disabled
                            className="w-48 bg-slate-100 text-slate-400 text-xs py-1.5 px-2.5 rounded-lg border border-[#E2E5E9] cursor-not-allowed font-medium"
                          >
                            <option>
                              {isItemRejected ? '-- Bị từ chối phương án --' : '-- Chưa thể phân công --'}
                            </option>
                          </select>
                          <div className="absolute bottom-full left-0 mb-1 w-52 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-lg hidden group-hover/sel:block z-10 font-medium">
                            Chỉ phân công khi Supervisor đã APPROVED.
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}

              {displayedItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Không có hạng mục nào phù hợp với bộ lọc!</p>
                    <p className="text-xs text-slate-400 mt-1">Vui lòng thay đổi từ khóa hoặc chọn tab khác.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination / Summary Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E5E9] text-xs text-slate-600">
          <div>
            Hiển thị <span className="font-bold text-slate-900">{displayedItems.length}</span> trên{' '}
            <span className="font-bold text-slate-900">{filteredItems.length}</span> hạng mục được lập kế hoạch đợt 3
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              type="button"
              className="px-2.5 py-1.5 rounded-lg border border-[#E2E5E9] bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  type="button"
                  className={`w-8 h-8 rounded-full font-bold text-xs transition cursor-pointer ${
                    currentPage === p
                      ? 'bg-[#C9A227] text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              type="button"
              className="px-2.5 py-1.5 rounded-lg border border-[#E2E5E9] bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST EVIDENCE / RECONSIDER / REJECTION MODAL (Stitch 10)     */}
      {/* ========================================================================= */}
      {activeModalItem && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          {/* Backdrop Blur */}
          <div
            onClick={() => setActiveModalItem(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="bg-[#F8F9FA] border-b border-[#E2E5E9] p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#92700C] flex items-center justify-center shrink-0 shadow-2xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-sansation">
                    Yêu cầu bổ sung bằng chứng / Từ chối duyệt phương án
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Mã hạng mục: {activeModalItem.item_code} ({activeModalItem.defect_code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Technical Context Pill Card */}
              <div className="bg-[#F8F9FA] border border-[#E2E5E9] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {activeModalItem.chainage} ({activeModalItem.lane_info})
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">{activeModalItem.solution_title}</span>
                </div>
                <span className="font-mono font-bold text-[#92700C]">
                  Diện tích: {activeModalItem.volume_display} • Sâu: {activeModalItem.volume_sub}
                </span>
              </div>

              {/* Radio Switch for Technical Action Type */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-900 block font-sansation">
                  Loại phản hồi kỹ thuật của Supervisor:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Yêu cầu thêm bằng chứng */}
                  <label
                    onClick={() => setModalFeedbackType('EVIDENCE')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      modalFeedbackType === 'EVIDENCE'
                        ? 'bg-[#FEF9E7] border-[#C9A227] ring-1 ring-[#C9A227]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-type"
                      checked={modalFeedbackType === 'EVIDENCE'}
                      onChange={() => setModalFeedbackType('EVIDENCE')}
                      className="mt-0.5 accent-[#C9A227]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#92700C] block">Cần bằng chứng</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Thước đo độ sâu, ảnh lún nứt chi tiết
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Yêu cầu xem lại phương án */}
                  <label
                    onClick={() => setModalFeedbackType('RECONSIDER')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      modalFeedbackType === 'RECONSIDER'
                        ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-type"
                      checked={modalFeedbackType === 'RECONSIDER'}
                      onChange={() => setModalFeedbackType('RECONSIDER')}
                      className="mt-0.5 accent-amber-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-amber-800 block">Xem lại giải pháp</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Điều chỉnh chiều dày hoặc vật liệu móng
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Từ chối giải pháp kỹ thuật */}
                  <label
                    onClick={() => setModalFeedbackType('REJECT')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      modalFeedbackType === 'REJECT'
                        ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-type"
                      checked={modalFeedbackType === 'REJECT'}
                      onChange={() => setModalFeedbackType('REJECT')}
                      className="mt-0.5 text-rose-600 accent-rose-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-rose-700 block">Từ chối phương án</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Sai quy chuẩn hoặc trùng lặp gói khác
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Technical Explanation Textarea */}
              <div className="space-y-1.5">
                <label htmlFor="supervisor-notes" className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>
                    Nội dung giải trình kỹ thuật của Supervisor <span className="text-rose-600">*</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Gửi trực tiếp đến PM &amp; Đội đo đạc</span>
                </label>
                <textarea
                  id="supervisor-notes"
                  rows={4}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full rounded-xl bg-white border border-[#E2E5E9] text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition-all resize-none shadow-2xs font-medium"
                  placeholder="Nhập lý do cụ thể và yêu cầu kỹ thuật chi tiết đối với hạng mục này..."
                />
              </div>

              {/* Specific Field Directives (Checkboxes) */}
              <div className="space-y-2 bg-[#F8F9FA] border border-[#E2E5E9] p-3.5 rounded-xl text-xs">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  Chỉ thị bổ sung hiện trường:
                </span>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.laser}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, laser: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Yêu cầu đo đạc lại hiện trường bằng máy laser thủy bình hoặc thước 3m</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.height}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, height: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Yêu cầu đo đạc lại cao độ trắc dọc và bề dày lớp móng cấp phối đá dăm</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.close_photo}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, close_photo: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Chụp lại ảnh cận cảnh có đặt thước tỷ lệ chuẩn 50cm</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.core_sample}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, core_sample: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Khoan mẫu kiểm tra độ chặt lớp móng K98</span>
                </label>
              </div>

              {/* Visual Evidence Preview Thumbnail */}
              <div className="flex items-center gap-3 bg-[#F8F9FA] border border-[#E2E5E9] p-2.5 rounded-xl">
                <img
                  src={activeModalItem.image_url}
                  alt={activeModalItem.defect_title}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-semibold text-slate-900 block truncate font-mono">
                    {activeModalItem.ortho_code}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Tọa độ: {activeModalItem.gps_coords} • {activeModalItem.resolution}
                  </span>
                </div>
                <button
                  onClick={() => setViewingPhotoItem(activeModalItem)}
                  type="button"
                  className="px-3 py-1.5 bg-white border border-[#E2E5E9] text-[#92700C] rounded-lg text-xs font-bold font-sansation hover:bg-slate-50 transition shrink-0 cursor-pointer"
                >
                  Xem ảnh gốc
                </button>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-[#F8F9FA] border-t border-[#E2E5E9] px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setActiveModalItem(null)}
                type="button"
                className="px-4 h-9 bg-white border border-[#E2E5E9] text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitDecisionModal}
                type="button"
                className={`px-5 h-9 text-white transition rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer ${
                  modalFeedbackType === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#C9A227] hover:bg-[#B38E1F]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Xác nhận gửi quyết định</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DISPATCH WORK ORDER MODAL (PM / SUPERVISOR)                     */}
      {/* ========================================================================= */}
      {isDispatchModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsDispatchModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#F8F9FA] border-b border-[#E2E5E9] p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-sansation">
                    Ban hành Lệnh công tác thi công (Work Order Dispatch)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Gói: {packageCode} • {stats.approved} hạng mục đã có quyết định APPROVED
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 leading-relaxed">
                <strong>Điều kiện bàn giao hợp lệ:</strong> Toàn bộ {stats.approved} hạng mục dưới đây đã được
                Supervisor phê duyệt chính thức giải pháp kỹ thuật và khối lượng. Các hạng mục chưa đạt (
                {stats.total - stats.approved}) sẽ được tiếp tục giải trình ở đợt sau.
              </div>

              {/* Danh sách các item Approved */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  Danh sách hạng mục bàn giao xuất quân:
                </span>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {items
                    .filter((i) => i.status === 'APPROVED')
                    .map((item) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-mono font-bold text-slate-800">{item.item_code}</span>
                          <span className="text-slate-500">({item.chainage})</span>
                          <span className="text-slate-700 font-medium truncate max-w-xs">{item.defect_title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-[#92700C]">{item.volume_display}</span>
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 font-semibold">
                            {item.assigned_crew}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Thời hạn hoàn thành thi công (Deadline):</label>
                  <input
                    type="text"
                    value={dispatchDeadline}
                    onChange={(e) => setDispatchDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Người phát lệnh (PM / Điều phối):</label>
                  <input
                    type="text"
                    disabled
                    value="Kỹ sư Đỗ Quốc Hoàng (Project Manager)"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Chỉ dẫn an toàn giao thông &amp; tổ chức phân luồng:
                </label>
                <textarea
                  rows={3}
                  value={dispatchNotice}
                  onChange={(e) => setDispatchNotice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A227] resize-none font-medium"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#F8F9FA] border-t border-[#E2E5E9] px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-[#E2E5E9] text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDispatch}
                type="button"
                className="px-5 h-9 bg-[#C9A227] hover:bg-[#B38E1F] text-white transition rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát lệnh xuất quân (Dispatch)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BATCH APPROVE ALL CONFIRMATION MODAL                            */}
      {/* ========================================================================= */}
      {isBatchApproveConfirmOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsBatchApproveConfirmOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-md overflow-hidden z-10 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-900 font-sansation">Phê duyệt nhanh tất cả mục hợp lệ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn phê duyệt thông qua toàn bộ các hạng mục chưa duyệt trong gói{' '}
                <strong className="text-slate-900">{packageCode}</strong>? Sau khi duyệt, PM có quyền phát lệnh thi công
                ngay cho hiện trường.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Số hạng mục sẽ chuyển APPROVED:</span>
                <span className="font-bold text-slate-900">{stats.total - stats.approved} mục</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng diện tích thi công hoàn tất:</span>
                <span className="font-mono font-bold text-[#92700C]">{stats.totalProposedArea} m²</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsBatchApproveConfirmOpen(false)}
                type="button"
                className="w-1/2 h-10 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleBatchApproveAll}
                type="button"
                className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-bold text-xs shadow-sm cursor-pointer"
              >
                Xác nhận phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DEFECT ORIGINAL PHOTO & EXIF LIGHTBOX MODAL                     */}
      {/* ========================================================================= */}
      {viewingPhotoItem && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setViewingPhotoItem(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          ></div>

          <div className="relative bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full z-10 border border-slate-700 max-h-[95vh] flex flex-col">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#C9A227]">{viewingPhotoItem.item_code}</span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-sm">{viewingPhotoItem.defect_title}</span>
                <span className="text-xs text-slate-400 font-mono">({viewingPhotoItem.chainage})</span>
              </div>
              <button
                onClick={() => setViewingPhotoItem(null)}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview with Bounding Box Overlay Simulation */}
            <div className="relative bg-black flex items-center justify-center overflow-hidden flex-1 min-h-[380px] max-h-[550px]">
              <img
                src={viewingPhotoItem.image_url}
                alt={viewingPhotoItem.defect_title}
                className="max-h-full max-w-full object-contain"
              />

              {/* Bounding box marker */}
              <div className="absolute top-1/4 left-1/3 w-40 h-28 border-2 border-[#C9A227] bg-[#C9A227]/20 rounded-md pointer-events-none">
                <span className="absolute -top-6 left-0 bg-[#C9A227] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                  {viewingPhotoItem.defect_measurements}
                </span>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A227]" /> GPS: {viewingPhotoItem.gps_coords}
                </span>
                <span>File: {viewingPhotoItem.ortho_code}</span>
                <span>Độ phân giải: {viewingPhotoItem.resolution}</span>
              </div>
              <button
                onClick={() => setViewingPhotoItem(null)}
                className="px-4 py-1.5 bg-[#C9A227] text-white font-bold rounded-xl text-xs hover:bg-[#B38E1F] transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
