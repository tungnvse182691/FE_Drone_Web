import { fastTrackTypeName, fastTrackCrewLabel } from './defectPresentation'
import { useDefectTypeNames } from '../../../api/services/defectTypeNames'
import React, { useState, useEffect } from 'react'
import { fastTrackService, type RepairPolicyView } from '../../../api/services/fastTrackService'
import { useAuthStore } from '../../../store/authStore'
import { exportError } from '../../../api/services/projectExportService'
import { fastTrackStorage } from '../../../api/services/fastTrackJournal'
import { Icon } from '../../../components/ui/Icon'
import { defectNotice, defectSeverity, defectStatus } from './defectPresentation'
import { DefectItem } from './types'
import { ProposalSourcePanel } from '../repair-proposals/ProposalSourcePanel'

export interface DefectDetailModalProps {
  detailDefect: DefectItem | null
  onClose: () => void
  /** Phản hồi tại màn hình sau khi lập gói (toast của trang). */
  onPrepared?: (message: string) => void
  /** Đường tới cấu hình chính sách khi chưa có policy phù hợp. */
  onOpenPolicy?: () => void
}

export const DefectDetailModal: React.FC<DefectDetailModalProps> = ({
  detailDefect,
  onClose,
  onPrepared,
  onOpenPolicy
}) => {
  const isPM=useAuthStore(s=>s.user?.role==='PROJECT_MANAGER')
  const { names: typeNames } = useDefectTypeNames()
  const [form,setForm]=useState<{fromMeters:string;toMeters:string;offsetFromMeters:string;offsetToMeters:string;segmentSetId:string;layoutRevisionId:string;slabId:string;repairPlan:string;checklistVersion:string;reason:string}>(()=>detailDefect && JSON.parse(localStorage.getItem(fastTrackStorage(detailDefect.projectId,`prepare-form:${detailDefect.defectId || detailDefect.id}`)) || 'null') || {fromMeters:'',toMeters:'',offsetFromMeters:'',offsetToMeters:'',segmentSetId:'',layoutRevisionId:'',slabId:'',repairPlan:'',checklistVersion:'',reason:''})
  useEffect(()=>{if(detailDefect && !detailDefect.itemId && isPM)localStorage.setItem(fastTrackStorage(detailDefect.projectId,`prepare-form:${detailDefect.defectId || detailDefect.id}`),JSON.stringify(form))},[detailDefect?.id,form,isPM])
  const [prepareError,setPrepareError]=useState(''),[preparing,setPreparing]=useState(false)
  // Checklist lấy từ policy đã ban hành (PUBLISHED) đúng dự án + loại khiếm khuyết; không nhập tay, không tạo danh mục giả.
  const [policies,setPolicies]=useState<{status:'idle'|'loading'|'error'|'ready';rows:RepairPolicyView[];error:string}>({status:'idle',rows:[],error:''})
  useEffect(()=>{let active=true;if(!detailDefect || detailDefect.itemId || !isPM){setPolicies({status:'idle',rows:[],error:''});return};setPolicies({status:'loading',rows:[],error:''});let warn='';fastTrackService.getPolicies(detailDefect.projectId,m=>{warn=m}).then(rows=>{if(active)setPolicies({status:'ready',rows,error:warn})}).catch(e=>{if(active)setPolicies({status:'error',rows:[],error:exportError(e)})});return()=>{active=false}},[detailDefect?.id,detailDefect?.projectId,isPM])
  const matchingPolicies=policies.rows.filter(r=>r.state==='PUBLISHED' && r.revision!=null && !!r.checklistVersion && r.defectTypeCode===detailDefect?.defectTypeCode)
  const chosenPolicy=matchingPolicies.find(r=>r.checklistVersion===form.checklistVersion)
  const [preparationSources,setPreparationSources]=useState<Awaited<ReturnType<typeof fastTrackService.preparationSources>> | null>(null)
  useEffect(()=>{let active=true;if(!detailDefect || detailDefect.itemId || !isPM)return;setPreparationSources(null);fastTrackService.preparationSources(detailDefect).then(r=>{if(active)setPreparationSources(r)}).catch(e=>{if(active)setPrepareError(exportError(e))});return()=>{active=false}},[detailDefect?.id,isPM])
  const [sourceInfo,setSourceInfo]=useState(''),[reading,setReading]=useState(false),[readRevision,setReadRevision]=useState(0)
  useEffect(()=>{let active=true;if(!detailDefect?.itemId || !detailDefect.packageId)return;setReading(true);setSourceInfo('');fastTrackService.readItemSources(detailDefect.projectId,detailDefect.packageId,detailDefect.itemId).then(r=>{if(active)setSourceInfo(`${r.checklistVersion ? `Checklist: ${r.checklistVersion}. `:''}${r.checklistSource} Đã đọc ${r.history.decisions.length} quyết định, ${r.history.attempts.length} lượt thi công.`)}).catch(e=>{if(active)setSourceInfo(exportError(e))}).finally(()=>{if(active)setReading(false)});return()=>{active=false}},[detailDefect?.id,readRevision])
  const prepare=async()=>{
    if(!detailDefect || preparing)return
    setPreparing(true);setPrepareError('')
    try{if(!chosenPolicy)throw new Error('Chọn checklist từ chính sách đã ban hành của đúng loại khiếm khuyết; chưa có thì cấu hình chính sách trước (dữ liệu form được giữ).')
      if(!form.fromMeters || !form.toMeters || !form.offsetFromMeters || !form.offsetToMeters)throw new Error('Nhập rõ phạm vi; không tự lấy kích thước từ hình ảnh.')
      await fastTrackService.prepareItem(detailDefect,{...form,fromMeters:Number(form.fromMeters),toMeters:Number(form.toMeters),offsetFromMeters:Number(form.offsetFromMeters),offsetToMeters:Number(form.offsetToMeters),segmentSetId:form.segmentSetId || null,layoutRevisionId:form.layoutRevisionId || null,slabId:form.slabId || null});window.dispatchEvent(new Event('fasttrack-refresh'));onPrepared?.(`Đã lập gói và đề xuất hạng mục Fast Track cho ${detailDefect.code} (policy lần ban hành ${chosenPolicy.revision}, checklist ${chosenPolicy.checklistVersion}). Hạng mục chờ Giám sát duyệt.`);onClose()
    }catch(e){setPrepareError(exportError(e))}finally{setPreparing(false)}
  }
  if (!detailDefect) return null

  const isEligible = detailDefect.isFastTrackEligible === true
  const missingReasons = detailDefect.violationReason ? detailDefect.violationReason.split(';').filter((r) => r.trim()).map(r => defectNotice(r)) : []

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
              Loại khiếm khuyết: <strong className="text-slate-800">{detailDefect.defectTypeCode ? fastTrackTypeName(detailDefect.defectTypeCode, typeNames) : 'Chưa có thông tin'}</strong>
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
                {defectSeverity(detailDefect.severity)}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Trạng thái hiện tại:</span>
              <div className="font-bold text-sm text-brand-dark">
                {defectStatus(detailDefect.status)}
              </div>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>Đội thi công phụ trách: <strong>{fastTrackCrewLabel(detailDefect)}</strong></div>

          </div>

          <details open><summary className="text-xs font-semibold cursor-pointer">Nguồn khiếm khuyết và đo hiện trường</summary><ProposalSourcePanel key={`${detailDefect.originProjectId || detailDefect.projectId}:${detailDefect.defectId || detailDefect.id}`} projectId={detailDefect.originProjectId || detailDefect.projectId} defectId={detailDefect.defectId || detailDefect.id} defectCode={detailDefect.code} hidePmRange fastTrackUi /></details>

          {!isEligible && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <Icon name="report" size={14} className="text-rose-600 shrink-0" />
                <span>Lý do không đủ điều kiện xử lý nhanh:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5 font-medium">
                {missingReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

            </div>
          )}
        </div>

        {detailDefect.itemId && <div className="space-y-2 border-t pt-3 text-xs"><p role="status">{reading?'Đang đọc hồ sơ phương án…':sourceInfo ? (sourceInfo.startsWith('Checklist:') || sourceInfo.includes('Đã đọc') ? (sourceInfo.includes('DEMO') ? 'Đã tải hồ sơ phương án DEMO.' : 'Đã tải hồ sơ phương án.') : defectNotice(sourceInfo, 'read')) : 'Chưa có thông tin'}</p><button type="button" disabled={reading} onClick={()=>setReadRevision(n=>n+1)} className="rg-btn">Đọc lại hồ sơ phương án</button></div>}
        {isPM && !detailDefect.itemId && <div className="space-y-3 border-t pt-4"><h4 className="font-bold text-sm">Lập nghĩa vụ và hạng mục Fast Track</h4><p className="text-xs text-slate-500">Tuyến lấy theo hồ sơ hiện hành của khiếm khuyết. Phạm vi dưới đây phải có căn cứ thực địa; không suy từ AI.</p><div className="grid grid-cols-2 gap-2">{(Object.keys(form) as Array<keyof typeof form>).map((key,i)=><label key={key} className="text-xs">{['Từ lý trình (m)','Đến lý trình (m)','Độ lệch từ (m)','Độ lệch đến (m)','Bộ phân đoạn đã công bố (nếu có)','Bố trí mặt đường (nếu có)','Tấm (nếu có)','Phương án kỹ thuật','Checklist áp dụng','Căn cứ lập nghĩa vụ'][i]}{['segmentSetId','layoutRevisionId','slabId'].includes(key) ? <select aria-label={key==='segmentSetId'?'Phân đoạn phương án':key==='layoutRevisionId'?'Bố trí phương án':'Tấm phương án'} value={form[key]} onChange={e=>{setPrepareError('');setForm(previous=>({...previous,[key]:e.target.value,...(key==='segmentSetId'?{layoutRevisionId:'',slabId:''}:key==='layoutRevisionId'?{slabId:''}:{})}))}} className="rg-field block w-full mt-1"><option value="">Không chọn — phạm vi theo lý trình</option>{key==='segmentSetId' ? preparationSources?.sets.map((r,i)=><option key={r.id} value={r.id}>Bộ phân đoạn đã công bố {i+1}</option>):[...new Set(preparationSources?.tasks.filter(r=>r.pins.segmentSetId===(form.segmentSetId || null) && (key!=='slabId' || r.pins.layoutRevisionId===form.layoutRevisionId)).map(r=>key==='layoutRevisionId'?r.pins.layoutRevisionId:r.pins.slabId).filter(Boolean))].map((id,i)=><option key={id} value={id!}>{key==='layoutRevisionId'?`Bố trí theo hồ sơ ${i+1}`:`Tấm ${id}`}</option>)}</select>:key==='checklistVersion'?<><select aria-label="Checklist áp dụng" value={chosenPolicy?.id||''} onChange={e=>{setPrepareError('');const row=matchingPolicies.find(r=>r.id===e.target.value);setForm(previous=>({...previous,checklistVersion:row?.checklistVersion||''}))}} disabled={policies.status!=='ready'||!matchingPolicies.length} className="rg-field block w-full mt-1"><option value="">{policies.status==='loading'?'Đang đọc chính sách…':matchingPolicies.length?'Chọn checklist từ chính sách':'Chưa có chính sách phù hợp'}</option>{matchingPolicies.map(r=><option key={r.id} value={r.id}>{`Chính sách lần ban hành ${r.revision}`}{r.checklistVersion.includes('DEMO') ? ' · DEMO' : ''}</option>)}</select>{chosenPolicy&&<span className="block text-[10px] text-slate-500 mt-1">Chính sách · lần ban hành {chosenPolicy.revision} · loại {fastTrackTypeName(chosenPolicy.defectTypeCode,typeNames)}{chosenPolicy.checklistVersion.includes('DEMO') ? ' · DEMO' : ''}</span>}</>:<input aria-label={key} value={form[key]} maxLength={2000} type={['fromMeters','toMeters','offsetFromMeters','offsetToMeters'].includes(key)?'number':'text'} step="any" onChange={e=>{setPrepareError('');setForm(previous=>({...previous,[key]:e.target.value}))}} className="rg-field block w-full mt-1"/>}</label>)}</div>{policies.status==='error' && <p role="alert" className="text-xs text-red-800">Không đọc được chính sách đã ban hành: {defectNotice(policies.error, 'read')}</p>}{policies.status==='ready' && !matchingPolicies.length && <div role="alert" className="text-xs p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">Chưa có chính sách đã ban hành cho loại {fastTrackTypeName(detailDefect.defectTypeCode,typeNames)} của dự án này nên chưa chọn được checklist. Dữ liệu form đang nhập được giữ lại.{onOpenPolicy && <button type="button" onClick={onOpenPolicy} className="block mt-1 underline font-semibold">Mở cấu hình chính sách</button>}</div>}{prepareError && <p role="alert" className="text-xs text-red-800">{defectNotice(prepareError, 'read')}</p>}<button disabled={preparing || !chosenPolicy} onClick={prepare} className="rg-btn text-xs font-bold text-[#8C6D1F]">{preparing?'Đang đối chiếu…':'Lập gói và đề xuất hạng mục'}</button></div>}
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
