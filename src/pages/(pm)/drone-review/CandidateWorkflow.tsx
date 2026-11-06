import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { surveyService, AiCandidateFactsDto, CandidateDecisionDto } from '../../../api/services/surveyService'
import { apiClient } from '../../../api/client'
import { useAuthStore } from '../../../store/authStore'
import { MissionModals } from './MissionModals'
import { MissionHeader } from './MissionHeader'
import { MissionViewer } from './MissionViewer'
import { MissionTriageList } from './MissionTriageList'

const message = (_e: unknown) => 'Không thể tải hoặc cập nhật hồ sơ thẩm định. Vui lòng thử lại.'

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
  const [inspectKind, setInspectKind] = useState<'refly' | 'baseline' | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [viewerTab, setViewerTab] = useState('Ảnh nguồn')
  const [panelTab, setPanelTab] = useState('Kết quả')
  useEffect(() => {
    let active = true
    setInspectKind(null); setFullscreen(false); setProjects([]); setRuns([]); setDetections([]); setCandidate(null); setDecision(null); setError(''); setReason(''); setBusy(true)
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
  const facts = candidate ? [{label:'Nguồn dữ liệu',value:candidate.datasetVersionId},{label:'Mô hình',value:candidate.modelVersionId},{label:'Thời điểm khung hình',value:candidate.timestampMs != null ? `${candidate.timestampMs} ms` : null},{label:'Trạng thái vị trí',value:candidate.positionStatus}] : []
  return <main className="space-y-5 min-w-0">
    <MissionHeader serverView basePath={useAuthStore.getState().user?.role === 'SUPERVISOR' ? '/sup' : '/pm'} modelVersionId={candidate?.modelVersionId} busy={busy} onReload={() => setReload(n => n + 1)} onInspect={setInspectKind} />
    <section className="bg-white border border-slate-200 rounded-xl p-4 grid md:grid-cols-3 gap-3">
      <label className="text-xs">Dự án<select aria-label="Dự án AI" className="block w-full border rounded-lg p-2 mt-1" value={project} onChange={e=>setQuery({projectId:e.target.value})}><option value="">Chọn dự án</option>{projects.map(p=><option key={p.projectId} value={p.projectId}>{p.name}</option>)}</select></label>
      <label className="text-xs">Lần xử lý<select aria-label="AI run" className="block w-full border rounded-lg p-2 mt-1" value={run} onChange={e=>setQuery({projectId:project,runId:e.target.value})}><option value="">Chọn lần xử lý</option>{runs.map(r=><option key={r.id} value={r.id}>{r.id} · {r.status}</option>)}</select></label>
      <label className="text-xs">Phát hiện<select aria-label="Detection" className="block w-full border rounded-lg p-2 mt-1" value={source} onChange={e=>setQuery({projectId:project,runId:run,sourceId:e.target.value})}><option value="">Chọn phát hiện</option>{detections.map(d=><option key={d.detectionId} value={d.detectionId}>{d.detectionId}</option>)}</select></label>
    </section>
    {error&&<p role="alert" className="border border-rose-200 bg-rose-50 text-rose-700 rounded-xl p-3 text-sm">{error}</p>}{busy&&<p role="status">Đang đọc hồ sơ...</p>}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <MissionViewer serverView tab={viewerTab} onTabChange={setViewerTab} timestampMs={candidate?.timestampMs} fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen(value => !value)} />
      <div className="lg:col-span-5 min-w-0 space-y-3"><div className="bg-white border rounded-xl p-3 flex gap-2">{['Kết quả','Nguồn gốc'].map(label => <button type="button" key={label} onClick={() => setPanelTab(label)} className={`rounded-lg px-3 py-2 text-xs ${panelTab === label ? 'bg-[#C9A227] text-white' : 'border'}`}>{label}</button>)}</div>{panelTab === 'Nguồn gốc' ? <section className="bg-white border rounded-xl p-4"><h2 className="text-sm font-bold mb-3">Nguồn gốc</h2><dl className="space-y-3">{facts.map(f => <div key={f.label}><dt className="text-xs text-slate-500">{f.label}</dt><dd className="text-xs break-all mt-1">{f.value || 'Chưa cập nhật'}</dd></div>)}{!candidate && <p className="text-sm text-slate-500">Chưa cập nhật</p>}</dl></section> : <MissionTriageList serverView records={detections} selectedId={source} onSelect={id => setQuery({projectId:project,runId:run,sourceId:id})} loading={busy} error={!!error} projectSelected={!!project} />}</div>
    </div>
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"><h2 className="font-bold">Kết luận thẩm định</h2><p className="text-xs text-slate-500">Quyết định hiện tại: {decision?.decision||'Chưa cập nhật'}. Nguồn minh họa không chứng nhận kết quả khảo sát thực tế.</p><label className="text-sm block">Lý do<textarea value={reason} onChange={e=>setReason(e.target.value)} className="block w-full border rounded-lg p-2 mt-2"/></label><div className="flex flex-wrap gap-2">{['KEEP_NEW','LINK_EXISTING'].map(label=><button key={label} disabled className="border rounded-lg px-4 py-2 text-xs text-slate-400">{label==='KEEP_NEW'?'Giữ lỗi mới':'Liên kết lỗi đã có'}</button>)}<button disabled={busy||!candidate||!reason.trim()||!!candidate.disposition} onClick={reject} className="bg-[#C9A227] text-white rounded-lg px-4 py-2 text-xs disabled:opacity-50">Loại bỏ phát hiện</button></div><p className="text-xs text-slate-500">Chỉ gửi quyết định khi đã đọc đúng nguồn và phiên bản. Các thao tác chưa đủ đầu vào được tạm khóa.</p></section>
    <MissionModals inspectOnly kind={inspectKind} onClose={() => setInspectKind(null)} />
  </main>
}
