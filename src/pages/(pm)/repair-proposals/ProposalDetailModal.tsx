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

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  selectedPackageForDetail,
  setSelectedPackageForDetail,
  isSupervisor,
  isPM,
}) => {
  const auth=useAuthStore(),navigate=useNavigate(),scope=`${auth.authEpoch}:${selectedPackageForDetail?.route_id}:${selectedPackageForDetail?.id}`,latest=useRef(scope);latest.current=scope
  const [read,setRead]=useState<{scope:string;items:RepairItem[]}|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[itemId,setItemId]=useState(''),[reason,setReason]=useState(''),[busy,setBusy]=useState(false),[reload,setReload]=useState(0)
  useEffect(()=>{const c=new AbortController();setRead(null);setError('');setMessage('');setItemId('');setReason('');if(selectedPackageForDetail)repairWorkflowService.items(selectedPackageForDetail.route_id,selectedPackageForDetail.id,c.signal).then(items=>{if(!c.signal.aborted)setRead({scope,items})}).catch(e=>{if(!c.signal.aborted)setError(exportError(e))});return()=>c.abort()},[scope,reload])
  const items=read?.scope===scope?read.items:[]
  let held:ReturnType<typeof repairWorkflowService.pending>=null,journalError=''
  try{if(isSupervisor&&selectedPackageForDetail&&itemId)held=repairWorkflowService.pending(selectedPackageForDetail.route_id,selectedPackageForDetail.id,itemId,'approve')}catch(e){journalError=exportError(e)}
  const approve=async()=>{if(!selectedPackageForDetail||!itemId||!isSupervisor||busy||journalError)return;const start=scope;setBusy(true);setError('');try{const r=await repairWorkflowService.decide(selectedPackageForDetail.route_id,selectedPackageForDetail.id,itemId,'approve',held?.body.reason||reason);if(latest.current!==start)return;setMessage(`Đã GET đối chiếu hạng mục: ${r.state}.`);const fresh=await repairWorkflowService.items(selectedPackageForDetail.route_id,selectedPackageForDetail.id);if(latest.current!==start)return;setRead({scope,items:fresh});window.dispatchEvent(new Event('repair-workflow-refresh'))}catch(e){if(latest.current===start)setError(exportError(e))}finally{if(latest.current===start)setBusy(false)}}
  if (!selectedPackageForDetail) return null

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

        {/* Body: Danh sách các RepairItems */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
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

          {/* Phương án kỹ thuật sửa chữa tổng quát của gói (Do PM nhập) */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <Icon name="build" className="text-sm text-brand-gold" />
                <span>Phương án kỹ thuật sửa chữa tổng quát (PM đề xuất):</span>
              </span>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded font-mono border border-slate-200">
                Theo hồ sơ hạng mục
              </span>
            </div>
            <p className="text-slate-800 text-xs leading-relaxed font-medium">
              {selectedPackageForDetail.technical_method ||
                'Nguồn đọc hiện chưa cung cấp phương án; không tự phục dựng từ mức độ hoặc khối lượng.'}
            </p>
            <div className="text-[11px] text-slate-600 pt-1.5 border-t border-amber-200/60 flex items-center gap-3 flex-wrap">
              <span>Quy mô: <strong className="text-slate-800">{selectedPackageForDetail.technical_scope}</strong></span>
            </div>
          </div>

          {/* Danh sách RepairItems chi tiết */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-brand-dark">
                Danh sách hạng mục sửa chữa ({items.length})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Hạng mục đã có quyết định: {items.filter(i=>i.state==='Confirmed'||i.mode==='Normal'&&['ReadyToAssign','Assigned','InProgress','Submitted','Reviewed'].includes(i.state)).length}/{items.length} mục có quyết định
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <div className="p-3 bg-slate-50/70 flex items-center justify-between gap-3 text-slate-600 font-semibold text-[11px]">
                <span className="w-24">Mã hư hỏng</span>
                <span className="w-32">Lý trình / Vị trí</span>
                <span className="flex-1">Phương án kỹ thuật &amp; Vật tư</span>
                <span className="w-32 text-right">Khối lượng &amp; Quy cách</span>
                <span className="w-24 text-right">Trạng thái</span>
              </div>

              {(() => {
                const packageItems = items.map((item,i)=>({id:item.id,defect_code:`Hạng mục ${i+1}`,item_code:'',chainage:'Theo nghĩa vụ đã lưu',lane_info:'',solution_title:'API đọc chưa trả phương án/checklist; không tự phục dựng.',volume_display:'Chưa có nguồn số đo',area_m2:Number.NaN,status:item.state,status_label:`${item.mode}: ${item.state}`}))
                if (packageItems.length === 0) {
                  return (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Chưa có hạng mục sửa chữa chi tiết nào trong gói này.
                    </div>
                  )
                }
                return packageItems.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <span className="w-24 font-mono font-bold text-slate-900">{item.defect_code || item.item_code}</span>
                    <span className="w-32 font-mono text-slate-600">{item.chainage || item.lane_info || 'Phạm vi gói'}</span>
                    <span className="flex-1 text-slate-700">{item.solution_title}</span>
                    <span className="w-32 text-right font-mono font-semibold text-slate-900">
                      {item.volume_display || (item.area_m2 > 0 ? `${item.area_m2} m²` : 'Theo hồ sơ')}
                    </span>
                    <span className="w-24 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status_label || item.status}
                      </span>
                    </span>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        {/* Footer hành động theo vai trò */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Người lập: <strong className="text-slate-800">{selectedPackageForDetail.created_by_name}</strong> •{' '}
            {selectedPackageForDetail.created_at}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPackageForDetail(null)}
              type="button"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Đóng
            </button>

            {isSupervisor && items.some(i=>i.mode==='Normal') && <div className="space-y-2 text-xs"><label>Hạng mục Normal cần duyệt<select aria-label="Hạng mục Normal phê duyệt" value={itemId} disabled={busy} onChange={e=>{setItemId(e.target.value);setReason('')}} className="rg-field block w-full"><option value="">Chọn hạng mục từ hồ sơ</option>{items.filter(i=>i.mode==='Normal'&&['AwaitingApproval','ReadyToAssign'].includes(i.state)).map((i,n)=><option key={i.id} value={i.id}>Hạng mục {n+1} · {i.state}</option>)}</select></label><textarea aria-label="Lý do phê duyệt Normal" placeholder={held?'Lý do đang được giữ trong journal':'Nhập căn cứ phê duyệt'} value={held?.body.reason||reason} disabled={busy||!!held} onChange={e=>setReason(e.target.value)} maxLength={2000} className="rg-field block w-full"/><button type="button" disabled={busy||!!journalError||!itemId||(!held&&!reason.trim())||(!held&&items.find(i=>i.id===itemId)?.state!=='AwaitingApproval')} onClick={approve} className="rg-btn text-emerald-800">{held?'Đối chiếu quyết định đã gửi':'Phê duyệt hạng mục Normal'}</button></div>}
            <RepairItemActions projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} isPM={isPM} isSupervisor={isSupervisor} onDone={()=>setReload(n=>n+1)} />
            {isPM && <PlanningPanel key={`plan:${selectedPackageForDetail.id}`} projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} onSaved={()=>{setReload(n=>n+1);window.dispatchEvent(new Event('repair-workflow-refresh'))}} />}
            <SourceDefectPanel key={selectedPackageForDetail.id} projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} />
            {isPM && <NotificationSupervisorPanel projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} />}
            {isPM && <RepairSafetyPanel projectId={selectedPackageForDetail.route_id} packageId={selectedPackageForDetail.id} items={items} />}
            {items.filter(i=>i.mode==='FastTrack').map((item,n)=><button key={item.id} type="button" onClick={()=>navigate(`${isSupervisor?'/sup':'/pm'}/fast-track?${new URLSearchParams({projectId:selectedPackageForDetail.route_id,defectId:selectedPackageForDetail.defect_id||'',itemId:item.id,open:'prepare'})}`)} className="rg-btn text-xs font-semibold text-[#8C6D1F]">{isPM?'Điều phối Fast Track có điều kiện':'Đọc độ phủ & điều phối Fast Track'} · Hạng mục {n+1}</button>)}
          </div>
        </div>
      </div>
    </div>
  )
}
