import React from 'react'
import { useParams } from 'react-router-dom'
import { useRepairWorkspace, repairStates as states, repairResults as results } from '../../components/repair/useRepairWorkspace'
import { RepairItemDrawer } from '../../components/repair/RepairItemDrawer'
export function AcceptanceWorkspace() {
const { id, batchId } = useParams(); const s = useRepairWorkspace({acceptance:true,packageId:id || batchId});
const [status, setStatus] = React.useState('ALL'); const items = s.filtered.flatMap(p=>p.items);
return <div className="space-y-6 pb-16">
      <section className="bg-white border rounded-[20px] p-6">
      <p className="text-xs text-slate-500 mb-2">Sửa chữa / Nghiệm thu chất lượng công trình</p>
      <h1 className="text-2xl font-bold">Danh sách hồ sơ chờ nghiệm thu</h1>
      <p className="text-sm text-slate-500 mt-2">Kiểm tra lịch sử thi công, hồ sơ bằng chứng và quyết định nghiệm thu từng hạng mục.</p>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[['ALL','Hồ sơ trong phạm vi'],['Submitted','Chờ PM rà soát'],['Reviewed','Chờ xác nhận cuối'],['Confirmed','Đã xác nhận']].map(([key,label],i)=>
      <button key={key} onClick={()=>setStatus(key)} className={`text-left bg-white rounded-[20px] border p-5 space-y-3 ${status===key?'border-[#C9A227]':'border-slate-200'}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-3xl font-bold ${i===3?'text-emerald-700':'text-slate-900'}`}>{s.loading || s.error ? '—' : items.filter(item=>key==='ALL'||item.state===key).length}</p>
      <span className="text-xs text-slate-400">Xem hồ sơ</span>
      </button>)}</div>
      <section className="bg-white border border-slate-200 rounded-[20px] p-4 flex flex-wrap items-center gap-3">
      <label className="text-sm">Dự án <select aria-label="Dự án sửa chữa" value={s.project} onChange={e => s.setProject(e.target.value)} className="ml-2 border rounded-xl p-2">
      <option value="">Chọn dự án</option>{s.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </label>
      <input aria-label="Tìm trạng thái sửa chữa" value={s.search} onChange={e => s.setSearch(e.target.value)} placeholder="Tìm dự án hoặc trạng thái" className="border rounded-xl px-3 py-2 text-sm"/>
      <button onClick={() => s.setRevision(n => n+1)} className="ml-auto border rounded-xl px-4 py-2 text-sm">Làm mới</button>
      </section>{s.error && <p role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">{s.error}</p>}{s.notice && <p role="status" className="bg-slate-100 rounded-xl p-4 text-sm">{s.notice}</p>}{s.loading && <p>Đang tải hồ sơ…</p>}{!s.loading && !s.error && !s.filtered.length && <div className="bg-white border rounded-[20px] p-12 text-center text-slate-500">Chưa có hồ sơ phù hợp trong CSDL của dự án đang chọn.</div>}<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{s.filtered.flatMap((p,pi) => p.items.filter(item=>status==='ALL'||item.state===status).map((item,i) => <article key={item.id} className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-sm">
      <div className="p-5 border-b bg-slate-50 flex justify-between">
      <b>Hồ sơ {pi+1}.{i+1}</b>
      <span className="text-xs text-slate-500">{item.mode==='FastTrack'?'Xử lý nhanh':'Thông thường'}</span>
      </div>
      <div className="p-5 space-y-4">
      <h2 className="font-bold">{s.projects.find(x=>x.id===p.projectId)?.name}</h2>
      <p className="text-sm text-amber-800">{states[item.state] || item.state}</p>
      <div className="grid grid-cols-2 gap-3">{['Trước thi công','Sau thi công'].map(label => <div key={label} className="border border-dashed rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">{label}<p className="mt-3">Mở hồ sơ để kiểm tra bằng chứng</p>
      </div>)}</div>
      <p className="text-sm">{results[item.result] || item.result}</p>
      <button onClick={() => s.setSelected({pkg:p.id,item})} className="w-full rounded-xl border border-[#C9A227] text-[#8C6D1F] p-3 text-sm font-bold">Kiểm tra hồ sơ nghiệm thu</button>
      </div>
      </article>))}</div>
      <RepairItemDrawer workspace={s}/>
      </div>
}
