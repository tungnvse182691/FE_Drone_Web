import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  ShieldCheck,
  Building,
  Compass,
  Upload,
  Send,
  Lock
} from 'lucide-react'
import { AssignedProjectOption } from './types'

export interface AlignmentHeaderProps {
  basePath: string
  alignmentStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  activeProject: AssignedProjectOption
  selectedProjectId: string
  assignedProjects: AssignedProjectOption[]
  importedLengthKm: number
  isSupervisor: boolean
  onSwitchProject: (id: string) => void
  onOpenImportModal: () => void
  onSubmitAlignment: () => void
  onLockAlignment: () => void
}

export const AlignmentHeader: React.FC<AlignmentHeaderProps> = ({
  basePath,
  alignmentStatus,
  activeProject,
  selectedProjectId,
  assignedProjects,
  importedLengthKm,
  isSupervisor,
  onSwitchProject,
  onOpenImportModal,
  onSubmitAlignment,
  onLockAlignment,
}) => {
  const navigate = useNavigate()

  return (
    <section className="bg-white rounded-xl px-5 py-3.5 shadow-2xs border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex flex-col gap-1 min-w-0">
        {/* Breadcrumb & Status */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 font-medium">
            <button
              onClick={() => navigate(`${basePath}/dashboard`)}
              className="hover:text-brand-gold transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => navigate(`${basePath}/projects`)}
              className="hover:text-brand-gold transition-colors cursor-pointer"
            >
              Dự án
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">Thiết lập tim tuyến & Phân đoạn (WF-02)</span>
          </nav>

          <span className="text-slate-300">•</span>

          {/* Trạng thái tim tuyến Badge */}
          {alignmentStatus === 'DRAFT' ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-amber-800 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              DRAFT v1.2 • Đang chỉnh sửa đỉnh
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-emerald-800 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              CONFIRMED • Đã khóa tim tuyến SHA-256
            </span>
          )}
        </div>

        {/* Project Title & Project Switcher */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
          <h1 className="text-lg font-bold text-brand-dark tracking-tight">
            Quản Lý Hình Học Tuyến & Phân Đoạn Lý Trình
          </h1>
          <span className="hidden lg:inline text-slate-300">|</span>

          {/* Dropdown chọn dự án PM phụ trách */}
          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/90 px-2.5 py-1 rounded-xl shadow-2xs">
            <Building className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600">Dự án phụ trách:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => onSwitchProject(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer hover:text-[#8F7212] transition-colors"
            >
              {assignedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            L = {importedLengthKm >= 1 ? `${importedLengthKm.toFixed(2)} km` : `${Math.round(importedLengthKm * 1000)} mét`} ({activeProject.stationOriginText.split(' ')[0]} → Km {(activeProject.stationOriginKm + importedLengthKm).toFixed(1)})
          </span>
          <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Compass className="w-3.5 h-3.5 text-[#C9A227]" />
            {activeProject.crs}
          </span>
        </div>
      </div>

      {/* Action Button Group */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onOpenImportModal}
          className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          type="button"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Nhập Tuyến / Tọa độ (WF-02)</span>
        </button>

        {/* PM: Submit Approval */}
        {!isSupervisor && (
          <button
            onClick={onSubmitAlignment}
            disabled={alignmentStatus === 'CONFIRMED'}
            className={`h-8 px-3.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
              alignmentStatus === 'CONFIRMED'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white shadow-xs cursor-pointer'
            }`}
            type="button"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Trình duyệt tim tuyến</span>
          </button>
        )}

        {/* Supervisor: Lock Baseline */}
        {isSupervisor && (
          <button
            onClick={onLockAlignment}
            disabled={alignmentStatus === 'CONFIRMED'}
            className={`h-8 px-3.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all ${
              alignmentStatus === 'CONFIRMED'
                ? 'bg-emerald-600 text-white opacity-90 cursor-default'
                : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white cursor-pointer active:scale-98'
            }`}
            type="button"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{alignmentStatus === 'CONFIRMED' ? 'Đã khóa tim tuyến' : 'Xác nhận & Khóa tim tuyến'}</span>
          </button>
        )}
      </div>
    </section>
  )
}
