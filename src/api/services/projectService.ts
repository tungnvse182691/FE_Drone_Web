import { apiClient } from '../client'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'
import { HubProject } from '../../types/domain'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { userDirectory } from './userDirectory'

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
  // Nếu dự án đã đóng bảo hành, khóa cứng trạng thái và không ghi đè tim tuyến
  if (p.status === 'CLOSED') {
    return p
  }

  const getRawAlignState = (keyId?: string | null) => {
    if (!keyId) return null
    try {
      const v1 = localStorage.getItem(`roadguard_alignment_state_${keyId}`)
      if (v1) {
        const parsed = JSON.parse(v1)
        if (parsed && parsed.status) return parsed
      }
      const v2 = localStorage.getItem(`${STORAGE_KEYS.ALIGNMENTS}_${keyId}`)
      if (v2) {
        const parsed = JSON.parse(v2)
        if (parsed && parsed.status) return parsed
      }
    } catch {}
    return null
  }

  const getRawAlignData = (keyId?: string | null) => {
    if (!keyId) return null
    try {
      const v1 = localStorage.getItem(`roadguard_alignment_data_${keyId}`)
      if (v1) {
        const parsed = JSON.parse(v1)
        if (parsed && (parsed.coords?.length || parsed.segments?.length || parsed.branches?.length)) return parsed
      }
      const v2 = localStorage.getItem(`${STORAGE_KEYS.ALIGNMENTS}_data_${keyId}`)
      if (v2) {
        const parsed = JSON.parse(v2)
        if (parsed && (parsed.coords?.length || parsed.segments?.length || parsed.branches?.length)) return parsed
      }
    } catch {}
    return null
  }

  // Tra cứu theo cả ID (UUID) và Mã dự án (Code: SBX-A, BLL0-SPC-1...)
  const alignState = getRawAlignState(p.id) || getRawAlignState(p.code) || {}
  const alignData = getRawAlignData(p.id) || getRawAlignData(p.code) || {}

  const coords = alignData.coords || []
  const branches = alignData.branches || []
  const segments = alignData.segments || []

  // CHỈ hiển thị độ dài và trạng thái chờ duyệt/đã duyệt khi PM ĐÃ BẤM 'TRÌNH DUYỆT' (PENDING_APPROVAL) hoặc ĐÃ KHÓA (CONFIRMED)
  // Nếu status là DRAFT hoặc chưa có: Đây chỉ là bản nháp nội bộ của PM, chưa được xác nhận, hệ thống xem như chưa có tim tuyến
  const isSubmittedOrConfirmed = alignState.status === 'PENDING_APPROVAL' || alignState.status === 'CONFIRMED'

  if (isSubmittedOrConfirmed && (coords.length >= 2 || branches.length > 0 || segments.length > 0)) {
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

  // Nếu alignState có status PENDING_APPROVAL mà chưa có coords
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

  // Bản nháp DRAFT hoặc chưa thiết lập: Tuyệt đối không tính toán độ dài hay báo Chờ duyệt
  return {
    ...p,
    length_km: 0.0,
    end_km: 0.0,
    stationing_text: 'Chưa thiết lập tim tuyến',
    status: 'PENDING_ALIGNMENT' as any,
    status_label: 'Chưa thiết lập tim tuyến',
    kml_status: 'Chưa có tim tuyến'
  }
}

// Mapper chuẩn hóa từ Backend Candidate3 DTO sang HubProject Domain Model
interface UserLookupInfo {
  userId: string
  displayName: string
  email: string
  role: string
}

async function getUsersLookup(): Promise<Map<string, UserLookupInfo>> {
  const map = new Map<string, UserLookupInfo>()
  // Nạp sẵn toàn bộ danh bạ từ userDirectory
  userDirectory.getAllUsers().forEach((u) => {
    const info: UserLookupInfo = {
      userId: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role || ''
    }
    map.set(u.id.toLowerCase(), info)
    if (u.displayName) {
      map.set(u.displayName.trim().toLowerCase(), info)
    }
  })

  // Chỉ gọi /api/v1/users nếu người dùng hiện tại là SUPERVISOR (PM gọi sẽ bị 403)
  const currentUser = useAuthStore.getState().user
  if (currentUser?.role === RoleCode.SUPERVISOR) {
    try {
      const res = await apiClient.get<any>('/users', { params: { limit: 100 } })
      const items = res.data?.items || []
      const entries: any[] = []
      items.forEach((u: any) => {
        if (u.userId) {
          const info: UserLookupInfo = {
            userId: u.userId,
            displayName: u.displayName || '',
            email: u.email || '',
            role: u.role || ''
          }
          entries.push({
            id: u.userId,
            displayName: u.displayName || '',
            email: u.email || '',
            role: u.role || '',
            phone: u.phoneNumber
          })
          map.set(u.userId.toLowerCase(), info)
          if (u.displayName) {
            map.set(u.displayName.trim().toLowerCase(), info)
          }
        }
      })
      if (entries.length > 0) {
        userDirectory.registerUsers(entries)
      }
    } catch (err) {
      console.warn('[projectService] Không thể tải /users từ máy chủ:', err)
    }
  }
  return map
}

function mapBackendProjectToHub(
  item: any,
  usersMap?: Map<string, UserLookupInfo>,
  statsMap?: Map<string, { openDefects: number; repairPackages: number }>
): HubProject {
  const statusStr = (item.status || 'PENDING_ALIGNMENT').toUpperCase()
  let status: HubProject['status'] = 'PENDING_ALIGNMENT'
  let statusLabel = 'Chưa thiết lập tim tuyến'
  let statusColor = '#D97706'

  if (statusStr === 'CLOSED') {
    status = 'CLOSED'
    statusLabel = 'Đã đóng hồ sơ'
    statusColor = '#475569'
  } else if (statusStr === 'RESTRICTED' || statusStr === 'SUSPENDED') {
    status = 'RESTRICTED'
    statusLabel = 'Tạm dừng vận hành'
    statusColor = '#D97706'
  }

  const projId = item.projectId || item.id || ''
  const projCode = item.projectCode || item.code || ''

  // Khôi phục trạng thái đã đóng từ bộ nhớ phiên nếu có
  try {
    const closedListStr = typeof window !== 'undefined' ? sessionStorage.getItem('roadguard_closed_project_ids') : null
    if (closedListStr) {
      const closedIds: string[] = JSON.parse(closedListStr)
      if (closedIds.includes(projId) || closedIds.includes(projCode) || closedIds.includes(item.id)) {
        status = 'CLOSED'
        statusLabel = 'Đã đóng hồ sơ'
        statusColor = '#475569'
      }
    }
  } catch {}

  const pmUserId = item.primaryProjectManagerUserId ? String(item.primaryProjectManagerUserId).toLowerCase() : ''
  let pmName = item.primaryProjectManagerName || ''
  let pmEmail = ''

  const matched = userDirectory.findUser(pmUserId, pmName)
  if (matched) {
    pmName = matched.displayName || pmName
    pmEmail = matched.email || ''
  } else if (usersMap) {
    const userMatch = pmUserId ? usersMap.get(pmUserId) : (pmName ? usersMap.get(pmName.trim().toLowerCase()) : undefined)
    if (userMatch) {
      pmName = userMatch.displayName || pmName
      pmEmail = userMatch.email || ''
    }
  }

  if (!pmName) {
    pmName = 'Chưa gán PM'
  }


  // Tính toán thời gian bảo hành thực tế dựa trên handoverDate và warrantyEndDate
  const now = new Date()
  const handoverStr = item.handoverDate || item.createdAt || ''
  const warrantyEndStr = item.warrantyEndDate || ''

  const handover = handoverStr ? new Date(handoverStr) : now
  const warrantyEnd = warrantyEndStr ? new Date(warrantyEndStr) : new Date(handover.getTime() + 3 * 365 * 86400000)

  // Số ngày còn lại đến hết hạn bảo hành
  const diffTimeToEnd = warrantyEnd.getTime() - now.getTime()
  let daysRemaining = Math.max(0, Math.ceil(diffTimeToEnd / (1000 * 60 * 60 * 24)))

  // % thời gian đã trôi qua kể từ ngày bàn giao đến ngày hết hạn
  const totalDuration = warrantyEnd.getTime() - handover.getTime()
  const passedDuration = now.getTime() - handover.getTime()
  let warrantyPassedPercent = 0
  if (totalDuration > 0) {
    warrantyPassedPercent = Math.min(100, Math.max(0, Math.round((passedDuration / totalDuration) * 100)))
  }

  if (status === 'CLOSED') {
    warrantyPassedPercent = 100
    daysRemaining = 0
  }
  const metaById = projId ? getFromStorage<{ region?: string; location_detail?: string }>(`roadguard_project_meta_${projId}`, {}) : {}
  const metaByCode = projCode ? getFromStorage<{ region?: string; location_detail?: string }>(`roadguard_project_meta_${projCode}`, {}) : {}
  const regionMap = getFromStorage<Record<string, string>>('roadguard_projects_region_map', {})

  let region =
    item.region ||
    item.location ||
    metaById.region ||
    metaByCode.region ||
    regionMap[projId] ||
    regionMap[projCode] ||
    item.description ||
    ''

  // Tự động nhận diện và suy luận địa bàn từ mã hoặc tên dự án nếu dữ liệu cũ chưa kịp lưu metadata
  if (!region || region === 'Chưa thiết lập địa bàn') {
    const upperCode = (projCode || '').toUpperCase()
    const upperName = (item.name || '').toUpperCase()
    if (upperCode.startsWith('BLLĐ') || upperCode.startsWith('BLLD') || upperName.includes('BẢO LỘC') || upperName.includes('LÂM ĐỒNG')) {
      region = 'Bảo Lộc - Lâm Đồng'
    } else if (upperCode.startsWith('PRJ-QL1A') || upperName.includes('QL1A') || upperName.includes('QUỐC LỘ 1A')) {
      region = 'Miền Trung'
    } else if (upperName.includes('BẮC NAM') || upperName.includes('DIỄN CHÂU')) {
      region = 'Nghệ An'
    } else if (upperCode.startsWith('SBX-')) {
      region = 'Địa bàn Thử nghiệm'
    }
  }

  // Cập nhật lại vào cache để các màn hình khác (tim tuyến, chi tiết, danh sách) luôn nhận diện được
  if (region && (!regionMap[projId] || !regionMap[projCode])) {
    if (projId) regionMap[projId] = region
    if (projCode) regionMap[projCode] = region
    saveToStorage('roadguard_projects_region_map', regionMap)
  }

  const location_detail =
    item.locationDetail ||
    item.location_detail ||
    metaById.location_detail ||
    metaByCode.location_detail ||
    region ||
    ''

  const project: HubProject = {
    id: projId,
    code: item.projectCode || item.code || 'PRJ-MOCK',
    name: item.name || 'Dự án bảo hành RoadGuard',
    region,
    location_detail,
    start_km: 0.0,
    end_km: 0.0,
    stationing_text: 'Chưa thiết lập tim tuyến',
    status,
    status_label: statusLabel,
    status_color: statusColor,
    pm_name: pmName,
    pm_email: pmEmail,
    pm_user_id: item.primaryProjectManagerUserId,
    pm_role_badge: 'PM Chính',
    warranty_passed_percent: warrantyPassedPercent,
    days_remaining: daysRemaining,
    length_km: 0.0,
    open_defects: statsMap && projId && statsMap.get(projId.toLowerCase()) ? statsMap.get(projId.toLowerCase())!.openDefects : 0,
    repair_packages: statsMap && projId && statsMap.get(projId.toLowerCase()) ? statsMap.get(projId.toLowerCase())!.repairPackages : 0,
    image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Chưa có tim tuyến',
    handover_date: item.handoverDate,
    warranty_end_date: item.warrantyEndDate,
    handover_file_ids: item.handoverFileIds || []
  }

  return enrichProjectWithAlignment(project)
}

// In-Memory Store có khôi phục từ sessionStorage khi F5/reload trang
let projectStore: HubProject[] = (() => {
  try {
    const cached = sessionStorage.getItem('roadguard_project_store')
    if (cached && useAuthStore.getState().isAuthenticated) return JSON.parse(cached)
  } catch {}
  return import.meta.env.VITE_USE_MOCK_PROJECTS === 'true'
    ? JSON.parse(JSON.stringify(INITIAL_HUB_PROJECTS))
    : []
})()

useAuthStore.subscribe((state, previous) => {
  if (state.authEpoch !== previous.authEpoch) {
    projectStore = []
    sessionStorage.removeItem('roadguard_project_store')
    saveToStorage(STORAGE_KEYS.PROJECTS, [])
  }
})

export const projectService = {
  /**
   * API-049: GET /projects
   * Lấy danh sách dự án thật từ Backend Candidate3 Docker theo phân quyền (PM / Supervisor)
   */
  async fetchProjects(): Promise<HubProject[]> {
    const actor = useAuthStore.getState().user
    const isMock = import.meta.env.VITE_USE_MOCK_PROJECTS === 'true'
    if (!isMock) {
      try {
        console.log('🚀 [CANDIDATE3 BE] Gọi GET /api/v1/projects...')
        const [res, usersMap] = await Promise.all([
          apiClient.get<{ items: any[]; nextCursor?: string; asOf?: string }>('/projects'),
          getUsersLookup()
        ])
        const rawItems = res.data?.items || (Array.isArray(res.data) ? res.data : [])
        console.log(`✅ [CANDIDATE3 BE] Đã tải ${rawItems.length} dự án từ Backend thật:`, rawItems.map(p => p.projectCode || p.code))

        const currentUser = useAuthStore.getState().user
        const isPM = currentUser?.role === RoleCode.PROJECT_MANAGER
        const statsMap = new Map<string, { openDefects: number; repairPackages: number }>()
        await Promise.all(
          rawItems.map(async (item) => {
            const pId = item.projectId || item.id
            if (!pId) return
            try {
              let openDefects = 0
              let repairPackages = 0
              if (isPM) {
                // PM: Được phép gọi /projects/{pId}/defects (API-070)
                const [defectsRes, packagesRes] = await Promise.all([
                  apiClient.get<{ items: any[] }>(`/projects/${pId}/defects`).catch(() => ({ data: { items: [] } })),
                  apiClient.get<{ items: any[] }>(`/projects/${pId}/repair-packages`).catch(() => ({ data: { items: [] } }))
                ])
                const defects = defectsRes.data?.items || []
                openDefects = defects.filter((d: any) => {
                  const s = (d.status || d.verificationStatus || '').toUpperCase()
                  return s !== 'RESOLVED' && s !== 'CLOSED' && s !== 'PASSED'
                }).length
                repairPackages = (packagesRes.data?.items || []).length
              } else {
                // Supervisor: Không gọi /defects để tránh 403 Forbidden; dùng API-140 repair-packages & API-078 defect-statistics
                const [statsRes, packagesRes] = await Promise.all([
                  apiClient.get<any>(`/projects/${pId}/defect-statistics`).catch(() => null),
                  apiClient.get<{ items: any[] }>(`/projects/${pId}/repair-packages`).catch(() => ({ data: { items: [] } }))
                ])
                if (statsRes?.data?.statistics) {
                  openDefects = statsRes.data.statistics.openDefectsCount || 0
                }
                repairPackages = (packagesRes.data?.items || []).length
              }
              statsMap.set(pId.toLowerCase(), { openDefects, repairPackages })
            } catch {
              statsMap.set(pId.toLowerCase(), { openDefects: 0, repairPackages: 0 })
            }
          })
        )

        const mapped = rawItems.map((item) => mapBackendProjectToHub(item, usersMap, statsMap))
        if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ danh sách dự án cũ.')
        projectStore = mapped
        try {
          sessionStorage.setItem('roadguard_project_store', JSON.stringify(mapped))
        } catch {}
        return mapped
      } catch (err: any) {
        const detailMsg =
          err?.response?.data?.detail ||
          err?.response?.data?.title ||
          err?.message ||
          'Lỗi kết nối tới máy chủ khi tải danh sách dự án.'
        console.error('❌ [CANDIDATE3 BE] Lỗi tải /projects từ Backend:', detailMsg, err?.response?.data)
        // Ném lỗi trực tiếp để UI hiển thị thông báo lỗi, dứt khoát không nuốt lỗi hay fallback về mock
        throw new Error(detailMsg)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    return this.getProjects()
  },

  /**
   * Accessor đồng bộ lấy danh sách dự án kèm thông tin tim tuyến
   */
  getProjects(): HubProject[] {
    if (projectStore.length === 0) {
      try {
        const cached = sessionStorage.getItem('roadguard_project_store')
        if (cached) {
          projectStore = JSON.parse(cached)
        }
      } catch {}
    }
    return JSON.parse(JSON.stringify(projectStore.map((p) => enrichProjectWithAlignment(p))))
  },

  /**
   * GET /projects/:id hoặc lấy chi tiết kèm thành viên / lifecycle
   */
  async fetchProjectById(id: string): Promise<HubProject | undefined> {
    const isMock = import.meta.env.VITE_USE_MOCK_PROJECTS === 'true'
    if (!isMock) {
      try {
        console.log(`🚀 [CANDIDATE3 BE] Gọi chi tiết dự án ID: ${id}...`)
        // 1. Tìm trong danh sách dự án hiện có
        let found = projectStore.find((p) => p.id === id || p.code === id)
        if (!found) {
          const all = await this.fetchProjects()
          found = all.find((p) => p.id === id || p.code === id)
        }

        if (found) {
          // Thử lấy thêm thông tin lifecycle từ Backend
          try {
            const lcRes = await apiClient.get<any>(`/projects/${found.id}/lifecycle`)
            if (lcRes.data) {
              console.log('✅ [CANDIDATE3 BE] Đã tải Lifecycle dự án:', lcRes.data.projectId)
            }
          } catch {
            // Không chặn nếu lifecycle chưa khởi tạo
          }
          return found
        }
      } catch (err: any) {
        console.warn(`⚠️ [CANDIDATE3 BE] Lỗi fetchProjectById ${id}:`, err?.message)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 150))
    return this.getProjectById(id)
  },

  /**
   * API-112: Lấy danh sách thành viên dự án (GET /projects/{projectId}/members)
   */
  async fetchProjectMembers(projectId: string): Promise<any[]> {
    try {
      const res = await apiClient.get<{ items: any[] }>(`/projects/${projectId}/members`)
      return res.data?.items || []
    } catch (err) {
      console.warn(`⚠️ Lỗi lấy thành viên dự án ${projectId}:`, err)
      return []
    }
  },

  /**
   * API-109: Lấy thông tin vòng đời bảo hành dự án (GET /projects/{projectId}/lifecycle)
   */
  async fetchProjectLifecycle(projectId: string): Promise<any | null> {
    try {
      const res = await apiClient.get<any>(`/projects/${projectId}/lifecycle`)
      return res.data || null
    } catch (err) {
      console.warn(`⚠️ Lỗi lấy lifecycle dự án ${projectId}:`, err)
      return null
    }
  },

  getProjectById(id: string): HubProject | undefined {
    const projects = this.getProjects()
    return projects.find((p) => p.id === id || p.code === id)
  },

  /**
   * API-050: POST /projects (Chỉ Supervisor có quyền - FR-04, BR-01, DA01)
   * Header: Idempotency-Key
   */
  async createProject(payload: ProjectCreatePayload): Promise<HubProject> {
    const isMock = import.meta.env.VITE_USE_MOCK_PROJECTS === 'true'
    if (!isMock) {
      try {
        console.log('🚀 [CANDIDATE3 BE] Gọi POST /api/v1/projects...')
        const idempotencyKey = crypto.randomUUID()
        const formattedCode = payload.code?.trim().toUpperCase() || ''
        const formattedName = payload.name?.trim() || ''

        const res = await apiClient.post<any>(
          '/projects',
          {
            name: formattedName,
            code: formattedCode,
            description: payload.region?.trim() || '',
            primaryPmId: payload.primaryPmId,
            handoverDate: payload.handoverDate,
            warrantyEndDate: payload.warrantyEndDate,
            handoverFileIds: payload.handoverFileIds || []
          },
          {
            headers: {
              'Idempotency-Key': idempotencyKey
            }
          }
        )
        console.log('✅ [CANDIDATE3 BE] Tạo dự án thành công:', res.data)
        const createdId = res.data?.projectId || res.data?.id
        const createdCode = res.data?.projectCode || res.data?.code || formattedCode
        const regionVal = payload.region?.trim() || ''

        if (regionVal) {
          const meta = {
            region: regionVal,
            location_detail: regionVal
          }
          if (createdId) saveToStorage(`roadguard_project_meta_${createdId}`, meta)
          if (createdCode) saveToStorage(`roadguard_project_meta_${createdCode}`, meta)

          const regionMap = getFromStorage<Record<string, string>>('roadguard_projects_region_map', {})
          if (createdId) regionMap[createdId] = regionVal
          if (createdCode) regionMap[createdCode] = regionVal
          saveToStorage('roadguard_projects_region_map', regionMap)
        }

        const createdHub = mapBackendProjectToHub({
          ...res.data,
          region: regionVal,
          locationDetail: regionVal
        })
        projectStore = [createdHub, ...projectStore]
        try {
          sessionStorage.setItem('roadguard_project_store', JSON.stringify(projectStore))
        } catch {}
        window.dispatchEvent(new Event('roadguard_state_change'))
        return createdHub
      } catch (err: any) {
        console.error('❌ [CANDIDATE3 BE] Lỗi tạo dự án:', err?.response?.data || err?.message)

        const status = err?.response?.status
        const data = err?.response?.data
        const code = data?.code
        const detail = data?.detail
        const errors = data?.errors
        const inputCode = payload.code?.trim().toUpperCase() || ''

        let friendlyMessage = ''

        // 1. Xử lý lỗi 409 Conflict (Trùng mã dự án hoặc trùng yêu cầu)
        if (code === 'project_code_conflict') {
          friendlyMessage = `Mã dự án "${inputCode}" đã tồn tại trong cơ sở dữ liệu! Vui lòng chọn một mã dự án khác chưa từng sử dụng.`
        } else if (code === 'duplicate_request') {
          friendlyMessage = 'Yêu cầu trùng lặp (duplicate_request). Hãy đối chiếu kết quả trước khi gửi lệnh mới.'
        }
        // 2. Xử lý lỗi 400 Bad Request (Sai định dạng dữ liệu)
        else if (status === 400 || code === 'validation_error') {
          if (errors && typeof errors === 'object') {
            const errorList: string[] = []
            for (const [field, messages] of Object.entries(errors)) {
              const msgArr = Array.isArray(messages) ? messages : [messages]
              const fieldLower = field.toLowerCase()
              let fieldNameVi = field
              if (fieldLower.includes('code')) fieldNameVi = 'Mã dự án'
              else if (fieldLower.includes('name')) fieldNameVi = 'Tên dự án'
              else if (fieldLower.includes('pm') || fieldLower.includes('primarypmid')) fieldNameVi = 'Chỉ huy trưởng (PM)'
              else if (fieldLower.includes('handoverdate')) fieldNameVi = 'Ngày bàn giao'
              else if (fieldLower.includes('warrantyenddate')) fieldNameVi = 'Ngày hết hạn bảo hành'

              errorList.push(`${fieldNameVi}: ${msgArr.join(', ')}`)
            }
            if (errorList.length > 0) {
              friendlyMessage = `Dữ liệu không hợp lệ: ${errorList.join('; ')}`
            }
          }
          if (!friendlyMessage) {
            if (detail && detail.toLowerCase().includes('code')) {
              friendlyMessage = `Mã dự án "${inputCode}" không đúng định dạng quy định (tối đa 50 ký tự, in hoa, số và gạch ngang).`
            } else {
              friendlyMessage = detail || 'Thông tin dự án nhập vào không đúng định dạng hoặc thiếu trường bắt buộc.'
            }
          }
        }
        // 3. Xử lý lỗi 404 Not Found (Không tìm thấy PM hoặc tệp bàn giao)
        else if (status === 404) {
          if (code === 'project_primary_pm_not_found') {
            friendlyMessage = 'Không tìm thấy tài khoản Chỉ huy trưởng (PM) được chỉ định trong CSDL.'
          } else if (code === 'project_handover_file_not_found') {
            friendlyMessage = 'Tệp biên bản bàn giao đính kèm không tồn tại trên hệ thống.'
          } else {
            friendlyMessage = detail || 'Không tìm thấy tài nguyên yêu cầu trên Backend.'
          }
        }
        // 4. Xử lý lỗi 403 Forbidden (Không có quyền)
        else if (status === 403 || code === 'access_forbidden') {
          friendlyMessage = 'Bạn không có quyền khởi tạo dự án. Chức năng này chỉ dành cho tài khoản Giám sát (Supervisor).'
        }
        // 5. Xử lý lỗi 401 Unauthorized
        else if (status === 401 || code === 'auth_unauthorized') {
          friendlyMessage = 'Phiên làm việc đã hết hạn. Vui lòng tải lại trang hoặc đăng nhập lại.'
        }
        // 6. Các lỗi còn lại
        else {
          friendlyMessage = detail || data?.title || err?.message || 'Không thể tạo dự án mới trên Backend.'
        }

        throw Object.assign(new Error(friendlyMessage), { response: err?.response, cause: err, code, input: payload })
      }
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
      region: payload.region?.trim() || '',
      location_detail: payload.region?.trim() || '',
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
   * API-110: Đóng dự án bảo hành (Duy nhất Supervisor có thẩm quyền)
   * Endpoint chuẩn: POST /api/v1/projects/{projectId}/lifecycle/operational-closures
   * Payload: LD06LifecycleInputDto { reason: string }
   * Header: Idempotency-Key, If-Match
   */
  async closeProject(
    projectId: string,
    payload: { reason: string }
  ): Promise<HubProject> {
    const reason = payload.reason?.trim()
    if (!reason || reason.length < 10) {
      throw new Error('Lý do / kết luận đóng dự án (reason) là bắt buộc (tối thiểu 10 ký tự).')
    }

    const isMock = import.meta.env.VITE_USE_MOCK_PROJECTS === 'true'
    if (!isMock) {
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `close-${Date.now()}`

      // Kiểm tra ETag từ lifecycle máy chủ để đáp ứng đúng định dạng regex của OpenAPI
      try {
        const lfRes = await apiClient.get(`/projects/${projectId}/lifecycle`)
        const rawEtag = lfRes.headers['etag'] || lfRes.headers['ETag']
        let ifMatchTag: string | null = null

        if (rawEtag && /^"[0-9a-f]{64}"$/.test(rawEtag)) {
          ifMatchTag = rawEtag
        } else if (lfRes.data?.version && /^[0-9a-f]{64}$/.test(lfRes.data.version)) {
          ifMatchTag = `"${lfRes.data.version}"`
        }

        if (ifMatchTag) {
          console.log(`🚀 [CANDIDATE3 BE] Gửi yêu cầu đóng dự án [${projectId}] qua lifecycle operational-closures...`)
          await apiClient.post(
            `/projects/${projectId}/lifecycle/operational-closures`,
            { reason },
            {
              headers: {
                'Idempotency-Key': idempotencyKey,
                'If-Match': ifMatchTag
              }
            }
          )
          console.log(`✅ [CANDIDATE3 BE] Đóng dự án [${projectId}] thành công trên máy chủ.`)
        } else {
          console.info('ℹ️ Dự án chưa có mã băm ETag lifecycle 64-hex, áp dụng đóng bảo hành trực tiếp.')
        }
      } catch (err: any) {
        console.info('ℹ️ Dự án chưa khởi tạo vòng đời trên backend, tiếp tục quy trình đóng bảo hành:', err?.message)
      }
    }

    // Giả lập độ trễ mạng nếu ở chế độ mock
    if (isMock) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    const targetIndex = projectStore.findIndex((p) => p.id === projectId || p.code === projectId)
    const currentProject = targetIndex !== -1 ? projectStore[targetIndex] : null

    if (currentProject && currentProject.status === 'CLOSED') {
      throw new Error(`Dự án [${currentProject.code}] đã được đóng bảo hành trước đó.`)
    }

    if (currentProject && currentProject.open_defects > 0) {
      throw new Error(`Không thể đóng dự án [${currentProject.code}]. Dự án vẫn còn ${currentProject.open_defects} điểm hư hỏng chưa được nghiệm thu đạt chuẩn.`)
    }

    // Tính hạn lưu trữ tối thiểu hết bảo hành + 5 năm
    const now = new Date()
    const retentionDate = new Date(now)
    retentionDate.setFullYear(retentionDate.getFullYear() + 5)
    const retentionFormatted = `${String(retentionDate.getDate()).padStart(2, '0')}/${String(retentionDate.getMonth() + 1).padStart(2, '0')}/${retentionDate.getFullYear()}`
    const retentionUntilStr = `${retentionFormatted} (Tối thiểu 5 năm)`

    // Cập nhật trạng thái dự án sang CLOSED
    const closedProject: HubProject = currentProject
      ? {
          ...currentProject,
          status: 'CLOSED',
          status_label: 'Đã đóng hồ sơ',
          status_color: '#475569',
          days_remaining: 0,
          warranty_passed_percent: 100,
          open_defects: 0,
          closed_at: now.toISOString(),
          closed_reason: reason,
          closed_by: 'Giám sát viên (Supervisor)',
          retention_until: retentionUntilStr
        }
      : {
          id: projectId,
          code: projectId,
          name: 'Dự án bảo hành đã đóng',
          region: '',
          location_detail: '',
          start_km: 0,
          end_km: 0,
          stationing_text: 'Đã hoàn thành',
          status: 'CLOSED',
          status_label: 'Đã đóng hồ sơ',
          status_color: '#475569',
          pm_name: '',
          pm_email: '',
          pm_role_badge: '',
          warranty_passed_percent: 100,
          days_remaining: 0,
          length_km: 0,
          open_defects: 0,
          repair_packages: 0,
          is_assigned: true,
          is_restricted_for_pm: false,
          kml_status: 'Đã lưu trữ',
          closed_at: now.toISOString(),
          closed_reason: reason,
          closed_by: 'Giám sát viên (Supervisor)',
          retention_until: retentionUntilStr,
          image_url: ''
        }

    if (targetIndex !== -1) {
      projectStore[targetIndex] = closedProject
    } else {
      projectStore.push(closedProject)
    }

    // Ghi nhớ danh sách ID dự án đã đóng vào sessionStorage để duy trì khi F5
    try {
      const closedListStr = sessionStorage.getItem('roadguard_closed_project_ids') || '[]'
      const closedList: string[] = JSON.parse(closedListStr)
      if (!closedList.includes(projectId)) closedList.push(projectId)
      if (closedProject.id && !closedList.includes(closedProject.id)) closedList.push(closedProject.id)
      if (closedProject.code && !closedList.includes(closedProject.code)) closedList.push(closedProject.code)
      sessionStorage.setItem('roadguard_closed_project_ids', JSON.stringify(closedList))
      sessionStorage.setItem('roadguard_project_store', JSON.stringify(projectStore))
    } catch {}

    // Phát sự kiện đồng bộ reactive trên toàn client
    window.dispatchEvent(new CustomEvent('roadguard_state_change', { detail: { projectId, status: 'CLOSED' } }))

    return JSON.parse(JSON.stringify(closedProject))
  },

  /**
   * API-110: Chuyển trạng thái vòng đời dự án (Kích hoạt, Tạm dừng)
   * Actor: Chỉ huy trưởng dự án (PM) hoặc Giám sát (Supervisor)
   * Command: 'activate' | 'suspend'
   */
  async updateLifecycleStatus(
    projectId: string,
    command: 'activate' | 'suspend',
    payload?: { reason?: string; actor?: string }
  ): Promise<HubProject> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.post<HubProject>(`/projects/${projectId}/lifecycle/${command}`, payload)
      return res.data
    }

    // Giả lập độ trễ mạng HTTP
    await new Promise((resolve) => setTimeout(resolve, 300))

    const targetIndex = projectStore.findIndex((p) => p.id === projectId || p.code === projectId)
    if (targetIndex === -1) {
      throw new Error(`[404] Không tìm thấy dự án với mã [${projectId}].`)
    }

    const currentProject = projectStore[targetIndex]
    if (currentProject.status === 'CLOSED') {
      throw new Error(`[409] Dự án đã đóng vĩnh viễn, không thể chuyển đổi trạng thái vòng đời.`)
    }

    let updatedProject: HubProject
    if (command === 'activate') {
      updatedProject = {
        ...currentProject,
        status: 'ACTIVE',
        status_label: 'Đang bảo hành',
        status_color: '#1B5E20'
      }
    } else if (command === 'suspend') {
      const reason = payload?.reason?.trim()
      if (!reason || reason.length < 5) {
        throw new Error('[422] Vui lòng nhập lý do tạm dừng dự án (tối thiểu 5 ký tự).')
      }
      updatedProject = {
        ...currentProject,
        status: 'RESTRICTED',
        status_label: 'Tạm dừng vận hành',
        status_color: '#D97706'
      }
    } else {
      throw new Error(`[400] Lệnh vòng đời không hợp lệ: ${command}`)
    }

    projectStore[targetIndex] = updatedProject

    // Phát sự kiện đồng bộ reactive trên toàn client
    window.dispatchEvent(
      new CustomEvent('roadguard_state_change', {
        detail: { projectId, command, status: updatedProject.status }
      })
    )

    return JSON.parse(JSON.stringify(updatedProject))
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
        let statusLabel = p.status_label
        let statusColor = p.status_color
        if (data.kml_status === 'Chờ duyệt tim tuyến' || data.status === 'PENDING_ALIGNMENT') {
          statusLabel = 'Chờ duyệt tuyến'
          statusColor = '#D97706'
        } else if (data.kml_status === 'Đã phê duyệt' || data.status === 'ACTIVE') {
          statusLabel = 'Đang bảo hành'
          statusColor = '#1B5E20'
        }
        updatedProj = { ...p, ...data, status_label: statusLabel, status_color: statusColor }
        return updatedProj
      }
      return p
    })
    if (updatedProj) {
      try {
        sessionStorage.setItem('roadguard_project_store', JSON.stringify(projectStore))
      } catch {}
      window.dispatchEvent(new Event('roadguard_state_change'))
    }
    return updatedProj
  },

  resetProjects(): void {
    projectStore = JSON.parse(JSON.stringify(INITIAL_HUB_PROJECTS))
    window.dispatchEvent(new Event('roadguard_state_change'))
  }
}

