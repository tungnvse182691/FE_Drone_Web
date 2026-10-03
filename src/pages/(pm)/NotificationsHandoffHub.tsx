import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Send,
  Boxes,
  Users2,
  Calendar,
  Sparkles,
  RefreshCw,
  Home,
  Sliders,
  Play,
  PlayCircle,
  Square,
  Activity,
  Bot,
  PlaneTakeoff,
  Layers,
  Wrench,
  HelpCircle,
  Settings,
  Inbox
} from 'lucide-react'

// --- Interface Thông Báo theo chuẩn Backend v2.2 (OpenAPI & Realtime Spec) ---
export interface NotificationItem {
  id: string
  category: 'ACTION_REQUIRED' | 'HANDOVER' | 'AI_SYSTEM' | 'FIELD_CREW'
  categoryLabel: string
  title: string
  message: string
  resourceType: 'REPAIR_PROPOSAL' | 'FIELD_TASK' | 'DEFECT' | 'SURVEY_MISSION' | 'ACCEPTANCE_DOSSIER'
  resourceId: string
  routeCode: string
  stationing: string
  sender: string
  senderRole: string
  recipientRole: RoleCode | 'ALL'
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL'
  slaHoursRemaining?: number // Số giờ còn lại trước khi vi phạm SLA
  slaType?: 'SLA-EMERG-2h' | 'SLA-FT-24h' | 'SLA-APPR-48h' | 'SLA-ACCEPT-72h'
  read: boolean
  occurredAt: string
  timeAgo: string
  actionUrl: string
  actionLabel: string
}

export const NotificationsHandoffHub: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // --- AUDIO SYNTHESIZER (Web Audio API - Không phụ thuộc file ngoại tuyến) ---
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true)
  const [audioVolume, setAudioVolume] = useState<number>(0.8)
  const [audioMode, setAudioMode] = useState<{
    emergencySiren: boolean
    slaChime: boolean
    handoverPing: boolean
  }>({
    emergencySiren: true,
    slaChime: true,
    handoverPing: true
  })

  const audioCtxRef = useRef<AudioContext | null>(null)

  // Hàm phát âm thanh kiểm tra hoặc cảnh báo
  const playSound = (type: 'EMERGENCY' | 'SLA_WARNING' | 'PING') => {
    if (!isAudioEnabled) return

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioContextClass()
      }

      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime

      if (type === 'EMERGENCY' && audioMode.emergencySiren) {
        // Còi cảnh báo 2 âm tần số 880Hz -> 1200Hz
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(880, now)
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.18)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.36)

        gain.gain.setValueAtTime(audioVolume * 0.45, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.45)
      } else if (type === 'SLA_WARNING' && audioMode.slaChime) {
        // Âm beep cảnh báo đứt quãng 3 tiếng
        [0, 0.12, 0.24].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(750, now + offset)
          gain.gain.setValueAtTime(audioVolume * 0.35, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08)

          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.08)
        })
      } else if (type === 'PING' && audioMode.handoverPing) {
        // Âm ping chuông nhẹ nhàng (Ding)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(659.25, now) // Mi (E5)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08) // La (A5)

        gain.gain.setValueAtTime(audioVolume * 0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.5)
      }
    } catch {
      // Audio context bị chặn bởi trình duyệt nếu chưa có tương tác
    }
  }

  // --- DỮ LIỆU THÔNG BÁO VÀ BÀN GIAO CHUẨN BACKEND V2.2 ---
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    // === DÀNH RIÊNG CHO SUPERVISOR (GIÁM SÁT / CĐT) ===
    {
      id: 'notif-sup-01',
      category: 'ACTION_REQUIRED',
      categoryLabel: 'Yêu cầu thẩm duyệt',
      title: 'Bàn giao thẩm duyệt Gói đề xuất sửa chữa đợt 3 (PKG-2026-08)',
      message: 'PM Đỗ Quốc Hoàng đã hoàn tất lập hồ sơ thiết kế BOQ 4 hạng mục trên QL1A Km 1032. Hồ sơ đang chờ Supervisor thẩm định và phê duyệt theo FR-19.',
      resourceType: 'REPAIR_PROPOSAL',
      resourceId: 'PKG-2026-08',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1032+450',
      sender: 'Kỹ sư Đỗ Quốc Hoàng (PM)',
      senderRole: 'Project Manager',
      recipientRole: RoleCode.SUPERVISOR,
      priority: 'HIGH',
      slaHoursRemaining: 3.5,
      slaType: 'SLA-APPR-48h',
      read: false,
      occurredAt: '15 phút trước',
      timeAgo: '15 phút trước',
      actionUrl: '/sup/proposals/PKG-2026-08',
      actionLabel: 'Thẩm duyệt hồ sơ ngay'
    },
    {
      id: 'notif-sup-02',
      category: 'HANDOVER',
      categoryLabel: 'Bàn giao nghiệm thu',
      title: 'Bàn giao Biên bản nghiệm thu thi công hiện trường (ACC-2026-04)',
      message: 'Đội thi công sửa chữa Hoàng Hải 01 đã nộp đủ bộ ảnh Trước/Sau kèm mã hash SHA-256 đối chiếu 3 hạng mục thảm bê tông nhựa. Chờ Supervisor nghiệm thu hiện trường.',
      resourceType: 'ACCEPTANCE_DOSSIER',
      resourceId: 'ACC-2026-04',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1025+000 - Km 1026+500',
      sender: 'Kỹ sư Kiên (Chỉ huy đội 01)',
      senderRole: 'Đội thi công Hoàng Hải',
      recipientRole: RoleCode.SUPERVISOR,
      priority: 'HIGH',
      slaHoursRemaining: 18.0,
      slaType: 'SLA-ACCEPT-72h',
      read: false,
      occurredAt: '1 giờ trước',
      timeAgo: '1 giờ trước',
      actionUrl: '/sup/acceptance',
      actionLabel: 'Kiểm tra biên bản nghiệm thu'
    },
    {
      id: 'notif-sup-03',
      category: 'ACTION_REQUIRED',
      categoryLabel: 'Xác nhận tuyến',
      title: 'Yêu cầu thẩm định & Khóa phiên bản tim tuyến (RoadSectionVersion v2.1)',
      message: 'PM Đỗ Quốc Hoàng đã hoàn tất cập nhật tim đường GPX và chia phân đoạn Km 1020 - Km 1045. Đang chờ Supervisor thẩm tra và bấm Khóa xác nhận (LOCK) theo FR-07.',
      resourceType: 'FIELD_TASK',
      resourceId: 'ALIGN-2026-02',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1020+000 - Km 1045+000',
      sender: 'PM Đỗ Quốc Hoàng',
      senderRole: 'Project Manager',
      recipientRole: RoleCode.SUPERVISOR,
      priority: 'HIGH',
      slaHoursRemaining: 6.0,
      slaType: 'SLA-APPR-48h',
      read: false,
      occurredAt: '45 phút trước',
      timeAgo: '45 phút trước',
      actionUrl: '/sup/alignment',
      actionLabel: 'Thẩm tra & Khóa tuyến'
    },
    {
      id: 'notif-sup-04',
      category: 'HANDOVER',
      categoryLabel: 'Ký số đóng đợt',
      title: 'Hồ sơ đủ điều kiện Ký số đóng đợt sửa chữa (Sign-off Ready)',
      message: 'Đợt sửa chữa PKG-2026-05 đã hoàn thành 100% hạng mục đạt tiêu chuẩn nghiệm thu hiện trường (PASSED). Hồ sơ pháp lý đã sẵn sàng để Supervisor cắm chữ ký số đóng đợt theo FR-23.',
      resourceType: 'ACCEPTANCE_DOSSIER',
      resourceId: 'SIGNOFF-PKG-05',
      routeCode: 'QL1A • PK-04',
      stationing: 'Toàn tuyến PK-04',
      sender: 'Ban Quản Lý Chất Lượng Hoàng Hải',
      senderRole: 'Hệ thống kiểm soát nghiệm thu',
      recipientRole: RoleCode.SUPERVISOR,
      priority: 'HIGH',
      slaHoursRemaining: 12.0,
      slaType: 'SLA-ACCEPT-72h',
      read: false,
      occurredAt: '2 giờ trước',
      timeAgo: '2 giờ trước',
      actionUrl: '/sup/signoff',
      actionLabel: 'Mở màn hình Ký số đóng đợt'
    },
    {
      id: 'notif-sup-05',
      category: 'ACTION_REQUIRED',
      categoryLabel: 'Cảnh báo rủi ro',
      title: 'CẢNH BÁO RỦI RO: Đoạn Km 1028 - Km 1030 suy thoái chỉ số PCI vượt ngưỡng',
      message: 'Hệ thống phân tích rủi ro phát hiện chỉ số rủi ro bảo hành tăng 24% sau đợt mưa lũ. Đề nghị Supervisor kích hoạt chế độ giám sát trọng điểm và yêu cầu PM lập kế hoạch dự phòng.',
      resourceType: 'DEFECT',
      resourceId: 'RISK-ALERT-09',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1028+000 - Km 1030+000',
      sender: 'Hệ thống Phân tích Rủi ro & Suy thoái',
      senderRole: 'AI Risk Engine',
      recipientRole: RoleCode.SUPERVISOR,
      priority: 'EMERGENCY',
      slaHoursRemaining: 2.0,
      slaType: 'SLA-EMERG-2h',
      read: false,
      occurredAt: '1 giờ trước',
      timeAgo: '1 giờ trước',
      actionUrl: '/sup/risk-analytics',
      actionLabel: 'Xem bản đồ phân tích rủi ro'
    },
    {
      id: 'notif-sup-06',
      category: 'AI_SYSTEM',
      categoryLabel: 'Chất lượng bay Drone',
      title: 'Báo cáo tổng hợp chất lượng ảnh bay Drone chuyến QL1A-MS-04B',
      message: 'Chuyến bay đã nộp dữ liệu video 4K kèm file phụ đề SRT telemetry đầy đủ. Tỷ lệ phủ ảnh đạt 98.2%, độ cao bay trung bình 25m, sai số vị trí < 1.2m.',
      resourceType: 'SURVEY_MISSION',
      resourceId: 'QL1A-MS-04B',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1024 - Km 1030',
      sender: 'Tổ bay Drone Hoàng Hải',
      senderRole: 'Drone Flight Operator',
      recipientRole: RoleCode.SUPERVISOR,
      priority: 'NORMAL',
      read: true,
      occurredAt: '4 giờ trước',
      timeAgo: '4 giờ trước',
      actionUrl: '/sup/surveys',
      actionLabel: 'Xem chi tiết chuyến bay'
    },

    // === DÀNH RIÊNG CHO PROJECT MANAGER (PM CHỈ HUY TRƯỞNG) ===
    {
      id: 'notif-pm-01',
      category: 'ACTION_REQUIRED',
      categoryLabel: 'Cảnh báo khẩn cấp',
      title: 'LỆNH ỨNG CỨU KHẨN CẤP: Ổ gà sụt sâu nguy cơ nổ lốp xe tải',
      message: 'Phát hiện ổ gà sâu 8.5cm tại Km 1033+110 làn xe tải nặng. Yêu cầu Đội cơ động số 03 lập tức xuất quân rào chắn, đổ đá dăm thông xe tạm thời trong 2 giờ.',
      resourceType: 'DEFECT',
      resourceId: 'DEF-2026-0105',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1033+110 (Làn phải R1)',
      sender: 'Tuần tra viên Lê Tuấn',
      senderRole: 'Đội tuần đường QL1A',
      recipientRole: RoleCode.PROJECT_MANAGER,
      priority: 'EMERGENCY',
      slaHoursRemaining: 1.2,
      slaType: 'SLA-EMERG-2h',
      read: false,
      occurredAt: '35 phút trước',
      timeAgo: '35 phút trước',
      actionUrl: '/pm/fast-track',
      actionLabel: 'Điều phối xuất quân khẩn cấp'
    },
    {
      id: 'notif-pm-02',
      category: 'AI_SYSTEM',
      categoryLabel: 'Xử lý dữ liệu AI',
      title: 'Hoàn tất phân tích Video AI chuyến bay quét QL1A-MS-04B',
      message: 'Mô hình Road-YOLOv9 đã phát hiện 8 khiếm khuyết sơ bộ (2 ổ gà, 3 nứt dọc, 1 hằn lún). Tuyến đạt tỷ lệ phủ ảnh 98% (Không còn điểm mù).',
      resourceType: 'SURVEY_MISSION',
      resourceId: 'QL1A-MS-04B',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1024+000 - Km 1030+000',
      sender: 'Hệ thống Drone AI Road-YOLOv9',
      senderRole: 'AI Analytics Server',
      recipientRole: RoleCode.PROJECT_MANAGER,
      priority: 'NORMAL',
      read: false,
      occurredAt: '2 giờ trước',
      timeAgo: '2 giờ trước',
      actionUrl: '/pm/drone-mission',
      actionLabel: 'Mở giao diện thẩm định AI'
    },
    {
      id: 'notif-pm-03',
      category: 'HANDOVER',
      categoryLabel: 'Phản hồi phê duyệt',
      title: 'Supervisor đã chấp thuận Phương án kỹ thuật Gói PKG-2026-07',
      message: 'Tư vấn giám sát đã duyệt 3/3 hạng mục dự toán BOQ và mở khóa trạng thái APPROVED. PM có thể tiến hành phân công Đội thi công ra hiện trường.',
      resourceType: 'REPAIR_PROPOSAL',
      resourceId: 'PKG-2026-07',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1028+900',
      sender: 'Supervisor GS-2041 (Ban QLDA)',
      senderRole: 'Giám sát trưởng',
      recipientRole: RoleCode.PROJECT_MANAGER,
      priority: 'NORMAL',
      read: true,
      occurredAt: '3 giờ trước',
      timeAgo: '3 giờ trước',
      actionUrl: '/pm/proposals',
      actionLabel: 'Xem chi tiết gói đã duyệt'
    },
    {
      id: 'notif-pm-04',
      category: 'FIELD_CREW',
      categoryLabel: 'Báo cáo hiện trường',
      title: 'Hoàn tất nhiệm vụ đo đạc trắc địa bổ sung (TSK-2026-018)',
      message: 'Tổ đo đạc 02 đã hoàn thành đo kích thước cơ khí 4 vị trí nứt rạn lưới mai tại Km 1029+400. Đã cập nhật số đo chiều dài 7.0m, khe nứt 2.8mm vào hồ sơ.',
      resourceType: 'FIELD_TASK',
      resourceId: 'TSK-2026-018',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1029+400',
      sender: 'Kỹ sư Minh (Tổ đo đạc 02)',
      senderRole: 'Đội đo đạc chuyên dụng',
      recipientRole: RoleCode.PROJECT_MANAGER,
      priority: 'NORMAL',
      read: true,
      occurredAt: '5 giờ trước',
      timeAgo: '5 giờ trước',
      actionUrl: '/pm/field-tasks',
      actionLabel: 'Xem dữ liệu đo đạc'
    },
    {
      id: 'notif-pm-05',
      category: 'ACTION_REQUIRED',
      categoryLabel: 'Nhắc việc SLA Fast Track',
      title: 'Cảnh báo sắp hết hạn SLA 24h: Vá dặm nguội ổ gà Km 1024+350',
      message: 'Lệnh Fast Track mã #DEF-2026-0101 giao cho Tổ 01 còn lại 4.5 giờ để hoàn tất và tải ảnh nghiệm thu Sau (AFTER). Yêu cầu kỹ sư đôn đốc tiến độ.',
      resourceType: 'DEFECT',
      resourceId: 'DEF-2026-0101',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1024+350',
      sender: 'Hệ thống kiểm soát SLA',
      senderRole: 'Quy tắc BR-08',
      recipientRole: RoleCode.PROJECT_MANAGER,
      priority: 'HIGH',
      slaHoursRemaining: 4.5,
      slaType: 'SLA-FT-24h',
      read: false,
      occurredAt: '6 giờ trước',
      timeAgo: '6 giờ trước',
      actionUrl: '/pm/fast-track',
      actionLabel: 'Đôn đốc tổ hiện trường'
    },
    {
      id: 'notif-pm-06',
      category: 'HANDOVER',
      categoryLabel: 'Yêu cầu sửa đổi hồ sơ',
      title: 'Yêu cầu điều chỉnh hồ sơ gói PKG-2026-06 (REVISION_REQUIRED)',
      message: 'Supervisor từ chối hạng mục bù bê tông nhựa do đơn giá nhân công lu lèn chưa đúng định mức Bộ GTVT. PM vui lòng điều chỉnh lại dự toán chi tiết.',
      resourceType: 'REPAIR_PROPOSAL',
      resourceId: 'PKG-2026-06',
      routeCode: 'QL1A • PK-04',
      stationing: 'Km 1030+200',
      sender: 'Supervisor GS-2041',
      senderRole: 'Giám sát trưởng',
      recipientRole: RoleCode.PROJECT_MANAGER,
      priority: 'HIGH',
      read: true,
      occurredAt: 'Hôm qua',
      timeAgo: 'Hôm qua',
      actionUrl: '/pm/proposals',
      actionLabel: 'Chỉnh sửa hồ sơ dự toán'
    }
  ])

  // Lọc thông báo
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTION_REQUIRED' | 'HANDOVER' | 'AI_SYSTEM' | 'FIELD_CREW'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'EMERGENCY' | 'HIGH' | 'NORMAL'>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false)

  // Modal cấu hình âm thanh & cảnh báo
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('Đã đánh dấu tất cả thông báo là đã đọc!')
  }

  // 1. Phân lập thông báo theo vai trò tài khoản hiện tại (RBAC Notification Isolation)
  // Chỉ tài khoản có đúng role mới nhìn thấy thông báo gửi đến role đó (hoặc thông báo 'ALL')
  const currentRole = user?.role || RoleCode.PROJECT_MANAGER
  const roleFilteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.recipientRole === 'ALL') return true
      return n.recipientRole === currentRole
    })
  }, [notifications, currentRole])

  // 2. Bộ lọc danh sách dựa trên các thông báo đã phân lập theo quyền
  const filteredNotifications = useMemo(() => {
    return roleFilteredNotifications.filter((n) => {
      // Tab filter
      if (activeTab !== 'ALL' && n.category !== activeTab) return false

      // Priority filter
      if (priorityFilter !== 'ALL' && n.priority !== priorityFilter) return false

      // Unread only toggle
      if (unreadOnly && n.read) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.resourceId.toLowerCase().includes(q) ||
          n.stationing.toLowerCase().includes(q) ||
          n.sender.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [roleFilteredNotifications, activeTab, priorityFilter, unreadOnly, searchQuery])

  // Thống kê đếm chuẩn xác theo vai trò hiện tại
  const unreadCount = roleFilteredNotifications.filter((n) => !n.read).length
  const emergencyCount = roleFilteredNotifications.filter((n) => n.priority === 'EMERGENCY' && !n.read).length
  const actionRequiredCount = roleFilteredNotifications.filter((n) => n.category === 'ACTION_REQUIRED' && !n.read).length
  const handoverCount = roleFilteredNotifications.filter((n) => n.category === 'HANDOVER').length
  const aiSystemCount = roleFilteredNotifications.filter((n) => n.category === 'AI_SYSTEM').length

  // Danh sách các mục có SLA cần theo dõi gấp của vai trò hiện tại
  const criticalSlaItems = useMemo(() => {
    return roleFilteredNotifications
      .filter((n) => n.slaHoursRemaining !== undefined && !n.read)
      .sort((a, b) => (a.slaHoursRemaining || 0) - (b.slaHoursRemaining || 0))
  }, [roleFilteredNotifications])

  // Giải quyết đường dẫn điều hướng tương thích đúng vai trò hiện tại (Tránh bị redirect về Dashboard)
  const resolveActionUrl = (item: NotificationItem) => {
    if (item.actionUrl) {
      if (isSupervisor && item.actionUrl.startsWith('/pm/')) {
        return item.actionUrl.replace('/pm/', '/sup/')
      }
      if (!isSupervisor && item.actionUrl.startsWith('/sup/')) {
        return item.actionUrl.replace('/sup/', '/pm/')
      }
      return item.actionUrl
    }
    switch (item.resourceType) {
      case 'REPAIR_PROPOSAL':
        return isSupervisor ? '/sup/proposals/PKG-2026-08' : '/pm/proposals'
      case 'DEFECT':
        return `${basePath}/fast-track`
      case 'ACCEPTANCE_DOSSIER':
        return `${basePath}/acceptance`
      case 'SURVEY_MISSION':
        return `${basePath}/drone-mission`
      case 'FIELD_TASK':
        return isSupervisor ? '/sup/surveys' : '/pm/field-tasks'
      default:
        return `${basePath}/dashboard`
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL CẤU HÌNH ÂM THANH & CẢNH BÁO SLA */}
      {isAudioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">Cấu Hình Cảnh Báo Âm Thanh (SLAAudio)</h3>
              </div>
              <button
                onClick={() => setIsAudioModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Công tắc tổng */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Bật còi &amp; chuông cảnh báo</span>
                  <span className="text-slate-500 text-[11px]">Phát âm thanh tức thì khi có sự kiện bàn giao mới</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAudioEnabled ? 'bg-[#C9A227]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      isAudioEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Slider Âm lượng */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Âm lượng phát:</span>
                  <span className="font-bold text-[#8F7212] font-mono">{Math.round(audioVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  disabled={!isAudioEnabled}
                  className="w-full accent-[#C9A227] cursor-pointer"
                />
              </div>

              {/* Tùy chọn từng kênh âm thanh */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Kênh cảnh báo chuyên biệt:</span>

                {/* 1. Emergency Siren */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Còi khẩn cấp 24/7 (Siren)</div>
                      <div className="text-[10px] text-slate-500">Khi có lỗi sụt lún nguy hiểm hoặc SLA &lt; 2h</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playSound('EMERGENCY')}
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-semibold text-[10px] cursor-pointer border border-red-200"
                    >
                      Thử âm
                    </button>
                    <input
                      type="checkbox"
                      checked={audioMode.emergencySiren}
                      onChange={(e) => setAudioMode({ ...audioMode, emergencySiren: e.target.checked })}
                      className="w-4 h-4 accent-[#C9A227] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. SLA Warning Beep */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Cảnh báo vi phạm thời hạn SLA</div>
                      <div className="text-[10px] text-slate-500">Đứt quãng 3 tiếng khi hồ sơ sắp quá hạn duyệt</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playSound('SLA_WARNING')}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md font-semibold text-[10px] cursor-pointer border border-amber-200"
                    >
                      Thử âm
                    </button>
                    <input
                      type="checkbox"
                      checked={audioMode.slaChime}
                      onChange={(e) => setAudioMode({ ...audioMode, slaChime: e.target.checked })}
                      className="w-4 h-4 accent-[#C9A227] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 3. Handover Ping */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">Chuông Ping bàn giao công việc</div>
                      <div className="text-[10px] text-slate-500">Âm dịu nhẹ khi PM hoặc Supervisor gửi hồ sơ</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playSound('PING')}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-[#8F7212] rounded-md font-semibold text-[10px] cursor-pointer border border-amber-200"
                    >
                      Thử âm
                    </button>
                    <input
                      type="checkbox"
                      checked={audioMode.handoverPing}
                      onChange={(e) => setAudioMode({ ...audioMode, handoverPing: e.target.checked })}
                      className="w-4 h-4 accent-[#C9A227] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAudioModalOpen(false)
                  showToast('Đã lưu cấu hình âm thanh cảnh báo!')
                }}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOPBAR BREADCRUMB & REALTIME SYNC STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to={`${basePath}/dashboard`} className="hover:text-brand-dark flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-[#8F7212]">Trung tâm thông báo &amp; Bàn giao (WF-14)</span>
        </nav>

        {/* Live WebSocket Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-bold text-emerald-800 text-[11px]">Kênh Polling / Event: LIVE</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-500 text-[11px]">Độ trễ &lt; 50ms</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION: BANNER HEADER & PRIORITY COUNTERS */}
      <div className="bg-white rounded-2xl p-5 shadow-2xs border border-brand-border flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              Trung Tâm Thông Báo &amp; Điều Phối Bàn Giao
            </h1>
            {isSupervisor ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Hộp thư: Ban Tư Vấn Giám Sát (SUPERVISOR)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                <Wrench className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Hộp thư: Ban Chỉ Huy PM Nhà Thầu (PROJECT_MANAGER)</span>
              </span>
            )}
            {emergencyCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>{emergencyCount} Lệnh khẩn cấp</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-[#8F7212] border border-[#C9A227]/30 text-xs font-bold">
              {unreadCount} chưa đọc
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isSupervisor
              ? 'Kênh thông báo & chỉ đạo của Giám sát: Thẩm duyệt gói đề xuất sửa chữa, nghiệm thu hồ sơ hiện trường, xác nhận tuyến đường và cảnh báo suy thoái rủi ro.'
              : 'Kênh điều hành & tiếp nhận chỉ đạo của Chỉ huy trưởng (PM): Lệnh ứng cứu khẩn cấp, tiến độ đợt sửa Fast Track, kết quả thẩm định Drone AI và phản hồi duyệt hồ sơ.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAudioModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Cấu hình chuông SLA</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Horizontal Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>Tất cả</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTION_REQUIRED')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ACTION_REQUIRED'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Cần tôi xử lý</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'ACTION_REQUIRED' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900'
            }`}>
              {actionRequiredCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HANDOVER')}
            className={`px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'HANDOVER'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-gold" />
            <span>Bàn giao PM ↔ Giám sát</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'HANDOVER' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {handoverCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AI_SYSTEM')}
            className={`px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'AI_SYSTEM'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>Tiến trình AI &amp; Drone</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'AI_SYSTEM' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {aiSystemCount}
            </span>
          </button>
        </div>

        {/* Search & Priority Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã phiếu, lý trình..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'ALL' | 'EMERGENCY' | 'HIGH' | 'NORMAL')}
            className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
          >
            <option value="ALL">Mức độ: Tất cả</option>
            <option value="EMERGENCY">Khẩn cấp (EMERGENCY)</option>
            <option value="HIGH">Ưu tiên cao (SLA)</option>
            <option value="NORMAL">Thông thường</option>
          </select>

          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              unreadOnly
                ? 'bg-amber-50 text-[#8F7212] border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${unreadOnly ? 'bg-[#C9A227]' : 'bg-slate-300'}`}></span>
            <span>Chưa đọc</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: 70% Feed / 30% Delivery SLA Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Dynamic Notifications & Handover Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-brand-border p-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-700">Không có thông báo phù hợp</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hiện tại không có mục bàn giao hoặc cảnh báo nào trong bộ lọc này. Tất cả công việc đang trong tầm kiểm soát.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <article
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={`relative rounded-2xl p-5 border transition-all cursor-pointer ${
                  !item.read
                    ? 'bg-white border-[#C9A227]/40 shadow-xs hover:border-[#C9A227] hover:shadow-md'
                    : 'bg-slate-50/70 border-slate-200 opacity-90 hover:opacity-100 hover:bg-white'
                }`}
              >
                {/* Unread Indicator Bar */}
                {!item.read && (
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#C9A227] rounded-r-full"></div>
                )}

                <div className="flex flex-col gap-3">
                  {/* Row 1: Badges, Meta, Timestamp */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Priority Tag */}
                      {item.priority === 'EMERGENCY' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
                          <span>KHẨN CẤP (EMERGENCY)</span>
                        </span>
                      ) : item.priority === 'HIGH' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>ƯU TIÊN CAO</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          THÔNG THƯỜNG
                        </span>
                      )}

                      {/* Category Pill */}
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                        {item.categoryLabel}
                      </span>

                      {/* Resource Code */}
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {item.resourceId}
                      </span>

                      {/* Route Code */}
                      <span className="text-[11px] font-semibold text-[#8F7212]">
                        {item.routeCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>

                  {/* Row 2: Title & Message */}
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                      <span>{item.title}</span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#C9A227] shrink-0" title="Chưa đọc"></span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Row 3: Sender info & Quick Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-semibold text-slate-800">{item.sender}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-600">{item.stationing}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* SLA remaining alert tag */}
                      {item.slaHoursRemaining !== undefined && (
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 ${
                          item.slaHoursRemaining < 2
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>SLA còn: {item.slaHoursRemaining}h</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(item.id)
                          navigate(resolveActionUrl(item))
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: SLA Monitors, Handover Matrix & Sound Hub (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* WIDGET 1: HÀNG ĐỢI SLA ĐẾM NGƯỢC (SLA COUNTDOWN MONITOR) */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-brand-dark">Theo Dõi Thời Hạn SLA Trực Tiếp</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                {criticalSlaItems.length} mục
              </span>
            </div>

            <div className="space-y-3">
              {criticalSlaItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(resolveActionUrl(item))}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-brand-gold transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-dark font-mono">{item.resourceId}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {item.slaType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">{item.title}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">{item.stationing}</span>
                    <span className="font-mono font-bold text-rose-600">
                      Còn {item.slaHoursRemaining} giờ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 2: MA TRẬN BÀN GIAO TRÁCH NHIỆM (WORKFLOW HANDOFF MATRIX) */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#C9A227]" />
                <h3 className="font-bold text-sm text-brand-dark">Dòng Chảy Bàn Giao (Handoff)</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Quy chuẩn v2.2</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Bước 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold text-emerald-950">Drone AI Scan &amp; Phát hiện</div>
                  <div className="text-[11px] text-emerald-800">Mô hình AI Road-YOLOv9 đo đạc và gắn cờ khiếm khuyết</div>
                </div>
              </div>

              {/* Bước 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="w-6 h-6 rounded-full bg-[#C9A227] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-bold text-amber-950">PM Thẩm định &amp; Lập Đề xuất</div>
                  <div className="text-[11px] text-amber-800">Xác minh Bounding box, gộp đợt BOQ hoặc mở lệnh Fast Track</div>
                </div>
              </div>

              {/* Bước 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-bold text-blue-950">Supervisor Thẩm Duyệt BOQ</div>
                  <div className="text-[11px] text-blue-800">Duyệt từng hạng mục hoặc yêu cầu chỉnh sửa định mức</div>
                </div>
              </div>

              {/* Bước 4 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <div className="font-bold text-purple-950">Nghiệm Thu Bằng Chứng SHA-256</div>
                  <div className="text-[11px] text-purple-800">Đối chiếu ảnh Trước/Sau và ký số đóng gói hồ sơ hoàn công</div>
                </div>
              </div>
            </div>
          </div>

          {/* WIDGET 3: TRẠNG THÁI HỆ THỐNG ÂM THANH & CẢNH BÁO */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#C9A227]" />
                <span className="font-bold text-sm">Hệ Thống Âm Thanh SLAAudio</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isAudioEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {isAudioEnabled ? 'Đang bật' : 'Tắt'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tích hợp Web Audio API phát tiếng còi khẩn cấp và tiếng ping bàn giao độc lập ngoại tuyến.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => playSound('PING')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 text-[#C9A227]" />
                <span>Thử tiếng Ping</span>
              </button>
              <button
                type="button"
                onClick={() => playSound('EMERGENCY')}
                className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-xs font-semibold text-red-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-900/60"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>Thử còi khẩn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default NotificationsHandoffHub
