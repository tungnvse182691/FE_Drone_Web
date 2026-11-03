import { apiClient } from '../client'
import { TriageCase } from '../../types/domain'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'
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
let inMemoryTriageCases: TriageCase[] = getFromStorage(STORAGE_KEYS.TRIAGE_CASES, [])

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
  let status_label = isAssigned ? 'Chờ PM thẩm định' : 'Chưa phân công'
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
    project_name: projName || 'Chưa phân công dự án',
    stationing: 'Chưa có dữ liệu lý trình',
    lane: '',
    defect_title: 'Hồ sơ phản ánh',
    defect_type: '',
    severity: 'UNKNOWN',
    urgency: 'UNKNOWN',
    time_ago: item.createdAt ? 'Ngày tiếp nhận từ hệ thống' : 'Chưa có ngày tiếp nhận',
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

let caseListRequest = 0
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
  }): Promise<TriageCase[]> {
    const actor = useAuthStore.getState().user
    if (!actor || ![RoleCode.SUPERVISOR, RoleCode.PROJECT_MANAGER].includes(actor.role)) {
      throw new Error('Không có quyền đọc danh sách Case.')
    }
    const projects: Array<{ id: string; name: string }> = []
    let projectCursor: string | undefined
    const seenProjectCursors = new Set<string>()
    do {
      const response = await apiClient.get<{ items: Array<{ id?: string; projectId?: string; name: string }>; nextCursor?: string }>('/projects', {
        params: { cursor: projectCursor }
      })
      for (const project of response.data.items || []) {
        const id = project.projectId || project.id
        if (id) projects.push({ id, name: project.name })
      }
      projectCursor = response.data.nextCursor || undefined
      if (projectCursor && seenProjectCursors.has(projectCursor)) throw new Error('Cursor dự án bị lặp.')
      if (projectCursor) seenProjectCursors.add(projectCursor)
    } while (projectCursor)
    if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ kết quả cũ.')
    const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]))
    const selected = params?.projectId && params.projectId !== 'ALL' ? params.projectId : undefined
    if (selected && !projects.some(p => p.id === selected)) throw new Error('Dự án không thuộc phạm vi server trả về.')
    // /projects is server-scoped. Do not infer PM membership from primary PM/name/email.
    const scopes: Array<string | undefined> = selected ? [selected] : [
      ...(actor.role === RoleCode.SUPERVISOR ? [undefined] : []), ...projects.map(p => p.id)
    ]
    const items = new Map<string, InternalCaseDto>()
    for (const projectId of scopes) {
      let cursor: string | undefined
      const cursors = new Set<string>()
      do {
        const response = await apiClient.get<CasePageDto>('/cases', {
          params: { projectId, status: params?.status, pageSize: params?.pageSize || 100, cursor }
        })
        if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ kết quả cũ.')
        for (const item of response.data.items || []) {
          if (actor.role === RoleCode.PROJECT_MANAGER && item.projectId !== projectId) throw new Error('Case trả về sai phạm vi dự án.')
          items.set(item.id, item)
        }
        cursor = response.data.nextCursor || undefined
        if (cursor && cursors.has(cursor)) throw new Error('Cursor Case bị lặp.')
        if (cursor) cursors.add(cursor)
      } while (cursor)
    }
    return Array.from(items.values(), item => mapBackendCaseToDomain(item, projectMap))
  },

  /**
   * Lấy danh sách hồ sơ tiếp nhận Triage (Hộp thư AI & Phản ánh người dân - PA03, W03/W04)
   * 100% dữ liệu từ Database Candidate3 BE - Tuân thủ kỷ luật CẤM mock data ngầm khi đã gắn API
   */
  async getCases(params?: TriageFilterParams): Promise<TriageCase[]> {
    const request = ++caseListRequest
    const actor = useAuthStore.getState().user
    // 1. Nạp từ Backend Candidate3 (CSDL thật)
    const backendCases = await this.fetchCasesFromBackend({
      projectId: params?.projectId,
      status: params?.status,
      pageSize: params?.pageSize,
      cursor: params?.cursor
    })

    if (request !== caseListRequest || useAuthStore.getState().user !== actor) throw new Error('Bỏ kết quả Case của scope/phiên cũ.')
    // Đồng bộ lại inMemoryTriageCases bằng 100% dữ liệu thật từ Backend (không trộn lẫn mock data)
    inMemoryTriageCases = backendCases
    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)

    let list = [...inMemoryTriageCases]

    // 3. Áp dụng bộ lọc
    if (params?.source && params?.source !== 'ALL') {
      list = list.filter((c) => c.source === params.source)
    }

    if (params?.status && params?.status !== 'ALL') {
      list = list.filter((c) => c.status === params.status)
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
  async getCaseById(id: string): Promise<TriageCase | null> {
    const actor = useAuthStore.getState().user
    const scopeRequest = caseListRequest
    try {
      console.log(`🚀 [CANDIDATE3 BE] Gọi GET /api/v1/cases/${id}...`)
      const res = await apiClient.get<InternalCaseDto>(`/cases/${id}`)
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

      if (useAuthStore.getState().user !== actor || scopeRequest !== caseListRequest) throw new Error('Bỏ chi tiết Case của scope/phiên cũ.')
      // Cập nhật lại vào inMemoryStore
      const idx = inMemoryTriageCases.findIndex((c) => c.id === id || c.code === id)
      if (idx !== -1) {
        inMemoryTriageCases[idx] = { ...inMemoryTriageCases[idx], ...domainCase }
        saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
      }

      return domainCase
    } catch (err: any) {
      console.error(`❌ [CANDIDATE3 BE] Lỗi tải ca ${id}:`, err?.response?.data || err?.message)
      throw new Error(err?.response?.data?.message || err?.message || `Không thể tải chi tiết ca ${id} từ CSDL`)
    }
  },

  /**
   * API-024: POST /api/v1/cases/{caseId}/triage
   * Duy nhất Giám sát (Supervisor) có quyền điều phối gán ca vào dự án và chọn phương thức xác minh
   * Header bắt buộc: Idempotency-Key, If-Match (Quoted ETag)
   */
  async triageCase(caseId: string, payload: CaseTriageInput): Promise<TriageCase> {
    console.log(`🚀 [CANDIDATE3 BE] Điều phối dự án API-024 cho ca [${caseId}]...`, payload)

    // Xác định ETag hiện tại
    let currentCase = inMemoryTriageCases.find((c) => c.id === caseId || c.code === caseId)
    let etag = normalizeETag(payload.version || currentCase?.etag || currentCase?.version)

    // Tìm tên dự án từ projectService
    let projectName = 'Dự án đã chỉ định'
    let targetProjectUuid = payload.projectId
    try {
      const projects = projectService.getProjects()
      const found = projects.find(
        (p) => p.id === payload.projectId || p.code === payload.projectId
      )
      if (found) {
        projectName = found.name
        targetProjectUuid = found.id
      }
    } catch {}

    const methodLabels: Record<string, string> = {
      FIELD: 'Khảo sát đo đạc hiện trường (FIELD)',
      DRONE: 'Bay quét Drone bổ sung (DRONE)',
      EXISTING_EVIDENCE: 'Thẩm định bằng chứng hiện có (EXISTING_EVIDENCE)'
    }

    const verificationMethod = payload.verificationMethod || 'FIELD'
    const noteContent = `[ĐIỀU PHỐI DỰ ÁN API-024] Giám sát đã gán vào dự án: ${projectName}. Định hướng xác minh: ${methodLabels[verificationMethod] || verificationMethod}${payload.reason ? `. Chỉ đạo: "${payload.reason}"` : ''}`

    // 1. Thử gửi lệnh tới Backend Candidate3 nếu caseId là UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)
    if (isUuid) {
      try {
        const idempotencyKey = crypto.randomUUID()
        const res = await apiClient.post<InternalCaseDto>(
          `/cases/${caseId}/triage`,
          {
            projectId: targetProjectUuid,
            verificationMethod,
            reason: payload.reason || 'Giám sát điều phối dự án và định hướng xác minh'
          },
          {
            headers: {
              'Idempotency-Key': idempotencyKey,
              'If-Match': etag
            }
          }
        )

        console.log('✅ [CANDIDATE3 BE] API-024 Điều phối thành công!', res.data)
        if (res.data?.version) {
          etag = normalizeETag(res.data.version)
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          'Gọi API-024 điều phối ca thất bại'
        console.error('❌ [CANDIDATE3 BE] Gọi API-024 thất bại:', err?.response?.data || err?.message)
        throw new Error(errorMsg)
      }
    }

    // 2. Cập nhật state in-memory và localStorage
    const updates: Partial<TriageCase> = {
      project_id: targetProjectUuid,
      project_name: projectName,
      is_assigned: true,
      status: 'PENDING',
      status_label: 'Chờ PM thẩm định',
      etag,
      version: etag.replace(/"/g, ''),
      pm_notes: currentCase?.pm_notes
        ? `${currentCase.pm_notes}\n${noteContent}`
        : noteContent
    }

    const index = inMemoryTriageCases.findIndex((c) => c.id === caseId || c.code === caseId)
    if (index !== -1) {
      inMemoryTriageCases[index] = {
        ...inMemoryTriageCases[index],
        ...updates
      }
      saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
      return JSON.parse(JSON.stringify(inMemoryTriageCases[index]))
    }

    if (currentCase) {
      const updated = { ...currentCase, ...updates }
      inMemoryTriageCases.unshift(updated)
      saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
      return updated
    }

    throw new Error(`Không tìm thấy hồ sơ ca với mã ${caseId}`)
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
    await new Promise((resolve) => setTimeout(resolve, 150))
    const masterIndex = inMemoryTriageCases.findIndex(
      (c) => c.id === masterId || c.code === masterId
    )
    if (masterIndex === -1) {
      throw new Error('Hồ sơ chính không tồn tại')
    }

    const master = inMemoryTriageCases[masterIndex]
    const secondaryCodes: string[] = []

    inMemoryTriageCases = inMemoryTriageCases.map((c) => {
      if (secondaryIds.includes(c.id) || secondaryIds.includes(c.code)) {
        secondaryCodes.push(c.code)
        return {
          ...c,
          status: 'MERGED',
          status_label: 'Đã gộp trùng',
          master_case_id: master.id,
          pm_notes: `[GỘP TRÙNG PA04] Đã liên kết vào hồ sơ gốc ${master.code}. Ghi chú: ${auditNotes}`
        }
      }
      return c
    })

    const updatedLinkedCodes = Array.from(
      new Set([...(master.linked_report_ids || []), ...secondaryCodes])
    )
    inMemoryTriageCases[masterIndex] = {
      ...master,
      linked_report_ids: updatedLinkedCodes,
      pm_notes: `${master.pm_notes ? master.pm_notes + '\n' : ''}[LIÊN KẾT BÁO TRÙNG PA04] Đã gộp hồ sơ từ: ${secondaryCodes.join(', ')}. Ghi chú: ${auditNotes}`
    }

    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)

    return {
      success: true,
      master: JSON.parse(JSON.stringify(inMemoryTriageCases[masterIndex]))
    }
  },

  /**
   * API-023: POST /api/v1/cases/{caseId}/report-splits
   * Chỉ huy trưởng (PM) tách báo cáo đã gộp ra khỏi ca chính (Candidate3 Backend)
   * Header bắt buộc: Idempotency-Key, If-Match (Quoted ETag)
   */
  async splitReport(caseId: string, reportId: string, reason: string = 'Tách hồ sơ do không trùng lặp'): Promise<void> {
    console.log(`🚀 [CANDIDATE3 BE] Gọi API-023 tách báo cáo [${reportId}] khỏi ca [${caseId}]...`)
    const currentCase = inMemoryTriageCases.find((c) => c.id === caseId || c.code === caseId)
    const etag = normalizeETag(currentCase?.etag || currentCase?.version)
    const idempotencyKey = crypto.randomUUID()

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)
    if (isUuid) {
      try {
        await apiClient.post(
          `/cases/${caseId}/report-splits`,
          {
            reportIds: [reportId],
            reason
          },
          {
            headers: {
              'Idempotency-Key': idempotencyKey,
              'If-Match': etag
            }
          }
        )
        console.log(`✅ [CANDIDATE3 BE] API-023 Tách báo cáo thành công!`)
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          'Gọi API-023 tách báo cáo thất bại'
        console.error('❌ [CANDIDATE3 BE] Lỗi API-023:', err?.response?.data || err?.message)
        throw new Error(errorMsg)
      }
    }
  },

  /**
   * Tách hồ sơ con khỏi hồ sơ Master khi phát hiện gộp nhầm (Unlink - BR-30)
   */
  async unlinkReport(secondaryIdentifier: string, masterCaseId?: string): Promise<{ success: boolean }> {
    if (masterCaseId) {
      await this.splitReport(masterCaseId, secondaryIdentifier)
    }

    inMemoryTriageCases = inMemoryTriageCases.map((c) => {
      if (c.id === secondaryIdentifier || c.code === secondaryIdentifier) {
        return {
          ...c,
          status: 'PENDING',
          status_label: 'Chờ thẩm định',
          master_case_id: undefined,
          pm_notes: `[TÁCH HỒ SƠ BR-30] Đã tách khỏi hồ sơ gộp nhầm trước đó.`
        }
      }
      return c
    })

    if (masterCaseId) {
      const masterIdx = inMemoryTriageCases.findIndex((c) => c.id === masterCaseId)
      if (masterIdx !== -1) {
        const master = inMemoryTriageCases[masterIdx]
        inMemoryTriageCases[masterIdx] = {
          ...master,
          linked_report_ids: (master.linked_report_ids || []).filter(
            (code) => code !== secondaryIdentifier
          )
        }
      }
    }

    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)

    return {
      success: true
    }
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
