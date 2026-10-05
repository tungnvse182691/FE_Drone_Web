import { useState, useMemo } from 'react'
import {
  DefectItem as DispatchDefectItem,
  WorkMode,
  RouteConfig
} from './types'
import { CREW_TEAMS, INITIAL_DEFECTS } from './mockData'

export function useFastTrackDispatch(
  currentRouteConfig: RouteConfig,
  showToast: (msg: string) => void
) {
  const crewTeams = CREW_TEAMS
  const [defects, setDefects] = useState<DispatchDefectItem[]>(INITIAL_DEFECTS)
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>(['DEF-01', 'DEF-02', 'DEF-03'])
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

  const handleRouteChange = (newRouteId: string) => {
    setRouteFilter(newRouteId)
    const newRouteDefects = defects.filter((d) => d.routeId === newRouteId)
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
      showToast(
        `⚠️ LƯU Ý: Hư hỏng ${currentDefect.code} chưa vượt ngưỡng an toàn. Bắt buộc nhập lý do giải trình trong Modal trước khi phát lệnh!`
      )
    }
    setIsDispatchModalOpen(true)
  }

  const handleExecuteDispatch = () => {
    if (selectedDefectIds.length === 0) return

    if (workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible) {
      if (!dispatchNotes || dispatchNotes.trim().length < 15) {
        showToast(
          'BẮT BUỘC: Hư hỏng chưa vượt ngưỡng an toàn! Vui lòng nhập lý do giải trình khẩn cấp vào ô Chỉ đạo (tối thiểu 15 ký tự).'
        )
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
    handleChangeWorkMode,
    handleAssignCrew,
    handleDispatchBatch,
    handleRepairDirect,
    handleEmergencyDispatch,
    handleExecuteDispatch
  }
}
