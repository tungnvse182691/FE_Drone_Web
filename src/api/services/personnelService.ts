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
  role: 'SUPERVISOR' | 'PM' | 'OPERATOR' | 'CREW'
  reason: string
}

// Chuyển role từ wire format (Candidate3) sang RoleCode FE
export function mapBackendRoleToRoleCode(rawRole?: string | null): RoleCode {
  const normalized = (rawRole || '').toUpperCase().trim()
  if (normalized === 'SUPERVISOR') return RoleCode.SUPERVISOR
  if (normalized === 'PM' || normalized === 'PROJECT_MANAGER') return RoleCode.PROJECT_MANAGER
  if (normalized === 'OPERATOR' || normalized === 'DRONE_OPERATOR') return RoleCode.DRONE_OPERATOR
  if (normalized === 'CREW' || normalized === 'REPAIR_CREW') return RoleCode.REPAIR_CREW
  return RoleCode.PROJECT_MANAGER
}

// Chuyển RoleCode FE sang wire format backend
export function mapRoleCodeToBackendRole(role: RoleCode): 'SUPERVISOR' | 'PM' | 'OPERATOR' | 'CREW' {
  switch (role) {
    case RoleCode.SUPERVISOR:
      return 'SUPERVISOR'
    case RoleCode.PROJECT_MANAGER:
      return 'PM'
    case RoleCode.DRONE_OPERATOR:
      return 'OPERATOR'
    case RoleCode.REPAIR_CREW:
      return 'CREW'
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
    default:
      return 'Nhân sự kỹ thuật'
  }
}

export const personnelService = {
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
    const usersRes = await apiClient.get<StaffPageResponseDto>('/users', { params })
    const userItems = usersRes.data?.items || []

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

    try {
      const projects = await projectService.fetchProjects()
      projects.forEach((prj) => {
        projectMap[prj.id] = prj.name
      })

      // Nạp members cho các dự án để map người dùng vào dự án
      await Promise.all(
        projects.slice(0, 10).map(async (prj) => {
          try {
            const mRes = await apiClient.get<ProjectMembersPageDto>(`/projects/${prj.id}/members`)
            const members = mRes.data?.items || []
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
          } catch {
            // Tiếp tục nếu một dự án không lấy được members
          }
        })
      )
    } catch {
      // Giữ map rỗng nếu projects lỗi
    }

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
      const matchedUser = userDirectory.findUser(u.userId, u.displayName || undefined)
      const email = u.email || matchedUser?.email || '—'
      const rawPhone = u.phoneNumber || (u as any).PhoneNumber || (u as any).phone
      const phone = (rawPhone && String(rawPhone).trim() && String(rawPhone).trim() !== '-')
        ? String(rawPhone).trim()
        : (matchedUser?.phone || '—')

      return {
        id: u.userId,
        full_name: u.displayName || matchedUser?.displayName || u.email || 'Chưa cập nhật tên',
        email,
        phone,
        role: roleCode,
        role_label: roleLabel,
        project_scope: projectScope,
        assigned_project_ids: assignedProjectIds,
        device_info: isSuspended ? 'Thu hồi toàn bộ token & quyền truy cập' : 'Ứng dụng Web / Mobile (Đã cấp quyền)',
        ip_address: isSuspended ? 'Đình chỉ phiên' : 'Hệ thống nội bộ',
        status: isSuspended ? 'SUSPENDED' : 'ACTIVE',
        last_active: isSuspended ? 'Đã đình chỉ' : 'Đang hoạt động',
        certificate: 'Hồ sơ nhân sự lưu trữ nội bộ',
        joined_date: 'Đã biên chế'
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
    console.log(`👤 [CANDIDATE3 BE] Gửi PATCH /api/v1/users/${userId}...`)

    // Nếu chưa có etag, tự động lấy etag mới nhất từ API-238
    let currentEtag = etag
    if (!currentEtag) {
      const detail = await this.fetchUserDetail(userId)
      currentEtag = detail.etag
    }

    const idempotencyKey = crypto.randomUUID()
    const backendRole = mapRoleCodeToBackendRole(payload.role)

    const res = await apiClient.patch(
      `/users/${userId}`,
      {
        status: payload.status,
        role: backendRole,
        reason: payload.reason || 'Cập nhật tài khoản bởi Supervisor'
      },
      {
        headers: {
          'If-Match': currentEtag,
          'Idempotency-Key': idempotencyKey
        }
      }
    )

    return res.data
  },

  /**
   * Đặt lại mật khẩu tạm thời cho nhân sự (API-240: POST /api/v1/users/{userId}/password-reset)
   */
  async adminResetPassword(userId: string, temporaryPassword: string, reason?: string): Promise<void> {
    console.log(`🔑 [CANDIDATE3 BE] Gửi POST /api/v1/users/${userId}/password-reset...`)
    const idempotencyKey = crypto.randomUUID()

    await apiClient.post(
      `/users/${userId}/password-reset`,
      {
        temporaryPassword,
        reason: reason || 'Quản trị viên đặt lại mật khẩu tạm thời cho nhân sự'
      },
      {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      }
    )
  },

  /**
   * Phát hành thư mời kích hoạt tài khoản và gán dự án (API-032: POST /api/v1/invitations)
   */
  async createInvitation(payload: {
    email: string
    role: RoleCode
    projectIds: string[]
  }): Promise<InvitationResponseDto> {
    console.log(`✉️ [CANDIDATE3 BE] Gửi POST /api/v1/invitations cho: ${payload.email}...`)
    const idempotencyKey = crypto.randomUUID()
    const backendRole = mapRoleCodeToBackendRole(payload.role)

    const res = await apiClient.post<InvitationResponseDto>(
      '/invitations',
      {
        email: payload.email.trim().toLowerCase(),
        role: backendRole,
        projectIds: payload.projectIds
      },
      {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      }
    )

    return res.data
  },

  /**
   * Lấy danh sách thành viên trực thuộc một dự án (API-112: GET /api/v1/projects/{projectId}/members)
   */
  async fetchProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    const res = await apiClient.get<ProjectMembersPageDto>(`/projects/${projectId}/members`)
    return res.data?.items || []
  },

  /**
   * Lấy thông tin Chỉ huy trưởng chính hiện tại của dự án (GET /api/v1/projects/{projectId}/primary-project-manager)
   */
  async getPrimaryProjectManager(projectId: string): Promise<any> {
    try {
      const res = await apiClient.get(`/projects/${projectId}/primary-project-manager`)
      return {
        ...(res.data?.primaryProjectManager || res.data || {}),
        etag: res.headers?.etag || res.headers?.['etag']
      }
    } catch (err) {
      console.warn(`[getPrimaryProjectManager] Dự án ${projectId} chưa có PM hoặc không lấy được PM:`, err)
      return null
    }
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
    let rowVersion = payload.expectedCurrentMembershipRowVersion
    let etagHeader: string | undefined

    // Tự động truy vấn membershipVersion hiện tại của dự án từ Backend để thỏa mãn Optimistic Concurrency Control
    if (!rowVersion) {
      const currentPm = await this.getPrimaryProjectManager(projectId)
      if (!currentPm || !currentPm.membershipId) {
        throw new Error(
          'Dự án này chưa có Chỉ huy trưởng (PM) tiền nhiệm để bàn giao thay thế. Quy trình bàn giao (Reassign) chỉ áp dụng khi dự án đã có PM quản lý.'
        )
      }
      if (currentPm.membershipVersion) {
        rowVersion = currentPm.membershipVersion
        etagHeader = currentPm.etag
      }
    }

    if (!rowVersion) {
      rowVersion = 'AAAAAAAAAAA='
    }

    const requestBody = {
      primaryProjectManagerUserId: payload.primaryProjectManagerUserId,
      effectiveFrom: payload.effectiveFrom,
      reason: payload.reason,
      expectedCurrentMembershipRowVersion: rowVersion,
      operationId: crypto.randomUUID()
    }

    const headers: Record<string, string> = {
      'Idempotency-Key': crypto.randomUUID()
    }
    if (rowVersion && rowVersion !== 'AAAAAAAAAAA=') {
      headers['If-Match'] = etagHeader || `"${rowVersion}"`
    }

    console.log(`🔄 [CANDIDATE3 BE] Gửi PUT /api/v1/projects/${projectId}/primary-project-manager:`, {
      requestBody,
      headers
    })

    try {
      const res = await apiClient.put(
        `/projects/${projectId}/primary-project-manager`,
        requestBody,
        { headers }
      )
      return res.data
    } catch (err: any) {
      const errCode = err?.response?.data?.code || err?.response?.data?.title
      if (errCode === 'project_primary_pm_not_found') {
        const customErr = new Error(
          'Không thể bàn giao: PM hiện tại của dự án được bổ nhiệm trong cùng ngày (hoặc dự án chưa có PM). Ngày hiệu lực bàn giao phải sau ngày bổ nhiệm của PM cũ.'
        )
        ;(customErr as any).response = err?.response
        throw customErr
      }
      console.error('❌ [API-113 PUT FAILED] Response details:', err?.response?.data || err?.message)
      throw err
    }
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
    const queryParams = new URLSearchParams()
    queryParams.append('role', params.role)
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim())
    }
    if (params.limit) {
      queryParams.append('limit', String(params.limit))
    }
    if (params.cursor) {
      queryParams.append('cursor', params.cursor)
    }

    console.log(`🚀 [CANDIDATE3 BE] Gọi GET /api/v1/projects/${projectId}/members/eligible?${queryParams.toString()}...`)
    const res = await apiClient.get<{
      items: { userId: string; displayName: string; role: string }[]
      nextCursor?: string
    }>(`/projects/${projectId}/members/eligible?${queryParams.toString()}`)

    return res.data || { items: [] }
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
    const key = idempotencyKey || crypto.randomUUID()
    console.log(`🚀 [CANDIDATE3 BE] Gọi POST /api/v1/projects/${projectId}/members (userId: ${userId}, key: ${key})...`)

    const res = await apiClient.post(
      `/projects/${projectId}/members`,
      { userId },
      {
        headers: {
          'Idempotency-Key': key
        }
      }
    )
    return res.data
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
    let etag = options?.etag

    // Nếu chưa có ETag, tự động truy vấn GET /api/v1/users/{userId} để lấy header ETag mới nhất
    if (!etag) {
      console.log(`🔍 [CANDIDATE3 BE] Lấy header ETag từ GET /api/v1/users/${userId}...`)
      const userRes = await apiClient.get(`/users/${userId}`)
      etag = userRes.headers?.etag || userRes.headers?.['etag']
      if (!etag && userRes.data?.rowVersion) {
        etag = `"${userRes.data.rowVersion}"`
      }
    }

    if (!etag) {
      throw new Error('Không thể xác thực phiên bản dữ liệu (thiếu ETag) để cập nhật số điện thoại.')
    }

    // Đảm bảo định dạng ETag có ngoặc kép chuẩn HTTP If-Match
    const formattedEtag = etag.startsWith('"') ? etag : `"${etag}"`
    const idempotencyKey = options?.idempotencyKey || crypto.randomUUID()
    const sanitizedPhoneNumber = phoneNumber.replace(/[\s.-]/g, '')

    console.log(`🚀 [CANDIDATE3 BE] Gọi PATCH /api/v1/users/${userId}/phone-number:`, {
      phoneNumber: sanitizedPhoneNumber,
      etag: formattedEtag,
      idempotencyKey
    })

    await apiClient.patch(
      `/users/${userId}/phone-number`,
      { phoneNumber: sanitizedPhoneNumber },
      {
        headers: {
          'If-Match': formattedEtag,
          'Idempotency-Key': idempotencyKey
        }
      }
    )
  }
}

