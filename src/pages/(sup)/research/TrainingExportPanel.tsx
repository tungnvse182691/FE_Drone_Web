import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../api/client'
import { aiApiErrorText } from '../../../api/services/aiRunDetailService'
import { projectExportService, type ExportJob } from '../../../api/services/projectExportService'
import { Empty, Feedback, Loading, PanelButton, PanelShell, Pill } from '../../../components/ui/PanelKit'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { useAuthStore } from '../../../store/authStore'

const statuses: Record<string, string> = { QUEUED: 'Đang chờ', RUNNING: 'Đang xử lý', SUCCEEDED: 'Sẵn sàng tải', FAILED: 'Thất bại' }

export function TrainingExportPanel({ projectId, epoch }: { projectId: string; epoch: number }) {
  const userId = useAuthStore(s => s.user?.id)
  const storageKey = `rg_training_export_${userId}_${projectId}`
  const guard = useSubmitGuard()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const exports = useQuery({
    queryKey: ['research-training-exports', epoch, projectId],
    queryFn: async ({ signal }) => (await projectExportService.list(projectId, signal)).filter(job => job.kind === 'TRAINING'),
    retry: false,
  })

  async function requestExport() {
    if (!guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const savedKey = sessionStorage.getItem(storageKey)
      const requestKey = savedKey ?? crypto.randomUUID()
      if (!savedKey) sessionStorage.setItem(storageKey, requestKey)
      const { data } = await apiClient.post<ExportJob>(`/projects/${projectId}/exports`,
        { kind: 'TRAINING', format: 'ZIP', includeOriginalFiles: false },
        { headers: { 'Idempotency-Key': requestKey } }).catch(err => {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (!savedKey && status && [400, 403, 422].includes(status)) sessionStorage.removeItem(storageKey)
        throw err
      })
      if (!data?.id || data.projectId !== projectId || data.kind !== 'TRAINING' || data.format !== 'ZIP' ||
          !data.snapshotId || !data.snapshotHash) throw new Error('Biên nhận xuất nhãn không khớp yêu cầu.')
      const confirmed = await projectExportService.detail(projectId, data.id)
      if (confirmed.kind !== data.kind || confirmed.format !== data.format ||
          confirmed.snapshotId !== data.snapshotId || confirmed.snapshotHash !== data.snapshotHash) {
        throw new Error('Lượt xuất chưa khớp biên nhận. Gửi lại để đối chiếu cùng yêu cầu.')
      }
      sessionStorage.removeItem(storageKey)
      setMessage('Đã ghi nhận yêu cầu xuất nhãn. Tải lại danh sách để xem trạng thái.')
      await exports.refetch()
    } catch (err) {
      setError(aiApiErrorText(err, 'Không xác nhận được yêu cầu xuất nhãn'))
    } finally {
      setBusy(false); guard.release()
    }
  }

  async function download(id: string) {
    if (!guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const { blob, fileName, manifest } = await projectExportService.content(projectId, id)
      if (manifest.kind !== 'TRAINING' || manifest.format !== 'ZIP') throw new Error('Tệp không khớp gói nhãn huấn luyện.')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = fileName; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      setError(aiApiErrorText(err, 'Không tải được gói nhãn'))
    } finally {
      setBusy(false); guard.release()
    }
  }

  return <PanelShell icon="archive" title="Xuất nhãn huấn luyện" className="!p-5 !rounded-[16px]"
    subtitle="Gói ZIP tập hợp nhãn đã duyệt trong dự án. Nguồn phát hiện AI được Backend hỗ trợ xuất hiện giới hạn ở mô phỏng."
    actions={<>
      <PanelButton disabled={busy || exports.isFetching} onClick={() => { void exports.refetch() }}>Tải lại</PanelButton>
      <PanelButton variant="primary" disabled={busy || !exports.isSuccess} onClick={() => { void requestExport() }}>Yêu cầu xuất ZIP</PanelButton>
    </>}>
    <Feedback error={error || (exports.error ? aiApiErrorText(exports.error, 'Không tải được danh sách xuất nhãn') : '')} message={message} />
    {exports.isLoading && <Loading>Đang đọc danh sách xuất nhãn…</Loading>}
    {exports.isSuccess && !exports.data.length && <Empty>Chưa có yêu cầu xuất nhãn trong CSDL.</Empty>}
    {exports.data?.map(job => {
      const expired = !!job.expiresAt && Date.parse(job.expiresAt) <= Date.now()
      return <div key={job.id} className="rg-row flex flex-wrap items-center justify-between gap-2">
        <span>{new Date(job.createdAt).toLocaleString('vi-VN')}</span>
        <Pill tone={job.status === 'FAILED' ? 'bad' : 'neutral'}>{expired ? 'Hết hạn' : statuses[job.status]}</Pill>
        {job.status === 'FAILED' && job.errorCode && <Feedback error={job.errorCode} />}
        {job.status === 'SUCCEEDED' && job.expiresAt && !expired && <PanelButton disabled={busy} onClick={() => { void download(job.id) }}>Tải ZIP</PanelButton>}
      </div>
    })}
  </PanelShell>
}
