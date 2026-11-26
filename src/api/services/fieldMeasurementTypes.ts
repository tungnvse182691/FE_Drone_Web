// Loại đo FIELD: enum kỹ thuật CỐ ĐỊNH của BE (MeasurementType), không có API danh mục.
// Nguồn: deploy/fe-handoff/ASSIGN-RETENTION-FIELD.md mục 4. `requiredMeasurementType` khi tạo task là MÃ SỐ 1–6;
// `measurements[].type` trong bản nộp là TÊN enum.
export interface FieldMeasurementTypeInfo { code: number; enumName: string; label: string; dimension: 'LENGTH' | 'AREA'; units: string }
export const FIELD_MEASUREMENT_TYPES: FieldMeasurementTypeInfo[] = [
  { code: 1, enumName: 'DepressionDepth', label: 'Độ sâu lún', dimension: 'LENGTH', units: 'mm, cm, m' },
  { code: 2, enumName: 'SlabFaultingHeight', label: 'Chênh cao tấm', dimension: 'LENGTH', units: 'mm, cm, m' },
  { code: 3, enumName: 'ShoulderErosionExtent', label: 'Phạm vi xói vai đường', dimension: 'LENGTH', units: 'mm, cm, m' },
  { code: 4, enumName: 'Area', label: 'Diện tích', dimension: 'AREA', units: 'm²' },
  { code: 5, enumName: 'DepressionLength', label: 'Chiều dài vùng lún', dimension: 'LENGTH', units: 'mm, cm, m' },
  { code: 6, enumName: 'DepressionWidth', label: 'Chiều rộng vùng lún', dimension: 'LENGTH', units: 'mm, cm, m' }
]
export const FIELD_MEASUREMENT_CODES = FIELD_MEASUREMENT_TYPES.map((t) => t.code)
export const isFieldMeasurementCode = (code: unknown): code is number => typeof code === 'number' && FIELD_MEASUREMENT_CODES.includes(code)
export const measurementTypeLabel = (code: number): string => {
  const t = FIELD_MEASUREMENT_TYPES.find((x) => x.code === code)
  return t ? `${t.label} (${t.enumName})` : `Loại đo mã ${code} chưa có trong danh sách BE`
}
// Tên enum trong bản nộp (measurements[].type) → nhãn tiếng Việt; tên lạ giữ nguyên để không bịa.
export const measurementEnumLabel = (name?: string | null): string => {
  if (!name) return 'Chưa có loại'
  const t = FIELD_MEASUREMENT_TYPES.find((x) => x.enumName.toLowerCase() === name.toLowerCase())
  return t ? `${t.label} (${t.enumName})` : name
}
