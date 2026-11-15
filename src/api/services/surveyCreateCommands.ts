import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { surveyPlanningService, type SurveyScope } from './surveyPlanningService'
export interface SurveyCreateInput {scope: SurveyScope[]; plannedAt: string; surveyType: 'BASELINE'|'PERIODIC'|'AD_HOC'; operatorId: string; dueAt?: string}
interface Command {actor: string; projectId: string; input: SurveyCreateInput; planKey: string; taskKey: string; planId?: string; taskId?: string; planReceived?:boolean; taskReceived?:boolean; phase:'PLAN'|'TASK'|'READBACK'|'DONE'}
const running = new Set<string>()
const key = (project: string) => `rg_web_survey_create_${useAuthStore.getState().user?.id}_${project}`
const same = (a: unknown,b: unknown) => JSON.stringify(a) === JSON.stringify(b)
export const surveyCreateCommands = {
  pending(projectId: string): Command | null {const raw=sessionStorage.getItem(key(projectId));if(!raw)return null;const c=JSON.parse(raw) as Command;if(c.actor!==useAuthStore.getState().user?.id||c.projectId!==projectId||!c.planKey||!c.taskKey||!c.input?.scope?.length||!['PLAN','TASK','READBACK','DONE'].includes(c.phase))throw new Error('Journal khảo sát sai phạm vi; không gửi lệnh mới.');return c},
  newRequest(projectId: string) {const c=this.pending(projectId);if(c?.phase!=='DONE'||running.has(key(projectId)))throw new Error('Chưa hoàn tất yêu cầu cũ.');sessionStorage.removeItem(key(projectId))},
  async run(projectId: string, input?: SurveyCreateInput) {
    const auth=useAuthStore.getState(), journal=key(projectId),epoch=auth.authEpoch,actor=auth.user?.id
    if(auth.user?.role!==RoleCode.PROJECT_MANAGER||!actor)throw new Error('Chỉ PM được tạo kế hoạch và giao nhiệm vụ.')
    const active=()=>{if(useAuthStore.getState().authEpoch!==epoch||useAuthStore.getState().user?.id!==actor)throw new Error('Phiên khảo sát thay đổi; giữ journal cũ.')}
    let c=this.pending(projectId)
    if(c&&input&&!same(c.input,input))throw new Error('Giữ nguyên yêu cầu đang chờ; không tạo lại kế hoạch.')
    if(!c){
      if(!input||!input.scope.length||!['BASELINE','PERIODIC','AD_HOC'].includes(input.surveyType)||!Number.isFinite(Date.parse(input.plannedAt))||input.dueAt&&!Number.isFinite(Date.parse(input.dueAt)))throw new Error('Thiếu phạm vi, loại khảo sát hoặc lịch hợp lệ.')
      c={actor,projectId,input:JSON.parse(JSON.stringify(input)),planKey:crypto.randomUUID(),taskKey:crypto.randomUUID(),phase:'PLAN'}
    }
    if(running.has(journal))throw new Error('Đang xử lý kế hoạch/nhiệm vụ.')
    running.add(journal);const save=()=>sessionStorage.setItem(journal,JSON.stringify(c))
    const detail=async(id:string,kind:'PLAN'|'TASK')=>{const d=await surveyPlanningService.detail(projectId,id,kind);active();if(!same(d.scope,c!.input.scope))throw new Error('GET scope không khớp yêu cầu đã lưu.');if(kind==='TASK'&&d.operatorId!==c!.input.operatorId)throw new Error('GET Operator không khớp lệnh giao việc.');return d}
    try{
      if(!this.pending(projectId)){
        if(!(await surveyPlanningService.operators(projectId)).some(o=>o.id===c!.input.operatorId))throw new Error('Operator không còn hiệu lực trong dự án.')
        const projects=await surveyPlanningService.projects(),project=projects.find(p=>p.projectId===projectId);if(!project)throw new Error('Dự án không thuộc phiên PM.');
        const routes=await surveyPlanningService.routes(project);
        for(const s of c.input.scope){const r=routes.find(r=>r.routeVersionId===s.routeVersionId&&r.serverSet?.id===s.segmentSetId);if(!r||!s.segmentIds.length||s.segmentIds.some(id=>!r.serverSet!.segments.some(seg=>seg.id===id))||!['SURFACE','LEFT_EDGE','RIGHT_EDGE'].includes(s.targetBand))throw new Error('Scope không còn thuộc bộ PUBLISHED vừa đọc.')}
      }
      active();save()
      if(c.planReceived&&!c.planId||c.taskReceived&&!c.taskId)throw new Error('Receipt thiếu ID; chưa thể đọc lại, không POST lại để đoán kết quả.')
      if(!c.planId){const r=await apiClient.post(`/projects/${projectId}/survey-plans`,{scope:c.input.scope,plannedAt:c.input.plannedAt,surveyType:c.input.surveyType},{headers:{'Idempotency-Key':c.planKey}});active();c.planReceived=true;c.planId=r.data?.projectId===projectId?r.data.id:undefined;save();if(!c.planId)throw new Error('Receipt kế hoạch sai ID/phạm vi.');c.phase='TASK';save()}
      const plan=await detail(c.planId!,'PLAN')
      if(new Date(plan.plannedAt!).toISOString()!==c.input.plannedAt)throw new Error('GET lịch kế hoạch không khớp.')
      if(!c.taskId){const r=await apiClient.post(`/projects/${projectId}/survey-tasks`,{planId:c.planId,scope:c.input.scope,surveyType:c.input.surveyType,operatorId:c.input.operatorId,...(c.input.dueAt?{dueAt:c.input.dueAt}:{})},{headers:{'Idempotency-Key':c.taskKey}});active();c.taskReceived=true;c.taskId=r.data?.projectId===projectId?r.data.id:undefined;save();if(!c.taskId)throw new Error('Receipt nhiệm vụ sai ID/phạm vi.');c.phase='READBACK';save()}
      const task=await detail(c.taskId!,'TASK'),freshPlan=await detail(c.planId!,'PLAN');if(freshPlan.status!=='IN_PROGRESS')throw new Error('GET kế hoạch chưa IN_PROGRESS sau giao nhiệm vụ.');c.phase='DONE';save();return {plan:freshPlan,task}
    }catch(e:any){active();save();throw Object.assign(e,{surveyPhase:c.phase,planId:c.planId,taskId:c.taskId})}finally{running.delete(journal)}
  }
}
