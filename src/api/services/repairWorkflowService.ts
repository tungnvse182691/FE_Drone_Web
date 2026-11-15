import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { workflowCollection } from './workflowCollection'

export interface RepairPackage { id: string; projectId: string; defectId: string; allMandatoryResolved: boolean; version: string }
export interface RepairItem { id: string; projectId: string; defectId: string; obligationId: string; mode: string; state: string; result: string; version: string }
export interface RepairHistory {
  item: RepairItem
  decisions: Array<{ id: string; role: string; reason: string; at: string; result: string }>
  attempts: Array<{ id: string; taskId: string; performed: boolean; unperformedReason?: string; startedAt?: string; finishedAt?: string; evidence: Array<{fileId: string; verified: boolean; purpose: string}> }>
  reviewRequests: Array<{id: string; role: string; reason: string; at: string}>
}
export interface RepairDraft {
  defectId: string; physicalRoadId: string; routeVersionId: string; segmentSetId: string
  fromMeters: number; toMeters: number; offsetFromMeters: number; offsetToMeters: number
  reason: string; repairPlan: string; checklistVersion: string
}
interface Creation {
  input: RepairDraft; createKey: string; proposeKey: string
  createBody: unknown; version: string; packageReceived?: boolean
  receipt?: RepairPackage & { unresolvedMandatoryObligationIds: string[] }
  proposalReceived?: boolean; proposalBody?: unknown
}
type Command = { path: string; key: string; version: string; body: { reason: string }; received?: boolean }
const busy = new Set<string>()
function identity() {
  const s = useAuthStore.getState()
  if (!s.user || !['PROJECT_MANAGER', 'SUPERVISOR'].includes(s.user.role)) throw new Error('Chưa có quyền đọc sửa chữa.')
  return `${s.authEpoch}:${s.user.id}:${s.user.role}`
}
function active(s: string, signal?: AbortSignal) { if (signal?.aborted || identity() !== s) throw new Error('Phiên sửa chữa đã thay đổi.') }
function key(path: string) { return `rg_repair_${useAuthStore.getState().user?.id}_${path}` }
function validate(row: RepairItem, p: string, id?: string) {
  if (!row?.id || id && row.id !== id || row.projectId !== p || !row.version || !row.state || !row.mode || !row.obligationId) throw new Error('Hạng mục sửa chữa sai phạm vi hoặc thiếu trạng thái/version.')
  return row
}
export const repairWorkflowService = {
  async defects(p: string, signal?: AbortSignal) {
    const s = identity(), rows: Array<{id: string; projectId: string; defectTypeCode?: string; status?: string; roadSectionVersionId?: string; version: string}> = []
    let cursor: string | undefined
    const seen = new Set<string>()
    do {
      const {data} = await apiClient.get(`/projects/${p}/defects`, {params: {pageSize: 100, cursor}, signal}); active(s, signal)
      if (!Array.isArray(data?.items)) throw new Error('Danh sách Defect sai cấu trúc.')
      for (const row of data.items) { if (row.projectId !== p || !row.id || !row.version || rows.some(r => r.id === row.id)) throw new Error('Defect sai phạm vi/version hoặc bị trùng.'); rows.push(row) }
      cursor = data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor Defect lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return rows
  },
  pendingCreation(p: string): Creation | null {
    identity(); const raw = sessionStorage.getItem(key(`create:${p}`))
    return raw ? JSON.parse(raw) as Creation : null
  },
  async createAndPropose(p: string, input: RepairDraft) {
    const s = identity(), k = key(`create:${p}`)
    if (useAuthStore.getState().user?.role !== 'PROJECT_MANAGER') throw new Error('Chỉ PM được tạo gói và đề xuất hạng mục.')
    if (busy.has(k)) throw new Error('Đang đối chiếu gói sửa chữa.')
    busy.add(k)
    try {
      let held = this.pendingCreation(p)
      if (held && JSON.stringify(held.input) !== JSON.stringify(input)) throw new Error('Giữ nguyên dữ liệu gói đang chờ; không tạo key/body khác.')
      if (!held) {
        if (!input.reason.trim() || !input.repairPlan.trim() || !input.checklistVersion.trim() || !input.physicalRoadId || !input.segmentSetId ||
          ![input.fromMeters, input.toMeters, input.offsetFromMeters, input.offsetToMeters].every(Number.isFinite) || input.fromMeters < 0 || input.toMeters <= input.fromMeters || input.offsetToMeters <= input.offsetFromMeters) throw new Error('Nhập đủ phạm vi, lý do, phương án và phiên bản checklist; mốc kết thúc phải lớn hơn mốc bắt đầu.')
        const r = await apiClient.get(`/projects/${p}/defects/${input.defectId}`); active(s)
        if (r.data?.id !== input.defectId || r.data.projectId !== p || r.data.roadSectionVersionId !== input.routeVersionId || !r.data.version || r.headers?.etag !== `"${r.data.version}"`) throw new Error('Defect/tuyến/ETag không còn khớp. Đọc lại nguồn.')
        const {reason, physicalRoadId, routeVersionId, segmentSetId, fromMeters, toMeters, offsetFromMeters, offsetToMeters} = input
        const body = {defectId: input.defectId, defectVersion: r.data.version, obligations: [{kind: 'FORMAL_REPAIR', mandatory: true, scope: {physicalRoadId, routeVersionId, segmentSetId, fromMeters, toMeters, offsetFromMeters, offsetToMeters}, reason}], reason}
        held = {input, createBody: body, version: r.data.version, createKey: crypto.randomUUID(), proposeKey: crypto.randomUUID()}
        sessionStorage.setItem(k, JSON.stringify(held))
      }
      if (!held.packageReceived) {
        const {data} = await apiClient.post(`/projects/${p}/repair-packages`, held.createBody, {headers: {'Idempotency-Key': held.createKey, 'If-Match': `"${held.version}"`}}); active(s)
        held.packageReceived = true; held.receipt = data; sessionStorage.setItem(k, JSON.stringify(held))
      }
      const receipt = held.receipt
      if (!receipt?.id || receipt.projectId !== p || receipt.defectId !== input.defectId || !receipt.version || receipt.unresolvedMandatoryObligationIds?.length !== 1) throw new Error('Đã nhận receipt tạo gói nhưng thiếu nguồn nghĩa vụ/version; giữ receipt, không POST tạo lại.')
      // Readback precedes the separate proposal command; no invented obligation ID.
      const packages = await this.packages(p); active(s)
      if (!packages.some(row => row.id === receipt.id)) throw new Error('Đã nhận gói nhưng chưa đọc lại được trong danh mục.')
      if (!held.proposalBody) {
        held.proposalBody = {obligationId: receipt.unresolvedMandatoryObligationIds[0], mode: 'NORMAL', repairPlan: input.repairPlan, checklistVersion: input.checklistVersion, reason: input.reason}
        sessionStorage.setItem(k, JSON.stringify(held))
      }
      if (!held.proposalReceived) {
        const r = await apiClient.post(`/projects/${p}/repair-packages/${receipt.id}/items`, held.proposalBody, {headers: {'Idempotency-Key': held.proposeKey, 'If-Match': `"${receipt.version}"`}}); active(s)
        held.proposalReceived = true; sessionStorage.setItem(k, JSON.stringify(held)); validate(r.data, p)
      }
      const items = await this.items(p, receipt.id); active(s)
      if (!items.some(row => row.obligationId === receipt.unresolvedMandatoryObligationIds[0])) throw new Error('Đã nhận đề xuất nhưng chưa đọc lại được hạng mục.')
      sessionStorage.removeItem(k)
      return receipt.id
    } finally { busy.delete(k) }
  },
  packages(p: string, signal?: AbortSignal) { return workflowCollection<RepairPackage>(`/projects/${p}/repair-packages`, p, signal) },
  async items(p: string, pkg: string, signal?: AbortSignal) {
    const rows = await workflowCollection<RepairItem>(`/projects/${p}/repair-packages/${pkg}/items`, p, signal)
    rows.forEach(row => validate(row, p)); return rows
  },
  async detail(p: string, pkg: string, id: string, signal?: AbortSignal) {
    const s = identity(), r = await apiClient.get<RepairItem>(`/projects/${p}/repair-packages/${pkg}/items/${id}`, { signal })
    active(s, signal); validate(r.data, p, id)
    if (r.headers?.etag !== `"${r.data.version}"`) throw new Error('Hạng mục thiếu ETag khớp version.')
    return r.data
  },
  async history(p: string, pkg: string, id: string, signal?: AbortSignal) {
    const s = identity(), r = await apiClient.get<RepairHistory>(`/projects/${p}/repair-packages/${pkg}/items/${id}/history`, { signal })
    active(s, signal); validate(r.data?.item, p, id)
    if (!Array.isArray(r.data.decisions) || !Array.isArray(r.data.attempts) || !Array.isArray(r.data.reviewRequests)) throw new Error('Lịch sử thiếu nguồn quyết định/thi công.')
    return r.data
  },
  pending(p: string, pkg: string, id: string, action: 'approve' | 'final-confirmation'): Command | null {
    identity()
    const path = `/projects/${p}/repair-packages/${pkg}/items/${id}/${action}`
    const raw = sessionStorage.getItem(key(path))
    if (!raw) return null
    const c = JSON.parse(raw) as Command
    if (c.path !== path || !c.key || !c.version || !c.body?.reason) throw new Error('Yêu cầu đang chờ sai phạm vi; giữ lại để đối chiếu.')
    return c
  },
  async decide(p: string, pkg: string, id: string, action: 'approve' | 'final-confirmation', reason: string) {
    const s = identity(), path = `/projects/${p}/repair-packages/${pkg}/items/${id}/${action}`, storageKey = key(path)
    if (busy.has(storageKey)) throw new Error('Đang xử lý yêu cầu này.')
    busy.add(storageKey)
    try {
      let c = this.pending(p, pkg, id, action)
      if (c && c.body.reason !== reason) throw new Error('Giữ nguyên lý do và yêu cầu đang chờ để đọc lại hoặc thử lại cùng key.')
      if (!c) {
        if (!reason.trim()) throw new Error('Nhập lý do quyết định.')
        const row = await this.detail(p, pkg, id); active(s)
        const role = useAuthStore.getState().user?.role
        if (action === 'approve' ? role !== 'SUPERVISOR' || row.mode !== 'Normal' || row.state !== 'AwaitingApproval'
          : row.state !== 'Reviewed' || role !== (row.mode === 'Normal' ? 'SUPERVISOR' : 'PROJECT_MANAGER')) throw new Error('Vai trò hoặc trạng thái không cho phép quyết định này.')
        c = { path, key: crypto.randomUUID(), version: row.version, body: { reason } }
        sessionStorage.setItem(storageKey, JSON.stringify(c))
      }
      if (!c.received) {
        // Network/HTTP ambiguity retains exact key, body and If-Match. Never invent a new command.
        const r = await apiClient.post(path, c.body, { headers: { 'Idempotency-Key': c.key, 'If-Match': `"${c.version}"` } })
        active(s)
        // Persist receipt before DTO validation/readback: subsequent calls must only GET.
        c.received = true; sessionStorage.setItem(storageKey, JSON.stringify(c))
        validate(r.data, p, id)
      }
      const row = await this.detail(p, pkg, id); active(s)
      sessionStorage.removeItem(storageKey)
      return row
    } finally { busy.delete(storageKey) }
  }
}
