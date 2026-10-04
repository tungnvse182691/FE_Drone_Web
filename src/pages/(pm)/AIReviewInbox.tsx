import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { mockTriageCases, mockProjects } from '../../data/mockData'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle as getUnifiedMapLibreStyle } from '../../utils/maplibre'
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
  Square,
  Users,
  Phone,
  Link2,
  Unlink,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  CornerDownRight
} from 'lucide-react'

// Key lưu trữ dữ liệu Triage trong LocalStorage để đồng bộ trạng thái thực tế
const TRIAGE_STORAGE_KEY = 'roadguard_triage_cases_v2'

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
  // Mở rộng tiếp nhận & điều phối phản ánh người dân (PA03, PA04)
  reporter_name?: string
  reporter_phone?: string
  reporter_channel?: string
  description?: string
  conclusion?: 'DEFECT_FOUND' | 'NO_DEFECT' | 'OUT_OF_SCOPE' | null
  conclusion_reason?: string
  linked_report_ids?: string[]
  master_case_id?: string
  is_assigned?: boolean
  is_published?: boolean
  published_at?: string
  public_notice?: string
  // Phân công khảo sát & đo đạc lại (WF-11 / BR-09)
  survey_assignment?: {
    mode: 'MEASURE_ONLY' | 'DRONE_RESURVEY'
    reason: string
    assigned_crew: string
    sla_hours: number
    created_at: string
  }
  // Cụm trùng lặp lân cận (Spatial cluster)
  cluster_duplicates?: {
    code: string
    source: string
    distance_m: number
    reporter: string
    time?: string
    image_url?: string
    selected: boolean
    is_merged?: boolean
  }[]
}

export const AIReviewInbox: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Dữ liệu hồ sơ tiếp nhận từ Single Source of Truth + Đồng bộ LocalStorage
  const [cases, setCases] = useState<TriageCase[]>(() => {
    try {
      const saved = localStorage.getItem(TRIAGE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (err) {
      console.error('Failed to load triage cases from storage', err)
    }
    return mockTriageCases
  })

  // Tự động lưu LocalStorage khi dữ liệu cases thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(TRIAGE_STORAGE_KEY, JSON.stringify(cases))
    } catch (err) {
      console.error('Failed to save triage cases to storage', err)
    }
  }, [cases])

  // Reset dữ liệu mẫu
  const handleResetTriageData = () => {
    setCases(mockTriageCases)
    try {
      localStorage.removeItem(TRIAGE_STORAGE_KEY)
    } catch {}
    setSelectedReportIds([])
    showToast('Đã đặt lại dữ liệu phản ánh & triage về mặc định ban đầu!')
  }

  // Chế độ xem: Bảng tiếp nhận & điều phối phản ánh dân (PA03, PA04) vs Hộp thư Drone AI
  const [viewSourceMode, setViewSourceMode] = useState<'CITIZEN_TRIAGE' | 'DRONE_AI' | 'ALL'>('CITIZEN_TRIAGE')

  // Thu gọn / Mở rộng nhóm báo cáo trùng (Accordion)
  const [expandedMasterIds, setExpandedMasterIds] = useState<string[]>(['cas-05'])
  const [collapseMergedRows, setCollapseMergedRows] = useState<boolean>(true)

  const handleToggleExpandMaster = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedMasterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Multi-select cho bảng tiếp nhận phản ánh người dân (Link Reports)
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])

  // Modal Liên kết báo trùng (Link Reports - PA04)
  const [isLinkReportsModalOpen, setIsLinkReportsModalOpen] = useState<boolean>(false)
  const [linkMasterCaseId, setLinkMasterCaseId] = useState<string>('')
  const [linkAuditNotes, setLinkAuditNotes] = useState<string>('')

  // Modal Điều phối dự án (Triage Case - PA03)
  const [isTriageProjectModalOpen, setIsTriageProjectModalOpen] = useState<boolean>(false)
  const [targetTriageCase, setTargetTriageCase] = useState<TriageCase | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('prj-ql1a-02')

  // Modal Kết luận Không có khiếm khuyết NO_DEFECT (Bắt buộc lý do theo BR-39)
  const [isNoDefectModalOpen, setIsNoDefectModalOpen] = useState<boolean>(false)
  const [noDefectReason, setNoDefectReason] = useState<string>('')

  // Modal Công bố kết quả sửa chữa cho người dân (PA07)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false)
  const [publishPublicNote, setPublishPublicNote] = useState<string>('')

  // Modal Yêu cầu đo đạc bổ sung / Bay drone lại (WF-11 / NEEDS_MEASUREMENT)
  const [isRequestSurveyModalOpen, setIsRequestSurveyModalOpen] = useState<boolean>(false)
  const [surveyMode, setSurveyMode] = useState<'MEASURE_ONLY' | 'DRONE_RESURVEY'>('MEASURE_ONLY')
  const [surveyReason, setSurveyReason] = useState<string>('')
  const [surveyAssignedCrew, setSurveyAssignedCrew] = useState<string>('Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)')
  const [surveySlaHours, setSurveySlaHours] = useState<number>(24)

  // Selected Case for Right Detail Panel
  const [selectedCaseId, setSelectedCaseId] = useState<string>('cas-05')
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0]
  }, [cases, selectedCaseId])

  // Tabs Filter
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'MERGED' | 'NEED_SURVEY' | 'CRITICAL'>('ALL')
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

  // Cấu hình Style Google Satellite & OSM Raster Style chuẩn MapLibre
  const getMapLibreStyle = (isSatellite: boolean): maplibregl.StyleSpecification =>
    getUnifiedMapLibreStyle(isSatellite ? 'SATELLITE' : 'STREETS')

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
      // View Source Mode Filter
      if (viewSourceMode === 'CITIZEN_TRIAGE' && c.source === 'DRONE_AI') return false
      if (viewSourceMode === 'DRONE_AI' && c.source !== 'DRONE_AI') return false

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
          c.project_name.toLowerCase().includes(q) ||
          (c.reporter_name && c.reporter_name.toLowerCase().includes(q)) ||
          (c.reporter_phone && c.reporter_phone.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [cases, viewSourceMode, activeTab, sourceFilter, projectFilter, priorityFilter, searchQuery])

  // Count stats
  const pendingCount = cases.filter((c) => c.status === 'PENDING').length
  const criticalCount = cases.filter((c) => c.severity === 'CRITICAL').length
  const mergedCount = cases.filter((c) => c.status === 'MERGED').length
  const surveyCount = cases.filter((c) => c.status === 'NEED_SURVEY').length

  const citizenCount = cases.filter((c) => c.source === 'CITIZEN' || c.source === 'PATROL').length
  const unassignedCitizenCount = cases.filter(
    (c) => (c.source === 'CITIZEN' || c.source === 'PATROL') && (!c.project_id || c.project_id === '')
  ).length
  const droneAICount = cases.filter((c) => c.source === 'DRONE_AI').length

  // Handlers for Triage Decision Actions
  const handleVerifyDefect = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'VERIFIED',
              status_label: 'Đã xác minh (Verified)',
              conclusion: 'DEFECT_FOUND',
              severity: currentSeverity,
              urgency: currentUrgency,
              area_sqm: currentArea,
              max_depth_cm: currentDepth,
              pm_notes: currentNotes || 'Đã xác minh hư hỏng đạt tiêu chí kích hoạt sửa chữa.'
            }
          : item
      )
    )
    showToast(`Đã xác minh hợp lệ hồ sơ [${target.code}]! Đã tạo khiếm khuyết OPEN sẵn sàng đưa vào lệnh sửa chữa (WF-05).`)
  }

  const handleRejectDefect = () => {
    handleOpenNoDefectModal(selectedCase)
  }

  // Yêu cầu đo đạc bổ sung / Bay drone lại (WF-11 / NEEDS_MEASUREMENT)
  const handleOpenRequestSurveyModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setSurveyReason('')
    setSurveyMode('MEASURE_ONLY')
    setSurveyAssignedCrew('Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)')
    setSurveySlaHours(24)
    setIsRequestSurveyModalOpen(true)
  }

  const handleConfirmRequestSurvey = () => {
    if (!surveyReason.trim()) {
      showToast('Lỗi WF-11: Bắt buộc nêu rõ lý do kỹ thuật yêu cầu khảo sát / đo đạc lại!')
      return
    }
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    const targetCode = targetTriageCase ? targetTriageCase.code : selectedCase.code
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('vi-VN')

    setCases((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              status: 'NEED_SURVEY',
              status_label: 'Cần đo đạc',
              survey_assignment: {
                mode: surveyMode,
                reason: surveyReason,
                assigned_crew: surveyAssignedCrew,
                sla_hours: surveySlaHours,
                created_at: nowTime
              },
              pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[LỆNH ĐO ĐẠC WF-11] Hình thức: ${
                surveyMode === 'MEASURE_ONLY' ? 'Đo đạc hiện trường' : 'Bay quét Drone bổ sung'
              }. Đơn vị: ${surveyAssignedCrew}. Hạn SLA: ${surveySlaHours}h. Lý do: ${surveyReason}`
            }
          : c
      )
    )

    // Đồng bộ thêm vào danh sách FieldTasks trong localStorage để Màn hình 15 hiển thị
    try {
      const existingTasksRaw = localStorage.getItem('roadguard_field_tasks')
      const existingTasks = existingTasksRaw ? JSON.parse(existingTasksRaw) : []
      const newTask = {
        id: `FT-${Date.now()}`,
        code: `TASK-${targetCode}`,
        defectId: targetId,
        defectCode: targetCode,
        title: `Đo đạc bổ sung: ${targetTriageCase?.defect_title || selectedCase.defect_title}`,
        mode: surveyMode,
        stationing: targetTriageCase?.stationing || selectedCase.stationing,
        assignedTo: surveyAssignedCrew,
        reason: surveyReason,
        slaHours: surveySlaHours,
        status: 'ASSIGNED',
        createdAt: nowTime
      }
      localStorage.setItem('roadguard_field_tasks', JSON.stringify([newTask, ...existingTasks]))
    } catch (e) {
      console.warn('Could not save field task to localStorage', e)
    }

    setIsRequestSurveyModalOpen(false)
    showToast(
      `Đã phát lệnh đo đạc [WF-11] cho hồ sơ [${targetCode}]: Giao cho "${surveyAssignedCrew}", hạn SLA ${surveySlaHours}h!`
    )
  }

  // Điều phối chuyển sang Fast Track (WF-05): Tự động truyền hồ sơ đang chọn
  const handleNavigateFastTrack = (c?: TriageCase) => {
    const target = c || selectedCase
    navigate(`/pm/fast-track?defectCode=${encodeURIComponent(target.code)}&caseId=${encodeURIComponent(target.id)}`, {
      state: { targetDefect: target }
    })
  }

  // Multi-select for Citizen Reports Table
  const handleToggleSelectReport = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAllReports = () => {
    const currentIds = filteredCases.map((c) => c.id)
    if (selectedReportIds.length === currentIds.length) {
      setSelectedReportIds([])
    } else {
      setSelectedReportIds(currentIds)
    }
  }

  // Link Duplicate Reports Modal (PA04, BR-30, BR-31)
  const handleOpenLinkReportsModal = () => {
    if (selectedReportIds.length < 2) {
      showToast('Vui lòng chọn ít nhất 2 phản ánh để thực hiện liên kết báo trùng (PA04)!')
      return
    }
    setLinkMasterCaseId(selectedReportIds[0])
    setLinkAuditNotes(
      'Liên kết báo trùng: Các phản ánh được ghi nhận cùng một vị trí hư hỏng lân cận, hợp nhất bằng chứng ảnh và mô tả hiện trường.'
    )
    setIsLinkReportsModalOpen(true)
  }

  const handleConfirmLinkReports = () => {
    if (!linkMasterCaseId) {
      showToast('Vui lòng chọn hồ sơ gốc tiếp nhận chính!')
      return
    }
    const master = cases.find((c) => c.id === linkMasterCaseId)
    if (!master) return

    const secondaryIds = selectedReportIds.filter((id) => id !== linkMasterCaseId)
    const secondaryCodes = cases.filter((c) => secondaryIds.includes(c.id)).map((c) => c.code)

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === linkMasterCaseId) {
          const updatedLinkedCodes = Array.from(new Set([...(c.linked_report_ids || []), ...secondaryCodes]))
          return {
            ...c,
            linked_report_ids: updatedLinkedCodes,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[LIÊN KẾT BÁO TRÙNG PA04] Đã gộp hồ sơ từ: ${secondaryCodes.join(', ')}. Ghi chú: ${linkAuditNotes}`
          }
        }
        if (secondaryIds.includes(c.id)) {
          return {
            ...c,
            status: 'MERGED',
            status_label: 'Đã gộp trùng',
            master_case_id: master.id,
            pm_notes: `Đã liên kết báo trùng vào hồ sơ chính ${master.code} (Theo PA04). Ghi chú: ${linkAuditNotes}`
          }
        }
        return c
      })
    )

    // Tự động mở rộng dòng Master Case để thấy ngay danh sách con được gộp bên dưới
    setExpandedMasterIds((prev) => Array.from(new Set([...prev, linkMasterCaseId])))
    setIsLinkReportsModalOpen(false)
    setSelectedReportIds([])
    setSelectedCaseId(linkMasterCaseId)
    showToast(`Đã liên kết thành công ${secondaryIds.length} phản ánh vào hồ sơ chính [${master.code}] (Tuân thủ PA04, BR-30, BR-31)!`)
  }

  // Tách hồ sơ con khỏi hồ sơ Master (Unlink)
  const handleUnlinkReport = (secondaryCaseId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const target = cases.find((c) => c.id === secondaryCaseId)
    if (!target) return

    const masterId = target.master_case_id
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === secondaryCaseId) {
          return {
            ...c,
            status: 'PENDING',
            status_label: 'Chờ xử lý',
            master_case_id: undefined,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[TÁCH HỒ SƠ] Đã tách khỏi hồ sơ gốc, chuyển về hàng đợi độc lập.`
          }
        }
        if (masterId && c.id === masterId) {
          return {
            ...c,
            linked_report_ids: (c.linked_report_ids || []).filter((code) => code !== target.code),
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[TÁCH HỒ SƠ] Đã gỡ bỏ phản ánh ${target.code}.`
          }
        }
        return c
      })
    )
    showToast(`Đã tách phản ánh [${target.code}] thành hồ sơ độc lập!`)
  }

  // Triage Project Assignment Modal (PA03)
  const handleOpenTriageProject = (c: TriageCase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setTargetTriageCase(c)
    setSelectedProjectId(c.project_id || 'prj-ql1a-02')
    setIsTriageProjectModalOpen(true)
  }

  const handleConfirmTriageProject = () => {
    if (!targetTriageCase) return
    const project = mockProjects.find((p) => p.id === selectedProjectId)
    const projectName = project ? project.name : 'Dự án đã chỉ định'

    // Hỗ trợ gán hàng loạt nếu bấm từ Floating Bar
    const targetIds = selectedReportIds.includes(targetTriageCase.id) && selectedReportIds.length > 1
      ? selectedReportIds
      : [targetTriageCase.id]

    setCases((prev) =>
      prev.map((c) => {
        if (targetIds.includes(c.id)) {
          return {
            ...c,
            project_id: selectedProjectId,
            project_name: projectName,
            is_assigned: true,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[ĐIỀU PHỐI DỰ ÁN PA03] Đã tiếp nhận và gán vào dự án: ${projectName}`
          }
        }
        return c
      })
    )

    setIsTriageProjectModalOpen(false)
    setSelectedReportIds([])
    showToast(`Đã điều phối ${targetIds.length} hồ sơ vào dự án "${projectName}" thành công (PA03)!`)
  }

  // NO_DEFECT Conclusion with Mandatory Justification (BR-39)
  const handleOpenNoDefectModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setNoDefectReason('')
    setIsNoDefectModalOpen(true)
  }

  const handleConfirmNoDefect = () => {
    if (!noDefectReason.trim()) {
      showToast('Lỗi BR-39: Bắt buộc nhập lý do giải trình kỹ thuật khi kết luận NO_DEFECT!')
      return
    }
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    setCases((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              status: 'REJECTED',
              status_label: 'Báo sai (No Defect)',
              conclusion: 'NO_DEFECT',
              conclusion_reason: noDefectReason,
              pm_notes: `[NO_DEFECT - BR-39] ${noDefectReason}`
            }
          : c
      )
    )
    setIsNoDefectModalOpen(false)
    showToast(`Đã ghi nhận kết luận NO_DEFECT cho hồ sơ [${targetTriageCase?.code || selectedCase.code}] (Tuân thủ BR-39)!`)
  }

  // OUT_OF_SCOPE Conclusion
  const handleConclusionOutOfScope = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'REJECTED',
              status_label: 'Ngoài phạm vi',
              conclusion: 'OUT_OF_SCOPE',
              conclusion_reason: 'Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.',
              pm_notes: '[OUT_OF_SCOPE] Vị trí nằm ngoài phạm vi bảo hành. Đã chuyển hồ sơ sang cơ quan quản lý đường bộ địa phương.'
            }
          : item
      )
    )
    showToast(`Đã phân loại hồ sơ [${target.code}] là NGOÀI PHẠM VI BẢO HÀNH (OUT_OF_SCOPE).`)
  }

  // Reset conclusion to PENDING for re-evaluating
  const handleResetConclusion = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'PENDING',
              status_label: 'Chờ thẩm định',
              conclusion: null,
              conclusion_reason: undefined
            }
          : item
      )
    )
    showToast(`Đã mở lại trạng thái chờ thẩm định cho hồ sơ [${target.code}].`)
  }

  // Publish Public Result (PA07)
  const handleOpenPublishModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setPublishPublicNote(
      'Đơn vị bảo hành Hoàng Hải đã tiếp nhận và đưa vị trí này vào kế hoạch kiểm tra / sửa chữa. Cảm ơn thông tin phản ánh của Quý công dân.'
    )
    setIsPublishModalOpen(true)
  }

  const handleConfirmPublishResult = () => {
    const target = targetTriageCase || selectedCase
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('vi-VN')
    setCases((prev) =>
      prev.map((c) =>
        c.id === target.id
          ? {
              ...c,
              is_published: true,
              published_at: nowTime,
              public_notice: publishPublicNote
            }
          : c
      )
    )
    showToast(`Đã công bố kết quả tiếp nhận & tiến độ xử lý hồ sơ [${target.code}] lên Ứng dụng Di động Citizen (PA07)!`)
    setIsPublishModalOpen(false)
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
            master_case_id: selectedCase.id,
            pm_notes: `Đã tự động gộp dữ liệu vào hồ sơ chính ${selectedCase.code}`
          }
        }
        if (c.id === selectedCase.id) {
          const updatedDups = (c.cluster_duplicates || []).map((dup) =>
            dupCodes.includes(dup.code) ? { ...dup, selected: false, is_merged: true } : dup
          )
          const updatedLinked = Array.from(new Set([...(c.linked_report_ids || []), ...dupCodes]))
          return {
            ...c,
            linked_report_ids: updatedLinked,
            cluster_duplicates: updatedDups,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[GỘP CỤM SPATIAL] Đã tích hợp bằng chứng từ ${dupCodes.join(', ')}`
          }
        }
        return c
      })
    )
    setExpandedMasterIds((prev) => Array.from(new Set([...prev, selectedCase.id])))
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
          <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate(`${basePath}/dashboard`)}>Trang chủ</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate(`${basePath}/surveys`)}>Khiếm khuyết</span>
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
              {viewSourceMode === 'CITIZEN_TRIAGE'
                ? 'Bảng Tiếp Nhận & Điều Phối Phản Ánh Người Dân (PA03, PA04)'
                : viewSourceMode === 'DRONE_AI'
                ? 'Hộp Thư Tiếp Nhận & Thẩm Định Lỗi Drone AI (AI01-AI08)'
                : 'Hộp Thư Tiếp Nhận Sự Cố & Triage Khiếm Khuyết Hỗn Hợp'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A227]/15 text-[#8F7212] border border-[#C9A227]/30">
              {isSupervisor ? 'Giám sát Triage Hub' : 'PM Triage Hub'}
            </span>
            {unassignedCitizenCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                {unassignedCitizenCount} phản ánh cần điều phối dự án
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              {pendingCount} ca chờ xác minh
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận và điều phối phản ánh người dân (PA03), liên kết báo trùng lặp lân cận (PA04) và phân cấp hư hỏng theo 2 trục Severity × Urgency (SC14).
          </p>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => showToast('Đang xuất danh sách hồ sơ Triage ra file Excel TCVN...')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất danh sách</span>
          </button>
          <button
            onClick={handleOpenLinkReportsModal}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              selectedReportIds.length >= 2
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-400 shadow-sm animate-pulse'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Link2 className="w-4 h-4 text-[#C9A227]" />
            <span>Liên kết báo trùng ({selectedReportIds.length >= 2 ? selectedReportIds.length : 2})</span>
          </button>
          <button
            onClick={() => handleNavigateFastTrack(selectedCase)}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Điều phối Fast Track (WF-05)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Module Switcher: Citizen Triage vs Drone AI vs All */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setViewSourceMode('CITIZEN_TRIAGE')
              setSelectedReportIds([])
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewSourceMode === 'CITIZEN_TRIAGE'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Bảng Tiếp Nhận &amp; Điều Phối Phản Ánh Dân (PA03, PA04)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              viewSourceMode === 'CITIZEN_TRIAGE' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
            }`}>
              {citizenCount}
            </span>
            {unassignedCitizenCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold animate-pulse">
                {unassignedCitizenCount} chưa gán
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setViewSourceMode('DRONE_AI')
              setSelectedReportIds([])
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewSourceMode === 'DRONE_AI'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Hộp Thư Drone AI Quét (AI01-AI08)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              viewSourceMode === 'DRONE_AI' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
            }`}>
              {droneAICount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewSourceMode('ALL')
              setSelectedReportIds([])
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewSourceMode === 'ALL'
                ? 'bg-white text-brand-dark shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Tất cả nguồn</span>
            <span className="text-[10px] opacity-70 font-mono">({cases.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2 flex items-center gap-1.5 self-center">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Quy trình: <strong>Dân báo &rarr; PM Điều phối (PA03) &rarr; Liên kết trùng (PA04) &rarr; Thẩm định (PA05)</strong></span>
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
            {/* Floating Batch Action Bar when items selected */}
            {selectedReportIds.length > 0 && (
              <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg border border-amber-400 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-slate-950 font-bold" />
                  <span className="text-xs font-bold">
                    Đã chọn {selectedReportIds.length} phản ánh hiện trường
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenLinkReportsModal}
                    disabled={selectedReportIds.length < 2}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title={selectedReportIds.length < 2 ? "Chọn từ 2 phản ánh trở lên để liên kết báo trùng" : "Liên kết báo trùng (PA04)"}
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Liên kết báo trùng (Link Reports - PA04)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const first = cases.find((c) => selectedReportIds.includes(c.id))
                      if (first) handleOpenTriageProject(first)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border border-amber-300"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Điều phối vào dự án (PA03)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedReportIds([])}
                    className="px-2.5 py-1.5 rounded-lg text-slate-800 hover:bg-amber-400 text-xs font-semibold cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-brand-dark">
                  {viewSourceMode === 'CITIZEN_TRIAGE'
                    ? 'Bảng Phản Ánh Người Dân & Tuần Đường (Cần Triage & Link)'
                    : viewSourceMode === 'DRONE_AI'
                    ? 'Danh Sách Lỗi Do Drone AI Tự Động Quét Phát Hiện'
                    : 'Toàn Bộ Hồ Sơ Khiếm Khuyết Chờ Phân Loại'}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>Hiển thị {filteredCases.length} / {cases.length} hồ sơ</span>
                  {viewSourceMode === 'CITIZEN_TRIAGE' && (
                    <>
                      <span>•</span>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={collapseMergedRows}
                          onChange={(e) => setCollapseMergedRows(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                        />
                        <span>Gộp báo trùng theo cây (Master-Tree)</span>
                      </label>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={handleResetTriageData}
                        className="text-slate-500 hover:text-brand-dark hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        title="Đặt lại dữ liệu mẫu phản ánh ban đầu"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Đặt lại dữ liệu</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã, người gửi, SĐT, lý trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            {/* View Mode 1: CITIZEN_TRIAGE Dedicated Table */}
            {viewSourceMode === 'CITIZEN_TRIAGE' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={filteredCases.length > 0 && selectedReportIds.length === filteredCases.length}
                          onChange={handleSelectAllReports}
                          className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
                          title="Chọn tất cả"
                        />
                      </th>
                      <th className="py-2.5 px-3">Mã &amp; Kênh Gửi</th>
                      <th className="py-2.5 px-3">Người Báo &amp; SĐT</th>
                      <th className="py-2.5 px-3">Hiện Trường (GPS)</th>
                      <th className="py-2.5 px-3">Lý Trình &amp; Làn</th>
                      <th className="py-2.5 px-3">Dự Án Bảo Hành (PA03)</th>
                      <th className="py-2.5 px-3">Mô Tả / Loại Hư Hại</th>
                      <th className="py-2.5 px-3">Ưu Tiên</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                      <th className="py-2.5 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases
                      .filter((c) => !collapseMergedRows || !c.master_case_id)
                      .map((item) => {
                        const isSelected = item.id === selectedCase.id
                        const isChecked = selectedReportIds.includes(item.id)
                        const isUnassigned = !item.project_id || item.project_id === ''
                        const isMaster = Boolean(item.linked_report_ids && item.linked_report_ids.length > 0)
                        const isExpanded = expandedMasterIds.includes(item.id)
                        const childReports = isMaster
                          ? cases.filter((c) => c.master_case_id === item.id || (item.linked_report_ids && item.linked_report_ids.includes(c.code)))
                          : []

                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              onClick={() => handleSelectCase(item)}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-amber-50/70 border-l-4 border-l-[#C9A227]'
                                  : isChecked
                                  ? 'bg-amber-50/30'
                                  : isMaster
                                  ? 'bg-purple-50/20 hover:bg-purple-50/50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleToggleSelectReport(item.id, e as any)}
                                  className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
                                />
                              </td>

                              {/* Code & Channel */}
                              <td className="py-3 px-3">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-xs text-brand-dark">{item.code}</span>
                                    {isMaster && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                        Master
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    {item.source === 'CITIZEN' ? (
                                      <Smartphone className="w-3 h-3 text-blue-600" />
                                    ) : (
                                      <Car className="w-3 h-3 text-[#C9A227]" />
                                    )}
                                    <span>{item.reporter_channel || item.source_label}</span>
                                  </span>
                                </div>
                              </td>

                              {/* Reporter & Contact */}
                              <td className="py-3 px-3">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-xs text-slate-800">
                                    {item.reporter_name || 'Người dân'}
                                  </span>
                                  {item.reporter_phone && (
                                    <a
                                      href={`tel:${item.reporter_phone}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{item.reporter_phone}</span>
                                    </a>
                                  )}
                                  <span className="text-[10px] text-slate-400 mt-0.5">{item.time_ago}</span>
                                </div>
                              </td>

                              {/* Photo Thumbnail with GPS */}
                              <td className="py-3 px-3">
                                <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group">
                                  <img
                                    src={item.image_url}
                                    alt={item.defect_title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono text-white text-center py-0.2">
                                    GPS OK
                                  </div>
                                </div>
                              </td>

                              {/* Chainage & Lane */}
                              <td className="py-3 px-3">
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded w-fit border border-slate-200">
                                    {item.stationing}
                                  </span>
                                  <span className="text-[11px] text-slate-500 mt-0.5">{item.lane}</span>
                                </div>
                              </td>

                              {/* Project Assignment (PA03) */}
                              <td className="py-3 px-3">
                                {isUnassigned ? (
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenTriageProject(item, e)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors animate-pulse cursor-pointer"
                                    title="Bấm để điều phối gán vào dự án (PA03)"
                                  >
                                    <Building2 className="w-3 h-3 text-amber-700" />
                                    <span>Chưa gán - Điều phối</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-xs text-brand-dark truncate max-w-[140px]" title={item.project_name}>
                                      {item.project_name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenTriageProject(item, e)}
                                      className="text-[10px] text-slate-400 hover:text-slate-700 p-0.5 rounded"
                                      title="Đổi dự án khác"
                                    >
                                      ✎
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Defect Title & Description */}
                              <td className="py-3 px-3 max-w-[210px]">
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-slate-800 truncate" title={item.defect_title}>
                                    {item.defect_title}
                                  </span>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5" title={item.description || item.defect_title}>
                                    {item.description || 'Chưa có mô tả chi tiết'}
                                  </p>
                                  {isMaster && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleExpandMaster(item.id, e)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-bold cursor-pointer transition-colors mt-1 w-fit border border-purple-200"
                                    >
                                      <Link2 className="w-3 h-3 text-purple-700" />
                                      <span>
                                        {isExpanded ? 'Ẩn' : 'Xem'} {item.linked_report_ids?.length} báo cáo đã gộp
                                      </span>
                                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Severity */}
                              <td className="py-3 px-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.severity === 'CRITICAL'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : item.severity === 'HIGH'
                                    ? 'bg-amber-100 text-[#8F7212] border border-amber-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {item.severity}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3">
                                {item.status === 'PENDING' && (
                                  <span className="bg-amber-100 text-[#8F7212] text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200 w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                    <span>Chờ xử lý</span>
                                  </span>
                                )}
                                {item.status === 'VERIFIED' && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200 w-fit">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Đã xác minh</span>
                                  </span>
                                )}
                                {item.status === 'MERGED' && (
                                  <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-purple-200 w-fit">
                                    <Merge className="w-3 h-3 text-purple-600" />
                                    <span>Đã gộp</span>
                                  </span>
                                )}
                                {item.status === 'REJECTED' && (
                                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-slate-200 w-fit">
                                    <X className="w-3 h-3 text-slate-500" />
                                    <span>{item.conclusion === 'NO_DEFECT' ? 'Báo sai' : 'Từ chối'}</span>
                                  </span>
                                )}
                                {item.status === 'NEED_SURVEY' && (
                                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200 w-fit">
                                    <Camera className="w-3 h-3 text-blue-600" />
                                    <span>Cần đo đạc</span>
                                  </span>
                                )}
                              </td>

                              {/* Quick Actions */}
                              <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  {isUnassigned ? (
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenTriageProject(item, e)}
                                      className="px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-[11px] font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                    >
                                      <Building2 className="w-3 h-3" />
                                      <span>Điều phối</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectCase(item)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Thẩm định
                                    </button>
                                  )}
                                  {item.cluster_duplicates && item.cluster_duplicates.length > 0 && !item.cluster_duplicates.every((d) => d.is_merged) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectCase(item)
                                        setIsMergeModalOpen(true)
                                      }}
                                      className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                      title={`Có ${item.cluster_duplicates.length} báo trùng lân cận. Bấm để gộp.`}
                                    >
                                      <Merge className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* NESTED SUB-ROWS: Các báo cáo trùng đã gộp vào Master Case này */}
                            {isMaster && isExpanded && childReports.map((child) => (
                              <tr
                                key={`child-${child.id}`}
                                onClick={() => handleSelectCase(child)}
                                className={`bg-purple-50/50 border-l-4 border-l-purple-500 hover:bg-purple-100/70 transition-colors cursor-pointer ${
                                  child.id === selectedCase.id ? 'ring-2 ring-purple-500 bg-purple-100' : ''
                                }`}
                              >
                                <td className="py-2 px-3 text-center">
                                  <CornerDownRight className="w-4 h-4 text-purple-600 inline" />
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-xs text-purple-950">{child.code}</span>
                                      <span className="text-[9px] font-bold bg-purple-200 text-purple-900 px-1 py-0.2 rounded">
                                        Đã gộp trùng
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-purple-800 mt-0.5">
                                      {child.reporter_channel || child.source_label}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="font-semibold text-xs text-slate-800">{child.reporter_name}</span>
                                  {child.reporter_phone && (
                                    <span className="text-[10px] text-blue-600 block font-mono">{child.reporter_phone}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="relative w-12 h-9 rounded overflow-hidden bg-slate-900 border border-purple-200 shrink-0">
                                    <img src={child.image_url} alt={child.defect_title} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 bg-purple-950/80 text-[7px] text-white text-center">
                                      ĐÃ GỘP
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="font-mono text-[11px] font-bold text-slate-700">{child.stationing}</span>
                                  <span className="text-[10px] text-slate-500 block">{child.lane}</span>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="text-[11px] text-purple-900 italic font-medium">
                                    Theo Master ({item.project_name})
                                  </span>
                                </td>
                                <td className="py-2 px-3 max-w-[210px]">
                                  <span className="font-medium text-xs text-purple-950 truncate block">
                                    {child.defect_title}
                                  </span>
                                  <p className="text-[10px] text-slate-600 italic truncate mt-0.5">
                                    "{child.description}"
                                  </p>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    {child.severity}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="bg-purple-200 text-purple-950 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit border border-purple-300">
                                    <Link2 className="w-3 h-3 text-purple-700" />
                                    <span>Gộp vào {item.code}</span>
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={(e) => handleUnlinkReport(child.id, e)}
                                    className="px-2 py-1 rounded bg-white hover:bg-red-50 text-red-600 hover:border-red-300 border border-slate-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ml-auto shadow-2xs"
                                    title="Tách khỏi Master Case thành hồ sơ riêng"
                                  >
                                    <Unlink className="w-3 h-3 text-red-500" />
                                    <span>Tách riêng</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* View Mode 2: DRONE_AI or ALL (Card Queue View) */
              <div>
                {/* Table Header Row */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg mb-2">
                  <span className="col-span-2">Mã Case</span>
                  <span className="col-span-2">Nguồn Dữ Liệu</span>
                  <span className="col-span-3">Vị Trí &amp; Lý Trình</span>
                  <span className="col-span-2">Loại Hư Hại</span>
                  <span className="col-span-1">Ưu Tiên</span>
                  <span className="col-span-2 text-right">Trạng Thái</span>
                </div>

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
            )}
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
                {selectedCase.master_case_id && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                    Đã gộp trùng
                  </span>
                )}
                {selectedCase.linked_report_ids && selectedCase.linked_report_ids.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                    Master Case ({selectedCase.linked_report_ids.length})
                  </span>
                )}
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

          {/* DYNAMIC DECISION STATUS BANNER (Phản hồi kết quả hành động trực quan) */}
          {selectedCase.master_case_id && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-purple-950 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">HỒ SƠ ĐÃ ĐƯỢC GỘP VÀO MASTER CASE</span>
                  <span className="text-[11px] text-purple-700">Dữ liệu được hợp nhất để không tạo trùng lệnh thi công (BR-30).</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCaseId(selectedCase.master_case_id!)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>Xem Case Gốc</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUnlinkReport(selectedCase.id)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-purple-800 border border-purple-200 text-xs font-semibold rounded-lg cursor-pointer"
                  title="Tách thành hồ sơ riêng"
                >
                  Tách riêng
                </button>
              </div>
            </div>
          )}

          {selectedCase.conclusion === 'DEFECT_FOUND' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">KẾT LUẬN: ĐÃ XÁC MINH CÓ KHIẾM KHUYẾT (DEFECT_FOUND)</span>
                  <span className="text-[11px] text-emerald-700">
                    Mức độ: <strong>{selectedCase.severity}</strong> • Khẩn cấp: <strong>{selectedCase.urgency}</strong> • S: <strong>{selectedCase.area_sqm} m²</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/pm/proposals')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Gom vào gói đề xuất sửa chữa kỹ thuật (Repair Package)"
                >
                  <span>Gom gói sửa chữa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleResetConclusion(selectedCase)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] rounded-lg cursor-pointer"
                  title="Đặt lại để thẩm định lại"
                >
                  Sửa lại
                </button>
              </div>
            </div>
          )}

          {selectedCase.conclusion === 'NO_DEFECT' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between text-red-950 animate-in fade-in">
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs block">KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT (NO_DEFECT - BÁO SAI)</span>
                  <p className="text-[11px] text-red-800 mt-0.5 italic">
                    Lý do kỹ thuật (BR-39): "{selectedCase.conclusion_reason || selectedCase.pm_notes}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleResetConclusion(selectedCase)}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
              >
                Thẩm định lại
              </button>
            </div>
          )}

          {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between text-amber-950 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs block">KẾT LUẬN: NGOÀI PHẠM VI BẢO HÀNH (OUT_OF_SCOPE)</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleResetConclusion(selectedCase)}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
              >
                Thẩm định lại
              </button>
            </div>
          )}

          {selectedCase.status === 'NEED_SURVEY' && (
            <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl space-y-2.5 text-blue-950 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block text-blue-900">
                      LỆNH KHẢO SÁT &amp; ĐO ĐẠC BỔ SUNG (WF-11)
                    </span>
                    <span className="text-[11px] text-blue-700">
                      {selectedCase.survey_assignment
                        ? selectedCase.survey_assignment.mode === 'MEASURE_ONLY'
                          ? '📐 Đo đạc hiện trường bằng thước chuyên dụng (MEASURE_ONLY)'
                          : '🛸 Bay quét Drone chụp bổ sung (DRONE_RESURVEY)'
                        : 'Đã chuyển sang hàng đợi nhiệm vụ khảo sát thực địa.'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/pm/field-tasks?tab=MEASUREMENTS&highlightCode=${encodeURIComponent(selectedCase.code)}`)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Xem nhiệm vụ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedCase.survey_assignment && (
                <div className="p-2.5 bg-white rounded-lg border border-blue-200/80 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Đơn vị nhận việc:</span>
                    <span className="font-bold text-blue-950">{selectedCase.survey_assignment.assigned_crew}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Hạn cam kết SLA:</span>
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full text-[10px]">
                      Trong {selectedCase.survey_assignment.sla_hours} giờ
                    </span>
                  </div>
                  {selectedCase.survey_assignment.reason && (
                    <div className="pt-1.5 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 font-medium block">Lý do yêu cầu:</span>
                      <p className="italic text-slate-800 mt-0.5">"{selectedCase.survey_assignment.reason}"</p>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 text-right pt-0.5">
                    Thời gian giao: {selectedCase.survey_assignment.created_at}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedCase.is_published && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1 text-sky-950 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-sky-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-600" />
                  <span>Đã công bố tiến độ cho người dân (PA07)</span>
                </span>
                <span className="text-[10px] text-sky-600 font-mono">{selectedCase.published_at}</span>
              </div>
              <p className="text-[11px] text-sky-900 italic bg-white p-2 rounded-lg border border-sky-100">
                "{selectedCase.public_notice}"
              </p>
            </div>
          )}

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
            selectedCase.cluster_duplicates.every((d) => d.is_merged) ? (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3.5 shadow-2xs space-y-1.5 text-emerald-950 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã hợp nhất cụm {selectedCase.cluster_duplicates.length} phản ánh lân cận (&lt; 2.5m)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white">
                    Đã gộp
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Đã hợp nhất bằng chứng ảnh và mô tả từ {selectedCase.cluster_duplicates.map((d) => d.code).join(', ')} vào hồ sơ gốc này (BR-30, BR-31).
                </p>
              </div>
            ) : (
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
            )
          )}

          {/* Citizen Reporter Contact & Submission Details (If Citizen or Patrol) */}
          {(selectedCase.reporter_name || selectedCase.description) && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#C9A227]" />
                  <span>Thông Tin Người Phản Ánh</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedCase.reporter_channel || selectedCase.source_label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Họ và tên:</span>
                  <span className="font-semibold text-slate-800">{selectedCase.reporter_name || 'Người dân'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Số điện thoại liên hệ:</span>
                  {selectedCase.reporter_phone ? (
                    <a
                      href={`tel:${selectedCase.reporter_phone}`}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1 font-mono"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{selectedCase.reporter_phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Không cung cấp</span>
                  )}
                </div>
              </div>

              {selectedCase.description && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Nội dung phản ánh từ người dân:</span>
                  <p className="italic text-slate-800 leading-relaxed">"{selectedCase.description}"</p>
                </div>
              )}

              {/* Triage Project Assignment Status (PA03) */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Dự án bảo hành phụ trách (PA03):</span>
                  <span className="font-semibold text-xs text-brand-dark">
                    {selectedCase.project_id ? selectedCase.project_name : '⚠️ Chưa điều phối gán vào dự án'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenTriageProject(selectedCase)}
                  className="px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{selectedCase.project_id ? 'Đổi dự án' : 'Điều phối dự án (PA03)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* DANH SÁCH BÁO CÁO TRÙNG ĐÃ GỘP VÀO MASTER CASE NÀY */}
          {selectedCase.linked_report_ids && selectedCase.linked_report_ids.length > 0 && (
            <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  <span>Các Phản Ánh Trùng Đã Gộp ({selectedCase.linked_report_ids.length})</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 border border-purple-300">
                  Master Case
                </span>
              </div>

              <div className="space-y-2">
                {selectedCase.linked_report_ids.map((code) => {
                  const secondary = cases.find((c) => c.code === code)
                  return (
                    <div key={code} className="p-2.5 bg-white border border-purple-200 rounded-lg flex items-start gap-2.5 text-xs shadow-2xs">
                      {secondary?.image_url && (
                        <img src={secondary.image_url} alt={code} className="w-12 h-10 object-cover rounded-md border border-slate-200 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-purple-950">{code}</span>
                          <span className="text-[10px] text-slate-500">{secondary?.reporter_channel || secondary?.source_label}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
                          {secondary?.reporter_name} • {secondary?.reporter_phone}
                        </p>
                        {secondary?.description && (
                          <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                            "{secondary.description}"
                          </p>
                        )}
                      </div>
                      {secondary && (
                        <button
                          type="button"
                          onClick={() => handleUnlinkReport(secondary.id)}
                          className="text-[10px] text-purple-700 hover:text-red-600 hover:underline p-1 cursor-pointer shrink-0 font-semibold"
                          title="Tách khỏi hồ sơ gốc này"
                        >
                          Tách
                        </button>
                      )}
                    </div>
                  )
                })}
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

            {/* Decision Action Buttons (PA05: DEFECT_FOUND / NO_DEFECT / OUT_OF_SCOPE) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleVerifyDefect(selectedCase)}
                className={`w-full py-2.5 px-4 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  selectedCase.conclusion === 'DEFECT_FOUND'
                    ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
                    : 'bg-[#C9A227] hover:bg-[#B38E1F]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedCase.conclusion === 'DEFECT_FOUND'
                    ? '✓ Đã Xác Minh DEFECT_FOUND (Bấm để cập nhật lại)'
                    : 'Xác minh có khiếm khuyết (DEFECT_FOUND - PA05)'}
                </span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenNoDefectModal(selectedCase)}
                  className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                    selectedCase.conclusion === 'NO_DEFECT'
                      ? 'bg-red-600 text-white border-red-700'
                      : 'bg-white border-slate-200 hover:bg-red-50 text-red-600'
                  }`}
                  title="Không có khiếm khuyết (Bắt buộc lý do giải trình theo BR-39)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{selectedCase.conclusion === 'NO_DEFECT' ? 'Đã báo sai' : 'Không có lỗi (BR-39)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConclusionOutOfScope(selectedCase)}
                  className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                    selectedCase.conclusion === 'OUT_OF_SCOPE'
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-white border-slate-200 hover:bg-amber-50 text-amber-700'
                  }`}
                  title="Ngoài phạm vi bảo hành Hoàng Hải"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{selectedCase.conclusion === 'OUT_OF_SCOPE' ? 'Đã loại trừ' : 'Ngoài phạm vi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenRequestSurveyModal(selectedCase)}
                  className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                    selectedCase.status === 'NEED_SURVEY'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Yêu cầu khảo sát lại hiện trường hoặc bay drone bù (WF-11)"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{selectedCase.status === 'NEED_SURVEY' ? 'Đã giao đo lại' : 'Yêu cầu đo lại'}</span>
                </button>
              </div>

              {/* Public Notice Action (PA07) */}
              <button
                type="button"
                onClick={() => handleOpenPublishModal(selectedCase)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                  selectedCase.is_published
                    ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {selectedCase.is_published
                    ? `📢 Đã công bố tiến độ cho người dân (${selectedCase.published_at || 'Hôm nay'})`
                    : 'Công bố tiến độ cho người dân (PA07)'}
                </span>
              </button>
            </div>

            {/* Compliance Note & Direct Action Links */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Đã đủ điều kiện kích hoạt lệnh thi công sửa chữa cấp bách (WF-05).</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/pm/defects/${selectedCase.id}/verify`)}
                  className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>So sánh đa kỳ & BBox</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateFastTrack(selectedCase)}
                  className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Điều phối Fast Track</span>
                </button>
              </div>
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
                  Sau khi gộp, các hồ sơ phụ sẽ được chuyển sang trạng thái <strong>MERGED (Đã gộp trùng)</strong>, ảnh bằng chứng hiện trường sẽ được đính kèm vào Case gốc, tránh trùng lặp khối lượng kỹ thuật sửa chữa.
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

      {/* MODAL 4: LIÊN KẾT BÁO TRÙNG PHẢN ÁNH (LINK REPORTS - PA04, BR-30, BR-31) */}
      {isLinkReportsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Liên Kết Báo Trùng Phản Ánh (PA04)</h3>
                  <p className="text-xs text-slate-500">Quy chuẩn BR-30, BR-31: Hợp nhất nhiều báo cáo thành 1 Master Case</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkReportsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Pick Master Case */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  1. Chọn Hồ Sơ Tiếp Nhận Chính (Master Case):
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {cases
                    .filter((c) => selectedReportIds.includes(c.id))
                    .map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          linkMasterCaseId === c.id
                            ? 'bg-amber-50 border-[#C9A227] text-brand-dark'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="masterCaseSelect"
                            checked={linkMasterCaseId === c.id}
                            onChange={() => setLinkMasterCaseId(c.id)}
                            className="text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                          />
                          <div>
                            <span className="font-mono font-bold">{c.code}</span>
                            <span className="text-slate-500 ml-2">({c.stationing} - {c.defect_title})</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{c.reporter_name || c.source_label}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Audit justification */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  2. Lý do liên kết &amp; đối chiếu không gian (Audit Log):
                </label>
                <textarea
                  rows={2}
                  value={linkAuditNotes}
                  onChange={(e) => setLinkAuditNotes(e.target.value)}
                  placeholder="Nhập lý do liên kết (ví dụ: các phản ánh cách nhau dưới 2m, cùng phản ánh ổ gà Km 1025+390)..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Các phản ánh vệ tinh sẽ được gắn cờ <strong>MERGED</strong>, toàn bộ ảnh hiện trường và thông tin người dân được giữ nguyên và tổng hợp vào hồ sơ chính, đảm bảo không tạo 2 lệnh sửa chữa cùng 1 lỗi.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLinkReportsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmLinkReports}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Liên Kết {selectedReportIds.length} Báo Cáo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ĐIỀU PHỐI GÁN VÀO DỰ ÁN BẢO HÀNH (TRIAGE CASE - PA03) */}
      {isTriageProjectModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Điều Phối Phản Ánh Vào Dự Án (PA03)</h3>
                  <p className="text-xs text-slate-500">Chỉ định tuyến đường bảo hành chịu trách nhiệm sửa chữa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTriageProjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-brand-dark block">Hồ sơ phản ánh tiếp nhận:</span>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-mono font-bold text-[#8F7212]">{targetTriageCase.code}</span>
                  <span>{targetTriageCase.stationing} ({targetTriageCase.lane})</span>
                </div>
                <p className="text-slate-500 text-[11px] truncate">{targetTriageCase.defect_title}</p>
                <span className="text-[10px] text-slate-400 block">
                  Người báo: {targetTriageCase.reporter_name || targetTriageCase.source_label} ({targetTriageCase.reporter_phone || 'Không có SĐT'})
                </span>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">
                  Chọn tuyến đường / Dự án bảo hành phụ trách: <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-semibold"
                >
                  {mockProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} (Km {p.start_km} &rarr; Km {p.end_km})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Sau khi điều phối, hồ sơ sẽ được gán vào phạm vi quản lý của dự án, sẵn sàng để PM thẩm định chi tiết và lập gói sửa chữa hoặc giao nhiệm vụ khảo sát đo đạc hiện trường.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTriageProjectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmTriageProject}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Điều Phối Dự Án</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: KẾT LUẬN KHÔNG CÓ KHIẾM KHUYẾT (NO_DEFECT - PA05, BR-39) */}
      {isNoDefectModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Kết Luận: Không Có Khiếm Khuyết (NO_DEFECT)</h3>
                  <p className="text-xs text-red-600 font-semibold">Quy chuẩn bất biến BR-39: Bắt buộc giải trình kỹ thuật</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNoDefectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Hồ sơ xem xét từ chối:</span>
                <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code} ({targetTriageCase.stationing})</span>
                <p className="text-slate-500">{targetTriageCase.defect_title}</p>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">
                  Lý do giải trình kỹ thuật từ chối: <span className="text-red-500">* (Bắt buộc theo BR-39)</span>
                </label>
                <textarea
                  rows={3}
                  value={noDefectReason}
                  onChange={(e) => setNoDefectReason(e.target.value)}
                  placeholder="Ghi rõ lý do: ví dụ vết nước đọng bề mặt, bùn đất rác rãnh mép đường, không cấu thành nứt vỡ kết cấu mặt đường bê tông xi măng..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227]"
                  required
                />
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  Lý do này sẽ được ghi vào nhật ký kiểm toán không thể xóa (Audit Trail) và phản hồi lý do chính thức cho người dân trên ứng dụng di động.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNoDefectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmNoDefect}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xác Nhận Kết Luận NO_DEFECT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: CÔNG BỐ TIẾN ĐỘ CHO NGƯỜI DÂN (PUBLISH RESULT - PA07) */}
      {isPublishModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Công Bố Tiến Độ Xử Lý Cho Người Dân (PA07)</h3>
                  <p className="text-xs text-slate-500">Đồng bộ thông báo công khai xuống ứng dụng di động Citizen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Hồ sơ phản ánh:</span>
                <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
                <p className="text-slate-600">{targetTriageCase.stationing} - {targetTriageCase.defect_title}</p>
                <span className="text-[10px] text-slate-400 block">
                  Người gửi: {targetTriageCase.reporter_name || 'Người dân'} ({targetTriageCase.reporter_phone || 'N/A'})
                </span>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">
                  Nội dung thông báo công khai gửi người dân:
                </label>
                <textarea
                  rows={3}
                  value={publishPublicNote}
                  onChange={(e) => setPublishPublicNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmPublishResult}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Công Bố Xuống App Citizen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: LỆNH KHẢO SÁT & ĐO ĐẠC BỔ SUNG HIỆN TRƯỜNG (WF-11 / NEEDS_MEASUREMENT) */}
      {isRequestSurveyModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Lệnh Khảo Sát &amp; Đo Đạc Bổ Sung (WF-11)</h3>
                  <p className="text-xs text-slate-500">Nêu lý do kỹ thuật, chọn hình thức và phân công đơn vị đi đo / bay drone lại</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestSurveyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Defect Info Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {targetTriageCase.source_label}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{targetTriageCase.defect_title}</div>
                <div className="text-slate-500 text-[11px]">
                  Lý trình: <span className="font-medium text-slate-700">{targetTriageCase.stationing} ({targetTriageCase.lane})</span> • Tuyến: <span className="font-medium text-slate-700">{targetTriageCase.project_name}</span>
                </div>
              </div>

              {/* 1. Chọn hình thức khảo sát */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  1. Hình thức khảo sát / đo đạc lại: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      surveyMode === 'MEASURE_ONLY'
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="survey_mode"
                        checked={surveyMode === 'MEASURE_ONLY'}
                        onChange={() => {
                          setSurveyMode('MEASURE_ONLY')
                          setSurveyAssignedCrew('Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)')
                        }}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">📐 Đo đạc hiện trường</span>
                        <span className="text-[10px] text-blue-700 font-semibold uppercase">Chế độ MEASURE_ONLY (BR-09)</span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Kỹ sư/Tổ đội đi thực địa dùng thước đo độ sâu lòng hố (depth) và đo diện tích nứt vỡ chuẩn xác.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      surveyMode === 'DRONE_RESURVEY'
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="survey_mode"
                        checked={surveyMode === 'DRONE_RESURVEY'}
                        onChange={() => {
                          setSurveyMode('DRONE_RESURVEY')
                          setSurveyAssignedCrew('Đội bay Drone Hoàng Hải 01 - Phi công: Lê Minh Khôi')
                        }}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">🛸 Bay Drone bổ sung</span>
                        <span className="text-[10px] text-blue-700 font-semibold uppercase">Chế độ DRONE_RESURVEY</span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Chỉ định phi công bay quét lại ở độ cao thấp hơn hoặc góc chụp xiên do ảnh cũ bị mờ, ngược sáng.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. Lý do kỹ thuật yêu cầu đo lại (Bắt buộc) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    2. Lý do kỹ thuật yêu cầu đo đạc lại: <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Bắt buộc theo chuẩn thẩm định</span>
                </div>

                {/* Quick Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    'Ảnh bị mờ / che khuất tầm nhìn',
                    'Cần đo độ sâu lòng hố (depth)',
                    'Nghi ngờ nứt kết cấu tầng dưới',
                    'Xác định lại chính xác lý trình Km',
                    'Góc chụp xiên không đủ cơ sở tính diện tích'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSurveyReason((prev) => (prev ? `${prev}. ${tag}` : tag))}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer border border-slate-200"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={surveyReason}
                  onChange={(e) => setSurveyReason(e.target.value)}
                  placeholder="Ví dụ: Ảnh người dân gửi góc xiên và bị ngược sáng, cần tổ đội ra đo thước kiểm tra lòng sâu hố sụt và diện tích hư hại thực tế..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              {/* 3. Phân công đơn vị thực hiện */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  3. Phân công đơn vị thực hiện: <span className="text-red-500">*</span>
                </label>
                <select
                  value={surveyAssignedCrew}
                  onChange={(e) => setSurveyAssignedCrew(e.target.value)}
                  className="w-full bg-white border border-slate-200 font-medium text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                >
                  {surveyMode === 'MEASURE_ONLY' ? (
                    <>
                      <option value="Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)">
                        Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035) — Trưởng tổ: Nguyễn Văn Thành
                      </option>
                      <option value="Tổ đo đạc cơ động 02 (Km 1035 - Km 1060)">
                        Tổ đo đạc cơ động 02 (Km 1035 - Km 1060) — Trưởng tổ: Trần Đình Trọng
                      </option>
                      <option value="Đội kỹ thuật phản ứng nhanh số 3">
                        Đội kỹ thuật phản ứng nhanh số 3 — Kỹ sư: Lê Văn Nam
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="Đội bay Drone Hoàng Hải 01 - Phi công: Lê Minh Khôi">
                        Đội bay Drone Hoàng Hải 01 — Phi công: Lê Minh Khôi (DJI Matrice 350 RTK)
                      </option>
                      <option value="Đội bay Khảo sát 02 - Phi công: Hoàng Quốc Tuấn">
                        Đội bay Khảo sát 02 — Phi công: Hoàng Quốc Tuấn (DJI Mavic 3 Enterprise)
                      </option>
                      <option value="Tổ bay cứu nạn khẩn cấp 03 - Phi công: Phạm Anh Dũng">
                        Tổ bay cứu nạn khẩn cấp 03 — Phi công: Phạm Anh Dũng
                      </option>
                    </>
                  )}
                </select>
              </div>

              {/* 4. Cam kết thời hạn SLA */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  4. Cam kết thời hạn hoàn thành (SLA):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 24, label: 'Khẩn cấp (24h)', note: 'Ưu tiên hàng đầu' },
                    { value: 48, label: 'Tiêu chuẩn (48h)', note: 'Theo ca trực chuẩn' },
                    { value: 168, label: 'Định kỳ (7 ngày)', note: 'Đợt khảo sát tuần' }
                  ].map((sla) => (
                    <button
                      key={sla.value}
                      type="button"
                      onClick={() => setSurveySlaHours(sla.value)}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        surveySlaHours === sla.value
                          ? 'bg-amber-50 border-[#C9A227] text-[#8F7212] font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-bold">{sla.label}</span>
                      <span className="block text-[10px] text-slate-400">{sla.note}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestSurveyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRequestSurvey}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Phát Lệnh Khảo Sát / Đo Lại (WF-11)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AIReviewInbox
