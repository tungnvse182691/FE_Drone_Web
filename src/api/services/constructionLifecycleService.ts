import { apiClient } from '../client'

type Kind = 'DeclareConstruction' | 'ConfirmConstruction'
interface Action { id: string; projectId: string; kind: Kind; actorId: string; at: string; sourceActionId: string | null; factsJson: string }
interface ViewDto { projectId: string; version: string; constructionCompletion: 'UNKNOWN' | 'CONFIRMED'; actions: Action[] }
export interface ConstructionView extends ViewDto { etag: string }
export interface ConstructionFile { id: string; kind: 'HANDOVER' | 'MAINTENANCE_BASIS'; provenance?: string }
interface Input { reason: string; evidenceFileIds: string[]; sourceActionId?: string }
export interface ConstructionAttempt {
  readonly projectId: string; readonly actorId: string; readonly kind: Kind; readonly key: string; readonly etag: string
  readonly body: Input; readonly previousIds: Set<string>
  received?: boolean; action?: Action
}

const guid = (id: unknown): id is string => typeof id === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id) && id !== '00000000-0000-0000-0000-000000000000'
const lifecycle = (projectId: string) => `/projects/${projectId}/lifecycle`

function parseView(projectId: string, data: ViewDto, etag: unknown): ConstructionView {
  if (data?.projectId !== projectId || !Array.isArray(data.actions) || !['UNKNOWN', 'CONFIRMED'].includes(data.constructionCompletion)) {
    throw new Error('BE trả dữ liệu vòng đời không đúng dự án hoặc sai định dạng.')
  }
  if (typeof etag !== 'string' || !/^"[a-f0-9]{64}"$/.test(etag) || etag !== `"${data.version}"`) {
    throw new Error('BE không trả ETag vòng đời hợp lệ.')
  }
  return { ...data, etag, actions: data.actions.filter(a => a?.projectId === projectId && guid(a.id) && (a.kind === 'DeclareConstruction' || a.kind === 'ConfirmConstruction')) }
}

function evidenceIds(action: Action): string[] | undefined {
  try {
    const ids: unknown = JSON.parse(action.factsJson)?.evidenceFileIds
    if (Array.isArray(ids) && ids.every(guid)) return ids
  } catch { /* Malformed action facts cannot confirm a write. */ }
}

export const constructionEvidenceIds = (action: Action) => evidenceIds(action) ?? []

function matches(attempt: ConstructionAttempt, action: Action) {
  const ids = evidenceIds(action)
  return ids !== undefined && action.kind === attempt.kind && action.actorId === attempt.actorId &&
    (action.sourceActionId ?? undefined) === attempt.body.sourceActionId &&
    ids.length === attempt.body.evidenceFileIds.length && ids.every((id, i) => id === attempt.body.evidenceFileIds[i])
}

async function read(projectId: string, signal?: AbortSignal) {
  const { data, headers } = await apiClient.get<ViewDto>(lifecycle(projectId), { signal })
  return parseView(projectId, data, headers.etag)
}

export const constructionLifecycleService = {
  read,
  // Coverage's file sources are resolved via Files + project FileScope + VERIFIED upload.
  // Use fileId, not the ID of a handover record, warranty, or other source aggregate.
  async readEvidence(projectId: string, signal?: AbortSignal): Promise<ConstructionFile[]> {
    const { data } = await apiClient.get<{ projectId: string; sources: Array<{ kind: string; fileId?: string; provenance?: string }> }>(`/projects/${projectId}/road-coverage`, { signal })
    if (data?.projectId !== projectId || !Array.isArray(data.sources)) throw new Error('BE trả nguồn tệp không đúng phạm vi dự án.')
    const files = new Map<string, ConstructionFile>()
    for (const source of data.sources) {
      if (!source || !guid(source.fileId) || (source.kind !== 'HANDOVER' && source.kind !== 'MAINTENANCE_BASIS')) continue
      if (source.kind === 'HANDOVER' || !files.has(source.fileId)) {
        files.set(source.fileId, { id: source.fileId, kind: source.kind, provenance: source.provenance })
      }
    }
    return [...files.values()]
  },
  prepare(view: ConstructionView, actorId: string, input: Input, files: readonly { id: string }[]): ConstructionAttempt {
    const { evidenceFileIds, sourceActionId } = input
    const reason = input.reason.trim()
    const kind = sourceActionId === undefined ? 'DeclareConstruction' : 'ConfirmConstruction'
    if (!guid(actorId) || !reason || reason.length > 2000) throw new Error('Cần phiên hợp lệ và lý do tối đa 2.000 ký tự.')
    if (kind === 'ConfirmConstruction' && !view.actions.some(a => a.id === sourceActionId && a.kind === 'DeclareConstruction' && constructionEvidenceIds(a).length)) {
      throw new Error('Chọn đúng bản khai báo có minh chứng của dự án.')
    }
    if ((kind === 'DeclareConstruction' && !evidenceFileIds.length) || evidenceFileIds.length > 100 ||
      new Set(evidenceFileIds).size !== evidenceFileIds.length || evidenceFileIds.some(id => !files.some(file => file.id === id))) {
      throw new Error('Chọn tệp minh chứng hợp lệ của dự án (tối đa 100 tệp; bắt buộc khi khai báo).')
    }
    return {
      projectId: view.projectId, actorId, kind, key: crypto.randomUUID(), etag: view.etag,
      body: { reason, evidenceFileIds: [...evidenceFileIds], ...(sourceActionId === undefined ? {} : { sourceActionId }) },
      previousIds: new Set(view.actions.map(a => a.id)),
    }
  },
  async submit(attempt: ConstructionAttempt, signal?: AbortSignal) {
    const endpoint = attempt.kind === 'DeclareConstruction' ? 'construction-declarations' : 'construction-confirmations'
    if (!attempt.action) {
      const { data, headers } = await apiClient.post<ViewDto>(`${lifecycle(attempt.projectId)}/${endpoint}`, attempt.body, {
        signal, headers: { 'Idempotency-Key': attempt.key, 'If-Match': attempt.etag },
      })
      attempt.received = true
      const receipt = parseView(attempt.projectId, data, headers.etag)
      const added = receipt.actions.filter(a => !attempt.previousIds.has(a.id) && matches(attempt, a))
      if (added.length !== 1) throw new Error('BE đã phản hồi nhưng không xác định được bản ghi chính xác trong kết quả lệnh.')
      attempt.action = added[0]
    }
    const view = await read(attempt.projectId, signal)
    const action = view.actions.find(a => a.id === attempt.action?.id && matches(attempt, a))
    if (!action || (attempt.kind === 'ConfirmConstruction' && view.constructionCompletion !== 'CONFIRMED')) {
      throw new Error('Chưa đọc lại được đúng bản ghi vừa ghi nhận trong vòng đời dự án.')
    }
    return { view, action }
  },
}
