import { SyncConflictItem } from '../../types/domain'

/**
 * ============================================================================
 * MODULE: conflictService (Phân giải Xung đột Ngoại tuyến Offline Sync BR-16)
 * Máy chủ (BE Candidate3) CHƯA có API xung đột ngoại tuyến cho Web (swagger runtime không có route conflict;
 * xung đột ngoại tuyến thuộc luồng mobile). Service này KHÔNG gọi mạng, KHÔNG dùng middleware /__dev/*, KHÔNG trả dữ liệu giả.
 * ============================================================================
 */

export const CONFLICT_API_UNAVAILABLE_MESSAGE = 'Máy chủ chưa có API xung đột ngoại tuyến cho Web'

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
    | 'REQUEST_ADDITIONAL_EVIDENCE'
  reason: string
  decidedBy: string
  decidedByRole: 'PROJECT_MANAGER' | 'SUPERVISOR'
}

export const conflictService = {
  /** Chưa có endpoint BE: trả danh sách rỗng (UI hiển thị trạng thái chưa có API, không phải "không có xung đột"). */
  async getConflicts(_params?: ConflictFilterParams): Promise<SyncConflictItem[]> {
    return []
  },

  /** Chưa có endpoint BE: không giả vờ phân giải. */
  async resolveConflict(
    _conflictId: string,
    _payload: ResolveConflictPayload
  ): Promise<SyncConflictItem> {
    throw new Error(CONFLICT_API_UNAVAILABLE_MESSAGE)
  }
}
