import { CanceledError, isCancel } from 'axios'
import { apiClient } from '../client'
import { TriageCase } from '../../types/domain'
import { saveToStorage, STORAGE_KEYS } from './storageHelper'
import { projectService } from './projectService'
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
  const projName = projId ? projectMap[projId] || `Dự án (${projId.slice(0, 8)})` : ''
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
    } else if (outcome === 'NEEDS_EVIDENCE') {
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
    source: 'CITIZEN',
    source_label: 'Phản ánh',
    source_detail: item.verificationMethod ? `Phương thức xác minh: ${item.verificationMethod}` : 'Chưa chọn phương thức xác minh',
    verification_method: item.verificationMethod || undefined,
    project_id: projId,
    project_code: undefined,
    project_name: projName || 'Chưa phân công dự án',
    stationing: 'Chưa có dữ liệu lý trình',
    lane: '',
    defect_title: 'Hồ sơ phản ánh',
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
    area_sqm: 0,
    ai_area_sqm: 0,
    max_depth_cm: 0,
    ai_depth_cm: 0,
    pm_notes: item.conclusion?.reason || '',

    conclusion,
    conclusion_reason: item.conclusion?.reason || undefined,
    report_ids: item.reportIds || [],
    linked_report_ids: item.reportIds && item.reportIds.length > 1 ? item.reportIds.slice(1) : [],
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
  return JSON.stringify([caseSessionEpoch, state.user?.id, state.user?.role, state.isAuthenticated])
}

function assertCaseReadActive(session: string, signal?: AbortSignal): void {
  if (signal?.aborted || session !== getCaseSessionKey()) {
    throw new CanceledError('Case read is no longer active')
  }
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
        for (const project of response.data.items || []) {
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
      const selected = params?.projectId && params.projectId !== 'ALL' ? params.projectId : undefined
      if (selected && !projects.some(p => p.id === selected)) throw new Error('Dự án không thuộc phạm vi server trả về.')
      // /projects is server-scoped. Do not infer PM membership from primary PM/name/email.
      const scopes = selected ? [{ projectId: selected, status: statusFilter }] : [
        ...(actor.role === RoleCode.SUPERVISOR ? (statusFilter ? [statusFilter] : ['UNASSIGNED', 'OPEN', 'AWAITING_EVIDENCE', 'CONCLUDED', 'LINKED']).map(status => ({ projectId: undefined as string | undefined, status })) : []),
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
          for (const item of response.data.items || []) {
            if (actor.role === RoleCode.PROJECT_MANAGER && item.projectId !== projectId) throw new Error('Case trả về sai phạm vi dự án.')
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

    if (params?.projectId && params?.projectId !== 'ALL') {
      const pId = params.projectId
      list = list.filter(
        (c) => c.project_id === pId || (c.project_name && c.project_name.includes(pId))
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
      const etagHeader = res.headers?.['etag'] as string | undefined

      const projectMap: Record<string, string> = {}
      try {
        projectService.getProjects().forEach((p) => {
          projectMap[p.id] = p.name
        })
      } catch {}

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
    if (!/^[0-9a-f-]{36}$/i.test(caseId) || !/^[0-9a-f-]{36}$/i.test(payload.projectId)) throw new Error('Thiếu Case/project UUID hợp lệ; chưa điều phối.')
    const current = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
    const response = await apiClient.post<InternalCaseDto>(`/cases/${caseId}/triage`, {
      projectId: payload.projectId, verificationMethod: payload.verificationMethod || 'FIELD',
      reason: payload.reason || 'Giám sát điều phối phạm vi xác minh',
      routeVersionId: payload.routeVersionId, segmentSetId: payload.segmentSetId, geometryVersion: payload.geometryVersion
    }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': normalizeETag(payload.version || current.data.version || undefined) } })
    return mapBackendCaseToDomain(response.data, {})
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
    if (pendingCaseCommands.has(pendingKey)) throw new Error('Lệnh trước chưa rõ kết quả. Hãy tải lại/đối chiếu; không tạo lệnh mới.')
    pendingCaseCommands.set(pendingKey, { key, body, version })
    try {
      const response = await apiClient.post<InternalCaseDto>(`/cases/${caseId}/conclusions`, body, {
        headers: { 'Idempotency-Key': key, 'If-Match': version }
      })
      pendingCaseCommands.delete(pendingKey)
      if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ kết quả lệnh cũ.')
      const confirmed = mapBackendCaseToDomain(response.data, {})
      if (response.data.conclusion?.outcome !== payload.outcome) {
        throw Object.assign(new Error('Kết quả server khác yêu cầu; hãy đối chiếu kết luận.'), { serverCase: confirmed })
      }
      return confirmed
    } catch (error: any) {
      if (error.response && error.response.status < 500) pendingCaseCommands.delete(pendingKey)
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
    await new Promise((resolve) => setTimeout(resolve, 80))
    const index = inMemoryTriageCases.findIndex((c) => c.id === caseId || c.code === caseId)
    if (index === -1) {
      throw new Error(`Không tìm thấy hồ sơ Triage với ID ${caseId}`)
    }
    inMemoryTriageCases[index] = {
      ...inMemoryTriageCases[index],
      ...updates
    }
    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
    return JSON.parse(JSON.stringify(inMemoryTriageCases[index]))
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
    assertCaseReadActive(session)
    const pendingKey = `${useAuthStore.getState().user?.id}:split:${caseId}`
    if (pendingCaseCommands.has(pendingKey)) throw new Error('Lệnh trước chưa rõ kết quả; cần tải lại và đối chiếu trước lệnh mới.')
    const key = crypto.randomUUID()
    const body = { reportIds: [reportId], reason }
    const version = normalizeETag(current.data.version || undefined)
    pendingCaseCommands.set(pendingKey, { key, body, version })
    try {
    await apiClient.post(`/cases/${caseId}/report-splits`, body, {
      headers: { 'Idempotency-Key': key, 'If-Match': version }
    })
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
