import {createPortal} from 'react-dom'
import {PhotoLightboxModal} from '../../../components/common/PhotoLightboxModal'
import {businessText,businessDate,businessState,businessError} from '../../../utils/businessDisplay'
import {fieldReviewCommands,type FieldReviewInput} from '../../../api/services/fieldReviewCommands'
import React,{useEffect,useState,useRef} from 'react'
import {useAuthStore} from '../../../store/authStore'
import {fieldTaskReadService,fieldReadError} from '../../../api/services/fieldTaskReadService'
export function FieldTaskReadDetails({projectId,taskId,onReviewed,measurementTarget,imageTarget}:{projectId:string;taskId:string;onReviewed?:(task:Awaited<ReturnType<typeof fieldTaskReadService.detail>>)=>void;measurementTarget?:HTMLElement|null;imageTarget?:HTMLElement|null}){
 const epoch=useAuthStore(s=>s.authEpoch),scope=`${epoch}:${projectId}:${taskId}`
 const [data,setData]=useState<{scope:string;value:Awaited<ReturnType<typeof fieldTaskReadService.read>>}|null>(null),[error,setError]=useState(''),[reload,setReload]=useState(0)
 useEffect(()=>{const c=new AbortController();setData(null);setError('');fieldTaskReadService.read(projectId,taskId,c.signal).then(value=>{if(!c.signal.aborted)setData({scope,value})}).catch(e=>{if(!c.signal.aborted)setError(fieldReadError(e))});return()=>c.abort()},[scope,reload])
 const role=useAuthStore(s=>s.user?.role)
 const [decision,setDecision]=useState<FieldReviewInput['decision']|''>(''),[reason,setReason]=useState(''),[reviewError,setReviewError]=useState(''),[reviewing,setReviewing]=useState(false)
 const latest=useRef(scope);latest.current=scope
 useEffect(()=>{setDecision('');setReason('');setReviewError('');setReviewing(false)},[scope])
 let held:ReturnType<typeof fieldReviewCommands.pending>=null,journalError=''
 try{if(role==='PROJECT_MANAGER')held=fieldReviewCommands.pending(projectId,taskId)}catch(e){journalError=(e as Error).message}
 const review=async()=>{
  if(reviewing||!current||role!=='PROJECT_MANAGER')return
  const start=scope;setReviewing(true);setReviewError('')
  try{const input=held?.body||{submissionId:current.task.latestSubmissionId||'',decision:decision as FieldReviewInput['decision'],reason};const value=await fieldReviewCommands.request(projectId,taskId,input,held?.version||current.task.version||'');if(latest.current!==start)return;setData({scope:start,value});setDecision('');setReason('');onReviewed?.(value.task)}catch(e){if(latest.current===start)setReviewError(fieldReadError(e))}finally{if(latest.current===start)setReviewing(false)}
 }
 const [fileChoice,setFileChoice]=useState<{scope:string;id:string;checksum?:string|null}|null>(null),[photo,setPhoto]=useState<{scope:string;fileId:string;url:string;error:string;checksum:string}|null>(null)
 const selectedFile=fileChoice?.scope===scope?fileChoice:null
 useEffect(()=>{const c=new AbortController();let url='';setPhoto(null);if(selectedFile)fieldTaskReadService.evidenceImage(projectId,taskId,selectedFile.id,selectedFile.checksum,c.signal).then(result=>{if(c.signal.aborted)return;url=URL.createObjectURL(result.blob);setPhoto({scope,fileId:selectedFile.id,url,error:'',checksum:result.checksum})}).catch(e=>{if(!c.signal.aborted)setPhoto({scope,fileId:selectedFile!.id,url:'',error:fieldReadError(e),checksum:''})});return()=>{c.abort();if(url)URL.revokeObjectURL(url)}},[scope,selectedFile?.id,selectedFile?.checksum,reload])
 const currentPhoto=photo?.scope===scope&&photo.fileId===selectedFile?.id?photo:null
 const current=data?.scope===scope?data.value:null
 const [lightbox,setLightbox]=useState(false)
 useEffect(()=>{setLightbox(false)},[scope,selectedFile?.id])
 const place=(node:React.ReactNode,target?:HTMLElement|null)=>target?createPortal(node,target):node
 return <section className="rounded-xl border border-slate-200 p-3 text-xs space-y-2">
  <header className="flex justify-between gap-2"><h3 className="font-bold">Kết quả & lịch sử nhiệm vụ</h3><button type="button" onClick={()=>setReload(n=>n+1)} className="underline">Đọc lại hồ sơ</button></header>
  {error?<p role="alert" className="text-rose-700">{businessError(error)}</p>:!current?<p role="status">Đang đọc nhiệm vụ, lịch sử và lần nộp gần nhất…</p>:<>
   <p>Trạng thái: {businessState(current.task.status)}</p>

   <p>Hạn xử lý: {current.task.dueAt?businessDate(current.task.dueAt):'Chưa có thời hạn'}</p>
   <p>{current.task.instructions||'Chưa có chỉ dẫn từ máy chủ.'}</p>
   {current.task.measurementScope&&!current.task.measurementScope.trim().startsWith('{')&&<p>Phạm vi: {businessText(current.task.measurementScope)}</p>}
   <details><summary>Lịch sử phân công và xử lý ({current.history.events.length} sự kiện)</summary>
    {current.history.assignments.map(a=><p key={a.id} className="break-all">{businessDate(a.assignedAt)} · {businessText(a.reason,'Phân công nhiệm vụ')}</p>)}
    {current.history.events.map(e=><p key={e.id}>{businessDate(e.occurredAt)} · {businessState(e.kind)} · {businessText(e.reason)}</p>)}
   </details>
   {place(!current.submission?<p>Chưa có lần nộp trong dữ liệu nhiệm vụ.</p>:<>
    <p className="break-all">Lần nộp {current.submission.revision} · {businessState(current.submission.readiness)}</p>
    <p>{current.submission.missingReasons?.map(businessState).join('; ')}</p>
    <table className="w-full text-left"><thead><tr><th>Loại số đo</th><th>Giá trị</th><th>Trạng thái / lý do</th></tr></thead><tbody>{current.submission.measurements?.map((m,i)=><tr key={m.sampleId||i}><td>{businessState(m.type)}</td><td>{m.state!=='KNOWN'||m.value==null?'Chưa xác định số đo':`${m.value} ${m.unit||''}`}</td><td>{businessState(m.state)} · {m.unknownReason||m.notes||''}</td></tr>)}</tbody></table>

   </>,measurementTarget)}
   {place(<div className="space-y-2">
    <div className="flex flex-wrap gap-2">{current.submission?.evidence?.filter(e=>!!e.fileId).map((e,i)=><button type="button" key={e.captureOriginId} className="border rounded-lg p-2 break-all text-left" onClick={()=>{setFileChoice({scope,id:e.fileId!,checksum:e.checksumSha256});setLightbox(false)}}>Xem ảnh bằng chứng {i+1}</button>)}</div>
    {selectedFile&&!currentPhoto&&<p role="status">Đang đọc ảnh bằng chứng…</p>}
    {currentPhoto?.error&&<p role="alert" className="text-rose-700">{currentPhoto.error}</p>}
    {currentPhoto?.url&&<figure><img src={currentPhoto.url} alt="Ảnh bằng chứng FIELD được máy chủ cho phép đọc" onClick={()=>setLightbox(true)} className="max-h-72 max-w-full rounded-lg cursor-zoom-in" /><figcaption>Ảnh đã được đối chiếu với hồ sơ lưu.</figcaption></figure>}
    {!current.submission?.evidence?.length&&<p>Chưa có ảnh bằng chứng.</p>}
   </div>,imageTarget)}
  </>}
  {lightbox&&currentPhoto?.url&&<PhotoLightboxModal isOpen onClose={()=>setLightbox(false)} title="Ảnh bằng chứng nhiệm vụ" primaryPhotoUrl={currentPhoto.url} primaryPhotoLabel="Ảnh đã nộp" measuredValue={current?.submission?.measurements?.length===1&&current.submission.measurements[0].state==='KNOWN'?current.submission.measurements[0].value??undefined:undefined} unit={current?.submission?.measurements?.length===1?current.submission.measurements[0].unit??undefined:undefined} notes={current?.submission?.measurements?.find(m=>m.state==='UNKNOWN')?.unknownReason||undefined}/>}
  {role==='PROJECT_MANAGER'&&current&&(current.task.status?.toUpperCase()==='SUBMITTED'||held)&&<div className="border-t pt-3 space-y-2">
   <p className="font-semibold">PM thẩm định lần nộp hiện tại</p>
   <select aria-label="Quyết định review FIELD" disabled={reviewing||!!held} value={held?.body.decision||decision} onChange={e=>setDecision(e.target.value as FieldReviewInput['decision'])} className="w-full border rounded-lg p-2"><option value="">Chọn quyết định</option><option value="CONFIRM">Xác nhận kết quả đo</option><option value="NO_DEFECT">Kết quả FIELD không có lỗi</option><option value="SUPPLEMENT">Yêu cầu bổ sung</option></select>
   <textarea aria-label="Lý do review FIELD" rows={2} maxLength={2000} disabled={reviewing||!!held} value={held?.body.reason||reason} onChange={e=>setReason(e.target.value)} className="w-full border rounded-lg p-2" />
   {(reviewError||journalError)&&<p role="alert" className="text-rose-700">{businessError(reviewError||journalError)}</p>}
   <button type="button" disabled={reviewing||!!journalError||!!held?.rejected||!held&&(!decision||!reason.trim())} onClick={()=>{void review()}} className="border rounded-lg px-3 py-2">{held?.received?'Đọc lại kết quả review':held?'Đối chiếu đúng yêu cầu đang chờ':'Xác nhận review FIELD'}</button>
   <p>Review hoàn tất nhiệm vụ FIELD; không tự chuyển Defect sang VERIFIED.</p>
  </div>}
 </section>
}
