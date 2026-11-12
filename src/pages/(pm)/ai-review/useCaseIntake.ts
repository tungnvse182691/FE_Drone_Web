import { readEligibleTriageProjects } from '../../../api/services/triageProjectEligibility'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { triageService, CaseListReadError, isCaseReadCanceled, type CaseProjectOption, type PendingTriage, type CaseTriageInput } from '../../../api/services/triageService'
import type { TriageCase } from './types'

export const CASE_STATUSES = ['UNASSIGNED','OPEN','AWAITING_EVIDENCE','CONCLUDED','LINKED']
export function caseIntakeError(error: any): string {
  if (!error?.response) return error?.message || 'Không thể đọc hồ sơ.'
  const {status,data} = error.response
  const prefix = status === 403 ? 'Không có quyền' : status === 404 ? 'Không tìm thấy hồ sơ' : status === 401 ? 'Phiên Web chưa hợp lệ' : 'Yêu cầu Case thất bại'
  return `${prefix}: HTTP ${status}, ${data?.code || 'chưa có mã'}${data?.correlationId ? `, correlationId ${data.correlationId}` : ''}.`
}
export function useCaseIntake(defaultProjectFilter = 'UNASSIGNED') {
  const [params,setParams] = useSearchParams(), auth = useAuthStore()
  const isSupervisor = auth.user?.role === RoleCode.SUPERVISOR
  const actorScope = `${auth.authEpoch}:${auth.user?.id}:${auth.user?.role}`
  const projectFilter = params.get('projectId') || (isSupervisor ? defaultProjectFilter : 'ALL'), statusFilter = params.get('status') || 'ALL', caseId = params.get('caseId') || ''
  const listScope = `${actorScope}:${projectFilter}:${statusFilter}`, detailScope = `${actorScope}:${caseId}`
  const selection = useRef(detailScope); selection.current = detailScope
  const [reload,setReload] = useState(0), [detailReload,setDetailReload] = useState(0)
  const [list,setList] = useState<{scope:string;items:TriageCase[];projects:CaseProjectOption[]} | null>(null)
  const [listLoading,setListLoading] = useState(true), [listError,setListError] = useState('')
  const [snapshot,setSnapshot] = useState<{scope:string;value:TriageCase} | null>(null), [detailLoading,setDetailLoading] = useState(false), [detailError,setDetailError] = useState('')
  const [triageOpen,setTriageOpen] = useState(false), [projectId,setProjectId] = useState(''), [baseVersion,setBaseVersion] = useState('')
  const [held,setHeld] = useState<PendingTriage | null>(null), [busy,setBusy] = useState(false), [commandError,setCommandError] = useState(''), [message,setMessage] = useState('')
  const [reviewed,setReviewed] = useState<TriageCase | null>(null), [comparison,setComparison] = useState('')
  const [targetProjects, setTargetProjects] = useState<{scope: string; items: CaseProjectOption[]} | null>(null)
  const [targetLoading, setTargetLoading] = useState(false), [targetError, setTargetError] = useState(''), [targetReload, setTargetReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setTargetProjects(null); setTargetError(''); setTargetLoading(triageOpen)
    if (triageOpen) readEligibleTriageProjects(controller.signal).then(items => { if (!controller.signal.aborted) setTargetProjects({scope: detailScope, items}) })
      .catch(error => { if (!controller.signal.aborted) setTargetError(caseIntakeError(error)) })
      .finally(() => { if (!controller.signal.aborted) setTargetLoading(false) })
    return () => controller.abort()
  }, [triageOpen, detailScope, targetReload])
  const eligibleProjects = targetProjects?.scope === detailScope ? targetProjects.items : []
  const running = useRef(false)
  const requestedTriage = useRef('')
  useEffect(()=>{
    const controller = new AbortController()
    setList(null);setListLoading(true);setListError('')
    ;(async()=>{
      if (statusFilter !== 'ALL' && !CASE_STATUSES.includes(statusFilter)) throw new Error('Bộ lọc trạng thái không thuộc contract Case.')
      const projects = await triageService.getTriageProjects(controller.signal)
      const items = await triageService.getCases({projectId:projectFilter,status:statusFilter},controller.signal)
      if (!controller.signal.aborted) setList({scope:listScope,projects,items})
    })().catch(error=>{if(!controller.signal.aborted && !isCaseReadCanceled(error)){setListError(caseIntakeError(error));if(error instanceof CaseListReadError)setList({scope:listScope,items:error.items,projects:[]})}})
      .finally(()=>{if(!controller.signal.aborted)setListLoading(false)})
    return()=>controller.abort()
  },[listScope,reload])
  useEffect(()=>{
    const controller = new AbortController()
    setSnapshot(null);setDetailError('');setDetailLoading(!!caseId);setTriageOpen(false);setHeld(null);setBusy(false);running.current=false;setProjectId('');setBaseVersion('');setCommandError('');setMessage('');setReviewed(null);setComparison('')
    if(!caseId)return()=>controller.abort()
    if(!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(caseId)){setDetailError('Case ID không hợp lệ; không dùng mã hiển thị thay ID.');setDetailLoading(false);return()=>controller.abort()}
    ;(async()=>{
      const value=await triageService.getCaseById(caseId,controller.signal)
      if(!value || controller.signal.aborted)return
      setSnapshot({scope:detailScope,value});setBaseVersion(value.etag || value.version || '')
      const pending=triageService.pendingTriage(caseId)
      if(pending){setHeld(pending);setProjectId(pending.body.projectId);setBaseVersion(pending.version)}
      if(requestedTriage.current === caseId && isSupervisor && (pending || value.case_status === 'UNASSIGNED' && !value.project_id)) {setTriageOpen(true);requestedTriage.current=''}
    })().catch(e=>{if(!controller.signal.aborted && !isCaseReadCanceled(e))setDetailError(caseIntakeError(e))}).finally(()=>{if(!controller.signal.aborted)setDetailLoading(false)})
    return()=>controller.abort()
  },[detailScope,detailReload])
  const selected = snapshot?.scope === detailScope ? snapshot.value : null
  const projects = list?.scope === listScope ? list.projects : []
  const cases = list?.scope === listScope ? list.items : []
  const canTriage = isSupervisor && selected?.case_status === 'UNASSIGNED' && !selected.project_id && !detailLoading && !detailError
  const openCase=(id:string,triage=false)=>{requestedTriage.current=triage?id:'';const next=new URLSearchParams(params);if(id)next.set('caseId',id);else next.delete('caseId');setParams(next)}
  const filter=(key:'projectId'|'status',value:string)=>{const next=new URLSearchParams(params);next.set(key,value);next.delete('caseId');setParams(next)}
  const openTriage=()=>{if(!canTriage && !held)return;setProjectId(held?.body.projectId || '');setBaseVersion(held?.version || selected?.etag || selected?.version || '');setCommandError('');setTriageOpen(true)}
  const execute=async(method?:CaseTriageInput['verificationMethod'],reason?:string,retry=false)=>{
    if(running.current || !isSupervisor || !selected || !retry && !canTriage)return
    const scope=detailScope,current=()=>selection.current===scope && useAuthStore.getState().authEpoch===auth.authEpoch
    running.current=true;setBusy(true);setCommandError('')
    try{
      const old=triageService.pendingTriage(caseId)
      if(retry && !old)throw new Error('Không có lệnh triage đang chờ.')
      const input:CaseTriageInput=retry ? {...old!.body,version:old!.version} : {projectId,verificationMethod:method,reason,version:baseVersion}
      if(!retry && (targetLoading || targetError || !eligibleProjects.some(p=>p.id===projectId)))throw new Error('Chọn dự án từ danh sách server hiện tại.')
      const value=await triageService.triageCase(caseId,input)
      if(!current())return
      setSnapshot({scope:detailScope,value});setBaseVersion(value.etag || value.version || '');setHeld(null);setTriageOpen(false);setMessage('Đã điều phối hồ sơ vào dự án.');setReload(n=>n+1)
    }catch(e){if(current()){setCommandError(caseIntakeError(e));try{setHeld(triageService.pendingTriage(caseId))}catch{setCommandError('Không đọc được journal triage; chưa gửi lệnh mới.')}}}
    finally{if(current()){running.current=false;setBusy(false)}}
  }
  const review=async()=>{
    if(running.current)return
    const scope=detailScope;setBusy(true);running.current=true
    try{const fresh=await triageService.getCaseById(caseId);if(selection.current!==scope)return;if(!fresh)throw new Error('Chưa đọc được hồ sơ đối chiếu.');setReviewed(fresh);setComparison(fresh.case_status === 'UNASSIGNED' && !fresh.project_id ? 'Đã đọc lại hồ sơ chưa phân công. Kiểm tra nội dung trước khi tiếp tục; các lựa chọn của bạn được giữ nguyên.' : 'Hồ sơ đã được cập nhật hoặc phân công. Kiểm tra lại nội dung; các lựa chọn của bạn được giữ nguyên.')}
    catch(e){if(selection.current===scope)setCommandError(caseIntakeError(e))}finally{if(selection.current===scope){setBusy(false);running.current=false}}
  }
  const acceptReviewed=()=>{if(!reviewed || busy)return;triageService.reviseTriage(caseId);setHeld(null);setSnapshot({scope:detailScope,value:reviewed});setBaseVersion(reviewed.etag || reviewed.version || '');setReviewed(null);setCommandError('');setComparison('Đã dùng hồ sơ vừa đọc. Kiểm tra lựa chọn và tự xác nhận điều phối khi phù hợp.')}
  const applyReadback = (value: TriageCase) => {
    if (selection.current !== detailScope || value.id !== caseId || snapshot?.scope !== detailScope || value.project_id !== snapshot.value.project_id) return
    setSnapshot({scope: detailScope, value})
    setList(old => old?.scope === listScope ? {...old, items: old.items.map(item => item.id === value.id ? {...value, project_name: item.project_name} : item)} : old)
  }
  const setCases: Dispatch<SetStateAction<TriageCase[]>> = update => setList(old => old?.scope === listScope ? {...old,items:typeof update === 'function' ? update(old.items) : update} : old)
  return {eligibleProjects,targetLoading: targetLoading || triageOpen && !targetError && targetProjects?.scope !== detailScope,targetError,retryTargets:()=>setTargetReload(n=>n+1),applyReadback,setCases,caseId,selected,cases,projects,isSupervisor,projectFilter,statusFilter,listLoading,listError,detailLoading,detailError,triageOpen,projectId,setProjectId,held,busy,commandError,message,comparison,reviewed,canTriage,openCase,filter,openTriage,closeTriage:()=>{if(!busy)setTriageOpen(false)},execute,review,acceptReviewed,retryDetail:()=>setDetailReload(n=>n+1),retry:()=>setReload(n=>n+1)}
}
