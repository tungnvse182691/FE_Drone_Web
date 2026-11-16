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
    await new Promise((resolve) => setTimeout(resolve, 120))
    const proj = inMemoryProjects.find((p) => p.project_id === payload.projectId)
    const isLegalHold = proj?.is_legal_hold || false
    const isEligible5Y = (proj?.years_since_warranty_end || 0) >= 5

    const newReq: DataDeletionRequest = {
      id: `req-${Date.now()}`,
      request_code: `#REQ-DEL-2026-0${inMemoryRequests.length + 1}`,
      project_id: payload.projectId,
      project_name: proj?.project_name || 'Dự án chỉ định',
      requested_by_id: payload.requestedById,
      requested_by_name: payload.requestedByName,
      requested_at: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      data_type: payload.dataType,
      data_description: `Yêu cầu giải phóng dữ liệu: ${payload.dataType} dung lượng ${payload.sizeGb} GB`,
      data_size_gb: payload.sizeGb,
      warranty_end_date: proj?.warranty_end_date || 'N/A',
      years_since_warranty: proj?.years_since_warranty_end || 0,
      is_eligible_5years: isEligible5Y,
      status: 'PENDING_APPROVAL',
      blocked_by_legal_hold: isLegalHold,
      justification_notes: payload.justification
    }

    inMemoryRequests = [newReq, ...inMemoryRequests]
    return newReq
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
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryRequests.findIndex((r) => r.id === requestId)
    if (index === -1) {
      throw new Error('Không tìm thấy yêu cầu xóa dữ liệu')
    }

    const current = inMemoryRequests[index]
    if (decision === 'APPROVE') {
      if (current.blocked_by_legal_hold) {
        throw new Error('Không thể phê duyệt: Dự án đang có lệnh phong tỏa pháp lý')
      }
      if (!current.is_eligible_5years) {
        throw new Error('Không thể phê duyệt: Dữ liệu chưa đủ thời hạn 5 năm sau bảo hành')
      }
      current.status = 'APPROVED_PURGED'
    } else {
      current.status = 'REJECTED'
      current.rejection_reason = reason || 'Chưa đủ điều kiện pháp lý'
    }

    inMemoryRequests[index] = { ...current }
    return { ...current }
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
    await new Promise((resolve) => setTimeout(resolve, 80))
    const index = inMemoryProjects.findIndex((p) => p.project_id === projectId)
    if (index === -1) {
      throw new Error('Không tìm thấy dự án')
    }

    const current = inMemoryProjects[index]
    current.is_legal_hold = payload.enabled

    if (payload.enabled) {
      current.hold_reason = payload.reason || 'Yêu cầu phong tỏa phục vụ thanh tra, kiểm toán công trình'
      current.hold_authority = payload.authority || 'Cơ quan có thẩm quyền'
      current.hold_reference = payload.reference || 'Văn bản / Quyết định thanh tra'
      current.hold_since = new Date().toLocaleString('vi-VN')
    } else {
      current.hold_reason = undefined
      current.hold_authority = undefined
      current.hold_reference = undefined
      current.hold_since = undefined
    }

    // Cập nhật cờ blocked_by_legal_hold cho các yêu cầu xóa tương ứng
    inMemoryRequests = inMemoryRequests.map((req) => {
      if (req.project_id === projectId) {
        return { ...req, blocked_by_legal_hold: payload.enabled }
      }
      return req
    })

    inMemoryProjects[index] = { ...current }
    return { ...current }
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
    if (!projectId || projectId === 'ALL') return []
    try {
      const res = await apiClient.get(`/projects/${projectId}/retention/evaluations`, { signal })
      return res.data?.items || []
    } catch (err) {
      console.warn('Lỗi đọc retention evaluations từ API:', err)
      return []
    }
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
