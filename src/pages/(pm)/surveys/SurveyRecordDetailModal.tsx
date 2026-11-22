import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { SurveyRecordActions } from './SurveyRecordActions'
import { SurveyDatasetPanel } from './SurveyDatasetPanel'
import { SurveyCompleteCard } from './SurveyCompleteCard'
import { SupSourceVideo } from './SupSourceVideo'
import { surveyStatusLabel, surveyPlannedAtLabel, type SurveyRecord, type SurveyPresentation } from '../../../api/services/surveyPlanningService'
import type { SurveyMissionItem } from '../../../api/services/surveyService'

const shortOf = (kind: 'PLAN' | 'TASK', id: string) => `${kind === 'PLAN' ? 'KH' : 'NV'}-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`

// Read-only use of the original survey modal's dark header, summary banner and information groups.
export function SurveyRecordDetailModal({projectName,record,description,loading,error,onRetry,onClose,onChanged,target,onOpenRelated,planTasks}: {
  projectName:string; record:SurveyRecord|null; description:SurveyPresentation|null; loading:boolean; error:string; onRetry:()=>void; onClose:()=>void; onChanged?:()=>void
  /** Dòng danh sách đã mở (mã rút gọn, quan hệ từ summary BE). */
  target?:SurveyMissionItem|null; onOpenRelated?:(id:string)=>void; planTasks?:{id:string;status:string}[]
}) {
  const isPM=useAuthStore(s=>s.user?.role)===RoleCode.PROJECT_MANAGER
  const isSup=useAuthStore(s=>s.user?.role)===RoleCode.SUPERVISOR
  return <div role="dialog" aria-modal="true" aria-label="Chi tiết khảo sát" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl shadow-xl border border-[#E2E5E9] w-full max-w-3xl max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-200">
      <div className="bg-[#1A1D20] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-[#C9A227] border border-amber-500/30 flex items-center justify-center shrink-0"><Icon name="flight_takeoff" size={20} /></div>
          <div className="min-w-0"><h3 className="text-base font-bold text-white tracking-tight font-sansation">{record?.recordKind==='PLAN'?'Chi tiết kế hoạch khảo sát':record?.recordKind==='TASK'?'Chi tiết nhiệm vụ khảo sát':'Chi tiết khảo sát'}</h3><p className="text-xs text-slate-400 mt-0.5 break-words">{projectName}</p></div>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng chi tiết" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"><Icon name="close" size={20} /></button>
      </div>
      <div className="p-6 space-y-5">
        {loading&&<p role="status" className="text-xs text-slate-500 flex items-center gap-2"><Icon name="sync" size={16} className="animate-spin" />Đang tải chi tiết khảo sát…</p>}
        {error&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}<button type="button" onClick={onRetry} className="ml-3 underline">Thử lại</button></p>}
        {record&&<>
          <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-bold text-[#1A1D20]">{projectName}</p><p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2"><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${record.recordKind==='PLAN'?'bg-sky-50 text-sky-800 border-sky-200':'bg-teal-50 text-teal-800 border-teal-200'}`}>{record.recordKind==='PLAN'?'KẾ HOẠCH':'NHIỆM VỤ'}</span>{(record.parentTaskId||target?.parent_task_id)&&<span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200">Bổ sung</span>}<span className="font-mono">{shortOf(record.recordKind,record.id)}</span></p></div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-slate-100 text-[#2D3748] border-[#E2E5E9]">{surveyStatusLabel(record.status)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {record.recordKind==='PLAN'&&record.plannedAt&&<div className="rounded-xl border border-[#E2E5E9] p-4"><p className="text-[11px] text-slate-500 flex gap-2 items-center"><Icon name="calendar_month" size={16} className="text-[#C9A227]" />Lịch bay dự kiến</p><p className="mt-2 text-sm font-bold text-[#1A1D20]">{target?.flight_date||surveyPlannedAtLabel(record.plannedAt)}</p><p className="mt-1 text-[10px] text-slate-400">Giờ Việt Nam</p></div>}
            {record.recordKind==='PLAN'&&<div className="rounded-xl border border-[#E2E5E9] p-4"><p className="text-[11px] text-slate-500 flex gap-2 items-center"><Icon name="person" size={16} className="text-[#C9A227]" />Operator theo các nhiệm vụ của kế hoạch</p><p className="mt-2 text-sm font-bold text-[#1A1D20]">{target?.pilot_name||'Chưa có nhiệm vụ nào được giao'}</p></div>}
            {record.recordKind==='TASK'&&<div className="rounded-xl border border-[#E2E5E9] p-4"><p className="text-[11px] text-slate-500 flex gap-2 items-center"><Icon name="event" size={16} className="text-[#C9A227]" />Hạn hoàn thành</p><p className="mt-2 text-sm font-bold text-[#1A1D20]">{record.dueAt?surveyPlannedAtLabel(record.dueAt):'Không đặt hạn'}</p><p className="mt-1 text-[10px] text-slate-400">Giờ Việt Nam</p></div>}
            <div className="rounded-xl border border-[#E2E5E9] p-4"><p className="text-[11px] text-slate-500 flex gap-2 items-center"><Icon name="category" size={16} className="text-[#C9A227]" />Loại khảo sát</p><p className="mt-2 text-sm font-bold text-[#1A1D20]">{(record.parentTaskId||target?.parent_task_id)?'Bổ sung (theo nhiệm vụ gốc)':'BE chưa trả loại khảo sát'}</p><p className="mt-1 text-[10px] text-slate-400">BE chỉ nhận Cơ sở / Định kỳ / Đột xuất khi tạo, không trả lại khi đọc.</p></div>
            {record.recordKind==='TASK'&&<div className="rounded-xl border border-[#E2E5E9] p-4"><p className="text-[11px] text-slate-500 flex gap-2 items-center"><Icon name="person" size={16} className="text-[#C9A227]" />Người được phân công</p><p className="mt-2 text-sm font-bold text-[#1A1D20]">{loading ? 'Đang tải thông tin người được giao…' : description?.operatorName || 'Chưa tải được thông tin người được giao'}</p><p className="mt-1 text-[11px] text-slate-500">Phi công thiết bị bay</p></div>}
          </div>
          {onOpenRelated&&(()=>{
            const links:{label:string;id:string}[]=[]
            if(record.recordKind==='TASK'){
              if(target?.plan_id)links.push({label:`Kế hoạch ${shortOf('PLAN',target.plan_id)}`,id:target.plan_id})
              const parent=record.parentTaskId||target?.parent_task_id;if(parent)links.push({label:`Nhiệm vụ gốc ${shortOf('TASK',parent)}`,id:parent})
              const child=record.supplementTaskId||target?.supplement_task_id;if(child)links.push({label:`Nhiệm vụ bổ sung ${shortOf('TASK',child)}`,id:child})
            }else for(const t of planTasks||[])links.push({label:`Nhiệm vụ ${shortOf('TASK',t.id)} (${surveyStatusLabel(t.status)})`,id:t.id})
            return links.length?<section className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl p-4 space-y-2" aria-label="Bản ghi liên quan"><h4 className="text-xs font-bold text-[#1A1D20] flex gap-2 items-center"><Icon name="account_tree" size={16} className="text-[#C9A227]" />Bản ghi liên quan</h4><div className="flex flex-wrap gap-3">{links.map(l=><button key={l.id} type="button" onClick={()=>onOpenRelated(l.id)} className="text-xs underline text-[#2D3748] cursor-pointer">{l.label}</button>)}</div></section>:null
          })()}
          {description?.scopes.map((s,i)=><section key={i} className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl p-4 space-y-2"><h4 className="text-xs font-bold text-[#1A1D20] flex gap-2 items-center"><Icon name="route" size={16} className="text-[#C9A227]" />Phạm vi khảo sát</h4><p className="text-xs font-semibold text-[#2D3748] break-words">{s.routeName}</p><div className="flex flex-wrap gap-3 text-xs text-slate-600"><span>{s.band}</span><span className="font-mono">{s.ranges}</span></div>{s.historical&&<span className="inline-block text-[10px] rounded-full border border-amber-200 bg-amber-50 text-amber-800 px-2 py-1">Bộ phân đoạn lịch sử</span>}</section>)}
          {isPM&&<SurveyRecordActions record={record} onDone={()=>onChanged?.()} />}
          {isPM&&record.recordKind==='TASK'&&<SurveyCompleteCard record={record} onDone={()=>onChanged?.()} />}
          {isPM&&record.recordKind==='TASK'&&<SurveyDatasetPanel record={record} />}
          {isSup&&record.recordKind==='TASK'&&<SupSourceVideo record={record} />}
        </>}
      </div>
      <div className="border-t border-[#E2E5E9] px-6 py-4 flex justify-end"><button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition-all cursor-pointer">Đóng lại</button></div>
    </div>
  </div>
}
