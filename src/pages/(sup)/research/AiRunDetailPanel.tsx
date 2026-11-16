import React, { useEffect, useState } from 'react'
import { validationService, type AiMockRun } from '../../../api/services/candidate3ValidationService'
import { aiRunDetailService, type AiRunDetail } from '../../../api/services/aiRunDetailService'
import { exportError } from '../../../api/services/projectExportService'

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
  const cls = 'border border-[#E2E5E9] rounded-lg p-2 text-xs'

  return (
    <section className="bg-white rounded-[16px] border border-[#E2E5E9] p-5 space-y-2 text-xs" data-testid="ai-run-detail-panel">
      <h3 className="font-bold text-base text-[#1A1D20]">Chi tiết lần chạy AI</h3>
      <select aria-label="Lần chạy AI" value={runId} disabled={loading} onChange={(e) => { void open(e.target.value) }} className={`${cls} w-full`}>
        <option value="">Chọn lần chạy ({runs.length})</option>
        {runs.map((r) => (<option key={r.id} value={r.id}>#{r.id.slice(0, 8)} · {r.stage || '—'} · {r.status || '—'} · {r.fixtureVersion || '—'}</option>))}
      </select>
      {!loading && runs.length === 0 && !error && <p className="text-slate-500">Dự án chưa có lần chạy AI nào trong CSDL.</p>}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {detail && (
        <div data-testid="ai-run-detail" className="rounded-xl border border-[#E2E5E9] p-3 space-y-1">
          <p>Trạng thái <b>{detail.status || '—'}</b> · giai đoạn {detail.stage || '—'} · chế độ {detail.mode || '—'} · mã lỗi {detail.errorCode || 'không có'}</p>
          <p>Job {detail.processingJobId || '—'} · lần thử {detail.attemptId || '—'} · kết quả {detail.resultId || '—'}</p>
          <p>Manifest hash {detail.manifestHash || '—'} · version {detail.version || '—'}</p>
        </div>
      )}
    </section>
  )
}
