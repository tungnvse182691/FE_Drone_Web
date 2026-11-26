import React, { useEffect, useRef, useState } from 'react'
import { projectExportService, exportError } from '../../../api/services/projectExportService'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { Feedback, Field, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { useToastStore } from '../../../store/toastStore'

const short = (id: string) => id.slice(0, 8).toUpperCase()

/**
 * Xuất hồ sơ sửa chữa theo hạng mục (RESOURCE-SCOPED-REPAIR-EXPORT.md):
 * POST /projects/{responsibilityProjectId}/exports {kind:DOSSIER, format, repairItemIds, includeOriginalFiles} (Idempotency-Key + CSRF) → 202 → poll job → SUCCEEDED mới tải /content.
 * projectId là dự án chịu trách nhiệm hiện hành (URL). PDF không kèm tệp gốc; không trộn với bộ lọc thời gian/segment/defect.
 */
export const RepairExportPanel: React.FC<{ projectId: string; items: RepairItem[] }> = ({ projectId, items }) => {
  const [selected, setSelected] = useState<string[]>([])
  const [format, setFormat] = useState<'' | 'PDF' | 'ZIP'>('')
  const [originals, setOriginals] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const guard = useSubmitGuard()
  const toast = useToastStore()
  const seq = useRef(0)
  useEffect(() => { setSelected([]); setError(''); setMessage(''); return () => { seq.current++ } }, [projectId])
  if (!items.length) return null

  const run = async () => {
    if (!format || !selected.length || !guard.acquire()) return
    const my = ++seq.current
    setBusy(true); setError(''); setMessage('')
    try {
      const created = await projectExportService.create(projectId, { kind: 'DOSSIER', format, includeOriginalFiles: format === 'ZIP' && originals, repairItemIds: selected })
      let job = created
      for (let i = 0; i < 60 && !['SUCCEEDED', 'FAILED'].includes(job.status); i++) { await new Promise((r) => setTimeout(r, 2000)); if (seq.current !== my) return; job = await projectExportService.detail(projectId, created.id) }
      if (job.status === 'FAILED') throw new Error(`Máy chủ không tạo được hồ sơ (${job.errorCode || 'FAILED'}).`)
      if (job.status !== 'SUCCEEDED') throw new Error('Hồ sơ chưa hoàn tất sau 120 giây; job đã tạo, xem lại ở danh sách "Hồ sơ xuất".')
      const file = await projectExportService.content(projectId, created.id)
      if (seq.current !== my) return
      const url = URL.createObjectURL(file.blob); const a = document.createElement('a'); a.href = url; a.download = file.fileName; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000)
      const ok = `Đã tạo và tải hồ sơ ${format} cho ${selected.length} hạng mục${job.completeness === 'PARTIAL' ? ' — chưa đầy đủ: ' + (job.missingSections || []).join(', ') : ''}.`
      setMessage(ok); toast.success(ok)
    } catch (e) { if (seq.current === my) setError(exportError(e)) } finally { if (seq.current === my) setBusy(false); guard.release() }
  }

  return (
    <PanelShell as="div" icon="folder_zip" title="Xuất hồ sơ sửa chữa theo hạng mục" subtitle="Chọn đúng hạng mục đang thuộc trách nhiệm của dự án này; máy chủ kiểm quyền từng hạng mục và không xuất thiếu âm thầm." data-testid="repair-export-panel">
      <ul className="space-y-1">
        {items.map((i) => <li key={i.id}><label className="flex items-center gap-2 text-xs"><input type="checkbox" disabled={busy} checked={selected.includes(i.id)} onChange={(e) => setSelected((cur) => e.target.checked ? [...cur, i.id] : cur.filter((x) => x !== i.id))} />Hạng mục {short(i.id)} · {i.mode} · {i.state}</label></li>)}
      </ul>
      <div className="rg-grid">
        <Field label="Định dạng" span="col-span-6"><select aria-label="Định dạng xuất hồ sơ sửa chữa" className="rg-field w-full" disabled={busy} value={format} onChange={(e) => { const v = e.target.value as '' | 'PDF' | 'ZIP'; setFormat(v); if (v !== 'ZIP') setOriginals(false) }}><option value="">Chọn PDF hoặc ZIP</option><option value="PDF">PDF (không kèm tệp gốc)</option><option value="ZIP">ZIP</option></select></Field>
      </div>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" disabled={busy || format !== 'ZIP'} checked={originals} onChange={(e) => setOriginals(e.target.checked)} />Kèm ảnh hiện trường gốc (includeOriginalFiles) — chỉ ZIP</label>
      <div className="rg-footer"><PanelButton variant="primary" loading={busy} disabled={busy || !format || !selected.length} onClick={() => { void run() }}>{busy ? 'Đang xuất…' : 'Xuất hồ sơ'}</PanelButton></div>
      <Feedback error={error} message={message} />
    </PanelShell>
  )
}
