import { useState, useMemo, useEffect } from 'react'
import {
  DefectItem as DispatchDefectItem,
  CrewTeam
} from './types'
import { fastTrackService } from '../../../api/services/fastTrackService'

export function useFastTrackDispatch(
  selectedProjectId: string,
  showToast: (msg: string) => void
) {
  const [crewTeams, setCrewTeams] = useState<CrewTeam[]>([])
  const [defects, setDefects] = useState<DispatchDefectItem[]>([])
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>([])

  const [crewFilter, setCrewFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [selectedDispatchCrew, setSelectedDispatchCrew] = useState('')
  const [dispatchNotes, setDispatchNotes] = useState(
    'Yêu cầu kiểm tra bằng thước cơ khí, chụp đầy đủ ảnh đối chiếu lý trình.'
  )
  const [detailDefect, setDetailDefect] = useState<DispatchDefectItem | null>(null)

  // Tải dữ liệu thật từ CSDL Backend khi đổi dự án
  useEffect(() => {
    if (!selectedProjectId) return
    let isMounted = true

    const loadDispatchData = async () => {
      try {
        const [loadedDefects, loadedCrews] = await Promise.all([
          fastTrackService.getDefects(selectedProjectId),
          fastTrackService.getCrews(selectedProjectId)
        ])
        if (isMounted) {
          if (loadedDefects) {
            setDefects(loadedDefects)
            const eligible = loadedDefects.filter((d) => d.isFastTrackEligible).map((d) => d.id)
            setSelectedDefectIds(eligible)
          }
          if (loadedCrews) {
            setCrewTeams(loadedCrews)
            if (loadedCrews.length > 0) {
              setSelectedDispatchCrew(loadedCrews[0].name)
            }
          }
        }
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu điều phối từ CSDL Backend:', err)
        showToast('Lỗi khi tải dữ liệu từ CSDL Backend')
      }
    }

    loadDispatchData()
    return () => {
      isMounted = false
    }
  }, [selectedProjectId, showToast])

  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      if (crewFilter !== 'ALL' && d.assignedCrew && !d.assignedCrew.includes(crewFilter)) return false
      if (statusFilter === 'ELIGIBLE' && !d.isFastTrackEligible) return false
      if (statusFilter === 'VIOLATION' && d.isFastTrackEligible) return false
      return true
    })
  }, [defects, crewFilter, statusFilter])

  const selectedItems = useMemo(() => {
    return defects.filter((d) => selectedDefectIds.includes(d.id))
  }, [defects, selectedDefectIds])

  const hasViolationItem = useMemo(() => {
    return selectedItems.some((d) => !d.isFastTrackEligible)
  }, [selectedItems])

  const handleToggleSelect = (id: string) => {
    setSelectedDefectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDefectIds(filteredDefects.map((d) => d.id))
    } else {
      setSelectedDefectIds([])
    }
  }

  const handleRemoveViolationItems = () => {
    const validIds = selectedItems.filter((d) => d.isFastTrackEligible).map((d) => d.id)
    setSelectedDefectIds(validIds)
    showToast('Đã loại bỏ các khiếm khuyết vi phạm ngưỡng khỏi danh sách chọn!')
  }

  const handleAssignCrew = (defectId: string, crew: string) => {
    setDefects((prev) =>
      prev.map((d) => (d.id === defectId ? { ...d, assignedCrew: crew } : d))
    )
    showToast(`Đã phân công ${crew} cho khiếm khuyết!`)
  }

  const handleExecuteDispatch = async () => {
    if (selectedDefectIds.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 khiếm khuyết')
      return
    }

    try {
      const res = await fastTrackService.executeDispatch({
        defectIds: selectedDefectIds,
        crewName: selectedDispatchCrew,
        notes: dispatchNotes
      })

      setDefects((prev) =>
        prev.map((d) =>
          selectedDefectIds.includes(d.id) ? { ...d, assignedCrew: selectedDispatchCrew } : d
        )
      )

      setIsDispatchModalOpen(false)
      showToast(res.message)
    } catch (err: any) {
      showToast(`Lỗi điều phối: ${err.message}`)
    }
  }

  return {
    crewTeams,
    setCrewTeams,
    defects,
    setDefects,
    selectedDefectIds,
    setSelectedDefectIds,
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
    handleToggleSelect,
    handleSelectAll,
    handleRemoveViolationItems,
    handleAssignCrew,
    handleExecuteDispatch
  }
}
