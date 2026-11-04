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


export interface SelfPhoneNumberFact {
  phoneNumber: string | null
  phoneNumberConfirmed: boolean
  version: string
  etag: string
}

interface PhoneCommand {
  session: string
  phoneNumber: string
  etag: string
  key: string
  busy: boolean
}

let phoneSessionEpoch = 0
let phoneCommand: PhoneCommand | null = null
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id || state.user?.role !== previous.user?.role ||
      state.token !== previous.token || state.isAuthenticated !== previous.isAuthenticated) {
    phoneSessionEpoch++
    phoneCommand = null
  }
})

export function getPhoneSessionKey(): string {
  const state = useAuthStore.getState()
  return JSON.stringify([phoneSessionEpoch, state.user?.id, state.user?.role, state.isAuthenticated])
}

function assertPhoneSession(session: string): void {
  if (session !== getPhoneSessionKey()) throw new Error('Phiên tài khoản đã thay đổi; hãy tải lại số điện thoại.')
}

// MeController -> StaffPhoneNumberService at backend 7be7ffc. No target user ID.
export const selfPhoneService = {
  pending() { return phoneCommand && phoneCommand.session === getPhoneSessionKey() ? { ...phoneCommand } : null },

  async read(signal?: AbortSignal): Promise<SelfPhoneNumberFact> {
    const session = getPhoneSessionKey()
    const response = await apiClient.get<Omit<SelfPhoneNumberFact, 'etag'>>('/me/phone-number', { signal })
    assertPhoneSession(session)
    const etag = response.headers.etag
    const data = response.data
    if (typeof etag !== 'string' || !/^"[A-Za-z0-9+/]{11}="$/.test(etag) ||
        data.version !== etag.slice(1, -1) || typeof data.phoneNumberConfirmed !== 'boolean' ||
        !(data.phoneNumber === null || typeof data.phoneNumber === 'string')) {
      throw new Error('Dữ liệu số điện thoại hoặc ETag không hợp lệ; không thể cập nhật.')
    }
    return { ...data, etag }
  },

  async save(phoneNumber: string, etag: string, replay = false): Promise<void> {
    const session = getPhoneSessionKey()
    const normalized = phoneNumber.trim()
    if (!/^\+?[0-9]{7,15}$/.test(normalized)) throw new Error('Số điện thoại cần 7–15 chữ số, có thể bắt đầu bằng +.')
    if (!/^"[A-Za-z0-9+/]{11}="$/.test(etag)) throw new Error('Thiếu ETag hiện hành; hãy tải lại số điện thoại.')
    if (phoneCommand && (phoneCommand.busy || !replay || phoneCommand.phoneNumber !== normalized || phoneCommand.etag !== etag)) {
      throw new Error('Lệnh trước chưa rõ kết quả. Hãy đối chiếu hoặc gửi lại đúng lệnh đã giữ.')
    }
    const command = phoneCommand || { session, phoneNumber: normalized, etag, key: crypto.randomUUID(), busy: false }
    phoneCommand = command
    command.busy = true
    try {
      // Cookie transport uses the existing anonymous CSRF bootstrap/store mechanism.
      const headers: Record<string, string> = { 'If-Match': command.etag, 'Idempotency-Key': command.key }
      if (!useAuthStore.getState().token) headers['X-CSRF-TOKEN'] = await useAuthStore.getState().ensureCsrfToken()
      assertPhoneSession(session)
      const response = await apiClient.patch('/me/phone-number', { phoneNumber: command.phoneNumber }, {
        headers,
        // Axios may retry after session renewal. Fence again at dispatch so an
        // old actor's command never reaches /me under a newly selected account.
        transformRequest: [body => {
          assertPhoneSession(session)
          return typeof body === 'string' ? body : JSON.stringify(body)
        }]
      })
      assertPhoneSession(session)
      if (response.status !== 204) throw new Error('Phản hồi cập nhật không đúng contract 204; cần đối chiếu lại.')
      if (phoneCommand === command) phoneCommand = null
    } catch (error: any) {
      // A definitive 4xx rejects this command. Network/5xx outcome stays pending;
      // never replace its body/key/version automatically, even after a GET matches.
      if (phoneCommand === command && error.response?.status >= 400 && error.response.status < 500) phoneCommand = null
      throw error
    } finally {
      command.busy = false
    }
  }
}
