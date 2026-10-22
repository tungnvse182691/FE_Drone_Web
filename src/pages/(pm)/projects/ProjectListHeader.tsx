import React from 'react'
import { Icon } from '../../../components/ui/Icon'

interface ProjectListHeaderProps {
  isSupervisor: boolean
  onNavigateHome: () => void
  onOpenCreateModal: () => void
}

export const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({
  isSupervisor,
  onNavigateHome,
  onOpenCreateModal
}) => {
  return (
    <>
      {/* TOP CONTEXT BAR: BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span
            onClick={onNavigateHome}
            className="hover:text-brand-gold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Icon name="home" size={16} />
            <span>Trang chủ</span>
          </span>
          <Icon name="chevron_right" size={16} className="text-slate-400" />
          <span className="text-slate-800 font-semibold">Danh mục dự án bảo hành</span>
        </div>
      </div>

      {/* PAGE HEADER & PRIMARY ACTIONS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 max-w-3xl">
          <div className="w-11 h-11 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
            <Icon name="folder_open" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight font-headline">
              Quản lý danh mục dự án bảo hành đường bộ
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-body">
              Theo dõi tiến độ bảo hành, rủi ro suy thoái và phân bổ nhân sự PM quản lý dự án.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Supervisor Only Button (BR-01 / FR-04) */}
          {isSupervisor && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Icon name="add" size={18} />
              <span>Thêm mới dự án</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
