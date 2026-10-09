import React from 'react'
import { ProjectConfig } from './types'

interface RiskHeaderProps {
  currentProject: ProjectConfig
  isRefreshing: boolean
  handleRefresh: () => void
  setIsTimeRangeModalOpen: (open: boolean) => void
  setIsExportModalOpen: (open: boolean) => void
  selectedProject: string
  setSelectedProject: (val: string) => void
  selectedTimeRange: string
  setSelectedTimeRange: (val: string) => void
  selectedTrack: string
  setSelectedTrack: (val: string) => void
  sortField: 'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status'
  setSortField: (val: any) => void
  sortAsc: boolean
  setSortAsc: (val: boolean) => void
  statusFilter: 'ALL' | 'COMPLETED' | 'PROCESSING' | 'FAILED'
  setStatusFilter: (val: any) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  resetFilters: () => void
  showToast: (msg: string) => void
  projectsConfig: Record<string, ProjectConfig>
}

export const RiskHeader: React.FC<RiskHeaderProps> = ({
  currentProject,
  isRefreshing,
  handleRefresh,
  setIsTimeRangeModalOpen,
  setIsExportModalOpen,
  selectedProject,
  setSelectedProject,
  selectedTimeRange,
  setSelectedTimeRange,
  selectedTrack,
  setSelectedTrack,
  sortField,
  setSortField,
  sortAsc,
  setSortAsc,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  resetFilters,
  showToast,
  projectsConfig
}) => {
  return (
    <div className="space-y-4">
      {/* 1. BREADCRUMB */}
      <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <a href="#/pm/dashboard" className="hover:text-slate-900 transition-colors">
          Trang chủ
        </a>
        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
        <span>Báo cáo & Hồ sơ</span>
        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
        <span className="text-[#8C6D1F] font-semibold">Chỉ số KPI & Hồ sơ giải trình</span>
      </nav>

      {/* 2. PAGE HEADER & PRIMARY ACTION CONTROLS */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-sansation text-2xl font-bold tracking-tight text-slate-900">
                Chỉ số vận hành & Hồ sơ giải trình ({currentProject.shortName})
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                {currentProject.chainage}
              </span>
            </div>

            {/* As-Of Metadata Bar */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
                <span className={`material-symbols-outlined text-[15px] text-[#8C6D1F] ${isRefreshing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>
                  Cập nhật lúc: <strong className="text-slate-800 font-semibold font-mono">21:45, 25/08/2026</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Tự động cập nhật: 60 giây</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsTimeRangeModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">calendar_month</span>
              <span>Tùy chỉnh thời gian</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">folder_zip</span>
              <span>Xuất báo cáo tổng hợp</span>
            </button>

            <button
              onClick={handleRefresh}
              type="button"
              title="Làm mới số liệu"
              className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin text-[#8C6D1F]' : ''}`}>
                refresh
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MULTI-DIMENSIONAL FILTER CONTROLS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Row 1: Primary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Project Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value)
                  showToast(`Đã chuyển bộ số liệu sang: ${projectsConfig[e.target.value]?.name || 'Dự án'}`)
                }}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-medium"
              >
                <option value="prj-ql1a-02">QL1A - Giai đoạn 2 (Km 1024 - Km 1045)</option>
                <option value="prj-ctbn-01">Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)</option>
                <option value="prj-lstl-05">Cao tốc La Sơn - Túy Loan (QL14B)</option>
                <option value="prj-ptdg-03">Tuyến tránh TP. Huế (QL1A-BP)</option>
                <option value="ALL">Toàn bộ danh mục (4 Dự án)</option>
              </select>
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Time Period Selector */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedTimeRange}
                onChange={(e) => {
                  setSelectedTimeRange(e.target.value)
                  showToast('Đã lọc lại số liệu theo mốc kỳ hạn mới')
                }}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-medium"
              >
                <option value="Q3_2026">Quý 3 / 2026 (01/07/2026 - 30/09/2026)</option>
                <option value="Q2_2026">Quý 2 / 2026 (01/04/2026 - 30/06/2026)</option>
                <option value="MONTH_08_2026">Tháng 08/2026 (Kỳ giải trình thanh tra)</option>
                <option value="YTD">Lũy kế 12 tháng gần nhất (Year-To-Date)</option>
              </select>
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Workflow Track Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedTrack}
                onChange={(e) => {
                  setSelectedTrack(e.target.value)
                  const trackLabel = 
                    e.target.value === 'FAST_TRACK' 
                      ? 'Sửa nhanh Fast Track' 
                      : e.target.value === 'APPROVAL_TRACK' 
                      ? 'Thẩm duyệt thông thường' 
                      : e.target.value === 'EMERGENCY'
                      ? 'Xử lý khẩn cấp (24/7)'
                      : 'Tất cả quy trình'
                  showToast(`Đã lọc danh sách theo: ${trackLabel}`)
                }}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-medium"
              >
                <option value="ALL">Tất cả quy trình (Fast Track, Thẩm duyệt, Khẩn cấp)</option>
                <option value="FAST_TRACK">Sửa nhanh Fast Track (&lt; 24h)</option>
                <option value="APPROVAL_TRACK">Thẩm duyệt thông thường (Hồ sơ kỹ thuật)</option>
                <option value="EMERGENCY">Xử lý khẩn cấp (24/7)</option>
              </select>
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-400">restart_alt</span>
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Row 2: Sort, Status Filter & Search Controls */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#8C6D1F]">swap_vert</span>
                <span>Sắp xếp:</span>
              </span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="as_of_timestamp">Thời gian chốt số liệu</option>
                <option value="code">Mã hồ sơ</option>
                <option value="scope_display">Lý trình đoạn tuyến</option>
                <option value="file_size_mb">Dung lượng tệp (MB)</option>
                <option value="status">Trạng thái xử lý</option>
              </select>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                type="button"
                className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-slate-700 transition cursor-pointer"
                title={sortAsc ? 'Sắp xếp: Tăng dần (Bấm để đổi Giảm dần)' : 'Sắp xếp: Giảm dần (Bấm để đổi Tăng dần)'}
              >
                <span className="font-semibold text-[11px]">{sortAsc ? '▲ Tăng dần' : '▼ Giảm dần'}</span>
              </button>
            </div>

            {/* Trạng thái filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="material-symbols-outlined text-[15px] text-slate-400">filter_list</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="FAILED">Thất bại</option>
              </select>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã hồ sơ, đoạn tuyến, biên bản..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:bg-white text-xs placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
