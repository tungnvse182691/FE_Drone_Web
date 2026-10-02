import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Calendar,
  ChevronDown,
  Clock,
  PlusCircle,
  FileDown,
  BarChart3,
  AlarmClock,
  Route as RouteIcon,
  Info,
  TrendingUp,
  TriangleAlert,
  Search,
  Bell,
  Settings,
  Layers,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react'

// Interface cho Dự án trong danh mục rủi ro bảo hành (RPT-01 / RPT-06)
export interface RiskPortfolioItem {
  id: string
  risk_level: 'Critical' | 'Watch' | 'Moderate'
  project_id: string
  project_name: string
  route_code: string
  section_display: string
  chainage_display: string
  open_defects_count: number
  defect_scope_display: string
  sla_remaining: string
  sla_status: 'urgent' | 'warning' | 'normal'
  pci_score: number
  gps_lat: number
  gps_lng: number
}

// Mock danh sách các điểm rủi ro bảo hành cao (RPT-06)
const MOCK_RISK_ITEMS: RiskPortfolioItem[] = [
  {
    id: 'risk-01',
    risk_level: 'Critical',
    project_id: 'PRJ-QL1A-PK04',
    project_name: 'QL1A - Giai đoạn 2',
    route_code: 'QL1A',
    section_display: 'Đoạn Thừa Thiên Huế - Đà Nẵng',
    chainage_display: 'Km 1024 - Km 1045',
    open_defects_count: 12,
    defect_scope_display: 'Diện tích hư hỏng: 145 m²',
    sla_remaining: 'Còn 24 giờ',
    sla_status: 'urgent',
    pci_score: 58.2,
    gps_lat: 16.0547,
    gps_lng: 108.2025
  },
  {
    id: 'risk-02',
    risk_level: 'Critical',
    project_id: 'PRJ-HUE-BYPASS',
    project_name: 'Tuyến tránh TP. Huế',
    route_code: 'QL1A-BP',
    section_display: 'Đoạn Hương Trà - Hương Thủy',
    chainage_display: 'Km 18+600 - Km 22+400',
    open_defects_count: 8,
    defect_scope_display: 'Lún vệt bánh xe: 220 m²',
    sla_remaining: 'Còn 18 giờ',
    sla_status: 'urgent',
    pci_score: 52.8,
    gps_lat: 16.4637,
    gps_lng: 107.5908
  },
  {
    id: 'risk-03',
    risk_level: 'Watch',
    project_id: 'PRJ-CT-BACNAM-03',
    project_name: 'Cao tốc Bắc Nam',
    route_code: 'CT01',
    section_display: 'Đoạn Diễn Châu - Bãi Vọt',
    chainage_display: 'Km 45+200 - Km 47+000',
    open_defects_count: 5,
    defect_scope_display: 'Chiều dài nứt rạn: 85 m',
    sla_remaining: 'Còn 3 ngày',
    sla_status: 'warning',
    pci_score: 64.5,
    gps_lat: 18.7231,
    gps_lng: 105.6542
  },
  {
    id: 'risk-04',
    risk_level: 'Watch',
    project_id: 'PRJ-QL14B-DN',
    project_name: 'Quốc lộ 14B mở rộng',
    route_code: 'QL14B',
    section_display: 'Đoạn Hòa Vang - Đại Lộc',
    chainage_display: 'Km 35+000 - Km 42+500',
    open_defects_count: 4,
    defect_scope_display: 'Khe co giãn: 2 vị trí',
    sla_remaining: 'Còn 5 ngày',
    sla_status: 'normal',
    pci_score: 68.0,
    gps_lat: 15.9324,
    gps_lng: 108.1211
  }
]

// Mock Hoạt động gần đây (Audit Trail - RPT-10)
const MOCK_RECENT_ACTIVITIES = [
  {
    id: 'act-01',
    tag: 'Duyệt AI',
    time: '10 phút trước',
    content: 'Hoàn tất scan AI 15km QL1A (Km 1024 - 1039), phân loại 18 khiếm khuyết.',
    type: 'ai'
  },
  {
    id: 'act-02',
    tag: 'Nghiệm thu',
    time: '45 phút trước',
    content: 'Supervisor ký xác nhận hoàn công hạng mục #ITEM-01 (Km 1024+350 QL1A).',
    type: 'acceptance'
  },
  {
    id: 'act-03',
    tag: 'Gói đề xuất',
    time: '2 giờ trước',
    content: 'Chỉ huy trưởng trình hồ sơ Gói đề xuất PKG-2026-08 (5 phân đoạn, 6.0km).',
    type: 'proposal'
  },
  {
    id: 'act-04',
    tag: 'Điều phối',
    time: '5 giờ trước',
    content: 'Phân công Đội Crew 02 cào bóc thảm nhựa polime phân đoạn Km 1033+500.',
    type: 'dispatch'
  }
]

export const SupDashboard: React.FC = () => {
  const navigate = useNavigate()

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('2026-08')
  const [selectedRegion, setSelectedRegion] = useState('ALL')
  const [selectedProject, setSelectedProject] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Map Interactive States
  const [activePinId, setActivePinId] = useState<string>('risk-01')
  const [mapZoom, setMapZoom] = useState<number>(1)
  const [mapLayer, setMapLayer] = useState<'satellite' | 'vector'>('satellite')

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Đã làm mới dữ liệu danh mục bảo hành và tính toán lại các chỉ số KPI!')
    }, 600)
  }

  // Filtered Risk Items
  const filteredRiskItems = useMemo(() => {
    return MOCK_RISK_ITEMS.filter((item) => {
      if (selectedProject !== 'ALL' && item.project_id !== selectedProject) return false
      return true
    })
  }, [selectedProject])

  // Active pin details
  const activeRiskItem = useMemo(() => {
    return MOCK_RISK_ITEMS.find((it) => it.id === activePinId) || MOCK_RISK_ITEMS[0]
  }, [activePinId])

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER: BREADCRUMB, TITLE & ACTIONS                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <span>Trang chủ</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#C9A227]">Dashboard</span>
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
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
              </button>

              <button
                onClick={() =>
                  showToast('Đang khởi tạo gói kết xuất báo cáo tổng hợp danh mục bảo hành RPT-01 (PDF/A)...')
                }
                type="button"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất báo cáo</span>
              </button>

              <button
                onClick={() => navigate('/sup/proposals')}
                type="button"
                className="px-4 py-2 text-xs font-bold text-white rounded-xl transition shadow-sm flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer"
                style={{ boxShadow: 'rgba(201, 162, 39, 0.28) 0px 2px 8px' }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tạo gói đề xuất</span>
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
                className="appearance-none pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
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
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                <option value="ALL">Khu vực: Tất cả</option>
                <option value="CENTRAL">Miền Trung (Huế - Đà Nẵng)</option>
                <option value="NORTH">Miền Bắc</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Project */}
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                <option value="ALL">Dự án: Tất cả</option>
                <option value="PRJ-QL1A-PK04">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                <option value="PRJ-HUE-BYPASS">Tuyến tránh TP. Huế</option>
                <option value="PRJ-CT-BACNAM-03">Cao tốc Bắc Nam (Diễn Châu)</option>
                <option value="PRJ-QL14B-DN">Quốc lộ 14B mở rộng</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedMonth('2026-08')
                setSelectedRegion('ALL')
                setSelectedProject('ALL')
                showToast('Đã đặt lại bộ lọc mặc định!')
              }}
              type="button"
              className="font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Đặt lại
            </button>
            <button
              onClick={() => showToast(`Đã áp dụng bộ lọc dữ liệu ${selectedMonth}!`)}
              type="button"
              className="px-4 py-1.5 font-bold text-white rounded-xl transition shadow-2xs bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD GRID (8 Cols Left, 4 Cols Right)                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-1">
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT SUB-COLUMN: 8 COLS                                                 */}
          {/* ----------------------------------------------------------------------- */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* 3 Pastel Metric Cards (Chuẩn theo Stitch và v2.2) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Dự án đang bảo hành */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700">Dự án đang bảo hành</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 bg-[#EAF4FB]">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">42</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      +2
                    </span>
                    <span>so với tháng trước</span>
                    <span className="text-slate-300">•</span>
                    <span>156 đoạn</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Dự án sắp hết hạn */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700">Dự án sắp hết hạn</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-rose-600 bg-red-50">
                    <AlarmClock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">5</div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-rose-700 bg-red-50 border border-rose-200">
                      <TriangleAlert className="w-3 h-3" />
                      <span>Cảnh báo: &lt; 30 ngày (2 dự án)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Đoạn đường chưa baseline (MET-09) */}
              <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700 leading-snug">
                    Đoạn đường chưa baseline
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#92700C] bg-[#FEF9C3]">
                    <RouteIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-sansation text-3xl font-bold text-slate-900 tracking-tight">12</span>
                    <span className="text-xs font-semibold text-slate-600">đoạn</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-600">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thuộc 4 dự án (Cần bay khảo sát gốc)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GIS Satellite Map Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xs border border-slate-200">
              <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A227]" />
                  <h3 className="font-sansation font-bold text-slate-900 text-sm">
                    Bản đồ danh mục rủi ro hư hỏng (GIS Risk Portfolio)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold text-rose-700 bg-red-100/80 rounded-full border border-red-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                    High Risk ({MOCK_RISK_ITEMS.filter((i) => i.risk_level === 'Critical').length})
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 bg-sky-100 rounded-full border border-sky-200">
                    Watch ({MOCK_RISK_ITEMS.filter((i) => i.risk_level === 'Watch').length})
                  </span>
                </div>
              </div>

              {/* Map Viewport Area */}
              <div className="relative w-full h-[360px] bg-slate-900 overflow-hidden select-none">
                {/* Satellite Background Simulation */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    mapLayer === 'satellite' ? 'opacity-90' : 'opacity-30'
                  }`}
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 30px 30px, 30px 30px'
                  }}
                >
                  {/* Highway Line SVG Simulation */}
                  <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                    {/* Road line QL1A */}
                    <path
                      d="M 50 80 Q 200 140, 420 180 T 800 290"
                      fill="none"
                      stroke="#C9A227"
                      strokeWidth="5"
                      strokeDasharray="6 3"
                      className="opacity-70"
                    />
                    <path
                      d="M 120 30 Q 300 120, 520 220 T 750 340"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="3.5"
                      className="opacity-60"
                    />
                  </svg>
                </div>

                {/* Interactive GIS Pins on Map */}
                <div className="absolute inset-0 p-6 pointer-events-auto">
                  {/* Pin 1: QL1A */}
                  <div
                    onClick={() => setActivePinId('risk-01')}
                    className="absolute left-[38%] top-[45%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></span>
                      <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-[10px]">
                        12
                      </div>
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded shadow border border-slate-700 font-mono">
                      Km 1024+350
                    </div>
                  </div>

                  {/* Pin 2: Hue Bypass */}
                  <div
                    onClick={() => setActivePinId('risk-02')}
                    className="absolute left-[22%] top-[25%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-7 h-7 rounded-full bg-rose-500/30 animate-pulse"></span>
                      <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-[10px]">
                        8
                      </div>
                    </div>
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded shadow border border-slate-700 font-mono">
                      Tránh Huế
                    </div>
                  </div>

                  {/* Pin 3: Dien Chau */}
                  <div
                    onClick={() => setActivePinId('risk-03')}
                    className="absolute left-[65%] top-[60%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-[10px]">
                        5
                      </div>
                    </div>
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded shadow border border-slate-700 font-mono">
                      Diễn Châu
                    </div>
                  </div>

                  {/* Pin 4: QL14B */}
                  <div
                    onClick={() => setActivePinId('risk-04')}
                    className="absolute left-[80%] top-[75%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-[10px]">
                        4
                      </div>
                    </div>
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded shadow border border-slate-700 font-mono">
                      QL14B
                    </div>
                  </div>
                </div>

                {/* Floating Map HUD Detail on Active Pin */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-white text-xs space-y-1 max-w-xs shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#C9A227]">{activeRiskItem.project_name}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        activeRiskItem.risk_level === 'Critical' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
                      }`}
                    >
                      {activeRiskItem.risk_level}
                    </span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">{activeRiskItem.chainage_display}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                    <span>{activeRiskItem.defect_scope_display}</span>
                    <span className="font-bold text-rose-400">{activeRiskItem.sla_remaining}</span>
                  </div>
                </div>

                {/* Map Control Buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 shadow-md">
                  <button
                    onClick={() => setMapZoom((prev) => Math.min(prev + 0.2, 2))}
                    type="button"
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
                    title="Phóng to"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setMapZoom((prev) => Math.max(prev - 0.2, 0.6))}
                    type="button"
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer border border-slate-200"
                    title="Thu nhỏ"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setMapLayer(mapLayer === 'satellite' ? 'vector' : 'satellite')}
                    type="button"
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center transition shadow-xs cursor-pointer border border-slate-200"
                    title="Chuyển lớp bản đồ"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* High Risk Data Table (RPT-06) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h3 className="font-sansation font-bold text-slate-900 text-sm">
                    Danh sách đoạn tuyến rủi ro cao (RPT-06 High Risk)
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/sup/projects')}
                  type="button"
                  className="text-xs font-semibold hover:underline text-[#C9A227] cursor-pointer"
                >
                  Xem tất cả dự án &gt;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                      <th className="pb-3 font-semibold">Mức rủi ro</th>
                      <th className="pb-3 font-semibold">Dự án</th>
                      <th className="pb-3 font-semibold">Đoạn đường</th>
                      <th className="pb-3 font-semibold text-center">Lỗi mở</th>
                      <th className="pb-3 font-semibold">Khối lượng hư hỏng kỹ thuật</th>
                      <th className="pb-3 font-semibold text-right">Thời hạn xử lý (SLA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredRiskItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Không có đoạn đường nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredRiskItems.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setActivePinId(item.id)
                            navigate('/sup/proposals')
                          }}
                          className="hover:bg-slate-50/80 transition cursor-pointer group"
                        >
                          <td className="py-3.5">
                            {item.risk_level === 'Critical' ? (
                              <span className="px-3 py-1 text-[11px] font-bold text-rose-700 bg-red-100 rounded-full inline-block border border-red-200">
                                Critical
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-[11px] font-semibold text-sky-700 bg-sky-100 rounded-full inline-block border border-sky-200">
                                Watch
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 font-bold text-slate-900 group-hover:text-[#C9A227] transition-colors">
                            {item.project_name}
                          </td>
                          <td className="py-3.5 text-slate-600 font-mono text-[11px]">
                            {item.chainage_display}
                          </td>
                          <td className="py-3.5 text-center font-bold text-rose-600">
                            {item.open_defects_count}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-800">
                            {item.defect_scope_display}
                          </td>
                          <td className="py-3.5 text-right">
                            {item.sla_status === 'urgent' ? (
                              <span className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-red-50 rounded-full inline-block border border-rose-200">
                                {item.sla_remaining}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full inline-block bg-amber-50 text-amber-800 border border-amber-200">
                                {item.sla_remaining}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT SUB-COLUMN: 4 COLS                                                */}
          {/* ----------------------------------------------------------------------- */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* Card: Hiệu suất xử lý khiếm khuyết (MET-05 Cohort Completion & SLA) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#FEF9C3] text-[#92700C]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-sansation font-bold">Hiệu suất xử lý khiếm khuyết</span>
                </div>

                <span className="text-xs text-slate-500 font-medium">Chỉ số hoàn thành đúng hạn (SLA)</span>
                <div className="font-sansation text-3xl font-bold tracking-tight mt-1 mb-5 text-[#C9A227]">
                  88.5%
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đã nghiệm thu đóng hồ sơ</span>
                    <span className="font-bold text-[#C9A227]">156 điểm</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="h-2 rounded-full bg-[#C9A227]" style={{ width: '86.6%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">Đang xử lý / Chờ nghiệm thu</span>
                    <span className="text-rose-600 font-bold">24 điểm</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-100">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '13.4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Hoạt động gần đây (Audit Trail - RPT-10) */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sansation font-bold text-slate-900 text-sm">Hoạt động gần đây</h3>
                <span className="text-[11px] font-mono text-slate-400">RPT-10</span>
              </div>

              <div className="space-y-3.5">
                {MOCK_RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        act.type === 'ai'
                          ? 'bg-purple-100 text-purple-700'
                          : act.type === 'acceptance'
                          ? 'bg-emerald-100 text-emerald-700'
                          : act.type === 'proposal'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 rounded-xl p-3 bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.type === 'ai'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : act.type === 'acceptance'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : act.type === 'proposal'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {act.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{act.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Chỉ số suy thoái mặt đường PCI theo đoạn tuyến */}
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
              <h3 className="font-sansation font-bold text-slate-900 text-sm mb-3">
                Chỉ số chất lượng mặt đường (PCI)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">QL1A (Km 1024 - Km 1045):</span>
                    <span className="font-bold text-emerald-600">78.5 (Tốt)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78.5%' }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Cao tốc Bắc Nam XL-03:</span>
                    <span className="font-bold text-amber-600">64.2 (Trung bình)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '64.2%' }} />
                  </div>
                </div>

                <button
                  onClick={() => navigate('/sup/risk-analytics')}
                  type="button"
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2"
                >
                  <span>Xem bản đồ nhiệt &amp; rủi ro chuyên sâu</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
