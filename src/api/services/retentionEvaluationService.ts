import {apiClient} from '../client'
import {useAuthStore} from '../../store/authStore'
import {workflowCollection} from './workflowCollection'
export interface RetentionSummary {id:string;projectId:string;status:string;createdAt:string;evaluatedAt?:string|null;version:string}
export interface RetentionItem {fileId:string;eligibility:string;reasonCodes:string[];eligibleAfter?:string|null;isCurrent:boolean}
export interface RetentionEvaluation extends RetentionSummary {items:RetentionItem[];nextCursor:string|null}
interface Intent {key:string;body:Record<string,never>;receipt?:RetentionSummary;received?:boolean;uncertain?:boolean}
const busy=new Set<string>()
function context(project:string){const s=useAuthStore.getState();if(!s.isAuthenticated||!s.user||!['PROJECT_MANAGER','SUPERVISOR'].includes(s.user.role)||!project)throw Error('Chọn dự án trong phiên PM hoặc Giám sát.');const identity=`${s.authEpoch}:${s.user.id}:${s.user.role}`;return {key:`rg_retention_evaluation_${s.user.id}_${s.user.role}_${project}`,active:()=>{const c=useAuthStore.getState();if(identity!==`${c.authEpoch}:${c.user?.id}:${c.user?.role}`||!c.isAuthenticated)throw Error('Phiên lưu trữ đã thay đổi.')}}}
export const retentionEvaluationService={
 pending(project:string):Intent|null {const c=context(project),raw=localStorage.getItem(c.key);if(!raw)return null;const value=JSON.parse(raw);if(!value.key||JSON.stringify(value.body)!=='{}')throw Error('Yêu cầu đánh giá đang chờ chưa hợp lệ; giữ nguyên để đối chiếu.');return value},
 async list(project:string,signal?:AbortSignal){return workflowCollection<RetentionSummary>(`/projects/${project}/retention/evaluations`,project,signal)},
 async read(project:string,id:string,signal?:AbortSignal):Promise<RetentionEvaluation>{
  const c=context(project),items:RetentionItem[]=[],seen=new Set<string>();let cursor:string|undefined,head:RetentionEvaluation|undefined
  do{const r=await apiClient.get<RetentionEvaluation>(`/projects/${project}/retention/evaluations/${id}`,{params:{pageSize:100,cursor},signal});c.active();if(signal?.aborted)throw Error('Đã hủy đọc hồ sơ.');const d=r.data
   if(d.id!==id||d.projectId!==project||!d.version||r.headers.etag!==`"${d.version}"`||!Array.isArray(d.items)||d.nextCursor!=null&&typeof d.nextCursor!=='string'||head&&head.version!==d.version)throw Error('Kết quả đánh giá thay đổi hoặc không khớp hồ sơ; đọc lại kết quả.')
   head=d;for(const item of d.items){if(!item.fileId||items.some(i=>i.fileId===item.fileId)||!Array.isArray(item.reasonCodes)||typeof item.isCurrent!=='boolean')throw Error('Kết quả tệp chưa hợp lệ.');items.push(item)}
   cursor=d.nextCursor||undefined;if(cursor&&seen.has(cursor))throw Error('Phân trang kết quả bị lặp.');if(cursor)seen.add(cursor)
  }while(cursor)
  return {...head!,items,nextCursor:null}
 },
 async request(project:string):Promise<RetentionEvaluation>{const c=context(project);if(busy.has(c.key))throw Error('Đang đối chiếu yêu cầu.');busy.add(c.key);let intent:Intent|null=null;const save=()=>localStorage.setItem(c.key,JSON.stringify(intent))
  try{intent=this.pending(project);if(!intent){intent={key:crypto.randomUUID(),body:{}};save()}
   if(!intent.received&&!intent.receipt){try{const r=await apiClient.post<RetentionSummary>(`/projects/${project}/retention/evaluations`,intent.body,{headers:{'Idempotency-Key':intent.key}});c.active();intent.received=true;intent.receipt=r.data;save();if(!r.data?.id||r.data.projectId!==project||!r.data.version)throw Error('Biên nhận chưa khớp dự án; giữ nguyên yêu cầu để đối chiếu.')}catch(e:any){if(!e.response||e.response.status>=500||e.response.status===408){intent.uncertain=true;save()}else if(!intent.uncertain&&!intent.received&&!intent.receipt)localStorage.removeItem(c.key);throw e}}
   if(!intent.receipt?.id||intent.receipt.projectId!==project)throw Error('Biên nhận chưa đủ tham chiếu; giữ nguyên yêu cầu, chưa thể đọc kết quả.')
   const read=await this.read(project,intent.receipt.id);c.active();localStorage.removeItem(c.key);return read
  }finally{busy.delete(c.key)}
 }
}
