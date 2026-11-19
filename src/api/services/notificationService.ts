import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
export interface NotificationDto {id:string;message?:string|null;resourceId?:string|null;read:boolean;occurredAt:string;version?:string|null;priority?:string|null;priorityPolicy?:string|null;priorityReasonCode?:string|null;priorityEvaluatedAt?:string|null}
export interface NotificationScopeDto {title?:string|null;senderKind?:string|null;deadlines?:Array<{clockId?:string|null;dueAt?:string|null;completedAt?:string|null}>|null;notificationId:string;projectId?:string|null;occurrenceId?:string|null;classification?:string|null;sourceKind?:string|null;sourceId:string;eventType?:string|null;resolverVersion?:string|null}
const busy=new Set<string>()
function actorScope(){const s=useAuthStore.getState();if(!s.user||![RoleCode.PROJECT_MANAGER,RoleCode.SUPERVISOR].includes(s.user.role))throw new Error('Chưa có phiên PM/Giám sát để đọc thông báo.');return `${s.authEpoch}:${s.user.id}:${s.user.role}`}
function active(scope:string,signal?:AbortSignal){if(signal?.aborted||scope!==actorScope())throw new Error('Phiên đọc thông báo đã thay đổi.')}
function validate(n:NotificationDto){if(!n?.id||typeof n.read!=='boolean'||!n.occurredAt||!n.version)throw new Error('Thông báo thiếu ID/trạng thái/phiên bản từ máy chủ.');return n}
function etag(v:string){const t=v.startsWith('"')?v:`"${v}"`;if(!/^"[A-Za-z0-9+/]{11}="$/.test(t))throw new Error('ETag thông báo không hợp lệ.');return t}
export const notificationService={
 /** POST /notifications/read-batch — đánh dấu đã đọc theo lô (≤100/lô), cùng snapshotVersion + through, key mới mỗi lô; atomic từng lô. */
 async markAllRead(onBatch?:(updated:number)=>void):Promise<number>{
  const scope=actorScope(),through=new Date().toISOString();let snapshotVersion:string|null=null,total=0,guard=0
  while(guard++<200){
   const {data}:{data:{updated:number;hasMore:boolean;through:string;snapshotVersion?:string|null}}=await apiClient.post('/notifications/read-batch',{through,limit:100,snapshotVersion},{headers:{'Idempotency-Key':crypto.randomUUID()}});active(scope)
   if(!Number.isInteger(data?.updated)||typeof data.hasMore!=='boolean')throw new Error('Phản hồi đọc theo lô sai contract.')
   total+=data.updated;snapshotVersion=data.snapshotVersion||snapshotVersion;onBatch?.(total)
   if(!data.hasMore)return total
  }
  throw new Error('Quá nhiều lô đọc thông báo; dừng để tránh vòng lặp.')
 },
 async list(signal?:AbortSignal):Promise<NotificationDto[]>{
  const scope=actorScope(),rows:NotificationDto[]=[],seen=new Set<string>();let cursor:string|undefined
  do{const {data}=await apiClient.get('/notifications',{params:{limit:100,cursor},signal});active(scope,signal)
   if(!Array.isArray(data?.items)||data.nextCursor!=null&&(typeof data.nextCursor!=='string'||!data.nextCursor))throw new Error('Danh sách thông báo sai contract.')
   for(const n of data.items){validate(n);if(rows.some(r=>r.id===n.id))throw new Error('Thông báo bị trùng giữa các trang.');rows.push(n)}
   cursor=data.nextCursor||undefined;if(cursor&&seen.has(cursor))throw new Error('Cursor thông báo lặp.');if(cursor)seen.add(cursor)
  }while(cursor);return rows
 },
 async detail(id:string,signal?:AbortSignal){const scope=actorScope(),r=await apiClient.get<NotificationDto>(`/notifications/${id}`,{signal});active(scope,signal);validate(r.data);if(r.data.id!==id||r.headers?.etag!==etag(r.data.version!))throw new Error('Chi tiết thông báo sai ID/ETag.');return r.data},
 async scope(id:string,signal?:AbortSignal):Promise<NotificationScopeDto>{const scope=actorScope(),{data}=await apiClient.get<NotificationScopeDto>(`/notifications/${id}/scope`,{signal});active(scope,signal);if(data?.notificationId!==id||!data.sourceId)throw new Error('Phạm vi thông báo sai reference.');return data},
 async markRead(id:string,version:string){
  const scope=actorScope(),actor=useAuthStore.getState().user!,journal=`rg_notification_read_${actor.id}_${id}`
  if(busy.has(journal))throw new Error('Đang cập nhật thông báo.');busy.add(journal)
  try{const raw=sessionStorage.getItem(journal),held=raw?JSON.parse(raw):null
   if(held?.rejected)throw new Error('Lệnh bị từ chối; đọc lại thông báo để đối chiếu trước khi tiếp tục.')
   let c=held
   if(!c){const current=await this.detail(id);active(scope);if(current.read)return current;if(etag(current.version!)!==etag(version))throw new Error('Thông báo đã đổi phiên bản; tải lại trước khi đánh dấu đọc.');c={key:crypto.randomUUID(),version:etag(version)};sessionStorage.setItem(journal,JSON.stringify(c))}
   if(!c.received){try{const r=await apiClient.post<NotificationDto>(`/notifications/${id}/read`,undefined,{headers:{'Idempotency-Key':c.key,'If-Match':c.version},transformRequest:[()=>{active(scope);return undefined}]});active(scope);c.received=true;c.receipt=r.data;sessionStorage.setItem(journal,JSON.stringify(c))}catch(e:any){active(scope);if(!held&&e.response?.status>=400&&e.response.status<500){c.rejected=true;sessionStorage.setItem(journal,JSON.stringify(c))}throw e}}
   const current=await this.detail(id);active(scope);if(!c.receipt||c.receipt.id!==id||c.receipt.read!==true||!current.read)throw new Error('Chưa GET xác nhận thông báo đã đọc; giữ yêu cầu để đối chiếu.');sessionStorage.removeItem(journal);return current
  }finally{busy.delete(journal)}
 }
}

export function notificationError(e:any){return e?.response?`HTTP ${e.response.status} · ${e.response.data?.code||e.response.data?.title||'Lỗi thông báo'}${e.response.data?.correlationId?` · Mã đối chiếu ${e.response.data.correlationId}`:''}`:e?.message||'Không đọc được thông báo.'}
