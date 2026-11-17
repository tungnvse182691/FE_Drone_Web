import React, { useState } from 'react'
import { repairItemActions, type CorrectionResult } from '../../../api/services/repairItemActions'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { Feedback, Field, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { Icon } from '../../../components/ui/Icon'
import { exportError } from '../../../api/services/projectExportService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

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

export interface RepairItemActionsProps {
  projectId: string
  packageId: string
  items: RepairItem[]
  isPM: boolean
  isSupervisor: boolean
  onDone: () => void
}

/** Thao tác vòng đời hạng mục (spec PM-09): hủy, hạng mục Normal kế tiếp, hiệu chỉnh quyết định, yêu cầu xem xét. */
export const RepairItemActions: React.FC<RepairItemActionsProps> = ({ projectId, packageId, items, isPM, isSupervisor, onDone }) => {
  const actions: ActionKey[] = isPM ? ['cancel', 'continue', 'correct', 'review'] : isSupervisor ? ['correct'] : []
  const [itemId, setItemId] = useState('')
  const [action, setAction] = useState<ActionKey>(actions[0] || 'correct')
  const [reason, setReason] = useState('')
  const [repairPlan, setRepairPlan] = useState('')
  const [checklistVersion, setChecklistVersion] = useState('')
  const [result, setResult] = useState<CorrectionResult>('UNREPAIRED')
  const [basis, setBasis] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  if (!actions.length || items.length === 0) return null

  const submit = async () => {
    if (!itemId || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      if (action === 'cancel') await repairItemActions.cancel(projectId, packageId, itemId, reason.trim())
      else if (action === 'continue') await repairItemActions.continueNormally(projectId, packageId, itemId, { repairPlan: repairPlan.trim(), checklistVersion: checklistVersion.trim(), reason: reason.trim() })
      else if (action === 'correct') await repairItemActions.correct(projectId, packageId, itemId, { result, reason: reason.trim(), basisText: basis })
      else await repairItemActions.requestReview(projectId, packageId, itemId, reason.trim())
      setMessage(`Đã gửi: ${ACTION_LABEL[action]}.`)
      setReason(''); setRepairPlan(''); setChecklistVersion(''); setBasis('')
      onDone()
    } catch (e) {
      setError(exportError(e))
    } finally {
      setBusy(false); guard.release()
    }
  }
  // BE: hiệu chỉnh quyết định do Giám sát làm với hạng mục Normal, do PM làm với hạng mục Fast Track.
  const chosen = items.find((i) => i.id === itemId)
  const correctionDenied = action === 'correct' && !!chosen && (chosen.mode === 'Normal' ? !isSupervisor : !isPM)
  const ready = !!itemId && !!reason.trim() && !correctionDenied && (action !== 'continue' || (!!repairPlan.trim() && !!checklistVersion.trim())) && (action !== 'correct' || !!basis.trim())

  return (
    <PanelShell as="div" icon="build_circle" title="Thao tác hạng mục sửa chữa" className="mt-4" data-testid="repair-item-actions">
      <div className="rg-grid">
        <Field label="Hạng mục thao tác">
          <select aria-label="Hạng mục thao tác" value={itemId} disabled={busy} onChange={(e) => setItemId(e.target.value)} className="rg-field w-full">
            <option value="">Chọn hạng mục</option>
            {items.map((i) => (<option key={i.id} value={i.id}>{i.mode} · {i.state} · {i.id.slice(0, 8).toUpperCase()}</option>))}
          </select>
        </Field>
        <Field label="Loại thao tác hạng mục">
          <select aria-label="Loại thao tác hạng mục" value={action} disabled={busy} onChange={(e) => setAction(e.target.value as ActionKey)} className="rg-field w-full">
            {actions.map((a) => (<option key={a} value={a}>{ACTION_LABEL[a]}</option>))}
          </select>
        </Field>
        {action === 'continue' && (
          <>
            <Field label="Phương án sửa chữa"><textarea aria-label="Phương án sửa chữa" rows={2} disabled={busy} value={repairPlan} onChange={(e) => setRepairPlan(e.target.value)} placeholder="Phương án sửa chữa" className="rg-field w-full" /></Field>
            <Field label="Phiên bản checklist"><input aria-label="Phiên bản checklist" disabled={busy} value={checklistVersion} onChange={(e) => setChecklistVersion(e.target.value)} placeholder="Phiên bản checklist (ví dụ v1)" className="rg-field w-full" /></Field>
          </>
        )}
        {action === 'correct' && (
          <>
            <Field label="Kết quả sau hiệu chỉnh">
              <select aria-label="Kết quả sau hiệu chỉnh" disabled={busy} value={result} onChange={(e) => setResult(e.target.value as CorrectionResult)} className="rg-field w-full">
                {(Object.keys(RESULT_LABEL) as CorrectionResult[]).map((k) => (<option key={k} value={k}>{RESULT_LABEL[k]}</option>))}
              </select>
            </Field>
            <Field label="Căn cứ hiệu chỉnh"><textarea aria-label="Căn cứ hiệu chỉnh" rows={2} disabled={busy} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Căn cứ hiệu chỉnh (bắt buộc)" className="rg-field w-full" /></Field>
          </>
        )}
        <Field label="Lý do thao tác hạng mục"><textarea aria-label="Lý do thao tác hạng mục" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className="rg-field w-full" /></Field>
      </div>
      {correctionDenied && <div className="rg-alert rg-alert-warn"><Icon name="warning" size={16} className="mt-px" /><p>Hiệu chỉnh quyết định: hạng mục Normal do Giám sát thực hiện, hạng mục Fast Track do PM thực hiện.</p></div>}
      <Feedback error={error} message={message} />
      <div className="rg-footer">
        <PanelButton variant={action === 'cancel' ? 'danger' : 'primary'} loading={busy} disabled={busy || !ready} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Gửi thao tác'}</PanelButton>
      </div>
    </PanelShell>
  )
}
