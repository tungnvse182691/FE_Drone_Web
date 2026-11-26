import type {HubProject} from '../types/domain'
import {displayKm} from './projectDistanceDisplay'
export function nearWarrantyEnd(project:HubProject,now=Date.now()):boolean|null{
  if(project.warranty_read_error||project.warranty_data_missing||!project.warranty_end_date)return null
  const end=Date.parse(project.warranty_end_date)
  return Number.isFinite(end)?end>=now&&end-now<30*86400000:null
}
export function pendingRouteReview(project:HubProject):boolean|null{
  if(!project.server_facts||project.server_facts.submissionError)return null
  return project.server_facts.submission?.status==='SUBMITTED'
}
export function projectListMetrics(projects:HubProject[]){
  const known=projects.filter(p=>Number.isFinite(p.length_km)),missing=projects.length-known.length
  const near=projects.map(p=>nearWarrantyEnd(p)),pending=projects.map(p=>pendingRouteReview(p))
  return{totalLength:known.length?displayKm(known.reduce((s,p)=>s+p.length_km!,0)):'Chưa có số liệu',missingLength:missing,
    activeCount:projects.filter(p=>p.status==='ACTIVE').length,nearExpiryCount:near.filter(Boolean).length,pendingAlignmentCount:pending.filter(Boolean).length,
    missingWarranty:near.filter(x=>x===null).length,missingSubmission:pending.filter(x=>x===null).length,closedCount:projects.filter(p=>p.status==='CLOSED').length}
}
