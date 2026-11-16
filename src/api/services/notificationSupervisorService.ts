import { apiClient } from '../client'

// PM chỉ định Giám sát nhận thông báo cho hạng mục Fast Track (BE: chỉ PM, chỉ Fast Track, body {supervisorId}).
export interface NotificationSupervisor { assignmentId: string; supervisorId: string; status: string; assignedAt: string; revokedAt?: string | null; version: string }

const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const path = (p: string, pk: string, item: string) => `/projects/${p}/repair-packages/${pk}/items/${item}/notification-supervisor`

export const notificationSupervisorService = {
  /** GET …/notification-supervisor — 404 nghĩa là chưa có chỉ định (trả null, không phải lỗi). */
  async read(projectId: string, packageId: string, itemId: string): Promise<NotificationSupervisor | null> {
    try {
      const { data } = await apiClient.get<NotificationSupervisor>(path(projectId, packageId, itemId))
      if (!data?.assignmentId || !data.version) throw new Error('BE trả chỉ định Giám sát sai contract.')
      return data
    } catch (e) {
      if ((e as { response?: { status?: number } })?.response?.status === 404) return null
      throw e
    }
  },
  /** PUT — tạo mới dùng If-None-Match: *, thay thế dùng If-Match = version hiện tại. */
  async assign(projectId: string, packageId: string, itemId: string, supervisorId: string) {
    if (!GUID.test(supervisorId.trim())) throw new Error('Mã Giám sát phải là GUID.')
    const current = await this.read(projectId, packageId, itemId)
    const cond = current ? { 'If-Match': quote(current.version) } : { 'If-None-Match': '*' }
    return (await apiClient.put<NotificationSupervisor>(path(projectId, packageId, itemId), { supervisorId: supervisorId.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), ...cond } })).data
  },
  /** DELETE — thu hồi chỉ định, If-Match = version hiện tại. */
  async revoke(projectId: string, packageId: string, itemId: string) {
    const current = await this.read(projectId, packageId, itemId)
    if (!current) throw new Error('Hạng mục chưa có Giám sát nhận thông báo.')
    await apiClient.delete(path(projectId, packageId, itemId), { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(current.version) } })
  },
}
