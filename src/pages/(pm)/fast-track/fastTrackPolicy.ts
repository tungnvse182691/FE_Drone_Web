import { PolicyThresholdConfig, PolicyHistoryItem, AuditLogItem } from './types'

export const INITIAL_POLICY: PolicyThresholdConfig = {
  version: 'Policy v2.1',
  status: 'ACTIVE',
  maxAreaM2: 0.5,
  maxDepthCm: 5.0,
  maxPerimeterM: 3.0,
  allowedSeverities: ['LOW', 'MEDIUM'],
  slaHours: 24,
  activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
  activatedAt: '08:30 • 15/08/2026',
  appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
  description: 'Quy chuẩn kích hoạt tự động: 3/3 Tiêu chí bắt buộc phải thỏa mãn để tự động mở luồng Fast Track.'
}

export const INITIAL_POLICY_HISTORY: PolicyHistoryItem[] = [
  {
    id: 'pol-21',
    version: 'Policy v2.1',
    displayName: 'Policy v2.1 (Hiện hành)',
    status: 'ACTIVE',
    activatedBy: 'PM Hoàng',
    activatedAt: '08:30 15/08/2026',
    route: 'Áp dụng toàn tuyến QL1A (Km 1000 - Km 1080)',
    maxArea: 0.5,
    maxDepth: 5.0,
    slaHours: 24,
    maxPerimeter: 3.0
  },
  {
    id: 'pol-20',
    version: 'Policy v2.0',
    displayName: 'Policy v2.0 (Lưu trữ)',
    status: 'ARCHIVED',
    activatedBy: 'PGĐ Trần Nam',
    activatedAt: '10:15 01/06/2026',
    route: 'Ngưỡng diện tích 0.4 m² • Độ sâu ≤ 4.5 cm',
    maxArea: 0.4,
    maxDepth: 4.5,
    slaHours: 24,
    maxPerimeter: 2.8
  },
  {
    id: 'pol-19',
    version: 'Policy v1.9',
    displayName: 'Policy v1.9 (Lưu trữ)',
    status: 'ARCHIVED',
    activatedBy: 'PM Hoàng',
    activatedAt: '14:00 12/01/2026',
    route: 'Ngưỡng diện tích 0.3 m² • Thử nghiệm thí điểm',
    maxArea: 0.3,
    maxDepth: 4.0,
    slaHours: 36,
    maxPerimeter: 2.5
  }
]

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    title: 'Cập nhật Policy v2.1 (ACTIVE)',
    time: '15/08/2026 08:30:12',
    user: 'Nguyễn Văn Hoàng (PM)',
    hash: 'sha256:7f8a9b...c41e',
    note: 'Nâng ngưỡng diện tích từ 0.4 m² lên 0.5 m² để phù hợp điều kiện thời tiết mùa mưa.'
  },
  {
    title: 'Kích hoạt Policy v2.0',
    time: '01/06/2026 10:15:45',
    user: 'Trần Nam (PGĐ Dự án)',
    hash: 'sha256:2b4c6e...a991',
    note: 'Áp dụng thí điểm tuyến mở rộng Km 1025 - Km 1045.'
  }
]
