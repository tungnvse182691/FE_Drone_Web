import React, { useCallback, useEffect, useState } from 'react'
import { defectStatisticsService, type DefectStatisticsView } from '../../../api/services/defectStatisticsService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, KV, Loading, PanelButton, PanelShell, Pill, SectionTitle } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

/** PM: xác nhận thống kê khiếm khuyết (ghim phép đo vào shared part) và xem lịch sử xác nhận. Dữ liệu từ BE. */
export const DefectStatisticsPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [view, setView] = useState<DefectStatisticsView | null>(null)
  const [loading, setLoading] = useState(false)
  const [scopeIdx, setScopeIdx] = useState(0)
  const [segments, setSegments] = useState<string[]>([])
  const [measurements, setMeasurements] = useState<string[]>([])
  const [sharedPartId, setSharedPartId] = useState('')
  const [provenance, setProvenance] = useState<'TEST_ONLY' | 'REAL_SOURCE'>('REAL_SOURCE')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setView(await defectStatisticsService.read(projectId)) } catch (e) { setError(exportError(e)) } finally { setLoading(false) }
  }, [projectId])
  useEffect(() => { setScopeIdx(0); setSegments([]); setMeasurements([]); void load() }, [load])

  const scope = view?.scopes[scopeIdx]
  const toggle = (list: string[], id: string, set: (v: string[]) => void) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  const submit = async () => {
    if (!view || !scope || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      await defectStatisticsService.confirm(projectId, view, { scope, sharedPartId, segmentIds: segments, measurementIds: measurements, provenance, reason })
      setMessage('Đã xác nhận thống kê khiếm khuyết.'); setReason(''); await load()
    } catch (e) { setError(exportError(e)) } finally { setBusy(false); guard.release() }
  }
  const cls = 'rg-field'
  const myMeasurements = view?.measurements.filter((m) => m.defectId === scope?.defectId) || []

  return (
    <PanelShell icon="query_stats" title="Xác nhận thống kê khiếm khuyết" className="!p-5 !rounded-[16px]" data-testid="defect-statistics-panel"
      actions={<PanelButton disabled={loading} loading={loading} onClick={() => { void load() }}>{loading ? 'Đang tải…' : 'Tải lại'}</PanelButton>}>
      <Feedback error={error} message={message} />
      {!view && loading && <Loading />}
      {view && (
        <>
          <div className="rg-subcard">
            <KV items={[
              { k: 'Khiếm khuyết riêng biệt', v: view.statistics.projectDistinctDefects },
              { k: 'Đã khớp', v: view.statistics.matchedDistinctDefects },
              { k: 'Shared part', v: view.statistics.sharedParts },
              { k: 'Chưa ánh xạ', v: view.statistics.unmappedDefects },
              ...(view.statistics.missingReasons?.length ? [{ k: 'Thiếu', v: view.statistics.missingReasons.join(', ') }] : []),
            ]} />
          </div>
          {view.scopes.length === 0 && <Empty icon="route">Không có phạm vi nghĩa vụ nào trong CSDL.</Empty>}
          {scope && (
            <div className="rg-subcard">
              <Field label="Phạm vi nghĩa vụ">
                <select aria-label="Phạm vi nghĩa vụ" value={scopeIdx} disabled={busy} onChange={(e) => { setScopeIdx(Number(e.target.value)); setMeasurements([]) }} className={`${cls} w-full`}>
                  {view.scopes.map((s, i) => (<option key={s.obligationId} value={i}>Khiếm khuyết #{s.defectId.slice(0, 8)} · lý trình {s.from}–{s.to} (+{s.offsetFrom}…{s.offsetTo})</option>))}
                </select>
              </Field>
              <div className="grid lg:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <SectionTitle icon="segment">Phân đoạn</SectionTitle>
                  <div className="flex flex-wrap gap-2">{view.segments.filter((s) => s.routeVersionId === scope.routeVersionId).map((s) => (<label key={s.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors ${segments.includes(s.id) ? 'border-brand-navy bg-brand-navy/5 text-brand-navy' : 'border-brand-border bg-white hover:bg-brand-surfaceAlt'}`}><input type="checkbox" className="accent-brand-navy" disabled={busy} checked={segments.includes(s.id)} onChange={() => toggle(segments, s.id, setSegments)} />#{s.id.slice(0, 8)}</label>))}</div>
                </div>
                <div className="space-y-2">
                  <SectionTitle icon="straighten">Phép đo của khiếm khuyết</SectionTitle>
                  {myMeasurements.length === 0 && <Empty icon="straighten">Khiếm khuyết chưa có phép đo.</Empty>}
                  <div className="flex flex-wrap gap-2">{myMeasurements.map((m) => (<label key={m.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${measurements.includes(m.id) ? 'border-brand-navy bg-brand-navy/5 text-brand-navy' : 'border-brand-border bg-white hover:bg-brand-surfaceAlt'}`}><input type="checkbox" className="accent-brand-navy" disabled={busy} checked={measurements.includes(m.id)} onChange={() => toggle(measurements, m.id, setMeasurements)} />{m.type} {m.valueState === 'KNOWN' ? `${m.value} ${m.unit || ''}` : `(${m.unknownReason || 'chưa rõ'})`}</label>))}</div>
                </div>
              </div>
              <div className="rg-grid">
                <Field label="Mã shared part" span="col-span-12 md:col-span-8"><input aria-label="Mã shared part" value={sharedPartId} disabled={busy} onChange={(e) => setSharedPartId(e.target.value)} placeholder="sharedPartId (GUID)" className={`${cls} w-full font-mono`} /></Field>
                <Field label="Nguồn thống kê" span="col-span-12 md:col-span-4"><select aria-label="Nguồn thống kê" value={provenance} disabled={busy} onChange={(e) => setProvenance(e.target.value as 'TEST_ONLY' | 'REAL_SOURCE')} className={`${cls} w-full`}><option value="REAL_SOURCE">REAL_SOURCE</option><option value="TEST_ONLY">TEST_ONLY</option></select></Field>
              </div>
              {view.history.length > 0 && <p className="text-slate-500">Shared part đã xác nhận: <span className="font-mono">{Array.from(new Set(view.history.map((h) => h.sharedPartId))).map((id) => id.slice(0, 8)).join(', ')}</span> (nhập lại mã đầy đủ để dùng tiếp)</p>}
              <Field label="Lý do xác nhận thống kê"><textarea aria-label="Lý do xác nhận thống kê" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={`${cls} w-full`} /></Field>
              <div className="rg-footer">
                <PanelButton variant="primary" loading={busy} disabled={busy || !reason.trim() || !sharedPartId.trim() || segments.length === 0} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Xác nhận thống kê'}</PanelButton>
              </div>
            </div>
          )}
          <div data-testid="defect-statistics-history" className="space-y-2">
            <SectionTitle icon="history">Lịch sử xác nhận ({view.history.length})</SectionTitle>
            {view.history.length === 0 && <Empty icon="history_toggle_off">Chưa có xác nhận nào trong CSDL.</Empty>}
            {view.history.map((h) => (<p key={h.id} className="rg-row !py-2"><Pill tone={h.provenance === 'REAL_SOURCE' ? 'ok' : 'warn'}>{h.provenance}</Pill> · shared part <span className="font-mono">#{h.sharedPartId.slice(0, 8)}</span> · khiếm khuyết <span className="font-mono">#{h.defectId.slice(0, 8)}</span> · {h.confirmedAtUtc ? new Date(h.confirmedAtUtc).toLocaleString('vi-VN') : '—'} — {h.reason}</p>))}
          </div>
        </>
      )}
    </PanelShell>
  )
}
