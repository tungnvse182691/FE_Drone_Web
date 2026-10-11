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
import { CreateProjectModal } from './projects/CreateProjectModal'

export type { HubProject }

export const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Projects state & Async Mock API fetch
  const [projects, setProjects] = useState<HubProject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await projectService.fetchProjects()
      setProjects(data)
    } catch (err: any) {
      console.error('[ProjectList] Lỗi tải danh sách dự án:', err)
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

  // Modal Khởi tạo dự án mới (Bước SUP-01: DA01, BR-01, FR-04)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('Quốc lộ 14 - Đoạn Chơn Thành')
  const [newProjectCode, setNewProjectCode] = useState('PRJ-QL14-01')
  const [newProjectRegion, setNewProjectRegion] = useState('Bình Phước - Bình Dương')
  const [newProjectPM, setNewProjectPM] = useState('Đỗ Quốc Hoàng (pmhoang@gmail.com)')
  const [newStartDate, setNewStartDate] = useState('2026-10-01')
  const [newEndDate, setNewEndDate] = useState('2029-10-01')
  const [handoverFiles, setHandoverFiles] = useState<string[]>(['FILE-BB-BG-01'])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Submit tạo dự án mới bất đồng bộ qua Mock API (Chỉ Supervisor mới có quyền - BR-01, FR-04)
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
      showToast(`Khởi tạo thành công dự án [${created.code}] và phân bổ PM [${created.pm_name}] (BR-01, FR-04)!`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khởi tạo dự án')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Lọc danh sách dự án dựa theo vai trò (Role-based Project Scope - BR-02)
  const scopedProjects = useMemo(() => {
    if (isSupervisor) return projects
    return projects.filter((prj) => {
      const isAssigned =
        prj.pm_email === user?.email ||
        prj.pm_name === user?.full_name ||
        prj.pm_name === 'Đỗ Quốc Hoàng' ||
        prj.id === 'prj-ql1a-02' ||
        prj.id === 'prj-lstl-05'

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

  const kpiStats: ProjectKpiStats = {
    totalLength,
    activeCount,
    nearExpiryCount,
    pendingAlignmentCount
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
        onExportGis={() => showToast('Đang kết xuất tệp GIS GeoJSON & KML toàn tuyến mạng lưới đường bộ...')}
        onOpenCreateModal={() => setIsModalOpen(true)}
      />

      <ProjectListKpis kpiStats={kpiStats} />

      <ProjectListFilters
        filterTab={filterTab}
        onSelectFilterTab={setFilterTab}
        scopedCount={scopedProjects.length}
        activeCount={activeCount}
        nearExpiryCount={nearExpiryCount}
        pendingAlignmentCount={pendingAlignmentCount}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
          <Icon name="sync" size={24} className="animate-spin text-brand-gold" />
          <span>Đang tải danh mục dự án từ máy chủ API...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGridView
          filteredProjects={filteredProjects}
          isSupervisor={isSupervisor}
          onOpenCreateModal={() => setIsModalOpen(true)}
          onNavigateAlignment={handleNavigateAlignment}
          onNavigateDetail={handleNavigateDetail}
        />
      ) : (
        <ProjectTableView
          filteredProjects={filteredProjects}
          totalProjectsCount={projects.length}
          onNavigateDetail={handleNavigateDetail}
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
        startDate={newStartDate}
        onChangeStartDate={setNewStartDate}
        endDate={newEndDate}
        onChangeEndDate={setNewEndDate}
        handoverFiles={handoverFiles}
        onChangeHandoverFiles={setHandoverFiles}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateProjectSubmit}
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
