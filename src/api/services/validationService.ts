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
   * Tổng quan màn Thực nghiệm Đối soát (RPT-09). Dự án lấy từ BE (GET /projects, phân trang).
   * BE KHÔNG có API liệt kê mẫu đối soát hay các đợt kiểm định: chỉ có tạo theo danh sách cặp id và đọc số liệu theo id
   * (POST /projects/{id}/validation-runs, GET /validation-runs/{id}). Vì vậy mẫu và đợt chạy luôn rỗng, không giả lập.
   */
  async getValidationOverview(projectId: string = ''): Promise<{
    activeRun: ExtendedValidationRun
    samples: ExtendedValidationSample[]
    runs: ExtendedValidationRun[]
    activeJob: AsyncValidationJob | null
    projects: ValidationProjectOption[]
  }> {
    const projects: ValidationProjectOption[] = []
    let cursor: string | null | undefined
    for (let page = 0; page < 20; page++) {
      const res = await apiClient.get<any>('/projects', { params: cursor ? { cursor } : undefined })
      for (const p of res.data?.items || []) {
        projects.push({ id: p.projectId, name: p.name, code: p.projectCode, chainage: '—', surface_type: '—' })
      }
      cursor = res.data?.nextCursor
      if (!cursor) break
    }
    void projectId
    return {
      activeRun: {} as ExtendedValidationRun,
      samples: [],
      runs: [],
      activeJob: null,
      projects,
    }
  },

  /** BE không có API liệt kê mẫu đối soát. */
  async getSamples(
    _projectId: string = '',
    _filter: 'ALL' | 'INCLUDED' | 'EXCLUDED' | 'OUTLIER' = 'ALL'
  ): Promise<ExtendedValidationSample[]> {
    throw new Error('Chưa nối máy chủ: BE không có API liệt kê mẫu đối soát.')
  },

  /** Khởi tạo kiểm định: cần danh sách cặp id từ BE (web chưa có nguồn) nên không thể thực hiện. */
  async triggerValidationRun(_projectId: string = ''): Promise<{
    job: AsyncValidationJob
    run: ExtendedValidationRun
  }> {
    throw new Error('BE chỉ tạo lần kiểm định từ danh sách cặp id (groundTruthId, derivedMeasurementId) mà web chưa có API để lấy, và API này chưa mở cho cookie web; không thể tạo từ giao diện.')
  },
  /** BE không có API hủy tác vụ kiểm định. */
  async cancelValidationJob(_jobId: string): Promise<boolean> {
    throw new Error('BE không có API hủy tác vụ kiểm định.')
  },
  /** BE không có API xuất CSV đối soát (không có danh sách mẫu để xuất). */
  async exportValidationCsv(_projectId: string = ''): Promise<{
    fileName: string
    csvContent: string
    totalRows: number
  }> {
    throw new Error('BE không có API xuất CSV đối soát.')
  },
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
