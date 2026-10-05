import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight,
  ShieldAlert,
  Home,
  Radio,
  PlaneTakeoff,
  AlertTriangle,
  Verified,
  Lightbulb,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react'

export interface MissionHeaderProps {
  basePath: string
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
  coveragePercentage: number
  hasBlindspot: boolean
  isBaselineLocked: boolean
  pendingCount: number
  onOpenReFlightModal: () => void
  onLockBaseline: () => void
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  basePath,
  setCurrentFrame,
  showToast,
  coveragePercentage,
  hasBlindspot,
  isBaselineLocked,
  pendingCount,
  onOpenReFlightModal,
  onLockBaseline
}) => {
  const navigate = useNavigate()

  return (
    <>
      {/* BREADCRUMB & HEADER TOPBAR */}
      <section className="bg-white rounded-xl px-5 py-4 shadow-2xs border border-brand-border flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to={`${basePath}/dashboard`} className="hover:text-brand-gold transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to={`${basePath}/surveys`} className="hover:text-brand-gold transition-colors">
              Khảo sát
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">Nhiệm vụ bay QL1A-MS-04</span>
          </nav>

          {/* Thiết bị khảo sát RTK Fix Widget nhỏ gọn */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="text-slate-500 text-[11px]">DJI Matrice 300 RTK</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              RTK Fix: 100%
            </span>
          </div>
        </div>

        {/* Title and Top Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-1 border-t border-slate-100">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-brand-dark tracking-tight">
                Khảo sát Drone: Đợt bay quét QL1A (Đoạn Km 1024 - 1030)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                #MS-2026-0924
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                Đang rà soát AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Thu thập ảnh Nadir độ phân giải trắc địa phục vụ số hóa bề mặt và kiểm định độ võng nứt gãy cơ học.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* AI Status Button */}
            <button
              onClick={() => showToast('Mô hình Road-YOLOv9 đang xử lý batch 16 frames trên GPU Cloud')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang xử lý phân tích AI (Mã phản hồi: 202)</span>
            </button>

            {/* Re-flight Button */}
            <button
              onClick={onOpenReFlightModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              type="button"
            >
              <PlaneTakeoff className="w-3.5 h-3.5 text-slate-500" />
              <span>Yêu cầu bay bổ sung</span>
            </button>

            {/* Baseline Lock Button with Tooltip */}
            <div className="relative group">
              <button
                onClick={onLockBaseline}
                disabled={!isBaselineLocked}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                  isBaselineLocked
                    ? 'bg-[#C9A227] hover:bg-[#B38E1F] text-white cursor-pointer active:scale-98'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                type="button"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Xác nhận Baseline đoạn đường</span>
              </button>

              {!isBaselineLocked && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white rounded-xl text-xs shadow-xl hidden group-hover:block z-50 pointer-events-none">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Chưa thể khóa Baseline: Độ phủ mới đạt {coveragePercentage}% (&lt; 95%) và còn {pendingCount} phát hiện AI chưa được rà soát.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3-DIMENSIONAL DATA QUALITY INGEST ASSESSMENT (ISO/IEC 19157:2013) */}
      <section className="bg-white border border-brand-border rounded-xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Verified className="w-5 h-5 text-[#C9A227]" />
            <h2 className="font-bold text-sm text-brand-dark">
              Đánh giá 3 chiều chất lượng dữ liệu bay (Tri-axial Quality Ingest Assessment)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Giao thức kiểm định: ISO/IEC 19157:2013</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dimension 1: Corridor */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                <span className="text-xs text-brand-dark font-bold">1. Vị trí & Hành lang (Corridor)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PASS (Hợp lệ)
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Độ lệch tim bay:</span>
                <span className="font-mono font-bold text-slate-800">0.85m (&lt; 1.2m)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Tần số RTK-GPS:</span>
                <span className="font-mono font-semibold text-slate-800">10Hz Đồng bộ</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Góc nghiêng Gimbal:</span>
                <span className="font-mono font-semibold text-slate-800">90° Nadir Chuẩn</span>
              </div>
            </div>
          </div>

          {/* Dimension 2: Integrity & SRT */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                <span className="text-xs text-brand-dark font-bold">2. Toàn vẹn tệp & SRT Metadata</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PASS
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Mã băm SHA-256:</span>
                <span className="font-mono font-bold text-slate-800">4f9d..a82e (OK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Đồng bộ RTK:</span>
                <span className="font-mono font-semibold text-slate-800">1,920 / 1,920 frames</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Tốc độ trập:</span>
                <span className="font-mono font-semibold text-slate-800">1/1200s (Sắc nét)</span>
              </div>
            </div>
          </div>

          {/* Dimension 3: Coverage */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                <span className="text-xs text-brand-dark font-bold">3. Tỷ lệ phủ hình ảnh</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  coveragePercentage >= 95
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {coveragePercentage >= 95 ? `ĐẠT (${coveragePercentage}%)` : `CẢNH BÁO (${coveragePercentage}%)`}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Phủ dọc / Phủ ngang:</span>
                <span className="font-mono font-bold text-slate-800">
                  {coveragePercentage >= 95 ? '92% | 85%' : '82% | 68%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Điểm mù trắc địa:</span>
                <button
                  onClick={() => {
                    if (hasBlindspot) {
                      setCurrentFrame(1680)
                      showToast('Đã định vị camera tới điểm mù dải phân cách giữa tại Km 1027+100')
                    }
                  }}
                  className={`font-mono font-bold truncate max-w-[150px] cursor-pointer hover:underline ${
                    hasBlindspot ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {hasBlindspot ? 'Km 1027+100 (Xem)' : 'Không có (Đã phủ kín)'}
                </button>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Yêu cầu tiêu chuẩn:</span>
                <span className="font-mono font-semibold text-slate-800">≥ 95% Đồng nhất</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Ingest Guideline Callout */}
        <div className="flex items-start gap-2 bg-sky-50 text-sky-900 p-2.5 rounded-lg border border-sky-200 text-xs">
          <Lightbulb className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Quy tắc thẩm định hạ tầng:</strong> Bay đúng hành lang không đồng nghĩa đủ độ phủ. Hệ thống yêu cầu tối thiểu <span className="font-bold underline decoration-sky-500 decoration-2">≥ 95% độ phủ chuẩn trắc địa</span> để cấp phép khóa Baseline đoạn đường và kết xuất bản đồ hoàn công số.
          </p>
        </div>
      </section>

      {/* ASYNC AI JOB PROGRESS BAR */}
      <section className="bg-white border border-brand-border rounded-xl p-3.5 shadow-2xs flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#C9A227] animate-pulse" />
            <span className="font-bold text-slate-800">
              Mô hình nhận diện Road-YOLOv9 (Civil Infrastructure Edge AI) - Đang xử lý bất đồng bộ
            </span>
          </div>
          <span className="text-slate-500">
            Tiến độ: <strong className="text-slate-800 font-mono">74%</strong> (Đã phân tích 1,420 / 1,920 frames) • Ước tính còn lại: ~ 1 phút 20 giây
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#C9A227] rounded-full transition-all duration-500 relative flex items-center justify-end pr-1"
            style={{ width: '74%' }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Batch Size: 16
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              Tốc độ: 42 FPS
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              GPU: NVIDIA RTX 4090 Cloud Instance
            </span>
          </div>
          <span className="text-[#8F7212] font-semibold">Tự động nạp khung phát hiện theo thời gian thực</span>
        </div>
      </section>

    </>
  )
}
