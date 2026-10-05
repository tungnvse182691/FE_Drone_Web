import React from 'react'
import { Card } from '../../../components/ui/Card'
import { Search } from 'lucide-react'
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
    <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter 1: Actor Role */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Vai trò tác nhân (Actor Role)</label>
          <select
            value={selectedActorRole}
            onChange={(e) => onChangeActorRole(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value={RoleCode.SUPERVISOR}>Giám sát viên (SUPERVISOR)</option>
            <option value={RoleCode.PROJECT_MANAGER}>Chỉ huy trưởng (PROJECT_MANAGER)</option>
            <option value={RoleCode.REPAIR_CREW}>Đội thi công hiện trường (REPAIR_CREW)</option>
            {isSupervisor && (
              <option value="SYSTEM">Hệ thống &amp; Thanh tra (SYSTEM)</option>
            )}
          </select>
        </div>

        {/* Filter 2: Action Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Loại hành động nghiệp vụ</label>
          <select
            value={selectedActionType}
            onChange={(e) => onChangeActionType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
          >
            <option value="all">Tất cả hành động</option>
            {isSupervisor && (
              <>
                <option value="APPROVE_BATCH">Phê duyệt đợt sửa chữa (APPROVE_BATCH)</option>
                <option value="REJECT_BATCH">Yêu cầu sửa lại đợt sửa (REJECT_BATCH)</option>
                <option value="ACCEPT_WORK_ORDER">Nghiệm thu hoàn công (ACCEPT_WORK_ORDER)</option>
                <option value="LOCK_LEGAL_HOLD">Kích hoạt giữ hồ sơ thanh tra (LOCK_LEGAL_HOLD)</option>
              </>
            )}
            <option value="SUBMIT_BATCH">Trình duyệt đợt sửa chữa (SUBMIT_BATCH)</option>
            <option value="ASSIGN_CREW">Phân công đội thi công (ASSIGN_CREW)</option>
            <option value="CLOSE_FAST_TRACK">Đóng hồ sơ Fast-Track (CLOSE_FAST_TRACK)</option>
            <option value="PUBLISH_SEGMENTS">Công bố bộ Segment tuyến (PUBLISH_SEGMENTS)</option>
            <option value="SUBMIT_WORK_ORDER">Báo cáo hoàn thành thi công (SUBMIT_WORK_ORDER)</option>
          </select>
        </div>

        {/* Filter 3: Entity Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Thực thể tác động (Target Entity)</label>
          <select
            value={selectedEntityType}
            onChange={(e) => onChangeEntityType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
          >
            <option value="all">Tất cả thực thể</option>
            <option value="REPAIR_BATCH">Đợt sửa chữa (RepairBatch)</option>
            <option value="DEFECT">Hư hỏng / Khiếm khuyết (Defect)</option>
            <option value="WORK_ORDER">Phiếu giao việc (WorkOrder)</option>
            <option value="ROAD_SEGMENT">Phân đoạn tim tuyến (RoadSegment)</option>
            {isSupervisor && (
              <option value="LEGAL_HOLD">Hồ sơ thanh tra (Legal Hold)</option>
            )}
          </select>
        </div>

        {/* Filter 4: Keyword Search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Tìm kiếm Mã sự kiện / Lý trình / Lý do</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onChangeSearchKeyword(e.target.value)}
              placeholder="Nhập EV-..., Km 1032, nứt lún..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>
      </div>

      {/* Quick chips & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">Khoảng thời gian:</span>
          <button
            type="button"
            onClick={() => onChangeTimeFilter('24h')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              timeFilter === '24h'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            24 giờ qua
          </button>
          <button
            type="button"
            onClick={() => onChangeTimeFilter('7d')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              timeFilter === '7d'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            onClick={() => onChangeTimeFilter('30d')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              timeFilter === '30d'
                ? 'bg-brand-gold text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tháng này (T8/2026)
          </button>
          <button
            type="button"
            onClick={() => onChangeTimeFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              timeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Toàn bộ lịch sử
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Đặt lại bộ lọc
          </button>
          <div className="text-xs text-slate-500 font-medium font-mono">
            Hiển thị {filteredCount} sự kiện hợp lệ
          </div>
        </div>
      </div>
    </Card>
  )
}
