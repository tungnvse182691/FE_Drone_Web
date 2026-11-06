import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { alignmentService, type GeometryDraftInput, type GeometryConfirmInput, type GeometryDraftView, type RoadGeometryVersionView } from './alignmentService'

export type DraftCommand =
  | { kind: 'create'; sectionId: string; input: GeometryDraftInput }
  | { kind: 'update'; draftId: string; etag: string; input: GeometryDraftInput }
  | { kind: 'confirm'; draftId: string; etag: string; input: GeometryConfirmInput }
type Pending = { command: DraftCommand; key: string; receipt?: GeometryDraftView | RoadGeometryVersionView; conflict?: boolean; duplicate?: boolean; rejected?: boolean }
const busy = new Set<string>()
function scope(projectId: string) {
  const state = useAuthStore.getState()
  if (!state.isAuthenticated || !state.user) throw new Error('Chưa có phiên Web hợp lệ.')
  return { state, journal: `rg_geometry_command_${state.user.id}_${projectId}` }
}
function save(journal: string, pending: Pending | null) {
  try {
    if (pending) sessionStorage.setItem(journal, JSON.stringify(pending))
    else sessionStorage.removeItem(journal)
  } catch { throw new Error('Không giữ được yêu cầu để đối chiếu trên trình duyệt. Vui lòng kiểm tra dung lượng lưu trữ.') }
}
export function pendingDraftCommand(projectId: string): Pending | null {
  const { journal } = scope(projectId)
  const text = sessionStorage.getItem(journal)
  if (!text) return null
  let pending: Pending
  try { pending = JSON.parse(text) as Pending } catch { throw new Error('Không đọc được yêu cầu cũ. Cần đối chiếu trước khi gửi lệnh mới.') }
  if (!pending.key || !['create', 'update', 'confirm'].includes(pending.command?.kind) || !pending.command.input) {
    throw new Error('Không đọc được yêu cầu cũ. Cần đối chiếu trước khi gửi lệnh mới.')
  }
  return pending
}
export function acceptFreshDraftVersion(projectId: string) {
  const { journal } = scope(projectId)
  const pending = pendingDraftCommand(projectId)
  if (busy.has(journal) || !pending?.conflict || pending.receipt || pending.duplicate) throw new Error('Yêu cầu cũ chưa đủ điều kiện thay bằng ý định mới.')
  save(journal, null)
}

export function reviseRejectedDraftCommand(projectId: string) {
  const { journal } = scope(projectId)
  const pending = pendingDraftCommand(projectId)
  if (busy.has(journal) || !pending?.rejected || pending.receipt || pending.conflict) throw new Error('Chưa xác nhận yêu cầu bị từ chối để sửa đầu vào.')
  save(journal, null)
}

// Only an explicit user retry replays the immutable command. Receipt recovery never writes again.
export async function runDraftCommand(projectId: string, command?: DraftCommand) {
  const { state, journal } = scope(projectId)
  const epoch = state.authEpoch, actorId = state.user!.id
  const current = () => {
    const now = useAuthStore.getState()
    if (now.authEpoch !== epoch || now.user?.id !== actorId || !now.isAuthenticated) throw new Error('Phiên đã thay đổi; bỏ kết quả lệnh cũ.')
  }
  if (busy.has(journal)) throw new Error('Đang đối chiếu yêu cầu, vui lòng chờ.')
  let pending = pendingDraftCommand(projectId)
  if (pending && command) throw new Error('Yêu cầu cũ chưa rõ kết quả. Hãy đối chiếu đúng yêu cầu trước.')
  if (!pending && !command) throw new Error('Không có yêu cầu đang chờ đối chiếu.')
  let intent = pending?.command || command!
  const expectedRole = intent.kind === 'confirm' ? RoleCode.SUPERVISOR : RoleCode.PROJECT_MANAGER
  if (state.user?.role !== expectedRole) throw new Error('Vai trò hiện tại không được thực hiện lệnh này.')
  if (intent.kind !== 'create' && !/^"[A-Za-z0-9+/]+={0,2}"$/.test(intent.etag)) throw new Error('Chưa có phiên bản bản nháp hợp lệ từ máy chủ.')
  if (pending?.conflict) throw new Error('Cần đọc phiên bản mới và quyết định trước khi gửi lại.')
  if (!pending) { pending = { command: JSON.parse(JSON.stringify(intent)), key: crypto.randomUUID() }; save(journal, pending) }
  const held = pending
  intent = held.command
  busy.add(journal)
  try {
    if (!held.receipt) {
      let result: GeometryDraftView | RoadGeometryVersionView
      if (intent.kind === 'create') result = (await alignmentService.createGeometryDraft(projectId, intent.input, held.key, intent.sectionId)).data
      else if (intent.kind === 'update') result = (await alignmentService.updateGeometryDraft(projectId, intent.draftId, intent.input, intent.etag, held.key)).data
      else result = await alignmentService.confirmGeometryDraft(projectId, intent.draftId, intent.input, intent.etag, held.key)
      current()
      held.receipt = result
      save(journal, held)
    }
    current()
    const receipt = held.receipt!
    if (receipt.projectId !== projectId) throw new Error('Receipt trả sai dự án; cần đối chiếu, không gửi lệnh mới.')
    if (intent.kind === 'confirm') {
      const route = receipt as RoadGeometryVersionView
      if (!route.roadSectionId || !route.routeVersionId || route.sourceDraftId !== intent.draftId) throw new Error('Receipt xác nhận thiếu reference hợp lệ.')
      const geometry = await alignmentService.readConfirmedGeometry(projectId, route.roadSectionId, route.routeVersionId)
      current()
      if (geometry.projectId !== projectId || geometry.routeVersionId !== route.routeVersionId || geometry.roadSectionId !== route.roadSectionId || geometry.sourceDraftId !== intent.draftId) throw new Error('Readback geometry không khớp receipt.')
      save(journal, null)
      return { kind: 'confirm' as const, geometry, draftId: intent.draftId }
    }
    const draft = receipt as GeometryDraftView
    if (!draft.id || intent.kind === 'update' && draft.id !== intent.draftId) throw new Error('Receipt bản nháp thiếu hoặc sai reference.')
    const readback = await alignmentService.getGeometryDraft(projectId, draft.id)
    current()
    if (!/^"[A-Za-z0-9+/]+={0,2}"$/.test(readback.etag)) throw new Error('Readback chưa có phiên bản hợp lệ.')
    save(journal, null)
    return { kind: intent.kind, draft: readback }
  } catch (error: any) {
    current()
    const status = error?.response?.status
    if (!held.receipt && [409, 412, 428].includes(status)) {
      held.conflict = true; held.duplicate = error?.response?.data?.code === 'duplicate_request'; save(journal, held)
    } else if (!held.receipt && status >= 400 && status < 500) { held.rejected = true; save(journal, held) }
    if (held.receipt) throw Object.assign(new Error('Máy chủ đã tiếp nhận lệnh; chưa đọc lại đầy đủ kết quả. Chỉ đối chiếu kết quả, không tạo lệnh mới.'), { cause: error, receipt: held.receipt })
    throw error
  } finally { busy.delete(journal) }
}
