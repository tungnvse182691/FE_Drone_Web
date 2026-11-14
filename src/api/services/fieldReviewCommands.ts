import {apiClient} from '../client'
import {useAuthStore} from '../../store/authStore'
import {RoleCode} from '../../types/enums'
import {fieldTaskReadService} from './fieldTaskReadService'
export interface FieldReviewInput {submissionId:string;decision:'CONFIRM'|'NO_DEFECT'|'SUPPLEMENT';reason:string}
const busy=new Set<string>(),journal=(p:string,t:string)=>`rg_field_review_${useAuthStore.getState().user?.id}_${p}_${t}`
const quote=(v:string)=>v.startsWith('"')?v:`"${v}"`
export const fieldReviewCommands={
 pending(project:string,task:string){const raw=sessionStorage.getItem(journal(project,task));if(!raw)return null;const c=JSON.parse(raw);if(c.projectId!==project||c.taskId!==task||!c.key||!c.body?.submissionId||!['CONFIRM','NO_DEFECT','SUPPLEMENT'].includes(c.body.decision)||!c.body.reason?.trim()||!/^"[A-Za-z0-9+/]{11}="$/.test(c.version))throw new Error('Journal review FIELD sai contract.');return c as {projectId:string;taskId:string;key:string;version:string;body:FieldReviewInput;received?:boolean;rejected?:boolean;receipt?:{id:string;taskId:string;submissionId:string;decision:string}}},
 async request(project:string,taskId:string,body:FieldReviewInput,version:string){
  const state=useAuthStore.getState(),epoch=state.authEpoch
  if(state.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được review submission FIELD.')
  const active=()=>{const s=useAuthStore.getState();if(s.authEpoch!==epoch||s.user?.id!==state.user?.id||s.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Phiên review FIELD đã thay đổi.')}
  const k=journal(project,taskId),held=this.pending(project,taskId)
  if(!body.submissionId||!['CONFIRM','NO_DEFECT','SUPPLEMENT'].includes(body.decision)||!body.reason.trim()||body.reason.trim().length>2000||!/^"[A-Za-z0-9+/]{11}="$/.test(quote(version)))throw new Error('Chọn quyết định và nhập lý do tối đa 2.000 ký tự; cần submission/ETag thật.')
  const normalized={...body,reason:body.reason.trim()}
  if(held&&(JSON.stringify(held.body)!==JSON.stringify(normalized)||held.version!==quote(version)))throw new Error('Giữ nguyên key/body/version của review đang chờ.')
  if(held?.rejected)throw new Error('Review bị từ chối; giữ journal để đối chiếu, không tự gửi lại với key mới.')
  if(busy.has(k))throw new Error('Đang xử lý review FIELD.');busy.add(k)
  let c=held
  try{
   if(!c){const current=await fieldTaskReadService.read(project,taskId);active();if(current.task.status!=='SUBMITTED'||current.task.latestSubmissionId!==body.submissionId||quote(current.task.version||'')!==quote(version))throw new Error('Task/submission/ETag đã thay đổi; tải lại để đối chiếu.');if(body.decision!=='SUPPLEMENT'&&current.submission?.readiness!=='READY')throw new Error(`Submission chưa READY: ${current.submission?.missingReasons?.join('; ')||current.submission?.readiness||'chưa có readiness'}`);c={projectId:project,taskId,key:crypto.randomUUID(),body:normalized,version:quote(version)};sessionStorage.setItem(k,JSON.stringify(c))}
   if(!c.received){const r=await apiClient.post(`/projects/${project}/field-inspection-tasks/${taskId}/reviews`,c.body,{headers:{'Idempotency-Key':c.key,'If-Match':c.version},transformRequest:[(data:unknown)=>{active();return JSON.stringify(data)}]});active();c.received=true;c.receipt=r.data;sessionStorage.setItem(k,JSON.stringify(c))}
   if(!c.receipt?.id||c.receipt.taskId!==taskId||c.receipt.submissionId!==body.submissionId||c.receipt.decision!==body.decision)throw new Error('Receipt review sai reference; chỉ đọc lại, không POST mới.')
   const current=await fieldTaskReadService.read(project,taskId);active();const expected=body.decision==='SUPPLEMENT'?'SUPPLEMENT_REQUIRED':'COMPLETED';if(current.task.status!==expected||current.task.latestSubmissionId!==body.submissionId||quote(current.task.version||'')===c.version)throw new Error('Chưa GET xác nhận trạng thái/version sau review; giữ receipt để đọc lại.')
   sessionStorage.removeItem(k);return current
  }catch(e:any){active();if(c&&!held&&!c.received&&e.response?.status>=400&&e.response.status<500){c.rejected=true;sessionStorage.setItem(k,JSON.stringify(c))}throw e}finally{busy.delete(k)}
 }
}
