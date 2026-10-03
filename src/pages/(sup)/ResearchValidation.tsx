import React, { useState, useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  mockMeasurementValidationSamples,
  mockActiveValidationRun,
  mockMeasurementValidationRuns
} from '../../api/mock/data'
import {
  MeasurementValidationSample,
  MeasurementValidationRun
} from '../../types/domain'
import {
  Download,
  PlayCircle,
  RefreshCw,
  Verified,
  Sparkles,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  History,
  Clock,
  Layers,
  Activity
} from 'lucide-react'

export const ResearchValidation: React.FC = () => {
  const { user } = useAuthStore()
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // State cho Bảng Đo đạc thực nghiệm (RS01-RS06 & MET-12)
  const [sampleFilter, setSampleFilter] = useState<'ALL' | 'INCLUDED' | 'EXCLUDED' | 'OUTLIER'>('ALL')
  const [samples] = useState<MeasurementValidationSample[]>(mockMeasurementValidationSamples)
  const [runs] = useState<MeasurementValidationRun[]>(mockMeasurementValidationRuns)

  // State cho việc chạy kiểm định mới (Async Job HTTP 202 - FR-31)
  const [isRunningVal, setIsRunningVal] = useState<boolean>(false)
  const [valProgress] = useState<number>(42)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Lọc mẫu đo đạc theo trạng thái
  const filteredSamples = useMemo(() => {
    if (sampleFilter === 'ALL') return samples
    return samples.filter((s) => s.inclusion_status === sampleFilter)
  }, [sampleFilter, samples])

  // Xử lý nút Chạy kiểm định mới (POST /projects/{projectId}/validation-runs -> 202 Job)
  const handleTriggerValidation = () => {
    setIsRunningVal(true)
    setTimeout(() => {
      setIsRunningVal(false)
      alert(
        'Đã gửi yêu cầu chạy kiểm định thực nghiệm mới (HTTP 202 Accepted theo FR-31).\nTiến trình nền Job #VAL-2026-10 đang được xếp hàng xử lý tính toán ghép cặp mẫu Ground Truth.'
      )
    }, 1500)
  }

  // Xử lý nút Xuất CSV theo quy chuẩn RPT-09 (RS06)
  const handleExportGroundTruth = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      const headers = 'Sample_ID,Defect_Type,Chainage_KM,Ground_Truth_mm,Derived_AI_mm,Signed_Error_mm,Absolute_Error_mm,Status,Exclusion_Reason,Instrument,Measured_By\n'
      const rows = mockMeasurementValidationSamples.map((s) =>
        `"${s.sample_id}","${s.defect_name_vi}","Km${s.chainage_km}",${s.ground_truth_value},${s.derived_value},${s.signed_error},${s.absolute_error},"${s.inclusion_status}","${s.exclusion_reason || ''}","${s.instrument_name}","${s.measured_by}"`
      ).join('\n')

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'RPT-09-Research-Validation-Paired-Data-v2.2.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 800)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Active Model Specs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Hệ thống báo cáo</span>
            <span>/</span>
            <span className="text-brand-goldDark font-semibold">RPT-09: Báo cáo thực nghiệm (Research Validation)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Chuẩn v2.2 (FR-31 / BR-44)
            </span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
            Báo Cáo Nghiên Cứu & Kiểm Chứng Thực Nghiệm (RPT-09)
            <Sparkles className="w-5 h-5 text-brand-gold" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đối soát kết quả ghép cặp giữa số đo thực tế (Ground Truth) và số đo mô hình (Derived) — Tính toán Bias, MAE, RMSE theo RS01–RS06, BR-44, MET-12
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportGroundTruth}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
            title="Xuất bảng đối soát số đo thực tế và dự đoán AI theo quy chuẩn RPT-09"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isExporting ? 'Đang kết xuất...' : 'Xuất CSV Dữ Liệu Đối Soát'}</span>
          </button>

          <button
            onClick={handleTriggerValidation}
            disabled={isRunningVal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-brand-navy hover:bg-slate-800 shadow-md transition-all disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4 text-brand-gold" />
            <span>{isRunningVal ? 'Đang khởi tạo Job...' : 'Chạy Thẩm Định Mới'}</span>
          </button>
        </div>
      </div>

      {/* Model & Dataset Metadata Ribbon */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Mô hình AI:</span>
            <span className="font-bold text-brand-dark">{mockActiveValidationRun.algorithm_version}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              {mockActiveValidationRun.run_code}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tập dữ liệu:</span>
            <span className="font-semibold text-slate-700">{mockActiveValidationRun.dataset_name}</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Phương pháp đo:</span>
            <span className="font-semibold text-slate-700">Thước thẳng 3m & Thước đo sâu điện tử (Straightedge/Depth gauge)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Verified className="w-3.5 h-3.5" />
            {mockActiveValidationRun.is_mock_data ? 'Dữ liệu Giả Lập (MOCK)' : 'Dữ Liệu Thực Địa (REAL - BR-44)'}
          </span>
          <span className="text-[11px] text-slate-400">
            Cập nhật: {mockActiveValidationRun.executed_at}
          </span>
        </div>
      </div>

      {/* 2. Banner Async Job 202 Đang chạy */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center text-brand-goldDark flex-shrink-0 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-dark">Tiến trình kiểm nghiệm nền: Job #VAL-2026-09</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                HTTP 202 ACCEPTED (FR-31)
              </span>
            </div>
            <div className="text-slate-500 mt-0.5">
              Đang đối soát ma trận ghép cặp trên đoạn Km14 - Km22 (Đã hoàn thành {valProgress}%)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-36 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-brand-gold h-2 rounded-full transition-all duration-500" style={{ width: `${valProgress}%` }} />
          </div>
          <span className="font-bold text-brand-dark">{valProgress}%</span>
          <button
            onClick={() => alert('Đã hủy tiến trình an toàn!')}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline ml-2"
          >
            Hủy tiến trình
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ĐỐI SOÁT SỐ ĐO THỰC NGHIỆM (RS01-RS06 & MET-12) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
          {/* Bộ 4 thẻ chỉ số MET-12 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Số mẫu hợp lệ */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Mẫu Hợp Lệ (usedCount)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {mockActiveValidationRun.used_count}/{mockActiveValidationRun.sample_count} cặp
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-brand-dark">
                  {((mockActiveValidationRun.used_count / mockActiveValidationRun.sample_count) * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-medium">tỷ lệ hợp lệ</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Bị loại: {mockActiveValidationRun.excluded_count} mẫu</span>
                <span className="text-amber-700 font-medium">Theo chuẩn DD-C09</span>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            </div>

            {/* Card 2: Bias (Độ lệch trung bình) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Độ Lệch Trung Bình (Bias)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  Σe / N (mm)
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-brand-navy">
                  +{mockActiveValidationRun.bias.toFixed(1)}
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
                  {mockActiveValidationRun.mae.toFixed(1)}
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
                  {mockActiveValidationRun.rmse.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-bold">mm</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Độ không chắc chắn:</span>
                <span className="font-bold text-slate-700">±{mockActiveValidationRun.uncertainty_value} mm</span>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            </div>
          </div>

          {/* Cảnh báo quy tắc BR-44 về Mẫu bị loại */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs text-rose-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Quy tắc thẩm định BR-44 & DD-C09 về Mẫu bị loại (Exclusion Reasons):</span>
            </div>
            <p className="text-rose-700 leading-relaxed">
              Tổng số <strong>{mockActiveValidationRun.excluded_count} mẫu</strong> không đủ điều kiện đưa vào tính toán sai số khoa học. Lý do bao gồm: 
              4 mẫu chụp thiếu ảnh thước nêm đặt sát đáy hố sụt (vi phạm quy định bắt buộc DD-C09); 
              2 mẫu đọng nước che khuất đáy hố lún không thể đo quang học; 
              2 mẫu nằm ngoài góc quét chuẩn của camera Drone. Theo quy chuẩn đề cương nghiên cứu, các mẫu này bị loại bỏ hoàn toàn, không được gộp vào mẫu số làm đẹp số liệu.
            </p>
          </div>

          {/* Bảng danh sách các cặp mẫu Ground Truth vs Derived AI */}
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
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                        Math.abs(s.signed_error) > 5 ? 'text-rose-600' : 'text-slate-700'
                      }`}>
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

          {/* ========================================================================= */}
          {/* LỊCH SỬ CÁC ĐỢT CHẠY KIỂM ĐỊNH THỰC NGHIỆM (FR-31 / MET-12) */}
          {/* ========================================================================= */}
          <Card
            title="Lịch Sử Các Đợt Chạy Kiểm Định Thực Nghiệm (Validation Runs - FR-31 / MET-12)"
            subtitle="Lưu vết các đợt chạy ghép cặp đối soát số đo hình học theo từng phiên bản thuật toán/mô hình (BR-44)"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Mã Đợt Chạy (Run Code)</th>
                    <th className="py-2.5 px-3">Thuật Toán & Phương Pháp Đo</th>
                    <th className="py-2.5 px-3">Tập Mẫu Đối Soát</th>
                    <th className="py-2.5 px-3 text-center">Nguồn Dữ Liệu (BR-44)</th>
                    <th className="py-2.5 px-3 text-center">Mẫu Dùng / Loại</th>
                    <th className="py-2.5 px-3 text-right">Bias (mm)</th>
                    <th className="py-2.5 px-3 text-right">MAE (mm)</th>
                    <th className="py-2.5 px-3 text-right">RMSE (mm)</th>
                    <th className="py-2.5 px-3">Người Kích Hoạt & Thời Gian</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-brand-dark flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-brand-gold" />
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
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                            GIẢ LẬP (MOCK)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
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
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{r.executed_at}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.status === 'COMPLETED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            HOÀN TẤT
                          </span>
                        )}
                        {r.status === 'RUNNING' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            ĐANG CHẠY 202
                          </span>
                        )}
                        {r.status === 'FAILED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
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
        </div>
    </div>
  )
}

export default ResearchValidation
