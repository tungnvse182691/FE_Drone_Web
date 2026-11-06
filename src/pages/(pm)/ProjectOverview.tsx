import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService } from '../../api/services'
import { projectMemberErrorMessage } from '../../api/services/personnelService'
import { Icon } from '../../components/ui/Icon'
import { HubProject } from './projects/types'
import { ProjectMember } from './project-overview/types'
import { ProjectOverviewHeader } from './project-overview/ProjectOverviewHeader'
import { ProjectHighlightsGrid } from './project-overview/ProjectHighlightsGrid'
import { ProjectTimelineStepper } from './project-overview/ProjectTimelineStepper'
import { ProjectSegmentsTable } from './project-overview/ProjectSegmentsTable'
import { ProjectMapPreviewCard } from './project-overview/ProjectMapPreviewCard'
import { ProjectPersonnelCard } from './project-overview/ProjectPersonnelCard'
import { CloseProjectModal } from './projects/CloseProjectModal'

export type { Segment, ProjectMember } from './project-overview/types'

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = id || ''
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [project, setProject] = useState<HubProject | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const loadSequence = useRef(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [membersError, setMembersError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Đóng vận hành theo lifecycle server; không suy từ thời hạn bảo hành.
  const handleCloseProjectConfirm = async (reason: string, version: string) => {
    if (!project) return
    try {
      await projectService.closeProject(project.id, { reason, version })
      await loadProjectData()
      showToast('Đã ghi nhận đóng vận hành dự án.')
    } catch (err: any) {
      throw err
    }
  }

  // Fetch Project Data bất đồng bộ qua Mock API
  const loadProjectData = useCallback(async () => {
    const sequence = ++loadSequence.current
    const epoch = useAuthStore.getState().authEpoch
    const current = () => sequence === loadSequence.current && epoch === useAuthStore.getState().authEpoch
    if (!useAuthStore.getState().isAuthenticated || useAuthStore.getState().status === 'logging-out') { setProject(null); setMembers([]); setIsLoading(false); return }
    setIsLoading(true)
    setProject(null); setMembers([]); setLoadError(null); setMembersError(null)
    try {
      const data = await projectService.fetchProjectById(projectId)
      if (!current()) return
      if (data) {
        setProject(data)

        // 2. Cơ cấu nhân sự từ API Backend thật (API-112: GET /projects/{projectId}/members)
        try {
          const rawMembers = await projectService.fetchProjectMembers(data.id, isSupervisor)
          if (!current()) return
          if (rawMembers && rawMembers.length > 0) {
            const mappedMembers: ProjectMember[] = rawMembers.map((m: any) => {

              return {
                id: m.membershipId || m.userId,
                name: m.displayName || 'Chưa cập nhật',
                role_code: m.role || 'MEMBER',
                role_title: m.role === 'PM' || m.role === 'PROJECT_MANAGER'
                  ? 'Chỉ huy trưởng dự án (Project Manager)'
                  : m.role === 'OPERATOR' || m.role === 'DRONE_OPERATOR'
                  ? 'Phi công Drone (Operator)'
                  : m.role === 'CREW' || m.role === 'REPAIR_CREW'
                  ? 'Đội trưởng thi công (Crew)'
                  : m.role === 'SUPERVISOR' ? 'Giám sát viên (Supervisor)' : (m.role || 'Chưa cập nhật'),
                role_badge: m.isPrimary ? 'PM chính' : m.role === 'OPERATOR' ? 'Phi công' : m.role === 'CREW' ? 'Đội thi công' : m.role === 'PM' ? 'PM' : 'Chưa cập nhật',
                avatar: '',
                membership_status: m.status, valid_from: m.validFrom, valid_to: m.validTo, membership_version: m.membershipVersion,
                is_online: false,
                authority: m.role === 'PM' || m.role === 'PROJECT_MANAGER'
                  ? 'Quản lý tim tuyến, lập yêu cầu bay drone, điều phối sửa chữa (BR-01)'
                  : 'Thực hiện nhiệm vụ được giao ngoài hiện trường',
                contact: '',
                unit: ''
              }
            })
            setMembers(mappedMembers)
          } else {
            setMembers([])
          }
        } catch (err: any) {
          if (!current()) return
          setMembersError(projectMemberErrorMessage(err))
        }
      } else {
        setLoadError('Không tìm thấy dự án hoặc bạn không có quyền truy cập.')
      }
    } catch (err: any) {
      if (current()) { console.warn('[Project read]', { status: err?.response?.status, code: err?.response?.data?.code, correlationId: err?.response?.data?.correlationId }); setLoadError('Không thể tải thông tin dự án. Vui lòng thử lại.') }
    } finally {
      if (current()) setIsLoading(false)
    }
  }, [projectId, user?.id])

  useEffect(() => {
    loadProjectData()
    window.addEventListener('roadguard_state_change', loadProjectData)
    return () => { ++loadSequence.current; window.removeEventListener('roadguard_state_change', loadProjectData) }
  }, [loadProjectData])

  if (!isLoading && (loadError || !project)) return <div role="alert">
    {loadError || 'Không tìm thấy dự án hoặc bạn không có quyền truy cập.'}
    <button onClick={loadProjectData}>Tải lại dự án</button>
  </div>

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
        project={project}
        basePath={basePath}
        isSupervisor={isSupervisor}
        onNavigate={navigate}
        onCloseProject={() => setIsCloseModalOpen(true)}
      />

      <ProjectHighlightsGrid project={project} />

      {/* 3. MAIN TWO-COLUMN SPLIT (8 cols Left | 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS */}
        <div className="min-w-0 lg:col-span-8 space-y-6">
          <ProjectTimelineStepper project={project} basePath={basePath} isSupervisor={isSupervisor} onNavigate={navigate} />
          <ProjectSegmentsTable projectId={project.id} segments={[]} basePath={basePath} onNavigate={navigate} onViewSegment={() => {}} />
        </div>

        {/* RIGHT COLUMN: 4 COLS */}
        <div className="min-w-0 lg:col-span-4 space-y-6">
          <ProjectPersonnelCard
            members={members}
            error={membersError}
            project={project}
            onReloadMembers={loadProjectData}
            showToast={showToast}
          />
          <ProjectMapPreviewCard project={project} basePath={basePath} isSupervisor={isSupervisor} />


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
