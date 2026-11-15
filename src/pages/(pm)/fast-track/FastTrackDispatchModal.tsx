import React, { useState, useEffect } from 'react'
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
          {hasViolation ? (
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
            <label className="font-bold text-slate-700">Phân công nhân sự / tổ đội phụ trách</label>
            <select
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
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2">Chính sách đã xuất bản (tham chiếu hồ sơ)<input value={task.policyRevisionId} onChange={e=>update('policyRevisionId',e.target.value)} className="block w-full border rounded-lg p-2 mt-1"/></label>
            <label>Nguồn khiếm khuyết<select value={task.sourceKind} onChange={e=>update('sourceKind',e.target.value)} className="block w-full border rounded-lg p-2 mt-1"><option value="">Chọn nguồn</option><option value="REPORTER">Phản ánh đã xác nhận</option><option value="SURVEY">Đợt khảo sát Drone</option></select></label>
            <label>Loại số đo<select value={task.requiredMeasurementType} onChange={e=>update('requiredMeasurementType',Number(e.target.value))} className="block w-full border rounded-lg p-2 mt-1"><option value={0}>Chọn số đo</option><option value={1}>Độ sâu lún</option><option value={2}>Chênh cao tấm</option><option value={3}>Xói lề</option><option value={4}>Diện tích</option></select></label>
            {(['surveyId','segmentSetId','layoutRevisionId','slabId','mapPublicationId','crsProfileRevisionId'] as const).map((key,i)=><label key={key}>{['Đợt khảo sát (nếu có)','Bộ phân đoạn đã công bố','Bố trí mặt đường (nếu có)','Tấm (nếu có)','Bản đồ công bố (nếu có)','Hệ tọa độ (nếu có)'][i]}<input value={task[key] || ''} onChange={e=>update(key,e.target.value || null)} className="block w-full border rounded-lg p-2 mt-1"/></label>)}
            <label className="col-span-2">Hạn hoàn thành<input type="datetime-local" value={task.dueAt ? (task.dueAt.includes('Z') || /[+-]\d\d:\d\d$/.test(task.dueAt) ? new Date(new Date(task.dueAt).getTime()-new Date(task.dueAt).getTimezoneOffset()*60000).toISOString().slice(0,16) : task.dueAt.slice(0,16)) : ''} onChange={e=>update('dueAt',e.target.value)} className="block w-full border rounded-lg p-2 mt-1"/></label>
            <label className="col-span-2">Phạm vi đo theo hồ sơ<textarea value={task.measurementScope} onChange={e=>update('measurementScope',e.target.value)} className="block w-full border rounded-lg p-2 mt-1"/></label>
          </div>
          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Ghi chú chỉ đạo hiện trường</label>
            <textarea
              rows={2}
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
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={()=>handleExecuteDispatch({...task,dueAt:task.dueAt ? new Date(task.dueAt).toISOString() : ''})}
            disabled={hasViolation || selectedDefectIds.length === 0 || !selectedDispatchCrew || !task.policyRevisionId || !task.sourceKind || !task.requiredMeasurementType || !task.dueAt || !task.measurementScope}
            className="px-5 py-2 text-xs font-bold text-white bg-[#C9A227] hover:bg-[#b08d20] rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Xác nhận phát lệnh
          </button>
        </div>
      </div>
    </div>
  )
}
