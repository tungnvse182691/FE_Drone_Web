import { CaseItem } from '../../pages/(sup)/evidence-closeout/types'
import { INITIAL_CASE_ITEMS } from '../../pages/(sup)/evidence-closeout/mockData'

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
  status_label: string
  sla_display: string
  completion_date: string
}

export const INITIAL_ACCEPTANCE_PACKAGES: AcceptancePackage[] = [
  {
    id: 'pkg-08',
    code: 'PKG-2026-08',
    case_code: '#CASE-2026-0842',
    title: 'Khắc phục ổ gà & lún nứt đợt 3',
    project_id: 'prj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_display: 'Km 1024+350 - Km 1024+450',
    contractor_name: 'Đội thi công Crew 02 - Xí nghiệp QLĐB 2',
    total_items: 4,
    accepted_items: 2,
    pending_items: 2,
    rework_items: 0,
    technical_scope: '180 m² cào bóc thảm BTN C12.5 / C19',
    status: 'PENDING_INSPECTION',
    status_label: 'Chờ nghiệm thu (2/4 đạt)',
    sla_display: 'Còn 18h',
    completion_date: '25/08/2026'
  },
  {
    id: 'pkg-07',
    code: 'PKG-2026-07',
    case_code: '#CASE-2026-0789',
    title: 'Vá cào bóc thảm nhựa polime phân đoạn Km 1033+500',
    project_id: 'prj-01',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_display: 'Km 1033+500 - Km 1038+000',
    contractor_name: 'Tổ thi công Asphalt 01',
    total_items: 10,
    accepted_items: 10,
    pending_items: 0,
    rework_items: 0,
    technical_scope: '320 m² thảm BTN polime',
    status: 'PASSED',
    status_label: 'Đã nghiệm thu đạt (10/10)',
    sla_display: 'Đã hoàn thành',
    completion_date: '18/08/2026'
  },
  {
    id: 'pkg-11',
    code: 'PKG-2026-11',
    case_code: '#CASE-2026-1102',
    title: 'Xử lý lún đầu cầu vượt dân sinh & nứt dọc',
    project_id: 'prj-02',
    project_name: 'Cao tốc Mai Sơn - QL45 (Km 285 - Km 315)',
    chainage_display: 'Km 298+120',
    contractor_name: 'Xí nghiệp Cầu đường Miền Trung',
    total_items: 3,
    accepted_items: 1,
    pending_items: 0,
    rework_items: 2,
    technical_scope: '75 m² bù vênh lu lèn móng',
    status: 'REWORK_REQUIRED',
    status_label: 'Yêu cầu sửa lại (Lần 2)',
    sla_display: 'Quá hạn 4h',
    completion_date: '24/08/2026'
  },
  {
    id: 'pkg-12',
    code: 'PKG-2026-12',
    case_code: '#CASE-2026-1215',
    title: 'Trám khe co giãn bê tông xi măng & trám vết nứt nông',
    project_id: 'prj-03',
    project_name: 'Đường ven biển Dung Quất - Sa Huỳnh',
    chainage_display: 'Km 22+450',
    contractor_name: 'Đội bảo dưỡng thường xuyên 03',
    total_items: 3,
    accepted_items: 0,
    pending_items: 3,
    rework_items: 0,
    technical_scope: '120 mét dài trám khe Mastic',
    status: 'PENDING_INSPECTION',
    status_label: 'Chờ Giám sát kiểm tra',
    sla_display: 'Còn 36h',
    completion_date: '25/08/2026'
  }
]

export const INITIAL_ACCEPTANCE_RECORDS: AcceptanceRecord[] = [
  {
    id: 'acc-01',
    package_id: 'pkg-08',
    package_code: 'PKG-2026-08',
    item_id: 'item-01',
    item_code: '#ITEM-01',
    defect_title: 'Ổ gà mặt đường cấp 3',
    chainage: 'Km 1024+350',
    lane: 'Làn phải R1 • Tấm #42',
    crew_name: 'Tổ thi công Asphalt 01',
    completion_date: '20/08/2026',
    status: 'PENDING_INSPECTION',
    before_photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    after_photo: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
    measurement_evidence: 'Độ bằng phẳng thước 3m: Khe hở ≤ 3mm, đạt TCVN 8819'
  },
  {
    id: 'acc-02',
    package_id: 'pkg-08',
    package_code: 'PKG-2026-08',
    item_id: 'item-02',
    item_code: '#ITEM-02',
    defect_title: 'Nứt dọc kéo dài 4.2m',
    chainage: 'Km 1024+500',
    lane: 'Làn trái L2 • Tấm #48',
    crew_name: 'Tổ thi công Asphalt 01',
    completion_date: '20/08/2026',
    status: 'PASSED',
    before_photo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    after_photo: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
    measurement_evidence: 'Rót mastic kín khít, độ lún bề mặt 0mm',
    inspector_name: 'Trần Văn Giám Sát',
    inspected_at: '21/08/2026'
  }
]

// ==========================================
// In-Memory Mock Store (Tuân thủ nguyên tắc Zero localStorage, giả lập RESTful API bất đồng bộ)
// ==========================================
let inMemoryPackages: AcceptancePackage[] = JSON.parse(JSON.stringify(INITIAL_ACCEPTANCE_PACKAGES))
let inMemoryCaseItems: CaseItem[] = JSON.parse(JSON.stringify(INITIAL_CASE_ITEMS))
let inMemoryAcceptanceRecords: AcceptanceRecord[] = JSON.parse(JSON.stringify(INITIAL_ACCEPTANCE_RECORDS))
let inMemoryIsCaseClosed: boolean = false

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
   * Lấy danh sách các gói đề xuất / đợt thi công chờ nghiệm thu
   * (GET /api/v1/acceptance/packages)
   */
  async getAcceptancePackages(filter?: {
    status?: string
    projectId?: string
    query?: string
  }): Promise<AcceptancePackage[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    let result = JSON.parse(JSON.stringify(inMemoryPackages)) as AcceptancePackage[]
    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((p) => p.status === filter.status)
    }
    if (filter?.projectId && filter.projectId !== 'ALL') {
      result = result.filter((p) => p.project_id === filter.projectId)
    }
    if (filter?.query && filter.query.trim()) {
      const q = filter.query.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.project_name.toLowerCase().includes(q) ||
          p.case_code.toLowerCase().includes(q)
      )
    }
    return result
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
      return JSON.parse(JSON.stringify(found))
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
   */
  async getCaseCloseoutStatus(packageId?: string): Promise<{ isCaseClosed: boolean; caseCode: string }> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const pkg = inMemoryPackages.find((p) => p.id === packageId || p.code === packageId)
    return {
      isCaseClosed: inMemoryIsCaseClosed && (!pkg || pkg.status === 'PASSED'),
      caseCode: pkg ? pkg.case_code : '#CASE-2026-0842'
    }
  },

  /**
   * Supervisor chấp thuận nghiệm thu & ký số PKI
   * (POST /api/v1/evidence-closeout/items/:id/accept)
   */
  async acceptCloseoutItem(itemId: string): Promise<CaseItem> {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    inMemoryCaseItems[index] = {
      ...inMemoryCaseItems[index],
      status: 'ACCEPTED',
      status_label: 'ĐÃ NGHIỆM THU ĐẠT'
    }
    syncPackageStats(inMemoryCaseItems[index].package_id)
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
  },

  /**
   * Supervisor hoặc PM phát lệnh yêu cầu tái thi công (REWORK)
   * (POST /api/v1/evidence-closeout/items/:id/rework)
   */
  async reworkCloseoutItem(
    itemId: string,
    payload: { notes: string; directives: string[] }
  ): Promise<CaseItem> {
    await new Promise((resolve) => setTimeout(resolve, 140))
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    const current = inMemoryCaseItems[index]
    const nextAttempt = (current.attempt_number || 1) + 1
    inMemoryCaseItems[index] = {
      ...current,
      status: 'REWORK_REQUIRED',
      status_label: `YÊU CẦU SỬA LẠI (LẦN ${nextAttempt})`,
      attempt_number: nextAttempt,
      rework_reason: payload.notes,
      rework_directives: payload.directives
    }
    syncPackageStats(current.package_id)
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
  },

  /**
   * PM chấp thuận và đóng hoàn thành nhánh Fast Track (BR-25)
   * (POST /api/v1/evidence-closeout/items/:id/close-fast-track)
   */
  async closeFastTrackItem(itemId: string): Promise<CaseItem> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    inMemoryCaseItems[index] = {
      ...inMemoryCaseItems[index],
      status: 'ACCEPTED',
      status_label: 'ĐÃ ĐÓNG (FAST-TRACK RESOLVED)'
    }
    syncPackageStats(inMemoryCaseItems[index].package_id)
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
  },

  /**
   * PM xác nhận đủ điều kiện và trình hồ sơ lên Supervisor (HT09, HT11)
   * (POST /api/v1/evidence-closeout/items/:id/submit-supervisor)
   */
  async submitItemToSupervisor(itemId: string): Promise<CaseItem> {
    await new Promise((resolve) => setTimeout(resolve, 90))
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    inMemoryCaseItems[index] = {
      ...inMemoryCaseItems[index],
      status: 'PENDING_INSPECTION',
      status_label: 'CHỜ GIÁM SÁT KIỂM TRA'
    }
    syncPackageStats(inMemoryCaseItems[index].package_id)
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
  },

  /**
   * Supervisor Đóng tổng thể vụ việc phức hợp sau khi 100% hạng mục đạt (BR-26)
   * (POST /api/v1/evidence-closeout/close-case)
   */
  async closeCompositeCase(caseCode: string, packageId?: string): Promise<{ success: boolean; caseCode: string }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const targetItems = packageId
      ? inMemoryCaseItems.filter((it) => it.package_id === packageId)
      : inMemoryCaseItems
    const hasPending = targetItems.some((it) => it.status !== 'ACCEPTED')
    if (hasPending) {
      throw new Error('CASE_HAS_OPEN_REQUIRED_ITEMS: Chưa thể đóng vụ việc khi còn hạng mục dở dang')
    }
    inMemoryIsCaseClosed = true
    if (packageId) {
      const pkg = inMemoryPackages.find((p) => p.id === packageId)
      if (pkg) {
        pkg.status = 'PASSED'
        pkg.status_label = `Đã nghiệm thu đạt (${pkg.total_items}/${pkg.total_items})`
      }
    }
    return {
      success: true,
      caseCode
    }
  },

  /**
   * Công bố kết quả khắc phục lên Citizen App
   * (POST /api/v1/evidence-closeout/items/:id/publish-citizen)
   */
  async publishCitizenResult(itemId: string, published: boolean = true): Promise<CaseItem> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    inMemoryCaseItems[index] = {
      ...inMemoryCaseItems[index],
      citizen_published: published
    }
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
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
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryAcceptanceRecords.findIndex((r) => r.id === recordId || r.item_code === recordId)
    if (index === -1) return null
    inMemoryAcceptanceRecords[index] = {
      ...inMemoryAcceptanceRecords[index],
      status: 'PASSED',
      inspector_name: inspectorName,
      inspector_notes: notes || 'Nghiệm thu đạt tiêu chuẩn kỹ thuật',
      inspected_at: new Date().toLocaleDateString('vi-VN')
    }
    return JSON.parse(JSON.stringify(inMemoryAcceptanceRecords[index]))
  },

  /**
   * Tương thích ngược: Từ chối biên bản
   */
  async rejectAcceptance(recordId: string, inspectorName: string, reason: string): Promise<AcceptanceRecord | null> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryAcceptanceRecords.findIndex((r) => r.id === recordId || r.item_code === recordId)
    if (index === -1) return null
    inMemoryAcceptanceRecords[index] = {
      ...inMemoryAcceptanceRecords[index],
      status: 'REJECTED',
      inspector_name: inspectorName,
      inspector_notes: reason,
      inspected_at: new Date().toLocaleDateString('vi-VN')
    }
    return JSON.parse(JSON.stringify(inMemoryAcceptanceRecords[index]))
  }
}
