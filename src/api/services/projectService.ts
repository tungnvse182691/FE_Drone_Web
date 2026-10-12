import { apiClient } from '../client'
import { getFromStorage, STORAGE_KEYS } from './storageHelper'
import { HubProject } from '../../types/domain'

export type { HubProject }

export const INITIAL_HUB_PROJECTS: HubProject[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Đoạn Km 1020 đến Km 1045',
    region: 'Miền Trung',
    location_detail: 'Huế - Đà Nẵng',
    start_km: 1020.0,
    end_km: 1045.0,
    stationing_text: 'Km 1020+000 → Km 1045+000',
    status: 'ACTIVE',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    pm_role_badge: 'PM Chính',
    pm_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    warranty_passed_percent: 65,
    days_remaining: 180,
    length_km: 156.0,
    open_defects: 12,
    repair_packages: 3,
    image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Đã phê duyệt',
    retention_amount: '15.5 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-ctbn-01',
    code: 'PRJ-CTBN-01',
    name: 'Cao tốc Bắc Nam - Đoạn Diễn Châu',
    region: 'Miền Bắc',
    location_detail: 'Nghệ An',
    start_km: 430.0,
    end_km: 479.3,
    stationing_text: 'Km 430+000 → Km 479+300',
    status: 'NEAR_EXPIRY',
    status_label: 'Sắp hết hạn',
    status_color: '#BA1A1A',
    pm_name: 'Trần Minh Tâm',
    pm_email: 'tam.tm@hoanghai-infra.vn',
    pm_role_badge: 'PM Tuyến',
    warranty_passed_percent: 92,
    days_remaining: 25,
    length_km: 49.3,
    open_defects: 5,
    repair_packages: 1,
    image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Đã phê duyệt',
    retention_amount: '12.8 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-dt741-04',
    code: 'PRJ-DT741-04',
    name: 'Đường tỉnh ĐT-741 (Bình Dương)',
    region: 'Miền Nam',
    location_detail: 'Bình Dương',
    start_km: 0.0,
    end_km: 32.8,
    stationing_text: 'Km 0+000 → Km 32+800',
    status: 'PENDING_ALIGNMENT',
    status_label: 'Chờ duyệt tuyến',
    status_color: '#D97706',
    pm_name: 'Chưa phân công PM',
    pm_email: 'Cần gán PM trước khi kích hoạt tim tuyến',
    pm_role_badge: 'Chưa gán',
    warranty_passed_percent: 0,
    days_remaining: 730,
    length_km: 32.8,
    open_defects: 0,
    repair_packages: 0,
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    is_assigned: false,
    is_restricted_for_pm: false,
    kml_status: 'Đang thẩm định',
    retention_amount: '6.2 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-ptdg-03',
    code: 'PRJ-PTDG-03',
    name: 'Cao tốc Phan Thiết - Dầu Giây (GĐ 1)',
    region: 'Miền Nam',
    location_detail: 'Bình Thuận - Đồng Nai',
    start_km: 0.0,
    end_km: 99.0,
    stationing_text: 'Km 0+000 → Km 99+000',
    status: 'RESTRICTED',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Lê Văn Cường',
    pm_email: 'cuong.lv@hoanghai-infra.vn',
    pm_role_badge: 'PM Phụ trách',
    warranty_passed_percent: 38,
    days_remaining: 450,
    length_km: 99.0,
    open_defects: 8,
    repair_packages: 2,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: true,
    kml_status: 'Đã phê duyệt',
    retention_amount: '18.4 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan',
    region: 'Miền Trung',
    location_detail: 'Huế - Đà Nẵng',
    start_km: 0.0,
    end_km: 66.0,
    stationing_text: 'Km 0+000 → Km 66+000',
    status: 'ACTIVE',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    pm_role_badge: 'PM Phụ trách',
    pm_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    warranty_passed_percent: 42,
    days_remaining: 310,
    length_km: 66.0,
    open_defects: 7,
    repair_packages: 2,
    image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Đã phê duyệt',
    retention_amount: '11.0 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-ql1a-p1',
    code: 'PRJ-QL1A-P1',
    name: 'QL1A - Giai đoạn 1 (Km 990 - Km 1020)',
    region: 'Miền Trung',
    location_detail: 'Quảng Nam',
    start_km: 990.0,
    end_km: 1020.0,
    stationing_text: 'Km 990+000 → Km 1020+000',
    status: 'CLOSED',
    status_label: 'Đã đóng hồ sơ',
    status_color: '#475569',
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    pm_role_badge: 'PM Phụ trách',
    pm_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    warranty_passed_percent: 100,
    days_remaining: 0,
    length_km: 30.0,
    open_defects: 0,
    repair_packages: 0,
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Đã hoàn công',
    retention_amount: '9.8 tỷ ₫ (Đã quyết toán)',
    closed_at: '2026-01-15T09:30:00Z',
    closed_reason: 'Hoàn thành 100% trách nhiệm bảo hành công trình theo HĐ-BH-2023. Nghiệm thu đợt cuối đạt chuẩn TCVN 8819:2011 và giải tỏa bảo lãnh.',
    closed_by: 'Nguyễn Văn An (Supervisor)',
    retention_until: '15/01/2031 (Tối thiểu 5 năm - QT13, BR-45)'
  }
]

export interface ProjectCreatePayload {
  code: string
  name: string
  primaryPmId: string
  handoverDate: string
  warrantyEndDate: string
  handoverFileIds?: string[]
  region?: string
}

function calculateLineLengthKm(coords?: [number, number][]): number {
  if (!coords || coords.length < 2) return 0
  let totalMeters = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i]
    const p2 = coords[i + 1]
    const lat1 = (p1[1] * Math.PI) / 180
    const lat2 = (p2[1] * Math.PI) / 180
    const dLat = ((p2[1] - p1[1]) * Math.PI) / 180
    const dLng = ((p2[0] - p1[0]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    totalMeters += 6371000 * c
  }
  return parseFloat((totalMeters / 1000).toFixed(3))
}

function enrichProjectWithAlignment(p: HubProject): HubProject {
  const alignStateKey = `${STORAGE_KEYS.ALIGNMENTS}_${p.id}`
  const alignDataKey = `${STORAGE_KEYS.ALIGNMENTS}_data_${p.id}`

  const alignState = getFromStorage<{ status?: string }>(alignStateKey, {})
  const alignData = getFromStorage<{ coords?: [number, number][]; branches?: any[]; segments?: any[] }>(alignDataKey, {})

  const coords = alignData.coords || []
  const branches = alignData.branches || []
  const segments = alignData.segments || []

  // Nếu trong alignment có dữ liệu tim tuyến chính hoặc tuyến phụ
  if (coords.length >= 2 || branches.length > 0 || segments.length > 0) {
    const mainLen = calculateLineLengthKm(coords)
    const branchLen = branches.reduce((sum: number, b: any) => {
      const bLen = (b.coords && b.coords.length >= 2 ? calculateLineLengthKm(b.coords) : b.lengthKm) || 0
      return sum + bLen
    }, 0)
    const computedLen = parseFloat((mainLen + branchLen).toFixed(3))
    const totalLen = computedLen > 0 ? computedLen : (p.length_km || 0)

    let kmlStatus = p.kml_status
    let status = p.status
    let statusLabel = p.status_label

    if (alignState.status === 'CONFIRMED') {
      kmlStatus = 'Đã phê duyệt'
      status = 'ACTIVE'
      statusLabel = 'Đang bảo hành'
    } else if (alignState.status === 'PENDING_APPROVAL') {
      kmlStatus = 'Chờ duyệt tim tuyến'
      status = 'PENDING_ALIGNMENT'
      statusLabel = 'Chờ duyệt tuyến'
    } else if (alignState.status === 'DRAFT') {
      kmlStatus = totalLen > 0 ? 'Bản nháp (DRAFT)' : 'Chưa có tim tuyến'
    }

    const stationText = totalLen > 0
      ? `Km 0+000 → Km ${totalLen >= 1 ? totalLen.toFixed(1) : Math.round(totalLen * 1000) + 'm'}`
      : p.stationing_text

    return {
      ...p,
      length_km: totalLen,
      end_km: totalLen,
      kml_status: kmlStatus,
      status: status as any,
      status_label: statusLabel,
      stationing_text: stationText
    }
  }

  // Nếu alignState có status PENDING_APPROVAL hoặc CONFIRMED mà chưa nạp coords
  if (alignState.status === 'PENDING_APPROVAL') {
    return {
      ...p,
      kml_status: 'Chờ duyệt tim tuyến',
      status: 'PENDING_ALIGNMENT' as any,
      status_label: 'Chờ duyệt tuyến'
    }
  } else if (alignState.status === 'CONFIRMED') {
    return {
      ...p,
      kml_status: 'Đã phê duyệt',
      status: 'ACTIVE' as any,
      status_label: 'Đang bảo hành'
    }
  }

  return p
}

// In-Memory Mock Store (KHÔNG dùng localStorage / local tĩnh theo kiến trúc Mock API)
let projectStore: HubProject[] = JSON.parse(JSON.stringify(INITIAL_HUB_PROJECTS))

export const projectService = {
  /**
   * Mock API: GET /projects
   * Giả lập gọi API bất đồng bộ có network latency
   */
  async fetchProjects(): Promise<HubProject[]> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.get<HubProject[]>('/projects')
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    return this.getProjects()
  },

  /**
   * Accessor đồng bộ lấy danh sách dự án kèm thông tin tim tuyến
   */
  getProjects(): HubProject[] {
    return JSON.parse(JSON.stringify(projectStore.map((p) => enrichProjectWithAlignment(p))))
  },

  /**
   * Mock API: GET /projects/:id
   */
  async fetchProjectById(id: string): Promise<HubProject | undefined> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.get<HubProject>(`/projects/${id}`)
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 150))
    return this.getProjectById(id)
  },

  getProjectById(id: string): HubProject | undefined {
    const projects = this.getProjects()
    return projects.find((p) => p.id === id || p.code === id)
  },

  /**
   * Mock API: POST /projects (Chỉ Supervisor có quyền - FR-04, BR-01, DA01)
   * Header: Idempotency-Key
   */
  async createProject(payload: ProjectCreatePayload): Promise<HubProject> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.post<HubProject>('/projects', payload)
      return res.data
    }

    // Giả lập độ trễ truyền thông qua mạng HTTP
    await new Promise((resolve) => setTimeout(resolve, 300))

    const code = payload.code?.trim().toUpperCase()
    const name = payload.name?.trim()
    const handoverDate = payload.handoverDate
    const warrantyEndDate = payload.warrantyEndDate
    const pmId = payload.primaryPmId?.trim()

    // 1. Kiểm tra trường bắt buộc
    if (!code || !name) {
      throw new Error('[422] Mã dự án (code) và Tên dự án (name) là các trường bắt buộc.')
    }

    // 2. Quy tắc BR-01: Bắt buộc chỉ định đúng 1 PM chính
    if (!pmId || pmId === '-- Để trống --') {
      throw new Error('[422] Bắt buộc chỉ định đúng 1 PM chính (primaryPmId) theo quy tắc BR-01.')
    }

    // 3. Quy tắc FR-04 / validation: warrantyEndDate >= handoverDate
    if (new Date(warrantyEndDate).getTime() < new Date(handoverDate).getTime()) {
      throw new Error('[422] Ngày hết hạn bảo hành (warrantyEndDate) không được nhỏ hơn ngày bàn giao (handoverDate).')
    }

    // 4. Kiểm tra mã dự án trùng lặp (HTTP 409 Conflict)
    if (projectStore.some((p) => p.code.toUpperCase() === code)) {
      throw new Error(`[409] Mã dự án [${code}] đã tồn tại trong hệ thống. Vui lòng chọn mã khác.`)
    }

    // Trích xuất tên và email của PM
    const pmName = pmId.includes('(') ? pmId.split(' (')[0].trim() : pmId
    const pmEmail = pmId.includes('(') ? pmId.split('(')[1].replace(')', '').trim() : 'pmhoang@gmail.com'

    // Khởi tạo hồ sơ dự án theo schema chuẩn v2.2 / DA01
    const newProject: HubProject = {
      id: `prj-${Date.now()}`,
      code,
      name,
      region: payload.region?.trim() || 'Miền Nam',
      location_detail: payload.region?.trim() || 'Khu vực quản lý',
      start_km: 0.0,
      end_km: 0.0,
      stationing_text: 'Chờ thiết lập tim tuyến (PM)',
      status: 'ACTIVE',
      status_label: 'Đang bảo hành',
      status_color: '#1B5E20',
      pm_name: pmName,
      pm_email: pmEmail,
      pm_role_badge: 'PM Chính',
      warranty_passed_percent: 0,
      days_remaining: 1095,
      length_km: 0.0,
      open_defects: 0,
      repair_packages: 0,
      image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
      is_assigned: true,
      is_restricted_for_pm: false,
      kml_status: 'Chưa có tim tuyến',
      handover_date: handoverDate,
      warranty_end_date: warrantyEndDate,
      handover_file_ids: payload.handoverFileIds || []
    }

    projectStore = [newProject, ...projectStore]

    // Phát sự kiện đồng bộ reactive trên toàn client
    window.dispatchEvent(new Event('roadguard_state_change'))
    return JSON.parse(JSON.stringify(newProject))
  },

  /**
   * Mock API: POST /projects/{projectId}/close (Duy nhất Supervisor có quyền - DA12, QT13, BC10)
   * Payload: Reason { reason: string }
   * Header: Idempotency-Key, If-Match
   */
  async closeProject(
    projectId: string,
    payload: { reason: string }
  ): Promise<HubProject> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.post<HubProject>(`/projects/${projectId}/close`, payload)
      return res.data
    }

    // Giả lập độ trễ mạng HTTP
    await new Promise((resolve) => setTimeout(resolve, 300))

    const reason = payload.reason?.trim()
    if (!reason) {
      throw new Error('[422] Lý do / kết luận đóng dự án (reason) là bắt buộc theo quy tắc DA12.')
    }

    const targetIndex = projectStore.findIndex((p) => p.id === projectId || p.code === projectId)
    if (targetIndex === -1) {
      throw new Error(`[404] Không tìm thấy dự án với mã [${projectId}].`)
    }

    const currentProject = projectStore[targetIndex]
    if (currentProject.status === 'CLOSED') {
      throw new Error(`[409] Dự án [${currentProject.code}] đã được đóng bảo hành trước đó.`)
    }

    if (currentProject.open_defects > 0) {
      throw new Error(`[422] Không thể đóng dự án [${currentProject.code}]. Dự án vẫn còn ${currentProject.open_defects} điểm hư hỏng chưa được nghiệm thu khắc phục (PASSED).`)
    }

    // Tính hạn lưu trữ tối thiểu hết bảo hành + 5 năm theo quy chuẩn QT13 & BR-45
    const now = new Date()
    const retentionDate = new Date(now)
    retentionDate.setFullYear(retentionDate.getFullYear() + 5)
    const retentionFormatted = `${String(retentionDate.getDate()).padStart(2, '0')}/${String(retentionDate.getMonth() + 1).padStart(2, '0')}/${retentionDate.getFullYear()}`
    const retentionUntilStr = `${retentionFormatted} (Tối thiểu 5 năm - QT13, BR-45)`

    // Cập nhật trạng thái dự án sang CLOSED
    const closedProject: HubProject = {
      ...currentProject,
      status: 'CLOSED',
      status_label: 'Đã đóng hồ sơ',
      status_color: '#475569',
      days_remaining: 0,
      warranty_passed_percent: 100,
      open_defects: 0,
      closed_at: now.toISOString(),
      closed_reason: reason,
      closed_by: 'Nguyễn Văn An (Supervisor)',
      retention_until: retentionUntilStr
    }

    projectStore[targetIndex] = closedProject

    // Phát sự kiện đồng bộ reactive trên toàn client
    window.dispatchEvent(new CustomEvent('roadguard_state_change', { detail: { projectId, status: 'CLOSED' } }))

    return JSON.parse(JSON.stringify(closedProject))
  },

  updateProjectStatus(id: string, status: HubProject['status']): HubProject | null {
    let updatedProj: HubProject | null = null
    projectStore = projectStore.map((p) => {
      if (p.id === id || p.code === id) {
        updatedProj = { ...p, status }
        return updatedProj
      }
      return p
    })
    if (updatedProj) {
      window.dispatchEvent(new Event('roadguard_state_change'))
    }
    return updatedProj
  },

  updateProjectAlignment(
    id: string,
    data: { length_km?: number; kml_status?: string; stationing_text?: string; status?: HubProject['status'] }
  ): HubProject | null {
    let updatedProj: HubProject | null = null
    projectStore = projectStore.map((p) => {
      if (p.id === id || p.code === id) {
        updatedProj = { ...p, ...data }
        return updatedProj
      }
      return p
    })
    if (updatedProj) {
      window.dispatchEvent(new Event('roadguard_state_change'))
    }
    return updatedProj
  },

  resetProjects(): void {
    projectStore = JSON.parse(JSON.stringify(INITIAL_HUB_PROJECTS))
    window.dispatchEvent(new Event('roadguard_state_change'))
  }
}

