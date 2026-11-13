import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { pavementService, type AsBuiltSlabInput, type PavementLayoutView, type PavementPins } from '../../../api/services/pavementService'
import { completeAsBuilt, pendingAsBuilt, reviseAsBuilt, saveAsBuilt, validateAsBuilt, validateAsBuiltSlabs } from '../../../api/services/pavementCommands'
import { buildSavedPavement } from './savedPavementDisplay'

export const emptyAsBuiltForm = () => ({ key: '', plannedSequence: '', footprint: '', lengthMeters: '', widthMeters: '', dimensionUnknownReason: '', source: '', sourceFileId: '' })
export type AsBuiltForm = ReturnType<typeof emptyAsBuiltForm>
export function asBuiltSlabFromForm(form: AsBuiltForm): AsBuiltSlabInput {
  const numeric = (text: string, field: string) => {
    if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text.trim()) || !Number.isFinite(Number(text))) throw new Error(`${field}: cần số hữu hạn.`)
    return Number(text)
  }
  const slab: AsBuiltSlabInput = { key: form.key, source: form.source, footprint: form.footprint.trim().split(/\r?\n/).map((line, i) => {
    const pair = line.trim().split(/[\s,;]+/)
    if (pair.length !== 2) throw new Error(`Footprint dòng ${i + 1}: nhập đúng X Y.`)
    return { x: numeric(pair[0], `X dòng ${i + 1}`), y: numeric(pair[1], `Y dòng ${i + 1}`) }
  }) }
  if (form.plannedSequence.trim()) slab.plannedSequence = numeric(form.plannedSequence, 'Sequence thiết kế')
  if (form.lengthMeters.trim()) slab.lengthMeters = numeric(form.lengthMeters, 'Chiều dài')
  if (form.widthMeters.trim()) slab.widthMeters = numeric(form.widthMeters, 'Chiều rộng')
  if (form.dimensionUnknownReason.trim()) slab.dimensionUnknownReason = form.dimensionUnknownReason
  if (form.sourceFileId.trim()) slab.sourceFileId = form.sourceFileId.trim().toLowerCase()
  return slab
}
function editForm(slab: AsBuiltSlabInput): AsBuiltForm {
  return { key: slab.key, source: slab.source, footprint: slab.footprint.map(p => `${p.x} ${p.y}`).join('\n'), plannedSequence: slab.plannedSequence == null ? '' : String(slab.plannedSequence), lengthMeters: slab.lengthMeters == null ? '' : String(slab.lengthMeters), widthMeters: slab.widthMeters == null ? '' : String(slab.widthMeters), dimensionUnknownReason: slab.dimensionUnknownReason || '', sourceFileId: slab.sourceFileId || '' }
}
export function useAsBuiltWorkflow(projectId: string, scope: string, source: PavementLayoutView | null, pins: PavementPins | null,
  sourceDisplay: ReturnType<typeof buildSavedPavement> | null, blocked: boolean,
  onSaved: (value: PavementLayoutView, display: ReturnType<typeof buildSavedPavement>) => void, notify: (text: string) => void) {
  const actor = useAuthStore(), currentScope = useRef(scope); currentScope.current = scope
  const [active, setActive] = useState(false), [showActual, setShowActual] = useState(false), [slabs, setSlabs] = useState<AsBuiltSlabInput[]>([])
  const [form, setForm] = useState(emptyAsBuiltForm()), [editing, setEditing] = useState<number | null>(null), [dirty, setDirty] = useState(false), [reason, setReason] = useState('')
  const [pending, setPending] = useState<ReturnType<typeof pendingAsBuilt>>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const running = useRef(false)
  useEffect(() => {
    running.current = false; setBusy(false); setActive(false); setShowActual(false); setSlabs([]); setForm(emptyAsBuiltForm()); setEditing(null); setDirty(false); setReason(''); setError(''); setPending(null)
    if (projectId && actor.isAuthenticated) try {
      const held = pendingAsBuilt(projectId); setPending(held)
      if (held) { setActive(true); setSlabs(held.input.slabs); setReason(held.input.reason) }
    } catch (e) { setError((e as Error).message) }
  }, [scope])
  const canStart = actor.user?.role === RoleCode.PROJECT_MANAGER && !blocked && !pending && source?.kind === 'PLANNED' && !!sourceDisplay && !!pins && source.projectId === projectId && source.routeVersionId === pins.routeVersionId && source.segmentSetId === pins.segmentSetId
  const canEdit = active && actor.user?.role === RoleCode.PROJECT_MANAGER && !busy && !pending
  const start = () => { if (canStart) { setActive(true); setShowActual(false); setSlabs([]); setForm(emptyAsBuiltForm()); setReason(''); setError('') } }
  const select = (index: number) => { if (!canEdit || !slabs[index]) return; setForm(editForm(slabs[index])); setEditing(index); setDirty(false); setError('') }
  const selectFeature = (feature: any) => {
    if (!canEdit || source?.kind !== 'PLANNED') return
    const p = feature?.properties
    if (p?.source === 'AS_BUILT_DRAFT') { const i = slabs.findIndex(s => s.key === p.code); if (i >= 0) select(i) }
    else if (p?.layoutId === source.id && p?.layoutKind === 'PLANNED' && p.plannedSequence != null) { setForm(f => ({ ...f, plannedSequence: String(p.plannedSequence) })); setDirty(true) }
  }
  const setField = (field: keyof AsBuiltForm, value: string) => { if (canEdit) { setForm(f => ({ ...f, [field]: value })); setDirty(true) } }
  const apply = () => {
    if (!source || !canEdit) return
    try {
      const slab = asBuiltSlabFromForm(form), next = [...slabs]
      if (editing == null) next.push(slab); else next[editing] = slab
      validateAsBuiltSlabs(next, source); setSlabs(next); setEditing(null); setForm(emptyAsBuiltForm()); setDirty(false); setShowActual(true); setError('')
    } catch (e) { const text = (e as Error).message; setError(text.startsWith('Tấm ') ? text : `Tấm ${form.key || 'chưa có mã'}: ${text}`) }
  }
  let disabledReason = blocked ? 'Có lệnh hoặc dữ liệu pavement chưa đối chiếu.' : !canStart && !pending ? 'Cần PLANNED nguồn đã GET, đúng route và set PUBLISHED đang chọn.' : dirty ? 'Áp dụng tấm đang nhập trước khi lưu hoàn công.' : ''
  if (!disabledReason && source && !pending) try { validateAsBuilt({ sourcePlanId: source.id, slabs, reason }, source) } catch (e) { disabledReason = (e as Error).message }
  const preview = useMemo(() => {
    if (!active || !showActual || source?.kind !== 'PLANNED' || !sourceDisplay?.route) return null
    const preview = buildSavedPavement({ ...source, id: 'local-as-built', kind: 'AS_BUILT', sourcePlanId: source.id, layout: null, geometry: { displayToleranceMeters: source.geometry.displayToleranceMeters, plan: null, slabs } }, null, sourceDisplay.engineeringSrid, sourceDisplay.stationOriginMeters, sourceDisplay.route)
    preview.label = 'Tấm thực tế — bản nhập hoàn công chưa lưu'
    for (const group of [preview.preview.slabsGeoJSON, preview.preview.slabLabelsGeoJSON]) for (const f of group.features) { f.properties!.source = 'AS_BUILT_DRAFT'; f.properties!.layoutId = null }
    return preview
  }, [active, showActual, source, sourceDisplay, slabs, scope])
  const save = async () => {
    if (running.current || actor.user?.role !== RoleCode.PROJECT_MANAGER || !active && !pending || pending?.rejected) return
    const selected = scope, epoch = actor.authEpoch, current = () => currentScope.current === selected && useAuthStore.getState().authEpoch === epoch
    running.current = true; setBusy(true)
    try {
      const held = pendingAsBuilt(projectId)
      if (!held && (disabledReason || !source || !pins)) throw new Error(disabledReason || 'Thiếu PLANNED nguồn.')
      const value = await saveAsBuilt(projectId, held ? undefined : { pins: pins!, source: source!, input: { sourcePlanId: source!.id, slabs, reason } })
      if (!current()) return
      const route = await pavementService.layoutRoute(projectId, value, (held?.pins || pins)!.roadSectionId, value.routeVersionId, value.segmentSetId)
      if (!current()) return
      const rendered = buildSavedPavement(value, null, route.engineeringSrid, route.stationOriginMeters, route)
      completeAsBuilt(projectId, value); setPending(null); setActive(false); onSaved(value, rendered); notify('Đã lưu và đọc lại bản hoàn công')
    } catch (e: any) {
      if (!current()) return
      try { setPending(pendingAsBuilt(projectId)) } catch { /* The error remains visible. */ }
      setError(e?.response ? `HTTP ${e.response.status}: ${e.response.data?.code || 'unknown'}${e.response.data?.correlationId ? ` — ${e.response.data.correlationId}` : ''}. Giữ bản nhập và lệnh để đối chiếu.` : e.message)
    } finally { if (current()) { running.current = false; setBusy(false) } }
  }
  const review = async () => {
    if (!pending?.rejected || busy || !source) return
    try {
      const fresh = await pavementService.read(projectId, pending.sourcePlanId)
      if (currentScope.current !== scope) return
      if (fresh.id !== source.id || fresh.contentHash !== source.contentHash) throw new Error('Nguồn đã thay đổi; mở lại đúng PLANNED và đối chiếu trước khi sửa lệnh.')
      reviseAsBuilt(projectId); setPending(null); setError('Đã đọc lại nguồn; kiểm bản nhập rồi tự lưu một lệnh mới.')
    } catch (e) { setError((e as Error).message) }
  }
  return { active, showActual, setShowActual, slabs, form, dirty, reason, setReason: (value: string) => { if (canEdit) setReason(value) }, pending, error, busy, canStart, start, select, selectFeature, setField, apply, preview, disabledReason, save, review,
    cancel: () => { if (!pending && !busy) { setActive(false); setSlabs([]); setForm(emptyAsBuiltForm()); setDirty(false) } },
    remove: (index: number) => { if (canEdit) { setSlabs(s => s.filter((_, i) => i !== index)); setForm(emptyAsBuiltForm()); setEditing(null); setDirty(false) } },
    newSlab: () => { if (canEdit) { setForm(emptyAsBuiltForm()); setEditing(null); setDirty(false) } }
  }
}
