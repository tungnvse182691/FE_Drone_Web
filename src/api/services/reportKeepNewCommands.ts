import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { defectTypeCatalog } from './defectTypeCatalog'
import { RoleCode } from '../../types/enums'
export interface ReportKeepNewInput {sourceKind:'REPORT';sourceId:string;sourceVersion:string;geometryVersion:string;decision:'KEEP_NEW';classification:{defectTypeCode:string;severity:string;roadSectionVersionId:string;segmentId?:string|null};reason:string}
interface Intent {projectId:string;body:ReportKeepNewInput;key:string;received?:boolean;receipt?:{id:string;sourceKind:string;sourceId:string;decision:string;defectId:string;version:string}}
export interface KeepNewResult {decision:{id:string;sourceKind:string;sourceId:string;decision:string;defectId:string;version:string};defect:{id:string;projectId:string;roadSectionVersionId:string;defectTypeCode:string;severity:string;status:string;version:string}}
interface Reference {projectId:string;sourceId:string;decisionId:string;defectId?:string;commandKey?:string}
const referenceKey=(project:string,report:string)=>`rg_keep_reference_${useAuthStore.getState().user?.id}_${project}_${report}`
const running=new Set<string>(),key=(project:string,report:string)=>`rg_keep_report_${useAuthStore.getState().user?.id}_${project}_${report}`
export const reportKeepNewCommands={
  references(project:string):Reference[]{
    const prefix=`rg_keep_reference_${useAuthStore.getState().user?.id}_${project}_`,rows:Reference[]=[]
    for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(k?.startsWith(prefix)){const r=JSON.parse(sessionStorage.getItem(k)!);if(r.projectId!==project||!r.sourceId||!r.decisionId)throw new Error('Reference ghi nhận sai dự án.');rows.push(r)}}
    return rows
  },
  reference(project:string,report:string):Reference|null {
    const raw=sessionStorage.getItem(referenceKey(project,report));if(!raw)return null
    const r=JSON.parse(raw) as Reference
    if(r.projectId!==project||r.sourceId!==report||!r.decisionId)throw new Error('Reference KEEP_NEW sai phạm vi; chưa tạo quyết định mới.')
    return r
  },
  async read(project:string,report:string,decisionId?:string,signal?:AbortSignal):Promise<KeepNewResult|null> {
    const a=useAuthStore.getState(),epoch=a.authEpoch
    if(a.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được đọc kết quả ghi nhận Report.')
    const saved=this.reference(project,report),held=this.pending(project,report)
    const id=decisionId||saved?.decisionId||held?.receipt?.id
    if(!id)return null
    const active=()=>{if(signal?.aborted||useAuthStore.getState().authEpoch!==epoch||useAuthStore.getState().user?.id!==a.user?.id)throw new Error('Phiên đọc kết quả đã thay đổi.')}
    const decision=(await apiClient.get(`/projects/${project}/candidate-decisions/${encodeURIComponent(id)}`,{signal})).data;active()
    if(decision?.id!==id||decision.sourceKind!=='REPORT'||decision.sourceId!==report||decision.decision!=='KEEP_NEW'||!decision.defectId||!decision.version)throw new Error('GET quyết định không khớp Report/reference KEEP_NEW.')
    if(saved?.decisionId===id&&saved.defectId&&saved.defectId!==decision.defectId)throw new Error('GET quyết định khác Defect reference đã ghi nhận.')
    const defect=(await apiClient.get(`/projects/${project}/defects/${encodeURIComponent(decision.defectId)}`,{signal})).data;active()
    if(defect?.id!==decision.defectId||defect.projectId!==project||!defect.version||typeof defect.status!=='string'||!defect.status)throw new Error('GET Defect không khớp project/reference hoặc thiếu trạng thái.')
    // A read reference is not acknowledgement of a different pending command/key.
    const reference:Reference={projectId:project,sourceId:report,decisionId:id,defectId:defect.id,...(saved?.decisionId===id?{commandKey:saved.commandKey}:{})}
    sessionStorage.setItem(referenceKey(project,report),JSON.stringify(reference))
    return {decision,defect}
  },
  pending(project:string,report:string):Intent|null {const raw=sessionStorage.getItem(key(project,report));if(!raw)return null;const c=JSON.parse(raw);if(c.projectId!==project||c.body?.sourceId!==report||!c.key)throw new Error('Journal quyết định sai phạm vi.');return c},
  async run(project:string,body:ReportKeepNewInput){
    const a=useAuthStore.getState(),epoch=a.authEpoch;if(a.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được ghi nhận khiếm khuyết.')
    const active=()=>{if(useAuthStore.getState().authEpoch!==epoch||useAuthStore.getState().user?.id!==a.user?.id)throw new Error('Phiên đã thay đổi.')},k=key(project,body.sourceId)
    if(this.reference(project,body.sourceId)){const result=await this.read(project,body.sourceId);if(result)return result}
    let c=this.pending(project,body.sourceId);if(c&&JSON.stringify(c.body)!==JSON.stringify(body))throw new Error('Giữ nguyên quyết định đang chờ và key cũ.')
    let persisted=!!c
    if(!c){if(!body.reason.trim()||body.reason.trim().length>1000||!body.sourceVersion||!body.geometryVersion||!body.classification.defectTypeCode||!body.classification.roadSectionVersionId||!['LOW','MEDIUM','HIGH','CRITICAL'].includes(body.classification.severity))throw new Error('Thiếu nguồn, phân loại, tuyến hoặc lý do.');c={projectId:project,body:JSON.parse(JSON.stringify(body)),key:crypto.randomUUID()}}
    if(running.has(k))throw new Error('Đang ghi nhận quyết định.');running.add(k);const save=()=>{sessionStorage.setItem(k,JSON.stringify(c));persisted=true}
    try{
      if(!this.pending(project,body.sourceId)){
        if(!(await defectTypeCatalog.read()).some(t=>t.code===body.classification.defectTypeCode))throw new Error('Loại lỗi không còn hiệu lực; tải lại danh mục và chọn lại.')
        const source=(await apiClient.get(`/projects/${project}/candidates`,{params:{sourceKind:'REPORT',sourceId:body.sourceId,pageSize:50}})).data;active();
        if(source?.source?.kind!=='REPORT'||source.source.id!==body.sourceId||source.source.version!==body.sourceVersion||source.geometryVersion!==body.geometryVersion)throw new Error('Phiên bản nguồn/hình học thay đổi; cần đọc lại trước quyết định mới.')
      }
      active();save();if(!c.received){const {data}=await apiClient.post(`/projects/${project}/candidate-decisions`,c.body,{headers:{'Idempotency-Key':c.key}});active();c.received=true;c.receipt=data;save()}
      const r=c.receipt;if(!r?.id||!r.defectId||r.sourceKind!=='REPORT'||r.sourceId!==body.sourceId||r.decision!=='KEEP_NEW')throw new Error('Receipt KEEP_NEW sai reference; không ghi lần nữa.')
      const d=(await apiClient.get(`/projects/${project}/candidate-decisions/${r.id}`)).data;active();if(d.id!==r.id||d.defectId!==r.defectId||d.sourceId!==body.sourceId||d.decision!=='KEEP_NEW'||d.version!==r.version)throw new Error('GET quyết định không khớp receipt.')
      const defect=(await apiClient.get(`/projects/${project}/defects/${r.defectId}`)).data;active();if(defect.id!==r.defectId||defect.projectId!==project||defect.roadSectionVersionId!==body.classification.roadSectionVersionId||defect.defectTypeCode!==body.classification.defectTypeCode||defect.severity!==body.classification.severity||!defect.version)throw new Error('GET Defect không khớp quyết định.');sessionStorage.setItem(referenceKey(project,body.sourceId),JSON.stringify({projectId:project,sourceId:body.sourceId,decisionId:d.id,defectId:defect.id,commandKey:c.key}));sessionStorage.removeItem(k);return {decision:d,defect}
    }catch(e){active();if(persisted)save();throw e}finally{running.delete(k)}
  }
}
