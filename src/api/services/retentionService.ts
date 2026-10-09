import { LegalHoldProject, DataDeletionRequest } from '../../types/domain'

// Dữ liệu gói hồ sơ công trình bảo hành trong bộ nhớ (In-Memory Mock Database)
const INITIAL_PROJECTS: LegalHoldProject[] = [
  {
    project_id: 'proj-01',
    project_code: 'QL1A-P2',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    warranty_end_date: '31/12/2026',
    is_warranty_expired: false,
    years_since_warranty_end: 0,
    is_legal_hold: false
  },
  {
    project_id: 'proj-02',
    project_code: 'QL1A-P1',
    project_name: 'QL1A - Giai đoạn 1 (Km 990 - Km 1020)',
    warranty_end_date: '01/01/2021',
    is_warranty_expired: true,
    years_since_warranty_end: 5.6,
    is_legal_hold: true,
    hold_reason: 'Thanh tra đột xuất hồ sơ hoàn công và kiểm tra chất lượng khe co giãn BTXM',
    hold_authority: 'Ban QLDA Thăng Long & Cục Đường Bộ Việt Nam',
    hold_reference: 'Công văn số 8492/BGTVT-TTr',
    hold_since: '18/08/2026 09:30:14'
  },
  {
    project_id: 'proj-03',
    project_code: 'CTBN-XL03',
    project_name: 'Cao tốc Bắc - Nam XL-03 (Km 14 - Km 22)',
    warranty_end_date: '15/10/2028',
    is_warranty_expired: false,
    years_since_warranty_end: 0,
    is_legal_hold: false
  },
  {
    project_id: 'proj-04',
    project_code: 'BT-KM990',
    project_name: 'Sửa chữa bảo trì Km 990 - 1000',
    warranty_end_date: '10/05/2020',
    is_warranty_expired: true,
    years_since_warranty_end: 6.4,
    is_legal_hold: false
  }
]

// Dữ liệu danh sách yêu cầu xóa hồ sơ lưu trữ
const INITIAL_REQUESTS: DataDeletionRequest[] = [
  {
    id: 'req-01',
    request_code: '#REQ-DEL-2026-01',
    project_id: 'proj-02',
    project_name: 'QL1A - Giai đoạn 1 (Km 990 - Km 1020)',
    requested_by_id: 'usr-pm-01',
    requested_by_name: 'Đỗ Quốc Hoàng (Chỉ huy trưởng)',
    requested_at: '24/08/2026 10:15:00',
    data_type: 'Ảnh thô Drone phân giải cao (RAW)',
    data_description: 'Ảnh thô độ phân giải cao đợt bay quét QL1A Km 990 - Km 1010',
    data_size_gb: 420,
    warranty_end_date: '01/01/2021',
    years_since_warranty: 5.6,
    is_eligible_5years: true,
    status: 'PENDING_APPROVAL',
    blocked_by_legal_hold: true,
    justification_notes: 'Dự án đã kết thúc bảo hành trên 5 năm theo quy định. Đã hoàn thành sao lưu nén lưu kho lạnh.'
  },
  {
    id: 'req-02',
    request_code: '#REQ-DEL-2026-02',
    project_id: 'proj-04',
    project_name: 'Sửa chữa bảo trì Km 990 - 1000',
    requested_by_id: 'usr-pm-01',
    requested_by_name: 'Đỗ Quốc Hoàng (Chỉ huy trưởng)',
    requested_at: '20/08/2026 14:30:00',
    data_type: 'Video hành trình tuần đường',
    data_description: 'Video hành trình xe chuyên dụng kiểm tra mặt đường định kỳ năm 2019',
    data_size_gb: 180,
    warranty_end_date: '10/05/2020',
    years_since_warranty: 6.4,
    is_eligible_5years: true,
    status: 'APPROVED_PURGED',
    blocked_by_legal_hold: false,
    justification_notes: 'Hồ sơ đã hoàn tất thanh lý hợp đồng và lưu trữ trên 6 năm. Đã được Giám sát phê duyệt giải phóng.'
  }
]

// State trong bộ nhớ
let inMemoryProjects: LegalHoldProject[] = [...INITIAL_PROJECTS]
let inMemoryRequests: DataDeletionRequest[] = [...INITIAL_REQUESTS]

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
        throw new Error('Không thể phê duyệt: Dự án đang có lệnh phong tỏa pháp lý (Legal Hold)')
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
   * Supervisor bật / tắt lệnh phong tỏa pháp lý (Legal Hold) cho dự án
   */
  async toggleLegalHold(projectId: string): Promise<LegalHoldProject> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const index = inMemoryProjects.findIndex((p) => p.project_id === projectId)
    if (index === -1) {
      throw new Error('Không tìm thấy dự án')
    }

    const current = inMemoryProjects[index]
    const nextHoldState = !current.is_legal_hold

    current.is_legal_hold = nextHoldState
    if (nextHoldState) {
      current.hold_reason = 'Thanh tra đột xuất hồ sơ hoàn công và kiểm tra chất lượng kết cấu'
      current.hold_authority = 'Thanh tra Bộ GTVT'
      current.hold_reference = 'Công văn số 8492/BGTVT-TTr'
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
        return { ...req, blocked_by_legal_hold: nextHoldState }
      }
      return req
    })

    inMemoryProjects[index] = { ...current }
    return { ...current }
  }
}
