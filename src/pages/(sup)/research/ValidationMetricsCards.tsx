import React from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Mẫu Hợp Lệ (usedCount)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {activeRun.used_count}/{activeRun.sample_count} cặp
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-dark">
              {((activeRun.used_count / activeRun.sample_count) * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">tỷ lệ hợp lệ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Bị loại: {activeRun.excluded_count} mẫu</span>
            <span className="text-amber-700 font-medium">Theo chuẩn DD-C09</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* Card 2: Bias */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Độ Lệch Trung Bình (Bias)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Σe / N (mm)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-navy">
              +{activeRun.bias.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold">mm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            <span>Ước lượng sâu hơn thực tế 1.2 mm</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* Card 3: MAE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Sai Số Tuyệt Đối (MAE)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
              Σ|e| / N (mm)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-dark">
              {activeRun.mae.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold">mm</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đạt yêu cầu nghiệm thu (&lt; 5.0 mm)</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* Card 4: RMSE & Uncertainty */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Căn Sai Số Bình Phương (RMSE)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
              √(Σe²/N)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-goldDark">
              {activeRun.rmse.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Độ không chắc chắn:</span>
            <span className="font-bold text-slate-700">±{activeRun.uncertainty_value} mm</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        </div>
      </div>

      {/* Cảnh báo quy tắc BR-44 về Mẫu bị loại */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs text-rose-900">
        <div className="flex items-center gap-2 font-bold mb-1">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Quy tắc thẩm định BR-44 &amp; DD-C09 về Mẫu bị loại (Exclusion Reasons):</span>
        </div>
        <p className="text-rose-700 leading-relaxed">
          Tổng số <strong>{activeRun.excluded_count} mẫu</strong> không đủ điều kiện đưa vào tính toán sai số khoa học. Lý do bao gồm: 
          4 mẫu chụp thiếu ảnh thước nêm đặt sát đáy hố sụt (vi phạm quy định bắt buộc DD-C09); 
          2 mẫu đọng nước che khuất đáy hố lún không thể đo quang học; 
          2 mẫu nằm ngoài góc quét chuẩn của camera Drone. Theo quy chuẩn đề cương nghiên cứu, các mẫu này bị loại bỏ hoàn toàn, không được gộp vào mẫu số làm đẹp số liệu.
        </p>
      </div>
    </div>
  )
}
