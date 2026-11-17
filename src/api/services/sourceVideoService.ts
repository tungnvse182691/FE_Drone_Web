import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'

/**
 * Đọc video nguồn (SURVEY_VIDEO) của một bản nộp khảo sát — chỉ đọc bytes, không tạo dataset/job/đánh giá/baseline.
 * Nguồn: GET /files/{fileId} (metadata: status, mediaType, sizeBytes, checksumSha256) rồi GET /files/{fileId}/content (Blob).
 * BE hiện chưa bật HTTP Range cho content (xem YEU-CAU-FE-XEM-VIDEO-NGUON.md mục 6) nên FE tải toàn tệp rồi phát ObjectURL;
 * không cache Blob giữa các lần mở/tài khoản. Route /files hiện Bearer-only: dev dùng [TEMP-BEARER] trong devFileBearer.ts.
 */
export const SOURCE_VIDEO_PURPOSE = 'SURVEY_VIDEO'
/** Giới hạn tải toàn Blob vào bộ nhớ trình duyệt; vượt thì báo, không cố tải (cần Range/progressive từ BE). */
export const SOURCE_VIDEO_MAX_BYTES = 256 * 1024 * 1024
const CONTENT_TIMEOUT_MS = 180000
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface SourceVideoRef { fileId: string; checksumSha256?: string; sizeBytes?: number; mediaType?: string; purpose?: string }
export interface SourceVideoLoaded { url: string; sizeBytes: number; mediaType: string; checksumVerified: boolean; release: () => void }
export type SourceVideoProgress = (loaded: number, total: number | null) => void

/** Lỗi đã phân loại để UI báo đúng nguyên nhân (không gộp thành "lỗi chung"). */
export class SourceVideoError extends Error {
  constructor(public kind: 'pending' | 'forbidden' | 'auth' | 'not-found' | 'storage' | 'mime' | 'size' | 'integrity' | 'timeout' | 'network' | 'transport' | 'aborted' | 'other', message: string) {
    super(message)
  }
}

/** Lọc đúng nguồn video: purpose SURVEY_VIDEO; không lấy telemetry/ảnh. */
export const sourceVideosOf = (files: SourceVideoRef[]) => files.filter((f) => (f.purpose || '').toUpperCase() === SOURCE_VIDEO_PURPOSE)

async function problemText(data: unknown): Promise<string> {
  try {
    const raw = data instanceof Blob ? await data.text() : typeof data === 'string' ? data : JSON.stringify(data)
    const j = JSON.parse(raw)
    return [j?.code || j?.title, j?.detail, j?.correlationId && `mã đối chiếu ${j.correlationId}`].filter(Boolean).join(' · ')
  } catch { return '' }
}

async function classify(e: any): Promise<SourceVideoError> {
  if (e instanceof SourceVideoError) return e
  if (e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError') return new SourceVideoError('aborted', 'Đã hủy tải video.')
  if (e?.code === 'ECONNABORTED' || /timeout/i.test(e?.message || '')) return new SourceVideoError('timeout', `Quá thời gian tải video (${CONTENT_TIMEOUT_MS / 1000}s). Tệp có thể quá lớn cho cách tải toàn tệp; cần BE hỗ trợ Range.`)
  const status = e?.response?.status as number | undefined
  const detail = e?.response ? await problemText(e.response.data) : ''
  const suffix = detail ? ` (${detail})` : ''
  if (status === 401) return new SourceVideoError('auth', `Phiên/xác thực không hợp lệ cho tệp (HTTP 401). Đăng nhập lại.${suffix}`)
  if (status === 403) return new SourceVideoError('forbidden', `Không có quyền đọc tệp này (HTTP 403).${suffix}`)
  if (status === 404) return new SourceVideoError('not-found', `Không tìm thấy tệp hoặc tệp không thuộc phạm vi của bạn (HTTP 404).${suffix}`)
  if (status === 503) return new SourceVideoError('storage', `Kho lưu trữ tệp tạm thời không khả dụng (HTTP 503).${suffix}`)
  if (status) return new SourceVideoError('other', `Máy chủ trả lỗi HTTP ${status}.${suffix}`)
  if (/Transport tệp dev\/test/.test(e?.message || '')) return new SourceVideoError('transport', e.message)
  if (e?.code === 'ERR_NETWORK') return new SourceVideoError('network', 'Mất kết nối tới máy chủ khi tải video.')
  return new SourceVideoError('other', e?.message || 'Không tải được video.')
}

const sha256Hex = async (buf: ArrayBuffer) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buf)), (b) => b.toString(16).padStart(2, '0')).join('')

export const sourceVideoService = {
  /**
   * Tải video nguồn của đúng bản nộp. `ref` lấy từ dataset.sourceFiles (không phải frameFileId của AI).
   * Kiểm: GUID, purpose, trạng thái VERIFIED, MIME video/*, kích thước và SHA-256 khớp metadata; hủy khi đổi phiên.
   */
  async load(ref: SourceVideoRef, signal: AbortSignal, onProgress?: SourceVideoProgress): Promise<SourceVideoLoaded> {
    const state = useAuthStore.getState()
    const epoch = state.authEpoch
    const stale = () => signal.aborted || useAuthStore.getState().authEpoch !== epoch || !useAuthStore.getState().isAuthenticated
    try {
      if (!GUID.test(ref.fileId)) throw new SourceVideoError('other', 'Mã tệp nguồn không phải GUID hợp lệ.')
      if ((ref.purpose || '').toUpperCase() !== SOURCE_VIDEO_PURPOSE) throw new SourceVideoError('mime', 'Tệp này không phải video nguồn (purpose khác SURVEY_VIDEO).')
      const meta = (await apiClient.get<{ id: string; status?: string | null; checksumSha256?: string | null; mediaType?: string | null; sizeBytes?: number }>(`/files/${ref.fileId}`, { signal })).data
      if (stale()) throw new SourceVideoError('aborted', 'Phiên đã thay đổi; bỏ kết quả.')
      if (meta.id?.toLowerCase() !== ref.fileId.toLowerCase()) throw new SourceVideoError('other', 'BE trả metadata sai mã tệp.')
      if ((meta.status || '').toUpperCase() !== 'VERIFIED') throw new SourceVideoError('pending', `Tệp chưa được xác minh (trạng thái ${meta.status || 'không rõ'}); BE chỉ trả nội dung khi tệp VERIFIED.`)
      const mediaType = meta.mediaType || ref.mediaType || ''
      if (!/^video\//i.test(mediaType)) throw new SourceVideoError('mime', `Loại tệp ${mediaType || 'không rõ'} không phải video; không đưa vào trình phát.`)
      if (typeof meta.sizeBytes === 'number' && meta.sizeBytes > SOURCE_VIDEO_MAX_BYTES) throw new SourceVideoError('size', `Video ${(meta.sizeBytes / 1048576).toFixed(0)} MB vượt giới hạn tải toàn tệp (${SOURCE_VIDEO_MAX_BYTES / 1048576} MB). Cần BE hỗ trợ HTTP Range để phát dần.`)

      const res = await apiClient.get<Blob>(`/files/${ref.fileId}/content`, {
        responseType: 'blob', signal, timeout: CONTENT_TIMEOUT_MS,
        onDownloadProgress: (p) => onProgress?.(p.loaded, p.total ?? meta.sizeBytes ?? null),
      })
      if (stale()) throw new SourceVideoError('aborted', 'Phiên đã thay đổi; bỏ kết quả.')
      const blob = res.data
      if (!(blob instanceof Blob) || blob.size === 0) throw new SourceVideoError('other', 'BE trả nội dung rỗng.')
      // ProblemDetails dạng JSON trả bằng Blob: báo lỗi, không tạo video từ phản hồi lỗi.
      if (/json|text\//i.test(blob.type) && !/^video\//i.test(blob.type)) throw new SourceVideoError('other', `BE trả ${blob.type} thay vì video: ${(await problemText(blob)) || 'không đọc được nội dung lỗi'}`)
      if (typeof meta.sizeBytes === 'number' && blob.size !== meta.sizeBytes) throw new SourceVideoError('integrity', `Kích thước tải về (${blob.size}) khác metadata (${meta.sizeBytes}); không phát.`)
      let checksumVerified = false
      const expected = (meta.checksumSha256 || ref.checksumSha256 || '').toLowerCase()
      if (expected) {
        const actual = await sha256Hex(await blob.arrayBuffer())
        if (stale()) throw new SourceVideoError('aborted', 'Phiên đã thay đổi; bỏ kết quả.')
        if (actual !== expected) throw new SourceVideoError('integrity', 'SHA-256 của tệp tải về không khớp metadata; không phát.')
        checksumVerified = true
      }
      const typed = blob.type && /^video\//i.test(blob.type) ? blob : new Blob([blob], { type: mediaType })
      const url = URL.createObjectURL(typed)
      return { url, sizeBytes: blob.size, mediaType, checksumVerified, release: () => URL.revokeObjectURL(url) }
    } catch (e) {
      throw await classify(e)
    }
  },
}
