import { defectTypeCatalog, type DefectTypeOption } from '../../../api/services/defectTypeCatalog'
import { triageGeometryService, type TriageRouteReference } from '../../../api/services/triageGeometryService'
import { reportKeepNewCommands, type ReportKeepNewInput } from '../../../api/services/reportKeepNewCommands'
import React, { useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../api/client'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { useCaseReportMedia } from './useCaseReportMedia'
import type { TriageCase } from './types'

export function ReportDefectIntake({ selectedCase, onRecorded }: { selectedCase: TriageCase; onRecorded?: (message: string) => void }) {
  const media = useCaseReportMedia(), auth = useAuthStore()
  const caseScope = `${auth.authEpoch}:${auth.user?.id}:${selectedCase.id}:${selectedCase.project_id}`
  const reports = media?.caseId === selectedCase.id ? media.reports.filter(r => r.caseId === selectedCase.id) : []
  const [sourceChoice, setSourceChoice] = useState<{scope: string; reportId: string} | null>(null)
  const reportId = reports.length === 1 ? reports[0].reportId : sourceChoice?.scope === caseScope ? sourceChoice.reportId : ''
  const report = reports.find(r => r.reportId === reportId)
  const scope = `${auth.authEpoch}:${auth.user?.id}:${selectedCase.id}:${selectedCase.project_id}:${reportId}`
  const [read, setRead] = useState<{scope: string; sourceVersion?: string; geometryVersion?: string; error?: string} | null>(null)
  const [reload, setReload] = useState(0)
  const [form, setForm] = useState({scope: '', severity: '', reason: '', defectTypeCode:'', roadId:''})
  const severity = form.scope === scope ? form.severity : ''
  const decisionReason = form.scope === scope ? form.reason : ''
  const changeForm = (key: 'severity' | 'reason' | 'defectTypeCode' | 'roadId', value: string) => setForm(old => ({scope, severity: old.scope === scope ? old.severity : '', reason: old.scope === scope ? old.reason : '', defectTypeCode: old.scope===scope?old.defectTypeCode:'', roadId:old.scope===scope?old.roadId:'', [key]: value}))
  const allowed = auth.user?.role === RoleCode.PROJECT_MANAGER && selectedCase.case_status === 'OPEN' && !!selectedCase.project_id
  useEffect(() => {
    const controller = new AbortController(); setRead(null)
    if (!allowed || !report || media?.reportsError || media?.reportsLoading) return () => controller.abort()
    ;(async () => {
      let cursor: string | undefined, sourceVersion: string | undefined, geometryVersion: string | undefined
      const seen = new Set<string>()
      do {
        const {data} = await apiClient.get(`/projects/${selectedCase.project_id}/candidates`, {params: {sourceKind: 'REPORT', sourceId: report.reportId, pageSize: 50, cursor}, signal: controller.signal})
        if (controller.signal.aborted || useAuthStore.getState().authEpoch !== auth.authEpoch) return
        if (data?.source?.kind !== 'REPORT' || data.source.id !== report.reportId || typeof data.source.version !== 'string' || !data.source.version || typeof data.geometryVersion !== 'string' || !data.geometryVersion || !Array.isArray(data.items) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor)) throw new Error('Candidate thiếu hoặc sai Report/phiên bản nguồn/geometryVersion; chưa ghi nhận khiếm khuyết.')
        if (sourceVersion && (sourceVersion !== data.source.version || geometryVersion !== data.geometryVersion)) throw new Error('Phiên bản candidate thay đổi giữa các trang; cần đọc lại.')
        sourceVersion = data.source.version; geometryVersion = data.geometryVersion; cursor = data.nextCursor || undefined
        if (cursor && seen.has(cursor)) throw new Error('Cursor candidate lặp; chưa đọc đầy đủ nguồn.')
        if (cursor) seen.add(cursor)
      } while (cursor)
      if (!controller.signal.aborted) setRead({scope, sourceVersion, geometryVersion})
    })().catch(e => { if (!controller.signal.aborted && useAuthStore.getState().authEpoch === auth.authEpoch) setRead({scope, error: e?.response ? `Không đọc được nguồn Report: HTTP ${e.response.status} ${e.response.data?.code || ''}${e.response.data?.correlationId ? ` · Mã đối chiếu ${e.response.data.correlationId}` : ''}` : e.message || 'Không đọc được nguồn Report.'}) })
    return () => controller.abort()
  }, [scope, allowed, !!report, media?.reportsError, media?.reportsLoading, selectedCase.version, reload])
  const [catalog, setCatalog] = useState<{scope:string; items:DefectTypeOption[]; error:string}|null>(null)
  const [roads, setRoads] = useState<TriageRouteReference[]>([]), [roadError,setRoadError]=useState('')
  const [packageRead,setPackageRead]=useState<{scope:string;version:string;error:string}|null>(null)
  const [command,setCommand]=useState<{scope:string;busy:boolean;error:string}>({scope:'',busy:false,error:''})
  const canceled=useRef(scope);canceled.current=scope
  const catalogScope=`${auth.authEpoch}:${auth.user?.id}`
  useEffect(()=>{const c=new AbortController();setCatalog(null);defectTypeCatalog.read(c.signal).then(items=>{if(!c.signal.aborted)setCatalog({scope:catalogScope,items,error:''})}).catch(e=>{if(!c.signal.aborted)setCatalog({scope:catalogScope,items:[],error:`Không đọc được loại lỗi: HTTP ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`})});return()=>c.abort()},[catalogScope,reload])
  useEffect(()=>{const c=new AbortController();setRoads([]);setRoadError('');if(allowed)triageGeometryService.routes(selectedCase.project_id!,c.signal).then(rows=>{if(!c.signal.aborted)setRoads(rows)}).catch(e=>{if(!c.signal.aborted)setRoadError(e.message)});return()=>c.abort()},[caseScope,allowed,reload])
  const roadId=form.scope===scope?form.roadId:'', defectTypeCode=form.scope===scope?form.defectTypeCode:''
  const road=roads.find(r=>r.roadSectionId===roadId), packageScope=`${scope}:${roadId}`
  useEffect(()=>{const c=new AbortController();setPackageRead(null);if(road) (async()=>{const sets=await triageGeometryService.sets(selectedCase.project_id!,road,c.signal);if(sets.length!==1)throw new Error('Cần đúng một bộ PUBLISHED của tuyến để xác minh nguồn.');const p=await triageGeometryService.package(selectedCase.project_id!,road,sets[0].id,c.signal);if(!c.signal.aborted)setPackageRead({scope:packageScope,version:p.geometryVersion,error:''})})().catch(e=>{if(!c.signal.aborted)setPackageRead({scope:packageScope,version:'',error:e.message})});return()=>c.abort()},[packageScope,road?.currentVersionId,reload])
  const activeCatalog=catalog?.scope===catalogScope?catalog:null
  const currentPackage=packageRead?.scope===packageScope?packageRead:null
  const commandBusy=command.scope===scope&&command.busy
  let heldDecision:ReturnType<typeof reportKeepNewCommands.pending>=null, journalError=''
  try{if(selectedCase.project_id&&report)heldDecision=reportKeepNewCommands.pending(selectedCase.project_id,report.reportId)}catch(e){journalError=(e as Error).message}
  const canSave=!heldDecision&&!journalError&&allowed&&!!report&&!currentPackage?.error&&!!read&&read.scope===scope&&!read.error&&!!read.sourceVersion&&currentPackage?.version===read.geometryVersion&&!!road&&!!activeCatalog?.items.some(t=>t.code===defectTypeCode)&&!!severity&&!!decisionReason.trim()&&decisionReason.trim().length<=1000&&!commandBusy
  const execute=async()=>{
    if(!selectedCase.project_id||!report||commandBusy)return
    const project=selectedCase.project_id,reportId=report.reportId,start=scope
    setCommand({scope:start,busy:true,error:''})
    try{const held=reportKeepNewCommands.pending(project,reportId);if(!held&&!canSave)throw new Error('Chưa đủ nguồn, phân loại hoặc tuyến.');
      const body:ReportKeepNewInput=held?.body||{sourceKind:'REPORT',sourceId:reportId,sourceVersion:read!.sourceVersion!,geometryVersion:read!.geometryVersion!,decision:'KEEP_NEW',classification:{defectTypeCode,severity,roadSectionVersionId:road!.currentVersionId},reason:decisionReason.trim()}
      await reportKeepNewCommands.run(project,body)
      if(canceled.current===start){setCommand({scope:start,busy:false,error:''});onRecorded?.('Đã ghi nhận khiếm khuyết')}
    }catch(e:any){if(canceled.current===start)setCommand({scope:start,busy:false,error:`HTTP ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`})}
  }
  const current = read?.scope === scope ? read : null
  const sourceStale = command.scope === scope && command.error.includes('Phiên bản nguồn/hình học thay đổi; cần đọc lại trước quyết định mới.')
  const packageMismatch = !!currentPackage?.version && !!current?.geometryVersion && currentPackage.version !== current.geometryVersion
  const reason = !allowed ? 'Chỉ PM của dự án được ghi nhận khiếm khuyết từ Case OPEN đã phân công.'
    : media?.reportsError ? `Không đọc được Report: ${media.reportsError}` : !report ? 'Cần đọc và chọn Report thuộc đúng hồ sơ.'
    : !current ? 'Đang kiểm tra nguồn Report…' : current.error || (sourceStale || packageMismatch ? 'Phiên bản nguồn hoặc hình học không còn khớp; hãy tải lại dữ liệu ghi nhận.' : 'Đã đọc phiên bản nguồn Report và hình học từ máy chủ.')
  const missing = [
    !report?'Report nguồn':'',!current?.sourceVersion?'source.version':'',!current?.geometryVersion?'geometryVersion':'',!defectTypeCode?'loại lỗi hiệu lực':'',!road?'tuyến':'',road&&currentPackage?.version!==current?.geometryVersion?'package khớp geometryVersion nguồn':'',!severity?'mức độ':'',!decisionReason.trim()?'lý do':''
  ].filter(Boolean).join('; ')
  return <div className="min-w-0 max-w-full space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
    <p className="font-bold text-slate-800">Ghi nhận khiếm khuyết</p>
    <div className="flex flex-wrap items-center gap-2">
      <p role={current?.error || media?.reportsError || sourceStale || packageMismatch ? 'alert' : 'status'} className="text-slate-600 break-words">{reason}</p>
      {(current?.error || sourceStale || packageMismatch) && <button type="button" disabled={!allowed || !report || commandBusy} onClick={() => { if (sourceStale) setCommand(old => ({...old, error: ''})); setReload(n => n + 1) }} className="text-xs underline">Thử tải lại dữ liệu ghi nhận</button>}
    </div>
    {reports.length === 1 ? <div className="grid min-w-0 gap-1">
      <span>Phản ánh dùng để ghi nhận</span>
      <p className="text-slate-600 break-words">Phản ánh 1 · {reports[0].receivedAt || 'Chưa có ngày tiếp nhận'}</p>
    </div> : reports.length > 1 && <label className="grid min-w-0 gap-1">
      Report nguồn
      <select aria-label="Report nguồn ghi nhận khiếm khuyết" value={reportId} disabled={!allowed || !!media?.reportsLoading || !!media?.reportsError} onChange={event => setSourceChoice({scope: caseScope, reportId: event.target.value})} className="w-full min-w-0 max-w-full rounded border bg-white p-2">
        <option value="">Chọn Report nguồn</option>
        {reports.map((r, i) => <option key={r.reportId} value={r.reportId}>Phản ánh {i + 1} · {r.receivedAt || 'Chưa có ngày tiếp nhận'} · {r.reportId}</option>)}
      </select>
      <span className="text-slate-600 break-words">Report nguồn không đổi khi chuyển ảnh đang xem.</span>
    </label>}
    <div className="grid min-w-0 grid-cols-1 gap-2">
      <label className="grid min-w-0 gap-1">
        Loại lỗi
        <select aria-label="Loại lỗi" value={defectTypeCode} disabled={commandBusy||!activeCatalog||!!activeCatalog.error||!activeCatalog.items.length} onChange={e=>changeForm('defectTypeCode',e.target.value)} className="w-full min-w-0 max-w-full rounded border bg-white p-2">
          <option value="">{!activeCatalog?'Đang tải loại lỗi…':activeCatalog.error?'Lỗi tải danh mục':!activeCatalog.items.length?'Chưa có loại lỗi hiệu lực':'Chọn loại lỗi'}</option>
          {activeCatalog?.items.map(t=><option key={t.code} value={t.code}>{t.name}</option>)}
        </select>
        {activeCatalog?.error&&<span role="alert">{activeCatalog.error}</span>}
        {activeCatalog&&!activeCatalog.error&&!activeCatalog.items.length&&<span>Danh mục môi trường chưa có loại lỗi hiệu lực để nghiệm thu.</span>}
      </label>
      <label className="grid min-w-0 gap-1">
        Mức độ nghiêm trọng
        <select aria-label="Mức độ nghiêm trọng" value={severity} onChange={event => changeForm('severity', event.target.value)} disabled={!allowed} className="w-full min-w-0 max-w-full rounded border bg-white p-2">
          <option value="">Chọn mức độ</option>
          <option value="LOW">Thấp</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HIGH">Cao</option>
          <option value="CRITICAL">Nghiêm trọng</option>
        </select>
      </label>
    </div>
    <label className="grid min-w-0 gap-1">
      Lý do ghi nhận khiếm khuyết
      <textarea aria-label="Lý do ghi nhận khiếm khuyết" value={decisionReason} onChange={event => changeForm('reason', event.target.value)} disabled={!allowed} rows={2} className="w-full min-w-0 max-w-full rounded border bg-white p-2" />
    </label>
    <label className="grid min-w-0 gap-1">Tuyến hiện hành cho Defect<select aria-label="Tuyến ghi nhận khiếm khuyết" value={roadId} disabled={!allowed||commandBusy} onChange={e=>changeForm('roadId',e.target.value)} className="w-full min-w-0 rounded border p-2"><option value="">Chọn tuyến theo hồ sơ nguồn</option>{roads.map(r=><option key={r.roadSectionId} value={r.roadSectionId}>{r.code}{r.name?` — ${r.name}`:''}</option>)}</select></label>
    {journalError&&<p role="alert">{journalError}</p>}
    {(roadError||currentPackage?.error)&&<p role="alert">{roadError||currentPackage?.error}</p>}
    <p className="text-slate-600 break-words">{missing ? `Còn thiếu: ${missing}` : 'Đã đủ dữ liệu form; máy chủ vẫn kiểm quyền và hiệu lực.'}</p>
    <button type="button" disabled={!canSave} onClick={()=>{void execute()}} className="border rounded-lg px-3 py-2 text-xs font-semibold">{commandBusy?'Đang ghi nhận…':'Xác nhận ghi nhận khiếm khuyết'}</button>
    {heldDecision&&<button type="button" disabled={commandBusy} onClick={()=>{void execute()}} className="text-xs underline">Đối chiếu yêu cầu ghi nhận đang chờ</button>}
    {command.scope===scope&&command.error&&<p role="alert">{command.error}</p>}
    {selectedCase.case_status === 'OPEN' && current?.error && <p className="text-slate-600">Nếu Case thiếu phạm vi, dùng “Cập nhật phạm vi” trong khối Thông Tin Hồ Sơ; PM giữ nguyên dự án và chọn tuyến/bộ PUBLISHED. Chỉ ghi nhận khi GET nguồn trả đủ phiên bản hợp lệ.</p>}
    <p className="text-slate-600">Chưa mở Kết luận có lỗi: cần Defect đã xác minh và bằng chứng đúng phạm vi.</p>
  </div>
}
