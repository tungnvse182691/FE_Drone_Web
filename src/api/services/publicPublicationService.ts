import { apiClient } from '../client'

// PM xuất bản/rút xuất bản khiếm khuyết đã xác minh ra trang công khai (BE: chỉ PM, khiếm khuyết VERIFIED có kết luận hợp lệ).
export interface PublicPublication { publicId: string; damageCategory?: string | null; publicStatus: string; publishedAt?: string | null }
const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const publicPublicationService = {
  /** POST /projects/{p}/defects/{d}/publications — Idempotency-Key, không body. */
  async publish(projectId: string, defectId: string): Promise<PublicPublication> {
    const { data } = await apiClient.post<PublicPublication>(`/projects/${projectId}/defects/${defectId}/publications`, undefined, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
    if (!data?.publicId || !data.publicStatus) throw new Error('BE trả bản xuất bản sai contract.')
    return data
  },
  /** POST /projects/{p}/publications/{publicId}/withdraw. */
  async withdraw(projectId: string, publicId: string): Promise<PublicPublication> {
    if (!GUID.test(publicId.trim())) throw new Error('Mã công khai phải là GUID.')
    const { data } = await apiClient.post<PublicPublication>(`/projects/${projectId}/publications/${publicId.trim()}/withdraw`, undefined, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
    if (!data?.publicId || !data.publicStatus) throw new Error('BE trả bản rút xuất bản sai contract.')
    return data
  },
  /** GET /public/publications/{publicId} — trang công khai (không cần đăng nhập). */
  async readPublic(publicId: string): Promise<PublicPublication> {
    const { data } = await apiClient.get<PublicPublication>(`/public/publications/${publicId.trim()}`)
    if (!data?.publicId) throw new Error('BE trả bản công khai sai contract.')
    return data
  },
}
