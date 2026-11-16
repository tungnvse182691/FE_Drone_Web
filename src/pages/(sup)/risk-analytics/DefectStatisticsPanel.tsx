import React, { useCallback, useEffect, useState } from 'react'
import { defectStatisticsService, type DefectStatisticsView } from '../../../api/services/defectStatisticsService'
import { exportError } from '../../../api/services/projectExportService'

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
    if (!view || !scope || busy) return
    setBusy(true); setError(''); setMessage('')
    try {
      await defectStatisticsService.confirm(projectId, view, { scope, sharedPartId, segmentIds: segments, measurementIds: measurements, provenance, reason })
      setMessage('Đã xác nhận thống kê khiếm khuyết.'); setReason(''); await load()
    } catch (e) { setError(exportError(e)) } finally { setBusy(false) }
  }
  const cls = 'border border-[#E2E5E9] rounded-lg p-2 text-xs'
  const myMeasurements = view?.measurements.filter((m) => m.defectId === scope?.defectId) || []

  return (
    <section className="bg-white rounded-[16px] border border-[#E2E5E9] p-5 space-y-3 text-xs" data-testid="defect-statistics-panel">
      <div className="flex items-center gap-3">
        <h3 className="font-bold text-base text-[#1A1D20]">Xác nhận thống kê khiếm khuyết</h3>
        <button type="button" disabled={loading} onClick={() => { void load() }} className={cls}>{loading ? 'Đang tải…' : 'Tải lại'}</button>
      </div>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
      {view && (
        <>
          <p>Khiếm khuyết riêng biệt {view.statistics.projectDistinctDefects} · đã khớp {view.statistics.matchedDistinctDefects} · shared part {view.statistics.sharedParts} · chưa ánh xạ {view.statistics.unmappedDefects}{view.statistics.missingReasons?.length ? ` · thiếu: ${view.statistics.missingReasons.join(', ')}` : ''}</p>
          {view.scopes.length === 0 && <p className="text-slate-500">Không có phạm vi nghĩa vụ nào trong CSDL.</p>}
          {scope && (
            <div className="space-y-2 rounded-xl border border-[#E2E5E9] p-3">
              <select aria-label="Phạm vi nghĩa vụ" value={scopeIdx} disabled={busy} onChange={(e) => { setScopeIdx(Number(e.target.value)); setMeasurements([]) }} className={`${cls} w-full`}>
                {view.scopes.map((s, i) => (<option key={s.obligationId} value={i}>Khiếm khuyết #{s.defectId.slice(0, 8)} · lý trình {s.from}–{s.to} (+{s.offsetFrom}…{s.offsetTo})</option>))}
              </select>
              <p className="font-semibold">Phân đoạn</p>
              <div className="flex flex-wrap gap-3">{view.segments.filter((s) => s.routeVersionId === scope.routeVersionId).map((s) => (<label key={s.id} className="flex items-center gap-1"><input type="checkbox" disabled={busy} checked={segments.includes(s.id)} onChange={() => toggle(segments, s.id, setSegments)} />#{s.id.slice(0, 8)}</label>))}</div>
              <p className="font-semibold">Phép đo của khiếm khuyết</p>
              {myMeasurements.length === 0 && <p className="text-slate-500">Khiếm khuyết chưa có phép đo.</p>}
              <div className="flex flex-wrap gap-3">{myMeasurements.map((m) => (<label key={m.id} className="flex items-center gap-1"><input type="checkbox" disabled={busy} checked={measurements.includes(m.id)} onChange={() => toggle(measurements, m.id, setMeasurements)} />{m.type} {m.valueState === 'KNOWN' ? `${m.value} ${m.unit || ''}` : `(${m.unknownReason || 'chưa rõ'})`}</label>))}</div>
              <div className="flex flex-wrap gap-2">
                <input aria-label="Mã shared part" value={sharedPartId} disabled={busy} onChange={(e) => setSharedPartId(e.target.value)} placeholder="sharedPartId (GUID)" className={`${cls} flex-1`} />
                <select aria-label="Nguồn thống kê" value={provenance} disabled={busy} onChange={(e) => setProvenance(e.target.value as 'TEST_ONLY' | 'REAL_SOURCE')} className={cls}><option value="REAL_SOURCE">REAL_SOURCE</option><option value="TEST_ONLY">TEST_ONLY</option></select>
              </div>
              {view.history.length > 0 && <p>Shared part đã xác nhận: {Array.from(new Set(view.history.map((h) => h.sharedPartId))).map((id) => id.slice(0, 8)).join(', ')} (nhập lại mã đầy đủ để dùng tiếp)</p>}
              <textarea aria-label="Lý do xác nhận thống kê" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={`${cls} w-full`} />
              <button type="button" disabled={busy || !reason.trim() || !sharedPartId.trim() || segments.length === 0} onClick={() => { void submit() }} className={cls}>{busy ? 'Đang gửi…' : 'Xác nhận thống kê'}</button>
            </div>
          )}
          <div data-testid="defect-statistics-history">
            <p className="font-semibold">Lịch sử xác nhận ({view.history.length})</p>
            {view.history.length === 0 && <p className="text-slate-500">Chưa có xác nhận nào trong CSDL.</p>}
            {view.history.map((h) => (<p key={h.id}>{h.provenance} · shared part #{h.sharedPartId.slice(0, 8)} · khiếm khuyết #{h.defectId.slice(0, 8)} · {h.confirmedAtUtc ? new Date(h.confirmedAtUtc).toLocaleString('vi-VN') : '—'} — {h.reason}</p>))}
          </div>
        </>
      )}
    </section>
  )
}
