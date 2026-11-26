import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { defectLifecycleError, defectLifecycleService } from '../../../api/services/defectLifecycleService'

type Receipts = Awaited<ReturnType<typeof defectLifecycleService.recurrences>>

export function DefectRecurrenceHistory({ projectId, defectId }: { projectId: string; defectId: string }) {
  const [rows, setRows] = useState<Receipts>()
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setRows(undefined); setError('')
    defectLifecycleService.recurrences(projectId, defectId, controller.signal)
      .then(data => { if (!controller.signal.aborted) setRows(data) })
      .catch(err => { if (!controller.signal.aborted) setError(defectLifecycleError(err)) })
    return () => controller.abort()
  }, [projectId, defectId, reload])
  return <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
    <h2 className="font-bold text-sm">Lịch sử tái phát</h2>
    {error ? <><p role="alert">Không đọc được lịch sử: {error}</p><button type="button" className="underline" onClick={() => setReload(n => n + 1)}>Đọc lại</button></>
      : !rows ? <p role="status">Đang đọc lịch sử…</p>
        : !rows.length ? <p role="status">Chưa có liên kết tái phát được ghi nhận.</p>
          : <ul className="space-y-2">{rows.map(row => {
            const isPredecessor = row.defectId === defectId
            const related = isPredecessor ? row.linkedDefectId! : row.defectId!
            return <li key={row.id} className="break-words">
              {isPredecessor ? 'Khiếm khuyết tái phát: ' : 'Khiếm khuyết trước: '}
              <Link className="underline" to={`/pm/defects/${related}/verify`}>#{related.slice(0, 8).toUpperCase()}</Link>
              {row.at && ` · ${new Date(row.at).toLocaleString('vi-VN')}`}
              <p>Quyết định sửa chữa trước: {row.priorRepairDecisionId}</p>
            </li>
          })}</ul>}
  </section>
}
