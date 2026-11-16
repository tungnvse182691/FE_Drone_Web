import { RoleCode } from '../../types/enums'
import { User } from '../../types/domain'
import {
  getSessionApi,
  changePasswordApi,
} from '../auth'
import { useAuthStore } from '../../store/authStore'

let currentSessionUser: User | null = null

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ChangePasswordPayload {
  tempPassword: string
  newPassword: string
}

export const authService = {
  /**
   * Đăng nhập hệ thống (gọi Backend Candidate3)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await useAuthStore.getState().loginWithCredentials(credentials.email, credentials.password)
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Không xác định được tài khoản từ phiên Web.')
    currentSessionUser = { ...user }
    return { user, token: '' }
  },

  /**
   * Đổi mật khẩu lần đầu / Cập nhật mật khẩu bảo mật (API-004)
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; user: User | null; requiresLogin?: boolean }> {
    const state = useAuthStore.getState()
    const epoch = state.authEpoch
    const actor = state.user?.id
    const current = () => {
      const now = useAuthStore.getState()
      if (!actor || now.authEpoch !== epoch || now.user?.id !== actor || !now.isAuthenticated) {
        throw new Error('Phiên đã thay đổi; bỏ yêu cầu đổi mật khẩu cũ.')
      }
    }
    current()
    let passwordChanged = false
    try {
      const csrfToken = await state.ensureCsrfToken()
      current()
      await changePasswordApi({ currentPassword: payload.tempPassword, newPassword: payload.newPassword }, csrfToken, current)
      current()
      passwordChanged = true
      const session = await getSessionApi()
      current()
      if (session.user.id !== actor || session.mustChangePassword) throw new Error('Chưa xác nhận đổi mật khẩu thành công từ phiên máy chủ.')
      useAuthStore.getState().setSession(session)
      const user = useAuthStore.getState().user!
      currentSessionUser = { ...user }
      return { success: true, user }
    } catch (error: any) {
      if (passwordChanged && useAuthStore.getState().authEpoch === epoch) {
        const detail = error?.response?.data?.code || error?.message || 'Lỗi đọc phiên'
        useAuthStore.getState().expireSession(error?.response?.status === 401
          ? 'Mật khẩu đã đổi. Vui lòng đăng nhập lại bằng mật khẩu mới.'
          : `Mật khẩu đã đổi; chưa xác nhận lại phiên (${detail}). Vui lòng đăng nhập lại bằng mật khẩu mới.`)
        currentSessionUser = null
        return { success: true, user: null, requiresLogin: true }
      }
      if (useAuthStore.getState().authEpoch === epoch && error?.response?.status === 401 && error?.response?.data?.code !== 'auth_invalid_credentials') {
        useAuthStore.getState().expireSession('Phiên không còn hợp lệ. Vui lòng đăng nhập lại.')
        currentSessionUser = null
      }
      throw error
    }
  },

  /**
   * Đăng xuất phiên làm việc hiện tại (API-015)
   */
  async logout(): Promise<void> {
    await useAuthStore.getState().logout()
    currentSessionUser = null
  },

  /**
   * Lấy người dùng phiên hiện tại (API-017)
   */
  async getCurrentUser(): Promise<User | null> {
    if (!await useAuthStore.getState().checkSession()) return null
    return useAuthStore.getState().user
  },


  /**
   * Phương thức tương thích ngược
   */
  getCurrentRole(): RoleCode {
    return currentSessionUser?.role || RoleCode.PROJECT_MANAGER
  }
}
