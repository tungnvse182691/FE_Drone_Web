import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { surveyActions } from '../../../api/services/surveyActions'
import { surveyPlanningService, surveyStatusLabel, type SurveyRecord, type SurveyScope } from '../../../api/services/surveyPlanningService'
import type { AvailablePilot } from '../create-survey/types'
import { exportError } from '../../../api/services/projectExportService'

type TaskAct = 'reassign' | 'cancel' | 'supplement'
const BAND_LABEL: Record<string, string> = { SURFACE: 'Mặt đường', LEFT_EDGE: 'Lề trái', RIGHT_EDGE: 'Lề phải' }

/** PM-06: hoãn kế hoạch khảo sát; giao lại, hủy hoặc tạo nhiệm vụ bổ sung cho nhiệm vụ khảo sát. Hiển thị sau khi đã đọc chi tiết từ BE. */
export const SurveyRecordActions: React.FC<{ record: SurveyRecord; onDone: () => void }> = ({ record, onDone }) => {
  const [act, setAct] = useState<TaskAct>('reassign')
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
  const [error, setError] = useState('')
  const [message, setMessage] = useState(saved.message || '')
  const [params, setParams] = useSearchParams()
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

  const supplementScope = (): SurveyScope[] => (record.scope || [])
    .map((s, i) => ({ routeVersionId: s.routeVersionId, segmentSetId: s.segmentSetId, targetBand: s.targetBand, segmentIds: s.segmentIds.filter((id) => picked[`${i}:${id}`]) }))
    .filter((s) => s.segmentIds.length > 0)
  const hasSupplementScope = supplementScope().length > 0

  const submit = async () => {
    if (busy) return
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
      setBusy(false)
    }
  }
  const openChild = () => { const next = new URLSearchParams(params); next.set('surveyRecordId', childId); next.set('surveyRecordKind', 'TASK'); setParams(next) }
  const needOperator = isTask && (act === 'reassign' || act === 'supplement')
  const cls = 'w-full border border-[#E2E5E9] rounded-lg p-2'

  return (
    <section className="space-y-2 text-xs border-t border-[#E2E5E9] pt-4" data-testid="survey-record-actions">
      <h4 className="font-bold text-[#1A1D20]">{isTask ? 'PM giao lại, hủy hoặc bổ sung nhiệm vụ khảo sát' : 'PM hoãn kế hoạch khảo sát'}</h4>
      {isTask && (
        <select aria-label="Thao tác nhiệm vụ khảo sát" disabled={busy} value={act} onChange={(e) => setAct(e.target.value as TaskAct)} className={cls}>
          <option value="reassign">Giao lại cho Operator khác</option>
          <option value="supplement">Tạo nhiệm vụ bổ sung</option>
          <option value="cancel">Hủy nhiệm vụ</option>
        </select>
      )}
      {needOperator && (
        <select aria-label="Operator nhận nhiệm vụ" disabled={busy} value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className={cls}>
          <option value="">Chọn Operator</option>
          {operators.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
        </select>
      )}
      {isTask && act === 'reassign' && (
        <input aria-label="Hạn hoàn thành mới" type="datetime-local" disabled={busy} value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={cls} />
      )}
      {isTask && act === 'supplement' && (
        <div className="space-y-2" data-testid="supplement-scope">
          <p className="font-semibold">Phạm vi cần bổ sung (chọn phân đoạn của nhiệm vụ gốc)</p>
          {(record.scope || []).map((s, i) => (
            <div key={i} className="rounded-lg border border-[#E2E5E9] p-2 space-y-1">
              <p>Dải khảo sát: <b>{BAND_LABEL[s.targetBand] || s.targetBand}</b> (BE chỉ nhận phạm vi nằm trong bộ dữ liệu đã nộp của nhiệm vụ gốc)</p>
              <div className="flex flex-wrap gap-3">
                {s.segmentIds.map((id) => (<label key={id} className="flex items-center gap-1"><input type="checkbox" disabled={busy} checked={!!picked[`${i}:${id}`]} onChange={() => setPicked((p) => ({ ...p, [`${i}:${id}`]: !p[`${i}:${id}`] }))} />#{id.slice(0, 8)}</label>))}
              </div>
            </div>
          ))}
        </div>
      )}
      <textarea aria-label="Lý do thao tác khảo sát" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={cls} />
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
      {childId && <button type="button" onClick={openChild} className="underline text-emerald-800">Mở nhiệm vụ bổ sung #{childId.slice(0, 8)}</button>}
      <button type="button" disabled={busy || !reason.trim() || (needOperator && !operatorId) || (isTask && act === 'supplement' && !hasSupplementScope)} onClick={() => { void submit() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">
        {busy ? 'Đang gửi…' : !isTask ? 'Xác nhận hoãn kế hoạch' : act === 'cancel' ? 'Xác nhận hủy nhiệm vụ' : act === 'supplement' ? 'Xác nhận tạo nhiệm vụ bổ sung' : 'Xác nhận giao lại'}
      </button>
    </section>
  )
}
