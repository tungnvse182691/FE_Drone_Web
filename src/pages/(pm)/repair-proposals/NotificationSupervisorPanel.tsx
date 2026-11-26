import React, { useEffect, useState } from 'react'
import { notificationSupervisorService, type NotificationSupervisor } from '../../../api/services/notificationSupervisorService'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

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
  const guard = useSubmitGuard()
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
    if (!guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try { await fn(); setMessage(done); setSupervisorId(''); await load(itemId) } catch (e) { setError(exportError(e)) } finally { setBusy(false); guard.release() }
  }
  const active = current && !current.revokedAt

  return (
    <PanelShell as="div" icon="supervisor_account" title="Giám sát nhận thông báo (hạng mục Fast Track)" className="mt-4" data-testid="notification-supervisor-panel">
      <Field label="Hạng mục Fast Track">
        <select aria-label="Hạng mục Fast Track" value={itemId} disabled={busy} onChange={(e) => setItemId(e.target.value)} className="rg-field w-full">
          <option value="">Chọn hạng mục</option>
          {fastTrack.map((i) => (<option key={i.id} value={i.id}>{i.state} · {i.id.slice(0, 8).toUpperCase()}</option>))}
        </select>
      </Field>
      {itemId && loaded && (active
        ? <div className="rg-subcard"><p>Đang chỉ định: <b className="font-mono">{current!.supervisorId}</b> từ {new Date(current!.assignedAt).toLocaleString('vi-VN')}</p></div>
        : <Empty icon="person_off">{current?.revokedAt ? 'Chỉ định đã được thu hồi.' : 'Chưa chỉ định Giám sát nhận thông báo.'}</Empty>)}
      {itemId && (
        <>
          <Field label="Mã Giám sát nhận thông báo"><input aria-label="Mã Giám sát nhận thông báo" disabled={busy} value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)} placeholder="supervisorId (GUID)" className="rg-field w-full font-mono" /></Field>
          <div className="rg-footer">
            {active && <PanelButton variant="danger" disabled={busy} onClick={() => { void run(() => notificationSupervisorService.revoke(projectId, packageId, itemId), 'Đã thu hồi chỉ định.') }}>Thu hồi chỉ định</PanelButton>}
            <PanelButton variant="primary" loading={busy} disabled={busy || !supervisorId.trim()} onClick={() => { void run(() => notificationSupervisorService.assign(projectId, packageId, itemId, supervisorId), 'Đã chỉ định Giám sát nhận thông báo.') }}>{active ? 'Thay Giám sát' : 'Chỉ định Giám sát'}</PanelButton>
          </div>
        </>
      )}
      <Feedback error={error} message={message} />
    </PanelShell>
  )
}
