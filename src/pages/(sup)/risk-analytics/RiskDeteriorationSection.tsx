import React from 'react'
import type {Rpt06RiskSegment} from './types'
export interface RiskDeteriorationSectionProps {
 loading?:boolean;error?:string;warnings?:string[];hasMapGeometry?:boolean
 segments:Rpt06RiskSegment[];activeSegmentId:string;activeSegment?:Rpt06RiskSegment
 mapContainerRef:React.RefObject<HTMLDivElement|null>;mapLayer:'satellite'|'vector';setMapLayer:(l:'satellite'|'vector')=>void
 onFocusSegment:(segment:Rpt06RiskSegment)=>void;onZoomIn:()=>void;onZoomOut:()=>void;onFitBounds:()=>void;projectName:string
}
export const RiskDeteriorationSection:React.FC<RiskDeteriorationSectionProps>=({loading,error,warnings=[],hasMapGeometry,segments,activeSegmentId,mapContainerRef,mapLayer,setMapLayer,onFocusSegment,onZoomIn,onZoomOut,onFitBounds,projectName})=><section className="space-y-4">
 <header className="bg-white rounded-xl border p-4 flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">Tuyến và phân đoạn</h2><p className="text-xs text-slate-500">{projectName}</p></div><div className="flex gap-2 text-xs"><button onClick={()=>setMapLayer('satellite')} className={`border rounded p-2 ${mapLayer==='satellite'?'bg-amber-50':''}`}>Vệ tinh</button><button onClick={()=>setMapLayer('vector')} className={`border rounded p-2 ${mapLayer==='vector'?'bg-amber-50':''}`}>Bản đồ</button></div></header>
 {error&&<p role="alert" className="text-sm text-rose-800">Không tải được tuyến và phân đoạn. {error}</p>}
 <div className="relative h-[360px] rounded-xl overflow-hidden border bg-slate-100">
  <div ref={mapContainerRef} className={`w-full h-full ${hasMapGeometry?'':'invisible'}`} />
  {!hasMapGeometry&&<div className="absolute inset-0 flex items-center justify-center text-sm p-6 text-slate-600">{loading?'Đang tải bản đồ tuyến…':error?'Chưa thể hiển thị bản đồ.':'Chưa có hình học phù hợp để hiển thị bản đồ tuyến.'}</div>}
  <div className="absolute bottom-4 right-4 flex flex-col gap-2"><button disabled={!hasMapGeometry} onClick={onZoomIn} aria-label="Phóng to" className="bg-white rounded border w-9 h-9 shadow">+</button><button disabled={!hasMapGeometry} onClick={onZoomOut} aria-label="Thu nhỏ" className="bg-white rounded border w-9 h-9 shadow">−</button><button disabled={!hasMapGeometry} onClick={onFitBounds} aria-label="Xem toàn tuyến" className="bg-white rounded border w-9 h-9 shadow">⌖</button></div>
 </div>
 {!!warnings.length&&<details className="text-xs text-slate-600"><summary>Thông tin hiển thị bản đồ</summary>{warnings.map((w,i)=><p key={i}>{w}</p>)}</details>}
 <div className="bg-white border rounded-xl overflow-auto"><h3 className="font-bold text-sm p-4">Phân đoạn {loading?'':`(${segments.length})`}</h3><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Tên đoạn</th><th>Lý trình</th><th>Chiều dài</th><th>Định vị</th></tr></thead><tbody>{loading?<tr><td colSpan={4} className="p-6" role="status">Đang tải phân đoạn…</td></tr>:error?<tr><td colSpan={4} className="p-6">Không tải được phân đoạn.</td></tr>:!segments.length?<tr><td colSpan={4} className="p-6">Chưa có phân đoạn đã công bố trong phạm vi này.</td></tr>:segments.map(s=><tr key={s.id} className={`border-t ${s.id===activeSegmentId?'bg-amber-50':''}`}><td className="p-3">{s.section_name}</td><td>{s.chainage_display}</td><td>{((s.end_km_num-s.start_km_num)*1000).toLocaleString('vi-VN',{maximumFractionDigits:2})} m</td><td><button disabled={s.coordinates.length<2} onClick={()=>onFocusSegment(s)} className="border rounded px-3 py-1 disabled:opacity-40" title={s.coordinates.length<2?'Chưa hỗ trợ hệ tọa độ của đoạn':'Phóng to toàn bộ đoạn'}>Xem đoạn</button></td></tr>)}</tbody></table></div>
</section>
