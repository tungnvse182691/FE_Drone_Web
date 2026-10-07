import React from 'react'
import {
  FolderKanban,
  ChevronRight,
  Download,
  PlusCircle
} from 'lucide-react'

interface ProjectListHeaderProps {
  isSupervisor: boolean
  onNavigateHome: () => void
  onExportGis: () => void
  onOpenCreateModal: () => void
}

export const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({
  isSupervisor,
  onNavigateHome,
  onExportGis,
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
            <FolderKanban className="w-3.5 h-3.5" />
            Trang chủ
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Danh mục dự án hạ tầng</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-brand-goldMuted bg-brand-gold/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            INFRA-HUB-V2.4
          </span>
        </div>
      </div>

      {/* PAGE HEADER & PRIMARY ACTIONS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 max-w-3xl">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0 shadow-2xs">
            <FolderKanban className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight font-headline">
              Quản lý danh mục dự án bảo hành đường bộ
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Theo dõi tiến độ bảo hành, mức độ rủi ro hư hỏng mặt đường và phân bổ nguồn lực kỹ sư quản lý dự án (PM) trên toàn mạng lưới cao tốc &amp; quốc lộ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onExportGis}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất dữ liệu GIS</span>
          </button>

          {/* Supervisor Only Button */}
          {isSupervisor && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2.5 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.4]" />
              <span>Khởi tạo dự án mới</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
