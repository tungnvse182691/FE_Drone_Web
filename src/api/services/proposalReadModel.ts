import {repairWorkflowService,type RepairItem,type RepairPackage} from './repairWorkflowService'
import {useAuthStore} from '../../store/authStore'
import {apiClient} from '../client'
import {projectService} from './projectService'
import type {ProposalWorkPackage} from '../../types/domain'
export interface ProposalRead {view:ProposalWorkPackage;items:RepairItem[];raw:RepairPackage}
interface PackagePlanning {id:string;name?:string|null;description?:string|null;plannedDueAt?:string|null;createdBy?:string|null;createdAt?:string|null;version:string}
interface ItemPlanning {id:string;plannedQuantity?:number|null;plannedUnit?:string|null;plannedMaterials?:string|null;version:string}
const planErr=(e:any)=>`Không đọc được kế hoạch từ máy chủ (HTTP ${e?.response?.status||'mạng'} ${e?.response?.data?.code||''})`.trim()
const day=(v?:string|null)=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleDateString('vi-VN'):''
export async function readProposalPackages(projects:Array<{id:string;name:string}>,signal?:AbortSignal):Promise<ProposalRead[]> {
  const epoch=useAuthStore.getState().authEpoch,rows:ProposalRead[]=[]
  for(const project of projects){
    const packages=await repairWorkflowService.packages(project.id,signal)
    const scopes=packages.length?(await repairWorkflowService.coverage(project.id,signal)).scopes:[]
    // BE bản mới: tên/mô tả/hạn của gói và khối lượng-vật tư dự kiến của hạng mục (GET …/planning); tên người lập từ danh sách thành viên.
    const memberName=new Map<string,string>()
    if(packages.length){try{for(const m of await projectService.fetchProjectMembers(project.id))if(m?.userId&&m.displayName)memberName.set(String(m.userId).toLowerCase(),m.displayName)}catch{/* tên người lập hiện "Chưa có tên" */}}
    for(const pkg of packages){
      const items=await repairWorkflowService.items(project.id,pkg.id,signal)
      let planning:PackagePlanning|null=null,planningError=''
      try{planning=(await apiClient.get<PackagePlanning>(`/projects/${project.id}/repair-packages/${pkg.id}/planning`,{signal})).data}catch(e:any){planningError=planErr(e)}
      const itemPlans:Array<ItemPlanning|null>=await Promise.all(items.map(i=>apiClient.get<ItemPlanning>(`/projects/${project.id}/repair-packages/${pkg.id}/items/${i.id}/planning`,{signal}).then(r=>r.data).catch(()=>null)))
      const planned=itemPlans.filter((p):p is ItemPlanning=>!!p&&p.plannedQuantity!=null&&!!p.plannedUnit)
      const quantityText=planned.length?planned.map(p=>`${p.plannedQuantity} ${p.plannedUnit}`).join(' + '):''
      const materialsText=itemPlans.map(p=>p?.plannedMaterials?.trim()).filter(Boolean).join('; ')
      if(signal?.aborted || useAuthStore.getState().authEpoch!==epoch)throw new Error('Phiên đọc gói sửa chữa đã thay đổi.')
      const ready=items.some(i=>i.mode==='FastTrack'&&i.state==='ReadyToAssign'),awaiting=items.some(i=>i.mode==='Normal'&&i.state==='AwaitingApproval'),assigned=items.some(i=>['Assigned','InProgress','Submitted','Reviewed'].includes(i.state))
      const ranges=items.flatMap(i=>scopes.filter(s=>s.obligationId===i.obligationId)).map(s=>`${s.from}–${s.to} m · lệch ${s.offsetFrom}–${s.offsetTo} m`)
      const status:ProposalWorkPackage['status']=!items.length?'UNPROPOSED':ready?'READY_TO_ASSIGN':awaiting?'SUBMITTED':assigned?'DISPATCHED':'DECIDED'
      const status_label=!items.length?'Chưa đề xuất hạng mục':ready?'Fast Track: chờ PM giao có điều kiện':items.some(i=>i.mode==='Normal'&&i.state==='ReadyToAssign')?'Normal: đã duyệt, chờ PM giao':awaiting?'Normal: chờ Giám sát duyệt':assigned?'Đã phát sinh giao việc':pkg.allMandatoryResolved?'Đã giải quyết nghĩa vụ':'Theo trạng thái hạng mục'
      rows.push({raw:pkg,items,view:{id:pkg.id,code:`PKG-${pkg.id.slice(0,8).toUpperCase()}`,defect_id:pkg.defectId,title:planning?.name?.trim()||(items.some(i=>i.mode==='FastTrack')?'Hồ sơ sửa chữa Fast Track':'Hồ sơ sửa chữa Normal'),route_id:project.id,route_name:project.name,chainage_start:'',chainage_end:'',chainage_display:ranges.length?ranges.join('; '):'Chưa đọc được phạm vi nghĩa vụ; không suy toàn tuyến',segments_count:Number.NaN,defect_count:1,defect_summary:'Khiếm khuyết gốc của hồ sơ',technical_scope:quantityText?`Dự kiến ${quantityText}`:'Chưa nhập khối lượng dự kiến',material_scope:materialsText||planningError||'Chưa nhập vật tư dự kiến',duration_days:Number.NaN,date_range:day(planning?.plannedDueAt)?`Hạn kế hoạch ${day(planning?.plannedDueAt)}`:'',created_by_name:(planning?.createdBy&&memberName.get(String(planning.createdBy).toLowerCase()))||(planning?.createdBy?`Mã ${String(planning.createdBy).slice(0,8)}`:'Chưa có tên người lập'),created_by_initials:'',created_by_role:'',created_at:day(planning?.createdAt)||'Chưa có ngày lập',status,status_label,approved_items:items.filter(i=>i.state==='Confirmed'||i.mode==='Normal'&&['ReadyToAssign','Assigned','InProgress','Submitted','Reviewed'].includes(i.state)).length,total_items:items.length,contractor_name:'Crew đọc tại nhiệm vụ sau giao việc'}})
    }
  }
  return rows
}
