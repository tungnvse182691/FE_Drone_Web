import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'

// Contract: deploy/fe-handoff/REPORTER-ROUTING-MAP.md (BE 7148088). Chỉ đọc/ghi qua API hiện có; không suy diễn.
export interface RoutingSegmentSetPin { id: string; status: string; version: string; geometryHash?: string | null }
export interface RoutingMapProperties {
  projectId: string; projectName: string; projectStatus: string; roadSectionId: string; roadSectionCode: string; roadSectionName?: string | null
  routeVersionId: string; versionNo: number; isCurrent: boolean; effectiveFrom: string; geometryHash: string
  segmentSets?: RoutingSegmentSetPin[]; metadataTruncated?: boolean; geometryUsage?: string; geometryStatus?: string
}
export interface RoutingMapFeature { id: string; type: 'Feature'; geometry: { type: 'LineString'; coordinates: number[][] }; properties: RoutingMapProperties }
export interface RoutingUnavailableRoute { routeVersionId: string; projectId: string; roadSectionId: string; missingReasons: string[]; bboxRelation: string }
export interface RoutingMapSnapshot { features: RoutingMapFeature[]; unavailable: RoutingUnavailableRoute[]; pages: number; scanned: number; snapshotVersions: string[] }

export interface RoutingEvidencePin {
  caseId: string; caseVersion: string; reportId: string; reportVersion: string; evidenceId: string | null; supplementId: string | null
  fileId: string | null; fileVersion: string | null; caseSourceVersion: string
  latitude: number | null; longitude: number | null; accuracyMeters: number | null; locationSource: string
  capturedAt: string | null; receivedAt: string; captureTimeProvenance: string
}
export interface RoutingCoveragePin { id: string; obligationId: string; locationVersion: string; provenance: string; sourceKind: string; sourceId: string; sourceVersion: string; version: string; originProjectId: string; currentResponsibleProjectId: string; currentRepairItemId: string | null }
export interface RoutingRouteInfo { projectId: string; projectName: string; projectStatus: string; roadSectionId: string; roadSectionCode: string; roadSectionName?: string | null; routeVersionId: string; versionNo: number; isCurrent: boolean; geometryHash: string; segmentSets?: RoutingSegmentSetPin[]; coveragePins?: RoutingCoveragePin[]; policyPins?: unknown[] }
export interface RoutingCandidate {
  route: RoutingRouteInfo; distanceMeters: number | null; distanceMethod: string | null; spatialRelation: string; uncertaintyStatus: string
  responsibility: string; temporalBasis: string; missingReasons: string[]
}
export interface RoutingCandidatesResult {
  source: RoutingEvidencePin; evaluationVersion: string; algorithmVersion: string; evaluatedAt: string
  candidates: RoutingCandidate[]; completeness: string; missingReasons: string[]; searchScope: string; pages: number
}
export interface RoutingDecisionAttestation {
  scopeReason: string; conflictResolution: string; temporalBasis: 'SERVER_RECEIVED_AT'
  reports: Array<{ reportId: string; evidenceId: string | null; locationReason: string; responsibilityReason: string; sourceReferences: Array<{ kind: 'ROUTE_VERSION' | 'COVERAGE_MAPPING'; id: string; version: string }> }>
}
export interface RoutingDecision {
  decisionId: string; outcome: 'NEEDS_LOCATION_EVIDENCE' | 'OUTSIDE_COMPANY_SCOPE'; reason: string; actorId: string; decidedAt: string
  reportId: string; evidenceId: string | null; routingEvaluationVersion: string | null; state: string; supersedesDecisionId: string | null
  attestation: RoutingDecisionAttestation | null; source: RoutingEvidencePin | null
}
export interface RoutingDecisionInput { outcome: RoutingDecision['outcome']; reason: string; reportId: string; evidenceId?: string | null; routingEvaluationVersion?: string | null; attestation?: RoutingDecisionAttestation | null }
export interface PendingRoutingDecision { key: string; version: string; body: Record<string, unknown>; fingerprint: string; receipt?: { decision: RoutingDecision; caseVersion: string }; rejected?: boolean }

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
const MAX_PAGES = 500

export function routingError(error: any): string {
  const status = error?.response?.status, data = error?.response?.data
  const code = data?.code, cid = data?.correlationId || error?.response?.headers?.['x-correlation-id']
  const ref = cid ? ` Mã đối chiếu: ${cid}.` : ''
  const known: Record<string, string> = {
    routing_cursor_stale: 'Dữ liệu bản đồ đã đổi trong lúc đọc; bỏ kết quả cũ và tải lại từ đầu.',
    invalid_cursor: 'Con trỏ phân trang không hợp lệ; tải lại từ đầu.',
    routing_evaluation_stale: 'Kết quả đối chiếu tuyến đã cũ; đọc lại ứng viên rồi xác nhận lại.',
    routing_source_stale: 'Ảnh/Report nguồn đã đổi; đọc lại hồ sơ rồi xác nhận lại.',
    routing_attestation_incomplete: 'Cam kết ngoài phạm vi chưa đủ: cần mọi Report đang liên kết, lý do và nguồn tham chiếu.',
    routing_responsibility_unresolved: 'Trách nhiệm tuyến chưa xác định (UNKNOWN); không suy ra ngoài phạm vi.',
    routing_location_unresolved: 'Vị trí ảnh chưa xác định; không suy ra ngoài phạm vi.',
    reference_scope_conflict: 'Nguồn tham chiếu không thuộc phạm vi ảnh/Report đã chọn.',
    case_already_assigned: 'Hồ sơ đã được phân dự án; Giám sát không còn quyền quyết định tiếp nhận.',
    idempotency_key_reused: 'Cùng khóa nhưng nội dung khác; không đổi nội dung của lệnh đang chờ.',
    csrf_failed: 'Phiên Web thiếu CSRF hợp lệ; đăng nhập lại.',
    access_forbidden: 'Không có quyền thực hiện/đọc mục này.'
  }
  if (status) return `${known[code] || `Yêu cầu thất bại (HTTP ${status}${code ? ' ' + code : ''}).`}${known[code] ? ` (HTTP ${status} ${code})` : ''}${ref}`
  return error?.message || 'Không kết nối được máy chủ.'
}

const mapCache = new Map<string, { etag: string; data: any }>()
const actorScope = () => { const s = useAuthStore.getState(); return `${s.authEpoch}:${s.user?.id}` }
const assertActive = (scope: string, signal?: AbortSignal) => { if (signal?.aborted || actorScope() !== scope) throw new Error('Phiên hoặc ngữ cảnh đã đổi; bỏ kết quả cũ.') }

export const routingMapService = {
  /** GET /company/road-map — Giám sát. Đọc đủ mọi trang (trang rỗng vẫn có thể còn nextCursor). */
  async readMap(opts: { includeHistorical?: boolean; bbox?: string; signal?: AbortSignal; onProgress?: (pages: number, features: number) => void } = {}): Promise<RoutingMapSnapshot> {
    const scope = actorScope(), seen = new Set<string>()
    const features = new Map<string, RoutingMapFeature>(), unavailable = new Map<string, RoutingUnavailableRoute>(), versions: string[] = []
    let cursor: string | undefined, pages = 0, scanned = 0
    do {
      const key = `${scope}:${opts.includeHistorical ? 1 : 0}:${opts.bbox || ''}:${cursor || ''}`
      const cached = mapCache.get(key)
      const res = await apiClient.get('/company/road-map', {
        params: { limit: 100, cursor, includeHistorical: opts.includeHistorical ? true : undefined, bbox: opts.bbox },
        headers: cached ? { 'If-None-Match': cached.etag } : undefined, signal: opts.signal,
        validateStatus: s => (s >= 200 && s < 300) || s === 304
      })
      assertActive(scope, opts.signal)
      let page = res.data
      if (res.status === 304) { if (!cached) throw new Error('Máy chủ trả 304 nhưng không có bản lưu hợp lệ.'); page = cached.data }
      else if (typeof res.headers?.etag === 'string') mapCache.set(key, { etag: res.headers.etag, data: page })
      if (page?.type !== 'FeatureCollection' || !Array.isArray(page.features) || !Array.isArray(page.unavailableRoutes ?? []) || page.nextCursor != null && (typeof page.nextCursor !== 'string' || !page.nextCursor)) throw new Error('Bản đồ tuyến trả sai contract; không coi là rỗng.')
      for (const f of page.features as RoutingMapFeature[]) {
        if (!f?.id || f.geometry?.type !== 'LineString' || !Array.isArray(f.geometry.coordinates) || !f.properties?.projectName) throw new Error('Feature tuyến thiếu ID/hình học/tên dự án.')
        features.set(f.id, f)
      }
      for (const u of (page.unavailableRoutes || []) as RoutingUnavailableRoute[]) unavailable.set(u.routeVersionId, u)
      if (page.snapshotVersion) versions.push(page.snapshotVersion)
      scanned += Number(page.scannedRoutes) || 0
      pages++
      opts.onProgress?.(pages, features.size)
      cursor = page.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor bản đồ lặp; dữ liệu chưa đầy đủ.')
      if (cursor) seen.add(cursor)
      if (pages > MAX_PAGES) throw new Error('Quá nhiều trang bản đồ; dừng để tránh kết quả thiếu.')
    } while (cursor)
    return { features: [...features.values()], unavailable: [...unavailable.values()], pages, scanned, snapshotVersions: versions }
  },

  /** GET /cases/{id}/routing-candidates — đúng Report/evidence đã chọn; đọc đủ phân trang. */
  async readCandidates(caseId: string, reportId: string, evidenceId: string | null, signal?: AbortSignal): Promise<RoutingCandidatesResult> {
    if (!UUID.test(caseId) || !UUID.test(reportId) || evidenceId && !UUID.test(evidenceId)) throw new Error('Case/Report/evidence không hợp lệ.')
    const scope = actorScope(), seen = new Set<string>(), rows = new Map<string, RoutingCandidate>()
    let cursor: string | undefined, first: any, pages = 0
    do {
      const { data } = await apiClient.get(`/cases/${caseId}/routing-candidates`, { params: { reportId, evidenceId: evidenceId || undefined, limit: 100, cursor }, signal })
      assertActive(scope, signal)
      if (!data?.source || !Array.isArray(data.candidates) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor)) throw new Error('Ứng viên tuyến trả sai contract; không coi là rỗng.')
      if (data.source.reportId !== reportId || data.source.caseId !== caseId || (evidenceId || null) !== (data.source.evidenceId || null)) throw new Error('Nguồn ứng viên không khớp Report/ảnh đã chọn; không dùng GPS ảnh khác.')
      if (first && first.evaluationVersion !== data.evaluationVersion) throw new Error('Nguồn đối chiếu đổi giữa các trang; đọc lại từ đầu.')
      first ||= data
      for (const c of data.candidates as RoutingCandidate[]) rows.set(c.route.routeVersionId, c)
      pages++
      cursor = data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor ứng viên lặp; danh sách chưa đầy đủ.')
      if (cursor) seen.add(cursor)
      if (pages > MAX_PAGES) throw new Error('Quá nhiều trang ứng viên.')
    } while (cursor)
    return { source: first.source, evaluationVersion: first.evaluationVersion, algorithmVersion: first.algorithmVersion, evaluatedAt: first.evaluatedAt, candidates: [...rows.values()], completeness: first.completeness, missingReasons: first.missingReasons || [], searchScope: first.searchScope, pages }
  },

  /** GET /cases/{id}/routing-decisions — Giám sát. */
  async readDecisions(caseId: string, signal?: AbortSignal): Promise<RoutingDecision[]> {
    const scope = actorScope(), seen = new Set<string>(), rows = new Map<string, RoutingDecision>()
    let cursor: string | undefined
    do {
      const { data } = await apiClient.get(`/cases/${caseId}/routing-decisions`, { params: { limit: 100, cursor }, signal })
      assertActive(scope, signal)
      if (!Array.isArray(data?.items) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor)) throw new Error('Lịch sử tiếp nhận trả sai contract; không coi là rỗng.')
      for (const d of data.items as RoutingDecision[]) rows.set(d.decisionId, d)
      cursor = data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor lịch sử lặp.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return [...rows.values()]
  },

  journalKey: (caseId: string) => `rg_routing_decision_${useAuthStore.getState().user?.id}_${caseId}`,
  pending(caseId: string): PendingRoutingDecision | null {
    const raw = sessionStorage.getItem(this.journalKey(caseId))
    if (!raw) return null
    const p = JSON.parse(raw) as PendingRoutingDecision
    if (!p.key || !p.version || !p.body || p.fingerprint !== JSON.stringify({ body: p.body, version: p.version })) throw new Error('Journal quyết định tiếp nhận sai contract; cần đối chiếu trước khi ghi.')
    return p
  },
  discardRejected(caseId: string) { const p = this.pending(caseId); if (p?.rejected && !p.receipt) sessionStorage.removeItem(this.journalKey(caseId)) },

  /** POST /cases/{id}/routing-decisions. Lưu key/body/If-Match trước khi gửi; retry nguyên vẹn; không đổi khóa khi chưa rõ kết quả. */
  async decide(caseId: string, input: RoutingDecisionInput, caseVersion: string): Promise<{ decision: RoutingDecision; caseVersion: string }> {
    const actor = useAuthStore.getState().user, scope = actorScope()
    if (actor?.role !== 'SUPERVISOR') throw new Error('Chỉ Giám sát được ghi quyết định tiếp nhận.')
    const reason = input.reason?.trim()
    if (!UUID.test(caseId) || !UUID.test(input.reportId) || input.evidenceId && !UUID.test(input.evidenceId)) throw new Error('Case/Report/evidence không hợp lệ.')
    if (!reason || reason.length > 2000) throw new Error('Lý do bắt buộc, tối đa 2000 ký tự.')
    if (!['NEEDS_LOCATION_EVIDENCE', 'OUTSIDE_COMPANY_SCOPE'].includes(input.outcome)) throw new Error('Kết quả tiếp nhận không hợp lệ.')
    const version = `"${caseVersion.replace(/"/g, '')}"`
    if (!/^"[A-Za-z0-9+/]{11}="$/.test(version)) throw new Error('If-Match phải là version Case 8 byte đã đọc.')
    if (input.outcome === 'OUTSIDE_COMPANY_SCOPE' && !input.attestation) throw new Error('OUTSIDE_COMPANY_SCOPE cần cam kết có căn cứ cho mọi Report.')
    const body: Record<string, unknown> = { outcome: input.outcome, reason, reportId: input.reportId, evidenceId: input.evidenceId || null }
    if (input.routingEvaluationVersion) body.routingEvaluationVersion = input.routingEvaluationVersion
    if (input.attestation) body.attestation = input.attestation
    const fingerprint = JSON.stringify({ body, version })
    const prev = this.pending(caseId)
    if (prev && prev.fingerprint !== fingerprint) throw new Error('Lệnh tiếp nhận trước chưa đối chiếu xong; không đổi key/nội dung. Đối chiếu hoặc hủy lệnh bị từ chối.')
    if (prev?.rejected) throw new Error('Lệnh đã bị máy chủ từ chối; đọc lại hồ sơ và lập ý định mới chủ động.')
    const cmd: PendingRoutingDecision = prev || { key: crypto.randomUUID(), version, body, fingerprint }
    const journal = this.journalKey(caseId)
    sessionStorage.setItem(journal, JSON.stringify(cmd))
    try {
      if (!cmd.receipt) {
        const res = await apiClient.post(`/cases/${caseId}/routing-decisions`, cmd.body, { headers: { 'Idempotency-Key': cmd.key, 'If-Match': cmd.version } })
        assertActive(scope)
        if (!res.data?.decision?.decisionId || res.data.decision.outcome !== input.outcome) throw new Error('Phản hồi quyết định tiếp nhận sai contract; chỉ đối chiếu, không POST thêm.')
        cmd.receipt = res.data; sessionStorage.setItem(journal, JSON.stringify(cmd))
      }
      sessionStorage.removeItem(journal)
      return cmd.receipt!
    } catch (error: any) {
      const status = error?.response?.status
      if (!cmd.receipt && status >= 400 && status < 500 && status !== 408 && status !== 429) { cmd.rejected = true; sessionStorage.setItem(journal, JSON.stringify(cmd)) }
      throw error
    }
  }
}
