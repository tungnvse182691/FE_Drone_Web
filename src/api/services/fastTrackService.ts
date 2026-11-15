import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { triageGeometryService } from './triageGeometryService'
import { projectService } from './projectService'
import { workflowCollection } from './workflowCollection'
import { repairWorkflowService } from './repairWorkflowService'
import { fastTrackCommand, fastTrackStorage, fastTrackPending } from './fastTrackJournal'
import type { PolicyThresholdConfig, DefectItem, CrewTeam, ProjectOption, RoadCoverageFact, RoadCoverageInputDto, DispatchPayload } from '../../pages/(pm)/fast-track/types'
export type { PolicyThresholdConfig, RoadCoverageFact, RoadCoverageInputDto, ProjectOption }
export interface RepairMeasurementRule { code: string; unit: string; minimum: number; maximum: number }
export interface RepairPolicyDefinitionInput { defectTypeCode: string; checklistVersion: string; measurements: RepairMeasurementRule[]; stopConditions: string[]; reason: string }
export interface RepairPolicyView extends RepairPolicyDefinitionInput { id: string; projectId: string; currentChangeId?: string; publishedRevisionId?: string; revision?: number; state: string; actorId: string; at: string; version: string }
export interface RoadCoverageReadFact { projectId: string; scopes: NonNullable<RoadCoverageFact['scopes']>; sources: NonNullable<RoadCoverageFact['sources']>; history: any[]; version: string }
const requireProject = (p: string) => { if (!p) throw new Error('Chọn dự án trước khi thao tác.') }
async function versioned<T extends {version: string}>(path: string) {
  const response = await apiClient.get<T>(path)
  if (!response.data?.version || response.headers.etag !== `"${response.data.version}"`) throw new Error('Thiếu phiên bản hoặc ETag không khớp hồ sơ.')
  return response
}
function refs(project: string): Array<{id: string; kind: 'drafts' | 'revisions'}> {
  return JSON.parse(localStorage.getItem(fastTrackStorage(project, 'policy-refs')) || '[]')
}
function remember(project: string, row: RepairPolicyView, kind: 'drafts' | 'revisions') {
  const next = refs(project).filter(r => r.id !== row.id); next.push({id: row.id, kind})
  localStorage.setItem(fastTrackStorage(project, 'policy-refs'), JSON.stringify(next))
}
export const fastTrackService = {
  async getProjects(): Promise<ProjectOption[]> {
    return (await projectService.fetchProjects()).map(p => ({id: p.id, name: p.name, projectCode: p.code}))
  },
  async getRoadCoverage(projectId: string): Promise<RoadCoverageFact> {
    requireProject(projectId)
    const {data, headers} = await versioned<RoadCoverageReadFact>(`/projects/${projectId}/road-coverage`)
    if (data.projectId !== projectId || !Array.isArray(data.scopes) || !Array.isArray(data.sources) || !Array.isArray(data.history)) throw new Error('Hồ sơ độ phủ sai phạm vi/cấu trúc.')
    const scope = data.scopes.length === 1 ? data.scopes[0] : undefined
    const history = scope ? data.history.filter(h => h.scopeObligationId === scope.obligationId).sort((a,b) => Date.parse(b.confirmedAtUtc)-Date.parse(a.confirmedAtUtc))[0] : undefined
    return {projectId, projectName: '', scopeObligationId: scope?.obligationId || '', scopeHash: scope?.scopeHash,
      fromKm: scope ? scope.from/1000 : 0, toKm: scope ? scope.to/1000 : 0, sourceKind: history?.sourceKind || 'MAINTENANCE_BASIS',
      handoverDocumentId: history?.handoverDocumentId, handoverVersion: history?.handoverVersion || '',
      applicableFromUtc: history?.applicableFromUtc || '', applicableToUtc: history?.applicableToUtc || '',
      status: history?.provenance==='REAL_SOURCE' ? 'CONFIRMED' : 'PENDING', provenance: history?.provenance,
      confirmedBy: history?.actorId, confirmedAt: history?.confirmedAtUtc, reason: history?.reason,
      sourceId: history?.sourceId, sourceVersion: history?.sourceVersion, etag: headers.etag,
      scopes: data.scopes, sources: data.sources, history:data.history, hasWarrantySource:data.sources.some(s=>s.kind==='WARRANTY'), blockers: data.sources.some(s=>s.kind==='HANDOVER') ? [] : ['Chưa có hồ sơ bàn giao đã được chấp nhận. Không thể xác nhận độ phủ.']}
  },
  async confirmRoadCoverage(p: string, input: RoadCoverageInputDto, ifMatch: string): Promise<RoadCoverageReadFact> {
    return fastTrackCommand(p, 'coverage', `/projects/${p}/road-coverage`, input, async () => {
      const current = await this.getRoadCoverage(p)
      const scope = current.scopes?.find(s=>s.obligationId===input.scopeObligationId)
      const handover = current.sources?.find(s=>s.kind==='HANDOVER' && s.id===input.handoverDocumentId && s.version===input.handoverVersion)
      const source = current.sources?.find(s=>s.kind===input.sourceKind && s.id===input.sourceId && s.version===input.sourceVersion)
      if (!scope || scope.scopeHash!==input.expectedScopeHash || !handover || !source || current.etag!==ifMatch) throw new Error('Căn cứ độ phủ thiếu hoặc đã thay đổi; đọc lại hồ sơ trước khi xác nhận.')
      if (input.provenance==='REAL_SOURCE' && [handover,source].some(s=>s.provenance!=='REAL_SOURCE')) throw new Error('Nguồn thử nghiệm/chưa xác minh không được đổi thành nguồn đã xác minh thực tế.')
      return current.etag
    }, async receipt => {
      const response = await versioned<RoadCoverageReadFact>(`/projects/${p}/road-coverage`)
      if (receipt?.projectId!==p || response.data.projectId!==p || !response.data.history.some(h=>h.scopeObligationId===input.scopeObligationId && h.reason===input.reason)) throw new Error('Đã có phản hồi ghi nhưng chưa đối chiếu được xác nhận độ phủ. Chỉ đọc lại.')
      return response.data
    })
  },
  async getPolicyDraft(p: string, id: string): Promise<RepairPolicyView> { return this.readPolicy(p,id,'drafts') },
  async getPolicyRevision(p: string, id: string): Promise<RepairPolicyView> { return this.readPolicy(p,id,'revisions') },
  async readPolicy(p: string, id: string, kind: 'drafts' | 'revisions'): Promise<RepairPolicyView> {
    requireProject(p)
    const {data} = await versioned<RepairPolicyView>(`/projects/${p}/repair-policies/${kind}/${id}`)
    if (data.id!==id || data.projectId!==p || !Array.isArray(data.measurements)) throw new Error('Chính sách sai phạm vi hoặc thiếu quy tắc.')
    remember(p,data,kind); return data
  },
  policyView(row: RepairPolicyView): PolicyThresholdConfig {
    return {id: row.id, version: row.checklistVersion, status: row.state==='PUBLISHED' ? 'ACTIVE' : row.state==='DRAFT' ? 'DRAFT' : 'ARCHIVED',
      maxAreaM2: row.measurements.find(r=>r.code==='Area' && r.unit==='m2')?.maximum ?? NaN,
      maxDepthCm: row.measurements.find(r=>r.code==='DepressionDepth' && r.unit==='mm')?.maximum ?? NaN,
      allowedSeverities: [], activatedBy: row.actorId, activatedAt: row.at, appliedRoute: 'Phạm vi chính sách của dự án', description: row.reason,
      defectTypeCode: row.defectTypeCode, stopConditions: row.stopConditions, revision: row.revision, rules: row.measurements}
  },
  async getPolicies(p: string): Promise<RepairPolicyView[]> {
    // There is no canonical policy collection. References are receipts or explicitly entered IDs, never guessed.
    if (useAuthStore.getState().user?.role !== 'PROJECT_MANAGER') return []
    return Promise.all(refs(p).map(r => this.readPolicy(p,r.id,r.kind)))
  },
  async getActivePolicy(p: string): Promise<PolicyThresholdConfig | null> {
    const rows = (await this.getPolicies(p)).filter(r=>r.state==='PUBLISHED')
    return rows.length === 1 ? this.policyView(rows[0]) : null
  },
  async createPolicyDraft(p: string, input: RepairPolicyDefinitionInput): Promise<RepairPolicyView> {
    return fastTrackCommand(p,'policy-create',`/projects/${p}/repair-policies/drafts`,input,async()=>undefined,async receipt=> {
      if (!receipt?.id || receipt.projectId!==p) throw new Error('Receipt chính sách sai phạm vi.')
      return this.getPolicyDraft(p,receipt.id)
    })
  },
  async publishPolicy(p: string, id: string, reason: string, _version?: string): Promise<RepairPolicyView> {
    if(!fastTrackPending(p,`policy-publish:${id}`)) {
      const current=await this.getPolicyDraft(p,id)
      if(current.state==='PUBLISHED' && current.publishedRevisionId)return this.getPolicyRevision(p,current.publishedRevisionId)
    }
    return fastTrackCommand(p,`policy-publish:${id}`,`/projects/${p}/repair-policies/drafts/${id}/publish`,{reason},async()=> {
      const row = await this.getPolicyDraft(p,id)
      if (row.state!=='DRAFT') throw new Error('Bản dự thảo không còn được phép xuất bản.')
      return `"${row.version}"`
    },async receipt=> {
      if (!receipt?.id || receipt.projectId!==p) throw new Error('Receipt xuất bản sai phạm vi.')
      const row = await this.getPolicyRevision(p,receipt.id)
      if (row.state!=='PUBLISHED') throw new Error('Chưa xác nhận chính sách đã xuất bản.')
      return row
    })
  },
  async getCrews(p: string): Promise<CrewTeam[]> {
    const rows = await projectService.fetchProjectMembers(p)
    const day = new Date().toISOString().slice(0,10)
    return rows.filter((m:any)=>m.role==='CREW' && m.status==='ACTIVE' && m.validFrom<=day && (!m.validTo || m.validTo>=day)).map((m:any)=>({id:m.userId,name:m.displayName,leader:m.displayName,role:m.role,isAvailable:true}))
  },
  async getDefects(p: string): Promise<DefectItem[]> {
    const packages = await repairWorkflowService.packages(p)
    const supervisor=useAuthStore.getState().user?.role==='SUPERVISOR'
    // The Supervisor can read repair collections but not the defect collection in this runtime.
    // Carry only the package's authoritative defect reference; leave unavailable fields explicit.
    const defects = supervisor
      ? [...new Set(packages.map(pkg=>pkg.defectId))].map(id=>({id,projectId:p,defectTypeCode:'',severity:'Chưa có quyền đọc hồ sơ gốc',status:'',version:''}))
      : await repairWorkflowService.defects(p)
    const result: DefectItem[] = []
    for (const d of defects) {
      const items = (await Promise.all(packages.filter(pkg=>pkg.defectId===d.id).map(async pkg=>(await repairWorkflowService.items(p,pkg.id)).filter(i=>i.mode==='FastTrack').map(i=>({...i,packageId:pkg.id}))))).flat()
      for (const i of items.length ? items : [null]) {
        let eligible = false, known = false, reason = i ? 'Chưa đánh giá thi công. Giao việc có điều kiện; Crew phải kiểm tra nguồn và số đo trước khi thi công.' : 'Chưa có hạng mục Fast Track. Cần lập gói/nghĩa vụ và đề xuất hạng mục trước khi giao việc.'
        if (i && i.state!=='ReadyToAssign') {
          try {
            const e = await repairWorkflowService.eligibility(p,i.packageId,i.id)
            eligible=e.eligible;known=true;reason=e.missingReasons.join('; ')
          } catch(error:any) {
            reason=`Không đọc được điều kiện: HTTP ${error.response?.status || 'network'} ${error.response?.data?.code || error.message}`
          }
        }
        result.push({id:i?.id || d.id,defectId:d.id,code:`DEF-${d.id.slice(0,8)}${i ? ' · FT' : ''}`,projectId:p,defectTypeCode:d.defectTypeCode || '',severity:(d as any).severity || 'Chưa có thông tin',status:i?.state || d.status || '',version:i?.version || d.version,
          packageId:i?.packageId,itemId:i?.id,obligationId:i?.obligationId,canAssign:!!i && (i.state==='ReadyToAssign' || !!fastTrackPending(p,`assign:${i.id}`)),eligibilityKnown:known,isFastTrackEligible:eligible,violationReason:reason})
      }
    }
    if(result.some(r=>r.itemId && r.status!=='ReadyToAssign')) {
      const tasks=await workflowCollection<any>(`/projects/${p}/field-inspection-tasks`,p)
      for(const row of result) {
        const matches=tasks.filter(t=>t.repairContext?.itemId===row.itemId && t.repairContext?.packageId===row.packageId)
        if(matches.length===1)row.assignedCrewId=matches[0].assignedToUserId
        else if(matches.length>1)throw new Error('Có nhiều binding nhiệm vụ cho một hạng mục; cần đối chiếu nguồn.')
      }
    }
    return result
  },
  async prepareItem(row:DefectItem, input:{fromMeters:number;toMeters:number;offsetFromMeters:number;offsetToMeters:number;segmentSetId:string|null;layoutRevisionId:string|null;slabId:string|null;repairPlan:string;checklistVersion:string;reason:string}) {
    const p=row.projectId, storage=fastTrackStorage(p,`prepare:${row.defectId || row.id}`)
    if(row.itemId)throw new Error('Hạng mục đã tồn tại. Đọc lại danh sách, không lập trùng.')
    const defect=(await versioned<any>(`/projects/${p}/defects/${row.defectId || row.id}`)).data
    if(defect.projectId!==p || defect.id!==(row.defectId || row.id))throw new Error('Nguồn khiếm khuyết sai phạm vi.')
    if(!input.reason.trim() || !input.repairPlan.trim() || !input.checklistVersion.trim() || ![input.fromMeters,input.toMeters,input.offsetFromMeters,input.offsetToMeters].every(Number.isFinite) || input.fromMeters<0 || input.toMeters<=input.fromMeters || input.offsetToMeters<=input.offsetFromMeters)throw new Error('Nhập đủ phạm vi vật lý, phương án, checklist và căn cứ; không dùng kích thước AI làm số đo.')
    const roads=await triageGeometryService.routes(p),road=roads.find(r=>r.currentVersionId===defect.roadSectionVersionId)
    if(!road)throw new Error('Khiếm khuyết không thuộc tuyến hiện hành.')
    if(input.segmentSetId && !(await triageGeometryService.sets(p,road)).some(s=>s.id===input.segmentSetId))throw new Error('Bộ phân đoạn chưa công bố hoặc sai tuyến.')
    let pipeline=JSON.parse(localStorage.getItem(storage)||'null')
    if(pipeline && JSON.stringify(pipeline.input)!==JSON.stringify(input))throw new Error('Đang giữ gói đã tạo. Dùng lại đúng phương án để đề xuất tiếp; không tạo gói trùng.')
    if(!pipeline) {
      const {repairPlan,checklistVersion,reason,...scope}=input
      const body={defectId:defect.id,defectVersion:defect.version,obligations:[{kind:'FORMAL_REPAIR',mandatory:true,scope:{...scope,physicalRoadId:road.roadSectionId,routeVersionId:road.currentVersionId},reason}],reason}
      const pkg=await fastTrackCommand(p,`package:${defect.id}`,`/projects/${p}/repair-packages`,body,async()=>`"${defect.version}"`,async receipt=> {
        if(receipt?.projectId!==p || receipt.defectId!==defect.id || !receipt.version || receipt.unresolvedMandatoryObligationIds?.length!==1)throw new Error('Receipt tạo gói thiếu nghĩa vụ. Giữ receipt, không tạo lại.')
        if(!(await repairWorkflowService.packages(p)).some(r=>r.id===receipt.id))throw new Error('Chưa đọc lại được gói đã tạo.')
        return receipt
      })
      pipeline={input,pkg};localStorage.setItem(storage,JSON.stringify(pipeline));localStorage.removeItem(fastTrackStorage(p,`package:${defect.id}`))
    }
    const pkg=pipeline.pkg, base=`/projects/${p}/repair-packages/${pkg.id}/items`
    await fastTrackCommand(p,`propose:${pkg.id}`,base,{obligationId:pkg.unresolvedMandatoryObligationIds[0],mode:'FAST_TRACK',repairPlan:input.repairPlan,checklistVersion:input.checklistVersion,reason:input.reason},async()=>`"${pkg.version}"`,async receipt=> {
      if(receipt?.projectId!==p || receipt.mode!=='FastTrack' || !receipt.id)throw new Error('Receipt hạng mục không khớp Fast Track.')
      const item=(await versioned<any>(`${base}/${receipt.id}`)).data
      if(item.id!==receipt.id || item.projectId!==p || item.mode!=='FastTrack')throw new Error('Chưa đọc lại được hạng mục đã đề xuất.')
      return item
    })
    localStorage.removeItem(storage)
    localStorage.removeItem(fastTrackStorage(p,`propose:${pkg.id}`))
  },
  async executeDispatch(payload: DispatchPayload): Promise<{success: boolean; message: string; count: number}> {
    const p=payload.projectId, crew=(await this.getCrews(p)).find(c=>c.id===payload.crewName)
    if (!crew || !payload.items.length || !payload.notes?.trim()) throw new Error('Chọn Crew hiện hành, hạng mục và ghi rõ chỉ đạo.')
    for (const row of payload.items) {
      if (!row.itemId || !row.packageId || !row.defectId) throw new Error('Chưa có hạng mục sửa chữa để giao việc.')
      const base=`/projects/${p}/repair-packages/${row.packageId}/items/${row.itemId}`
      const operation=`assign:${row.itemId}`
      const d=(await versioned<any>(`/projects/${p}/defects/${row.defectId}`)).data
      const {policyRevisionId,...pins}=payload.task
      let task={...pins,defectId:d.id,defectVersion:d.version,routeVersionId:d.roadSectionVersionId,purpose:'POST_REPAIR',assignedToUserId:crew.id,instructions:payload.notes}
      const held=fastTrackPending(p,operation)
      // Reconcile with the immutable saved assignment, even after defect versions/forms change.
      const saved=held?.body as {task:typeof task;policyRevisionId:string;reason:string} | undefined
      if(saved && !held?.receipt && (saved.reason!==payload.notes || saved.task.assignedToUserId!==crew.id || saved.policyRevisionId!==policyRevisionId || JSON.stringify({...saved.task,defectVersion:task.defectVersion})!==JSON.stringify(task))) throw new Error('Có lệnh giao việc chưa rõ kết quả. Giữ đúng Crew, chỉ đạo, phạm vi và hạn đã gửi để đối chiếu.')
      if(saved)task=saved.task
      const commandPolicy=saved?.policyRevisionId || policyRevisionId
      const commandBody=saved || {task,policyRevisionId:commandPolicy,reason:payload.notes}
      await fastTrackCommand(p,operation,`${base}/assign`,commandBody,async()=> {
        const current=await versioned<any>(base), policy=await this.getPolicyRevision(p,commandPolicy)
        if (current.data.id!==row.itemId || current.data.projectId!==p || current.data.mode!=='FastTrack' || current.data.state!=='ReadyToAssign' || policy.state!=='PUBLISHED' || policy.defectTypeCode!==d.defectTypeCode) throw new Error('Hạng mục/chính sách không còn phù hợp để giao việc.')
        if (!Number.isFinite(Date.parse(task.dueAt)) || Date.parse(task.dueAt)<=Date.now() || !task.measurementScope.trim()) throw new Error('Nhập hạn hoàn thành trong tương lai và phạm vi đo có căn cứ.')
        return current.headers.etag
      },async receipt=> {
        if (receipt?.itemId!==row.itemId || !receipt.taskId || !receipt.assignmentId || receipt.policyRevisionId!==commandPolicy) throw new Error('Receipt giao việc không khớp hạng mục/chính sách.')
        const current=(await versioned<any>(base)).data
        const {data:native}=await apiClient.get(`/projects/${p}/field-inspection-tasks/${receipt.taskId}`)
        if (current.id!==row.itemId || current.state==='ReadyToAssign' || native.id!==receipt.taskId || native.projectId!==p || native.defectId!==row.defectId || native.assignedToUserId!==task.assignedToUserId || native.assignmentId!==receipt.assignmentId || native.repairContext?.itemId!==row.itemId || native.repairContext?.packageId!==row.packageId) throw new Error('Đã có receipt nhưng chưa đối chiếu được nhiệm vụ Crew. Chỉ đọc lại, không giao trùng.')
        return native
      })
    }
    return {success:true,count:payload.items.length,message:`Đã đối chiếu ${payload.items.length} nhiệm vụ đã giao. Crew vẫn phải kiểm tra điều kiện thi công.`}
  }
}
