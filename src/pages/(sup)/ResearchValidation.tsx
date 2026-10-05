import React, { useState, useMemo } from 'react'
import {
  mockMeasurementValidationSamples,
  mockActiveValidationRun,
  mockMeasurementValidationRuns
} from '../../api/mock/data'
import {
  MeasurementValidationSample,
  MeasurementValidationRun
} from '../../types/domain'
import { ResearchHeader } from './research/ResearchHeader'
import { AsyncValidationJobBanner } from './research/AsyncValidationJobBanner'
import { ValidationMetricsCards } from './research/ValidationMetricsCards'
import { PairedSamplesTable } from './research/PairedSamplesTable'
import { ValidationRunsTable } from './research/ValidationRunsTable'

export const ResearchValidation: React.FC = () => {
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

  // Xử lý nút Chạy kiểm định mới
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
      const headers =
        'Sample_ID,Defect_Type,Chainage_KM,Ground_Truth_mm,Derived_AI_mm,Signed_Error_mm,Absolute_Error_mm,Status,Exclusion_Reason,Instrument,Measured_By\n'
      const rows = mockMeasurementValidationSamples
        .map(
          (s) =>
            `"${s.sample_id}","${s.defect_name_vi}","Km${s.chainage_km}",${s.ground_truth_value},${s.derived_value},${s.signed_error},${s.absolute_error},"${s.inclusion_status}","${s.exclusion_reason || ''}","${s.instrument_name}","${s.measured_by}"`
        )
        .join('\n')

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
      <ResearchHeader
        activeRun={mockActiveValidationRun}
        isExporting={isExporting}
        isRunningVal={isRunningVal}
        onExport={handleExportGroundTruth}
        onTriggerValidation={handleTriggerValidation}
      />

      {/* 2. Banner Async Job 202 Đang chạy */}
      <AsyncValidationJobBanner
        valProgress={valProgress}
        onCancel={() => alert('Đã hủy tiến trình an toàn!')}
      />

      {/* 3. Đối soát số đo thực nghiệm (RS01-RS06 & MET-12) */}
      <div className="space-y-6">
        <ValidationMetricsCards activeRun={mockActiveValidationRun} />

        <PairedSamplesTable
          samples={samples}
          filteredSamples={filteredSamples}
          sampleFilter={sampleFilter}
          setSampleFilter={setSampleFilter}
        />

        <ValidationRunsTable runs={runs} />
      </div>
    </div>
  )
}

export default ResearchValidation
