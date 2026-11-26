import {apiClient} from '../client'
import {useAuthStore} from '../../store/authStore'
import {caseReportService,type CaseReportDetail,type CaseReportEvidence} from './caseReportService'
import {reportKeepNewCommands} from './reportKeepNewCommands'
import {fieldTaskReadService} from './fieldTaskReadService'
export interface ReuseSource {caseId:string;report:CaseReportDetail;evidence:CaseReportEvidence}
interface Body {fileId:string;sourceEvidenceId:string;sourceKind:'REPORTER';expectedChecksum:string;reason:string}
interface Receipt {id:string;taskId:string;fileId:string;sourceKind:string;fileChecksum:string;reason:string;occurredAt:string}
interface Intent {projectId:string;taskId:string;body:Body;proof:{caseId:string;reportId:string;fileVersion:string};version:string;key:string;received?:boolean;receipt?:Receipt}
const busy=new Set<string>(),journal=(p:string,t:string)=>`rg_field_reuse_${useAuthStore.getState().user?.id}_${p}_${t}`,reference=(p:string,t:string)=>`${journal(p,t)}_reference`
function actor(){const s=useAuthStore.getState();if(s.user?.role!=='PROJECT_MANAGER')throw new Error('Chỉ PM được phê duyệt tái sử dụng bằng chứng.');return `${s.authEpoch}:${s.user.id}`}
function active(s:string,signal?:AbortSignal){if(signal?.aborted||s!==actor())throw new Error('Phiên bằng chứng FIELD đã thay đổi.')}
export const fieldEvidenceReuseCommands={
 pending(project:string,task:string):Intent|null {const raw=sessionStorage.getItem(journal(project,task));if(!raw)return null;const c=JSON.parse(raw) as Intent;if(c.projectId!==project||c.taskId!==task||!c.key||!c.version||!c.body?.fileId||!c.proof?.reportId)throw new Error('Journal tái sử dụng sai phạm vi; giữ nguyên để đối chiếu.');return c},
 async sources(project:string,taskId:string,signal?:AbortSignal):Promise<ReuseSource[]> {
  const s=actor(),task=await fieldTaskReadService.detail(project,taskId,signal);active(s,signal)
  const refs=reportKeepNewCommands.references(project).filter(r=>r.defectId===task.defectId)
  if(!refs.length)throw new Error('Chưa có reference Report đã ghi nhận cho Defect này. Mở lại kết quả ghi nhận để đối chiếu nguồn; không dùng ảnh mẫu.')
  for(const ref of refs){const r=await reportKeepNewCommands.read(project,ref.sourceId,ref.decisionId,signal);active(s,signal);if(!r||r.defect.id!==task.defectId)throw new Error('Quyết định nguồn không khớp Defect của FIELD.')}
  const cases:Array<{id:string;reportIds:string[]}> = [],seen=new Set<string>();let cursor:string|undefined
  do{const {data}=await apiClient.get(`/cases`,{params:{projectId:project,pageSize:100,cursor},signal});active(s,signal)
   if(!Array.isArray(data?.items)||data.nextCursor!=null&&(typeof data.nextCursor!=='string'||!data.nextCursor))throw new Error('Danh mục Case sai contract.')
   for(const row of data.items){if(!row.id||row.projectId!==project||!Array.isArray(row.reportIds)||cases.some(c=>c.id===row.id))throw new Error('Case sai dự án/reference.');cases.push(row)}
   cursor=data.nextCursor||undefined;if(cursor&&seen.has(cursor))throw new Error('Cursor Case lặp.');if(cursor)seen.add(cursor)
  }while(cursor)
  const rows:ReuseSource[]=[]
  for(const c of cases.filter(c=>c.reportIds.some(id=>refs.some(r=>r.sourceId===id)))){
   const reports=await caseReportService.read(c.id,signal);active(s,signal)
   for(const report of reports.filter(r=>refs.some(ref=>ref.sourceId===r.reportId))){
    for(const evidence of [...report.originalEvidence,...report.supplements.flatMap(r=>r.evidence)]){
     if(!evidence.evidenceId||!evidence.fileId||!evidence.fileVersion||rows.some(r=>r.evidence.evidenceId===evidence.evidenceId))throw new Error('Bằng chứng nguồn thiếu hoặc trùng reference/version.')
     rows.push({caseId:c.id,report,evidence})
    }
   }
  }
  return rows
 },
 async image(source:ReuseSource,signal?:AbortSignal){
  const s=actor(),blob=await caseReportService.image(source.caseId,source.report.reportId,source.evidence,signal);active(s,signal)
  const bytes=await blob.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes);active(s,signal)
  return {blob,checksum:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')}
 },
 async readback(project:string,taskId:string,receipt:Receipt,body:Body){
  const s=actor(),task=await fieldTaskReadService.detail(project,taskId);active(s)
  const {data:file}=await apiClient.get(`/projects/${project}/field-inspection-tasks/${taskId}/evidence/${body.fileId}`);active(s)
  if(!receipt?.id||receipt.taskId!==taskId||receipt.fileId!==body.fileId||receipt.sourceKind!==body.sourceKind||receipt.fileChecksum!==body.expectedChecksum||receipt.reason!==body.reason||!receipt.occurredAt||file?.fileId!==body.fileId||file.state!=='VERIFIED'||file.checksum!==receipt.fileChecksum)throw new Error('Receipt/GET bằng chứng chưa khớp; không POST lại.')
  return {task,receipt,file}
 },
 // B7: đọc lại từ BE (FIELD history details.evidenceReuse, chỉ PM/Giám sát có details) — không dùng sessionStorage làm nguồn duy nhất, đúng sau F5/phiên mới.
 async result(project:string,task:string){
  actor();const history=await fieldTaskReadService.history(project,task)
  const rows=history.details?.evidenceReuse
  if(!history.details)throw new Error('Máy chủ không trả chi tiết lịch sử (details) cho tài khoản này; chưa đọc được quyết định tái sử dụng ảnh.')
  if(!rows?.length)return null
  const last=[...rows].sort((a,b)=>Date.parse(a.occurredAt)-Date.parse(b.occurredAt))[rows.length-1]
  const body:Body={fileId:last.fileId,sourceEvidenceId:last.sourceEvidenceId,sourceKind:last.sourceKind as 'REPORTER',expectedChecksum:last.fileChecksum,reason:last.reason}
  return this.readback(project,task,{id:last.id,taskId:task,fileId:last.fileId,sourceKind:last.sourceKind,fileChecksum:last.fileChecksum,reason:last.reason,occurredAt:last.occurredAt},body)
 },
 async request(project:string,taskId:string,source:ReuseSource|null,checksum:string,reason:string,version:string){
  const s=actor(),k=journal(project,taskId),held=this.pending(project,taskId)
  if(busy.has(k))throw new Error('Đang đối chiếu tái sử dụng bằng chứng.');busy.add(k)
  try{let c=held
   if(c){if(c.body.reason!==reason.trim()||c.version!==version||c.body.expectedChecksum!==checksum||source&&(c.body.sourceEvidenceId!==source.evidence.evidenceId||c.body.fileId!==source.evidence.fileId))throw new Error('Giữ nguyên input/body/key/version đang chờ.')}
   else{
    if(!source||!reason.trim()||reason.trim().length>2000||!/^[a-f0-9]{64}$/.test(checksum)||!version)throw new Error('Chọn bằng chứng thật và nhập căn cứ tối đa 2000 ký tự.')
    const task=await fieldTaskReadService.detail(project,taskId);active(s)
    if(task.version!==version||['COMPLETED','CANCELLED'].includes(String(task.status).toUpperCase()))throw new Error('Task đã đổi version hoặc kết thúc; đọc lại trước khi phê duyệt.')
    const rows=await this.sources(project,taskId);active(s)
    const row=rows.find(r=>r.caseId===source.caseId&&r.report.reportId===source.report.reportId&&r.evidence.evidenceId===source.evidence.evidenceId&&r.evidence.fileId===source.evidence.fileId&&r.evidence.fileVersion===source.evidence.fileVersion)
    if(!row)throw new Error('Nguồn Report/evidence/version đã thay đổi.')
    const image=await this.image(row);active(s);if(image.checksum!==checksum)throw new Error('Nội dung ảnh đã thay đổi; đọc lại trước khi phê duyệt.')
    c={projectId:project,taskId,body:{fileId:row.evidence.fileId,sourceEvidenceId:row.evidence.evidenceId,sourceKind:'REPORTER',expectedChecksum:checksum,reason:reason.trim()},proof:{caseId:row.caseId,reportId:row.report.reportId,fileVersion:row.evidence.fileVersion},version,key:crypto.randomUUID()};sessionStorage.setItem(k,JSON.stringify(c))
   }
   if(!c.received){const {data}=await apiClient.post(`/projects/${project}/field-inspection-tasks/${taskId}/evidence-reuse`,c.body,{headers:{'If-Match':`"${c.version}"`,'Idempotency-Key':c.key},transformRequest:[(body:unknown)=>{active(s);return JSON.stringify(body)}]});active(s);c.received=true;c.receipt=data;sessionStorage.setItem(k,JSON.stringify(c))}
   if(!c.receipt)throw new Error('Thiếu receipt; giữ journal để đối chiếu.')
   const result=await this.readback(project,taskId,c.receipt,c.body);active(s)
   sessionStorage.setItem(reference(project,taskId),JSON.stringify(c));sessionStorage.removeItem(k);return result
  }finally{busy.delete(k)}
 }
}
