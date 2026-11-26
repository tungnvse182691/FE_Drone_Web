import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
export interface FieldTaskDetail {id:string;projectId:string;defectId:string;routeVersionId:string;segmentSetId?:string|null;crsProfileRevisionId?:string|null;status?:string|null;version?:string|null;assignedToUserId?:string|null;latestSubmissionId?:string|null;instructions?:string|null;measurementScope?:string|null;requiredMeasurementType:number;dueAt?:string|null;firstStartOriginId?:string|null;mode?:string|null;purpose?:string|null}
export interface FieldMeasurement {sampleId?:string|null;type?:string|null;value?:number|null;state?:string|null;unknownReason?:string|null;dimension?:string|null;unit?:string|null;instrument?:string|null;method?:string|null;notes?:string|null}
export interface FieldSubmission {id:string;taskId:string;revision:number;serverReceivedAt:string;readiness?:string|null;missingReasons?:string[]|null;contentHash?:string|null;measurements?:FieldMeasurement[]|null;evidence?:Array<{fileId?:string|null;captureOriginId:string;purpose?:string|null;checksumSha256?:string|null}>|null}
export interface FieldHistory {assignments:Array<{id:string;assignedToUserId:string;assignedAt:string;endedAt:string|null;status:number;reason:string|null}>;events:Array<{id:string;kind:string;actorId:string;reason:string;occurredAt:string;factsJson:string}>}
function scope(){const s=useAuthStore.getState();if(!s.user||![RoleCode.PROJECT_MANAGER,RoleCode.SUPERVISOR].includes(s.user.role))throw new Error('Chưa có quyền PM/Giám sát đọc FIELD.');return `${s.authEpoch}:${s.user.id}:${s.user.role}`}
function active(s:string,signal?:AbortSignal){if(signal?.aborted||s!==scope())throw new Error('Phiên đọc nhiệm vụ đã thay đổi.')}
const etag=(v:string)=>v.startsWith('"')?v:`"${v}"`
export const fieldTaskReadService={
 async evidenceImage(projectId:string,taskId:string,fileId:string,checksum?:string|null,signal?:AbortSignal){
  const s=scope(),root=`/projects/${projectId}/field-inspection-tasks/${taskId}/evidence/${fileId}`
  const {data:file}=await apiClient.get(root,{signal});active(s,signal)
  if(file?.fileId!==fileId||file.state!=='VERIFIED'||!file.checksum||checksum&&file.checksum!==checksum)throw new Error('Ảnh FIELD chưa VERIFIED hoặc checksum/reference đã thay đổi.')
  let r
  try{r=await apiClient.get<Blob>(`${root}/content`,{signal,responseType:'blob'})}catch(e:any){if(e.response?.data?.type?.includes('json')){try{e.response.data=JSON.parse(await e.response.data.text())}catch{/* Preserve original binary ProblemDetails on decode failure. */}}throw e}
  active(s,signal)
  const type=r.data.type.split(';')[0],expected=String(file.mediaType||'').split(';')[0]
  if(!['image/jpeg','image/png','image/webp'].includes(type)||type!==expected||r.data.size!==file.sizeBytes)throw new Error('Nội dung FIELD không phải ảnh hợp lệ hoặc sai kích thước/mediaType.')
  return{blob:r.data,checksum:file.checksum as string}
 },
 async detail(projectId:string,taskId:string,signal?:AbortSignal):Promise<FieldTaskDetail>{const s=scope(),r=await apiClient.get<FieldTaskDetail>(`/projects/${projectId}/field-inspection-tasks/${taskId}`,{signal});active(s,signal);if(r.data?.id!==taskId||r.data.projectId!==projectId||!r.data.version||r.headers?.etag!==etag(r.data.version))throw new Error('GET nhiệm vụ sai task/project/version/ETag.');return r.data},
 async history(projectId:string,taskId:string,signal?:AbortSignal):Promise<FieldHistory>{const s=scope(),{data}=await apiClient.get<FieldHistory>(`/projects/${projectId}/field-inspection-tasks/${taskId}/history`,{signal});active(s,signal);if(!Array.isArray(data?.assignments)||!Array.isArray(data?.events))throw new Error('Lịch sử FIELD thiếu assignments/events.');return data},
 async submission(projectId:string,taskId:string,submissionId:string,signal?:AbortSignal):Promise<FieldSubmission>{const s=scope(),{data}=await apiClient.get<FieldSubmission>(`/projects/${projectId}/field-inspection-tasks/${taskId}/submissions/${submissionId}`,{signal});active(s,signal);if(data?.id!==submissionId||data.taskId!==taskId||data.measurements!=null&&!Array.isArray(data.measurements)||data.evidence!=null&&!Array.isArray(data.evidence))throw new Error('Submission sai nhiệm vụ/reference/số đo.');return {...data,measurements:data.measurements||[],evidence:data.evidence||[]}},
 async read(projectId:string,taskId:string,signal?:AbortSignal){const task=await this.detail(projectId,taskId,signal),history=await this.history(projectId,taskId,signal);const submission=task.latestSubmissionId?await this.submission(projectId,taskId,task.latestSubmissionId,signal):null;return{task,history,submission}}
}
export function fieldReadError(e:any){return e?.response?`HTTP ${e.response.status} · ${e.response.data?.code||e.response.data?.title||'Lỗi FIELD'}${e.response.data?.correlationId?` · Mã đối chiếu ${e.response.data.correlationId}`:''}`:e?.message||'Không tải được hồ sơ FIELD.'}
