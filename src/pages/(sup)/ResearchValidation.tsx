import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MeasurementValidationSample,
  MeasurementValidationRun
} from '../../types/domain'
import { validationService, AsyncValidationJob } from '../../api/services'
import { ResearchHeader } from './research/ResearchHeader'
import { AsyncValidationJobBanner } from './research/AsyncValidationJobBanner'
import { ValidationMetricsCards } from './research/ValidationMetricsCards'
import { PairedSamplesTable } from './research/PairedSamplesTable'
import { ValidationRunsTable } from './research/ValidationRunsTable'

export const ResearchValidation: React.FC = () => {
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
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await validationService.getValidationOverview()
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
    loadData()
  }, [loadData])

  // Lọc mẫu đo đạc theo trạng thái
  const filteredSamples = useMemo(() => {
    if (sampleFilter === 'ALL') return samples
    return samples.filter((s) => s.inclusion_status === sampleFilter)
  }, [sampleFilter, samples])

  // Xử lý nút Chạy kiểm định mới (HTTP 202 - FR-31)
  const handleTriggerValidation = async () => {
    try {
      setIsRunningVal(true)
      const { job, run } = await validationService.triggerValidationRun()
      setActiveJob(job)
      setActiveRun(run)
      setRuns((prev) => [run, ...prev])
      showToast(`Đã khởi tạo Job ${job.code} kiểm định mẫu Ground Truth (HTTP 202)!`)
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
      const { fileName, csvContent, totalRows } = await validationService.exportValidationCsv()

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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Active Model Specs */}
      <ResearchHeader
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

      {/* 3. Đối soát số đo thực nghiệm (RS01-RS06 & MET-12) */}
      <div className="space-y-6">
        <ValidationMetricsCards activeRun={activeRun} />

        <PairedSamplesTable
          samples={samples}
          filteredSamples={filteredSamples}
          sampleFilter={sampleFilter}
          setSampleFilter={setSampleFilter}
        />

        <ValidationRunsTable runs={runs} />
      </div>

      {/* 4. Minimalist Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-slate-700 pointer-events-auto transition">
          <span className="material-symbols-outlined text-[16px] text-brand-gold">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
export default ResearchValidation
