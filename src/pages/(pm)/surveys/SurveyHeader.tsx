import React from 'react'
import { Icon } from '../../../components/ui/Icon'

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
    <div className="space-y-4 max-w-full">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#2D3748] mb-1 font-medium">
            <span
              className="hover:text-[#1A1D20] cursor-pointer"
              onClick={() => onNavigate(`${basePath}/dashboard`)}
            >
              Dashboard
            </span>
            <Icon name="chevron_right" size={16} className="text-slate-400" />
            <span className="text-[#1A1D20] font-semibold truncate">Khảo Sát Drone & Thẩm Định AI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D20] font-sansation tracking-tight truncate">
            Kế Hoạch & Yêu Cầu Bay Khảo Sát Drone
          </h1>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            Quản lý các đợt bay chụp ảnh trắc địa/RGB độ phân giải cao và thẩm định AI Bounding Box mặt đường (WF-09)
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            onClick={() => onNavigate(`${basePath}/surveys/srv-01/review`)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Icon name="auto_awesome" size={16} className="text-white" />
            <span>Mở Canvas Thẩm Định AI</span>
          </button>
          {!isSupervisor && (
            <button
              onClick={() => onNavigate('/pm/surveys/create')}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E2E5E9] text-[#1A1D20] text-xs font-semibold hover:bg-[#F8F9FA] transition-colors shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Icon name="add_circle" size={16} className="text-slate-500" />
              <span>Tạo Yêu Cầu Bay</span>
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
