import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
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
      style: {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 20,
            attribution: '&copy; Google Satellite Imagery'
          },
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            layout: { visibility: mapLayer === 'SATELLITE' ? 'visible' : 'none' },
            minzoom: 0,
            maxzoom: 24
          },
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            layout: { visibility: mapLayer === 'VECTOR' ? 'visible' : 'none' },
            minzoom: 0,
            maxzoom: 24
          }
        ]
      },
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
              onClick={() => navigate('/pm/dashboard')}
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
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
              <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark">Phiên bản chính sách Fast Track hiện hành</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              {currentPolicy.version} (ACTIVE) — Bất biến sau kích hoạt
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Quy chuẩn kích hoạt: <strong className="text-brand-dark font-semibold">3/3 Tiêu chí</strong> bắt buộc phải thỏa mãn để tự động mở luồng Fast Track
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Cột trái: 3 Thẻ ngưỡng kỹ thuật & SLA Card (8 cols) */}
          <div className="xl:col-span-8 flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Threshold 1: Diện tích */}
              <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ngưỡng diện tích tối đa</span>
                  <Sliders className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div>
                  <div className="text-2xl font-black text-brand-dark tracking-tight">≤ {currentPolicy.maxAreaM2} m²</div>
                  <p className="text-[11px] text-slate-500 mt-1">Chu vi biên dạng khép kín &lt; {currentPolicy.maxPerimeterM} m</p>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <Sparkles className="w-3 h-3" />
                    AI & Tuần tra xác thực
                  </span>
                </div>
              </div>

              {/* Threshold 2: Độ sâu */}
              <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ngưỡng độ sâu tối đa</span>
                  <Scale className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div>
                  <div className="text-2xl font-black text-brand-dark tracking-tight">≤ {currentPolicy.maxDepthCm} cm</div>
                  <p className="text-[11px] text-slate-500 mt-1">Độ lệch mặt đường cơ sở đo laser</p>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <Check className="w-3 h-3" />
                    Kiểm tra đo đạc thước
                  </span>
                </div>
              </div>

              {/* Threshold 3: Mức nghiêm trọng */}
              <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mức nghiêm trọng</span>
                  <AlertTriangle className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div>
                  <div className="text-2xl font-black text-brand-dark tracking-tight">LOW / MEDIUM</div>
                  <p className="text-[11px] text-slate-500 mt-1">Không gây mất an toàn giao thông tức thì</p>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Lock className="w-3 h-3" />
                    Cấm tự duyệt HIGH / CRITICAL
                  </span>
                </div>
              </div>
            </div>

            {/* SLA Card */}
            <div className="bg-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A227] border border-amber-200 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-dark block">Thời gian cam kết chu trình Fast Track</span>
                  <span className="text-xs text-slate-500">
                    Thời hạn tối đa từ lúc xác thực đến hoàn tất thi công sửa nguội: <strong className="text-brand-dark font-semibold">≤ {currentPolicy.slaHours} giờ</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-full text-slate-700 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>SLA SLA-FT-24H</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Lịch sử phiên bản & Audit Log (4 cols) */}
          <div className="xl:col-span-4 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between border border-slate-200 shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <HistoryIcon className="w-4 h-4 text-[#C9A227]" />
                  <span>Lịch sử phiên bản chính sách</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                  {policyHistory.length} bản ghi
                </span>
              </div>

              <div className="space-y-2">
                {policyHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`p-2.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                      item.status === 'ACTIVE'
                        ? 'bg-white border-brand-border shadow-xs'
                        : item.status === 'DRAFT'
                        ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                        : 'bg-slate-100/70 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-brand-dark">{item.version}</span>
                        {item.status === 'ACTIVE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Hiện hành
                          </span>
                        )}
                        {item.status === 'DRAFT' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Dự thảo
                          </span>
                        )}
                        {item.status === 'ARCHIVED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                            Đã đóng
                          </span>
                        )}
                      </div>
                      {item.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handleActivateDraft(item)}
                          className="px-2.5 py-0.5 text-[11px] font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] rounded-md transition-colors cursor-pointer shadow-xs"
                        >
                          Kích hoạt ngay
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {item.status === 'DRAFT' ? 'Soạn bởi' : 'Kích hoạt bởi'} {item.activatedBy} • {item.activatedAt}
                    </p>
                    <div className="text-[11px] text-[#8F7212] font-semibold">{item.route}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ngưỡng: Diện tích ≤ {item.maxArea}m² • Sâu ≤ {item.maxDepth}cm • SLA {item.slaHours}h
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              type="button"
              className="mt-3 w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Xem nhật ký chi tiết thay đổi (Audit Log)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECTION B: ĐIỀU PHỐI & GIAO VIỆC ĐO ĐẠC HIỆN TRƯỜNG */}
      <div id="dispatch-table-section" className="bg-white rounded-2xl p-6 shadow-xs border border-brand-border space-y-6">
        {/* Header Dispatch */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
              <Users2 className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-dark">Điều phối & Giao việc đội ngũ kỹ thuật hiện trường</h2>
              <p className="text-xs text-slate-500">
                Phê duyệt lệnh xuất quân, lựa chọn phương thức thi công và quản lý trách nhiệm hiện trường
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
            <span>{defects.length} khiếm khuyết đang chờ xử lý</span>
          </div>
        </div>

        {/* 3 Large Radio Tabs for Work Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Chế độ giao việc (Work Dispatch Mode)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tab 1: Gom lô đo đạc (MEASURE_ONLY) */}
            <label
              onClick={() => handleChangeWorkMode('MEASURE_ONLY')}
              className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
                workMode === 'MEASURE_ONLY'
                  ? 'bg-amber-50/50 border-2 border-brand-gold shadow-xs'
                  : 'bg-white hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#C9A227]">
                    <Layers className="w-5 h-5 text-[#C9A227]" />
                  </span>
                  <span className="font-bold text-sm text-brand-dark">Gom lô đo đạc</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C9A227] text-white">
                  Đã chọn {selectedDefectIds.length} lỗi
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Gom nhiều khiếm khuyết cùng tuyến để đội Crew đo 1 lượt, nghiêm cấm tự ý sửa khi chưa lập phương án.
              </p>
              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-[#8F7212]">
                <span className="px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200 text-[10px]">
                  MEASURE_ONLY
                </span>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-gold flex items-center justify-center">
                  {workMode === 'MEASURE_ONLY' && <span className="w-2 h-2 rounded-full bg-brand-gold"></span>}
                </span>
              </div>
            </label>

            {/* Tab 2: Đo và Sửa ngay (INSPECT_AND_REPAIR) */}
            <label
              onClick={() => handleChangeWorkMode('INSPECT_AND_REPAIR')}
              className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
                workMode === 'INSPECT_AND_REPAIR'
                  ? 'bg-emerald-50/60 border-2 border-emerald-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-brand-dark">Đo và Sửa ngay</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Fast Track Direct
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Chỉ áp dụng cho 1 lỗi mức LOW đơn lẻ thỏa mãn policy Fast Track. Cho phép mang vật liệu vá nguội trực tiếp.
              </p>
              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-emerald-700">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[10px]">
                  INSPECT_AND_REPAIR
                </span>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                  {workMode === 'INSPECT_AND_REPAIR' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </span>
              </div>
            </label>

            {/* Tab 3: Xử lý khẩn cấp (EMERGENCY) */}
            <label
              onClick={() => handleChangeWorkMode('EMERGENCY')}
              className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
                workMode === 'EMERGENCY'
                  ? 'bg-rose-50/60 border-2 border-rose-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  <span className="font-bold text-sm text-brand-dark">Xử lý khẩn cấp</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                  24/7 Priority
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Khắc phục tạm thời để thông xe nhanh, phân luồng an toàn khẩn cấp, không đóng lỗi gốc trên hệ thống.
              </p>
              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-rose-700">
                <span className="px-2 py-0.5 rounded-full bg-rose-100/80 border border-rose-200 text-[10px]">
                  EMERGENCY_DISPATCH
                </span>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-rose-600 flex items-center justify-center">
                  {workMode === 'EMERGENCY' && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Tuyến đường & Phân đoạn</label>
            <select
              value={routeFilter}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
            >
              <option value="QL1A_PK04">QL1A - Giai đoạn 2 (Km 1025 - Km 1045)</option>
              <option value="QL1A_PK01">QL1A - Giai đoạn 1 (Km 1000 - Km 1025)</option>
              <option value="EXPRESSWAY_LINK">Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)</option>
              <option value="PHANTHIET_DAUGIAY">Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Đội hiện trường phân bổ</label>
            <select
              value={crewFilter}
              onChange={(e) => setCrewFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
            >
              <option value="ALL">Tất cả các tổ đội</option>
              <option value="Tổ tuần tra số 01">Tổ tuần tra số 01 - Kỹ sư Kiên</option>
              <option value="Tổ đo đạc số 02">Tổ đo đạc số 02 - Kỹ sư Minh</option>
              <option value="Tổ cơ động">Tổ cơ động bảo dưỡng đường bộ 03</option>
              <option value="Chưa chỉ định">Chưa chỉ định phân công</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Trạng thái Fast Track</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            >
              <option value="ALL">Tất cả trạng thái tiêu chuẩn</option>
              <option value="ELIGIBLE">Chỉ hiển thị Đạt chuẩn (≤ 0.5 m²)</option>
              <option value="VIOLATION">Chỉ hiển thị Vi phạm ngưỡng (&gt; 0.5 m²)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setCrewFilter('ALL')
                setStatusFilter('ALL')
              }}
              type="button"
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        </div>

        {/* BẢNG CHỌN KHIẾM KHUYẾT (Defect Selection Table) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left bg-white text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3 w-12 text-center">
                  <input
                    type="checkbox"
                    disabled={workMode !== 'MEASURE_ONLY'}
                    title={workMode !== 'MEASURE_ONLY' ? 'Chế độ Sửa nhanh/Khẩn cấp chỉ áp dụng cho 1 lỗi đơn lẻ (BR-08)' : 'Chọn tất cả'}
                    checked={workMode === 'MEASURE_ONLY' && selectedDefectIds.length === filteredDefects.length && filteredDefects.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer accent-[#C9A227] disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </th>
                <th className="p-3">Mã Defect</th>
                <th className="p-3">Vị trí (Km / Tuyến / Làn)</th>
                <th className="p-3">Loại khiếm khuyết</th>
                <th className="p-3">Kích thước sơ bộ</th>
                <th className="p-3">Đánh giá Fast Track v2.1</th>
                <th className="p-3">Đội đo đạc phân công</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDefects.map((defect) => {
                const isChecked = selectedDefectIds.includes(defect.id)
                const isEligible = defect.isFastTrackEligible

                return (
                  <tr
                    key={defect.id}
                    className={`transition-colors ${
                      !isEligible
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : isChecked
                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type={workMode === 'MEASURE_ONLY' ? 'checkbox' : 'radio'}
                        name="defect-selection"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(defect.id)}
                        className={`w-4 h-4 cursor-pointer accent-[#C9A227] ${workMode === 'MEASURE_ONLY' ? 'rounded' : 'rounded-full'}`}
                      />
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={isEligible ? 'text-brand-dark' : 'text-rose-600'}>{defect.code}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {defect.stationing}
                        </span>
                        <span className="text-slate-500 text-[11px]">{defect.lane}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className={isEligible ? 'text-[#C9A227]' : 'text-rose-600'}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                        <span>{defect.type}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono">
                      <span className={isEligible ? 'font-semibold text-slate-800' : 'font-bold text-rose-600'}>
                        {defect.areaM2} m²
                      </span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className={isEligible ? 'text-slate-700' : 'font-bold text-rose-600'}>
                        {defect.depthCm} cm
                      </span>
                    </td>
                    <td className="p-3">
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đạt chuẩn Fast Track</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertOctagon className="w-3 h-3 text-rose-600" />
                          <span>Vi phạm ngưỡng (Over-limit)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={defect.assignedCrew}
                        onChange={(e) => handleAssignCrew(defect.id, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                      >
                        <option value="Tổ tuần tra số 01">Tổ tuần tra số 01</option>
                        <option value="Tổ đo đạc số 02">Tổ đo đạc số 02</option>
                        <option value="Tổ cơ động bảo dưỡng 03">Tổ cơ động 03</option>
                        <option value="Chưa chỉ định">Chưa chỉ định</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setDetailDefect(defect)}
                        type="button"
                        className="p-1 rounded-lg text-slate-500 hover:text-brand-dark hover:bg-slate-100 cursor-pointer"
                        title="Xem chi tiết trắc địa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* WARNING BANNER / INSPECTION BOX NẾU CÓ MỤC VI PHẠM */}
        {hasViolationItem && (
          <div className="p-4 rounded-xl bg-rose-50/80 border-l-4 border-rose-600 border border-rose-200 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2">
                <span>Cảnh báo vi phạm chính sách Fast Track (Phát hiện hạng mục vượt ngưỡng)</span>
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Phát hiện khiếm khuyết vượt ngưỡng của <strong className="font-semibold">{currentPolicy.version}</strong>:{' '}
                {selectedItems
                  .filter((d) => !d.isFastTrackEligible)
                  .map((d) => (
                    <span key={d.id} className="font-mono font-bold text-rose-700 mr-2">
                      {d.code} ({d.areaM2}m² / {d.depthCm}cm - {d.violationReason || 'Vượt ngưỡng'})
                    </span>
                  ))}
                . Ở chế độ{' '}
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                  Gom lô đo đạc
                </span>
                , đội Crew chỉ được phép đo kiểm tra trắc địa và ghi nhận hồ sơ hoàn công,{' '}
                <span className="text-rose-700 font-bold underline">nghiêm cấm lập lệnh Sửa ngay</span> cho các hạng mục này.
              </p>
            </div>
          </div>
        )}

        {/* 4. KHUNG BẢN ĐỒ HIỆN TRƯỜNG MAPLIBRE GL (Real Map Connection) */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C9A227]" />
              <span className="text-xs font-bold text-brand-dark">
                Bản Đồ Hiện Trường GIS & Lộ Trình Tuyến: {currentRouteConfig.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-[11px] shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMapLayer('SATELLITE')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    mapLayer === 'SATELLITE' ? 'bg-[#C9A227] text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Vệ tinh
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayer('VECTOR')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    mapLayer === 'VECTOR' ? 'bg-[#C9A227] text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Vector OSM
                </button>
              </div>
            </div>
          </div>

          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-inner border border-slate-300 bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full" />
            <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-mono border border-white/10 pointer-events-none z-10 shadow-md">
              <div className="flex items-center gap-1.5 text-[#C9A227] font-bold">
                <Users2 className="w-3.5 h-3.5" />
                <span>{currentRouteConfig.code}: {currentRouteConfig.stationRange}</span>
              </div>
              <div className="text-slate-300 mt-0.5">
                {selectedDefectIds.length} điểm đã chọn • Xanh lá: Đạt chuẩn • Đỏ nhấp nháy: Vi phạm ngưỡng
              </div>
            </div>
          </div>
        </div>

        {/* 5. FOOTER / ACTION BAR OF DISPATCH PANEL */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {/* Selection Summary */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-brand-dark text-sm">
                Đã chọn: {selectedDefectIds.length} khiếm khuyết
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                Tổng chiều dài khảo sát:{' '}
                <strong className="text-brand-dark font-mono font-bold">{surveyDistanceM} m</strong>
              </span>
            </div>
            <div className="text-slate-500 flex items-center gap-1.5 flex-wrap text-[11px]">
              <Users2 className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>
                Phân bổ sơ bộ: <strong className="text-brand-dark font-semibold">{selectedItems[0]?.assignedCrew || 'Chưa chỉ định'}</strong> (Bấm nút bên phải để phát lệnh chính thức)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              onClick={() => setSelectedDefectIds([])}
              type="button"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Hủy chọn
            </button>
            <button
              onClick={() => showToast('Đã lưu nháp cấu hình phân bổ nhiệm vụ vào hồ sơ dự án.')}
              type="button"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Lưu nháp phân công
            </button>

            {/* Dynamic Buttons based on workMode */}
            {workMode === 'MEASURE_ONLY' && (
              <button
                onClick={handleDispatchBatch}
                disabled={selectedDefectIds.length === 0}
                type="button"
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                  selectedDefectIds.length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Giao việc gom lô đo đạc ({selectedDefectIds.length} khiếm khuyết)</span>
              </button>
            )}

            {workMode === 'INSPECT_AND_REPAIR' && (
              <div className="relative group">
                <button
                  onClick={handleRepairDirect}
                  disabled={hasViolationItem || selectedDefectIds.length !== 1}
                  type="button"
                  className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                    hasViolationItem || selectedDefectIds.length !== 1
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Phát lệnh Đo & Sửa ngay (1 khiếm khuyết)</span>
                </button>
                {(hasViolationItem || selectedDefectIds.length !== 1) && (
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                    {hasViolationItem
                      ? 'Khóa: Khiếm khuyết được chọn vượt ngưỡng chính sách Fast Track'
                      : 'Quy tắc BR-08: Chế độ Đo & Sửa ngay chỉ áp dụng cho đúng 1 lỗi đạt chuẩn'}
                  </div>
                )}
              </div>
            )}

            {workMode === 'EMERGENCY' && (
              <div className="flex items-center gap-2.5">
                {selectedItems[0]?.isFastTrackEligible && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Lưu ý: Hư hỏng #{selectedItems[0]?.code} chưa vượt ngưỡng an toàn!</span>
                  </div>
                )}
                <div className="relative group">
                  <button
                    onClick={handleEmergencyDispatch}
                    disabled={selectedDefectIds.length !== 1}
                    type="button"
                    className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                      selectedDefectIds.length !== 1
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Phát lệnh Xử lý khẩn cấp (24/7 Priority)</span>
                  </button>
                  {selectedDefectIds.length !== 1 && (
                    <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                      Chỉ chọn đúng 1 vị trí nguy hiểm để điều động xe khẩn cấp
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: TẠO PHIÊN BẢN CHÍNH SÁCH MỚI */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Tạo Phiên Bản Chính Sách Fast Track Mới</h3>
                  <span className="text-[10px] text-slate-500">Kế thừa và điều chỉnh từ {currentPolicy.version}</span>
                </div>
              </div>
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tên phiên bản chính sách</label>
                <input
                  type="text"
                  value={formVersionName}
                  onChange={(e) => setFormVersionName(e.target.value)}
                  placeholder="Ví dụ: Policy v2.2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:bg-white focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Ngưỡng diện tích tối đa (m²)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formMaxArea}
                    onChange={(e) => setFormMaxArea(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#C9A227] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.maxAreaM2} m²</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Ngưỡng độ sâu tối đa (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formMaxDepth}
                    onChange={(e) => setFormMaxDepth(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#C9A227] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.maxDepthCm} cm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Thời hạn SLA hoàn thành (giờ)</label>
                  <input
                    type="number"
                    value={formSlaHours}
                    onChange={(e) => setFormSlaHours(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#C9A227] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.slaHours} giờ</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Chu vi tối đa (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formMaxPerimeter}
                    onChange={(e) => setFormMaxPerimeter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#C9A227] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.maxPerimeterM} m</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Ghi chú căn cứ & lý do ban hành</label>
                <textarea
                  rows={2}
                  value={formPolicyNote}
                  onChange={(e) => setFormPolicyNote(e.target.value)}
                  placeholder="Ghi rõ cơ sở điều chỉnh..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Quy tắc hệ thống:</strong> Khi chọn <em>Kích hoạt chính sách ngay</em>, hệ thống sẽ tự động cập nhật bảng khiếm khuyết theo ngưỡng mới và lưu bản hiện tại ({currentPolicy.version}) vào kho lưu trữ (ARCHIVED).
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                type="button"
                className="px-3.5 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplyPolicy('DRAFT')}
                  type="button"
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-xl border border-amber-200 shadow-2xs cursor-pointer transition-colors"
                >
                  Lưu dự thảo (DRAFT)
                </button>
                <button
                  onClick={() => handleApplyPolicy('ACTIVATE')}
                  type="button"
                  className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kích hoạt chính sách ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NHẬT KÝ THAY ĐỔI AUDIT LOG */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-[#C9A227]" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Nhật Ký Kiểm Toán Thay Đổi Chính Sách (Audit Trail)</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Bất biến • Ghi nhận xác thực bằng mã băm SHA-256</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-dark">{log.title}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{log.time}</span>
                  </div>
                  <p className="text-slate-600">
                    Người thực hiện: <strong>{log.user}</strong> • Hash kiểm tra:{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded text-[10px] text-amber-700 border border-slate-200">
                      {log.hash}
                    </code>
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    {log.note}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM CHI TIẾT KHIẾM KHUYẾT */}
      {detailDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-brand-dark">{detailDefect.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      detailDefect.isFastTrackEligible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {detailDefect.isFastTrackEligible ? 'Đạt chuẩn' : 'Vi phạm ngưỡng'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{detailDefect.stationing} • {detailDefect.lane}</p>
              </div>
              <button onClick={() => setDetailDefect(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden aspect-video bg-black border border-slate-200">
                <img src={detailDefect.image} alt={detailDefect.code} className="w-full h-full object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Diện tích sơ bộ:</span>
                  <div className="font-bold text-sm text-brand-dark">{detailDefect.areaM2} m²</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Độ sâu laser:</span>
                  <div className="font-bold text-sm text-brand-dark">{detailDefect.depthCm} cm</div>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>Tọa độ GPS: <strong>{detailDefect.gps.lat}° N, {detailDefect.gps.lng}° E</strong></div>
                <div>Đội phụ trách: <strong>{detailDefect.assignedCrew}</strong></div>
                <div>Độ tin cậy AI: <strong>{detailDefect.aiConfidence}%</strong></div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setDetailDefect(null)}
                className="px-4 py-2 bg-[#C9A227] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PHÁT LỆNH GIAO VIỆC XUẤT QUÂN CHO ĐỘI HIỆN TRƯỜNG */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
                  <Send className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">
                    {workMode === 'MEASURE_ONLY'
                      ? 'Lệnh Khảo Sát Đo Đạc Hiện Trường'
                      : workMode === 'INSPECT_AND_REPAIR'
                      ? 'Lệnh Đo & Sửa Ngay Fast Track Tại Chỗ'
                      : 'Lệnh Ứng Cứu Khẩn Cấp Mặt Đường 24/7'}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-brand-dark">{currentRouteConfig.code}</span>
                    <span>•</span>
                    <span className="font-mono">{selectedDefectIds.length} hạng mục</span>
                    <span>•</span>
                    <span>Cự ly: {surveyDistanceM} m</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Danh sách hạng mục tóm tắt */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>Các vị trí khiếm khuyết được giao ({selectedItems.length})</span>
                  <span className="text-slate-500 font-mono text-[10px]">Tuyến: {currentRouteConfig.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map((d) => (
                    <span
                      key={d.id}
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                        d.isFastTrackEligible
                          ? 'bg-white text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {d.code} ({d.stationing})
                    </span>
                  ))}
                </div>
              </div>

              {/* Chọn tổ đội thi công / đo đạc */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase text-[11px]">
                  Chỉ định Tổ đội kỹ thuật tiếp nhận nhiệm vụ
                </label>
                <select
                  value={selectedDispatchCrew}
                  onChange={(e) => setSelectedDispatchCrew(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                >
                  {crewTeams.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} — Phụ trách: {c.leader} ({c.memberCount} nhân sự) {c.isAvailable ? '• Sẵn sàng' : '• Đang bận'}
                    </option>
                  ))}
                </select>

                {/* Thông tin chi tiết của tổ đội được chọn */}
                {(() => {
                  const currentCrewObj = crewTeams.find((c) => c.name === selectedDispatchCrew) || crewTeams[0]
                  return (
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                      <div>
                        <span className="text-slate-500">Chỉ huy tổ:</span>{' '}
                        <strong>{currentCrewObj.leader}</strong> ({currentCrewObj.memberCount} kỹ thuật viên)
                      </div>
                      <div>
                        <span className="text-slate-500">Trạng thái:</span>{' '}
                        <strong className={currentCrewObj.isAvailable ? 'text-emerald-700' : 'text-amber-700'}>
                          {currentCrewObj.isAvailable ? 'Sẵn sàng xuất quân' : 'Đang thực hiện nhiệm vụ khác'}
                        </strong>
                      </div>
                      <div className="col-span-2 text-slate-600">
                        <span className="text-slate-500">Trang thiết bị mang theo:</span>{' '}
                        <span className="font-medium text-slate-800">{currentCrewObj.equipment}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Cảnh báo nghiêm ngặt khi chọn lỗi chưa vượt ngưỡng ở chế độ Khẩn cấp */}
              {workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && (
                <div className="p-3 bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>CẢNH BÁO QUY TRÌNH: HƯ HỎNG CHƯA VƯỢT NGƯỠNG AN TOÀN ({selectedItems[0]?.code})</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    Khiếm khuyết này có diện tích <strong>{selectedItems[0]?.areaM2} m²</strong> (&le; {currentPolicy.maxAreaM2} m²) và độ sâu <strong>{selectedItems[0]?.depthCm} cm</strong> (&le; {currentPolicy.maxDepthCm} cm). Đây là hư hỏng nhỏ đạt chuẩn <strong>Đo &amp; Sửa ngay (Fast Track)</strong> thông thường.
                  </p>
                  <div className="text-[11px] text-amber-950 font-bold bg-white/80 p-2 rounded-lg border border-amber-200">
                    ⚡ Bắt buộc Chỉ huy trưởng (PM) phải nhập lý do xuất quân khẩn cấp đặc biệt vào ô bên dưới (tối thiểu 15 ký tự) để phục vụ thanh tra dự án!
                  </div>
                </div>
              )}

              {/* Chỉ đạo & Ghi chú của PM */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Chỉ đạo của Chỉ huy trưởng (PM Dispatch Notes)
                  </label>
                  {workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && (
                    <span className="text-[10px] text-amber-700 font-bold">
                      * Bắt buộc giải trình ({dispatchNotes.trim().length}/15 ký tự)
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder={
                    workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible
                      ? 'BẮT BUỘC: Nhập lý do xuất quân khẩn cấp cho lỗi chưa vượt ngưỡng (VD: Phản ánh từ CSGT, khúc cua nguy hiểm...)'
                      : 'Ghi rõ yêu cầu an toàn, rào chắn phân luồng, phương tiện đo...'
                  }
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-xs focus:outline-none ${
                    workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && dispatchNotes.trim().length < 15
                      ? 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                      : 'border-slate-300 focus:border-[#C9A227]'
                  }`}
                />
              </div>

              {/* Hộp quy chế nhắc nhở */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <span>
                  {workMode === 'MEASURE_ONLY' && (
                    <>
                      <strong>Quy chuẩn MEASURE_ONLY:</strong> Lệnh chỉ cấp quyền đo đạc và chụp ảnh trắc địa. Tổ đội tuyệt đối không được tự ý cào bóc hay sửa chữa khi chưa có biên bản dự toán BOQ được duyệt.
                    </>
                  )}
                  {workMode === 'INSPECT_AND_REPAIR' && (
                    <>
                      <strong>Quy chuẩn FAST TRACK:</strong> Tổ đội mang vật liệu vá nguội và được phép thi công dứt điểm tại hiện trường nếu số đo thực tế đạt chuẩn chính sách ({currentPolicy.version}).
                    </>
                  )}
                  {workMode === 'EMERGENCY' && (
                    <>
                      <strong>Quy chuẩn EMERGENCY:</strong> Cắm biển báo nguy hiểm và phân luồng ngay lập tức. Được phép khắc phục tạm thời trước để bảo đảm an toàn giao thông thông suốt.
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                type="button"
                className="px-4 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteDispatch}
                type="button"
                className="px-5 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát lệnh xuất quân (Đồng bộ App Mobile)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
