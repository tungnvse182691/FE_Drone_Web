import React, { useEffect, useState } from 'react'
import { fieldTaskReadService, fieldReadError } from '../../../api/services/fieldTaskReadService'

interface Receipt { id: string; taskId: string; fileId: string; sourceKind: string; fileChecksum: string; reason: string; occurredAt: string }
interface FileMeta { fileId?: string; state?: string | null; checksum?: string | null; mediaType?: string | null; sizeBytes?: number }

/**
 * Kết quả tái sử dụng ảnh đã lưu (chỉ đọc): ảnh, nguồn, metadata, lý do từ GET hiện có.
 * Mã dài (GUID/checksum/receipt) nằm trong mục chi tiết mở rộng. Lỗi tải ảnh báo ngay tại khối ảnh, có thử lại.
 */
export const ReuseSavedResult: React.FC<{ projectId: string; taskId: string; receipt: Receipt; file: FileMeta }> = ({ projectId, taskId, receipt, file }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const c = new AbortController()
    let objectUrl = ''
    setUrl(''); setError(''); setLoading(true)
    fieldTaskReadService.evidenceImage(projectId, taskId, receipt.fileId, receipt.fileChecksum, c.signal)
      .then((img) => { if (!c.signal.aborted) { objectUrl = URL.createObjectURL(img.blob); setUrl(objectUrl) } })
      .catch((e) => { if (!c.signal.aborted) setError(fieldReadError(e)) })
      .finally(() => { if (!c.signal.aborted) setLoading(false) })
    return () => { c.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [projectId, taskId, receipt.fileId, receipt.fileChecksum, attempt])

  return (
    <div data-testid="reuse-saved-result" className="space-y-3 text-xs">
      <p role="status" className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-medium">Đã xác nhận tái sử dụng ảnh</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 w-full h-48 relative">
          {url && <img src={url} alt="Ảnh đã được duyệt tái sử dụng làm bằng chứng trước thi công" className="w-full h-full object-cover" />}
          {loading && <div role="status" className="absolute inset-0 flex items-center justify-center text-slate-600">Đang tải ảnh…</div>}
          {error && (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center text-rose-800 bg-rose-50 overflow-auto">
              <span className="font-semibold">Không tải được ảnh</span>
              <span className="break-words max-w-full">{error}</span>
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="px-2.5 py-1 rounded-md bg-white border border-rose-300 font-semibold cursor-pointer">Thử lại</button>
            </div>
          )}
        </div>
        <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between gap-2"><span className="text-slate-500">Nguồn:</span><span className="text-slate-800 font-medium">{receipt.sourceKind === 'REPORTER' ? 'Ảnh Report của người dân' : receipt.sourceKind}</span></div>
          <div className="flex justify-between gap-2"><span className="text-slate-500">Định dạng / dung lượng:</span><span className="text-slate-800">{file.mediaType || 'Chưa có dữ liệu'} · {file.sizeBytes != null ? `${file.sizeBytes} byte` : 'Chưa có dữ liệu'}</span></div>
          <div className="flex justify-between gap-2"><span className="text-slate-500">Trạng thái tệp (BE):</span><span className="text-slate-800">{file.state || 'Chưa có dữ liệu'}</span></div>
          <div className="flex justify-between gap-2"><span className="text-slate-500">Thời điểm duyệt:</span><span className="text-slate-800">{receipt.occurredAt ? new Date(receipt.occurredAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</span></div>
          <div><span className="text-slate-500 block">Lý do phê duyệt của Chỉ huy trưởng:</span><p className="text-slate-800 bg-white border border-slate-200 rounded p-2 mt-0.5 break-words">{receipt.reason || 'Chưa có dữ liệu'}</p></div>
        </div>
      </div>
      <details className="text-[11px] text-slate-500">
        <summary className="cursor-pointer text-slate-600 font-medium">Chi tiết mã (GUID, checksum, receipt)</summary>
        <div className="mt-1 space-y-0.5 font-mono break-all">
          <div>Receipt: {receipt.id}</div>
          <div>Tệp: {receipt.fileId}</div>
          <div>SHA-256: {receipt.fileChecksum}</div>
          <div>Nhiệm vụ: {receipt.taskId}</div>
        </div>
      </details>
    </div>
  )
}
export default ReuseSavedResult
