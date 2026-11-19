import type { AxiosInstance } from 'axios'

const guid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(value) && value !== '00000000-0000-0000-0000-000000000000'
const hash = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value)

interface TransferableObligation {
  id: string
  kind: string
  routeLabel: string
  from: number
  to: number
  scopeHash: string
}
interface LifecycleAction {
  id: string
  projectId: string
  kind: string
  actorId: string
  at: string
  sourceActionId?: string | null
  obligationId?: string | null
  receivingProjectId?: string | null
  scopeHash: string
}
interface LifecycleView {
  projectId: string
  version: string
  actions: LifecycleAction[]
  responsibilities: { obligationId: string; currentProjectId: string; acceptanceActionId: string }[]
  transferableObligations: TransferableObligation[]
}
export interface TransferSnapshot extends LifecycleView { etag: string }
export interface TransferAttempt {
  projectId: string
  actorId: string
  command: 'obligation-transfers' | 'obligation-transfer-acceptances'
  body: { reason: string; evidenceFileIds: string[]; obligationId: string; scopeHash: string; sourceActionId?: string; receivingProjectId?: string }
  etag: string
  key: string
  previousIds: Set<string>
}

const path = (id: string) => `/projects/${id}/lifecycle`
export function incomingOffers(view: LifecycleView) {
  const accepted = new Set(view.actions.filter(action => action.kind === 'AcceptTransfer' && action.projectId === view.projectId).map(action => action.sourceActionId))
  return view.actions.filter(action => action.kind === 'IssueTransfer' && action.receivingProjectId === view.projectId &&
    guid(action.id) && guid(action.projectId) && action.projectId !== view.projectId && guid(action.obligationId) && hash(action.scopeHash) && !accepted.has(action.id))
}

function snapshot(projectId: string, data: LifecycleView, etag: unknown): TransferSnapshot {
  if (data?.projectId !== projectId || !hash(data.version) || etag !== `"${data.version}"` ||
    !Array.isArray(data.actions) || !Array.isArray(data.transferableObligations) || !Array.isArray(data.responsibilities)) {
    throw new Error('Máy chủ trả dữ liệu vòng đời hoặc ETag không đúng hợp đồng LD06.')
  }
  return { ...data, etag }
}

function prepare(view: TransferSnapshot, actorId: string, command: TransferAttempt['command'], reason: string,
  reference: Omit<TransferAttempt['body'], 'reason' | 'evidenceFileIds'>): TransferAttempt {
  reason = reason.trim()
  if (!reason || reason.length > 2000) throw new Error('Nhập lý do từ 1 đến 2.000 ký tự.')
  return { projectId: view.projectId, actorId, command, body: { ...reference, reason, evidenceFileIds: [] }, etag: view.etag,
    key: crypto.randomUUID(), previousIds: new Set(view.actions.map(action => action.id)) }
}

function matches(attempt: TransferAttempt, action: LifecycleAction) {
  const { projectId, actorId, body, command, previousIds } = attempt
  const issue = command === 'obligation-transfers'
  return guid(action.id) && !previousIds.has(action.id) && action.kind === (issue ? 'IssueTransfer' : 'AcceptTransfer') &&
    action.projectId === projectId && action.actorId === actorId && action.obligationId === body.obligationId &&
    action.scopeHash === body.scopeHash && (action.sourceActionId ?? undefined) === body.sourceActionId &&
    action.receivingProjectId === (issue ? body.receivingProjectId : projectId)
}

export function createObligationTransferService(client: Pick<AxiosInstance, 'get' | 'post'>) {
  async function read(projectId: string, signal?: AbortSignal) {
    if (!guid(projectId)) throw new Error('Dự án không hợp lệ.')
    const { data, headers } = await client.get<LifecycleView>(path(projectId), { signal })
    return snapshot(projectId, data, headers.etag)
  }
  return {
    read,
    prepareIssue(view: TransferSnapshot, actorId: string, obligationId: string, receivingProjectId: string, reason: string) {
      const scope = view.transferableObligations.find(row => row.id === obligationId)
      if (!scope || !guid(scope.id) || !hash(scope.scopeHash) || !guid(receivingProjectId) || receivingProjectId === view.projectId) {
        throw new Error('Chọn nghĩa vụ và dự án nhận hợp lệ từ dữ liệu máy chủ.')
      }
      return prepare(view, actorId, 'obligation-transfers', reason, { obligationId: scope.id, receivingProjectId, scopeHash: scope.scopeHash })
    },
    prepareAcceptance(view: TransferSnapshot, actorId: string, offerId: string, reason: string) {
      const offer = incomingOffers(view).find(row => row.id === offerId)
      if (!offer || !guid(offer.obligationId)) throw new Error('Chọn đề nghị chuyển giao đến dự án này từ dữ liệu máy chủ.')
      return prepare(view, actorId, 'obligation-transfer-acceptances', reason, { sourceActionId: offer.id, obligationId: offer.obligationId, scopeHash: offer.scopeHash })
    },
    async post(attempt: TransferAttempt) {
      const { data, headers, status } = await client.post<LifecycleView>(`${path(attempt.projectId)}/${attempt.command}`, attempt.body,
        { headers: { 'If-Match': attempt.etag, 'Idempotency-Key': attempt.key } })
      if (status !== 201 && status !== 200) throw new Error('Máy chủ không trả mã biên nhận 201/200.')
      const view = snapshot(attempt.projectId, data, headers.etag)
      const actions = view.actions.filter(action => matches(attempt, action))
      if (actions.length !== 1) throw new Error('Không xác định được duy nhất mã hành động trong biên nhận.')
      const [receipt] = actions
      if (attempt.command === 'obligation-transfer-acceptances' && !view.responsibilities.some(row =>
        row.obligationId === receipt.obligationId && row.acceptanceActionId === receipt.id && row.currentProjectId === attempt.projectId)) {
        throw new Error('Biên nhận thiếu bản ghi trách nhiệm của dự án tiếp nhận.')
      }
      return receipt
    },
    async readback(attempt: TransferAttempt, receipt: LifecycleAction) {
      const view = await read(attempt.projectId)
      if (!view.actions.some(action => action.id === receipt.id && matches(attempt, action))) {
        throw new Error('Không tìm thấy hành động trong biên nhận khi đọc lại vòng đời dự án.')
      }
      return view
    },
  }
}
