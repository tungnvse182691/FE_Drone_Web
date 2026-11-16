import React, { useState } from 'react'
import { publicPublicationService, type PublicPublication } from '../../../api/services/publicPublicationService'
import { exportError } from '../../../api/services/projectExportService'

/** PM: xuất bản khiếm khuyết đã xác minh lên trang công khai, hoặc rút xuất bản (spec PM-11). */
export const DefectPublicationPanel: React.FC<{ projectId: string; defectId: string }> = ({ projectId, defectId }) => {
  const [publication, setPublication] = useState<PublicPublication | null>(null)
  const [publicId, setPublicId] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const run = async (key: string, fn: () => Promise<PublicPublication>, done: string) => {
    if (busy) return
    setBusy(key); setError(''); setMessage('')
    try { const p = await fn(); setPublication(p); setPublicId(p.publicId); setMessage(done) } catch (e) { setError(exportError(e)) } finally { setBusy('') }
  }
  const cls = 'border border-[#E2E5E9] rounded-lg p-2 text-xs'

  return (
    <section className="bg-white rounded-[16px] border border-[#E2E5E9] p-4 space-y-2 text-xs" data-testid="defect-publication-panel">
      <h4 className="font-bold text-[#1A1D20]">Xuất bản công khai</h4>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!!busy} onClick={() => { void run('publish', () => publicPublicationService.publish(projectId, defectId), 'Đã xuất bản khiếm khuyết.') }} className={cls}>{busy === 'publish' ? 'Đang gửi…' : 'Xuất bản khiếm khuyết'}</button>
      </div>
      <div className="flex gap-2">
        <input aria-label="Mã công khai" value={publicId} disabled={!!busy} onChange={(e) => setPublicId(e.target.value)} placeholder="Mã công khai (publicId)" className={`${cls} flex-1`} />
        <button type="button" disabled={!!busy || !publicId.trim()} onClick={() => { void run('withdraw', () => publicPublicationService.withdraw(projectId, publicId), 'Đã rút xuất bản.') }} className={cls}>{busy === 'withdraw' ? 'Đang gửi…' : 'Rút xuất bản'}</button>
        <button type="button" disabled={!!busy || !publicId.trim()} onClick={() => { void run('read', () => publicPublicationService.readPublic(publicId), 'Đã đọc trang công khai.') }} className={cls}>Xem công khai</button>
      </div>
      {publication && <p>Mã {publication.publicId} · loại {publication.damageCategory || '—'} · trạng thái <b>{publication.publicStatus}</b>{publication.publishedAt ? ` · xuất bản ${new Date(publication.publishedAt).toLocaleString('vi-VN')}` : ''}</p>}
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {message && <p role="status" className="text-emerald-800">{message}</p>}
    </section>
  )
}
