/**
 * ProblemDetails error handling theo tài liệu 17_10 (nhóm trưởng)
 *
 * BE trả về `application/problem+json` với các field:
 * - type, title, status, detail, instance (RFC 7807)
 * - code: mã lỗi nghiệp vụ (vd: auth_unauthorized, validation_error, csrf_failed)
 * - errors: chi tiết validation (optional)
 *
 * FE đọc `code` để hiển thị thông báo phù hợp, KHÔNG hardcode message từ BE.
 */
import { AxiosError } from 'axios'

export interface ProblemDetails {
  type?: string | null
  title?: string | null
  status?: number | null
  detail?: string | null
  instance?: string | null
  /** Mã lỗi nghiệp vụ từ BE (vd: auth_unauthorized, validation_error) */
  code?: string | null
  /** Chi tiết validation errors */
  errors?: Record<string, string[]>
  [key: string]: unknown
}

/** Các mã lỗi phổ biến từ 17_10 API catalog */
export const ErrorCodes = {
  // Auth
  AUTH_UNAUTHORIZED: 'auth_unauthorized',
  AUTH_SESSION_REVOKED: 'auth_session_revoked',
  CSRF_FAILED: 'csrf_failed',
  // Validation
  VALIDATION_ERROR: 'validation_error',
  // Concurrency
  CONFLICT: 'conflict',
  PRECONDITION_FAILED: 'precondition_failed',
  IDEMPOTENCY_KEY_REUSED: 'idempotency_key_reused',
  // Not found
  NOT_FOUND: 'not_found',
  // Server
  INTERNAL_ERROR: 'internal_error',
} as const

/**
 * Parse AxiosError thành ProblemDetails
 * Ưu tiên đọc `code` từ BE, fallback về status HTTP
 */
export function parseProblemDetails(error: unknown): ProblemDetails {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ProblemDetails
    // BE đã trả ProblemDetails
    if (typeof data === 'object' && (data.code || data.title || data.status)) {
      return {
        ...data,
        status: data.status ?? error.response.status,
      }
    }
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status
    return {
      status: status ?? 0,
      title: getDefaultTitle(status),
      code: getDefaultCode(status),
      detail: error.message,
    }
  }

  return {
    status: 0,
    title: 'Lỗi không xác định',
    code: ErrorCodes.INTERNAL_ERROR,
    detail: String(error),
  }
}

function getDefaultTitle(status?: number): string {
  switch (status) {
    case 400:
      return 'Dữ liệu không hợp lệ'
    case 401:
      return 'Phiên đăng nhập hết hạn'
    case 403:
      return 'Không có quyền thực hiện'
    case 404:
      return 'Không tìm thấy dữ liệu'
    case 409:
      return 'Dữ liệu bị xung đột'
    case 412:
      return 'Điều kiện tiên quyết không thỏa mãn'
    case 422:
      return 'Dữ liệu không hợp lệ'
    case 500:
      return 'Lỗi hệ thống'
    default:
      return 'Đã có lỗi xảy ra'
  }
}

function getDefaultCode(status?: number): string {
  switch (status) {
    case 400:
      return ErrorCodes.VALIDATION_ERROR
    case 401:
      return ErrorCodes.AUTH_UNAUTHORIZED
    case 404:
      return ErrorCodes.NOT_FOUND
    case 409:
      return ErrorCodes.CONFLICT
    case 412:
      return ErrorCodes.PRECONDITION_FAILED
    case 500:
      return ErrorCodes.INTERNAL_ERROR
    default:
      return ErrorCodes.INTERNAL_ERROR
  }
}

/**
 * Lấy thông báo tiếng Việt thân thiện từ ProblemDetails
 * Ưu tiên detail từ BE nếu có, fallback về message mặc định theo code
 */
export function getErrorMessage(problem: ProblemDetails): string {
  // Nếu BE có detail thì dùng (đã là tiếng Việt từ BE)
  if (problem.detail) return problem.detail

  switch (problem.code) {
    case ErrorCodes.AUTH_UNAUTHORIZED:
    case ErrorCodes.AUTH_SESSION_REVOKED:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    case ErrorCodes.CSRF_FAILED:
      return 'Phiên làm việc không hợp lệ. Vui lòng tải lại trang.'
    case ErrorCodes.VALIDATION_ERROR:
      return problem.title || 'Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.'
    case ErrorCodes.CONFLICT:
      return 'Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại và thử lại.'
    case ErrorCodes.PRECONDITION_FAILED:
      return 'Dữ liệu đã cũ. Vui lòng tải lại trang để lấy bản mới nhất.'
    case ErrorCodes.IDEMPOTENCY_KEY_REUSED:
      return 'Thao tác này đã được thực hiện rồi.'
    case ErrorCodes.NOT_FOUND:
      return 'Không tìm thấy dữ liệu yêu cầu.'
    default:
      return problem.title || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
  }
}

/**
 * Kiểm tra lỗi có phải do validation không
 */
export function isValidationError(problem: ProblemDetails): boolean {
  return (
    problem.code === ErrorCodes.VALIDATION_ERROR ||
    problem.status === 400 ||
    problem.status === 422
  )
}

/**
 * Kiểm tra lỗi có phải do xung đột concurrency không (409/412)
 * Theo 17_10: giữ draft local, refetch, hiển thị conflict diff, hỏi user
 */
export function isConcurrencyError(problem: ProblemDetails): boolean {
  return (
    problem.code === ErrorCodes.CONFLICT ||
    problem.code === ErrorCodes.PRECONDITION_FAILED ||
    problem.status === 409 ||
    problem.status === 412
  )
}
