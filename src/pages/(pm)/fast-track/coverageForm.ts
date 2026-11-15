import type { RoadCoverageFact, RoadCoverageInputDto } from './types'
export interface CoverageChoice { scopeId:string; handoverId:string; sourceId:string; sourceKind:'WARRANTY'|'MAINTENANCE_BASIS'; provenance:'REAL_SOURCE'|'TEST_ONLY'; from:string; through:string; reason:string; documentNo:string; supersedesId?:string }
// Runtime RoadCoverageRepository compares calendar dates in Asia/Ho_Chi_Minh and an exclusive end.
export function coverageDate(utc:string, exclusiveEnd=false) {
  const time=Date.parse(utc)
  return Number.isFinite(time) ? new Date(time+7*3600000-(exclusiveEnd?1:0)).toISOString().slice(0,10) : ''
}
export function buildCoverageInput(data:RoadCoverageFact, form:CoverageChoice): RoadCoverageInputDto {
  const scope=data.scopes?.find(s=>s.obligationId===form.scopeId)
  const handover=data.sources?.find(s=>s.kind==='HANDOVER' && s.id===form.handoverId)
  const source=data.sources?.find(s=>s.kind===form.sourceKind && s.id===form.sourceId)
  if(!scope || !handover || !source || !/^[a-f0-9]{64}$/i.test(scope.scopeHash) || !/^[a-f0-9]{64}$/i.test(handover.version) || !/^[a-f0-9]{64}$/i.test(source.version)) throw new Error('Thiếu phạm vi, hồ sơ bàn giao đã chấp nhận hoặc căn cứ có phiên bản. Chưa thể xác nhận độ phủ.')
  const day=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value
  if(!day(form.from) || !day(form.through) || form.through<form.from)throw new Error('Nhập ngày bắt đầu và ngày kết thúc hợp lệ, theo thứ tự, tính trọn ngày giờ Việt Nam.')
  if(handover.from && form.from<handover.from.slice(0,10) || form.sourceKind==='WARRANTY' && (source.from && form.from<source.from.slice(0,10) || source.to && form.through>source.to.slice(0,10)))throw new Error('Thời hạn không nằm trong thời gian bàn giao/bảo hành của hồ sơ nguồn.')
  if(form.provenance==='REAL_SOURCE' && [handover,source].some(s=>!['SOURCE_NOT_EXTERNALLY_VERIFIED','REAL_SOURCE'].includes(s.provenance || '')))throw new Error('Nguồn thử nghiệm hoặc chưa rõ nguồn gốc không được khai báo là căn cứ thực tế.')
  if(form.supersedesId && !data.history?.some(h=>h.id===form.supersedesId && h.scopeObligationId===scope.obligationId && !data.history?.some(next=>next.supersedesId===h.id)))throw new Error('Xác nhận cần thay thế không thuộc phạm vi đang chọn.')
  const reason=form.reason+(form.documentNo.trim() ? ` (Căn cứ văn bản: ${form.documentNo})` : '')
  if(!form.reason.trim() || reason.length>2000)throw new Error('Nhập ý kiến thẩm duyệt, tổng tối đa 2000 ký tự kể cả ghi chú văn bản.')
  return {scopeObligationId:scope.obligationId,expectedScopeHash:scope.scopeHash,handoverDocumentId:handover.id,handoverVersion:handover.version,sourceKind:form.sourceKind,sourceId:source.id,sourceVersion:source.version,applicableFromUtc:new Date(form.from+'T00:00:00+07:00').toISOString(),applicableToUtc:new Date(Date.parse(form.through+'T00:00:00+07:00')+86400000).toISOString(),provenance:form.provenance,reason,...(form.supersedesId ? {supersedesId:form.supersedesId} : {})}
}
