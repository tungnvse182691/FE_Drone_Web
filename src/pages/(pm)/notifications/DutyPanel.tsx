import React, { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { dutyService, type DutyClock, type DutyProject, type DutyRequest, type WeeklyDigest } from '../../../api/services/dutyService'
import { exportError } from '../../../api/services/projectExportService'

const fmt = (v?: string | null) => (v ? new Date(v).toLocaleString('vi-VN') : '—')
type Assignee = { id: string; name: string }

/**
 * Trung tâm thông báo: yêu cầu tiếp nhận nghiệp vụ, chỉ định người phụ trách đồng hồ, bản tóm tắt tuần.
 * Dữ liệu 100% từ BE; BE kiểm vai trò (Giám sát chỉ định, người chịu trách nhiệm xác nhận).
 */
export const DutyPanel: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const [projects, setProjects] = useState<DutyProject[]>([])
  const [projectId, setProjectId] = useState('')
  const [requests, setRequests] = useState<DutyRequest[]>([])
  const [clocks, setClocks] = useState<DutyClock[]>([])
  const [assignees, setAssignees] = useState<{ sup: Assignee[]; pm: Assignee[] }>({ sup: [], pm: [] })
  const [pick, setPick] = useState<Record<string, string>>({})
  const [reason, setReason] = useState<Record<string, string>>({})
  const [digestId, setDigestId] = useState('')
  const [digest, setDigest] = useState<WeeklyDigest | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let alive = true
    dutyService.projects().then((p) => { if (alive) { setProjects(p); setProjectId(p[0]?.projectId || '') } }).catch((e) => { if (alive) setError(`Không đọc được danh sách dự án: ${exportError(e)}`) })
    if (isSupervisor) {
      Promise.all([dutyService.assignees('SUPERVISOR'), dutyService.assignees('PM')]).then(([sup, pm]) => { if (alive) setAssignees({ sup, pm }) }).catch((e) => { if (alive) setError(`Không đọc được danh sách người được chỉ định: ${exportError(e)}`) })
    }
    return () => { alive = false }
  }, [isSupervisor])

  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true); setError('')
    try {
      const [r, c] = await Promise.all([dutyService.requests(projectId), dutyService.clocks(projectId)])
      setRequests(r); setClocks(c)
    } catch (e) { setError(exportError(e)) } finally { setLoading(false) }
  }, [projectId])
  useEffect(() => { setDigest(null); void load() }, [load])

  const run = async (key: string, fn: () => Promise<unknown>, done: string) => {
    if (busy) return
    setBusy(key); setError(''); setMessage('')
    try { await fn(); setMessage(done); await load() } catch (e) { setError(exportError(e)) } finally { setBusy('') }
  }
  const cls = 'border border-[#E2E5E9] rounded-lg p-2 text-xs'

  return (
    <section className="bg-white rounded-[16px] border border-[#E2E5E9] p-5 space-y-5 text-xs" data-testid="duty-panel">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-bold text-base text-[#1A1D20]">Yêu cầu tiếp nhận và phân công nghiệp vụ</h3>
        <select aria-label="Dự án" value={projectId} disabled={loading || !!busy} onChange={(e) => setProjectId(e.target.value)} className={cls}>
          {projects.map((p) => (<option key={p.projectId} value={p.projectId}>{p.projectCode ? `${p.projectCode} · ` : ''}{p.name || p.projectId}</option>))}
        </select>
        <button type="button" disabled={loading || !projectId} onClick={() => { void load() }} className={cls}>{loading ? 'Đang tải…' : 'Tải lại'}</button>
      </div>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}

      <div data-testid="duty-requests" className="space-y-2">
        <p className="font-semibold">Yêu cầu tiếp nhận ({requests.length})</p>
        {!loading && requests.length === 0 && <p className="text-slate-500">Không có yêu cầu tiếp nhận nào trong CSDL.</p>}
        {requests.map((r) => {
          const mine = r.responsibleActorId === user?.id
          const canAck = mine && !r.acknowledgedAt && !r.completedAt
          const canAppoint = isSupervisor && r.kind === 'SupervisorEscalation' && !r.completedAt
          return (
            <div key={r.id} className="rounded-xl border border-[#E2E5E9] p-3 space-y-2">
              <p>{r.kind} · nguồn {r.sourceKind} · trạng thái <b>{r.receivingState}</b> · người chịu trách nhiệm {r.responsibleRole || '—'}{mine ? ' (bạn)' : ''}</p>
              <p>Yêu cầu lúc {fmt(r.requestedAt)} · hạn {fmt(r.currentDueAt)} · đã xác nhận {fmt(r.acknowledgedAt)}{r.completedAt ? ` · hoàn tất ${fmt(r.completedAt)}` : ''}</p>
              {canAck && <button type="button" disabled={!!busy} onClick={() => { void run('ack' + r.id, () => dutyService.ack(r.projectId, r.id), 'Đã xác nhận tiếp nhận yêu cầu.') }} className={cls}>{busy === 'ack' + r.id ? 'Đang gửi…' : 'Xác nhận đã nhận'}</button>}
              {canAppoint && (
                <div className="flex flex-wrap gap-2">
                  <select aria-label="Người được chỉ định nhận yêu cầu" value={pick[r.id] || ''} disabled={!!busy} onChange={(e) => setPick((p) => ({ ...p, [r.id]: e.target.value }))} className={cls}><option value="">Chọn Giám sát</option>{assignees.sup.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}</select>
                  <input aria-label="Lý do chỉ định yêu cầu" value={reason[r.id] || ''} disabled={!!busy} onChange={(e) => setReason((p) => ({ ...p, [r.id]: e.target.value }))} placeholder="Lý do" className={cls} />
                  <button type="button" disabled={!!busy || !pick[r.id] || !(reason[r.id] || '').trim()} onClick={() => { void run('ap' + r.id, () => dutyService.appointRequest(r.projectId, r.id, pick[r.id], reason[r.id]), 'Đã chỉ định người nhận yêu cầu.') }} className={cls}>Chỉ định</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isSupervisor && (
        <div data-testid="duty-clocks" className="space-y-2">
          <p className="font-semibold">Chỉ định người phụ trách đồng hồ thời hạn</p>
          {!loading && clocks.length === 0 && <p className="text-slate-500">Không có đồng hồ thời hạn nào trong CSDL.</p>}
          {clocks.filter((c) => !c.completedAt).map((c) => {
            const pmDuty = c.kind === 'ProjectManagerReview'
            const options = pmDuty ? assignees.pm : assignees.sup
            return (
              <div key={c.id} className="rounded-xl border border-[#E2E5E9] p-3 flex flex-wrap items-center gap-2">
                <span className="mr-2">{c.kind} · #{c.targetId.slice(0, 8)} · hạn {fmt(c.currentDueAt)} · phụ trách {c.appointedRole || '—'}</span>
                <select aria-label={`Người phụ trách đồng hồ ${c.id.slice(0, 8)}`} value={pick[c.id] || ''} disabled={!!busy} onChange={(e) => setPick((p) => ({ ...p, [c.id]: e.target.value }))} className={cls}><option value="">{pmDuty ? 'Chọn PM' : 'Chọn Giám sát'}</option>{options.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}</select>
                <input aria-label={`Lý do chỉ định đồng hồ ${c.id.slice(0, 8)}`} value={reason[c.id] || ''} disabled={!!busy} onChange={(e) => setReason((p) => ({ ...p, [c.id]: e.target.value }))} placeholder="Lý do" className={cls} />
                <button type="button" disabled={!!busy || !pick[c.id] || !(reason[c.id] || '').trim()} onClick={() => { void run('ck' + c.id, () => dutyService.appointClock(c, pick[c.id], reason[c.id]), 'Đã chỉ định người phụ trách đồng hồ.') }} className={cls}>Chỉ định</button>
              </div>
            )
          })}
        </div>
      )}

      <div data-testid="duty-digest" className="space-y-2">
        <p className="font-semibold">Bản tóm tắt tuần</p>
        <div className="flex gap-2">
          <input aria-label="Mã bản tóm tắt tuần" value={digestId} disabled={!!busy} onChange={(e) => setDigestId(e.target.value)} placeholder="Mã bản tóm tắt (GUID, lấy từ thông báo tóm tắt tuần)" className={`${cls} flex-1`} />
          <button type="button" disabled={!!busy || !projectId || !digestId.trim()} onClick={() => { void run('digest', async () => setDigest(await dutyService.digest(projectId, digestId)), 'Đã đọc bản tóm tắt tuần.') }} className={cls}>Đọc</button>
        </div>
        {digest && (
          <div className="rounded-xl border border-[#E2E5E9] p-3 space-y-1">
            <p>Lên lịch {fmt(digest.scheduledAtUtc)} · khôi phục {fmt(digest.recoveredAtUtc)} · kỳ bù: {digest.recoveryPeriods?.join(', ') || '—'}</p>
            {(digest.pendingAtRecovery || []).length === 0 && <p className="text-slate-500">Không có nghĩa vụ tồn đọng.</p>}
            {(digest.pendingAtRecovery || []).map((d) => (<p key={d.clockId}>{d.kind} · #{d.targetId.slice(0, 8)} · hạn {fmt(d.dueAtRecoveryUtc)}</p>))}
          </div>
        )}
      </div>
    </section>
  )
}
