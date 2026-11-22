import React, { useEffect, useState } from 'react'
import { surveyActions } from '../../../api/services/surveyActions'
import { surveyDatasetService, type DatasetListItem } from '../../../api/services/surveyDatasetService'
import { surveyPlanningService, surveyStatusLabel, type SurveyRecord } from '../../../api/services/surveyPlanningService'
import { exportError } from '../../../api/services/projectExportService'
import { Feedback, Field, KV, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

const cls = 'rg-field w-full'
const METHOD = 'pm-evidence-review.v1'
const shortOf = (id: string) => `NV-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`
// Mã lý do BE trả khi 409 survey_plan_completion_blocked (SURVEY-TYPE-CONFLICT-AND-PLAN-COMPLETION.md).
const BLOCK_REASONS: Record<string, string> = {
  plan_not_in_progress: 'Kế hoạch không ở trạng thái đang thực hiện.',
  plan_lineage_unavailable: 'Không xác định được quan hệ kế hoạch → nhiệm vụ gốc → nhiệm vụ bổ sung (dữ liệu cũ thiếu lineage).',
  plan_scope_unavailable: 'Phạm vi đã ghim của kế hoạch không còn xác định được.',
  plan_source_task_invalid: 'Có nhiệm vụ được chọn không thuộc kế hoạch hoặc không hợp lệ làm nguồn.',
  plan_dataset_lineage_invalid: 'Có bản nộp được chọn không thuộc đúng nhiệm vụ đã chọn.',
  plan_assessment_not_current: 'Có đánh giá không còn là đánh giá hiện hành của bản nộp; hãy tải lại.',
  plan_source_scope_mismatch: 'Phạm vi của nguồn được chọn không khớp phạm vi đã ghim của kế hoạch.',
  plan_scope_not_satisfied: 'Các nguồn đã chọn chưa phủ PASS toàn bộ phạm vi của kế hoạch (vị trí, chất lượng, độ phủ).',
  plan_unhandled_task_branch: 'Còn nhánh nhiệm vụ chưa giải quyết (ví dụ Operator đã từ chối bổ sung): PM phải xử lý, giao lại hoặc hủy nhánh đó trước.',
}
const explain = (e: any) => {
  const d = e?.response?.data
  if (e?.response?.status === 409 && d?.code === 'survey_plan_completion_blocked') return `BE chặn đóng kế hoạch: ${BLOCK_REASONS[d.reasonCode] || `mã ${d.reasonCode || 'không rõ'}`}${d.correlationId ? ` · ${d.correlationId}` : ''}`
  return exportError(e)
}

type Pick = { datasetId: string; assessmentId: string; note: string }

/**
 * PM đóng kế hoạch khảo sát: POST /survey-plans/{planId}/complete {sources[], reason}. Chỉ khi kế hoạch IN_PROGRESS.
 * Với từng nhiệm vụ của kế hoạch (gốc và bổ sung) PM chọn rõ bản nộp; assessmentId đọc từ GET /datasets/{id}/coverage (không tự lấy bản "mới nhất").
 * Khi COMPLETED, hiển thị `completion` do BE lưu (audit bất biến).
 */
export const SurveyPlanCompleteCard: React.FC<{ record: SurveyRecord; planTasks: { id: string; status: string }[]; onDone?: () => void }> = ({ record, planTasks, onDone }) => {
  const [datasets, setDatasets] = useState<Record<string, DatasetListItem[]>>({})
  const [picks, setPicks] = useState<Record<string, Pick>>({})
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const guard = useSubmitGuard()
  const open = record.status === 'IN_PROGRESS'

  useEffect(() => {
    if (!open) return
    let alive = true
    Promise.all(planTasks.map(async (t) => [t.id, (await surveyDatasetService.listDatasets(t.id)).items] as const))
      .then((rows) => { if (alive) setDatasets(Object.fromEntries(rows)) })
      .catch((e) => { if (alive) setError(`Không đọc được bản nộp của các nhiệm vụ: ${explain(e)}`) })
    return () => { alive = false }
  }, [open, record.id, planTasks.map((t) => t.id).join(',')])

  async function choose(taskId: string, datasetId: string) {
    if (!datasetId) { setPicks((p) => { const n = { ...p }; delete n[taskId]; return n }); return }
    setPicks((p) => ({ ...p, [taskId]: { datasetId, assessmentId: '', note: 'Đang đọc đánh giá…' } }))
    try {
      const c = await surveyDatasetService.coverage(datasetId)
      const ok = !!c.assessmentId && c.methodVersion === METHOD
      setPicks((p) => ({ ...p, [taskId]: { datasetId, assessmentId: ok ? c.assessmentId! : '', note: ok ? `Đánh giá hiện hành ${c.assessmentId!.slice(0, 8)}` : `Bản nộp chưa có đánh giá ${METHOD} hiện hành` } }))
    } catch (e) { setPicks((p) => ({ ...p, [taskId]: { datasetId, assessmentId: '', note: `Không đọc được đánh giá: ${explain(e)}` } })) }
  }

  const chosen = Object.entries(picks)
  const ready = chosen.length > 0 && chosen.every(([, p]) => p.assessmentId) && !!reason.trim()

  async function submit() {
    if (!ready || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      await surveyActions.completePlan(record.projectId, record.id, { sources: chosen.map(([taskId, p]) => ({ taskId, datasetId: p.datasetId, assessmentId: p.assessmentId })), reason })
      const now = await surveyPlanningService.detail(record.projectId, record.id, 'PLAN')
      setMessage(`BE đã xác nhận. Trạng thái kế hoạch đọc lại: ${surveyStatusLabel(now.status)}.`)
      onDone?.()
    } catch (e) { setError(`Đóng kế hoạch: ${explain(e)}`) } finally { setBusy(false); guard.release() }
  }

  if (record.status === 'COMPLETED' && record.completion) {
    const c = record.completion
    return (
      <PanelShell icon="task_alt" title="Căn cứ đóng kế hoạch (BE đã lưu)" className="mt-4">
        <div data-testid="plan-completion"><KV items={[
          { k: 'Thời điểm', v: new Date(c.at).toLocaleString('vi-VN') },
          { k: 'Lý do', v: c.reason },
          { k: 'Số nguồn', v: String(c.sources.length) },
        ]} /></div>
        {c.sources.map((s) => <p key={s.datasetId} className="text-xs text-slate-600">{shortOf(s.taskId)} · bản nộp <span className="font-mono">{s.datasetId.slice(0, 8)}</span> · đánh giá <span className="font-mono">{s.assessmentId.slice(0, 8)}</span></p>)}
      </PanelShell>
    )
  }
  if (!open) return null

  return (
    <PanelShell icon="task_alt" title="Xác nhận hoàn tất kế hoạch khảo sát" className="mt-4">
      <p className="text-xs text-slate-500">PM chỉ rõ bản nộp của từng nhiệm vụ (gốc và bổ sung) làm căn cứ. BE chỉ đóng khi các nguồn đã chọn, với đánh giá bằng chứng hiện hành, cùng phủ PASS toàn bộ phạm vi của kế hoạch và không còn nhánh nhiệm vụ chưa giải quyết.</p>
      {planTasks.length === 0 && <p className="text-xs text-amber-800">Kế hoạch chưa có nhiệm vụ nào.</p>}
      <div className="space-y-3">
        {planTasks.map((t) => (
          <div key={t.id} className="rg-subcard text-xs space-y-1">
            <p><b>{shortOf(t.id)}</b> · {surveyStatusLabel(t.status)}</p>
            <select aria-label={`Bản nộp của ${shortOf(t.id)}`} className={cls} disabled={busy} value={picks[t.id]?.datasetId || ''} onChange={(e) => { void choose(t.id, e.target.value) }}>
              <option value="">{(datasets[t.id] || []).length ? 'Không dùng nhiệm vụ này làm nguồn' : 'Chưa có bản nộp'}</option>
              {(datasets[t.id] || []).map((d) => <option key={d.id} value={d.id}>{`Bản ${d.versionNo} · ${d.submittedAt ? new Date(d.submittedAt).toLocaleString('vi-VN') : 'chưa rõ giờ nộp'}`}</option>)}
            </select>
            {picks[t.id] && <p className={picks[t.id].assessmentId ? 'text-slate-600' : 'text-amber-800'}>{picks[t.id].note}</p>}
          </div>
        ))}
      </div>
      <Field label="Lý do xác nhận">
        <textarea aria-label="Lý do đóng kế hoạch" rows={2} maxLength={1000} className={cls} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ví dụ: PM xác nhận đủ phạm vi kế hoạch qua hồ sơ đã đánh giá" />
      </Field>
      <Feedback error={error} message={message} />
      <div className="rg-footer">
        <PanelButton variant="primary" loading={busy} disabled={busy || !ready} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Xác nhận hoàn tất kế hoạch'}</PanelButton>
      </div>
    </PanelShell>
  )
}
