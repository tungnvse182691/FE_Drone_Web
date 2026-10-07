import React from 'react'
import {
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Calendar,
  Archive,
  RotateCcw,
  CheckCircle2,
  ArrowUpDown,
  Search,
  Filter
} from 'lucide-react'
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
    <>
      {/* 1. BREADCRUMB & METADATA OVERLINE */}
      <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <a href="#/sup/dashboard" className="hover:text-slate-800 transition-colors flex items-center gap-1">
          <span>Trang chủ</span>
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600">Báo cáo & Giám sát</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-brand-gold font-semibold">Chỉ số vận hành & Hồ sơ giải trình</span>
      </nav>

      {/* 2. PAGE HEADER & ACTION CONTROLS */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-sansation text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                Chỉ số bảo hành & Kết xuất hồ sơ bằng chứng ({currentProject.shortName})
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                {currentProject.chainage}
              </span>
            </div>

            {/* As-Of Metadata Bar */}
            <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
                <RefreshCw className={`w-3.5 h-3.5 text-brand-gold ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>
                  Dữ liệu chốt lúc (As-Of): <strong className="text-slate-800 font-semibold font-mono">21:45, 25/08/2026</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-brand-gold font-medium">Tự động cập nhật mỗi 60s</span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-slate-100/70 px-3 py-1 rounded-full text-[11px] text-slate-600 border border-slate-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
                <span>{currentProject.serverNode}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={() => setIsTimeRangeModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Tùy chỉnh khung thời gian</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs lg:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Tạo yêu cầu xuất hồ sơ (Export ZIP/PDF)</span>
            </button>

            <button
              onClick={handleRefresh}
              type="button"
              title="Làm mới dữ liệu"
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-gold' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MULTI-DIMENSIONAL FILTER ROW & ADVANCED SORT CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        {/* Row 1: Primary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
            {/* Project Selector */}
            <div className="relative min-w-[240px]">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value)
                  showToast(`Đã chuyển bộ số liệu sang: ${projectsConfig[e.target.value]?.name || 'Dự án'}`)
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-semibold"
              >
                <option value="prj-ql1a-02">QL1A - Giai đoạn 2 (Km 1024 - Km 1045)</option>
                <option value="prj-ctbn-01">Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt)</option>
                <option value="prj-lstl-05">Cao tốc La Sơn - Túy Loan (QL14B)</option>
                <option value="prj-ptdg-03">Tuyến tránh TP. Huế (QL1A-BP)</option>
                <option value="ALL">Toàn bộ danh mục (4 Dự án)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Time Period Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedTimeRange}
                onChange={(e) => {
                  setSelectedTimeRange(e.target.value)
                  showToast('Đã lọc lại số liệu theo mốc kỳ hạn mới')
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-medium"
              >
                <option value="Q3_2026">Quý 3 / 2026 (01/07/2026 - 30/09/2026)</option>
                <option value="Q2_2026">Quý 2 / 2026 (01/04/2026 - 30/06/2026)</option>
                <option value="MONTH_08_2026">Tháng 08/2026 (Kỳ giải trình thanh tra)</option>
                <option value="YTD">Lũy kế 12 tháng gần nhất (Year-To-Date)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Workflow Track Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedTrack}
                onChange={(e) => {
                  setSelectedTrack(e.target.value)
                  const trackLabel = 
                    e.target.value === 'FAST_TRACK' 
                      ? 'Nhánh Fast Track' 
                      : e.target.value === 'APPROVAL_TRACK' 
                      ? 'Nhánh Ban Duy tu & TVGS thẩm duyệt' 
                      : e.target.value === 'EMERGENCY'
                      ? 'Nhánh Xử lý khẩn cấp (Emergency 24/7)'
                      : 'Tất cả nhánh'
                  showToast(`Đã lọc danh sách theo: ${trackLabel}`)
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs cursor-pointer appearance-none font-medium"
              >
                <option value="ALL">Tất cả nhánh (Fast Track, Approval Track, Emergency)</option>
                <option value="FAST_TRACK">Chỉ nhánh Fast Track (Sửa nhanh &lt; 24h)</option>
                <option value="APPROVAL_TRACK">Chỉ nhánh Ban Duy tu &amp; TVGS thẩm duyệt (Hồ sơ kỹ thuật)</option>
                <option value="EMERGENCY">Chỉ nhánh Xử lý khẩn cấp (Emergency 24/7)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer border border-transparent hover:border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Right Live Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
              <span>Thời gian thực (Live Sync)</span>
            </span>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kết nối: Hoạt động bình thường (200 OK)</span>
            </div>
          </div>
        </div>

        {/* Row 2: Sort, Status Filter & Search Controls */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-gold" />
                <span>Sắp xếp:</span>
              </span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="as_of_timestamp">Mốc thời gian As-Of</option>
                <option value="code">Mã gói hồ sơ (#EXP)</option>
                <option value="scope_display">Phạm vi / Lý trình</option>
                <option value="file_size_mb">Dung lượng tệp (MB)</option>
                <option value="status">Trạng thái xử lý</option>
              </select>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                type="button"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 transition cursor-pointer"
                title={sortAsc ? 'Đang sắp xếp: Tăng dần (Bấm đổi Giảm dần)' : 'Đang sắp xếp: Giảm dần (Bấm đổi Tăng dần)'}
              >
                <span className="font-bold text-[11px]">{sortAsc ? '▲ Tăng' : '▼ Giảm'}</span>
              </button>
            </div>

            {/* Trạng thái filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">Đã kết xuất hoàn tất (COMPLETED)</option>
                <option value="PROCESSING">Đang xử lý nén (PROCESSING)</option>
                <option value="FAILED">Thất bại / Lỗi (FAILED)</option>
              </select>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã gói, tuyến, số biên bản..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </>
  )
}
