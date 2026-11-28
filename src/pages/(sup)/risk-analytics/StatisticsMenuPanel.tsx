import { useState, type FormEvent, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { reportingMenuService, type StatisticsConfirmation, type StatisticsSource } from '../../../api/services/reportingMenuService'
import type { ReportingFilters } from '../../../api/services/projectReportingService'
import { aiApiErrorText } from '../../../api/services/aiRunDetailService'
import { Empty, Feedback, KV, Loading, PanelButton, PanelShell, Pill } from '../../../components/ui/PanelKit'
import { useAuthStore } from '../../../store/authStore'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { dateLabel, explainReasons, label, matchedDefectsLabel, numberLabel, unitLabel } from './reportMenuLabels'

type Read = Awaited<ReturnType<typeof reportingMenuService.statistics>>
type Scope = Read['scopes'][number]
const sourceLabel = (source: StatisticsSource) => `Phần #${source.sharedPartId.slice(0, 8)} · ${source.provenance === 'TEST_ONLY' ? 'Nguồn thử nghiệm' : 'Nguồn thực'}`
const scopeLabel = (scope: Scope) => `Khiếm khuyết #${scope.defectId.slice(0, 8)} · ${numberLabel(scope.from)}–${numberLabel(scope.to)} m · Nghĩa vụ #${scope.obligationId.slice(0, 8)}`

function sameScope(source: StatisticsSource, scope: Scope) {
  return source.roadSectionId === scope.roadSectionId && source.locationVersion === scope.locationVersion &&
    source.from === scope.from && source.to === scope.to &&
    source.offsetFrom === scope.offsetFrom && source.offsetTo === scope.offsetTo
}

function readPins(source: StatisticsSource) {
  try {
    const quantities = JSON.parse(source.quantitiesJson) as StatisticsConfirmation['quantities']
    const segments = JSON.parse(source.segmentIdsJson) as string[]
    if (!Array.isArray(quantities) || quantities.some(q => !q?.measurementId || !q.sourceVersion) || !Array.isArray(segments)) return null
    return { quantities, segments }
  } catch { return null }
}

function ConfirmRelation({ projectId, view, active, segmentName, onConfirmed }: {
  projectId: string; view: Read; active: StatisticsSource[]; segmentName: (id: string) => string; onConfirmed: () => Promise<void>
}) {
  const identity = useAuthStore(s => s.user?.id)
  const guard = useSubmitGuard()
  const [obligation, setObligation] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [segmentIds, setSegmentIds] = useState<string[]>([])
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const scope = view.scopes.find(row => row.obligationId === obligation)
  const previous = active.find(row => row.obligationId === obligation)
  const eligible = scope ? active.filter(source =>
    (previous ? source.id === previous.id : true) && sameScope(source, scope) &&
    (source.provenance === 'REAL_SOURCE' || source.provenance === 'TEST_ONLY')) : []
  const source = eligible.find(row => row.id === sourceId)
  const pins = source ? readPins(source) : null
  const segments = view.segments.filter(row => row.routeVersionId === scope?.routeVersionId)
  const measurements = previous && pins ? pins.quantities.map(pin =>
    view.measurements.find(row => row.id === pin.measurementId && row.version === pin.sourceVersion && row.routeVersionId === scope?.routeVersionId)) : []
  const validPins = measurements.every(Boolean)
  const journalKey = `rg_statistics_${identity}_${projectId}`

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!scope || !source || !pins || !segmentIds.length || !validPins || !reason.trim() ||
        (source.provenance !== 'REAL_SOURCE' && source.provenance !== 'TEST_ONLY') || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const quantities = previous ? pins.quantities.map(pin => {
        const segmentId = allocations[pin.measurementId] || null
        if (segmentId && !segmentIds.includes(segmentId)) throw new Error('Chọn lại phân đoạn của phép đo.')
        return { measurementId: pin.measurementId, sourceVersion: pin.sourceVersion, segmentId }
      }) : []
      const body: StatisticsConfirmation = {
        obligationId: scope.obligationId, scopeHash: scope.scopeHash, defectVersion: scope.defectVersion,
        sharedPartId: source.sharedPartId, segmentIds: [...segmentIds].sort(), quantities, provenance: source.provenance,
        reason: reason.trim(), ...(previous ? { supersedesId: previous.id } : {}),
      }
      const fingerprint = JSON.stringify([view.version, body])
      const stored = sessionStorage.getItem(journalKey)
      const keys: Record<string, string> = stored ? JSON.parse(stored) : {}
      const requestKey = keys[fingerprint] ?? crypto.randomUUID()
      keys[fingerprint] = requestKey
      sessionStorage.setItem(journalKey, JSON.stringify(keys))
      await reportingMenuService.confirmStatistics(projectId, body, view.version, requestKey)
      delete keys[fingerprint]
      sessionStorage.setItem(journalKey, JSON.stringify(keys))
      setMessage('Backend đã ghi nhận quan hệ nguồn thống kê.')
      setObligation(''); setSourceId(''); setSegmentIds([]); setAllocations({}); setReason('')
      await onConfirmed()
    } catch (err) {
      setError(aiApiErrorText(err, 'Không xác nhận được quan hệ nguồn'))
    } finally { setBusy(false); guard.release() }
  }

  return <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <summary className="cursor-pointer font-semibold text-slate-800">Xác nhận quan hệ nguồn thống kê</summary>
    <form onSubmit={submit} className="mt-3 space-y-3">
      <fieldset disabled={busy} className="grid gap-3 text-xs">
        <label className="grid gap-1">Phạm vi nghĩa vụ
          <select className="rg-field" value={obligation} onChange={e => {
            setObligation(e.target.value); setSourceId(''); setSegmentIds([]); setAllocations({}); setReason('')
          }}>
            <option value="">Chọn phạm vi</option>
            {view.scopes.map(row => <option key={row.obligationId} value={row.obligationId}>{scopeLabel(row)}</option>)}
          </select>
        </label>
        {scope && !eligible.length && <Empty>Chưa có nguồn phần đường dùng chung khớp phạm vi để xác nhận.</Empty>}
        {!!eligible.length && <label className="grid gap-1">Quan hệ nguồn hiện có
          <select className="rg-field" value={sourceId} onChange={e => {
            setSourceId(e.target.value)
            const picked = eligible.find(row => row.id === e.target.value)
            const saved = picked ? readPins(picked) : null
            setSegmentIds(previous ? saved?.segments.filter(id => segments.some(row => row.id === id)) || [] : [])
            setAllocations(previous ? Object.fromEntries((saved?.quantities || []).map(pin => [pin.measurementId, pin.segmentId || ''])) : {})
          }}>
            <option value="">Chọn nguồn đã xác nhận</option>
            {eligible.map(row => <option key={row.id} value={row.id}>{sourceLabel(row)} · Nguồn #{row.id.slice(0, 8)}</option>)}
          </select>
        </label>}
        {source && (!pins || !validPins) && <Feedback error="Không đối chiếu được phân đoạn hoặc phiên bản phép đo của nguồn hiện hành." />}
        {source && pins && validPins && <>
          <p>{previous ? 'Lưu xác nhận mới thay thế xác nhận hiện hành.' : 'Liên kết nghĩa vụ với phần đường dùng chung đã xác nhận. Khối lượng giữ theo nguồn hiện có.'}</p>
          {segments.length ? <fieldset className="flex flex-wrap gap-3">
            <legend className="mb-1 font-semibold">Phân đoạn được xác nhận</legend>
            {segments.map(row => <label key={row.id} className="flex items-center gap-1.5">
              <input type="checkbox" checked={segmentIds.includes(row.id)} onChange={e => {
                setSegmentIds(ids => e.target.checked ? [...ids, row.id] : ids.filter(id => id !== row.id))
              }} />{segmentName(row.id)}
            </label>)}
          </fieldset> : <Empty>Phạm vi chưa có phân đoạn đã công bố.</Empty>}
          {measurements.map(m => m && <label key={m.id} className="grid gap-1">
            {label(m.type)} · {m.valueState === 'KNOWN' ? `${numberLabel(m.value)} ${unitLabel(m.unit)}` : 'Chưa xác định'}
            <select className="rg-field" value={allocations[m.id] || ''} onChange={e => setAllocations(a => ({ ...a, [m.id]: e.target.value }))}>
              <option value="">Chưa phân bổ</option>
              {allocations[m.id] && !segmentIds.includes(allocations[m.id]) && <option disabled value={allocations[m.id]}>Phân đoạn cũ chưa được chọn</option>}
              {segmentIds.map(id => <option key={id} value={id}>{segmentName(id)}</option>)}
            </select>
          </label>)}
          <label className="grid gap-1">Lý do xác nhận<textarea className="rg-field" required maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} /></label>
          <PanelButton type="submit" variant="primary" loading={busy} disabled={busy || !segmentIds.length || !reason.trim() ||
            Object.values(allocations).some(id => id && !segmentIds.includes(id))}>
            {previous ? 'Xác nhận thay thế' : 'Xác nhận liên kết'}
          </PanelButton>
        </>}
      </fieldset>
      <Feedback error={error} message={message} />
    </form>
  </details>
}

export function StatisticsMenuPanel({ projectId, epoch, isPM, spatial, segmentName, segmentTable }: {
  projectId: string; epoch: number; isPM: boolean; spatial: Omit<ReportingFilters, 'from' | 'to'>; segmentName: (id: string) => string
  segmentTable: ReactNode
}) {
  const qc = useQueryClient()
  const filtered = !!(spatial.routeVersionId || spatial.segmentSetId || spatial.segmentIds?.length)
  const key = ['report-menu', epoch, projectId]
  const query = useQuery({
    queryKey: [...key, 'defect-statistics', spatial],
    queryFn: ({ signal }) => reportingMenuService.statistics(projectId, spatial, signal), retry: false,
  })
  const view = query.isSuccess ? query.data : undefined
  const totals = view?.statistics
  const superseded = new Set(view?.history.map(row => row.supersedesId))
  const active = view?.history.filter(row => !superseded.has(row.id)) || []
  return <PanelShell icon="query_stats" title="Thống kê khiếm khuyết" className="min-w-0 !p-5 !rounded-[20px]"
    subtitle="Phạm vi hiện hành"
    actions={<PanelButton disabled={query.isFetching} onClick={() => { void query.refetch() }}>Tải lại thống kê</PanelButton>}>
    {query.isLoading && <Loading>Đang tải thống kê…</Loading>}
    {query.error && <Feedback error={aiApiErrorText(query.error, 'Không đọc được thống kê khiếm khuyết')} />}
    {view && totals && <>
      <div className="rounded-xl border border-brand-border bg-brand-surfaceAlt p-3"><KV items={[
        { k: 'Khiếm khuyết riêng biệt của dự án', v: numberLabel(totals.projectDistinctDefects) },
        { k: matchedDefectsLabel(filtered), v: numberLabel(totals.matchedDistinctDefects) },
        { k: 'Khiếm khuyết chưa ánh xạ trong phạm vi', v: numberLabel(totals.unmappedDefects) },
      ]} /></div>
      {!!totals.missingReasons.length && <p className="text-xs text-amber-800">{explainReasons(totals.missingReasons)}</p>}
    </>}
    {segmentTable}
    {view && totals && <>
      {totals.quantities.length ? <details className="rounded-xl border border-slate-200 p-3 text-xs">
        <summary className="cursor-pointer font-semibold">Khối lượng theo nguồn</summary>
        {[true, false].map(allocated => {
          const rows = totals.quantities.filter(row => Boolean(row.segmentId) === allocated)
          return rows.length > 0 && <div key={String(allocated)} className="mt-3">
            <p className="font-semibold">{allocated ? 'Đã phân bổ' : 'Chưa phân bổ'}</p>
            <ul className="divide-y divide-slate-100">{rows.map((row, i) => <li key={`${row.sharedPartId}:${row.measurementId}:${i}`} className="py-2">
              {label(row.type)} · {row.valueState === 'KNOWN' ? `${numberLabel(row.value)} ${unitLabel(row.unit)}` : 'Chưa xác định'}
              {row.segmentId && ` · ${segmentName(row.segmentId)}`}
              {` · ${row.provenance === 'TEST_ONLY' ? 'Nguồn thử nghiệm' : 'Nguồn thực'}`}
              {row.reason && ` · ${explainReasons([row.reason])}`}
            </li>)}</ul>
          </div>
        })}
      </details> : <Empty>Chưa có khối lượng được xác nhận trong phạm vi này.</Empty>}
      {!!active.length && <details className="rounded-xl border border-slate-200 p-3 text-xs">
        <summary className="cursor-pointer font-semibold">Quan hệ nguồn hiện hành</summary>
        {active.map(row => <p key={row.id} className="mt-2">{sourceLabel(row)} · {dateLabel(row.confirmedAtUtc)}{row.reason && ` · ${row.reason}`}</p>)}
      </details>}
      {isPM && (filtered ? <p className="text-xs text-slate-600">Bỏ bộ lọc tuyến và phân đoạn để xác nhận theo phiên bản thống kê toàn dự án.</p>
        : active.length && view.scopes.length ? <ConfirmRelation projectId={projectId} view={view} active={active} segmentName={segmentName}
          onConfirmed={() => qc.invalidateQueries({ queryKey: key })} />
        : <p className="text-xs text-slate-600">Chưa có quan hệ nguồn đã xác nhận để đối chiếu phần đường dùng chung và nguồn gốc dữ liệu.</p>)}
    </>}
  </PanelShell>
}
