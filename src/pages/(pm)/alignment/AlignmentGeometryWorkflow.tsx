import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AlignmentHeader } from './AlignmentHeader'
import { AlignmentMap } from './AlignmentMap'
import { AlignmentSidebar } from './AlignmentSidebar'
import { AlignmentImportModal } from './AlignmentImportModal'
import { Icon } from '../../../components/ui/Icon'
import { apiClient } from '../../../api/client'
import { alignmentService, type CrsProfileView, type GeometryDraftView, type GeometryPreview, type RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { inspectGeoJsonCenterline, type GeoJsonCenterlineReview } from './alignmentImportHelpers'

type Project = { projectId: string; projectCode: string; name: string }
type Context = Awaited<ReturnType<typeof alignmentService.readProjectContext>>
type Readiness = Awaited<ReturnType<typeof alignmentService.readDraftReadiness>>
export function geometryErrorText(error: any): string {
  console.warn('[Geometry]', { status: error?.response?.status, code: error?.response?.data?.code, correlationId: error?.response?.data?.correlationId })
  switch (error?.response?.status) {
    case 400: case 422: return 'Dữ liệu hình học hoặc hệ quy chiếu không hợp lệ.'
    case 401: return 'Không thể xác thực quyền đọc hồ sơ tuyến. Vui lòng kiểm tra phiên và quyền truy cập.'
    case 403: return 'Bạn không có quyền thao tác tuyến đường của dự án này.'
    case 404: return 'Không tìm thấy dự án hoặc bản nháp.'
    case 409: return 'Trạng thái hồ sơ đã thay đổi hoặc yêu cầu bị trùng. Vui lòng đối chiếu lại.'
    case 412: return 'Phiên bản hồ sơ đã thay đổi. Vui lòng tải lại trước khi tiếp tục.'
    case 428: return 'Thiếu thông tin phiên bản để thực hiện thao tác.'
    case 500: return 'Hệ thống đang gặp lỗi. Vui lòng thử lại sau.'
    default: return 'Không thể tải hồ sơ tuyến. Vui lòng thử lại.'
  }
}
const errorText = geometryErrorText

export const AlignmentGeometryWorkflow: React.FC<{ embedded?: boolean }> = ({ embedded = false } = {}) => {
  const { id } = useParams()
  const [query, setQuery] = useSearchParams()
  const projectId = id || query.get('projectId') || ''
  const draftId = query.get('draftId') || ''
  const referencedRoad = query.get('roadSectionId') || ''
  const referencedVersion = query.get('routeVersionId') || ''
  const user = useAuthStore(state => state.user)
  const supervisor = user?.role === RoleCode.SUPERVISOR
  const [sidebarTab, setSidebarTab] = useState<'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'>('SEGMENTS')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [projectsReload, setProjectsReload] = useState(0)
  const [context, setContext] = useState<Context | null>(null)
  const [profiles, setProfiles] = useState<CrsProfileView[]>([])
  const [profileId, setProfileId] = useState('')
  const [roadId, setRoadId] = useState('')
  const [draftInputId, setDraftInputId] = useState(draftId)
  const [draft, setDraft] = useState<{ data: GeometryDraftView; etag: string } | null>(null)
  const [readiness, setReadiness] = useState<Readiness | null>(null)
  const [preview, setPreview] = useState<GeometryPreview | null>(null)
  const [confirmed, setConfirmed] = useState<RoadGeometryVersionView | null>(null)
  const [imported, setImported] = useState<GeoJsonCenterlineReview | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const request = useRef(0)
  const geometryRequest = useRef(0)
  const [geometryLoading, setGeometryLoading] = useState(false)
  const [geometryError, setGeometryError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setProjectsLoading(true)
    const load = async () => {
      const items: Project[] = []
      const seen = new Set<string>()
      let cursor: string | undefined
      do {
        const response = await apiClient.get('/projects', { params: { cursor }, signal: controller.signal })
        items.push(...response.data.items)
        cursor = response.data.nextCursor || undefined
        if (cursor && seen.has(cursor)) throw new Error('Cursor dự án bị lặp.')
        if (cursor) seen.add(cursor)
      } while (cursor)
      if (!controller.signal.aborted) {
        setProjects(items)
        setProjectsError(null)
      }
    }
    load().catch(error => { if (!controller.signal.aborted) setProjectsError(errorText(error)) })
      .finally(() => { if (!controller.signal.aborted) setProjectsLoading(false) })
    return () => controller.abort()
  }, [user?.id, projectsReload])

  useEffect(() => {
    const current = ++request.current
    invalidateGeometry()
    setContext(null); setProfiles([]); setProfileId(''); setRoadId('')
    setDraft(null); setReadiness(null); setPreview(null); setConfirmed(null); setImported(null)
    setDraftInputId(draftId); setErrors([]); setBusy(false)
    if (!projectId || !projects.some(project => project.projectId === projectId)) return
    setBusy(true)
    const load = async () => {
      const reads = await Promise.allSettled([
        alignmentService.readProjectContext(projectId), alignmentService.fetchCrsProfiles(projectId),
        ...(draftId ? [alignmentService.getGeometryDraft(projectId, draftId), alignmentService.readDraftReadiness(projectId, draftId)] : [])
      ])
      if (request.current !== current) return
      const failures: string[] = []
      reads.forEach((result, index) => {
        if (result.status === 'rejected') { failures.push(`${['Danh mục tuyến', 'Hệ quy chiếu', 'Bản nháp', 'Điều kiện xác nhận'][index]}: ${errorText(result.reason)}`); return }
        if (index === 0) setContext(result.value as Context)
        if (index === 1) setProfiles(result.value as CrsProfileView[])
        if (index === 2) setDraft(result.value as { data: GeometryDraftView; etag: string })
        if (index === 3) setReadiness(result.value as Readiness)
      })
      setErrors(failures); setBusy(false)
      // An explicit reference from a server receipt can be read independently
      // of the currently blocked work-package discovery. Server verifies scope.
      if (referencedRoad && referencedVersion) {
        await loadGeometry(referencedRoad, referencedVersion, current)
      }
    }
    void load()
    return () => { request.current++; geometryRequest.current++ }
  }, [projectId, draftId, projects, reload, referencedRoad, referencedVersion])

  const importFile = async (file?: File) => {
    if (!file) return
    const current = request.current
    try {
      const result = inspectGeoJsonCenterline(await file.text())
      if (current === request.current) { setImported(result); setErrors(previous => previous.filter(error => !error.startsWith('GeoJSON:'))) }
    } catch (error) {
      if (current === request.current) { setImported(null); setErrors(previous => [...previous, `GeoJSON: ${error instanceof Error ? error.message : 'Tệp không hợp lệ.'}`]) }
    }
  }
  function invalidateGeometry() {
    geometryRequest.current++
    setConfirmed(null)
    setGeometryError(null)
    setGeometryLoading(false)
  }
  async function loadGeometry(selectedRoad: string, selectedVersion: string, contextRequest = request.current) {
    const attempt = ++geometryRequest.current
    const selectedProject = projectId
    const active = () => request.current === contextRequest && geometryRequest.current === attempt
    setConfirmed(null); setGeometryError(null); setGeometryLoading(true)
    try {
      const data = await alignmentService.readConfirmedGeometry(selectedProject, selectedRoad, selectedVersion)
      if (!active()) return
      if (data.projectId !== selectedProject || data.routeVersionId !== selectedVersion ||
          (data.roadSectionId && data.roadSectionId !== selectedRoad)) throw new Error('Geometry trả về sai project/road/version đã yêu cầu.')
      setConfirmed(data)
    } catch (error) { if (active()) setGeometryError(errorText(error)) }
    finally { if (active()) setGeometryLoading(false) }
  }
  const readGeometry = async () => {
    const road = context?.roadSections.find(item => item.roadSectionId === roadId)
    if (road) await loadGeometry(road.roadSectionId, road.currentVersionId)
  }
  const readPreview = async () => {
    if (!draft) return
    const current = request.current
    setBusy(true)
    try {
      const data = await alignmentService.previewGeometryDraft(projectId, draft.data.id)
      if (current === request.current) setPreview(data)
    } catch (error) { if (current === request.current) setErrors(previous => [...previous, errorText(error)]) }
    finally { if (current === request.current) setBusy(false) }
  }
  const chosenProfile = profiles.find(profile => profile.id === profileId)
  const points = imported?.coords || []
  const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]))
  const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]))
  const span = Math.max(maxX - minX, maxY - minY) || 1
  const confirmedPoints = confirmed?.metricCenterline?.coordinates || []
  const confirmedMinX = Math.min(...confirmedPoints.map(point => point[0]))
  const confirmedMinY = Math.min(...confirmedPoints.map(point => point[1]))
  const confirmedSpan = Math.max(...confirmedPoints.map(point => point[0] - confirmedMinX), ...confirmedPoints.map(point => point[1] - confirmedMinY)) || 1
  const projectInScope = projects.some(project => project.projectId === projectId)
  const discoveryReasons = !projectId ? ['Chưa chọn dự án.']
    : projectsLoading ? ['Đang tải danh mục dự án.']
    : projectsError ? ['Chưa xác minh phạm vi dự án vì tải danh mục lỗi.']
    : !projectInScope ? ['Dự án không thuộc danh mục API cho phép.']
    : !context ? ['Chưa đọc được danh mục tuyến và phiên bản hiện hành.'] : []
  const saveReasons = [
    ...(user?.role !== RoleCode.PROJECT_MANAGER ? ['Chỉ PM được lưu draft.'] : []),
    ...discoveryReasons,
    ...(!imported ? ['Chưa có tim tuyến đầu vào.'] : [
      'BLOCKED: Chưa xác định hệ quy chiếu và đơn vị đầu vào; không được lưu bản nháp.',
      'Chưa có mốc lý trình, lý do thay đổi, bề rộng khảo sát và hồ sơ bề rộng có nguồn xác minh.',
      ...(imported.adjacentDuplicates || imported.repeatedVertices || imported.selfIntersections ? ['Hình học đầu vào còn điểm trùng hoặc giao cắt cần kiểm tra.'] : []),
    ]),
    ...(!chosenProfile ? ['Chưa chọn hồ sơ hệ quy chiếu.'] : chosenProfile.definition?.sampleOnly ? ['Hồ sơ CRS được chọn chỉ là SAMPLE.'] : []),
    'Nguồn nhập này chưa đủ điều kiện lưu hoặc sửa bản nháp.',
  ]
  const confirmReasons = [
    ...(!supervisor ? ['Chỉ Giám sát được xác nhận.'] : []),
    ...discoveryReasons,
    ...(!draft ? ['Chưa đọc được bản nháp.'] : draft.data.status !== 'DRAFT' ? [`Draft có trạng thái ${draft.data.status}; không xác nhận lại.`] : []),
    ...(!readiness ? ['Chưa kiểm tra được điều kiện xác nhận.'] : [
      ...(!readiness.ready ? ['Hồ sơ chưa đủ điều kiện xác nhận. Vui lòng bổ sung dữ liệu.'] : []),
      ...(readiness.sampleOnly ? ['Readiness thuộc nguồn SAMPLE.'] : []),
    ]),
    'Chưa hoàn tất dữ liệu phiên bản tuyến, lý do và ngày hiệu lực để xác nhận.',
  ]
  const selectClass = 'border rounded p-2 w-full text-sm'

  if (embedded) {
    const coordinates = confirmed?.metricCenterline?.coordinates
    const points = coordinates?.filter(point => point.length >= 2 && point.every(Number.isFinite)) || []
    const validShape = confirmed?.metricCenterline?.type === 'LineString' && points.length >= 2 && points.length === coordinates?.length
    const x = points.map(point => point[0]), y = points.map(point => point[1])
    const minX = Math.min(...x), minY = Math.min(...y)
    const span = Math.max(Math.max(...x) - minX, Math.max(...y) - minY) || 1
    return <section className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-4 min-w-0">
      <h2 className="font-bold text-slate-900">Hồ sơ tuyến đường</h2>
      {(busy || projectsLoading) && <p role="status">Đang tải hồ sơ tuyến...</p>}
      {(projectsError || errors.length > 0) && <p role="alert" className="text-sm text-rose-700">Không thể tải đầy đủ hồ sơ tuyến. Vui lòng thử lại hoặc mở quản lý tuyến để đối chiếu.</p>}
      <label className="block text-sm">Hệ quy chiếu<select aria-label="Hệ quy chiếu tuyến" value={profileId} onChange={event => setProfileId(event.target.value)} className={selectClass}><option value="">Chọn hồ sơ hệ quy chiếu</option>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.code} / {profile.revision}</option>)}</select></label>
      <label className="block text-sm">Tuyến đã ghi nhận<select aria-label="Tuyến đã ghi nhận" value={roadId} onChange={event => { invalidateGeometry(); setRoadId(event.target.value) }} className={selectClass}><option value="">Chọn tuyến</option>{context?.roadSections.map(road => <option key={road.roadSectionId} value={road.roadSectionId}>{road.name || road.code}</option>)}</select></label>
      <button type="button" disabled={!roadId || geometryLoading} onClick={readGeometry} className="bg-[#C9A227] hover:bg-[#B38E1E] text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50">Đọc tuyến đã xác nhận</button>
      {geometryLoading && <p role="status">Đang đọc tuyến...</p>}
      {geometryError && <p role="alert">Không thể đọc tuyến đã chọn. Vui lòng thử lại.</p>}
      {confirmed && <p className="text-sm">Tuyến đã xác nhận{Number.isFinite(confirmed.lengthMeters) ? ` · ${confirmed.lengthMeters} m` : ''}</p>}
      {confirmed?.sampleOnly && <p className="text-sm">Dữ liệu minh họa, chưa xác nhận độ chính xác khảo sát.</p>}
      {confirmed?.approvedAt && <p className="text-sm">Ngày xác nhận: {new Date(confirmed.approvedAt).toLocaleString('vi-VN')}</p>}
      {validShape && <svg role="img" aria-label="Xem trước tuyến đã xác nhận từ máy chủ" viewBox="0 0 600 240" className="w-full border rounded-lg"><polyline fill="none" stroke="#2D3748" strokeWidth="3" points={points.map(point => `${10 + (point[0] - minX) / span * 580},${230 - (point[1] - minY) / span * 220}`).join(' ')} /></svg>}
      {draft && <p className="text-sm">Bản nháp: {draft.data.status === 'CONFIRMED' ? 'Đã xác nhận' : draft.data.status === 'DRAFT' ? 'Bản nháp' : 'Chưa cập nhật'}</p>}
      {readiness && <p className="text-sm">{readiness.ready ? 'Hồ sơ đủ điều kiện kiểm tra xác nhận.' : 'Hồ sơ cần bổ sung trước khi xác nhận.'}</p>}
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { invalidateGeometry(); setProjectsReload(n => n + 1); setReload(n => n + 1) }} className="border rounded-lg px-3 py-2 text-sm">Tải lại hồ sơ tuyến</button>
        <Link to={`${supervisor ? '/sup' : '/pm'}/projects/${projectId}/alignment?${query.toString()}`} className="border border-[#C9A227] text-[#8C6D1F] rounded-lg px-3 py-2 text-sm">Quản lý tuyến và bản nháp</Link>
      </div>
    </section>
  }

  return <div className="space-y-5 max-w-[1600px] mx-auto min-w-0 [&_button]:border [&_button]:rounded-lg [&_button]:px-3 [&_button]:py-2 [&_button:disabled]:opacity-50">
    <AlignmentHeader serverView basePath={supervisor ? '/sup' : '/pm'} projectName={projects.find(project => project.projectId === projectId)?.name} statusLabel={draft?.data.status === 'CONFIRMED' ? 'Đã xác nhận' : draft?.data.status === 'DRAFT' ? 'Bản nháp' : undefined} isSupervisor={supervisor} canImport={!!projectId && projectInScope && !projectsLoading && !busy} onOpenImport={() => setImportModalOpen(true)} />
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
    <p>{supervisor ? 'Giám sát đọc draft và readiness từ máy chủ trước khi xác nhận.' : 'PM nhập tim tuyến; chỉ sử dụng geometry/version do máy chủ trả về.'}</p>
    <label className="block">Dự án<select aria-label="Dự án geometry" className={selectClass} value={projectId} onChange={event => {
      invalidateGeometry()
      setQuery({ projectId: event.target.value })
      if (id) window.location.assign(`${supervisor ? '/sup' : '/pm'}/projects/${event.target.value}/alignment`)
    }}><option value="">Chọn dự án được phép đọc</option>{projectId && !projectInScope && <option value={projectId}>Dự án đang yêu cầu: {projectId}</option>}{projects.map(project => <option key={project.projectId} value={project.projectId}>{project.name} ({project.projectCode})</option>)}</select></label>
    {projectsLoading && <p role="status">Đang tải danh sách dự án...</p>}
    {projectsError && <p role="alert">Tải danh sách dự án thất bại: {projectsError}</p>}
    {!projectsLoading && !projectsError && projects.length === 0 && <p>Không có dự án trong phạm vi tài khoản.</p>}
    {!projectsLoading && !projectsError && projectId && !projectInScope && <p role="alert">Dự án không thuộc danh mục API cho phép.</p>}
    {busy && <p role="status">Đang đọc dữ liệu geometry...</p>}
    {errors.map((error, i) => <p key={i} role="alert" className="text-red-700">{error}</p>)}
    <button type="button" onClick={() => { invalidateGeometry(); setProjectsReload(value => value + 1); setReload(value => value + 1) }} disabled={projectsLoading}>Tải lại từ máy chủ</button>
    <div className="grid md:grid-cols-2 gap-4">
      <label>Hệ quy chiếu<select aria-label="CRS geometry" className={selectClass} value={profileId} onChange={event => setProfileId(event.target.value)}><option value="">Chọn hồ sơ CRS</option>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.code}{profile.definition?.sampleOnly ? ' / SAMPLE' : ''}</option>)}</select></label>
      <label>Tuyến đường<select aria-label="Road geometry" className={selectClass} value={roadId} onChange={event => { invalidateGeometry(); setRoadId(event.target.value) }}><option value="">{context ? 'Chọn road/version hiện có' : 'Chưa có danh mục tuyến'}</option>{context?.roadSections.map(road => <option key={road.roadSectionId} value={road.roadSectionId}>{road.name || road.code}</option>)}</select></label>
    </div>
    {chosenProfile && <p>SRID {chosenProfile.definition?.sourceSrid}; axis {chosenProfile.definition?.axisOrder}; {chosenProfile.definition?.metresPerUnit} metresPerUnit là metadata profile, không dùng đổi độ sang mét. Không tự gán accuracy.</p>}
    <button type="button" disabled={busy || geometryLoading || !roadId} onClick={readGeometry}>Đọc geometry confirmed</button>
    {geometryLoading && <p role="status">Đang đọc geometry đã chọn...</p>}
    {geometryError && <p role="alert">Geometry đã chọn: {geometryError}</p>}
    {confirmed?.projectId === projectId && <p>Tuyến đã xác nhận: {confirmed.lengthMeters} m. Ngày hiệu lực: {confirmed.effectiveFrom}.</p>}
    </section>
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
      <AlignmentMap serverView caption={confirmed ? 'Tuyến đã xác nhận trên máy chủ' : 'Chưa cập nhật geometry đã xác nhận'}>
        {confirmedPoints.length ? <svg role="img" aria-label="Bản đồ tuyến từ dữ liệu máy chủ" viewBox="0 0 620 420" className="w-full max-h-96"><polyline fill="none" stroke="#C9A227" strokeWidth="3" points={confirmedPoints.map(point => `${10 + (point[0] - confirmedMinX) / confirmedSpan * 590},${410 - (point[1] - confirmedMinY) / confirmedSpan * 390}`).join(' ')} /></svg> : <div className="text-center text-slate-400"><Icon name="route" size={40} className="mx-auto mb-3" /><p>Chọn tuyến để xem hình học đã xác nhận.</p></div>}
      </AlignmentMap>
      <AlignmentSidebar readOnly rightTab={sidebarTab} onSetRightTab={setSidebarTab} />
    </section>
    <div className="grid lg:grid-cols-2 gap-4 items-start">
    {!supervisor && <section className="bg-white border rounded-xl p-5 space-y-3 min-w-0">
      <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">Nhập GeoJSON để kiểm tra đầu vào</h2><button type="button" disabled={!projectId || !projectInScope || projectsLoading || busy} onClick={() => setImportModalOpen(true)}>Mở hộp thoại nhập tuyến</button></div>
      <input aria-label="Nhập tim tuyến GeoJSON" type="file" accept=".geojson,.json" disabled={!projectId || !projectInScope || projectsLoading || busy} onChange={event => { void importFile(event.target.files?.[0]); event.target.value = '' }} />
      {imported && <>
        <p>Centerline: {imported.layer} — {points.length} điểm; bỏ qua {imported.ignoredFeatureCount} feature khác.</p>
        <p>{imported.sourceCrs}. Tên có chữ nhánh không xác lập topology.</p>

        <p>Trùng liền kề: {imported.adjacentDuplicates}; đỉnh lặp: {imported.repeatedVertices}; giao cắt phát hiện: {imported.selfIntersections ?? 'chưa kiểm tra (tệp lớn)'}. Chưa là readiness backend.</p>
        <p>roadWidth metadata: {imported.roadWidthHintMeters ?? 'không có'} m; chưa thay widthProfile hoặc surveyWidthMeters.</p>
        <svg role="img" aria-label="Preview tim tuyến đầu vào, chưa lưu máy chủ" viewBox="0 0 620 420" className="w-full max-h-80 bg-slate-50 border"><polyline fill="none" stroke="#2D3748" strokeWidth="3" points={points.map(p => `${10 + (p[0] - minX) / span * 590},${410 - (p[1] - minY) / span * 390}`).join(' ')} /></svg>
        <p role="alert">BLOCKED: Tệp chưa xác định hệ quy chiếu và đơn vị. Chỉ xem hình dạng đầu vào, chưa lưu. Chưa hỗ trợ chuyển đổi hệ quy chiếu trong luồng này; cần đầu vào đúng hệ kỹ thuật và các thông số có nguồn xác minh.</p>

      </>}
      <button type="button" disabled={saveReasons.length > 0} aria-describedby="geometry-save-blockers">Lưu draft</button>
      <ul id="geometry-save-blockers">{saveReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
    </section>}
    <section className="bg-white border rounded p-4 space-y-2">
      <h2 className="font-semibold">Đọc draft hiện có theo UUID từ API/biên nhận</h2>
      <p>Nhập mã bản nháp từ biên nhận để đọc lại đúng hồ sơ. Đường dẫn giữ lựa chọn khi tải lại trang.</p>
      <input aria-label="Draft UUID" className={selectClass} value={draftInputId} onChange={event => setDraftInputId(event.target.value)} />
      <button type="button" disabled={!projectId || busy || !/^[0-9a-f-]{36}$/i.test(draftInputId)} onClick={() => setQuery({ projectId, draftId: draftInputId })}>Đọc draft và readiness</button>
      {draft && <><p>Bản nháp: {draft.data.status === 'CONFIRMED' ? 'Đã xác nhận' : draft.data.status === 'DRAFT' ? 'Đang soạn' : 'Chưa cập nhật'}. Hệ quy chiếu: {draft.data.sourceCrs}.</p><button type="button" disabled={busy || supervisor} onClick={readPreview}>Preview backend</button></>}
      {readiness && <p>{readiness.ready ? 'Hồ sơ đủ điều kiện kiểm tra xác nhận.' : 'Hồ sơ cần bổ sung trước khi xác nhận.'}{readiness.sampleOnly ? ' Dữ liệu minh họa.' : ''}</p>}
      {preview && <p>Xem trước trên máy chủ: {preview.lengthMeters} m; hệ kỹ thuật {preview.engineeringSrid}.</p>}
      <button type="button" disabled={confirmReasons.length > 0} aria-describedby="geometry-confirm-blockers">Xác nhận</button>
      <ul id="geometry-confirm-blockers">{confirmReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
    </section>
    </div>
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"><h2 className="font-bold flex items-center gap-2"><Icon name="history" size={20} />Quy trình và lịch sử tuyến</h2><div className="grid sm:grid-cols-3 gap-3">{['Lập bản nháp', 'Trình kiểm tra', 'Xác nhận tuyến'].map(label => <div key={label} className="border rounded-lg p-3"><p className="text-sm font-semibold">{label}</p><p className="text-xs text-slate-500 mt-1">Chưa cập nhật</p></div>)}</div><p className="text-sm text-slate-500">Chưa cập nhật lịch sử xử lý.</p></section>
    <AlignmentImportModal inspectOnly isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onProcessGeoJsonFile={file => { void importFile(file) }} />
    <p role="status">BLOCKED: Chưa có thao tác trình duyệt, yêu cầu sửa, trình lại hoặc lịch sử duyệt được bàn giao. Không tự tạo trạng thái chờ duyệt hoặc dùng xác nhận để thay từ chối.</p>
    <p>Phân đoạn/publish chỉ thực hiện sau geometry confirmed và đủ định nghĩa phân đoạn từ nguồn hợp lệ; chưa tự chia tuyến hoặc tạo mặt đường giả.</p>
  </div>
}
