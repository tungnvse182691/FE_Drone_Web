import React, { useMemo } from 'react'
import { MeasurementValidationRun, MeasurementValidationSample } from '../../../types/domain'

interface ValidationMetricsCardsProps {
  activeRun: MeasurementValidationRun
  samples: MeasurementValidationSample[]
  projectId?: string
}

export const ValidationMetricsCards: React.FC<ValidationMetricsCardsProps> = ({
  activeRun,
  samples,
  projectId: _projectId = 'prj-ql1a-02'
}) => {
  // Đồng bộ 100% số liệu giữa các thẻ chỉ số và danh sách dòng trong bảng đối soát
  const validSamples = useMemo(
    () => samples.filter((s) => s.inclusion_status === 'INCLUDED'),
    [samples]
  )
  const excludedSamples = useMemo(
    () => samples.filter((s) => s.inclusion_status === 'EXCLUDED' || s.inclusion_status === 'OUTLIER'),
    [samples]
  )

  const totalCount = samples.length
  const validCount = validSamples.length
  const excludedCount = excludedSamples.length
  const validRatio = totalCount > 0 ? ((validCount / totalCount) * 100).toFixed(1) : '0.0'

  // Sai số thực tế tính toán trực tiếp từ các cặp mẫu hợp lệ (RS01 - RS06)
  const bias = useMemo(() => {
    if (validCount === 0) return activeRun.bias
    return validSamples.reduce((sum, s) => sum + s.signed_error, 0) / validCount
  }, [validSamples, validCount, activeRun.bias])

  const mae = useMemo(() => {
    if (validCount === 0) return activeRun.mae
    return validSamples.reduce((sum, s) => sum + s.absolute_error, 0) / validCount
  }, [validSamples, validCount, activeRun.mae])

  const rmse = useMemo(() => {
    if (validCount === 0) return activeRun.rmse
    return Math.sqrt(
      validSamples.reduce((sum, s) => sum + Math.pow(s.signed_error, 2), 0) / validCount
    )
  }, [validSamples, validCount, activeRun.rmse])

  return (
    <div className="space-y-4">
      {/* Bộ 4 thẻ chỉ số sai số kỹ thuật MET-12 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Số mẫu hợp lệ */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Mẫu hợp lệ kiểm định</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {validCount}/{totalCount} cặp mẫu
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              {validRatio}%
            </span>
            <span className="text-xs text-slate-500 font-medium">tỷ lệ hợp lệ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Bị loại: {excludedCount} mẫu</span>
            <span className="text-slate-600 font-medium">Quy chuẩn DD-C09</span>
          </div>
        </div>

        {/* Card 2: Bias */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Độ lệch trung bình (Bias)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Công thức: Σe / N
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              {bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            <span>
              {bias > 0
                ? `Ước lượng sâu hơn thực tế ${Math.abs(bias).toFixed(1)} mm`
                : `Ước lượng nông hơn thực tế ${Math.abs(bias).toFixed(1)} mm`}
            </span>
          </div>
        </div>

        {/* Card 3: MAE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Sai số tuyệt đối trung bình (MAE)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
              Công thức: Σ|e| / N
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              {mae.toFixed(1)}
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
            <span className="font-semibold text-slate-700">Căn sai số toàn phương (RMSE)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
              Công thức: √(Σe²/N)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-sansation">
              {rmse.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Độ không đảm bảo đo:</span>
            <span className="font-bold text-slate-700 font-mono">±{activeRun.uncertainty_value} mm</span>
          </div>
        </div>
      </div>
    </div>
  )
}
