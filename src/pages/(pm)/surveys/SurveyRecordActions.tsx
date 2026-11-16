import React, { useEffect, useState } from 'react'
import { surveyActions } from '../../../api/services/surveyActions'
import { surveyPlanningService, surveyStatusLabel, type SurveyRecord } from '../../../api/services/surveyPlanningService'
import type { AvailablePilot } from '../create-survey/types'
import { exportError } from '../../../api/services/projectExportService'

type TaskAct = 'reassign' | 'cancel'

/** PM-06: hoãn kế hoạch khảo sát, hủy hoặc giao lại nhiệm vụ khảo sát. Hiển thị sau khi đã đọc chi tiết từ BE. */
export const SurveyRecordActions: React.FC<{ record: SurveyRecord; onDone: () => void }> = ({ record, onDone }) => {
  const [act, setAct] = useState<TaskAct>('reassign')
  const [reason, setReason] = useState('')
  const [operatorId, setOperatorId] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [operators, setOperators] = useState<AvailablePilot[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const isTask = record.recordKind === 'TASK'
  const closed = ['CANCELLED', 'POSTPONED'].includes(record.status)

  useEffect(() => {
    if (!isTask || closed) return
    let alive = true
    surveyPlanningService.operators(record.projectId).then((rows) => { if (alive) setOperators(rows) }).catch((e) => { if (alive) setError(`Không đọc được danh sách Operator: ${exportError(e)}`) })
    return () => { alive = false }
  }, [isTask, closed, record.projectId])

  if (closed && message) return <p role="status" className="text-xs text-emerald-800 border-t border-[#E2E5E9] pt-3">{message}</p>
  if (closed) return <p className="text-xs text-slate-500 border-t border-[#E2E5E9] pt-3">Bản ghi ở trạng thái {surveyStatusLabel(record.status)}: không còn thao tác.</p>

  const submit = async () => {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try {
      if (!isTask) await surveyActions.postponePlan(record.projectId, record.id, reason)
      else if (act === 'cancel') await surveyActions.cancelTask(record.projectId, record.id, reason)
      else await surveyActions.reassignTask(record.projectId, record.id, { operatorId, reason, dueAt: dueAt || undefined })
      setMessage(!isTask ? 'Đã hoãn kế hoạch khảo sát.' : act === 'cancel' ? 'Đã hủy nhiệm vụ khảo sát.' : 'Đã giao lại nhiệm vụ khảo sát.')
      setReason('')
      onDone()
    } catch (e) {
      setError(exportError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-2 text-xs border-t border-[#E2E5E9] pt-4" data-testid="survey-record-actions">
      <h4 className="font-bold text-[#1A1D20]">{isTask ? 'PM giao lại hoặc hủy nhiệm vụ khảo sát' : 'PM hoãn kế hoạch khảo sát'}</h4>
      {isTask && (
        <select aria-label="Thao tác nhiệm vụ khảo sát" disabled={busy} value={act} onChange={(e) => setAct(e.target.value as TaskAct)} className="w-full border border-[#E2E5E9] rounded-lg p-2">
          <option value="reassign">Giao lại cho Operator khác</option>
          <option value="cancel">Hủy nhiệm vụ</option>
        </select>
      )}
      {isTask && act === 'reassign' && (
        <>
          <select aria-label="Operator nhận nhiệm vụ" disabled={busy} value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="w-full border border-[#E2E5E9] rounded-lg p-2">
            <option value="">Chọn Operator</option>
            {operators.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
          <input aria-label="Hạn hoàn thành mới" type="datetime-local" disabled={busy} value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="w-full border border-[#E2E5E9] rounded-lg p-2" />
        </>
      )}
      <textarea aria-label="Lý do thao tác khảo sát" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className="w-full border border-[#E2E5E9] rounded-lg p-2" />
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
      <button type="button" disabled={busy || !reason.trim() || (isTask && act === 'reassign' && !operatorId)} onClick={() => { void submit() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">
        {busy ? 'Đang gửi…' : !isTask ? 'Xác nhận hoãn kế hoạch' : act === 'cancel' ? 'Xác nhận hủy nhiệm vụ' : 'Xác nhận giao lại'}
      </button>
    </section>
  )
}
