import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { RoleCode } from '../../../types/enums';
import { pendingSubmission, runSubmission, reviseSubmission } from '../../../api/services/geometrySubmissionService';
import type { useGeometryReadModel } from './useGeometryReadModel';
export function useGeometrySubmission(projectId: string, model: ReturnType<typeof useGeometryReadModel>, saved: boolean, notify: (t: string) => void) {
  const auth = useAuthStore(), scope = `${auth.authEpoch}:${auth.user?.id}:${projectId}:${model.draftId}`, selected = useRef(scope);
  selected.current = scope;
  const [held, setHeld] = useState<ReturnType<typeof pendingSubmission>>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false), [rejectReason, setRejectReason] = useState(''), [rejectError, setRejectError] = useState('')
  const running = useRef(false);
  useEffect(() => { setHeld(null); setBusy(false); setError(''); setRejectOpen(false); setRejectReason(''); setRejectError(''); running.current = false; try {
    if (projectId)
      setHeld(pendingSubmission(projectId));
  }
  catch (e) {
    setError((e as Error).message);
  } }, [scope]);
  const reason = auth.user?.role !== RoleCode.PROJECT_MANAGER ? 'Chỉ PM được trình.' : model.submissionError ? model.submissionError : model.submissionLoading || !model.submissionReady ? 'Đang đọc hồ sơ trình.' : model.submission && (model.submission.status !== 'REJECTED' || model.submission.draftId !== model.draftId) ? 'Dự án đã có hồ sơ trình.' : !['DRAFT','REJECTED'].includes(model.draft?.data.status || '') || model.draft!.data.id !== model.draftId || model.draft!.data.projectId !== projectId ? 'Cần GET đúng draft DRAFT/REJECTED đã lưu.' : !saved ? 'Bản nhập có thay đổi chưa lưu; hãy lưu trước.' : '';
  const canReject = auth.user?.role === RoleCode.SUPERVISOR && model.submissionReady && !model.submissionLoading && !model.submissionError && model.submission?.status === 'SUBMITTED' && model.submission.draftId === model.draftId && model.draft?.data.status === 'SUBMITTED' && model.draft.data.id === model.draftId && model.draft.data.projectId === projectId && model.draft.etag === `"${model.submission.version}"`
  const submit = async (retry = false, rejecting = false) => {
    const actionReject = retry ? held?.kind === 'reject' : rejecting
    if (running.current || auth.user?.role !== (actionReject ? RoleCode.SUPERVISOR : RoleCode.PROJECT_MANAGER) || !retry && (actionReject ? !canReject : !!reason)) return
    if (!retry && actionReject && (!rejectReason.trim() || rejectReason.trim().length > 2000)) { setRejectError('Nhập lý do từ chối, tối đa 2.000 ký tự.'); return }

    const s = scope;
    running.current = true;
    setBusy(true);
    setError('');
    const current = () => selected.current === s && useAuthStore.getState().authEpoch === auth.authEpoch;
    try {
      await runSubmission(projectId, retry ? undefined : { draftId: model.draftId, etag: model.draft!.etag, ...(actionReject ? {kind: 'reject' as const, reason: rejectReason.trim()} : {}) });
      if (current()) {
        setHeld(null); setRejectOpen(false);
        model.retry();
        notify('Đã GET hồ sơ trình và draft từ máy chủ.');
      }
    }
    catch (e: any) {
      if (current()) {
        try {
          setHeld(pendingSubmission(projectId));
        }
        catch {
          setHeld(null);
        }
        const t = `Trình hồ sơ lỗi ${e?.response?.status || ''}: ${e?.response?.data?.code === 'road_geometry_submission_unchanged' ? 'Nội dung tuyến chưa thay đổi so với lượt bị từ chối. Cần sửa nội dung kỹ thuật; đổi tên hoặc lý do không đủ.' : e?.response?.data?.code || e.message}`;
        setError(t);
        notify(t);
      }
    }
    finally {
      if (current()) {
        running.current = false;
        setBusy(false);
      }
    }
  };
  return { rejectOpen, rejectReason, setRejectReason, rejectError, canReject, openReject: () => { if (canReject && !held && !busy) { setRejectError(''); setRejectReason(''); setRejectOpen(true) } }, closeReject: () => { if (!busy) setRejectOpen(false) }, reject: () => submit(false, true), held, busy, error, reason, submit, revise: () => { reviseSubmission(projectId); setHeld(null); model.retry(); setError('Đọc lại hồ sơ trước khi trình ý định mới.'); } };
}
