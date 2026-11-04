import { RoleCode } from '../../types/enums'
import { User } from '../../types/domain'
import {
  getSessionApi,
  changePasswordApi,
} from '../auth'
import { useAuthStore } from '../../store/authStore'

interface MockUser extends User {
  password_hash: string
  phone?: string
  department?: string
  cchn_number?: string
  cchn_expiration?: string
}

// Dữ liệu người dùng mẫu trong bộ nhớ (In-memory Mock API - Không sử dụng localStorage)
const IN_MEMORY_USERS: MockUser[] = [
  {
    id: 'usr-pm-01',
    username: 'pmhoang@gmail.com',
    full_name: 'Đỗ Quốc Hoàng',
    email: 'pmhoang@gmail.com',
    role: RoleCode.PROJECT_MANAGER,
    must_change_password: false,
    phone: '0912 345 678',
    department: 'Ban Điều hành Dự án Hoàng Hải',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cchn_number: 'GS-XD-88192-HN',
    cchn_expiration: '2028-12-31',
    password_hash: '123456'
  },
  {
    id: 'usr-sup-01',
    username: 'suphoang@gmail.com',
    full_name: 'Trần Văn Giám Sát',
    email: 'suphoang@gmail.com',
    role: RoleCode.SUPERVISOR,
    must_change_password: false,
    phone: '0988 765 432',
    department: 'Ban Quản lý Dự án & Giám sát Kỹ thuật',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cchn_number: 'GS-XD-99214-GTVT',
    cchn_expiration: '2027-10-15',
    password_hash: '123456'
  },
  {
    id: 'usr-op-01',
    username: 'operator@hoanghai.vn',
    full_name: 'Lê Phi Công',
    email: 'operator@hoanghai.vn',
    role: RoleCode.DRONE_OPERATOR,
    must_change_password: false,
    phone: '0903 112 233',
    department: 'Đội Khảo sát Trắc địa Drone',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    cchn_number: 'PL-DRONE-0012',
    cchn_expiration: '2029-05-20',
    password_hash: '123456'
  },
  {
    id: 'usr-crew-01',
    username: 'crew@hoanghai.vn',
    full_name: 'Nguyễn Văn Đội',
    email: 'crew@hoanghai.vn',
    role: RoleCode.REPAIR_CREW,
    must_change_password: false,
    phone: '0977 445 566',
    department: 'Đội Thi công Khắc phục Mặt đường',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    cchn_number: 'TC-XD-55123',
    cchn_expiration: '2026-11-30',
    password_hash: '123456'
  }
]

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
   * Đăng nhập hệ thống (Hỗ trợ gọi Backend Candidate3 hoặc Mock Fallback)
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
   * Quản trị viên đặt lại mật khẩu cho nhân sự (CN10 / operation_catalog.md L19)
   * POST /users/{userId}/password-reset
   * Cấp mật khẩu tạm thời và bật cờ must_change_password: true
   */
  async adminResetPassword(
    userId: string,
    tempPassword: string = 'RoadGuard@2026'
  ): Promise<{ success: boolean; tempPassword: string; mustChangePassword: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 350))

    const targetUser = IN_MEMORY_USERS.find((u) => u.id === userId || u.email === userId)
    if (targetUser) {
      targetUser.password_hash = tempPassword
      targetUser.must_change_password = true
    }

    return {
      success: true,
      tempPassword,
      mustChangePassword: true
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
   * Xác thực mã lời mời thành viên mới
   */
  async verifyInvitationToken(token: string): Promise<{
    valid: boolean
    email?: string
    role?: RoleCode
    invitedBy?: string
  }> {
    await new Promise((resolve) => setTimeout(resolve, 250))
    if (!token || token.toLowerCase().includes('expired')) {
      return { valid: false }
    }
    return {
      valid: true,
      email: 'ky.su.moi@hoanghai.vn',
      role: RoleCode.PROJECT_MANAGER,
      invitedBy: 'Đỗ Quốc Hoàng (Chỉ huy trưởng)'
    }
  },

  /**
   * Kích hoạt tài khoản từ lời mời
   */
  async acceptInvitation(
    token: string,
    data: { fullName: string; password: string }
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const newUser: User = {
      id: `usr-inv-${Date.now()}`,
      username: 'ky.su.moi@hoanghai.vn',
      full_name: data.fullName,
      email: 'ky.su.moi@hoanghai.vn',
      role: RoleCode.PROJECT_MANAGER,
      must_change_password: false
    }
    currentSessionUser = { ...newUser }
    return {
      user: newUser,
      token: `bearer-mock-token-${newUser.id}-${Date.now()}`
    }
  },

  /**
   * Phương thức tương thích ngược
   */
  getCurrentRole(): RoleCode {
    return currentSessionUser?.role || RoleCode.PROJECT_MANAGER
  }
}
