import React, { useCallback, useEffect, useRef, useState } from 'react'
import { repairSafetyService, type SafetyView, type TemporarySafetySources } from '../../../api/services/repairSafetyService'
import { fastTrackService } from '../../../api/services/fastTrackService'
import { fieldTaskReadService } from '../../../api/services/fieldTaskReadService'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { exportError } from '../../../api/services/projectExportService'
import { Feedback, Field, KV, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { Icon } from '../../../components/ui/Icon'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

type Load<T> = { status: 'idle' | 'loading' | 'error' | 'ready'; data?: T; etag?: string; error?: string }
const short = (id: string) => id.slice(0, 8).toUpperCase()

/**
 * PM giao biện pháp an toàn thi công cho Crew đang thi công hạng mục Normal; xem lại biện pháp theo mã.
 * Nghĩa vụ an toàn tạm thời lấy từ GET .../items/{itemId}/temporary-safety-obligations (không lấy FormalRepair từ road-coverage).
 * Crew bắt buộc khớp binding hiện hành của hạng mục. Lắp đặt/kiểm tra/xác nhận cảnh báo do Crew thực hiện trên mobile.
 */
export const RepairSafetyPanel: React.FC<{ projectId: string; packageId: string; items: RepairItem[] }> = ({ projectId, packageId, items }) => {
  const normal = items.filter((i) => i.mode === 'Normal' && !['Confirmed', 'Cancelled'].includes(i.state))
  const [itemId, setItemId] = useState('')
  const [src, setSrc] = useState<Load<TemporarySafetySources>>({ status: 'idle' })
  const [crew, setCrew] = useState<Load<{ id: string; name: string }>>({ status: 'idle' })
  const [safetyId, setSafetyId] = useState('')
  const [schedule, setSchedule] = useState('')
  const [replacement, setReplacement] = useState('')
  const [removal, setRemoval] = useState('')
  const [reason, setReason] = useState('')
  const [measureId, setMeasureId] = useState('')
  const [view, setView] = useState<SafetyView | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  // Thêm nghĩa vụ an toàn tạm thời (PM)
  const [addFrom, setAddFrom] = useState('')
  const [addTo, setAddTo] = useState('')
  const [addOffFrom, setAddOffFrom] = useState('')
  const [addOffTo, setAddOffTo] = useState('')
  const [addMandatory, setAddMandatory] = useState(true)
  const [addReason, setAddReason] = useState('')
  const [addError, setAddError] = useState('')
  const addKey = useRef<{ sig: string; key: string } | null>(null)
  const seq = useRef(0)
  const guard = useSubmitGuard()

  // Đổi hạng mục/gói/dự án: xóa lựa chọn safety + Crew cũ, đọc lại nguồn; bỏ qua phản hồi muộn bằng seq token.
  const load = useCallback(async (id: string, keepForm = false) => {
    const my = ++seq.current
    if (!keepForm) { setSafetyId(''); setCrew({ status: 'idle' }); setView(null); setMeasureId('') }
    if (!id) { setSrc({ status: 'idle' }); return }
    setSrc({ status: 'loading' })
    try {
      const { data, etag } = await repairSafetyService.obligations(projectId, packageId, id)
      if (seq.current !== my) return
      setSrc({ status: 'ready', data, etag })
      // Crew phải khớp binding: Crew đang được giao của nhiệm vụ trong binding.
      if (!data.binding?.taskId) { setCrew({ status: 'error', error: 'Hạng mục chưa có binding/Crew được giao nên chưa xác định được Crew phụ trách.' }); return }
      setCrew({ status: 'loading' })
      try {
        const [task, members] = await Promise.all([fieldTaskReadService.detail(projectId, data.binding.taskId), fastTrackService.getCrews(projectId)])
        if (seq.current !== my) return
        if (!task.assignedToUserId) throw new Error('Nhiệm vụ trong binding chưa có Crew được giao.')
        setCrew({ status: 'ready', data: { id: task.assignedToUserId, name: members.find((m) => m.id === task.assignedToUserId)?.name || `Crew ${short(task.assignedToUserId)}` } })
      } catch (e) { if (seq.current === my) setCrew({ status: 'error', error: `Không xác định được Crew theo binding: ${exportError(e)}` }) }
    } catch (e) { if (seq.current === my) setSrc({ status: 'error', error: exportError(e) }) }
  }, [projectId, packageId])

  useEffect(() => { setItemId(''); setError(''); setMessage(''); setAddError(''); void load('') }, [projectId, packageId, load])
  useEffect(() => () => { seq.current++ }, [])

  if (!normal.length) return null
  const item = normal.find((i) => i.id === itemId)
  const obligations = src.data?.items.filter((o) => !o.resolved) ?? []
  const noValid = src.status === 'ready' && obligations.length === 0
  const lockReason = !item ? '' : src.status === 'loading' ? 'Đang đọc nghĩa vụ an toàn tạm thời của hạng mục…'
    : src.status === 'error' ? 'Không đọc được nghĩa vụ an toàn tạm thời nên khóa gửi.'
    : noValid ? 'Hạng mục chưa có nghĩa vụ an toàn tạm thời hợp lệ (cùng gói/Defect, chưa xử lý, chưa dùng, nằm trong phạm vi chính thức). Thêm nghĩa vụ bên dưới hoặc liên hệ BE.'
    : crew.status === 'error' ? crew.error! : crew.status !== 'ready' ? 'Đang xác định Crew theo binding…' : ''

  const run = async (fn: () => Promise<SafetyView>, done: string, reread = false) => {
    if (!guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const v = await fn(); setView(v); setMeasureId(v.id)
      if (reread) { setSafetyId(''); await load(itemId, true) }
      setMessage(done)
    } catch (e) { setError(exportError(e)) } finally { setBusy(false); guard.release() }
  }
  const cls = 'rg-field w-full'

  const append = async () => {
    if (!item || src.status !== 'ready' || !src.data || !src.etag || !guard.acquire()) return
    setAddError(''); setError(''); setMessage('')
    const built = repairSafetyService.buildScope(src.data, { from: Number(addFrom), to: Number(addTo), offFrom: Number(addOffFrom), offTo: Number(addOffTo) })
    if (built.error || !addReason.trim()) { setAddError(built.error || 'Nhập lý do bổ sung nghĩa vụ.'); guard.release(); return }
    setBusy(true)
    try {
      const body = { scope: built.scope, mandatory: addMandatory, reason: addReason }
      const sig = JSON.stringify([body, src.etag])
      if (addKey.current?.sig !== sig) addKey.current = { sig, key: crypto.randomUUID() }
      const r = await repairSafetyService.appendObligation(projectId, packageId, item.id, body, src.etag, addKey.current.key)
      addKey.current = null
      await load(item.id, true) // đọc lại collection sau khi lưu
      setAddFrom(''); setAddTo(''); setAddOffFrom(''); setAddOffTo(''); setAddReason('')
      setMessage(`${r.status === 200 ? 'Yêu cầu đã được ghi nhận trước đó' : 'Đã thêm nghĩa vụ an toàn tạm thời'} (#${short(r.obligation.safetyObligationId)}); danh sách đã đọc lại từ BE.`)
    } catch (e: any) {
      const code = e?.response?.data?.code
      if (e?.response?.status === 409 && code !== 'idempotency_key_reused') { addKey.current = null; await load(item.id, true) }
      setAddError(exportError(e))
    } finally { setBusy(false); guard.release() }
  }

  return (
    <PanelShell as="div" icon="health_and_safety" title="Biện pháp an toàn thi công" subtitle="PM giao biện pháp cho Crew đang thi công hạng mục Normal; nghĩa vụ an toàn tạm thời lấy từ API của hạng mục." className="mt-4" data-testid="repair-safety-panel">
      <div className="rg-grid">
        <Field label="Hạng mục giao biện pháp an toàn">
          <select aria-label="Hạng mục giao biện pháp an toàn" value={itemId} disabled={busy} onChange={(e) => { setItemId(e.target.value); setError(''); setMessage(''); setAddError(''); void load(e.target.value) }} className={cls}>
            <option value="">Chọn hạng mục đang thi công</option>
            {normal.map((i) => (<option key={i.id} value={i.id}>{i.state} · {short(i.id)}</option>))}
          </select>
        </Field>
        {item && (
          <>
            <Field label="Nghĩa vụ an toàn tạm thời" hint="Chỉ liệt kê nghĩa vụ hợp lệ do máy chủ trả cho đúng hạng mục này.">
              <select aria-label="Nghĩa vụ an toàn tạm thời" value={safetyId} disabled={busy || src.status !== 'ready' || noValid} onChange={(e) => setSafetyId(e.target.value)} className={cls}>
                <option value="">{src.status === 'loading' ? 'Đang đọc…' : 'Chọn nghĩa vụ an toàn tạm thời'}</option>
                {obligations.map((s) => (<option key={s.safetyObligationId} value={s.safetyObligationId}>#{short(s.safetyObligationId)} · lý trình {s.scope.fromMeters}–{s.scope.toMeters} m · lệch {s.scope.offsetFromMeters}–{s.scope.offsetToMeters} m · {s.mandatory ? 'bắt buộc' : 'không bắt buộc'}</option>))}
              </select>
            </Field>
            <Field label="Crew phụ trách biện pháp an toàn" hint="Theo binding hiện hành của hạng mục; không chọn Crew khác.">
              <input aria-label="Crew phụ trách biện pháp an toàn" readOnly disabled value={crew.status === 'ready' ? crew.data!.name : crew.status === 'loading' ? 'Đang xác định Crew…' : 'Chưa xác định được Crew'} className={cls} />
            </Field>
            <Field label="Lịch kiểm tra an toàn"><textarea aria-label="Lịch kiểm tra an toàn" rows={2} disabled={busy} value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Lịch kiểm tra" className={cls} /></Field>
            <Field label="Điều kiện thay thế"><textarea aria-label="Điều kiện thay thế" rows={2} disabled={busy} value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="Điều kiện thay thế biện pháp" className={cls} /></Field>
            <Field label="Điều kiện gỡ bỏ"><textarea aria-label="Điều kiện gỡ bỏ" rows={2} disabled={busy} value={removal} onChange={(e) => setRemoval(e.target.value)} placeholder="Điều kiện gỡ bỏ biện pháp" className={cls} /></Field>
            <Field label="Lý do giao biện pháp an toàn"><textarea aria-label="Lý do giao biện pháp an toàn" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={cls} /></Field>
          </>
        )}
      </div>
      {item && src.status === 'error' && (
        <div className="rg-alert rg-alert-error" data-testid="safety-load-error"><Icon name="error" size={16} className="mt-px" /><p role="alert" className="min-w-0 break-words">Không đọc được nghĩa vụ an toàn tạm thời: {src.error}</p><PanelButton onClick={() => { void load(item.id) }}>Thử lại</PanelButton></div>
      )}
      {item && lockReason && src.status !== 'error' && (
        <div className="rg-alert rg-alert-warn" data-testid="safety-lock"><Icon name="warning" size={16} className="mt-px" /><p className="min-w-0 break-words">{lockReason}</p></div>
      )}
      {item && src.status === 'ready' && src.data && (
        <details className="rg-subcard" open={noValid} data-testid="safety-add">
          <summary className="cursor-pointer text-xs font-semibold">Thêm nghĩa vụ an toàn tạm thời (PM)</summary>
          <p className="rg-hint">Phạm vi chính thức của hạng mục: {src.data.formalScope.fromMeters}–{src.data.formalScope.toMeters} m, lệch {src.data.formalScope.offsetFromMeters}–{src.data.formalScope.offsetToMeters} m. Tuyến/bộ đoạn lấy từ binding, không nhập tay.</p>
          <div className="rg-grid">
            <Field label="Từ lý trình (m)" span="col-span-6"><input aria-label="An toàn từ lý trình" inputMode="decimal" disabled={busy} value={addFrom} onChange={(e) => setAddFrom(e.target.value)} className={cls} /></Field>
            <Field label="Đến lý trình (m)" span="col-span-6"><input aria-label="An toàn đến lý trình" inputMode="decimal" disabled={busy} value={addTo} onChange={(e) => setAddTo(e.target.value)} className={cls} /></Field>
            <Field label="Lệch từ (m)" span="col-span-6"><input aria-label="An toàn lệch từ" inputMode="decimal" disabled={busy} value={addOffFrom} onChange={(e) => setAddOffFrom(e.target.value)} className={cls} /></Field>
            <Field label="Lệch đến (m)" span="col-span-6"><input aria-label="An toàn lệch đến" inputMode="decimal" disabled={busy} value={addOffTo} onChange={(e) => setAddOffTo(e.target.value)} className={cls} /></Field>
            <Field label="Lý do bổ sung nghĩa vụ"><textarea aria-label="Lý do bổ sung nghĩa vụ an toàn" rows={2} maxLength={2000} disabled={busy} value={addReason} onChange={(e) => setAddReason(e.target.value)} className={cls} /></Field>
          </div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={addMandatory} disabled={busy} onChange={(e) => setAddMandatory(e.target.checked)} />Bắt buộc</label>
          {addError && <div className="rg-alert rg-alert-error"><Icon name="error" size={16} className="mt-px" /><p role="alert" className="min-w-0 break-words">{addError}</p></div>}
          <div className="rg-footer"><PanelButton loading={busy} disabled={busy || !addFrom || !addTo || !addOffFrom || !addOffTo || !addReason.trim()} onClick={() => { void append() }}>Thêm nghĩa vụ an toàn tạm thời</PanelButton></div>
        </details>
      )}
      {item && (
        <div className="rg-footer">
          <PanelButton variant="primary" loading={busy} disabled={busy || !!lockReason || !safetyId || crew.status !== 'ready' || !schedule.trim() || !replacement.trim() || !removal.trim() || !reason.trim()} onClick={() => {
            if (!src.data || crew.status !== 'ready' || !crew.data) return
            void run(() => repairSafetyService.create(projectId, packageId, item.id, src.data!.itemVersion!, { formalRepairObligationId: src.data!.formalObligationId, safetyObligationId: safetyId, responsibleActorId: crew.data!.id, checkSchedule: schedule, replacementCondition: replacement, removalCondition: removal, reason }), 'Đã giao biện pháp an toàn cho Crew; danh sách nghĩa vụ đã đọc lại.', true)
          }}>{busy ? 'Đang gửi…' : 'Giao biện pháp an toàn'}</PanelButton>
        </div>
      )}
      <div className="flex items-end gap-2 border-t border-brand-border pt-3">
        <div className="flex-1"><span className="rg-label">Mã biện pháp an toàn</span><input aria-label="Mã biện pháp an toàn" disabled={busy || !itemId} value={measureId} onChange={(e) => setMeasureId(e.target.value)} placeholder="Mã biện pháp an toàn (GUID)" className={`${cls} font-mono`} /></div>
        <PanelButton className="whitespace-nowrap" disabled={busy || !itemId || !measureId.trim()} onClick={() => { void run(() => repairSafetyService.read(projectId, packageId, itemId, measureId), 'Đã đọc biện pháp an toàn.') }}>Xem biện pháp</PanelButton>
      </div>
      {view && (
        <div data-testid="safety-view" className="rg-subcard">
          <KV items={[
            { k: 'Biện pháp', v: `#${view.id.slice(0, 8)}`, mono: true },
            { k: 'Crew', v: view.responsibleActorId.slice(0, 8), mono: true },
            { k: 'Lắp đặt', v: view.installedAt ? new Date(view.installedAt).toLocaleString('vi-VN') : 'chưa lắp' },
            { k: 'Hạn kiểm tra đầu', v: view.firstCheckDueAt ? new Date(view.firstCheckDueAt).toLocaleString('vi-VN') : '—' },
            { k: 'Lần kiểm tra', v: view.checks?.length ?? 0 },
            { k: 'Cảnh báo', v: view.warnings?.length ?? 0 },
            { k: 'Xác nhận cảnh báo', v: view.acknowledgements?.length ?? 0 },
          ]} />
        </div>
      )}
      <Feedback error={error} message={message} />
    </PanelShell>
  )
}
