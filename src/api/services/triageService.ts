import { readEligibleTriageProjects } from './triageProjectEligibility'
import { CanceledError, isCancel } from 'axios'
import { apiClient } from '../client'
import { TriageCase } from '../../types/domain'
import { saveToStorage, STORAGE_KEYS } from './storageHelper'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'

// DTO Interfaces theo OpenAPI Candidate3 (docs/contracts/openapi.json)
export interface InternalCaseDto {
  id: string // uuid
  projectId?: string | null
  status?: string | null
  version?: string | null
  reportIds?: string[] | null
  defectIds?: string[] | null
  verificationMethod?: string | null
  warrantyRouting?: string | null
  conclusion?: {
    id?: string
    outcome?: string | null
    reason?: string | null
    concludedAt?: string
    defectIds?: string[] | null
    evidenceIds?: string[] | null
  } | null
  createdAt?: string
}

export interface CasePageDto {
  items?: InternalCaseDto[] | null
  nextCursor?: string | null
}

export interface CaseTriageInput {
  projectId: string
  verificationMethod?: 'FIELD' | 'DRONE' | 'EXISTING_EVIDENCE' | null
  reason?: string | null
  routeVersionId?: string | null
  segmentSetId?: string | null
  geometryVersion?: string | null
  version?: string
}

export interface CaseConclusionInput {
  outcome: 'CONFIRMED' | 'NO_DEFECT' | 'NEEDS_EVIDENCE'
  reason?: string | null
  defectIds?: string[] | null
  evidenceIds?: string[] | null
  version?: string
}

export interface CasePublicationInput {
  summary?: string | null
  reportIds?: string[] | null
  defectIds?: string[] | null
  evidenceIds?: string[] | null
  version?: string
}

export interface TriageFilterParams {
  source?: string
  status?: string
  projectId?: string
  priority?: string
  searchQuery?: string
  cursor?: string
  pageSize?: number
}

// In-Memory Data Store đồng bộ qua STORAGE_KEYS.TRIAGE_CASES
// KHÔNG nạp mock data mặc định khi đã tích hợp API Candidate3 Backend (Tuân thủ kỷ luật AGENTS.md)
// Do not restore an unscoped cache belonging to a previous browser session.
let inMemoryTriageCases: TriageCase[] = []

/**
 * Chuẩn hóa chuỗi ETag theo quy định Candidate3:
 * Bắt buộc có dấu nháy kép bọc ngoài chuỗi Base64: ^"[A-Za-z0-9+/]{11}="$
 */
function normalizeETag(version?: string): string {
  if (!version) throw new Error('Thiếu phiên bản hồ sơ; hãy tải lại trước khi gửi lệnh.')
  const trimmed = version.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed
  }
  return `"${trimmed}"`
}

/**
 * Ánh xạ từ InternalCaseDto của Candidate3 sang Domain Model TriageCase của FE
 */
function mapBackendCaseToDomain(
  item: InternalCaseDto,
  projectMap: Record<string, string>
): TriageCase {
  const id = item.id
  const code = `#CAS-${id.slice(0, 8).toUpperCase()}`
  const projId = item.projectId || ''
  const projName = projId ? projectMap[projId] || 'Đã phân công — chưa có tên dự án' : ''
  const isAssigned = !!projId && item.status !== 'UNASSIGNED'

  let status: TriageCase['status'] = 'PENDING'
  let status_label = isAssigned ? 'Chờ thẩm định' : 'Chờ tiếp nhận sau điều phối'
  let conclusion: TriageCase['conclusion'] = null

  // Xử lý Candidate3 conclusion (safe navigation vì conclusion có thể bị omit theo AGENTS.md)
  if (item.conclusion?.outcome) {
    const outcome = item.conclusion.outcome
    const reasonLower = (item.conclusion.reason || '').toLowerCase()
    if (outcome === 'CONFIRMED') {
      status = 'VERIFIED'
      status_label = 'Đã xác minh (Hợp lệ)'
      conclusion = 'DEFECT_FOUND'
    } else if (outcome === 'NO_DEFECT') {
      status = 'REJECTED'
      if (reasonLower.includes('ngoài phạm vi') || reasonLower.includes('out_of_scope')) {
        status_label = 'Ngoài phạm vi'
        conclusion = 'OUT_OF_SCOPE'
      } else {
        status_label = 'Báo sai (Không có lỗi)'
        conclusion = 'NO_DEFECT'
      }
    } else if (outcome === 'NEEDS_EVIDENCE' && item.status === 'AWAITING_EVIDENCE') {
      status = 'AWAITING_EVIDENCE'
      status_label = 'Chờ bổ sung bằng chứng'
      conclusion = 'NEEDS_EVIDENCE'
    }
  } else if (item.status === 'AWAITING_EVIDENCE') {
    status = 'AWAITING_EVIDENCE'
    status_label = 'Chờ bổ sung bằng chứng'
  } else if (item.status === 'LINKED') {
    status = 'MERGED'
    status_label = 'Đã liên kết báo cáo'
  } else if (item.status === 'CONCLUDED') {
    status = 'VERIFIED'
    status_label = 'Đã kết luận'
  } else if (item.status === 'REJECTED') {
    status = 'REJECTED'
    status_label = 'Báo sai (Không có lỗi)'
  }

  const version = item.version || undefined
  const etag = version ? normalizeETag(version) : undefined

  // InternalCaseDto describes report intake; verificationMethod is not source provenance.

  return {
    id,
    code,
    source: 'UNKNOWN',
    case_status: item.status || undefined,
    source_label: 'Chưa xác định nguồn tiếp nhận',
    source_detail: item.verificationMethod ? `Phương thức xác minh: ${item.verificationMethod}` : 'Chưa chọn phương thức xác minh',
    verification_method: item.verificationMethod || undefined,
    project_id: projId,
    project_code: undefined,
    project_name: projName || 'Chưa phân công dự án',
    stationing: 'Chưa có dữ liệu lý trình',
    lane: '',
    defect_title: 'Hồ sơ tiếp nhận',
    defect_type: '',
    severity: 'UNKNOWN',
    urgency: 'UNKNOWN',
    time_ago: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Chưa có ngày tiếp nhận',
    created_at: item.createdAt || '',
    status,
    status_label,
    image_url: '',
    gps: { lat: null, lng: null, altitude_m: 0, resolution_cm_px: 0 },
    ai_confidence: 0,
    area_sqm: Number.NaN,
    ai_area_sqm: 0,
    max_depth_cm: Number.NaN,
    ai_depth_cm: 0,
    pm_notes: item.conclusion?.reason || '',

    conclusion,
    conclusion_reason: item.conclusion?.reason || undefined,
    report_ids: item.reportIds || [],
    // Report references are evidence membership, not linked child Case records.
    linked_report_ids: [],
    is_assigned: isAssigned,
    is_published: false,
    version,
    etag
  }
}

// Request ownership belongs to each consumer (AbortSignal). This counter only
// arbitrates the shared cache; a newer reader must not cancel another reader.
let caseCacheRequest = 0
let caseSessionEpoch = 0
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id || state.user?.role !== previous.user?.role ||
      state.isAuthenticated !== previous.isAuthenticated || state.authEpoch !== previous.authEpoch || state.token !== previous.token) {
    caseSessionEpoch += 1
    caseCacheRequest += 1
    inMemoryTriageCases = []
    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, [])
  }
})

// Profile updates/renewed cookie DTO objects are not a new authorization session.
export function getCaseSessionKey(): string {
  const state = useAuthStore.getState()
  return JSON.stringify([caseSessionEpoch, state.authEpoch, state.user?.id, state.user?.role, state.isAuthenticated])
}

function assertCaseReadActive(session: string, signal?: AbortSignal): void {
  if (signal?.aborted || session !== getCaseSessionKey()) {
    throw new CanceledError('Case read is no longer active')
  }
}

function etagHeaderMismatch(header: unknown, version: string): boolean {
  return typeof header === 'string' && header !== normalizeETag(version)
}
export interface CaseProjectOption { id: string; code: string; name: string }
export interface PendingTriage { key: string; body: Omit<CaseTriageInput,'version'>; version: string; fingerprint: string; receipt?: InternalCaseDto; received?: boolean; rejected?: boolean; conflict?: boolean }
function triageJournal(caseId: string) {
  const actor = useAuthStore.getState().user
  if (!actor) throw new Error('Chưa có phiên Case.')
  return `rg_triage_${actor.id}_${caseId}`
}
export class CaseListReadError extends Error {
  constructor(public readonly items: TriageCase[], public readonly failures: Array<{ projectId?: string; status?: string; cause: any }>) {
    super(`Danh sách chưa đầy đủ: ${failures.map(failure => `${failure.projectId || 'inbox chưa phân dự án'}${failure.status ? ` [${failure.status}]` : ''}: ${failure.cause.response?.data?.code || failure.cause.message}`).join('; ')}`)
  }
}

export const isCaseReadCanceled = isCancel
const pendingCaseCommands = new Map<string, { key: string; body: unknown; version: string }>()

export const triageService = {
  /**
   * API-018: GET /api/v1/cases
   * Lấy danh sách hồ sơ ca phản ánh từ Backend Candidate3 Docker
   */
  async fetchCasesFromBackend(params?: {
    projectId?: string
    status?: string
    pageSize?: number
    cursor?: string
  }, signal?: AbortSignal): Promise<TriageCase[]> {
    const session = getCaseSessionKey()
    assertCaseReadActive(session, signal)
    try {
      const actor = useAuthStore.getState().user
      if (!actor || ![RoleCode.SUPERVISOR, RoleCode.PROJECT_MANAGER].includes(actor.role)) {
        throw new Error('Không có quyền đọc danh sách Case.')
      }
      const projects: Array<{ id: string; name: string; code?: string }> = []
      let projectCursor: string | undefined
      const seenProjectCursors = new Set<string>()
      do {
        const response = await apiClient.get<{ items: Array<{ id?: string; projectId?: string; name: string; projectCode?: string }>; nextCursor?: string }>('/projects', {
          params: { cursor: projectCursor }, signal
        })
        assertCaseReadActive(session, signal)
        if (!Array.isArray(response.data?.items) || response.data.nextCursor != null && (typeof response.data.nextCursor !== 'string' || !response.data.nextCursor)) throw new Error('Danh sách dự án sai contract; không coi là rỗng.')
        for (const project of response.data.items) {
          const id = project.projectId || project.id
          if (id) projects.push({ id, name: project.name, code: project.projectCode })
        }
        projectCursor = response.data.nextCursor || undefined
        if (projectCursor && seenProjectCursors.has(projectCursor)) throw new Error('Cursor dự án bị lặp.')
        if (projectCursor) seenProjectCursors.add(projectCursor)
      } while (projectCursor)
      assertCaseReadActive(session, signal)
      const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]))
      const statusFilter = params?.status && params.status !== 'ALL' ? params.status : undefined
      const unassigned = params?.projectId === 'UNASSIGNED'
      if (unassigned && actor.role !== RoleCode.SUPERVISOR) throw new Error('PM không được đọc hộp thư chưa phân công.')
      const selected = params?.projectId && !['ALL','UNASSIGNED'].includes(params.projectId) ? params.projectId : undefined
      if (selected && !projects.some(p => p.id === selected)) throw new Error('Dự án không thuộc phạm vi server trả về.')
      // /projects is server-scoped. Do not infer PM membership from primary PM/name/email.
      const scopes = unassigned ? [{projectId: undefined as string | undefined, status: statusFilter}] : selected ? [{ projectId: selected, status: statusFilter }] : [
        ...(actor.role === RoleCode.SUPERVISOR ? [{projectId: undefined as string | undefined, status: statusFilter}] : []),
        ...projects.map(project => ({ projectId: project.id as string | undefined, status: statusFilter }))
      ]
      const items = new Map<string, InternalCaseDto>()
      const failures: Array<{ projectId?: string; status?: string; cause: any }> = []
      for (const { projectId, status } of scopes) {
        try {
        let cursor: string | undefined
        const cursors = new Set<string>()
        do {
          const response = await apiClient.get<CasePageDto>('/cases', {
            params: { projectId, status, pageSize: params?.pageSize || 100, cursor }, signal
          })
          assertCaseReadActive(session, signal)
          if (!Array.isArray(response.data?.items) || response.data.nextCursor != null && (typeof response.data.nextCursor !== 'string' || !response.data.nextCursor)) throw new Error('Danh sách Case sai contract; không coi là rỗng.')
          for (const item of response.data.items) {
            if (!item.id || !['UNASSIGNED','OPEN','AWAITING_EVIDENCE','CONCLUDED','LINKED'].includes(item.status || '') || !item.version) throw new Error('Case summary thiếu ID/status/version.')
            if ((item.projectId || undefined) !== projectId) throw new Error('Case trả về sai phạm vi dự án.')
            items.set(item.id, item)
          }
          cursor = response.data.nextCursor || undefined
          if (cursor && cursors.has(cursor)) throw new Error('Cursor Case bị lặp.')
          if (cursor) cursors.add(cursor)
        } while (cursor)
        } catch (cause) {
          assertCaseReadActive(session, signal)
          if (actor.role !== RoleCode.SUPERVISOR) throw cause
          failures.push({ projectId, status, cause })
        }
      }
      const mapped = Array.from(items.values(), item => ({ ...mapBackendCaseToDomain(item, projectMap), project_code: projects.find(project => project.id === item.projectId)?.code }))
      if (failures.length) {
        throw new CaseListReadError(mapped, failures)
      }
      return mapped
    } catch (error) {
      assertCaseReadActive(session, signal)
      throw error
    }
  },

  /**
   * Lấy danh sách hồ sơ tiếp nhận Triage (Hộp thư AI & Phản ánh người dân - PA03, W03/W04)
   * 100% dữ liệu từ Database Candidate3 BE - Tuân thủ kỷ luật CẤM mock data ngầm khi đã gắn API
   */
  async getCases(params?: TriageFilterParams, signal?: AbortSignal): Promise<TriageCase[]> {
    const request = ++caseCacheRequest
    const session = getCaseSessionKey()
    assertCaseReadActive(session, signal)
    // 1. Nạp từ Backend Candidate3 (CSDL thật)
    const backendCases = await this.fetchCasesFromBackend({
      projectId: params?.projectId,
      status: params?.status,
      pageSize: params?.pageSize,
      cursor: params?.cursor
    }, signal)

    assertCaseReadActive(session, signal)
    // A valid independent consumer still receives its own result. Only the most
    // recently started list may replace the shared cache (which has one scope).
    if (request === caseCacheRequest) {
      inMemoryTriageCases = backendCases
      saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
    }

    let list = [...backendCases]

    // 3. Áp dụng bộ lọc
    if (params?.source && params?.source !== 'ALL') {
      list = list.filter((c) => c.source === params.source)
    }

    if (params?.projectId && !['ALL','UNASSIGNED'].includes(params.projectId)) {
      const pId = params.projectId
      list = list.filter(
        (c) => c.project_id === pId
      )
    }

    if (params?.priority && params?.priority !== 'ALL') {
      list = list.filter((c) => c.severity === params.priority)
    }

    if (params?.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.defect_title.toLowerCase().includes(q) ||
          c.stationing.toLowerCase().includes(q) ||
          c.project_name.toLowerCase().includes(q) ||
          (c.reporter_name && c.reporter_name.toLowerCase().includes(q))
      )
    }

    return list
  },

  /**
   * API-019: GET /api/v1/cases/{caseId}
   * Lấy chi tiết một ca khiếm khuyết theo ID từ Backend Candidate3 (kèm ETag)
   */
  async getCaseById(id: string, signal?: AbortSignal): Promise<TriageCase | null> {
    const session = getCaseSessionKey()
    const cacheRequest = caseCacheRequest
    assertCaseReadActive(session, signal)
    try {
      console.log(`🚀 [CANDIDATE3 BE] Gọi GET /api/v1/cases/${id}...`)
      const res = await apiClient.get<InternalCaseDto>(`/cases/${id}`, { signal })
      const beItem = res.data
      if (beItem?.id !== id || !beItem.version || !['UNASSIGNED','OPEN','AWAITING_EVIDENCE','CONCLUDED','LINKED'].includes(beItem.status || '') || etagHeaderMismatch(res.headers?.etag, beItem.version)) throw new Error('Case trả sai ID/status/version/ETag.')
      if (useAuthStore.getState().user?.role === RoleCode.PROJECT_MANAGER && !beItem.projectId) throw new Error('PM không được đọc Case chưa phân công dự án.')
      const etagHeader = res.headers?.['etag'] as string | undefined

      const projectMap: Record<string, string> = {} // Do not borrow cached project labels from another session.

      const domainCase = mapBackendCaseToDomain(beItem, projectMap)
      if (etagHeader) {
        domainCase.etag = etagHeader
        domainCase.version = etagHeader.replace(/"/g, '')
      }

      assertCaseReadActive(session, signal)
      // Cập nhật lại vào inMemoryStore
      const idx = inMemoryTriageCases.findIndex((c) => c.id === id || c.code === id)
      if (idx !== -1 && cacheRequest === caseCacheRequest) {
        inMemoryTriageCases[idx] = { ...inMemoryTriageCases[idx], ...domainCase }
        saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
      }

      return domainCase
    } catch (err: any) {
      assertCaseReadActive(session, signal)
      throw err // Preserve Axios/ProblemDetails metadata; callers decide how to display it.
    }
  },

  /**
   * API-024: POST /api/v1/cases/{caseId}/triage
   * Duy nhất Giám sát (Supervisor) có quyền điều phối gán ca vào dự án và chọn phương thức xác minh
   * Header bắt buộc: Idempotency-Key, If-Match (Quoted ETag)
   */
  async triageCase(caseId: string, payload: CaseTriageInput): Promise<TriageCase> {
    const session = getCaseSessionKey(), actor = useAuthStore.getState().user
    if (actor?.role !== RoleCode.SUPERVISOR) throw new Error('Chỉ Supervisor được điều phối Case.')
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(caseId) || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(payload.projectId) || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(caseId) || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(payload.projectId)) throw new Error('Thiếu Case/project UUID hợp lệ; chưa điều phối.')
    if (!payload.version || !payload.reason?.trim() || payload.reason.trim().length > 1000 || !['FIELD','DRONE','EXISTING_EVIDENCE'].includes(payload.verificationMethod || '')) throw new Error('Thiếu version, lý do (tối đa 1.000 ký tự) hoặc phương thức hợp lệ; chưa điều phối.')
    const version = normalizeETag(payload.version)
    if (!/^"[A-Za-z0-9+/]{11}="$/.test(version)) throw new Error('If-Match phải là version Case 8 byte đã đọc.')
    if (!!payload.routeVersionId !== !!payload.segmentSetId || payload.routeVersionId && !payload.geometryVersion?.trim()) throw new Error('Geometry cần đủ routeVersionId/segmentSetId/geometryVersion; không tự tạo pin.')
    const body = {projectId:payload.projectId,verificationMethod:payload.verificationMethod,reason:payload.reason.trim(),...(payload.routeVersionId ? {routeVersionId:payload.routeVersionId,segmentSetId:payload.segmentSetId,geometryVersion:payload.geometryVersion} : {})}
    const fingerprint = JSON.stringify({body,version}), journalKey = triageJournal(caseId)
    const previous = this.pendingTriage(caseId)
    const command: PendingTriage = previous || {key:crypto.randomUUID(),body,version,fingerprint}
    if (command.fingerprint !== fingerprint) throw new Error('Lệnh điều phối trước chưa đối chiếu xong; không đổi key/body/version.')
    if (command.rejected || command.conflict) throw new Error('Lệnh đã bị từ chối; đọc lại và chủ động đối chiếu trước ý định mới.')
    const pendingKey = `${actor.id}:triage:${caseId}`
    if (pendingCaseCommands.has(pendingKey)) throw new Error('Đang gửi lệnh điều phối này.')
    pendingCaseCommands.set(pendingKey,command)
    try {
      assertCaseReadActive(session); sessionStorage.setItem(journalKey,JSON.stringify(command))
      if (!previous) {
        const current=await apiClient.get<InternalCaseDto>(`/cases/${caseId}`);assertCaseReadActive(session)
        const allowed=await readEligibleTriageProjects(undefined, command.body.projectId);assertCaseReadActive(session)
        if (!allowed.some(p=>p.id===command.body.projectId)) throw Object.assign(new Error('Dự án đích không còn đủ điều kiện điều phối (hoạt động, PM chính và tim tuyến).'),{triageGuard:true})
        if (current.data.id!==caseId || current.data.projectId || current.data.status!=='UNASSIGNED') throw Object.assign(new Error('Chỉ điều phối Case chưa phân công; hãy đọc lại hồ sơ.'),{triageGuard:true})
        if (normalizeETag(current.data.version || '')!==command.version || etagHeaderMismatch(current.headers?.etag,current.data.version!)) throw Object.assign(new Error('Phiên bản đã đổi; giữ form và đối chiếu trước ý định mới.'),{triageGuard:true})
      }
      if (previous && !command.receipt && !command.received) {
        const allowed = await readEligibleTriageProjects(undefined, command.body.projectId); assertCaseReadActive(session)
        if (!allowed.some(p => p.id === command.body.projectId)) throw new Error('Dự án không còn đủ điều kiện; giữ yêu cầu đang chờ để đối chiếu, chưa gửi lại.')
      }
      if (!command.receipt && !command.received) {
        const response = await apiClient.post<InternalCaseDto>(`/cases/${caseId}/triage`,command.body,{headers:{'Idempotency-Key':command.key,'If-Match':command.version},transformRequest:[(data:unknown)=>{assertCaseReadActive(session);return JSON.stringify(data)}]})
        assertCaseReadActive(session)
        command.receipt=response.data;command.received=true;sessionStorage.setItem(journalKey,JSON.stringify(command))
      }
      const receipt=command.receipt
      if (!receipt || receipt.id!==caseId || receipt.projectId!==command.body.projectId || receipt.verificationMethod!==command.body.verificationMethod || receipt.status!=='OPEN' || !receipt.version) throw new Error('Receipt triage sai ID/project/method/status; chỉ đối chiếu, không POST lại.')
      const fresh=await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
      assertCaseReadActive(session)
      if (fresh.data.id!==caseId || fresh.data.projectId!==receipt.projectId || fresh.data.verificationMethod!==receipt.verificationMethod || fresh.data.status==='UNASSIGNED' || !fresh.data.version || etagHeaderMismatch(fresh.headers?.etag,fresh.data.version)) throw new Error('GET chưa khớp triage receipt; chỉ đọc lại, không POST thêm.')
      sessionStorage.removeItem(journalKey)
      return mapBackendCaseToDomain(fresh.data,{})
    }catch(error:any){
      assertCaseReadActive(session)
      if (!command.receipt && !command.received && (error.triageGuard || error?.response?.status>=400 && error.response.status<500)){command.rejected=true;command.conflict=!!error.triageGuard || [409,412,428].includes(error.response.status);sessionStorage.setItem(journalKey,JSON.stringify(command))}
      throw error
    }finally{pendingCaseCommands.delete(pendingKey)}
  },
  pendingTriage(caseId:string): PendingTriage | null {
    const raw=sessionStorage.getItem(triageJournal(caseId))
    if (!raw)return null
    const command=JSON.parse(raw) as PendingTriage
    if (typeof command.key!=='string' || !command.key || typeof command.body?.projectId!=='string' || !['FIELD','DRONE','EXISTING_EVIDENCE'].includes(command.body.verificationMethod || '') || typeof command.body.reason!=='string' || !command.body.reason.trim() || command.body.reason.trim().length>1000 || typeof command.version!=='string' || !/^"[A-Za-z0-9+/]{11}="$/.test(command.version) || typeof command.fingerprint!=='string' || command.fingerprint!==JSON.stringify({body:command.body,version:command.version}))throw new Error('Journal triage sai contract; cần đối chiếu trước khi ghi.')
    return command
  },
  reviseTriage(caseId:string) {
    const actor=useAuthStore.getState().user,held=this.pendingTriage(caseId)
    if (!held?.rejected || held.receipt || held.received || pendingCaseCommands.has(`${actor?.id}:triage:${caseId}`))throw new Error('Chỉ lập ý định mới sau lỗi xác định và thao tác đối chiếu chủ động.')
    sessionStorage.removeItem(triageJournal(caseId))
  },
  async getTriageProjects(signal?:AbortSignal): Promise<CaseProjectOption[]> {
    const role=useAuthStore.getState().user?.role
    if(!role || ![RoleCode.SUPERVISOR,RoleCode.PROJECT_MANAGER].includes(role))throw new Error('Không có quyền đọc dự án điều phối.')
    const session=getCaseSessionKey(),rows:CaseProjectOption[]=[],seen=new Set<string>()
    let cursor:string|undefined
    do{
      const {data}=await apiClient.get('/projects',{params:{limit:100,cursor},signal});assertCaseReadActive(session,signal)
      if (!Array.isArray(data?.items) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor))throw new Error('Danh sách dự án sai contract.')
      for(const p of data.items){if(!p.projectId||!p.projectCode||!p.name)throw new Error('Dự án thiếu reference server.');rows.push({id:p.projectId,code:p.projectCode,name:p.name})}
      cursor=data.nextCursor||undefined;if(cursor&&seen.has(cursor))throw new Error('Cursor dự án lặp.');if(cursor)seen.add(cursor)
    }while(cursor)
    if(new Set(rows.map(p=>p.id)).size!==rows.length)throw new Error('Dự án bị trùng ID giữa các trang.')
    return rows
  },

  /**
   * API-020: POST /api/v1/cases/{caseId}/conclusions
   * Chỉ huy trưởng (PM) nhập kết luận thẩm định khiếm khuyết
   * Header bắt buộc: Idempotency-Key, If-Match (Quoted ETag)
   */
  async concludeCase(caseId: string, payload: CaseConclusionInput): Promise<TriageCase> {
    const actor = useAuthStore.getState().user
    const detail = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
    if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; chưa gửi lệnh.')
    const server = mapBackendCaseToDomain(detail.data, {})
    if (detail.data.status === 'CONCLUDED') {
      throw Object.assign(new Error(`Hồ sơ đã có kết luận server: ${detail.data.conclusion?.outcome || 'chưa có dữ liệu'}. Lệnh mới chưa được gửi; hãy đối chiếu lại.`), {
        code: 'invalid_state_transition', serverCase: server
      })
    }
    const evidenceIds = [...new Set(payload.evidenceIds || [])]
    if (payload.outcome !== 'NEEDS_EVIDENCE' && !evidenceIds.length) throw new Error('Thiếu reference bằng chứng được phép đọc cho Case này. Chưa có nguồn chọn bằng chứng trong giao diện; không gửi lệnh (contract gap).')
    const defectIds = [...new Set(payload.defectIds || detail.data.defectIds || [])]
    if (payload.outcome === 'CONFIRMED' && !defectIds.length) throw new Error('Chưa có Defect nguồn; không thể kết luận CONFIRMED (P2-07).')
    const body = { outcome: payload.outcome, reason: payload.reason, evidenceIds, defectIds: payload.outcome === 'CONFIRMED' ? defectIds : [] }
    const version = normalizeETag(payload.version || detail.headers?.etag || detail.data.version || undefined)
    const key = crypto.randomUUID()
    const pendingKey = `${actor?.id}:conclude:${caseId}`
    const journalKey = `rg_case_conclusion_${actor?.id}_${caseId}`
    if (sessionStorage.getItem(journalKey)) throw new Error('Lệnh kết luận trước chưa đối chiếu xong; không tạo key mới sau F5.')
    if (pendingCaseCommands.has(pendingKey)) throw new Error('Lệnh trước chưa rõ kết quả. Hãy tải lại/đối chiếu; không tạo lệnh mới.')
    pendingCaseCommands.set(pendingKey, { key, body, version })
    sessionStorage.setItem(journalKey, JSON.stringify({ key, body, version }))
    try {
      const response = await apiClient.post<InternalCaseDto>(`/cases/${caseId}/conclusions`, body, {
        headers: { 'Idempotency-Key': key, 'If-Match': version }
      })
      pendingCaseCommands.delete(pendingKey)
      if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ kết quả lệnh cũ.')
      const reread = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
      if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ kết luận cũ.')
      const confirmed = mapBackendCaseToDomain(reread.data, {})
      if (reread.data.conclusion?.outcome !== payload.outcome) {
        throw Object.assign(new Error('Kết quả server khác yêu cầu; hãy đối chiếu kết luận.'), { serverCase: confirmed })
      }
      sessionStorage.removeItem(journalKey)
      return confirmed
    } catch (error: any) {
      if (error.response && error.response.status < 500) { pendingCaseCommands.delete(pendingKey); sessionStorage.removeItem(journalKey) }
      if (error.serverCase) throw error
      const status = error.response?.status
      const code = error.response?.data?.code
      if (status === 409 || status === 412 || !error.response || status >= 500) {
        let current: TriageCase | undefined
        try {
          const fresh = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
          if (useAuthStore.getState().user === actor) current = mapBackendCaseToDomain(fresh.data, {})
        } catch { /* Keep original command identity and report reconciliation failure below. */ }
        const reason = status === 412 ? 'Phiên bản đã thay đổi. Đối chiếu kết quả server, giữ bản nháp và xác nhận lại trước lệnh mới.'
          : status === 409 ? `Xung đột ${code || 'không rõ mã'}: ${error.response?.data?.detail || 'hãy đối chiếu trạng thái/nguồn.'}`
          : 'Chưa rõ lệnh đã được ghi nhận hay chưa; đã giữ identity lệnh, không tự gửi lại.'
        throw Object.assign(new Error(reason + (current ? '' : ' Không tải được kết quả để đối chiếu.')), {
          cause: error, code, response: error.response, serverCase: current, commandKey: key
        })
      }
      throw error
    }
  },

  async publishCase(caseId: string, payload: CasePublicationInput): Promise<TriageCase> {
    const actor = useAuthStore.getState().user
    const detail = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
    if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; chưa gửi publication.')
    const reportIds = [...new Set(payload.reportIds || [])]
    if (!reportIds.length || reportIds.some(id => !detail.data.reportIds?.includes(id))) {
      throw new Error('Thiếu hoặc sai recipient report thuộc Case; chưa gửi publication.')
    }
    // Never expand selected evidence to all evidence in a Case. Server validates each recipient/source.
    const body = { summary: payload.summary, reportIds, evidenceIds: [...new Set(payload.evidenceIds || [])], defectIds: [...new Set(payload.defectIds || [])] }
    const version = normalizeETag(payload.version || detail.headers?.etag || detail.data.version || undefined)
    const pendingKey = `${actor?.id}:publish:${caseId}`
    if (pendingCaseCommands.has(pendingKey)) throw new Error('Publication trước chưa rõ kết quả; hãy đối chiếu trước khi gửi lệnh mới.')
    const key = crypto.randomUUID()
    pendingCaseCommands.set(pendingKey, { key, body, version })
    try {
      const response = await apiClient.post<{ version?: string }>(`/cases/${caseId}/publications`, body, {
        headers: { 'Idempotency-Key': key, 'If-Match': version }
      })
      pendingCaseCommands.delete(pendingKey)
      if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ kết quả publication cũ.')
      return { ...mapBackendCaseToDomain(detail.data, {}), is_published: true, public_notice: payload.summary || '', version: response.data.version || detail.data.version || undefined }
    } catch (error: any) {
      if (error.response && error.response.status < 500) pendingCaseCommands.delete(pendingKey)
      throw error
    }
  },

  /**
   * Cập nhật thông tin hồ sơ thẩm định cục bộ & đồng bộ storage
   */
  async updateCase(caseId: string, updates: Partial<TriageCase>): Promise<TriageCase> {
    throw new Error('Không dùng updateCase cục bộ thay triage/conclusion API; chưa ghi thay đổi.')
  },

  /**
   * Liên kết gộp báo trùng (PA04, BR-30, BR-31)
   */
  async linkDuplicateReports(
    masterId: string,
    secondaryIds: string[],
    auditNotes: string
  ): Promise<{ success: boolean; master: TriageCase }> {
    const session = getCaseSessionKey()
    const master = await apiClient.get<InternalCaseDto>(`/cases/${masterId}`)
    const sources = await Promise.all(secondaryIds.map(id => apiClient.get<InternalCaseDto>(`/cases/${id}`)))
    const reportIds = sources.flatMap(response => response.data.reportIds || [])
    if (!reportIds.length || sources.some(response => !response.data.version)) throw new Error('Thiếu report ID/version nguồn; chưa liên kết.')
    assertCaseReadActive(session)
    const pendingKey = `${useAuthStore.getState().user?.id}:link:${masterId}`
    if (pendingCaseCommands.has(pendingKey)) throw new Error('Lệnh trước chưa rõ kết quả; cần tải lại và đối chiếu trước lệnh mới.')
    const key = crypto.randomUUID()
    const body = { reportIds: [...new Set(reportIds)], sourceCaseVersions: Object.fromEntries(sources.map(source => [source.data.id, source.data.version])), reason: auditNotes }
    const version = normalizeETag(master.data.version || undefined)
    pendingCaseCommands.set(pendingKey, { key, body, version })
    try {
      const response = await apiClient.post<InternalCaseDto>(`/cases/${masterId}/report-links`, body, {
        headers: { 'Idempotency-Key': key, 'If-Match': version }
      })
      pendingCaseCommands.delete(pendingKey)
      assertCaseReadActive(session)
      return { success: true, master: mapBackendCaseToDomain(response.data, {}) }
    } catch (error: any) {
      if (error.response?.status < 500) pendingCaseCommands.delete(pendingKey)
      throw error
    }
  },

  /**
   * API-023: POST /api/v1/cases/{caseId}/report-splits
   * Chỉ huy trưởng (PM) tách báo cáo đã gộp ra khỏi ca chính (Candidate3 Backend)
   * Header bắt buộc: Idempotency-Key, If-Match (Quoted ETag)
   */
  async splitReport(caseId: string, reportId: string, reason = 'Tách báo cáo không trùng lặp'): Promise<void> {
    const session = getCaseSessionKey()
    const current = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
    if (!current.data.reportIds?.includes(reportId)) throw new Error('Report không thuộc Case hiện tại; chưa gửi lệnh tách.')
    if (current.data.reportIds.length < 2) throw new Error('Case phải có nhiều Report trước khi tách.')
    assertCaseReadActive(session)
    const pendingKey = `${useAuthStore.getState().user?.id}:split:${caseId}`
    if (pendingCaseCommands.has(pendingKey)) throw new Error('Lệnh trước chưa rõ kết quả; cần tải lại và đối chiếu trước lệnh mới.')
    const key = crypto.randomUUID()
    const body = { reportIds: [reportId], reason }
    const version = current.headers?.etag || normalizeETag(current.data.version || undefined)
    pendingCaseCommands.set(pendingKey, { key, body, version })
    try {
    await apiClient.post(`/cases/${caseId}/report-splits`, body, {
      headers: { 'Idempotency-Key': key, 'If-Match': version }
    })
    assertCaseReadActive(session)
    pendingCaseCommands.delete(pendingKey)
    } catch (error: any) {
      if (error.response?.status < 500) pendingCaseCommands.delete(pendingKey)
      throw error
    }
  },

  async unlinkReport(reportIdentifier: string, masterCaseId?: string): Promise<{ success: boolean }> {
    const reportId = reportIdentifier.replace(/^child-/, '')
    if (!masterCaseId || !/^[0-9a-f-]{36}$/i.test(reportId)) throw new Error('Thiếu Case ID hoặc report ID gốc để tách; không dùng mã hiển thị thay reference.')
    await this.splitReport(masterCaseId, reportId)
    return { success: true }
  },

  /**
   * Đặt lại và làm mới dữ liệu từ CSDL Backend Candidate3 (Không nạp mock data)
   */
  async resetCases(): Promise<TriageCase[]> {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRIAGE_CASES)
    } catch {}
    return this.getCases()
  }
}
