import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { PolicySection } from './fast-track/PolicySection'
import { DispatchSection } from './fast-track/DispatchSection'
import { FastTrackModals } from './fast-track/FastTrackModals'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  ShieldCheck,
  Verified,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Users2,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  Eye,
  X,
  Lock,
  ArrowRight,
  Maximize2,
  Minimize2,
  FileText,
  Sliders,
  AlertOctagon,
  Sparkles,
  ChevronRight,
  Info,
  Radio,
  Wrench,
  Flame,
  Check,
  Scale,
  Zap,
  History as HistoryIcon,
  Ruler
} from 'lucide-react'

// Interface cho cấu hình phiên bản chính sách Fast Track
interface PolicyThresholdConfig {
  version: string
  status: 'ACTIVE' | 'ARCHIVED'
  maxAreaM2: number
  maxDepthCm: number
  maxPerimeterM: number
  allowedSeverities: string[]
  slaHours: number
  activatedBy: string
  activatedAt: string
  appliedRoute: string
  description: string
}

// Cấu hình tọa độ và thông tin các tuyến đường mẫu
export interface RouteConfig {
  id: string
  name: string
  code: string
  stationRange: string
  center: [number, number]
  zoom: number
  coords: [number, number][]
}

export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  QL1A_PK04: {
    id: 'QL1A_PK04',
    name: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
    code: 'QL1A • PK-04',
    stationRange: 'Km 1025+000 - Km 1045+000',
    center: [108.2030, 16.0580],
    zoom: 13.5,
    coords: [
      [108.1950, 16.0500],
      [108.1970, 16.0520],
      [108.1990, 16.0535],
      [108.2025, 16.0560],
      [108.2060, 16.0590],
      [108.2095, 16.0620],
      [108.2130, 16.0650]
    ]
  },
  QL1A_PK01: {
    id: 'QL1A_PK01',
    name: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
    code: 'QL1A • PK-01',
    stationRange: 'Km 1000+000 - Km 1025+000',
    center: [108.2750, 15.9350],
    zoom: 12.8,
    coords: [
      [108.2600, 15.8900],
      [108.2680, 15.9150],
      [108.2750, 15.9350],
      [108.2830, 15.9600],
      [108.2900, 15.9800]
    ]
  },
  EXPRESSWAY_LINK: {
    id: 'EXPRESSWAY_LINK',
    name: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
    code: 'Đường nối Cao tốc',
    stationRange: 'Km 0+000 - Km 12+000',
    center: [108.1400, 16.1500],
    zoom: 12.8,
    coords: [
      [108.1200, 16.1200],
      [108.1310, 16.1350],
      [108.1400, 16.1500],
      [108.1520, 16.1680],
      [108.1600, 16.1800]
    ]
  },
  PHANTHIET_DAUGIAY: {
    id: 'PHANTHIET_DAUGIAY',
    name: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
    code: 'CT Phan Thiết - Dầu Giây',
    stationRange: 'Km 45+000 - Km 65+000',
    center: [107.5750, 11.0000],
    zoom: 12.2,
    coords: [
      [107.5000, 10.9500],
      [107.5350, 10.9750],
      [107.5750, 11.0000],
      [107.6150, 11.0250],
      [107.6500, 11.0500]
    ]
  }
}

// Interface cho khiếu khuyết cần điều phối
interface DispatchDefectItem {
  id: string
  code: string
  routeId: string
  routeName?: string
  stationing: string
  kmValue: number
  lane: string
  type: string
  areaM2: number
  depthCm: number
  isFastTrackEligible: boolean
  violationReason?: string
  assignedCrew: string
  gps: { lat: number; lng: number }
  image: string
  aiConfidence: number
}

// Danh sách đội hiện trường
interface CrewTeam {
  id: string
  name: string
  leader: string
  memberCount: number
  equipment: string
  isAvailable: boolean
}

export const FastTrackDispatch: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Trạng thái hồ sơ được tự động điều phối từ Hộp thư tiếp nhận (Triage Inbox)
  const [autoDispatchedSourceCase, setAutoDispatchedSourceCase] = useState<{
    code: string
    title: string
    stationing: string
    isEligible: boolean
  } | null>(null)

  // 1. DỮ LIỆU CHÍNH SÁCH FAST TRACK HIỆN HÀNH
  const [currentPolicy, setCurrentPolicy] = useState<PolicyThresholdConfig>({
    version: 'Policy v2.1',
    status: 'ACTIVE',
    maxAreaM2: 0.5,
    maxDepthCm: 5.0,
    maxPerimeterM: 3.0,
    allowedSeverities: ['LOW', 'MEDIUM'],
    slaHours: 24,
    activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
    activatedAt: '08:30 • 15/08/2026',
    appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
    description: 'Quy chuẩn kích hoạt tự động: 3/3 Tiêu chí bắt buộc phải thỏa mãn để tự động mở luồng Fast Track.'
  })

  // Lịch sử các phiên bản chính sách
  const [policyHistory, setPolicyHistory] = useState([
    {
      id: 'pol-21',
      version: 'Policy v2.1',
      displayName: 'Policy v2.1 (Hiện hành)',
      status: 'ACTIVE' as 'ACTIVE' | 'ARCHIVED' | 'DRAFT',
      activatedBy: 'PM Hoàng',
      activatedAt: '08:30 15/08/2026',
      route: 'Áp dụng toàn tuyến QL1A (Km 1000 - Km 1080)',
      maxArea: 0.5,
      maxDepth: 5.0,
      slaHours: 24,
      maxPerimeter: 3.0
    },
    {
      id: 'pol-20',
      version: 'Policy v2.0',
      displayName: 'Policy v2.0 (Lưu trữ)',
      status: 'ARCHIVED' as 'ACTIVE' | 'ARCHIVED' | 'DRAFT',
      activatedBy: 'PGĐ Trần Nam',
      activatedAt: '10:15 01/06/2026',
      route: 'Ngưỡng diện tích 0.4 m² • Độ sâu ≤ 4.5 cm',
      maxArea: 0.4,
      maxDepth: 4.5,
      slaHours: 24,
      maxPerimeter: 2.8
    },
    {
      id: 'pol-19',
      version: 'Policy v1.9',
      displayName: 'Policy v1.9 (Lưu trữ)',
      status: 'ARCHIVED' as 'ACTIVE' | 'ARCHIVED' | 'DRAFT',
      activatedBy: 'PM Hoàng',
      activatedAt: '14:00 12/01/2026',
      route: 'Ngưỡng diện tích 0.3 m² • Thử nghiệm thí điểm',
      maxArea: 0.3,
      maxDepth: 4.0,
      slaHours: 36,
      maxPerimeter: 2.5
    }
  ])

  // Nhật ký Audit Log bất biến
  const [auditLogs, setAuditLogs] = useState([
    {
      title: 'Cập nhật Policy v2.1 (ACTIVE)',
      time: '15/08/2026 08:30:12',
      user: 'Nguyễn Văn Hoàng (PM)',
      hash: 'sha256:7f8a9b...c41e',
      note: 'Nâng ngưỡng diện tích từ 0.4 m² lên 0.5 m² để phù hợp điều kiện thời tiết mùa mưa.'
    },
    {
      title: 'Kích hoạt Policy v2.0',
      time: '01/06/2026 10:15:45',
      user: 'Trần Nam (PGĐ Dự án)',
      hash: 'sha256:2b4c6e...a991',
      note: 'Áp dụng thí điểm tuyến mở rộng Km 1025 - Km 1045.'
    }
  ])

  // Form states cho Modal Tạo chính sách mới
  const [formVersionName, setFormVersionName] = useState('Policy v2.2')
  const [formMaxArea, setFormMaxArea] = useState('0.60')
  const [formMaxDepth, setFormMaxDepth] = useState('5.5')
  const [formSlaHours, setFormSlaHours] = useState('24')
  const [formMaxPerimeter, setFormMaxPerimeter] = useState('3.0')
  const [formPolicyNote, setFormPolicyNote] = useState('Điều chỉnh theo phụ lục hợp đồng bảo dưỡng thường xuyên quý IV/2026.')

  // Handler tạo hoặc kích hoạt chính sách mới
  const handleApplyPolicy = (action: 'ACTIVATE' | 'DRAFT') => {
    const area = parseFloat(formMaxArea) || 0.5
    const depth = parseFloat(formMaxDepth) || 5.0
    const sla = parseInt(formSlaHours, 10) || 24
    const perimeter = parseFloat(formMaxPerimeter) || 3.0
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const nowDate = new Date().toLocaleDateString('vi-VN')
    const timeStr = `${nowTime} ${nowDate}`

    if (action === 'ACTIVATE') {
      // 1. Cập nhật currentPolicy đang hoạt động
      const updatedPolicy: PolicyThresholdConfig = {
        version: formVersionName,
        status: 'ACTIVE',
        maxAreaM2: area,
        maxDepthCm: depth,
        maxPerimeterM: perimeter,
        allowedSeverities: ['LOW', 'MEDIUM'],
        slaHours: sla,
        activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
        activatedAt: `${nowTime} • ${nowDate}`,
        appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
        description: `Quy chuẩn kích hoạt tự động ${formVersionName}: Diện tích ≤ ${area}m², Độ sâu ≤ ${depth}cm.`
      }
      setCurrentPolicy(updatedPolicy)

      // 2. Cập nhật policyHistory: Chuyển các bản ghi cũ sang ARCHIVED, thêm bản ghi mới lên đầu
      setPolicyHistory((prev) => [
        {
          id: `pol-${Date.now()}`,
          version: formVersionName,
          displayName: `${formVersionName} (Hiện hành)`,
          status: 'ACTIVE',
          activatedBy: 'PM Hoàng',
          activatedAt: timeStr,
          route: `Áp dụng toàn tuyến QL1A (Km 1000 - Km 1080)`,
          maxArea: area,
          maxDepth: depth,
          slaHours: sla,
          maxPerimeter: perimeter
        },
        ...prev.map((p) => ({
          ...p,
          displayName: p.displayName.replace(' (Hiện hành)', ' (Lưu trữ)'),
          status: (p.status === 'ACTIVE' ? 'ARCHIVED' : p.status) as 'ACTIVE' | 'ARCHIVED' | 'DRAFT'
        }))
      ])

      // 3. Thêm bản ghi Audit Trail
      const newAudit = {
        title: `Kích hoạt ${formVersionName} (ACTIVE)`,
        time: `${nowDate} ${nowTime}:00`,
        user: 'Nguyễn Văn Hoàng (PM)',
        hash: `sha256:${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        note: `Nâng ngưỡng Fast Track: Diện tích ≤ ${area} m², Độ sâu ≤ ${depth} cm, SLA ≤ ${sla}h. ${formPolicyNote}`
      }
      setAuditLogs((prev) => [newAudit, ...prev])

      // 4. Đánh giá lại toàn bộ các khiếm khuyết trong bảng theo ngưỡng mới
      setDefects((prev) =>
        prev.map((d) => {
          const isEligible = d.areaM2 <= area && d.depthCm <= depth
          return {
            ...d,
            isFastTrackEligible: isEligible,
            violationReason: isEligible
              ? undefined
              : `Diện tích ${d.areaM2} m² (> ${area} m²) hoặc Độ sâu ${d.depthCm} cm (> ${depth} cm)`
          }
        })
      )

      showToast(`ĐÃ KÍCH HOẠT CHÍNH SÁCH ${formVersionName}! Ngưỡng kỹ thuật và bảng khiếm khuyết đã cập nhật.`)
    } else {
      // Lưu dưới dạng DRAFT
      setPolicyHistory((prev) => [
        {
          id: `pol-${Date.now()}`,
          version: formVersionName,
          displayName: `${formVersionName} (Dự thảo)`,
          status: 'DRAFT',
          activatedBy: 'PM Hoàng (Đang soạn)',
          activatedAt: timeStr,
          route: `Ngưỡng diện tích ≤ ${area} m² • Độ sâu ≤ ${depth} cm`,
          maxArea: area,
          maxDepth: depth,
          slaHours: sla,
          maxPerimeter: perimeter
        },
        ...prev
      ])
      showToast(`Đã lưu dự thảo ${formVersionName} vào danh sách lịch sử chính sách!`)
    }

    setIsPolicyModalOpen(false)
  }

  // Handler kích hoạt một bản dự thảo từ danh sách lịch sử
  const handleActivateDraft = (item: (typeof policyHistory)[0]) => {
    setCurrentPolicy({
      version: item.version,
      status: 'ACTIVE',
      maxAreaM2: item.maxArea,
      maxDepthCm: item.maxDepth,
      maxPerimeterM: item.maxPerimeter,
      allowedSeverities: ['LOW', 'MEDIUM'],
      slaHours: item.slaHours,
      activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
      activatedAt: 'Vừa kích hoạt',
      appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
      description: `Quy chuẩn kích hoạt tự động ${item.version}: Diện tích ≤ ${item.maxArea}m², Độ sâu ≤ ${item.maxDepth}cm.`
    })

    setPolicyHistory((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          return { ...p, displayName: `${p.version} (Hiện hành)`, status: 'ACTIVE', activatedAt: 'Vừa kích hoạt' }
        }
        if (p.status === 'ACTIVE') {
          return { ...p, displayName: p.displayName.replace(' (Hiện hành)', ' (Lưu trữ)'), status: 'ARCHIVED' }
        }
        return p
      })
    )

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const nowDate = new Date().toLocaleDateString('vi-VN')
    setAuditLogs((prev) => [
      {
        title: `Kích hoạt dự thảo ${item.version} (ACTIVE)`,
        time: `${nowDate} ${nowTime}:00`,
        user: 'Nguyễn Văn Hoàng (PM)',
        hash: `sha256:${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        note: `Chuyển dự thảo sang chính sách vận hành chính thức: Diện tích ≤ ${item.maxArea} m², Độ sâu ≤ ${item.maxDepth} cm.`
      },
      ...prev
    ])

    // Re-evaluate defects
    setDefects((prev) =>
      prev.map((d) => {
        const isEligible = d.areaM2 <= item.maxArea && d.depthCm <= item.maxDepth
        return {
          ...d,
          isFastTrackEligible: isEligible,
          violationReason: isEligible
            ? undefined
            : `Diện tích ${d.areaM2} m² (> ${item.maxArea} m²) hoặc Độ sâu ${d.depthCm} cm (> ${item.maxDepth} cm)`
        }
      })
    )

    showToast(`Đã kích hoạt thành công ${item.version} làm chính sách hiện hành!`)
  }

  // 2. DANH SÁCH TỔ ĐỘI THI CÔNG
  const crewTeams: CrewTeam[] = [
    {
      id: 'crew-01',
      name: 'Tổ tuần tra số 01',
      leader: 'Kỹ sư Kiên',
      memberCount: 4,
      equipment: '1 Xe bán tải, máy ảnh RTK, thước cơ khí',
      isAvailable: true
    },
    {
      id: 'crew-02',
      name: 'Tổ đo đạc số 02',
      leader: 'Kỹ sư Minh',
      memberCount: 5,
      equipment: '1 Xe chuyên dụng, máy thủy bình laser, xe đo độ nhám',
      isAvailable: true
    },
    {
      id: 'crew-03',
      name: 'Tổ cơ động bảo dưỡng 03',
      leader: 'Kỹ sư Tuấn',
      memberCount: 6,
      equipment: 'Máy cào bóc mini, xe lu rung 2 tấn, vật liệu vá nguội',
      isAvailable: false
    }
  ]

  // 3. DANH SÁCH KHIẾM KHUYẾT CHỜ ĐIỀU PHỐI (Mock Data phong phú cho 4 tuyến đường)
  const [defects, setDefects] = useState<DispatchDefectItem[]>([
    // TUYẾN 1: QL1A_PK04 - QL1A Giai đoạn 2 (Km 1025 - Km 1045)
    {
      id: 'DEF-01',
      code: '#DEF-2026-0101',
      routeId: 'QL1A_PK04',
      routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
      stationing: 'Km 1032+450',
      kmValue: 1032.45,
      lane: 'Làn phải (R1)',
      type: 'Ổ gà nông (Pothole L1)',
      areaM2: 0.35,
      depthCm: 3.2,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ tuần tra số 01',
      gps: { lat: 16.0520, lng: 108.1970 },
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 94
    },
    {
      id: 'DEF-02',
      code: '#DEF-2026-0102',
      routeId: 'QL1A_PK04',
      routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
      stationing: 'Km 1032+520',
      kmValue: 1032.52,
      lane: 'Làn giữa (M1)',
      type: 'Nứt rạn lưới mai (Alligator Cracking)',
      areaM2: 0.45,
      depthCm: 2.0,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ tuần tra số 01',
      gps: { lat: 16.0535, lng: 108.1990 },
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 91
    },
    {
      id: 'DEF-03',
      code: '#DEF-2026-0105',
      routeId: 'QL1A_PK04',
      routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
      stationing: 'Km 1033+110',
      kmValue: 1033.11,
      lane: 'Lề đường phải',
      type: 'Vỡ mép thảm nhựa (Edge Break)',
      areaM2: 0.85, // VƯỢT NGƯỠNG > 0.5m²
      depthCm: 6.5, // VƯỢT NGƯỠNG > 5.0cm
      isFastTrackEligible: false,
      violationReason: 'Diện tích 0.85 m² (> 0.5 m²) & Độ sâu 6.5 cm (> 5.0 cm)',
      assignedCrew: 'Tổ đo đạc số 02',
      gps: { lat: 16.0560, lng: 108.2025 },
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 96
    },
    {
      id: 'DEF-04',
      code: '#DEF-2026-0108',
      routeId: 'QL1A_PK04',
      routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
      stationing: 'Km 1034+200',
      kmValue: 1034.20,
      lane: 'Làn trái (L1)',
      type: 'Hằn lún vệt bánh (Wheel Rutting)',
      areaM2: 0.25,
      depthCm: 4.0,
      isFastTrackEligible: true,
      assignedCrew: 'Chưa chỉ định',
      gps: { lat: 16.0590, lng: 108.2060 },
      image: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 89
    },
    {
      id: 'DEF-05',
      code: '#DEF-2026-0112',
      routeId: 'QL1A_PK04',
      routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
      stationing: 'Km 1034+890',
      kmValue: 1034.89,
      lane: 'Làn phải (R1)',
      type: 'Ổ gà lún mép (Pothole L2)',
      areaM2: 0.40,
      depthCm: 4.8,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ đo đạc số 02',
      gps: { lat: 16.0620, lng: 108.2095 },
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 92
    },

    // TUYẾN 2: QL1A_PK01 - QL1A Giai đoạn 1 (Km 1000 - Km 1025)
    {
      id: 'DEF-06',
      code: '#DEF-2026-0045',
      routeId: 'QL1A_PK01',
      routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
      stationing: 'Km 1004+200',
      kmValue: 1004.20,
      lane: 'Làn phải (R1)',
      type: 'Ổ gà nông (Pothole L1)',
      areaM2: 0.30,
      depthCm: 3.0,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ tuần tra số 01',
      gps: { lat: 15.8950, lng: 108.2620 },
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 95
    },
    {
      id: 'DEF-07',
      code: '#DEF-2026-0052',
      routeId: 'QL1A_PK01',
      routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
      stationing: 'Km 1008+150',
      kmValue: 1008.15,
      lane: 'Làn giữa (M1)',
      type: 'Nứt rạn chân chim',
      areaM2: 0.38,
      depthCm: 2.2,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ đo đạc số 02',
      gps: { lat: 15.9200, lng: 108.2700 },
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 91
    },
    {
      id: 'DEF-08',
      code: '#DEF-2026-0068',
      routeId: 'QL1A_PK01',
      routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
      stationing: 'Km 1015+700',
      kmValue: 1015.70,
      lane: 'Lề đường phải',
      type: 'Lún sụt mép bê tông nhựa',
      areaM2: 0.90, // VƯỢT NGƯỠNG
      depthCm: 6.8, // VƯỢT NGƯỠNG
      isFastTrackEligible: false,
      violationReason: 'Diện tích 0.90 m² (> 0.5 m²) & Độ sâu 6.8 cm (> 5.0 cm)',
      assignedCrew: 'Tổ đo đạc số 02',
      gps: { lat: 15.9450, lng: 108.2780 },
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 97
    },
    {
      id: 'DEF-09',
      code: '#DEF-2026-0074',
      routeId: 'QL1A_PK01',
      routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
      stationing: 'Km 1021+300',
      kmValue: 1021.30,
      lane: 'Làn trái (L1)',
      type: 'Bong tróc mặt đường (Raveling)',
      areaM2: 0.28,
      depthCm: 3.5,
      isFastTrackEligible: true,
      assignedCrew: 'Chưa chỉ định',
      gps: { lat: 15.9750, lng: 108.2880 },
      image: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 88
    },

    // TUYẾN 3: EXPRESSWAY_LINK - Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)
    {
      id: 'DEF-10',
      code: '#DEF-2026-0201',
      routeId: 'EXPRESSWAY_LINK',
      routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
      stationing: 'Km 0+450',
      kmValue: 0.45,
      lane: 'Làn 1',
      type: 'Nứt ngang mặt đường (Transverse Crack)',
      areaM2: 0.32,
      depthCm: 2.8,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ tuần tra số 01',
      gps: { lat: 16.1250, lng: 108.1250 },
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 93
    },
    {
      id: 'DEF-11',
      code: '#DEF-2026-0208',
      routeId: 'EXPRESSWAY_LINK',
      routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
      stationing: 'Km 2+100',
      kmValue: 2.10,
      lane: 'Làn 2',
      type: 'Vỡ mép thảm nhựa (Edge Break)',
      areaM2: 0.42,
      depthCm: 4.0,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ cơ động bảo dưỡng 03',
      gps: { lat: 16.1400, lng: 108.1380 },
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 90
    },
    {
      id: 'DEF-12',
      code: '#DEF-2026-0215',
      routeId: 'EXPRESSWAY_LINK',
      routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
      stationing: 'Km 5+600',
      kmValue: 5.60,
      lane: 'Làn khẩn cấp',
      type: 'Ổ gà sâu (Pothole L2)',
      areaM2: 0.75, // VƯỢT NGƯỠNG
      depthCm: 5.8, // VƯỢT NGƯỠNG
      isFastTrackEligible: false,
      violationReason: 'Diện tích 0.75 m² (> 0.5 m²) & Độ sâu 5.8 cm (> 5.0 cm)',
      assignedCrew: 'Tổ đo đạc số 02',
      gps: { lat: 16.1550, lng: 108.1480 },
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 96
    },
    {
      id: 'DEF-13',
      code: '#DEF-2026-0220',
      routeId: 'EXPRESSWAY_LINK',
      routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
      stationing: 'Km 8+900',
      kmValue: 8.90,
      lane: 'Làn 1',
      type: 'Lún vệt bánh xe (Rutting)',
      areaM2: 0.20,
      depthCm: 3.1,
      isFastTrackEligible: true,
      assignedCrew: 'Chưa chỉ định',
      gps: { lat: 16.1750, lng: 108.1580 },
      image: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 89
    },

    // TUYẾN 4: PHANTHIET_DAUGIAY - Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)
    {
      id: 'DEF-14',
      code: '#DEF-2026-0301',
      routeId: 'PHANTHIET_DAUGIAY',
      routeName: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
      stationing: 'Km 47+200',
      kmValue: 47.20,
      lane: 'Làn 1',
      type: 'Nứt rạn lưới mai (Alligator)',
      areaM2: 0.38,
      depthCm: 3.0,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ tuần tra số 01',
      gps: { lat: 10.9600, lng: 107.5100 },
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 94
    },
    {
      id: 'DEF-15',
      code: '#DEF-2026-0305',
      routeId: 'PHANTHIET_DAUGIAY',
      routeName: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
      stationing: 'Km 51+800',
      kmValue: 51.80,
      lane: 'Làn 2',
      type: 'Ổ gà bong tróc',
      areaM2: 0.45,
      depthCm: 4.2,
      isFastTrackEligible: true,
      assignedCrew: 'Tổ đo đạc số 02',
      gps: { lat: 11.0000, lng: 107.5750 },
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 92
    },
    {
      id: 'DEF-16',
      code: '#DEF-2026-0310',
      routeId: 'PHANTHIET_DAUGIAY',
      routeName: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
      stationing: 'Km 58+400',
      kmValue: 58.40,
      lane: 'Làn khẩn cấp',
      type: 'Lún nứt tiếp giáp cống chui',
      areaM2: 0.88, // VƯỢT NGƯỠNG
      depthCm: 7.2, // VƯỢT NGƯỠNG
      isFastTrackEligible: false,
      violationReason: 'Diện tích 0.88 m² (> 0.5 m²) & Độ sâu 7.2 cm (> 5.0 cm)',
      assignedCrew: 'Chưa chỉ định',
      gps: { lat: 11.0350, lng: 107.6300 },
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      aiConfidence: 96
    }
  ])

  // Trạng thái các mục được chọn bằng checkbox
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>(['DEF-01', 'DEF-02', 'DEF-03'])

  // Chế độ giao việc (3 Chế độ lớn)
  const [workMode, setWorkMode] = useState<'MEASURE_ONLY' | 'INSPECT_AND_REPAIR' | 'EMERGENCY'>('MEASURE_ONLY')

  // Bộ lọc
  const [routeFilter, setRouteFilter] = useState('QL1A_PK04')
  const [crewFilter, setCrewFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [selectedDispatchCrew, setSelectedDispatchCrew] = useState('Tổ đo đạc số 02')
  const [dispatchNotes, setDispatchNotes] = useState('Yêu cầu kiểm tra bằng thước cơ khí, chụp đầy đủ ảnh đối chiếu lý trình.')
  const [detailDefect, setDetailDefect] = useState<DispatchDefectItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Cấu hình tuyến hiện tại
  const currentRouteConfig = useMemo(() => {
    return ROUTE_CONFIGS[routeFilter] || ROUTE_CONFIGS.QL1A_PK04
  }, [routeFilter])

  // Xử lý chuyển tuyến: Lọc danh sách và tự động chọn 2 khiếm khuyết đầu
  const handleRouteChange = (newRouteId: string) => {
    setRouteFilter(newRouteId)
    const newRouteDefects = defects.filter((d) => d.routeId === newRouteId)
    setSelectedDefectIds(newRouteDefects.slice(0, 2).map((d) => d.id))
  }

  // Tự động nhận diện và tick chọn khiếm khuyết được chuyển từ Hộp thư tiếp nhận (Triage Inbox)
  useEffect(() => {
    const paramDefectCode = searchParams.get('defectCode')
    const incomingTargetDefect = location.state?.targetDefect

    if (paramDefectCode || incomingTargetDefect) {
      const codeToMatch = paramDefectCode || incomingTargetDefect?.code
      const existingDefect = defects.find((d) => d.code === codeToMatch || (incomingTargetDefect && d.id === incomingTargetDefect.id))

      if (existingDefect) {
        setSelectedDefectIds([existingDefect.id])
        setRouteFilter(existingDefect.routeId)
        if (existingDefect.isFastTrackEligible) {
          setWorkMode('INSPECT_AND_REPAIR')
        } else {
          setWorkMode('MEASURE_ONLY')
        }
        setAutoDispatchedSourceCase({
          code: existingDefect.code,
          title: existingDefect.type,
          stationing: existingDefect.stationing,
          isEligible: existingDefect.isFastTrackEligible
        })
        showToast(`⚡ Đã tự động chọn hồ sơ [${existingDefect.code}] từ Hộp thư tiếp nhận!`)
      } else if (incomingTargetDefect) {
        const area = incomingTargetDefect.area_sqm || 0.45
        const depth = incomingTargetDefect.max_depth_cm || 4.2
        const isEligible =
          area <= currentPolicy.maxAreaM2 &&
          depth <= currentPolicy.maxDepthCm &&
          currentPolicy.allowedSeverities.includes(incomingTargetDefect.severity)

        const newDefect: DispatchDefectItem = {
          id: incomingTargetDefect.id,
          code: incomingTargetDefect.code,
          routeId: incomingTargetDefect.project_id === 'prj-ql1a-01' ? 'QL1A_PK01' : 'QL1A_PK04',
          routeName: incomingTargetDefect.project_name || 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
          stationing: incomingTargetDefect.stationing || 'Km 1024+300',
          kmValue: 1024.3,
          lane: incomingTargetDefect.lane || 'Làn xe máy',
          type: incomingTargetDefect.defect_title || 'Ổ gà sụt lún mặt đường',
          areaM2: area,
          depthCm: depth,
          isFastTrackEligible: isEligible,
          violationReason: isEligible ? undefined : 'Diện tích hoặc độ sâu vượt ngưỡng chính sách Fast Track hiện hành',
          assignedCrew: 'Chưa chỉ định',
          gps: {
            lat: incomingTargetDefect.gps?.lat || 16.0560,
            lng: incomingTargetDefect.gps?.lng || 108.2025
          },
          image: incomingTargetDefect.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
          aiConfidence: incomingTargetDefect.ai_confidence || 94
        }

        setDefects((prev) => [newDefect, ...prev.filter((d) => d.code !== newDefect.code)])
        setSelectedDefectIds([newDefect.id])
        setRouteFilter(newDefect.routeId)
        if (isEligible) {
          setWorkMode('INSPECT_AND_REPAIR')
        } else {
          setWorkMode('MEASURE_ONLY')
        }
        setAutoDispatchedSourceCase({
          code: newDefect.code,
          title: newDefect.type,
          stationing: newDefect.stationing,
          isEligible
        })
        showToast(`⚡ Đã tự động nạp & chọn hồ sơ [${newDefect.code}] từ Hộp thư tiếp nhận!`)
      }
    }
  }, [searchParams, location.state])

  // MapLibre Container & Instance
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'VECTOR'>('SATELLITE')

  // Lọc danh sách khiếm khuyết theo Tuyến đường + Đội + Trạng thái
  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      if (d.routeId !== routeFilter) return false
      if (crewFilter !== 'ALL' && !d.assignedCrew.includes(crewFilter)) return false
      if (statusFilter === 'ELIGIBLE' && !d.isFastTrackEligible) return false
      if (statusFilter === 'VIOLATION' && d.isFastTrackEligible) return false
      return true
    })
  }, [defects, routeFilter, crewFilter, statusFilter])

  // Các mục được chọn
  const selectedItems = useMemo(() => {
    return defects.filter((d) => selectedDefectIds.includes(d.id))
  }, [defects, selectedDefectIds])

  // Kiểm tra có hạng mục nào vi phạm ngưỡng không
  const hasViolationItem = useMemo(() => {
    return selectedItems.some((d) => !d.isFastTrackEligible)
  }, [selectedItems])

  // Tính tổng cự ly khảo sát (khoảng cách giữa điểm min và max Km)
  const surveyDistanceM = useMemo(() => {
    if (selectedItems.length <= 1) return 0
    const kms = selectedItems.map((i) => i.kmValue)
    const min = Math.min(...kms)
    const max = Math.max(...kms)
    return Math.round((max - min) * 1000)
  }, [selectedItems])

  // Toggle chọn khiếm khuyết (Nếu chế độ Sửa ngay hoặc Khẩn cấp: Chỉ chọn đúng 1 lỗi đơn lẻ theo chuẩn BR-08)
  const handleToggleSelect = (id: string) => {
    if (workMode === 'INSPECT_AND_REPAIR' || workMode === 'EMERGENCY') {
      setSelectedDefectIds([id])
      return
    }
    setSelectedDefectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Toggle chọn tất cả (chỉ cho phép ở chế độ Gom lô đo đạc)
  const handleSelectAll = (checked: boolean) => {
    if (workMode !== 'MEASURE_ONLY') return
    if (checked) {
      setSelectedDefectIds(filteredDefects.map((d) => d.id))
    } else {
      setSelectedDefectIds([])
    }
  }

  // Chuyển chế độ giao việc và tự động chuẩn hóa số lượng chọn
  const handleChangeWorkMode = (mode: 'MEASURE_ONLY' | 'INSPECT_AND_REPAIR' | 'EMERGENCY') => {
    setWorkMode(mode)
    if (mode === 'INSPECT_AND_REPAIR' || mode === 'EMERGENCY') {
      // Tự động thu gọn chỉ chọn 1 lỗi đạt chuẩn theo chuẩn BR-08
      const firstEligible = filteredDefects.find((d) => selectedDefectIds.includes(d.id) && d.isFastTrackEligible)
      if (firstEligible) {
        setSelectedDefectIds([firstEligible.id])
      } else if (selectedDefectIds.length > 0) {
        setSelectedDefectIds([selectedDefectIds[0]])
      } else if (filteredDefects.length > 0) {
        setSelectedDefectIds([filteredDefects[0].id])
      }
    }
  }

  // 4. MAPLIBRE GL INTEGRATION
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const corridorCoords = currentRouteConfig.coords

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(mapLayer === 'SATELLITE' ? 'SATELLITE' : 'STREETS'),
      center: currentRouteConfig.center,
      zoom: currentRouteConfig.zoom,
      pitch: 32,
      bearing: -15
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      // Clear markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      // Vẽ hành lang tuyến đường
      map.addSource('dispatch-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: corridorCoords },
          properties: {}
        }
      })

      map.addLayer({
        id: 'dispatch-glow',
        type: 'line',
        source: 'dispatch-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C9A227',
          'line-width': 6,
          'line-opacity': 0.35
        }
      })

      map.addLayer({
        id: 'dispatch-line',
        type: 'line',
        source: 'dispatch-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2,
          'line-dasharray': [3, 2]
        }
      })

      // Ghim các Marker Defect thuộc tuyến đường hiện tại
      const routeDefects = defects.filter((d) => d.routeId === routeFilter)
      routeDefects.forEach((defect) => {
        const isSelected = selectedDefectIds.includes(defect.id)
        const isEligible = defect.isFastTrackEligible

        const el = document.createElement('div')
        el.className = 'cursor-pointer'
        el.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="background:${isSelected ? (isEligible ? '#15803D' : '#DC2626') : '#1E293B'}; color:#FFFFFF; font-size:10px; font-weight:bold; font-family:monospace; padding:2px 6px; border-radius:4px; border:1px solid ${isSelected ? '#FFFFFF' : '#C9A227'}; box-shadow:0 2px 5px rgba(0,0,0,0.5); white-space:nowrap; margin-bottom:2px;">
              ${defect.code} (${defect.stationing})
            </div>
            <div style="position:relative; width:${isSelected ? '20px' : '14px'}; height:${isSelected ? '20px' : '14px'}; background:${isEligible ? '#16A34A' : '#EF4444'}; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px ${isEligible ? '#16A34A' : '#EF4444'};">
              ${!isEligible ? '<div style="position:absolute; inset:-4px; border:2px solid #EF4444; border-radius:50%; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
            </div>
          </div>
        `

        el.onclick = () => {
          setDetailDefect(defect)
        }

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([defect.gps.lng, defect.gps.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family:sans-serif; font-size:12px; padding:6px; color:#1E293B;">
                <strong style="color:${isEligible ? '#15803D' : '#DC2626'}; font-size:13px;">${defect.code} - ${defect.type}</strong><br/>
                <span>${defect.stationing} (${defect.lane})</span><br/>
                <span style="font-weight:600;">Kích thước: ${defect.areaM2} m² • Sâu: ${defect.depthCm} cm</span><br/>
                <span style="color:${isEligible ? '#15803D' : '#DC2626'}; font-weight:bold;">
                  ${isEligible ? '✓ Đạt chuẩn Fast Track' : '⚠ Vi phạm ngưỡng (Over-limit)'}
                </span><br/>
                <span style="color:#64748B;">Phân công: ${defect.assignedCrew}</span>
              </div>
            `)
          )
          .addTo(map)

        markersRef.current.push(marker)
      })

      setTimeout(() => map.resize(), 100)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [defects, selectedDefectIds, mapLayer, routeFilter, currentRouteConfig])

  // Xử lý đổi đội trực tiếp trên từng khiếm khuyết
  const handleAssignCrew = (defectId: string, newCrew: string) => {
    setDefects((prev) =>
      prev.map((d) => (d.id === defectId ? { ...d, assignedCrew: newCrew } : d))
    )
    showToast(`Đã phân công ${newCrew} phụ trách khiếm khuyết!`)
  }

  // Xử lý mở modal giao việc gom lô
  const handleDispatchBatch = () => {
    if (selectedDefectIds.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 khiếm khuyết để giao việc.')
      return
    }
    setIsDispatchModalOpen(true)
  }

  // Xử lý xác nhận sửa ngay
  const handleRepairDirect = () => {
    if (hasViolationItem) {
      showToast('KHÔNG THỂ THỰC HIỆN: Danh sách có hạng mục vi phạm ngưỡng Fast Track!')
      return
    }
    if (selectedDefectIds.length !== 1) {
      showToast('Chế độ Đo và Sửa ngay (Fast Track Direct) chỉ áp dụng cho đúng 1 lỗi đơn lẻ!')
      return
    }
    setIsDispatchModalOpen(true)
  }

  // Xử lý mở modal phát lệnh khẩn cấp với cảnh báo nếu lỗi chưa vượt ngưỡng
  const handleEmergencyDispatch = () => {
    if (selectedDefectIds.length !== 1) {
      showToast('Quy tắc BR-08: Chế độ Khẩn cấp chỉ chọn đúng 1 vị trí nguy hiểm!')
      return
    }
    const currentDefect = selectedItems[0]
    if (currentDefect && currentDefect.isFastTrackEligible) {
      showToast(`⚠️ LƯU Ý: Hư hỏng ${currentDefect.code} chưa vượt ngưỡng an toàn. Bắt buộc nhập lý do giải trình trong Modal trước khi phát lệnh!`)
    }
    setIsDispatchModalOpen(true)
  }

  // Xử lý phát lệnh xuất quân chính thức từ Modal
  const handleExecuteDispatch = () => {
    if (selectedDefectIds.length === 0) return

    // Kiểm tra ràng buộc khẩn cấp cho lỗi chưa vượt ngưỡng
    if (workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible) {
      if (!dispatchNotes || dispatchNotes.trim().length < 15) {
        showToast('BẮT BUỘC: Hư hỏng chưa vượt ngưỡng an toàn! Vui lòng nhập lý do giải trình khẩn cấp vào ô Chỉ đạo (tối thiểu 15 ký tự).')
        return
      }
    }

    setDefects((prev) =>
      prev.map((d) =>
        selectedDefectIds.includes(d.id) ? { ...d, assignedCrew: selectedDispatchCrew } : d
      )
    )

    setIsDispatchModalOpen(false)
    const modeLabel =
      workMode === 'MEASURE_ONLY'
        ? 'Gom lô đo đạc'
        : workMode === 'INSPECT_AND_REPAIR'
        ? 'Đo & Sửa ngay Fast Track'
        : 'Khẩn cấp 24/7'

    if (workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible) {
      showToast(
        `ĐÃ PHÁT LỆNH KHẨN CẤP ĐẶC BIỆT: Đã điều xe 24/7 cho ${selectedItems[0]?.code} (Hư hỏng chưa vượt ngưỡng, lý do: "${dispatchNotes.slice(0, 35)}..."). Đã lưu vào nhật ký!`
      )
    } else {
      showToast(
        `Đã phát lệnh [${modeLabel}] cho ${selectedDispatchCrew} (${selectedDefectIds.length} hạng mục trên ${currentRouteConfig.code}, cự ly ${surveyDistanceM}m). Đã đồng bộ sang App Mobile!`
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. BREADCRUMB & HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              onClick={() => navigate(`${basePath}/dashboard`)}
              className="hover:text-brand-gold cursor-pointer transition-colors"
            >
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-brand-gold cursor-pointer transition-colors">Quản lý tuyến</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#C9A227] font-semibold">Chính sách & Giao việc đo đạc (WF-05)</span>
          </nav>

          <div className="flex items-center gap-2.5 pt-0.5">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              Cấu hình chính sách Fast Track & Điều phối hiện trường
            </h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
              QL1A • PK-04
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Thiết lập ngưỡng tự động xử lý nhanh và phân công 3 chế độ khảo sát, sửa chữa hiện trường.
          </p>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPolicyModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl shadow-xs hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#C9A227]" />
            <span>Tạo phiên bản chính sách mới</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('dispatch-table-section')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Tạo lệnh giao việc</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION A: QUẢN LÝ PHIÊN BẢN CHÍNH SÁCH FAST TRACK */}
      <PolicySection
        currentPolicy={currentPolicy}
        policyHistory={policyHistory}
        onActivateDraft={handleActivateDraft}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* Banner thông báo tự động điều phối khiếm khuyết từ Triage Inbox */}
      {autoDispatchedSourceCase && (
        <div className="p-4 bg-amber-50/90 border-2 border-[#C9A227] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 shadow-md animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#C9A227] text-white shrink-0 mt-0.5">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-brand-dark">ĐÃ TỰ ĐỘNG CHỌN HỒ SƠ TỪ HỘP THƯ TIẾP NHẬN:</span>
                <span className="font-mono font-bold text-xs bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 text-amber-900 shadow-2xs">
                  {autoDispatchedSourceCase.code}
                </span>
                {autoDispatchedSourceCase.isEligible ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ Đủ tiêu chuẩn Fast Track Direct
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                    ⚠ Vượt ngưỡng Fast Track (Chuyển sang Chế độ Đo đạc)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">{autoDispatchedSourceCase.title}</strong> • Lý trình: <span className="font-semibold text-slate-700">{autoDispatchedSourceCase.stationing}</span>. Hệ thống đã tự động tick chọn khiếm khuyết này và thiết lập chế độ phù hợp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoDispatchedSourceCase(null)}
            className="self-start sm:self-center px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-white border border-amber-200 rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 3. SECTION B: ĐIỀU PHỐI & GIAO VIỆC ĐO ĐẠC HIỆN TRƯỜNG */}
      <DispatchSection
        defects={defects}
        filteredDefects={filteredDefects}
        selectedDefectIds={selectedDefectIds}
        workMode={workMode}
        routeFilter={routeFilter}
        crewFilter={crewFilter}
        statusFilter={statusFilter}
        currentPolicy={currentPolicy}
        currentRouteConfig={currentRouteConfig}
        mapLayer={mapLayer}
        mapContainerRef={mapContainerRef}
        hasViolationItem={hasViolationItem}
        surveyDistanceM={surveyDistanceM}
        selectedItems={selectedItems}
        handleChangeWorkMode={handleChangeWorkMode}
        handleRouteChange={handleRouteChange}
        setCrewFilter={setCrewFilter}
        setStatusFilter={setStatusFilter}
        handleSelectAll={handleSelectAll}
        handleToggleSelect={handleToggleSelect}
        handleAssignCrew={handleAssignCrew}
        setDetailDefect={setDetailDefect}
        setMapLayer={setMapLayer}
        setSelectedDefectIds={setSelectedDefectIds}
        showToast={showToast}
        handleDispatchBatch={handleDispatchBatch}
        handleRepairDirect={handleRepairDirect}
        handleEmergencyDispatch={handleEmergencyDispatch}
      />

      {/* MODALS */}
      <FastTrackModals
        isPolicyModalOpen={isPolicyModalOpen}
        setIsPolicyModalOpen={setIsPolicyModalOpen}
        currentPolicy={currentPolicy}
        formVersionName={formVersionName}
        setFormVersionName={setFormVersionName}
        formMaxArea={formMaxArea}
        setFormMaxArea={setFormMaxArea}
        formMaxDepth={formMaxDepth}
        setFormMaxDepth={setFormMaxDepth}
        formSlaHours={formSlaHours}
        setFormSlaHours={setFormSlaHours}
        formMaxPerimeter={formMaxPerimeter}
        setFormMaxPerimeter={setFormMaxPerimeter}
        formPolicyNote={formPolicyNote}
        setFormPolicyNote={setFormPolicyNote}
        handleApplyPolicy={handleApplyPolicy}
        isAuditModalOpen={isAuditModalOpen}
        setIsAuditModalOpen={setIsAuditModalOpen}
        auditLogs={auditLogs}
        detailDefect={detailDefect}
        setDetailDefect={setDetailDefect}
        isDispatchModalOpen={isDispatchModalOpen}
        setIsDispatchModalOpen={setIsDispatchModalOpen}
        workMode={workMode}
        currentRouteConfig={currentRouteConfig}
        selectedDefectIds={selectedDefectIds}
        surveyDistanceM={surveyDistanceM}
        selectedItems={selectedItems}
        selectedDispatchCrew={selectedDispatchCrew}
        setSelectedDispatchCrew={setSelectedDispatchCrew}
        crewTeams={crewTeams}
        dispatchNotes={dispatchNotes}
        setDispatchNotes={setDispatchNotes}
        handleExecuteDispatch={handleExecuteDispatch}
      />
    </div>
  )
}
