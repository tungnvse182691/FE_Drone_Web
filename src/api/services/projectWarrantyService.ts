import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import type { RoadCoverageReadFact } from './fastTrackService'
export interface WarrantyInput {scope:'PROJECT'|'ROAD_SECTION';roadSectionId:string|null;handoverDocumentId:string|null;sourceDocumentId:string;handoverDate:string;warrantyStartDate:string;warrantyEndDate:string;terms:string|null}
interface WarrantyBody extends WarrantyInput {operationId:string;status:'ACTIVE';retainedValue:null}
interface Receipt extends WarrantyBody {warrantyId:string;projectId:string}
interface Intent {body:WarrantyBody;receipt?:Receipt;uncertain?:boolean}
export interface WarrantySources {warranties:Array<{warrantyId:string;handoverDocumentId?:string|null;handoverDate?:string;warrantyStartDate?:string;warrantyEndDate?:string;status?:string;scope?:string}>;roads:Array<{roadSectionId:string;code:string;name?:string}>;coverage:RoadCoverageReadFact}
const running=new Set<string>()
function identity(project:string){const s=useAuthStore.getState();if(!s.user || !s.isAuthenticated)throw new Error('Chưa có phiên đọc hồ sơ bảo hành.');return `${s.user.id}:${s.user.role}:${project}`}
const key=(p:string)=>`rg_warranty:${identity(p)}`
const day=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v
export const projectWarrantyService={
  pending(p:string):Intent|null {const raw=localStorage.getItem(key(p));if(!raw)return null;const c=JSON.parse(raw);if(!c.body?.operationId || c.body.status!=='ACTIVE')throw new Error('Journal bảo hành chưa đúng contract; giữ nguyên để đối chiếu.');return c},
  async read(p:string,signal?:AbortSignal):Promise<WarrantySources>{
    const scope=identity(p),epoch=useAuthStore.getState().authEpoch
    const [work,coverage]=await Promise.all([apiClient.get(`/projects/${p}/work-package`,{signal}),apiClient.get<RoadCoverageReadFact>(`/projects/${p}/road-coverage`,{signal})])
    if(signal?.aborted || epoch!==useAuthStore.getState().authEpoch || identity(p)!==scope)throw new Error('Phiên hồ sơ bảo hành đã đổi.')
    if(work.data.projectId!==p || !Array.isArray(work.data.roadSections) || !Array.isArray(work.data.warranties) || coverage.data.projectId!==p || !Array.isArray(coverage.data.sources) || coverage.headers.etag!==`"${coverage.data.version}"`)throw new Error('Nguồn bảo hành sai dự án/cấu trúc/ETag.')
    return {warranties:work.data.warranties,roads:work.data.roadSections,coverage:coverage.data}
  },
  async create(p:string,input:WarrantyInput){
    const s=useAuthStore.getState(),epoch=s.authEpoch,storage=key(p)
    if(s.user?.role!=='SUPERVISOR')throw new Error('Chỉ Giám sát được tạo hồ sơ bảo hành hiệu lực.')
    if(running.has(storage))throw new Error('Đang đối chiếu bảo hành.')
    const active=()=>{if(epoch!==useAuthStore.getState().authEpoch || storage!==key(p))throw new Error('Phiên bảo hành đã đổi; giữ tiến độ tài khoản cũ.')}
    let held=this.pending(p);running.add(storage)
    const save=()=>localStorage.setItem(storage,JSON.stringify(held))
    try{
      if(held && !held.receipt){const {operationId,status,retainedValue,...old}=held.body;if(JSON.stringify(old)!==JSON.stringify(input))throw new Error('Giữ nguyên hồ sơ/operationId đang chờ; không đổi body.')}
      if(!held){
        if(!day(input.handoverDate)||!day(input.warrantyStartDate)||!day(input.warrantyEndDate)||input.warrantyStartDate<input.handoverDate||input.warrantyEndDate<input.warrantyStartDate || (input.terms?.length || 0)>2000)throw new Error('Kiểm tra ngày bàn giao ≤ bắt đầu ≤ kết thúc và điều khoản tối đa 2000 ký tự.')
        const source=await this.read(p);active()
        if(!source.coverage.sources.some(r=>r.kind==='MAINTENANCE_BASIS' && r.fileId===input.sourceDocumentId))throw new Error('Chọn tệp nguồn đã xác minh trong đúng dự án.')
        if(input.scope==='ROAD_SECTION' ? !source.roads.some(r=>r.roadSectionId===input.roadSectionId):input.scope!=='PROJECT'||input.roadSectionId!==null)throw new Error('Chọn phạm vi dự án hoặc tuyến đúng nguồn.')
        if(input.handoverDocumentId && !source.warranties.some(w=>w.handoverDocumentId===input.handoverDocumentId) && !source.coverage.sources.some(r=>r.kind==='HANDOVER' && r.id===input.handoverDocumentId))throw new Error('Hồ sơ bàn giao không nằm trong nguồn đã đọc.')
        held={body:{...input,status:'ACTIVE',retainedValue:null,operationId:crypto.randomUUID()}};save()
      }
      if(!held.receipt){const r=await apiClient.post<Receipt>(`/projects/${p}/warranties`,held.body);held.receipt=r.data;save();active()}
      const receipt=held.receipt,body=held.body
      if(!receipt?.warrantyId || receipt.projectId!==p || Object.entries(body).some(([k,v])=>k!=='operationId' && JSON.stringify((receipt as any)[k])!==JSON.stringify(v)))throw new Error('Biên nhận bảo hành không khớp ý định; giữ nguyên, chỉ đối chiếu nguồn đọc.')
      const result=await this.read(p);active()
      if(!result.coverage.sources.some(r=>r.kind==='WARRANTY' && r.id===receipt.warrantyId && r.fileId===body.sourceDocumentId && r.from===body.warrantyStartDate && r.to===body.warrantyEndDate))throw new Error('Đã nhận biên nhận nhưng chưa GET được nguồn bảo hành hiệu lực đúng tệp/ngày; không tạo lại.')
      localStorage.removeItem(storage);return {receipt,sources:result}
    }catch(e:any){if(held && (!e.response?.status || e.response.status>=500 || e.response.status===408)){held.uncertain=true;save()}throw e}finally{running.delete(storage)}
  }
}
