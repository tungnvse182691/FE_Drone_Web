import {repairWorkflowService,type RepairItem,type RepairPackage} from './repairWorkflowService'
import {useAuthStore} from '../../store/authStore'
import type {ProposalWorkPackage} from '../../types/domain'
export interface ProposalRead {view:ProposalWorkPackage;items:RepairItem[];raw:RepairPackage}
export async function readProposalPackages(projects:Array<{id:string;name:string}>,signal?:AbortSignal):Promise<ProposalRead[]> {
  const epoch=useAuthStore.getState().authEpoch,rows:ProposalRead[]=[]
  for(const project of projects){
    const packages=await repairWorkflowService.packages(project.id,signal)
    const scopes=packages.length?(await repairWorkflowService.coverage(project.id,signal)).scopes:[]
    for(const pkg of packages){
      const items=await repairWorkflowService.items(project.id,pkg.id,signal)
      if(signal?.aborted || useAuthStore.getState().authEpoch!==epoch)throw new Error('Phiên đọc gói sửa chữa đã thay đổi.')
      const ready=items.some(i=>i.mode==='FastTrack'&&i.state==='ReadyToAssign'),awaiting=items.some(i=>i.mode==='Normal'&&i.state==='AwaitingApproval'),assigned=items.some(i=>['Assigned','InProgress','Submitted','Reviewed'].includes(i.state))
      const ranges=items.flatMap(i=>scopes.filter(s=>s.obligationId===i.obligationId)).map(s=>`${s.from}–${s.to} m · lệch ${s.offsetFrom}–${s.offsetTo} m`)
      const status:ProposalWorkPackage['status']=!items.length?'UNPROPOSED':ready?'READY_TO_ASSIGN':awaiting?'SUBMITTED':assigned?'DISPATCHED':'DECIDED'
      const status_label=!items.length?'Chưa đề xuất hạng mục':ready?'Fast Track: chờ PM giao có điều kiện':items.some(i=>i.mode==='Normal'&&i.state==='ReadyToAssign')?'Normal: đã duyệt, chờ PM giao':awaiting?'Normal: chờ Giám sát duyệt':assigned?'Đã phát sinh giao việc':pkg.allMandatoryResolved?'Đã giải quyết nghĩa vụ':'Theo trạng thái hạng mục'
      rows.push({raw:pkg,items,view:{id:pkg.id,code:`PKG-${pkg.id.slice(0,8).toUpperCase()}`,defect_id:pkg.defectId,title:items.some(i=>i.mode==='FastTrack')?'Hồ sơ sửa chữa Fast Track':'Hồ sơ sửa chữa Normal',route_id:project.id,route_name:project.name,chainage_start:'',chainage_end:'',chainage_display:ranges.length?ranges.join('; '):'Chưa đọc được phạm vi nghĩa vụ; không suy toàn tuyến',segments_count:Number.NaN,defect_count:1,defect_summary:'Khiếm khuyết gốc của hồ sơ',technical_scope:'Phương án thuộc hạng mục đã đề xuất',material_scope:'Chưa có dữ liệu vật tư trong hồ sơ',duration_days:Number.NaN,date_range:'Chưa có thời gian kế hoạch từ nguồn đọc',created_by_name:'Chưa có tên từ nguồn đọc',created_by_initials:'',created_by_role:'',created_at:'Chưa có thời điểm từ nguồn đọc',status,status_label,approved_items:items.filter(i=>i.state==='Confirmed'||i.mode==='Normal'&&['ReadyToAssign','Assigned','InProgress','Submitted','Reviewed'].includes(i.state)).length,total_items:items.length,contractor_name:'Crew đọc tại nhiệm vụ sau giao việc'}})
    }
  }
  return rows
}
