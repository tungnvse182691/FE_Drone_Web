import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { apiClient } from '../../../api/client'
import { alignmentService, type CrsProfileView, type GeometryDraftView, type GeometryPreview, type RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { inspectGeoJsonCenterline, type GeoJsonCenterlineReview } from './alignmentImportHelpers'

type Project = { projectId: string; projectCode: string; name: string }
type Context = Awaited<ReturnType<typeof alignmentService.readProjectContext>>
type Readiness = Awaited<ReturnType<typeof alignmentService.readDraftReadiness>>
const errorText = (error: any) => `${error.response?.status || ''} ${error.response?.data?.code || error.message || 'Không tải được dữ liệu'}`.trim()

export const AlignmentGeometryWorkflow: React.FC = () => {
  const { id } = useParams()
  const [query, setQuery] = useSearchParams()
  const projectId = id || query.get('projectId') || ''
  const draftId = query.get('draftId') || ''
  const referencedRoad = query.get('roadSectionId') || ''
  const referencedVersion = query.get('routeVersionId') || ''
  const user = useAuthStore(state => state.user)
  const supervisor = user?.role === RoleCode.SUPERVISOR
  const [projects, setProjects] = useState<Project[]>([])
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
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
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
      if (!controller.signal.aborted) setProjects(items)
    }
    load().catch(error => { if (!controller.signal.aborted) setErrors([errorText(error)]) })
    return () => controller.abort()
  }, [user?.id])

  useEffect(() => {
    const current = ++request.current
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
        if (result.status === 'rejected') { failures.push(`${['Road/version (work-package)', 'CRS', 'Draft', 'Readiness'][index]}: ${errorText(result.reason)}`); return }
        if (index === 0) setContext(result.value as Context)
        if (index === 1) setProfiles(result.value as CrsProfileView[])
        if (index === 2) setDraft(result.value as { data: GeometryDraftView; etag: string })
        if (index === 3) setReadiness(result.value as Readiness)
      })
      setErrors(failures); setBusy(false)
      // An explicit reference from a server receipt can be read independently
      // of the currently blocked work-package discovery. Server verifies scope.
      if (referencedRoad && referencedVersion) {
        try {
          const geometry = await alignmentService.readConfirmedGeometry(projectId, referencedRoad, referencedVersion)
          if (request.current === current) setConfirmed(geometry)
        } catch (error) {
          if (request.current === current) setErrors(previous => [...previous, `Geometry tham chiếu: ${errorText(error)}`])
        }
      }
    }
    void load()
    return () => { request.current++ }
  }, [projectId, draftId, projects, reload, referencedRoad, referencedVersion])

  const importFile = async (file?: File) => {
    if (!file) return
    const current = request.current
    try {
      const result = inspectGeoJsonCenterline(await file.text())
      if (current === request.current) { setImported(result); setErrors(previous => previous.filter(error => !error.startsWith('GeoJSON:'))) }
    } catch (error) {
      if (current === request.current) { setImported(null); setErrors(previous => [...previous, `GeoJSON: ${errorText(error)}`]) }
    }
  }
  const readGeometry = async () => {
    const road = context?.roadSections.find(item => item.roadSectionId === roadId)
    if (!road) return
    const current = request.current
    setBusy(true)
    try {
      const data = await alignmentService.readConfirmedGeometry(projectId, road.roadSectionId, road.currentVersionId)
      if (current === request.current) setConfirmed(data)
    } catch (error) { if (current === request.current) setErrors(previous => [...previous, errorText(error)]) }
    finally { if (current === request.current) setBusy(false) }
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
  const selectClass = 'border rounded p-2 w-full text-sm'

  return <div className="space-y-4 max-w-5xl mx-auto">
    <h1 className="text-xl font-bold">Tim tuyến và geometry đã xác nhận</h1>
    <p>{supervisor ? 'Giám sát đọc draft và readiness từ máy chủ trước khi xác nhận.' : 'PM nhập tim tuyến; chỉ sử dụng geometry/version do máy chủ trả về.'}</p>
    <label className="block">Dự án<select aria-label="Dự án geometry" className={selectClass} value={projectId} onChange={event => {
      setQuery({ projectId: event.target.value })
      if (id) window.location.assign(`${supervisor ? '/sup' : '/pm'}/projects/${event.target.value}/alignment`)
    }}><option value="">Chọn dự án được phép đọc</option>{projects.map(project => <option key={project.projectId} value={project.projectId}>{project.name} ({project.projectCode})</option>)}</select></label>
    {projectId && !projects.some(project => project.projectId === projectId) && <p role="alert">Dự án chưa được API trả về trong phạm vi tài khoản.</p>}
    {busy && <p role="status">Đang đọc dữ liệu geometry...</p>}
    {errors.map((error, i) => <p key={i} role="alert" className="text-red-700">{error}</p>)}
    {projectId && <button type="button" onClick={() => setReload(value => value + 1)} disabled={busy}>Tải lại từ máy chủ</button>}
    <div className="grid md:grid-cols-2 gap-4">
      <label>CRS/version từ API<select aria-label="CRS geometry" className={selectClass} value={profileId} onChange={event => setProfileId(event.target.value)}><option value="">Chọn hồ sơ CRS</option>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.code} / revision {profile.revision} / {profile.status}{profile.definition?.sampleOnly ? ' / SAMPLE' : ''}</option>)}</select></label>
      <label>Road/version từ API<select aria-label="Road geometry" className={selectClass} value={roadId} onChange={event => { setRoadId(event.target.value); setConfirmed(null) }}><option value="">{context ? 'Chọn road/version hiện có' : 'Chưa đọc được work-package'}</option>{context?.roadSections.map(road => <option key={road.roadSectionId} value={road.roadSectionId}>{road.code} / v{road.versionNo}</option>)}</select></label>
    </div>
    {chosenProfile && <p>SRID {chosenProfile.definition?.sourceSrid}; axis {chosenProfile.definition?.axisOrder}; {chosenProfile.definition?.metresPerUnit} metresPerUnit là metadata profile, không dùng đổi độ sang mét. Không tự gán accuracy.</p>}
    <button type="button" disabled={busy || !roadId} onClick={readGeometry}>Đọc geometry confirmed</button>
    {confirmed && <p>Geometry máy chủ: {confirmed.routeVersionId}; v{confirmed.versionNo}; lengthMeters={confirmed.lengthMeters}; isCurrent={String(confirmed.isCurrent)}.</p>}
    {!supervisor && <section className="bg-white border rounded p-4 space-y-3">
      <h2 className="font-semibold">Nhập GeoJSON để kiểm tra đầu vào</h2>
      <input aria-label="Nhập tim tuyến GeoJSON" type="file" accept=".geojson,.json" disabled={!projectId} onChange={event => { void importFile(event.target.files?.[0]); event.target.value = '' }} />
      {imported && <>
        <p>Centerline: {imported.layer} — {points.length} điểm; bỏ qua {imported.ignoredFeatureCount} feature khác.</p>
        <p>{imported.sourceCrs}. Tên có chữ nhánh không xác lập topology.</p>
        <p>Ước tính Haversine (R=6371000 m): {imported.estimatedLengthMeters.toFixed(3)} m; metadata: {imported.declaredLengthMeters ?? 'không có'} m.</p>
        <p>Trùng liền kề: {imported.adjacentDuplicates}; đỉnh lặp: {imported.repeatedVertices}; giao cắt phát hiện: {imported.selfIntersections ?? 'chưa kiểm tra (tệp lớn)'}. Chưa là readiness backend.</p>
        <p>roadWidth metadata: {imported.roadWidthHintMeters ?? 'không có'} m; chưa thay widthProfile hoặc surveyWidthMeters.</p>
        <svg role="img" aria-label="Preview tim tuyến đầu vào, chưa lưu máy chủ" viewBox="0 0 620 420" className="w-full max-h-80 bg-slate-50 border"><polyline fill="none" stroke="#2D3748" strokeWidth="3" points={points.map(p => `${10 + (p[0] - minX) / span * 590},${410 - (p[1] - minY) / span * 390}`).join(' ')} /></svg>
        <p role="alert">Chỉ preview đầu vào, chưa lưu draft. Backend COORDINATES yêu cầu sourceCrs trùng engineering UTM và tọa độ mét; file này là longitude/latitude. Cần transform có căn cứ, stationOriginMeters, changeReason, widthProfile phủ đúng chiều dài mét và surveyWidthMeters do người có thẩm quyền cung cấp. Không tự điền calibration, số làn, vật liệu hoặc accuracy.</p>
        <button type="button" disabled>Lưu draft — chưa đủ đầu vào/CRS</button>
      </>}
    </section>}
    <section className="bg-white border rounded p-4 space-y-2">
      <h2 className="font-semibold">Đọc draft hiện có theo UUID từ API/biên nhận</h2>
      <p>Contract hiện không có collection draft để tự tìm bản nháp. UUID chỉ định được giữ trên URL để F5 đọc lại cùng hồ sơ.</p>
      <input aria-label="Draft UUID" className={selectClass} value={draftInputId} onChange={event => setDraftInputId(event.target.value)} />
      <button type="button" disabled={!projectId || busy || !/^[0-9a-f-]{36}$/i.test(draftInputId)} onClick={() => setQuery({ projectId, draftId: draftInputId })}>Đọc draft và readiness</button>
      {draft && <><p>Draft {draft.data.id}: {draft.data.status}; version {draft.data.version}; ETag {draft.etag}; sourceCrs {draft.data.sourceCrs}.</p><button type="button" disabled={busy || supervisor} onClick={readPreview}>Preview backend</button></>}
      {readiness && <div><p>Readiness server: {String(readiness.ready)}; sampleOnly: {String(readiness.sampleOnly)}</p><p>Thiếu: {readiness.missingFields?.join(', ') || 'không có'}; lỗi: {readiness.errors?.join(', ') || 'không có'}.</p><p>{readiness.warnings?.join(', ')}</p></div>}
      {preview && <p>Preview server: {preview.lengthMeters} m, engineeringSrid {preview.engineeringSrid}; {preview.warnings?.join(', ')}.</p>}
      {supervisor && <><button type="button" disabled>Xác nhận — chờ đủ nguồn/road/version và readiness</button><p>Chưa ghi confirmation khi chưa kiểm current version/pin và đầu vào. Không dùng toast hoặc trạng thái local thay biên nhận server.</p></>}
    </section>
    <p>Phân đoạn/publish chỉ thực hiện sau geometry confirmed và đủ định nghĩa phân đoạn từ nguồn hợp lệ; chưa tự chia tuyến hoặc tạo mặt đường giả.</p>
  </div>
}
