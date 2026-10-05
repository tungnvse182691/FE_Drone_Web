import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { alignmentService } from '../../api/services'
import { CheckCircle2, X } from 'lucide-react'

import { AlignmentHeader } from './alignment/AlignmentHeader'
import { AlignmentMap } from './alignment/AlignmentMap'
import { AlignmentSidebar } from './alignment/AlignmentSidebar'
import { AlignmentModals } from './alignment/AlignmentModals'
import { SegmentItem, SlabItem, AssignedProjectOption } from './alignment/types'
export type { SegmentItem, SlabItem, AssignedProjectOption } from './alignment/types'

import { SEGMENT_COLORS, PM_ASSIGNED_PROJECTS } from './alignment/alignmentData'
import {
  interpolateCoordAtKm,
  checkAndEnrichSegmentsContinuity,
  generateMockSlabs
} from './alignment/alignmentGeometryHelpers'
import {
  initAlignmentMapLayers,
  syncMapDataDirect
} from './alignment/alignmentMapSetup'
import {
  parseGeoJsonText,
  parseManualCoordinatesText,
  parseExtractedCoordinates
} from './alignment/alignmentImportHelpers'

export { PM_ASSIGNED_PROJECTS } from './alignment/alignmentData'

export const AlignmentSegments: React.FC = () => {
  const navigate = useNavigate()
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

  // Trạng thái tim tuyến: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
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

  // Trạng thái bật/tắt hiển thị Lưới tấm bê tông & Khe nối
  const [showSlabsAndJoints, setShowSlabsAndJoints] = useState<boolean>(true)

  // Cấu hình Kích thước tấm BTXM & Khe co giãn / Khe giãn nở
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

  // Modals
  const [editingSegment, setEditingSegment] = useState<SegmentItem | null>(null)
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
  const [splitModalSegment, setSplitModalSegment] = useState<SegmentItem | null>(null)
  const [customSplitKm, setCustomSplitKm] = useState<number>(1022.5)

  // Ruler
  const [rulerActive, setRulerActive] = useState<boolean>(false)
  const [rulerPoints, setRulerPoints] = useState<[number, number][]>([])

  // Modal import
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
  const [roadWidthM] = useState<number>(8.0)

  // Tọa độ và mốc km
  const [currentCoords, setCurrentCoords] = useState<[number, number][]>(activeProject.defaultCoords)
  const [currentKmPoints, setCurrentKmPoints] = useState<number[]>(activeProject.defaultKmPoints)
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

  // Danh sách Phân đoạn & Tấm Slab
  const [segments, setSegments] = useState<SegmentItem[]>(activeProject.defaultSegments)
  const [slabs, setSlabs] = useState<SlabItem[]>(generateMockSlabs(activeProject.defaultSegments.length))

  // MapLibre references
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)

  const syncMap = (
    updatedSegs: SegmentItem[],
    selId: string | null = selectedSegmentId,
    coords: [number, number][] = currentCoords,
    kmPts: number[] = currentKmPoints
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
        contractionSpacingM: contractionSpacingM,
        expansionSpacingM: expansionSpacingM,
        expansionGapMm: expansionGapMm
      }
    )
  }

  // Chuyển đổi dự án PM phụ trách
  const handleSwitchProject = (prjId: string) => {
    const target = PM_ASSIGNED_PROJECTS.find((p) => p.id === prjId)
    if (!target) return
    setSelectedProjectId(prjId)
    setCurrentCoords(target.defaultCoords)
    setCurrentKmPoints(target.defaultKmPoints)
    setImportedLengthKm(target.lengthKm)
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

  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      handleSwitchProject(urlProjectId)
    }
  }, [urlProjectId])

  // Khởi tạo MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(mapLayer === 'VECTOR' ? 'STREETS' : 'SATELLITE'),
      center: [108.1651, 16.2052],
      zoom: 11.2,
      minZoom: 4,
      maxZoom: 20,
      maxPitch: 60,
      pitch: 32,
      bearing: -18
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

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
      initAlignmentMapLayers({
        map,
        segments,
        currentCoords,
        currentKmPoints,
        selectedSegmentId,
        popupRef,
        markersRef,
        onSelectSegmentId: setSelectedSegmentId,
        showToast
      })
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      map.remove()
    }
  }, [])

  // Đồng bộ GeoJSON và Markers khi state thay đổi
  useEffect(() => {
    syncMap(segments, selectedSegmentId, currentCoords, currentKmPoints)
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

  // Chuyển đổi lớp bản đồ
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (!map.isStyleLoaded()) return

    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', mapLayer === 'SATELLITE' || mapLayer === 'PLANNING' ? 'visible' : 'none')
    }
    if (map.getLayer('osm-layer')) {
      map.setLayoutProperty('osm-layer', 'visibility', mapLayer === 'VECTOR' ? 'visible' : 'none')
    }
    if (map.getLayer('planning-corridor-layer')) {
      map.setLayoutProperty('planning-corridor-layer', 'visibility', mapLayer === 'PLANNING' ? 'visible' : 'none')
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

    syncMap(validated, validated[0]?.id || null)

    const distText = dist >= 1 ? `${dist.toFixed(2)} km` : `${(dist * 1000).toFixed(0)} m`
    showToast(`Đã chia tuyến thành ${validated.length} phân đoạn (${distText}/đoạn). Tuyến đường hiển thị liên tục chuẩn thiết kế!`)
    handleFitBounds()
  }

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
    syncMap(validated, updated.id)

    const hasGap = validated.find((s: SegmentItem) => s.id === updated.id)?.hasGap
    if (hasGap) {
      showToast(`Đã lưu ${updated.code}! Lưu ý: Phát hiện khoảng hở/chồng lấn với phân đoạn kề bên (GAP_WARNING). Bấm 'Nối tiếp giáp' để khép kín!`)
    } else {
      showToast(`Đã lưu cập nhật ${updated.code} (Km ${start.toFixed(3)} - Km ${end.toFixed(3)})`)
    }
    setEditingSegment(null)
  }

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
    syncMap(validated, newSeg.id)

    setIsAddSegmentModalOpen(false)
    showToast(`Đã thêm mới ${newSeg.code} (${newSeg.lengthKm} km) vào tim tuyến!`)
  }

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
    syncMap(validated, segA.id)

    setSplitModalSegment(null)
    showToast(`Đã tách ${splitModalSegment.code} thành 2 đoạn tại Km ${splitKm.toFixed(3)}!`)
  }

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
    syncMap(validated, nextSelId)

    showToast('Đã xóa phân đoạn khỏi danh sách tuyến!')
  }

  const handleUpdateSegmentWidth = (segId: string, widthM: number) => {
    const val = Math.max(1.0, Math.min(60.0, widthM))
    const updated = segments.map((s) => (s.id === segId ? { ...s, roadWidthM: val } : s))
    setSegments(updated)
    syncMap(updated, selectedSegmentId)
  }

  const handleSnapSegment = (segId: string) => {
    const idx = segments.findIndex((s) => s.id === segId)
    if (idx <= 0) return

    const prevSeg = segments[idx - 1]
    const curSeg = segments[idx]

    const newStart = prevSeg.endKm
    const newLen = parseFloat((curSeg.endKm - newStart).toFixed(3))

    if (newLen <= 0) {
      showToast('Lỗi: Không thể nối vì lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const updated = segments.map((s) =>
      s.id === segId ? { ...s, startKm: newStart, lengthKm: newLen } : s
    )

    const validated = checkAndEnrichSegmentsContinuity(updated)
    setSegments(validated)
    syncMap(validated, curSeg.id)

    showToast(`Đã nối tiếp giáp khép kín tại Km ${newStart.toFixed(3)} giữa ${prevSeg.code} và ${curSeg.code}!`)
  }

  const processGeoJSONFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rawCoords = parseGeoJsonText(text)
        const res = parseExtractedCoordinates(rawCoords, activeProject.stationOriginKm, splitDistance, roadWidthM)

        if (!res) {
          showToast('Tệp tải lên không chứa hình học LineString hoặc tim tuyến hợp lệ!')
          return
        }

        setCurrentCoords(res.coords)
        setCurrentKmPoints(res.kmPoints)
        setImportedLengthKm(res.totalLengthKm)

        const validated = checkAndEnrichSegmentsContinuity(res.segments)
        setSegments(validated)
        setSlabs(generateMockSlabs(validated.length))
        setSelectedSegmentId(validated[0]?.id || null)
        setIsImportModalOpen(false)

        if (mapRef.current) {
          const map = mapRef.current
          const bounds = new maplibregl.LngLatBounds()
          res.coords.forEach((c) => bounds.extend(c))
          map.fitBounds(bounds, { padding: 80, speed: 1.2 })
          syncMap(validated, validated[0]?.id || null, res.coords, res.kmPoints)
        }

        const lenText = res.totalLengthKm >= 1 ? `${res.totalLengthKm.toFixed(2)} km` : `${(res.totalLengthKm * 1000).toFixed(0)} m`
        showToast(`Đã nạp tim tuyến [${file.name}]: ${res.coords.length} đỉnh, chiều dài ${lenText}, chia ${validated.length} phân đoạn!`)
      } catch {
        showToast('Lỗi: Định dạng file GeoJSON không đúng cấu trúc JSON chuẩn!')
      }
    }
    reader.readAsText(file)
  }

  const processManualCoordinates = (text: string) => {
    try {
      if (!text || !text.trim()) {
        showToast('Vui lòng nhập hoặc dán chuỗi tọa độ đỉnh!')
        return
      }

      const rawCoords = parseManualCoordinatesText(text)
      const res = parseExtractedCoordinates(rawCoords, activeProject.stationOriginKm, splitDistance, roadWidthM)

      if (!res) {
        showToast('Chuỗi tọa độ cần ít nhất 2 điểm đỉnh [kinh độ, vĩ độ] hợp lệ!')
        return
      }

      setCurrentCoords(res.coords)
      setCurrentKmPoints(res.kmPoints)
      setImportedLengthKm(res.totalLengthKm)

      const validated = checkAndEnrichSegmentsContinuity(res.segments)
      setSegments(validated)
      setSlabs(generateMockSlabs(validated.length))
      setSelectedSegmentId(validated[0]?.id || null)
      setIsImportModalOpen(false)

      if (mapRef.current) {
        const map = mapRef.current
        const bounds = new maplibregl.LngLatBounds()
        res.coords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 80, speed: 1.2 })
        syncMap(validated, validated[0]?.id || null, res.coords, res.kmPoints)
      }

      const lenText = res.totalLengthKm >= 1 ? `${res.totalLengthKm.toFixed(2)} km` : `${(res.totalLengthKm * 1000).toFixed(0)} m`
      showToast(`Đã dựng tim tuyến từ chuỗi tọa độ thủ công: ${res.coords.length} đỉnh, L = ${lenText}, chia ${validated.length} phân đoạn!`)
    } catch {
      showToast('Lỗi khi phân tích chuỗi tọa độ!')
    }
  }

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

  const handleSelectAllRoute = () => {
    setSelectedSegmentId('ALL')
    if (popupRef.current) popupRef.current.remove()
    if (mapRef.current) {
      if (currentCoords.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        currentCoords.forEach((c) => bounds.extend(c))
        mapRef.current.fitBounds(bounds, { padding: 60, speed: 1.1 })
      }
      syncMap(segments, 'ALL')
    }
    showToast('Đang chọn Toàn Tuyến: Hiển thị đầy đủ các phân đoạn và tổng số tấm BTXM')
  }

  const handleSelectSegment = (seg: SegmentItem) => {
    setSelectedSegmentId(seg.id)
    if (mapRef.current) {
      const centerCoord = interpolateCoordAtKm((seg.startKm + seg.endKm) / 2, currentCoords, currentKmPoints)
      mapRef.current.flyTo({
        center: centerCoord,
        zoom: 13.2,
        speed: 1.2
      })
      syncMap(segments, seg.id)
    }
  }

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

  const handleLockAlignment = () => {
    alignmentService.confirmAlignment(selectedProjectId, user?.full_name || 'Supervisor')
    setAlignmentStatus('CONFIRMED')
    showToast('Dự án đã chính thức KHÓA TIM TUYẾN (CONFIRMED)! Chữ ký số SHA-256 đã được gắn bất biến.')
  }

  const handleLoadPreset = (name: string, dist: number) => {
    setSplitDistance(dist)
    setIsImportModalOpen(false)

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
            syncMap(updated, selectedSegmentId)
            showToast(`Đã cập nhật tất cả phân đoạn bề rộng ${wVal}m!`)
          }}
          slabs={slabs}
          showToast={showToast}
        />
      </section>
    </div>
  )
}

export default AlignmentSegments
