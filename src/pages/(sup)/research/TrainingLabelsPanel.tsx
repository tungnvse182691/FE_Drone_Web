import React, { useCallback, useEffect, useRef, useState } from 'react'
import { trainingLabelService, type AiDetection, type LabelBox, type TrainingLabel } from '../../../api/services/trainingLabelService'
import type { AiCandidateFactsDto } from '../../../api/services/surveyService'
import { defectTypeLabel } from '../../../api/services/defectTypeNames'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Field, Loading, PanelButton, PanelShell, Pill, SectionTitle } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Bị từ chối' }
const num = (v: string) => (v.trim() === '' ? Number.NaN : Number(v))

/**
 * PM: gán nhãn huấn luyện AI trên khung hình của phát hiện AI (spec PM-05).
 * Dữ liệu từ BE: ai-mock-runs → detections; nhãn qua /labels. BE bắt buộc vai trò PM (Giám sát không đọc được).
 */
export const TrainingLabelsPanel: React.FC<{ projectId: string; researchCandidate?: AiCandidateFactsDto | null; names?: Record<string, string> }> = ({ projectId, researchCandidate, names = {} }) => {
  const research = researchCandidate !== undefined
  const newSource = researchCandidate?.frameFileId ? researchCandidate : null
  const requests = useRef(new Map<string, string>())
  const currentRead = useRef<AbortController | null>(null)
  const [detections, setDetections] = useState<AiDetection[]>([])
  const [labels, setLabels] = useState<TrainingLabel[]>([])
  const [loading, setLoading] = useState(false)
  const [detectionId, setDetectionId] = useState('')
  const [editId, setEditId] = useState('')
  const [editVersion, setEditVersion] = useState('')
  const [box, setBox] = useState({ x: '', y: '', width: '', height: '' })
  const [typeCode, setTypeCode] = useState('')
  const [reason, setReason] = useState('')
  const [reviewReason, setReviewReason] = useState<Record<string, string>>({})
  const [frame, setFrame] = useState('')
  const [frameError, setFrameError] = useState('')
  const [busy, setBusy] = useState('')
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    if (!projectId) return
    currentRead.current?.abort()
    const controller = new AbortController()
    currentRead.current = controller
    setLoading(true); setError('')
    try {
      const [d, l] = await Promise.all([research ? [] : trainingLabelService.detections(projectId), trainingLabelService.list(projectId, research ? controller.signal : undefined)])
      if (!controller.signal.aborted) { setDetections(d); setLabels(l) }
    } catch (e) {
      if (!controller.signal.aborted) setError(exportError(e))
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [projectId, research])
  useEffect(() => { setDetectionId(''); setEditId(''); void load(); return () => currentRead.current?.abort() }, [load])

  useEffect(() => {
    if (!research) return
    setEditId(''); setEditVersion(''); setReason('')
    if (newSource) {
      const b = newSource.boundingBox
      setBox({ x: String(b.x), y: String(b.y), width: String(b.width), height: String(b.height) })
      setTypeCode(newSource.typeCode)
    }
  }, [research, newSource])

  const chosen = detections.find((d) => d.detectionId === detectionId)
  const editing = labels.find((l) => l.id === editId)
  const fileId = editing?.fileId ?? (research ? newSource?.frameFileId : chosen?.frameFileId)
  useEffect(() => {
    let url = ''
    let alive = true
    setFrame(''); setFrameError('')
    if (fileId) trainingLabelService.frameUrl(fileId).then((u) => {
      if (alive) { url = u; setFrame(u) } else URL.revokeObjectURL(u)
    }).catch((e) => { if (alive) setFrameError(`Không tải được ảnh khung hình: ${exportError(e)}`) })
    return () => { alive = false; if (url) URL.revokeObjectURL(url) }
  }, [fileId])

  const pickDetection = (id: string) => {
    setDetectionId(id); setEditId('')
    const d = detections.find((x) => x.detectionId === id)
    if (d) { setBox({ x: String(d.box.x), y: String(d.box.y), width: String(d.box.width), height: String(d.box.height) }); setTypeCode(d.typeCode) }
  }
  const startEdit = (l: TrainingLabel) => {
    setEditId(l.id); setDetectionId('')
    setEditVersion(l.version)
    setBox({ x: String(l.annotation.x), y: String(l.annotation.y), width: String(l.annotation.width), height: String(l.annotation.height) }); setTypeCode(l.defectTypeCode)
  }
  const parsed: LabelBox = { x: num(box.x), y: num(box.y), width: num(box.width), height: num(box.height) }
  const run = async (key: string, fn: (requestKey: string) => Promise<unknown>, done: string) => {
    if (!guard.acquire()) return
    const requestKey = requests.current.get(key) ?? crypto.randomUUID()
    if (research) requests.current.set(key, requestKey)
    setBusy(key); setError(''); setMessage('')
    try {
      await fn(requestKey)
      requests.current.delete(key)
      setMessage(done)
      if (research) { setEditId(''); setReason('') }
      await load()
    } catch (e) { setError(exportError(e)) } finally { setBusy(''); guard.release() }
  }
  const cls = 'rg-field'

  return (
    <PanelShell icon="label" title="Gán nhãn huấn luyện AI" className="!p-5 !rounded-[16px]" data-testid="training-labels-panel"
      actions={<PanelButton disabled={loading} loading={loading} onClick={() => { void load() }}>{loading ? 'Đang tải…' : 'Tải lại'}</PanelButton>}>
      <Feedback error={error} message={message} />

      <div className="space-y-3">
        {!research && <Field label="Phát hiện AI cần gán nhãn">
          <select aria-label="Phát hiện AI cần gán nhãn" value={detectionId} disabled={!!busy} onChange={(e) => pickDetection(e.target.value)} className={`${cls} w-full`}>
            <option value="">Chọn phát hiện AI ({detections.length})</option>
            {detections.map((d) => (<option key={d.detectionId} value={d.detectionId}>{d.typeCode} · {d.timestampMs ?? '—'} ms · #{d.detectionId.slice(0, 8)}</option>))}
          </select>
        </Field>}
        {!research && !loading && detections.length === 0 && <Empty icon="image_search">Dự án chưa có phát hiện AI nào trong CSDL.</Empty>}
        {research && !newSource && !editing && <p className="text-sm text-slate-600">Chọn một phát hiện có khung hình ở phần nguồn AI để tạo nhãn.</p>}
        {(chosen || newSource || editing) && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative border border-brand-border rounded-lg overflow-hidden bg-slate-50 min-h-24">
              {frameError ? <div className="p-3"><Feedback error={frameError} /></div> : frame
                ? <img src={frame} alt="Khung hình AI" className="w-full block" onError={() => setFrameError('Trình duyệt không hiển thị được khung hình.')} />
                : <div className="p-3"><Loading>Đang tải khung hình…</Loading></div>}
              {!frameError && frame && Number.isFinite(parsed.x + parsed.y + parsed.width + parsed.height) && (
                <div className="absolute border-2 border-[#C9A227] pointer-events-none" style={{ left: `${parsed.x * 100}%`, top: `${parsed.y * 100}%`, width: `${parsed.width * 100}%`, height: `${parsed.height * 100}%` }} />
              )}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {(['x', 'y', 'width', 'height'] as const).map((k) => (
                  <div key={k}>
                    <span className="rg-label">{k === 'x' ? 'Khung X' : k === 'y' ? 'Khung Y' : k === 'width' ? 'Khung rộng' : 'Khung cao'}</span>
                    <input aria-label={`Khung ${k === 'x' ? 'X' : k === 'y' ? 'Y' : k === 'width' ? 'rộng' : 'cao'}`} inputMode="decimal" disabled={!!busy} value={box[k]} onChange={(e) => setBox((b) => ({ ...b, [k]: e.target.value }))} placeholder={k} className={`${cls} w-full font-mono text-right`} />
                  </div>
                ))}
              </div>
              <Field label="Mã loại khiếm khuyết"><input aria-label="Mã loại khiếm khuyết" disabled={!!busy} value={typeCode} onChange={(e) => setTypeCode(e.target.value)} placeholder="defectTypeCode" className={`${cls} w-full`} /></Field>
              <Field label="Lý do gán nhãn"><textarea aria-label="Lý do gán nhãn" rows={2} maxLength={1000} disabled={!!busy} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do" className={`${cls} w-full`} /></Field>
              <div className="rg-footer">
                <PanelButton variant="primary" loading={!!busy} disabled={!!busy || !reason.trim() || !typeCode.trim() || (research && (!frame || !!frameError || !!editing && editVersion !== editing.version))} onClick={() => {
                  if (editing) {
                    const fingerprint = JSON.stringify(['revise', editId, editVersion, parsed, typeCode.trim(), reason.trim()])
                    void run(fingerprint, key => trainingLabelService.revise(projectId, editId, parsed, typeCode, reason,
                      research ? { fileId: editing.fileId, version: editVersion, key } : undefined), 'Đã tạo phiên bản nhãn mới.')
                  } else {
                    const sourceId = newSource?.detectionId ?? detectionId
                    const fingerprint = JSON.stringify(['create', sourceId, newSource?.sourceVersion, parsed, typeCode.trim(), reason.trim()])
                    void run(fingerprint, key => trainingLabelService.create(projectId, sourceId, parsed, typeCode, reason,
                      newSource ? { sourceVersion: newSource.sourceVersion, frameFileId: newSource.frameFileId, key } : undefined), 'Đã tạo nhãn huấn luyện.')
                  }
                }}>{busy ? 'Đang gửi…' : editId ? 'Lưu phiên bản nhãn mới' : 'Tạo nhãn'}</PanelButton>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-brand-border pt-3" data-testid="training-labels-list">
        <SectionTitle icon="sell">Nhãn đã tạo ({labels.length})</SectionTitle>
        {loading && labels.length === 0 && <Loading />}
        {!loading && !error && labels.length === 0 && <Empty icon="label_off">Chưa có nhãn huấn luyện nào trong CSDL.</Empty>}
        {labels.map((l) => (
          <div key={l.id} className="rg-row space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-slate-500">#{l.id.slice(0, 8)}</span>
              <span className="font-bold text-brand-dark">{defectTypeLabel(l.defectTypeCode, names)}</span>
              <span>phiên bản {l.revision}</span>
              <Pill tone={l.status === 'APPROVED' ? 'ok' : l.status === 'REJECTED' ? 'bad' : 'warn'}>{STATUS_LABEL[l.status] || l.status}</Pill>
              <span className="text-slate-500">Nguồn {l.sourceKind === 'AI_DETECTION' ? 'phát hiện AI' : l.sourceKind === 'REPORT' ? 'phản ánh' : l.sourceKind} #{l.sourceId.slice(0, 8)}</span>
            </div>
            <p className="text-slate-600">Khung: <span className="font-mono">x {l.annotation.x}, y {l.annotation.y}, rộng {l.annotation.width}, cao {l.annotation.height}</span>{l.reviewedAt ? ` · duyệt ${new Date(l.reviewedAt).toLocaleString('vi-VN')}${l.reviewReason ? ` — ${l.reviewReason}` : ''}` : ''}</p>
            <div className="flex flex-wrap items-center gap-2 border-t border-brand-border pt-2">
              {(!research || l.status === 'PENDING') && <>
                <input aria-label={`Lý do duyệt nhãn ${l.id.slice(0, 8)}`} disabled={!!busy} value={reviewReason[l.id] || ''} onChange={(e) => setReviewReason((p) => ({ ...p, [l.id]: e.target.value }))} placeholder="Lý do duyệt/từ chối" className={`${cls} flex-1 min-w-[12rem]`} />
                {(['APPROVE', 'REJECT'] as const).map((d) => (
                  <PanelButton key={d} variant={d === 'REJECT' ? 'danger' : 'secondary'} disabled={!!busy || !(reviewReason[l.id] || '').trim()} onClick={() => {
                    void run(JSON.stringify([d, l.id, l.version, reviewReason[l.id].trim()]),
                      key => trainingLabelService.review(projectId, l.id, d, reviewReason[l.id], research ? { version: l.version, key } : undefined),
                      d === 'APPROVE' ? 'Đã duyệt nhãn.' : 'Đã từ chối nhãn.')
                  }}>{d === 'APPROVE' ? 'Duyệt' : 'Từ chối'}</PanelButton>
                ))}
              </>}
              <PanelButton disabled={!!busy} onClick={() => startEdit(l)}>Sửa khung</PanelButton>
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  )
}
