import React, { useEffect, useState } from 'react'
import { notificationSupervisorService, type NotificationSupervisor } from '../../../api/services/notificationSupervisorService'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { exportError } from '../../../api/services/projectExportService'

/**
 * PM chỉ định Giám sát nhận thông báo cho hạng mục Fast Track.
 * BE không có API liệt kê Giám sát cho PM nên PM nhập mã Giám sát (supervisorId) — xem API-GAP-NOTES mục T.
 */
export const NotificationSupervisorPanel: React.FC<{ projectId: string; packageId: string; items: RepairItem[] }> = ({ projectId, packageId, items }) => {
  const fastTrack = items.filter((i) => i.mode === 'FastTrack')
  const [itemId, setItemId] = useState('')
  const [current, setCurrent] = useState<NotificationSupervisor | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [supervisorId, setSupervisorId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async (id: string) => {
    setLoaded(false); setCurrent(null); setError('')
    if (!id) return
    try { setCurrent(await notificationSupervisorService.read(projectId, packageId, id)); setLoaded(true) } catch (e) { setError(exportError(e)) }
  }
  useEffect(() => { void load(itemId) }, [itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!fastTrack.length) return null
  const run = async (fn: () => Promise<unknown>, done: string) => {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await fn(); setMessage(done); setSupervisorId(''); await load(itemId) } catch (e) { setError(exportError(e)) } finally { setBusy(false) }
  }
  const active = current && !current.revokedAt

  return (
    <div className="space-y-2 text-xs border-t pt-3 mt-3" data-testid="notification-supervisor-panel">
      <p className="font-semibold">Giám sát nhận thông báo (hạng mục Fast Track)</p>
      <select aria-label="Hạng mục Fast Track" value={itemId} disabled={busy} onChange={(e) => setItemId(e.target.value)} className="w-full border rounded-lg p-2">
        <option value="">Chọn hạng mục</option>
        {fastTrack.map((i) => (<option key={i.id} value={i.id}>{i.state} · {i.id.slice(0, 8).toUpperCase()}</option>))}
      </select>
      {itemId && loaded && (active
        ? <p>Đang chỉ định: <b>{current!.supervisorId}</b> từ {new Date(current!.assignedAt).toLocaleString('vi-VN')}</p>
        : <p className="text-slate-500">{current?.revokedAt ? 'Chỉ định đã được thu hồi.' : 'Chưa chỉ định Giám sát nhận thông báo.'}</p>)}
      {itemId && (
        <>
          <input aria-label="Mã Giám sát nhận thông báo" disabled={busy} value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)} placeholder="supervisorId (GUID)" className="w-full border rounded-lg p-2" />
          <div className="flex gap-2">
            <button type="button" disabled={busy || !supervisorId.trim()} onClick={() => { void run(() => notificationSupervisorService.assign(projectId, packageId, itemId, supervisorId), 'Đã chỉ định Giám sát nhận thông báo.') }} className="border rounded-lg px-3 py-2">{active ? 'Thay Giám sát' : 'Chỉ định Giám sát'}</button>
            {active && <button type="button" disabled={busy} onClick={() => { void run(() => notificationSupervisorService.revoke(projectId, packageId, itemId), 'Đã thu hồi chỉ định.') }} className="border rounded-lg px-3 py-2">Thu hồi chỉ định</button>}
          </div>
        </>
      )}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
    </div>
  )
}
