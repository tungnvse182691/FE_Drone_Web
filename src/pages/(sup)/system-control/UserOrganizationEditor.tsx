import React, { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { Feedback, PanelButton } from '../../../components/ui/PanelKit'

/** Giám sát đọc/sửa ĐƠN VỊ CÔNG TÁC của tài khoản: GET /users/{id}/organization → PUT (If-Match + Idempotency-Key + reason). Không phải vai trò hay membership dự án. */
export const UserOrganizationEditor: React.FC<{ userId: string }> = ({ userId }) => {
  const [loaded, setLoaded] = useState<{ organization: string | null; version: string } | null>(null)
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const guard = useSubmitGuard()

  const load = useCallback(async () => {
    setLoaded(null)
    try {
      const r = await apiClient.get<{ userId: string; organization?: string | null; version?: string }>(`/users/${userId}/organization`)
      const version = (r.headers.etag as string | undefined) || (r.data.version ? `"${r.data.version}"` : '')
      if (r.data.userId?.toLowerCase() !== userId.toLowerCase() || !version) throw new Error('BE trả đơn vị công tác sai tài khoản/thiếu phiên bản.')
      setLoaded({ organization: r.data.organization ?? null, version }); setValue(r.data.organization ?? ''); setError('')
    } catch (e) { setError(`Không đọc được đơn vị công tác: ${exportError(e)}`) }
  }, [userId])
  useEffect(() => { void load() }, [load])

  const save = async () => {
    if (!loaded || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      await apiClient.put(`/users/${userId}/organization`, { organization: value.trim() || null, reason: reason.trim() }, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': loaded.version } })
      setMessage('Đã lưu đơn vị công tác.'); setReason(''); await load()
    } catch (e: any) {
      const c = e?.response?.data?.code
      setError(c === 'concurrency_conflict' ? 'Hồ sơ đã thay đổi. Đã tải lại; xác nhận lại rồi gửi.' : exportError(e))
      if (c === 'concurrency_conflict') await load()
    } finally { setBusy(false); guard.release() }
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-3" data-testid="user-organization">
      <label className="font-semibold text-slate-700 block">Đơn vị công tác (tối đa 255 ký tự)</label>
      <input aria-label="Đơn vị công tác" className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs" maxLength={255} value={value} disabled={busy || !loaded} onChange={(e) => setValue(e.target.value)} />
      <input aria-label="Lý do cập nhật đơn vị" placeholder="Lý do cập nhật" className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs" maxLength={1000} value={reason} disabled={busy || !loaded} onChange={(e) => setReason(e.target.value)} />
      <Feedback error={error} message={message} />
      <PanelButton variant="primary" loading={busy} disabled={busy || !loaded || !reason.trim() || value.trim() === (loaded?.organization ?? '')} onClick={() => { void save() }}>{busy ? 'Đang gửi…' : 'Lưu đơn vị công tác'}</PanelButton>
    </div>
  )
}
