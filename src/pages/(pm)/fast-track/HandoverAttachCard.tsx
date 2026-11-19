import React, { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { attachHandoverDocument, validateHandoverFile } from '../../../api/services/handoverUploadService'
import { exportError } from '../../../api/services/projectExportService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { Feedback, Field, PanelButton, SectionTitle } from '../../../components/ui/PanelKit'

/**
 * Giám sát bổ sung BIÊN BẢN BÀN GIAO cho dự án đã tồn tại nhưng chưa có nguồn HANDOVER có tệp
 * (điều kiện để xác nhận độ phủ Điều phối nhanh). API: POST /uploads (DOCUMENT, targetId=projectId) → POST /projects/{p}/handover-documents.
 */
export function HandoverAttachCard({ projectId }: { projectId: string }) {
  const role = useAuthStore((s) => s.user?.role)
  const [state, setState] = useState<'loading' | 'has' | 'missing' | 'error'>('loading')
  const [err, setErr] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [documentNo, setDocumentNo] = useState('')
  const [handoverDate, setHandoverDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState('')
  const [done, setDone] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}/road-coverage`)
      const h = (data?.sources || []).find((s: any) => s.kind === 'HANDOVER')
      setState(h?.fileId ? 'has' : 'missing'); setErr('')
    } catch (e: any) { setState('error'); setErr(exportError(e)) }
  }, [projectId])
  useEffect(() => { void load() }, [load])

  if (role !== RoleCode.SUPERVISOR || state === 'has' || state === 'loading') return null
  const problem = file ? validateHandoverFile(file) : 'Bắt buộc chọn biên bản bàn giao (PDF).'
  const submit = async () => {
    if (busy || problem) return
    setBusy(true); setErr(''); setDone('')
    try {
      await attachHandoverDocument(projectId, file!, { documentNo, handoverDate }, setStep)
      setDone('Đã gắn biên bản bàn giao. Độ phủ được đọc lại từ máy chủ.')
      setState('has'); window.dispatchEvent(new Event('fasttrack-refresh'))
    } catch (e: any) { setErr(exportError(e)) } finally { setBusy(false); setStep('') }
  }
  return (
    <div className="rg-subcard space-y-3" data-testid="handover-attach-card">
      <SectionTitle icon="attach_file">Bổ sung biên bản bàn giao (bắt buộc cho điều phối nhanh)</SectionTitle>
      <p className="rg-hint">Dự án này chưa có biên bản bàn giao kèm tệp trong hồ sơ độ phủ. Không thể xác nhận phạm vi xử lý nhanh cho tới khi có biên bản (PDF, tối đa 20 MiB).</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Số hiệu văn bản" span=""><input aria-label="Số hiệu văn bản bàn giao" className="rg-field" maxLength={80} value={documentNo} disabled={busy} onChange={(e) => setDocumentNo(e.target.value)} /></Field>
        <Field label="Ngày bàn giao thực tế" span=""><input aria-label="Ngày bàn giao thực tế" type="date" className="rg-field" value={handoverDate} disabled={busy} onChange={(e) => setHandoverDate(e.target.value)} /></Field>
      </div>
      <input aria-label="Tệp biên bản bàn giao" data-testid="handover-attach-file" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] || null); setErr(''); setDone('') }} className="rg-field" />
      {file && problem && <Feedback error={problem} />}
      {err && <Feedback error={err} />}
      {done && <Feedback message={done} />}
      {busy && step && <p className="rg-hint" role="status">{step}</p>}
      <PanelButton variant="primary" loading={busy} disabled={busy || !!problem || !documentNo.trim() || !handoverDate} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Gắn biên bản bàn giao'}</PanelButton>
    </div>
  )
}
