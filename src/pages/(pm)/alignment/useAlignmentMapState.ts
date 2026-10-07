import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { SegmentItem } from './types'
import { initAlignmentMapLayers, syncMapDataDirect } from './alignmentMapSetup'
import {
  calculateCoordsLengthKm,
  calculateStationFromCoordinate
} from './alignmentGeometryHelpers'

export interface UseAlignmentMapStateParams {
  segments: SegmentItem[]
  currentCoords: [number, number][]
  currentKmPoints: number[]
  selectedSegmentId: string | null
  setSelectedSegmentId: (id: string | null) => void
  showToast: (msg: string) => void
  slabLengthM: number
  slabThicknessCm: number
  contractionSpacingM: number
  expansionSpacingM: number
  expansionGapMm: number
  initialCoords: [number, number][]
  initialStationText: string
  branches?: any[]
  onSelectSegmentRef?: React.RefObject<((id: string, branchId?: string, feature?: any) => void) | null>
}

export function useAlignmentMapState({
  segments,
  currentCoords,
  currentKmPoints,
  selectedSegmentId,
  setSelectedSegmentId,
  showToast,
  slabLengthM,
  slabThicknessCm,
  contractionSpacingM,
  expansionSpacingM,
  expansionGapMm,
  initialCoords,
  initialStationText,
  branches = [],
  onSelectSegmentRef
}: UseAlignmentMapStateParams) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)

  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'VECTOR'>('SATELLITE')
  const [showSlabsAndJoints, setShowSlabsAndJoints] = useState<boolean>(true)
  const [rulerActive, setRulerActive] = useState<boolean>(false)
  const [rulerPoints, setRulerPoints] = useState<[number, number][]>([])

  // Chế độ chấm điểm tim tuyến trực tiếp trên bản đồ (Map Coordinate Picker)
  const [isPickingOnMap, setIsPickingOnMap] = useState<boolean>(false)
  const [pickedCoords, setPickedCoords] = useState<[number, number][]>([])
  const [detectedDivergeStation, setDetectedDivergeStation] = useState<{
    km: number
    stationText: string
    distanceMeters: number
  } | null>(null)

  const isPickingRef = useRef<boolean>(false)
  const pickedCoordsRef = useRef<[number, number][]>([])
  const pickingMarkersRef = useRef<maplibregl.Marker[]>([])
  const onFinishPickRef = useRef<((coords: [number, number][]) => void) | null>(null)

  // Ref theo dõi tọa độ và lý trình trục chính để tránh stale closure trong các event listener của bản đồ
  const coordsRef = useRef<[number, number][]>(currentCoords)
  const kmPointsRef = useRef<number[]>(currentKmPoints)

  useEffect(() => {
    coordsRef.current = currentCoords
    kmPointsRef.current = currentKmPoints
  }, [currentCoords, currentKmPoints])

  const [cursorPos, setCursorPos] = useState({
    lng: initialCoords[0] ? initialCoords[0][0] : 108.0825,
    lat: initialCoords[0] ? initialCoords[0][1] : 16.2731,
    station: initialStationText.split(' ')[0],
    elevation: '+14.2m'
  })

  // Cập nhật các Marker HTML đánh dấu điểm chấm trên bản đồ tức thời (0 delay)
  const syncPickingDomMarkers = (pts: [number, number][]) => {
    pickingMarkersRef.current.forEach((m) => m.remove())
    pickingMarkersRef.current = []

    const targetMap = mapRef.current
    if (!targetMap) return

    pts.forEach((pt, idx) => {
      const el = document.createElement('div')
      el.className = 'flex items-center justify-center cursor-pointer pointer-events-none'
      el.innerHTML = `
        <div style="background-color: #EF4444; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 10px rgba(239,68,68,0.85);" 
             class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
          ${idx + 1}
        </div>
      `
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(pt)
        .addTo(targetMap)
      pickingMarkersRef.current.push(marker)
    })
  }

  const syncMap = (
    updatedSegs: SegmentItem[],
    selId: string | null = selectedSegmentId,
    coords: [number, number][] = currentCoords,
    kmPts: number[] = currentKmPoints,
    brList: any[] = branches
  ) => {
    syncMapDataDirect(
      mapRef.current,
      updatedSegs,
      selId,
      coords,
      kmPts,
      markersRef,
      setSelectedSegmentId,
      showToast,
      {
        slabLenM: slabLengthM,
        thicknessCm: slabThicknessCm,
        contractionSpacingM,
        expansionSpacingM,
        expansionGapMm
      },
      brList
    )
  }

  // Khởi tạo MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initialCenter: [number, number] = currentCoords.length > 0
      ? currentCoords[Math.floor(currentCoords.length / 2)]
      : [108.1651, 16.2052]

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(mapLayer === 'VECTOR' ? 'STREETS' : 'SATELLITE'),
      center: initialCenter,
      zoom: 11.2,
      minZoom: 4,
      maxZoom: 20,
      maxPitch: 60,
      pitch: 32,
      bearing: -18
    })

    map.on('mousemove', (e: maplibregl.MapMouseEvent) => {
      const lng = parseFloat(e.lngLat.lng.toFixed(6))
      const lat = parseFloat(e.lngLat.lat.toFixed(6))

      // Tính mốc lý trình chính xác tuyệt đối dựa trên hình chiếu vuông góc lên tim tuyến hiện tại
      let stationStr = 'Km 0+000'
      if (coordsRef.current.length >= 2 && kmPointsRef.current.length >= coordsRef.current.length) {
        const stRes = calculateStationFromCoordinate([lng, lat], coordsRef.current, kmPointsRef.current)
        stationStr = stRes.stationText
      } else if (kmPointsRef.current.length > 0) {
        const kmBase = kmPointsRef.current[0]
        const kmInt = Math.floor(kmBase)
        stationStr = `Km ${kmInt}+000`
      }

      setCursorPos({
        lng: parseFloat(lng.toFixed(4)),
        lat: parseFloat(lat.toFixed(4)),
        station: stationStr,
        elevation: `+${(12.0 + ((lng * 100) % 20)).toFixed(1)}m`
      })
    })

    // Handler click trên bản đồ
    map.on('click', (e: maplibregl.MapMouseEvent) => {
      // 1. Chế độ Chấm điểm tọa độ tim tuyến (Map Coordinate Picker)
      if (isPickingRef.current) {
        const newPt: [number, number] = [
          parseFloat(e.lngLat.lng.toFixed(6)),
          parseFloat(e.lngLat.lat.toFixed(6))
        ]
        pickedCoordsRef.current = [...pickedCoordsRef.current, newPt]
        const next = [...pickedCoordsRef.current]
        setPickedCoords(next)

        // Cắm ngay HTML Marker hiển thị tức thì trên canvas
        const el = document.createElement('div')
        el.className = 'flex items-center justify-center cursor-pointer pointer-events-none'
        el.innerHTML = `
          <div style="background-color: #EF4444; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 10px rgba(239,68,68,0.85);" 
               class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
            ${next.length}
          </div>
        `
        const newMarker = new maplibregl.Marker({ element: el })
          .setLngLat(newPt)
          .addTo(map)
        pickingMarkersRef.current.push(newMarker)

        // Tự động nhận diện điểm rẽ chuẩn xác từ mốc điểm đầu tiên
        let branchStationInfo: { km: number; stationText: string; distanceMeters: number } | null = null
        if (next.length >= 1 && coordsRef.current.length >= 2) {
          branchStationInfo = calculateStationFromCoordinate(next[0], coordsRef.current, kmPointsRef.current)
          setDetectedDivergeStation(branchStationInfo)
        }

        // Đồng bộ source pick-coords-source ngay lập tức
        const src = map.getSource('pick-coords-source') as maplibregl.GeoJSONSource
        if (src) {
          const features: any[] = []
          if (next.length >= 2) {
            features.push({
              type: 'Feature',
              properties: { kind: 'line' },
              geometry: { type: 'LineString', coordinates: next }
            })
          }
          next.forEach((p, idx) => {
            features.push({
              type: 'Feature',
              properties: { kind: 'point', order: idx + 1 },
              geometry: { type: 'Point', coordinates: p }
            })
          })
          src.setData({ type: 'FeatureCollection', features })
        }
        map.triggerRepaint()

        const lenKm = calculateCoordsLengthKm(next)
        const lenText = lenKm >= 1 ? `${lenKm.toFixed(2)} km` : `${Math.round(lenKm * 1000)} m`
        const divergeText = branchStationInfo ? ` • Rẽ tại ${branchStationInfo.stationText} (${branchStationInfo.distanceMeters}m)` : ''
        showToast(`Đã chấm điểm #${next.length} [${newPt.join(', ')}] • Dài: ${lenText}${divergeText}`)
        return
      }

      // 2. Chế độ thước đo cự ly (Ruler)
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
      initAlignmentMapLayers({
        map,
        segments,
        currentCoords,
        currentKmPoints,
        selectedSegmentId,
        popupRef,
        markersRef,
        onSelectSegmentId: setSelectedSegmentId,
        showToast,
        branches,
        isPickingRef,
        onSelectSegmentRef
      })
      if (currentCoords && currentCoords.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        currentCoords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 60, speed: 1.1 })
      }
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      pickingMarkersRef.current.forEach((m) => m.remove())
      map.remove()
    }
  }, [])

  // Đồng bộ GeoJSON và Markers khi state thay đổi
  useEffect(() => {
    syncMap(segments, selectedSegmentId, currentCoords, currentKmPoints, branches)
  }, [
    segments,
    selectedSegmentId,
    currentCoords,
    currentKmPoints,
    branches,
    slabLengthM,
    slabThicknessCm,
    contractionSpacingM,
    expansionSpacingM,
    expansionGapMm
  ])

  // Chuyển đổi lớp bản đồ
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (!map.isStyleLoaded()) return

    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', mapLayer === 'SATELLITE' ? 'visible' : 'none')
    }
    if (map.getLayer('osm-layer')) {
      map.setLayoutProperty('osm-layer', 'visibility', mapLayer === 'VECTOR' ? 'visible' : 'none')
    }
  }, [mapLayer])

  // Bật/tắt hiển thị Lưới tấm bê tông & Khe nối
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

  // Đổi con trỏ chuột sang crosshair khi đang trong chế độ chấm điểm
  useEffect(() => {
    isPickingRef.current = isPickingOnMap
    if (mapRef.current) {
      const canvas = mapRef.current.getCanvas()
      if (canvas) {
        canvas.style.cursor = isPickingOnMap ? 'crosshair' : ''
      }
    }
  }, [isPickingOnMap])

  // Khởi động chế độ chấm điểm
  const startPickingCoords = (
    initPts: [number, number][] = [],
    onFinishCallback?: (coords: [number, number][]) => void
  ) => {
    // Luôn reset sạch sẽ và khởi tạo mảng điểm mới tinh
    pickedCoordsRef.current = [...initPts]
    setPickedCoords([...initPts])
    setIsPickingOnMap(true)
    onFinishPickRef.current = onFinishCallback || null

    // Đồng bộ DOM Markers
    syncPickingDomMarkers(initPts)

    if (initPts.length >= 1 && coordsRef.current.length >= 2) {
      const info = calculateStationFromCoordinate(initPts[0], coordsRef.current, kmPointsRef.current)
      setDetectedDivergeStation(info)
    } else {
      setDetectedDivergeStation(null)
    }

    if (mapRef.current) {
      const src = mapRef.current.getSource('pick-coords-source') as maplibregl.GeoJSONSource
      if (src) {
        const features: any[] = []
        if (initPts.length >= 2) {
          features.push({
            type: 'Feature',
            properties: { kind: 'line' },
            geometry: { type: 'LineString', coordinates: initPts }
          })
        }
        initPts.forEach((p, idx) => {
          features.push({
            type: 'Feature',
            properties: { kind: 'point', order: idx + 1 },
            geometry: { type: 'Point', coordinates: p }
          })
        })
        src.setData({ type: 'FeatureCollection', features })
      }
      mapRef.current.triggerRepaint()
    }
    showToast('Đã BẬT chế độ chấm điểm tim tuyến: Click chuột lên bản đồ để thêm các mốc tọa độ tuyến nhánh mới.')
  }

  // Xóa điểm vừa chấm gần nhất (Undo / Hoàn tác)
  const removeLastPickedCoord = () => {
    pickedCoordsRef.current = pickedCoordsRef.current.slice(0, -1)
    const next = [...pickedCoordsRef.current]
    setPickedCoords(next)

    // Xóa ngay DOM Marker cuối cùng
    const lastMarker = pickingMarkersRef.current.pop()
    if (lastMarker) lastMarker.remove()

    if (next.length >= 1 && coordsRef.current.length >= 2) {
      const info = calculateStationFromCoordinate(next[0], coordsRef.current, kmPointsRef.current)
      setDetectedDivergeStation(info)
    } else {
      setDetectedDivergeStation(null)
    }

    if (mapRef.current) {
      const src = mapRef.current.getSource('pick-coords-source') as maplibregl.GeoJSONSource
      if (src) {
        const features: any[] = []
        if (next.length >= 2) {
          features.push({
            type: 'Feature',
            properties: { kind: 'line' },
            geometry: { type: 'LineString', coordinates: next }
          })
        }
        next.forEach((p, idx) => {
          features.push({
            type: 'Feature',
            properties: { kind: 'point', order: idx + 1 },
            geometry: { type: 'Point', coordinates: p }
          })
        })
        src.setData({ type: 'FeatureCollection', features })
      }
      mapRef.current.triggerRepaint()
    }
    showToast('Đã hoàn tác điểm chấm gần nhất.')
  }

  // Xóa sạch tất cả điểm đã chấm
  const clearAllPickedCoords = () => {
    pickedCoordsRef.current = []
    setPickedCoords([])
    setDetectedDivergeStation(null)

    pickingMarkersRef.current.forEach((m) => m.remove())
    pickingMarkersRef.current = []

    if (mapRef.current) {
      const src = mapRef.current.getSource('pick-coords-source') as maplibregl.GeoJSONSource
      if (src) {
        src.setData({ type: 'FeatureCollection', features: [] })
      }
      mapRef.current.triggerRepaint()
    }
    showToast('Đã xóa toàn bộ điểm đã chấm.')
  }

  // Hoàn tất chấm điểm và bàn giao tọa độ
  const finishPickingCoords = () => {
    const finishedCoords = [...pickedCoordsRef.current]
    setIsPickingOnMap(false)

    // Dọn sạch state, ref và markers để lần tạo nhánh tiếp theo hoàn toàn độc lập, không bị nối đuôi
    pickedCoordsRef.current = []
    setPickedCoords([])
    setDetectedDivergeStation(null)

    pickingMarkersRef.current.forEach((m) => m.remove())
    pickingMarkersRef.current = []

    if (mapRef.current) {
      const src = mapRef.current.getSource('pick-coords-source') as maplibregl.GeoJSONSource
      if (src) {
        src.setData({ type: 'FeatureCollection', features: [] })
      }
      const canvas = mapRef.current.getCanvas()
      if (canvas) canvas.style.cursor = ''
      mapRef.current.triggerRepaint()
    }

    if (onFinishPickRef.current) {
      onFinishPickRef.current(finishedCoords)
    }

    let divergeMsg = ''
    if (finishedCoords.length >= 1 && coordsRef.current.length >= 2) {
      const info = calculateStationFromCoordinate(finishedCoords[0], coordsRef.current, kmPointsRef.current)
      divergeMsg = ` • Điểm rẽ: ${info.stationText}`
    }
    showToast(`Đã hoàn tất chấm điểm: ${finishedCoords.length} mốc tọa độ${divergeMsg}!`)
  }

  // Hủy bỏ chế độ chấm điểm
  const cancelPickingCoords = () => {
    setIsPickingOnMap(false)
    pickedCoordsRef.current = []
    setPickedCoords([])
    setDetectedDivergeStation(null)

    pickingMarkersRef.current.forEach((m) => m.remove())
    pickingMarkersRef.current = []

    if (mapRef.current) {
      const src = mapRef.current.getSource('pick-coords-source') as maplibregl.GeoJSONSource
      if (src) {
        src.setData({ type: 'FeatureCollection', features: [] })
      }
      const canvas = mapRef.current.getCanvas()
      if (canvas) canvas.style.cursor = ''
      mapRef.current.triggerRepaint()
    }
    showToast('Đã hủy chế độ chấm điểm.')
  }

  const handleFitBounds = (coords: [number, number][] = currentCoords) => {
    if (mapRef.current) {
      if (coords.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        coords.forEach((c) => bounds.extend(c))
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

  return {
    mapContainerRef,
    mapRef,
    popupRef,
    markersRef,
    mapLayer,
    setMapLayer,
    showSlabsAndJoints,
    setShowSlabsAndJoints,
    rulerActive,
    setRulerActive,
    setRulerPoints,
    cursorPos,
    setCursorPos,
    syncMap,
    handleFitBounds,
    // Chế độ chấm điểm
    isPickingOnMap,
    pickedCoords,
    detectedDivergeStation,
    startPickingCoords,
    removeLastPickedCoord,
    clearAllPickedCoords,
    finishPickingCoords,
    cancelPickingCoords
  }
}
