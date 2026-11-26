import { apiClient } from '../client'

// Giám sát gia hạn phạm vi xử lý sau khi đã đóng vận hành (spec PM-02 / Giám sát; BE: chỉ Giám sát, cần bản ghi operational closure).
export interface LifecycleHistory { id: string; kind: string | number; recordedAtUtc?: string; reason?: string; handlingScope?: string; operationalClosureId?: string | null }
export interface LifecycleView { projectId: string; operationalClosure: string; history: LifecycleHistory[]; version: string }

const isClosure = (h: LifecycleHistory) => h.kind === 'OperationalClosure' || h.kind === 2

export const lifecycleRenewService = {
  /** GET /projects/{p}/lifecycle — ETag 64 hex là If-Match của lệnh gia hạn. */
  async read(projectId: string): Promise<LifecycleView> {
    const { data, headers } = await apiClient.get<LifecycleView>(`/projects/${projectId}/lifecycle`)
    const etag = String(headers.etag || '').replace(/"/g, '')
    if (data?.projectId !== projectId || !Array.isArray(data.history) || !/^[0-9a-f]{64}$/.test(etag)) throw new Error('BE trả vòng đời dự án sai contract/ETag.')
    return { ...data, version: etag }
  },
  closures(view: LifecycleView) { return view.history.filter(isClosure) },
  /** POST /projects/{p}/lifecycle/renewed-handling-scope — body {operationalClosureId, reason, handlingScope, basis}. */
  async renew(projectId: string, view: LifecycleView, input: { operationalClosureId: string; reason: string; handlingScope: string; basis: string }) {
    if (!input.operationalClosureId) throw new Error('Chọn bản ghi đóng vận hành.')
    if (!input.reason.trim() || !input.handlingScope.trim() || !input.basis.trim()) throw new Error('Cần nhập lý do, phạm vi xử lý và căn cứ.')
    const body = { operationalClosureId: input.operationalClosureId, reason: input.reason.trim(), handlingScope: input.handlingScope.trim(), basis: input.basis.trim() }
    return (await apiClient.post(`/projects/${projectId}/lifecycle/renewed-handling-scope`, body, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': `"${view.version}"` } })).data
  },
}
