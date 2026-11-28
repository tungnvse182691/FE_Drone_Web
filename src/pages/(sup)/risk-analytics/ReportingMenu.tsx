import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectReportingService, type Metric, type ReportingFilters, type ReportingGeometry } from '../../../api/services/projectReportingService'
import { reportingMenuService } from '../../../api/services/reportingMenuService'
import { exportPeriod } from '../../../api/services/projectExportService'
import { aiApiErrorText } from '../../../api/services/aiRunDetailService'
import { Empty, Feedback, Loading, PanelButton, PanelShell, Pill } from '../../../components/ui/PanelKit'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { StatisticsMenuPanel } from './StatisticsMenuPanel'
import { DossierMenuPanel } from './DossierMenuPanel'
import { ReportingGeometryMap } from './ReportingGeometryMap'
import { availabilityLabel, availabilityTone, dateLabel, explainReasons, label, matchedDefectsLabel, numberLabel, unitLabel } from './reportMenuLabels'

const card = '!p-5 !rounded-[20px]'
const listClass = 'divide-y divide-slate-100 rounded-xl border border-slate-200 bg-[#F8F9FA]'
const auditOnly = new Set(['validationMetrics'])
const overviewCodes = ['reportsReceived', 'projectDistinctDefects', 'matchedDistinctDefects']
const caseCodes = ['casesByStatus', 'defectsByStatus', 'repairItemsByStatus', 'repairAcceptanceRate']
const surveyCodes = ['surveyTasksByStatus', 'legacyUnclassified', 'baselineCoverageByBand', 'verifiedSourceBytes']
const reportTabs = { sources: 'Nguồn & lịch sử', export: 'Xuất hồ sơ' } as const
const headerClass = 'flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4'

function Availability({ value }: { value: Pick<Metric, 'availability' | 'reasonCodes'> }) {
  return <div className="flex flex-wrap items-center gap-2 text-xs">
    <Pill tone={availabilityTone(value.availability)}>{availabilityLabel(value.availability)}</Pill>
    {!!value.reasonCodes.length && <span className="text-amber-800">{explainReasons(value.reasonCodes)}</span>}
  </div>
}

function SourceReference({ source }: { source: { type: string; id: string; version: string } }) {
  return <details className="text-xs text-slate-600">
    <summary className="cursor-pointer">{label(source.type)}</summary>
    <p className="break-all pl-3">Mã {source.id} · Phiên bản {source.version}</p>
  </details>
}

function MetricEntry({ metric, title, geometry, hasPeriod, compact = false }: {
  metric: Metric; title: string; geometry?: ReportingGeometry; hasPeriod: boolean; compact?: boolean
}) {
  const { dimensions: d } = metric
  const dimensions = [
    d.status && label(d.status),
    d.band && label(d.band),
    d.routeVersionId && (geometry?.routes.find(row => row.id === d.routeVersionId)?.name || 'Tuyến đường'),
    d.segmentSetId && 'Bộ phân đoạn',
  ].filter(Boolean).join(' · ')

  return <div className={compact
    ? 'min-w-0 rounded-xl border border-brand-border bg-brand-surfaceAlt px-3 py-2.5'
    : 'min-w-0 px-3 py-2.5'}>
    <div className={compact ? 'space-y-1' : 'flex flex-wrap items-start justify-between gap-x-3 gap-y-1'}>
      <div className={compact ? '' : 'min-w-0 flex-[1_1_8rem]'}>
        <p className="text-xs font-semibold text-brand-navy">{title}</p>
        {dimensions && <p className="break-words text-xs text-slate-600">{dimensions}</p>}
      </div>
      <p className={metric.value == null ? 'text-xs font-medium text-slate-600' : compact
        ? 'font-sansation text-xl font-bold tabular-nums text-brand-dark'
        : 'text-sm font-bold tabular-nums text-brand-dark'}>
        {numberLabel(metric.value)}{metric.value != null && unitLabel(metric.unit) && ` ${unitLabel(metric.unit)}`}
      </p>
    </div>
    <div className="mt-1"><Availability value={metric} /></div>
    <p className="mt-1 text-[11px] text-slate-600">{metric.periodApplicable
      ? (hasPeriod ? 'Theo kỳ đã chọn' : 'Theo thời gian thuộc phạm vi báo cáo')
      : 'Hiện trạng tại thời điểm đọc'}</p>
    {(d.routeVersionId || d.segmentSetId ||
      metric.numerator != null || metric.denominator != null || !!metric.sourceRefs.length) &&
      <details className="mt-1 text-[11px] text-slate-600">
        <summary className="cursor-pointer">Phạm vi và nguồn chỉ số{metric.sourceRefs.length ? ` (${metric.sourceRefs.length})` : ''}</summary>
        <div className="max-h-48 space-y-1 overflow-auto break-all pt-1">
          {d.routeVersionId && <p>Phiên bản tuyến {d.routeVersionId}</p>}
          {d.segmentSetId && <p>Mã bộ phân đoạn {d.segmentSetId}</p>}
          {(metric.numerator != null || metric.denominator != null) && <p>Tử số {numberLabel(metric.numerator)} · Mẫu số {numberLabel(metric.denominator)}</p>}
          {metric.sourceRefs.map((ref, index) =>
            <SourceReference key={`${ref.type}:${ref.id}:${ref.version}:${index}`} source={ref} />)}
        </div>
      </details>}
  </div>
}

function ReportPages<T>({ title, children, queryKey, load }: {
  title: string; children: (row: T) => ReactNode; queryKey: readonly unknown[]
  load: (cursor: string | undefined, signal: AbortSignal) => Promise<{
    items: T[]; readAt: string; nextCursor?: string | null; availability: Pick<Metric, 'availability' | 'reasonCodes'>
  }>
}) {
  const [cursors, setCursors] = useState<string[]>([])
  const current = cursors.at(-1)
  const query = useQuery({ queryKey: [...queryKey, current], queryFn: ({ signal }) => load(current, signal), retry: false })
  const next = query.data?.nextCursor
  const repeated = !!next && cursors.includes(next)
  return <PanelShell icon="list_alt" title={title} className={card}>
    {query.isLoading && <Loading>Đang tải dữ liệu…</Loading>}
    {query.error && <Feedback error={aiApiErrorText(query.error, 'Không đọc được dữ liệu')} />}
    {query.isSuccess && <>
      <Availability value={query.data.availability} />
      <p className="text-xs text-slate-500">Thời điểm đọc trang {dateLabel(query.data.readAt)}</p>
      {query.data.items.length ? <ul className={listClass}>{query.data.items.map(children)}</ul> : <Empty>Chưa có bản ghi trong phạm vi đã chọn.</Empty>}
    </>}
    {repeated && <Feedback error="Máy chủ trả lặp trang dữ liệu." />}
    {(current || next) && <div className="flex flex-wrap items-center gap-2">
      <PanelButton disabled={!current || query.isFetching} onClick={() => setCursors(rows => rows.slice(0, -1))}>Trang trước</PanelButton>
      <span className="text-xs text-slate-600">Trang {cursors.length + 1}</span>
      <PanelButton disabled={!next || repeated || query.isFetching} onClick={() => { if (next) setCursors(rows => [...rows, next]) }}>Trang sau</PanelButton>
    </div>}
  </PanelShell>
}

function ReportFilter({ geometry, geometryError, onApply }: {
  geometry?: ReportingGeometry; geometryError?: string; onApply: (filters: ReportingFilters) => void
}) {
  const [from, setFrom] = useState(''), [to, setTo] = useState('')
  const [route, setRoute] = useState(''), [set, setSet] = useState(''), [segment, setSegment] = useState('')
  const [error, setError] = useState('')
  const sets = [...new Set(geometry?.segments.filter(s => s.routeVersionId === route).map(s => s.segmentSetId))]
  const submit = (event: FormEvent) => {
    event.preventDefault()
    try {
      onApply({ ...exportPeriod(from, to), ...(route && { routeVersionId: route }),
        ...(set && { segmentSetId: set }), ...(segment && { segmentIds: [segment] }) })
      setError('')
    } catch (err) { setError(aiApiErrorText(err)) }
  }
  return <form onSubmit={submit} className="space-y-2 rounded-xl border border-brand-border bg-white p-3 shadow-2xs" aria-label="Phạm vi báo cáo">
    <div className="grid grid-cols-1 items-end gap-2.5 text-xs sm:flex sm:flex-wrap">
      <span aria-hidden="true" className="material-symbols-outlined mb-2 hidden text-base text-brand-navy sm:inline">tune</span>
      <label className="grid min-w-0 gap-1">Từ thời điểm<input className="rg-field min-w-0" type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} /></label>
      <label className="grid min-w-0 gap-1">Đến trước thời điểm<input className="rg-field min-w-0" type="datetime-local" value={to} onChange={e => setTo(e.target.value)} /></label>
      {!!geometry?.routes.length && <label className="grid min-w-0 gap-1 sm:max-w-48">Tuyến đường
        <select className="rg-field w-full truncate" value={route} onChange={e => { setRoute(e.target.value); setSet(''); setSegment('') }}>
          <option value="">Tất cả tuyến</option>
          {geometry.routes.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
      </label>}
      {!!sets.length && <label className="grid min-w-0 gap-1 sm:max-w-48">Bộ phân đoạn đã công bố
        <select className="rg-field w-full truncate" value={set} onChange={e => { setSet(e.target.value); setSegment('') }}>
          <option value="">Tất cả bộ phân đoạn</option>
          {sets.map((id, i) => <option key={id} value={id}>Bộ phân đoạn {i + 1}</option>)}
        </select>
      </label>}
      {set && <label className="grid min-w-0 gap-1 sm:max-w-48">Phân đoạn
        <select className="rg-field w-full truncate" value={segment} onChange={e => setSegment(e.target.value)}>
          <option value="">Tất cả phân đoạn trong bộ</option>
          {geometry?.segments.filter(row => row.segmentSetId === set).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
      </label>}
      <PanelButton type="submit" variant="primary" className="justify-self-start">Áp dụng bộ lọc</PanelButton>
    </div>
    <p className="text-xs text-slate-500">Giờ theo múi giờ trình duyệt. Khoảng thời gian áp dụng cho chỉ số theo kỳ và lịch sử dự án.</p>
    <Feedback error={error || geometryError} />
  </form>
}

function ProjectReport({ projectId, projectName, isPM, epoch, pageHeading }: {
  projectId: string; projectName: string; isPM: boolean; epoch: number; pageHeading: ReactNode
}) {
  const [filters, setFilters] = useState<ReportingFilters>({})
  const [metric, setMetric] = useState('')
  const [showTimeline, setShowTimeline] = useState(false)
  const [tab, setTab] = useState<keyof typeof reportTabs>('sources')
  const tabsId = useId()
  const { from, to, ...spatial } = filters
  const key = ['report-menu', epoch, projectId]
  const summary = useQuery({ queryKey: [...key, 'summary', filters], queryFn: ({ signal }) => projectReportingService.summary(projectId, filters, signal), retry: false })
  const geometry = useQuery({ queryKey: [...key, 'geometry'], queryFn: ({ signal }) => projectReportingService.geometry(projectId, signal), retry: false })
  const segmentName = (id: string) => geometry.data?.segments.find(row => row.id === id)?.name || `Phân đoạn #${id.slice(0, 8)}`
  const metrics = summary.isSuccess ? summary.data.metrics.filter(row => !auditOnly.has(row.code)) : []
  const metricCodes = [...new Set(metrics.map(row => row.code))].filter(code => code !== 'explicitSharedParts' && code !== 'segmentRelatedDefects')
  const selectedMetric = metricCodes.includes(metric) ? metric : ''
  const mainMetrics = overviewCodes.flatMap(code => metrics.filter(row => row.code === code))
  const spatialScope = !!(spatial.routeVersionId || spatial.segmentSetId || spatial.segmentIds?.length)
  const metricTitle = (code: string) => code === 'matchedDistinctDefects' ? matchedDefectsLabel(spatialScope) : label(code)
  const renderMetrics = (rows: Metric[], compact = false) => rows.map((row, i) =>
    <MetricEntry key={`${row.code}:${i}`} metric={row} title={metricTitle(row.code)} geometry={geometry.data} hasPeriod={!!from} compact={compact} />)

  return <>
    <header className={headerClass}>
      {pageHeading}
      <PanelButton disabled={summary.isFetching} onClick={() => { void summary.refetch() }}>
        <span aria-hidden="true" className="material-symbols-outlined text-base">refresh</span>
        Tải lại tổng hợp
      </PanelButton>
    </header>
    <ReportFilter geometry={geometry.data} geometryError={geometry.error ? aiApiErrorText(geometry.error, 'Không đọc được danh mục tuyến và phân đoạn') : undefined} onApply={setFilters} />
    <PanelShell icon="analytics" title="Tổng quan dự án" className={card}>
      {summary.isLoading && <Loading>Đang tải chỉ số…</Loading>}
      {summary.error && <Feedback error={aiApiErrorText(summary.error, 'Không tải được báo cáo')} />}
      {summary.isSuccess && <>
        <p className="text-xs text-slate-500">Thời điểm đọc {dateLabel(summary.data.readAt)}</p>
        {!!summary.data.warnings.length && <p className="text-xs text-amber-800">{explainReasons(summary.data.warnings)}</p>}
        {!metrics.length && <Empty>Backend chưa trả chỉ số trong phạm vi này.</Empty>}
        {!!mainMetrics.length && <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">{renderMetrics(mainMetrics, true)}</div>}
      </>}
    </PanelShell>
    {summary.isSuccess && !!metrics.length && <div className="grid items-start gap-4 lg:grid-cols-2">
      {([
        { title: 'Trạng thái hồ sơ', icon: 'assignment', codes: caseCodes },
        { title: 'Khảo sát & độ phủ baseline', icon: 'map', codes: surveyCodes },
      ]).map(group => {
        const rows = group.codes.flatMap(code => metrics.filter(row => row.code === code))
        return <PanelShell key={group.title} icon={group.icon} title={group.title} className={`${card} min-w-0`}>
          {rows.length ? <div className={listClass}>{renderMetrics(rows)}</div> : <Empty>Chưa có chỉ số cho nhóm này.</Empty>}
        </PanelShell>
      })}
    </div>}
    <ReportingGeometryMap projectName={projectName} geometry={geometry.data} filters={filters} loading={geometry.isLoading}
      error={geometry.error ? aiApiErrorText(geometry.error) : undefined}
      renderLayout={(map, segmentTable) => <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="min-w-0 space-y-4">{map}</section>
        <StatisticsMenuPanel projectId={projectId} epoch={epoch} isPM={isPM} spatial={spatial} segmentName={segmentName} segmentTable={segmentTable} />
      </div>} />
    <div className="space-y-3">
      <div role="tablist" aria-label="Chi tiết báo cáo" className="flex flex-wrap gap-x-5 border-b border-brand-border px-1"
        onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          const next = event.key === 'Home' ? 'sources' : event.key === 'End' ? 'export' : tab === 'sources' ? 'export' : 'sources'
          setTab(next)
          event.currentTarget.querySelector<HTMLButtonElement>(`[data-report-tab="${next}"]`)?.focus()
        }}>
        {(Object.keys(reportTabs) as (keyof typeof reportTabs)[]).map(name =>
          <button key={name} id={`${tabsId}-${name}-tab`} data-report-tab={name} type="button" role="tab"
            aria-selected={tab === name} aria-controls={`${tabsId}-${name}`} tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)}
            className={`border-b-2 px-1 py-2.5 text-sm font-semibold ${tab === name ? 'border-brand-gold text-brand-navy' : 'border-transparent text-slate-600'}`}>
            {reportTabs[name]}
          </button>)}
      </div>
      <div id={`${tabsId}-sources`} role="tabpanel" aria-labelledby={`${tabsId}-sources-tab`} hidden={tab !== 'sources'}>
        <PanelShell icon="fact_check" title="Nguồn chi tiết và lịch sử" className={card}>
          {!!metricCodes.length && <label className="grid gap-1 text-xs">Chỉ số cần đối chiếu
            <select className="rg-field w-full max-w-xl truncate" value={selectedMetric} onChange={e => setMetric(e.target.value)}>
              <option value="">Chọn chỉ số</option>
              {metricCodes.map(code => <option key={code} value={code}>{metricTitle(code)}</option>)}
            </select>
          </label>}
          <PanelButton aria-expanded={showTimeline} onClick={() => setShowTimeline(value => !value)}>{showTimeline ? 'Ẩn lịch sử dự án' : 'Xem lịch sử dự án'}</PanelButton>
          {selectedMetric && <ReportPages key={`${selectedMetric}:${JSON.stringify(filters)}`} title={metricTitle(selectedMetric)}
            queryKey={[...key, 'items', selectedMetric, filters]} load={(cursor, signal) => reportingMenuService.items(projectId, selectedMetric, filters, cursor, signal)}>
            {(row) => <li key={row.id} className="space-y-1 p-3">
              <SourceReference source={row} />
              <p className="text-xs text-slate-700">{[row.status && label(row.status), row.band && label(row.band), row.segmentId && segmentName(row.segmentId),
                row.measurementType && label(row.measurementType), row.sizeBytes != null && `${numberLabel(row.sizeBytes)} byte`, row.unit && unitLabel(row.unit)].filter(Boolean).join(' · ')}</p>
            </li>}
          </ReportPages>}
          {showTimeline && <>
            <p className="text-xs text-slate-600">Lịch sử cấp dự án theo khoảng thời gian đã chọn.</p>
            <ReportPages key={`timeline:${from}:${to}`} title="Lịch sử dự án" queryKey={[...key, 'timeline', from, to]}
              load={(cursor, signal) => reportingMenuService.timeline(projectId, { from, to }, cursor, signal)}>
              {(row) => <li key={row.eventId} className="space-y-1 p-3 text-xs">
                <p className="text-slate-600">{dateLabel(row.occurredAt)} · {row.actorDisplay || 'Chưa có tên người thực hiện'}</p>
                <p className="font-semibold text-slate-800">{row.summary || label(row.action)}</p>
                <SourceReference source={row.source} />
              </li>}
            </ReportPages>
          </>}
        </PanelShell>
      </div>
      <div id={`${tabsId}-export`} role="tabpanel" aria-labelledby={`${tabsId}-export-tab`} hidden={tab !== 'export'}>
        <DossierMenuPanel projectId={projectId} epoch={epoch} geometry={geometry.data} />
      </div>
    </div>
  </>
}

export function ReportingMenu() {
  const role = useAuthStore(s => s.user?.role), epoch = useAuthStore(s => s.authEpoch)
  const isPM = role === RoleCode.PROJECT_MANAGER
  const [selected, setSelected] = useState('')
  const projects = useQuery({ queryKey: ['report-menu-projects', epoch, role], queryFn: ({ signal }) => reportingMenuService.projects(signal),
    enabled: isPM || role === RoleCode.SUPERVISOR, retry: false })
  const projectId = projects.isSuccess
    ? projects.data.find(row => row.projectId === selected)?.projectId ?? projects.data[0]?.projectId : undefined

  const heading = <>
    <div className="min-w-0 flex-[1_1_12rem]">
      <p className="text-xs font-semibold text-[#8C6D1F]">Báo cáo &amp; Hồ sơ</p>
      <h1 className="font-sansation text-2xl font-bold text-slate-900">{isPM ? 'Báo cáo KPI' : 'Phân tích rủi ro'}</h1>
    </div>
    <label className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-2xs">
      Dự án
      <select aria-label="Dự án" className="rg-field min-w-0 truncate" value={projectId ?? ''} onChange={e => setSelected(e.target.value)}>
        {!projectId && <option value="">Chọn dự án</option>}
        {projects.data?.map(row => <option key={row.projectId} value={row.projectId}>{row.name}</option>)}
      </select>
    </label>
  </>

  return <div className="space-y-4 break-words pb-16 text-[#1E293B]">
    {!projectId && <header className={headerClass}>{heading}</header>}
    {projects.isLoading && <Loading>Đang tải dự án…</Loading>}
    {projects.error && <Feedback error={aiApiErrorText(projects.error, 'Không đọc được dự án')} />}
    {projects.isSuccess && !projectId && <Empty>Chưa có dự án trong phạm vi tài khoản.</Empty>}
    {projectId && <ProjectReport key={`${epoch}:${role}:${projectId}`} projectId={projectId}
      projectName={projects.data?.find(row => row.projectId === projectId)?.name || ''} isPM={isPM} epoch={epoch} pageHeading={heading} />}
  </div>
}
