import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useRepairWorkspace, repairStates as states, repairResults as results } from '../../components/repair/useRepairWorkspace'
import { RepairItemDrawer } from '../../components/repair/RepairItemDrawer'
import { PolicySection } from './fast-track/PolicySection'
import { FastTrackHeader } from './fast-track/FastTrackHeader'
export function FastTrackWorkspace() {
const navigate=useNavigate(); const s=useRepairWorkspace({fastTrack:true}); const basePath = s.role === 'SUPERVISOR' ? '/sup' : '/pm';
return <div className="space-y-6 pb-16">
      <FastTrackHeader basePath={basePath} isSupervisor={s.role==='SUPERVISOR'} onNavigateDashboard={()=>navigate(`${basePath}/dashboard`)} onOpenPolicyModal={()=>s.setNotice('Chưa hỗ trợ điều chỉnh chính sách tại đây.')} onScrollToDispatch={()=>document.getElementById('dispatch-table-section')?.scrollIntoView({behavior:'smooth'})}/>
      <PolicySection currentPolicy={null} policyHistory={[]} roadCoverage={null} isSupervisor={s.role==='SUPERVISOR'} onOpenPolicyModal={()=>s.setNotice('Chưa hỗ trợ điều chỉnh chính sách tại đây.')}/>
      <section className="bg-white border border-slate-200 rounded-[20px] p-4 flex flex-wrap items-center gap-3">
      <label className="text-sm">Dự án <select aria-label="Dự án sửa chữa" value={s.project} onChange={e => s.setProject(e.target.value)} className="ml-2 border rounded-xl p-2">
      <option value="">Chọn dự án</option>{s.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </label>
      <input aria-label="Tìm trạng thái sửa chữa" value={s.search} onChange={e => s.setSearch(e.target.value)} placeholder="Tìm dự án hoặc trạng thái" className="border rounded-xl px-3 py-2 text-sm"/>
      <button onClick={() => s.setRevision(n => n+1)} className="ml-auto border rounded-xl px-4 py-2 text-sm">Làm mới</button>
      </section>{s.error && <p role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">{s.error}</p>}{s.notice && <p role="status" className="bg-slate-100 rounded-xl p-4 text-sm">{s.notice}</p>}{s.loading && <p>Đang tải hồ sơ…</p>}{!s.loading && !s.error && !s.filtered.length && <div className="bg-white border rounded-[20px] p-12 text-center text-slate-500">Chưa có hồ sơ phù hợp trong CSDL của dự án đang chọn.</div>}    {true && <section className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-3">
      <h2 className="font-bold text-slate-900">Nguồn độ phủ tuyến</h2>
      {s.coverageError && <p role="alert" className="text-red-800 text-sm">{s.coverageError}</p>}
      {s.coverage && <>
      <p className="text-sm">{s.coverage.scopes.length} phạm vi nghĩa vụ · {s.coverage.sources.length} nguồn căn cứ · {s.coverage.history.length} lần xác nhận</p>
        {s.coverage.sources.map((s,i) => <p key={`${s.id}:${i}`} className="text-sm text-amber-900">{s.kind === 'HANDOVER' ? 'Tài liệu bàn giao' : s.kind === 'WARRANTY' ? 'Căn cứ bảo hành' : s.kind === 'MAINTENANCE_BASIS' ? 'Cơ sở bảo trì' : 'Căn cứ từ nguồn'} · {s.provenance === 'SOURCE_NOT_EXTERNALLY_VERIFIED' ? 'Chưa được xác minh từ nguồn bên ngoài' : s.provenance === 'TEST_ONLY' ? 'Chỉ dùng kiểm thử' : 'Cần đối chiếu hồ sơ nguồn trước khi xác nhận'}</p>)}
        {s.coverage.scopes.map((s,i) => <p key={`${s.obligationId}:${i}`} className="border rounded-xl p-3 text-sm">Phạm vi {i+1}: {s.from.toLocaleString('vi-VN')}–{s.to.toLocaleString('vi-VN')} m · Độ lệch {s.offsetFrom.toLocaleString('vi-VN')}–{s.offsetTo.toLocaleString('vi-VN')} m</p>)}
        {!s.coverage.history.length && <p className="text-sm text-slate-500">Chưa có xác nhận độ phủ; không tự điền tài liệu hoặc hạn bảo hành.</p>}
        {s.coverage.history.map(h => <div key={h.id} className="border rounded-xl p-3 text-sm">
      <p>Xác nhận: {new Date(h.confirmedAtUtc).toLocaleString('vi-VN')}</p>
      <p>Hiệu lực: {new Date(h.applicableFromUtc).toLocaleDateString('vi-VN')}–{new Date(h.applicableToUtc).toLocaleDateString('vi-VN')}</p>
      <p>{h.reason || 'Nguồn chưa có lý do riêng.'}</p>{h.provenance === 'TEST_ONLY' && <p className="text-amber-800">Nguồn được hệ thống đánh dấu chỉ dùng kiểm thử.</p>}</div>)}
        <button className="border rounded-xl px-3 py-2 text-sm" onClick={()=>s.setNotice('Chưa hỗ trợ xác nhận độ phủ tại đây.')}>Xem điều kiện xác nhận độ phủ</button>
      </>}
    </section>}
<section id="dispatch-table-section" className="bg-white border rounded-[20px] overflow-hidden">
      <div className="p-5 border-b">
      <h2 className="text-lg font-bold">Điều phối hạng mục xử lý nhanh</h2>
      <p className="text-sm text-slate-500 mt-1">Kiểm tra điều kiện trước khi phân công thi công.</p>
      </div>{s.filtered.map((p,pi) => <div key={p.id} className="p-5 border-b">{p.items.map((item,i) => <div key={item.id} className="flex items-center justify-between gap-4 py-3">
      <div>
      <b>Hạng mục {pi+1}.{i+1}</b>
      <p className="text-sm mt-1">{states[item.state] || item.state}</p>
      </div>
      <button onClick={()=>s.setSelected({pkg:p.id,item})} className="border rounded-xl p-3 text-sm text-[#8C6D1F]">Kiểm tra điều kiện &amp; hồ sơ</button>
      <button className="border rounded-xl p-3 text-sm" onClick={()=>s.setNotice('Chưa hỗ trợ giao việc tại đây. Cần đủ hồ sơ khảo sát và đội thi công trước khi phân công.')}>Phân công đội</button>
      </div>)}</div>)}</section>
      <RepairItemDrawer workspace={s}/>
      </div>
}
