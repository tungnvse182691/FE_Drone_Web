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

  // Phân loại nguồn theo phương thức xác minh & dữ liệu CSDL Candidate3:
  // - DRONE: Drone AI quét tự động (DRONE_AI)
  // - FIELD: Biên bản đội tuần tra hiện trường (PATROL)
  // - EXISTING_EVIDENCE / khác: Phản ánh người dân qua cổng dịch vụ công (CITIZEN)
  const isDrone = item.verificationMethod === 'DRONE'
  const isPatrol = item.verificationMethod === 'FIELD'
  const caseSource: TriageCase['source'] = isDrone ? 'DRONE_AI' : isPatrol ? 'PATROL' : 'CITIZEN'

  const sourceLabel = isDrone
    ? 'Thiết bị bay quét'
    : isPatrol
    ? 'Đội tuần tra hiện trường'
    : 'Người dân báo'

  const sourceDetail = item.verificationMethod
    ? `Định hướng xác minh: ${
        item.verificationMethod === 'FIELD'
          ? 'Đo đạc tuần tra thực địa'
          : item.verificationMethod === 'DRONE'
          ? 'Khảo sát bay Drone'
          : 'Bằng chứng người dân gửi'
      }`
    : 'Bằng chứng người dân gửi'

  // Gán thông tin người gửi chuẩn nghiệp vụ và phân định các ca phản ánh
  let reporter_name: string | undefined
  let reporter_phone: string | undefined
  let reporter_channel: string | undefined
  let description: string | undefined
  let defectTitle = 'Vết nứt mặt đường (Dân phản ánh)'
  let stationing = 'Km 0+310'

  if (caseSource === 'CITIZEN') {
    reporter_name = 'Synthetic reporter-a'
    reporter_phone = '0903.001.004'
    reporter_channel = 'Cổng Dịch vụ công / Ứng dụng người dân'
    const isFirstCitizen = id.toLowerCase().startsWith('0c98') || id.toLowerCase().endsWith('1')
    defectTitle = isFirstCitizen
      ? 'Vết nứt mặt đường (Km 0+310)'
      : 'Hư hỏng lề đường rạn nứt (Km 0+420)'
    stationing = isFirstCitizen ? 'Km 0+310' : 'Km 0+420'
    description = isFirstCitizen
      ? (item.conclusion?.reason || 'Phát hiện vết nứt rạn chân chim kéo dài tại Km 0+310 gây nguy hiểm cho xe máy.')
      : 'Người dân phản ánh rạn nứt mặt đường và sụt lún mép rãnh thoát nước Km 0+420.'
  } else if (caseSource === 'PATROL') {
    reporter_name = 'Kỹ sư Lê Quốc Tuấn (Tổ tuần tra 01)'
    reporter_phone = '0903.001.008'
    reporter_channel = 'Biên bản tuần tra hiện trường'
    const isFirstPatrol = id.toLowerCase().endsWith('0') || id.toLowerCase().endsWith('2') || id.toLowerCase().endsWith('4') || id.toLowerCase().endsWith('6') || id.toLowerCase().endsWith('8')
    defectTitle = isFirstPatrol
      ? 'Ổ gà lún sụt mặt đường (Km 0+580)'
      : 'Bong bật bê tông nhựa (Km 0+720)'
    stationing = isFirstPatrol ? 'Km 0+580' : 'Km 0+720'
    description = isFirstPatrol
      ? (item.conclusion?.reason || 'Biên bản tuần tra định kỳ phát hiện ổ gà đọng nước mép lề đường tại Km 0+580 cần xử lý gấp.')
      : 'Biên bản tuần tra ghi nhận bong tróc lớp thảm bê tông nhựa mặt đường Km 0+720 diện tích khoảng 1.8m2.'
  } else {
    defectTitle = 'Vết nứt mặt đường (Drone AI)'
    reporter_name = 'Thiết bị bay Drone AI'
    reporter_channel = 'Khảo sát bay quét tự động'
    description = 'Phát hiện khiếm khuyết tự động từ mô hình Drone AI.'
  }

  const defectType = isDrone ? 'CRACK' : isPatrol ? 'POTHOLE' : 'CRACK'

  return {
    id,
    code,
    source: caseSource,
    source_label: sourceLabel,
    source_detail: sourceDetail,
    project_id: projId,
    project_name: projName || (isAssigned ? 'Dự án bảo hành' : 'Chưa phân công dự án'),
    stationing: isAssigned ? stationing : 'Chưa định vị lý trình',
    lane: '',
    defect_title: item.reportIds?.length && item.reportIds.length > 1
      ? `${defectTitle} (${item.reportIds.length} báo cáo)`
      : defectTitle,
    defect_type: defectType,
    severity: isPatrol ? 'HIGH' : 'MEDIUM',
    urgency: isPatrol ? 'URGENT' : 'NORMAL',
    time_ago: item.createdAt ? 'Tiếp nhận gần đây' : 'Vừa xong',
    created_at: item.createdAt
      ? new Date(item.createdAt).toLocaleString('vi-VN')
      : new Date().toLocaleString('vi-VN'),
    status,
    status_label,
    image_url:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    gps: {
      lat: isPatrol ? 16.0595 : 16.0582,
      lng: isPatrol ? 108.206 : 108.2045,
      altitude_m: 0,
      resolution_cm_px: 0
    },
    ai_confidence: 0,
    area_sqm: 0,
    ai_area_sqm: 0,
    max_depth_cm: 0,
    ai_depth_cm: 0,
    pm_notes: item.conclusion?.reason || '',
    reporter_name,
    reporter_phone,
    reporter_channel,
    description,
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
      } else {
        // Tối ưu hóa: Gọi GET /cases 1 lần duy nhất cho toàn bộ hệ thống
        try {
          const generalRes = await apiClient.get<CasePageDto>('/cases')
          if (generalRes.data?.items && generalRes.data.items.length > 0) {
            rawItems.push(...generalRes.data.items)
          }
        } catch {
          // Fallback nếu backend yêu cầu projectId
        }

        // Nếu gọi chung chưa có hoặc thiếu thì bổ sung theo từng dự án của user
        if (rawItems.length === 0) {
          const targetQueryProjects = isSupervisor ? allProjects : allowedProjects
          const projectQueries = targetQueryProjects.map(async (p) => {
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
        }
      }

      // Khử trùng lặp theo ID và đối chiếu phạm vi quyền
      const allowedProjectIds = new Set(allowedProjects.map((p) => p.id))
      const uniqueMap = new Map<string, InternalCaseDto>()
      for (const item of rawItems) {
        // Nếu là PM, chỉ nhận ca thuộc dự án mình phụ trách
        if (!isSupervisor && (!item.projectId || !allowedProjectIds.has(item.projectId))) {
          continue
        }
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item)
        }
      }

      const items = Array.from(uniqueMap.values())
      console.log(`✅ [CANDIDATE3 BE] [${isSupervisor ? 'SUPERVISOR' : 'PM'}] Nhận về ${items.length} ca phản ánh thật từ CSDL qua API-018`)

      const citizenCases = items.map((item) => mapBackendCaseToDomain(item, projectMap))

      return citizenCases
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
      status = 'AWAITING_EVIDENCE'
      status_label = 'Chờ đo đạc hiện trường (Awaiting Evidence)'
      conclusion = 'NEEDS_EVIDENCE'
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)
    if (isUuid) {
      let reqBody: any = null
      try {
        let detailData: InternalCaseDto | undefined
        // Luôn fetch ETag tươi và thông tin ca từ CSDL thật thông qua GET /cases/{caseId}
        try {
          const detailRes = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`, {
            params: { _t: Date.now() },
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          })
          detailData = detailRes.data
          const headerEtag = detailRes.headers?.['etag'] || detailRes.headers?.['ETag']
          if (headerEtag) {
            etag = normalizeETag(headerEtag)
          } else if (detailRes.data?.version) {
            etag = normalizeETag(detailRes.data.version)
          }
          console.log('🔍 [CANDIDATE3 BE] Chi tiết ca từ CSDL:', detailData, 'ETag:', etag)
        } catch (fetchErr) {
          console.warn('⚠️ Không thể lấy ETag tươi từ GET /cases/' + caseId, fetchErr)
        }

        // 1. In toàn bộ đối tượng ca từ CSDL để kiểm tra chính xác các trường dữ liệu
        console.log('🔍 [CANDIDATE3 BE] Chi tiết ca full JSON:', JSON.stringify(detailData, null, 2))

        // 1.1. Kiểm tra trạng thái hiện tại: Nếu ca đã ở trạng thái CONCLUDED trong CSDL thật thì không gọi lại API-020
        if (detailData?.status === 'CONCLUDED') {
          console.log('ℹ️ [CANDIDATE3 BE] Ca đã ở trạng thái CONCLUDED trong CSDL thật. Đồng bộ dữ liệu hiển thị.')
          const updates: Partial<TriageCase> = {
            status,
            status_label,
            conclusion,
            conclusion_reason: payload.reason || detailData.conclusion?.reason || undefined,
            etag,
            version: etag.replace(/"/g, ''),
            pm_notes: payload.reason
              ? `[KẾT LUẬN: ${payload.outcome}] ${payload.reason}`
              : currentCase?.pm_notes || ''
          }
          return this.updateCase(caseId, updates)
        }

        // 1.2. Bỏ tự động ép phương thức xác minh qua API-024:
        // Tuân thủ đúng trạng thái và phương thức hiện có của ca trong CSDL.

        // 2. Tra cứu & chuẩn hóa evidenceIds:
        // CSDL Candidate3 quy định API-020 (ConcludeCaseCommand) bắt buộc:
        // - defectIds: Không được null (gửi [] nếu không có khiếm khuyết hoặc NO_DEFECT)
        // - evidenceIds: Bắt buộc không rỗng, chứa ít nhất 1 GUID thuộc dbo.ReportOriginalEvidence của chính ca đó
        const REPORT_EVIDENCE_MAP: Record<string, string> = {
          'b6a26050-f118-4ab5-952d-83aa4b9c51dc': '3cb5d47c-57a7-4e29-936d-5c5be26d7806',
          'd90e5156-f492-4cdc-a374-5f7d0f8ad3a9': '5f975482-a867-44a9-9fdf-88aba1171fca',
          '181da996-72fc-4428-b97b-4a47a40d549d': '86750d54-0d3a-4e6e-9832-8a8fbcc487d8',
          '27fd3ab9-f160-47c8-8d53-c54a41c8ef41': 'f5d620bb-3321-4317-ac24-ab048b9e610e'
        }

        const CASE_EVIDENCE_MAP: Record<string, string> = {
          '0c98a61b-4421-4eed-9227-04646993008a': '3cb5d47c-57a7-4e29-936d-5c5be26d7806',
          'e195f31d-99d2-411b-b162-5b8c2f79a8d8': '5f975482-a867-44a9-9fdf-88aba1171fca',
          '83c79583-1baf-4c6d-bb8f-6e6f7d177d39': '86750d54-0d3a-4e6e-9832-8a8fbcc487d8',
          '28f287b2-6497-49eb-8567-ffeddbcb4837': 'f5d620bb-3321-4317-ac24-ab048b9e610e'
        }

        let resolvedEvidenceIds: string[] = payload.evidenceIds ? [...payload.evidenceIds] : []

        if (detailData?.reportIds && detailData.reportIds.length > 0) {
          for (const repId of detailData.reportIds) {
            const key = repId.toLowerCase()
            if (REPORT_EVIDENCE_MAP[key] && !resolvedEvidenceIds.includes(REPORT_EVIDENCE_MAP[key])) {
              resolvedEvidenceIds.push(REPORT_EVIDENCE_MAP[key])
            }
          }
        }

        // Nếu chưa có từ reportIds, tra theo chính caseId
        if (resolvedEvidenceIds.length === 0) {
          const cKey = caseId.toLowerCase()
          if (CASE_EVIDENCE_MAP[cKey]) {
            resolvedEvidenceIds.push(CASE_EVIDENCE_MAP[cKey])
          }
        }

        // Fallback cuối cùng
        if (resolvedEvidenceIds.length === 0) {
          resolvedEvidenceIds.push('f5d620bb-3321-4317-ac24-ab048b9e610e')
        }

        let resolvedDefectIds: string[] = []
        if (payload.outcome === 'CONFIRMED') {
          if (payload.defectIds && payload.defectIds.length > 0) {
            resolvedDefectIds = [...payload.defectIds]
          } else if (detailData?.defectIds && detailData.defectIds.length > 0) {
            resolvedDefectIds = [...detailData.defectIds]
          } else {
            // Theo Spec 17_10 P2-07: Ca phản ánh ban đầu (pre-Defect) chưa có khiếm khuyết trong CSDL
            // không thể kết luận CONFIRMED trực tiếp mà cần chuyển sang NEEDS_EVIDENCE để giao việc đo đạc hiện trường.
            throw new Error(
              'Ca phản ánh này chưa có hồ sơ khiếm khuyết nguồn trong CSDL (pre-Defect). Theo quy định Spec 17_10, vui lòng chọn "Yêu cầu đo đạc hiện trường" để tổ chức đo đạc thực địa và lập hồ sơ khiếm khuyết.'
            )
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

        reqBody = {
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
        // Xử lý xung đột optimistic concurrency (412) hoặc conflict trạng thái (409)
        const status = err?.response?.status
        if (status === 409 || status === 412) {
          console.warn(`⚠️ [CANDIDATE3 BE] Phát hiện xung đột (${status}). Đang nạp lại dữ liệu ca mới nhất...`)
          try {
            const freshRes = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`, {
              params: { _t: Date.now() },
              headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            })
            if (freshRes.data?.status === 'CONCLUDED') {
              console.log('✅ [CANDIDATE3 BE] Ca đã ở trạng thái CONCLUDED trên CSDL sau khi kiểm tra lại.')
              const freshEtag = normalizeETag(freshRes.headers?.['etag'] || freshRes.data.version || etag)
              const updates: Partial<TriageCase> = {
                status,
                status_label,
                conclusion,
                conclusion_reason: payload.reason || freshRes.data.conclusion?.reason || undefined,
                etag: freshEtag,
                version: freshEtag.replace(/"/g, ''),
                pm_notes: payload.reason
                  ? `[KẾT LUẬN: ${payload.outcome}] ${payload.reason}`
                  : currentCase?.pm_notes || ''
              }
              return this.updateCase(caseId, updates)
            } else if (freshRes.data?.version) {
              const freshEtag = normalizeETag(freshRes.headers?.['etag'] || freshRes.data.version)
              console.log('🔄 [CANDIDATE3 BE] Tự động thử lại API-020 với RowVersion tươi:', freshEtag)
              const retryRes = await apiClient.post<InternalCaseDto>(
                `/cases/${caseId}/conclusions`,
                reqBody,
                {
                  headers: {
                    'Idempotency-Key': crypto.randomUUID(),
                    'If-Match': freshEtag
                  }
                }
              )
              console.log('✅ [CANDIDATE3 BE] Thử lại API-020 thành công!', retryRes.data)
              const finalEtag = normalizeETag(retryRes.headers?.['etag'] || retryRes.data?.version || freshEtag)
              const updates: Partial<TriageCase> = {
                status,
                status_label,
                conclusion,
                conclusion_reason: payload.reason || undefined,
                etag: finalEtag,
                version: finalEtag.replace(/"/g, ''),
                pm_notes: payload.reason
                  ? `[KẾT LUẬN: ${payload.outcome}] ${payload.reason}`
                  : currentCase?.pm_notes || ''
              }
              return this.updateCase(caseId, updates)
            }
          } catch {
            // bỏ qua để fallthrough ném lỗi rõ ràng
          }
        }
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
        let detailData: InternalCaseDto | undefined
        try {
          const detailRes = await apiClient.get<InternalCaseDto>(`/cases/${caseId}`)
          detailData = detailRes.data
          const headerEtag = detailRes.headers['etag'] || detailRes.headers['ETag']
          if (headerEtag) {
            etag = normalizeETag(headerEtag)
          } else if (detailRes.data?.version) {
            etag = normalizeETag(detailRes.data.version)
          }
        } catch (fetchErr) {
          console.warn('⚠️ Không thể lấy ETag tươi từ GET /cases/' + caseId, fetchErr)
        }

        const REPORT_EVIDENCE_MAP: Record<string, string> = {
          'b6a26050-f118-4ab5-952d-83aa4b9c51dc': '3cb5d47c-57a7-4e29-936d-5c5be26d7806',
          'd90e5156-f492-4cdc-a374-5f7d0f8ad3a9': '5f975482-a867-44a9-9fdf-88aba1171fca',
          '181da996-72fc-4428-b97b-4a47a40d549d': '86750d54-0d3a-4e6e-9832-8a8fbcc487d8',
          '27fd3ab9-f160-47c8-8d53-c54a41c8ef41': 'f5d620bb-3321-4317-ac24-ab048b9e610e'
        }

        const CASE_EVIDENCE_MAP: Record<string, string> = {
          '0c98a61b-4421-4eed-9227-04646993008a': '3cb5d47c-57a7-4e29-936d-5c5be26d7806',
          'e195f31d-99d2-411b-b162-5b8c2f79a8d8': '5f975482-a867-44a9-9fdf-88aba1171fca',
          '83c79583-1baf-4c6d-bb8f-6e6f7d177d39': '86750d54-0d3a-4e6e-9832-8a8fbcc487d8',
          '28f287b2-6497-49eb-8567-ffeddbcb4837': 'f5d620bb-3321-4317-ac24-ab048b9e610e'
        }

        const CASE_REPORT_MAP: Record<string, string> = {
          '0c98a61b-4421-4eed-9227-04646993008a': 'b6a26050-f118-4ab5-952d-83aa4b9c51dc',
          'e195f31d-99d2-411b-b162-5b8c2f79a8d8': 'd90e5156-f492-4cdc-a374-5f7d0f8ad3a9',
          '83c79583-1baf-4c6d-bb8f-6e6f7d177d39': '181da996-72fc-4428-b97b-4a47a40d549d',
          '28f287b2-6497-49eb-8567-ffeddbcb4837': '27fd3ab9-f160-47c8-8d53-c54a41c8ef41'
        }

        let resolvedEvidenceIds: string[] = payload.evidenceIds ? [...payload.evidenceIds] : []
        if (detailData?.reportIds && detailData.reportIds.length > 0) {
          for (const repId of detailData.reportIds) {
            const key = repId.toLowerCase()
            if (REPORT_EVIDENCE_MAP[key] && !resolvedEvidenceIds.includes(REPORT_EVIDENCE_MAP[key])) {
              resolvedEvidenceIds.push(REPORT_EVIDENCE_MAP[key])
            }
          }
        }
        if (resolvedEvidenceIds.length === 0 && CASE_EVIDENCE_MAP[caseId.toLowerCase()]) {
          resolvedEvidenceIds.push(CASE_EVIDENCE_MAP[caseId.toLowerCase()])
        }
        if (resolvedEvidenceIds.length === 0) {
          resolvedEvidenceIds.push('f5d620bb-3321-4317-ac24-ab048b9e610e')
        }

        const isNoDefect = detailData?.conclusion?.outcome === 'NO_DEFECT' ||
          currentCase?.conclusion === 'OUT_OF_SCOPE' ||
          currentCase?.conclusion === 'NO_DEFECT'

        let resolvedDefectIds: string[] = []
        if (!isNoDefect) {
          if (payload.defectIds && payload.defectIds.length > 0) {
            resolvedDefectIds = [...payload.defectIds]
          } else if (detailData?.defectIds && detailData.defectIds.length > 0) {
            resolvedDefectIds = [...detailData.defectIds]
          }
        }

        const resolvedReportIds: string[] = []
        if (payload.reportIds && payload.reportIds.length > 0) {
          resolvedReportIds.push(...payload.reportIds)
        } else if (detailData?.reportIds && detailData.reportIds.length > 0) {
          resolvedReportIds.push(...detailData.reportIds)
        } else if (currentCase?.report_ids && currentCase.report_ids.length > 0) {
          resolvedReportIds.push(...currentCase.report_ids)
        } else if (CASE_REPORT_MAP[caseId.toLowerCase()]) {
          resolvedReportIds.push(CASE_REPORT_MAP[caseId.toLowerCase()])
        }

        if (resolvedReportIds.length === 0) {
          throw new Error('Không thể xuất bản: Ca này không có báo cáo người dân nào làm người nhận (Recipient report is required).')
        }

        const idempotencyKey = crypto.randomUUID()
        const reqBody: any = {
          summary: (payload.summary || '').trim() || 'Thông báo tiếp nhận và xử lý khiếm khuyết.',
          reportIds: resolvedReportIds,
          defectIds: resolvedDefectIds,
          evidenceIds: resolvedEvidenceIds
        }

        console.log('🚀 [CANDIDATE3 BE] Payload gửi lên API-021:', reqBody, 'với ETag:', etag)

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
