import React, { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { Feedback, Field, Loading, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import type { RepairItem } from '../../../api/services/repairWorkflowService'

/**
 * PM nhập kế hoạch điều phối (không sửa phương án/checklist đã duyệt):
 * gói — GET/PUT /projects/{p}/repair-packages/{pkg}/planning {name,description,plannedDueAt,reason};
 * hạng mục — GET/PUT …/items/{item}/planning {plannedQuantity,plannedUnit,plannedMaterials,reason}. PUT cần If-Match của chính GET + Idempotency-Key.
 */
export const PlanningPanel: React.FC<{ projectId: string; packageId: string; items: RepairItem[]; onSaved?: () => void }> = ({ projectId, packageId, items, onSaved }) => {
  const [target, setTarget] = useState<string>('package') // 'package' | itemId
  const [etag, setEtag] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(''), [description, setDescription] = useState(''), [due, setDue] = useState('')
  const [qty, setQty] = useState(''), [unit, setUnit] = useState(''), [materials, setMaterials] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(''), [message, setMessage] = useState('')
  const guard = useSubmitGuard()
  const isPkg = target === 'package'
  const path = isPkg ? `/projects/${projectId}/repair-packages/${packageId}/planning` : `/projects/${projectId}/repair-packages/${packageId}/items/${target}/planning`

  const load = useCallback(async () => {
    setLoading(true); setError(''); setMessage(''); setEtag('')
    try {
      const r = await apiClient.get<any>(path)
      const v = (r.headers.etag as string | undefined) || (r.data?.version ? `"${r.data.version}"` : '')
      if (!v) throw new Error('BE không trả phiên bản kế hoạch.')
      setEtag(v)
      if (isPkg) { setName(r.data.name || ''); setDescription(r.data.description || ''); setDue(r.data.plannedDueAt ? String(r.data.plannedDueAt).slice(0, 10) : '') }
      else { setQty(r.data.plannedQuantity != null ? String(r.data.plannedQuantity) : ''); setUnit(r.data.plannedUnit || ''); setMaterials(r.data.plannedMaterials || '') }
    } catch (e) { setError(`Không đọc được kế hoạch: ${exportError(e)}`) } finally { setLoading(false) }
  }, [path, isPkg])
  useEffect(() => { void load() }, [load])

  const problem = (() => {
    if (!reason.trim()) return 'Cần nhập lý do.'
    if (isPkg) { if (name.length > 255) return 'Tên gói tối đa 255 ký tự.'; if (description.length > 4000) return 'Mô tả tối đa 4.000 ký tự.'; return '' }
    const q = qty.trim()
    if (!!q !== !!unit.trim()) return 'Khối lượng và đơn vị phải nhập cùng nhau (hoặc bỏ trống cả hai để xóa).'
    if (q && !(Number(q) > 0 && /^\d+(\.\d{1,6})?$/.test(q))) return 'Khối lượng phải > 0, tối đa 6 số lẻ.'
    if (unit.length > 32) return 'Đơn vị tối đa 32 ký tự.'
    if (materials.length > 4000) return 'Vật tư tối đa 4.000 ký tự.'
    return ''
  })()

  const save = async () => {
    if (problem || !etag || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const body = isPkg
        ? { name: name.trim() || null, description: description.trim() || null, plannedDueAt: due ? new Date(`${due}T00:00:00Z`).toISOString() : null, reason: reason.trim() }
        : { plannedQuantity: qty.trim() ? Number(qty) : null, plannedUnit: unit.trim() || null, plannedMaterials: materials.trim() || null, reason: reason.trim() }
      await apiClient.put(path, body, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': etag } })
      setMessage('Đã lưu kế hoạch.'); setReason(''); await load(); onSaved?.()
    } catch (e: any) {
      const c = e?.response?.data?.code
      setError(c === 'concurrency_conflict' ? 'Kế hoạch đã thay đổi. Đã tải lại; xác nhận lại rồi gửi.' : exportError(e))
      if (c === 'concurrency_conflict') await load()
    } finally { setBusy(false); guard.release() }
  }

  return (
    <PanelShell icon="event_note" title="Kế hoạch điều phối (PM)" subtitle="Tên/hạn của gói, khối lượng & vật tư dự kiến của hạng mục; không thay phương án đã duyệt" data-testid="planning-panel">
      <select aria-label="Đối tượng lập kế hoạch" className="rg-field !w-auto" value={target} disabled={busy} onChange={(e) => { setTarget(e.target.value); setReason('') }}>
        <option value="package">Gói sửa chữa</option>
        {items.map((i) => <option key={i.id} value={i.id}>Hạng mục {i.id.slice(0, 8).toUpperCase()}</option>)}
      </select>
      {loading && <Loading>Đang đọc kế hoạch…</Loading>}
      <Feedback error={error} message={message} />
      {!loading && etag && (
        <div className="space-y-3">
          {isPkg ? (
            <>
              <Field label="Tên gói" span=""><input aria-label="Tên gói" className="rg-field" maxLength={255} value={name} disabled={busy} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Mô tả" span=""><textarea aria-label="Mô tả gói" className="rg-field" rows={2} maxLength={4000} value={description} disabled={busy} onChange={(e) => setDescription(e.target.value)} /></Field>
              <Field label="Hạn kế hoạch" span=""><input aria-label="Hạn kế hoạch" type="date" className="rg-field" value={due} disabled={busy} onChange={(e) => setDue(e.target.value)} /></Field>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Khối lượng dự kiến" span=""><input aria-label="Khối lượng dự kiến" inputMode="decimal" className="rg-field" value={qty} disabled={busy} onChange={(e) => setQty(e.target.value)} /></Field>
                <Field label="Đơn vị (vd m2)" span=""><input aria-label="Đơn vị khối lượng" className="rg-field" maxLength={32} value={unit} disabled={busy} onChange={(e) => setUnit(e.target.value)} /></Field>
              </div>
              <Field label="Vật tư dự kiến" span=""><textarea aria-label="Vật tư dự kiến" className="rg-field" rows={2} maxLength={4000} value={materials} disabled={busy} onChange={(e) => setMaterials(e.target.value)} /></Field>
            </>
          )}
          <Field label="Lý do" span=""><input aria-label="Lý do lập kế hoạch" className="rg-field" maxLength={1000} value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} /></Field>
          {reason.trim() && problem && <Feedback error={problem} />}
          <PanelButton variant="primary" loading={busy} disabled={busy || !!problem} onClick={() => { void save() }}>{busy ? 'Đang gửi…' : 'Lưu kế hoạch'}</PanelButton>
        </div>
      )}
    </PanelShell>
  )
}
