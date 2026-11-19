import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { workflowCollection } from './workflowCollection'

type CloseoutRef = { projectId: string; packageId: string; itemId: string }
type Action = { id: string; kind: string; projectId: string; at: string; defectId?: string | null; linkedDefectId?: string | null; priorRepairDecisionId?: string | null }
type Lifecycle = { projectId: string; version: string; actions: Action[]; outstandingMandatoryObligationIds: string[]; transferableObligations: { id: string; defectId: string; mandatory: boolean }[] }
type CloseView = { defectId: string; etag: string; closed: boolean; canClose: boolean; closure?: Action; blocker?: string }
type Command = { key: string; etag: string; body: { reason: string; defectId: string; evidenceFileIds: string[] }; received?: boolean; receiptId?: string }
const guid = (id?: string | null): id is string => !!id && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id) && id !== '00000000-0000-0000-0000-000000000000'
const lifecyclePath = (project: string) => `/projects/${project}/lifecycle`
const writes = new Set<string>()

function supervisor(ref: CloseoutRef) {
  const session = useAuthStore.getState(), actor = session.user
  if (actor?.role !== 'SUPERVISOR') throw new Error('Chỉ Giám sát được đóng khiếm khuyết.')
  if (![ref.projectId, ref.packageId, ref.itemId].every(guid)) throw new Error('Thiếu nguồn hạng mục nghiệm thu hợp lệ.')
  return {
    storageKey: `rg_ld06_closure_${actor.id}_${ref.projectId}_${ref.packageId}_${ref.itemId}`,
    assertCurrent() {
      const now = useAuthStore.getState()
      if (now.authEpoch !== session.authEpoch || now.user?.id !== actor.id || now.user?.role !== actor.role) throw new Error('Phiên Giám sát đã thay đổi.')
    }
  }
}

async function readLifecycle(projectId: string, signal?: AbortSignal) {
  if (!guid(projectId)) throw new Error('Thiếu ID dự án hợp lệ.')
  const { data, headers } = await apiClient.get<Lifecycle>(lifecyclePath(projectId), { signal })
  const etag = headers.etag
  if (data?.projectId !== projectId || !/^[0-9a-f]{64}$/.test(data.version) || etag !== `"${data.version}"` || !Array.isArray(data.actions)) {
    throw new Error('Hồ sơ vòng đời sai phạm vi hoặc thiếu ETag/lịch sử từ máy chủ.')
  }
  return { data, etag: etag as string }
}

async function readDefect(ref: CloseoutRef, signal?: AbortSignal) {
  // Supervisor cannot use the PM-only /defects/{id} read. This Web seam pins item, package and project.
  const { data } = await apiClient.get<{ defectId: string; status: string }>(`/projects/${ref.projectId}/repair-packages/${ref.packageId}/items/${ref.itemId}/source-defect`, { signal })
  if (!guid(data?.defectId) || !data.status) throw new Error('Thiếu nguồn khiếm khuyết từ hạng mục nghiệm thu.')
  return data
}

function closureAction(data: Lifecycle, defectId: string) {
  return data.actions.find(row => row.projectId === data.projectId && row.kind === 'CloseDefect' && row.defectId === defectId && guid(row.id))
}

export function defectLifecycleError(error: unknown) {
  const e = error as { message?: string; response?: { status: number; data?: { code?: string; correlationId?: string; detail?: string } } }
  const response = e?.response
  return response ? `HTTP ${response.status} · ${response.data?.code || response.data?.detail || e.message || 'Yêu cầu thất bại'}${response.data?.correlationId ? ` · Mã đối chiếu ${response.data.correlationId}` : ''}` : e?.message || 'Không xử lý được hồ sơ khiếm khuyết.'
}

export const defectLifecycleService = {
  async closure(ref: CloseoutRef, signal?: AbortSignal): Promise<CloseView> {
    const actor = supervisor(ref)
    // Read the lifecycle version first; a subsequent concurrent change is checked again by POST.
    const { data, etag } = await readLifecycle(ref.projectId, signal)
    const defect = await readDefect(ref, signal)
    actor.assertCurrent()
    const closure = closureAction(data, defect.defectId)
    const view = { defectId: defect.defectId, etag, closed: defect.status === 'CLOSED', canClose: false, closure }
    if (view.closed || closure) return view
    const packages = await workflowCollection<{ id: string; projectId: string; defectId: string; allMandatoryResolved: boolean }>(`/projects/${ref.projectId}/repair-packages`, ref.projectId, signal)
    actor.assertCurrent()
    const pkg = packages.find(row => row.id === ref.packageId)
    if (!pkg || pkg.defectId !== defect.defectId) throw new Error('Không đối chiếu được nguồn khiếm khuyết của gói sửa chữa.')
    if (!Array.isArray(data.transferableObligations) || !Array.isArray(data.outstandingMandatoryObligationIds)) throw new Error('Hồ sơ vòng đời thiếu thông tin nghĩa vụ.')
    const obligations = data.transferableObligations.filter(row => row.defectId === defect.defectId)
    if (!obligations.length || pkg.allMandatoryResolved !== true || obligations.some(row => row.mandatory && data.outstandingMandatoryObligationIds.includes(row.id))) {
      return { ...view, blocker: 'Chưa xác nhận đủ nghĩa vụ bắt buộc đã giải quyết cho khiếm khuyết này.' }
    }
    // These reads only preflight visible obligations. The transaction checks every original obligation, including transferred ones.
    return { ...view, canClose: true }
  },

  pending(ref: CloseoutRef): Command | null {
    const { storageKey } = supervisor(ref)
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null
    const c = JSON.parse(raw) as Command
    if (!guid(c.key) || !guid(c.body?.defectId) || !c.body.reason?.trim() || c.body.reason.length > 2000 || !Array.isArray(c.body.evidenceFileIds) || c.body.evidenceFileIds.length || !/^"[0-9a-f]{64}"$/.test(c.etag)) {
      throw new Error('Yêu cầu đóng đang chờ không hợp lệ; cần đối chiếu trước khi gửi lại.')
    }
    return c
  },

  async close(ref: CloseoutRef, reason: string, reviewed?: { defectId: string; etag: string }): Promise<CloseView> {
    const actor = supervisor(ref), { storageKey } = actor
    if (writes.has(storageKey)) throw new Error('Đang xử lý yêu cầu đóng khiếm khuyết.')
    writes.add(storageKey)
    try {
      let command = this.pending(ref)
      const retry = !!command
      if (!command) {
        const value = reason.trim()
        if (!value || value.length > 2000) throw new Error('Nhập lý do đóng khiếm khuyết (tối đa 2000 ký tự).')
        const fresh = await this.closure(ref)
        actor.assertCurrent()
        if (reviewed && (reviewed.defectId !== fresh.defectId || reviewed.etag !== fresh.etag)) throw new Error('Hồ sơ vòng đời đã thay đổi; tải lại trước khi xác nhận.')
        if (!fresh.canClose) throw new Error(fresh.blocker || 'Khiếm khuyết đã đóng hoặc cần đối chiếu lại.')
        // Evidence is optional for CloseDefect. Never substitute preview/attempt/other attachment IDs.
        command = { key: crypto.randomUUID(), etag: fresh.etag, body: { reason: value, defectId: fresh.defectId, evidenceFileIds: [] } }
        sessionStorage.setItem(storageKey, JSON.stringify(command))
      }
      if (!command.received) {
        const defect = await readDefect(ref)
        actor.assertCurrent()
        if (defect.defectId !== command.body.defectId) throw new Error('Nguồn khiếm khuyết không còn khớp yêu cầu đang chờ.')
        try {
          const { data } = await apiClient.post<Lifecycle>(`${lifecyclePath(ref.projectId)}/defect-closures`, command.body, {
            headers: { 'Idempotency-Key': command.key, 'If-Match': command.etag },
            transformRequest: [(body: unknown) => { actor.assertCurrent(); return JSON.stringify(body) }],
          })
          actor.assertCurrent()
          command.received = true
          command.receiptId = data?.projectId === ref.projectId && Array.isArray(data.actions) ? closureAction(data, command.body.defectId)?.id : undefined
          sessionStorage.setItem(storageKey, JSON.stringify(command))
        } catch (err) {
          const status = (err as { response?: { status?: number } }).response?.status
          if (!retry && status && [400, 403, 404, 409, 412, 415, 422, 428].includes(status)) sessionStorage.removeItem(storageKey)
          throw err
        }
      }
      try {
        const { data, etag } = await readLifecycle(ref.projectId)
        const defect = await readDefect(ref)
        actor.assertCurrent()
        const closure = closureAction(data, command.body.defectId)
        if (!closure || closure.id !== command.receiptId || defect.defectId !== command.body.defectId || defect.status !== 'CLOSED') throw new Error('GET chưa khớp biên nhận hoặc trạng thái CLOSED.')
        sessionStorage.removeItem(storageKey)
        return { defectId: defect.defectId, etag, closed: true, canClose: false, closure }
      } catch (err) {
        throw new Error(`Đã nhận phản hồi ghi; chỉ đọc lại, không gửi lệnh mới. ${defectLifecycleError(err)}`)
      }
    } finally { writes.delete(storageKey) }
  },

  async recurrences(projectId: string, defectId: string, signal?: AbortSignal) {
    if (useAuthStore.getState().user?.role !== 'PROJECT_MANAGER' || !guid(defectId)) throw new Error('Thiếu nguồn khiếm khuyết hoặc quyền đọc của PM.')
    const { data } = await readLifecycle(projectId, signal)
    return data.actions.filter(row => row.projectId === projectId && row.kind === 'LinkRecurrence' && guid(row.id) &&
      guid(row.priorRepairDecisionId) && guid(row.defectId) && guid(row.linkedDefectId) && row.defectId !== row.linkedDefectId &&
      (row.defectId === defectId || row.linkedDefectId === defectId))
  },
}
