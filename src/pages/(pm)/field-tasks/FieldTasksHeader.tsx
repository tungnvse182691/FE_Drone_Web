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
        <a href={isSupervisor ? '#/sup/dashboard' : '#/pm/dashboard'} className="hover:text-[#C9A227] transition-colors flex items-center gap-1">
          <Icon name="home" size={14} />
          <span>Trang chủ</span>
        </a>
        <Icon name="chevron_right" size={14} className="text-slate-400" />
        <span className="font-semibold text-slate-800">
          {isSupervisor ? 'Nghiệm thu hiện trường' : 'Nhiệm vụ & Đo đạc hiện trường'}
        </span>
      </nav>

      {/* 2. HEADER SECTION (MINIMALIST) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-[#E2E5E9] shadow-2xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {isSupervisor ? 'Nghiệm Thu Hiện Trường' : 'Nhiệm Vụ & Đo Đạc Hiện Trường'}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* KPI 1: Cần thực hiện */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #CBD5E1',
              background: 'linear-gradient(180deg, #F8FAFC 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#64748B'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(100, 116, 139, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #64748B, #94A3B8)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#64748B', boxShadow: '0 0 0 4px rgba(100, 116, 139, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Cần thực hiện
                  </span>
                </div>
                <Icon name="schedule" size={16} className="text-slate-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900">{taskStats.assigned}</span>
                <span className="text-xs text-slate-500 font-medium">phiếu</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Đang đo đạc */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #B8C5D9',
              background: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1E40AF'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(30, 64, 175, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#B8C5D9'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #1E40AF, #3B82F6)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#1E40AF', boxShadow: '0 0 0 4px rgba(30, 64, 175, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Đang đo đạc
                  </span>
                </div>
                <Icon name="pending" size={16} className="text-[#1E40AF]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#1E40AF]">{taskStats.inProgress}</span>
                <span className="text-xs text-slate-500 font-medium">hiện trường</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Đã có số đo */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #E3D3AC',
              background: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#B45309'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(180, 83, 9, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E3D3AC'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #B45309, #F59E0B)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#B45309', boxShadow: '0 0 0 4px rgba(180, 83, 9, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Đã có số đo
                  </span>
                </div>
                <Icon name="format_list_numbered" size={16} className="text-[#B45309]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#B45309]">{taskStats.submitted}</span>
                <span className="text-xs text-slate-500 font-medium">chờ duyệt</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Đã xác minh */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #A7C4B8',
              background: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#047857'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(4, 120, 87, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#A7C4B8'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #047857, #10B981)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#047857', boxShadow: '0 0 0 4px rgba(4, 120, 87, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Đã xác minh
                  </span>
                </div>
                <Icon name="check_circle" size={16} className="text-[#047857]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#047857]">{taskStats.verified}</span>
                <span className="text-xs text-slate-500 font-medium">hoàn tất</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. KPI CARDS CHO TAB XUNG ĐỘT */}
      {activeTab === 'CONFLICTS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* KPI 1: Tổng ca xung đột */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #E5D8B4',
              background: 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#C9A227'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(201, 162, 39, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5D8B4'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #C9A227, #D97706)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#C9A227', boxShadow: '0 0 0 4px rgba(201, 162, 39, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Tổng ca xung đột
                  </span>
                </div>
                <Icon name="layers" size={16} className="text-[#C9A227]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold font-mono text-slate-900">{stats.total}</span>
                <span className="text-xs text-amber-700 font-semibold font-mono">({stats.pending} chờ xử lý)</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Đổi đội ngoại tuyến */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #B8C5D9',
              background: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1E40AF'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(30, 64, 175, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#B8C5D9'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #1E40AF, #3B82F6)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#1E40AF', boxShadow: '0 0 0 4px rgba(30, 64, 175, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Đổi đội ngoại tuyến
                  </span>
                </div>
                <Icon name="call_split" size={16} className="text-[#1E40AF]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900">{stats.reassign}</span>
                <span className="text-xs text-slate-500 font-medium">hồ sơ</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Lệch chính sách */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #E3D3AC',
              background: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#B45309'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(180, 83, 9, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E3D3AC'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #B45309, #F59E0B)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#B45309', boxShadow: '0 0 0 4px rgba(180, 83, 9, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Lệch chính sách
                  </span>
                </div>
                <Icon name="warning" size={16} className="text-[#B45309]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900">{stats.policyMismatch}</span>
                <span className="text-xs text-slate-500 font-medium">hồ sơ</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Cứu hộ thiết bị */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #E6A8A8',
              background: 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#B91C1C'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(185, 28, 28, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E6A8A8'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #B91C1C, #EF4444)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#B91C1C', boxShadow: '0 0 0 4px rgba(185, 28, 28, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Cứu hộ thiết bị
                  </span>
                </div>
                <Icon name="phonelink_erase" size={16} className="text-[#B91C1C]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold font-mono text-[#B91C1C]">{stats.rescuePending}</span>
                <span className="text-xs text-rose-700 font-medium">chờ Giám sát ký</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
