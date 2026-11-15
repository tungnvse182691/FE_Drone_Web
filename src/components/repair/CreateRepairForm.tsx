import React, { useEffect, useState, useRef } from 'react'
import { repairWorkflowService as service, type RepairDraft } from '../../api/services/repairWorkflowService'
import { triageGeometryService, type TriageRouteReference, type TriagePublishedSet } from '../../api/services/triageGeometryService'
import { exportError } from '../../api/services/projectExportService'

export function CreateRepairForm({project, onCreated}: {project: string; onCreated: () => void}) {
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const [defects, setDefects] = useState<Awaited<ReturnType<typeof service.defects>>>([])
  const [routes, setRoutes] = useState<TriageRouteReference[]>([]), [sets, setSets] = useState<TriagePublishedSet[]>([])
  const [defect, setDefect] = useState(''), [set, setSet] = useState('')
  const [values, setValues] = useState({fromMeters: '', toMeters: '', offsetFromMeters: '', offsetToMeters: '', reason: '', repairPlan: '', checklistVersion: ''})
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [held, setHeld] = useState<RepairDraft | null>(null)
  const route = routes.find(r => r.currentVersionId === defects.find(d => d.id === defect)?.roadSectionVersionId)
  useEffect(() => {
    const c = new AbortController()
    setDefects([]); setRoutes([]); setDefect(''); setSet(''); setError(''); setHeld(null)
    try {
      const pending = service.pendingCreation(project)
      if (pending) { setHeld(pending.input); setDefect(pending.input.defectId); setSet(pending.input.segmentSetId); setValues(Object.fromEntries(Object.entries(pending.input).filter(([k]) => ['fromMeters','toMeters','offsetFromMeters','offsetToMeters','reason','repairPlan','checklistVersion'].includes(k)).map(([k,v]) => [k,String(v)])) as typeof values) }
    } catch (e) { setError(exportError(e)) }
    Promise.all([service.defects(project, c.signal), triageGeometryService.routes(project, c.signal)]).then(([d,r]) => { if (!c.signal.aborted) {setDefects(d); setRoutes(r)} }).catch(e => {if (!c.signal.aborted) setError(exportError(e))})
    return () => c.abort()
  }, [project])
  useEffect(() => {
    const c = new AbortController(); setSets([])
    if (route) triageGeometryService.sets(project, route, c.signal).then(data => { if (!c.signal.aborted) setSets(data) }).catch(e => { if (!c.signal.aborted) setError(exportError(e)) })
    return () => c.abort()
  }, [project, route?.currentVersionId])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      if (!held && (!route || !set || Object.values(values).some(v => !v.trim()))) throw new Error('Chọn Defect, bộ phân đoạn đã công bố và nhập đủ thông tin có căn cứ.')
      const input = held || {defectId: defect, physicalRoadId: route!.roadSectionId, routeVersionId: route!.currentVersionId, segmentSetId: set, ...values, fromMeters: Number(values.fromMeters), toMeters: Number(values.toMeters), offsetFromMeters: Number(values.offsetFromMeters), offsetToMeters: Number(values.offsetToMeters)}
      await service.createAndPropose(project, input); if (active.current) onCreated()
    } catch (e) { if (active.current) {setError(exportError(e)); setHeld(service.pendingCreation(project)?.input || null)} } finally {if (active.current) setBusy(false)}
  }
  const labels = {fromMeters: 'Lý trình đầu (m)', toMeters: 'Lý trình cuối (m)', offsetFromMeters: 'Độ lệch đầu (m)', offsetToMeters: 'Độ lệch cuối (m)', reason: 'Lý do và căn cứ phạm vi', repairPlan: 'Phương án sửa chữa', checklistVersion: 'Phiên bản checklist áp dụng'}
  return <form onSubmit={submit} className="bg-white border border-slate-200 rounded-[20px] p-6 space-y-4">
    <h2 className="font-bold text-lg text-slate-900">Tạo gói và đề xuất sửa chữa thông thường</h2>
    <p className="text-xs text-slate-500">Một Defect, một nghĩa vụ sửa chữa bắt buộc. Nhập phạm vi theo hồ sơ kỹ thuật; hệ thống không tự suy lý trình hoặc khối lượng. Không hỗ trợ phạm vi tấm BTXM trong form này.</p>
    {error && <p role="alert" className="text-sm text-red-800 bg-red-50 rounded-xl p-3">{error}</p>}
    {held && <p className="text-xs text-amber-900 bg-amber-50 rounded-xl p-3">Đang giữ yêu cầu trước. Tiếp tục dùng dữ liệu và key cũ; bước nào đã nhận receipt sẽ chỉ đọc lại, không tạo lại.</p>}
    <fieldset disabled={busy || !!held} className="grid gap-4 sm:grid-cols-2 disabled:opacity-60">
      <label className="text-sm">Defect nguồn<select required value={defect} onChange={e => {setDefect(e.target.value); setSet('')}} className="block border rounded-xl p-2 w-full mt-1"><option value="">Chọn Defect</option>{defects.map((d,i) => <option key={d.id} value={d.id}>Defect {i+1} · {d.defectTypeCode || 'Chưa phân loại'} · {d.status || 'Chưa có trạng thái'}</option>)}</select></label>
      <label className="text-sm">Tuyến hiện hành và bộ phân đoạn<select required value={set} onChange={e => setSet(e.target.value)} className="block border rounded-xl p-2 w-full mt-1"><option value="">{route ? route.name || route.code : 'Defect chưa có tuyến hiện hành phù hợp'}</option>{sets.map((r,i) => <option key={r.id} value={r.id}>{route?.name || route?.code} · Bộ công bố {i+1}</option>)}</select></label>
      {Object.entries(labels).map(([name,label]) => <label className="text-sm" key={name}>{label}{['reason','repairPlan'].includes(name) ? <textarea required maxLength={2000} value={values[name as keyof typeof values]} onChange={e => setValues(v => ({...v,[name]: e.target.value}))} className="block w-full border rounded-xl p-2 mt-1" /> : <input required type={name.endsWith('Meters') ? 'number' : 'text'} step={name.endsWith('Meters') ? '0.001' : undefined} value={values[name as keyof typeof values]} onChange={e => setValues(v => ({...v,[name]: e.target.value}))} className="block w-full border rounded-xl p-2 mt-1" />}</label>)}
    </fieldset>
    <button disabled={busy || !project} className="bg-[#C9A227] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">{busy ? 'Đang đối chiếu…' : held ? 'Tiếp tục yêu cầu đang chờ' : 'Tạo gói và đề xuất hạng mục'}</button>
  </form>
}
