import React, { useCallback, useEffect, useState } from 'react'
import { projectService, type HubProject } from '../../api/services/projectService'
import { offlineCoordinationService, type OfflineDetail, type OfflineKind, type OfflineRow } from '../../api/services/offlineCoordinationService'
import { exportError } from '../../api/services/projectExportService'
import { useAuthStore } from '../../store/authStore'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'
import { RoleCode } from '../../types/enums'
import { Empty, Feedback, KV, Loading, PanelButton, PanelShell, Pill } from '../../components/ui/PanelKit'
import { OfflineSupervisorActions } from './OfflineSupervisorActions'

const KIND_LABEL: Record<OfflineKind, string> = { devices: 'Thiết bị', packages: 'Gói ngoại tuyến', grants: 'Cấp quyền bàn giao' }
const when = (v: unknown) => (typeof v === 'string' && Number.isFinite(Date.parse(v)) ? new Date(v).toLocaleString('vi-VN') : '')
const short = (v: unknown) => (typeof v === 'string' ? v.slice(0, 8) : '—')

/**
 * PM-13 Điều phối ngoại tuyến (tài liệu BE 05_Web/03_PM-Screen-API-Matrix, API-114..130).
 * Web chỉ đọc + thu hồi (PM: thiết bị; Giám sát: cấp quyền). Không có API xung đột ngoại tuyến; thao tác ký/mật mã thuộc app.
 */
export const OfflineCoordination: React.FC = () => {
  const role = useAuthStore((s) => s.user?.role)
  const epoch = useAuthStore((s) => s.authEpoch)
  const isPM = role === RoleCode.PROJECT_MANAGER, isSup = role === RoleCode.SUPERVISOR
  const [projects, setProjects] = useState<HubProject[] | null>(null)
  const [projectId, setProjectId] = useState('')
  const [kind, setKind] = useState<OfflineKind>('devices')
  const [rows, setRows] = useState<OfflineRow[] | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<{ id: string; detail?: OfflineDetail; loading: boolean } | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()

  useEffect(() => {
    let alive = true
    setProjects(null); setError('')
    projectService.fetchProjects().then((p) => { if (alive) { setProjects(p); setProjectId((cur) => cur || p[0]?.id || '') } }).catch((e) => { if (alive) { setProjects([]); setError(`Không đọc được danh sách dự án: ${exportError(e)}`) } })
    return () => { alive = false }
  }, [epoch])

  const load = useCallback(async () => {
    if (!projectId) return
    setRows(null); setError(''); setSelected(null)
    try { setRows(await offlineCoordinationService.list(projectId, kind)) } catch (e) { setRows([]); setError(`Không đọc được ${KIND_LABEL[kind].toLowerCase()}: ${exportError(e)}`) }
  }, [projectId, kind])
  useEffect(() => { void load() }, [load])

  const open = async (id: string) => {
    setSelected({ id, loading: true }); setReason(''); setMessage('')
    try { setSelected({ id, loading: false, detail: await offlineCoordinationService.detail(projectId, kind, id) }) } catch (e) { setSelected({ id, loading: false }); setError(`Không đọc được chi tiết: ${exportError(e)}`) }
  }
  const canRevoke = (kind === 'devices' && isPM) || (kind === 'grants' && isSup)
  const revoke = async () => {
    if (!selected || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      await offlineCoordinationService.revoke(projectId, kind as 'devices' | 'grants', selected.id, reason)
      setMessage('Đã thu hồi. Dữ liệu được đọc lại từ máy chủ.'); const id = selected.id; await load(); await open(id)
    } catch (e: any) {
      setError(e?.response?.data?.code === 'concurrency_conflict' ? 'Mục đã thay đổi. Đã tải lại; xác nhận lại rồi gửi.' : exportError(e))
    } finally { setBusy(false); guard.release() }
  }

  const scalars = selected?.detail ? Object.entries(selected.detail.data).filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v) || v === null) : []
  const nested = selected?.detail ? Object.entries(selected.detail.data).filter(([, v]) => v !== null && typeof v === 'object').map(([k, v]) => `${k} (${Array.isArray(v) ? v.length + ' mục' : 'đối tượng'})`) : []

  return (
    <div className="space-y-4" data-testid="offline-coordination">
      <PanelShell icon="sync_alt" title="Điều phối ngoại tuyến" subtitle="Đọc thiết bị, gói và cấp quyền bàn giao theo dự án; thu hồi theo quyền. Đồng bộ/ký/nhập-xuất gói do ứng dụng di động thực hiện, web không có API xung đột.">
        <div className="flex flex-wrap items-end gap-2">
          <select aria-label="Dự án" className="rg-field !w-auto" value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={!projects?.length}>
            {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
          </select>
          {(Object.keys(KIND_LABEL) as OfflineKind[]).map((k) => <PanelButton key={k} variant={k === kind ? 'primary' : 'secondary'} onClick={() => setKind(k)}>{KIND_LABEL[k]}</PanelButton>)}
          <PanelButton onClick={() => { void load() }}>Tải lại</PanelButton>
        </div>
        <Feedback error={error} message={message} />
        {projects === null && <Loading>Đang đọc dự án…</Loading>}
        {projects && projects.length === 0 && !error && <Empty icon="folder_off">Chưa có dự án trong phạm vi của bạn.</Empty>}
        {rows === null && projectId && <Loading>Đang đọc {KIND_LABEL[kind].toLowerCase()}…</Loading>}
        {rows && rows.length === 0 && !error && <Empty icon="sync_disabled">Chưa có {KIND_LABEL[kind].toLowerCase()} nào ở dự án này.</Empty>}
        {rows && rows.length > 0 && (
          <ul className="space-y-2">
            {rows.map((r) => {
              const revoked = !!r.revokedAt
              return (
                <li key={r.id} className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2 ${selected?.id === r.id ? 'border-brand-navy bg-brand-surfaceAlt' : 'border-brand-border bg-white'}`}>
                  <span className="font-mono text-xs font-semibold">{short(r.id)}</span>
                  {kind === 'devices' && <span className="text-xs text-slate-600">Thiết bị {short(r.deviceId)} · vai trò {String(r.role || '—')} · rev {String(r.revision ?? '—')}</span>}
                  {kind === 'packages' && <span className="text-xs text-slate-600">Nguồn: thiết bị {short(r.sourceDeviceRegistrationId)} · lô {short(r.sourceBatchId)}</span>}
                  {kind === 'grants' && <span className="text-xs text-slate-600">Gói {short(r.packageId)} · cấp {when(r.issuedAt) || '—'} · hết hạn {when(r.expiresAt) || '—'}</span>}
                  {kind !== 'packages' && <Pill tone={revoked ? 'bad' : 'ok'}>{revoked ? `Đã thu hồi ${when(r.revokedAt)}` : 'Đang hiệu lực'}</Pill>}
                  <PanelButton className="ml-auto" onClick={() => { void open(r.id) }}>Chi tiết</PanelButton>
                </li>
              )
            })}
          </ul>
        )}
      </PanelShell>
      {isSup && projectId && <OfflineSupervisorActions projectId={projectId} onChanged={() => { setKind('grants'); void load() }} />}
      {selected && (
        <PanelShell icon="info" title={`Chi tiết ${KIND_LABEL[kind].toLowerCase()} ${short(selected.id)}`} subtitle="Chỉ hiển thị các trường đơn giản máy chủ trả; payload mật mã/riêng tư không hiển thị">
          {selected.loading && <Loading>Đang đọc chi tiết…</Loading>}
          {selected.detail && (
            <div className="space-y-3">
              <KV items={scalars.map(([k, v]) => ({ k, v: v === null ? '—' : typeof v === 'boolean' ? (v ? 'Có' : 'Không') : (when(v) || String(v)), mono: true }))} />
              {nested.length > 0 && <p className="rg-hint">Trường lồng nhau không hiển thị: {nested.join(', ')}.</p>}
              {canRevoke && !selected.detail.data.revokedAt && (
                <div className="rg-subcard space-y-2">
                  <input aria-label="Lý do thu hồi" className="rg-field" placeholder="Lý do thu hồi" maxLength={1000} value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} />
                  <PanelButton variant="danger" loading={busy} disabled={busy || !reason.trim()} onClick={() => { void revoke() }}>{kind === 'devices' ? 'Thu hồi thiết bị' : 'Thu hồi cấp quyền'}</PanelButton>
                </div>
              )}
              {!canRevoke && kind !== 'packages' && <p className="rg-hint">{kind === 'devices' ? 'Thu hồi thiết bị do PM thực hiện.' : 'Thu hồi cấp quyền do Giám sát thực hiện.'}</p>}
            </div>
          )}
        </PanelShell>
      )}
    </div>
  )
}
export default OfflineCoordination
