import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../api/services/projectService'
import { validationService, type AiMockRun, type AiRunResult } from '../../api/services/validationService'
import { projectReportingService, type ReportItem } from '../../api/services/projectReportingService'
import { exportError } from '../../api/services/projectExportService'

const statuses: Record<string, string> = { QUEUED: 'Chờ xử lý', RUNNING: 'Đang xử lý', SUCCEEDED: 'Thành công', FAILED: 'Thất bại', COMPLETED: 'Hoàn thành' }
export const ResearchValidation: React.FC = () => {
  const epoch = useAuthStore(s => s.authEpoch)
  const [projects, setProjects] = useState<Awaited<ReturnType<typeof projectService.fetchProjects>>>([])
  const [project, setProject] = useState(''), [revision, setRevision] = useState(0)
  const [runs, setRuns] = useState<AiMockRun[]>([]), [metrics, setMetrics] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [metricError, setMetricError] = useState('')
  const [notice, setNotice] = useState(''), [selected, setSelected] = useState(''), [result, setResult] = useState<AiRunResult | null>(null), [resultError, setResultError] = useState('')
  useEffect(() => {
    let active = true
    setProjects([]); setProject('')
    projectService.fetchProjects().then(rows => { if (active) { setProjects(rows); setProject(rows[0]?.id || '') } }).catch(e => { if (active) setError(exportError(e)) })
    return () => { active = false }
  }, [epoch])
  useEffect(() => {
    const controller = new AbortController()
    setRuns([]); setMetrics([]); setResult(null); setSelected(''); setError(''); setMetricError(''); setNotice(''); setLoading(!!project)
    if (project) {
      validationService.getAiMockRuns(project, controller.signal).then(rows => { if (!controller.signal.aborted) setRuns(rows) }).catch(e => { if (!controller.signal.aborted) setError(exportError(e)) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
      projectReportingService.items(project, 'validationMetrics', {}, controller.signal).then(data => {
        if (!controller.signal.aborted) { setMetrics(data.items); setNotice(data.availability.availability === 'AVAILABLE' ? '' : 'Nguồn kết quả kiểm định hiện chưa đầy đủ.') }
      }).catch(e => { if (!controller.signal.aborted) setMetricError(exportError(e)) })
    }
    return () => controller.abort()
  }, [project, revision, epoch])
  useEffect(() => {
    const controller = new AbortController()
    setResult(null); setResultError('')
    if (selected) validationService.getAiMockRunResult(project, selected, controller.signal).then(data => { if (!controller.signal.aborted) setResult(data) }).catch(e => { if (!controller.signal.aborted) setResultError(exportError(e)) })
    return () => controller.abort()
  }, [project, selected, revision, epoch])
  return <div className="space-y-6 max-w-7xl mx-auto pb-16">
    <section className="bg-white border border-slate-200 rounded-[20px] p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900">Thực nghiệm AI và đối soát thực địa</h1><p className="text-xs text-slate-500 mt-2">Kết quả từng lần chạy; Bias, MAE, RMSE và đơn vị do Backend cung cấp.</p></div>
        <button onClick={() => setRevision(n => n + 1)} className="px-4 py-2 border rounded-xl text-sm">Đọc lại</button></div>
      <label className="text-sm">Dự án <select aria-label="Dự án thực nghiệm" value={project} onChange={e => setProject(e.target.value)} className="ml-3 border rounded-xl p-2"><option value="">Chọn dự án</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    </section>
    <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">Chưa thể tạo đợt AI/kiểm định hoặc đọc kết quả AI bằng phiên Web ở revision Backend hiện tại. Chức năng sẽ báo lỗi xác thực khi đọc chi tiết; không mô phỏng tiến trình hoặc tự sinh mẫu. Xuất hồ sơ tại Báo cáo KPI.</p>
    <section className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-4"><h2 className="font-bold text-slate-900">Các lần chạy AI</h2>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {loading ? <p>Đang tải các lần chạy…</p> : !runs.length && !error ? <p className="text-sm text-slate-500">{project ? 'Chưa có lần chạy AI trong CSDL.' : 'Chọn dự án để đọc dữ liệu.'}</p> : null}
      {!!runs.length && <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr>{['Lần chạy', 'Giai đoạn', 'Chế độ', 'Trạng thái', 'Kết quả'].map(t => <th key={t} className="p-3">{t}</th>)}</tr></thead><tbody>{runs.map((r, i) => <tr key={r.id} className="border-t"><td className="p-3">Lần chạy {i + 1}</td><td>{r.stage === 'VIDEO_ANALYSIS' ? 'Phân tích video' : r.stage === 'DUPLICATE_MATCHING' ? 'Đối chiếu trùng lặp' : 'Chưa có thông tin'}</td><td>{r.mode === 'MOCK' ? 'Dữ liệu thực nghiệm' : r.mode || 'Chưa có thông tin'}</td><td>{statuses[r.status || ''] || r.status || 'Chưa có trạng thái'}{r.errorCode && <p className="text-red-700">Lỗi: {r.errorCode}</p>}</td><td><button disabled={!r.resultId} onClick={() => setSelected(r.id)} className="text-[#8C6D1F] disabled:text-slate-400">Đọc kết quả</button></td></tr>)}</tbody></table></div>}
      {resultError && <p role="alert" className="text-red-700">{resultError}</p>}
      {result && <div className="border rounded-xl p-4 text-sm">Hoàn thành: {new Date(result.completedAt).toLocaleString('vi-VN')} · {result.detections?.length ?? 'Chưa có'} phát hiện · {result.matches?.length ?? 'Chưa có'} đối chiếu</div>}
    </section>
    <section className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-4"><h2 className="font-bold text-slate-900">Kết quả đối soát từ nguồn báo cáo</h2>
      {metricError && <p role="alert" className="text-red-700">{metricError}</p>}{notice && <p className="text-amber-800 text-sm">{notice}</p>}
      {!metrics.length ? <p className="text-sm text-slate-500">Chưa có kết quả kiểm định để hiển thị; không suy thành sai số bằng 0.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr>{['Lần kiểm định', 'Loại số đo', 'Đơn vị', 'Mẫu dùng', 'Mẫu loại', 'Bias', 'MAE', 'RMSE'].map(t => <th key={t} className="p-3">{t}</th>)}</tr></thead><tbody>{metrics.map((m, i) => <tr key={m.id} className="border-t"><td className="p-3">Lần {i + 1}</td><td>{m.measurementType || 'Chưa có thông tin'}</td><td>{m.unit || '—'}</td>{[m.used, m.excluded, m.bias, m.mae, m.rmse].map((v, j) => <td key={j}>{v == null ? '—' : v.toLocaleString('vi-VN')}</td>)}</tr>)}</tbody></table></div>}
    </section>
  </div>
}
export default ResearchValidation
