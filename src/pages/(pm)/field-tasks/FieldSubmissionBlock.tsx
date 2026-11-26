import React,{useEffect,useState} from 'react'
import {fieldTaskReadService,fieldReadError} from '../../../api/services/fieldTaskReadService'
import {measurementTypeLabel,measurementEnumLabel} from '../../../api/services/fieldMeasurementTypes'
import type {FieldRead} from './FieldTaskReadDetails'

const isKnown=(m:{state?:string|null;value?:number|null})=>String(m.state||'').toUpperCase()==='KNOWN'&&m.value!=null
export const gpsText=(m:{longitude?:number|null;latitude?:number|null})=>Number.isFinite(m.latitude)&&Number.isFinite(m.longitude)?`${m.latitude!.toFixed(6)}, ${m.longitude!.toFixed(6)}`:'Chưa có dữ liệu'
const isReady=(r?:string|null)=>String(r||'').toUpperCase()==='READY'

// Ảnh bằng chứng của BẢN NỘP MỚI NHẤT (GET evidence/{fileId} + content, chỉ hiện khi VERIFIED và checksum khớp).
export function FieldSubmissionPhotos({projectId,taskId,read,onPhoto}:{projectId:string;taskId:string;read:FieldRead|null;onPhoto?:(p:{url:string;fileId:string;checksum:string;purpose:string;capturedAt:string|null}|null)=>void}){
 const files=(read?.submission?.evidence||[]).filter(e=>!!e.fileId)
 const [choice,setChoice]=useState('')
 const [photo,setPhoto]=useState<{id:string;url:string;error:string;checksum:string}|null>(null)
 const key=`${projectId}:${taskId}:${read?.submission?.id||''}`
 useEffect(()=>{setChoice(files[0]?.fileId||'')},[key])
 useEffect(()=>{
  const c=new AbortController();let url='';setPhoto(null)
  const f=files.find(e=>e.fileId===choice)
  if(f)fieldTaskReadService.evidenceImage(projectId,taskId,f.fileId!,f.checksumSha256,c.signal).then(r=>{if(c.signal.aborted)return;url=URL.createObjectURL(r.blob);setPhoto({id:f.fileId!,url,error:'',checksum:r.checksum})}).catch(e=>{if(!c.signal.aborted)setPhoto({id:f.fileId!,url:'',error:fieldReadError(e),checksum:''})})
  return()=>{c.abort();if(url)URL.revokeObjectURL(url)}
 },[key,choice])
 useEffect(()=>{const f=files.find(e=>e.fileId===choice);onPhoto?.(photo?.url&&f?{url:photo.url,fileId:photo.id,checksum:photo.checksum,purpose:f.purpose||'',capturedAt:f.capturedAt||null}:null)},[photo,choice]) // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>()=>onPhoto?.(null),[]) // eslint-disable-line react-hooks/exhaustive-deps
 if(!read)return <div role="status" className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 text-xs p-4 text-center">Đang đọc bản nộp mới nhất từ máy chủ…</div>
 if(!read.submission)return <div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center"><span className="font-medium text-slate-600">Chưa có bản nộp từ Repair Crew</span><span className="text-[11px] text-slate-400 mt-0.5">Máy chủ chưa ghi nhận bản nộp nào cho nhiệm vụ này</span></div>
 if(!files.length)return <div className="w-full h-44 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 flex flex-col items-center justify-center text-amber-900 text-xs p-4 text-center"><span className="font-medium">Bản nộp bản sửa {read.submission.revision} chưa có ảnh bằng chứng</span><span className="text-[11px] mt-0.5">Máy chủ không trả fileId ảnh trong bản nộp này</span></div>
 return <div className="space-y-2" data-testid="field-submission-photos">
  {!photo&&<div role="status" className="w-full h-44 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 text-xs">Đang đọc ảnh bằng chứng…</div>}
  {photo?.error&&<p role="alert" className="text-rose-700 text-xs break-all">{photo.error}</p>}
  {photo?.url&&<figure className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900"><img src={photo.url} alt="Ảnh bằng chứng FIELD của bản nộp mới nhất" className="w-full h-56 object-contain bg-slate-900" /><figcaption className="p-2 text-[10px] text-slate-300 font-mono break-all">Bản sửa {read.submission.revision} · SHA-256: {photo.checksum}</figcaption></figure>}
  {files.length>1&&<div className="flex flex-wrap gap-1.5">{files.map((e,i)=><button type="button" key={e.fileId} onClick={()=>setChoice(e.fileId!)} className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${choice===e.fileId?'bg-emerald-600 text-white':'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Ảnh {i+1}</button>)}</div>}
 </div>
}

// Số đo và mức hoàn thành của bản nộp mới nhất. Phân biệt rõ: đã nộp / có giá trị đo / READY / FIELD hoàn tất / Defect.
export function FieldSubmissionSummary({read,defectStatus}:{read:FieldRead|null;defectStatus:string}){
 if(!read)return <p role="status" className="text-slate-500">Đang đọc số đo từ máy chủ…</p>
 const sub=read.submission,ms=sub?.measurements||[],known=ms.filter(isKnown)
 const taskStatus=String(read.task.status||'').toUpperCase(),fieldDone=['COMPLETED','REVIEWED'].includes(taskStatus)
 const row=(label:string,value:React.ReactNode,tone='text-slate-800')=><div className="flex items-start justify-between gap-3"><span className="text-slate-500 text-[11px] shrink-0">{label}</span><span className={`text-right font-medium text-[11px] ${tone}`}>{value}</span></div>
 return <div className="space-y-2" data-testid="field-submission-summary">
  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
   <span className="text-[11px] font-semibold text-slate-600 block">Tiến độ dữ liệu của nhiệm vụ</span>
   {row('Loại đo yêu cầu',measurementTypeLabel(read.task.requiredMeasurementType))}
   {row('Bản nộp từ Crew',sub?`Đã nộp (bản sửa ${sub.revision})`:'Chưa có bản nộp',sub?'text-slate-800':'text-slate-400')}
   {row('Giá trị đo',!sub?'—':ms.length===0?'Bản nộp không có số đo nào':known.length?`${known.length}/${ms.length} số đo có giá trị (KNOWN)`:'Chưa có giá trị đo (value: null / UNKNOWN)',known.length?'text-emerald-700':'text-amber-800')}
   {row('Đủ điều kiện (readiness)',!sub?'—':sub.readiness||'Máy chủ chưa trả readiness',isReady(sub?.readiness)?'text-emerald-700':'text-amber-800')}
   {row('FIELD hoàn tất (review)',fieldDone?'Đã hoàn tất':'Chưa hoàn tất',fieldDone?'text-emerald-700':'text-slate-600')}
   {row('Trạng thái Defect (riêng)',defectStatus)}
   <p className="text-[10px] text-slate-400">Review FIELD không tự chuyển Defect sang VERIFIED; hai trạng thái này độc lập.</p>
  </div>
  <div className="p-3 bg-white rounded-lg border border-slate-200">
   <span className="text-[11px] font-medium text-slate-500 block mb-1">Số đo của lần nộp mới nhất</span>
   {!sub?<span className="text-slate-400 italic text-xs block">Chưa có bản nộp nên chưa có số đo</span>:ms.length===0?<span className="text-slate-400 italic text-xs block">Bản nộp không chứa số đo</span>:
    <table className="w-full text-left text-[11px]"><thead><tr className="text-slate-500"><th className="py-1 pr-2 font-medium">Loại đo</th><th className="py-1 pr-2 font-medium">Giá trị</th><th className="py-1 pr-2 font-medium">Đơn vị</th><th className="py-1 pr-2 font-medium">Tọa độ GPS</th><th className="py-1 font-medium">Trạng thái</th></tr></thead>
    <tbody>{ms.map((m,i)=><tr key={m.sampleId||i} className="border-t border-slate-100 align-top"><td className="py-1 pr-2">{measurementEnumLabel(m.type)}</td><td className="py-1 pr-2 font-mono">{m.value==null?<span className="text-amber-800">Chưa có giá trị</span>:m.value}</td><td className="py-1 pr-2">{m.value==null?'—':m.unit||'Chưa có đơn vị'}</td><td className="py-1 pr-2 font-mono" data-testid="measurement-gps">{gpsText(m)}</td><td className="py-1">{String(m.state||'').toUpperCase()==='KNOWN'?'KNOWN':String(m.state||'Chưa có trạng thái').toUpperCase()}{m.unknownReason?` · ${m.unknownReason}`:''}{m.notes?` · ${m.notes}`:''}</td></tr>)}</tbody></table>}
   {sub&&<div className={`mt-2 p-2 rounded-lg border text-[11px] ${isReady(sub.readiness)?'bg-emerald-50 border-emerald-200 text-emerald-900':'bg-amber-50 border-amber-200 text-amber-900'}`}>
    <span className="font-bold">{sub.readiness||'Chưa có readiness'}</span>
    {sub.missingReasons&&sub.missingReasons.length>0?<ul className="list-disc pl-4 mt-0.5">{sub.missingReasons.map(r=><li key={r}>{r}</li>)}</ul>:<span> · Máy chủ không ghi lý do thiếu</span>}
   </div>}
  </div>
 </div>
}
