/**
 * ROADGUARD CENTRAL LOCALSTORAGE BRIDGE
 * Quản lý đồng bộ trạng thái lưu trữ giữa PM và Supervisor trên cùng trình duyệt.
 * Hỗ trợ CustomEvent để các component tự động re-render khi vai trò kia cập nhật.
 */

export const STORAGE_KEYS = {
  PROJECTS: 'roadguard_projects_v2',
  ALIGNMENTS: 'roadguard_alignments_v2',
  SURVEYS: 'roadguard_surveys_v2',
  REPAIR_PROPOSALS: 'roadguard_repair_proposals_v2',
  PROPOSAL_ITEMS: 'roadguard_proposal_items_v2',
  FAST_TRACK_POLICY: 'roadguard_fast_track_policy_v2',
  TRIAGE_CASES: 'roadguard_triage_cases_v2',
  FIELD_TASKS: 'roadguard_field_tasks',
  ACCEPTANCE_RECORDS: 'roadguard_acceptance_records_v2'
} as const

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn(`[RoadGuard Storage] Failed to get ${key}`, err)
    return defaultValue
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    // Phát sự kiện để các tab hoặc component khác cập nhật tức thì
    window.dispatchEvent(new CustomEvent('roadguard_state_change', { detail: { key, value } }))
  } catch (err) {
    console.error(`[RoadGuard Storage] Failed to set ${key}`, err)
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent('roadguard_state_change', { detail: { key, value: null } }))
  } catch (err) {
    console.error(`[RoadGuard Storage] Failed to remove ${key}`, err)
  }
}
