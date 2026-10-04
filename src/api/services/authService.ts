import { RoleCode } from '../../types/enums'
import { User } from '../../types/domain'

export const authService = {
  getCurrentRole(): RoleCode {
    try {
      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        return parsed?.state?.user?.role || RoleCode.PROJECT_MANAGER
      }
    } catch (e) {
      console.warn('Failed to parse auth-storage', e)
    }
    return RoleCode.PROJECT_MANAGER
  },

  getCurrentUser(): User {
    try {
      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state?.user) return parsed.state.user
      }
    } catch (e) {
      console.warn('Failed to parse auth-storage', e)
    }
    return {
      id: 'usr-pm-01',
      username: 'pmhoang@gmail.com',
      full_name: 'Đỗ Quốc Hoàng (PM)',
      email: 'pmhoang@gmail.com',
      role: RoleCode.PROJECT_MANAGER,
      must_change_password: false
    }
  }
}
