import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService } from '../../api/services'
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
  const { user } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Projects state & Async Mock API fetch
  const [projects, setProjects] = useState<HubProject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const data = await projectService.fetchProjects()
      setProjects(data)
    } catch (err: any) {
      console.error('[ProjectList] Lỗi tải danh sách dự án:', err)
      const msg = err?.message || 'Không thể tải danh sách dự án từ máy chủ Backend.'
      setLoadError(msg)
      setProjects([]) // Dứt khoát không nạp mock data khi API thật bị lỗi!
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
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

  // Danh mục PM thật từ Backend Candidate3 Docker (Seed accounts + Projects đã nạp)
  const availablePms = useMemo<PmOption[]>(() => {
    const map = new Map<string, PmOption>()
    // Seed PM accounts trong Candidate3 Docker
    map.set('72f84201-a001-4000-8000-000000000002', {
      id: '72f84201-a001-4000-8000-000000000002',
      name: 'Synthetic pm-a',
      email: 'pm-a@sandbox.example.test'
    })
    map.set('72f84201-a001-4000-8000-000000000003', {
      id: '72f84201-a001-4000-8000-000000000003',
      name: 'Synthetic pm-b',
      email: 'pm-b@sandbox.example.test'
    })

    projects.forEach((prj) => {
      if (prj.pm_name && prj.pm_email && !prj.pm_name.toLowerCase().includes('chưa')) {
        const found = Array.from(map.values()).some((x) => x.email === prj.pm_email)
        if (!found) {
          map.set(prj.pm_email, {
            id: prj.id,
            name: prj.pm_name,
            email: prj.pm_email
          })
        }
      }
    })
    return Array.from(map.values())
  }, [projects])

  // Modal Khởi tạo dự án mới (Bước SUP-01: DA01, BR-01, FR-04)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectCode, setNewProjectCode] = useState('')
  const [newProjectRegion, setNewProjectRegion] = useState('')
  const [newProjectPM, setNewProjectPM] = useState('72f84201-a001-4000-8000-000000000002')
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newEndDate, setNewEndDate] = useState(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 3)
    return d.toISOString().split('T')[0]
  })
  const [handoverFiles, setHandoverFiles] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form sạch khi mở modal tạo mới (dứt khoát không để mock data)
  const handleOpenCreateModal = () => {
    setNewProjectName('')
    setNewProjectCode('')
    setNewProjectRegion('')
    setNewProjectPM(availablePms[0]?.id || '72f84201-a001-4000-8000-000000000002')
    setNewStartDate(new Date().toISOString().split('T')[0])
    const d = new Date()
    d.setFullYear(d.getFullYear() + 3)
    setNewEndDate(d.toISOString().split('T')[0])
    setHandoverFiles([])
    setIsModalOpen(true)
  }

  // Submit tạo dự án mới (Chỉ Supervisor mới có quyền - BR-01, FR-04)
  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const created = await projectService.createProject({
        code: newProjectCode,
        name: newProjectName,
        primaryPmId: newProjectPM,
        handoverDate: newStartDate,
        warrantyEndDate: newEndDate,
        handoverFileIds: handoverFiles,
        region: newProjectRegion
      })
      const refreshed = await projectService.fetchProjects()
      setProjects(refreshed)
      setIsModalOpen(false)
      showToast(`Khởi tạo thành công dự án [${created.code}] và phân bổ PM [${created.pm_name}]!`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khởi tạo dự án')
    } finally {
      setIsSubmitting(false)
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
      showToast(`Đã đóng thành công dự án [${closed.code}] và chuyển sang lưu trữ hồ sơ 5 năm!`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đóng dự án')
      throw err
    }
  }

  // Lọc danh sách dự án dựa theo vai trò (Role-based Project Scope - BR-02)
  const scopedProjects = useMemo(() => {
    if (isSupervisor) return projects
    return projects.filter((prj) => {
      // Backend Candidate3 đã tự động lọc quyền theo user trên server
      if (prj.pm_email === user?.email || prj.pm_name === user?.full_name || prj.id.length === 36) {
        return true
      }
      const isAssigned =
        prj.pm_name === 'Đỗ Quốc Hoàng' ||
        prj.id === 'prj-ql1a-02' ||
        prj.id === 'prj-lstl-05' ||
        prj.id === 'prj-ql1a-p1'

      return isAssigned && !prj.is_restricted_for_pm
    })
  }, [projects, isSupervisor, user])

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
  const totalLength = useMemo(() => scopedProjects.reduce((acc, p) => acc + p.length_km, 0).toFixed(1), [scopedProjects])
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
        onClose={() => setIsModalOpen(false)}
        projectName={newProjectName}
        onChangeProjectName={setNewProjectName}
        projectCode={newProjectCode}
        onChangeProjectCode={setNewProjectCode}
        projectRegion={newProjectRegion}
        onChangeProjectRegion={setNewProjectRegion}
        projectPM={newProjectPM}
        onChangeProjectPM={setNewProjectPM}
        pmOptions={availablePms}
        startDate={newStartDate}
        onChangeStartDate={setNewStartDate}
        endDate={newEndDate}
        onChangeEndDate={setNewEndDate}
        handoverFiles={handoverFiles}
        onChangeHandoverFiles={setHandoverFiles}
        isSubmitting={isSubmitting}
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
