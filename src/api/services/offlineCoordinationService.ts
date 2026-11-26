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

/** Mục manifest đã ký của gói (nguồn: GET …/offline/packages/{id}.signedManifestJson) — dùng nguyên văn làm phạm vi cấp quyền, không tự dựng. */
export interface GrantItemScope { originId: string; kind: string; corePayloadHash: string; envelopeHash: string; taskId: string; assignmentId: string; snapshotId: string; repairResourceId: string | null }
export interface GrantPackageView { items: GrantItemScope[]; recipients: Array<{ actorId: string; deviceId: string }>; sourceDeviceRegistrationId: string }
const pick = (o: any, k: string) => (o && typeof o === 'object' ? (o[k] ?? o[k[0].toUpperCase() + k.slice(1)]) : undefined)

export const offlineGrantService = {
  /** GET …/offline/packages/{id}: đọc manifest đã ký + danh sách người nhận được mã hóa. Lỗi/thiếu cấu trúc → ném lỗi (không coi là rỗng). */
  async packageView(projectId: string, packageId: string): Promise<GrantPackageView> {
    const { data } = await apiClient.get<Record<string, unknown>>(`/projects/${projectId}/offline/packages/${packageId}`)
    if (pick(data, 'id') !== packageId) throw new Error('BE trả gói ngoại tuyến không khớp mã đã chọn.')
    let manifest: any, cipher: any
    try { manifest = JSON.parse(String(pick(data, 'signedManifestJson'))); cipher = JSON.parse(String(pick(data, 'cipherPackageJson'))) } catch { throw new Error('Không đọc được manifest/gói mã hóa của gói ngoại tuyến (sai cấu trúc).') }
    const rawItems = pick(manifest, 'items')
    if (!Array.isArray(rawItems) || !rawItems.length) throw new Error('Gói ngoại tuyến không có mục nào trong manifest đã ký.')
    const items: GrantItemScope[] = rawItems.map((x: any) => {
      const it = { originId: pick(x, 'originId'), kind: pick(x, 'kind'), corePayloadHash: pick(x, 'corePayloadHash'), envelopeHash: pick(x, 'envelopeHash'), taskId: pick(x, 'taskId'), assignmentId: pick(x, 'assignmentId'), snapshotId: pick(x, 'snapshotId'), repairResourceId: pick(x, 'repairResourceId') ?? null }
      if (![it.originId, it.kind, it.corePayloadHash, it.envelopeHash, it.taskId, it.assignmentId, it.snapshotId].every((v) => typeof v === 'string' && v)) throw new Error('Manifest của gói thiếu trường bắt buộc cho phạm vi cấp quyền.')
      return it as GrantItemScope
    })
    const recipients = (pick(cipher, 'recipients') as any[] | undefined)?.map((r) => ({ actorId: String(pick(r, 'actorId')), deviceId: String(pick(r, 'deviceId')) })) ?? []
    return { items, recipients, sourceDeviceRegistrationId: String(pick(data, 'sourceDeviceRegistrationId')) }
  },
  /** POST …/offline/grants (Giám sát): phạm vi lấy nguyên từ manifest đã ký; người nhận là thiết bị còn hiệu lực có trong danh sách người nhận của gói. */
  async issue(projectId: string, input: { packageId: string; recipientDeviceRegistrationId: string; items: GrantItemScope[]; reason: string }, idempotencyKey: string) {
    if (!input.reason.trim()) throw new Error('Cần nhập lý do cấp quyền.')
    if (!input.items.length) throw new Error('Gói chưa có phạm vi để cấp quyền.')
    const r = await apiClient.post<Record<string, unknown>>(`/projects/${projectId}/offline/grants`, { packageId: input.packageId, recipientDeviceRegistrationId: input.recipientDeviceRegistrationId, items: input.items, reason: input.reason.trim() }, { headers: { 'Idempotency-Key': idempotencyKey } })
    const id = pick(r.data, 'id') as string | undefined
    if (!id) throw new Error('BE không trả mã cấp quyền; cần đối chiếu danh sách cấp quyền, không gửi lại.')
    return { id, status: r.status }
  },
}
