import {alignmentService,type CrsProfileInput,type CrsProfileView} from './alignmentService'
import {useAuthStore} from '../../store/authStore'
import {RoleCode} from '../../types/enums'

type Intent={actor:string;projectId:string;body:CrsProfileInput;key:string;received:boolean;receipt?:CrsProfileView}
const running=new Set<string>()
const journalKey=(actor:string,projectId:string)=>`rg_crs_create_${actor}_${projectId}`
function actorScope(){const s=useAuthStore.getState();if(!s.isAuthenticated||s.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được tạo hồ sơ CRS.');return{actor:s.user.id,current(){const n=useAuthStore.getState();if(n.authEpoch!==s.authEpoch||n.user?.id!==s.user?.id||!n.isAuthenticated||n.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Phiên đã thay đổi; bỏ phản hồi CRS cũ.')}}}
export const crsProfileCommands={
  pending(projectId:string):Intent|null{const f=actorScope(),raw=sessionStorage.getItem(journalKey(f.actor,projectId));if(!raw)return null;const c=JSON.parse(raw) as Intent;if(c.actor!==f.actor||c.projectId!==projectId||!c.key||!c.body||typeof c.received!=='boolean')throw new Error('Yêu cầu CRS đang chờ sai phạm vi.');return c},
  async run(projectId:string,input?:CrsProfileInput){
    const f=actorScope(),key=journalKey(f.actor,projectId)
    if(running.has(key))throw new Error('Đang tạo hoặc đọc lại hồ sơ CRS.')
    let c=this.pending(projectId)
    if(c&&input&&JSON.stringify(c.body)!==JSON.stringify(input))throw new Error('Giữ nguyên nội dung yêu cầu CRS đang chờ.')
    if(!c){if(!input)throw new Error('Chưa có định nghĩa CRS từ hồ sơ kỹ thuật.');c={actor:f.actor,projectId,body:JSON.parse(JSON.stringify(input)),key:crypto.randomUUID(),received:false}}
    const save=()=>sessionStorage.setItem(key,JSON.stringify(c))
    running.add(key)
    try{
      if(!c.received){
        const context=await alignmentService.readProjectContext(projectId);f.current()
        if(context.projectId!==projectId||(context as {accessRole?:string}).accessRole!=='PM')throw new Error('Chưa xác minh quyền PM trong đúng dự án.')
        save()
        try{c.receipt=await alignmentService.createCrsProfile(projectId,c.body,c.key);f.current();c.received=true;save()}
        catch(e:any){f.current();if(e.received){c.received=true;c.receipt=e.receipt;save()}throw e}
      }
      if(!c.receipt?.id||c.receipt.projectId!==projectId)throw new Error('Receipt CRS thiếu ID hoặc sai dự án; không gửi lại POST.')
      const items=await alignmentService.fetchCrsProfiles(projectId);f.current()
      const listed=items.find(item=>item.id===c!.receipt!.id&&item.projectId===projectId)
      if(!listed)throw new Error('Danh sách chưa có đúng ID CRS đã tạo. Chỉ đọc lại kết quả.')
      const profile=await alignmentService.readCrsProfile(projectId,listed.id);f.current()
      if(profile.id!==c.receipt.id||profile.projectId!==projectId||profile.revision!==listed.revision||profile.revision!==c.receipt.revision||profile.code!==c.receipt.code)throw new Error('Chi tiết CRS chưa khớp receipt/danh sách. Chỉ đọc lại để đối chiếu.')
      sessionStorage.removeItem(key);return{items,profile}
    }catch(e:any){f.current();if(!c.received&&e?.response?.status>=400&&e.response.status<500&&e.response.data?.code!=='duplicate_request')sessionStorage.removeItem(key);throw e}
    finally{running.delete(key)}
  }
}
