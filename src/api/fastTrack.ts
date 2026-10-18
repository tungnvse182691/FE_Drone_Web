/**
 * Fast Track Eligibility API theo tài liệu 17_10 (nhóm trưởng)
 *
 * API-146: GET /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/eligibility
 *
 * Nguyên tắc 17_10:
 * - missingReasons fail closed: nếu API trả về không eligible, UI TUYỆT ĐỐI không cho phép Fast Track
 * - preflight not irrevocable permission: kết quả eligibility chỉ là kiểm tra trước, không phải quyền bất khả thu hồi
 * - Policy thresholds do server quyết định, FE không hardcode
 */
import { apiClient } from './client'

export interface RepairEligibilityReadView {
  eligible: boolean
  /** Lý do không đủ điều kiện (fail closed) */
  missingReasons?: string[]
  activation?: string | null
  itemId: string
  bindingId: string
  policyRevisionId?: string | null
  policyContentHash?: string | null
  policyState?: string | null
  assessmentId?: string | null
  version?: string | null
}

/**
 * API-146: Kiểm tra điều kiện Fast Track cho một item
 *
 * @param projectId - ID dự án
 * @param packageId - ID gói sửa chữa
 * @param itemId - ID hạng mục
 * @returns RepairEligibilityReadView với eligible và missingReasons
 */
export async function checkEligibilityApi(
  projectId: string,
  packageId: string,
  itemId: string
): Promise<RepairEligibilityReadView> {
  const res = await apiClient.get<RepairEligibilityReadView>(
    `/projects/${projectId}/repair-packages/${packageId}/items/${itemId}/eligibility`
  )
  return res.data
}

/**
 * Kiểm tra nhiều items cùng lúc
 * Fail closed: nếu bất kỳ item nào không eligible thì cả batch không eligible
 */
export async function checkBatchEligibilityApi(
  projectId: string,
  packageId: string,
  itemIds: string[]
): Promise<Map<string, RepairEligibilityReadView>> {
  const results = new Map<string, RepairEligibilityReadView>()
  await Promise.all(
    itemIds.map(async (itemId) => {
      try {
        const eligibility = await checkEligibilityApi(projectId, packageId, itemId)
        results.set(itemId, eligibility)
      } catch {
        // API fail → fail closed (coi như không eligible)
        results.set(itemId, {
          eligible: false,
          missingReasons: ['Không thể kiểm tra điều kiện. Vui lòng thử lại.'],
          itemId,
          bindingId: '',
        })
      }
    })
  )
  return results
}
