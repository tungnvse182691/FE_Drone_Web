import React, { useState } from 'react'
import { devFileBearerEnabled } from '../../../api/devFileBearer'
import { coverageDocumentService } from '../../../api/services/coverageDocumentService'
import { exportError } from '../../../api/services/projectExportService'
export function CoverageDocumentUpload({projectId,onUploaded}:{projectId:string;onUploaded?:(file:{id:string})=>void}) {
  const [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
  if(!devFileBearerEnabled())return null
  const upload=async()=>{if(!file || busy)return;setBusy(true);setMessage('');try{const result=await coverageDocumentService.upload(projectId,file);setMessage('Đã lưu tệp. Đọc lại hồ sơ để chọn làm căn cứ.');onUploaded?.(result);window.dispatchEvent(new Event('fasttrack-refresh'))}catch(e){setMessage(exportError(e))}finally{setBusy(false)}}
  return <div className="space-y-2 text-xs"><label className="block font-bold text-slate-700">Tệp căn cứ bảo trì<input aria-label="Tệp căn cứ độ phủ" type="file" accept="application/pdf,image/jpeg,image/png" disabled={busy} onChange={e=>{setFile(e.target.files?.[0] || null);setMessage('')}} className="block w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"/></label><p className="text-slate-500">Chọn PDF hoặc ảnh của hồ sơ. Nếu tải bị gián đoạn, chọn lại cùng tệp để tiếp tục.</p><button type="button" disabled={!file || busy} onClick={upload} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50">{busy?'Đang đối chiếu tệp…':coverageDocumentService.pending(projectId)?'Tiếp tục / Đối chiếu cùng tệp':'Tải tệp căn cứ'}</button>{message && <p role="status" className="text-slate-600">{message}</p>}</div>
}
