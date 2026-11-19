import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { surveyActions } from '../../../api/services/surveyActions'
import { surveyPlanningService, surveyStatusLabel, type SurveyRecord, type SurveyScope } from '../../../api/services/surveyPlanningService'
import type { AvailablePilot } from '../create-survey/types'
import { exportError } from '../../../api/services/projectExportService'
import { Feedback, Field, PanelButton, PanelShell, SectionTitle } from '../../../components/ui/PanelKit'
import { Icon } from '../../../components/ui/Icon'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { canPostpone, taskActions, type TaskAct } from './surveyActionAvailability'

const TASK_LABEL: Record<TaskAct, string> = { reassign: 'Giao lại cho Operator khác', cancel: 'Hủy nhiệm vụ', supplement: 'Tạo nhiệm vụ bổ sung' }
const BAND_LABEL: Record<string, string> = { SURFACE: 'Mặt đường', LEFT_EDGE: 'Lề trái', RIGHT_EDGE: 'Lề phải' }

/** PM-06: hoãn kế hoạch khảo sát; giao lại, hủy hoặc tạo nhiệm vụ bổ sung cho nhiệm vụ khảo sát. Hiển thị sau khi đã đọc chi tiết từ BE. */
export const SurveyRecordActions: React.FC<{ record: SurveyRecord; onDone: () => void }> = ({ record, onDone }) => {
  const [selectedAct, setAct] = useState<TaskAct>('reassign')
  const [reason, setReason] = useState('')
  const [operatorId, setOperatorId] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [operators, setOperators] = useState<AvailablePilot[]>([])
  const [picked, setPicked] = useState<Record<string, boolean>>({})
  // Kết quả thao tác giữ trong sessionStorage vì chi tiết bản ghi được nạp lại (gỡ khung) ngay sau khi BE đổi trạng thái.
  const memo = `rg_survey_action_${record.id}`
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(memo) || '{}') as { message?: string; childId?: string } } catch { return {} } })()
  const [childId, setChildId] = useState(saved.childId || '')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState(saved.message || '')
  const [params, setParams] = useSearchParams()
  const isTask = record.recordKind === 'TASK'
  const allowed = isTask ? taskActions(record.status, record.supplementTaskId) : []
  const act = allowed.includes(selectedAct) ? selectedAct : allowed[0]
  const closed = isTask ? !act : !canPostpone(record.status)
  const operatorNeeded = allowed.some(action => action !== 'cancel')

  useEffect(() => {
    if (!operatorNeeded) return
    let alive = true
    surveyPlanningService.operators(record.projectId).then((rows) => { if (alive) setOperators(rows) }).catch((e) => { if (alive) setError(`Không đọc được danh sách Operator: ${exportError(e)}`) })
    return () => { alive = false }
  }, [operatorNeeded, record.projectId])

  if (closed && message) return <div className="rg-alert rg-alert-ok mt-4"><Icon name="check_circle" size={16} className="mt-px" /><p role="status" className="min-w-0">{message}</p></div>
  if (closed) return <div className="rg-empty mt-4 text-xs"><Icon name="lock" size={18} className="text-slate-400" /><p>Bản ghi ở trạng thái {surveyStatusLabel(record.status)}: không còn thao tác.</p></div>

  const supplementScope = (): SurveyScope[] => (record.scope || [])
    .map((s, i) => ({ routeVersionId: s.routeVersionId, segmentSetId: s.segmentSetId, targetBand: s.targetBand, segmentIds: s.segmentIds.filter((id) => picked[`${i}:${id}`]) }))
    .filter((s) => s.segmentIds.length > 0)
  const hasSupplementScope = supplementScope().length > 0

  const submit = async () => {
    if (closed || !guard.acquire()) return
    setBusy(true); setError(''); setMessage(''); setChildId('')
    try { sessionStorage.removeItem(memo) } catch { /* không bắt buộc */ }
    let createdChild = ''
    try {
      if (!isTask) await surveyActions.postponePlan(record.projectId, record.id, reason)
      else if (act === 'cancel') await surveyActions.cancelTask(record.projectId, record.id, reason)
      else if (act === 'supplement') {
        const r = await surveyActions.supplementTask(record.projectId, record.id, { operatorId, reason, scope: supplementScope() })
        setChildId(r.supplementTaskId); createdChild = r.supplementTaskId
      } else await surveyActions.reassignTask(record.projectId, record.id, { operatorId, reason, dueAt: dueAt || undefined })
      const done = !isTask ? 'Đã hoãn kế hoạch khảo sát.' : act === 'cancel' ? 'Đã hủy nhiệm vụ khảo sát.' : act === 'supplement' ? 'Đã tạo nhiệm vụ bổ sung; nhiệm vụ gốc chuyển sang chờ bổ sung.' : 'Đã giao lại nhiệm vụ khảo sát.'
      setMessage(done)
      try { sessionStorage.setItem(memo, JSON.stringify({ message: done, childId: act === 'supplement' && isTask ? createdChild : '' })) } catch { /* không bắt buộc */ }
      setReason('')
      onDone()
    } catch (e) {
      setError(exportError(e))
    } finally {
      setBusy(false); guard.release()
    }
  }
  const openChild = () => { const next = new URLSearchParams(params); next.set('surveyRecordId', childId); next.set('surveyRecordKind', 'TASK'); setParams(next) }
  const needOperator = isTask && (act === 'reassign' || act === 'supplement')
  const cls = 'rg-field w-full'

  return (
    <PanelShell icon={isTask ? 'edit_note' : 'event_busy'} title={isTask ? 'PM giao lại, hủy hoặc bổ sung nhiệm vụ khảo sát' : 'PM hoãn kế hoạch khảo sát'} className="mt-4" data-testid="survey-record-actions">
      <div className="rg-grid">
        {isTask && (
          <Field label="Thao tác nhiệm vụ khảo sát" span="col-span-12 md:col-span-6">
            <select aria-label="Thao tác nhiệm vụ khảo sát" disabled={busy} value={act} onChange={(e) => setAct(e.target.value as TaskAct)} className={cls}>
              {allowed.map(action => <option key={action} value={action}>{TASK_LABEL[action]}</option>)}
            </select>
          </Field>
        )}
        {needOperator && (
          <Field label="Operator nhận nhiệm vụ" span="col-span-12 md:col-span-6">
            <select aria-label="Operator nhận nhiệm vụ" disabled={busy} value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className={cls}>
              <option value="">Chọn Operator</option>
              {operators.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
            </select>
          </Field>
        )}
        {isTask && act === 'reassign' && (
          <Field label="Hạn hoàn thành mới" span="col-span-12 md:col-span-6">
            <input aria-label="Hạn hoàn thành mới" type="datetime-local" disabled={busy} value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={cls} />
          </Field>
        )}
      </div>
      {isTask && act === 'supplement' && (
        <div className="rg-subcard" data-testid="supplement-scope">
          <SectionTitle icon="route">Phạm vi cần bổ sung (chọn phân đoạn của nhiệm vụ gốc)</SectionTitle>
          {(record.scope || []).map((s, i) => (
            <div key={i} className="rounded-lg border border-brand-border bg-white p-3 space-y-2">
              <p>Dải khảo sát: <b>{BAND_LABEL[s.targetBand] || s.targetBand}</b> (BE chỉ nhận phạm vi nằm trong bộ dữ liệu đã nộp của nhiệm vụ gốc)</p>
              <div className="flex flex-wrap gap-2">
                {s.segmentIds.map((id) => (<label key={id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors ${picked[`${i}:${id}`] ? 'border-brand-navy bg-brand-navy/5 text-brand-navy' : 'border-brand-border hover:bg-brand-surfaceAlt'}`}><input type="checkbox" className="accent-brand-navy" disabled={busy} checked={!!picked[`${i}:${id}`]} onChange={() => setPicked((p) => ({ ...p, [`${i}:${id}`]: !p[`${i}:${id}`] }))} />#{id.slice(0, 8)}</label>))}
              </div>
            </div>
          ))}
        </div>
      )}
      <Field label="Lý do thao tác khảo sát"><textarea aria-label="Lý do thao tác khảo sát" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={cls} /></Field>
      <Feedback error={error} message={message} />
      <div className="rg-footer">
        {childId && <PanelButton onClick={openChild}>Mở nhiệm vụ bổ sung #{childId.slice(0, 8)}</PanelButton>}
        <PanelButton variant={isTask && act === 'cancel' ? 'danger' : 'primary'} loading={busy} disabled={busy || !reason.trim() || (needOperator && !operatorId) || (isTask && act === 'supplement' && !hasSupplementScope)} onClick={() => { void submit() }}>
          {busy ? 'Đang gửi…' : !isTask ? 'Xác nhận hoãn kế hoạch' : act === 'cancel' ? 'Xác nhận hủy nhiệm vụ' : act === 'supplement' ? 'Xác nhận tạo nhiệm vụ bổ sung' : 'Xác nhận giao lại'}
        </PanelButton>
      </div>
    </PanelShell>
  )
}
