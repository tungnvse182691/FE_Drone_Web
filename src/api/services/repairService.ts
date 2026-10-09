import {
  ProposalWorkPackage,
  ItemApprovalStatus,
  RepairItemDetail,
} from '../../types/domain'

export type { ProposalWorkPackage, ItemApprovalStatus, RepairItemDetail }

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

// IN-MEMORY DATA STORE (Thay thế hoàn toàn localStorage, mô phỏng Backend DB)
let inMemoryPackages: ProposalWorkPackage[] = [...INITIAL_PACKAGES]
const inMemoryItemsByPackage: Record<string, RepairItemDetail[]> = {
  'pkg-08': [...INITIAL_ITEMS],
  'PKG-2026-08': [...INITIAL_ITEMS]
}

const notifyStateChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('roadguard_state_change'))
  }
}

export const repairService = {
  // --- SYNC API METHODS (Tương thích trực tiếp với các components hiện tại) ---
  getPackages(): ProposalWorkPackage[] {
    return [...inMemoryPackages]
  },

  getPackageById(id: string): ProposalWorkPackage | undefined {
    if (!id) return undefined
    const cleanId = id.trim().toLowerCase()
    return inMemoryPackages.find(
      (p) => p.id.toLowerCase() === cleanId || p.code.toLowerCase() === cleanId
    )
  },

  createPackage(data: Partial<ProposalWorkPackage>, items?: RepairItemDetail[]): ProposalWorkPackage {
    const list = this.getPackages()
    const newCode = data.code || `PKG-2026-${String(list.length + 10).padStart(2, '0')}`
    const newId = data.id || `pkg-${Date.now()}`

    const newPkg: ProposalWorkPackage = {
      id: newId,
      code: newCode,
      title: data.title || 'Gói đề xuất sửa chữa kỹ thuật mới',
      route_id: data.route_id || 'QL1A_PK04',
      route_name: data.route_name || 'QL1A - Giai đoạn 2',
      chainage_start: data.chainage_start || 'Km 1024+000',
      chainage_end: data.chainage_end || 'Km 1030+000',
      chainage_display: data.chainage_display || `${data.chainage_start} - ${data.chainage_end}`,
      segments_count: data.segments_count || 1,
      defect_count: data.defect_count || (items ? items.length : 0),
      defect_summary: data.defect_summary || 'Các khiếm khuyết được gom vào gói',
      technical_scope: data.technical_scope || 'Xử lý kỹ thuật mặt đường',
      material_scope: data.material_scope || 'Vật liệu quy chuẩn TCVN',
      technical_method: data.technical_method,
      duration_days: data.duration_days || 3,
      date_range: data.date_range || 'Trong tuần này',
      created_by_name: data.created_by_name || 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: data.created_by_initials || 'ĐH',
      created_by_role: data.created_by_role || 'Chỉ huy trưởng dự án',
      created_at: data.created_at || new Date().toLocaleDateString('vi-VN') + ' - ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: data.status || 'DRAFT',
      status_label: data.status_label || (data.status === 'SUBMITTED' ? 'Chờ duyệt' : 'Bản nháp'),
      approved_items: data.approved_items || 0,
      total_items: data.total_items || (items ? items.length : data.defect_count || 0),
      contractor_name: data.contractor_name || 'Chưa phân công',
      description: data.description
    }

    inMemoryPackages = [newPkg, ...inMemoryPackages]

    // Lưu danh sách items chi tiết nếu có
    if (items && items.length > 0) {
      inMemoryItemsByPackage[newId] = [...items]
      inMemoryItemsByPackage[newCode] = [...items]
    }

    notifyStateChange()
    return newPkg
  },

  submitPackage(packageId: string): ProposalWorkPackage | null {
    let submittedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    inMemoryPackages = inMemoryPackages.map((pkg) => {
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
      notifyStateChange()
    }
    return submittedPkg
  },

  deletePackage(packageId: string): boolean {
    const cleanId = packageId.trim().toLowerCase()
    inMemoryPackages = inMemoryPackages.filter(
      (p) => p.id.toLowerCase() !== cleanId && p.code.toLowerCase() !== cleanId
    )
    delete inMemoryItemsByPackage[packageId]
    notifyStateChange()
    return true
  },

  getItems(packageId?: string): RepairItemDetail[] {
    if (!packageId) return [...INITIAL_ITEMS]
    const cleanId = packageId.trim().toLowerCase()

    // 1. Tìm trong in-memory items store theo id hoặc code
    for (const [key, storedItems] of Object.entries(inMemoryItemsByPackage)) {
      if (key.toLowerCase() === cleanId) {
        return [...storedItems]
      }
    }

    // 2. Tra cứu gói trong packages list để tạo items động phù hợp nếu chưa có
    const targetPkg = this.getPackageById(packageId)
    if (targetPkg) {
      // Nếu là gói mẫu có sẵn, fallback về INITIAL_ITEMS
      if (targetPkg.id === 'pkg-08' || targetPkg.code === 'PKG-2026-08') {
        return [...INITIAL_ITEMS]
      }
      // Nếu gói mới có items nhưng chưa map key
      if (inMemoryItemsByPackage[targetPkg.id]) {
        return [...inMemoryItemsByPackage[targetPkg.id]]
      }
      if (inMemoryItemsByPackage[targetPkg.code]) {
        return [...inMemoryItemsByPackage[targetPkg.code]]
      }
    }

    return [...INITIAL_ITEMS]
  },

  setPackageItems(packageId: string, items: RepairItemDetail[]): void {
    inMemoryItemsByPackage[packageId] = [...items]
    const targetPkg = this.getPackageById(packageId)
    if (targetPkg) {
      inMemoryItemsByPackage[targetPkg.id] = [...items]
      inMemoryItemsByPackage[targetPkg.code] = [...items]
    }
    notifyStateChange()
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
    this.setPackageItems(packageId, updatedItems)

    let approvedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    inMemoryPackages = inMemoryPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
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
      notifyStateChange()
    }
    return approvedPkg
  },

  dispatchPackage(packageId: string, crewName: string, _deadline?: string): ProposalWorkPackage | null {
    let dispatchedPkg: ProposalWorkPackage | null = null
    const cleanId = packageId.trim().toLowerCase()

    inMemoryPackages = inMemoryPackages.map((pkg) => {
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
      notifyStateChange()
    }
    return dispatchedPkg
  },

  recalculatePackageStats(packageId: string, items: RepairItemDetail[]): void {
    const approvedCount = items.filter((i) => i.status === 'APPROVED').length
    const cleanId = packageId.trim().toLowerCase()

    inMemoryPackages = inMemoryPackages.map((pkg) => {
      if (pkg.id.toLowerCase() === cleanId || pkg.code.toLowerCase() === cleanId) {
        return {
          ...pkg,
          approved_items: approvedCount,
          total_items: items.length
        }
      }
      return pkg
    })
    notifyStateChange()
  },

  resetRepairData(): void {
    inMemoryPackages = [...INITIAL_PACKAGES]
    inMemoryItemsByPackage['pkg-08'] = [...INITIAL_ITEMS]
    inMemoryItemsByPackage['PKG-2026-08'] = [...INITIAL_ITEMS]
    notifyStateChange()
  },

  // --- ASYNC MOCK API METHODS (Chuẩn Mock API mô phỏng Network delay) ---
  async fetchPackages(): Promise<ProposalWorkPackage[]> {
    await new Promise((res) => setTimeout(res, 80))
    return this.getPackages()
  },

  async fetchPackageById(id: string): Promise<ProposalWorkPackage | undefined> {
    await new Promise((res) => setTimeout(res, 60))
    return this.getPackageById(id)
  },

  async fetchItems(packageId?: string): Promise<RepairItemDetail[]> {
    await new Promise((res) => setTimeout(res, 60))
    return this.getItems(packageId)
  }
}
