import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { pavementService, type PavementLayoutInput, type PavementLayoutView, type PavementPins, type PavementPlanInput } from './pavementService'

export interface PavementEditor {
  stripWidthMeters: number | string; slabLengthM: number | string; slabThicknessCm: number | string
  contractionSpacingM: number | string; expansionSpacingM: number | string; expansionGapMm: number | string
}
function number(value: number | string, field: string, optional = false, zero = false): number | undefined {
  if (optional && (typeof value === 'string' && !value.trim() || typeof value === 'number' && Number.isNaN(value))) return undefined
  if (typeof value === 'string' && !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) throw new Error(`${field}: cần số hợp lệ.`)
  const result = Number(value)
  if (!Number.isFinite(result) || (zero ? result < 0 : result <= 0)) throw new Error(`${field}: cần số hữu hạn ${zero ? '≥ 0' : '> 0'}.`)
  return result
}
// Decimal divisibility, without binary remainder errors or changing the supplied widths.
function decimal(value: number): [bigint, number] {
  const [base, exponent = '0'] = String(value).toLowerCase().split('e'), parts = base.split('.')
  return [BigInt(parts.join('')), (parts[1]?.length || 0) - Number(exponent)]
}
export function pavementInput(editor: PavementEditor, widthProfile: PavementLayoutInput['widthProfile'], length: number, displayTolerance: number | string): PavementPlanInput {
  const strip = number(editor.stripWidthMeters, 'stripWidthMeters')!, slab = number(editor.slabLengthM, 'slabLengthMeters')!
  if (!Number.isFinite(length) || length <= 0 || !widthProfile.length || widthProfile.length > 100000) throw new Error('widthProfile: thiếu chiều dài/phạm vi engineering từ server.')
  let end = 0
  for (const width of widthProfile) {
    if (![width.fromOffsetMeters, width.toOffsetMeters, width.widthMeters].every(Number.isFinite) || width.fromOffsetMeters !== end || width.toOffsetMeters <= end || width.toOffsetMeters > length + 1e-12 * Math.max(1, length) || width.widthMeters <= 0) throw new Error('widthProfile: phải liên tục và phủ đúng tuyến server.')
    const [w, ws] = decimal(width.widthMeters), [s, ss] = decimal(strip), scale = Math.max(ws, ss)
    if (w * 10n ** BigInt(scale - ws) % (s * 10n ** BigInt(scale - ss)) !== 0n) throw new Error('widthProfile.widthMeters phải chia hết stripWidthMeters; preview dư ngang chưa đủ điều kiện lưu.')
    end = width.toOffsetMeters
  }
  if (Math.abs(end - length) > 1e-12 * Math.max(1, length)) throw new Error('widthProfile: chưa phủ đúng toàn bộ tuyến server.')
  const layout: PavementLayoutInput = { stripWidthMeters: strip, slabLengthMeters: slab, widthProfile: widthProfile.map(width => ({ ...width })) }
  const values = {
    slabThicknessCentimeters: number(editor.slabThicknessCm, 'slabThicknessCentimeters', true),
    contractionJointSpacingMeters: number(editor.contractionSpacingM, 'contractionJointSpacingMeters', true),
    expansionJointSpacingMeters: number(editor.expansionSpacingM, 'expansionJointSpacingMeters', true),
    expansionJointGapMillimeters: number(editor.expansionGapMm, 'expansionJointGapMillimeters', true, true)
  }
  for (const [key, value] of Object.entries(values)) if (value !== undefined) Object.assign(layout, { [key]: value })
  return { layout, displayToleranceMeters: number(displayTolerance, 'displayToleranceMeters')! }
}
export function sameLayout(a: PavementLayoutInput, b: PavementLayoutInput): boolean {
  const keys = ['stripWidthMeters', 'slabLengthMeters', 'slabThicknessCentimeters', 'contractionJointSpacingMeters', 'expansionJointSpacingMeters', 'expansionJointGapMillimeters'] as const
  return keys.every(key => (a[key] ?? null) === (b[key] ?? null)) && a.widthProfile.length === b.widthProfile.length && a.widthProfile.every((w, i) => ['fromOffsetMeters', 'toOffsetMeters', 'widthMeters'].every(key => w[key as keyof typeof w] === b.widthProfile[i][key as keyof typeof w]))
}
interface Pending { key: string; pins: PavementPins; input: PavementPlanInput; receipt?: { id: string; contentHash: string }; rejected?: boolean }
const busy = new Set<string>()
function journal(projectId: string) {
  const state = useAuthStore.getState()
  if (!state.isAuthenticated || !state.user) throw new Error('Chưa có phiên đăng nhập hợp lệ.')
  return `rg_pavement_command_${state.user.id}_${projectId}`
}
export function pendingPavement(projectId: string): Pending | null {
  const raw = sessionStorage.getItem(journal(projectId))
  if (!raw) return null
  const value = JSON.parse(raw) as Pending
  if (!value.key || value.pins?.projectId !== projectId || !value.pins.routeVersionId || !value.pins.segmentSetId || !value.input?.layout) throw new Error('Không đọc được command pavement đang chờ; cần đối chiếu trước khi ghi.')
  return value
}
export async function savePavement(projectId: string, intent?: { pins: PavementPins; input: PavementPlanInput }): Promise<PavementLayoutView> {
  const state = useAuthStore.getState(), key = journal(projectId), actor = state.user!.id, epoch = state.authEpoch
  if (state.user?.role !== RoleCode.PROJECT_MANAGER) throw new Error('Chỉ PM được lưu cấu hình tấm/khe.')
  const current = () => { const now = useAuthStore.getState(); if (now.authEpoch !== epoch || now.user?.id !== actor || !now.isAuthenticated) throw new Error('Phiên thay đổi; bỏ kết quả pavement cũ.') }
  if (busy.has(key)) throw new Error('Đang đối chiếu lệnh lưu tấm/khe.')
  let held = pendingPavement(projectId)
  if (held && intent) throw new Error('Command cũ đang chờ; chỉ retry đúng key/payload, không thay cấu hình.')
  if (!held) {
    if (!intent || intent.pins.projectId !== projectId) throw new Error('Thiếu command/phạm vi pavement hợp lệ.')
    held = JSON.parse(JSON.stringify({ ...intent, key: crypto.randomUUID() })) as Pending
    sessionStorage.setItem(key, JSON.stringify(held))
  }
  busy.add(key)
  try {
    if (!held.receipt) {
      const receipt = await pavementService.create(held.pins, held.input, held.key)
      current()
      // Persist receipt before validating/readback: never create again after acceptance.
      held.receipt = { id: receipt?.id, contentHash: receipt?.contentHash }
      sessionStorage.setItem(key, JSON.stringify(held))
      if (receipt.projectId !== projectId || receipt.routeVersionId !== held.pins.routeVersionId || receipt.segmentSetId !== held.pins.segmentSetId) throw new Error('Receipt pavement sai phạm vi; cần đối chiếu, không POST lại.')
    }
    if (!held.receipt.id) throw new Error('Receipt thiếu layoutId; không POST lại. Cần đối chiếu máy chủ.')
    const result = await pavementService.read(projectId, held.receipt.id)
    current()
    if (result.kind !== 'PLANNED' || result.routeVersionId !== held.pins.routeVersionId || result.segmentSetId !== held.pins.segmentSetId || result.contentHash !== held.receipt.contentHash || !result.layout || !sameLayout(result.layout, held.input.layout) || result.geometry.displayToleranceMeters !== held.input.displayToleranceMeters) throw new Error('Readback pavement không khớp command/receipt; giữ yêu cầu để đối chiếu.')
    verifyPavementGeometry(result)
    // Keep acceptance durable until the caller also resolves the route and renders the snapshot.
    return result
  } catch (error: any) {
    if (!held.receipt && [400, 422].includes(error?.response?.status)) { current(); held.rejected = true; sessionStorage.setItem(key, JSON.stringify(held)) }
    throw error
  } finally { busy.delete(key) }
}

export function completePavement(projectId: string, result: PavementLayoutView): void {
  const key = journal(projectId), held = pendingPavement(projectId)
  if (useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER || busy.has(key) ||
    !held?.receipt || held.receipt.id !== result.id || held.receipt.contentHash !== result.contentHash ||
    result.projectId !== projectId || result.routeVersionId !== held.pins.routeVersionId || result.segmentSetId !== held.pins.segmentSetId) throw new Error('Chưa đối chiếu đúng snapshot pavement; giữ receipt, không tạo lại.')
  sessionStorage.removeItem(key)
}

export function verifyPavementGeometry(value: PavementLayoutView): void {
  const cells = value.geometry.plan?.cells, slabs = value.geometry.slabs
  if (!cells?.length || cells.length !== slabs.length || new Set(slabs.map(slab => slab.key)).size !== slabs.length) throw new Error('Geometry server thiếu cell/tấm, sai số lượng hoặc trùng mã tấm.')
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i], slab = slabs[i]
    if (cell.sequence !== i + 1 || slab.plannedSequence !== cell.sequence || slab.key !== String(cell.sequence) ||
      ![cell.fromOffsetMeters, cell.toOffsetMeters, cell.fromLateralMeters, cell.toLateralMeters].every(Number.isFinite) ||
      !(slab.lengthMeters! > 0) || !(slab.widthMeters! > 0) || slab.footprint.length < 4 ||
      !slab.footprint.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)) ||
      slab.footprint[0].x !== slab.footprint[slab.footprint.length - 1].x || slab.footprint[0].y !== slab.footprint[slab.footprint.length - 1].y) throw new Error('Geometry server sai thứ tự, mã, kích thước hoặc footprint của tấm.')
  }
}

export function revisePavement(projectId: string): void {
  const key = journal(projectId), held = pendingPavement(projectId)
  if (busy.has(key) || !held?.rejected || held.receipt) throw new Error('Command chưa bị từ chối rõ ràng; không được đổi key/payload.')
  sessionStorage.removeItem(key)
}
