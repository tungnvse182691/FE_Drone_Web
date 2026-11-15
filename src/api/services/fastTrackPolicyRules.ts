import type { RepairMeasurementRule } from './fastTrackService'
// GroundTruthMeasurement.CreateCaptured and MeasurementType at b89a52fe11ed. Never convert values/units.
export function policyRuleSupported(rule: RepairMeasurementRule): boolean {
  return rule.code==='Area' ? rule.unit==='m²' : ['DepressionDepth','SlabFaultingHeight','ShoulderErosionExtent'].includes(rule.code) && ['mm','cm','m'].includes(rule.unit)
}
export function assertPolicyRules(rules: RepairMeasurementRule[]) {
  if(!Array.isArray(rules) || !rules.length || new Set(rules.map(r=>r.code)).size!==rules.length || rules.some(r=>!policyRuleSupported(r) || !Number.isFinite(r.minimum) || !Number.isFinite(r.maximum) || r.minimum<0 || r.maximum<r.minimum)) throw new Error('Quy tắc không khớp loại đo/đơn vị runtime hoặc thiếu ngưỡng. Area dùng m²; loại đo độ dài dùng đúng mm, cm hoặc m. Không tự chuyển đơn vị hay sửa journal.')
}
export function policyRuleHasBounds(rule?: RepairMeasurementRule): rule is RepairMeasurementRule { return !!rule && Number.isFinite(rule.minimum) && Number.isFinite(rule.maximum) }
export function policyRuleRange(rule?: RepairMeasurementRule): string {
  if(!policyRuleHasBounds(rule))return 'Chưa quy định'
  return rule.minimum===0 ? `≤ ${rule.maximum}` : `${rule.minimum}–${rule.maximum}`
}
export function policyRuleText(rule?: RepairMeasurementRule): string {
  return policyRuleHasBounds(rule) ? `${policyRuleRange(rule)} ${rule.unit}${policyRuleSupported(rule)?'':' (không khớp loại đo/đơn vị runtime)'}` : 'Chưa quy định'
}
