import { apiClient } from '../client'
import { projectReportingService, type Summary, type TimelineItem } from './projectReportingService'

/** Dự án từ GET /projects (ProjectListItemResponseDto). */
export interface SupDashboardProject {
  projectId: string
  projectCode: string
  name: string
  status: string
  primaryProjectManagerName?: string | null
}

export interface SupDashboardActivity extends TimelineItem {
  projectId: string
  projectCode: string
}

export interface SupDashboardData {
  /** `asOf` do BE trả trong GET /projects. */
  asOf: string | null
  projects: SupDashboardProject[]
  summaries: Record<string, Summary>
  activities: SupDashboardActivity[]
  /** Lỗi theo từng nguồn (HTTP status + code/chi tiết), không fallback mock. */
  errors: { projects?: string; summaries?: string; timeline?: string }
}

interface ProjectPageDto {
  items?: SupDashboardProject[]
  nextCursor?: string | null
  asOf?: string
}

export const dashboardErrorText = (e: unknown): string => {
  const err = e as {
    response?: { status?: number; data?: { code?: string; errorCode?: string; detail?: string; title?: string } }
    message?: string
  }
  const status = err?.response?.status
  const d = err?.response?.data
  const code = d?.code || d?.errorCode
  const detail = d?.detail || d?.title || err?.message || 'Lỗi không xác định'
  return status ? `HTTP ${status}${code ? ` (${code})` : ''}: ${detail}` : detail
}

const TIMELINE_PAGE_SIZE = 10

export const supDashboardService = {
  /**
   * Dashboard Giám sát: 100% dữ liệu từ BE.
   * - GET /projects (danh sách dự án + asOf)
   * - GET /projects/{id}/reports/summary (số liệu báo cáo theo dự án)
   * - GET /projects/{id}/reports/timeline (hoạt động gần đây)
   * Mỗi nguồn tải độc lập; lỗi nguồn nào hiển thị lỗi nguồn đó.
   */
  async load(signal?: AbortSignal): Promise<SupDashboardData> {
    const data: SupDashboardData = { asOf: null, projects: [], summaries: {}, activities: [], errors: {} }

    try {
      let cursor: string | null | undefined
      for (let page = 0; page < 50; page++) {
        const res = await apiClient.get<ProjectPageDto>('/projects', {
          params: { limit: 100, ...(cursor ? { cursor } : {}) },
          signal,
        })
        data.projects.push(...(res.data?.items || []))
        if (res.data?.asOf) data.asOf = res.data.asOf
        cursor = res.data?.nextCursor
        if (!cursor) break
      }
    } catch (e) {
      data.errors.projects = dashboardErrorText(e)
      return data
    }

    const summaryErrors: string[] = []
    const timelineErrors: string[] = []
    await Promise.all(
      data.projects.map(async (p) => {
        const [sum, tl] = await Promise.allSettled([
          projectReportingService.summary(p.projectId, {}, signal),
          apiClient.get<{ items?: TimelineItem[] }>(`/projects/${p.projectId}/reports/timeline`, {
            params: { aggregateType: 'Project', aggregateId: p.projectId, pageSize: TIMELINE_PAGE_SIZE },
            signal,
          }),
        ])
        if (sum.status === 'fulfilled') data.summaries[p.projectId] = sum.value
        else summaryErrors.push(`${p.projectCode}: ${dashboardErrorText(sum.reason)}`)
        if (tl.status === 'fulfilled') {
          for (const it of tl.value.data?.items || []) {
            data.activities.push({ ...it, projectId: p.projectId, projectCode: p.projectCode })
          }
        } else timelineErrors.push(`${p.projectCode}: ${dashboardErrorText(tl.reason)}`)
      })
    )
    if (summaryErrors.length) data.errors.summaries = summaryErrors.join(' | ')
    if (timelineErrors.length) data.errors.timeline = timelineErrors.join(' | ')
    return data
  },
}
