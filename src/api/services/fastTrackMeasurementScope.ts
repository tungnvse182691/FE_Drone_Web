// b89a52fe11ed FieldInspectionTask.ValidateScope: JSON object, default JsonDocument depth 64.
// There is no typed scope-property schema in this validator. Free text belongs in Instructions.
export function assertFastTrackMeasurementScope(value: unknown): asserts value is string {
  try {
    if (typeof value !== 'string') throw new Error()
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    // Count containers in the raw JSON too: parsing alone would discard duplicate object keys.
    let depth = 0, quoted = false, escaped = false
    for (const ch of value) {
      if (quoted) {
        if (escaped) escaped = false
        else if (ch === '\\') escaped = true
        else if (ch === '"') quoted = false
      } else if (ch === '"') quoted = true
      else if (ch === '{' || ch === '[') { if (++depth > 64) throw new Error() }
      else if (ch === '}' || ch === ']') depth--
    }
  } catch {
    throw new Error('Phạm vi đo trong lệnh chưa rõ kết quả không hợp lệ theo ValidateScope. Giữ nguyên journal/key/body để đối chiếu; chưa gửi POST.')
  }
}

export function fastTrackMeasurementScope(description: string, instructions: string) {
  if (typeof description !== 'string' || typeof instructions !== 'string') throw new Error('Mô tả phạm vi và chỉ dẫn phải là văn bản.')
  const combined = [instructions, description].filter(text => text.length > 0).join('\n')
  // CreateRepair calls CreateOperational, whose NormalizeOptional(Instructions) limit is 1000.
  if (combined.trim().length > 1000) throw new Error('Phạm vi và chỉ dẫn vượt quá 1000 ký tự. Rút gọn nội dung trước khi gửi; hệ thống không tự cắt bớt.')
  return {measurementScope: '{}', instructions: combined}
}
