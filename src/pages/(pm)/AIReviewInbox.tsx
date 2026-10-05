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

import { ReviewHeader } from './ai-review/ReviewHeader'
import { ReviewFilterBar } from './ai-review/ReviewFilterBar'
import { ReviewCasesTable } from './ai-review/ReviewCasesTable'
import { ReviewDetailDrawer } from './ai-review/ReviewDetailDrawer'
import { ReviewModals } from './ai-review/ReviewModals'

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

      {/* 1. Header & Source Selector */}
      <ReviewHeader
        basePath={basePath}
        isSupervisor={isSupervisor}
        viewSourceMode={viewSourceMode}
        setViewSourceMode={setViewSourceMode}
        cases={cases}
        unassignedCitizenCount={unassignedCitizenCount}
        pendingCount={pendingCount}
        citizenCount={citizenCount}
        droneAICount={droneAICount}
        selectedReportIds={selectedReportIds}
        setSelectedReportIds={setSelectedReportIds}
        selectedCase={selectedCase}
        onOpenLinkReportsModal={handleOpenLinkReportsModal}
        onNavigateFastTrack={handleNavigateFastTrack}
        showToast={showToast}
      />

      {/* 2. Quick Filter Tabs & Search Controls */}
      <ReviewFilterBar
        cases={cases}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        mergedCount={mergedCount}
        surveyCount={surveyCount}
        criticalCount={criticalCount}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        setSearchQuery={setSearchQuery}
        showToast={showToast}
      />

      {/* 3. 2-COLUMN MAIN WORKFLOW (Flexible Master-Detail Layout) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        {/* LEFT COLUMN: Master Triage Queue Table */}
        <ReviewCasesTable
          viewSourceMode={viewSourceMode}
          cases={cases}
          filteredCases={filteredCases}
          selectedCase={selectedCase}
          onSelectCase={handleSelectCase}
          selectedReportIds={selectedReportIds}
          onToggleSelectReport={handleToggleSelectReport}
          onSelectAllReports={handleSelectAllReports}
          collapseMergedRows={collapseMergedRows}
          setCollapseMergedRows={setCollapseMergedRows}
          expandedMasterIds={expandedMasterIds}
          onToggleExpandMaster={handleToggleExpandMaster}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenTriageProject={handleOpenTriageProject}
          onOpenLinkReportsModal={handleOpenLinkReportsModal}
          onUnlinkReport={handleUnlinkReport}
          onOpenMergeModal={(c) => {
            handleSelectCase(c)
            setIsMergeModalOpen(true)
          }}
          onResetTriageData={handleResetTriageData}
          onClearSelectedReports={() => setSelectedReportIds([])}
        />

        {/* RIGHT COLUMN: PM Decision & Technical Triage Panel */}
        <ReviewDetailDrawer
          selectedCase={selectedCase}
          setSelectedCaseId={setSelectedCaseId}
          cases={cases}
          detailViewMode={detailViewMode}
          setDetailViewMode={setDetailViewMode}
          drawerMapContainerRef={drawerMapContainerRef}
          currentSeverity={currentSeverity}
          setCurrentSeverity={setCurrentSeverity}
          currentUrgency={currentUrgency}
          setCurrentUrgency={setCurrentUrgency}
          currentArea={currentArea}
          setCurrentArea={setCurrentArea}
          currentDepth={currentDepth}
          setCurrentDepth={setCurrentDepth}
          currentNotes={currentNotes}
          setCurrentNotes={setCurrentNotes}
          onVerifyDefect={handleVerifyDefect}
          onOpenNoDefectModal={handleOpenNoDefectModal}
          onConclusionOutOfScope={handleConclusionOutOfScope}
          onResetConclusion={handleResetConclusion}
          onOpenRequestSurveyModal={handleOpenRequestSurveyModal}
          onOpenPublishModal={handleOpenPublishModal}
          onNavigateFastTrack={handleNavigateFastTrack}
          onUnlinkReport={handleUnlinkReport}
          onOpenTriageProject={handleOpenTriageProject}
          onOpenGISModal={() => setIsGISModalOpen(true)}
          onOpenPhotoZoomModal={() => setIsPhotoZoomModalOpen(true)}
          onOpenMergeModal={(c) => {
            handleSelectCase(c)
            setIsMergeModalOpen(true)
          }}
          onToggleClusterItem={handleToggleClusterItem}
        />
      </div>

      {/* 4. MODALS HUB */}
      <ReviewModals
        selectedCase={selectedCase}
        targetTriageCase={targetTriageCase}
        cases={cases}
        selectedReportIds={selectedReportIds}
        mockProjects={mockProjects}
        isMergeModalOpen={isMergeModalOpen}
        setIsMergeModalOpen={setIsMergeModalOpen}
        onExecuteMerge={handleExecuteMerge}
        isGISModalOpen={isGISModalOpen}
        setIsGISModalOpen={setIsGISModalOpen}
        modalMapType={modalMapType}
        setModalMapType={setModalMapType}
        modalMapContainerRef={modalMapContainerRef}
        isPhotoZoomModalOpen={isPhotoZoomModalOpen}
        setIsPhotoZoomModalOpen={setIsPhotoZoomModalOpen}
        isLinkReportsModalOpen={isLinkReportsModalOpen}
        setIsLinkReportsModalOpen={setIsLinkReportsModalOpen}
        linkMasterCaseId={linkMasterCaseId}
        setLinkMasterCaseId={setLinkMasterCaseId}
        linkAuditNotes={linkAuditNotes}
        setLinkAuditNotes={setLinkAuditNotes}
        onConfirmLinkReports={handleConfirmLinkReports}
        isTriageProjectModalOpen={isTriageProjectModalOpen}
        setIsTriageProjectModalOpen={setIsTriageProjectModalOpen}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        onConfirmTriageProject={handleConfirmTriageProject}
        isNoDefectModalOpen={isNoDefectModalOpen}
        setIsNoDefectModalOpen={setIsNoDefectModalOpen}
        noDefectReason={noDefectReason}
        setNoDefectReason={setNoDefectReason}
        onConfirmNoDefect={handleConfirmNoDefect}
        isPublishModalOpen={isPublishModalOpen}
        setIsPublishModalOpen={setIsPublishModalOpen}
        publishPublicNote={publishPublicNote}
        setPublishPublicNote={setPublishPublicNote}
        onConfirmPublishResult={handleConfirmPublishResult}
        isRequestSurveyModalOpen={isRequestSurveyModalOpen}
        setIsRequestSurveyModalOpen={setIsRequestSurveyModalOpen}
        surveyMode={surveyMode}
        setSurveyMode={setSurveyMode}
        surveyReason={surveyReason}
        setSurveyReason={setSurveyReason}
        surveyAssignedCrew={surveyAssignedCrew}
        setSurveyAssignedCrew={setSurveyAssignedCrew}
        surveySlaHours={surveySlaHours}
        setSurveySlaHours={setSurveySlaHours}
        onConfirmRequestSurvey={handleConfirmRequestSurvey}
      />
    </div>
  )
}
export default AIReviewInbox
