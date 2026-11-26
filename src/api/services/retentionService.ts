import { apiClient } from '../client'
import { LegalHoldProject } from '../../types/domain'

// Dữ liệu lưu trữ lấy từ BE. BE không có danh sách lệnh phong tỏa (chỉ GET theo id), nên các lệnh tạo từ giao diện
// được ghi nhớ mã (holdId) trong sessionStorage để hiển thị trạng thái và gỡ được; lệnh tạo ở nơi khác không liệt kê được.
const HOLD_STORE = 'rg_retention_holds'
interface StoredHold { holdId: string; reason: string; since: string }
const readHolds = (): Record<string, StoredHold> => {
  try { return JSON.parse(sessionStorage.getItem(HOLD_STORE) || '{}') } catch { return {} }
}
const writeHolds = (value: Record<string, StoredHold>) => {
  try { sessionStorage.setItem(HOLD_STORE, JSON.stringify(value)) } catch { /* không có sessionStorage */ }
}
const quote = (v: unknown) => { const t = String(v ?? ''); return t.startsWith('"') ? t : `"${t}"` }

export const retentionService = {
  /**
   * Danh sách dự án và trạng thái lưu trữ/phong tỏa: GET /projects (phân trang) + GET /projects/{id}/work-package
   * (hạn bảo hành lớn nhất) + GET /retention/holds/{id} cho các lệnh phong tỏa đã tạo trong phiên.
   */
  async getRetentionProjects(): Promise<LegalHoldProject[]> {
    const projects: Array<{ projectId: string; projectCode: string; name: string }> = []
    let cursor: string | null | undefined
    for (let page = 0; page < 20; page++) {
      const res = await apiClient.get<any>('/projects', { params: cursor ? { cursor } : undefined })
      projects.push(...(res.data?.items || []))
      cursor = res.data?.nextCursor
      if (!cursor) break
    }
    const holds = readHolds()
    let changed = false
    const rows = await Promise.all(
      projects.map(async (p): Promise<LegalHoldProject> => {
        const wp = await apiClient.get<any>(`/projects/${p.projectId}/work-package`)
        const ends: string[] = (wp.data?.warranties || []).map((w: any) => w.warrantyEndDate).filter(Boolean).sort()
        const end = ends[ends.length - 1]
        const endMs = end ? new Date(end).getTime() : NaN
        const expired = Number.isFinite(endMs) && endMs < Date.now()
        let active = false
        const stored = holds[p.projectId]
        if (stored) {
          const h = await apiClient.get<any>(`/retention/holds/${stored.holdId}`)
          active = !h.data?.releasedAt
          if (!active) { delete holds[p.projectId]; changed = true }
        }
        return {
          project_id: p.projectId,
          project_code: p.projectCode,
          project_name: p.name,
          warranty_end_date: end ? new Date(end).toLocaleDateString('vi-VN') : '—',
          is_warranty_expired: expired,
          years_since_warranty_end: expired ? Math.floor((Date.now() - endMs) / (365.25 * 86400000)) : 0,
          is_legal_hold: active,
          hold_reason: active ? stored.reason : undefined,
          hold_since: active ? stored.since : undefined,
        }
      })
    )
    if (changed) writeHolds(holds)
    return rows
  },

  /**
   * Phong tỏa pháp lý theo dự án: POST /retention/holds {scopeType:'PROJECT', scopeId, reason} (Idempotency-Key);
   * gỡ: POST /retention/holds/{id}/release {reason} (Idempotency-Key, If-Match = version của lệnh).
   */
  async setLegalHold(
    projectId: string,
    payload: { enabled: boolean; reason?: string; authority?: string; reference?: string }
  ): Promise<LegalHoldProject> {
    const reason = [payload.reason, payload.authority && `Cơ quan: ${payload.authority}`, payload.reference && `Văn bản: ${payload.reference}`]
      .filter(Boolean)
      .join(' | ')
      .trim()
    if (!reason) throw new Error('Cần nhập lý do để thực hiện phong tỏa/gỡ phong tỏa (BE bắt buộc).')
    const holds = readHolds()
    if (payload.enabled) {
      const res = await apiClient.post<any>(
        '/retention/holds',
        { scopeType: 'PROJECT', scopeId: projectId, reason },
        { headers: { 'Idempotency-Key': crypto.randomUUID() } }
      )
      holds[projectId] = { holdId: res.data.id, reason, since: new Date().toLocaleString('vi-VN') }
      writeHolds(holds)
    } else {
      const stored = holds[projectId]
      if (!stored) {
        throw new Error('Không có mã lệnh phong tỏa để gỡ: BE không liệt kê được các lệnh phong tỏa, chỉ gỡ được lệnh tạo từ giao diện trong phiên này.')
      }
      const current = await apiClient.get<any>(`/retention/holds/${stored.holdId}`)
      const version = current.headers?.['etag'] || current.data?.version
      await apiClient.post(
        `/retention/holds/${stored.holdId}/release`,
        { reason },
        { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(version) } }
      )
      delete holds[projectId]
      writeHolds(holds)
    }
    const rows = await this.getRetentionProjects()
    const found = rows.find((p) => p.project_id === projectId)
    if (!found) throw new Error('Không đọc lại được dự án sau khi cập nhật phong tỏa.')
    return found
  },

  /** Bật/tắt nhanh phong tỏa: cần lý do nên mở hộp thoại; hàm này giữ để tương thích và yêu cầu lý do. */
  async toggleLegalHold(projectId: string): Promise<LegalHoldProject> {
    const rows = await this.getRetentionProjects()
    const found = rows.find((p) => p.project_id === projectId)
    return this.setLegalHold(projectId, { enabled: !found?.is_legal_hold })
  },

  // =========================================================================
  // CANONICAL RETENTION & LEGAL HOLD API CANDIDATE3 (CỤM L4 - SPEC 17_10)
  // =========================================================================

  /**
   * Đọc danh sách đánh giá lưu trữ hồ sơ (GET /api/v1/projects/{projectId}/retention/evaluations)
   */
  async getRetentionEvaluations(projectId: string, signal?: AbortSignal): Promise<any[]> {
    if (!projectId || projectId === 'ALL') return []
    const res = await apiClient.get(`/projects/${projectId}/retention/evaluations`, { signal })
    return res.data?.items || []
  },

  /** Xem tệp lưu trữ: GET /projects/{projectId}/retention/files/{fileId} (phân loại, nghĩa vụ bảo hành, số lệnh phong tỏa đang hiệu lực). */
  async getRetentionFile(projectId: string, fileId: string, signal?: AbortSignal): Promise<any> {
    const res = await apiClient.get(`/projects/${projectId}/retention/files/${fileId}`, { signal })
    return res.data
  },

  /**
   * Xác nhận căn cứ lưu trữ của tệp: PUT /projects/{p}/retention/files/{fileId}/basis
   * Body {warrantyIds, expectedReferenceInventoryVersion, reason}; If-Match = basisVersion hiện tại của tệp (đọc lại ngay trước khi gửi).
   */
  async confirmRetentionBasis(projectId: string, fileId: string, warrantyIds: string[], reason: string): Promise<any> {
    if (!reason.trim()) throw new Error('Cần nhập lý do xác nhận căn cứ lưu trữ.')
    const cur = await apiClient.get(`/projects/${projectId}/retention/files/${fileId}`)
    const f = cur.data
    const etag = cur.headers?.etag || (f?.basisVersion ? `"${f.basisVersion}"` : '')
    if (!f?.inventoryVersion || !etag) throw new Error('BE chưa trả phiên bản kiểm kê/căn cứ của tệp để xác nhận.')
    const res = await apiClient.put(`/projects/${projectId}/retention/files/${fileId}/basis`,
      { warrantyIds, expectedReferenceInventoryVersion: f.inventoryVersion, reason: reason.trim() },
      { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': etag } })
    return res.data
  },

  /**
   * Tạo đánh giá lưu trữ hồ sơ công trình (POST /api/v1/projects/{projectId}/retention/evaluations)
   */
  async createRetentionEvaluation(projectId: string, request: any): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(`/projects/${projectId}/retention/evaluations`, request, {
      headers: { 'Idempotency-Key': key }
    })
    return res.data
  },

  /**
   * Lấy chi tiết đánh giá lưu trữ hồ sơ (GET /api/v1/projects/{projectId}/retention/evaluations/{id})
   */
  async getRetentionEvaluationDetail(projectId: string, id: string, signal?: AbortSignal): Promise<any> {
    const res = await apiClient.get(`/projects/${projectId}/retention/evaluations/${id}`, { signal })
    return res.data
  },

  /**
   * Tạo lệnh phong tỏa pháp lý Legal Hold (POST /api/v1/retention/holds)
   */
  async createLegalHoldApi(request: any): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post('/retention/holds', request, {
      headers: { 'Idempotency-Key': key }
    })
    return res.data
  },

  /**
   * Giải tỏa lệnh phong tỏa pháp lý Legal Hold (POST /api/v1/retention/holds/{id}/release)
   */
  async releaseLegalHoldApi(holdId: string, version: string): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(`/retention/holds/${holdId}/release`, {}, {
      headers: {
        'Idempotency-Key': key,
        'If-Match': version.startsWith('"') ? version : `"${version}"`
      }
    })
    return res.data
  }
}
