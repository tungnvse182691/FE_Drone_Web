import { useState, useEffect, useCallback, useRef } from 'react'
import type { PolicyThresholdConfig, PolicyHistoryItem, AuditLogItem, RoadCoverageFact, RoadCoverageInputDto, PolicyRuleSelection } from './types'
import { coverageScopeView } from '../../../api/services/fastTrackCoverage'
import { assertPolicyRules } from '../../../api/services/fastTrackPolicyRules'
import { fastTrackService, type RepairPolicyDefinitionInput, type RepairPolicyView } from '../../../api/services/fastTrackService'
import { fastTrackStorage, fastTrackPending } from '../../../api/services/fastTrackJournal'
import { exportError } from '../../../api/services/projectExportService'
import { useAuthStore } from '../../../store/authStore'
export function useFastTrackPolicy(selectedProjectId:string,showToast:(msg:string)=>void) {
  const epoch=useAuthStore(s=>s.authEpoch),role=useAuthStore(s=>s.user?.role),generation=useRef(0),busy=useRef(false),skipPersist=useRef(true)
  const scopeRef=useRef({project:selectedProjectId,epoch});scopeRef.current={project:selectedProjectId,epoch}
  const activeScope=(project:string,version:number)=>scopeRef.current.project===project && scopeRef.current.epoch===version
  const [currentPolicy,setCurrentPolicy]=useState<PolicyThresholdConfig|null>(null),[policies,setPolicies]=useState<RepairPolicyView[]>([])
  const [policyHistory,setPolicyHistory]=useState<PolicyHistoryItem[]>([]),[auditLogs,setAuditLogs]=useState<AuditLogItem[]>([])
  const [roadCoverage,setRoadCoverage]=useState<RoadCoverageFact|null>(null)
  const [isRoadCoverageModalOpen,setIsRoadCoverageModalOpen]=useState(false),[isPolicyModalOpen,setIsPolicyModalOpen]=useState(false),[isAuditModalOpen,setIsAuditModalOpen]=useState(false)
  const [formVersionName,setFormVersionName]=useState(''),[formMaxArea,setFormMaxArea]=useState(''),[formMaxDepth,setFormMaxDepth]=useState(''),[formPolicyNote,setFormPolicyNote]=useState(''),[formType,setFormType]=useState('')
  const [ruleSelection,setRuleSelection]=useState<PolicyRuleSelection>({area:false,depth:false,depthUnit:'mm',stopConditions:[]})
  const [mode,setMode]=useState<'new'|'draft'|'view'>('new'),[record,setRecord]=useState<RepairPolicyView|null>(null),[base,setBase]=useState('')
  const [pendingRead,setPendingRead]=useState<RepairPolicyView|null>(null),[pendingNew,setPendingNew]=useState(false)
  const [policyError,setPolicyError]=useState(''),[coverageError,setCoverageError]=useState<string|null>(null),[policyBusy,setPolicyBusy]=useState(false),[isSubmittingCoverage,setIsSubmittingCoverage]=useState(false)
  const fields=()=>({formVersionName,formMaxArea,formMaxDepth,formPolicyNote,formType,ruleSelection})
  const dirty=base ? JSON.stringify(fields())!==base : !!(formVersionName || formMaxArea || formMaxDepth || formPolicyNote || formType || ruleSelection.area || ruleSelection.depth || ruleSelection.stopConditions.length)
  const hydrate=(f:ReturnType<typeof fields>)=>{setFormVersionName(f.formVersionName);setFormMaxArea(f.formMaxArea);setFormMaxDepth(f.formMaxDepth);setFormPolicyNote(f.formPolicyNote);setFormType(f.formType);setRuleSelection(f.ruleSelection)}
  const fromRow=(row:RepairPolicyDefinitionInput)=>{const a=row.measurements.find(r=>r.code==='Area'),d=row.measurements.find(r=>r.code==='DepressionDepth');return {formVersionName:row.checklistVersion,formMaxArea:a ? String(a.maximum) : '',formMaxDepth:d ? String(d.maximum) : '',formPolicyNote:row.reason,formType:row.defectTypeCode,ruleSelection:{area:!!a,depth:!!d,depthUnit:(d?.unit || 'mm') as PolicyRuleSelection['depthUnit'],stopConditions:row.stopConditions}}}
  const storeEditor=(m:typeof mode,r:RepairPolicyView|null,f:ReturnType<typeof fields>,original:string)=>localStorage.setItem(fastTrackStorage(selectedProjectId,'policy-editor'),JSON.stringify({mode:m,record:r,fields:f,base:original}))
  const adopt=(row:RepairPolicyView)=>{const f=fromRow(row),m=row.state==='DRAFT'?'draft':'view';hydrate(f);setRecord(row);setMode(m);setBase(JSON.stringify(f));storeEditor(m,row,f,JSON.stringify(f))}
  const pending=selectedProjectId ? fastTrackPending(selectedProjectId,'policy-create') || (record?.state==='DRAFT' ? fastTrackPending(selectedProjectId,`policy-update:${record.id}`) || fastTrackPending(selectedProjectId,`policy-publish:${record.id}`) : null) : null
  useEffect(()=>{
    if(!selectedProjectId)return
    skipPersist.current=true
    const saved=JSON.parse(localStorage.getItem(fastTrackStorage(selectedProjectId,'policy-editor')) || 'null')
    const pipeline=JSON.parse(localStorage.getItem(fastTrackStorage(selectedProjectId,'policy-pipeline')) || 'null')
    const input=fastTrackPending(selectedProjectId,'policy-create')?.body as RepairPolicyDefinitionInput|undefined
    if(saved){setMode(saved.mode);setRecord(saved.record);setBase(saved.base);hydrate(saved.fields)}
    else if(input || pipeline?.input){const f=fromRow(input || pipeline.input);hydrate(f);setMode('new');setRecord(null);setBase('')}
    else{hydrate({formVersionName:'',formMaxArea:'',formMaxDepth:'',formPolicyNote:'',formType:'',ruleSelection:{area:false,depth:false,depthUnit:'mm',stopConditions:[]}});setMode('new');setRecord(null);setBase('')}
    setIsPolicyModalOpen(false);setIsRoadCoverageModalOpen(false);setPendingRead(null);setPendingNew(false)
  },[selectedProjectId,epoch])
  useEffect(()=>{if(!selectedProjectId)return;if(skipPersist.current){skipPersist.current=false;return}storeEditor(mode,record,fields(),base)},[selectedProjectId,epoch,mode,record,base,formType,formVersionName,formMaxArea,formMaxDepth,formPolicyNote,ruleSelection])
  const loadPolicyData=useCallback(async(preferred?:string)=>{
    if(!activeScope(selectedProjectId,epoch))return
    const gen=++generation.current
    if(!selectedProjectId){setPolicies([]);setCurrentPolicy(null);setRoadCoverage(null);return}
    let policyReadWarning=''
    const [pol,cov]=await Promise.allSettled([fastTrackService.getPolicies(selectedProjectId,message=>{policyReadWarning=message}),fastTrackService.getRoadCoverage(selectedProjectId)])
    if(generation.current!==gen)return
    if(pol.status==='fulfilled'){
      const rows=pol.value,chosen=preferred || localStorage.getItem(fastTrackStorage(selectedProjectId,'policy-view')),view=rows.find(r=>r.id===chosen || r.draftId===chosen) || rows[0]
      setPolicies(rows);setCurrentPolicy(view ? fastTrackService.policyView(view):null)
      if(view)localStorage.setItem(fastTrackStorage(selectedProjectId,'policy-view'),view.id)
      setPolicyHistory(rows.map(r=>({id:r.id,draftId:r.draftId,revision:r.revision,version:r.checklistVersion,status:fastTrackService.policyView(r).status,activatedBy:r.actorId,activatedAt:r.at,route:r.reason,rules:r.measurements})))
      setPolicyError(policyReadWarning || (role==='SUPERVISOR'?'Chính sách và số liệu khiếm khuyết gốc hiện chỉ PM đọc được. Giám sát xem hạng mục sửa chữa và xác nhận độ phủ tại đây.':!rows.length?'Chưa có tham chiếu chính sách đã đọc; không suy thành chưa có policy trong hệ thống.':''))
    }else{setPolicies([]);setCurrentPolicy(null);setPolicyError(exportError(pol.reason))}
    if(cov.status==='fulfilled'){setRoadCoverage(cov.value);setCoverageError(null);setAuditLogs((cov.value.history||[]).map(h=>({title:'Xác nhận độ phủ đã lưu',time:h.confirmedAtUtc,user:h.actorId,hash:h.id,note:h.reason,provenance:h.provenance})))}else{setRoadCoverage(null);setCoverageError(exportError(cov.reason))}
  },[selectedProjectId,epoch,role])
  useEffect(()=>{void loadPolicyData();const refresh=()=>void loadPolicyData();window.addEventListener('fasttrack-refresh',refresh);return()=>{generation.current++;window.removeEventListener('fasttrack-refresh',refresh)}},[loadPolicyData])
  const readPolicy=async(row:RepairPolicyView,discard=false)=>{
    if(pending && record?.id!==row.id){setPolicyError('Đối chiếu yêu cầu đang chờ trước khi đổi bản; giữ nguyên journal và nội dung.');return false}
    if(dirty && !discard){setPendingRead(row);setPendingNew(false);setIsPolicyModalOpen(true);return false}
    try{let fresh=await fastTrackService.readPolicy(selectedProjectId,row.id,row.revision!=null?'revisions':'drafts');if(fresh.revision==null && fresh.publishedRevisionId)fresh=await fastTrackService.getPolicyRevision(selectedProjectId,fresh.publishedRevisionId);if(!activeScope(selectedProjectId,epoch))return false;adopt(fresh);setPendingRead(null);setPolicyError('');await loadPolicyData(fresh.id);return true}catch(e){setPolicyError(exportError(e));return false}
  }
  const newPolicy=(discard=false)=>{
    if(pending){setPolicyError('Còn yêu cầu đang chờ; không tạo bản khác thay cho lệnh chưa rõ kết quả.');return false}
    if(dirty && !discard){setPendingNew(true);setPendingRead(null);return false}
    const f={formVersionName:'',formMaxArea:'',formMaxDepth:'',formPolicyNote:'',formType:'',ruleSelection:{area:false,depth:false,depthUnit:'mm' as const,stopConditions:[]}}
    hydrate(f);setMode('new');setRecord(null);setBase('');setPendingNew(false);setPendingRead(null);setPolicyError('');storeEditor('new',null,f,'');return true
  }
  const handleApplyPolicy=async(shouldPublish:boolean)=>{
    if(busy.current || mode==='view' && !pending?.receipt)return
    const actionEpoch=useAuthStore.getState().authEpoch,p=selectedProjectId
    busy.current=true;setPolicyBusy(true);setPolicyError('')
    try{
      if(pending?.receipt){
        const create=fastTrackPending(p,'policy-create'),update=record && fastTrackPending(p,`policy-update:${record.id}`)
        const row=create?.receipt ? await fastTrackService.createPolicyDraft(p,create.body as RepairPolicyDefinitionInput) : update?.receipt && record ? await fastTrackService.updatePolicyDraft(p,record.id,update.body as RepairPolicyDefinitionInput,record.version) : record ? await fastTrackService.publishPolicy(p,record.id,(pending.body as {reason:string}).reason) : null
        if(!row)throw new Error('Receipt chưa gắn được với hồ sơ; giữ nguyên journal.')
        if(!activeScope(p,actionEpoch))return
        adopt(row);localStorage.removeItem(fastTrackStorage(p,'policy-create'));localStorage.removeItem(fastTrackStorage(p,'policy-pipeline'));if(update?.receipt && record)localStorage.removeItem(fastTrackStorage(p,`policy-update:${record.id}`));await loadPolicyData(row.id);showToast('Đã GET đối chiếu receipt. Chưa gửi thao tác tiếp theo.');return
      }
      const area=fastTrackService.policyBound(formMaxArea),depth=fastTrackService.policyBound(formMaxDepth)
      if(!formType || !formVersionName.trim() || formVersionName.length>200 || !formPolicyNote.trim() || formPolicyNote.length>2000 || (!ruleSelection.area && !ruleSelection.depth) || ruleSelection.area && area===null || ruleSelection.depth && depth===null)throw new Error('Chọn loại hư hỏng, quy tắc và nhập đủ checklist, ngưỡng, căn cứ hợp lệ.')
      const old=mode==='draft'?record:null
      const input:RepairPolicyDefinitionInput={defectTypeCode:formType,checklistVersion:formVersionName,reason:formPolicyNote,measurements:[...(ruleSelection.area?[{code:'Area',unit:'m²',minimum:old?.measurements.find(r=>r.code==='Area')?.minimum || 0,maximum:area!}]:[]),...(ruleSelection.depth?[{code:'DepressionDepth',unit:ruleSelection.depthUnit,minimum:old?.measurements.find(r=>r.code==='DepressionDepth')?.minimum || 0,maximum:depth!}]:[]),...(old?.measurements.filter(r=>!['Area','DepressionDepth'].includes(r.code))||[])],stopConditions:ruleSelection.stopConditions}
      assertPolicyRules(input.measurements)
      if(input.stopConditions.length){const known=(await fastTrackService.getPolicies(p)).filter(r=>r.defectTypeCode===formType).flatMap(r=>r.stopConditions);if(input.stopConditions.some(code=>!known.includes(code)))throw new Error('Mã điều kiện dừng chưa có nguồn xác nhận.')}
      let row:RepairPolicyView
      if(old){row=dirty || fastTrackPending(p,`policy-update:${old.id}`) ? await fastTrackService.updatePolicyDraft(p,old.id,input,old.version):await fastTrackService.getPolicyDraft(p,old.id);if(!dirty && !pending && row.version!==old.version)throw new Error('Dự thảo đã thay đổi từ khi mở; giữ nội dung đang xem và đọc lại trước khi lưu/xuất bản.')}
      else{
        const storage=fastTrackStorage(p,'policy-pipeline');let pipeline=JSON.parse(localStorage.getItem(storage)||'null')
        if(pipeline && JSON.stringify(pipeline.input)!==JSON.stringify(input))throw new Error('Giữ nguyên nội dung của gói lệnh tạo đang chờ; không tạo trùng.')
        if(!pipeline){const draft=await fastTrackService.createPolicyDraft(p,input);pipeline={input,draftId:draft.id};localStorage.setItem(storage,JSON.stringify(pipeline));localStorage.removeItem(fastTrackStorage(p,'policy-create'))}
        row=await fastTrackService.getPolicyDraft(p,pipeline.draftId)
      }
      if(shouldPublish && row.state==='DRAFT')row=await fastTrackService.publishPolicy(p,row.id,input.reason,row.version)
      if(row.state==='PUBLISHED' && row.revision==null && row.publishedRevisionId)row=await fastTrackService.getPolicyRevision(p,row.publishedRevisionId)
      if(!activeScope(p,actionEpoch))return
      adopt(row);localStorage.removeItem(fastTrackStorage(p,'policy-pipeline'));if(old)localStorage.removeItem(fastTrackStorage(p,`policy-update:${old.id}`))
      await loadPolicyData(row.id);showToast(`Đã GET đối chiếu ${row.checklistVersion}: ${row.state==='DRAFT'?'Dự thảo':row.state==='REVOKED'?'Đã thu hồi':'Đã xuất bản'}.`)
      // Công bố xong và đã đọc lại bản đã xuất bản → tự đóng bảng nhập.
      if(shouldPublish && row.state==='PUBLISHED')setIsPolicyModalOpen(false)
    }catch(e){setPolicyError(exportError(e))}finally{busy.current=false;setPolicyBusy(false)}
  }
  const revokePolicy=async(row:RepairPolicyView,reason:string)=>{
    if(busy.current)return false
    busy.current=true;setPolicyBusy(true)
    const p=selectedProjectId,version=epoch
    try{const result=await fastTrackService.revokePolicy(p,row.id,reason);if(!activeScope(p,version))return false;adopt(result);await loadPolicyData(result.id);showToast('Đã GET đối chiếu thu hồi. Không đổi policy ghim trong nhiệm vụ cũ.');return true}catch(e){setPolicyError(exportError(e));return false}finally{busy.current=false;setPolicyBusy(false)}
  }
  const handleReadHistory=(id:string)=>{const row=policies.find(r=>r.id===id);if(row){setIsPolicyModalOpen(true);void readPolicy(row)}}
  const handleActivateDraft=async(item:PolicyHistoryItem)=>{if(item.id)handleReadHistory(item.id)}
  const selectCoverageScope=(id:string)=>{localStorage.setItem(fastTrackStorage(selectedProjectId,'coverage-scope'),id);setRoadCoverage(current=>current?.readFact && current.etag ? coverageScopeView(current.readFact,current.etag,id,current.coverageReadAt):current)}
  const handleConfirmRoadCoverage=async(input:RoadCoverageInputDto)=>{
    if(busy.current)return;busy.current=true;setIsSubmittingCoverage(true);setCoverageError(null)
    try{if(!roadCoverage?.etag)throw new Error('Đọc lại phiên bản độ phủ.');await fastTrackService.confirmRoadCoverage(selectedProjectId,input,roadCoverage.etag);if(!activeScope(selectedProjectId,epoch))return;localStorage.setItem(fastTrackStorage(selectedProjectId,'coverage-scope'),input.scopeObligationId);await loadPolicyData();setIsRoadCoverageModalOpen(false);showToast('Đã GET đối chiếu xác nhận. Đọc hiệu lực theo đúng phạm vi.')}catch(e){setCoverageError(exportError(e))}finally{busy.current=false;setIsSubmittingCoverage(false)}
  }
  const policyEditor={mode,record,dirty,busy:policyBusy,pending:!!pending,hasReceipt:!!pending?.receipt,formType,setFormType,read:readPolicy,newPolicy,revoke:revokePolicy,pendingRead,pendingNew,cancelRead:()=>{setPendingRead(null);setPendingNew(false)}}
  return {selectCoverageScope,policyEditor,handleReadHistory,ruleSelection,setRuleSelection,currentPolicy,policyHistory,auditLogs,roadCoverage,isRoadCoverageModalOpen,setIsRoadCoverageModalOpen,handleConfirmRoadCoverage,coverageError,policyError,isSubmittingCoverage,formVersionName,setFormVersionName,formMaxArea,setFormMaxArea,formMaxDepth,setFormMaxDepth,formPolicyNote,setFormPolicyNote,isPolicyModalOpen,setIsPolicyModalOpen,isAuditModalOpen,setIsAuditModalOpen,handleApplyPolicy,handleActivateDraft,loadPolicyData}
}
export type FastTrackPolicyEditor=ReturnType<typeof useFastTrackPolicy>['policyEditor']
