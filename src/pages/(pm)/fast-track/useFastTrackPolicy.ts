import { useState, useEffect, useCallback, useRef } from 'react'
import type { PolicyThresholdConfig, PolicyHistoryItem, AuditLogItem, RoadCoverageFact, RoadCoverageInputDto } from './types'
import { fastTrackService, type RepairPolicyDefinitionInput } from '../../../api/services/fastTrackService'
import { fastTrackStorage, fastTrackPending } from '../../../api/services/fastTrackJournal'
import { exportError } from '../../../api/services/projectExportService'
import { useAuthStore } from '../../../store/authStore'
export function useFastTrackPolicy(selectedProjectId: string, showToast: (msg: string) => void) {
  const epoch = useAuthStore(s=>s.authEpoch), role = useAuthStore(s=>s.user?.role)
  const generation = useRef(0), busy = useRef(false)
  const [currentPolicy,setCurrentPolicy]=useState<PolicyThresholdConfig|null>(null)
  const [policyHistory,setPolicyHistory]=useState<PolicyHistoryItem[]>([])
  const [auditLogs,setAuditLogs]=useState<AuditLogItem[]>([])
  const [roadCoverage,setRoadCoverage]=useState<RoadCoverageFact|null>(null)
  const [isRoadCoverageModalOpen,setIsRoadCoverageModalOpen]=useState(false)
  const [formVersionName,setFormVersionName]=useState('')
  const [formMaxArea,setFormMaxArea]=useState('')
  const [formMaxDepth,setFormMaxDepth]=useState('')
  const [formPolicyNote,setFormPolicyNote]=useState('')
  const [isPolicyModalOpen,setIsPolicyModalOpen]=useState(false)
  const [isAuditModalOpen,setIsAuditModalOpen]=useState(false)
  const [coverageError,setCoverageError]=useState<string|null>(null)
  const [policyError,setPolicyError]=useState('')
  const [isSubmittingCoverage,setIsSubmittingCoverage]=useState(false)
  useEffect(()=>{
    if(!selectedProjectId)return
    const input=fastTrackPending(selectedProjectId,'policy-create')?.body as RepairPolicyDefinitionInput | undefined
    const pipeline=JSON.parse(localStorage.getItem(fastTrackStorage(selectedProjectId,'policy-pipeline'))||'null')
    const restored=input || pipeline?.input
    setFormVersionName(restored?.checklistVersion || '');setFormPolicyNote(restored?.reason || '')
    setFormMaxArea(restored ? String(restored.measurements.find((r: any)=>r.code==='Area')?.maximum ?? '') : '')
    setFormMaxDepth(restored ? String(restored.measurements.find((r:any)=>r.code==='DepressionDepth')?.maximum ?? '') : '')
    if(restored)localStorage.setItem(fastTrackStorage(selectedProjectId,'policy-type'),restored.defectTypeCode)
    setIsPolicyModalOpen(false);setIsRoadCoverageModalOpen(false)
  },[selectedProjectId,epoch])
  const loadPolicyData=useCallback(async()=> {
    const gen=++generation.current
    setCurrentPolicy(null);setPolicyHistory([]);setAuditLogs([]);setRoadCoverage(null);setPolicyError('');setCoverageError(null)
    if (!selectedProjectId) return
    const results=await Promise.allSettled([fastTrackService.getPolicies(selectedProjectId),fastTrackService.getRoadCoverage(selectedProjectId)])
    if (generation.current!==gen) return
    const [pol,cov]=results
    if(pol.status==='fulfilled') {
      const rows=pol.value, published=rows.filter(r=>r.state==='PUBLISHED' && r.revision != null)
      if(published.length===1)setCurrentPolicy(fastTrackService.policyView(published[0]))
      setPolicyHistory(rows.map(r=>{const v=fastTrackService.policyView(r);return {id:r.id,version:r.checklistVersion,status:v.status,activatedBy:r.actorId,activatedAt:r.at,route:r.reason,maxArea:v.maxAreaM2,maxDepth:v.maxDepthMm}}))
      if(role==='SUPERVISOR')setPolicyError('Chính sách và số liệu khiếm khuyết gốc hiện chỉ PM đọc được. Giám sát xem hạng mục sửa chữa và xác nhận độ phủ tại đây.')
      else if(!rows.length)setPolicyError('Chưa có tham chiếu chính sách trong phiên làm việc này. Mở Điều chỉnh chính sách để đọc bản đã có hoặc lập dự thảo.')
      else if(published.length>1)setPolicyError('Có nhiều chính sách đã xuất bản. Chọn đúng tham chiếu chính sách trong lệnh giao việc; không tự chọn bản mới nhất.')
    } else setPolicyError(exportError(pol.reason))
    if(cov.status==='fulfilled') {
      setRoadCoverage(cov.value)
      setAuditLogs((cov.value.history || []).map(h=>({title:'Xác nhận độ phủ đã lưu',time:h.confirmedAtUtc,user:h.actorId,hash:h.id,note:`${h.provenance} · ${h.reason}`})))
    } else setCoverageError(exportError(cov.reason))
  },[selectedProjectId,epoch,role])
  useEffect(()=>{void loadPolicyData();const reload=()=>void loadPolicyData();window.addEventListener('fasttrack-refresh',reload);return()=>{generation.current++;window.removeEventListener('fasttrack-refresh',reload)}},[loadPolicyData])
  const handleApplyPolicy=async(shouldPublish:boolean)=> {
    if(busy.current)return
    const gen=generation.current
    busy.current=true;setPolicyError('')
    try {
      const area=fastTrackService.policyBound(formMaxArea),depth=fastTrackService.policyBound(formMaxDepth)
      if(!formVersionName.trim() || formVersionName.length>200 || !formPolicyNote.trim() || formPolicyNote.length>2000 || area===null || depth===null)throw new Error('Nhập checklist (tối đa 200 ký tự), căn cứ (tối đa 2000 ký tự) và ngưỡng không âm, tối đa 6 chữ số thập phân.')
      const type=localStorage.getItem(fastTrackStorage(selectedProjectId,'policy-type'))
      if(!type)throw new Error('Chọn loại hư hỏng từ danh mục hệ thống.')
      const input:RepairPolicyDefinitionInput={defectTypeCode:type,checklistVersion:formVersionName,measurements:[{code:'Area',unit:'m2',minimum:0,maximum:area},{code:'DepressionDepth',unit:'mm',minimum:0,maximum:depth}],stopConditions:[],reason:formPolicyNote}
      const storage=fastTrackStorage(selectedProjectId,'policy-pipeline')
      let pipeline=JSON.parse(localStorage.getItem(storage)||'null')
      if(pipeline && JSON.stringify(pipeline.input)!==JSON.stringify(input))throw new Error('Đang giữ bản dự thảo trước. Kích hoạt bản đó từ lịch sử hoặc dùng lại đúng nội dung.')
      if(!pipeline){const draft=await fastTrackService.createPolicyDraft(selectedProjectId,input);pipeline={input,draftId:draft.id};localStorage.setItem(storage,JSON.stringify(pipeline));localStorage.removeItem(fastTrackStorage(selectedProjectId,'policy-create'))}
      if(shouldPublish)await fastTrackService.publishPolicy(selectedProjectId,pipeline.draftId,formPolicyNote)
      localStorage.removeItem(storage)
      if(generation.current!==gen)return
      await loadPolicyData();setIsPolicyModalOpen(false);showToast(shouldPublish?'Đã đối chiếu chính sách xuất bản.':'Đã đối chiếu bản dự thảo đã lưu.')
    }catch(e){if(generation.current===gen)setPolicyError(exportError(e))}finally{busy.current=false}
  }
  const handleActivateDraft=async(item:PolicyHistoryItem)=> {
    if(busy.current)return
    busy.current=true
    try{if(!item.id)throw new Error('Thiếu tham chiếu bản dự thảo.');await fastTrackService.publishPolicy(selectedProjectId,item.id,formPolicyNote.trim() || item.route);await loadPolicyData();showToast('Đã đối chiếu chính sách xuất bản.')}catch(e){setPolicyError(exportError(e))}finally{busy.current=false}
  }
  const handleConfirmRoadCoverage=async(input:RoadCoverageInputDto)=> {
    if(busy.current)return
    busy.current=true;setIsSubmittingCoverage(true);setCoverageError(null)
    try{if(!roadCoverage?.etag)throw new Error('Đọc lại phiên bản độ phủ.');await fastTrackService.confirmRoadCoverage(selectedProjectId,input,roadCoverage.etag);await loadPolicyData();setIsRoadCoverageModalOpen(false);showToast('Đã đối chiếu xác nhận độ phủ.')}catch(e){setCoverageError(exportError(e))}finally{busy.current=false;setIsSubmittingCoverage(false)}
  }
  return {currentPolicy,policyHistory,auditLogs,roadCoverage,isRoadCoverageModalOpen,setIsRoadCoverageModalOpen,handleConfirmRoadCoverage,coverageError,policyError,isSubmittingCoverage,formVersionName,setFormVersionName,formMaxArea,setFormMaxArea,formMaxDepth,setFormMaxDepth,formPolicyNote,setFormPolicyNote,isPolicyModalOpen,setIsPolicyModalOpen,isAuditModalOpen,setIsAuditModalOpen,handleApplyPolicy,handleActivateDraft,loadPolicyData}
}
