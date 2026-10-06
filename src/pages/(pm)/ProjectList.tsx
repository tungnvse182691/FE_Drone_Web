import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService } from '../../api/services'
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

  // Projects state
  const [projects, setProjects] = useState<HubProject[]>(() => projectService.getProjects())

  // Äá»“ng bá»™ real-time giá»¯a Supervisor khá»Ÿi táº¡o vÃ  PM
  useEffect(() => {
    const handleStateChange = () => {
      setProjects(projectService.getProjects())
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [])

  const [filterTab, setFilterTab] = useState<ProjectFilterTab>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ProjectViewMode>('grid')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3800)
  }

  // Modal Khá»Ÿi táº¡o dá»± Ã¡n má»›i
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('Quá»‘c lá»™ 14 - Äoáº¡n ChÆ¡n ThÃ nh')
  const [newProjectCode, setNewProjectCode] = useState('PRJ-QL14-01')
  const [newProjectRegion, setNewProjectRegion] = useState('BÃ¬nh PhÆ°á»›c - BÃ¬nh DÆ°Æ¡ng')
  const [newProjectPM, setNewProjectPM] = useState('Äá»— Quá»‘c HoÃ ng (pmhoang@gmail.com)')
  const [newStartDate, setNewStartDate] = useState('2026-10-01')
  const [newEndDate, setNewEndDate] = useState('2029-10-01')
  const [newStartKm, setNewStartKm] = useState('Km 0+000')
  const [newEndKm, setNewEndKm] = useState('Km 28+500')
  const [newLengthKm, setNewLengthKm] = useState('28.5')
  const [newRetentionAmount, setNewRetentionAmount] = useState('15.500.000.000 â‚« (5% HÄ)')

  // Submit táº¡o dá»± Ã¡n má»›i (Supervisor quáº£n lÃ½)
  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedLength = parseFloat(newLengthKm) || 28.5
    const isUnassigned = newProjectPM === '-- Äá»ƒ trá»‘ng --'
    const pmName = isUnassigned ? 'ChÆ°a phÃ¢n cÃ´ng' : newProjectPM.split(' (')[0]
    const pmEmail = isUnassigned
      ? ''
      : newProjectPM.includes('(')
      ? newProjectPM.split('(')[1].replace(')', '')
      : 'pmhoang@gmail.com'

    const newProject: HubProject = {
      id: `prj-${Date.now()}`,
      code: newProjectCode || `PRJ-AUTO-${Math.floor(Math.random() * 900 + 100)}`,
      name: newProjectName,
      region: newProjectRegion,
      location_detail: newProjectRegion,
      start_km: 0.0,
      end_km: parsedLength,
      stationing_text: `${newStartKm} â†’ ${newEndKm}`,
      status: 'PENDING_ALIGNMENT',
      status_label: 'Chá» duyá»‡t tuyáº¿n',
      status_color: '#D97706',
      pm_name: pmName,
      pm_email: pmEmail,
      pm_role_badge: isUnassigned ? 'ChÆ°a gÃ¡n' : 'PM Tuyáº¿n',
      warranty_passed_percent: 0,
      days_remaining: 1095,
      length_km: parsedLength,
      open_defects: 0,
      repair_packages: 0,
      image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
      is_assigned: !isUnassigned,
      is_restricted_for_pm: false,
      kml_status: 'Chá» phÃª duyá»‡t KML',
      retention_amount: newRetentionAmount || '15.5 tá»· â‚« (5% HÄ)'
    }

    projectService.createProject(newProject)
    setProjects(projectService.getProjects())
    setIsModalOpen(false)
    showToast(`Khá»Ÿi táº¡o thÃ nh cÃ´ng dá»± Ã¡n [${newProject.code}] vÃ  Ä‘Ã£ chuyá»ƒn sang tráº¡ng thÃ¡i Chá» phÃª duyá»‡t tim tuyáº¿n (WF-02)!`)
  }

  // Lá»c danh sÃ¡ch dá»± Ã¡n dá»±a theo vai trÃ² (Role-based Project Scope)
  const scopedProjects = useMemo(() => {
    if (isSupervisor) return projects
    return projects.filter((prj) => {
      const isAssigned =
        prj.pm_email === user?.email ||
        prj.pm_name === user?.full_name ||
        prj.pm_name === 'Äá»— Quá»‘c HoÃ ng' ||
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

  // KPI Metrics Calculation dá»±a trÃªn pháº¡m vi dá»± Ã¡n Ä‘Æ°á»£c phÃ¢n cÃ´ng
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
        onExportGis={() => showToast('Äang káº¿t xuáº¥t tá»‡p GIS GeoJSON & KML toÃ n tuyáº¿n máº¡ng lÆ°á»›i Ä‘Æ°á»ng bá»™...')}
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

      {viewMode === 'grid' ? (
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
        retentionAmount={newRetentionAmount}
        onChangeRetentionAmount={setNewRetentionAmount}
        startKm={newStartKm}
        onChangeStartKm={setNewStartKm}
        endKm={newEndKm}
        onChangeEndKm={setNewEndKm}
        lengthKm={newLengthKm}
        onChangeLengthKm={setNewLengthKm}
        onSubmit={handleCreateProjectSubmit}
      />

      {/* TOAST FEEDBACK FLOATING NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-3 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping shrink-0"></span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectList
