import { apiClient } from '../client'

/**
 * PM-13 Điều phối ngoại tuyến (web) — chỉ các thao tác BE cho Web PM/Giám sát:
 * đọc danh sách thiết bị/gói/cấp quyền (GET …/offline/devices|packages|grants, limit+cursor), đọc chi tiết theo ID,
 * thu hồi thiết bị (PM) và thu hồi cấp quyền (Giám sát) bằng POST …/revoke {reason} với Idempotency-Key + If-Match (ETag của chính chi tiết).
 * Ký/mật mã (sync, import, export gói, snapshot, reconcile, đăng ký thiết bị) thuộc ứng dụng di động — KHÔNG làm trên web.
 */
export type OfflineKind = 'devices' | 'packages' | 'grants'
export interface OfflineRow { id: string; [k: string]: unknown }
export interface OfflineDetail { data: Record<string, unknown>; etag: string }
const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)

export const offlineCoordinationService = {
  async list(projectId: string, kind: OfflineKind, signal?: AbortSignal): Promise<OfflineRow[]> {
    const rows: OfflineRow[] = []
    const seen = new Set<string>()
    let cursor: string | undefined
    do {
      const { data } = await apiClient.get<{ items?: OfflineRow[]; nextCursor?: string | null }>(`/projects/${projectId}/offline/${kind}`, { params: { limit: 100, cursor }, signal })
      if (!Array.isArray(data?.items)) throw new Error('Danh sách ngoại tuyến trả sai contract.')
      for (const r of data.items) { if (!r.id) throw new Error('Mục ngoại tuyến thiếu ID.'); rows.push(r) }
      cursor = data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor ngoại tuyến bị lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return rows
  },
  /** GET chi tiết (devices|grants|packages|snapshots|artifacts|batches|origins). ETag dùng cho If-Match của lệnh thu hồi. */
  async detail(projectId: string, kind: OfflineKind | 'snapshots' | 'artifacts' | 'batches' | 'origins', id: string): Promise<OfflineDetail> {
    const r = await apiClient.get<Record<string, unknown>>(`/projects/${projectId}/offline/${kind}/${id}`)
    return { data: r.data || {}, etag: (r.headers.etag as string | undefined) || '' }
  },
  /** Thu hồi thiết bị (PM) / cấp quyền (Giám sát). */
  async revoke(projectId: string, kind: 'devices' | 'grants', id: string, reason: string): Promise<void> {
    if (!reason.trim()) throw new Error('Cần nhập lý do thu hồi.')
    const d = await this.detail(projectId, kind, id)
    if (!d.etag) throw new Error('BE không trả ETag của chi tiết; chưa thể thu hồi.')
    if (d.data.revokedAt) throw new Error('Mục này đã được thu hồi.')
    await apiClient.post(`/projects/${projectId}/offline/${kind}/${id}/revoke`, { reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(d.etag) } })
  },
}
