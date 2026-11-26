import React, { useEffect, useState } from 'react'
import { retentionService } from '../../../api/services/retentionService'
import { Empty, Feedback, Field, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

interface Obligation { id?: string; warrantyId?: string; [key: string]: unknown }

/** Xác nhận căn cứ lưu trữ của một tệp: chọn nghĩa vụ bảo hành áp dụng (từ BE), nhập lý do, PUT …/retention/files/{id}/basis. */
export const RetentionBasisForm: React.FC<{ projectId: string; fileId: string }> = ({ projectId, fileId }) => {
  const [obligations, setObligations] = useState<{ id: string; label: string }[]>([])
  const [chosen, setChosen] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let alive = true
    retentionService.getRetentionFile(projectId, fileId).then((f) => {
      if (!alive) return
      const rows = (f.applicableObligations || []) as Obligation[]
      setObligations(rows.map((o) => ({ id: String(o.warrantyId || o.id || ''), label: JSON.stringify(o) })).filter((o) => o.id))
    }).catch((e) => { if (alive) setError(e?.response ? `HTTP ${e.response.status} ${e.response.data?.code || ''}` : e.message) })
    return () => { alive = false }
  }, [projectId, fileId])

  const submit = async () => {
    if (!guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const view = await retentionService.confirmRetentionBasis(projectId, fileId, chosen, reason)
      setMessage(`Đã xác nhận căn cứ lưu trữ (phiên bản ${view?.revision ?? '—'}, phân loại ${view?.classification || '—'}).`); setReason('')
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { code?: string; title?: string } }; message?: string }
      setError(err.response ? `HTTP ${err.response.status} ${err.response.data?.code || err.response.data?.title || ''}` : err.message || 'Lỗi không xác định')
    } finally { setBusy(false); guard.release() }
  }
  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  return (
    <PanelShell as="div" icon="verified_user" title="Xác nhận căn cứ lưu trữ" className="mt-3" data-testid="retention-basis-form">
      {obligations.length === 0 && <Empty icon="shield">Tệp không có nghĩa vụ bảo hành áp dụng; xác nhận với danh sách rỗng.</Empty>}
      {obligations.length > 0 && (
        <div className="space-y-1.5">
          {obligations.map((o) => (<label key={o.id} className={`rg-row flex cursor-pointer items-start gap-2 !py-2 ${chosen.includes(o.id) ? '!border-brand-navy' : ''}`}><input type="checkbox" className="mt-0.5 accent-brand-navy" disabled={busy} checked={chosen.includes(o.id)} onChange={() => toggle(o.id)} /><span className="break-all font-mono">{o.id}</span></label>))}
        </div>
      )}
      <Field label="Lý do xác nhận căn cứ lưu trữ"><textarea aria-label="Lý do xác nhận căn cứ lưu trữ" rows={2} maxLength={1000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className="rg-field w-full" /></Field>
      <Feedback error={error} message={message} />
      <div className="rg-footer">
        <PanelButton variant="primary" loading={busy} disabled={busy || !reason.trim()} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Xác nhận căn cứ'}</PanelButton>
      </div>
    </PanelShell>
  )
}
