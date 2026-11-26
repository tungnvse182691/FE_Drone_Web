import React, { useEffect, useMemo, useRef, useState } from 'react'
import { routingMapService, routingError, type RoutingCandidate, type RoutingCandidatesResult, type RoutingDecision, type RoutingDecisionAttestation } from '../../../api/services/routingMapService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { useCaseReportMedia, evidenceGps } from './useCaseReportMedia'
import { RoutingMapView } from './RoutingMapView'

const OUTCOME_LABEL: Record<string, string> = { NEEDS_LOCATION_EVIDENCE: 'Cần bổ sung vị trí/ảnh', OUTSIDE_COMPANY_SCOPE: 'Ngoài phạm vi công ty' }
const STATE_LABEL: Record<string, string> = { EFFECTIVE: 'Đang hiệu lực', REVIEW_REQUIRED: 'Cần xét lại (nguồn đã đổi)', SUPERSEDED: 'Đã được thay thế' }
const RELATION_NOTE = 'UNKNOWN nghĩa là chưa đủ căn cứ, không phải "không thuộc" hay 0.'
const num = (v: number | null | undefined, unit: string) => typeof v === 'number' && Number.isFinite(v) ? `${v.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} ${unit}` : null
type Cands = { key: string; loading?: boolean; error?: string; data?: RoutingCandidatesResult }

function CandidateList({ c, onRoute }: { c: RoutingCandidatesResult; onRoute: (route: RoutingCandidate['route']) => void }) {
  const missingGps = c.missingReasons.includes('GPS_MISSING')
  return <div className="space-y-2" data-testid="routing-candidates">
    {missingGps ? <p role="status" data-testid="candidates-missing" className="text-slate-600">Ảnh này chưa có GPS để gợi ý tuyến.</p>
      : (c.completeness !== 'COMPLETE' || c.missingReasons.length > 0) && <p role="status" className="text-amber-800">Chưa đủ căn cứ để quyết định.</p>}
    <details data-testid="candidate-list"><summary className="cursor-pointer font-semibold">Tuyến ứng viên ({c.candidates.length})</summary>
      {!c.candidates.length && !missingGps && <p>Máy chủ không trả tuyến ứng viên.</p>}
      <ul className="mt-2 space-y-2">{c.candidates.map(x => <li key={x.route.routeVersionId} data-testid="candidate" className="border-b border-slate-200 pb-2 space-y-1">
        {x.route.roadSectionName?.trim() ? <button type="button" data-route-version-id={x.route.routeVersionId} className="text-left font-semibold underline text-brand-navy" onClick={() => onRoute(x.route)}>{x.route.roadSectionName}</button> : <span>Chưa có tên tuyến</span>}
        <span className="ml-2 text-slate-600">{num(x.distanceMeters, 'm') || 'Chưa tính được khoảng cách'}{!x.route.isCurrent && ' · Tuyến lịch sử'}</span>
        {x.responsibility === 'UNKNOWN' && <span className="ml-2 text-amber-800">Chưa xác định trách nhiệm</span>}
        <details><summary className="cursor-pointer text-slate-500">Chi tiết đối chiếu</summary>
          <dl className="break-all"><dt>Dự án / tuyến</dt><dd>{x.route.projectName} · {x.route.roadSectionCode}</dd><dt>Phiên bản tuyến</dt><dd>{x.route.routeVersionId} · v{x.route.versionNo} · {x.route.geometryHash}</dd><dt>Phương pháp / quan hệ / sai số / trách nhiệm</dt><dd>{x.distanceMethod || 'Không có phương pháp'} · {x.spatialRelation} · {x.uncertaintyStatus} · {x.responsibility}</dd><dt>Lý do thiếu</dt><dd>{x.missingReasons.join(', ') || 'Không có mã thiếu'}</dd></dl>
          {!!x.route.coveragePins?.length && <pre className="whitespace-pre-wrap break-all">{JSON.stringify(x.route.coveragePins, null, 2)}</pre>}
          {!!x.route.policyPins?.length && <pre className="whitespace-pre-wrap break-all">{JSON.stringify(x.route.policyPins, null, 2)}</pre>}
        </details>
      </li>)}</ul>
    </details>
    <details><summary className="cursor-pointer text-slate-500">Chi tiết đối chiếu</summary><p data-testid="candidates-meta">{c.searchScope} · {c.completeness} · {c.pages} trang · {c.algorithmVersion}</p><p className="break-all">{c.evaluationVersion} · {c.source.reportId} · {c.source.evidenceId}</p><p>{c.missingReasons.join(', ')}</p><p>{RELATION_NOTE}</p><pre className="whitespace-pre-wrap break-all">{JSON.stringify(c.source, null, 2)}</pre></details>
  </div>
}

export function ReportRoutingPanel({ caseId, caseVersion, caseStatus, onCaseChanged, onNotify }: { caseId: string; caseVersion?: string | null; caseStatus?: string; onCaseChanged?: () => void; onNotify?: (message: string) => void }) {
  const epoch = useAuthStore(s => s.authEpoch), role = useAuthStore(s => s.user?.role)
  const isSup = role === RoleCode.SUPERVISOR
  const media = useCaseReportMedia()
  const ready = media?.caseId === caseId && !media.reportsLoading && !media.reportsError
  const selected = ready ? media!.selected : null
  const reports = ready ? media!.reports : []
  const gps = evidenceGps(selected?.evidence)
  const target = selected ? { reportId: selected.reportId, evidenceId: selected.evidence.evidenceId } : reports.length === 1 ? { reportId: reports[0].reportId, evidenceId: null as string | null } : null
  const tKey = target ? `${epoch}:${caseId}:${target.reportId}:${target.evidenceId}` : ''
  const [cands, setCands] = useState<Cands>({ key: '' }), [reloadC, setReloadC] = useState(0)
  const mapBox = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState<{ key: string; serial: number; route?: RoutingCandidate['route'] } | null>(null)
  const activeFocus = focus?.key === tKey ? focus : null
  const scrollMap = () => mapBox.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const navigateRoute = (route: RoutingCandidate['route']) => { setFocus(old => ({ key: tKey, serial: (old?.serial || 0) + 1, route })); scrollMap() }
  useEffect(() => { if (media?.mapRequest) { setFocus(old => ({ key: tKey, serial: (old?.serial || 0) + 1 })); scrollMap() } }, [media?.mapRequest, tKey])

  useEffect(() => {
    if (!target) { setCands({ key: '' }); return }
    const controller = new AbortController(), key = tKey
    setCands({ key, loading: true })
    routingMapService.readCandidates(caseId, target.reportId, target.evidenceId, controller.signal)
      .then(data => { if (!controller.signal.aborted) setCands({ key, data }) })
      .catch(e => { if (!controller.signal.aborted) setCands({ key, error: routingError(e) }) })
    return () => controller.abort()
  }, [tKey, reloadC])
  const cur = cands.key === tKey ? cands : { key: '' } as Cands

  if (!isSup && role !== RoleCode.PROJECT_MANAGER) return null
  return <section className="bg-white rounded-xl border border-slate-200 p-3 space-y-3 text-xs" data-testid="routing-panel" data-case-id={caseId}>
    <header><h3 className="text-xs font-bold text-brand-dark">{isSup ? 'Bản đồ tuyến công ty & đối chiếu vị trí ảnh' : 'Đối chiếu vị trí ảnh với tuyến của dự án'}</h3>
      <p className="text-[11px] text-slate-500">Chọn đúng ảnh bằng nút "Xem ảnh" ở từng phản ánh phía trên; chỉ GPS của ảnh/bằng chứng đó được dùng, không mượn GPS ảnh khác.</p></header>
    {!ready && <p role="status" className="text-slate-500">{media?.reportsError || 'Đang đọc phản ánh để chọn ảnh…'}</p>}
    {ready && !target && <p className="text-slate-500">{reports.length ? 'Hãy chọn một ảnh/bằng chứng của phản ánh để đối chiếu.' : 'Hồ sơ chưa có Report để đối chiếu.'}</p>}
    {target && <p data-testid="routing-target" className="break-all text-slate-700">Đang đối chiếu: Report {target.reportId.slice(0, 8)} · {target.evidenceId ? `ảnh ${target.evidenceId.slice(0, 8)}` : 'Report không có ảnh'} · GPS ảnh: {gps.located ? `${gps.text} (${gps.source})` : '—'}</p>}
    <div ref={mapBox}><RoutingMapView key={caseId} company={isSup} selectionKey={tKey} gps={gps.located ? { lat: gps.lat!, lng: gps.lng! } : null} focus={activeFocus} /></div>
    {!isSup && <p className="text-slate-500">Bản đồ toàn công ty chỉ dành cho Giám sát; PM chỉ đọc tuyến cụ thể được phép trong dự án của hồ sơ.</p>}
    {target && <div className="space-y-2">
      <div className="flex items-center justify-between"><h4 className="font-semibold">Ứng viên tuyến cho ảnh đã chọn</h4><button type="button" disabled={cur.loading} onClick={() => setReloadC(n => n + 1)} className="rg-btn text-xs">Đối chiếu lại</button></div>
      {cur.loading && <p role="status" className="text-slate-500">Đang đọc đủ các trang ứng viên…</p>}
      {cur.error && <p role="alert" className="text-rose-700">{cur.error} <button type="button" className="underline" onClick={() => setReloadC(n => n + 1)}>Thử lại</button></p>}
      {cur.data && <CandidateList key={tKey} c={cur.data} onRoute={navigateRoute} />}
    </div>}
    {isSup && <RoutingDecisionBlock caseId={caseId} caseVersion={caseVersion || ''} caseStatus={caseStatus} target={target} evaluationVersion={cur.data?.evaluationVersion} onCaseChanged={onCaseChanged} onNotify={onNotify} />}
  </section>
}

function RoutingDecisionBlock({ caseId, caseVersion, caseStatus, target, evaluationVersion, onCaseChanged, onNotify }: { caseId: string; caseVersion: string; caseStatus?: string; target: { reportId: string; evidenceId: string | null } | null; evaluationVersion?: string; onCaseChanged?: () => void; onNotify?: (message: string) => void }) {
  const epoch = useAuthStore(s => s.authEpoch)
  const media = useCaseReportMedia()
  const reports = media?.caseId === caseId ? media.reports : []
  const [history, setHistory] = useState<{ scope: string; items?: RoutingDecision[]; error?: string } | null>(null), [reload, setReload] = useState(0)
  const [outcome, setOutcome] = useState<'' | 'NEEDS_LOCATION_EVIDENCE' | 'OUTSIDE_COMPANY_SCOPE'>(''), [reason, setReason] = useState('')
  const [scopeReason, setScopeReason] = useState(''), [conflict, setConflict] = useState('')
  const [per, setPer] = useState<Record<string, { evidenceId: string; loc: string; resp: string; refs: string[] }>>({})
  const [rc, setRc] = useState<Record<string, Cands>>({})
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [err, setErr] = useState(''), [pendingTick, setPendingTick] = useState(0)
  const scope = `${epoch}:${caseId}:${reload}`
  const unassigned = caseStatus === 'UNASSIGNED'
  useEffect(() => {
    const controller = new AbortController()
    routingMapService.readDecisions(caseId, controller.signal).then(items => { if (!controller.signal.aborted) setHistory({ scope, items }) }).catch(e => { if (!controller.signal.aborted) setHistory({ scope, error: routingError(e) }) })
    return () => controller.abort()
  }, [scope])
  const h = history?.scope === scope ? history : null
  const pending = useMemo(() => { try { return routingMapService.pending(caseId) } catch (e) { return { error: (e as Error).message } as any } }, [caseId, pendingTick, busy])
  const evidenceOf = (r: (typeof reports)[number]) => [...r.originalEvidence, ...r.supplements.flatMap(s => s.evidence)]
  const outside = outcome === 'OUTSIDE_COMPANY_SCOPE'
  useEffect(() => {
    if (!outside) return
    const controllers: AbortController[] = []
    for (const r of reports) {
      const ev = per[r.reportId]?.evidenceId || (target?.reportId === r.reportId ? target.evidenceId : evidenceOf(r)[0]?.evidenceId) || ''
      const key = `${r.reportId}:${ev}`
      if (rc[r.reportId]?.key === key) continue
      const controller = new AbortController(); controllers.push(controller)
      setRc(o => ({ ...o, [r.reportId]: { key, loading: true } }))
      routingMapService.readCandidates(caseId, r.reportId, ev || null, controller.signal)
        .then(data => { if (!controller.signal.aborted) setRc(o => ({ ...o, [r.reportId]: { key, data } })) })
        .catch(e => { if (!controller.signal.aborted) setRc(o => ({ ...o, [r.reportId]: { key, error: routingError(e) } })) })
    }
    return () => controllers.forEach(c => c.abort())
  }, [outside, reports.length, JSON.stringify(Object.values(per).map(p => p.evidenceId))])
  useEffect(() => { setOutcome(''); setReason(''); setErr(''); setMsg(''); setPer({}); setRc({}) }, [caseId, epoch])

  const attestation = (): RoutingDecisionAttestation => ({
    scopeReason: scopeReason.trim(), conflictResolution: conflict.trim(), temporalBasis: 'SERVER_RECEIVED_AT',
    reports: reports.map(r => {
      const p = per[r.reportId], cand = rc[r.reportId]?.data
      const ev = p?.evidenceId || (target?.reportId === r.reportId ? target.evidenceId : evidenceOf(r)[0]?.evidenceId) || null
      const refs = (p?.refs || []).map(k => { const [kind, id, version] = k.split('|'); return { kind: kind as 'ROUTE_VERSION' | 'COVERAGE_MAPPING', id, version } })
      void cand
      return { reportId: r.reportId, evidenceId: ev, locationReason: (p?.loc || '').trim(), responsibilityReason: (p?.resp || '').trim(), sourceReferences: refs }
    })
  })
  const invalid = !target || !outcome || !reason.trim() || reason.trim().length > 2000 || !caseVersion || outside && (!scopeReason.trim() || !conflict.trim() || reports.some(r => !per[r.reportId]?.loc?.trim() || !per[r.reportId]?.resp?.trim() || rc[r.reportId]?.loading || rc[r.reportId]?.error))
  const submit = async (replay = false) => {
    if (busy) return
    setBusy(true); setErr(''); setMsg('')
    try {
      const old = replay ? routingMapService.pending(caseId) : null
      if (replay && !old) throw new Error('Không có lệnh đang chờ.')
      const res = replay
        ? await routingMapService.decide(caseId, { outcome: old!.body.outcome as any, reason: old!.body.reason as string, reportId: old!.body.reportId as string, evidenceId: old!.body.evidenceId as string | null, routingEvaluationVersion: old!.body.routingEvaluationVersion as string | undefined, attestation: old!.body.attestation as RoutingDecisionAttestation | undefined }, old!.version)
        : await routingMapService.decide(caseId, { outcome: outcome as any, reason, reportId: target!.reportId, evidenceId: target!.evidenceId, routingEvaluationVersion: evaluationVersion, attestation: outside ? attestation() : null }, caseVersion)
      setMsg(`Đã ghi quyết định "${OUTCOME_LABEL[res.decision.outcome]}". Quyết định tiếp nhận nội bộ không đóng Case, không tạo việc và không thông báo Reporter. Đang đọc lại hồ sơ/lịch sử…`)
      onNotify?.(`Đã ghi quyết định tiếp nhận "${OUTCOME_LABEL[res.decision.outcome]}" (nội bộ; Case không đóng, không thông báo Reporter).`)
      setOutcome(''); setReason(''); setReload(n => n + 1); onCaseChanged?.()
    } catch (e) { setErr(routingError(e)) }
    finally { setBusy(false); setPendingTick(n => n + 1) }
  }
  const effective = h?.items?.filter(d => d.state !== 'SUPERSEDED').slice(-1)[0]
  return <div className="border-t pt-3 space-y-2" data-testid="routing-decisions">
    <h4 className="font-semibold">Quyết định tiếp nhận nội bộ (Giám sát)</h4>
    {!h && <p role="status" className="text-slate-500">Đang đọc lịch sử tiếp nhận…</p>}
    {h?.error && <p role="alert" className="text-rose-700">{h.error} <button type="button" className="underline" onClick={() => setReload(n => n + 1)}>Thử lại</button></p>}
    {h?.items && <>
      <p data-testid="decision-current">Hiệu lực hiện tại: {effective ? `${effective.outcome ? OUTCOME_LABEL[effective.outcome] : 'Chưa có kết quả'} — ${STATE_LABEL[effective.state] || effective.state}${effective.state === 'REVIEW_REQUIRED' ? ' (không áp quyết định cũ lên ảnh/nguồn mới)' : ''}` : 'Chưa có quyết định tiếp nhận.'}</p>
      {h.items.length > 0 && <details><summary className="cursor-pointer">Lịch sử quyết định ({h.items.length})</summary><ul className="space-y-1 mt-1">{h.items.map(d => <li key={d.decisionId} className="border rounded p-1.5 break-words"><b>{OUTCOME_LABEL[d.outcome] || d.outcome}</b> · {STATE_LABEL[d.state] || d.state} · {d.decidedAt} · Report {d.reportId.slice(0, 8)}{d.evidenceId ? ` · ảnh ${d.evidenceId.slice(0, 8)}` : ''}<br />{d.reason}{d.attestation ? <span className="block text-slate-500">Cam kết có căn cứ: {d.attestation.reports.length} Report, {d.attestation.reports.reduce((n, r) => n + r.sourceReferences.length, 0)} nguồn tham chiếu.</span> : null}</li>)}</ul></details>}
    </>}
    {pending?.error && <p role="alert" className="text-rose-700">{pending.error}</p>}
    {pending && !pending.error && <div className="p-2 rounded bg-amber-50 border border-amber-200 space-y-1" data-testid="routing-pending">
      <p>{pending.rejected ? 'Lệnh tiếp nhận bị máy chủ từ chối; không tự gửi lại. Đọc lại hồ sơ rồi lập ý định mới.' : 'Có lệnh tiếp nhận chưa rõ kết quả. Chỉ gửi lại đúng key/nội dung/phiên bản đã lưu hoặc đối chiếu.'}</p>
      <div className="flex gap-2">{!pending.rejected && <button type="button" disabled={busy} onClick={() => submit(true)} className="rg-btn">Gửi lại nguyên vẹn</button>}<button type="button" disabled={busy} onClick={() => { setReload(n => n + 1); onCaseChanged?.() }} className="rg-btn">Đọc lại hồ sơ/lịch sử</button>{pending.rejected && <button type="button" disabled={busy} onClick={() => { routingMapService.discardRejected(caseId); setPendingTick(n => n + 1) }} className="rg-btn">Bỏ lệnh bị từ chối</button>}</div></div>}
    {!unassigned && <p className="text-slate-500">Hồ sơ đã phân dự án hoặc đã có kết luận: Giám sát chỉ xem lịch sử, không ghi quyết định tiếp nhận mới.</p>}
    {unassigned && !pending && <fieldset disabled={busy} className="space-y-2 min-w-0 border-0 p-0 m-0">
      <p className="text-slate-600">Hai kết quả này chỉ là quyết định tiếp nhận nội bộ. Để điều phối vào dự án dùng nút "Điều phối" ở Thông tin hồ sơ. Thiếu GPS không phải ngoài phạm vi.</p>
      <select aria-label="Kết quả tiếp nhận" value={outcome} onChange={e => setOutcome(e.target.value as any)} className="rg-field w-full"><option value="">Chọn kết quả tiếp nhận</option><option value="NEEDS_LOCATION_EVIDENCE">Cần bổ sung vị trí/ảnh (thiếu GPS)</option><option value="OUTSIDE_COMPANY_SCOPE">Ngoài phạm vi công ty (cần cam kết có căn cứ)</option></select>
      <textarea aria-label="Lý do tiếp nhận" rows={2} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} placeholder="Lý do (bắt buộc, tối đa 2000 ký tự)" className="rg-field w-full" />
      {outside && <div className="space-y-2 border rounded-lg p-2" data-testid="attestation">
        <p className="text-slate-600">Cam kết phải bao phủ mọi Report đang liên kết ({reports.length}) đúng một lần, kèm nguồn tham chiếu bạn đã xem. Cơ sở thời gian: SERVER_RECEIVED_AT. Máy chủ không tự xác minh ngoài phạm vi.</p>
        <textarea aria-label="Lý do phạm vi" rows={2} maxLength={2000} value={scopeReason} onChange={e => setScopeReason(e.target.value)} placeholder="Lý do phạm vi (bắt buộc)" className="rg-field w-full" />
        <textarea aria-label="Xử lý mâu thuẫn" rows={2} maxLength={2000} value={conflict} onChange={e => setConflict(e.target.value)} placeholder="Cách xử lý mâu thuẫn giữa các Report (bắt buộc)" className="rg-field w-full" />
        {reports.map(r => { const p = per[r.reportId] || { evidenceId: '', loc: '', resp: '', refs: [] }, set = (v: Partial<typeof p>) => setPer(o => ({ ...o, [r.reportId]: { ...p, ...v } })), c = rc[r.reportId]
          return <div key={r.reportId} className="border-t pt-2 space-y-1" data-testid="attest-report">
            <p className="font-mono break-all">Report {r.reportId}</p>
            <select aria-label={`Ảnh của Report ${r.reportId.slice(0, 8)}`} value={p.evidenceId || (target?.reportId === r.reportId ? target.evidenceId || '' : evidenceOf(r)[0]?.evidenceId || '')} onChange={e => set({ evidenceId: e.target.value, refs: [] })} className="rg-field w-full">{evidenceOf(r).length === 0 && <option value="">Report không có ảnh</option>}{evidenceOf(r).map(ev => <option key={ev.evidenceId} value={ev.evidenceId}>{ev.supplementId ? 'Ảnh bổ sung' : 'Ảnh gốc'} {ev.evidenceId.slice(0, 8)} · {evidenceGps(ev).located ? evidenceGps(ev).text : 'GPS UNKNOWN'}</option>)}</select>
            <textarea aria-label={`Lý do vị trí ${r.reportId.slice(0, 8)}`} rows={1} value={p.loc} onChange={e => set({ loc: e.target.value })} placeholder="Căn cứ vị trí (bắt buộc)" className="rg-field w-full" />
            <textarea aria-label={`Lý do trách nhiệm ${r.reportId.slice(0, 8)}`} rows={1} value={p.resp} onChange={e => set({ resp: e.target.value })} placeholder="Căn cứ trách nhiệm (bắt buộc)" className="rg-field w-full" />
            {c?.loading && <p role="status" className="text-slate-500">Đang đọc ứng viên làm nguồn tham chiếu…</p>}
            {c?.error && <p role="alert" className="text-rose-700">{c.error}</p>}
            {c?.data && (c.data.candidates.length === 0 ? <p className="text-amber-800">Không có tuyến ứng viên để tham chiếu ({c.data.missingReasons.join(', ') || 'đã đọc hết trang'}). Thiếu GPS/nguồn thì máy chủ sẽ không cho kết luận ngoài phạm vi.</p> : <div className="space-y-0.5">{c.data.candidates.flatMap(x => [{ k: `ROUTE_VERSION|${x.route.routeVersionId}|${x.route.geometryHash}`, t: `Tuyến ${x.route.projectName}/${x.route.roadSectionCode} v${x.route.versionNo}` }, ...(x.route.coveragePins || []).map(pn => ({ k: `COVERAGE_MAPPING|${pn.id}|${pn.version}`, t: `Độ phủ ${pn.sourceKind}/${pn.provenance} của ${x.route.projectName}` }))]).map(o => <label key={o.k} className="flex gap-1.5"><input type="checkbox" checked={p.refs.includes(o.k)} onChange={e => set({ refs: e.target.checked ? [...p.refs, o.k] : p.refs.filter(k => k !== o.k) })} />{o.t}</label>)}</div>)}
          </div> })}
      </div>}
      {err && <p role="alert" className="text-rose-700" data-testid="routing-error">{err}</p>}
      <button type="button" disabled={busy || invalid} onClick={() => submit(false)} className="rg-btn" data-testid="routing-submit">{busy ? 'Đang gửi/đọc lại…' : 'Ghi quyết định tiếp nhận'}</button>
    </fieldset>}
    {pending && err && <p role="alert" className="text-rose-700">{err}</p>}
    {msg && <p role="status" className="text-emerald-700" data-testid="routing-msg">{msg}</p>}
  </div>
}
