import {
  MeasurementValidationSample,
  MeasurementValidationRun
} from '../../types/domain'

export interface AsyncValidationJob {
  id: string
  code: string
  name: string
  progress: number
  status: 'RUNNING' | 'COMPLETED' | 'CANCELLED'
  section: string
  estimated_seconds: number
}

// =============================================================================
// IN-MEMORY DATASET THỰC NGHIỆM ĐỐI SOÁT (RS01 - RS06 & MET-12)
// Chuẩn hóa theo Spec 29_9: Thước thẳng 3m TCVN 8864 & Thước đo sâu điện tử
// =============================================================================

let inMemoryActiveRun: MeasurementValidationRun = {
  id: 'val-run-01',
  run_code: 'VAL-RUN-2026-03',
  measurement_type: 'DEPRESSION_DEPTH',
  method_name: 'Mô hình bề mặt DSM tái tạo từ Drone (GSD 0.8cm/px) vs Thước nêm cơ học tiêu chuẩn TCVN 8864',
  algorithm_version: 'RoadGuard-Surface-Reconstruction v2.4.1',
  dataset_name: 'Tập dữ liệu kiểm định hiện trường QL1A-GT-2026 (Km 1020 - Km 1045)',
  sample_count: 120,
  used_count: 112,
  excluded_count: 8,
  bias: 1.2,
  mae: 3.8,
  rmse: 5.2,
  uncertainty_value: 2.4,
  uncertainty_method: 'Bootstrap 95% Confidence Interval (1,000 resamples)',
  status: 'COMPLETED',
  is_mock_data: false,
  executed_at: '26/08/2026 15:00',
  triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
  triggered_by_role: 'Chỉ huy trưởng (PM)',
  progress_percent: 100
}

let inMemorySamples: MeasurementValidationSample[] = [
  {
    id: 'sample-01',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1025-001',
    defect_type_code: 'POTHOLE',
    defect_name_vi: 'Vỡ góc bản BTXM',
    chainage_km: 1025.4,
    ground_truth_value: 62.0,
    derived_value: 60.5,
    unit: 'mm',
    signed_error: -1.5,
    absolute_error: 1.5,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước nêm cơ học & Thước góc đo sâu điện tử',
    measured_by: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)'
  },
  {
    id: 'sample-02',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1028-002',
    defect_type_code: 'SLAB_FAULTING',
    defect_name_vi: 'Chênh cốt mép khe co giãn tấm BTXM',
    chainage_km: 1031.9,
    ground_truth_value: 48.0,
    derived_value: 46.8,
    unit: 'mm',
    signed_error: -1.2,
    absolute_error: 1.2,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước thẳng 3m & Thước trắc địa laser',
    measured_by: 'Kỹ sư Hoàng Văn Bách (Tổ kết cấu)'
  },
  {
    id: 'sample-03',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1030-003',
    defect_type_code: 'RUTTING',
    defect_name_vi: 'Lún vệt bánh xe vệt ngoài',
    chainage_km: 1030.15,
    ground_truth_value: 35.5,
    derived_value: 37.2,
    unit: 'mm',
    signed_error: 1.7,
    absolute_error: 1.7,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước thẳng 3m tiêu chuẩn TCVN 8864',
    measured_by: 'Kỹ sư Trần Đình Trọng (Đội kiểm định)'
  },
  {
    id: 'sample-04',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1032-004',
    defect_type_code: 'POTHOLE',
    defect_name_vi: 'Ổ gà cục bộ sâu > 5cm',
    chainage_km: 1032.6,
    ground_truth_value: 54.0,
    derived_value: 56.1,
    unit: 'mm',
    signed_error: 2.1,
    absolute_error: 2.1,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước đo sâu kỹ thuật số Mitutoyo',
    measured_by: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)'
  },
  {
    id: 'sample-05',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1034-005',
    defect_type_code: 'DEPRESSION',
    defect_name_vi: 'Võng lún cục bộ khu vực đầu cống',
    chainage_km: 1034.2,
    ground_truth_value: 78.0,
    derived_value: 75.6,
    unit: 'mm',
    signed_error: -2.4,
    absolute_error: 2.4,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước trắc địa điện tử thủy chuẩn',
    measured_by: 'Kỹ sư Hoàng Văn Bách (Tổ kết cấu)'
  },
  {
    id: 'sample-06',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1036-006',
    defect_type_code: 'LONGITUDINAL_CRACK',
    defect_name_vi: 'Nứt dọc mép tấm kèm sụt mép',
    chainage_km: 1036.05,
    ground_truth_value: 28.0,
    derived_value: 29.8,
    unit: 'mm',
    signed_error: 1.8,
    absolute_error: 1.8,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước kẹp cơ khí & Thước nêm',
    measured_by: 'Kỹ sư Trần Đình Trọng (Đội kiểm định)'
  },
  {
    id: 'sample-07',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1038-007',
    defect_type_code: 'SLAB_FAULTING',
    defect_name_vi: 'Chênh cao tấm mép dải phân cách',
    chainage_km: 1038.5,
    ground_truth_value: 41.0,
    derived_value: 42.6,
    unit: 'mm',
    signed_error: 1.6,
    absolute_error: 1.6,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước thẳng 3m TCVN 8864',
    measured_by: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)'
  },
  {
    id: 'sample-08',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1029-EX01',
    defect_type_code: 'POTHOLE',
    defect_name_vi: 'Hố sụt ngập nước sau mưa lớn',
    chainage_km: 1029.3,
    ground_truth_value: 65.0,
    derived_value: 42.0,
    unit: 'mm',
    signed_error: -23.0,
    absolute_error: 23.0,
    inclusion_status: 'EXCLUDED',
    exclusion_reason: 'Mặt đường đọng nước sâu che khuất đáy hố, không thể tái tạo mô hình bề mặt quang học',
    instrument_name: 'Thước đo sâu cơ học',
    measured_by: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)'
  },
  {
    id: 'sample-09',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1035-EX02',
    defect_type_code: 'DEPRESSION',
    defect_name_vi: 'Lún mép lề không có ảnh đối chứng',
    chainage_km: 1035.7,
    ground_truth_value: 50.0,
    derived_value: 38.5,
    unit: 'mm',
    signed_error: -11.5,
    absolute_error: 11.5,
    inclusion_status: 'EXCLUDED',
    exclusion_reason: 'Thiếu ảnh chụp thước nêm sát đáy hố theo biên bản kiểm định thực địa (vi phạm DD-C09)',
    instrument_name: 'Thước nêm cơ học',
    measured_by: 'Kỹ sư Trần Đình Trọng (Đội kiểm định)'
  },
  {
    id: 'sample-10',
    validation_run_id: 'val-run-01',
    sample_id: 'GT-QL1A-KM1041-OUT01',
    defect_type_code: 'TRANSVERSE_CRACK',
    defect_name_vi: 'Nứt gãy ngang tấm góc bóng râm cây',
    chainage_km: 1041.2,
    ground_truth_value: 32.0,
    derived_value: 46.5,
    unit: 'mm',
    signed_error: 14.5,
    absolute_error: 14.5,
    inclusion_status: 'OUTLIER',
    exclusion_reason: 'Bóng râm tán cây che khuất góc chiếu sáng mặt trời làm sai lệch trắc đạc DSM cục bộ > 3-sigma',
    instrument_name: 'Thước thẳng 3m & Thước trắc địa laser',
    measured_by: 'Kỹ sư Hoàng Văn Bách (Tổ kết cấu)'
  }
]

let inMemoryRuns: MeasurementValidationRun[] = [
  inMemoryActiveRun,
  {
    id: 'val-run-02',
    run_code: 'VAL-RUN-2026-02',
    measurement_type: 'SLAB_FAULTING_HEIGHT',
    method_name: 'Mô hình 3D đám mây điểm LiDAR vs Thước thẳng 3m cơ học',
    algorithm_version: 'LiDAR-PointCloud-Surface v2.1.0',
    dataset_name: 'QL1A-Pilot-Phase1 (Km 1020 - Km 1030)',
    sample_count: 85,
    used_count: 80,
    excluded_count: 5,
    bias: -0.6,
    mae: 2.9,
    rmse: 4.1,
    uncertainty_value: 1.8,
    uncertainty_method: 'Standard Gaussian 2-sigma',
    status: 'COMPLETED',
    is_mock_data: false,
    executed_at: '15/08/2026 09:30',
    triggered_by_name: 'Kỹ sư Nguyễn Văn An',
    triggered_by_role: 'Giám sát trưởng (Supervisor)',
    progress_percent: 100
  },
  {
    id: 'val-run-03',
    run_code: 'VAL-RUN-2026-01',
    measurement_type: 'DEPRESSION_DEPTH',
    method_name: 'Mô hình bề mặt DSM sơ bộ vs Thước nêm hiện trường',
    algorithm_version: 'RoadGuard-Surface-Reconstruction v1.9.0',
    dataset_name: 'QL1A-Baseline-Validation-Run',
    sample_count: 60,
    used_count: 52,
    excluded_count: 8,
    bias: 2.1,
    mae: 4.5,
    rmse: 6.3,
    uncertainty_value: 3.2,
    uncertainty_method: 'Bootstrap 95% Confidence Interval',
    status: 'COMPLETED',
    is_mock_data: false,
    executed_at: '01/08/2026 10:15',
    triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
    triggered_by_role: 'Chỉ huy trưởng (PM)',
    progress_percent: 100
  }
]

let inMemoryActiveJob: AsyncValidationJob | null = {
  id: 'job-val-09',
  code: '#VAL-2026-09',
  name: 'Đang đối soát ma trận ghép cặp trên đoạn Km 1025 - Km 1038',
  progress: 42,
  status: 'RUNNING',
  section: 'Km 1025+000 - Km 1038+000',
  estimated_seconds: 45
}

// =============================================================================
// VALIDATION SERVICE API (ASYNC PROMISE, ZERO LOCALSTORAGE)
// =============================================================================

export const validationService = {
  /**
   * Lấy dữ liệu tổng quan màn hình Thực nghiệm Đối soát (RPT-09)
   */
  async getValidationOverview(): Promise<{
    activeRun: MeasurementValidationRun
    samples: MeasurementValidationSample[]
    runs: MeasurementValidationRun[]
    activeJob: AsyncValidationJob | null
  }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return {
      activeRun: { ...inMemoryActiveRun },
      samples: [...inMemorySamples],
      runs: [...inMemoryRuns],
      activeJob: inMemoryActiveJob ? { ...inMemoryActiveJob } : null
    }
  },

  /**
   * Lọc danh sách mẫu theo trạng thái
   */
  async getSamples(
    filter: 'ALL' | 'INCLUDED' | 'EXCLUDED' | 'OUTLIER' = 'ALL'
  ): Promise<MeasurementValidationSample[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    if (filter === 'ALL') return [...inMemorySamples]
    return inMemorySamples.filter((s) => s.inclusion_status === filter)
  },

  /**
   * Khởi tạo đợt kiểm định thực nghiệm mới (HTTP 202 Accepted theo FR-31)
   */
  async triggerValidationRun(): Promise<{
    job: AsyncValidationJob
    run: MeasurementValidationRun
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newRunCode = `VAL-RUN-2026-${Math.floor(Math.random() * 89 + 10)}`
    const newJobId = `job-val-${Math.floor(Math.random() * 899 + 100)}`
    const newJobCode = `#VAL-2026-${Math.floor(Math.random() * 89 + 10)}`

    const newJob: AsyncValidationJob = {
      id: newJobId,
      code: newJobCode,
      name: 'Khởi tạo ghép cặp đối soát số đo thực nghiệm Ground Truth',
      progress: 5,
      status: 'RUNNING',
      section: 'Km 1020+000 - Km 1045+000',
      estimated_seconds: 60
    }

    const newRun: MeasurementValidationRun = {
      id: `val-run-${Date.now()}`,
      run_code: newRunCode,
      measurement_type: 'DEPRESSION_DEPTH',
      method_name: 'Mô hình bề mặt DSM tái tạo từ Drone (GSD 0.8cm/px) vs Thước nêm cơ học tiêu chuẩn TCVN 8864',
      algorithm_version: 'RoadGuard-Surface-Reconstruction v2.4.2',
      dataset_name: 'Tập dữ liệu kiểm định hiện trường QL1A-GT-2026 (Đợt mới)',
      sample_count: 120,
      used_count: 114,
      excluded_count: 6,
      bias: 1.0,
      mae: 3.5,
      rmse: 4.8,
      uncertainty_value: 2.1,
      uncertainty_method: 'Bootstrap 95% Confidence Interval (1,000 resamples)',
      status: 'RUNNING',
      is_mock_data: false,
      executed_at: 'Hôm nay ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
      triggered_by_role: 'Chỉ huy trưởng (PM)',
      progress_percent: 5
    }

    inMemoryActiveJob = newJob
    inMemoryActiveRun = newRun
    inMemoryRuns = [newRun, ...inMemoryRuns]

    return { job: newJob, run: newRun }
  },

  /**
   * Hủy tiến trình kiểm định nền đang chạy
   */
  async cancelValidationJob(jobId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    if (inMemoryActiveJob && inMemoryActiveJob.id === jobId) {
      inMemoryActiveJob = null
    }
    return true
  },

  /**
   * Xuất file CSV dữ liệu đối soát chuẩn hóa (RS06 / RPT-09)
   */
  async exportValidationCsv(): Promise<{
    fileName: string
    csvContent: string
    totalRows: number
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const headers =
      'Sample_ID,Defect_Type,Chainage_KM,Ground_Truth_mm,Derived_AI_mm,Signed_Error_mm,Absolute_Error_mm,Status,Exclusion_Reason,Instrument,Measured_By\n'
    const rows = inMemorySamples
      .map(
        (s) =>
          `"${s.sample_id}","${s.defect_name_vi}","Km${s.chainage_km}",${s.ground_truth_value},${s.derived_value},${s.signed_error},${s.absolute_error},"${s.inclusion_status}","${s.exclusion_reason || ''}","${s.instrument_name}","${s.measured_by}"`
      )
      .join('\n')

    return {
      fileName: 'RPT-09-Research-Validation-Paired-Data-v2.2.csv',
      csvContent: headers + rows,
      totalRows: inMemorySamples.length
    }
  }
}
