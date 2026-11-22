import React, { useEffect, useState } from 'react'
import { surveyDatasetService, type AssessmentItem, type AssessmentView, type DatasetCoverage, type DatasetDetail, type DatasetListItem, type ProcessingJob, type Verdict } from '../../../api/services/surveyDatasetService'
import type { SurveyRecord } from '../../../api/services/surveyPlanningService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, KV, Loading, PanelButton, PanelShell, Pill, SectionTitle } from '../../../components/ui/PanelKit'
import { Icon } from '../../../components/ui/Icon'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { SourceVideoPanel } from './SourceVideoPanel'
import { AiRunTracker } from './AiRunTracker'
import { sourceVideosOf } from '../../../api/services/sourceVideoService'

const VERDICT_LABEL: Record<Verdict, string> = { PASS: 'Đạt', FAIL: 'Không đạt', UNKNOWN: 'Chưa rõ' }
const BAND_LABEL: Record<string, string> = { SURFACE: 'Mặt đường', LEFT_EDGE: 'Lề trái', RIGHT_EDGE: 'Lề phải' }
type Row = { routeVersionId: string; segmentSetId: string; segmentId: string; targetBand: string; positionStatus: Verdict; qualityStatus: Verdict; coverageStatus: Verdict }

/**
 * PM-06/PM-07: bộ dữ liệu của nhiệm vụ khảo sát — độ phủ, đánh giá, khóa baseline, processing-jobs.
 * Danh sách bản nộp lấy theo nhiệm vụ: GET /survey-tasks/{taskId}/datasets (mới nhất trước, phân trang cursor); mặc định mở bản đầu.
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
  const [lockPick, setLockPick] = useState<Record<string, boolean>>({})
  const [current, setCurrent] = useState<Record<string, { selectionId: string; datasetId: string }>>({})
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<ProcessingJob | null>(null)
  const [jobReason, setJobReason] = useState('')
  const [workInfo, setWorkInfo] = useState('')
  const [dsList, setDsList] = useState<DatasetListItem[] | null>(null)
  const [dsNext, setDsNext] = useState<string | null>(null)
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
  const [lastRunId, setLastRunId] = useState('') // lần chạy AI vừa tạo (runId), để làm nổi bật trong AiRunTracker
  const [trackKey, setTrackKey] = useState(0)
  const [busy, setBusy] = useState('')
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const run = async (name: string, fn: () => Promise<void>) => {
    if (!guard.acquire()) return
    setBusy(name); setError(''); setMessage('')
    try { await fn() } catch (e) { setError(exportError(e)) } finally { setBusy(''); guard.release() }
  }
  const load = (id: string) => run('load', async () => {
    const { dataset: d, etag: t } = await surveyDatasetService.dataset(id, { taskId: record.id, projectId: record.projectId })
    const c = await surveyDatasetService.coverage(d.id)
    setDataset(d); setEtag(t); setCoverage(c); setAssessment(null); setScopeIndex(0); setAiGeometry('')
    setFileId(sourceVideosOf(d.sourceFiles)[0]?.fileId || '') // chỉ mặc định theo video nguồn; telemetry/tệp khác phải do PM chọn
    setRows(d.scope.flatMap((s) => s.segmentIds.map((segmentId) => ({ routeVersionId: s.routeVersionId, segmentSetId: s.segmentSetId, segmentId, targetBand: s.targetBand, positionStatus: 'UNKNOWN' as Verdict, qualityStatus: 'UNKNOWN' as Verdict, coverageStatus: 'UNKNOWN' as Verdict }))))
    if (c.assessmentId) setAssessment(await surveyDatasetService.assessment(d.id, c.assessmentId))
  })
  // Tải danh sách bản nộp khi mở nhiệm vụ (và khi tải lại trang): mặc định mở bản đầu tiên.
  useEffect(() => {
    let alive = true
    setDsList(null); setDsNext(null); setDatasetId(''); setDataset(null); setCoverage(null); setAssessment(null)
    surveyDatasetService.listDatasets(record.id).then((p) => {
      if (!alive) return
      setDsList(p.items); setDsNext(p.nextCursor || null)
      if (p.items[0]) { setDatasetId(p.items[0].id); void load(p.items[0].id) }
    }).catch((e) => { if (alive) { setDsList([]); setError(`Không đọc được danh sách bản nộp: ${exportError(e)}`) } })
    return () => { alive = false }
  }, [record.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const more = () => run('dsmore', async () => { if (!dsNext) return; const p = await surveyDatasetService.listDatasets(record.id, dsNext); setDsList((l) => [...(l || []), ...p.items]); setDsNext(p.nextCursor || null) })
  const pick = (id: string) => { setDatasetId(id); if (id) void load(id) }
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
  // Điều kiện khóa baseline theo BE: phương pháp pm-evidence-review.v1 và CẢ BA kết quả (vị trí, chất lượng, độ phủ) của đúng đoạn/dải đều PASS.
  const eligibility = (a: AssessmentItem) => {
    const bad = [a.positionStatus !== 'PASS' && `vị trí ${VERDICT_LABEL[a.positionStatus]}`, a.qualityStatus !== 'PASS' && `chất lượng ${VERDICT_LABEL[a.qualityStatus]}`, a.coverageStatus !== 'PASS' && `độ phủ ${VERDICT_LABEL[a.coverageStatus]}`].filter(Boolean) as string[]
    if (assessment?.methodVersion !== 'pm-evidence-review.v1') bad.unshift('phương pháp đánh giá không phải pm-evidence-review.v1')
    return { ok: bad.length === 0, reason: bad.join(', ') }
  }
  const key = (a: { segmentId: string; targetBand: string }) => `${a.segmentId}:${a.targetBand}`
  useEffect(() => {
    if (!assessment) { setLockPick({}); setCurrent({}); return }
    setLockPick(Object.fromEntries(assessment.items.map((a) => [key(a), eligibility(a).ok])))
    const setIds = Array.from(new Set(assessment.items.map((a) => a.segmentSetId)))
    Promise.all(setIds.map((sid) => surveyDatasetService.currentBaselines(record.projectId, sid))).then((lists) => {
      setCurrent(Object.fromEntries(lists.flat().map((b) => [key(b), { selectionId: b.selectionId, datasetId: b.datasetId }])))
    }).catch((e) => setError(`Không đọc được baseline hiện hành: ${exportError(e)}`))
  }, [assessment]) // eslint-disable-line react-hooks/exhaustive-deps
  const pickedItems = assessment ? assessment.items.filter((a) => lockPick[key(a)] && eligibility(a).ok) : []
  const notLatest = !!dsList && dsList.length > 0 && datasetId !== dsList[0].id
  const lock = () => run('lock', async () => {
    if (!dataset || !assessment) return
    const locked = await surveyDatasetService.lockBaseline(record.projectId, dataset, assessment.id, baselineReason, pickedItems) as { id?: string }
    if (locked?.id) setBaselineId(locked.id)
    setMessage(`Đã khóa baseline cho ${pickedItems.length} đoạn/dải đã chọn${locked?.id ? ` (mã lần khóa ${locked.id})` : ''}.`)
    setAssessment((x) => (x ? { ...x } : x)) // nạp lại baseline hiện hành sau khi khóa
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

  const cls = 'rg-field w-full'
  const dt = (v?: string | null) => (v ? new Date(v).toLocaleString('vi-VN') : '—')
  return (
    <PanelShell icon="dataset" title="Bộ dữ liệu khảo sát của nhiệm vụ" className="mt-4" data-testid="survey-dataset-panel"
      actions={<PanelButton disabled={!!busy} loading={busy === 'wp'} onClick={() => { void run('wp', async () => { const w = await surveyDatasetService.workPackage(record.id); setWorkInfo(`Gói công việc: hạn ${w.dueAt ? new Date(w.dueAt).toLocaleString('vi-VN') : '—'} · ${w.geometryRefs?.length ?? 0} tham chiếu hình học (${(w.geometryRefs || []).reduce((n, g) => n + g.segmentIds.length, 0)} phân đoạn) · phiên bản phạm vi ${w.scopeVersion || '—'}`) }) }}>{busy === 'wp' ? 'Đang đọc…' : 'Xem gói công việc'}</PanelButton>}>
      {workInfo && <div className="rg-alert bg-brand-surfaceAlt border-brand-border text-slate-700"><Icon name="inventory_2" size={16} className="text-brand-navy" /><span data-testid="work-package-info" className="min-w-0 break-words">{workInfo}</span></div>}
      <div className="space-y-2" data-testid="dataset-list">
        {dsList === null && <Loading>Đang tải danh sách bản nộp…</Loading>}
        {dsList && dsList.length === 0 && !error && <Empty icon="folder_off">Chưa có bộ dữ liệu cho nhiệm vụ này.</Empty>}
        {dsList && dsList.length > 0 && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[16rem] flex-1">
              <span className="rg-label">Bản nộp bộ dữ liệu</span>
              <select aria-label="Bản nộp bộ dữ liệu" value={datasetId} disabled={!!busy} onChange={(e) => pick(e.target.value)} className={cls}>
                {dsList.map((d) => (<option key={d.id} value={d.id}>Bản {d.versionNo} · {d.submittedAt ? new Date(d.submittedAt).toLocaleString('vi-VN') : '—'} · {d.integrityStatus || '—'}{d.assessmentId ? ' · đã đánh giá' : ''}</option>))}
              </select>
            </div>
            {dsNext && <PanelButton disabled={!!busy} loading={busy === 'dsmore'} onClick={() => { void more() }}>{busy === 'dsmore' ? 'Đang tải…' : 'Tải thêm bản nộp'}</PanelButton>}
            <PanelButton disabled={!!busy || !datasetId} loading={busy === 'load'} onClick={() => { void load(datasetId) }}>{busy === 'load' ? 'Đang đọc…' : 'Đọc lại bản đang chọn'}</PanelButton>
          </div>
        )}
      </div>
      <Feedback error={error} message={message} />
      {dataset && (
        <div className="space-y-3">
          <div className="rg-subcard">
            <KV items={[
              { k: 'Toàn vẹn', v: dataset.integrityStatus || '—' },
              { k: 'Telemetry', v: dataset.telemetryStatus || '—' },
              { k: 'Nộp lúc', v: dt(dataset.submittedAt) },
              { k: 'Tệp nguồn', v: dataset.sourceFiles.length },
            ]} />
          </div>
          <div className="rg-subcard">
            <SourceVideoPanel key={dataset.id} sourceFiles={dataset.sourceFiles} versionNo={dsList?.find((d) => d.id === dataset.id)?.versionNo} />
          </div>
          <div className="rg-subcard" data-testid="dataset-coverage">
            <SectionTitle icon="donut_large">Độ phủ (phương pháp {coverage?.methodVersion || '—'})</SectionTitle>
            <div className="space-y-1.5">
              {coverage?.items.map((c, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-lg bg-white border border-brand-border px-3 py-2">
                  <span className="col-span-12 sm:col-span-3 font-semibold text-brand-dark">{BAND_LABEL[c.scope.targetBand] || c.scope.targetBand}:</span>
                  <span className="col-span-4 sm:col-span-3">vị trí <b className="font-mono">{c.positionCoverage || '—'}</b></span>
                  <span className="col-span-4 sm:col-span-3">chất lượng <b className="font-mono">{c.qualityCoverage || '—'}</b></span>
                  <span className="col-span-4 sm:col-span-3">tổng <b className="font-mono">{c.overallCoverage || '—'}</b></span>
                  {c.reasons?.length ? <span className="col-span-12 text-slate-500">({c.reasons.join(', ')})</span> : null}
                </div>
              ))}
            </div>
          </div>
          {assessment ? (
            <div className="rg-subcard" data-testid="dataset-assessment">
              <SectionTitle icon="fact_check">Đánh giá {assessment.methodVersion || ''} · {assessment.reviewedAt ? new Date(assessment.reviewedAt).toLocaleString('vi-VN') : ''}</SectionTitle>
              {notLatest && <div className="rg-alert rg-alert-warn"><Icon name="warning" size={16} /><p role="note" className="min-w-0" data-testid="not-latest-warning">Bạn đang chọn bản nộp không phải bản mới nhất (bản mới nhất: {dsList![0].versionNo}). BE vẫn cho khóa baseline từ bản này nếu đoạn/dải đủ điều kiện; bản mới không tự thay baseline đang áp dụng.</p></div>}
              <p className="font-semibold text-slate-600">Chọn đoạn/dải để khóa baseline (chỉ đoạn/dải có đủ vị trí, chất lượng, độ phủ = Đạt)</p>
              <div className="space-y-1.5">
                {assessment.items.map((a, i) => { const el = eligibility(a); const cur = current[key(a)]; return (
                  <label key={i} className="rg-row flex flex-wrap items-start gap-2 cursor-pointer" data-testid="baseline-candidate">
                    <input type="checkbox" className="mt-0.5 accent-brand-navy" disabled={!!busy || !el.ok} checked={!!lockPick[key(a)] && el.ok} onChange={() => setLockPick((p) => ({ ...p, [key(a)]: !p[key(a)] }))} />
                    <span className="min-w-0 flex-1">Phân đoạn {a.segmentId.slice(0, 8)} · {BAND_LABEL[a.targetBand] || a.targetBand}: vị trí {VERDICT_LABEL[a.positionStatus]} · chất lượng {VERDICT_LABEL[a.qualityStatus]} · độ phủ {VERDICT_LABEL[a.coverageStatus]} — {a.reason}</span>
                    {!el.ok && <span className="rg-pill rg-pill-bad whitespace-normal leading-snug">Không đủ điều kiện khóa: {el.reason}</span>}
                    {cur && <span className="rg-pill rg-pill-info whitespace-normal leading-snug">Đang có baseline (bản {cur.datasetId.slice(0, 8)}{cur.datasetId === dataset?.id ? ', cùng bản này' : ', bản khác'}); khóa sẽ thay baseline này</span>}
                  </label>) })}
              </div>
              <Field label="Lý do khóa baseline"><textarea aria-label="Lý do khóa baseline" rows={2} maxLength={2000} disabled={!!busy} value={baselineReason} onChange={(e) => setBaselineReason(e.target.value)} placeholder="Lý do khóa baseline" className={cls} /></Field>
              <div className="rg-footer">
                <PanelButton variant="primary" disabled={!!busy || !baselineReason.trim() || pickedItems.length === 0} loading={busy === 'lock'} onClick={() => { void lock() }}>{busy === 'lock' ? 'Đang gửi…' : `Khóa baseline (${pickedItems.length} đoạn/dải)`}</PanelButton>
              </div>
              <div className="flex items-end gap-2 border-t border-brand-border pt-3">
                <div className="flex-1"><span className="rg-label">Mã lần khóa baseline</span><input aria-label="Mã lần khóa baseline" disabled={!!busy} value={baselineId} onChange={(e) => setBaselineId(e.target.value)} placeholder="Mã lần khóa baseline (GUID)" className={`${cls} font-mono`} /></div>
                <PanelButton className="whitespace-nowrap" disabled={!!busy || !baselineId.trim()} onClick={() => { void readBaseline() }}>Xem lần khóa</PanelButton>
              </div>
              {baselineInfo && <p data-testid="baseline-view" className="rounded-lg bg-white border border-brand-border px-3 py-2 break-words">{baselineInfo}</p>}
            </div>
          ) : (
            <div className="rg-subcard" data-testid="dataset-assessment-form">
              <SectionTitle icon="rule">Tạo đánh giá bộ dữ liệu</SectionTitle>
              <div className="hidden sm:grid grid-cols-12 gap-2 px-2 rg-label !mb-0">
                <span className="col-span-3">Phân đoạn</span><span className="col-span-3">Vị trí</span><span className="col-span-3">Chất lượng</span><span className="col-span-3">Độ phủ</span>
              </div>
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center rounded-lg bg-white border border-brand-border px-2 py-1.5 transition-colors hover:bg-brand-surfaceAlt/70">
                  <span className="col-span-12 sm:col-span-3 truncate font-semibold text-brand-dark" title={`${r.segmentId} · ${BAND_LABEL[r.targetBand] || r.targetBand}`}>{r.segmentId.slice(0, 8)} · {BAND_LABEL[r.targetBand] || r.targetBand}</span>
                  {(['positionStatus', 'qualityStatus', 'coverageStatus'] as const).map((k) => (
                    <select key={k} aria-label={`${k === 'positionStatus' ? 'Vị trí' : k === 'qualityStatus' ? 'Chất lượng' : 'Độ phủ'} phân đoạn ${i + 1}`} disabled={!!busy} value={r[k]} onChange={(e) => setRow(i, { [k]: e.target.value as Verdict })} className="rg-field col-span-4 sm:col-span-3">
                      {(Object.keys(VERDICT_LABEL) as Verdict[]).map((v) => (<option key={v} value={v}>{VERDICT_LABEL[v]}</option>))}
                    </select>
                  ))}
                </div>
              ))}
              <div className="rg-grid">
                <Field label="Tệp bằng chứng" span="col-span-12 md:col-span-6">
                  <select aria-label="Tệp bằng chứng" disabled={!!busy} value={fileId} onChange={(e) => setFileId(e.target.value)} className={cls}>
                    <option value="">Chọn tệp bằng chứng</option>
                    {dataset.sourceFiles.map((f) => (<option key={f.fileId} value={f.fileId}>{f.purpose || 'Tệp'} · {f.mediaType || ''} · {f.fileId.slice(0, 8)}</option>))}
                  </select>
                </Field>
                <Field label="Từ mili-giây" span="col-span-6 md:col-span-3"><input aria-label="Từ mili-giây" inputMode="numeric" disabled={!!busy} value={fromMs} onChange={(e) => setFromMs(e.target.value)} className={`${cls} font-mono`} /></Field>
                <Field label="Đến mili-giây" span="col-span-6 md:col-span-3"><input aria-label="Đến mili-giây" inputMode="numeric" disabled={!!busy} value={toMs} onChange={(e) => setToMs(e.target.value)} className={`${cls} font-mono`} /></Field>
                <Field label="Lý do đánh giá"><textarea aria-label="Lý do đánh giá" rows={2} maxLength={2000} disabled={!!busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do đánh giá" className={cls} /></Field>
              </div>
              <div className="rg-footer">
                <PanelButton variant="primary" disabled={!!busy || !reason.trim() || !fileId} loading={busy === 'assess'} onClick={() => { void createAssessment() }}>{busy === 'assess' ? 'Đang gửi…' : 'Lưu đánh giá'}</PanelButton>
              </div>
            </div>
          )}
          <div className="rg-subcard" data-testid="processing-job-create">
            <SectionTitle icon="memory">Tạo job xử lý AI</SectionTitle>
            <div className="rg-grid">
              <Field label="Phạm vi xử lý" span="col-span-12 md:col-span-6">
                <select aria-label="Phạm vi xử lý" disabled={!!busy} value={scopeIndex} onChange={(e) => { setScopeIndex(Number(e.target.value)); setAiGeometry('') }} className={cls}>
                  {dataset.scope.map((s, i) => (<option key={i} value={i}>{BAND_LABEL[s.targetBand] || s.targetBand} · {s.segmentIds.length} phân đoạn</option>))}
                </select>
              </Field>
              <Field label="Chế độ xử lý" span="col-span-12 md:col-span-6">
                <select aria-label="Chế độ xử lý" disabled={!!busy} value={mode} onChange={(e) => setMode(e.target.value as 'MOCK' | 'REAL')} className={cls}><option value="MOCK">MOCK</option><option value="REAL">REAL</option></select>
              </Field>
              <Field label="Mã phiên bản mô hình"><input aria-label="Mã phiên bản mô hình" disabled={!!busy} value={modelVersionId} onChange={(e) => setModelVersionId(e.target.value)} placeholder="modelVersionId (GUID)" className={`${cls} font-mono`} /></Field>
              <Field label="Phiên bản tiền xử lý" span="col-span-12 md:col-span-6"><input aria-label="Phiên bản tiền xử lý" disabled={!!busy} value={pre} onChange={(e) => setPre(e.target.value)} placeholder="preprocessingVersion" className={cls} /></Field>
              <Field label="Phiên bản cấu hình" span="col-span-12 md:col-span-6"><input aria-label="Phiên bản cấu hình" disabled={!!busy} value={cfg} onChange={(e) => setCfg(e.target.value)} placeholder="configVersion" className={cls} /></Field>
            </div>
            <div className="rg-footer">
              <PanelButton variant="primary" disabled={!!busy || !pre.trim() || !cfg.trim() || !modelVersionId.trim()} loading={busy === 'create-job'} onClick={() => { void createJob() }}>{busy === 'create-job' ? 'Đang gửi…' : 'Tạo job xử lý'}</PanelButton>
            </div>
          </div>
          <div className="rg-subcard" data-testid="ai-run-create">
            <SectionTitle icon="smart_toy">Chạy AI mock trên bộ dữ liệu</SectionTitle>
            <p className="text-slate-500">Dùng phạm vi, mô hình, phiên bản tiền xử lý và cấu hình đã nhập ở khung trên.</p>
            <div className="rg-grid">
              <Field label="Giai đoạn AI" span="col-span-12 md:col-span-4"><select aria-label="Giai đoạn AI" disabled={!!busy} value={aiStage} onChange={(e) => setAiStage(e.target.value as 'VIDEO_ANALYSIS' | 'DUPLICATE_MATCHING')} className={cls}><option value="VIDEO_ANALYSIS">VIDEO_ANALYSIS</option><option value="DUPLICATE_MATCHING">DUPLICATE_MATCHING</option></select></Field>
              <Field label="Phiên bản fixture" span="col-span-12 md:col-span-4"><input aria-label="Phiên bản fixture" list="ai-fixtures" disabled={!!busy} value={aiFixture} onChange={(e) => setAiFixture(e.target.value)} placeholder="fixtureVersion" className={cls} /></Field>
              <Field label="Phiên bản hình học kỳ vọng" span="col-span-12 md:col-span-4"><input aria-label="Phiên bản hình học kỳ vọng" readOnly value={aiGeometry} placeholder="Đọc từ BE theo phạm vi đã chọn" className={cls} /></Field>
            </div>
            <datalist id="ai-fixtures">{aiFixtures.map((f) => (<option key={f} value={f} />))}</datalist>
            <div className="rg-footer">
              <PanelButton disabled={!!busy || !dataset.scope[scopeIndex]} loading={busy === 'hints'} onClick={() => { void run('hints', async () => { const h = await surveyDatasetService.aiRunHints(record.projectId, dataset.scope[scopeIndex]); setAiFixtures(h.fixtures); setAiGeometry(h.geometryVersion); setMessage('Đã đọc phiên bản hình học của phạm vi đã chọn từ BE.') }) }}>{busy === 'hints' ? 'Đang lấy…' : 'Đọc phiên bản hình học và fixture'}</PanelButton>
              <PanelButton variant="primary" disabled={!!busy || !pre.trim() || !cfg.trim() || !modelVersionId.trim() || !aiFixture.trim() || !dataset.scope[scopeIndex]} loading={busy === 'ai-run'} onClick={() => { void run('ai-run', async () => { const r = await surveyDatasetService.createAiRun(record.projectId, dataset, { scopeIndex, stage: aiStage, modelVersionId, preprocessingVersion: pre, configVersion: cfg, fixtureVersion: aiFixture }); setLastRunId(r.id); setTrackKey((n) => n + 1); setMessage(`Đã tạo lần chạy AI (runId ${r.id}, trạng thái ${r.status || '—'}). Theo dõi ngay bên dưới.`) }) }}>{busy === 'ai-run' ? 'Đang gửi…' : 'Chạy AI mock'}</PanelButton>
            </div>
            <AiRunTracker projectId={record.projectId} taskId={record.id} datasetId={dataset.id} refreshKey={trackKey} highlightRunId={lastRunId}
              onViewJob={(id) => { setJobId(id); void run('job', async () => { setJob((await surveyDatasetService.job(id)).job) }) }} />
          </div>
        </div>
      )}
      <div className="rg-subcard" data-testid="processing-job-view">
        <SectionTitle icon="monitoring">Theo dõi job xử lý</SectionTitle>
        <div className="flex flex-wrap items-center gap-2">
          <PanelButton disabled={!!busy} loading={busy === 'jobs'} onClick={() => { void listJobs() }}>{busy === 'jobs' ? 'Đang tải…' : 'Danh sách job của dự án'}</PanelButton>
        </div>
        {jobList.length > 0 && <div data-testid="job-list" className="space-y-1">{jobList.map((j) => (<button key={j.id} type="button" onClick={() => setJobId(j.id)} className={`rg-row block w-full text-left font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-gold ${jobId === j.id ? '!border-brand-navy' : ''}`}>#{j.id.slice(0, 8)} · {j.jobType || '—'} · {j.status} · lần {j.attemptNumber ?? '—'}</button>))}</div>}
        <p className="text-[11px] text-slate-500">Chọn job từ danh sách trên hoặc bấm "Xem job xử lý" ở lần chạy AI; không cần tự nhập mã. Mã job (processingJobId) khác mã lần chạy AI (runId).</p>
        {jobId && <p className="text-[11px] font-mono break-all" data-testid="selected-job-id"><span className="font-sans font-semibold">Job đang chọn (processingJobId):</span> {jobId}</p>}
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold text-slate-600">Nâng cao: nhập mã job thủ công</summary>
          <div className="flex items-end gap-2 mt-2">
            <div className="flex-1"><span className="rg-label">Mã job xử lý (processingJobId)</span><input aria-label="Mã job xử lý" disabled={!!busy} value={jobId} onChange={(e) => setJobId(e.target.value)} placeholder="Mã job (GUID)" className={`${cls} font-mono`} /></div>
            <PanelButton className="whitespace-nowrap" disabled={!!busy || !jobId.trim()} loading={busy === 'job'} onClick={() => { void readJob() }}>{busy === 'job' ? 'Đang đọc…' : 'Đọc job'}</PanelButton>
          </div>
        </details>
        {jobId && !job && <PanelButton disabled={!!busy} loading={busy === 'job'} onClick={() => { void readJob() }}>Đọc job đang chọn</PanelButton>}
        {job && (
          <div className="space-y-2 rounded-lg bg-white border border-brand-border p-3">
            <KV items={[
              { k: 'Trạng thái', v: <Pill tone={/FAIL|ERROR/i.test(String(job.status)) ? 'bad' : /SUCCE|DONE|COMPLET/i.test(String(job.status)) ? 'ok' : 'info'}>{job.status}</Pill> },
              { k: 'Loại', v: job.jobType || '—' },
              { k: 'Lần chạy', v: job.attemptNumber ?? '—' },
              ...(job.resultId ? [{ k: 'Kết quả', v: job.resultId.slice(0, 8), mono: true }] : []),
            ]} />
            <Field label="Lý do chạy lại job"><textarea aria-label="Lý do chạy lại job" rows={2} maxLength={2000} disabled={!!busy} value={jobReason} onChange={(e) => setJobReason(e.target.value)} placeholder="Lý do chạy lại" className={cls} /></Field>
            <div className="rg-footer"><PanelButton variant="primary" disabled={!!busy || !jobReason.trim()} loading={busy === 'retry'} onClick={() => { void retry() }}>{busy === 'retry' ? 'Đang gửi…' : 'Chạy lại job'}</PanelButton></div>
          </div>
        )}
      </div>
    </PanelShell>
  )
}
