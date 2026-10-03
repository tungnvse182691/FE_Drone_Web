import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  Home,
  ChevronRight,
  Route as RouteIcon,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  Play,
  Check,
  Lock,
  Eye,
  UserPlus,
  Settings,
  Bell,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Users2,
  Gavel,
  Tablet,
  PlaneTakeoff,
  Map,
  X,
  Plus,
  Send,
  AlertCircle
} from 'lucide-react'

// Interface cho Phân đoạn tuyến (Segment)
interface Segment {
  code: string
  stationing: string
  length_km: number
  status_label: string
  status_type: 'GOOD' | 'WARNING' | 'REPAIRING' | 'NORMAL' | 'MONITORING'
  open_defects: string
  defects_count: number
}

// Interface cho Nhân sự dự án
interface ProjectMember {
  id: string
  name: string
  role_code: 'SUPERVISOR' | 'PM' | 'CREW_LEAD' | 'DRONE_PILOT'
  role_title: string
  role_badge: string
  avatar: string
  is_online?: boolean
  authority: string
  contact: string
  equipment?: string
  unit: string
}

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = id || 'prj-ql1a-02'
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  // Danh sách các phân đoạn tuyến (5 Segments chuẩn Stitch)
  const [segments] = useState<Segment[]>([
    {
      code: 'SEG-01',
      stationing: 'Km 1024+000 – Km 1028+000',
      length_km: 4.0,
      status_label: 'Tốt (Mặt phẳng)',
      status_type: 'GOOD',
      open_defects: '0 điểm',
      defects_count: 0
    },
    {
      code: 'SEG-02',
      stationing: 'Km 1028+000 – Km 1033+500',
      length_km: 5.5,
      status_label: 'Cảnh báo (Lún bánh xe)',
      status_type: 'WARNING',
      open_defects: '5 điểm lún',
      defects_count: 5
    },
    {
      code: 'SEG-03',
      stationing: 'Km 1033+500 – Km 1038+000',
      length_km: 4.5,
      status_label: 'Đang sửa chữa (WF-07)',
      status_type: 'REPAIRING',
      open_defects: '3 điểm',
      defects_count: 3
    },
    {
      code: 'SEG-04',
      stationing: 'Km 1038+000 – Km 1042+000',
      length_km: 4.0,
      status_label: 'Bình thường (Đạt PCI)',
      status_type: 'NORMAL',
      open_defects: '2 điểm nhẹ',
      defects_count: 2
    },
    {
      code: 'SEG-05',
      stationing: 'Km 1042+000 – Km 1045+500',
      length_km: 3.5,
      status_label: 'Đang theo dõi nứt mỏi',
      status_type: 'MONITORING',
      open_defects: '2 điểm nứt',
      defects_count: 2
    }
  ])

  // Danh sách nhân sự dự án
  const [members, setMembers] = useState<ProjectMember[]>([
    {
      id: 'mem-01',
      name: 'Nguyễn Văn An',
      role_code: 'SUPERVISOR',
      role_title: 'Giám sát trưởng (Supervisor)',
      role_badge: 'SUPERVISOR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      is_online: true,
      authority: 'Phê duyệt phương án sửa chữa, nghiệm thu & ký đóng hồ sơ pháp lý',
      contact: 'an.nv@hoanghai-infra.vn • 0912.888.666',
      unit: 'Ban Giám sát Hoàng Hải / Chủ đầu tư'
    },
    {
      id: 'mem-02',
      name: 'Đỗ Quốc Hoàng',
      role_code: 'PM',
      role_title: 'Quản lý dự án (Project Manager)',
      role_badge: 'PM CHÍNH',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      is_online: true,
      authority: 'Điều phối hiện trường, lập gói sửa chữa BOQ, quản lý tiến độ SLA',
      contact: 'hoang.ks@hoanghai-infra.vn • Hoạt động 12p trước',
      unit: 'Ban Chỉ huy Công trường'
    },
    {
      id: 'mem-03',
      name: 'Lê Văn Hùng',
      role_code: 'CREW_LEAD',
      role_title: 'Trưởng đội sửa chữa (Crew Lead)',
      role_badge: 'CREW LEAD',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      is_online: false,
      authority: 'Tiếp nhận lệnh công tác, tổ chức thi công dặm vá, nạp ảnh hiện trường',
      contact: 'hung.crew@hoanghai-infra.vn',
      equipment: 'App Mobile Crew (Tablet bọc cao su chống va đập)',
      unit: 'Tổ thi công nguội & vá dặm mặt đường 01'
    },
    {
      id: 'mem-04',
      name: 'Phạm Văn Đức',
      role_code: 'DRONE_PILOT',
      role_title: 'Phi công Drone (Drone Pilot)',
      role_badge: 'DRONE PILOT',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      is_online: false,
      authority: 'Thực hiện bay chụp ảnh RGB/Thermal, nạp thẻ SD, kiểm soát tọa độ bay',
      contact: 'duc.pilot@hoanghai-infra.vn',
      equipment: 'RTK Matrice 300 • Giấy phép bay Cục Tác chiến',
      unit: 'Đội bay không ảnh trắc địa Miền Trung'
    }
  ])

  // Modal Gán nhân sự
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'CREW_LEAD' | 'DRONE_PILOT'>('CREW_LEAD')
  const [newMemberUnit, setNewMemberUnit] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName || !newMemberEmail) return

    const newMem: ProjectMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName,
      role_code: newMemberRole,
      role_title: newMemberRole === 'CREW_LEAD' ? 'Kỹ sư Đội thi công' : 'Phi công bay quét Drone',
      role_badge: newMemberRole === 'CREW_LEAD' ? 'CREW' : 'DRONE PILOT',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      is_online: false,
      authority: newMemberRole === 'CREW_LEAD' ? 'Khảo sát thực tế & thi công' : 'Thu thập không ảnh',
      contact: `${newMemberEmail} • Vừa thêm vào dự án`,
      equipment: newMemberRole === 'CREW_LEAD' ? 'App Mobile RoadGuard' : 'Drone RTK',
      unit: newMemberUnit || 'Đơn vị nhà thầu liên danh'
    }

    setMembers((prev) => [...prev, newMem])
    setIsInviteModalOpen(false)
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberUnit('')
    showToast(`Đã gửi thư mời và gán thành công nhân sự: ${newMemberName}`)
  }

  // Ref và Effect khởi tạo bản đồ MapLibre vệ tinh cho Preview card
  const previewMapContainerRef = useRef<HTMLDivElement>(null)
  const previewMapInstanceRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!previewMapContainerRef.current) return

    if (previewMapInstanceRef.current) {
      previewMapInstanceRef.current.remove()
      previewMapInstanceRef.current = null
    }

    const corridorCoords: [number, number][] = [
      [108.0825, 16.1420],
      [108.1210, 16.1750],
      [108.1651, 16.2052],
      [108.2040, 16.2380],
      [108.2418, 16.2690]
    ]

    const map = new maplibregl.Map({
      container: previewMapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: [108.1651, 16.2052],
      zoom: 10.8,
      minZoom: 8,
      maxZoom: 18,
      pitch: 28
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      // Tuyến đường
      map.addSource('corridor-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: corridorCoords },
          properties: {}
        }
      })

      map.addLayer({
        id: 'corridor-glow',
        type: 'line',
        source: 'corridor-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C9A227',
          'line-width': 4,
          'line-opacity': 0.95
        }
      })

      // 5 Markers cho 5 segments
      const segmentMarkers = [
        { code: 'SEG-01', coords: [108.0825, 16.1420] as [number, number] },
        { code: 'SEG-02', coords: [108.1210, 16.1750] as [number, number] },
        { code: 'SEG-03', coords: [108.1651, 16.2052] as [number, number] },
        { code: 'SEG-04', coords: [108.2040, 16.2380] as [number, number] },
        { code: 'SEG-05', coords: [108.2418, 16.2690] as [number, number] }
      ]

      segmentMarkers.forEach((seg) => {
        const el = document.createElement('div')
        el.className = 'cursor-pointer'
        el.innerHTML = `
          <div style="background:#1E293B; color:#C9A227; font-size:9px; font-weight:bold; font-family:monospace; padding:2px 5px; border-radius:4px; border:1px solid #C9A227; box-shadow:0 2px 5px rgba(0,0,0,0.6); white-space:nowrap; transform:translateY(-4px);">
            ${seg.code}
          </div>
        `
        el.onclick = () => {
          navigate(`${basePath}/projects/${projectId}/alignment`)
        }
        new maplibregl.Marker({ element: el })
          .setLngLat(seg.coords)
          .addTo(map)
      })

      setTimeout(() => map.resize(), 100)
    })

    previewMapInstanceRef.current = map

    return () => {
      if (previewMapInstanceRef.current) {
        previewMapInstanceRef.current.remove()
        previewMapInstanceRef.current = null
      }
    }
  }, [projectId, navigate])

  // Chuyển hướng theo role hiện tại
  const basePath = isSupervisor ? '/sup' : '/pm'

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP BAR & BREADCRUMB CONTEXT */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              onClick={() => navigate(`${basePath}/dashboard`)}
              className="hover:text-brand-gold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => navigate(`${basePath}/projects`)}
              className="hover:text-brand-gold cursor-pointer transition-colors"
            >
              Dự án
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-brand-dark font-semibold">QL1A - Giai đoạn 2</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-brand-gold font-bold">Tổng quan & Nhân sự</span>
          </nav>

        </div>

        {/* Main Header Card */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl lg:text-3xl font-bold text-brand-dark tracking-tight">
                Quốc lộ 1A - Giai đoạn 2
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                PRJ-QL1A-02
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A227]/10 text-[#8F7212] border border-[#C9A227]/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
                Đang trong thời hạn bảo hành
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1 font-mono text-brand-dark font-semibold">
                <RouteIcon className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Km 1024+000 → Km 1045+500</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Khu vực: Thừa Thiên Huế – TP. Đà Nẵng</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Chủ đầu tư: Ban Quản lý Dự án Đường bộ</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => showToast('Mở màn hình cập nhật thông tin dự án...')}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors border border-slate-200 shadow-xs cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Cập nhật thông tin</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gán nhân sự vào dự án</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. WORKFLOW HANDOVER STATUS BANNER ("Ai đang giữ quả bóng - Ball-in-court") */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-brand-dark">
                Đang chờ Supervisor duyệt: 02 Đề xuất phương án kỹ thuật sửa chữa (WF-07)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide border border-red-200">
                SLA CẢNH BÁO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trách nhiệm hiện tại:{' '}
              <strong className="font-semibold text-brand-dark">Supervisor Nguyễn Văn An</strong>. Hạn cam kết phản hồi:{' '}
              <span className="font-mono font-bold text-red-600">còn 14 giờ</span> trước khi vi phạm chuẩn quy trình O&M.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={() => navigate(isSupervisor ? '/sup/proposals/PKG-2026-08' : '/pm/proposals')}
            type="button"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <span>{isSupervisor ? 'Mở nhanh WF-07 để duyệt' : 'Xem các đề xuất đã trình (WF-07)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. PROJECT HIGHLIGHTS GRID (3 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Thời hạn bảo hành */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Thời hạn bảo hành hợp đồng
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-purple-700">Còn 342 ngày</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-xs border border-purple-100">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Hết hạn: <strong className="text-brand-dark">31/08/2027</strong></span>
              <span className="font-mono font-semibold text-purple-700">38% đã qua</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: '38%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Tuyến & Phân đoạn */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Khối lượng tuyến & Phân đoạn
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#C9A227]">21.5 km</span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  4 làn chính
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center shadow-xs border border-[#C9A227]/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>5 Phân đoạn lý trình (Segments)</span>
              <span className="font-semibold text-brand-dark">860 tấm Slab bê tông</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                Mã tim tuyến WGS84: CT-GEO-884
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Thống kê khiếm khuyết */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Thống kê khiếm khuyết mặt đường
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-brand-dark">46 / 58</span>
                <span className="text-xs font-semibold text-[#8F7212] bg-[#C9A227]/10 px-2 py-0.5 rounded-full border border-[#C9A227]/30">
                  điểm đã nghiệm thu
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A227] flex items-center justify-center shadow-xs border border-amber-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">
                Đang mở: <strong className="text-red-600">12 điểm</strong> (4 nặng, 8 TB)
              </span>
              <span className="font-mono font-bold text-[#8F7212]">79.3% SLA</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#C9A227] h-full" style={{ width: '79.3%' }} title="Đã hoàn thành"></div>
              <div className="bg-red-500 h-full" style={{ width: '20.7%' }} title="Đang mở"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN SPLIT (8 cols Left | 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Dòng thời gian mốc bàn giao dự án (Workflow Stepper) */}
          <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <RouteIcon className="w-5 h-5 text-[#C9A227]" />
                  <span>Tiến trình bàn giao & Vòng đời bảo hành</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi luân chuyển trách nhiệm giữa Supervisor, Project Manager và Đội hiện trường.
                </p>
              </div>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Giai đoạn: 04/05
              </span>
            </div>

            {/* Vertical Stepper */}
            <div className="relative pl-6 sm:pl-8 flex flex-col gap-5 pt-2">
              <div className="absolute left-3 sm:left-4 top-3 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2"></div>

              {/* Step 1 */}
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-xs text-brand-dark font-bold">
                      Bước 1: Khởi tạo dự án & Gán PM điều hành
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">15/06/2026 • 09:30</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Thực hiện bởi <strong className="text-brand-dark">Supervisor Nguyễn Văn An</strong>. Bàn giao đầy đủ hồ sơ pháp lý và quyền quản trị tuyến cho <strong className="text-brand-dark">PM Đỗ Quốc Hoàng</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-xs text-brand-dark font-bold">
                      Bước 2: Dựng tim tuyến & Duyệt hình học WGS84 (WF-02)
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">20/06/2026 • Ký số SHA-256</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Đã nắn 14 đỉnh tọa độ góc, chia 5 phân đoạn lý trình chuẩn. Supervisor đã ký duyệt chứng thư số mã hóa tọa độ WGS84 lên hệ thống bảo an.
                  </p>
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`${basePath}/projects/${projectId}/alignment`)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-dark bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded shadow-2xs transition-colors"
                    >
                      <Map className="w-3 h-3 text-[#C9A227]" />
                      Xem bản đồ tim tuyến & Slabs (WF-02) →
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-xs text-brand-dark font-bold">
                      Bước 3: Bay Drone lập Baseline dữ liệu ban đầu (WF-09)
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">05/07/2026 • Matrice 300 RTK</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Đội bay hoàn thành quét không ảnh 21.5 km với độ phân giải 1.2 cm/pixel, lập mây điểm 3D và khóa mốc mặt đường làm căn cứ đối soát khiếu nại phát sinh.
                  </p>
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`${basePath}/surveys/srv-01/review`)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8F7212] bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/30 px-2.5 py-1 rounded shadow-2xs transition-colors"
                    >
                      <PlaneTakeoff className="w-3 h-3 text-[#C9A227]" />
                      Mở Canvas Thẩm định AI (WF-09) →
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4 (ACTIVE) */}
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-[#C9A227] text-white flex items-center justify-center ring-4 ring-[#C9A227]/30 shadow-md animate-pulse">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <div className="bg-amber-50/40 border-2 border-[#C9A227]/50 rounded-xl p-4 flex-1 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-dark font-bold">
                        Bước 4: Vận hành bảo hành & Triage khiếm khuyết (WF-04, 05, 07, 08)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227] text-white uppercase tracking-wide">
                        Active Running
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#8F7212]">
                      Đang thực thi liên tục
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Đang theo dõi 12 khiếm khuyết mặt đường. Ban điều hành đang phối hợp với Tổ tuần kiểm hiện trường và xử lý 02 gói sửa chữa bảo trì định kỳ.
                  </p>
                  <div className="mt-2.5 pt-2.5 flex items-center justify-between text-xs bg-white border border-brand-border p-2 rounded-lg">
                    <span className="text-slate-500">Trách nhiệm phê duyệt hiện tại:</span>
                    <span className="font-semibold text-[#8F7212]">
                      Kỹ sư Nguyễn Văn An (Supervisor)
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 5 (LOCKED) */}
              <div className="relative flex items-start gap-4 opacity-60">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white">
                  <Lock className="w-3 h-3" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Bước 5: Quyết toán bàn giao & Đóng gói lưu trữ pháp lý (+5 năm)
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">Dự kiến: 31/08/2027</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kích hoạt khi hết hạn bảo hành 36 tháng. Đóng băng dữ liệu WGS84, báo cáo IRI/PCI và chuyển vào kho lưu trữ số vĩnh viễn theo Luật Xây dựng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Danh sách các phân đoạn tuyến chính (Segments Overview) */}
          <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <RouteIcon className="w-5 h-5 text-[#C9A227]" />
                  <span>Danh sách các phân đoạn tuyến chính (5 Segments)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân bổ lý trình, tình trạng mặt đường và số lượng khiếm khuyết theo từng cung đường.
                </p>
              </div>
              <button
                onClick={() => navigate(`${basePath}/projects/prj-ql1a-02/alignment`)}
                type="button"
                className="text-xs text-[#8F7212] hover:text-[#C9A227] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Xem bản đồ GIS phân đoạn (WF-02)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Segments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                    <th className="py-2.5 px-3">Mã đoạn</th>
                    <th className="py-2.5 px-3">Phạm vi lý trình</th>
                    <th className="py-2.5 px-3">Chiều dài</th>
                    <th className="py-2.5 px-3">Tình trạng mặt đường</th>
                    <th className="py-2.5 px-3">Khiếm khuyết mở</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {segments.map((seg) => (
                    <tr
                      key={seg.code}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        seg.status_type === 'WARNING' ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-[#8F7212] font-mono">
                        {seg.code}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {seg.stationing}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {seg.length_km.toFixed(1)} km
                      </td>
                      <td className="py-3 px-3">
                        {seg.status_type === 'GOOD' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C9A227]/15 text-[#8F7212] border border-[#C9A227]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                            {seg.status_label}
                          </span>
                        )}
                        {seg.status_type === 'WARNING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            {seg.status_label}
                          </span>
                        )}
                        {seg.status_type === 'REPAIRING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                            {seg.status_label}
                          </span>
                        )}
                        {seg.status_type === 'NORMAL' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            {seg.status_label}
                          </span>
                        )}
                        {seg.status_type === 'MONITORING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {seg.status_label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <span className={seg.defects_count > 0 ? (seg.status_type === 'WARNING' ? 'text-red-600' : 'text-slate-800') : 'text-slate-400'}>
                          {seg.open_defects}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => showToast(`Xem chi tiết phân đoạn ${seg.code}`)}
                          className="p-1 hover:text-[#C9A227] text-slate-400 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 COLS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Cơ cấu nhân sự thực hiện */}
          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
                  <Users2 className="w-5 h-5 text-[#C9A227]" />
                  <span>Cơ cấu nhân sự thực hiện</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Phân cấp thẩm quyền & phụ trách
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {members.length} thành viên
              </span>
            </div>

            {/* Personnel List */}
            <div className="flex flex-col gap-3">
              {members.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#C9A227]/50 transition-colors flex flex-col gap-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={mem.avatar}
                          alt={mem.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                        />
                        {mem.is_online && (
                          <span
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                            title="Đang online"
                          ></span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-dark">{mem.name}</span>
                        <span className="text-[11px] text-slate-500">{mem.role_title}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 uppercase">
                      {mem.role_badge}
                    </span>
                  </div>

                  <div className="text-[11px] bg-white border border-slate-200 p-2 rounded-lg flex flex-col gap-1 text-slate-600">
                    <div className="flex items-center gap-1.5 text-brand-dark font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                      <span>{mem.authority}</span>
                    </div>
                    {mem.equipment && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Tablet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{mem.equipment}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-100 mt-1">
                      <span className="truncate">{mem.contact}</span>
                      <span className="truncate max-w-[120px] text-right font-medium text-slate-500">{mem.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Card Action */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-brand-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                type="button"
              >
                <UserPlus className="w-4 h-4 text-[#C9A227]" />
                <span>Thêm nhân sự phụ trách tuyến</span>
              </button>
              <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-tight px-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Mọi thay đổi nhân sự dự án đều được ghi nhận vào Audit Log bất biến theo quy chuẩn kỹ thuật TCVN 11944.
                </span>
              </div>
            </div>
          </div>

          {/* Quick GIS Map Preview Card */}
          <div className="bg-white border border-brand-border rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                <Map className="w-4 h-4 text-[#C9A227]" />
                <span>Hành lang lý trình tuyến</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">WGS84 EPSG:4326</span>
            </div>

            {/* GIS Map Box (Real MapLibre Map) */}
            <div className="w-full h-48 rounded-xl relative overflow-hidden shadow-xs border border-slate-200">
              <div ref={previewMapContainerRef} className="w-full h-full" />
              <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-mono flex items-center justify-between gap-2 pointer-events-none z-10 border border-white/10">
                <span>Km 1024+000 ➔ Km 1045+500</span>
                <span className="text-[#ebe695] font-bold">5 Segments</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span>Tọa độ trung tâm: 16.205°N, 108.165°E</span>
              <button
                onClick={() => navigate(`${basePath}/projects/${projectId}/alignment`)}
                className="text-[#8F7212] font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Mở bản đồ lớp tim tuyến (WF-02)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: GÁN NHÂN SỰ VÀO DỰ ÁN */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C9A227]/10 text-[#C9A227]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Gán Nhân Sự Phụ Trách Tuyến Đường</h3>
                  <p className="text-xs text-slate-500">Dự án: Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên nhân sự <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trần Đình Trọng..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email công vụ / Tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="trong.td@hoanghai-infra.vn..."
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò nhiệm vụ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] bg-white"
                  >
                    <option value="CREW_LEAD">Trưởng đội thi công (Crew Lead)</option>
                    <option value="DRONE_PILOT">Phi công bay quét Drone (Pilot)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn vị công tác
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đội duy tu số 3..."
                    value={newMemberUnit}
                    onChange={(e) => setNewMemberUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Hệ thống sẽ tự động gửi thư mời kích hoạt tài khoản có thời hạn 48 giờ kèm mã token mã hóa SHA-256 đến email được chỉ định.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Xác nhận & Gửi thư mời</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
