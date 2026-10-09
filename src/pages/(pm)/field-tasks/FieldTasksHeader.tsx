import React, { useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { SyncConflictItem, FieldTask } from '../../../types/domain'

export interface FieldTasksHeaderProps {
  isSupervisor: boolean
  isPM: boolean
  activeTab: 'CONFLICTS' | 'MEASUREMENTS'
  setActiveTab: (tab: 'CONFLICTS' | 'MEASUREMENTS') => void
  conflicts: SyncConflictItem[]
  fieldTasks: FieldTask[]
  stats: {
    total: number
    pending: number
    reassign: number
    policyMismatch: number
    rescuePending: number
  }
  handleResetData: () => void
}

export const FieldTasksHeader: React.FC<FieldTasksHeaderProps> = ({
  isSupervisor,
  isPM: _isPM,
  activeTab,
  setActiveTab,
  conflicts: _conflicts,
  fieldTasks,
  stats,
  handleResetData
}) => {
  // Thống kê nhanh các trạng thái đo đạc
  const taskStats = useMemo(() => {
    const assigned = fieldTasks.filter((t) => t.status === 'ASSIGNED').length
    const inProgress = fieldTasks.filter((t) => t.status === 'IN_PROGRESS').length
    const submitted = fieldTasks.filter((t) => t.status === 'SUBMITTED').length
    const verified = fieldTasks.filter((t) => t.status === 'VERIFIED').length
    return { assigned, inProgress, submitted, verified }
  }, [fieldTasks])

  return (
    <div className="space-y-4">
      {/* 1. BREADCRUMB */}
      <nav aria-label="Đường dẫn trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <a href="#/pm/dashboard" className="hover:text-[#C9A227] transition-colors flex items-center gap-1">
          <Icon name="home" size={14} />
          <span>Trang chủ</span>
        </a>
        <Icon name="chevron_right" size={14} className="text-slate-400" />
        <span className="font-semibold text-slate-800">Nhiệm vụ & Đo đạc hiện trường</span>
      </nav>

      {/* 2. HEADER SECTION (MINIMALIST) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Nhiệm Vụ & Đo Đạc Hiện Trường
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dự án: <strong className="text-slate-700">QL1A - Giai đoạn 2 (Km 1024 - Km 1045)</strong> • Tiếp nhận kết quả đo thực địa & phân giải xung đột đồng bộ ngoại tuyến.
          </p>
        </div>

        {/* Action & Role Pill */}
        <div className="flex items-center gap-2.5">
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium ${
              isSupervisor
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Icon name="verified_user" size={15} className={isSupervisor ? 'text-purple-600' : 'text-amber-600'} />
            <span>
              {isSupervisor ? 'Giám sát (Duyệt cứu hộ)' : 'Chỉ huy trưởng (PM)'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Khôi phục dữ liệu mẫu ban đầu để kiểm thử"
          >
            <Icon name="refresh" size={15} className="text-[#C9A227]" />
            <span>Khôi phục mẫu</span>
          </button>
        </div>
      </div>

      {/* 3. TABS SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('MEASUREMENTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-medium transition-all border-b-2 cursor-pointer ${
            activeTab === 'MEASUREMENTS'
              ? 'border-[#C9A227] text-[#8C6D1F] bg-[#FBF6E9]/40 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icon name="straighten" size={16} />
          <span>Nhiệm vụ đo đạc ({fieldTasks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CONFLICTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-medium transition-all border-b-2 cursor-pointer ${
            activeTab === 'CONFLICTS'
              ? 'border-[#C9A227] text-[#8C6D1F] bg-[#FBF6E9]/40 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icon name="sync_problem" size={16} />
          <span>Xử lý xung đột ngoại tuyến ({stats.pending})</span>
        </button>
      </div>

      {/* 4. KPI CARDS CHO TAB ĐO ĐẠC */}
      {activeTab === 'MEASUREMENTS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Cần thực hiện
              </span>
              <Icon name="schedule" size={16} className="text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-800">{taskStats.assigned}</span>
              <span className="text-xs text-slate-500">phiếu</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Đang đo đạc
              </span>
              <Icon name="pending" size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-blue-600">{taskStats.inProgress}</span>
              <span className="text-xs text-slate-500">hiện trường</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Đã có số đo
              </span>
              <Icon name="format_list_numbered" size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-amber-600">{taskStats.submitted}</span>
              <span className="text-xs text-slate-500">chờ duyệt</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Đã xác minh
              </span>
              <Icon name="check_circle" size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-emerald-600">{taskStats.verified}</span>
              <span className="text-xs text-slate-500">hoàn tất</span>
            </div>
          </Card>
        </div>
      )}

      {/* 5. KPI CARDS CHO TAB XUNG ĐỘT (GỌN GÀNG, MINIMALISM) */}
      {activeTab === 'CONFLICTS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Tổng ca xung đột
              </span>
              <Icon name="layers" size={16} className="text-[#C9A227]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900">{stats.total}</span>
              <span className="text-xs text-amber-600 font-medium">({stats.pending} chờ xử lý)</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Đổi đội ngoại tuyến
              </span>
              <Icon name="call_split" size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900">{stats.reassign}</span>
              <span className="text-xs text-slate-500">hồ sơ</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Lệch chính sách
              </span>
              <Icon name="warning" size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900">{stats.policyMismatch}</span>
              <span className="text-xs text-slate-500">hồ sơ</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Cứu hộ thiết bị
              </span>
              <Icon name="phonelink_erase" size={16} className="text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-purple-700">{stats.rescuePending}</span>
              <span className="text-xs text-purple-600 font-medium">chờ Supervisor ký</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
