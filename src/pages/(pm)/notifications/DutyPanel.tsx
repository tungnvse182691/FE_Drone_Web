import React, { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { dutyService, type DutyClock, type DutyProject, type DutyRequest, type WeeklyDigest } from '../../../api/services/dutyService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, KV, Loading, PanelButton, PanelShell, SectionTitle } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

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
  const guard = useSubmitGuard()
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
    if (!guard.acquire()) return
    setBusy(key); setError(''); setMessage('')
    try { await fn(); setMessage(done); await load() } catch (e) { setError(exportError(e)) } finally { setBusy(''); guard.release() }
  }
  const cls = 'rg-field'

  return (
    <PanelShell icon="assignment_ind" title="Yêu cầu tiếp nhận và phân công nghiệp vụ" className="!p-5 space-y-5" data-testid="duty-panel"
      actions={<>
        <select aria-label="Dự án" value={projectId} disabled={loading || !!busy} onChange={(e) => setProjectId(e.target.value)} className={`${cls} min-w-[14rem]`}>
          {projects.map((p) => (<option key={p.projectId} value={p.projectId}>{p.projectCode ? `${p.projectCode} · ` : ''}{p.name || p.projectId}</option>))}
        </select>
        <PanelButton disabled={loading || !projectId} loading={loading} onClick={() => { void load() }}>{loading ? 'Đang tải…' : 'Tải lại'}</PanelButton>
      </>}>
      <Feedback error={error} message={message} />

      <div data-testid="duty-requests" className="space-y-2">
        <SectionTitle icon="inbox">Yêu cầu tiếp nhận ({requests.length})</SectionTitle>
        {loading && requests.length === 0 && <Loading />}
        {!loading && requests.length === 0 && <Empty icon="inbox">Không có yêu cầu tiếp nhận nào trong CSDL.</Empty>}
        {requests.map((r) => {
          const mine = r.responsibleActorId === user?.id
          const canAck = mine && !r.acknowledgedAt && !r.completedAt
          const canAppoint = isSupervisor && r.kind === 'SupervisorEscalation' && !r.completedAt
          return (
            <div key={r.id} className="rg-row space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-brand-dark">{r.kind}</span>
                <span className="text-slate-500">nguồn {r.sourceKind}</span>
                <span>trạng thái <b className="rg-pill rg-pill-info align-middle">{r.receivingState}</b></span>
                <span className="text-slate-500">người chịu trách nhiệm {r.responsibleRole || '—'}{mine ? ' (bạn)' : ''}</span>
              </div>
              <KV items={[
                { k: 'Yêu cầu lúc', v: fmt(r.requestedAt) },
                { k: 'Hạn', v: fmt(r.currentDueAt) },
                { k: 'Đã xác nhận', v: fmt(r.acknowledgedAt) },
                ...(r.completedAt ? [{ k: 'Hoàn tất', v: fmt(r.completedAt) }] : []),
              ]} />
              {canAck && <div className="rg-footer"><PanelButton variant="primary" disabled={!!busy} loading={busy === 'ack' + r.id} onClick={() => { void run('ack' + r.id, () => dutyService.ack(r.projectId, r.id), 'Đã xác nhận tiếp nhận yêu cầu.') }}>{busy === 'ack' + r.id ? 'Đang gửi…' : 'Xác nhận đã nhận'}</PanelButton></div>}
              {canAppoint && (
                <div className="flex flex-wrap items-center gap-2 border-t border-brand-border pt-2">
                  <select aria-label="Người được chỉ định nhận yêu cầu" value={pick[r.id] || ''} disabled={!!busy} onChange={(e) => setPick((p) => ({ ...p, [r.id]: e.target.value }))} className={cls}><option value="">Chọn Giám sát</option>{assignees.sup.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}</select>
                  <input aria-label="Lý do chỉ định yêu cầu" value={reason[r.id] || ''} disabled={!!busy} onChange={(e) => setReason((p) => ({ ...p, [r.id]: e.target.value }))} placeholder="Lý do" className={`${cls} flex-1 min-w-[10rem]`} />
                  <PanelButton disabled={!!busy || !pick[r.id] || !(reason[r.id] || '').trim()} onClick={() => { void run('ap' + r.id, () => dutyService.appointRequest(r.projectId, r.id, pick[r.id], reason[r.id]), 'Đã chỉ định người nhận yêu cầu.') }}>Chỉ định</PanelButton>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isSupervisor && (
        <div data-testid="duty-clocks" className="space-y-2">
          <SectionTitle icon="timer">Chỉ định người phụ trách đồng hồ thời hạn</SectionTitle>
          {!loading && clocks.length === 0 && <Empty icon="timer_off">Không có đồng hồ thời hạn nào trong CSDL.</Empty>}
          {clocks.filter((c) => !c.completedAt).map((c) => {
            const pmDuty = c.kind === 'ProjectManagerReview'
            const options = pmDuty ? assignees.pm : assignees.sup
            return (
              <div key={c.id} className="rg-row flex flex-wrap items-center gap-2">
                <span className="mr-2 min-w-0 flex-1 basis-64"><b className="text-brand-dark">{c.kind}</b> · <span className="font-mono">#{c.targetId.slice(0, 8)}</span> · hạn {fmt(c.currentDueAt)} · phụ trách {c.appointedRole || '—'}</span>
                <select aria-label={`Người phụ trách đồng hồ ${c.id.slice(0, 8)}`} value={pick[c.id] || ''} disabled={!!busy} onChange={(e) => setPick((p) => ({ ...p, [c.id]: e.target.value }))} className={cls}><option value="">{pmDuty ? 'Chọn PM' : 'Chọn Giám sát'}</option>{options.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}</select>
                <input aria-label={`Lý do chỉ định đồng hồ ${c.id.slice(0, 8)}`} value={reason[c.id] || ''} disabled={!!busy} onChange={(e) => setReason((p) => ({ ...p, [c.id]: e.target.value }))} placeholder="Lý do" className={cls} />
                <PanelButton disabled={!!busy || !pick[c.id] || !(reason[c.id] || '').trim()} onClick={() => { void run('ck' + c.id, () => dutyService.appointClock(c, pick[c.id], reason[c.id]), 'Đã chỉ định người phụ trách đồng hồ.') }}>Chỉ định</PanelButton>
              </div>
            )
          })}
        </div>
      )}

      <div data-testid="duty-digest" className="space-y-2">
        <SectionTitle icon="summarize">Bản tóm tắt tuần</SectionTitle>
        <div className="flex items-end gap-2">
          <div className="flex-1"><span className="rg-label">Mã bản tóm tắt tuần</span><input aria-label="Mã bản tóm tắt tuần" value={digestId} disabled={!!busy} onChange={(e) => setDigestId(e.target.value)} placeholder="Mã bản tóm tắt (GUID, lấy từ thông báo tóm tắt tuần)" className={`${cls} w-full font-mono`} /></div>
          <PanelButton disabled={!!busy || !projectId || !digestId.trim()} onClick={() => { void run('digest', async () => setDigest(await dutyService.digest(projectId, digestId)), 'Đã đọc bản tóm tắt tuần.') }}>Đọc</PanelButton>
        </div>
        {digest && (
          <div className="rg-subcard">
            <KV items={[
              { k: 'Lên lịch', v: fmt(digest.scheduledAtUtc) },
              { k: 'Khôi phục', v: fmt(digest.recoveredAtUtc) },
              { k: 'Kỳ bù', v: digest.recoveryPeriods?.join(', ') || '—' },
            ]} />
            {(digest.pendingAtRecovery || []).length === 0 && <Empty icon="task_alt">Không có nghĩa vụ tồn đọng.</Empty>}
            {(digest.pendingAtRecovery || []).map((d) => (<p key={d.clockId} className="rounded-lg bg-white border border-brand-border px-3 py-2">{d.kind} · <span className="font-mono">#{d.targetId.slice(0, 8)}</span> · hạn {fmt(d.dueAtRecoveryUtc)}</p>))}
          </div>
        )}
      </div>
    </PanelShell>
  )
}
