import React, { useState } from 'react'
import { Sparkles, AlertTriangle, Database, Info } from 'lucide-react'
import { Defect } from '../../../types/domain'

interface DefectTemporalComparisonProps {
  defect: Defect
}

export const DefectTemporalComparison: React.FC<DefectTemporalComparisonProps> = ({ defect }) => {
  const [temporalMode, setTemporalMode] = useState<'EVOLUTION' | 'FRESH_DEFECT' | 'INITIAL_BASELINE'>('FRESH_DEFECT')

  return (
    <div className="space-y-4">
      {/* Scenario Switcher Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1 text-[11px] font-semibold flex-wrap">
          <button
            type="button"
            onClick={() => setTemporalMode('FRESH_DEFECT')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              temporalMode === 'FRESH_DEFECT'
                ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lỗi mới phát sinh (Kỳ trước bình thường)</span>
          </button>

          <button
            type="button"
            onClick={() => setTemporalMode('EVOLUTION')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              temporalMode === 'EVOLUTION'
                ? 'bg-white text-rose-800 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Vết nứt tiến triển (+18%)</span>
          </button>

          <button
            type="button"
            onClick={() => setTemporalMode('INITIAL_BASELINE')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              temporalMode === 'INITIAL_BASELINE'
                ? 'bg-white text-blue-800 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Lần đầu ghi nhận (Chưa có ảnh kỳ trước)</span>
          </button>
        </div>
      </div>

      {/* Scenario 1: HƯ HỎNG MỚI PHÁT SINH */}
      {temporalMode === 'FRESH_DEFECT' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đa Kỳ: Kỳ Trước (Mặt đường nguyên vẹn) vs Kỳ Này (Mới xuất hiện)</span>
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
              ✨ Hư hỏng mới phát sinh (Fresh Defect)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Kỳ Trước (Tháng 06/2026 - Chu kỳ T-1)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  ✓ Mặt đường nguyên vẹn
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black group">
                <img
                  src="https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80"
                  alt="Kỳ trước mặt đường nguyên vẹn"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-400/30">
                  Km 1024+300 • Kết cấu ổn định
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8F7212]">Kỳ Này (Tháng 10/2026 - Chu kỳ T0)</span>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                  ⚠ Phát sinh ổ gà / nứt
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border-2 border-[#C9A227] aspect-video bg-black">
                <img
                  src={defect.image_url}
                  alt="Kỳ này mới nứt"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-md pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                >
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded absolute -top-4 left-0">
                    Lỗi mới (Sâu {defect.depth_mm ? (defect.depth_mm / 10).toFixed(1) : '7.0'}cm)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kết luận thẩm định so sánh đa kỳ:</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Camera Drone ở kỳ bay trước (T-1) đã chụp quét qua vị trí này và xác nhận <strong>mặt đường còn nguyên vẹn, chưa có vết nứt</strong>. Hư hỏng này xuất hiện đột ngột trong chu kỳ hiện tại (Tỷ lệ tăng diện tích: <strong>0% → 100%</strong>, phát sinh mới sau đợt mưa bão). Đề xuất đưa vào kế hoạch sửa chữa ngay để ngăn nước thấm phá hoại móng đường.
            </p>
          </div>
        </div>
      )}

      {/* Scenario 2: VẾT NỨT TIẾN TRIỂN */}
      {temporalMode === 'EVOLUTION' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Đa Kỳ: Theo Dõi Tốc Độ Nứt Lan Tỏa (Crack Growth Evolution)</span>
            </span>
            <span className="text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px]">
              Tốc độ mở rộng vết nứt: +18%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Kỳ Khảo Sát Trước (Tháng 06/2026)</span>
                <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                  Diện tích: 0.32 m²
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
                <img
                  src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                  alt="Kỳ trước nứt nhỏ"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1/4 left-1/3 w-1/4 h-1/4 border-2 border-amber-400 bg-amber-400/20 rounded pointer-events-none">
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-1 py-0.2 rounded absolute -top-3.5 left-0">
                    Nứt chân chim (0.32 m²)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8F7212]">Kỳ Khảo Sát Này (Tháng 10/2026)</span>
                <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-mono font-bold">
                  Diện tích: {((defect.length_m || 1.2) * (defect.width_m || 0.8)).toFixed(2)} m² (+18%)
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border-2 border-[#C9A227] aspect-video bg-black">
                <img
                  src={defect.image_url}
                  alt="Kỳ này nứt to"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute border-2 border-rose-500 bg-rose-500/20 rounded pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                >
                  <span className="bg-rose-600 text-white text-[9px] font-bold px-1 py-0.2 rounded absolute -top-3.5 left-0">
                    Nứt lưới lan rộng ({((defect.length_m || 1.2) * (defect.width_m || 0.8)).toFixed(2)} m²)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cảnh báo tiến triển suy thoái kết cấu:</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Vết nứt từ dạng sợi đơn lẻ ở kỳ trước đã xé rộng thành dạng mạng lưới cá sấu (Alligator cracking) với tốc độ tăng trưởng <strong>+18% sau 4 tháng</strong>. Cần gom đợt xử lý cào bóc thảm lại để tránh gãy vỡ tầng base.
            </p>
          </div>
        </div>
      )}

      {/* Scenario 3: LẦN ĐẦU GHI NHẬN */}
      {temporalMode === 'INITIAL_BASELINE' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Đa Kỳ: Khảo Sát Ban Đầu (Baseline Initial Epoch T0)</span>
            </span>
            <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-[11px]">
              📌 Mốc Chuẩn Ban Đầu (Baseline T0)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Dữ Liệu Khảo Sát Kỳ Trước (T-1)</span>
              <div className="rounded-lg border-2 border-dashed border-slate-300 aspect-video bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <Database className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-700 block">Chưa Có Dữ Liệu Ảnh Lịch Sử</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Đoạn tuyến Km {defect.chainage_km ? defect.chainage_km.toFixed(1) : '1024.3'} chưa từng có dữ liệu bay quét trước đây.
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                  Kỳ khảo sát đầu tiên (Baseline Epoch)
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8F7212]">Kỳ Khảo Sát Này (Tháng 10/2026 - Mốc T0)</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  Đang ghi nhận
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border-2 border-[#C9A227] aspect-video bg-black">
                <img
                  src={defect.image_url}
                  alt="Kỳ này mốc chuẩn"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute border-2 border-[#C9A227] bg-[#C9A227]/20 rounded pointer-events-none"
                  style={{
                    left: `${defect.bounding_box.x * 100}%`,
                    top: `${defect.bounding_box.y * 100}%`,
                    width: `${defect.bounding_box.width * 100}%`,
                    height: `${defect.bounding_box.height * 100}%`
                  }}
                >
                  <span className="bg-[#C9A227] text-white text-[9px] font-bold px-1 py-0.2 rounded absolute -top-3.5 left-0">
                    Mốc gốc Baseline ({defect.defect_type})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-950">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Cơ chế quản lý dữ liệu Baseline T0:</span>
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Do đây là lần đầu ghi nhận hư hỏng tại vị trí Km này, hệ thống sẽ tự động <strong>lưu tọa độ và ảnh chụp kỳ này làm mốc chuẩn (Baseline)</strong>. Trong các kỳ bay drone tiếp theo (T+1, T+2), AI sẽ đối chiếu song song với mốc này để phân tích tốc độ phát triển hư hỏng.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
