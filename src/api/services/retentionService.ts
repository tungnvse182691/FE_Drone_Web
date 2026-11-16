import {workflowCollection} from './workflowCollection'
import { apiClient } from '../client'
import { LegalHoldProject, DataDeletionRequest } from '../../types/domain'

// Dữ liệu gói hồ sơ công trình bảo hành trong bộ nhớ (In-Memory Mock Database)
// 100% DỮ LIỆU THẬT CSDL BACKEND DOCKER - KHÔNG DÙNG MOCK DATA
const INITIAL_PROJECTS: LegalHoldProject[] = []
let inMemoryProjects: LegalHoldProject[] = []

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
    throw new Error('Chưa có nguồn tổng hợp trạng thái phong tỏa và đề nghị hủy theo dự án. Dùng đánh giá lưu trữ để đọc điều kiện từng tệp.')
  },

  /**
   * Lấy danh sách các yêu cầu xóa dữ liệu (GET /retention/deletion-requests)
   */
  async getDeletionRequests(): Promise<DataDeletionRequest[]> {
    throw new Error('Chưa có nguồn tổng hợp trạng thái phong tỏa và đề nghị hủy theo dự án. Dùng đánh giá lưu trữ để đọc điều kiện từng tệp.')
  },

  /**
   * Tra cứu chi tiết một yêu cầu xóa dữ liệu (GET /retention/deletion-requests/{requestId})
   * Ánh xạ theo operation_catalog.md dòng 135: Cả PM và SUPERVISOR đều có quyền tra cứu
   */
  async getDeletionRequest(requestId: string): Promise<DataDeletionRequest | null> {
    throw new Error('Chưa có nguồn tổng hợp trạng thái phong tỏa và đề nghị hủy theo dự án. Dùng đánh giá lưu trữ để đọc điều kiện từng tệp.')
  },

  /**
   * PM lập yêu cầu xóa dữ liệu hồ sơ (POST /retention/deletion-requests)
   * Ánh xạ theo operation_catalog.md dòng 118
   */
  async requestDeletion(payload: CreateDeletionPayload): Promise<DataDeletionRequest> {
    throw new Error('Thao tác cũ chưa được hỗ trợ theo hồ sơ nguồn hiện tại; chưa có thay đổi nào được gửi.')
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
    throw new Error('Thao tác cũ chưa được hỗ trợ theo hồ sơ nguồn hiện tại; chưa có thay đổi nào được gửi.')
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
    throw new Error('Thao tác cũ chưa được hỗ trợ theo hồ sơ nguồn hiện tại; chưa có thay đổi nào được gửi.')
  },

  /**
   * Supervisor bật / tắt nhanh lệnh phong tỏa pháp lý (Legal Hold)
   */
  async toggleLegalHold(projectId: string): Promise<LegalHoldProject> {
    const found = inMemoryProjects.find((p) => p.project_id === projectId)
    const nextState = !found?.is_legal_hold
    return this.setLegalHold(projectId, { enabled: nextState })
  },

  // =========================================================================
  // CANONICAL RETENTION & LEGAL HOLD API CANDIDATE3 (CỤM L4 - SPEC 17_10)
  // =========================================================================

  /**
   * Đọc danh sách đánh giá lưu trữ hồ sơ (GET /api/v1/projects/{projectId}/retention/evaluations)
   */
  async getRetentionEvaluations(projectId: string, signal?: AbortSignal): Promise<any[]> {
    return workflowCollection<{id:string;projectId:string}>(`/projects/${projectId}/retention/evaluations`,projectId,signal)
  },

  /**
   * Tạo đánh giá lưu trữ hồ sơ công trình (POST /api/v1/projects/{projectId}/retention/evaluations)
   */
  async createRetentionEvaluation(projectId: string, request: any): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(`/projects/${projectId}/retention/evaluations`, request, {
      headers: { 'Idempotency-Key': key }
    })
    return res.data
  },

  /**
   * Lấy chi tiết đánh giá lưu trữ hồ sơ (GET /api/v1/projects/{projectId}/retention/evaluations/{id})
   */
  async getRetentionEvaluationDetail(projectId: string, id: string, signal?: AbortSignal): Promise<any> {
    const res = await apiClient.get(`/projects/${projectId}/retention/evaluations/${id}`, { signal })
    if(res.data?.id!==id||res.data.projectId!==projectId)throw Error('Kết quả đánh giá sai phạm vi dự án.')
    return res.data
  },

  /**
   * Tạo lệnh phong tỏa pháp lý Legal Hold (POST /api/v1/retention/holds)
   */
  async createLegalHoldApi(request: any): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post('/retention/holds', request, {
      headers: { 'Idempotency-Key': key }
    })
    return res.data
  },

  /**
   * Giải tỏa lệnh phong tỏa pháp lý Legal Hold (POST /api/v1/retention/holds/{id}/release)
   */
  async releaseLegalHoldApi(holdId: string, version: string): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(`/retention/holds/${holdId}/release`, {}, {
      headers: {
        'Idempotency-Key': key,
        'If-Match': version.startsWith('"') ? version : `"${version}"`
      }
    })
    return res.data
  }
}
