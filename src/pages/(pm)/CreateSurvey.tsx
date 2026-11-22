import { surveyCreateCommands, type SurveyCreateInput } from '../../api/services/surveyCreateCommands'
import { utm48NToWgs84 } from '../../api/services/alignmentService'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { surveyPlanningService, scopeForStations, surveyStatusLabel, type SurveyProject, type SurveyScope } from '../../api/services/surveyPlanningService'
import { useAuthStore } from '../../store/authStore'
import { CreateSurveyHeader } from './create-survey/CreateSurveyHeader'
import { CreateSurveyForm } from './create-survey/CreateSurveyForm'
import { FlightCorridorMap } from './create-survey/FlightCorridorMap'
import { ProjectRouteConfig, AvailablePilot } from './create-survey/types'
import { Icon } from '../../components/ui/Icon'
import { useToastStore } from '../../store/toastStore'

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const queryProject = searchParams.get('project') || searchParams.get('projectId')
  const queryStartKm = searchParams.get('startKm')
  const queryEndKm = searchParams.get('endKm')

  // State nạp trực tiếp 100% từ CSDL Backend Candidate3 Docker
  const [projectCatalogue, setProjectCatalogue] = useState<SurveyProject[]>([])
  const [routes, setRoutes] = useState<ProjectRouteConfig[]>([])
  const [pilots, setPilots] = useState<AvailablePilot[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // State dự án và lý trình
  const [projectId, setProjectId] = useState<string>('')
  const [startKm, setStartKm] = useState<string>('')
  const [endKm, setEndKm] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [dueAt,setDueAt]=useState('')
  const [commandBusy,setCommandBusy]=useState(false),[commandReload,setCommandReload]=useState(0)
  const [skippedRoutes,setSkippedRoutes]=useState<string[]>([])
  const [conflict,setConflict]=useState<{plans:{id:string;status:string;plannedAt?:string}[];correlationId?:string}|null>(null)
  const [verified,setVerified]=useState<{scope:string;result:Awaited<ReturnType<typeof surveyCreateCommands.run>>}|null>(null)
  const [showResult,setShowResult]=useState(false),[toastMessage,setToastMessage]=useState('')
  const notified=useRef(new Set<string>())
  useEffect(()=>{if(!toastMessage)return;const timer=setTimeout(()=>setToastMessage(''),3800);return()=>clearTimeout(timer)},[toastMessage])
  let pendingCommand:ReturnType<typeof surveyCreateCommands.pending>=null,pendingError=''
  try{if(queryProject)pendingCommand=surveyCreateCommands.pending(queryProject)}catch(e){pendingError=(e as Error).message}
  const [surveyType, setSurveyType] = useState<'PERIODIC' | 'AD_HOC' | 'BASELINE' | ''>('')

  // Phi công chỉ định
  const [pilotId, setPilotId] = useState<string>('')

  // Độ cao bay thiết kế
  const [altitudeMode, setAltitudeMode] = useState<'preset' | 'custom'>('preset')
  const [presetAltitude, setPresetAltitude] = useState<string>('')
  const [customAltitude, setCustomAltitude] = useState<string>('')

  // Độ phủ chồng ảnh
  const [overlapMode, setOverlapMode] = useState<'preset' | 'custom'>('preset')
  const [overlap, setOverlap] = useState<string>('')
  const [customOverlapForward, setCustomOverlapForward] = useState<string>('')
  const [customOverlapSide, setCustomOverlapSide] = useState<string>('')
  const [showOverlapHelp, setShowOverlapHelp] = useState<boolean>(false)

  // Ghi chú kỹ thuật
  const [notes, setNotes] = useState('')
  const {authEpoch} = useAuthStore()
  const [readError, setReadError] = useState(''), [operatorError, setOperatorError] = useState(''), [reload, setReload] = useState(0)
  const [targetBand, setTargetBand] = useState('')
  const [operatorReload,setOperatorReload]=useState(0),[operatorLoading,setOperatorLoading]=useState(false)
  useEffect(() => {
    let active = true
    setIsLoading(true); setReadError(''); setRoutes([]); setProjectCatalogue([]); setProjectId(''); setStartKm(queryStartKm || ''); setEndKm(queryEndKm || '')
    setTargetBand('');setPilotId('');setPilots([]);setDate('');setDueAt('');setSurveyType('');setCommandBusy(false);setSubmitError(null);setConflict(null);setVerified(null);setShowResult(false);setToastMessage('')
    ;(async()=>{
      const projects = await surveyPlanningService.projects()
      if (!active) return
      setProjectCatalogue(projects)
      const candidates = queryProject ? projects.filter(p=>p.projectId===queryProject||p.projectCode===queryProject) : []
      const result: ProjectRouteConfig[] = []
      const skipped:string[]=[]
      for (const project of candidates) result.push(...await surveyPlanningService.routes(project,m=>skipped.push(m)))
      if(active)setSkippedRoutes(skipped)
      if (!active) return
      setRoutes(result)
      const matching = result.filter(r => r.parentProjectId === queryProject || r.parentProjectCode === queryProject)
      // Do not silently substitute another project if the URL has an unmatched project.
      const saved = candidates.length === 1 ? surveyCreateCommands.pending(candidates[0].projectId) : null
      const savedRoute = saved ? matching.find(r=>r.routeVersionId===saved.input.scope[0].routeVersionId && r.serverSet?.id===saved.input.scope[0].segmentSetId) : null
      const selected = saved ? savedRoute : queryProject ? matching.length === 1 ? matching[0] : null : result.length === 1 ? result[0] : null
      if (selected) setProjectId(selected.id)
      if (queryProject && !matching.length) setReadError('Dự án đã chọn chưa có route đã xác nhận trong phạm vi server; không lấy tuyến dự án khác.')
    })().catch(e=>{if(active)setReadError(`Không đọc được phạm vi khảo sát: ${e?.response?.status || ''} ${e?.response?.data?.code || e.message}`)}).finally(()=>{if(active)setIsLoading(false)})
    return()=>{active=false}
  },[authEpoch,queryProject,queryStartKm,queryEndKm,reload])
  const currentProject = useMemo(()=>routes.find(r=>r.id===projectId && (!queryProject || r.parentProjectId===queryProject || r.parentProjectCode===queryProject)),[routes,projectId,queryProject])
  useEffect(()=>{
    let active=true
    setPilots([]);setPilotId('');setOperatorError('');setOperatorLoading(false)
    if (!currentProject || queryProject && currentProject.parentProjectId !== queryProject && currentProject.parentProjectCode !== queryProject) return
    setOperatorLoading(true)
    surveyPlanningService.operators(currentProject.parentProjectId).then(rows=>{if(active){setPilots(rows);if(!rows.length)setOperatorError('Dự án chưa có Operator hiệu lực.')}}).catch(e=>{if(active)setOperatorError(`Không đọc được Operator: ${e?.response?.status || ''} ${e?.response?.data?.code || e.message}`)}).finally(()=>{if(active)setOperatorLoading(false)})
    return()=>{active=false}
  },[currentProject?.parentProjectId,authEpoch,queryProject,reload,operatorReload])
  const handleProjectChange=(id:string)=>{setProjectId(id);setStartKm('');setEndKm('');setTargetBand('');setPilotId('')}
  let scopeError='', scopeSummary=''
  try { if(currentProject){const value=scopeForStations(currentProject,startKm,endKm,targetBand);scopeSummary=`Scope đã chọn: route ${value.routeVersionId}; set ${value.segmentSetId}; ${value.targetBand}; ${value.segmentIds.length} segment: ${value.segmentIds.join(', ')}`} }
  catch(e){scopeError=(e as Error).message}
  const gsdCmPx = 'Chưa được contract hỗ trợ'

  const sKm = startKm.trim() ? Number(startKm) : Number.NaN
  const eKm = endKm.trim() ? Number(endKm) : Number.NaN
  const flightDistanceKm = Number.isFinite(sKm) && Number.isFinite(eKm) && eKm > sKm ? eKm - sKm : 0

  const fullRouteCoords = currentProject?.defaultCoords || []
  const surveySegmentCoords = useMemo(() => {
    if (!currentProject?.serverSet) return []
    try {
      const scope = scopeForStations(currentProject,startKm,endKm,targetBand)
      const selected = currentProject.serverSet.segments.filter(s=>scope.segmentIds.includes(s.id!))
      const coordinates = selected.map(s => s.wgs84Geometry?.coordinates || (currentProject.engineeringSrid === 32648 ? s.metricGeometry.coordinates.map(([x,y]) => utm48NToWgs84(x,y)) : []))
      if (coordinates.some(c => c.length < 2 || c.some(p => p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90))) return []
      return coordinates.flat()
    }catch{return []}
  },[currentProject,startKm,endKm,targetBand])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const toast = useToastStore()

  const hasBaseline = false, hasActivePeriodic = false, hasActiveAdHoc = false
  const conflictReason = operatorError || (!surveyType?'Chọn loại khảo sát.':'') || (!date?'Nhập lịch bay.':'') || (!pilotId?'Chọn Operator hiệu lực.':'') || pendingError
  const submitSelection=useRef('');submitSelection.current=`${authEpoch}:${queryProject}:${projectId}`
  const resultScope=`${authEpoch}:${queryProject}`
  const verifiedResult=verified?.scope===resultScope && verified.result.plan.projectId===currentProject?.parentProjectId ? verified.result : null
  useEffect(()=>{
    let active=true
    if(!currentProject||!pendingCommand||pendingCommand.phase!=='DONE'||verifiedResult)return
    surveyCreateCommands.run(pendingCommand.projectId).then(result=>{if(active)setVerified({scope:resultScope,result})}).catch(e=>{if(active)setSubmitError(`Không đọc lại được kế hoạch và nhiệm vụ: ${e.message}`)})
    return()=>{active=false}
  },[resultScope,currentProject?.id,pendingCommand?.phase,commandReload,!!verifiedResult])
  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();if(commandBusy||!currentProject)return
    const selected=submitSelection.current;setCommandBusy(true);setSubmitError(null);setConflict(null)
    let sentScope:SurveyScope[]|undefined
    try{
      const old=surveyCreateCommands.pending(currentProject.parentProjectId)
      const alreadyVerified=old?.phase==='DONE'
      if(!old&&(conflictReason||scopeError))throw new Error(conflictReason||scopeError)
      const input:SurveyCreateInput|undefined=old?undefined:{scope:[scopeForStations(currentProject,startKm,endKm,targetBand)],plannedAt:new Date(date).toISOString(),surveyType:surveyType as SurveyCreateInput['surveyType'],operatorId:pilotId,...(dueAt?{dueAt:new Date(dueAt).toISOString()}:{})}
      sentScope=input?.scope??old?.input.scope
      const result=await surveyCreateCommands.run(currentProject.parentProjectId,input)
      if(selected!==submitSelection.current)return
      setVerified({scope:resultScope,result})
      const notificationKey=`${authEpoch}:${result.plan.id}:${result.task.id}`
      if(!alreadyVerified&&!notified.current.has(notificationKey)){notified.current.add(notificationKey);setToastMessage('Đã tạo kế hoạch và giao nhiệm vụ khảo sát')}
    }catch(e:any){if(selected===submitSelection.current){
      const status=e?.response?.status,correlation=e?.response?.data?.correlationId as string|undefined
      let message=`${e.planId?`Đã có kế hoạch ${e.planId}; `:''}Bước ${e.surveyPhase||'kiểm tra'}: HTTP ${status||''} ${e?.response?.data?.code||e.message}${correlation?` · ${correlation}`:''}`
      // BE dùng chung mã duplicate_request cho nhiều loại xung đột: chỉ kết luận "trùng kế hoạch" khi GET survey-plans thấy kế hoạch đang hoạt động cùng tuyến/dải.
      if(status===409&&e.surveyPhase==='PLAN'&&sentScope){
        let plans:Awaited<ReturnType<typeof surveyCreateCommands.activePlansForScope>>=[],readFailed=''
        try{plans=await surveyCreateCommands.activePlansForScope(currentProject.parentProjectId,sentScope)}catch(re:any){readFailed=re?.message||'lỗi đọc'}
        if(plans.length){message=`BE từ chối tạo kế hoạch mới (HTTP 409 ${e?.response?.data?.code||'conflict'}): dự án đã có ${plans.length} kế hoạch đang hoạt động trên cùng tuyến và dải khảo sát. Hãy mở kế hoạch hiện có hoặc đổi tuyến/dải khảo sát. BE không trả loại khảo sát khi đọc nên FE không so được loại khảo sát.${correlation?` Mã tham chiếu: ${correlation}.`:''}`}
        else message=`BE từ chối tạo kế hoạch (HTTP 409 ${e?.response?.data?.code||'conflict'}) nhưng không thấy kế hoạch đang hoạt động trùng tuyến/dải khảo sát${readFailed?` (không đọc được danh sách kế hoạch: ${readFailed})`:''}. BE dùng mã này cho nhiều loại xung đột nên chưa xác định được nguyên nhân cụ thể.${correlation?` Mã tham chiếu: ${correlation}.`:''}${e.journalReleased?' Chưa có kế hoạch nào được tạo; bạn có thể sửa và gửi lại.':''}`
        setConflict({plans,correlationId:correlation})
      }else if(e.journalReleased)message+='. BE từ chối nên chưa có gì được tạo; bạn có thể sửa và gửi lại.'
      setSubmitError(message);toast.error(message)}}
    finally{if(selected===submitSelection.current){setCommandBusy(false);setCommandReload(n=>n+1)}}
  }
  // Hủy bỏ: giải phóng yêu cầu dở dang khi an toàn (BE đã từ chối dứt khoát hoặc GET không thấy kế hoạch); không thì giữ lại và nói rõ.
  const handleCancel=async()=>{
    if(!currentProject||commandBusy){navigate('/pm/surveys');return}
    setCommandBusy(true)
    try{
      const result=await surveyCreateCommands.discard(currentProject.parentProjectId)
      if(result.released){navigate('/pm/surveys');return}
      setConflict(null)
      setSubmitError(result.reason==='plan-exists'?`Đã có kế hoạch ${result.plan?.id} khớp yêu cầu này. Bấm "Đối chiếu và thử lại đúng yêu cầu" để xác nhận, không bỏ để tránh tạo trùng.`:result.reason==='partial'?`Kế hoạch ${result.planId} đã được tạo nhưng chưa giao nhiệm vụ. Bấm "Tiếp tục giao nhiệm vụ" để hoàn tất, không bỏ để tránh tạo trùng.`:result.reason==='running'?'Đang xử lý yêu cầu; chờ kết quả rồi hủy bỏ.':'Kết quả yêu cầu chưa rõ; giữ nguyên để đối chiếu, chưa bỏ.')
    }catch(e:any){setSubmitError(`Không đối chiếu được yêu cầu cũ để hủy bỏ: ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`)}
    finally{setCommandBusy(false);setCommandReload(n=>n+1)}
  }
  // Mở trang: journal cũ chưa có biên nhận (vd sau 409 trước khi sửa lỗi) bị khóa form → đối chiếu với BE và giải phóng nếu chắc chắn chưa tạo.
  useEffect(()=>{
    if(!queryProject)return
    let stale:ReturnType<typeof surveyCreateCommands.pending>=null
    try{stale=surveyCreateCommands.pending(queryProject)}catch{return}
    if(!stale||stale.phase!=='PLAN'||stale.planReceived||stale.planId)return
    let active=true
    surveyCreateCommands.discard(queryProject).then(r=>{if(active&&r.released)setCommandReload(n=>n+1)}).catch(()=>{})
    return()=>{active=false}
  },[queryProject,authEpoch])
  useEffect(()=>{if(!currentProject)return;try{const c=surveyCreateCommands.pending(currentProject.parentProjectId);if(c){setDueAt(c.input.dueAt?new Date(new Date(c.input.dueAt).getTime()-new Date(c.input.dueAt).getTimezoneOffset()*60000).toISOString().slice(0,16):'');setDate(new Date(new Date(c.input.plannedAt).getTime()-new Date(c.input.plannedAt).getTimezoneOffset()*60000).toISOString().slice(0,16));setSurveyType(c.input.surveyType);setPilotId(c.input.operatorId);setTargetBand(c.input.scope[0].targetBand);const ss=currentProject.serverSet?.segments.filter(s=>c.input.scope[0].segmentIds.includes(s.id!));if(ss?.length){setStartKm(String(ss[0].startStationMeters/1000));setEndKm(String(ss.at(-1)!.endStationMeters/1000))}}}catch(e){setSubmitError((e as Error).message)}},[currentProject?.id,authEpoch,commandReload])
  if (isLoading && !currentProject) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E5E9] rounded-xl shadow-2xs min-h-[360px]">
        <Icon name="sync" size={32} className="text-[#C9A227] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải danh mục dự án từ CSDL máy chủ...</p>
      </div>
    )
  }

  const projectSelect=<label className="text-xs text-slate-600 block">Dự án server<select aria-label="Dự án khảo sát server" value={projectCatalogue.find(p=>p.projectId===queryProject||p.projectCode===queryProject)?.projectId||''} onChange={e=>navigate(`/pm/surveys/create${e.target.value?`?projectId=${encodeURIComponent(e.target.value)}`:''}`)} className="rg-field ml-2 max-w-full"><option value="">Chọn dự án được phép đọc</option>{projectCatalogue.map(p=><option key={p.projectId} value={p.projectId}>{p.projectCode} · {p.name}</option>)}</select></label>
  if (readError) return <div>{projectSelect}<div role="alert" className="bg-white border rounded-xl p-6 text-sm">{readError}<button type="button" onClick={()=>setReload(n=>n+1)} className="ml-3 underline">Thử lại</button></div></div>

  if (!currentProject) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E5E9] rounded-xl shadow-2xs min-h-[360px] text-center">
        <Icon name="wrong_location" size={48} className="text-amber-500" />
        <p className="text-base font-bold text-[#1A1D20]">Chọn tuyến đã xác nhận từ máy chủ</p>
        <p className="text-xs text-slate-500 max-w-md">
          Theo quy chuẩn kỹ thuật bay trắc địa mặt đường UAV, dự án cần được Chỉ huy trưởng (PM) lập tim tuyến và được Giám sát (Supervisor) phê duyệt trước khi ban hành lệnh bay.
        </p>
        {projectSelect}
        <select aria-label="Chọn tuyến server" value={projectId} onChange={e=>handleProjectChange(e.target.value)} className="rg-field max-w-full"><option value="">{routes.length ? 'Chọn tuyến' : queryProject ? 'Chưa có route đã xác nhận trong dự án' : 'Chọn dự án trước'}</option>{routes.map(r=><option key={r.id} value={r.id}>{r.parentProjectCode} · {r.code} · {r.name}</option>)}</select>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => navigate('/pm/projects')}
            className="px-4 py-2 bg-[#C9A227] text-white text-xs font-semibold rounded-lg hover:bg-[#b08d20] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="route" size={15} />
            <span>Đến thiết lập tim tuyến dự án</span>
          </button>
          <button
            onClick={() => navigate('/pm/surveys')}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Quay lại danh sách khảo sát
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto overflow-x-hidden space-y-6">
      {/* 1. Header */}
      <CreateSurveyHeader onBack={() => navigate('/pm/surveys')} />
      {projectSelect}
      {skippedRoutes.length>0&&<p role="status" className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{skippedRoutes.join(' ')}</p>}
      {toastMessage && createPortal(<div role="status" className="fixed bottom-6 right-6 z-[9999] max-w-[calc(100vw-3rem)] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2"><Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" /><span className="text-xs font-medium break-words min-w-0">{toastMessage}</span><button type="button" onClick={()=>setToastMessage('')} className="text-slate-400 hover:text-white cursor-pointer ml-2" aria-label="Đóng thông báo"><Icon name="close" size={16} /></button></div>,document.body)}
      {pendingCommand?.phase==='DONE'&&<button type="button" onClick={()=>{surveyCreateCommands.newRequest(pendingCommand!.projectId);setCommandReload(n=>n+1);setVerified(null);setShowResult(false);setDate('');setDueAt('');setSurveyType('');setPilotId('');setTargetBand('');setStartKm('');setEndKm('')}} className="text-xs underline">Tạo yêu cầu mới</button>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Form Cột Trái (7 cols) */}
        <div className="lg:col-span-7">
          <CreateSurveyForm
            projects={routes}
            projectId={projectId}
            onProjectChange={handleProjectChange}
            currentProject={currentProject}
            startKm={startKm}
            setStartKm={setStartKm}
            endKm={endKm}
            setEndKm={setEndKm}
            altitudeMode={altitudeMode}
            setAltitudeMode={setAltitudeMode}
            presetAltitude={presetAltitude}
            setPresetAltitude={setPresetAltitude}
            customAltitude={customAltitude}
            setCustomAltitude={setCustomAltitude}
            gsdCmPx={gsdCmPx}
            overlap={overlap}
            setOverlap={setOverlap}
            overlapMode={overlapMode}
            setOverlapMode={setOverlapMode}
            customOverlapForward={customOverlapForward}
            setCustomOverlapForward={setCustomOverlapForward}
            customOverlapSide={customOverlapSide}
            setCustomOverlapSide={setCustomOverlapSide}
            showOverlapHelp={showOverlapHelp}
            setShowOverlapHelp={setShowOverlapHelp}
            date={date}
            setDate={setDate}
            surveyType={surveyType}
            setSurveyType={setSurveyType}
            pilots={pilots}
            pilotId={pilotId}
            setPilotId={setPilotId}
            notes={notes}
            setNotes={setNotes}
            hasBaseline={hasBaseline}
            hasActivePeriodic={hasActivePeriodic}
            hasActiveAdHoc={hasActiveAdHoc}
            scopeSummary={scopeSummary}
            targetBand={targetBand}
            onTargetBandChange={setTargetBand}
            commandBlockedReason={pendingError}
            commandBusy={commandBusy}
            recoveryLabel={pendingCommand ? verifiedResult?'Xem kế hoạch và nhiệm vụ':pendingCommand.phase==='READBACK'||pendingCommand.phase==='DONE'?'Đọc lại kế hoạch và nhiệm vụ':pendingCommand.planId?'Tiếp tục giao nhiệm vụ':'Đối chiếu và thử lại đúng yêu cầu':undefined}
            resultVerified={!!verifiedResult}
            onViewResult={()=>setShowResult(true)}
            dueAt={dueAt}
            setDueAt={setDueAt}
            scopeError={scopeError}
            operatorError={operatorError}
            operatorLoading={operatorLoading}
            onRetryOperators={()=>setOperatorReload(n=>n+1)}
            conflictReason={conflictReason}
            errorMessage={submitError}
            onClearError={() => { setSubmitError(null); setConflict(null) }}
            errorActions={conflict&&conflict.plans.length?<div className="flex flex-wrap gap-2">{conflict.plans.map(p=><button key={p.id} type="button" onClick={()=>navigate(`/pm/surveys?surveyRecordId=${encodeURIComponent(p.id)}&surveyRecordKind=PLAN`)} className="text-xs underline text-brand-navy cursor-pointer">Mở kế hoạch KH-{p.id.replace(/-/g,'').slice(0,8).toUpperCase()} ({surveyStatusLabel(p.status)}{p.plannedAt?`, lịch ${new Date(p.plannedAt).toLocaleString('vi-VN')}`:''})</button>)}</div>:undefined}
            onSubmit={handleSubmit}
            onCancel={() => { void handleCancel() }}
          />
          {showResult&&verifiedResult&&<section aria-label="Kết quả kế hoạch và nhiệm vụ" className="mt-4 rounded-xl border border-[#E2E5E9] bg-white p-4 space-y-2 text-xs break-words"><h2 className="font-bold">Kế hoạch và nhiệm vụ đã tạo</h2><p>Kế hoạch: {verifiedResult.plan.id} · {verifiedResult.plan.status}</p><p>Nhiệm vụ: {verifiedResult.task.id} · {verifiedResult.task.status}</p><p>Operator: {pilots.find(p=>p.id===verifiedResult.task.operatorId)?.name||verifiedResult.task.operatorId}</p><div className="flex flex-wrap gap-3"><button type="button" className="underline" onClick={()=>navigate(`/pm/surveys?surveyRecordId=${encodeURIComponent(verifiedResult.plan.id)}&surveyRecordKind=PLAN`)}>Chi tiết kế hoạch</button><button type="button" className="underline" onClick={()=>navigate(`/pm/surveys?surveyRecordId=${encodeURIComponent(verifiedResult.task.id)}&surveyRecordKind=TASK`)}>Chi tiết nhiệm vụ</button></div></section>}
        </div>

        {/* 3. Bản Đồ Cột Phải (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <FlightCorridorMap
            targetBand={targetBand}
            currentProject={currentProject}
            fullRouteCoords={fullRouteCoords}
            surveySegmentCoords={surveySegmentCoords}
            sKm={sKm}
            eKm={eKm}
            flightDistanceKm={flightDistanceKm}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateSurvey
