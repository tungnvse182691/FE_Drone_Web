import React, { useCallback, useEffect, useState } from 'react'
import { defectTypeAdminService, type DefectTypeAdmin } from '../../../api/services/defectTypeAdminService'
import { exportError } from '../../../api/services/projectExportService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { Empty, Feedback, Field, Loading, PanelButton, Pill, SectionTitle } from '../../../components/ui/PanelKit'

/** Supervisor quản trị danh mục loại hư hỏng (mã bất biến; ngừng áp dụng giữ hàng dữ liệu cho hồ sơ cũ). */
export const DefectTypeAdminPanel: React.FC = () => {
  const [rows, setRows] = useState<DefectTypeAdmin[] | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<string>('') // '' = không sửa, '__new' = thêm mới, còn lại = code
  const [code, setCode] = useState(''), [name, setName] = useState(''), [description, setDescription] = useState(''), [isActive, setIsActive] = useState(true), [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = useSubmitGuard()

  const load = useCallback(async () => {
    try { setRows(await defectTypeAdminService.list()); setError('') } catch (e) { setRows([]); setError(`Không đọc được danh mục: ${exportError(e)}`) }
  }, [])
  useEffect(() => { void load() }, [load])

  const begin = (row?: DefectTypeAdmin) => {
    setMessage(''); setError(''); setReason('')
    if (row) { setEditing(row.code); setCode(row.code); setName(row.name); setDescription(row.description || ''); setIsActive(row.isActive) }
    else { setEditing('__new'); setCode(''); setName(''); setDescription(''); setIsActive(true) }
  }
  const save = async () => {
    if (!guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const input = { name, description, isActive, reason }
      if (editing === '__new') await defectTypeAdminService.create(code, input)
      else await defectTypeAdminService.update(rows!.find((r) => r.code === editing)!, input)
      setMessage(editing === '__new' ? 'Đã thêm loại hư hỏng.' : 'Đã cập nhật loại hư hỏng.'); setEditing(''); await load()
    } catch (e: any) {
      const c = e?.response?.data?.code
      setError(c === 'defect_type_code_exists' ? 'Mã đã tồn tại.' : c === 'concurrency_conflict' ? 'Mục đã thay đổi. Tải lại danh mục rồi xác nhận lại trước khi gửi.' : exportError(e))
      if (c === 'concurrency_conflict') await load()
    } finally { setBusy(false); guard.release() }
  }

  return (
    <div className="space-y-3" data-testid="defect-type-admin">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle icon="category">Danh mục loại hư hỏng (Giám sát quản trị)</SectionTitle>
        <PanelButton variant="primary" disabled={busy || editing !== ''} onClick={() => begin()}>Thêm loại hư hỏng</PanelButton>
      </div>
      <Feedback error={error} message={message} />
      {rows === null && <Loading>Đang tải danh mục từ máy chủ…</Loading>}
      {rows && rows.length === 0 && !error && <Empty icon="category">Chưa có loại hư hỏng trong danh mục.</Empty>}
      {editing && (
        <div className="rg-subcard space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Mã (bất biến)" span=""><input aria-label="Mã loại hư hỏng" className="rg-field uppercase" value={code} disabled={busy || editing !== '__new'} maxLength={80} onChange={(e) => setCode(e.target.value.toUpperCase())} /></Field>
            <Field label="Tên" span=""><input aria-label="Tên loại hư hỏng" className="rg-field" value={name} disabled={busy} maxLength={150} onChange={(e) => setName(e.target.value)} /></Field>
          </div>
          <Field label="Mô tả" span=""><textarea aria-label="Mô tả loại hư hỏng" className="rg-field" rows={2} value={description} disabled={busy} maxLength={2000} onChange={(e) => setDescription(e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isActive} disabled={busy} onChange={(e) => setIsActive(e.target.checked)} />Đang áp dụng (bỏ chọn để ngừng áp dụng; hồ sơ cũ vẫn tham chiếu)</label>
          <Field label="Lý do" span=""><input aria-label="Lý do thay đổi danh mục" className="rg-field" value={reason} disabled={busy} maxLength={1000} onChange={(e) => setReason(e.target.value)} /></Field>
          <div className="flex gap-2">
            <PanelButton variant="primary" loading={busy} disabled={busy || !name.trim() || !reason.trim() || (editing === '__new' && !code.trim())} onClick={() => { void save() }}>{busy ? 'Đang gửi…' : 'Lưu'}</PanelButton>
            <PanelButton disabled={busy} onClick={() => setEditing('')}>Hủy</PanelButton>
          </div>
        </div>
      )}
      {rows && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.code} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-brand-border bg-white px-3 py-2">
              <span className="font-mono text-xs font-semibold text-brand-dark">{r.code}</span>
              <span className="text-xs text-slate-800 min-w-0 flex-1 truncate">{r.name}{r.description ? <span className="text-slate-500"> · {r.description}</span> : null}</span>
              <Pill tone={r.isActive ? 'ok' : 'neutral'}>{r.isActive ? 'Đang áp dụng' : 'Ngừng áp dụng'}</Pill>
              <PanelButton disabled={busy || editing !== ''} onClick={() => begin(r)} aria-label={`Sửa ${r.code}`}>Sửa</PanelButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
