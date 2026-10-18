import { create } from 'zustand'
import { RoleCode } from '../types/enums'
import { User } from '../types/domain'
import { mockUsers } from '../api/mock/data'
import {
  fetchCsrfToken,
  loginApi,
  logoutApi,
  getSessionApi,
  SessionResponse,
} from '../api/auth'

// 17_10: Web dùng cookie WebSession + CSRF, KHÔNG dùng Bearer token
// VITE_USE_MOCK_AUTH=true để dùng mock khi BE chưa sẵn sàng
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || !import.meta.env.VITE_API_URL

interface AuthState {
  user: User | null
  csrfToken: string | null
  isAuthenticated: boolean
  mustChangePassword: boolean
  // Mock-only (giữ tương thích)
  login: (role: RoleCode) => void
  setUserAndToken: (user: User) => void
  // 17_10
  setCsrfToken: (token: string) => void
  setSession: (session: SessionResponse) => void
  loginWithCredentials: (email: string, password: string) => Promise<void>
  checkSession: () => Promise<boolean>
  ensureCsrfToken: () => Promise<string>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

function sessionToUser(session: SessionResponse): User {
  const u = session.user
  return {
    id: u.id,
    email: u.email,
    username: u.email,
    full_name: u.fullName,
    fullName: u.fullName,
    role: u.role as RoleCode,
    must_change_password: session.mustChangePassword,
  } as User
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Không hardcode: Khi mới mở trang chưa đăng nhập thì phiên là null
  user: null,
  csrfToken: null,
  isAuthenticated: false,
  mustChangePassword: false,

  // Mock login (giữ cho dev khi BE chưa sẵn sàng)
  login: (role: RoleCode) => {
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0]
    set({
      user: { ...user },
      isAuthenticated: true,
    })
  },

  setUserAndToken: (user: User) => {
    set({
      user: { ...user },
      isAuthenticated: true,
    })
  },

  setCsrfToken: (token: string) => {
    set({ csrfToken: token })
  },

  setSession: (session: SessionResponse) => {
    set({
      user: sessionToUser(session),
      isAuthenticated: true,
      mustChangePassword: session.mustChangePassword,
    })
  },

  ensureCsrfToken: async () => {
    const existing = get().csrfToken
    if (existing) return existing
    const { requestToken } = await fetchCsrfToken()
    set({ csrfToken: requestToken })
    return requestToken
  },

  loginWithCredentials: async (email: string, password: string) => {
    if (USE_MOCK) {
      // Mock fallback: tìm user theo email
      const user = mockUsers.find((u) => u.email === email) || mockUsers[0]
      set({
        user: { ...user },
        isAuthenticated: true,
      })
      return
    }
    const csrfToken = await get().ensureCsrfToken()
    const session = await loginApi({ email, password }, csrfToken)
    get().setSession(session)
  },

  checkSession: async () => {
    if (USE_MOCK) {
      return get().isAuthenticated
    }
    try {
      const session = await getSessionApi()
      get().setSession(session)
      return true
    } catch {
      set({ user: null, isAuthenticated: false })
      return false
    }
  },

  logout: async () => {
    const csrfToken = get().csrfToken
    if (!USE_MOCK && csrfToken) {
      try {
        await logoutApi(csrfToken)
      } catch {
        // Logout BE fail thì vẫn clear local state
      }
    }
    set({
      user: null,
      csrfToken: null,
      isAuthenticated: false,
      mustChangePassword: false,
    })
  },

  updateUser: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }))
  },
}))
