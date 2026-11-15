import { useState, useMemo, useEffect } from 'react'
import {
  DefectItem as DispatchDefectItem,
  CrewTeam, FastTrackTaskInput
} from './types'
import { useAuthStore } from '../../../store/authStore'
import { exportError } from '../../../api/services/projectExportService'
import { fastTrackService } from '../../../api/services/fastTrackService'

export function useFastTrackDispatch(
  selectedProjectId: string,
  showToast: (msg: string) => void
) {
  const epoch=useAuthStore(s=>s.authEpoch)
  const [revision,setRevision]=useState(0)
  const [dispatchLoading,setDispatchLoading]=useState(false)
  const [dispatchError,setDispatchError]=useState('')
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

  useEffect(()=>{const reload=()=>setRevision(n=>n+1);window.addEventListener('fasttrack-refresh',reload);return()=>window.removeEventListener('fasttrack-refresh',reload)},[])
  // Tải dữ liệu thật từ CSDL Backend khi đổi dự án
  useEffect(() => {
    let isMounted = true
    setDefects([]);setCrewTeams([]);setSelectedDefectIds([]);setSelectedDispatchCrew('');setDispatchError('');setDetailDefect(null);setDispatchLoading(!!selectedProjectId)
    if (!selectedProjectId) return

    const loadDispatchData = async () => {
      try {
        const [loadedDefects, loadedCrews] = await Promise.all([
          fastTrackService.getDefects(selectedProjectId),
          fastTrackService.getCrews(selectedProjectId)
        ])
        if (isMounted) {
          if (loadedDefects) {
            setDefects(loadedDefects.map(d=>({...d,assignedCrew:loadedCrews.find(c=>c.id===d.assignedCrewId)?.name})))
            setSelectedDefectIds([])
          }
          if (loadedCrews) {
            setCrewTeams(loadedCrews)

          }
        }
      } catch (err: any) {
        if(isMounted)setDispatchError(exportError(err))
      } finally {if(isMounted)setDispatchLoading(false)}
    }

    loadDispatchData()
    return () => {
      isMounted = false
    }
  }, [selectedProjectId, showToast, epoch, revision])

  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      if (crewFilter !== 'ALL' && d.assignedCrew !== crewFilter) return false
      if (statusFilter === 'ELIGIBLE' && !d.isFastTrackEligible) return false
      if (statusFilter === 'VIOLATION' && d.canAssign) return false
      return true
    })
  }, [defects, crewFilter, statusFilter])

  const selectedItems = useMemo(() => {
    return defects.filter((d) => selectedDefectIds.includes(d.id))
  }, [defects, selectedDefectIds])

  const hasViolationItem = useMemo(() => {
    return selectedItems.some((d) => !d.canAssign)
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
    const validIds = selectedItems.filter((d) => d.canAssign).map((d) => d.id)
    setSelectedDefectIds(validIds)
    showToast('Đã bỏ các mục chưa sẵn sàng giao việc khỏi lựa chọn.')
  }

  const handleAssignCrew = (_defectId:string, crew:string) => {
    setSelectedDispatchCrew(crew)
    showToast('Đã chọn Crew cho biểu mẫu. Chưa gửi lệnh giao việc.')
  }
  const handleExecuteDispatch = async(task:FastTrackTaskInput) => {
    setDispatchError('')
    try {
      const res=await fastTrackService.executeDispatch({projectId:selectedProjectId,items:selectedItems,task,defectIds:selectedDefectIds,crewName:selectedDispatchCrew,notes:dispatchNotes})
      setIsDispatchModalOpen(false);setRevision(n=>n+1);showToast(res.message)
    }catch(e){setDispatchError(exportError(e))}
  }

  return {
    dispatchError,dispatchLoading,
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
