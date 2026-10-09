import React from 'react'
import { RoleCode } from '../../../types/enums'
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
    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Filter 1: Vai trò tác nhân (Thuần Việt 100%, không kèm mã code tiếng Anh) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Vai trò tác nhân
          </label>
          <select
            value={selectedActorRole}
            onChange={(e) => onChangeActorRole(e.target.value)}
            className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value={RoleCode.SUPERVISOR}>Kỹ sư giám sát</option>
            <option value={RoleCode.PROJECT_MANAGER}>Chỉ huy trưởng</option>
            <option value={RoleCode.REPAIR_CREW}>Đội thi công hiện trường</option>
            {isSupervisor && (
              <option value="SYSTEM">Hệ thống tự động</option>
            )}
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
            className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
          >
            <option value="all">Tất cả hành động</option>
            {isSupervisor && (
              <>
                <option value="APPROVE_BATCH">Phê duyệt đợt sửa chữa</option>
                <option value="REJECT_BATCH">Yêu cầu sửa lại hồ sơ</option>
                <option value="ACCEPT_WORK_ORDER">Nghiệm thu hoàn công</option>
                <option value="LOCK_LEGAL_HOLD">Kích hoạt khóa lưu trữ</option>
              </>
            )}
            <option value="SUBMIT_BATCH">Trình duyệt hồ sơ đợt sửa</option>
            <option value="ASSIGN_CREW">Phân công đội thi công</option>
            <option value="CLOSE_FAST_TRACK">Đóng hồ sơ xử lý nhanh</option>
            <option value="PUBLISH_SEGMENTS">Công bố phân đoạn tim tuyến</option>
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
            className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
          >
            <option value="all">Tất cả thực thể</option>
            <option value="REPAIR_BATCH">Đợt sửa chữa</option>
            <option value="DEFECT">Hư hỏng mặt đường</option>
            <option value="WORK_ORDER">Phiếu giao việc</option>
            <option value="ROAD_SEGMENT">Phân đoạn tim tuyến</option>
            {isSupervisor && (
              <option value="LEGAL_HOLD">Hồ sơ khóa lưu trữ</option>
            )}
          </select>
        </div>

        {/* Filter 4: Tìm kiếm từ khóa */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Tìm kiếm từ khóa
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onChangeSearchKeyword(e.target.value)}
              placeholder="Mã sự kiện, người thực hiện, lý trình..."
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Dòng điều khiển mốc thời gian & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-medium mr-1">Khoảng thời gian:</span>
          {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onChangeTimeFilter(tf)}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                timeFilter === tf
                  ? 'bg-slate-900 text-white font-semibold'
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
