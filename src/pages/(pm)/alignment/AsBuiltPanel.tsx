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
      {!w.canStart && <p className="text-xs text-slate-600">Chọn thiết kế nguồn đã lưu, đúng tuyến và bộ phân đoạn đã công bố; hoàn tất các lệnh đang chờ trước.</p>}
    </> : <>
      <p className="text-xs text-slate-600">Chọn để đối chiếu chưa thêm vào hoàn công. Chỉ sau khi PM xác nhận mới ghi nhận trong bản nhập; thao tác này không tự đo GPS hoặc kiểm chứng thực tế.</p>
      <details><summary>Chi tiết kỹ thuật</summary><p className="break-all text-[10px] text-slate-500">Mã thiết kế nguồn: {w.pending?.sourcePlanId || workflow.snapshot?.id}</p></details>
      <div className="flex gap-2 text-xs">
        <button type="button" aria-pressed={!w.showActual} onClick={() => w.setShowActual(false)} className="rounded-lg border bg-white p-2">Thiết kế nguồn</button>
        <button type="button" aria-pressed={w.showActual} onClick={() => w.setShowActual(true)} className="rounded-lg border bg-white p-2">Hoàn công đang nhập ({w.slabs.length})</button>
      </div>
      <fieldset disabled={w.busy || !!w.pending} className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
        <label className="text-xs text-slate-600">Nguồn ghi nhận chung *<input aria-label="Nguồn ghi nhận chung" value={w.captureSource} onChange={e=>w.setCaptureSource(e.target.value)} className={inputClass} /></label>
        <label className="text-xs text-slate-600">Tấm thiết kế để xem<select aria-label="Tấm thiết kế để xem" value={w.focusedPlanKey} onChange={e=>w.focusDesign(e.target.value)} className={inputClass}><option value="">Chọn tấm trên bản đồ hoặc danh sách</option>{w.plannedSlabs.map(s=><option key={s.key} value={s.key}>{s.key} · {s.lengthMeters ?? 'chưa có'} × {s.widthMeters ?? 'chưa có'} m</option>)}</select></label>
        <div className="flex flex-wrap gap-2"><button type="button" disabled={!w.focusedPlanKey} onClick={()=>w.toggleDesign(w.focusedPlanKey)} className="rounded-lg border bg-white p-2 text-xs">{w.selectedKeys.includes(w.focusedPlanKey)?'Bỏ chọn tấm đang xem':'Chọn tấm đang xem'}</button><button type="button" onClick={w.chooseAll} className="rounded-lg border bg-white p-2 text-xs">Chọn toàn bộ thiết kế nguồn</button><button type="button" onClick={w.clearSelection} className="rounded-lg border bg-white p-2 text-xs">Bỏ chọn tất cả</button></div>
        <select aria-label="Chọn theo phân đoạn server" defaultValue="" disabled={!w.ranges?.length} onChange={e=>{if(e.target.value)w.chooseSegment(e.target.value);e.target.value=''}} className={inputClass}><option value="">Chọn tấm nằm trọn trong phân đoạn</option>{w.ranges?.map(s=><option key={s.id} value={s.id}>Đoạn {s.sequence} · offset {s.fromOffsetMeters}–{s.toOffsetMeters} m</option>)}</select>
        {!w.ranges?.length&&<p className="text-xs text-slate-500">Chưa có quan hệ phân đoạn server để chọn theo phạm vi; không suy lý trình từ WGS84.</p>}
        <p className="text-xs font-semibold">Đang chọn {w.selectedKeys.length} tấm thiết kế. Chưa xác nhận thì chưa thêm vào hoàn công.</p>
        {w.selectedKeys.length>0&&<details className="text-xs"><summary>Xem {w.selectedKeys.length} tấm đã chọn</summary><div className="max-h-24 overflow-auto break-words">{w.selectedKeys.join(', ')}</div></details>}
        {w.selectedKeys.length>0&&(!w.captureSource.trim()||w.captureSource.length>80)&&<p className="text-xs text-amber-800">Nhập nguồn ghi nhận chung từ 1–80 ký tự trước khi xác nhận.</p>}
        <button type="button" disabled={!w.selectedKeys.length || !w.captureSource.trim() || w.captureSource.length>80 || w.dirty} onClick={w.confirmSelected} className="rounded-lg border border-brand-gold p-2 text-xs font-semibold">Xác nhận các tấm đã chọn phù hợp thực tế</button>
        <button type="button" disabled={!w.focusedPlanKey} onClick={w.editDesign} className="rounded-lg border bg-white p-2 text-xs">Chỉnh riêng tấm đang xem</button>
        <p className="text-xs font-semibold">Đã ghi nhận {w.slabs.length} tấm trong bản nhập chưa lưu</p>
        <div className="flex max-h-44 flex-col gap-1 overflow-auto">{w.slabs.map((slab,i)=><div key={slab.key} className="flex items-center justify-between gap-2 rounded-lg border bg-white p-2 text-xs"><button type="button" onClick={()=>w.select(i)} className="min-w-0 break-all text-left">{slab.key} · {slab.lengthMeters==null?'Chưa có chiều dài':`${slab.lengthMeters} m`} × {slab.widthMeters==null?'Chưa có chiều rộng':`${slab.widthMeters} m`}</button><button type="button" aria-label={`Bỏ tấm ${slab.key} khỏi bản nhập`} onClick={()=>w.remove(i)}>Bỏ</button></div>)}</div>
        <details open={w.dirty || w.vertexEditing || w.drawing || !!w.form.key} className="text-xs text-slate-600"><summary>Tấm ngoại lệ / tấm phát sinh</summary><div className="mt-2 flex min-w-0 flex-col gap-2">
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">{field('key','Mã tấm thực tế *')}{field('source','Nguồn ghi nhận tấm *')}</div>
          <p>Đường bao trên bản đồ · EPSG:{w.mapCrs ?? 'chưa đọc'} · {w.drawing?w.candidatePoints.length:Math.max(0,w.candidatePoints.length-1)} đỉnh. Chưa Áp dụng thì chưa thay tấm đã ghi nhận.</p>
          {!w.mapSupported&&<p>Chưa hỗ trợ vẽ/chỉnh CRS này; không dùng longitude/latitude làm footprint X/Y.</p>}
          <div className="flex flex-wrap gap-2"><button type="button" disabled={!w.mapSupported} onClick={w.beginDraw} className="rounded-lg border bg-white p-2">Vẽ tấm phát sinh trên bản đồ</button><button type="button" disabled={!w.mapSupported || w.candidatePoints.length<4 || w.drawing} onClick={w.beginVertices} className="rounded-lg border bg-white p-2">Chỉnh đỉnh trên bản đồ</button>{w.drawing&&<button type="button" onClick={w.finishDraw} className="rounded-lg border border-brand-gold p-2">Kết thúc đường bao</button>}{w.vertexEditing&&<button type="button" onClick={w.stopMapEdit} className="rounded-lg border bg-white p-2">Dừng chỉnh bản đồ</button>}</div>
          {w.vertexEditing&&<label>Đỉnh cần chỉnh<select aria-label="Đỉnh cần chỉnh" value={w.activeVertex} onChange={e=>w.selectVertex(Number(e.target.value))} className={inputClass}>{w.candidatePoints.slice(0,-1).map((_,i)=><option key={i} value={i}>Đỉnh {i+1}</option>)}</select></label>}
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">{field('lengthMeters','Chiều dài thực tế (m)')}{field('widthMeters','Chiều rộng thực tế (m)')}</div>
          {field('dimensionUnknownReason','Lý do chưa biết kích thước (nếu thiếu số đo)')}
          <details><summary>Tham chiếu tùy chọn</summary><div className="mt-2 flex flex-col gap-2">{field('plannedSequence','Sequence tấm thiết kế (tùy chọn)')}{field('sourceFileId','ID tệp nguồn đã VERIFIED (tùy chọn)')}</div></details>
          <div className="flex gap-2"><button type="button" disabled={w.drawing || w.candidatePoints.length<4} onClick={w.apply} className="rounded-lg border border-brand-gold p-2">Áp dụng tấm ngoại lệ</button><button type="button" onClick={w.newSlab} className="rounded-lg border bg-white p-2">Hủy chỉnh tấm</button></div>
        </div></details>
        <label className="text-xs text-slate-600">Lý do ghi hoàn công *<textarea aria-label="Lý do ghi hoàn công" rows={2} value={w.reason} onChange={e=>w.setReason(e.target.value)} className={inputClass} /></label>
      </fieldset>
      <p className="text-[10px] text-slate-500">Kiểm lại từng tấm và footprint trên bản đồ trước khi lưu. Đây là bản nhập cục bộ, chưa phải dữ liệu máy chủ.</p>
      <button type="button" disabled={w.busy || (!w.pending && !!w.disabledReason) || !!w.pending?.rejected} onClick={() => { void w.save() }} className="rounded-lg border border-brand-gold p-2 text-xs font-semibold disabled:opacity-50">{w.busy ? 'Đang lưu/đọc lại hoàn công…' : w.pending?.receipt ? 'Đọc lại bản hoàn công' : w.pending ? 'Gửi lại đúng lệnh hoàn công' : 'Lưu bản hoàn công'}</button>
      {w.pending?.rejected && <button type="button" disabled={w.busy} onClick={() => { void w.review() }} className="rounded-lg border p-2 text-xs">Đối chiếu và sửa bản nhập</button>}
      {w.pending && <button type="button" disabled={w.busy} onClick={workflow.openAsBuiltSource} className="rounded-lg border p-2 text-xs">Mở thiết kế nguồn của yêu cầu đang chờ</button>}
      <button type="button" disabled={w.busy || !!w.pending} onClick={w.cancel} className="rounded-lg border bg-white p-2 text-xs disabled:opacity-50">Đóng bản nhập hoàn công</button>
    </>}
    {(w.error || w.active && !w.pending && w.disabledReason) && <p role="status" className="break-words text-xs text-amber-800">{w.error || w.disabledReason}</p>}
  </section>
}
