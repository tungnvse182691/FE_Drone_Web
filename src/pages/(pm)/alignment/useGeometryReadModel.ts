import { geometrySubmissionService, type GeometrySubmission } from '../../../api/services/geometrySubmissionService'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../api/client'
import { alignmentService, type RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { useAuthStore } from '../../../store/authStore'

/** Read-only discovery for the restored alignment screen. No local approval or draft authority. */
export function useGeometryReadModel(projectId: string) {
  const [params, setParams] = useSearchParams()
  const [submission, setSubmission] = useState<GeometrySubmission | null>(null), [submissionError, setSubmissionError] = useState(''), [submissionLoading, setSubmissionLoading] = useState(true), [submissionScope, setSubmissionScope] = useState('')
  const scope = `${projectId}:${useAuthStore(s => s.authEpoch)}`
  const activeSubmission = submissionScope === scope ? submission : null
  const historicalLayout = !!params.get('layoutId') && !!params.get('roadSectionId') && !!params.get('routeVersionId') && activeSubmission?.status === 'CONFIRMED' && (params.get('roadSectionId') !== activeSubmission.roadSectionId || params.get('routeVersionId') !== activeSubmission.confirmedRouteVersionId)
  const explicitRoad = params.get('roadSectionId') || '', explicitVersion = params.get('routeVersionId') || ''
  const explicitGeometry = !!explicitRoad && !!explicitVersion
  const explicitDraft = params.get('draftId') || ''
  const submissionSelected = !!activeSubmission && !historicalLayout && (!explicitGeometry || explicitDraft === activeSubmission.draftId && explicitRoad === activeSubmission.roadSectionId && explicitVersion === activeSubmission.confirmedRouteVersionId)
  const draftId = explicitDraft || (submissionSelected && activeSubmission?.status !== 'CONFIRMED' ? activeSubmission?.draftId || '' : '')
  const roadReference = explicitGeometry ? explicitRoad : ''
  const versionReference = explicitGeometry ? explicitVersion : ''
  const epoch = useAuthStore(state => state.authEpoch)
  const [projects, setProjects] = useState<Array<{projectId: string; name: string; projectCode: string}>>([])
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [reload, setReload] = useState(0)
  const [context, setContext] = useState<Awaited<ReturnType<typeof alignmentService.readProjectContext>> | null>(null)
  const [contextLoading, setContextLoading] = useState(false), [contextError, setContextError] = useState(''), [contextScope, setContextScope] = useState('')
  const activeContext = contextScope === scope ? context : null
  const currentRoutes = activeContext?.roadSections.filter(section => !!section.currentVersionId) || []
  const [geometry, setGeometry] = useState<RoadGeometryVersionView | null>(null)
  const [geometryLoading, setGeometryLoading] = useState(false), [geometryError, setGeometryError] = useState('')
  const [profiles, setProfiles] = useState<Awaited<ReturnType<typeof alignmentService.fetchCrsProfiles>>>([])
  const [profileError, setProfileError] = useState('')
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [draft, setDraft] = useState<Awaited<ReturnType<typeof alignmentService.getGeometryDraft>> | null>(null)
  const [readiness, setReadiness] = useState<Awaited<ReturnType<typeof alignmentService.readDraftReadiness>> | null>(null)
  const [draftLoading, setDraftLoading] = useState(false), [draftError, setDraftError] = useState('')
  useEffect(() => {
    let active=true;setSubmissionLoading(true);setSubmissionError('');setSubmission(null);setSubmissionScope('')
    if(!projectId){setSubmissionLoading(false);return}
    geometrySubmissionService.read(projectId).then(value=>{if(active){setSubmission(value);setSubmissionScope(scope)}}).catch(e=>{if(active)setSubmissionError(`Không đọc được hồ sơ trình: HTTP ${e?.response?.status || ''} ${e?.response?.data?.code || e.message}`)}).finally(()=>{if(active)setSubmissionLoading(false)})
    return()=>{active=false}
  },[scope,reload])
  useEffect(() => {
    let active = true
    setProfiles([]); setProfileError(''); setDraft(null); setReadiness(null); setDraftError(''); setDraftLoading(false)
    if (!projectId) { setProfilesLoading(false); return }
    setProfilesLoading(true)
    alignmentService.fetchCrsProfiles(projectId).then(value => { if (active) setProfiles(value) })
      .catch(() => { if (active) setProfileError('Không tải được hồ sơ CRS từ máy chủ.') })
      .finally(() => { if (active) setProfilesLoading(false) })
    if (draftId) {
      if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(draftId)) { setDraftError('ID bản nháp không hợp lệ.'); return () => { active = false } }
      setDraftLoading(true)
      ;(async () => {
        const result = await alignmentService.getGeometryDraft(projectId, draftId)
        if (!active) return
        if (submissionSelected && activeSubmission && (result.data.status !== activeSubmission.status || result.data.roadSectionId !== activeSubmission.roadSectionId || result.etag !== `"${activeSubmission.version}"` || result.data.version !== activeSubmission.version)) throw new Error('GET draft không khớp lookup hồ sơ trình.')
        setDraft(result)
        const value = await alignmentService.readDraftReadiness(projectId, draftId)
        if (active) setReadiness(value)
      })().catch(() => { if (active) setDraftError('Không đọc đầy đủ bản nháp hoặc readiness. Dữ liệu đã đọc được giữ nguyên; hãy kiểm tra ID/quyền và thử lại.') })
        .finally(() => { if (active) setDraftLoading(false) })
    }
    return () => { active = false }
  }, [projectId, draftId, epoch, reload, activeSubmission, historicalLayout])
  useEffect(()=>{
    if(!activeSubmission || historicalLayout || activeSubmission.status === 'CONFIRMED' || explicitGeometry)return
    const next=new URLSearchParams(params);next.set('draftId',activeSubmission.draftId)
    if (params.get('draftId') !== activeSubmission.draftId || params.get('roadSectionId') !== roadReference || params.get('routeVersionId') !== versionReference) { next.delete('segmentSetId'); next.delete('layoutId') }
    next.delete('roadSectionId'); next.delete('routeVersionId')
    if(next.toString()!==params.toString())setParams(next,{replace:true})
  },[activeSubmission,params,historicalLayout])
  const attempt = useRef(0)
  const selection = useRef({ projectId, epoch, roadReference, versionReference, draftId })
  selection.current = { projectId, epoch, roadReference, versionReference, draftId }
  useEffect(() => {
    attempt.current++; setGeometry(null); setGeometryError(''); setGeometryLoading(false)
    return () => { attempt.current++ }
  }, [projectId, epoch])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setProjects([])
    ;(async () => {
      const all: Array<{projectId: string; name: string; projectCode: string}> = [], seen = new Set<string>()
      let cursor: string | undefined
      do {
        const response = await apiClient.get('/projects', {params:{limit:100,cursor},signal:controller.signal})
        if (!Array.isArray(response.data?.items)) throw new Error('Danh sách dự án trả sai contract')
        all.push(...response.data.items)
        cursor = response.data.nextCursor || undefined
        if (cursor && seen.has(cursor)) throw new Error('Cursor lặp')
        if (cursor) seen.add(cursor)
      } while (cursor)
      if (!controller.signal.aborted) setProjects(all)
    })().catch(() => {if (!controller.signal.aborted) setError('Không thể tải danh sách dự án. Vui lòng thử lại.')})
      .finally(() => {if (!controller.signal.aborted) setLoading(false)})
    return () => controller.abort()
  }, [epoch, reload])
  useEffect(() => {
    let active = true
    setContext(null); setContextScope(''); setContextError(''); setContextLoading(!!projectId)
    if (projectId && projects.some(project => project.projectId === projectId)) {
      alignmentService.readProjectContext(projectId).then(value => {if (active) {
        setContext(value); setContextScope(scope)
        setGeometryError(error => error === 'Không thể tải phạm vi tuyến. Vui lòng kiểm tra quyền đọc.' ? '' : error)
      }})
        .catch(() => {if (active) setContextError('Không thể tải phạm vi tuyến. Vui lòng kiểm tra quyền đọc.')})
        .finally(() => { if (active) setContextLoading(false) })
    }
    else if (!loading) { setContextLoading(false); if (projectId) setContextError('Dự án không thuộc danh sách server được phép đọc.') }
    return () => { active = false }
  }, [projectId, epoch, projects, loading, reload])
  useEffect(() => {
    if (!activeContext || contextLoading || contextError || submissionLoading || submissionError || explicitRoad || explicitVersion || explicitDraft) return
    if (activeSubmission && activeSubmission.status !== 'CONFIRMED') return
    if (currentRoutes.length !== 1) return
    const route = currentRoutes[0], next = new URLSearchParams(params)
    next.set('roadSectionId', route.roadSectionId); next.set('routeVersionId', route.currentVersionId)
    if (activeSubmission?.status === 'CONFIRMED' && activeSubmission.roadSectionId === route.roadSectionId && activeSubmission.confirmedRouteVersionId === route.currentVersionId) next.set('draftId', activeSubmission.draftId)
    setParams(next, {replace: true})
  }, [activeContext, contextLoading, contextError, submissionLoading, submissionError, activeSubmission, explicitRoad, explicitVersion, explicitDraft])
  const invalidate = () => {attempt.current++;setGeometry(null);setGeometryError('');setGeometryLoading(false)}
  const read = async (roadId: string, versionId: string) => {
    const currentAttempt = ++attempt.current, actorEpoch = epoch, selectedProject = projectId, selectedDraft = draftId, selectedRoad = roadReference, selectedVersion = versionReference
    const current = () => attempt.current === currentAttempt && selection.current.projectId === selectedProject && selection.current.epoch === actorEpoch && selection.current.draftId === selectedDraft && selection.current.roadReference === selectedRoad && selection.current.versionReference === selectedVersion
    setGeometry(null);setGeometryError('');setGeometryLoading(true)
    try {
      const value = await alignmentService.readConfirmedGeometry(selectedProject, roadId, versionId)
      if (!current()) return
      if (value.projectId !== selectedProject || value.routeVersionId !== versionId || value.roadSectionId !== roadId || selectedDraft && value.sourceDraftId !== selectedDraft) throw new Error('Sai reference')
      const currentRef = activeContext?.roadSections.find(section => section.roadSectionId === roadId && section.currentVersionId === versionId)
      if (currentRef && value.isCurrent !== true) throw new Error('Reference hiện hành trả geometry không hiện hành; dữ liệu không nhất quán.')
      setGeometry(value)
    } catch (e) {if (current()) setGeometryError((e as Error).message.includes('không nhất quán') ? (e as Error).message : 'Không thể tải hình học đúng tuyến và phiên bản đã chọn.')}
    finally {if (current()) setGeometryLoading(false)}
  }
  useEffect(() => {
    if ((contextLoading || loading) && !historicalLayout || !activeContext && !explicitGeometry) { invalidate(); return }
    if (!!explicitRoad !== !!explicitVersion) { invalidate(); setGeometryError('Cần đủ cặp tuyến và phiên bản; không tự chọn thay reference thiếu.'); return }
    if (projectId && roadReference && versionReference) void read(roadReference, versionReference)
    else invalidate()
    return () => { attempt.current++ }
  }, [projectId, epoch, draftId, roadReference, versionReference, reload, activeContext, contextLoading, loading])
  const openDraft = (id: string) => {
    invalidate()
    const next = new URLSearchParams(params)
    if (id) next.set('draftId', id); else next.delete('draftId')
    next.delete('roadSectionId'); next.delete('routeVersionId'); next.delete('segmentSetId'); next.delete('layoutId'); setParams(next)
  }
  const openGeometry = (roadId: string, versionId: string) => {
    const next = new URLSearchParams(params)
    if (roadId !== roadReference || versionId !== versionReference) { next.delete('segmentSetId'); next.delete('layoutId') }
    next.delete('draftId')
    if (activeSubmission?.status === 'CONFIRMED' && activeSubmission.roadSectionId === roadId && activeSubmission.confirmedRouteVersionId === versionId) next.set('draftId', activeSubmission.draftId)
    next.set('roadSectionId', roadId); next.set('routeVersionId', versionId); setParams(next)
  }
  const openConfirmed = (id: string, geometry: RoadGeometryVersionView) => {
    const next = new URLSearchParams(params)
    if (id !== draftId || geometry.roadSectionId !== roadReference || geometry.routeVersionId !== versionReference) { next.delete('segmentSetId'); next.delete('layoutId') }
    next.set('draftId', id); next.set('roadSectionId', geometry.roadSectionId!); next.set('routeVersionId', geometry.routeVersionId)
    setParams(next)
  }
  return {submission:activeSubmission,submissionError,submissionLoading,submissionReady:submissionScope===scope, draftId,roadReference,versionReference,openDraft,openGeometry,openConfirmed,setReadiness,draft,readiness,draftLoading,draftError,profiles,profilesLoading,profileError,projects,loading,error,context:activeContext,currentRoutes,contextLoading,contextError,geometry,geometryLoading,geometryError,read,invalidate,retry:()=>setReload(value=>value+1)}
}
