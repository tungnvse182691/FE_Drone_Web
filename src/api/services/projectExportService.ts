import {apiClient} from '../client'
import {useAuthStore} from '../../store/authStore'
export interface ExportJob {id:string;projectId:string;kind:string;format:string;status:string;createdAt:string;completedAt?:string|null;expiresAt?:string|null;errorCode?:string|null;completeness?:string|null;missingSections?:string[]|null;version:string;snapshotId?:string;snapshotHash?:string;artifactId?:string|null}
export interface ExportManifest {schemaVersion:string;snapshotId:string;projectId:string;kind:string;format:string;snapshotHash:string;createdAt:string;snapshotAt:string;requestedBy:string;filters:ExportInput;files:Array<{fileId:string;fileVersion:string;sha256:string;sizeBytes:number;mediaType:string;archivePath:string|null;included:boolean;reasonCode:string|null}>;sections:Array<{[key:string]:unknown}>;sourceRevisions:Array<{[key:string]:unknown}>;definitionVersions:string[];labels:Array<{[key:string]:unknown}>}
export interface ExportInput {kind:'DOSSIER';format:'PDF'|'ZIP';includeOriginalFiles:boolean;from?:string;to?:string}
interface Intent {projectId:string;body:ExportInput;key:string;received?:boolean;receipt?:ExportJob;rejected?:{status:number;code:string;correlationId?:string}}
function actor(){const s=useAuthStore.getState();if(!s.user||!['PROJECT_MANAGER','SUPERVISOR'].includes(s.user.role))throw new Error('Chưa có quyền PM/Giám sát xuất hồ sơ.');return `${s.authEpoch}:${s.user.id}:${s.user.role}`}
function active(s:string,signal?:AbortSignal){if(signal?.aborted||s!==actor())throw new Error('Phiên xuất hồ sơ đã thay đổi.')}
function job(row:ExportJob,p:string,id?:string){if(!row?.id||id&&row.id!==id||row.projectId!==p||!['DOSSIER','TRAINING'].includes(row.kind)||!['PDF','ZIP'].includes(row.format)||!['QUEUED','RUNNING','SUCCEEDED','FAILED'].includes(row.status)||!row.version||!Number.isFinite(Date.parse(row.createdAt)))throw new Error('Export sai project/reference/status/version.');return row}
const key=(p:string)=>`rg_export_${useAuthStore.getState().user?.id}_${p}`,busy=new Set<string>()
export function exportPeriod(from:string,to:string){
 if(!from&&!to)return {}
 if(!from||!to)throw new Error('Nhập cả Từ và Đến, hoặc bỏ trống cả hai mốc thời gian.')
 const start=new Date(from),end=new Date(to)
 if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||start>=end)throw new Error('Khoảng thời gian không hợp lệ: Từ phải trước Đến.')
 return {from:start.toISOString(),to:end.toISOString()}
}
export function exportError(e:any){const d=e?.response?.data;return e?.response?`HTTP ${e.response.status} ${d?.code||d?.title||e.message}${d?.correlationId?` · ${d.correlationId}`:''}`:e.message}
export const projectExportService={
 pending(p:string):Intent|null {actor();const raw=sessionStorage.getItem(key(p));if(!raw)return null;const c=JSON.parse(raw) as Intent;if(c.projectId!==p||!c.key||!c.body?.kind)throw new Error('Journal export sai phạm vi; giữ nguyên để đối chiếu.');return c.rejected&&!c.received?null:c},
 async list(p:string,signal?:AbortSignal){const s=actor(),rows:ExportJob[]=[],seen=new Set<string>();let cursor:string|undefined
  do{const {data}=await apiClient.get(`/projects/${p}/exports`,{params:{limit:100,cursor},signal});active(s,signal);if(!Array.isArray(data?.items)||data.nextCursor!=null&&(typeof data.nextCursor!=='string'||!data.nextCursor))throw new Error('Danh mục export sai contract; không coi là rỗng.')
   for(const r of data.items){job(r,p);if(rows.some(x=>x.id===r.id))throw new Error('Export trùng reference giữa các trang.');rows.push(r)}cursor=data.nextCursor||undefined;if(cursor&&seen.has(cursor))throw new Error('Cursor export lặp.');if(cursor)seen.add(cursor)
  }while(cursor);return rows
 },
 async detail(p:string,id:string,signal?:AbortSignal){const s=actor(),r=await apiClient.get<ExportJob>(`/projects/${p}/exports/${id}`,{signal});active(s,signal);const row=job(r.data,p,id);if(!row.snapshotId||!row.snapshotHash||r.headers?.etag!==`"${row.version}"`)throw new Error('Export thiếu snapshot/hash/ETag.');return row},
 async manifest(p:string,id:string,signal?:AbortSignal){const s=actor(),detail=await this.detail(p,id,signal);const {data,headers}=await apiClient.get<ExportManifest>(`/projects/${p}/exports/${id}/manifest`,{signal});active(s,signal)
  if(data?.schemaVersion!=='anh02.export.v1'||data.projectId!==p||data.snapshotId!==detail.snapshotId||data.snapshotHash!==detail.snapshotHash||data.kind!==detail.kind||data.format!==detail.format||headers?.etag!==`"${data.snapshotHash}"`||!Array.isArray(data.files)||!Array.isArray(data.sections)||!Array.isArray(data.sourceRevisions))throw new Error('Manifest không khớp snapshot/hash của export.')
  return {detail,manifest:data}
 },
 async content(p:string,id:string){const s=actor(),{detail,manifest}=await this.manifest(p,id);active(s);if(detail.status!=='SUCCEEDED')throw new Error('Export chưa hoàn tất; chỉ đọc lại trạng thái, không tự retry.');if(!detail.expiresAt||!Number.isFinite(Date.parse(detail.expiresAt))||Date.parse(detail.expiresAt)<=Date.now())throw new Error('Export đã hết hạn hoặc thiếu hạn tải.');let r
  try{r=await apiClient.get<Blob>(`/projects/${p}/exports/${id}/content`,{responseType:'blob'})}catch(e:any){if(e.response?.data?.type?.includes('json')){try{e.response.data=JSON.parse(await e.response.data.text())}catch{/* Retain binary ProblemDetails. */}}throw e}active(s)
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await r.data.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');active(s)
  const expectedType=detail.format==='PDF'?'application/pdf':'application/zip';if(r.data.type.split(';')[0]!==expectedType||r.headers?.etag!==`"${digest}"`)throw new Error('Nội dung tải không khớp mediaType/checksum từ máy chủ.')
  return {blob:r.data,fileName:`${detail.id}.${detail.format.toLowerCase()}`,checksum:digest,manifest}
 },
 async create(p:string,input:ExportInput,signal?:AbortSignal){const s=actor(),k=key(p),held=this.pending(p)
  if(held&&JSON.stringify(held.body)!==JSON.stringify(input))throw new Error('Giữ nguyên body/key export đang chờ.')
  if(!held)exportPeriod(input.from||'',input.to||'')
  if(!p||p==='ALL'||input.kind!=='DOSSIER'||!['PDF','ZIP'].includes(input.format)||typeof input.includeOriginalFiles!=='boolean'||input.format==='PDF'&&input.includeOriginalFiles||input.to&&!Number.isFinite(Date.parse(input.to)))throw new Error('Chọn dự án, định dạng PDF/ZIP; PDF không kèm tệp gốc.')
  if(busy.has(k))throw new Error('Đang đối chiếu yêu cầu xuất hồ sơ.');busy.add(k)
  try{let c=held
   if(!c){await this.list(p,signal);active(s,signal);c={projectId:p,body:JSON.parse(JSON.stringify(input)),key:crypto.randomUUID()};sessionStorage.setItem(k,JSON.stringify(c))}
   if(!c.received){try{const r=await apiClient.post(`/projects/${p}/exports`,c.body,{signal,headers:{'Idempotency-Key':c.key},transformRequest:[(b:unknown)=>{active(s,signal);return JSON.stringify(b)}]});active(s,signal);c.received=true;c.receipt=r.data;sessionStorage.setItem(k,JSON.stringify(c))}catch(e:any){
    const status=e?.response?.status,code=e?.response?.data?.code
    // Only the first attempt with a definite validation rejection unlocks editing.
    // A journal restored from storage may have timed out: never replace its identity.
    if(!held&&status===422&&['validation_error','export_invalid'].includes(code)){c.rejected={status,code,correlationId:e.response.data.correlationId||e.response.headers?.['x-correlation-id']};sessionStorage.setItem(k,JSON.stringify(c))}
    throw e
   }}
   const receipt=c.receipt;if(!receipt)throw new Error('Thiếu receipt export; giữ journal.');job(receipt,p)
   if(receipt.kind!==c.body.kind||receipt.format!==c.body.format||!receipt.snapshotId||!receipt.snapshotHash)throw new Error('Receipt export sai request/snapshot; giữ journal để GET đối chiếu.')
   const result=await this.detail(p,receipt.id);active(s,signal);if(result.snapshotId!==receipt.snapshotId||result.snapshotHash!==receipt.snapshotHash||result.kind!==receipt.kind||result.format!==receipt.format)throw new Error('GET export chưa khớp receipt; không POST mới.')
   sessionStorage.removeItem(k);return result
  }finally{busy.delete(k)}
 }
}
