import React, { useCallback, useEffect, useState } from 'react'
import { lifecycleRenewService, type LifecycleView } from '../../../api/services/lifecycleRenewService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, KV, Loading, PanelButton, PanelShell, SectionTitle } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

/** Giám sát: gia hạn phạm vi xử lý sau khi dự án đã đóng vận hành. Dữ liệu vòng đời đọc từ BE. */
export const ProjectRenewScopeCard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [view, setView] = useState<LifecycleView | null>(null)
  const [closureId, setClosureId] = useState('')
  const [scope, setScope] = useState('')
  const [basis, setBasis] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setError('')
    try { setView(await lifecycleRenewService.read(projectId)) } catch (e) { setError(exportError(e)) }
  }, [projectId])
  useEffect(() => { void load() }, [load])

  const closures = view ? lifecycleRenewService.closures(view) : []
  const submit = async () => {
    if (!view || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      await lifecycleRenewService.renew(projectId, view, { operationalClosureId: closureId, reason, handlingScope: scope, basis })
      setMessage('Đã ghi nhận gia hạn phạm vi xử lý.'); setScope(''); setBasis(''); setReason(''); await load()
    } catch (e) { setError(exportError(e)) } finally { setBusy(false); guard.release() }
  }
  const cls = 'rg-field w-full'

  return (
    <PanelShell icon="event_repeat" title="Gia hạn phạm vi xử lý sau đóng vận hành" className="!p-5 !rounded-[16px]" data-testid="project-renew-scope">
      <Feedback error={error} message={message} />
      {!view && !error && <Loading />}
      {view && (
        <div className="rg-subcard">
          <KV items={[
            { k: 'Đóng vận hành', v: String(view.operationalClosure) },
            { k: 'Bản ghi lịch sử', v: view.history.length },
          ]} />
        </div>
      )}
      {view && closures.length === 0 && <Empty icon="event_busy">Dự án chưa có bản ghi đóng vận hành, chưa thể gia hạn phạm vi xử lý.</Empty>}
      {closures.length > 0 && (
        <>
          <div className="rg-grid">
            <Field label="Bản ghi đóng vận hành">
              <select aria-label="Bản ghi đóng vận hành" value={closureId} disabled={busy} onChange={(e) => setClosureId(e.target.value)} className={cls}>
                <option value="">Chọn bản ghi đóng vận hành</option>
                {closures.map((c) => (<option key={c.id} value={c.id}>#{c.id.slice(0, 8)} · {c.recordedAtUtc ? new Date(c.recordedAtUtc).toLocaleString('vi-VN') : '—'}</option>))}
              </select>
            </Field>
            <Field label="Phạm vi xử lý gia hạn" span="col-span-12 lg:col-span-4"><textarea aria-label="Phạm vi xử lý gia hạn" rows={2} maxLength={4000} disabled={busy} value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Phạm vi xử lý" className={cls} /></Field>
            <Field label="Căn cứ gia hạn" span="col-span-12 lg:col-span-4"><textarea aria-label="Căn cứ gia hạn" rows={2} maxLength={2000} disabled={busy} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Căn cứ" className={cls} /></Field>
            <Field label="Lý do gia hạn" span="col-span-12 lg:col-span-4"><textarea aria-label="Lý do gia hạn" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={cls} /></Field>
          </div>
          <div className="rg-footer">
            <PanelButton variant="primary" loading={busy} disabled={busy || !closureId || !scope.trim() || !basis.trim() || !reason.trim()} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Xác nhận gia hạn'}</PanelButton>
          </div>
        </>
      )}
      {view && view.history.length > 0 && (
        <div data-testid="lifecycle-history" className="space-y-2">
          <SectionTitle icon="history">Lịch sử vòng đời</SectionTitle>
          <div className="space-y-1.5">
            {view.history.map((h) => (<p key={h.id} className="rg-row !py-2">{String(h.kind)} · {h.recordedAtUtc ? new Date(h.recordedAtUtc).toLocaleString('vi-VN') : '—'}{h.reason ? ` — ${h.reason}` : ''}{h.handlingScope ? ` · phạm vi: ${h.handlingScope}` : ''}</p>))}
          </div>
        </div>
      )}
    </PanelShell>
  )
}
