// Các thao tác ghi cũ chưa có command Web đã xác minh: giữ chữ ký hàm, ném lỗi ngay, không tạo dữ liệu giả.
function throwLegacyBlocked(): never {
  throw new Error('Thao tác này chưa được tích hợp bằng command và dữ liệu máy chủ hợp lệ. Chưa thực hiện thay đổi. ')
}
import { apiClient } from '../client'
import { projectService } from './projectService'
import { useAuthStore } from '../../store/authStore'
import { ProjectRouteConfig, AvailablePilot } from '../../pages/(pm)/create-survey/types'
import { AIDetectionItem } from '../../pages/(pm)/drone-review/types'

export type { ProjectRouteConfig, AvailablePilot, AIDetectionItem }

export interface AiCandidateFactsDto {
  schemaVersion?: string
  detectionId: string
  projectId: string
  datasetVersionId: string
  modelVersionId: string
  runId: string
  jobId: string
  attemptId: string
  resultId: string
  manifestHash: string
  resultHash: string
  fixtureVersion: string
  mode: string
  sourceVideoFileId: string
  sourceVideoFileVersion: string
  frameFileId: string
  frameFileVersion: string
  frameSha256: string
  frameSizeBytes: number
  frameMediaType: string
  timestampMs: number
  typeCode: 'CRACK' | 'POTHOLE' | string
  confidence: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  routeVersionId: string
  segmentSetId: string
  segmentId: string | null
  geometryVersion: string
  positionStatus: string
  sourceVersion: string
  disposition: {
    decisionId: string
    version: string
  } | null
  dispositionVersion: string | null
}

export interface CandidateDecisionDto {
  id: string
  sourceKind: 'AI_DETECTION' | 'REPORT' | 'FIELD_OBSERVATION'
  sourceId: string
  decision: 'KEEP_NEW' | 'LINK_EXISTING' | 'REJECT'
  defectId: string | null
  version: string
  supersedesDecisionId: string | null
}

export interface CandidateMatchItemDto {
  defectId: string
  version: string
  segmentId: string | null
  priorityGroup: number
  distanceMeters: number | null
  accuracyMeters: number | null
  reasonCodes: string[]
  evidenceRefs?: string[]
  historySummary?: {
    sourceLinkCount: number
  }
}

export interface CandidateMatchPageDto {
  source: {
    kind: string
    id: string
    version: string
  }
  geometryVersion: string
  algorithmVersion: string
  items: CandidateMatchItemDto[]
  nextCursor: string | null
}

export interface BackendDefectDto {
  id: string
  projectId: string
  roadSectionVersionId: string
  segmentId: string | null
  defectTypeCode: 'POTHOLE' | 'CRACK' | string
  causeCategoryCode: string | null
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'VERIFIED' | 'REJECTED' | 'CLOSED' | string
  geometry?: unknown
  version: string
}

export interface FileMetadataDto {
  id: string
  status: string
  checksumSha256: string
  mediaType: string
  sizeBytes: number
  version: string
}

const fileBlobUrlCache = new Map<string, string>()

export const DEFECT_TYPE_LABELS: Record<string, string> = {
  CRACK: 'Vết nứt mặt đường',
  POTHOLE: 'Ổ gà mặt đường',
  LONGITUDINAL_CRACK: 'Nứt dọc mặt đường',
  TRANSVERSE_CRACK: 'Nứt ngang mặt đường',
  ALLIGATOR_CRACK: 'Nứt mạng lưới (da cá sấu)',
  RUTTING: 'Lún vệt bánh xe',
  RAVELING: 'Bong bật cốt liệu'
}

export interface AiCandidateOverride {
  bbox?: { x: number; y: number; width: number; height: number }
  rawTypeCode?: string
  customTypeLabel?: string
}

export function formatDefectTypeLabel(typeCode?: string | null, customLabel?: string | null): string {
  if (customLabel && customLabel.trim()) return customLabel.trim()
  if (!typeCode) return 'Vết nứt mặt đường'
  const upper = typeCode.toUpperCase()
  if (DEFECT_TYPE_LABELS[upper]) return DEFECT_TYPE_LABELS[upper]
  return typeCode
}

export interface SurveyMissionItem {
  scope_summary?: string
  read_error?: string
  serverRecordKind?: 'PLAN' | 'TASK'
  serverStatus?: string
  id: string
  code: string
  title: string
  survey_type: 'BASELINE' | 'PERIODIC' | 'AD_HOC' | null
  survey_type_label: string
  project_id: string
  project_name: string
  start_km: string
  end_km: string
  flight_date: string
  pilot_name: string
  drone_model: string
  total_photos: number
  gsd_resolution: string
  ai_defects_count: number
  ai_pending_count: number
  approved_count?: number
  reviewed_count?: number
  coverage_percent: number
  status?: 'PENDING_AI_REVIEW' | 'BASELINE_LOCKED' | 'SCHEDULED' | 'PROCESSING_AI'
  status_label: string
}

export interface CreateSurveyPayload {
  project_id: string
  project_name: string
  start_km: string
  end_km: string
  pilot_name: string
  drone_model?: string
  flight_date?: string
  survey_type?: 'PERIODIC' | 'AD_HOC' | 'BASELINE'
  notes?: string
}

// Fallback types exported for type-checking and initial states
export const INITIAL_SURVEY_MISSIONS: SurveyMissionItem[] = []
export const INITIAL_SURVEY_ROUTES: ProjectRouteConfig[] = []
export const INITIAL_PILOTS: AvailablePilot[] = []

/**
 * Đảm bảo có Bearer Token cho các endpoint Candidate3 yêu cầu xác thực JWT Bearer
 */
async function ensureBearerToken(): Promise<null> {
  // Web uses the current cookie session. Never sign in another actor or restore Bearer storage.
  return null
}

const candidateWrites = new Set<string>()

interface RunDetection {
  detectionId: string
  typeCode: string
  confidence: number
  bbox: [number, number, number, number]
  frameFileId: string
  timestampMs: number
}

const SEVERITY_VI: Record<string, string> = {
  CRITICAL: 'Khẩn cấp',
  HIGH: 'Nghiêm trọng',
  MEDIUM: 'Trung bình',
  LOW: 'Nhẹ'
}

// Dựng một phát hiện AI hoàn toàn từ dữ liệu BE (kết quả run + ai-candidates + candidate-decisions + defects)
async function buildDetectionItem(
  projectId: string,
  runId: string,
  d: RunDetection,
  codeIndex: number,
  defectMap: Map<string, BackendDefectDto>
): Promise<AIDetectionItem> {
  const candFacts = await surveyService.getAiCandidateFacts(projectId, d.detectionId)
  const decisionDto = candFacts.disposition?.decisionId
    ? await surveyService.getCandidateDecision(projectId, candFacts.disposition.decisionId)
    : null
  const decisionKind = decisionDto?.decision || null
  const defectId = decisionDto?.defectId || null
  const status: AIDetectionItem['status'] = decisionKind === 'REJECT' ? 'REJECTED'
    : decisionKind === 'KEEP_NEW' || decisionKind === 'LINK_EXISTING' ? 'APPROVED' : 'PENDING'
  const linkedDbDefect = defectId ? defectMap.get(defectId.toLowerCase()) : undefined
  const bboxX = candFacts.boundingBox?.x ?? d.bbox[0]
  const bboxY = candFacts.boundingBox?.y ?? d.bbox[1]
  const bboxW = candFacts.boundingBox?.width ?? d.bbox[2]
  const bboxH = candFacts.boundingBox?.height ?? d.bbox[3]
  const topPct = (bboxY * 100).toFixed(1) + '%'
  const leftPct = (bboxX * 100).toFixed(1) + '%'
  const widthPct = (bboxW * 100).toFixed(1) + '%'
  const heightPct = (bboxH * 100).toFixed(1) + '%'
  const typeCode = linkedDbDefect?.defectTypeCode || candFacts.typeCode || d.typeCode
  const typeLabel = formatDefectTypeLabel(typeCode)
  const confVal = candFacts.confidence ?? d.confidence
  const confPct = confVal > 1 ? Math.round(confVal) : Math.round(confVal * 100)
  const tsMs = candFacts.timestampMs ?? d.timestampMs
  const severityLabel = (linkedDbDefect?.severity && SEVERITY_VI[linkedDbDefect.severity]) || 'Chưa được PM phân loại'

  return {
    id: d.detectionId,
    code: `DET-${String(codeIndex).padStart(2, '0')}`,
    defectCode: defectId ? `#DEF-${defectId.slice(0, 8).toUpperCase()}` : undefined,
    defectId,
    stationing: 'Chưa có lý trình từ server',
    lane: '',
    type: typeLabel,
    severityLevel: severityLabel,
    confidence: confPct,
    description: `Khung hình trích xuất tại mốc ${tsMs}ms`,
    metrics: {},
    status,
    kmValue: Number.NaN,
    bbox: {
      top: topPct,
      left: leftPct,
      width: widthPct,
      height: heightPct,
      label: `${typeLabel} • ${confPct}%`,
      dims: `Khung bao: ${widthPct} × ${heightPct}`,
      borderColor: typeCode === 'POTHOLE' ? '#F59E0B' : '#EF4444'
    },
    projectId,
    runId,
    datasetVersionId: candFacts.datasetVersionId,
    modelVersionId: candFacts.modelVersionId,
    fixtureVersion: candFacts.fixtureVersion,
    sourceVideoFileId: candFacts.sourceVideoFileId,
    frameFileId: candFacts.frameFileId,
    frameFileVersion: candFacts.frameFileVersion,
    frameSha256: candFacts.frameSha256,
    frameSizeBytes: candFacts.frameSizeBytes,
    frameMediaType: candFacts.frameMediaType,
    timestampMs: tsMs,
    rawTypeCode: typeCode,
    rawBbox: { x: bboxX, y: bboxY, width: bboxW, height: bboxH },
    routeVersionId: candFacts.routeVersionId,
    segmentSetId: candFacts.segmentSetId,
    segmentId: candFacts.segmentId,
    geometryVersion: candFacts.geometryVersion,
    positionStatus: candFacts.positionStatus,
    sourceVersion: candFacts.sourceVersion,
    disposition: candFacts.disposition,
    decisionKind
  }
}

export const surveyService = {
async readSurveyPage(path: string, signal?: AbortSignal): Promise<any[]> {
    const epoch = useAuthStore.getState().authEpoch
    const items: any[] = [], seen = new Set<string>()
    let cursor: string | undefined
    do {
      const response = await apiClient.get(path, { params: { limit: 100, cursor }, signal })
      if (signal?.aborted || epoch !== useAuthStore.getState().authEpoch) throw new Error('Phiên khảo sát đã thay đổi.')
      if (!Array.isArray(response.data?.items)) throw new Error('Collection khảo sát trả sai contract.')
      items.push(...response.data.items)
      cursor = response.data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor khảo sát bị lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return items
  },

  /**
   * Lấy danh sách nhiệm vụ bay khảo sát trực tiếp từ CSDL Backend Candidate3 (W05 / ADD-05 / ADD-06)
   * Nghiêm cấm trả về mock data giả mạo. CSDL rỗng trả về [].
   */
  async getSurveys(targetProjectId?: string): Promise<SurveyMissionItem[]> {
    await ensureBearerToken()

    let projects = await projectService.fetchProjects()
    if (targetProjectId) {
      projects = projects.filter((p) => p.id === targetProjectId || p.code === targetProjectId)
    }
    if (!projects || projects.length === 0) return []

    const allMissions: SurveyMissionItem[] = []

    for (const project of projects) {
      const [plans, tasks, aiRuns, baselines, members] = await Promise.all([
        this.readSurveyPage(`/projects/${project.id}/survey-plans`) as Promise<Array<{
          id: string; projectId: string; plannedAt?: string; status?: string; surveyType?: string | number
        }>>,
        this.readSurveyPage(`/projects/${project.id}/survey-tasks`) as Promise<Array<{
          id: string; projectId: string; operatorId?: string; planId?: string
        }>>,
        this.readSurveyPage(`/projects/${project.id}/ai-mock-runs`) as Promise<Array<{ id: string; status: string }>>,
        this.readSurveyPage(`/projects/${project.id}/baseline-selections`).catch((err) => {
          // Chỉ ảnh hưởng nhãn khóa Baseline trong danh sách; trạng thái khóa coi là chưa xác định, không bịa.
          console.warn('[surveyService] Không đọc được baseline-selections:', err?.message)
          return [] as any[]
        }),
        this.readSurveyPage(`/projects/${project.id}/members`).catch(() => [] as any[])
      ])
      const memberName = new Map<string, string>()
      for (const m of members) if (m?.userId) memberName.set(String(m.userId).toLowerCase(), m.displayName || '')

      // Đếm kết quả AI/thẩm định từ run SUCCEEDED và quyết định thật trên BE (chỉ tính một lần cho mỗi dự án)
      const completedRun = aiRuns.find((r) => r.status === 'SUCCEEDED')
      let detectionsCount = 0
      let approvedCount = 0
      let rejectedCount = 0
      if (completedRun) {
        try {
          const resultRes = await apiClient.get<{ detections?: Array<{ detectionId: string }> }>(
            `/projects/${project.id}/ai-mock-runs/${completedRun.id}/result`
          )
          const detections = resultRes.data?.detections || []
          detectionsCount = detections.length
          for (const d of detections) {
            const facts = await this.getAiCandidateFacts(project.id, d.detectionId)
            if (!facts.disposition?.decisionId) continue
            const decision = await this.getCandidateDecision(project.id, facts.disposition.decisionId)
            if (decision.decision === 'REJECT') rejectedCount += 1
            else approvedCount += 1
          }
        } catch (err: any) {
          // Số liệu AI của danh sách chưa đọc được: để 0 (không bịa); màn chi tiết sẽ báo lỗi rõ khi tải phát hiện AI.
          console.warn('[surveyService] Không đọc được kết quả AI của dự án:', err?.message)
          detectionsCount = 0; approvedCount = 0; rejectedCount = 0
        }
      }

      for (const plan of plans) {
        const associatedTasks = tasks.filter((t) => t.planId === plan.id)
        const shortId = plan.id.replace(/-/g, '').slice(0, 8).toUpperCase()
        const missionCode = `#MS-2026-${shortId.slice(0, 4)}`

        const rawType = String(plan.surveyType ?? '').toUpperCase()
        const survey_type: 'BASELINE' | 'PERIODIC' | 'AD_HOC' | null =
          rawType === '1' || rawType === 'BASELINE' ? 'BASELINE'
          : rawType === '2' || rawType === 'PERIODIC' ? 'PERIODIC'
          : rawType === '3' || rawType === 'AD_HOC' ? 'AD_HOC'
          : null
        const survey_type_label =
          survey_type === 'BASELINE' ? 'Khảo sát cơ sở (Baseline)'
          : survey_type === 'AD_HOC' ? 'Khảo sát đột xuất'
          : survey_type === 'PERIODIC' ? 'Khảo sát định kỳ'
          : ''

        // BE chưa liên kết run AI với kế hoạch bay: chỉ gắn kết quả AI cho đợt Baseline khi dự án có run SUCCEEDED
        const hasAiResults = survey_type === 'BASELINE' && !!completedRun
        const planDetectionsCount = hasAiResults ? detectionsCount : 0
        const planReviewedCount = hasAiResults ? approvedCount + rejectedCount : 0
        const planPendingCount = hasAiResults ? Math.max(0, detectionsCount - planReviewedCount) : 0
        const isLocked = survey_type === 'BASELINE' && baselines.length > 0

        let status: SurveyMissionItem['status'] = 'SCHEDULED'
        let status_label = 'Kế hoạch lên lịch'
        if (isLocked) {
          status = 'BASELINE_LOCKED'
          status_label = 'Đã khóa Baseline'
        } else if (hasAiResults) {
          status = 'PENDING_AI_REVIEW'
          status_label = planReviewedCount >= planDetectionsCount && planDetectionsCount > 0 ? 'Đã thẩm định 100%' : 'Chờ thẩm định AI'
        }

        const operatorId = associatedTasks.find((t) => t.operatorId)?.operatorId
        allMissions.push({
          id: plan.id,
          code: missionCode,
          title: `${survey_type_label || 'Khảo sát'} (${project.name})`,
          survey_type,
          survey_type_label,
          project_id: project.id,
          project_name: project.name,
          start_km: project.start_km == null ? '' : String(project.start_km),
          end_km: project.end_km == null ? '' : String(project.end_km),
          flight_date: plan.plannedAt ? new Date(plan.plannedAt).toLocaleDateString('vi-VN') : '',
          pilot_name: operatorId ? memberName.get(operatorId.toLowerCase()) || '' : '',
          drone_model: '',
          total_photos: 0,
          gsd_resolution: '',
          ai_defects_count: planDetectionsCount,
          ai_pending_count: planPendingCount,
          approved_count: hasAiResults ? approvedCount : 0,
          reviewed_count: planReviewedCount,
          coverage_percent: 0,
          status,
          status_label
        })
      }
    }

    return allMissions
  },

  /**
   * Lấy chi tiết nhiệm vụ khảo sát theo ID hoặc Code từ CSDL thật
   */
  async getSurveyById(id: string): Promise<SurveyMissionItem | undefined> {
    const list = await this.getSurveys()
    return list.find((s) => s.id === id || s.code === id)
  },

  /**
   * Lấy danh sách Tuyến chính của Dự án phục vụ tạo kế hoạch bay (Dữ liệu thật từ CSDL Backend)
   */
  async getSurveyRoutes(): Promise<ProjectRouteConfig[]> {
    throw new Error('Phạm vi tuyến cho form này chưa được tích hợp bằng Web cookie và discovery đã xác minh. Chưa chọn dữ liệu thay thế.')
  },

  /**
   * Lấy danh sách phi công UAV được phân công trong dự án (GET /api/v1/projects/{projectId}/members)
   */
  async getAvailablePilots(projectId?: string): Promise<AvailablePilot[]> {
    await ensureBearerToken()
    if (!projectId) throw new Error('Thiếu mã dự án để tải phi công từ máy chủ.')
    const members = await this.readSurveyPage(`/projects/${projectId}/members`)
    return members
      .filter((m: any) => /OPERATOR|DRONE|PILOT/.test(String(m.role || '').toUpperCase()))
      .map((m: any) => ({
        id: m.userId,
        name: m.displayName || '',
        roleLabel: m.role || '',
        phone: '',
        license: '',
        device: ''
      }))
  },

  /**
   * Tạo kế hoạch bay khảo sát mới trên CSDL Backend Candidate3 (API-201 / POST /survey-plans)
   * Kèm gán nhiệm vụ bay cho Operator (API-203 / POST /survey-tasks)
   */
  async createSurvey(data: CreateSurveyPayload): Promise<SurveyMissionItem> {
    throw new Error('BLOCKED: Form hiện tại chỉ có lý trình và tên phi công; chưa có scope/version và Operator ID đã xác minh để gửi command tạo kế hoạch/giao nhiệm vụ. Chưa tạo dữ liệu.')
  },

  /**
   * Kích hoạt tiến trình chạy nhận diện Road-YOLOv9 (API-053 / POST /ai-mock-runs)
   */
  async simulateDroneFlightCompletion(surveyId: string): Promise<SurveyMissionItem | null> {
    void surveyId
    throwLegacyBlocked()
  },

  /**
   * Lấy danh sách phát hiện AI từ kết quả run AI thật trên Backend Candidate3
   * Kết hợp SWG-053 (/ai-mock-runs/{runId}/result), SWG-005 (/ai-candidates/{detectionId}) và SWG-020 (/candidate-decisions/{decisionId})
   */
  async getSurveyDetections(
    surveyId: string,
    preloadedMission?: SurveyMissionItem,
    preloadedProjectId?: string
  ): Promise<AIDetectionItem[]> {
    await ensureBearerToken()

    let target = preloadedMission
    if (!target) {
      const missions = await this.getSurveys()
      target = missions.find((m) => m.id === surveyId || m.code === surveyId)
    }
    const projectId = preloadedProjectId || target?.project_id
    if (!projectId) throw new Error('Không xác định được dự án của nhiệm vụ khảo sát từ máy chủ.')

    const runs = (await this.readSurveyPage(`/projects/${projectId}/ai-mock-runs`)).filter((r) => r.status === 'SUCCEEDED')
    if (runs.length === 0) return []
    const run = runs[0]
    const resultRes = await apiClient.get<{ detections: RunDetection[] }>(
      `/projects/${projectId}/ai-mock-runs/${run.id}/result`
    )
    const defectMap = new Map<string, BackendDefectDto>()
    for (const df of await this.getProjectDefects(projectId)) defectMap.set(df.id.toLowerCase(), df)

    return Promise.all(
      (resultRes.data?.detections || []).map((d, index) =>
        buildDetectionItem(projectId, run.id, d, index + 1, defectMap)
      )
    )
  },

  /**
   * Cập nhật thẩm định phát hiện AI trực tiếp vào CSDL Backend Candidate3
   * Gọi POST /api/v1/projects/{projectId}/candidate-decisions (SWG-019)
   */
  async updateSurveyDetection(
    surveyId: string,
    detectionId: string,
    updates: Partial<AIDetectionItem>
  ): Promise<AIDetectionItem | null> {
    void surveyId; void detectionId; void updates
    throwLegacyBlocked()
  },

  /**
   * Đặt lại trạng thái ứng viên AI về Chờ duyệt (Hủy gom / Tách ra)
   */
  async resetSurveyDetection(detectionId: string): Promise<void> {
    void detectionId
    throwLegacyBlocked()
  },

  /**
   * [SWG-005] GET /api/v1/projects/{projectId}/ai-candidates/{detectionId}
   * Đọc thông tin chuẩn xác (AiCandidateFactsV1) của một phát hiện AI từ CSDL Backend
   */
  async getAiCandidateFacts(projectId: string, detectionId: string): Promise<AiCandidateFactsDto> {
    await ensureBearerToken()
    const res = await apiClient.get<AiCandidateFactsDto>(
      `/projects/${projectId}/ai-candidates/${detectionId}`
    )
    return res.data
  },

  /**
   * [SWG-020] GET /api/v1/projects/{projectId}/candidate-decisions/{decisionId}
   * Đọc quyết định thẩm định (KEEP_NEW / LINK_EXISTING / REJECT) đã lưu trong CSDL
   */
  async getCandidateDecision(projectId: string, decisionId: string): Promise<CandidateDecisionDto> {
    await ensureBearerToken()
    const res = await apiClient.get<CandidateDecisionDto>(
      `/projects/${projectId}/candidate-decisions/${decisionId}`
    )
    return res.data
  },

  /**
   * [SWG-018] GET /api/v1/projects/{projectId}/candidates
   * Tìm danh sách khiếm khuyết ứng viên trùng khớp (CandidateMatchPageDto)
   */
  async getCandidateMatches(
    projectId: string,
    sourceKind: 'AI_DETECTION' | 'REPORT',
    sourceId: string
  ): Promise<CandidateMatchPageDto> {
    await ensureBearerToken()

    const res = await apiClient.get<CandidateMatchPageDto>(`/projects/${projectId}/candidates`, {
      params: {
        sourceKind,
        sourceId,
        expand: true
      }
    })
    return res.data
  },

  /**
   * Lưu tọa độ khung bao (Bounding Box) và loại khiếm khuyết hiệu chỉnh vào CSDL SQL Server
   */
  async saveAiCandidateOverride(
    detectionId: string,
    override: AiCandidateOverride
  ): Promise<void> {
    void detectionId; void override
    throwLegacyBlocked()
  },

  /**
   * [SWG-019] POST /api/v1/projects/{projectId}/candidate-decisions
   * Ra quyết định thẩm định ứng viên (KEEP_NEW | LINK_EXISTING | REJECT) chuẩn Candidate3
   */
  async decideCandidate(projectId: string, payload: {
    sourceKind: 'AI_DETECTION' | 'REPORT'; sourceId: string;
    decision: 'KEEP_NEW' | 'LINK_EXISTING' | 'REJECT'; reason: string;
    sourceVersion?: string; geometryVersion?: string;
    supersedesDecisionId?: string | null; previousDecisionVersion?: string | null;
    targetDefectId?: string | null; targetVersion?: string | null;
    defectTypeCode?: string; customTypeLabel?: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    roadSectionVersionId?: string; segmentId?: string | null;
  }): Promise<CandidateDecisionDto> {
    const actor = useAuthStore.getState().user
    const epoch = useAuthStore.getState().authEpoch
    if (!actor || actor.role !== 'PROJECT_MANAGER') throw new Error('Chỉ PM được quyết định Candidate.')
    if (!payload.sourceVersion || !payload.geometryVersion || !payload.reason.trim()) throw new Error('Thiếu snapshot sourceVersion/geometryVersion hoặc lý do; phải đọc lại từ server.')
    if (payload.decision === 'KEEP_NEW' && (!payload.defectTypeCode || !payload.severity || !payload.roadSectionVersionId)) throw new Error('Thiếu classification có căn cứ cho KEEP_NEW.')
    if (payload.decision === 'LINK_EXISTING' && (!payload.targetDefectId || !payload.targetVersion)) throw new Error('Thiếu Defect ID/version đích đã đọc.')
    const body = { sourceKind: payload.sourceKind, sourceId: payload.sourceId, sourceVersion: payload.sourceVersion,
      geometryVersion: payload.geometryVersion, decision: payload.decision, reason: payload.reason.trim(),
      targetDefectId: payload.decision === 'LINK_EXISTING' ? payload.targetDefectId : null,
      targetVersion: payload.decision === 'LINK_EXISTING' ? payload.targetVersion : null,
      classification: payload.decision === 'KEEP_NEW' ? { defectTypeCode: payload.defectTypeCode, severity: payload.severity,
        roadSectionVersionId: payload.roadSectionVersionId, segmentId: payload.segmentId ?? null, causeCategoryCode: null } : null,
      supersedesDecisionId: payload.supersedesDecisionId ?? null, previousDecisionVersion: payload.previousDecisionVersion ?? null, recurrence: null }
    const fingerprint = JSON.stringify(body)
    const journalKey = `rg_candidate_command_${actor.id}_${projectId}_${payload.sourceId}`
    const saved = sessionStorage.getItem(journalKey)
    const command = saved ? JSON.parse(saved) : { key: crypto.randomUUID(), body, fingerprint }
    if (command.fingerprint !== fingerprint) throw new Error('Ý định trước chưa đối chiếu xong; không đổi key/body/version để ghi đè.')
    const current = () => { if (useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor.id) throw new Error('Phiên Candidate đã thay đổi.') }
    if (candidateWrites.has(journalKey)) throw new Error('Đang gửi quyết định này.')
    candidateWrites.add(journalKey)
    try {
      current(); sessionStorage.setItem(journalKey, JSON.stringify(command))
      if (!command.receipt) {
        const response = await apiClient.post<CandidateDecisionDto>(`/projects/${projectId}/candidate-decisions`, command.body, {
          headers: { 'Idempotency-Key': command.key }, transformRequest: [(data: unknown) => { current(); return JSON.stringify(data) }] })
        current(); command.receipt = response.data; sessionStorage.setItem(journalKey, JSON.stringify(command))
      }
      const decision = await this.getCandidateDecision(projectId, command.receipt.id)
      current()
      if (decision.sourceId !== payload.sourceId || decision.decision !== payload.decision) throw new Error('Quyết định đọc lại không khớp yêu cầu.')
      if (payload.sourceKind === 'AI_DETECTION') {
        const candidate = await this.getAiCandidateFacts(projectId, payload.sourceId)
        current()
        if (candidate.disposition?.decisionId !== decision.id) throw new Error('Current head chưa khớp biên nhận; cần đối chiếu, không POST thêm.')
      }
      sessionStorage.removeItem(journalKey)
      return decision
    } finally { candidateWrites.delete(journalKey) }
  },

  /**
   * [SWG-032] GET /api/v1/projects/{projectId}/defects
   * Lấy danh sách toàn bộ khiếm khuyết mặt đường trong CSDL của dự án
   */
  async getProjectDefects(projectId?: string): Promise<BackendDefectDto[]> {
    await ensureBearerToken()

    let targetProjects: Array<{ id: string }> = []
    if (projectId) {
      targetProjects = [{ id: projectId }]
    } else {
      const projects = await projectService.fetchProjects().catch(() => projectService.getProjects())
      targetProjects = projects.length > 0 ? projects : []
    }

    const allDefects: BackendDefectDto[] = []
    for (const p of targetProjects) {
      try {
        const res = await apiClient.get<{ items: BackendDefectDto[]; nextCursor?: string | null }>(
          `/projects/${p.id}/defects`
        )
        if (res.data?.items) {
          allDefects.push(...res.data.items)
        }
      } catch (err) {
        if (projectId) throw err
      }
    }
    return allDefects
  },

  /**
   * [SWG-033] GET /api/v1/projects/{projectId}/defects/{defectId}
   * Lấy chi tiết khiếm khuyết kèm ETag chuẩn
   */
  async getDefectById(
    projectId: string,
    defectId: string
  ): Promise<{ defect: BackendDefectDto; etag: string }> {
    await ensureBearerToken()
    const res = await apiClient.get<BackendDefectDto>(`/projects/${projectId}/defects/${defectId}`)
    const rawEtag = res.headers?.etag || `"${res.data.version}"`
    const quotedEtag = rawEtag.startsWith('"') ? rawEtag : `"${rawEtag}"`
    return { defect: res.data, etag: quotedEtag }
  },

  /**
   * [SWG-034] POST /api/v1/projects/{projectId}/defects/{defectId}/assessments
   * Đánh giá / Cập nhật phân loại và mức độ nghiêm trọng của khiếm khuyết
   */
  async assessDefect(
    projectId: string,
    defectId: string,
    payload: {
      defectTypeCode: string
      customTypeLabel?: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      reason: string
      evidenceIds?: string[]
    }
  ): Promise<BackendDefectDto> {
    await ensureBearerToken()
    const { etag } = await this.getDefectById(projectId, defectId)

    let evidenceIds = payload.evidenceIds || []
    if (evidenceIds.length === 0) {
      evidenceIds = await this.resolveDefectEvidenceIds(projectId, defectId)
    }

    const res = await apiClient.post<BackendDefectDto>(
      `/projects/${projectId}/defects/${defectId}/assessments`,
      {
        defectTypeCode: payload.defectTypeCode,
        causeCategoryCode: null,
        severity: payload.severity,
        reason: payload.reason.trim() || 'Cập nhật phân loại và mức độ nghiêm trọng khiếm khuyết',
        evidenceIds
      },
      {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
          'If-Match': etag
        }
      }
    )
    return res.data
  },

  /**
   * [SWG-035] POST /api/v1/projects/{projectId}/defects/{defectId}/verification-decisions
   * Ra quyết định xác minh khiếm khuyết (CONFIRM | REJECT)
   */
  async verifyDefect(
    projectId: string,
    defectId: string,
    payload: {
      decision: 'CONFIRM' | 'REJECT'
      verificationMethod: 'EXISTING_EVIDENCE' | 'FIELD' | 'DRONE'
      reason: string
      evidenceIds?: string[]
      fieldTaskId?: string | null
      fieldSubmissionId?: string | null
      fieldContentHash?: string | null
    }
  ): Promise<BackendDefectDto> {
    await ensureBearerToken()
    const { etag } = await this.getDefectById(projectId, defectId)

    let evidenceIds = payload.evidenceIds || []
    if (evidenceIds.length === 0) {
      evidenceIds = await this.resolveDefectEvidenceIds(projectId, defectId)
    }

    const res = await apiClient.post<BackendDefectDto>(
      `/projects/${projectId}/defects/${defectId}/verification-decisions`,
      {
        decision: payload.decision,
        verificationMethod: payload.verificationMethod,
        evidenceIds,
        reason: payload.reason.trim() || 'Xác minh tình trạng khiếm khuyết thực tế',
        fieldTaskId: payload.fieldTaskId || null,
        fieldSubmissionId: payload.fieldSubmissionId || null,
        fieldContentHash: payload.fieldContentHash || null
      },
      {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
          'If-Match': etag
        }
      }
    )
    return res.data
  },

  /**
   * Tự động tra cứu evidenceRefs hợp lệ từ nguồn liên kết của Defect (SWG-018)
   */
  async resolveDefectEvidenceIds(projectId: string, defectId: string): Promise<string[]> {
    // Bằng chứng phải đến từ nguồn liên kết thật của defect; không có thì báo lỗi, không dùng ID cứng.
    const detections = await this.getAllProjectAiDetections(projectId)
    const evidence = detections
      .filter((d) => d.defectId && d.defectId.toLowerCase() === defectId.toLowerCase() && d.frameFileId)
      .map((d) => d.frameFileId as string)
    if (evidence.length === 0) {
      throw new Error('Chưa tìm thấy bằng chứng (evidence) của khiếm khuyết này trên máy chủ.')
    }
    return Array.from(new Set(evidence))
  },

  /**
   * [SWG-242] GET /api/v1/files/{fileId}
   * Lấy metadata tệp tin (frameFileId / videoFileId) từ CSDL Backend
   */
  async getFileMetadata(fileId: string): Promise<FileMetadataDto> {
    await ensureBearerToken()
    const res = await apiClient.get<FileMetadataDto>(`/files/${fileId}`)
    return res.data
  },

  /**
   * [SWG-243] GET /api/v1/files/{fileId}/content
   * Tải nội dung nhị phân của tệp ảnh AI / hiện trường qua Bearer Token và tạo Object URL
   */
  async getFileContentUrl(fileId: string): Promise<string | null> {
    if (!fileId || !/^[0-9a-fA-F-]{36}$/.test(fileId)) return null
    if (fileBlobUrlCache.has(fileId)) {
      return fileBlobUrlCache.get(fileId)!
    }
    await ensureBearerToken()
    try {
      const res = await apiClient.get<Blob>(`/files/${fileId}/content`, {
        responseType: 'blob'
      })
      if (res.data) {
        const url = URL.createObjectURL(res.data)
        fileBlobUrlCache.set(fileId, url)
        return url
      }
    } catch (err: any) {
      if (err?.response?.status !== 403 && err?.response?.status !== 404) {
        console.warn(`[surveyService] Không tải được nội dung file ${fileId}:`, err)
      }
    }
    return null
  },

  /**
   * Lấy toàn bộ danh sách ứng viên AI từ tất cả các AI Mock Runs SUCCEEDED trong CSDL
   * Phục vụ Hộp thư tiếp nhận lỗi (/pm/ai-inbox) và Thẩm định chi tiết (/pm/defects/:id/verify-a)
   */
  async getAllProjectAiDetections(targetProjectId?: string): Promise<AIDetectionItem[]> {
    const actor = useAuthStore.getState().user

    let projects = await projectService.fetchProjects()
    if (targetProjectId) {
      projects = projects.filter((p) => p.id === targetProjectId || p.code === targetProjectId)
    }
    if (!projects || projects.length === 0) {
      return []
    }

    const allItems: AIDetectionItem[] = []
    let globalIdx = 0

    for (const proj of projects) {
      try {
        const projectDefects = await this.getProjectDefects(proj.id)
        const defectMap = new Map<string, BackendDefectDto>()
        for (const df of projectDefects) {
          defectMap.set(df.id.toLowerCase(), df)
        }
        const runs = await this.readSurveyPage(`/projects/${proj.id}/ai-mock-runs`)
        for (const run of runs.filter((r) => r.status === 'SUCCEEDED')) {
          const resultRes = await apiClient.get<{ detections: RunDetection[] }>(
            `/projects/${proj.id}/ai-mock-runs/${run.id}/result`
          )
          for (const d of resultRes.data?.detections || []) {
            globalIdx += 1
            allItems.push(await buildDetectionItem(proj.id, run.id, d, globalIdx, defectMap))
          }
        }
      } catch (err) {
        throw err
      }
    }

    if (useAuthStore.getState().user !== actor) throw new Error('Phiên đã thay đổi; bỏ danh sách AI cũ.')
    return Array.from(new Map(allItems.map(item => [`${item.projectId}:${item.id}`.toLowerCase(), item])).values())
  },

  /**
   * Yêu cầu bay bổ sung để bù độ phủ trắc địa
   */
  async requestReFlight(
    surveyId: string,
    payload: {
      note: string
      targetKm?: string
      operatorName?: string
      surveyType?: 'AD_HOC' | 'PERIODIC'
      dueDate?: string
      projectId?: string
    }
  ): Promise<{ success: boolean; taskId: string }> {
    void surveyId; void payload
    throwLegacyBlocked()
  },

  /**
   * Khóa Baseline đoạn đường sau khi thẩm định 100% (API-057 / POST /baseline-selections)
   */
  async lockBaseline(surveyId: string, projectId?: string): Promise<boolean> {
    void surveyId; void projectId
    throwLegacyBlocked()
  },

  /**
   * Đặt lại mock data ban đầu
   */
  async resetSurveys(): Promise<void> {
    throwLegacyBlocked()
  }

}
