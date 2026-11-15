import type { RoadCoverageFact, RoadCoverageInputDto } from './types'
export interface CoverageChoice { scopeId:string; handoverId:string; sourceId:string; sourceKind:'WARRANTY'|'MAINTENANCE_BASIS'; provenance:'REAL_SOURCE'|'TEST_ONLY'; from:string; through:string; reason:string; documentNo:string; supersedesId?:string }
// Runtime RoadCoverageRepository compares calendar dates in Asia/Ho_Chi_Minh and an exclusive end.
export function coverageDate(utc:string, exclusiveEnd=false) {
  const time=Date.parse(utc)
  return Number.isFinite(time) ? new Date(time+7*3600000-(exclusiveEnd?1:0)).toISOString().slice(0,10) : ''
}
export function coverageFormErrors(data:RoadCoverageFact,form:CoverageChoice):Partial<Record<keyof CoverageChoice,string>> {
  const errors:Partial<Record<keyof CoverageChoice,string>>={},scope=data.scopes?.find(s=>s.obligationId===form.scopeId),handover=data.sources?.find(s=>s.kind==='HANDOVER' && s.id===form.handoverId),source=data.sources?.find(s=>s.kind===form.sourceKind && s.id===form.sourceId)
  if(!scope || !/^[a-f0-9]{64}$/i.test(scope.scopeHash))errors.scopeId=data.scopes?.length?'Chọn phạm vi nghĩa vụ có hash nguồn hợp lệ.':'Chưa có phạm vi nghĩa vụ trong nguồn đọc.'
  if(!handover || !/^[a-f0-9]{64}$/i.test(handover.version))errors.handoverId=data.sources?.some(s=>s.kind==='HANDOVER')?'Chọn hồ sơ bàn giao đã chấp nhận, có phiên bản nguồn.':'Chưa có hồ sơ bàn giao đã được chấp nhận; số hiệu nhập tay không thay thế hồ sơ.'
  if(!source || !/^[a-f0-9]{64}$/i.test(source.version))errors.sourceId=data.sources?.some(s=>s.kind===form.sourceKind)?'Chọn căn cứ có phiên bản nguồn.':'Chưa có nguồn căn cứ phù hợp trong dữ liệu đọc.'
  const day=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value
  if(!day(form.from))errors.from='Nhập ngày bắt đầu hợp lệ theo giờ Việt Nam.'
  if(!day(form.through) || form.through<form.from)errors.through='Ngày kết thúc phải hợp lệ và không trước ngày bắt đầu.'
  if(handover?.from && form.from<handover.from.slice(0,10) || form.sourceKind==='WARRANTY' && source?.from && form.from<source.from.slice(0,10))errors.from='Ngày bắt đầu trước thời gian bàn giao/bảo hành của nguồn.'
  if(form.sourceKind==='WARRANTY' && source?.to && form.through>source.to.slice(0,10))errors.through='Ngày kết thúc vượt thời hạn bảo hành của nguồn.'
  if(form.provenance==='REAL_SOURCE' && [handover,source].some(s=>!s || !['SOURCE_NOT_EXTERNALLY_VERIFIED','REAL_SOURCE'].includes(s.provenance || '')))errors.provenance='Nguồn thử nghiệm hoặc chưa rõ nguồn gốc không được khai báo là căn cứ thực tế.'
  if(form.supersedesId && !data.history?.some(h=>h.id===form.supersedesId && h.scopeObligationId===scope?.obligationId && h.provenance===form.provenance && !data.history?.some(next=>next.supersedesId===h.id)))errors.supersedesId='Xác nhận thay thế không cùng phạm vi/nguồn gốc hoặc đã bị thay thế.'
  if(form.provenance==='REAL_SOURCE' && data.history?.some(h=>h.provenance==='TEST_ONLY' && (h.sourceKind===form.sourceKind && h.sourceId===form.sourceId || !!form.handoverId && h.handoverDocumentId===form.handoverId)))errors.provenance='Nguồn đã dùng trong xác nhận thử nghiệm không được chuyển thành căn cứ thực tế; cần hồ sơ nguồn độc lập hợp lệ.'
  const reason=form.reason+(form.documentNo.trim()?` (Căn cứ văn bản: ${form.documentNo})`:'')
  if(!form.reason.trim() || reason.length>2000)errors.reason='Ý kiến bắt buộc, tối đa 2000 ký tự gồm ghi chú văn bản.'
  return errors
}
export function buildCoverageInput(data:RoadCoverageFact, form:CoverageChoice): RoadCoverageInputDto {
  const errors=coverageFormErrors(data,form);if(Object.keys(errors).length)throw new Error(Object.values(errors)[0])
  const scope=data.scopes!.find(s=>s.obligationId===form.scopeId)!,handover=data.sources!.find(s=>s.kind==='HANDOVER' && s.id===form.handoverId)!,source=data.sources!.find(s=>s.kind===form.sourceKind && s.id===form.sourceId)!
  const reason=form.reason+(form.documentNo.trim()?` (Căn cứ văn bản: ${form.documentNo})`:'')
  return {scopeObligationId:scope.obligationId,expectedScopeHash:scope.scopeHash,handoverDocumentId:handover.id,handoverVersion:handover.version,sourceKind:form.sourceKind,sourceId:source.id,sourceVersion:source.version,applicableFromUtc:new Date(form.from+'T00:00:00+07:00').toISOString(),applicableToUtc:new Date(Date.parse(form.through+'T00:00:00+07:00')+86400000).toISOString(),provenance:form.provenance,reason,...(form.supersedesId?{supersedesId:form.supersedesId}:{})}
}
