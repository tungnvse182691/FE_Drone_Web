import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService, personnelService } from '../../api/services'
import { alignmentService } from '../../api/services/alignmentService'
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
import { calculateCoordsLengthKm } from './alignment/alignmentGeometryHelpers'
import { CloseProjectModal } from './projects/CloseProjectModal'

export type { Segment, ProjectMember }

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = id || ''
  const navigate = useNavigate()
  const { user, authEpoch } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

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

        // 1. Phân đoạn lý trình động & Bóc tách tuyến chính / tuyến phụ
        const alignmentData = alignmentService.getAlignmentData(data.id)
        const mainlineCoords = alignmentData.coords || []
        const branchesList = alignmentData.branches || []

        const mainLen = mainlineCoords.length >= 2
          ? calculateCoordsLengthKm(mainlineCoords)
          : (data.id === 'prj-ql1a-02' ? (data.length_km || 0) : 0)

        const branchLen = branchesList.reduce((sum: number, b: any) => {
          const len = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : b.lengthKm) || 0
          return sum + len
        }, 0)

        setAlignmentDetail({
          mainlineLengthKm: mainLen || 0,
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
