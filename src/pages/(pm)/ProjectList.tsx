import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService, personnelService } from '../../api/services'
import { Icon } from '../../components/ui/Icon'
import {
  HubProject,
  ProjectFilterTab,
  ProjectViewMode,
  ProjectKpiStats
} from './projects/types'
import { ProjectListHeader } from './projects/ProjectListHeader'
import { ProjectListKpis } from './projects/ProjectListKpis'
import { ProjectListFilters } from './projects/ProjectListFilters'
import { ProjectGridView } from './projects/ProjectGridView'
import { ProjectTableView } from './projects/ProjectTableView'
import { CreateProjectModal, PmOption } from './projects/CreateProjectModal'
import { CloseProjectModal } from './projects/CloseProjectModal'

export type { HubProject }

export const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const { user, authEpoch } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Projects state & Async Mock API fetch
  const [projects, setProjects] = useState<HubProject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const listRequest = useRef(0)
  const loadProjects = useCallback(async () => {
    const request = ++listRequest.current
    const current = () => request === listRequest.current && useAuthStore.getState().authEpoch === authEpoch
    try {
      setIsLoading(true)
      setLoadError(null)
      const data = await projectService.fetchProjects()
      if (current()) setProjects(data)
    } catch (err: any) {
      if (!current()) return
      console.error('[ProjectList] Lỗi tải danh sách dự án:', err)
      const msg = err?.message || 'Không thể tải danh sách dự án từ máy chủ Backend.'
      setLoadError(msg)

    } finally {
      if (current()) setIsLoading(false)
    }
  }, [authEpoch])

  useEffect(() => {
    setProjects([])
    void loadProjects()
    return () => { listRequest.current++ }
  }, [loadProjects])

  // Đồng bộ reactive qua Event Bus
  useEffect(() => {
    const handleStateChange = () => {
      loadProjects()
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [loadProjects])

  const [filterTab, setFilterTab] = useState<ProjectFilterTab>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ProjectViewMode>('grid')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Danh mục PM thật lấy trực tiếp từ CSDL Backend Candidate3
  const [dbPms, setDbPms] = useState<PmOption[]>([])

  const [pmLoading, setPmLoading] = useState(false)
  const [pmError, setPmError] = useState<string | null>(null)
  const pmRequest = useRef(0)
  const loadPms = useCallback(async () => {
    const request = ++pmRequest.current
    const current = () => request === pmRequest.current && useAuthStore.getState().authEpoch === authEpoch
    if (!isSupervisor) { setDbPms([]); return }
    setPmLoading(true)
    setPmError(null)
    try {
      const users = await personnelService.fetchStaffDirectory({ role: 'PM', status: 'ACTIVE' })
      if (current()) setDbPms(users.filter(u => (u.role === 'PM' || u.role === 'PROJECT_MANAGER') && u.status === 'ACTIVE').map(u => ({
        id: u.userId, name: u.displayName || 'Chưa cập nhật tên', email: u.email || '', status: u.status!
      })))
    } catch {
      if (current()) { setDbPms([]); setPmError('Không tải được danh sách PM đủ điều kiện. Vui lòng thử lại.') }
    } finally { if (current()) setPmLoading(false) }
  }, [authEpoch, isSupervisor])
  useEffect(() => {
    setDbPms([])
    void loadPms()
    return () => { pmRequest.current++ }
  }, [loadPms])
  const availablePms = dbPms

  // Modal Khởi tạo dự án mới (Bước SUP-01: DA01, BR-01, FR-04)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectCode, setNewProjectCode] = useState('')
  const [newProjectRegion, setNewProjectRegion] = useState('')
  const [newProjectPM, setNewProjectPM] = useState('')
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newEndDate, setNewEndDate] = useState(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 3)
    return d.toISOString().split('T')[0]
  })
  const [handoverFiles, setHandoverFiles] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)

  const [pendingCreate, setPendingCreate] = useState(false)
  const [receivedCreate, setReceivedCreate] = useState(false)

  // Reset form sạch khi mở modal tạo mới (dứt khoát không để mock data)
  const handleOpenCreateModal = () => {
    let pending: ReturnType<typeof projectService.pendingProjectCreate>
    try { pending = projectService.pendingProjectCreate() }
    catch (error: any) { showToast(error.message || 'Chưa đối chiếu được yêu cầu tạo dự án trước.'); return }
    setPendingCreate(!!pending)
    setReceivedCreate(!!pending?.hasReceipt)
    if (pending) {
      setNewProjectName(pending.body.name)
      setNewProjectCode(pending.body.code)
      setNewProjectPM(pending.body.primaryPmId)
      setNewStartDate(pending.body.handoverDate)
      setNewEndDate(pending.body.warrantyEndDate)
      setNewProjectRegion(pending.body.description || '')
      setHandoverFiles([])
      setCreateErrorMessage(null)
      setIsModalOpen(true)
      return
    }
    setNewProjectName('')
    setNewProjectCode('')
    setNewProjectRegion('')
    setNewProjectPM('')
    setNewStartDate(new Date().toISOString().split('T')[0])
    const d = new Date()
    d.setFullYear(d.getFullYear() + 3)
    setNewEndDate(d.toISOString().split('T')[0])
    setHandoverFiles([])
    setCreateErrorMessage(null)
    setIsModalOpen(true)
  }

  // Submit tạo dự án mới (Chỉ Supervisor mới có quyền - BR-01, FR-04)
  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    const epoch = authEpoch
    const current = () => mounted.current && useAuthStore.getState().authEpoch === epoch
    setIsSubmitting(true)
    setCreateErrorMessage(null)
    try {
      if (!pendingCreate && !availablePms.some(pm => pm.id === newProjectPM && pm.status === 'ACTIVE')) {
        throw new Error('Hãy chọn PM đang hoạt động từ danh sách nhân sự đã tải.')
      }
      const created = await projectService.createProject({
        code: newProjectCode,
        name: newProjectName,
        primaryPmId: newProjectPM,
        handoverDate: newStartDate,
        warrantyEndDate: newEndDate,
        handoverFileIds: handoverFiles,
        region: newProjectRegion
      }, pendingCreate)
      if (!current()) return
      setPendingCreate(false)
      setReceivedCreate(false)
      setProjects(previous => [...previous.filter(p => p.id !== created.id), created])
      setIsModalOpen(false)
      showToast(`Đã tạo dự án [${created.code}]. Phân công PM được đọc từ máy chủ.`)
      await loadProjects()
    } catch (err: any) {
      if (!current()) return
      const pending = projectService.pendingProjectCreate()
      setPendingCreate(!!pending)
      setReceivedCreate(!!pending?.hasReceipt)
      const msg = err.message || 'Lỗi khởi tạo dự án'
      setCreateErrorMessage(msg)
      showToast(msg)
    } finally {
      if (current()) setIsSubmitting(false)
    }
  }

  // Modal Đóng dự án khi hết hạn bảo hành
  const [closingProject, setClosingProject] = useState<HubProject | null>(null)

  const handleCloseProjectSubmit = async (reason: string) => {
    if (!closingProject) return
    try {
      const closed = await projectService.closeProject(closingProject.id, { reason })
      const refreshed = await projectService.fetchProjects()
      setProjects(refreshed)
      showToast(`Đã đóng thành công dự án [${(closed as any)?.code || closingProject.code}] và chuyển sang lưu trữ hồ sơ 5 năm!`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đóng dự án')
      throw err
    }
  }

  // Lọc danh sách dự án dựa theo vai trò (Role-based Project Scope - BR-02)
  // GET /projects is scoped by server effective membership, not primary PM/name.
  const scopedProjects = projects

  // Filter projects logic
  const filteredProjects = useMemo(() => {
    return scopedProjects.filter((prj) => {
      // Filter tab
      if (filterTab === 'ACTIVE' && prj.status !== 'ACTIVE') return false
      if (filterTab === 'NEAR_EXPIRY' && prj.status !== 'NEAR_EXPIRY') return false
      if (filterTab === 'PENDING_ALIGNMENT' && prj.status !== 'PENDING_ALIGNMENT') return false
      if (filterTab === 'CLOSED' && prj.status !== 'CLOSED') return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchName = prj.name.toLowerCase().includes(query)
        const matchCode = prj.code.toLowerCase().includes(query)
        const matchPM = prj.pm_name.toLowerCase().includes(query)
        const matchRegion = prj.region.toLowerCase().includes(query)
        if (!matchName && !matchCode && !matchPM && !matchRegion) return false
      }

      return true
    })
  }, [scopedProjects, filterTab, searchQuery])

  // KPI Metrics Calculation
  const totalLength = useMemo(() => scopedProjects.length > 0 && scopedProjects.every(p => Number.isFinite(p.length_km)) ? scopedProjects.reduce((acc, p) => acc + p.length_km!, 0).toFixed(1) : 'Chưa cập nhật', [scopedProjects])
  const activeCount = useMemo(() => scopedProjects.filter((p) => p.status === 'ACTIVE').length, [scopedProjects])
  const nearExpiryCount = useMemo(() => scopedProjects.filter((p) => p.status === 'NEAR_EXPIRY').length, [scopedProjects])
  const pendingAlignmentCount = useMemo(() => scopedProjects.filter((p) => p.status === 'PENDING_ALIGNMENT').length, [scopedProjects])
  const closedCount = useMemo(() => scopedProjects.filter((p) => p.status === 'CLOSED').length, [scopedProjects])

  const kpiStats: ProjectKpiStats = {
    totalLength,
    activeCount,
    nearExpiryCount,
    pendingAlignmentCount,
    closedCount
  }

  const handleNavigateHome = () => {
    navigate(`${basePath}/dashboard`)
  }

  const handleNavigateAlignment = (projectId: string) => {
    navigate(`${basePath}/projects/${projectId}/alignment`)
  }

  const handleNavigateDetail = (projectId: string) => {
    navigate(`${basePath}/projects/${projectId}`)
  }

  return (
    <div className="space-y-6">
      <ProjectListHeader
        isSupervisor={isSupervisor}
        onNavigateHome={handleNavigateHome}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <ProjectListKpis kpiStats={kpiStats} />

      <ProjectListFilters
        filterTab={filterTab}
        onSelectFilterTab={setFilterTab}
        scopedCount={scopedProjects.length}
        activeCount={activeCount}
        nearExpiryCount={nearExpiryCount}
        pendingAlignmentCount={pendingAlignmentCount}
        closedCount={closedCount}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      {loadError && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 flex items-start justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600 mt-0.5">
              <Icon name="error" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-red-900">Lỗi kết nối máy chủ API Backend</h4>
              <p className="text-xs text-red-700 mt-0.5 font-mono">{loadError}</p>
              <p className="text-[11px] text-red-500 mt-1">
                RoadGuard áp dụng kỷ luật chống bịa: Khi máy chủ báo lỗi, hệ thống hiển thị trực tiếp lỗi và dứt khoát không trả về dữ liệu giả (mock data).
              </p>
            </div>
          </div>
          <button
            onClick={() => loadProjects()}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Icon name="sync" size={14} />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {projects.some(p => p.stats_error) && <div role="alert" className="p-3 rounded-xl border border-amber-200 text-amber-900 text-xs">
        Một phần thông tin nhân sự hoặc thống kê chưa tải được. Dữ liệu dự án đã tải vẫn được giữ.
        <button type="button" className="ml-3 underline" onClick={() => { void loadProjects() }}>Thử lại</button>
      </div>}
      {!isLoading && !loadError && filteredProjects.length === 0 && <p role="status" className="p-6 text-center text-sm text-slate-500 border rounded-xl bg-white">
        {projects.length === 0 ? 'Không có dự án trong phạm vi được cấp từ CSDL.' : 'Không có dự án phù hợp bộ lọc.'}
      </p>}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
          <Icon name="sync" size={24} className="animate-spin text-brand-gold" />
          <span>Đang tải danh mục dự án từ máy chủ API...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGridView
          filteredProjects={filteredProjects}
          isSupervisor={isSupervisor}
          onOpenCreateModal={handleOpenCreateModal}
          onNavigateAlignment={handleNavigateAlignment}
          onNavigateDetail={handleNavigateDetail}
          onOpenCloseModal={(prj) => setClosingProject(prj)}
        />
      ) : (
        <ProjectTableView
          filteredProjects={filteredProjects}
          totalProjectsCount={projects.length}
          isSupervisor={isSupervisor}
          onNavigateDetail={handleNavigateDetail}
          onOpenCloseModal={(prj) => setClosingProject(prj)}
        />
      )}

      {/* MODAL KHỞI TẠO DỰ ÁN (BƯỚC SUP-01: DA01, BR-01, FR-04) */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setCreateErrorMessage(null)
        }}
        projectName={newProjectName}
        onChangeProjectName={(val) => {
          setNewProjectName(val)
          if (createErrorMessage) setCreateErrorMessage(null)
        }}
        projectCode={newProjectCode}
        onChangeProjectCode={(val) => {
          setNewProjectCode(val)
          if (createErrorMessage) setCreateErrorMessage(null)
        }}
        projectRegion={newProjectRegion}
        onChangeProjectRegion={setNewProjectRegion}
        projectPM={newProjectPM}
        onChangeProjectPM={setNewProjectPM}
        pmOptions={availablePms}
        pmLoading={pmLoading}
        pmError={pmError}
        onRetryPms={() => { void loadPms() }}
        pendingCreate={pendingCreate}
        receivedCreate={receivedCreate}
        startDate={newStartDate}
        onChangeStartDate={setNewStartDate}
        endDate={newEndDate}
        onChangeEndDate={setNewEndDate}
        handoverFiles={handoverFiles}
        onChangeHandoverFiles={setHandoverFiles}
        isSubmitting={isSubmitting}
        errorMessage={createErrorMessage}
        onSubmit={handleCreateProjectSubmit}
      />

      {/* MODAL ĐÓNG DỰ ÁN KHI HẾT HẠN BẢO HÀNH (BƯỚC SUP-07: DA12, QT13, BC10) */}
      <CloseProjectModal
        isOpen={!!closingProject}
        project={closingProject}
        onClose={() => setClosingProject(null)}
        onConfirm={handleCloseProjectSubmit}
      />

      {/* TOAST FEEDBACK FLOATING NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-4 py-3 bg-slate-900 text-white rounded-lg shadow-xl flex items-center gap-2.5 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0"></span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectList
