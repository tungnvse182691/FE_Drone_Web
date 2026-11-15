import { SystemControlHeader } from './system-control/SystemControlHeader'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../api/services/projectService'
import { retentionService, type RetentionEvaluation, type RetentionEvaluationDetail } from '../../api/services/retentionService'
import { exportError } from '../../api/services/projectExportService'

const status: Record<string, string> = { QUEUED: 'Chờ đánh giá', RUNNING: 'Đang đánh giá', SUCCEEDED: 'Đánh giá thành công', COMPLETED: 'Hoàn thành', COMPLETE: 'Hoàn thành', FAILED: 'Đánh giá thất bại' }
export const SystemControl: React.FC = () => {
  const isSupervisor = useAuthStore(s => s.user?.role === 'SUPERVISOR')
  const [actionNotice, setActionNotice] = useState('')
  const epoch = useAuthStore(s => s.authEpoch)
  const [projects, setProjects] = useState<Awaited<ReturnType<typeof projectService.fetchProjects>>>([])
  const [project, setProject] = useState(''), [revision, setRevision] = useState(0)
  const [rows, setRows] = useState<RetentionEvaluation[]>([]), [selected, setSelected] = useState('')
  const [detail, setDetail] = useState<RetentionEvaluationDetail | null>(null)
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [detailError, setDetailError] = useState('')
  useEffect(() => {
    let active = true
    setProjects([]); setProject('')
    projectService.fetchProjects().then(data => { if (active) { setProjects(data); setProject(data[0]?.id || '') } }).catch(e => { if (active) setError(exportError(e)) })
    return () => { active = false }
  }, [epoch])
  useEffect(() => {
    const c = new AbortController()
    setRows([]); setSelected(''); setDetail(null); setError(''); setLoading(!!project)
    if (project) retentionService.getRetentionEvaluations(project, c.signal).then(data => { if (!c.signal.aborted) setRows(data) }).catch(e => { if (!c.signal.aborted) setError(exportError(e)) }).finally(() => { if (!c.signal.aborted) setLoading(false) })
    return () => c.abort()
  }, [project, revision, epoch])
  useEffect(() => {
    const c = new AbortController()
    setDetail(null); setDetailError('')
    if (selected) retentionService.getRetentionEvaluationDetail(project, selected, c.signal).then(data => { if (!c.signal.aborted) setDetail(data) }).catch(e => { if (!c.signal.aborted) setDetailError(exportError(e)) })
    return () => c.abort()
  }, [selected, project, revision, epoch])
  return <div className="space-y-6 max-w-7xl mx-auto pb-16">
    <SystemControlHeader isSupervisor={isSupervisor} onOpenCreateDeletion={()=>setActionNotice('Chưa hỗ trợ lập yêu cầu xóa hồ sơ tại đây.')} />
    {actionNotice && <p role="status" className="text-sm text-amber-800">{actionNotice}</p>}
    <section className="flex flex-wrap gap-3 items-center bg-white border rounded-[20px] p-4"><label className="text-sm">Dự án <select aria-label="Dự án lưu trữ" value={project} onChange={e=>setProject(e.target.value)} className="ml-2 border rounded-xl p-2"><option value="">Chọn dự án</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button onClick={()=>setRevision(n=>n+1)} className="ml-auto px-4 py-2 border rounded-xl text-sm">Làm mới</button></section>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"><aside className="lg:col-span-5 bg-white border rounded-[20px] overflow-hidden"><div className="p-5 border-b bg-slate-50"><h2 className="font-bold">Phong tỏa pháp lý</h2><p className="text-xs text-slate-500 mt-2">Bảo vệ hồ sơ phục vụ đối chiếu và thanh tra</p></div><div className="p-5 space-y-4"><h3 className="font-bold">{projects.find(p=>p.id===project)?.name || 'Chọn dự án'}</h3><p className="text-sm text-slate-500">Chưa có thông tin phong tỏa trong kết quả đánh giá. Kiểm tra hồ sơ trước khi thay đổi trạng thái lưu trữ.</p>{isSupervisor && <button onClick={()=>setActionNotice('Chưa hỗ trợ thiết lập hoặc gỡ phong tỏa tại đây.')} className="border rounded-xl px-4 py-2 text-sm">Thiết lập / Gỡ phong tỏa</button>}</div></aside><div className="lg:col-span-7">
    <section className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-4"><h2 className="font-bold text-slate-900">Lịch sử đánh giá lưu trữ</h2>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {loading ? <p>Đang tải đánh giá…</p> : !rows.length && !error ? <p className="text-sm text-slate-500">{project ? 'Chưa có đánh giá lưu trữ trong CSDL.' : 'Chọn dự án để đọc dữ liệu.'}</p> : null}
      {!!rows.length && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Đợt đánh giá', 'Trạng thái', 'Ngày tạo', 'Ngày đánh giá', 'Hồ sơ'].map(t => <th className="p-3" key={t}>{t}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.id} className="border-t"><td className="p-3">Đánh giá {i + 1}</td><td>{status[r.status || ''] || r.status || 'Chưa có trạng thái'}</td><td>{new Date(r.createdAt).toLocaleString('vi-VN')}</td><td>{r.evaluatedAt ? new Date(r.evaluatedAt).toLocaleString('vi-VN') : 'Chưa đánh giá'}</td><td><button onClick={() => setSelected(r.id)} className="text-[#8C6D1F]">Đọc kết quả</button></td></tr>)}</tbody></table></div>}
      {detailError && <p role="alert" className="text-red-700">{detailError}</p>}
      {detail && <div className="space-y-3"><h3 className="font-bold">Kết quả theo tệp</h3>{detail.items.length ? detail.items.map((item, i) => <div key={item.fileId} className="border rounded-xl p-3 text-sm"><b>Tệp {i + 1}</b> · {item.eligibility || 'Chưa đủ thông tin'}<p>{item.reasonCodes?.join(', ') || 'Nguồn chưa cung cấp lý do riêng.'}</p><p>{item.isCurrent ? 'Kết quả hiện hành' : 'Kết quả cần đánh giá lại'}{item.eligibleAfter && ` · Mốc đủ điều kiện: ${new Date(item.eligibleAfter).toLocaleDateString('vi-VN')}`}</p></div>) : <p>Chưa có tệp trong đợt đánh giá này.</p>}{detail.nextCursor && <p className="text-amber-800">Kết quả còn trang tiếp theo; chưa thể coi trang này là toàn bộ hồ sơ.</p>}</div>}
    </section>
    </div></div>
  </div>
}
