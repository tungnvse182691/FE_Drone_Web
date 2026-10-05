import React from 'react'
import { ChevronRight, Sparkles, PlusCircle, ArrowRight } from 'lucide-react'

interface SurveyHeaderProps {
  basePath: string
  isSupervisor: boolean
  onNavigate: (path: string) => void
}

export const SurveyHeader: React.FC<SurveyHeaderProps> = ({
  basePath,
  isSupervisor,
  onNavigate
}) => {
  return (
    <>
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <span
              className="hover:text-brand-dark cursor-pointer"
              onClick={() => onNavigate(`${basePath}/dashboard`)}
            >
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-brand-dark font-semibold">Khảo Sát Drone &amp; Thẩm Định AI</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Kế Hoạch &amp; Yêu Cầu Bay Khảo Sát Drone
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các đợt bay chụp ảnh hồng ngoại/RGB độ phân giải cao và thẩm định AI Bounding Box mặt đường (WF-09)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate(`${basePath}/surveys/srv-01/review`)}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mở Canvas Thẩm Định AI (#MS-2026-0924)</span>
          </button>
          {!isSupervisor && (
            <button
              onClick={() => onNavigate('/pm/surveys/create')}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-500" />
              <span>Tạo Yêu Cầu Bay Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Action Banner for Mission #MS-2026-0924 */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-[#C9A227]/40 rounded-xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#C9A227] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-brand-dark">
                Đợt bay mới nhất: #MS-2026-0924 (QL1A Km 1024+000 – Km 1030+000)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                8 Khiếm Khuyết AI Chờ Duyệt
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-[#8F7212] border border-amber-200">
                Độ phủ 87% (Cần Bay Bổ Sung)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Mô hình Road-YOLOv9 đã nhận diện xong 1,920 khung hình. Project Manager cần vào Canvas để thẩm định hộp bao (Bounding box), xác nhận vết nứt/ổ gà và duyệt điều kiện khóa Baseline.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate(`${basePath}/surveys/srv-01/review`)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <span>Mở Canvas Thẩm Định AI (WF-09)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  )
}
