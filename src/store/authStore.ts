import { create } from 'zustand'
import { RoleCode } from '../types/enums'
import { User } from '../types/domain'
import { mockUsers } from '../api/mock/data'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (role: RoleCode) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Mặc định đăng nhập với tài khoản Hoàng (Project Manager)
  user: mockUsers[0],
  token: 'mock-jwt-token-hoang-pm',
  isAuthenticated: true,

  login: (role: RoleCode) => {
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0]
    set({
      user: { ...user },
      token: `mock-jwt-token-${user.id}`,
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
}))
