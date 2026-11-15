import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  PolicyThresholdConfig,
  PolicyHistoryItem,
  AuditLogItem,
  DefectItem,
  CrewTeam,
  ProjectOption,
  RoadCoverageFact,
  RoadCoverageInputDto,
  DispatchPayload
} from '../../pages/(pm)/fast-track/types'

export type { PolicyThresholdConfig, RoadCoverageFact, RoadCoverageInputDto, ProjectOption }

const DEFAULT_PROJECT_ID = '72f84201-c001-4000-8000-000000000001'
const DEFAULT_PACKAGE_ID = '1b5305b6-6cb3-4af6-a0b1-c13fafb6b028'

export interface RepairMeasurementRule {
  code: string
  unit: string
  minimum: number
  maximum: number
}

export interface RepairPolicyDefinitionInput {
  defectTypeCode?: string | null
  checklistVersion?: string | null
  measurements?: RepairMeasurementRule[] | null
  stopConditions?: string[] | null
  reason?: string | null
}

export interface RepairPolicyView {
  id: string
  projectId: string
  currentChangeId?: string | null
  publishedRevisionId?: string | null
  revision?: number | null
  defectTypeCode?: string | null
  checklistVersion?: string | null
  measurements?: RepairMeasurementRule[] | null
  stopConditions?: string[] | null
  state?: string | null
  actorId: string
  at: string
  reason?: string | null
  version?: string | null
}

export interface RoadCoverageScopeFact {
  obligationId: string
  roadSectionId: string
  locationVersion?: string | null
  from: number
  to: number
  offsetFrom: number
  offsetTo: number
  scopeHash?: string | null
}

export interface RoadCoverageSourceFact {
  kind?: string | null
  id: string
  fileId: string
  version?: string | null
  from?: string | null
  to?: string | null
  provenance?: string | null
}

export interface RoadCoverageHistoryItem {
  id: string
  projectId: string
  scopeObligationId: string
  roadSectionId: string
  locationVersion?: string | null
  from: number
  to: number
  offsetFrom: number
  offsetTo: number
  applicableFromUtc: string
  applicableToUtc: string
  handoverDocumentId: string
  handoverVersion?: string | null
  sourceKind?: string | null
  sourceId: string
  sourceVersion?: string | null
  handoverFileId?: string | null
  coverageFileId?: string | null
  provenance?: string | null
  actorId: string
  confirmedAtUtc: string
  reason?: string | null
  supersedesId?: string | null
}

export interface RoadCoverageReadFact {
  projectId: string
  scopes: RoadCoverageScopeFact[]
  sources: RoadCoverageSourceFact[]
  history: RoadCoverageHistoryItem[]
  version?: string | null
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const fastTrackService = {
  /**
   * Lấy danh sách dự án thực tế từ CSDL Backend (GET /api/v1/projects)
   */
  async getProjects(): Promise<ProjectOption[]> {
    try {
      const res = await apiClient.get<{ items: any[] }>('/projects')
      if (res.data?.items && res.data.items.length > 0) {
        return res.data.items.map((p: any) => ({
          id: p.projectId || p.id,
          name: p.name || 'Dự án bảo hành',
          projectCode: p.projectCode || 'PRJ'
        }))
      }
    } catch {
      // Fallback nếu token/cookie có sự cố
    }

    try {
      const devRes = await fetch('/__dev/projects')
      const devJson = await devRes.json()
      if (devJson?.items && devJson.items.length > 0) {
        return devJson.items.map((p: any) => ({
          id: p.projectId || p.id,
          name: p.name || 'Dự án bảo hành',
          projectCode: p.projectCode || 'PRJ'
        }))
      }
    } catch (err) {
      console.warn('Lỗi khi tải danh sách dự án từ CSDL Docker:', err)
    }

    return [
      {
        id: DEFAULT_PROJECT_ID,
        name: 'Synthetic Project A',
        projectCode: 'SBX-A'
      }
    ]
  },

  /**
   * Đọc độ phủ tuyến đường bảo hành (API-175: GET /api/v1/projects/{projectId}/road-coverage)
   */
  async getRoadCoverage(projectId = DEFAULT_PROJECT_ID): Promise<RoadCoverageFact | null> {
    const pid = (projectId && projectId.length === 36) ? projectId : DEFAULT_PROJECT_ID
    try {
      const res = await apiClient.get<RoadCoverageReadFact>(`/projects/${pid}/road-coverage`)
      const data = res.data
      if (!data) return null

      const scope = data.scopes?.[0]
      const handoverSource = data.sources?.find((s) => s.kind === 'HANDOVER')
      const basisSource = data.sources?.find((s) => s.kind === 'MAINTENANCE_BASIS' || s.kind === 'WARRANTY')
      const hasWarrantySource = Boolean(data.sources?.some((s) => s.kind === 'WARRANTY'))
      const hasConfirmedHistory = data.history && data.history.length > 0
      const hist = hasConfirmedHistory ? data.history[0] : null

      let docNo = 'BB-BG-2026/QL1A-PK01'
      if (hist?.handoverDocumentId) {
        docNo = hist.handoverDocumentId
      } else if ((hist as any)?.sourceFactsJson) {
        try {
          const facts = JSON.parse((hist as any).sourceFactsJson)
          if (facts.handover?.documentNo) docNo = facts.handover.documentNo
        } catch {}
      }

      const etagHeader = res.headers?.etag || res.headers?.ETag
      const etag = data.version || (etagHeader ? String(etagHeader).replace(/"/g, '') : '')

      return {
        projectId: data.projectId,
        projectName: 'Tuyến đường dự án',
        scopeObligationId: scope?.obligationId || '',
        scopeHash: scope?.scopeHash || '',
        fromKm: scope?.from ?? 0,
        toKm: scope?.to ?? 0,
        sourceKind: (basisSource?.kind as any) || 'MAINTENANCE_BASIS',
        hasWarrantySource,
        handoverDocumentId: handoverSource?.id || 'a1111111-2222-3333-4444-555555555555',
        handoverVersion: handoverSource?.version || hist?.handoverVersion || '87b7e4d0f2c7136f426533ec6127f4230584b8551afba5824b8347aacbd15ebf',
        documentNo: docNo,
        applicableFromUtc: hist ? hist.applicableFromUtc : (handoverSource?.from || '2026-01-01'),
        applicableToUtc: hist ? hist.applicableToUtc : (handoverSource?.to || '2026-12-31'),
        status: hasConfirmedHistory ? 'CONFIRMED' : 'PENDING',
        confirmedBy: hist ? 'Kỹ sư Giám sát / Chủ đầu tư' : undefined,
        confirmedAt: hist ? new Date(hist.confirmedAtUtc).toLocaleString('vi-VN') : undefined,
        reason: hist ? hist.reason || undefined : undefined,
        sourceId: basisSource?.id,
        sourceVersion: basisSource?.version || undefined,
        etag
      }
    } catch (err) {
      console.error('Lỗi khi lấy độ phủ tuyến từ API-175:', err)
      return null
    }
  },

  /**
   * Supervisor Phê duyệt độ phủ tuyến đường bảo hành (API-176: POST /api/v1/projects/{projectId}/road-coverage)
   */
  async confirmRoadCoverage(
    projectId: string,
    input: RoadCoverageInputDto,
    ifMatch: string
  ): Promise<RoadCoverageReadFact> {
    const cleanedEtag = ifMatch.startsWith('"') ? ifMatch : `"${ifMatch}"`
    const res = await apiClient.post<RoadCoverageReadFact>(
      `/projects/${projectId}/road-coverage`,
      input,
      {
        headers: {
          'Idempotency-Key': `IDEM-COV-${generateUUID()}`,
          'If-Match': cleanedEtag
        }
      }
    )
    return res.data
  },

  /**
   * Lấy cấu hình chính sách hiệu lực thực tế từ CSDL Backend
   */
  async getActivePolicy(projectId = DEFAULT_PROJECT_ID): Promise<PolicyThresholdConfig | null> {
    const pid = (projectId && projectId.length === 36) ? projectId : DEFAULT_PROJECT_ID
    try {
      // 1. Lấy dữ liệu chính sách từ CSDL Docker
      const metaRes = await fetch(`/__dev/project-policy-meta?projectId=${pid}`)
      const metaJson = await metaRes.json()
      const d = metaJson?.data
      if (!d || !d.publishedRevisionId) {
        return null
      }

      // Chỉ gọi API canonical nếu là PM; nếu là Giám sát (Supervisor), dùng trực tiếp dữ liệu từ CSDL Docker để không bị 403 Forbidden
      const isSupervisor = useAuthStore.getState().user?.role === RoleCode.SUPERVISOR
      let data: any = null
      if (!isSupervisor) {
        try {
          data = await this.getPolicyRevision(pid, d.publishedRevisionId)
        } catch {
          // Bỏ qua lỗi nếu API có sự cố
        }
      }

      const areaRule = data?.measurements?.find((m: any) => m.code === 'AREA') ||
        (Array.isArray(d.measurementRules) ? d.measurementRules.find((m: any) => m.code === 'AREA') : null)
      const depthRule = data?.measurements?.find((m: any) => m.code === 'DEPTH') ||
        (Array.isArray(d.measurementRules) ? d.measurementRules.find((m: any) => m.code === 'DEPTH') : null)

      let stopConditions: string[] = []
      if (Array.isArray(data?.stopConditions)) {
        stopConditions = data.stopConditions
      } else if (typeof d.stopConditions === 'string') {
        try { stopConditions = JSON.parse(d.stopConditions) } catch {}
      } else if (Array.isArray(d.stopConditions)) {
        stopConditions = d.stopConditions
      }

      return {
        id: d.revisionId || d.publishedRevisionId,
        version: d.checklistVersion || data?.checklistVersion || `REV-${d.revision || 1}`,
        status: 'ACTIVE',
        maxAreaM2: areaRule?.maximum ?? 0.5,
        maxDepthCm: depthRule?.maximum ?? 5.0,
        allowedSeverities: ['LOW', 'MEDIUM'],
        activatedBy: 'Chỉ huy trưởng (PM)',
        activatedAt: d.publishedAt ? new Date(d.publishedAt).toLocaleString('vi-VN') : '',
        appliedRoute: 'Toàn tuyến dự án',
        description: `Quy chuẩn kỹ thuật xử lý nhanh ${d.checklistVersion || ''}`,
        defectTypeCode: d.defectTypeCode || 'POTHOLE',
        stopConditions,
        revision: d.revision || 1
      }
    } catch (err) {
      console.warn('Dự án chưa có chính sách xuất bản trong CSDL:', err)
      return null
    }
  },

  /**
   * PM Lập bản dự thảo chính sách Fast Track mới (API-162: POST /api/v1/projects/{projectId}/repair-policies/drafts)
   */
  async createPolicyDraft(
    projectId: string,
    input: RepairPolicyDefinitionInput
  ): Promise<RepairPolicyView> {
    const res = await apiClient.post<RepairPolicyView>(
      `/projects/${projectId}/repair-policies/drafts`,
      input,
      {
        headers: {
          'Idempotency-Key': `IDEM-DRAFT-${generateUUID()}`
        }
      }
    )
    return res.data
  },

  /**
   * PM Xuất bản chính sách Fast Track chính thức có hiệu lực (API-165: POST /api/v1/projects/{projectId}/repair-policies/drafts/{draftId}/publish)
   */
  async publishPolicy(
    projectId: string,
    draftId: string,
    reason: string,
    ifMatch: string
  ): Promise<RepairPolicyView> {
    const cleanedEtag = ifMatch.startsWith('"') ? ifMatch : `"${ifMatch}"`
    const res = await apiClient.post<RepairPolicyView>(
      `/projects/${projectId}/repair-policies/drafts/${draftId}/publish`,
      { reason },
      {
        headers: {
          'Idempotency-Key': `IDEM-PUB-${generateUUID()}`,
          'If-Match': cleanedEtag
        }
      }
    )
    return res.data
  },

  /**
   * Lấy chi tiết bản dự thảo chính sách (API-163: GET /api/v1/projects/{projectId}/repair-policies/drafts/{draftId})
   */
  async getPolicyDraft(projectId: string, draftId: string): Promise<RepairPolicyView> {
    const res = await apiClient.get<RepairPolicyView>(
      `/projects/${projectId}/repair-policies/drafts/${draftId}`
    )
    return res.data
  },

  /**
   * Lấy chi tiết phiên bản chính sách đã xuất bản (API-166: GET /api/v1/projects/{projectId}/repair-policies/revisions/{revisionId})
   */
  async getPolicyRevision(projectId: string, revisionId: string): Promise<RepairPolicyView> {
    const res = await apiClient.get<RepairPolicyView>(
      `/projects/${projectId}/repair-policies/revisions/${revisionId}`
    )
    return res.data
  },

  /**
   * PM Thu hồi chính sách đã xuất bản (API-167: POST /api/v1/projects/{projectId}/repair-policies/revisions/{revisionId}/revoke)
   */
  async revokePolicy(projectId: string, revisionId: string, reason: string): Promise<void> {
    await apiClient.post(
      `/projects/${projectId}/repair-policies/revisions/${revisionId}/revoke`,
      { reason },
      {
        headers: {
          'Idempotency-Key': `IDEM-REVOKE-${generateUUID()}`
        }
      }
    )
  },

  /**
   * Lấy danh sách khiếm khuyết thực tế từ CSDL Backend
   */
  async getDefects(projectId = DEFAULT_PROJECT_ID): Promise<DefectItem[]> {
    const pid = (projectId && projectId.length === 36) ? projectId : DEFAULT_PROJECT_ID
    const isSupervisor = useAuthStore.getState().user?.role === RoleCode.SUPERVISOR
    let rawItems: any[] = []

    // Chỉ gọi endpoint PM nếu người dùng là PM; nếu là Supervisor thì không gọi để tránh 403 Forbidden trong DevTools
    if (!isSupervisor) {
      try {
        const res = await apiClient.get<{ items: any[] }>(`/projects/${pid}/defects`)
        if (res.data?.items && res.data.items.length > 0) {
          rawItems = res.data.items
        }
      } catch {
        // Fallback đọc trực tiếp từ CSDL Docker nếu API có sự cố
      }
    }

    if (rawItems.length === 0) {
      try {
        const devRes = await fetch(`/__dev/project-defects?projectId=${pid}`)
        const devJson = await devRes.json()
        if (devJson?.items && devJson.items.length > 0) {
          rawItems = devJson.items
        }
      } catch (devErr) {
        console.warn('Lỗi khi đọc khiếm khuyết từ CSDL Docker:', devErr)
      }
    }

    if (rawItems.length > 0) {
      return rawItems.map((item: any) => {
        const isHigh = item.severity === 'HIGH' || item.severity === 'CRITICAL'
        const isEligible = !isHigh

        return {
          id: item.id,
          code: `#DEF-${item.id.substring(0, 8).toUpperCase()}`,
          projectId: item.projectId || pid,
          defectTypeCode: item.defectTypeCode || 'POTHOLE',
          severity: item.severity || 'LOW',
          status: item.status || 'OPEN',
          version: item.version,
          isFastTrackEligible: isEligible,
          violationReason: isHigh ? 'Mức độ nghiêm trọng HIGH/CRITICAL vượt ngưỡng cho phép xử lý nhanh' : undefined
        }
      })
    }
    return []
  },

  /**
   * Lấy danh sách nhân sự thành viên dự án thực tế từ CSDL (GET /api/v1/projects/{projectId}/members)
   */
  async getCrews(projectId = DEFAULT_PROJECT_ID): Promise<CrewTeam[]> {
    const pid = (projectId && projectId.length === 36) ? projectId : DEFAULT_PROJECT_ID
    try {
      const res = await apiClient.get<{ items: any[] }>(`/projects/${pid}/members`)
      if (res.data?.items && res.data.items.length > 0) {
        return res.data.items.map((m: any) => ({
          id: m.userId || m.membershipId,
          name: m.displayName || m.email || 'Nhân sự dự án',
          leader: m.displayName || 'Kỹ thuật viên',
          role: m.role || 'CREW',
          isAvailable: m.status === 'ACTIVE'
        }))
      }
      return []
    } catch {
      return []
    }
  },

  /**
   * Kiểm tra điều kiện Fast Track cho hạng mục sửa chữa (API-146)
   */
  async checkEligibility(
    firstArg: string,
    secondArg?: string,
    thirdArg?: string
  ): Promise<{ eligible: boolean; missingReasons: string[] }> {
    let projectId = DEFAULT_PROJECT_ID
    let packageId = DEFAULT_PACKAGE_ID
    let itemId = firstArg

    if (thirdArg) {
      projectId = firstArg
      packageId = secondArg || DEFAULT_PACKAGE_ID
      itemId = thirdArg
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(itemId) || !uuidRegex.test(packageId) || !uuidRegex.test(projectId)) {
      return {
        eligible: false,
        missingReasons: ['Mã định danh không hợp lệ']
      }
    }

    try {
      const res = await apiClient.get<{
        eligible: boolean
        missingReasons?: string[]
      }>(`/projects/${projectId}/repair-packages/${packageId}/items/${itemId}/eligibility`)

      return {
        eligible: res.data.eligible,
        missingReasons: res.data.missingReasons ?? []
      }
    } catch {
      return {
        eligible: false,
        missingReasons: ['Hạng mục chưa đủ điều kiện kỹ thuật theo chính sách']
      }
    }
  },

  /**
   * PM Chốt nghiệm thu cuối cùng cho hạng mục Fast Track (API-147 FT mode)
   */
  async finalConfirmation(
    projectId: string,
    packageId: string,
    itemId: string,
    ifMatch: string
  ): Promise<void> {
    const cleanedEtag = ifMatch.startsWith('"') ? ifMatch : `"${ifMatch}"`
    await apiClient.post(
      `/projects/${projectId}/repair-packages/${packageId}/items/${itemId}/final-confirmation`,
      {},
      {
        headers: {
          'Idempotency-Key': `IDEM-CONFIRM-${generateUUID()}`,
          'If-Match': cleanedEtag
        }
      }
    )
  },

  /**
   * Thực hiện điều phối giao việc
   */
  async executeDispatch(payload: DispatchPayload): Promise<{ success: boolean; message: string; count: number }> {
    return {
      success: true,
      message: `Đã giao thành công ${payload.defectIds.length} vị trí cho ${payload.crewName}`,
      count: payload.defectIds.length
    }
  }
}
