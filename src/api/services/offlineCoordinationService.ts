import { apiClient } from '../client'

/**
 * PM-13 Điều phối ngoại tuyến (web) — chỉ các thao tác BE cho Web PM/Giám sát:
 * đọc danh sách thiết bị/gói/cấp quyền (GET …/offline/devices|packages|grants, limit+cursor), đọc chi tiết theo ID,
 * thu hồi thiết bị (PM, chỉ đăng ký của chính actor) và thu hồi cấp quyền (Giám sát) bằng POST …/revoke {reason} với Idempotency-Key.
 * BE KHÔNG dùng ETag/If-Match cho revoke H5 (GET device/grant không trả ETag): không gửi If-Match.
 * Ký/mật mã (sync, import, export gói, snapshot, reconcile, đăng ký thiết bị) thuộc ứng dụng di động — KHÔNG làm trên web.
 */
export type OfflineKind = 'devices' | 'packages' | 'grants'
export interface OfflineRow { id: string; [k: string]: unknown }
export interface OfflineDetail { data: Record<string, unknown>; etag: string }

/** Thông báo lỗi theo mã BE (offline controller trả ProblemDetails + code + correlationId). */
const CODE_TEXT: Record<string, string> = {
  access_forbidden: 'Máy chủ từ chối quyền: tài khoản/vai trò hiện tại không được thao tác tài nguyên này.',
  not_found: 'Không tìm thấy tài nguyên trong dự án này.',
  offline_key_revoked: 'Đăng ký thiết bị này đã được thu hồi trước đó.',
  handover_grant_revoked: 'Cấp quyền này đã được thu hồi trước đó.',
  idempotency_key_reused: 'Khóa yêu cầu đã dùng cho nội dung khác; không gửi lại bằng khóa mới khi chưa đối soát.',
  idempotency_key_required: 'Thiếu khóa yêu cầu (Idempotency-Key).',
  origin_content_conflict: 'Phạm vi cấp quyền không khớp manifest đã ký của gói.',
  project_not_active: 'Dự án không còn hoạt động.',
  validation_error: 'Dữ liệu gửi không hợp lệ theo máy chủ.',
}
export function offlineError(e: unknown): string {
  const err = e as { response?: { status?: number; data?: { code?: string; correlationId?: string } }; message?: string }
  const r = err?.response
  if (!r) return err?.message || 'Không nhận được phản hồi từ máy chủ.'
  const code = r.data?.code
  return `${CODE_TEXT[code || ''] || `Máy chủ trả lỗi HTTP ${r.status}${code ? ` (${code})` : ''}.`}${r.data?.correlationId ? ` Mã đối chiếu: ${r.data.correlationId}.` : ''}`
}
/** Không có phản hồi HTTP (timeout/mất mạng) hoặc 5xx: kết quả ghi CHƯA RÕ — giữ nguyên identity, không tự gửi mới. */
export const isUnknownOutcome = (e: unknown) => { const s = (e as { response?: { status?: number } })?.response?.status; return !s || s >= 500 }

const present = (r: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(r, k)
const validTime = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v))

/** Trạng thái hiệu lực của cấp quyền bàn giao (hiển thị; quyết định admission vẫn do máy chủ). Không suy "còn hiệu lực" từ việc thiếu revokedAt. */
export type GrantEffect = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'MISSING'
export function grantEffect(r: Record<string, unknown>, now = Date.now()): GrantEffect {
  if (validTime(r.revokedAt)) return 'REVOKED'
  if (!present(r, 'revokedAt') || r.revokedAt !== null || !validTime(r.expiresAt)) return 'MISSING'
  return Date.parse(r.expiresAt as string) > now ? 'ACTIVE' : 'EXPIRED'
}
export const GRANT_EFFECT_LABEL: Record<GrantEffect, string> = { ACTIVE: 'Còn hạn', EXPIRED: 'Hết hạn', REVOKED: 'Đã thu hồi', MISSING: 'Thiếu thông tin' }
/** Đăng ký thiết bị không có hạn; chỉ phân biệt đã thu hồi / chưa thu hồi / thiếu thông tin. */
export type DeviceState = 'REVOKED' | 'NOT_REVOKED' | 'MISSING'
export function deviceState(r: Record<string, unknown>): DeviceState {
  if (validTime(r.revokedAt)) return 'REVOKED'
  return present(r, 'revokedAt') && r.revokedAt === null ? 'NOT_REVOKED' : 'MISSING'
}

/** Journal ý định ghi (key + body) theo actor/dự án/tài nguyên: sống qua F5/mất phản hồi, không dùng lẫn actor. In-memory dự phòng khi sessionStorage lỗi. */
const mem = new Map<string, string>()
export const intentJournal = {
  get<T>(k: string): T | null { let raw: string | null | undefined; try { raw = sessionStorage.getItem(k) } catch { raw = undefined } if (raw == null) raw = mem.get(k) ?? null; try { return raw ? JSON.parse(raw) as T : null } catch { return null } },
  set(k: string, v: unknown) { const s = JSON.stringify(v); mem.set(k, s); try { sessionStorage.setItem(k, s) } catch { /* giữ trong bộ nhớ */ } },
  clear(k: string) { mem.delete(k); try { sessionStorage.removeItem(k) } catch { /* bỏ qua */ } },
}

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
  /** GET chi tiết (devices|grants|packages|snapshots|artifacts|batches|origins). Đối chiếu ID/dự án trả về. */
  async detail(projectId: string, kind: OfflineKind | 'snapshots' | 'artifacts' | 'batches' | 'origins', id: string, signal?: AbortSignal): Promise<OfflineDetail> {
    const r = await apiClient.get<Record<string, unknown>>(`/projects/${projectId}/offline/${kind}/${id}`, { signal })
    const data = r.data || {}
    if (typeof data.id === 'string' && data.id !== id) throw new Error('Máy chủ trả chi tiết không khớp mã đã chọn.')
    if (typeof data.projectId === 'string' && data.projectId !== projectId) throw new Error('Máy chủ trả chi tiết thuộc dự án khác.')
    return { data, etag: (r.headers.etag as string | undefined) || '' }
  },
  /**
   * Thu hồi thiết bị (PM, chính chủ) / cấp quyền (Giám sát): POST …/revoke {reason} + Idempotency-Key, KHÔNG If-Match.
   * Giữ nguyên key khi gửi lại cùng ý định; 201 = ghi mới, 200 = phát lại kết quả đã lưu.
   */
  async revoke(projectId: string, kind: 'devices' | 'grants', id: string, reason: string, idempotencyKey: string = crypto.randomUUID()): Promise<{ status: number; data: Record<string, unknown> }> {
    if (!reason.trim()) throw new Error('Cần nhập lý do thu hồi.')
    const r = await apiClient.post<Record<string, unknown>>(`/projects/${projectId}/offline/${kind}/${id}/revoke`, { reason: reason.trim() }, { headers: { 'Idempotency-Key': idempotencyKey } })
    return { status: r.status, data: r.data || {} }
  },
}

/** Mục manifest đã ký của gói (nguồn: GET …/offline/packages/{id}.signedManifestJson) — dùng nguyên văn làm phạm vi cấp quyền, không tự dựng. */
export interface GrantItemScope { originId: string; kind: string; corePayloadHash: string; envelopeHash: string; taskId: string; assignmentId: string; snapshotId: string; repairResourceId: string | null }
export interface GrantPackageView { items: GrantItemScope[]; recipients: Array<{ actorId: string; deviceId: string; fingerprint: string }>; sourceDeviceRegistrationId: string }
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
    const recipients = (pick(cipher, 'recipients') as any[] | undefined)?.map((r) => ({ actorId: String(pick(r, 'actorId')), deviceId: String(pick(r, 'deviceId')), fingerprint: String(pick(r, 'recipientKeyFingerprint') ?? '') })) ?? []
    return { items, recipients, sourceDeviceRegistrationId: String(pick(data, 'sourceDeviceRegistrationId')) }
  },
  /** POST …/offline/grants (Giám sát): phạm vi lấy nguyên từ manifest đã ký; người nhận là thiết bị còn hiệu lực có trong danh sách người nhận của gói. */
  async issue(projectId: string, input: { packageId: string; recipientDeviceRegistrationId: string; items: GrantItemScope[]; reason: string }, idempotencyKey: string) {
    if (!input.reason.trim()) throw new Error('Cần nhập lý do cấp quyền.')
    if (!input.items.length) throw new Error('Gói chưa có phạm vi để cấp quyền.')
    const r = await apiClient.post<Record<string, unknown>>(`/projects/${projectId}/offline/grants`, { packageId: input.packageId, recipientDeviceRegistrationId: input.recipientDeviceRegistrationId, items: input.items, reason: input.reason.trim() }, { headers: { 'Idempotency-Key': idempotencyKey } })
    const id = pick(r.data, 'id') as string | undefined
    if (!id) throw new Error('BE không trả mã cấp quyền; cần đối chiếu danh sách cấp quyền, không gửi lại.')
    return { id, status: r.status, body: r.data }
  },
}

/** Fingerprint khóa mã hóa của thiết bị = SHA-256(hex thường) của byte khóa công khai base64 (cùng cách BE đối chiếu wrap người nhận). */
export async function recipientKeyFingerprint(encryptionPublicKeyBase64: string): Promise<string> {
  if (!crypto?.subtle) throw new Error('Trình duyệt không hỗ trợ SHA-256 (cần ngữ cảnh an toàn).')
  const bin = atob(encryptionPublicKeyBase64), bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Đối chiếu chi tiết grant đọc lại với ý định đã gửi: đúng grant/dự án/gói/thiết bị nhận/phạm vi. Trả chuỗi lỗi, rỗng nếu khớp. */
export function grantReadbackMismatch(detail: Record<string, unknown>, expect: { id: string; projectId: string; packageId: string; recipientDeviceRegistrationId: string; originIds: string[] }): string {
  const bad: string[] = []
  if (detail.id !== expect.id) bad.push('mã cấp quyền')
  if (detail.projectId !== expect.projectId) bad.push('dự án')
  if (detail.packageId !== expect.packageId) bad.push('gói')
  if (detail.recipientDeviceRegistrationId !== expect.recipientDeviceRegistrationId) bad.push('thiết bị nhận')
  try {
    const scope = JSON.parse(String(detail.scopeJson)) as { items?: Array<{ originId?: string; OriginId?: string }> }
    const got = (scope.items || []).map((i) => String(i.originId ?? i.OriginId)).sort().join('|'), want = [...expect.originIds].sort().join('|')
    if (got !== want) bad.push('phạm vi')
  } catch { bad.push('phạm vi (không đọc được)') }
  return bad.length ? `Đọc lại không khớp lệnh đã gửi: ${bad.join(', ')}.` : ''
}
