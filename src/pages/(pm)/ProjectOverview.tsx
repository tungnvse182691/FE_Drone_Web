import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { CheckCircle2, X } from 'lucide-react'
import { Segment, ProjectMember } from './project-overview/types'
import { INITIAL_SEGMENTS, INITIAL_MEMBERS } from './project-overview/mockData'
import { ProjectOverviewHeader } from './project-overview/ProjectOverviewHeader'
import { ProjectHighlightsGrid } from './project-overview/ProjectHighlightsGrid'
import { ProjectTimelineStepper } from './project-overview/ProjectTimelineStepper'
import { ProjectSegmentsTable } from './project-overview/ProjectSegmentsTable'
import { ProjectPersonnelCard } from './project-overview/ProjectPersonnelCard'
import { ProjectMapPreviewCard } from './project-overview/ProjectMapPreviewCard'

export type { Segment, ProjectMember }

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const projectId = id || 'prj-ql1a-02'
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [segments] = useState<Segment[]>(INITIAL_SEGMENTS)
  const [members] = useState<ProjectMember[]>(INITIAL_MEMBERS)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP BAR & BREADCRUMB CONTEXT */}
      <ProjectOverviewHeader
        basePath={basePath}
        isSupervisor={isSupervisor}
        onNavigate={navigate}
        onUpdateInfo={() => showToast('Mở màn hình cập nhật thông tin dự án...')}
      />

      {/* 2. PROJECT HIGHLIGHTS GRID (3 CARDS) */}
      <ProjectHighlightsGrid />

      {/* 3. MAIN TWO-COLUMN SPLIT (8 cols Left | 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS */}
        <div className="lg:col-span-8 space-y-6">
          <ProjectTimelineStepper
            projectId={projectId}
            basePath={basePath}
            onNavigate={navigate}
          />

          <ProjectSegmentsTable
            segments={segments}
            basePath={basePath}
            onNavigate={navigate}
            onViewSegment={(code) => showToast(`Xem chi tiết phân đoạn ${code}`)}
          />
        </div>

        {/* RIGHT COLUMN: 4 COLS */}
        <div className="lg:col-span-4 space-y-6">
          <ProjectPersonnelCard members={members} />

          <ProjectMapPreviewCard
            projectId={projectId}
            basePath={basePath}
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectOverview
