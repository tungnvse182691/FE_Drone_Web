import { Severity } from '../types/enums'

// Bảng nhãn mức độ nghiêm trọng dùng chung (enum Severity ↔ nhãn tiếng Việt). Không có mức mặc định.
export const SEVERITY_LABEL: Record<Severity, string> = {
  [Severity.LOW]: 'Thấp',
  [Severity.MEDIUM]: 'Trung bình',
  [Severity.HIGH]: 'Cao',
  [Severity.CRITICAL]: 'Nghiêm trọng',
}
export const SEVERITY_OPTIONS: Array<{ value: Severity; label: string }> = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL].map(value => ({ value, label: SEVERITY_LABEL[value] }))
export const isSeverity = (value: unknown): value is Severity => typeof value === 'string' && value in SEVERITY_LABEL
/** Mã lạ/chưa có KHÔNG bị đổi thành LOW: trả 'Chưa phân loại'. */
export const severityLabel = (value?: string | null): string => isSeverity(value) ? SEVERITY_LABEL[value] : 'Chưa phân loại'
/** Ngược lại: nhãn chung → mã; không khớp trả null (không suy đoán). */
export const severityFromLabel = (label?: string | null): Severity | null => (Object.entries(SEVERITY_LABEL).find(([, v]) => v === label)?.[0] as Severity | undefined) ?? null
