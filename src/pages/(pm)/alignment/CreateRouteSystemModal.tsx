import React,{useState,useRef} from 'react'
import {routeSystemCommands} from '../../../api/services/routeSystemCommands'
import {useAuthStore} from '../../../store/authStore'
import type {RouteSystemView} from '../../../api/services/alignmentService'
import {RoleCode} from '../../../types/enums'
import {Icon} from '../../../components/ui/Icon'

export function CreateRouteSystemModal({projectId,onClose,onCreated}:{projectId:string;onClose:()=>void;onCreated:(items:RouteSystemView[])=>void}){
  const {user,authEpoch}=useAuthStore(),scope=`${authEpoch}:${user?.id}:${projectId}`,latest=useRef(scope);latest.current=scope
  const [code,setCode]=useState(()=>{try{return routeSystemCommands.pending(projectId)?.body.code||''}catch{return''}})
  const [name,setName]=useState(()=>{try{return routeSystemCommands.pending(projectId)?.body.name||''}catch{return''}})
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  let held:ReturnType<typeof routeSystemCommands.pending>=null,journalError=''
  try{held=routeSystemCommands.pending(projectId)}catch(e){journalError=(e as Error).message}
  if(user?.role!==RoleCode.PROJECT_MANAGER)return null
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(busy||journalError)return
    const started=scope;setBusy(true);setError('')
    try{const result=await routeSystemCommands.run(projectId,held?undefined:{code,name});if(latest.current===started)onCreated(result.items)}
    catch(e:any){if(latest.current===started){const http=e?.response?.status,wire=e?.response?.data?.code;setError(wire==='route_system_invalid'?'Máy chủ từ chối hệ tuyến (422 route_system_invalid). Kiểm tra mã/tên theo hồ sơ nguồn; bản nhập được giữ.':http?`Không tạo được hệ tuyến: HTTP ${http} ${wire||''}.` : e.message||'Chưa rõ kết quả tạo hệ tuyến. Giữ nguyên yêu cầu để đối chiếu.')}}
    finally{if(latest.current===started)setBusy(false)}
  }
  return <div role="dialog" aria-modal="true" aria-label="Tạo hệ tuyến" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><section className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50"><h2 className="text-base font-bold text-slate-900 inline-flex items-center gap-2"><Icon name="route" size={20} className="text-brand-gold" />Tạo hệ tuyến</h2><button type="button" disabled={busy} aria-label="Đóng tạo hệ tuyến" onClick={onClose}><Icon name="close" size={20}/></button></header>
    <form onSubmit={submit} className="p-6 space-y-4 text-xs">
      {(error||journalError)&&<p role="alert" className="text-rose-700">{error||journalError}</p>}
      {held&&<p role="status" className="text-amber-800">{held.received?'Đã nhận phản hồi tạo. Chỉ đọc lại danh sách để xác minh.':'Yêu cầu trước chưa rõ kết quả. Giữ nguyên mã/tên và khóa yêu cầu khi thử lại.'}</p>}
      <fieldset disabled={busy||!!held||!!journalError} className="space-y-4">
        <label className="block space-y-1 text-slate-700">Mã hệ tuyến<input aria-label="Mã hệ tuyến" value={code} onChange={e=>setCode(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" /></label>
        <label className="block space-y-1 text-slate-700">Tên hệ tuyến<input aria-label="Tên hệ tuyến" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" /></label>
      </fieldset>
      <footer className="border-t border-slate-100 pt-4 flex justify-end gap-3"><button type="button" disabled={busy} onClick={onClose} className="rg-btn">Hủy bỏ</button><button type="submit" disabled={busy||!!journalError} className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white font-semibold disabled:opacity-50">{busy?'Đang tạo/đọc lại…':held?.received?'Đọc lại danh sách':held?'Thử lại cùng yêu cầu':'Tạo hệ tuyến'}</button></footer>
    </form>
  </section></div>
}
