import React from 'react'
import { Card } from '../../../components/ui/Card'
import { MeasurementValidationSample } from '../../../types/domain'

interface PairedSamplesTableProps {
  samples: MeasurementValidationSample[]
  filteredSamples: MeasurementValidationSample[]
  sampleFilter: 'ALL' | 'INCLUDED' | 'EXCLUDED' | 'OUTLIER'
  setSampleFilter: (filter: 'ALL' | 'INCLUDED' | 'EXCLUDED' | 'OUTLIER') => void
}

export const PairedSamplesTable: React.FC<PairedSamplesTableProps> = ({
  samples,
  filteredSamples,
  sampleFilter,
  setSampleFilter
}) => {
  return (
    <Card
      title="Bảng Ghép Cặp Số Đo Thực Tế vs Số Đo AI (Paired Ground Truth Samples)"
      subtitle="Căn cứ RS01–RS06: Mỗi mẫu có sample_id duy nhất, ghi rõ dụng cụ đo cơ học và người thực hiện"
    >
      {/* Bộ lọc trạng thái mẫu */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Lọc trạng thái:</span>
          {(['ALL', 'INCLUDED', 'EXCLUDED', 'OUTLIER'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSampleFilter(st)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                sampleFilter === st
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && 'Tất cả (10 mẫu minh họa)'}
              {st === 'INCLUDED' && 'Hợp lệ (INCLUDED)'}
              {st === 'EXCLUDED' && 'Bị loại (EXCLUDED)'}
              {st === 'OUTLIER' && 'Ngoại lai (OUTLIER)'}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          Hiển thị <strong>{filteredSamples.length}</strong> / {samples.length} mẫu đại diện
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Mã Mẫu (Sample ID)</th>
              <th className="py-2.5 px-3">Loại Hư Hỏng</th>
              <th className="py-2.5 px-3">Lý Trình</th>
              <th className="py-2.5 px-3 text-right">Ground Truth (mm)</th>
              <th className="py-2.5 px-3 text-right">Derived AI (mm)</th>
              <th className="py-2.5 px-3 text-right">Sai Số (e)</th>
              <th className="py-2.5 px-3">Trạng Thái</th>
              <th className="py-2.5 px-3">Dụng Cụ Đo / Kỹ Sư Thực Hiện</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredSamples.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-brand-dark">
                  {s.sample_id}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-700">
                  {s.defect_name_vi}
                </td>
                <td className="py-2.5 px-3 text-slate-500 font-mono">
                  Km{s.chainage_km.toFixed(3)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">
                  {s.ground_truth_value.toFixed(1)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-blue-700 font-mono">
                  {s.derived_value.toFixed(1)}
                </td>
                <td
                  className={`py-2.5 px-3 text-right font-mono font-bold ${
                    Math.abs(s.signed_error) > 5 ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {s.signed_error > 0 ? `+${s.signed_error.toFixed(1)}` : s.signed_error.toFixed(1)} mm
                </td>
                <td className="py-2.5 px-3">
                  {s.inclusion_status === 'INCLUDED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      HỢP LỆ
                    </span>
                  )}
                  {s.inclusion_status === 'EXCLUDED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800" title={s.exclusion_reason}>
                      BỊ LOẠI
                    </span>
                  )}
                  {s.inclusion_status === 'OUTLIER' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800" title={s.exclusion_reason}>
                      NGOẠI LAI
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  <div>{s.instrument_name}</div>
                  <div className="text-[10px] text-slate-400">{s.measured_by}</div>
                  {s.exclusion_reason && (
                    <div className="text-[10px] text-rose-600 mt-0.5 italic">
                      * Lý do loại: {s.exclusion_reason}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
