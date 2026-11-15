import { repairWorkflowService } from './repairWorkflowService'
import {
  ProposalWorkPackage,
  ItemApprovalStatus,
  RepairItemDetail,
} from '../../types/domain'

export type { ProposalWorkPackage, ItemApprovalStatus, RepairItemDetail }

// DTO Canonical Candidate3 (docs/contracts/openapi.json)
export interface RepairPackageSummaryDto {
  id: string
  projectId: string
  defectId?: string
  allMandatoryResolved?: boolean
  version?: string | null
}

export interface RepairItemSummaryDto {
  id: string
  projectId: string
  defectId?: string
  obligationId?: string
  mode?: 'NORMAL' | 'FAST_TRACK' | string | null
  state?: string | null
  result?: string | null
  effectiveDecisionId?: string | null
  attemptIds?: string[] | null
  decisionIds?: string[] | null
  version?: string | null
}

export interface CollectionPageDto<T> {
  items?: T[] | null
  nextCursor?: string | null
}

export interface RepairPackageCreateInputDto {
  defectId: string
  defectVersion?: string | null
  obligations?: Array<{
    kind?: 'FORMAL_REPAIR' | 'TEMPORARY_SAFETY' | string | null
    mandatory?: boolean
    scope?: {
      chainageStart?: number
      chainageEnd?: number
      laneNumber?: number
      areaSquareMeters?: number
      depthCentimeters?: number
      crackLengthMeters?: number
      crackWidthMillimeters?: number
    }
    reason?: string | null
  }> | null
  reason?: string | null
}

export interface RepairItemProposeInputDto {
  obligationId: string
  mode?: 'NORMAL' | 'FAST_TRACK' | string | null
  repairPlan?: string | null
  checklistVersion?: string | null
  reason?: string | null
}

// 100% DỮ LIỆU THẬT TỪ CSDL BACKEND DOCKER - KHÔNG DÙNG MOCK DATA
export const INITIAL_PACKAGES: ProposalWorkPackage[] = []

let apiPackages: ProposalWorkPackage[] = []
let apiItemsByPackage: Record<string, RepairItemDetail[]> = {}

export function dispatchMockChangeEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('roadguard_state_change'))
    window.dispatchEvent(new CustomEvent('roadguard_repair_api_change'))
  }
}

export const repairService = {
  // --- SYNC API METHODS (ĐỌC TỪ BỘ ĐỆM ĐÃ ĐỒNG BỘ CSDL THẬT) ---
  getPackages(): ProposalWorkPackage[] {
    return [...apiPackages]
  },

  getPackageById(id: string): ProposalWorkPackage | undefined {
    if (!id) return undefined
    const cleanId = id.trim().toLowerCase()
    return apiPackages.find(
      (p) => p.id.toLowerCase() === cleanId || p.code.toLowerCase() === cleanId
    )
  },

  createPackage(data: Partial<ProposalWorkPackage>, items?: RepairItemDetail[]): ProposalWorkPackage {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  submitPackage(packageId: string): ProposalWorkPackage | null {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  deletePackage(packageId: string): boolean {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  getItems(packageId?: string): RepairItemDetail[] {
    if (!packageId) return []
    const cleanId = packageId.trim().toLowerCase()
    return apiItemsByPackage[packageId] || apiItemsByPackage[cleanId] || []
  },

  setPackageItems(packageId: string, items: RepairItemDetail[]): void {
    const cleanId = packageId.trim().toLowerCase()
    apiItemsByPackage[packageId] = [...items]
    apiItemsByPackage[cleanId] = [...items]
    const targetPkg = this.getPackageById(packageId)
    if (targetPkg) {
      apiItemsByPackage[targetPkg.id] = [...items]
      apiItemsByPackage[targetPkg.id.toLowerCase()] = [...items]
      apiItemsByPackage[targetPkg.code] = [...items]
      apiItemsByPackage[targetPkg.code.toLowerCase()] = [...items]
    }
    dispatchMockChangeEvent()
  },

  updateItemDecision(
    packageId: string,
    itemId: string,
    decisionOrPatch: ItemApprovalStatus | Partial<RepairItemDetail>,
    notes?: string
  ): RepairItemDetail | null {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  signPackageApproval(packageId: string, supervisorName = 'Giám sát trưởng (Supervisor)'): ProposalWorkPackage | null {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  approvePackage(packageId: string): ProposalWorkPackage | null {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  dispatchPackage(packageId: string, crewName: string, _deadline?: string): ProposalWorkPackage | null {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  recalculatePackageStats(packageId: string, items: RepairItemDetail[]): void {
    const approvedCount = items.filter((i) => i.status === 'APPROVED').length
    const cleanId = packageId.trim().toLowerCase()

    apiPackages = apiPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
        return {
          ...pkg,
          approved_items: approvedCount,
          total_items: items.length
        }
      }
      return pkg
    })
    dispatchMockChangeEvent()
  },

  // =========================================================================
  // CANONICAL API CANDIDATE3 CLIENT METHODS — 100% CSDL BACKEND DOCKER
  // =========================================================================

  async fetchPackagesFromApi(projectId: string, signal?: AbortSignal): Promise<ProposalWorkPackage[]> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  async fetchItemsFromApi(projectId: string, packageId: string, signal?: AbortSignal): Promise<RepairItemDetail[]> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  async createPackageApi(projectId: string, input: RepairPackageCreateInputDto): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  async fetchDefectsForProposal(projectId: string, signal?: AbortSignal): Promise<any[]> {
    return repairWorkflowService.defects(projectId, signal)
  },

  async proposeItemApi(projectId: string, packageId: string, input: RepairItemProposeInputDto): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  async approveItemApi(
    projectId: string,
    packageId: string,
    itemId: string,
    version: string,
    reason = 'Chấp thuận phê duyệt phương án kỹ thuật'
  ): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  async assignItemApi(
    projectId: string,
    packageId: string,
    itemId: string,
    version: string,
    input: any
  ): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  async confirmFinalApi(
    projectId: string,
    packageId: string,
    itemId: string,
    version: string,
    reason = 'Nghiệm thu đạt yêu cầu kỹ thuật'
  ): Promise<any> {
    throw new Error('Luồng giao diện cũ chưa có nguồn/contract đầy đủ. Sử dụng menu đã nối API; không cập nhật bộ nhớ thay cho Backend.')
  },

  async fetchPackages(): Promise<ProposalWorkPackage[]> {
    return this.getPackages()
  },

  async fetchPackageById(id: string): Promise<ProposalWorkPackage | undefined> {
    return this.getPackageById(id)
  },

  async fetchItems(packageId?: string): Promise<RepairItemDetail[]> {
    return this.getItems(packageId)
  }
}
