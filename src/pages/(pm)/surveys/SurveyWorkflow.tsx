import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiClient } from '../../../api/client'
import { useAuthStore } from '../../../store/authStore'
import { surveyService } from '../../../api/services/surveyService'
import { Icon } from '../../../components/ui/Icon'
import { SurveyCard } from './SurveyCard'
import { SurveyKpiCards } from './SurveyKpiCards'
import { SurveyHeader } from './SurveyHeader'
import { CreateSurveyForm } from '../create-survey/CreateSurveyForm'
import { CreateSurveyHeader } from '../create-survey/CreateSurveyHeader'
import { FlightCorridorMap } from '../create-survey/FlightCorridorMap'
import { DroneSimulatorModal } from './DroneSimulatorModal'

function errorText(_error: any): string { return 'Không thể tải dữ liệu. Vui lòng thử lại.' }

/** PM planning and provenance reads; Operator capture remains an assigned Mobile operation. */
export const SurveyWorkflow: React.FC<{ mode?: 'list' | 'create' }> = ({ mode = 'list' }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useSearchParams()
  const projectId = query.get('projectId') || ''
  const [showProgress, setShowProgress] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('survey-plans')
  const isPM = useAuthStore(state => state.user?.role === 'PROJECT_MANAGER')
  const epoch = useAuthStore(state => state.authEpoch)
  const [projects, setProjects] = useState<Array<{ projectId: string; name: string }>>([])
  const [projectError, setProjectError] = useState('')
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(false)
  const [facts, setFacts] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [datasetId, setDatasetId] = useState('')
  const [dataset, setDataset] = useState<unknown>(null)
  const [datasetError, setDatasetError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setProjects([]); setProjectError('')
    surveyService.readSurveyPage('/projects', controller.signal).then(items => {
      if (!controller.signal.aborted) setProjects(items)
    }).catch(error => { if (!controller.signal.aborted) setProjectError(errorText(error)) })
    return () => controller.abort()
  }, [epoch, reload])
  useEffect(() => {
    const controller = new AbortController()
    setFacts({}); setErrors([]); setDataset(null); setDatasetId(''); setDatasetError(''); setLoading(false)
    if (!projectId || !projects.some(p => p.projectId === projectId)) return () => controller.abort()
    setLoading(true)
    const reads = ['survey-plans', 'survey-tasks', 'members', 'work-package']
    Promise.allSettled(reads.map(async resource => resource === 'work-package'
      ? (await apiClient.get(`/projects/${projectId}/${resource}`, { signal: controller.signal })).data
      : surveyService.readSurveyPage(`/projects/${projectId}/${resource}`, controller.signal)))
      .then(results => {
        if (controller.signal.aborted) return
        const next: Record<string, unknown> = {}, failures: string[] = []
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') next[reads[index]] = result.value
          else failures.push(`${reads[index]}: ${errorText(result.reason)}`)
        })
        setFacts(next); setErrors(failures); setLoading(false)
      })
    return () => controller.abort()
  }, [epoch, projectId, projects, reload])
  useEffect(() => {
    const controller = new AbortController()
    setDataset(null); setDatasetError('')
    const reference = query.get('datasetId')
    if (!reference || !projectId || !projects.some(p => p.projectId === projectId)) return () => controller.abort()
    apiClient.get(`/datasets/${encodeURIComponent(reference)}`, { signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setDataset(response.data)
    }).catch(error => { if (!controller.signal.aborted) setDatasetError(errorText(error)) })
    return () => controller.abort()
  }, [epoch, projectId, projects, query, reload])
  const base = isPM ? '/pm' : '/sup'
  const plans = Array.isArray(facts['survey-plans']) ? facts['survey-plans'] as any[] : []
  const tasks = Array.isArray(facts['survey-tasks']) ? facts['survey-tasks'] as any[] : []
  const members = Array.isArray(facts.members) ? facts.members as any[] : []
  const rows = (tab === 'survey-plans' ? plans : tasks).filter(row => !search || String(row.id).toLowerCase().includes(search.toLowerCase()))
  const button = 'rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white px-4 py-2 text-xs font-semibold disabled:opacity-50'
  return <main className="w-full max-w-6xl mx-auto space-y-6 min-w-0">
    {mode === 'create' ? <CreateSurveyHeader onBack={() => navigate(`${base}/surveys${projectId ? `?projectId=${projectId}` : ''}`)} /> : <SurveyHeader basePath={base} isSupervisor={!isPM} onNavigate={navigate} />}
    {mode === 'list' && <SurveyKpiCards serverMode serverPlanCount={Array.isArray(facts['survey-plans']) ? plans.length : undefined} />}
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3 items-center">
      <label className="text-xs flex-1 min-w-[160px]">Dự án<select aria-label="Dự án khảo sát" className="block w-full border rounded-lg p-2 mt-1" value={projectId} onChange={event => setQuery({ projectId: event.target.value })}><option value="">Chọn dự án được cấp quyền</option>{projects.map(p => <option key={p.projectId} value={p.projectId}>{p.name}</option>)}</select></label>
      <button className="border border-slate-200 rounded-lg px-3 py-2 text-xs" onClick={() => setReload(n=>n+1)}>Tải lại từ máy chủ</button>
    </div>
    {projectError && <p role="alert" className="p-3 bg-rose-50 text-rose-700 rounded-xl">{projectError}</p>}
    {errors.map((error,index)=><p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3" key={index}>{error.includes('work-package')?'Chưa đọc được phạm vi tuyến cho kế hoạch khảo sát.':errorText(error)}</p>)}
    {projectId && projects.length > 0 && !projects.some(p=>p.projectId===projectId) && <p role="alert">Bạn không có quyền truy cập dự án này.</p>}
    {loading && <p role="status">Đang tải hồ sơ khảo sát...</p>}
    {mode === 'create' ? <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 min-w-0"><CreateSurveyForm readOnly selectedProjectName={projects.find(project => project.projectId === projectId)?.name} onCancel={() => navigate(`${base}/surveys${projectId ? `?projectId=${projectId}` : ''}`)} /></div>
      <div className="lg:col-span-5 min-w-0"><FlightCorridorMap fullRouteCoords={[]} surveySegmentCoords={[]} /></div>
    </div> : <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4 flex flex-wrap justify-between gap-3 border-b border-slate-100"><div className="flex gap-2">{[['survey-plans','Kế hoạch'],['survey-tasks','Nhiệm vụ']].map(([value,label])=><button key={value} onClick={()=>setTab(value)} className={`rounded-lg px-3 py-2 text-xs ${tab===value?'bg-[#C9A227] text-white':'bg-slate-100 text-slate-600'}`}>{label}</button>)}</div><input aria-label="Tìm hồ sơ khảo sát" className="border rounded-lg px-3 py-2 text-xs" placeholder="Tìm mã hồ sơ..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="px-4 py-3 flex flex-wrap justify-between gap-3"><p className="text-xs text-slate-500">Kết quả trong dự án đã chọn</p><div className="flex rounded-lg border border-slate-200 overflow-hidden">{(['grid','table'] as const).map(view => <button key={view} aria-label={view === 'grid' ? 'Dạng thẻ khảo sát' : 'Dạng bảng khảo sát'} onClick={() => setViewMode(view)} className={`px-3 py-1 text-xs ${viewMode === view ? 'bg-[#C9A227] text-white' : 'text-slate-500'}`}><Icon name={view === 'grid' ? 'grid_view' : 'table_rows'} size={16} /></button>)}</div></div>
      {viewMode === 'grid' ? <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{rows.map(row => <SurveyCard key={row.id} serverRecord={row} projectName={projects.find(project => project.projectId === row.projectId)?.name} operatorName={members.find(member => member.userId === row.operatorId)?.displayName} onViewProgress={() => setShowProgress(true)} />)}</div> : <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50"><tr>{['Mã hồ sơ','Dự án','Thời gian','Người nhận','Trạng thái','Thao tác'].map(label=><th className="p-3 text-left" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t"><td className="p-3">{row.id}</td><td className="p-3">{projects.find(p=>p.projectId===row.projectId)?.name||'Chưa cập nhật'}</td><td className="p-3">{row.plannedAt?new Date(row.plannedAt).toLocaleDateString('vi-VN'):'Chưa cập nhật'}</td><td className="p-3">{members.find(m=>m.userId===row.operatorId)?.displayName||'Chưa cập nhật'}</td><td className="p-3">{row.status||'Chưa cập nhật'}</td><td className="p-3"><button className="text-[#8C6D1F]" onClick={()=>setShowProgress(true)}>Xem tiến độ</button></td></tr>)}</tbody></table></div>}
      {!loading && Array.isArray(facts[tab]) && rows.length===0 && <p className="p-8 text-center text-sm text-slate-500">{search ? 'Không có hồ sơ phù hợp bộ lọc.' : 'Chưa có hồ sơ trong kết quả đã tải.'}</p>}
      {!projectId && <p className="p-8 text-center text-sm text-slate-500">Chọn dự án để xem hồ sơ.</p>}
    </section>}
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"><h2 className="font-bold">Dữ liệu khảo sát & Nguồn gốc</h2><div className="flex flex-wrap gap-2"><input aria-label="Dataset ID từ biên nhận" className="border rounded-lg p-2 text-sm" value={datasetId} onChange={e=>setDatasetId(e.target.value)} placeholder="Mã dữ liệu từ biên nhận"/><button className={button} disabled={!projectId||!/^[0-9a-f-]{36}$/i.test(datasetId)} onClick={()=>setQuery({projectId,datasetId})}>Đọc dữ liệu</button></div>{datasetError&&<p role="alert">{errorText(datasetError)}</p>}<dl className="grid sm:grid-cols-2 gap-3 text-sm">{['integrityStatus','telemetryStatus'].map(key=><div key={key}><dt className="text-xs text-slate-500">{key==='integrityStatus'?'Tính toàn vẹn':'Dữ liệu hành trình'}</dt><dd>{dataset&&typeof dataset==='object'?(dataset as Record<string,string>)[key]||'Chưa cập nhật':'Chưa cập nhật'}</dd></div>)}</dl></section>
    <DroneSimulatorModal isOpen={showProgress} onClose={()=>setShowProgress(false)}/>
  </main>
}
