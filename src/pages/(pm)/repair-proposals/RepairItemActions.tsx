import React, { useState } from 'react'
import { repairItemActions, type CorrectionResult } from '../../../api/services/repairItemActions'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { exportError } from '../../../api/services/projectExportService'

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
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  if (!actions.length || items.length === 0) return null

  const submit = async () => {
    if (busy || !itemId) return
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
      setBusy(false)
    }
  }
  // BE: hiệu chỉnh quyết định do Giám sát làm với hạng mục Normal, do PM làm với hạng mục Fast Track.
  const chosen = items.find((i) => i.id === itemId)
  const correctionDenied = action === 'correct' && !!chosen && (chosen.mode === 'Normal' ? !isSupervisor : !isPM)
  const ready = !!itemId && !!reason.trim() && !correctionDenied && (action !== 'continue' || (!!repairPlan.trim() && !!checklistVersion.trim())) && (action !== 'correct' || !!basis.trim())

  return (
    <div className="space-y-2 text-xs border-t pt-3 mt-3" data-testid="repair-item-actions">
      <p className="font-semibold">Thao tác hạng mục sửa chữa</p>
      <select aria-label="Hạng mục thao tác" value={itemId} disabled={busy} onChange={(e) => setItemId(e.target.value)} className="w-full border rounded-lg p-2">
        <option value="">Chọn hạng mục</option>
        {items.map((i) => (<option key={i.id} value={i.id}>{i.mode} · {i.state} · {i.id.slice(0, 8).toUpperCase()}</option>))}
      </select>
      <select aria-label="Loại thao tác hạng mục" value={action} disabled={busy} onChange={(e) => setAction(e.target.value as ActionKey)} className="w-full border rounded-lg p-2">
        {actions.map((a) => (<option key={a} value={a}>{ACTION_LABEL[a]}</option>))}
      </select>
      {action === 'continue' && (
        <>
          <textarea aria-label="Phương án sửa chữa" rows={2} disabled={busy} value={repairPlan} onChange={(e) => setRepairPlan(e.target.value)} placeholder="Phương án sửa chữa" className="w-full border rounded-lg p-2" />
          <input aria-label="Phiên bản checklist" disabled={busy} value={checklistVersion} onChange={(e) => setChecklistVersion(e.target.value)} placeholder="Phiên bản checklist (ví dụ v1)" className="w-full border rounded-lg p-2" />
        </>
      )}
      {action === 'correct' && (
        <>
          <select aria-label="Kết quả sau hiệu chỉnh" disabled={busy} value={result} onChange={(e) => setResult(e.target.value as CorrectionResult)} className="w-full border rounded-lg p-2">
            {(Object.keys(RESULT_LABEL) as CorrectionResult[]).map((k) => (<option key={k} value={k}>{RESULT_LABEL[k]}</option>))}
          </select>
          <textarea aria-label="Căn cứ hiệu chỉnh" rows={2} disabled={busy} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Căn cứ hiệu chỉnh (bắt buộc)" className="w-full border rounded-lg p-2" />
        </>
      )}
      <textarea aria-label="Lý do thao tác hạng mục" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className="w-full border rounded-lg p-2" />
      {correctionDenied && <p className="text-amber-700">Hiệu chỉnh quyết định: hạng mục Normal do Giám sát thực hiện, hạng mục Fast Track do PM thực hiện.</p>}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
      <button type="button" disabled={busy || !ready} onClick={() => { void submit() }} className="border rounded-lg px-3 py-2">{busy ? 'Đang gửi…' : 'Gửi thao tác'}</button>
    </div>
  )
}
