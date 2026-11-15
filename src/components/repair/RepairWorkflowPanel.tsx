import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../api/services/projectService'
import { repairWorkflowService as service, type RepairPackage, type RepairItem, type RepairHistory } from '../../api/services/repairWorkflowService'
import { exportError } from '../../api/services/projectExportService'
import { CreateRepairForm } from './CreateRepairForm'

const states: Record<string, string> = { AwaitingApproval: 'Chờ Giám sát phê duyệt', ReadyToAssign: 'Sẵn sàng giao việc', Assigned: 'Đã giao việc', InProgress: 'Đang thi công', Submitted: 'Chờ PM rà soát', Reviewed: 'Chờ xác nhận cuối', Confirmed: 'Đã xác nhận', Cancelled: 'Đã hủy', CorrectionRequired: 'Cần hiệu chỉnh' }
const results: Record<string, string> = { UNREPAIRED: 'Chưa sửa chữa', REPORTED_AWAITING_REVIEW: 'Đã báo cáo, chờ kiểm tra', CONFIRMED: 'Đã xác nhận' }

export function RepairWorkflowPanel({ acceptance = false, fastTrack = false, packageId }: { acceptance?: boolean; fastTrack?: boolean; packageId?: string }) {
  const epoch = useAuthStore(s => s.authEpoch), role = useAuthStore(s => s.user?.role)
  const [projects, setProjects] = useState<Awaited<ReturnType<typeof projectService.fetchProjects>>>([])
  const [project, setProject] = useState(''), [revision, setRevision] = useState(0)
  const [packages, setPackages] = useState<Array<RepairPackage & { items: RepairItem[] }>>([])
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{pkg: string; item: RepairItem} | null>(null)
  const [history, setHistory] = useState<RepairHistory | null>(null), [historyError, setHistoryError] = useState('')
  const [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  const [pendingAction, setPendingAction] = useState<'approve' | 'final-confirmation' | null>(null)
  const [creating, setCreating] = useState(false)
  useEffect(() => {
    let current = true
    setProjects([]); setProject(''); setPackages([]); setSelected(null)
    projectService.fetchProjects().then(rows => { if (current) { setProjects(rows); setProject(rows[0]?.id || '') } }).catch(e => { if (current) setError(exportError(e)) })
    return () => { current = false }
  }, [epoch, role])
  useEffect(() => {
    const c = new AbortController()
    setPackages([]); setSelected(null); setHistory(null); setError(''); setLoading(!!project)
    if (project) (async () => {
      const rows = await service.packages(project, c.signal)
      const detailed = []
      for (const pkg of rows.filter(p => !packageId || p.id === packageId)) detailed.push({ ...pkg, items: await service.items(project, pkg.id, c.signal) })
      if (!c.signal.aborted) setPackages(detailed)
    })().catch(e => { if (!c.signal.aborted) setError(exportError(e)) }).finally(() => { if (!c.signal.aborted) setLoading(false) })
    return () => c.abort()
  }, [project, packageId, revision, epoch, role])
  useEffect(() => {
    const c = new AbortController()
    setHistory(null); setHistoryError(''); setReason(''); setPendingAction(null)
    if (selected) {
      try {
        for (const action of ['approve', 'final-confirmation'] as const) {
          const held = service.pending(project, selected.pkg, selected.item.id, action)
          if (held) { setReason(held.body.reason); setPendingAction(action); break }
        }
      } catch (e) { setHistoryError(exportError(e)) }
      service.history(project, selected.pkg, selected.item.id, c.signal).then(data => { if (!c.signal.aborted) setHistory(data) }).catch(e => { if (!c.signal.aborted) setHistoryError(exportError(e)) })
    }
    return () => c.abort()
  }, [selected, project, epoch, role])
  const decide = async (action: 'approve' | 'final-confirmation') => {
    if (!selected || busy) return
    setBusy(true); setNotice('')
    try {
      await service.decide(project, selected.pkg, selected.item.id, action, reason)
      setNotice('Đã đọc lại hạng mục từ Backend sau quyết định.'); setRevision(n => n + 1)
    } catch (e) { setHistoryError(exportError(e)); setPendingAction(service.pending(project, selected.pkg, selected.item.id, action) ? action : null) } finally { setBusy(false) }
  }
  const currentItem = history?.item || selected?.item
  const canApprove = role === 'SUPERVISOR' && currentItem?.mode === 'Normal' && currentItem.state === 'AwaitingApproval'
  const canConfirm = currentItem?.state === 'Reviewed' && role === (currentItem.mode === 'Normal' ? 'SUPERVISOR' : 'PROJECT_MANAGER')
  const filtered = packages.map(p => ({...p, items: p.items.filter(i => !fastTrack || i.mode === 'FastTrack')})).filter(p => (!fastTrack || p.items.length) && (!search.trim() || projects.find(pr => pr.id === p.projectId)?.name.toLowerCase().includes(search.toLowerCase()) || p.items.some(i => (states[i.state] || i.state).toLowerCase().includes(search.toLowerCase()))))
  const title = fastTrack ? 'Điều phối nhanh' : acceptance ? 'Nghiệm thu sửa chữa' : 'Gói sửa chữa'
  return <div className="space-y-6 pb-16 max-w-[1720px] mx-auto">
    <section className="bg-white border border-[#E2E5E9] rounded-[20px] p-6 space-y-4 shadow-2xs">
      <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900">{title}</h1><p className="text-xs text-slate-500 mt-2">Theo dõi từng nghĩa vụ và hạng mục sửa chữa; phê duyệt, rà soát và xác nhận cuối là các bước riêng.</p></div><button disabled={busy} onClick={() => setRevision(n => n + 1)} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-50">Đọc lại</button></div>
      <div className="flex flex-wrap gap-4"><label className="text-sm">Dự án <select disabled={busy} aria-label="Dự án sửa chữa" value={project} onChange={e => setProject(e.target.value)} className="ml-2 border rounded-xl p-2"><option value="">Chọn dự án</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><input aria-label="Tìm trạng thái sửa chữa" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo dự án hoặc trạng thái" className="border rounded-xl px-3 py-2 text-sm" /></div>
    </section>
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
      <p>Một gói thuộc một Defect. Backend không có thao tác gửi duyệt, duyệt hoặc đóng toàn gói. Không suy tình trạng nghiệm thu từ việc đã giải quyết các nghĩa vụ bắt buộc.</p>
      <p>Tạo gói cần phạm vi vật lý, phiên bản tuyến, lý trình và độ lệch có căn cứ. Giao việc cần nguồn FIELD trước sửa, kế hoạch, Crew và phiên bản hình học; chưa nối đủ nên chưa cho giao việc.</p>
      {acceptance && <p>PM rà soát ACCEPT/SUPPLEMENT sau khi Crew nộp bằng chứng thật. NORMAL do Giám sát xác nhận cuối; Fast Track do PM xác nhận cuối. Chưa có nguồn Crew hợp lệ thì không thể đi tiếp.</p>}
      {fastTrack && <p>Chỉ hiển thị hạng mục Fast Track đã có; không tự kết luận đủ điều kiện từ mức độ hư hỏng. Chính sách và độ phủ cần nguồn đã xác minh; không dùng cấu hình hoặc phạm vi mặc định.</p>}
    </div>
    {role === 'PROJECT_MANAGER' && !acceptance && !fastTrack && project && <button onClick={() => setCreating(v => !v)} className="border border-[#C9A227] text-[#8C6D1F] rounded-xl px-4 py-2 text-sm">{creating ? 'Đóng form tạo gói' : 'Lập gói sửa chữa'}</button>}
    {creating && role === 'PROJECT_MANAGER' && !acceptance && !fastTrack && project && <CreateRepairForm key={`${epoch}:${project}`} project={project} onCreated={() => {setCreating(false); setRevision(n => n+1); setNotice('Đã đọc lại gói và hạng mục đề xuất từ Backend.')}} />}
    {notice && <p role="status" className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm">{notice}</p>}
    {error && <p role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">{error}</p>}
    {loading && <p className="p-6 text-sm">Đang tải gói và hạng mục từ CSDL…</p>}
    {!loading && !error && !filtered.length && <p className="bg-white border rounded-[20px] p-8 text-sm text-slate-500">{project ? 'Chưa có gói/hạng mục phù hợp trong CSDL của dự án đang chọn.' : 'Chọn dự án để đọc hồ sơ.'}</p>}
    {filtered.map((p, pi) => <section key={p.id} className="bg-white border border-[#E2E5E9] rounded-[20px] overflow-hidden shadow-2xs">
      <div className="p-5 border-b bg-slate-50"><h2 className="font-bold text-slate-900">Gói sửa chữa {pi + 1} · {projects.find(pr => pr.id === p.projectId)?.name}</h2><p className="text-xs text-slate-500 mt-2">{p.allMandatoryResolved ? 'Đã giải quyết các nghĩa vụ bắt buộc' : 'Còn nghĩa vụ bắt buộc chưa giải quyết'} · {p.items.length} hạng mục</p></div>
      {!p.items.length ? <p className="p-5 text-sm text-slate-500">Gói chưa có hạng mục. Nguồn danh mục chưa cung cấp đủ nghĩa vụ để lập đề xuất tiếp theo.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-600"><tr>{['Hạng mục', 'Luồng', 'Trạng thái', 'Kết quả', 'Hồ sơ'].map(t => <th key={t} className="p-3">{t}</th>)}</tr></thead><tbody>{p.items.map((item, i) => <tr key={item.id} className="border-t hover:bg-slate-50"><td className="p-3 font-semibold">Hạng mục {i + 1}</td><td>{item.mode === 'Normal' ? 'Thông thường' : item.mode === 'FastTrack' ? 'Xử lý nhanh' : item.mode}</td><td>{states[item.state] || item.state}</td><td>{results[item.result] || item.result}</td><td><button onClick={() => setSelected({pkg: p.id, item})} className="text-[#8C6D1F] font-semibold">Xem lịch sử</button></td></tr>)}</tbody></table></div>}
    </section>)}
    {selected && <div className="fixed inset-0 z-50 bg-slate-900/40 flex justify-end" role="dialog" aria-modal="true" aria-label="Hồ sơ hạng mục sửa chữa"><div className="bg-white w-full max-w-2xl h-full overflow-y-auto p-6 space-y-5 shadow-xl">
      <div className="flex justify-between"><h2 className="font-bold text-lg">Hồ sơ hạng mục</h2><button disabled={busy} onClick={() => setSelected(null)} className="border rounded-lg px-3 py-1">Đóng</button></div>
      <p className="text-sm">{states[currentItem?.state || ''] || currentItem?.state} · {results[currentItem?.result || ''] || currentItem?.result}</p>
      {historyError && <p role="alert" className="text-red-800 bg-red-50 rounded-xl p-3 text-sm">{historyError}</p>}
      {!history && !historyError && <p>Đang đọc lịch sử…</p>}
      {history && <><h3 className="font-semibold">Quyết định đã ghi nhận</h3>{!history.decisions.length && <p className="text-sm text-slate-500">Chưa có quyết định.</p>}{history.decisions.map(d => <div key={d.id} className="border rounded-xl p-3 text-sm"><p>{new Date(d.at).toLocaleString('vi-VN')} · {d.role === 'SUPERVISOR' ? 'Giám sát' : d.role === 'PROJECT_MANAGER' ? 'Chỉ huy trưởng' : d.role}</p><p>{results[d.result] || d.result}</p><p>{d.reason}</p></div>)}
        <h3 className="font-semibold">Lịch sử thi công và bằng chứng</h3>{!history.attempts.length && <p className="text-sm text-slate-500">Chưa có lần thi công được nộp. Không có ảnh Trước/Sau hoặc số đo để đối chiếu.</p>}{history.attempts.map((a, i) => <div key={a.id} className="border rounded-xl p-3 text-sm"><b>Lần thi công {i + 1}</b><p>{a.performed ? 'Đã thi công' : a.unperformedReason || 'Chưa thi công'}</p><p>{a.startedAt ? new Date(a.startedAt).toLocaleString('vi-VN') : 'Chưa có giờ bắt đầu'} → {a.finishedAt ? new Date(a.finishedAt).toLocaleString('vi-VN') : 'Chưa có giờ kết thúc'}</p><p>{a.evidence.length} bằng chứng; {a.evidence.filter(e => e.verified).length} đã xác minh.</p><p className="text-amber-800">Chưa nối trình xem ảnh/bản đo từ nguồn này; cần kiểm tra đủ bằng chứng trước khi xác nhận.</p></div>)}
        <h3 className="font-semibold">Yêu cầu rà soát lại</h3>{history.reviewRequests.length ? history.reviewRequests.map(r => <p key={r.id} className="text-sm">{new Date(r.at).toLocaleString('vi-VN')} · {r.reason}</p>) : <p className="text-sm text-slate-500">Chưa có yêu cầu.</p>}</>}
      {(canApprove || canConfirm || pendingAction) && <div className="space-y-3 border-t pt-4"><label className="block text-sm font-semibold">Lý do quyết định<textarea aria-label="Lý do quyết định sửa chữa" disabled={busy || !!pendingAction} value={reason} onChange={e => setReason(e.target.value)} className="block w-full border rounded-xl p-3 mt-2" /></label>
        {pendingAction && <p className="text-xs text-amber-800">Đang giữ nguyên yêu cầu trước. Đã có receipt thì chỉ đọc lại; chưa rõ kết quả thì dùng lại đúng key, lý do và phiên bản.</p>}
        {canApprove && !pendingAction && <button disabled={busy || !history || !reason.trim()} onClick={() => decide('approve')} className="bg-[#C9A227] text-white px-4 py-2 rounded-xl disabled:opacity-50">Phê duyệt hạng mục</button>}
        {canConfirm && !pendingAction && <p className="text-sm text-amber-800">Chưa cho xác nhận cuối vì trình xem bằng chứng và bản đo chưa nối đủ. Không thể nghiệm thu chỉ dựa vào trạng thái.</p>}
        {pendingAction && <button disabled={busy} onClick={() => decide(pendingAction)} className="border rounded-xl px-4 py-2 disabled:opacity-50">Đối chiếu yêu cầu đang chờ</button>}
      </div>}
    </div></div>}
  </div>
}
