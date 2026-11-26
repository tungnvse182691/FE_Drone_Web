import React, {useEffect,useState} from 'react'
import {alignmentService,type RouteSystemView} from '../../../api/services/alignmentService'
import {useAuthStore} from '../../../store/authStore'
import {RoleCode} from '../../../types/enums'
import {CreateRouteSystemModal} from './CreateRouteSystemModal'

export function RouteSystemsRead({projectId}:{projectId:string}) {
  const epoch=useAuthStore(state=>state.authEpoch),scope=`${epoch}:${projectId}`
  const role=useAuthStore(state=>state.user?.role)
  const [permission,setPermission]=useState(''),[permissionError,setPermissionError]=useState(''),[openScope,setOpenScope]=useState(''),[message,setMessage]=useState('')
  const [read,setRead]=useState<{scope:string;items:RouteSystemView[];error:string}|null>(null),[reload,setReload]=useState(0)
  useEffect(()=>{
    let active=true;setRead(null)
    if(!projectId)return()=>{active=false}
    alignmentService.fetchRouteSystems(projectId).then(items=>{if(active)setRead({scope,items,error:''})}).catch(()=>{if(active)setRead({scope,items:[],error:'Không tải được danh sách hệ tuyến. Vui lòng thử lại.'})})
    return()=>{active=false}
  },[scope,reload])
  useEffect(()=>{
    let active=true;setPermission('');setPermissionError('');setOpenScope('');setMessage('')
    if(projectId&&role===RoleCode.PROJECT_MANAGER)alignmentService.readProjectContext(projectId).then(context=>{if(active&&context.projectId===projectId&&(context as {accessRole?:string}).accessRole==='PM')setPermission(scope)}).catch(()=>{if(active)setPermissionError('Không kiểm tra được quyền tạo hệ tuyến trong dự án. Hãy tải lại hệ tuyến.')})
    return()=>{active=false}
  },[scope,role,reload])
  const current=read?.scope===scope?read:null
  return <div aria-label="Hệ tuyến dự án" className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
    <span className="font-semibold text-slate-800">Hệ tuyến:</span>
    {permissionError&&<span role="alert" className="text-rose-700">{permissionError}</span>}
    {role===RoleCode.PROJECT_MANAGER&&permission===scope&&<button type="button" onClick={()=>setOpenScope(scope)} className="border border-slate-200 rounded-lg px-2 py-1 font-semibold hover:text-brand-gold">Tạo hệ tuyến</button>}
    {!current&&<span role="status">Đang tải hệ tuyến…</span>}
    {current?.error&&<><span role="alert" className="text-rose-700">{current.error}</span><button type="button" onClick={()=>setReload(n=>n+1)} className="underline">Thử tải lại hệ tuyến</button></>}
    {current&&!current.error&&!current.items.length&&<span>Chưa có hệ tuyến trong dự án.</span>}
    {current&&!current.error&&current.items.map(item=><span key={item.id} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">{[item.code,item.name].filter(Boolean).join(' — ')||'Chưa có mã hoặc tên hệ tuyến'}</span>)}
    {message&&<span role="status">{message}</span>}
    {openScope===scope&&permission===scope&&role===RoleCode.PROJECT_MANAGER&&<CreateRouteSystemModal key={scope} projectId={projectId} onClose={()=>setOpenScope('')} onCreated={items=>{setRead({scope,items,error:''});setOpenScope('');setMessage('Đã tạo và đọc lại hệ tuyến.')}}/>}
  </div>
}
