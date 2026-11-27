import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiRunDetailService, isAiRunTerminal, type AiRunDetail } from '../../../api/services/aiRunDetailService'
import { aiApiErrorText } from '../../../api/services/aiRunDetailService'
import { Empty, Loading, PanelButton, Pill, SectionTitle } from '../../../components/ui/PanelKit'

const POLL_MS = 3000
const MAX_POLLS = 100 // ~5 phút; hết thì dừng và báo rõ, người dùng bấm "Đọc lại" để tiếp tục

const STATUS_TONE = (s?: string | null) => (/FAIL|ERROR/i.test(String(s)) ? 'bad' : /SUCCE/i.test(String(s)) ? 'ok' : 'info') as 'bad' | 'ok' | 'info'
const dt = (v?: string | null) => (v ? new Date(v).toLocaleString('vi-VN') : '—')

/**
 * Theo dõi các lần chạy AI của một bản nộp: đọc từ BE (GET /projects/{p}/ai-videos?datasetId=) nên công việc được BE phát hiện
 * luôn hiện lại sau khi nạp lại trang; tự đọc lại trong lúc còn QUEUED/RUNNING, dừng khi kết thúc hoặc khi rời màn.
 * workId (công việc AI) và processingJobId (job xử lý) là hai mã khác nhau, hiển thị riêng nhãn.
 */
export const AiRunTracker: React.FC<{
  projectId: string; taskId: string; datasetId: string
  refreshKey: number; highlightRunId?: string
  onViewJob: (jobId: string) => void
}> = ({ projectId, taskId, datasetId, refreshKey, highlightRunId, onViewJob }) => {
  const navigate = useNavigate()
  const [runs, setRuns] = useState<AiRunDetail[] | null>(null)
  const [error, setError] = useState('')
  const [stalled, setStalled] = useState(false)
  const [manual, setManual] = useState(0)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let polls = 0
    const ctl = new AbortController()
    const load = async () => {
      try {
        const rows = await aiRunDetailService.listForDataset(projectId, taskId, datasetId, ctl.signal)
        if (!alive) return
        setRuns(rows); setError('')
        if (rows.some((r) => !isAiRunTerminal(r.status))) {
          if (polls >= MAX_POLLS) { setStalled(true); return }
          polls += 1; setStalled(false)
          timer = setTimeout(() => { void load() }, POLL_MS)
        } else setStalled(false)
      } catch (e) {
        if (alive && !ctl.signal.aborted) { setRuns(null); setError(`Không đọc được work AI real của bản nộp (GET ai-videos): ${aiApiErrorText(e)}`) }
      }
    }
    setRuns(null); setError(''); setStalled(false); void load()
    return () => { alive = false; ctl.abort(); if (timer) clearTimeout(timer) }
  }, [projectId, taskId, datasetId, refreshKey, manual])

  const open = (r: AiRunDetail) => navigate(`/pm/surveys/${taskId}?work=${encodeURIComponent(r.workId!)}&job=${encodeURIComponent(r.processingJobId!)}&dataset=${encodeURIComponent(datasetId)}${r.firstDetectionId ? `&det=${encodeURIComponent(r.firstDetectionId)}` : ''}`)

  return (
    <div className="space-y-2" data-testid="ai-run-tracker">
      <SectionTitle icon="timeline">Các lần chạy AI của bản nộp này</SectionTitle>
      {error && <p role="alert" className="rg-alert rg-alert-error text-xs">{error} <button type="button" className="underline ml-2" onClick={() => setManual((n) => n + 1)}>Thử lại</button></p>}
      {runs === null && !error && <Loading>Đang đọc các lần chạy AI…</Loading>}
      {runs && runs.length === 0 && !error && <Empty icon="smart_toy">Bản nộp này chưa có lần chạy AI.</Empty>}
      {stalled && <p role="note" className="rg-alert rg-alert-warn text-xs">Đã ngừng tự đọc lại sau {Math.round((MAX_POLLS * POLL_MS) / 60000)} phút mà lần chạy vẫn chưa kết thúc. <button type="button" className="underline ml-2" onClick={() => setManual((n) => n + 1)}>Đọc lại</button></p>}
      {runs?.map((r) => (
        <div key={r.id} data-testid="ai-run-row" data-run-id={r.id} data-status={r.status || ''} className={`rg-row space-y-1.5 ${highlightRunId === r.id ? '!border-brand-navy' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={STATUS_TONE(r.status)}>{r.status || '—'}</Pill>
            <span className="text-[11px] text-slate-500">{r.stage || '—'} · trạng thái work/job do BE trả{r.datasetVersionNo ? ` · bản nộp ${r.datasetVersionNo}` : ''} · {dt(r.createdAt)}</span>
            {highlightRunId === r.id && <span className="rg-pill rg-pill-info">Vừa tạo</span>}
          </div>
          <p className="text-[11px] font-mono break-all"><span className="font-sans font-semibold">Mã công việc AI (workId):</span> {r.id}</p>
          <p className="text-[11px] font-mono break-all"><span className="font-sans font-semibold">Mã job xử lý (processingJobId):</span> {r.processingJobId || '—'}</p>
          <p className="text-[11px] font-mono break-all" data-testid="ai-run-origin"><span className="font-sans font-semibold">Mã đối chiếu gốc của lần chạy (originCorrelationId):</span> {r.originCorrelationId || '—'}</p>
          {/^FAIL/i.test(String(r.status)) && <p role="alert" className="text-xs text-rose-700 break-words">Lần chạy thất bại: {r.errorCode ? `BE báo mã lỗi ${r.errorCode}` : 'BE không trả mã lỗi'}{r.failure?.reasonCode ? ` · reasonCode ${r.failure.reasonCode}` : ''}{r.failure?.step ? ` · bước ${r.failure.step}` : ''}{r.failure?.field ? ` · trường ${r.failure.field}` : ''}{r.failure?.recovery ? ` · Hướng xử lý: ${r.failure.recovery}` : ''}{r.failure?.originCorrelationId || r.originCorrelationId ? ` · originCorrelationId ${r.failure?.originCorrelationId || r.originCorrelationId}` : ''}.</p>}
          {!isAiRunTerminal(r.status) && <p className="text-[11px] text-slate-500">Đang chờ BE xử lý, tự đọc lại sau mỗi {POLL_MS / 1000} giây…</p>}
          <div className="rg-footer">
            {r.processingJobId && <PanelButton onClick={() => onViewJob(r.processingJobId!)}>Xem job xử lý</PanelButton>}
            {/^SUCCE/i.test(String(r.status)) && <PanelButton variant="primary" onClick={() => open(r)}>Mở kết quả thẩm định</PanelButton>}
          </div>
        </div>
      ))}
    </div>
  )
}
