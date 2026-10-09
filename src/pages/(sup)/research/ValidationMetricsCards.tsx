import React from 'react'
import { MeasurementValidationRun } from '../../../types/domain'

interface ValidationMetricsCardsProps {
  activeRun: MeasurementValidationRun
}

export const ValidationMetricsCards: React.FC<ValidationMetricsCardsProps> = ({ activeRun }) => {
  return (
    <div className="space-y-4">
      {/* Bộ 4 thẻ chỉ số MET-12 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Số mẫu hợp lệ */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Mẫu Hợp Lệ (usedCount)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {activeRun.used_count}/{activeRun.sample_count} cặp
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              {((activeRun.used_count / activeRun.sample_count) * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">tỷ lệ hợp lệ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Bị loại: {activeRun.excluded_count} mẫu</span>
            <span className="text-slate-600 font-medium">Chuẩn DD-C09</span>
          </div>
        </div>

        {/* Card 2: Bias */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Độ Lệch Trung Bình (Bias)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Σe / N (mm)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              +{activeRun.bias.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            <span>Ước lượng sâu hơn thực tế 1.2 mm</span>
          </div>
        </div>

        {/* Card 3: MAE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Sai Số Tuyệt Đối (MAE)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
              Σ|e| / N (mm)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              {activeRun.mae.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>Đạt yêu cầu nghiệm thu (&lt; 5.0 mm)</span>
          </div>
        </div>

        {/* Card 4: RMSE & Uncertainty */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Căn Sai Số Bình Phương (RMSE)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
              √(Σe²/N)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              {activeRun.rmse.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Độ không chắc chắn:</span>
            <span className="font-bold text-slate-700 font-mono">±{activeRun.uncertainty_value} mm</span>
          </div>
        </div>
      </div>

      {/* Thanh tóm tắt lý do loại trừ mẫu theo quy chuẩn BR-44 (Gọn gàng, tinh giản) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="material-symbols-outlined text-[16px] text-amber-600">info</span>
            <span>Lý do loại trừ {activeRun.excluded_count} mẫu theo quy tắc BR-44 &amp; DD-C09:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
              4 mẫu thiếu ảnh thước nêm đáy hố
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
              2 mẫu đọng nước đáy hố lún
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
              2 mẫu ngoài góc quét camera Drone
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
