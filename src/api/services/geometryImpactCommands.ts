import { apiClient } from '../client'
import { alignmentService } from './alignmentService'
import { geometryImpactService, type GeometryImpactView } from './geometryImpactService'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'

export type ImpactAction = 'VERIFY' | 'CONTINUE' | 'STOP' | 'REASSIGN'
export interface ImpactDecision { id:string;impactId:string;taskId:string;action:ImpactAction;reason:string;occurredAt:string;executionStatus?:string|null }
type Intent = {kind:'create';sectionId:string;body:{previousRouteVersionId:string;newRouteVersionId:string;reason:string}} | {kind:'decision';impactId:string;body:{taskId:string;action:ImpactAction;reason:string}}
interface Held {actor:string;key:string;intent:Intent;receipt?:GeometryImpactView|ImpactDecision;rejected?:boolean;phase?:'not_sent'|'post_unknown'|'rejected'|'receipt'}
const keyFor=(p:string)=>`rg_impact_${useAuthStore.getState().user?.id}_${p}`
const busy=new Set<string>()
function writer(project:string) {
  const state=useAuthStore.getState(),id=state.user?.id,epoch=state.authEpoch
  if(!project||!state.isAuthenticated||!id||state.user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ Chỉ huy trưởng được ghi đánh giá ảnh hưởng.')
  return()=>{const now=useAuthStore.getState();if(!now.isAuthenticated||now.user?.id!==id||now.authEpoch!==epoch||now.user.role!==RoleCode.PROJECT_MANAGER)throw new Error('Phiên đã thay đổi; giữ lệnh để đối chiếu.')}
}
export const geometryImpactCommands={
  pending(project:string):Held|null {const raw=sessionStorage.getItem(keyFor(project));return raw?JSON.parse(raw):null},
  result(project:string,impactId:string):{impact:GeometryImpactView;decision?:ImpactDecision}|null {
    const raw=sessionStorage.getItem(keyFor(project)+'_result')
    if(!raw)return null
    const value=JSON.parse(raw)
    return value.impact?.projectId===project&&value.impact?.id===impactId?value:null
  },
  async revise(project:string) {
    const current=writer(project),held=this.pending(project)
    if(!held?.rejected||held.receipt)throw new Error('Chỉ sửa lệnh đã bị từ chối xác định; không bỏ lệnh chưa rõ kết quả.')
    if(held.intent.kind==='decision')await geometryImpactService.readImpact(project,held.intent.impactId)
    else await alignmentService.readConfirmedGeometry(project,held.intent.sectionId,held.intent.body.newRouteVersionId)
    current();if(this.pending(project)?.key!==held.key)throw new Error('Lệnh đã thay đổi.')
    sessionStorage.removeItem(keyFor(project))
  },
  async run(project:string,intent?:Intent):Promise<{impact:GeometryImpactView;decision?:ImpactDecision}> {
    const current=writer(project),storage=keyFor(project)
    if(busy.has(storage))throw new Error('Đang xử lý; không gửi trùng.')
    let held=this.pending(project)
    if(held?.phase==='not_sent'){sessionStorage.removeItem(storage);held=null}
    if(held&&intent&&JSON.stringify(held.intent)!==JSON.stringify(intent))throw new Error('Giữ nguyên ý định/key của lệnh đang chờ.')
    if(held?.rejected)throw new Error('Đối chiếu lệnh bị từ chối trước khi sửa ý định.')
    if(!held){
      if(!intent||!intent.body.reason.trim())throw new Error('Cần lý do.')
      if(intent.kind==='create'&&(!intent.sectionId||!intent.body.previousRouteVersionId||!intent.body.newRouteVersionId||intent.body.previousRouteVersionId===intent.body.newRouteVersionId))throw new Error('Chọn hai phiên bản tuyến khác nhau trong cùng đoạn đường.')
      if(intent.kind==='decision'&&(!intent.impactId||!intent.body.taskId||!['VERIFY','CONTINUE','STOP','REASSIGN'].includes(intent.body.action)))throw new Error('Quyết định hoặc nhiệm vụ chưa hợp lệ.')
      held={actor:useAuthStore.getState().user!.id,key:crypto.randomUUID(),phase:'not_sent',intent:JSON.parse(JSON.stringify(intent))};sessionStorage.setItem(storage,JSON.stringify(held))
    }
    busy.add(storage)
    let postAttempted=false
    try {
      const i=held.intent
      if(!held.receipt){
        if(i.kind==='create'){
          const old=await alignmentService.readConfirmedGeometry(project,i.sectionId,i.body.previousRouteVersionId),next=await alignmentService.readConfirmedGeometry(project,i.sectionId,i.body.newRouteVersionId);current()
          if([old,next].some((v,n)=>v.projectId!==project||v.roadSectionId!==i.sectionId||v.routeVersionId!==(n?i.body.newRouteVersionId:i.body.previousRouteVersionId)))throw new Error('Hai phiên bản tuyến trả sai phạm vi.')
        }else{
          const impact=await geometryImpactService.readImpact(project,i.impactId);current()
          if(!impact.references?.some(r=>r.id===i.body.taskId&&['FIELD_TASK','SURVEY_TASK'].includes(r.kind||'')))throw new Error('Nhiệm vụ không thuộc danh sách bị ảnh hưởng.')
        }
        const path=`/projects/${project}/geometry-location-impacts${i.kind==='decision'?`/${i.impactId}/decisions`:''}`
        held.phase='post_unknown';sessionStorage.setItem(storage,JSON.stringify(held))
        postAttempted=true
        const response=await apiClient.post(path,i.body,{headers:{'Idempotency-Key':held.key}});current()
        held.receipt=response.data;held.phase='receipt';sessionStorage.setItem(storage,JSON.stringify(held))
        if(![200,201].includes(response.status))throw new Error(`HTTP ${response.status}: giữ kết quả để đối chiếu.`)
      }
      let impact:GeometryImpactView,decision:ImpactDecision|undefined
      if(i.kind==='create'){
        const receipt=held.receipt as GeometryImpactView
        if(!receipt?.id||receipt.projectId!==project||receipt.previousRouteVersionId!==i.body.previousRouteVersionId||receipt.newRouteVersionId!==i.body.newRouteVersionId)throw new Error('Kết quả tạo sai phạm vi; giữ receipt.')
        impact=await geometryImpactService.readImpact(project,receipt.id);current()
        if(impact.previousRouteVersionId!==receipt.previousRouteVersionId||impact.newRouteVersionId!==receipt.newRouteVersionId||JSON.stringify(impact.references??null)!==JSON.stringify(receipt.references??null))throw new Error('Đọc lại đánh giá không khớp kết quả tạo.')
      }else{
        decision=held.receipt as ImpactDecision
        if(!decision?.id||decision.impactId!==i.impactId||decision.taskId!==i.body.taskId||decision.action!==i.body.action||decision.reason!==i.body.reason.trim()||!Number.isFinite(Date.parse(decision.occurredAt)))throw new Error('Kết quả quyết định không khớp yêu cầu; giữ receipt.')
        impact=await geometryImpactService.readImpact(project,i.impactId);current()
        if(!impact.references?.some(r=>r.id===decision!.taskId&&['FIELD_TASK','SURVEY_TASK'].includes(r.kind||'')))throw new Error('Đọc lại không có nhiệm vụ trong đánh giá.')
      }
      sessionStorage.setItem(storage+'_result',JSON.stringify({impact,decision}))
      sessionStorage.removeItem(storage)
      return {impact,decision}
    }catch(e:any){
      if(held.phase==='not_sent'&&this.pending(project)?.key===held.key)sessionStorage.removeItem(storage)
      current()
      if(postAttempted&&!held.receipt&&held.phase==='post_unknown'&&[400,403,404,409,412,415,422,428].includes(e?.response?.status)){held.rejected=true;held.phase='rejected';sessionStorage.setItem(storage,JSON.stringify(held))}
      throw e
    }
    finally{busy.delete(storage)}
  }
}
