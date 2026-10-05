import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { surveyService, type SurveyMissionItem as SurveyMission } from '../../api/services'
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
  Info,
  Play,
  Cpu,
  Radio,
  Loader2,
  Activity,
  X,
  Check,
  ShieldCheck
} from 'lucide-react'

export const SurveyRequests: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [missions, setMissions] = useState<SurveyMission[]>(() => surveyService.getSurveys())

  // Reactive listener for localStorage updates across components
  useEffect(() => {
    const handleStateChange = () => {
      setMissions(surveyService.getSurveys())
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [])

  // --- Drone Flight Simulator State (Thiếu 3) ---
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [selectedMissionForSim, setSelectedMissionForSim] = useState<SurveyMission | null>(null)
  const [simStep, setSimStep] = useState<'IDLE' | 'FLYING' | 'INGESTING' | 'AI_SCANNING' | 'COMPLETED'>('IDLE')
  const [simFlightProgress, setSimFlightProgress] = useState(0)
  const [simPhotosCount, setSimPhotosCount] = useState(0)
  const [simDefectCount, setSimDefectCount] = useState(0)
  const [simAltitude, setSimAltitude] = useState(65.0)
  const [simSpeed, setSimSpeed] = useState(5.4)
  const [simBattery, setSimBattery] = useState(96)
  const [simTimerId, setSimTimerId] = useState<NodeJS.Timeout | null>(null)

  // Mở modal mô phỏng chuyến bay Drone
  const handleOpenSimulator = (mission: SurveyMission) => {
    setSelectedMissionForSim(mission)
    setSimStep('IDLE')
    setSimFlightProgress(0)
    setSimPhotosCount(0)
    setSimDefectCount(0)
    setSimAltitude(65.0)
    setSimSpeed(5.4)
    setSimBattery(96)
    setIsSimulatorOpen(true)
  }

  // Khởi động chuỗi mô phỏng tự động
  const handleRunSimulation = () => {
    if (!selectedMissionForSim) return
    setSimStep('FLYING')
    setSimFlightProgress(5)

    // Phase 1: Fly & Waypoints telemetry (0-100% trong 2s)
    let p = 5
    const flyInterval = setInterval(() => {
      p += 15
      if (p >= 100) {
        clearInterval(flyInterval)
        setSimFlightProgress(100)
        setSimStep('INGESTING')

        // Phase 2: Ingestion 1920 4K photos (trong 2s)
        let ph = 0
        const ingestInterval = setInterval(() => {
          ph += 240
          if (ph >= 1920) {
            ph = 1920
            clearInterval(ingestInterval)
            setSimPhotosCount(1920)
            setSimStep('AI_SCANNING')

            // Phase 3: AI YOLOv8 + SAHI scan defects (trong 1.8s)
            let def = 0
            const aiInterval = setInterval(() => {
              def += 2
              if (def >= 8) {
                def = 8
                clearInterval(aiInterval)
                setSimDefectCount(8)
                setSimStep('COMPLETED')

                // Update storage state via surveyService
                const updated = surveyService.simulateDroneFlightCompletion(selectedMissionForSim.id)
                setMissions(surveyService.getSurveys())
                if (updated) {
                  setSelectedMissionForSim(updated)
                }
              } else {
                setSimDefectCount(def)
              }
            }, 350)
          } else {
            setSimPhotosCount(ph)
          }
        }, 150)
      } else {
        setSimFlightProgress(p)
        setSimBattery((prev) => Math.max(82, prev - 1))
      }
    }, 200)

    setSimTimerId(flyInterval)
  }

  const handleCloseSimulator = () => {
    if (simTimerId) clearInterval(simTimerId)
    setIsSimulatorOpen(false)
  }

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
                        {survey.status === 'SCHEDULED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenSimulator(survey)
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

      {/* --- DRONE FLIGHT SIMULATOR MODAL (Thiếu 3) --- */}
      {isSimulatorOpen && selectedMissionForSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Mô Phỏng Chuyến Bay Drone (Flight Simulator)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                      RTK FIX • {selectedMissionForSim.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mô phỏng quá trình cất cánh, thu nạp 1,920 không ảnh 4K và kích hoạt pipeline AI Road-YOLOv9
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseSimulator}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Mission Summary Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-800">{selectedMissionForSim.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {selectedMissionForSim.project_name} • {selectedMissionForSim.start_km} → {selectedMissionForSim.end_km}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                    <span>Phi công: <strong>{selectedMissionForSim.pilot_name}</strong></span>
                    <span>•</span>
                    <span>Thiết bị: <strong>{selectedMissionForSim.drone_model}</strong></span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    selectedMissionForSim.status === 'PENDING_AI_REVIEW'
                      ? 'bg-amber-100 text-[#8F7212] border-amber-300'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {selectedMissionForSim.status === 'PENDING_AI_REVIEW' ? 'Chờ Thẩm Định AI' : 'Đang Lên Lịch (SCHEDULED)'}
                  </span>
                </div>
              </div>

              {/* Live Telemetry Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white rounded-xl p-4 font-mono text-xs border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cao Độ (Altitude)</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5">{simAltitude.toFixed(1)} m</div>
                  <div className="text-[9px] text-slate-500">AGL chuẩn RTK</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tốc Độ Bay</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{simSpeed.toFixed(1)} m/s</div>
                  <div className="text-[9px] text-slate-500">Cruise Speed</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ảnh Thu Nạp</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{simPhotosCount} / 1,920</div>
                  <div className="text-[9px] text-slate-500">GSD: 1.15 cm/pixel</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pin Thiết Bị</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">{simBattery}%</div>
                  <div className="text-[9px] text-slate-500">TB30 Intelligent Bat</div>
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Tiến Trình Chuyến Bay & Pipeline AI</span>
                  <span className="text-indigo-600 font-mono">
                    {simStep === 'IDLE' && 'Sẵn sàng khởi động'}
                    {simStep === 'FLYING' && 'Giai đoạn 1/3: Bay quét hành lang'}
                    {simStep === 'INGESTING' && 'Giai đoạn 2/3: Truyền ảnh trực giao 4K'}
                    {simStep === 'AI_SCANNING' && 'Giai đoạn 3/3: Pipeline AI phát hiện lỗi'}
                    {simStep === 'COMPLETED' && 'Hoàn thành 100%'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className={`p-3 rounded-xl border text-xs transition-all ${
                    simStep === 'FLYING'
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                      : simFlightProgress === 100
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {simFlightProgress === 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : simStep === 'FLYING' ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      ) : (
                        <PlaneTakeoff className="w-4 h-4 text-slate-400" />
                      )}
                      <span>1. Quét Waypoints RTK</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tự động bay theo tọa độ trắc dọc Km 1036 → Km 1042.
                    </p>
                    {simStep === 'FLYING' && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-200"
                          style={{ width: `${simFlightProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div className={`p-3 rounded-xl border text-xs transition-all ${
                    simStep === 'INGESTING'
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                      : simPhotosCount === 1920
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {simPhotosCount === 1920 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : simStep === 'INGESTING' ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-slate-400" />
                      )}
                      <span>2. Nạp Ảnh Trực Giao</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Nạp 1,920 ảnh 4K và trích xuất EXIF GPS, độ cao, góc chụp.
                    </p>
                    {simStep === 'INGESTING' && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-150"
                          style={{ width: `${(simPhotosCount / 1920) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Step 3 */}
                  <div className={`p-3 rounded-xl border text-xs transition-all ${
                    simStep === 'AI_SCANNING'
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                      : simStep === 'COMPLETED'
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {simStep === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : simStep === 'AI_SCANNING' ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      ) : (
                        <Cpu className="w-4 h-4 text-slate-400" />
                      )}
                      <span>3. Road-YOLOv9 Quét Lỗi</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Phát hiện vết nứt, ổ gà, lún vệt bánh xe ({simDefectCount} khiếm khuyết).
                    </p>
                    {simStep === 'AI_SCANNING' && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-amber-500 h-full transition-all duration-200"
                          style={{ width: `${(simDefectCount / 8) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Completion Success Callout */}
              {simStep === 'COMPLETED' && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-900">
                        Chuyến bay mô phỏng đã hoàn tất thành công!
                      </div>
                      <div className="text-xs text-emerald-700 mt-0.5">
                        Nhiệm vụ [{selectedMissionForSim.code}] đã chuyển sang <strong>PENDING_AI_REVIEW</strong>. Đã sẵn sàng mở Canvas để Project Manager thẩm định bounding box!
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseSimulator}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                {simStep === 'IDLE' && (
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Bắt Đầu Mô Phỏng Bay Ngay</span>
                  </button>
                )}

                {(simStep === 'FLYING' || simStep === 'INGESTING' || simStep === 'AI_SCANNING') && (
                  <button
                    disabled
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-300 text-slate-600 text-xs font-bold cursor-not-allowed"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Mô Phỏng & Xử Lý Pipeline...</span>
                  </button>
                )}

                {simStep === 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseSimulator()
                      navigate(`${basePath}/surveys/${selectedMissionForSim.id}/review`)
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Mở Canvas Thẩm Định AI (WF-09) ➔</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default SurveyRequests
