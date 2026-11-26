import React, { useEffect, useState } from 'react'
import { acceptanceService, type SubmissionLineage, type SubmissionVersion } from '../../../api/services/acceptanceService'
import { EvidencePhoto } from './EvidencePhoto'
import { beErrorText, fmtTime, NO_DATA } from './acceptanceLabels'

const DECISION_LABEL: Record<string, string> = { SUPPLEMENT: 'PM yêu cầu bổ sung', ACCEPT: 'PM chấp nhận hồ sơ', CONFIRM: 'Xác nhận kết quả đo', NO_DEFECT: 'Kết quả FIELD không có lỗi' }
const label = (v: SubmissionVersion) => `Bản nộp #${v.revision ?? '?'}${v.effective ? ' (hiện hành)' : ''}`

/**
 * Lịch sử các bản nộp của hạng mục: bản #1 vs #2…, lý do SUPPLEMENT, review GẮN THEO TỪNG BẢN (không lấy review bản cũ cho bản mới),
 * mốc thi công (lần thi công) tách khỏi thời điểm nộp. Đọc lại từ BE mỗi lần mở (không phụ thuộc sessionStorage).
 */
export const SubmissionHistoryPanel: React.FC<{ projectId: string; packageId: string; itemId: string; reloadKey?: string }> = ({ projectId, packageId, itemId, reloadKey }) => {
  const [data, setData] = useState<SubmissionLineage | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  useEffect(() => {
    let on = true
    setData(null); setError('')
    acceptanceService.getSubmissionLineage(projectId, packageId, itemId)
      .then((d) => {
        if (!on) return
        setData(d)
        const vs = d.versions
        const cur = vs.find((v) => v.effective) || vs[vs.length - 1]
        const prev = vs.filter((v) => v !== cur).slice(-1)[0]
        setRight(cur?.submissionId || ''); setLeft(prev?.submissionId || '')
      })
      .catch((e) => { if (on) setError(beErrorText(e)) })
    return () => { on = false }
  }, [projectId, packageId, itemId, reloadKey, attempt])

  const shell = (children: React.ReactNode) => (
    <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3" data-testid="submission-history">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-base text-slate-900">Lịch sử bản nộp và review</h2>
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="text-xs underline text-slate-600 cursor-pointer">Đọc lại</button>
      </div>
      {children}
    </section>
  )
  if (error) return shell(<p role="alert" className="text-xs text-rose-700 break-words">Không đọc được lịch sử bản nộp: {error}</p>)
  if (!data) return shell(<p role="status" className="text-xs text-slate-500">Đang đọc lịch sử bản nộp…</p>)
  if (!data.versions.length) return shell(<><p className="text-xs text-slate-600">Máy chủ chưa ghi nhận bản nộp nào cho hạng mục này.</p>{data.notes.map((n) => <p key={n} role="alert" className="text-xs text-rose-700 break-words">{n}</p>)}</>)

  const lv = data.versions.find((v) => v.submissionId === left)
  const rv = data.versions.find((v) => v.submissionId === right)
  const afterOf = (v?: SubmissionVersion) => v ? [...v.evidence].reverse().find((e) => e.purpose === 'AFTER') ?? v.evidence[0] ?? null : null
  const pane = (v: SubmissionVersion | undefined, who: string) => (
    <div className="space-y-1.5 min-w-0">
      <span className="text-[11px] font-semibold text-slate-600 block">{who}: {v ? label(v) : 'Chưa chọn'}</span>
      <div className="h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
        <EvidencePhoto projectId={projectId} photo={afterOf(v)} alt={`Ảnh ${v ? label(v) : ''}`} emptyText="Bản nộp này không có ảnh" fit="contain" />
      </div>
      {v && <p className="text-[10px] text-slate-500">Nhận lúc {fmtTime(v.receivedAt)} · {v.evidence.length} ảnh</p>}
    </div>
  )
  return shell(
    <>
      {data.notes.map((n) => <p key={n} role="alert" className="text-xs text-rose-700 break-words">{n}</p>)}
      <div className="space-y-2">
        {data.versions.map((v) => (
          <div key={v.submissionId} className="p-3 rounded-lg border border-slate-200 text-xs space-y-1" data-testid="submission-version">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{label(v)}</span>
              <span className="text-slate-500">Nhận lúc {fmtTime(v.receivedAt)}</span>
            </div>
            {v.review ? (
              <p className="text-slate-800">
                <span className="font-semibold">{DECISION_LABEL[v.review.decision] || v.review.decision}</span>
                {v.review.at ? ` · ${fmtTime(v.review.at)}` : ''}
                {v.review.current ? ' · review hiện hành' : ' · review của bản này (không áp cho bản khác)'}
                <span className="block text-slate-700">Lý do: {v.review.reason || NO_DATA}</span>
              </p>
            ) : (
              <p className="text-slate-500">{v.effective ? 'Bản hiện hành chưa có review của PM.' : 'Bản này không có review riêng.'}</p>
            )}
            <p className="text-slate-500">{v.evidence.length} ảnh · {v.measurements.length} số đo · hash {v.contentHash ? v.contentHash.slice(0, 12) : NO_DATA}</p>
          </div>
        ))}
      </div>
      {data.versions.length > 1 && (
        <div className="space-y-2 pt-2 border-t border-slate-100" data-testid="submission-compare">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select aria-label="Bản nộp bên trái" value={left} onChange={(e) => setLeft(e.target.value)} className="rg-field text-xs">{data.versions.map((v) => <option key={v.submissionId} value={v.submissionId}>{label(v)}</option>)}</select>
            <select aria-label="Bản nộp bên phải" value={right} onChange={(e) => setRight(e.target.value)} className="rg-field text-xs">{data.versions.map((v) => <option key={v.submissionId} value={v.submissionId}>{label(v)}</option>)}</select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{pane(lv, 'Trái')}{pane(rv, 'Phải')}</div>
        </div>
      )}
      <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
        <span className="font-semibold text-slate-700 block">Mốc thi công (theo lần thi công, tách khỏi thời điểm nộp bản)</span>
        {data.attempts.length === 0 ? <p className="text-slate-500">{NO_DATA}</p> : data.attempts.map((a) => (
          <p key={a.id} className="text-slate-700">Lần thi công #{a.number}: bắt đầu {fmtTime(a.startedAt)} · kết thúc {fmtTime(a.finishedAt)}{a.timeProvenance ? ` · nguồn thời gian ${a.timeProvenance}` : ''}</p>
        ))}
        <p className="text-slate-500">Các bản bổ sung dùng chung lần thi công; máy chủ không ghi mốc thi công riêng cho từng bản.</p>
      </div>
    </>
  )
}
export default SubmissionHistoryPanel
