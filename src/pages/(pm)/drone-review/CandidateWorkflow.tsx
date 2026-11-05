import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { surveyService, AiCandidateFactsDto, CandidateDecisionDto } from '../../../api/services/surveyService'
import { apiClient } from '../../../api/client'
import { useAuthStore } from '../../../store/authStore'

const message = (e: any) => [e?.response?.status, e?.response?.data?.code, e?.response?.data?.detail || e?.message].filter(Boolean).join(' — ')

export const CandidateWorkflow: React.FC = () => {
  const [query, setQuery] = useSearchParams()
  const project = query.get('projectId') || '', run = query.get('runId') || '', source = query.get('sourceId') || ''
  const epoch = useAuthStore(state => state.authEpoch)
  const [projects, setProjects] = useState<any[]>([]), [runs, setRuns] = useState<any[]>([])
  const [detections, setDetections] = useState<any[]>([])
  const [candidate, setCandidate] = useState<AiCandidateFactsDto | null>(null)
  const [decision, setDecision] = useState<CandidateDecisionDto | null>(null)
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [reload, setReload] = useState(0)
  const [reason, setReason] = useState('')
  useEffect(() => {
    let active = true
    setProjects([]); setRuns([]); setDetections([]); setCandidate(null); setDecision(null); setError(''); setReason(''); setBusy(true)
    const load = async () => {
      const projects = await surveyService.readSurveyPage('/projects')
      if (!active) return
      setProjects(projects)
      if (!project) return
      if (!projects.some(p => p.projectId === project)) throw new Error('Dự án không thuộc phạm vi API cho phép.')
      const runs = await surveyService.readSurveyPage(`/projects/${project}/ai-mock-runs`)
      if (!active) return
      setRuns(runs)
      if (!run) return
      if (!runs.some(r => r.id === run && r.status === 'SUCCEEDED')) throw new Error('Run chưa SUCCEEDED hoặc không thuộc project.')
      const result = await apiClient.get(`/projects/${project}/ai-mock-runs/${run}/result`)
      if (!active) return
      if (!Array.isArray(result.data.detections)) throw new Error('AI result sai contract detections.')
      setDetections(result.data.detections)
      if (!source) return
      if (!result.data.detections.some((d: any) => d.detectionId === source)) throw new Error('Detection không thuộc result đã đọc.')
      const facts = await surveyService.getAiCandidateFacts(project, source)
      if (!active) return
      if (facts.runId !== run) throw new Error('Candidate không thuộc run đã chọn.')
      setCandidate(facts)
      if (facts.disposition?.decisionId) {
        const decision = await surveyService.getCandidateDecision(project, facts.disposition.decisionId)
        if (active) setDecision(decision)
      }
    }
    load().catch(e => { if (active) setError(message(e)) }).finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [epoch, project, run, source, reload])
  const reject = async () => {
    if (!candidate || busy || !reason.trim()) return
    const started = useAuthStore.getState().authEpoch
    setBusy(true); setError('')
    try {
      await surveyService.decideCandidate(project, { sourceKind: 'AI_DETECTION', sourceId: source, decision: 'REJECT', reason,
        sourceVersion: candidate.sourceVersion, geometryVersion: candidate.geometryVersion,
        supersedesDecisionId: candidate.disposition?.decisionId, previousDecisionVersion: candidate.disposition?.version })
      if (started === useAuthStore.getState().authEpoch) setReload(n => n + 1)
    } catch (e) { if (started === useAuthStore.getState().authEpoch) setError(message(e)) }
    finally { if (started === useAuthStore.getState().authEpoch) setBusy(false) }
  }
  return <main className="space-y-4">
    <h1 className="text-xl font-bold">Thẩm định AI Candidate</h1>
    <p>Candidate chưa phải Defect. Nguồn ai-mock-runs là fixture backend; không chứng nhận chuyến bay hoặc AI provider thật.</p>
    <select aria-label="Dự án AI" value={project} onChange={e => setQuery({ projectId: e.target.value })}><option value="">Chọn dự án</option>{projects.map(p => <option key={p.projectId} value={p.projectId}>{p.name}</option>)}</select>
    <select aria-label="AI run" value={run} onChange={e => setQuery({ projectId: project, runId: e.target.value })}><option value="">Chọn run từ server</option>{runs.map(r => <option key={r.id} value={r.id}>{r.id} — {r.status}</option>)}</select>
    <select aria-label="Detection" value={source} onChange={e => setQuery({ projectId: project, runId: run, sourceId: e.target.value })}><option value="">Chọn Detection từ result</option>{detections.map(d => <option key={d.detectionId} value={d.detectionId}>{d.detectionId}</option>)}</select>
    <button onClick={() => setReload(n => n + 1)} disabled={busy}>Đọc lại server</button>
    {busy && <p role="status">Đang đọc/gửi yêu cầu...</p>}
    {error && <p role="alert">{error}</p>}
    {!busy && !error && project && runs.length === 0 && <p>Không có AI run trong kết quả server.</p>}
    {candidate && <><h2>Provenance / current disposition từ server</h2><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(candidate, null, 2)}</pre>
      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(decision, null, 2)}</pre>
      <label>Lý do thẩm định<textarea value={reason} onChange={e => setReason(e.target.value)} /></label>
      <button disabled={busy || !reason.trim() || !!candidate.disposition} onClick={reject}>REJECT</button>
    </>}
    <button disabled>KEEP_NEW</button><button disabled>LINK_EXISTING</button>
    <p role="status">KEEP_NEW/LINK_EXISTING chưa tích hợp form classification/catalog và target-version được xác minh. REJECT cần đọc được Candidate/current head. API result/Candidate hiện chỉ khai Bearer; lỗi Web được giữ nguyên, không dùng SQL/localStorage hoặc Bearer thay thế.</p>
    <p>409/412/428: đối chiếu server; không tự đổi key/version. Ý định đang chờ giữ key/body theo actor; gửi lại chỉ cùng nội dung. Không tự reset Candidate đã accepted.</p>
  </main>
}
