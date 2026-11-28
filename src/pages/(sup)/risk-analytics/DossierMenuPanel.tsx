import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectExportService, exportPeriod, type ExportInput } from '../../../api/services/projectExportService'
import { aiApiErrorText } from '../../../api/services/aiRunDetailService'
import type { ReportingGeometry } from '../../../api/services/projectReportingService'
import { Empty, Feedback, Loading, PanelButton, PanelShell, Pill } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { availabilityLabel, dateLabel, explainReasons, label } from './reportMenuLabels'

export function DossierMenuPanel({ projectId, epoch, geometry }: { projectId: string; epoch: number; geometry?: ReportingGeometry }) {
  const [opened, setOpened] = useState(false)
  const [create, setCreate] = useState(false)
  const [selected, setSelected] = useState('')
  const [format, setFormat] = useState<ExportInput['format']>('PDF')
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [segment, setSegment] = useState('')
  const [originals, setOriginals] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const guard = useSubmitGuard()
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  const jobs = useQuery({
    queryKey: ['report-menu-dossiers', epoch, projectId],
    queryFn: async ({ signal }) => (await projectExportService.list(projectId, signal)).filter(row => row.kind === 'DOSSIER'),
    enabled: opened, retry: false,
    refetchInterval: query => !query.state.error && query.state.data?.some(job => job.status === 'QUEUED' || job.status === 'RUNNING') ? 5000 : false,
  })
  const listed = jobs.isSuccess && opened
  const current = listed ? jobs.data.find(row => row.id === selected) : undefined
  const manifest = useQuery({
    queryKey: ['report-menu-manifest', epoch, projectId, current?.id, current?.version],
    queryFn: ({ signal }) => projectExportService.manifest(projectId, current!.id, signal), enabled: !!current, retry: false,
  })
  const detail = manifest.isSuccess && current ? manifest.data.detail : undefined
  const eligibleDownload = detail?.status === 'SUCCEEDED' && !!detail.expiresAt && Date.parse(detail.expiresAt) > Date.now()
  let pending: ReturnType<typeof projectExportService.pending> = null
  let pendingError = ''
  if (listed) {
    try { pending = projectExportService.pending(projectId) } catch (err) { pendingError = aiApiErrorText(err) }
  }
  const pendingOther = !!(pending?.body.repairItemIds?.length || pending?.body.repairPackageIds?.length)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!listed || pendingOther || pendingError || !guard.acquire()) return
    const request = new AbortController()
    controller.current = request
    setBusy(true); setError(''); setMessage('')
    try {
      const input = pending?.body ?? {
        kind: 'DOSSIER', format, includeOriginalFiles: format === 'ZIP' && originals,
        ...exportPeriod(from, to), ...(segment ? { segmentIds: [segment] } : {}),
      } satisfies ExportInput
      const result = await projectExportService.create(projectId, input, request.signal)
      if (request.signal.aborted) return
      setSelected(result.id); setCreate(false); setMessage('Đã ghi nhận yêu cầu xuất hồ sơ.')
      await jobs.refetch()
    } catch (err) {
      if (!request.signal.aborted) setError(aiApiErrorText(err, 'Không xác nhận được yêu cầu xuất'))
    } finally {
      if (!request.signal.aborted) setBusy(false)
      guard.release()
    }
  }

  async function download() {
    if (!eligibleDownload || !detail || !guard.acquire()) return
    const request = new AbortController()
    controller.current = request
    setBusy(true); setError(''); setMessage('')
    try {
      const file = await projectExportService.content(projectId, detail.id)
      if (request.signal.aborted) return
      if (file.manifest.kind !== 'DOSSIER') throw new Error('Hồ sơ tải xuống khác loại đã chọn.')
      const url = URL.createObjectURL(file.blob)
      const link = document.createElement('a')
      link.href = url; link.download = file.fileName; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      if (!request.signal.aborted) setError(aiApiErrorText(err, 'Không tải được hồ sơ'))
    } finally {
      if (!request.signal.aborted) setBusy(false)
      guard.release()
    }
  }

  return <PanelShell icon="folder_zip" title="Hồ sơ kỹ thuật PDF / ZIP" className="!p-5 !rounded-[20px]"
    actions={<>
      {!opened && <PanelButton onClick={() => setOpened(true)}>Mở danh sách hồ sơ</PanelButton>}
      {opened && <PanelButton disabled={jobs.isFetching || busy} onClick={() => { void jobs.refetch() }}>Tải lại hồ sơ</PanelButton>}
      {listed && !pendingOther && !pendingError && <PanelButton variant="primary" disabled={busy} onClick={() => setCreate(value => !value)}>
        {create ? 'Đóng yêu cầu xuất' : pending ? 'Đối chiếu yêu cầu đang chờ' : 'Tạo yêu cầu xuất'}
      </PanelButton>}
    </>}>
    {jobs.isLoading && <Loading>Đang kiểm quyền và tải danh sách hồ sơ…</Loading>}
    <Feedback error={error || pendingError || (jobs.error ? aiApiErrorText(jobs.error, 'Không đọc được danh sách hồ sơ') : '')} message={message} />
    {pendingOther && <p className="text-xs text-slate-600">Dự án có yêu cầu xuất hạng mục hoặc gói sửa chữa đang chờ xử lý ở màn đã tạo yêu cầu.</p>}
    {listed && create && !pendingOther && !pendingError && <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      {pending ? <p className="text-xs text-slate-600">Đối chiếu lại yêu cầu đã lưu với đúng định dạng và phạm vi đã chọn.</p> :
        <fieldset disabled={busy} className="grid gap-3 text-xs sm:grid-cols-2">
          <label className="grid gap-1">Định dạng
            <select aria-label="Định dạng" className="rg-field" value={format} onChange={e => { setFormat(e.target.value as ExportInput['format']); setOriginals(false) }}>
              <option value="PDF">PDF</option><option value="ZIP">ZIP</option>
            </select>
          </label>
          {!!geometry?.segments.length && <label className="grid gap-1">Phân đoạn xuất hồ sơ
            <select className="rg-field" value={segment} onChange={e => setSegment(e.target.value)}>
              <option value="">Toàn phạm vi được phép</option>
              {geometry.segments.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
            </select>
          </label>}
          <label className="grid gap-1">Dữ liệu xuất từ thời điểm<input className="rg-field" type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label className="grid gap-1">Dữ liệu xuất đến trước thời điểm<input className="rg-field" type="datetime-local" value={to} onChange={e => setTo(e.target.value)} /></label>
          {format === 'ZIP' && <label className="flex gap-2">
            <input type="checkbox" checked={originals} onChange={e => setOriginals(e.target.checked)} />Kèm tệp gốc Backend cho phép đọc
          </label>}
        </fieldset>}
      <PanelButton type="submit" disabled={busy} loading={busy}>{pending ? 'Đối chiếu yêu cầu đã lưu' : 'Gửi yêu cầu xuất'}</PanelButton>
    </form>}
    {listed && !jobs.data.length && <Empty>Chưa có hồ sơ kỹ thuật đã yêu cầu xuất.</Empty>}
    {listed && jobs.data.map(row => <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="space-y-1">
        <p className="font-semibold text-slate-800">Hồ sơ {row.format} · {dateLabel(row.createdAt)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={row.status === 'FAILED' ? 'bad' : 'neutral'}>{label(row.status.toLowerCase())}</Pill>
          {row.completeness && <Pill tone={row.completeness === 'PARTIAL' ? 'warn' : 'neutral'}>{label(row.completeness)}</Pill>}
        </div>
        {!!row.missingSections?.length && <p className="text-amber-800">Phần thiếu {row.missingSections.map(label).join(' · ')}</p>}
        {row.errorCode && <Feedback error={explainReasons([row.errorCode])} />}
      </div>
      <PanelButton aria-expanded={selected === row.id} disabled={busy} onClick={() => { setError(''); setSelected(selected === row.id ? '' : row.id) }}>
        {selected === row.id ? 'Đóng bản kê' : 'Xem bản kê'}
      </PanelButton>
    </article>)}
    {current && manifest.isLoading && <Loading>Đang tải bản kê hồ sơ…</Loading>}
    {current && manifest.error && <Feedback error={aiApiErrorText(manifest.error, 'Không đọc được bản kê hồ sơ')} />}
    {detail && manifest.data && <div className="space-y-2 rounded-xl border border-slate-200 p-3 text-xs">
      <p className="font-semibold">Bản kê hồ sơ {detail.format}</p>
      <p>Thời điểm chốt dữ liệu {dateLabel(manifest.data.manifest.snapshotAt)} · Hạn tải {dateLabel(detail.expiresAt)}</p>
      {detail.completeness && <p>Mức đầy đủ {label(detail.completeness)}</p>}
      {!!detail.missingSections?.length && <p className="text-amber-800">Phần thiếu {detail.missingSections.map(label).join(' · ')}</p>}
      <details><summary className="cursor-pointer">Phiên bản và phạm vi bản kê</summary>
        <p className="break-all">Mã kiểm tra snapshot {manifest.data.manifest.snapshotHash}</p>
        <p>Số tham chiếu nguồn {manifest.data.manifest.sourceRevisions.length} · Số tệp kèm {manifest.data.manifest.files.filter(file => file.included).length}</p>
        <p>{manifest.data.manifest.filters.from && manifest.data.manifest.filters.to
          ? `Từ ${dateLabel(manifest.data.manifest.filters.from)} đến trước ${dateLabel(manifest.data.manifest.filters.to)}` : 'Toàn thời gian'}</p>
        {!!manifest.data.manifest.filters.segmentIds?.length && <p>Phân đoạn {manifest.data.manifest.filters.segmentIds.map(id =>
          geometry?.segments.find(row => row.id === id)?.name || `#${id.slice(0, 8)}`).join(' · ')}</p>}
      </details>
      {manifest.data.manifest.sections.map((section, i) => typeof section.name === 'string' && typeof section.availability === 'string' &&
        <p key={`${section.name}:${i}`}>{label(section.name)} · {availabilityLabel(section.availability)}
          {Array.isArray(section.reasonCodes) && section.reasonCodes.length > 0 && ` · ${explainReasons(section.reasonCodes)}`}</p>)}
      {eligibleDownload && <PanelButton variant="primary" disabled={busy} onClick={() => { void download() }}>Tải {detail.format}</PanelButton>}
    </div>}
  </PanelShell>
}
