import { defectTypeCatalog, type DefectTypeOption } from '../../../api/services/defectTypeCatalog'
import { triageGeometryService, type TriageRouteReference, type TriagePublishedSet } from '../../../api/services/triageGeometryService'
import { Link } from 'react-router-dom'
import { reportKeepNewCommands, type KeepNewResult, type ReportDecisionResult, type ReportKeepNewInput } from '../../../api/services/reportKeepNewCommands'
import React, { useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../api/client'
import { surveyService } from '../../../api/services/surveyService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { useCaseReportMedia } from './useCaseReportMedia'
import { ReportMatchingPanel } from './ReportMatchingPanel'
import { SEVERITY_OPTIONS } from '../../../utils/severity'
import type { TriageCase } from './types'

export function ReportDefectIntake({ selectedCase, onRecorded }: { selectedCase: TriageCase; onRecorded?: (message: string) => void }) {
  const media = useCaseReportMedia(), auth = useAuthStore()
  const caseScope = `${auth.authEpoch}:${auth.user?.id}:${selectedCase.id}:${selectedCase.project_id}`
  const reports = media?.caseId === selectedCase.id ? media.reports.filter(r => r.caseId === selectedCase.id) : []
  const query=typeof window!=='undefined'?new URLSearchParams(window.location.search):null
  const [sourceChoice, setSourceChoice] = useState<{scope: string; reportId: string} | null>(null)
  const reportId = reports.length === 1 ? reports[0].reportId : sourceChoice?.scope === caseScope ? sourceChoice.reportId : reports.some(r=>r.reportId===query?.get('reportId'))?query!.get('reportId')!:''
  const report = reports.find(r => r.reportId === reportId)
  const scope = `${auth.authEpoch}:${auth.user?.id}:${selectedCase.id}:${selectedCase.project_id}:${reportId}`
  type Match = {defectId: string; version?: string | null; distanceMeters?: number | null; accuracyMeters?: number | null; distanceStatus?: string | null; distanceMethod?: string | null; overlapStatus?: string | null; reasonCodes?: string[] | null}
  const [expandState, setExpandState] = useState<{scope: string; on: boolean}>({scope: '', on: false})
  const [read, setRead] = useState<{scope: string; sourceVersion?: string; geometryVersion?: string; matches?: Match[]; error?: string} | null>(null)
  // Quyết định nguồn Report: KEEP_NEW (tạo Defect), LINK_EXISTING (gắn Defect hiện có), REJECT (loại nguồn Report; KHÁC kết luận Case NO_DEFECT).
  const [kindState, setKindState] = useState<{scope: string; kind: 'KEEP_NEW' | 'LINK_EXISTING' | 'REJECT'; targetId: string; shown: boolean}>({scope: '', kind: 'KEEP_NEW', targetId: '', shown: false})
  const [reload, setReload] = useState(0)
  const [form, setForm] = useState({scope: '', severity: '', reason: '', defectTypeCode:'', roadId:'',setId:''})
  const severity = form.scope === scope ? form.severity : ''
  const decisionReason = form.scope === scope ? form.reason : ''
  const changeForm = (key: 'severity' | 'reason' | 'defectTypeCode' | 'roadId'|'setId', value: string) => setForm(old => ({scope, severity: old.scope === scope ? old.severity : '', reason: old.scope === scope ? old.reason : '', defectTypeCode: old.scope===scope?old.defectTypeCode:'', roadId:old.scope===scope?old.roadId:'',setId:key==='roadId'?'':old.scope===scope?old.setId:'', [key]: value}))
  const allowed = auth.user?.role === RoleCode.PROJECT_MANAGER && selectedCase.case_status === 'OPEN' && !!selectedCase.project_id
  useEffect(() => {
    const controller = new AbortController(); setRead(null)
    if (!allowed || !report || media?.reportsError || media?.reportsLoading) return () => controller.abort()
    ;(async () => {
      let cursor: string | undefined, sourceVersion: string | undefined, geometryVersion: string | undefined
      const seen = new Set<string>(), matches: Match[] = []
      do {
        const {data} = await apiClient.get(`/projects/${selectedCase.project_id}/candidates`, {params: {sourceKind: 'REPORT', sourceId: report.reportId, pageSize: 50, cursor, expand: expandState.scope === scope && expandState.on ? true : undefined}, signal: controller.signal})
        if (controller.signal.aborted || useAuthStore.getState().authEpoch !== auth.authEpoch) return
        if (data?.source?.kind !== 'REPORT' || data.source.id !== report.reportId || typeof data.source.version !== 'string' || !data.source.version || typeof data.geometryVersion !== 'string' || !data.geometryVersion || !Array.isArray(data.items) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor)) throw new Error('Candidate thiếu hoặc sai Report/phiên bản nguồn/geometryVersion; chưa ghi nhận khiếm khuyết.')
        if (sourceVersion && (sourceVersion !== data.source.version || geometryVersion !== data.geometryVersion)) throw new Error('Phiên bản candidate thay đổi giữa các trang; cần đọc lại.')
        sourceVersion = data.source.version; geometryVersion = data.geometryVersion; matches.push(...data.items.filter((m: any) => typeof m?.defectId === 'string')); cursor = data.nextCursor || undefined
        if (cursor && seen.has(cursor)) throw new Error('Cursor candidate lặp; chưa đọc đầy đủ nguồn.')
        if (cursor) seen.add(cursor)
      } while (cursor)
      if (!controller.signal.aborted) setRead({scope, sourceVersion, geometryVersion, matches})
    })().catch(e => { if (!controller.signal.aborted && useAuthStore.getState().authEpoch === auth.authEpoch) setRead({scope, error: e?.response ? `Không đọc được nguồn Report: HTTP ${e.response.status} ${e.response.data?.code || ''}${e.response.data?.correlationId ? ` · Mã đối chiếu ${e.response.data.correlationId}` : ''}` : e.message || 'Không đọc được nguồn Report.'}) })
    return () => controller.abort()
  }, [scope, allowed, !!report, media?.reportsError, media?.reportsLoading, selectedCase.version, reload, expandState.scope === scope && expandState.on])
  const [catalog, setCatalog] = useState<{scope:string; items:DefectTypeOption[]; error:string}|null>(null)
  const [roads, setRoads] = useState<TriageRouteReference[]>([]), [roadError,setRoadError]=useState('')
  const [packageRead,setPackageRead]=useState<{scope:string;version:string;error:string}|null>(null)
  const [command,setCommand]=useState<{scope:string;busy:boolean;error:string}>({scope:'',busy:false,error:''})
  const canceled=useRef(scope);canceled.current=scope
  const catalogScope=`${auth.authEpoch}:${auth.user?.id}`
  useEffect(()=>{const c=new AbortController();setCatalog(null);defectTypeCatalog.read(c.signal).then(items=>{if(!c.signal.aborted)setCatalog({scope:catalogScope,items,error:''})}).catch(e=>{if(!c.signal.aborted)setCatalog({scope:catalogScope,items:[],error:`Không đọc được loại lỗi: HTTP ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`})});return()=>c.abort()},[catalogScope,reload])
  useEffect(()=>{const c=new AbortController();setRoads([]);setRoadError('');if(allowed)triageGeometryService.routes(selectedCase.project_id!,c.signal).then(rows=>{if(!c.signal.aborted)setRoads(rows)}).catch(e=>{if(!c.signal.aborted)setRoadError(e.message)});return()=>c.abort()},[caseScope,allowed,reload])
  const roadId=form.scope===scope?form.roadId:'', defectTypeCode=form.scope===scope?form.defectTypeCode:''
  const setId=form.scope===scope?form.setId:'',road=roads.find(r=>r.roadSectionId===roadId), packageScope=`${scope}:${roadId}:${setId}`
  const [sets,setSets]=useState<TriagePublishedSet[]>([]),[setError,setSetError]=useState('')
  useEffect(()=>{const c=new AbortController();setSets([]);setSetError('');if(road)triageGeometryService.sets(selectedCase.project_id!,road,c.signal).then(rows=>{if(!c.signal.aborted)setSets(rows)}).catch(e=>{if(!c.signal.aborted)setSetError(e.message)});return()=>c.abort()},[caseScope,roadId,road?.currentVersionId,reload])
  useEffect(()=>{const c=new AbortController();setPackageRead(null);if(road&&sets.some(s=>s.id===setId))triageGeometryService.package(selectedCase.project_id!,road,setId,c.signal).then(p=>{if(!c.signal.aborted)setPackageRead({scope:packageScope,version:p.geometryVersion,error:''})}).catch(e=>{if(!c.signal.aborted)setPackageRead({scope:packageScope,version:'',error:e.message})});return()=>c.abort()},[packageScope,road?.currentVersionId,sets,reload])
  const activeCatalog=catalog?.scope===catalogScope?catalog:null
  const currentPackage=packageRead?.scope===packageScope?packageRead:null
  const commandBusy=command.scope===scope&&command.busy
  let heldDecision:ReturnType<typeof reportKeepNewCommands.pending>=null, journalError=''
  try{if(selectedCase.project_id&&report)heldDecision=reportKeepNewCommands.pending(selectedCase.project_id,report.reportId)}catch(e){journalError=(e as Error).message}
  const suppliedReference=query?.get('reportId')===reportId?query.get('decisionId')||'':''
  let savedReference:ReturnType<typeof reportKeepNewCommands.reference>=null
  try{if(selectedCase.project_id&&report)savedReference=reportKeepNewCommands.reference?.(selectedCase.project_id,report.reportId)||null}catch(e){journalError=(e as Error).message}
  const referenceId=suppliedReference||savedReference?.decisionId||heldDecision?.receipt?.id||''
  const [recorded,setRecorded]=useState<{scope:string;result?:ReportDecisionResult;error?:string;loading?:boolean}|null>(null)
  useEffect(()=>{
    const c=new AbortController();setRecorded(null)
    if(!selectedCase.project_id||!report||!referenceId)return()=>c.abort()
    setRecorded({scope,loading:true})
    reportKeepNewCommands.readDecision(selectedCase.project_id,report.reportId,referenceId,c.signal).then(result=>{if(!c.signal.aborted&&result)setRecorded({scope,result})})
      .catch(e=>{if(!c.signal.aborted)setRecorded({scope,error:`Không đọc được kết quả: HTTP ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`})})
    return()=>c.abort()
  },[scope,referenceId,reload])
  const currentRecorded=recorded?.scope===scope?recorded:null
  const kindNow=kindState.scope===scope?kindState:{scope,kind:'KEEP_NEW' as const,targetId:'',shown:false}
  const kind=kindNow.kind,targetId=kindNow.targetId,showErrors=kindNow.shown
  const changeKind=(patch:Partial<{kind:'KEEP_NEW'|'LINK_EXISTING'|'REJECT';targetId:string;shown:boolean}>)=>setKindState({...kindNow,scope,...patch})
  const target=read?.scope===scope?read.matches?.find(m=>m.defectId===targetId):undefined
  const reasonLen=decisionReason.trim().length
  const fieldErrors:Record<string,string>={}
  if(!reasonLen)fieldErrors.reason='Nhập lý do quyết định (bắt buộc).';else if(reasonLen>1000)fieldErrors.reason='Lý do tối đa 1.000 ký tự (đang nhập '+reasonLen+').'
  if(kind==='KEEP_NEW'){
    if(!defectTypeCode)fieldErrors.type='Chọn loại lỗi.';else if(!activeCatalog?.items.some(t=>t.code===defectTypeCode))fieldErrors.type='Loại lỗi không còn hiệu lực; chọn lại.'
    if(!severity)fieldErrors.severity='Chọn mức độ nghiêm trọng.'
    if(!roadId)fieldErrors.road='Chọn tuyến theo hồ sơ nguồn.';else if(!road)fieldErrors.road='Tuyến đã chọn không còn trong danh sách máy chủ; chọn lại.'
    if(road&&!setId)fieldErrors.set='Chọn bộ phân đoạn đã công bố.';else if(road&&setId&&currentPackage?.version!==read?.geometryVersion)fieldErrors.set=currentPackage?.error||'Hồ sơ hình học chưa đọc xong hoặc không khớp phiên bản nguồn.'
  }
  if(kind==='LINK_EXISTING'){
    if(!targetId)fieldErrors.target='Chọn Defect đích từ danh sách máy chủ trả về.';else if(!target?.version)fieldErrors.target='Máy chủ không trả phiên bản của Defect đích; không thể gắn.'
  }
  const canSave=!referenceId&&!currentRecorded?.result&&!heldDecision&&!journalError&&allowed&&!!report&&!!read&&read.scope===scope&&!read.error&&!!read.sourceVersion&&!commandBusy&&!Object.keys(fieldErrors).length&&(kind!=='KEEP_NEW'||!currentPackage?.error)
  const execute=async()=>{
    if(!selectedCase.project_id||!report||commandBusy||referenceId||currentRecorded?.result)return
    const project=selectedCase.project_id,reportId=report.reportId,start=scope
    setCommand({scope:start,busy:true,error:''})
    try{const held=reportKeepNewCommands.pending(project,reportId)
      if(kind!=='KEEP_NEW'&&!held){
        if(!canSave)throw new Error('Chưa đủ nguồn hoặc dữ liệu form.')
        const dec=await surveyService.decideCandidate(project,{sourceKind:'REPORT',sourceId:reportId,decision:kind,reason:decisionReason.trim(),sourceVersion:read!.sourceVersion!,geometryVersion:read!.geometryVersion!,...(kind==='LINK_EXISTING'?{targetDefectId:targetId,targetVersion:target!.version!}:{})})
        reportKeepNewCommands.recordReference(project,reportId,dec.id,kind,dec.defectId)
        const result=await reportKeepNewCommands.readDecision(project,reportId,dec.id)
        if(canceled.current===start){setRecorded({scope:start,result:result||undefined});setCommand({scope:start,busy:false,error:''});onRecorded?.(kind==='REJECT'?'Đã từ chối nguồn Report (không phải kết luận NO_DEFECT của Case)':'Đã gắn Report vào khiếm khuyết hiện có')}
        return
      }
      if(!held&&!canSave)throw new Error('Chưa đủ nguồn, phân loại hoặc tuyến.');
      const body:ReportKeepNewInput=held?.body||{sourceKind:'REPORT',sourceId:reportId,sourceVersion:read!.sourceVersion!,geometryVersion:read!.geometryVersion!,decision:'KEEP_NEW',classification:{defectTypeCode,severity,roadSectionVersionId:road!.currentVersionId},reason:decisionReason.trim()}
      const result=await reportKeepNewCommands.run(project,body)
      if(canceled.current===start){setRecorded({scope:start,result});setCommand({scope:start,busy:false,error:''});onRecorded?.('Đã ghi nhận khiếm khuyết')}
    }catch(e:any){if(canceled.current===start)setCommand({scope:start,busy:false,error:`${e?.response?.status?`HTTP ${e.response.status} ${e.response.data?.code||''}${e.response.data?.correlationId?` · Mã đối chiếu ${e.response.data.correlationId}`:''}`:`Không gửi được quyết định: ${e.message}`}${e?.response?.data?.code==='invalid_state_transition'?' — nguồn Report này đã có quyết định chấp nhận trên máy chủ (không ghi nhận lại). Máy chủ chưa có API tra quyết định theo nguồn nên nhãn "Đã ghi nhận" chỉ hiện khi còn tham chiếu của phiên làm việc.':''}`})}
  }
  const current = read?.scope === scope ? read : null
  const sourceStale = command.scope === scope && command.error.includes('Phiên bản nguồn/hình học thay đổi; cần đọc lại trước quyết định mới.')
  const packageMismatch = !!currentPackage?.version && !!current?.geometryVersion && currentPackage.version !== current.geometryVersion
  const reason = !allowed ? 'Chỉ PM của dự án được ghi nhận khiếm khuyết từ Case OPEN đã phân công.'
    : media?.reportsError ? `Không đọc được Report: ${media.reportsError}` : !report ? 'Cần đọc và chọn Report thuộc đúng hồ sơ.'
    : !current ? 'Đang kiểm tra nguồn Report…' : current.error || (sourceStale || packageMismatch ? 'Phiên bản nguồn hoặc hình học không còn khớp; hãy tải lại dữ liệu ghi nhận.' : 'Đã đọc phiên bản nguồn Report và hình học từ máy chủ.')
  const err=(key:string)=>showErrors&&fieldErrors[key]?<span role="alert" data-testid={`err-${key}`} className="text-rose-700 font-semibold">{fieldErrors[key]}</span>:null
  const kindLabel=currentRecorded?.result?.decision.decision||(referenceId?savedReference?.decision:'')||'KEEP_NEW'

  const reportSelector=<label className="grid min-w-0 gap-1">
    Phản ánh nguồn
    <select aria-label="Report nguồn ghi nhận khiếm khuyết" value={reportId} disabled={commandBusy || !!media?.reportsLoading || !!media?.reportsError || !reports.length} onChange={event=>setSourceChoice({scope:caseScope,reportId:event.target.value})} className="rg-field w-full min-w-0 max-w-full">
      {reports.length!==1&&<option value="">Chọn phản ánh nguồn</option>}
      {reports.map((r,i)=><option key={r.reportId} value={r.reportId}>Phản ánh {i+1} · {r.receivedAt && Number.isFinite(Date.parse(r.receivedAt)) ? new Date(r.receivedAt).toLocaleString('vi-VN', {timeZone:'Asia/Ho_Chi_Minh'}) : 'Chưa có ngày tiếp nhận'}</option>)}
    </select>
  </label>
  if(referenceId||currentRecorded?.result)return <div className="min-w-0 max-w-full space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
    <p className="font-bold text-slate-800">Kết quả ghi nhận phản ánh</p>
    <ul data-testid="source-state" className="list-disc pl-4 text-slate-700">
      <li>Liên kết nguồn (Report → Defect): {currentRecorded?.result ? (currentRecorded.result.decision.decision === 'REJECT' ? 'Đã từ chối nguồn Report (không có Defect)' : `${currentRecorded.result.decision.decision} → #DEF-${(currentRecorded.result.decision.defectId || '').slice(0, 8).toUpperCase()} (Defect: ${currentRecorded.result.defect?.status || 'chưa đọc'})`) : currentRecorded?.loading ? 'đang đọc từ máy chủ…' : 'chưa đọc được từ máy chủ'}</li>
      <li>Kết luận Case: {selectedCase.case_status === 'CONCLUDED' ? 'Đã có kết luận' : 'Chưa kết luận'}</li>
      <li>Kết quả chưa tự công bố cho người dân từ thao tác liên kết.</li>
    </ul>
    {reportSelector}
    {currentRecorded?.loading&&<p role="status">Đang đọc quyết định và khiếm khuyết từ máy chủ…</p>}
    {currentRecorded?.error&&<p role="alert">{currentRecorded.error}</p>}
    {currentRecorded?.result&&<>
      {currentRecorded.result.defect?<p>Trạng thái Defect: {currentRecorded.result.defect.status} · Mức độ: {currentRecorded.result.defect.severity}{currentRecorded.result.decision.decision==='LINK_EXISTING'?' · Report đã được gắn vào Defect hiện có':''}</p>:<p>Quyết định REJECT nguồn Report: không tạo và không gắn Defect. Đây KHÔNG phải kết luận NO_DEFECT của Case.</p>}
      <p>{kindLabel==='REJECT'?'Nguồn Report đã bị từ chối; ':'Nguồn đã ghi nhận; không tạo quyết định mới. '}Ghi nhận không đồng nghĩa đã xác minh kỹ thuật.</p>
      {currentRecorded.result.defect&&<div className="flex flex-wrap gap-2"><Link className="border rounded-lg px-3 py-2" to={`/pm/field-tasks?${new URLSearchParams({projectId:selectedCase.project_id!,defectId:currentRecorded.result.defect.id,reportId,decisionId:currentRecorded.result.decision.id})}`}>Lập phiếu hiện trường cho khiếm khuyết này</Link><Link className="border rounded-lg px-3 py-2" to={`/pm/fast-track?${new URLSearchParams({projectId:selectedCase.project_id!,defectId:currentRecorded.result.defect.id,open:'prepare'})}`}>Lập phương án Fast Track</Link></div>}
      <Link className="inline-block underline" to={`/pm/ai-inbox?${new URLSearchParams({projectId:selectedCase.project_id!,caseId:selectedCase.id,reportId,decisionId:currentRecorded.result.decision.id})}`}>Liên kết đọc lại kết quả đã lưu</Link>
    </>}
    {heldDecision&&<p role="status" className="break-all">Giữ nguyên journal của yêu cầu {heldDecision.key}. Reference kết quả này không tự giải quyết một yêu cầu khác key/body.</p>}
    <button type="button" disabled={!!currentRecorded?.loading} onClick={()=>setReload(n=>n+1)} className="text-xs underline">Đọc lại kết quả ghi nhận</button>
  </div>
  return <div className="min-w-0 max-w-full space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
    <p className="font-bold text-slate-800">Xử lý phản ánh</p>
    <div className="flex flex-wrap items-center gap-2">
      {(!current || current.error || media?.reportsError || sourceStale || packageMismatch) && <p role={current?.error || media?.reportsError || sourceStale || packageMismatch ? 'alert' : 'status'} className="text-slate-600 break-words">{reason}</p>}
      {(current?.error || sourceStale || packageMismatch) && <button type="button" disabled={!allowed || !report || commandBusy} onClick={() => { if (sourceStale) setCommand(old => ({...old, error: ''})); setReload(n => n + 1) }} className="text-xs underline">Thử tải lại dữ liệu ghi nhận</button>}
    </div>
    {reportSelector}
    {allowed && !!report && selectedCase.project_id && <ReportMatchingPanel projectId={selectedCase.project_id} reportId={report.reportId} evidenceId={media?.selected?.reportId === report.reportId ? media.selected.evidence.evidenceId : null} sourceVersion={current?.sourceVersion} geometryVersion={current?.geometryVersion} matches={current?.matches} loading={!current} error={current?.error} expanded={expandState.scope === scope && expandState.on} onExpand={() => setExpandState({scope, on: true})} onChanged={() => setReload(n => n + 1)} />}
    <label className="grid min-w-0 gap-1">Hướng xử lý
      <select aria-label="Loại quyết định nguồn Report" value={kind} disabled={!allowed||commandBusy||!!heldDecision} onChange={e=>changeKind({kind:e.target.value as 'KEEP_NEW'|'LINK_EXISTING'|'REJECT',targetId:'',shown:false})} className="rg-field w-full min-w-0 max-w-full">
        <option value="KEEP_NEW">Ghi nhận khiếm khuyết mới</option>
        <option value="LINK_EXISTING">Gắn vào khiếm khuyết đã có</option>
        <option value="REJECT">Từ chối phản ánh nguồn</option>
      </select>
      {kind==='REJECT'&&<span className="text-slate-600 break-words">Từ chối nguồn Report không tạo Defect và khác kết luận Case “Không có khiếm khuyết” (NO_DEFECT) ở nút “Báo sai”.</span>}
    </label>
    {kind==='LINK_EXISTING'&&<label className="grid min-w-0 gap-1">Khiếm khuyết cần liên kết
      <select aria-label="Khiếm khuyết đích" value={targetId} disabled={!allowed||commandBusy||!current?.matches?.length} onChange={e=>changeKind({targetId:e.target.value})} className="rg-field w-full min-w-0 max-w-full">
        <option value="">{!current?'Đang đọc ứng viên…':current.matches?.length?'Chọn khiếm khuyết đích':'Chưa có khiếm khuyết để liên kết'}</option>
        {current?.matches?.map(m=><option key={m.defectId} value={m.defectId}>#DEF-{m.defectId.slice(0,8).toUpperCase()}{typeof m.distanceMeters==='number'&&Number.isFinite(m.distanceMeters)?` · cách ${m.distanceMeters.toFixed(1)} m`:''}</option>)}
      </select>{err('target')}
    </label>}
    {kind==='KEEP_NEW'&&<div className="grid min-w-0 grid-cols-1 gap-2">
      <label className="grid min-w-0 gap-1">
        Loại lỗi
        <select aria-label="Loại lỗi" value={defectTypeCode} disabled={commandBusy||!activeCatalog||!!activeCatalog.error||!activeCatalog.items.length} onChange={e=>changeForm('defectTypeCode',e.target.value)} className="rg-field w-full min-w-0 max-w-full">
          <option value="">{!activeCatalog?'Đang tải loại lỗi…':activeCatalog.error?'Lỗi tải danh mục':!activeCatalog.items.length?'Chưa có loại lỗi hiệu lực':'Chọn loại lỗi'}</option>
          {activeCatalog?.items.map(t=><option key={t.code} value={t.code}>{t.name}</option>)}
        </select>
        {activeCatalog?.error&&<span role="alert">{activeCatalog.error}</span>}
        {activeCatalog&&!activeCatalog.error&&!activeCatalog.items.length&&<span>Danh mục môi trường chưa có loại lỗi hiệu lực để nghiệm thu.</span>}
        {err('type')}
      </label>
      <label className="grid min-w-0 gap-1">
        Mức độ nghiêm trọng
        <select aria-label="Mức độ nghiêm trọng" value={severity} onChange={event => changeForm('severity', event.target.value)} disabled={!allowed} className="rg-field w-full min-w-0 max-w-full">
          <option value="">Chọn mức độ</option>
          {SEVERITY_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {err('severity')}
      </label>
    </div>}
    <label className="grid min-w-0 gap-1">
      Lý do ghi nhận khiếm khuyết
      <textarea aria-label="Lý do ghi nhận khiếm khuyết" aria-invalid={showErrors&&!!fieldErrors.reason} value={decisionReason} onChange={event => changeForm('reason', event.target.value)} disabled={!allowed} rows={2} className="rg-field w-full min-w-0 max-w-full" />
      {err('reason')}
    </label>
    {kind==='KEEP_NEW'&&<><label className="grid min-w-0 gap-1">Tuyến hiện hành cho Defect<select aria-label="Tuyến ghi nhận khiếm khuyết" value={roadId} disabled={!allowed||commandBusy} onChange={e=>changeForm('roadId',e.target.value)} className="rg-field w-full min-w-0"><option value="">Chọn tuyến theo hồ sơ nguồn</option>{roads.map(r=><option key={r.roadSectionId} value={r.roadSectionId}>{r.code}{r.name?` — ${r.name}`:''}</option>)}</select>{err('road')}</label>
    <label className="grid min-w-0 gap-1">Bộ phân đoạn đã công bố<select aria-label="Bộ phân đoạn ghi nhận khiếm khuyết" value={setId} disabled={!allowed||commandBusy||!sets.length} onChange={e=>changeForm('setId',e.target.value)} className="rg-field w-full min-w-0"><option value="">{roadId?'Chọn bộ phân đoạn từ server':'Chọn tuyến trước'}</option>{sets.map((s,i)=><option key={s.id} value={s.id}>Bộ đã công bố {i+1}</option>)}</select>{setError&&<span role="alert">{setError}</span>}{err('set')}</label></>}
    {journalError&&<p role="alert">{journalError}</p>}
    {(roadError||currentPackage?.error)&&<p role="alert">{roadError||currentPackage?.error}</p>}
    <button type="button" disabled={!allowed||!report||commandBusy||!!journalError||!!heldDecision} onClick={()=>{if(!canSave){changeKind({shown:true});return};void execute()}} className="rg-btn text-xs font-semibold">{commandBusy?'Đang ghi nhận…':kind==='REJECT'?'Xác nhận từ chối nguồn Report':kind==='LINK_EXISTING'?'Xác nhận gắn vào khiếm khuyết đã có':'Xác nhận ghi nhận khiếm khuyết'}</button>
    {showErrors&&!canSave&&!Object.keys(fieldErrors).length&&<p role="alert" className="text-rose-700 font-semibold">{current?.error||media?.reportsError||(!current?'Đang kiểm tra nguồn Report; chưa thể gửi.':'Dữ liệu nguồn chưa hợp lệ; đọc lại trước khi gửi.')}</p>}
    {heldDecision&&<button type="button" disabled={commandBusy} onClick={()=>{void execute()}} className="text-xs underline">Đối chiếu yêu cầu ghi nhận đang chờ</button>}
    {command.scope===scope&&command.error&&<p role="alert">{command.error}</p>}
    {selectedCase.case_status === 'OPEN' && current?.error && <p className="text-slate-600">Nếu Case thiếu phạm vi, dùng “Cập nhật phạm vi” trong khối Thông Tin Hồ Sơ; PM giữ nguyên dự án và chọn tuyến/bộ PUBLISHED. Chỉ ghi nhận khi GET nguồn trả đủ phiên bản hợp lệ.</p>}
  </div>
}
