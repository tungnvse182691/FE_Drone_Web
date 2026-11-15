import React, { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { alignmentService, type CrsProfileView } from '../../../api/services/alignmentService'
import { useAuthStore } from '../../../store/authStore'
import {RoleCode} from '../../../types/enums'
import {CreateCrsProfileModal} from './CreateCrsProfileModal'

/** Layout recovered from reflog b6400d6; current server reader replaces its local presets/store. */
export const ProjectCrsProfileCard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const epoch = useAuthStore(state => state.authEpoch)
  const role = useAuthStore(state => state.user?.role)
  const [profiles, setProfiles] = useState<CrsProfileView[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [open, setOpen] = useState(false)
  const scope = `${epoch}:${projectId}`
  const [permission,setPermission]=useState(''),[permissionError,setPermissionError]=useState(''),[createScope,setCreateScope]=useState(''),[message,setMessage]=useState('')
  const [listScope, setListScope] = useState('')
  const [detail, setDetail] = useState<{scope:string;id:string;profile?:CrsProfileView;error?:string}|null>(null)
  useEffect(()=>{
    let active=true;setPermission('');setPermissionError('');setCreateScope('');setMessage('')
    if(role===RoleCode.PROJECT_MANAGER&&projectId)alignmentService.readProjectContext(projectId).then(context=>{if(active&&context.projectId===projectId&&(context as {accessRole?:string}).accessRole==='PM')setPermission(scope)}).catch(()=>{if(active)setPermissionError('Không kiểm tra được quyền tạo hồ sơ CRS. Hãy tải lại hồ sơ hệ quy chiếu.')})
    return()=>{active=false}
  },[scope,role,reload])
  useEffect(() => {
    let active = true
    setProfiles([]); setListScope(''); setSelectedId(''); setError(''); setOpen(false); setLoading(true)
    alignmentService.fetchCrsProfiles(projectId).then(items => {
      if (active) { setProfiles(items); setListScope(scope) }
    }).catch(() => { if (active) setError('Không thể tải hồ sơ hệ quy chiếu. Vui lòng thử lại.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [projectId, epoch, reload])
  const selected = listScope === scope && !loading && !error ? profiles.find(item => item.id === selectedId && item.projectId === projectId) : undefined
  useEffect(() => {
    let active = true
    setDetail(null)
    if (selected) alignmentService.readCrsProfile(projectId, selected.id).then(profile => {
      if (active) setDetail({scope,id:selected.id,profile})
    }).catch(() => { if (active) setDetail({scope,id:selected.id,error:'Không thể tải chi tiết hồ sơ hệ quy chiếu. Vui lòng tải lại.'}) })
    return () => { active = false }
  }, [scope, selected?.id, reload])
  const currentDetail = detail?.scope === scope && detail.id === selected?.id ? detail : null
  const profile = currentDetail?.profile
  const fields = [
    { label: 'Mã hệ quy chiếu', value: profile?.code },
    { label: 'Hệ tọa độ nguồn', value: profile?.definition?.sourceSrid },
    { label: 'Thứ tự trục', value: profile?.definition?.axisOrder },
    { label: 'Đơn vị quy đổi', value: profile?.definition?.metresPerUnit },
    { label: 'Nguồn tham chiếu', value: profile?.definition?.sourceReference },
    { label: 'Lần sửa đổi', value: profile?.revision },
    { label: 'Trạng thái hồ sơ', value: profile?.status },
    { label: 'Datum', value: profile?.definition?.datum },
    { label: 'Phép chiếu', value: profile?.definition?.projection },
    { label: 'Checksum nguồn', value: profile?.definition?.sourceChecksum },
    { label: 'Dung sai theo nguồn (m)', value: profile?.definition?.sourcedToleranceMeters },
    { label: 'Nguồn dung sai', value: profile?.definition?.toleranceSource },
    { label: 'Dữ liệu mẫu', value: profile?.definition?.sampleOnly == null ? undefined : profile.definition.sampleOnly ? 'Có' : 'Không' },
    { label: 'Ngày tạo', value: profile?.createdAt },
  ]
  return <section className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden space-y-4"><div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1E40AF] to-slate-200" /><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Icon name="public" size={20} className="text-[#C9A227]" />Hồ sơ hệ quy chiếu</h2><button type="button" disabled={loading} onClick={() => setReload(value => value + 1)} aria-label="Tải lại hồ sơ hệ quy chiếu" className="p-1.5 text-slate-500 border rounded-lg"><Icon name="refresh" size={16} /></button></header>
    {loading && <p role="status" className="text-xs text-slate-500">Đang tải hồ sơ hệ quy chiếu...</p>}
    {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    {permissionError&&<p role="alert" className="text-xs text-rose-700">{permissionError}</p>}
    {role===RoleCode.PROJECT_MANAGER&&permission===scope&&<button type="button" onClick={()=>setCreateScope(scope)} className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2"><Icon name="add" size={16}/>Tạo hồ sơ CRS</button>}
    {message&&<p role="status" className="text-xs text-emerald-700">{message}</p>}
    {createScope===scope&&permission===scope&&role===RoleCode.PROJECT_MANAGER&&<CreateCrsProfileModal key={scope} projectId={projectId} onClose={()=>setCreateScope('')} onCreated={(items,created)=>{setProfiles(items);setListScope(scope);setSelectedId(created.id);setLoading(false);setError('');setCreateScope('');setMessage('Đã tạo và đọc lại hồ sơ hệ quy chiếu.')}}/>}
    {selected && !currentDetail && <p role="status" className="text-xs text-slate-500">Đang tải chi tiết hồ sơ hệ quy chiếu...</p>}
    {currentDetail?.error && <p role="alert" className="text-xs text-rose-700">{currentDetail.error}</p>}
    {!loading && !error && profiles.length === 0 && <p className="text-xs text-slate-500">Chưa có hồ sơ hệ quy chiếu trong dự án.</p>}
    <label className="block text-xs text-slate-500">Hồ sơ dự án<select aria-label="Hồ sơ hệ quy chiếu dự án" value={selectedId} disabled={loading || !!error} onChange={event => setSelectedId(event.target.value)} className="mt-1 border border-slate-200 rounded-lg p-2 w-full text-xs text-slate-700"><option value="">Chọn hồ sơ hệ quy chiếu</option>{profiles.map(item => <option key={item.id} value={item.id}>{item.code}</option>)}</select></label>
    {selected && <dl className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">{fields.map(field => <div key={field.label} className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">{field.label}</dt><dd className="text-slate-700 break-all">{field.value ?? 'Chưa cập nhật'}</dd></div>)}</dl>}
    <button type="button" disabled={!selected} onClick={() => setOpen(true)} className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 w-full inline-flex justify-center items-center gap-2"><Icon name="tune" size={16} />Quản lý hồ sơ hệ quy chiếu</button>
    {open && <div role="dialog" aria-modal="true" aria-label="Hồ sơ hệ quy chiếu dự án" className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"><section className="bg-white border rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4"><header className="border-b pb-3 flex justify-between gap-3"><h2 className="font-bold">Hồ sơ hệ quy chiếu dự án</h2><button type="button" onClick={() => setOpen(false)} aria-label="Đóng hồ sơ hệ quy chiếu"><Icon name="close" size={20} /></button></header><fieldset disabled className="grid sm:grid-cols-2 gap-3">{fields.map(field => <label key={field.label} className="text-xs text-slate-500">{field.label}<input value={String(field.value ?? '')} readOnly placeholder="Chưa cập nhật" className="block mt-1 w-full border border-slate-200 rounded-lg p-2 bg-slate-50" /></label>)}</fieldset><p className="text-xs text-slate-500">Chỉ đọc hồ sơ đã chọn; không tự gán hệ quy chiếu hoặc chuyển đổi tọa độ đầu vào.</p><footer className="border-t pt-3 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="border rounded-lg px-3 py-2 text-xs">Đóng</button><button type="button" disabled className="border rounded-lg px-3 py-2 text-xs text-slate-400">Lưu hồ sơ</button></footer></section></div>}
  </section>
}
