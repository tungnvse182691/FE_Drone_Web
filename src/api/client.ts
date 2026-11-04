import axios, { AxiosError, InternalAxiosRequestConfig, CanceledError } from 'axios'
import { useAuthStore } from '../store/authStore'

interface WebRequestConfig extends InternalAxiosRequestConfig {
  webEpoch?: number
  webRetried?: boolean
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

function isAuthRequest(url = ''): boolean {
  return /^\/?auth\//.test(url) || url.includes('/api/v1/auth/') || url.includes('/invitations/accept')
}
function current(config: WebRequestConfig): boolean {
  const state = useAuthStore.getState()
  return config.webEpoch === state.authEpoch && state.isAuthenticated && state.status !== 'logging-out'
}

apiClient.interceptors.request.use(async (request: WebRequestConfig) => {
  // This shared Web client never borrows a Bearer credential, including legacy callers.
  request.headers.delete('Authorization')
  if (isAuthRequest(request.url)) return request
  const state = useAuthStore.getState()
  request.webEpoch ??= state.authEpoch
  if (!current(request)) throw new CanceledError('Phiên Web đã thay đổi hoặc chưa sẵn sàng.')
  const mutation = !['get', 'head', 'options'].includes((request.method || 'get').toLowerCase())
  if (mutation) {
    request.headers['X-CSRF-TOKEN'] = await state.ensureCsrfToken()
    if (!current(request)) throw new CanceledError('Bỏ lệnh của phiên Web cũ.')
  }
  return request
})

apiClient.interceptors.response.use(
  response => {
    const config = response.config as WebRequestConfig
    if (!isAuthRequest(config.url) && !current(config)) throw new CanceledError('Bỏ phản hồi của phiên Web cũ.')
    return response
  },
  async (error: AxiosError) => {
    const request = error.config as WebRequestConfig | undefined
    // Bootstrap/login/renew/logout handle their own outcome. Never recurse on 401.
    if (!request || isAuthRequest(request.url)) throw error
    if (!current(request)) throw new CanceledError('Bỏ lỗi của phiên Web cũ.')
    if (error.response?.status !== 401) throw error
    if (request.webRetried) {
      error.message = `API ${request.url} từ chối xác thực dù phiên Web hợp lệ. Cần kiểm tra cookie eligibility/quyền backend; không chuyển sang Bearer.`
      throw error
    }
    request.webRetried = true
    await useAuthStore.getState().recoverSession()
    if (!current(request)) throw new CanceledError('Phiên đã thay đổi trong khi kiểm tra xác thực.')
    // A valid session may still receive 401 from a Bearer-only operation.
    // Only reads replay once; mutation identity/body/If-Match remain with its caller.
    if (['get', 'head'].includes((request.method || 'get').toLowerCase())) return apiClient(request)
    throw error
  }
)
