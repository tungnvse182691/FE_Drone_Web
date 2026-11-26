import React, { useEffect, useState } from 'react'
import { validationService, type AiMockRun } from '../../../api/services/candidate3ValidationService'
import { aiRunDetailService, type AiRunDetail } from '../../../api/services/aiRunDetailService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, KV, Loading, PanelShell, Pill } from '../../../components/ui/PanelKit'

/** Chi tiết các lần chạy AI của dự án (PM và Giám sát): chọn một lần chạy để xem trạng thái, mã lỗi, hash manifest, version. */
export const AiRunDetailPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [runs, setRuns] = useState<AiMockRun[]>([])
  const [loading, setLoading] = useState(false)
  const [runId, setRunId] = useState('')
  const [detail, setDetail] = useState<AiRunDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true); setError(''); setRunId(''); setDetail(null)
    validationService.getAiMockRuns(projectId).then((r) => { if (alive) setRuns(r) }).catch((e) => { if (alive) setError(exportError(e)) }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [projectId])

  const open = async (id: string) => {
    setRunId(id); setDetail(null); setError('')
    if (!id) return
    try { setDetail(await aiRunDetailService.read(projectId, id)) } catch (e) { setError(exportError(e)) }
  }

  const cls = 'rg-field'

  return (
    <PanelShell icon="smart_toy" title="Chi tiết lần chạy AI" subtitle="Chọn một lần chạy để xem trạng thái, mã lỗi, hash manifest, version." className="!p-5 !rounded-[16px]" data-testid="ai-run-detail-panel">
      <Field label="Lần chạy AI">
        <select aria-label="Lần chạy AI" value={runId} disabled={loading} onChange={(e) => { void open(e.target.value) }} className={`${cls} w-full`}>
          <option value="">Chọn lần chạy ({runs.length})</option>
          {runs.map((r) => (<option key={r.id} value={r.id}>#{r.id.slice(0, 8)} · {r.stage || '—'} · {r.status || '—'} · {r.fixtureVersion || '—'}</option>))}
        </select>
      </Field>
      {loading && <Loading />}
      {!loading && runs.length === 0 && !error && <Empty icon="smart_toy">Dự án chưa có lần chạy AI nào trong CSDL.</Empty>}
      <Feedback error={error} />
      {detail && (
        <div data-testid="ai-run-detail" className="rg-subcard">
          <KV items={[
            { k: 'Trạng thái', v: <Pill tone={detail.errorCode ? 'bad' : /SUCC|DONE|COMPLET/i.test(String(detail.status)) ? 'ok' : 'info'}>{detail.status || '—'}</Pill> },
            { k: 'Giai đoạn', v: detail.stage || '—' },
            { k: 'Chế độ', v: detail.mode || '—' },
            { k: 'Mã lỗi', v: detail.errorCode || 'không có' },
            { k: 'Job', v: detail.processingJobId || '—', mono: true },
            { k: 'Lần thử', v: detail.attemptId || '—', mono: true },
            { k: 'Kết quả', v: detail.resultId || '—', mono: true },
            { k: 'Version', v: detail.version || '—' },
          ]} />
          <div className="min-w-0"><p className="rg-kv-k">Manifest hash</p><p className="rg-kv-v font-mono break-all">{detail.manifestHash || '—'}</p></div>
        </div>
      )}
    </PanelShell>
  )
}
