import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService } from '../../api/services'
import { projectMemberErrorMessage } from '../../api/services/personnelService'
import { alignmentService } from '../../api/services/alignmentService'
import { Icon } from '../../components/ui/Icon'
import { HubProject } from './projects/types'
import { Segment, ProjectMember } from './project-overview/types'
import { ProjectOverviewHeader } from './project-overview/ProjectOverviewHeader'
import { ProjectHighlightsGrid } from './project-overview/ProjectHighlightsGrid'
import { ProjectTimelineStepper } from './project-overview/ProjectTimelineStepper'
import { ProjectSegmentsTable } from './project-overview/ProjectSegmentsTable'
import { ProjectPersonnelCard } from './project-overview/ProjectPersonnelCard'
import { ProjectMapPreviewCard } from './project-overview/ProjectMapPreviewCard'
import { calculateCoordsLengthKm } from './alignment/alignmentGeometryHelpers'
import { CloseProjectModal } from './projects/CloseProjectModal'

export type { Segment, ProjectMember }

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = id || ''
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [project, setProject] = useState<HubProject | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [segments, setSegments] = useState<Segment[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const loadSequence = useRef(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [membersError, setMembersError] = useState<string | null>(null)
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
    mainlineLengthKm: 0,
    branchesLengthKm: 0,
    branchesCount: 0,
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
      const closed = await projectService.closeProject(project.id, { reason })
      setProject(closed)
      showToast(`Đã đóng thành công dự án [${closed.code}] và chuyển sang lưu trữ hồ sơ!`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đóng dự án')
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

        // 1. Phân đoạn lý trình động & Bóc tách tuyến chính / tuyến phụ
        const alignmentData = alignmentService.getAlignmentData(data.id)
        const mainlineCoords = alignmentData.coords || []
        const branchesList = alignmentData.branches || []

        const mainLen = mainlineCoords.length >= 2
          ? calculateCoordsLengthKm(mainlineCoords)
          : 0

        const branchLen = branchesList.reduce((sum: number, b: any) => {
          const len = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : b.lengthKm) || 0
          return sum + len
        }, 0)

        setAlignmentDetail({
          mainlineLengthKm: mainLen,
          branchesLengthKm: parseFloat(branchLen.toFixed(3)),
          branchesCount: branchesList.length,
          branches: branchesList
        })

                const storedSegments = (alignmentData.segments as any[]) || []
        const mappedSegments: Segment[] = storedSegments.map((s: any, idx: number) => {
          const start = s.startKm !== undefined ? s.startKm : (s.start_km ?? 0)
          const end = s.endKm !== undefined ? s.endKm : (s.end_km ?? 0)
          const len = s.lengthKm !== undefined ? s.lengthKm : (s.length_km ?? parseFloat((end - start).toFixed(3)))
          const stationText = s.stationing || `Km ${start.toFixed(3).replace('.', '+')} → Km ${end.toFixed(3).replace('.', '+')}`
          return {
            code: s.code || `Đoạn #${String(idx + 1).padStart(2, '0')}`,
            stationing: stationText,
            length_km: len,
            status_label: s.statusText || s.status_label || 'Hợp lệ',
            status_type: s.status === 'GAP_WARNING' ? 'WARNING' : 'GOOD',
            open_defects: s.open_defects || '0 điểm',
            defects_count: s.defects_count || 0
          }
        })
        setSegments(mappedSegments)

        // 2. Cơ cấu nhân sự từ API Backend thật (API-112: GET /projects/{projectId}/members)
        try {
          const rawMembers = await projectService.fetchProjectMembers(data.id, isSupervisor)
          if (!current()) return
          if (rawMembers && rawMembers.length > 0) {
            const mappedMembers: ProjectMember[] = rawMembers.map((m: any) => {

              return {
                id: m.membershipId || m.userId,
                name: m.displayName || 'Chưa có tên trong API',
                role_code: m.role || 'MEMBER',
                role_title: m.role === 'PM' || m.role === 'PROJECT_MANAGER'
                  ? 'Chỉ huy trưởng dự án (Project Manager)'
                  : m.role === 'OPERATOR' || m.role === 'DRONE_OPERATOR'
                  ? 'Phi công Drone (Operator)'
                  : m.role === 'CREW' || m.role === 'REPAIR_CREW'
                  ? 'Đội trưởng thi công (Crew)'
                  : m.role === 'SUPERVISOR' ? 'Giám sát viên (Supervisor)' : (m.role || 'Chưa có vai trò trong API'),
                role_badge: m.isPrimary ? 'PM CHÍNH' : m.role,
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
        setLoadError('Dự án không thuộc danh mục API cho phép hoặc không còn quyền truy cập.')
      }
    } catch (err: any) {
      console.error('[ProjectOverview] Lỗi tải dữ liệu dự án:', err)
      if (current()) setLoadError(err?.response?.data?.detail || err?.message || 'Lỗi tải dự án.')
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
    {loadError || 'Không tìm thấy dự án trong phạm vi tài khoản.'}
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
        mainlineLengthKm={alignmentDetail.mainlineLengthKm}
        branchesLengthKm={alignmentDetail.branchesLengthKm}
        branchesCount={alignmentDetail.branchesCount}
      />

      {/* 2. PROJECT HIGHLIGHTS GRID (3 CARDS) */}
      {project.stats_error || project.warranty_data_missing ? <p role="alert">{project.stats_error || 'Chưa có ngày bảo hành từ API.'}</p> : <ProjectHighlightsGrid
        project={project}
        mainlineLengthKm={alignmentDetail.mainlineLengthKm}
        branchesLengthKm={alignmentDetail.branchesLengthKm}
        branchesCount={alignmentDetail.branchesCount}
      />}

      {/* 3. MAIN TWO-COLUMN SPLIT (8 cols Left | 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS */}
        <div className="lg:col-span-8 space-y-6">
          <ProjectTimelineStepper
            project={project}
            basePath={basePath}
            isSupervisor={isSupervisor}
            onNavigate={navigate}
          />

          <ProjectSegmentsTable
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
            error={membersError}
            project={project}
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
