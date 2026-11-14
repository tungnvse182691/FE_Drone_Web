import React, { useEffect, useState } from 'react'
import { triageGeometryService, type TriageRouteReference, type TriageGeometryPins, type TriagePublishedSet } from '../../../api/services/triageGeometryService'
import { useAuthStore } from '../../../store/authStore'
export function TriageGeometryScope({projectId, caseId, disabled, onChange}: {projectId: string; caseId: string; disabled?: boolean; onChange: (requiresScope: boolean, pins?: TriageGeometryPins) => void}) {
  const epoch = useAuthStore(s => s.authEpoch), scope = `${epoch}:${caseId}:${projectId}`
  const [choice, setChoice] = useState({scope:'', roadId:'', setId:'', enabled:false})
  const current = choice.scope === scope ? choice : {scope, roadId:'', setId:'', enabled:false}
  const [routes, setRoutes] = useState<{scope:string; rows:TriageRouteReference[]} | null>(null)
  const [sets, setSets] = useState<{scope:string; rows:TriagePublishedSet[]} | null>(null)
  const [state, setState] = useState<{scope:string; text:string; error:boolean; pins?: TriageGeometryPins}>({scope:'',text:'',error:false})
  const road = routes?.scope === scope ? routes.rows.find(r => r.roadSectionId === current.roadId) : undefined
  const selection = `${scope}:${current.roadId}:${current.setId}`
  useEffect(() => { onChange(false); setRoutes(null); setSets(null); setState({scope:selection,text:'Đang đọc tuyến hiện hành…',error:false})
    const controller = new AbortController()
    if (projectId) triageGeometryService.routes(projectId,controller.signal).then(rows=>{if(!controller.signal.aborted){setRoutes({scope,rows});setState({scope:selection,text:rows.length?'Chọn tuyến và bộ PUBLISHED để kiểm phạm vi ghi nhận Defect.':'Chưa có tuyến hiện hành; nhánh ghi nhận Defect chưa đủ phạm vi.',error:false})}}).catch(e=>{if(!controller.signal.aborted)setState({scope:selection,text:e.message,error:true})})
    return()=>controller.abort()
  },[scope])
  useEffect(()=>{setSets(null);if(!road)return
    const controller=new AbortController();setState({scope:selection,text:'Đang đọc bộ phân đoạn PUBLISHED…',error:false})
    triageGeometryService.sets(projectId,road,controller.signal).then(rows=>{if(!controller.signal.aborted){setSets({scope:`${scope}:${road.roadSectionId}`,rows});setState({scope:selection,text:rows.length?'Chọn bộ đang công bố.':'Tuyến chưa có bộ PUBLISHED; nhánh ghi nhận Defect còn bị chặn.',error:false})}}).catch(e=>{if(!controller.signal.aborted)setState({scope:selection,text:e.message,error:true})})
    return()=>controller.abort()
  },[scope,current.roadId,road?.currentVersionId])
  useEffect(()=>{if(!road||!current.setId)return
    const controller=new AbortController();setState({scope:selection,text:'Đang đọc geometry-package…',error:false})
    triageGeometryService.package(projectId,road,current.setId,controller.signal).then(p=>{if(!controller.signal.aborted)setState({scope:selection,text:'Đã đọc đúng geometry-package; phạm vi sẵn sàng để điều phối.',error:false,pins:{routeVersionId:p.routeVersionId,segmentSetId:p.segmentSetId,geometryVersion:p.geometryVersion}})}).catch(e=>{if(!controller.signal.aborted)setState({scope:selection,text:`Không đọc được geometry-package: HTTP ${e?.response?.status || ''} ${e?.response?.data?.code || e.message}`,error:true})})
    return()=>controller.abort()
  },[selection,road?.currentVersionId])
  useEffect(() => { onChange(current.enabled, current.enabled && state.scope === selection ? state.pins : undefined) }, [scope, current.enabled, selection, state])
  return <div className="space-y-2 min-w-0 rounded-lg border border-slate-200 p-2">
    <label className="flex gap-2"><input type="checkbox" checked={current.enabled} disabled={disabled||!projectId} onChange={e=>{setChoice({...current,enabled:e.target.checked});onChange(e.target.checked, e.target.checked && state.scope === selection ? state.pins : undefined)}} />Gắn phạm vi để đi tiếp ghi nhận khiếm khuyết</label>
    <select aria-label="Tuyến hiện hành điều phối" value={current.roadId} disabled={disabled||!projectId||routes?.scope!==scope} onChange={e=>{onChange(current.enabled);setChoice({...current,roadId:e.target.value,setId:''})}} className="w-full min-w-0 rounded border p-2"><option value="">Chọn tuyến hiện hành</option>{routes?.scope===scope&&routes.rows.map(r=><option key={r.roadSectionId} value={r.roadSectionId}>{r.code}{r.name?` — ${r.name}`:''}</option>)}</select>
    <select aria-label="Bộ phân đoạn công bố điều phối" value={current.setId} disabled={disabled||!road||sets?.scope!==`${scope}:${current.roadId}`} onChange={e=>{onChange(current.enabled);setChoice({...current,setId:e.target.value})}} className="w-full min-w-0 rounded border p-2"><option value="">Chọn bộ PUBLISHED</option>{sets?.scope===`${scope}:${current.roadId}`&&sets.rows.map(s=><option key={s.id} value={s.id}>{s.id} · PUBLISHED</option>)}</select>
    <p role={state.error?'alert':'status'} className="break-words text-slate-600">{state.scope===selection?state.text:'Chưa đọc phạm vi đang chọn.'}</p>
    <p className="text-slate-500">Contract chưa bắt buộc các pin hình học cho mọi phương thức. Điều phối không kèm phạm vi không bảo đảm đi tiếp tạo Defect; không tự tạo nhiệm vụ FIELD/DRONE.</p>
  </div>
}
