import {apiClient} from '../client'
import {alignmentService,type RouteSystemView} from './alignmentService'
import {useAuthStore} from '../../store/authStore'
import {RoleCode} from '../../types/enums'

type Intent={actor:string;projectId:string;body:{code:string;name:string};key:string;received:boolean;receipt?:RouteSystemView}
const running=new Set<string>()
const key=(actor:string,projectId:string)=>`rg_route_system_create_${actor}_${projectId}`
function actorScope(){const s=useAuthStore.getState();if(!s.isAuthenticated||s.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được tạo hệ tuyến.');return{actor:s.user.id,current(){const n=useAuthStore.getState();if(n.authEpoch!==s.authEpoch||n.user?.id!==s.user?.id||!n.isAuthenticated||n.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Phiên đã thay đổi; bỏ phản hồi tạo hệ tuyến cũ.')}}}
export const routeSystemCommands={
  pending(projectId:string):Intent|null{const f=actorScope(),raw=sessionStorage.getItem(key(f.actor,projectId));if(!raw)return null;const c=JSON.parse(raw) as Intent;if(c.actor!==f.actor||c.projectId!==projectId||!c.key||typeof c.body?.code!=='string'||typeof c.body.name!=='string'||typeof c.received!=='boolean')throw new Error('Yêu cầu tạo hệ tuyến đang chờ sai phạm vi.');return c},
  async run(projectId:string,input?:{code:string;name:string}){
    const f=actorScope(),journal=key(f.actor,projectId)
    if(running.has(journal))throw new Error('Đang tạo hoặc đọc lại hệ tuyến.')
    let c=this.pending(projectId)
    if(c&&input&&JSON.stringify(c.body)!==JSON.stringify(input))throw new Error('Giữ nguyên nội dung yêu cầu đang chờ, không tạo yêu cầu mới.')
    if(!c){if(!input||typeof input.code!=='string'||typeof input.name!=='string')throw new Error('Chưa có bản nhập hệ tuyến.');c={actor:f.actor,projectId,body:{...input},key:crypto.randomUUID(),received:false}}
    running.add(journal);const save=()=>sessionStorage.setItem(journal,JSON.stringify(c))
    try{
      if(!c.received){
        const {data:context}=await apiClient.get(`/projects/${projectId}/work-package`);f.current()
        if(context?.projectId!==projectId||context.accessRole!=='PM')throw new Error('Chưa xác minh quyền PM trong đúng dự án.')
        save()
        const response=await apiClient.post(`/projects/${projectId}/route-systems`,c.body,{headers:{'Idempotency-Key':c.key}});f.current()
        c.received=true;c.receipt=response.data;save()
        if(response.status!==201)throw new Error('Phản hồi tạo chưa đúng contract 201; chỉ đọc lại, không ghi lần nữa.')
      }
      if(!c.receipt?.id||c.receipt.projectId!==projectId)throw new Error('Receipt hệ tuyến sai ID/dự án; không gửi lại POST.')
      const items=await alignmentService.fetchRouteSystems(projectId);f.current()
      const created=items.find(item=>item.id===c!.receipt!.id)
      if(!created||created.projectId!==projectId||created.code!==c.receipt.code||created.name!==c.receipt.name)throw new Error('Đã nhận tạo nhưng danh sách chưa xác minh đúng hệ tuyến. Chỉ đọc lại kết quả.')
      sessionStorage.removeItem(journal);return{created,items}
    }catch(e:any){f.current();if(!c.received&&e?.response?.status>=400&&e.response.status<500&&e.response.data?.code!=='duplicate_request')sessionStorage.removeItem(journal);throw e}
    finally{running.delete(journal)}
  }
}
