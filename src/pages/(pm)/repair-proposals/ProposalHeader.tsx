import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'

export interface ProposalHeaderProps {
  basePath: string
  totalPackagesCount: number
  isPM: boolean
  onOpenCreateModal: () => void
}

export const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  basePath,
  totalPackagesCount,
  isPM,
  onOpenCreateModal,
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 font-body">
      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button onClick={() => navigate(`${basePath}/projects`)} className="hover:text-brand-gold cursor-pointer transition-colors">
            Dự án
          </button>
          <Icon name="chevron_right" size={14} className="text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">QL1A - Giai đoạn 2</span>
          <Icon name="chevron_right" size={14} className="text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">Sửa chữa</span>
          <Icon name="chevron_right" size={14} className="text-slate-400" />
          <span className="text-brand-gold font-semibold">Gói đề xuất kỹ thuật</span>
        </nav>

        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-headline">
            Danh mục gói đề xuất sửa chữa kỹ thuật
          </h1>
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E2E5E9] text-slate-800 font-mono text-xs font-bold shadow-2xs">
            PRJ-QL1A-02 • {totalPackagesCount} Gói công việc
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Tập hợp các điểm khiếm khuyết mặt đường thành gói thi công, xác định biện pháp kỹ thuật và trình nộp Giám sát trưởng phê duyệt.
        </p>
      </div>

      {/* Action Buttons Top Bar */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        {isPM && (
          <button
            onClick={onOpenCreateModal}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Icon name="add" size={17} />
            <span>Tạo gói đề xuất mới</span>
          </button>
        )}
      </div>
    </div>
  )
}
