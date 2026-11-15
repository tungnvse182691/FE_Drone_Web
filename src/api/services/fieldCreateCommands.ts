import {apiClient} from '../client'
import {useAuthStore} from '../../store/authStore'
import {RoleCode} from '../../types/enums'
import {projectService} from './projectService'
import {reportKeepNewCommands} from './reportKeepNewCommands'
import {triageGeometryService,type TriageGeometryPins} from './triageGeometryService'
import {fieldTaskReadService,type FieldTaskDetail} from './fieldTaskReadService'
export interface FieldDefectOption {id:string;code:string;project_id:string;defect_type:string;status:string;version:string;route_version_id:string}
export interface FieldCreateChoice {defectId:string;defectVersion:string;assignedToUserId:string;requiredMeasurementType:number;measurementScope:string;instructions:string;dueAt:string;routeVersionId?:string;pins?:TriageGeometryPins}
interface Intent {projectId:string;input:FieldCreateChoice;body:{defectId:string;defectVersion:string;routeVersionId:string;segmentSetId?:string;crsProfileRevisionId?:string|null;purpose:string;requiredMeasurementType:number;measurementScope:string;instructions:string;assignedToUserId:string;dueAt:string;sourceKind:string};key:string;received?:boolean;receipt?:FieldTaskDetail}
const busy=new Set<string>(),journal=(p:string)=>`rg_field_create_${useAuthStore.getState().user?.id}_${p}`
function actor(){const s=useAuthStore.getState();if(s.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được tạo FIELD từ Defect đã ghi nhận.');return `${s.authEpoch}:${s.user.id}`}
function active(s:string,signal?:AbortSignal){if(signal?.aborted||s!==actor())throw new Error('Phiên tạo FIELD đã thay đổi.')}
export const fieldCreateCommands={
 pending(project:string):Intent|null {const raw=sessionStorage.getItem(journal(project));if(!raw)return null;const c=JSON.parse(raw) as Intent;if(c.projectId!==project||!c.key||!c.input?.defectId||!c.body?.defectVersion||c.body.defectId!==c.input.defectId)throw new Error('Journal tạo FIELD sai phạm vi.');return c},
 async defects(project:string,signal?:AbortSignal):Promise<FieldDefectOption[]>{const s=actor(),rows:FieldDefectOption[]=[],seen=new Set<string>();let cursor:string|undefined
  do{const {data}=await apiClient.get(`/projects/${project}/defects`,{params:{pageSize:100,cursor},signal});active(s,signal);if(!Array.isArray(data?.items)||data.nextCursor!=null&&(typeof data.nextCursor!=='string'||!data.nextCursor))throw new Error('Danh mục Defect sai contract.');for(const d of data.items){if(!d.id||d.projectId!==project||!d.version||!d.roadSectionVersionId||rows.some(r=>r.id===d.id))throw new Error('Defect thiếu reference/version hoặc sai dự án.');rows.push({id:d.id,code:`#DEF-${d.id.slice(0,8).toUpperCase()}`,project_id:d.projectId,defect_type:d.defectTypeCode||'',status:d.status||'',version:d.version,route_version_id:d.roadSectionVersionId})}cursor=data.nextCursor||undefined;if(cursor&&seen.has(cursor))throw new Error('Cursor Defect lặp.');if(cursor)seen.add(cursor)}while(cursor);return rows
 },
 async crews(project:string){const s=actor(),rows=await projectService.fetchProjectMembers(project);active(s);return rows.filter(r=>r.role==='CREW'&&r.status==='ACTIVE').map(r=>({id:r.userId,name:r.displayName||r.userId}))},
 async request(project:string,input:FieldCreateChoice){
  const s=actor(),k=journal(project),held=this.pending(project)
  if(held&&JSON.stringify(held.input)!==JSON.stringify(input))throw new Error('Giữ nguyên key/body của yêu cầu tạo FIELD đang chờ.')
  const routeVersionId=input.routeVersionId||input.pins?.routeVersionId
  if(!input.defectId||!input.defectVersion||!input.assignedToUserId||![1,2,3,4].includes(input.requiredMeasurementType)||!input.measurementScope.trim()||!Number.isFinite(Date.parse(input.dueAt))||!routeVersionId||input.pins&&(!input.pins.segmentSetId||!/^[a-f0-9]{64}$/i.test(input.pins.geometryVersion)||input.pins.routeVersionId!==routeVersionId))throw new Error('Chọn Defect, Crew, loại đo, tuyến và hạn xử lý thật trước khi tạo FIELD.')
  if(busy.has(k))throw new Error('Đang tạo FIELD.');busy.add(k)
  let c=held
  try{
   if(!c){const defect=(await apiClient.get(`/projects/${project}/defects/${input.defectId}`)).data;active(s);if(defect?.id!==input.defectId||defect.projectId!==project||String(defect.status).toUpperCase()!=='OPEN'||defect.version!==input.defectVersion||defect.roadSectionVersionId!==routeVersionId)throw new Error('Defect/project/version/tuyến đã thay đổi; đọc lại rồi xác nhận lựa chọn mới.')
    const ref=reportKeepNewCommands.references(project).find(r=>r.defectId===input.defectId);if(!ref)throw new Error('Chưa có reference KEEP_NEW của Report cho Defect này. Mở lại kết quả ghi nhận để đối chiếu; không tự gán nguồn Survey.')
    const accepted=await reportKeepNewCommands.read(project,ref.sourceId,ref.decisionId);active(s);if(!accepted||accepted.defect.id!==input.defectId||accepted.decision.sourceKind!=='REPORT')throw new Error('Nguồn Report không khớp Defect được chọn.')
    if(!(await this.crews(project)).some(r=>r.id===input.assignedToUserId))throw new Error('Crew không còn trong danh sách thành viên ACTIVE của dự án.')
    const roads=await triageGeometryService.routes(project);active(s);const road=roads.find(r=>r.currentVersionId===routeVersionId);if(!road)throw new Error('Chưa đối chiếu được tuyến của Defect trong danh mục; không tự thay phiên bản tuyến.')
    const route=(await apiClient.get(`/projects/${project}/road-sections/${road.roadSectionId}/versions/${routeVersionId}/geometry`)).data;active(s)
    if(route?.projectId!==project||route.roadSectionId!==road.roadSectionId||route.routeVersionId!==routeVersionId||!Object.prototype.hasOwnProperty.call(route,'crsProfileRevisionId')||route.crsProfileRevisionId!==null&&(typeof route.crsProfileRevisionId!=='string'||!route.crsProfileRevisionId))throw new Error('GET tuyến thiếu hoặc sai reference CRS; chưa tạo FIELD.')
    if(input.pins){const sets=await triageGeometryService.sets(project,road);active(s);if(!sets.some(r=>r.id===input.pins!.segmentSetId))throw new Error('Bộ phân đoạn không còn PUBLISHED.');const geometry=await triageGeometryService.package(project,road,input.pins.segmentSetId);active(s);if(geometry.geometryVersion!==input.pins.geometryVersion)throw new Error('Hash package đã thay đổi; chọn lại phạm vi trước khi tạo FIELD.')}
    const instructions=[input.measurementScope.trim(),input.instructions.trim()].filter(Boolean).join('\n')
    if(instructions.length>1000)throw new Error('Phương pháp và ghi chú chỉ dẫn vượt quá 1000 ký tự.')
    c={projectId:project,input:JSON.parse(JSON.stringify(input)),body:{defectId:input.defectId,defectVersion:input.defectVersion,routeVersionId:routeVersionId!,...(input.pins?{segmentSetId:input.pins.segmentSetId}:{}),crsProfileRevisionId:route.crsProfileRevisionId,purpose:'PRE_MEASUREMENT',requiredMeasurementType:input.requiredMeasurementType,measurementScope:'{}',instructions,assignedToUserId:input.assignedToUserId,dueAt:new Date(input.dueAt).toISOString(),sourceKind:'REPORTER'},key:crypto.randomUUID()};sessionStorage.setItem(k,JSON.stringify(c))
   }
   // Never rewrite an existing unknown command, even if its original scope was invalid.
   if(!c.received){let scope:unknown;try{scope=JSON.parse(c.body.measurementScope)}catch{throw new Error('Journal cũ chứa measurementScope không hợp lệ; giữ nguyên body/key để đối chiếu, không POST lại.')};if(!scope||typeof scope!=='object'||Array.isArray(scope))throw new Error('Journal cũ không chứa scope object; giữ nguyên body/key để đối chiếu.')}
   if(!c.received){const r=await apiClient.post(`/projects/${project}/field-inspection-tasks`,c.body,{headers:{'Idempotency-Key':c.key},transformRequest:[(body:unknown)=>{active(s);return JSON.stringify(body)}]});active(s);c.received=true;c.receipt=r.data;sessionStorage.setItem(k,JSON.stringify(c))}
   const receipt=c.receipt;if(!receipt?.id||receipt.projectId!==project||receipt.defectId!==input.defectId||receipt.assignedToUserId!==input.assignedToUserId||receipt.routeVersionId!==c.body.routeVersionId||(receipt.segmentSetId??null)!==(c.body.segmentSetId??null)||(receipt.crsProfileRevisionId??null)!==(c.body.crsProfileRevisionId??null)||receipt.requiredMeasurementType!==input.requiredMeasurementType||Date.parse(receipt.dueAt||'')!==Date.parse(c.body.dueAt)||!receipt.version)throw new Error('Receipt tạo FIELD sai reference; giữ receipt để đối chiếu GET.')
   const task=await fieldTaskReadService.detail(project,receipt.id);active(s);if(task.defectId!==receipt.defectId||task.assignedToUserId!==receipt.assignedToUserId||task.version!==receipt.version||task.routeVersionId!==receipt.routeVersionId||(task.segmentSetId??null)!==(receipt.segmentSetId??null)||(task.crsProfileRevisionId??null)!==(receipt.crsProfileRevisionId??null)||task.requiredMeasurementType!==receipt.requiredMeasurementType)throw new Error('GET FIELD chưa khớp receipt; chỉ đọc lại, không POST mới.');sessionStorage.removeItem(k);return task
  }finally{busy.delete(k)}
 }
}
