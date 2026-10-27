import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { type SurveyMissionItem as SurveyMission } from '../../../api/services'
import { SurveyCard } from './SurveyCard'

interface SurveyTableProps {
  missions: SurveyMission[]
  filteredMissions: SurveyMission[]
  activeTab: 'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'
  setActiveTab: (tab: 'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED') => void
  selectedRouteFilter: string
  setSelectedRouteFilter: (route: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  basePath: string
  onNavigate: (path: string) => void
  onOpenSimulator: (mission: SurveyMission) => void
}

export const SurveyTable: React.FC<SurveyTableProps> = ({
  missions,
  filteredMissions,
  activeTab,
  setActiveTab,
  selectedRouteFilter,
  setSelectedRouteFilter,
  searchQuery,
  setSearchQuery,
  basePath,
  onNavigate,
  onOpenSimulator
}) => {
  const pendingCount = missions.filter((m) => m.status === 'PENDING_AI_REVIEW').length
  const scheduledCount = missions.filter((m) => m.status === 'SCHEDULED').length
  const completedCount = missions.filter((m) => m.status === 'BASELINE_LOCKED').length

  // Danh mục Tuyến đường / Dự án trích xuất động theo BR-32 & DA05
  const routeOptions = React.useMemo(() => {
    const map = new Map<string, string>()
    missions.forEach((m) => {
      if (m.project_id && !map.has(m.project_id)) {
        map.set(m.project_id, m.project_name)
      }
    })
    return [
      { value: 'ALL', label: 'Toàn bộ tuyến đường' },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    ]
  }, [missions])

  return (
    <div className="space-y-4">
      {/* TOOLBAR: Filter Tabs & Route / Search Controls */}
      <div className="bg-white border border-[#E2E5E9] rounded-2xl p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* 1. Filter Tabs (Spec: bo tròn 999px, padding 10px 18px, viền #E2E5E9, tab active nền đen #1A1D20 chữ trắng) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-[18px] py-[10px] rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                activeTab === 'ALL'
                  ? 'bg-[#1A1D20] text-white border-[#1A1D20] shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
              }`}
            >
              Tất cả đợt bay ({missions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-[18px] py-[10px] rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                activeTab === 'PENDING'
                  ? 'bg-[#1A1D20] text-white border-[#1A1D20] shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
              }`}
            >
              <span>Chờ Thẩm Định AI</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'PENDING'
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pendingCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SCHEDULED')}
              className={`px-[18px] py-[10px] rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                activeTab === 'SCHEDULED'
                  ? 'bg-[#1A1D20] text-white border-[#1A1D20] shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
              }`}
            >
              Kế hoạch lên lịch ({scheduledCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-[18px] py-[10px] rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                activeTab === 'COMPLETED'
                  ? 'bg-[#1A1D20] text-white border-[#1A1D20] shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
              }`}
            >
              Đã khóa Baseline ({completedCount})
            </button>
          </div>

          {/* 2. Filter Controls: Route Select Dropdown & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Route Filter Dropdown (BR-32 & DA05) */}
            <div className="relative min-w-[210px] sm:max-w-[240px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Icon name="alt_route" size={15} />
              </div>
              <select
                value={selectedRouteFilter}
                onChange={(e) => setSelectedRouteFilter(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl text-[#1A1D20] font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition-all cursor-pointer truncate"
                title="Lọc danh mục đợt bay theo tuyến đường"
              >
                {routeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Icon name="expand_more" size={15} />
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" size={15} />
              </div>
              <input
                type="text"
                placeholder="Tìm mã #MS-, tên tuyến, lý trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl text-[#1A1D20] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARD GRID: Chuyển toàn bộ bảng dày đặc sang lưới thẻ viền màu trầm */}
      {filteredMissions.length === 0 ? (
        <div className="bg-white border border-[#E2E5E9] rounded-[20px] p-12 text-center flex flex-col items-center justify-center space-y-2">
          <Icon name="flight_takeoff" size={36} className="text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">Không tìm thấy đợt bay nào</h4>
          <p className="text-xs text-slate-400">
            Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm để xem kết quả khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMissions.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              basePath={basePath}
              onNavigate={onNavigate}
              onOpenSimulator={onOpenSimulator}
            />
          ))}
        </div>
      )}

      {/* Footer Info Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-2 px-1 gap-2">
        <div className="flex items-center gap-1.5">
          <Icon name="info" size={15} className="text-slate-400" />
          <span>
            Mỗi đợt bay sau khi nạp ảnh sẽ tự động chạy pipeline Road-YOLOv9. Sau khi thẩm định xong 100% hộp bao và độ phủ ≥ 95%, PM có thể ký số khóa Baseline đoạn đường.
          </span>
        </div>
        <span className="font-mono text-slate-500 shrink-0 font-medium">
          Hiển thị {filteredMissions.length} / {missions.length} nhiệm vụ
        </span>
      </div>
    </div>
  )
}
