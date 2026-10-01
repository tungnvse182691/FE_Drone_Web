import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  Inbox,
  Search,
  Filter,
  Layers,
  Sparkles,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Merge,
  Smartphone,
  Plane,
  Car,
  Download,
  RotateCcw,
  Check,
  X,
  MapPin,
  ZoomIn,
  Sliders,
  ExternalLink,
  ChevronLeft,
  Calendar,
  AlertCircle,
  FileCheck2,
  Radio,
  SlidersHorizontal,
  FolderKanban,
  Wand2,
  Maximize2,
  Eye,
  ShieldAlert,
  Send,
  HelpCircle,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react'

// Interface cho hồ sơ Triage
export interface TriageCase {
  id: string
  code: string
  source: 'DRONE_AI' | 'CITIZEN' | 'PATROL'
  source_label: string
  source_detail: string
  project_id: string
  project_name: string
  stationing: string
  lane: string
  defect_title: string
  defect_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY'
  time_ago: string
  created_at: string
  status: 'PENDING' | 'MERGED' | 'NEED_SURVEY' | 'VERIFIED' | 'REJECTED'
  status_label: string
  image_url: string
  gps: {
    lat: number
    lng: number
    altitude_m: number
    resolution_cm_px: number
  }
  ai_confidence: number
  area_sqm: number
  ai_area_sqm: number
  max_depth_cm: number
  ai_depth_cm: number
  pm_notes: string
  // Cụm trùng lặp lân cận (Spatial cluster)
  cluster_duplicates?: {
    code: string
    source: string
    distance_m: number
    reporter: string
    time?: string
    image_url?: string
    selected: boolean
  }[]
}

export const AIReviewInbox: React.FC = () => {
  const navigate = useNavigate()

  // Dữ liệu mock 8 hồ sơ tiếp nhận phong phú
  const [cases, setCases] = useState<TriageCase[]>([
    {
      id: 'cas-01',
      code: '#CAS-2026-0842',
      source: 'DRONE_AI',
      source_label: 'Drone AI Scan',
      source_detail: 'Hệ thống Drone AI Scan (Tổ bay Cam 04 - Matrice 300 RTK)',
      project_id: 'prj-ql1a-02',
      project_name: 'QL1A - Giai đoạn 2',
      stationing: 'Km 1032+450',
      lane: 'Làn phải',
      defect_title: 'Ổ gà sâu (Pothole L3)',
      defect_type: 'POTHOLE',
      severity: 'CRITICAL',
      urgency: 'EMERGENCY',
      time_ago: '15 phút trước',
      created_at: '21:30, 25/08/2026',
      status: 'PENDING',
      status_label: 'Chờ xác minh',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      gps: {
        lat: 16.0544,
        lng: 108.2022,
        altitude_m: 4.5,
        resolution_cm_px: 0.3
      },
      ai_confidence: 98.4,
      area_sqm: 1.45,
      ai_area_sqm: 1.42,
      max_depth_cm: 8.5,
      ai_depth_cm: 8.2,
      pm_notes: 'Đã đối chiếu với ảnh chụp tuần tra viên, nguy cơ nổ lốp xe tải trọng lớn. Chỉ đạo đội duy tu số 2 chuẩn bị nhựa asphalt nóng loại C12.5 vá khẩn trước 02:00 sáng mai.',
      cluster_duplicates: [
        {
          code: '#CAS-2026-0839',
          source: 'Citizen App',
          distance_m: 1.8,
          reporter: 'Nguyễn Văn A báo lúc 19:40',
          selected: true
        },
        {
          code: '#CAS-2026-0835',
          source: 'Tuần tra viên',
          distance_m: 2.1,
          reporter: 'Lê Tuấn báo lúc 17:15',
          selected: true
        }
      ]
    },
    {
      id: 'cas-02',
      code: '#CAS-2026-0841',
      source: 'CITIZEN',
      source_label: 'Citizen App',
      source_detail: 'Phản ánh người dân qua Cổng tiếp nhận Dịch vụ Công',
      project_id: 'prj-ctbn-01',
      project_name: 'Cao tốc Bắc Nam',
      stationing: 'Km 45+200',
      lane: 'Dải giữa',
      defect_title: 'Nứt rạn lưới mai rùa',
      defect_type: 'ALLIGATOR_CRACK',
      severity: 'HIGH',
      urgency: 'URGENT',
      time_ago: '45 phút trước',
      created_at: '21:00, 25/08/2026',
      status: 'PENDING',
      status_label: 'Chờ xác minh',
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      gps: {
        lat: 18.9124,
        lng: 105.6128,
        altitude_m: 1.2,
        resolution_cm_px: 0.8
      },
      ai_confidence: 89.1,
      area_sqm: 3.2,
      ai_area_sqm: 3.0,
      max_depth_cm: 2.0,
      ai_depth_cm: 1.8,
      pm_notes: 'Cần trám keo nhựa đường polymer chống thấm nước nền hạ trước mùa mưa.'
    },
    {
      id: 'cas-03',
      code: '#CAS-2026-0840',
      source: 'PATROL',
      source_label: 'Tuần tra đường',
      source_detail: 'Đội tuần đường lưu động Cát Tường - Xe tuần kiểm 02',
      project_id: 'prj-ql1a-02',
      project_name: 'QL1A - Tuyến mở rộng',
      stationing: 'Km 1028+100',
      lane: 'Lề đất',
      defect_title: 'Vỡ mép thảm nhựa',
      defect_type: 'EDGE_SPALLING',
      severity: 'LOW',
      urgency: 'NORMAL',
      time_ago: '2 giờ trước',
      created_at: '19:45, 25/08/2026',
      status: 'NEED_SURVEY',
      status_label: 'Cần đo đạc',
      image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      gps: {
        lat: 16.0821,
        lng: 108.1824,
        altitude_m: 1.5,
        resolution_cm_px: 0.5
      },
      ai_confidence: 82.5,
      area_sqm: 0.85,
      ai_area_sqm: 0.78,
      max_depth_cm: 4.2,
      ai_depth_cm: 4.0,
      pm_notes: 'Mép vỡ ảnh hưởng lề gia cố, giao đội đo đạc hiện trường bắn cao độ.'
    },
    {
      id: 'cas-04',
      code: '#CAS-2026-0839',
      source: 'CITIZEN',
      source_label: 'Citizen App',
      source_detail: 'Phản ánh người dân (Gần vị trí #CAS-2026-0842)',
      project_id: 'prj-ql1a-02',
      project_name: 'QL1A - Giai đoạn 2',
      stationing: 'Km 1032+452',
      lane: 'Làn phải',
      defect_title: 'Ổ gà lớn gây ngập nước',
      defect_type: 'POTHOLE',
      severity: 'CRITICAL',
      urgency: 'EMERGENCY',
      time_ago: '2 giờ trước',
      created_at: '19:40, 25/08/2026',
      status: 'PENDING',
      status_label: 'Nghi trùng lặp',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      gps: {
        lat: 16.0544,
        lng: 108.2023,
        altitude_m: 1.6,
        resolution_cm_px: 1.0
      },
      ai_confidence: 94.2,
      area_sqm: 1.5,
      ai_area_sqm: 1.45,
      max_depth_cm: 8.0,
      ai_depth_cm: 7.9,
      pm_notes: 'Trùng vị trí với bản ghi của Drone. Kiến nghị gộp vào #CAS-2026-0842.'
    },
    {
      id: 'cas-05',
      code: '#CAS-2026-0838',
      source: 'DRONE_AI',
      source_label: 'Drone AI Scan',
      source_detail: 'Matrice 300 RTK - Zenmuse P1',
      project_id: 'prj-ql1a-02',
      project_name: 'Đường tránh TP. Vinh',
      stationing: 'Km 12+800',
      lane: 'Làn trái',
      defect_title: 'Lún vệt bánh xe',
      defect_type: 'RUTTING',
      severity: 'LOW',
      urgency: 'NORMAL',
      time_ago: '4 giờ trước',
      created_at: '17:30, 25/08/2026',
      status: 'VERIFIED',
      status_label: 'Đã xác minh',
      image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
      gps: {
        lat: 18.6721,
        lng: 105.6829,
        altitude_m: 60.0,
        resolution_cm_px: 1.1
      },
      ai_confidence: 96.0,
      area_sqm: 12.5,
      ai_area_sqm: 12.1,
      max_depth_cm: 3.5,
      ai_depth_cm: 3.2,
      pm_notes: 'Đã xác nhận lún hằn vệt bánh xe, đã đưa vào đợt sửa chữa định kỳ tháng 10.'
    },
    {
      id: 'cas-06',
      code: '#CAS-2026-0837',
      source: 'PATROL',
      source_label: 'Tuần tra đường',
      source_detail: 'Kỹ sư tuần kiểm hạt quản lý đường bộ',
      project_id: 'prj-ql1a-02',
      project_name: 'QL1A - Giai đoạn 2',
      stationing: 'Km 1025+300',
      lane: 'Làn vượt',
      defect_title: 'Nứt dọc mặt đường nhựa',
      defect_type: 'LONGITUDINAL_CRACK',
      severity: 'MEDIUM',
      urgency: 'URGENT',
      time_ago: '5 giờ trước',
      created_at: '16:15, 25/08/2026',
      status: 'PENDING',
      status_label: 'Chờ xác minh',
      image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      gps: {
        lat: 16.0234,
        lng: 108.1923,
        altitude_m: 1.4,
        resolution_cm_px: 0.4
      },
      ai_confidence: 88.0,
      area_sqm: 2.1,
      ai_area_sqm: 2.0,
      max_depth_cm: 1.5,
      ai_depth_cm: 1.4,
      pm_notes: 'Vết nứt mở rộng 3mm, cần trám mastic nhựa đường.'
    }
  ])

  // Selected Case for Right Detail Panel
  const [selectedCaseId, setSelectedCaseId] = useState<string>('cas-01')
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0]
  }, [cases, selectedCaseId])

  // Tabs Filter
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'MERGED' | 'NEED_SURVEY' | 'CRITICAL'>('PENDING')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [projectFilter, setProjectFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // View Mode for right drawer photo card: 'PHOTO' or 'GIS_MAP'
  const [detailViewMode, setDetailViewMode] = useState<'PHOTO' | 'GIS_MAP'>('PHOTO')
  const [modalMapType, setModalMapType] = useState<'SATELLITE' | 'STREET'>('SATELLITE')

  // Modals state
  const [isGISModalOpen, setIsGISModalOpen] = useState<boolean>(false)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false)
  const [isPhotoZoomModalOpen, setIsPhotoZoomModalOpen] = useState<boolean>(false)

  // Refs for MapLibre map containers
  const modalMapContainerRef = useRef<HTMLDivElement>(null)
  const modalMapInstanceRef = useRef<maplibregl.Map | null>(null)
  const drawerMapContainerRef = useRef<HTMLDivElement>(null)
  const drawerMapInstanceRef = useRef<maplibregl.Map | null>(null)

  // Helper: Tạo GeoJSON vòng tròn bán kính R mét cho cụm gộp trùng không gian
  const createGeoCircle = (center: [number, number], radiusMeters: number, points = 36) => {
    const coords: [number, number][] = []
    const km = radiusMeters / 1000
    const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180))
    const distanceY = km / 110.574
    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI)
      coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)])
    }
    coords.push(coords[0])
    return coords
  }

  // Cấu hình Style Google Satellite & OSM Raster Style
  const getMapLibreStyle = (isSatellite: boolean): maplibregl.StyleSpecification => ({
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
        source: 'satellite-tiles',
        layout: { visibility: isSatellite ? 'visible' : 'none' },
        minzoom: 0,
        maxzoom: 24
      },
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-tiles',
        layout: { visibility: !isSatellite ? 'visible' : 'none' },
        minzoom: 0,
        maxzoom: 24
      }
    ]
  })

  // Effect: Khởi tạo MapLibre trong Modal GIS Preview
  useEffect(() => {
    if (!isGISModalOpen || !modalMapContainerRef.current) return

    if (modalMapInstanceRef.current) {
      modalMapInstanceRef.current.remove()
      modalMapInstanceRef.current = null
    }

    const center: [number, number] = [selectedCase.gps.lng, selectedCase.gps.lat]
    const map = new maplibregl.Map({
      container: modalMapContainerRef.current,
      style: getMapLibreStyle(modalMapType === 'SATELLITE'),
      center,
      zoom: 19,
      minZoom: 12,
      maxZoom: 22,
      pitch: 35,
      bearing: -15
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      // 1. Thêm vòng đệm bán kính 2.5m (Spatial Cluster Buffer)
      const circleCoords = createGeoCircle(center, 2.5)
      map.addSource('cluster-buffer-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [circleCoords] },
          properties: {}
        }
      })

      map.addLayer({
        id: 'cluster-buffer-fill',
        type: 'fill',
        source: 'cluster-buffer-source',
        paint: {
          'fill-color': '#C9A227',
          'fill-opacity': 0.25
        }
      })

      map.addLayer({
        id: 'cluster-buffer-outline',
        type: 'line',
        source: 'cluster-buffer-source',
        paint: {
          'line-color': '#C9A227',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      })

      // 2. Thêm Marker điểm lỗi gốc
      const el = document.createElement('div')
      el.className = 'cursor-pointer'
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#C9A227; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.3); margin-bottom:2px; white-space:nowrap; border:1px solid #fff;">
            ${selectedCase.code} (Hồ sơ gốc)
          </div>
          <div style="width:20px; height:20px; background:#DC2626; border:3px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #DC2626;"></div>
        </div>
      `
      new maplibregl.Marker({ element: el })
        .setLngLat(center)
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family:sans-serif; font-size:12px; padding:4px;">
              <strong style="color:#C9A227;">${selectedCase.code}</strong><br/>
              <strong>${selectedCase.defect_title}</strong><br/>
              <span style="color:#64748B;">Lý trình: ${selectedCase.stationing} (${selectedCase.lane})</span><br/>
              <span style="color:#DC2626; font-weight:bold;">Mức độ: ${selectedCase.severity}</span>
            </div>
          `)
        )
        .addTo(map)

      // 3. Thêm Markers cho các phản ánh lân cận nếu có
      selectedCase.cluster_duplicates?.forEach((dup, idx) => {
        const dLng = center[0] + (idx === 0 ? 0.000016 : -0.000018)
        const dLat = center[1] + (idx === 0 ? 0.000012 : -0.000010)
        const dupEl = document.createElement('div')
        dupEl.className = 'cursor-pointer'
        dupEl.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="background:#D97706; color:#fff; font-size:9px; font-weight:bold; padding:1px 5px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.3); margin-bottom:2px; white-space:nowrap; border:1px solid #fff;">
              ${dup.code} (${dup.distance_m}m)
            </div>
            <div style="width:14px; height:14px; background:#F59E0B; border:2px solid #FFFFFF; border-radius:50%;"></div>
          </div>
        `
        new maplibregl.Marker({ element: dupEl })
          .setLngLat([dLng, dLat])
          .setPopup(
            new maplibregl.Popup({ offset: 20 }).setHTML(`
              <div style="font-family:sans-serif; font-size:11px; padding:4px;">
                <strong style="color:#D97706;">${dup.code} (Trùng vị trí)</strong><br/>
                <span>Nguồn: ${dup.source}</span><br/>
                <span>Người gửi: ${dup.reporter}</span><br/>
                <span style="color:#059669; font-weight:bold;">Khoảng cách tới tâm: ${dup.distance_m}m</span>
              </div>
            `)
          )
          .addTo(map)
      })
    })

    modalMapInstanceRef.current = map

    return () => {
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.remove()
        modalMapInstanceRef.current = null
      }
    }
  }, [isGISModalOpen, selectedCase, modalMapType])

  // Effect: Khởi tạo MapLibre mini trong panel Drawer khi người dùng bấm tab Bản đồ
  useEffect(() => {
    if (detailViewMode !== 'GIS_MAP' || !drawerMapContainerRef.current) return

    if (drawerMapInstanceRef.current) {
      drawerMapInstanceRef.current.remove()
      drawerMapInstanceRef.current = null
    }

    const center: [number, number] = [selectedCase.gps.lng, selectedCase.gps.lat]
    const map = new maplibregl.Map({
      container: drawerMapContainerRef.current,
      style: getMapLibreStyle(true),
      center,
      zoom: 18.5,
      minZoom: 10,
      maxZoom: 22,
      pitch: 30
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="width:16px; height:16px; background:#DC2626; border:2px solid #FFFFFF; border-radius:50%; box-shadow:0 0 8px #DC2626;"></div>
        </div>
      `
      new maplibregl.Marker({ element: el }).setLngLat(center).addTo(map)
    })

    drawerMapInstanceRef.current = map

    return () => {
      if (drawerMapInstanceRef.current) {
        drawerMapInstanceRef.current.remove()
        drawerMapInstanceRef.current = null
      }
    }
  }, [detailViewMode, selectedCase])

  // Form states for selected case editing
  const [currentSeverity, setCurrentSeverity] = useState<TriageCase['severity']>(selectedCase?.severity || 'CRITICAL')
  const [currentUrgency, setCurrentUrgency] = useState<TriageCase['urgency']>(selectedCase?.urgency || 'EMERGENCY')
  const [currentArea, setCurrentArea] = useState<number>(selectedCase?.area_sqm || 1.45)
  const [currentDepth, setCurrentDepth] = useState<number>(selectedCase?.max_depth_cm || 8.5)
  const [currentNotes, setCurrentNotes] = useState<string>(selectedCase?.pm_notes || '')

  // Update form inputs when selectedCase changes
  const handleSelectCase = (c: TriageCase) => {
    setSelectedCaseId(c.id)
    setCurrentSeverity(c.severity)
    setCurrentUrgency(c.urgency)
    setCurrentArea(c.area_sqm)
    setCurrentDepth(c.max_depth_cm)
    setCurrentNotes(c.pm_notes)
  }

  // Checkbox toggle for duplicate cluster items
  const handleToggleClusterItem = (code: string) => {
    if (!selectedCase?.cluster_duplicates) return
    const updatedDuplicates = selectedCase.cluster_duplicates.map((dup) =>
      dup.code === code ? { ...dup, selected: !dup.selected } : dup
    )
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, cluster_duplicates: updatedDuplicates } : c
      )
    )
  }

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Tab filter
      if (activeTab === 'PENDING' && c.status !== 'PENDING') return false
      if (activeTab === 'MERGED' && c.status !== 'MERGED') return false
      if (activeTab === 'NEED_SURVEY' && c.status !== 'NEED_SURVEY') return false
      if (activeTab === 'CRITICAL' && c.severity !== 'CRITICAL') return false

      // Dropdown filters
      if (sourceFilter !== 'ALL' && c.source !== sourceFilter) return false
      if (projectFilter !== 'ALL' && c.project_name !== projectFilter) return false
      if (priorityFilter !== 'ALL' && c.severity !== priorityFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          c.code.toLowerCase().includes(q) ||
          c.defect_title.toLowerCase().includes(q) ||
          c.stationing.toLowerCase().includes(q) ||
          c.project_name.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [cases, activeTab, sourceFilter, projectFilter, priorityFilter, searchQuery])

  // Count stats
  const pendingCount = cases.filter((c) => c.status === 'PENDING').length
  const criticalCount = cases.filter((c) => c.severity === 'CRITICAL').length
  const mergedCount = cases.filter((c) => c.status === 'MERGED').length
  const surveyCount = cases.filter((c) => c.status === 'NEED_SURVEY').length

  // Handlers for Triage Decision Actions
  const handleVerifyDefect = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: 'VERIFIED',
              status_label: 'Đã xác minh',
              severity: currentSeverity,
              urgency: currentUrgency,
              area_sqm: currentArea,
              max_depth_cm: currentDepth,
              pm_notes: currentNotes
            }
          : c
      )
    )
    showToast(`Đã xác minh hợp lệ hồ sơ [${selectedCase.code}]! Đã tạo khiếm khuyết OPEN sẵn sàng đưa vào lệnh sửa chữa cấp bách (WF-05).`)
  }

  const handleRejectDefect = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: 'REJECTED',
              status_label: 'Đã từ chối (Báo sai)',
              pm_notes: `[TỪ CHỐI] ${currentNotes}`
            }
          : c
      )
    )
    showToast(`Đã từ chối hồ sơ [${selectedCase.code}] do không cấu thành hư hỏng kết cấu.`)
  }

  const handleRequestSurvey = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: 'NEED_SURVEY',
              status_label: 'Cần đo đạc',
              pm_notes: `[YÊU CẦU ĐO ĐẠC] ${currentNotes}`
            }
          : c
      )
    )
    showToast(`Đã chuyển hồ sơ [${selectedCase.code}] sang hàng đợi nhiệm vụ khảo sát đo đạc hiện trường (WF-11).`)
  }

  const handleExecuteMerge = () => {
    // Merge selected duplicates into master
    const selectedDups = selectedCase.cluster_duplicates?.filter((d) => d.selected) || []
    if (selectedDups.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 hồ sơ trùng lặp để gộp!')
      return
    }

    const dupCodes = selectedDups.map((d) => d.code)
    setCases((prev) =>
      prev.map((c) => {
        if (dupCodes.includes(c.code)) {
          return {
            ...c,
            status: 'MERGED',
            status_label: 'Đã gộp trùng',
            pm_notes: `Đã tự động gộp dữ liệu vào hồ sơ chính ${selectedCase.code}`
          }
        }
        if (c.id === selectedCase.id) {
          return {
            ...c,
            pm_notes: `${c.pm_notes} (Đã tích hợp bằng chứng từ ${dupCodes.join(', ')})`
          }
        }
        return c
      })
    )
    setIsMergeModalOpen(false)
    showToast(`Gộp thành công ${selectedDups.length} phản ánh lân cận vào hồ sơ gốc [${selectedCase.code}]!`)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate('/pm/dashboard')}>Trang chủ</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate('/pm/surveys')}>Khiếm khuyết</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-[#8F7212]">Hộp thư tiếp nhận (Triage WF-04)</span>
        </nav>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Đồng bộ cảm biến GIS thời gian thực: 25/08/2026 21:45</span>
        </div>
      </div>

      {/* Page Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              Hộp Thư Tiếp Nhận Sự Cố &amp; Triage Khiếm Khuyết
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A227]/15 text-[#8F7212] border border-[#C9A227]/30">
              PM Triage Hub
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              {pendingCount} ca chờ duyệt
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận phản ánh từ người dân, tuần tra hiện trường và Drone AI Scan; thuật toán gộp trùng không gian bán kính 1-2m và chấm điểm ưu tiên Severity × Urgency.
          </p>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => showToast('Đang xuất danh sách hồ sơ Triage ra file Excel TCVN...')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất danh sách</span>
          </button>
          <button
            onClick={() => setIsMergeModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Merge className="w-4 h-4" />
            <span>Gộp phản ánh trùng lặp (2)</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs & Search Controls */}
      <div className="bg-white rounded-xl border border-brand-border shadow-2xs p-4 space-y-3">
        {/* Horizontal Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-brand-dark text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả <span className="ml-1 opacity-70">({cases.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ xác minh</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{pendingCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('MERGED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'MERGED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đã gộp trùng <span className="ml-1 opacity-70">({mergedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('NEED_SURVEY')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'NEED_SURVEY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cần đo đạc <span className="ml-1 opacity-70">({surveyCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('CRITICAL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CRITICAL'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Khẩn cấp</span>
            <span className="ml-0.5 bg-red-700 text-white px-1.5 py-0.2 rounded-full text-[10px]">{criticalCount}</span>
          </button>
        </div>

        {/* 5-Column Filter Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 mb-1">Nguồn tiếp nhận</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            >
              <option value="ALL">Tất cả nguồn</option>
              <option value="DRONE_AI">Drone AI Scan</option>
              <option value="CITIZEN">Citizen App</option>
              <option value="PATROL">Tuần tra hiện trường</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 mb-1">Tuyến quốc lộ / Dự án</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            >
              <option value="ALL">Tất cả tuyến đường</option>
              <option value="QL1A - Giai đoạn 2">QL1A - Giai đoạn 2</option>
              <option value="Cao tốc Bắc Nam">Cao tốc Bắc Nam</option>
              <option value="QL1A - Tuyến mở rộng">QL1A - Tuyến mở rộng</option>
              <option value="Đường tránh TP. Vinh">Đường tránh TP. Vinh</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 mb-1">Mức độ ưu tiên</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            >
              <option value="ALL">Mọi cấp độ</option>
              <option value="CRITICAL">Critical (Khẩn cấp)</option>
              <option value="HIGH">High (Cao)</option>
              <option value="MEDIUM">Medium (Vừa)</option>
              <option value="LOW">Low (Bình thường)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 mb-1">Khoảng ngày tiếp nhận</label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <span>25/08/2026 (Hôm nay)</span>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => showToast('Đang áp dụng bộ lọc nâng cao')}
              type="button"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc</span>
            </button>
            <button
              onClick={() => {
                setSourceFilter('ALL')
                setProjectFilter('ALL')
                setPriorityFilter('ALL')
                setSearchQuery('')
                setActiveTab('ALL')
                showToast('Đã đặt lại toàn bộ bộ lọc')
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="Đặt lại bộ lọc"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN WORKFLOW (Flexible Master-Detail Layout) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        {/* LEFT COLUMN: Master Triage Queue Table (Flex-1) */}
        <div className="flex-1 w-full bg-white rounded-xl border border-brand-border shadow-2xs p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-brand-dark">Danh Sách Hồ Sơ Cần Phân Loại</h2>
                <p className="text-xs text-slate-500">
                  Hiển thị {filteredCases.length} / {cases.length} hồ sơ theo tiêu chí lọc
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã #CAS, lý trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            {/* Table Header Row */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg">
              <span className="col-span-2">Mã Case</span>
              <span className="col-span-2">Nguồn Dữ Liệu</span>
              <span className="col-span-3">Vị Trí &amp; Lý Trình</span>
              <span className="col-span-2">Loại Hư Hại</span>
              <span className="col-span-1">Ưu Tiên</span>
              <span className="col-span-2 text-right">Trạng Thái</span>
            </div>

            {/* List of Triage Items */}
            <div className="space-y-2">
              {filteredCases.map((item) => {
                const isSelected = item.id === selectedCase.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCase(item)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center border ${
                      isSelected
                        ? 'bg-amber-50/60 border-[#C9A227] shadow-sm ring-1 ring-[#C9A227]/30'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Code */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-[#C9A227]'
                            : item.status === 'MERGED'
                            ? 'bg-blue-400'
                            : 'bg-slate-300'
                        }`}
                      ></span>
                      <span className="font-mono font-bold text-xs text-brand-dark">{item.code}</span>
                    </div>

                    {/* Source */}
                    <div className="md:col-span-2 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 font-medium text-[11px] px-2.5 py-0.5 rounded-full ${
                        item.source === 'DRONE_AI'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : item.source === 'CITIZEN'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-[#8F7212] border border-amber-200'
                      }`}>
                        {item.source === 'DRONE_AI' && <Plane className="w-3 h-3 text-slate-500" />}
                        {item.source === 'CITIZEN' && <Smartphone className="w-3 h-3 text-blue-600" />}
                        {item.source === 'PATROL' && <Car className="w-3 h-3 text-[#C9A227]" />}
                        <span>{item.source_label}</span>
                      </span>
                    </div>

                    {/* Location & Chainage */}
                    <div className="md:col-span-3 flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs text-brand-dark">{item.project_name}</span>
                        {item.cluster_duplicates && item.cluster_duplicates.length > 0 && (
                          <span
                            className="text-amber-600"
                            title={`Có ${item.cluster_duplicates.length} phản ánh trùng lân cận`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          {item.stationing}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">({item.lane})</span>
                      </div>
                    </div>

                    {/* Defect Title & Time */}
                    <div className="md:col-span-2 flex flex-col">
                      <span className="text-xs font-medium text-brand-dark truncate">{item.defect_title}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.time_ago}</span>
                    </div>

                    {/* Severity */}
                    <div className="md:col-span-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : item.severity === 'HIGH'
                          ? 'bg-amber-100 text-[#8F7212] border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.severity}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2 flex justify-end w-full md:w-auto">
                      {item.status === 'PENDING' && (
                        <span className="bg-amber-100 text-[#8F7212] text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          <span>Chờ xác minh</span>
                        </span>
                      )}
                      {item.status === 'VERIFIED' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã xác minh</span>
                        </span>
                      )}
                      {item.status === 'NEED_SURVEY' && (
                        <span className="bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Cần đo đạc</span>
                        </span>
                      )}
                      {item.status === 'MERGED' && (
                        <span className="bg-purple-100 text-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-purple-200">
                          <Merge className="w-3 h-3 text-purple-600" />
                          <span>Đã gộp trùng</span>
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-slate-200">
                          <X className="w-3 h-3 text-slate-500" />
                          <span>Báo sai</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Trang 1 / 3 (Tổng số {filteredCases.length} bản ghi)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-xs font-bold bg-[#C9A227] text-white shadow-2xs"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-xs hover:bg-slate-100 text-slate-700 transition-colors"
              >
                2
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-xs hover:bg-slate-100 text-slate-700 transition-colors"
              >
                3
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PM Decision & Technical Triage Panel (480px) */}
        <div className="w-full xl:w-[480px] bg-white rounded-xl border border-brand-border shadow-2xs p-5 flex flex-col gap-4 shrink-0">
          {/* Header */}
          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-brand-dark">Hồ Sơ Thẩm Định</span>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C9A227]/15 text-[#8F7212] border border-[#C9A227]/30">
                  {selectedCase.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gửi lúc {selectedCase.created_at} bởi {selectedCase.source_detail}
              </p>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsPhotoZoomModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Mở rộng chi tiết"
                type="button"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Mode Toggle: Photo vs Live MapLibre Map */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDetailViewMode('PHOTO')}
                className={`px-3 py-1 rounded-md transition-all ${
                  detailViewMode === 'PHOTO'
                    ? 'bg-white text-brand-dark shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ảnh chụp hiện trường
              </button>
              <button
                type="button"
                onClick={() => setDetailViewMode('GIS_MAP')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  detailViewMode === 'GIS_MAP'
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Bản đồ MapLibre</span>
              </button>
            </div>

            <button
              onClick={() => setIsGISModalOpen(true)}
              type="button"
              className="text-xs font-bold text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Phóng to GIS</span>
            </button>
          </div>

          {detailViewMode === 'PHOTO' ? (
            /* Photo Viewport with Telemetry HUD */
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group h-52">
              <img
                src={selectedCase.image_url}
                alt={selectedCase.defect_title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              {/* Top-left GPS & telemetry overlay */}
              <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-[10px] flex items-center gap-2 shadow-md border border-white/10">
                <div className="flex items-center gap-1 font-bold text-[#C9A227]">
                  <MapPin className="w-3 h-3 text-[#C9A227]" />
                  <span>{selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E</span>
                </div>
                <span className="opacity-40">•</span>
                <span className="opacity-90">Alt: {selectedCase.gps.altitude_m}m</span>
                <span className="opacity-40">•</span>
                <span className="opacity-90">Res: {selectedCase.gps.resolution_cm_px}cm/px</span>
              </div>

              {/* Bottom-right quick view buttons */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  onClick={() => setIsPhotoZoomModalOpen(true)}
                  type="button"
                  className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white p-1.5 rounded-full transition-colors flex items-center shadow-md border border-white/10 cursor-pointer"
                  title="Xem ảnh gốc độ phân giải cao"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsGISModalOpen(true)}
                  type="button"
                  className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 shadow-md border border-white/10 cursor-pointer"
                  title="Mở vị trí trên bản đồ GIS"
                >
                  <MapPin className="w-3 h-3 text-[#C9A227]" />
                  <span>Bản đồ GIS</span>
                </button>
              </div>

              {/* Bottom-left AI Confidence Tag */}
              <div className="absolute bottom-2.5 left-2.5 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <span>AI Confidence: {selectedCase.ai_confidence}% ({selectedCase.defect_title})</span>
              </div>
            </div>
          ) : (
            /* Live Mini MapLibre in Drawer */
            <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
              <div ref={drawerMapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
                {selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E
              </div>
            </div>
          )}

          {/* Spatial Cluster Deduplication Box (< 2.5m) */}
          {selectedCase.cluster_duplicates && selectedCase.cluster_duplicates.length > 0 && (
            <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-amber-950">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Phát hiện {selectedCase.cluster_duplicates.length} phản ánh lân cận (&lt; 2.5m)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C9A227] text-white">
                  Gợi ý gộp
                </span>
              </div>

              <div className="space-y-1.5">
                {selectedCase.cluster_duplicates.map((dup) => (
                  <label
                    key={dup.code}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-amber-200/60 cursor-pointer hover:bg-amber-50/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={dup.selected}
                      onChange={() => handleToggleClusterItem(dup.code)}
                      className="mt-1 w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand-dark">{dup.code}</span>
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full font-semibold">
                          Cách: {dup.distance_m}m
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {dup.source} • {dup.reporter}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsMergeModalOpen(true)}
                  className="text-xs font-bold text-[#8F7212] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Merge className="w-3.5 h-3.5" />
                  <span>Tự động gộp dữ liệu ảnh &amp; mô tả vào Case gốc này</span>
                </button>
                <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  Đã chọn: {selectedCase.cluster_duplicates.filter((d) => d.selected).length}/{selectedCase.cluster_duplicates.length}
                </span>
              </div>
            </div>
          )}

          {/* Technical Decision Form */}
          <div className="space-y-3.5 pt-1">
            {/* Severity & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold text-slate-700 mb-1">
                  Mức độ nghiêm trọng <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentSeverity}
                  onChange={(e) => setCurrentSeverity(e.target.value as any)}
                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A227] ${
                    currentSeverity === 'CRITICAL'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : currentSeverity === 'HIGH'
                      ? 'bg-amber-50 text-[#8F7212] border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="LOW">LOW (Nhẹ - Cấp 1)</option>
                  <option value="MEDIUM">MEDIUM (Vừa - Cấp 2)</option>
                  <option value="HIGH">HIGH (Nghiêm trọng - Cấp 3)</option>
                  <option value="CRITICAL">CRITICAL (Nguy hiểm - Cấp 4)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-semibold text-slate-700 mb-1">
                  Tính khẩn cấp <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentUrgency}
                  onChange={(e) => setCurrentUrgency(e.target.value as any)}
                  className="w-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                >
                  <option value="NORMAL">NORMAL (Theo lịch 7 ngày)</option>
                  <option value="URGENT">URGENT (Trong 24-48 giờ)</option>
                  <option value="EMERGENCY">EMERGENCY (Xử lý ngay 4h)</option>
                </select>
              </div>
            </div>

            {/* Area & Depth Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-600 mb-1">Diện tích hư hại</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-[#C9A227] focus-within:border-[#C9A227]">
                  <input
                    type="number"
                    step="0.01"
                    value={currentArea}
                    onChange={(e) => setCurrentArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-semibold ml-1">m²</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">AI ước tính: {selectedCase.ai_area_sqm} m²</span>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-600 mb-1">Độ sâu lớn nhất</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-[#C9A227] focus-within:border-[#C9A227]">
                  <input
                    type="number"
                    step="0.1"
                    value={currentDepth}
                    onChange={(e) => setCurrentDepth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-semibold ml-1">cm</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">AI ước tính: {selectedCase.ai_depth_cm} cm</span>
              </div>
            </div>

            {/* PM Notes */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Ghi chú thẩm định PM</label>
                <span className="text-[10px] text-slate-400 font-normal">Lưu nhật ký công trình</span>
              </div>
              <textarea
                rows={2}
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Nhập ghi chú kỹ thuật, chỉ đạo vá nóng cấp bách hoặc đề xuất cắm biển cảnh báo tạm..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227]"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleVerifyDefect}
                className="w-full py-2.5 px-4 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác minh hợp lệ (Verify Defect)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRejectDefect}
                  className="bg-white border border-slate-200 hover:bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Từ chối (No Defect)</span>
                </button>
                <button
                  type="button"
                  onClick={handleRequestSurvey}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Yêu cầu đo lại</span>
                </button>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>Đã đủ điều kiện kích hoạt lệnh thi công sửa chữa cấp bách (WF-05).</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: GỘP PHẢN ÁNH TRÙNG LẶP (DEDUPLICATION ENGINE MODAL) */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Merge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Gộp Phản Ánh Trùng Lặp Không Gian</h3>
                  <p className="text-xs text-slate-500">Thuật toán Spatial Clustering bán kính R &le; 2.5 mét</p>
                </div>
              </div>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-brand-dark">Hồ sơ gốc tiếp nhận chính:</span>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-mono font-bold text-[#8F7212]">{selectedCase.code} ({selectedCase.defect_title})</span>
                  <span>{selectedCase.stationing} - {selectedCase.project_name}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1.5">
                  Danh sách phản ánh vệ tinh lân cận sẽ gộp vào hồ sơ gốc:
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCase.cluster_duplicates?.map((dup) => (
                    <div
                      key={dup.code}
                      className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-dark">{dup.code}</span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Cách tâm {dup.distance_m}m
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{dup.source} • {dup.reporter}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        Sẽ gộp ảnh &amp; ghi chú
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Sau khi gộp, các hồ sơ phụ sẽ được chuyển sang trạng thái <strong>MERGED (Đã gộp trùng)</strong>, ảnh bằng chứng hiện trường sẽ được đính kèm vào Case gốc, tránh trùng lặp 2 lần chi phí dự toán BOQ.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMergeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteMerge}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Merge className="w-3.5 h-3.5" />
                <span>Xác nhận Gộp 2 Phản Ánh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GIS MAP PREVIEW MODAL */}
      {isGISModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C9A227]" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Vị Trí Bản Đồ Không Gian (GIS WGS84)</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedCase.code} • {selectedCase.stationing} ({selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGISModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real Interactive MapLibre Map Container */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setModalMapType('SATELLITE')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      modalMapType === 'SATELLITE'
                        ? 'bg-[#C9A227] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ảnh vệ tinh Google (Satellite)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMapType('STREET')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      modalMapType === 'STREET'
                        ? 'bg-[#C9A227] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bản đồ giao thông (Vector)
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Vùng đệm cụm: 2.5m (Spatial Cluster)</span>
                </div>
              </div>

              <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
                <div ref={modalMapContainerRef} className="w-full h-full" />
                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[11px] font-mono border border-white/10 z-10 pointer-events-none">
                  Hệ quy chiếu: WGS-84 / UTM Zone 32648 (EPSG:32648) • Bán kính cụm: 2.5m
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsGISModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Đóng bản đồ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL PHOTO ZOOM */}
      {isPhotoZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full p-4 shadow-2xl border border-slate-700 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C9A227]">{selectedCase.code}</span>
                <span className="text-xs text-slate-300">• {selectedCase.defect_title} ({selectedCase.stationing})</span>
              </div>
              <button
                onClick={() => setIsPhotoZoomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-96 rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedCase.image_url}
                alt="Full resolution inspection"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Độ phân giải thực: 0.3 cm/px • Nguồn chụp: Matrice 300 RTK</span>
              <button
                onClick={() => setIsPhotoZoomModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
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
export default AIReviewInbox
