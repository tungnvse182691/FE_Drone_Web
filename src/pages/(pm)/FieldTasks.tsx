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

export const FieldTasks: React.FC = () => {
  const [searchParams] = useSearchParams()
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

  // Chuyển hướng ngay sang trang Xử lý xung đột riêng biệt nếu có tham số ?tab=CONFLICTS
  useEffect(() => {
    if (tabParam === 'CONFLICTS') {
      navigate(isSupervisor ? '/sup/conflicts' : '/pm/conflicts', { replace: true })
    }
  }, [tabParam, isSupervisor, navigate])

  // Danh mục tuyến đường / dự án lấy thật 100% từ CSDL Backend
  const [availableProjects, setAvailableProjects] = useState<HubProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL')

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
    setAvailableProjects([])
    try {
      const hubProjects = await projectService.fetchProjects()
      if (currentActor.current !== actorScope) return
      setAvailableProjects(hubProjects)
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
  }, [selectedProjectId, actorScope])

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId)
    const p = availableProjects.find((x) => x.id === projId)
    if (p) {
      showToast(`Đã lọc tuyến đường: ${p.code} - ${p.name}`, 'info')
    } else {
      showToast('Đang hiển thị toàn bộ các tuyến đường phụ trách', 'info')
    }
  }

  useEffect(() => {
    loadProjects()
    loadTasks()
  }, [loadProjects, loadTasks])

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce ${
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
      />
    </div>
  )
}
export default FieldTasks
