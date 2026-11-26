import React, { useEffect, useState } from 'react'
import { reportMatchingService, matchingError, type MatchingLocationView } from '../../../api/services/reportMatchingService'
import { useAuthStore } from '../../../store/authStore'

export interface MatchRow { defectId: string; version?: string | null; distanceMeters?: number | null; accuracyMeters?: number | null; distanceStatus?: string | null; distanceMethod?: string | null; overlapStatus?: string | null; reasonCodes?: string[] | null; historySummary?: { sourceLinkCount?: number } | null }
const STATUS_LABEL: Record<string, string> = { GPS_MISSING: 'Ảnh thiếu GPS', GPS_UNCONFIRMED: 'Có GPS nhưng PM chưa xác nhận', GPS_CONFIRMED: 'PM đã xác nhận GPS ảnh', SCOPE_CONFIRMED: 'PM đã xác nhận phạm vi segment', MATCHING_LOCATION_STALE: 'Cần xác nhận lại vị trí' }

// B1: matching-location confirmation and explicit project-wide candidate search.
export function ReportMatchingPanel({ projectId, reportId, evidenceId, matches, loading, error, expanded, onExpand, onChanged }: {
  projectId: string; reportId: string; evidenceId: string | null; sourceVersion?: string; geometryVersion?: string
  matches?: MatchRow[]; loading: boolean; error?: string; expanded: boolean; onExpand: () => void; onChanged: () => void
}) {
  const epoch = useAuthStore(s => s.authEpoch)
  const scope = `${epoch}:${projectId}:${reportId}`
  const [view, setView] = useState<{ scope: string; data?: MatchingLocationView; error?: string } | null>(null), [reload, setReload] = useState(0)
  const [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [ok, setOk] = useState('')
  useEffect(() => {
    const c = new AbortController(); setView(null); setReason(''); setErr(''); setOk('')
    reportMatchingService.read(projectId, reportId, c.signal).then(data => { if (!c.signal.aborted) setView({ scope, data }) }).catch(e => { if (!c.signal.aborted) setView({ scope, error: matchingError(e) }) })
    return () => c.abort()
  }, [scope, reload])
  const v = view?.scope === scope ? view : null
  let pending: ReturnType<typeof reportMatchingService.pending> = null, journalError = ''
  try { pending = reportMatchingService.pending(projectId, reportId) } catch (e) { journalError = (e as Error).message }
  const target = v?.data?.evidence.find(e => e.evidenceId === evidenceId)
  const hasGps = !!target && target.latitude != null && target.longitude != null
  const confirm = async (replay = false) => {
    if (busy) return
    setBusy(true); setErr(''); setOk('')
    try {
      const held = reportMatchingService.pending(projectId, reportId)
      const input = replay && held ? held.body : { sourceVersion: v!.data!.sourceVersion, geometryVersion: v!.data!.geometryVersion, evidenceId, segmentIds: [], reason }
      const fresh = await reportMatchingService.confirm(projectId, reportId, input)
      setView({ scope, data: fresh }); setOk('Đã lưu xác nhận vị trí ảnh và đọc lại từ máy chủ.'); onChanged()
    } catch (e) { setErr(matchingError(e)); setReload(n => n) } finally { setBusy(false) }
  }
  const refs = matches || []
  return <div className="rounded-lg border border-slate-200 bg-white p-2 space-y-2" data-testid="matching-panel">
    <p className="font-semibold text-slate-800">Đối chiếu khiếm khuyết đã có</p>
    {!v && <p role="status" className="text-slate-500">Đang đọc xác nhận vị trí…</p>}
    {v?.error && <p role="alert" className="text-rose-700">{v.error} <button type="button" className="underline" onClick={() => setReload(n => n + 1)}>Thử lại</button></p>}
    {v?.data && <>
      <p data-testid="matching-status" className="text-slate-600">{STATUS_LABEL[v.data.status] || 'Chưa xác nhận vị trí'}</p>
      {hasGps && !pending && v.data.confirmation?.evidenceId !== evidenceId && <div className="space-y-1">
        <input aria-label="Lý do xác nhận vị trí ảnh" value={reason} maxLength={1000} onChange={e => setReason(e.target.value)} placeholder="Lý do xác nhận vị trí ảnh" className="rg-field w-full" />
        <button type="button" disabled={busy || !reason.trim()} onClick={() => confirm(false)} className="rg-btn text-xs">{busy ? 'Đang gửi…' : 'Xác nhận vị trí ảnh'}</button>
      </div>}
      {pending && <p role="status" className="text-amber-800">Có lệnh xác nhận chưa rõ kết quả{pending.rejected ? ' (đã bị từ chối)' : ''}. <button type="button" className="underline" disabled={busy} onClick={() => { if (pending!.rejected) { reportMatchingService.discardRejected(projectId, reportId); setReload(n => n + 1) } else void confirm(true) }}>{pending.rejected ? 'Bỏ lệnh bị từ chối' : 'Gửi lại nguyên vẹn'}</button></p>}
    </>}
    {journalError && <p role="alert" className="text-rose-700">{journalError}</p>}
    {err && <p role="alert" className="text-rose-700">{err}</p>}{ok && <p role="status" className="text-emerald-700">{ok}</p>}
    <div className="border-t pt-2 space-y-1" data-testid="matching-results">
      <div className="flex items-center justify-between gap-2">
        <p className="text-slate-600">{expanded ? 'Đã tìm toàn dự án' : 'Khiếm khuyết trong phạm vi đối chiếu'}</p>
        {!expanded && <button type="button" disabled={loading} onClick={onExpand} className="rg-btn text-xs" data-testid="matching-expand">Tìm trong dự án</button>}
      </div>
      {loading && <p role="status" className="text-slate-500">Đang tìm khiếm khuyết…</p>}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {!loading && !error && <p data-testid={refs.length === 0 ? 'matching-empty' : undefined} className="text-slate-600">{refs.length ? `Có ${refs.length} khiếm khuyết để đối chiếu. Chọn “Gắn vào khiếm khuyết đã có” bên dưới để liên kết.` : 'Chưa tìm thấy khiếm khuyết trong phạm vi đã tìm.'}</p>}
    </div>
  </div>
}
