import {fieldReviewCommands,type FieldReviewInput} from '../../../api/services/fieldReviewCommands'
import React,{useEffect,useState,useRef} from 'react'
import {useAuthStore} from '../../../store/authStore'
import {fieldTaskReadService,fieldReadError} from '../../../api/services/fieldTaskReadService'
import {fieldTaskActions,type TaskAction} from '../../../api/services/fieldTaskActions'
import {fastTrackService} from '../../../api/services/fastTrackService'
import {measurementTypeLabel} from '../../../api/services/fieldMeasurementTypes'
import {FieldTaskImpactPanel} from './FieldTaskImpactPanel'
import {useSubmitGuard} from '../../../hooks/useSubmitGuard'
export type FieldRead=Awaited<ReturnType<typeof fieldTaskReadService.read>>
// Khối này giữ hồ sơ nhiệm vụ, lịch sử, review và giao lại. Số đo/ảnh của bản nộp mới nhất hiển thị ở khối hợp nhất bên dưới
// (cùng dữ liệu GET, báo qua onLoaded) để không còn hai khối mâu thuẫn.
export function FieldTaskReadDetails({projectId,taskId,onReviewed,onLoaded}:{projectId:string;taskId:string;onReviewed?:(task:Awaited<ReturnType<typeof fieldTaskReadService.detail>>)=>void;onLoaded?:(read:FieldRead)=>void}){
 const epoch=useAuthStore(s=>s.authEpoch),scope=`${epoch}:${projectId}:${taskId}`
 const [data,setData]=useState<{scope:string;value:FieldRead}|null>(null),[error,setError]=useState(''),[reload,setReload]=useState(0)
 useEffect(()=>{const c=new AbortController();setData(null);setError('');fieldTaskReadService.read(projectId,taskId,c.signal).then(value=>{if(!c.signal.aborted)setData({scope,value})}).catch(e=>{if(!c.signal.aborted)setError(fieldReadError(e))});return()=>c.abort()},[scope,reload])
 const role=useAuthStore(s=>s.user?.role)
 const [decision,setDecision]=useState<FieldReviewInput['decision']|''>(''),[reason,setReason]=useState(''),[reviewError,setReviewError]=useState(''),[reviewing,setReviewing]=useState(false)
 const latest=useRef(scope);latest.current=scope
 const actGuard=useSubmitGuard()
 const [act,setAct]=useState<'reassign'|'cancel'>('reassign'),[actCrew,setActCrew]=useState(''),[actReason,setActReason]=useState(''),[actPortion,setActPortion]=useState<'NONE'|'PARTIAL'|'CAPTURED_INTAKE'|'UNKNOWN'>('NONE'),[actSummary,setActSummary]=useState(''),[actError,setActError]=useState(''),[actBusy,setActBusy]=useState(false),[crews,setCrews]=useState<Array<{id:string;name:string}>>([]),[crewsLoaded,setCrewsLoaded]=useState(false)
 useEffect(()=>{if(role!=='PROJECT_MANAGER')return;let on=true;setCrewsLoaded(false);fastTrackService.getCrews(projectId).then(r=>{if(on){setCrews(r.map(c=>({id:c.id,name:c.name})));setCrewsLoaded(true)}}).catch(e=>{if(on)setActError(fieldReadError(e))});return()=>{on=false}},[projectId,role])
 useEffect(()=>{setActReason('');setActSummary('');setActError('');setActCrew('')},[scope])
 useEffect(()=>{setDecision('');setReason('');setReviewError('');setReviewing(false)},[scope])
 let held:ReturnType<typeof fieldReviewCommands.pending>=null,journalError=''
 try{if(role==='PROJECT_MANAGER')held=fieldReviewCommands.pending(projectId,taskId)}catch(e){journalError=(e as Error).message}
 const review=async()=>{
  if(reviewing||!current||role!=='PROJECT_MANAGER')return
  const start=scope;setReviewing(true);setReviewError('')
  try{const input=held?.body||{submissionId:current.task.latestSubmissionId||'',decision:decision as FieldReviewInput['decision'],reason};const value=await fieldReviewCommands.request(projectId,taskId,input,held?.version||current.task.version||'');if(latest.current!==start)return;setData({scope:start,value});setDecision('');setReason('');onReviewed?.(value.task)}catch(e){if(latest.current===start)setReviewError(fieldReadError(e))}finally{if(latest.current===start)setReviewing(false)}
 }
 const current=data?.scope===scope?data.value:null
 useEffect(()=>{if(current)onLoaded?.(current)},[current])
 const doAct=async()=>{
  if(!current||!actGuard.acquire())return
  const start=scope;setActBusy(true);setActError('')
  const kind:TaskAction=act==='cancel'?'cancel':(current.task.assignedToUserId?'reassign':'assign')
  try{await fieldTaskActions.run(projectId,taskId,kind,{reason:actReason,assignedToUserId:act==='cancel'?undefined:actCrew,handover:current.task.firstStartOriginId?{performedPortionState:actPortion,summary:actSummary}:undefined});if(latest.current!==start)return;setActReason('');setActSummary('');setReload(n=>n+1)}catch(e){if(latest.current===start)setActError(fieldReadError(e))}finally{actGuard.release();if(latest.current===start)setActBusy(false)}
 }
 const taskOpen=!!current&&!['CANCELLED','REVIEWED','REJECTED'].includes(String(current.task.status||'').toUpperCase())
 // Giao lại: loại Crew đang được giao khỏi danh sách; lịch sử Crew cũ vẫn giữ nguyên ở phần lịch sử bên dưới.
 const currentAssignee=current?.task.assignedToUserId||''
 const eligibleCrews=crews.filter(c=>c.id!==currentAssignee)
 const noOtherCrew=!!current&&act==='reassign'&&!!currentAssignee&&crewsLoaded&&eligibleCrews.length===0
 const scopeText=(current?.task.measurementScope||'').trim()
 return <section className="rounded-xl border border-slate-200 p-3 text-xs space-y-2">
  <header className="flex justify-between gap-2"><h3 className="font-bold">Hồ sơ nhiệm vụ từ máy chủ</h3><button type="button" onClick={()=>setReload(n=>n+1)} className="underline">Đọc lại hồ sơ</button></header>
  {error?<p role="alert" className="text-rose-700">{error}</p>:!current?<p role="status">Đang đọc nhiệm vụ, lịch sử và lần nộp gần nhất…</p>:<>
   <p className="break-all">Trạng thái: {current.task.status||'Chưa có trạng thái'} · Phiên bản: {current.task.version}</p>
   <p className="break-all">Defect: {current.task.defectId} · Tuyến: {current.task.routeVersionId}</p>
   <p>Loại đo yêu cầu: <strong>{measurementTypeLabel(current.task.requiredMeasurementType)}</strong></p>
   <p>Hạn xử lý: {current.task.dueAt||'Chưa có thời hạn'} · Người được giao: {current.task.assignedToUserId||'Chưa phân công'}</p>
   <p>{current.task.instructions||'Chưa có chỉ dẫn từ máy chủ.'}</p>
   {scopeText&&scopeText!=='{}'&&<p className="break-all">Phạm vi đo (lưu trong nhiệm vụ): {scopeText}</p>}
   <details><summary>Lịch sử phân công và xử lý ({current.history.events.length} sự kiện)</summary>
    {current.history.assignments.map(a=><p key={a.id} className="break-all">{a.assignedAt} · {a.assignedToUserId} · {a.reason||'Chưa có lý do'}</p>)}
    {current.history.events.map(e=><p key={e.id}>{e.occurredAt} · {e.kind} · {e.reason}</p>)}
   </details>
   {!current.submission?<p>Chưa có lần nộp trong dữ liệu nhiệm vụ.</p>:<>
    <p className="break-all">Lần nộp mới nhất: {current.submission.id} · Bản sửa {current.submission.revision} · nhận lúc {current.submission.serverReceivedAt}</p>
    <p className="break-all">Hash nội dung: {current.submission.contentHash||'Chưa có hash'} · Bằng chứng: {current.submission.evidence?.map(e=>e.fileId||'Chưa có fileId').join(', ')||'Chưa có bằng chứng trong response'}</p>
    <p className="text-slate-500">Số đo, ảnh, READY/INCOMPLETE của lần nộp này hiển thị ở khối “Số đo và bằng chứng của lần nộp mới nhất” bên dưới.</p>
   </>}
  </>}
  {role==='PROJECT_MANAGER'&&current&&(current.task.status?.toUpperCase()==='SUBMITTED'||held)&&<div className="border-t pt-3 space-y-2">
   <p className="font-semibold">PM thẩm định lần nộp hiện tại</p>
   <select aria-label="Quyết định review FIELD" disabled={reviewing||!!held} value={held?.body.decision||decision} onChange={e=>setDecision(e.target.value as FieldReviewInput['decision'])} className="rg-field w-full"><option value="">Chọn quyết định</option><option value="CONFIRM">Xác nhận kết quả đo</option><option value="NO_DEFECT">Kết quả FIELD không có lỗi</option><option value="SUPPLEMENT">Yêu cầu bổ sung</option></select>
   <textarea aria-label="Lý do review FIELD" rows={2} maxLength={2000} disabled={reviewing||!!held} value={held?.body.reason||reason} onChange={e=>setReason(e.target.value)} className="rg-field w-full" />
   {(reviewError||journalError)&&<p role="alert" className="text-rose-700">{reviewError||journalError}</p>}
   <button type="button" disabled={reviewing||!!journalError||!!held?.rejected||!held&&(!decision||!reason.trim())} onClick={()=>{void review()}} className="rg-btn">{held?.received?'Đọc lại kết quả review':held?'Đối chiếu đúng yêu cầu đang chờ':'Xác nhận review FIELD'}</button>
   <p>Review hoàn tất nhiệm vụ FIELD; không tự chuyển Defect sang VERIFIED.</p>
  </div>}
  {role==='PROJECT_MANAGER'&&current&&taskOpen&&(current.task.mode&&current.task.mode!=='MEASURE_ONLY'?<p className="border-t pt-3">Nhiệm vụ sửa chữa gắn với hạng mục: giao/giao lại ở màn Giao đội thi công hoặc Điều phối nhanh, không thao tác ở đây.</p>:<div className="border-t pt-3 space-y-2">
   <p className="font-semibold">PM giao lại hoặc hủy nhiệm vụ đo</p>
   <select aria-label="Thao tác nhiệm vụ" disabled={actBusy} value={act} onChange={e=>setAct(e.target.value as 'reassign'|'cancel')} className="rg-field w-full"><option value="reassign">{current.task.assignedToUserId?'Giao lại cho Crew khác':'Giao cho Crew'}</option><option value="cancel">Hủy nhiệm vụ</option></select>
   {act==='reassign'&&<select aria-label="Crew nhận việc" disabled={actBusy||noOtherCrew} value={actCrew} onChange={e=>setActCrew(e.target.value)} className="rg-field w-full"><option value="">{!crewsLoaded?'Đang tải Crew của dự án…':noOtherCrew?'Không có Crew khác để giao lại':'Chọn Crew nhận việc'}</option>{eligibleCrews.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>}
   {noOtherCrew&&<p role="alert" className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">Dự án chưa có Crew nào khác đang ACTIVE và còn hạn ngoài người đang được giao. Hãy thêm/gia hạn Crew trong dự án trước khi giao lại; lịch sử Crew hiện tại vẫn được giữ.</p>}
   {current.task.firstStartOriginId&&<><select aria-label="Phần việc đã thực hiện" disabled={actBusy} value={actPortion} onChange={e=>setActPortion(e.target.value as typeof actPortion)} className="rg-field w-full"><option value="NONE">Chưa làm gì</option><option value="PARTIAL">Đã làm một phần</option><option value="CAPTURED_INTAKE">Đã ghi nhận số liệu/nộp</option><option value="UNKNOWN">Không rõ</option></select>
   <textarea aria-label="Tóm tắt bàn giao" rows={2} maxLength={2000} disabled={actBusy} value={actSummary} onChange={e=>setActSummary(e.target.value)} placeholder="Tóm tắt phần việc đã làm để bàn giao" className="rg-field w-full" /></>}
   <textarea aria-label="Lý do thao tác nhiệm vụ" rows={2} maxLength={2000} disabled={actBusy} value={actReason} onChange={e=>setActReason(e.target.value)} placeholder="Lý do" className="rg-field w-full" />
   {actError&&<p role="alert" className="text-rose-700">{actError}</p>}
   <button type="button" disabled={actBusy||!actReason.trim()||(act==='reassign'&&(!actCrew||noOtherCrew))} onClick={()=>{void doAct()}} className="rg-btn">{actBusy?'Đang gửi…':act==='cancel'?'Xác nhận hủy nhiệm vụ':'Xác nhận giao việc'}</button>
  </div>)}
  {role==='PROJECT_MANAGER'&&current&&taskOpen&&(!current.task.mode||current.task.mode==='MEASURE_ONLY')&&<FieldTaskImpactPanel projectId={projectId} taskId={taskId} started={!!current.task.firstStartOriginId} onDone={()=>setReload(n=>n+1)} />}
 </section>
}
