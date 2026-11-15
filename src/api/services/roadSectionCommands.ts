import {apiClient} from '../client'
import {useAuthStore} from '../../store/authStore'
import {RoleCode} from '../../types/enums'

export interface RoadSectionGeometryInput {srid:number;coordinates:{x:number;y:number}[];effectiveFrom:string;changeReason:string}
export interface NewRoadSectionInput extends RoadSectionGeometryInput {code:string;name?:string|null}
export interface RoadSectionBase {projectId:string;roadSectionId:string;currentVersionId:string}
export interface RoadSectionReceipt {projectId:string;roadSectionId:string;roadSectionVersionId:string;code?:string|null;versionNo:number;isCurrent:boolean;effectiveFrom:string;changeReason?:string|null}
type Command={kind:'create';input:NewRoadSectionInput}|{kind:'version';base:RoadSectionBase;input:RoadSectionGeometryInput}
type Intent={actor:string;projectId:string;command:Command;body:RoadSectionGeometryInput&{code?:string;name?:string|null;operationId:string;expectedCurrentVersionId?:string};received:boolean;receipt?:RoadSectionReceipt;rejected?:boolean}
const busy=new Set<string>()
const key=(actor:string,projectId:string)=>`rg_road_section_command_${actor}_${projectId}`
function scope(){const s=useAuthStore.getState();if(!s.isAuthenticated||s.user?.role!==RoleCode.SUPERVISOR)throw new Error('Chỉ Giám sát được tạo đoạn đường hoặc phiên bản trực tiếp.');return{actor:s.user.id,current(){const n=useAuthStore.getState();if(!n.isAuthenticated||n.authEpoch!==s.authEpoch||n.user?.id!==s.user?.id||n.user?.role!==RoleCode.SUPERVISOR)throw new Error('Phiên đã thay đổi; bỏ phản hồi đoạn đường cũ.')}}}
async function context(projectId:string){const f=scope(),{data}=await apiClient.get(`/projects/${projectId}/work-package`);f.current();if(data?.projectId!==projectId||data.accessRole!=='SUPERVISOR'||!Array.isArray(data.roadSections))throw new Error('Chưa xác minh đúng dự án và quyền Giám sát.');return data}
function selectedSection(data:any,sectionId:string){const rows=data.roadSections.filter((r:any)=>r.roadSectionId===sectionId);if(rows.length!==1||!rows[0].currentVersionId)throw new Error('Chưa đọc được đúng đoạn đường và phiên bản hiện hành.');return rows[0]}
function validate(input:RoadSectionGeometryInput){if(!input||![32648,32649].includes(input.srid)||!Array.isArray(input.coordinates)||input.coordinates.length<2||input.coordinates.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))||typeof input.changeReason!=='string'||!input.changeReason.trim()||typeof input.effectiveFrom!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(input.effectiveFrom)||!Number.isFinite(Date.parse(input.effectiveFrom)))throw new Error('Cần tọa độ, SRID, ngày giờ hiệu lực có múi giờ và lý do từ hồ sơ nguồn.')}
function verifyReceipt(value:RoadSectionReceipt,projectId:string,command:Command){if(value?.projectId!==projectId||!value.roadSectionId||!value.roadSectionVersionId||!Number.isInteger(value.versionNo)||value.versionNo<1||!Number.isFinite(Date.parse(value.effectiveFrom))||typeof value.isCurrent!=='boolean'||command.kind==='version'&&value.roadSectionId!==command.base.roadSectionId)throw new Error('Receipt thiếu hoặc sai reference đoạn đường/phiên bản; không gửi lại POST.')}

/** API183/191. Service only: product entry and direct-version lifecycle still require clarification. */
export const roadSectionCommands={
  async readBase(projectId:string,roadSectionId:string):Promise<RoadSectionBase>{const data=await context(projectId),section=selectedSection(data,roadSectionId);return{projectId,roadSectionId,currentVersionId:section.currentVersionId}},
  pending(projectId:string):Intent|null{const f=scope(),raw=sessionStorage.getItem(key(f.actor,projectId));if(!raw)return null;const c=JSON.parse(raw) as Intent;if(c.actor!==f.actor||c.projectId!==projectId||!['create','version'].includes(c.command?.kind)||!c.body?.operationId||typeof c.received!=='boolean')throw new Error('Lệnh đoạn đường đang chờ sai phạm vi.');return c},
  acknowledgeRejected(projectId:string){const f=scope(),journal=key(f.actor,projectId),c=this.pending(projectId);if(busy.has(journal)||!c?.rejected||c.received)throw new Error('Chưa được bỏ lệnh chưa rõ kết quả hoặc đã có receipt.');sessionStorage.removeItem(journal)},
  async run(projectId:string,command?:Command){
    const f=scope(),journal=key(f.actor,projectId)
    if(busy.has(journal))throw new Error('Đang tạo hoặc đối chiếu đoạn đường.')
    let c=this.pending(projectId)
    if(c&&command)throw new Error('Có lệnh đang chờ; giữ nguyên operationId/nội dung để đối chiếu.')
    if(c?.rejected)throw new Error('Lệnh đã bị từ chối. Đọc lại và đối chiếu trước khi xác nhận một yêu cầu mới.')
    if(!c&&!command)throw new Error('Không có lệnh đoạn đường đang chờ.')
    busy.add(journal)
    const save=()=>sessionStorage.setItem(journal,JSON.stringify(c))
    try{
      const data=await context(projectId);f.current()
      if(!c){
        validate(command!.input)
        const input=command!.input
        // Copy declared DTO fields only; never accept caller operation/version defaults.
        const body:Intent['body']={srid:input.srid,coordinates:input.coordinates.map(p=>({x:p.x,y:p.y})),effectiveFrom:input.effectiveFrom,changeReason:input.changeReason,operationId:crypto.randomUUID()}
        if(command!.kind==='create'){
          const source=(command as Extract<Command,{kind:'create'}>).input
          if(typeof source.code!=='string'||!source.code.trim()||source.code.length>80||source.name!=null&&(typeof source.name!=='string'||source.name.length>255))throw new Error('Kiểm tra mã đoạn đường (tối đa80 ký tự) và tên (tối đa255 ký tự).')
          body.code=source.code;if(source.name!==undefined)body.name=source.name
        }else{
          const base=(command as Extract<Command,{kind:'version'}>).base
          if(base?.projectId!==projectId||!base.roadSectionId)throw new Error('Snapshot đoạn đường sai dự án.')
          const section=selectedSection(data,base.roadSectionId)
          if(section.currentVersionId!==base.currentVersionId)throw new Error('Phiên bản tuyến đã thay đổi. Đọc lại và đối chiếu trước khi tạo phiên bản mới.')
          body.expectedCurrentVersionId=section.currentVersionId
        }
        c={actor:f.actor,projectId,command:JSON.parse(JSON.stringify(command)),body,received:false};save()
      }
      if(!c.received){
        const section=c.command.kind==='version'?c.command.base.roadSectionId:null
        const path=section?`/projects/${projectId}/road-sections/${section}/versions`:`/projects/${projectId}/road-sections`
        const response=await apiClient.post<RoadSectionReceipt>(path,c.body);f.current()
        c.received=true;c.receipt=response.data;save()
        if(response.status!==201)throw new Error('Phản hồi không đúng201. Chỉ đọc lại, không gửi POST lần nữa.')
      }
      verifyReceipt(c.receipt!,projectId,c.command)
      const receipt=c.receipt!,readback=await context(projectId);f.current()
      const section=selectedSection(readback,receipt.roadSectionId)
      if(receipt.isCurrent!==true||section.currentVersionId!==receipt.roadSectionVersionId||section.versionNo!==receipt.versionNo||c.command.kind==='create'&&(section.code!==receipt.code||receipt.code!==c.body.code||c.body.name!==undefined&&section.name!==c.body.name))throw new Error('Đã có receipt nhưng work-package chưa khớp phiên bản tạo. Chỉ đọc lại; không gửi thêm POST.')
      const {data:geometry}=await apiClient.get(`/projects/${projectId}/road-sections/${receipt.roadSectionId}/versions/${receipt.roadSectionVersionId}/geometry`);f.current()
      if(geometry?.projectId!==projectId||geometry.roadSectionId!==receipt.roadSectionId||geometry.routeVersionId!==receipt.roadSectionVersionId||geometry.isCurrent!==true||geometry.engineeringSrid!==c.body.srid||JSON.stringify(geometry.metricCenterline?.coordinates)!==JSON.stringify(c.body.coordinates.map(p=>[p.x,p.y]))||Date.parse(geometry.effectiveFrom)!==Date.parse(c.body.effectiveFrom)||Date.parse(receipt.effectiveFrom)!==Date.parse(c.body.effectiveFrom)||receipt.changeReason!==c.body.changeReason)throw new Error('Đã tạo nhưng hình học/reference đọc lại chưa khớp. Chỉ đọc lại để đối chiếu.')
      sessionStorage.removeItem(journal);return{receipt,workPackage:readback,geometry}
    }catch(e:any){f.current();if(c&&!c.received&&e?.response?.status>=400&&e.response.status<500&&e.response.data?.code!=='duplicate_request'){c.rejected=true;save()}throw e}
    finally{busy.delete(journal)}
  }
}
