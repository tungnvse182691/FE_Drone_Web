import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
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
  const result: [number, number][] = []
  result.push(interpolateCoordAtKm(startKm, coords, kmPoints))

  for (let i = 0; i < kmPoints.length; i++) {
    if (kmPoints[i] > startKm && kmPoints[i] < endKm) {
      result.push(coords[i])
    }
  }

  result.push(interpolateCoordAtKm(endKm, coords, kmPoints))
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

  // Chế độ đo khoảng cách (Ruler)
  const [rulerActive, setRulerActive] = useState<boolean>(false)
  const [rulerPoints, setRulerPoints] = useState<[number, number][]>([])

  // Modal nạp file GeoJSON / KML
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)

  // Danh sách tọa độ và mốc km chuẩn của dự án (Km 1020 - Km 1045)
  const currentCoords = ROUTE_COORDINATES
  const currentKmPoints = ROUTE_KM_POINTS

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

    // Cấu hình Style đa nguồn bản đồ chuẩn (cho phép overscale không bị mất map khi zoom sát)
    const osmRasterStyle: maplibregl.StyleSpecification = {
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
          maxzoom: 20, // Ảnh vệ tinh Google độ nét cao hỗ trợ đến zoom 20 không bị dính watermark 'Map data not yet available'
          attribution: '&copy; Google Satellite Imagery'
        },
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          maxzoom: 19, // Báo cho MapLibre tự động overscale khi zoom > 19
          attribution: '&copy; OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'satellite-tiles-layer',
          type: 'raster',
          source: 'satellite-tiles',
          layout: {
            visibility: mapLayer === 'SATELLITE' || mapLayer === 'PLANNING' ? 'visible' : 'none'
          },
          minzoom: 0,
          maxzoom: 24 // Giữ hiển thị liên tục kể cả khi người dùng zoom sát sạt mặt đường
        },
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          layout: {
            visibility: mapLayer === 'VECTOR' ? 'visible' : 'none'
          },
          minzoom: 0,
          maxzoom: 24 // Giữ hiển thị liên tục
        }
      ]
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: osmRasterStyle,
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
      map.addSource('segments-source', {
        type: 'geojson',
        data: buildSegmentsGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId)
      })

      // 2. Thêm GeoJSON Source cho hành lang quy hoạch 30m (Planning corridor)
      map.addSource('planning-corridor-source', {
        type: 'geojson',
        data: buildPlanningCorridorGeoJSON(currentCoords)
      })

      // 2. Thêm GeoJSON Source cho hành lang quy hoạch 30m (Planning corridor)
      map.addSource('planning-corridor-source', {
        type: 'geojson',
        data: buildPlanningCorridorGeoJSON(currentCoords)
      })

      // 3. Layers: Hành lang quy hoạch (Ẩn mặc định, bật khi chọn tab Planning)
      map.addLayer({
        id: 'planning-corridor-layer',
        type: 'fill',
        source: 'planning-corridor-source',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': '#F59E0B',
          'fill-opacity': 0.15,
          'fill-outline-color': '#D97706'
        }
      })

      // 4. Layers: Viền bóng tim tuyến phân đoạn (Tự động phóng to theo tỷ lệ zoom bản đồ)
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
            20, 100
          ],
          'line-opacity': 0.85
        }
      })

      // 5. Layers: Đường phân đoạn đa màu (Tự động phóng to theo zoom để quan sát rõ mặt đường)
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
            20, 84
          ]
        }
      })

      // 6. Layers: Vạch đứt tim đường (Tự động nở to theo zoom)
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
            18, 8,
            20, 12
          ],
          'line-dasharray': [3, 2],
          'line-opacity': 0.95
        }
      })

      // 7. Layers: Đoạn đang chọn Highlight (Glow vàng nở to theo zoom)
      map.addLayer({
        id: 'segments-highlight-layer',
        type: 'line',
        source: 'segments-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#FDE047',
          'line-width': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            6, 6,
            11, 14,
            14, 26,
            16, 44,
            18, 76,
            20, 116
          ],
          'line-opacity': ['case', ['get', 'isSelected'], 0.65, 0]
        }
      })

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

  // 2. Đồng bộ GeoJSON và Markers mỗi khi segments hoặc selection thay đổi
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    if (map.isStyleLoaded()) {
      // Cập nhật GeoJSON Phân đoạn
      const segSource = map.getSource('segments-source') as maplibregl.GeoJSONSource
      if (segSource) {
        segSource.setData(buildSegmentsGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId))
      }

      // Cập nhật Markers mốc lý trình trên bản đồ
      renderMarkers(map, segments, currentCoords, currentKmPoints)
    }
  }, [segments, selectedSegmentId])

  // 3. Chuyển đổi lớp bản đồ (Vệ tinh / Vector / Quy hoạch)
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (!map.isStyleLoaded()) return

    // Bật/tắt giữa ảnh vệ tinh và bản đồ vector OSM
    if (map.getLayer('satellite-tiles-layer')) {
      map.setLayoutProperty(
        'satellite-tiles-layer',
        'visibility',
        mapLayer === 'SATELLITE' || mapLayer === 'PLANNING' ? 'visible' : 'none'
      )
    }

    if (map.getLayer('osm-tiles-layer')) {
      map.setLayoutProperty(
        'osm-tiles-layer',
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

    // 1. Marker các đầu phân đoạn
    segList.forEach((seg) => {
      const coord = interpolateCoordAtKm(seg.startKm, coords, kmPts)
      const el = document.createElement('div')
      el.className = 'flex flex-col items-center cursor-pointer group'
      el.innerHTML = `
        <div style="background-color: ${seg.color}; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);" 
             class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold transition-transform group-hover:scale-125">
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold shadow-md whitespace-nowrap">
          Km ${seg.startKm.toFixed(0)}
        </div>
      `
      el.addEventListener('click', () => {
        setSelectedSegmentId(seg.id)
        showToast(`Đã chọn ${seg.code} (Km ${seg.startKm.toFixed(3)} - Km ${seg.endKm.toFixed(3)})`)
      })

      const marker = new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map)
      markersRef.current.push(marker)
    })

    // Marker điểm cuối tuyến (Km 1045)
    const endCoord = coords[coords.length - 1]
    const endEl = document.createElement('div')
    endEl.className = 'flex flex-col items-center'
    endEl.innerHTML = `
      <div style="background-color: #C9A227; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);" 
           class="w-4 h-4 rounded-full"></div>
      <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold shadow-md">
        Km 1045
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
    const features: GeoJSON.Feature[] = segList.map((seg) => {
      const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)

      return {
        type: 'Feature',
        properties: {
          id: seg.id,
          code: seg.code,
          startKm: seg.startKm,
          endKm: seg.endKm,
          lengthKm: seg.lengthKm,
          color: seg.color,
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

  // Helper build GeoJSON cho Hành lang quy hoạch 30m
  function buildPlanningCorridorGeoJSON(coords: [number, number][]): GeoJSON.FeatureCollection {
    const offset = 0.003
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
    const totalKm = 25.0
    const startBaseKm = 1020.0
    const dist = Math.max(1, Math.min(splitDistance, 15))

    const newSegments: SegmentItem[] = []
    let currentKm = startBaseKm
    let idx = 1

    while (currentKm < startBaseKm + totalKm) {
      const nextKm = Math.min(currentKm + dist, startBaseKm + totalKm)
      const len = parseFloat((nextKm - currentKm).toFixed(2))

      newSegments.push({
        id: `seg-${idx}`,
        code: `Phân đoạn #${String(idx).padStart(2, '0')}`,
        startKm: currentKm,
        endKm: nextKm,
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

    showToast(`Đã chia thành ${newSegments.length} phân đoạn (${dist} km/đoạn). Tuyến đường hiển thị liên tục chuẩn thiết kế!`)
    handleFitBounds()
  }

  // Reset góc nhìn vừa khung hình toàn tuyến 25km
  const handleFitBounds = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [108.1651, 16.2052],
        zoom: 11.2,
        pitch: 30,
        bearing: -18,
        speed: 1.1
      })
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

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Kéo thả tệp GeoJSON, KML hoặc Shapefile vào đây</span>
              <span className="text-[10px] text-slate-400">Hỗ trợ EPSG:4326, VN-2000 (Tối đa 50MB)</span>
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
              QL1A Thừa Thiên Huế - Đà Nẵng
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              L = 25.0 km (Km 1020 - Km 1045)
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
                {/* Quick Split Module (Nhập cự ly -> bấm nút -> thay đổi trực tiếp trên Map) */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                      <SplitSquareVertical className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Chia đoạn nhanh theo cự ly</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Tùy biến cự ly</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="15"
                        value={splitDistance}
                        onChange={(e) => setSplitDistance(parseFloat(e.target.value) || 1)}
                        className="w-full h-8 pl-3 pr-14 bg-white border border-slate-300 rounded-lg font-mono text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      />
                      <span className="absolute right-2.5 text-[11px] text-slate-400 pointer-events-none">
                        km/đoạn
                      </span>
                    </div>

                    <select
                      value={splitSortOrder}
                      onChange={(e) => setSplitSortOrder(e.target.value as any)}
                      className="h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    >
                      <option value="asc">Km tăng dần</option>
                      <option value="desc">Km giảm dần</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAutoSplit}
                    className="w-full h-8.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Áp dụng chia đoạn tự động</span>
                  </button>
                </div>

                {/* Segment List Stack */}
                <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-0.5">
                  {segments.map((seg) => {
                    const isSelected = seg.id === selectedSegmentId
                    return (
                      <div
                        key={seg.id}
                        onClick={() => handleSelectSegment(seg)}
                        className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/50 border-[#C9A227] ring-1 ring-[#C9A227] shadow-xs'
                            : seg.hasGap
                            ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: seg.color }}
                              className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
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
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">Dài: {seg.lengthKm.toFixed(1)} km</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.laneCount} làn xe</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">{seg.surfaceMaterial}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-slate-500 text-xs border-t border-slate-100 mt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Tiếp giáp khép kín liên tục
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                showToast(`Chỉnh sửa hình học ${seg.code}`)
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Chỉnh tọa độ"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                showToast(`Xem biểu đồ trắc dọc ${seg.code}`)
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Xem trắc dọc"
                            >
                              <BarChart2 className="w-3 h-3" />
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
