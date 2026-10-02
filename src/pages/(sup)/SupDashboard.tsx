import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  LayoutGrid,
  Calendar,
  ChevronDown,
  Clock,
  PlusCircle,
  FileDown,
  BarChart3,
  AlarmClock,
  Route as RouteIcon,
  Info,
  TrendingUp,
  TriangleAlert,
  Search,
  Bell,
  Settings,
  Layers,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  X,
  FileCheck,
  Download,
  FolderGit2,
  CheckSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

// Interface cho Dự án trong danh mục rủi ro bảo hành (RPT-01 / RPT-06)
export interface RiskPortfolioItem {
  id: string
  risk_level: 'Critical' | 'Watch' | 'Moderate'
  project_id: string
  project_name: string
  region: 'CENTRAL' | 'NORTH'
  route_code: string
  section_display: string
  chainage_display: string
  open_defects_count: number
  defect_scope_display: string
  sla_remaining: string
  sla_status: 'urgent' | 'warning' | 'normal'
  pci_score: number
  gps_lat: number
  gps_lng: number
  pm_name: string
  pm_email: string
  proposal_id: string
}

// Danh mục dự án phân theo khu vực địa lý
export const REGION_PROJECTS: Record<string, { id: string; name: string }[]> = {
  CENTRAL: [
    { id: 'prj-ql1a-02', name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)' },
    { id: 'prj-lstl-05', name: 'Cao tốc La Sơn - Túy Loan (QL14B)' },
    { id: 'prj-ptdg-03', name: 'Tuyến tránh TP. Huế (QL1A-BP)' }
  ],
  NORTH: [
    { id: 'prj-ctbn-01', name: 'Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)' }
  ]
}

// Mock danh sách các điểm rủi ro bảo hành cao (RPT-06) đồng bộ với INITIAL_PROJECTS
const MOCK_RISK_ITEMS: RiskPortfolioItem[] = [
  {
    id: 'risk-01',
    risk_level: 'Critical',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2',
    region: 'CENTRAL',
    route_code: 'QL1A',
    section_display: 'Đoạn Thừa Thiên Huế - Đà Nẵng',
    chainage_display: 'Km 1024 - Km 1045',
    open_defects_count: 12,
    defect_scope_display: 'Diện tích hư hỏng: 145 m²',
    sla_remaining: 'Còn 14 giờ',
    sla_status: 'urgent',
    pci_score: 58.2,
    gps_lat: 16.0547,
    gps_lng: 108.2025,
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    proposal_id: 'PKG-2026-08'
  },
  {
    id: 'risk-02',
    risk_level: 'Critical',
    project_id: 'prj-lstl-05',
    project_name: 'Cao tốc La Sơn - Túy Loan',
    region: 'CENTRAL',
    route_code: 'QL14B / CT',
    section_display: 'Đoạn Hòa Vang - Nút giao Túy Loan',
    chainage_display: 'Km 35+000 - Km 42+500',
    open_defects_count: 4,
    defect_scope_display: 'Khe co giãn: 2 vị trí',
    sla_remaining: 'Còn 5 ngày',
    sla_status: 'normal',
    pci_score: 68.0,
    gps_lat: 15.9324,
    gps_lng: 108.1211,
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    proposal_id: 'PKG-2026-05'
  },
  {
    id: 'risk-03',
    risk_level: 'Watch',
    project_id: 'prj-ctbn-01',
    project_name: 'Cao tốc Bắc Nam (Diễn Châu)',
    region: 'NORTH',
    route_code: 'CT01',
    section_display: 'Đoạn Diễn Châu - Bãi Vọt (Nghệ An)',
    chainage_display: 'Km 430+000 - Km 479+300',
    open_defects_count: 5,
    defect_scope_display: 'Nứt dọc mặt đường: 85 m',
    sla_remaining: 'Còn 25 ngày (Sắp hết BH)',
    sla_status: 'warning',
    pci_score: 64.5,
    gps_lat: 18.7231,
    gps_lng: 105.6542,
    pm_name: 'Trần Minh Tâm',
    pm_email: 'tam.tm@hoanghai-infra.vn',
    proposal_id: 'PKG-2026-02'
  },
  {
    id: 'risk-04',
    risk_level: 'Watch',
    project_id: 'prj-ptdg-03',
    project_name: 'Tuyến tránh TP. Huế (QL1A-BP)',
    region: 'CENTRAL',
    route_code: 'QL1A-BP',
    section_display: 'Đoạn Hương Trà - Hương Thủy',
    chainage_display: 'Km 18+600 - Km 22+400',
    open_defects_count: 8,
    defect_scope_display: 'Lún vệt bánh xe: 220 m²',
    sla_remaining: 'Còn 18 giờ',
    sla_status: 'urgent',
    pci_score: 52.8,
    gps_lat: 16.4637,
    gps_lng: 107.5908,
    pm_name: 'Lê Văn Cường',
    pm_email: 'cuong.lv@hoanghai-infra.vn',
    proposal_id: 'PKG-2026-03'
  }
]

// Mock Hoạt động gần đây (Audit Trail - RPT-10)
const MOCK_RECENT_ACTIVITIES = [
  {
    id: 'act-01',
    tag: 'Duyệt AI',
    time: '10 phút trước',
    content: 'Hoàn tất scan AI 15km QL1A (Km 1024 - 1039), phân loại 18 khiếm khuyết.',
    type: 'ai'
  },
  {
    id: 'act-02',
    tag: 'Nghiệm thu',
    time: '45 phút trước',
    content: 'Supervisor ký xác nhận hoàn công hạng mục #ITEM-01 (Km 1024+350 QL1A).',
    type: 'acceptance'
  },
  {
    id: 'act-03',
    tag: 'Gói đề xuất',
    time: '2 giờ trước',
    content: 'Chỉ huy trưởng trình hồ sơ Gói đề xuất PKG-2026-08 (5 phân đoạn, 6.0km).',
    type: 'proposal'
  },
  {
    id: 'act-04',
    tag: 'Điều phối',
    time: '5 giờ trước',
    content: 'Phân công Đội Crew 02 cào bóc thảm nhựa polime phân đoạn Km 1033+500.',
    type: 'dispatch'
  }
]

export const SupDashboard: React.FC = () => {
  const navigate = useNavigate()

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('2026-08')
  const [selectedRegion, setSelectedRegion] = useState('ALL')
  const [selectedProject, setSelectedProject] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sort States cho bảng danh mục rủi ro
  const [sortField, setSortField] = useState<'risk_level' | 'project_name' | 'chainage' | 'open_defects_count' | 'sla_status'>('open_defects_count')
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  // Toggle Sort handler
  const handleToggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false) // Mặc định giảm dần (lỗi nhiều/nguy cấp lên trước)
    }
  }

  // Handle Region Change: Khi đổi khu vực, tự động đồng bộ danh sách dự án
  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion)
    if (newRegion !== 'ALL') {
      const allowed = REGION_PROJECTS[newRegion]?.map((p) => p.id) || []
      if (!allowed.includes(selectedProject)) {
        setSelectedProject('ALL')
      }
    }
  }

  // Export Dossier RPT-01 / RPT-07 Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'PDF_A' | 'ZIP_PACKAGE'>('PDF_A')
  const [isExporting, setIsExporting] = useState(false)

  // Map Interactive States
  const [activePinId, setActivePinId] = useState<string>('risk-01')
  const [mapLayer, setMapLayer] = useState<'satellite' | 'vector'>('satellite')

  // MapLibre Refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Đã làm mới dữ liệu danh mục bảo hành và tính toán lại các chỉ số KPI!')
    }, 600)
  }

  // Filtered & Sorted Risk Items (Lọc theo cả Khu vực & Dự án, kết hợp Sắp xếp)
  const filteredRiskItems = useMemo(() => {
    const result = MOCK_RISK_ITEMS.filter((item) => {
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false
      if (selectedProject !== 'ALL' && item.project_id !== selectedProject) return false
      return true
    })

    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'open_defects_count') {
        comparison = a.open_defects_count - b.open_defects_count
      } else if (sortField === 'project_name') {
        comparison = a.project_name.localeCompare(b.project_name)
      } else if (sortField === 'risk_level') {
        const weight: Record<string, number> = { Critical: 2, Watch: 1, Moderate: 0 }
        comparison = (weight[a.risk_level] || 0) - (weight[b.risk_level] || 0)
      } else if (sortField === 'sla_status') {
        const weight: Record<string, number> = { urgent: 3, warning: 2, normal: 1 }
        comparison = (weight[a.sla_status] || 0) - (weight[b.sla_status] || 0)
      } else if (sortField === 'chainage') {
        comparison = a.chainage_display.localeCompare(b.chainage_display)
      }
      return sortAsc ? comparison : -comparison
    })

    return result
  }, [selectedRegion, selectedProject, sortField, sortAsc])

  // Khi chọn dự án hoặc khu vực từ dropdown, bảng hoặc pin, tự động flyTo vị trí và highlight tuyến đường tương ứng
  useEffect(() => {
    const map = mapInstanceRef.current
    if (map && map.isStyleLoaded() && map.getLayer('project-routes-highlight')) {
      const targetId = selectedProject !== 'ALL'
        ? selectedProject
        : (MOCK_RISK_ITEMS.find((it) => it.id === activePinId)?.project_id || '')
      map.setFilter('project-routes-highlight', ['==', ['get', 'project_id'], targetId])
    }

    if (selectedProject === 'ALL') {
      if (selectedRegion === 'NORTH') {
        mapInstanceRef.current?.flyTo({ center: [105.6542, 18.7231], zoom: 8.5, speed: 1.2 })
      } else if (selectedRegion === 'CENTRAL') {
        mapInstanceRef.current?.flyTo({ center: [108.15, 16.15], zoom: 8.5, speed: 1.2 })
      } else {
        mapInstanceRef.current?.flyTo({ center: [107.6, 16.6], zoom: 7.2, speed: 1.2 })
      }
    } else {
      const target = MOCK_RISK_ITEMS.find((it) => it.project_id === selectedProject)
      if (target) {
        setActivePinId(target.id)
        mapInstanceRef.current?.flyTo({ center: [target.gps_lng, target.gps_lat], zoom: 12, speed: 1.2 })
      }
    }
  }, [selectedProject, selectedRegion, activePinId])

  // Active pin details
  const activeRiskItem = useMemo(() => {
    return MOCK_RISK_ITEMS.find((it) => it.id === activePinId) || MOCK_RISK_ITEMS[0]
  }, [activePinId])

  // Setup MapLibre Interactive GIS Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Dữ liệu tuyến đường độc lập cho từng dự án chuẩn kiến trúc Backend v2.2 (GeoJSON Features)
    // Tuyệt đối không nối các dự án khác nhau thành một đường
    const projectRoutesGeoJSON = {
      type: 'FeatureCollection',
      features: [
        // 1. Tuyến tránh TP. Huế (QL1A-BP, Km 18+600 - Km 22+400) - Thuộc PRJ-PTDG-03
        {
          type: 'Feature',
          properties: {
            project_id: 'prj-ptdg-03',
            project_code: 'PRJ-PTDG-03',
            name: 'Tuyến tránh TP. Huế (QL1A-BP)',
            route_code: 'QL1A-BP',
            risk_level: 'Watch',
            pci_score: 52.8,
            open_defects_count: 8
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [107.5250, 16.5120], // Phía Bắc Hương Trà (giao QL1A phía Bắc)
              [107.5480, 16.4890], // Phường Hương Vân
              [107.5908, 16.4637], // Đoạn Km 18+600 - Km 22+400 (Điểm rủi ro Lún vệt bánh xe)
              [107.6180, 16.4380], // Giao Thủy Bằng
              [107.6450, 16.4150]  // Cửa ngõ Hương Thủy (giao QL1A phía Nam)
            ]
          }
        },
        // 2. QL1A Giai đoạn 2 (Km 1020 - Km 1045 qua Đèo Hải Vân) - Thuộc PRJ-QL1A-02
        {
          type: 'Feature',
          properties: {
            project_id: 'prj-ql1a-02',
            project_code: 'PRJ-QL1A-02',
            name: 'QL1A - Giai đoạn 2 (Đoạn Thừa Thiên Huế - Đà Nẵng)',
            route_code: 'QL1A',
            risk_level: 'Critical',
            pci_score: 58.2,
            open_defects_count: 12
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [108.0825, 16.2731], // Chân Bắc Đèo Hải Vân (Lăng Cô)
              [108.1054, 16.2589], // Dốc đèo phía Bắc
              [108.1287, 16.2415], // Đỉnh đèo Hải Vân
              [108.1492, 16.2238], // Đèo phía Nam
              [108.1695, 16.2085], // Khúc cua Km 1024
              [108.1884, 16.1843], // Sườn đèo Hải Vân Nam
              [108.2025, 16.0547], // Cửa ngõ Kim Liên / Liên Chiểu (Điểm rủi ro Nứt & Lún mặt đường)
              [108.2150, 16.0200]  // Hòa Khánh Bắc (Đà Nẵng)
            ]
          }
        },
        // 3. Cao tốc La Sơn - Túy Loan (QL14B / CT, Km 35+000 - Km 42+500) - Thuộc PRJ-LSTL-05
        {
          type: 'Feature',
          properties: {
            project_id: 'prj-lstl-05',
            project_code: 'PRJ-LSTL-05',
            name: 'Cao tốc La Sơn - Túy Loan (QL14B)',
            route_code: 'QL14B / CT',
            risk_level: 'Critical',
            pci_score: 68.0,
            open_defects_count: 4
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [108.1750, 16.0150], // Nút giao Hòa Cầm - Túy Loan (Hòa Nhơn)
              [108.1480, 15.9750], // Đoạn Km 35+000 Hòa Vang
              [108.1211, 15.9324], // Đoạn Km 38+500 (Điểm rủi ro khe co giãn)
              [108.0850, 15.8950], // Hòa Phú
              [108.0400, 15.8600]  // Hòa Khương
            ]
          }
        },
        // 4. Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt, Km 430+000 - Km 479+300) - Thuộc PRJ-CTBN-01
        {
          type: 'Feature',
          properties: {
            project_id: 'prj-ctbn-01',
            project_code: 'PRJ-CTBN-01',
            name: 'Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)',
            route_code: 'CT01',
            risk_level: 'Watch',
            pci_score: 64.5,
            open_defects_count: 5
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [105.5800, 18.9800], // Nút giao Diễn Cát (Diễn Châu)
              [105.6120, 18.8650], // Đoạn qua Nghi Lộc
              [105.6542, 18.7231], // Đoạn qua Hưng Nguyên (Điểm rủi ro nứt dọc mặt đường)
              [105.6850, 18.6100], // Cầu Hưng Đức vượt sông Lam
              [105.7100, 18.5200]  // Nút giao Bãi Vọt (Đức Thọ, Hà Tĩnh)
            ]
          }
        }
      ]
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'google-satellite': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 20,
            attribution: '&copy; Google Satellite'
          },
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'google-satellite',
            layout: { visibility: mapLayer === 'satellite' ? 'visible' : 'none' },
            minzoom: 0,
            maxzoom: 24
          },
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            layout: { visibility: mapLayer === 'vector' ? 'visible' : 'none' },
            minzoom: 0,
            maxzoom: 24
          }
        ]
      },
      center: [107.6, 16.6],
      zoom: 7.2,
      minZoom: 5,
      maxZoom: 18,
      pitch: 20
    })

    map.on('load', () => {
      // Đăng ký GeoJSON source chứa các tuyến đường dự án độc lập
      map.addSource('project-routes', {
        type: 'geojson',
        data: projectRoutesGeoJSON as any
      })

      // 1. Lớp Casing viền tối bảo vệ độ tương phản trên ảnh vệ tinh
      map.addLayer({
        id: 'project-routes-casing',
        type: 'line',
        source: 'project-routes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0F172A',
          'line-width': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            5, 4,
            8, 7,
            11, 11,
            14, 20,
            16, 36,
            18, 64,
            20, 100
          ],
          'line-opacity': 0.85
        }
      })

      // 2. Lớp Tuyến chính: Phân biệt màu sắc theo mức rủi ro (Critical: Đỏ #DC2626, Watch: Xanh #0284C7)
      map.addLayer({
        id: 'project-routes-main',
        type: 'line',
        source: 'project-routes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': [
            'match',
            ['get', 'risk_level'],
            'Critical', '#DC2626',
            'Watch', '#0284C7',
            '#C9A227'
          ],
          'line-width': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            5, 2.5,
            8, 4.5,
            11, 7.5,
            14, 14,
            16, 26,
            18, 50,
            20, 82
          ],
          'line-opacity': 0.95
        }
      })

      // 3. Lớp Highlight: Phát sáng viền vàng rực rỡ khi dự án đang được kích hoạt hoặc chọn
      const currentActiveProjectId = selectedProject !== 'ALL'
        ? selectedProject
        : (MOCK_RISK_ITEMS.find((it) => it.id === activePinId)?.project_id || 'prj-ql1a-02')

      map.addLayer({
        id: 'project-routes-highlight',
        type: 'line',
        source: 'project-routes',
        filter: ['==', ['get', 'project_id'], currentActiveProjectId],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#FDE047',
          'line-width': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            5, 4,
            8, 7,
            11, 12,
            14, 20,
            16, 34,
            18, 62,
            20, 96
          ],
          'line-opacity': 0.9
        }
      })

      // Tương tác hover và click trực tiếp trên tim tuyến
      map.on('mouseenter', 'project-routes-main', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'project-routes-main', () => {
        map.getCanvas().style.cursor = ''
      })
      map.on('click', 'project-routes-main', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0]
          const pId = feature.properties?.project_id
          if (pId) {
            setSelectedProject(pId)
            const matchedRisk = MOCK_RISK_ITEMS.find((r) => r.project_id === pId)
            if (matchedRisk) {
              setActivePinId(matchedRisk.id)
              map.flyTo({ center: [matchedRisk.gps_lng, matchedRisk.gps_lat], zoom: 12, speed: 1.2 })
            }
          }
        }
      })

      // Add dynamic markers for high risk items
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      MOCK_RISK_ITEMS.forEach((item) => {
        const isCritical = item.risk_level === 'Critical'
        const el = document.createElement('div')
        el.className = 'cursor-pointer group'
        el.innerHTML = `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            ${isCritical ? '<span style="position:absolute; width:34px; height:34px; border-radius:9999px; background:rgba(239,68,68,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>' : ''}
            <div style="width:28px; height:28px; border-radius:9999px; background:${isCritical ? '#DC2626' : '#0284C7'}; color:#FFFFFF; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.5); border:2px solid #FFFFFF; font-weight:bold; font-size:11px; font-family:monospace;">
              ${item.open_defects_count}
            </div>
            <div style="position:absolute; top:32px; left:50%; transform:translateX(-50%); white-space:nowrap; background:rgba(15,23,42,0.92); color:#FFFFFF; font-size:10px; font-weight:600; padding:2px 6px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); pointer-events:none;">
              ${item.route_code} • ${item.section_display.split(' - ')[0]}
            </div>
          </div>
        `

        el.onclick = () => {
          setActivePinId(item.id)
          map.flyTo({ center: [item.gps_lng, item.gps_lat], zoom: 12, speed: 1.2 })
        }

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([item.gps_lng, item.gps_lat])
          .addTo(map)

        markersRef.current.push(marker)
      })

      setTimeout(() => map.resize(), 100)
    })

    mapInstanceRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Switch Map Layer (Satellite vs Street)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.isStyleLoaded()) return
    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', mapLayer === 'satellite' ? 'visible' : 'none')
    }
    if (map.getLayer('osm-layer')) {
      map.setLayoutProperty('osm-layer', 'visibility', mapLayer === 'vector' ? 'visible' : 'none')
    }
  }, [mapLayer])

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER: BREADCRUMB, TITLE & ACTIONS                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <span>Trang chủ</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#C9A227]">Dashboard</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-sansation">
              Dashboard danh mục bảo hành
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Theo dõi dự án, tình trạng đường, rủi ro bảo hành và công việc cần ưu tiên.
            </p>
          </div>

          {/* Timestamp & Top Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start lg:self-center">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Dữ liệu cập nhật lúc 21:45, ngày 25/08/2026</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                type="button"
                className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                type="button"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Xuất báo cáo (RPT-01)</span>
              </button>

              <button
                onClick={() => navigate('/sup/projects')}
                type="button"
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Khởi tạo dự án</span>
              </button>

              <button
                onClick={() => navigate('/sup/approvals')}
                type="button"
                className="px-4 py-2 text-xs font-bold text-white rounded-xl transition shadow-sm flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer"
                style={{ boxShadow: 'rgba(201, 162, 39, 0.28) 0px 2px 8px' }}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Thẩm duyệt đợt sửa (WF-07)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/90 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Month */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                <option value="2026-08">Tháng 8, 2026</option>
                <option value="2026-07">Tháng 7, 2026</option>
                <option value="2026-06">Tháng 6, 2026</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Region */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                <option value="ALL">Khu vực: Tất cả</option>
                <option value="CENTRAL">Miền Trung (Huế - Đà Nẵng)</option>
                <option value="NORTH">Miền Bắc (Nghệ An)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Project (Tự động lọc theo Khu vực đã chọn) */}
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                <option value="ALL">
                  {selectedRegion === 'ALL'
                    ? 'Dự án: Tất cả'
                    : selectedRegion === 'CENTRAL'
                    ? 'Tất cả dự án Miền Trung'
                    : 'Tất cả dự án Miền Bắc'}
                </option>
                {(selectedRegion === 'ALL'
                  ? [...REGION_PROJECTS.CENTRAL, ...REGION_PROJECTS.NORTH]
                  : REGION_PROJECTS[selectedRegion] || []
                ).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedMonth('2026-08')
                setSelectedRegion('ALL')
                setSelectedProject('ALL')
                setSortField('open_defects_count')
                setSortAsc(false)
                showToast('Đã đặt lại bộ lọc và sắp xếp mặc định!')
              }}
              type="button"
              className="font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Đặt lại
            </button>
            <button
              onClick={() => {
                const regText = selectedRegion === 'ALL' ? 'Toàn quốc' : selectedRegion === 'NORTH' ? 'Miền Bắc' : 'Miền Trung'
                const prjTarget = MOCK_RISK_ITEMS.find((it) => it.project_id === selectedProject)
                const prjText = prjTarget ? prjTarget.project_name : 'Tất cả dự án'
                showToast(`Đã áp dụng bộ lọc: ${regText} • ${prjText} (${selectedMonth})`)
              }}
              type="button"
              className="px-4 py-1.5 font-bold text-white rounded-xl transition shadow-2xs bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD GRID (8 Cols Left, 4 Cols Right)                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-1">
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT SUB-COLUMN: 8 COLS                                                 */}
          {/* ----------------------------------------------------------------------- */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* 3 Pastel Metric Cards (Đồng bộ số liệu với INITIAL_PROJECTS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Dự án đang bảo hành */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700">Dự án đang bảo hành</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 bg-[#EAF4FB]">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">5</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      293.8 km
                    </span>
                    <span>tổng chiều dài</span>
                    <span className="text-slate-300">•</span>
                    <span>156 đoạn</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Dự án sắp hết hạn */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700">Dự án sắp hết hạn</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-rose-600 bg-red-50">
                    <AlarmClock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">1</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-rose-700 bg-red-50 border border-rose-200">
                      <TriangleAlert className="w-3 h-3" />
                      <span>Cảnh báo: &lt; 30 ngày (Cao tốc Diễn Châu: còn 25 ngày)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Đoạn đường chưa baseline (MET-09) */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700 leading-snug">
                    Đoạn đường chưa baseline
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#92700C] bg-[#FEF9C3]">
                    <RouteIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">12</span>
                    <span className="text-xs font-semibold text-slate-600">đoạn</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-600">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thuộc 4 dự án (Cần bay khảo sát gốc)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GIS Satellite Map Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xs border border-slate-200">
              <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A227]" />
                  <h3 className="font-sansation font-bold text-slate-900 text-sm">
                    Bản đồ danh mục rủi ro hư hỏng (GIS Risk Portfolio)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold text-rose-700 bg-red-100/80 rounded-full border border-red-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                    High Risk ({MOCK_RISK_ITEMS.filter((i) => i.risk_level === 'Critical').length})
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 bg-sky-100 rounded-full border border-sky-200">
                    Watch ({MOCK_RISK_ITEMS.filter((i) => i.risk_level === 'Watch').length})
                  </span>
                </div>
              </div>

              {/* Map Viewport Area with real MapLibre GL */}
              <div className="relative w-full h-[400px] bg-slate-900 overflow-hidden select-none">
                {/* MapLibre DOM container */}
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Floating Map HUD Detail on Active Pin */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 text-white text-xs space-y-1.5 max-w-xs shadow-xl pointer-events-auto">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#C9A227]">{activeRiskItem.project_name}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        activeRiskItem.risk_level === 'Critical' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
                      }`}
                    >
                      {activeRiskItem.risk_level}
                    </span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">{activeRiskItem.chainage_display}</p>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                    <span>{activeRiskItem.defect_scope_display}</span>
                    <span className="font-bold text-rose-400">{activeRiskItem.sla_remaining}</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Độ gồ ghề PCI: <strong className="text-white font-mono">{activeRiskItem.pci_score}</strong></span>
                    <button
                      onClick={() => navigate('/sup/proposals')}
                      className="text-[#C9A227] hover:underline font-semibold cursor-pointer"
                    >
                      Xem gói đề xuất &gt;
                    </button>
                  </div>
                </div>

                {/* Map Control Buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 shadow-md pointer-events-auto">
                  <button
                    onClick={() => mapInstanceRef.current?.zoomIn()}
                    type="button"
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
                    title="Phóng to"
                  >
                    +
                  </button>
                  <button
                    onClick={() => mapInstanceRef.current?.zoomOut()}
                    type="button"
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
                    title="Thu nhỏ"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setMapLayer(mapLayer === 'satellite' ? 'vector' : 'satellite')}
                    type="button"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-xs cursor-pointer border ${
                      mapLayer === 'satellite'
                        ? 'bg-[#C9A227] text-white border-[#C9A227]'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                    title={mapLayer === 'satellite' ? 'Đang bật vệ tinh (Bấm đổi Street)' : 'Đang bật Street (Bấm đổi Vệ tinh)'}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      mapInstanceRef.current?.flyTo({ center: [107.6, 16.6], zoom: 7.2, speed: 1.2 })
                      showToast('Đã đặt lại góc nhìn toàn mạng lưới cao tốc!')
                    }}
                    type="button"
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-bold transition shadow-xs cursor-pointer border border-slate-200"
                    title="Đặt lại góc nhìn toàn tuyến"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* High Risk Data Table (RPT-06) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h3 className="font-sansation font-bold text-slate-900 text-sm">
                    Danh sách đoạn tuyến rủi ro cao (RPT-06 High Risk)
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/sup/projects')}
                  type="button"
                  className="text-xs font-semibold hover:underline text-[#C9A227] cursor-pointer"
                >
                  Xem tất cả dự án &gt;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                      <th
                        className="pb-3 font-semibold cursor-pointer select-none hover:text-slate-800 transition-colors"
                        onClick={() => handleToggleSort('risk_level')}
                        title="Sắp xếp theo mức rủi ro"
                      >
                        <div className="flex items-center gap-1">
                          <span>Mức rủi ro</span>
                          {sortField === 'risk_level' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      </th>
                      <th
                        className="pb-3 font-semibold cursor-pointer select-none hover:text-slate-800 transition-colors"
                        onClick={() => handleToggleSort('project_name')}
                        title="Sắp xếp theo tên dự án"
                      >
                        <div className="flex items-center gap-1">
                          <span>Dự án</span>
                          {sortField === 'project_name' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      </th>
                      <th className="pb-3 font-semibold">Kỹ sư PM</th>
                      <th
                        className="pb-3 font-semibold cursor-pointer select-none hover:text-slate-800 transition-colors"
                        onClick={() => handleToggleSort('chainage')}
                        title="Sắp xếp theo lý trình"
                      >
                        <div className="flex items-center gap-1">
                          <span>Đoạn đường</span>
                          {sortField === 'chainage' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      </th>
                      <th
                        className="pb-3 font-semibold text-center cursor-pointer select-none hover:text-slate-800 transition-colors"
                        onClick={() => handleToggleSort('open_defects_count')}
                        title="Sắp xếp theo số lỗi hở"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Lỗi mở</span>
                          {sortField === 'open_defects_count' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      </th>
                      <th className="pb-3 font-semibold">Khối lượng hư hỏng</th>
                      <th
                        className="pb-3 font-semibold text-right cursor-pointer select-none hover:text-slate-800 transition-colors"
                        onClick={() => handleToggleSort('sla_status')}
                        title="Sắp xếp theo thời hạn SLA"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Thời hạn SLA</span>
                          {sortField === 'sla_status' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      </th>
                      <th className="pb-3 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredRiskItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400">
                          Không có đoạn đường nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredRiskItems.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setActivePinId(item.id)
                            mapInstanceRef.current?.flyTo({ center: [item.gps_lng, item.gps_lat], zoom: 12, speed: 1.2 })
                            showToast(`Đã định vị trên bản đồ: ${item.project_name} (${item.chainage_display})`)
                          }}
                          className="hover:bg-slate-50/80 transition cursor-pointer group"
                        >
                          <td className="py-3.5">
                            {item.risk_level === 'Critical' ? (
                              <span className="px-2.5 py-0.5 text-[11px] font-bold text-rose-700 bg-red-100 rounded-full inline-block border border-red-200">
                                Critical
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 bg-sky-100 rounded-full inline-block border border-sky-200">
                                Watch
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 font-bold text-slate-900 group-hover:text-[#C9A227] transition-colors">
                            {item.project_name}
                            <span className="block text-[10px] text-slate-400 font-mono font-normal">{item.proposal_id}</span>
                          </td>
                          <td className="py-3.5 text-slate-700">
                            <span className="font-semibold block">{item.pm_name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{item.pm_email}</span>
                          </td>
                          <td className="py-3.5 text-slate-600 font-mono text-[11px]">
                            {item.chainage_display}
                          </td>
                          <td className="py-3.5 text-center font-bold text-rose-600">
                            {item.open_defects_count}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-800">
                            {item.defect_scope_display}
                          </td>
                          <td className="py-3.5 text-right">
                            {item.sla_status === 'urgent' ? (
                              <span className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-red-50 rounded-full inline-block border border-rose-200">
                                {item.sla_remaining}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full inline-block bg-amber-50 text-amber-800 border border-amber-200">
                                {item.sla_remaining}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate('/sup/approvals')
                              }}
                              type="button"
                              className="px-2.5 py-1 text-[11px] font-bold text-[#92700C] bg-[#FEF9E7] hover:bg-[#FDF0CD] border border-[#FDE68A] rounded-lg transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                              title="Chuyển đến thẩm duyệt đợt sửa chữa"
                            >
                              <span>Duyệt WF-07</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT SUB-COLUMN: 4 COLS                                                */}
          {/* ----------------------------------------------------------------------- */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* Card: Hiệu suất xử lý khiếm khuyết (MET-05 Cohort Completion & SLA) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#FEF9C3] text-[#92700C]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-sansation font-bold">Hiệu suất xử lý khiếm khuyết</span>
                </div>

                <span className="text-xs text-slate-500 font-medium">Chỉ số hoàn thành đúng hạn (SLA)</span>
                <div className="font-sansation text-3xl font-bold tracking-tight mt-1 mb-5 text-[#C9A227]">
                  88.5%
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đã nghiệm thu đóng hồ sơ</span>
                    <span className="font-bold text-[#C9A227]">156 điểm</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="h-2 rounded-full bg-[#C9A227]" style={{ width: '86.6%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đang xử lý / Chờ nghiệm thu</span>
                    <span className="text-rose-600 font-bold">24 điểm</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '13.4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Hoạt động gần đây (Audit Trail - RPT-10) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sansation font-bold text-slate-900 text-sm">Hoạt động gần đây</h3>
                <span className="text-[11px] font-mono text-slate-400">RPT-10</span>
              </div>

              <div className="space-y-3.5">
                {MOCK_RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        act.type === 'ai'
                          ? 'bg-purple-100 text-purple-700'
                          : act.type === 'acceptance'
                          ? 'bg-emerald-100 text-emerald-700'
                          : act.type === 'proposal'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 rounded-xl p-3 bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.type === 'ai'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : act.type === 'acceptance'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : act.type === 'proposal'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {act.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{act.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Chỉ số suy thoái mặt đường PCI theo đoạn tuyến */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
              <h3 className="font-sansation font-bold text-slate-900 text-sm mb-3">
                Chỉ số chất lượng mặt đường (PCI)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">QL1A (Km 1024 - Km 1045):</span>
                    <span className="font-bold text-emerald-600">78.5 (Tốt)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78.5%' }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Cao tốc Bắc Nam XL-03:</span>
                    <span className="font-bold text-amber-600">64.2 (Trung bình)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '64.2%' }} />
                  </div>
                </div>

                <button
                  onClick={() => navigate('/sup/risk-analytics')}
                  type="button"
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2"
                >
                  <span>Xem bản đồ nhiệt &amp; rủi ro chuyên sâu</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: XUẤT HỒ SƠ BẰNG CHỨNG & DANH MỤC BẢO HÀNH (RPT-01 / RPT-07)       */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsExportModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-base font-sansation">
                  Xuất hồ sơ điều hành &amp; rủi ro bảo hành (RPT-01)
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
                Hệ thống khởi tạo tác vụ xuất bất đồng bộ (<code>POST /api/v1/exports</code>), kết xuất toàn bộ dữ liệu 5 dự án bảo hành, ma trận rủi ro suy thoái mặt đường RPT-06 và danh sách hư hỏng trọng yếu.
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
                    <span className="font-bold text-slate-900 block">Báo cáo điều hành tổng hợp (PDF/A)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Tệp PDF chuẩn pháp lý ISO 19005, tích hợp biểu đồ KPI, bản đồ GIS phân bổ hư hỏng và bảng danh mục rủi ro RPT-06.
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
                    <span className="font-bold text-slate-900 block">Gói hồ sơ bằng chứng số nén (ZIP Dossier)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Chứa toàn bộ dữ liệu GeoJSON tim tuyến, hình ảnh trực giao Drone Orthorphoto, số đo TCVN 8819 và bảng băm <code>checksum.sha256</code>.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Phạm vi kết xuất:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedProject === 'ALL' ? 'Toàn bộ 5 dự án bảo hành (293.8 km)' : MOCK_RISK_ITEMS.find((it) => it.project_id === selectedProject)?.project_name || 'Dự án'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kỳ đánh giá As-Of:</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedMonth} (Cập nhật 21:45 25/08/2026)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bảo mật chống chối bỏ:</span>
                  <span className="font-mono text-purple-700 font-bold">SHA256:4C82..FE19 (Pass)</span>
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
                onClick={() => {
                  setIsExporting(true)
                  setTimeout(() => {
                    setIsExporting(false)
                    setIsExportModalOpen(false)
                    showToast(
                      exportFormat === 'PDF_A'
                        ? 'Đã tải xuống thành công Báo cáo điều hành danh mục bảo hành RPT-01 (PDF/A)!'
                        : 'Đã tải xuống thành công Gói hồ sơ bằng chứng gốc nén ZIP (Kèm bảng băm SHA-256)!'
                    )
                  }, 1200)
                }}
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
