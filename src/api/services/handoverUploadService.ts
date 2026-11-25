import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'

/**
 * Tải biên bản bàn giao (PDF) lên vùng staging TRƯỚC khi tạo dự án (BE bản mới):
 * POST /projects/handover-upload-intents → POST /uploads/{id}/part-urls → PUT từng part → POST /uploads/{id}/complete → GET /uploads/{id} đến VERIFIED.
 * Trả fileId (đưa vào handoverFileIds) và ETag của phiên upload (đưa vào If-Match của POST /projects).
 * Xem deploy/fe-handoff/PM-REPAIR-READBACK-AND-WEB.md mục "Bàn giao khi tạo project mới".
 */
export const HANDOVER_MAX_BYTES = 20 * 1024 * 1024
interface Session { id: string; fileId: string; status: string; partSizeBytes: number; version: string }
export interface HandoverStaged { fileId: string; etag: string; sha256: string; sizeBytes: number; fileName: string }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function validateHandoverFile(file: File | null | undefined): string {
  if (!file) return 'Bắt buộc đính kèm biên bản bàn giao (PDF).'
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return 'Biên bản bàn giao phải là tệp PDF.'
  if (file.size <= 0) return 'Tệp biên bản rỗng.'
  if (file.size > HANDOVER_MAX_BYTES) return 'Biên bản bàn giao tối đa 20 MiB.'
  return ''
}

export const handoverUploadService = {
  /** scope.projectId: dự án ĐÃ tồn tại (bổ sung biên bản) → POST /uploads {projectId,targetId=projectId}; không có scope → staging trước khi tạo dự án. */
  async stage(file: File, onStep?: (label: string) => void, scope?: { projectId: string }): Promise<HandoverStaged> {
    const problem = validateHandoverFile(file)
    if (problem) throw new Error(problem)
    const st = useAuthStore.getState(), epoch = st.authEpoch, actor = st.user?.id
    const active = () => { const n = useAuthStore.getState(); if (n.authEpoch !== epoch || n.user?.id !== actor) throw new Error('Phiên đã thay đổi; hủy tải biên bản.') }
    onStep?.('Đang tính SHA-256…')
    const bytes = await file.arrayBuffer()
    const sha = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (v) => v.toString(16).padStart(2, '0')).join('')
    active()
    onStep?.('Đang tạo phiên tải…')
    const body = { purpose: 'DOCUMENT', ...(scope ? { projectId: scope.projectId, targetId: scope.projectId } : {}), fileName: file.name, mediaType: 'application/pdf', sizeBytes: file.size, checksumSha256: sha }
    const created = (await apiClient.post<Session>(scope ? '/uploads' : '/projects/handover-upload-intents', body, { headers: { 'Idempotency-Key': crypto.randomUUID() } })).data
    active()
    if (!created?.id || !created.fileId) throw new Error('BE trả phiên tải thiếu định danh.')
    const read = async () => {
      const r = await apiClient.get<Session>(`/uploads/${created.id}`); active()
      if (r.data.id !== created.id || r.data.fileId !== created.fileId) throw new Error('GET phiên tải không khớp phiên vừa tạo.')
      return r
    }
    let session = (await read()).data
    if (!(session.partSizeBytes > 0)) throw new Error('BE không trả kích thước phần tải.')
    const parts: Array<{ partNumber: number; eTag: string }> = []
    const total = Math.ceil(file.size / session.partSizeBytes)
    for (let part = 1; part <= total; part++) {
      onStep?.(`Đang tải lên (${part}/${total})…`)
      const { data } = await apiClient.post(`/uploads/${created.id}/part-urls`, { partNumbers: [part] }, { headers: { 'Idempotency-Key': crypto.randomUUID() } }); active()
      const lease = data.parts?.find((p: any) => p.partNumber === part)
      if (!lease?.url || !Number.isFinite(Date.parse(lease.expiresAt)) || Date.parse(lease.expiresAt) <= Date.now()) throw new Error('Liên kết tải thiếu hiệu lực hoặc đã hết hạn.')
      const response = await fetch(lease.url, { method: 'PUT', credentials: 'omit', body: bytes.slice((part - 1) * session.partSizeBytes, part * session.partSizeBytes) })
      const eTag = response.headers.get('ETag'); active()
      if (!response.ok || !eTag) throw new Error('Kho lưu trữ không trả ETag cho phần tải (kiểm tra CORS/ExposeHeaders của MinIO).')
      parts.push({ partNumber: part, eTag })
    }
    onStep?.('Đang hoàn tất và xác minh…')
    session = (await read()).data
    await apiClient.post(`/uploads/${created.id}/complete`, { parts, checksumSha256: sha }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': `"${session.version}"` } }); active()
    for (let i = 0; i < 40; i++) {
      const r = await read()
      if (r.data.status === 'VERIFIED') {
        const etag = (r.headers.etag as string | undefined) || ''
        if (!etag) throw new Error('BE không trả ETag của phiên tải đã xác minh.')
        return { fileId: created.fileId, etag, sha256: sha, sizeBytes: file.size, fileName: file.name }
      }
      if (['FAILED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(r.data.status)) throw new Error(`Tệp biên bản không qua xác minh (trạng thái ${r.data.status}).`)
      await sleep(1500)
    }
    throw new Error('Quá thời gian chờ xác minh biên bản. Thử lại với tệp mới.')
  },
}

export interface HandoverDocumentRow { id: string; documentNo?: string | null; handoverDate?: string | null; fileId: string | null; version: string; isMapped: boolean; canAttachFile: boolean }

/** GET /projects/{p}/handover-documents (chỉ Supervisor): kiểm kê TOÀN BỘ hồ sơ bàn giao, kể cả hồ sơ thiếu tệp. items rỗng = chưa có hồ sơ. */
export async function listHandoverDocuments(projectId: string): Promise<HandoverDocumentRow[]> {
  const { data } = await apiClient.get<{ projectId?: string; items?: HandoverDocumentRow[] }>(`/projects/${projectId}/handover-documents`)
  if (data?.projectId !== projectId || !Array.isArray(data.items) || data.items.some((x) => !x?.id)) throw new Error('BE trả kiểm kê hồ sơ bàn giao sai dự án/cấu trúc.')
  return data.items
}

/**
 * Bổ sung biên bản bàn giao cho dự án ĐÃ tồn tại (Supervisor): upload DOCUMENT gắn dự án → GET road-coverage lấy ETag tổng hợp →
 * POST /projects/{p}/handover-documents (If-Match + Idempotency-Key). Hai nhánh:
 *  - attach (existingDocumentId): {fileId, handoverDocumentId}; KHÔNG gửi documentNo/handoverDate;
 *  - tạo mới (không có existingDocumentId): {fileId, documentNo, handoverDate}.
 * Sau khi gắn đọc lại road-coverage; trả road-coverage mới.
 */
export async function attachHandoverDocument(projectId: string, file: File, input: { documentNo?: string; handoverDate?: string }, onStep?: (label: string) => void, existingDocumentId?: string) {
  if (!existingDocumentId && (!input.documentNo?.trim() || !input.handoverDate)) throw new Error('Dự án chưa có hồ sơ bàn giao: cần số hiệu văn bản và ngày bàn giao thực tế.')
  const staged = await handoverUploadService.stage(file, onStep, { projectId })
  onStep?.('Đang gắn biên bản vào hồ sơ bàn giao…')
  const cov = await apiClient.get(`/projects/${projectId}/road-coverage`)
  const etag = (cov.headers.etag as string | undefined) || (cov.data?.version ? `"${cov.data.version}"` : '')
  if (!etag) throw new Error('BE không trả ETag của hồ sơ độ phủ.')
  const body: Record<string, string> = { fileId: staged.fileId }
  if (existingDocumentId) body.handoverDocumentId = existingDocumentId
  else { body.documentNo = input.documentNo!.trim(); body.handoverDate = input.handoverDate! }
  await apiClient.post(`/projects/${projectId}/handover-documents`, body, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': etag } })
  const after = await apiClient.get(`/projects/${projectId}/road-coverage`)
  if (!(after.data?.sources || []).some((x: any) => x.kind === 'HANDOVER' && x.fileId === staged.fileId)) throw new Error('Đã gửi nhưng đọc lại độ phủ chưa thấy nguồn HANDOVER có tệp vừa tải (có thể chưa đủ điều kiện nguồn); kiểm tra lại độ phủ.')
  return after.data
}
