import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { surveyService, AiCandidateFactsDto, CandidateDecisionDto } from '../../../api/services/surveyService'
import { apiClient } from '../../../api/client'
import { useAuthStore } from '../../../store/authStore'
import { Icon } from '../../../components/ui/Icon'

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
  const [viewerTab, setViewerTab] = useState('Ảnh nguồn')
  const [panelTab, setPanelTab] = useState('Kết quả')
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
  const facts = candidate ? [{label:'Nguồn dữ liệu',value:candidate.datasetVersionId},{label:'Mô hình',value:candidate.modelVersionId},{label:'Thời điểm khung hình',value:candidate.timestampMs != null ? `${candidate.timestampMs} ms` : null},{label:'Trạng thái vị trí',value:candidate.positionStatus}] : []
  return <main className="space-y-5 min-w-0">
    <header className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap justify-between gap-4"><div><p className="text-xs text-slate-500">Khảo sát & Thẩm định</p><h1 className="text-xl font-bold mt-1">Thẩm định kết quả AI</h1><p className="text-xs text-slate-500 mt-1">Kết quả phát hiện cần được PM thẩm định trước khi ghi nhận khiếm khuyết.</p></div><button onClick={()=>setReload(n=>n+1)} disabled={busy} className="border rounded-lg px-4 py-2 text-xs">Tải lại hồ sơ</button></header>
    <section className="bg-white border border-slate-200 rounded-xl p-4 grid md:grid-cols-3 gap-3">
      <label className="text-xs">Dự án<select aria-label="Dự án AI" className="block w-full border rounded-lg p-2 mt-1" value={project} onChange={e=>setQuery({projectId:e.target.value})}><option value="">Chọn dự án</option>{projects.map(p=><option key={p.projectId} value={p.projectId}>{p.name}</option>)}</select></label>
      <label className="text-xs">Lần xử lý<select aria-label="AI run" className="block w-full border rounded-lg p-2 mt-1" value={run} onChange={e=>setQuery({projectId:project,runId:e.target.value})}><option value="">Chọn lần xử lý</option>{runs.map(r=><option key={r.id} value={r.id}>{r.id} · {r.status}</option>)}</select></label>
      <label className="text-xs">Phát hiện<select aria-label="Detection" className="block w-full border rounded-lg p-2 mt-1" value={source} onChange={e=>setQuery({projectId:project,runId:run,sourceId:e.target.value})}><option value="">Chọn phát hiện</option>{detections.map(d=><option key={d.detectionId} value={d.detectionId}>{d.detectionId}</option>)}</select></label>
    </section>
    {error&&<p role="alert" className="border border-rose-200 bg-rose-50 text-rose-700 rounded-xl p-3 text-sm">{error}</p>}{busy&&<p role="status">Đang đọc hồ sơ...</p>}
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <section className="xl:col-span-8 min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden"><div className="p-4 flex flex-wrap justify-between gap-2 border-b"><h2 className="font-bold">Không gian thẩm định</h2><div className="flex gap-2">{['Ảnh nguồn','Bản đồ','So sánh đa kỳ'].map(label=><button key={label} onClick={()=>setViewerTab(label)} className={`rounded-lg px-3 py-1 text-xs ${viewerTab===label?'bg-[#C9A227] text-white':'border text-slate-600'}`}>{label}</button>)}</div></div>
        <div className="min-h-80 bg-slate-900 flex flex-col items-center justify-center text-slate-300 gap-3 p-6"><Icon name={viewerTab==='Bản đồ'?'map':'image'} size={36}/><p className="text-sm">Chưa cập nhật</p><p className="text-xs text-slate-400 text-center">Chỉ hiển thị bằng chứng và vị trí được phép đọc từ hồ sơ.</p></div>
        <div className="p-4 border-t bg-slate-50 space-y-3"><div className="h-2 bg-slate-200 rounded-full"/><div className="flex flex-wrap justify-between text-xs text-slate-500"><span>Khung hình: {candidate?.timestampMs != null?`${candidate.timestampMs} ms`:'Chưa cập nhật'}</span><span>Dữ liệu video: Chưa cập nhật</span></div><div className="flex gap-2"><button disabled className="border rounded-lg p-2"><Icon name="play_arrow" size={18}/></button><button disabled className="border rounded-lg p-2"><Icon name="fullscreen" size={18}/></button></div></div>
      </section>
      <section className="xl:col-span-4 min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden"><div className="p-4 flex gap-2 border-b">{['Kết quả','Nguồn gốc'].map(label=><button key={label} onClick={()=>setPanelTab(label)} className={`rounded-lg px-3 py-2 text-xs ${panelTab===label?'bg-[#C9A227] text-white':'border'}`}>{label}</button>)}</div>
        <div className="p-4 space-y-4">{panelTab==='Nguồn gốc'?<dl className="space-y-3">{facts.map(f=><div key={f.label}><dt className="text-xs text-slate-500">{f.label}</dt><dd className="text-xs break-all mt-1">{f.value||'Chưa cập nhật'}</dd></div>)}{!candidate&&<p className="text-sm text-slate-500">Chưa cập nhật</p>}</dl>:<><h2 className="font-bold text-sm">Danh sách phát hiện</h2>{detections.map(d=><button key={d.detectionId} onClick={()=>setQuery({projectId:project,runId:run,sourceId:d.detectionId})} className="block w-full text-left border rounded-xl p-3 text-xs break-all">{d.typeCode} · {d.detectionId}</button>)}{!busy&&!error&&!detections.length&&<p className="text-sm text-slate-500">{project?'Chưa có kết quả trong hồ sơ đã tải.':'Chọn dự án để xem kết quả.'}</p>}</>}</div>
      </section>
    </div>
    <section className="grid md:grid-cols-3 gap-4">{['Độ phủ khảo sát','Chất lượng hình ảnh','Bằng chứng đa kỳ'].map(label=><div key={label} className="bg-white border rounded-xl p-4"><h2 className="font-semibold text-sm">{label}</h2><p className="text-sm text-slate-500 mt-3">Chưa cập nhật</p></div>)}</section>
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"><h2 className="font-bold">Kết luận thẩm định</h2><p className="text-xs text-slate-500">Quyết định hiện tại: {decision?.decision||'Chưa cập nhật'}. Nguồn minh họa không chứng nhận kết quả khảo sát thực tế.</p><label className="text-sm block">Lý do<textarea value={reason} onChange={e=>setReason(e.target.value)} className="block w-full border rounded-lg p-2 mt-2"/></label><div className="flex flex-wrap gap-2">{['KEEP_NEW','LINK_EXISTING'].map(label=><button key={label} disabled className="border rounded-lg px-4 py-2 text-xs text-slate-400">{label==='KEEP_NEW'?'Giữ lỗi mới':'Liên kết lỗi đã có'}</button>)}<button disabled={busy||!candidate||!reason.trim()||!!candidate.disposition} onClick={reject} className="bg-[#C9A227] text-white rounded-lg px-4 py-2 text-xs disabled:opacity-50">Loại bỏ phát hiện</button></div><p className="text-xs text-slate-500">Chỉ gửi quyết định khi đã đọc đúng nguồn và phiên bản. Các thao tác chưa đủ đầu vào được tạm khóa.</p></section>
  </main>
}
