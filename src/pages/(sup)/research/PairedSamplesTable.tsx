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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Lọc trạng thái:</span>
          {(['ALL', 'INCLUDED', 'EXCLUDED', 'OUTLIER'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSampleFilter(st)}
              type="button"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                sampleFilter === st
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && `Tất cả (${samples.length})`}
              {st === 'INCLUDED' && `Hợp lệ (${samples.filter((s) => s.inclusion_status === 'INCLUDED').length})`}
              {st === 'EXCLUDED' && `Bị loại (${samples.filter((s) => s.inclusion_status === 'EXCLUDED').length})`}
              {st === 'OUTLIER' && `Ngoại lai (${samples.filter((s) => s.inclusion_status === 'OUTLIER').length})`}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          Hiển thị <strong>{filteredSamples.length}</strong> / {samples.length} mẫu
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Mã Mẫu (Sample ID)</th>
              <th className="py-2.5 px-3">Loại Hư Hỏng</th>
              <th className="py-2.5 px-3">Lý Trình</th>
              <th className="py-2.5 px-3 text-right">Ground Truth (mm)</th>
              <th className="py-2.5 px-3 text-right">Derived AI (mm)</th>
              <th className="py-2.5 px-3 text-right">Sai Số (e)</th>
              <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              <th className="py-2.5 px-3">Dụng Cụ Đo &amp; Kỹ Sư Đo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSamples.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                  {s.sample_id}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-800">
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
                <td className="py-2.5 px-3 text-center">
                  {s.inclusion_status === 'INCLUDED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      HỢP LỆ
                    </span>
                  )}
                  {s.inclusion_status === 'EXCLUDED' && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                      title={s.exclusion_reason}
                    >
                      BỊ LOẠI
                    </span>
                  )}
                  {s.inclusion_status === 'OUTLIER' && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                      title={s.exclusion_reason}
                    >
                      NGOẠI LAI
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  <div className="font-medium text-slate-800">{s.instrument_name}</div>
                  <div className="text-[11px] text-slate-400">{s.measured_by}</div>
                  {s.exclusion_reason && (
                    <div className="text-[11px] text-rose-600 mt-0.5">
                      Lý do: {s.exclusion_reason}
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
