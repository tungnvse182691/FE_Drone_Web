import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle, setMapLayerVisibility } from '../../utils/maplibre'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
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

// Interface cho Phân đoạn tuyến (Segment)
interface SegmentItem {
  id: string
  code: string
  startKm: number
  endKm: number
  lengthKm: number
  roadWidthM: number // Bề rộng mặt đường (RoadWidthProfile v2.2 - mét)
  status: 'VALID' | 'GAP_WARNING'
  statusText: string
  laneCount: number
  surfaceMaterial: string
  color: string
  hasGap?: boolean
  gapDistance?: number
}

// Interface cho Tấm Slab
interface SlabItem {
  id: string
  segmentCode: string
  stationing: string
  lengthM: number
  widthM: number
  thicknessCm: number
  status: 'GOOD' | 'CRACKED' | 'SETTLEMENT'
}

// Bảng màu phân đoạn trực quan
const SEGMENT_COLORS = [
  '#0284C7', // Sky Blue
  '#D97706', // Amber
  '#059669', // Emerald Green
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0D9488', // Teal
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#2563EB'  // Blue
]

// Tọa độ tim tuyến chuẩn QL1A Km 1020 - Km 1045 (Chuẩn hình học không có lỗi tự cắt hay khoảng hở)
const ROUTE_COORDINATES: [number, number][] = [
  [108.0825, 16.2731], // P0 - Km 1020+000 (Huế)
  [108.1054, 16.2589], // P1 - Km 1022+500
  [108.1287, 16.2415], // P2 - Km 1025+000 (Điểm giáp Seg 1-2)
  [108.1492, 16.2238], // P3 - Km 1027+500
  [108.1695, 16.2085], // P4 - Km 1030+000
  [108.1884, 16.1843], // P5 - Km 1035+000
  [108.2152, 16.1521], // P6 - Km 1040+000
  [108.2418, 16.1215]  // P7 - Km 1045+000 (Đà Nẵng)
]

// Các mốc lý trình ứng với các điểm trên tuyến (25.0 km)
const ROUTE_KM_POINTS = [1020, 1022.5, 1025, 1027.5, 1030, 1035, 1040, 1045]

// Danh mục dự án mà PM Đỗ Quốc Hoàng được phân công quản lý
export interface AssignedProjectOption {
  id: string
  code: string
  name: string
  stationOriginText: string
  stationOriginKm: number
  endKm: number
  crs: string
  lengthKm: number
  defaultCoords: [number, number][]
  defaultKmPoints: number[]
  defaultSegments: SegmentItem[]
  defaultManualText: string
}

export const PM_ASSIGNED_PROJECTS: AssignedProjectOption[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Đoạn Km 1020 đến Km 1045',
    stationOriginText: 'Km 1020+000 (1.020.000m)',
    stationOriginKm: 1020.0,
    endKm: 1045.0,
    crs: 'EPSG:32648 (UTM Zone 48N)',
    lengthKm: 25.0,
    defaultCoords: ROUTE_COORDINATES,
    defaultKmPoints: ROUTE_KM_POINTS,
    defaultManualText: `108.0825, 16.2731
108.1054, 16.2589
108.1287, 16.2415
108.1492, 16.2238
108.1695, 16.2085
108.1884, 16.1843
108.2152, 16.1521
108.2418, 16.1215`,
    defaultSegments: [
      {
        id: 'seg-1',
        code: 'Phân đoạn #01',
        startKm: 1020.0,
        endKm: 1025.0,
        lengthKm: 5.0,
        roadWidthM: 8.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[0]
      },
      {
        id: 'seg-2',
        code: 'Phân đoạn #02',
        startKm: 1025.0,
        endKm: 1030.0,
        lengthKm: 5.0,
        roadWidthM: 10.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[1]
      },
      {
        id: 'seg-3',
        code: 'Phân đoạn #03',
        startKm: 1030.0,
        endKm: 1045.0,
        lengthKm: 15.0,
        roadWidthM: 8.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[2]
      }
    ]
  },
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan',
    stationOriginText: 'Km 0+000 (0m)',
    stationOriginKm: 0.0,
    endKm: 66.0,
    crs: 'EPSG:32648 (UTM Zone 48N)',
    lengthKm: 66.0,
    defaultCoords: [
      [107.6521, 16.2912],
      [107.7214, 16.2105],
      [107.8102, 16.1423],
      [107.9056, 16.0821],
      [108.0124, 16.0354],
      [108.1189, 15.9876]
    ],
    defaultKmPoints: [0, 15, 30, 45, 55, 66],
    defaultManualText: `107.6521, 16.2912
107.7214, 16.2105
107.8102, 16.1423
107.9056, 16.0821
108.0124, 16.0354
108.1189, 15.9876`,
    defaultSegments: [
      {
        id: 'seg-lstl-1',
        code: 'Đoạn La Sơn #01',
        startKm: 0.0,
        endKm: 20.0,
        lengthKm: 20.0,
        roadWidthM: 12.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C19.0',
        color: SEGMENT_COLORS[0]
      },
      {
        id: 'seg-lstl-2',
        code: 'Đoạn Đèo Khe Tre #02',
        startKm: 20.0,
        endKm: 45.0,
        lengthKm: 25.0,
        roadWidthM: 12.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C19.0',
        color: SEGMENT_COLORS[1]
      },
      {
        id: 'seg-lstl-3',
        code: 'Đoạn Túy Loan #03',
        startKm: 45.0,
        endKm: 66.0,
        lengthKm: 21.0,
        roadWidthM: 14.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C19.0',
        color: SEGMENT_COLORS[2]
      }
    ]
  }
]

// Hàm nội suy tọa độ [lng, lat] theo Km lý trình
function interpolateCoordAtKm(
  km: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number] {
  if (km <= kmPoints[0]) return coords[0]
  if (km >= kmPoints[kmPoints.length - 1]) return coords[coords.length - 1]

  for (let i = 0; i < kmPoints.length - 1; i++) {
    if (km >= kmPoints[i] && km <= kmPoints[i + 1]) {
      const span = kmPoints[i + 1] - kmPoints[i]
      if (span === 0) return coords[i]
      const t = (km - kmPoints[i]) / span
      const lng = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
      const lat = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
      return [Number(lng.toFixed(6)), Number(lat.toFixed(6))]
    }
  }
  return coords[coords.length - 1]
}

// Trích xuất chuỗi tọa độ LineString cho một phân đoạn từ startKm đến endKm
function getSubLineCoordinates(
  startKm: number,
  endKm: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number][] {
  if (!coords || coords.length < 2) return coords || []

  // Nếu phân đoạn bao phủ toàn tuyến hoặc chỉ có 1 phân đoạn
  if (startKm <= kmPoints[0] && endKm >= kmPoints[kmPoints.length - 1]) {
    return coords
  }

  const result: [number, number][] = []
  result.push(interpolateCoordAtKm(startKm, coords, kmPoints))

  for (let i = 0; i < kmPoints.length; i++) {
    if (kmPoints[i] > startKm && kmPoints[i] < endKm) {
      result.push(coords[i])
    }
  }

  result.push(interpolateCoordAtKm(endKm, coords, kmPoints))

  // Đảm bảo LineString trong GeoJSON luôn có ít nhất 2 tọa độ hợp lệ
  if (result.length < 2) {
    return coords.slice(0, 2)
  }
  // Nếu 2 điểm đầu cuối trùng nhau, tạo độ lệch vi mô để LineString luôn render được trên MapLibre
  if (
    result.length === 2 &&
    Math.abs(result[0][0] - result[1][0]) < 1e-7 &&
    Math.abs(result[0][1] - result[1][1]) < 1e-7
  ) {
    return [result[0], [result[0][0] + 0.0001, result[0][1] + 0.0001]]
  }

  return result
}

// Hàm kiểm tra tính liên tục, khoảng hở (GAP) hoặc chồng lấn (OVERLAP) theo quy tắc v2.2 (WF-02.F04)
function checkAndEnrichSegmentsContinuity(segs: SegmentItem[]): SegmentItem[] {
  const sorted = [...segs].sort((a, b) => a.startKm - b.startKm)
  return sorted.map((seg, idx) => {
    if (idx === 0) {
      return {
        ...seg,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        hasGap: false,
        gapDistance: 0
      }
    }
    const prevEnd = sorted[idx - 1].endKm
    const curStart = seg.startKm
    const diff = Number((curStart - prevEnd).toFixed(3))

    if (diff > 0.001) {
      // Có khoảng hở giữa 2 phân đoạn (Gap)
      const gapM = Math.round(diff * 1000)
      return {
        ...seg,
        status: 'GAP_WARNING',
        statusText: `CẢNH BÁO HỞ (+${gapM}m)`,
        hasGap: true,
        gapDistance: gapM
      }
    } else if (diff < -0.001) {
      // Chồng lấn giữa 2 phân đoạn (Overlap)
      const overlapM = Math.round(Math.abs(diff) * 1000)
      return {
        ...seg,
        status: 'GAP_WARNING',
        statusText: `CHỒNG LẤN (-${overlapM}m)`,
        hasGap: true,
        gapDistance: -overlapM
      }
    } else {
      return {
        ...seg,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        hasGap: false,
        gapDistance: 0
      }
    }
  })
}

// Tạo danh sách tấm Slab mẫu
function generateMockSlabs(segmentCount: number): SlabItem[] {
  const slabs: SlabItem[] = []
  const statuses: ('GOOD' | 'CRACKED' | 'SETTLEMENT')[] = ['GOOD', 'GOOD', 'GOOD', 'GOOD', 'CRACKED', 'GOOD', 'SETTLEMENT']
  for (let i = 1; i <= 24; i++) {
    const segIdx = ((i - 1) % segmentCount) + 1
    const kmOffset = 1020 + (i * 0.2)
    slabs.push({
      id: `SLAB-${String(i).padStart(3, '0')}`,
      segmentCode: `Phân đoạn #${String(segIdx).padStart(2, '0')}`,
      stationing: `Km ${kmOffset.toFixed(3)}`,
      lengthM: 5.0,
      widthM: 3.75,
      thicknessCm: 26,
      status: statuses[i % statuses.length]
    })
  }
  return slabs
}

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

  // Trạng thái tim tuyến: 'DRAFT' | 'CONFIRMED'
  const [alignmentStatus, setAlignmentStatus] = useState<'DRAFT' | 'CONFIRMED'>('DRAFT')

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

    const hasGap = validated.find((s) => s.id === updated.id)?.hasGap
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
    showToast('Đã gửi hồ sơ thiết lập tim tuyến (WF-02) sang Supervisor để thẩm duyệt & ký số!')
  }

  // Supervisor Xác nhận khóa tim tuyến
  const handleLockAlignment = () => {
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

      {/* Modal nạp file GeoJSON / KML / Chuỗi tọa độ thủ công (WF-02) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">Thiết Lập Tim Tuyến (WF-02 • Spec v2.2)</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab navigation: Tải tệp vs Dán chuỗi tọa độ thủ công */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setImportTab('FILE')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'FILE'
                    ? 'border-[#C9A227] text-[#8F7212]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Tải tệp tin (GeoJSON / KML / GPX)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportTab('MANUAL')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'MANUAL'
                    ? 'border-[#C9A227] text-[#8F7212]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Dán chuỗi tọa độ (Manual Polyline)</span>
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD & PRESET */}
            {importTab === 'FILE' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-600">
                  Chọn mẫu tim tuyến chuẩn trắc địa WGS84 hoặc tải lên tệp GeoJSON / KML / GPX từ máy tính:
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleLoadPreset('QL1A Đoạn Thừa Thiên Huế - Đà Nẵng (Chuẩn 5km/đoạn)', 5)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#C9A227] hover:bg-amber-50/40 text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Tuyến QL1A Mở rộng (25.0 km • 5 Phân đoạn)</span>
                      <span className="text-[11px] text-slate-500">Đã kiểm chuẩn tiếp giáp & bán kính cong TCVN</span>
                    </div>
                    <span className="text-xs font-semibold text-[#8F7212] bg-amber-100 px-2 py-1 rounded-md">Mẫu chuẩn</span>
                  </button>

                  <button
                    onClick={() => handleLoadPreset('Tuyến Đường Tránh TP. Huế (Cự ly 4km/đoạn)', 4)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#C9A227] hover:bg-amber-50/40 text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Đoạn Phân đoạn mịn (25.0 km • 4km/đoạn • 7 Phân đoạn)</span>
                      <span className="text-[11px] text-slate-500">Phù hợp kiểm tra nứt lún mật độ cao</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">Khảo sát</span>
                  </button>
                </div>

                {/* Input file ẩn hỗ trợ .geojson, .json, .kml, .gpx */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".geojson,.json,.kml,.gpx"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file) processGeoJSONFile(file)
                  }}
                  className="border-2 border-dashed border-[#C9A227]/70 hover:border-[#C9A227] rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5 bg-amber-50/20 hover:bg-amber-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-[#8F7212]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Nhấp để chọn tệp hoặc kéo thả tệp GeoJSON / KML / GPX vào đây
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tự động lọc layer Centerline / Tim tuyến chính (CAD Civil 3D)
                  </span>
                  <span className="text-[10px] font-mono text-[#8F7212] bg-white px-2 py-0.5 rounded border border-amber-200 mt-1">
                    Chuẩn trắc địa WGS84 (EPSG:4326) • Chiều dài L = 25.0 km
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL COORDINATE INPUT (v2.2 source_kind = MANUAL) */}
            {importTab === 'MANUAL' && (
              <div className="flex flex-col gap-3">
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  <strong>Nghiệp vụ v2.2 (WF-02.F02):</strong> PM nhập trực tiếp chuỗi tọa độ tim đường (kinh độ, vĩ độ). Mỗi dòng 1 cặp điểm <code>lng, lat</code> hoặc dán chuỗi mảng JSON / GeoJSON LineString.
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Dán danh sách tọa độ đỉnh:</span>
                    <button
                      type="button"
                      onClick={() => setManualCoordsText(activeProject.defaultManualText)}
                      className="text-[#8F7212] hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Dán mẫu {activeProject.code} ({activeProject.defaultCoords.length} đỉnh)
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={manualCoordsText}
                    onChange={(e) => setManualCoordsText(e.target.value)}
                    className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] bg-slate-50 text-slate-800 focus:bg-white resize-y"
                    placeholder="108.0825, 16.2731&#10;108.1054, 16.2589&#10;108.1287, 16.2415..."
                  />
                  <span className="text-[10px] text-slate-400">
                    Gợi ý: Tự động đảo thứ tự nếu dán theo format [lat, lng]; tự động lọc điểm trùng lặp liên tiếp.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Lý trình gốc (Station Origin):</span>
                    <span className="font-mono font-bold text-slate-800">{activeProject.stationOriginText}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Hệ quy chiếu phẳng (CRS):</span>
                    <span className="font-mono font-bold text-[#8F7212]">{activeProject.crs}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => processManualCoordinates(manualCoordsText)}
                  className="w-full py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Dựng tim tuyến & phân đoạn từ chuỗi tọa độ</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa phân đoạn (Edit Segment Modal) */}
      {editingSegment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: editingSegment.color }}
                  className="w-4 h-4 rounded-full shadow-xs"
                />
                <h3 className="font-bold text-slate-900 text-base">
                  Chỉnh Sửa: {editingSegment.code}
                </h3>
              </div>
              <button
                onClick={() => setEditingSegment(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSegment} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Mã / Tên Phân Đoạn
                </label>
                <input
                  type="text"
                  value={editingSegment.code}
                  onChange={(e) => setEditingSegment({ ...editingSegment, code: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình bắt đầu (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingSegment.startKm}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      setEditingSegment({
                        ...editingSegment,
                        startKm: val,
                        lengthKm: parseFloat(Math.max(0, editingSegment.endKm - val).toFixed(3))
                      })
                    }}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình kết thúc (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingSegment.endKm}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      setEditingSegment({
                        ...editingSegment,
                        endKm: val,
                        lengthKm: parseFloat(Math.max(0, val - editingSegment.startKm).toFixed(3))
                      })
                    }}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Chiều dài tính toán:</span>
                <span className="font-mono font-bold text-[#8F7212]">
                  {(editingSegment.endKm - editingSegment.startKm >= 1)
                    ? `${(editingSegment.endKm - editingSegment.startKm).toFixed(3)} km`
                    : `${Math.round((editingSegment.endKm - editingSegment.startKm) * 1000)} mét`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Số làn xe
                  </label>
                  <select
                    value={editingSegment.laneCount}
                    onChange={(e) => setEditingSegment({ ...editingSegment, laneCount: parseInt(e.target.value) || 4 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value={2}>2 làn xe</option>
                    <option value={4}>4 làn xe (Tiêu chuẩn)</option>
                    <option value={6}>6 làn xe (Cao tốc)</option>
                    <option value={8}>8 làn xe</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Vật liệu mặt đường
                  </label>
                  <select
                    value={editingSegment.surfaceMaterial}
                    onChange={(e) => setEditingSegment({ ...editingSegment, surfaceMaterial: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value="Mặt BTN C12.5">Mặt BTN C12.5</option>
                    <option value="Mặt BTN C19">Mặt BTN C19</option>
                    <option value="Mặt BTN Polymer">Mặt BTN Polymer</option>
                    <option value="BTXM Dày 26cm">BTXM Dày 26cm</option>
                  </select>
                </div>
              </div>

              {/* Bề rộng mặt đường (RoadWidthProfile - v2.2) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#C9A227]" />
                    <span>Bề rộng mặt đường (RoadWidthProfile - mét)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#8F7212]">
                    ±{((editingSegment.roadWidthM || 8.0) / 2).toFixed(1)}m mỗi bên tim
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="60"
                      value={editingSegment.roadWidthM || 8.0}
                      onChange={(e) =>
                        setEditingSegment({
                          ...editingSegment,
                          roadWidthM: parseFloat(e.target.value) || 3.0
                        })
                      }
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      required
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                      mét
                    </span>
                  </div>

                  {/* Nút chọn nhanh bề rộng chuẩn (VD: 3m, 4m, 6m, 8m, 10m, 12m) */}
                  <div className="flex items-center gap-1">
                    {[3.0, 4.0, 6.0, 8.0, 10.0, 12.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setEditingSegment({ ...editingSegment, roadWidthM: w })}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          (editingSegment.roadWidthM || 8.0) === w
                            ? 'bg-[#C9A227] text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {w}m
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Đoạn này rộng {editingSegment.roadWidthM || 8.0}m (trái {((editingSegment.roadWidthM || 8.0) / 2).toFixed(1)}m, phải {((editingSegment.roadWidthM || 8.0) / 2).toFixed(1)}m). Diện tích: {Math.round((editingSegment.lengthKm || 0) * 1000 * (editingSegment.roadWidthM || 8.0)).toLocaleString()} m².
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Màu sắc phân đoạn trên bản đồ
                </label>
                <div className="flex items-center gap-2">
                  {SEGMENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingSegment({ ...editingSegment, color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                        editingSegment.color === c
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingSegment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm mới phân đoạn (Add Segment Modal) */}
      {isAddSegmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Thêm Mới Phân Đoạn Tuyến
                </h3>
              </div>
              <button
                onClick={() => setIsAddSegmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSegment} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Mã / Tên Phân Đoạn
                </label>
                <input
                  type="text"
                  placeholder={`Phân đoạn #${String(segments.length + 1).padStart(2, '0')}`}
                  value={newSegForm.code}
                  onChange={(e) => setNewSegForm({ ...newSegForm, code: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình bắt đầu (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newSegForm.startKm}
                    onChange={(e) => setNewSegForm({ ...newSegForm, startKm: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình kết thúc (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newSegForm.endKm}
                    onChange={(e) => setNewSegForm({ ...newSegForm, endKm: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Số làn xe
                  </label>
                  <select
                    value={newSegForm.laneCount}
                    onChange={(e) => setNewSegForm({ ...newSegForm, laneCount: parseInt(e.target.value) || 4 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value={2}>2 làn xe</option>
                    <option value={4}>4 làn xe (Tiêu chuẩn)</option>
                    <option value={6}>6 làn xe (Cao tốc)</option>
                    <option value={8}>8 làn xe</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Vật liệu mặt đường
                  </label>
                  <select
                    value={newSegForm.surfaceMaterial}
                    onChange={(e) => setNewSegForm({ ...newSegForm, surfaceMaterial: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value="Mặt BTN C12.5">Mặt BTN C12.5</option>
                    <option value="Mặt BTN C19">Mặt BTN C19</option>
                    <option value="Mặt BTN Polymer">Mặt BTN Polymer</option>
                    <option value="BTXM Dày 26cm">BTXM Dày 26cm</option>
                  </select>
                </div>
              </div>

              {/* Bề rộng mặt đường (RoadWidthProfile - v2.2) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#C9A227]" />
                    <span>Bề rộng mặt đường (RoadWidthProfile - mét)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#8F7212]">
                    ±{((newSegForm.roadWidthM || 8.0) / 2).toFixed(1)}m mỗi bên tim
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="60"
                      value={newSegForm.roadWidthM || 8.0}
                      onChange={(e) =>
                        setNewSegForm({
                          ...newSegForm,
                          roadWidthM: parseFloat(e.target.value) || 3.0
                        })
                      }
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      required
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                      mét
                    </span>
                  </div>

                  {/* Nút chọn nhanh bề rộng chuẩn (VD: 3m, 4m, 6m, 8m, 10m, 12m) */}
                  <div className="flex items-center gap-1">
                    {[3.0, 4.0, 6.0, 8.0, 10.0, 12.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setNewSegForm({ ...newSegForm, roadWidthM: w })}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          (newSegForm.roadWidthM || 8.0) === w
                            ? 'bg-[#C9A227] text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {w}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Màu sắc phân đoạn trên bản đồ
                </label>
                <div className="flex items-center gap-2">
                  {SEGMENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSegForm({ ...newSegForm, color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                        newSegForm.color === c
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSegmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
                >
                  Thêm phân đoạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal tách phân đoạn (Split Segment Modal) */}
      {splitModalSegment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SplitSquareVertical className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Tách: {splitModalSegment.code}
                </h3>
              </div>
              <button
                onClick={() => setSplitModalSegment(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Phân đoạn hiện tại từ <strong className="text-slate-900 font-mono">Km {splitModalSegment.startKm.toFixed(3)}</strong> đến <strong className="text-slate-900 font-mono">Km {splitModalSegment.endKm.toFixed(3)}</strong> (dài {splitModalSegment.lengthKm.toFixed(3)} km).
            </p>

            <form onSubmit={handleSplitSegmentSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Nhập mốc lý trình cần tách (Km)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min={splitModalSegment.startKm + 0.001}
                  max={splitModalSegment.endKm - 0.001}
                  value={customSplitKm}
                  onChange={(e) => setCustomSplitKm(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  required
                />
              </div>

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 flex flex-col gap-1.5 text-xs text-slate-700">
                <div className="font-bold text-[#8F7212] text-[11px] uppercase tracking-wider">
                  Kết quả sau khi tách:
                </div>
                <div className="flex justify-between">
                  <span>• {splitModalSegment.code}A:</span>
                  <span className="font-mono font-semibold">Km {splitModalSegment.startKm.toFixed(3)} - Km {customSplitKm.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• {splitModalSegment.code}B:</span>
                  <span className="font-mono font-semibold">Km {customSplitKm.toFixed(3)} - Km {splitModalSegment.endKm.toFixed(3)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSplitModalSegment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
                >
                  Xác nhận tách đoạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP COMPACT TITLE & ACTION BAR (ĐÃ LOẠI BỎ KHUNG THỪA VÀ NÚT ROLE DUPLICATE) */}
      <section className="bg-white rounded-xl px-5 py-3.5 shadow-2xs border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          {/* Breadcrumb & Status */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 font-medium">
              <button
                onClick={() => navigate(`${basePath}/dashboard`)}
                className="hover:text-brand-gold transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => navigate(`${basePath}/projects`)}
                className="hover:text-brand-gold transition-colors cursor-pointer"
              >
                Dự án
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-semibold truncate">Thiết lập tim tuyến & Phân đoạn (WF-02)</span>
            </nav>

            <span className="text-slate-300">•</span>

            {/* Trạng thái tim tuyến Badge */}
            {alignmentStatus === 'DRAFT' ? (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-amber-800 font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                DRAFT v1.2 • Đang chỉnh sửa đỉnh
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                CONFIRMED • Đã khóa tim tuyến SHA-256
              </span>
            )}
          </div>

          {/* Project Title & Project Switcher */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
            <h1 className="text-lg font-bold text-brand-dark tracking-tight">
              Quản Lý Hình Học Tuyến & Phân Đoạn Lý Trình
            </h1>
            <span className="hidden lg:inline text-slate-300">|</span>

            {/* Dropdown chọn dự án PM phụ trách */}
            <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/90 px-2.5 py-1 rounded-xl shadow-2xs">
              <Building className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
              <span className="text-[11px] font-semibold text-slate-600">Dự án phụ trách:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => handleSwitchProject(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer hover:text-[#8F7212] transition-colors"
              >
                {PM_ASSIGNED_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              L = {importedLengthKm >= 1 ? `${importedLengthKm.toFixed(2)} km` : `${Math.round(importedLengthKm * 1000)} mét`} ({activeProject.stationOriginText.split(' ')[0]} → Km {(activeProject.stationOriginKm + importedLengthKm).toFixed(1)})
            </span>
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <Compass className="w-3.5 h-3.5 text-[#C9A227]" />
              {activeProject.crs}
            </span>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            type="button"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhập Tuyến / Tọa độ (WF-02)</span>
          </button>

          {/* PM: Submit Approval */}
          {!isSupervisor && (
            <button
              onClick={handleSubmitAlignment}
              disabled={alignmentStatus === 'CONFIRMED'}
              className={`h-8 px-3.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
                alignmentStatus === 'CONFIRMED'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white shadow-xs cursor-pointer'
              }`}
              type="button"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Trình duyệt tim tuyến</span>
            </button>
          )}

          {/* Supervisor: Lock Baseline */}
          {isSupervisor && (
            <button
              onClick={handleLockAlignment}
              disabled={alignmentStatus === 'CONFIRMED'}
              className={`h-8 px-3.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all ${
                alignmentStatus === 'CONFIRMED'
                  ? 'bg-emerald-600 text-white opacity-90 cursor-default'
                  : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white cursor-pointer active:scale-98'
              }`}
              type="button"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{alignmentStatus === 'CONFIRMED' ? 'Đã khóa tim tuyến' : 'Xác nhận & Khóa tim tuyến'}</span>
            </button>
          )}
        </div>
      </section>

      {/* WORKSPACE GRID: 70% MAPLIBRE GIS CANVAS + 30% DYNAMIC CONTROL PANEL */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT 70%: MapLibre Vector Map Canvas */}
        <div className="xl:col-span-8 flex flex-col gap-2">
          <div className="relative w-full h-[660px] rounded-xl overflow-hidden shadow-md bg-slate-950 select-none flex flex-col justify-between border border-slate-800">
            {/* MAP TOP FLOATING CONTROLS */}
            <div className="relative z-30 p-3 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-none">
              {/* Layer Switchers */}
              <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg shadow-lg border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setMapLayer('SATELLITE')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapLayer === 'SATELLITE'
                      ? 'bg-[#C9A227] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Ảnh vệ tinh HD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayer('VECTOR')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapLayer === 'VECTOR'
                      ? 'bg-[#C9A227] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Vector OSM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayer('PLANNING')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapLayer === 'PLANNING'
                      ? 'bg-[#C9A227] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Lớp quy hoạch 30m</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
                <button
                  type="button"
                  onClick={handleSelectAllRoute}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedSegmentId === 'ALL'
                      ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-300/50'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Chọn xem toàn bộ tuyến đường và các phân đoạn"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Toàn Tuyến</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !showSlabsAndJoints
                    setShowSlabsAndJoints(next)
                    showToast(next ? 'Đã BẬT lớp Tấm bê tông, Khe co giãn & 2 Mép đường' : 'Đã TẮT lớp Tấm & Khe BTXM')
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showSlabsAndJoints
                      ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-300/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bật/Tắt hiển thị lưới tấm bê tông, khe co giãn, khe giãn nở và thông số 2 mép đường"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Tấm & Khe BTXM</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${showSlabsAndJoints ? 'bg-white' : 'bg-slate-500'}`} />
                </button>
              </div>

              {/* Live Cursor Readout */}
              <div className="pointer-events-auto hidden lg:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full font-mono text-xs text-white shadow-lg border border-slate-700/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{cursorPos.lat}° N, {cursorPos.lng}° E</span>
                <span className="text-slate-500">|</span>
                <span className="text-[#C9A227] font-semibold">H: {cursorPos.elevation}</span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-300 font-bold">{cursorPos.station}</span>
              </div>

              {/* GIS Map Tools */}
              <div className="pointer-events-auto flex items-center gap-0.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg shadow-lg text-white border border-slate-700/60">
                <button
                  onClick={() => mapRef.current?.zoomIn()}
                  className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Phóng to"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => mapRef.current?.zoomOut()}
                  className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Thu nhỏ"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setRulerActive(!rulerActive)
                    setRulerPoints([])
                    showToast(rulerActive ? 'Đã tắt thước đo.' : 'Bật thước đo: Bấm chọn 2 điểm trên bản đồ để đo cự ly.')
                  }}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    rulerActive ? 'bg-[#C9A227] text-white' : 'hover:bg-slate-700'
                  }`}
                  title="Đo khoảng cách (Ruler)"
                >
                  <Ruler className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSelectAllRoute}
                  className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Xem toàn tuyến / Vừa khung hình"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* MAPLIBRE GL JS CONTAINER */}
            <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

            {/* MAP FLOATING BOTTOM OVERLAYS */}
            <div className="relative z-30 p-3 flex flex-col md:flex-row items-end justify-between gap-3 pointer-events-none">
              {/* Bottom Left: Engineering Cross-Section & Slabs HUD (Bảng thông số Kỹ thuật Mặt cắt 2 mép đường, Tấm & Khe) */}
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-xl text-white shadow-2xl flex flex-col gap-2.5 max-w-sm md:max-w-md w-full border border-slate-700/80 text-xs">
                {(() => {
                  const isAll = selectedSegmentId === 'ALL' || !selectedSegmentId
                  const currSeg = isAll ? null : (segments.find((s) => s.id === selectedSegmentId) || segments[0])
                  const totalRouteKm = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || (importedLengthKm || 25.0)
                  const avgRoadWidth = segments.length > 0
                    ? segments.reduce((acc, s) => acc + (s.roadWidthM || 8.0) * s.lengthKm, 0) / Math.max(0.001, totalRouteKm)
                    : 8.0
                  const currW = isAll ? avgRoadWidth : (currSeg?.roadWidthM || 8.0)
                  const halfW = (currW / 2).toFixed(1)
                  const slabLen = Math.max(1.0, slabLengthM || 5.0)
                  const targetLenKm = isAll ? totalRouteKm : (currSeg?.lengthKm || 1.0)
                  const targetLenM = targetLenKm * 1000
                  const estSlabs = Math.floor(targetLenM / slabLen) * 2

                  const contractionSpacing = Math.max(1.0, contractionSpacingM || 5.0)
                  const expansionSpacing = Math.max(5.0, expansionSpacingM || 50.0)
                  const estContraction = Math.floor(targetLenM / contractionSpacing)
                  const estExpansion = Math.floor(targetLenM / expansionSpacing)

                  return (
                    <>
                      {/* HUD Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-bold text-slate-100 text-xs tracking-wide uppercase flex items-center gap-1.5">
                            <span>Mặt Cắt Ngang & Thông Số Kỹ Thuật</span>
                            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                              v2.2
                            </span>
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-amber-300">
                          {isAll ? 'Toàn tuyến' : currSeg ? currSeg.code : 'Toàn tuyến'}
                        </span>
                      </div>

                      {/* 1. THÔNG SỐ 2 MÉP ĐƯỜNG & BỀ RỘNG W */}
                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">
                            {isAll ? 'Bề rộng mặt đường TB (W):' : 'Bề rộng mặt đường (W):'}
                          </span>
                          <span className="font-mono font-bold text-amber-400 text-xs">{currW.toFixed(1)} mét</span>
                        </div>

                        {/* Sơ đồ mặt cắt đồ họa trực quan (Visual Cross-Section Diagram) */}
                        <div className="relative mt-1 pt-4 pb-2 px-2 bg-slate-950 rounded border border-slate-800/80 flex flex-col items-center">
                          {/* Mũi tên cự ly kích thước tổng */}
                          <div className="absolute top-1 inset-x-2 flex items-center justify-between text-[9px] font-mono text-emerald-400">
                            <span>|←</span>
                            <span className="font-bold">W = {currW.toFixed(1)}m</span>
                            <span>→|</span>
                          </div>

                          {/* Dải mặt đường cắt ngang với 2 làn */}
                          <div className="w-full h-5 rounded flex items-center overflow-hidden border border-slate-600 bg-slate-800 text-[10px] font-mono font-bold">
                            <div className="flex-1 h-full bg-sky-950/80 border-r border-dashed border-white flex items-center justify-center text-sky-300">
                              Làn Trái ({halfW}m)
                            </div>
                            <div className="flex-1 h-full bg-amber-950/80 flex items-center justify-center text-amber-300">
                              Làn Phải ({halfW}m)
                            </div>
                          </div>

                          {/* Tọa độ 2 mép đường và tim tuyến */}
                          <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold mt-1.5 pt-1 border-t border-slate-800/80">
                            <span className="text-sky-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                              Mép Trái: -{halfW}m
                            </span>
                            <span className="text-slate-400 text-[9px]">CL (0.0m)</span>
                            <span className="text-amber-400 flex items-center gap-1">
                              Mép Phải: +{halfW}m
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. THÔNG SỐ TẤM BÊ TÔNG & KHE CO / KHE GIÃN NỞ */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <span>🧱 Mã & Kích thước tấm BTXM</span>
                          </span>
                          <span className="font-mono font-bold text-white text-xs">
                            {slabLengthM.toFixed(1)}m × {halfW}m × {slabThicknessCm}cm
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isAll ? 'Toàn tuyến: ' : 'Đoạn này: '}~<strong className="text-slate-200">{estSlabs.toLocaleString()} tấm</strong> ({isAll ? 'Toàn bộ 2 làn' : 'SLAB-001L/R'})
                          </span>
                        </div>

                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <span>⚡ Khe co & Khe giãn nở</span>
                          </span>
                          <span className="font-mono font-bold text-amber-400 text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                            Khe giãn: {expansionGapMm}mm (mỗi {expansionSpacingM}m)
                          </span>
                          <span className="font-mono text-sky-400 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                            Khe co: {contractionSpacingM}m (Dowel phi 25)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isAll ? 'Toàn tuyến: ' : 'Đoạn này: '}~<strong className="text-slate-200">{estContraction.toLocaleString()} khe co</strong> • ~<strong className="text-amber-300">{estExpansion.toLocaleString()} khe giãn</strong>
                          </span>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Bottom Right: GIS Map Legend */}
              <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-xl text-white shadow-xl flex flex-col gap-1.5 w-56 border border-slate-700/60 text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Chú giải bản đồ GIS
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1.5 rounded-full bg-[#C9A227]"></span>
                  <span className="text-slate-200 text-[11px]">Tim tuyến chính</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 rounded bg-sky-400 inline-block"></span>
                  <span className="text-sky-300 text-[11px]">Mép trái</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 rounded bg-amber-400 inline-block"></span>
                  <span className="text-amber-300 text-[11px]">Mép phải</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 rounded bg-[#38BDF8] inline-block"></span>
                  <span className="text-slate-200 text-[11px]">Khe co giãn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1.5 rounded bg-[#EF4444] inline-block"></span>
                  <span className="text-slate-200 text-[11px]">Khe giãn nở</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded border border-white/80 bg-slate-700 inline-block"></span>
                  <span className="text-slate-200 text-[11px]">Lưới tấm BTXM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 30%: Segment & Slab Partitioning Manager */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4 shadow-2xs border border-brand-border flex flex-col gap-3">
            {/* Tabs: Segments vs Road Width Profile vs Slabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setRightTab('SEGMENTS')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightTab === 'SEGMENTS'
                    ? 'bg-white text-brand-dark shadow-2xs'
                    : 'text-slate-500 hover:text-brand-dark'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5 text-[#C9A227]" />
                <span className="truncate">Phân đoạn</span>
                <span className="text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#C9A227]">
                  {segments.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('WIDTH_PROFILE')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightTab === 'WIDTH_PROFILE'
                    ? 'bg-white text-brand-dark shadow-2xs'
                    : 'text-slate-500 hover:text-brand-dark'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#C9A227]" />
                <span className="truncate">Bề rộng (m)</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  v2.2
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('SLABS')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightTab === 'SLABS'
                    ? 'bg-white text-brand-dark shadow-2xs'
                    : 'text-slate-500 hover:text-brand-dark'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-[#C9A227]" />
                <span className="truncate">Tấm & Khe</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  TCVN
                </span>
              </button>
            </div>

            {/* TAB CONTENT: SEGMENTS */}
            {rightTab === 'SEGMENTS' && (
              <>
                {/* Quick Split Module (Nhập cự ly tùy ý theo Km -> áp dụng ngay lập tức) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                      <SplitSquareVertical className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Chia đoạn theo cự ly Km</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      Tuyến dài: {importedLengthKm >= 1 ? `${importedLengthKm.toFixed(2)} km` : `${(importedLengthKm * 1000).toFixed(0)} m`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.05"
                        min="0.01"
                        max="50"
                        value={splitDistance}
                        onChange={(e) => setSplitDistance(parseFloat(e.target.value) || 0.1)}
                        className="w-full h-8.5 pl-3 pr-14 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                        placeholder="Nhập km..."
                      />
                      <span className="absolute right-2.5 text-[11px] text-slate-500 font-medium pointer-events-none">
                        km/đoạn
                      </span>
                    </div>

                    <select
                      value={splitSortOrder}
                      onChange={(e) => setSplitSortOrder(e.target.value as any)}
                      className="h-8.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    >
                      <option value="asc">Km tăng dần</option>
                      <option value="desc">Km giảm dần</option>
                    </select>
                  </div>

                  {/* Nút chọn nhanh cự ly mẫu (Presets) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">Mẫu:</span>
                    {[0.2, 0.25, 0.5, 1.0, 2.5, 5.0].map((kmVal) => (
                      <button
                        key={kmVal}
                        type="button"
                        onClick={() => {
                          setSplitDistance(kmVal)
                          setTimeout(() => handleApplyAutoSplit(), 50)
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                          splitDistance === kmVal
                            ? 'bg-[#C9A227] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-[#C9A227]'
                        }`}
                      >
                        {kmVal >= 1 ? `${kmVal}km` : `${kmVal * 1000}m`}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleApplyAutoSplit}
                      className="h-8.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Áp dụng chia đoạn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
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
                      className="h-8.5 rounded-lg border border-[#C9A227] text-[#8F7212] hover:bg-amber-50/60 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm đoạn mới</span>
                    </button>
                  </div>
                </div>

                {/* Segment List Stack */}
                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
                  {/* MỤC TOÀN TUYẾN (Dự án QL1A) */}
                  {(() => {
                    const isAllSelected = selectedSegmentId === 'ALL'
                    const totalLen = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || (importedLengthKm || 25.0)
                    const minKm = currentKmPoints[0] || (segments[0]?.startKm ?? 1020.0)
                    const maxKm = currentKmPoints[currentKmPoints.length - 1] || (segments[segments.length - 1]?.endKm ?? 1045.0)
                    const slabLen = Math.max(1.0, slabLengthM || 5.0)
                    const totalSlabsEst = Math.floor((totalLen * 1000) / slabLen) * 2

                    return (
                      <div
                        onClick={handleSelectAllRoute}
                        className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                          isAllSelected
                            ? 'bg-amber-50/70 border-[#C9A227] ring-2 ring-[#C9A227]/40 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-white bg-[#C9A227] flex items-center justify-center text-[9px] text-white font-bold">
                              ★
                            </span>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-brand-dark">Toàn Tuyến Tuyến Đường</span>
                                <span className="text-[10px] font-mono font-bold text-[#8F7212] bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200">
                                  {segments.length} phân đoạn
                                </span>
                              </div>
                              <span className="font-mono text-xs font-bold text-[#8F7212]">
                                Km {minKm.toFixed(3)} - Km {maxKm.toFixed(3)}
                              </span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAllSelected
                              ? 'bg-[#C9A227] text-white border-[#C9A227]'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isAllSelected ? 'Đang chọn' : 'Toàn tuyến'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px]">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-700">
                            Tổng dài: {totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${Math.round(totalLen * 1000)} mét`}
                          </span>
                          <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                            Quy mô: ~{totalSlabsEst.toLocaleString()} tấm BTXM
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">4 làn xe</span>
                        </div>
                      </div>
                    )
                  })()}

                  {segments.map((seg) => {
                    const isSelected = seg.id === selectedSegmentId
                    return (
                      <div
                        key={seg.id}
                        onClick={() => handleSelectSegment(seg)}
                        className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/50 border-[#C9A227] ring-2 ring-[#C9A227]/40 shadow-xs'
                            : seg.hasGap
                            ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: seg.color }}
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                            ></span>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-brand-dark">{seg.code}</span>
                              <span className="font-mono text-xs font-bold text-[#8F7212]">
                                Km {seg.startKm.toFixed(3)} - Km {seg.endKm.toFixed(3)}
                              </span>
                            </div>
                          </div>

                          {seg.hasGap ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              {seg.statusText}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                              {seg.statusText}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px]">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-700">
                            Dài: {seg.lengthKm >= 1 ? `${seg.lengthKm.toFixed(2)} km` : `${Math.round(seg.lengthKm * 1000)} mét`}
                          </span>
                          <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                            Rộng: {seg.roadWidthM || 8.0}m (±{((seg.roadWidthM || 8.0) / 2).toFixed(1)}m)
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.laneCount} làn</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.surfaceMaterial}</span>
                        </div>

                        {/* Cảnh báo khoảng hở & Nút nối tiếp giáp theo quy tắc v2.2 (WF-02.F04) */}
                        {seg.hasGap && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs mt-1">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              {seg.gapDistance && seg.gapDistance > 0
                                ? `Hở ${seg.gapDistance}m so với đoạn trước`
                                : `Chồng lấn ${Math.abs(seg.gapDistance || 0)}m`}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSnapSegment(seg.id)
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                              title="Khép kín khoảng hở với phân đoạn liền trước theo quy tắc v2.2"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Nối tiếp giáp</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-slate-500 text-xs border-t border-slate-100 mt-0.5">
                          {seg.hasGap ? (
                            <span className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Chưa khép kín
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Tiếp giáp khép kín
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {/* Nút Chỉnh sửa thông số / lý trình */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingSegment({ ...seg })
                              }}
                              className="p-1.5 hover:bg-amber-100/60 rounded-md text-slate-500 hover:text-[#8F7212] transition-colors cursor-pointer"
                              title="Chỉnh sửa lý trình & thông số"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Nút Tách phân đoạn này */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSplitModalSegment(seg)
                                setCustomSplitKm(parseFloat(((seg.startKm + seg.endKm) / 2).toFixed(3)))
                              }}
                              className="p-1.5 hover:bg-sky-100/60 rounded-md text-slate-500 hover:text-sky-700 transition-colors cursor-pointer"
                              title="Tách phân đoạn này tại mốc Km"
                            >
                              <SplitSquareVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Nút Xóa phân đoạn */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSegment(seg.id)
                              }}
                              className="p-1.5 hover:bg-red-100/60 rounded-md text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Xóa phân đoạn"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* TAB CONTENT: WIDTH_PROFILE (RoadWidthProfile theo v2.2 WF-02.F03 & Data Dictionary §9.1) */}
            {rightTab === 'WIDTH_PROFILE' && (
              <div className="flex flex-col gap-3">
                {/* Header Card */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Hồ sơ Bề rộng mặt đường (RoadWidthProfile)</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Chuẩn v2.2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Khai báo bề rộng mặt đường (mét) từng đoạn từ điểm A đến B. Hệ thống tự động tính bán rộng tim đường
                    (±W/2 mỗi bên) để vẽ tim đường trên bản đồ và phục vụ bay drone quét ranh giới hư hỏng.
                  </p>

                  {/* Thống kê diện tích và bình quân */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                    <div className="bg-white/80 p-2 rounded-lg border border-amber-100 flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold">Tổng diện tích mặt đường</span>
                      <span className="text-xs font-mono font-bold text-brand-dark">
                        {Math.round(
                          segments.reduce((acc, s) => acc + (s.lengthKm * 1000 * (s.roadWidthM || 8.0)), 0)
                        ).toLocaleString()} m²
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-amber-100 flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold">Bề rộng bình quân</span>
                      <span className="text-xs font-mono font-bold text-[#8F7212]">
                        {(
                          segments.reduce((acc, s) => acc + (s.lengthKm * (s.roadWidthM || 8.0)), 0) /
                          Math.max(0.001, segments.reduce((acc, s) => acc + s.lengthKm, 0))
                        ).toFixed(1)} m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danh sách các đoạn & ô nhập bề rộng trực tiếp */}
                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
                  {segments.map((seg) => {
                    const width = seg.roadWidthM || 8.0
                    const halfWidth = (width / 2).toFixed(1)
                    const areaM2 = Math.round(seg.lengthKm * 1000 * width)

                    return (
                      <div
                        key={seg.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col gap-2.5 ${
                          seg.id === selectedSegmentId
                            ? 'bg-amber-50/40 border-[#C9A227] ring-1 ring-[#C9A227]/30 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Header của đoạn: Tên + Lý trình */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: seg.color }}
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-brand-dark">{seg.code}</span>
                              <span className="font-mono text-xs font-bold text-[#8F7212]">
                                Km {seg.startKm.toFixed(3)} → Km {seg.endKm.toFixed(3)}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Dài: {seg.lengthKm >= 1 ? `${seg.lengthKm.toFixed(2)} km` : `${Math.round(seg.lengthKm * 1000)}m`}
                          </span>
                        </div>

                        {/* Ô nhập bề rộng mặt đường */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <span>Bề rộng mặt đường (W):</span>
                            </label>
                            <span className="text-[11px] font-mono font-bold text-brand-dark bg-white px-2 py-0.5 rounded border border-slate-200">
                              Trái ±{halfWidth}m | Phải ±{halfWidth}m
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                step="0.5"
                                min="2"
                                max="60"
                                value={width}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 3.0
                                  handleUpdateSegmentWidth(seg.id, val)
                                }}
                                className="w-full h-8 pl-3 pr-10 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                              />
                              <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400 pointer-events-none">
                                mét
                              </span>
                            </div>

                            {/* Preset Buttons for Leader's example: 3m, 4m, 6m, 8m, 10m */}
                            <div className="flex items-center gap-1">
                              {[3.0, 4.0, 6.0, 8.0, 10.0].map((wVal) => (
                                <button
                                  key={wVal}
                                  type="button"
                                  onClick={() => handleUpdateSegmentWidth(seg.id, wVal)}
                                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                                    width === wVal
                                      ? 'bg-[#C9A227] text-white shadow-2xs'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#C9A227]'
                                  }`}
                                  title={`Đặt bề rộng đoạn này là ${wVal}m`}
                                >
                                  {wVal}m
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>Diện tích bề mặt bảo hành:</span>
                            <span className="font-mono font-bold text-slate-700">{areaM2.toLocaleString()} m²</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Công cụ áp dụng nhanh cho toàn tuyến */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Đặt nhanh tất cả các đoạn:</span>
                  <div className="flex items-center gap-1">
                    {[3.0, 4.0, 6.0, 8.0, 10.0].map((wVal) => (
                      <button
                        key={wVal}
                        type="button"
                        onClick={() => {
                          const updated = segments.map((s) => ({ ...s, roadWidthM: wVal }))
                          setSegments(updated)
                          syncMapDataDirect(updated, selectedSegmentId)
                          showToast(`Đã cập nhật tất cả phân đoạn bề rộng ${wVal}m!`)
                        }}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-[#C9A227] text-slate-700 text-[10px] font-mono font-bold transition-all cursor-pointer"
                      >
                        Đồng loạt {wVal}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SLABS & JOINTS CONFIGURATION & VIEWER (PM Tự chỉnh sửa Tấm & Khe BTXM) */}
            {rightTab === 'SLABS' && (
              <div className="flex flex-col gap-3">
                {/* 1. Header Card: Thiết lập Tấm & Khe BTXM */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Cấu Hình Tấm & Khe Nối BTXM</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      PM Tự chỉnh sửa
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Chỉ huy trưởng (PM) có thể tùy chỉnh kích thước từng tấm bê tông, cự ly cưa cắt khe co giãn và khe giãn nở nhiệt theo hồ sơ thiết kế thi công. Bản đồ và bảng thông số sẽ tự động cập nhật ngay lập tức.
                  </p>

                  {/* THIẾT LẬP KÍCH THƯỚC TẤM BÊ TÔNG */}
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <span>🧱 Kích thước tấm BTXM (Dài × Dày):</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#8F7212] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {slabLengthM.toFixed(1)}m × {slabThicknessCm}cm
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                          Chiều dài tấm L (m):
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.5"
                            min="2.0"
                            max="12.0"
                            value={slabLengthM}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 5.0
                              setSlabLengthM(val)
                              if (syncJointWithSlab) setContractionSpacingM(val)
                            }}
                            className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                          />
                          <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                          Chiều dày tấm H (cm):
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="1"
                            min="15"
                            max="45"
                            value={slabThicknessCm}
                            onChange={(e) => setSlabThicknessCm(parseInt(e.target.value) || 26)}
                            className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                          />
                          <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">cm</span>
                        </div>
                      </div>
                    </div>

                    {/* Presets chiều dài tấm */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">Mẫu L:</span>
                      {[4.0, 4.5, 5.0, 6.0].map((lVal) => (
                        <button
                          key={lVal}
                          type="button"
                          onClick={() => {
                            setSlabLengthM(lVal)
                            if (syncJointWithSlab) setContractionSpacingM(lVal)
                            showToast(`Đã đổi chiều dài tấm: ${lVal}m`)
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            slabLengthM === lVal
                              ? 'bg-[#C9A227] text-white shadow-2xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#C9A227]'
                          }`}
                        >
                          {lVal.toFixed(1)}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* THIẾT LẬP KHE CO GIÃN & KHE GIÃN NỞ */}
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <span>⚡ Cự ly Khe co giãn & Khe giãn nở:</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-semibold text-slate-600 block">
                            Khoảng cách Khe co (m):
                          </label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.5"
                            min="2.0"
                            max="12.0"
                            value={contractionSpacingM}
                            onChange={(e) => setContractionSpacingM(parseFloat(e.target.value) || 5.0)}
                            className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                          />
                          <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                          Khoảng cách Khe giãn (m):
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="5"
                            min="20"
                            max="300"
                            value={expansionSpacingM}
                            onChange={(e) => setExpansionSpacingM(parseFloat(e.target.value) || 50.0)}
                            className="w-full h-8 pl-2.5 pr-8 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                          />
                          <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">mét</span>
                        </div>
                      </div>
                    </div>

                    {/* Presets Khe giãn nở */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">Khe giãn:</span>
                      {[30, 50, 60, 100, 150].map((expVal) => (
                        <button
                          key={expVal}
                          type="button"
                          onClick={() => {
                            setExpansionSpacingM(expVal)
                            showToast(`Đã đổi khoảng cách khe giãn nở: ${expVal}m`)
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            expansionSpacingM === expVal
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-amber-500'
                          }`}
                        >
                          {expVal}m
                        </button>
                      ))}
                    </div>

                    {/* Độ mở khe giãn nở mm */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-600 font-medium">Bề rộng đệm khe giãn:</span>
                      <div className="flex items-center gap-1">
                        {[15, 20, 25, 30].map((gapVal) => (
                          <button
                            key={gapVal}
                            type="button"
                            onClick={() => {
                              setExpansionGapMm(gapVal)
                              showToast(`Đã đổi độ mở khe giãn: ${gapVal}mm`)
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                              expansionGapMm === gapVal
                                ? 'bg-red-600 text-white shadow-2xs'
                                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-red-500'
                            }`}
                          >
                            {gapVal}mm
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động nhanh */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setSlabLengthM(5.0)
                        setSlabThicknessCm(26)
                        setContractionSpacingM(5.0)
                        setExpansionSpacingM(50.0)
                        setExpansionGapMm(20)
                        showToast('Đã khôi phục quy cách TCVN: 5.0m × 26cm • Khe co 5m • Khe giãn 50m (20mm)')
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer"
                    >
                      Khôi phục TCVN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        syncMapDataDirect(segments, selectedSegmentId, currentCoords, currentKmPoints, {
                          slabLenM: slabLengthM,
                          thicknessCm: slabThicknessCm,
                          contractionSpacingM: contractionSpacingM,
                          expansionSpacingM: expansionSpacingM,
                          expansionGapMm: expansionGapMm
                        })
                        showToast('Đã áp dụng ngay quy cách Tấm & Khe BTXM lên toàn tuyến!')
                      }}
                      className="px-3 py-1 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1 active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Áp dụng toàn tuyến</span>
                    </button>
                  </div>
                </div>

                {/* 2. Thống kê số lượng tấm & khe nối trên toàn tuyến hoặc phân đoạn đang chọn */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span>
                        {selectedSegmentId === 'ALL' || !selectedSegmentId
                          ? 'Ước tính tấm BTXM toàn tuyến: '
                          : `Ước tính tấm BTXM ${segments.find((s) => s.id === selectedSegmentId)?.code || 'phân đoạn'}: `}
                      </span>
                      <strong className="text-slate-900 font-mono">
                        {(() => {
                          const isAll = selectedSegmentId === 'ALL' || !selectedSegmentId
                          const currSeg = isAll ? null : segments.find((s) => s.id === selectedSegmentId)
                          const targetKm = isAll
                            ? (segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || importedLengthKm || 25.0)
                            : (currSeg?.lengthKm || 1.0)
                          const count = Math.floor((targetKm * 1000) / Math.max(1.0, slabLengthM)) * 2
                          return `${count.toLocaleString()} tấm`
                        })()}
                      </strong>
                      <span className="text-slate-500"> (2 làn xe)</span>
                    </div>
                    <span className="font-mono text-[#8F7212] font-bold">
                      {slabLengthM.toFixed(1)}m × {slabThicknessCm}cm
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] text-slate-600">
                    <div>
                      <span>Tổng hợp khe nối: </span>
                      {(() => {
                        const isAll = selectedSegmentId === 'ALL' || !selectedSegmentId
                        const currSeg = isAll ? null : segments.find((s) => s.id === selectedSegmentId)
                        const targetKm = isAll
                          ? (segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || importedLengthKm || 25.0)
                          : (currSeg?.lengthKm || 1.0)
                        const targetM = targetKm * 1000
                        const cCount = Math.floor(targetM / Math.max(1.0, contractionSpacingM))
                        const eCount = Math.floor(targetM / Math.max(5.0, expansionSpacingM))
                        return (
                          <>
                            <strong className="text-sky-700 font-mono">~{cCount.toLocaleString()} khe co</strong>
                            <span> (mỗi {contractionSpacingM}m) • </span>
                            <strong className="text-amber-700 font-mono">~{eCount.toLocaleString()} khe giãn</strong>
                            <span> ({expansionGapMm}mm, mỗi {expansionSpacingM}m)</span>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* 3. Danh sách các tấm bê tông (Nội suy động theo phân đoạn & kích thước L) */}
                <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-0.5">
                  {displayedSlabs.map((slab) => (
                    <div
                      key={slab.id}
                      onClick={() => showToast(`Đã định vị tấm ${slab.id} tại ${slab.stationing}`)}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-[#C9A227] bg-white transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800">{slab.id}</span>
                          <span className="text-[10px] text-slate-500">({slab.segmentCode})</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">
                          {slab.stationing} • {slab.lengthM.toFixed(1)}m × {slab.widthM.toFixed(1)}m × {slab.thicknessCm}cm
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            slab.status === 'GOOD'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : slab.status === 'CRACKED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {slab.status === 'GOOD' ? 'Tốt' : slab.status === 'CRACKED' ? 'Nứt' : 'Lún'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Statistics Footer */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-slate-200">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-brand-dark font-mono">
                    {(() => {
                      const totalLen = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0)
                      const displayLen = totalLen > 0 ? totalLen : (importedLengthKm || 25.0)
                      return displayLen >= 1
                        ? `${displayLen.toFixed(displayLen >= 10 ? 1 : 2)} km`
                        : `${Math.round(displayLen * 1000)} mét`
                    })()}
                  </span>
                  <span className="text-[10px] text-slate-500">Tổng chiều dài</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-brand-dark font-mono">{segments.length} đoạn</span>
                  <span className="text-[10px] text-slate-500">Phân đoạn</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold font-mono ${segments.some((s) => s.hasGap) ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                    {segments.some((s) => s.hasGap) ? 'Cảnh báo hở' : 'Đạt chuẩn'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {segments.some((s) => s.hasGap) ? 'Cần khép kín' : 'Sẵn sàng duyệt'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-slate-500 text-[11px] leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                <span>
                  Trạng thái <strong>CONFIRMED</strong> sẽ gắn hàm băm SHA-256 bất biến phục vụ nghiệm thu bảo hành.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
