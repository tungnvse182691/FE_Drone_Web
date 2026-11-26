import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import type { SystemUserAccount } from '../../types/domain'
import { personnelSnapshot, readPersonnelProjects } from './personnelScreen'

export interface PersonnelDetailRead {
  account:SystemUserAccount
  assignments:NonNullable<SystemUserAccount['project_memberships']>
  assignmentError:string
  primaryError:string
}
export async function readPersonnelDetail(userId:string):Promise<PersonnelDetailRead> {
  const {user,authEpoch}=useAuthStore.getState()
  if(user?.role!==RoleCode.SUPERVISOR)throw new Error('Chỉ Giám sát được đọc hồ sơ tài khoản.')
  const current=()=>{const s=useAuthStore.getState();if(s.authEpoch!==authEpoch||s.user?.id!==user.id)throw new Error('Phiên đã thay đổi; bỏ hồ sơ cũ.')}
  // API238 fences the matching API237 contact/status row with stable account ETags.
  const {account}=await personnelSnapshot(userId);current()
  const result:PersonnelDetailRead={account,assignments:[],assignmentError:'',primaryError:''}
  const wireRole=account.role===RoleCode.PROJECT_MANAGER?'PM':account.role===RoleCode.DRONE_OPERATOR?'OPERATOR':account.role===RoleCode.REPAIR_CREW?'CREW':null
  if(!wireRole)return result
  let projects:Awaited<ReturnType<typeof readPersonnelProjects>>
  try{projects=await readPersonnelProjects();current()}catch(e){current();return {...result,assignmentError:'Không tải được đầy đủ phạm vi dự án để kiểm tra phân công. Hãy thử lại.'}}
  const reads=await Promise.allSettled(projects.map(async project=>{
    const rows:any[]=[],seen=new Set<string>();let cursor:string|undefined,day=''
    do{
      const {data}=await apiClient.get(`/projects/${project.id}/members`,{params:{limit:100,cursor,includeHistory:true}});current()
      if(!Array.isArray(data?.items)||data.nextCursor!=null&&(typeof data.nextCursor!=='string'||!data.nextCursor)||typeof data.asOf!=='string'||!Number.isFinite(Date.parse(data.asOf)))throw new Error('Phân trang thành viên thiếu dữ liệu kiểm tra hiệu lực.')
      const asOf=new Date(data.asOf).toISOString().slice(0,10)
      if(day&&day!==asOf)throw new Error('Ngày kiểm tra phân công thay đổi giữa các trang.')
      day=asOf;rows.push(...data.items);cursor=data.nextCursor||undefined
      if(cursor&&seen.has(cursor))throw new Error('Cursor thành viên bị lặp.')
      if(cursor)seen.add(cursor)
    }while(cursor)
    const own=rows.filter(m=>m.userId===userId)
    if(own.some(m=>!m.membershipId||typeof m.role!=='string'||typeof m.status!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.validFrom)||!(m.validTo===null||typeof m.validTo==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(m.validTo)))||new Set(own.map(m=>m.membershipId)).size!==own.length)throw new Error('Phân công thiếu định danh, trạng thái hoặc ngày hiệu lực.')
    const effective=own.filter(m=>m.role===wireRole&&m.status==='ACTIVE'&&m.validFrom<=day&&(m.validTo===null||day<=m.validTo))
    let primaryId='',primaryMembership='',primaryError=''
    if(wireRole==='PM'&&effective.length){
      try{
        const {data}=await apiClient.get(`/projects/${project.id}/primary-project-manager`);current()
        if(!data||!Object.prototype.hasOwnProperty.call(data,'primaryProjectManager')||data.primaryProjectManager!==null&&(!data.primaryProjectManager.userId||!data.primaryProjectManager.membershipId))throw Error('Thiếu reference PM chính.')
        primaryId=data.primaryProjectManager?.userId||'';primaryMembership=data.primaryProjectManager?.membershipId||''
      }catch{current();primaryError=`Chưa tải được PM chính của dự án ${project.name}.`}
    }
    const chosen=effective.find(m=>m.userId===primaryId&&m.membershipId===primaryMembership)||effective[0]
    return {primaryError,assignment:chosen?{projectId:project.id,projectName:project.name,membershipId:chosen.membershipId,role:chosen.role,status:chosen.status,isPrimary:wireRole==='PM'&&chosen.userId===primaryId&&chosen.membershipId===primaryMembership,validFrom:chosen.validFrom,validTo:chosen.validTo}:null}
  }));current()
  const errors:string[]=[],primaryErrors:string[]=[]
  reads.forEach((read,i)=>{
    if(read.status==='rejected')errors.push(`Chưa tải đầy đủ phân công tại dự án ${projects[i].name}.`)
    else{if(read.value.assignment)result.assignments.push(read.value.assignment);if(read.value.primaryError)primaryErrors.push(read.value.primaryError)}
  })
  return {...result,assignmentError:errors.join(' '),primaryError:primaryErrors.join(' ')}
}
