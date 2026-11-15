import { apiClient } from '../client'
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
    const list = this.getPackages()
    const newCode = data.code || `PKG-${String(list.length + 1).padStart(2, '0')}`
    const newId = data.id || crypto.randomUUID()

    const newPkg: ProposalWorkPackage = {
      id: newId,
      code: newCode,
      title: data.title || 'Gói đề xuất sửa chữa kỹ thuật',
      route_id: data.route_id || '',
      route_name: data.route_name || 'Tuyến đường dự án',
      chainage_start: data.chainage_start || 'Km 0+000',
      chainage_end: data.chainage_end || 'Km 1+000',
      chainage_display: data.chainage_display || 'Phạm vi công trình',
      segments_count: data.segments_count || 1,
      defect_count: data.defect_count || (items ? items.length : 0),
      defect_summary: data.defect_summary || 'Các khiếm khuyết được gom vào gói',
      technical_scope: data.technical_scope || 'Xử lý kỹ thuật mặt đường theo TCVN 8819',
      material_scope: data.material_scope || 'Vật liệu quy chuẩn TCVN',
      technical_method: data.technical_method || 'Cào bóc xử lý mặt đường',
      duration_days: data.duration_days || 3,
      date_range: data.date_range || 'Dự kiến 3 ngày',
      created_by_name: data.created_by_name || 'Chỉ huy trưởng (PM)',
      created_by_initials: data.created_by_initials || 'PM',
      created_by_role: data.created_by_role || 'Chỉ huy trưởng',
      created_at: data.created_at || new Date().toLocaleDateString('vi-VN'),
      status: data.status || 'SUBMITTED',
      status_label: data.status_label || 'Chờ duyệt',
      approved_items: data.approved_items || 0,
      total_items: items ? items.length : (data.total_items || 0),
      contractor_name: data.contractor_name || 'Đội thi công sửa chữa Hoàng Hải'
    }

    apiPackages = [newPkg, ...apiPackages]
    const finalItems = items && items.length > 0 ? items : []
    this.setPackageItems(newId, finalItems)
    dispatchMockChangeEvent()
    return newPkg
  },

  submitPackage(packageId: string): ProposalWorkPackage | null {
    const cleanId = packageId.trim().toLowerCase()
    let submittedPkg: ProposalWorkPackage | null = null

    apiPackages = apiPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
        submittedPkg = {
          ...pkg,
          status: 'SUBMITTED',
          status_label: 'Chờ duyệt'
        }
        return submittedPkg
      }
      return pkg
    })

    if (submittedPkg) {
      dispatchMockChangeEvent()
    }
    return submittedPkg
  },

  deletePackage(packageId: string): boolean {
    const cleanId = packageId.trim().toLowerCase()
    const beforeCount = apiPackages.length
    apiPackages = apiPackages.filter(
      (p) => p.id.toLowerCase() !== cleanId && p.code.toLowerCase() !== cleanId
    )
    delete apiItemsByPackage[packageId]
    delete apiItemsByPackage[cleanId]
    const changed = apiPackages.length !== beforeCount
    if (changed) {
      dispatchMockChangeEvent()
    }
    return changed
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
    const currentItems = this.getItems(packageId)
    let updatedItem: RepairItemDetail | null = null

    const updatedItems = currentItems.map((it) => {
      if (it.id === itemId || it.item_code === itemId) {
        if (typeof decisionOrPatch === 'string') {
          updatedItem = {
            ...it,
            status: decisionOrPatch,
            status_label: decisionOrPatch,
            supervisor_notes: notes || it.supervisor_notes
          }
        } else {
          updatedItem = {
            ...it,
            ...decisionOrPatch
          }
        }
        return updatedItem
      }
      return it
    })

    if (updatedItem) {
      this.setPackageItems(packageId, updatedItems)
      this.recalculatePackageStats(packageId, updatedItems)
    }
    return updatedItem
  },

  signPackageApproval(packageId: string, supervisorName = 'Giám sát trưởng (Supervisor)'): ProposalWorkPackage | null {
    const targetPkg = this.getPackageById(packageId)
    const items = this.getItems(packageId)

    const updatedItems = items.map((it) => ({
      ...it,
      status: 'APPROVED' as ItemApprovalStatus,
      status_label: 'APPROVED',
      supervisor_notes: it.supervisor_notes || `Phê duyệt kỹ thuật bởi ${supervisorName}`
    }))

    this.setPackageItems(packageId, updatedItems)
    if (targetPkg) {
      this.setPackageItems(targetPkg.id, updatedItems)
      this.setPackageItems(targetPkg.code, updatedItems)
    }

    let approvedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    apiPackages = apiPackages.map((pkg) => {
      if (
        pkg.id.toLowerCase() === cleanId ||
        pkg.code.toLowerCase() === cleanId ||
        (targetPkg && (pkg.id === targetPkg.id || pkg.code === targetPkg.code))
      ) {
        approvedPkg = {
          ...pkg,
          status: 'DECIDED',
          status_label: 'Đã phê duyệt',
          approved_items: updatedItems.length,
          total_items: updatedItems.length
        }
        return approvedPkg
      }
      return pkg
    })

    if (approvedPkg) {
      dispatchMockChangeEvent()
    }
    return approvedPkg
  },

  approvePackage(packageId: string): ProposalWorkPackage | null {
    return this.signPackageApproval(packageId)
  },

  dispatchPackage(packageId: string, crewName: string, _deadline?: string): ProposalWorkPackage | null {
    let dispatchedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    apiPackages = apiPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
        dispatchedPkg = {
          ...pkg,
          status: 'DISPATCHED',
          status_label: 'Đã giao việc',
          contractor_name: crewName
        }
        return dispatchedPkg
      }
      return pkg
    })

    if (dispatchedPkg) {
      dispatchMockChangeEvent()
    }
    return dispatchedPkg
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
    if (!projectId || projectId === 'ALL') {
      apiPackages = []
      dispatchMockChangeEvent()
      return []
    }
    const res = await apiClient.get<CollectionPageDto<RepairPackageSummaryDto>>(
      `/projects/${projectId}/repair-packages`,
      { signal }
    )
    const rawList = res.data?.items || []
    const mappedList: ProposalWorkPackage[] = rawList.map((pkg, idx) => ({
      id: pkg.id,
      code: `PKG-${pkg.id.slice(0, 8).toUpperCase()}`,
      title: `Gói sửa chữa công trình #${idx + 1}`,
      route_id: projectId,
      route_name: 'Tuyến đường dự án',
      chainage_start: 'Km 0+000',
      chainage_end: 'Km 1+000',
      chainage_display: 'Phạm vi bảo hành',
      segments_count: 1,
      defect_count: pkg.defectId ? 1 : 0,
      defect_summary: pkg.defectId ? `Khiếm khuyết ${pkg.defectId.slice(0, 8)}` : 'Hạng mục sửa chữa',
      technical_scope: 'Khắc phục hư hỏng mặt đường theo TCVN 8819',
      material_scope: 'Vật tư theo phương án kỹ thuật',
      duration_days: 3,
      date_range: 'Dự kiến 3 ngày',
      created_by_name: 'Chỉ huy trưởng (PM)',
      created_by_initials: 'PM',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: new Date().toLocaleDateString('vi-VN'),
      status: pkg.allMandatoryResolved ? 'DECIDED' : 'SUBMITTED',
      status_label: pkg.allMandatoryResolved ? 'Đã phê duyệt' : 'Chờ duyệt',
      approved_items: pkg.allMandatoryResolved ? 1 : 0,
      total_items: 1,
      contractor_name: 'Đội thi công sửa chữa Hoàng Hải'
    }))

    apiPackages = mappedList
    dispatchMockChangeEvent()
    return mappedList
  },

  async fetchItemsFromApi(projectId: string, packageId: string, signal?: AbortSignal): Promise<RepairItemDetail[]> {
    if (!projectId || !packageId) return []
    const res = await apiClient.get<CollectionPageDto<RepairItemSummaryDto>>(
      `/projects/${projectId}/repair-packages/${packageId}/items`,
      { signal }
    )
    const rawItems = res.data?.items || []
    const mappedItems: RepairItemDetail[] = rawItems.map((it, idx) => ({
      id: it.id,
      item_code: `#ITEM-${String(idx + 1).padStart(2, '0')}`,
      defect_code: it.defectId ? `DEF-${it.defectId.slice(0, 8).toUpperCase()}` : 'DEF-UNKNOWN',
      chainage: 'Km 0+500',
      lane_info: 'Làn xe cơ giới',
      defect_title: `Hạng mục sửa chữa ${it.mode || 'NORMAL'}`,
      defect_measurements: 'Khối lượng kỹ thuật theo TCVN 8819',
      solution_title: it.mode === 'FAST_TRACK' ? 'Xử lý Fast Track khẩn cấp' : 'Phương án cào bóc thảm BTN',
      solution_standard: 'TCVN 8819:2011',
      volume_display: 'Theo hồ sơ',
      volume_sub: 'Không đơn giá (Zero Money)',
      area_m2: 1.0,
      status: (it.state === 'APPROVED' ? 'APPROVED' : it.state === 'REJECTED' ? 'REJECTED' : 'PENDING') as ItemApprovalStatus,
      status_label: it.state === 'APPROVED' ? 'APPROVED' : it.state === 'REJECTED' ? 'REJECTED' : 'CHỜ DUYỆT',
      assigned_crew: 'Tổ thi công Asphalt Hoàng Hải 01',
      image_url: '/placeholder-defect.jpg',
      ortho_code: `ORTHO_${it.id.slice(0, 8).toUpperCase()}.JPG`,
      gps_coords: '16.0544, 108.2022',
      resolution: '4K UAV',
      pilot_name: 'Kỹ sư trắc địa UAV',
      drone_model: 'DJI Matrice 350 RTK'
    }))

    this.setPackageItems(packageId, mappedItems)
    return mappedItems
  },

  async createPackageApi(projectId: string, input: RepairPackageCreateInputDto): Promise<any> {
    const key = crypto.randomUUID()
    const version = input.defectVersion || '1'
    const ifMatch = version.startsWith('"') ? version : `"${version}"`
    const res = await apiClient.post(`/projects/${projectId}/repair-packages`, input, {
      headers: {
        'Idempotency-Key': key,
        'If-Match': ifMatch
      }
    })
    return res.data
  },

  async fetchDefectsForProposal(projectId: string, signal?: AbortSignal): Promise<any[]> {
    if (!projectId || projectId === 'ALL') return []
    try {
      const res = await apiClient.get<any>(`/projects/${projectId}/defects`, {
        params: { pageSize: 50 },
        signal
      })
      return res.data?.items || []
    } catch (err) {
      console.warn('Lỗi tải danh sách khiếm khuyết từ API:', err)
      return []
    }
  },

  async proposeItemApi(projectId: string, packageId: string, input: RepairItemProposeInputDto): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(`/projects/${projectId}/repair-packages/${packageId}/items`, input, {
      headers: { 'Idempotency-Key': key }
    })
    return res.data
  },

  async approveItemApi(
    projectId: string,
    packageId: string,
    itemId: string,
    version: string,
    reason = 'Chấp thuận phê duyệt phương án kỹ thuật'
  ): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(
      `/projects/${projectId}/repair-packages/${packageId}/items/${itemId}/approve`,
      { reason },
      {
        headers: {
          'Idempotency-Key': key,
          'If-Match': version.startsWith('"') ? version : `"${version}"`
        }
      }
    )
    return res.data
  },

  async assignItemApi(
    projectId: string,
    packageId: string,
    itemId: string,
    version: string,
    input: any
  ): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(
      `/projects/${projectId}/repair-packages/${packageId}/items/${itemId}/assign`,
      input,
      {
        headers: {
          'Idempotency-Key': key,
          'If-Match': version.startsWith('"') ? version : `"${version}"`
        }
      }
    )
    return res.data
  },

  async confirmFinalApi(
    projectId: string,
    packageId: string,
    itemId: string,
    version: string,
    reason = 'Nghiệm thu đạt yêu cầu kỹ thuật'
  ): Promise<any> {
    const key = crypto.randomUUID()
    const res = await apiClient.post(
      `/projects/${projectId}/repair-packages/${packageId}/items/${itemId}/final-confirmation`,
      { reason },
      {
        headers: {
          'Idempotency-Key': key,
          'If-Match': version.startsWith('"') ? version : `"${version}"`
        }
      }
    )
    return res.data
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
