import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { alignmentService, projectService, wgs84ToUtm48N } from '../../../api/services'
import { SegmentItem, AssignedProjectOption } from './types'
import { PM_ASSIGNED_PROJECTS, SEGMENT_COLORS, getAvailableAssignedProjects } from './data'
import {
  checkAndEnrichSegmentsContinuity,
  generateMockSlabs,
  calculateCoordsLengthKm
} from './alignmentGeometryHelpers'
import { computeSplitSegmentPair } from './alignmentSplitHelpers'
import { useAlignmentMapState } from './useAlignmentMapState'
import { useAlignmentSegmentsState } from './useAlignmentSegmentsState'
import { useAlignmentImportState } from './useAlignmentImportState'

export function useAlignmentState() {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const [assignedProjects, setAssignedProjects] = useState<AssignedProjectOption[]>(() => getAvailableAssignedProjects())

  // Lấy dự án từ URL (nếu có: /pm/projects/:id/alignment hoặc /sup/projects/:id/alignment)
  const { id: urlProjectId } = useParams<{ id?: string }>()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const list = getAvailableAssignedProjects()
    if (urlProjectId) {
      const match = list.find((p) => p.id === urlProjectId || p.code === urlProjectId)
      if (match) return match.id
      return urlProjectId
    }
    return list[0]?.id || ''
  })

  const activeProject = useMemo(() => {
    return (
      assignedProjects.find((p) => p.id === selectedProjectId || p.code === selectedProjectId) ||
      assignedProjects[0] || {
        id: selectedProjectId || '',
        code: '',
        name: 'Chưa có dự án',
        stationOriginText: 'Km 0+000',
        stationOriginKm: 0.0,
        endKm: 0.0,
        crs: 'EPSG:32648 (UTM Zone 48N)',
        lengthKm: 0.0,
        defaultCoords: [],
        defaultKmPoints: [],
        defaultSegments: []
      }
    )
  }, [assignedProjects, selectedProjectId])

  // Trạng thái tim tuyến: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  const [alignmentStatus, setAlignmentStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'>(() => {
    return alignmentService.getAlignmentState(selectedProjectId).status
  })

  // Hàm nạp gói tim tuyến chính thức trực tiếp từ CSDL Backend Candidate3 (API-104)
  const loadAlignmentPackage = async (prjId: string) => {
    if (!prjId) return
    try {
      const pkg = await alignmentService.fetchGeometryPackage(prjId)
      if (pkg && pkg.route) {
        alignmentService.syncWithGeometryPackage(prjId, pkg)
        const wgsCoords = (pkg.route.wgs84Centerline?.coordinates || []) as [number, number][]
        const totalKm = parseFloat(((pkg.route.lengthMeters || 0) / 1000).toFixed(3))
        setCurrentCoords(wgsCoords)
        setImportedLengthKm(totalKm)
        setAlignmentStatus('CONFIRMED')
        if (pkg.segmentSet?.segments && pkg.segmentSet.segments.length > 0) {
          const mapped = pkg.segmentSet.segments.map((s, idx) => ({
            id: s.segmentId || `seg-${prjId}-${idx + 1}`,
            code: `Phân đoạn #${String(idx + 1).padStart(2, '0')}`,
            startKm: parseFloat(((s.startStationMeters || 0) / 1000).toFixed(3)),
            endKm: parseFloat(((s.endStationMeters || 0) / 1000).toFixed(3)),
            lengthKm: parseFloat(((s.lengthMeters || 0) / 1000).toFixed(3)),
            roadWidthM: s.widthMeters || 8.0,
            status: 'VALID' as const,
            statusText: 'HỢP LỆ',
            laneCount: 4,
            surfaceMaterial: 'Mặt BTN C12.5',
            color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length]
          }))
          const validated = checkAndEnrichSegmentsContinuity(mapped)
          segmentsState.setSegments(validated)
          segmentsState.setSlabs(generateMockSlabs(validated.length))
        }
      } else {
        // Backend chưa có tim tuyến duyệt: kiểm tra xem có bản nháp đang chờ duyệt hoặc dữ liệu đã lưu không
        const state = alignmentService.getAlignmentState(prjId)
        if (state.status === 'PENDING_APPROVAL') {
          setAlignmentStatus('PENDING_APPROVAL')
        } else {
          setAlignmentStatus(state.status || 'DRAFT')
        }

        const saved = alignmentService.getAlignmentData(prjId)
        if (saved && saved.coords && saved.coords.length > 0) {
          setCurrentCoords(saved.coords)
          setCurrentKmPoints(saved.kmPoints || [])
          setImportedLengthKm(saved.totalLengthKm || calculateCoordsLengthKm(saved.coords))
          if (saved.segments && saved.segments.length > 0) {
            segmentsState.setSegments(saved.segments)
            segmentsState.setSlabs(generateMockSlabs(saved.segments.length))
          }
          if (saved.branches) {
            setBranches(saved.branches)
          }
        } else if (activeProject.defaultCoords && activeProject.defaultCoords.length > 0) {
          setCurrentCoords(activeProject.defaultCoords)
          setCurrentKmPoints(activeProject.defaultKmPoints || [])
          setImportedLengthKm(activeProject.lengthKm || calculateCoordsLengthKm(activeProject.defaultCoords))
          segmentsState.setSegments(activeProject.defaultSegments || [])
          segmentsState.setSlabs(generateMockSlabs((activeProject.defaultSegments || []).length))
          if (activeProject.defaultBranches) {
            setBranches(activeProject.defaultBranches)
          }
        } else {
          setCurrentCoords([])
          setCurrentKmPoints([])
          setImportedLengthKm(0)
          segmentsState.setSegments([])
          segmentsState.setSlabs([])
        }
      }
    } catch (err: any) {
      console.error('Lỗi tải gói tim tuyến:', err)
      showToast(`Lỗi nạp tim tuyến từ CSDL: ${err.response?.data?.detail || err.message}`)
    }
  }

  useEffect(() => {
    loadAlignmentPackage(selectedProjectId)
  }, [selectedProjectId])

  useEffect(() => {
    const handleStateChange = () => {
      const list = getAvailableAssignedProjects()
      setAssignedProjects(list)
      const state = alignmentService.getAlignmentState(selectedProjectId)
      setAlignmentStatus(state.status)
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [selectedProjectId])

  // Khôi phục danh sách dự án từ Backend khi F5 tải lại trang
  useEffect(() => {
    projectService
      .fetchProjects()
      .then(() => {
        const list = getAvailableAssignedProjects()
        if (list.length > 0) {
          setAssignedProjects(list)
          const targetId =
            urlProjectId && list.some((p) => p.id === urlProjectId)
              ? urlProjectId
              : selectedProjectId || list[0].id
          if (targetId && targetId !== selectedProjectId) {
            handleSwitchProject(targetId)
          }
        }
      })
      .catch((err) => {
        console.warn('Lỗi nạp dự án tim tuyến:', err)
      })
  }, [urlProjectId])


  // Trạng thái các Tab quản lý bên phải: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'
  const [rightTab, setRightTab] = useState<'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'>('SEGMENTS')

  // Cấu hình Kích thước tấm BTXM & Khe co giãn / Khe giãn nở
  const [slabLengthM, setSlabLengthM] = useState<number>(5.0)
  const [slabThicknessCm, setSlabThicknessCm] = useState<number>(26)
  const [contractionSpacingM, setContractionSpacingM] = useState<number>(5.0)
  const [expansionSpacingM, setExpansionSpacingM] = useState<number>(50.0)
  const [expansionGapMm, setExpansionGapMm] = useState<number>(20)
  const [syncJointWithSlab, setSyncJointWithSlab] = useState<boolean>(true)

  // Quản lý Tuyến nhánh (Branch Alignment)
  // Nếu là Giám sát (Supervisor) mà trạng thái dự án là DRAFT (PM chưa trình duyệt), Giám sát xem như chưa có tuyến
  const [branches, setBranches] = useState<any[]>(() => {
    const state = alignmentService.getAlignmentState(selectedProjectId)
    if (isSupervisor && state.status === 'DRAFT') return []
    const saved = alignmentService.getAlignmentData(selectedProjectId)
    if (saved.branches !== undefined) return saved.branches
    return activeProject.defaultBranches || []
  })
  const [selectedTargetType, setSelectedTargetType] = useState<'MAINLINE' | string>('MAINLINE')
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false)

  const roadWidthM = 8.0

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // State tọa độ tim tuyến và mốc lý trình đồng bộ toàn cục
  const [currentCoords, setCurrentCoords] = useState<[number, number][]>(() => {
    const state = alignmentService.getAlignmentState(selectedProjectId)
    if (isSupervisor && state.status === 'DRAFT') return []
    const saved = alignmentService.getAlignmentData(selectedProjectId)
    if (saved.coords !== undefined) return saved.coords
    return activeProject.defaultCoords || []
  })
  const [currentKmPoints, setCurrentKmPoints] = useState<number[]>(() => {
    const state = alignmentService.getAlignmentState(selectedProjectId)
    if (isSupervisor && state.status === 'DRAFT') return []
    const saved = alignmentService.getAlignmentData(selectedProjectId)
    if (saved.kmPoints !== undefined) return saved.kmPoints
    return activeProject.defaultKmPoints || []
  })
  const [importedLengthKm, setImportedLengthKm] = useState<number>(() => {
    const state = alignmentService.getAlignmentState(selectedProjectId)
    if (isSupervisor && state.status === 'DRAFT') return 0.0
    const saved = alignmentService.getAlignmentData(selectedProjectId)
    if (saved.coords && saved.coords.length >= 2) {
      return calculateCoordsLengthKm(saved.coords)
    }
    if (activeProject.defaultCoords && activeProject.defaultCoords.length >= 2) {
      return activeProject.lengthKm
    }
    return 0.0
  })

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
    const bLen = updatedBranches.reduce((sum, b) => {
      const len = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : b.lengthKm) || 0
      return sum + len
    }, 0)
    const newTotalKm = parseFloat((importedLengthKm + bLen).toFixed(3))

    alignmentService.saveAlignmentData(selectedProjectId, {
      coords: currentCoords,
      kmPoints: currentKmPoints,
      segments: segmentsState.segments,
      branches: updatedBranches
    })
    projectService.updateProjectAlignment(selectedProjectId, {
      length_km: newTotalKm,
      kml_status: 'CONFIRMED'
    })

    showToast(`Đã tạo thành công tuyến nhánh [${newBranch.code}] ${newBranch.name}`)
  }

  // Hook 1: Segments & Slabs State
  const initialSegments = useMemo(() => {
    const state = alignmentService.getAlignmentState(selectedProjectId)
    if (isSupervisor && state.status === 'DRAFT') return []
    const saved = alignmentService.getAlignmentData(selectedProjectId)
    return saved.segments || activeProject.defaultSegments
  }, [selectedProjectId, activeProject, isSupervisor])

  const segmentsState = useAlignmentSegmentsState({
    initialSegments,
    currentKmPoints,
    currentCoords,
    importedLengthKm,
    roadWidthM,
    showToast,
    syncMap: (...args) => mapState.syncMap(...args),
    mapRef: { current: null }, // updated dynamically below
    popupRef: { current: null },
    handleFitBounds: () => mapState.handleFitBounds()
  })

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
    onAutoSave: (coords, kmPoints, segs) => {
      const mainLen = calculateCoordsLengthKm(coords)
      const bLen = branches.reduce((sum, b) => {
        const len = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : b.lengthKm) || 0
        return sum + len
      }, 0)
      const totalKm = parseFloat((mainLen + bLen).toFixed(3))

      alignmentService.saveAlignmentData(selectedProjectId, {
        coords,
        kmPoints,
        segments: segs,
        branches
      })
      projectService.updateProjectAlignment(selectedProjectId, {
        length_km: totalKm,
        kml_status: 'CONFIRMED',
        stationing_text: `Km 0+000 ➔ Km ${totalKm.toFixed(3).replace('.', '+')}`
      })
    }
  })

  // Chuyển đổi dự án PM phụ trách
  const handleSwitchProject = (prjId: string) => {
    const list = getAvailableAssignedProjects()
    setAssignedProjects(list)
    const target = list.find((p) => p.id === prjId)
    if (!target) return
    setSelectedProjectId(prjId)

    // Nạp dữ liệu tim tuyến chính thức từ CSDL Backend Candidate3
    loadAlignmentPackage(prjId)

    showToast(`Đã chuyển sang dự án [${target.code}] ${target.name}`)
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
    return currentBranch?.lengthKm || 1.85
  }, [isMainline, importedLengthKm, currentBranch])

  // Cự ly chia đoạn đang kích hoạt
  const activeSplitDistance = useMemo(() => {
    if (isMainline) return segmentsState.splitDistance
    return currentBranch?.splitDistance || 0.5
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
      const dist = currentBranch.splitDistance || 0.5
      const totalLen = (currentBranch.coords && currentBranch.coords.length >= 2 ? calculateCoordsLengthKm(currentBranch.coords) : 0) || currentBranch.lengthKm || 1.0
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
          roadWidthM: currentBranch.roadWidthM || 8.0,
          status: 'VALID',
          statusText: 'HỢP LỆ',
          laneCount: currentBranch.laneCount || 2,
          surfaceMaterial: currentBranch.surfaceMaterial || 'Mặt BTN C12.5',
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
      if (splitKm <= segToSplit.startKm || splitKm >= segToSplit.endKm) {
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

    const bLen = updatedBranches.reduce((sum, b) => {
      const len = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : b.lengthKm) || 0
      return sum + len
    }, 0)
    const newTotalKm = parseFloat((importedLengthKm + bLen).toFixed(3))

    alignmentService.saveAlignmentData(selectedProjectId, {
      coords: currentCoords,
      kmPoints: currentKmPoints,
      segments: segmentsState.segments,
      branches: updatedBranches
    })
    projectService.updateProjectAlignment(selectedProjectId, {
      length_km: newTotalKm,
      kml_status: currentCoords.length > 0 ? 'CONFIRMED' : 'NOT_CONFIGURED'
    })

    showToast('Đã xóa tuyến nhánh thành công! Bạn có thể tạo lại tuyến nhánh mới.')
  }

  const handleSubmitAlignment = async () => {
    if (currentCoords.length < 2) {
      showToast('Cảnh báo: Tuyến đường chưa có tọa độ tim tuyến! Vui lòng nhập hoặc nạp tệp tọa độ trước khi trình duyệt.')
      return
    }
    if (segmentsState.segments.length === 0) {
      showToast('Cảnh báo: Tuyến đường chưa có phân đoạn nào! Vui lòng chọn cự ly và bấm "Áp dụng chia đoạn tự động" (hoặc nạp tệp tọa độ) trước khi trình duyệt.')
      return
    }
    const hasAnyGap = segmentsState.segments.some((s) => s.hasGap)
    if (hasAnyGap) {
      showToast('Cảnh báo: Tuyến đường còn phân đoạn bị hở hoặc chồng lấn (GAP_WARNING)! Vui lòng bấm "Nối tiếp giáp" trước khi trình duyệt.')
      return
    }

    let beSuccess = false
    let beErrorDetail = ''

    try {
      showToast('Đang khởi tạo hồ sơ CRS và bản nháp tim tuyến lên máy chủ...')
      const targetProjectId = activeProject?.id || selectedProjectId

      // 1. Đảm bảo cấu hình CRS UTM Zone 48N (API-065)
      try {
        await alignmentService.ensureUtm48NCrsProfile(targetProjectId)
      } catch (crsErr: any) {
        console.warn('Cảnh báo thiết lập CRS Profile:', crsErr)
      }

      // 2. Chuyển đổi tọa độ WGS84 sang UTM Zone 48N (SRID 32648)
      const utmCoords = currentCoords.map((c) => wgs84ToUtm48N(c[0], c[1]))

      // 3. Tạo profile bề rộng đường theo phân đoạn
      const originKm = activeProject.stationOriginKm || 0
      const widthProfile = segmentsState.segments.map((seg) => ({
        fromOffsetMeters: Math.max(0, parseFloat(((seg.startKm - originKm) * 1000).toFixed(2))),
        toOffsetMeters: Math.max(10, parseFloat(((seg.endKm - originKm) * 1000).toFixed(2))),
        widthMeters: seg.roadWidthM || 12.0
      }))

      // 4. Tạo bản thảo tim tuyến mới trên Backend (API-177)
      const draftRes = await alignmentService.createGeometryDraft(targetProjectId, {
        sourceKind: 'COORDINATES',
        sourceCrs: 32648,
        stationOriginMeters: originKm * 1000,
        coordinates: utmCoords,
        widthProfile,
        surveyWidthMeters: 14.0,
        changeReason: 'PM trình duyệt phương án tim tuyến và phân đoạn lý trình mới'
      })

      // 5. Kiểm tra preview trước khi trình (API-181)
      if (draftRes?.data?.id) {
        await alignmentService.previewGeometryDraft(targetProjectId, draftRes.data.id)
      }
      beSuccess = true
    } catch (err: any) {
      console.warn('Backend Candidate3 lưu bản nháp trả về:', err?.response?.data || err)
      beErrorDetail = err?.response?.data?.detail || err?.response?.data?.title || err?.message || ''
    }

    // 6. Luôn lưu trữ dữ liệu thiết kế và chuyển trạng thái sang PENDING_APPROVAL cho cả ID và Mã dự án
    const targetId = activeProject?.id || selectedProjectId
    const targetCode = activeProject?.code

    const payloadData = {
      coords: currentCoords,
      kmPoints: currentKmPoints,
      segments: segmentsState.segments,
      branches
    }

    alignmentService.saveAlignmentData(targetId, payloadData)
    alignmentService.submitAlignment(targetId, totalProjectLengthKm)

    if (targetCode && targetCode !== targetId) {
      alignmentService.saveAlignmentData(targetCode, payloadData)
      alignmentService.submitAlignment(targetCode, totalProjectLengthKm)
    }

    if (selectedProjectId !== targetId && selectedProjectId !== targetCode) {
      alignmentService.saveAlignmentData(selectedProjectId, payloadData)
      alignmentService.submitAlignment(selectedProjectId, totalProjectLengthKm)
    }

    setAlignmentStatus('PENDING_APPROVAL')

    if (beSuccess) {
      showToast('Đã tạo bản nháp tim tuyến trên CSDL và gửi sang Supervisor thẩm duyệt thành công!')
    } else {
      showToast(`Đã lưu phương án tim tuyến và trình duyệt sang Supervisor! (${beErrorDetail || 'Chờ máy chủ đồng bộ'})`)
    }
  }

  const handleLockAlignment = async () => {
    try {
      const draftInfo = alignmentService.getActiveDraftInfo(selectedProjectId)
      if (draftInfo?.draftId) {
        showToast('Đang gửi lệnh Supervisor phê duyệt khóa tim tuyến chính thức (API-180)...')
        await alignmentService.confirmGeometryDraft(
          selectedProjectId,
          draftInfo.draftId,
          {
            effectiveFrom: new Date().toISOString(),
            reason: 'Supervisor phê duyệt khóa tim tuyến chính thức'
          },
          draftInfo.etag
        )
      }

      alignmentService.saveAlignmentData(selectedProjectId, {
        coords: currentCoords,
        kmPoints: currentKmPoints,
        segments: segmentsState.segments,
        branches
      })
      alignmentService.confirmAlignment(selectedProjectId, user?.full_name || 'Supervisor', totalProjectLengthKm)
      
      // Tải lại gói dữ liệu tim tuyến chính thức đã được confirm
      await loadAlignmentPackage(selectedProjectId)
      setAlignmentStatus('CONFIRMED')
      showToast('Dự án đã chính thức được phê duyệt và khóa tim tuyến trên CSDL thành công!')
    } catch (err: any) {
      console.error('Lỗi phê duyệt tim tuyến:', err)
      const detail = err.response?.data?.detail || err.response?.data?.title || err.message
      showToast(`Lỗi phê duyệt tim tuyến từ CSDL: ${detail}`)
    }
  }


  // Xóa toàn bộ tim tuyến chính và các phân đoạn để PM nhập hoặc vẽ lại từ đầu
  const handleClearMainline = () => {
    setCurrentCoords([])
    setCurrentKmPoints([])
    setImportedLengthKm(0)
    setBranches([])
    setSelectedTargetType('MAINLINE')
    importState.setManualCoordsText('')

    segmentsState.setSegments([])
    segmentsState.setSlabs([])
    segmentsState.setSelectedSegmentId(null)

    alignmentService.saveAlignmentData(selectedProjectId, {
      coords: [],
      kmPoints: [],
      segments: [],
      branches: []
    })
    projectService.updateProjectAlignment(selectedProjectId, {
      length_km: 0,
      kml_status: 'NOT_CONFIGURED',
      stationing_text: 'Chưa có lý trình'
    })

    // Đồng bộ ngay với bản đồ MapLibre
    mapState.syncMap([], null, [], [], [])
    if (mapState.markersRef.current) {
      mapState.markersRef.current.forEach((m) => m.remove())
      mapState.markersRef.current = []
    }
    mapState.handleFitBounds([])

    showToast('Đã xóa toàn bộ tim tuyến chính và các mốc lý trình! Bạn có thể bấm "Nhập Tuyến / Tọa độ" để nạp lại.')
  }

  const basePath = isSupervisor ? '/sup' : '/pm'

  return {
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

