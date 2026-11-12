import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { caseEvidenceRequestService } from '../../../api/services/caseEvidenceRequestService'
import { triageService } from '../../../api/services/triageService'
import type { TriageCase } from './types'
import { caseIntakeError } from './useCaseIntake'

export function useCaseEvidenceRequest(selected: TriageCase | null, reason: string, apply: (value: TriageCase) => void) {
  const auth = useAuthStore(), scope = `${auth.authEpoch}:${auth.user?.id}:${selected?.id}:${selected?.project_id}`
  const latest = useRef(scope); latest.current = scope
  const running = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('')
  const [pending, setPending] = useState<ReturnType<typeof caseEvidenceRequestService.pending>>(null)
  const [reviewed, setReviewed] = useState<TriageCase | null>(null)
  const [comparison, setComparison] = useState(''), [version, setVersion] = useState('')
  useEffect(() => {
    running.current = false; setBusy(false); setError(''); setMessage(''); setReviewed(null); setComparison(''); setVersion('')
    try { setPending(selected?.id ? caseEvidenceRequestService.pending(selected.id) : null) }
    catch (e) { setPending(null); setError(caseIntakeError(e)) }
  }, [scope])
  const canRequest = auth.user?.role === RoleCode.PROJECT_MANAGER && selected?.case_status === 'OPEN' && !!selected.project_id && !!reason.trim() && !busy && !pending
  const execute = async (retry = false) => {
    if (running.current || !selected || auth.user?.role !== RoleCode.PROJECT_MANAGER || !retry && !canRequest) return
    const start = scope, current = () => mounted.current && latest.current === start && useAuthStore.getState().authEpoch === auth.authEpoch
    running.current = true; setBusy(true); setError(''); setMessage('')
    try {
      const held = caseEvidenceRequestService.pending(selected.id)
      if (retry && !held) throw new Error('Không có yêu cầu bổ sung đang chờ.')
      const result = await caseEvidenceRequestService.request(selected.id, retry ? held!.projectId : selected.project_id!, retry ? held!.body.reason : reason, retry ? held!.version : version || selected.etag || selected.version || '')
      if (!current()) return
      apply(result.record); setPending(null); setVersion('')
      setMessage(result.requestVerified ? 'Đã đọc lại hồ sơ: Chờ bổ sung bằng chứng.' : 'Đã đọc trạng thái hiện tại từ máy chủ. Phiên bản đã đổi sau phản hồi lệnh; không gửi lại yêu cầu cũ.')
    } catch (e) {
      if (!current()) return
      setError(caseIntakeError(e))
      try { setPending(caseEvidenceRequestService.pending(selected.id)) } catch { setError('Không đọc được yêu cầu đang chờ; chưa gửi lệnh mới.') }
    } finally { if (current()) { running.current = false; setBusy(false) } }
  }
  const read = async () => {
    if (!selected || running.current) return
    const start = scope; running.current = true; setBusy(true)
    try {
      const fresh = await triageService.getCaseById(selected.id)
      if (!mounted.current || latest.current !== start) return
      if (!fresh) throw new Error('Chưa đọc được hồ sơ để đối chiếu.')
      setReviewed(fresh); setComparison(fresh.case_status === 'OPEN' ? 'Đã đọc hồ sơ hiện tại. Giữ lý do và kiểm tra trước khi tiếp tục.' : 'Hồ sơ không còn OPEN; không gửi yêu cầu mới. Hãy mở lại hồ sơ.')
    } catch (e) { if (mounted.current && latest.current === start) setError(caseIntakeError(e)) }
    finally { if (mounted.current && latest.current === start) { running.current = false; setBusy(false) } }
  }
  const accept = () => {
    if (!selected || busy || !reviewed || reviewed.id !== selected.id || reviewed.project_id !== selected.project_id || reviewed.case_status !== 'OPEN') return
    caseEvidenceRequestService.revise(selected.id); setVersion(reviewed.etag || reviewed.version || ''); setPending(null); setReviewed(null); setError(''); setComparison('Đã đối chiếu. Lý do được giữ; bạn tự bấm yêu cầu bổ sung khi phù hợp.')
  }
  return { busy, error, message, comparison, canRequest, pending: !!pending, retry: pending && !pending.rejected ? () => execute(true) : undefined,
    retryLabel: pending?.received ? 'Đọc lại kết quả yêu cầu' : 'Thử lại yêu cầu đang chờ', read: pending?.rejected ? read : undefined,
    accept: reviewed?.case_status === 'OPEN' && pending?.rejected ? accept : undefined, execute: () => execute() }
}
export type CaseEvidenceRequestState = ReturnType<typeof useCaseEvidenceRequest>
