import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import { renewSessionApi } from './auth'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 17_10: Web dùng cookie WebSession, browser tự gửi cookie
  withCredentials: true,
})

// Request Interceptor: gắn CSRF token (17_10: X-CSRF-TOKEN)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = useAuthStore.getState().csrfToken
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Flag chống renew đồng thời nhiều lần (single-flight)
let renewPromise: Promise<void> | null = null

// Response Interceptor: xử lý 401/403 theo 17_10
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 401: thử renew 1 lần rồi retry (chỉ cho request idempotent hoặc chưa retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Single-flight: nếu đang renew thì đợi
        if (!renewPromise) {
          renewPromise = (async () => {
            const csrfToken = useAuthStore.getState().csrfToken
            if (!csrfToken) throw new Error('No CSRF token for renew')
            const session = await renewSessionApi(csrfToken)
            useAuthStore.getState().setSession(session)
          })().finally(() => {
            renewPromise = null
          })
        }
        await renewPromise
        // Renew thành công, retry request gốc
        return apiClient(originalRequest)
      } catch {
        // Renew fail -> logout
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    // 403: hiển thị denial, KHÔNG tự logout (theo 17_10)
    // Để UI xử lý thông báo

    return Promise.reject(error)
  }
)
