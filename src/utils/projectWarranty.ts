import type { HubProject } from '../types/domain'

export function validWarrantyDates(start?: string, end?: string): boolean {
  const valid = (value?: string) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  return valid(start) && valid(end) && end! >= start!
}

export function hasWarrantyData(project: HubProject): boolean {
  return !project.warranty_data_missing && validWarrantyDates(project.warranty_start_date || project.handover_date, project.warranty_end_date) &&
    Number.isFinite(project.days_remaining) && Number.isFinite(project.warranty_passed_percent)
}
