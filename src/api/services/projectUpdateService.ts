import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'

export interface EditableProject {
  projectId:string; projectCode:string; name:string; description:string|null; rowVersion:string
  engineeringUtmSrid:number|null; startDate:string|null; endDate:string|null
}
interface UpdateIntent {
  actor:string; projectId:string; base:EditableProject; received:boolean
  body:{name:string;description:string|null;engineeringUtmSrid:number|null;startDate:string|null;endDate:string|null;expectedRowVersion:string;operationId:string}
  receipt?:{projectId:string;rowVersion:string}
}
const running=new Set<string>()
function scope() {
  const {user,authEpoch,isAuthenticated}=useAuthStore.getState()
  if(!isAuthenticated||user?.role!==RoleCode.SUPERVISOR)throw new Error('Chỉ Giám sát được sửa dự án.')
  return {actor:user.id,current(){const s=useAuthStore.getState();if(!s.isAuthenticated||s.user?.id!==user.id||s.user.role!==RoleCode.SUPERVISOR||s.authEpoch!==authEpoch)throw new Error('Phiên đã thay đổi; bỏ kết quả sửa dự án cũ.')}}
}
const journalKey=(actor:string,id:string)=>`rg_project_update_${actor}_${id}`
const validate=(value:any,id:string):EditableProject=>{
  if(value?.projectId!==id||typeof value.projectCode!=='string'||!value.projectCode||typeof value.name!=='string'||!value.rowVersion||!Object.prototype.hasOwnProperty.call(value,'description')||value.description!==null&&typeof value.description!=='string'||!Object.prototype.hasOwnProperty.call(value,'engineeringUtmSrid')||value.engineeringUtmSrid!==null&&!Number.isInteger(value.engineeringUtmSrid)||['startDate','endDate'].some(k=>!Object.prototype.hasOwnProperty.call(value,k)||value[k]!==null&&(typeof value[k]!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value[k]))))throw new Error('Hồ sơ dự án thiếu hoặc sai dữ liệu để sửa an toàn; hãy tải lại.')
  return {projectId:id,projectCode:value.projectCode,name:value.name,description:value.description,rowVersion:value.rowVersion,engineeringUtmSrid:value.engineeringUtmSrid,startDate:value.startDate,endDate:value.endDate}
}
export const projectUpdateService={
  pending(id:string):UpdateIntent|null {
    const f=scope(),raw=sessionStorage.getItem(journalKey(f.actor,id));if(!raw)return null
    const c=JSON.parse(raw) as UpdateIntent
    if(c.actor!==f.actor||c.projectId!==id||c.base?.projectId!==id||!c.body?.operationId||!c.body.expectedRowVersion||typeof c.received!=='boolean')throw new Error('Yêu cầu sửa đang chờ sai phạm vi; chưa gửi yêu cầu mới.')
    return c
  },
  async read(id:string):Promise<EditableProject>{const f=scope(),{data}=await apiClient.get(`/projects/${id}/work-package`);f.current();return validate(data,id)},
  async run(id:string,base?:EditableProject,name?:string,description?:string):Promise<EditableProject>{
    const f=scope(),key=journalKey(f.actor,id)
    if(running.has(key))throw new Error('Đang lưu hoặc đọc lại dự án.')
    let c=this.pending(id)
    if(c&&base)throw new Error('Có yêu cầu sửa đang chờ; chỉ đối chiếu cùng yêu cầu, không thay nội dung.')
    if(!c){
      if(!base||base.projectId!==id||!name?.trim()||name.trim().length>255||typeof description!=='string')throw new Error('Kiểm tra tên dự án và hồ sơ đang chỉnh.')
      validate(base,id)
      c={actor:f.actor,projectId:id,base:{...base},received:false,body:{name:name.trim(),description:base.description===null&&description===''?null:description,engineeringUtmSrid:base.engineeringUtmSrid,startDate:base.startDate,endDate:base.endDate,expectedRowVersion:base.rowVersion,operationId:crypto.randomUUID()}}
    }
    running.add(key);const save=()=>sessionStorage.setItem(key,JSON.stringify(c))
    try{
      if(!this.pending(id)){
        const latest=await this.read(id);f.current()
        if(latest.rowVersion!==c.base.rowVersion)throw Object.assign(new Error('Dự án đã thay đổi. Tải lại dữ liệu và đối chiếu trước khi lưu tiếp.'),{projectVersionStale:true})
      }
      f.current();save()
      if(!c.received){
        const response=await apiClient.put(`/projects/${id}`,c.body);f.current()
        // Once an HTTP success exists, recovery must never write again.
        c.received=true;c.receipt=response.data;save()
        if(response.status!==200)throw new Error('Phản hồi lưu không đúng contract 200; chỉ đọc lại để đối chiếu.')
      }
      if(c.receipt?.projectId!==id||!c.receipt.rowVersion)throw new Error('Receipt sửa dự án sai reference/version; không gửi lại PUT.')
      const read=await this.read(id);f.current()
      if(read.name!==c.body.name||read.description!==c.body.description||read.projectCode!==c.base.projectCode||read.engineeringUtmSrid!==c.base.engineeringUtmSrid||read.startDate!==c.base.startDate||read.endDate!==c.base.endDate)throw new Error('Đã nhận lưu nhưng dữ liệu đọc lại chưa khớp tên, địa bàn hoặc trường giữ nguyên. Chỉ đọc lại, không lưu lần nữa.')
      sessionStorage.removeItem(key);return read
    }catch(e:any){
      f.current()
      if(!c.received&&e?.response?.status>=400&&e.response.status<500){sessionStorage.removeItem(key)}
      throw e
    }finally{running.delete(key)}
  }
}
