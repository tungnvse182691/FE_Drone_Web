import React from 'react'
import {
  Clock,
  FolderGit2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Shield,
  RefreshCw,
  FileDown,
  Calendar,
  Globe2,
  FolderKanban,
  RotateCcw
} from 'lucide-react'
import { REGION_PROJECTS, MOCK_RISK_ITEMS } from './mockData'
import { useNavigate } from 'react-router-dom'

export interface DashboardHeaderProps {
  selectedMonth: string
  showToast: (msg: string) => void
  onResetFilters: () => void
  setSelectedMonth: (m: string) => void
  selectedRegion: string
  handleRegionChange: (r: string) => void
  selectedProject: string
  setSelectedProject: (p: string) => void
  isRefreshing: boolean
  handleRefresh: () => void
  onOpenExportModal: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedMonth,
  showToast,
  onResetFilters,
  setSelectedMonth,
  selectedRegion,
  handleRegionChange,
  selectedProject,
  setSelectedProject,
  isRefreshing,
  handleRefresh,
  onOpenExportModal
}) => {
  const navigate = useNavigate()
  return (
    <>
      {/* TOP HEADER: BREADCRUMB, TITLE & ACTIONS                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <span>Trang chủ</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-brand-gold">Dashboard</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-sansation">
              Dashboard danh mục bảo hành
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Theo dõi dự án, tình trạng đường, rủi ro bảo hành và công việc cần ưu tiên.
            </p>
          </div>

          {/* Timestamp & Top Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start lg:self-center">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Dữ liệu cập nhật lúc 21:45, ngày 25/08/2026</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                type="button"
                className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-gold' : ''}`} />
              </button>

              <button
                onClick={onOpenExportModal}
                type="button"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-brand-gold" />
                <span>Xuất báo cáo (RPT-01)</span>
              </button>

              <button
                onClick={() => navigate('/sup/projects')}
                type="button"
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Khởi tạo dự án</span>
              </button>

              <button
                onClick={() => navigate('/sup/proposals/PKG-2026-08')}
                type="button"
                className="px-4 py-2 text-xs font-bold text-white rounded-xl transition shadow-sm flex items-center gap-1.5 bg-brand-gold hover:bg-[#B38E1F] cursor-pointer"
                style={{ boxShadow: 'rgba(201, 162, 39, 0.28) 0px 2px 8px' }}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Thẩm duyệt đợt sửa (WF-07)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/90 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Month */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
              >
                <option value="2026-08">Tháng 8, 2026</option>
                <option value="2026-07">Tháng 7, 2026</option>
                <option value="2026-06">Tháng 6, 2026</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Region */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
              >
                <option value="ALL">Khu vực: Tất cả</option>
                <option value="CENTRAL">Miền Trung (Huế - Đà Nẵng)</option>
                <option value="NORTH">Miền Bắc (Nghệ An)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Project (Tự động lọc theo Khu vực đã chọn) */}
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
              >
                <option value="ALL">
                  {selectedRegion === 'ALL'
                    ? 'Dự án: Tất cả'
                    : selectedRegion === 'CENTRAL'
                    ? 'Tất cả dự án Miền Trung'
                    : 'Tất cả dự án Miền Bắc'}
                </option>
                {(selectedRegion === 'ALL'
                  ? [...REGION_PROJECTS.CENTRAL, ...REGION_PROJECTS.NORTH]
                  : REGION_PROJECTS[selectedRegion] || []
                ).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onResetFilters()
              }}
              type="button"
              className="font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Đặt lại
            </button>
            <button
              onClick={() => {
                const regText = selectedRegion === 'ALL' ? 'Toàn quốc' : selectedRegion === 'NORTH' ? 'Miền Bắc' : 'Miền Trung'
                const prjTarget = MOCK_RISK_ITEMS.find((it: any) => it.project_id === selectedProject)
                const prjText = prjTarget ? prjTarget.project_name : 'Tất cả dự án'
                showToast(`Đã áp dụng bộ lọc: ${regText} • ${prjText} (${selectedMonth})`)
              }}
              type="button"
              className="px-4 py-1.5 font-bold text-white rounded-xl transition shadow-2xs bg-brand-gold hover:bg-[#B38E1F] cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
