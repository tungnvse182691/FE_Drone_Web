import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MeasurementValidationSample,
  MeasurementValidationRun
} from '../../types/domain'
import {
  validationService,
  AsyncValidationJob,
  ValidationProjectOption,
  VALIDATION_PROJECT_OPTIONS
} from '../../api/services'
import { ResearchHeader } from './research/ResearchHeader'
import { AsyncValidationJobBanner } from './research/AsyncValidationJobBanner'

export const ResearchValidation: React.FC = () => {
  // Scope Dự án (Phục vụ PM được giao 1 hoặc nhiều dự án)
  const [selectedProject, setSelectedProject] = useState<string>('prj-ql1a-02')
  const projectOptions: ValidationProjectOption[] = VALIDATION_PROJECT_OPTIONS

  // Loading & In-Memory Data State
  const [loading, setLoading] = useState<boolean>(true)
  const [activeRun, setActiveRun] = useState<MeasurementValidationRun | null>(null)
  const [samples, setSamples] = useState<MeasurementValidationSample[]>([])
  const [runs, setRuns] = useState<MeasurementValidationRun[]>([])
  const [activeJob, setActiveJob] = useState<AsyncValidationJob | null>(null)

  // Filter & Interaction State
  const [sampleFilter, setSampleFilter] = useState<'ALL' | 'INCLUDED' | 'EXCLUDED' | 'OUTLIER'>('ALL')
  const [isRunningVal, setIsRunningVal] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }, [])

  // Tải dữ liệu bất đồng bộ từ validationService (In-Memory Mock API)
  const loadData = useCallback(async (projId: string) => {
    try {
      setLoading(true)
      const res = await validationService.getValidationOverview(projId)
      setActiveRun(res.activeRun)
      setSamples(res.samples)
      setRuns(res.runs)
      setActiveJob(res.activeJob)
    } catch {
      showToast('Có lỗi khi tải dữ liệu kiểm định thực nghiệm.')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadData(selectedProject)
  }, [loadData, selectedProject])

  // Xử lý khi PM chuyển dự án
  const handleSelectProject = (newProjId: string) => {
    setSelectedProject(newProjId)
    const targetProj = projectOptions.find((p) => p.id === newProjId)
    showToast(`Đã chuyển sang tập dữ liệu kiểm nghiệm: ${targetProj?.name || newProjId}`)
  }

  // Tiến trình mô phỏng chạy Async Job tự động (5% -> 35% -> 70% -> 100%)
  useEffect(() => {
    if (!activeJob || activeJob.status !== 'RUNNING') return

    const timer = setInterval(() => {
      setActiveJob((prev) => {
        if (!prev) return null
        if (prev.progress >= 100) {
          clearInterval(timer)
          return prev
        }
        const nextProgress = Math.min(100, prev.progress + 30)
        if (nextProgress >= 100) {
          clearInterval(timer)

          // Đồng bộ cập nhật trạng thái đợt chạy sang HOÀN TẤT
          setActiveRun((r) => (r ? { ...r, status: 'COMPLETED', progress_percent: 100 } : null))
          setRuns((prevRuns) =>
            prevRuns.map((r) =>
              r.status === 'RUNNING' ? { ...r, status: 'COMPLETED', progress_percent: 100 } : r
            )
          )
          validationService.completeValidationRun()

          showToast(`Tiến trình kiểm định ${prev.code} đã hoàn tất ghép cặp 100%! Đợt chạy đã chuyển sang HOÀN TẤT.`)
          setTimeout(() => {
            setActiveJob(null)
          }, 1800)
          return { ...prev, progress: 100, status: 'COMPLETED' }
        }
        return { ...prev, progress: nextProgress }
      })
    }, 1200)

    return () => clearInterval(timer)
  }, [activeJob?.id, activeJob?.status, showToast])

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
    if (validCount === 0) return activeRun?.bias ?? 0
    return validSamples.reduce((sum, s) => sum + s.signed_error, 0) / validCount
  }, [validSamples, validCount, activeRun?.bias])

  const mae = useMemo(() => {
    if (validCount === 0) return activeRun?.mae ?? 0
    return validSamples.reduce((sum, s) => sum + s.absolute_error, 0) / validCount
  }, [validSamples, validCount, activeRun?.mae])

  const rmse = useMemo(() => {
    if (validCount === 0) return activeRun?.rmse ?? 0
    return Math.sqrt(
      validSamples.reduce((sum, s) => sum + Math.pow(s.signed_error, 2), 0) / validCount
    )
  }, [validSamples, validCount, activeRun?.rmse])

  // Lọc mẫu đo đạc theo trạng thái
  const filteredSamples = useMemo(() => {
    if (sampleFilter === 'ALL') return samples
    return samples.filter((s) => s.inclusion_status === sampleFilter)
  }, [sampleFilter, samples])

  // Xử lý nút Chạy kiểm định mới (HTTP 202 - FR-31)
  const handleTriggerValidation = async () => {
    try {
      setIsRunningVal(true)
      const { job, run } = await validationService.triggerValidationRun(selectedProject)
      setActiveJob(job)
      setActiveRun(run)
      setRuns((prev) => [run, ...prev])
      showToast(`Đã khởi tạo đợt kiểm định ${job.code} đối soát mẫu thực địa (HTTP 202)!`)
    } catch {
      showToast('Có lỗi khi khởi tạo đợt kiểm định.')
    } finally {
      setIsRunningVal(false)
    }
  }

  // Xử lý hủy tiến trình nền
  const handleCancelJob = async () => {
    if (!activeJob) return
    try {
      await validationService.cancelValidationJob(activeJob.id)
      setActiveJob(null)
      showToast('Đã dừng an toàn tiến trình kiểm định nền.')
    } catch {
      showToast('Không thể hủy tác vụ.')
    }
  }

  // Xử lý nút Xuất CSV theo quy chuẩn RPT-09 (RS06)
  const handleExportGroundTruth = async () => {
    try {
      setIsExporting(true)
      const { fileName, csvContent, totalRows } =
        await validationService.exportValidationCsv(selectedProject)

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast(`Đã xuất thành công ${totalRows} mẫu đối soát sang file CSV!`)
    } catch {
      showToast('Có lỗi khi trích xuất dữ liệu CSV.')
    } finally {
      setIsExporting(false)
    }
  }

  const formatMeasurementType = (type: string) => {
    switch (type) {
      case 'DEPRESSION_DEPTH':
        return 'Đo độ sâu lún võng'
      case 'SLAB_FAULTING_HEIGHT':
        return 'Đo chênh cốt mép tấm'
      case 'SHOULDER_EROSION_EXTENT':
        return 'Đo xói lở lề đường'
      default:
        return type
    }
  }

  if (loading || !activeRun) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-100 rounded-xl" />
          <div className="h-28 bg-slate-100 rounded-xl" />
          <div className="h-28 bg-slate-100 rounded-xl" />
          <div className="h-28 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-96 bg-slate-100 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-[#1E293B]">
      {/* 1. Header, Dropdown chọn dự án & Active Model Specs */}
      <ResearchHeader
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        projectOptions={projectOptions}
        activeRun={activeRun}
        isExporting={isExporting}
        isRunningVal={isRunningVal}
        onExport={handleExportGroundTruth}
        onTriggerValidation={handleTriggerValidation}
      />

      {/* 2. Banner Async Job 202 Đang chạy */}
      {activeJob && (
        <AsyncValidationJobBanner
          valProgress={activeJob.progress}
          onCancel={handleCancelJob}
        />
      )}

      {/* 3. BỘ 4 THẺ CHỈ SỐ SAI SỐ KỸ THUẬT MET-12 CÓ ĐIỂM NHẤN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Mẫu hợp lệ kiểm định (#047857 Emerald) */}
        <div className="relative rounded-[20px] border-[1.5px] border-[#047857]/25 bg-gradient-to-b from-[#047857]/[0.04] via-white/50 to-white p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(4,120,87,0.15)] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] to-emerald-200" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#047857] ring-4 ring-[#047857]/20" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mẫu hợp lệ kiểm định
                </span>
              </div>
              <span className="px-[10px] py-[3px] rounded-full text-[11px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200">
                {validCount}/{totalCount} cặp
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-sansation text-slate-900 tracking-tight">
                {validRatio}%
              </span>
              <span className="text-xs text-slate-500 font-medium">tỷ lệ hợp lệ</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-medium">
            <span>Bị loại: <strong className="text-rose-600 font-bold">{excludedCount}</strong> mẫu</span>
            <span className="text-slate-600 font-semibold">Quy chuẩn DD-C09</span>
          </div>
        </div>

        {/* KPI 2: Độ lệch trung bình (Bias) (#1E40AF Blue) */}
        <div className="relative rounded-[20px] border-[1.5px] border-[#1E40AF]/25 bg-gradient-to-b from-[#1E40AF]/[0.04] via-white/50 to-white p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(30,64,175,0.15)] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] to-blue-200" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Độ lệch trung bình
                </span>
              </div>
              <span className="px-[10px] py-[3px] rounded-full text-[11px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200 font-mono">
                Bias
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-sansation text-slate-900 tracking-tight">
                {bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100 font-medium line-clamp-1" title={bias > 0 ? `Ước lượng sâu hơn thực tế ${Math.abs(bias).toFixed(1)} mm` : `Ước lượng nông hơn thực tế ${Math.abs(bias).toFixed(1)} mm`}>
            {bias > 0
              ? `Ước lượng sâu hơn thực tế ${Math.abs(bias).toFixed(1)} mm`
              : `Ước lượng nông hơn thực tế ${Math.abs(bias).toFixed(1)} mm`}
          </div>
        </div>

        {/* KPI 3: Sai số tuyệt đối trung bình (MAE) (#047857 Emerald / #B45309 Amber) */}
        <div className="relative rounded-[20px] border-[1.5px] border-[#047857]/25 bg-gradient-to-b from-[#047857]/[0.04] via-white/50 to-white p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(4,120,87,0.15)] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] to-emerald-200" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#047857] ring-4 ring-[#047857]/20" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sai số tuyệt đối
                </span>
              </div>
              <span className="px-[10px] py-[3px] rounded-full text-[11px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200 font-mono">
                MAE
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-sansation text-slate-900 tracking-tight">
                {mae.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
            </div>
          </div>
          <div className="text-[11px] text-[#047857] mt-4 pt-3 border-t border-slate-100 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            <span>Đạt nghiệm thu (&lt; 5.0 mm)</span>
          </div>
        </div>

        {/* KPI 4: Căn sai số toàn phương (RMSE) (#C9A227 Gold) */}
        <div className="relative rounded-[20px] border-[1.5px] border-[#C9A227]/30 bg-gradient-to-b from-[#C9A227]/[0.04] via-white/50 to-white p-5 shadow-2xs overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(201,162,39,0.15)] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] to-amber-200" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Căn sai số toàn phương
                </span>
              </div>
              <span className="px-[10px] py-[3px] rounded-full text-[11px] font-bold bg-amber-50 text-[#B45309] border border-amber-200 font-mono">
                RMSE
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-sansation text-slate-900 tracking-tight">
                {rmse.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-bold font-mono">mm</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-medium">
            <span>Độ không đảm bảo:</span>
            <span className="font-bold text-slate-800 font-mono">±{activeRun.uncertainty_value} mm</span>
          </div>
        </div>
      </div>

      {/* 4. BẢNG 1: ĐỐI SOÁT CẶP MẪU THỰC ĐỊA & AI (BỌC THẺ BO 20PX, THEAD #F8F9FA, HÀNG HOVER) */}
      <div className="relative rounded-[20px] border border-[#E2E5E9] bg-white shadow-2xs overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] to-slate-200" />
        
        {/* Header bảng & Bộ lọc */}
        <div className="p-5 border-b border-[#EDEFF2] flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
                <h2 className="text-base font-bold text-slate-900">
                  Bảng Đối Soát Cặp Mẫu: Số Đo Thực Địa &amp; Số Đo Mô Hình AI
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Căn cứ quy chuẩn RS01–RS06: Mỗi mẫu có mã định danh duy nhất, ghi rõ dụng cụ đo cơ học và kỹ sư thực hiện
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-900">{filteredSamples.length}</strong> / {samples.length} mẫu kiểm định
            </div>
          </div>

          {/* Bộ lọc trạng thái mẫu dạng Pill */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-bold text-slate-600 mr-1">Lọc trạng thái:</span>
            {(['ALL', 'INCLUDED', 'EXCLUDED', 'OUTLIER'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSampleFilter(st)}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  sampleFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs ring-2 ring-slate-900/10'
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
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EDEFF2] select-none">
              <tr>
                <th className="py-3 px-4">MÃ MẪU</th>
                <th className="py-3 px-4">LOẠI HƯ HỎNG</th>
                <th className="py-3 px-4">LÝ TRÌNH</th>
                <th className="py-3 px-4 text-right">THỰC ĐỊA (MM)</th>
                <th className="py-3 px-4 text-right">TRÍCH XUẤT AI (MM)</th>
                <th className="py-3 px-4 text-right">SAI SỐ (MM)</th>
                <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-4">DỤNG CỤ ĐO &amp; KỸ SƯ THỰC HIỆN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF2]">
              {filteredSamples.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {s.sample_id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {s.defect_name_vi}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    Km{s.chainage_km.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#047857] font-mono">
                    {s.ground_truth_value.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#1E40AF] font-mono">
                    {s.derived_value.toFixed(1)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      Math.abs(s.signed_error) > 5 ? 'text-[#B91C1C]' : 'text-slate-700'
                    }`}
                  >
                    {s.signed_error > 0 ? `+${s.signed_error.toFixed(1)}` : s.signed_error.toFixed(1)} mm
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.inclusion_status === 'INCLUDED' && (
                      <span className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200">
                        HỢP LỆ
                      </span>
                    )}
                    {s.inclusion_status === 'EXCLUDED' && (
                      <span
                        className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-rose-50 text-[#B91C1C] border border-rose-200"
                        title={s.exclusion_reason}
                      >
                        BỊ LOẠI
                      </span>
                    )}
                    {s.inclusion_status === 'OUTLIER' && (
                      <span
                        className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-amber-50 text-[#B45309] border border-amber-200"
                        title={s.exclusion_reason}
                      >
                        NGOẠI LAI
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{s.instrument_name}</div>
                    <div className="text-[11px] text-slate-500">{s.measured_by}</div>
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
      </div>

      {/* 5. BẢNG 2: LỊCH SỬ CÁC ĐỢT KIỂM ĐỊNH THỰC NGHIỆM (BỌC THẺ BO 20PX, THEAD #F8F9FA, HÀNG HOVER) */}
      <div className="relative rounded-[20px] border border-[#E2E5E9] bg-white shadow-2xs overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] to-slate-200" />
        
        {/* Header bảng */}
        <div className="p-5 border-b border-[#EDEFF2]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
            <h2 className="text-base font-bold text-slate-900">
              Lịch Sử Các Đợt Kiểm Định Thực Nghiệm (FR-31 / MET-12)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lưu vết đối soát số đo hình học theo từng phiên bản mô hình và đợt khảo sát hiện trường (BR-44)
          </p>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EDEFF2] select-none">
              <tr>
                <th className="py-3 px-4">MÃ ĐỢT KIỂM ĐỊNH</th>
                <th className="py-3 px-4">MÔ HÌNH &amp; PHƯƠNG PHÁP ĐO</th>
                <th className="py-3 px-4">TẬP MẪU ĐỐI SOÁT</th>
                <th className="py-3 px-4 text-center">NGUỒN DỮ LIỆU</th>
                <th className="py-3 px-4 text-center">MẪU ĐẠT / LOẠI</th>
                <th className="py-3 px-4 text-right">BIAS (MM)</th>
                <th className="py-3 px-4 text-right">MAE (MM)</th>
                <th className="py-3 px-4 text-right">RMSE (MM)</th>
                <th className="py-3 px-4">NGƯỜI KÍCH HOẠT &amp; THỜI GIAN</th>
                <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF2]">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#C9A227]">analytics</span>
                      <span>{r.run_code}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {formatMeasurementType(r.measurement_type)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{r.algorithm_version}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1" title={r.method_name}>
                      {r.method_name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-700">{r.dataset_name}</div>
                    <div className="text-[10px] text-slate-500">
                      Tổng số: {r.sample_count} cặp đối soát
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.is_mock_data ? (
                      <span className="px-[12px] py-[4px] rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        GIẢ LẬP
                      </span>
                    ) : (
                      <span className="px-[12px] py-[4px] rounded-full text-[10px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200">
                        THỰC ĐỊA
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-[#047857] font-mono">{r.used_count}</span>
                    <span className="text-slate-400"> / </span>
                    <span className="font-semibold text-[#B91C1C] font-mono">{r.excluded_count} loại</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#1E40AF]">
                    {r.bias > 0 ? `+${r.bias.toFixed(1)}` : r.bias.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-purple-700">
                    {r.mae.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#B45309]">
                    {r.rmse.toFixed(1)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-700">{r.triggered_by_name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      <span>{r.executed_at}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.status === 'COMPLETED' && (
                      <span className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200">
                        HOÀN TẤT
                      </span>
                    )}
                    {r.status === 'RUNNING' && (
                      <span className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-amber-50 text-[#B45309] border border-amber-200">
                        ĐANG XỬ LÝ (202)
                      </span>
                    )}
                    {r.status === 'FAILED' && (
                      <span className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-rose-50 text-[#B91C1C] border border-rose-200">
                        THẤT BÀI
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Minimalist Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-slate-700 pointer-events-auto transition">
          <span className="material-symbols-outlined text-[16px] text-[#C9A227]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default ResearchValidation

