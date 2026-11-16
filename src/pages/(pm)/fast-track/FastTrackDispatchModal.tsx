import React, { useState, useEffect } from 'react'
import { fastTrackService, type RepairPolicyView } from '../../../api/services/fastTrackService'
import { fastTrackFormSources, type FastTrackSource } from '../../../api/services/fastTrackFormSources'
import { exportError } from '../../../api/services/projectExportService'
import { fastTrackStorage, fastTrackPending } from '../../../api/services/fastTrackJournal'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem, CrewTeam, PolicyThresholdConfig, FastTrackTaskInput } from './types'

export interface FastTrackDispatchModalProps {
  projectId: string
  actionError: string
  isOpen: boolean
  onClose: () => void
  selectedDefectIds: string[]
  selectedItems: DefectItem[]
  selectedDispatchCrew: string
  setSelectedDispatchCrew: (crew: string) => void
  crewTeams: CrewTeam[]
  dispatchNotes: string
  setDispatchNotes: (notes: string) => void
  handleExecuteDispatch: (task:FastTrackTaskInput) => void
  currentPolicy?: PolicyThresholdConfig | null
}

export const FastTrackDispatchModal: React.FC<FastTrackDispatchModalProps> = ({
  projectId, actionError,
  isOpen,
  onClose,
  selectedDefectIds,
  selectedItems,
  selectedDispatchCrew,
  setSelectedDispatchCrew,
  crewTeams,
  dispatchNotes,
  setDispatchNotes,
  handleExecuteDispatch
}) => {
  const [task,setTask]=useState<FastTrackTaskInput>(()=>JSON.parse(localStorage.getItem(fastTrackStorage(projectId,'task-form')) || 'null') || {sourceKind:'',surveyId:null,segmentSetId:null,layoutRevisionId:null,slabId:null,mapPublicationId:null,crsProfileRevisionId:null,requiredMeasurementType:0,measurementScope:'',dueAt:'',policyRevisionId:''})
  const update=(key:keyof FastTrackTaskInput,value:string|number|null)=>setTask(previous=>{const next={...previous,[key]:value};localStorage.setItem(fastTrackStorage(projectId,'task-form'),JSON.stringify(next));return next})
  const selectedKey=selectedItems.map(r=>r.id).join(':')
  useEffect(()=>{
    if(!isOpen || selectedItems.length!==1)return
    const item=selectedItems[0]
    const held=item.itemId ? fastTrackPending(projectId,`assign:${item.itemId}`) : null
    const body=held?.body as any
    if(body?.task){const {defectId,defectVersion,routeVersionId,purpose,assignedToUserId,instructions,...pins}=body.task;const description=typeof instructions==='string' && instructions.startsWith(body.reason+'\n') ? instructions.slice(body.reason.length+1) : pins.measurementScope;setTask({...pins,measurementScope:description,policyRevisionId:body.policyRevisionId});setSelectedDispatchCrew(assignedToUserId);setDispatchNotes(body.reason)}
  },[isOpen,projectId,selectedKey])
  const [sources,setSources]=useState<FastTrackSource[]>([]),[policies,setPolicies]=useState<RepairPolicyView[]>([])
  const [sourceError,setSourceError]=useState(''),[loading,setLoading]=useState(false)
  const [policyWarning,setPolicyWarning]=useState('')
  const [submitting,setSubmitting]=useState(false)
  useEffect(()=>{
    let active=true
    if(!isOpen || !selectedItems.length)return
    setLoading(true);setSourceError('');setPolicyWarning('');setSources([]);setPolicies([])
    Promise.all([fastTrackFormSources.list(projectId,selectedItems.map(i=>i.defectId || i.id)),fastTrackService.getPolicies(projectId,message=>{if(active)setPolicyWarning(message)})]).then(([rows,p])=>{
      if(!active)return
      setSources(rows);setPolicies(p.filter(r=>r.state==='PUBLISHED' && r.revision!=null && selectedItems.every(i=>i.defectTypeCode===r.defectTypeCode && !!i.checklistVersion && i.checklistVersion===r.checklistVersion)))
      const held=selectedItems.length===1 && selectedItems[0].itemId ? fastTrackPending(projectId,`assign:${selectedItems[0].itemId}`) : null
      if(held){const body=held.body as any;const matches=rows.filter(r=>Object.entries(r.pins).every(([key,v])=>body.task?.[key]===v));if(matches.length===1)setTask(previous=>({...previous,sourceTaskId:matches[0].id}))}
    }).catch(e=>{if(active)setSourceError(exportError(e))}).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[isOpen,projectId,selectedKey])
  const source=sources.find(s=>s.id===task.sourceTaskId)
  const chooseSource=(id:string)=>{
    const row=sources.find(r=>r.id===id)
    setTask(previous=>{const next={...previous,sourceTaskId:row?.id || '',sourceKind:row?.pins.sourceKind || '',surveyId:row?.pins.surveyId ?? null,segmentSetId:row?.pins.segmentSetId ?? null,layoutRevisionId:row?.pins.layoutRevisionId ?? null,slabId:row?.pins.slabId ?? null,mapPublicationId:row?.pins.mapPublicationId ?? null,crsProfileRevisionId:row?.pins.crsProfileRevisionId ?? null,requiredMeasurementType:row?.requiredMeasurementType || 0};localStorage.setItem(fastTrackStorage(projectId,'task-form'),JSON.stringify(next));return next})
  }
  const pending=selectedItems.length===1 && selectedItems[0].itemId ? fastTrackPending(projectId,`assign:${selectedItems[0].itemId}`) : null
  const mixed=selectedItems.some(i=>i.defectId!==selectedItems[0]?.defectId)
  const instructionLength=[dispatchNotes,task.measurementScope].filter(t=>t.length>0).join('\n').trim().length
  const validDate=Number.isFinite(Date.parse(task.dueAt)) && Date.parse(task.dueAt)>Date.now()
  const validSource=!!source && Object.entries(source.pins).every(([key,v])=>(task as any)[key]===v) && source.requiredMeasurementType===task.requiredMeasurementType
  const missingChecklist=selectedItems.some(i=>!i.checklistVersion)
  const formError=!selectedItems.length ? 'Chọn hạng mục cần giao việc trước khi lập lệnh.' : mixed ? 'Mỗi lệnh sử dụng một hồ sơ nguồn. Chọn các hạng mục cùng một khiếm khuyết.' : !loading && !sources.length ? 'Chưa có hồ sơ nhiệm vụ phù hợp để xác thực nguồn và phiên bản tuyến. Chưa thể giao việc.' : missingChecklist ? 'Chưa đọc được checklist phương án của hạng mục. Không suy checklist từ policy đang xem; hiện chưa thể chọn revision để giao lệnh mới.' : !loading && !policies.length ? 'Chưa có revision đã xuất bản, chưa thu hồi khớp loại lỗi và checklist phương án.' : instructionLength>1000 ? 'Tổng phạm vi và chỉ dẫn vượt 1000 ký tự; cần rút gọn, hệ thống không tự cắt nội dung.' : task.dueAt && !validDate ? 'Hạn hoàn thành phải là thời điểm hợp lệ trong tương lai.' : ''
  if (!isOpen) return null

  const hasViolation = selectedItems.some((item) => !item.canAssign)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="send" size={18} className="text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Phát Lệnh Xử Lý Nhanh Hiện Trường</h3>
              <span className="text-[10px] text-slate-500">Chỉ huy trưởng (PM) điều phối nhân sự thi công</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Thông tin tóm tắt */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Số lượng hạng mục:</span>
              <strong className="text-slate-900">{selectedDefectIds.length} vị trí</strong>
            </div>
          </div>

          {/* Cảnh báo vi phạm */}
          {hasViolation || !selectedItems.length ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Icon name="error" size={16} className="text-rose-600" />
                <span>Không thể phát lệnh: Có khiếm khuyết chưa có hạng mục sẵn sàng giao việc!</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Cần hạng mục FastTrack ở trạng thái ReadyToAssign. Không thể chuyển mode bằng giao diện.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <Icon name="check_circle" size={16} className="text-emerald-600" />
              <span className="font-semibold">Tất cả {selectedDefectIds.length} vị trí có thể đề nghị giao việc có điều kiện. Chưa cho phép thi công!</span>
            </div>
          )}

          {/* Chọn đội thi công */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Phân công nhân sự / tổ đội phụ trách *</label>
            <select
              required aria-label="Crew giao việc"
              disabled={!!pending}
              value={selectedDispatchCrew}
              onChange={(e) => setSelectedDispatchCrew(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
            >
              <option value="">Chọn Crew hiện hành</option>
              {crewTeams.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role || 'Thành viên'})
                </option>
              ))}
            </select>
          </div>

          {actionError && <p role="alert" className="text-red-800">{actionError}</p>}
          {!pending?.receipt && policyWarning && <p role="alert" className="text-amber-800 text-xs">{policyWarning}</p>}
          <p className="text-slate-500 text-xs">Policy đang xem trên thẻ không tự ghim vào lệnh. Chỉ các revision phù hợp checklist phương án được chọn tại đây; BE còn kiểm lại điều kiện.</p>
          {pending?.receipt && <p role="status" className="text-slate-500 text-xs">Đã nhận receipt. Chỉ đọc lại hạng mục và nhiệm vụ đã giao; không gửi thêm lệnh.</p>}
          {!pending?.receipt && (sourceError || formError) && <p role="alert" className="text-red-800">{sourceError || formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2">Policy ghim cho lệnh mới *<select aria-label="Chính sách giao việc" required value={task.policyRevisionId} disabled={loading || !policies.length || !!pending} onChange={e=>update('policyRevisionId',e.target.value)} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="">{loading?'Đang đọc chính sách…':policies.length?'Chọn chính sách':'Chưa có chính sách phù hợp từ nguồn'}</option>{policies.map(p=><option key={p.id} value={p.id}>{p.checklistVersion} · Lần ban hành {p.revision}</option>)}</select></label>
            <label className="col-span-2">Hồ sơ nguồn khảo sát *<select aria-label="Hồ sơ nguồn giao việc" required value={task.sourceTaskId || ''} onChange={e=>chooseSource(e.target.value)} disabled={loading || !sources.length || !!pending} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="">{loading?'Đang xác thực hồ sơ…':sources.length?'Chọn hồ sơ nguồn':'Chưa có hồ sơ phù hợp'}</option>{sources.map(r=><option key={r.id} value={r.id}>{r.routeLabel} · {r.label}</option>)}</select></label>
            <label>Nguồn khiếm khuyết<select aria-label="Nguồn khiếm khuyết giao việc" value={source?.pins.sourceKind || ''} disabled className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="">Chọn hồ sơ nguồn trước</option>{source && <option value={source.pins.sourceKind}>{source.pins.sourceKind==='REPORTER'?'Phản ánh đã xác nhận':'Đợt khảo sát Drone'}</option>}</select></label>
            <label>Loại số đo theo hồ sơ<select aria-label="Loại số đo giao việc" value={source?.requiredMeasurementType || 0} disabled className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value={0}>Chọn hồ sơ nguồn trước</option>{source && <option value={source.requiredMeasurementType}>{({1:'Độ sâu lún (mm)',2:'Chênh cao tấm',3:'Xói lề',4:'Diện tích (m²)'} as Record<number,string>)[source.requiredMeasurementType] || 'Chưa có loại đo được hỗ trợ'}</option>}</select></label>
            {(['surveyId','segmentSetId','layoutRevisionId','slabId','mapPublicationId','crsProfileRevisionId'] as const).map((key,i)=><label key={key}>{['Đợt khảo sát Drone','Bộ phân đoạn đã công bố','Bố trí mặt đường','Tấm','Bản đồ công bố','Hệ tọa độ'][i]}<select aria-label={`Nguồn ${key}`} value={source?.pins[key] || ''} disabled className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1">{source ? <option value={source.pins[key] || ''}>{source.pins[key] ? key==='slabId' ? `Tấm ${source.pins.slabId}` : 'Đã đối chiếu theo hồ sơ nguồn' : 'Không có trong hồ sơ nguồn'}</option> : <option value="">Chọn hồ sơ nguồn trước</option>}</select></label>)}
            <label className="col-span-2">Hạn hoàn thành *<input aria-label="Hạn hoàn thành giao việc" required type="datetime-local" value={task.dueAt ? (task.dueAt.includes('Z') || /[+-]\d\d:\d\d$/.test(task.dueAt) ? new Date(new Date(task.dueAt).getTime()-new Date(task.dueAt).getTimezoneOffset()*60000).toISOString().slice(0,16) : task.dueAt.slice(0,16)) : ''} onChange={e=>update('dueAt',e.target.value)} disabled={!!pending} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"/></label>
            <label className="col-span-2">Mô tả phạm vi đo *<textarea aria-label="Mô tả phạm vi giao việc" required value={task.measurementScope} onChange={e=>update('measurementScope',e.target.value)} disabled={!!pending} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"/></label>
            <p className="col-span-2 text-slate-500">Nhập mô tả bằng văn bản thường. Phạm vi và chỉ đạo được giữ trong chỉ dẫn nhiệm vụ; tổng tối đa 1000 ký tự. Việc chọn hồ sơ không chứng minh đã đủ điều kiện thi công.</p>
          </div>
          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Ghi chú chỉ đạo hiện trường</label>
            <textarea
              rows={2}
              aria-label="Chỉ đạo giao việc" required disabled={!!pending}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={async()=>{if(submitting || !(validDate || pending))return;setSubmitting(true);try{await handleExecuteDispatch({...task,dueAt:pending ? task.dueAt : validDate ? new Date(task.dueAt).toISOString() : task.dueAt})}finally{setSubmitting(false)}}}
            disabled={submitting || selectedDefectIds.length === 0 || (!pending?.receipt && (hasViolation || !selectedDispatchCrew || (!pending && (loading || !!sourceError || !!formError || !validSource || !policies.some(p=>p.id===task.policyRevisionId) || !validDate || !task.measurementScope.trim() || !dispatchNotes.trim()))))}
            className="px-5 py-2 text-xs font-bold text-white bg-[#C9A227] hover:bg-[#b08d20] rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting?'Đang đối chiếu…':pending ? 'Đối chiếu lệnh đã gửi' : 'Xác nhận phát lệnh'}
          </button>
        </div>
      </div>
    </div>
  )
}
