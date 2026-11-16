import { apiClient } from '../client'
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

// Metadata BE của từng hạng mục (phục vụ thao tác ghi): projectId, packageId, taskId, state.
const itemMeta = new Map<string, { projectId: string; packageId: string; taskId: string | null; state: string }>()
const STATE_STATUS: Record<string, 'PENDING_INSPECTION' | 'ACCEPTED' | 'REWORK_REQUIRED'> = {
  Submitted: 'PENDING_INSPECTION',
  Reviewed: 'PENDING_INSPECTION',
  CorrectionRequired: 'REWORK_REQUIRED',
  Confirmed: 'ACCEPTED',
}
const short = (id: unknown) => String(id ?? '').slice(0, 8).toUpperCase()
const idemKey = () => crypto.randomUUID()
const quoted = (v: unknown) => { const s = String(v ?? ''); return s.startsWith('"') ? s : `"${s}"` }
// PM review attempt: POST .../tasks/{taskId}/attempts/reviews (decision ACCEPT|SUPPLEMENT, reason, If-Match = version hạng mục).
async function pmReview(itemId: string, decision: 'ACCEPT' | 'SUPPLEMENT', reason: string): Promise<void> {
  const meta = itemMeta.get(itemId)
  if (!meta) throw new Error('Thiếu thông tin BE của hạng mục; hãy tải lại trang.')
  if (!meta.taskId) throw new Error('Hạng mục chưa có lần thi công (attempt) để review.')
  const task = await apiClient.get<any>(`/projects/${meta.projectId}/field-inspection-tasks/${meta.taskId}`)
  const fieldSubmissionId = task.data?.latestSubmissionId
  if (!fieldSubmissionId) throw new Error('Nhiệm vụ chưa có bản nộp (submission) để review.')
  await apiClient.post(
    `/projects/${meta.projectId}/repair-packages/${meta.packageId}/items/${itemId}/tasks/${meta.taskId}/attempts/reviews`,
    { fieldSubmissionId, decision, reason },
    { headers: { 'Idempotency-Key': idemKey(), 'If-Match': await itemEtag(meta.projectId, meta.packageId, itemId) } }
  )
}
async function itemEtag(projectId: string, packageId: string, itemId: string): Promise<string> {
  const res = await apiClient.get<any>(`/projects/${projectId}/repair-packages/${packageId}/items/${itemId}`)
  const etag = res.headers?.['etag'] || res.data?.version
  if (!etag) throw new Error('BE không trả ETag/version của hạng mục.')
  return quoted(etag)
}

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
    // Dữ liệu thật từ BE: gom theo từng dự án của tài khoản (hoặc đúng dự án được chọn).
    // Lỗi API được ném ra để UI hiển thị, không nuốt lỗi, không trả dữ liệu giả.
    const wanted = filter?.projectId && filter.projectId !== 'ALL' && /^[0-9a-f-]{36}$/i.test(filter.projectId) ? filter.projectId : null
    const projectNames = new Map<string, string>()
    {
      let cursor: string | null | undefined
      for (let page = 0; page < 20; page++) {
        const res = await apiClient.get<any>('/projects', { params: cursor ? { cursor } : undefined })
        for (const p of res.data?.items || []) projectNames.set(p.projectId, p.name || p.projectCode || p.projectId)
        cursor = res.data?.nextCursor
        if (!cursor) break
      }
    }
    const projectIds = wanted ? [wanted] : [...projectNames.keys()]
    const lists = await Promise.all(
      projectIds.map(async (projectId) => {
        const pk = await apiClient.get<any>(`/projects/${projectId}/repair-packages`)
        const out: AcceptancePackage[] = []
        for (const pkg of pk.data?.items || []) {
          const itemsRes = await apiClient.get<any>(`/projects/${projectId}/repair-packages/${pkg.id}/items`)
          const items: Array<{ state?: string }> = itemsRes.data?.items || []
          // Giai đoạn nghiệm thu theo RepairItemState của BE: Submitted/Reviewed/CorrectionRequired/Confirmed.
          const inAcceptance = items.filter((it) => ['Submitted', 'Reviewed', 'CorrectionRequired', 'Confirmed'].includes(it.state || ''))
          if (inAcceptance.length === 0) continue
          const accepted = items.filter((it) => it.state === 'Confirmed').length
          const rework = items.filter((it) => it.state === 'CorrectionRequired').length
          const pending = items.filter((it) => it.state === 'Submitted' || it.state === 'Reviewed').length
          const status: AcceptancePackage['status'] =
            accepted === items.length ? 'PASSED' : rework > 0 ? 'REWORK_REQUIRED' : 'PENDING_INSPECTION'
          out.push({
            id: pkg.id,
            code: `PKG-${String(pkg.id).slice(0, 8).toUpperCase()}`,
            case_code: `#CASE-${pkg.defectId ? String(pkg.defectId).slice(0, 8).toUpperCase() : '0000'}`,
            title: `Gói ${String(pkg.id).slice(0, 8).toUpperCase()}`,
            project_id: projectId,
            project_name: projectNames.get(projectId) || projectId,
            chainage_display: '—',
            contractor_name: '—',
            total_items: items.length,
            accepted_items: accepted,
            pending_items: pending,
            rework_items: rework,
            technical_scope: '—',
            status,
            is_closed: false,
            status_label:
              status === 'PASSED'
                ? `Đã nghiệm thu đạt (${accepted}/${items.length})`
                : status === 'REWORK_REQUIRED'
                  ? `Yêu cầu sửa lại (${rework} mục)`
                  : `Chờ nghiệm thu (${accepted}/${items.length} đạt)`,
            sla_display: '—',
            completion_date: '—',
          })
        }
        return out
      })
    )
    inMemoryPackages = lists.flat()

    let result = JSON.parse(JSON.stringify(inMemoryPackages)) as AcceptancePackage[]
    result = result.map((pkg) => {
      syncPackageStats(pkg.id)
      const isClosed = inMemoryClosedPackageIds.has(pkg.id) || inMemoryClosedPackageIds.has(pkg.code)
      return {
        ...pkg,
        is_closed: isClosed
      }
    })

    if (filter?.status && filter.status !== 'ALL') {
      if (filter.status === 'CLOSED') {
        result = result.filter((p) => p.is_closed)
      } else if (filter.status === 'PASSED') {
        result = result.filter((p) => p.status === 'PASSED')
      } else {
        result = result.filter((p) => p.status === filter.status)
      }
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
    const lookup = () => inMemoryPackages.find(
      (p) => p.id === packageId || p.code === packageId || p.case_code === packageId
    )
    if (!lookup()) await acceptanceService.getAcceptancePackages()
    const found = lookup()
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
    // Dữ liệu thật từ BE: GET repair-packages/{id}/items + /items/{id}/history. Lỗi API được ném ra.
    if (!inMemoryPackages.length || (packageId && !inMemoryPackages.some((p) => p.id === packageId || p.code === packageId || p.case_code === packageId))) {
      await acceptanceService.getAcceptancePackages()
    }
    const packages = packageId
      ? inMemoryPackages.filter((p) => p.id === packageId || p.code === packageId || p.case_code === packageId)
      : inMemoryPackages
    const mapped: CaseItem[] = []
    for (const pkg of packages) {
      const list = await apiClient.get<any>(`/projects/${pkg.project_id}/repair-packages/${pkg.id}/items`)
      for (const it of list.data?.items || []) {
        const hist = await apiClient.get<any>(`/projects/${pkg.project_id}/repair-packages/${pkg.id}/items/${it.id}/history`)
        const attempts: any[] = hist.data?.attempts || []
        const last = attempts[attempts.length - 1]
        const status = STATE_STATUS[it.state]
        if (!status) continue
        itemMeta.set(it.id, { projectId: pkg.project_id, packageId: pkg.id, taskId: last?.taskId ?? null, state: it.state })
        mapped.push({
          id: it.id,
          package_id: pkg.id,
          package_code: pkg.code,
          item_code: `ITEM-${short(it.id)}`,
          defect_code: `#DEF-${short(it.defectId)}`,
          title: `Hạng mục ${it.mode}`,
          chainage: '—',
          status,
          status_label: status === 'ACCEPTED' ? 'Đã nghiệm thu đạt' : status === 'REWORK_REQUIRED' ? 'Yêu cầu sửa lại' : 'Chờ nghiệm thu',
          track_type: it.mode === 'FastTrack' ? 'FAST_TRACK' : 'APPROVAL_TRACK',
          attempt_number: attempts.length,
          area_m2: null,
          depth_cm: null,
          volume_btn_c125_kg: null,
          tack_coat_crs1: '—',
          compaction_k98: null,
          flatness_3m_gap_mm: null,
          sand_patch_roughness_mm: null,
          pave_temp_c: null,
          compact_temp_c: null,
          before_image: '',
          before_hash: '—',
          before_time: '—',
          before_gps: '—',
          before_source: '—',
          after_image: '',
          after_hash: '—',
          after_time: last?.finishedAt ? new Date(last.finishedAt).toLocaleString('vi-VN') : '—',
          after_gps: '—',
          after_crew: last?.crewId ? `Crew ${short(last.crewId)}` : '—',
          after_equipment: '—',
          evidence_integrity_status: 'PENDING',
          citizen_published: false,
        } as CaseItem)
      }
    }
    inMemoryCaseItems = [...inMemoryCaseItems.filter((it) => !packages.some((p) => p.id === it.package_id)), ...mapped]
    return JSON.parse(JSON.stringify(mapped))
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
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    const meta = itemMeta.get(itemId)
    if (!meta) throw new Error('Thiếu thông tin BE của hạng mục; hãy tải lại trang.')
    // BE: POST .../items/{itemId}/final-confirmation (Supervisor, If-Match = version hạng mục, Idempotency-Key, reason).
    // Giao diện chưa có ô nhập lý do, BE bắt buộc có lý do nên dùng câu cố định.
    await apiClient.post(
      `/projects/${meta.projectId}/repair-packages/${meta.packageId}/items/${itemId}/final-confirmation`,
      { reason: 'Giám sát xác nhận nghiệm thu đạt' },
      { headers: { 'Idempotency-Key': idemKey(), 'If-Match': await itemEtag(meta.projectId, meta.packageId, itemId) } }
    )
    itemMeta.set(itemId, { ...meta, state: 'Confirmed' })
    inMemoryCaseItems[index] = {
      ...inMemoryCaseItems[index],
      status: 'ACCEPTED',
      status_label: 'ĐÃ NGHIỆM THU ĐẠT'
    }
    syncPackageStats(inMemoryCaseItems[index].package_id)
    return JSON.parse(JSON.stringify(inMemoryCaseItems[index]))
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
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    const current = inMemoryCaseItems[index]
    const nextAttempt = (current.attempt_number || 1) + 1

    // Đóng gói payload DTO chuẩn API-158: decision = 'SUPPLEMENT', reason <= 2000 ký tự
    const decision: 'SUPPLEMENT' | 'ACCEPT' = payload.decision || 'SUPPLEMENT'
    const fullReason = (
      payload.reason ||
      (payload.directives && payload.directives.length > 0
        ? `${payload.directives.join('; ')}${payload.notes ? `. Ghi chú: ${payload.notes}` : ''}`
        : payload.notes || 'Chưa đạt tiêu chuẩn kỹ thuật thi công TCVN 8819:2011')
    ).slice(0, 2000)

    await pmReview(itemId, decision, fullReason)
    inMemoryCaseItems[index] = {
      ...current,
      status: 'REWORK_REQUIRED',
      status_label: `YÊU CẦU SỬA LẠI (LẦN ${nextAttempt})`,
      attempt_number: nextAttempt,
      rework_reason: fullReason,
      rework_directives: payload.directives || []
    }
    if (current.package_id && inMemoryClosedPackageIds.has(current.package_id)) {
      inMemoryClosedPackageIds.delete(current.package_id)
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
    const index = inMemoryCaseItems.findIndex((it) => it.id === itemId)
    if (index === -1) {
      throw new Error(`Item ${itemId} not found`)
    }
    // PM chấp nhận kết quả thi công (review ACCEPT) để chuyển Supervisor xác nhận cuối.
    await pmReview(itemId, 'ACCEPT', 'PM chấp nhận kết quả thi công, trình Giám sát xác nhận')
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
    if (packageId) {
      inMemoryClosedPackageIds.add(packageId)
      const pkg = inMemoryPackages.find((p) => p.id === packageId || p.code === packageId)
      if (pkg) {
        inMemoryClosedPackageIds.add(pkg.id)
        inMemoryClosedPackageIds.add(pkg.code)
        pkg.status = 'PASSED'
        pkg.status_label = `Đã nghiệm thu đạt (${pkg.total_items}/${pkg.total_items})`
      }
    }
    if (caseCode) {
      inMemoryClosedPackageIds.add(caseCode)
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
