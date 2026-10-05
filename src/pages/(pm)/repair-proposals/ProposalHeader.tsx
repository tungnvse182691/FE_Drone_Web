import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  SlidersHorizontal,
  FileText,
  Plus
} from 'lucide-react'

export interface ProposalHeaderProps {
  basePath: string
  totalPackagesCount: number
  isPM: boolean
  onOpenPDFPreviewModal: () => void
  onOpenCreateModal: () => void
}

export const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  basePath,
  totalPackagesCount,
  isPM,
  onOpenPDFPreviewModal,
  onOpenCreateModal,
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button onClick={() => navigate(`${basePath}/projects`)} className="hover:text-brand-gold cursor-pointer transition-colors">
            Dự án
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">QL1A - Giai đoạn 2</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">Sửa chữa</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#C9A227] font-semibold">Gói đề xuất kỹ thuật</span>
        </nav>

        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Danh mục gói đề xuất sửa chữa kỹ thuật
          </h1>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-brand-dark font-mono text-xs font-bold shadow-2xs">
            PRJ-QL1A-02 • {totalPackagesCount} Gói công việc
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Tập hợp các điểm khiếm khuyết mặt đường thành gói thi công, xác định biện pháp kỹ thuật và trình nộp Giám sát trưởng phê duyệt.
        </p>
      </div>

      {/* Action Buttons Top Bar */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">

        <button
          onClick={onOpenPDFPreviewModal}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Xuất kế hoạch kỹ thuật (PDF)</span>
        </button>

        {isPM && (
          <button
            onClick={onOpenCreateModal}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo gói đề xuất mới</span>
          </button>
        )}
      </div>
    </div>
  )
}
