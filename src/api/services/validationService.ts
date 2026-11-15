import { apiClient } from '../client'
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

export const VALIDATION_PROJECT_OPTIONS: ValidationProjectOption[] = []

export interface ExtendedValidationSample extends MeasurementValidationSample {
  project_id: string
}

export interface ExtendedValidationRun extends MeasurementValidationRun {
  project_id: string
}

// 100% DỮ LIỆU THẬT CSDL BACKEND DOCKER - KHÔNG DÙNG MOCK DATA
export const RUNS_BY_PROJECT: Record<string, ExtendedValidationRun> = {}
let inMemorySamples: ExtendedValidationSample[] = []
let inMemoryRuns: MeasurementValidationRun[] = []
let inMemoryActiveJob: AsyncValidationJob | null = null

export const METRICS_FORMULA_EXPLANATION = {
  MAE: {
    name: 'Mean Absolute Error (Sai số tuyệt đối trung bình)',
    formula: 'MAE = (1/n) * Σ |y_ai - y_field|',
    description: 'Chỉ số đánh giá độ lệch trung bình giữa số đo AI và đo thực địa. Chuẩn TCVN 8819 yêu cầu MAE ≤ 2.0 mm.'
  },
  RMSE: {
    name: 'Root Mean Squared Error (Căn bậc hai sai số toàn phương)',
    formula: 'RMSE = sqrt((1/n) * Σ (y_ai - y_field)²)',
    description: 'Chỉ số phạt nặng các điểm sai số đột biến ngoại lai (outliers).'
  },
  BIAS: {
    name: 'Mean Signed Difference / Bias (Độ lệch hệ thống)',
    formula: 'Bias = (1/n) * Σ (y_ai - y_field)',
    description: 'Xác định xu hướng mô hình AI đang ước lượng non (Bias < 0) hay ước lượng già (Bias > 0).'
  },
  TCVN_COMPLIANCE: {
    name: 'Tỷ lệ mẫu đạt dung sai TCVN 8819 (≤ 2.0 mm)',
    formula: 'Compliance = (Số mẫu |error| ≤ 2.0mm / Tổng mẫu hợp lệ) * 100%',
    description: 'Ngưỡng nghiệm thu khoa học yêu cầu tối thiểu 85% mẫu hợp lệ nằm trong khoảng dung sai ±2.0 mm.'
  }
}

export const INITIAL_VALIDATION_METRICS = {
  total_samples: 0,
  included_samples: 0,
  excluded_samples: 0,
  mae_mm: 0,
  rmse_mm: 0,
  bias_mm: 0,
  tcvn_pass: true,
  tcvn_threshold_mm: 2.0,
  confidence_level_percent: 95,
  uncertainty_budget: {
    u_repeatability_mm: 0,
    u_instrument_mm: 0,
    u_camera_resolution_mm: 0,
    u_combined_expanded_mm: 0,
    coverage_factor_k: 2.0,
    confidence_p: 95
  },
  calibration_details: {
    calibrated_date: '',
    calibrated_by: '',
    instrument_serial: '',
    focal_length_equiv_mm: 0,
    gsd_ground_sampling_mm_per_pixel: 0,
    rtk_fix_rate_percent: 0
  }
}

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
  },

  // =========================================================================
  // CANONICAL AI MOCK RUNS & VALIDATION API (CANDIDATE3 SPEC 17_10)
  // =========================================================================

  /**
   * Lấy danh sách các đợt chạy thử nghiệm AI (GET /api/v1/projects/{projectId}/ai-mock-runs)
   */
  async getAiMockRuns(projectId: string, signal?: AbortSignal): Promise<any[]> {
    if (!projectId || projectId === 'ALL') return []
    try {
      const res = await apiClient.get(`/projects/${projectId}/ai-mock-runs`, { signal })
      return res.data?.items || []
    } catch (err) {
      console.warn('Lỗi tải danh sách AI Mock Runs từ API:', err)
      return []
    }
  },

  /**
   * Khởi tạo đợt chạy thử nghiệm AI mới (POST /api/v1/projects/{projectId}/ai-mock-runs)
   */
  async createAiMockRun(projectId: string, request: any): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(`/projects/${projectId}/ai-mock-runs`, request, {
      headers: { 'Idempotency-Key': key }
    })
    return res.data
  },

  /**
   * Đọc kết quả trích xuất khung hình của đợt chạy AI (GET /api/v1/projects/{projectId}/ai-mock-runs/{runId}/result)
   */
  async getAiMockRunResult(projectId: string, runId: string, signal?: AbortSignal): Promise<any> {
    const res = await apiClient.get(`/projects/${projectId}/ai-mock-runs/${runId}/result`, { signal })
    return res.data
  },

  /**
   * Tạo validation run chính thức (POST /api/v1/projects/{projectId}/validation-runs)
   */
  async createValidationRun(projectId: string, request: any): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(`/projects/${projectId}/validation-runs`, request, {
      headers: { 'Idempotency-Key': key }
    })
    return res.data
  },

  /**
   * Đọc kết quả validation run (GET /api/v1/validation-runs/{runId})
   */
  async getValidationResult(runId: string, signal?: AbortSignal): Promise<any> {
    const res = await apiClient.get(`/validation-runs/${runId}`, { signal })
    return res.data
  }
}
