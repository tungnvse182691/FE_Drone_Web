import { apiClient } from '../client'
import type { Metric, ReportItem, ReportingFilters, TimelineItem } from './projectReportingService'
import type { StatsMeasurement, StatsScope, StatsSegment, StatsSource } from './defectStatisticsService'

interface ReportProject { projectId: string; projectCode: string; name: string }
interface ReportPage<T> {
  schemaVersion: string
  readAt: string
  items: T[]
  nextCursor?: string | null
  availability: Pick<Metric, 'availability' | 'reasonCodes'>
}
type Provenance = 'REAL_SOURCE' | 'TEST_ONLY'
type QuantityPin = { measurementId: string; sourceVersion: string; segmentId: string | null }
export interface StatisticsSource extends StatsSource {
  roadSectionId: string; locationVersion: string
  from: number; to: number; offsetFrom: number; offsetTo: number
  segmentIdsJson: string; quantitiesJson: string
}
interface StatisticsRead {
  scopes: (StatsScope & { locationVersion: string })[]
  segments: StatsSegment[]
  measurements: StatsMeasurement[]
  history: StatisticsSource[]
  version: string
  statistics: {
    projectId: string; projectDistinctDefects: number; matchedDistinctDefects: number
    sharedParts: number; unmappedDefects: number; missingReasons: string[]
    segments: { segmentId: string; relatedDefects: number | null; knownRelatedDefects: number; availability: string }[]
    quantities: (QuantityPin & Pick<StatsMeasurement, 'type' | 'value' | 'unit' | 'valueState'> & { sharedPartId: string; provenance: Provenance; reason?: string })[]
  }
}
export interface StatisticsConfirmation {
  obligationId: string; scopeHash: string; defectVersion: string; sharedPartId: string
  segmentIds: string[]; quantities: QuantityPin[]; provenance: Provenance; reason: string; supersedesId?: string
}

function checkPage<T>(page: ReportPage<T>, cursor?: string) {
  if (page?.schemaVersion !== 'anh02.reporting.v1' || !Number.isFinite(Date.parse(page.readAt)) ||
      !Array.isArray(page.items) || !Array.isArray(page.availability?.reasonCodes) ||
      !['AVAILABLE', 'PARTIAL', 'UNAVAILABLE'].includes(page.availability.availability) ||
      (page.nextCursor != null && (typeof page.nextCursor !== 'string' || !page.nextCursor || page.nextCursor === cursor))) {
    throw new Error('Phản hồi phân trang báo cáo thiếu thông tin hoặc không hợp lệ.')
  }
  return page
}

export const reportingMenuService = {
  async projects(signal: AbortSignal) {
    const rows: ReportProject[] = [], cursors = new Set<string>(), ids = new Set<string>()
    let cursor: string | undefined
    do {
      const { data } = await apiClient.get<{ items: ReportProject[]; nextCursor?: string | null }>('/projects', { params: { limit: 50, cursor }, signal })
      if (!Array.isArray(data?.items) || (data.nextCursor != null && typeof data.nextCursor !== 'string')) throw new Error('Danh sách dự án sai cấu trúc.')
      for (const row of data.items) {
        if (!row.projectId || !row.name || ids.has(row.projectId)) throw new Error('Danh sách dự án thiếu hoặc trùng tham chiếu.')
        ids.add(row.projectId)
        rows.push(row)
      }
      cursor = data.nextCursor || undefined
      if (cursor && cursors.has(cursor)) throw new Error('Máy chủ trả lặp trang dự án.')
      if (cursor) cursors.add(cursor)
    } while (cursor)
    return rows
  },
  async items(projectId: string, metric: string, filters: ReportingFilters, cursor: string | undefined, signal: AbortSignal) {
    const { data } = await apiClient.get<ReportPage<ReportItem> & { metric: string }>(`/projects/${projectId}/reports/items`,
      { params: { ...filters, metric, cursor, pageSize: 25 }, paramsSerializer: { indexes: null }, signal })
    const result = checkPage(data, cursor)
    if (data.metric !== metric || result.items.some(item => item.metric !== metric || !item.id || !item.type || !item.version)) {
      throw new Error('Chi tiết không khớp chỉ số hoặc thiếu tham chiếu nguồn.')
    }
    return result
  },
  async timeline(projectId: string, period: Pick<ReportingFilters, 'from' | 'to'>, cursor: string | undefined, signal: AbortSignal) {
    const { data } = await apiClient.get<ReportPage<TimelineItem>>(`/projects/${projectId}/reports/timeline`,
      { params: { ...period, aggregateType: 'Project', aggregateId: projectId, cursor, pageSize: 25 }, signal })
    const result = checkPage(data, cursor)
    if (result.items.some(item => !item.eventId || !item.source?.id || !item.source.version || !item.occurredAt)) throw new Error('Sự kiện thiếu thông tin nguồn.')
    return result
  },
  async statistics(projectId: string, filters: Omit<ReportingFilters, 'from' | 'to'>, signal: AbortSignal) {
    const { data, headers } = await apiClient.get<StatisticsRead>(`/projects/${projectId}/defect-statistics`,
      { params: filters, paramsSerializer: { indexes: null }, signal })
    if (data?.statistics?.projectId !== projectId || !/^[a-f0-9]{64}$/.test(data.version) || headers.etag !== `"${data.version}"` ||
        ![data.scopes, data.segments, data.measurements, data.history, data.statistics.segments, data.statistics.quantities,
          data.statistics.missingReasons].every(Array.isArray)) throw new Error('Thống kê thiếu dữ liệu, ETag hoặc không khớp dự án.')
    return data
  },
  async confirmStatistics(projectId: string, body: StatisticsConfirmation, version: string, key: string) {
    await apiClient.post(`/projects/${projectId}/defect-statistics`, body, {
      headers: { 'Idempotency-Key': key, 'If-Match': `"${version}"` },
    })
  },
}
