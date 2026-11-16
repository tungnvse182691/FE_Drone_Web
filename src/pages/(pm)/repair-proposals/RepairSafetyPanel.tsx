import React, { useEffect, useState } from 'react'
import { repairSafetyService, type CoverageScope, type SafetyView } from '../../../api/services/repairSafetyService'
import { fastTrackService } from '../../../api/services/fastTrackService'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { exportError } from '../../../api/services/projectExportService'

/**
 * PM giao biện pháp an toàn thi công cho Crew đang thi công hạng mục Normal; xem lại biện pháp theo mã.
 * Lắp đặt, kiểm tra và xác nhận cảnh báo do Crew thực hiện trên mobile (ngoài phạm vi web).
 */
export const RepairSafetyPanel: React.FC<{ projectId: string; packageId: string; items: RepairItem[] }> = ({ projectId, packageId, items }) => {
  const normal = items.filter((i) => i.mode === 'Normal' && !['Confirmed', 'Cancelled'].includes(i.state))
  const [itemId, setItemId] = useState('')
  const [scopes, setScopes] = useState<CoverageScope[]>([])
  const [crews, setCrews] = useState<{ id: string; name: string }[]>([])
  const [safetyId, setSafetyId] = useState('')
  const [crewId, setCrewId] = useState('')
  const [schedule, setSchedule] = useState('')
  const [replacement, setReplacement] = useState('')
  const [removal, setRemoval] = useState('')
  const [reason, setReason] = useState('')
  const [measureId, setMeasureId] = useState('')
  const [view, setView] = useState<SafetyView | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!normal.length) return
    let alive = true
    Promise.all([repairSafetyService.scopes(projectId), fastTrackService.getCrews(projectId)])
      .then(([s, c]) => { if (alive) { setScopes(s); setCrews(c.map((x) => ({ id: x.id, name: x.name }))) } })
      .catch((e) => { if (alive) setError(`Không đọc được dữ liệu cho biện pháp an toàn: ${exportError(e)}`) })
    return () => { alive = false }
  }, [projectId, normal.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!normal.length) return null
  const item = normal.find((i) => i.id === itemId)
  const options = scopes.filter((s) => s.obligationId !== item?.obligationId)
  const run = async (fn: () => Promise<SafetyView>, done: string) => {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { const v = await fn(); setView(v); setMeasureId(v.id); setMessage(done) } catch (e) { setError(exportError(e)) } finally { setBusy(false) }
  }
  const cls = 'w-full border rounded-lg p-2'

  return (
    <div className="space-y-2 text-xs border-t pt-3 mt-3" data-testid="repair-safety-panel">
      <p className="font-semibold">Biện pháp an toàn thi công</p>
      <select aria-label="Hạng mục giao biện pháp an toàn" value={itemId} disabled={busy} onChange={(e) => setItemId(e.target.value)} className={cls}>
        <option value="">Chọn hạng mục đang thi công</option>
        {normal.map((i) => (<option key={i.id} value={i.id}>{i.state} · {i.id.slice(0, 8).toUpperCase()}</option>))}
      </select>
      {item && (
        <>
          <select aria-label="Nghĩa vụ an toàn tạm thời" value={safetyId} disabled={busy} onChange={(e) => setSafetyId(e.target.value)} className={cls}>
            <option value="">Chọn nghĩa vụ an toàn tạm thời</option>
            {options.map((s) => (<option key={s.obligationId} value={s.obligationId}>#{s.obligationId.slice(0, 8)} · lý trình {s.from}–{s.to}</option>))}
          </select>
          <select aria-label="Crew phụ trách biện pháp an toàn" value={crewId} disabled={busy} onChange={(e) => setCrewId(e.target.value)} className={cls}>
            <option value="">Chọn Crew đang được giao hạng mục</option>
            {crews.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <textarea aria-label="Lịch kiểm tra an toàn" rows={2} disabled={busy} value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Lịch kiểm tra" className={cls} />
          <textarea aria-label="Điều kiện thay thế" rows={2} disabled={busy} value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="Điều kiện thay thế biện pháp" className={cls} />
          <textarea aria-label="Điều kiện gỡ bỏ" rows={2} disabled={busy} value={removal} onChange={(e) => setRemoval(e.target.value)} placeholder="Điều kiện gỡ bỏ biện pháp" className={cls} />
          <textarea aria-label="Lý do giao biện pháp an toàn" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={cls} />
          <button type="button" disabled={busy || !safetyId || !crewId || !schedule.trim() || !replacement.trim() || !removal.trim() || !reason.trim()} onClick={() => {
            void run(() => repairSafetyService.create(projectId, packageId, item.id, { formalRepairObligationId: item.obligationId, safetyObligationId: safetyId, responsibleActorId: crewId, checkSchedule: schedule, replacementCondition: replacement, removalCondition: removal, reason }), 'Đã giao biện pháp an toàn cho Crew.')
          }} className="border rounded-lg px-3 py-2">{busy ? 'Đang gửi…' : 'Giao biện pháp an toàn'}</button>
        </>
      )}
      <div className="flex gap-2">
        <input aria-label="Mã biện pháp an toàn" disabled={busy || !itemId} value={measureId} onChange={(e) => setMeasureId(e.target.value)} placeholder="Mã biện pháp an toàn (GUID)" className={cls} />
        <button type="button" disabled={busy || !itemId || !measureId.trim()} onClick={() => { void run(() => repairSafetyService.read(projectId, packageId, itemId, measureId), 'Đã đọc biện pháp an toàn.') }} className="border rounded-lg px-3 py-2 whitespace-nowrap">Xem biện pháp</button>
      </div>
      {view && (
        <div data-testid="safety-view" className="rounded-xl border p-3 space-y-1">
          <p>Biện pháp #{view.id.slice(0, 8)} · Crew {view.responsibleActorId.slice(0, 8)} · lắp đặt {view.installedAt ? new Date(view.installedAt).toLocaleString('vi-VN') : 'chưa lắp'} · hạn kiểm tra đầu {view.firstCheckDueAt ? new Date(view.firstCheckDueAt).toLocaleString('vi-VN') : '—'}</p>
          <p>Lần kiểm tra: {view.checks?.length ?? 0} · cảnh báo: {view.warnings?.length ?? 0} · xác nhận cảnh báo: {view.acknowledgements?.length ?? 0}</p>
        </div>
      )}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
    </div>
  )
}
