import React, { useEffect, useRef, useState } from 'react'
import { reportMatchingService, matchingError, type MatchingLocationView } from '../../../api/services/reportMatchingService'
import { useAuthStore } from '../../../store/authStore'

export interface MatchRow { detail?: {defectTypeCode?: string; status?: string; description?: string; roadSectionVersionId?: string; geometry?:{srid:number;wkt:string}}; detailError?: string; defectId: string; priorityGroup?: number | null; version?: string | null; distanceMeters?: number | null; accuracyMeters?: number | null; distanceStatus?: string | null; distanceMethod?: string | null; overlapStatus?: string | null; reasonCodes?: string[] | null; historySummary?: { sourceLinkCount?: number } | null }
const STATUS_LABEL: Record<string, string> = { GPS_MISSING: 'Ảnh thiếu GPS', GPS_UNCONFIRMED: 'Có GPS nhưng PM chưa xác nhận', GPS_CONFIRMED: 'PM đã xác nhận GPS ảnh', SCOPE_CONFIRMED: 'PM đã xác nhận phạm vi segment', MATCHING_LOCATION_STALE: 'Cần xác nhận lại vị trí' }

const DISTANCE_NOTE: Record<string,string> = {
  GPS_MISSING: 'Ảnh nguồn chưa có GPS để tính khoảng cách.',
  GPS_UNCONFIRMED: 'Vị trí ảnh nguồn chưa được PM xác nhận.',
  SCOPE_CONFIRMED: 'Đã xác nhận phạm vi đoạn tuyến nhưng chưa có tọa độ nguồn để tính khoảng cách.',
  MATCHING_LOCATION_STALE: 'Vị trí đã xác nhận cần được kiểm tra lại.',
  DISTANCE_SOURCE_UNAVAILABLE: 'Chưa đủ dữ liệu để tính khoảng cách.',
  TARGET_GEOMETRY_MISSING: 'Khiếm khuyết đích chưa có hình học để tính khoảng cách.',
  TARGET_GEOMETRY_INVALID: 'Hình học khiếm khuyết đích chưa hợp lệ để tính khoảng cách.',
  TARGET_CRS_CONTEXT_MISSING: 'Thiếu căn cứ hệ tọa độ của khiếm khuyết đích.',
  NATIVE_CRS_TRANSFORM_UNAVAILABLE: 'Chưa hỗ trợ chuyển hệ tọa độ của khiếm khuyết đích.',
  GEOGRAPHIC_GEOMETRY_UNSUPPORTED: 'Chưa hỗ trợ tính khoảng cách cho dạng hình học đích này.',
  TARGET_CRS_UNSUPPORTED: 'Chưa hỗ trợ hệ tọa độ của khiếm khuyết đích.',
  TARGET_COORDINATES_OUTSIDE_CRS_AREA: 'Tọa độ đích nằm ngoài phạm vi hệ tọa độ hỗ trợ.',
  SOURCE_OUTSIDE_SUPPORTED_CRS_AREA: 'Vị trí nguồn nằm ngoài phạm vi hệ tọa độ hỗ trợ.',
  DISTANCE_UNAVAILABLE: 'Chưa tính được khoảng cách hợp lệ.'
}
export function matchingExplanation(m: MatchRow): string[] {
  const reasons = m.reasonCodes || []
  const groups = [
    ['ASSIGNED_SEGMENT', 'Cùng đoạn tuyến với phạm vi nguồn đã xác nhận.'],
    ['NEIGHBOR_SEGMENT', 'Đoạn tuyến liền kề với phạm vi nguồn đã xác nhận.'],
    ['PROJECT_EXPANSION', 'Cùng dự án; chưa có căn cứ thuộc cùng đoạn hoặc đoạn liền kề.']
  ]
  const group = Number.isInteger(m.priorityGroup) ? groups[m.priorityGroup!] : undefined
  const notes = [group && reasons.includes(group[0]) ? group[1] : 'Chưa đủ thông tin để giải thích phạm vi đối chiếu của mục này.']
  if (m.distanceStatus === 'MEASURED' && typeof m.distanceMeters === 'number' && Number.isFinite(m.distanceMeters) && m.distanceMeters >= 0) {
    notes.push(`Khoảng cách theo máy chủ: ${m.distanceMeters.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} m.`)
  } else {
    const status = m.distanceStatus && DISTANCE_NOTE[m.distanceStatus]
    const reason = reasons.map(code => DISTANCE_NOTE[code]).find(Boolean)
    notes.push(status || reason || 'Chưa có khoảng cách được xác nhận; không suy ra là gần.')
  }
  if (reasons.includes('HISTORICAL_LINK')) notes.push('Máy chủ ghi nhận liên kết trước đó giữa phản ánh này và khiếm khuyết đích.')
  if (reasons.includes('ACCURACY_OVERLAP')) notes.push('Máy chủ ghi nhận vùng sai số chồng lấn; chưa phải kết luận trùng.')
  return notes
}

function pointLocation(geometry?: {srid:number;wkt:string}) {
  if(geometry?.srid!==4326)return null
  const point=/^POINT\s*\(\s*([+-]?[\d.eE]+)\s+([+-]?[\d.eE]+)\s*\)$/i.exec(geometry.wkt)
  if(!point)return null
  const lng=Number(point[1]),lat=Number(point[2])
  return Number.isFinite(lng)&&Number.isFinite(lat)&&Math.abs(lng)<=180&&Math.abs(lat)<=90?`${lat}, ${lng}`:null
}

// B1: matching-location confirmation and explicit project-wide candidate search.
export function ReportMatchingPanel({ projectId, reportId, evidenceId, sourceDescription, sourceReceivedAt, targetNames, typeNames, matches, loading, error, expanded, onExpand, onChanged }: {
  typeNames?:Record<string,string>; sourceDescription?: string; sourceReceivedAt?: string; targetNames?: Record<string,string>; projectId: string; reportId: string; evidenceId: string | null; sourceVersion?: string; geometryVersion?: string
  matches?: MatchRow[]; loading: boolean; error?: string; expanded: boolean; onExpand: () => void; onChanged: () => void
}) {
  const epoch = useAuthStore(s => s.authEpoch)
  const scope = `${epoch}:${projectId}:${reportId}`
  const activeScope = useRef(scope); activeScope.current = scope
  const [view, setView] = useState<{ scope: string; data?: MatchingLocationView; error?: string } | null>(null), [reload, setReload] = useState(0)
  const [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [ok, setOk] = useState('')
  useEffect(() => {
    const c = new AbortController(); setView(null); setReason(''); setErr(''); setOk(''); setBusy(false)
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
    const started = scope, active = () => activeScope.current === started && useAuthStore.getState().authEpoch === epoch
    setBusy(true); setErr(''); setOk('')
    try {
      const held = reportMatchingService.pending(projectId, reportId)
      const input = replay && held ? held.body : { sourceVersion: v!.data!.sourceVersion, geometryVersion: v!.data!.geometryVersion, evidenceId, segmentIds: [], reason }
      const fresh = await reportMatchingService.confirm(projectId, reportId, input)
      if (!active()) return
      setView({ scope, data: fresh }); setOk('Đã xác nhận vị trí ảnh. Chưa xác nhận trùng hoặc liên kết khiếm khuyết.'); onChanged()
    } catch (e) { if (active()) setErr(matchingError(e)) } finally { if (active()) setBusy(false) }
  }
  const refs = matches || []
  return <div className="rounded-lg border border-slate-200 bg-white p-2 space-y-2" data-testid="matching-panel">
    <p className="font-semibold text-slate-800">Đối chiếu khiếm khuyết đã có</p>
    <p>Phản ánh nguồn RPT-{reportId.slice(0,8).toUpperCase()}{sourceReceivedAt && Number.isFinite(Date.parse(sourceReceivedAt)) ? ` · ${new Date(sourceReceivedAt).toLocaleString('vi-VN', {timeZone:'Asia/Ho_Chi_Minh'})}` : ''}</p>
    {sourceDescription && <p className="whitespace-pre-wrap">{sourceDescription}</p>}
    {!v && <p role="status" className="text-slate-500">Đang đọc xác nhận vị trí…</p>}
    {v?.error && <p role="alert" className="text-rose-700">{v.error} <button type="button" className="underline" onClick={() => setReload(n => n + 1)}>Thử lại</button></p>}
    {v?.data && <>
      <p className="text-slate-600">Xác nhận vị trí ảnh chưa đồng nghĩa xác nhận trùng hoặc đã liên kết.</p>
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
        <p className="text-slate-600">{expanded ? 'Danh sách cùng dự án để đối chiếu thủ công, chưa xác nhận trùng.' : 'Đối chiếu theo phạm vi vị trí nguồn, chưa xác nhận trùng.'}</p>
        {!expanded && <button type="button" disabled={loading} onClick={onExpand} className="rg-btn text-xs" data-testid="matching-expand">Tìm trong dự án</button>}
      </div>
      {loading && <p role="status" className="text-slate-500">Đang tìm khiếm khuyết…</p>}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {!loading && !error && <>
        {!refs.length && <p data-testid="matching-empty">Chưa tìm thấy khiếm khuyết trong phạm vi đã tìm.</p>}
        {refs.map(m=><div key={m.defectId} className="space-y-1 border-t pt-2">
          <p className="font-semibold">Khiếm khuyết DEF-{m.defectId.slice(0,8).toUpperCase()}</p>
          {m.detailError && <p role="alert">{m.detailError}</p>}
          {m.detail?.description && <p>{m.detail.description}</p>}
          {m.detail?.defectTypeCode && <p>Loại: {typeNames?.[m.detail.defectTypeCode]||m.detail.defectTypeCode}</p>}
          {m.detail?.status && <p>Trạng thái: {m.detail.status}</p>}
          {pointLocation(m.detail?.geometry) && <p>Vị trí khiếm khuyết: {pointLocation(m.detail?.geometry)}</p>}
          {!m.detail?.description && !m.detailError && <p className="text-slate-500">Hồ sơ đọc được chưa cung cấp mô tả.</p>}
          {m.detail?.roadSectionVersionId && targetNames?.[m.detail.roadSectionVersionId] ? <p>Tuyến: {targetNames[m.detail.roadSectionVersionId]}</p> : !m.detailError && <p className="text-slate-500">Chưa có vị trí tuyến đọc được để hiển thị.</p>}
          {matchingExplanation(m).map(note => <p key={note} className="text-slate-600">{note}</p>)}
        </div>)}
      </>}
    </div>
  </div>
}
