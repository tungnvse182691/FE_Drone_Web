import { apiClient } from '../client'
import { personnelService } from './personnelService'

// PM/Supervisor: yêu cầu tiếp nhận nghiệp vụ (BusinessDuty), chỉ định người phụ trách đồng hồ (ClockDuty), bản tóm tắt tuần (H6).
export interface DutyAppointment { [key: string]: unknown }
export interface DutyRequest {
  id: string; projectId: string; kind: string; sourceKind: string; sourceId: string; scopeId: string
  responsibleActorId?: string | null; responsibleRole?: string | null; requestedAt: string
  receivingState: string; waitingSeconds?: number; acknowledgedBy?: string | null; acknowledgedAt?: string | null
  clockId?: string | null; originalDueAt?: string | null; currentDueAt?: string | null; completedAt?: string | null
  version: string; appointments?: DutyAppointment[]
}
export interface DutyClock { id: string; projectId: string; kind: string; targetId: string; currentDueAt: string; overdue: boolean; completedAt?: string | null; appointedActorId?: string | null; appointedRole?: string | null; version: string }
export interface WeeklyDigest { id: string; projectId: string; recipientId?: string; scheduledAtUtc?: string; recoveredAtUtc?: string; pendingAtRecovery?: { clockId: string; targetId: string; kind: string; originEventId?: string; originAtUtc?: string; dueAtRecoveryUtc?: string }[]; recoveryPeriods?: string[] }
export interface DutyProject { projectId: string; projectCode?: string; name?: string }

const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const dutyService = {
  async projects(): Promise<DutyProject[]> {
    const rows: DutyProject[] = []
    let cursor: string | null | undefined
    for (let i = 0; i < 20; i++) {
      const { data } = await apiClient.get<{ items?: DutyProject[]; nextCursor?: string | null }>('/projects', { params: cursor ? { cursor } : undefined })
      if (!Array.isArray(data?.items)) throw new Error('Danh sách dự án sai contract.')
      rows.push(...data.items)
      cursor = data.nextCursor
      if (!cursor) break
    }
    return rows
  },
  /** GET /projects/{p}/receiving-requests (phân trang bằng `continuation`/`after`). */
  async requests(projectId: string): Promise<DutyRequest[]> {
    const rows: DutyRequest[] = []
    let after: string | undefined
    for (let i = 0; i < 20; i++) {
      const { data } = await apiClient.get<{ items?: DutyRequest[]; continuation?: string | null }>(`/projects/${projectId}/receiving-requests`, { params: { limit: 50, after } })
      if (!Array.isArray(data?.items)) throw new Error('Danh sách yêu cầu tiếp nhận sai contract.')
      rows.push(...data.items)
      after = data.continuation || undefined
      if (!after) break
    }
    return rows
  },
  /** GET /projects/{p}/receiving-requests/{id} — dùng version mới nhất cho If-Match. */
  async request(projectId: string, requestId: string): Promise<DutyRequest> {
    const { data } = await apiClient.get<DutyRequest>(`/projects/${projectId}/receiving-requests/${requestId}`)
    if (data?.id !== requestId || !data.version) throw new Error('BE trả yêu cầu tiếp nhận sai ID/version.')
    return data
  },
  /** POST …/receiving-requests/{id}/ack — người chịu trách nhiệm hiện tại xác nhận đã nhận. */
  async ack(projectId: string, requestId: string) {
    const current = await this.request(projectId, requestId)
    return (await apiClient.post(`/projects/${projectId}/receiving-requests/${requestId}/ack`, { claimedDeviceAt: new Date().toISOString() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(current.version) } })).data
  },
  /** POST …/receiving-requests/{id}/appointment — Giám sát chỉ định người nhận (SupervisorEscalation). */
  async appointRequest(projectId: string, requestId: string, assigneeId: string, reason: string) {
    if (!assigneeId) throw new Error('Chọn người được chỉ định.')
    if (!reason.trim()) throw new Error('Cần nhập lý do chỉ định.')
    const current = await this.request(projectId, requestId)
    return (await apiClient.post(`/projects/${projectId}/receiving-requests/${requestId}/appointment`, { assigneeId, reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(current.version) } })).data
  },
  /** GET /projects/{p}/clocks. */
  async clocks(projectId: string): Promise<DutyClock[]> {
    const rows: DutyClock[] = []
    let cursor: string | undefined
    for (let i = 0; i < 20; i++) {
      const { data } = await apiClient.get<{ items?: DutyClock[]; nextCursor?: string | null }>(`/projects/${projectId}/clocks`, { params: { limit: 100, cursor } })
      if (!Array.isArray(data?.items)) throw new Error('Danh sách đồng hồ sai contract.')
      rows.push(...data.items)
      cursor = data.nextCursor || undefined
      if (!cursor) break
    }
    return rows
  },
  /** POST /projects/{p}/clocks/{id}/appointments — Giám sát chỉ định người phụ trách (BE kiểm kind + vai trò người được chỉ định). */
  async appointClock(clock: DutyClock, assigneeId: string, reason: string) {
    if (!assigneeId) throw new Error('Chọn người được chỉ định.')
    if (!reason.trim()) throw new Error('Cần nhập lý do chỉ định.')
    return (await apiClient.post(`/projects/${clock.projectId}/clocks/${clock.id}/appointments`, { assigneeId, reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(clock.version) } })).data
  },
  /** Danh sách người có thể được chỉ định: GET /users?role= (chỉ Giám sát đọc được). */
  async assignees(role: 'SUPERVISOR' | 'PM') {
    const rows = await personnelService.fetchStaffDirectory({ role, status: 'ACTIVE' })
    return rows.map((u) => ({ id: u.userId, name: u.displayName || u.email || u.userId }))
  },
  /** GET /projects/{p}/weekly-digests/{digestId}. */
  async digest(projectId: string, digestId: string): Promise<WeeklyDigest> {
    if (!GUID.test(digestId.trim())) throw new Error('Mã bản tóm tắt phải là GUID.')
    const { data } = await apiClient.get<WeeklyDigest>(`/projects/${projectId}/weekly-digests/${digestId.trim()}`)
    if (data?.id !== digestId.trim().toLowerCase() || data.projectId !== projectId) throw new Error('BE trả bản tóm tắt sai ID/dự án.')
    return data
  },
}
