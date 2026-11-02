import { apiClient } from '../client'
import { RoleCode } from '../../types/enums'
import { projectService } from './projectService'
import { useAuthStore } from '../../store/authStore'

/**
 * ============================================================================
 * MODULE: profileService (Quản lý Hồ sơ Cá nhân & Bảo mật Tài khoản)
 * KẾT NỐI TRỰC TIẾP API BACKEND CANDIDATE3 (DOCKER) - 100% DATABASE THẬT
 * Căn cứ Spec 17_10:
 * - API-047: GET /api/v1/profile (Lấy hồ sơ cá nhân hiện tại)
 * - API-048: PUT /api/v1/profile (Cập nhật displayName và thông tin hồ sơ)
 * - API-004: POST /api/v1/auth/change-password (Đổi mật khẩu người dùng)
 * - API-006: GET /api/v1/projects (Danh sách dự án đang phụ trách thật)
 * ============================================================================
 */

export interface UserProfileFact {
  userId: string
  username: string
  displayName: string
  email: string
  roleCode: RoleCode
  roleTitle: string
  status: string
  rowVersion: string
  assignedProjects: Array<{ id: string; name: string; code?: string }>
}

export interface UpdateProfilePayload {
  displayName: string
  email?: string
  expectedRowVersion: string
}

export const profileService = {
  /**
   * Lấy thông tin hồ sơ người dùng đang đăng nhập từ Backend thật (API-047)
   */
  async getProfile(): Promise<UserProfileFact> {
    console.log('🚀 [CANDIDATE3 BE] Gọi GET /api/v1/profile...')
    const res = await apiClient.get<{
      userId: string
      username?: string | null
      displayName?: string | null
      email?: string | null
      roleCode?: string | null
      status?: string | null
      rowVersion?: string | null
    }>('/profile')

    const data = res.data
    const normalizedRole = (data.roleCode || 'PM').toUpperCase()
    const role: RoleCode = normalizedRole.includes('SUPERVISOR')
      ? RoleCode.SUPERVISOR
      : normalizedRole.includes('DRONE') || normalizedRole.includes('OPERATOR')
      ? RoleCode.DRONE_OPERATOR
      : normalizedRole.includes('CREW')
      ? RoleCode.REPAIR_CREW
      : RoleCode.PROJECT_MANAGER

    const roleTitle =
      role === RoleCode.SUPERVISOR
        ? 'Kỹ sư Giám sát / Đại diện Chủ đầu tư (Supervisor)'
        : role === RoleCode.PROJECT_MANAGER
        ? 'Chỉ huy trưởng dự án (Project Manager)'
        : role === RoleCode.DRONE_OPERATOR
        ? 'Phi công điều khiển Drone (Drone Operator)'
        : 'Đội trưởng thi công & Sửa chữa (Repair Crew)'

    // Lấy danh sách dự án thật mà tài khoản đang được phân công (API-006)
    const projects = await projectService.fetchProjects().catch(() => [])

    return {
      userId: data.userId,
      username: data.username || data.email || '',
      displayName: data.displayName || data.username || 'Nhân sự Hoàng Hải',
      email: data.email || data.username || '',
      roleCode: role,
      roleTitle,
      status: data.status || 'ACTIVE',
      rowVersion: data.rowVersion || '',
      assignedProjects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code
      }))
    }
  },

  /**
   * Cập nhật thông tin hồ sơ người dùng vào CSDL Backend (API-048: PUT /api/v1/profile)
   * Yêu cầu Backend Candidate3: { displayName, email, expectedRowVersion, operationId }
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfileFact> {
    console.log('🚀 [CANDIDATE3 BE] Gửi PUT /api/v1/profile...', payload)

    const currentUser = useAuthStore.getState().user
    const email = payload.email?.trim() || currentUser?.email || ''

    const requestBody = {
      displayName: payload.displayName.trim(),
      email: email,
      expectedRowVersion: payload.expectedRowVersion,
      operationId: crypto.randomUUID()
    }

    const res = await apiClient.put<{
      userId: string
      username?: string | null
      displayName?: string | null
      email?: string | null
      roleCode?: string | null
      status?: string | null
      rowVersion?: string | null
    }>('/profile', requestBody)

    const updated = res.data
    const normalizedRole = (updated.roleCode || 'PM').toUpperCase()
    const role: RoleCode = normalizedRole.includes('SUPERVISOR')
      ? RoleCode.SUPERVISOR
      : normalizedRole.includes('DRONE') || normalizedRole.includes('OPERATOR')
      ? RoleCode.DRONE_OPERATOR
      : normalizedRole.includes('CREW')
      ? RoleCode.REPAIR_CREW
      : RoleCode.PROJECT_MANAGER

    const projects = await projectService.fetchProjects().catch(() => [])

    return {
      userId: updated.userId,
      username: updated.username || updated.email || '',
      displayName: updated.displayName || payload.displayName,
      email: updated.email || email,
      roleCode: role,
      roleTitle:
        role === RoleCode.SUPERVISOR
          ? 'Kỹ sư Giám sát / Đại diện Chủ đầu tư (Supervisor)'
          : 'Chỉ huy trưởng dự án (Project Manager)',
      status: updated.status || 'ACTIVE',
      rowVersion: updated.rowVersion || payload.expectedRowVersion,
      assignedProjects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code
      }))
    }
  },

  /**
   * Đổi mật khẩu người dùng (API-004: POST /api/v1/auth/change-password)
   */
  async changePassword(currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    console.log('🚀 [CANDIDATE3 BE] Đổi mật khẩu cá nhân POST /api/v1/auth/change-password...')

    try {
      await apiClient.post(
        '/auth/change-password',
        {
          currentPassword: currentPass,
          newPassword: newPass
        },
        {
          headers: {
            'Idempotency-Key': crypto.randomUUID()
          }
        }
      )

      return {
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công qua hệ thống bảo mật Backend.'
      }
    } catch (err: any) {
      const data = err?.response?.data
      const code = data?.code || ''
      const detail = data?.detail || ''

      if (code === 'auth_invalid_credentials' || detail.includes('authentication request could not be completed')) {
        throw new Error('Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại mật khẩu đang sử dụng.')
      }

      if (code === 'validation_error') {
        throw new Error('Mật khẩu mới không đạt yêu cầu bảo mật (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).')
      }

      throw new Error(detail || data?.title || err?.message || 'Không thể đổi mật khẩu trên hệ thống bảo mật.')
    }
  }
}
