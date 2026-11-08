import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { pavementService, type PavementLayoutInput, type PavementLayoutView, type PavementPins } from '../../../api/services/pavementService'
import { pavementInput, pendingPavement, sameLayout, revisePavement, savePavement, type PavementEditor } from '../../../api/services/pavementCommands'

export function usePavementWorkflow(projectId: string, sectionId: string, editor: PavementEditor,
  widthProfile: PavementLayoutInput['widthProfile'], widthsDirty: boolean, mainline: boolean,
  restore: (layout: PavementLayoutInput | null) => void, notify: (message: string) => void) {
  const [params, setParams] = useSearchParams()
  const actor = useAuthStore(), epoch = actor.authEpoch, layoutId = params.get('layoutId') || ''
  const scope = `${epoch}:${projectId}:${layoutId}`, selection = useRef(scope); selection.current = `${scope}:${sectionId}:${params.get('routeVersionId') || ''}:${params.get('segmentSetId') || ''}`
  const [pins, setPins] = useState<PavementPins | null>(null), [prerequisite, setPrerequisite] = useState('Đang đọc prerequisite tấm/khe.')
  const [snapshot, setSnapshot] = useState<PavementLayoutView | null>(null), [savedProfile, setSavedProfile] = useState<PavementLayoutInput['widthProfile'] | null>(null)
  const [tolerance, setTolerance] = useState<number | string>(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<ReturnType<typeof pendingPavement>>(null), [reload, setReload] = useState(0)
  const running = useRef(false), hydrated = useRef(''), refs = useRef({ restore, notify }); refs.current = { restore, notify }
  const editorSignature = JSON.stringify(editor), latestEditor = useRef(editorSignature); latestEditor.current = editorSignature
  const pinnedRoute = params.get('routeVersionId') || '', pinnedSet = params.get('segmentSetId') || ''
  useEffect(() => {
    let active = true
    setPins(null); setPrerequisite('Đang đọc prerequisite tấm/khe.')
    if (!projectId) { setPrerequisite('Chưa chọn dự án.'); return }
    pavementService.discover(projectId, sectionId, pinnedRoute, pinnedSet).then(value => { if (active) { setPins(value); setPrerequisite('') } })
      .catch(error => { if (active) setPrerequisite(error?.response ? `Không đọc được prerequisite tấm/khe: HTTP ${error.response.status}, ${error.response.data?.code || 'unknown'}.` : error.message) })
    return () => { active = false }
  }, [projectId, sectionId, pinnedRoute, pinnedSet, epoch, reload])
  useEffect(() => {
    let active = true
    const initialEditor = latestEditor.current
    setSnapshot(null); setSavedProfile(null); setTolerance(''); setMessage(''); setBusy(false); running.current = false
    try {
      setPending(projectId ? pendingPavement(projectId) : null)
      // Operator-approved rendering tolerance for a first save, scoped to this project/session.
      // Existing layouts always restore their server value instead.
      if (!layoutId && projectId) {
        const approved = sessionStorage.getItem(`rg_pavement_tolerance_${projectId}`)
        if (approved) { const value = JSON.parse(approved); if (value.source === 'operator' && Number.isFinite(value.value) && value.value > 0) setTolerance(value.value) }
      }
    } catch { setMessage('Không đọc được yêu cầu/tolerance tấm/khe đang chờ; chưa gửi lệnh mới.') }
    if (layoutId && projectId) {
      pavementService.readConfiguration(projectId, layoutId).then(({ snapshot: value, configuration }) => {
        if (!active) return
        setSnapshot(value)
        if (hydrated.current !== scope) {
          hydrated.current = scope
          const layout = configuration?.layout || null
          if (latestEditor.current === initialEditor) refs.current.restore(layout)
          else refs.current.notify('Đã đọc layout; bản chỉnh mới hơn được giữ, chưa nạp đè form.')
        }
        setSavedProfile(configuration?.layout?.widthProfile || null)
        setTolerance(configuration?.geometry.displayToleranceMeters ?? '')
        setMessage(`Đã đọc layout ${value.id}: ${value.geometry.plan?.cells?.length ?? 0} cell, ${value.geometry.slabs.length} tấm từ geometry server. ${value.kind === 'AS_BUILT' ? configuration ? 'Form lấy từ sourcePlanId, geometry vẫn là AS_BUILT.' : 'layout=null, chưa có cấu hình PLANNED nguồn.' : configuration ? 'KC/KG chỉ là cấu hình, chưa phải hình học khe được server xác nhận.' : 'layout=null: máy chủ không có cấu hình gốc.'}`)
      }).catch(error => { if (active) { setMessage(`Không đọc được layout: ${error?.response?.status || ''} ${error?.response?.data?.code || error.message}`) } })
    }
    return () => { active = false }
  }, [projectId, layoutId, epoch])

  let disabledReason = actor.user?.role !== RoleCode.PROJECT_MANAGER ? 'Chỉ PM được lưu cấu hình tấm/khe.'
    : !mainline ? 'Chưa hỗ trợ lưu cấu hình tuyến nhánh.' : prerequisite
  let input: ReturnType<typeof pavementInput> | null = null
  if (!disabledReason && pins) {
    try { input = pavementInput(editor, savedProfile && !widthsDirty ? savedProfile : widthProfile, pins.lengthMeters, tolerance) }
    catch (error) { disabledReason = (error as Error).message }
  }
  const revised = !!(pending?.rejected && input && (!sameLayout(pending.input.layout, input.layout) || pending.input.displayToleranceMeters !== input.displayToleranceMeters))
  const actionLabel = revised ? 'Lưu cấu hình tấm/khe đã sửa' : pending ? pending.receipt ? 'Đọc lại cấu hình tấm/khe' : 'Gửi lại cấu hình tấm/khe' : 'Lưu cấu hình tấm/khe'
  const save = async () => {
    if (running.current) return
    const selected = selection.current, current = () => selection.current === selected && useAuthStore.getState().authEpoch === epoch
    if (actor.user?.role !== RoleCode.PROJECT_MANAGER) return
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
      sessionStorage.removeItem(`rg_pavement_tolerance_${projectId}`)
      setPending(null); setSnapshot(result); setSavedProfile(result.layout!.widthProfile); setTolerance(result.geometry.displayToleranceMeters)
      const next = new URLSearchParams(params)
      next.set('layoutId', result.id); next.set('routeVersionId', result.routeVersionId); next.set('segmentSetId', result.segmentSetId)
      if (pins) next.set('roadSectionId', pins.roadSectionId)
      hydrated.current = `${epoch}:${projectId}:${result.id}`
      setParams(next)
      const text = `Đã lưu và đọc lại cấu hình tấm/khe ${result.id}: ${result.geometry.plan!.cells.length} cell/${result.geometry.slabs.length} tấm server. Chưa duyệt/publish; KC/KG chưa được server xác nhận hình học.`
      setMessage(text); refs.current.notify(text)
    } catch (error: any) {
      if (!current()) return
      try {
        const held = pendingPavement(projectId); setPending(held)
        if (held?.receipt?.id) { const next = new URLSearchParams(params); next.set('layoutId', held.receipt.id); hydrated.current = `${epoch}:${projectId}:${held.receipt.id}`; setParams(next) }
      } catch { /* Retain the editor and surface the command error. */ }
      const text = error?.response ? `Lưu tấm/khe lỗi HTTP ${error.response.status}: ${error.response.data?.code || 'unknown'}. Bản chỉnh và command được giữ.` : error.message
      setMessage(text); refs.current.notify(text)
    } finally { if (current()) { running.current = false; setBusy(false) } }
  }
  return { save, busy, pending, snapshot, layoutId, message, disabledReason, actionLabel, scopeMessage: pins ? `Lưu trên route ${pins.routeVersionId}, segment set ${pins.segmentSetId} đã PUBLISHED từ server; hình học khe preview chưa được xác nhận.` : '', retry: () => setReload(value => value + 1) }
}
