import {businessReason} from '../../../utils/businessDisplay'
import {businessText,businessError} from '../../../utils/businessDisplay'
import React, { useState, useEffect } from 'react'
import { fastTrackService } from '../../../api/services/fastTrackService'
import { useAuthStore } from '../../../store/authStore'
import { exportError } from '../../../api/services/projectExportService'
import { fastTrackStorage } from '../../../api/services/fastTrackJournal'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem } from './types'

export interface DefectDetailModalProps {
  detailDefect: DefectItem | null
  onClose: () => void
}

function formatDefectTypeVi(code?: string): string {
  if (!code) return 'Chưa phân loại'
  const c = code.toUpperCase()
  if (c.includes('POTHOLE')) return 'Ổ gà'
  if (c.includes('CRACK')) return 'Nứt mặt đường'
  if (c.includes('RUT')) return 'Vệt lún bánh xe'
  if (c.includes('RAVEL')) return 'Bong bật cốt liệu'
  return code
}

function formatSeverityVi(sev?: string): string {
  switch (sev?.toUpperCase()) {
    case 'LOW':
      return 'Thấp (Nhẹ)'
    case 'MEDIUM':
      return 'Trung bình (Vừa)'
    case 'HIGH':
      return 'Cao (Nặng)'
    case 'CRITICAL':
      return 'Khẩn cấp (Rất nặng)'
    default:
      return sev || 'Chưa xác định'
  }
}

function formatStatusVi(st?: string): string {
  switch (st?.toUpperCase()) {
    case 'READYTOASSIGN': return 'Sẵn sàng giao việc có điều kiện'
    case 'ASSIGNED': return 'Đã giao Crew'
    case 'INPROGRESS': return 'Đang thi công'
    case 'SUBMITTED': return 'Chờ PM rà soát'
    case 'REVIEWED': return 'Chờ xác nhận cuối'
    case 'CONFIRMED': return 'Đã xác nhận'
    case 'CANCELLED': return 'Đã hủy'
    case 'OPEN':
      return 'Chờ xử lý'
    case 'IN_PROGRESS':
      return 'Đang thi công'
    case 'RESOLVED':
    case 'COMPLETED':
      return 'Đã hoàn thành'
    case 'CLOSED':
      return 'Đã đóng hồ sơ'
    default:
      return st || 'Đang theo dõi'
  }
}

export const DefectDetailModal: React.FC<DefectDetailModalProps> = ({
  detailDefect,
  onClose
}) => {
  const isPM=useAuthStore(s=>s.user?.role==='PROJECT_MANAGER')
  const [form,setForm]=useState<{fromMeters:string;toMeters:string;offsetFromMeters:string;offsetToMeters:string;segmentSetId:string;layoutRevisionId:string;slabId:string;repairPlan:string;checklistVersion:string;reason:string}>(()=>detailDefect && JSON.parse(localStorage.getItem(fastTrackStorage(detailDefect.projectId,`prepare-form:${detailDefect.defectId || detailDefect.id}`)) || 'null') || {fromMeters:'',toMeters:'',offsetFromMeters:'',offsetToMeters:'',segmentSetId:'',layoutRevisionId:'',slabId:'',repairPlan:'',checklistVersion:'',reason:''})
  useEffect(()=>{if(detailDefect && !detailDefect.itemId && isPM)localStorage.setItem(fastTrackStorage(detailDefect.projectId,`prepare-form:${detailDefect.defectId || detailDefect.id}`),JSON.stringify(form))},[detailDefect?.id,form,isPM])
  const [prepareError,setPrepareError]=useState(''),[preparing,setPreparing]=useState(false)
  const [preparationSources,setPreparationSources]=useState<Awaited<ReturnType<typeof fastTrackService.preparationSources>> | null>(null)
  useEffect(()=>{let active=true;if(!detailDefect || detailDefect.itemId || !isPM)return;setPreparationSources(null);fastTrackService.preparationSources(detailDefect).then(r=>{if(active)setPreparationSources(r)}).catch(e=>{if(active)setPrepareError(exportError(e))});return()=>{active=false}},[detailDefect?.id,isPM])
  const [sourceInfo,setSourceInfo]=useState(''),[reading,setReading]=useState(false),[readRevision,setReadRevision]=useState(0)
  useEffect(()=>{let active=true;if(!detailDefect?.itemId || !detailDefect.packageId)return;setReading(true);setSourceInfo('');fastTrackService.readItemSources(detailDefect.projectId,detailDefect.packageId,detailDefect.itemId).then(r=>{if(active)setSourceInfo(`${r.checklistVersion ? `Checklist: ${r.checklistVersion}. `:''}${r.checklistVersion?'Đã đọc checklist của phương án.':'Hồ sơ chưa cung cấp checklist phương án; chưa thể chọn chính sách giao việc.'} Có ${r.history.decisions.length} quyết định, ${r.history.attempts.length} lượt thi công.`)}).catch(e=>{if(active)setSourceInfo(exportError(e))}).finally(()=>{if(active)setReading(false)});return()=>{active=false}},[detailDefect?.id,readRevision])
  const prepare=async()=>{
    if(!detailDefect || preparing)return
    setPreparing(true);setPrepareError('')
    try{if(!form.fromMeters || !form.toMeters || !form.offsetFromMeters || !form.offsetToMeters)throw new Error('Nhập rõ phạm vi; không tự lấy kích thước từ hình ảnh.')
      await fastTrackService.prepareItem(detailDefect,{...form,fromMeters:Number(form.fromMeters),toMeters:Number(form.toMeters),offsetFromMeters:Number(form.offsetFromMeters),offsetToMeters:Number(form.offsetToMeters),segmentSetId:form.segmentSetId || null,layoutRevisionId:form.layoutRevisionId || null,slabId:form.slabId || null});window.dispatchEvent(new Event('fasttrack-refresh'));onClose()
    }catch(e){setPrepareError(exportError(e))}finally{setPreparing(false)}
  }
  if (!detailDefect) return null

  const isEligible = detailDefect.isFastTrackEligible === true
  const missingReasons = detailDefect.violationReason ? [detailDefect.violationReason] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-brand-dark font-mono">{detailDefect.code}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isEligible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isEligible ? 'Đạt chuẩn xử lý nhanh' : 'Chưa đủ căn cứ thi công'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Loại khiếm khuyết: <strong className="text-slate-800">{formatDefectTypeVi(detailDefect.defectTypeCode)}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Mức độ nghiêm trọng:</span>
              <div className="font-bold text-sm text-brand-dark">
                {formatSeverityVi(detailDefect.severity)}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Trạng thái hiện tại:</span>
              <div className="font-bold text-sm text-brand-dark">
                {formatStatusVi(detailDefect.status)}
              </div>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">

            <div>Đội thi công phụ trách: <strong>{businessText(detailDefect.assignedCrew,'Chưa có tên đội phụ trách')}</strong></div>

          </div>

          {!isEligible && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <Icon name="report" size={14} className="text-rose-600 shrink-0" />
                <span>Lý do không đủ điều kiện xử lý nhanh:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5 font-medium">
                {missingReasons.map((r, i) => (
                  <li key={i}>{businessReason(r)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {detailDefect.itemId && <div className="space-y-2 border-t pt-3 text-xs"><p role="status">{reading?'Đang đọc chi tiết và lịch sử phương án…':sourceInfo}</p><button type="button" disabled={reading} onClick={()=>setReadRevision(n=>n+1)} className="border rounded-lg p-2">Đọc lại hồ sơ phương án</button></div>}
        {isPM && !detailDefect.itemId && <div className="space-y-3 border-t pt-4"><h4 className="font-bold text-sm">Lập nghĩa vụ và hạng mục Fast Track</h4><p className="text-xs text-slate-500">Tuyến lấy theo hồ sơ hiện hành của khiếm khuyết. Phạm vi dưới đây phải có căn cứ thực địa; không suy từ AI.</p><div className="grid grid-cols-2 gap-2">{(Object.keys(form) as Array<keyof typeof form>).map((key,i)=><label key={key} className="text-xs">{['Từ lý trình (m)','Đến lý trình (m)','Độ lệch từ (m)','Độ lệch đến (m)','Bộ phân đoạn đã công bố (nếu có)','Bố trí mặt đường (nếu có)','Tấm (nếu có)','Phương án kỹ thuật','Checklist áp dụng','Căn cứ lập nghĩa vụ'][i]}{['segmentSetId','layoutRevisionId','slabId'].includes(key) ? <select aria-label={key==='segmentSetId'?'Phân đoạn phương án':key==='layoutRevisionId'?'Bố trí phương án':'Tấm phương án'} value={form[key]} onChange={e=>{setPrepareError('');setForm(previous=>({...previous,[key]:e.target.value,...(key==='segmentSetId'?{layoutRevisionId:'',slabId:''}:key==='layoutRevisionId'?{slabId:''}:{})}))}} className="block border rounded-lg p-2 w-full mt-1"><option value="">Không chọn — phạm vi theo lý trình</option>{key==='segmentSetId' ? preparationSources?.sets.map((r,i)=><option key={r.id} value={r.id}>Bộ phân đoạn đã công bố {i+1}</option>):[...new Set(preparationSources?.tasks.filter(r=>r.pins.segmentSetId===(form.segmentSetId || null) && (key!=='slabId' || r.pins.layoutRevisionId===form.layoutRevisionId)).map(r=>key==='layoutRevisionId'?r.pins.layoutRevisionId:r.pins.slabId).filter(Boolean))].map((id,i)=><option key={id} value={id!}>{key==='layoutRevisionId'?`Bố trí theo hồ sơ ${i+1}`:`Tấm ${id}`}</option>)}</select>:<input aria-label={key} value={form[key]} maxLength={key==='checklistVersion'?200:2000} type={['fromMeters','toMeters','offsetFromMeters','offsetToMeters'].includes(key)?'number':'text'} step="any" onChange={e=>{setPrepareError('');setForm(previous=>({...previous,[key]:e.target.value}))}} className="block border rounded-lg p-2 w-full mt-1"/>}</label>)}</div>{prepareError && <p role="alert" className="text-xs text-red-800">{businessError(prepareError)}</p>}<button disabled={preparing} onClick={prepare} className="border rounded-lg p-2 text-xs font-bold text-[#8C6D1F]">{preparing?'Đang đối chiếu…':'Lập gói và đề xuất hạng mục'}</button></div>}
        <div className="pt-2 flex justify-end border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
