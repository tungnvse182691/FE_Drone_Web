import React, { useEffect, useState } from 'react'
import { surveyActions } from '../../../api/services/surveyActions'
import { surveyDatasetService, type DatasetCoverage, type DatasetListItem } from '../../../api/services/surveyDatasetService'
import { surveyPlanningService, type SurveyRecord } from '../../../api/services/surveyPlanningService'
import { exportError } from '../../../api/services/projectExportService'
import { Feedback, Field, KV, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

const cls = 'rg-field w-full'
const METHOD = 'pm-evidence-review.v1'

/**
 * PM xác nhận hoàn thành nhiệm vụ khảo sát: POST /survey-tasks/{taskId}/complete {datasetId, assessmentId, reason}.
 * Chỉ hiện khi nhiệm vụ đã nộp (SUBMITTED). Bản nộp do PM chọn rõ ràng (không tự lấy bản mới nhất); assessmentId là đánh giá hiện hành của bản nộp đó.
 * "Đã nộp", "upload VERIFIED", "AI SUCCEEDED" đều KHÔNG phải hoàn thành: chỉ trạng thái COMPLETED đọc lại từ BE mới tính.
 */
export const SurveyCompleteCard: React.FC<{ record: SurveyRecord; onDone?: () => void }> = ({ record, onDone }) => {
  const [datasets, setDatasets] = useState<DatasetListItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [datasetId, setDatasetId] = useState('')
  const [coverage, setCoverage] = useState<DatasetCoverage | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const guard = useSubmitGuard()

  useEffect(() => {
    if (record.status !== 'SUBMITTED') return
    let alive = true
    surveyDatasetService.listDatasets(record.id)
      .then((page) => { if (alive) { setDatasets(page.items); setLoaded(true) } })
      .catch((e) => { if (alive) { setError(`Không đọc được các bản nộp của nhiệm vụ: ${exportError(e)}`); setLoaded(true) } })
    return () => { alive = false }
  }, [record.id, record.status])

  useEffect(() => {
    setCoverage(null)
    if (!datasetId) return
    let alive = true
    surveyDatasetService.coverage(datasetId)
      .then((c) => { if (alive) { setCoverage(c); setError('') } })
      .catch((e) => { if (alive) setError(`Không đọc được độ phủ/đánh giá của bản nộp: ${exportError(e)}`) })
    return () => { alive = false }
  }, [datasetId])

  if (record.status !== 'SUBMITTED') return null

  const hasAssessment = !!coverage?.assessmentId && coverage.methodVersion === METHOD
  const summary = coverage?.items?.map((i, idx) => ({ idx, band: i.scope.targetBand, overall: i.overallCoverage || i.coverageStatus || 'UNKNOWN' })) || []

  async function submit() {
    if (!coverage?.assessmentId || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      await surveyActions.completeTask(record.projectId, record.id, { datasetId, assessmentId: coverage.assessmentId, reason })
      const now = await surveyPlanningService.detail(record.projectId, record.id, 'TASK')
      setMessage(`BE đã xác nhận. Trạng thái nhiệm vụ đọc lại: ${now.status}.`)
      setReason('')
      onDone?.()
    } catch (e) {
      setError(`Hoàn tất nhiệm vụ: ${exportError(e)}`)
    } finally {
      setBusy(false); guard.release()
    }
  }

  return (
    <PanelShell icon="task_alt" title="Xác nhận hoàn tất nhiệm vụ khảo sát" className="mt-4">
      <p className="text-xs text-slate-500">
        PM chọn bản nộp và xác nhận khi đánh giá bằng chứng hiện hành của bản nộp đạt PASS (vị trí, chất lượng, độ phủ) cho toàn bộ phân đoạn và dải của nhiệm vụ. Trạng thái "Đã nộp" chưa phải hoàn thành.
      </p>
      <div className="rg-grid">
        <Field label="Bản nộp bộ dữ liệu dùng để xác nhận" span="col-span-12 md:col-span-8">
          <select aria-label="Bản nộp xác nhận hoàn tất" className={cls} disabled={busy || !loaded} value={datasetId} onChange={(e) => setDatasetId(e.target.value)}>
            <option value="">{loaded ? (datasets.length ? 'Chọn bản nộp' : 'Nhiệm vụ chưa có bản nộp') : 'Đang đọc…'}</option>
            {datasets.map((d) => (<option key={d.id} value={d.id}>{`Bản ${d.versionNo} · ${d.submittedAt ? new Date(d.submittedAt).toLocaleString('vi-VN') : 'chưa rõ giờ nộp'}`}</option>))}
          </select>
        </Field>
      </div>
      {datasetId && coverage && (
        <div className="rg-subcard space-y-1 text-xs" data-testid="survey-complete-assessment">
          <KV items={[
            { k: 'Đánh giá hiện hành', v: coverage.assessmentId ? coverage.assessmentId.slice(0, 8) : 'Chưa có', mono: true },
            { k: 'Phương pháp', v: coverage.methodVersion || '—' },
          ]} />
          {summary.map((s) => (<p key={s.idx}>Dải <b>{s.band}</b>: độ phủ <b>{s.overall}</b></p>))}
          {!hasAssessment && <p role="alert" className="text-amber-800">Bản nộp chưa có đánh giá {METHOD} hiện hành. Tạo đánh giá bằng chứng cho bản nộp trước khi hoàn tất.</p>}
        </div>
      )}
      <Field label="Lý do xác nhận">
        <textarea aria-label="Lý do xác nhận hoàn tất nhiệm vụ" rows={2} maxLength={2000} className={cls} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ví dụ: hồ sơ đáp ứng đủ phạm vi nhiệm vụ" />
      </Field>
      <Feedback error={error} message={message} />
      <div className="rg-footer">
        <PanelButton variant="primary" loading={busy} disabled={busy || !datasetId || !hasAssessment || !reason.trim()} onClick={() => { void submit() }}>
          {busy ? 'Đang gửi…' : 'Xác nhận hoàn tất nhiệm vụ'}
        </PanelButton>
      </div>
    </PanelShell>
  )
}
