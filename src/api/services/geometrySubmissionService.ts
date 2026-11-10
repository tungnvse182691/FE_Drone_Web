import { apiClient } from '../client';
import { alignmentService } from './alignmentService';
import { useAuthStore } from '../../store/authStore';
import { RoleCode } from '../../types/enums';
export interface GeometryReviewRound { number: number; contentVersion: string; outcome: 'SUBMITTED' | 'REJECTED' | 'CONFIRMED'; submittedBy: string; submittedAt: string; decidedBy: string | null; decidedAt: string | null; rejectionReason: string | null }
export interface GeometrySubmission {
  projectId: string;
  draftId: string;
  roadSectionId: string | null;
  status: 'SUBMITTED' | 'REJECTED' | 'CONFIRMED';
  currentReview?: GeometryReviewRound | null;
  previousRejection?: GeometryReviewRound | null;
  version: string;
  submittedContentVersion: string;
  submittedBy: string;
  submittedAt: string;
  confirmedRouteVersionId: string | null;
}
export function verifySubmission(value: GeometrySubmission, projectId: string) {
  if (value?.projectId !== projectId || !value.draftId || !['SUBMITTED', 'REJECTED', 'CONFIRMED'].includes(value.status) || typeof value.draftId !== 'string' || typeof value.version !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.version) || typeof value.submittedContentVersion !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.submittedContentVersion) || typeof value.submittedBy !== 'string' || !value.submittedBy || !Number.isFinite(Date.parse(value.submittedAt)) || !(value.roadSectionId === null || typeof value.roadSectionId === 'string' && !!value.roadSectionId) || !(value.confirmedRouteVersionId === null || typeof value.confirmedRouteVersionId === 'string' && !!value.confirmedRouteVersionId) || value.status === 'SUBMITTED' && value.confirmedRouteVersionId !== null || value.status === 'CONFIRMED' && (!value.roadSectionId || !value.confirmedRouteVersionId))
    throw new Error('Submission trả sai contract/reference.');
  const review = value.currentReview
  if (review != null && (!Number.isInteger(review.number) || review.number < 1 || review.outcome !== value.status || !review.contentVersion || !review.submittedBy || !Number.isFinite(Date.parse(review.submittedAt)) || review.contentVersion !== value.submittedContentVersion)) throw new Error('Lượt xét duyệt sai contract.')
  if (value.status === 'REJECTED' && (!review || !review.decidedBy || !review.decidedAt || !review.rejectionReason?.trim() || review.rejectionReason.length > 2000)) throw new Error('Thiếu quyết định/lý do từ chối từ server.')
  if (value.previousRejection && (value.previousRejection.outcome !== 'REJECTED' || !value.previousRejection.rejectionReason?.trim() || !review || value.previousRejection.number >= review.number)) throw new Error('Quyết định trước sai contract.')
  return value;
}
export const geometrySubmissionService = {
  async read(projectId: string): Promise<GeometrySubmission | null> {
    try {
      return verifySubmission((await apiClient.get(`/projects/${projectId}/road-geometry-submission`)).data, projectId);
    }
    catch (e: any) {
      if (e?.response?.status === 404 && e.response.data?.code === 'road_geometry_submission_not_found')
        return null;
      throw e;
    }
  },
  async submit(projectId: string, draftId: string, etag: string, key: string) { return (await apiClient.post<GeometrySubmission>(`/projects/${projectId}/road-geometry-drafts/${draftId}/submit`, {}, { headers: { 'If-Match': etag, 'Idempotency-Key': key } })).data; }
};
interface Held {
  draftId: string;
  etag: string;
  key: string;
  kind?: 'submit' | 'reject';
  reason?: string;
  receipt?: GeometrySubmission;
  received?: boolean;
  rejected?: boolean;
}
const busy = new Set<string>();
function journal(projectId: string) { const s = useAuthStore.getState(); if (!s.user || !s.isAuthenticated)
  throw new Error('Chưa có phiên Web.'); return `rg_geometry_submit_${s.user.id}_${projectId}`; }
export function pendingSubmission(projectId: string): Held | null { const raw = sessionStorage.getItem(journal(projectId)); if (!raw)
  return null; const h = JSON.parse(raw); if (!h.draftId || !h.etag || !h.key)
  throw new Error('Journal trình tuyến sai contract.'); return h; }
export function reviseSubmission(projectId: string) { const k = journal(projectId), h = pendingSubmission(projectId); if (busy.has(k) || !h?.rejected || h.received)
  throw new Error('Chưa thể sửa ý định trình.'); sessionStorage.removeItem(k); }
export async function runSubmission(projectId: string, intent?: {
  draftId: string;
  etag: string;
  kind?: 'submit' | 'reject';
  reason?: string;
}) {
  const s = useAuthStore.getState(), epoch = s.authEpoch, actor = s.user?.id, k = journal(projectId);
  const saved = pendingSubmission(projectId), kind = saved?.kind || intent?.kind || 'submit'
  if (s.user?.role !== (kind === 'reject' ? RoleCode.SUPERVISOR : RoleCode.PROJECT_MANAGER)) throw new Error(kind === 'reject' ? 'Chỉ Giám sát được từ chối.' : 'Chỉ PM được trình hồ sơ.')
  if (intent?.kind === 'reject' && (!intent.reason?.trim() || intent.reason.trim().length > 2000)) throw new Error('Lý do từ chối bắt buộc, tối đa 2.000 ký tự.')
  const current = () => { const n = useAuthStore.getState(); if (n.authEpoch !== epoch || n.user?.id !== actor || !n.isAuthenticated)
    throw new Error('Phiên thay đổi; bỏ kết quả trình cũ.'); };
  if (busy.has(k))
    throw new Error('Đang trình/đối chiếu hồ sơ.');
  let h = pendingSubmission(projectId);
  if (h && intent)
    throw new Error('Yêu cầu trình cũ đang chờ.');
  if (!h) {
    if (!intent?.draftId || !/^"[A-Za-z0-9+/]+={0,2}"$/.test(intent.etag))
      throw new Error('Cần draft/ETag đã đọc.');
    h = { ...intent, ...(intent.kind === 'reject' ? {reason: intent.reason!.trim()} : {}), key: crypto.randomUUID() };
    sessionStorage.setItem(k, JSON.stringify(h));
  }
  if (h.rejected)
    throw new Error('Đọc lại hồ sơ và chủ động sửa yêu cầu bị từ chối.');
  busy.add(k);
  try {
    if (!h.received) {
      const receipt = h.kind === 'reject' ? (await apiClient.post<GeometrySubmission>(`/projects/${projectId}/road-geometry-drafts/${h.draftId}/reject`, {reason: h.reason}, {headers: {'If-Match': h.etag, 'Idempotency-Key': h.key}})).data : await geometrySubmissionService.submit(projectId, h.draftId, h.etag, h.key);
      current();
      h.received = true;
      h.receipt = receipt;
      sessionStorage.setItem(k, JSON.stringify(h));
    }
    const receipt = verifySubmission(h.receipt!, projectId);
    if (receipt.draftId !== h.draftId || (h.kind === 'reject' ? receipt.status !== 'REJECTED' || receipt.currentReview?.rejectionReason !== h.reason : receipt.submittedContentVersion !== h.etag.slice(1, -1)))
      throw new Error('Receipt không khớp nội dung trình.');
    const lookup = await geometrySubmissionService.read(projectId);
    current();
    if (!lookup || lookup.draftId !== h.draftId || (lookup.currentReview && receipt.currentReview ? lookup.currentReview.number < receipt.currentReview.number : lookup.submittedContentVersion !== receipt.submittedContentVersion))
      throw new Error('Lookup không khớp receipt trình.');
    const draft = await alignmentService.getGeometryDraft(projectId, h.draftId);
    current();
    if (draft.data.projectId !== projectId || draft.data.id !== h.draftId || draft.data.version !== lookup.version || draft.data.status !== lookup.status || draft.etag !== `"${lookup.version}"` || draft.data.roadSectionId !== lookup.roadSectionId)
      throw new Error('GET draft không khớp submission.');
    sessionStorage.removeItem(k);
    return { lookup, draft };
  }
  catch (e: any) {
    current();
    if (!h.received && e?.response?.status >= 400 && e.response.status < 500) {
      h.rejected = true;
      sessionStorage.setItem(k, JSON.stringify(h));
    }
    throw e;
  }
  finally {
    busy.delete(k);
  }
}
