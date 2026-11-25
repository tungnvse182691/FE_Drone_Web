import React, { useCallback, useEffect, useRef, useState } from 'react'
import { offlineCoordinationService, offlineGrantService, type GrantPackageView, type OfflineRow } from '../../api/services/offlineCoordinationService'
import { exportError } from '../../api/services/projectExportService'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'
import { useToastStore } from '../../store/toastStore'
import { Empty, Feedback, Field, KV, Loading, PanelButton, PanelShell } from '../../components/ui/PanelKit'

const short = (v: unknown) => (typeof v === 'string' ? v.slice(0, 8) : '—')

/**
 * Thao tác của Giám sát trên màn Điều phối ngoại tuyến:
 *  - "Cấp quyền bàn giao": POST /projects/{p}/offline/grants. Gói, thiết bị nhận và phạm vi lấy từ GET (packages, devices, packages/{id}); không nhập GUID tay.
 *  - "Chuẩn bị gói ngoại tuyến": POST …/packages/prepare cần gói mã hóa + manifest đã ký bằng khóa thiết bị (chỉ ứng dụng di động tạo được) — Web khóa kèm giải thích.
 * Không có tạo khóa, ký, sync, nhập/xuất gói trên Web.
 */
export const OfflineSupervisorActions: React.FC<{ projectId: string; onChanged: () => void }> = ({ projectId, onChanged }) => {
  const [src, setSrc] = useState<{ status: 'loading' | 'ready' | 'error'; packages: OfflineRow[]; devices: OfflineRow[]; error?: string }>({ status: 'loading', packages: [], devices: [] })
  const [packageId, setPackageId] = useState('')
  const [pkg, setPkg] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; view?: GrantPackageView; error?: string }>({ status: 'idle' })
  const [deviceId, setDeviceId] = useState('')
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const guard = useSubmitGuard()
  const toast = useToastStore()
  const seq = useRef(0)
  const key = useRef<{ sig: string; key: string } | null>(null)

  const loadSources = useCallback(async () => {
    const my = ++seq.current
    setSrc({ status: 'loading', packages: [], devices: [] }); setPackageId(''); setDeviceId(''); setPkg({ status: 'idle' }); setConfirming(false)
    try {
      const [packages, devices] = await Promise.all([offlineCoordinationService.list(projectId, 'packages'), offlineCoordinationService.list(projectId, 'devices')])
      if (seq.current === my) setSrc({ status: 'ready', packages, devices })
    } catch (e) { if (seq.current === my) setSrc({ status: 'error', packages: [], devices: [], error: exportError(e) }) }
  }, [projectId])
  useEffect(() => { void loadSources(); setError(''); setMessage('') }, [loadSources])

  const choosePackage = async (id: string) => {
    const my = ++seq.current
    setPackageId(id); setDeviceId(''); setConfirming(false); setError('')
    if (!id) { setPkg({ status: 'idle' }); return }
    setPkg({ status: 'loading' })
    try { const view = await offlineGrantService.packageView(projectId, id); if (seq.current === my) setPkg({ status: 'ready', view }) } catch (e) { if (seq.current === my) setPkg({ status: 'error', error: exportError(e) }) }
  }

  // Thiết bị nhận hợp lệ: còn hiệu lực và là người nhận đã được mã hóa trong gói (đúng actor + deviceId).
  const recipients = pkg.view ? src.devices.filter((d) => !d.revokedAt && pkg.view!.recipients.some((r) => r.actorId === d.actorId && r.deviceId === d.deviceId) && d.id !== pkg.view!.sourceDeviceRegistrationId) : []
  const lock = src.status === 'loading' ? 'Đang đọc gói và thiết bị…'
    : src.status === 'error' ? 'Không đọc được gói/thiết bị nên khóa cấp quyền.'
    : !src.packages.length ? 'Chưa có gói ngoại tuyến nào ở dự án này. Gói do ứng dụng di động của Crew tạo/xuất (Web không tạo được) nên chưa thể cấp quyền.'
    : !packageId ? '' : pkg.status === 'loading' ? 'Đang đọc manifest của gói…' : pkg.status === 'error' ? 'Không đọc được manifest của gói nên khóa cấp quyền.'
    : pkg.view && !recipients.length ? 'Gói chưa có thiết bị nhận còn hiệu lực (người nhận phải đã đăng ký thiết bị trên ứng dụng di động và được mã hóa trong gói).' : ''
  const ready = !!packageId && pkg.status === 'ready' && !!deviceId && !!reason.trim() && !lock

  const submit = async () => {
    if (!pkg.view || !ready || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const body = { packageId, recipientDeviceRegistrationId: deviceId, items: pkg.view.items, reason }
      const sig = JSON.stringify(body)
      if (key.current?.sig !== sig) key.current = { sig, key: crypto.randomUUID() }
      const out = await offlineGrantService.issue(projectId, body, key.current.key)
      key.current = null
      // Đọc lại: chi tiết cấp quyền + danh sách.
      const detail = await offlineCoordinationService.detail(projectId, 'grants', out.id)
      if (detail.data.packageId !== packageId) throw new Error('Chi tiết cấp quyền đọc lại không khớp gói đã chọn; cần đối chiếu.')
      const done = `Đã cấp quyền bàn giao gói ${short(packageId)} (mã cấp quyền ${short(out.id)}); máy chủ xác nhận khi đọc lại.`
      setMessage(done); toast.success(done); setConfirming(false); setReason(''); setDeviceId('')
      onChanged()
    } catch (e: any) {
      setConfirming(false)
      setError(exportError(e))
    } finally { setBusy(false); guard.release() }
  }

  return (
    <div className="space-y-4" data-testid="offline-supervisor-actions">
      <PanelShell icon="key" title="Cấp quyền bàn giao (Giám sát)" subtitle="Cấp quyền cho thiết bị nhận một gói ngoại tuyến đã có. Gói, thiết bị và phạm vi lấy từ máy chủ; không nhập tay.">
        {src.status === 'loading' && <Loading>Đang đọc gói và thiết bị…</Loading>}
        {src.status === 'error' && <div className="rg-alert rg-alert-error"><p role="alert" className="min-w-0 break-words">Không đọc được dữ liệu cấp quyền: {src.error}</p><PanelButton onClick={() => { void loadSources() }}>Thử lại</PanelButton></div>}
        {src.status === 'ready' && !src.packages.length && <Empty icon="inventory_2">Chưa có gói ngoại tuyến nào ở dự án này.</Empty>}
        <div className="rg-grid">
          <Field label="Gói ngoại tuyến">
            <select aria-label="Gói cần cấp quyền" className="rg-field w-full" value={packageId} disabled={busy || src.status !== 'ready' || !src.packages.length} onChange={(e) => { void choosePackage(e.target.value) }}>
              <option value="">Chọn gói từ máy chủ</option>
              {src.packages.map((p) => <option key={p.id} value={p.id}>Gói {short(p.id)} · thiết bị nguồn {short(p.sourceDeviceRegistrationId)} · lô {short(p.sourceBatchId)}</option>)}
            </select>
          </Field>
          {pkg.status === 'ready' && pkg.view && (
            <>
              <Field label="Thiết bị nhận">
                <select aria-label="Thiết bị nhận gói" className="rg-field w-full" value={deviceId} disabled={busy || !recipients.length} onChange={(e) => { setDeviceId(e.target.value); setConfirming(false) }}>
                  <option value="">Chọn thiết bị nhận hợp lệ</option>
                  {recipients.map((d) => <option key={d.id} value={d.id}>Thiết bị {short(d.deviceId)} · người dùng {short(d.actorId)} · vai trò {String(d.role || '—')}</option>)}
                </select>
              </Field>
              <div className="col-span-12"><KV items={[{ k: 'Số mục trong phạm vi', v: pkg.view.items.length }, { k: 'Loại thao tác', v: [...new Set(pkg.view.items.map((i) => i.kind))].join(', ') }]} /></div>
              <Field label="Lý do cấp quyền"><textarea aria-label="Lý do cấp quyền bàn giao" className="rg-field w-full" rows={2} maxLength={1000} value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} /></Field>
            </>
          )}
        </div>
        {pkg.status === 'error' && <div className="rg-alert rg-alert-error"><p role="alert" className="min-w-0 break-words">Không đọc được manifest của gói: {pkg.error}</p><PanelButton onClick={() => { void choosePackage(packageId) }}>Thử lại</PanelButton></div>}
        {lock && src.status === 'ready' && pkg.status !== 'error' && <div className="rg-alert rg-alert-warn" data-testid="grant-lock"><p className="min-w-0 break-words">{lock}</p></div>}
        <Feedback error={error} message={message} />
        {confirming && pkg.view && (
          <div className="rg-subcard space-y-1 text-xs" data-testid="grant-confirm">
            <p className="font-bold">Xác nhận cấp quyền bàn giao</p>
            <p>Gói {short(packageId)} · {pkg.view.items.length} mục · thiết bị nhận {short(src.devices.find((d) => d.id === deviceId)?.deviceId)}</p>
            <p>Lý do: {reason.trim()}</p>
          </div>
        )}
        <div className="rg-footer">
          {confirming && <PanelButton disabled={busy} onClick={() => setConfirming(false)}>Quay lại</PanelButton>}
          <PanelButton variant="primary" loading={busy} disabled={busy || !ready} onClick={() => { if (!confirming) setConfirming(true); else void submit() }}>{busy ? 'Đang gửi…' : confirming ? 'Xác nhận cấp quyền' : 'Cấp quyền bàn giao'}</PanelButton>
        </div>
      </PanelShell>

      <PanelShell icon="inventory_2" title="Chuẩn bị gói ngoại tuyến (Giám sát)" subtitle="POST …/offline/packages/prepare" data-testid="prepare-package-card">
        <div className="rg-alert rg-alert-warn" data-testid="prepare-blocked">
          <p className="min-w-0 break-words">Chưa thể chuẩn bị từ Web: yêu cầu cần gói đã mã hóa và manifest được ký bằng khóa của thiết bị nguồn (chỉ ứng dụng di động tạo được; Web không tạo khóa, ký hay mã hóa). Máy chủ cũng không có API đọc nguồn này để Web chọn. Thao tác sẽ được mở khi ứng dụng di động cung cấp gói/manifest hợp lệ và có nguồn GET tương ứng.</p>
        </div>
        <div className="rg-footer"><PanelButton variant="primary" disabled>Chuẩn bị gói ngoại tuyến</PanelButton></div>
      </PanelShell>
    </div>
  )
}
