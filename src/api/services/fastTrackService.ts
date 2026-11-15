import { apiClient } from '../client'
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
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  },

  /**
   * Đọc độ phủ tuyến đường bảo hành (API-175: GET /api/v1/projects/{projectId}/road-coverage)
   */
  async getRoadCoverage(projectId = DEFAULT_PROJECT_ID): Promise<RoadCoverageFact | null> {
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  },

  /**
   * Supervisor Phê duyệt độ phủ tuyến đường bảo hành (API-176: POST /api/v1/projects/{projectId}/road-coverage)
   */
  async confirmRoadCoverage(
    projectId: string,
    input: RoadCoverageInputDto,
    ifMatch: string
  ): Promise<RoadCoverageReadFact> {
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  },

  /**
   * Lấy cấu hình chính sách hiệu lực thực tế từ CSDL Backend
   */
  async getActivePolicy(projectId = DEFAULT_PROJECT_ID): Promise<PolicyThresholdConfig | null> {
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  },

  /**
   * PM Lập bản dự thảo chính sách Fast Track mới (API-162: POST /api/v1/projects/{projectId}/repair-policies/drafts)
   */
  async createPolicyDraft(
    projectId: string,
    input: RepairPolicyDefinitionInput
  ): Promise<RepairPolicyView> {
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
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
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
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
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  },

  /**
   * Lấy danh sách khiếm khuyết thực tế từ CSDL Backend
   */
  async getDefects(projectId = DEFAULT_PROJECT_ID): Promise<DefectItem[]> {
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  },

  /**
   * Lấy danh sách nhân sự thành viên dự án thực tế từ CSDL (GET /api/v1/projects/{projectId}/members)
   */
  async getCrews(projectId = DEFAULT_PROJECT_ID): Promise<CrewTeam[]> {
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
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
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  },

  /**
   * Thực hiện điều phối giao việc
   */
  async executeDispatch(payload: DispatchPayload): Promise<{ success: boolean; message: string; count: number }> {
    throw new Error('Luồng cũ chưa nối đủ nguồn chính sách, độ phủ và binding. Mở Điều phối nhanh để đọc hạng mục thật; không điều phối giả.')
  }
}
