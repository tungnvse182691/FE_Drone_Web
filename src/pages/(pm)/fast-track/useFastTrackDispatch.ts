import { useState, useMemo, useEffect } from 'react'
import {
  DefectItem as DispatchDefectItem,
  WorkMode,
  RouteConfig,
  CrewTeam
} from './types'
import { CREW_TEAMS, INITIAL_DEFECTS } from './mockData'
import { fastTrackService } from '../../../api/services/fastTrackService'

export function useFastTrackDispatch(
  currentRouteConfig: RouteConfig,
  showToast: (msg: string) => void
) {
  const [crewTeams, setCrewTeams] = useState<CrewTeam[]>(CREW_TEAMS)
  const [defects, setDefects] = useState<DispatchDefectItem[]>(INITIAL_DEFECTS)
  // Mặc định chỉ chọn các lỗi ĐẠT CHUẨN Fast Track (bỏ lỗi vi phạm ngưỡng)
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>(['DEF-01', 'DEF-02'])
  const [workMode, setWorkMode] = useState<WorkMode>('MEASURE_ONLY')

  const [routeFilter, setRouteFilter] = useState('QL1A_PK04')
  const [crewFilter, setCrewFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [selectedDispatchCrew, setSelectedDispatchCrew] = useState('Tổ đo đạc số 02')
  const [dispatchNotes, setDispatchNotes] = useState(
    'Yêu cầu kiểm tra bằng thước cơ khí, chụp đầy đủ ảnh đối chiếu lý trình.'
  )
  const [detailDefect, setDetailDefect] = useState<DispatchDefectItem | null>(null)

  // Khởi tạo từ async Mock API Service (Zero localStorage)
  useEffect(() => {
    let isMounted = true
    const loadDispatchData = async () => {
      try {
        const [loadedDefects, loadedCrews] = await Promise.all([
          fastTrackService.getDefects(),
          fastTrackService.getCrews()
        ])
        if (isMounted) {
          if (loadedDefects && loadedDefects.length > 0) setDefects(loadedDefects)
          if (loadedCrews && loadedCrews.length > 0) setCrewTeams(loadedCrews)
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu điều phối từ Mock API:', err)
      }
    }
    loadDispatchData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleRouteChange = (newRouteId: string) => {
    setRouteFilter(newRouteId)
    // Chỉ chọn các defect ĐẠT CHUẨN của tuyến mới
    const newRouteDefects = defects.filter((d) => d.routeId === newRouteId && d.isFastTrackEligible)
    setSelectedDefectIds(newRouteDefects.slice(0, 2).map((d) => d.id))
  }

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
    const target = defects.find((d) => d.id === id)
    // Chặn không cho chọn lỗi vi phạm ngưỡng trong luồng Fast Track Đo & Sửa ngay (BR-04)
    if (target && !target.isFastTrackEligible && workMode === 'INSPECT_AND_REPAIR') {
      showToast(`Không thể chọn ${target.code}: Chế độ Đo & Sửa ngay chỉ áp dụng cho hư hỏng nhỏ đạt chuẩn Fast Track (BR-04). Với lỗi lớn gây ùn tắc, vui lòng chuyển sang Chế độ Xử lý khẩn cấp!`)
      return
    }

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
      // CHỈ CHỌN CÁC LỖI ĐẠT CHUẨN FAST TRACK
      const eligibleItems = filteredDefects.filter((d) => d.isFastTrackEligible)
      setSelectedDefectIds(eligibleItems.map((d) => d.id))
      const violationCount = filteredDefects.length - eligibleItems.length
      if (violationCount > 0) {
        showToast(`Đã tự động lọc bỏ ${violationCount} khiếm khuyết vi phạm ngưỡng. Chỉ chọn các lỗi đạt chuẩn Fast Track!`)
      }
    } else {
      setSelectedDefectIds([])
    }
  }

  const handleRemoveViolationItems = () => {
    setSelectedDefectIds((prev) =>
      prev.filter((id) => {
        const item = defects.find((d) => d.id === id)
        return item ? item.isFastTrackEligible : true
      })
    )
    showToast('Đã loại bỏ toàn bộ các khiếm khuyết vượt ngưỡng ra khỏi danh sách giao việc.')
  }

  const handleChangeWorkMode = (mode: WorkMode) => {
    setWorkMode(mode)
    if (mode === 'INSPECT_AND_REPAIR') {
      const firstEligible = filteredDefects.find((d) => selectedDefectIds.includes(d.id) && d.isFastTrackEligible)
      if (firstEligible) {
        setSelectedDefectIds([firstEligible.id])
      } else if (filteredDefects.length > 0) {
        const fallbackEligible = filteredDefects.find((d) => d.isFastTrackEligible)
        if (fallbackEligible) {
          setSelectedDefectIds([fallbackEligible.id])
        }
      }
    } else if (mode === 'EMERGENCY') {
      if (selectedDefectIds.length > 1) {
        setSelectedDefectIds([selectedDefectIds[0]])
      } else if (selectedDefectIds.length === 0 && filteredDefects.length > 0) {
        setSelectedDefectIds([filteredDefects[0].id])
      }
    }
  }

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
    // Chặn giao việc tuyệt đối nếu có lỗi vi phạm ngưỡng
    if (hasViolationItem) {
      showToast('CHẶN GIAO VIỆC: Danh sách chứa hạng mục vi phạm ngưỡng chính sách Fast Track! Bắt buộc loại bỏ hoặc gom vào Gói đề xuất sửa chữa lớn.')
      return
    }
    setIsDispatchModalOpen(true)
  }

  const handleRepairDirect = () => {
    if (hasViolationItem) {
      showToast('KHÔNG THỂ THỰC HIỆN: Hạng mục được chọn vi phạm ngưỡng chính sách Fast Track!')
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
      showToast(
        `⚠️ LƯU Ý: Hư hỏng ${currentDefect.code} chưa vượt ngưỡng an toàn. Bắt buộc nhập lý do giải trình trong Modal trước khi phát lệnh!`
      )
    }
    setIsDispatchModalOpen(true)
  }

  const handleExecuteDispatch = async () => {
    if (selectedDefectIds.length === 0) return

    if (hasViolationItem && workMode !== 'EMERGENCY') {
      showToast('LỖI BẢO MẬT QUY CHUẨN: Không được phép giao việc Fast Track cho hạng mục vi phạm ngưỡng!')
      return
    }

    if (workMode === 'EMERGENCY') {
      if (!dispatchNotes || dispatchNotes.trim().length < 10) {
        showToast(
          'BẮT BUỘC: Lệnh khẩn cấp 24/7 yêu cầu nhập lý do hiện trường / chỉ đạo phân luồng (tối thiểu 10 ký tự) để phục vụ Supervisor hậu kiểm!'
        )
        return
      }
    }

    // Gửi qua Mock API Service
    const selectedCrewObj = crewTeams.find((c) => c.name === selectedDispatchCrew)
    const crewId = selectedCrewObj ? selectedCrewObj.id : 'crew-02'

    await fastTrackService.executeDispatch({
      defectIds: selectedDefectIds,
      workMode,
      crewId,
      notes: dispatchNotes
    })

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
    crewTeams,
    defects,
    setDefects,
    selectedDefectIds,
    setSelectedDefectIds,
    workMode,
    setWorkMode,
    routeFilter,
    setRouteFilter,
    crewFilter,
    setCrewFilter,
    statusFilter,
    setStatusFilter,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    selectedDispatchCrew,
    setSelectedDispatchCrew,
    dispatchNotes,
    setDispatchNotes,
    detailDefect,
    setDetailDefect,
    filteredDefects,
    selectedItems,
    hasViolationItem,
    surveyDistanceM,
    handleRouteChange,
    handleToggleSelect,
    handleSelectAll,
    handleRemoveViolationItems,
    handleChangeWorkMode,
    handleAssignCrew,
    handleDispatchBatch,
    handleRepairDirect,
    handleEmergencyDispatch,
    handleExecuteDispatch
  }
}
