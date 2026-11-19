import { useEffect, useState } from 'react'
import { defectLifecycleError, defectLifecycleService } from '../../../api/services/defectLifecycleService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

type Props = Parameters<typeof defectLifecycleService.closure>[0]
type View = Awaited<ReturnType<typeof defectLifecycleService.closure>>

export function DefectClosurePanel({ projectId, packageId, itemId }: Props) {
  const ref = { projectId, packageId, itemId }
  const [view, setView] = useState<View>()
  const [loadError, setLoadError] = useState('')
  const [writeError, setWriteError] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const guard = useSubmitGuard()
  let pending: ReturnType<typeof defectLifecycleService.pending> = null
  let journalError = ''
  try { pending = defectLifecycleService.pending(ref) } catch (error) { journalError = defectLifecycleError(error) }

  useEffect(() => {
    const controller = new AbortController()
    setView(undefined); setLoadError('')
    defectLifecycleService.closure({ projectId, packageId, itemId }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setView(result) })
      .catch(error => { if (!controller.signal.aborted) setLoadError(defectLifecycleError(error)) })
    return () => controller.abort()
  }, [projectId, packageId, itemId, reload])

  const canSubmit = !busy && !journalError && (!!pending || (!!view?.canClose && !!reason.trim()))
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || !guard.acquire()) return
    setBusy(true); setWriteError('')
    try {
      const result = await defectLifecycleService.close(ref, reason, view)
      setView(result); setReason(''); setLoadError('')
    } catch (error) {
      setWriteError(defectLifecycleError(error))
      setReload(n => n + 1)
    } finally { guard.release(); setBusy(false) }
  }

  return <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-2">
    <h2 className="font-bold">Đóng khiếm khuyết</h2>
    {view && <p className="text-slate-600">Khiếm khuyết #{view.defectId.slice(0, 8).toUpperCase()} · Tách biệt với nghiệm thu hạng mục.</p>}
    {view?.closed && <p role="status">Khiếm khuyết đã đóng.{view.closure?.at && ` Ngày ghi nhận: ${new Date(view.closure.at).toLocaleString('vi-VN')}.`}</p>}
    {view?.blocker && <p role="status">{view.blocker}</p>}
    {!view && !loadError && <p role="status">Đang đối chiếu hồ sơ vòng đời…</p>}
    {loadError && <p role="alert">Không đọc được hồ sơ: {loadError}</p>}
    {(journalError || writeError) && <p role="alert">{journalError || writeError}</p>}
    {(loadError || view?.blocker || writeError) && <button type="button" disabled={busy} className="underline" onClick={() => setReload(n => n + 1)}>Đọc lại hồ sơ</button>}
    {(pending || view?.canClose) && !journalError && <form className="space-y-2" onSubmit={submit}>
      <label className="grid gap-1">Lý do đóng khiếm khuyết
        <textarea className="rg-field" maxLength={2000} required disabled={busy || !!pending} value={pending?.body.reason ?? reason} onChange={e => setReason(e.target.value)} />
      </label>
      {pending && <p role="status">{pending.received ? 'Đã nhận phản hồi ghi; chỉ đối chiếu lại, không gửi lệnh mới.' : 'Kết quả lần gửi trước chưa rõ; thử lại đúng yêu cầu đã lưu.'}</p>}
      <button type="submit" disabled={!canSubmit} className="rounded-lg bg-slate-800 px-3 py-2 text-white disabled:opacity-50">
        {busy ? 'Đang xử lý…' : pending?.received ? 'Đối chiếu biên nhận' : pending ? 'Thử lại yêu cầu đang chờ' : 'Xác nhận đóng khiếm khuyết'}
      </button>
    </form>}
  </section>
}
