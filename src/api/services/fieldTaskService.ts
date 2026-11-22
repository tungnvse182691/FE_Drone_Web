import { taskAssigneeService } from './taskAssigneeService'
import { apiClient } from '../client'
import { FieldTask } from '../../types/domain'
import { projectService } from './projectService'
import { surveyService } from './surveyService'
import { isFieldMeasurementCode, measurementTypeLabel } from './fieldMeasurementTypes'

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
  return measurementTypeLabel(typeNum)
}

function mapBackendTaskStatus(status?: string | null): FieldTask['status'] {
  const s = String(status || '').toUpperCase()
  if (s === 'VERIFIED' || s === 'REVIEWED' || s === 'COMPLETED') {
    return 'VERIFIED'
  }
  if (s === 'SUBMITTED' || s === 'INSPECTED') {
    return 'SUBMITTED'
  }
  if (s === 'IN_PROGRESS' || s === 'INPROGRESS' || s === 'STARTED') {
    return 'IN_PROGRESS'
  }
  if (s === 'NEWASSIGNED' || s === 'NEW_ASSIGNED' || s === 'ASSIGNED' || s === 'ACCEPTED') return 'ASSIGNED'
  if (s === 'SUPPLEMENTREQUIRED' || s === 'SUPPLEMENT_REQUIRED') return 'SUPPLEMENT_REQUIRED'
  return 'UNKNOWN'
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
          const rows:BackendFieldTaskViewFact[]=[],seen=new Set<string>();let afterId:string|undefined
          do {
            const res=await apiClient.get<{items:BackendFieldTaskViewFact[];nextCursor:string|null}>(`/projects/${pId}/field-inspection-tasks`,{params:{limit:100,afterId}})
            if(!Array.isArray(res.data?.items)||res.data.nextCursor!=null&&(typeof res.data.nextCursor!=='string'||!res.data.nextCursor))throw new Error('Danh sách nhiệm vụ FIELD sai contract.')
            for(const row of res.data.items){if(!row.id||row.projectId!==pId||rows.some(r=>r.id===row.id))throw new Error('Nhiệm vụ FIELD sai dự án hoặc trùng ID.');rows.push(row)}
            afterId=res.data.nextCursor||undefined;if(afterId&&seen.has(afterId))throw new Error('Cursor FIELD lặp.');if(afterId)seen.add(afterId)
          }while(afterId)
          return rows
        } catch (err: any) {
          throw err // API failure is not an empty project.
        }
      })
    )

    const rawTasks = tasksByProject.flat()
    // Tên người được giao: GET /projects/{p}/task-assignees (batch ≤100); lỗi tên không chặn danh sách, hiện nhãn "chưa có tên từ máy chủ".
    const assigneeNames = new Map<string, string>()
    await Promise.all(targetProjectIds.map(async (pId) => {
      const ids = rawTasks.filter((t) => t.projectId === pId && t.assignedToUserId).map((t) => t.id)
      if (!ids.length) return
      try { for (const [k, v] of await taskAssigneeService.currentNames(pId, ids)) assigneeNames.set(k, v) }
      catch (e: any) { console.warn('[fieldTaskService] Không đọc được task-assignees:', e?.response?.status, e?.response?.data?.code) }
    }))

    // Lấy thông tin phụ trợ (Tên Dự án, Kỹ sư, Khiếm khuyết) từ DB để ánh xạ đầy đủ
    const projectsList = await projectService.fetchProjects()
    const projectMap = new Map(projectsList.map((p) => [p.id.toLowerCase(), p]))

    let mappedTasks: FieldTask[] = rawTasks.map((item: BackendFieldTaskViewFact) => {
      const proj = projectMap.get(item.projectId.toLowerCase())
      const shortId = item.id.replace(/-/g, '').slice(0, 8).toUpperCase()
      const defectShort = item.defectId ? item.defectId.replace(/-/g, '').slice(0, 8).toUpperCase() : 'UNKNOWN'

      const parsedMethod = formatMeasurementTypeName(item.requiredMeasurementType)
      let parsedLane = ''
      let parsedChainage: number | null = null

      if (item.measurementScope) {
        try {
          const scopeData = JSON.parse(item.measurementScope)
          if (scopeData.lane) parsedLane = scopeData.lane
          if (scopeData.chainage_km != null) parsedChainage = Number(scopeData.chainage_km)
        } catch {
          // fallback to raw string if not JSON
        }
      }

      return {
        id: item.id,
        code: `TSK-MEAS-${shortId.slice(0, 4)}`,
        project_id: item.projectId,
        project_name: proj?.name || 'Chưa có tên dự án',
        defect_id: item.defectId,
        defect_code: `#DEF-${defectShort}`,
        defect_name: `Khiếm khuyết mặt đường [#DEF-${defectShort}]`,
        measurement_type: parsedMethod,
        chainage_km: parsedChainage,
        status: mapBackendTaskStatus(item.status),
        technician_name: item.assignedToUserId ? (assigneeNames.get(item.id.toLowerCase()) || `Crew ${item.assignedToUserId.slice(0, 8)} (chưa có tên từ máy chủ)`) : 'Chưa phân công',
        created_at: undefined,
        lane: parsedLane,
        notes: item.instructions || item.purpose || '',
        source_origin: item.sourceKind === 'REPORTER' ? 'CITIZEN_REPORT' : item.sourceKind === 'SURVEY' ? 'DRONE' : undefined,

        version: item.version || null,
        defect_photo_url: undefined,
        reused_evidence: undefined,
        linked_case_code: undefined,
        reporter_name: undefined,
        report_description: undefined
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
      chainage_km: null,
      status: mapBackendTaskStatus(item.status),
      technician_name: item.assignedToUserId ? `Crew ${item.assignedToUserId.slice(0, 8)} (chưa có tên từ máy chủ)` : 'Chưa phân công',
      created_at: undefined,
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
      const defect = await surveyService.getDefectById(projectId, payload.defect_id)
      routeVersionId ||= defect.defect.roadSectionVersionId
      defectVersion ||= defect.defect.version
    }
    if (!routeVersionId || !defectVersion || !payload.defect_id || !payload.assigned_to_user_id) {
      throw new Error('Thiếu Defect/version/geometry/Crew hợp lệ; chưa tạo FIELD.')
    }
    const assignedUserId = payload.assigned_to_user_id
    const typeNum = payload.measurement_type_num
    if (!isFieldMeasurementCode(typeNum)) throw new Error('Cần mã loại đo canonical 1–6 từ BE; không suy từ tên phương pháp.')
    const sourceKind = payload.source_kind
    if (sourceKind !== 'REPORTER' && sourceKind !== 'SURVEY') throw new Error('Thiếu nguồn Defect đã xác minh; không tự phân loại theo UUID.')
    if (sourceKind === 'SURVEY' && !payload.survey_id) throw new Error('Thiếu Survey nguồn; không dùng Survey mẫu.')
    const surveyId = sourceKind === 'SURVEY' ? payload.survey_id : null

    // measurementScope bắt buộc phải là một chuỗi JSON Object theo chuẩn kiểm định Backend (FieldInspectionTask.ValidateScope)
    const scopeObj = {
      standard: 'TCVN 8819:2011',
      lane: payload.lane,
      chainage_km: payload.chainage_km
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
        chainage_km: payload.chainage_km ?? null,
        lane: payload.lane || '',
        status: 'ASSIGNED',
        technician_name: payload.technician_name || `Crew (${assignedUserId})`,
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
    throw new Error('Bắt đầu FIELD là lệnh của Crew được giao, cần accept và origin/version. Web PM/Supervisor chỉ theo dõi; chưa gửi lệnh.')
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
    throw new Error('Không gửi số đo thay Crew: submission cần origin, first-start, evidence VERIFIED và provenance. Hãy dùng ứng dụng Crew; form Web hiện chưa đủ DTO.')
  },

  /**
   * Thẩm định & Xác minh số liệu vào hồ sơ lỗi (POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reviews)
   */
  async verifyTask(projectId: string, taskId: string, rowVersion?: string, decision: 'ACCEPT' | 'SUPPLEMENT' = 'ACCEPT'): Promise<void> {
    throw new Error('Mở chi tiết phiếu đo, đọc submission và chọn CONFIRM/NO_DEFECT/SUPPLEMENT cùng lý do trước khi review FIELD.')
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
    throw new Error('Mở modal tái sử dụng bằng chứng, chọn ảnh nguồn thật và nhập căn cứ; caller cũ không có provenance/journal nên chưa gửi lệnh.')
  }
}
