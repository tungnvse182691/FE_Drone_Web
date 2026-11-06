import React, { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { alignmentService, type CrsProfileView } from '../../../api/services/alignmentService'
import { useAuthStore } from '../../../store/authStore'

/** Layout recovered from reflog b6400d6; current server reader replaces its local presets/store. */
export const ProjectCrsProfileCard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const epoch = useAuthStore(state => state.authEpoch)
  const [profiles, setProfiles] = useState<CrsProfileView[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    let active = true
    setProfiles([]); setSelectedId(''); setError(''); setOpen(false); setLoading(true)
    alignmentService.fetchCrsProfiles(projectId).then(items => {
      if (active) setProfiles(items)
    }).catch(() => { if (active) setError('Không thể tải hồ sơ hệ quy chiếu. Vui lòng thử lại.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [projectId, epoch, reload])
  const profile = profiles.find(item => item.id === selectedId)
  const fields = [
    { label: 'Mã hệ quy chiếu', value: profile?.code },
    { label: 'Hệ tọa độ nguồn', value: profile?.definition?.sourceSrid },
    { label: 'Thứ tự trục', value: profile?.definition?.axisOrder },
    { label: 'Đơn vị quy đổi', value: profile?.definition?.metresPerUnit },
    { label: 'Nguồn tham chiếu', value: profile?.definition?.sourceReference },
  ]
  return <section className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden space-y-4"><div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1E40AF] to-slate-200" /><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Icon name="public" size={20} className="text-[#C9A227]" />Hồ sơ hệ quy chiếu</h2><button type="button" disabled={loading} onClick={() => setReload(value => value + 1)} aria-label="Tải lại hồ sơ hệ quy chiếu" className="p-1.5 text-slate-500 border rounded-lg"><Icon name="refresh" size={16} /></button></header>
    {loading && <p role="status" className="text-xs text-slate-500">Đang tải hồ sơ hệ quy chiếu...</p>}
    {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    {!loading && !error && profiles.length === 0 && <p className="text-xs text-slate-500">Chưa có hồ sơ hệ quy chiếu trong dự án.</p>}
    <label className="block text-xs text-slate-500">Hồ sơ dự án<select aria-label="Hồ sơ hệ quy chiếu dự án" value={selectedId} disabled={loading || !!error} onChange={event => setSelectedId(event.target.value)} className="mt-1 border border-slate-200 rounded-lg p-2 w-full text-xs text-slate-700"><option value="">Chọn hồ sơ hệ quy chiếu</option>{profiles.map(item => <option key={item.id} value={item.id}>{item.code}</option>)}</select></label>
    <dl className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">{fields.map(field => <div key={field.label} className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">{field.label}</dt><dd className="text-slate-700 break-all">{field.value ?? 'Chưa cập nhật'}</dd></div>)}</dl>
    <button type="button" onClick={() => setOpen(true)} className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 w-full inline-flex justify-center items-center gap-2"><Icon name="tune" size={16} />Quản lý hồ sơ hệ quy chiếu</button>
    {open && <div role="dialog" aria-modal="true" aria-label="Hồ sơ hệ quy chiếu dự án" className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"><section className="bg-white border rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4"><header className="border-b pb-3 flex justify-between gap-3"><h2 className="font-bold">Hồ sơ hệ quy chiếu dự án</h2><button type="button" onClick={() => setOpen(false)} aria-label="Đóng hồ sơ hệ quy chiếu"><Icon name="close" size={20} /></button></header><fieldset disabled className="grid sm:grid-cols-2 gap-3">{fields.map(field => <label key={field.label} className="text-xs text-slate-500">{field.label}<input value={String(field.value ?? '')} readOnly placeholder="Chưa cập nhật" className="block mt-1 w-full border border-slate-200 rounded-lg p-2 bg-slate-50" /></label>)}</fieldset><p className="text-xs text-slate-500">Chỉ đọc hồ sơ đã chọn. Chưa tích hợp tạo hoặc thay đổi hồ sơ tại đây; không tự gán hệ quy chiếu hoặc chuyển đổi tọa độ đầu vào.</p><footer className="border-t pt-3 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="border rounded-lg px-3 py-2 text-xs">Đóng</button><button type="button" disabled className="border rounded-lg px-3 py-2 text-xs text-slate-400">Lưu hồ sơ</button></footer></section></div>}
  </section>
}
