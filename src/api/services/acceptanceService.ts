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
let inMemoryCaseItems: CaseItem[] = JSON.parse(JSON.stringify(INITIAL_CASE_ITEMS))
let inMemoryAcceptanceRecords: AcceptanceRecord[] = JSON.parse(JSON.stringify(INITIAL_ACCEPTANCE_RECORDS))
let inMemoryIsCaseClosed: boolean = false

export const acceptanceService = {
  /**
   * Lấy danh sách hạng mục nghiệm thu trong hồ sơ vụ việc
   * (GET /api/v1/evidence-closeout/items)
   */
  async getCloseoutItems(): Promise<CaseItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    return JSON.parse(JSON.stringify(inMemoryCaseItems))
  },

  /**
   * Lấy trạng thái đóng tổng thể vụ việc
   * (GET /api/v1/evidence-closeout/case-status)
   */
  async getCaseCloseoutStatus(): Promise<{ isCaseClosed: boolean; caseCode: string }> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    return {
      isCaseClosed: inMemoryIsCaseClosed,
      caseCode: '#CASE-2026-0842'
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
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
  },

  /**
   * Supervisor phát lệnh yêu cầu tái thi công (REWORK)
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
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
  },

  /**
   * PM xác nhận đủ điều kiện và trình hồ sơ lên Supervisor
   * (POST /api/v1/evidence-closeout/items/:id/submit-supervisor)
   */
  async submitItemToSupervisor(itemId: string): Promise<CaseItem> {
    await new Promise((resolve) => setTimeout(resolve, 90))
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
  },

  /**
   * Supervisor Đóng tổng thể vụ việc phức hợp sau khi 100% hạng mục đạt
   * (POST /api/v1/evidence-closeout/close-case)
   */
  async closeCompositeCase(caseCode: string): Promise<{ success: boolean; caseCode: string }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const hasPending = inMemoryCaseItems.some((it) => it.status !== 'ACCEPTED')
    if (hasPending) {
      throw new Error('CASE_HAS_OPEN_REQUIRED_ITEMS: Chưa thể đóng vụ việc khi còn hạng mục dở dang')
    }
    inMemoryIsCaseClosed = true
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
