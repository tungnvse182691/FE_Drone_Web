import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle, setMapLayerVisibility } from '../../utils/maplibre'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { alignmentService } from '../../api/services'
import {
  ChevronRight,
  Upload,
  Send,
  Lock,
  Layers,
  Map as MapIcon,
  Maximize2,
  Plus,
  Minus,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  SplitSquareVertical,
  Edit2,
  Trash2,
  BarChart2,
  ShieldCheck,
  Building,
  User,
  Compass,
  FileCode,
  X,
  FileUp,
  Check,
  Eye,
  Link2,
  FileText,
  Sliders,
  Grid
} from 'lucide-react'

import { AlignmentHeader } from './alignment/AlignmentHeader'
import { AlignmentMap } from './alignment/AlignmentMap'
import { AlignmentSidebar } from './alignment/AlignmentSidebar'
import { AlignmentModals } from './alignment/AlignmentModals'
import { SegmentItem, SlabItem, AssignedProjectOption } from './alignment/types'
export type { SegmentItem, SlabItem, AssignedProjectOption } from './alignment/types'

import { SEGMENT_COLORS, ROUTE_COORDINATES, ROUTE_KM_POINTS, PM_ASSIGNED_PROJECTS } from './alignment/alignmentData'
import {
  interpolateCoordAtKm,
  getSubLineCoordinates,
  checkAndEnrichSegmentsContinuity,
  generateMockSlabs
} from './alignment/alignmentGeometryHelpers'

export { PM_ASSIGNED_PROJECTS } from './alignment/alignmentData'

export const AlignmentSegments: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  // Phân quyền theo tài khoản hiện tại từ layout Header
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  // Lấy dự án từ URL (nếu có: /pm/projects/:id/alignment)
  const { id: urlProjectId } = useParams<{ id?: string }>()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (urlProjectId && PM_ASSIGNED_PROJECTS.some((p) => p.id === urlProjectId)) {
      return urlProjectId
    }
    return PM_ASSIGNED_PROJECTS[0].id
  })

  const activeProject = useMemo(() => {
    return PM_ASSIGNED_PROJECTS.find((p) => p.id === selectedProjectId) || PM_ASSIGNED_PROJECTS[0]
  }, [selectedProjectId])

  // Trạng thái tim tuyến: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED' kết nối qua alignmentService
  const [alignmentStatus, setAlignmentStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'>(() => {
    return alignmentService.getAlignmentState(selectedProjectId).status
  })

  useEffect(() => {
    const state = alignmentService.getAlignmentState(selectedProjectId)
    setAlignmentStatus(state.status)
  }, [selectedProjectId])

  useEffect(() => {
    const handleStateChange = () => {
      const state = alignmentService.getAlignmentState(selectedProjectId)
      setAlignmentStatus(state.status)
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [selectedProjectId])

  // Trạng thái Map View: 'SATELLITE' | 'VECTOR' | 'PLANNING'
  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'VECTOR' | 'PLANNING'>('SATELLITE')

  // Trạng thái các Tab quản lý bên phải: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'
  const [rightTab, setRightTab] = useState<'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'>('SEGMENTS')

  // Trạng thái bật/tắt hiển thị Lưới tấm bê tông & Khe nối (Mép đường, Mã tấm, Khe co, Khe giãn)
  const [showSlabsAndJoints, setShowSlabsAndJoints] = useState<boolean>(true)

  // Cấu hình Kích thước tấm BTXM & Khe co giãn / Khe giãn nở do PM tự chỉnh sửa
  const [slabLengthM, setSlabLengthM] = useState<number>(5.0)
  const [slabThicknessCm, setSlabThicknessCm] = useState<number>(26)
  const [contractionSpacingM, setContractionSpacingM] = useState<number>(5.0)
  const [expansionSpacingM, setExpansionSpacingM] = useState<number>(50.0)
  const [expansionGapMm, setExpansionGapMm] = useState<number>(20)
  const [syncJointWithSlab, setSyncJointWithSlab] = useState<boolean>(true)

  // Phân đoạn đang chọn để highlight trên Map
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>('seg-1')

  // Thông số chia đoạn tự động
  const [splitDistance, setSplitDistance] = useState<number>(5.0)
  const [splitSortOrder, setSplitSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modal chỉnh sửa phân đoạn (Edit Segment)
  const [editingSegment, setEditingSegment] = useState<SegmentItem | null>(null)

  // Modal thêm mới phân đoạn (Add Segment)
  const [isAddSegmentModalOpen, setIsAddSegmentModalOpen] = useState<boolean>(false)
  const [newSegForm, setNewSegForm] = useState({
    code: '',
    startKm: 1020.0,
    endKm: 1025.0,
    roadWidthM: 8.0,
    laneCount: 4,
    surfaceMaterial: 'Mặt BTN C12.5',
    color: SEGMENT_COLORS[0]
  })

  // Modal tách phân đoạn (Split Segment)
  const [splitModalSegment, setSplitModalSegment] = useState<SegmentItem | null>(null)
  const [customSplitKm, setCustomSplitKm] = useState<number>(1022.5)

  // Chế độ đo khoảng cách (Ruler)
  const [rulerActive, setRulerActive] = useState<boolean>(false)
  const [rulerPoints, setRulerPoints] = useState<[number, number][]>([])

  // Modal nạp file GeoJSON / KML / Chuỗi tọa độ thủ công
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [importTab, setImportTab] = useState<'FILE' | 'MANUAL'>('FILE')
  const [manualCoordsText, setManualCoordsText] = useState<string>(
`108.0825, 16.2731
108.1054, 16.2589
108.1287, 16.2415
108.1492, 16.2238
108.1695, 16.2085
108.1884, 16.1843
108.2152, 16.1521
108.2418, 16.1215`
  )
  const [roadWidthM, setRoadWidthM] = useState<number>(8.0)
  const [corridorMarginM, setCorridorMarginM] = useState<number>(2.0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Danh sách tọa độ và mốc km chuẩn của dự án (mặc định theo activeProject)
  const [currentCoords, setCurrentCoords] = useState<[number, number][]>(activeProject.defaultCoords)
  const [currentKmPoints, setCurrentKmPoints] = useState<number[]>(activeProject.defaultKmPoints)
  const [importedFileName, setImportedFileName] = useState<string | null>(null)
  const [importedLengthKm, setImportedLengthKm] = useState<number>(activeProject.lengthKm)

  // Live cursor position
  const [cursorPos, setCursorPos] = useState({
    lng: activeProject.defaultCoords[0][0],
    lat: activeProject.defaultCoords[0][1],
    station: activeProject.stationOriginText.split(' ')[0],
    elevation: '+14.2m'
  })

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Danh sách Phân đoạn chuẩn theo thiết kế (Bổ sung RoadWidthProfile v2.2)
  const [segments, setSegments] = useState<SegmentItem[]>(activeProject.defaultSegments)

  // Danh sách tấm Slab
  const [slabs, setSlabs] = useState<SlabItem[]>(generateMockSlabs(activeProject.defaultSegments.length))

  // Chuyển đổi dự án PM phụ trách
  const handleSwitchProject = (prjId: string) => {
    const target = PM_ASSIGNED_PROJECTS.find((p) => p.id === prjId)
    if (!target) return
    setSelectedProjectId(prjId)
    setCurrentCoords(target.defaultCoords)
    setCurrentKmPoints(target.defaultKmPoints)
    setImportedLengthKm(target.lengthKm)
    setImportedFileName(null)
    setManualCoordsText(target.defaultManualText)
    const validated = checkAndEnrichSegmentsContinuity(target.defaultSegments)
    setSegments(validated)
    setSlabs(generateMockSlabs(validated.length))
    setSelectedSegmentId(validated[0]?.id || null)
    setNewSegForm({
      code: '',
      startKm: target.stationOriginKm,
      endKm: target.stationOriginKm + 5.0,
      roadWidthM: 8.0,
      laneCount: 4,
      surfaceMaterial: 'Mặt BTN C12.5',
      color: SEGMENT_COLORS[0]
    })
    showToast(`Đã chuyển sang dự án [${target.code}] ${target.name}`)
    if (mapRef.current && target.defaultCoords.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      target.defaultCoords.forEach((c) => bounds.extend(c))
      mapRef.current.fitBounds(bounds, { padding: 60, speed: 1.1 })
    }
  }

  // Tự động chuyển đổi nếu có id trên URL (/pm/projects/:id/alignment)
  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      handleSwitchProject(urlProjectId)
    }
  }, [urlProjectId])

  // MapLibre references
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)

  // 1. Khởi tạo bản đồ MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(mapLayer === 'VECTOR' ? 'STREETS' : 'SATELLITE'),
      center: [108.1651, 16.2052], // Khu vực Huế - Đà Nẵng
      zoom: 11.2,
      minZoom: 4,
      maxZoom: 20, // Zoom tối đa 20 sát tận mặt đường, ảnh vệ tinh sắc nét tuyệt đối
      maxPitch: 60,
      pitch: 32,
      bearing: -18
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    // Live mouse coordinate tracker
    map.on('mousemove', (e: maplibregl.MapMouseEvent) => {
      const lng = parseFloat(e.lngLat.lng.toFixed(4))
      const lat = parseFloat(e.lngLat.lat.toFixed(4))
      const t = Math.min(Math.max((lng - 108.0825) / (108.2418 - 108.0825), 0), 1)
      const approxKm = 1020 + t * 25
      const kmMain = Math.floor(approxKm)
      const meters = Math.round((approxKm - kmMain) * 1000)

      setCursorPos({
        lng,
        lat,
        station: `Km ${kmMain}+${String(meters).padStart(3, '0')}`,
        elevation: `+${(12 + t * 8).toFixed(1)}m`
      })
    })

    // Click handler for ruler & feature selection
    map.on('click', (e: maplibregl.MapMouseEvent) => {
      if (rulerActive) {
        setRulerPoints((prev) => {
          const next = [...prev, [e.lngLat.lng, e.lngLat.lat] as [number, number]]
          if (next.length === 2) {
            const dLng = next[1][0] - next[0][0]
            const dLat = next[1][1] - next[0][1]
            const distKm = Math.sqrt(dLng * dLng + dLat * dLat) * 111
            showToast(`Thước đo: Cự ly ${distKm >= 1 ? `${distKm.toFixed(2)} km` : `${(distKm * 1000).toFixed(0)} m`}`)
            return []
          }
          return next
        })
      }
    })

    map.on('load', () => {
      // 0. Thêm GeoJSON Source cho bề mặt dải mặt đường (Polygon - co giãn đúng theo kích thước mét roadWidthM thực tế)
      if (!map.getSource('segments-surface-source')) {
        map.addSource('segments-surface-source', {
          type: 'geojson',
          data: buildSegmentsSurfaceGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId)
        })
      }

      // 1. Thêm GeoJSON Source cho tim tuyến các phân đoạn (LineString)
      if (!map.getSource('segments-source')) {
        map.addSource('segments-source', {
          type: 'geojson',
          data: buildSegmentsGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId)
        })
      }

      // 2. Thêm GeoJSON Source cho hành lang quy hoạch 30m (Planning corridor)
      if (!map.getSource('planning-corridor-source')) {
        map.addSource('planning-corridor-source', {
          type: 'geojson',
          data: buildPlanningCorridorGeoJSON(currentCoords)
        })
      }

      // 2b. Thêm GeoJSON Sources cho Lưới tấm bê tông (Slabs), Khe co giãn, Khe giãn nở & Nhãn 2 mép đường
      const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
        segments,
        currentCoords,
        currentKmPoints
      )

      if (!map.getSource('slabs-source')) {
        map.addSource('slabs-source', {
          type: 'geojson',
          data: slabsGeoJSON
        })
      }

      if (!map.getSource('joints-source')) {
        map.addSource('joints-source', {
          type: 'geojson',
          data: jointsGeoJSON
        })
      }

      if (!map.getSource('edges-source')) {
        map.addSource('edges-source', {
          type: 'geojson',
          data: edgesGeoJSON
        })
      }

      // 3. Layers: Hành lang quy hoạch (Ẩn mặc định, bật khi chọn tab Planning)
      if (!map.getLayer('planning-corridor-layer')) {
        map.addLayer({
          id: 'planning-corridor-layer',
          type: 'fill',
          source: 'planning-corridor-source',
          layout: { visibility: 'none' },
          paint: {
            'fill-color': '#F59E0B',
            'fill-opacity': 0.18,
            'fill-outline-color': '#D97706'
          }
        })
      }

      // 4. Layers: Bề mặt dải thảm mặt đường (Polygon co giãn thực tế theo kích thước mét roadWidthM)
      if (!map.getLayer('segments-surface-layer')) {
        map.addLayer({
          id: 'segments-surface-layer',
          type: 'fill',
          source: 'segments-surface-source',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['case', ['get', 'isSelected'], 0.92, 0.78]
          }
        })
      }

      // 5. Layers: Viền mép mặt đường (Outer Curbs / Edges)
      if (!map.getLayer('segments-surface-edge-layer')) {
        map.addLayer({
          id: 'segments-surface-edge-layer',
          type: 'line',
          source: 'segments-surface-source',
          paint: {
            'line-color': ['case', ['get', 'isSelected'], '#FBBF24', '#0F172A'],
            'line-width': ['case', ['get', 'isSelected'], 2.5, 1.2],
            'line-opacity': 0.85
          }
        })
      }

      // 6. Layers: Viền bóng tim tuyến phân đoạn
      if (!map.getLayer('segments-casing-layer')) {
        map.addLayer({
          id: 'segments-casing-layer',
          type: 'line',
          source: 'segments-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#0F172A',
            'line-width': [
              'interpolate',
              ['exponential', 1.5],
              ['zoom'],
              6, 3,
              9, 5,
              11, 7,
              14, 10,
              16, 14,
              18, 20,
              20, 28
            ],
            'line-opacity': 0.95
          }
        })
      }

      // 7. Layers: Vạch đứt tim đường (Luôn nằm trên cùng, nổi bật sắc nét)
      if (!map.getLayer('segments-dash-layer')) {
        map.addLayer({
          id: 'segments-dash-layer',
          type: 'line',
          source: 'segments-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#FFFFFF',
            'line-width': [
              'interpolate',
              ['exponential', 1.5],
              ['zoom'],
              6, 1,
              11, 1.8,
              14, 2.5,
              16, 4,
              18, 6,
              20, 8
            ],
            'line-dasharray': [3, 2],
            'line-opacity': 0.98
          }
        })
      }

      // 7a. Lớp bóng viền lưới tấm bê tông (Slab Grid Casing Shadow)
      if (!map.getLayer('slabs-outline-shadow')) {
        map.addLayer({
          id: 'slabs-outline-shadow',
          type: 'line',
          source: 'slabs-source',
          paint: {
            'line-color': '#0F172A',
            'line-width': 2.2,
            'line-opacity': 0.75
          }
        })
      }

      // 7b. Lưới phân chia từng tấm bê tông (Slab Grid Mesh - đường trắng sắc nét)
      if (!map.getLayer('slabs-outline-layer')) {
        map.addLayer({
          id: 'slabs-outline-layer',
          type: 'line',
          source: 'slabs-source',
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 1.0,
            'line-opacity': 0.8
          }
        })
      }

      // 7c. Khe co giãn (Contraction Joints - mỗi 5m, vạch cắt ngang màu Cyan nổi bật)
      if (!map.getLayer('joints-contraction-layer')) {
        map.addLayer({
          id: 'joints-contraction-layer',
          type: 'line',
          source: 'joints-source',
          filter: ['!', ['get', 'isExpansion']],
          paint: {
            'line-color': '#38BDF8',
            'line-width': 2.2,
            'line-opacity': 0.95
          }
        })
      }

      // 7d. Khe giãn nở (Expansion Joints - mỗi 50m, vạch đỏ cam đậm 5px biểu thị đệm 20mm)
      if (!map.getLayer('joints-expansion-layer')) {
        map.addLayer({
          id: 'joints-expansion-layer',
          type: 'line',
          source: 'joints-source',
          filter: ['get', 'isExpansion'],
          paint: {
            'line-color': '#EF4444',
            'line-width': 5.0,
            'line-opacity': 1.0
          }
        })
      }

      // 7e. Đoạn thẳng gióng kích thước ngang 2 mép đường (Dimension Line)
      if (!map.getLayer('edges-dimension-line-layer')) {
        map.addLayer({
          id: 'edges-dimension-line-layer',
          type: 'line',
          source: 'edges-source',
          filter: ['==', ['get', 'isDimensionLine'], true],
          paint: {
            'line-color': '#10B981',
            'line-width': 2.0,
            'line-dasharray': [2, 1.5]
          }
        })
      }

      // 7f. Nhãn mã tấm bê tông (SLAB-001L, SLAB-001R...)
      if (!map.getLayer('slabs-label-layer')) {
        map.addLayer({
          id: 'slabs-label-layer',
          type: 'symbol',
          source: 'slabs-source',
          minzoom: 13.5,
          layout: {
            'text-field': ['get', 'code'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 9,
              16, 11,
              18, 13
            ],
            'text-allow-overlap': false
          },
          paint: {
            'text-color': '#FFFFFF',
            'text-halo-color': '#0F172A',
            'text-halo-width': 2.5
          }
        })
      }

      // 7g. Nhãn Khe giãn nở (⚡ Khe giãn 20mm)
      if (!map.getLayer('joints-expansion-label-layer')) {
        map.addLayer({
          id: 'joints-expansion-label-layer',
          type: 'symbol',
          source: 'joints-source',
          filter: ['get', 'isExpansion'],
          minzoom: 12.0,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 11,
            'text-offset': [0, -1.2],
            'text-allow-overlap': true,
            'text-ignore-placement': true
          },
          paint: {
            'text-color': '#F59E0B',
            'text-halo-color': '#0F172A',
            'text-halo-width': 2.5
          }
        })
      }

      // 7h. Nhãn thông số 2 mép đường & tổng bề rộng W (Mép Trái: -X.Xm, Mép Phải: +X.Xm)
      if (!map.getLayer('edges-label-layer')) {
        map.addLayer({
          id: 'edges-label-layer',
          type: 'symbol',
          source: 'edges-source',
          filter: ['!=', ['get', 'isDimensionLine'], true],
          minzoom: 11.5,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 11,
            'text-allow-overlap': true,
            'text-ignore-placement': true
          },
          paint: {
            'text-color': [
              'case',
              ['==', ['get', 'side'], 'LEFT'], '#38BDF8',
              ['==', ['get', 'side'], 'RIGHT'], '#FBBF24',
              '#34D399'
            ],
            'text-halo-color': '#0F172A',
            'text-halo-width': 3.0
          }
        })
      }

      // 8. Click vào mặt đường hoặc tim tuyến trên map để chọn
      const handleFeatureClick = (e: maplibregl.MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0) return
        const segId = e.features[0].properties?.id
        const segCode = e.features[0].properties?.code
        const segStart = e.features[0].properties?.startKm
        const segEnd = e.features[0].properties?.endKm
        const segLen = e.features[0].properties?.lengthKm
        const segWidth = e.features[0].properties?.roadWidthM || 8.0
        const halfWidth = (Number(segWidth) / 2).toFixed(1)

        if (segId) {
          setSelectedSegmentId(segId)
          if (popupRef.current) popupRef.current.remove()
          popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2.5 text-xs font-sans min-w-[240px]">
                <div class="font-bold text-slate-900 border-b border-slate-200 pb-1">${segCode}</div>
                <div class="text-[#8F7212] font-mono font-semibold mt-1">Km ${Number(segStart).toFixed(3)} - Km ${Number(segEnd).toFixed(3)} (Dài: ${Number(segLen).toFixed(1)} km)</div>
                <div class="mt-2 space-y-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                  <div class="font-bold text-slate-900">🛣️ Thông số 2 mép đường:</div>
                  <div class="flex items-center justify-between font-mono">
                    <span class="text-sky-600 font-bold">Mép Trái: -${halfWidth}m</span>
                    <span class="text-slate-400">|</span>
                    <span class="text-amber-600 font-bold">Mép Phải: +${halfWidth}m</span>
                  </div>
                  <div class="text-slate-600 pt-1 border-t border-slate-200/60">Tổng bề rộng (W): <strong>${Number(segWidth).toFixed(1)}m</strong></div>
                </div>
                <div class="mt-2 text-[11px] text-slate-500">
                  🧱 <strong>Lưới tấm BTXM:</strong> 5.0m × ${halfWidth}m • Khe co 5m • Khe giãn 50m
                </div>
              </div>
            `)
            .addTo(map)
        }
      }

      // Click vào tấm bê tông hoặc khe giãn nở để xem popup kỹ thuật
      map.on('click', 'slabs-outline-layer', (e) => {
        if (!e.features || e.features.length === 0) return
        const p = e.features[0].properties
        if (!p) return

        if (popupRef.current) popupRef.current.remove()
        popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-2.5 text-xs font-sans min-w-[220px]">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span class="font-bold text-slate-900 text-sm">🧱 ${p.code}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  p.status === 'GOOD' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }">${p.status === 'GOOD' ? 'Đạt chuẩn' : 'Cần theo dõi'}</span>
              </div>
              <div class="mt-2 space-y-1 text-slate-600">
                <div>📍 <strong>Lý trình:</strong> <span class="font-mono">${p.station}</span> (${p.lane})</div>
                <div>📐 <strong>Kích thước tấm:</strong> <span class="font-mono font-bold text-slate-800">${p.lengthM}m × ${p.widthM}m × 26cm</span></div>
                <div>🛣️ <strong>Cự ly mép đường:</strong> <span class="font-mono text-[#8F7212] font-semibold">${p.edgeOffset}</span></div>
                <div>⚡ <strong>Khe co kề bên:</strong> <span class="font-mono text-slate-700 font-semibold">Khoảng cách 5.0m (Dowel bar phi 25)</span></div>
              </div>
            </div>
          `)
          .addTo(map)
      })

      map.on('click', 'joints-expansion-layer', (e) => {
        if (!e.features || e.features.length === 0) return
        const p = e.features[0].properties
        if (!p) return

        if (popupRef.current) popupRef.current.remove()
        popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-2.5 text-xs font-sans min-w-[230px]">
              <div class="font-bold text-amber-600 flex items-center gap-1 border-b border-amber-200 pb-1">
                <span>⚡ ${p.name}</span>
              </div>
              <div class="mt-2 space-y-1 text-slate-600">
                <div>📍 <strong>Vị trí:</strong> <span class="font-mono font-bold text-slate-800">${p.station}</span></div>
                <div>📏 <strong>Độ mở khe giãn nở:</strong> <span class="font-mono font-bold text-amber-700">20 mm (±2mm)</span></div>
                <div>🛡️ <strong>Cấu tạo kỹ thuật:</strong> ${p.description}</div>
                <div>🛣️ <strong>Bề rộng mặt đường tại khe:</strong> <span class="font-mono font-semibold">${p.roadWidthM}m</span></div>
              </div>
            </div>
          `)
          .addTo(map)
      })

      map.on('click', 'segments-surface-layer', handleFeatureClick)
      map.on('click', 'segments-dash-layer', handleFeatureClick)

      // Con trỏ pointer khi hover qua dải mặt đường hoặc tim tuyến
      map.on('mouseenter', 'segments-surface-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'segments-surface-layer', () => {
        map.getCanvas().style.cursor = ''
      })
      map.on('mouseenter', 'slabs-outline-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'slabs-outline-layer', () => {
        map.getCanvas().style.cursor = ''
      })
      map.on('mouseenter', 'joints-expansion-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'joints-expansion-layer', () => {
        map.getCanvas().style.cursor = ''
      })

      // Render các mốc lý trình ban đầu
      renderMarkers(map, segments, currentCoords, currentKmPoints)
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      map.remove()
    }
  }, [])

  // Render các Marker lý trình các phân đoạn
  const renderMarkers = (
    map: maplibregl.Map,
    segList: SegmentItem[],
    coords: [number, number][],
    kmPts: number[]
  ) => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // 1. Marker các đầu phân đoạn với lý trình chuẩn Việt Nam (Km 1020+000)
    segList.forEach((seg) => {
      const coord = interpolateCoordAtKm(seg.startKm, coords, kmPts)
      const floorKm = Math.floor(seg.startKm)
      const remainderMeters = Math.round((seg.startKm - floorKm) * 1000)
      const stationText = remainderMeters > 0 ? `Km ${floorKm}+${String(remainderMeters).padStart(3, '0')}` : `Km ${floorKm}`

      const el = document.createElement('div')
      el.className = 'flex flex-col items-center cursor-pointer group'
      el.innerHTML = `
        <div style="background-color: ${seg.color}; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);" 
             class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold transition-transform group-hover:scale-125">
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold shadow-md whitespace-nowrap">
          ${stationText}
        </div>
      `
      el.addEventListener('click', () => {
        setSelectedSegmentId(seg.id)
        showToast(`Đã chọn ${seg.code} (${stationText})`)
      })

      const marker = new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map)
      markersRef.current.push(marker)
    })

    // Marker điểm cuối tuyến (tự động tính theo cự ly thực tế)
    const endCoord = coords[coords.length - 1]
    const endKm = kmPts[kmPts.length - 1] || 1045
    const endKmFloor = Math.floor(endKm)
    const endKmRemainder = Math.round((endKm - endKmFloor) * 1000)
    const endStationText = endKmRemainder > 0 ? `Km ${endKmFloor}+${String(endKmRemainder).padStart(3, '0')}` : `Km ${endKmFloor}`

    const endEl = document.createElement('div')
    endEl.className = 'flex flex-col items-center'
    endEl.innerHTML = `
      <div style="background-color: #C9A227; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);" 
           class="w-4 h-4 rounded-full"></div>
      <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold shadow-md whitespace-nowrap">
        ${endStationText}
      </div>
    `
    const endMarker = new maplibregl.Marker({ element: endEl }).setLngLat(endCoord).addTo(map)
    markersRef.current.push(endMarker)
  }

  // Helper build GeoJSON FeatureCollection cho Segments
  function buildSegmentsGeoJSON(
    segList: SegmentItem[],
    coords: [number, number][],
    kmPts: number[],
    activeSegId: string | null
  ): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = segList.map((seg, idx) => {
      const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)

      return {
        type: 'Feature',
        properties: {
          id: seg.id,
          code: seg.code,
          startKm: seg.startKm,
          endKm: seg.endKm,
          lengthKm: seg.lengthKm,
          roadWidthM: seg.roadWidthM || 8.0,
          color: seg.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length] || '#0284C7',
          isSelected: activeSegId === 'ALL' ? true : seg.id === activeSegId
        },
        geometry: {
          type: 'LineString',
          coordinates: lineCoords
        }
      }
    })

    return {
      type: 'FeatureCollection',
      features
    }
  }

  // Helper tính toán đa giác dải mặt đường (Road Ribbon Polygon) với kỹ thuật Bo chuyển tiếp (Tapering S-curve & Miter Bisector Join)
  function generateRoadRibbonPolygon(
    coords: [number, number][],
    widthM: number,
    prevWidthM?: number,
    nextWidthM?: number,
    prevPoint?: [number, number],
    nextPoint?: [number, number]
  ): [number, number][] {
    if (!coords || coords.length < 2) return []

    const currentW = Math.max(1.5, Math.min(60.0, widthM || 8.0))
    const latMid = coords[0][1]
    const metersPerDegLat = 111320
    const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

    // 1. Tính cự ly tích lũy dọc theo tim tuyến của phân đoạn
    const cumDists: number[] = [0]
    for (let i = 0; i < coords.length - 1; i++) {
      const dx = (coords[i + 1][0] - coords[i][0]) * metersPerDegLng
      const dy = (coords[i + 1][1] - coords[i][1]) * metersPerDegLat
      cumDists.push(cumDists[i] + (Math.sqrt(dx * dx + dy * dy) || 0.001))
    }
    const totalLenM = cumDists[cumDists.length - 1]
    if (totalLenM <= 0.2) return []

    // 2. Xác định các vùng vuốt nối chuyển tiếp (Taper Transition)
    // Đoạn to hơn sẽ vuốt nối mềm mại (taper S-curve) về bằng bề rộng của đoạn hẹp hơn tại điểm tiếp giáp
    const needTaperStart =
      prevWidthM !== undefined &&
      Math.abs(prevWidthM - currentW) > 0.1 &&
      currentW > prevWidthM

    const needTaperEnd =
      nextWidthM !== undefined &&
      Math.abs(nextWidthM - currentW) > 0.1 &&
      currentW > nextWidthM

    const maxTaperDist = Math.min(30.0, totalLenM * 0.35)
    const taperStartDist = needTaperStart ? maxTaperDist : 0
    const taperEndDist = needTaperEnd ? maxTaperDist : 0

    // 3. Hàm nội suy tọa độ [lng, lat] theo cự ly mét
    const interpolateCoord = (targetD: number): [number, number] => {
      if (targetD <= 0) return coords[0]
      if (targetD >= totalLenM) return coords[coords.length - 1]
      for (let i = 0; i < cumDists.length - 1; i++) {
        if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
          const span = cumDists[i + 1] - cumDists[i]
          if (span <= 1e-6) return coords[i]
          const t = (targetD - cumDists[i]) / span
          const lng = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
          const lat = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
          return [Number(lng.toFixed(7)), Number(lat.toFixed(7))]
        }
      }
      return coords[coords.length - 1]
    }

    // 4. Sinh các mốc khoảng cách (milestones) dày dặn tại vùng vuốt nối để đường cong bo tròn mượt mà
    const milestones: number[] = [...cumDists]

    if (needTaperStart && taperStartDist > 2.0) {
      const fractions = [0.15, 0.35, 0.55, 0.75, 0.90]
      fractions.forEach((f) => {
        const d = taperStartDist * f
        if (d > 0.5 && d < taperStartDist - 0.5) milestones.push(d)
      })
    }

    if (needTaperEnd && taperEndDist > 2.0) {
      const fractions = [0.15, 0.35, 0.55, 0.75, 0.90]
      fractions.forEach((f) => {
        const d = totalLenM - taperEndDist * f
        if (d > totalLenM - taperEndDist + 0.5 && d < totalLenM - 0.5) milestones.push(d)
      })
    }

    milestones.sort((a, b) => a - b)
    const uniqueDists: number[] = [milestones[0]]
    for (let i = 1; i < milestones.length; i++) {
      if (milestones[i] - uniqueDists[uniqueDists.length - 1] > 0.25) {
        uniqueDists.push(milestones[i])
      }
    }

    const denseCoords: [number, number][] = uniqueDists.map((d) => interpolateCoord(d))
    const K = denseCoords.length

    // 5. Tính toán vector pháp tuyến phân giác (Miter Bisector Normal) & bề rộng tại từng điểm
    const leftCoords: [number, number][] = []
    const rightCoords: [number, number][] = []

    for (let j = 0; j < K; j++) {
      const s = uniqueDists[j]
      const pt = denseCoords[j]

      // Bề rộng w theo hàm Hermite S-curve bo cong
      let w = currentW
      if (needTaperStart && s < taperStartDist) {
        const t = Math.max(0, Math.min(1, s / taperStartDist))
        const smoothFactor = t * t * (3 - 2 * t)
        w = prevWidthM! + (currentW - prevWidthM!) * smoothFactor
      } else if (needTaperEnd && s > totalLenM - taperEndDist) {
        const t = Math.max(0, Math.min(1, (totalLenM - s) / taperEndDist))
        const smoothFactor = t * t * (3 - 2 * t)
        w = nextWidthM! + (currentW - nextWidthM!) * smoothFactor
      }

      // Xác định vector tới v_in và vector đi v_out
      let vinX = 0, vinY = 0, voutX = 0, voutY = 0

      if (j === 0) {
        if (prevPoint) {
          vinX = (pt[0] - prevPoint[0]) * metersPerDegLng
          vinY = (pt[1] - prevPoint[1]) * metersPerDegLat
        } else {
          vinX = (denseCoords[1][0] - pt[0]) * metersPerDegLng
          vinY = (denseCoords[1][1] - pt[1]) * metersPerDegLat
        }
        voutX = (denseCoords[1][0] - pt[0]) * metersPerDegLng
        voutY = (denseCoords[1][1] - pt[1]) * metersPerDegLat
      } else if (j === K - 1) {
        vinX = (pt[0] - denseCoords[j - 1][0]) * metersPerDegLng
        vinY = (pt[1] - denseCoords[j - 1][1]) * metersPerDegLat
        if (nextPoint) {
          voutX = (nextPoint[0] - pt[0]) * metersPerDegLng
          voutY = (nextPoint[1] - pt[1]) * metersPerDegLat
        } else {
          voutX = vinX
          voutY = vinY
        }
      } else {
        vinX = (pt[0] - denseCoords[j - 1][0]) * metersPerDegLng
        vinY = (pt[1] - denseCoords[j - 1][1]) * metersPerDegLat
        voutX = (denseCoords[j + 1][0] - pt[0]) * metersPerDegLng
        voutY = (denseCoords[j + 1][1] - pt[1]) * metersPerDegLat
      }

      const lenIn = Math.sqrt(vinX * vinX + vinY * vinY) || 1
      const lenOut = Math.sqrt(voutX * voutX + voutY * voutY) || 1
      const uInX = vinX / lenIn, uInY = vinY / lenIn
      const uOutX = voutX / lenOut, uOutY = voutY / lenOut

      // Vector phân giác
      const tanX = uInX + uOutX
      const tanY = uInY + uOutY
      const tanLen = Math.sqrt(tanX * tanX + tanY * tanY)

      let normX = -uOutY
      let normY = uOutX
      let miterScale = 1.0

      if (tanLen > 1e-4) {
        const tNormX = tanX / tanLen
        const tNormY = tanY / tanLen
        normX = -tNormY
        normY = tNormX

        const cosHalf = normX * (-uOutY) + normY * uOutX
        if (cosHalf > 0.4) {
          miterScale = Math.min(1.35, 1.0 / cosHalf)
        }
      }

      const halfW = (w / 2.0) * miterScale
      const offLng = (normX * halfW) / metersPerDegLng
      const offLat = (normY * halfW) / metersPerDegLat

      leftCoords.push([
        Number((pt[0] + offLng).toFixed(7)),
        Number((pt[1] + offLat).toFixed(7))
      ])
      rightCoords.push([
        Number((pt[0] - offLng).toFixed(7)),
        Number((pt[1] - offLat).toFixed(7))
      ])
    }

    // Khép kín vòng đa giác: mép trái xuôi chiều, mép phải ngược chiều, khép lại đỉnh đầu
    return [...leftCoords, ...rightCoords.reverse(), leftCoords[0]]
  }

  // Helper sinh GeoJSON bề mặt thảm đường cho từng phân đoạn theo đúng bề rộng mét roadWidthM & bo tiếp giáp
  function buildSegmentsSurfaceGeoJSON(
    segList: SegmentItem[],
    coords: [number, number][],
    kmPts: number[],
    activeSegId: string | null
  ): GeoJSON.FeatureCollection {
    const minKm = kmPts[0] || 1020
    const maxKm = kmPts[kmPts.length - 1] || 1045

    const features: GeoJSON.Feature[] = segList.map((seg, idx) => {
      const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)

      // Tìm phân đoạn liền trước và liền sau (nếu tiếp giáp trong vòng 5 mét)
      const prevSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.endKm - seg.startKm) < 0.005)
      const nextSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.startKm - seg.endKm) < 0.005)

      // Tọa độ điểm trước và sau dọc theo tim tuyến chuẩn để tính góc phân giác tiếp giáp
      const prevPt = seg.startKm > minKm ? interpolateCoordAtKm(Math.max(minKm, seg.startKm - 0.02), coords, kmPts) : undefined
      const nextPt = seg.endKm < maxKm ? interpolateCoordAtKm(Math.min(maxKm, seg.endKm + 0.02), coords, kmPts) : undefined

      const ribbonPolygon = generateRoadRibbonPolygon(
        lineCoords,
        seg.roadWidthM || 8.0,
        prevSeg ? (prevSeg.roadWidthM || 8.0) : undefined,
        nextSeg ? (nextSeg.roadWidthM || 8.0) : undefined,
        prevPt,
        nextPt
      )

      return {
        type: 'Feature',
        properties: {
          id: seg.id,
          code: seg.code,
          startKm: seg.startKm,
          endKm: seg.endKm,
          lengthKm: seg.lengthKm,
          roadWidthM: seg.roadWidthM || 8.0,
          color: seg.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length] || '#0284C7',
          isSelected: activeSegId === 'ALL' ? true : seg.id === activeSegId
        },
        geometry: {
          type: 'Polygon',
          coordinates: [ribbonPolygon]
        }
      }
    })

    return {
      type: 'FeatureCollection',
      features
    }
  }

  // Helper sinh GeoJSON Lưới tấm bê tông (Slabs), Khe co giãn, Khe giãn nở & Nhãn 2 mép đường
  function buildSlabsAndJointsGeoJSON(
    segList: SegmentItem[],
    coords: [number, number][],
    kmPts: number[],
    customCfg?: {
      slabLenM?: number
      thicknessCm?: number
      contractionSpacingM?: number
      expansionSpacingM?: number
      expansionGapMm?: number
    }
  ): {
    slabsGeoJSON: GeoJSON.FeatureCollection
    jointsGeoJSON: GeoJSON.FeatureCollection
    edgesGeoJSON: GeoJSON.FeatureCollection
  } {
    const activeSlabLen = Math.max(1.0, customCfg?.slabLenM ?? slabLengthM)
    const activeThick = Math.max(10, customCfg?.thicknessCm ?? slabThicknessCm)
    const activeContraction = Math.max(1.0, customCfg?.contractionSpacingM ?? contractionSpacingM)
    const activeExpansion = Math.max(5.0, customCfg?.expansionSpacingM ?? expansionSpacingM)
    const activeGap = Math.max(5, customCfg?.expansionGapMm ?? expansionGapMm)

    const slabFeatures: GeoJSON.Feature[] = []
    const jointFeatures: GeoJSON.Feature[] = []
    const edgeFeatures: GeoJSON.Feature[] = []

    let globalSlabIndex = 1

    segList.forEach((seg, segIdx) => {
      const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)
      if (!lineCoords || lineCoords.length < 2) return

      const latMid = lineCoords[0][1]
      const metersPerDegLat = 111320
      const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

      const cumDists: number[] = [0]
      for (let i = 0; i < lineCoords.length - 1; i++) {
        const dx = (lineCoords[i + 1][0] - lineCoords[i][0]) * metersPerDegLng
        const dy = (lineCoords[i + 1][1] - lineCoords[i][1]) * metersPerDegLat
        cumDists.push(cumDists[i] + (Math.sqrt(dx * dx + dy * dy) || 0.001))
      }
      const totalLenM = cumDists[cumDists.length - 1]
      if (totalLenM <= 0.5) return

      const interpolateCoord = (targetD: number): [number, number] => {
        if (targetD <= 0) return lineCoords[0]
        if (targetD >= totalLenM) return lineCoords[lineCoords.length - 1]
        for (let i = 0; i < cumDists.length - 1; i++) {
          if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
            const span = cumDists[i + 1] - cumDists[i]
            if (span <= 1e-6) return lineCoords[i]
            const t = (targetD - cumDists[i]) / span
            const lng = lineCoords[i][0] + t * (lineCoords[i + 1][0] - lineCoords[i][0])
            const lat = lineCoords[i][1] + t * (lineCoords[i + 1][1] - lineCoords[i][1])
            return [Number(lng.toFixed(7)), Number(lat.toFixed(7))]
          }
        }
        return lineCoords[lineCoords.length - 1]
      }

      const prevSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.endKm - seg.startKm) < 0.005)
      const nextSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.startKm - seg.endKm) < 0.005)
      const currentW = Math.max(2.0, Math.min(60.0, seg.roadWidthM || 8.0))
      const prevW = prevSeg ? (prevSeg.roadWidthM || 8.0) : currentW
      const nextW = nextSeg ? (nextSeg.roadWidthM || 8.0) : currentW

      const maxTaperDist = Math.min(30.0, totalLenM * 0.35)
      const needTaperStart = currentW > prevW
      const needTaperEnd = currentW > nextW

      const getWidthAtDist = (s: number): number => {
        if (needTaperStart && s < maxTaperDist) {
          const t = Math.max(0, Math.min(1, s / maxTaperDist))
          return prevW + (currentW - prevW) * (t * t * (3 - 2 * t))
        }
        if (needTaperEnd && s > totalLenM - maxTaperDist) {
          const t = Math.max(0, Math.min(1, (totalLenM - s) / maxTaperDist))
          return nextW + (currentW - nextW) * (t * t * (3 - 2 * t))
        }
        return currentW
      }

      const getNormalAtDist = (s: number): [number, number] => {
        const delta = 1.0
        const p1 = interpolateCoord(Math.max(0, s - delta))
        const p2 = interpolateCoord(Math.min(totalLenM, s + delta))
        const dx = (p2[0] - p1[0]) * metersPerDegLng
        const dy = (p2[1] - p1[1]) * metersPerDegLat
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        return [-dy / len, dx / len]
      }

      // Chiều dài mỗi tấm bê tông do PM cấu hình (mặc định 5.0m)
      const slabLenM = activeSlabLen
      // Đảm bảo phủ kín toàn bộ phân đoạn (lên đến 400 bước)
      const maxSteps = Math.min(400, Math.floor(totalLenM / slabLenM))
      // Tỷ lệ bước cho khe giãn nở nhiệt (ví dụ 50m / 5m = mỗi 10 bước)
      const expRatio = Math.max(1, Math.round(activeExpansion / slabLenM))

      for (let i = 0; i < maxSteps; i++) {
        const d0 = i * slabLenM
        const d1 = Math.min(totalLenM, (i + 1) * slabLenM)

        const c0 = interpolateCoord(d0)
        const c1 = interpolateCoord(d1)

        const w0 = getWidthAtDist(d0)
        const w1 = getWidthAtDist(d1)

        const norm0 = getNormalAtDist(d0)
        const norm1 = getNormalAtDist(d1)

        const h0 = w0 / 2.0
        const h1 = w1 / 2.0

        const left0: [number, number] = [
          Number((c0[0] + (norm0[0] * h0) / metersPerDegLng).toFixed(7)),
          Number((c0[1] + (norm0[1] * h0) / metersPerDegLat).toFixed(7))
        ]
        const right0: [number, number] = [
          Number((c0[0] - (norm0[0] * h0) / metersPerDegLng).toFixed(7)),
          Number((c0[1] - (norm0[1] * h0) / metersPerDegLat).toFixed(7))
        ]

        const left1: [number, number] = [
          Number((c1[0] + (norm1[0] * h1) / metersPerDegLng).toFixed(7)),
          Number((c1[1] + (norm1[1] * h1) / metersPerDegLat).toFixed(7))
        ]
        const right1: [number, number] = [
          Number((c1[0] - (norm1[0] * h1) / metersPerDegLng).toFixed(7)),
          Number((c1[1] - (norm1[1] * h1) / metersPerDegLat).toFixed(7))
        ]

        const slabNum = String(globalSlabIndex).padStart(3, '0')
        const kmStation = (seg.startKm + d0 / 1000).toFixed(3)

        // 1. Tấm bê tông Làn Trái
        slabFeatures.push({
          type: 'Feature',
          properties: {
            id: `SLAB-${slabNum}L`,
            code: `SLAB-${slabNum}L`,
            lane: 'Làn Trái',
            segmentCode: seg.code,
            station: `Km ${kmStation}`,
            lengthM: Number(slabLenM.toFixed(1)),
            widthM: Number(h0.toFixed(1)),
            thicknessCm: activeThick,
            edgeOffset: `Mép Trái: -${h0.toFixed(1)}m`,
            status: i % 11 === 0 ? 'CRACKED' : i % 17 === 0 ? 'SETTLEMENT' : 'GOOD'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[left0, c0, c1, left1, left0]]
          }
        })

        // 2. Tấm bê tông Làn Phải
        slabFeatures.push({
          type: 'Feature',
          properties: {
            id: `SLAB-${slabNum}R`,
            code: `SLAB-${slabNum}R`,
            lane: 'Làn Phải',
            segmentCode: seg.code,
            station: `Km ${kmStation}`,
            lengthM: Number(slabLenM.toFixed(1)),
            widthM: Number(h0.toFixed(1)),
            thicknessCm: activeThick,
            edgeOffset: `Mép Phải: +${h0.toFixed(1)}m`,
            status: i % 13 === 0 ? 'CRACKED' : 'GOOD'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[c0, right0, right1, c1, c0]]
          }
        })

        globalSlabIndex++

        // 3. Khe nối cắt ngang mặt đường tại d0
        const isExpansion = i % expRatio === 0
        jointFeatures.push({
          type: 'Feature',
          properties: {
            id: isExpansion ? `EJ-${segIdx + 1}-${Math.floor(i / expRatio) + 1}` : `CJ-${segIdx + 1}-${i + 1}`,
            isExpansion,
            name: isExpansion ? `Khe giãn nở nhiệt ${activeGap}mm (Expansion Joint)` : `Khe co giãn ${activeContraction}m (Contraction Joint)`,
            label: isExpansion ? `⚡ Khe giãn ${activeGap}mm` : `Khe co ${activeContraction}m`,
            station: `Km ${kmStation}`,
            roadWidthM: Number(w0.toFixed(1)),
            description: isExpansion
              ? `Khe giãn nở nhiệt ${activeGap}mm, cự ly ${activeExpansion}m, đệm bitum cao su đàn hồi & thanh truyền lực trượt bọc ống nhựa PVC`
              : `Khe co ngót ${activeContraction}m, cắt sâu 5cm, chèn mastic & thanh truyền lực dowel bar phi 25`
          },
          geometry: {
            type: 'LineString',
            coordinates: [left0, right0]
          }
        })

        // 4. Nhãn thông số 2 mép đường & đường gióng kích thước (xuất hiện mỗi 50m và ở điểm bắt đầu)
        if (isExpansion || i === 0 || i === 4) {
          // Đoạn thẳng gióng kích thước ngang qua 2 mép đường
          edgeFeatures.push({
            type: 'Feature',
            properties: {
              isDimensionLine: true,
              label: `W = ${w0.toFixed(1)}m`
            },
            geometry: {
              type: 'LineString',
              coordinates: [left0, right0]
            }
          })

          // Nhãn Mép Trái (-W/2 m)
          edgeFeatures.push({
            type: 'Feature',
            properties: {
              side: 'LEFT',
              label: `Mép Trái: -${h0.toFixed(1)}m`,
              widthM: Number(h0.toFixed(1))
            },
            geometry: {
              type: 'Point',
              coordinates: left0
            }
          })

          // Nhãn Mép Phải (+W/2 m)
          edgeFeatures.push({
            type: 'Feature',
            properties: {
              side: 'RIGHT',
              label: `Mép Phải: +${h0.toFixed(1)}m`,
              widthM: Number(h0.toFixed(1))
            },
            geometry: {
              type: 'Point',
              coordinates: right0
            }
          })

          // Nhãn Tổng Bề Rộng tại tim đường (Center Dimension Callout)
          if (isExpansion || i === 0) {
            edgeFeatures.push({
              type: 'Feature',
              properties: {
                side: 'CENTER',
                label: `Bề rộng W = ${w0.toFixed(1)}m (Trái -${h0.toFixed(1)}m | Phải +${h0.toFixed(1)}m)`,
                widthM: Number(w0.toFixed(1))
              },
              geometry: {
                type: 'Point',
                coordinates: c0
              }
            })
          }
        }
      }
    })

    return {
      slabsGeoJSON: { type: 'FeatureCollection', features: slabFeatures },
      jointsGeoJSON: { type: 'FeatureCollection', features: jointFeatures },
      edgesGeoJSON: { type: 'FeatureCollection', features: edgeFeatures }
    }
  }

  // Cập nhật đồng bộ tức thời (0 delay) lên tất cả các lớp MapLibre
  const syncMapDataDirect = (
    updatedSegs: SegmentItem[],
    selId: string | null = selectedSegmentId,
    coords: [number, number][] = currentCoords,
    kmPts: number[] = currentKmPoints,
    customCfg?: {
      slabLenM?: number
      thicknessCm?: number
      contractionSpacingM?: number
      expansionSpacingM?: number
      expansionGapMm?: number
    }
  ) => {
    if (!mapRef.current) return
    const map = mapRef.current
    try {
      const surfSrc = map.getSource('segments-surface-source') as maplibregl.GeoJSONSource
      if (surfSrc) {
        surfSrc.setData(buildSegmentsSurfaceGeoJSON(updatedSegs, coords, kmPts, selId))
      }
      const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSrc) {
        segSrc.setData(buildSegmentsGeoJSON(updatedSegs, coords, kmPts, selId))
      }
      const planSrc = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
      if (planSrc) {
        planSrc.setData(buildPlanningCorridorGeoJSON(coords))
      }

      // Cập nhật nguồn dữ liệu Lưới tấm, Khe co giãn, Khe giãn nở & 2 Mép đường
      const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
        updatedSegs,
        coords,
        kmPts,
        customCfg
      )
      const slabsSrc = map.getSource('slabs-source') as maplibregl.GeoJSONSource
      if (slabsSrc) slabsSrc.setData(slabsGeoJSON)

      const jointsSrc = map.getSource('joints-source') as maplibregl.GeoJSONSource
      if (jointsSrc) jointsSrc.setData(jointsGeoJSON)

      const edgesSrc = map.getSource('edges-source') as maplibregl.GeoJSONSource
      if (edgesSrc) edgesSrc.setData(edgesGeoJSON)

      renderMarkers(map, updatedSegs, coords, kmPts)
      map.triggerRepaint()
    } catch (err) {
      console.warn('syncMapDataDirect warning:', err)
    }
  }

  // 2. Đồng bộ GeoJSON và Markers mỗi khi segments, selection, tọa độ hoặc thông số tấm/khe thay đổi
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    const activeCfg = {
      slabLenM: slabLengthM,
      thicknessCm: slabThicknessCm,
      contractionSpacingM: contractionSpacingM,
      expansionSpacingM: expansionSpacingM,
      expansionGapMm: expansionGapMm
    }

    // Cập nhật ngay lập tức nếu source đã sẵn sàng
    syncMapDataDirect(segments, selectedSegmentId, currentCoords, currentKmPoints, activeCfg)

    // Đề phòng trường hợp map đang trong giai đoạn khởi tạo load style ban đầu
    if (!map.isStyleLoaded()) {
      const onInit = () => syncMapDataDirect(segments, selectedSegmentId, currentCoords, currentKmPoints, activeCfg)
      map.once('load', onInit)
      map.once('styledata', onInit)
    }
  }, [
    segments,
    selectedSegmentId,
    currentCoords,
    currentKmPoints,
    slabLengthM,
    slabThicknessCm,
    contractionSpacingM,
    expansionSpacingM,
    expansionGapMm
  ])

  // 3. Chuyển đổi lớp bản đồ (Vệ tinh / Vector / Quy hoạch)
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (!map.isStyleLoaded()) return

    // Bật/tắt giữa ảnh vệ tinh và bản đồ vector OSM
    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty(
        'satellite-layer',
        'visibility',
        mapLayer === 'SATELLITE' || mapLayer === 'PLANNING' ? 'visible' : 'none'
      )
    }

    if (map.getLayer('osm-layer')) {
      map.setLayoutProperty(
        'osm-layer',
        'visibility',
        mapLayer === 'VECTOR' ? 'visible' : 'none'
      )
    }

    // Toggle planning corridor layer
    if (map.getLayer('planning-corridor-layer')) {
      map.setLayoutProperty(
        'planning-corridor-layer',
        'visibility',
        mapLayer === 'PLANNING' ? 'visible' : 'none'
      )
    }
  }, [mapLayer])

  // 3b. Bật/tắt hiển thị Lưới tấm bê tông & Khe nối (Mép đường, Mã tấm, Khe co, Khe giãn)
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (!map.isStyleLoaded()) return

    const slabLayers = [
      'slabs-outline-shadow',
      'slabs-outline-layer',
      'slabs-label-layer',
      'joints-contraction-layer',
      'joints-expansion-layer',
      'joints-expansion-label-layer',
      'edges-dimension-line-layer',
      'edges-label-layer'
    ]

    slabLayers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', showSlabsAndJoints ? 'visible' : 'none')
      }
    })
  }, [showSlabsAndJoints])

  // Helper build GeoJSON cho Hành lang quy hoạch (Margin mở rộng mỗi bên)
  function buildPlanningCorridorGeoJSON(coords: [number, number][], marginM: number = corridorMarginM): GeoJSON.FeatureCollection {
    const offset = 0.00015 * (marginM / 2.0)
    const topCoords = coords.map((c) => [c[0] + offset, c[1] + offset] as [number, number])
    const bottomCoords = [...coords].reverse().map((c) => [c[0] - offset, c[1] - offset] as [number, number])
    const polygon = [...topCoords, ...bottomCoords, topCoords[0]]

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: `Hành lang an toàn quy hoạch (Margin ±${marginM}m)` },
          geometry: {
            type: 'Polygon',
            coordinates: [polygon]
          }
        }
      ]
    }
  }

  // Tương tác: ÁP DỤNG CHIA ĐOẠN TỰ ĐỘNG (Phản ánh trực tiếp lên Map và List)
  const handleApplyAutoSplit = () => {
    const totalKm = importedLengthKm || (currentKmPoints[currentKmPoints.length - 1] - currentKmPoints[0]) || 25.0
    const startBaseKm = currentKmPoints[0] || 1020.0
    const dist = Math.max(0.01, Math.min(splitDistance, totalKm))

    const newSegments: SegmentItem[] = []
    let currentKm = startBaseKm
    let idx = 1

    while (currentKm < startBaseKm + totalKm - 0.001) {
      const nextKm = Math.min(currentKm + dist, startBaseKm + totalKm)
      const len = parseFloat((nextKm - currentKm).toFixed(3))

      newSegments.push({
        id: `seg-${idx}`,
        code: `Phân đoạn #${String(idx).padStart(2, '0')}`,
        startKm: parseFloat(currentKm.toFixed(3)),
        endKm: parseFloat(nextKm.toFixed(3)),
        lengthKm: len,
        roadWidthM: roadWidthM || 8.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: idx % 2 === 0 ? 'Mặt BTN C19' : 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[(idx - 1) % SEGMENT_COLORS.length]
      })

      currentKm = nextKm
      idx++
    }

    if (splitSortOrder === 'desc') {
      newSegments.reverse()
    }

    const validated = checkAndEnrichSegmentsContinuity(newSegments)
    setSegments(validated)
    setSlabs(generateMockSlabs(validated.length))
    setSelectedSegmentId(validated[0]?.id || null)

    // Cập nhật ngay lập tức lên MapLibre 0ms delay
    syncMapDataDirect(validated, validated[0]?.id || null)

    const distText = dist >= 1 ? `${dist.toFixed(2)} km` : `${(dist * 1000).toFixed(0)} m`
    showToast(`Đã chia tuyến thành ${validated.length} phân đoạn (${distText}/đoạn). Tuyến đường hiển thị liên tục chuẩn thiết kế!`)
    handleFitBounds()
  }

  // Chỉnh sửa phân đoạn (Lưu form Edit)
  const handleSaveEditedSegment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSegment) return

    const start = parseFloat(Number(editingSegment.startKm).toFixed(3))
    const end = parseFloat(Number(editingSegment.endKm).toFixed(3))

    if (isNaN(start) || isNaN(end) || start >= end) {
      showToast('Lỗi: Lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const updatedLength = parseFloat((end - start).toFixed(3))
    const updated: SegmentItem = {
      ...editingSegment,
      startKm: start,
      endKm: end,
      lengthKm: updatedLength,
      roadWidthM: Number(editingSegment.roadWidthM) || 8.0
    }

    const updatedList = segments.map((s) => (s.id === updated.id ? updated : s)).sort((a, b) => a.startKm - b.startKm)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)

    // Cập nhật ngay lập tức lên MapLibre 0ms delay
    syncMapDataDirect(validated, updated.id)

    const hasGap = validated.find((s: SegmentItem) => s.id === updated.id)?.hasGap
    if (hasGap) {
      showToast(`Đã lưu ${updated.code}! Lưu ý: Phát hiện khoảng hở/chồng lấn với phân đoạn kề bên (GAP_WARNING). Bấm 'Nối tiếp giáp' để khép kín!`)
    } else {
      showToast(`Đã lưu cập nhật ${updated.code} (Km ${start.toFixed(3)} - Km ${end.toFixed(3)})`)
    }
    setEditingSegment(null)
  }

  // Thêm phân đoạn mới thủ công
  const handleCreateNewSegment = (e: React.FormEvent) => {
    e.preventDefault()
    const start = parseFloat(Number(newSegForm.startKm).toFixed(3))
    const end = parseFloat(Number(newSegForm.endKm).toFixed(3))

    if (isNaN(start) || isNaN(end) || start >= end) {
      showToast('Lỗi: Lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const newSeg: SegmentItem = {
      id: `seg-${Date.now()}`,
      code: newSegForm.code || `Phân đoạn #${String(segments.length + 1).padStart(2, '0')}`,
      startKm: start,
      endKm: end,
      lengthKm: parseFloat((end - start).toFixed(3)),
      roadWidthM: Number(newSegForm.roadWidthM) || 8.0,
      status: 'VALID',
      statusText: 'HỢP LỆ (Valid)',
      laneCount: newSegForm.laneCount || 4,
      surfaceMaterial: newSegForm.surfaceMaterial || 'Mặt BTN C12.5',
      color: newSegForm.color || SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length]
    }

    const updatedList = [...segments, newSeg].sort((a, b) => a.startKm - b.startKm)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    setSelectedSegmentId(newSeg.id)

    // Cập nhật ngay lập tức lên MapLibre 0ms delay
    syncMapDataDirect(validated, newSeg.id)

    setIsAddSegmentModalOpen(false)
    showToast(`Đã thêm mới ${newSeg.code} (${newSeg.lengthKm} km) vào tim tuyến!`)
  }

  // Tách 1 phân đoạn làm 2 đoạn tại mốc Km chỉ định
  const handleSplitSegmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!splitModalSegment) return

    const splitKm = parseFloat(Number(customSplitKm).toFixed(3))
    if (splitKm <= splitModalSegment.startKm || splitKm >= splitModalSegment.endKm) {
      showToast(`Điểm tách phải nằm giữa Km ${splitModalSegment.startKm.toFixed(3)} và Km ${splitModalSegment.endKm.toFixed(3)}!`)
      return
    }

    const segIndex = segments.findIndex((s) => s.id === splitModalSegment.id)
    if (segIndex === -1) return

    const segA: SegmentItem = {
      ...splitModalSegment,
      id: `seg-${Date.now()}-A`,
      code: `${splitModalSegment.code}A`,
      startKm: splitModalSegment.startKm,
      endKm: splitKm,
      lengthKm: parseFloat((splitKm - splitModalSegment.startKm).toFixed(3)),
      roadWidthM: splitModalSegment.roadWidthM || 8.0,
      color: splitModalSegment.color
    }

    const segB: SegmentItem = {
      ...splitModalSegment,
      id: `seg-${Date.now()}-B`,
      code: `${splitModalSegment.code}B`,
      startKm: splitKm,
      endKm: splitModalSegment.endKm,
      lengthKm: parseFloat((splitModalSegment.endKm - splitKm).toFixed(3)),
      roadWidthM: splitModalSegment.roadWidthM || 8.0,
      color: SEGMENT_COLORS[(segIndex + 1) % SEGMENT_COLORS.length]
    }

    const updatedList = [
      ...segments.slice(0, segIndex),
      segA,
      segB,
      ...segments.slice(segIndex + 1)
    ]

    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    setSelectedSegmentId(segA.id)

    // Cập nhật ngay lập tức lên MapLibre 0ms delay
    syncMapDataDirect(validated, segA.id)

    setSplitModalSegment(null)
    showToast(`Đã tách ${splitModalSegment.code} thành 2 đoạn tại Km ${splitKm.toFixed(3)}!`)
  }

  // Xóa phân đoạn
  const handleDeleteSegment = (segId: string) => {
    if (segments.length <= 1) {
      showToast('Tuyến đường phải có ít nhất 1 phân đoạn!')
      return
    }

    const updatedList = segments.filter((s) => s.id !== segId)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    const nextSelId = selectedSegmentId === segId ? validated[0]?.id || null : selectedSegmentId
    setSelectedSegmentId(nextSelId)

    // Cập nhật ngay lập tức lên MapLibre 0ms delay
    syncMapDataDirect(validated, nextSelId)

    showToast('Đã xóa phân đoạn khỏi danh sách tuyến!')
  }

  // Cập nhật bề rộng mặt đường (RoadWidthProfile - v2.2) cho một phân đoạn cụ thể
  const handleUpdateSegmentWidth = (segId: string, widthM: number) => {
    const val = Math.max(1.0, Math.min(60.0, widthM))
    const updated = segments.map((s) => (s.id === segId ? { ...s, roadWidthM: val } : s))
    setSegments(updated)

    // Cập nhật ngay lập tức lên MapLibre 0ms delay (không cần reload/chuyển style)
    syncMapDataDirect(updated, selectedSegmentId)
  }

  // Xử lý nối tiếp giáp (Snap / Khép kín khoảng hở theo quy tắc v2.2: WF-02.F04, US-38-AC-02)
  const handleSnapSegment = (segId: string) => {
    const idx = segments.findIndex((s) => s.id === segId)
    if (idx <= 0) return

    const prevSeg = segments[idx - 1]
    const curSeg = segments[idx]

    // Nối tiếp giáp: đặt startKm của phân đoạn này bằng endKm của phân đoạn liền trước
    const newStart = prevSeg.endKm
    const newLen = parseFloat((curSeg.endKm - newStart).toFixed(3))

    if (newLen <= 0) {
      showToast('Lỗi: Không thể nối vì lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const updated = segments.map((s) =>
      s.id === segId
        ? {
            ...s,
            startKm: newStart,
            lengthKm: newLen
          }
        : s
    )

    const validated = checkAndEnrichSegmentsContinuity(updated)
    setSegments(validated)

    // Cập nhật ngay lập tức lên MapLibre 0ms delay
    syncMapDataDirect(validated, curSeg.id)

    showToast(`Đã nối tiếp giáp khép kín tại Km ${newStart.toFixed(3)} giữa ${prevSeg.code} và ${curSeg.code}!`)
  }

  // Tính khoảng cách Haversine giữa 2 tọa độ GPS (km)
  function calculateHaversineKm(c1: [number, number], c2: [number, number]): number {
    const R = 6371
    const dLat = ((c2[1] - c1[1]) * Math.PI) / 180
    const dLon = ((c2[0] - c1[0]) * Math.PI) / 180
    const lat1 = (c1[1] * Math.PI) / 180
    const lat2 = (c2[1] * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // Xử lý nạp và trích xuất dữ liệu từ tệp GeoJSON (.geojson, .json)
  const processGeoJSONFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)
        let rawCoords: [number, number][] = []

        // Trích xuất thông minh từ GeoJSON (đặc biệt hỗ trợ xuất từ CAD Civil 3D / RoadGuard CAD Parser)
        if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
          // 1. Tìm Feature là TIM TUYẾN CHÍNH (Centerline / Alignment / Tim tuyến)
          let targetFeature = parsed.features.find((f: any) => {
            const type = (f.properties?.type || '').toLowerCase()
            const layer = (f.properties?.layer || '').toLowerCase()
            const name = (f.properties?.name || '').toLowerCase()
            return (
              type === 'centerline' ||
              layer.includes('tim') ||
              layer.includes('center') ||
              layer.includes('alignment') ||
              name.includes('tim') ||
              name.includes('center') ||
              name.includes('tuyến chính')
            )
          })

          // 2. Nếu không có nhãn layer tim tuyến, chọn LineString dài nhất (tránh nối gộp mép đường trái/phải song song)
          if (!targetFeature) {
            const lineFeatures = parsed.features.filter(
              (f: any) =>
                (f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString') &&
                Array.isArray(f.geometry?.coordinates) &&
                f.geometry.coordinates.length >= 2
            )
            if (lineFeatures.length > 0) {
              targetFeature = lineFeatures.reduce((prev: any, curr: any) => {
                const prevLen = prev.geometry?.coordinates?.length || 0
                const currLen = curr.geometry?.coordinates?.length || 0
                return currLen > prevLen ? curr : prev
              })
            }
          }

          if (targetFeature && targetFeature.geometry) {
            const geom = targetFeature.geometry
            if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
              rawCoords = geom.coordinates.map((pt: any) => [Number(pt[0]), Number(pt[1])])
            } else if (geom.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
              rawCoords = geom.coordinates.flat(1).map((pt: any) => [Number(pt[0]), Number(pt[1])])
            }
          }
        } else if (parsed.type === 'Feature') {
          const geom = parsed.geometry
          if (geom?.type === 'LineString' && Array.isArray(geom.coordinates)) {
            rawCoords = geom.coordinates.map((pt: any) => [Number(pt[0]), Number(pt[1])])
          } else if (geom?.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
            rawCoords = geom.coordinates.flat(1).map((pt: any) => [Number(pt[0]), Number(pt[1])])
          }
        } else if (parsed.type?.toLowerCase() === 'linestring' && Array.isArray(parsed.coordinates)) {
          rawCoords = parsed.coordinates.map((pt: any) => [Number(pt[0]), Number(pt[1])])
        }

        if (rawCoords.length < 2) {
          showToast('Tệp tải lên không chứa hình học LineString hoặc tim tuyến hợp lệ!')
          return
        }

        // Tự động nhận diện và đảo thứ tự nếu file chứa [lat, lng] thay vì [lng, lat] chuẩn WGS84
        let extracted = rawCoords
        const sample = extracted[0]
        if (sample[0] >= 8 && sample[0] <= 24 && sample[1] >= 100 && sample[1] <= 112) {
          extracted = extracted.map(([lat, lng]) => [lng, lat])
        }

        // Lọc bỏ các điểm tọa độ trùng lặp liên tiếp để tránh khoảng cách bằng 0
        const cleanCoords: [number, number][] = []
        for (let i = 0; i < extracted.length; i++) {
          if (
            i === 0 ||
            Math.abs(extracted[i][0] - extracted[i - 1][0]) > 1e-7 ||
            Math.abs(extracted[i][1] - extracted[i - 1][1]) > 1e-7
          ) {
            cleanCoords.push(extracted[i])
          }
        }

        if (cleanCoords.length < 2) {
          showToast('Tệp tải lên không đủ các điểm mốc tọa độ phân biệt!')
          return
        }

        extracted = cleanCoords

        // Tính khoảng cách tổng cộng (km) bằng công thức Haversine
        let totalLen = 0
        const originKm = activeProject.stationOriginKm
        const kmPts: number[] = [originKm]
        for (let i = 0; i < extracted.length - 1; i++) {
          const d = calculateHaversineKm(extracted[i], extracted[i + 1])
          totalLen += d
          kmPts.push(Number((originKm + totalLen).toFixed(3)))
        }
        totalLen = parseFloat(Math.max(totalLen, 0.05).toFixed(3))

        setCurrentCoords(extracted)
        setCurrentKmPoints(kmPts)
        setImportedFileName(file.name)
        setImportedLengthKm(totalLen)

        // Tự động phân đoạn: nếu tuyến ngắn (< 2km) thì chia thành 2-3 phân đoạn trực quan
        let dist = splitDistance || 5.0
        if (totalLen <= 1.0) {
          dist = parseFloat((totalLen / 3).toFixed(2)) || 0.25
        } else if (totalLen <= 2.5) {
          dist = parseFloat((totalLen / 3).toFixed(2)) || 0.5
        }

        const count = Math.max(1, Math.ceil(totalLen / dist))
        const newSegs: SegmentItem[] = []
        let cur = originKm
        for (let i = 1; i <= count; i++) {
          const next = i === count ? originKm + totalLen : Math.min(cur + dist, originKm + totalLen)
          newSegs.push({
            id: `seg-${i}`,
            code: `Phân đoạn #${String(i).padStart(2, '0')}`,
            startKm: parseFloat(cur.toFixed(3)),
            endKm: parseFloat(next.toFixed(3)),
            lengthKm: parseFloat((next - cur).toFixed(3)),
            roadWidthM: roadWidthM || 8.0,
            status: 'VALID',
            statusText: 'HỢP LỆ (Valid)',
            laneCount: 4,
            surfaceMaterial: i % 2 === 0 ? 'Mặt BTN C19' : 'Mặt BTN C12.5',
            color: SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
          })
          cur = next
        }

        const validated = checkAndEnrichSegmentsContinuity(newSegs)
        setSegments(validated)
        setSlabs(generateMockSlabs(validated.length))
        setSelectedSegmentId(validated[0]?.id || null)
        setIsImportModalOpen(false)

        // Cập nhật trực tiếp lên MapLibre ngay lập tức
        if (mapRef.current) {
          const map = mapRef.current
          const bounds = new maplibregl.LngLatBounds()
          extracted.forEach((c) => bounds.extend(c))
          map.fitBounds(bounds, { padding: 80, speed: 1.2 })

          const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
          if (segSrc) {
            segSrc.setData(buildSegmentsGeoJSON(validated, extracted, kmPts, validated[0]?.id || null))
          }
          const surfSrc = map.getSource('segments-surface-source') as maplibregl.GeoJSONSource
          if (surfSrc) {
            surfSrc.setData(buildSegmentsSurfaceGeoJSON(validated, extracted, kmPts, validated[0]?.id || null))
          }
          const planSrc = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
          if (planSrc) {
            planSrc.setData(buildPlanningCorridorGeoJSON(extracted, corridorMarginM))
          }
          renderMarkers(map, validated, extracted, kmPts)
        }

        const lenText = totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${(totalLen * 1000).toFixed(0)} m`
        showToast(`Đã nạp tim tuyến [${file.name}]: ${extracted.length} đỉnh, chiều dài ${lenText}, chia ${validated.length} phân đoạn!`)
      } catch (err) {
        showToast('Lỗi: Định dạng file GeoJSON không đúng cấu trúc JSON chuẩn!')
      }
    }
    reader.readAsText(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processGeoJSONFile(file)
    }
  }

  // Xử lý nạp dữ liệu từ chuỗi tọa độ đỉnh thủ công (Manual Polyline text / JSON) theo chuẩn v2.2 (source_kind = MANUAL)
  const processManualCoordinates = (text: string) => {
    try {
      if (!text || !text.trim()) {
        showToast('Vui lòng nhập hoặc dán chuỗi tọa độ đỉnh!')
        return
      }

      let coords: [number, number][] = []
      const trimmed = text.trim()

      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            coords = parsed.map((p: any) => [Number(p[0]), Number(p[1])])
          } else if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
            const line = parsed.features.find((f: any) => f.geometry?.type === 'LineString')
            if (line?.geometry?.coordinates) {
              coords = line.geometry.coordinates.map((p: any) => [Number(p[0]), Number(p[1])])
            }
          }
        } catch {
          // Parse line by line fallback
        }
      }

      if (coords.length < 2) {
        const lines = trimmed.split('\n')
        for (const line of lines) {
          const cleaned = line.trim().replace(/[\[\]\(\);]/g, '')
          if (!cleaned) continue
          const parts = cleaned.split(/[\s,]+/).filter(Boolean)
          if (parts.length >= 2) {
            const num1 = parseFloat(parts[0])
            const num2 = parseFloat(parts[1])
            if (!isNaN(num1) && !isNaN(num2)) {
              coords.push([num1, num2])
            }
          }
        }
      }

      if (coords.length < 2) {
        showToast('Chuỗi tọa độ cần ít nhất 2 điểm đỉnh [kinh độ, vĩ độ] hợp lệ!')
        return
      }

      let extracted = coords
      const sample = extracted[0]
      if (sample[0] >= 8 && sample[0] <= 24 && sample[1] >= 100 && sample[1] <= 112) {
        extracted = extracted.map(([lat, lng]) => [lng, lat])
      }

      const cleanCoords: [number, number][] = []
      for (let i = 0; i < extracted.length; i++) {
        if (
          i === 0 ||
          Math.abs(extracted[i][0] - extracted[i - 1][0]) > 1e-7 ||
          Math.abs(extracted[i][1] - extracted[i - 1][1]) > 1e-7
        ) {
          cleanCoords.push(extracted[i])
        }
      }

      if (cleanCoords.length < 2) {
        showToast('Chuỗi tọa độ không đủ các điểm phân biệt!')
        return
      }

      extracted = cleanCoords

      let totalLen = 0
      const originKm = activeProject.stationOriginKm
      const kmPts: number[] = [originKm]
      for (let i = 0; i < extracted.length - 1; i++) {
        const d = calculateHaversineKm(extracted[i], extracted[i + 1])
        totalLen += d
        kmPts.push(Number((originKm + totalLen).toFixed(3)))
      }
      totalLen = parseFloat(Math.max(totalLen, 0.05).toFixed(3))

      setCurrentCoords(extracted)
      setCurrentKmPoints(kmPts)
      setImportedFileName('Chuỗi tọa độ thủ công (MANUAL)')
      setImportedLengthKm(totalLen)

      let dist = splitDistance || 5.0
      if (totalLen <= 1.0) dist = parseFloat((totalLen / 3).toFixed(2)) || 0.25
      else if (totalLen <= 2.5) dist = parseFloat((totalLen / 3).toFixed(2)) || 0.5

      const count = Math.max(1, Math.ceil(totalLen / dist))
      const newSegs: SegmentItem[] = []
      let cur = originKm
      for (let i = 1; i <= count; i++) {
        const next = i === count ? originKm + totalLen : Math.min(cur + dist, originKm + totalLen)
        newSegs.push({
          id: `seg-${i}`,
          code: `Phân đoạn #${String(i).padStart(2, '0')}`,
          startKm: parseFloat(cur.toFixed(3)),
          endKm: parseFloat(next.toFixed(3)),
          lengthKm: parseFloat((next - cur).toFixed(3)),
          roadWidthM: roadWidthM || 8.0,
          status: 'VALID',
          statusText: 'HỢP LỆ (Valid)',
          laneCount: 4,
          surfaceMaterial: i % 2 === 0 ? 'Mặt BTN C19' : 'Mặt BTN C12.5',
          color: SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
        })
        cur = next
      }

      const validated = checkAndEnrichSegmentsContinuity(newSegs)
      setSegments(validated)
      setSlabs(generateMockSlabs(validated.length))
      setSelectedSegmentId(validated[0]?.id || null)
      setIsImportModalOpen(false)

      if (mapRef.current) {
        const map = mapRef.current
        const bounds = new maplibregl.LngLatBounds()
        extracted.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 80, speed: 1.2 })

        const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
        if (segSrc) {
          segSrc.setData(buildSegmentsGeoJSON(validated, extracted, kmPts, validated[0]?.id || null))
        }
        const surfSrc = map.getSource('segments-surface-source') as maplibregl.GeoJSONSource
        if (surfSrc) {
          surfSrc.setData(buildSegmentsSurfaceGeoJSON(validated, extracted, kmPts, validated[0]?.id || null))
        }
        const planSrc = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
        if (planSrc) {
          planSrc.setData(buildPlanningCorridorGeoJSON(extracted, corridorMarginM))
        }
        renderMarkers(map, validated, extracted, kmPts)
      }

      const lenText = totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${(totalLen * 1000).toFixed(0)} m`
      showToast(`Đã dựng tim tuyến từ chuỗi tọa độ thủ công: ${extracted.length} đỉnh, L = ${lenText}, chia ${validated.length} phân đoạn!`)
    } catch {
      showToast('Lỗi khi phân tích chuỗi tọa độ!')
    }
  }

  // Reset góc nhìn vừa khung hình toàn tuyến
  const handleFitBounds = () => {
    if (mapRef.current) {
      if (currentCoords.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        currentCoords.forEach((c) => bounds.extend(c))
        mapRef.current.fitBounds(bounds, { padding: 60, speed: 1.1 })
      } else {
        mapRef.current.flyTo({
          center: [108.1651, 16.2052],
          zoom: 11.2,
          pitch: 30,
          bearing: -18,
          speed: 1.1
        })
      }
    }
  }

  // Chọn toàn tuyến: Fit bounds toàn bộ và highlight toàn tuyến
  const handleSelectAllRoute = () => {
    setSelectedSegmentId('ALL')
    if (popupRef.current) popupRef.current.remove()
    if (mapRef.current) {
      if (currentCoords.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        currentCoords.forEach((c) => bounds.extend(c))
        mapRef.current.fitBounds(bounds, { padding: 60, speed: 1.1 })
      }
      syncMapDataDirect(segments, 'ALL', currentCoords, currentKmPoints, {
        slabLenM: slabLengthM,
        thicknessCm: slabThicknessCm,
        contractionSpacingM: contractionSpacingM,
        expansionSpacingM: expansionSpacingM,
        expansionGapMm: expansionGapMm
      })
    }
    showToast('Đang chọn Toàn Tuyến: Hiển thị đầy đủ các phân đoạn và tổng số tấm BTXM')
  }

  // Chọn phân đoạn từ danh sách -> Map fly tới phân đoạn đó
  const handleSelectSegment = (seg: SegmentItem) => {
    setSelectedSegmentId(seg.id)
    if (mapRef.current) {
      const centerCoord = interpolateCoordAtKm((seg.startKm + seg.endKm) / 2, currentCoords, currentKmPoints)
      mapRef.current.flyTo({
        center: centerCoord,
        zoom: 13.2,
        speed: 1.2
      })
      syncMapDataDirect(segments, seg.id, currentCoords, currentKmPoints, {
        slabLenM: slabLengthM,
        thicknessCm: slabThicknessCm,
        contractionSpacingM: contractionSpacingM,
        expansionSpacingM: expansionSpacingM,
        expansionGapMm: expansionGapMm
      })
    }
  }

  // Danh sách Tấm BTXM được nội suy và hiển thị động theo kích thước L và phân đoạn đang chọn
  const displayedSlabs = useMemo(() => {
    const isAll = selectedSegmentId === 'ALL' || !selectedSegmentId
    const targetSegs = isAll ? segments : segments.filter((s) => s.id === selectedSegmentId)
    const result: SlabItem[] = []
    const statuses: ('GOOD' | 'CRACKED' | 'SETTLEMENT')[] = ['GOOD', 'GOOD', 'GOOD', 'GOOD', 'CRACKED', 'GOOD', 'SETTLEMENT']

    let count = 0
    for (const seg of targetSegs) {
      const segLenM = (seg.lengthKm || 1.0) * 1000
      const segSlabCount = Math.min(20, Math.floor(segLenM / Math.max(1.0, slabLengthM)))
      for (let j = 1; j <= segSlabCount; j++) {
        count++
        const kmPos = seg.startKm + ((j * slabLengthM) / 1000)
        result.push({
          id: `SLAB-${String(count).padStart(3, '0')}`,
          segmentCode: seg.code,
          stationing: `Km ${kmPos.toFixed(3)}`,
          lengthM: slabLengthM,
          widthM: (seg.roadWidthM || 8.0) / 2,
          thicknessCm: slabThicknessCm,
          status: statuses[(count - 1) % statuses.length]
        })
        if (result.length >= 40) break
      }
      if (result.length >= 40) break
    }
    return result
  }, [segments, selectedSegmentId, slabLengthM, slabThicknessCm])

  // PM Trình duyệt tim tuyến (Kiểm tra điều kiện tiên quyết v2.2: Không được trình duyệt khi còn khoảng hở GAP_WARNING)
  const handleSubmitAlignment = () => {
    const hasAnyGap = segments.some((s) => s.hasGap)
    if (hasAnyGap) {
      showToast('Cảnh báo v2.2 (WF-02.F04): Tuyến đường còn phân đoạn bị hở hoặc chồng lấn (GAP_WARNING)! Vui lòng bấm "Nối tiếp giáp" trước khi trình duyệt.')
      return
    }
    alignmentService.submitAlignment(selectedProjectId)
    setAlignmentStatus('PENDING_APPROVAL')
    showToast('Đã gửi hồ sơ thiết lập tim tuyến (WF-02) sang Supervisor để thẩm duyệt & ký số!')
  }

  // Supervisor Xác nhận khóa tim tuyến
  const handleLockAlignment = () => {
    alignmentService.confirmAlignment(selectedProjectId, user?.full_name || 'Supervisor')
    setAlignmentStatus('CONFIRMED')
    showToast('Dự án đã chính thức KHÓA TIM TUYẾN (CONFIRMED)! Chữ ký số SHA-256 đã được gắn bất biến.')
  }

  // Nạp kịch bản mẫu GeoJSON
  const handleLoadPreset = (name: string, dist: number) => {
    setSplitDistance(dist)
    setIsImportModalOpen(false)

    // Khởi tạo các phân đoạn mới
    const count = Math.ceil(25.0 / dist)
    const newSegs: SegmentItem[] = []
    let cur = 1020.0
    for (let i = 1; i <= count; i++) {
      const next = Math.min(cur + dist, 1045.0)
      newSegs.push({
        id: `seg-${i}`,
        code: `Phân đoạn #${String(i).padStart(2, '0')}`,
        startKm: cur,
        endKm: next,
        lengthKm: parseFloat((next - cur).toFixed(2)),
        roadWidthM: roadWidthM || 8.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
      })
      cur = next
    }
    const validated = checkAndEnrichSegmentsContinuity(newSegs)
    setSegments(validated)
    setSlabs(generateMockSlabs(validated.length))
    setSelectedSegmentId(validated[0]?.id || null)
    setImportedFileName(name)
    setImportedLengthKm(25.0)
    showToast(`Đã nạp thành công bộ dữ liệu "${name}"! Bản đồ đã tải lại hoàn toàn.`)
    handleFitBounds()
  }

  const basePath = isSupervisor ? '/sup' : '/pm'

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODALS */}
      <AlignmentModals
        isImportModalOpen={isImportModalOpen}
        onCloseImportModal={() => setIsImportModalOpen(false)}
        importTab={importTab}
        onSetImportTab={setImportTab}
        onLoadPreset={handleLoadPreset}
        onProcessGeoJsonFile={processGeoJSONFile}
        manualCoordsText={manualCoordsText}
        onSetManualCoordsText={setManualCoordsText}
        onProcessManualCoordinates={processManualCoordinates}
        activeProject={activeProject}

        editingSegment={editingSegment}
        onCloseEditSegment={() => setEditingSegment(null)}
        onChangeEditingSegment={setEditingSegment}
        onSaveEditedSegment={handleSaveEditedSegment}

        isAddSegmentModalOpen={isAddSegmentModalOpen}
        onCloseAddSegmentModal={() => setIsAddSegmentModalOpen(false)}
        newSegForm={newSegForm}
        onChangeNewSegForm={setNewSegForm}
        onCreateNewSegment={handleCreateNewSegment}
        segmentsCount={segments.length}

        splitModalSegment={splitModalSegment}
        onCloseSplitModal={() => setSplitModalSegment(null)}
        customSplitKm={customSplitKm}
        onChangeCustomSplitKm={setCustomSplitKm}
        onSplitSegmentSubmit={handleSplitSegmentSubmit}
      />

      {/* TOP HEADER */}
      <AlignmentHeader
        basePath={basePath}
        alignmentStatus={alignmentStatus}
        activeProject={activeProject}
        selectedProjectId={selectedProjectId}
        assignedProjects={PM_ASSIGNED_PROJECTS}
        importedLengthKm={importedLengthKm}
        isSupervisor={isSupervisor}
        onSwitchProject={handleSwitchProject}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onSubmitAlignment={handleSubmitAlignment}
        onLockAlignment={handleLockAlignment}
      />

      {/* WORKSPACE GRID: MAP + SIDEBAR */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <AlignmentMap
          mapContainerRef={mapContainerRef}
          mapRef={mapRef}
          mapLayer={mapLayer}
          onSetMapLayer={setMapLayer}
          showSlabsAndJoints={showSlabsAndJoints}
          onToggleSlabsAndJoints={() => {
            const next = !showSlabsAndJoints
            setShowSlabsAndJoints(next)
            showToast(next ? 'Đã BẬT lớp Tấm bê tông, Khe co giãn & 2 Mép đường' : 'Đã TẮT lớp Tấm & Khe BTXM')
          }}
          cursorPos={cursorPos}
          rulerActive={rulerActive}
          onToggleRuler={() => {
            setRulerActive(!rulerActive)
            setRulerPoints([])
            showToast(rulerActive ? 'Đã tắt thước đo.' : 'Bật thước đo: Bấm chọn 2 điểm trên bản đồ để đo cự ly.')
          }}
          onSelectAllRoute={handleSelectAllRoute}
          selectedSegmentId={selectedSegmentId}
          segments={segments}
          importedLengthKm={importedLengthKm}
          slabLengthM={slabLengthM}
          slabThicknessCm={slabThicknessCm}
          contractionSpacingM={contractionSpacingM}
          expansionSpacingM={expansionSpacingM}
          expansionGapMm={expansionGapMm}
        />

        <AlignmentSidebar
          rightTab={rightTab}
          onSetRightTab={setRightTab}
          segments={segments}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={handleSelectSegment}
          splitDistance={splitDistance}
          onSetSplitDistance={setSplitDistance}
          splitSortOrder={splitSortOrder}
          onSetSplitSortOrder={setSplitSortOrder}
          onApplyAutoSplit={handleApplyAutoSplit}
          onOpenAddSegmentModal={() => {
            const lastSeg = segments[segments.length - 1]
            const nextStart = lastSeg ? lastSeg.endKm : 1020.0
            const segLen = splitDistance || 1.0
            setNewSegForm({
              code: `Phân đoạn #${String(segments.length + 1).padStart(2, '0')}`,
              startKm: parseFloat(nextStart.toFixed(3)),
              endKm: parseFloat((nextStart + segLen).toFixed(3)),
              roadWidthM: 8.0,
              laneCount: 4,
              surfaceMaterial: 'Mặt BTN C12.5',
              color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length]
            })
            setIsAddSegmentModalOpen(true)
          }}
          onSelectAllRoute={handleSelectAllRoute}
          currentKmPoints={currentKmPoints}
          importedLengthKm={importedLengthKm}
          slabLengthM={slabLengthM}
          onSetSlabLengthM={setSlabLengthM}
          slabThicknessCm={slabThicknessCm}
          onSetSlabThicknessCm={setSlabThicknessCm}
          syncJointWithSlab={syncJointWithSlab}
          onSetSyncJointWithSlab={setSyncJointWithSlab}
          contractionSpacingM={contractionSpacingM}
          onSetContractionSpacingM={setContractionSpacingM}
          expansionSpacingM={expansionSpacingM}
          onSetExpansionSpacingM={setExpansionSpacingM}
          expansionGapMm={expansionGapMm}
          onSetExpansionGapMm={setExpansionGapMm}
          onOpenSplitModal={(seg) => {
            setSplitModalSegment(seg)
            setCustomSplitKm(parseFloat(((seg.startKm + seg.endKm) / 2).toFixed(3)))
          }}
          onEditSegment={(seg) => setEditingSegment({ ...seg })}
          onDeleteSegment={handleDeleteSegment}
          onSnapSegment={handleSnapSegment}
          onUpdateSegmentWidth={handleUpdateSegmentWidth}
          onUpdateAllWidths={(wVal) => {
            const updated = segments.map((s) => ({ ...s, roadWidthM: wVal }))
            setSegments(updated)
            syncMapDataDirect(updated, selectedSegmentId)
            showToast(`Đã cập nhật tất cả phân đoạn bề rộng ${wVal}m!`)
          }}
          slabs={slabs}
          showToast={showToast}
        />
      </section>
    </div>
  )
}
