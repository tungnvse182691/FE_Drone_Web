import React from 'react'
import { type CaseReportEvidence } from '../../../api/services/caseReportService'
import { useCaseReportMedia } from './useCaseReportMedia'

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

export function DrawerReportDetails({ caseId }: { caseId: string }) {
  const media = useCaseReportMedia()
  const loading = media?.reportsLoading || false
  const readError = media?.reportsError || ''
  const reports = media?.caseId === caseId ? media.reports : []
  return <section className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-3">
    <header className="flex flex-wrap justify-between gap-2"><h3 className="text-xs font-bold text-brand-dark">Chi tiết từng phản ánh</h3><button type="button" disabled={loading} onClick={() => media?.retry()} className="text-xs border rounded-lg px-3 py-1">Tải lại phản ánh</button></header>
    <p className="text-[11px] text-slate-500">Tên và số điện thoại là thông tin tài khoản hiện tại của người gửi.</p>
    {loading && <p role="status" className="text-xs">Đang tải chi tiết phản ánh...</p>}
    {readError && <p role="alert" className="text-xs text-rose-700">{readError}</p>}
    {!loading && !readError && reports.length === 0 && <p className="text-xs text-slate-500">Không có Report trong hồ sơ.</p>}
    {reports.map(report => <article key={report.reportId} data-report-id={report.reportId} className="bg-white rounded-xl border border-slate-200 p-3 space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-2"><div><p className="text-slate-400">Người phản ánh</p><p className="font-semibold">{report.reporterDisplayName || 'Chưa cập nhật'}</p></div><div><p className="text-slate-400">Liên hệ</p><p>{report.reporterPhoneNumber || 'Chưa có thông tin'} · {report.reporterPhoneNumberConfirmed === true ? 'Đã xác minh' : report.reporterPhoneNumberConfirmed === false ? 'Chưa xác minh' : 'Chưa có dữ liệu xác minh'}</p></div></div>
      <p className="text-slate-500">Tiếp nhận: {report.receivedAt || 'Chưa có thời gian tiếp nhận'}</p><p className="whitespace-pre-wrap">{report.description || 'Chưa có nội dung phản ánh trong response.'}</p>
      {!report.originalEvidence.length && <p className="text-slate-500">Chưa có bằng chứng gốc trong dữ liệu đã đọc.</p>}
      {report.originalEvidence.map(evidence => <ReportEvidence key={evidence.evidenceId} caseId={caseId} reportId={report.reportId} evidence={evidence} />)}
      {report.supplements.map(supplement => <section key={supplement.id} className="border-t pt-3 space-y-2"><h4 className="font-semibold">Bổ sung phản ánh · {supplement.receivedAt}</h4><p className="whitespace-pre-wrap">{supplement.description || 'Chưa có nội dung bổ sung trong response.'}</p>{supplement.evidence.map(evidence => <ReportEvidence key={evidence.evidenceId} caseId={caseId} reportId={report.reportId} evidence={evidence} />)}</section>)}
    </article>)}
  </section>
}
