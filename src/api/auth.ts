/**
 * Auth API theo tài liệu 17_10 (nhóm trưởng)
 * Web dùng cookie WebSession + CSRF token, KHÔNG dùng Bearer
 *
 * API-013: GET /api/v1/auth/web/csrf - lấy CSRF token
 * API-014: POST /api/v1/auth/web/login - đăng nhập
 * API-015: POST /api/v1/auth/web/logout - đăng xuất
 * API-016: POST /api/v1/auth/web/renew - renew session
 * API-017: GET /api/v1/auth/web/session - kiểm tra session
 */
import { apiClient } from './client'

export interface CsrfResponse {
  requestToken: string
  headerName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SessionResponse {
  user: {
    id: string
    email: string
    fullName: string
    role: string
    [key: string]: unknown
  }
  mustChangePassword: boolean
  issuedAt: string
  absoluteExpiresAt: string
  idleExpiresAt: string
  renewable: boolean
  ticketLifetimeSeconds: number
}

/** API-013: Lấy CSRF token (anonymous) */
export async function fetchCsrfToken(): Promise<CsrfResponse> {
  const res = await apiClient.get<CsrfResponse>('/auth/web/csrf')
  return res.data
}

/** API-014: Đăng nhập */
export async function loginApi(
  payload: LoginRequest,
  csrfToken: string
): Promise<SessionResponse> {
  const res = await apiClient.post<SessionResponse>('/auth/web/login', payload, {
    headers: { 'X-CSRF-TOKEN': csrfToken },
  })
  return res.data
}

/** API-015: Đăng xuất (cần Idempotency-Key) */
export async function logoutApi(csrfToken: string): Promise<void> {
  const idempotencyKey = crypto.randomUUID()
  await apiClient.post(
    '/auth/web/logout',
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
        'Idempotency-Key': idempotencyKey,
      },
    }
  )
}

/** API-016: Renew session */
export async function renewSessionApi(csrfToken: string): Promise<SessionResponse> {
  const res = await apiClient.post<SessionResponse>(
    '/auth/web/renew',
    {},
    {
      headers: { 'X-CSRF-TOKEN': csrfToken },
    }
  )
  return res.data
}

/** API-017: Kiểm tra session hiện tại */
export async function getSessionApi(): Promise<SessionResponse> {
  const res = await apiClient.get<SessionResponse>('/auth/web/session')
  return res.data
}
