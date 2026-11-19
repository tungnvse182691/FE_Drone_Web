import { useEffect, useState } from 'react'
import { defectRecurrenceService, type RecurrenceInput } from '../../../api/services/defectRecurrenceService'
import { defectLifecycleError } from '../../../api/services/defectLifecycleService'
import { Feedback, Field, PanelButton, PanelShell } from '../../../components/ui/PanelKit'

type Options = Awaited<ReturnType<typeof defectRecurrenceService.options>>

export function DefectRecurrenceForm({ projectId, busy, onSubmit }: { projectId: string; busy: boolean; onSubmit: (input: RecurrenceInput) => void }) {
  const [open, setOpen] = useState(false)
  const [revision, setRevision] = useState(0)
  const [options, setOptions] = useState<Options>()
  const [sourceId, setSourceId] = useState('')
  const [fileId, setFileId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    setOptions(undefined); setSourceId(''); setFileId(''); setError('')
    void defectRecurrenceService.options(projectId, controller.signal)
      .then(data => { if (!controller.signal.aborted) setOptions(data) })
      .catch(e => { if (!controller.signal.aborted) setError(defectLifecycleError(e)) })
    return () => controller.abort()
  }, [projectId, open, revision])

  if (!open) return <PanelButton disabled={busy} onClick={() => setOpen(true)}>Ghi nhận khiếm khuyết tái phát</PanelButton>
  const source = options?.sources.find(row => row.priorRepairDecisionId === sourceId)
  const file = options?.files.find(row => row.id === fileId)
  return <PanelShell icon="history" title="Ghi nhận khiếm khuyết tái phát" subtitle="Tạo hồ sơ mới và liên kết với lần sửa trước; khác với gom vào hồ sơ cũ.">
    <Feedback error={error} />
    {!options && !error && <p role="status" className="text-xs">Đang đọc hạng mục đã xác nhận và bằng chứng dự án…</p>}
    {options && <div className="rg-grid">
      <Field label="Quyết định sửa chữa trước">
        <select className="rg-field w-full" value={sourceId} disabled={busy} onChange={e => setSourceId(e.target.value)}>
          <option value="">{options.sources.length ? 'Chọn hạng mục đã xác nhận' : 'Không có hạng mục đã xác nhận trong dự án'}</option>
          {options.sources.map(row => <option key={row.priorRepairDecisionId} value={row.priorRepairDecisionId}>Khiếm khuyết #{row.previousDefectId.slice(0, 8)} · Hạng mục #{row.itemId.slice(0, 8)} · Quyết định #{row.priorRepairDecisionId.slice(0, 8)}</option>)}
        </select>
      </Field>
      <Field label="Tệp bằng chứng đã xác minh của dự án">
        <select className="rg-field w-full" value={fileId} disabled={busy} onChange={e => setFileId(e.target.value)}>
          <option value="">{options.files.length ? 'Chọn tệp làm căn cứ tái phát' : 'Chưa có tệp bằng chứng phù hợp từ máy chủ'}</option>
          {options.files.map(row => <option key={row.id} value={row.id}>{row.kind === 'HANDOVER' ? 'Biên bản bàn giao' : 'Căn cứ bảo trì'} · #{row.id.slice(0, 8)}</option>)}
        </select>
      </Field>
    </div>}
    <p className="text-xs">Dùng phân loại, mức độ và lý do đã nhập ở phần thẩm định. Máy chủ kiểm tra quyết định vẫn có hiệu lực cho nghĩa vụ gốc trước khi lưu.</p>
    <div className="rg-footer">
      {error && <PanelButton disabled={busy} onClick={() => setRevision(n => n + 1)}>Đọc lại</PanelButton>}
      <PanelButton disabled={busy} onClick={() => setOpen(false)}>Thu gọn</PanelButton>
      <PanelButton variant="primary" loading={busy} disabled={busy || !source || !file} onClick={() => {
        if (!options || !source || !file) return
        onSubmit({ previousDefectId: source.previousDefectId, priorRepairDecisionId: source.priorRepairDecisionId, evidenceFileIds: [file.id], expectedLifecycleVersion: options.version })
      }}>Tạo và ghi nhận tái phát</PanelButton>
    </div>
  </PanelShell>
}
