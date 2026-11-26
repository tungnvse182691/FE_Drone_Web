import { apiClient } from '../client'
import { TriageCase } from '../../types/domain'
import { surveyService } from './surveyService'
import { repairService } from './repairService'
import { triageService } from './triageService'
import { SEVERITY_LABEL } from '../../utils/severity'

export interface H6ClockItem {
  id: string
  projectId: string
  /** Giá trị `kind` nguyên bản của BE (DeadlineClockKind, PascalCase), ví dụ `SupervisorInitialApproval`. */
  kind: string
  /** BE không có tiêu đề: tách từ `kind` thành các từ, không dịch/không đặt nhãn mới. */
  title: string
  /** BE không có mã đối tượng: rút gọn từ `targetId`. */
  targetCode: string
  /** BE không cung cấp route đích: để rỗng, widget ẩn nút điều hướng. */
  targetPath: string
  currentDueAt: string
  overdue: boolean
  remainingTime: string
  appointedRole: string
  /** ETag/version của clock, cần cho If-Match khi gia hạn. */
  version: string
}

export interface DashboardDefectRow {
  id: string
  code: string
  image_url: string | null
  severity: string
  /** Lý trình theo service khảo sát (BE chưa trả lý trình nên là chuỗi thông báo). */
  stationing: string
  /** 0..1 (service khảo sát trả phần trăm 0..100, chia 100 ở đây). */
  confidence_score: number
}

export interface DashboardRepairRow {
  id: string
  code: string
  name: string
  status: string
  defect_count: number
  item_count: number
}

export interface PMDashboardStats {
  surveysCount: number
  pendingAIDefectsCount: number
  citizenCasesCount: number
  runningBatchesCount: number
  overdueClocksCount: number
}

export type PMDashboardSection = 'surveys' | 'defects' | 'citizenCases' | 'repairBatches' | 'clocks'

export interface PMDashboardData {
  stats: PMDashboardStats
  defects: DashboardDefectRow[]
  citizenCases: TriageCase[]
  repairBatches: DashboardRepairRow[]
  clocks: H6ClockItem[]
  /** Lỗi theo từng phần (API lỗi thì báo lỗi, không fallback mock). */
  errors: Partial<Record<PMDashboardSection, string>>
  /** true nếu BE còn trang tiếp theo mà dashboard chưa nạp hết. */
  clocksTruncated: boolean
}

interface PageDto<T> { items?: T[]; nextCursor?: string | null }
interface ClockViewDto {
  id: string
  projectId: string
  kind?: string | null
  targetId: string
  currentDueAt: string
  overdue: boolean
  version?: string | null
  appointedRole?: string | null
}
interface ClockPageDto { items?: ClockViewDto[] | null; continuation?: unknown }

const SEVERITY_CODE_BY_VI: Record<string, string> = Object.fromEntries(Object.entries(SEVERITY_LABEL).map(([code, label]) => [label, code]))

const errorText = (e: unknown): string => {
  const anyErr = e as { response?: { status?: number; data?: { detail?: string; title?: string } }; message?: string }
  const status = anyErr?.response?.status
  const detail = anyErr?.response?.data?.detail || anyErr?.response?.data?.title || anyErr?.message || 'Lỗi không xác định'
  return status ? `HTTP ${status}: ${detail}` : detail
}

const humanizeKind = (kind: string): string => kind.replace(/([a-z])([A-Z])/g, '$1 $2')

const formatRemaining = (dueAt: string): string => {
  const diff = new Date(dueAt).getTime() - Date.now()
  const abs = Math.abs(diff)
  const h = Math.floor(abs / 3_600_000)
  const m = Math.floor((abs % 3_600_000) / 60_000)
  const text = h > 0 ? `${h} giờ ${m} phút` : `${m} phút`
  return diff <= 0 ? `Quá hạn ${text}` : `Còn ${text}`
}

async function readProjectIds(): Promise<string[]> {
  const ids: string[] = []
  let cursor: string | null | undefined
  for (let page = 0; page < 20; page++) {
    const res = await apiClient.get<PageDto<{ projectId: string }>>('/projects', {
      params: cursor ? { cursor } : undefined,
    })
    for (const item of res.data?.items || []) ids.push(item.projectId)
    cursor = res.data?.nextCursor
    if (!cursor) break
  }
  return ids
}

export const dashboardService = {
  /**
   * Dashboard PM: 100% dữ liệu từ BE qua các service đã gắn API.
   * BE không có endpoint tổng hợp /dashboard/pm nên gom theo từng dự án của tài khoản.
   * Mỗi phần tải độc lập; lỗi của phần nào hiển thị lỗi ở phần đó, không dùng dữ liệu giả.
   */
  async getPMDashboard(): Promise<PMDashboardData> {
    const errors: PMDashboardData['errors'] = {}
    let projectIds: string[] = []
    let projectsError: string | null = null
    try {
      projectIds = await readProjectIds()
    } catch (e) {
      projectsError = errorText(e)
    }

    const [surveysR, detectionsR, casesR, packagesR, clocksR] = await Promise.allSettled([
      surveyService.getSurveys(),
      surveyService.getAllProjectAiDetections(),
      triageService.getCases({ source: 'CITIZEN' }),
      (async () => {
        if (projectsError) throw new Error(projectsError)
        const lists = await Promise.all(projectIds.map((id) => repairService.fetchPackagesFromApi(id)))
        return lists.flat()
      })(),
      (async () => {
        if (projectsError) throw new Error(projectsError)
        let truncated = false
        const lists = await Promise.all(
          projectIds.map(async (id) => {
            const res = await apiClient.get<ClockPageDto>(`/projects/${id}/clocks`, { params: { limit: 100 } })
            if (res.data?.continuation) truncated = true
            return res.data?.items || []
          })
        )
        return { items: lists.flat(), truncated }
      })(),
    ])

    const surveysCount = surveysR.status === 'fulfilled' ? surveysR.value.length : 0
    if (surveysR.status === 'rejected') errors.surveys = errorText(surveysR.reason)

    let defects: DashboardDefectRow[] = []
    let pendingAIDefectsCount = 0
    if (detectionsR.status === 'fulfilled') {
      const pending = detectionsR.value.filter((d) => d.status === 'PENDING')
      pendingAIDefectsCount = pending.length
      const top = pending.slice(0, 5)
      const urls = await Promise.allSettled(
        top.map((d) => (d.frameFileId ? surveyService.getFileContentUrl(d.frameFileId) : Promise.resolve(null)))
      )
      defects = top.map((d, i) => ({
        id: d.id,
        code: d.code,
        image_url: urls[i].status === 'fulfilled' ? urls[i].value : null,
        severity: SEVERITY_CODE_BY_VI[d.severityLevel] || d.severityLevel,
        stationing: d.stationing,
        confidence_score: d.confidence / 100,
      }))
    } else {
      errors.defects = errorText(detectionsR.reason)
    }

    const citizenCases = casesR.status === 'fulfilled' ? casesR.value : []
    if (casesR.status === 'rejected') errors.citizenCases = errorText(casesR.reason)

    const repairBatches: DashboardRepairRow[] =
      packagesR.status === 'fulfilled'
        ? packagesR.value.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.title,
            status: p.status,
            defect_count: p.defect_count,
            item_count: p.total_items,
          }))
        : []
    if (packagesR.status === 'rejected') errors.repairBatches = errorText(packagesR.reason)

    let clocks: H6ClockItem[] = []
    let clocksTruncated = false
    if (clocksR.status === 'fulfilled') {
      clocksTruncated = clocksR.value.truncated
      clocks = clocksR.value.items.map((c) => ({
        id: c.id,
        projectId: c.projectId,
        kind: c.kind || '',
        title: humanizeKind(c.kind || ''),
        targetCode: `#${c.targetId.slice(0, 8)}`,
        targetPath: '',
        currentDueAt: c.currentDueAt,
        overdue: c.overdue,
        remainingTime: formatRemaining(c.currentDueAt),
        appointedRole: c.appointedRole || '',
        version: c.version || '',
      }))
    } else {
      errors.clocks = errorText(clocksR.reason)
    }

    return {
      stats: {
        surveysCount,
        pendingAIDefectsCount,
        citizenCasesCount: citizenCases.length,
        runningBatchesCount: repairBatches.length,
        overdueClocksCount: clocks.filter((c) => c.overdue).length,
      },
      defects,
      citizenCases,
      repairBatches,
      clocks,
      errors,
      clocksTruncated,
    }
  },

  /** Gia hạn clock: POST /projects/{projectId}/clocks/{clockId}/extensions (If-Match = version, Idempotency-Key). */
  async extendClock(clock: H6ClockItem, extraHours: number, reason: string): Promise<void> {
    if (!clock.version) throw new Error('Clock không có version (ETag) để gửi If-Match.')
    const newDueAt = new Date(new Date(clock.currentDueAt).getTime() + extraHours * 3_600_000).toISOString()
    await apiClient.post(
      `/projects/${clock.projectId}/clocks/${clock.id}/extensions`,
      { newDueAt, reason },
      { headers: { 'If-Match': clock.version.startsWith('"') ? clock.version : `"${clock.version}"`, 'Idempotency-Key': crypto.randomUUID() } }
    )
  },
}
