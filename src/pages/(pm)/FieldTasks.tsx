import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { fieldTaskService } from '../../api/services/fieldTaskService'
import { projectService } from '../../api/services/projectService'
import { FieldTask, HubProject } from '../../types/domain'
import { Icon } from '../../components/ui/Icon'
import { FieldTasksHeader } from './field-tasks/FieldTasksHeader'
import { MeasurementsTab } from './field-tasks/MeasurementsTab'
import { reportKeepNewCommands } from '../../api/services/reportKeepNewCommands'

export const FieldTasks: React.FC = () => {
  const [searchParams,setSearchParams] = useSearchParams()
  const requestedProject=searchParams.get('projectId') || 'ALL',linkedDefect=searchParams.get('defectId') || ''
  const tabParam = searchParams.get('tab')
  const highlightCode = searchParams.get('highlightCode')

  const { user, authEpoch } = useAuthStore()
  const actorScope = `${authEpoch}:${user?.id}:${user?.role}`
  const currentActor = useRef(actorScope)
  currentActor.current = actorScope
  const taskRequest = useRef(0)
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  const navigate = useNavigate()

  // ?tab=CONFLICTS (liên kết cũ): BE không có API xung đột → chuyển sang màn Điều phối ngoại tuyến
  useEffect(() => {
    if (tabParam === 'CONFLICTS') {
      navigate(isSupervisor ? '/sup/offline' : '/pm/offline', { replace: true })
    }
  }, [tabParam, isSupervisor, navigate])

  // Danh mục tuyến đường / dự án lấy thật 100% từ CSDL Backend
  const [availableProjects, setAvailableProjects] = useState<HubProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>(requestedProject)
  const [projectsLoaded,setProjectsLoaded]=useState(false),[linkedSourceError,setLinkedSourceError]=useState('')
  useEffect(()=>{setSelectedProjectId(requestedProject)},[requestedProject,actorScope])
  useEffect(()=>{const c=new AbortController();setLinkedSourceError('');const report=searchParams.get('reportId'),decision=searchParams.get('decisionId');if(isPM && requestedProject!=='ALL' && linkedDefect && report && decision)reportKeepNewCommands.read(requestedProject,report,decision,c.signal).then(r=>{if(!c.signal.aborted && r?.defect.id!==linkedDefect)setLinkedSourceError('Khiếm khuyết trong liên kết không khớp quyết định nguồn. Chưa lập FIELD.')}).catch(e=>{if(!c.signal.aborted)setLinkedSourceError(e.message)});return()=>c.abort()},[actorScope,requestedProject,linkedDefect,searchParams.get('reportId'),searchParams.get('decisionId')])

  // Dữ liệu danh sách nhiệm vụ đo đạc hiện trường từ CSDL Backend
  const [fieldTasks, setFieldTasks] = useState<FieldTask[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const loadProjects = useCallback(async () => {
    setAvailableProjects([]);setProjectsLoaded(false)
    try {
      const hubProjects = await projectService.fetchProjects()
      if (currentActor.current !== actorScope) return
      setAvailableProjects(hubProjects)
      setProjectsLoaded(true)
    } catch (err: any) {
      if (currentActor.current !== actorScope) return
      console.error('Lỗi tải danh mục dự án từ CSDL:', err)
      setApiError(err?.message || 'Không thể tải danh sách dự án từ CSDL')
    }
  }, [actorScope])

  const loadTasks = useCallback(async (projId: string = selectedProjectId) => {
    const request = ++taskRequest.current
    const current = () => request === taskRequest.current && currentActor.current === actorScope
    setFieldTasks([])
    if(!projectsLoaded){setIsLoadingTasks(false);return}
    if(projId!=='ALL' && !availableProjects.some(p=>p.id===projId)){setIsLoadingTasks(false);setApiError('Dự án trong liên kết không thuộc danh mục được phép đọc; không tự chuyển dự án khác.');return}
    setIsLoadingTasks(true)
    setApiError(null)
    try {
      const data = await fieldTaskService.getTasks({
        projectId: projId
      })
      if (!current()) return
      setFieldTasks(data)
    } catch (err: any) {
      if (!current()) return
      const errMsg = err?.response?.data?.message || err?.message || 'Lỗi khi tải danh sách nhiệm vụ từ CSDL Backend'
      setApiError(errMsg)
      showToast(`❌ Lỗi CSDL: ${errMsg}`, 'error')
    } finally {
      if (current()) setIsLoadingTasks(false)
    }
  }, [selectedProjectId, actorScope,projectsLoaded,availableProjects])

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId)
    const next=new URLSearchParams(searchParams);next.set('projectId',projId);next.delete('defectId');next.delete('reportId');next.delete('decisionId');setSearchParams(next,{replace:true})
    const p = availableProjects.find((x) => x.id === projId)
    if (p) {
      showToast(`Đã lọc tuyến đường: ${p.code} - ${p.name}`, 'info')
    } else {
      showToast('Đang hiển thị toàn bộ các tuyến đường phụ trách', 'info')
    }
  }

  useEffect(() => {void loadProjects()},[loadProjects])
  useEffect(() => {void loadTasks()},[loadTasks])

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-[10000] max-w-[calc(100vw-2rem)] p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : toast.type === 'info'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
        >
          <Icon
            name={toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
            size={18}
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Thông báo lỗi nếu có */}
      {linkedSourceError && <p role="alert" className="text-xs text-rose-700">{linkedSourceError}</p>}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Icon name="error" size={16} className="text-rose-600 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="text-rose-500 hover:text-rose-800 cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Header & 4 Thẻ KPI Đo Đạc Hiện Trường */}
      <FieldTasksHeader
        isSupervisor={isSupervisor}
        isPM={isPM}
        fieldTasks={fieldTasks}
        projects={availableProjects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
      />

      {/* Bảng Nhật Ký Nhiệm Vụ Đo Đạc Hiện Trường */}
      <MeasurementsTab
        key={`${actorScope}:${selectedProjectId}`}
        fieldTasks={fieldTasks}
        onRefreshTasks={() => loadTasks(selectedProjectId)}
        highlightCode={highlightCode}
        isLoading={isLoadingTasks}
        showToast={showToast}
        isSupervisor={isSupervisor}
        selectedProjectId={selectedProjectId}
        projects={availableProjects}
        linkedDefectId={linkedSourceError?'':linkedDefect}
        onOpenFastTrack={defectId=>navigate(`${isSupervisor?'/sup':'/pm'}/fast-track?${new URLSearchParams({projectId:selectedProjectId,...(defectId?{defectId,open:'prepare'}:{})})}`)}
      />
    </div>
  )
}
export default FieldTasks
