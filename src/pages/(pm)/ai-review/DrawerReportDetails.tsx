import React, { useEffect, useState, useRef } from 'react'
import { type CaseReportEvidence } from '../../../api/services/caseReportService'
import { triageService } from '../../../api/services/triageService'
import { useAuthStore } from '../../../store/authStore'
import { useCaseReportMedia, reportError } from './useCaseReportMedia'

export function ReportEvidence({ reportId, evidence }: { caseId: string; reportId: string; evidence: CaseReportEvidence }) {
  const media = useCaseReportMedia()
  const selected = media?.selected?.reportId === reportId && media.selected.evidence.evidenceId === evidence.evidenceId
  const location = evidence.location
  const located = (evidence.locationSource || 'UNKNOWN') !== 'UNKNOWN' && typeof location?.latitude === 'number' && typeof location.longitude === 'number' && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
  return <section className="border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
    <p>{evidence.supplementId ? 'Ảnh bổ sung' : 'Ảnh gốc'} · Thời gian chụp: {evidence.capturedAt || 'Chưa cập nhật'}</p>
    <p>GPS: {located ? `${location.latitude}, ${location.longitude}` : 'UNKNOWN — chưa có vị trí được xác nhận'}</p>
    {located && <a href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}`} target="_blank" rel="noreferrer">Xem vị trí evidence</a>}
    <button type="button" onClick={() => media?.select(reportId, evidence)} className="border rounded-lg px-3 py-1 text-[#8C6D1F]">{selected ? 'Đang xem ảnh' : 'Xem ảnh'}</button>
  </section>
}

export function DrawerReportDetails({ caseId, onSplit }: { caseId: string; onSplit?: (reportId: string) => Promise<void> }) {
  const epoch = useAuthStore(state => state.authEpoch)
  const role = useAuthStore(state => state.user?.role)
  const media = useCaseReportMedia()
  const [error, setError] = useState('')
  const loading = media?.reportsLoading || false
  const readError = media?.reportsError || ''
  const [recoveryReport, setRecoveryReport] = useState('')
  const [selectedReport, setSelectedReport] = useState(''), [splitting, setSplitting] = useState(false)
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  const active = useRef({ caseId, epoch })
  active.current = { caseId, epoch }
  const reports = media?.caseId === caseId ? media.reports : []
  useEffect(() => { setError(''); setSelectedReport(''); setSplitting(false) }, [caseId, epoch])
  useEffect(() => {
    try { setRecoveryReport(triageService.pendingD2(caseId, 'report-splits')?.body.reportIds?.[0] || '') }
    catch (e) { setError((e as Error).message) }
  }, [caseId, epoch, splitting])
  const split = async () => {
    if (!onSplit || !selectedReport || splitting) return
    const actorEpoch = epoch, selectedCase = caseId
    setSplitting(true); setError('')
    try {
      await onSplit(selectedReport)
      if (!alive.current || useAuthStore.getState().authEpoch !== actorEpoch || active.current.caseId !== selectedCase) return
      setSelectedReport(''); media?.retry()
    } catch (error) { if (alive.current && active.current.caseId === selectedCase && useAuthStore.getState().authEpoch === actorEpoch) setError(reportError(error)) }
    finally { if (alive.current && active.current.caseId === selectedCase && useAuthStore.getState().authEpoch === actorEpoch) setSplitting(false) }
  }
  return <section className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-3">
    <header className="flex flex-wrap justify-between gap-2"><h3 className="text-xs font-bold text-brand-dark">Chi tiết từng phản ánh</h3><button type="button" disabled={loading || splitting} onClick={() => media?.retry()} className="text-xs border rounded-lg px-3 py-1">Tải lại phản ánh</button></header>
    <p className="text-[11px] text-slate-500">Tên và số điện thoại là thông tin tài khoản hiện tại của người gửi.</p>
    {loading && <p role="status" className="text-xs">Đang tải chi tiết phản ánh...</p>}
    {(error || readError) && <p role="alert" className="text-xs text-rose-700">{error || readError}</p>}
    {!loading && !error && !readError && reports.length === 0 && <p className="text-xs text-slate-500">Không có Report trong hồ sơ.</p>}
    {reports.map(report => <article key={report.reportId} data-report-id={report.reportId} className="bg-white rounded-xl border border-slate-200 p-3 space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-2"><div><p className="text-slate-400">Người phản ánh</p><p className="font-semibold">{report.reporterDisplayName || 'Chưa cập nhật'}</p></div><div><p className="text-slate-400">Liên hệ</p><p>{report.reporterPhoneNumber || 'Chưa có thông tin'} · {report.reporterPhoneNumberConfirmed === true ? 'Đã xác minh' : report.reporterPhoneNumberConfirmed === false ? 'Chưa xác minh' : 'Chưa có dữ liệu xác minh'}</p></div></div>
      <p className="text-slate-500">Tiếp nhận: {report.receivedAt || 'Chưa có thời gian tiếp nhận'}</p><p className="whitespace-pre-wrap">{report.description || 'Chưa có nội dung phản ánh trong response.'}</p>
      {!report.originalEvidence.length && <p className="text-slate-500">Chưa có bằng chứng gốc trong dữ liệu đã đọc.</p>}
      {report.originalEvidence.map(evidence => <ReportEvidence key={evidence.evidenceId} caseId={caseId} reportId={report.reportId} evidence={evidence} />)}
      {report.supplements.map(supplement => <section key={supplement.id} className="border-t pt-3 space-y-2"><h4 className="font-semibold">Bổ sung phản ánh · {supplement.receivedAt}</h4><p className="whitespace-pre-wrap">{supplement.description || 'Chưa có nội dung bổ sung trong response.'}</p>{supplement.evidence.map(evidence => <ReportEvidence key={evidence.evidenceId} caseId={caseId} reportId={report.reportId} evidence={evidence} />)}</section>)}
      {role === 'PROJECT_MANAGER' && onSplit && reports.length > 1 && <button type="button" disabled={splitting} onClick={() => setSelectedReport(report.reportId)} className="border rounded-lg px-3 py-1">Tách Report này</button>}
    </article>)}
    {recoveryReport && role === 'PROJECT_MANAGER' && <div className="p-3 border rounded-lg bg-amber-50 space-y-2 text-xs"><p>Lệnh tách Report {recoveryReport} đang chờ đối chiếu. Giữ nguyên key và phiên bản; nếu đã có receipt, chỉ đọc lại.</p><button type="button" disabled={splitting} onClick={() => setSelectedReport(recoveryReport)}>Đối chiếu lệnh tách đang chờ</button></div>}
    {selectedReport && <div className="p-3 border rounded-lg bg-amber-50 space-y-2 text-xs"><p>Chuyển phản ánh đã chọn sang hồ sơ riêng qua máy chủ.</p><button type="button" disabled={splitting} onClick={split} className="bg-brand-gold text-white rounded-lg px-3 py-2">Xác nhận tách Report</button><button type="button" disabled={splitting} onClick={() => setSelectedReport('')}>Hủy</button></div>}
  </section>
}
