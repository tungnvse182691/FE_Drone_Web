import React, { useCallback, useEffect, useState } from 'react'
import { lifecycleRenewService, type LifecycleView } from '../../../api/services/lifecycleRenewService'
import { exportError } from '../../../api/services/projectExportService'

/** Giám sát: gia hạn phạm vi xử lý sau khi dự án đã đóng vận hành. Dữ liệu vòng đời đọc từ BE. */
export const ProjectRenewScopeCard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [view, setView] = useState<LifecycleView | null>(null)
  const [closureId, setClosureId] = useState('')
  const [scope, setScope] = useState('')
  const [basis, setBasis] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setError('')
    try { setView(await lifecycleRenewService.read(projectId)) } catch (e) { setError(exportError(e)) }
  }, [projectId])
  useEffect(() => { void load() }, [load])

  const closures = view ? lifecycleRenewService.closures(view) : []
  const submit = async () => {
    if (!view || busy) return
    setBusy(true); setError(''); setMessage('')
    try {
      await lifecycleRenewService.renew(projectId, view, { operationalClosureId: closureId, reason, handlingScope: scope, basis })
      setMessage('Đã ghi nhận gia hạn phạm vi xử lý.'); setScope(''); setBasis(''); setReason(''); await load()
    } catch (e) { setError(exportError(e)) } finally { setBusy(false) }
  }
  const cls = 'border border-[#E2E5E9] rounded-lg p-2 text-xs w-full'

  return (
    <section className="bg-white rounded-[16px] border border-[#E2E5E9] p-5 space-y-2 text-xs" data-testid="project-renew-scope">
      <h3 className="font-bold text-sm text-[#1A1D20]">Gia hạn phạm vi xử lý sau đóng vận hành</h3>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
      {view && <p>Đóng vận hành: <b>{view.operationalClosure}</b> · bản ghi lịch sử: {view.history.length}</p>}
      {view && closures.length === 0 && <p className="text-slate-500">Dự án chưa có bản ghi đóng vận hành, chưa thể gia hạn phạm vi xử lý.</p>}
      {closures.length > 0 && (
        <div className="space-y-2">
          <select aria-label="Bản ghi đóng vận hành" value={closureId} disabled={busy} onChange={(e) => setClosureId(e.target.value)} className={cls}>
            <option value="">Chọn bản ghi đóng vận hành</option>
            {closures.map((c) => (<option key={c.id} value={c.id}>#{c.id.slice(0, 8)} · {c.recordedAtUtc ? new Date(c.recordedAtUtc).toLocaleString('vi-VN') : '—'}</option>))}
          </select>
          <textarea aria-label="Phạm vi xử lý gia hạn" rows={2} maxLength={4000} disabled={busy} value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Phạm vi xử lý" className={cls} />
          <textarea aria-label="Căn cứ gia hạn" rows={2} maxLength={2000} disabled={busy} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Căn cứ" className={cls} />
          <textarea aria-label="Lý do gia hạn" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={cls} />
          <button type="button" disabled={busy || !closureId || !scope.trim() || !basis.trim() || !reason.trim()} onClick={() => { void submit() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy ? 'Đang gửi…' : 'Xác nhận gia hạn'}</button>
        </div>
      )}
      {view && view.history.length > 0 && (
        <div data-testid="lifecycle-history" className="space-y-1">
          <p className="font-semibold">Lịch sử vòng đời</p>
          {view.history.map((h) => (<p key={h.id}>{String(h.kind)} · {h.recordedAtUtc ? new Date(h.recordedAtUtc).toLocaleString('vi-VN') : '—'}{h.reason ? ` — ${h.reason}` : ''}{h.handlingScope ? ` · phạm vi: ${h.handlingScope}` : ''}</p>))}
        </div>
      )}
    </section>
  )
}
