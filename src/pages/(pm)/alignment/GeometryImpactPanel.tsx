import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { geometryImpactService, type GeometryImpactView } from '../../../api/services/geometryImpactService'
import { geometryImpactCommands, type ImpactAction, type ImpactDecision } from '../../../api/services/geometryImpactCommands'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { readableTime, displayStatus } from './alignmentLabels'

const actions:Record<ImpactAction,string>={VERIFY:'Yêu cầu xác minh',CONTINUE:'Tiếp tục',STOP:'Dừng',REASSIGN:'Yêu cầu giao lại'}
export function GeometryImpactPanel() {
  const {id:project=''}=useParams<{id?:string}>(),[params,setParams]=useSearchParams(),actor=useAuthStore()
  const impactId=params.get('impactId')||'',section=params.get('roadSectionId')||''
  const scope=`${actor.authEpoch}:${actor.user?.id}:${project}:${section}:${impactId}`,live=useRef(scope);live.current=scope
  const [rows,setRows]=useState<GeometryImpactView[]>([]),[detail,setDetail]=useState<GeometryImpactView|null>(null)
  const [previous,setPrevious]=useState(''),[next,setNext]=useState(''),[reason,setReason]=useState(''),[task,setTask]=useState(''),[action,setAction]=useState<ImpactAction>('VERIFY')
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(0),[decision,setDecision]=useState<ImpactDecision|null>(null)
  const [held,setHeld]=useState<ReturnType<typeof geometryImpactCommands.pending>>(null)
  const running=useRef(false),pm=actor.user?.role===RoleCode.PROJECT_MANAGER
  const report=(e:any)=>setError(e?.response?`HTTP ${e.response.status}: ${e.response.data?.code||'unknown'}${e.response.data?.correlationId?` — ${e.response.data.correlationId}`:''}`:e.message)
  useEffect(()=>{
    let active=true
    setRows([]);setDetail(null);setDecision(null);setTask('');setReason('');setError('');setBusy(true)
    try{const pending=geometryImpactCommands.pending(project);setHeld(pending);if(pending?.intent.kind==='create'){setPrevious(pending.intent.body.previousRouteVersionId);setNext(pending.intent.body.newRouteVersionId)}if(pending)setReason(pending.intent.body.reason)}catch(e){report(e)}
    geometryImpactService.list(project).then(v=>{if(active)setRows(v)}).catch(e=>{if(active)report(e)}).finally(()=>{if(active&&!impactId)setBusy(false)})
    if(impactId)geometryImpactService.readImpact(project,impactId).then(v=>{if(active){setDetail(v);setDecision(geometryImpactCommands.result(project,impactId)?.decision||null)}}).catch(e=>{if(active)report(e)}).finally(()=>{if(active)setBusy(false)})
    return()=>{active=false}
  },[scope,reload])
  const execute=async(kind:'create'|'decision'|'retry'|'revise')=>{
    if(!pm||running.current)return
    const selected=scope;running.current=true;setBusy(true);setError('')
    try{
      if(kind==='revise'){await geometryImpactCommands.revise(project);if(live.current===selected){setHeld(null);setReload(n=>n+1)}return}
      const result=await geometryImpactCommands.run(project,kind==='retry'?undefined:kind==='create'?{kind:'create',sectionId:section,body:{previousRouteVersionId:previous.trim(),newRouteVersionId:next.trim(),reason:reason.trim()}}:{kind:'decision',impactId,body:{taskId:task,action,reason:reason.trim()}})
      if(live.current!==selected)return
      setDetail(result.impact);setDecision(result.decision||null);setHeld(null)
      setParams(current=>{const updated=new URLSearchParams(current);updated.set('impactId',result.impact.id);return updated})
      setRows(old=>[result.impact,...old.filter(r=>r.id!==result.impact.id)])
    }catch(e){if(live.current===selected){report(e);setHeld(geometryImpactCommands.pending(project))}}finally{running.current=false;if(live.current===selected)setBusy(false)}
  }
  const tasks=detail?.references?.filter(r=>['FIELD_TASK','SURVEY_TASK'].includes(r.kind||''))||[]
  return <section aria-label="Ảnh hưởng thay đổi tuyến" className="rounded-lg border p-3 space-y-2 text-xs">
    <h4 className="font-semibold">Ảnh hưởng thay đổi tuyến</h4>
    <p>Đánh giá và quyết định chỉ được ghi nhận. Không tự chuyển tham chiếu tuyến hoặc giao lại nhiệm vụ.</p>
    <button type="button" disabled={busy} onClick={()=>setReload(n=>n+1)} className="border rounded p-2">Đọc lại danh sách và chi tiết</button>
    {!busy&&!rows.length&&!error&&<p>Chưa có dữ liệu đánh giá ảnh hưởng trong cơ sở dữ liệu.</p>}
    <select aria-label="Đánh giá ảnh hưởng đã lưu" value={impactId} disabled={busy} onChange={e=>{setParams(current=>{const updated=new URLSearchParams(current);if(e.target.value)updated.set('impactId',e.target.value);else updated.delete('impactId');return updated})}} className="border rounded p-2 w-full"><option value="">Chọn đánh giá / đánh giá mới</option>{rows.map((r,i)=><option key={r.id} value={r.id}>Đánh giá {i+1} · {readableTime(r.recordedAt)}</option>)}</select>
    {pm&&!impactId&&<details><summary>Phiên bản tuyến nguồn · Chi tiết kỹ thuật</summary><label className="block">Mã phiên bản tuyến trước<input aria-label="Phiên bản tuyến trước" value={previous} disabled={busy||!!held} onChange={e=>setPrevious(e.target.value)} className="block border rounded p-2 w-full" /></label><label className="block">Mã phiên bản tuyến mới<input aria-label="Phiên bản tuyến mới" value={next} disabled={busy||!!held} onChange={e=>setNext(e.target.value)} className="block border rounded p-2 w-full" /></label><p>Chọn mã phiên bản đã có của cùng đoạn đường đang xem. Không tạo phiên bản tuyến tại đây.</p></details>}
    {detail&&<><p>{detail.references?.length||0} đối tượng bị ảnh hưởng</p>{detail.references?.map((r,i)=><p key={`${r.kind}:${r.id}`}>{({FIELD_TASK:'Nhiệm vụ hiện trường',SURVEY_TASK:'Nhiệm vụ khảo sát',DEFECT:'Khiếm khuyết',PAVEMENT_LAYOUT:'Cấu hình tấm'} as Record<string,string>)[r.kind||'']||'Đối tượng'} {i+1} · {r.readiness==='PINNED_REFERENCE'?'Đã gắn tham chiếu':displayStatus(r.readiness)}</p>)}</>}
    {pm&&detail&&<><select aria-label="Nhiệm vụ bị ảnh hưởng" value={task} disabled={busy||!!held} onChange={e=>setTask(e.target.value)} className="border rounded p-2 w-full"><option value="">Chọn nhiệm vụ</option>{tasks.map((r,i)=><option key={r.id} value={r.id}>{r.kind==='FIELD_TASK'?'Hiện trường':'Khảo sát'} {i+1}</option>)}</select><select aria-label="Quyết định ảnh hưởng" value={action} disabled={busy||!!held} onChange={e=>setAction(e.target.value as ImpactAction)} className="border rounded p-2 w-full">{Object.entries(actions).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>{!tasks.length&&<p>Không có nhiệm vụ thuộc phạm vi cho phép ghi quyết định.</p>}</>}
    {pm&&<><label className="block">Lý do<input aria-label="Lý do đánh giá ảnh hưởng" value={reason} disabled={busy||!!held} onChange={e=>setReason(e.target.value)} className="block border rounded p-2 w-full" /></label>{!held&&<button type="button" disabled={busy||!reason.trim()||(impactId?!detail||!task:!section||!previous.trim()||!next.trim()||previous.trim()===next.trim())} onClick={()=>void execute(impactId?'decision':'create')} className="border rounded p-2">{impactId?'Ghi nhận quyết định':'Tạo đánh giá ảnh hưởng'}</button>}{held&&<><button type="button" disabled={busy||held.rejected} onClick={()=>void execute('retry')} className="border rounded p-2">{held.receipt?'Đọc lại kết quả':'Gửi lại đúng yêu cầu đang chờ'}</button>{held.rejected&&<button type="button" disabled={busy} onClick={()=>void execute('revise')} className="border rounded p-2">Đối chiếu và sửa yêu cầu bị từ chối</button>}</>}</>}
    {decision&&<p role="status">Đã ghi nhận: {actions[decision.action]}. Việc thực hiện thay đổi được xử lý riêng.</p>}
    <details><summary>Chi tiết kỹ thuật</summary><pre className="max-h-48 overflow-auto whitespace-pre-wrap">{JSON.stringify({impactId,section,detail,decision,pending:held},null,2)}</pre></details>
    {busy&&<p role="status">Đang đọc hoặc ghi nhận kết quả…</p>}
    {error&&<><p role="alert">Không thể hoàn tất yêu cầu; giữ bản nhập và kết quả để đối chiếu.</p><details><summary>Chi tiết kỹ thuật</summary><p>{error}</p></details></>}
  </section>
}
