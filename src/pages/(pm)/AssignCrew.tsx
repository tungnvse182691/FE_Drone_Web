import React, { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { repairService, AssignableRepairItem } from '../../api/services/repairService'
import { fastTrackService } from '../../api/services/fastTrackService'
import { fastTrackFormSources, type FastTrackSource } from '../../api/services/fastTrackFormSources'
import { Users2, Calendar, ShieldAlert, ClipboardCheck, Smartphone, CheckCircle2 } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

export const AssignCrew: React.FC = () => {
  const toast = useToastStore()
  const submitGuard = useSubmitGuard()
  const [items, setItems] = useState<AssignableRepairItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedItemKey, setSelectedItemKey] = useState('')
  const [crews, setCrews] = useState<Array<{ id: string; name: string }>>([])
  const [crewId, setCrewId] = useState('')
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10))
  // Nguồn khuyết tật lấy từ Defect/hạng mục qua GET (source-defect + dataset), không mặc định REPORTER và không nhập tay surveyId.
  const [src, setSrc] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; sources: FastTrackSource[]; issues: string[] }>({ status: 'idle', sources: [], issues: [] })
  const [srcId, setSrcId] = useState('')
  const srcSeq = useRef(0)
  const [result, setResult] = useState<null | { itemCode: string; crewName: string; taskId: string; projectId: string; state: 'confirmed' | 'pending'; note?: string; itemId: string; packageId: string }>(null)
  const [copied, setCopied] = useState(false)
  const [safetyNotes, setSafetyNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Điều hướng từ danh sách/modal gói: ?projectId=&packageId=&itemId= → chọn sẵn hạng mục, không bắt nhập tay.
  const [params] = useSearchParams()
  const preselected = useRef(false)
  const [navNote, setNavNote] = useState('')

  const errText = (err: unknown): string => {
    const e = err as { response?: { status?: number; data?: { detail?: string; title?: string; code?: string } }; message?: string }
    const detail = e?.response?.data?.detail || e?.response?.data?.title || e?.response?.data?.code || e?.message || 'Lỗi không xác định'
    return e?.response?.status ? `HTTP ${e.response.status}: ${detail}` : detail
  }

  const loadItems = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      setItems(await repairService.fetchAssignableItems())
    } catch (err) {
      setLoadError(errText(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    if (isLoading || preselected.current) return
    const pid = params.get('projectId'), pkg = params.get('packageId'), iid = params.get('itemId')
    if (!pid) return
    preselected.current = true
    if (loadError) return
    const pool = items.filter((it) => it.projectId === pid && (!pkg || it.packageId === pkg) && (!iid || it.itemId === iid) && it.mode === 'Normal')
    if (pool.length === 1) { setSelectedItemKey(`${pool[0].projectId}:${pool[0].itemId}`); setNavNote('') }
    else if (pool.length === 0) setNavNote('Hạng mục được chọn không còn ở trạng thái chờ giao (ReadyToAssign) hoặc không phải hạng mục Normal.')
    else setNavNote('Gói có nhiều hạng mục chờ giao — chọn hạng mục cần giao trong danh sách.')
  }, [isLoading, items, params, loadError])

  const selected = items.find((it) => `${it.projectId}:${it.itemId}` === selectedItemKey) || null

  useEffect(() => {
    setCrews([])
    setCrewId('')
    if (!selected) return
    let active = true
    fastTrackService
      .getCrews(selected.projectId)
      .then((rows) => { if (active) setCrews(rows.map((c) => ({ id: c.id, name: c.name }))) })
      .catch((err) => { if (active) toast.error('Không tải được danh sách đội thi công: ' + errText(err)) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemKey])

  useEffect(() => {
    const my = ++srcSeq.current
    setSrcId('')
    if (!selected) { setSrc({ status: 'idle', sources: [], issues: [] }); return }
    setSrc({ status: 'loading', sources: [], issues: [] })
    fastTrackFormSources.derive({ projectId: selected.projectId, defectId: selected.defectId, packageId: selected.packageId, itemId: selected.itemId, obligationId: selected.obligationId })
      .then((r) => { if (srcSeq.current !== my) return; setSrc({ status: r.sources.length ? 'ready' : 'error', sources: r.sources, issues: r.issues }); if (r.sources.length === 1) setSrcId(r.sources[0].id) })
      .catch((err) => { if (srcSeq.current === my) setSrc({ status: 'error', sources: [], issues: [errText(err)] }) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemKey])
  const chosenSource = src.sources.find((x) => x.id === srcId) || null

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return toast.error('Chọn hạng mục cần giao việc.')
    if (selected.mode !== 'Normal') return toast.error('Hạng mục Fast Track được giao ở màn Điều phối nhanh.')
    if (!crewId) return toast.error('Chọn đội thi công.')
    if (!safetyNotes.trim()) return toast.error('Nhập chỉ dẫn và biện pháp an toàn giao thông.')
    const due = new Date(deadline + 'T23:59:59')
    if (!Number.isFinite(due.getTime()) || due.getTime() <= Date.now()) return toast.error('Hạn hoàn thành phải ở tương lai.')
    if (!chosenSource) return toast.error(src.status === 'ready' ? 'Chọn nguồn khuyết tật hợp lệ do máy chủ xác định.' : 'Chưa xác định được nguồn khuyết tật của hạng mục; không thể giao việc.')
    if (result?.state === 'pending' && result.itemId === selected.itemId) return toast.error('Lệnh giao trước đó chưa đối chiếu xong; bấm "Đối chiếu lại" thay vì gửi lệnh mới.')
    if (!submitGuard.acquire()) return
    try {
      setSubmitting(true)
      const crewName = crews.find((c) => c.id === crewId)?.name || 'Crew đã chọn'
      const out = await repairService.assignNormalItem({
        projectId: selected.projectId,
        packageId: selected.packageId,
        itemId: selected.itemId,
        defectId: selected.defectId,
        crewId,
        dueAt: due.toISOString(),
        instructions: safetyNotes.trim(),
        sourceKind: chosenSource.pins.sourceKind as 'REPORTER' | 'SURVEY',
        surveyId: chosenSource.pins.surveyId || undefined,
        pins: { segmentSetId: chosenSource.pins.segmentSetId ?? null, layoutRevisionId: chosenSource.pins.layoutRevisionId ?? null, slabId: chosenSource.pins.slabId ?? null, mapPublicationId: chosenSource.pins.mapPublicationId ?? null, crsProfileRevisionId: chosenSource.pins.crsProfileRevisionId ?? null },
      })
      setResult({ itemCode: selected.itemCode, crewName, taskId: out.taskId, projectId: selected.projectId, state: 'confirmed', itemId: selected.itemId, packageId: selected.packageId })
      toast.success(`Đã giao ${selected.itemCode} cho ${crewName}.`)
      setSelectedItemKey('')
      setSafetyNotes('')
      await loadItems()
    } catch (err) {
      const pend = err as { taskId?: string; pendingReconcile?: boolean; message?: string }
      if (pend.pendingReconcile && pend.taskId) {
        setResult({ itemCode: selected.itemCode, crewName: crews.find((c) => c.id === crewId)?.name || 'Crew đã chọn', taskId: pend.taskId, projectId: selected.projectId, state: 'pending', note: pend.message, itemId: selected.itemId, packageId: selected.packageId })
        toast.warning(`Đã gửi giao ${selected.itemCode}; chờ đối chiếu kết quả.`)
      } else toast.error('Không giao được việc: ' + errText(err))
    } finally {
      submitGuard.release()
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Phân Công Đội Thi Công
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chỉ định tổ đội thi công hiện trường thực hiện đợt sửa chữa đã được phê duyệt
        </p>
      </div>

      {result && (
        <div data-testid="assign-result" className={`p-4 rounded-xl border text-xs ${result.state === 'confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <p role="status" className="font-semibold">{result.state === 'confirmed' ? `Đã giao ${result.itemCode} cho ${result.crewName}.` : `Đã gửi lệnh giao ${result.itemCode} cho ${result.crewName} nhưng chưa xác nhận được kết quả — cần đối chiếu.`}</p>
          {result.note && <p className="mt-1 break-words">{result.note}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {result.state === 'confirmed' && <Link data-testid="assign-view-task" to={`/pm/field-tasks?tab=MEASUREMENTS&projectId=${result.projectId}&highlightCode=${result.taskId}`} className="font-semibold underline">Xem nhiệm vụ</Link>}
            {result.state === 'pending' && <button type="button" className="font-semibold underline" onClick={async () => { try { await repairService.readAssignment(result.projectId, result.packageId, result.itemId, result.taskId); setResult({ ...result, state: 'confirmed', note: undefined }); toast.success(`Đã giao ${result.itemCode} cho ${result.crewName}.`); await loadItems() } catch (err) { toast.error('Chưa đối chiếu được: ' + errText(err)) } }}>Đối chiếu lại</button>}
            <button type="button" className="underline" onClick={() => setResult(null)}>Ẩn</button>
          </div>
          <details className="mt-2"><summary className="cursor-pointer">Chi tiết</summary><div className="mt-1 flex flex-wrap items-center gap-2 font-mono break-all"><span data-testid="assign-task-id">Mã nhiệm vụ: {result.taskId}</span><button type="button" className="rounded border border-current px-2 py-0.5 font-sans" onClick={() => { void navigator.clipboard?.writeText(result.taskId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => toast.error('Không sao chép được; chọn và sao chép thủ công.')) }}>{copied ? 'Đã sao chép' : 'Sao chép mã'}</button></div></details>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Cột trái: Card Form phân công */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleAssign} className="space-y-4">
              {loadError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  Không tải được hạng mục chờ giao việc: {loadError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hạng Mục Cần Giao Việc
                </label>
                <select
                  value={selectedItemKey}
                  onChange={(e) => setSelectedItemKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
                >
                  <option value="">{isLoading ? 'Đang tải...' : '— Chọn hạng mục chờ giao việc —'}</option>
                  {items.map((it) => (
                    <option key={`${it.projectId}:${it.itemId}`} value={`${it.projectId}:${it.itemId}`}>
                      {it.projectName} • {it.packageCode} • {it.itemCode} ({it.mode})
                    </option>
                  ))}
                </select>
                {navNote && <p role="status" className="text-[11px] text-amber-700 mt-1">{navNote}</p>}
                {!isLoading && !loadError && items.length === 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Không có hạng mục nào chờ giao việc trong CSDL. Hạng mục thường cần Giám sát duyệt trước khi giao.
                  </p>
                )}
                {selected && selected.mode !== 'Normal' && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Hạng mục Fast Track được giao ở màn Điều phối nhanh (cần chính sách đã công bố), không giao ở đây.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chỉ Định Đội Thi Công
                </label>
                <select
                  value={crewId}
                  onChange={(e) => setCrewId(e.target.value)}
                  disabled={!selected}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
                >
                  <option value="">{selected ? '— Chọn đội thi công —' : 'Chọn hạng mục trước'}</option>
                  {crews.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {selected && crews.length === 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">Dự án chưa có thành viên Crew còn hiệu lực.</p>
                )}
              </div>

              <InputField
                label="Hạn Chót Hoàn Thành"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nguồn Khuyết Tật
                </label>
                {!selected && <p className="text-[11px] text-slate-500">Chọn hạng mục để đọc nguồn khuyết tật từ máy chủ.</p>}
                {src.status === 'loading' && <p role="status" className="text-[11px] text-slate-500">Đang đọc nguồn khuyết tật từ máy chủ…</p>}
                {src.status === 'ready' && src.sources.length === 1 && (
                  <input readOnly aria-label="Nguồn khuyết tật" data-testid="assign-source" value={src.sources[0].label} className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-brand-border rounded-lg text-slate-700" />
                )}
                {src.status === 'ready' && src.sources.length > 1 && (
                  <select aria-label="Nguồn khuyết tật" data-testid="assign-source" value={srcId} onChange={(e) => setSrcId(e.target.value)} className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer">
                    <option value="">— Chọn nguồn khuyết tật —</option>
                    {src.sources.map((x) => (<option key={x.id} value={x.id}>{x.label}</option>))}
                  </select>
                )}
                {src.status === 'error' && (
                  <div role="alert" data-testid="assign-source-error" className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                    Không xác định được nguồn khuyết tật của hạng mục nên khóa giao việc: {src.issues.join(' · ') || 'máy chủ không trả nguồn.'}
                  </div>
                )}
                {src.status === 'ready' && src.issues.length > 0 && <p className="text-[11px] text-amber-700 mt-1">{src.issues.join(' · ')}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Biện Pháp Đảm Bảo An Toàn Giao Thông
                </label>
                <textarea
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  rows={3}
                  placeholder="Chỉ dẫn thi công và biện pháp an toàn giao thông..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <Button type="submit" disabled={submitting || !selected || !chosenSource} className="w-full mt-4" size="lg" icon={<Users2 className="w-4 h-4" />}>
                Ban Hành Lệnh Giao Việc
              </Button>
            </form>
          </Card>
        </div>

        {/* Cột phải: Panel hướng dẫn quy trình phân công */}
        <div className="space-y-4">
          <Card className="p-5 border border-slate-200 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-800 mb-3.5 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Các bước phân công hiện trường</span>
            </h3>

            <ol className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-800 block text-xs font-semibold">Chọn đội chuyên môn</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Chỉ định tổ đội có năng lực kỹ thuật và trang thiết bị phù hợp với tính chất hư hỏng mặt đường.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-800 block text-xs font-semibold">Đồng bộ qua ứng dụng di động</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Lệnh giao việc cùng tọa độ GPS và yêu cầu kỹ thuật được chuyển ngay đến điện thoại tổ trưởng.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-800 block text-xs font-semibold">Ghi nhận và nghiệm thu</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Tổ đội chụp ảnh trước/sau và lập nhật ký thi công để chuyển sang khâu nghiệm thu chất lượng.
                  </span>
                </div>
              </li>
            </ol>
          </Card>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block mb-0.5">Lưu ý an toàn thi công:</strong>
              Mọi vị trí thi công trên tuyến bắt buộc phải bố trí biển báo cảnh báo từ xa tối thiểu 150m và có người phân luồng giao thông.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
