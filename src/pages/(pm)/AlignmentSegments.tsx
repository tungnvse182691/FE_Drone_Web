import React, { useState, useEffect, useRef } from 'react'
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
  Eye
} from 'lucide-react'

// Interface cho Phân đoạn tuyến (Segment)
interface SegmentItem {
  id: string
  code: string
  startKm: number
  endKm: number
  lengthKm: number
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

  // Trạng thái tim tuyến: 'DRAFT' | 'CONFIRMED'
  const [alignmentStatus, setAlignmentStatus] = useState<'DRAFT' | 'CONFIRMED'>('DRAFT')

  // Trạng thái Map View: 'SATELLITE' | 'VECTOR' | 'PLANNING'
  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'VECTOR' | 'PLANNING'>('SATELLITE')

  // Trạng thái các Tab quản lý bên phải: 'SEGMENTS' | 'SLABS'
  const [rightTab, setRightTab] = useState<'SEGMENTS' | 'SLABS'>('SEGMENTS')

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

  // Modal nạp file GeoJSON / KML
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Danh sách tọa độ và mốc km chuẩn của dự án (Km 1020 - Km 1045)
  const [currentCoords, setCurrentCoords] = useState<[number, number][]>(ROUTE_COORDINATES)
  const [currentKmPoints, setCurrentKmPoints] = useState<number[]>(ROUTE_KM_POINTS)
  const [importedFileName, setImportedFileName] = useState<string | null>(null)
  const [importedLengthKm, setImportedLengthKm] = useState<number>(25.0)

  // Live cursor position
  const [cursorPos, setCursorPos] = useState({
    lng: 108.1651,
    lat: 16.2052,
    station: 'Km 1030+000',
    elevation: '+14.2m'
  })

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Danh sách Phân đoạn chuẩn theo thiết kế
  const [segments, setSegments] = useState<SegmentItem[]>([
    {
      id: 'seg-1',
      code: 'Phân đoạn #01',
      startKm: 1020.0,
      endKm: 1025.0,
      lengthKm: 5.0,
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
      status: 'VALID',
      statusText: 'HỢP LỆ (Valid)',
      laneCount: 4,
      surfaceMaterial: 'Mặt BTN C19',
      color: SEGMENT_COLORS[2]
    }
  ])

  // Danh sách tấm Slab
  const [slabs, setSlabs] = useState<SlabItem[]>(generateMockSlabs(3))

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
      // 1. Thêm GeoJSON Source cho các phân đoạn
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

      // 4. Layers: Đoạn đang chọn Highlight (Viền Halo phát sáng vàng nằm DƯỚI tim đường, ôm sát viền)
      if (!map.getLayer('segments-highlight-layer')) {
        map.addLayer({
          id: 'segments-highlight-layer',
          type: 'line',
          source: 'segments-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#FBBF24',
            'line-width': [
              'interpolate',
              ['exponential', 1.5],
              ['zoom'],
              6, 7,
              9, 11,
              11, 15,
              14, 25,
              16, 42,
              18, 70,
              20, 106
            ],
            'line-opacity': ['case', ['get', 'isSelected'], 0.8, 0]
          }
        })
      }

      // 5. Layers: Viền bóng tim tuyến phân đoạn (Tự động phóng to theo tỷ lệ zoom bản đồ)
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
              6, 4,
              9, 7,
              11, 11,
              14, 20,
              16, 36,
              18, 64,
              20, 96
            ],
            'line-opacity': 0.95
          }
        })
      }

      // 6. Layers: Đường phân đoạn đa màu (Tự động phóng to theo zoom để quan sát rõ mặt đường)
      if (!map.getLayer('segments-main-layer')) {
        map.addLayer({
          id: 'segments-main-layer',
          type: 'line',
          source: 'segments-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': [
              'interpolate',
              ['exponential', 1.5],
              ['zoom'],
              6, 2.5,
              9, 5,
              11, 8,
              14, 15,
              16, 28,
              18, 52,
              20, 80
            ]
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
              14, 3,
              16, 5,
              18, 7,
              20, 10
            ],
            'line-dasharray': [3, 2],
            'line-opacity': 0.98
          }
        })
      }

      // 8. Click vào line phân đoạn trên map để chọn
      map.on('click', 'segments-main-layer', (e: maplibregl.MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0) return
        const segId = e.features[0].properties?.id
        const segCode = e.features[0].properties?.code
        const segStart = e.features[0].properties?.startKm
        const segEnd = e.features[0].properties?.endKm
        const segLen = e.features[0].properties?.lengthKm

        if (segId) {
          setSelectedSegmentId(segId)
          if (popupRef.current) popupRef.current.remove()
          popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2 text-xs font-sans">
                <div class="font-bold text-slate-900">${segCode}</div>
                <div class="text-[#8F7212] font-mono font-semibold">Km ${Number(segStart).toFixed(3)} - Km ${Number(segEnd).toFixed(3)}</div>
                <div class="text-slate-500 mt-1">Chiều dài: ${Number(segLen).toFixed(1)} km • 4 làn xe</div>
              </div>
            `)
            .addTo(map)
        }
      })

      // Con trỏ pointer khi hover qua tuyến
      map.on('mouseenter', 'segments-main-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'segments-main-layer', () => {
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

  // 2. Đồng bộ GeoJSON và Markers mỗi khi segments, selection hoặc tọa độ thay đổi
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    const syncMapData = () => {
      // Cập nhật GeoJSON Phân đoạn
      const segSource = map.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSource) {
        segSource.setData(buildSegmentsGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId))
      }

      // Cập nhật GeoJSON Hành lang quy hoạch 30m
      const planSource = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
      if (planSource) {
        planSource.setData(buildPlanningCorridorGeoJSON(currentCoords))
      }

      // Cập nhật Markers mốc lý trình trên bản đồ
      renderMarkers(map, segments, currentCoords, currentKmPoints)
    }

    if (map.isStyleLoaded()) {
      syncMapData()
    } else {
      map.once('load', syncMapData)
      map.once('styledata', syncMapData)
    }
  }, [segments, selectedSegmentId, currentCoords, currentKmPoints])

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
          color: seg.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length] || '#0284C7',
          isSelected: seg.id === activeSegId
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

  // Helper build GeoJSON cho Hành lang quy hoạch 30m (~15m mỗi bên)
  function buildPlanningCorridorGeoJSON(coords: [number, number][]): GeoJSON.FeatureCollection {
    const offset = 0.00015
    const topCoords = coords.map((c) => [c[0] + offset, c[1] + offset] as [number, number])
    const bottomCoords = [...coords].reverse().map((c) => [c[0] - offset, c[1] - offset] as [number, number])
    const polygon = [...topCoords, ...bottomCoords, topCoords[0]]

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Hành lang an toàn quy hoạch 30m' },
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

    setSegments(newSegments)
    setSlabs(generateMockSlabs(newSegments.length))
    setSelectedSegmentId(newSegments[0]?.id || null)

    // Cập nhật ngay lập tức lên MapLibre
    if (mapRef.current) {
      const map = mapRef.current
      const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSrc) {
        segSrc.setData(buildSegmentsGeoJSON(newSegments, currentCoords, currentKmPoints, newSegments[0]?.id || null))
      }
      renderMarkers(map, newSegments, currentCoords, currentKmPoints)
    }

    const distText = dist >= 1 ? `${dist.toFixed(2)} km` : `${(dist * 1000).toFixed(0)} m`
    showToast(`Đã chia tuyến thành ${newSegments.length} phân đoạn (${distText}/đoạn). Tuyến đường hiển thị liên tục chuẩn thiết kế!`)
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
      lengthKm: updatedLength
    }

    const updatedList = segments.map((s) => (s.id === updated.id ? updated : s)).sort((a, b) => a.startKm - b.startKm)
    setSegments(updatedList)

    if (mapRef.current) {
      const segSrc = mapRef.current.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSrc) {
        segSrc.setData(buildSegmentsGeoJSON(updatedList, currentCoords, currentKmPoints, updated.id))
      }
      renderMarkers(mapRef.current, updatedList, currentCoords, currentKmPoints)
    }

    showToast(`Đã lưu cập nhật ${updated.code} (Km ${start.toFixed(3)} - Km ${end.toFixed(3)})`)
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
      status: 'VALID',
      statusText: 'HỢP LỆ (Valid)',
      laneCount: newSegForm.laneCount || 4,
      surfaceMaterial: newSegForm.surfaceMaterial || 'Mặt BTN C12.5',
      color: newSegForm.color || SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length]
    }

    const updatedList = [...segments, newSeg].sort((a, b) => a.startKm - b.startKm)
    setSegments(updatedList)
    setSelectedSegmentId(newSeg.id)

    if (mapRef.current) {
      const segSrc = mapRef.current.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSrc) {
        segSrc.setData(buildSegmentsGeoJSON(updatedList, currentCoords, currentKmPoints, newSeg.id))
      }
      renderMarkers(mapRef.current, updatedList, currentCoords, currentKmPoints)
    }

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
      color: splitModalSegment.color
    }

    const segB: SegmentItem = {
      ...splitModalSegment,
      id: `seg-${Date.now()}-B`,
      code: `${splitModalSegment.code}B`,
      startKm: splitKm,
      endKm: splitModalSegment.endKm,
      lengthKm: parseFloat((splitModalSegment.endKm - splitKm).toFixed(3)),
      color: SEGMENT_COLORS[(segIndex + 1) % SEGMENT_COLORS.length]
    }

    const updatedList = [
      ...segments.slice(0, segIndex),
      segA,
      segB,
      ...segments.slice(segIndex + 1)
    ]

    setSegments(updatedList)
    setSelectedSegmentId(segA.id)

    if (mapRef.current) {
      const segSrc = mapRef.current.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSrc) {
        segSrc.setData(buildSegmentsGeoJSON(updatedList, currentCoords, currentKmPoints, segA.id))
      }
      renderMarkers(mapRef.current, updatedList, currentCoords, currentKmPoints)
    }

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
    setSegments(updatedList)
    if (selectedSegmentId === segId) {
      setSelectedSegmentId(updatedList[0]?.id || null)
    }

    if (mapRef.current) {
      const segSrc = mapRef.current.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSrc) {
        segSrc.setData(buildSegmentsGeoJSON(updatedList, currentCoords, currentKmPoints, updatedList[0]?.id || null))
      }
      renderMarkers(mapRef.current, updatedList, currentCoords, currentKmPoints)
    }

    showToast('Đã xóa phân đoạn khỏi danh sách tuyến!')
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
        const kmPts: number[] = [1020.0]
        for (let i = 0; i < extracted.length - 1; i++) {
          const d = calculateHaversineKm(extracted[i], extracted[i + 1])
          totalLen += d
          kmPts.push(Number((1020.0 + totalLen).toFixed(3)))
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
        let cur = 1020.0
        for (let i = 1; i <= count; i++) {
          const next = i === count ? 1020.0 + totalLen : Math.min(cur + dist, 1020.0 + totalLen)
          newSegs.push({
            id: `seg-${i}`,
            code: `Phân đoạn #${String(i).padStart(2, '0')}`,
            startKm: parseFloat(cur.toFixed(3)),
            endKm: parseFloat(next.toFixed(3)),
            lengthKm: parseFloat((next - cur).toFixed(3)),
            status: 'VALID',
            statusText: 'HỢP LỆ (Valid)',
            laneCount: 4,
            surfaceMaterial: i % 2 === 0 ? 'Mặt BTN C19' : 'Mặt BTN C12.5',
            color: SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
          })
          cur = next
        }

        setSegments(newSegs)
        setSlabs(generateMockSlabs(newSegs.length))
        setSelectedSegmentId(newSegs[0]?.id || null)
        setIsImportModalOpen(false)

        // Cập nhật trực tiếp lên MapLibre ngay lập tức
        if (mapRef.current) {
          const map = mapRef.current
          const bounds = new maplibregl.LngLatBounds()
          extracted.forEach((c) => bounds.extend(c))
          map.fitBounds(bounds, { padding: 80, speed: 1.2 })

          const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
          if (segSrc) {
            segSrc.setData(buildSegmentsGeoJSON(newSegs, extracted, kmPts, newSegs[0]?.id || null))
          }
          const planSrc = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
          if (planSrc) {
            planSrc.setData(buildPlanningCorridorGeoJSON(extracted))
          }
          renderMarkers(map, newSegs, extracted, kmPts)
        }

        const lenText = totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${(totalLen * 1000).toFixed(0)} m`
        showToast(`Đã nạp tim tuyến [${file.name}]: ${extracted.length} đỉnh, chiều dài ${lenText}, chia ${newSegs.length} phân đoạn!`)
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
    }
  }

  // PM Trình duyệt tim tuyến
  const handleSubmitAlignment = () => {
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
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
      })
      cur = next
    }
    setSegments(newSegs)
    setSlabs(generateMockSlabs(newSegs.length))
    setSelectedSegmentId(newSegs[0]?.id || null)
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

      {/* Modal nạp file GeoJSON / KML */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">Nhập Dữ Liệu Tim Tuyến (GeoJSON / KML)</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Chọn mẫu tim tuyến chuẩn trắc địa WGS84 hoặc tải lên tệp GeoJSON / KML từ máy trạm:
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
                Nhấp để chọn tệp hoặc kéo thả tệp GeoJSON / KML vào đây
              </span>
              <span className="text-[11px] text-slate-500">
                Hỗ trợ LineString GeoJSON (.geojson, .json) hệ WGS84 (EPSG:4326)
              </span>
              <span className="text-[10px] font-mono text-[#8F7212] bg-white px-2 py-0.5 rounded border border-amber-200 mt-1">
                Tự động nhận diện chuỗi tọa độ, tính lý trình và vẽ tim tuyến tức thì
              </span>
            </div>

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

          {/* Project Title & Metadata Pills */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <h1 className="text-lg font-bold text-brand-dark tracking-tight">
              Quản Lý Hình Học Tuyến & Phân Đoạn Lý Trình
            </h1>
            <span className="hidden lg:inline text-slate-300">|</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Building className="w-3.5 h-3.5 text-[#C9A227]" />
              {importedFileName ? `Tuyến: ${importedFileName}` : 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              L = {importedLengthKm.toFixed(1)} km (Km 1020 - Km {(1020 + importedLengthKm).toFixed(1)})
            </span>
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500">
              <Compass className="w-3.5 h-3.5 text-[#C9A227]" />
              VN-2000 (WGS84 EPSG:4326)
            </span>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            type="button"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhập GeoJSON/KML</span>
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
                  onClick={handleFitBounds}
                  className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Vừa khung hình toàn tuyến"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* MAPLIBRE GL JS CONTAINER */}
            <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

            {/* MAP FLOATING BOTTOM OVERLAYS */}
            <div className="relative z-30 p-3 flex flex-col md:flex-row items-end justify-between gap-3 pointer-events-none">
              {/* Bottom Left: Map Legend */}
              <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-xl text-white shadow-xl flex flex-col gap-1.5 w-60 border border-slate-700/60 text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Chú giải bản đồ GIS (MapLibre)
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1.5 rounded-full bg-[#C9A227]"></span>
                  <span className="text-slate-200 text-[11px]">Tim tuyến chính QL1A</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-white border-2 border-[#C9A227] inline-block"></span>
                  <span className="text-slate-200 text-[11px]">Mốc lý trình km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-2 rounded bg-sky-400 border border-sky-300 inline-block"></span>
                  <span className="text-slate-200 text-[11px]">Các phân đoạn màu riêng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 30%: Segment & Slab Partitioning Manager */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4 shadow-2xs border border-brand-border flex flex-col gap-3">
            {/* Tabs: Segments vs Slabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setRightTab('SEGMENTS')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  rightTab === 'SEGMENTS'
                    ? 'bg-white text-brand-dark shadow-2xs'
                    : 'text-slate-500 hover:text-brand-dark'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Danh sách Phân đoạn</span>
                <span className="text-white text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#C9A227]">
                  {segments.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('SLABS')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  rightTab === 'SLABS'
                    ? 'bg-white text-brand-dark shadow-2xs'
                    : 'text-slate-500 hover:text-brand-dark'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tấm Slab</span>
                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  860
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

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            {seg.statusText}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px]">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-700">
                            Dài: {seg.lengthKm >= 1 ? `${seg.lengthKm.toFixed(2)} km` : `${Math.round(seg.lengthKm * 1000)} mét`}
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.laneCount} làn xe</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.surfaceMaterial}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-slate-500 text-xs border-t border-slate-100 mt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Tiếp giáp khép kín
                          </span>
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

            {/* TAB CONTENT: SLABS */}
            {rightTab === 'SLABS' && (
              <div className="flex flex-col gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Tổng số: <strong>860 tấm</strong> bê tông xi măng</span>
                  <span className="font-mono text-[#8F7212] font-bold">5.0m x 3.75m</span>
                </div>

                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
                  {slabs.map((slab) => (
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
                        <span className="font-mono text-[11px] text-slate-600">{slab.stationing}</span>
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
                  <span className="text-sm font-bold text-brand-dark font-mono">25.0 km</span>
                  <span className="text-[10px] text-slate-500">Tổng chiều dài</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-brand-dark font-mono">{segments.length} đoạn</span>
                  <span className="text-[10px] text-slate-500">Phân đoạn</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold font-mono text-emerald-600">
                    Đạt chuẩn
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sẵn sàng duyệt
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
