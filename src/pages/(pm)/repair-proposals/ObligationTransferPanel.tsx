import { useEffect, useRef, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { createObligationTransferService, incomingOffers, type TransferAttempt, type TransferSnapshot } from '../../../api/services/obligationTransferService'
import { repairWorkflowService } from '../../../api/services/repairWorkflowService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'

const service = createObligationTransferService(apiClient)
const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100'
const secondary = 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50'
type Project = { id: string; name: string; code: string }
type Pending = { attempt: TransferAttempt; receipt?: Awaited<ReturnType<typeof service.post>> }
/** Thông tin đối chiếu của nghĩa vụ chuyển được: gói/hạng mục (lifecycle.responsibilities) + Defect (GET item, GET source-defect). */
type Detail = { state: 'loading' | 'ready' | 'error'; packageId?: string; itemId?: string; mode?: string; itemState?: string; defectId?: string; defectType?: string | null; defectStatus?: string | null; severity?: string | null; error?: string }
const short = (id?: string) => (id ? id.slice(0, 8).toUpperCase() : '—')

export function ObligationTransferPanel({ projects, initialProjectId }: { projects: Project[]; initialProjectId?: string }) {
  const user = useAuthStore(state => state.user)
  const epoch = useAuthStore(state => state.authEpoch)
  if (user?.role !== RoleCode.SUPERVISOR && user?.role !== RoleCode.PROJECT_MANAGER) return null
  return <TransferWorkspace key={`${epoch}:${user.id}:${initialProjectId ?? ''}`} projects={projects}
    initialProjectId={initialProjectId} actorId={user.id} supervisor={user.role === RoleCode.SUPERVISOR} />
}

function TransferWorkspace({ projects, initialProjectId, actorId, supervisor }: {
  projects: Project[]; initialProjectId?: string; actorId: string; supervisor: boolean
}) {
  const [chosenProject, setChosenProject] = useState(initialProjectId ?? '')
  const projectId = projects.some(project => project.id === chosenProject) ? chosenProject : ''
  const [locked, setLocked] = useState(false)
  return (
    <section className="space-y-3 rounded-xl border border-[#E2E5E9] bg-white p-4 text-slate-700">
      <h2 className="text-sm font-bold text-[#2D3748]">Chuyển giao nghĩa vụ sửa chữa (LD06)</h2>
      <label className="block max-w-lg space-y-1 text-sm">
        <span>Dự án tra cứu</span>
        <select className={field} value={projectId} disabled={locked || !projects.length} onChange={event => setChosenProject(event.target.value)}>
          <option value="">Chọn dự án</option>
          {projects.map(project => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
        </select>
      </label>
      {!supervisor && <p className="text-sm text-slate-600">Chỉ Giám sát được phát hành và tiếp nhận chuyển giao. PM có thể tra cứu dự án được phân quyền.</p>}
      {projectId && <TransferProject key={projectId} projectId={projectId} actorId={actorId}
        supervisor={supervisor} projects={projects} onLock={setLocked} />}
    </section>
  )
}

function TransferProject({ projectId, actorId, supervisor, projects, onLock }: {
  projectId: string; actorId: string; supervisor: boolean; projects: Project[]; onLock: (value: boolean) => void
}) {
  const [view, setView] = useState<TransferSnapshot>()
  const [revision, reload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mode, setMode] = useState<'issue' | 'accept'>('issue')
  const [selected, setSelected] = useState('')
  const [receiver, setReceiver] = useState('')
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState<Pending>()
  const [busy, setBusy] = useState(false)
  const sending = useRef(false)
  const [details, setDetails] = useState<Record<string, Detail>>({})
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setView(undefined)
    service.read(projectId, controller.signal).then(next => {
      if (!controller.signal.aborted) setView(next)
    }).catch(err => {
      if (!controller.signal.aborted) setError(exportError(err))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [projectId, revision])

  // Đối chiếu nghĩa vụ → gói/hạng mục/Defect bằng GET hiện có: lifecycle.responsibilities (nếu có), nếu không thì quét gói/hạng mục của dự án (item.obligationId);
  // nghĩa vụ TemporarySafety đối chiếu qua GET temporary-safety-obligations của từng hạng mục (chỉ liệt kê nghĩa vụ chưa dùng).
  useEffect(() => {
    if (!view || !supervisor) return
    const c = new AbortController()
    const live = () => !c.signal.aborted
    const next: Record<string, Detail> = {}
    for (const row of view.transferableObligations) next[row.id] = { state: 'loading' }
    setDetails(next)
    ;(async () => {
      const found = new Map<string, { packageId: string; itemId: string; defectId?: string; mode?: string; itemState?: string }>()
      const fail = (message: string) => { for (const row of view.transferableObligations) if (!found.has(row.id)) next[row.id] = { state: 'error', error: message } }
      try {
        for (const r of view.responsibilities as Array<{ obligationId: string; packageId?: string | null; currentRepairItemId?: string | null }>) {
          if (r.packageId && r.currentRepairItemId) found.set(r.obligationId, { packageId: r.packageId, itemId: r.currentRepairItemId })
        }
        const pkgs = await repairWorkflowService.packages(projectId, c.signal)
        const items: Array<{ packageId: string; item: Awaited<ReturnType<typeof repairWorkflowService.items>>[number] }> = []
        for (const pkg of pkgs) for (const item of await repairWorkflowService.items(projectId, pkg.id, c.signal)) items.push({ packageId: pkg.id, item })
        for (const { packageId, item } of items) if (!found.has(item.obligationId)) found.set(item.obligationId, { packageId, itemId: item.id, defectId: item.defectId, mode: item.mode, itemState: item.state })
        for (const row of view.transferableObligations.filter(x => /safety/i.test(x.kind) && !found.has(x.id))) {
          for (const { packageId, item } of items) {
            try {
              const g = await apiClient.get(`/projects/${projectId}/repair-packages/${packageId}/items/${item.id}/temporary-safety-obligations`, { signal: c.signal })
              if ((g.data?.items || []).some((o: { safetyObligationId: string }) => o.safetyObligationId === row.id)) { found.set(row.id, { packageId, itemId: item.id, defectId: item.defectId, mode: item.mode, itemState: item.state }); break }
            } catch { /* hạng mục không đọc được: thử hạng mục khác, không suy đoán */ }
          }
        }
      } catch (e) { if (live()) fail(exportError(e)) }
      for (const row of view.transferableObligations) {
        const hit = found.get(row.id)
        if (!hit) { if (next[row.id].state === 'loading') next[row.id] = { state: 'error', error: 'API hiện có chưa cho biết gói/hạng mục chứa nghĩa vụ này (ví dụ nghĩa vụ an toàn tạm thời đã dùng).' }; continue }
        try {
          const [item, sd] = await Promise.all([
            repairWorkflowService.detail(projectId, hit.packageId, hit.itemId, c.signal),
            apiClient.get(`/projects/${projectId}/repair-packages/${hit.packageId}/items/${hit.itemId}/source-defect`, { signal: c.signal }),
          ])
          next[row.id] = { state: 'ready', packageId: hit.packageId, itemId: hit.itemId, mode: item.mode, itemState: item.state, defectId: item.defectId, defectType: sd.data?.defectTypeCode, defectStatus: sd.data?.status, severity: sd.data?.severity }
        } catch (e) { next[row.id] = { state: 'error', packageId: hit.packageId, itemId: hit.itemId, defectId: hit.defectId, mode: hit.mode, itemState: hit.itemState, error: exportError(e) } }
      }
      if (live()) setDetails({ ...next })
    })()
    return () => c.abort()
  }, [view, supervisor, projectId])
  const labelOf = (row: { id: string; kind: string; routeLabel: string; from: number; to: number }) => {
    const d = details[row.id]
    return `${d?.packageId ? 'PKG-' + short(d.packageId) : 'Gói: chưa đọc được'} · ${d?.defectId ? 'DEF-' + short(d.defectId) + (d.defectType ? ` (${d.defectType})` : '') : 'Defect: chưa đọc được'} · ${row.kind} · ${row.routeLabel} ${row.from}–${row.to} m`
  }

  const targets = projects.filter(project => project.id !== projectId)
  const offers = view ? incomingOffers(view) : []
  const scopes = view?.transferableObligations ?? []
  const ready = supervisor && view && reason.trim() && (mode === 'issue'
    ? scopes.some(row => row.id === selected) && targets.some(row => row.id === receiver) && details[selected]?.state !== 'loading'
    : offers.some(row => row.id === selected))

  const refresh = () => {
    setError(''); setLoading(true); setView(undefined); setSelected(''); reload(value => value + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current || !supervisor || (!pending && (!ready || !view))) return
    if (!pending && !reviewing) { setReviewing(true); return } // bước đối chiếu chi tiết trước khi gửi
    sending.current = true; setBusy(true); onLock(true); setError(''); setNotice('')
    let current = pending
    try {
      if (!current && view) {
        current = { attempt: mode === 'issue'
          ? service.prepareIssue(view, actorId, selected, receiver, reason)
          : service.prepareAcceptance(view, actorId, selected, reason) }
        setPending(current)
      }
      if (!current) return
      if (!current.receipt) {
        current = { ...current, receipt: await service.post(current.attempt) }
        setPending(current)
      }
      const receipt = current.receipt!
      setView(await service.readback(current.attempt, receipt))
      setNotice(`${receipt.kind === 'IssueTransfer' ? 'Đã phát hành đề nghị chuyển giao' : 'Đã ghi nhận tiếp nhận nghĩa vụ'} — mã biên nhận: ${receipt.id}.`)
      setPending(undefined); setSelected(''); setReceiver(''); setReason(''); setReviewing(false); onLock(false)
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      if (!current || (!current.receipt && status && status >= 400 && status < 500 && status !== 408 && status !== 429)) {
        setPending(undefined); setReviewing(false); onLock(false)
        if (status) { setLoading(true); setView(undefined); reload(value => value + 1) }
        setError(exportError(err))
      } else {
        setError(`${current.receipt ? 'Đã nhận biên nhận nhưng chưa đọc lại được.' : 'Chưa xác minh được kết quả; thử lại sẽ dùng đúng lệnh và khóa cũ.'} ${exportError(err)}`)
      }
    } finally {
      sending.current = false; setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" className={secondary} disabled={loading || busy || !!pending} onClick={refresh}>Đọc lại từ máy chủ</button>
      {loading && <p role="status" className="text-sm">Đang đọc vòng đời dự án…</p>}
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="break-all rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">{notice}</p>}
      {view && supervisor && (
        <form onSubmit={submit} className="max-w-2xl space-y-3">
          <fieldset disabled={busy || !!pending} className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm"><span>Thao tác</span>
              <select className={field} value={mode} onChange={event => { setMode(event.target.value === 'accept' ? 'accept' : 'issue'); setSelected('') }}>
                <option value="issue">Phát hành đề nghị</option><option value="accept">Tiếp nhận nghĩa vụ</option>
              </select>
            </label>
            <label className="space-y-1 text-sm"><span>{mode === 'issue' ? 'Nghĩa vụ đang quản lý' : 'Đề nghị gửi đến dự án này'}</span>
              <select className={field} value={selected} onChange={event => { setSelected(event.target.value); setReviewing(false) }} required>
                <option value="">{(mode === 'issue' ? scopes.length : offers.length) ? 'Chọn từ dữ liệu máy chủ' : 'Không có bản ghi từ máy chủ'}</option>
                {mode === 'issue' ? scopes.map(row => <option key={row.id} value={row.id}>{labelOf(row)}</option>)
                  : offers.map(row => <option key={row.id} value={row.id}>{projects.find(project => project.id === row.projectId)?.name ?? row.projectId} · {row.obligationId} · {row.id}</option>)}
              </select>
            </label>
            {mode === 'issue' && <label className="space-y-1 text-sm"><span>Dự án nhận</span>
              <select className={field} value={receiver} onChange={event => { setReceiver(event.target.value); setReviewing(false) }} required>
                <option value="">{targets.length ? 'Chọn dự án nhận' : 'Không có dự án nhận trong danh mục'}</option>
                {targets.map(project => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
              </select>
            </label>}
            <label className="space-y-1 text-sm sm:col-span-2"><span>Lý do</span>
              <textarea className={field} value={reason} onChange={event => setReason(event.target.value)} required maxLength={2000} />
            </label>
          </fieldset>
          {mode === 'accept' && <p className="text-xs text-slate-600">Máy chủ kiểm tra đề nghị còn hiệu lực và phạm vi, phiên bản, trách nhiệm chưa thay đổi khi tiếp nhận.</p>}
          {reviewing && !pending && (() => {
            const row = scopes.find(r => r.id === selected), d = details[selected], rcv = targets.find(p => p.id === receiver), offer = offers.find(o => o.id === selected)
            return <div data-testid="transfer-review" className="space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs">
              <p className="font-bold">Đối chiếu trước khi gửi — kiểm tra đúng nghĩa vụ</p>
              {mode === 'issue' && row ? <>
                <p>Gói: <strong>{d?.packageId ? 'PKG-' + short(d.packageId) : 'chưa đọc được'}</strong> · Hạng mục: <strong>{d?.itemId ? 'ITEM-' + short(d.itemId) : '—'}</strong> ({d?.mode || '—'} · {d?.itemState || '—'})</p>
                <p>Defect: <strong>{d?.defectId ? 'DEF-' + short(d.defectId) : 'chưa đọc được'}</strong> · loại {d?.defectType || '—'} · trạng thái {d?.defectStatus || '—'} · mức độ {d?.severity || '—'}</p>
                <p>Loại nghĩa vụ: <strong>{row.kind}</strong> · {row.routeLabel} · {row.from}–{row.to} m</p>
                <p>Dự án nhận: <strong>{rcv ? `${rcv.code} — ${rcv.name}` : '—'}</strong></p>
                <p className="break-all">Mã nghĩa vụ: {row.id}</p>
                {d?.state === 'error' && <p role="alert" className="text-rose-700">Không đọc được đủ thông tin gói/Defect ({d.error}). Kiểm tra kỹ trước khi gửi.</p>}
              </> : offer ? <>
                <p>Đề nghị từ dự án: <strong>{projects.find(p => p.id === offer.projectId)?.name ?? offer.projectId}</strong></p>
                <p className="break-all">Nghĩa vụ: {offer.obligationId} · Đề nghị: {offer.id}</p>
              </> : null}
              <p>Lý do: {reason.trim()}</p>
            </div>
          })()}
          <button type="submit" disabled={busy || (!pending && !ready)} className="rounded-lg bg-[#C9A227] px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
            {busy ? 'Đang xác minh…' : pending?.receipt ? 'Thử đọc lại biên nhận' : pending ? 'Thử xác minh lại cùng lệnh' : !reviewing ? 'Xem lại chi tiết trước khi gửi' : mode === 'issue' ? 'Xác nhận phát hành đề nghị' : 'Xác nhận tiếp nhận nghĩa vụ'}
          </button>
        </form>
      )}
      {view && <details className="text-sm">
        <summary className="cursor-pointer font-medium">Hành động chuyển giao đã ghi nhận</summary>
        <ul className="mt-2 max-h-56 space-y-2 overflow-auto">
          {view.actions.filter(row => row.kind === 'IssueTransfer' || row.kind === 'AcceptTransfer').slice().reverse().map(row => (
            <li key={row.id} className="break-all rounded-lg bg-slate-50 p-2 text-xs">
              <strong>{row.kind === 'IssueTransfer' ? 'Phát hành' : 'Tiếp nhận'}</strong> · {row.at} · Nghĩa vụ: {row.obligationId} · Mã: {row.id}
              {row.sourceActionId && ` · Đề nghị nguồn: ${row.sourceActionId}`}
              {row.kind === 'IssueTransfer' && ` · Dự án nhận: ${projects.find(project => project.id === row.receivingProjectId)?.name ?? row.receivingProjectId}`}
              {view.responsibilities.find(item => item.acceptanceActionId === row.id) && ' · Là bản ghi trách nhiệm hiện hành'}
            </li>
          ))}
          {!view.actions.some(row => row.kind === 'IssueTransfer' || row.kind === 'AcceptTransfer') && <li>Chưa có hành động chuyển giao từ máy chủ.</li>}
        </ul>
      </details>}
    </div>
  )
}
