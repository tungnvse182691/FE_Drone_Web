import type { RoadCoverageReadFact } from './fastTrackService'
import type { RoadCoverageFact } from '../../pages/(pm)/fast-track/types'
// Mirrors the read-only scope/time/source resolution in b89a52f RoadCoverageResolver.Resolve.
// It does not grant execution eligibility or turn a saved confirmation into a whole-project approval.
export function coverageScopeView(data:RoadCoverageReadFact,etag:string,scopeId?:string,now=Date.now()):RoadCoverageFact {
  const summaries=data.scopes.map(scope=>{
    const leaves=data.history.filter(h=>h.roadSectionId===scope.roadSectionId && h.locationVersion===scope.locationVersion && !data.history.some(next=>next.supersedesId===h.id))
    const whole=leaves.filter(h=>h.from<=scope.from && h.to>=scope.to && h.offsetFrom<=scope.offsetFrom && h.offsetTo>=scope.offsetTo)
    const active=whole.filter(h=>Date.parse(h.applicableFromUtc)<=now && now<Date.parse(h.applicableToUtc))
    let state='UNCONFIRMED',message='Chưa có xác nhận cho phạm vi này',mapping:any
    if(active.length>1){state='AMBIGUOUS';message='Có nhiều xác nhận cùng áp dụng; cần đối chiếu nguồn'}
    else if(active.length===1){mapping=active[0];const handover=data.sources.find(s=>s.kind==='HANDOVER' && s.id===mapping.handoverDocumentId),source=data.sources.find(s=>s.kind===mapping.sourceKind && s.id===mapping.sourceId)
      if(!handover || !source || !handover.fileId || !source.fileId || handover.fileId!==mapping.handoverFileId || source.fileId!==mapping.coverageFileId || handover.version!==mapping.handoverVersion || source.version!==mapping.sourceVersion || mapping.provenance==='REAL_SOURCE' && [handover,source].some(s=>s.provenance==='TEST_ONLY')){state='SOURCE_STALE';message='Nguồn xác nhận thiếu hoặc đã thay đổi'}
      else if(mapping.provenance==='TEST_ONLY'){state='TEST_ONLY';message='Xác nhận thử nghiệm — không cấp quyền thi công'}
      else{state='CONFIRMED';message='Có xác nhận còn hiệu lực cho phạm vi này'}
    }else if(whole.length){mapping=whole.length===1?whole[0]:undefined;state='OUTSIDE_PERIOD';message='Chưa có xác nhận còn hiệu lực tại thời điểm đọc'}
    else if(leaves.length){state='PARTIAL';message='Xác nhận không bao trọn phạm vi hoặc độ lệch'}
    return {obligationId:scope.obligationId,state,message,mapping}
  })
  const scope=data.scopes.find(s=>s.obligationId===scopeId) || (data.scopes.length===1?data.scopes[0]:undefined),result=summaries.find(s=>s.obligationId===scope?.obligationId),h=result?.mapping
  return {coverageReadAt:now,projectId:data.projectId,projectName:'',scopeObligationId:scope?.obligationId||'',scopeHash:scope?.scopeHash,fromKm:scope?scope.from/1000:0,toKm:scope?scope.to/1000:0,sourceKind:h?.sourceKind||'MAINTENANCE_BASIS',handoverDocumentId:h?.handoverDocumentId,handoverVersion:h?.handoverVersion||'',applicableFromUtc:h?.applicableFromUtc||'',applicableToUtc:h?.applicableToUtc||'',status:result?.state==='CONFIRMED'?'CONFIRMED':'PENDING',coverageStatus:result?.state,coverageMessage:result?.message || (data.scopes.length?'Chọn phạm vi để đọc hiệu lực':'Chưa có phạm vi nghĩa vụ'),provenance:h?.provenance,confirmedBy:h?.actorId,confirmedAt:h?.confirmedAtUtc,reason:h?.reason,sourceId:h?.sourceId,sourceVersion:h?.sourceVersion,etag,scopes:data.scopes,sources:data.sources,history:data.history,readFact:data,hasWarrantySource:data.sources.some(s=>s.kind==='WARRANTY'),blockers:[...(!data.scopes.length?['Chưa có phạm vi nghĩa vụ']:[]),...(!data.sources.some(s=>s.kind==='HANDOVER')?['Chưa có hồ sơ bàn giao đã được chấp nhận']:[]),...(!data.sources.some(s=>['WARRANTY','MAINTENANCE_BASIS'].includes(s.kind))?['Chưa có nguồn căn cứ bảo hành/bảo trì']:[])]}
}
