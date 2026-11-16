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

// Không còn danh bạ mẫu trong FE: nhân sự lấy từ API BE (registerUsers)
const SEED_DATABASE_USERS: UserDirectoryEntry[] = []

class UserDirectoryService {
  private cache = new Map<string, UserDirectoryEntry>()

  constructor() {
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') this.init()
  }

  public clearSessionCache() {
    this.cache.clear()
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('roadguard_user_directory')
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

useAuthStore.subscribe((state, previous) => {
  if (state.authEpoch !== previous.authEpoch) userDirectory.clearSessionCache()
})
