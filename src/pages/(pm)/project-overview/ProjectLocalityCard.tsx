import React, { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { Feedback, Field, Loading, PanelButton, PanelShell } from '../../../components/ui/PanelKit'

/**
 * Giám sát nhập/sửa ĐỊA BÀN của dự án: GET /projects/overviews?ids= (locality + version) → PUT /projects/{p}/locality
 * {locality (≤500, nullable), reason} với If-Match = version của overview. Reload đọc lại overview.
 */
export const ProjectLocalityCard: React.FC<{ projectId: string; onSaved?: () => void }> = ({ projectId, onSaved }) => {
  const [loaded, setLoaded] = useState<{ locality: string | null; version: string } | null>(null)
  const [locality, setLocality] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const guard = useSubmitGuard()

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get<Array<{ projectId: string; locality?: string | null; version: string }>>('/projects/overviews', { params: { ids: [projectId] }, paramsSerializer: { indexes: null } })
      const o = Array.isArray(data) ? data.find((x) => x.projectId?.toLowerCase() === projectId.toLowerCase()) : null
      if (!o?.version) throw new Error('BE trả overview thiếu dự án/version.')
      setLoaded({ locality: o.locality ?? null, version: o.version }); setLocality(o.locality ?? ''); setError('')
    } catch (e) { setError(`Không đọc được địa bàn: ${exportError(e)}`) }
  }, [projectId])
  useEffect(() => { void load() }, [load])

  const save = async () => {
    if (!loaded || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const v = loaded.version.startsWith('"') ? loaded.version : `"${loaded.version}"`
      await apiClient.put(`/projects/${projectId}/locality`, { locality: locality.trim() || null, reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': v } })
      setMessage('Đã lưu địa bàn. Dữ liệu được đọc lại từ máy chủ.'); setReason(''); await load(); onSaved?.()
    } catch (e: any) {
      setError(e?.response?.data?.code === 'concurrency_conflict' ? 'Dự án đã thay đổi. Dữ liệu đã tải lại; xác nhận lại rồi gửi.' : exportError(e))
      if (e?.response?.data?.code === 'concurrency_conflict') await load()
    } finally { setBusy(false); guard.release() }
  }

  return (
    <PanelShell icon="location_on" title="Địa bàn dự án" subtitle="Giám sát nhập địa bàn; PM và các màn khác đọc lại từ máy chủ" data-testid="project-locality-card">
      {!loaded && !error && <Loading>Đang đọc địa bàn…</Loading>}
      <Feedback error={error} message={message} />
      {loaded && (
        <div className="space-y-3">
          <Field label="Địa bàn (tối đa 500 ký tự)" span=""><input aria-label="Địa bàn dự án" className="rg-field" maxLength={500} value={locality} disabled={busy} onChange={(e) => setLocality(e.target.value)} /></Field>
          <Field label="Lý do" span=""><input aria-label="Lý do cập nhật địa bàn" className="rg-field" maxLength={1000} value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} /></Field>
          <PanelButton variant="primary" loading={busy} disabled={busy || !reason.trim() || (locality.trim() === (loaded.locality ?? ''))} onClick={() => { void save() }}>{busy ? 'Đang gửi…' : 'Lưu địa bàn'}</PanelButton>
        </div>
      )}
    </PanelShell>
  )
}
