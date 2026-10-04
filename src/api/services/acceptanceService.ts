import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'

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

export const acceptanceService = {
  getRecords(): AcceptanceRecord[] {
    return getFromStorage<AcceptanceRecord[]>(STORAGE_KEYS.ACCEPTANCE_RECORDS, INITIAL_ACCEPTANCE_RECORDS)
  },

  approveAcceptance(recordId: string, inspectorName: string, notes?: string): AcceptanceRecord | null {
    const list = this.getRecords()
    let updated: AcceptanceRecord | null = null
    const nextList = list.map((r) => {
      if (r.id === recordId || r.item_code === recordId) {
        updated = {
          ...r,
          status: 'PASSED',
          inspector_name: inspectorName,
          inspector_notes: notes || 'Nghiệm thu đạt tiêu chuẩn kỹ thuật',
          inspected_at: new Date().toLocaleDateString('vi-VN')
        }
        return updated
      }
      return r
    })
    if (updated) {
      saveToStorage(STORAGE_KEYS.ACCEPTANCE_RECORDS, nextList)
    }
    return updated
  },

  rejectAcceptance(recordId: string, inspectorName: string, reason: string): AcceptanceRecord | null {
    const list = this.getRecords()
    let updated: AcceptanceRecord | null = null
    const nextList = list.map((r) => {
      if (r.id === recordId || r.item_code === recordId) {
        updated = {
          ...r,
          status: 'REJECTED',
          inspector_name: inspectorName,
          inspector_notes: reason,
          inspected_at: new Date().toLocaleDateString('vi-VN')
        }
        return updated
      }
      return r
    })
    if (updated) {
      saveToStorage(STORAGE_KEYS.ACCEPTANCE_RECORDS, nextList)
    }
    return updated
  }
}
