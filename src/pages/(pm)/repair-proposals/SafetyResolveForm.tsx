import React, { useCallback, useEffect, useRef, useState } from 'react'
import { safetyResolutionService, type SafetyMeasureDetail } from '../../../api/services/repairSafetyService'
import { exportError } from '../../../api/services/projectExportService'
import { Feedback, Field, KV, Loading, PanelButton } from '../../../components/ui/PanelKit'
import { Icon } from '../../../components/ui/Icon'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { useAuthStore } from '../../../store/authStore'
import { useToastStore } from '../../../store/toastStore'

const short = (id?: string | null) => (id ? id.slice(0, 8).toUpperCase() : '—')
const when = (v?: string | null) => (v ? new Date(v).toLocaleString('vi-VN') : 'Chưa có dữ liệu')
const OUTCOME: Record<string, string> = { REMOVED: 'Đã tháo dỡ (xác nhận điều kiện gỡ bỏ)', REPLACED: 'Đã thay thế (xác nhận điều kiện thay thế)' }

/**
 * PM xác nhận kết thúc biện pháp an toàn tạm thời: GET measure (ETag + obligation.version) → POST …/resolution
 * (If-Match, Idempotency-Key, obligationVersion; evidenceIds = evidence-link ID của lần kiểm tra hiện hành, không phải fileId).
 * Biện pháp đã resolved chỉ để đọc. Chỉ PM chịu trách nhiệm chính của safety (BE kiểm cuối).
 */
export const SafetyResolveForm: React.FC<{ projectId: string; packageId: string; itemId: string; measureId: string; onResolved?: () => void }> = ({ projectId, packageId, itemId, measureId, onResolved }) => {
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore()
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; data?: SafetyMeasureDetail; etag?: string; error?: string }>({ status: 'loading' })
  const [outcome, setOutcome] = useState<'' | 'REMOVED' | 'REPLACED'>('')
  const [condition, setCondition] = useState(false)
  const [checklist, setChecklist] = useState('')
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [unknown, setUnknown] = useState(false) // đã gửi nhưng chưa rõ kết quả: chỉ retry đúng bản gốc
  const seq = useRef(0)
  const guard = useSubmitGuard()
  const actorId = user?.id || ''

  const load = useCallback(async () => {
    const my = ++seq.current
    setState({ status: 'loading' })
    try {
      const { data, etag } = await safetyResolutionService.read(projectId, packageId, itemId, measureId)
      if (seq.current === my) setState({ status: 'ready', data, etag })
    } catch (e) { if (seq.current === my) setState({ status: 'error', error: exportError(e) }) }
  }, [projectId, packageId, itemId, measureId])

  // Đổi biện pháp/hạng mục/dự án: bỏ toàn bộ lựa chọn cũ, đọc lại; phản hồi muộn bị loại bằng seq token.
  useEffect(() => {
    setOutcome(''); setCondition(false); setChecklist(''); setReason(''); setEvidence([]); setConfirming(false); setError(''); setMessage(''); setUnknown(false)
    const held = actorId ? safetyResolutionService.pending(actorId, measureId) : null
    if (held) { setOutcome(held.body.outcome); setCondition(held.body.conditionSatisfied); setChecklist(held.body.checklistConfirmation); setReason(held.body.reason); setEvidence(held.body.evidenceIds); setUnknown(true) }
    void load()
    return () => { seq.current++ }
  }, [load, actorId, measureId])

  const m = state.data
  const blocker = m ? safetyResolutionService.blocker(m, projectId) : ''
  const resolved = !!(m?.obligation?.resolved || m?.resolution)
  const check = m?.checks?.find((c) => c.id === m.currentCheckId)
  const links = (check?.evidenceLinkIds || []).map((id) => ({ evidenceLinkId: id }))
  const problem = !outcome ? 'Chọn kết quả (đã tháo dỡ / đã thay thế).' : !condition ? 'PM cần xác nhận điều kiện đã lưu đã được đáp ứng.' : !checklist.trim() ? 'Nhập checklist xác nhận.' : !reason.trim() ? 'Nhập lý do.' : !evidence.length ? 'Chọn ít nhất một chứng cứ của lần kiểm tra hiện hành.' : ''

  const submit = async () => {
    if (!m || !state.etag || problem || !m.obligation?.version || !check || !guard.acquire()) return
    setBusy(true); setError(''); setMessage('')
    try {
      const body = { checkId: check.id, outcome: outcome as 'REMOVED' | 'REPLACED', conditionSatisfied: condition, checklistConfirmation: checklist.trim(), reason: reason.trim(), evidenceIds: [...evidence].sort(), obligationVersion: m.obligation.version }
      const r = await safetyResolutionService.resolve(actorId, projectId, packageId, itemId, measureId, state.etag, body)
      setUnknown(false); setConfirming(false)
      // Chỉ báo thành công sau khi đọc lại thấy resolved.
      const fresh = await safetyResolutionService.read(projectId, packageId, itemId, measureId)
      setState({ status: 'ready', data: fresh.data, etag: fresh.etag })
      if (fresh.data.obligation?.resolved || fresh.data.resolution) {
        const ok = `${r.replay ? 'Yêu cầu đã được ghi nhận trước đó (replay)' : 'Đã xác nhận kết thúc biện pháp an toàn'} ${short(measureId)}; máy chủ xác nhận đã resolved.`
        setMessage(ok); toast.success(ok); onResolved?.()
      } else setError('Đã gửi nhưng đọc lại chưa thấy trạng thái resolved: cần đối soát, không gửi lệnh mới.')
    } catch (e: any) {
      const code = e?.response?.data?.code
      const lost = !e?.response || e.response.status >= 500
      if (lost) setUnknown(true)
      setError(lost ? `Chưa rõ kết quả (${exportError(e)}). Bấm "Gửi lại đúng yêu cầu cũ" để đối soát — hệ thống giữ nguyên key và nội dung.` : code === 'safety_already_resolved' ? 'Biện pháp đã có kết thúc; đã đọc lại.' : exportError(e))
      if (!lost) { setUnknown(false); void load() }
    } finally { setBusy(false); guard.release() }
  }

  if (state.status === 'loading') return <Loading>Đang đọc biện pháp an toàn…</Loading>
  if (state.status === 'error') return <div className="rg-alert rg-alert-error" data-testid="safety-resolve-error"><Icon name="error" size={16} className="mt-px" /><p role="alert" className="min-w-0 break-words">Không đọc được biện pháp an toàn: {state.error}</p><PanelButton onClick={() => { void load() }}>Thử lại</PanelButton></div>
  if (!m) return null
  return (
    <div className="rg-subcard space-y-3" data-testid="safety-resolve">
      <p className="text-xs font-semibold">Kết thúc biện pháp an toàn tạm thời</p>
      <KV items={[
        { k: 'Biện pháp', v: `#${short(m.id)}`, mono: true },
        { k: 'Trạng thái nghĩa vụ', v: m.obligation ? (m.obligation.resolved ? 'Đã kết thúc (resolved)' : 'Chưa kết thúc') : 'Chưa có dữ liệu' },
        { k: 'Dự án gốc', v: m.obligation?.originProjectId ? `…${m.obligation.originProjectId.slice(-8)}` : '—', mono: true },
        { k: 'Dự án chịu trách nhiệm', v: m.obligation?.responsibilityProjectId ? `…${m.obligation.responsibilityProjectId.slice(-8)}` : '—', mono: true },
        { k: 'Lắp đặt', v: when(m.installedAt) },
        { k: 'Kiểm tra hiện hành', v: check ? `${check.result} · ${when(check.at)}` : 'Chưa có dữ liệu' },
      ]} />
      {m.resolution && (
        <div className="rg-alert rg-alert-ok" data-testid="safety-resolution-readonly"><Icon name="check_circle" size={16} className="mt-px" />
          <div className="min-w-0 break-words text-xs space-y-1">
            <p>Đã kết thúc {when(m.resolution.at)} · {OUTCOME[m.resolution.outcome] || m.resolution.outcome} · mã {short(m.resolution.id)}</p>
            <p>Lý do: {m.resolution.reason}</p>
            {m.resolution.checklistConfirmation && <p>Checklist: {m.resolution.checklistConfirmation}</p>}
            <p>Chứng cứ: {(m.resolution.evidence || []).map((e) => short(e.evidenceLinkId || e.fileId)).join(', ') || 'Chưa có dữ liệu'}</p>
          </div>
        </div>
      )}
      {resolved && !m.resolution && <p className="text-xs text-slate-600">Nghĩa vụ đã resolved nhưng BE không trả chi tiết kết thúc cho biện pháp này (dữ liệu cũ).</p>}
      {!resolved && blocker && <div className="rg-alert rg-alert-warn" data-testid="safety-resolve-lock"><Icon name="warning" size={16} className="mt-px" /><p className="min-w-0 break-words">{blocker}</p></div>}
      {!resolved && !blocker && (
        <div className="space-y-3">
          <div className="rg-grid">
            <Field label="Kết quả kết thúc" hint="REMOVED xác nhận điều kiện gỡ bỏ; REPLACED xác nhận điều kiện thay thế đã lưu trên biện pháp.">
              <select aria-label="Kết quả kết thúc biện pháp" className="rg-field w-full" disabled={busy || unknown} value={outcome} onChange={(e) => { setOutcome(e.target.value as '' | 'REMOVED' | 'REPLACED'); setConfirming(false) }}>
                <option value="">Chọn kết quả</option>
                <option value="REMOVED">Đã tháo dỡ</option>
                <option value="REPLACED">Đã thay thế</option>
              </select>
            </Field>
            <Field label="Checklist xác nhận của PM"><textarea aria-label="Checklist xác nhận kết thúc biện pháp" rows={2} maxLength={2000} className="rg-field w-full" disabled={busy || unknown} value={checklist} onChange={(e) => { setChecklist(e.target.value); setConfirming(false) }} placeholder="Đã đối chiếu điều kiện đã lưu và xác nhận hiện trường an toàn" /></Field>
            <Field label="Lý do"><textarea aria-label="Lý do kết thúc biện pháp an toàn" rows={2} maxLength={2000} className="rg-field w-full" disabled={busy || unknown} value={reason} onChange={(e) => { setReason(e.target.value); setConfirming(false) }} /></Field>
          </div>
          <label className="flex items-start gap-2 text-xs"><input type="checkbox" className="mt-0.5" disabled={busy || unknown} checked={condition} onChange={(e) => { setCondition(e.target.checked); setConfirming(false) }} />Tôi xác nhận điều kiện tháo dỡ/thay thế đã lưu trên biện pháp đã được đáp ứng (BE lưu xác nhận của PM, không tự suy hiện trường đã an toàn).</label>
          <div>
            <span className="rg-label">Chứng cứ của lần kiểm tra hiện hành (evidence-link)</span>
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.evidenceLinkId}><label className="flex items-center gap-2 text-xs"><input type="checkbox" disabled={busy || unknown} checked={evidence.includes(l.evidenceLinkId)} onChange={(e) => { setEvidence((cur) => e.target.checked ? [...cur, l.evidenceLinkId] : cur.filter((x) => x !== l.evidenceLinkId)); setConfirming(false) }} /><span className="font-mono">Liên kết {short(l.evidenceLinkId)}</span></label></li>
              ))}
            </ul>
          </div>
          {!confirming && problem && (outcome || checklist || reason) && <Feedback error={problem} />}
          {confirming && !problem && (
            <div className="rg-alert rg-alert-warn" data-testid="safety-resolve-confirm"><Icon name="warning" size={16} className="mt-px" /><p className="min-w-0 break-words">Xác nhận: kết thúc biện pháp #{short(m.id)} — {OUTCOME[outcome]}; chứng cứ {evidence.length}; lý do "{reason.trim()}". Không thể mở lại sau khi lưu.</p></div>
          )}
          <div className="rg-footer">
            {unknown
              ? <PanelButton variant="primary" loading={busy} disabled={busy} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Gửi lại đúng yêu cầu cũ'}</PanelButton>
              : confirming
                ? <><PanelButton onClick={() => setConfirming(false)} disabled={busy}>Sửa lại</PanelButton><PanelButton variant="primary" loading={busy} disabled={busy || !!problem} onClick={() => { void submit() }}>{busy ? 'Đang gửi…' : 'Xác nhận kết thúc biện pháp'}</PanelButton></>
                : <PanelButton variant="primary" disabled={busy || !!problem} onClick={() => setConfirming(true)}>Kiểm tra và xác nhận</PanelButton>}
          </div>
        </div>
      )}
      <Feedback error={error} message={message} />
    </div>
  )
}
