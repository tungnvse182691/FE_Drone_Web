import React, { useEffect, useRef, useState } from 'react'
import { useCaseReportMedia } from './useCaseReportMedia'
import { caseNoDefectService } from '../../../api/services/caseNoDefectService'
import { reportError } from './useCaseReportMedia'
import { useAuthStore } from '../../../store/authStore'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface NoDefectModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  noDefectReason: string
  setNoDefectReason: (r: string) => void
  onReviewNoDefect?: () => Promise<void>
  onConfirmNoDefect: (evidenceId?: string) => Promise<void> | void
}

export const NoDefectModal: React.FC<NoDefectModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  noDefectReason,
  setNoDefectReason,
  onConfirmNoDefect,
  onReviewNoDefect,
}) => {
  const media = useCaseReportMedia(), epoch = useAuthStore(state => state.authEpoch)
  const [evidenceId, setEvidenceId] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [showErrors, setShowErrors] = useState(false)
  const [held, setHeld] = useState<ReturnType<typeof caseNoDefectService.pending>>(null)
  const scope = `${epoch}:${isOpen}:${targetTriageCase?.id}`, active = useRef(scope); active.current = scope
  const running = useRef(false)
  useEffect(() => {
    setEvidenceId(''); setBusy(false); setError(''); setShowErrors(false); running.current = false
    try { setHeld(targetTriageCase?.id ? caseNoDefectService.pending(targetTriageCase.id) : null) }
    catch (e) { setHeld(null); setError(reportError(e)) }
  }, [scope])
  const evidence = media && media.caseId === targetTriageCase?.id ? media.reports.flatMap(report => [...report.originalEvidence, ...report.supplements.flatMap(s => s.evidence)].map(item => ({reportId: report.reportId, item}))) : []
  const problems: Record<string, string> = {}
  if (!noDefectReason.trim()) problems.reason = 'Nhập lý do kết luận kỹ thuật (bắt buộc).'
  else if (noDefectReason.trim().length > 1000) problems.reason = 'Lý do tối đa 1.000 ký tự (đang nhập ' + noDefectReason.trim().length + ').'
  if (!evidenceId) problems.evidence = 'Chọn bằng chứng dùng để kết luận (bắt buộc).'
  else if (!evidence.some(e => e.item.evidenceId === evidenceId)) problems.evidence = 'Bằng chứng đã chọn không còn trong hồ sơ; chọn lại.'
  if (media?.reportsError) problems.source = 'Chưa đọc được bằng chứng của hồ sơ; tải lại trước khi gửi.'
  else if (media?.reportsLoading) problems.source = 'Đang đọc bằng chứng; chờ hoàn tất.'
  const fieldError = (k: string) => showErrors && problems[k] ? <p role="alert" data-testid={`nodefect-err-${k}`} className="text-rose-700 font-semibold">{problems[k]}</p> : null
  const review = async () => {
    if (!onReviewNoDefect || running.current || !held?.rejected) return
    const selected = scope, oldEvidence = held.body.evidenceIds[0]
    running.current = true; setBusy(true)
    try {
      await onReviewNoDefect()
      if (active.current !== selected) return
      setHeld(null); setEvidenceId(oldEvidence); setError('Đã đọc lại Case OPEN và phiên bản mới. Kiểm tra bằng chứng/lý do trước khi tự xác nhận yêu cầu mới.')
    } catch (e) { if (active.current === selected) setError(reportError(e)) }
    finally { if (active.current === selected) { running.current = false; setBusy(false) } }
  }
  const confirm = async () => {
    if (running.current || held?.rejected) return
    if (!held && Object.keys(problems).length) { setShowErrors(true); return }
    const selected = scope; running.current = true; setBusy(true); setError('')
    try { await onConfirmNoDefect(held?.body.evidenceIds[0] || evidenceId) }
    catch (e) { if (active.current === selected) { setError(reportError(e)); try { setHeld(caseNoDefectService.pending(targetTriageCase!.id)) } catch (readError) { setError(reportError(readError)) } } }
    finally { if (active.current === selected) { running.current = false; setBusy(false) } }
  }
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Icon name="cancel" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Kết Luận: Không Có Khiếm Khuyết</h3>
              <p className="text-xs text-red-600 font-semibold">
                Yêu cầu bắt buộc giải trình kỹ thuật rõ ràng
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block">Hồ sơ đang xem xét:</span>
            <span className="font-mono font-bold text-brand-dark">
              {targetTriageCase.code} ({targetTriageCase.stationing})
            </span>
            <p className="text-slate-500">{targetTriageCase.defect_title}</p>
            <p className="text-[11px] text-slate-500">Đây là kết luận của CASE (NO_DEFECT). Từ chối một Report nguồn (REJECT) là thao tác khác trong khung “Quyết định nguồn Report”.</p>
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">
              Lý do kết luận kỹ thuật: <span className="text-red-500">* (Bắt buộc)</span>
            </label>
            <textarea
              rows={3}
              disabled={busy || !!held}
              value={held?.body.reason || noDefectReason}
              onChange={(e) => setNoDefectReason(e.target.value)}
              placeholder="Ghi rõ lý do: ví dụ vết nước đọng bề mặt, bùn đất rác rãnh mép đường, không cấu thành nứt vỡ kết cấu mặt đường bê tông xi măng..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
              required
            />
            {fieldError('reason')}
          </div>

          <label className="flex flex-col gap-1 font-bold text-slate-700">
            Bằng chứng dùng để kết luận (bắt buộc)
            <select aria-label="Bằng chứng kết luận Không có lỗi" value={held?.body.evidenceIds[0] || evidenceId} disabled={busy || !!held || media?.reportsLoading} onChange={e => setEvidenceId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option value="">Chọn bằng chứng trong hồ sơ đã đọc</option>
              {evidence.map((e, i) => <option key={`${e.reportId}:${e.item.evidenceId}`} value={e.item.evidenceId}>{e.item.supplementId ? 'Ảnh bổ sung' : 'Ảnh gốc'} {i + 1}{e.item.capturedAt ? ` · ${e.item.capturedAt}` : ''}</option>)}
              {held && !evidence.some(e => e.item.evidenceId === held.body.evidenceIds[0]) && <option value={held.body.evidenceIds[0]}>Bằng chứng của yêu cầu đang chờ</option>}
            </select>
            {fieldError('evidence')}
          </label>
          {fieldError('source')}
          {media?.reportsLoading && <p role="status">Đang đọc bằng chứng…</p>}
          {media?.reportsError && <p role="alert">{media.reportsError}</p>}
          {!media?.reportsLoading && !media?.reportsError && !evidence.length && <p>Chưa có bằng chứng được phép đọc để kết luận.</p>}
          {held?.rejected && onReviewNoDefect && <button type="button" disabled={busy} onClick={() => { void review() }} className="text-xs underline">Đọc lại Case và chuẩn bị yêu cầu mới</button>}
          {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
          {held && <p role="status">{held.received ? 'Đã nhận phản hồi lệnh; chỉ đọc lại kết quả.' : held.rejected ? 'Lệnh bị từ chối; giữ lý do và bằng chứng để đối chiếu.' : 'Chưa rõ kết quả; thử lại giữ nguyên yêu cầu.'}</p>}
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-800 flex items-start gap-2">
            <Icon name="warning" size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>
              Kết luận nội bộ dựa trên bằng chứng đã chọn. Thao tác này chưa công bố hoặc gửi kết quả cho người phản ánh.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => { void confirm() }}
            disabled={busy || !!held?.rejected}
            className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Icon name="check" size={16} />
            <span>{busy ? 'Đang xử lý…' : held?.received ? 'Đọc lại kết quả kết luận' : held ? 'Thử lại đúng yêu cầu' : 'Xác Nhận Kết Luận NO_DEFECT'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
