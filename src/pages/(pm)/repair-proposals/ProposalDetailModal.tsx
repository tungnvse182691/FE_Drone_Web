import React,{useState,useEffect,useRef} from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { ProposalWorkPackage } from './types'
import {repairWorkflowService,type RepairItem} from '../../../api/services/repairWorkflowService'
import {useAuthStore} from '../../../store/authStore'
import {useNavigate} from 'react-router-dom'
import {exportError} from '../../../api/services/projectExportService'
import {RepairItemActions} from './RepairItemActions'
import {SourceDefectPanel} from './SourceDefectPanel'
import {PlanningPanel} from './PlanningPanel'
import {NotificationSupervisorPanel} from './NotificationSupervisorPanel'
import {RepairSafetyPanel} from './RepairSafetyPanel'

export interface ProposalDetailModalProps {
  selectedPackageForDetail: ProposalWorkPackage | null
  setSelectedPackageForDetail: React.Dispatch<React.SetStateAction<ProposalWorkPackage | null>>
  isSupervisor: boolean
  isPM: boolean
  handleQuickApprove: (id: string, code: string) => void
  handleSubmitDraftPackage: (id: string, code: string) => void
}

type DetailRead = { item?: RepairItem; error?: string }

const STATE_BADGE = (state: string) =>
  state === 'Confirmed' || state === 'ReadyToAssign' ? 'bg-emerald-100 text-emerald-800'
  : state === 'AwaitingApproval' ? 'bg-amber-100 text-amber-800'
  : ['Assigned', 'InProgress', 'Submitted', 'Reviewed'].includes(state) ? 'bg-blue-100 text-blue-800'
  : 'bg-slate-200 text-slate-700'

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  selectedPackageForDetail,
  setSelectedPackageForDetail,
  isSupervisor,
  isPM,
}) => {
  const auth=useAuthStore(),navigate=useNavigate(),scope=`${auth.authEpoch}:${selectedPackageForDetail?.route_id}:${selectedPackageForDetail?.id}`,latest=useRef(scope);latest.current=scope
  const [read,setRead]=useState<{scope:string;items:RepairItem[]}|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[itemId,setItemId]=useState(''),[reason,setReason]=useState(''),[busy,setBusy]=useState(false),[reload,setReload]=useState(0)
  const [details,setDetails]=useState<{scope:string;rows:Record<string,DetailRead>}>({scope:'',rows:{}})
  useEffect(()=>{const c=new AbortController();setRead(null);setError('');setMessage('');setItemId('');setReason('');if(selectedPackageForDetail)repairWorkflowService.items(selectedPackageForDetail.route_id,selectedPackageForDetail.id,c.signal).then(items=>{if(!c.signal.aborted)setRead({scope,items})}).catch(e=>{if(!c.signal.aborted)setError(exportError(e))});return()=>c.abort()},[scope,reload])
  const items=read?.scope===scope?read.items:[]
  // GET chi tiết từng hạng mục: nguồn chuẩn của phương án (repairPlan) và checklist (checklistVersion). Lỗi tải hiển thị riêng từng hạng mục.
  useEffect(()=>{
    const c=new AbortController()
    if(!selectedPackageForDetail||!read||read.scope!==scope){setDetails({scope,rows:{}});return}
    setDetails({scope,rows:{}})
    for(const it of read.items)repairWorkflowService.detail(selectedPackageForDetail.route_id,selectedPackageForDetail.id,it.id,c.signal)
      .then(d=>{if(!c.signal.aborted)setDetails(o=>o.scope===scope?{scope,rows:{...o.rows,[it.id]:{item:d}}}:o)})
      .catch(e=>{if(!c.signal.aborted)setDetails(o=>o.scope===scope?{scope,rows:{...o.rows,[it.id]:{error:exportError(e)}}}:o)})
    return()=>c.abort()
  },[read])
  const detailOf=(id:string):DetailRead|undefined=>details.scope===scope?details.rows[id]:undefined
  let held:ReturnType<typeof repairWorkflowService.pending>=null,journalError=''
  try{if(isSupervisor&&selectedPackageForDetail&&itemId)held=repairWorkflowService.pending(selectedPackageForDetail.route_id,selectedPackageForDetail.id,itemId,'approve')}catch(e){journalError=exportError(e)}
  const approve=async()=>{if(!selectedPackageForDetail||!itemId||!isSupervisor||busy||journalError)return;const start=scope;setBusy(true);setError('');try{const r=await repairWorkflowService.decide(selectedPackageForDetail.route_id,selectedPackageForDetail.id,itemId,'approve',held?.body.reason||reason);if(latest.current!==start)return;setMessage(`Đã GET đối chiếu hạng mục: ${r.state}.`);const fresh=await repairWorkflowService.items(selectedPackageForDetail.route_id,selectedPackageForDetail.id);if(latest.current!==start)return;setRead({scope,items:fresh});window.dispatchEvent(new Event('repair-workflow-refresh'))}catch(e){if(latest.current===start)setError(exportError(e))}finally{if(latest.current===start)setBusy(false)}}
  if (!selectedPackageForDetail) return null

  // Phương án chung của gói: lấy từ GET chi tiết hạng mục; không khẳng định "API thiếu" khi chưa đọc xong hoặc đang lỗi.
  const detailRows=items.map(i=>detailOf(i.id))
  const planLoading=items.length>0&&detailRows.some(d=>!d)
  const planErrors=detailRows.filter((d):d is DetailRead=>!!d&&!!d.error).map(d=>d.error as string)
  const plans=[...new Set(detailRows.map(d=>d?.item?.repairPlan?.trim()).filter((p):p is string=>!!p))]
  const decided=items.filter(i=>i.state==='Confirmed'||i.mode==='Normal'&&['ReadyToAssign','Assigned','InProgress','Submitted','Reviewed'].includes(i.state)).length
  const dispatchTo=(id:string)=>{navigate(`/pm/repair-batches/assign?${new URLSearchParams({projectId:selectedPackageForDetail.route_id,packageId:selectedPackageForDetail.id,itemId:id})}`)}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {(error||journalError)&&<p role="alert" className="p-3 text-xs text-rose-700">{error||journalError}</p>}{message&&<p role="status" className="p-3 text-xs text-emerald-800">{message}</p>}
        {/* Header chi tiết */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0 ${
                selectedPackageForDetail.status === 'SUBMITTED'
                  ? 'bg-brand-gold text-white'
                  : selectedPackageForDetail.status === 'DECIDED'
                  ? 'bg-emerald-600 text-white'
                  : selectedPackageForDetail.status === 'DISPATCHED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {selectedPackageForDetail.code.split('-').pop()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                  {selectedPackageForDetail.code}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedPackageForDetail.status === 'SUBMITTED'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedPackageForDetail.status === 'DECIDED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedPackageForDetail.status === 'DISPATCHED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {items.length?[...new Set(items.map(i=>`${i.mode}: ${i.state}`))].join(' · '):selectedPackageForDetail.status_label}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Nguồn đang đọc từ hệ thống
                </span>
              </div>
              <h3 className="text-base font-bold text-brand-dark mt-1">
                {selectedPackageForDetail.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span>Tuyến: <strong className="text-slate-700">{selectedPackageForDetail.route_name}</strong></span>
                <span>•</span>
                <span>Phạm vi: <strong className="text-slate-700 font-mono">{selectedPackageForDetail.chainage_display}</strong></span>
                <span>•</span>
                <span>Nhà thầu: <strong className="text-slate-700">{selectedPackageForDetail.contractor_name}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedPackageForDetail(null)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Body: toàn bộ hồ sơ và thao tác xếp theo chiều dọc, cuộn trong khung */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Số lượng khiếm khuyết</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {selectedPackageForDetail.defect_count} hạng mục
              </span>
              <span className="text-[11px] text-slate-500">{selectedPackageForDetail.defect_summary}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Khối lượng kỹ thuật thi công</span>
              <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
                {selectedPackageForDetail.technical_scope}
              </span>
              <span className="text-[11px] text-slate-500">{selectedPackageForDetail.material_scope}</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <span className="text-[11px] text-amber-900 font-medium block">Thời hạn &amp; Tiến độ kế hoạch</span>
              <span className="text-lg font-mono font-black text-[#8F7212] mt-0.5 block">
                {Number.isFinite(selectedPackageForDetail.duration_days)?`${selectedPackageForDetail.duration_days} ngày thi công`:'Chưa có thời gian kế hoạch từ nguồn đọc'}
              </span>
              <span className="text-[11px] text-amber-800">
                Kế hoạch: {selectedPackageForDetail.date_range}
              </span>
            </div>
          </div>

          {/* Phương án kỹ thuật sửa chữa (PM nhập) — đọc từ GET chi tiết hạng mục */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <Icon name="build" className="text-sm text-brand-gold" />
                <span>Phương án kỹ thuật sửa chữa (PM đề xuất):</span>
              </span>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded font-mono border border-slate-200">
                Theo chi tiết hạng mục
              </span>
            </div>
            {planLoading && !plans.length && <p className="text-slate-500 text-xs">Đang đọc phương án từ chi tiết hạng mục…</p>}
            {plans.map((p,i)=><p key={i} className="text-slate-800 text-xs leading-relaxed font-medium whitespace-pre-wrap">{p}</p>)}
            {!planLoading && !plans.length && !planErrors.length && items.length>0 && <p className="text-slate-600 text-xs">Chi tiết hạng mục đã đọc nhưng không có nội dung phương án.</p>}
            {planErrors.length>0 && <p role="alert" className="text-rose-700 text-xs">Không đọc được chi tiết hạng mục ({planErrors.length}/{items.length}): {[...new Set(planErrors)].join(' · ')}</p>}
            <div className="text-[11px] text-slate-600 pt-1.5 border-t border-amber-200/60 flex items-center gap-3 flex-wrap">
              <span>Quy mô: <strong className="text-slate-800">{selectedPackageForDetail.technical_scope}</strong></span>
            </div>
          </div>

          {/* Danh sách RepairItems chi tiết */}
          <div>
            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
              <h4 className="font-bold text-sm text-brand-dark">
                Danh sách hạng mục sửa chữa ({items.length})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Đã có quyết định phê duyệt: {decided}/{items.length} hạng mục · chưa phản ánh tiến độ thi công/nghiệm thu
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Chưa có hạng mục sửa chữa chi tiết nào trong gói này.
                </div>
              ) : items.map((item,i) => {
                const d=detailOf(item.id)
                return (
                  <div key={item.id} className="p-3 hover:bg-slate-50/80 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-900">Hạng mục {i+1} <span className="text-slate-400 font-normal">· {item.id.slice(0,8).toUpperCase()}</span></span>
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${STATE_BADGE(item.state)}`}>{item.mode}: {item.state}</span>
                        {isPM&&item.mode==='Normal'&&item.state==='ReadyToAssign'&&<button type="button" onClick={()=>dispatchTo(item.id)} className="rg-btn text-xs font-semibold text-[#8C6D1F]"><Icon name="local_shipping" size={13} className="mr-1 inline"/>Giao việc</button>}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                      <div><span className="text-slate-500">Phạm vi: </span><span className="font-mono">{selectedPackageForDetail.chainage_display}</span></div>
                      <div><span className="text-slate-500">Checklist: </span>{!d?<span>Đang đọc chi tiết…</span>:d.error?<span className="text-rose-700">Không đọc được chi tiết hạng mục</span>:<strong className="text-slate-800">{d.item?.checklistVersion||'Chưa có'}</strong>}</div>
                      <div className="md:col-span-2"><span className="text-slate-500">Phương án: </span>{!d?<span>Đang đọc chi tiết…</span>:d.error?<span role="alert" className="text-rose-700">{d.error}</span>:<span className="text-slate-800 whitespace-pre-wrap">{d.item?.repairPlan?.trim()||'Chi tiết hạng mục không có nội dung phương án.'}</span>}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Khối thao tác theo vai trò — xếp dọc, đầy đủ chiều rộng */}
          {isSupervisor && items.some(i=>i.mode==='Normal') && (
            <div className="rg-subcard space-y-2 text-xs">
              <h4 className="font-bold text-sm text-brand-dark flex items-center gap-1.5"><Icon name="fact_check" size={16} className="text-emerald-700"/>Phê duyệt hạng mục Normal</h4>
              <label className="block">Hạng mục Normal cần duyệt<select aria-label="Hạng mục Normal phê duyệt" value={itemId} disabled={busy} onChange={e=>{setItemId(e.target.value);setReason('')}} className="rg-field block w-full"><option value="">Chọn hạng mục từ hồ sơ</option>{items.filter(i=>i.mode==='Normal'&&['AwaitingApproval','ReadyToAssign'].includes(i.state)).map((i,n)=><option key={i.id} value={i.id}>Hạng mục {n+1} · {i.state}</option>)}</select></label>
              <textarea aria-label="Lý do phê duyệt Normal" placeholder={held?'Lý do đang được giữ trong journal':'Nhập căn cứ phê duyệt'} value={held?.body.reason||reason} disabled={busy||!!held} onChange={e=>setReason(e.target.value)} maxLength={2000} className="rg-field block w-full"/>
              <button type="button" disabled={busy||!!journalError||!itemId||(!held&&!reason.trim())||(!held&&items.find(i=>i.id===itemId)?.state!=='AwaitingApproval')} onClick={approve} className="rg-btn text-emerald-800">{held?'Đối chiếu quyết định đã gửi':'Phê duyệt hạng mục Normal'}</button>
            </div>
          )}
          <RepairItemActions projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} isPM={isPM} isSupervisor={isSupervisor} onDone={()=>setReload(n=>n+1)} />
          {isPM && <PlanningPanel key={`plan:${selectedPackageForDetail.id}`} projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} onSaved={()=>{setReload(n=>n+1);window.dispatchEvent(new Event('repair-workflow-refresh'))}} />}
          <SourceDefectPanel key={selectedPackageForDetail.id} projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} />
          {isPM && <NotificationSupervisorPanel projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} />}
          {isPM && <RepairSafetyPanel projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} />}
          {items.some(i=>i.mode==='FastTrack') && (
            <div className="flex flex-wrap gap-2">
              {items.filter(i=>i.mode==='FastTrack').map((item,n)=><button key={item.id} type="button" onClick={()=>navigate(`${isSupervisor?'/sup':'/pm'}/fast-track?${new URLSearchParams({projectId:selectedPackageForDetail.route_id,defectId:selectedPackageForDetail.defect_id||'',itemId:item.id,open:'prepare'})}`)} className="rg-btn text-xs font-semibold text-[#8C6D1F]">{isPM?'Điều phối Fast Track có điều kiện':'Đọc độ phủ & điều phối Fast Track'} · Hạng mục {n+1}</button>)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-500">
            Người lập: <strong className="text-slate-800">{selectedPackageForDetail.created_by_name}</strong> •{' '}
            {selectedPackageForDetail.created_at}
          </div>
          <button
            onClick={() => setSelectedPackageForDetail(null)}
            type="button"
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
