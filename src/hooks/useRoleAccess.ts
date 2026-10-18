/**
 * Role-based access control theo tài liệu 17_10 (nhóm trưởng)
 *
 * Phân quyền Web (17_10):
 * - Web chỉ có Supervisor và PM (KHÔNG có Reporter - Reporter chỉ trên Mobile)
 * - PM KHÔNG được approve (API-142 Supervisor-only)
 * - Supervisor Fast Track chỉ xem (informational), PM chốt cuối
 * - SUP-06: không có API nào (candidate/defect là PM-only)
 *
 * @see docs/HoangHaiWarrantySystem-Official/05_Web/02_Supervisor-Screen-API-Matrix.md
 * @see docs/HoangHaiWarrantySystem-Official/05_Web/03_PM-Screen-API-Matrix.md
 */
import { RoleCode } from '../types/enums'
import { useAuthStore } from '../store/authStore'

/**
 * Kiểm tra user hiện tại có phải Supervisor không
 */
export function useIsSupervisor(): boolean {
  const user = useAuthStore((s) => s.user)
  return user?.role === RoleCode.SUPERVISOR
}

/**
 * Kiểm tra user hiện tại có phải PM không
 */
export function useIsPM(): boolean {
  const user = useAuthStore((s) => s.user)
  return user?.role === RoleCode.PROJECT_MANAGER
}

/**
 * 17_10: Chỉ Supervisor được thấy nút Phê duyệt/Từ chối (API-142)
 * PM không bao giờ có nút này (AGENTS.md Điều 2)
 */
export function useCanApprove(): boolean {
  return useIsSupervisor()
}

/**
 * 17_10 PM-10: Fast Track - PM chốt cuối, Supervisor chỉ xem (informational)
 * Trả về true nếu user được phép thực hiện Fast Track dispatch
 */
export function useCanDispatchFastTrack(): boolean {
  return useIsPM()
}

/**
 * 17_10: Web không có Reporter (Reporter chỉ trên Mobile Expo)
 * Hàm này luôn trả về false, dùng để document rõ ràng
 */
export function useIsReporter(): boolean {
  return false
}

/**
 * Kiểm tra role có được phép truy cập route không
 * Dùng cho route guards
 */
export function hasRoleAccess(
  userRole: RoleCode | undefined,
  allowedRoles: RoleCode[]
): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}
