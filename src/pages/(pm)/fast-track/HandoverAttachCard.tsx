import React, { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { attachHandoverDocument, listHandoverDocuments, validateHandoverFile, type HandoverDocumentRow } from '../../../api/services/handoverUploadService'
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
  const [docs, setDocs] = useState<HandoverDocumentRow[]>([])
  const [targetId, setTargetId] = useState('')
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
      if (h?.fileId) { setState('has'); setErr(''); return }
      // Chưa có nguồn HANDOVER đủ điều kiện ≠ chưa có hồ sơ: đọc kiểm kê đầy đủ (Supervisor).
      const items = await listHandoverDocuments(projectId)
      setDocs(items); setTargetId((cur) => (items.some((x) => x.id === cur && x.canAttachFile) ? cur : items.filter((x) => x.canAttachFile).length === 1 ? items.find((x) => x.canAttachFile)!.id : ''))
      setState('missing'); setErr('')
    } catch (e: any) { setState('error'); setErr(exportError(e)) }
  }, [projectId])
  useEffect(() => { void load() }, [load])

  if (role !== RoleCode.SUPERVISOR || state === 'has' || state === 'loading') return null
  const attachable = docs.filter((x) => x.canAttachFile)
  const mode: 'create' | 'attach' | 'blocked' = docs.length === 0 ? 'create' : attachable.length ? 'attach' : 'blocked'
  const problem = file ? validateHandoverFile(file) : 'Bắt buộc chọn biên bản bàn giao (PDF).'
  const submit = async () => {
    if (busy || problem) return
    setBusy(true); setErr(''); setDone('')
    try {
      await attachHandoverDocument(projectId, file!, mode === 'attach' ? {} : { documentNo, handoverDate }, setStep, mode === 'attach' ? targetId : undefined)
      setDone('Đã gắn biên bản bàn giao. Độ phủ được đọc lại từ máy chủ.')
      setState('has'); window.dispatchEvent(new Event('fasttrack-refresh'))
    } catch (e: any) { setErr(exportError(e)) } finally { setBusy(false); setStep('') }
  }
  return (
    <div className="rg-subcard space-y-3" data-testid="handover-attach-card">
      <SectionTitle icon="attach_file">Bổ sung biên bản bàn giao (bắt buộc cho điều phối nhanh)</SectionTitle>
      {state === 'error' && <p className="rg-hint">Không đọc được hồ sơ bàn giao/độ phủ nên khóa gắn biên bản. <PanelButton onClick={() => { void load() }}>Thử lại</PanelButton></p>}
      {state === 'missing' && mode === 'create' && <p className="rg-hint" data-testid="handover-mode-create">Chưa có nguồn HANDOVER đủ điều kiện và máy chủ cũng chưa có bản ghi hồ sơ bàn giao. Tạo hồ sơ mới cùng tệp biên bản (PDF, tối đa 20 MiB).</p>}
      {state === 'missing' && mode === 'attach' && <p className="rg-hint" data-testid="handover-mode-attach">Đã có bản ghi hồ sơ bàn giao nhưng thiếu tệp (chưa có nguồn HANDOVER đủ điều kiện). Chọn hồ sơ và gắn tệp biên bản; không tạo hồ sơ mới.</p>}
      {state === 'missing' && mode === 'blocked' && <p role="alert" className="rg-hint" data-testid="handover-mode-blocked">Đã có {docs.length} hồ sơ bàn giao nhưng không hồ sơ nào còn nhận tệp (đã có tệp hoặc đã ánh xạ). Nguồn HANDOVER vẫn chưa đủ điều kiện (ví dụ TEST_ONLY thay vì REAL_SOURCE): cần BE/đơn vị quản trị xử lý; Web không ghi đè tệp hay đổi provenance.</p>}
      {mode === 'attach' && (
        <Field label="Hồ sơ bàn giao cần gắn tệp" span="">
          <select aria-label="Hồ sơ bàn giao cần gắn tệp" className="rg-field" value={targetId} disabled={busy} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">Chọn hồ sơ bàn giao</option>
            {attachable.map((x) => <option key={x.id} value={x.id}>{x.documentNo || 'Chưa có số hiệu'} · {x.handoverDate || 'chưa có ngày'}</option>)}
          </select>
        </Field>
      )}
      {mode === 'create' && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Số hiệu văn bản" span=""><input aria-label="Số hiệu văn bản bàn giao" className="rg-field" maxLength={80} value={documentNo} disabled={busy} onChange={(e) => setDocumentNo(e.target.value)} /></Field>
        <Field label="Ngày bàn giao thực tế" span=""><input aria-label="Ngày bàn giao thực tế" type="date" className="rg-field" value={handoverDate} disabled={busy} onChange={(e) => setHandoverDate(e.target.value)} /></Field>
      </div>
      )}
      <input aria-label="Tệp biên bản bàn giao" data-testid="handover-attach-file" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] || null); setErr(''); setDone('') }} className="rg-field" />
      {file && problem && <Feedback error={problem} />}
      {err && <Feedback error={err} />}
      {done && <Feedback message={done} />}
      {busy && step && <p className="rg-hint" role="status">{step}</p>}
      <PanelButton variant="primary" loading={busy} disabled={busy || !!problem || state !== 'missing' || mode === 'blocked' || (mode === 'attach' ? !targetId : (!documentNo.trim() || !handoverDate))} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Gắn biên bản bàn giao'}</PanelButton>
    </div>
  )
}
