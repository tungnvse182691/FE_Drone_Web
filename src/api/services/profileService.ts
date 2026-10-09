import { RoleCode } from '../../types/enums'

export interface UserProfile {
  id: string
  username: string
  full_name: string
  email: string
  phone: string
  role: RoleCode
  role_title: string
  company: string
  department: string
  certificate: string
  certificate_expiry: string
  certificate_images?: string[]
  assigned_projects: string[]
  avatar_url: string
  joined_date: string
  status: 'ACTIVE' | 'SUSPENDED'
  device_info: string
  ip_address: string
  last_login: string
}

export interface UserSession {
  id: string
  device_name: string
  browser: string
  ip_address: string
  location: string
  last_active: string
  is_current: boolean
}

// In-memory mock database (0 localStorage, pure async API pattern)
const IN_MEMORY_PROFILES: Record<string, UserProfile> = {
  'usr-pm-01': {
    id: 'usr-pm-01',
    username: 'pmhoang@gmail.com',
    full_name: 'Đỗ Quốc Hoàng',
    email: 'pmhoang@gmail.com',
    phone: '0905 128 691',
    role: RoleCode.PROJECT_MANAGER,
    role_title: 'Chỉ huy trưởng dự án (Project Manager)',
    company: 'Công ty TNHH Xây dựng Bê tông Hoàng Hải',
    department: 'Ban Điều hành Dự án Bảo hành Đường bộ',
    certificate: 'Chứng chỉ Chỉ huy trưởng công trình Giao thông Cấp I (Số CCHN-XD-00892)',
    certificate_expiry: '15/12/2028',
    certificate_images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80'
    ],
    assigned_projects: [
      'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
      'Cao tốc Bắc - Nam (Gói thầu XL-03)'
    ],
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    joined_date: '10/05/2022',
    status: 'ACTIVE',
    device_info: 'MacBook Pro M2 / Chrome 128',
    ip_address: '113.161.44.82',
    last_login: 'Vừa xong'
  },
  'usr-sup-01': {
    id: 'usr-sup-01',
    username: 'suphoang@gmail.com',
    full_name: 'Kỹ sư Nguyễn Văn An',
    email: 'suphoang@gmail.com',
    phone: '0912 345 678',
    role: RoleCode.SUPERVISOR,
    role_title: 'Kỹ sư Giám sát / Đại diện Chủ đầu tư (Supervisor)',
    company: 'Công ty TNHH Xây dựng Bê tông Hoàng Hải',
    department: 'Ban Giám sát & Quản lý Chất lượng Công trình',
    certificate: 'Chứng chỉ Giám sát thi công xây dựng công trình GTVT Cấp I (Số CCHN-GS-01452)',
    certificate_expiry: '20/08/2029',
    certificate_images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
    ],
    assigned_projects: [
      'Toàn bộ gói thầu thi công & bảo hành Hoàng Hải'
    ],
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    joined_date: '01/02/2021',
    status: 'ACTIVE',
    device_info: 'Dell XPS 15 / Chrome 128',
    ip_address: '14.162.180.20',
    last_login: '10 phút trước'
  }
}

const IN_MEMORY_SESSIONS: Record<string, UserSession[]> = {
  'usr-pm-01': [
    {
      id: 'sess-01',
      device_name: 'MacBook Pro 14" M2',
      browser: 'Chrome 128.0 (macOS)',
      ip_address: '113.161.44.82',
      location: 'Đà Nẵng, Việt Nam',
      last_active: 'Đang hoạt động (Phiên hiện tại)',
      is_current: true
    },
    {
      id: 'sess-02',
      device_name: 'iPad Pro 11" M1',
      browser: 'Safari Mobile 17.4',
      ip_address: '113.161.44.90',
      location: 'Đà Nẵng, Việt Nam',
      last_active: '2 giờ trước',
      is_current: false
    }
  ],
  'usr-sup-01': [
    {
      id: 'sess-03',
      device_name: 'Dell XPS 15 9520',
      browser: 'Chrome 128.0 (Windows 11)',
      ip_address: '14.162.180.20',
      location: 'Huế, Việt Nam',
      last_active: 'Đang hoạt động (Phiên hiện tại)',
      is_current: true
    }
  ]
}

export const profileService = {
  /**
   * Lấy thông tin hồ sơ người dùng (GET /users/me hoặc GET /users/{userId}/profile)
   */
  async getProfile(userId?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 120))
    const targetId = userId || 'usr-pm-01'
    const profile = IN_MEMORY_PROFILES[targetId] || IN_MEMORY_PROFILES['usr-pm-01']
    return { ...profile }
  },

  /**
   * Cập nhật thông tin hồ sơ (PUT /users/{userId}/profile)
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200))
    const existing = IN_MEMORY_PROFILES[userId] || IN_MEMORY_PROFILES['usr-pm-01']
    const updated: UserProfile = {
      ...existing,
      ...data,
      id: existing.id // Bảo vệ id bất biến
    }
    IN_MEMORY_PROFILES[userId] = updated
    return { ...updated }
  },

  /**
   * Đổi mật khẩu (POST /auth/change-password)
   */
  async changePassword(
    _userId: string,
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 250))
    if (!currentPass) {
      throw new Error('Vui lòng nhập mật khẩu hiện tại.')
    }
    if (newPass.length < 8) {
      throw new Error('Mật khẩu mới phải có tối thiểu 8 ký tự theo quy định BR-02.')
    }
    return {
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công. Vui lòng ghi nhớ mật khẩu mới.'
    }
  },

  /**
   * Lấy danh sách phiên đăng nhập (GET /users/{userId}/sessions)
   */
  async getSessions(userId: string): Promise<UserSession[]> {
    await new Promise((r) => setTimeout(r, 100))
    return (IN_MEMORY_SESSIONS[userId] || []).map((s) => ({ ...s }))
  },

  /**
   * Đăng xuất phiên làm việc từ xa (DELETE /users/{userId}/sessions/{sessionId})
   */
  async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 150))
    if (IN_MEMORY_SESSIONS[userId]) {
      IN_MEMORY_SESSIONS[userId] = IN_MEMORY_SESSIONS[userId].filter((s) => s.id !== sessionId)
    }
    return true
  }
}
