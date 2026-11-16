import React, { useState } from 'react'
import { surveyDatasetService, type AssessmentItem, type AssessmentView, type DatasetCoverage, type DatasetDetail, type ProcessingJob, type Verdict } from '../../../api/services/surveyDatasetService'
import type { SurveyRecord } from '../../../api/services/surveyPlanningService'
import { exportError } from '../../../api/services/projectExportService'

const VERDICT_LABEL: Record<Verdict, string> = { PASS: 'Đạt', FAIL: 'Không đạt', UNKNOWN: 'Chưa rõ' }
const BAND_LABEL: Record<string, string> = { SURFACE: 'Mặt đường', LEFT_EDGE: 'Lề trái', RIGHT_EDGE: 'Lề phải' }
type Row = { routeVersionId: string; segmentSetId: string; segmentId: string; targetBand: string; positionStatus: Verdict; qualityStatus: Verdict; coverageStatus: Verdict }

/**
 * PM-06/PM-07: bộ dữ liệu của nhiệm vụ khảo sát — độ phủ, đánh giá, khóa baseline, processing-jobs.
 * BE không trả datasetId trong chi tiết nhiệm vụ nên PM nhập mã bộ dữ liệu (xem API-GAP-NOTES mục S).
 */
export const SurveyDatasetPanel: React.FC<{ record: SurveyRecord }> = ({ record }) => {
  const [datasetId, setDatasetId] = useState('')
  const [dataset, setDataset] = useState<DatasetDetail | null>(null)
  const [etag, setEtag] = useState('')
  const [coverage, setCoverage] = useState<DatasetCoverage | null>(null)
  const [assessment, setAssessment] = useState<AssessmentView | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [fileId, setFileId] = useState('')
  const [fromMs, setFromMs] = useState('0')
  const [toMs, setToMs] = useState('5000')
  const [reason, setReason] = useState('')
  const [baselineReason, setBaselineReason] = useState('')
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<ProcessingJob | null>(null)
  const [jobReason, setJobReason] = useState('')
  const [workInfo, setWorkInfo] = useState('')
  const [aiStage, setAiStage] = useState<'VIDEO_ANALYSIS' | 'DUPLICATE_MATCHING'>('VIDEO_ANALYSIS')
  const [aiFixture, setAiFixture] = useState('')
  const [aiFixtures, setAiFixtures] = useState<string[]>([])
  const [aiGeometry, setAiGeometry] = useState('')
  const [jobList, setJobList] = useState<ProcessingJob[]>([])
  const [baselineId, setBaselineId] = useState('')
  const [baselineInfo, setBaselineInfo] = useState('')
  const [mode, setMode] = useState<'MOCK' | 'REAL'>('MOCK')
  const [pre, setPre] = useState('')
  const [cfg, setCfg] = useState('')
  const [modelVersionId, setModelVersionId] = useState('')
  const [scopeIndex, setScopeIndex] = useState(0)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const run = async (name: string, fn: () => Promise<void>) => {
    if (busy) return
    setBusy(name); setError(''); setMessage('')
    try { await fn() } catch (e) { setError(exportError(e)) } finally { setBusy('') }
  }
  const load = () => run('load', async () => {
    const { dataset: d, etag: t } = await surveyDatasetService.dataset(datasetId, { taskId: record.id, projectId: record.projectId })
    const c = await surveyDatasetService.coverage(d.id)
    setDataset(d); setEtag(t); setCoverage(c); setAssessment(null); setScopeIndex(0)
    setFileId(d.sourceFiles[0]?.fileId || '')
    setRows(d.scope.flatMap((s) => s.segmentIds.map((segmentId) => ({ routeVersionId: s.routeVersionId, segmentSetId: s.segmentSetId, segmentId, targetBand: s.targetBand, positionStatus: 'UNKNOWN' as Verdict, qualityStatus: 'UNKNOWN' as Verdict, coverageStatus: 'UNKNOWN' as Verdict }))))
    if (c.assessmentId) setAssessment(await surveyDatasetService.assessment(d.id, c.assessmentId))
  })
  const setRow = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  const createAssessment = () => run('assess', async () => {
    if (!dataset) return
    const from = Number(fromMs), to = Number(toMs)
    if (!fileId || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to <= from) throw new Error('Bằng chứng cần tệp nguồn và khoảng mili-giây hợp lệ (đến > từ ≥ 0).')
    const items: AssessmentItem[] = rows.map((r) => ({ ...r, targetBand: r.targetBand, reason: reason.trim(), evidence: [{ fileId, fromMilliseconds: from, toMilliseconds: to }] }))
    const created = await surveyDatasetService.createAssessment(dataset.id, etag, items)
    setAssessment(created)
    setCoverage(await surveyDatasetService.coverage(dataset.id))
    setMessage('Đã tạo đánh giá bộ dữ liệu.')
  })
  const lock = () => run('lock', async () => {
    if (!dataset || !assessment) return
    const locked = await surveyDatasetService.lockBaseline(record.projectId, dataset, assessment.id, baselineReason) as { id?: string }
    if (locked?.id) setBaselineId(locked.id)
    setMessage(`Đã khóa baseline cho các phân đoạn của bộ dữ liệu${locked?.id ? ` (mã lần khóa ${locked.id})` : ''}.`)
  })
  const readBaseline = () => run('baseline', async () => {
    const v = await surveyDatasetService.baselineView(record.projectId, baselineId)
    setBaselineInfo(`Lần khóa ${v.id.slice(0, 8)} · ${v.items.length} phân đoạn · ${v.selectedAt ? new Date(v.selectedAt).toLocaleString('vi-VN') : '—'}: ` + v.items.map((i) => `#${i.segmentId.slice(0, 8)} (${i.targetBand})`).join(', '))
  })
  const listJobs = () => run('jobs', async () => { setJobList(await surveyDatasetService.jobs(record.projectId)) })
  const readJob = () => run('job', async () => { const r = await surveyDatasetService.job(jobId); setJob(r.job) })
  const createJob = () => run('create-job', async () => {
    if (!dataset) return
    const created = await surveyDatasetService.createJob(dataset, { scopeIndex, mode, preprocessingVersion: pre, configVersion: cfg, modelVersionId })
    setJobId(created.id || ''); setMessage(`Đã tạo job xử lý${created.id ? ` ${created.id}` : ''}.`)
    if (created.id) setJob((await surveyDatasetService.job(created.id)).job)
  })
  const retry = () => run('retry', async () => {
    await surveyDatasetService.retryJob(jobId, jobReason)
    setJob((await surveyDatasetService.job(jobId)).job); setMessage('Đã yêu cầu chạy lại job.')
  })

  const cls = 'w-full border border-[#E2E5E9] rounded-lg p-2'
  return (
    <section className="space-y-3 text-xs border-t border-[#E2E5E9] pt-4" data-testid="survey-dataset-panel">
      <h4 className="font-bold text-[#1A1D20]">Bộ dữ liệu khảo sát của nhiệm vụ</h4>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={!!busy} onClick={() => { void run('wp', async () => { const w = await surveyDatasetService.workPackage(record.id); setWorkInfo(`Gói công việc: hạn ${w.dueAt ? new Date(w.dueAt).toLocaleString('vi-VN') : '—'} · ${w.geometryRefs?.length ?? 0} tham chiếu hình học (${(w.geometryRefs || []).reduce((n, g) => n + g.segmentIds.length, 0)} phân đoạn) · phiên bản phạm vi ${w.scopeVersion || '—'}`) }) }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'wp' ? 'Đang đọc…' : 'Xem gói công việc'}</button>
        {workInfo && <span data-testid="work-package-info">{workInfo}</span>}
      </div>
      <div className="flex gap-2">
        <input aria-label="Mã bộ dữ liệu" value={datasetId} disabled={!!busy} onChange={(e) => setDatasetId(e.target.value)} placeholder="Mã bộ dữ liệu (datasetId, GUID)" className={cls} />
        <button type="button" disabled={!!busy || !datasetId.trim()} onClick={() => { void load() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2 whitespace-nowrap">{busy === 'load' ? 'Đang đọc…' : 'Đọc bộ dữ liệu'}</button>
      </div>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
      {dataset && (
        <div className="space-y-3">
          <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-1">
            <p>Toàn vẹn: <b>{dataset.integrityStatus || '—'}</b> · Telemetry: <b>{dataset.telemetryStatus || '—'}</b></p>
            <p>Nộp lúc: {dataset.submittedAt ? new Date(dataset.submittedAt).toLocaleString('vi-VN') : '—'} · Tệp nguồn: {dataset.sourceFiles.length}</p>
          </div>
          <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-1" data-testid="dataset-coverage">
            <p className="font-semibold">Độ phủ (phương pháp {coverage?.methodVersion || '—'})</p>
            {coverage?.items.map((c, i) => (
              <p key={i}>{BAND_LABEL[c.scope.targetBand] || c.scope.targetBand}: vị trí {c.positionCoverage || '—'} · chất lượng {c.qualityCoverage || '—'} · tổng {c.overallCoverage || '—'}{c.reasons?.length ? ` (${c.reasons.join(', ')})` : ''}</p>
            ))}
          </div>
          {assessment ? (
            <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-1" data-testid="dataset-assessment">
              <p className="font-semibold">Đánh giá {assessment.methodVersion || ''} · {assessment.reviewedAt ? new Date(assessment.reviewedAt).toLocaleString('vi-VN') : ''}</p>
              {assessment.items.map((a, i) => (<p key={i}>Phân đoạn {a.segmentId.slice(0, 8)} · {BAND_LABEL[a.targetBand] || a.targetBand}: vị trí {VERDICT_LABEL[a.positionStatus]} · chất lượng {VERDICT_LABEL[a.qualityStatus]} · độ phủ {VERDICT_LABEL[a.coverageStatus]} — {a.reason}</p>))}
              <textarea aria-label="Lý do khóa baseline" rows={2} maxLength={2000} disabled={!!busy} value={baselineReason} onChange={(e) => setBaselineReason(e.target.value)} placeholder="Lý do khóa baseline" className={cls} />
              <button type="button" disabled={!!busy || !baselineReason.trim()} onClick={() => { void lock() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'lock' ? 'Đang gửi…' : 'Khóa baseline'}</button>
              <div className="flex gap-2">
                <input aria-label="Mã lần khóa baseline" disabled={!!busy} value={baselineId} onChange={(e) => setBaselineId(e.target.value)} placeholder="Mã lần khóa baseline (GUID)" className={cls} />
                <button type="button" disabled={!!busy || !baselineId.trim()} onClick={() => { void readBaseline() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2 whitespace-nowrap">Xem lần khóa</button>
              </div>
              {baselineInfo && <p data-testid="baseline-view">{baselineInfo}</p>}
            </div>
          ) : (
            <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-2" data-testid="dataset-assessment-form">
              <p className="font-semibold">Tạo đánh giá bộ dữ liệu</p>
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <span>{r.segmentId.slice(0, 8)} · {BAND_LABEL[r.targetBand] || r.targetBand}</span>
                  {(['positionStatus', 'qualityStatus', 'coverageStatus'] as const).map((k) => (
                    <select key={k} aria-label={`${k === 'positionStatus' ? 'Vị trí' : k === 'qualityStatus' ? 'Chất lượng' : 'Độ phủ'} phân đoạn ${i + 1}`} disabled={!!busy} value={r[k]} onChange={(e) => setRow(i, { [k]: e.target.value as Verdict })} className="border border-[#E2E5E9] rounded-lg p-1">
                      {(Object.keys(VERDICT_LABEL) as Verdict[]).map((v) => (<option key={v} value={v}>{VERDICT_LABEL[v]}</option>))}
                    </select>
                  ))}
                </div>
              ))}
              <select aria-label="Tệp bằng chứng" disabled={!!busy} value={fileId} onChange={(e) => setFileId(e.target.value)} className={cls}>
                {dataset.sourceFiles.map((f) => (<option key={f.fileId} value={f.fileId}>{f.purpose || 'Tệp'} · {f.mediaType || ''} · {f.fileId.slice(0, 8)}</option>))}
              </select>
              <div className="flex gap-2">
                <input aria-label="Từ mili-giây" inputMode="numeric" disabled={!!busy} value={fromMs} onChange={(e) => setFromMs(e.target.value)} className={cls} />
                <input aria-label="Đến mili-giây" inputMode="numeric" disabled={!!busy} value={toMs} onChange={(e) => setToMs(e.target.value)} className={cls} />
              </div>
              <textarea aria-label="Lý do đánh giá" rows={2} maxLength={2000} disabled={!!busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do đánh giá" className={cls} />
              <button type="button" disabled={!!busy || !reason.trim() || !fileId} onClick={() => { void createAssessment() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'assess' ? 'Đang gửi…' : 'Lưu đánh giá'}</button>
            </div>
          )}
          <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-2" data-testid="processing-job-create">
            <p className="font-semibold">Tạo job xử lý AI</p>
            <select aria-label="Phạm vi xử lý" disabled={!!busy} value={scopeIndex} onChange={(e) => setScopeIndex(Number(e.target.value))} className={cls}>
              {dataset.scope.map((s, i) => (<option key={i} value={i}>{BAND_LABEL[s.targetBand] || s.targetBand} · {s.segmentIds.length} phân đoạn</option>))}
            </select>
            <select aria-label="Chế độ xử lý" disabled={!!busy} value={mode} onChange={(e) => setMode(e.target.value as 'MOCK' | 'REAL')} className={cls}><option value="MOCK">MOCK</option><option value="REAL">REAL</option></select>
            <input aria-label="Mã phiên bản mô hình" disabled={!!busy} value={modelVersionId} onChange={(e) => setModelVersionId(e.target.value)} placeholder="modelVersionId (GUID)" className={cls} />
            <div className="flex gap-2">
              <input aria-label="Phiên bản tiền xử lý" disabled={!!busy} value={pre} onChange={(e) => setPre(e.target.value)} placeholder="preprocessingVersion" className={cls} />
              <input aria-label="Phiên bản cấu hình" disabled={!!busy} value={cfg} onChange={(e) => setCfg(e.target.value)} placeholder="configVersion" className={cls} />
            </div>
            <button type="button" disabled={!!busy || !pre.trim() || !cfg.trim() || !modelVersionId.trim()} onClick={() => { void createJob() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'create-job' ? 'Đang gửi…' : 'Tạo job xử lý'}</button>
          </div>
          <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-2" data-testid="ai-run-create">
            <p className="font-semibold">Chạy AI mock trên bộ dữ liệu</p>
            <p className="text-slate-500">Dùng phạm vi, mô hình, phiên bản tiền xử lý và cấu hình đã nhập ở khung trên.</p>
            <select aria-label="Giai đoạn AI" disabled={!!busy} value={aiStage} onChange={(e) => setAiStage(e.target.value as 'VIDEO_ANALYSIS' | 'DUPLICATE_MATCHING')} className={cls}><option value="VIDEO_ANALYSIS">VIDEO_ANALYSIS</option><option value="DUPLICATE_MATCHING">DUPLICATE_MATCHING</option></select>
            <input aria-label="Phiên bản fixture" list="ai-fixtures" disabled={!!busy} value={aiFixture} onChange={(e) => setAiFixture(e.target.value)} placeholder="fixtureVersion" className={cls} />
            <datalist id="ai-fixtures">{aiFixtures.map((f) => (<option key={f} value={f} />))}</datalist>
            <input aria-label="Phiên bản hình học kỳ vọng" disabled={!!busy} value={aiGeometry} onChange={(e) => setAiGeometry(e.target.value)} placeholder="expectedGeometryVersion" className={cls} />
            <div className="flex gap-2">
              <button type="button" disabled={!!busy} onClick={() => { void run('hints', async () => { const h = await surveyDatasetService.aiRunHints(record.projectId, dataset.scope[scopeIndex].segmentSetId); setAiFixtures(h.fixtures); if (h.geometryVersion) setAiGeometry(h.geometryVersion); setMessage(h.geometryVersion ? 'Đã lấy phiên bản hình học và fixture từ các phát hiện AI đã có.' : 'Chưa có phát hiện AI nào trên cùng bộ phân đoạn để gợi ý phiên bản hình học; nhập tay.') }) }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'hints' ? 'Đang lấy…' : 'Lấy gợi ý từ phát hiện AI đã có'}</button>
              <button type="button" disabled={!!busy || !pre.trim() || !cfg.trim() || !modelVersionId.trim() || !aiFixture.trim() || !aiGeometry.trim()} onClick={() => { void run('ai-run', async () => { const r = await surveyDatasetService.createAiRun(record.projectId, dataset, { scopeIndex, stage: aiStage, modelVersionId, preprocessingVersion: pre, configVersion: cfg, fixtureVersion: aiFixture, expectedGeometryVersion: aiGeometry }); setMessage(`Đã tạo lần chạy AI ${r.id} (${r.status || '—'}).`) }) }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'ai-run' ? 'Đang gửi…' : 'Chạy AI mock'}</button>
            </div>
          </div>
        </div>
      )}
      <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-2" data-testid="processing-job-view">
        <p className="font-semibold">Theo dõi job xử lý</p>
        <button type="button" disabled={!!busy} onClick={() => { void listJobs() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'jobs' ? 'Đang tải…' : 'Danh sách job của dự án'}</button>
        {jobList.length > 0 && <div data-testid="job-list" className="space-y-1">{jobList.map((j) => (<button key={j.id} type="button" onClick={() => setJobId(j.id)} className="block text-left underline">#{j.id.slice(0, 8)} · {j.jobType || '—'} · {j.status} · lần {j.attemptNumber ?? '—'}</button>))}</div>}
        <div className="flex gap-2">
          <input aria-label="Mã job xử lý" disabled={!!busy} value={jobId} onChange={(e) => setJobId(e.target.value)} placeholder="Mã job (GUID)" className={cls} />
          <button type="button" disabled={!!busy || !jobId.trim()} onClick={() => { void readJob() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2 whitespace-nowrap">{busy === 'job' ? 'Đang đọc…' : 'Đọc job'}</button>
        </div>
        {job && (
          <div className="space-y-1">
            <p>Trạng thái: <b>{job.status}</b> · Loại: {job.jobType || '—'} · Lần chạy: {job.attemptNumber ?? '—'}{job.resultId ? ` · Kết quả: ${job.resultId.slice(0, 8)}` : ''}</p>
            <textarea aria-label="Lý do chạy lại job" rows={2} maxLength={2000} disabled={!!busy} value={jobReason} onChange={(e) => setJobReason(e.target.value)} placeholder="Lý do chạy lại" className={cls} />
            <button type="button" disabled={!!busy || !jobReason.trim()} onClick={() => { void retry() }} className="border border-[#E2E5E9] rounded-lg px-3 py-2">{busy === 'retry' ? 'Đang gửi…' : 'Chạy lại job'}</button>
          </div>
        )}
      </div>
    </section>
  )
}
