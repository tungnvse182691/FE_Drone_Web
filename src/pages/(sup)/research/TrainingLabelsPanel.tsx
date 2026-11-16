import React, { useCallback, useEffect, useState } from 'react'
import { trainingLabelService, type AiDetection, type LabelBox, type TrainingLabel } from '../../../api/services/trainingLabelService'
import { exportError } from '../../../api/services/projectExportService'

const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Bị từ chối' }
const num = (v: string) => (v.trim() === '' ? Number.NaN : Number(v))

/**
 * PM: gán nhãn huấn luyện AI trên khung hình của phát hiện AI (spec PM-05).
 * Dữ liệu từ BE: ai-mock-runs → detections; nhãn qua /labels. BE bắt buộc vai trò PM (Giám sát không đọc được).
 */
export const TrainingLabelsPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [detections, setDetections] = useState<AiDetection[]>([])
  const [labels, setLabels] = useState<TrainingLabel[]>([])
  const [loading, setLoading] = useState(false)
  const [detectionId, setDetectionId] = useState('')
  const [editId, setEditId] = useState('')
  const [box, setBox] = useState({ x: '', y: '', width: '', height: '' })
  const [typeCode, setTypeCode] = useState('')
  const [reason, setReason] = useState('')
  const [reviewReason, setReviewReason] = useState<Record<string, string>>({})
  const [frame, setFrame] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true); setError('')
    try {
      const [d, l] = await Promise.all([trainingLabelService.detections(projectId), trainingLabelService.list(projectId)])
      setDetections(d); setLabels(l)
    } catch (e) { setError(exportError(e)) } finally { setLoading(false) }
  }, [projectId])
  useEffect(() => { setDetectionId(''); setEditId(''); void load() }, [load])

  const chosen = detections.find((d) => d.detectionId === detectionId)
  const fileId = editId ? labels.find((l) => l.id === editId)?.fileId : chosen?.frameFileId
  useEffect(() => {
    let url = ''
    let alive = true
    setFrame('')
    if (fileId) trainingLabelService.frameUrl(fileId).then((u) => { url = u; if (alive) setFrame(u) }).catch((e) => { if (alive) setError(`Không tải được ảnh khung hình: ${exportError(e)}`) })
    return () => { alive = false; if (url) URL.revokeObjectURL(url) }
  }, [fileId])

  const pickDetection = (id: string) => {
    setDetectionId(id); setEditId('')
    const d = detections.find((x) => x.detectionId === id)
    if (d) { setBox({ x: String(d.box.x), y: String(d.box.y), width: String(d.box.width), height: String(d.box.height) }); setTypeCode(d.typeCode) }
  }
  const startEdit = (l: TrainingLabel) => {
    setEditId(l.id); setDetectionId('')
    setBox({ x: String(l.annotation.x), y: String(l.annotation.y), width: String(l.annotation.width), height: String(l.annotation.height) }); setTypeCode(l.defectTypeCode)
  }
  const parsed: LabelBox = { x: num(box.x), y: num(box.y), width: num(box.width), height: num(box.height) }
  const run = async (key: string, fn: () => Promise<unknown>, done: string) => {
    if (busy) return
    setBusy(key); setError(''); setMessage('')
    try { await fn(); setMessage(done); await load() } catch (e) { setError(exportError(e)) } finally { setBusy('') }
  }
  const cls = 'border border-[#E2E5E9] rounded-lg p-2 text-xs'

  return (
    <section className="bg-white rounded-[16px] border border-[#E2E5E9] p-5 space-y-4 text-xs" data-testid="training-labels-panel">
      <div className="flex items-center gap-3">
        <h3 className="font-bold text-base text-[#1A1D20]">Gán nhãn huấn luyện AI</h3>
        <button type="button" disabled={loading} onClick={() => { void load() }} className={cls}>{loading ? 'Đang tải…' : 'Tải lại'}</button>
      </div>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}

      <div className="space-y-2">
        <select aria-label="Phát hiện AI cần gán nhãn" value={detectionId} disabled={!!busy} onChange={(e) => pickDetection(e.target.value)} className={`${cls} w-full`}>
          <option value="">Chọn phát hiện AI ({detections.length})</option>
          {detections.map((d) => (<option key={d.detectionId} value={d.detectionId}>{d.typeCode} · {d.timestampMs ?? '—'} ms · #{d.detectionId.slice(0, 8)}</option>))}
        </select>
        {!loading && detections.length === 0 && <p className="text-slate-500">Dự án chưa có phát hiện AI nào trong CSDL.</p>}
        {(chosen || editId) && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="relative border border-[#E2E5E9] rounded-lg overflow-hidden bg-slate-50 min-h-24">
              {frame ? <img src={frame} alt="Khung hình AI" className="w-full block" /> : <p className="p-3 text-slate-500">Đang tải khung hình…</p>}
              {frame && Number.isFinite(parsed.x + parsed.y + parsed.width + parsed.height) && (
                <div className="absolute border-2 border-[#C9A227] pointer-events-none" style={{ left: `${parsed.x * 100}%`, top: `${parsed.y * 100}%`, width: `${parsed.width * 100}%`, height: `${parsed.height * 100}%` }} />
              )}
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {(['x', 'y', 'width', 'height'] as const).map((k) => (
                  <input key={k} aria-label={`Khung ${k === 'x' ? 'X' : k === 'y' ? 'Y' : k === 'width' ? 'rộng' : 'cao'}`} inputMode="decimal" disabled={!!busy} value={box[k]} onChange={(e) => setBox((b) => ({ ...b, [k]: e.target.value }))} placeholder={k} className={cls} />
                ))}
              </div>
              <input aria-label="Mã loại khiếm khuyết" disabled={!!busy} value={typeCode} onChange={(e) => setTypeCode(e.target.value)} placeholder="defectTypeCode" className={`${cls} w-full`} />
              <textarea aria-label="Lý do gán nhãn" rows={2} maxLength={1000} disabled={!!busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={`${cls} w-full`} />
              <button type="button" disabled={!!busy || !reason.trim() || !typeCode.trim()} onClick={() => {
                if (editId) void run('rev', () => trainingLabelService.revise(projectId, editId, parsed, typeCode, reason), 'Đã tạo phiên bản nhãn mới.')
                else void run('create', () => trainingLabelService.create(projectId, detectionId, parsed, typeCode, reason), 'Đã tạo nhãn huấn luyện.')
              }} className={cls}>{busy ? 'Đang gửi…' : editId ? 'Lưu phiên bản nhãn mới' : 'Tạo nhãn'}</button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2" data-testid="training-labels-list">
        <p className="font-semibold">Nhãn đã tạo ({labels.length})</p>
        {!loading && labels.length === 0 && <p className="text-slate-500">Chưa có nhãn huấn luyện nào trong CSDL.</p>}
        {labels.map((l) => (
          <div key={l.id} className="rounded-xl border border-[#E2E5E9] p-3 space-y-2">
            <p>#{l.id.slice(0, 8)} · {l.defectTypeCode} · phiên bản {l.revision} · <b>{STATUS_LABEL[l.status] || l.status}</b> · nguồn {l.sourceKind} #{l.sourceId.slice(0, 8)}</p>
            <p>Khung: x {l.annotation.x}, y {l.annotation.y}, rộng {l.annotation.width}, cao {l.annotation.height}{l.reviewedAt ? ` · duyệt ${new Date(l.reviewedAt).toLocaleString('vi-VN')}${l.reviewReason ? ` — ${l.reviewReason}` : ''}` : ''}</p>
            <div className="flex flex-wrap gap-2">
              <input aria-label={`Lý do duyệt nhãn ${l.id.slice(0, 8)}`} disabled={!!busy} value={reviewReason[l.id] || ''} onChange={(e) => setReviewReason((p) => ({ ...p, [l.id]: e.target.value }))} placeholder="Lý do duyệt/từ chối" className={cls} />
              {(['APPROVE', 'REJECT'] as const).map((d) => (
                <button key={d} type="button" disabled={!!busy || !(reviewReason[l.id] || '').trim()} onClick={() => { void run(d + l.id, () => trainingLabelService.review(projectId, l.id, d, reviewReason[l.id]), d === 'APPROVE' ? 'Đã duyệt nhãn.' : 'Đã từ chối nhãn.') }} className={cls}>{d === 'APPROVE' ? 'Duyệt' : 'Từ chối'}</button>
              ))}
              <button type="button" disabled={!!busy} onClick={() => startEdit(l)} className={cls}>Sửa khung</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
