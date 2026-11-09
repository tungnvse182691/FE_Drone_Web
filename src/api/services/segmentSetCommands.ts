import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { segmentSetService, validSetEtag, sameDefinition, type SegmentPins, type SegmentDefinition, type ServerSegmentSet } from './segmentSetService'
export type SegmentIntent = { pins: SegmentPins } & (
  { kind: 'create'; input: SegmentDefinition } |
  { kind: 'edit'; setId: string; etag: string; input: SegmentDefinition } |
  { kind: 'publish'; setId: string; etag: string; input: { expectedPublishedSetId: string | null; reason: string } })
interface Pending { intent: SegmentIntent; key: string; receipt?: ServerSegmentSet; received?: boolean; rejected?: boolean; conflict?: boolean }
const busy = new Set<string>()
function scope(pins: SegmentPins) {
  const s = useAuthStore.getState()
  if (!s.isAuthenticated || !s.user) throw new Error('Chưa có phiên Web hợp lệ.')
  return `rg_segment_command_${s.user.id}_${pins.projectId}_${pins.roadSectionId}_${pins.routeVersionId}`
}
export function pendingSegment(pins: SegmentPins): Pending | null {
  const raw = sessionStorage.getItem(scope(pins))
  if (!raw) return null
  const value = JSON.parse(raw) as Pending
  if (!value.key || !value.intent?.input || JSON.stringify(value.intent.pins) !== JSON.stringify(pins)) throw new Error('Không đọc được journal phân đoạn; cần đối chiếu.')
  return value
}
export function reviseSegment(pins: SegmentPins) {
  const key = scope(pins), held = pendingSegment(pins)
  if (busy.has(key) || !held || (held.receipt || held.received) || !(held.rejected || held.conflict)) throw new Error('Yêu cầu chưa bị từ chối rõ ràng; không đổi ý định/key.')
  sessionStorage.removeItem(key)
}
export async function runSegment(pins: SegmentPins, intent?: SegmentIntent) {
  const state = useAuthStore.getState(), actor = state.user?.id, epoch = state.authEpoch, journal = scope(pins)
  if (state.user?.role !== RoleCode.PROJECT_MANAGER) throw new Error('Chỉ PM được lưu/publish phân đoạn.')
  const current = () => { const now = useAuthStore.getState(); if (now.authEpoch !== epoch || now.user?.id !== actor || !now.isAuthenticated) throw new Error('Phiên thay đổi; bỏ kết quả phân đoạn cũ.') }
  if (busy.has(journal)) throw new Error('Đang xử lý yêu cầu phân đoạn.')
  let held = pendingSegment(pins)
  if (held && intent) throw new Error('Yêu cầu cũ chưa rõ kết quả; chỉ retry ý định đã lưu.')
  if (!held) {
    if (!intent || JSON.stringify(intent.pins) !== JSON.stringify(pins)) throw new Error('Thiếu đúng phạm vi yêu cầu phân đoạn.')
    if (intent.kind !== 'create' && !validSetEtag(intent.etag)) throw new Error('Thiếu ETag server của segment set.')
    held = JSON.parse(JSON.stringify({ intent, key: crypto.randomUUID() })) as Pending
    sessionStorage.setItem(journal, JSON.stringify(held))
  }
  if (held.conflict || held.rejected) throw new Error('Đọc hồ sơ đối chiếu và chủ động sửa yêu cầu bị từ chối trước khi gửi ý định mới.')
  busy.add(journal)
  try {
    const cmd = held.intent
    if (!held.receipt && !held.received) {
      const result = cmd.kind === 'publish' ? await segmentSetService.publish(pins, cmd.setId, cmd.input, held.key, cmd.etag) : await segmentSetService.write(pins, cmd.kind === 'edit' ? cmd.setId : null, cmd.input, held.key, cmd.kind === 'edit' ? cmd.etag : undefined)
      current(); held.received = true; held.receipt = result; sessionStorage.setItem(journal, JSON.stringify(held))
    }
    const receipt = held.receipt!
    if (!receipt?.id || receipt.routeVersionId !== pins.routeVersionId || held.intent.kind !== 'create' && receipt.id !== held.intent.setId) throw new Error('Receipt segment set sai reference; không gửi lại mutation.')
    const read = await segmentSetService.read(pins, receipt.id); current()
    if (read.data.version !== receipt.version || read.data.geometryHash !== receipt.geometryHash || read.data.status !== receipt.status || JSON.stringify(read.data.segments) !== JSON.stringify(receipt.segments)) throw new Error('Readback không khớp receipt segment set.')
    if (cmd.kind !== 'publish' && (!sameDefinition(read.data.definition, cmd.input) || read.data.status !== 'DRAFT')) throw new Error('Readback không đúng định nghĩa DRAFT đã gửi.')
    if (cmd.kind === 'publish' && read.data.status !== 'PUBLISHED') throw new Error('Readback chưa PUBLISHED.')
    sessionStorage.removeItem(journal)
    return read
  } catch (error: any) {
    current()
    if (!held.receipt && !held.received && error?.response?.status >= 400 && error.response.status < 500) {
      held.conflict = [409, 412, 428].includes(error.response.status); held.rejected = !held.conflict
      sessionStorage.setItem(journal, JSON.stringify(held))
    }
    throw error
  } finally { busy.delete(journal) }
}
