import React, { useEffect, useState } from 'react'
import { retentionService } from '../../../api/services/retentionService'

interface Obligation { id?: string; warrantyId?: string; [key: string]: unknown }

/** Xác nhận căn cứ lưu trữ của một tệp: chọn nghĩa vụ bảo hành áp dụng (từ BE), nhập lý do, PUT …/retention/files/{id}/basis. */
export const RetentionBasisForm: React.FC<{ projectId: string; fileId: string }> = ({ projectId, fileId }) => {
  const [obligations, setObligations] = useState<{ id: string; label: string }[]>([])
  const [chosen, setChosen] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
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
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try {
      const view = await retentionService.confirmRetentionBasis(projectId, fileId, chosen, reason)
      setMessage(`Đã xác nhận căn cứ lưu trữ (phiên bản ${view?.revision ?? '—'}, phân loại ${view?.classification || '—'}).`); setReason('')
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { code?: string; title?: string } }; message?: string }
      setError(err.response ? `HTTP ${err.response.status} ${err.response.data?.code || err.response.data?.title || ''}` : err.message || 'Lỗi không xác định')
    } finally { setBusy(false) }
  }
  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  return (
    <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5 text-[11px]" data-testid="retention-basis-form">
      <p className="font-semibold">Xác nhận căn cứ lưu trữ</p>
      {obligations.length === 0 && <p className="text-slate-500">Tệp không có nghĩa vụ bảo hành áp dụng; xác nhận với danh sách rỗng.</p>}
      {obligations.map((o) => (<label key={o.id} className="flex items-start gap-1"><input type="checkbox" disabled={busy} checked={chosen.includes(o.id)} onChange={() => toggle(o.id)} /><span className="break-all">{o.id}</span></label>))}
      <textarea aria-label="Lý do xác nhận căn cứ lưu trữ" rows={2} maxLength={1000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className="w-full border border-slate-200 rounded-lg p-2" />
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
      <button type="button" disabled={busy || !reason.trim()} onClick={() => { void submit() }} className="border border-slate-200 rounded-lg px-3 py-1.5">{busy ? 'Đang gửi…' : 'Xác nhận căn cứ'}</button>
    </div>
  )
}
