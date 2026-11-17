import React, { useState } from 'react'
import { publicPublicationService, type PublicPublication } from '../../../api/services/publicPublicationService'
import { exportError } from '../../../api/services/projectExportService'
import { Feedback, KV, PanelButton, PanelShell, Pill } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

/** PM: xuất bản khiếm khuyết đã xác minh lên trang công khai, hoặc rút xuất bản (spec PM-11). */
export const DefectPublicationPanel: React.FC<{ projectId: string; defectId: string }> = ({ projectId, defectId }) => {
  const [publication, setPublication] = useState<PublicPublication | null>(null)
  const [publicId, setPublicId] = useState('')
  const [busy, setBusy] = useState('')
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const run = async (key: string, fn: () => Promise<PublicPublication>, done: string) => {
    if (!guard.acquire()) return
    setBusy(key); setError(''); setMessage('')
    try { const p = await fn(); setPublication(p); setPublicId(p.publicId); setMessage(done) } catch (e) { setError(exportError(e)) } finally { setBusy(''); guard.release() }
  }

  const cls = 'rg-field'

  return (
    <PanelShell icon="public" title="Xuất bản công khai" className="!rounded-[16px]" data-testid="defect-publication-panel"
      actions={<PanelButton variant="primary" disabled={!!busy} loading={busy === 'publish'} onClick={() => { void run('publish', () => publicPublicationService.publish(projectId, defectId), 'Đã xuất bản khiếm khuyết.') }}>{busy === 'publish' ? 'Đang gửi…' : 'Xuất bản khiếm khuyết'}</PanelButton>}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[14rem] flex-1"><span className="rg-label">Mã công khai</span><input aria-label="Mã công khai" value={publicId} disabled={!!busy} onChange={(e) => setPublicId(e.target.value)} placeholder="Mã công khai (publicId)" className={`${cls} w-full font-mono`} /></div>
        <PanelButton variant="danger" disabled={!!busy || !publicId.trim()} loading={busy === 'withdraw'} onClick={() => { void run('withdraw', () => publicPublicationService.withdraw(projectId, publicId), 'Đã rút xuất bản.') }}>{busy === 'withdraw' ? 'Đang gửi…' : 'Rút xuất bản'}</PanelButton>
        <PanelButton disabled={!!busy || !publicId.trim()} onClick={() => { void run('read', () => publicPublicationService.readPublic(publicId), 'Đã đọc trang công khai.') }}>Xem công khai</PanelButton>
      </div>
      {publication && (
        <div className="rg-subcard">
          <KV items={[
            { k: 'Mã', v: publication.publicId, mono: true },
            { k: 'Loại', v: publication.damageCategory || '—' },
            { k: 'Trạng thái', v: <Pill tone="info">{publication.publicStatus}</Pill> },
            ...(publication.publishedAt ? [{ k: 'Xuất bản', v: new Date(publication.publishedAt).toLocaleString('vi-VN') }] : []),
          ]} />
        </div>
      )}
      <Feedback error={error} message={message} />
    </PanelShell>
  )
}
