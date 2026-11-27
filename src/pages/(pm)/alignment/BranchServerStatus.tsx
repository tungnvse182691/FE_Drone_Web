import React, { useEffect, useState } from 'react'
import { alignmentService, type RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { geometrySubmissionService, type GeometrySubmission } from '../../../api/services/geometrySubmissionService'
import { useAuthStore } from '../../../store/authStore'

type Geo = RoadGeometryVersionView & { routeKind?: string | null; routeSystemId?: string | null; crsProfileRevisionId?: string | null; parentRouteVersionId?: string | null; junctionOffsetMeters?: number | null; crsStatus?: string | null; sampleOnly?: boolean; metadataStatus?: string | null }
interface RouteRead { roadSectionId: string; code: string; versionId: string; geometry?: Geo; error?: string }
interface Facts { scope: string; routes: RouteRead[]; submission: GeometrySubmission | null; routeSystems: number; crsProfiles: number; error: string }

const SUBMISSION_LABEL: Record<string, string> = { SUBMITTED: 'Đã trình, chờ Giám sát', REJECTED: 'Bị từ chối, PM sửa và trình lại', CONFIRMED: 'Đã xác nhận' }
const errText = (e: unknown) => { const r = (e as { response?: { status?: number; data?: { code?: string } } })?.response; return r?.status ? `HTTP ${r.status}${r.data?.code ? ' ' + r.data.code : ''}` : (e as Error)?.message || 'lỗi không rõ' }

/**
 * Trạng thái tuyến nhánh THEO MÁY CHỦ + tiền đề lập nhánh (chỉ đọc). Không ghi gì, không đoán CRS/điểm nối/hệ tuyến.
 * Căn cứ guard BE (GeometryWorkflowPersistenceService): nhánh chỉ lập bằng draft NATIVE_ALIGNMENT với tuyến cha là bản hiện hành có metadata native
 * (hệ tuyến + CRS profile cùng revision); mỗi dự án chỉ có MỘT hồ sơ trình (road_geometry_submission_locked / _exists).
 * Nhánh vẽ trên màn hình này chỉ là xem trước cục bộ — chưa phải bản ghi trên máy chủ.
 */
export const BranchServerStatus: React.FC<{ projectId: string; localBranchCount: number }> = ({ projectId, localBranchCount }) => {
  const epoch = useAuthStore((s) => s.authEpoch), actor = useAuthStore((s) => s.user?.id)
  const scope = `${epoch}:${actor}:${projectId}`
  const [facts, setFacts] = useState<Facts | null>(null)
  const [reload, setReload] = useState(0)
  useEffect(() => {
    if (!projectId) return
    let alive = true
    setFacts(null)
    ;(async () => {
      try {
        const [context, submission, systems, profiles] = await Promise.all([
          alignmentService.readProjectContext(projectId), geometrySubmissionService.read(projectId, { fresh: true }),
          alignmentService.fetchRouteSystems(projectId), alignmentService.fetchCrsProfiles(projectId),
        ])
        const routes = await Promise.all(context.roadSections.map(async (s): Promise<RouteRead> => {
          try { return { roadSectionId: s.roadSectionId, code: s.code, versionId: s.currentVersionId, geometry: await alignmentService.readConfirmedGeometry(projectId, s.roadSectionId, s.currentVersionId) as Geo } }
          catch (e) { return { roadSectionId: s.roadSectionId, code: s.code, versionId: s.currentVersionId, error: errText(e) } }
        }))
        if (alive) setFacts({ scope, routes, submission, routeSystems: systems.length, crsProfiles: profiles.length, error: '' })
      } catch (e) { if (alive) setFacts({ scope, routes: [], submission: null, routeSystems: 0, crsProfiles: 0, error: errText(e) }) }
    })()
    return () => { alive = false }
  }, [scope, reload, projectId])

  if (!projectId) return null
  const f = facts?.scope === scope ? facts : null
  const routes = f?.routes || []
  const isNative = (g?: Geo) => !!g && !!g.routeSystemId && !!g.crsProfileRevisionId && (g.routeKind === 'MAIN' || g.routeKind === 'BRANCH') && g.isCurrent
  const nativeParents = routes.filter((r) => isNative(r.geometry))
  const serverBranches = routes.filter((r) => r.geometry?.routeKind === 'BRANCH')
  const lockedBySubmission = !!f?.submission && f.submission.status !== 'REJECTED'
  const checks: Array<{ ok: boolean; text: string }> = f && !f.error ? [
    { ok: !lockedBySubmission, text: lockedBySubmission ? 'Dự án đã có hồ sơ trình tuyến (' + (SUBMISSION_LABEL[f.submission!.status] || f.submission!.status) + '). Máy chủ chỉ nhận một hồ sơ trình cho mỗi dự án nên mọi bản nháp mới bị chặn (road_geometry_submission_locked).' : 'Hồ sơ trình tuyến của dự án cho phép lưu bản nháp.' },
    { ok: nativeParents.length > 0, text: nativeParents.length ? 'Có ' + nativeParents.length + ' tuyến cha native hiện hành.' : 'Không có tuyến cha native hiện hành: ' + (routes.length ? routes.map((r) => r.code + (r.error ? ' (không đọc được: ' + r.error + ')' : ' (' + (r.geometry?.metadataStatus || 'không rõ') + ', chưa có hệ tuyến/CRS profile)')).join('; ') : 'dự án chưa có tuyến nào') + '. Tuyến legacy không được chuyển thành native và không làm tuyến cha.' },
    { ok: f.routeSystems > 0, text: f.routeSystems ? 'Có ' + f.routeSystems + ' hệ tuyến.' : 'Dự án chưa có hệ tuyến.' },
    { ok: f.crsProfiles > 0, text: f.crsProfiles ? 'Có ' + f.crsProfiles + ' hồ sơ CRS.' : 'Dự án chưa có hồ sơ CRS (profile revision).' },
  ] : []
  const ready = checks.length > 0 && checks.every((c) => c.ok)
  return (
    <section hidden aria-label="Tuyến nhánh theo máy chủ" data-testid="branch-server-status" className="rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-2">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold text-slate-800">Tuyến nhánh — trạng thái theo máy chủ</h3>
        <button type="button" onClick={() => setReload((n) => n + 1)} className="underline text-slate-600">Đọc lại</button>
      </header>
      {!f && <p role="status">Đang đọc tuyến, hồ sơ trình và tiền đề lập nhánh…</p>}
      {f?.error && <p role="alert" className="text-rose-700">Không đọc được tiền đề tuyến nhánh: {f.error}. Không coi là không có dữ liệu.</p>}
      {f && !f.error && <>
        <p data-testid="branch-local-state">Nhánh vẽ tại màn hình này: {localBranchCount ? localBranchCount + ' nhánh xem trước cục bộ — CHƯA LƯU lên máy chủ.' : 'chưa có nhánh xem trước.'}</p>
        <p data-testid="branch-server-state">Trạng thái hồ sơ trình tuyến: {f.submission ? SUBMISSION_LABEL[f.submission.status] || f.submission.status : 'Chưa có hồ sơ trình (chưa lưu/trình)'}. Bản nháp chưa trình không có API liệt kê nên chỉ hiện sau khi trình.</p>
        <p>Nhánh chính thức trên máy chủ: {serverBranches.length ? serverBranches.map((r) => { const g = r.geometry!; const parent = routes.find((p) => p.versionId === g.parentRouteVersionId); return r.code + ' (Đã xác nhận · cha ' + (parent?.code || String(g.parentRouteVersionId || '').slice(0, 8)) + ' · điểm nối ' + (g.junctionOffsetMeters ?? '—') + ' m)' }).join('; ') : 'chưa có.'}</p>
        <ul className="space-y-1" data-testid="branch-prereqs">
          {checks.map((c, i) => <li key={i} className={c.ok ? 'text-emerald-700' : 'text-rose-700'}>{c.ok ? '✓' : '✗'} {c.text}</li>)}
        </ul>
        <p data-testid="branch-verdict" className={ready ? 'text-slate-700' : 'font-semibold text-amber-800'}>{ready ? 'Đủ tiền đề đọc được. Lập nhánh cần nhập tim tuyến native (CRS profile, điểm nối khớp tuyến cha); Web chưa có form native nên chưa lưu được.' : 'BỊ CHẶN bởi guard máy chủ: chưa thể lưu/trình/xác nhận nhánh. Web giữ nguyên guard, không sửa tuyến chính, baseline hay CRS.'}</p>
      </>}
    </section>
  )
}
