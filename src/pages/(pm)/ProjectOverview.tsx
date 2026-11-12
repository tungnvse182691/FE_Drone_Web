import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService, personnelService } from '../../api/services'
import { alignmentService } from '../../api/services/alignmentService'
import { geometrySubmissionService, type GeometrySubmission } from '../../api/services/geometrySubmissionService'
import { Icon } from '../../components/ui/Icon'
import { HubProject } from './projects/types'
import { Segment, ProjectMember } from './project-overview/types'
import { PrimaryProjectManagerReadDto } from '../../api/services/personnelService'
import { ProjectOverviewHeader } from './project-overview/ProjectOverviewHeader'
import { ProjectHighlightsGrid } from './project-overview/ProjectHighlightsGrid'
import { ProjectTimelineStepper } from './project-overview/ProjectTimelineStepper'
import { ProjectSegmentsTable } from './project-overview/ProjectSegmentsTable'
import { ProjectPersonnelCard } from './project-overview/ProjectPersonnelCard'
import { ProjectMapPreviewCard } from './project-overview/ProjectMapPreviewCard'
import { CloseProjectModal } from './projects/CloseProjectModal'

export type { Segment, ProjectMember }

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = id || ''
  const navigate = useNavigate()
  const { user, authEpoch } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'
  const submissionScope = `${authEpoch}:${projectId}`
  const [submissionRead, setSubmissionRead] = useState<{scope: string; data: GeometrySubmission | null; loading: boolean; error: string}>({scope: '', data: null, loading: true, error: ''})
  const [submissionReload, setSubmissionReload] = useState(0)
  const submission = submissionRead.scope === submissionScope ? submissionRead : {data: null, loading: true, error: ''}
  useEffect(() => {
    let active = true
    setSubmissionRead({scope: submissionScope, data: null, loading: true, error: ''})
    geometrySubmissionService.read(projectId).then(data => {
      if (active && useAuthStore.getState().authEpoch === authEpoch) setSubmissionRead({scope: submissionScope, data, loading: false, error: ''})
    }).catch(error => {
      if (active && useAuthStore.getState().authEpoch === authEpoch) setSubmissionRead({scope: submissionScope, data: null, loading: false, error: `Không đọc được hồ sơ tuyến: HTTP ${error?.response?.status || ''} ${error?.response?.data?.code || error.message}`})
    })
    return () => { active = false }
  }, [submissionScope, submissionReload])

  const [project, setProject] = useState<HubProject | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [segments, setSegments] = useState<Segment[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [projectError, setProjectError] = useState<string | null>(null)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [primaryError, setPrimaryError] = useState<string | null>(null)
  const [primaryPm, setPrimaryPm] = useState<PrimaryProjectManagerReadDto | null>(null)
  const [includeHistory, setIncludeHistory] = useState(false)
  const requestId = useRef(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)

  // Chi tiết phân định Tuyến chính & Tuyến phụ
  const [activeAlignmentTab, setActiveAlignmentTab] = useState<'MAINLINE' | 'BRANCHES'>('MAINLINE')
  const [alignmentDetail, setAlignmentDetail] = useState<{
    mainlineLengthKm: number
    branchesLengthKm: number
    branchesCount: number
    branches: any[]
  }>({
    mainlineLengthKm: Number.NaN,
    branchesLengthKm: Number.NaN,
    branchesCount: Number.NaN,
    branches: []
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Đóng dự án khi hết hạn bảo hành (BƯỚC SUP-07: DA12, QT13, BC10 - Duy nhất Supervisor có quyền)
  const handleCloseProjectConfirm = async (reason: string) => {
    if (!project) return
    try {
      await projectService.closeProject(project.id, { reason })
      setProject((prev) => (prev ? { ...prev, status: 'CLOSED', status_label: 'Đã đóng hồ sơ' } : null))
      showToast(`Đã đóng thành công dự án [${project.code}] và chuyển sang lưu trữ hồ sơ!`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đóng dự án')
      throw err
    }
  }

  // Fetch Project Data bất đồng bộ qua Mock API
  const loadProjectData = useCallback(async () => {
    const request = ++requestId.current
    const current = () => request === requestId.current && useAuthStore.getState().authEpoch === authEpoch
    setIsLoading(true)
    setProjectError(null)
    try {
      const data = await projectService.fetchProjectById(projectId)
      if (!current()) return
      if (data) {
        setProject(data)

        const facts = data.server_facts
        setAlignmentDetail({
          mainlineLengthKm: facts?.mainlineLengthKm ?? Number.NaN,
          branchesLengthKm: facts?.branchesLengthKm ?? Number.NaN,
          branchesCount: facts?.branchesCount ?? Number.NaN,
          branches: facts?.routes.filter(route => route.routeKind === 'BRANCH').map(route => ({id: route.routeVersionId, name: route.name, lengthKm: route.lengthMeters / 1000})) || []
        })
        // Width intervals and local edits are not persisted segment sets.
        setSegments([])

        // Directory, effective members and primary designation are separate read models.
        const [memberResult, primaryResult] = await Promise.allSettled([
          projectService.fetchProjectMembers(data.id, includeHistory),
          personnelService.getPrimaryProjectManager(data.id)
        ])
        if (!current()) return
        setMemberError(memberResult.status === 'rejected' ? 'Chưa tải được thành viên dự án. Vui lòng thử lại.' : null)
        setPrimaryError(primaryResult.status === 'rejected' ? 'Chưa tải được phân công PM chính. Vui lòng thử lại.' : null)
        if (primaryResult.status === 'fulfilled') setPrimaryPm(primaryResult.value)
        if (memberResult.status === 'fulfilled') setMembers(memberResult.value.map((m: any) => ({
          id: m.membershipId, name: m.displayName || 'Chưa cập nhật tên', role_code: m.role,
          role_title: m.role === 'PM' ? 'Chỉ huy trưởng dự án' : m.role === 'OPERATOR' ? 'Phi công Drone' : m.role === 'CREW' ? 'Đội thi công' : m.role || 'Chưa cập nhật vai trò',
          role_badge: m.isPrimary ? 'PM CHÍNH' : m.role || 'Chưa cập nhật',
          avatar: '', authority: '', contact: '', unit: '',
          valid_from: m.validFrom, valid_to: m.validTo, membership_status: m.status
        })))
      } else {
        // Fallback an toàn nếu không tìm thấy ID
        setProject(null)
        setProjectError('Không tìm thấy dự án trong phạm vi được phép.')
      }
    } catch (err: any) {
      if (current()) setProjectError('Không tải được hồ sơ dự án. Vui lòng thử lại.')
    } finally {
      if (current()) setIsLoading(false)
    }
  }, [projectId, authEpoch, includeHistory])

  useEffect(() => {
    setProject(null)
    setMembers([])
    setPrimaryPm(null)
    setMemberError(null)
    setPrimaryError(null)
    void loadProjectData()
    window.addEventListener('roadguard_state_change', loadProjectData)
    return () => { requestId.current++; window.removeEventListener('roadguard_state_change', loadProjectData) }
  }, [loadProjectData])

  if (projectError && !project) return <div role="alert" className="p-6 border rounded-xl text-sm text-rose-700">{projectError}<button type="button" className="ml-3 underline" onClick={() => { void loadProjectData() }}>Thử lại</button></div>
  if (isLoading || !project) {
    return (
      <div className="p-16 text-center bg-white rounded-[20px] border-[1.5px] border-[#E2E5E9] text-slate-500 text-xs flex flex-col items-center justify-center gap-2 shadow-2xs">
        <Icon name="sync" size={24} className="animate-spin text-[#C9A227]" />
        <span>Đang nạp dữ liệu hồ sơ dự án [{projectId}] từ máy chủ...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-body">
      {projectError && <div role="alert" className="text-sm text-rose-700">{projectError}<button type="button" onClick={() => { void loadProjectData() }}>Thử lại</button></div>}
      {project.stats_error && <div role="alert" className="text-sm text-rose-700">
        Một phần thông tin nhân sự hoặc thống kê chưa tải được. Các số liệu đã tải vẫn được giữ.
        <button type="button" className="ml-3 underline" onClick={() => { void loadProjectData() }}>Thử lại</button>
      </div>}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in duration-200 text-xs">
          <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-1">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. TOP BAR & BREADCRUMB CONTEXT */}
      <ProjectOverviewHeader
        submission={submission.data}
        submissionLoading={submission.loading}
        submissionError={submission.error}
        submissionReady={!submission.loading && !submission.error}
        onRetrySubmission={() => setSubmissionReload(n => n + 1)}
        project={project}
        basePath={basePath}
        isSupervisor={isSupervisor}
        onNavigate={navigate}
        onCloseProject={() => setIsCloseModalOpen(true)}
        mainlineLengthKm={alignmentDetail.mainlineLengthKm}
        branchesLengthKm={alignmentDetail.branchesLengthKm}
        branchesCount={alignmentDetail.branchesCount}
      />

      {/* 2. PROJECT HIGHLIGHTS GRID (3 CARDS) */}
      <ProjectHighlightsGrid
        project={project}
        mainlineLengthKm={alignmentDetail.mainlineLengthKm}
        branchesLengthKm={alignmentDetail.branchesLengthKm}
        branchesCount={alignmentDetail.branchesCount}
      />

      {/* 3. MAIN TWO-COLUMN SPLIT (8 cols Left | 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS */}
        <div className="lg:col-span-8 space-y-6">
          <ProjectTimelineStepper
            geometryStatus={project.geometry_read_error ? null : project.server_facts?.geometryState === 'CONFIRMED' ? 'CONFIRMED' : submission.data?.status === 'CONFIRMED' ? null : submission.data?.status ?? null}
            project={project}
            basePath={basePath}
            isSupervisor={isSupervisor}
            onNavigate={navigate}
          />

          <ProjectSegmentsTable
            serverReadOnly={project.server_data_loaded}
            projectId={project.id}
            segments={segments}
            branches={alignmentDetail.branches}
            mainlineLengthKm={alignmentDetail.mainlineLengthKm}
            branchesLengthKm={alignmentDetail.branchesLengthKm}
            basePath={basePath}
            onNavigate={navigate}
            onViewSegment={(code) => showToast(`Xem chi tiết phân đoạn ${code}`)}
            activeTab={activeAlignmentTab}
            onTabChange={setActiveAlignmentTab}
          />
        </div>

        {/* RIGHT COLUMN: 4 COLS */}
        <div className="lg:col-span-4 space-y-6">
          <ProjectPersonnelCard
            members={members}
            project={project}
            memberError={memberError}
            primaryError={primaryError}
            primaryPm={primaryPm}
            includeHistory={includeHistory}
            onChangeHistory={setIncludeHistory}
            onReloadMembers={loadProjectData}
            showToast={showToast}
          />

          <ProjectMapPreviewCard
            project={project}
            basePath={basePath}
            isSupervisor={isSupervisor}
            onNavigate={navigate}
            activeTab={activeAlignmentTab}
          />
        </div>
      </div>

      {/* MODAL ĐÓNG DỰ ÁN KHI HẾT HẠN BẢO HÀNH (DA12, QT13, BC10 - Duy nhất Supervisor) */}
      <CloseProjectModal
        isOpen={isCloseModalOpen}
        project={project}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseProjectConfirm}
      />
    </div>
  )
}

export default ProjectOverview
