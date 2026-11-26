import React, { useCallback, useEffect, useRef, useState } from 'react'
import { projectService, type HubProject } from '../../api/services/projectService'
import { GRANT_EFFECT_LABEL, deviceState, grantEffect, intentJournal, isUnknownOutcome, offlineCoordinationService, offlineError, type GrantEffect, type OfflineDetail, type OfflineKind, type OfflineRow } from '../../api/services/offlineCoordinationService'
import { useAuthStore } from '../../store/authStore'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'
import { RoleCode } from '../../types/enums'
import { Empty, Feedback, KV, Loading, PanelButton, PanelShell, Pill } from '../../components/ui/PanelKit'
import { OfflineSupervisorActions } from './OfflineSupervisorActions'

const KIND_LABEL: Record<OfflineKind, string> = { devices: 'Thiết bị', packages: 'Gói ngoại tuyến', grants: 'Cấp quyền bàn giao' }
const when = (v: unknown) => (typeof v === 'string' && Number.isFinite(Date.parse(v)) ? new Date(v).toLocaleString('vi-VN') : '')
const short = (v: unknown) => (typeof v === 'string' ? v.slice(0, 8) : '—')
const NO_DATA = 'Chưa có dữ liệu'

/** Chỉ các trường nghiệp vụ được hiển thị; ciphertext, manifest, chữ ký, khóa công khai và hash KHÔNG render. */
const FIELDS: Record<OfflineKind, Array<[string, string, ('time' | 'id')?]>> = {
  devices: [['id', 'Mã đăng ký thiết bị', 'id'], ['actorId', 'Người dùng', 'id'], ['deviceId', 'Mã thiết bị', 'id'], ['role', 'Vai trò'], ['revision', 'Phiên bản đăng ký'], ['registeredAt', 'Đăng ký lúc', 'time'], ['revokedAt', 'Thu hồi lúc', 'time']],
  packages: [['id', 'Mã gói', 'id'], ['originalActorId', 'Người tạo gói', 'id'], ['sourceDeviceRegistrationId', 'Đăng ký thiết bị nguồn', 'id'], ['sourceBatchId', 'Lô nguồn', 'id']],
  grants: [['id', 'Mã cấp quyền', 'id'], ['packageId', 'Gói', 'id'], ['sourceActorId', 'Người nguồn', 'id'], ['sourceDeviceRegistrationId', 'Thiết bị nguồn', 'id'], ['recipientActorId', 'Người nhận', 'id'], ['recipientDeviceRegistrationId', 'Thiết bị nhận', 'id'], ['role', 'Vai trò người nhận'], ['issuedBy', 'Người cấp', 'id'], ['issuedAt', 'Cấp lúc', 'time'], ['expiresAt', 'Hết hạn lúc', 'time'], ['revokedAt', 'Thu hồi lúc', 'time']],
}
const countIn = (json: unknown, path: 'items' | 'recipients') => { try { const o = JSON.parse(String(json)) as Record<string, unknown>; const a = o[path] ?? o[path[0].toUpperCase() + path.slice(1)]; return Array.isArray(a) ? a.length : null } catch { return null } }
const effectTone = (e: GrantEffect) => (e === 'ACTIVE' ? 'ok' : e === 'MISSING' ? 'neutral' : e === 'EXPIRED' ? 'warn' : 'bad') as 'ok' | 'neutral' | 'warn' | 'bad'
const fmtField = (v: unknown, t?: 'time' | 'id') => (v === undefined ? NO_DATA : v === null ? 'Chưa có' : t === 'time' ? (when(v) || NO_DATA) : String(v))

interface Pending { reason: string; key: string; phase: 'sent' | 'received'; status?: number }
const journalKey = (actor: string, project: string, kind: string, id: string) => `rg.offline.revoke.${actor}.${project}.${kind}.${id}`

/**
 * PM-13 Điều phối ngoại tuyến (tài liệu BE 05_Web/03_PM-Screen-API-Matrix, API-114..130).
 * Web chỉ đọc + thu hồi (PM: đăng ký thiết bị của CHÍNH MÌNH; Giám sát: cấp quyền). Không có API xung đột ngoại tuyến; thao tác ký/mật mã thuộc app.
 */
export const OfflineCoordination: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const role = user?.role, actorId = user?.id || ''
  const epoch = useAuthStore((s) => s.authEpoch)
  const isPM = role === RoleCode.PROJECT_MANAGER, isSup = role === RoleCode.SUPERVISOR
  const [projects, setProjects] = useState<HubProject[] | null>(null)
  const [projectId, setProjectId] = useState('')
  const [kind, setKind] = useState<OfflineKind>('devices')
  const [rows, setRows] = useState<OfflineRow[] | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<{ id: string; detail?: OfflineDetail; loading: boolean; error?: string } | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()

  // Ngữ cảnh của mọi lệnh bất đồng bộ: đổi phiên/tài khoản/dự án/tab → kết quả cũ bị bỏ.
  const ctx = `${epoch}|${actorId}|${projectId}|${kind}`
  const ctxRef = useRef(ctx); ctxRef.current = ctx
  const loadSeq = useRef(0), openSeq = useRef(0)
  const loadAbort = useRef<AbortController | null>(null)

  useEffect(() => {
    let alive = true
    setProjects(null); setProjectId(''); setRows(null); setSelected(null); setPending(null); setError(''); setMessage(''); setReason('')
    projectService.fetchProjects().then((p) => { if (alive) { setProjects(p); setProjectId(p[0]?.id || '') } }).catch((e) => { if (alive) { setProjects([]); setError(`Không đọc được danh sách dự án: ${offlineError(e)}`) } })
    return () => { alive = false }
  }, [epoch, actorId])

  const load = useCallback(async () => {
    if (!projectId) return
    const c = ctxRef.current, seq = ++loadSeq.current
    loadAbort.current?.abort(); const ac = new AbortController(); loadAbort.current = ac
    setRows(null); setError('')
    try { const r = await offlineCoordinationService.list(projectId, kind, ac.signal); if (loadSeq.current === seq && ctxRef.current === c) setRows(r) } catch (e) { if (loadSeq.current === seq && ctxRef.current === c && !ac.signal.aborted) { setRows([]); setError(`Không đọc được ${KIND_LABEL[kind].toLowerCase()}: ${offlineError(e)}`) } }
  }, [projectId, kind, epoch, actorId])
  useEffect(() => { setSelected(null); setPending(null); setReason(''); setMessage(''); void load(); return () => { loadAbort.current?.abort() } }, [load])

  const readDetail = async (id: string): Promise<OfflineDetail | null> => {
    const c = ctxRef.current, seq = ++openSeq.current
    const d = await offlineCoordinationService.detail(projectId, kind, id)
    return openSeq.current === seq && ctxRef.current === c ? d : null
  }
  const open = async (id: string) => {
    const c = ctxRef.current, seq = openSeq.current + 1
    setSelected({ id, loading: true }); setReason(''); setMessage(''); setError('')
    setPending(kind === 'packages' || !actorId ? null : intentJournal.get<Pending>(journalKey(actorId, projectId, kind, id)))
    try { const detail = await readDetail(id); if (detail) setSelected({ id, loading: false, detail }) } catch (e) { if (openSeq.current === seq && ctxRef.current === c) setSelected({ id, loading: false, error: `Không đọc được chi tiết: ${offlineError(e)}` }) }
  }

  const detail = selected?.detail?.data
  // PM chỉ thu hồi đăng ký của chính actor + đúng vai trò; Giám sát thu hồi cấp quyền. BE vẫn là nơi kiểm quyền cuối.
  const ownDevice = !!detail && kind === 'devices' && isPM && detail.actorId === actorId && detail.role === 'ProjectManager'
  const revoked = !!detail && (kind === 'devices' ? deviceState(detail) === 'REVOKED' : grantEffect(detail) === 'REVOKED')
  const canRevoke = !!detail && !revoked && ((kind === 'devices' && ownDevice) || (kind === 'grants' && isSup))

  const finishRevoked = async (id: string, text: string, c: string) => {
    const fresh = await offlineCoordinationService.detail(projectId, kind, id)
    if (ctxRef.current !== c) return
    const done = kind === 'devices' ? deviceState(fresh.data) === 'REVOKED' && fresh.data.actorId === actorId : grantEffect(fresh.data) === 'REVOKED'
    if (!done) throw new Error('Đọc lại chưa thấy tài nguyên này bị thu hồi.')
    intentJournal.clear(journalKey(actorId, projectId, kind, id)); setPending(null)
    setSelected({ id, loading: false, detail: fresh }); setMessage(text); void load()
  }
  const send = async (replay: boolean) => {
    if (!selected || !actorId || kind === 'packages' || !guard.acquire()) return
    const c = ctxRef.current, id = selected.id, k = kind
    const jk = journalKey(actorId, projectId, k, id)
    let intent = intentJournal.get<Pending>(jk)
    if (!intent) { if (!reason.trim()) { guard.release(); return } intent = { reason: reason.trim(), key: crypto.randomUUID(), phase: 'sent' }; intentJournal.set(jk, intent) } else if (!replay) { guard.release(); return }
    setBusy(true); setError(''); setMessage('')
    try {
      const out = await offlineCoordinationService.revoke(projectId, k, id, intent.reason, intent.key)
      intent = { ...intent, phase: 'received', status: out.status }; intentJournal.set(jk, intent)
      if (ctxRef.current !== c) return
      setPending(intent)
      if (out.data.id !== id) throw new Error('Phản hồi thu hồi không khớp tài nguyên đã chọn.')
      await finishRevoked(id, `Đã thu hồi ${KIND_LABEL[k].toLowerCase()} ${short(id)}${out.status === 200 ? ' (máy chủ phát lại kết quả đã lưu của cùng yêu cầu)' : ''}. Đã đọc lại từ máy chủ và xác nhận đúng tài nguyên.`, c)
    } catch (e: any) {
      if (ctxRef.current !== c) return
      const code = e?.response?.data?.code
      if (intent.phase === 'received') { setPending(intent); setError(`Máy chủ đã nhận lệnh (HTTP ${intent.status}) nhưng chưa đối chiếu xong: ${e?.message || offlineError(e)} Bấm "Đối soát"; không tạo lệnh mới.`) }
      else if (isUnknownOutcome(e)) { setPending(intent); setError('Chưa nhận được phản hồi nên chưa biết lệnh đã được ghi hay chưa. Giữ nguyên khóa yêu cầu: bấm "Đối soát" hoặc "Gửi lại đúng yêu cầu".') }
      else {
        intentJournal.clear(jk); setPending(null); setError(offlineError(e))
        if (code === 'offline_key_revoked' || code === 'handover_grant_revoked') { void load(); try { const d = await readDetail(id); if (d) setSelected({ id, loading: false, detail: d }) } catch { /* giữ lỗi hiện tại */ } }
      }
    } finally { setBusy(false); guard.release() }
  }
  const reconcile = async () => {
    if (!selected || !actorId || kind === 'packages' || !pending || !guard.acquire()) return
    const c = ctxRef.current, id = selected.id
    setBusy(true); setError(''); setMessage('')
    try { await finishRevoked(id, `Đã đối soát: ${KIND_LABEL[kind].toLowerCase()} ${short(id)} đã bị thu hồi (đọc lại từ máy chủ).`, c) }
    catch (e: any) { if (ctxRef.current === c) setError(`Chưa đối soát xong: ${e?.message || offlineError(e)} Lệnh vẫn được giữ nguyên khóa; chưa tạo lệnh mới.`) }
    finally { setBusy(false); guard.release() }
  }

  const scalars = detail ? FIELDS[kind].map(([k, label, t]) => ({ k: label, v: fmtField(detail[k], t), mono: t !== 'time' })) : []
  const extra: Array<{ k: string; v: React.ReactNode; mono?: boolean }> = []
  if (detail && kind === 'grants') {
    const e = grantEffect(detail), n = countIn(detail.scopeJson, 'items')
    extra.push({ k: 'Hiệu lực hiển thị', v: <Pill tone={effectTone(e)}>{GRANT_EFFECT_LABEL[e]}</Pill> }, { k: 'Số mục trong phạm vi', v: n === null ? NO_DATA : n })
  }
  if (detail && kind === 'devices') extra.push({ k: 'Trạng thái đăng ký', v: ({ REVOKED: 'Đã thu hồi', NOT_REVOKED: 'Chưa thu hồi', MISSING: 'Thiếu thông tin' } as const)[deviceState(detail)] })
  if (detail && kind === 'packages') { const n = countIn(detail.signedManifestJson, 'items'), r = countIn(detail.cipherPackageJson, 'recipients'); extra.push({ k: 'Số mục trong manifest đã ký', v: n === null ? NO_DATA : n }, { k: 'Số người nhận được mã hóa', v: r === null ? NO_DATA : r }) }

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
              const eff = grantEffect(r), dev = deviceState(r)
              return (
                <li key={r.id} className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2 ${selected?.id === r.id ? 'border-brand-navy bg-brand-surfaceAlt' : 'border-brand-border bg-white'}`}>
                  <span className="font-mono text-xs font-semibold">{short(r.id)}</span>
                  {kind === 'devices' && <span className="text-xs text-slate-600">Thiết bị {short(r.deviceId)} · vai trò {String(r.role || '—')} · rev {String(r.revision ?? '—')}{r.actorId === actorId ? ' · của bạn' : ''}</span>}
                  {kind === 'packages' && <span className="text-xs text-slate-600">Nguồn: thiết bị {short(r.sourceDeviceRegistrationId)} · lô {short(r.sourceBatchId)}</span>}
                  {kind === 'grants' && <span className="text-xs text-slate-600">Gói {short(r.packageId)} · cấp {when(r.issuedAt) || '—'} · hết hạn {when(r.expiresAt) || '—'}</span>}
                  {kind === 'grants' && <Pill tone={effectTone(eff)}>{eff === 'REVOKED' ? `Đã thu hồi ${when(r.revokedAt)}` : GRANT_EFFECT_LABEL[eff]}</Pill>}
                  {kind === 'devices' && <Pill tone={dev === 'REVOKED' ? 'bad' : dev === 'NOT_REVOKED' ? 'ok' : 'neutral'}>{dev === 'REVOKED' ? `Đã thu hồi ${when(r.revokedAt)}` : dev === 'NOT_REVOKED' ? 'Chưa thu hồi' : 'Thiếu thông tin'}</Pill>}
                  <PanelButton className="ml-auto" onClick={() => { void open(r.id) }}>Chi tiết</PanelButton>
                </li>
              )
            })}
          </ul>
        )}
      </PanelShell>
      {isSup && projectId && <OfflineSupervisorActions key={`${epoch}|${actorId}|${projectId}`} projectId={projectId} onChanged={() => { setKind('grants'); void load() }} />}
      {selected && (
        <PanelShell icon="info" title={`Chi tiết ${KIND_LABEL[kind].toLowerCase()} ${short(selected.id)}`} subtitle="Chỉ hiển thị các trường nghiệp vụ; payload mật mã, manifest, chữ ký và khóa không hiển thị. Trạng thái hiển thị không thay quyết định của máy chủ.">
          {selected.loading && <Loading>Đang đọc chi tiết…</Loading>}
          {selected.error && <div className="rg-alert rg-alert-error"><p role="alert" className="min-w-0 break-words">{selected.error}</p><PanelButton onClick={() => { void open(selected.id) }}>Thử lại</PanelButton></div>}
          {detail && (
            <div className="space-y-3">
              <KV items={[...scalars, ...extra]} />
              {pending && (
                <div className="rg-alert rg-alert-warn" data-testid="revoke-pending">
                  <p className="min-w-0 break-words">Lệnh thu hồi chưa được xác nhận kết quả (lý do đã gửi: “{pending.reason}”; {pending.phase === 'received' ? `máy chủ đã nhận, HTTP ${pending.status}` : 'chưa nhận được phản hồi'}). Khóa yêu cầu được giữ nguyên.</p>
                  <PanelButton loading={busy} disabled={busy} onClick={() => { void reconcile() }}>Đối soát (đọc lại)</PanelButton>
                  {pending.phase === 'sent' && <PanelButton variant="danger" disabled={busy} onClick={() => { void send(true) }}>Gửi lại đúng yêu cầu</PanelButton>}
                </div>
              )}
              {canRevoke && !pending && (
                <div className="rg-subcard space-y-2">
                  <input aria-label="Lý do thu hồi" className="rg-field" placeholder="Lý do thu hồi" maxLength={1000} value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} />
                  <PanelButton variant="danger" loading={busy} disabled={busy || !reason.trim()} onClick={() => { void send(false) }}>{kind === 'devices' ? 'Thu hồi thiết bị' : 'Thu hồi cấp quyền'}</PanelButton>
                </div>
              )}
              {!canRevoke && !revoked && kind !== 'packages' && <p className="rg-hint" data-testid="revoke-hint">{kind === 'devices' ? (isPM ? 'Chỉ chủ đăng ký thiết bị (chính tài khoản PM đã đăng ký) mới thu hồi được; bạn xem được danh sách nhưng không có quyền thu hồi thiết bị này.' : 'Thu hồi đăng ký thiết bị do chính chủ (PM/Crew) thực hiện.') : 'Thu hồi cấp quyền do Giám sát thực hiện.'}</p>}
            </div>
          )}
        </PanelShell>
      )}
    </div>
  )
}
export default OfflineCoordination
