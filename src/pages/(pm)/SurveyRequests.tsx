import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  PlaneTakeoff,
  PlusCircle,
  Calendar,
  UserCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  FolderKanban,
  FileCheck2,
  Info
} from 'lucide-react'

interface SurveyMission {
  id: string
  code: string
  title: string
  project_id: string
  project_name: string
  start_km: string
  end_km: string
  flight_date: string
  pilot_name: string
  drone_model: string
  total_photos: number
  gsd_resolution: string
  ai_defects_count: number
  ai_pending_count: number
  coverage_percent: number
  status: 'PENDING_AI_REVIEW' | 'BASELINE_LOCKED' | 'SCHEDULED' | 'PROCESSING_AI'
  status_label: string
}

export const SurveyRequests: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const missions: SurveyMission[] = [
    {
      id: 'srv-01',
      code: '#MS-2026-0924',
      title: 'Bay quét Baseline định kỳ đợt 4 & Tầm soát nứt lún',
      project_id: 'prj-ql1a-02',
      project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
      start_km: 'Km 1024+000',
      end_km: 'Km 1030+000',
      flight_date: '24/09/2026',
      pilot_name: 'Hoàng Quốc Bảo (Pilot RTK Level 3)',
      drone_model: 'DJI Matrice 300 RTK + Zenmuse P1',
      total_photos: 1920,
      gsd_resolution: '1.12 cm/pixel',
      ai_defects_count: 8,
      ai_pending_count: 8,
      coverage_percent: 87,
      status: 'PENDING_AI_REVIEW',
      status_label: 'Chờ thẩm định AI Canvas (WF-09)'
    },
    {
      id: 'srv-02',
      code: '#MS-2026-0810',
      title: 'Bay kiểm định mốc bàn giao lý trình Km 1030 – Km 1036',
      project_id: 'prj-ql1a-02',
      project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
      start_km: 'Km 1030+000',
      end_km: 'Km 1036+500',
      flight_date: '10/08/2026',
      pilot_name: 'Lê Hoàng Long (Drone Operator)',
      drone_model: 'DJI Matrice 300 RTK + Zenmuse P1',
      total_photos: 1450,
      gsd_resolution: '1.20 cm/pixel',
      ai_defects_count: 14,
      ai_pending_count: 0,
      coverage_percent: 98,
      status: 'BASELINE_LOCKED',
      status_label: 'Đã khóa Baseline'
    },
    {
      id: 'srv-03',
      code: '#MS-2026-0705',
      title: 'Bay lập Baseline dữ liệu ban đầu toàn tuyến 21.5 km',
      project_id: 'prj-ql1a-02',
      project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
      start_km: 'Km 1024+000',
      end_km: 'Km 1045+500',
      flight_date: '05/07/2026',
      pilot_name: 'Nguyễn Tiến Dũng',
      drone_model: 'DJI Phantom 4 RTK',
      total_photos: 2840,
      gsd_resolution: '1.35 cm/pixel',
      ai_defects_count: 22,
      ai_pending_count: 0,
      coverage_percent: 96,
      status: 'BASELINE_LOCKED',
      status_label: 'Đã khóa Baseline'
    },
    {
      id: 'srv-04',
      code: '#MS-2026-1012',
      title: 'Kế hoạch bay kiểm tra hư hỏng sau đợt mưa bão số 4',
      project_id: 'prj-ql1a-02',
      project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
      start_km: 'Km 1036+500',
      end_km: 'Km 1042+000',
      flight_date: '12/10/2026 (Dự kiến)',
      pilot_name: 'Hoàng Quốc Bảo (Pilot RTK Level 3)',
      drone_model: 'DJI Matrice 300 RTK + Zenmuse P1',
      total_photos: 0,
      gsd_resolution: '1.15 cm/pixel',
      ai_defects_count: 0,
      ai_pending_count: 0,
      coverage_percent: 0,
      status: 'SCHEDULED',
      status_label: 'Đã lên lịch bay'
    }
  ]

  const filteredMissions = missions.filter((m) => {
    if (activeTab === 'PENDING' && m.status !== 'PENDING_AI_REVIEW') return false
    if (activeTab === 'SCHEDULED' && m.status !== 'SCHEDULED') return false
    if (activeTab === 'COMPLETED' && m.status !== 'BASELINE_LOCKED') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        m.code.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.start_km.toLowerCase().includes(q) ||
        m.pilot_name.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate(`${basePath}/dashboard`)}>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-brand-dark font-semibold">Khảo Sát Drone & Thẩm Định AI</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Kế Hoạch & Yêu Cầu Bay Khảo Sát Drone
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các đợt bay chụp ảnh hồng ngoại/RGB độ phân giải cao và thẩm định AI Bounding Box mặt đường (WF-09)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`${basePath}/surveys/srv-01/review`)}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mở Canvas Thẩm Định AI (#MS-2026-0924)</span>
          </button>
          {!isSupervisor && (
            <button
              onClick={() => navigate('/pm/surveys/create')}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-500" />
              <span>Tạo Yêu Cầu Bay Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Đợt Bay</div>
            <div className="text-2xl font-bold text-brand-dark mt-1">04 <span className="text-xs font-normal text-slate-500">nhiệm vụ</span></div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>02 đợt đã khóa Baseline</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A227] flex items-center justify-center border border-amber-100">
            <PlaneTakeoff className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border-2 border-amber-200/80 rounded-xl p-4.5 shadow-2xs flex items-center justify-between bg-amber-50/20">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Cần Thẩm Định AI Ngay</div>
            <div className="text-2xl font-bold text-brand-error mt-1">01 <span className="text-xs font-semibold text-amber-700">đợt bay (#MS-0924)</span></div>
            <div className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>08 khiếm khuyết AI chờ xác nhận</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khối Lượng Không Ảnh SD</div>
            <div className="text-2xl font-bold text-brand-dark mt-1">6,210 <span className="text-xs font-normal text-slate-500">ảnh</span></div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
              <Camera className="w-3 h-3 text-slate-400" />
              <span>GSD bình quân 1.15 cm/pixel</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Độ Phủ Hành Lang (Coverage)</div>
            <div className="text-2xl font-bold text-brand-dark mt-1">94.8% <span className="text-xs font-normal text-slate-500">toàn tuyến</span></div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Đạt ngưỡng chất lượng &gt; 90%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Prominent Action Banner for Mission #MS-2026-0924 */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-[#C9A227]/40 rounded-xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#C9A227] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-brand-dark">
                Đợt bay mới nhất: #MS-2026-0924 (QL1A Km 1024+000 – Km 1030+000)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                8 Khiếm Khuyết AI Chờ Duyệt
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-[#8F7212] border border-amber-200">
                Độ phủ 87% (Cần Bay Bổ Sung)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Mô hình Road-YOLOv9 đã nhận diện xong 1,920 khung hình. Project Manager cần vào Canvas để thẩm định hộp bao (Bounding box), xác nhận vết nứt/ổ gà và duyệt điều kiện khóa Baseline.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`${basePath}/surveys/srv-01/review`)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <span>Mở Canvas Thẩm Định AI (WF-09)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
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
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Tên Tuyến & Lý Trình</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Ngày Bay</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Phi Công & Thiết Bị</th>
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
                    onClick={() => navigate(`${basePath}/surveys/${survey.id}/review`)}
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
                        {isNeedReview ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`${basePath}/surveys/${survey.id}/review`)
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
                              navigate(`${basePath}/surveys/${survey.id}/review`)
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
    </div>
  )
}
export default SurveyRequests
