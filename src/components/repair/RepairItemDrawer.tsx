import React from 'react'
import { useRepairWorkspace, repairStates as states, repairResults as results } from './useRepairWorkspace'

export function RepairItemDrawer({ workspace: s }: { workspace: ReturnType<typeof useRepairWorkspace> }) {
  const { selected, setSelected, busy, currentItem, historyError, eligibilityError, eligibility, history, canApprove, canConfirm, pendingAction, reason, setReason, decide } = s
  return <>
    {selected && <div className="fixed inset-0 z-50 bg-slate-900/40 flex justify-end" role="dialog" aria-modal="true" aria-label="Hồ sơ hạng mục sửa chữa"><div className="bg-white w-full max-w-2xl h-full overflow-y-auto p-6 space-y-5 shadow-xl">
      <div className="flex justify-between"><h2 className="font-bold text-lg">Hồ sơ hạng mục</h2><button disabled={busy} onClick={() => setSelected(null)} className="border rounded-lg px-3 py-1">Đóng</button></div>
      <p className="text-sm">{states[currentItem?.state || ''] || currentItem?.state} · {results[currentItem?.result || ''] || currentItem?.result}</p>
      {historyError && <p role="alert" className="text-red-800 bg-red-50 rounded-xl p-3 text-sm">{historyError}</p>}
      {eligibilityError && <p role="alert" className="text-red-800 bg-red-50 rounded-xl p-3 text-sm">{eligibilityError}</p>}
      {eligibility && <section className="border rounded-xl p-4 space-y-2 text-sm"><h3 className="font-bold">Điều kiện xử lý nhanh</h3><p>{eligibility.eligible ? 'Đủ điều kiện tại thời điểm đọc' : 'Chưa đủ điều kiện tại thời điểm đọc'}</p>{eligibility.missingReasons.map(r => <p key={r} className="text-amber-800">Lý do từ nguồn: {r}</p>)}{eligibility.rules.map(r => <p key={r.code}>{r.code}: {r.minimum}–{r.maximum} {r.unit}</p>)}{eligibility.executionExpiresAt && <p>Hạn thực hiện: {new Date(eligibility.executionExpiresAt).toLocaleString('vi-VN')}</p>}</section>}
      {!history && !historyError && <p>Đang đọc lịch sử…</p>}
      {history && <><h3 className="font-semibold">Quyết định đã ghi nhận</h3>{!history.decisions.length && <p className="text-sm text-slate-500">Chưa có quyết định.</p>}{history.decisions.map(d => <div key={d.id} className="border rounded-xl p-3 text-sm"><p>{new Date(d.at).toLocaleString('vi-VN')} · {d.role === 'SUPERVISOR' ? 'Giám sát' : d.role === 'PROJECT_MANAGER' ? 'Chỉ huy trưởng' : d.role}</p><p>{results[d.result] || d.result}</p><p>{d.reason}</p></div>)}
        <h3 className="font-semibold">Lịch sử thi công và bằng chứng</h3>{!history.attempts.length && <p className="text-sm text-slate-500">Chưa có lần thi công được nộp. Không có ảnh Trước/Sau hoặc số đo để đối chiếu.</p>}{history.attempts.map((a, i) => <div key={a.id} className="border rounded-xl p-3 text-sm"><b>Lần thi công {i + 1}</b><p>{a.performed ? 'Đã thi công' : a.unperformedReason || 'Chưa thi công'}</p><p>{a.startedAt ? new Date(a.startedAt).toLocaleString('vi-VN') : 'Chưa có giờ bắt đầu'} → {a.finishedAt ? new Date(a.finishedAt).toLocaleString('vi-VN') : 'Chưa có giờ kết thúc'}</p><p>{a.evidence.length} bằng chứng; {a.evidence.filter(e => e.verified).length} đã xác minh.</p><p className="text-amber-800">Chưa nối trình xem ảnh/bản đo từ nguồn này; cần kiểm tra đủ bằng chứng trước khi xác nhận.</p></div>)}
        <h3 className="font-semibold">Yêu cầu rà soát lại</h3>{history.reviewRequests.length ? history.reviewRequests.map(r => <p key={r.id} className="text-sm">{new Date(r.at).toLocaleString('vi-VN')} · {r.reason}</p>) : <p className="text-sm text-slate-500">Chưa có yêu cầu.</p>}</>}
      {(canApprove || canConfirm || pendingAction) && <div className="space-y-3 border-t pt-4"><label className="block text-sm font-semibold">Lý do quyết định<textarea aria-label="Lý do quyết định sửa chữa" disabled={busy || !!pendingAction} value={reason} onChange={e => setReason(e.target.value)} className="block w-full border rounded-xl p-3 mt-2" /></label>
        {pendingAction && <p className="text-xs text-amber-800">Đang giữ nguyên yêu cầu trước. Đã có receipt thì chỉ đọc lại; chưa rõ kết quả thì dùng lại đúng key, lý do và phiên bản.</p>}
        {canApprove && !pendingAction && <button disabled={busy || !history || !reason.trim()} onClick={() => decide('approve')} className="bg-[#C9A227] text-white px-4 py-2 rounded-xl disabled:opacity-50">Phê duyệt hạng mục</button>}
        {canConfirm && !pendingAction && <p className="text-sm text-amber-800">Chưa cho xác nhận cuối vì trình xem bằng chứng và bản đo chưa nối đủ. Không thể nghiệm thu chỉ dựa vào trạng thái.</p>}
        {pendingAction && <button disabled={busy} onClick={() => decide(pendingAction)} className="border rounded-xl px-4 py-2 disabled:opacity-50">Đối chiếu yêu cầu đang chờ</button>}
      </div>}
    </div></div>}
  </>
}
