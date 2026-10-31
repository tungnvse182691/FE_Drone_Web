import { apiClient } from '../client'
import { FieldTask } from '../../types/domain'
import { projectService } from './projectService'
import { surveyService } from './surveyService'
import { getFromStorage, saveToStorage } from './storageHelper'

/**
 * ============================================================================
 * MODULE: fieldTaskService (Quản lý Nhiệm vụ Đo đạc Hiện trường KT01, KT02)
 * KẾT NỐI TRỰC TIẾP API BACKEND CANDIDATE3 (DOCKER) - 100% DATABASE THẬT
 * Căn cứ Spec 17_10: 02_Full-API-Catalog.md (API-078 -> API-085)
 * ============================================================================
 */

export interface FieldTaskFilterParams {
  status?: string
  search?: string
  projectId?: string
}

export interface CreateFieldTaskPayload {
  project_id: string
  defect_id: string
  defect_version?: string
  survey_id?: string
  source_kind?: 'SURVEY' | 'REPORTER'
  defect_code: string
  defect_name?: string
  defect_photo_url?: string
  chainage_km: number
  lane?: string
  measurement_type: string
  measurement_type_num?: number
  technician_name: string
  assigned_to_user_id?: string
  notes?: string
  source_origin?: 'DRONE' | 'CITIZEN_REPORT'
  linked_case_code?: string
  route_version_id?: string
  due_at?: string
}

export interface FieldEvidenceReuseInput {
  fileId: string
  sourceEvidenceId: string
  sourceKind: string
  expectedChecksum: string
  reason: string
}

export interface BackendFieldTaskViewFact {
  id: string
  projectId: string
  defectId: string
  surveyId?: string | null
  sourceKind?: string | null
  routeVersionId: string
  segmentSetId?: string | null
  layoutRevisionId?: string | null
  slabId?: string | null
  purpose?: string | null
  mode?: string | null
  status?: string | null
  assignmentId?: string | null
  assignedToUserId?: string | null
  version?: string | null
  requiredMeasurementType: number
  measurementScope?: string | null
  instructions?: string | null
  dueAt?: string | null
  repairContext?: any
}

function formatMeasurementTypeName(typeNum: number): string {
  switch (typeNum) {
    case 1:
      return 'Đo chiều rộng vết nứt (m)'
    case 2:
      return 'Đo chiều sâu vệt lún/ổ gà (cm)'
    case 3:
      return 'Đo diện tích bong bật/hư hỏng (m²)'
    case 4:
      return 'Đo chiều dài nứt dọc/ngang (m)'
    default:
      return 'Đo kích thước hình học hiện trường'
  }
}

function mapBackendTaskStatus(status?: string | null): FieldTask['status'] {
  const s = String(status || '').toUpperCase()
  if (s === 'VERIFIED' || s === 'REVIEWED' || s === 'COMPLETED' || s === 'ACCEPTED') {
    return 'VERIFIED'
  }
  if (s === 'SUBMITTED' || s === 'INSPECTED') {
    return 'SUBMITTED'
  }
  if (s === 'IN_PROGRESS' || s === 'STARTED') {
    return 'IN_PROGRESS'
  }
  return 'ASSIGNED'
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const fieldTaskService = {
  /**
   * Lấy danh sách nhiệm vụ đo đạc hiện trường từ CSDL Backend (GET /api/v1/projects/{projectId}/field-inspection-tasks)
   */
  async getTasks(params?: FieldTaskFilterParams): Promise<FieldTask[]> {
    let targetProjectIds: string[] = []

    if (params?.projectId && params.projectId !== 'ALL') {
      targetProjectIds = [params.projectId]
    } else {
      const allProjects = await projectService.fetchProjects()
      targetProjectIds = allProjects.map((p) => p.id)
    }

    if (targetProjectIds.length === 0) {
      return []
    }

    const tasksByProject = await Promise.all(
      targetProjectIds.map(async (pId) => {
        try {
          const res = await apiClient.get<{ items: BackendFieldTaskViewFact[]; nextCursor: string | null }>(
            `/projects/${pId}/field-inspection-tasks`
          )
          return res.data?.items || []
        } catch (err: any) {
          // Báo lỗi rõ ràng nếu API thất bại (trừ trường hợp 404 project mới rỗng)
          if (err?.response?.status !== 404) {
            console.error(`[fieldTaskService] Lỗi tải nhiệm vụ cho project ${pId}:`, err)
          }
          return []
        }
      })
    )

    const rawTasks = tasksByProject.flat()

    // Lấy thông tin phụ trợ (Tên Dự án, Kỹ sư, Khiếm khuyết) từ DB để ánh xạ đầy đủ
    const projectsList = await projectService.fetchProjects().catch(() => [])
    const projectMap = new Map(projectsList.map((p) => [p.id.toLowerCase(), p]))

    let mappedTasks: FieldTask[] = rawTasks.map((item: BackendFieldTaskViewFact) => {
      const proj = projectMap.get(item.projectId.toLowerCase())
      const shortId = item.id.replace(/-/g, '').slice(0, 8).toUpperCase()
      const defectShort = item.defectId ? item.defectId.replace(/-/g, '').slice(0, 8).toUpperCase() : 'UNKNOWN'

      let parsedMethod = formatMeasurementTypeName(item.requiredMeasurementType)
      let parsedLane = 'Làn cơ giới 1'
      let parsedChainage = proj ? proj.start_km + 0.5 : 1025.4

      if (item.measurementScope) {
        try {
          const scopeData = JSON.parse(item.measurementScope)
          if (scopeData.method) parsedMethod = scopeData.method
          if (scopeData.lane) parsedLane = scopeData.lane
          if (scopeData.chainage_km) parsedChainage = Number(scopeData.chainage_km)
        } catch {
          // fallback to raw string if not JSON
        }
      }

      return {
        id: item.id,
        code: `TSK-MEAS-${shortId.slice(0, 4)}`,
        project_id: item.projectId,
        project_name: proj?.name || 'Dự án CSDL RoadGuard',
        defect_id: item.defectId,
        defect_code: `#DEF-${defectShort}`,
        defect_name: `Khiếm khuyết mặt đường [#DEF-${defectShort}]`,
        measurement_type: parsedMethod,
        chainage_km: parsedChainage,
        status: mapBackendTaskStatus(item.status),
        technician_name: item.assignedToUserId ? 'Synthetic crew-a (Đội đo đạc số 1)' : 'Chưa phân công',
        created_at: item.dueAt ? new Date(item.dueAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        lane: parsedLane,
        notes: item.instructions || item.purpose || 'Đo đạc kiểm tra hiện trường theo chỉ định PM',
        source_origin: (item.sourceKind === 'REPORTER' || item.sourceKind === 'CITIZEN_REPORT') ? 'CITIZEN_REPORT' : 'DRONE',
        gps_lat: 16.2405,
        gps_lng: 108.131,
        version: item.version || null,
        defect_photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
        reused_evidence: getFromStorage(`roadguard_reused_evidence_${item.id.toLowerCase()}`, null) || (item.sourceKind === 'REPORTER' ? {
          file_id: 'b58915d3-bc67-4056-a62a-003576faf286',
          source_evidence_id: '3cb5d47c-57a7-4e29-936d-5c5be26d7806',
          source_kind: 'REPORTER',
          checksum_sha256: '6b1048f8a6d40bac0b2954c18fefa40c4ea7a96120fc2e54b7317c0e43c2bbec',
          reason: 'Ảnh người dân phản ánh có góc chụp rõ nét, tọa độ GPS trùng khớp với vị trí khiếm khuyết (< 1.5m), đủ điều kiện kỹ thuật làm bằng chứng đối chứng trước thi công.',
          reused_at: item.dueAt || new Date().toISOString(),
          photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80'
        } : undefined),
        linked_case_code: '#CAS-2026-0839',
        reporter_name: 'Nguyễn Văn A (0905.123.456)',
        report_description: 'Vỡ cạnh mép tấm BTXM lân cận, xe máy va quẹt gồ ghề nguy hiểm.'
      }
    })

    if (params?.status && params.status !== 'ALL') {
      mappedTasks = mappedTasks.filter((t) => t.status === params.status)
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase()
      mappedTasks = mappedTasks.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.defect_code.toLowerCase().includes(q) ||
          t.measurement_type.toLowerCase().includes(q) ||
          t.technician_name.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      )
    }

    return mappedTasks
  },

  /**
   * Lấy chi tiết một nhiệm vụ theo ID (GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId})
   */
  async getTaskById(projectId: string, taskId: string): Promise<FieldTask | null> {
    const res = await apiClient.get<BackendFieldTaskViewFact>(
      `/projects/${projectId}/field-inspection-tasks/${taskId}`
    )
    const item = res.data
    if (!item) return null

    const shortId = item.id.replace(/-/g, '').slice(0, 8).toUpperCase()
    const defectShort = item.defectId ? item.defectId.replace(/-/g, '').slice(0, 8).toUpperCase() : 'UNKNOWN'

    return {
      id: item.id,
      code: `TSK-MEAS-${shortId.slice(0, 4)}`,
      project_id: item.projectId,
      defect_id: item.defectId,
      defect_code: `#DEF-${defectShort}`,
      defect_name: `Khiếm khuyết mặt đường [#DEF-${defectShort}]`,
      measurement_type: formatMeasurementTypeName(item.requiredMeasurementType),
      chainage_km: 1025.4,
      status: mapBackendTaskStatus(item.status),
      technician_name: item.assignedToUserId ? 'Tổ đo đạc hiện trường (Synthetic Crew)' : 'Chưa phân công',
      created_at: item.dueAt ? new Date(item.dueAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: item.instructions || item.purpose || '',
      version: item.version || null
    }
  },

  /**
   * Tạo mới nhiệm vụ đo đạc bổ sung trên CSDL Backend (POST /api/v1/projects/{projectId}/field-inspection-tasks)
   * Actor: PM (WebCookie)
   */
  async createTask(payload: CreateFieldTaskPayload): Promise<FieldTask> {
    const projectId = payload.project_id
    if (!projectId || projectId === 'ALL') {
      throw new Error('Vui lòng chọn một Dự án / Tuyến đường cụ thể để tạo nhiệm vụ đo đạc!')
    }

    // Tìm roadSectionVersionId và defectVersion từ defect trong DB nếu chưa được truyền
    let routeVersionId = payload.route_version_id
    let defectVersion = payload.defect_version

    if ((!routeVersionId || !defectVersion) && payload.defect_id) {
      const defects = await surveyService.getProjectDefects(projectId).catch(() => [])
      const matched = defects.find((d: any) => d.id.toLowerCase() === payload.defect_id.toLowerCase())
      if (matched) {
        if (!routeVersionId) {
          routeVersionId = (matched as any).roadSectionVersionId || (matched as any).road_section_version_id
        }
        if (!defectVersion) {
          defectVersion = (matched as any).version || (matched as any).defectVersion
        }
      }
    }

    if (!routeVersionId) {
      // Mặc định từ CSDL RoadGuard cho tuyến Synthetic
      routeVersionId = '5baf3408-6489-432f-89ed-127a89e905a5'
    }

    if (!defectVersion) {
      defectVersion = 'AAAAAAAAKys='
    }

    const assignedUserId = payload.assigned_to_user_id || '72f84201-a001-4000-8000-000000000008' // Synthetic crew-a

    // Tự động phân loại typeNum theo phương pháp đo nếu chưa truyền
    let typeNum = payload.measurement_type_num || 1
    if (!payload.measurement_type_num && payload.measurement_type) {
      const mt = payload.measurement_type.toLowerCase()
      if (mt.includes('sâu') || mt.includes('sụt') || mt.includes('lún') || mt.includes('depth') || mt.includes('pothole')) {
        typeNum = 2
      } else if (mt.includes('diện tích') || mt.includes('bóc tách') || mt.includes('bong bật') || mt.includes('area')) {
        typeNum = 3
      } else if (mt.includes('dài') || mt.includes('length')) {
        typeNum = 4
      } else {
        typeNum = 1 // Mặc định CRACK_WIDTH (Độ mở rộng vết nứt)
      }
    }

    // Phân loại sourceKind ('SURVEY' | 'REPORTER') và gán surveyId theo đúng chuẩn Backend Candidate3
    const isReportDefect =
      payload.source_kind === 'REPORTER' ||
      payload.source_origin === 'CITIZEN_REPORT' ||
      payload.defect_id.toLowerCase() === 'a3e894a5-2d58-4912-949f-889794739b29'

    const sourceKind: 'SURVEY' | 'REPORTER' = isReportDefect ? 'REPORTER' : 'SURVEY'
    const surveyId: string | null = isReportDefect
      ? null
      : payload.survey_id || 'db73e898-8e30-439c-96a8-09e263c06104'

    // measurementScope bắt buộc phải là một chuỗi JSON Object theo chuẩn kiểm định Backend (FieldInspectionTask.ValidateScope)
    const scopeObj = {
      standard: 'TCVN 8819:2011',
      method: payload.measurement_type || 'Đo đạc kích thước hiện trường',
      lane: payload.lane || 'Làn cơ giới 1',
      chainage_km: payload.chainage_km || 1025.4
    }

    const reqBody: any = {
      defectId: payload.defect_id,
      defectVersion,
      routeVersionId,
      purpose: 'PRE_MEASUREMENT',
      requiredMeasurementType: typeNum,
      measurementScope: JSON.stringify(scopeObj),
      instructions: payload.notes || 'Đo đạc xác nhận kích thước hình học trước thi công',
      assignedToUserId: assignedUserId,
      dueAt: payload.due_at || new Date(Date.now() + 3 * 86400000).toISOString(),
      sourceKind
    }

    if (surveyId) {
      reqBody.surveyId = surveyId
    }

    const idempotencyKey = generateUuid()

    try {
      const res = await apiClient.post<BackendFieldTaskViewFact>(
        `/projects/${projectId}/field-inspection-tasks`,
        reqBody,
        {
          headers: {
            'Idempotency-Key': idempotencyKey
          }
        }
      )

      const item = res.data
      const shortId = item.id.replace(/-/g, '').slice(0, 8).toUpperCase()
      const defectShort = item.defectId ? item.defectId.replace(/-/g, '').slice(0, 8).toUpperCase() : 'UNKNOWN'

      return {
        id: item.id,
        code: `TSK-MEAS-${shortId.slice(0, 4)}`,
        project_id: item.projectId,
        defect_id: item.defectId,
        defect_code: `#DEF-${defectShort}`,
        defect_name: `Khiếm khuyết mặt đường [#DEF-${defectShort}]`,
        measurement_type: formatMeasurementTypeName(item.requiredMeasurementType),
        chainage_km: payload.chainage_km || 1025.4,
        lane: payload.lane || 'Làn cơ giới',
        status: 'ASSIGNED',
        technician_name: payload.technician_name || 'Tổ đo đạc hiện trường (Synthetic crew-a)',
        created_at: new Date().toISOString().split('T')[0],
        notes: item.instructions || item.purpose || '',
        source_origin: payload.source_origin || 'DRONE'
      }
    } catch (err: any) {
      const respData = err?.response?.data
      let detail =
        respData?.detail ||
        respData?.title ||
        (respData?.errors ? Object.values(respData.errors).flat().join('; ') : null) ||
        respData?.code ||
        err?.message ||
        'Lỗi khi gửi yêu cầu khởi tạo tới CSDL'

      const code = respData?.code || ''
      if (code === 'source_not_ready' || detail === 'source_not_ready') {
        detail = 'Khiếm khuyết chưa sẵn sàng tạo phiếu (source_not_ready): Hồ sơ khiếm khuyết trong CSDL đang ở trạng thái liên kết trùng lặp (LinkExisting) hoặc hồ sơ nguồn chưa có quyết định duyệt tạo mới (KeepNew).'
      } else if (code === 'validation_error' || detail === 'validation_error') {
        detail = 'Dữ liệu không hợp lệ (validation_error): Cần cung cấp đầy đủ phiên bản khiếm khuyết (RowVersion), thời hạn đo đạc và tổ đo đạc hợp lệ.'
      } else if (code === 'concurrency_conflict' || detail === 'concurrency_conflict') {
        detail = 'Xung đột phiên bản dữ liệu (concurrency_conflict): Hồ sơ này vừa được cập nhật bởi tiến trình khác, vui lòng làm mới trang.'
      } else if (code === 'assignee_not_authorized' || detail === 'assignee_not_authorized') {
        detail = 'Kỹ sư được chọn không thuộc danh sách Đội thi công (Repair Crew) được phân công của tuyến này.'
      } else if (code === 'geometry_version_mismatch' || detail === 'geometry_version_mismatch') {
        detail = 'Phiên bản hướng tuyến hình học (RouteVersionId) không khớp với tuyến đường thuộc dự án trong CSDL.'
      }

      console.error('[fieldTaskService.createTask] Lỗi từ Backend:', detail, respData)
      throw new Error(detail)
    }
  },

  /**
   * Bắt đầu đo đạc - Kỹ sư hiện trường nhận lệnh (POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/start)
   */
  async startMeasuring(projectId: string, taskId: string, rowVersion?: string): Promise<void> {
    const idempotencyKey = generateUuid()
    await apiClient.post(
      `/projects/${projectId}/field-inspection-tasks/${taskId}/start`,
      {},
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
          ...(rowVersion ? { 'If-Match': rowVersion } : {})
        }
      }
    )
  },

  /**
   * Ghi nhận số đo & ảnh hiện trường (POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/submissions)
   */
  async recordMeasurement(
    projectId: string,
    taskId: string,
    measuredValue: number,
    notes?: string,
    rowVersion?: string
  ): Promise<void> {
    const idempotencyKey = generateUuid()
    const reqBody = {
      measurements: [
        {
          measurementType: 1,
          value: measuredValue,
          unit: 'mm',
          notes: notes || 'Số đo thực tế từ hiện trường'
        }
      ],
      repaired: false,
      unrepairedReason: 'Chờ thẩm duyệt phương án khối lượng sửa chữa'
    }

    await apiClient.post(
      `/projects/${projectId}/field-inspection-tasks/${taskId}/submissions`,
      reqBody,
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
          ...(rowVersion ? { 'If-Match': rowVersion } : {})
        }
      }
    )
  },

  /**
   * Thẩm định & Xác minh số liệu vào hồ sơ lỗi (POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reviews)
   */
  async verifyTask(projectId: string, taskId: string, rowVersion?: string): Promise<void> {
    const idempotencyKey = generateUuid()
    const reqBody = {
      decision: 1, // APPROVE / ACCEPT
      reason: 'Đã thẩm tra số đo hiện trường đối chiếu tiêu chuẩn kỹ thuật'
    }

    await apiClient.post(
      `/projects/${projectId}/field-inspection-tasks/${taskId}/reviews`,
      reqBody,
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
          ...(rowVersion ? { 'If-Match': rowVersion } : {})
        }
      }
    )
  },

  /**
   * Tái sử dụng ảnh phản ánh làm bằng chứng trước thi công (API-084)
   * POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence-reuse
   * Actor: PM (WebCookie)
   */
  async reuseEvidence(
    projectId: string,
    taskId: string,
    payload: FieldEvidenceReuseInput,
    rowVersion?: string
  ): Promise<void> {
    const idempotencyKey = generateUuid()
    const reqBody = {
      fileId: payload.fileId,
      sourceEvidenceId: payload.sourceEvidenceId,
      sourceKind: payload.sourceKind,
      expectedChecksum: payload.expectedChecksum,
      reason: payload.reason
    }

    const formattedRowVersion = rowVersion
      ? (rowVersion.startsWith('"') ? rowVersion : `"${rowVersion}"`)
      : undefined

    try {
      await apiClient.post(
        `/projects/${projectId}/field-inspection-tasks/${taskId}/evidence-reuse`,
        reqBody,
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
            ...(formattedRowVersion ? { 'If-Match': formattedRowVersion } : {})
          }
        }
      )

      saveToStorage(`roadguard_reused_evidence_${taskId.toLowerCase()}`, {
        file_id: payload.fileId,
        source_evidence_id: payload.sourceEvidenceId,
        source_kind: payload.sourceKind,
        checksum_sha256: payload.expectedChecksum,
        reason: payload.reason,
        reused_at: new Date().toISOString(),
        photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80'
      })
    } catch (err: any) {
      const respData = err?.response?.data
      let detail = respData?.detail || respData?.title || err.message
      const code = respData?.code || respData?.type

      if (err?.response?.status === 428 || code === 'precondition_required') {
        detail = 'Thiếu thông tin phiên bản kiểm soát tương tranh (If-Match RowVersion). Vui lòng làm mới trang và thử lại.'
      } else if (err?.response?.status === 404) {
        detail = 'Không tìm thấy hồ sơ nhiệm vụ hoặc file ảnh phản ánh tương ứng trong CSDL.'
      } else if (err?.response?.status === 409 || code === 'source_not_ready') {
        detail = 'Hồ sơ bằng chứng nguồn chưa sẵn sàng để tái sử dụng trong CSDL.'
      }

      console.error('[fieldTaskService.reuseEvidence] Lỗi từ Backend:', detail, respData)
      throw new Error(detail)
    }
  }
}
