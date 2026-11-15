import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import {
  projectReportingService,
  metricLabels,
  type ReportingFilters,
  type Metric,
  type Summary,
  type ReportingGeometry
} from '../../../api/services/projectReportingService'
import { exportPeriod, exportError } from '../../../api/services/projectExportService'

const reasons: Record<string, string> = {
  EMPTY_DENOMINATOR: 'Chưa có mẫu số để tính tỷ lệ',
  PER_RUN_VALUES_IN_DRILLDOWN: 'Xem kết quả riêng của từng lần kiểm định',
  HUY02_REPAIR_FACTS_UNAVAILABLE: 'Chưa có nguồn dữ liệu nghiệm thu sửa chữa',
  REPAIR_OBLIGATION_INVENTORY_NOT_VERIFIED: 'Danh mục nghĩa vụ sửa chữa chưa được xác minh',
  DEFECT_SHARED_IDENTITY_OR_SCOPE_UNKNOWN: 'Chưa đủ dữ liệu đối chiếu danh tính hoặc phạm vi Defect',
  DEFECT_SEGMENT_RELATION_UNKNOWN: 'Chưa xác định quan hệ Defect với phân đoạn',
  VALIDATION_GEOMETRY_FILTER_UNSUPPORTED: 'Kiểm định chưa hỗ trợ lọc hình học',
  REPORTER_SPATIAL_SCOPE_UNAVAILABLE: 'Phản ánh chưa đủ dữ liệu lọc theo hình học',
  MAPPED_ANH01_AUDITS_ONLY: 'Lịch sử hiện chỉ gồm sự kiện đã được ánh xạ',
  HUY_TIMELINE_READER_UNAVAILABLE: 'Chưa có đầy đủ nguồn lịch sử',
  REPAIR_PROJECT_AUTHORITY_NOT_VERIFIED: 'Chưa xác minh quyền đọc dữ liệu sửa chữa'
}

export const reasonText = (codes: string[]) => codes.map(c => reasons[c] || `Nguồn chưa đầy đủ: ${c}`).join('; ')
export const availabilityText = (a: string) => a === 'AVAILABLE' ? 'Có dữ liệu' : a === 'PARTIAL' ? 'Dữ liệu một phần' : 'Chưa có dữ liệu'

export function metricValue(m: Metric) {
  if (m.availability === 'UNAVAILABLE' || m.value === null) return '—'
  return `${m.value.toLocaleString('vi-VN')} ${m.unit === 'count' ? '' : m.unit === 'percent' ? '%' : m.unit === 'bytes' ? 'byte' : m.unit}`.trim()
}

const statusLabels: Record<string, string> = {
  OPEN: 'Đang mở',
  UNASSIGNED: 'Chưa phân công',
  AWAITING_EVIDENCE: 'Chờ bằng chứng',
  CONCLUDED: 'Đã kết luận',
  LINKED: 'Đã liên kết Defect',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Đã từ chối',
  RESOLVED: 'Đã xử lý',
  NEW_ASSIGNED: 'Mới phân công',
  PLANNED: 'Lên kế hoạch',
  IN_FLIGHT: 'Đang bay',
  UPLOADED: 'Đã nạp dữ liệu',
  PROCESSING: 'AI đang xử lý',
  COMPLETED: 'Đã hoàn thành',
  FAILED: 'Thất bại',
  SURFACE: 'Mặt đường',
  LEFT_EDGE: 'Mép trái',
  RIGHT_EDGE: 'Mép phải'
}

export function metricDimensions(m: Metric) {
  const d = m.dimensions
  return [
    d.status && (m.code === 'segmentRelatedDefects' ? `Phân đoạn ${d.status}` : `Trạng thái ${statusLabels[d.status] || d.status}`),
    d.band && `Dải ${d.band === 'SURFACE' ? 'mặt đường' : d.band === 'LEFT_EDGE' ? 'mép trái' : d.band === 'RIGHT_EDGE' ? 'mép phải' : d.band}`,
    d.routeVersionId && `Tuyến ${d.routeVersionId}`,
    d.segmentSetId && `Bộ ${d.segmentSetId}`
  ].filter(Boolean).join(' · ') || 'Toàn phạm vi đã lọc'
}

type Snapshot<T> = { scope: string; value?: T; error?: string; loading: boolean }

export function useProjectReporting(project: string) {
  const epoch = useAuthStore(s => s.authEpoch), actor = useAuthStore(s => s.user?.id), role = useAuthStore(s => s.user?.role)
  const [filters, setFilters] = useState<ReportingFilters>({}), [metric, setMetric] = useState('reportsReceived'), [revision, setRevision] = useState(0)
  const base = `${epoch}:${actor}:${role}:${project}`, scope = `${base}:${JSON.stringify(filters)}:${revision}`
  const [summary, setSummary] = useState<Snapshot<Summary>>({ scope: '', loading: false }),
    [geometry, setGeometry] = useState<Snapshot<ReportingGeometry>>({ scope: '', loading: false }),
    [items, setItems] = useState<Snapshot<Awaited<ReturnType<typeof projectReportingService.items>>>>({ scope: '', loading: false }),
    [timeline, setTimeline] = useState<Snapshot<Awaited<ReturnType<typeof projectReportingService.timeline>>>>({ scope: '', loading: false })

  useEffect(() => { setFilters({}); setMetric('reportsReceived') }, [base])

  useEffect(() => {
    const c = new AbortController()
    setSummary({ scope, loading: project !== 'ALL' })
    setTimeline({ scope, loading: project !== 'ALL' })
    if (project !== 'ALL') {
      projectReportingService.summary(project, filters, c.signal).then(value => {
        if (!c.signal.aborted) setSummary({ scope, value, loading: false })
      }).catch(e => {
        if (!c.signal.aborted) setSummary({ scope, error: exportError(e), loading: false })
      })
      projectReportingService.timeline(project, filters, c.signal).then(value => {
        if (!c.signal.aborted) setTimeline({ scope, value, loading: false })
      }).catch(e => {
        if (!c.signal.aborted) setTimeline({ scope, error: exportError(e), loading: false })
      })
    }
    return () => c.abort()
  }, [scope])

  useEffect(() => {
    const c = new AbortController()
    setGeometry({ scope: base, loading: project !== 'ALL' })
    if (project !== 'ALL') {
      projectReportingService.geometry(project, c.signal).then(value => {
        if (!c.signal.aborted) setGeometry({ scope: base, value, loading: false })
      }).catch(e => {
        if (!c.signal.aborted) setGeometry({ scope: base, error: exportError(e), loading: false })
      })
    }
    return () => c.abort()
  }, [base, revision])

  useEffect(() => {
    const c = new AbortController(), key = `${scope}:${metric}`
    setItems({ scope: key, loading: project !== 'ALL' })
    if (project !== 'ALL') {
      projectReportingService.items(project, metric, filters, c.signal).then(value => {
        if (!c.signal.aborted) setItems({ scope: key, value, loading: false })
      }).catch(e => {
        if (!c.signal.aborted) setItems({ scope: key, error: exportError(e), loading: false })
      })
    }
    return () => c.abort()
  }, [scope, metric])

  return {
    filters,
    setFilters,
    metric,
    setMetric,
    refresh: () => setRevision(n => n + 1),
    summary: summary.scope === scope ? summary : { scope, loading: project !== 'ALL' },
    geometry: geometry.scope === base ? geometry : { scope: base, loading: project !== 'ALL' },
    items: items.scope === `${scope}:${metric}` ? items : { scope, loading: project !== 'ALL' },
    timeline: timeline.scope === scope ? timeline : { scope, loading: project !== 'ALL' }
  }
}

export function ReportingMetricsPanel({ project, data }: { project: string; data: ReturnType<typeof useProjectReporting> }) {
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [route, setRoute] = useState(''), [set, setSet] = useState(''), [segment, setSegment] = useState(''), [error, setError] = useState('')
  useEffect(() => { setFrom(''); setTo(''); setRoute(''); setSet(''); setSegment(''); setError('') }, [project])

  const geometry = data.geometry.value
  const segments = geometry?.segments.filter(s => (!route || s.routeVersionId === route) && (!set || s.segmentSetId === set)) || []

  const apply = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      data.setFilters({
        ...exportPeriod(from, to),
        ...(route ? { routeVersionId: route } : {}),
        ...(set ? { segmentSetId: set } : {}),
        ...(segment ? { segmentIds: [segment] } : {})
      })
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const state = (s: { loading: boolean; error?: string }, empty: string) =>
    s.error ? (
      <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
        {s.error}
      </div>
    ) : s.loading ? (
      <div role="status" className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] animate-spin text-[#C9A227]">sync</span>
        <span>Đang tải {empty}…</span>
      </div>
    ) : null

  return (
    <section className="space-y-5 text-xs">
      {/* Form bộ lọc phạm vi báo cáo */}
      <form onSubmit={apply} className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
            <h2 className="font-sansation font-bold text-sm text-slate-900 uppercase tracking-wide">
              Bộ lọc phạm vi dữ liệu báo cáo &amp; KPI
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            API-168 · API-169 · API-170
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5 font-semibold text-slate-700">
            <span>Từ ngày giờ (giờ trình duyệt)</span>
            <input
              aria-label="Báo cáo từ"
              type="datetime-local"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 transition"
            />
          </label>

          <label className="flex flex-col gap-1.5 font-semibold text-slate-700">
            <span>Đến ngày giờ (không gồm thời điểm này)</span>
            <input
              aria-label="Báo cáo đến"
              type="datetime-local"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 transition"
            />
          </label>

          <label className="flex flex-col gap-1.5 font-semibold text-slate-700">
            <span>Tuyến đường</span>
            <div className="relative">
              <select
                aria-label="Lọc báo cáo theo tuyến"
                value={route}
                onChange={e => { setRoute(e.target.value); setSet(''); setSegment('') }}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-2.5 pr-8 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 appearance-none cursor-pointer transition"
              >
                <option value="">Tất cả tuyến được cấp</option>
                {geometry?.routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1.5 font-semibold text-slate-700">
            <span>Bộ phân đoạn PUBLISHED</span>
            <div className="relative">
              <select
                aria-label="Lọc báo cáo theo bộ"
                value={set}
                disabled={!route}
                onChange={e => { setSet(e.target.value); setSegment('') }}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-2.5 pr-8 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 appearance-none cursor-pointer disabled:opacity-50 transition"
              >
                <option value="">Tất cả bộ của tuyến</option>
                {[...new Set((geometry?.segments || []).filter(s => s.routeVersionId === route).map(s => s.segmentSetId))].map(id => (
                  <option key={id} value={id}>
                    Bộ đã công bố {((geometry?.segments || []).filter(s => s.routeVersionId === route).map(s => s.segmentSetId).filter((v, i, a) => a.indexOf(v) === i).indexOf(id)) + 1}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1.5 font-semibold text-slate-700">
            <span>Phân đoạn cụ thể</span>
            <div className="relative">
              <select
                aria-label="Lọc báo cáo theo đoạn"
                disabled={!set}
                value={segment}
                onChange={e => setSegment(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-2.5 pr-8 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 appearance-none cursor-pointer disabled:opacity-50 transition"
              >
                <option value="">Tất cả đoạn của bộ</option>
                {segments.map(s => (
                  <option key={s.id} value={s.id}>{s.name} · {s.from}–{s.to} m</option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </label>

          <div className="flex items-end gap-2 pt-1 sm:pt-0">
            <button
              disabled={project === 'ALL'}
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-xl font-semibold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
              <span>Áp dụng phạm vi báo cáo</span>
            </button>
            <button
              type="button"
              onClick={data.refresh}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition cursor-pointer"
              title="Đọc lại dữ liệu KPI"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Đọc lại</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1 pt-1 border-t border-slate-100">
          <p className="md:col-span-3">
            Chọn khoảng thời gian hoặc để trống cả hai mốc. Phạm vi này lọc báo cáo, không thay đổi yêu cầu xuất hồ sơ.
          </p>
          {error && <p role="alert" className="text-rose-700 font-semibold">{error}</p>}
        </div>
      </form>

      {project === 'ALL' ? (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-[20px] p-6 text-center text-amber-900 font-medium space-y-1">
          <span className="material-symbols-outlined text-3xl text-[#C9A227]">folder_supervised</span>
          <p>Chọn một dự án để đọc KPI và phân đoạn thật.</p>
        </div>
      ) : (
        <>
          {/* Grid thẻ KPI chính tổng hợp theo chuẩn nghiệp vụ */}
          {state(data.summary, 'chỉ số')}
          {(() => {
            const rawMetrics = data.summary.value?.metrics || []

            // Nhãn tiêu đề chính cho từng loại mã chỉ số
            const getCardTitle = (code: string) => {
              switch (code) {
                case 'surveyTasksByStatus': return 'NHIỆM VỤ KHẢO SÁT THEO TRẠNG THÁI'
                case 'baselineCoverageByBand': return 'ĐỘ PHỦ BASELINE THEO DẢI'
                case 'reportsReceived': return 'PHẢN ÁNH TIẾP NHẬN'
                case 'casesByStatus': return 'CASE THEO TRẠNG THÁI'
                case 'defectsByStatus': return 'DEFECT THEO TRẠNG THÁI'
                case 'verifiedSourceBytes': return 'DUNG LƯỢNG NGUỒN XÁC MINH'
                case 'repairItemsByStatus': return 'HẠNG MỤC SỬA CHỮA'
                case 'repairAcceptanceRate': return 'TỶ LỆ NGHIỆM THU'
                default: return (metricLabels[code] || code).toUpperCase()
              }
            }

            // Subtitle kích thước / trạng thái hiển thị dưới tiêu đề
            const getCardSubtitle = (m: Metric) => {
              if (m.dimensions.band) {
                return m.dimensions.band === 'SURFACE' ? 'Mặt đường' : m.dimensions.band === 'LEFT_EDGE' ? 'Mép trái' : m.dimensions.band === 'RIGHT_EDGE' ? 'Mép phải' : m.dimensions.band
              }
              if (m.dimensions.status) {
                return statusLabels[m.dimensions.status] || m.dimensions.status
              }
              return null
            }

            // Danh sách metrics hiển thị trên Grid
            let displayMetrics: Metric[] = rawMetrics.filter(m =>
              ['surveyTasksByStatus', 'baselineCoverageByBand', 'reportsReceived', 'casesByStatus', 'defectsByStatus'].includes(m.code)
            )

            // Nếu DB rỗng hoặc chưa có metric nào, hiển thị 7 thẻ mặc định chuẩn ban đầu như Ảnh 1
            if (displayMetrics.length === 0) {
              displayMetrics = [
                { code: 'surveyTasksByStatus', dimensions: {}, value: 0, unit: 'count', numerator: null, denominator: null, periodApplicable: false, availability: 'AVAILABLE', reasonCodes: [], sourceRefs: [] },
                { code: 'baselineCoverageByBand', dimensions: { band: 'SURFACE' }, value: 0, unit: 'percent', numerator: null, denominator: null, periodApplicable: false, availability: 'AVAILABLE', reasonCodes: [], sourceRefs: [] },
                { code: 'baselineCoverageByBand', dimensions: { band: 'LEFT_EDGE' }, value: 0, unit: 'percent', numerator: null, denominator: null, periodApplicable: false, availability: 'AVAILABLE', reasonCodes: [], sourceRefs: [] },
                { code: 'baselineCoverageByBand', dimensions: { band: 'RIGHT_EDGE' }, value: 0, unit: 'percent', numerator: null, denominator: null, periodApplicable: false, availability: 'AVAILABLE', reasonCodes: [], sourceRefs: [] },
                { code: 'reportsReceived', dimensions: {}, value: 0, unit: 'count', numerator: null, denominator: null, periodApplicable: true, availability: 'AVAILABLE', reasonCodes: [], sourceRefs: [] },
                { code: 'casesByStatus', dimensions: {}, value: 0, unit: 'count', numerator: null, denominator: null, periodApplicable: false, availability: 'AVAILABLE', reasonCodes: [], sourceRefs: [] },
                { code: 'defectsByStatus', dimensions: {}, value: 0, unit: 'count', numerator: null, denominator: null, periodApplicable: false, availability: 'AVAILABLE', reasonCodes: [], sourceRefs: [] }
              ]
            }

            return (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {displayMetrics.map((m, idx) => {
                  const title = getCardTitle(m.code)
                  const subtitle = getCardSubtitle(m)
                  const isAvailable = m.availability === 'AVAILABLE'
                  const isPartial = m.availability === 'PARTIAL'

                  return (
                    <article
                      key={`${m.code}-${idx}-${m.dimensions.status || ''}-${m.dimensions.band || ''}`}
                      className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] via-[#C9A227] to-amber-200" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              {title}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPartial
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {availabilityText(m.availability)}
                          </span>
                        </div>

                        {subtitle && (
                          <p className="text-xs text-slate-500 font-semibold">
                            {subtitle}
                          </p>
                        )}

                        <div className="pt-1">
                          <p className="font-sansation text-3xl font-bold tracking-tight text-slate-900">
                            {metricValue(m)}
                          </p>
                        </div>

                        {isPartial && (
                          <p className="text-xs text-amber-800 font-medium">Dữ liệu một phần</p>
                        )}
                        {m.reasonCodes.length > 0 && (
                          <p className="text-xs text-amber-800 font-medium">{reasonText(m.reasonCodes)}</p>
                        )}
                      </div>

                      <details className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                        <summary className="cursor-pointer font-medium hover:text-[#C9A227] transition select-none flex items-center gap-1">
                          <span className="text-[10px]">▶</span>
                          <span>Nguồn và phạm vi</span>
                        </summary>
                        <div className="mt-2 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-[11px]">
                          <p className="text-slate-700">
                            {m.periodApplicable ? 'Trong kỳ đã chọn' : 'Hiện trạng tại thời điểm đọc'}
                          </p>
                          {m.numerator != null && m.denominator != null && (
                            <p className="text-slate-700 font-medium">
                              Số đo phân đoạn: {m.numerator}/{m.denominator} đoạn
                            </p>
                          )}
                          {m.reasonCodes.length > 0 && (
                            <p className="text-amber-800">{reasonText(m.reasonCodes)}</p>
                          )}
                          <p className="text-slate-400 font-mono text-[10px]">
                            {m.sourceRefs.length} tham chiếu nguồn
                          </p>
                        </div>
                      </details>
                    </article>
                  )
                })}
              </div>
            )
          })()}

          {/* Khối xem chi tiết chỉ số và timeline */}
          <details className="bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs space-y-4">
            <summary className="font-sansation font-bold text-sm text-slate-900 cursor-pointer hover:text-[#C9A227] transition select-none flex items-center justify-between">
              <span>Xem thêm chỉ số và nguồn dữ liệu</span>
              <span className="text-xs font-normal text-slate-500">Mở rộng bảng số đo &amp; lịch sử kiểm định</span>
            </summary>

            <div className="space-y-5 pt-3">
              {/* Toàn bộ chỉ số */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 overflow-x-auto space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-slate-900">Toàn bộ chỉ số</h3>
                  {data.summary.value && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      Đọc lúc {data.summary.value.readAt} · Định nghĩa {data.summary.value.definitionVersion}
                    </span>
                  )}
                </div>
                {state(data.summary, 'chỉ số')}
                {data.summary.value && (
                  <>
                    {data.summary.value.warnings.length > 0 && (
                      <p className="text-xs text-amber-800 font-medium">{reasonText(data.summary.value.warnings)}</p>
                    )}
                    {!data.summary.value.metrics.length ? (
                      <p className="text-slate-500 py-3">Không có chỉ số trong dữ liệu máy chủ.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Chỉ số / phạm vi</th>
                            <th className="p-2.5">Giá trị / đơn vị</th>
                            <th className="p-2.5">Tình trạng nguồn</th>
                            <th className="p-2.5">Kỳ / nguồn</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.summary.value.metrics.map((m, i) => (
                            <tr key={i} className="hover:bg-slate-50/80 transition">
                              <td className="p-2.5 font-medium text-slate-800">
                                {metricLabels[m.code] || m.code}
                                <small className="block text-slate-500 font-normal">{metricDimensions(m)}</small>
                              </td>
                              <td className="p-2.5 font-bold font-sansation text-slate-900">
                                {metricValue(m)}
                                {m.numerator != null && m.denominator != null && (
                                  <small className="block text-slate-500 font-normal font-sans">{m.numerator}/{m.denominator} theo nguồn</small>
                                )}
                              </td>
                              <td className="p-2.5">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  m.availability === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {availabilityText(m.availability)}
                                </span>
                                {m.reasonCodes.length > 0 && (
                                  <small className="block text-amber-800 font-medium mt-0.5">{reasonText(m.reasonCodes)}</small>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-600">
                                <span>{m.periodApplicable ? 'Có áp dụng khoảng thời gian' : 'Hiện trạng, không áp dụng kỳ'}</span>
                                <span className="block text-[11px] text-slate-400 font-mono">· {m.sourceRefs.length} tham chiếu</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>

              {/* Chi tiết chỉ số */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 overflow-x-auto space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
                  <label className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>Chi tiết chỉ số</span>
                    <select
                      aria-label="Metric chi tiết"
                      value={data.metric}
                      onChange={e => data.setMetric(e.target.value)}
                      className="border border-slate-200 bg-slate-50 p-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      {Object.entries(metricLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </label>
                  {data.items.value && (
                    <span className="text-[11px] text-slate-500">
                      {availabilityText(data.items.value.availability.availability)}
                      {data.items.value.availability.reasonCodes.length > 0 && ` · ${reasonText(data.items.value.availability.reasonCodes)}`}
                    </span>
                  )}
                </div>

                {state(data.items, 'chi tiết')}
                {data.items.value && (
                  <>
                    {!data.items.value.items.length ? (
                      <p className="text-slate-500 py-3">Chưa có bản ghi chi tiết trong phạm vi này; không suy thành số đo 0.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Nguồn / mã tham chiếu</th>
                            <th className="p-2.5">Trạng thái</th>
                            <th className="p-2.5">Số đo từ nguồn</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.items.value.items.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition">
                              <td className="break-all p-2.5 font-medium text-slate-800">
                                <span>{r.type}</span>
                                <details className="mt-0.5">
                                  <summary className="cursor-pointer text-slate-500 hover:text-[#C9A227]">Tham chiếu</summary>
                                  <span className="font-mono text-[10px] text-slate-600">{r.id}</span>
                                </details>
                                <small className="block text-slate-500">{r.band || ''}</small>
                              </td>
                              <td className="p-2.5">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                                  {r.status || 'Chưa có trạng thái'}
                                </span>
                                <details className="mt-0.5">
                                  <summary className="cursor-pointer text-slate-500 hover:text-[#C9A227]">Phiên bản nguồn</summary>
                                  <span className="font-mono text-[10px] text-slate-600">{r.version}</span>
                                </details>
                              </td>
                              <td className="p-2.5 text-slate-700 font-medium">
                                {r.sizeBytes != null ? (
                                  <span>{r.sizeBytes.toLocaleString('vi-VN')} byte</span>
                                ) : r.measurementType ? (
                                  <span>
                                    {r.measurementType} · {r.unit || 'Chưa có đơn vị'} · Bias {r.bias ?? '—'} · MAE {r.mae ?? '—'} · RMSE {r.rmse ?? '—'} · Dùng {r.used ?? '—'} · Loại {r.excluded ?? '—'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Chưa có số đo trong bản ghi</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>

              {/* Lịch sử nguồn báo cáo */}
              <details className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <summary className="font-bold text-xs text-slate-900 cursor-pointer hover:text-[#C9A227] transition select-none">
                  Lịch sử nguồn báo cáo
                </summary>
                {state(data.timeline, 'lịch sử')}
                {data.timeline.value && (
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] text-slate-500">
                      {availabilityText(data.timeline.value.availability.availability)} · {reasonText(data.timeline.value.availability.reasonCodes)}
                    </p>
                    {data.timeline.value.geometryFiltered && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Lịch sử là toàn dự án trong kỳ; không lọc theo tuyến/bộ/đoạn.
                      </p>
                    )}
                    {data.timeline.value.items.length ? (
                      <div className="divide-y divide-slate-200/70">
                        {data.timeline.value.items.map(r => (
                          <div key={r.eventId} className="py-2.5 text-xs text-slate-800 flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-slate-500">{r.occurredAt}</span>
                              <span className="font-semibold text-slate-900">· {r.actorDisplay || 'Chưa có tên người thực hiện'}</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold">
                                {r.action}
                              </span>
                            </div>
                            <span className="text-slate-600 pl-2">
                              {r.summary || 'Chưa có mô tả'} · <span className="font-mono text-[11px]">{r.source.type}: {r.source.id}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 py-2">Chưa có sự kiện từ nguồn lịch sử được hỗ trợ trong kỳ.</p>
                    )}
                  </div>
                )}
              </details>
            </div>
          </details>
        </>
      )}
    </section>
  )
}
