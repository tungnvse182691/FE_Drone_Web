import React from 'react'
import { Verified, Lightbulb, Cpu } from 'lucide-react'

export interface MissionQualitySectionProps {
  coveragePercentage: number
  hasBlindspot: boolean
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
}

export const MissionQualitySection: React.FC<MissionQualitySectionProps> = ({
  coveragePercentage,
  hasBlindspot,
  setCurrentFrame,
  showToast
}) => {
  return (
    <>
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
