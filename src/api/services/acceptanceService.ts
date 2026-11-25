import { apiClient } from '../client'
import { projectService } from './projectService'
import { fieldTaskReadService } from './fieldTaskReadService'
import type { CaseItem, PendingStep, PhotoRef, SubmissionMeasurement } from '../../pages/(sup)/evidence-closeout/types'
import { STEP_LABEL, repairStateLabel, beErrorText } from '../../pages/(sup)/evidence-closeout/acceptanceLabels'

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

/** Một hạng mục trong gói (đọc từ BE) phục vụ thẻ danh sách. */
export interface AcceptancePackageItem {
  id: string
  code: string
  mode: string
  state: string
  step: PendingStep
  step_label: string
  task_id: string | null
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
  items?: AcceptancePackageItem[]
  cancelled_items?: number
  pending_step_label?: string
}

/**
 * DTO chuẩn Backend Spec 17_10: RepairAttemptReviewInput
 * Endpoint: POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/reviews
 * Quy tắc bất biến: PM review decision bắt buộc là "ACCEPT" hoặc "SUPPLEMENT", tuyệt đối không dùng wire "REWORK".
 * DTO chỉ có fieldSubmissionId, decision, reason (không có evidenceIds/notes/directives).
 */
export interface RepairAttemptReviewInput {
  fieldSubmissionId: string
  decision: 'ACCEPT' | 'SUPPLEMENT'
  reason?: string // maxLength: 2000 ký tự
}

// 100% DỮ LIỆU THẬT CSDL BACKEND DOCKER - KHÔNG DÙNG MOCK DATA
export const INITIAL_ACCEPTANCE_PACKAGES: AcceptancePackage[] = []
export const INITIAL_ACCEPTANCE_RECORDS: AcceptanceRecord[] = []

/** Dữ liệu đã đổi so với bản đang xem (item/bản nộp hiện hành khác): UI phải tải lại trước khi thao tác tiếp. */
export class AcceptanceStaleError extends Error {
  constructor(message: string) { super(message); this.name = 'AcceptanceStaleError' }
}
/** Chuỗi thao tác nhiều bước (Fast Track): nói rõ bước đã xong và bước lỗi để đối soát. */
export class AcceptanceStepError extends Error {
  completed: string[]
  failedStep: string
  cause: unknown
  constructor(completed: string[], failedStep: string, cause: unknown) {
    super(`Đã hoàn tất: ${completed.length ? completed.join('; ') : 'chưa có bước nào'}. Bước lỗi: ${failedStep} — ${beErrorText(cause)}. Hạng mục chưa được đánh dấu đóng; bấm tải lại để đối soát trạng thái thật.`)
    this.name = 'AcceptanceStepError'
    this.completed = completed
    this.failedStep = failedStep
    this.cause = cause
  }
}

let inMemoryPackages: AcceptancePackage[] = []
// Metadata BE của từng hạng mục (phục vụ thao tác ghi): projectId, packageId.
const itemMeta = new Map<string, { projectId: string; packageId: string }>()

const ACCEPTANCE_STATES = ['Submitted', 'Reviewed', 'CorrectionRequired', 'Confirmed']
const STATE_STATUS: Record<string, CaseItem['status']> = {
  Submitted: 'PENDING_INSPECTION',
  Reviewed: 'PENDING_INSPECTION',
  CorrectionRequired: 'REWORK_REQUIRED',
  Confirmed: 'ACCEPTED',
  Cancelled: 'CANCELLED',
}
const short = (id: unknown) => String(id ?? '').slice(0, 8).toUpperCase()
const idemKey = () => crypto.randomUUID()
const quoted = (v: unknown) => { const s = String(v ?? ''); return s.startsWith('"') ? s : `"${s}"` }

/** Bước đang chờ theo RepairItemState + trạng thái task (SupplementRequired = PM đã yêu cầu bổ sung, item vẫn Submitted). */
export function pendingStepOf(state: string, mode: string, taskStatus?: string | null): PendingStep {
  switch (state) {
    case 'Submitted': return String(taskStatus || '').toUpperCase().replace(/_/g, '') === 'SUPPLEMENTREQUIRED' ? 'SUPPLEMENT' : 'PM_REVIEW'
    case 'Reviewed': return mode === 'FastTrack' ? 'PM_CONFIRM' : 'SUP_CONFIRM'
    case 'CorrectionRequired': return 'CORRECTION'
    case 'Confirmed': return 'ACCEPTED'
    default: return 'CANCELLED'
  }
}

async function itemEtag(projectId: string, packageId: string, itemId: string): Promise<{ etag: string; state: string; mode: string }> {
  const res = await apiClient.get<any>(`/projects/${projectId}/repair-packages/${packageId}/items/${itemId}`)
  const etag = res.headers?.['etag'] || res.data?.version
  if (!etag) throw new Error('BE không trả ETag/version của hạng mục.')
  return { etag: quoted(etag), state: String(res.data?.state || ''), mode: String(res.data?.mode || '') }
}

interface Head { itemId: string; projectId: string; packageId: string; taskId: string | null; submissionId: string | null; etag: string; state: string; mode: string; taskStatus: string | null }
/** Đọc lại đầu hồ sơ hiện hành từ BE ngay trước khi ghi: item (state/version), task, bản nộp mới nhất. */
async function readHead(itemId: string): Promise<Head> {
  const meta = itemMeta.get(itemId)
  if (!meta) throw new AcceptanceStaleError('Thiếu thông tin BE của hạng mục; hãy tải lại trang.')
  const it = await itemEtag(meta.projectId, meta.packageId, itemId)
  const hist = await apiClient.get<any>(`/projects/${meta.projectId}/repair-packages/${meta.packageId}/items/${itemId}/history`)
  const attempts: any[] = hist.data?.attempts || []
  const taskId: string | null = hist.data?.item?.currentBinding?.taskId ?? attempts[attempts.length - 1]?.taskId ?? null
  let submissionId: string | null = null
  let taskStatus: string | null = null
  if (taskId) {
    const task = await apiClient.get<any>(`/projects/${meta.projectId}/field-inspection-tasks/${taskId}`)
    submissionId = task.data?.latestSubmissionId ?? null
    taskStatus = task.data?.status ?? null
  }
  return { itemId, ...meta, taskId, submissionId, etag: it.etag, state: it.state, mode: it.mode, taskStatus }
}

export interface ReviewExpect { submissionId?: string | null; version?: string | null }
function assertFresh(h: Head, expect?: ReviewExpect) {
  if (expect?.submissionId && h.submissionId !== expect.submissionId)
    throw new AcceptanceStaleError('Bản nộp hiện hành đã đổi (có bản nộp mới hơn). Đã tải lại; hãy đối chiếu bản mới trước khi thao tác.')
  if (expect?.version && quoted(expect.version) !== h.etag)
    throw new AcceptanceStaleError('Hạng mục đã thay đổi phiên bản so với bản đang xem. Đã tải lại; hãy xem lại trước khi thao tác.')
}

async function postReview(h: Head, decision: 'ACCEPT' | 'SUPPLEMENT', reason?: string) {
  if (!h.taskId) throw new Error('Hạng mục chưa có lần thi công (attempt) để review.')
  if (!h.submissionId) throw new Error('Nhiệm vụ chưa có bản nộp (submission) để review.')
  const body: RepairAttemptReviewInput = { fieldSubmissionId: h.submissionId, decision, ...(reason && reason.trim() ? { reason: reason.trim().slice(0, 2000) } : {}) }
  const res = await apiClient.post(
    `/projects/${h.projectId}/repair-packages/${h.packageId}/items/${h.itemId}/tasks/${h.taskId}/attempts/reviews`,
    body,
    { headers: { 'Idempotency-Key': idemKey(), 'If-Match': h.etag } }
  )
  return res.data as { reviewId?: string; decision?: string; submissionId?: string }
}

async function postFinal(h: Head, reason: string) {
  if (!reason.trim()) throw new Error('Cần nhập lý do/ghi chú xác nhận cuối (BE bắt buộc).')
  await apiClient.post(
    `/projects/${h.projectId}/repair-packages/${h.packageId}/items/${h.itemId}/final-confirmation`,
    { reason: reason.trim().slice(0, 2000) },
    { headers: { 'Idempotency-Key': idemKey(), 'If-Match': h.etag } }
  )
}

async function crewNames(projectId: string): Promise<{ names: Map<string, string>; error: string | null }> {
  try {
    const rows = await projectService.fetchProjectMembers(projectId)
    return { names: new Map(rows.filter((r: any) => r.userId && r.displayName).map((r: any) => [String(r.userId), String(r.displayName)])), error: null }
  } catch (e) { return { names: new Map(), error: `Không đọc được danh sách nhân sự dự án: ${beErrorText(e)}` } }
}

/** Đọc blob ảnh của một PhotoRef (ảnh bản nộp qua route FIELD evidence; ảnh nguồn Case qua contentPath do BE trả). */
export async function loadAcceptancePhoto(projectId: string, ref: PhotoRef, signal?: AbortSignal): Promise<Blob> {
  if (ref.source === 'SUBMISSION') {
    const r = await fieldTaskReadService.evidenceImage(projectId, ref.taskId, ref.fileId, ref.checksum, signal)
    return r.blob
  }
  if (!ref.contentPath || !/^\/api\/v1\/cases\/[0-9a-f-]{36}\/reports\/[0-9a-f-]{36}\/evidence\/[0-9a-f-]{36}\/content$/i.test(ref.contentPath))
    throw new Error('Đường ảnh nguồn không đúng dạng evidence của Report; không tự ghép đường dẫn.')
  try {
    const res = await apiClient.get<Blob>(ref.contentPath.replace(/^\/api\/v1/, ''), { responseType: 'blob', signal })
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(res.data.type.split(';')[0])) throw new Error('Nội dung trả về không phải ảnh JPEG/PNG/WebP.')
    return res.data
  } catch (error: any) {
    if (error?.response?.data instanceof Blob && error.response.data.type.includes('json')) {
      try { error.response.data = JSON.parse(await error.response.data.text()) } catch { /* giữ lỗi HTTP gốc */ }
    }
    throw error
  }
}

interface ItemCore { raw: any; taskId: string | null; taskStatus: string | null; attempts: any[] }
async function readItemCore(projectId: string, packageId: string, it: any, withTask: boolean): Promise<ItemCore> {
  const hist = await apiClient.get<any>(`/projects/${projectId}/repair-packages/${packageId}/items/${it.id}/history`)
  const attempts: any[] = hist.data?.attempts || []
  const taskId: string | null = hist.data?.item?.currentBinding?.taskId ?? attempts[attempts.length - 1]?.taskId ?? null
  let taskStatus: string | null = null
  if (withTask && taskId) {
    const t = await apiClient.get<any>(`/projects/${projectId}/field-inspection-tasks/${taskId}`)
    taskStatus = t.data?.status ?? null
  }
  return { raw: it, taskId, taskStatus, attempts }
}

function buildPackage(pkg: any, projectId: string, projectName: string, items: any[], cores: Map<string, ItemCore>): AcceptancePackage | null {
  const inAcceptance = items.filter((it) => ACCEPTANCE_STATES.includes(it.state || ''))
  if (inAcceptance.length === 0) return null
  const live = items.filter((it) => it.state !== 'Cancelled')
  const cancelled = items.length - live.length
  const accepted = live.filter((it) => it.state === 'Confirmed').length
  const rework = live.filter((it) => it.state === 'CorrectionRequired').length
  const pending = live.filter((it) => it.state === 'Submitted' || it.state === 'Reviewed').length
  const status: AcceptancePackage['status'] = live.length > 0 && accepted === live.length ? 'PASSED' : rework > 0 ? 'REWORK_REQUIRED' : 'PENDING_INSPECTION'
  const rows: AcceptancePackageItem[] = items
    .filter((it) => ACCEPTANCE_STATES.includes(it.state || '') || it.state === 'Cancelled')
    .map((it) => {
      const core = cores.get(it.id)
      const step = pendingStepOf(it.state, it.mode, core?.taskStatus)
      return { id: it.id, code: `ITEM-${short(it.id)}`, mode: it.mode, state: it.state, step, step_label: STEP_LABEL[step], task_id: core?.taskId ?? null }
    })
  const open = rows.find((r) => r.step !== 'ACCEPTED' && r.step !== 'CANCELLED')
  return {
    id: pkg.id,
    code: `PKG-${short(pkg.id)}`,
    case_code: `#CASE-${pkg.defectId ? short(pkg.defectId) : '0000'}`,
    title: `Gói ${short(pkg.id)}`,
    project_id: projectId,
    project_name: projectName,
    chainage_display: 'Chưa có dữ liệu',
    contractor_name: 'Chưa có dữ liệu',
    total_items: live.length,
    accepted_items: accepted,
    pending_items: pending,
    rework_items: rework,
    technical_scope: 'Chưa có dữ liệu',
    status,
    is_closed: false,
    status_label:
      status === 'PASSED' ? `Đã nghiệm thu ${accepted}/${live.length}` : status === 'REWORK_REQUIRED' ? `Cần sửa lại ${rework} mục` : `${accepted}/${live.length} đã nghiệm thu`,
    sla_display: 'Chưa có dữ liệu',
    completion_date: 'Chưa có dữ liệu',
    items: rows,
    cancelled_items: cancelled,
    pending_step_label: open ? open.step_label : status === 'PASSED' ? STEP_LABEL.ACCEPTED : undefined,
  }
}

export const acceptanceService = {
  /**
   * Lấy danh sách các gói chờ nghiệm thu TRỰC TIẾP TỪ BE (GET repair-packages + items + history/task để biết bước đang chờ).
   */
  async getAcceptancePackages(filter?: { status?: string; projectId?: string; query?: string }): Promise<AcceptancePackage[]> {
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
          const items: any[] = itemsRes.data?.items || []
          if (!items.some((it) => ACCEPTANCE_STATES.includes(it.state || ''))) continue
          const cores = new Map<string, ItemCore>()
          // Chỉ hạng mục Submitted cần đọc task để phân biệt "chờ PM đánh giá" và "cần bổ sung".
          await Promise.all(items.filter((it) => it.state === 'Submitted').map(async (it) => { cores.set(it.id, await readItemCore(projectId, pkg.id, it, true)) }))
          for (const it of items) itemMeta.set(it.id, { projectId, packageId: pkg.id })
          const built = buildPackage(pkg, projectId, projectNames.get(projectId) || projectId, items, cores)
          if (built) out.push(built)
        }
        return out
      })
    )
    inMemoryPackages = lists.flat()

    let result = JSON.parse(JSON.stringify(inMemoryPackages)) as AcceptancePackage[]
    if (filter?.status && filter.status !== 'ALL') {
      if (filter.status === 'CLOSED') result = result.filter((p) => p.is_closed)
      else result = result.filter((p) => p.status === filter.status)
    }
    if (filter?.query && filter.query.trim()) {
      const q = filter.query.trim().toLowerCase()
      result = result.filter((p) => p.code.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.project_name.toLowerCase().includes(q) || p.case_code.toLowerCase().includes(q))
    }
    return result
  },

  /** Lấy chi tiết gói theo mã (id hoặc code). Luôn đọc lại BE (không dùng cache cũ). */
  async getAcceptancePackageById(packageId: string): Promise<AcceptancePackage | null> {
    await acceptanceService.getAcceptancePackages()
    const found = inMemoryPackages.find((p) => p.id === packageId || p.code === packageId || p.case_code === packageId)
    return found ? (JSON.parse(JSON.stringify(found)) as AcceptancePackage) : null
  },

  /**
   * Hạng mục của gói với dữ liệu thật: GET items + history + task + bản nộp hiện hành (số đo, ảnh), tên Crew từ danh sách nhân sự.
   * Thiếu nguồn thì để trống, UI hiển thị "Chưa có dữ liệu". Lỗi từng khối được ghi vào load_notes (không nuốt lỗi).
   */
  async getCloseoutItems(packageId?: string): Promise<CaseItem[]> {
    if (!inMemoryPackages.length || (packageId && !inMemoryPackages.some((p) => p.id === packageId || p.code === packageId || p.case_code === packageId))) {
      await acceptanceService.getAcceptancePackages()
    }
    const packages = packageId
      ? inMemoryPackages.filter((p) => p.id === packageId || p.code === packageId || p.case_code === packageId)
      : inMemoryPackages
    const mapped: CaseItem[] = []
    for (const pkg of packages) {
      const list = await apiClient.get<any>(`/projects/${pkg.project_id}/repair-packages/${pkg.id}/items`)
      const crew = await crewNames(pkg.project_id)
      for (const it of list.data?.items || []) {
        const status = STATE_STATUS[it.state]
        if (!status || (!ACCEPTANCE_STATES.includes(it.state) && it.state !== 'Cancelled')) continue
        itemMeta.set(it.id, { projectId: pkg.project_id, packageId: pkg.id })
        const hist = await apiClient.get<any>(`/projects/${pkg.project_id}/repair-packages/${pkg.id}/items/${it.id}/history`)
        const attempts: any[] = hist.data?.attempts || []
        const last = attempts[attempts.length - 1]
        const taskId: string | null = hist.data?.item?.currentBinding?.taskId ?? last?.taskId ?? null
        const notes: string[] = []
        if (crew.error) notes.push(crew.error)
        let task: any = null
        let submission: any = null
        if (taskId) {
          try { task = (await apiClient.get<any>(`/projects/${pkg.project_id}/field-inspection-tasks/${taskId}`)).data } catch (e) { notes.push(`Không đọc được nhiệm vụ FIELD: ${beErrorText(e)}`) }
          if (task?.latestSubmissionId) {
            try { submission = (await apiClient.get<any>(`/projects/${pkg.project_id}/field-inspection-tasks/${taskId}/submissions/${task.latestSubmissionId}`)).data } catch (e) { notes.push(`Không đọc được bản nộp hiện hành: ${beErrorText(e)}`) }
          }
        }
        const evidence: any[] = submission?.evidence || []
        const toRef = (e: any): PhotoRef => ({ fileId: e.fileId, purpose: String(e.purpose || ''), taskId: taskId as string, checksum: e.checksumSha256, capturedAt: e.capturedAt ?? null, source: 'SUBMISSION' })
        const withFile = evidence.filter((e) => e.fileId)
        let beforeRef: PhotoRef | null = withFile.find((e) => e.purpose === 'BEFORE') ? toRef(withFile.find((e) => e.purpose === 'BEFORE')) : null
        const afterE = [...withFile].reverse().find((e) => e.purpose === 'AFTER')
        const afterRef: PhotoRef | null = afterE ? toRef(afterE) : null
        if (!beforeRef) {
          try {
            const src = await apiClient.get<any>(`/projects/${pkg.project_id}/repair-packages/${pkg.id}/items/${it.id}/source-defect`)
            const ev = (src.data?.evidence || []).find((x: any) => x.contentPath)
            if (ev) beforeRef = { fileId: ev.evidenceId, purpose: 'DEFECT_SOURCE', taskId: taskId || '', capturedAt: ev.capturedAt ?? null, source: 'DEFECT_SOURCE', contentPath: ev.contentPath }
          } catch (e) { notes.push(`Không đọc được ảnh nguồn của khiếm khuyết: ${beErrorText(e)}`) }
        }
        const others = withFile.filter((e) => e !== afterE && !(beforeRef?.source === 'SUBMISSION' && e.fileId === beforeRef.fileId)).map(toRef)
        const crewId: string | null = last?.crewId ?? task?.assignedToUserId ?? null
        const crewName = crewId ? crew.names.get(String(crewId)) ?? null : null
        const step = pendingStepOf(it.state, it.mode, task?.status)
        const measurements: SubmissionMeasurement[] = (submission?.measurements || []).map((m: any) => ({ sampleId: m.sampleId, type: m.type, value: m.value, state: m.state, unit: m.unit, unknownReason: m.unknownReason }))
        mapped.push({
          id: it.id,
          package_id: pkg.id,
          package_code: pkg.code,
          item_code: `ITEM-${short(it.id)}`,
          defect_code: `#DEF-${short(it.defectId)}`,
          title: `Hạng mục ${it.mode}`,
          chainage: 'Chưa có dữ liệu',
          status,
          status_label: STEP_LABEL[step],
          track_type: it.mode === 'FastTrack' ? 'FAST_TRACK' : 'APPROVAL_TRACK',
          attempt_number: attempts.length,
          area_m2: null,
          depth_cm: null,
          volume_btn_c125_kg: null,
          tack_coat_crs1: 'Chưa có dữ liệu',
          compaction_k98: null,
          flatness_3m_gap_mm: null,
          sand_patch_roughness_mm: null,
          pave_temp_c: null,
          compact_temp_c: null,
          before_image: '',
          before_hash: beforeRef?.checksum || 'Chưa có dữ liệu',
          before_time: beforeRef?.capturedAt ? new Date(beforeRef.capturedAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu',
          before_gps: 'Chưa có dữ liệu',
          before_source: beforeRef ? (beforeRef.source === 'SUBMISSION' ? 'Ảnh TRƯỚC trong bản nộp của Crew' : 'Ảnh phản ánh gốc của khiếm khuyết (Case)') : 'Chưa có ảnh trước',
          after_image: '',
          after_hash: afterRef?.checksum || 'Chưa có dữ liệu',
          after_time: last?.finishedAt ? new Date(last.finishedAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu',
          after_gps: 'Chưa có dữ liệu',
          after_crew: crewName || (crewId ? `Crew (chưa đọc được tên) · ID ${short(crewId)}` : 'Chưa có dữ liệu'),
          after_equipment: 'Chưa có dữ liệu',
          evidence_integrity_status: 'PENDING',
          citizen_published: false,
          project_id: pkg.project_id,
          be_state: it.state,
          item_version: String(it.version ?? ''),
          task_id: taskId,
          task_status: task?.status ?? null,
          pending_step: step,
          submission_id: submission?.id ?? null,
          submission_revision: submission?.revision ?? null,
          submitted_at: submission?.serverReceivedAt ?? last?.serverReceivedAt ?? null,
          construction_start: last?.startedAt ?? null,
          construction_end: last?.finishedAt ?? null,
          time_provenance: last?.timeProvenance ?? null,
          crew_id: crewId,
          crew_display: crewName,
          readiness: submission?.readiness ?? null,
          missing_reasons: submission?.missingReasons || [],
          measurements,
          before_ref: beforeRef,
          after_ref: afterRef,
          other_refs: others,
          attempts_count: attempts.length,
          load_notes: notes,
        } as CaseItem)
      }
    }
    return JSON.parse(JSON.stringify(mapped))
  },

  /** Ảnh trước/sau của bản nộp hiện hành cho thẻ danh sách (đọc theo yêu cầu, từng thẻ). Lỗi được ném ra để thẻ hiển thị. */
  async getItemPhotoRefs(projectId: string, packageId: string, itemId: string): Promise<{ before: PhotoRef | null; after: PhotoRef | null }> {
    const base = `/projects/${projectId}/repair-packages/${packageId}/items/${itemId}`
    const hist = await apiClient.get<any>(`${base}/history`)
    const attempts: any[] = hist.data?.attempts || []
    const taskId: string | null = hist.data?.item?.currentBinding?.taskId ?? attempts[attempts.length - 1]?.taskId ?? null
    let before: PhotoRef | null = null
    let after: PhotoRef | null = null
    if (taskId) {
      const task = await apiClient.get<any>(`/projects/${projectId}/field-inspection-tasks/${taskId}`)
      if (task.data?.latestSubmissionId) {
        const sub = await apiClient.get<any>(`/projects/${projectId}/field-inspection-tasks/${taskId}/submissions/${task.data.latestSubmissionId}`)
        const ev: any[] = (sub.data?.evidence || []).filter((e: any) => e.fileId)
        const toRef = (e: any): PhotoRef => ({ fileId: e.fileId, purpose: String(e.purpose || ''), taskId: taskId as string, checksum: e.checksumSha256, capturedAt: e.capturedAt ?? null, source: 'SUBMISSION' })
        const b = ev.find((e) => e.purpose === 'BEFORE')
        const a = [...ev].reverse().find((e) => e.purpose === 'AFTER')
        before = b ? toRef(b) : null
        after = a ? toRef(a) : null
      }
    }
    if (!before) {
      const src = await apiClient.get<any>(`${base}/source-defect`)
      const ev = (src.data?.evidence || []).find((x: any) => x.contentPath)
      if (ev) before = { fileId: ev.evidenceId, purpose: 'DEFECT_SOURCE', taskId: taskId || '', capturedAt: ev.capturedAt ?? null, source: 'DEFECT_SOURCE', contentPath: ev.contentPath }
    }
    return { before, after }
  },

  /** Trạng thái đóng tổng thể vụ việc: BE chưa có API → luôn chưa đóng (không giả lập). */
  async getCaseCloseoutStatus(packageId?: string): Promise<{ isCaseClosed: boolean; caseCode: string }> {
    const pkg = inMemoryPackages.find((p) => p.id === packageId || p.code === packageId)
    return { isCaseClosed: false, caseCode: pkg ? pkg.case_code : '' }
  },

  /**
   * Giám sát xác nhận cuối (Normal): POST …/final-confirmation. Chỉ gửi khi item đang Reviewed (PM đã ACCEPT);
   * đọc lại trạng thái ngay trước khi ghi, lệch phiên bản/bản nộp thì ném AcceptanceStaleError.
   */
  async supervisorFinalConfirm(itemId: string, reason: string, expect?: ReviewExpect): Promise<void> {
    const h = await readHead(itemId)
    assertFresh(h, expect)
    if (h.state !== 'Reviewed') throw new AcceptanceStaleError(`Hạng mục đang ở "${repairStateLabel(h.state)}", chưa có PM ACCEPT hợp lệ nên chưa xác nhận cuối được.`)
    await postFinal(h, reason)
  },

  /**
   * PM yêu cầu bổ sung hồ sơ (review SUPPLEMENT) — KHÁC với yêu cầu sửa lại (hiệu chỉnh/corrections).
   * reason = nội dung PM nhập; fieldSubmissionId = bản nộp hiện hành đọc lại ngay trước khi gửi.
   */
  async pmSupplementReview(itemId: string, reason: string, expect?: ReviewExpect): Promise<void> {
    if (!reason.trim()) throw new Error('Cần nhập nội dung yêu cầu bổ sung.')
    const h = await readHead(itemId)
    assertFresh(h, expect)
    if (h.state !== 'Submitted') throw new AcceptanceStaleError(`Hạng mục đang ở "${repairStateLabel(h.state)}", không còn ở bước PM đánh giá.`)
    if (String(h.taskStatus || '').toUpperCase().replace(/_/g, '') === 'SUPPLEMENTREQUIRED') throw new AcceptanceStaleError('Đã yêu cầu bổ sung cho bản nộp này; đang chờ Crew nộp bản bổ sung.')
    await postReview(h, 'SUPPLEMENT', reason)
  },

  /** PM chấp nhận hồ sơ và trình Giám sát (review ACCEPT). notes = ghi chú PM (gửi vào trường reason của contract). */
  async pmAcceptReview(itemId: string, notes: string, expect?: ReviewExpect): Promise<void> {
    const h = await readHead(itemId)
    assertFresh(h, expect)
    if (h.state !== 'Submitted') throw new AcceptanceStaleError(`Hạng mục đang ở "${repairStateLabel(h.state)}", không còn ở bước PM đánh giá.`)
    if (String(h.taskStatus || '').toUpperCase().replace(/_/g, '') === 'SUPPLEMENTREQUIRED') throw new AcceptanceStaleError('Hồ sơ đang ở trạng thái Cần bổ sung; chờ Crew nộp bản bổ sung rồi mới chấp nhận được.')
    await postReview(h, 'ACCEPT', notes)
  },

  /**
   * Fast Track (HUY-BUG-001): đảm bảo có PM ACCEPT hợp lệ rồi mới final-confirmation.
   *  - state Submitted: gửi review ACCEPT → đọc lại (phải là Reviewed) → final-confirmation.
   *  - state Reviewed: đã có ACCEPT hợp lệ → KHÔNG gửi review trùng, chỉ final-confirmation.
   * Lỗi giữa chừng ném AcceptanceStepError nêu bước đã xong; không tự đánh dấu đã đóng.
   */
  async closeFastTrackItem(itemId: string, note: string, expect?: ReviewExpect): Promise<{ completed: string[] }> {
    const completed: string[] = []
    let h = await readHead(itemId)
    assertFresh(h, expect)
    if (h.state === 'Submitted') {
      if (String(h.taskStatus || '').toUpperCase().replace(/_/g, '') === 'SUPPLEMENTREQUIRED') throw new AcceptanceStaleError('Hồ sơ đang ở trạng thái Cần bổ sung; chờ Crew nộp bản bổ sung.')
      try { await postReview(h, 'ACCEPT', note) } catch (e) { throw new AcceptanceStepError(completed, 'PM chấp nhận hồ sơ (review ACCEPT)', e) }
      completed.push('PM chấp nhận hồ sơ (review ACCEPT)')
      try { h = await readHead(itemId) } catch (e) { throw new AcceptanceStepError(completed, 'đọc lại trạng thái sau ACCEPT', e) }
      if (h.state !== 'Reviewed') throw new AcceptanceStepError(completed, 'đọc lại trạng thái sau ACCEPT', new Error(`Hạng mục đang ở "${repairStateLabel(h.state)}", chưa ở trạng thái PM đã chấp nhận.`))
    } else if (h.state !== 'Reviewed') {
      throw new AcceptanceStaleError(`Hạng mục đang ở "${repairStateLabel(h.state)}", không ở bước đóng Fast Track.`)
    }
    try { await postFinal(h, note) } catch (e) { throw new AcceptanceStepError(completed, 'xác nhận cuối (final-confirmation)', e) }
    completed.push('xác nhận cuối (final-confirmation)')
    return { completed }
  },
}
