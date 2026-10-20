import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService } from '../../api/services'
import { alignmentService } from '../../api/services/alignmentService'
import { Icon } from '../../components/ui/Icon'
import { HubProject } from './projects/types'
import { Segment, ProjectMember } from './project-overview/types'
import { INITIAL_SEGMENTS, INITIAL_MEMBERS } from './project-overview/mockData'
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
  const projectId = id || 'prj-ql1a-02'
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [project, setProject] = useState<HubProject | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [segments, setSegments] = useState<Segment[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
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

  // Đóng dự án khi hết hạn bảo hành (BƯỚC SUP-07: DA12, QT13, BC10)
  const handleCloseProjectConfirm = async (reason: string) => {
    if (!project) return
    try {
      const closed = await projectService.closeProject(project.id, { reason })
      setProject(closed)
      showToast(`Đã đóng thành công dự án [${closed.code}] và lưu trữ hồ sơ theo quy chuẩn (DA12, QT13)!`)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đóng dự án')
      throw err
    }
  }

  // Fetch Project Data bất đồng bộ qua Mock API
  const loadProjectData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await projectService.fetchProjectById(projectId)
      if (data) {
        setProject(data)

        // 1. Phân đoạn lý trình động & Bóc tách tuyến chính / tuyến phụ
        const alignmentData = alignmentService.getAlignmentData(data.id)
        const mainlineCoords = alignmentData.coords || []
        const branchesList = alignmentData.branches || []

        const mainLen = mainlineCoords.length >= 2
          ? calculateCoordsLengthKm(mainlineCoords)
          : (data.id === 'prj-ql1a-02' ? data.length_km : 0)

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

        if (data.id === 'prj-ql1a-02') {
          setSegments(INITIAL_SEGMENTS)
        } else {
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
        }

        // 2. Cơ cấu nhân sự động bám sát PM phụ trách theo BR-01
        if (data.id === 'prj-ql1a-02') {
          setMembers(INITIAL_MEMBERS)
        } else {
          const dynamicMembers: ProjectMember[] = [
            {
              id: 'mem-sup-01',
              name: 'Nguyễn Văn An',
              role_code: 'SUPERVISOR',
              role_title: 'Giám sát trưởng (Supervisor)',
              role_badge: 'SUPERVISOR',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
              is_online: true,
              authority: 'Khởi tạo dự án, thẩm duyệt hồ sơ & ký số đóng đợt bảo hành (DA01)',
              contact: 'an.nv@hoanghai-infra.vn • 0912.888.666',
              unit: 'Ban Giám sát Hoàng Hải / Chủ đầu tư'
            },
            {
              id: `mem-pm-${data.id}`,
              name: data.pm_name || 'Đỗ Quốc Hoàng',
              role_code: 'PM',
              role_title: 'Chỉ huy trưởng dự án (Project Manager)',
              role_badge: 'PM CHÍNH',
              avatar: data.pm_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
              is_online: true,
              authority: 'Quản lý tim tuyến, lập yêu cầu bay drone, điều phối sửa chữa (BR-01)',
              contact: `${data.pm_email || 'pmhoang@gmail.com'} • Đang trực tuyến`,
              unit: 'Ban Chỉ huy Công trường'
            }
          ]
          setMembers(dynamicMembers)
        }
      } else {
        // Fallback an toàn nếu không tìm thấy ID
        setProject(projectService.getProjects()[0] || null)
      }
    } catch (err: any) {
      console.error('[ProjectOverview] Lỗi tải dữ liệu dự án:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProjectData()
    window.addEventListener('roadguard_state_change', loadProjectData)
    return () => window.removeEventListener('roadguard_state_change', loadProjectData)
  }, [loadProjectData])

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
        onUpdateInfo={() => showToast('Mở màn hình cập nhật thông tin dự án...')}
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
          <ProjectPersonnelCard members={members} project={project} />

          <ProjectMapPreviewCard
            project={project}
            basePath={basePath}
            onNavigate={navigate}
            activeTab={activeAlignmentTab}
          />
        </div>
      </div>

      {/* MODAL ĐÓNG DỰ ÁN KHI HẾT HẠN BẢO HÀNH (DA12, QT13, BC10) */}
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
