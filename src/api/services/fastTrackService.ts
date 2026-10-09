import { PolicyThresholdConfig } from '../../types/domain'
import {
  INITIAL_POLICY,
  INITIAL_POLICY_HISTORY,
  INITIAL_AUDIT_LOGS,
  CREW_TEAMS,
  INITIAL_DEFECTS,
  ROUTE_CONFIGS
} from '../../pages/(pm)/fast-track/data'
import {
  PolicyHistoryItem,
  AuditLogItem,
  DefectItem,
  CrewTeam,
  RouteConfig,
  WorkMode
} from '../../pages/(pm)/fast-track/types'

export type { PolicyThresholdConfig }

// ==========================================
// In-Memory Mock Store (Tuân thủ nguyên tắc Zero localStorage, giả lập RESTful API bất đồng bộ)
// ==========================================
let inMemoryPolicy: PolicyThresholdConfig = JSON.parse(JSON.stringify(INITIAL_POLICY))
let inMemoryPolicyHistory: PolicyHistoryItem[] = JSON.parse(JSON.stringify(INITIAL_POLICY_HISTORY))
let inMemoryAuditLogs: AuditLogItem[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS))
let inMemoryDefects: DefectItem[] = JSON.parse(JSON.stringify(INITIAL_DEFECTS))
let inMemoryCrews: CrewTeam[] = JSON.parse(JSON.stringify(CREW_TEAMS))

export interface DispatchPayload {
  defectIds: string[]
  workMode: WorkMode
  crewId: string
  notes?: string
}

export const fastTrackService = {
  /**
   * Lấy cấu hình chính sách Fast Track hiện hành (GET /api/v1/fast-track/policy)
   */
  async getPolicy(): Promise<PolicyThresholdConfig> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    return JSON.parse(JSON.stringify(inMemoryPolicy))
  },

  /**
   * Cập nhật chính sách Fast Track (PUT /api/v1/fast-track/policy)
   */
  async savePolicy(policy: PolicyThresholdConfig): Promise<PolicyThresholdConfig> {
    await new Promise((resolve) => setTimeout(resolve, 120))
    inMemoryPolicy = JSON.parse(JSON.stringify(policy))
    return inMemoryPolicy
  },

  /**
   * Lấy lịch sử các phiên bản chính sách (GET /api/v1/fast-track/policy/history)
   */
  async getPolicyHistory(): Promise<PolicyHistoryItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    return JSON.parse(JSON.stringify(inMemoryPolicyHistory))
  },

  /**
   * Tạo bản thảo chính sách mới (POST /api/v1/fast-track/policy/draft)
   */
  async createPolicyDraft(draft: PolicyHistoryItem): Promise<PolicyHistoryItem> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    inMemoryPolicyHistory = [draft, ...inMemoryPolicyHistory]
    return draft
  },

  /**
   * Kích hoạt phiên bản chính sách (POST /api/v1/fast-track/policy/activate)
   */
  async activatePolicy(
    versionName: string,
    activatedBy: string,
    policyConfig: PolicyThresholdConfig
  ): Promise<PolicyThresholdConfig> {
    await new Promise((resolve) => setTimeout(resolve, 120))
    inMemoryPolicy = JSON.parse(JSON.stringify(policyConfig))
    inMemoryPolicyHistory = inMemoryPolicyHistory.map((item) => {
      if (item.version === versionName) {
        return {
          ...item,
          status: 'ACTIVE' as const,
          activatedBy,
          activatedAt: new Date().toLocaleString('vi-VN')
        }
      }
      if (item.status === 'ACTIVE') {
        return { ...item, status: 'ARCHIVED' as const }
      }
      return item
    })

    // Ghi nhận Audit Log
    inMemoryAuditLogs = [
      {
        title: `Kích hoạt ${versionName} (ACTIVE)`,
        time: new Date().toLocaleString('vi-VN'),
        user: activatedBy,
        hash: `sha256:${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
        note: `Chính sách được kích hoạt thành công cho toàn tuyến ${policyConfig.appliedRoute || 'QL1A'}.`
      },
      ...inMemoryAuditLogs
    ]

    return inMemoryPolicy
  },

  /**
   * Lấy nhật ký thay đổi chính sách (Audit Log) (GET /api/v1/fast-track/audit-logs)
   */
  async getAuditLogs(): Promise<AuditLogItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    return JSON.parse(JSON.stringify(inMemoryAuditLogs))
  },

  /**
   * Lấy danh sách khiếm khuyết theo tuyến đường (GET /api/v1/fast-track/defects)
   */
  async getDefects(routeId?: string): Promise<DefectItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 90))
    if (!routeId || routeId === 'ALL') {
      return JSON.parse(JSON.stringify(inMemoryDefects))
    }
    return inMemoryDefects.filter((d) => d.routeId === routeId)
  },

  /**
   * Lấy danh sách các đội thi công hiện trường (GET /api/v1/crews)
   */
  async getCrews(): Promise<CrewTeam[]> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return JSON.parse(JSON.stringify(inMemoryCrews))
  },

  /**
   * Lấy danh sách cấu hình tuyến đường (GET /api/v1/routes)
   */
  async getRoutes(): Promise<Record<string, RouteConfig>> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return JSON.parse(JSON.stringify(ROUTE_CONFIGS))
  },

  /**
   * Thực hiện điều phối giao việc (POST /api/v1/fast-track/dispatch)
   */
  async executeDispatch(payload: DispatchPayload): Promise<{ success: boolean; message: string; count: number }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const crew = inMemoryCrews.find((c) => c.id === payload.crewId)
    const crewName = crew ? crew.name : 'Đội thi công hiện trường'

    inMemoryDefects = inMemoryDefects.map((d) => {
      if (payload.defectIds.includes(d.id)) {
        return {
          ...d,
          assignedCrew: crewName
        }
      }
      return d
    })

    return {
      success: true,
      message: `Đã giao thành công ${payload.defectIds.length} vị trí cho [${crewName}]`,
      count: payload.defectIds.length
    }
  }
}
