import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { personnelService, type PrimaryProjectManagerReadDto } from './personnelService'
import { personnelSnapshot, PersonnelUiError } from './personnelScreen'

export interface PrimarySnapshot { projectId: string; targetId: string; current: PrimaryProjectManagerReadDto; target: Awaited<ReturnType<typeof personnelSnapshot>> }
type Body = { primaryProjectManagerUserId: string; effectiveFrom: string; reason: string; expectedCurrentMembershipRowVersion: string; operationId: string }
type Receipt = Awaited<ReturnType<typeof personnelService.reassignPrimaryProjectManager>>
type Command = { projectId: string; body: Body; previousMembershipId?: string; receipt?: Receipt; uncertain: boolean; conflict?: boolean; rejected?: boolean }
const busy = new Set<string>(), memory = new Map<string, Command>()
const journal = () => `rg_primary_pm_${useAuthStore.getState().user?.id}`
const version = (v?: string | null) => !!v && /^[A-Za-z0-9+/]{11}=$/.test(v)
const uuid = (v: string) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v)
export function pendingPrimaryPm(): Command | null {
  const key = journal(), text = memory.has(key) ? JSON.stringify(memory.get(key)) : sessionStorage.getItem(key)
  if (!text) return null
  const held = JSON.parse(text) as Command
  if (!uuid(held.projectId) || !uuid(held.body?.primaryProjectManagerUserId) || !uuid(held.body?.operationId) || !version(held.body.expectedCurrentMembershipRowVersion)) throw new PersonnelUiError('Lệnh chuyển PM đang chờ không hợp lệ; cần đối chiếu.')
  return held
}
export async function readPrimaryPmSnapshot(projectId: string, targetId: string, recovery = false): Promise<PrimarySnapshot> {
  const state = useAuthStore.getState(), epoch = state.authEpoch, actor = state.user?.id
  if (!state.isAuthenticated || state.user?.role !== RoleCode.SUPERVISOR || !uuid(projectId) || !uuid(targetId)) throw new PersonnelUiError('Cần Sup, một dự án và PM có ID server hợp lệ.')
  const [current, target] = await Promise.all([personnelService.getPrimaryProjectManager(projectId), personnelSnapshot(targetId)])
  if (useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor) throw new PersonnelUiError('Phiên thay đổi; bỏ snapshot PM cũ.')
  if (!current?.membershipId || !current.userId || !version(current.membershipVersion) || !/^\d{4}-\d{2}-\d{2}$/.test(current.validFrom)) throw new PersonnelUiError('PM chính null hoặc thiếu membershipId/validFrom/membershipVersion; chưa thể bàn giao.')
  if (target.account.id !== targetId || !recovery && (target.wireRole !== 'PM' || target.account.status !== 'ACTIVE')) throw new PersonnelUiError('Người tiếp quản phải là PM ACTIVE từ snapshot server.')
  if (!recovery && current.userId === targetId) throw new PersonnelUiError('Người được chọn đã là PM chính hiện tại.')
  return { projectId, targetId, current, target }
}
export function primaryPmBody(snapshot: PrimarySnapshot, date: string, reason: string, now = new Date()): Body {
  if (!snapshot || !uuid(snapshot.projectId) || !uuid(snapshot.targetId) || snapshot.target.account.id !== snapshot.targetId || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.current?.validFrom || '') || !snapshot.current.membershipId || snapshot.current.userId === snapshot.targetId || !version(snapshot.current?.membershipVersion) || snapshot.target?.wireRole !== 'PM' || snapshot.target.account.status !== 'ACTIVE') throw new PersonnelUiError('Thiếu snapshot PM/membershipVersion hợp lệ.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date !== now.toISOString().slice(0, 10)) throw new PersonnelUiError('Lệnh mới chỉ nhận ngày UTC hiện tại; không hỗ trợ đặt lịch tương lai.')
  if (date <= snapshot.current.validFrom) throw new PersonnelUiError('Ngày bàn giao phải sau validFrom của PM chính hiện tại; không tự đổi ngày.')
  if (!reason.trim() || reason.trim().length > 1000) throw new PersonnelUiError('Cần lý do Sup nhập, từ 1 đến 1000 ký tự.')
  return { primaryProjectManagerUserId: snapshot.targetId, effectiveFrom: date, reason: reason.trim(), expectedCurrentMembershipRowVersion: snapshot.current.membershipVersion!, operationId: crypto.randomUUID() }
}
export async function savePrimaryPm(snapshot?: PrimarySnapshot, date = '', reason = '') {
  const state = useAuthStore.getState(), actor = state.user?.id, epoch = state.authEpoch, key = journal()
  if (!state.isAuthenticated || state.user?.role !== RoleCode.SUPERVISOR) throw new PersonnelUiError('Chỉ Sup được chuyển PM chính.')
  const current = () => { if (!useAuthStore.getState().isAuthenticated || useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor) throw new PersonnelUiError('Phiên thay đổi; bỏ kết quả chuyển PM cũ.') }
  if (busy.has(key)) throw new PersonnelUiError('Đang đối chiếu chuyển PM chính.')
  let held = pendingPrimaryPm()
  if (held && snapshot) throw new PersonnelUiError('Có lệnh cũ đang chờ; chỉ replay đúng payload/operationId.')
  if (held?.conflict || held?.rejected) throw new PersonnelUiError('Cần chủ động đối chiếu và quyết định trước khi tạo ý định mới.')
  if (!held) { if (!snapshot) throw new PersonnelUiError('Thiếu snapshot bàn giao.'); held = { projectId: snapshot.projectId, previousMembershipId: snapshot.current.membershipId, body: primaryPmBody(snapshot, date, reason), uncertain: false } }
  const persist = () => { memory.set(key, held!); sessionStorage.setItem(key, JSON.stringify(held)) }
  const wasUncertain = held.uncertain
  persist(); busy.add(key)
  try {
    if (!held.receipt) { held.uncertain = true; persist(); const receipt = await personnelService.reassignPrimaryProjectManager(held.projectId, held.body); held.receipt = receipt || {} as Receipt; persist(); current() }
    current()
    const receipt = held.receipt!
    if (!receipt.previousMembershipId || held.previousMembershipId && receipt.previousMembershipId !== held.previousMembershipId || !receipt.currentMembershipId || !version(receipt.currentMembershipRowVersion)) throw new PersonnelUiError('Đã nhận receipt nhưng thiếu membership/version; không PUT lại.')
    const readback = await personnelService.getPrimaryProjectManager(held.projectId); current()
    if (!readback || readback.userId !== held.body.primaryProjectManagerUserId || readback.membershipId !== receipt.currentMembershipId || readback.membershipVersion !== receipt.currentMembershipRowVersion || readback.validFrom !== held.body.effectiveFrom) throw new PersonnelUiError('Readback PM chính/membership/version/ngày chưa khớp receipt; chỉ GET lại.')
    sessionStorage.removeItem(key); memory.delete(key)
    return { projectId: held.projectId, assignment: readback, receipt }
  } catch (error: any) {
    current()
    if (!held.receipt) { const status = error?.response?.status; held.uncertain = wasUncertain || !status || status >= 500; if (!held.uncertain) { held.conflict = status === 409; held.rejected = status >= 400 && status < 500 && status !== 409 } }
    persist()
    if (held.receipt) throw new PersonnelUiError('Đã lưu chuyển PM; chưa đọc lại đầy đủ. Retry chỉ GET, không PUT mới.')
    throw error
  } finally { busy.delete(key) }
}
export async function comparePrimaryPm() {
  const held = pendingPrimaryPm(), state = useAuthStore.getState()
  if (!held || held.uncertain || held.receipt || !held.conflict && !held.rejected || busy.has(journal())) throw new PersonnelUiError('Không được bỏ lệnh chưa rõ kết quả hoặc có receipt.')
  const snapshot = await readPrimaryPmSnapshot(held.projectId, held.body.primaryProjectManagerUserId, true)
  if (pendingPrimaryPm()?.body.operationId !== held.body.operationId) throw new PersonnelUiError('Ý định đã thay đổi.')
  return { snapshot, operationId: held.body.operationId, actor: state.user!.id, epoch: state.authEpoch }
}
export function resolvePrimaryPm(comparison: Awaited<ReturnType<typeof comparePrimaryPm>>) {
  const held = pendingPrimaryPm(), state = useAuthStore.getState(), key = journal()
  if (!held || held.body.operationId !== comparison.operationId || held.uncertain || held.receipt || !held.conflict && !held.rejected || busy.has(key) || state.user?.id !== comparison.actor || state.authEpoch !== comparison.epoch || state.user.role !== RoleCode.SUPERVISOR) throw new PersonnelUiError('Chưa có đối chiếu hợp lệ để bỏ ý định cũ.')
  sessionStorage.removeItem(key); memory.delete(key)
}
