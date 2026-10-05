import React from 'react'
import {
  Home,
  ChevronRight,
  Route as RouteIcon,
  MapPin,
  ShieldCheck,
  Settings,
  Clock,
  ArrowRight
} from 'lucide-react'

interface ProjectOverviewHeaderProps {
  basePath: string
  isSupervisor: boolean
  onNavigate: (path: string) => void
  onUpdateInfo: () => void
}

export const ProjectOverviewHeader: React.FC<ProjectOverviewHeaderProps> = ({
  basePath,
  isSupervisor,
  onNavigate,
  onUpdateInfo
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            onClick={() => onNavigate(`${basePath}/dashboard`)}
            className="hover:text-brand-gold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => onNavigate(`${basePath}/projects`)}
            className="hover:text-brand-gold cursor-pointer transition-colors"
          >
            Dự án
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-dark font-semibold">QL1A - Giai đoạn 2</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-gold font-bold">Tổng quan &amp; Nhân sự</span>
        </nav>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-dark tracking-tight">
              Quốc lộ 1A - Giai đoạn 2
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              PRJ-QL1A-02
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A227]/10 text-[#8F7212] border border-[#C9A227]/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
              Đang trong thời hạn bảo hành
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1 font-mono text-brand-dark font-semibold">
              <RouteIcon className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Km 1024+000 → Km 1045+500</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Khu vực: Thừa Thiên Huế – TP. Đà Nẵng</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Chủ đầu tư: Ban Quản lý Dự án Đường bộ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onUpdateInfo}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors border border-slate-200 shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Cập nhật thông tin</span>
          </button>
        </div>
      </div>

      {/* Workflow Handover Status Banner */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-brand-dark">
                Đang chờ Supervisor duyệt: 02 Đề xuất phương án kỹ thuật sửa chữa (WF-07)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide border border-red-200">
                SLA CẢNH BÁO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trách nhiệm hiện tại:{' '}
              <strong className="font-semibold text-brand-dark">Supervisor Nguyễn Văn An</strong>. Hạn cam kết phản hồi:{' '}
              <span className="font-mono font-bold text-red-600">còn 14 giờ</span> trước khi vi phạm chuẩn quy trình O&amp;M.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={() => onNavigate(isSupervisor ? '/sup/proposals/PKG-2026-08' : '/pm/proposals')}
            type="button"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <span>{isSupervisor ? 'Mở nhanh WF-07 để duyệt' : 'Xem các đề xuất đã trình (WF-07)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
