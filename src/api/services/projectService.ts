import { readProjectServerFacts, readProjectWorkPackage, type ProjectServerFacts } from './projectServerFacts'
import { validWarrantyDates } from '../../utils/projectWarranty'
import { personnelService } from './personnelService'
import { apiClient } from '../client'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'
import { HubProject } from '../../types/domain'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { userDirectory } from './userDirectory'

export type { HubProject }

// Không còn dữ liệu dự án mẫu trong FE: toàn bộ lấy từ API BE
export const INITIAL_HUB_PROJECTS: HubProject[] = []

export interface ProjectCreatePayload {
  engineeringUtmSrid?: number | null
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
  if (p.server_data_loaded) return p
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
  // Chỉ gọi /api/v1/users nếu người dùng hiện tại là SUPERVISOR (PM gọi sẽ bị 403)
  const currentUser = useAuthStore.getState().user
  if (currentUser?.role === RoleCode.SUPERVISOR) {
    const users = await personnelService.fetchStaffDirectory()
    const entries = users.map(u => ({ id: u.userId, displayName: u.displayName || '', email: u.email || '', role: u.role || '' }))
    entries.forEach(u => map.set(u.id.toLowerCase(), { userId: u.id, displayName: u.displayName, email: u.email, role: u.role }))
    userDirectory.registerUsers(entries)
  }
  return map
}

const projectDescriptions = new Map<string, Promise<string>>()
function readProjectDescription(projectId: string, epoch: number): Promise<string> {
  const actor = useAuthStore.getState().user?.id
  const key = `${epoch}:${actor}:${projectId.toLowerCase()}`
  const existing = projectDescriptions.get(key)
  if (existing) return existing
  const current = () => {
    if (useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor) throw new Error('Phiên đã thay đổi; bỏ địa bàn dự án cũ.')
  }
  const request = (async () => {
    current()
    const data = await readProjectWorkPackage(projectId)
    current()
    if (typeof data?.projectId !== 'string' || data.projectId.toLowerCase() !== projectId.toLowerCase() ||
        !Object.prototype.hasOwnProperty.call(data, 'description') || data.description !== null && typeof data.description !== 'string') {
      throw new Error('Không xác minh được địa bàn từ đúng hồ sơ dự án.')
    }
    return data.description?.trim() || ''
  })()
  projectDescriptions.set(key, request)
  void request.finally(() => { if (projectDescriptions.get(key) === request) projectDescriptions.delete(key) }).catch(() => {})
  return request
}

function mapBackendProjectToHub(
  item: any,
  usersMap?: Map<string, UserLookupInfo>,
  statsMap?: Map<string, { openDefects: number; repairPackages: number }>
): HubProject {
  const statusStr = (item.status || 'UNKNOWN').toUpperCase()
  let status: HubProject['status'] = 'UNKNOWN'
  let statusLabel = item.status || 'Chưa cập nhật'
  let statusColor = '#D97706'

  if (statusStr === 'CLOSED') {
    status = 'CLOSED'
    statusLabel = 'Đã đóng hồ sơ'
    statusColor = '#475569'
  } else if (statusStr === 'ACTIVE') {
    status = 'ACTIVE'; statusLabel = 'Đang hoạt động'; statusColor = '#1B5E20'
  } else if (statusStr === 'RESTRICTED' || statusStr === 'SUSPENDED') {
    status = 'RESTRICTED'
    statusLabel = 'Tạm dừng vận hành'
    statusColor = '#D97706'
  }

  const projId = item.projectId || item.id || ''
  const projCode = item.projectCode || item.code || ''

  const pmUserId = item.primaryProjectManagerUserId ? String(item.primaryProjectManagerUserId).toLowerCase() : ''
  let pmName = item.primaryProjectManagerName || ''
  let pmEmail = ''

  if (usersMap && pmUserId) {
    const match = usersMap.get(pmUserId)
    if (match) { pmName = match.displayName || pmName; pmEmail = match.email || '' }
  }

  if (!pmName) {
    pmName = pmUserId ? 'Chưa cập nhật' : 'Chưa cập nhật'
  }


  // Tính toán thời gian bảo hành thực tế dựa trên handoverDate và warrantyEndDate
  const now = new Date()
  const handoverStr = item.handoverDate || ''
  const warrantyEndStr = item.warrantyEndDate || ''

  const warrantyDataMissing = !validWarrantyDates(handoverStr, warrantyEndStr)
  const handover = handoverStr ? new Date(handoverStr) : now
  const warrantyEnd = warrantyEndStr ? new Date(warrantyEndStr) : now

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

  if (warrantyDataMissing) {
    warrantyPassedPercent = Number.NaN
    daysRemaining = Number.NaN
  } else if (totalDuration === 0 && passedDuration >= 0) {
    warrantyPassedPercent = 100
  }
  const region = item.region || item.location || item.description || ''
  const location_detail = item.locationDetail || item.location_detail || ''

  const project: HubProject = {
    id: projId,
    code: item.projectCode || item.code || 'Chưa cập nhật',
    name: item.name || 'Chưa cập nhật',
    region,
    location_detail,
    start_km: undefined,
    end_km: undefined,
    stationing_text: 'Chưa thiết lập tim tuyến',
    status,
    status_label: statusLabel,
    status_color: statusColor,
    pm_name: pmName,
    pm_email: pmEmail,
    pm_user_id: item.primaryProjectManagerUserId,
    pm_role_badge: pmUserId ? 'PM Chính' : '',
    warranty_data_missing: warrantyDataMissing,
    warranty_passed_percent: warrantyPassedPercent,
    days_remaining: daysRemaining,
    length_km: undefined,
    open_defects: statsMap && projId && statsMap.get(projId.toLowerCase()) ? statsMap.get(projId.toLowerCase())!.openDefects : Number.NaN,
    repair_packages: statsMap && projId && statsMap.get(projId.toLowerCase()) ? statsMap.get(projId.toLowerCase())!.repairPackages : Number.NaN,
    image_url: '',
    is_assigned: !!pmUserId,
    is_restricted_for_pm: false,
    kml_status: 'Chưa có tim tuyến',
    handover_date: item.handoverDate,
    warranty_end_date: item.warrantyEndDate,
    handover_file_ids: item.handoverFileIds || []
  }

  return project
}

// Bộ nhớ đệm danh sách dự án đọc từ BE (không có dữ liệu khởi tạo cứng)
let projectStore: HubProject[] = []

useAuthStore.subscribe((state, previous) => {
  if (state.authEpoch !== previous.authEpoch) {
    projectStore = []
    sessionStorage.removeItem('roadguard_project_store')
    saveToStorage(STORAGE_KEYS.PROJECTS, [])
  }
})

// Persist only command identity/body/receipt, scoped by the authoritative actor.
// No token/CSRF/cookie is stored. Full reload must not mint another unknown command.
let projectCreateCommand: { epoch: unknown; fingerprint: string; key: string; body: any; busy: boolean; receipt?: any } | null = null
const projectJournalKey = (actor: string) => `rg_pending_project_create_${actor}`
function saveProjectCommand(actor: string, command: typeof projectCreateCommand): void {
  if (command) sessionStorage.setItem(projectJournalKey(actor), JSON.stringify({ fingerprint: command.fingerprint, key: command.key, body: command.body, receipt: command.receipt }))
  else sessionStorage.removeItem(projectJournalKey(actor))
}
useAuthStore.subscribe((state, previous) => {
  if (state.authEpoch !== previous.authEpoch || state.user?.id !== previous.user?.id) projectCreateCommand = null
})

export interface ProjectClosureView {
  projectId: string; operationalClosure: string; operationalClosureEligibility: string;
  obligationInventory: string; missingReasons: string[]; outstandingMandatoryObligationIds: string[]; version: string
}
const closureWrites = new Set<string>()

export const projectService = {
  pendingProjectCreate() {
    const state = useAuthStore.getState()
    if (!projectCreateCommand && state.user?.id) {
      const saved = sessionStorage.getItem(projectJournalKey(state.user.id))
      if (saved) {
        const journal = JSON.parse(saved)
        if (!journal.key || !journal.body || journal.fingerprint !== JSON.stringify(journal.body)) throw new Error('Bản ghi yêu cầu tạo dự án không hợp lệ; cần đối chiếu trước khi tạo mới.')
        projectCreateCommand = { ...journal, epoch: state.authEpoch, busy: false }
      }
    }
    return projectCreateCommand ? { body: { ...projectCreateCommand.body }, busy: projectCreateCommand.busy, hasReceipt: !!projectCreateCommand.receipt } : null
  },
  /**
   * API-049: GET /projects
   * Lấy danh sách dự án thật từ Backend Candidate3 Docker theo phân quyền (PM / Supervisor)
   */
  async fetchProjects(): Promise<HubProject[]> {
    const epoch = useAuthStore.getState().authEpoch
    {
      try {
        console.log('🚀 [CANDIDATE3 BE] Gọi GET /api/v1/projects...')
        let directoryError = ''
        const usersMap = await getUsersLookup().catch(() => {
          directoryError = 'Chưa tải được thông tin danh bạ nhân sự.'
          return new Map<string, UserLookupInfo>()
        })
        const rawItems: any[] = []
        const cursors = new Set<string>()
        let cursor: string | undefined
        do {
          const res = await apiClient.get('/projects', { params: { cursor } })
          if (!Array.isArray(res.data?.items)) throw new Error('Danh sách dự án trả sai contract.')
          rawItems.push(...res.data.items)
          cursor = res.data.nextCursor || undefined
          if (cursor && cursors.has(cursor)) throw new Error('Cursor dự án bị lặp.')
          if (cursor) cursors.add(cursor)
        } while (cursor)

        const currentUser = useAuthStore.getState().user
        const isPM = currentUser?.role === RoleCode.PROJECT_MANAGER
        const statsErrors = new Map<string, string>()
        const descriptions = new Map<string, string>()
        const descriptionErrors = new Map<string, string>()
        const serverFacts = new Map<string, ProjectServerFacts>()
        const factErrors = new Map<string, string>()
        await Promise.all([...new Set(rawItems.map(item => String(item.projectId || item.id)))].map(async id => {
          try {
            const facts = await readProjectServerFacts(id)
            serverFacts.set(id.toLowerCase(), facts); descriptions.set(id.toLowerCase(), facts.description)
            if (facts.descriptionError) descriptionErrors.set(id.toLowerCase(), facts.descriptionError)
          } catch (error: any) {
            const message = `Chưa tải được địa bàn/hồ sơ server: ${error?.response?.status || ''} ${error?.response?.data?.code || error.message}`
            factErrors.set(id.toLowerCase(), message); descriptionErrors.set(id.toLowerCase(), message)
          }
        }))
        const statsMap = new Map<string, { openDefects: number; repairPackages: number }>()
        await Promise.all(
          rawItems.map(async (item) => {
            const pId = item.projectId || item.id
            if (!pId) return
            const [defects, packages] = await Promise.allSettled([
              apiClient.get<any>(`/projects/${pId}/${isPM ? 'defects' : 'defect-statistics'}`),
              apiClient.get<any>(`/projects/${pId}/repair-packages`)
            ])
            let openDefects = Number.NaN
            let repairPackages = Number.NaN
            const errors: string[] = []
            if (defects.status === 'fulfilled') {
              const page = defects.value.data
              if (isPM && Array.isArray(page?.items) && !page.nextCursor) {
                openDefects = page.items.filter((d: any) => !['RESOLVED', 'CLOSED', 'PASSED'].includes((d.status || d.verificationStatus || '').toUpperCase())).length
              } else if (!isPM && typeof page?.statistics?.openDefectsCount === 'number') {
                openDefects = page.statistics.openDefectsCount
              }
            }
            if (!Number.isFinite(openDefects)) errors.push('Chưa tải đầy đủ số lỗi mở.')
            if (packages.status === 'fulfilled' && Array.isArray(packages.value.data?.items) && !packages.value.data.nextCursor) {
              repairPackages = packages.value.data.items.length
            }
            if (!Number.isFinite(repairPackages)) errors.push('Chưa tải đầy đủ số gói sửa.')
            statsMap.set(pId.toLowerCase(), { openDefects, repairPackages })
            if (errors.length) statsErrors.set(pId.toLowerCase(), errors.join(' '))
          })
        )

        const mapped = rawItems.map((item) => {
          const id = (item.projectId || item.id).toLowerCase()
          const project = mapBackendProjectToHub(item, usersMap, statsMap)
          const facts = serverFacts.get(id), readError = factErrors.get(id)
          return { ...project, server_data_loaded: true, server_facts: facts,
            region: descriptionErrors.has(id) ? 'Chưa tải được địa bàn' : descriptions.get(id)!, location_detail: '',
            length_km: facts?.lengthKm, stationing_text: readError ? 'Không tải được dữ liệu tim tuyến' : facts!.stationing,
            kml_status: readError ? 'Không tải được dữ liệu tim tuyến' : facts!.geometryLabel,
            geometry_read_error: readError || facts?.geometryError || facts?.submissionError,
            warranty_read_error: readError || facts?.warrantyError, warranty_message: facts?.warrantyMessage,
            handover_date: facts?.handoverDate, warranty_start_date: facts?.warrantyStartDate, warranty_end_date: facts?.warrantyEndDate,
            warranty_data_missing: !facts?.warrantyStartDate || !facts?.warrantyEndDate,
            warranty_passed_percent: facts?.warrantyPercent ?? Number.NaN, days_remaining: facts?.daysRemaining ?? Number.NaN,
            is_assigned: !facts?.primaryError && !!facts?.primary,
            pm_name: facts?.primaryError ? 'Không tải được PM chính' : facts?.primary?.displayName || (facts?.primary ? 'Chưa có tên PM chính' : 'Chưa phân công PM chính'),
            pm_user_id: facts?.primary?.userId, pm_role_badge: facts?.primary ? 'PM Chính' : '',
            stats_error: [directoryError, statsErrors.get(id), descriptionErrors.get(id), facts?.primaryError].filter(Boolean).join('; ') }
        })
        if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ danh sách dự án cũ.')
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
    const all = await this.fetchProjects()
    return all.find(project => project.id === id || project.code === id)
  },

  /**
   * API-112: Lấy danh sách thành viên dự án (GET /projects/{projectId}/members)
   */
  async fetchProjectMembers(projectId: string, includeHistory = false): Promise<any[]> {
    const epoch = useAuthStore.getState().authEpoch
    const items: any[] = []
    const cursors = new Set<string>()
    let cursor: string | undefined
    do {
      const res = await apiClient.get(`/projects/${projectId}/members`, { params: { limit: 100, includeHistory: includeHistory && useAuthStore.getState().user?.role === RoleCode.SUPERVISOR, cursor } })
      if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ dữ liệu thành viên cũ.')
      if (!Array.isArray(res.data?.items)) throw new Error('Danh sách thành viên trả sai contract.')
      items.push(...res.data.items)
      cursor = res.data.nextCursor || undefined
      if (cursor && cursors.has(cursor)) throw new Error('Cursor thành viên bị lặp.')
      if (cursor) cursors.add(cursor)
    } while (cursor)
    return items
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
  async createProject(payload: ProjectCreatePayload, replay = false): Promise<HubProject> {
    {
      this.pendingProjectCreate()
      const epoch = useAuthStore.getState().authEpoch
      const actor = useAuthStore.getState().user?.id
      if (!actor) throw new Error('Chưa xác định được phiên tạo dự án.')
      if (payload.handoverFileIds?.length) throw new Error('Chưa hỗ trợ upload bàn giao trước dự án; hãy tạo không đính kèm file.')
      if (useAuthStore.getState().user?.role !== RoleCode.SUPERVISOR) throw new Error('Chỉ Giám sát được tạo dự án.')
      const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
      if (!payload.code.trim() || payload.code.trim().length > 50 || !payload.name.trim() || payload.name.trim().length > 255 ||
          !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(payload.primaryPmId) ||
          !validDate(payload.handoverDate) || !validDate(payload.warrantyEndDate) || payload.warrantyEndDate < payload.handoverDate) {
        throw new Error('Kiểm tra mã/tên dự án, PM và ngày bảo hành không trước ngày bàn giao.')
      }
      if ((!replay || !projectCreateCommand) && ![32648, 32649].includes(payload.engineeringUtmSrid!)) throw new Error('engineeringUtmSrid: bắt buộc chọn CRS kỹ thuật theo hồ sơ tọa độ (EPSG:32648 hoặc EPSG:32649).')
      const body = { ...(payload.engineeringUtmSrid != null ? { engineeringUtmSrid: payload.engineeringUtmSrid } : {}), name: payload.name.trim(), code: payload.code.trim().toUpperCase(), description: payload.region?.trim() || '',
        primaryPmId: payload.primaryPmId, handoverDate: payload.handoverDate, warrantyEndDate: payload.warrantyEndDate, handoverFileIds: [] }
      const fingerprint = JSON.stringify(body)
      if (projectCreateCommand && (projectCreateCommand.busy || !replay || fingerprint !== projectCreateCommand.fingerprint)) {
        throw new Error('Yêu cầu trước chưa rõ kết quả. Chỉ gửi lại cùng nội dung và khóa đã giữ; không tạo ý định mới.')
      }
      const command = projectCreateCommand || { epoch, fingerprint, key: crypto.randomUUID(), body, busy: false }
      projectCreateCommand = command
      command.busy = true
      const current = () => useAuthStore.getState().authEpoch === epoch && useAuthStore.getState().user?.id === actor
      try {
        saveProjectCommand(actor, command)
        if (!command.receipt) {
          const response = await apiClient.post('/projects', command.body, { headers: { 'Idempotency-Key': command.key } })
          if (!current()) throw new Error('Phiên đã thay đổi; bỏ kết quả tạo dự án cũ.')
          if (response.status !== 201 || !(response.data.projectId || response.data.id)) throw new Error('Phản hồi tạo dự án không đúng contract201; cần đối chiếu kết quả.')
          command.receipt = response.data
          saveProjectCommand(actor, command)
        }
        const createdId = command.receipt.projectId || command.receipt.id
        let cursor: string | undefined
        const seen = new Set<string>()
        let readBack: any
        do {
          const response = await apiClient.get('/projects', { params: { cursor } })
          if (!current()) throw new Error('Phiên đã thay đổi; bỏ kết quả dự án cũ.')
          if (!Array.isArray(response.data?.items)) throw new Error('Danh sách đọc lại dự án trả sai contract.')
          readBack = response.data.items.find((item: any) => (item.projectId || item.id) === createdId)
          cursor = response.data.nextCursor || undefined
          if (cursor && seen.has(cursor)) throw new Error('Cursor dự án bị lặp khi đọc lại kết quả.')
          if (cursor) seen.add(cursor)
        } while (!readBack && cursor)
        if (!readBack) throw new Error('Đã nhận201 nhưng chưa đọc lại được dự án từ danh sách server. Hãy đối chiếu cùng yêu cầu.')
        if (command.body.engineeringUtmSrid != null) {
          const context = (await apiClient.get(`/projects/${createdId}/work-package`)).data
          if (!current()) throw new Error('Phiên đã thay đổi; bỏ context dự án cũ.')
          if (context?.projectId !== createdId || context.engineeringUtmSrid !== command.body.engineeringUtmSrid) throw new Error('Đã tạo dự án nhưng CRS GET chưa khớp lựa chọn. Chỉ đọc lại kết quả, không tạo lại.')
        }
        const description = await readProjectDescription(createdId, epoch)
        if (!current()) throw new Error('Phiên đã thay đổi; bỏ kết quả dự án cũ.')
        const createdHub = { ...mapBackendProjectToHub(readBack), region: description, location_detail: '' }
        if (createdHub.pm_user_id?.toLowerCase() !== command.body.primaryPmId.toLowerCase()) throw new Error('Đã tạo dự án nhưng phân công PM đọc lại chưa khớp. Chỉ đọc lại kết quả, không tạo mới.')
        if (projectCreateCommand === command) { projectCreateCommand = null; saveProjectCommand(actor, null) }
        return createdHub
      } catch (err: any) {
        console.error('❌ [CANDIDATE3 BE] Lỗi tạo dự án:', err?.response?.data || err?.message)

        const status = err?.response?.status
        const data = err?.response?.data
        const code = data?.code
        if (current() && projectCreateCommand === command && !command.receipt && status >= 400 && status < 500 && code !== 'duplicate_request') { projectCreateCommand = null; saveProjectCommand(actor, null) }
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
        else if (code === 'csrf_failed') {
          friendlyMessage = 'CSRF không hợp lệ. Hãy kiểm tra lại phiên Web trước khi tạo dự án.'
        } else if (status === 403 || code === 'access_forbidden') {
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

        if (command.receipt) friendlyMessage = `Dự án đã được tạo; chưa đọc lại đầy đủ kết quả. Không tạo lại. ${friendlyMessage}`
        throw Object.assign(new Error(friendlyMessage), { response: err?.response, cause: err, code, input: payload })
      } finally {
        command.busy = false
      }
    }
  },

  /**
   * API-110: Đóng dự án bảo hành (Duy nhất Supervisor có thẩm quyền)
   * Endpoint chuẩn: POST /api/v1/projects/{projectId}/lifecycle/operational-closures
   * Payload: LD06LifecycleInputDto { reason: string }
   * Header: Idempotency-Key, If-Match
   */
  async readProjectClosure(projectId: string): Promise<{ data: ProjectClosureView; etag: string }> {
    const response = await apiClient.get<ProjectClosureView>(`/projects/${projectId}/lifecycle`)
    const etag = response.headers?.etag || `"${response.data.version}"`
    if (response.data.projectId !== projectId || !/^"[0-9a-f]{64}"$/.test(etag)) throw new Error('Không xác nhận được phiên bản hồ sơ dự án.')
    return { data: response.data, etag }
  },

  async closeProject(projectId: string, payload: { reason: string; version?: string }): Promise<ProjectClosureView> {
    const state = useAuthStore.getState(), actor = state.user, epoch = state.authEpoch
    if (actor?.role !== RoleCode.SUPERVISOR) throw new Error('Chỉ Giám sát được đóng vận hành dự án.')
    if (!payload.reason.trim() || payload.reason.trim().length > 2000 || !/^"[0-9a-f]{64}"$/.test(payload.version || '')) throw new Error('Thiếu lý do hoặc phiên bản hồ sơ đã đọc.')
    const key = `rg_project_closure_${actor.id}_${projectId}`
    const body = { reason: payload.reason.trim(), evidenceFileIds: [] }
    const fingerprint = JSON.stringify({ body, version: payload.version })
    const saved = sessionStorage.getItem(key)
    const command = saved ? JSON.parse(saved) : { key: crypto.randomUUID(), body, version: payload.version, fingerprint }
    if (command.fingerprint !== fingerprint) throw new Error('Yêu cầu đóng trước chưa được đối chiếu. Không đổi nội dung hoặc phiên bản để gửi lại.')
    if (closureWrites.has(key)) throw new Error('Đang gửi yêu cầu đóng dự án.')
    const current = () => { if (useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor.id) throw new Error('Phiên đã thay đổi; bỏ kết quả cũ.') }
    closureWrites.add(key)
    try {
      current(); sessionStorage.setItem(key, JSON.stringify(command))
      if (!command.receipt) {
        const response = await apiClient.post(`/projects/${projectId}/lifecycle/operational-closures`, command.body, {
          headers: { 'Idempotency-Key': command.key, 'If-Match': command.version }, transformRequest: [(data: unknown) => { current(); return JSON.stringify(data) }]
        })
        current(); command.receipt = response.data; sessionStorage.setItem(key, JSON.stringify(command))
      }
      const fresh = await this.readProjectClosure(projectId)
      current()
      if (fresh.data.operationalClosure !== 'CONFIRMED') throw new Error('Chưa xác nhận được kết quả đóng vận hành từ máy chủ. Vui lòng đối chiếu lại.')
      sessionStorage.removeItem(key)
      return fresh.data
    } finally { closureWrites.delete(key) }
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
    // BE không có lệnh activate/suspend (lifecycle/{command} chỉ gồm declarations/confirmations/closures/transfers/recurrences): không giả vờ gọi
    throw new Error(`Máy chủ chưa có lệnh vòng đời '${command}' cho Web.`)
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
  }
}
