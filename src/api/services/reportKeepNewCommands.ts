import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { defectTypeCatalog } from './defectTypeCatalog'
import { RoleCode } from '../../types/enums'
export interface ReportKeepNewInput {sourceKind:'REPORT';sourceId:string;sourceVersion:string;geometryVersion:string;decision:'KEEP_NEW';classification:{defectTypeCode:string;severity:string;roadSectionVersionId:string;segmentId?:string|null};reason:string}
interface Intent {projectId:string;body:ReportKeepNewInput;key:string;received?:boolean;receipt?:{id:string;sourceKind:string;sourceId:string;decision:string;defectId:string;version:string}}
const running=new Set<string>(),key=(project:string,report:string)=>`rg_keep_report_${useAuthStore.getState().user?.id}_${project}_${report}`
export const reportKeepNewCommands={
  pending(project:string,report:string):Intent|null {const raw=sessionStorage.getItem(key(project,report));if(!raw)return null;const c=JSON.parse(raw);if(c.projectId!==project||c.body?.sourceId!==report||!c.key)throw new Error('Journal quyết định sai phạm vi.');return c},
  async run(project:string,body:ReportKeepNewInput){
    const a=useAuthStore.getState(),epoch=a.authEpoch;if(a.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được ghi nhận khiếm khuyết.')
    const active=()=>{if(useAuthStore.getState().authEpoch!==epoch||useAuthStore.getState().user?.id!==a.user?.id)throw new Error('Phiên đã thay đổi.')},k=key(project,body.sourceId)
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
      const defect=(await apiClient.get(`/projects/${project}/defects/${r.defectId}`)).data;active();if(defect.id!==r.defectId||defect.projectId!==project||defect.roadSectionVersionId!==body.classification.roadSectionVersionId||defect.defectTypeCode!==body.classification.defectTypeCode||defect.severity!==body.classification.severity||!defect.version)throw new Error('GET Defect không khớp quyết định.');sessionStorage.removeItem(k);return {decision:d,defect}
    }catch(e){active();if(persisted)save();throw e}finally{running.delete(k)}
  }
}
