import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { surveyPlanningService, type SurveyScope } from './surveyPlanningService'
export interface SurveyCreateInput {scope: SurveyScope[]; plannedAt: string; surveyType: 'BASELINE'|'PERIODIC'|'AD_HOC'; operatorId: string; dueAt?: string}
interface Command {actor: string; projectId: string; input: SurveyCreateInput; planKey: string; taskKey: string; planId?: string; taskId?: string; planReceived?:boolean; taskReceived?:boolean; phase:'PLAN'|'TASK'|'READBACK'|'DONE'; lastError?: {status?: number; code?: string; correlationId?: string}}
// BE đã trả một mã 4xx dứt khoát (không phải hết giờ/429) nghĩa là lệnh đó chắc chắn không có tác động.
const definiteReject = (status?: number) => typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429
const ACTIVE_PLAN = ['PLANNED', 'IN_PROGRESS']
const running = new Set<string>()
const key = (project: string) => `rg_web_survey_create_${useAuthStore.getState().user?.id}_${project}`
const same = (a: unknown,b: unknown) => JSON.stringify(a) === JSON.stringify(b)
export const surveyCreateCommands = {
  pending(projectId: string): Command | null {const raw=sessionStorage.getItem(key(projectId));if(!raw)return null;const c=JSON.parse(raw) as Command;if(c.actor!==useAuthStore.getState().user?.id||c.projectId!==projectId||!c.planKey||!c.taskKey||!c.input?.scope?.length||!['PLAN','TASK','READBACK','DONE'].includes(c.phase))throw new Error('Journal khảo sát sai phạm vi; không gửi lệnh mới.');return c},
  newRequest(projectId: string) {const c=this.pending(projectId);if(c?.phase!=='DONE'||running.has(key(projectId)))throw new Error('Chưa hoàn tất yêu cầu cũ.');sessionStorage.removeItem(key(projectId))},
  /** Kế hoạch đang hoạt động (PLANNED/IN_PROGRESS) cùng route, segment set và dải với phạm vi đã chọn — chỉ từ GET survey-plans của BE. */
  async activePlansForScope(projectId: string, scope: SurveyScope[]) {
    const plans = await surveyPlanningService.records(projectId, 'PLAN') as Array<{id: string; status: string; plannedAt?: string; scopeSummary?: Array<{routeVersionId: string; segmentSetId: string; targetBand: string}>}>
    return plans.filter(p => ACTIVE_PLAN.includes(p.status) && Array.isArray(p.scopeSummary) && scope.every(s => p.scopeSummary!.some(x => x.routeVersionId === s.routeVersionId && x.segmentSetId === s.segmentSetId && x.targetBand === s.targetBand)))
      .map(p => ({id: p.id, status: p.status, plannedAt: p.plannedAt}))
  },
  /**
   * Bỏ yêu cầu đang dở khi AN TOÀN. Trả {released:true} nếu journal đã được xóa.
   * - Chưa có biên nhận: BE từng từ chối dứt khoát (4xx) hoặc GET survey-plans không thấy kế hoạch trùng lịch/phạm vi → coi như chưa tạo, xóa journal.
   *   Nếu GET thấy kế hoạch khớp thì KHÔNG xóa (có thể đã tạo): để người dùng đối chiếu bằng nút "Đối chiếu và thử lại" (phát lại cùng khóa).
   * - Đã có kế hoạch nhưng BE từ chối dứt khoát bước giao nhiệm vụ: bỏ journal, kế hoạch vẫn nằm ở BE (trả planId để mở).
   * - Còn lại (đang đọc lại, kết quả chưa rõ): giữ nguyên key/body.
   */
  async discard(projectId: string): Promise<{released: boolean; reason?: 'running' | 'plan-exists' | 'partial' | 'unknown'; planId?: string; plan?: {id: string; status: string; plannedAt?: string}}> {
    const k = key(projectId)
    if (running.has(k)) return {released: false, reason: 'running'}
    const c = this.pending(projectId)
    if (!c) return {released: true}
    if (c.phase === 'DONE') { sessionStorage.removeItem(k); return {released: true} }
    const noReceipt = !c.planReceived && !c.planId && !c.taskReceived && !c.taskId
    if (noReceipt) {
      if (definiteReject(c.lastError?.status)) { sessionStorage.removeItem(k); return {released: true} }
      const existing = (await this.activePlansForScope(projectId, c.input.scope)).find(p => p.plannedAt && new Date(p.plannedAt).toISOString() === c.input.plannedAt)
      if (existing) return {released: false, reason: 'plan-exists', plan: existing}
      sessionStorage.removeItem(k); return {released: true}
    }
    if (c.planId && !c.taskReceived && !c.taskId && c.phase === 'TASK' && definiteReject(c.lastError?.status)) { sessionStorage.removeItem(k); return {released: true, planId: c.planId} }
    return {released: false, reason: c.planId ? 'partial' : 'unknown', planId: c.planId}
  },
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
    // persisted: chỉ ghi journal khi đã qua bước kiểm tra trước khi gửi (hoặc journal đã tồn tại); lỗi kiểm tra không được khóa form.
    let persisted=!!this.pending(projectId)
    running.add(journal);const save=()=>sessionStorage.setItem(journal,JSON.stringify(c))
    const detail=async(id:string,kind:'PLAN'|'TASK')=>{const d=await surveyPlanningService.detail(projectId,id,kind);active();if(!same(d.scope,c!.input.scope))throw new Error('GET scope không khớp yêu cầu đã lưu.');if(kind==='TASK'&&d.operatorId!==c!.input.operatorId)throw new Error('GET Operator không khớp lệnh giao việc.');return d}
    try{
      if(!this.pending(projectId)){
        if(!(await surveyPlanningService.operators(projectId)).some(o=>o.id===c!.input.operatorId))throw new Error('Operator không còn hiệu lực trong dự án.')
        const projects=await surveyPlanningService.projects(),project=projects.find(p=>p.projectId===projectId);if(!project)throw new Error('Dự án không thuộc phiên PM.');
        const routes=await surveyPlanningService.routes(project);
        for(const s of c.input.scope){const r=routes.find(r=>r.routeVersionId===s.routeVersionId&&r.serverSet?.id===s.segmentSetId);if(!r||!s.segmentIds.length||s.segmentIds.some(id=>!r.serverSet!.segments.some(seg=>seg.id===id))||!['SURFACE','LEFT_EDGE','RIGHT_EDGE'].includes(s.targetBand))throw new Error('Scope không còn thuộc bộ PUBLISHED vừa đọc.')}
      }
      active();save();persisted=true
      if(c.planReceived&&!c.planId||c.taskReceived&&!c.taskId)throw new Error('Receipt thiếu ID; chưa thể đọc lại, không POST lại để đoán kết quả.')
      if(!c.planId){const r=await apiClient.post(`/projects/${projectId}/survey-plans`,{scope:c.input.scope,plannedAt:c.input.plannedAt,surveyType:c.input.surveyType},{headers:{'Idempotency-Key':c.planKey}});active();c.planReceived=true;c.planId=r.data?.projectId===projectId?r.data.id:undefined;save();if(!c.planId)throw new Error('Receipt kế hoạch sai ID/phạm vi.');c.phase='TASK';save()}
      const plan=await detail(c.planId!,'PLAN')
      if(new Date(plan.plannedAt!).toISOString()!==c.input.plannedAt)throw new Error('GET lịch kế hoạch không khớp.')
      if(!c.taskId){const r=await apiClient.post(`/projects/${projectId}/survey-tasks`,{planId:c.planId,scope:c.input.scope,surveyType:c.input.surveyType,operatorId:c.input.operatorId,...(c.input.dueAt?{dueAt:c.input.dueAt}:{})},{headers:{'Idempotency-Key':c.taskKey}});active();c.taskReceived=true;c.taskId=r.data?.projectId===projectId?r.data.id:undefined;save();if(!c.taskId)throw new Error('Receipt nhiệm vụ sai ID/phạm vi.');c.phase='READBACK';save()}
      const task=await detail(c.taskId!,'TASK'),freshPlan=await detail(c.planId!,'PLAN');if(freshPlan.status!=='IN_PROGRESS')throw new Error('GET kế hoạch chưa IN_PROGRESS sau giao nhiệm vụ.');c.phase='DONE';save();return {plan:freshPlan,task}
    }catch(e:any){
      active()
      const status=e?.response?.status as number|undefined,reject=definiteReject(status)
      if(persisted)c.lastError={status,code:e?.response?.data?.code,correlationId:e?.response?.data?.correlationId}
      // POST kế hoạch bị BE từ chối dứt khoát (vd 409): chưa tạo gì → giải phóng journal để nhập lại.
      if(reject&&c.phase==='PLAN'&&!c.planReceived&&!c.planId){sessionStorage.removeItem(journal);throw Object.assign(e,{surveyPhase:c.phase,journalReleased:true,definiteReject:true})}
      if(persisted)save()
      throw Object.assign(e,{surveyPhase:c.phase,planId:c.planId,taskId:c.taskId,definiteReject:reject})
    }finally{running.delete(journal)}
  }
}
