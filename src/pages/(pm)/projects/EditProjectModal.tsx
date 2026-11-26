import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { projectUpdateService, type EditableProject } from '../../../api/services/projectUpdateService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'

export function EditProjectModal({projectId,onClose,onSaved}: {projectId:string;onClose:()=>void;onSaved:(project:EditableProject)=>void}) {
  const {authEpoch,user}=useAuthStore(),allowed=user?.role===RoleCode.SUPERVISOR
  const [base,setBase]=useState<EditableProject|null>(null),[name,setName]=useState(''),[description,setDescription]=useState('')
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[conflict,setConflict]=useState(false),[reload,setReload]=useState(0)
  const latest=useRef('');const currentScope=`${authEpoch}:${user?.id}:${projectId}`;latest.current=currentScope
  let held:ReturnType<typeof projectUpdateService.pending>=null,journalError=''
  try{if(allowed)held=projectUpdateService.pending(projectId)}catch(e){journalError=(e as Error).message}
  useEffect(()=>{
    let active=true;setLoading(true);setError('')
    if(!allowed){setLoading(false);return}
    projectUpdateService.read(projectId).then(read=>{
      if(!active)return
      const pending=projectUpdateService.pending(projectId)
      setBase(read)
      if(pending){setName(pending.body.name);setDescription(pending.body.description??'')}
      else if(!reload||!base){setName(read.name);setDescription(read.description??'')}
      setConflict(false)
    }).catch(e=>{if(active)setError(`Không đọc được dự án: ${e?.response?.data?.code||e.message}`)}).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[projectId,authEpoch,allowed,reload])
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(!allowed||busy||loading||conflict||!base||journalError)return
    const start=currentScope;setBusy(true);setError('')
    try{const read=await projectUpdateService.run(projectId,held?undefined:base,held?undefined:name,held?undefined:description);if(latest.current===start)onSaved(read)}
    catch(e:any){if(latest.current===start){const stale=e?.projectVersionStale||e?.response?.status===409&&e?.response?.data?.code==='concurrency_conflict';setConflict(!!stale);setError(stale?'Dự án đã thay đổi. Tải lại dữ liệu, đối chiếu với nội dung bạn nhập trước khi lưu tiếp.':`Không hoàn tất lưu: ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`)}}
    finally{if(latest.current===start)setBusy(false)}
  }
  if(!allowed)return null
  return <div role="dialog" aria-modal="true" aria-label="Sửa dự án" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold"><Icon name="edit" size={20} /></div><h2 className="text-base font-bold text-slate-900 font-headline">Sửa dự án</h2></div><button type="button" aria-label="Đóng sửa dự án" disabled={busy} onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700"><Icon name="close" size={20} /></button></div>
    <form onSubmit={submit} className="p-6 space-y-4 text-xs font-body">
      {loading&&<p role="status">Đang đọc hồ sơ dự án…</p>}
      {(error||journalError)&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error||journalError}</p>}
      {held&&<p role="status" className="text-amber-800">{held.received?'Đã nhận phản hồi lưu. Chỉ đọc lại để xác minh, không gửi lại lệnh sửa.':'Yêu cầu trước chưa rõ kết quả. Giữ nguyên nội dung và mã thao tác khi đối chiếu.'}</p>}
      <label className="block space-y-1 font-medium text-slate-700">Mã dự án<input aria-label="Mã dự án" readOnly value={base?.projectCode||''} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50" /></label>
      <fieldset disabled={busy||loading||!!held||!!journalError} className="space-y-4 min-w-0">
        <label className="block space-y-1 font-medium text-slate-700">Tên dự án<input aria-label="Tên dự án" required maxLength={255} value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-gold" /></label>
        <label className="block space-y-1 font-medium text-slate-700">Địa bàn<input aria-label="Địa bàn" value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-gold" /></label>
      </fieldset>
      {conflict&&<p className="text-amber-800">Nội dung bạn nhập được giữ nguyên. Hãy tải lại và so sánh trước khi bấm Lưu.</p>}
      {reload>0&&base&&!held&&<p role="status" className="text-slate-600 break-words">Máy chủ hiện tại: {base.name} · {base.description??'Chưa có địa bàn'}. Nội dung bạn nhập vẫn được giữ để đối chiếu.</p>}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
        {(!held&&(error||conflict))&&<button type="button" disabled={busy||loading} className="underline text-slate-600" onClick={()=>setReload(n=>n+1)}>Tải lại dữ liệu</button>}
        <button type="button" disabled={busy} onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700">Hủy bỏ</button>
        <button type="submit" disabled={busy||loading||conflict||!base||!name.trim()||name.trim().length>255||!!journalError} className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white font-semibold disabled:opacity-50">{busy?'Đang lưu/đọc lại…':held?held.received?'Thử đọc lại kết quả':'Đối chiếu cùng yêu cầu':'Lưu'}</button>
      </div>
    </form>
  </div></div>
}
