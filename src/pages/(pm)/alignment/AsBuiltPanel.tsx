import type { usePavementWorkflow } from './usePavementWorkflow'
import type { AsBuiltForm } from './useAsBuiltWorkflow'

export function AsBuiltPanel({ workflow, readOnly }: { workflow: ReturnType<typeof usePavementWorkflow>; readOnly: boolean }) {
  const w = workflow.asBuilt
  if (readOnly) return workflow.snapshot?.kind === 'AS_BUILT' ? <p className="text-xs text-slate-600">Tấm thực tế từ hồ sơ hoàn công — chỉ đọc.</p> : null
  const inputClass = 'w-full min-w-0 rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900'
  const field = (key: keyof AsBuiltForm, title: string) => <label className="min-w-0 text-xs text-slate-600">{title}<input aria-label={title} value={w.form[key]} onChange={e => w.setField(key, e.target.value)} className={inputClass} /></label>
  return <section className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
    <h4 className="text-xs font-bold text-brand-dark">Hoàn công tấm thực tế</h4>
    {!w.active ? <>
      <button type="button" disabled={!w.canStart} onClick={w.start} className="rounded-lg border border-brand-gold p-2 text-xs font-semibold disabled:opacity-50">Tạo bản hoàn công</button>
      {!w.canStart && <p className="text-xs text-slate-600">Chọn PLANNED nguồn đã lưu, đúng tuyến và bộ PUBLISHED; hoàn tất các lệnh đang chờ trước.</p>}
    </> : <>
      <p className="text-xs text-slate-600">PLANNED nguồn chỉ đọc. Chọn tấm thiết kế trên bản đồ để tham chiếu; footprint và số đo thực tế phải nhập riêng, không tự chép thiết kế.</p>
      <p className="break-all text-[10px] text-slate-500">Nguồn: {w.pending?.sourcePlanId || workflow.snapshot?.id}</p>
      <div className="flex gap-2 text-xs">
        <button type="button" aria-pressed={!w.showActual} onClick={() => w.setShowActual(false)} className="rounded-lg border bg-white p-2">Tấm thiết kế</button>
        <button type="button" aria-pressed={w.showActual} onClick={() => w.setShowActual(true)} className="rounded-lg border bg-white p-2">Tấm thực tế ({w.slabs.length})</button>
      </div>
      <fieldset disabled={w.busy || !!w.pending} className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">{field('key', 'Mã tấm thực tế *')}{field('source', 'Nguồn ghi nhận *')}</div>
        <label className="text-xs text-slate-600">Footprint thực tế X Y * (EPSG:{workflow.previewBase?.engineeringSrid || 'chưa đọc'})
          <textarea aria-label="Footprint thực tế X Y" rows={4} value={w.form.footprint} onChange={e => w.setField('footprint', e.target.value)} className={`${inputClass} font-mono`} />
          <span className="text-[10px]">Mỗi dòng một điểm X Y theo hệ tọa độ tuyến. Nhập lại điểm đầu ở cuối để khép vòng.</span>
        </label>
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">{field('lengthMeters', 'Chiều dài thực tế (m)')}{field('widthMeters', 'Chiều rộng thực tế (m)')}</div>
        {field('dimensionUnknownReason', 'Lý do chưa biết kích thước (nếu thiếu số đo)')}
        <details className="text-xs text-slate-600"><summary>Tham chiếu tùy chọn</summary><div className="mt-2 flex flex-col gap-2">{field('plannedSequence', 'Sequence tấm thiết kế (tùy chọn)')}{field('sourceFileId', 'ID tệp nguồn đã VERIFIED (tùy chọn)')}</div></details>
        <div className="flex gap-2"><button type="button" onClick={w.apply} className="rounded-lg border border-brand-gold p-2 text-xs">Áp dụng tấm vào bản hoàn công</button><button type="button" onClick={w.newSlab} className="rounded-lg border bg-white p-2 text-xs">Nhập tấm khác</button></div>
        <div className="flex max-h-44 flex-col gap-1 overflow-auto">{w.slabs.map((slab, i) => <div key={slab.key} className="flex items-center justify-between gap-2 rounded-lg border bg-white p-2 text-xs"><button type="button" onClick={() => w.select(i)} className="min-w-0 break-all text-left">{slab.key} · {slab.lengthMeters == null ? 'Chưa có chiều dài' : `${slab.lengthMeters} m`} × {slab.widthMeters == null ? 'Chưa có chiều rộng' : `${slab.widthMeters} m`}</button><button type="button" aria-label={`Bỏ tấm ${slab.key} khỏi bản nhập`} onClick={() => w.remove(i)}>Bỏ</button></div>)}</div>
        <label className="text-xs text-slate-600">Lý do ghi hoàn công *<textarea aria-label="Lý do ghi hoàn công" rows={2} value={w.reason} onChange={e => w.setReason(e.target.value)} className={inputClass} /></label>
      </fieldset>
      <p className="text-[10px] text-slate-500">Kiểm lại từng tấm và footprint trên bản đồ trước khi lưu. Đây là bản nhập cục bộ, chưa phải dữ liệu máy chủ.</p>
      <button type="button" disabled={w.busy || (!w.pending && !!w.disabledReason) || !!w.pending?.rejected} onClick={() => { void w.save() }} className="rounded-lg border border-brand-gold p-2 text-xs font-semibold disabled:opacity-50">{w.busy ? 'Đang lưu/đọc lại hoàn công…' : w.pending?.receipt ? 'Đọc lại bản hoàn công' : w.pending ? 'Gửi lại đúng lệnh hoàn công' : 'Lưu bản hoàn công'}</button>
      {w.pending?.rejected && <button type="button" disabled={w.busy} onClick={() => { void w.review() }} className="rounded-lg border p-2 text-xs">Đối chiếu và sửa bản nhập</button>}
      {w.pending && <button type="button" disabled={w.busy} onClick={workflow.openAsBuiltSource} className="rounded-lg border p-2 text-xs">Mở PLANNED nguồn của lệnh chờ</button>}
      <button type="button" disabled={w.busy || !!w.pending} onClick={w.cancel} className="rounded-lg border bg-white p-2 text-xs disabled:opacity-50">Đóng bản nhập hoàn công</button>
    </>}
    {(w.error || w.active && !w.pending && w.disabledReason) && <p role="status" className="break-words text-xs text-amber-800">{w.error || w.disabledReason}</p>}
  </section>
}
