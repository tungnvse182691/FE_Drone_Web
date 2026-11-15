import React from 'react'
import { useParams } from 'react-router-dom'
import { useRepairWorkspace, repairStates as states, repairResults as results } from '../../components/repair/useRepairWorkspace'
import { RepairItemDrawer } from '../../components/repair/RepairItemDrawer'
import { ProposalHeader } from './repair-proposals/ProposalHeader'
import { CreateRepairForm } from '../../components/repair/CreateRepairForm'
export function RepairPackagesWorkspace() {
const { id, batchId } = useParams(); const s = useRepairWorkspace({packageId:id || batchId}); const basePath = s.role === 'SUPERVISOR' ? '/sup' : '/pm';
const [status, setStatus] = React.useState('ALL');
return <div className="space-y-6 pb-16">
      <ProposalHeader basePath={basePath} totalPackagesCount={s.packages.length} isPM={s.role==='PROJECT_MANAGER'} projectName={s.projects.find(p => p.id===s.project)?.name} onOpenCreateModal={() => s.setCreating(v => !v)}/>
      <section className="bg-white border border-slate-200 rounded-[20px] p-4 flex flex-wrap items-center gap-3">
      <label className="text-sm">Dự án <select aria-label="Dự án sửa chữa" value={s.project} onChange={e => s.setProject(e.target.value)} className="ml-2 border rounded-xl p-2">
      <option value="">Chọn dự án</option>{s.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </label>
      <input aria-label="Tìm trạng thái sửa chữa" value={s.search} onChange={e => s.setSearch(e.target.value)} placeholder="Tìm dự án hoặc trạng thái" className="border rounded-xl px-3 py-2 text-sm"/>
      <button onClick={() => s.setRevision(n => n+1)} className="ml-auto border rounded-xl px-4 py-2 text-sm">Làm mới</button>
      </section>{s.error && <p role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">{s.error}</p>}{s.notice && <p role="status" className="bg-slate-100 rounded-xl p-4 text-sm">{s.notice}</p>}{s.loading && <p>Đang tải hồ sơ…</p>}{!s.loading && !s.error && !s.filtered.length && <div className="bg-white border rounded-[20px] p-12 text-center text-slate-500">Chưa có hồ sơ phù hợp trong CSDL của dự án đang chọn.</div>}{s.creating && s.project && <CreateRepairForm key={`${s.epoch}:${s.project}`} project={s.project} onCreated={() => {s.setCreating(false); s.setRevision(n => n+1)}}/>}
<div className="flex flex-wrap items-center gap-2">{[['ALL','Tất cả gói'],['AwaitingApproval','Chờ phê duyệt'],['ReadyToAssign','Sẵn sàng giao việc'],['InProgress','Đang thi công'],['Confirmed','Đã xác nhận']].map(([key,label])=>
      <button key={key} onClick={()=>setStatus(key)} className={`px-4 py-2 rounded-full text-xs font-bold border ${status===key?'bg-[#C9A227] border-[#C9A227] text-white':'bg-white border-slate-200 text-slate-600'}`}>{label}</button>)}</div>
      <section className="bg-white border rounded-[20px] overflow-hidden">
      <div className="p-5 border-b flex justify-between">
      <h2 className="font-bold">Danh mục gói công việc</h2>
      <span className="text-sm text-slate-500">{s.filtered.length} gói trong phạm vi đang chọn</span>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
      <thead className="bg-slate-50">
      <tr>{['Gói đề xuất','Hạng mục kỹ thuật','Theo dõi phương án','Thao tác'].map(t => <th key={t} className="p-4">{t}</th>)}</tr>
      </thead>
      <tbody>{s.filtered.filter(p=>status==='ALL'||p.items.some(item=>item.state===status)).map((p,i) => <tr key={p.id} className="border-t align-top">
      <td className="p-4 font-bold">Gói sửa chữa {i+1}<p className="text-xs font-normal text-slate-500 mt-2">{s.projects.find(x => x.id===p.projectId)?.name}</p>
      </td>
      <td className="p-4">{p.items.length} hạng mục</td>
      <td className="p-4">{p.items.map((item,j) => <p key={item.id} className="mb-2">Hạng mục {j+1} · {states[item.state] || item.state}</p>)}{!p.items.length && 'Chưa có đề xuất kỹ thuật'}</td>
      <td className="p-4 space-y-2">{p.items.map((item,j) => <button key={item.id} onClick={() => s.setSelected({pkg:p.id,item})} className="block text-[#8C6D1F] font-semibold">Xem phương án {j+1}</button>)}<button className="block text-slate-500" onClick={() => s.setNotice('Chưa hỗ trợ giao việc tại đây. Cần đủ hồ sơ khảo sát và đội thi công trước khi phân công.')}>Giao việc</button>
      </td>
      </tr>)}</tbody>
      </table>
      </div>
      </section>
      <RepairItemDrawer workspace={s}/>
      </div>
}
