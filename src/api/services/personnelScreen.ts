import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import type { SystemUserAccount } from '../../types/domain'
import { apiClient } from '../client'
import { personnelService, getRoleLabel, type StaffUserDto } from './personnelService'

export type PersonnelNoticeKind = 'success' | 'error' | 'warning' | 'info'
export const personnelBlocks = {
  account: 'Đổi vai trò chưa được tích hợp trên màn hình này bằng phiên Web. Chưa gửi lệnh.',
  invitation: 'Gửi lời mời chưa được API hỗ trợ bằng phiên Web. Chưa gửi thư mời.',
  reset: 'Đặt lại mật khẩu chưa được API hỗ trợ bằng phiên Web. Chưa đổi mật khẩu.',
  primary: 'Chuyển PM chính chưa được API hỗ trợ bằng phiên Web. Chưa chuyển phân công.',
  member: 'Chỉ PM được thêm Operator/Crew bằng command thành viên dự án; không dùng PATCH tài khoản để phân công.',
}
export class PersonnelUiError extends Error {}
export function personnelMessage(error: any): string {
  if (error instanceof PersonnelUiError) return error.message
  const code = error?.response?.data?.code, status = error?.response?.status
  if (code === 'csrf_failed') return 'CSRF chưa hợp lệ. Hãy kiểm tra phiên và thử lại đúng yêu cầu.'
  if (code === 'auth_session_revoked' || status === 401 && !useAuthStore.getState().isAuthenticated) return 'Phiên đăng nhập không còn hiệu lực.'
  if (status === 401) return 'Yêu cầu chưa được xác thực bằng phiên Web hiện tại.'
  if (code === 'access_forbidden') return 'Bạn không có quyền thực hiện thao tác này.'
  if (code === 'identity_user_not_found') return 'Không tìm thấy tài khoản đủ điều kiện cho thao tác này.'
  if (code === 'identity_email_conflict') return 'Email đã được sử dụng.'
  if (code === 'duplicate_request' || code === 'idempotency_key_reused') return 'Khóa yêu cầu đã dùng cho nội dung khác. Cần đối chiếu yêu cầu cũ.'
  if (code === 'auth_concurrency_conflict' || code === 'concurrency_conflict' || status === 412) return 'Phiên bản tài khoản đã thay đổi. Bản nhập được giữ để đối chiếu.'
  if (status === 428) return 'Thiếu phiên bản hoặc điều kiện gửi yêu cầu. Hãy đọc lại hồ sơ.'
  if (code === 'validation_error' || status === 400 || status === 422) return 'Thông tin chưa hợp lệ. Hãy kiểm tra lại bản nhập.'
  if (status === 403) return 'Máy chủ từ chối yêu cầu. Hãy kiểm tra điều kiện truy cập.'
  if (status === 409) return 'Yêu cầu xung đột với dữ liệu hiện tại.'
  if (error?.request || ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(error?.code)) return 'Không kết nối được máy chủ. Vui lòng thử lại.'
  return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại hoặc đối chiếu hồ sơ.'
}
export function personnelRole(role?: string | null): RoleCode {
  const roles: Record<string, RoleCode> = { SUPERVISOR: RoleCode.SUPERVISOR, PM: RoleCode.PROJECT_MANAGER, PROJECT_MANAGER: RoleCode.PROJECT_MANAGER, OPERATOR: RoleCode.DRONE_OPERATOR, DRONE_OPERATOR: RoleCode.DRONE_OPERATOR, CREW: RoleCode.REPAIR_CREW, REPAIR_CREW: RoleCode.REPAIR_CREW, REPORTER: RoleCode.REPORTER }
  if (!role || !Object.prototype.hasOwnProperty.call(roles, role)) throw new PersonnelUiError('Vai trò trả về chưa hợp lệ; danh sách chưa tải đầy đủ.')
  return roles[role]
}
export function accountRow(dto: StaffUserDto): SystemUserAccount {
  if (!dto.userId) throw new PersonnelUiError('Danh bạ thiếu định danh tài khoản.')
  const role = personnelRole(dto.role)
  return { id: dto.userId, full_name: dto.displayName || 'Chưa có thông tin', email: dto.email || '', phone: dto.phoneNumber || '', role, role_label: getRoleLabel(role), status: dto.status === 'ACTIVE' || dto.status === 'SUSPENDED' ? dto.status : dto.status === 'PENDING' ? 'INVITED' : 'UNKNOWN', assigned_project_ids: [], project_scope: 'Chưa tải phân công', project_memberships: [], device_info: '', ip_address: '', last_active: '' }
}

export async function readPersonnelProjects(): Promise<Array<{ id: string; name: string; code?: string; pm_user_id?: string; pm_name?: string }>> {
  const epoch = useAuthStore.getState().authEpoch, all: Array<{ id: string; name: string; code?: string; pm_user_id?: string; pm_name?: string }> = [], cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const response = await apiClient.get('/projects', { params: { limit: 100, cursor } })
    if (useAuthStore.getState().authEpoch !== epoch) throw new PersonnelUiError('Phiên đã thay đổi; bỏ danh sách dự án cũ.')
    if (!Array.isArray(response.data?.items)) throw new PersonnelUiError('Danh sách dự án trả sai cấu trúc.')
    response.data.items.forEach((p: any) => { if (!p.projectId) throw new PersonnelUiError('Dự án thiếu định danh.'); all.push({ id: p.projectId, name: p.name || 'Chưa có thông tin', code: p.projectCode, pm_user_id: p.primaryProjectManagerUserId || undefined, pm_name: p.primaryProjectManagerName || undefined }) })
    cursor = response.data.nextCursor || undefined
    if (cursor && cursors.has(cursor)) throw new PersonnelUiError('Phân trang dự án bị lặp; danh sách chưa đầy đủ.')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return all
}

// Account GET omits phone/status. Bracket directory read with equal opaque ETags so the visible phone and version describe one snapshot.
export async function personnelSnapshot(userId: string) {
  if (useAuthStore.getState().user?.role !== RoleCode.SUPERVISOR) throw new PersonnelUiError('Chỉ Giám sát được đọc snapshot tài khoản quản trị.')
  const epoch = useAuthStore.getState().authEpoch
  const before = await personnelService.fetchUserDetail(userId)
  if (!['SUPERVISOR', 'PM', 'OPERATOR', 'CREW', 'REPORTER'].includes(before.data.role || '')) throw new PersonnelUiError('Role wire tài khoản chưa hợp lệ; chưa tạo snapshot.')
  const rows = await personnelService.fetchStaffDirectory({ role: before.data.role! })
  const after = await personnelService.fetchUserDetail(userId)
  if (useAuthStore.getState().authEpoch !== epoch) throw new PersonnelUiError('Phiên đã thay đổi; bỏ hồ sơ cũ.')
  if (!/^"[A-Za-z0-9+/]+={0,2}"$/.test(before.etag) || before.etag !== after.etag || before.data.id !== userId || after.data.id !== userId) throw new PersonnelUiError('Hồ sơ thay đổi trong lúc đọc. Hãy đọc lại trước khi sửa.')
  const row = rows.find(row => row.userId === userId)
  if (!row || row.role !== after.data.role) throw new PersonnelUiError('Chưa đọc đầy đủ hồ sơ tài khoản.')
  return { account: accountRow(row), etag: after.etag, wireRole: after.data.role }
}

type PhoneCommand = { userId: string; phone: string; etag: string; key: string; receipt?: boolean; conflict?: boolean; rejected?: boolean; keyConflict?: boolean }
const writes = new Set<string>(), phoneMemory = new Map<string, PhoneCommand>()
const phoneKey = () => `rg_personnel_phone_${useAuthStore.getState().user?.id}`
export function pendingPersonnelPhone(): PhoneCommand | null {
  if (phoneMemory.has(phoneKey())) return { ...phoneMemory.get(phoneKey())! }
  const text = sessionStorage.getItem(phoneKey())
  if (!text) return null
  try { const value = JSON.parse(text); if (!value.userId || !value.key || !value.etag || !value.phone) throw Error(); return value }
  catch { throw new PersonnelUiError('Không đọc được yêu cầu cũ. Cần đối chiếu trước khi lưu tiếp.') }
}
export function acceptPhoneVersion() {
  const held = pendingPersonnelPhone()
  if (!held?.conflict || held.receipt || writes.has(phoneKey())) throw new PersonnelUiError('Yêu cầu cũ chưa đủ điều kiện thay phiên bản.')
  sessionStorage.removeItem(phoneKey()); phoneMemory.delete(phoneKey())
}
export function reviseRejectedPhone() {
  const held = pendingPersonnelPhone()
  if (!held?.rejected || held.receipt || held.conflict || held.keyConflict || writes.has(phoneKey())) throw new PersonnelUiError('Yêu cầu cũ chưa đủ điều kiện sửa lại.')
  sessionStorage.removeItem(phoneKey()); phoneMemory.delete(phoneKey())
}
export async function savePersonnelPhone(userId: string, phone: string, etag: string, retry = false) {
  const state = useAuthStore.getState(), actor = state.user, epoch = state.authEpoch, journal = phoneKey()
  if (actor?.role !== RoleCode.SUPERVISOR) throw new PersonnelUiError('Chỉ Giám sát được cập nhật số điện thoại nhân sự.')
  const current = () => { if (useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor.id) throw new PersonnelUiError('Phiên đã thay đổi; bỏ kết quả cũ.') }
  let held = pendingPersonnelPhone()
  if (held && !retry || held && (held.userId !== userId || held.phone !== phone || held.etag !== etag)) throw new PersonnelUiError('Hãy đối chiếu đúng yêu cầu trước, không tạo ý định mới.')
  if (writes.has(journal)) throw new PersonnelUiError('Đang đối chiếu yêu cầu. Vui lòng chờ.')
  if (held?.conflict) throw new PersonnelUiError('Cần đọc lại hồ sơ và quyết định phiên bản trước khi gửi lại.')
  held ||= { userId, phone, etag, key: crypto.randomUUID() }
  try { sessionStorage.setItem(journal, JSON.stringify(held)) } catch { throw new PersonnelUiError('Không giữ được khóa yêu cầu an toàn; chưa gửi lệnh.') }
  phoneMemory.set(journal, held)
  writes.add(journal)
  try {
    if (!held.receipt) { await personnelService.updateUserPhoneNumber(userId, held.phone, { etag: held.etag, idempotencyKey: held.key }); current(); held.receipt = true; sessionStorage.setItem(journal, JSON.stringify(held)) }
    const result = await personnelSnapshot(userId); current()
    if (result.account.phone !== held.phone) throw new PersonnelUiError('Kết quả số điện thoại đọc lại chưa khớp.')
    sessionStorage.removeItem(journal); phoneMemory.delete(journal)
    return result
  } catch (error: any) {
    current()
    if (!held.receipt && error?.response?.status === 412) held.conflict = true
    else if (!held.receipt && error?.response?.status === 409) held.keyConflict = true
    else if (!held.receipt && error?.response?.status >= 400 && error.response.status < 500) held.rejected = true
    phoneMemory.set(journal, held); try { sessionStorage.setItem(journal, JSON.stringify(held)) } catch { /* Receipt remains in memory; its original key is retained. */ }
    if (held.receipt) throw Object.assign(new PersonnelUiError('Số điện thoại đã được lưu; chưa đọc lại đầy đủ kết quả. Chỉ thử đọc lại, không gửi PATCH mới.'), { accepted: true })
    throw error
  } finally { writes.delete(journal) }
}

// Status-only account commands. Memberships and project roles are never patched here.
type StatusSnapshot = Awaited<ReturnType<typeof personnelSnapshot>>
type StatusCommand = { userId: string; payload: import('./personnelService').UpdateUserPayload; etag: string; key: string; receipt?: { etag: string; id?: string; role?: string | null }; conflict?: boolean; rejected?: boolean }
const statusWrites = new Set<string>(), statusMemory = new Map<string, StatusCommand>()
const statusJournal = () => `rg_personnel_status_${useAuthStore.getState().user?.id}`
export function pendingPersonnelStatus(): StatusCommand | null {
  const journal = statusJournal(), memory = statusMemory.get(journal)
  if (memory) return JSON.parse(JSON.stringify(memory))
  const text = sessionStorage.getItem(journal)
  if (!text) return null
  const value = JSON.parse(text)
  if (!value.userId || !value.key || !value.etag || !value.payload?.reason) throw new PersonnelUiError('Không đọc được lệnh trạng thái đang chờ; cần đối chiếu.')
  return value
}
export async function savePersonnelStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED', reason: string, snapshot: StatusSnapshot | null, retry = false) {
  const state = useAuthStore.getState(), actor = state.user, epoch = state.authEpoch, journal = statusJournal()
  if (!state.isAuthenticated || actor?.role !== RoleCode.SUPERVISOR) throw new PersonnelUiError('Chỉ Giám sát được đình chỉ/khôi phục tài khoản.')
  const current = () => { const now = useAuthStore.getState(); if (!now.isAuthenticated || now.authEpoch !== epoch || now.user?.id !== actor.id) throw new PersonnelUiError('Phiên đã thay đổi; bỏ kết quả trạng thái cũ.') }
  let held = pendingPersonnelStatus()
  if (statusWrites.has(journal)) throw new PersonnelUiError('Đang đối chiếu lệnh trạng thái. Vui lòng chờ.')
  if (held && (!retry || held.userId !== userId || held.payload.status !== status || held.payload.reason !== reason.trim())) throw new PersonnelUiError('Cần đối chiếu đúng lệnh cũ; chưa tạo ý định mới.')
  if (held?.conflict) throw new PersonnelUiError('Phiên bản tài khoản xung đột; giữ lý do, không tự gửi lại với ETag mới.')
  if (held?.rejected) throw new PersonnelUiError('Lệnh đã bị từ chối; chọn sửa yêu cầu trước khi thay nội dung.')
  if (!held) {
    if (!snapshot || snapshot.account.id !== userId || !/^"[A-Za-z0-9+/]+={0,2}"$/.test(snapshot.etag) || !reason.trim() || !['ACTIVE', 'SUSPENDED'].includes(status) || !['SUPERVISOR', 'PM', 'OPERATOR', 'CREW', 'REPORTER'].includes(snapshot.wireRole || '')) throw new PersonnelUiError('Cần snapshot/ETag/role wire hợp lệ và lý do không để trống.')
    held = { userId, payload: { status, role: snapshot.wireRole as StatusCommand['payload']['role'], reason: reason.trim() }, etag: snapshot.etag, key: crypto.randomUUID() }
  }
  const persist = () => { statusMemory.set(journal, held!); sessionStorage.setItem(journal, JSON.stringify(held)) }
  persist(); statusWrites.add(journal)
  try {
    if (!held.receipt) {
      const response = await personnelService.updateUser(userId, held.payload, held.etag, held.key)
      held.receipt = { etag: response.etag, id: response.data?.id, role: response.data?.role }; persist(); current()
    }
    current()
    if (held.receipt.id !== userId || held.receipt.role !== held.payload.role || !/^"[A-Za-z0-9+/]+={0,2}"$/.test(held.receipt.etag)) throw new PersonnelUiError('Receipt tài khoản/role/ETag chưa khớp; giữ lệnh, không PATCH lại.')
    const result = await personnelSnapshot(userId); current()
    if (result.account.status !== held.payload.status || result.wireRole !== held.payload.role || result.etag !== held.receipt.etag) throw new PersonnelUiError('Readback trạng thái/role/version chưa khớp receipt; chỉ thử đọc lại.')
    sessionStorage.removeItem(journal); statusMemory.delete(journal); return result
  } catch (error: any) {
    current()
    if (!held.receipt && [409, 412].includes(error?.response?.status)) held.conflict = true
    else if (!held.receipt && error?.response?.status >= 400 && error.response.status < 500) held.rejected = true
    statusMemory.set(journal, held); try { persist() } catch { /* Receipt/key also retained in memory. */ }
    if (held.receipt) throw Object.assign(new PersonnelUiError('Trạng thái đã được lưu; chưa đọc lại đầy đủ. Retry chỉ GET, không PATCH mới.'), { accepted: true })
    throw error
  } finally { statusWrites.delete(journal) }
}

export function reviseRejectedPersonnelStatus() {
  const journal = statusJournal(), held = pendingPersonnelStatus()
  if (!held?.rejected || held.receipt || held.conflict || statusWrites.has(journal)) throw new PersonnelUiError('Chưa được sửa yêu cầu đang chờ hoặc đã có receipt.')
  sessionStorage.removeItem(journal); statusMemory.delete(journal)
}
