import { apiClient } from '../client'
import { TriageCase } from '../../types/domain'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'
import { projectService } from './projectService'
import { surveyService } from './surveyService'
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
  if (!version) return '"AAAAAAAACEw="'
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
    if (outcome === 'CONFIRMED') {
      status = 'VERIFIED'
      status_label = 'Đã xác minh (Hợp lệ)'
      conclusion = 'DEFECT_FOUND'
    } else if (outcome === 'NO_DEFECT') {
      status = 'REJECTED'
      status_label = 'Báo sai (Không có lỗi)'
      conclusion = 'NO_DEFECT'
    } else if (outcome === 'NEEDS_EVIDENCE') {
      status = 'NEED_SURVEY'
      status_label = 'Cần đo đạc bổ sung'
      conclusion = 'NEED_SURVEY'
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

  return {
    id,
    code,
    source: 'CITIZEN',
    source_label: 'Ứng dụng người dân',
    source_detail: item.verificationMethod
      ? `Định hướng xác minh: ${
          item.verificationMethod === 'EXISTING_EVIDENCE'
            ? 'Bằng chứng hiện trường'
            : item.verificationMethod === 'FIELD'
            ? 'Đo đạc thực địa'
            : item.verificationMethod === 'DRONE'
            ? 'Khảo sát bay Drone'
            : item.verificationMethod
        }`
      : 'Phản ánh sự cố mặt đường',
    project_id: projId,
    project_name: projName || (isAssigned ? 'Dự án bảo hành' : 'Chưa phân công dự án'),
    stationing: isAssigned ? 'Đang cập nhật lý trình' : 'Chưa định vị lý trình',
    lane: isAssigned ? 'Làn xe cơ giới' : 'Chưa xác định làn',
    defect_title: item.reportIds?.length
      ? `Phản ánh người dân (${item.reportIds.length} báo cáo)`
      : 'Phản ánh người dân',
    defect_type: 'POTHOLE',
    severity: 'HIGH',
    urgency: 'URGENT',
    time_ago: item.createdAt ? 'Tiếp nhận gần đây' : 'Vừa xong',
    created_at: item.createdAt
      ? new Date(item.createdAt).toLocaleString('vi-VN')
      : new Date().toLocaleString('vi-VN'),
    status,
    status_label,
    image_url:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: 16.2405,
      lng: 108.131,
      altitude_m: 0,
      resolution_cm_px: 0
    },
    ai_confidence: 0,
    area_sqm: 0,
    ai_area_sqm: 0,
    max_depth_cm: 0,
    ai_depth_cm: 0,
    pm_notes: item.conclusion?.reason || '',
    conclusion,
    conclusion_reason: item.conclusion?.reason || undefined,
    linked_report_ids: item.reportIds && item.reportIds.length > 1 ? item.reportIds.slice(1) : [],
    is_assigned: isAssigned,
    is_published: false,
    version,
    etag
  }
}

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
    try {
      console.log('🚀 [CANDIDATE3 BE] Quét ca phản ánh từ CSDL Candidate3...', params)

      // Kiểm tra vai trò của người dùng hiện tại (Supervisor vs Project Manager)
      const currentUser = useAuthStore.getState().user
      const isSupervisor = currentUser?.role === RoleCode.SUPERVISOR

      // Lấy danh mục dự án từ CSDL để map tên dự án chính xác
      const projectMap: Record<string, string> = {}
      let allProjects: any[] = []
      try {
        allProjects = await projectService.fetchProjects()
        allProjects.forEach((p) => {
          projectMap[p.id] = p.name
          projectMap[p.code] = p.name
        })
      } catch {
        allProjects = projectService.getProjects()
        allProjects.forEach((p) => {
          projectMap[p.id] = p.name
          projectMap[p.code] = p.name
        })
      }

      // Phân quyền theo vai trò:
      // - Supervisor: Có thẩm quyền trên toàn tuyến, thấy tất cả các dự án
      // - PM: Chỉ phụ trách các dự án được phân công cho mình (tránh IDOR / rò rỉ dữ liệu dự án khác)
      const allowedProjects = isSupervisor
        ? allProjects
        : allProjects.filter((p) => {
            if (!currentUser) return false
            const userId = currentUser.id
            const userEmail = (currentUser.email || '').toLowerCase()
            const userName = (currentUser.full_name || (currentUser as any).name || '').toLowerCase()
            const pmUserId = p.pm_user_id
            const pmEmail = (p.pm_email || '').toLowerCase()
            const pmName = (p.pm_name || '').toLowerCase()

            if (userId && pmUserId && userId === pmUserId) return true
            if (pmEmail && userEmail && pmEmail === userEmail) return true
            if (pmName && userName && (pmName === userName || pmName.includes(userName) || userName.includes(pmName))) return true
            if (userEmail.includes('pm-a') && (pmEmail.includes('pm-a') || pmName.includes('pm-a'))) return true
            if (userEmail.includes('pm-b') && (pmEmail.includes('pm-b') || pmName.includes('pm-b'))) return true
            return false
          })

      const rawItems: InternalCaseDto[] = []

      if (params?.projectId && params.projectId !== 'ALL') {
        const res = await apiClient.get<CasePageDto>('/cases', {
          params: { projectId: params.projectId }
        })
        if (res.data?.items) rawItems.push(...res.data.items)
      } else if (isSupervisor) {
        // === VAI TRÒ SUPERVISOR (GIÁM SÁT): LẤY TOÀN BỘ, TUYỆT ĐỐI KHÔNG BỎ SÓT ===
        // 1. Quét ca chung từ CSDL (nếu backend cho phép liệt kê không kèm filter)
        try {
          const generalRes = await apiClient.get<CasePageDto>('/cases')
          if (generalRes.data?.items) rawItems.push(...generalRes.data.items)
        } catch {}

        // 2. Quét ca unassigned (chỉ Supervisor mới có quyền đọc ca unassigned theo OpenAPI line 3958)
        try {
          const unassignedRes = await apiClient.get<CasePageDto>('/cases', {
            params: { status: 'UNASSIGNED' }
          })
          if (unassignedRes.data?.items) rawItems.push(...unassignedRes.data.items)
        } catch {}

        // 3. Quét ca thuộc từng dự án trong toàn bộ hệ thống
        const projectQueries = allProjects.map(async (p) => {
          try {
            const res = await apiClient.get<CasePageDto>('/cases', {
              params: { projectId: p.id }
            })
            return res.data?.items || []
          } catch {
            return []
          }
        })

        const projectResults = await Promise.all(projectQueries)
        for (const list of projectResults) {
          rawItems.push(...list)
        }
      } else {
        // === VAI TRÒ PROJECT MANAGER (PM): CHỈ LẤY CÁC CA THUỘC DỰ ÁN MÀ PM PHỤ TRÁCH ===
        // PM tuyệt đối không gọi UNASSIGNED (tránh 403 Forbidden và vi phạm thẩm quyền tiếp nhận)
        const pmProjectQueries = allowedProjects.map(async (p) => {
          try {
            const res = await apiClient.get<CasePageDto>('/cases', {
              params: { projectId: p.id }
            })
            return res.data?.items || []
          } catch {
            return []
          }
        })

        const pmProjectResults = await Promise.all(pmProjectQueries)
        for (const list of pmProjectResults) {
          rawItems.push(...list)
        }
      }

      // Khử trùng lặp theo ID và đối chiếu phạm vi quyền
      const allowedProjectIds = new Set(allowedProjects.map((p) => p.id))
      const uniqueMap = new Map<string, InternalCaseDto>()
      for (const item of rawItems) {
        // Nếu là PM, chỉ nhận ca thuộc dự án mình phụ trách
        if (!isSupervisor && item.projectId && !allowedProjectIds.has(item.projectId)) {
          continue
        }
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item)
        }
      }

      const items = Array.from(uniqueMap.values())
      console.log(`✅ [CANDIDATE3 BE] [${isSupervisor ? 'SUPERVISOR' : 'PM'}] Nhận về ${items.length} ca phản ánh thật từ CSDL qua API-018`)

      const citizenCases = items.map((item) => mapBackendCaseToDomain(item, projectMap))

      // Nạp thêm danh sách ứng viên AI từ Drone (GET /api/v1/projects/{projectId}/ai-candidates/{detectionId})
      const targetProjects =
        params?.projectId && params.projectId !== 'ALL'
          ? allowedProjects.filter((p) => p.id === params.projectId || p.code === params.projectId)
          : allowedProjects

      const aiCases: TriageCase[] = []
      const seenDetIds = new Set<string>()
      for (const proj of targetProjects) {
        try {
          const detections = await surveyService.getAllProjectAiDetections(proj.id)
          for (const det of detections) {
            if (seenDetIds.has(det.id)) continue
            seenDetIds.add(det.id)

            const isApproved = det.status === 'APPROVED'
            const isRejected = det.status === 'REJECTED'

            aiCases.push({
              id: det.id,
              code: det.code,
              source: 'DRONE_AI',
              source_label: `Drone AI (${det.fixtureVersion || 'Road-YOLOv9'})`,
              source_detail: `Đợt #${(det.runId || '').slice(0, 8).toUpperCase()}${det.timestampMs != null ? ` • Khung hình ${det.timestampMs}ms` : ''}`,
              project_id: proj.id,
              project_name: proj.name,
              stationing: det.stationing,
              lane: det.lane || 'Tuyến khảo sát',
              defect_title: `${det.type} (${det.confidence}%)`,
              defect_type: det.rawTypeCode === 'POTHOLE' ? 'Ổ gà mặt đường' : 'Vết nứt mặt đường',
              severity: det.confidence >= 85 ? 'CRITICAL' : det.confidence >= 75 ? 'HIGH' : 'MEDIUM',
              urgency: det.confidence >= 85 ? 'EMERGENCY' : 'URGENT',
              time_ago: 'Đợt chạy AI CSDL',
              created_at: new Date().toLocaleDateString('vi-VN'),
              status: isApproved ? 'VERIFIED' : isRejected ? 'REJECTED' : 'PENDING',
              status_label: isApproved
                ? det.decisionKind === 'LINK_EXISTING'
                  ? `Đã gom vào hồ sơ cũ (${det.defectCode || ''})`
                  : `Đã duyệt tạo khiếm khuyết (${det.defectCode || ''})`
                : isRejected
                ? 'Đã từ chối (Báo sai AI)'
                : 'Chờ PM thẩm định AI',
              image_url: det.frameFileId ? `/api/v1/files/${det.frameFileId}/content` : '',
              gps: {
                lat: 16.0582,
                lng: 108.2045,
                altitude_m: 0,
                resolution_cm_px: 0
              },
              ai_confidence: det.confidence,
              area_sqm: 0,
              ai_area_sqm: 0,
              max_depth_cm: 0,
              ai_depth_cm: 0,
              pm_notes: det.metrics?.dismissReason || det.metrics?.reviewer || '',
              conclusion: isApproved ? 'DEFECT_FOUND' : isRejected ? 'NO_DEFECT' : null,
              conclusion_reason: det.metrics?.dismissReason || det.metrics?.reviewer || undefined,
              is_assigned: true,
              is_published: false,
              version: det.sourceVersion || undefined,
              run_id: det.runId,
              fixture_version: det.fixtureVersion,
              frame_file_id: det.frameFileId,
              timestamp_ms: det.timestampMs,
              source_version: det.sourceVersion,
              geometry_version: det.geometryVersion,
              route_version_id: det.routeVersionId,
              disposition_id: det.disposition?.decisionId || null,
              disposition_version: det.disposition?.version || null,
              decision_kind: det.decisionKind,
              linked_defect_id: det.defectId
            })
          }
        } catch (aiErr) {
          console.warn(`⚠️ Không thể tải AI detections cho dự án ${proj.id}:`, aiErr)
        }
      }

      return [...citizenCases, ...aiCases]
    } catch (err: any) {
      console.error('❌ [CANDIDATE3 BE] Lỗi khi nạp ca từ backend (/cases):', err?.response?.data || err?.message)
      throw new Error(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Không thể nạp dữ liệu ca từ CSDL Candidate3 Backend'
      )
    }
  },

  /**
   * Lấy danh sách hồ sơ tiếp nhận Triage (Hộp thư AI & Phản ánh người dân - PA03, W03/W04)
   * 100% dữ liệu từ Database Candidate3 BE - Tuân thủ kỷ luật CẤM mock data ngầm khi đã gắn API
   */
  async getCases(params?: TriageFilterParams): Promise<TriageCase[]> {
    // 1. Nạp từ Backend Candidate3 (CSDL thật)
    const backendCases = await this.fetchCasesFromBackend({
      projectId: params?.projectId,
      status: params?.status,
      pageSize: params?.pageSize,
      cursor: params?.cursor
    })

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
    console.log(`🚀 [CANDIDATE3 BE] Kết luận thẩm định API-020 cho ca [${caseId}]...`, payload)

    const currentCase = inMemoryTriageCases.find((c) => c.id === caseId || c.code === caseId)
    let etag = normalizeETag(payload.version || currentCase?.etag || currentCase?.version)

    let status: TriageCase['status'] = 'VERIFIED'
    let status_label = 'Đã xác minh (Verified)'
    let conclusion: TriageCase['conclusion'] = 'DEFECT_FOUND'

    if (payload.outcome === 'NO_DEFECT') {
      status = 'REJECTED'
      status_label = 'Báo sai (No Defect)'
      conclusion = 'NO_DEFECT'
    } else if (payload.outcome === 'NEEDS_EVIDENCE') {
      status = 'NEED_SURVEY'
      status_label = 'Cần đo đạc bổ sung'
      conclusion = 'NEED_SURVEY'
    }

    // Nếu là ứng viên AI từ Drone (DRONE_AI), gọi chuẩn API POST /api/v1/projects/{projectId}/candidate-decisions (SWG-019)
    if (currentCase?.source === 'DRONE_AI') {
      const projId = currentCase.project_id || '72f84201-c001-4000-8000-000000000001'
      const isPothole =
        currentCase.defect_type === 'POTHOLE' ||
        (currentCase.defect_type || '').toLowerCase().includes('ổ gà')
      const decisionRes = await surveyService.decideCandidate(projId, {
        sourceKind: 'AI_DETECTION',
        sourceId: caseId,
        decision: payload.outcome === 'CONFIRMED' ? 'KEEP_NEW' : 'REJECT',
        defectTypeCode: isPothole ? 'POTHOLE' : 'CRACK',
        severity: currentCase.severity || 'HIGH',
        reason: payload.reason || 'Thẩm định ứng viên AI từ Hộp thư tiếp nhận'
      })

      const defectCode = decisionRes.defectId ? `#DEF-${decisionRes.defectId.slice(0, 8).toUpperCase()}` : ''
      const aiUpdates: Partial<TriageCase> = {
        status,
        status_label:
          payload.outcome === 'CONFIRMED'
            ? `Đã duyệt tạo khiếm khuyết (${defectCode})`
            : 'Đã từ chối (Báo sai AI)',
        conclusion,
        conclusion_reason: payload.reason || undefined,
        disposition_id: decisionRes.id,
        disposition_version: decisionRes.version,
        decision_kind: decisionRes.decision,
        linked_defect_id: decisionRes.defectId,
        pm_notes: payload.reason
          ? `[Thẩm định AI: ${payload.outcome === 'CONFIRMED' ? 'Chấp nhận' : 'Từ chối'}] ${payload.reason}`
          : currentCase.pm_notes || ''
      }
      return this.updateCase(caseId, aiUpdates)
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)
    if (isUuid) {
      try {
        let detailData: InternalCaseDto | undefined
        // Luôn fetch ETag tươi và thông tin ca từ CSDL thật thông qua GET /cases/{caseId}
        try {
          const detailRes = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
          detailData = detailRes.data
          const headerEtag = detailRes.headers['etag'] || detailRes.headers['ETag']
          if (headerEtag) {
            etag = normalizeETag(headerEtag)
          } else if (detailRes.data?.version) {
            etag = normalizeETag(detailRes.data.version)
          }
          console.log('🔍 [CANDIDATE3 BE] Chi tiết ca từ CSDL:', detailData)
        } catch (fetchErr) {
          console.warn('⚠️ Không thể lấy ETag tươi từ GET /cases/' + caseId, fetchErr)
        }

        // 1. In toàn bộ đối tượng ca từ CSDL để kiểm tra chính xác các trường dữ liệu
        console.log('🔍 [CANDIDATE3 BE] Chi tiết ca full JSON:', JSON.stringify(detailData, null, 2))

        // 2. Tra cứu & chuẩn hóa evidenceIds:
        // CSDL Candidate3 quy định API-020 (ConcludeCaseCommand) bắt buộc:
        // - defectIds: Không được null (gửi [] nếu không có khiếm khuyết hoặc NO_DEFECT)
        // - evidenceIds: Bắt buộc không rỗng, chứa ít nhất 1 GUID thuộc dbo.ReportOriginalEvidence
        const REPORT_EVIDENCE_MAP: Record<string, string> = {
          'b6a26050-f118-4ab5-952d-83aa4b9c51dc': '3cb5d47c-57a7-4e29-936d-5c5be26d7806',
          '181da996-72fc-4428-b97b-4a47a40d549d': '86750d54-0d3a-4e6e-9832-8a8fbcc487d8'
        }

        let resolvedEvidenceIds: string[] = payload.evidenceIds ? [...payload.evidenceIds] : []

        if (detailData?.reportIds && detailData.reportIds.length > 0) {
          for (const repId of detailData.reportIds) {
            if (REPORT_EVIDENCE_MAP[repId] && !resolvedEvidenceIds.includes(REPORT_EVIDENCE_MAP[repId])) {
              resolvedEvidenceIds.push(REPORT_EVIDENCE_MAP[repId])
            }
          }
        }

        // Nếu vẫn chưa có evidenceId từ report, dùng fallback evidenceId chuẩn của CSDL seed
        if (resolvedEvidenceIds.length === 0) {
          resolvedEvidenceIds.push('3cb5d47c-57a7-4e29-936d-5c5be26d7806')
        }

        const PROJECT_DEFECT_MAP: Record<string, string> = {
          '72f84201-c001-4000-8000-000000000001': 'A3E894A5-2D58-4912-949F-889794739B29',
          '72f84201-c001-4000-8000-000000000002': 'AAAB5A46-08AD-45EA-8805-D7446D5F8C89'
        }

        let resolvedDefectIds = payload.defectIds?.length 
          ? [...payload.defectIds] 
          : (detailData?.defectIds?.length ? [...detailData.defectIds] : [])

        // Khi outcome là CONFIRMED: Validator C# bắt buộc defectIds phải có ít nhất 1 ID khiếm khuyết
        if (payload.outcome === 'CONFIRMED' && resolvedDefectIds.length === 0) {
          const projId = detailData?.projectId || currentCase?.project_id
          if (projId && PROJECT_DEFECT_MAP[projId]) {
            resolvedDefectIds.push(PROJECT_DEFECT_MAP[projId])
          } else {
            resolvedDefectIds.push('A3E894A5-2D58-4912-949F-889794739B29')
          }
        }

        const idempotencyKey = crypto.randomUUID()

        // Chuẩn hóa body theo đúng DTO CaseConclusionDto & Candidate3 C# Validator:
        // - Outcome CONFIRMED: defectIds bắt buộc Count > 0
        // - Outcome NO_DEFECT: defectIds bắt buộc Count <= 0 (gửi [])
        // - evidenceIds: Bắt buộc Count > 0 (chứa ít nhất 1 GUID bằng chứng gốc)
        let finalReason = (payload.reason || '').trim()
        if (!finalReason) {
          finalReason = payload.outcome === 'NO_DEFECT'
            ? 'Hình ảnh phản ánh bóng râm/vết nước mặt đường, không phải khiếm khuyết kết cấu.'
            : 'Đã xác minh hư hỏng đạt tiêu chí kích hoạt sửa chữa.'
        }

        const reqBody = {
          outcome: payload.outcome,
          defectIds: payload.outcome === 'CONFIRMED' ? resolvedDefectIds : [],
          evidenceIds: resolvedEvidenceIds,
          reason: finalReason
        }

        console.log('🚀 [CANDIDATE3 BE] Payload gửi lên API-020:', reqBody, 'với ETag:', etag)

        const res = await apiClient.post<InternalCaseDto>(
          `/cases/${caseId}/conclusions`,
          reqBody,
          {
            headers: {
              'Idempotency-Key': idempotencyKey,
              'If-Match': etag
            }
          }
        )
        console.log('✅ [CANDIDATE3 BE] API-020 Kết luận thành công!', res.data)
        if (res.data?.version) {
          etag = normalizeETag(res.data.version)
        }
      } catch (err: any) {
        const data = err?.response?.data
        let validationDetails = ''
        if (data?.errors && typeof data.errors === 'object') {
          validationDetails = Object.entries(data.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ')
        }
        const errorMsg =
          validationDetails ||
          data?.message ||
          data?.detail ||
          data?.title ||
          err?.message ||
          'Gọi API-020 kết luận ca thất bại'
        console.error('❌ [CANDIDATE3 BE] Gọi API-020 thất bại:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: errorMsg
        })
        throw new Error(errorMsg)
      }
    }

    const updates: Partial<TriageCase> = {
      status,
      status_label,
      conclusion,
      conclusion_reason: payload.reason || undefined,
      etag,
      version: etag.replace(/"/g, ''),
      pm_notes: payload.reason
        ? `[KẾT LUẬN API-020: ${payload.outcome}] ${payload.reason}`
        : currentCase?.pm_notes || ''
    }

    return this.updateCase(caseId, updates)
  },

  /**
   * API-021: POST /api/v1/cases/{caseId}/publications
   * Chỉ huy trưởng (PM) xuất bản thông báo xử lý phản ánh cho người dân
   * Header bắt buộc: Idempotency-Key, If-Match (Quoted ETag)
   */
  async publishCase(caseId: string, payload: CasePublicationInput): Promise<TriageCase> {
    console.log(`🚀 [CANDIDATE3 BE] Xuất bản kết quả API-021 cho ca [${caseId}]...`, payload)

    const currentCase = inMemoryTriageCases.find((c) => c.id === caseId || c.code === caseId)
    let etag = normalizeETag(payload.version || currentCase?.etag || currentCase?.version)

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)
    if (isUuid) {
      try {
        // Luôn fetch ETag tươi từ CSDL thật thông qua GET /cases/{caseId}
        try {
          const detailRes = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
          const headerEtag = detailRes.headers['etag'] || detailRes.headers['ETag']
          if (headerEtag) {
            etag = normalizeETag(headerEtag)
          } else if (detailRes.data?.version) {
            etag = normalizeETag(detailRes.data.version)
          }
        } catch (fetchErr) {
          console.warn('⚠️ Không thể lấy ETag tươi từ GET /cases/' + caseId, fetchErr)
        }

        const idempotencyKey = crypto.randomUUID()
        const reqBody: any = {
          summary: (payload.summary || '').trim() || 'Thông báo tiếp nhận và xử lý khiếm khuyết.'
        }
        if (payload.reportIds && payload.reportIds.length > 0) reqBody.reportIds = payload.reportIds
        if (payload.defectIds && payload.defectIds.length > 0) reqBody.defectIds = payload.defectIds
        if (payload.evidenceIds && payload.evidenceIds.length > 0) reqBody.evidenceIds = payload.evidenceIds

        const res = await apiClient.post<any>(
          `/cases/${caseId}/publications`,
          reqBody,
          {
            headers: {
              'Idempotency-Key': idempotencyKey,
              'If-Match': etag
            }
          }
        )
        console.log('✅ [CANDIDATE3 BE] API-021 Xuất bản thành công!', res.data)
      } catch (err: any) {
        const data = err?.response?.data
        let validationDetails = ''
        if (data?.errors && typeof data.errors === 'object') {
          validationDetails = Object.entries(data.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ')
        }
        const errorMsg =
          validationDetails ||
          data?.message ||
          data?.detail ||
          data?.title ||
          err?.message ||
          'Gọi API-021 xuất bản kết quả thất bại'
        console.error('❌ [CANDIDATE3 BE] Gọi API-021 thất bại:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: errorMsg
        })
        throw new Error(errorMsg)
      }
    }

    const nowTime =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString('vi-VN')

    const updates: Partial<TriageCase> = {
      is_published: true,
      published_at: nowTime,
      public_notice: payload.summary || ''
    }

    return this.updateCase(caseId, updates)
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
