/**
 * ROADGUARD CENTRAL MOCK DATA BRIDGE
 * Re-exports 100% từ Single Source of Truth (SSOT) `src/data/mockData.ts`.
 * Đảm bảo mọi component trong hệ thống import từ 'src/api/mock/data'
 * đều nhận được tập dữ liệu toàn vẹn, đồng nhất theo đồ thị 5 tầng quan hệ.
 */

export * from '../../data/mockData'
export { mockAuditTrailStats as mockAuditStats } from '../../data/mockData'
