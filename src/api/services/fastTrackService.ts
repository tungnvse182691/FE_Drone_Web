import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'
import { PolicyThresholdConfig } from '../../types/domain'

export type { PolicyThresholdConfig }

export const DEFAULT_POLICY: PolicyThresholdConfig = {
  version: 'Policy v2.1',
  status: 'ACTIVE',
  maxAreaM2: 0.5,
  maxDepthCm: 5.0,
  maxPerimeterM: 3.0,
  allowedSeverities: ['LOW', 'MEDIUM'],
  slaHours: 24,
  activatedBy: 'Kỹ sư Đỗ Quốc Hoàng (PM)',
  activatedAt: '08:30 • 15/08/2026',
  appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
  description: 'Quy chuẩn kích hoạt tự động: 3/3 Tiêu chí bắt buộc phải thỏa mãn để tự động mở luồng Fast Track.'
}

export const fastTrackService = {
  getPolicy(): PolicyThresholdConfig {
    return getFromStorage<PolicyThresholdConfig>(STORAGE_KEYS.FAST_TRACK_POLICY, DEFAULT_POLICY)
  },

  savePolicy(policy: PolicyThresholdConfig): void {
    saveToStorage(STORAGE_KEYS.FAST_TRACK_POLICY, policy)
  },

  resetPolicy(): void {
    saveToStorage(STORAGE_KEYS.FAST_TRACK_POLICY, DEFAULT_POLICY)
  }
}
