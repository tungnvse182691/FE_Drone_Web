import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { SegmentItem, AssignedProjectOption } from './types'
import {
  checkAndEnrichSegmentsContinuity,
  calculatePavementSlabs,
  calculateCoordsLengthKm
} from './alignmentGeometryHelpers'
import { computeSplitSegmentPair } from './alignmentSplitHelpers'
import { useGeometryDraftWorkflow } from './useGeometryDraftWorkflow'
import { useGeometryReadModel } from './useGeometryReadModel'
import { useAlignmentMapState } from './useAlignmentMapState'
import { useAlignmentSegmentsState } from './useAlignmentSegmentsState'
import { useAlignmentImportState } from './useAlignmentImportState'
import type { RoadGuardCoordinatesDraft } from './roadGuardDraftImportHelpers'
import { utm48NToWgs84 } from '../../../api/services/alignmentService'

export function useAlignmentState() {
  const { user, authEpoch } = useAuthStore()
  const navigate = useNavigate()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const [assignedProjects, setAssignedProjects] = useState<AssignedProjectOption[]>([])

  // Lấy dự án từ URL (nếu có: /pm/projects/:id/alignment hoặc /sup/projects/:id/alignment)
  const { id: urlProjectId } = useParams<{ id?: string }>()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return urlProjectId || ''
  })

  const activeProject = useMemo(() => {
    return (
      assignedProjects.find((p) => p.id === selectedProjectId || p.code === selectedProjectId) ||
      {
        id: selectedProjectId || '',
        code: '',
        name: 'Chưa có dự án',
        stationOriginText: 'Chưa xác định',
        stationOriginKm: Number.NaN,
        endKm: Number.NaN,
        crs: 'Chưa xác định',
        lengthKm: 0.0,
        defaultCoords: [],
        defaultKmPoints: [],
        defaultSegments: [],
        defaultManualText: '',
        defaultBranches: []
      }
    )
  }, [assignedProjects, selectedProjectId])

  // Trạng thái tim tuyến: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  const [alignmentStatus, setAlignmentStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'>('DRAFT')

  // Hàm nạp gói tim tuyến chính thức trực tiếp từ CSDL Backend Candidate3 (API-104)
  const geometryRead = useGeometryReadModel(selectedProjectId)
  const scopeKey = `${authEpoch}:${selectedProjectId}:${geometryRead.draftId}`
  const [editorScope, setEditorScope] = useState(scopeKey)
  const editorDraft = useRef('')
  const [fileDraft, setFileDraft] = useState<RoadGuardCoordinatesDraft | null>(null)
  useEffect(() => {
    setAssignedProjects(geometryRead.projects.map(project => ({id:project.projectId,code:project.projectCode,name:project.name,defaultCoords:[],defaultKmPoints:[],defaultSegments:[],stationOriginKm:Number.NaN,stationOriginText:'Chưa cập nhật',endKm:Number.NaN,lengthKm:Number.NaN,crs:'Chưa xác định',defaultManualText:''})))
    if (geometryRead.error) showToast(geometryRead.error)
  }, [geometryRead.projects, geometryRead.error])
  const resetEditor = () => {
    setCurrentCoords([]); setCurrentKmPoints([]); setImportedLengthKm(0)
    segmentsState.setSegments([]); segmentsState.setSlabs([]); setBranches([])
    segmentsState.setEditingSegment(null); segmentsState.setSplitModalSegment(null); segmentsState.setIsAddSegmentModalOpen(false)
    segmentsState.setSelectedSegmentId(null); segmentsState.setSplitDistance(Number.NaN)
    segmentsState.setNewSegForm(old => ({ ...old, code: '', startKm: Number.NaN, endKm: Number.NaN, roadWidthM: Number.NaN, laneCount: Number.NaN, surfaceMaterial: '' }))
    setSelectedTargetType('MAINLINE'); setIsAddBranchModalOpen(false)
    setAlignmentStatus('DRAFT')
    setSlabLengthM(Number.NaN); setSlabThicknessCm(Number.NaN); setContractionSpacingM(Number.NaN); setExpansionSpacingM(Number.NaN); setExpansionGapMm(Number.NaN)
    segmentsState.setCustomSplitKm(Number.NaN); segmentsState.setSplitSortOrder('asc')
    setSyncJointWithSlab(true)
    setLocalDraftDirty(false); setLocalWidthsDirty(false)
    setFileDraft(null)
  }

  useEffect(() => {
    if (localDraftDirty) return
    const draft = geometryRead.draft?.data
    const draftStatus = draft?.id === geometryRead.draftId && draft.projectId === selectedProjectId ? draft.status : undefined
    const geometry = geometryRead.geometry?.projectId === selectedProjectId &&
      (!geometryRead.draftId || geometryRead.geometry.sourceDraftId === geometryRead.draftId) ? geometryRead.geometry : null
    setAlignmentStatus(draftStatus === 'CONFIRMED' || draftStatus !== 'DRAFT' && geometry?.sourceDraftId && geometry.metadataStatus === 'COMPLETE' ? 'CONFIRMED' : 'DRAFT')
    setCurrentCoords([]); setCurrentKmPoints([]); setImportedLengthKm(0)
    if (Number.isFinite(geometry?.lengthMeters) && geometry!.lengthMeters > 0) setImportedLengthKm(geometry!.lengthMeters / 1000)
    const line = geometry?.wgs84Centerline
    if (line?.type === 'LineString' && Array.isArray(line.coordinates) && line.coordinates.length >= 2 &&
        line.coordinates.every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90)) {
      setCurrentCoords(line.coordinates)
    }
  }, [geometryRead.geometry, geometryRead.draft?.data.status, geometryRead.draftId, selectedProjectId])

  // Trạng thái các Tab quản lý bên phải: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'
  const [localDraftDirty, setLocalDraftDirty] = useState(false)
  const [localWidthsDirty, setLocalWidthsDirty] = useState(false)
  const markLocalDraft = () => setLocalDraftDirty(true)
  const markWidthDraft = () => { setLocalDraftDirty(true); setLocalWidthsDirty(true) }
  const [rightTab, setRightTab] = useState<'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'>('SEGMENTS')

  // Cấu hình Kích thước tấm BTXM & Khe co giãn / Khe giãn nở
  const [slabLengthM, setSlabLengthM] = useState<number>(Number.NaN)
  const [slabThicknessCm, setSlabThicknessCm] = useState<number>(Number.NaN)
  const [contractionSpacingM, setContractionSpacingM] = useState<number>(Number.NaN)
  const [expansionSpacingM, setExpansionSpacingM] = useState<number>(Number.NaN)
  const [expansionGapMm, setExpansionGapMm] = useState<number>(Number.NaN)
  const [syncJointWithSlab, setSyncJointWithSlab] = useState<boolean>(true)

  // Quản lý Tuyến nhánh (Branch Alignment)
  // Nếu là Giám sát (Supervisor) mà trạng thái dự án là DRAFT (PM chưa trình duyệt), Giám sát xem như chưa có tuyến
  const [branches, setBranches] = useState<any[]>([])
  const [selectedTargetType, setSelectedTargetType] = useState<'MAINLINE' | string>('MAINLINE')
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false)

  const roadWidthM = Number.NaN

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // State tọa độ tim tuyến và mốc lý trình đồng bộ toàn cục
  const [currentCoords, setCurrentCoords] = useState<[number, number][]>([])
  const [currentKmPoints, setCurrentKmPoints] = useState<number[]>([])
  const [importedLengthKm, setImportedLengthKm] = useState<number>(0)

  // Tính tổng quãng đường: Trục chính + Các tuyến nhánh phụ
  const branchesTotalLengthKm = useMemo(() => {
    return branches.reduce((sum, b) => {
      const len = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : b.lengthKm) || 0
      return sum + len
    }, 0)
  }, [branches])

  const totalProjectLengthKm = useMemo(() => {
    return parseFloat((importedLengthKm + branchesTotalLengthKm).toFixed(3))
  }, [importedLengthKm, branchesTotalLengthKm])

  const handleAddBranch = (newBranch: any) => {
    const updatedBranches = [...branches, newBranch]
    setBranches(updatedBranches)
    setSelectedTargetType(newBranch.id)
    if (newBranch.segments && newBranch.segments.length > 0) {
      segmentsState.setSelectedSegmentId(newBranch.segments[0].id)
    } else {
      segmentsState.setSelectedSegmentId(newBranch.id)
    }

    // Tự động tính tổng quãng đường mới và lưu tức thì

    showToast(`Đã tạo thành công tuyến nhánh [${newBranch.code}] ${newBranch.name}`)
  }

  // Hook 1: Segments & Slabs State
  const initialSegments: SegmentItem[] = []

  const segmentsState = useAlignmentSegmentsState({
    initialSegments,
    stationOriginKm: fileDraft ? fileDraft.stationOriginMeters / 1000 : geometryRead.draft?.data.stationOriginMeters !== undefined ? geometryRead.draft.data.stationOriginMeters / 1000 : Number.NaN,
    currentKmPoints,
    currentCoords,
    importedLengthKm,
    roadWidthM,
    showToast: message => showToast(`${message} — bản chỉnh cục bộ, chưa lưu máy chủ.`),
    syncMap: (...args) => mapState.syncMap(...args),
    mapRef: { current: null }, // updated dynamically below
    popupRef: { current: null },
    handleFitBounds: () => mapState.handleFitBounds()
  })
  // Tự động tính toán lại danh sách tấm Slab khi thay đổi chiều dài L, chiều dày hoặc phân đoạn mặt đường
  useEffect(() => {
    if (Number.isFinite(slabLengthM) && slabLengthM > 0 && Number.isFinite(slabThicknessCm) && slabThicknessCm > 0 && segmentsState.segments.length > 0 && segmentsState.segments.every(segment => Number.isFinite(segment.roadWidthM) && segment.roadWidthM > 0 && Number.isFinite(segment.laneCount) && segment.laneCount > 0)) {
      segmentsState.setSlabs(
        calculatePavementSlabs(segmentsState.segments, slabLengthM, slabThicknessCm)
      )
    } else {
      segmentsState.setSlabs([])
    }
  }, [slabLengthM, slabThicknessCm, segmentsState.segments])

  // Refs theo dõi danh sách tuyến nhánh và phân đoạn mới nhất để tránh stale closure khi click trên map
  const branchesRef = useRef<any[]>(branches)
  useEffect(() => {
    branchesRef.current = branches
  }, [branches])

  const segmentsRef = useRef<SegmentItem[]>(segmentsState.segments)
  useEffect(() => {
    segmentsRef.current = segmentsState.segments
  }, [segmentsState.segments])

  const onSelectSegmentRef = useRef<((id: string, branchId?: string, feature?: any) => void) | null>(null)

  const handleSelectSegmentFromMap = (segId: string, branchId?: string, _feature?: any) => {
    const allBranches = branchesRef.current || []
    const allSegs = segmentsRef.current || []

    // 1. Kiểm tra xem có thuộc Tuyến Nhánh nào không
    let matchedBranch = null
    if (branchId) {
      matchedBranch = allBranches.find((b) => b.id === branchId)
    }
    if (!matchedBranch && segId) {
      matchedBranch = allBranches.find(
        (b) => b.id === segId || (b.segments && b.segments.some((s: any) => s.id === segId))
      )
    }

    if (matchedBranch) {
      // Tự động chuyển đổi tượng Tuyến sang Tuyến Nhánh này
      setSelectedTargetType(matchedBranch.id)

      // Tìm phân đoạn con trong tuyến nhánh
      const branchSegs = matchedBranch.segments || []
      const matchedBranchSeg = branchSegs.find((s: any) => s.id === segId)
      if (matchedBranchSeg) {
        segmentsState.setSelectedSegmentId(matchedBranchSeg.id)
      } else if (branchSegs.length > 0) {
        segmentsState.setSelectedSegmentId(branchSegs[0].id)
      } else {
        segmentsState.setSelectedSegmentId(matchedBranch.id)
      }
      return
    }

    // 2. Nếu thuộc Trục Chính
    setSelectedTargetType('MAINLINE')
    const matchedMainlineSeg = allSegs.find((s) => s.id === segId)
    if (matchedMainlineSeg) {
      segmentsState.setSelectedSegmentId(matchedMainlineSeg.id)
    } else {
      // Tìm tương đối theo prefix (ví dụ seg-1, seg-2)
      const looseMatch = allSegs.find((s) => segId.startsWith(s.id) || s.id.startsWith(segId))
      if (looseMatch) {
        segmentsState.setSelectedSegmentId(looseMatch.id)
      } else {
        segmentsState.setSelectedSegmentId(segId)
      }
    }
  }

  useEffect(() => {
    onSelectSegmentRef.current = handleSelectSegmentFromMap
  })

  // Hook 2: Map State & Interactions
  const mapState = useAlignmentMapState({
    segments: segmentsState.segments,
    currentCoords,
    currentKmPoints,
    selectedSegmentId: segmentsState.selectedSegmentId,
    setSelectedSegmentId: (id: string | null) => {
      if (id) {
        handleSelectSegmentFromMap(id)
      } else {
        segmentsState.setSelectedSegmentId(null)
      }
    },
    showToast,
    slabLengthM,
    slabThicknessCm,
    contractionSpacingM,
    expansionSpacingM,
    expansionGapMm,
    initialCoords: activeProject.defaultCoords,
    initialStationText: activeProject.stationOriginText,
    branches,
    onSelectSegmentRef
  })

  // Hook 3: Import State
  const importState = useAlignmentImportState({
    inputScope: `${authEpoch}:${selectedProjectId}:${geometryRead.draftId}`,
    onDraftInput: markLocalDraft,
    contextReady: geometryRead.context?.projectId === selectedProjectId,
    engineeringCrs: geometryRead.context?.projectId === selectedProjectId ? geometryRead.context.engineeringUtmSrid : null,
    onRoadGuardDraft: draft => {
      // Called only after validation (and matching project CRS for a Draft).
      resetEditor()
      setFileDraft(draft)
      draftWorkflow.setForm(old => ({ ...old, profileId: '', origin: '', reason: '', surveyWidth: '', widths: '' }))
      if (draft) setRightTab('WIDTH_PROFILE')
      else setImportedLengthKm(Number.NaN)
    },
    stationOriginKm: activeProject.stationOriginKm,
    splitDistance: segmentsState.splitDistance,
    roadWidthM,
    defaultManualText: activeProject.defaultManualText,
    showToast,
    setSegments: segmentsState.setSegments,
    setSlabs: segmentsState.setSlabs,
    setSelectedSegmentId: segmentsState.setSelectedSegmentId,
    syncMap: (segs, selId, coords, kmPts) => mapState.syncMap(segs, selId, coords, kmPts, branches),
    mapRef: mapState.mapRef,
    handleFitBounds: (c) => mapState.handleFitBounds(c),
    setSplitDistance: segmentsState.setSplitDistance,
    currentCoords,
    setCurrentCoords,
    currentKmPoints,
    setCurrentKmPoints,
    importedLengthKm,
    setImportedLengthKm,

  })

  // Sidebar values are authoritative; preserve exact source offsets when only width changed.
  const editedFileDraft = fileDraft ? { ...fileDraft, widthProfile: segmentsState.segments.map((segment, index) => {
    const original = fileDraft.widthProfile[index], origin = fileDraft.stationOriginMeters
    return {
      fromOffsetMeters: original && segment.startKm === (origin + original.fromOffsetMeters) / 1000 ? original.fromOffsetMeters : segment.startKm * 1000 - origin,
      toOffsetMeters: original && segment.endKm === (origin + original.toOffsetMeters) / 1000 ? original.toOffsetMeters : segment.endKm * 1000 - origin,
      widthMeters: segment.roadWidthM
    }
  }) } : null
  const draftWorkflow = useGeometryDraftWorkflow(selectedProjectId, geometryRead, importState.manualCoordsText, importState.setManualCoordsText, showToast, importState.hasUnverifiedFile, editorScope === scopeKey ? editedFileDraft : null)

  useEffect(() => {
    if (!fileDraft || editorScope !== scopeKey) return
    const origin = fileDraft.stationOriginMeters
    draftWorkflow.setForm(old => ({ ...old, origin: String(origin), reason: fileDraft.changeReason,
      surveyWidth: String(fileDraft.surveyWidthMeters),
      widths: localWidthsDirty ? old.widths : fileDraft.widthProfile.map(width => `${width.fromOffsetMeters}, ${width.toOffsetMeters}, ${width.widthMeters}`).join('\n') }))
    importState.setManualCoordsText(fileDraft.coordinates.map(point => `${point.x}, ${point.y}`).join('\n'))
    setAlignmentStatus('DRAFT')
    let length = 0
    for (let i = 1; i < fileDraft.coordinates.length; i++) {
      const a = fileDraft.coordinates[i - 1], b = fileDraft.coordinates[i]
      length += Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
    }
    setImportedLengthKm(length / 1000)
    if (!localWidthsDirty) segmentsState.setSegments(fileDraft.widthProfile.map((width, index) => ({
      id: `file-width-${index}`, code: `Khoảng bề rộng ${index + 1}`,
      startKm: (origin + width.fromOffsetMeters) / 1000, endKm: (origin + width.toOffsetMeters) / 1000,
      lengthKm: (width.toOffsetMeters - width.fromOffsetMeters) / 1000, roadWidthM: width.widthMeters,
      laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: 'BẢN CHỈNH CHƯA LƯU', color: '#C9A227'
    })))
  }, [fileDraft, geometryRead.draft, geometryRead.geometry])

  // Display coordinates only; engineering coordinates/length/profile remain authoritative.
  useEffect(() => {
    if (!fileDraft || editorScope !== scopeKey) return
    if (fileDraft.sourceCrs !== 32648 || geometryRead.context?.projectId !== selectedProjectId || geometryRead.context.engineeringUtmSrid !== 32648) {
      setCurrentCoords([]); setCurrentKmPoints([]); mapState.handleFitBounds([])
      return
    }
    const coords = fileDraft.coordinates.map(point => utm48NToWgs84(point.x, point.y))
    if (coords.some(point => !point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90)) {
      setCurrentCoords([]); setCurrentKmPoints([]); mapState.handleFitBounds([])
      showToast('Không tạo được preview kinh/vĩ độ hợp lệ; bản chỉnh engineering được giữ nguyên.')
      return
    }
    let offset = 0
    const kmPoints = fileDraft.coordinates.map((point, index) => {
      if (index) { const previous = fileDraft.coordinates[index - 1]; offset += Math.sqrt((point.x - previous.x) ** 2 + (point.y - previous.y) ** 2) }
      return (fileDraft.stationOriginMeters + offset) / 1000
    })
    setCurrentCoords(coords); setCurrentKmPoints(kmPoints)
    mapState.handleFitBounds(coords)
  }, [fileDraft, geometryRead.context, scopeKey])

  // Reset this hook before children can render the new draft with the previous draft's edits.
  if (editorScope !== scopeKey) {
    setEditorScope(scopeKey)
    editorDraft.current = ''
    resetEditor()
    importState.setManualCoordsText('')
    setToastMessage(null)
  }

  useEffect(() => {
    const context = geometryRead.context
    if (context?.projectId !== selectedProjectId) return
    const section = geometryRead.draft?.data.roadSectionId || (context.roadSections.length === 1 ? context.roadSections[0].roadSectionId : '')
    if (section) draftWorkflow.setForm(old => old.sectionId ? old : { ...old, sectionId: section })
  }, [geometryRead.context, geometryRead.draft?.data.roadSectionId, selectedProjectId])
  useEffect(() => {
    const draft = geometryRead.draft?.data
    if (!draft || draft.id !== geometryRead.draftId || draft.projectId !== selectedProjectId || editorDraft.current === draft.id || localDraftDirty || draftWorkflow.busy || draftWorkflow.conflict) return
    editorDraft.current = draft.id
    if (!Number.isFinite(draft.stationOriginMeters)) return
    const origin = draft.stationOriginMeters
    segmentsState.setSegments((draft.widthProfile || []).map((width, index) => ({
      id: `draft-width-${draft.id}-${index}`, code: `Khoảng bề rộng ${index + 1}`,
      startKm: (origin + width.fromOffsetMeters) / 1000, endKm: (origin + width.toOffsetMeters) / 1000,
      lengthKm: (width.toOffsetMeters - width.fromOffsetMeters) / 1000, roadWidthM: width.widthMeters,
      laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: 'BẢN NHÁP ĐÃ ĐỌC', color: '#C9A227'
    })))
  }, [geometryRead.draft, geometryRead.draftId, selectedProjectId, localDraftDirty, draftWorkflow.busy, draftWorkflow.conflict])
  useEffect(() => {
    if (draftWorkflow.conflict || draftWorkflow.busy || !localWidthsDirty || selectedTargetType !== 'MAINLINE') return
    const origin = Number(draftWorkflow.form.origin)
    if (!draftWorkflow.form.origin.trim() || !Number.isFinite(origin)) return
    draftWorkflow.setForm(old => ({ ...old, widths: segmentsState.segments.map(segment => `${segment.startKm * 1000 - origin}, ${segment.endKm * 1000 - origin}, ${Number.isFinite(segment.roadWidthM) ? segment.roadWidthM : ''}`).join('\n') }))
  }, [segmentsState.segments, localWidthsDirty, selectedTargetType, draftWorkflow.busy, draftWorkflow.conflict])

  // Chuyển đổi dự án PM phụ trách
  const handleSwitchProject = (prjId: string) => {
    if (!prjId) return
    geometryRead.invalidate()
    if (prjId !== urlProjectId) navigate(`${isSupervisor ? '/sup' : '/pm'}/projects/${prjId}/alignment`)
    setSelectedProjectId(prjId)
  }

  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      handleSwitchProject(urlProjectId)
    }
  }, [urlProjectId])

  const isMainline = selectedTargetType === 'MAINLINE'
  const currentBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedTargetType) || null
  }, [branches, selectedTargetType])

  // Danh sách phân đoạn đang kích hoạt (Tuyến chính hoặc Tuyến nhánh được chọn)
  const activeSegments = useMemo(() => {
    if (isMainline) return segmentsState.segments
    return currentBranch?.segments || []
  }, [isMainline, segmentsState.segments, currentBranch])

  // Chiều dài đang kích hoạt
  const activeLengthKm = useMemo(() => {
    if (isMainline) return importedLengthKm
    return currentBranch?.lengthKm ?? Number.NaN
  }, [isMainline, importedLengthKm, currentBranch])

  // Cự ly chia đoạn đang kích hoạt
  const activeSplitDistance = useMemo(() => {
    if (isMainline) return segmentsState.splitDistance
    return currentBranch?.splitDistance ?? Number.NaN
  }, [isMainline, segmentsState.splitDistance, currentBranch])

  // Cập nhật cự ly chia đoạn
  const handleSetSplitDistance = (dist: number) => {
    if (isMainline) {
      segmentsState.setSplitDistance(dist)
    } else if (currentBranch) {
      setBranches((prev) =>
        prev.map((b) => (b.id === currentBranch.id ? { ...b, splitDistance: dist } : b))
      )
    }
  }

  // Áp dụng chia đoạn tự động cho Tuyến chính hoặc Tuyến nhánh
  const handleApplyAutoSplit = () => {
    if (isMainline) {
      segmentsState.handleApplyAutoSplit()
    } else if (currentBranch) {
      const dist = currentBranch.splitDistance
      const totalLen = (currentBranch.coords && currentBranch.coords.length >= 2 ? calculateCoordsLengthKm(currentBranch.coords) : 0) || currentBranch.lengthKm
      if (!Number.isFinite(dist) || !(dist > 0) || !Number.isFinite(totalLen) || !(totalLen > 0)) { showToast('Thiếu chiều dài hoặc cự ly chia nhánh; chưa thay đổi bản nháp.'); return }
      const count = Math.max(1, Math.ceil(totalLen / dist))
      const newSegs: any[] = []
      let cur = 0.0
      for (let i = 1; i <= count; i++) {
        const next = i === count ? totalLen : parseFloat((cur + dist).toFixed(3))
        newSegs.push({
          id: `br-seg-${currentBranch.id}-${i}`,
          code: `${currentBranch.code} - Đoạn #${String(i).padStart(2, '0')}`,
          startKm: parseFloat(cur.toFixed(3)),
          endKm: parseFloat(next.toFixed(3)),
          lengthKm: parseFloat((next - cur).toFixed(3)),
          roadWidthM: currentBranch.roadWidthM ?? Number.NaN,
          status: 'VALID',
          statusText: 'HỢP LỆ',
          laneCount: currentBranch.laneCount ?? Number.NaN,
          surfaceMaterial: currentBranch.surfaceMaterial || '',
          color: i % 2 === 0 ? '#F59E0B' : '#D97706'
        })
        cur = next
      }
      const updatedBranches = branches.map((b) => (b.id === currentBranch.id ? { ...b, segments: newSegs } : b))
      setBranches(updatedBranches)
      if (newSegs.length > 0) {
        segmentsState.setSelectedSegmentId(newSegs[0].id)
      }
      mapState.syncMap(segmentsState.segments, newSegs[0]?.id || currentBranch.id, currentCoords, currentKmPoints, updatedBranches)
      showToast(`Đã chia tự động tuyến nhánh [${currentBranch.code}] thành ${newSegs.length} phân đoạn!`)
    }
  }

  // Tách 1 phân đoạn (Cho cả Tuyến chính lẫn Tuyến nhánh)
  const handleSplitSegmentSubmit = (e: React.FormEvent) => {
    if (isMainline) {
      segmentsState.handleSplitSegmentSubmit(e)
    } else if (currentBranch && segmentsState.splitModalSegment) {
      e.preventDefault()
      const segToSplit = segmentsState.splitModalSegment
      const splitKm = parseFloat(Number(segmentsState.customSplitKm).toFixed(3))
      if (!Number.isFinite(splitKm) || splitKm <= segToSplit.startKm || splitKm >= segToSplit.endKm) {
        showToast(`Điểm tách phải nằm giữa Km ${segToSplit.startKm.toFixed(3)} và Km ${segToSplit.endKm.toFixed(3)}!`)
        return
      }
      const segs = [...(currentBranch.segments || [])]
      const segIndex = segs.findIndex((s: any) => s.id === segToSplit.id)
      if (segIndex === -1) return

      const { segA, segB } = computeSplitSegmentPair(segToSplit, splitKm, segIndex)
      const updatedList = [
        ...segs.slice(0, segIndex),
        segA,
        segB,
        ...segs.slice(segIndex + 1)
      ]
      const updatedBranches = branches.map((b) => (b.id === currentBranch.id ? { ...b, segments: updatedList } : b))
      setBranches(updatedBranches)
      segmentsState.setSelectedSegmentId(segA.id)
      segmentsState.setSplitModalSegment(null)
      mapState.syncMap(segmentsState.segments, segA.id, currentCoords, currentKmPoints, updatedBranches)
      showToast(`Đã tách ${segToSplit.code} thành 2 đoạn tại Km ${splitKm.toFixed(3)}!`)
    }
  }

  // Cập nhật bề rộng 1 phân đoạn
  const handleUpdateSegmentWidth = (segId: string, w: number) => {
    if (isMainline) {
      segmentsState.handleUpdateSegmentWidth(segId, w)
    } else if (currentBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === currentBranch.id
            ? {
                ...b,
                segments: b.segments.map((s: any) =>
                  s.id === segId ? { ...s, roadWidthM: w } : s
                )
              }
            : b
        )
      )
      showToast(`Đã cập nhật bề rộng phân đoạn nhánh thành ${w}m!`)
    }
  }

  // Cập nhật bề rộng tất cả phân đoạn
  const handleUpdateAllWidths = (w: number) => {
    if (isMainline) {
      const updated = segmentsState.segments.map((s) => ({ ...s, roadWidthM: w }))
      segmentsState.setSegments(updated)
      mapState.syncMap(updated, segmentsState.selectedSegmentId)
      showToast(`Đã cập nhật tất cả phân đoạn trục chính bề rộng ${w}m!`)
    } else if (currentBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === currentBranch.id
            ? {
                ...b,
                segments: b.segments.map((s: any) => ({ ...s, roadWidthM: w }))
              }
            : b
        )
      )
      showToast(`Đã cập nhật tất cả phân đoạn tuyến nhánh [${currentBranch.code}] bề rộng ${w}m!`)
    }
  }

  // Nối tiếp giáp liền kề
  const handleSnapSegment = (segId: string) => {
    if (isMainline) {
      segmentsState.handleSnapSegment(segId)
    } else if (currentBranch) {
      const segs = [...currentBranch.segments]
      const idx = segs.findIndex((s: any) => s.id === segId)
      if (idx > 0) {
        segs[idx] = {
          ...segs[idx],
          startKm: segs[idx - 1].endKm,
          lengthKm: parseFloat((segs[idx].endKm - segs[idx - 1].endKm).toFixed(3)),
          hasGap: false,
          status: 'VALID',
          statusText: 'HỢP LỆ'
        }
        setBranches((prev) =>
          prev.map((b) => (b.id === currentBranch.id ? { ...b, segments: segs } : b))
        )
        showToast('Đã nối tiếp giáp liền kề phân đoạn nhánh!')
      }
    }
  }

  // Sửa thông số phân đoạn
  const handleSaveEditedSegment = (edited: any) => {
    markWidthDraft()
    if (isMainline) {
      segmentsState.handleSaveEditedSegment(edited)
    } else if (currentBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === currentBranch.id
            ? {
                ...b,
                segments: b.segments.map((s: any) => (s.id === edited.id ? edited : s))
              }
            : b
        )
      )
      segmentsState.setEditingSegment(null)
      showToast(`Đã lưu phân đoạn tuyến nhánh [${edited.code}]`)
    }
  }

  // Xóa phân đoạn
  const handleDeleteSegment = (segId: string) => {
    if (isMainline) {
      segmentsState.handleDeleteSegment(segId)
    } else if (currentBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === currentBranch.id
            ? { ...b, segments: b.segments.filter((s: any) => s.id !== segId) }
            : b
        )
      )
      showToast('Đã xóa phân đoạn khỏi tuyến nhánh!')
    }
  }

  // Xóa toàn bộ tuyến nhánh nếu nhập sai muốn nhập lại
  const handleDeleteBranch = (branchId: string) => {
    const updatedBranches = branches.filter((b) => b.id !== branchId)
    setBranches(updatedBranches)
    if (selectedTargetType === branchId) {
      setSelectedTargetType('MAINLINE')
    }

    showToast('Đã xóa tuyến nhánh thành công! Bạn có thể tạo lại tuyến nhánh mới.')
  }

  const handleSubmitAlignment = draftWorkflow.save
  const handleLockAlignment = draftWorkflow.confirm

  const basePath = isSupervisor ? '/sup' : '/pm'
  const handleClearMainline = () => showToast('Chưa có lệnh xóa tuyến chính thức từ màn hình này. Dữ liệu máy chủ được giữ nguyên.')

  return {
    geometryRead,
    fileDraft,
    localDraftDirty, markLocalDraft, markWidthDraft,
    draftWorkflow,
    isSupervisor,
    basePath,
    urlProjectId,
    selectedProjectId,
    assignedProjects,
    activeProject,
    alignmentStatus,
    handleSwitchProject,
    handleSubmitAlignment,
    handleLockAlignment,
    handleClearMainline,
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
    // Branch Alignment
    branches,
    branchesTotalLengthKm,
    totalProjectLengthKm,
    branchesCount: branches.length,
    selectedTargetType,
    setSelectedTargetType,
    isAddBranchModalOpen,
    setIsAddBranchModalOpen,
    handleAddBranch,
    isMainline,
    currentBranch,
    activeSegments,
    activeLengthKm,
    activeSplitDistance,
    handleSetSplitDistance,
    handleApplyAutoSplit,
    handleSplitSegmentSubmit,
    handleUpdateSegmentWidth,
    handleUpdateAllWidths,
    handleSnapSegment,
    handleSaveEditedSegment,
    handleDeleteSegment,
    handleDeleteBranch,
    currentCoords,
    setCurrentCoords,
    currentKmPoints,
    setCurrentKmPoints,
    importedLengthKm,
    setImportedLengthKm,
    segmentsState,
    mapState,
    importState
  }
}

