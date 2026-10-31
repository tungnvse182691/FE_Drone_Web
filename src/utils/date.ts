/**
 * RoadGuard - Format timestamp chuẩn hiển thị khớp 100% CSDL Backend (SQL Server)
 * Chuyển chuỗi DATETIMEOFFSET/ISO (vd: 2026-10-30 12:07:45.8410920 +00:00 hoặc 2026-10-30T12:07:45.8410920Z)
 * thành định dạng thân thiện "HH:mm - dd/MM/yyyy" đúng từng con số lưu trong Database
 */
export function formatConflictDateTime(isoString?: string | null): string {
  if (!isoString) return 'Chưa ghi nhận'
  try {
    const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
    if (match) {
      const [, year, month, day, hours, mins] = match
      return `${hours}:${mins} - ${day}/${month}/${year}`
    }
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${hours}:${mins} - ${day}/${month}/${year}`
  } catch {
    return isoString
  }
}

