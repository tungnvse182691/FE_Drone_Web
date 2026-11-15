import React from 'react'
import { TimeFilter } from './types'

interface AuditTrailFiltersProps {
  selectedActorRole: string
  onChangeActorRole: (role: string) => void
  selectedActionType: string
  onChangeActionType: (action: string) => void
  selectedEntityType: string
  onChangeEntityType: (entity: string) => void
  searchKeyword: string
  onChangeSearchKeyword: (keyword: string) => void
  timeFilter: TimeFilter
  onChangeTimeFilter: (filter: TimeFilter) => void
  onResetFilters: () => void
  filteredCount: number
  isSupervisor: boolean
}

export const AuditTrailFilters: React.FC<AuditTrailFiltersProps> = ({
  selectedActorRole,
  onChangeActorRole,
  selectedActionType,
  onChangeActionType,
  selectedEntityType,
  onChangeEntityType,
  searchKeyword,
  onChangeSearchKeyword,
  timeFilter,
  onChangeTimeFilter,
  onResetFilters,
  filteredCount,
  isSupervisor
}) => {
  return (
    <div className="bg-white p-4 rounded-[20px] border-[1.5px] border-[#E2E5E9] space-y-3 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Filter 1: Vai trò tác nhân (Thuần Việt 100%, không kèm mã code tiếng Anh) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Vai trò tác nhân
          </label>
          <select
            value={selectedActorRole}
            onChange={(e) => onChangeActorRole(e.target.value)}
            className="w-full h-9 px-3 rounded-[10px] bg-white border border-[#E2E5E9] text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer transition-colors"
          >
            <option value="all">Nguồn chưa cung cấp vai trò</option>
          </select>
        </div>

        {/* Filter 2: Loại hành động (Thuần Việt 100%) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Hành động nghiệp vụ
          </label>
          <select
            value={selectedActionType}
            onChange={(e) => onChangeActionType(e.target.value)}
            className="w-full h-9 px-3 rounded-[10px] bg-white border border-[#E2E5E9] text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer transition-colors"
          >
            <option value="all">Tất cả hành động</option>
            <option value="survey_task_created">Tạo nhiệm vụ khảo sát</option>
            <option value="survey_task_accept">Tiếp nhận nhiệm vụ khảo sát</option>
            <option value="survey_dataset_submitted">Nộp dữ liệu khảo sát</option>
          </select>
        </div>

        {/* Filter 3: Thực thể tác động (Thuần Việt 100%) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Thực thể tác động
          </label>
          <select
            value={selectedEntityType}
            onChange={(e) => onChangeEntityType(e.target.value)}
            className="w-full h-9 px-3 rounded-[10px] bg-white border border-[#E2E5E9] text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer transition-colors"
          >
            <option value="all">Tất cả nguồn</option>
            <option value="SurveyRequest">Nhiệm vụ khảo sát</option>
            <option value="SurveyDataVersion">Dữ liệu khảo sát</option>
          </select>
        </div>

        {/* Filter 4: Tìm kiếm từ khóa */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Tìm kiếm từ khóa
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onChangeSearchKeyword(e.target.value)}
              placeholder="Mã sự kiện, người thực hiện, lý trình..."
              className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-white border border-[#E2E5E9] text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] placeholder:text-slate-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Dòng điều khiển mốc thời gian & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#EDEFF2] text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-medium mr-1">Khoảng thời gian:</span>
          {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onChangeTimeFilter(tf)}
              className={`px-3 py-1 rounded-full text-xs transition cursor-pointer font-semibold ${
                timeFilter === tf
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tf === '24h' && '24 giờ qua'}
              {tf === '7d' && '7 ngày qua'}
              {tf === '30d' && '30 ngày qua'}
              {tf === 'all' && 'Toàn bộ thời gian'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs">
            Tìm thấy <strong>{filteredCount}</strong> sự kiện
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition cursor-pointer text-xs"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      </div>
    </div>
  )
}
