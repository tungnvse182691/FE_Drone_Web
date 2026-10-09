import { TriageCase } from '../../types/domain'
import { mockTriageCases } from '../../data/mockData'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'

// Mock Data Store đồng bộ qua STORAGE_KEYS.TRIAGE_CASES
let inMemoryTriageCases: TriageCase[] = getFromStorage(
  STORAGE_KEYS.TRIAGE_CASES,
  JSON.parse(JSON.stringify(mockTriageCases))
)

export interface TriageFilterParams {
  source?: string
  status?: string
  projectId?: string
  priority?: string
  searchQuery?: string
}

export const triageService = {
  /**
   * Lấy danh sách hồ sơ tiếp nhận Triage (Hộp thư AI & Phản ánh người dân - PA03, AI01-AI08)
   */
  async getCases(params?: TriageFilterParams): Promise<TriageCase[]> {
    await new Promise((resolve) => setTimeout(resolve, 150)) // Giả lập độ trễ mạng API
    let list = [...inMemoryTriageCases]

    if (params?.source && params.source !== 'ALL') {
      list = list.filter((c) => c.source === params.source)
    }

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((c) => c.status === params.status)
    }

    if (params?.projectId && params.projectId !== 'ALL') {
      const pId = params.projectId
      list = list.filter((c) => c.project_id === pId || c.project_name.includes(pId))
    }

    if (params?.priority && params.priority !== 'ALL') {
      list = list.filter((c) => c.severity === params.priority)
    }

    if (params?.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.defect_title.toLowerCase().includes(q) ||
          c.stationing.toLowerCase().includes(q) ||
          c.project_name.toLowerCase().includes(q) ||
          (c.reporter_name && c.reporter_name.toLowerCase().includes(q))
      )
    }

    return list
  },

  /**
   * Lấy chi tiết một ca khiếm khuyết theo ID
   */
  async getCaseById(id: string): Promise<TriageCase | null> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const item = inMemoryTriageCases.find((c) => c.id === id || c.code === id)
    return item ? JSON.parse(JSON.stringify(item)) : null
  },

  /**
   * Cập nhật thông tin hồ sơ thẩm định
   */
  async updateCase(caseId: string, updates: Partial<TriageCase>): Promise<TriageCase> {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const index = inMemoryTriageCases.findIndex((c) => c.id === caseId || c.code === caseId)
    if (index === -1) {
      throw new Error(`Không tìm thấy hồ sơ Triage với ID ${caseId}`)
    }
    inMemoryTriageCases[index] = {
      ...inMemoryTriageCases[index],
      ...updates
    }
    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
    return JSON.parse(JSON.stringify(inMemoryTriageCases[index]))
  },

  /**
   * Liên kết gộp báo trùng (PA04, BR-30, BR-31)
   */
  async linkDuplicateReports(
    masterId: string,
    secondaryIds: string[],
    auditNotes: string
  ): Promise<{ success: boolean; master: TriageCase }> {
    await new Promise((resolve) => setTimeout(resolve, 180))
    const masterIndex = inMemoryTriageCases.findIndex((c) => c.id === masterId || c.code === masterId)
    if (masterIndex === -1) {
      throw new Error('Hồ sơ chính không tồn tại')
    }

    const master = inMemoryTriageCases[masterIndex]
    const secondaryCodes: string[] = []

    inMemoryTriageCases = inMemoryTriageCases.map((c) => {
      if (secondaryIds.includes(c.id) || secondaryIds.includes(c.code)) {
        secondaryCodes.push(c.code)
        return {
          ...c,
          status: 'MERGED',
          status_label: 'Đã gộp trùng',
          master_case_id: master.id,
          pm_notes: `[GỘP TRÙNG PA04] Đã liên kết vào hồ sơ gốc ${master.code}. Ghi chú: ${auditNotes}`
        }
      }
      return c
    })

    const updatedLinkedCodes = Array.from(new Set([...(master.linked_report_ids || []), ...secondaryCodes]))
    inMemoryTriageCases[masterIndex] = {
      ...master,
      linked_report_ids: updatedLinkedCodes,
      pm_notes: `${master.pm_notes ? master.pm_notes + '\n' : ''}[LIÊN KẾT BÁO TRÙNG PA04] Đã gộp hồ sơ từ: ${secondaryCodes.join(', ')}. Ghi chú: ${auditNotes}`
    }

    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)

    return {
      success: true,
      master: JSON.parse(JSON.stringify(inMemoryTriageCases[masterIndex]))
    }
  },

  /**
   * Tách hồ sơ con khỏi hồ sơ Master khi phát hiện gộp nhầm (Unlink - BR-30)
   */
  async unlinkReport(secondaryIdentifier: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    let masterCaseId: string | undefined

    inMemoryTriageCases = inMemoryTriageCases.map((c) => {
      if (c.id === secondaryIdentifier || c.code === secondaryIdentifier) {
        masterCaseId = c.master_case_id
        return {
          ...c,
          status: 'PENDING',
          status_label: 'Chờ thẩm định',
          master_case_id: undefined,
          pm_notes: `[TÁCH HỒ SƠ BR-30] Đã tách khỏi hồ sơ gộp nhầm trước đó.`
        }
      }
      return c
    })

    if (masterCaseId) {
      const masterIdx = inMemoryTriageCases.findIndex((c) => c.id === masterCaseId)
      if (masterIdx !== -1) {
        const master = inMemoryTriageCases[masterIdx]
        inMemoryTriageCases[masterIdx] = {
          ...master,
          linked_report_ids: (master.linked_report_ids || []).filter(
            (code) => code !== secondaryIdentifier
          )
        }
      }
    }

    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)

    return {
      success: true
    }
  },

  /**
   * Đặt lại dữ liệu mẫu ban đầu
   */
  async resetCases(): Promise<TriageCase[]> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    inMemoryTriageCases = JSON.parse(JSON.stringify(mockTriageCases))
    saveToStorage(STORAGE_KEYS.TRIAGE_CASES, inMemoryTriageCases)
    return JSON.parse(JSON.stringify(inMemoryTriageCases))
  }
}
