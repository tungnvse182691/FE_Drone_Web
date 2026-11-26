import { apiClient } from '../client'

// Biện pháp an toàn thi công (spec PM-09): PM giao cho Crew phụ trách; lắp đặt/kiểm tra/xác nhận cảnh báo do Crew thực hiện (mobile, không thuộc web).
export interface SafetyView {
  id: string; projectId: string; defectId: string; formalObligationId: string; safetyObligationId: string; responsibleActorId: string
  installedAt?: string | null; firstCheckDueAt?: string | null; currentCheckId?: string | null; version: string
  checks?: { id: string; at: string; result: string; findings?: string }[]
  warnings?: { id: string; sourceCheckId: string; originalDueAt?: string; reason?: string }[]
  acknowledgements?: { id: string; warningId: string; at: string; afterOriginalDue: boolean }[]
}
/** GET .../items/{itemId}/temporary-safety-obligations (FIELD-MEASUREMENT-AND-TEMPORARY-SAFETY.md mục 2). */
export interface SafetyScopeView { physicalRoadId: string; locationVersion?: string | null; routeLabel?: string | null; fromMeters: number; toMeters: number; offsetFromMeters: number; offsetToMeters: number }
export interface SafetyBinding { itemId: string; obligationId: string; taskId: string; assignmentId: string; mode?: string | null; routeVersionId: string; segmentSetId?: string | null; layoutRevisionId?: string | null; slabId?: string | null }
export interface TemporarySafetyObligation { safetyObligationId: string; formalObligationId: string; packageId: string; itemId: string; defectId: string; kind?: string | null; mandatory: boolean; scope: SafetyScopeView; resolved: boolean; originProjectId: string; responsibilityProjectId: string; version?: string | null }
export interface TemporarySafetySources {
  packageId: string; itemId: string; defectId: string; formalObligationId: string; responsibilityProjectId: string
  packageVersion?: string | null; itemVersion?: string | null; formalScope: SafetyScopeView; binding?: SafetyBinding | null
  items: TemporarySafetyObligation[]
}
export interface CoverageScope { obligationId: string; from: number; to: number; offsetFrom: number; offsetTo: number }
const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const quote = (v: string) => (v.startsWith('"') ? v : `"${v}"`)
const base = (p: string, pk: string, item: string) => `/projects/${p}/repair-packages/${pk}/items/${item}/safety-measures`
const obligationsPath = (p: string, pk: string, item: string) => `/projects/${p}/repair-packages/${pk}/items/${item}/temporary-safety-obligations`
const decimals3 = (n: number) => Math.abs(Math.round(n * 1000) / 1000 - n) < 1e-9

export const repairSafetyService = {
  /** GET .../temporary-safety-obligations — nguồn DUY NHẤT để chọn nghĩa vụ an toàn tạm thời (không dùng FormalRepair của road-coverage). ETag = packageVersion; itemVersion dùng cho POST safety-measures. */
  async obligations(projectId: string, packageId: string, itemId: string, signal?: AbortSignal): Promise<{ data: TemporarySafetySources; etag: string }> {
    const r = await apiClient.get<TemporarySafetySources>(obligationsPath(projectId, packageId, itemId), { signal })
    const d = r.data
    if (d?.itemId !== itemId || d.packageId !== packageId || !Array.isArray(d.items) || !d.formalScope || !d.itemVersion || !d.packageVersion) throw new Error('BE trả danh sách nghĩa vụ an toàn tạm thời sai hạng mục/gói hoặc thiếu version.')
    if (d.items.some((x) => x.itemId !== itemId || x.packageId !== packageId)) throw new Error('BE trả nghĩa vụ an toàn thuộc hạng mục/gói khác.')
    return { data: d, etag: r.headers?.etag || quote(d.packageVersion) }
  },
  /** Ghim hình học cho POST từ formalScope + binding (không suy ID). Trả lỗi tiếng Việt nếu thiếu hoặc ngoài phạm vi. */
  buildScope(src: TemporarySafetySources, v: { from: number; to: number; offFrom: number; offTo: number }): { scope?: unknown; error?: string } {
    const b = src.binding, f = src.formalScope
    if (!b?.routeVersionId) return { error: 'Hạng mục chưa có binding (tuyến/bộ đoạn đã ghim) nên chưa thể thêm nghĩa vụ an toàn tạm thời.' }
    const nums = [v.from, v.to, v.offFrom, v.offTo]
    if (!nums.every(Number.isFinite) || !nums.every(decimals3)) return { error: 'Phạm vi phải là số, tối đa ba chữ số thập phân.' }
    if (v.to <= v.from || v.offTo <= v.offFrom) return { error: 'Mốc kết thúc phải lớn hơn mốc bắt đầu (cả lý trình và độ lệch).' }
    if (v.from < f.fromMeters || v.to > f.toMeters || v.offFrom < f.offsetFromMeters || v.offTo > f.offsetToMeters) return { error: `Phạm vi phải nằm trong phạm vi sửa chữa chính thức (${f.fromMeters}–${f.toMeters} m, lệch ${f.offsetFromMeters}–${f.offsetToMeters} m).` }
    return { scope: { physicalRoadId: f.physicalRoadId, routeVersionId: b.routeVersionId, segmentSetId: b.segmentSetId ?? null, layoutRevisionId: b.layoutRevisionId ?? null, slabId: b.slabId ?? null, fromMeters: v.from, toMeters: v.to, offsetFromMeters: v.offFrom, offsetToMeters: v.offTo } }
  },
  /** POST .../temporary-safety-obligations — PM; If-Match = ETag package (packageVersion) vừa GET; Idempotency-Key do người gọi giữ để retry cùng body. */
  async appendObligation(projectId: string, packageId: string, itemId: string, body: { scope: unknown; mandatory: boolean; reason: string }, packageEtag: string, idempotencyKey: string) {
    if (!body.reason.trim()) throw new Error('Nhập lý do bổ sung nghĩa vụ an toàn tạm thời.')
    const r = await apiClient.post<TemporarySafetyObligation>(obligationsPath(projectId, packageId, itemId), { ...body, reason: body.reason.trim() }, { headers: { 'Idempotency-Key': idempotencyKey, 'If-Match': quote(packageEtag) } })
    return { obligation: r.data, status: r.status }
  },
  /** GET …/safety-measures/{measureId}. */
  async read(projectId: string, packageId: string, itemId: string, measureId: string): Promise<SafetyView> {
    if (!GUID.test(measureId.trim())) throw new Error('Mã biện pháp an toàn phải là GUID.')
    const { data } = await apiClient.get<SafetyView>(`${base(projectId, packageId, itemId)}/${measureId.trim()}`)
    if (data?.id !== measureId.trim().toLowerCase() || !data.version) throw new Error('BE trả biện pháp an toàn sai ID/version.')
    return data
  },
  /** POST …/safety-measures — PM giao biện pháp an toàn cho Crew đang được giao hạng mục; If-Match = itemVersion lấy từ GET temporary-safety-obligations (không dùng packageVersion). */
  async create(projectId: string, packageId: string, itemId: string, itemVersion: string, input: { formalRepairObligationId: string; safetyObligationId: string; responsibleActorId: string; checkSchedule: string; replacementCondition: string; removalCondition: string; reason: string }): Promise<SafetyView> {
    if (!input.safetyObligationId || !input.responsibleActorId) throw new Error('Chọn nghĩa vụ an toàn tạm thời và Crew phụ trách.')
    if (!input.checkSchedule.trim() || !input.replacementCondition.trim() || !input.removalCondition.trim() || !input.reason.trim()) throw new Error('Cần nhập lịch kiểm tra, điều kiện thay thế, điều kiện gỡ bỏ và lý do.')
    if (!itemVersion) throw new Error('BE không trả itemVersion của hạng mục.')
    const body = { ...input, checkSchedule: input.checkSchedule.trim(), replacementCondition: input.replacementCondition.trim(), removalCondition: input.removalCondition.trim(), reason: input.reason.trim() }
    const { data } = await apiClient.post<SafetyView>(base(projectId, packageId, itemId), body, { headers: { 'Idempotency-Key': crypto.randomUUID(), 'If-Match': quote(itemVersion) } })
    return data
  },
}

// ---- B12: PM xác nhận kết thúc biện pháp an toàn (WEB-B-COMPLETION.md mục B12) ----
export interface SafetyEvidenceLink { evidenceLinkId: string; fileId: string }
export interface SafetyResolutionEvidence { fileId: string; fileVersion?: string | null; hash?: string | null; evidenceLinkId?: string | null; capturedAt?: string | null; actualUploaderId?: string | null }
export interface SafetyResolution { id: string; actorId: string; at: string; outcome: string; checkId: string; reason: string; condition?: string | null; checklistConfirmation?: string | null; measureVersion?: string | null; obligationVersion?: string | null; evidence?: SafetyResolutionEvidence[] | null }
export interface SafetyObligationRead { resolved: boolean; originProjectId: string; responsibilityProjectId: string; version: string; scope?: SafetyScopeView | null }
export interface SafetyMeasureDetail extends SafetyView {
  eligibleEvidenceLinks?: SafetyEvidenceLink[] | null
  obligation?: SafetyObligationRead | null
  resolution?: SafetyResolution | null
  checks?: { id: string; at: string; result: string; findings?: string; evidenceLinkIds?: string[] | null; actorId?: string }[]
}
export interface SafetyContext { packageId: string; itemId: string; measureId: string; formalObligationId: string }
export interface SafetyResolveBody { checkId: string; outcome: 'REMOVED' | 'REPLACED'; conditionSatisfied: boolean; checklistConfirmation: string; reason: string; evidenceIds: string[]; obligationVersion: string }
export interface SafetyResolveJournal { key: string; ifMatch: string; body: SafetyResolveBody; path: string }
const journalKey = (actorId: string, measureId: string) => `rg_safety_resolve_${actorId}_${measureId}`
const readJournal = (actorId: string, measureId: string): SafetyResolveJournal | null => { try { const raw = sessionStorage.getItem(journalKey(actorId, measureId)); return raw ? JSON.parse(raw) : null } catch { return null } }
const writeJournal = (actorId: string, measureId: string, j: SafetyResolveJournal | null) => { try { if (j) sessionStorage.setItem(journalKey(actorId, measureId), JSON.stringify(j)); else sessionStorage.removeItem(journalKey(actorId, measureId)) } catch { /* sessionStorage không khả dụng: vẫn gửi, mất khả năng retry sau F5 */ } }

export const safetyResolutionService = {
  /** GET /projects/{B}/lifecycle → responsibilities[].safetyContext (không suy context từ formal, không tự chọn ID). */
  async contexts(projectId: string, signal?: AbortSignal): Promise<Array<{ obligationId: string; originProjectId?: string | null; currentProjectId: string; safetyContext: SafetyContext }>> {
    const { data } = await apiClient.get(`/projects/${projectId}/lifecycle`, { signal })
    if (data?.projectId !== projectId || !Array.isArray(data.responsibilities)) throw new Error('BE trả lifecycle sai dự án hoặc thiếu responsibilities.')
    return data.responsibilities.filter((r: { safetyContext?: SafetyContext | null; currentProjectId: string }) => r.safetyContext?.measureId && r.currentProjectId === projectId)
  },
  /** GET …/safety-measures (PM/Sup): measureIds thuộc trách nhiệm safety hiện hành của project URL — dùng để xem lịch sử, không để chọn nghĩa vụ. */
  async measureIds(projectId: string, packageId: string, itemId: string, signal?: AbortSignal): Promise<string[]> {
    const { data } = await apiClient.get<{ measureIds?: string[] }>(base(projectId, packageId, itemId), { signal })
    if (!Array.isArray(data?.measureIds)) throw new Error('BE trả danh sách biện pháp an toàn sai hợp đồng (thiếu measureIds).')
    return data.measureIds
  },
  /** GET {root} → measure + ETag (If-Match của resolution) + obligation.version. */
  async read(projectId: string, packageId: string, itemId: string, measureId: string, signal?: AbortSignal): Promise<{ data: SafetyMeasureDetail; etag: string }> {
    if (!GUID.test(measureId.trim())) throw new Error('Mã biện pháp an toàn phải là GUID.')
    const r = await apiClient.get<SafetyMeasureDetail>(`${base(projectId, packageId, itemId)}/${measureId.trim()}`, { signal })
    if (r.data?.id !== measureId.trim().toLowerCase() || !r.data.version) throw new Error('BE trả biện pháp an toàn sai ID/version.')
    return { data: r.data, etag: r.headers?.etag || quote(r.data.version) }
  },
  /** Điều kiện đọc được từ chính GET (chỉ để khóa/giải thích sớm; BE vẫn là nơi kiểm cuối). Trả '' nếu chưa thấy chặn. */
  blocker(m: SafetyMeasureDetail, projectId: string): string {
    if (m.obligation?.resolved || m.resolution) return 'Biện pháp đã được xác nhận kết thúc; chỉ đọc lịch sử, không mở lại hay chọn lại.'
    if (!m.obligation?.version) return 'BE không trả obligation.version nên chưa thể xác nhận kết thúc.'
    if (m.obligation.responsibilityProjectId !== projectId) return 'Dự án đang xem không phải dự án chịu trách nhiệm hiện hành của biện pháp này.'
    if (!m.installedAt) return 'Biện pháp chưa được Crew lắp đặt.'
    const check = m.checks?.find((c) => c.id === m.currentCheckId)
    if (!m.currentCheckId || !check) return 'Chưa có lần kiểm tra hiện hành.'
    if (String(check.result).toLowerCase() !== 'safe') return `Lần kiểm tra hiện hành chưa ở trạng thái An toàn (Safe) — hiện là ${check.result}.`
    const acked = new Set((m.acknowledgements || []).map((a) => a.warningId))
    if ((m.warnings || []).some((w) => !acked.has(w.id))) return 'Còn cảnh báo chưa được Crew xác nhận (ACK).'
    // PM không nhận eligibleEvidenceLinks (chỉ Crew); chứng cứ resolve = evidence-link ID của chính lần kiểm tra hiện hành (checks[].evidenceLinkIds).
    if (!(check.evidenceLinkIds || []).length) return 'Lần kiểm tra hiện hành chưa có chứng cứ (evidence link) nên chưa thể xác nhận kết thúc.'
    return ''
  },
  pending(actorId: string, measureId: string) { return readJournal(actorId, measureId) },
  /** POST {root}/resolution — If-Match (ETag GET measure), Idempotency-Key, obligationVersion; 201 lần đầu, 200 replay. Mất phản hồi: journal giữ key/body/If-Match để retry đúng bản gốc. */
  async resolve(actorId: string, projectId: string, packageId: string, itemId: string, measureId: string, etag: string, body: SafetyResolveBody): Promise<{ status: number; resolutionId?: string; replay: boolean }> {
    const path = `${base(projectId, packageId, itemId)}/${measureId}/resolution`
    if (!body.evidenceIds.length || !body.checklistConfirmation.trim() || !body.reason.trim() || !body.obligationVersion) throw new Error('Cần checklist, lý do, chứng cứ và obligation.version.')
    const held = readJournal(actorId, measureId)
    if (held && (held.path !== path || JSON.stringify(held.body) !== JSON.stringify(body))) throw new Error('Đang có yêu cầu kết thúc chưa rõ kết quả: gửi lại đúng nội dung cũ hoặc đọc lại để đối soát; không tạo yêu cầu mới.')
    const j: SafetyResolveJournal = held || { key: crypto.randomUUID(), ifMatch: quote(etag), body, path }
    if (!held) writeJournal(actorId, measureId, j)
    try {
      const r = await apiClient.post<{ id?: string; resolution?: { id?: string } }>(path, j.body, { headers: { 'Idempotency-Key': j.key, 'If-Match': j.ifMatch } })
      writeJournal(actorId, measureId, null)
      return { status: r.status, resolutionId: r.data?.id || r.data?.resolution?.id, replay: r.status === 200 }
    } catch (e: any) {
      // Chỉ phản hồi xác định từ BE mới bỏ journal; timeout/mạng/5xx giữ nguyên để retry đúng key/body/If-Match.
      const st = e?.response?.status
      if (st && st < 500 && st !== 408) writeJournal(actorId, measureId, null)
      throw e
    }
  },
}
