/**
 * Service Quản Trị Nhân Sự & Phân Quyền (Staff Directory, Users, Invitations)
 * Tuân thủ 100% Spec 17_10 và OpenAPI Candidate3:
 * - API-237: GET /api/v1/users - Danh sách nhân sự
 * - API-238: GET /api/v1/users/{userId} - Chi tiết tài khoản & ETag
 * - API-239: PATCH /api/v1/users/{userId} - Cập nhật trạng thái / vai trò
 * - API-240: POST /api/v1/users/{userId}/password-reset - Đặt lại mật khẩu tạm
 * - API-032: POST /api/v1/invitations - Gửi lời mời nhân sự và gán dự án
 * - API-112: GET /api/v1/projects/{projectId}/members - Thành viên dự án
 */

import { apiClient } from '../client'
import { RoleCode } from '../../types/enums'
import { SystemUserAccount } from '../../types/domain'
import { projectService } from './projectService'
import { userDirectory } from './userDirectory'
import { useAuthStore } from '../../store/authStore'

const memberWrites = new Set<string>()

export function projectMemberErrorMessage(error: any): string {
  console.warn('[Project members]', { status: error?.response?.status, code: error?.response?.data?.code,
    correlationId: error?.response?.data?.correlationId || error?.response?.headers?.['x-correlation-id'] })
  switch (error?.response?.status) {
    case 400: return 'Thông tin nhân sự chưa hợp lệ.'
    case 401: return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    case 403: return 'Bạn không có quyền quản lý thành viên của dự án này.'
    case 404: return 'Không tìm thấy dự án hoặc nhân sự.'
    case 409: return 'Nhân sự đã được thêm vào dự án hoặc membership đã thay đổi.'
    case 412: return 'Dữ liệu đã thay đổi. Vui lòng tải lại rồi thử lại.'
    case 428: return 'Thiếu thông tin phiên bản để thực hiện thao tác.'
    case 500: return 'Hệ thống đang gặp lỗi. Vui lòng thử lại sau.'
    default: return !error?.response && (error?.request || /network|timeout/i.test(error?.message || ''))
      ? 'Không thể kết nối đến hệ thống.' : 'Không thể hoàn tất yêu cầu.'
  }
}

export interface StaffUserDto {
  userId: string
  displayName?: string | null
  email?: string | null
  phoneNumber?: string | null
  role?: string | null
  status?: string | null
}

export interface StaffPageResponseDto {
  items: StaffUserDto[] | null
  nextCursor?: string | null
  asOf: string
}

export interface PrimaryProjectManagerReadDto {
  membershipId: string
  userId: string
  displayName?: string | null
  validFrom: string
  validTo?: string | null
  membershipVersion?: string | null
}

export interface ProjectMemberDto {
  membershipId: string
  userId: string
  displayName?: string | null
  role?: string | null
  isPrimary?: boolean
  status?: string | null
  validFrom?: string | null
  validTo?: string | null
  membershipVersion?: string | null
}

export interface ProjectMembersPageDto {
  items: ProjectMemberDto[] | null
  nextCursor?: string | null
  asOf: string
}

export interface UserDetailDto {
  id: string
  displayName?: string | null
  role?: string | null
  version?: string | null
}

export interface CreateInvitationPayload {
  email: string
  role: 'SUPERVISOR' | 'PM' | 'OPERATOR' | 'CREW'
  projectIds: string[]
}

export interface InvitationResponseDto {
  id: string
  status: string
  expiresAt: string
  version: string
}

export interface UpdateUserPayload {
  status: 'ACTIVE' | 'SUSPENDED'
  role: 'SUPERVISOR' | 'PM' | 'OPERATOR' | 'CREW' | 'REPORTER'
  reason: string
}

// Chuyển role từ wire format (Candidate3) sang RoleCode FE
export function mapBackendRoleToRoleCode(rawRole?: string | null): RoleCode {
  const normalized = (rawRole || '').toUpperCase().trim()
  if (normalized === 'SUPERVISOR') return RoleCode.SUPERVISOR
  if (normalized === 'PM' || normalized === 'PROJECT_MANAGER') return RoleCode.PROJECT_MANAGER
  if (normalized === 'OPERATOR' || normalized === 'DRONE_OPERATOR') return RoleCode.DRONE_OPERATOR
  if (normalized === 'CREW' || normalized === 'REPAIR_CREW') return RoleCode.REPAIR_CREW
  if (normalized === 'REPORTER') return RoleCode.REPORTER
  return RoleCode.PROJECT_MANAGER
}

// Chuyển RoleCode FE sang wire format backend
export function mapRoleCodeToBackendRole(role: RoleCode): 'SUPERVISOR' | 'PM' | 'OPERATOR' | 'CREW' | 'REPORTER' {
  switch (role) {
    case RoleCode.SUPERVISOR:
      return 'SUPERVISOR'
    case RoleCode.PROJECT_MANAGER:
      return 'PM'
    case RoleCode.DRONE_OPERATOR:
      return 'OPERATOR'
    case RoleCode.REPAIR_CREW:
      return 'CREW'
    case RoleCode.REPORTER:
      return 'REPORTER' as any
    default:
      return 'PM'
  }
}

// Lấy nhãn tiếng Việt chuẩn cho từng vai trò
export function getRoleLabel(role: RoleCode): string {
  switch (role) {
    case RoleCode.SUPERVISOR:
      return 'Giám sát (CĐT)'
    case RoleCode.PROJECT_MANAGER:
      return 'Chỉ huy trưởng (PM)'
    case RoleCode.DRONE_OPERATOR:
      return 'Kỹ sư Drone'
    case RoleCode.REPAIR_CREW:
      return 'Đội trưởng thi công'
    case RoleCode.REPORTER:
      return 'Người phản ánh (Reporter)'
    default:
      return 'Nhân sự kỹ thuật'
  }
}

export const personnelService = {
  // Directory only: choosing a PM must not depend on project/member/statistic reads.
  async fetchStaffDirectory(filters: { role?: string; status?: string; search?: string } = {}): Promise<StaffUserDto[]> {
    const epoch = useAuthStore.getState().authEpoch
    const items: StaffUserDto[] = []
    const seen = new Set<string>()
    let cursor: string | undefined
    do {
      const res = await apiClient.get<StaffPageResponseDto>('/users', { params: { ...filters, limit: 100, cursor } })
      if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ danh bạ cũ.')
      if (!Array.isArray(res.data?.items)) throw new Error('Danh bạ trả sai contract.')
      items.push(...res.data.items)
      cursor = res.data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor danh bạ bị lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return items
  },

  /**
   * Lấy danh sách toàn bộ nhân sự từ CSDL Backend (API-237: GET /api/v1/users)
   * Kèm thông tin phân công dự án thực tế từ bảng ProjectMembers (API-112)
   */
  async fetchUsers(filters?: { role?: string; status?: string; search?: string }): Promise<SystemUserAccount[]> {
    console.log('👥 [CANDIDATE3 BE] Đang tải danh sách nhân sự từ CSDL qua GET /api/v1/users...')

    const params: Record<string, any> = { limit: 100 }
    if (filters?.role && filters.role !== 'all') {
      params.role = mapRoleCodeToBackendRole(filters.role as RoleCode)
    }
    if (filters?.status && filters.status !== 'all') {
      params.status = filters.status
    }
    if (filters?.search && filters.search.trim()) {
      params.search = filters.search.trim()
    }

    // 1. Gọi API users
    const epoch = useAuthStore.getState().authEpoch
    const userItems: StaffUserDto[] = []
    const seen = new Set<string>()
    let cursor: string | undefined
    do {
      const usersRes = await apiClient.get<StaffPageResponseDto>('/users', { params: { ...params, cursor } })
      if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ danh bạ cũ.')
      if (!Array.isArray(usersRes.data?.items)) throw new Error('Danh bạ trả sai contract.')
      userItems.push(...usersRes.data.items)
      cursor = usersRes.data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor danh bạ bị lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)

    if (userItems.length > 0) {
      userDirectory.registerUsers(
        userItems.map((u) => ({
          id: u.userId,
          displayName: u.displayName || '',
          email: u.email || '',
          role: u.role || '',
          phone: u.phoneNumber || ''
        }))
      )
    }

    // 2. Tải danh sách dự án và thành viên để ghép đúng tên dự án đang phụ trách
    let projectMap: Record<string, string> = {}
    let userProjectMap: Record<string, string[]> = {}
    let userProjectIdsMap: Record<string, string[]> = {}

    const projects = await projectService.fetchProjects()
    projects.forEach((prj) => {
      projectMap[prj.id] = prj.name
    })

    // Nạp members cho các dự án để map người dùng vào dự án
    await Promise.all(
      projects.map(async (prj) => {
        const members = await projectService.fetchProjectMembers(prj.id)
        members.forEach((m) => {
          if (!userProjectMap[m.userId]) {
            userProjectMap[m.userId] = []
            userProjectIdsMap[m.userId] = []
          }
          if (!userProjectMap[m.userId].includes(prj.name)) {
            userProjectMap[m.userId].push(prj.name)
          }
          if (!userProjectIdsMap[m.userId].includes(prj.id)) {
            userProjectIdsMap[m.userId].push(prj.id)
          }
        })
      })
    )

    // 3. Mapping sang SystemUserAccount cho UI
    return userItems.map((u) => {
      const roleCode = mapBackendRoleToRoleCode(u.role)
      const roleLabel = getRoleLabel(roleCode)
      const assignedProjects = Array.from(new Set(userProjectMap[u.userId] || []))
      const assignedProjectIds = Array.from(new Set(userProjectIdsMap[u.userId] || []))
      let projectScope = 'Chưa phân công dự án'
      if (roleCode === RoleCode.SUPERVISOR) {
        projectScope = 'Toàn bộ gói thầu Hoàng Hải'
      } else if (assignedProjects.length > 0) {
        projectScope = assignedProjects.join(', ')
      }

      const isSuspended = (u.status || '').toUpperCase() === 'SUSPENDED'
      const email = u.email || '—'
      const rawPhone = u.phoneNumber || (u as any).PhoneNumber || (u as any).phone
      const phone = (rawPhone && String(rawPhone).trim() && String(rawPhone).trim() !== '-')
        ? String(rawPhone).trim()
        : '—'

      return {
        id: u.userId,
        full_name: u.displayName || 'Chưa có tên trong API',
        email,
        phone,
        role: roleCode,
        role_label: roleLabel,
        project_scope: projectScope,
        assigned_project_ids: assignedProjectIds,
        device_info: '—',
        ip_address: '—',
        status: isSuspended ? 'SUSPENDED' : 'ACTIVE',
        last_active: '—',
        certificate: '—',
        joined_date: '—'
      }
    })
  },

  /**
   * Lấy chi tiết thông tin nhân sự và ETag (API-238: GET /api/v1/users/{userId})
   */
  async fetchUserDetail(userId: string): Promise<{ data: UserDetailDto; etag: string }> {
    const res = await apiClient.get<UserDetailDto>(`/users/${userId}`)
    const etag = res.headers['etag'] || (res.data?.version ? `"${res.data.version}"` : '')
    return {
      data: res.data,
      etag
    }
  },

  /**
   * Cập nhật trạng thái (Đình chỉ / Khôi phục) hoặc vai trò của nhân sự (API-239: PATCH /api/v1/users/{userId})
   * Yêu cầu Header If-Match (ETag) và Idempotency-Key
   */
  async updateUser(
    userId: string,
    payload: { status: 'ACTIVE' | 'SUSPENDED'; role: RoleCode; reason: string },
    etag?: string
  ): Promise<any> {
    throw Object.assign(new Error('Đổi vai trò và trạng thái tài khoản chưa được hỗ trợ bằng phiên Web.'), { code: 'web_cookie_unsupported' })
  },

  /**
   * Đặt lại mật khẩu tạm thời cho nhân sự (API-240: POST /api/v1/users/{userId}/password-reset)
   */
  async adminResetPassword(userId: string, temporaryPassword: string, reason?: string): Promise<void> {
    throw Object.assign(new Error('Đặt lại mật khẩu chưa được hỗ trợ bằng phiên Web.'), { code: 'web_cookie_unsupported' })
  },

  /**
   * Phát hành thư mời kích hoạt tài khoản và gán dự án (API-032: POST /api/v1/invitations)
   */
  async createInvitation(payload: {
    email: string
    role: RoleCode
    projectIds: string[]
  }): Promise<InvitationResponseDto> {
    throw Object.assign(new Error('Gửi lời mời chưa được hỗ trợ bằng phiên Web.'), { code: 'web_cookie_unsupported' })
  },

  /**
   * Lấy danh sách thành viên trực thuộc một dự án (API-112: GET /api/v1/projects/{projectId}/members)
   */
  async fetchProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    return projectService.fetchProjectMembers(projectId)
  },

  /**
   * Lấy thông tin Chỉ huy trưởng chính hiện tại của dự án (GET /api/v1/projects/{projectId}/primary-project-manager)
   */
  async getPrimaryProjectManager(projectId: string): Promise<PrimaryProjectManagerReadDto | null> {
    const res = await apiClient.get<{ primaryProjectManager?: PrimaryProjectManagerReadDto | null }>(`/projects/${projectId}/primary-project-manager`)
    if (!res.data || !Object.prototype.hasOwnProperty.call(res.data, 'primaryProjectManager')) {
      throw new Error('Phân công PM chính trả sai contract.')
    }
    return res.data.primaryProjectManager ?? null
  },

  /**
   * Điều chuyển / Bàn giao Chỉ huy trưởng chính cho dự án (API-113: PUT /api/v1/projects/{projectId}/primary-project-manager)
   */
  async reassignPrimaryProjectManager(
    projectId: string,
    payload: {
      primaryProjectManagerUserId: string
      effectiveFrom: string
      reason: string
      expectedCurrentMembershipRowVersion?: string
    }
  ): Promise<any> {
    throw Object.assign(new Error('Chưa hỗ trợ đổi PM bằng phiên Web: backend PUT primary-project-manager chỉ nhận Bearer. Chưa gửi lệnh; cần backend bổ sung cookie eligibility và CSRF.'), {
      code: 'web_cookie_unsupported', projectId, input: payload
    })
  },

  /**
   * Lấy danh sách nhân sự đủ điều kiện thêm vào dự án (API: GET /api/v1/projects/{projectId}/members/eligible?role=OPERATOR|CREW)
   * Trả về danh sách user có sẵn trong hệ thống chưa gia nhập dự án
   */
  async fetchEligibleProjectMembers(
    projectId: string,
    params: {
      role: 'OPERATOR' | 'CREW'
      search?: string
      limit?: number
      cursor?: string
    }
  ): Promise<{ items: { userId: string; displayName: string; role: string }[]; nextCursor?: string }> {
    const epoch = useAuthStore.getState().authEpoch
    const items: { userId: string; displayName: string; role: string }[] = []
    const seen = new Set<string>()
    let cursor = params.cursor
    do {
      const res = await apiClient.get(`/projects/${projectId}/members/eligible`, { params: { ...params, limit: 100, cursor } })
      if (epoch !== useAuthStore.getState().authEpoch) throw new Error('Phiên đã thay đổi; bỏ danh sách eligible cũ.')
      if (!Array.isArray(res.data?.items)) throw new Error('Danh sách eligible trả sai contract.')
      items.push(...res.data.items)
      cursor = res.data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor eligible bị lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return { items }

  },

  /**
   * PM Thêm nhân sự vào dự án (API: POST /api/v1/projects/{projectId}/members)
   * Header bắt buộc: Idempotency-Key
   * Lỗi 409 Conflict: thành viên đã active
   */
  async addProjectMember(
    projectId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<any> {
    const state = useAuthStore.getState(), epoch = state.authEpoch, actor = state.user
    if (!actor || actor.role !== RoleCode.PROJECT_MANAGER) throw new Error('Chỉ PM được thêm Operator/Crew vào dự án.')
    const journalKey = `rg_member_add_${actor.id}_${projectId}`
    const saved = sessionStorage.getItem(journalKey)
    const command = saved ? JSON.parse(saved) : { userId, key: idempotencyKey || crypto.randomUUID() }
    if (command.userId !== userId) throw new Error('Lệnh thêm thành viên trước chưa đối chiếu xong; không tạo ý định mới.')
    if (memberWrites.has(journalKey)) throw new Error('Đang gửi lệnh thêm thành viên.')
    const current = () => { if (useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor.id) throw new Error('Phiên thành viên đã thay đổi.') }
    memberWrites.add(journalKey)
    try {
      current(); sessionStorage.setItem(journalKey, JSON.stringify(command))
      if (!command.receipt) {
        const res = await apiClient.post(`/projects/${projectId}/members`, { userId: command.userId }, {
          headers: { 'Idempotency-Key': command.key }, transformRequest: [(body: unknown) => { current(); return JSON.stringify(body) }]
        })
        current(); command.receipt = res.data; sessionStorage.setItem(journalKey, JSON.stringify(command))
      }
      const members = await projectService.fetchProjectMembers(projectId)
      current()
      const member = members.find(item => item.userId === userId && item.status === 'ACTIVE')
      if (!member) throw new Error('Đã nhận biên nhận nhưng chưa đọc lại được membership ACTIVE; không POST thêm.')
      sessionStorage.removeItem(journalKey)
      return member
    } catch (error: any) {
      const status = error.response?.status, code = error.response?.data?.code
      const knownRejection = (status === 400 && code === 'validation_error') ||
        (status === 403 && code === 'access_forbidden') ||
        (status === 404 && ['project_not_found', 'identity_user_not_found'].includes(code)) ||
        (status === 409 && ['duplicate_request', 'idempotency_key_reused'].includes(code))
      if (!command.receipt && knownRejection) sessionStorage.removeItem(journalKey)
      throw error
    } finally { memberWrites.delete(journalKey) }

  },

  /**
   * Supervisor đặt/sửa số điện thoại nhân sự (API: PATCH /api/v1/users/{userId}/phone-number)
   * Áp dụng cho tài khoản active có role PM, OPERATOR, CREW.
   * Headers: If-Match: "<ETag>" và Idempotency-Key
   * Khi đổi số, backend đặt PhoneNumberConfirmed = false.
   */
  async updateUserPhoneNumber(
    userId: string,
    phoneNumber: string,
    options?: { etag?: string; idempotencyKey?: string }
  ): Promise<void> {
    if (useAuthStore.getState().user?.role !== RoleCode.SUPERVISOR) throw new Error('Chỉ Giám sát được cập nhật số điện thoại.')
    const etag = options?.etag
    if (!etag || !/^"[A-Za-z0-9+/]+={0,2}"$/.test(etag)) throw new Error('Cần phiên bản người dùng đã xem trước khi cập nhật.')
    const phone = phoneNumber.trim()
    if (!/^\+?[0-9]{7,15}$/.test(phone)) throw new Error('Số điện thoại chưa hợp lệ.')
    await apiClient.patch(`/users/${userId}/phone-number`, { phoneNumber: phone }, { headers: { 'If-Match': etag, 'Idempotency-Key': options?.idempotencyKey || crypto.randomUUID() } })
  }
}

