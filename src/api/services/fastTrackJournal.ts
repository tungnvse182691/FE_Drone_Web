import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'

interface Command { path: string; body: unknown; etag?: string; key: string; uncertain?: boolean; receipt?: any }
const running = new Set<string>()
export function fastTrackIdentity() {
  const s = useAuthStore.getState()
  if (!s.user || !s.isAuthenticated) throw new Error('Chưa đăng nhập.')
  return `${s.user.id}:${s.user.role}`
}
export function fastTrackStorage(project: string, operation: string) {
  return `rg_fasttrack:${fastTrackIdentity()}:${project}:${operation}`
}
export function fastTrackPending(project: string, operation: string): Command | null {
  const value = localStorage.getItem(fastTrackStorage(project, operation))
  return value ? JSON.parse(value) : null
}
// Exact command identity survives reload and ambiguous transport outcomes. No credentials are stored.
export async function fastTrackCommand<T>(project: string, operation: string, path: string, body: unknown,
  preflight: () => Promise<string | undefined>, readback: (receipt: any) => Promise<T>): Promise<T> {
  const storage = fastTrackStorage(project, operation), epoch = useAuthStore.getState().authEpoch
  const active = () => { if (epoch !== useAuthStore.getState().authEpoch || storage !== fastTrackStorage(project, operation)) throw new Error('Phiên Fast Track đã thay đổi.') }
  if (useAuthStore.getState().user?.role !== (operation === 'coverage' ? 'SUPERVISOR' : 'PROJECT_MANAGER')) throw new Error('Không có quyền thực hiện thao tác này.')
  if (running.has(storage)) throw new Error('Thao tác đang xử lý.')
  running.add(storage)
  let held = fastTrackPending(project, operation)
  const save = () => localStorage.setItem(storage, JSON.stringify(held))
  try {
    // A receipt always reconciles by GET, regardless of edits made after reload.
    if (held?.receipt) {
      const result = await readback(held.receipt); active(); if (!operation.startsWith('assign:')) localStorage.removeItem(storage); return result
    }
    if (held && (held.path !== path || JSON.stringify(held.body) !== JSON.stringify(body))) throw new Error('Có yêu cầu chưa rõ kết quả. Giữ nguyên nội dung cũ để đối chiếu, không tạo yêu cầu mới.')
    if (!held) {
      const etag = await preflight(); active()
      held = {path, body: JSON.parse(JSON.stringify(body)), etag, key: crypto.randomUUID()}; save()
    }
    try {
      const response = await apiClient.post(held.path, held.body, {headers: {'Idempotency-Key': held.key, ...(held.etag ? {'If-Match': held.etag} : {})}})
      // Save receipt even if the actor changes while receiving the response; never POST it again.
      held.receipt = response.data; save()
    } catch (error: any) {
      const status = error.response?.status
      if (!status || status >= 500 || status === 408) {held.uncertain = true; save()}
      else if (!held.uncertain) localStorage.removeItem(storage)
      throw error
    }
    active()
    const result = await readback(held.receipt); active(); if (!operation.startsWith('assign:')) localStorage.removeItem(storage); return result
  } finally { running.delete(storage) }
}
