import {workflowCollection} from './workflowCollection'
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
    throw Error('Chưa có đủ nguồn kiểm định và cặp số đo đã xác minh cho thao tác này.')
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
    throw Error('Chưa có đủ nguồn kiểm định và cặp số đo đã xác minh cho thao tác này.')
  },

  /**
   * Xuất file CSV dữ liệu đối soát chuẩn hóa theo dự án (RS06 / RPT-09)
   */
  async exportValidationCsv(projectId: string = 'prj-ql1a-02'): Promise<{
    fileName: string
    csvContent: string
    totalRows: number
  }> {
    throw Error('Chưa có đủ nguồn kiểm định và cặp số đo đã xác minh cho thao tác này.')
  },

  // =========================================================================
  // CANONICAL AI MOCK RUNS & VALIDATION API (CANDIDATE3 SPEC 17_10)
  // =========================================================================

  /**
   * Lấy danh sách các đợt chạy thử nghiệm AI (GET /api/v1/projects/{projectId}/ai-mock-runs)
   */
  async getAiMockRuns(projectId: string, signal?: AbortSignal): Promise<any[]> {
    return workflowCollection<{id:string;projectId:string}>(`/projects/${projectId}/ai-mock-runs`,projectId,signal)
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
    if(res.data?.runId!==runId||!Number.isFinite(Date.parse(res.data.completedAt)))throw Error('Kết quả AI không khớp lần chạy.')
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
