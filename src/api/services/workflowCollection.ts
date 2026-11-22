import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'

// DiscoveryCollectionsController uses limit, not pageSize. Empty pages may have a cursor.
export async function workflowCollection<T extends { id: string; projectId: string }>(path: string, projectId: string, signal?: AbortSignal, allowedProjectIds: readonly string[] = []): Promise<T[]> {
  const session = useAuthStore.getState()
  const identity = `${session.authEpoch}:${session.user?.id}:${session.user?.role}`
  const rows: T[] = [], cursors = new Set<string>(), ids = new Set<string>()
  let cursor: string | undefined
  do {
    const { data } = await apiClient.get(path, { params: { limit: 100, cursor }, signal })
    const current = useAuthStore.getState()
    if (signal?.aborted || identity !== `${current.authEpoch}:${current.user?.id}:${current.user?.role}`) throw new Error('Phiên đọc dữ liệu đã thay đổi.')
    if (!Array.isArray(data?.items) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor)) throw new Error('Danh sách trả sai cấu trúc; không thể coi là dữ liệu rỗng.')
    for (const row of data.items as T[]) {
      if (!row.id || (row.projectId !== projectId && !allowedProjectIds.includes(row.projectId)) || ids.has(row.id)) throw new Error('Danh sách sai phạm vi dự án hoặc trùng bản ghi.')
      ids.add(row.id); rows.push(row)
    }
    cursor = data.nextCursor || undefined
    if (cursor && cursors.has(cursor)) throw new Error('Phân trang trả cursor lặp.')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return rows
}
