import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { type SurveyMissionItem as SurveyMission } from '../../../api/services'

interface SurveyTableProps {
  missions: SurveyMission[]
  filteredMissions: SurveyMission[]
  activeTab: 'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'
  setActiveTab: (tab: 'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED') => void
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
  searchQuery,
  setSearchQuery,
  basePath,
  onNavigate,
  onOpenSimulator
}) => {
  const pendingCount = missions.filter((m) => m.status === 'PENDING_AI_REVIEW').length
  const scheduledCount = missions.filter((m) => m.status === 'SCHEDULED').length
  const completedCount = missions.filter((m) => m.status === 'BASELINE_LOCKED').length

  return (
    <div className="bg-white border border-[#E2E5E9] rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-[#1A1D20] font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-[#1A1D20]'
            }`}
          >
            Tất cả đợt bay ({missions.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-[#FEF3E2] text-[#F59E0B] font-bold border border-amber-200 shadow-2xs'
                : 'text-slate-600 hover:text-[#1A1D20]'
            }`}
          >
            <span>Chờ Thẩm Định AI ({pendingCount})</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULED')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'SCHEDULED'
                ? 'bg-white text-[#1A1D20] font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-[#1A1D20]'
            }`}
          >
            Kế hoạch lên lịch ({scheduledCount})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-[#1A1D20] font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-[#1A1D20]'
            }`}
          >
            Đã khóa Baseline ({completedCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" size={16} />
          </div>
          <input
            type="text"
            placeholder="Tìm mã #MS-, lý trình, phi công..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-[#1A1D20] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-[#E2E5E9] rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E2E5E9] bg-[#F8F9FA] text-[#2D3748]">
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">MÃ ĐỢT BAY</th>
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px]">TUYẾN & LÝ TRÌNH</th>
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">NGÀY BAY</th>
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px]">PHI CÔNG & THIẾT BỊ</th>
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">KHỐI LƯỢNG ẢNH</th>
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">PHÁT HIỆN AI</th>
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">TRẠNG THÁI</th>
              <th className="py-2 px-2 font-semibold uppercase tracking-wider text-[11px] text-right whitespace-nowrap">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredMissions.map((survey) => {
              const isNeedReview = survey.status === 'PENDING_AI_REVIEW'
              const isScheduled = survey.status === 'SCHEDULED'
              return (
                <tr
                  key={survey.id}
                  onClick={() => {
                    if (isScheduled) {
                      onOpenSimulator(survey)
                    } else {
                      onNavigate(`${basePath}/surveys/${survey.id}/review`)
                    }
                  }}
                  className={`transition-colors cursor-pointer group ${
                    isNeedReview
                      ? 'bg-amber-50/20 hover:bg-amber-50/40'
                      : 'hover:bg-[#F8F9FA]'
                  }`}
                >
                  {/* Code */}
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#1A1D20] group-hover:text-[#C9A227] group-hover:underline">
                        {survey.code}
                      </span>
                      {isNeedReview && (
                        <span className="w-2 h-2 rounded-full bg-[#E5484D] animate-ping" title="Cần thẩm định ngay"></span>
                      )}
                    </div>
                    {/* Subtitle rút ngắn kèm hover tooltip đầy đủ */}
                    <div className="relative group/title inline-block max-w-[100px]">
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate cursor-help">
                        {survey.title}
                      </div>
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/title:block z-50 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700 animate-in fade-in duration-150">
                        {survey.title}
                      </div>
                    </div>
                  </td>

                  {/* Project & Chainage */}
                  <td className="py-2 px-2">
                    <div className="relative group/prj inline-block max-w-[125px]">
                      <div className="font-semibold text-[#1A1D20] text-xs truncate cursor-help">
                        {survey.project_name}
                      </div>
                      <div className="font-mono text-slate-500 text-[11px] mt-0.5 truncate">
                        {survey.start_km} → {survey.end_km}
                      </div>
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/prj:block z-50 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700 animate-in fade-in duration-150">
                        {survey.project_name} ({survey.start_km} → {survey.end_km})
                      </div>
                    </div>
                  </td>

                  {/* Flight Date */}
                  <td className="py-2 px-2 text-slate-600 whitespace-nowrap text-xs">
                    <div className="inline-flex items-center gap-1 text-[11px]">
                      <Icon name="calendar_today" size={12} className="text-slate-400" />
                      <span>{survey.flight_date}</span>
                    </div>
                  </td>

                  {/* Pilot & Drone */}
                  <td className="py-2 px-2 text-slate-600 text-xs">
                    <div className="relative group/pilot inline-block max-w-[105px]">
                      <div className="inline-flex items-center gap-1 font-medium text-[#1A1D20] text-[11px] truncate cursor-help">
                        <Icon name="person" size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{survey.pilot_name.split(' (')[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {survey.drone_model.split(' +')[0]}
                      </div>
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/pilot:block z-50 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700 animate-in fade-in duration-150">
                        {survey.pilot_name} • {survey.drone_model}
                      </div>
                    </div>
                  </td>

                  {/* Photos & GSD */}
                  <td className="py-2 px-2 font-medium text-slate-700 whitespace-nowrap text-xs">
                    <div className="text-[11px]">{survey.total_photos > 0 ? `${survey.total_photos.toLocaleString()} ảnh` : '—'}</div>
                    {survey.total_photos > 0 && (
                      <div className="text-[10px] text-slate-400 font-mono">GSD: {survey.gsd_resolution.replace(' cm/pixel', 'cm')}</div>
                    )}
                  </td>

                  {/* AI Defects */}
                  <td className="py-2 px-2 whitespace-nowrap text-xs">
                    {survey.ai_defects_count > 0 ? (
                      <div>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold border ${
                          isNeedReview
                            ? 'bg-[#FDECEC] text-[#E5484D] border-red-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <Icon name="auto_awesome" size={11} className={isNeedReview ? 'text-[#E5484D]' : 'text-slate-500'} />
                          {survey.ai_defects_count} lỗi
                        </span>
                        {isNeedReview && (
                          <div className="text-[10px] text-[#E5484D] font-medium mt-0.5">
                            8 chờ thẩm định
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono">—</span>
                    )}
                  </td>

                  {/* Status Chips */}
                  <td className="py-2 px-2 whitespace-nowrap text-xs">
                    {survey.status === 'PENDING_AI_REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3E2] text-[#F59E0B] border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
                        Chờ Thẩm Định AI
                      </span>
                    )}
                    {survey.status === 'BASELINE_LOCKED' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E9F7EC] text-[#2F9E44] border border-emerald-200">
                        <Icon name="check_circle" size={12} className="text-[#2F9E44]" />
                        Đã Khóa Baseline
                      </span>
                    )}
                    {survey.status === 'SCHEDULED' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F8F9FA] text-[#2D3748] border border-[#E2E5E9]">
                        <Icon name="schedule" size={12} className="text-slate-400" />
                        Lên Lịch Bay
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-2 text-right whitespace-nowrap text-xs">
                    <div className="flex items-center justify-end gap-1">
                      {isScheduled ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenSimulator(survey)
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D3748] hover:bg-[#1A1D20] text-white text-[11px] font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                          title="Kích hoạt mô phỏng Drone bay hoàn tất và AI quét lỗi"
                        >
                          <Icon name="play_arrow" size={12} className="text-white" />
                          <span>Mô phỏng bay</span>
                        </button>
                      ) : isNeedReview ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigate(`${basePath}/surveys/${survey.id}/review`)
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                          <Icon name="auto_awesome" size={12} className="text-white" />
                          <span>Mở Canvas AI</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigate(`${basePath}/surveys/${survey.id}/review`)
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[#E2E5E9] hover:bg-[#F8F9FA] text-[#1A1D20] text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <span>Xem hồ sơ</span>
                          <Icon name="chevron_right" size={12} className="text-slate-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-2 px-1 gap-2">
        <div className="flex items-center gap-1.5">
          <Icon name="info" size={15} className="text-slate-400" />
          <span>
            Mỗi đợt bay sau khi nạp ảnh sẽ tự động chạy pipeline Road-YOLOv9. Sau khi thẩm định xong 100% hộp bao và độ phủ ≥ 95%, PM có thể ký số khóa Baseline đoạn đường.
          </span>
        </div>
        <span className="font-mono text-slate-500 shrink-0">
          Hiển thị {filteredMissions.length} / {missions.length} nhiệm vụ
        </span>
      </div>
    </div>
  )
}
