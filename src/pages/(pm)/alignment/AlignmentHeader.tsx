import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { AssignedProjectOption } from './types'

export interface AlignmentHeaderProps {
  basePath: string
  alignmentStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  activeProject: AssignedProjectOption
  selectedProjectId: string
  assignedProjects: AssignedProjectOption[]
  importedLengthKm: number
  branchesTotalLengthKm?: number
  totalProjectLengthKm?: number
  branchesCount?: number
  currentCoords?: [number, number][]
  isSupervisor: boolean
  onSwitchProject: (id: string) => void
  onOpenImportModal: () => void
  onClearMainline?: () => void
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
  branchesTotalLengthKm = 0,
  totalProjectLengthKm,
  branchesCount = 0,
  currentCoords = [],
  isSupervisor,
  onSwitchProject,
  onOpenImportModal,
  onClearMainline,
  onSubmitAlignment,
  onLockAlignment,
}) => {
  const navigate = useNavigate()
  const displayTotalKm = totalProjectLengthKm !== undefined ? totalProjectLengthKm : importedLengthKm

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
            <Icon name="chevron_right" size={14} className="text-slate-400" />
            <button
              onClick={() => navigate(`${basePath}/projects`)}
              className="hover:text-brand-gold transition-colors cursor-pointer"
            >
              Dự án
            </button>
            <Icon name="chevron_right" size={14} className="text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">Thiết lập tim tuyến &amp; Phân đoạn (WF-02)</span>
          </nav>

          <span className="text-slate-300">•</span>

          {/* Trạng thái tim tuyến Badge */}
          {alignmentStatus === 'DRAFT' && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-amber-800 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              DRAFT v1.2 • Đang chỉnh sửa đỉnh
            </span>
          )}
          {alignmentStatus === 'PENDING_APPROVAL' && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-blue-800 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              PENDING_APPROVAL • Chờ Supervisor duyệt tim tuyến
            </span>
          )}
          {alignmentStatus === 'CONFIRMED' && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-emerald-800 font-bold text-[11px]">
              <Icon name="verified_user" size={14} className="text-emerald-600" />
              CONFIRMED • Đã khóa tim tuyến SHA-256
            </span>
          )}
        </div>

        {/* Project Title & Project Switcher */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
          <h1 className="text-lg font-bold text-brand-dark tracking-tight">
            Quản Lý Hình Học Tuyến &amp; Phân Đoạn Lý Trình
          </h1>
          <span className="hidden lg:inline text-slate-300">|</span>

          {/* Dropdown chọn dự án PM phụ trách */}
          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/90 px-2.5 py-1 rounded-xl shadow-2xs">
            <Icon name="domain" size={14} className="text-brand-gold shrink-0" />
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

          {displayTotalKm > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-900 bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded shadow-2xs">
                Tổng L = {displayTotalKm >= 1 ? `${displayTotalKm.toFixed(2)} km` : `${Math.round(displayTotalKm * 1000)} mét`}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Trục chính: {importedLengthKm >= 1 ? `${importedLengthKm.toFixed(2)} km` : `${Math.round(importedLengthKm * 1000)} m`}
                {branchesCount > 0 ? ` • ${branchesCount} nhánh phụ: ${branchesTotalLengthKm >= 1 ? `${branchesTotalLengthKm.toFixed(2)} km` : `${Math.round(branchesTotalLengthKm * 1000)} m`}` : ''}
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              Chưa có tim tuyến • 0.00 km
            </span>
          )}
          <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Icon name="explore" size={14} className="text-brand-gold" />
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
          <Icon name="upload_file" size={14} className="text-slate-500" />
          <span>Nhập Tuyến / Tọa độ (WF-02)</span>
        </button>

        {/* PM: Clear Mainline Button */}
        {!isSupervisor && onClearMainline && (currentCoords.length > 0 || importedLengthKm > 0) && (
          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn xóa toàn bộ tim tuyến trục chính và các mốc lý trình của dự án này không? Bản đồ sẽ trở về trạng thái trống để bạn nhập hoặc vẽ lại từ đầu.')) {
                onClearMainline()
              }
            }}
            className="h-8 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            type="button"
            title="Xóa toàn bộ tim tuyến trục chính để nhập hoặc vẽ lại từ đầu"
          >
            <Icon name="delete" size={14} className="text-rose-600" />
            <span>Xóa tuyến</span>
          </button>
        )}

        {/* PM: Submit Approval */}
        {!isSupervisor && (
          <button
            onClick={onSubmitAlignment}
            disabled={alignmentStatus === 'CONFIRMED' || alignmentStatus === 'PENDING_APPROVAL'}
            className={`h-8 px-3.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
              alignmentStatus === 'CONFIRMED'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : alignmentStatus === 'PENDING_APPROVAL'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-not-allowed'
                : 'bg-brand-gold hover:bg-[#B38E1F] text-white shadow-xs cursor-pointer'
            }`}
            type="button"
          >
            <Icon name="send" size={14} />
            <span>
              {alignmentStatus === 'PENDING_APPROVAL'
                ? 'Đã trình duyệt tim tuyến'
                : alignmentStatus === 'CONFIRMED'
                ? 'Đã khóa tim tuyến'
                : 'Trình duyệt tim tuyến'}
            </span>
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
                : 'bg-brand-gold hover:bg-[#B38E1F] text-white cursor-pointer active:scale-98'
            }`}
            type="button"
          >
            <Icon name="lock" size={14} />
            <span>{alignmentStatus === 'CONFIRMED' ? 'Đã khóa tim tuyến' : 'Xác nhận & Khóa tim tuyến'}</span>
          </button>
        )}
      </div>
    </section>
  )
}
