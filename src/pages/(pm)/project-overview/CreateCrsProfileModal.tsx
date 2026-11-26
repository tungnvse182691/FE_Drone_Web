import React,{useEffect,useRef,useState} from 'react'
import {parseRoadGuardDraftJson} from '../alignment/roadGuardDraftImportHelpers'
import {Icon} from '../../../components/ui/Icon'
import {useAuthStore} from '../../../store/authStore'
import {RoleCode} from '../../../types/enums'
import {crsProfileCommands} from '../../../api/services/crsProfileCommands'
import type {CrsProfileInput,CrsProfileView} from '../../../api/services/alignmentService'

const textFields=[['code','Mã hồ sơ'],['sourceSrid','SRID nguồn'],['datum','Datum'],['projection','Phép chiếu'],['metresPerUnit','Mét trên mỗi đơn vị'],['sourceReference','Nguồn tham chiếu'],['sourceChecksum','Checksum nguồn'],['sourcedToleranceMeters','Dung sai theo nguồn (m)'],['toleranceSource','Nguồn dung sai']] as const
const jsonFields=[['operation','Phép biến đổi (JSON theo hồ sơ)'],['independentControls','Điểm kiểm tra độc lập (JSON theo hồ sơ)'],['ellipsoid','Ellipsoid (JSON theo hồ sơ)'],['projectionDefinition','Định nghĩa phép chiếu (JSON theo hồ sơ)']] as const
type Form=Record<string,string>
export function crsProfileInput(form:Form):CrsProfileInput{
  for(const key of ['code','sourceSrid','datum','projection','axisOrder','metresPerUnit','sourceReference','sourceChecksum'])if(!form[key]?.trim())throw new Error(`${key}: trường bắt buộc cho hồ sơ CANDIDATE.`)
  const sourceSrid=Number(form.sourceSrid),metresPerUnit=Number(form.metresPerUnit)
  if(!Number.isInteger(sourceSrid)||sourceSrid<0||!Number.isFinite(metresPerUnit)||metresPerUnit<=0)throw new Error('SRID phải là số nguyên không âm; mét trên mỗi đơn vị phải là số hữu hạn lớn hơn 0.')
  const body:CrsProfileInput={sourceSrid,metresPerUnit}
  for(const [key] of textFields)if(key!=='sourceSrid'&&key!=='metresPerUnit'&&form[key]?.length){
    if(key==='sourcedToleranceMeters'){const v=Number(form[key]);if(!Number.isFinite(v)||!form[key].trim())throw new Error('Dung sai phải là số từ tài liệu kỹ thuật.');body.sourcedToleranceMeters=v}
    else Object.assign(body,{[key]:form[key]})
  }
  if(form.axisOrder)body.axisOrder=form.axisOrder as 'EN'|'NE'
  if(form.sampleOnly)body.sampleOnly=form.sampleOnly==='true'
  for(const [key,label] of jsonFields)if(form[key]?.trim()){
    let value:unknown;try{value=JSON.parse(form[key])}catch{throw new Error(`${label}: JSON không hợp lệ.`)}
    if(key==='independentControls'?!Array.isArray(value):!value||typeof value!=='object'||Array.isArray(value))throw new Error(`${label}: sai kiểu dữ liệu theo contract.`)
    Object.assign(body,{[key]:value})
  }
  return body
}
export function CreateCrsProfileModal({projectId,onClose,onCreated}:{projectId:string;onClose:()=>void;onCreated:(items:CrsProfileView[],profile:CrsProfileView)=>void}){
  const {user,authEpoch}=useAuthStore(),scope=`${authEpoch}:${user?.id}:${projectId}`,latest=useRef(scope);latest.current=scope
  const [form,setForm]=useState<Form>(()=>{try{const held=crsProfileCommands.pending(projectId);return held?Object.fromEntries(Object.entries(held.body).map(([k,v])=>[k,typeof v==='object'?JSON.stringify(v,null,2):String(v)])):{}}catch{return{}}})
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  const [fileName,setFileName]=useState('')
  const fileAttempt=useRef(0)
  useEffect(()=>()=>{fileAttempt.current++},[scope])
  let held:ReturnType<typeof crsProfileCommands.pending>=null,journalError=''
  try{held=crsProfileCommands.pending(projectId)}catch(e){journalError=(e as Error).message}
  if(user?.role!==RoleCode.PROJECT_MANAGER)return null
  const change=(key:string,value:string)=>setForm(f=>({...f,[key]:value}))
  const readDraftFile=async(file:File)=>{
    const attempt=++fileAttempt.current,started=scope
    setError('');setFileName(file.name)
    try{
      const bytes=await file.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('')
      const text=new TextDecoder().decode(bytes),raw=JSON.parse(text)
      if(raw.sourceCrs==null)throw new Error('File thiếu sourceCrs hợp lệ.')
      const parsed=parseRoadGuardDraftJson(text);const srid=parsed.sourceCrs
      if(!Number.isInteger(srid)||srid<0)throw new Error('File thiếu sourceCrs hợp lệ.')
      const epsg=srid===32648?{datum:'World Geodetic System 1984 ensemble',projection:'Transverse Mercator',axisOrder:'EN',metresPerUnit:'1'}:null
      if(attempt!==fileAttempt.current||latest.current!==started)return
      setForm(old=>({...old,sourceSrid:String(srid),sourceReference:`${file.name} · EPSG:${srid}`,sourceChecksum:hash,datum:'',projection:'',axisOrder:'',metresPerUnit:'',...(epsg||{})}))
      if(!epsg)setError(`Chưa có định nghĩa EPSG:${srid} trong FE; cần bổ sung datum, projection, axisOrder và metresPerUnit từ hồ sơ CRS.`)
    }catch(e){if(attempt===fileAttempt.current&&latest.current===started)setError(e instanceof Error?e.message:'Không đọc được draft.json.')}
  }
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(busy||journalError)return;const started=scope;setBusy(true);setError('')
    try{const result=await crsProfileCommands.run(projectId,held?undefined:crsProfileInput(form));if(latest.current===started)onCreated(result.items,result.profile)}
    catch(e:any){if(latest.current===started){const status=e?.response?.status,code=e?.response?.data?.code;setError(status?`Không tạo/đọc được hồ sơ: HTTP ${status} ${code||''}. Nội dung đã nhập được giữ.`:e.message||'Chưa rõ kết quả, giữ nguyên yêu cầu để đối chiếu.')}}
    finally{if(latest.current===started)setBusy(false)}
  }
  return <div role="dialog" aria-modal="true" aria-label="Tạo hồ sơ hệ quy chiếu" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><section className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    <header className="flex items-center justify-between px-6 py-4 border-b bg-slate-50"><h2 className="text-base font-bold inline-flex items-center gap-2"><Icon name="public" size={20} className="text-brand-gold"/>Tạo hồ sơ hệ quy chiếu</h2><button type="button" disabled={busy} onClick={onClose} aria-label="Đóng tạo hồ sơ CRS"><Icon name="close" size={20}/></button></header>
    <form onSubmit={submit} className="p-6 space-y-4 text-xs">
      <p className="text-slate-500">Nhập theo tài liệu kỹ thuật và nguồn gốc hồ sơ. Mã CRS dự án không thay thế định nghĩa hoặc chứng nhận OFFICIAL; trạng thái do máy chủ trả về.</p>
      <label className="block text-slate-600">Chọn file draft.json<input aria-label="Chọn file draft.json" type="file" accept=".json,application/json" disabled={busy||!!held||!!journalError} onChange={e=>{const file=e.target.files?.[0];if(file)void readDraftFile(file)}} className="mt-1 block w-full text-xs"/>{fileName&&<span className="text-slate-500">Nguồn: {fileName}</span>}</label>
      {(error||journalError)&&<p role="alert" className="text-rose-700">{error||journalError}</p>}
      {held&&<p role="status" className="text-amber-800">{held.received?'Đã nhận phản hồi tạo. Chỉ đọc lại danh sách và chi tiết.':'Yêu cầu chưa rõ kết quả. Giữ nguyên nội dung và khóa yêu cầu khi thử lại.'}</p>}
      <fieldset disabled={busy||!!held||!!journalError} className="grid sm:grid-cols-2 gap-3">
        {textFields.filter(([key])=>!['sourcedToleranceMeters','toleranceSource'].includes(key)).map(([key,label])=><label key={key} className="min-w-0 text-slate-600">{label}{['code','sourceSrid','datum','projection','axisOrder','metresPerUnit','sourceReference','sourceChecksum'].includes(key)&&<span className="text-rose-600"> *</span>}<input aria-label={label} value={form[key]||''} maxLength={key==='code'?80:undefined} onChange={e=>change(key,e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg p-2"/></label>)}
        <label>Thứ tự trục <span className="text-rose-600">*</span><select aria-label="Thứ tự trục" value={form.axisOrder||''} onChange={e=>change('axisOrder',e.target.value)} className="rg-field mt-1 w-full"><option value="">Chưa khai báo</option><option value="EN">EN</option><option value="NE">NE</option></select></label>
        <label>Hồ sơ chỉ dùng mẫu<select aria-label="Hồ sơ chỉ dùng mẫu" value={form.sampleOnly||''} onChange={e=>change('sampleOnly',e.target.value)} className="rg-field mt-1 w-full"><option value="">Chưa khai báo</option><option value="true">Có</option><option value="false">Không</option></select></label>
        <details className="sm:col-span-2"><summary className="cursor-pointer font-semibold text-slate-700">Nâng cao (tùy chọn theo hồ sơ nguồn)</summary><div className="grid gap-3 mt-3">{textFields.filter(([key])=>['sourcedToleranceMeters','toleranceSource'].includes(key)).map(([key,label])=><label key={key}>{label}<input aria-label={label} value={form[key]||''} onChange={e=>change(key,e.target.value)} className="rg-field mt-1 w-full"/></label>)}{jsonFields.map(([key,label])=><label key={key} className="min-w-0 text-slate-600">{label}<textarea aria-label={label} value={form[key]||''} onChange={e=>change(key,e.target.value)} rows={3} className="rg-field mt-1 w-full font-mono"/></label>)}</div></details>
      </fieldset>
      <footer className="border-t pt-4 flex justify-end gap-3"><button type="button" disabled={busy} onClick={onClose} className="rg-btn">Hủy bỏ</button><button type="submit" disabled={busy||!!journalError} className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white font-semibold disabled:opacity-50">{busy?'Đang tạo/đọc lại…':held?.received?'Đọc lại danh sách và chi tiết':held?'Thử lại cùng yêu cầu':'Tạo hồ sơ CRS'}</button></footer>
    </form>
  </section></div>
}
