import { apiClient } from '../client'

/** Danh mục loại hư hỏng — quản trị bởi Supervisor (BE bản mới): GET/POST /catalog/defect-types/admin, PUT /catalog/defect-types/admin/{code}. */
export interface DefectTypeAdmin { code: string; name: string; description?: string | null; isActive: boolean; version: string }
export interface DefectTypeInput { name: string; description?: string; isActive: boolean; reason: string }
const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
export const CODE_RULE = /^[A-Z0-9_-]{1,80}$/

export const defectTypeAdminService = {
  async list(): Promise<DefectTypeAdmin[]> {
    const { data } = await apiClient.get<DefectTypeAdmin[]>('/catalog/defect-types/admin')
    if (!Array.isArray(data) || data.some((d) => !d.code || typeof d.isActive !== 'boolean' || !d.version)) throw new Error('Danh mục loại hư hỏng trả sai contract.')
    return data
  },
  async create(code: string, input: DefectTypeInput): Promise<DefectTypeAdmin> {
    const c = code.trim().toUpperCase()
    if (!CODE_RULE.test(c)) throw new Error('Mã chỉ gồm A–Z, 0–9, gạch dưới, gạch ngang (tối đa 80 ký tự).')
    this.check(input)
    return (await apiClient.post<DefectTypeAdmin>('/catalog/defect-types/admin', { code: c, name: input.name.trim(), description: input.description?.trim() || null, isActive: input.isActive, reason: input.reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID() } })).data
  },
  async update(row: DefectTypeAdmin, input: DefectTypeInput): Promise<DefectTypeAdmin> {
    this.check(input)
    return (await apiClient.put<DefectTypeAdmin>(`/catalog/defect-types/admin/${encodeURIComponent(row.code)}`, { name: input.name.trim(), description: input.description?.trim() || null, isActive: input.isActive, reason: input.reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(row.version) } })).data
  },
  check(input: DefectTypeInput) {
    if (!input.name.trim() || input.name.trim().length > 150) throw new Error('Tên bắt buộc, tối đa 150 ký tự.')
    if ((input.description?.trim().length || 0) > 2000) throw new Error('Mô tả tối đa 2.000 ký tự.')
    if (!input.reason.trim() || input.reason.trim().length > 1000) throw new Error('Lý do bắt buộc, tối đa 1.000 ký tự.')
  },
}
