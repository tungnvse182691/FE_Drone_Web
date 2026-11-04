import React, { useEffect, useRef, useState } from 'react'
import { getPhoneSessionKey, selfPhoneService, type SelfPhoneNumberFact } from '../../api/services/profileService'

export const SelfPhoneNumberForm: React.FC = () => {
  const session = getPhoneSessionKey()
  const active = useRef(true)
  const busy = useRef(false)
  const [fact, setFact] = useState<SelfPhoneNumberFact | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState(selfPhoneService.pending())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const current = () => active.current && session === getPhoneSessionKey()

  const read = async (keepDraft: boolean, signal?: AbortSignal) => {
    const next = await selfPhoneService.read(signal)
    if (!current() || signal?.aborted) return
    setFact(next)
    setPending(selfPhoneService.pending())
    if (!keepDraft) setDraft(selfPhoneService.pending()?.phoneNumber || next.phoneNumber || '')
  }

  useEffect(() => {
    active.current = true
    const controller = new AbortController()
    read(false, controller.signal)
      .catch(err => { if (current() && !controller.signal.aborted) setError(err?.message || 'Không tải được số điện thoại.') })
      .finally(() => { if (current() && !controller.signal.aborted) setLoading(false) })
    return () => { active.current = false; controller.abort() }
  }, [session])

  const refresh = async () => {
    if (busy.current) return
    busy.current = true
    setLoading(true)
    setError('')
    try { await read(true) }
    catch (err: any) { if (current()) setError(err?.message || 'Không tải được số điện thoại.') }
    finally { if (current()) { busy.current = false; setLoading(false) } }
  }

  const save = async (replay = false) => {
    if (busy.current || !fact) return
    const command = selfPhoneService.pending()
    if (!replay && !/^\+?[0-9]{7,15}$/.test(draft.trim())) {
      setError('Số điện thoại cần 7–15 chữ số, có thể bắt đầu bằng +.')
      return
    }
    busy.current = true
    setSaving(true)
    setError('')
    setMessage('')
    let committed = false
    try {
      await selfPhoneService.save(command?.phoneNumber || draft, command?.etag || fact.etag, replay)
      committed = true
      await read(false)
      if (current()) setMessage('Đã lưu số điện thoại. Trạng thái xác minh hiển thị theo dữ liệu hiện tại.')
    } catch (err: any) {
      if (!current()) return
      const status = err.response?.status
      const code = err.response?.data?.code
      const detail = err.response?.data?.detail || err.message || 'Không thể cập nhật số điện thoại.'
      if (status === 412) {
        setError('Dữ liệu đã thay đổi (412). Đang tải bản hiện tại; bản nháp được giữ để bạn đối chiếu rồi xác nhận lưu lại.')
        try { await read(true) }
        catch { if (current()) { setFact(null); setError('Không tải được phiên bản mới sau 412. Bản nháp vẫn được giữ; hãy tải lại trước khi lưu.') } }
      } else {
        const text = committed ? 'Đã nhận 204 nhưng chưa tải lại được số điện thoại. Hãy tải lại để đối chiếu.'
          : status === 400 ? 'Số điện thoại hoặc dữ liệu gửi không hợp lệ (400).'
          : status === 403 ? code === 'csrf_failed' ? 'Phiên bảo mật CSRF không hợp lệ. Hãy đăng nhập lại trước khi lưu.' : 'Tài khoản không có quyền cập nhật số điện thoại (403).'
          : status === 428 ? 'Thiếu điều kiện ETag (428); hãy tải lại trước khi lưu.'
          : status === 409 ? 'Xung đột lệnh cập nhật (409). Không tự gửi lại hoặc thay khóa; hãy tải lại và kiểm tra nguyên nhân.'
          : detail
        setError(`${text}${code ? ` [${code}]` : ''}`)
        if (committed || status === 409 || status === 428) setFact(null)
      }
    } finally {
      if (current()) {
        setPending(selfPhoneService.pending())
        setSaving(false)
        busy.current = false
      }
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="self-phone-number" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Số điện thoại liên hệ
      </label>
      {loading && <p role="status" className="text-xs text-slate-500">Đang tải số điện thoại...</p>}
      {fact && <p className="text-xs text-slate-500">Đang lưu: {fact.phoneNumber || 'Chưa có số điện thoại'} • {fact.phoneNumberConfirmed ? 'Đã xác minh' : 'Chưa xác minh'}</p>}
      <input id="self-phone-number" type="tel" value={draft} disabled={loading || saving || !!pending}
        onChange={event => setDraft(event.target.value)} autoComplete="tel"
        onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); save() } }}
        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 disabled:bg-slate-100" />
      <p className="text-xs text-slate-500">7–15 chữ số, có thể bắt đầu bằng +. Số mới cần được xác minh; thao tác này không xác minh số.</p>
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
      {message && <p role="status" className="text-xs text-emerald-700">{message}</p>}
      {pending && <p role="alert" className="text-xs text-amber-800">Lệnh trước chưa rõ kết quả. Bản nháp, khóa và phiên bản được giữ trong phiên hiện tại. Tải lại dữ liệu để đối chiếu; chỉ gửi lại đúng lệnh khi bạn xác nhận.</p>}
      <div className="flex gap-2">
        <button type="button" disabled={loading || saving || !!pending || !fact} onClick={() => save()}
          className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs disabled:opacity-50">
          {saving ? 'Đang lưu số điện thoại...' : 'Lưu số điện thoại'}
        </button>
        <button type="button" disabled={loading || saving} onClick={refresh} className="px-3 py-2 rounded-lg border text-xs">Tải lại số điện thoại</button>
        {pending && <button type="button" disabled={loading || saving || pending.busy || !fact} onClick={() => save(true)} className="px-3 py-2 rounded-lg border text-xs">Gửi lại đúng lệnh</button>}
      </div>
    </div>
  )
}
