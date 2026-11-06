import React, { useState, useEffect } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from './types'
import { projectService, type ProjectClosureView } from '../../../api/services/projectService'
import { useAuthStore } from '../../../store/authStore'

interface CloseProjectModalProps {
  isOpen: boolean
  project: HubProject | null
  onClose: () => void
  onConfirm: (reason: string, version: string) => Promise<void>
}

export const CloseProjectModal: React.FC<CloseProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirm
}) => {
  const epoch = useAuthStore(state => state.authEpoch)
  const [reason, setReason] = useState('')
  const [snapshot, setSnapshot] = useState<{ data: ProjectClosureView; etag: string } | null>(null)
  const [loading, setLoading] = useState(false), [busy, setBusy] = useState(false)
  const [error, setError] = useState(''), [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    setSnapshot(null); setReason(''); setError('')
    if (!isOpen || !project) return () => { active = false }
    setLoading(true)
    projectService.readProjectClosure(project.id).then(data => { if (active) setSnapshot(data) })
      .catch(e => { if (active) { console.warn('[Project closure read]', { status: e?.response?.status, code: e?.response?.data?.code, correlationId: e?.response?.data?.correlationId }); setError('Không thể tải điều kiện đóng dự án. Vui lòng thử lại.') } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isOpen, project?.id, epoch, reload])
  if (!isOpen || !project) return null
  const eligible = snapshot?.data.operationalClosureEligibility === 'ELIGIBLE' && snapshot.data.operationalClosure !== 'CONFIRMED'
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!snapshot || !eligible || busy || !reason.trim()) return
    const started = useAuthStore.getState().authEpoch
    setBusy(true); setError('')
    try { await onConfirm(reason.trim(), snapshot.etag); if (started === useAuthStore.getState().authEpoch) onClose() }
    catch (e: any) {
      if (started !== useAuthStore.getState().authEpoch) return
      console.warn('[Project closure]', { status: e?.response?.status, code: e?.response?.data?.code, correlationId: e?.response?.data?.correlationId })
      setError([409, 412, 428].includes(e?.response?.status) ? 'Hồ sơ hoặc điều kiện đóng đã thay đổi. Vui lòng tải lại và đối chiếu trước khi gửi tiếp.' : 'Không thể xác nhận đóng dự án. Vui lòng kiểm tra lại.')
    } finally { if (started === useAuthStore.getState().authEpoch) setBusy(false) }
  }
  return <div role="dialog" aria-label="Đóng vận hành dự án" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <form onSubmit={submit} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-amber-50 text-[#C9A227] p-3"><Icon name="task_alt" size={24} /></span><div><h2 className="text-lg font-bold">Đóng vận hành dự án</h2><p className="text-xs text-slate-500 mt-1">Kiểm tra hồ sơ trước khi xác nhận</p></div></div><button type="button" aria-label="Đóng hộp thoại" disabled={busy} onClick={onClose} className="p-1 text-slate-400"><Icon name="close" size={20} /></button></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500 mb-1">Dự án</p><p className="text-sm font-bold">{project.name}</p></div>
      <p className="text-sm text-slate-600">Điều kiện đóng được xác nhận theo hồ sơ nghĩa vụ trên máy chủ. Thao tác này không tự kết thúc bảo hành hoặc xóa bằng chứng.</p>
      {loading && <p role="status">Đang kiểm tra điều kiện...</p>}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {snapshot && <p role="status">{snapshot.data.operationalClosure === 'CONFIRMED' ? 'Dự án đã được đóng vận hành.' : eligible ? 'Hồ sơ đủ điều kiện gửi yêu cầu đóng.' : 'Hồ sơ chưa đủ điều kiện đóng vận hành. Vui lòng hoàn tất các nghĩa vụ còn lại.'}</p>}
      <label className="block text-sm">Lý do<textarea aria-label="Lý do đóng vận hành" value={reason} maxLength={2000} onChange={e => setReason(e.target.value)} className="block w-full border rounded-lg p-2" /></label>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={busy || loading} onClick={() => setReload(n => n + 1)} className="border rounded-lg px-3 py-2 text-sm">Tải lại</button>
        <button type="button" disabled={busy} onClick={onClose} className="border rounded-lg px-3 py-2 text-sm">Hủy</button>
        <button type="submit" disabled={!eligible || !reason.trim() || busy || loading} className="bg-[#C9A227] hover:bg-[#B38E1E] text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50">Xác nhận đóng vận hành</button>
      </div>
    </form>
  </div>
}
