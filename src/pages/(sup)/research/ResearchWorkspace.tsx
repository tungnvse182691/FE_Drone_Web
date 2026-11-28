import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { researchSourceService } from '../../../api/services/researchSourceService'
import { aiApiErrorText } from '../../../api/services/aiRunDetailService'
import { defectTypeLabel, useDefectTypeNames } from '../../../api/services/defectTypeNames'
import { trainingLabelService } from '../../../api/services/trainingLabelService'
import { Empty, Feedback, Field, KV, Loading, PanelShell, Pill } from '../../../components/ui/PanelKit'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { TrainingLabelsPanel } from './TrainingLabelsPanel'
import { TrainingExportPanel } from './TrainingExportPanel'

const fmtDate = (date?: string | null) => date ? new Date(date).toLocaleString('vi-VN') : 'Chưa có thời gian'
const jobStates: Record<string, string> = {
  QUEUED: 'Đang chờ', PENDING: 'Đang chờ', RUNNING: 'Đang xử lý', PROCESSING: 'Đang xử lý',
  SUCCEEDED: 'Hoàn tất', INGESTED: 'Đã nhận kết quả', FAILED: 'Thất bại', CANCELLED: 'Đã hủy',
}
const jobState = (state?: string | null) => state ? jobStates[state.toUpperCase()] || state : 'Chưa có trạng thái'

function CandidateFrame({ fileId }: { fileId: string }) {
  const [frame, setFrame] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    let url = ''
    trainingLabelService.frameUrl(fileId).then(value => {
      if (active) { url = value; setFrame(value) }
      else URL.revokeObjectURL(value)
    }).catch(err => { if (active) setError(aiApiErrorText(err, 'Không tải được khung hình')) })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [fileId])
  if (error) return <Feedback error={error} />
  if (!frame) return <Loading>Đang tải khung hình…</Loading>
  return <img src={frame} alt="Khung hình của phát hiện AI" className="max-h-96 w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
    onError={() => setError('Trình duyệt không hiển thị được khung hình.')} />
}

function ProjectResearch({ projectId, isPM, epoch }: { projectId: string; isPM: boolean; epoch: number }) {
  const [datasetId, setDatasetId] = useState('')
  const [workId, setWorkId] = useState('')
  const [detectionId, setDetectionId] = useState('')
  const { names } = useDefectTypeNames()
  const queryKey = ['research-sources', epoch, projectId]
  const datasets = useQuery({ queryKey: [...queryKey, 'datasets'], queryFn: ({ signal }) => researchSourceService.datasets(projectId, signal), retry: false })
  const dataset = datasets.data?.find(row => row.id === datasetId)
  const works = useQuery({ queryKey: [...queryKey, 'works', dataset?.id, dataset?.version],
    queryFn: ({ signal }) => researchSourceService.works(projectId, dataset!, signal), enabled: !!dataset, retry: false })
  const work = works.data?.rows.find(row => row.workId === workId)
  const job = useQuery({ queryKey: [...queryKey, 'job', work?.jobId, work?.currentAttemptId],
    queryFn: ({ signal }) => researchSourceService.job(work!, signal), enabled: !!work, retry: false })
  const detections = useQuery({ queryKey: [...queryKey, 'detections', work?.jobId, work?.currentAttemptId, job.data?.version],
    queryFn: ({ signal }) => researchSourceService.detections(projectId, work!, signal),
    enabled: !!work && job.data?.status.toUpperCase() === 'SUCCEEDED', retry: false })
  const picked = detections.data?.rows.find(row => row.detectionId === detectionId)
  const attempt = detections.data?.attemptId
  const version = works.data?.versionId
  const candidate = useQuery({ queryKey: [...queryKey, 'candidate', workId, attempt, version, picked?.detectionId],
    queryFn: ({ signal }) => researchSourceService.candidate(projectId, picked!.detectionId, work!, version!, attempt!, signal),
    enabled: !!picked && !!work && !!version && !!attempt, retry: false })
  const facts = candidate.isSuccess ? candidate.data : undefined

  return <>
    <PanelShell icon="video_library" title="Nguồn phát hiện AI" subtitle="Duyệt theo bộ dữ liệu khảo sát và lượt xử lý." className="!p-5 !rounded-[16px]">
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="Bộ dữ liệu khảo sát">
          <select aria-label="Bộ dữ liệu khảo sát" className="rg-field w-full" value={datasetId}
            onChange={e => { setDatasetId(e.target.value); setWorkId(''); setDetectionId('') }}>
            <option value="">Chọn bộ dữ liệu</option>
            {datasets.data?.map(row => <option key={row.id} value={row.id}>
              Bản {row.versionNo} · {fmtDate(row.submittedAt)}{row.operator ? ` · ${row.operator}` : ''}
            </option>)}
          </select>
        </Field>
        {dataset && <Field label="Lượt xử lý AI thực">
          <select aria-label="Lượt xử lý AI thực" className="rg-field w-full" value={workId}
            onChange={e => { setWorkId(e.target.value); setDetectionId('') }}>
            <option value="">Chọn lượt xử lý</option>
            {works.data?.rows.map((row, index) => <option key={row.workId} value={row.workId}>Lượt {index + 1} · {jobState(row.state)}</option>)}
          </select>
        </Field>}
        {!!detections.data?.rows.length && <Field label="Phát hiện AI">
          <select aria-label="Phát hiện AI" className="rg-field w-full" value={detectionId} onChange={e => setDetectionId(e.target.value)}>
            <option value="">Chọn phát hiện ({detections.data.rows.length})</option>
            {detections.data.rows.map((row, index) => <option key={row.detectionId} value={row.detectionId}>
              {index + 1}. {defectTypeLabel(row.typeCode, names)}
            </option>)}
          </select>
        </Field>}
      </div>
      {[datasets, works, job, detections, candidate].some(query => query.isLoading) && <Loading>Đang đọc dữ liệu AI…</Loading>}
      {datasets.error && <Feedback error={aiApiErrorText(datasets.error, 'Không tải được bộ dữ liệu')} />}
      {works.error && <Feedback error={aiApiErrorText(works.error, 'Không tải được nguồn AI thực')} />}
      {job.error && <Feedback error={aiApiErrorText(job.error, 'Không tải được lượt xử lý')} />}
      {detections.error && <Feedback error={aiApiErrorText(detections.error, 'Không tải được danh sách phát hiện')} />}
      {candidate.error && <Feedback error={aiApiErrorText(candidate.error, 'Không tải được chi tiết phát hiện')} />}
      {datasets.isSuccess && !datasets.data.length && <Empty>Dự án chưa có bộ dữ liệu khảo sát trong CSDL.</Empty>}
      {works.isSuccess && !works.data.rows.length && <Empty>Bộ dữ liệu chưa có lượt xử lý AI thực.</Empty>}
      {detections.isSuccess && !detections.data.rows.length && <Empty>Lượt xử lý chưa có phát hiện trong CSDL.</Empty>}
      {job.isSuccess && <div className="flex flex-wrap items-center gap-2">
        <Pill tone="info">AI thực (REAL)</Pill><Pill>{jobState(job.data.status)}</Pill>
        {job.data.attemptNumber != null && <span className="text-xs text-slate-600">Lần xử lý {job.data.attemptNumber}</span>}
        {job.data.status.toUpperCase() === 'FAILED' && work?.errorCode && <Feedback error={work.errorCode} />}
      </div>}
      {facts && <div className="grid gap-4 md:grid-cols-2">
        {facts.frameFileId ? <CandidateFrame key={facts.frameFileId} fileId={facts.frameFileId} /> : <Empty>Phát hiện chưa có khung hình.</Empty>}
        <KV items={[
          { k: 'Loại phát hiện', v: defectTypeLabel(facts.typeCode, names) },
          { k: 'Độ tin cậy của phát hiện', v: Number.isFinite(facts.confidence) ? `${(facts.confidence * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%` : 'Chưa có dữ liệu' },
          { k: 'Thời điểm trên video', v: Number.isFinite(facts.timestampMs) ? `${facts.timestampMs.toLocaleString('vi-VN')} ms` : 'Chưa có dữ liệu' },
        ]} />
      </div>}
    </PanelShell>
    {isPM && <>
      <TrainingLabelsPanel projectId={projectId} researchCandidate={facts ?? null} names={names} />
      <TrainingExportPanel projectId={projectId} epoch={epoch} />
    </>}
  </>
}

export function ResearchWorkspace() {
  const role = useAuthStore(s => s.user?.role)
  const epoch = useAuthStore(s => s.authEpoch)
  const isPM = role === RoleCode.PROJECT_MANAGER
  const [selection, setSelection] = useState('')
  const projects = useQuery({ queryKey: ['research-projects', epoch, role], queryFn: ({ signal }) => researchSourceService.projects(signal),
    enabled: isPM || role === RoleCode.SUPERVISOR, retry: false })
  const projectId = projects.isSuccess
    ? projects.data.find(project => project.projectId === selection)?.projectId ?? projects.data[0]?.projectId
    : undefined

  return <div className="space-y-6 max-w-7xl mx-auto pb-16 text-[#1E293B]">
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <p className="text-xs text-slate-500 mb-1">Báo cáo &amp; Hồ sơ</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sansation">
          {isPM ? 'Thực nghiệm AI' : 'Kiểm định mô hình'}
          <span aria-hidden="true" className="material-symbols-outlined text-[22px] text-brand-gold">science</span>
        </h1>
      </div>
      <label className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-2xs">
        <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-brand-gold">folder_open</span>
        Dự án
        <select className="bg-transparent font-bold text-slate-900 text-xs" value={projectId ?? ''} onChange={e => setSelection(e.target.value)}>
          {!projectId && <option value="">Chọn dự án</option>}
          {projects.data?.map(project => <option key={project.projectId} value={project.projectId}>{project.name}</option>)}
        </select>
      </label>
    </header>
    {projects.isLoading && <Loading>Đang tải dự án…</Loading>}
    {projects.error && <Feedback error={aiApiErrorText(projects.error, 'Không tải được dự án')} />}
    {projects.isSuccess && !projectId && <Empty>Chưa có dự án trong phạm vi tài khoản.</Empty>}
    {projectId && <ProjectResearch key={`${epoch}:${role}:${projectId}`} projectId={projectId} isPM={isPM} epoch={epoch} />}
  </div>
}
