import { coverageScopeView } from './fastTrackCoverage'
import { assertPolicyRules } from './fastTrackPolicyRules'
import { fastTrackFormSources } from './fastTrackFormSources'
import { defectTypeCatalog } from './defectTypeCatalog'
import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { triageGeometryService } from './triageGeometryService'
import { projectService } from './projectService'
import { repairWorkflowService } from './repairWorkflowService'
import { assertFastTrackMeasurementScope, fastTrackMeasurementScope } from './fastTrackMeasurementScope'
import { fastTrackCommand, fastTrackStorage, fastTrackPending } from './fastTrackJournal'
import type { PolicyThresholdConfig, DefectItem, CrewTeam, ProjectOption, RoadCoverageFact, RoadCoverageInputDto, DispatchPayload } from '../../pages/(pm)/fast-track/types'
export type { PolicyThresholdConfig, RoadCoverageFact, RoadCoverageInputDto, ProjectOption }
export interface RepairMeasurementRule { code: string; unit: string; minimum: number; maximum: number }
export interface RepairPolicyDefinitionInput { defectTypeCode: string; checklistVersion: string; measurements: RepairMeasurementRule[]; stopConditions: string[]; reason: string }
export interface RepairPolicyView extends RepairPolicyDefinitionInput { id: string; projectId: string; currentChangeId?: string; publishedRevisionId?: string; revision?: number; state: string; actorId: string; at: string; version: string; draftId?:string; draftVersion?:string }
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
  const next = refs(project); if(!next.some(r=>r.id===row.id && r.kind===kind))next.push({id:row.id,kind})
  localStorage.setItem(fastTrackStorage(project, 'policy-refs'), JSON.stringify(next))
}
function proposalChecklist(p:string,pkg:string,item:any):string|undefined {
  const proofs=JSON.parse(localStorage.getItem(fastTrackStorage(p,'proposal-checklists')) || '[]')
  const proof=proofs.find((r:any)=>r.packageId===pkg && r.receipt?.id===item.id && r.receipt.projectId===p && r.receipt.defectId===item.defectId && r.receipt.obligationId===item.obligationId && r.checklistVersion)
  if(proof)return proof.checklistVersion
  const held=fastTrackPending(p,`propose:${pkg}`),body=held?.body as {obligationId?:string;checklistVersion?:string}|undefined
  return held && body && held.receipt?.id===item.id && held.receipt.projectId===p && body.obligationId===item.obligationId ? body.checklistVersion:undefined
}
export const fastTrackService = {
  policyBound(text:string): number | null {
    const parts=/^(\d+)(?:\.(\d{1,6}))?$/.exec(text)
    if(!parts)return null
    const value=Number(text)
    // Do not silently round a user-entered decimal when building the numeric DTO.
    if(!Number.isFinite(value) || value>99999999999999 || value.toFixed(6)!==`${Number(parts[1])}.${(parts[2] || '').padEnd(6,'0')}`)return null
    return value
  },
  async getProjects(): Promise<ProjectOption[]> {
    return (await projectService.fetchProjects()).map(p => ({id: p.id, name: p.name, projectCode: p.code}))
  },
  async getRoadCoverage(projectId: string): Promise<RoadCoverageFact> {
    requireProject(projectId)
    const {data, headers} = await versioned<RoadCoverageReadFact>(`/projects/${projectId}/road-coverage`)
    if (data.projectId !== projectId || !Array.isArray(data.scopes) || !Array.isArray(data.sources) || !Array.isArray(data.history)) throw new Error('Hồ sơ độ phủ sai phạm vi/cấu trúc.')
    return coverageScopeView(data,headers.etag,localStorage.getItem(fastTrackStorage(projectId,'coverage-scope')) || undefined,Number.isFinite(Date.parse(headers.date))?Date.parse(headers.date):Date.now())
  },
  async confirmRoadCoverage(p: string, requested: RoadCoverageInputDto, ifMatch: string): Promise<RoadCoverageReadFact> {
    const input=(fastTrackPending(p,'coverage')?.body as RoadCoverageInputDto | undefined) || requested
    return fastTrackCommand(p, 'coverage', `/projects/${p}/road-coverage`, input, async () => {
      const current = await this.getRoadCoverage(p)
      const scope = current.scopes?.find(s=>s.obligationId===input.scopeObligationId)
      const handover = current.sources?.find(s=>s.kind==='HANDOVER' && s.id===input.handoverDocumentId && s.version===input.handoverVersion)
      const source = current.sources?.find(s=>s.kind===input.sourceKind && s.id===input.sourceId && s.version===input.sourceVersion)
      if (!scope || scope.scopeHash!==input.expectedScopeHash || !handover || !source || current.etag!==ifMatch) throw new Error('Căn cứ độ phủ thiếu hoặc đã thay đổi; đọc lại hồ sơ trước khi xác nhận.')
      if (input.provenance==='REAL_SOURCE' && [handover,source].some(s=>!['SOURCE_NOT_EXTERNALLY_VERIFIED','REAL_SOURCE'].includes(s.provenance || ''))) throw new Error('Nguồn thử nghiệm hoặc chưa rõ nguồn gốc không được khai báo là căn cứ thực tế.')
      return current.etag
    }, async receipt => {
      const response = await versioned<RoadCoverageReadFact>(`/projects/${p}/road-coverage`)
      const matches=(h:any)=>h.scopeObligationId===input.scopeObligationId && h.handoverDocumentId===input.handoverDocumentId && h.handoverVersion===input.handoverVersion && h.sourceKind===input.sourceKind && h.sourceId===input.sourceId && h.sourceVersion===input.sourceVersion && Date.parse(h.applicableFromUtc)===Date.parse(input.applicableFromUtc) && Date.parse(h.applicableToUtc)===Date.parse(input.applicableToUtc) && h.provenance===input.provenance && h.reason===input.reason && (h.supersedesId || null)===(input.supersedesId || null)
      const recorded=receipt?.history?.filter(matches) || []
      if (receipt?.projectId!==p || response.data.projectId!==p || recorded.length!==1 || !recorded[0].id || !response.data.history.some(h=>h.id===recorded[0].id && matches(h))) throw new Error('Receipt/GET chưa khớp xác nhận phạm vi, nguồn và hiệu lực. Giữ receipt; chỉ GET đối chiếu.')
      return response.data
    })
  },
  async getPolicyDraft(p: string, id: string): Promise<RepairPolicyView> { return this.readPolicy(p,id,'drafts') },
  async getPolicyRevision(p: string, id: string): Promise<RepairPolicyView> { return this.readPolicy(p,id,'revisions') },
  async readPolicy(p: string, id: string, kind: 'drafts' | 'revisions'): Promise<RepairPolicyView> {
    requireProject(p)
    const epoch=useAuthStore.getState().authEpoch
    const {data} = await versioned<RepairPolicyView>(`/projects/${p}/repair-policies/${kind}/${id}`)
    if(epoch!==useAuthStore.getState().authEpoch)throw new Error('Phiên đọc chính sách đã thay đổi; không lưu tham chiếu sang người dùng khác.')
    if (data.id!==id || data.projectId!==p || !Array.isArray(data.measurements)) throw new Error('Chính sách sai phạm vi hoặc thiếu quy tắc.')
    remember(p,data,kind); return data
  },
  policyView(row: RepairPolicyView): PolicyThresholdConfig {
    return {id: row.id, version: row.checklistVersion, status: row.state==='PUBLISHED' ? 'ACTIVE' : row.state==='DRAFT' ? 'DRAFT' : row.state==='REVOKED' ? 'REVOKED' : 'ARCHIVED',
      maxAreaM2: row.measurements.find(r=>r.code==='Area' && r.unit==='m²')?.maximum,
      maxDepthMm: row.measurements.find(r=>r.code==='DepressionDepth' && r.unit==='mm')?.maximum,
      allowedSeverities: [], activatedBy: row.actorId, activatedAt: row.at, appliedRoute: 'Phạm vi chính sách của dự án', description: row.reason,
      defectTypeCode: row.defectTypeCode, stopConditions: row.stopConditions, revision: row.revision, rules: row.measurements}
  },
  async getPolicies(p: string,onWarning?:(message:string)=>void): Promise<RepairPolicyView[]> {
    // There is no canonical policy collection. References are receipts or explicitly entered IDs, never guessed.
    if (useAuthStore.getState().user?.role !== 'PROJECT_MANAGER') return []
    const known=refs(p),receipt=fastTrackPending(p,'policy-create')?.receipt
    if(receipt?.id && receipt.projectId===p && !known.some(r=>r.id===receipt.id))known.push({id:receipt.id,kind:'drafts'})
    const reads=await Promise.allSettled(known.map(r => this.readPolicy(p,r.id,r.kind))),issues:string[]=[]
    const raw=reads.flatMap((r,i)=>{if(r.status==='fulfilled')return [r.value];issues.push(`Tham chiếu chính sách ${i+1}: HTTP ${r.reason?.response?.status || 'network'} ${r.reason?.response?.data?.code || r.reason?.message || 'không đọc được'}`);return []})
    const rows:RepairPolicyView[]=[]
    for(const row of raw) {
      if(row.revision==null && row.publishedRevisionId) {
        let revision=raw.find(r=>r.id===row.publishedRevisionId && r.revision!=null)
        if(!revision){try{revision=await this.getPolicyRevision(p,row.publishedRevisionId)}catch(e:any){issues.push(`Không đọc được revision đã ban hành: HTTP ${e.response?.status || 'network'}`);continue}}
        const grouped={...revision,draftId:row.id,draftVersion:row.version},index=rows.findIndex(r=>r.id===revision.id)
        if(index<0)rows.push(grouped);else rows[index]=grouped
      } else if(!rows.some(r=>r.id===row.id))rows.push(row)
    }
    if(issues.length){if(!onWarning)throw new Error(issues.join(' · '));onWarning(issues.join(' · '))}
    return rows
  },
  async getActivePolicy(p: string): Promise<PolicyThresholdConfig | null> {
    const rows=await this.getPolicies(p),selected=localStorage.getItem(fastTrackStorage(p,'policy-view'))
    const row=rows.find(r=>r.id===selected || r.draftId===selected) || rows[0]
    return row ? this.policyView(row) : null
  },
  async createPolicyDraft(p: string, input: RepairPolicyDefinitionInput): Promise<RepairPolicyView> {
    if(!fastTrackPending(p,'policy-create')?.receipt){assertPolicyRules(input.measurements)
      if(!(await defectTypeCatalog.read()).some(t=>t.code===input.defectTypeCode))throw new Error('Loại hư hỏng không còn trong danh mục hệ thống.')}
    return fastTrackCommand(p,'policy-create',`/projects/${p}/repair-policies/drafts`,input,async()=>undefined,async receipt=> {
      if (!receipt?.id || receipt.projectId!==p) throw new Error('Receipt chính sách sai phạm vi.')
      const row=await this.getPolicyDraft(p,receipt.id)
      if(row.version!==receipt.version || row.currentChangeId!==receipt.currentChangeId || row.defectTypeCode!==receipt.defectTypeCode || row.checklistVersion!==receipt.checklistVersion || JSON.stringify(row.measurements)!==JSON.stringify(receipt.measurements) || JSON.stringify(row.stopConditions)!==JSON.stringify(receipt.stopConditions))throw new Error('GET dự thảo không khớp receipt tạo; giữ receipt, chỉ đối chiếu lại.')
      return row
    })
  },
  async updatePolicyDraft(p:string,id:string,input:RepairPolicyDefinitionInput,expectedVersion:string):Promise<RepairPolicyView> {
    if(!fastTrackPending(p,`policy-update:${id}`)?.receipt)assertPolicyRules(input.measurements)
    return fastTrackCommand(p,`policy-update:${id}`,`/projects/${p}/repair-policies/drafts/${id}`,input,async()=>{
      const current=await this.getPolicyDraft(p,id)
      if(current.state!=='DRAFT' || current.version!==expectedVersion)throw new Error('Bản dự thảo đã thay đổi hoặc đã xuất bản. Nội dung đang nhập được giữ; đọc lại trước khi quyết định.')
      return `"${expectedVersion}"`
    },async receipt=>{
      if(receipt?.id!==id || receipt.projectId!==p)throw new Error('Receipt cập nhật không đúng dự thảo.')
      const row=await this.getPolicyDraft(p,id)
      if(row.version!==receipt.version || row.currentChangeId!==receipt.currentChangeId || row.defectTypeCode!==receipt.defectTypeCode || JSON.stringify(row.measurements)!==JSON.stringify(receipt.measurements) || JSON.stringify(row.stopConditions)!==JSON.stringify(receipt.stopConditions) || row.checklistVersion!==receipt.checklistVersion || row.reason!==receipt.reason)throw new Error('GET dự thảo không khớp receipt cập nhật; giữ journal và nội dung.')
      return row
    },'PUT')
  },
  async revokePolicy(p:string,id:string,reason:string):Promise<RepairPolicyView> {
    if(!reason.trim() || reason.length>2000)throw new Error('Nhập lý do thu hồi, tối đa 2000 ký tự.')
    return fastTrackCommand(p,`policy-revoke:${id}`,`/projects/${p}/repair-policies/revisions/${id}/revoke`,{reason},async()=>{
      const current=await this.getPolicyRevision(p,id)
      if(current.state!=='PUBLISHED')throw new Error('Chỉ PM được thu hồi bản đã xuất bản chưa thu hồi; bản cũ vẫn được xem.')
      return `"${current.version}"`
    },async receipt=>{
      if(receipt?.id!==id || receipt.projectId!==p || receipt.state!=='REVOKED')throw new Error('Receipt thu hồi không đúng chính sách.')
      const row=await this.getPolicyRevision(p,id)
      if(row.state!=='REVOKED' || row.version!==receipt.version || row.reason!==receipt.reason)throw new Error('Chưa đối chiếu được trạng thái thu hồi. Chỉ GET lại, không gửi lệnh mới.')
      return row
    })
  },
  async publishPolicy(p: string, id: string, reason: string, expectedVersion?: string): Promise<RepairPolicyView> {
    if(!fastTrackPending(p,`policy-publish:${id}`)?.receipt) {
      const current=await this.getPolicyDraft(p,id)
      if(current.state==='PUBLISHED' && current.publishedRevisionId)return this.getPolicyRevision(p,current.publishedRevisionId)
      if(expectedVersion && !fastTrackPending(p,`policy-publish:${id}`) && current.version!==expectedVersion)throw new Error('Dự thảo đã thay đổi trước khi xuất bản; giữ nội dung và đọc lại, không tự chọn phiên bản mới.')
      assertPolicyRules(current.measurements)
    }
    return fastTrackCommand(p,`policy-publish:${id}`,`/projects/${p}/repair-policies/drafts/${id}/publish`,{reason},async()=> {
      const row = await this.getPolicyDraft(p,id)
      if (row.state!=='DRAFT') throw new Error('Bản dự thảo không còn được phép xuất bản.')
      if(expectedVersion && row.version!==expectedVersion)throw new Error('Phiên bản dự thảo đã thay đổi; chưa gửi xuất bản.')
      assertPolicyRules(row.measurements)
      return `"${row.version}"`
    },async receipt=> {
      if (!receipt?.id || receipt.projectId!==p) throw new Error('Receipt xuất bản sai phạm vi.')
      const row = await this.getPolicyRevision(p,receipt.id)
      if (row.state!=='PUBLISHED' || row.version!==receipt.version || row.revision!==receipt.revision || row.defectTypeCode!==receipt.defectTypeCode || row.checklistVersion!==receipt.checklistVersion || JSON.stringify(row.measurements)!==JSON.stringify(receipt.measurements) || JSON.stringify(row.stopConditions)!==JSON.stringify(receipt.stopConditions)) throw new Error('GET chưa khớp receipt xuất bản; giữ receipt, chỉ đối chiếu lại.')
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
          packageId:i?.packageId,itemId:i?.id,obligationId:i?.obligationId,checklistVersion:i?proposalChecklist(p,i.packageId,i):undefined,checklistSource:i && proposalChecklist(p,i.packageId,i)?'Receipt đề xuất đã GET đối chiếu':undefined,canAssign:!!i && (i.state==='ReadyToAssign' || !!fastTrackPending(p,`assign:${i.id}`)),eligibilityKnown:known,isFastTrackEligible:eligible,violationReason:reason})
      }
    }
    if(result.some(r=>r.itemId && r.status!=='ReadyToAssign')) {
      for(const row of result) {
        const held=row.itemId && fastTrackPending(p,`assign:${row.itemId}`)
        if(held && held.receipt){const native=await this.readAssignment(p,row,held.receipt,held.body);row.assignedCrewId=native.assignedToUserId;row.policyRevisionId=(held.body as any).policyRevisionId}
      }
    }
    return result
  },
  async preparationSources(row:DefectItem) {
    const p=row.projectId,defect=(await versioned<any>(`/projects/${p}/defects/${row.defectId || row.id}`)).data
    if(defect.projectId!==p || defect.id!==(row.defectId || row.id))throw new Error('Nguồn khiếm khuyết sai phạm vi.')
    const road=(await triageGeometryService.routes(p)).find(r=>r.currentVersionId===defect.roadSectionVersionId)
    if(!road)throw new Error('Khiếm khuyết không thuộc tuyến hiện hành.')
    const [sets,tasks]=await Promise.all([triageGeometryService.sets(p,road),fastTrackFormSources.list(p,[defect.id])])
    return {sets,tasks}
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
    if((input.layoutRevisionId || input.slabId) && !(await fastTrackFormSources.list(p,[defect.id])).some(s=>s.pins.segmentSetId===input.segmentSetId && s.pins.layoutRevisionId===input.layoutRevisionId && s.pins.slabId===input.slabId))throw new Error('Bố trí/tấm không có hồ sơ nguồn đã đối chiếu; không nhập reference thủ công.')
    let pipeline=JSON.parse(localStorage.getItem(storage)||'null')
    if(pipeline && JSON.stringify(pipeline.input)!==JSON.stringify(input))throw new Error('Đang giữ gói đã tạo. Dùng lại đúng phương án để đề xuất tiếp; không tạo gói trùng.')
    if(!pipeline) {
      const {repairPlan,checklistVersion,reason,...scope}=input
      const body={defectId:defect.id,defectVersion:defect.version,obligations:[{kind:'FORMAL_REPAIR',mandatory:true,scope:{...scope,physicalRoadId:road.roadSectionId,routeVersionId:road.currentVersionId},reason}],reason}
      const held=fastTrackPending(p,`package:${defect.id}`),original=held?.body as typeof body|undefined
      if(original && !held?.receipt && (original.defectId!==body.defectId || original.reason!==body.reason || JSON.stringify(original.obligations)!==JSON.stringify(body.obligations)))throw new Error('Giữ nguyên phạm vi và căn cứ của package chưa rõ kết quả; không tạo ý định khác.')
      const pkg=await fastTrackCommand(p,`package:${defect.id}`,`/projects/${p}/repair-packages`,original || body,async()=>`"${defect.version}"`,async receipt=> {
        if(receipt?.projectId!==p || receipt.defectId!==defect.id || !receipt.version || receipt.unresolvedMandatoryObligationIds?.length!==1)throw new Error('Receipt tạo gói thiếu nghĩa vụ. Giữ receipt, không tạo lại.')
        if(!(await repairWorkflowService.packages(p)).some(r=>r.id===receipt.id))throw new Error('Chưa đọc lại được gói đã tạo.')
        return receipt
      })
      pipeline={input,pkg};localStorage.setItem(storage,JSON.stringify(pipeline));localStorage.removeItem(fastTrackStorage(p,`package:${defect.id}`))
    }
    const pkg=pipeline.pkg, base=`/projects/${p}/repair-packages/${pkg.id}/items`
    const proposed=await fastTrackCommand(p,`propose:${pkg.id}`,base,{obligationId:pkg.unresolvedMandatoryObligationIds[0],mode:'FAST_TRACK',repairPlan:input.repairPlan,checklistVersion:input.checklistVersion,reason:input.reason},async()=>`"${pkg.version}"`,async receipt=> {
      if(receipt?.projectId!==p || receipt.mode!=='FastTrack' || !receipt.id)throw new Error('Receipt hạng mục không khớp Fast Track.')
      const item=(await versioned<any>(`${base}/${receipt.id}`)).data
      if(item.id!==receipt.id || item.projectId!==p || item.mode!=='FastTrack' || item.defectId!==defect.id || item.obligationId!==pkg.unresolvedMandatoryObligationIds[0])throw new Error('Chưa đọc lại được hạng mục đã đề xuất.')
      return item
    })
    const proofKey=fastTrackStorage(p,'proposal-checklists'),proofs=JSON.parse(localStorage.getItem(proofKey)||'[]').filter((r:any)=>r.receipt?.id!==proposed.id)
    proofs.push({packageId:pkg.id,checklistVersion:input.checklistVersion,receipt:proposed});localStorage.setItem(proofKey,JSON.stringify(proofs))
    localStorage.removeItem(storage)
    localStorage.removeItem(fastTrackStorage(p,`propose:${pkg.id}`))
    return {packageId:pkg.id,itemId:proposed.id}
  },
  async executeDispatch(payload: DispatchPayload): Promise<{success: boolean; message: string; count: number}> {
    const p=payload.projectId
    if(!payload.items.length)throw new Error('Chọn hạng mục cần đối chiếu.')
    for (const row of payload.items) {
      if (!row.itemId || !row.packageId || !row.defectId) throw new Error('Chưa có hạng mục sửa chữa để giao việc.')
      const base=`/projects/${p}/repair-packages/${row.packageId}/items/${row.itemId}`
      const operation=`assign:${row.itemId}`
      const held=fastTrackPending(p,operation)
      if(held?.receipt){await fastTrackCommand(p,operation,`${base}/assign`,held.body,async()=>undefined,receipt=>this.readAssignment(p,row,receipt,held.body as any));continue}
      const crew=(await this.getCrews(p)).find(c=>c.id===payload.crewName)
      if(!crew || !payload.notes?.trim())throw new Error('Chọn Crew hiện hành, hạng mục và ghi rõ chỉ đạo.')
      const d=(await versioned<any>(`/projects/${p}/defects/${row.defectId}`)).data
      const {policyRevisionId,sourceTaskId,...pins}=payload.task
      const requestedTask={...pins,defectId:d.id,defectVersion:d.version,routeVersionId:d.roadSectionVersionId,purpose:'POST_REPAIR',assignedToUserId:crew.id,instructions:payload.notes}
      const saved=held?.body as {task:typeof requestedTask;policyRevisionId:string;reason:string} | undefined
      if(!held) {
        if(!sourceTaskId)throw new Error('Chọn hồ sơ nguồn đã đọc từ hệ thống trước khi giao việc.')
        const source=await fastTrackFormSources.read(p,sourceTaskId,row.defectId)
        if(Object.entries(source.pins).some(([key,value])=>(pins as any)[key]!==value))throw new Error('Các tham chiếu không còn khớp hồ sơ nguồn. Chọn lại hồ sơ; không nhập mã thay thế.')
      }
      // Never migrate a pending command, including a legacy raw-text scope. Receipts remain GET-only.
      let task=requestedTask
      if(saved) {
        if(!held?.receipt) {
          assertFastTrackMeasurementScope(saved.task.measurementScope)
          const expected=JSON.stringify({...saved.task,defectVersion:d.version})
          if(saved.reason!==payload.notes || saved.policyRevisionId!==policyRevisionId ||
            (expected!==JSON.stringify(requestedTask) && expected!==JSON.stringify({...requestedTask,...fastTrackMeasurementScope(pins.measurementScope,payload.notes)}))) throw new Error('Có lệnh giao việc chưa rõ kết quả. Giữ đúng Crew, chỉ đạo, phạm vi và hạn đã gửi để đối chiếu.')
        }
        task=saved.task
      } else task={...requestedTask,...fastTrackMeasurementScope(pins.measurementScope,payload.notes)}
      const commandPolicy=saved?.policyRevisionId || policyRevisionId
      const commandBody=saved || {task,policyRevisionId:commandPolicy,reason:payload.notes}
      if(!held?.receipt) {
        assertFastTrackMeasurementScope(task.measurementScope)
        if(task.instructions != null && (typeof task.instructions!=='string' || task.instructions.trim().length>1000)) throw new Error('Chỉ dẫn trong lệnh vượt giới hạn runtime hoặc sai kiểu. Giữ nguyên journal; chưa gửi POST.')
      }
      await fastTrackCommand(p,operation,`${base}/assign`,commandBody,async()=> {
        const current=await versioned<any>(base), policy=await this.getPolicyRevision(p,commandPolicy)
        const checklist=proposalChecklist(p,row.packageId!,current.data)
        if(!checklist)throw new Error('Chưa có nguồn checklist của phương án: API đọc item hiện không cung cấp checklist và chưa có receipt đề xuất đã đối chiếu. Không tự lấy checklist từ policy đang xem.')
        if(policy.checklistVersion!==checklist)throw new Error('Policy không khớp checklist phương án; chọn đúng revision, không tự đổi pin.')
        if (current.data.id!==row.itemId || current.data.projectId!==p || current.data.mode!=='FastTrack' || current.data.state!=='ReadyToAssign' || policy.state!=='PUBLISHED' || policy.defectTypeCode!==d.defectTypeCode) throw new Error('Hạng mục/chính sách không còn phù hợp để giao việc.')
        if (!Number.isFinite(Date.parse(task.dueAt)) || Date.parse(task.dueAt)<=Date.now() || !task.measurementScope.trim()) throw new Error('Nhập hạn hoàn thành trong tương lai và phạm vi đo có căn cứ.')
        return current.headers.etag
      },receipt=>this.readAssignment(p,row,receipt,commandBody))
    }
    return {success:true,count:payload.items.length,message:`Đã đối chiếu ${payload.items.length} nhiệm vụ đã giao. Crew vẫn phải kiểm tra điều kiện thi công.`}
  },
  async readAssignment(p:string,row:DefectItem,receipt:any,body:any) {
    if(receipt?.itemId!==row.itemId || !receipt.taskId || !receipt.assignmentId || receipt.policyRevisionId!==body.policyRevisionId)throw new Error('Receipt giao việc không khớp hạng mục/chính sách.')
    const current=(await versioned<any>(`/projects/${p}/repair-packages/${row.packageId}/items/${row.itemId}`)).data
    const {data:native}=await versioned<any>(`/projects/${p}/field-inspection-tasks/${receipt.taskId}`)
    // b89a52f only emits repairContext to the assigned Crew. PM verifies the binding receipt and guarded task read.
    if(current.id!==row.itemId || current.projectId!==p || current.defectId!==row.defectId || current.state==='ReadyToAssign' || native.id!==receipt.taskId || native.projectId!==p || native.defectId!==row.defectId || native.assignedToUserId!==body.task.assignedToUserId || native.assignmentId!==receipt.assignmentId || native.repairContext && (native.repairContext.itemId!==row.itemId || native.repairContext.packageId!==row.packageId))throw new Error('Đã có receipt nhưng chưa đối chiếu được nhiệm vụ Crew. Chỉ đọc lại, không giao trùng.')
    if(receipt.obligationId && receipt.obligationId!==current.obligationId || receipt.mode && receipt.mode!==native.mode || receipt.routeVersionId && receipt.routeVersionId!==native.routeVersionId || body.task.routeVersionId && body.task.routeVersionId!==native.routeVersionId)throw new Error('Binding/phiên bản tuyến không khớp nhiệm vụ đã đọc; giữ receipt để đối chiếu.')
    return native
  },
  async readItemSources(p:string,pkg:string,id:string) {
    const item=await repairWorkflowService.detail(p,pkg,id),history=await repairWorkflowService.history(p,pkg,id)
    if(history.item.id!==item.id || history.item.projectId!==p || history.item.obligationId!==item.obligationId || history.item.version!==item.version)throw new Error('Lịch sử không khớp hồ sơ phương án hoặc phiên bản đã thay đổi; đọc lại hồ sơ.')
    return {item,history,checklistVersion:proposalChecklist(p,pkg,item),checklistSource:proposalChecklist(p,pkg,item)?'Receipt đề xuất đã GET đối chiếu':'Chi tiết/lịch sử chưa cung cấp checklist; cần bổ sung nguồn đọc cho PM trước khi giao item cũ.'}
  }
}
