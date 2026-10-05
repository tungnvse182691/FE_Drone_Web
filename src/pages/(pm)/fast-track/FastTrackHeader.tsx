import React from 'react'
import { ChevronRight, Plus, Send } from 'lucide-react'

export interface FastTrackHeaderProps {
  basePath: string
  onNavigateDashboard: () => void
  onOpenPolicyModal: () => void
  onScrollToDispatch: () => void
}

export const FastTrackHeader: React.FC<FastTrackHeaderProps> = ({
  onNavigateDashboard,
  onOpenPolicyModal,
  onScrollToDispatch
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            onClick={onNavigateDashboard}
            className="hover:text-brand-gold cursor-pointer transition-colors"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-gold cursor-pointer transition-colors">Quản lý tuyến</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#C9A227] font-semibold">Chính sách & Giao việc đo đạc (WF-05)</span>
        </nav>

        <div className="flex items-center gap-2.5 pt-0.5">
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Cấu hình chính sách Fast Track & Điều phối hiện trường
          </h1>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
            QL1A • PK-04
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Thiết lập ngưỡng tự động xử lý nhanh và phân công 3 chế độ khảo sát, sửa chữa hiện trường.
        </p>
      </div>

      {/* Action Buttons Top Bar */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onOpenPolicyModal}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl shadow-xs hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 text-[#C9A227]" />
          <span>Tạo phiên bản chính sách mới</span>
        </button>
        <button
          onClick={onScrollToDispatch}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Tạo lệnh giao việc</span>
        </button>
      </div>
    </div>
  )
}
