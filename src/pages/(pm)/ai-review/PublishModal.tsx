import React, { useState, useEffect } from 'react'
import { caseReportService, type CaseReportDetail } from '../../../api/services/caseReportService'
import { apiClient } from '../../../api/client'
import { useAuthStore } from '../../../store/authStore'
import { triageService } from '../../../api/services/triageService'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  publishPublicNote: string
  setPublishPublicNote: (note: string) => void
  onConfirmPublishResult: (selection: { reportIds: string[]; defectIds: string[]; evidenceIds: string[] }) => void | Promise<void>
}

interface DefectLabel { id: string; text: string; error?: string }

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  publishPublicNote,
  setPublishPublicNote,
  onConfirmPublishResult,
}) => {
  const epoch = useAuthStore(state => state.authEpoch)
  const [reports, setReports] = useState<CaseReportDetail[]>([])
  const [recipients, setRecipients] = useState<string[]>([])
  const [error, setError] = useState(''), [loading, setLoading] = useState(false), [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [defectIds, setDefectIds] = useState<string[]>([]), [evidenceIds, setEvidenceIds] = useState<string[]>([])
  const [defects, setDefects] = useState<DefectLabel[]>([]), [showErrors, setShowErrors] = useState(false)
  // Nhánh công bố (contract BE): NO_DEFECT không kèm Defect; còn lại phải chọn Defect thuộc Case.
  const noDefectBranch = targetTriageCase?.status === 'REJECTED'
  const caseDefectIds = targetTriageCase?.defect_ids || []
  useEffect(() => {
    const controller = new AbortController()
    setReports([]); setRecipients([]); setError(''); setBusy(false); setDefectIds([]); setEvidenceIds([]); setShowErrors(false)
    if (!isOpen || !targetTriageCase) return () => controller.abort()
    setLoading(true)
    caseReportService.read(targetTriageCase.id, controller.signal).then(rows => {
      if (!controller.signal.aborted) { setReports(rows); const held = triageService.pendingD2(targetTriageCase.id, 'publications'); setRecipients(held?.body.reportIds || []); setDefectIds(held?.body.defectIds || []); setEvidenceIds(held?.body.evidenceIds || []) }
    }).catch(e => { if (!controller.signal.aborted) setError(e.message || 'Không đọc được người nhận.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [isOpen, targetTriageCase?.id, epoch, reload])
  // Nhãn Defect đọc từ máy chủ (không suy từ Case).
  useEffect(() => {
    const controller = new AbortController()
    setDefects([])
    if (!isOpen || !targetTriageCase?.project_id || !caseDefectIds.length) return () => controller.abort()
    Promise.all(caseDefectIds.map(async (id): Promise<DefectLabel> => {
      try {
        const { data } = await apiClient.get(`/projects/${targetTriageCase.project_id}/defects/${id}`, { signal: controller.signal })
        return { id, text: [data?.defectTypeCode, data?.severity, data?.status].filter(Boolean).join(' · ') || 'Chưa có dữ liệu' }
      } catch (e: any) {
        if (controller.signal.aborted) throw e
        return { id, text: '', error: 'Không đọc được Defect: HTTP ' + (e?.response?.status || '') + ' ' + (e?.response?.data?.code || e?.message || '') }
      }
    })).then(rows => { if (!controller.signal.aborted) setDefects(rows) }).catch(() => undefined)
    return () => controller.abort()
  }, [isOpen, targetTriageCase?.id, caseDefectIds.join(',')])
  if (!isOpen || !targetTriageCase) return null
  const evidenceChoices = reports.filter(r => recipients.includes(r.reportId)).flatMap(r => [...r.originalEvidence, ...r.supplements.flatMap(x => x.evidence)].map(e => ({ reportId: r.reportId, e })))
  const validEvidence = evidenceIds.filter(id => evidenceChoices.some(c => c.e.evidenceId === id))
  const problems: Record<string, string> = {}
  if (!recipients.length) problems.recipients = 'Chọn ít nhất một Report nhận công bố.'
  if (!publishPublicNote.trim()) problems.note = 'Nhập nội dung công bố (bắt buộc).'
  else if (publishPublicNote.trim().length > 1000) problems.note = 'Nội dung tối đa 1.000 ký tự (đang nhập ' + publishPublicNote.trim().length + ').'
  if (!noDefectBranch && !defectIds.length) problems.defects = caseDefectIds.length ? 'Chọn ít nhất một Defect của Case để công bố.' : 'Case chưa có Defect theo máy chủ và chưa kết luận NO_DEFECT: BE không cho công bố.'
  const confirm = async () => {
    if (busy || loading || error) return
    if (Object.keys(problems).length) { setShowErrors(true); return }
    setBusy(true)
    try { await onConfirmPublishResult({ reportIds: recipients, defectIds: noDefectBranch ? [] : defectIds, evidenceIds: validEvidence }) } finally { setBusy(false) }
  }
  const fieldError = (k: string) => showErrors && problems[k] ? <p role="alert" data-testid={`publish-err-${k}`} className="text-rose-700 font-semibold">{problems[k]}</p> : null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Icon name="send" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Công Bố Tiến Độ Xử Lý Cho Người Dân</h3>
              <p className="text-xs text-slate-500">Đồng bộ thông báo công khai xuống ứng dụng di động người dân</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block">Hồ sơ phản ánh:</span>
            <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
            <p className="text-slate-600">
              {targetTriageCase.stationing} - {targetTriageCase.defect_title}
            </p>
            <span className="text-[10px] text-slate-400 block">
              Người gửi: {targetTriageCase.reporter_name || 'Người dân'} ({targetTriageCase.reporter_phone || 'N/A'})
            </span>
          </div>

          <fieldset className="space-y-2" disabled={busy || loading}>
            <legend className="font-bold">Người nhận theo Report (chỉ gửi cho các mục đã chọn)</legend>
            {loading && <p role="status">Đang đọc người nhận...</p>}
            {error && <p role="alert">{error} <button type="button" onClick={() => setReload(n => n + 1)}>Thử đọc lại</button></p>}
            {!loading && !error && !reports.length && <p>Không có Report trong CSDL.</p>}
            {reports.map(report => <label key={report.reportId} className="flex gap-2 items-start">
              <input type="checkbox" checked={recipients.includes(report.reportId)} onChange={e => setRecipients(ids => e.target.checked ? [...ids, report.reportId] : ids.filter(id => id !== report.reportId))} />
              <span>{report.reporterDisplayName || 'Chưa có tên người gửi'} · {report.reporterPhoneNumber || 'Chưa có liên hệ'} · Report {report.reportId}</span>
            </label>)}
            {fieldError('recipients')}
            <p>Kết luận nội bộ và công bố là hai thao tác riêng. Chỉ gửi Report, Defect và ảnh bạn chọn bên dưới; không tự chọn toàn bộ.</p>
          </fieldset>
          <fieldset className="space-y-2" disabled={busy || loading}>
            <legend className="font-bold">{noDefectBranch ? 'Nhánh công bố: Case đã kết luận NO_DEFECT (không kèm Defect)' : 'Defect của Case được công bố (bắt buộc chọn)'}</legend>
            {!noDefectBranch && !caseDefectIds.length && <p>Case chưa có Defect theo máy chủ.</p>}
            {!noDefectBranch && defects.map(d => <label key={d.id} className="flex gap-2 items-start">
              <input type="checkbox" aria-label={`Defect ${d.id}`} checked={defectIds.includes(d.id)} onChange={e => setDefectIds(ids => e.target.checked ? [...ids, d.id] : ids.filter(id => id !== d.id))} />
              <span><span className="font-mono">#DEF-{d.id.slice(0, 8).toUpperCase()}</span> · {d.error ? <span role="alert" className="text-rose-700">{d.error}</span> : d.text}</span>
            </label>)}
            {fieldError('defects')}
          </fieldset>
          <fieldset className="space-y-2" disabled={busy || loading}>
            <legend className="font-bold">Ảnh/bằng chứng được phép công bố (tùy chọn, chỉ của Report đã chọn)</legend>
            {!evidenceChoices.length && <p>Chưa có ảnh nào của Report đã chọn.</p>}
            {evidenceChoices.map((c, i) => <label key={c.e.evidenceId} className="flex gap-2 items-start">
              <input type="checkbox" aria-label={`Bằng chứng ${c.e.evidenceId}`} checked={evidenceIds.includes(c.e.evidenceId)} onChange={ev => setEvidenceIds(ids => ev.target.checked ? [...ids, c.e.evidenceId] : ids.filter(id => id !== c.e.evidenceId))} />
              <span>{c.e.supplementId ? 'Ảnh bổ sung' : 'Ảnh gốc'} {i + 1}{c.e.capturedAt ? ` · ${c.e.capturedAt}` : ''}</span>
            </label>)}
          </fieldset>
          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">Nội dung thông báo công khai gửi người dân:</label>
            <textarea
              rows={3}
              maxLength={1000}
              disabled={busy}
              value={publishPublicNote}
              onChange={(e) => setPublishPublicNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            {fieldError('note')}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy || loading || !!error}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Icon name="send" size={16} />
            <span>Công Bố Cho Người Dân</span>
          </button>
        </div>
      </div>
    </div>
  )
}
