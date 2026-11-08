import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { SegmentItem, AssignedProjectOption } from './types'
import {
  checkAndEnrichSegmentsContinuity
} from './alignmentGeometryHelpers'
import { computeSplitSegmentPair, computeAutoSplitSegments, checkMainlineSegmentsContinuity } from './alignmentSplitHelpers'
import { prepareBranchPreview } from './alignmentBranchHelpers'
import { useGeometryDraftWorkflow } from './useGeometryDraftWorkflow'
import { useGeometryReadModel } from './useGeometryReadModel'
import { useAlignmentMapState } from './useAlignmentMapState'
import { useAlignmentSegmentsState } from './useAlignmentSegmentsState'
import { useAlignmentImportState } from './useAlignmentImportState'
import { restoreCoordinateDraft, type CoordinateDraftSource } from './roadGuardDraftImportHelpers'
import { previewCenterlineCoordinates } from './alignmentImportHelpers'
import { planMainlinePavement } from './alignmentPavementHelpers'
import { confirmedGeometryDisplay } from './confirmedGeometryDisplay'
import { usePavementWorkflow } from './usePavementWorkflow'

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
  const currentScope = useRef(scopeKey); currentScope.current = scopeKey
  const branchGeneration = useRef(0), branchVersion = branchGeneration.current
  const editorDraft = useRef('')
  const confirmedGeometryScope = useRef('')
  const [fileDraft, setFileDraft] = useState<CoordinateDraftSource | null>(null)
  const [filePreviewCoords, setFilePreviewCoords] = useState<[number, number][] | null>(null)
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
    setStripWidthMeters(Number.NaN); setSlabLengthM(Number.NaN); setSlabThicknessCm(Number.NaN); setContractionSpacingM(Number.NaN); setExpansionSpacingM(Number.NaN); setExpansionGapMm(Number.NaN)
    segmentsState.setCustomSplitKm(Number.NaN); segmentsState.setSplitSortOrder('asc')
    setSyncJointWithSlab(true)
    setLocalDraftDirty(false); setLocalWidthsDirty(false)
    setFileDraft(null)
    setFilePreviewCoords(null)
    branchDistances.current.clear()
    branchGeneration.current++
  }

  useEffect(() => {
    const draft = geometryRead.draft?.data
    const draftStatus = draft?.id === geometryRead.draftId && draft.projectId === selectedProjectId ? draft.status : undefined
    const geometry = geometryRead.geometry?.projectId === selectedProjectId &&
      (!geometryRead.draftId || geometryRead.geometry.sourceDraftId === geometryRead.draftId) &&
      (!geometryRead.versionReference || geometryRead.geometry.routeVersionId === geometryRead.versionReference) &&
      (!geometryRead.roadReference || geometryRead.geometry.roadSectionId === geometryRead.roadReference) ? geometryRead.geometry : null
    if (localDraftDirty && draftStatus !== 'CONFIRMED') return
    setAlignmentStatus(draftStatus === 'CONFIRMED' || draftStatus !== 'DRAFT' && geometry?.sourceDraftId && geometry.metadataStatus === 'COMPLETE' ? 'CONFIRMED' : 'DRAFT')
    setCurrentCoords([]); setCurrentKmPoints([]); setImportedLengthKm(0)
    if (geometry) {
      const restored = confirmedGeometryDisplay(geometry)
      setImportedLengthKm(restored.lengthKm); setCurrentCoords(restored.coordinates); setCurrentKmPoints(restored.kmPoints)
      const scope = `${selectedProjectId}:${geometry.roadSectionId}:${geometry.routeVersionId}:${JSON.stringify(geometry.widthProfile || [])}`
      if (!localDraftDirty && confirmedGeometryScope.current !== scope && Array.isArray(geometry.widthProfile) && Number.isFinite(geometry.stationOriginMeters)) {
        confirmedGeometryScope.current = scope
        segmentsState.setSegments(geometry.widthProfile.map((width, index) => ({
          id: `confirmed-width-${scope}-${index}`, code: `Khoảng bề rộng ${index + 1}`,
          startKm: (geometry.stationOriginMeters! + width.fromOffsetMeters) / 1000,
          endKm: (geometry.stationOriginMeters! + width.toOffsetMeters) / 1000,
          lengthKm: (width.toOffsetMeters - width.fromOffsetMeters) / 1000, roadWidthM: width.widthMeters,
          laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: 'HÌNH HỌC ĐÃ XÁC NHẬN', color: '#C9A227'
        })))
      }
      if (restored.warnings.length) showToast(restored.warnings.join(' '))
    } else if (!geometryRead.roadReference || !geometryRead.versionReference) {
      confirmedGeometryScope.current = ''
    }
  }, [geometryRead.geometry, geometryRead.draft?.data.status, geometryRead.draftId, geometryRead.roadReference, geometryRead.versionReference, selectedProjectId])

  // Trạng thái các Tab quản lý bên phải: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'
  const [pavementWidthRevision, setPavementWidthRevision] = useState(0)
  const [pavementEditRevision, setPavementEditRevision] = useState(0)
  const [localDraftDirty, setLocalDraftDirty] = useState(false)
  const [localWidthsDirty, setLocalWidthsDirty] = useState(false)
  const markLocalDraft = () => setLocalDraftDirty(true)
  const markWidthDraft = () => { setPavementWidthRevision(n => n + 1); setPavementEditRevision(n => n + 1); setLocalDraftDirty(true); if (selectedTargetType === 'MAINLINE') setLocalWidthsDirty(true) }
  const [rightTab, setRightTab] = useState<'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'>('SEGMENTS')

  // Cấu hình Kích thước tấm BTXM & Khe co giãn / Khe giãn nở
  const [stripWidthMeters, setStripWidthMeters] = useState<number | string>(Number.NaN)
  const [slabLengthM, setSlabLengthM] = useState<number | string>(Number.NaN)
  const [slabThicknessCm, setSlabThicknessCm] = useState<number | string>(Number.NaN)
  const [contractionSpacingM, setContractionSpacingM] = useState<number | string>(Number.NaN)
  const [expansionSpacingM, setExpansionSpacingM] = useState<number | string>(Number.NaN)
  const [expansionGapMm, setExpansionGapMm] = useState<number | string>(Number.NaN)
  const [syncJointWithSlab, setSyncJointWithSlab] = useState<boolean>(true)

  // Quản lý Tuyến nhánh (Branch Alignment)
  // Nếu là Giám sát (Supervisor) mà trạng thái dự án là DRAFT (PM chưa trình duyệt), Giám sát xem như chưa có tuyến
  const [branches, setBranches] = useState<any[]>([])
  const [selectedTargetType, setSelectedTargetType] = useState<'MAINLINE' | string>('MAINLINE')
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false)
  const branchDistances = useRef(new Map<string, number>())
  const branchEditor = useRef({ branches, selectedTargetType })
  branchEditor.current = { branches, selectedTargetType }

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
    return branches.reduce((sum, branch) => sum + (Number.isFinite(branch.lengthKm) ? branch.lengthKm : 0), 0)
  }, [branches])

  const totalProjectLengthKm = useMemo(() => {
    return importedLengthKm + branchesTotalLengthKm
  }, [importedLengthKm, branchesTotalLengthKm])

  const commitBranches = (updated: any[], selection: string | null = segmentsState.selectedSegmentId) => {
    if (currentScope.current !== scopeKey || branchGeneration.current !== branchVersion) return
    branchEditor.current.branches = updated; setBranches(updated); markLocalDraft()
    mapState.syncMap(segmentsState.segments, selectedTargetType !== 'MAINLINE' && selection === 'ALL' ? selectedTargetType : selection, currentCoords, currentKmPoints, updated)
  }
  const handleAddBranch = (input: any) => {
    if (currentScope.current !== scopeKey || branchGeneration.current !== branchVersion) return
    try {
      if (branchEditor.current.branches.some(branch => branch.id === input.id)) throw new Error('ID nhánh cục bộ đã tồn tại.')
      const branch = prepareBranchPreview(input, currentCoords, currentKmPoints)
      commitBranches([...branchEditor.current.branches, branch], branch.segments[0].id)
      selectAlignmentTarget(branch.id)
      showToast('Đã thêm nhánh từ hình học nguồn; lý trình nối chỉ là tham chiếu, chưa lưu/xác nhận.')
    } catch (error) { showToast(error instanceof Error ? error.message : 'Dữ liệu nhánh không hợp lệ.') }
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
    const plan = planMainlinePavement(segmentsState.segments, { stripWidthMeters, slabLenM: slabLengthM, thicknessCm: slabThicknessCm, contractionSpacingM, expansionSpacingM, expansionGapMm })
    segmentsState.setSlabs(plan.slabs)
  }, [stripWidthMeters, slabLengthM, slabThicknessCm, contractionSpacingM, expansionSpacingM, expansionGapMm, segmentsState.segments, rightTab, currentCoords, currentKmPoints])

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

  const pavementWorkflow = usePavementWorkflow(selectedProjectId, geometryRead.draft?.data.roadSectionId || '',
    { stripWidthMeters, slabLengthM, slabThicknessCm, contractionSpacingM, expansionSpacingM, expansionGapMm },
    fileDraft && !localWidthsDirty ? fileDraft.widthProfile : [...segmentsState.segments].sort((a, b) => a.startKm - b.startKm).map(segment => ({
      fromOffsetMeters: segment.startKm * 1000 - (fileDraft?.stationOriginMeters ?? geometryRead.draft?.data.stationOriginMeters ?? Number.NaN),
      toOffsetMeters: segment.endKm * 1000 - (fileDraft?.stationOriginMeters ?? geometryRead.draft?.data.stationOriginMeters ?? Number.NaN), widthMeters: segment.roadWidthM
    })), localWidthsDirty, selectedTargetType === 'MAINLINE',
    layout => {
      setStripWidthMeters(layout?.stripWidthMeters ?? Number.NaN); setSlabLengthM(layout?.slabLengthMeters ?? Number.NaN)
      setSlabThicknessCm(layout?.slabThicknessCentimeters ?? Number.NaN); setContractionSpacingM(layout?.contractionJointSpacingMeters ?? Number.NaN)
      setExpansionSpacingM(layout?.expansionJointSpacingMeters ?? Number.NaN); setExpansionGapMm(layout?.expansionJointGapMillimeters ?? Number.NaN)
    }, showToast, pavementEditRevision, pavementWidthRevision)

  // Hook 2: Map State & Interactions
  const mapState = useAlignmentMapState({
    segments: pavementWorkflow.previewBase?.segments || segmentsState.segments,
    savedPavement: pavementWorkflow.display?.preview,
    currentCoords: pavementWorkflow.previewBase ? pavementWorkflow.display ? pavementWorkflow.previewBase.coordinates : pavementWorkflow.previewBase.previewCoordinates : currentCoords,
    currentKmPoints: pavementWorkflow.previewBase ? pavementWorkflow.previewBase.kmPoints : currentKmPoints,
    selectedSegmentId: pavementWorkflow.previewBase && !pavementWorkflow.previewBase.segments.some(segment => segment.id === segmentsState.selectedSegmentId) ? 'ALL' : selectedTargetType !== 'MAINLINE' && segmentsState.selectedSegmentId === 'ALL' ? selectedTargetType : segmentsState.selectedSegmentId,
    setSelectedSegmentId: (id: string | null) => {
      if (id) {
        handleSelectSegmentFromMap(id)
      } else {
        segmentsState.setSelectedSegmentId(null)
      }
    },
    showToast,
    stripWidthMeters,
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
    roadSectionCount: geometryRead.context?.projectId === selectedProjectId ? geometryRead.context.roadSections.length : undefined,
    engineeringCrs: geometryRead.context?.projectId === selectedProjectId ? geometryRead.context.engineeringUtmSrid : null,
    onRoadGuardDraft: (draft, preview) => {
      // Applying a checked file is independent of project prerequisites for saving.
      resetEditor()
      setFileDraft(draft)
      setFilePreviewCoords(preview || [])
      draftWorkflow.setForm(old => ({ ...old, profileId: '', origin: '', reason: '', surveyWidth: '', widths: '' }))
      if (draft) setRightTab('WIDTH_PROFILE')
      else setImportedLengthKm(Number.NaN)
      return !!preview && preview.length >= 2
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
  const editedFileDraft = fileDraft ? { ...fileDraft, widthProfile: [...segmentsState.segments].sort((a, b) => a.startKm - b.startKm).map(segment => {
    const origin = fileDraft.stationOriginMeters
    const originalFrom = fileDraft.widthProfile.find(width => segment.startKm === (origin + width.fromOffsetMeters) / 1000)
    const originalTo = fileDraft.widthProfile.find(width => segment.endKm === (origin + width.toOffsetMeters) / 1000)
    return {
      fromOffsetMeters: originalFrom ? originalFrom.fromOffsetMeters : segment.startKm * 1000 - origin,
      toOffsetMeters: originalTo ? originalTo.toOffsetMeters : segment.endKm * 1000 - origin,
      widthMeters: segment.roadWidthM
    }
  }) } : null
  const draftWorkflow = useGeometryDraftWorkflow(selectedProjectId, geometryRead, importState.manualCoordsText, importState.setManualCoordsText, showToast, importState.hasUnverifiedFile, editorScope === scopeKey ? editedFileDraft : null)

  useEffect(() => {
    if (!fileDraft || editorScope !== scopeKey) return
    const confirmedDraft = geometryRead.draft?.data
    const confirmedGeometry = geometryRead.geometry
    if (confirmedDraft?.projectId === selectedProjectId && confirmedDraft.status === 'CONFIRMED' &&
      confirmedDraft.id === geometryRead.draftId && confirmedGeometry?.projectId === selectedProjectId &&
      confirmedGeometry.sourceDraftId === confirmedDraft.id &&
      (!geometryRead.roadReference || confirmedGeometry.roadSectionId === geometryRead.roadReference) &&
      (!geometryRead.versionReference || confirmedGeometry.routeVersionId === geometryRead.versionReference)) return
    const origin = fileDraft.stationOriginMeters
    draftWorkflow.setForm(old => ({ ...old, origin: String(origin), reason: fileDraft.changeReason ?? old.reason,
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
    if (!filePreviewCoords || editorScope !== scopeKey) return
    let offset = 0
    const kmPoints = fileDraft?.coordinates.map((point, index) => {
      if (index) { const previous = fileDraft.coordinates[index - 1]; offset += Math.sqrt((point.x - previous.x) ** 2 + (point.y - previous.y) ** 2) }
      return (fileDraft.stationOriginMeters + offset) / 1000
    }) || []
    setCurrentCoords(filePreviewCoords); setCurrentKmPoints(filePreviewCoords.length ? kmPoints : [])
    mapState.handleFitBounds(filePreviewCoords)
  }, [filePreviewCoords, fileDraft, scopeKey])

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
    if (draft.status === 'DRAFT' && draft.sourceKind === 'COORDINATES') {
      if (geometryRead.context?.projectId !== selectedProjectId) return
      try {
        if (!geometryRead.draft?.etag || !draft.version || geometryRead.draft.etag !== `"${draft.version}"`) throw new Error('version: bản nháp chưa có ETag khớp phiên bản máy chủ.')
        if (!draft.roadSectionId || !geometryRead.context.roadSections.some(road => road.roadSectionId === draft.roadSectionId)) throw new Error('roadSectionId: tuyến của bản nháp không thuộc context dự án.')
        if (draft.sourceCrs !== geometryRead.context.engineeringUtmSrid) throw new Error('sourceCrs: không khớp engineeringUtmSrid dự án.')
        const source = restoreCoordinateDraft(draft)
        editorDraft.current = draft.id
        setFileDraft(source)
        try { setFilePreviewCoords(previewCenterlineCoordinates(source.coordinates.map(point => [point.x, point.y]), source.sourceCrs)) }
        catch (error) { showToast(error instanceof Error ? error.message : 'sourceCrs: chưa hỗ trợ preview bản nháp.'); setFilePreviewCoords([]) }
      } catch (error) { showToast(error instanceof Error ? error.message : 'Không khôi phục được metadata bản nháp.') }
      return
    }
    editorDraft.current = draft.id
    if (!Number.isFinite(draft.stationOriginMeters)) return
    const origin = draft.stationOriginMeters
    segmentsState.setSegments((draft.widthProfile || []).map((width, index) => ({
      id: `draft-width-${draft.id}-${index}`, code: `Khoảng bề rộng ${index + 1}`,
      startKm: (origin + width.fromOffsetMeters) / 1000, endKm: (origin + width.toOffsetMeters) / 1000,
      lengthKm: (width.toOffsetMeters - width.fromOffsetMeters) / 1000, roadWidthM: width.widthMeters,
      laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: 'BẢN NHÁP ĐÃ ĐỌC', color: '#C9A227'
    })))
  }, [geometryRead.draft, geometryRead.draftId, geometryRead.context, selectedProjectId, localDraftDirty, draftWorkflow.busy, draftWorkflow.conflict])
  useEffect(() => {
    if (draftWorkflow.conflict || draftWorkflow.busy || !localWidthsDirty || selectedTargetType !== 'MAINLINE') return
    const origin = Number(draftWorkflow.form.origin)
    if (!draftWorkflow.form.origin.trim() || !Number.isFinite(origin)) return
    draftWorkflow.setForm(old => ({ ...old, widths: [...segmentsState.segments].sort((a, b) => a.startKm - b.startKm).map(segment => `${segment.startKm * 1000 - origin}, ${segment.endKm * 1000 - origin}, ${Number.isFinite(segment.roadWidthM) ? segment.roadWidthM : ''}`).join('\n') }))
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
    if (isMainline) return [...segmentsState.segments].sort((a, b) => segmentsState.splitSortOrder === 'desc' ? b.startKm - a.startKm : a.startKm - b.startKm)
    return [...(currentBranch?.segments || [])].sort((a, b) => currentBranch?.splitSortOrder === 'desc' ? b.startKm - a.startKm : a.startKm - b.startKm)
  }, [isMainline, segmentsState.segments, segmentsState.splitSortOrder, currentBranch])

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
      branchDistances.current.set(currentBranch.id, dist)
      commitBranches(branchEditor.current.branches.map(branch => branch.id === currentBranch.id ? { ...branch, splitDistance: dist } : branch))
    }
  }

  // Áp dụng chia đoạn tự động cho Tuyến chính hoặc Tuyến nhánh
  const handleApplyAutoSplit = () => {
    if (currentScope.current !== scopeKey || branchGeneration.current !== branchVersion || branchEditor.current.selectedTargetType !== selectedTargetType) return
    if (isMainline) {
      segmentsState.handleApplyAutoSplit()
    } else if (currentBranch) {
      if (currentScope.current !== scopeKey || branchEditor.current.selectedTargetType !== selectedTargetType) return
      const branch = branchEditor.current.branches.find(item => item.id === selectedTargetType)
      if (!branch) return
      const dist = branchDistances.current.get(branch.id) ?? branch.splitDistance
      const source = branch.segments.length ? branch.segments : [{ id: branch.id + '-whole', code: branch.code, startKm: 0, endKm: branch.lengthKm, lengthKm: branch.lengthKm, roadWidthM: branch.roadWidthM, laneCount: branch.laneCount, surfaceMaterial: branch.surfaceMaterial, color: branch.color, status: 'VALID' as const, statusText: 'BẢN CHỈNH CHƯA LƯU' }]
      const divided = computeAutoSplitSegments(branch.lengthKm, 0, dist, branch.roadWidthM, 'asc', source).map((segment, index) => ({ ...segment, id: branch.id + '-segment-' + index, code: branch.code + ' - Đoạn ' + (index + 1) }))
      if (!divided.length) { showToast('Cự ly hoặc phạm vi nhánh chưa hợp lệ/liên tục; giữ nguyên bản chỉnh.'); return }
      commitBranches(branchEditor.current.branches.map(item => item.id === branch.id ? { ...item, segments: divided } : item), divided[0].id)
      segmentsState.setSelectedSegmentId(divided[0].id); mapState.handleFitBounds(branch.coords)
      showToast('Đã chia lại nhánh đang chọn; giữ thông số và phần dư, chưa lưu máy chủ.')
    }
  }

  // Tách 1 phân đoạn (Cho cả Tuyến chính lẫn Tuyến nhánh)
  const handleSplitSegmentSubmit = (e: React.FormEvent) => {
    if (currentScope.current !== scopeKey || branchGeneration.current !== branchVersion || branchEditor.current.selectedTargetType !== selectedTargetType) return
    if (isMainline) {
      segmentsState.handleSplitSegmentSubmit(e)
    } else if (currentBranch && segmentsState.splitModalSegment) {
      e.preventDefault()
      const segToSplit = segmentsState.splitModalSegment
      const splitKm = Number(segmentsState.customSplitKm)
      if (!Number.isFinite(splitKm) || splitKm <= segToSplit.startKm || splitKm >= segToSplit.endKm) {
        showToast(`Điểm tách phải nằm giữa Km ${segToSplit.startKm.toFixed(3)} và Km ${segToSplit.endKm.toFixed(3)}!`)
        return
      }
      const segs = [...(currentBranch.segments || [])]
      const segIndex = segs.findIndex((s: any) => s.id === segToSplit.id)
      if (segIndex === -1) return

      const { segA, segB } = computeSplitSegmentPair(segToSplit, splitKm, segIndex, true)
      segA.id = currentBranch.id + '-segment-' + crypto.randomUUID()
      segB.id = currentBranch.id + '-segment-' + crypto.randomUUID()
      const updatedList = [
        ...segs.slice(0, segIndex),
        segA,
        segB,
        ...segs.slice(segIndex + 1)
      ]
      const updatedBranches = branches.map((b) => (b.id === currentBranch.id ? { ...b, segments: updatedList } : b))
      commitBranches(updatedBranches, segA.id)
      segmentsState.setSelectedSegmentId(segA.id)
      segmentsState.setSplitModalSegment(null)
      mapState.syncMap(segmentsState.segments, segA.id, currentCoords, currentKmPoints, updatedBranches)
      showToast(`Đã tách ${segToSplit.code} thành 2 đoạn tại Km ${splitKm.toFixed(3)}!`)
    }
  }

  const changeBranchSegments = (update: (segments: SegmentItem[]) => SegmentItem[]) => {
    if (currentScope.current !== scopeKey || branchGeneration.current !== branchVersion || branchEditor.current.selectedTargetType !== selectedTargetType) return
    const branch = branchEditor.current.branches.find(item => item.id === selectedTargetType)
    if (!branch) return
    commitBranches(branchEditor.current.branches.map(item => item.id === branch.id ? { ...item, segments: checkMainlineSegmentsContinuity(update(branch.segments)) } : item))
  }
  const handleUpdateSegmentWidth = (segId: string, width: number) => {
    if (selectedTargetType === 'MAINLINE') { segmentsState.handleUpdateSegmentWidth(segId, width); return }
    if (!Number.isFinite(width) || width <= 0) { showToast('Bề rộng nhánh phải là số hữu hạn lớn hơn 0.'); return }
    changeBranchSegments(segments => segments.map(segment => segment.id === segId ? { ...segment, roadWidthM: width } : segment))
  }
  const handleUpdateAllWidths = (width: number) => {
    if (selectedTargetType === 'MAINLINE') {
      const updated = segmentsState.segments.map(segment => ({ ...segment, roadWidthM: width }))
      segmentsState.setSegments(updated); mapState.syncMap(updated, segmentsState.selectedSegmentId)
      showToast(`Đã cập nhật tất cả phân đoạn trục chính bề rộng ${width}m!`); return
    }
    if (!Number.isFinite(width) || width <= 0) { showToast('Bề rộng nhánh phải là số hữu hạn lớn hơn 0.'); return }
    if (branchEditor.current.selectedTargetType !== selectedTargetType) return
    commitBranches(branchEditor.current.branches.map(branch => branch.id === selectedTargetType ? { ...branch, roadWidthM: width, segments: branch.segments.map((segment: SegmentItem) => ({ ...segment, roadWidthM: width })) } : branch))
  }
  const handleSnapSegment = (id: string) => {
    if (selectedTargetType === 'MAINLINE') { segmentsState.handleSnapSegment(id); return }
    changeBranchSegments(segments => {
      const ordered = [...segments].sort((a, b) => a.startKm - b.startKm), index = ordered.findIndex(segment => segment.id === id)
      if (index <= 0 || ordered[index].endKm <= ordered[index - 1].endKm) return segments
      return segments.map(segment => segment.id === id ? { ...segment, startKm: ordered[index - 1].endKm, lengthKm: segment.endKm - ordered[index - 1].endKm } : segment)
    })
  }
  const handleSaveEditedSegment = (event: React.FormEvent) => {
    if (selectedTargetType === 'MAINLINE') { markWidthDraft(); segmentsState.handleSaveEditedSegment(event); return }
    event.preventDefault()
    const edited = segmentsState.editingSegment
    if (!edited || !currentBranch?.segments.some((segment: SegmentItem) => segment.id === edited.id)) { showToast('Đoạn sửa không thuộc nhánh đang chọn.'); return }
    if (![edited.startKm, edited.endKm, edited.roadWidthM].every(Number.isFinite) || edited.startKm < 0 || edited.endKm > currentBranch.lengthKm || edited.startKm >= edited.endKm || edited.roadWidthM <= 0 || !Number.isInteger(edited.laneCount) || edited.laneCount <= 0 || !edited.surfaceMaterial.trim()) { showToast('Lý trình hoặc thông số đoạn nhánh chưa hợp lệ.'); return }
    changeBranchSegments(segments => segments.map(segment => segment.id === edited.id ? { ...edited, lengthKm: edited.endKm - edited.startKm } : segment))
    segmentsState.setEditingSegment(null)
  }
  const handleDeleteSegment = (id: string) => {
    if (selectedTargetType === 'MAINLINE') segmentsState.handleDeleteSegment(id)
    else changeBranchSegments(segments => segments.filter(segment => segment.id !== id))
  }
  const handleDeleteBranch = (id: string) => {
    if (currentScope.current !== scopeKey || branchGeneration.current !== branchVersion) return
    commitBranches(branchEditor.current.branches.filter(branch => branch.id !== id), selectedTargetType === id ? null : segmentsState.selectedSegmentId)
    branchDistances.current.delete(id)
    if (selectedTargetType === id) { setSelectedTargetType('MAINLINE'); segmentsState.setSelectedSegmentId(null); segmentsState.setEditingSegment(null); segmentsState.setSplitModalSegment(null) }
    showToast('Đã xóa nhánh khỏi bản chỉnh cục bộ, chưa ghi máy chủ.')
  }



  const selectAlignmentTarget = (id: string) => {
    const branch = branchEditor.current.branches.find(item => item.id === id)
    if (id !== 'MAINLINE' && !branch) { showToast('Nhánh được chọn không còn trong bản chỉnh.'); return }
    setSelectedTargetType(id); segmentsState.setSelectedSegmentId(branch?.segments[0]?.id || null)
    segmentsState.setEditingSegment(null); segmentsState.setSplitModalSegment(null); segmentsState.setIsAddSegmentModalOpen(false)
    segmentsState.setCustomSplitKm(Number.NaN)
    segmentsState.setNewSegForm(old => ({ ...old, code: '', startKm: Number.NaN, endKm: Number.NaN, roadWidthM: Number.NaN, laneCount: Number.NaN, surfaceMaterial: '' }))
    mapState.handleFitBounds(branch?.coords || currentCoords)
  }
  const handleCreateBranchSegment = (event: React.FormEvent) => {
    if (isMainline) { segmentsState.handleCreateNewSegment(event); return }
    event.preventDefault()
    const form = segmentsState.newSegForm
    if (!currentBranch || ![form.startKm, form.endKm, form.roadWidthM].every(Number.isFinite) || form.startKm < 0 || form.endKm > currentBranch.lengthKm || form.endKm <= form.startKm || form.roadWidthM <= 0 || !Number.isInteger(form.laneCount) || form.laneCount <= 0 || !form.surfaceMaterial.trim()) { showToast('Thiếu hoặc sai thông số đoạn nhánh mới.'); return }
    const segment: SegmentItem = { ...form, id: currentBranch.id + '-segment-' + crypto.randomUUID(), lengthKm: form.endKm - form.startKm, status: 'VALID', statusText: 'BẢN CHỈNH CHƯA LƯU' }
    changeBranchSegments(segments => [...segments, segment]); segmentsState.setIsAddSegmentModalOpen(false)
  }
  const setPavementConfig = (setter: (value: any) => void, value: any) => {
    if (!isMainline) { showToast('Chưa biên tập pavement tuyến nhánh; cấu hình tuyến chính được giữ nguyên.'); return }
    setPavementEditRevision(n => n + 1); setter(value)
  }

  const handleSubmitAlignment = () => draftWorkflow.save()
  const handleLockAlignment = draftWorkflow.confirm

  const basePath = isSupervisor ? '/sup' : '/pm'
  const handleClearMainline = () => showToast('Chưa có lệnh xóa tuyến chính thức từ màn hình này. Dữ liệu máy chủ được giữ nguyên.')

  return {
    geometryRead,
    pavementWorkflow,
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
    stripWidthMeters,
    slabLengthM,
    setStripWidthMeters: (value: number | string) => setPavementConfig(setStripWidthMeters, value),
    setSlabLengthM: (value: number | string) => setPavementConfig(setSlabLengthM, value),
    slabThicknessCm,
    setSlabThicknessCm: (value: number | string) => setPavementConfig(setSlabThicknessCm, value),
    contractionSpacingM,
    setContractionSpacingM: (value: number | string) => setPavementConfig(setContractionSpacingM, value),
    expansionSpacingM,
    setExpansionSpacingM: (value: number | string) => setPavementConfig(setExpansionSpacingM, value),
    expansionGapMm,
    setExpansionGapMm: (value: number | string) => setPavementConfig(setExpansionGapMm, value),
    syncJointWithSlab,
    setSyncJointWithSlab: (value: boolean) => setPavementConfig(setSyncJointWithSlab, value),
    // Branch Alignment
    branches,
    branchesTotalLengthKm,
    totalProjectLengthKm,
    branchesCount: branches.length,
    selectedTargetType,
    setSelectedTargetType: selectAlignmentTarget,
    isAddBranchModalOpen,
    setIsAddBranchModalOpen,
    handleAddBranch,
    isMainline,
    currentBranch,
    activeSegments: rightTab === 'SLABS' && pavementWorkflow.previewBase ? pavementWorkflow.previewBase.segments : activeSegments,
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
    segmentsState: { ...segmentsState, selectedSegmentId: pavementWorkflow.previewBase && !pavementWorkflow.previewBase.segments.some(segment => segment.id === segmentsState.selectedSegmentId) ? 'ALL' : segmentsState.selectedSegmentId, slabs: isMainline ? pavementWorkflow.display?.slabs || (pavementWorkflow.previewBase ? planMainlinePavement(pavementWorkflow.previewBase.segments, { stripWidthMeters, slabLenM: slabLengthM, thicknessCm: slabThicknessCm, contractionSpacingM, expansionSpacingM, expansionGapMm }).slabs : segmentsState.slabs) : [],
      splitSortOrder: isMainline ? segmentsState.splitSortOrder : currentBranch?.splitSortOrder || 'asc',
      setSplitSortOrder: (order: 'asc' | 'desc') => isMainline ? segmentsState.setSplitSortOrder(order) : commitBranches(branchEditor.current.branches.map(branch => branch.id === selectedTargetType ? { ...branch, splitSortOrder: order } : branch)),
      handleCreateNewSegment: handleCreateBranchSegment,
      handleClearAllSegments: () => isMainline ? segmentsState.handleClearAllSegments() : changeBranchSegments(() => []) },
    mapState,
    importState
  }
}

