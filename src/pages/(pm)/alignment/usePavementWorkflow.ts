import { PAVEMENT_RENDER_TOLERANCE_METERS } from '../../../config/pavement'
import { buildSavedPavement } from './savedPavementDisplay'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { pavementService, type PavementLayoutInput, type PavementLayoutView, type PavementPins, type PavementLayoutSummary } from '../../../api/services/pavementService'
import { pavementInput, pendingPavement, sameLayout, revisePavement, savePavement, completePavement, type PavementEditor } from '../../../api/services/pavementCommands'
import { useAsBuiltWorkflow } from './useAsBuiltWorkflow'

export function usePavementWorkflow(projectId: string, sectionId: string, editor: PavementEditor,
  widthProfile: PavementLayoutInput['widthProfile'], widthsDirty: boolean, mainline: boolean,
  restore: (layout: PavementLayoutInput | null) => void, notify: (message: string) => void, editRevision = 0, widthRevision = 0) {
  const [params, setParams] = useSearchParams()
  const actor = useAuthStore(), epoch = actor.authEpoch, layoutId = params.get('layoutId') || ''
  const scope = `${epoch}:${actor.user?.id}:${projectId}:${sectionId}:${params.get('routeVersionId') || ''}:${params.get('segmentSetId') || ''}:${layoutId}`, selection = useRef(scope); selection.current = `${scope}:${sectionId}:${params.get('routeVersionId') || ''}:${params.get('segmentSetId') || ''}`
  const [pins, setPins] = useState<PavementPins | null>(null), [prerequisite, setPrerequisite] = useState('Đang đọc prerequisite tấm/khe.')
  const [snapshot, setSnapshot] = useState<PavementLayoutView | null>(null), [savedProfile, setSavedProfile] = useState<PavementLayoutInput['widthProfile'] | null>(null)
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<ReturnType<typeof pendingPavement>>(null), [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(false), [error, setError] = useState('')
  const [display, setDisplay] = useState<ReturnType<typeof buildSavedPavement> | null>(null)
  const [savedWidthRevision, setSavedWidthRevision] = useState(widthRevision)
  const [savedRevision, setSavedRevision] = useState(editRevision)
  const revision = useRef(editRevision); revision.current = editRevision
  const running = useRef(false), hydrated = useRef(''), refs = useRef({ restore, notify }); refs.current = { restore, notify }
  useEffect(() => { running.current = false; setBusy(false) }, [scope])
  const [layouts, setLayouts] = useState<PavementLayoutSummary[]>([]), [listLoading, setListLoading] = useState(false), [listError, setListError] = useState(''), [listScope, setListScope] = useState('')
  const pinnedRoute = params.get('routeVersionId') || '', pinnedSet = params.get('segmentSetId') || ''
  const discoveryScope = `${epoch}:${actor.user?.id}:${projectId}:${sectionId}:${pinnedRoute}:${pinnedSet}`
  const discoveryRevision = useRef({ scope: discoveryScope, revision: editRevision })
  if (discoveryRevision.current.scope !== discoveryScope) discoveryRevision.current = { scope: discoveryScope, revision: editRevision }
  const openLayout = (id: string) => {
    const row = layouts.find(item => item.layoutId === id)
    if (!row || listScope !== discoveryScope || busy || pending || asBuilt.active || asBuilt.pending) return
    setParams(current => { const next = new URLSearchParams(current); next.set('layoutId', row.layoutId); next.set('roadSectionId', row.roadSectionId); next.set('routeVersionId', row.routeVersionId); next.set('segmentSetId', row.segmentSetId); return next })
  }
  useEffect(() => {
    let active = true
    setLayouts([]); setListError(''); setListScope(''); setListLoading(false)
    if (!pins || prerequisite || !pinnedRoute || !pinnedSet || pins.segmentSetId !== pinnedSet || pins.projectId !== projectId || pins.roadSectionId !== sectionId && !!sectionId || pinnedRoute && pins.routeVersionId !== pinnedRoute) return
    setListLoading(true)
    pavementService.list(pins).then(rows => {
      if (!active || useAuthStore.getState().authEpoch !== epoch) return
      setLayouts(rows); setListScope(discoveryScope)
      if (!layoutId && rows.length === 1 && !pendingPavement(projectId)) setParams(current => {
        if (revision.current !== discoveryRevision.current.revision || current.get('layoutId') || current.get('segmentSetId') !== pins.segmentSetId || current.get('routeVersionId') !== pins.routeVersionId) return current
        const next = new URLSearchParams(current), row = rows[0]
        next.set('layoutId', row.layoutId); next.set('roadSectionId', row.roadSectionId); next.set('routeVersionId', row.routeVersionId); next.set('segmentSetId', row.segmentSetId); return next
      }, {replace: true})
    }).catch(e => { if (active) setListError(`Không đọc được danh sách layout: HTTP ${e?.response?.status || ''} ${e?.response?.data?.code || e.message}`) }).finally(() => { if (active) setListLoading(false) })
    return () => { active = false }
  }, [pins, layoutId, prerequisite, discoveryScope, reload])
  useEffect(() => {
    let active = true
    setPins(null); setPrerequisite('Đang đọc prerequisite tấm/khe.')
    if (!projectId) { setPrerequisite('Chưa chọn dự án.'); return }
    if (!pinnedRoute || !pinnedSet) { setPrerequisite('Chọn phiên bản tuyến và segment set PUBLISHED trước khi lưu layout mới.'); return }
    // A DRAFT selection must never silently become a different publication for a new layout.
    pavementService.discover(projectId, sectionId, pinnedRoute, pinnedSet).then(value => { if (active) { setPins(value); setPrerequisite('') } })
      .catch(error => { if (active) setPrerequisite(error?.response ? `Không đọc được prerequisite tấm/khe: HTTP ${error.response.status}, ${error.response.data?.code || 'unknown'}.` : error.message) })
    return () => { active = false }
  }, [projectId, sectionId, pinnedRoute, pinnedSet, layoutId, epoch, reload])
  useEffect(() => {
    let active = true
    const initialRevision = revision.current
    const initialWidthRevision = widthRevision
    setLoading(!!layoutId); setError('')
    if (hydrated.current !== scope) { setSnapshot(null); setDisplay(null); setSavedProfile(null); setMessage('') }
    try {
      setPending(projectId ? pendingPavement(projectId) : null)
    } catch { setMessage('Không đọc được yêu cầu tấm/khe đang chờ; chưa gửi lệnh mới.') }
    if (layoutId && projectId) {
      pavementService.readConfiguration(projectId, layoutId).then(async ({ snapshot: value, configuration }) => {
        const route = await pavementService.layoutRoute(projectId, value, sectionId, pinnedRoute, pinnedSet)
        const rendered = buildSavedPavement(value, configuration?.layout || null, route.engineeringSrid, route.stationOriginMeters, route)
        if (!active || useAuthStore.getState().authEpoch !== epoch) return
        setSnapshot(value); setDisplay(rendered)
        if (hydrated.current !== scope) {
          hydrated.current = scope
          const layout = configuration?.layout || null
          if (revision.current === initialRevision) { refs.current.restore(layout); setSavedRevision(initialRevision) }
          else refs.current.notify('Đã đọc layout; bản chỉnh mới hơn được giữ, chưa nạp đè form.')
        }
        setSavedProfile(configuration?.layout?.widthProfile || null); setSavedWidthRevision(initialWidthRevision)
        setMessage(`Đã đọc layout ${value.id}: ${value.kind === 'AS_BUILT' ? '' : `${value.geometry.plan?.cells?.length ?? 'chưa có'} cell, `}${value.geometry.slabs.length} tấm từ geometry server. ${value.kind === 'AS_BUILT' ? configuration ? 'Form lấy từ sourcePlanId, geometry vẫn là AS_BUILT.' : 'layout=null, chưa có cấu hình PLANNED nguồn.' : configuration ? 'KC/KG chỉ là cấu hình, chưa phải hình học khe được server xác nhận.' : 'layout=null: máy chủ không có cấu hình gốc.'}`)
      }).catch(error => { if (active) { setError(`Không đọc được layout: ${error?.response?.status || ''} ${error?.response?.data?.code || error.message}`) } }).finally(() => { if (active) setLoading(false) })
    }
    return () => { active = false }
  }, [projectId, layoutId, epoch, sectionId, pinnedRoute, pinnedSet, reload])

  let disabledReason = actor.user?.role !== RoleCode.PROJECT_MANAGER ? 'Chỉ PM được lưu cấu hình tấm/khe.'
    : listLoading ? 'Đang tìm layout server.' : listError ? listError : !layoutId && listScope === discoveryScope && layouts.length > 0 ? 'Chọn layout đã lưu để xem; không tự ghi đè cấu hình hiện hữu.' : loading ? 'Đang đọc layout server.' : error ? error : !mainline ? 'Chưa hỗ trợ lưu cấu hình tuyến nhánh.' : prerequisite
  let input: ReturnType<typeof pavementInput> | null = null
  if (!disabledReason && pins) {
    try { input = pavementInput(editor, savedProfile && savedWidthRevision === widthRevision ? savedProfile : widthProfile, pins.lengthMeters, PAVEMENT_RENDER_TOLERANCE_METERS) }
    catch (error) { disabledReason = (error as Error).message }
  }
  const revised = !!(pending?.rejected && input && (!sameLayout(pending.input.layout, input.layout) || pending.input.displayToleranceMeters !== input.displayToleranceMeters))
  const actionLabel = revised ? 'Lưu cấu hình tấm/khe đã sửa' : pending ? pending.receipt ? 'Đọc lại cấu hình tấm/khe' : 'Gửi lại cấu hình tấm/khe' : 'Lưu cấu hình tấm/khe'
  const save = async () => {
    if (running.current) return
    const selected = selection.current, current = () => selection.current === selected && useAuthStore.getState().authEpoch === epoch
    if (actor.user?.role !== RoleCode.PROJECT_MANAGER || asBuilt.active || asBuilt.pending) return
    running.current = true; setBusy(true)
    try {
      let held = pendingPavement(projectId)
      if (held?.rejected && revised) { revisePavement(projectId); held = null; setPending(null) }
      if (!held && (disabledReason || !pins || !input)) throw new Error(disabledReason || 'Thiếu prerequisite tấm/khe.')
      // New writes re-read pins. Receipt recovery only GETs and never creates again.
      if (!held) {
        const fresh = await pavementService.discover(projectId, pins!.roadSectionId, pins!.routeVersionId, pins!.segmentSetId)
        if (!current()) return
        if (fresh.lengthMeters !== pins!.lengthMeters) throw new Error('Chiều dài tuyến server thay đổi; đọc lại prerequisite trước khi lưu.')
      }
      const result = await savePavement(projectId, held ? undefined : { pins: pins!, input: input! })
      if (!current()) return
      const route = await pavementService.layoutRoute(projectId, result, pins?.roadSectionId, result.routeVersionId, result.segmentSetId)
      if (!current()) return
      const rendered = buildSavedPavement(result, result.layout!, route.engineeringSrid, route.stationOriginMeters, route)
      completePavement(projectId, result)
      setDisplay(rendered); setSavedRevision(revision.current)
      setPending(null); setSnapshot(result); setSavedProfile(result.layout!.widthProfile); setSavedWidthRevision(widthRevision)
      const next = new URLSearchParams(params)
      next.set('layoutId', result.id); next.set('routeVersionId', result.routeVersionId); next.set('segmentSetId', result.segmentSetId)
      if (pins) next.set('roadSectionId', pins.roadSectionId)
      hydrated.current = `${epoch}:${actor.user?.id}:${projectId}:${pins?.roadSectionId || sectionId}:${result.routeVersionId}:${result.segmentSetId}:${result.id}`
      setParams(next)
      const text = `Đã lưu và đọc lại cấu hình tấm/khe ${result.id}: ${result.geometry.plan!.cells.length} cell/${result.geometry.slabs.length} tấm server. Chưa duyệt/publish; KC/KG chưa được server xác nhận hình học.`
      setMessage(text); refs.current.notify(text)
    } catch (error: any) {
      if (!current()) return
      try {
        const held = pendingPavement(projectId); setPending(held)
        if (held?.receipt?.id) { setDisplay(null); setSnapshot(null); const next = new URLSearchParams(params); next.set('layoutId', held.receipt.id); hydrated.current = ''; setParams(next) }
      } catch { /* Retain the editor and surface the command error. */ }
      const text = error?.response ? `Lưu tấm/khe lỗi HTTP ${error.response.status}: ${error.response.data?.code || 'unknown'}. Bản chỉnh và command được giữ.` : error.message
      setMessage(text); refs.current.notify(text)
    } finally { if (current()) { running.current = false; setBusy(false) } }
  }
  const asBuilt = useAsBuiltWorkflow(projectId, scope, hydrated.current === scope ? snapshot : null, pins, hydrated.current === scope ? display : null,
    busy || !!pending || loading || !!error || !!prerequisite || savedRevision !== editRevision, (value, rendered) => {
      setSnapshot(value); setDisplay(rendered); setSavedRevision(revision.current)
      const next = new URLSearchParams(params); next.set('layoutId', value.id); next.set('routeVersionId', value.routeVersionId); next.set('segmentSetId', value.segmentSetId)
      const road = rendered.route!.roadSectionId!; next.set('roadSectionId', road)
      hydrated.current = `${epoch}:${actor.user?.id}:${projectId}:${road}:${value.routeVersionId}:${value.segmentSetId}:${value.id}`
      setParams(next); setMessage('Đã đọc hình học AS_BUILT từ máy chủ; cấu hình thiết kế nguồn không thay thế footprint hoàn công.')
    }, notify)
  const openAsBuiltSource = () => {
    const held = asBuilt.pending
    if (!held || asBuilt.busy) return
    if (params.get('layoutId') === held.sourcePlanId && params.get('roadSectionId') === held.pins.roadSectionId && params.get('routeVersionId') === held.pins.routeVersionId && params.get('segmentSetId') === held.pins.segmentSetId) { setReload(value => value + 1); return }
    setParams(current => { const next = new URLSearchParams(current); next.set('layoutId', held.sourcePlanId); next.set('roadSectionId', held.pins.roadSectionId); next.set('routeVersionId', held.pins.routeVersionId); next.set('segmentSetId', held.pins.segmentSetId); return next })
  }
  const routeBase = useMemo(() => display?.route && snapshot?.kind === 'AS_BUILT' ? { ...display, segments: display.backgroundSegments, kmPoints: display.backgroundKmPoints } : display, [display, snapshot])
  return { asBuilt, openAsBuiltSource, layouts: listScope === discoveryScope ? layouts : [], openLayout, listLoading, listError, layoutDiscoveryMessage: !layoutId && pins && (!pinnedSet || pins.segmentSetId !== pinnedSet) ? 'Giữ bản phân đoạn đang chọn. Để xem layout đã lưu, hãy chủ động chọn segment set PUBLISHED.' : listLoading ? 'Đang tìm layout…' : listError || (!layoutId && listScope === discoveryScope ? layouts.length > 1 ? 'Có nhiều layout; chọn theo loại và thời gian lưu.' : layouts.length === 1 ? 'Có layout đã lưu; chọn để đọc cấu hình.' : 'Chưa có layout' : ''), save, busy: busy || asBuilt.busy, loading, error, previewBase: hydrated.current === scope ? routeBase : null, display: asBuilt.preview || (hydrated.current === scope && (savedRevision === editRevision || !display?.previewReady) ? display : null), savedProfile, pending, snapshot, layoutId, message: [asBuilt.preview ? `Bản nhập hoàn công: ${asBuilt.slabs.length} tấm thực tế chưa lưu; PLANNED nguồn giữ riêng.` : message, loading ? 'Đang đọc layout server…' : error, display && savedRevision !== editRevision ? display.previewReady ? 'Preview PM mới chưa lưu; snapshot server được giữ riêng.' : display.previewBlocker : ''].filter(Boolean).join(' '), disabledReason, actionLabel, scopeMessage: pins ? `Lưu trên route ${pins.routeVersionId}, segment set ${pins.segmentSetId} đã PUBLISHED từ server; hình học khe preview chưa được xác nhận.` : '', retry: () => setReload(value => value + 1) }
}
