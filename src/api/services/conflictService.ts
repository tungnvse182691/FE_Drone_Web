import { SyncConflictItem, ResolutionStatus, ConflictType } from '../../types/domain'
import { mockSyncConflicts } from '../../data/mockData'

/**
 * ============================================================================
 * MODULE: conflictService (Phân giải Xung đột Ngoại tuyến Offline Sync BR-16 / D05 / D06 / Q17 / 42A)
 * Giả lập RESTful API bất đồng bộ theo kiến trúc chuẩn của RoadGuard Web Dashboard
 * In-Memory Mock Store (Zero direct localStorage coupling trong UI components)
 * ============================================================================
 */

// In-Memory State khởi tạo từ mockSyncConflicts
let inMemoryConflicts: SyncConflictItem[] = JSON.parse(JSON.stringify(mockSyncConflicts))

export interface ConflictFilterParams {
  filterType?: string
  searchTerm?: string
}

export interface ResolveConflictPayload {
  decision:
    | 'ACCEPT_INCOMING'
    | 'KEEP_SERVER_STATE'
    | 'FORK_NEW_ATTEMPT'
    | 'SUBMIT_RESCUE_TO_SUP'
    | 'AUTHORIZE_RESCUE'
    | 'SUPERVISOR_REJECT_RESCUE'
  reason: string
  decidedBy: string
  decidedByRole: 'PROJECT_MANAGER' | 'SUPERVISOR'
}

export const conflictService = {
  /**
   * Lấy danh sách xung đột ngoại tuyến (GET /api/v1/sync-conflicts)
   */
  async getConflicts(params?: ConflictFilterParams): Promise<SyncConflictItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    let list = [...inMemoryConflicts]

    if (params?.filterType && params.filterType !== 'ALL') {
      if (params.filterType === 'PENDING') {
        list = list.filter((c) => c.status === 'CONFLICT_INTAKE')
      } else if (params.filterType === 'RESCUE') {
        list = list.filter((c) => c.conflict_type === 'DEVICE_RESCUE_PENDING')
      } else if (params.filterType === 'RESOLVED') {
        list = list.filter((c) => c.status !== 'CONFLICT_INTAKE')
      }
    }

    if (params?.searchTerm && params.searchTerm.trim()) {
      const q = params.searchTerm.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.conflict_code.toLowerCase().includes(q) ||
          c.defect_code.toLowerCase().includes(q) ||
          c.chainage.toLowerCase().includes(q) ||
          c.offline_actor.name.toLowerCase().includes(q) ||
          c.offline_actor.team.toLowerCase().includes(q)
      )
    }

    return JSON.parse(JSON.stringify(list))
  },

  /**
   * Lấy chi tiết một hồ sơ xung đột theo ID (GET /api/v1/sync-conflicts/:id)
   */
  async getConflictById(id: string): Promise<SyncConflictItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const item = inMemoryConflicts.find((c) => c.id === id)
    return item ? JSON.parse(JSON.stringify(item)) : null
  },

  /**
   * Thực thi phân giải xung đột theo thẩm quyền (POST /api/v1/sync-conflicts/:id/resolve)
   */
  async resolveConflict(id: string, payload: ResolveConflictPayload): Promise<SyncConflictItem> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryConflicts.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error(`Không tìm thấy hồ sơ xung đột với mã ID: ${id}`)
    }

    const current = inMemoryConflicts[index]
    let nextStatus: ResolutionStatus = 'RESOLVED_ACCEPT_INCOMING'
    let decisionText = 'Chấp thuận bản Hiện trường'
    let nextStatusLabel = 'CHẤP THUẬN HIỆN TRƯỜNG'

    if (current.conflict_type === 'ASSIGNMENT_REASSIGNED') {
      if (payload.decision === 'ACCEPT_INCOMING') {
        nextStatus = 'RESOLVED_ACCEPT_INCOMING'
        decisionText = 'Công nhận kết quả Tổ 02 (Thu hồi Đội 01)'
        nextStatusLabel = 'ĐÃ CÔNG NHẬN (TỔ 02)'
      } else {
        nextStatus = 'RESOLVED_KEEP_SERVER'
        decisionText = 'Từ chối kết quả Tổ 02 (Giữ Đội 01)'
        nextStatusLabel = 'TỪ CHỐI (GIỮ ĐỘI 01)'
      }
    } else if (current.conflict_type === 'POLICY_VERSION_MISMATCH') {
      if (payload.decision === 'ACCEPT_INCOMING') {
        nextStatus = 'RESOLVED_ACCEPT_INCOMING'
        decisionText = 'Đặc cách duyệt Fast Track (v1.8)'
        nextStatusLabel = 'ĐẶC CÁCH FAST TRACK'
      } else {
        nextStatus = 'RESOLVED_KEEP_SERVER'
        decisionText = 'Từ chối Fast Track (Chuyển duyệt đợt v2.2)'
        nextStatusLabel = 'TỪ CHỐI FAST TRACK'
      }
    } else if (current.conflict_type === 'DUPLICATE_WORK_ATTEMPT') {
      if (payload.decision === 'ACCEPT_INCOMING') {
        nextStatus = 'RESOLVED_ACCEPT_INCOMING'
        decisionText = 'Chọn bản đo Máy chính (38mm)'
        nextStatusLabel = 'CHỌN MÁY CHÍNH (38MM)'
      } else if (payload.decision === 'KEEP_SERVER_STATE') {
        nextStatus = 'RESOLVED_KEEP_SERVER'
        decisionText = 'Chọn bản đo Máy phụ (45mm)'
        nextStatusLabel = 'CHỌN MÁY PHỤ (45MM)'
      } else {
        nextStatus = 'RESOLVED_FORK_ATTEMPT'
        decisionText = 'Hợp nhất 2 nguồn đo đạc'
        nextStatusLabel = 'HỢP NHẤT THỦ CÔNG'
      }
    } else if (current.conflict_type === 'AGGREGATE_VERSION_CONFLICT') {
      if (payload.decision === 'FORK_NEW_ATTEMPT') {
        nextStatus = 'RESOLVED_FORK_ATTEMPT'
        decisionText = 'Tạo phụ lục đợt mới (BR-26)'
        nextStatusLabel = 'TẠO PHỤ LỤC ĐỢT MỚI'
      } else {
        nextStatus = 'RESOLVED_KEEP_SERVER'
        decisionText = 'Từ chối số liệu nộp muộn (BR-26)'
        nextStatusLabel = 'TỪ CHỐI NỘP MUỘN'
      }
    } else if (current.conflict_type === 'DEVICE_RESCUE_PENDING') {
      if (payload.decision === 'SUBMIT_RESCUE_TO_SUP') {
        nextStatus = 'CONFLICT_INTAKE'
        decisionText = 'Trình Giám sát ký số cứu hộ (Q17)'
        nextStatusLabel = 'ĐÃ TRÌNH GIÁM SÁT (CHỜ KÝ SỐ)'
      } else if (payload.decision === 'AUTHORIZE_RESCUE') {
        nextStatus = 'RESCUE_AUTHORIZED'
        decisionText = 'Ký số phê duyệt cứu hộ (Q17)'
        nextStatusLabel = 'ĐÃ KÝ SỐ DUYỆT CỨU HỘ'
      } else if (payload.decision === 'SUPERVISOR_REJECT_RESCUE') {
        nextStatus = 'RESCUE_REJECTED'
        decisionText = 'Từ chối gói cứu hộ'
        nextStatusLabel = 'TỪ CHỐI GÓI CỨU HỘ'
      }
    }

    // Tạo mã băm kiểm toán SHA-256 mô phỏng chuẩn giao dịch
    const auditHash = '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase() + '...SHA256'

    const updatedItem: SyncConflictItem = {
      ...current,
      status: nextStatus,
      status_label: nextStatusLabel,
      resolution: {
        decision: decisionText,
        decided_by: payload.decidedBy,
        decided_by_role: payload.decidedByRole,
        decided_at: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' Hôm nay',
        reason: payload.reason.trim() || 'Thực hiện phân giải theo đúng thẩm quyền và hồ sơ kiểm toán TCVN.',
        audit_hash: auditHash
      }
    }

    inMemoryConflicts[index] = updatedItem
    return JSON.parse(JSON.stringify(updatedItem))
  },

  /**
   * Khôi phục toàn bộ danh sách xung đột mẫu ban đầu (POST /api/v1/sync-conflicts/reset)
   */
  async resetConflicts(): Promise<SyncConflictItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    inMemoryConflicts = JSON.parse(JSON.stringify(mockSyncConflicts))
    return JSON.parse(JSON.stringify(inMemoryConflicts))
  }
}
