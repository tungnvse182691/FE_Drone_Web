import { RoleCode } from '../../types/enums'
import { User } from '../../types/domain'

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

let currentSessionUser: User | null = { ...IN_MEMORY_USERS[0] }

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
   * Đăng nhập hệ thống (Bất đồng bộ - Giả lập Mock REST API)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 350))

    const normalizedEmail = credentials.email.trim().toLowerCase()
    const foundUser = IN_MEMORY_USERS.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail ||
        u.username.toLowerCase() === normalizedEmail
    )

    if (!foundUser || foundUser.password_hash !== credentials.password) {
      throw new Error('Email hoặc mật khẩu không chính xác')
    }

    // Sao chép thông tin người dùng bỏ hash mật khẩu
    const { password_hash, ...safeUser } = foundUser
    currentSessionUser = { ...safeUser }

    return {
      user: safeUser,
      token: `bearer-mock-token-${foundUser.id}-${Date.now()}`
    }
  },

  /**
   * Đổi mật khẩu lần đầu / Cập nhật mật khẩu bảo mật
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; user: User }> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    if (!currentSessionUser) {
      throw new Error('Chưa đăng nhập phiên làm việc')
    }

    const userIndex = IN_MEMORY_USERS.findIndex((u) => u.id === currentSessionUser?.id)
    if (userIndex === -1) {
      throw new Error('Không tìm thấy tài khoản người dùng')
    }

    // Cập nhật mật khẩu và gỡ cờ đổi mật khẩu bắt buộc
    IN_MEMORY_USERS[userIndex].password_hash = payload.newPassword
    IN_MEMORY_USERS[userIndex].must_change_password = false

    const { password_hash, ...safeUser } = IN_MEMORY_USERS[userIndex]
    currentSessionUser = { ...safeUser }

    return {
      success: true,
      user: safeUser
    }
  },

  /**
   * Đăng xuất phiên làm việc hiện tại
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    currentSessionUser = null
  },

  /**
   * Lấy người dùng phiên hiện tại
   */
  async getCurrentUser(): Promise<User | null> {
    return currentSessionUser ? { ...currentSessionUser } : null
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
