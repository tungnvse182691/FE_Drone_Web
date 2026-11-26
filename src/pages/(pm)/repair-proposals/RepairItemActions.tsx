import React, { useEffect, useRef, useState } from 'react'
import { repairItemActions, type CorrectionResult } from '../../../api/services/repairItemActions'
import { repairWorkflowService, type RepairItem } from '../../../api/services/repairWorkflowService'
import { Feedback, Field, KV, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { Icon } from '../../../components/ui/Icon'
import { exportError } from '../../../api/services/projectExportService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { useToastStore } from '../../../store/toastStore'

type ActionKey = 'cancel' | 'continue' | 'correct' | 'review'
const ACTION_LABEL: Record<ActionKey, string> = {
  cancel: 'Hủy hạng mục',
  continue: 'Tạo hạng mục Normal kế tiếp',
  correct: 'Hiệu chỉnh quyết định hiệu lực',
  review: 'Yêu cầu xem xét lại kết quả',
}
const RESULT_LABEL: Record<CorrectionResult, string> = {
  UNREPAIRED: 'Chưa sửa',
  REPORTED_AWAITING_REVIEW: 'Đã báo, chờ xem xét',
  CONFIRMED: 'Đã xác nhận',
}
const resultText = (r?: string | null) => (r ? RESULT_LABEL[r as CorrectionResult] || r : 'Chưa có kết quả')

export interface RepairItemActionsProps {
  projectId: string
  packageId: string
  items: RepairItem[]
  isPM: boolean
  isSupervisor: boolean
  onDone: () => void
}

/** Xử lý ngoại lệ và hiệu chỉnh hạng mục (spec PM-09): hủy, hạng mục Normal kế tiếp, hiệu chỉnh quyết định, yêu cầu xem xét. Mặc định thu gọn. */
export const RepairItemActions: React.FC<RepairItemActionsProps> = ({ projectId, packageId, items, isPM, isSupervisor, onDone }) => {
  const actions: ActionKey[] = isPM ? ['cancel', 'continue', 'correct', 'review'] : isSupervisor ? ['correct'] : []
  const [open, setOpen] = useState(false)
  const [itemId, setItemId] = useState('')
  const [action, setAction] = useState<ActionKey>(actions[0] || 'correct')
  const [reason, setReason] = useState('')
  const [repairPlan, setRepairPlan] = useState('')
  const [checklistVersion, setChecklistVersion] = useState('')
  const [result, setResult] = useState<CorrectionResult | ''>('')
  const [basis, setBasis] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [current, setCurrent] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; item?: RepairItem; decisions?: number; error?: string }>({ status: 'idle' })
  const guard = useSubmitGuard()
  const toast = useToastStore()
  const seq = useRef(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Đọc trạng thái/kết quả hiện hành từ BE cho hạng mục đang chọn (bỏ qua phản hồi muộn).
  const readCurrent = async (id: string) => {
    const my = ++seq.current
    if (!id) { setCurrent({ status: 'idle' }); return }
    setCurrent({ status: 'loading' })
    try {
      const [item, history] = await Promise.all([repairWorkflowService.detail(projectId, packageId, id), repairWorkflowService.history(projectId, packageId, id)])
      if (seq.current === my) setCurrent({ status: 'ready', item, decisions: history.decisions.length })
    } catch (e) { if (seq.current === my) setCurrent({ status: 'error', error: exportError(e) }) }
  }
  useEffect(() => { setItemId(''); setCurrent({ status: 'idle' }); seq.current++ }, [projectId, packageId])
  if (!actions.length || items.length === 0) return null

  const chosen = items.find((i) => i.id === itemId)
  const live = current.status === 'ready' ? current.item : undefined
  // Điều kiện theo contract: hiệu chỉnh cần quyết định hiệu lực; Normal do Giám sát, Fast Track do PM; hạng mục đã hủy không hiệu chỉnh.
  const correctionBlock = action !== 'correct' || !chosen ? ''
    : current.status === 'loading' ? 'Đang đọc trạng thái hạng mục từ máy chủ…'
    : current.status === 'error' ? 'Không đọc được trạng thái hiện hành của hạng mục nên khóa hiệu chỉnh.'
    : !live ? ''
    : (chosen.mode === 'Normal' ? !isSupervisor : !isPM) ? `Hạng mục ${chosen.mode === 'Normal' ? 'Normal do Giám sát' : 'Fast Track do PM'} hiệu chỉnh quyết định; vai trò hiện tại không được phép.`
    : live.state === 'Cancelled' ? 'Hạng mục đã hủy; không có quyết định để hiệu chỉnh.'
    : !live.effectiveDecisionId ? 'Hạng mục chưa có quyết định hiệu lực (chưa qua xác nhận/xem xét) nên chưa thể hiệu chỉnh.' : ''
  const ready = !!itemId && !!reason.trim() && !correctionBlock && (action !== 'continue' || (!!repairPlan.trim() && !!checklistVersion.trim())) && (action !== 'correct' || (!!basis.trim() && !!result && current.status === 'ready'))

  const submit = async () => {
    if (!itemId || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      if (action === 'cancel') await repairItemActions.cancel(projectId, packageId, itemId, reason.trim())
      else if (action === 'continue') await repairItemActions.continueNormally(projectId, packageId, itemId, { repairPlan: repairPlan.trim(), checklistVersion: checklistVersion.trim(), reason: reason.trim() })
      else if (action === 'correct') await repairItemActions.correct(projectId, packageId, itemId, { result: result as CorrectionResult, reason: reason.trim(), basisText: basis })
      else await repairItemActions.requestReview(projectId, packageId, itemId, reason.trim())
      setConfirming(false)
      let done = `Đã gửi: ${ACTION_LABEL[action]}.`
      try {
        // Đọc lại kết quả/lịch sử sau khi ghi thành công.
        const [item, history] = await Promise.all([repairWorkflowService.detail(projectId, packageId, itemId), repairWorkflowService.history(projectId, packageId, itemId)])
        setCurrent({ status: 'ready', item, decisions: history.decisions.length })
        done += ` Máy chủ xác nhận: ${item.state}, kết quả ${resultText(item.result)}.`
      } catch (e) { done += ` Chưa đọc lại được trạng thái mới (${exportError(e)}); cần đối chiếu.` }
      setMessage(done); toast.success(done)
      setReason(''); setRepairPlan(''); setChecklistVersion(''); setBasis(''); setResult('')
      onDone()
    } catch (e) {
      setConfirming(false)
      setError(exportError(e))
    } finally {
      setBusy(false); guard.release()
    }
  }

  return (
    <PanelShell as="div" icon="build_circle" title="Xử lý ngoại lệ và hiệu chỉnh" subtitle="Hủy, tạo hạng mục kế tiếp, hiệu chỉnh quyết định hoặc yêu cầu xem xét lại. Chỉ dùng cho trường hợp ngoại lệ." className="mt-4" data-testid="repair-item-actions"
      actions={<PanelButton aria-expanded={open} data-testid="repair-item-actions-toggle" onClick={() => setOpen((v) => !v)}>{open ? 'Thu gọn' : 'Mở rộng'}</PanelButton>}>
      {open && (<>
        <div className="rg-grid">
          <Field label="Hạng mục thao tác">
            <select aria-label="Hạng mục thao tác" value={itemId} disabled={busy} onChange={(e) => { setItemId(e.target.value); setError(''); setMessage(''); setResult(''); void readCurrent(e.target.value) }} className="rg-field w-full">
              <option value="">Chọn hạng mục</option>
              {items.map((i) => (<option key={i.id} value={i.id}>{i.mode} · {i.state} · {i.id.slice(0, 8).toUpperCase()}</option>))}
            </select>
          </Field>
          <Field label="Loại thao tác hạng mục">
            <select aria-label="Loại thao tác hạng mục" value={action} disabled={busy} onChange={(e) => setAction(e.target.value as ActionKey)} className="rg-field w-full">
              {actions.map((a) => (<option key={a} value={a}>{ACTION_LABEL[a]}</option>))}
            </select>
          </Field>
          {chosen && (
            <div className="col-span-12" data-testid="item-current-state">
              {current.status === 'loading' && <p className="rg-hint">Đang đọc trạng thái hiện hành từ máy chủ…</p>}
              {current.status === 'error' && <div className="rg-alert rg-alert-error"><Icon name="error" size={16} className="mt-px" /><p role="alert" className="min-w-0 break-words">Không đọc được trạng thái hạng mục: {current.error}</p><PanelButton onClick={() => { void readCurrent(chosen.id) }}>Thử lại</PanelButton></div>}
              {live && <KV items={[
                { k: 'Trạng thái hiện hành (BE)', v: `${live.mode}: ${live.state}` },
                { k: 'Kết quả hiện hành (BE)', v: resultText(live.result) },
                { k: 'Quyết định hiệu lực', v: live.effectiveDecisionId ? `#${live.effectiveDecisionId.slice(0, 8)}` : 'Chưa có', mono: true },
                { k: 'Số quyết định trong lịch sử', v: current.decisions ?? 0 },
              ]} />}
            </div>
          )}
          {action === 'continue' && (
            <>
              <Field label="Phương án sửa chữa"><textarea aria-label="Phương án sửa chữa" rows={2} disabled={busy} value={repairPlan} onChange={(e) => setRepairPlan(e.target.value)} placeholder="Phương án sửa chữa" className="rg-field w-full" /></Field>
              <Field label="Phiên bản checklist"><input aria-label="Phiên bản checklist" disabled={busy} value={checklistVersion} onChange={(e) => setChecklistVersion(e.target.value)} placeholder="Phiên bản checklist (ví dụ v1)" className="rg-field w-full" /></Field>
            </>
          )}
          {action === 'correct' && (
            <>
              <Field label="Kết quả sau hiệu chỉnh">
                <select aria-label="Kết quả sau hiệu chỉnh" disabled={busy} value={result} onChange={(e) => setResult(e.target.value as CorrectionResult | '')} className="rg-field w-full">
                  <option value="">Chọn kết quả</option>
                  {(Object.keys(RESULT_LABEL) as CorrectionResult[]).map((k) => (<option key={k} value={k}>{RESULT_LABEL[k]}</option>))}
                </select>
              </Field>
              <Field label="Căn cứ hiệu chỉnh"><textarea aria-label="Căn cứ hiệu chỉnh" rows={2} disabled={busy} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Căn cứ hiệu chỉnh (bắt buộc)" className="rg-field w-full" /></Field>
            </>
          )}
          <Field label="Lý do thao tác hạng mục"><textarea aria-label="Lý do thao tác hạng mục" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className="rg-field w-full" /></Field>
        </div>
        {correctionBlock && <div className="rg-alert rg-alert-warn" data-testid="correction-lock"><Icon name="warning" size={16} className="mt-px" /><p>{correctionBlock} (Hiệu chỉnh: hạng mục Normal do Giám sát thực hiện, Fast Track do PM thực hiện.)</p></div>}
        <Feedback error={error} message={message} />
        <div className="rg-footer">
          <PanelButton variant={action === 'cancel' ? 'danger' : 'primary'} loading={busy} disabled={busy || !ready} onClick={() => { if (action === 'correct') setConfirming(true); else void submit() }}>{busy ? 'Đang gửi…' : 'Gửi thao tác'}</PanelButton>
        </div>
        {confirming && chosen && live && result && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-label="Xác nhận hiệu chỉnh" data-testid="correction-confirm">
            <div className="w-full max-w-md space-y-3 rounded-2xl border border-brand-border bg-white p-5 text-xs shadow-2xl">
              <h4 className="text-sm font-bold text-brand-dark">Xác nhận hiệu chỉnh quyết định</h4>
              <KV items={[
                { k: 'Hạng mục', v: `${chosen.mode} · ${chosen.id.slice(0, 8).toUpperCase()}`, mono: true },
                { k: 'Kết quả hiện hành', v: resultText(live.result) },
                { k: 'Kết quả sau hiệu chỉnh', v: resultText(result) },
                { k: 'Căn cứ', v: basis.trim() },
                { k: 'Lý do', v: reason.trim() },
              ]} />
              <p className="rg-hint">Hiệu chỉnh thay thế quyết định hiệu lực hiện hành và ghi vào lịch sử; không thể hoàn tác.</p>
              <div className="rg-footer">
                <PanelButton disabled={busy} onClick={() => setConfirming(false)}>Quay lại</PanelButton>
                <PanelButton variant="primary" loading={busy} disabled={busy} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Xác nhận hiệu chỉnh'}</PanelButton>
              </div>
            </div>
          </div>
        )}
      </>)}
    </PanelShell>
  )
}
