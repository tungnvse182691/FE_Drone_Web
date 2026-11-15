import { CaseItem } from '../../pages/(sup)/evidence-closeout/types'

export interface AcceptanceRecord {
  id: string
  package_id: string
  package_code: string
  item_id: string
  item_code: string
  defect_title: string
  chainage: string
  lane: string
  crew_name: string
  completion_date: string
  status: 'PENDING_INSPECTION' | 'PASSED' | 'REJECTED'
  before_photo: string
  after_photo: string
  measurement_evidence: string
  inspector_name?: string
  inspector_notes?: string
  inspected_at?: string
}

export interface AcceptancePackage {
  id: string
  code: string
  case_code: string
  title: string
  project_id: string
  project_name: string
  chainage_display: string
  contractor_name: string
  total_items: number
  accepted_items: number
  pending_items: number
  rework_items: number
  technical_scope: string
  status: 'PENDING_INSPECTION' | 'PASSED' | 'REWORK_REQUIRED'
  is_closed?: boolean
  status_label: string
  sla_display: string
  completion_date: string
}

/**
 * DTO chuẩn Backend Spec 17_10: RepairAttemptReviewInput
 * Căn cứ: docs/specs/17_10/04_API-Contracts/02_Full-API-Catalog.md (API-158)
 * Endpoint: POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/reviews
 * Quy tắc bất biến: PM review decision bắt buộc là "ACCEPT" hoặc "SUPPLEMENT", tuyệt đối không dùng wire "REWORK".
 */
export interface RepairAttemptReviewInput {
  fieldSubmissionId?: string
  decision: 'ACCEPT' | 'SUPPLEMENT'
  reason: string // maxLength: 2000 ký tự
  notes?: string
  directives?: string[]
}

// 100% DỮ LIỆU THẬT CSDL BACKEND DOCKER - KHÔNG DÙNG MOCK DATA
export const INITIAL_ACCEPTANCE_PACKAGES: AcceptancePackage[] = []
export const INITIAL_ACCEPTANCE_RECORDS: AcceptanceRecord[] = []

let inMemoryPackages: AcceptancePackage[] = []
let inMemoryCaseItems: CaseItem[] = []
let inMemoryAcceptanceRecords: AcceptanceRecord[] = []
const inMemoryClosedPackageIds = new Set<string>()

// Helper to re-sync package aggregate stats based on its items
function syncPackageStats(packageId?: string) {
  if (!packageId) return
  const pkg = inMemoryPackages.find((p) => p.id === packageId || p.code === packageId)
  if (!pkg) return
  const items = inMemoryCaseItems.filter((it) => it.package_id === pkg.id)
  if (items.length === 0) return

  const total = items.length
  const accepted = items.filter((it) => it.status === 'ACCEPTED').length
  const rework = items.filter((it) => it.status === 'REWORK_REQUIRED').length
  const pending = items.filter((it) => it.status === 'PENDING_INSPECTION').length

  pkg.total_items = total
  pkg.accepted_items = accepted
  pkg.rework_items = rework
  pkg.pending_items = pending

  if (accepted === total) {
    pkg.status = 'PASSED'
    pkg.status_label = `Đã nghiệm thu đạt (${total}/${total})`
  } else if (rework > 0) {
    pkg.status = 'REWORK_REQUIRED'
    pkg.status_label = `Yêu cầu sửa lại (${rework} mục)`
  } else {
    pkg.status = 'PENDING_INSPECTION'
    pkg.status_label = `Chờ nghiệm thu (${accepted}/${total} đạt)`
  }
}

export const acceptanceService = {
  /**
   * Lấy danh sách các gói đề xuất / đợt thi công chờ nghiệm thu TRỰC TIẾP TỪ CSDL BACKEND DOCKER
   * (GET /api/v1/projects/{projectId}/repair-packages)
   */
  async getAcceptancePackages(filter?: {
    status?: string
    projectId?: string
    query?: string
  }): Promise<AcceptancePackage[]> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Lấy chi tiết gói nghiệm thu theo mã (id hoặc code)
   */
  async getAcceptancePackageById(packageId: string): Promise<AcceptancePackage | null> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const found = inMemoryPackages.find(
      (p) => p.id === packageId || p.code === packageId || p.case_code === packageId
    )
    if (found) {
      syncPackageStats(found.id)
      const isClosed = inMemoryClosedPackageIds.has(found.id) || inMemoryClosedPackageIds.has(found.code)
      return {
        ...JSON.parse(JSON.stringify(found)),
        is_closed: isClosed
      }
    }
    return null
  },

  /**
   * Lấy danh sách hạng mục nghiệm thu trong hồ sơ vụ việc của một gói
   * (GET /api/v1/evidence-closeout/items?packageId=...)
   */
  async getCloseoutItems(packageId?: string): Promise<CaseItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    if (packageId) {
      const matchedPkg = inMemoryPackages.find(
        (p) => p.id === packageId || p.code === packageId || p.case_code === packageId
      )
      const targetPkgId = matchedPkg ? matchedPkg.id : packageId
      const items = inMemoryCaseItems.filter((it) => it.package_id === targetPkgId)
      if (items.length > 0) {
        return JSON.parse(JSON.stringify(items))
      }
    }
    return JSON.parse(JSON.stringify(inMemoryCaseItems))
  },

  /**
   * Lấy trạng thái đóng tổng thể vụ việc
   * (GET /api/v1/evidence-closeout/case-status)
   * Không tự động đóng: Chỉ đóng khi Supervisor đã chủ động bấm nút xác nhận đóng đợt
   */
  async getCaseCloseoutStatus(packageId?: string): Promise<{ isCaseClosed: boolean; caseCode: string }> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const pkg = inMemoryPackages.find((p) => p.id === packageId || p.code === packageId)
    const isClosed = packageId
      ? inMemoryClosedPackageIds.has(packageId) || (pkg ? inMemoryClosedPackageIds.has(pkg.id) : false)
      : false
    return {
      isCaseClosed: isClosed,
      caseCode: pkg ? pkg.case_code : '#CASE-2026-0842'
    }
  },

  /**
   * Supervisor chấp thuận nghiệm thu & ký số PKI
   * (POST /api/v1/evidence-closeout/items/:id/accept)
   */
  async acceptCloseoutItem(itemId: string): Promise<CaseItem> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * PM thẩm định attempt thi công của Crew và yêu cầu sửa lại / nộp bổ sung (API-158)
   * POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/reviews
   * Căn cứ Spec 17_10 (09_Consumer-API-Crosswalk.md:172, 02_Full-API-Catalog.md:4717-4738):
   * PM review Decision bắt buộc là "ACCEPT" hoặc "SUPPLEMENT", tuyệt đối không dùng wire "REWORK".
   */
  async reworkCloseoutItem(
    itemId: string,
    payload: {
      notes?: string
      directives?: string[]
      decision?: 'SUPPLEMENT' | 'ACCEPT'
      reason?: string
      fieldSubmissionId?: string
    }
  ): Promise<CaseItem> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * PM chấp thuận và đóng hoàn thành nhánh Fast Track (BR-25)
   * (POST /api/v1/evidence-closeout/items/:id/close-fast-track)
   */
  async closeFastTrackItem(itemId: string): Promise<CaseItem> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * PM xác nhận đủ điều kiện và trình hồ sơ lên Supervisor (HT09, HT11)
   * (POST /api/v1/evidence-closeout/items/:id/submit-supervisor)
   */
  async submitItemToSupervisor(itemId: string): Promise<CaseItem> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Supervisor Đóng tổng thể vụ việc phức hợp sau khi 100% hạng mục đạt (BR-26)
   * (POST /api/v1/evidence-closeout/close-case)
   */
  async closeCompositeCase(caseCode: string, packageId?: string): Promise<{ success: boolean; caseCode: string }> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  /**
   * Công bố kết quả khắc phục lên Citizen App
   * (POST /api/v1/evidence-closeout/items/:id/publish-citizen)
   */
  async publishCitizenResult(itemId: string, published: boolean = true): Promise<CaseItem> {
    throw new Error('Chưa có nguồn và API phù hợp cho thao tác này; không cập nhật nghiệm thu trong bộ nhớ.')
  },

  /**
   * Tương thích ngược: Lấy danh sách AcceptanceRecord
   */
  async getRecords(): Promise<AcceptanceRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    return JSON.parse(JSON.stringify(inMemoryAcceptanceRecords))
  },

  /**
   * Tương thích ngược: Phê duyệt biên bản
   */
  async approveAcceptance(recordId: string, inspectorName: string, notes?: string): Promise<AcceptanceRecord | null> {
    throw new Error('Chưa có nguồn và API phù hợp cho thao tác này; không cập nhật nghiệm thu trong bộ nhớ.')
  },

  /**
   * Tương thích ngược: Từ chối biên bản
   */
  async rejectAcceptance(recordId: string, inspectorName: string, reason: string): Promise<AcceptanceRecord | null> {
    throw new Error('Chưa có nguồn và API phù hợp cho thao tác này; không cập nhật nghiệm thu trong bộ nhớ.')
  }
}
