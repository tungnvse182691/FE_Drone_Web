import React from 'react'
import {
  Search,
  Calendar,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  ChevronRight,
  Info
} from 'lucide-react'
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
  return (
    <div className="bg-white border border-brand-border rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'ALL'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            Tất cả đợt bay ({missions.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            <span>Chờ Thẩm Định AI</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULED')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'SCHEDULED'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            Kế hoạch lên lịch (1)
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            Đã khóa Baseline (2)
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã đợt #MS-, lý trình, phi công..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-brand-border text-slate-500 bg-slate-50">
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Mã Đợt Bay</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Tên Tuyến &amp; Lý Trình</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Ngày Bay</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Phi Công &amp; Thiết Bị</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Khối Lượng Ảnh</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Phát Hiện AI</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Trạng Thái</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMissions.map((survey) => {
              const isNeedReview = survey.status === 'PENDING_AI_REVIEW'
              return (
                <tr
                  key={survey.id}
                  onClick={() => onNavigate(`${basePath}/surveys/${survey.id}/review`)}
                  className={`transition-colors cursor-pointer group ${
                    isNeedReview
                      ? 'bg-amber-50/30 hover:bg-amber-50/60'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-brand-dark group-hover:text-[#C9A227] group-hover:underline">
                        {survey.code}
                      </span>
                      {isNeedReview && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Cần thẩm định ngay"></span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                      {survey.title}
                    </div>
                  </td>

                  {/* Project & Chainage */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-brand-dark">{survey.project_name}</div>
                    <div className="font-mono text-slate-500 text-[11px] mt-0.5">
                      {survey.start_km} → {survey.end_km}
                    </div>
                  </td>

                  {/* Flight Date */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{survey.flight_date}</span>
                    </div>
                  </td>

                  {/* Pilot & Drone */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="inline-flex items-center gap-1 font-medium text-brand-dark">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{survey.pilot_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {survey.drone_model}
                    </div>
                  </td>

                  {/* Photos & GSD */}
                  <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                    <div>{survey.total_photos > 0 ? `${survey.total_photos.toLocaleString()} ảnh SD` : '—'}</div>
                    {survey.total_photos > 0 && (
                      <div className="text-[10px] text-slate-400 font-mono">GSD: {survey.gsd_resolution}</div>
                    )}
                  </td>

                  {/* AI Defects */}
                  <td className="py-3.5 px-4">
                    {survey.ai_defects_count > 0 ? (
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border ${
                          isNeedReview
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          {survey.ai_defects_count} khiếm khuyết
                        </span>
                        {isNeedReview && (
                          <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                            8 chưa thẩm định
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {survey.status === 'PENDING_AI_REVIEW' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-[#8F7212] border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        Chờ Thẩm Định AI
                      </span>
                    )}
                    {survey.status === 'BASELINE_LOCKED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã Khóa Baseline
                      </span>
                    )}
                    {survey.status === 'SCHEDULED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Lên Lịch Bay
                      </span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {survey.status === 'SCHEDULED' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenSimulator(survey)
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                          title="Kích hoạt mô phỏng Drone bay hoàn tất và AI quét lỗi"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Mô phỏng bay xong</span>
                        </button>
                      )}
                      {isNeedReview ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigate(`${basePath}/surveys/${survey.id}/review`)
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Mở Canvas AI (WF-09)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigate(`${basePath}/surveys/${survey.id}/review`)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span>Xem hồ sơ</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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

      {/* Footer info note */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-1">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Mỗi đợt bay sau khi nạp ảnh sẽ tự động chạy pipeline Road-YOLOv9. Sau khi thẩm định xong 100% hộp bao và độ phủ &ge; 95%, PM có thể ký số khóa Baseline đoạn đường.
          </span>
        </div>
        <span className="font-mono text-slate-400">Hiển thị {filteredMissions.length} / {missions.length} nhiệm vụ</span>
      </div>
    </div>
  )
}
