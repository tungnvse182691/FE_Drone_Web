import React, { useCallback, useEffect, useRef, useState } from 'react'
import { deviceState, grantEffect, GRANT_EFFECT_LABEL, grantReadbackMismatch, intentJournal, isUnknownOutcome, offlineCoordinationService, offlineError, offlineGrantService, recipientKeyFingerprint, type GrantItemScope, type GrantPackageView, type OfflineRow } from '../../api/services/offlineCoordinationService'
import { useAuthStore } from '../../store/authStore'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'
import { useToastStore } from '../../store/toastStore'
import { Empty, Feedback, Field, KV, Loading, PanelButton, PanelShell } from '../../components/ui/PanelKit'

const short = (v: unknown) => (typeof v === 'string' ? v.slice(0, 8) : '—')
const same = (a: unknown, b: unknown) => String(a).toLowerCase() === String(b).toLowerCase()
const when = (v: unknown) => (typeof v === 'string' && Number.isFinite(Date.parse(v)) ? new Date(v).toLocaleString('vi-VN') : '')

type RecipientCheck = 'match' | 'mismatch' | 'unverified'
interface IssueBody { packageId: string; recipientDeviceRegistrationId: string; items: GrantItemScope[]; reason: string }
/** Ý định cấp quyền được giữ (key + body + receipt) để đối soát/gửi lại đúng yêu cầu sau khi mất phản hồi hoặc F5. */
interface IssueEntry { body: IssueBody; key: string; receipt?: { id: string; status: number }; mismatch?: string }

/**
 * Thao tác của Giám sát trên màn Điều phối ngoại tuyến:
 *  - "Cấp quyền bàn giao": POST /projects/{p}/offline/grants. Gói, thiết bị nhận và phạm vi lấy từ GET (packages, devices, packages/{id}); không nhập GUID tay.
 *    Thiết bị nhận chỉ chọn được khi actor/device khớp wrap người nhận VÀ fingerprint khóa mã hóa (GET devices/{id}) khớp wrap trong gói.
 *  - "Chuẩn bị gói ngoại tuyến": POST …/packages/prepare cần gói mã hóa + manifest đã ký bằng khóa thiết bị nguồn (producer ngoài Web) — Web khóa kèm giải thích, không dữ liệu giả.
 * Không có tạo khóa, ký, sync, nhập/xuất gói trên Web. Component được mount lại (key) khi đổi dự án/tài khoản/phiên.
 */
export const OfflineSupervisorActions: React.FC<{ projectId: string; onChanged: () => void }> = ({ projectId, onChanged }) => {
  const actorId = useAuthStore((s) => s.user?.id) || ''
  const epoch = useAuthStore((s) => s.authEpoch)
  const ctx = `${epoch}|${actorId}|${projectId}`
  const ctxRef = useRef(ctx); ctxRef.current = ctx
  const jk = `rg.offline.issue.${actorId}.${projectId}`
  const [src, setSrc] = useState<{ status: 'loading' | 'ready' | 'error'; packages: OfflineRow[]; devices: OfflineRow[]; error?: string }>({ status: 'loading', packages: [], devices: [] })
  const [packageId, setPackageId] = useState('')
  const [pkg, setPkg] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; view?: GrantPackageView; error?: string }>({ status: 'idle' })
  const [rec, setRec] = useState<{ status: 'idle' | 'loading' | 'ready'; checks: Record<string, RecipientCheck> }>({ status: 'idle', checks: {} })
  const [deviceId, setDeviceId] = useState('')
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [entry, setEntry] = useState<IssueEntry | null>(() => (actorId ? intentJournal.get<IssueEntry>(jk) : null))
  const guard = useSubmitGuard()
  const toast = useToastStore()
  const seq = useRef(0)

  const loadSources = useCallback(async () => {
    const my = ++seq.current, c = ctxRef.current
    setSrc({ status: 'loading', packages: [], devices: [] }); setPackageId(''); setDeviceId(''); setPkg({ status: 'idle' }); setRec({ status: 'idle', checks: {} }); setConfirming(false)
    try {
      const [packages, devices] = await Promise.all([offlineCoordinationService.list(projectId, 'packages'), offlineCoordinationService.list(projectId, 'devices')])
      if (seq.current === my && ctxRef.current === c) setSrc({ status: 'ready', packages, devices })
    } catch (e) { if (seq.current === my && ctxRef.current === c) setSrc({ status: 'error', packages: [], devices: [], error: offlineError(e) }) }
  }, [projectId])
  useEffect(() => { void loadSources(); setError(''); setMessage('') }, [loadSources])

  const choosePackage = async (id: string) => {
    const my = ++seq.current, c = ctxRef.current
    setPackageId(id); setDeviceId(''); setConfirming(false); setError(''); setRec({ status: 'idle', checks: {} })
    if (!id) { setPkg({ status: 'idle' }); return }
    setPkg({ status: 'loading' })
    try {
      const view = await offlineGrantService.packageView(projectId, id)
      if (seq.current !== my || ctxRef.current !== c) return
      setPkg({ status: 'ready', view })
      // Đối chiếu fingerprint khóa mã hóa của từng ứng viên (actor+device khớp wrap, chưa thu hồi) với wrap trong gói.
      const cands = src.devices.filter((d) => deviceState(d) === 'NOT_REVOKED' && d.id !== view.sourceDeviceRegistrationId && view.recipients.some((r) => same(r.actorId, d.actorId) && same(r.deviceId, d.deviceId)))
      setRec({ status: 'loading', checks: {} })
      const checks: Record<string, RecipientCheck> = {}
      await Promise.all(cands.map(async (d) => {
        try {
          const detail = await offlineCoordinationService.detail(projectId, 'devices', d.id)
          const key = detail.data.encryptionPublicKey
          if (typeof key !== 'string' || !key) { checks[d.id] = 'unverified'; return }
          const fp = await recipientKeyFingerprint(key)
          checks[d.id] = view.recipients.some((r) => same(r.actorId, d.actorId) && same(r.deviceId, d.deviceId) && r.fingerprint.toLowerCase() === fp) ? 'match' : 'mismatch'
        } catch { checks[d.id] = 'unverified' }
      }))
      if (seq.current === my && ctxRef.current === c) setRec({ status: 'ready', checks })
    } catch (e) { if (seq.current === my && ctxRef.current === c) setPkg({ status: 'error', error: offlineError(e) }) }
  }

  const candidates = pkg.view ? src.devices.filter((d) => deviceState(d) === 'NOT_REVOKED' && d.id !== pkg.view!.sourceDeviceRegistrationId && pkg.view!.recipients.some((r) => same(r.actorId, d.actorId) && same(r.deviceId, d.deviceId))) : []
  const matched = candidates.filter((d) => rec.checks[d.id] === 'match')
  const lock = entry ? 'Có lệnh cấp quyền chưa đối soát xong; xử lý lệnh đó trước khi tạo lệnh mới (tránh cấp trùng).'
    : src.status === 'loading' ? 'Đang đọc gói và thiết bị…'
    : src.status === 'error' ? 'Không đọc được gói/thiết bị nên khóa cấp quyền.'
    : !src.packages.length ? 'Chưa có gói ngoại tuyến nào ở dự án này. Gói do ứng dụng di động của Crew tạo/xuất (Web không tạo được) nên chưa thể cấp quyền.'
    : !packageId ? '' : pkg.status === 'loading' ? 'Đang đọc manifest của gói…' : pkg.status === 'error' ? 'Không đọc được manifest của gói nên khóa cấp quyền.'
    : pkg.view && rec.status === 'loading' ? 'Đang đối chiếu fingerprint khóa người nhận…'
    : pkg.view && !candidates.length ? 'Gói chưa có thiết bị nhận còn hiệu lực (người nhận phải đã đăng ký thiết bị trên ứng dụng di động và được mã hóa trong gói).'
    : pkg.view && rec.status === 'ready' && !matched.length ? 'Có thiết bị cùng actor/device với người nhận trong gói nhưng fingerprint khóa không khớp hoặc chưa đối chiếu được (khóa có thể đã đổi); chỉ là ứng viên, không cho cấp quyền.' : ''
  const ready = !!packageId && pkg.status === 'ready' && !!deviceId && rec.checks[deviceId] === 'match' && !!reason.trim() && !lock

  const verify = async (e0: IssueEntry, c: string) => {
    const receipt = e0.receipt!
    const detail = await offlineCoordinationService.detail(projectId, 'grants', receipt.id)
    if (ctxRef.current !== c) return
    const bad = grantReadbackMismatch(detail.data, { id: receipt.id, projectId, packageId: e0.body.packageId, recipientDeviceRegistrationId: e0.body.recipientDeviceRegistrationId, originIds: e0.body.items.map((i) => i.originId) })
    if (bad) { const next = { ...e0, mismatch: bad }; intentJournal.set(jk, next); setEntry(next); setError(bad + ' Giữ lệnh để đối chiếu; không tạo cấp quyền mới.'); return }
    const eff = grantEffect(detail.data)
    intentJournal.clear(jk); setEntry(null)
    const done = `Đã ghi cấp quyền bàn giao gói ${short(e0.body.packageId)} (mã ${short(receipt.id)}${receipt.status === 200 ? ', máy chủ phát lại kết quả đã lưu của cùng yêu cầu' : ''}). Trạng thái hiện tại theo máy chủ: ${GRANT_EFFECT_LABEL[eff]}${eff === 'ACTIVE' ? ` đến ${when(detail.data.expiresAt)}` : ''}.`
    setMessage(done); if (eff === 'ACTIVE') toast.success(done)
    setConfirming(false); setReason(''); setDeviceId(''); onChanged()
  }
  const execute = async (e0: IssueEntry) => {
    if (!guard.acquire()) return
    const c = ctxRef.current
    setBusy(true); setError(''); setMessage('')
    let cur = e0
    try {
      if (!cur.receipt) {
        const out = await offlineGrantService.issue(projectId, cur.body, cur.key)
        cur = { ...cur, receipt: { id: out.id, status: out.status } }; intentJournal.set(jk, cur)
        if (ctxRef.current === c) setEntry(cur)
      }
      if (ctxRef.current === c) await verify(cur, c)
    } catch (e: any) {
      if (ctxRef.current !== c) return
      setConfirming(false)
      if (cur.receipt) setError(`Máy chủ đã ghi cấp quyền (HTTP ${cur.receipt.status}) nhưng chưa đối chiếu xong: ${e?.message || offlineError(e)} Bấm "Đối soát"; không tạo lệnh mới.`)
      else if (isUnknownOutcome(e)) { setEntry(cur); setError('Chưa nhận được phản hồi nên chưa biết cấp quyền đã được ghi hay chưa. Giữ nguyên khóa và nội dung: bấm "Gửi lại đúng yêu cầu".') }
      else { intentJournal.clear(jk); setEntry(null); setError(offlineError(e)) }
    } finally { setBusy(false); guard.release() }
  }
  const submit = async () => {
    if (!pkg.view || !ready || entry || !actorId) return
    const body: IssueBody = { packageId, recipientDeviceRegistrationId: deviceId, items: pkg.view.items, reason: reason.trim() }
    const e0: IssueEntry = { body, key: crypto.randomUUID() }
    intentJournal.set(jk, e0); setEntry(e0)   // lưu trước lần gửi đầu
    await execute(e0)
  }

  return (
    <div className="space-y-4" data-testid="offline-supervisor-actions">
      <PanelShell icon="key" title="Cấp quyền bàn giao (Giám sát)" subtitle="Cấp quyền cho thiết bị nhận một gói ngoại tuyến đã có. Gói, thiết bị và phạm vi lấy từ máy chủ; không nhập tay.">
        {src.status === 'loading' && <Loading>Đang đọc gói và thiết bị…</Loading>}
        {src.status === 'error' && <div className="rg-alert rg-alert-error"><p role="alert" className="min-w-0 break-words">Không đọc được dữ liệu cấp quyền: {src.error}</p><PanelButton onClick={() => { void loadSources() }}>Thử lại</PanelButton></div>}
        {src.status === 'ready' && !src.packages.length && <Empty icon="inventory_2">Chưa có gói ngoại tuyến nào ở dự án này.</Empty>}
        {entry && (
          <div className="rg-alert rg-alert-warn" data-testid="grant-pending">
            <p className="min-w-0 break-words">Lệnh cấp quyền gói {short(entry.body.packageId)} cho thiết bị {short(entry.body.recipientDeviceRegistrationId)} chưa được xác nhận kết quả ({entry.receipt ? `máy chủ đã nhận, HTTP ${entry.receipt.status}, mã ${short(entry.receipt.id)}` : 'chưa nhận được phản hồi'}). Khóa yêu cầu và nội dung được giữ nguyên{entry.mismatch ? `. ${entry.mismatch}` : ''}.</p>
            {entry.receipt ? <PanelButton loading={busy} disabled={busy} onClick={() => { void execute(entry) }}>Đối soát (đọc lại)</PanelButton> : <PanelButton variant="danger" loading={busy} disabled={busy} onClick={() => { void execute(entry) }}>Gửi lại đúng yêu cầu</PanelButton>}
            {entry.mismatch && <PanelButton disabled={busy} onClick={() => { intentJournal.clear(jk); setEntry(null) }}>Bỏ ghi nhớ (đã đối chiếu thủ công)</PanelButton>}
          </div>
        )}
        <div className="rg-grid">
          <Field label="Gói ngoại tuyến">
            <select aria-label="Gói cần cấp quyền" className="rg-field w-full" value={packageId} disabled={busy || !!entry || src.status !== 'ready' || !src.packages.length} onChange={(e) => { void choosePackage(e.target.value) }}>
              <option value="">Chọn gói từ máy chủ</option>
              {src.packages.map((p) => <option key={p.id} value={p.id}>Gói {short(p.id)} · thiết bị nguồn {short(p.sourceDeviceRegistrationId)} · lô {short(p.sourceBatchId)}</option>)}
            </select>
          </Field>
          {pkg.status === 'ready' && pkg.view && (
            <>
              <Field label="Thiết bị nhận" hint="Chỉ chọn được thiết bị còn hiệu lực có fingerprint khóa khớp wrap người nhận trong gói.">
                <select aria-label="Thiết bị nhận gói" className="rg-field w-full" value={deviceId} disabled={busy || !!entry || !candidates.length} onChange={(e) => { setDeviceId(e.target.value); setConfirming(false) }}>
                  <option value="">Chọn thiết bị nhận hợp lệ</option>
                  {candidates.map((d) => { const ck = rec.checks[d.id]; return <option key={d.id} value={d.id} disabled={ck !== 'match'}>Thiết bị {short(d.deviceId)} · người dùng {short(d.actorId)} · vai trò {String(d.role || '—')}{ck === 'match' ? ' · khóa khớp' : ck === 'mismatch' ? ' · khóa KHÔNG khớp (ứng viên)' : ' · chưa đối chiếu khóa (ứng viên)'}</option> })}
                </select>
              </Field>
              <div className="col-span-12"><KV items={[{ k: 'Số mục trong phạm vi', v: pkg.view.items.length }, { k: 'Loại thao tác', v: [...new Set(pkg.view.items.map((i) => i.kind))].join(', ') }]} /></div>
              <Field label="Lý do cấp quyền"><textarea aria-label="Lý do cấp quyền bàn giao" className="rg-field w-full" rows={2} maxLength={1000} value={reason} disabled={busy || !!entry} onChange={(e) => setReason(e.target.value)} /></Field>
            </>
          )}
        </div>
        {pkg.status === 'error' && <div className="rg-alert rg-alert-error"><p role="alert" className="min-w-0 break-words">Không đọc được manifest của gói: {pkg.error}</p><PanelButton onClick={() => { void choosePackage(packageId) }}>Thử lại</PanelButton></div>}
        {lock && !entry && src.status === 'ready' && pkg.status !== 'error' && <div className="rg-alert rg-alert-warn" data-testid="grant-lock"><p className="min-w-0 break-words">{lock}</p></div>}
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
          <p className="min-w-0 break-words">Chưa thể chuẩn bị từ Web (BLOCKED, chưa kiểm được): yêu cầu cần gói đã mã hóa và manifest được ký bằng khóa của thiết bị nguồn do ứng dụng di động/nguồn ký hợp lệ tạo; Web không tạo khóa, ký hay mã hóa, cũng không có kênh cung cấp gói/manifest hợp lệ để chọn. Thao tác sẽ mở khi có producer và nguồn gói đã ký; Web không dựng dữ liệu mẫu.</p>
        </div>
        <div className="rg-footer"><PanelButton variant="primary" disabled>Chuẩn bị gói ngoại tuyến</PanelButton></div>
      </PanelShell>
    </div>
  )
}
