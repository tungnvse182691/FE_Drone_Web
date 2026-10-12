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
  // Mặc định đăng nhập với tài khoản Kỹ sư Nguyễn Văn An (SUPERVISOR) trong bộ nhớ để kiểm thử các bước SUP
  user: mockUsers[1],
  token: 'mock-jwt-token-an-sup',
  isAuthenticated: true,

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
