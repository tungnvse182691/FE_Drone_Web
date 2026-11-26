import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { constructionEvidenceIds, constructionLifecycleService as api, type ConstructionAttempt, type ConstructionFile, type ConstructionView } from '../../../api/services/constructionLifecycleService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, Loading, PanelButton, PanelShell, SectionTitle } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

export function ProjectConstructionCard({ projectId, actorId, isSupervisor }: { projectId: string; actorId: string; isSupervisor: boolean }) {
  const [view, setView] = useState<ConstructionView | null>(null)
  const [files, setFiles] = useState<ConstructionFile[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [readError, setReadError] = useState('')
  const [evidenceError, setEvidenceError] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const attempt = useRef<ConstructionAttempt | null>(null)
  const uncertain = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const { acquire, release } = useSubmitGuard()

  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true)
    setReadError(''); setEvidenceError('')
    const [lifecycle, evidence] = await Promise.allSettled([api.read(projectId, signal), api.readEvidence(projectId, signal)])
    if (signal.aborted) return
    if (lifecycle.status === 'fulfilled') setView(lifecycle.value)
    else { setView(null); setReadError(`Không đọc được vòng đời: ${exportError(lifecycle.reason)}`) }
    if (evidence.status === 'fulfilled') {
      setFiles(evidence.value)
      setSelected(ids => ids.filter(id => evidence.value.some(file => file.id === id)))
    } else {
      setFiles([]); setSelected([])
      setEvidenceError(`Không đọc được nguồn tệp dự án: ${exportError(evidence.reason)}`)
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    const scope = new AbortController()
    controller.current = scope
    void load(scope.signal)
    return () => scope.abort()
  }, [load])

  const declarations = view?.actions.filter(a => a.kind === 'DeclareConstruction' && constructionEvidenceIds(a).length > 0) ?? []
  const validSource = declarations.some(a => a.id === source)
  const locked = busy || loading || !!attempt.current
  const label = isSupervisor ? 'Xác nhận hoàn thành thi công' : 'Khai báo hoàn thành thi công'

  async function submit() {
    const signal = controller.current?.signal
    if (!signal || signal.aborted || loading || !acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      if (!attempt.current) {
        if (!view || (isSupervisor && !validSource)) return
        attempt.current = api.prepare(view, actorId, { reason, evidenceFileIds: selected, sourceActionId: isSupervisor ? source : undefined }, files)
      }
      const result = await api.submit(attempt.current, signal)
      if (signal.aborted) return
      setView(result.view)
      setMessage(`Đã đối chiếu bản ghi ${result.action.id} trong vòng đời dự án.`)
      setReason(''); setSelected([]); setSource('')
      attempt.current = null; uncertain.current = false
    } catch (e) {
      if (signal.aborted) return
      const status = isAxiosError(e) ? e.response?.status : undefined
      if (attempt.current && !attempt.current.received && !uncertain.current && status && status >= 400 && status < 500) {
        attempt.current = null
        await load(signal)
        if (!signal.aborted) setError(`${label}: ${exportError(e)}. Kiểm tra lại dữ liệu trước khi gửi.`)
      } else {
        uncertain.current = !!attempt.current
        setError(`${attempt.current?.received ? 'Chưa đối chiếu được kết quả' : label}: ${exportError(e)}${attempt.current ? '. Hãy thử đối chiếu lại, không tạo lệnh mới.' : ''}`)
      }
    } finally {
      if (!signal.aborted) setBusy(false)
      release()
    }
  }

  return <PanelShell icon="construction" title="Hoàn thành thi công" className="!p-5 !rounded-[16px]"
    actions={<PanelButton disabled={locked} onClick={() => { if (controller.current) void load(controller.current.signal) }}>Tải lại</PanelButton>}>
    <Feedback error={readError || error} message={message} />
    {loading && <Loading />}
    {view && <>
      <p className="rg-subcard text-sm">Trạng thái từ vòng đời: <strong>{view.constructionCompletion === 'CONFIRMED' ? 'Đã xác nhận' : 'Chưa có xác nhận'}</strong></p>
      {view.actions.length > 0 && <div className="space-y-2">
        <SectionTitle icon="history">Bản ghi khai báo và xác nhận</SectionTitle>
        {view.actions.map(a => <div key={a.id} className="rg-subcard space-y-1 text-xs break-all">
          <p><strong>{a.kind === 'DeclareConstruction' ? 'Khai báo' : 'Xác nhận'}</strong> · {new Date(a.at).toLocaleString('vi-VN')}</p>
          <p>Mã bản ghi: {a.id}</p>
          {a.sourceActionId && <p>Khai báo được xác nhận: {a.sourceActionId}</p>}
          {constructionEvidenceIds(a).map(id => <p key={id}>Tệp minh chứng: {id}</p>)}
        </div>)}
      </div>}
      <Feedback error={evidenceError} />
      {isSupervisor && declarations.length === 0 ? <Empty>Chưa có bản khai báo kèm minh chứng để xác nhận.</Empty> : <>
        {isSupervisor && <Field label="Bản khai báo cần xác nhận">
          <select className="rg-field w-full" value={validSource ? source : ''} disabled={locked} onChange={e => setSource(e.target.value)}>
            <option value="">Chọn bản khai báo</option>
            {declarations.map(a => <option key={a.id} value={a.id}>{new Date(a.at).toLocaleString('vi-VN')} · {a.id}</option>)}
          </select>
        </Field>}
        <Field label="Lý do"><textarea className="rg-field w-full" value={reason} rows={2} maxLength={2000} disabled={locked} onChange={e => setReason(e.target.value)} /></Field>
        <fieldset className="rg-subcard space-y-2" disabled={locked}>
          <legend className="text-sm font-semibold">{isSupervisor ? 'Minh chứng bổ sung (không bắt buộc)' : 'Tệp minh chứng (bắt buộc)'}</legend>
          <p className="text-xs text-slate-600">Chỉ chọn tệp thực sự chứng minh việc hoàn thành thi công. Danh sách lấy từ tệp dự án đã xác minh tải lên; PM Web không có quyền tải tệp mới tại đây. Giám sát không cần đính kèm lại tệp của bản khai báo.</p>
          {!evidenceError && files.length === 0 && !loading && <Empty>Chưa có tệp dự án đã xác minh trong nguồn độ phủ tuyến.</Empty>}
          {files.map(file => <label className="flex gap-2 text-xs break-all" key={file.id}>
            <input type="checkbox" checked={selected.includes(file.id)} disabled={selected.length >= 100 && !selected.includes(file.id)}
              onChange={e => setSelected(ids => e.target.checked ? [...ids, file.id] : ids.filter(id => id !== file.id))} />
            <span>{file.kind === 'HANDOVER' ? 'Biên bản bàn giao' : 'Tệp thuộc dự án'} · {file.id}{file.provenance === 'TEST_ONLY' ? ' · Dữ liệu kiểm thử' : ''}</span>
          </label>)}
        </fieldset>
        <div className="rg-footer">
          <PanelButton variant="primary" loading={busy} disabled={busy || loading || (!attempt.current && (!reason.trim() || (isSupervisor ? !validSource : !selected.length)))} onClick={() => { void submit() }}>
            {attempt.current ? 'Đối chiếu lệnh đang chờ' : label}
          </PanelButton>
        </div>
      </>}
    </>}
  </PanelShell>
}
