import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'

export interface ProposalWorkPackage {
  id: string
  code: string
  title: string
  route_id: string
  route_name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
  segments_count: number
  defect_count: number
  defect_summary: string
  technical_scope: string
  material_scope: string
  technical_method?: string
  duration_days: number
  date_range: string
  created_by_name: string
  created_by_initials: string
  created_by_role: string
  created_at: string
  status: 'DRAFT' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED'
  status_label: string
  approved_items: number
  total_items: number
  contractor_name: string
  description?: string
}

export type ItemApprovalStatus =
  | 'APPROVED'
  | 'REQUEST_EVIDENCE'
  | 'REQUEST_RECONSIDER'
  | 'REJECTED'
  | 'PENDING'

export interface RepairItemDetail {
  id: string
  item_code: string
  defect_code: string
  chainage: string
  lane_info: string
  defect_title: string
  defect_measurements: string
  solution_title: string
  solution_standard: string
  volume_display: string
  volume_sub: string
  area_m2: number
  status: ItemApprovalStatus
  status_label: string
  assigned_crew: string
  supervisor_notes?: string
  evidence_directives?: string[]
  feedback_type?: 'EVIDENCE' | 'RECONSIDER' | 'REJECT'
  image_url: string
  ortho_code: string
  gps_coords: string
  resolution: string
}

export const INITIAL_PACKAGES: ProposalWorkPackage[] = [
  {
    id: 'pkg-08',
    code: 'PKG-2026-08',
    title: 'Khắc phục ổ gà & lún nứt đợt 3',
    route_id: 'QL1A_PK04',
    route_name: 'QL1A - Giai đoạn 2',
    chainage_start: 'Km 1024+000',
    chainage_end: 'Km 1030+000',
    chainage_display: 'Km 1024+000 - Km 1030+000',
    segments_count: 5,
    defect_count: 12,
    defect_summary: '4 ổ gà, 6 nứt dọc, 2 lún bánh',
    technical_scope: 'Cào bóc & thảm: 180 m²',
    material_scope: 'Bê tông nhựa C19: 14 m³',
    duration_days: 3,
    date_range: '18/08 - 21/08/2026',
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    created_by_initials: 'ĐH',
    created_by_role: 'Chỉ huy trưởng dự án',
    created_at: '18/08/2026 - 09:30',
    status: 'SUBMITTED',
    status_label: 'Chờ duyệt',
    approved_items: 8,
    total_items: 12,
    contractor_name: 'Đội thi công sửa chữa Hoàng Hải 01'
  },
  {
    id: 'pkg-07',
    code: 'PKG-2026-07',
    title: 'Vá cào bóc thảm nhựa polime',
    route_id: 'QL1A_PK04',
    route_name: 'QL1A - Giai đoạn 2',
    chainage_start: 'Km 1033+500',
    chainage_end: 'Km 1038+000',
    chainage_display: 'Km 1033+500 - Km 1038+000',
    segments_count: 3,
    defect_count: 10,
    defect_summary: '10 điểm hư hỏng mặt lớp trên',
    technical_scope: 'Cào bóc thảm: 320 m²',
    material_scope: 'Bù vênh lu lèn: 22 tấn',
    duration_days: 2,
    date_range: '16/08 - 18/08/2026',
    created_by_name: 'Lê Văn Tùng (PM)',
    created_by_initials: 'LT',
    created_by_role: 'Kỹ sư cầu đường',
    created_at: '16/08/2026 - 15:45',
    status: 'DECIDED',
    status_label: 'Đã phê duyệt',
    approved_items: 10,
    total_items: 10,
    contractor_name: 'Xí nghiệp Cầu Đường 4'
  },
  {
    id: 'pkg-09',
    code: 'PKG-2026-09',
    title: 'Xử lý nứt rạn mai rùa phân đoạn đèo',
    route_id: 'QL1A_PK04',
    route_name: 'QL1A - Giai đoạn 2',
    chainage_start: 'Km 1042+000',
    chainage_end: 'Km 1045+500',
    chainage_display: 'Km 1042+000 - Km 1045+500',
    segments_count: 2,
    defect_count: 8,
    defect_summary: '5 nứt lưới, 3 lún mép đường',
    technical_scope: 'Xử lý móng CPĐD: 95 m²',
    material_scope: 'Lưới địa kỹ thuật: 150 m²',
    duration_days: 4,
    date_range: '19/08 - 23/08/2026',
    created_by_name: 'Đỗ Quốc Hoàng (PM)',
    created_by_initials: 'ĐH',
    created_by_role: 'Chỉ huy trưởng dự án',
    created_at: '19/08/2026 - 08:15',
    status: 'DRAFT',
    status_label: 'Bản nháp',
    approved_items: 0,
    total_items: 8,
    contractor_name: 'Chưa phân công'
  }
]

export const INITIAL_ITEMS: RepairItemDetail[] = [
  {
    id: 'item-01',
    item_code: '#ITEM-01',
    defect_code: 'DEF-2026-0089',
    chainage: 'Km 1024+350',
    lane_info: 'Làn phải R1 • Tấm #42',
    defect_title: 'Ổ gà mặt đường cấp 3',
    defect_measurements: 'Sâu 6.0cm • S = 0.70 m²',
    solution_title: 'Trám vá nhựa nguội khẩn cấp',
    solution_standard: 'Tiêu chuẩn vá nhanh TCVN 8819',
    volume_display: '18.5 m²',
    volume_sub: 'Sâu 5.0 cm',
    area_m2: 18.5,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1024_R1_ORTHO.JPG',
    gps_coords: '15.8245, 108.2140',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-02',
    item_code: '#ITEM-02',
    defect_code: 'DEF-2026-0092',
    chainage: 'Km 1024+500',
    lane_info: 'Làn trái L2 • Tấm #48',
    defect_title: 'Nứt dọc kéo dài 4.2m',
    defect_measurements: 'Rộng 8mm • Sâu 4.5cm',
    solution_title: 'Cắt rãnh & rót mastic chèn khe',
    solution_standard: 'Quy trình xử lý nứt AASHTO',
    volume_display: '4.2 m',
    volume_sub: 'Rót chèn khe',
    area_m2: 0.8,
    status: 'APPROVED',
    status_label: 'APPROVED',
    assigned_crew: 'Tổ thi công Asphalt 01',
    image_url:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1024_L2_CRACK.JPG',
    gps_coords: '15.8260, 108.2155',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-03',
    item_code: '#ITEM-03',
    defect_code: 'DEF-2026-0095',
    chainage: 'Km 1025+120',
    lane_info: 'Làn giữa M1 • Tấm #60',
    defect_title: 'Lún vệt bánh xe sâu 25mm',
    defect_measurements: 'Chiều dài vệt 12m',
    solution_title: 'Cào bóc 5cm & thảm lại BTN C12.5',
    solution_standard: 'Tiêu chuẩn cào bóc TCVN 8819',
    volume_display: '36.0 m²',
    volume_sub: 'Dày 5.0 cm',
    area_m2: 36.0,
    status: 'REQUEST_EVIDENCE',
    status_label: 'YÊU CẦU BẰNG CHỨNG',
    assigned_crew: 'Chưa giao việc',
    supervisor_notes:
      'Hình ảnh Drone chưa rõ độ sâu đáy lún. Đề nghị Tổ đo đạc bổ sung ảnh chụp thước đo cốt đáy.',
    image_url:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1025_M1_RUT.JPG',
    gps_coords: '15.8290, 108.2180',
    resolution: '4K • 3840x2160'
  },
  {
    id: 'item-04',
    item_code: '#ITEM-04',
    defect_code: 'DEF-2026-0098',
    chainage: 'Km 1025+400',
    lane_info: 'Làn phải R1 • Tấm #68',
    defect_title: 'Nứt mạng lưới mai rùa diện rộng',
    defect_measurements: 'Diện tích nứt 3.5 m²',
    solution_title: 'Xử lý móng CPĐD + thảm 2 lớp',
    solution_standard: 'Gia cố móng TCVN 8859',
    volume_display: '12.0 m²',
    volume_sub: 'Cào bóc sâu 8cm',
    area_m2: 12.0,
    status: 'PENDING',
    status_label: 'CHỜ DUYỆT',
    assigned_crew: 'Chưa giao việc',
    image_url:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ortho_code: 'IMG_1025_R1_ALLIG.JPG',
    gps_coords: '15.8310, 108.2200',
    resolution: '4K • 3840x2160'
  }
]

export const repairService = {
  getPackages(): ProposalWorkPackage[] {
    return getFromStorage<ProposalWorkPackage[]>(STORAGE_KEYS.REPAIR_PROPOSALS, INITIAL_PACKAGES)
  },

  getPackageById(id: string): ProposalWorkPackage | undefined {
    const list = this.getPackages()
    return list.find((p) => p.id === id || p.code === id)
  },

  createPackage(data: Partial<ProposalWorkPackage>): ProposalWorkPackage {
    const list = this.getPackages()
    const newCode = `PKG-2026-${String(list.length + 10).padStart(2, '0')}`
    const newPkg: ProposalWorkPackage = {
      id: `pkg-${Date.now()}`,
      code: newCode,
      title: data.title || 'Gói đề xuất sửa chữa kỹ thuật mới',
      route_id: data.route_id || 'QL1A_PK04',
      route_name: data.route_name || 'QL1A - Giai đoạn 2',
      chainage_start: data.chainage_start || 'Km 1024+000',
      chainage_end: data.chainage_end || 'Km 1030+000',
      chainage_display: data.chainage_display || `${data.chainage_start} - ${data.chainage_end}`,
      segments_count: data.segments_count || 1,
      defect_count: data.defect_count || 0,
      defect_summary: data.defect_summary || 'Các khiếm khuyết được gom vào gói',
      technical_scope: data.technical_scope || 'Xử lý kỹ thuật mặt đường',
      material_scope: data.material_scope || 'Vật liệu quy chuẩn TCVN',
      technical_method: data.technical_method,
      duration_days: data.duration_days || 3,
      date_range: data.date_range || 'Trong tuần này',
      created_by_name: data.created_by_name || 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: new Date().toLocaleDateString('vi-VN') + ' - ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'DRAFT',
      status_label: 'Bản nháp',
      approved_items: 0,
      total_items: data.defect_count || 0,
      contractor_name: 'Chưa phân công',
      description: data.description
    }

    const updated = [newPkg, ...list]
    saveToStorage(STORAGE_KEYS.REPAIR_PROPOSALS, updated)
    return newPkg
  },

  submitPackage(packageId: string): ProposalWorkPackage | null {
    const list = this.getPackages()
    let submittedPkg: ProposalWorkPackage | null = null

    const updated = list.map((pkg) => {
      if (pkg.id === packageId || pkg.code === packageId) {
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
      saveToStorage(STORAGE_KEYS.REPAIR_PROPOSALS, updated)
    }
    return submittedPkg
  },

  getItems(packageId?: string): RepairItemDetail[] {
    const key = packageId ? `${STORAGE_KEYS.PROPOSAL_ITEMS}_${packageId}` : STORAGE_KEYS.PROPOSAL_ITEMS
    return getFromStorage<RepairItemDetail[]>(key, INITIAL_ITEMS)
  },

  updateItemDecision(
    packageId: string,
    itemId: string,
    decisionOrPatch: ItemApprovalStatus | Partial<RepairItemDetail>,
    notes?: string
  ): RepairItemDetail | null {
    const key = `${STORAGE_KEYS.PROPOSAL_ITEMS}_${packageId}`
    const items = this.getItems(packageId)
    let updatedItem: RepairItemDetail | null = null

    const updatedItems = items.map((it) => {
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
      saveToStorage(key, updatedItems)
      // Cập nhật thống kê trên gói
      this.recalculatePackageStats(packageId, updatedItems)
    }
    return updatedItem
  },

  signPackageApproval(packageId: string, supervisorName = 'Giám sát trưởng (Supervisor)'): ProposalWorkPackage | null {
    const list = this.getPackages()
    const items = this.getItems(packageId)

    // Chuyển toàn bộ item pending sang APPROVED
    const updatedItems = items.map((it) => {
      if (it.status === 'PENDING') {
        return {
          ...it,
          status: 'APPROVED' as ItemApprovalStatus,
          status_label: 'APPROVED',
          supervisor_notes: `Phê duyệt ký số bởi ${supervisorName}`
        }
      }
      return it
    })
    saveToStorage(`${STORAGE_KEYS.PROPOSAL_ITEMS}_${packageId}`, updatedItems)

    let approvedPkg: ProposalWorkPackage | null = null
    const updatedList = list.map((pkg) => {
      if (pkg.id === packageId || pkg.code === packageId) {
        approvedPkg = {
          ...pkg,
          status: 'DECIDED',
          status_label: 'Đã phê duyệt',
          approved_items: updatedItems.filter((i) => i.status === 'APPROVED').length,
          total_items: updatedItems.length
        }
        return approvedPkg
      }
      return pkg
    })

    if (approvedPkg) {
      saveToStorage(STORAGE_KEYS.REPAIR_PROPOSALS, updatedList)
    }
    return approvedPkg
  },

  dispatchPackage(packageId: string, crewName: string, deadline?: string): ProposalWorkPackage | null {
    const list = this.getPackages()
    let dispatchedPkg: ProposalWorkPackage | null = null

    const updated = list.map((pkg) => {
      if (pkg.id === packageId || pkg.code === packageId) {
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
      saveToStorage(STORAGE_KEYS.REPAIR_PROPOSALS, updated)
    }
    return dispatchedPkg
  },

  recalculatePackageStats(packageId: string, items: RepairItemDetail[]): void {
    const list = this.getPackages()
    const approvedCount = items.filter((i) => i.status === 'APPROVED').length
    const updated = list.map((pkg) => {
      if (pkg.id === packageId || pkg.code === packageId) {
        return {
          ...pkg,
          approved_items: approvedCount,
          total_items: items.length
        }
      }
      return pkg
    })
    saveToStorage(STORAGE_KEYS.REPAIR_PROPOSALS, updated)
  },

  resetRepairData(): void {
    saveToStorage(STORAGE_KEYS.REPAIR_PROPOSALS, INITIAL_PACKAGES)
    saveToStorage(STORAGE_KEYS.PROPOSAL_ITEMS, INITIAL_ITEMS)
  }
}
