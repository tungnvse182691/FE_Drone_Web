import { create } from 'zustand'
import { RoleCode } from '../types/enums'
import { User } from '../types/domain'
import { mockUsers } from '../api/mock/data'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (role: RoleCode) => void
  setUserAndToken: (user: User, token: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Không hardcode: Khi mới mở trang chưa đăng nhập thì phiên là null
  user: null,
  token: null,
  isAuthenticated: false,

  login: (role: RoleCode) => {
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0]
    set({
      user: { ...user },
      token: `mock-jwt-token-${user.id}`,
      isAuthenticated: true,
    })
  },

  setUserAndToken: (user: User, token: string) => {
    set({
      user: { ...user },
      token,
      isAuthenticated: true,
    })
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  updateUser: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null
    }))
  }
}))
