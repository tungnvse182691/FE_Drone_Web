import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectOverviewHeaderProps {
  project: HubProject
  basePath: string
  isSupervisor: boolean
  onNavigate: (path: string) => void
  onCloseProject?: () => void
  mainlineLengthKm?: number
  branchesLengthKm?: number
  branchesCount?: number
}

export const ProjectOverviewHeader: React.FC<ProjectOverviewHeaderProps> = ({
  project,
  basePath,
  isSupervisor,
  onNavigate,
  onCloseProject,
  mainlineLengthKm = 0,
  branchesLengthKm = 0,
  branchesCount = 0
}) => {
  const hasPendingProposals = project.repair_packages > 0

  return (
    <div className="flex flex-col gap-3 font-body">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button
          onClick={() => onNavigate(`${basePath}/dashboard`)}
          className="hover:text-brand-gold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Icon name="home" size={16} />
          <span>Trang chủ</span>
        </button>
        <Icon name="chevron_right" size={16} className="text-slate-400" />
        <button
          onClick={() => onNavigate(`${basePath}/projects`)}
          className="hover:text-brand-gold cursor-pointer transition-colors"
        >
          Dự án
        </button>
        <Icon name="chevron_right" size={16} className="text-slate-400" />
        <span className="text-slate-800 font-semibold">{project.name}</span>
        <Icon name="chevron_right" size={16} className="text-slate-400" />
        <span className="text-brand-gold font-bold">Tổng quan &amp; Nhân sự</span>
      </nav>

      {/* Main Header Card - Minimalism */}
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 sm:p-6 shadow-2xs overflow-hidden min-w-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-[#1E40AF] to-slate-200" />
        <div className="min-w-0 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="break-words text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-headline">
              {project.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700  font-bold border border-slate-200">
              {project.code}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === 'CLOSED'
                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                  : project.status === 'RESTRICTED'
                  ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                  : project.status === 'NEAR_EXPIRY'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : project.status === 'PENDING_ALIGNMENT'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  project.status === 'CLOSED'
                    ? 'bg-slate-600'
                    : project.status === 'RESTRICTED'
                    ? 'bg-amber-600'
                    : project.status === 'NEAR_EXPIRY'
                    ? 'bg-rose-600 animate-ping'
                    : project.status === 'PENDING_ALIGNMENT'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
              ></span>
              {project.status === 'RESTRICTED' ? 'Tạm dừng vận hành' : project.status_label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1  text-slate-800 font-semibold">
              <Icon name="alt_route" size={16} className="text-brand-gold" />
              <span>Chưa cập nhật</span>
            </div>

            <div className="text-xs border border-amber-200 bg-amber-50 rounded px-2 py-1">Trục chính / Tuyến phụ: Chưa cập nhật</div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              <Icon name="location_on" size={15} className="text-brand-gold shrink-0" />
              <span>
                Địa bàn:{' '}
                <strong className={project.region || project.location_detail ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal italic'}>
                  Chưa cập nhật
                </strong>
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Icon name="verified_user" size={16} className="text-slate-400" />
              <span>PM chính: {project.pm_user_id ? project.pm_name : 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Đóng dự án (Duy nhất Supervisor) */}
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {isSupervisor && project.status !== 'CLOSED' && onCloseProject && (
            <button
              onClick={onCloseProject}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Icon name="lock" size={16} />
              <span>Đóng vận hành dự án</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold text-sm text-slate-900">Hồ sơ và quy trình dự án</h2><p className="text-xs text-slate-600 mt-1">Xem hồ sơ tuyến, thành viên và các đề xuất của dự án.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)} className="rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white px-4 py-2 text-xs font-semibold">Quản lý geometry tuyến</button><button onClick={() => onNavigate(`${basePath}/proposals`)} className="rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white px-4 py-2 text-xs font-semibold">Xem các đề xuất đã trình</button></div>
      </div>
    </div>
  )
}
