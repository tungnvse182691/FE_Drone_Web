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
  project_id: string
  estimated_seconds: number
}

export interface ValidationProjectOption {
  id: string
  name: string
  code: string
  chainage: string
  surface_type: string
}

export const VALIDATION_PROJECT_OPTIONS: ValidationProjectOption[] = [
  {
    id: 'prj-ql1a-02',
    name: 'QL1A - Giai đoạn 2 (Đèo Hải Vân)',
    code: '#PRJ-QL1A-02',
    chainage: 'Km 1020+000 - Km 1045+000',
    surface_type: 'Bê tông xi măng (BTXM)'
  },
  {
    id: 'prj-ctbn-03',
    name: 'Cao tốc Bắc Nam - Gói XL-03',
    code: '#PRJ-CTBN-03',
    chainage: 'Km 14+000 - Km 22+000',
    surface_type: 'Bê tông nhựa Asphalt'
  },
  {
    id: 'ALL',
    name: 'Tất cả dự án phụ trách (Tổng hợp)',
    code: '#PRJ-ALL',
    chainage: 'Toàn bộ phạm vi PM phụ trách',
    surface_type: 'Đa kết cấu mặt đường'
  }
]

// =============================================================================
// MẪU ĐO ĐẠC THỰC ĐỊA THEO DỰ ÁN (RS01 - RS06 & MET-12)
// =============================================================================

export interface ExtendedValidationSample extends MeasurementValidationSample {
  project_id: string
}

let inMemorySamples: ExtendedValidationSample[] = [
  // --- 1. DỰ ÁN QL1A (Mặt đường BTXM, TCVN 8864) - 8 MẪU (5 ĐẠT, 2 LOẠI, 1 NGOẠI LAI) ---
  {
    id: 'sample-01',
    project_id: 'prj-ql1a-02',
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
    project_id: 'prj-ql1a-02',
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
    project_id: 'prj-ql1a-02',
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
    project_id: 'prj-ql1a-02',
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
    project_id: 'prj-ql1a-02',
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
    project_id: 'prj-ql1a-02',
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
    exclusion_reason: 'Mặt đường đọng nước sâu che khuất đáy hố',
    instrument_name: 'Thước đo sâu cơ học',
    measured_by: 'Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)'
  },
  {
    id: 'sample-07',
    project_id: 'prj-ql1a-02',
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
    exclusion_reason: 'Thiếu ảnh chụp thước nêm sát đáy hố theo biên bản kiểm định',
    instrument_name: 'Thước nêm cơ học',
    measured_by: 'Kỹ sư Trần Đình Trọng (Đội kiểm định)'
  },
  {
    id: 'sample-08',
    project_id: 'prj-ql1a-02',
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
    exclusion_reason: 'Bóng râm tán cây che khuất làm sai lệch DSM',
    instrument_name: 'Thước thẳng 3m & Thước trắc địa laser',
    measured_by: 'Kỹ sư Hoàng Văn Bách (Tổ kết cấu)'
  },

  // --- 2. DỰ ÁN CAO TỐC BẮC NAM XL-03 (Mặt đường Asphalt, LiDAR 3D) - 8 MẪU (5 ĐẠT, 2 LOẠI, 1 NGOẠI LAI) ---
  {
    id: 'sample-ctbn-01',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM015-001',
    defect_type_code: 'RUTTING',
    defect_name_vi: 'Lún vệt bánh xe làn xe nặng',
    chainage_km: 15.2,
    ground_truth_value: 26.0,
    derived_value: 25.4,
    unit: 'mm',
    signed_error: -0.6,
    absolute_error: 0.6,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước thẳng 3m tiêu chuẩn TCVN 8864',
    measured_by: 'Kỹ sư Lê Quốc Tuấn (Tổ thí nghiệm hiện trường)'
  },
  {
    id: 'sample-ctbn-02',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM017-002',
    defect_type_code: 'DEPRESSION',
    defect_name_vi: 'Lún chuyển tiếp đầu mố cầu vượt',
    chainage_km: 17.8,
    ground_truth_value: 38.0,
    derived_value: 38.8,
    unit: 'mm',
    signed_error: 0.8,
    absolute_error: 0.8,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Máy thủy chuẩn điện tử Leica DNA03',
    measured_by: 'Kỹ sư Lê Quốc Tuấn (Tổ thí nghiệm hiện trường)'
  },
  {
    id: 'sample-ctbn-03',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM019-003',
    defect_type_code: 'LONGITUDINAL_CRACK',
    defect_name_vi: 'Nứt dọc theo vệt lu lèn mặt nhựa',
    chainage_km: 19.45,
    ground_truth_value: 18.0,
    derived_value: 17.2,
    unit: 'mm',
    signed_error: -0.8,
    absolute_error: 0.8,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước kẹp cơ khí đo khe nứt',
    measured_by: 'Kỹ sư Đặng Hoài Nam (Đội hiện trường 01)'
  },
  {
    id: 'sample-ctbn-04',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM021-004',
    defect_type_code: 'RAVELING',
    defect_name_vi: 'Bong bật nhựa cục bộ bề mặt',
    chainage_km: 21.1,
    ground_truth_value: 22.0,
    derived_value: 23.2,
    unit: 'mm',
    signed_error: 1.2,
    absolute_error: 1.2,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước đo sâu cơ học Mitutoyo',
    measured_by: 'Kỹ sư Lê Quốc Tuấn (Tổ thí nghiệm hiện trường)'
  },
  {
    id: 'sample-ctbn-05',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM016-005',
    defect_type_code: 'DEPRESSION',
    defect_name_vi: 'Lún võng dốc dọc cầu cạn Km16',
    chainage_km: 16.4,
    ground_truth_value: 29.0,
    derived_value: 26.4,
    unit: 'mm',
    signed_error: -2.6,
    absolute_error: 2.6,
    inclusion_status: 'INCLUDED',
    instrument_name: 'Thước thẳng 3m & Thước trắc địa',
    measured_by: 'Kỹ sư Đặng Hoài Nam (Đội hiện trường 01)'
  },
  {
    id: 'sample-ctbn-06',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM018-EX01',
    defect_type_code: 'DEPRESSION',
    defect_name_vi: 'Võng lún taluy âm ngoài phạm vi GSD',
    chainage_km: 18.6,
    ground_truth_value: 45.0,
    derived_value: 28.0,
    unit: 'mm',
    signed_error: -17.0,
    absolute_error: 17.0,
    inclusion_status: 'EXCLUDED',
    exclusion_reason: 'Ngoài hành lang quét LiDAR 3D',
    instrument_name: 'Máy thủy chuẩn điện tử',
    measured_by: 'Kỹ sư Đặng Hoài Nam (Đội hiện trường 01)'
  },
  {
    id: 'sample-ctbn-07',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM020-EX02',
    defect_type_code: 'POTHOLE',
    defect_name_vi: 'Vệt trồi lún nhựa trũng nước mưa',
    chainage_km: 20.15,
    ground_truth_value: 36.0,
    derived_value: 22.0,
    unit: 'mm',
    signed_error: -14.0,
    absolute_error: 14.0,
    inclusion_status: 'EXCLUDED',
    exclusion_reason: 'Lóa sáng mặt đường ẩm ướt',
    instrument_name: 'Thước đo sâu cơ học Mitutoyo',
    measured_by: 'Kỹ sư Lê Quốc Tuấn (Tổ thí nghiệm hiện trường)'
  },
  {
    id: 'sample-ctbn-08',
    project_id: 'prj-ctbn-03',
    validation_run_id: 'val-run-ctbn-01',
    sample_id: 'GT-CTBN-KM017-OUT01',
    defect_type_code: 'TRANSVERSE_CRACK',
    defect_name_vi: 'Nứt vỡ góc bản dạ cầu vượt',
    chainage_km: 17.92,
    ground_truth_value: 30.0,
    derived_value: 48.5,
    unit: 'mm',
    signed_error: 18.5,
    absolute_error: 18.5,
    inclusion_status: 'OUTLIER',
    exclusion_reason: 'Sai lệch tọa độ RTK cục bộ',
    instrument_name: 'Máy thủy chuẩn điện tử Leica DNA03',
    measured_by: 'Kỹ sư Đặng Hoài Nam (Đội hiện trường 01)'
  }
]

// =============================================================================
// RUNS METADATA THEO DỰ ÁN (ĐỒNG BỘ 100% VỚI MẪU THỰC ĐỊA)
// =============================================================================

export interface ExtendedValidationRun extends MeasurementValidationRun {
  project_id: string
}

const RUNS_BY_PROJECT: Record<string, ExtendedValidationRun> = {
  'prj-ql1a-02': {
    id: 'val-run-01',
    project_id: 'prj-ql1a-02',
    run_code: 'VAL-RUN-2026-03',
    measurement_type: 'DEPRESSION_DEPTH',
    method_name: 'Mô hình bề mặt DSM tái tạo từ Drone (GSD 0.8cm/px) vs Thước nêm cơ học tiêu chuẩn TCVN 8864',
    algorithm_version: 'RoadGuard-Surface-Reconstruction v2.4.1',
    dataset_name: 'QL1A-GT-2026 (Km 1020 - Km 1045, Kỳ khảo sát 3)',
    sample_count: 8,
    used_count: 5,
    excluded_count: 3,
    bias: -0.3,
    mae: 1.8,
    rmse: 1.8,
    uncertainty_value: 1.2,
    uncertainty_method: 'Bootstrap 95% Confidence Interval (1,000 resamples)',
    status: 'COMPLETED',
    is_mock_data: false,
    executed_at: '26/08/2026 15:00',
    triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
    triggered_by_role: 'Chỉ huy trưởng (PM)',
    progress_percent: 100
  },
  'prj-ctbn-03': {
    id: 'val-run-ctbn-01',
    project_id: 'prj-ctbn-03',
    run_code: 'VAL-RUN-2026-04',
    measurement_type: 'DEPRESSION_DEPTH',
    method_name: 'Mô hình 3D đám mây điểm LiDAR kết hợp Drone RTK vs Thước thẳng 3m tiêu chuẩn TCVN 8864',
    algorithm_version: 'LiDAR-PointSurface v2.2.0',
    dataset_name: 'CTBN-XL03-GT-2026 (Km 14 - Km 22, Đoạn nền đắp K98)',
    sample_count: 8,
    used_count: 5,
    excluded_count: 3,
    bias: -0.4,
    mae: 1.2,
    rmse: 1.4,
    uncertainty_value: 1.1,
    uncertainty_method: 'Standard Gaussian 2-sigma',
    status: 'COMPLETED',
    is_mock_data: false,
    executed_at: '24/08/2026 11:20',
    triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
    triggered_by_role: 'Chỉ huy trưởng (PM)',
    progress_percent: 100
  },
  ALL: {
    id: 'val-run-all',
    project_id: 'ALL',
    run_code: 'VAL-RUN-2026-ALL',
    measurement_type: 'DEPRESSION_DEPTH',
    method_name: 'Mô hình đối soát tổng hợp đa tuyến bề mặt Drone AI vs Thước đo cơ học (TCVN 8864 / TCVN 10380)',
    algorithm_version: 'RoadGuard-Surface-Core v2.4.1 (Ensemble)',
    dataset_name: 'Tập dữ liệu kiểm định tổng hợp (QL1A & Cao tốc Bắc Nam)',
    sample_count: 16,
    used_count: 10,
    excluded_count: 6,
    bias: -0.3,
    mae: 1.5,
    rmse: 1.6,
    uncertainty_value: 1.4,
    uncertainty_method: 'Bootstrap 95% CI (Multi-site)',
    status: 'COMPLETED',
    is_mock_data: false,
    executed_at: '26/08/2026 15:30',
    triggered_by_name: 'Đỗ Quốc Hoàng (PM)',
    triggered_by_role: 'Chỉ huy trưởng (PM)',
    progress_percent: 100
  }
}

let inMemoryActiveJob: AsyncValidationJob | null = null

// =============================================================================
// VALIDATION SERVICE API (ASYNC PROMISE, ZERO LOCALSTORAGE)
// =============================================================================

export const validationService = {
  /**
   * Lấy danh sách dự án trong phạm vi phụ trách của PM
   */
  getProjectOptions(): ValidationProjectOption[] {
    return VALIDATION_PROJECT_OPTIONS
  },

  /**
   * Lấy dữ liệu tổng quan màn hình Thực nghiệm Đối soát (RPT-09) theo dự án
   */
  async getValidationOverview(projectId: string = 'prj-ql1a-02'): Promise<{
    activeRun: ExtendedValidationRun
    samples: ExtendedValidationSample[]
    runs: ExtendedValidationRun[]
    activeJob: AsyncValidationJob | null
    projects: ValidationProjectOption[]
  }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const run = RUNS_BY_PROJECT[projectId] || RUNS_BY_PROJECT['prj-ql1a-02']
    const samples =
      projectId === 'ALL'
        ? inMemorySamples
        : inMemorySamples.filter((s) => s.project_id === projectId)

    const allRuns = Object.values(RUNS_BY_PROJECT)

    return {
      activeRun: { ...run },
      samples: [...samples],
      runs: allRuns,
      activeJob: inMemoryActiveJob ? { ...inMemoryActiveJob } : null,
      projects: VALIDATION_PROJECT_OPTIONS
    }
  },

  /**
   * Lọc danh sách mẫu theo trạng thái và dự án
   */
  async getSamples(
    projectId: string = 'prj-ql1a-02',
    filter: 'ALL' | 'INCLUDED' | 'EXCLUDED' | 'OUTLIER' = 'ALL'
  ): Promise<ExtendedValidationSample[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    let list =
      projectId === 'ALL'
        ? inMemorySamples
        : inMemorySamples.filter((s) => s.project_id === projectId)
    if (filter === 'ALL') return [...list]
    return list.filter((s) => s.inclusion_status === filter)
  },

  /**
   * Khởi tạo đợt kiểm định thực nghiệm mới (HTTP 202 Accepted theo FR-31)
   */
  async triggerValidationRun(projectId: string = 'prj-ql1a-02'): Promise<{
    job: AsyncValidationJob
    run: ExtendedValidationRun
  }> {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const projConfig =
      VALIDATION_PROJECT_OPTIONS.find((p) => p.id === projectId) ||
      VALIDATION_PROJECT_OPTIONS[0]

    const newRunCode = `VAL-RUN-2026-${Math.floor(Math.random() * 89 + 10)}`
    const newJobId = `job-val-${Math.floor(Math.random() * 899 + 100)}`
    const newJobCode = `#VAL-2026-${Math.floor(Math.random() * 89 + 10)}`

    const newJob: AsyncValidationJob = {
      id: newJobId,
      code: newJobCode,
      name: `Đang đối soát ma trận ghép cặp trên đoạn ${projConfig.chainage}`,
      progress: 5,
      status: 'RUNNING',
      section: projConfig.chainage,
      project_id: projectId,
      estimated_seconds: 40
    }

    const currentBase = RUNS_BY_PROJECT[projectId] || RUNS_BY_PROJECT['prj-ql1a-02']
    const newRun: ExtendedValidationRun = {
      ...currentBase,
      id: `val-run-${Date.now()}`,
      run_code: newRunCode,
      executed_at: 'Hôm nay ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'RUNNING',
      progress_percent: 5
    }

    inMemoryActiveJob = newJob
    RUNS_BY_PROJECT[projectId] = newRun

    return { job: newJob, run: newRun }
  },

  /**
   * Đánh dấu đợt kiểm định hoàn tất (chuyển status từ RUNNING sang COMPLETED)
   */
  completeValidationRun(runId?: string) {
    Object.keys(RUNS_BY_PROJECT).forEach((k) => {
      if (RUNS_BY_PROJECT[k].status === 'RUNNING') {
        RUNS_BY_PROJECT[k] = {
          ...RUNS_BY_PROJECT[k],
          status: 'COMPLETED',
          progress_percent: 100
        }
      }
    })
    if (inMemoryActiveJob) {
      inMemoryActiveJob = null
    }
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
   * Xuất file CSV dữ liệu đối soát chuẩn hóa theo dự án (RS06 / RPT-09)
   */
  async exportValidationCsv(projectId: string = 'prj-ql1a-02'): Promise<{
    fileName: string
    csvContent: string
    totalRows: number
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const list =
      projectId === 'ALL'
        ? inMemorySamples
        : inMemorySamples.filter((s) => s.project_id === projectId)

    const headers =
      'Sample_ID,Project_ID,Defect_Type,Chainage_KM,Ground_Truth_mm,Derived_AI_mm,Signed_Error_mm,Absolute_Error_mm,Status,Exclusion_Reason,Instrument,Measured_By\n'
    const rows = list
      .map(
        (s) =>
          `"${s.sample_id}","${s.project_id}","${s.defect_name_vi}","Km${s.chainage_km}",${s.ground_truth_value},${s.derived_value},${s.signed_error},${s.absolute_error},"${s.inclusion_status}","${s.exclusion_reason || ''}","${s.instrument_name}","${s.measured_by}"`
      )
      .join('\n')

    const filePrefix =
      projectId === 'ALL' ? 'ALL' : projectId.replace('prj-', '').toUpperCase()

    return {
      fileName: `RPT-09-Research-Validation-Paired-Data-${filePrefix}-v2.2.csv`,
      csvContent: headers + rows,
      totalRows: list.length
    }
  }
}
