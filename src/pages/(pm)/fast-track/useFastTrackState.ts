import { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import {
  PolicyThresholdConfig,
  DefectItem as DispatchDefectItem,
  PolicyHistoryItem,
  AuditLogItem,
  WorkMode
} from './types'
import {
  ROUTE_CONFIGS,
  INITIAL_POLICY,
  INITIAL_POLICY_HISTORY,
  INITIAL_AUDIT_LOGS,
  CREW_TEAMS,
  INITIAL_DEFECTS
} from './mockData'
import { initFastTrackMap } from './fastTrackMapSetup'

export const useFastTrackState = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()

  // Trạng thái hồ sơ được tự động điều phối từ Hộp thư tiếp nhận (Triage Inbox)
  const [autoDispatchedSourceCase, setAutoDispatchedSourceCase] = useState<{
    code: string
    title: string
    stationing: string
    isEligible: boolean
  } | null>(null)

  // 1. DỮ LIỆU CHÍNH SÁCH FAST TRACK HIỆN HÀNH
  const [currentPolicy, setCurrentPolicy] = useState<PolicyThresholdConfig>(INITIAL_POLICY)
  const [policyHistory, setPolicyHistory] = useState<PolicyHistoryItem[]>(INITIAL_POLICY_HISTORY)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS)

  // Form states cho Modal Tạo chính sách mới
  const [formVersionName, setFormVersionName] = useState('Policy v2.2')
  const [formMaxArea, setFormMaxArea] = useState('0.60')
  const [formMaxDepth, setFormMaxDepth] = useState('5.5')
  const [formSlaHours, setFormSlaHours] = useState('24')
  const [formMaxPerimeter, setFormMaxPerimeter] = useState('3.0')
  const [formPolicyNote, setFormPolicyNote] = useState(
    'Điều chỉnh theo phụ lục hợp đồng bảo dưỡng thường xuyên quý IV/2026.'
  )

  // 2. DANH SÁCH TỔ ĐỘI THI CÔNG
  const crewTeams = CREW_TEAMS

  // 3. DANH SÁCH KHIẾM KHUYẾT CHỜ ĐIỀU PHỐI
  const [defects, setDefects] = useState<DispatchDefectItem[]>(INITIAL_DEFECTS)
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>(['DEF-01', 'DEF-02', 'DEF-03'])
  const [workMode, setWorkMode] = useState<WorkMode>('MEASURE_ONLY')

  // Bộ lọc
  const [routeFilter, setRouteFilter] = useState('QL1A_PK04')
  const [crewFilter, setCrewFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [selectedDispatchCrew, setSelectedDispatchCrew] = useState('Tổ đo đạc số 02')
  const [dispatchNotes, setDispatchNotes] = useState(
    'Yêu cầu kiểm tra bằng thước cơ khí, chụp đầy đủ ảnh đối chiếu lý trình.'
  )
  const [detailDefect, setDetailDefect] = useState<DispatchDefectItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Handler tạo hoặc kích hoạt chính sách mới
  const handleApplyPolicy = (action: 'ACTIVATE' | 'DRAFT') => {
    const area = parseFloat(formMaxArea) || 0.5
    const depth = parseFloat(formMaxDepth) || 5.0
    const sla = parseInt(formSlaHours, 10) || 24
    const perimeter = parseFloat(formMaxPerimeter) || 3.0
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const nowDate = new Date().toLocaleDateString('vi-VN')
    const timeStr = `${nowTime} ${nowDate}`

    if (action === 'ACTIVATE') {
      const updatedPolicy: PolicyThresholdConfig = {
        version: formVersionName,
        status: 'ACTIVE',
        maxAreaM2: area,
        maxDepthCm: depth,
        maxPerimeterM: perimeter,
        allowedSeverities: ['LOW', 'MEDIUM'],
        slaHours: sla,
        activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
        activatedAt: `${nowTime} • ${nowDate}`,
        appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
        description: `Quy chuẩn kích hoạt tự động ${formVersionName}: Diện tích ≤ ${area}m², Độ sâu ≤ ${depth}cm.`
      }
      setCurrentPolicy(updatedPolicy)

      setPolicyHistory((prev) => [
        {
          id: `pol-${Date.now()}`,
          version: formVersionName,
          displayName: `${formVersionName} (Hiện hành)`,
          status: 'ACTIVE',
          activatedBy: 'PM Hoàng',
          activatedAt: timeStr,
          route: `Áp dụng toàn tuyến QL1A (Km 1000 - Km 1080)`,
          maxArea: area,
          maxDepth: depth,
          slaHours: sla,
          maxPerimeter: perimeter
        },
        ...prev.map((p) => ({
          ...p,
          displayName: (p.displayName || p.version).replace(' (Hiện hành)', ' (Lưu trữ)'),
          status: (p.status === 'ACTIVE' ? 'ARCHIVED' : p.status) as 'ACTIVE' | 'ARCHIVED' | 'DRAFT'
        }))
      ])

      const newAudit: AuditLogItem = {
        title: `Kích hoạt ${formVersionName} (ACTIVE)`,
        time: `${nowDate} ${nowTime}:00`,
        user: 'Nguyễn Văn Hoàng (PM)',
        hash: `sha256:${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        note: `Nâng ngưỡng Fast Track: Diện tích ≤ ${area} m², Độ sâu ≤ ${depth} cm, SLA ≤ ${sla}h. ${formPolicyNote}`
      }
      setAuditLogs((prev) => [newAudit, ...prev])

      setDefects((prev) =>
        prev.map((d) => {
          const isEligible = d.areaM2 <= area && d.depthCm <= depth
          return {
            ...d,
            isFastTrackEligible: isEligible,
            violationReason: isEligible
              ? undefined
              : `Diện tích ${d.areaM2} m² (> ${area} m²) hoặc Độ sâu ${d.depthCm} cm (> ${depth} cm)`
          }
        })
      )

      showToast(`ĐÃ KÍCH HOẠT CHÍNH SÁCH ${formVersionName}! Ngưỡng kỹ thuật và bảng khiếm khuyết đã cập nhật.`)
    } else {
      setPolicyHistory((prev) => [
        {
          id: `pol-${Date.now()}`,
          version: formVersionName,
          displayName: `${formVersionName} (Dự thảo)`,
          status: 'DRAFT',
          activatedBy: 'PM Hoàng (Đang soạn)',
          activatedAt: timeStr,
          route: `Ngưỡng diện tích ≤ ${area} m² • Độ sâu ≤ ${depth} cm`,
          maxArea: area,
          maxDepth: depth,
          slaHours: sla,
          maxPerimeter: perimeter
        },
        ...prev
      ])
      showToast(`Đã lưu dự thảo ${formVersionName} vào danh sách lịch sử chính sách!`)
    }

    setIsPolicyModalOpen(false)
  }

  // Handler kích hoạt một bản dự thảo từ danh sách lịch sử
  const handleActivateDraft = (item: (typeof policyHistory)[0]) => {
    setCurrentPolicy({
      version: item.version,
      status: 'ACTIVE',
      maxAreaM2: item.maxArea,
      maxDepthCm: item.maxDepth,
      maxPerimeterM: item.maxPerimeter || 3.0,
      allowedSeverities: ['LOW', 'MEDIUM'],
      slaHours: item.slaHours,
      activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
      activatedAt: 'Vừa kích hoạt',
      appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
      description: `Quy chuẩn kích hoạt tự động ${item.version}: Diện tích ≤ ${item.maxArea}m², Độ sâu ≤ ${item.maxDepth}cm.`
    })

    setPolicyHistory((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          return { ...p, displayName: `${p.version} (Hiện hành)`, status: 'ACTIVE', activatedAt: 'Vừa kích hoạt' }
        }
        if (p.status === 'ACTIVE') {
          return { ...p, displayName: (p.displayName || p.version).replace(' (Hiện hành)', ' (Lưu trữ)'), status: 'ARCHIVED' }
        }
        return p
      })
    )

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const nowDate = new Date().toLocaleDateString('vi-VN')
    setAuditLogs((prev) => [
      {
        title: `Kích hoạt dự thảo ${item.version} (ACTIVE)`,
        time: `${nowDate} ${nowTime}:00`,
        user: 'Nguyễn Văn Hoàng (PM)',
        hash: `sha256:${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        note: `Chuyển dự thảo sang chính sách vận hành chính thức: Diện tích ≤ ${item.maxArea} m², Độ sâu ≤ ${item.maxDepth} cm.`
      },
      ...prev
    ])

    setDefects((prev) =>
      prev.map((d) => {
        const isEligible = d.areaM2 <= item.maxArea && d.depthCm <= item.maxDepth
        return {
          ...d,
          isFastTrackEligible: isEligible,
          violationReason: isEligible
            ? undefined
            : `Diện tích ${d.areaM2} m² (> ${item.maxArea} m²) hoặc Độ sâu ${d.depthCm} cm (> ${item.maxDepth} cm)`
        }
      })
    )

    showToast(`Đã kích hoạt thành công ${item.version} làm chính sách hiện hành!`)
  }

  const currentRouteConfig = useMemo(() => {
    return ROUTE_CONFIGS[routeFilter] || ROUTE_CONFIGS.QL1A_PK04
  }, [routeFilter])

  const handleRouteChange = (newRouteId: string) => {
    setRouteFilter(newRouteId)
    const newRouteDefects = defects.filter((d) => d.routeId === newRouteId)
    setSelectedDefectIds(newRouteDefects.slice(0, 2).map((d) => d.id))
  }

  // Tự động nhận diện và tick chọn khiếm khuyết được chuyển từ Hộp thư tiếp nhận (Triage Inbox)
  useEffect(() => {
    const paramDefectCode = searchParams.get('defectCode')
    const incomingTargetDefect = location.state?.targetDefect

    if (paramDefectCode || incomingTargetDefect) {
      const codeToMatch = paramDefectCode || incomingTargetDefect?.code
      const existingDefect = defects.find(
        (d) => d.code === codeToMatch || (incomingTargetDefect && d.id === incomingTargetDefect.id)
      )

      if (existingDefect) {
        setSelectedDefectIds([existingDefect.id])
        setRouteFilter(existingDefect.routeId)
        if (existingDefect.isFastTrackEligible) {
          setWorkMode('INSPECT_AND_REPAIR')
        } else {
          setWorkMode('MEASURE_ONLY')
        }
        setAutoDispatchedSourceCase({
          code: existingDefect.code,
          title: existingDefect.type,
          stationing: existingDefect.stationing,
          isEligible: existingDefect.isFastTrackEligible
        })
        showToast(`⚡ Đã tự động chọn hồ sơ [${existingDefect.code}] từ Hộp thư tiếp nhận!`)
      } else if (incomingTargetDefect) {
        const area = incomingTargetDefect.area_sqm || 0.45
        const depth = incomingTargetDefect.max_depth_cm || 4.2
        const isEligible =
          area <= currentPolicy.maxAreaM2 &&
          depth <= currentPolicy.maxDepthCm &&
          currentPolicy.allowedSeverities.includes(incomingTargetDefect.severity)

        const newDefect: DispatchDefectItem = {
          id: incomingTargetDefect.id,
          code: incomingTargetDefect.code,
          routeId: incomingTargetDefect.project_id === 'prj-ql1a-01' ? 'QL1A_PK01' : 'QL1A_PK04',
          routeName: incomingTargetDefect.project_name || 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
          stationing: incomingTargetDefect.stationing || 'Km 1024+300',
          kmValue: 1024.3,
          lane: incomingTargetDefect.lane || 'Làn xe máy',
          type: incomingTargetDefect.defect_title || 'Ổ gà sụt lún mặt đường',
          areaM2: area,
          depthCm: depth,
          isFastTrackEligible: isEligible,
          violationReason: isEligible ? undefined : 'Diện tích hoặc độ sâu vượt ngưỡng chính sách Fast Track hiện hành',
          assignedCrew: 'Chưa chỉ định',
          gps: {
            lat: incomingTargetDefect.gps?.lat || 16.0560,
            lng: incomingTargetDefect.gps?.lng || 108.2025
          },
          image: incomingTargetDefect.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
          aiConfidence: incomingTargetDefect.ai_confidence || 94
        }

        setDefects((prev) => [newDefect, ...prev.filter((d) => d.code !== newDefect.code)])
        setSelectedDefectIds([newDefect.id])
        setRouteFilter(newDefect.routeId)
        if (isEligible) {
          setWorkMode('INSPECT_AND_REPAIR')
        } else {
          setWorkMode('MEASURE_ONLY')
        }
        setAutoDispatchedSourceCase({
          code: newDefect.code,
          title: newDefect.type,
          stationing: newDefect.stationing,
          isEligible
        })
        showToast(`⚡ Đã tự động nạp & chọn hồ sơ [${newDefect.code}] từ Hộp thư tiếp nhận!`)
      }
    }
  }, [searchParams, location.state])

  // MapLibre Container & Instance
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'VECTOR'>('SATELLITE')

  // Lọc danh sách khiếm khuyết theo Tuyến đường + Đội + Trạng thái
  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      if (d.routeId !== routeFilter) return false
      if (crewFilter !== 'ALL' && !d.assignedCrew.includes(crewFilter)) return false
      if (statusFilter === 'ELIGIBLE' && !d.isFastTrackEligible) return false
      if (statusFilter === 'VIOLATION' && d.isFastTrackEligible) return false
      return true
    })
  }, [defects, routeFilter, crewFilter, statusFilter])

  const selectedItems = useMemo(() => {
    return defects.filter((d) => selectedDefectIds.includes(d.id))
  }, [defects, selectedDefectIds])

  const hasViolationItem = useMemo(() => {
    return selectedItems.some((d) => !d.isFastTrackEligible)
  }, [selectedItems])

  const surveyDistanceM = useMemo(() => {
    if (selectedItems.length <= 1) return 0
    const kms = selectedItems.map((i) => i.kmValue)
    const min = Math.min(...kms)
    const max = Math.max(...kms)
    return Math.round((max - min) * 1000)
  }, [selectedItems])

  const handleToggleSelect = (id: string) => {
    if (workMode === 'INSPECT_AND_REPAIR' || workMode === 'EMERGENCY') {
      setSelectedDefectIds([id])
      return
    }
    setSelectedDefectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (workMode !== 'MEASURE_ONLY') return
    if (checked) {
      setSelectedDefectIds(filteredDefects.map((d) => d.id))
    } else {
      setSelectedDefectIds([])
    }
  }

  const handleChangeWorkMode = (mode: WorkMode) => {
    setWorkMode(mode)
    if (mode === 'INSPECT_AND_REPAIR' || mode === 'EMERGENCY') {
      const firstEligible = filteredDefects.find((d) => selectedDefectIds.includes(d.id) && d.isFastTrackEligible)
      if (firstEligible) {
        setSelectedDefectIds([firstEligible.id])
      } else if (selectedDefectIds.length > 0) {
        setSelectedDefectIds([selectedDefectIds[0]])
      } else if (filteredDefects.length > 0) {
        setSelectedDefectIds([filteredDefects[0].id])
      }
    }
  }

  // MapLibre GL Integration
  useEffect(() => {
    if (!mapContainerRef.current) return

    const { cleanup } = initFastTrackMap(
      mapContainerRef.current,
      currentRouteConfig,
      mapLayer,
      defects,
      routeFilter,
      selectedDefectIds,
      (defect) => setDetailDefect(defect)
    )

    return () => cleanup()
  }, [defects, selectedDefectIds, mapLayer, routeFilter, currentRouteConfig])

  const handleAssignCrew = (defectId: string, newCrew: string) => {
    setDefects((prev) =>
      prev.map((d) => (d.id === defectId ? { ...d, assignedCrew: newCrew } : d))
    )
    showToast(`Đã phân công ${newCrew} phụ trách khiếm khuyết!`)
  }

  const handleDispatchBatch = () => {
    if (selectedDefectIds.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 khiếm khuyết để giao việc.')
      return
    }
    setIsDispatchModalOpen(true)
  }

  const handleRepairDirect = () => {
    if (hasViolationItem) {
      showToast('KHÔNG THỂ THỰC HIỆN: Danh sách có hạng mục vi phạm ngưỡng Fast Track!')
      return
    }
    if (selectedDefectIds.length !== 1) {
      showToast('Chế độ Đo và Sửa ngay (Fast Track Direct) chỉ áp dụng cho đúng 1 lỗi đơn lẻ!')
      return
    }
    setIsDispatchModalOpen(true)
  }

  const handleEmergencyDispatch = () => {
    if (selectedDefectIds.length !== 1) {
      showToast('Quy tắc BR-08: Chế độ Khẩn cấp chỉ chọn đúng 1 vị trí nguy hiểm!')
      return
    }
    const currentDefect = selectedItems[0]
    if (currentDefect && currentDefect.isFastTrackEligible) {
      showToast(`⚠️ LƯU Ý: Hư hỏng ${currentDefect.code} chưa vượt ngưỡng an toàn. Bắt buộc nhập lý do giải trình trong Modal trước khi phát lệnh!`)
    }
    setIsDispatchModalOpen(true)
  }

  const handleExecuteDispatch = () => {
    if (selectedDefectIds.length === 0) return

    if (workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible) {
      if (!dispatchNotes || dispatchNotes.trim().length < 15) {
        showToast('BẮT BUỘC: Hư hỏng chưa vượt ngưỡng an toàn! Vui lòng nhập lý do giải trình khẩn cấp vào ô Chỉ đạo (tối thiểu 15 ký tự).')
        return
      }
    }

    setDefects((prev) =>
      prev.map((d) =>
        selectedDefectIds.includes(d.id) ? { ...d, assignedCrew: selectedDispatchCrew } : d
      )
    )

    setIsDispatchModalOpen(false)
    const modeLabel =
      workMode === 'MEASURE_ONLY'
        ? 'Gom lô đo đạc'
        : workMode === 'INSPECT_AND_REPAIR'
        ? 'Đo & Sửa ngay Fast Track'
        : 'Khẩn cấp 24/7'

    if (workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible) {
      showToast(
        `ĐÃ PHÁT LỆNH KHẨN CẤP ĐẶC BIỆT: Đã điều xe 24/7 cho ${selectedItems[0]?.code} (Hư hỏng chưa vượt ngưỡng, lý do: "${dispatchNotes.slice(0, 35)}..."). Đã lưu vào nhật ký!`
      )
    } else {
      showToast(
        `Đã phát lệnh [${modeLabel}] cho ${selectedDispatchCrew} (${selectedDefectIds.length} hạng mục trên ${currentRouteConfig.code}, cự ly ${surveyDistanceM}m). Đã đồng bộ sang App Mobile!`
      )
    }
  }

  return {
    autoDispatchedSourceCase,
    setAutoDispatchedSourceCase,
    currentPolicy,
    policyHistory,
    auditLogs,
    formVersionName,
    setFormVersionName,
    formMaxArea,
    setFormMaxArea,
    formMaxDepth,
    setFormMaxDepth,
    formSlaHours,
    setFormSlaHours,
    formMaxPerimeter,
    setFormMaxPerimeter,
    formPolicyNote,
    setFormPolicyNote,
    handleApplyPolicy,
    handleActivateDraft,
    crewTeams,
    defects,
    selectedDefectIds,
    setSelectedDefectIds,
    workMode,
    routeFilter,
    crewFilter,
    setCrewFilter,
    statusFilter,
    setStatusFilter,
    isPolicyModalOpen,
    setIsPolicyModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    selectedDispatchCrew,
    setSelectedDispatchCrew,
    dispatchNotes,
    setDispatchNotes,
    detailDefect,
    setDetailDefect,
    toastMessage,
    setToastMessage,
    showToast,
    currentRouteConfig,
    handleRouteChange,
    mapContainerRef,
    mapLayer,
    setMapLayer,
    filteredDefects,
    selectedItems,
    hasViolationItem,
    surveyDistanceM,
    handleToggleSelect,
    handleSelectAll,
    handleChangeWorkMode,
    handleAssignCrew,
    handleDispatchBatch,
    handleRepairDirect,
    handleEmergencyDispatch,
    handleExecuteDispatch
  }
}
