/**
 * Kiểm hạn xử lý/hạn hoàn thành theo thời hạn bảo hành của dự án (trường thật từ work-package.warranties, phạm vi PROJECT).
 * Chỉ dùng cho min/max + chặn gửi + thông báo; không thay đổi payload. BE vẫn là nơi kiểm cuối.
 */
export interface WarrantyWindow { status: 'idle' | 'loading' | 'ready' | 'unknown'; startDate?: string; endDate?: string; note?: string }

/** Giá trị `max` cho input type=date. */
export const warrantyMaxDate = (w: WarrantyWindow): string | undefined => (w.status === 'ready' ? w.endDate : undefined)
/** Giá trị `max` cho input type=datetime-local (hết ngày cuối bảo hành, giờ địa phương). */
export const warrantyMaxDateTime = (w: WarrantyWindow): string | undefined => (w.status === 'ready' && w.endDate ? `${w.endDate}T23:59` : undefined)

const fmt = (d?: string) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : '')

/** Trả về thông báo lỗi nếu hạn vượt thời hạn bảo hành; chuỗi rỗng nếu hợp lệ hoặc chưa đủ dữ liệu để kết luận. */
export function warrantyDueError(w: WarrantyWindow, value: string, label: string): string {
  if (!value || w.status !== 'ready' || !w.endDate) return ''
  const limit = new Date(`${w.endDate}T23:59:59.999`).getTime()
  const due = value.length <= 10 ? new Date(`${value}T23:59:59`).getTime() : new Date(value).getTime()
  if (!Number.isFinite(due)) return ''
  return due > limit ? `${label} vượt thời hạn bảo hành của dự án (đến ${fmt(w.endDate)}). Chọn hạn không muộn hơn ngày này.` : ''
}

/** Ghi chú hiển thị dưới ô nhập. */
export function warrantyHint(w: WarrantyWindow): string {
  if (w.status === 'loading') return 'Đang đọc thời hạn bảo hành của dự án…'
  if (w.status === 'ready') return `Hạn tối đa theo bảo hành dự án: ${fmt(w.endDate)}.`
  if (w.status === 'unknown') return `${w.note || 'Chưa đọc được thời hạn bảo hành của dự án'}; chưa thể kiểm hạn theo bảo hành (máy chủ vẫn kiểm cuối).`
  return ''
}
