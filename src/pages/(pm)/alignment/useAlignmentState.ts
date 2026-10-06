import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { alignmentService } from '../../../api/services'
import { PM_ASSIGNED_PROJECTS, SEGMENT_COLORS } from './alignmentData'
import { checkAndEnrichSegmentsContinuity, generateMockSlabs } from './alignmentGeometryHelpers'
import { useAlignmentMapState } from './useAlignmentMapState'
import { useAlignmentSegmentsState } from './useAlignmentSegmentsState'
import { useAlignmentImportState } from './useAlignmentImportState'

export function useAlignmentState() {
  const { user } = useAuthStore()
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

  // Trạng thái các Tab quản lý bên phải: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'
  const [rightTab, setRightTab] = useState<'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'>('SEGMENTS')

  // Cấu hình Kích thước tấm BTXM & Khe co giãn / Khe giãn nở
  const [slabLengthM, setSlabLengthM] = useState<number>(5.0)
  const [slabThicknessCm, setSlabThicknessCm] = useState<number>(26)
  const [contractionSpacingM, setContractionSpacingM] = useState<number>(5.0)
  const [expansionSpacingM, setExpansionSpacingM] = useState<number>(50.0)
  const [expansionGapMm, setExpansionGapMm] = useState<number>(20)
  const [syncJointWithSlab, setSyncJointWithSlab] = useState<boolean>(true)

  const roadWidthM = 8.0

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Hook 1: Segments & Slabs State
  const segmentsState = useAlignmentSegmentsState({
    initialSegments: activeProject.defaultSegments,
    currentKmPoints: activeProject.defaultKmPoints,
    currentCoords: activeProject.defaultCoords,
    importedLengthKm: activeProject.lengthKm,
    roadWidthM,
    showToast,
    syncMap: (...args) => mapState.syncMap(...args),
    mapRef: { current: null }, // updated dynamically below
    popupRef: { current: null },
    handleFitBounds: () => mapState.handleFitBounds()
  })

  // Hook 2: Map State & Interactions
  const mapState = useAlignmentMapState({
    segments: segmentsState.segments,
    currentCoords: activeProject.defaultCoords,
    currentKmPoints: activeProject.defaultKmPoints,
    selectedSegmentId: segmentsState.selectedSegmentId,
    setSelectedSegmentId: segmentsState.setSelectedSegmentId,
    showToast,
    slabLengthM,
    slabThicknessCm,
    contractionSpacingM,
    expansionSpacingM,
    expansionGapMm,
    initialCoords: activeProject.defaultCoords,
    initialStationText: activeProject.stationOriginText
  })

  // Hook 3: Import State
  const importState = useAlignmentImportState({
    stationOriginKm: activeProject.stationOriginKm,
    splitDistance: segmentsState.splitDistance,
    roadWidthM,
    defaultManualText: activeProject.defaultManualText,
    showToast,
    setSegments: segmentsState.setSegments,
    setSlabs: segmentsState.setSlabs,
    setSelectedSegmentId: segmentsState.setSelectedSegmentId,
    syncMap: (segs, selId, coords, kmPts) => mapState.syncMap(segs, selId, coords, kmPts),
    mapRef: mapState.mapRef,
    handleFitBounds: (c) => mapState.handleFitBounds(c),
    setSplitDistance: segmentsState.setSplitDistance,
    initialCoords: activeProject.defaultCoords,
    initialKmPoints: activeProject.defaultKmPoints,
    initialLengthKm: activeProject.lengthKm
  })

  // Chuyển đổi dự án PM phụ trách
  const handleSwitchProject = (prjId: string) => {
    const target = PM_ASSIGNED_PROJECTS.find((p) => p.id === prjId)
    if (!target) return
    setSelectedProjectId(prjId)
    importState.setCurrentCoords(target.defaultCoords)
    importState.setCurrentKmPoints(target.defaultKmPoints)
    importState.setImportedLengthKm(target.lengthKm)
    importState.setManualCoordsText(target.defaultManualText)
    const validated = checkAndEnrichSegmentsContinuity(target.defaultSegments)
    segmentsState.setSegments(validated)
    segmentsState.setSlabs(generateMockSlabs(validated.length))
    segmentsState.setSelectedSegmentId(validated[0]?.id || null)
    segmentsState.setNewSegForm({
      code: '',
      startKm: target.stationOriginKm,
      endKm: target.stationOriginKm + 5.0,
      roadWidthM: 8.0,
      laneCount: 4,
      surfaceMaterial: 'Mặt BTN C12.5',
      color: SEGMENT_COLORS[0]
    })
    showToast(`Đã chuyển sang dự án [${target.code}] ${target.name}`)
    if (mapState.mapRef.current && target.defaultCoords.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      target.defaultCoords.forEach((c) => bounds.extend(c))
      mapState.mapRef.current.fitBounds(bounds, { padding: 60, speed: 1.1 })
    }
  }

  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      handleSwitchProject(urlProjectId)
    }
  }, [urlProjectId])

  const handleSubmitAlignment = () => {
    const hasAnyGap = segmentsState.segments.some((s) => s.hasGap)
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

  const basePath = isSupervisor ? '/sup' : '/pm'

  return {
    isSupervisor,
    basePath,
    selectedProjectId,
    activeProject,
    alignmentStatus,
    handleSwitchProject,
    handleSubmitAlignment,
    handleLockAlignment,
    toastMessage,
    setToastMessage,
    showToast,
    rightTab,
    setRightTab,
    slabLengthM,
    setSlabLengthM,
    slabThicknessCm,
    setSlabThicknessCm,
    contractionSpacingM,
    setContractionSpacingM,
    expansionSpacingM,
    setExpansionSpacingM,
    expansionGapMm,
    setExpansionGapMm,
    syncJointWithSlab,
    setSyncJointWithSlab,
    segmentsState,
    mapState,
    importState
  }
}
