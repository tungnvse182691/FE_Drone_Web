import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectOverviewHeaderProps {
  project: HubProject
  basePath: string
  isSupervisor: boolean
  onNavigate: (path: string) => void
  onUpdateInfo: () => void
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
  onUpdateInfo,
  onCloseProject,
  mainlineLengthKm = 0,
  branchesLengthKm = 0,
  branchesCount = 0
}) => {
  const hasPendingProposals = project.repair_packages > 0

  return (
    <div className="flex flex-col gap-3 font-body">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
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
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-6 shadow-2xs overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-[#1E40AF] to-slate-200" />
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight font-headline">
              {project.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
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
            <div className="flex items-center gap-1 font-mono text-slate-800 font-semibold">
              <Icon name="alt_route" size={16} className="text-brand-gold" />
              <span>{project.stationing_text}</span>
            </div>

            {/* Chi tiết Tuyến chính & Tuyến phụ Badge */}
            <div className="flex items-center gap-1 font-mono text-[11px] bg-amber-50/90 text-amber-950 border border-amber-200/90 px-2 py-0.5 rounded shadow-2xs">
              <span className="font-semibold">Trục chính: {mainlineLengthKm > 0 ? `${mainlineLengthKm}km` : (project.length_km > 0 ? `${project.length_km}km` : '0km')}</span>
              {branchesCount > 0 ? (
                <span className="text-amber-800 font-bold">
                  • {branchesCount} tuyến phụ ({branchesLengthKm}km)
                </span>
              ) : (
                <span className="text-slate-500 font-normal">• 0 tuyến phụ</span>
              )}
            </div>

            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Icon name="location_on" size={16} className="text-slate-400" />
              <span>Khu vực: {project.region} ({project.location_detail})</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Icon name="verified_user" size={16} className="text-slate-400" />
              <span>PM Chính: {project.pm_name}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Đóng dự án (Duy nhất Supervisor) & Cập nhật thông tin */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {isSupervisor && project.status !== 'CLOSED' && onCloseProject && (
            <button
              onClick={onCloseProject}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Icon name="lock" size={16} />
              <span>Đóng dự án</span>
            </button>
          )}

          {project.status !== 'CLOSED' && (
            <button
              onClick={onUpdateInfo}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              <Icon name="settings" size={16} className="text-slate-500" />
              <span>Cập nhật thông tin</span>
            </button>
          )}
        </div>
      </div>

      {/* Workflow Context Banner */}
      {project.status === 'CLOSED' ? (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Icon name="inventory_2" size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  Hồ sơ công trình đã đóng bảo hành • Trạng thái chỉ đọc
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 uppercase tracking-wide">
                  LƯU TRỮ HỒ SƠ
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Dự án được đóng bởi <strong className="text-slate-900">{project.closed_by || 'Giám sát'}</strong> ngày{' '}
                {project.closed_at ? new Date(project.closed_at).toLocaleDateString('vi-VN') : '15/01/2026'}.
                {project.closed_reason && ` Kết luận: "${project.closed_reason}"`}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600 font-mono shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            Hạn lưu trữ: <span className="font-semibold text-slate-900">{project.retention_until || 'Tối thiểu 5 năm'}</span>
          </div>
        </div>
      ) : project.status === 'RESTRICTED' ? (
        <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <Icon name="pause_circle" size={22} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  Dự án đang trong trạng thái tạm dừng vận hành
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 uppercase tracking-wide">
                  TẠM NGƯNG
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Các hoạt động tạo yêu cầu bay Drone và lập đợt sửa chữa tạm thời bị hạn chế theo quyết định điều hành của Giám sát / Chủ đầu tư.
              </p>
            </div>
          </div>
        </div>
      ) : hasPendingProposals ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Icon name="schedule" size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  Đang chờ Giám sát duyệt: {project.repair_packages} Đề xuất phương án kỹ thuật sửa chữa
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wide">
                  SLA CẢNH BÁO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trách nhiệm hiện tại: <strong className="font-semibold text-slate-900">Giám sát trưởng</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={() => onNavigate(`${basePath}/proposals`)}
              type="button"
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldMuted text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{isSupervisor ? 'Thẩm duyệt phương án sửa chữa' : 'Xem các đề xuất đã trình'}</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          </div>
        </div>
      ) : project.length_km === 0 ? (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
              <Icon name="alt_route" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">
                Bước tiếp theo: Thiết lập tim tuyến &amp; bề rộng mặt đường
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Dự án vừa được khởi tạo bởi Giám sát. Kỹ sư PM <strong className="text-slate-900">{project.pm_name}</strong> cần nhập chuỗi tọa độ tim tuyến WGS84 và bề rộng để kích hoạt không gian trắc địa.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
            type="button"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldMuted text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <span>Thiết lập tim tuyến</span>
            <Icon name="arrow_forward" size={16} />
          </button>
        </div>
      ) : project.kml_status === 'Chờ duyệt tim tuyến' || project.status === 'PENDING_ALIGNMENT' ? (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Icon name="pending_actions" size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  Hồ sơ tim tuyến &amp; Phân đoạn lý trình đang chờ thẩm duyệt
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  CHỜ DUYỆT
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                PM <strong className="text-slate-900">{project.pm_name}</strong> đã nạp tim tuyến (Tổng L = {project.length_km} km) và trình duyệt sang Giám sát.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
            type="button"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldMuted text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <span>{isSupervisor ? 'Thẩm duyệt tim tuyến' : 'Xem chi tiết tim tuyến'}</span>
            <Icon name="arrow_forward" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
