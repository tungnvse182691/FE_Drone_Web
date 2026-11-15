import { workflowCollection } from './workflowCollection'
import { apiClient } from '../client'
import { LegalHoldProject, DataDeletionRequest } from '../../types/domain'

// Dữ liệu gói hồ sơ công trình bảo hành trong bộ nhớ (In-Memory Mock Database)
// 100% DỮ LIỆU THẬT CSDL BACKEND DOCKER - KHÔNG DÙNG MOCK DATA
const INITIAL_PROJECTS: LegalHoldProject[] = []
let inMemoryProjects: LegalHoldProject[] = []
let inMemoryRequests: DataDeletionRequest[] = []

export interface CreateDeletionPayload {
  projectId: string
  dataType: string
  sizeGb: number
  justification: string
  requestedById: string
  requestedByName: string
}

export const retentionService = {
  /**
   * Lấy danh sách các gói hồ sơ công trình và trạng thái lưu trữ pháp lý
   */
  async getRetentionProjects(): Promise<LegalHoldProject[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    return [...inMemoryProjects]
  },

  /**
   * Lấy danh sách các yêu cầu xóa dữ liệu (GET /retention/deletion-requests)
   */
  async getDeletionRequests(): Promise<DataDeletionRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    return [...inMemoryRequests]
  },

  /**
   * Tra cứu chi tiết một yêu cầu xóa dữ liệu (GET /retention/deletion-requests/{requestId})
   * Ánh xạ theo operation_catalog.md dòng 135: Cả PM và SUPERVISOR đều có quyền tra cứu
   */
  async getDeletionRequest(requestId: string): Promise<DataDeletionRequest | null> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const found = inMemoryRequests.find((r) => r.id === requestId)
    return found ? { ...found } : null
  },

  /**
   * PM lập yêu cầu xóa dữ liệu hồ sơ (POST /retention/deletion-requests)
   * Ánh xạ theo operation_catalog.md dòng 118
   */
  async requestDeletion(payload: CreateDeletionPayload): Promise<DataDeletionRequest> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Supervisor phê duyệt hoặc từ chối yêu cầu xóa (POST /retention/deletion-requests/{requestId}/decision)
   * Ánh xạ theo operation_catalog.md dòng 119
   */
  async decideDeletion(
    requestId: string,
    decision: 'APPROVE' | 'REJECT',
    reason?: string
  ): Promise<DataDeletionRequest> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Supervisor thiết lập lệnh phong tỏa pháp lý (Legal Hold) cho dự án (PUT /projects/{projectId}/legal-hold)
   * Ánh xạ theo operation_catalog.md dòng 120 (LegalHoldRequest: { enabled, reason })
   */
  async setLegalHold(
    projectId: string,
    payload: {
      enabled: boolean
      reason?: string
      authority?: string
      reference?: string
    }
  ): Promise<LegalHoldProject> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Supervisor bật / tắt nhanh lệnh phong tỏa pháp lý (Legal Hold)
   */
  async toggleLegalHold(projectId: string): Promise<LegalHoldProject> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  // =========================================================================
  // CANONICAL RETENTION & LEGAL HOLD API CANDIDATE3 (CỤM L4 - SPEC 17_10)
  // =========================================================================

  /**
   * Đọc danh sách đánh giá lưu trữ hồ sơ (GET /api/v1/projects/{projectId}/retention/evaluations)
   */
  async getRetentionEvaluations(projectId: string, signal?: AbortSignal): Promise<RetentionEvaluation[]> {
    return workflowCollection<RetentionEvaluation>(`/projects/${projectId}/retention/evaluations`, projectId, signal)
  },

  /**
   * Tạo đánh giá lưu trữ hồ sơ công trình (POST /api/v1/projects/{projectId}/retention/evaluations)
   */
  async createRetentionEvaluation(projectId: string, request: any): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Lấy chi tiết đánh giá lưu trữ hồ sơ (GET /api/v1/projects/{projectId}/retention/evaluations/{id})
   */
  async getRetentionEvaluationDetail(projectId: string, id: string, signal?: AbortSignal): Promise<RetentionEvaluationDetail> {
    const res = await apiClient.get<RetentionEvaluationDetail>(`/projects/${projectId}/retention/evaluations/${id}`, { signal })
    if (res.data?.id !== id || res.data.projectId !== projectId || !Array.isArray(res.data.items)) throw new Error('Kết quả đánh giá lưu trữ sai phạm vi hoặc thiếu danh sách tệp.')
    return res.data
  },

  /**
   * Tạo lệnh phong tỏa pháp lý Legal Hold (POST /api/v1/retention/holds)
   */
  async createLegalHoldApi(request: any): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Giải tỏa lệnh phong tỏa pháp lý Legal Hold (POST /api/v1/retention/holds/{id}/release)
   */
  async releaseLegalHoldApi(holdId: string, version: string): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  }
}

export interface RetentionEvaluation {
  id: string; projectId: string; status?: string | null; createdAt: string
  evaluatedAt?: string | null; policyVersion?: string | null; version?: string | null
}
export interface RetentionEvaluationDetail extends RetentionEvaluation {
  items: Array<{fileId: string; eligibility?: string | null; reasonCodes?: string[] | null; eligibleAfter?: string | null; isCurrent: boolean}>
  nextCursor?: string | null
}
