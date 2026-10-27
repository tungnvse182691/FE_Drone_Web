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
  token: string | null
  csrfToken: string | null
  isAuthenticated: boolean
  mustChangePassword: boolean
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  // Mock-only (giữ tương thích)
  login: (role: RoleCode) => void
  setUserAndToken: (user: User, token?: string | null) => void
  // 17_10
  setCsrfToken: (token: string) => void
  setSession: (session: SessionResponse) => void
  loginWithCredentials: (email: string, password: string) => Promise<void>
  checkSession: () => Promise<boolean>
  ensureCsrfToken: () => Promise<string>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

function normalizeRole(roleStr: string): RoleCode {
  const upper = (roleStr || '').toUpperCase().replace(/[^A-Z]/g, '')
  if (upper.includes('SUPERVISOR')) return RoleCode.SUPERVISOR
  if (upper.includes('PROJECT') || upper.includes('PM') || upper.includes('MANAGER')) return RoleCode.PROJECT_MANAGER
  if (upper.includes('DRONE') || upper.includes('OPERATOR')) return RoleCode.DRONE_OPERATOR
  if (upper.includes('CREW')) return RoleCode.REPAIR_CREW
  return RoleCode.PROJECT_MANAGER
}

function sessionToUser(session: SessionResponse): User {
  const u = session.user as any
  const name = u.fullName || u.displayName || 'Người dùng RoadGuard'
  const email = u.email || 'pm-a@sandbox.example.test'
  return {
    id: u.id,
    email,
    username: email,
    full_name: name,
    fullName: name,
    role: normalizeRole(u.role),
    must_change_password: session.mustChangePassword,
  } as User
}


const savedToken = typeof window !== 'undefined' ? sessionStorage.getItem('rg_token') : null
let savedUser: User | null = null
try {
  const u = typeof window !== 'undefined' ? sessionStorage.getItem('rg_user') : null
  if (u) savedUser = JSON.parse(u)
} catch {}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: savedUser,
  token: savedToken,
  csrfToken: null,
  isAuthenticated: !!savedUser,
  mustChangePassword: false,

  setToken: (token: string | null) => {
    if (token) {
      sessionStorage.setItem('rg_token', token)
    } else {
      sessionStorage.removeItem('rg_token')
    }
    set({ token })
  },

  setUser: (user: User | null) => {
    if (user) {
      sessionStorage.setItem('rg_user', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('rg_user')
    }
    set({ user, isAuthenticated: !!user })
  },

  // Mock login (giữ cho dev khi BE chưa sẵn sàng)
  login: (role: RoleCode) => {
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0]
    get().setUser(user)
  },

  setUserAndToken: (user: User, token?: string | null) => {
    if (token) {
      get().setToken(token)
    }
    get().setUser(user)
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
    sessionStorage.removeItem('rg_token')
    sessionStorage.removeItem('rg_user')
    try {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    } catch {}
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
      token: null,
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
