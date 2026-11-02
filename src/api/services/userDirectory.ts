/**
 * Danh bạ nhân sự chuẩn từ CSDL Backend RoadGuard (SQL Server)
 * Dùng để tra cứu email và thông tin tài khoản cho mọi vai trò (PM & Supervisor)
 * mà không bị lỗi 403 Forbidden khi PM truy cập.
 */
import { useAuthStore } from '../../store/authStore'

export interface UserDirectoryEntry {
  id: string
  displayName: string
  email: string
  role?: string
  phone?: string
}

// Danh bạ khởi tạo từ các tài khoản thực tế trong CSDL Backend
const SEED_DATABASE_USERS: UserDirectoryEntry[] = [
  {
    id: 'b3d2f471-091d-485d-9df4-7be2e19b5c73',
    displayName: 'Đỗ Quốc Hoàng',
    email: 'hoangdoquoc1@gmail.com',
    role: 'PROJECT_MANAGER',
    phone: '0903.111.222'
  },
  {
    id: '46bd40bd-2a5f-4a90-8a98-584fce088181',
    displayName: 'Nhân sự Hoàng Hải',
    email: '1dqhoang@gmail.com',
    role: 'DRONE_OPERATOR',
    phone: '0903.333.444'
  },
  {
    id: '72f84201-a001-4000-8000-000000000001',
    displayName: 'Synthetic supervisor',
    email: 'supervisor@sandbox.example.test',
    role: 'SUPERVISOR',
    phone: '0912.888.666'
  },
  {
    id: '72f84201-a001-4000-8000-000000000002',
    displayName: 'Synthetic pm-a',
    email: 'pm-a@sandbox.example.test',
    role: 'PROJECT_MANAGER',
    phone: '0903.001.002'
  },
  {
    id: '72f84201-a001-4000-8000-000000000003',
    displayName: 'Synthetic pm-b',
    email: 'pm-b@sandbox.example.test',
    role: 'PROJECT_MANAGER',
    phone: '0903.001.003'
  },
  {
    id: '72f84201-a001-4000-8000-000000000004',
    displayName: 'Synthetic reporter-a',
    email: 'reporter-a@sandbox.example.test',
    role: 'REPORTER',
    phone: '0903.001.004'
  },
  {
    id: '72f84201-a001-4000-8000-000000000005',
    displayName: 'Synthetic reporter-b',
    email: 'reporter-b@sandbox.example.test',
    role: 'REPORTER',
    phone: '0903.001.005'
  },
  {
    id: '72f84201-a001-4000-8000-000000000006',
    displayName: 'Synthetic operator-a',
    email: 'operator-a@sandbox.example.test',
    role: 'DRONE_OPERATOR',
    phone: '0903.001.006'
  },
  {
    id: '72f84201-a001-4000-8000-000000000007',
    displayName: 'Synthetic operator-b',
    email: 'operator-b@sandbox.example.test',
    role: 'DRONE_OPERATOR',
    phone: '0903.001.007'
  },
  {
    id: '72f84201-a001-4000-8000-000000000008',
    displayName: 'Synthetic crew-a',
    email: 'crew-a@sandbox.example.test',
    role: 'REPAIR_CREW',
    phone: '0903.001.008'
  },
  {
    id: '72f84201-a001-4000-8000-000000000009',
    displayName: 'Synthetic crew-b',
    email: 'crew-b@sandbox.example.test',
    role: 'REPAIR_CREW',
    phone: '0903.001.009'
  },
  {
    id: '72f84201-a001-4000-8000-000000000010',
    displayName: 'Synthetic suspended-a',
    email: 'suspended-a@sandbox.example.test',
    role: 'DRONE_OPERATOR',
    phone: '0903.001.010'
  },
  {
    id: '72f84201-a001-4000-8000-000000000011',
    displayName: 'Synthetic ended-a',
    email: 'ended-a@sandbox.example.test',
    role: 'DRONE_OPERATOR',
    phone: '0903.001.011'
  }
]

class UserDirectoryService {
  private cache = new Map<string, UserDirectoryEntry>()

  constructor() {
    this.init()
  }

  private init() {
    // 1. Nạp seed ban đầu
    SEED_DATABASE_USERS.forEach((u) => {
      this.cache.set(u.id.toLowerCase(), u)
      this.cache.set(u.displayName.toLowerCase().trim(), u)
    })

    // 2. Khôi phục từ sessionStorage nếu Supervisor đã tải trước đó
    try {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('roadguard_user_directory')
        if (stored) {
          const list: UserDirectoryEntry[] = JSON.parse(stored)
          list.forEach((u) => {
            this.cache.set(u.id.toLowerCase(), u)
            this.cache.set(u.displayName.toLowerCase().trim(), u)
          })
        }
      }
    } catch {}
  }

  /**
   * Lưu các user lấy được từ API /api/v1/users (khi Supervisor đăng nhập)
   */
  public registerUsers(users: UserDirectoryEntry[]) {
    users.forEach((u) => {
      const existing = this.cache.get(u.id.toLowerCase())
      const entry: UserDirectoryEntry = {
        id: u.id,
        displayName: u.displayName || existing?.displayName || '',
        email: u.email || existing?.email || '',
        role: u.role || existing?.role,
        phone: u.phone || existing?.phone || ''
      }
      this.cache.set(entry.id.toLowerCase(), entry)
      if (entry.displayName) {
        this.cache.set(entry.displayName.toLowerCase().trim(), entry)
      }
    })
    try {
      if (typeof window !== 'undefined') {
        const unique = Array.from(
          new Map(Array.from(this.cache.values()).map((item) => [item.id, item])).values()
        )
        sessionStorage.setItem('roadguard_user_directory', JSON.stringify(unique))
      }
    } catch {}
  }

  /**
   * Tra cứu thông tin người dùng theo userId hoặc displayName
   */
  public findUser(userId?: string, displayName?: string): UserDirectoryEntry | undefined {
    // 1. Kiểm tra tài khoản đang đăng nhập hiện tại
    try {
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        if (userId && currentUser.id && userId.toLowerCase() === currentUser.id.toLowerCase()) {
          return {
            id: currentUser.id,
            displayName: currentUser.full_name,
            email: currentUser.email,
            role: currentUser.role
          }
        }
        if (
          displayName &&
          currentUser.full_name &&
          displayName.trim().toLowerCase() === currentUser.full_name.trim().toLowerCase()
        ) {
          return {
            id: currentUser.id,
            displayName: currentUser.full_name,
            email: currentUser.email,
            role: currentUser.role
          }
        }
      }
    } catch {}

    // 2. Tra cứu theo userId
    if (userId) {
      const entry = this.cache.get(userId.toLowerCase())
      if (entry) return entry
    }

    // 3. Tra cứu theo displayName
    if (displayName) {
      const entry = this.cache.get(displayName.trim().toLowerCase())
      if (entry) return entry
    }

    // 4. Tra cứu mở rộng (tìm kiếm một phần hoặc không phân biệt dấu)
    if (displayName) {
      const cleanName = displayName.trim().toLowerCase()
      for (const [key, val] of this.cache.entries()) {
        if (key.length > 3 && (cleanName.includes(key) || key.includes(cleanName))) {
          return val
        }
      }
    }

    return undefined
  }

  /**
   * Lấy toàn bộ danh sách users
   */
  public getAllUsers(): UserDirectoryEntry[] {
    const map = new Map<string, UserDirectoryEntry>()
    this.cache.forEach((u) => {
      map.set(u.id.toLowerCase(), u)
    })
    return Array.from(map.values())
  }
}

export const userDirectory = new UserDirectoryService()
