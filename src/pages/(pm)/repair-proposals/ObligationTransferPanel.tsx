import { useEffect, useRef, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { createObligationTransferService, incomingOffers, type TransferAttempt, type TransferSnapshot } from '../../../api/services/obligationTransferService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'

const service = createObligationTransferService(apiClient)
const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100'
const secondary = 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50'
type Project = { id: string; name: string; code: string }
type Pending = { attempt: TransferAttempt; receipt?: Awaited<ReturnType<typeof service.post>> }

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

  const targets = projects.filter(project => project.id !== projectId)
  const offers = view ? incomingOffers(view) : []
  const scopes = view?.transferableObligations ?? []
  const ready = supervisor && view && reason.trim() && (mode === 'issue'
    ? scopes.some(row => row.id === selected) && targets.some(row => row.id === receiver)
    : offers.some(row => row.id === selected))

  const refresh = () => {
    setError(''); setLoading(true); setView(undefined); setSelected(''); reload(value => value + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current || !supervisor || (!pending && (!ready || !view))) return
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
      setPending(undefined); setSelected(''); setReceiver(''); setReason(''); onLock(false)
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      if (!current || (!current.receipt && status && status >= 400 && status < 500 && status !== 408 && status !== 429)) {
        setPending(undefined); onLock(false)
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
              <select className={field} value={selected} onChange={event => setSelected(event.target.value)} required>
                <option value="">{(mode === 'issue' ? scopes.length : offers.length) ? 'Chọn từ dữ liệu máy chủ' : 'Không có bản ghi từ máy chủ'}</option>
                {mode === 'issue' ? scopes.map(row => <option key={row.id} value={row.id}>{row.routeLabel} · {row.from}–{row.to} m · {row.kind} · {row.id}</option>)
                  : offers.map(row => <option key={row.id} value={row.id}>{projects.find(project => project.id === row.projectId)?.name ?? row.projectId} · {row.obligationId} · {row.id}</option>)}
              </select>
            </label>
            {mode === 'issue' && <label className="space-y-1 text-sm"><span>Dự án nhận</span>
              <select className={field} value={receiver} onChange={event => setReceiver(event.target.value)} required>
                <option value="">{targets.length ? 'Chọn dự án nhận' : 'Không có dự án nhận trong danh mục'}</option>
                {targets.map(project => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}
              </select>
            </label>}
            <label className="space-y-1 text-sm sm:col-span-2"><span>Lý do</span>
              <textarea className={field} value={reason} onChange={event => setReason(event.target.value)} required maxLength={2000} />
            </label>
          </fieldset>
          {mode === 'accept' && <p className="text-xs text-slate-600">Máy chủ kiểm tra đề nghị còn hiệu lực và phạm vi, phiên bản, trách nhiệm chưa thay đổi khi tiếp nhận.</p>}
          <button type="submit" disabled={busy || (!pending && !ready)} className="rounded-lg bg-[#C9A227] px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
            {busy ? 'Đang xác minh…' : pending?.receipt ? 'Thử đọc lại biên nhận' : pending ? 'Thử xác minh lại cùng lệnh' : mode === 'issue' ? 'Phát hành đề nghị' : 'Tiếp nhận nghĩa vụ'}
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
