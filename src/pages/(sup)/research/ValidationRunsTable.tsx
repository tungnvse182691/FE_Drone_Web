import React from 'react'
import { Card } from '../../../components/ui/Card'
import { MeasurementValidationRun } from '../../../types/domain'

interface ValidationRunsTableProps {
  runs: MeasurementValidationRun[]
}

export const ValidationRunsTable: React.FC<ValidationRunsTableProps> = ({ runs }) => {
  return (
    <Card
      title="Lịch Sử Các Đợt Chạy Kiểm Định Thực Nghiệm (Validation Runs - FR-31 / MET-12)"
      subtitle="Lưu vết các đợt chạy ghép cặp đối soát số đo hình học theo từng phiên bản thuật toán/mô hình (BR-44)"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Mã Đợt Chạy (Run Code)</th>
              <th className="py-2.5 px-3">Thuật Toán &amp; Phương Pháp Đo</th>
              <th className="py-2.5 px-3">Tập Mẫu Đối Soát</th>
              <th className="py-2.5 px-3 text-center">Nguồn Dữ Liệu (BR-44)</th>
              <th className="py-2.5 px-3 text-center">Mẫu Dùng / Loại</th>
              <th className="py-2.5 px-3 text-right">Bias (mm)</th>
              <th className="py-2.5 px-3 text-right">MAE (mm)</th>
              <th className="py-2.5 px-3 text-right">RMSE (mm)</th>
              <th className="py-2.5 px-3">Người Kích Hoạt &amp; Thời Gian</th>
              <th className="py-2.5 px-3 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-brand-gold">analytics</span>
                    <span>{r.run_code}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {r.measurement_type}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-800">{r.algorithm_version}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1" title={r.method_name}>
                    {r.method_name}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-700">{r.dataset_name}</div>
                  <div className="text-[10px] text-slate-400">
                    Tổng số: {r.sample_count} cặp đối soát
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {r.is_mock_data ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      GIẢ LẬP (MOCK)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      THỰC ĐỊA (REAL)
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="font-bold text-emerald-700 font-mono">{r.used_count}</span>
                  <span className="text-slate-400"> / </span>
                  <span className="font-semibold text-rose-600 font-mono">{r.excluded_count} loại</span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                  {r.bias > 0 ? `+${r.bias.toFixed(1)}` : r.bias.toFixed(1)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700">
                  {r.mae.toFixed(1)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                  {r.rmse.toFixed(1)}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-700">{r.triggered_by_name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    <span>{r.executed_at}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {r.status === 'COMPLETED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      HOÀN TẤT
                    </span>
                  )}
                  {r.status === 'RUNNING' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      ĐANG CHẠY 202
                    </span>
                  )}
                  {r.status === 'FAILED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      THẤT BÀI
                    </span>
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
