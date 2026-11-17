import React, { useEffect, useState } from 'react'
import { geometryImpactService, type GeometryImpactView } from '../../../api/services/geometryImpactService'
import { fieldTaskActions } from '../../../api/services/fieldTaskActions'
import { fastTrackService } from '../../../api/services/fastTrackService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, Loading, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

type Action = 'VERIFY' | 'CONTINUE' | 'STOP' | 'REASSIGN'
const ACTION_LABEL: Record<Action, string> = { VERIFY: 'Xác minh lại vị trí', CONTINUE: 'Tiếp tục nhiệm vụ', STOP: 'Dừng nhiệm vụ', REASSIGN: 'Giao lại cho Crew khác' }

/** PM quyết định xử lý nhiệm vụ đo khi hình học tuyến thay đổi (BE: location-impact-decisions). Danh sách ảnh hưởng đọc từ BE. */
export const FieldTaskImpactPanel: React.FC<{ projectId: string; taskId: string; started: boolean; onDone: () => void }> = ({ projectId, taskId, started, onDone }) => {
  const [impacts, setImpacts] = useState<GeometryImpactView[] | null>(null)
  const [crews, setCrews] = useState<{ id: string; name: string }[]>([])
  const [impactId, setImpactId] = useState('')
  const [action, setAction] = useState<Action>('VERIFY')
  const [crewId, setCrewId] = useState('')
  const [portion, setPortion] = useState<'NONE' | 'PARTIAL' | 'CAPTURED_INTAKE' | 'UNKNOWN'>('NONE')
  const [summary, setSummary] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([geometryImpactService.list(projectId), fastTrackService.getCrews(projectId)])
      .then(([i, c]) => { if (alive) { setImpacts(i); setCrews(c.map((x) => ({ id: x.id, name: x.name }))) } })
      .catch((e) => { if (alive) setError(exportError(e)) })
    return () => { alive = false }
  }, [projectId])

  const submit = async () => {
    if (!guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      await fieldTaskActions.locationImpact(projectId, taskId, { impactId, action, reason, assignedToUserId: crewId || undefined, handover: started ? { performedPortionState: portion, summary } : undefined })
      setMessage(`Đã gửi quyết định: ${ACTION_LABEL[action]}.`); setReason(''); onDone()
    } catch (e) { setError(exportError(e)) } finally { setBusy(false); guard.release() }
  }
  const needHandover = started && (action === 'REASSIGN' || action === 'STOP')
  const cls = 'rg-field w-full'

  return (
    <PanelShell as="div" icon="alt_route" title="Quyết định khi hình học tuyến thay đổi" className="mt-4" data-testid="field-task-impact-panel">
      {impacts === null && !error && <Loading>Đang tải…</Loading>}
      {impacts && impacts.length === 0 && <Empty icon="route">Dự án chưa có đánh giá ảnh hưởng hình học nào trong CSDL.</Empty>}
      {impacts && impacts.length > 0 && (
        <>
          <div className="rg-grid">
            <Field label="Đánh giá ảnh hưởng hình học" span="col-span-12 md:col-span-6">
              <select aria-label="Đánh giá ảnh hưởng hình học" value={impactId} disabled={busy} onChange={(e) => setImpactId(e.target.value)} className={cls}>
                <option value="">Chọn đánh giá ảnh hưởng</option>
                {impacts.map((i) => (<option key={i.id} value={i.id}>#{i.id.slice(0, 8)} · ghi nhận {new Date(i.recordedAt).toLocaleString('vi-VN')} · {i.references?.length ?? 0} đối tượng</option>))}
              </select>
            </Field>
            <Field label="Quyết định ảnh hưởng hình học" span="col-span-12 md:col-span-6">
              <select aria-label="Quyết định ảnh hưởng hình học" value={action} disabled={busy} onChange={(e) => setAction(e.target.value as Action)} className={cls}>
                {(Object.keys(ACTION_LABEL) as Action[]).map((a) => (<option key={a} value={a}>{ACTION_LABEL[a]}</option>))}
              </select>
            </Field>
            {action === 'REASSIGN' && (
              <Field label="Crew nhận việc sau thay đổi hình học">
                <select aria-label="Crew nhận việc sau thay đổi hình học" value={crewId} disabled={busy} onChange={(e) => setCrewId(e.target.value)} className={cls}>
                  <option value="">Chọn Crew nhận việc</option>
                  {crews.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </Field>
            )}
            {needHandover && (
              <>
                <Field label="Phần việc đã thực hiện (ảnh hưởng hình học)" span="col-span-12 md:col-span-5">
                  <select aria-label="Phần việc đã thực hiện (ảnh hưởng hình học)" value={portion} disabled={busy} onChange={(e) => setPortion(e.target.value as typeof portion)} className={cls}>
                    <option value="NONE">Chưa làm gì</option><option value="PARTIAL">Đã làm một phần</option><option value="CAPTURED_INTAKE">Đã ghi nhận số liệu/nộp</option><option value="UNKNOWN">Không rõ</option>
                  </select>
                </Field>
                <Field label="Tóm tắt bàn giao (ảnh hưởng hình học)" span="col-span-12 md:col-span-7"><textarea aria-label="Tóm tắt bàn giao (ảnh hưởng hình học)" rows={2} maxLength={2000} disabled={busy} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Tóm tắt phần việc đã làm để bàn giao" className={cls} /></Field>
              </>
            )}
            <Field label="Lý do quyết định ảnh hưởng hình học"><textarea aria-label="Lý do quyết định ảnh hưởng hình học" rows={2} maxLength={2000} disabled={busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={cls} /></Field>
          </div>
          <div className="rg-footer">
            <PanelButton variant="primary" loading={busy} disabled={busy || !impactId || !reason.trim() || (action === 'REASSIGN' && !crewId) || (needHandover && !summary.trim())} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Gửi quyết định'}</PanelButton>
          </div>
        </>
      )}
      <Feedback error={error} message={message} />
    </PanelShell>
  )
}
