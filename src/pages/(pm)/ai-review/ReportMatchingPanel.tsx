import React, { useEffect, useState } from 'react'
import { reportMatchingService, matchingError, type MatchingLocationView } from '../../../api/services/reportMatchingService'
import { useAuthStore } from '../../../store/authStore'

export interface MatchRow { defectId: string; version?: string | null; distanceMeters?: number | null; accuracyMeters?: number | null; distanceStatus?: string | null; distanceMethod?: string | null; overlapStatus?: string | null; reasonCodes?: string[] | null; historySummary?: { sourceLinkCount?: number } | null }
const STATUS_LABEL: Record<string, string> = { GPS_MISSING: 'Ảnh thiếu GPS', GPS_UNCONFIRMED: 'Có GPS nhưng PM chưa xác nhận', GPS_CONFIRMED: 'PM đã xác nhận GPS ảnh', SCOPE_CONFIRMED: 'PM đã xác nhận phạm vi segment', MATCHING_LOCATION_STALE: 'Xác nhận cũ đã stale (không dùng cho thứ tự matching)' }
const m = (v?: number | null) => typeof v === 'number' && Number.isFinite(v) ? `${v.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} m` : null

// B1: xác nhận vị trí (matching-location) + tìm mở rộng cùng dự án + hiển thị distance/overlap/accuracy đúng như máy chủ trả.
export function ReportMatchingPanel({ projectId, reportId, evidenceId, sourceVersion, geometryVersion, matches, loading, error, expanded, onExpand, onChanged }: {
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
    <p className="font-semibold text-slate-800">Matching Defect cùng dự án (Report → Defect)</p>
    {!v && <p role="status" className="text-slate-500">Đang đọc xác nhận vị trí…</p>}
    {v?.error && <p role="alert" className="text-rose-700">{v.error} <button type="button" className="underline" onClick={() => setReload(n => n + 1)}>Thử lại</button></p>}
    {v?.data && <>
      <p data-testid="matching-status">Trạng thái vị trí nguồn: <b>{STATUS_LABEL[v.data.status] || v.data.status}</b>{v.data.confirmation ? ` · xác nhận #${v.data.confirmation.sequence} lúc ${v.data.confirmation.confirmedAt}` : ''}</p>
      {v.data.status === 'GPS_MISSING' && <p className="text-slate-600">Không tự chọn/giả GPS. Tìm toàn dự án bên dưới là tìm mở rộng rõ ràng, không thay thế xác nhận vị trí.</p>}
      {evidenceId && <p className="text-slate-600">Ảnh đang chọn {evidenceId.slice(0, 8)}: {hasGps ? `GPS ${target!.latitude}, ${target!.longitude}${target!.accuracyMeters != null ? ` · sai số ${target!.accuracyMeters} m` : ' · sai số chưa có (UNKNOWN)'}` : 'không có GPS đã lưu'}</p>}
      {hasGps && !pending && v.data.confirmation?.evidenceId !== evidenceId && <div className="space-y-1">
        <input aria-label="Lý do xác nhận vị trí ảnh" value={reason} maxLength={1000} onChange={e => setReason(e.target.value)} placeholder="Lý do xác nhận GPS của ảnh này cho matching" className="rg-field w-full" />
        <button type="button" disabled={busy || !reason.trim()} onClick={() => confirm(false)} className="rg-btn text-xs">{busy ? 'Đang gửi…' : 'Xác nhận GPS ảnh này cho matching'}</button>
      </div>}
      {pending && <p role="status" className="text-amber-800">Có lệnh xác nhận chưa rõ kết quả{pending.rejected ? ' (đã bị từ chối)' : ''}. <button type="button" className="underline" disabled={busy} onClick={() => { if (pending!.rejected) { reportMatchingService.discardRejected(projectId, reportId); setReload(n => n + 1) } else void confirm(true) }}>{pending.rejected ? 'Bỏ lệnh bị từ chối' : 'Gửi lại nguyên vẹn'}</button></p>}
    </>}
    {journalError && <p role="alert" className="text-rose-700">{journalError}</p>}
    {err && <p role="alert" className="text-rose-700">{err}</p>}{ok && <p role="status" className="text-emerald-700">{ok}</p>}
    <div className="border-t pt-2 space-y-1" data-testid="matching-results">
      <div className="flex items-center justify-between gap-2"><p className="font-semibold">Ứng viên Defect ({expanded ? 'đã tìm mở rộng toàn dự án' : 'segment đã xác nhận + lân cận; chưa tìm mở rộng'})</p>
        {!expanded && <button type="button" disabled={loading} onClick={onExpand} className="rg-btn text-xs" data-testid="matching-expand">Tìm mở rộng toàn dự án</button>}</div>
      {loading && <p role="status" className="text-slate-500">Đang đọc đủ các trang ứng viên…</p>}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {!loading && !error && refs.length === 0 && <p data-testid="matching-empty" className="text-slate-600">{expanded ? 'Đã tìm mở rộng: không có ứng viên Defect nào (không phải lỗi). Không tự gộp/gắn.' : 'Chưa có ứng viên ở phạm vi hiện tại. Chưa tìm mở rộng — bấm "Tìm mở rộng toàn dự án" nếu muốn tìm thêm.'}</p>}
      <ul className="space-y-1">{refs.map(x => <li key={x.defectId} data-testid="matching-item" className="border rounded p-1.5">
        <b>#DEF-{x.defectId.slice(0, 8).toUpperCase()}</b> · Khoảng cách: {m(x.distanceMeters) ?? 'Chưa tính được'}{x.distanceStatus ? ` (${x.distanceStatus}${x.distanceMethod ? ` · ${x.distanceMethod}` : ''})` : ''} · Chồng lấn sai số: {x.overlapStatus || 'UNKNOWN'} · Sai số nguồn: {m(x.accuracyMeters) ?? 'Chưa có (UNKNOWN)'}
        {x.reasonCodes?.length ? <span className="block text-slate-500">Lý do: {x.reasonCodes.join(', ')}</span> : null}
        {typeof x.historySummary?.sourceLinkCount === 'number' ? <span className="block text-slate-500">Số nguồn đã liên kết với Defect này (máy chủ): {x.historySummary.sourceLinkCount}</span> : null}</li>)}</ul>
      <p className="text-slate-500">Khoảng cách đo được không chứng minh hai hồ sơ cùng hư hỏng; UNKNOWN/null không phải false hay 0. Gắn Defect chỉ khi PM chọn rõ ở "Gắn vào khiếm khuyết đã có".</p>
      {sourceVersion && geometryVersion && <p className="text-[10px] text-slate-400 break-all">Nguồn {sourceVersion} · hình học {geometryVersion.slice(0, 12)}…</p>}
    </div>
  </div>
}
