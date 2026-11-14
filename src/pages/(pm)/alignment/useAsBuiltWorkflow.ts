import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { pavementService, type AsBuiltSlabInput, type PavementLayoutView, type PavementPins } from '../../../api/services/pavementService'
import { completeAsBuilt, pendingAsBuilt, reviseAsBuilt, saveAsBuilt, validateAsBuilt, validateAsBuiltSlabs } from '../../../api/services/pavementCommands'
import { buildSavedPavement } from './savedPavementDisplay'
import { closeFootprint, confirmDesignSelection, designKeysInSegment, engineeringPoint, moveFootprintVertex, type FootprintPoint } from './asBuiltMapGeometry'

export const emptyAsBuiltForm = () => ({ key: '', plannedSequence: '', footprint: '', lengthMeters: '', widthMeters: '', dimensionUnknownReason: '', source: '', sourceFileId: '' })
export type AsBuiltForm = ReturnType<typeof emptyAsBuiltForm>
function numeric(text: string, field: string): number {
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text.trim()) || !Number.isFinite(Number(text))) throw new Error(`${field}: cần số hữu hạn.`)
  return Number(text)
}
function footprintFromText(text: string): FootprintPoint[] {
  return text.trim().split(/\r?\n/).map((line, i) => {
    const pair = line.trim().split(/[\s,;]+/)
    if (pair.length !== 2) throw new Error(`Footprint dòng ${i + 1}: nhập đúng X Y.`)
    return { x: numeric(pair[0], `X dòng ${i + 1}`), y: numeric(pair[1], `Y dòng ${i + 1}`) }
  })
}
export function asBuiltSlabFromForm(form: AsBuiltForm): AsBuiltSlabInput {
  const slab: AsBuiltSlabInput = { key: form.key, source: form.source, footprint: footprintFromText(form.footprint) }
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
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]), [focusedPlanKey, setFocusedPlanKey] = useState(''), [captureSource, setCaptureSource] = useState('')
  const [vertexEditing, setVertexEditing] = useState(false), [drawing, setDrawing] = useState(false), [drawPoints, setDrawPoints] = useState<FootprintPoint[]>([])
  const [mapEditSession,setMapEditSession]=useState(0)
  const [activeVertex,setActiveVertex]=useState(0)
  const mapCrs = sourceDisplay?.engineeringSrid, mapSupported = mapCrs === 32648
  const candidatePoints = useMemo(() => { if (drawing) return drawPoints; if (!form.footprint.trim()) return []; try { return footprintFromText(form.footprint) } catch { return [] } }, [drawing,drawPoints,form.footprint])
  const plannedSlabs = source?.kind === 'PLANNED' ? source.geometry.slabs : []
  const running = useRef(false)
  useEffect(() => {
    setSelectedKeys([]); setFocusedPlanKey(''); setCaptureSource(''); setVertexEditing(false); setDrawing(false); setDrawPoints([])
    running.current = false; setBusy(false); setActive(false); setShowActual(false); setSlabs([]); setForm(emptyAsBuiltForm()); setEditing(null); setDirty(false); setReason(''); setError(''); setPending(null)
    if (projectId && actor.isAuthenticated) try {
      const held = pendingAsBuilt(projectId); setPending(held)
      if (held) { setActive(true); setSlabs(held.input.slabs); setReason(held.input.reason) }
    } catch (e) { setError((e as Error).message) }
  }, [scope])
  const canStart = actor.user?.role === RoleCode.PROJECT_MANAGER && !blocked && !pending && source?.kind === 'PLANNED' && !!sourceDisplay && !!pins && source.projectId === projectId && source.routeVersionId === pins.routeVersionId && source.segmentSetId === pins.segmentSetId
  const canEdit = active && actor.user?.role === RoleCode.PROJECT_MANAGER && !busy && !pending
  const start = () => { if (canStart) { setActive(true); setShowActual(false); setSlabs([]); setForm(emptyAsBuiltForm()); setReason(''); setError('') } }
  const select = (index: number) => { if (!canEdit || !slabs[index]) return; setForm(editForm(slabs[index])); setEditing(index); setDirty(false); setError(''); setVertexEditing(false); setDrawing(false); setShowActual(true) }
  const toggleDesign = (key: string) => { if (!canEdit || !plannedSlabs.some(s => s.key === key)) return; setFocusedPlanKey(key); setSelectedKeys(keys => keys.includes(key) ? keys.filter(k => k !== key) : [...keys,key]);setError('') }
  const selectFeature = (feature: any) => {
    if (!canEdit || source?.kind !== 'PLANNED' || drawing || vertexEditing) return
    const p = feature?.properties
    if (p?.source === 'AS_BUILT_DRAFT') { const i = slabs.findIndex(s => s.key === p.code); if (i >= 0) select(i) }
    else if (p?.layoutId === source.id && p?.layoutKind === 'PLANNED') toggleDesign(String(p.code))
  }
  const setField = (field: keyof AsBuiltForm, value: string) => { if (canEdit) { setForm(f => ({ ...f, [field]: value })); setDirty(true) } }
  const apply = () => {
    if (!source || !canEdit) return
    if (drawing) {setError('Kết thúc đường bao trên bản đồ trước khi Áp dụng.');return}
    if (candidatePoints.length<4) {setError('Chọn hoặc vẽ đường bao trên bản đồ trước khi Áp dụng tấm.');return}
    try {
      const slab = asBuiltSlabFromForm(form), next = [...slabs]
      if (editing == null) next.push(slab); else next[editing] = slab
      validateAsBuiltSlabs(next, source); setSlabs(next); setEditing(null); setForm(emptyAsBuiltForm()); setDirty(false); setShowActual(true); setError(''); setVertexEditing(false); setDrawing(false)
    } catch (e) { const text = (e as Error).message; setError(text.startsWith('Tấm ') ? text : `Tấm ${form.key || 'chưa có mã'}: ${text}`) }
  }
  const chooseAll = () => {
    if (!canEdit) return
    if (plannedSlabs.length > 10000 || plannedSlabs.reduce((n,s) => n+s.footprint.length,0) > 1000000) { setError('Thiết kế nguồn vượt giới hạn 10000 tấm/1000000 đỉnh; hãy chọn nhóm nhỏ hơn, không cắt ngầm.'); return }
    setSelectedKeys(plannedSlabs.map(s => s.key)); setError('')
  }
  const chooseSegment = (id: string) => {
    if (!canEdit || !source) return
    try {
      const range=sourceDisplay?.segmentRanges?.find(s => s.id===id)
      if (!range) throw new Error('Thiếu phạm vi phân đoạn server đúng snapshot; không suy từ WGS84.')
      const result=designKeysInSegment(source,range);setSelectedKeys(result.keys);setError(`Chọn ${result.keys.length} tấm nằm trọn trong phân đoạn. ${result.crossing} tấm qua ranh chưa chọn; có thể chọn riêng.`)
    } catch(e) { setError((e as Error).message) }
  }
  const confirmSelected = () => {
    if (!canEdit || !source) return
    if (dirty) { setError('Áp dụng hoặc hủy tấm ngoại lệ đang chỉnh trước khi xác nhận nhóm.'); return }
    try { const result=confirmDesignSelection(source,selectedKeys,slabs,captureSource);setSlabs(result.slabs);setSelectedKeys([]);setShowActual(true);setForm(emptyAsBuiltForm());setEditing(null);setVertexEditing(false);setDrawing(false);setError(`Đã đưa ${result.added} tấm vào bản nhập chưa lưu; giữ nguyên ${result.skipped} tấm đã có mã/tham chiếu trong bản nhập.`) } catch(e) { setError((e as Error).message) }
  }
  const editDesign = () => {
    const s=plannedSlabs.find(p => p.key===focusedPlanKey)
    if (!canEdit || !s) return
    const linked=slabs.map((a,i)=>({a,i})).filter(({a})=>a.key===s.key||s.plannedSequence!=null&&a.plannedSequence===s.plannedSequence)
    if(linked.length>1){setError('Có nhiều tấm thực tế tham chiếu thiết kế này; chọn đúng tấm trong danh sách bản nhập để chỉnh.');return}
    if(linked.length===1){select(linked[0].i);return}
    setForm({...emptyAsBuiltForm(),key:s.key,plannedSequence:s.plannedSequence==null?'':String(s.plannedSequence),footprint:s.footprint.map(p=>`${p.x} ${p.y}`).join('\n')});setEditing(null);setDirty(true);setDrawing(false);setVertexEditing(false);setError('Đường bao nền thiết kế chưa được ghi nhận; nhập số đo/nguồn thực tế rồi chỉnh và Áp dụng.')
  }
  const beginVertices = () => {
    if (!canEdit) return
    if (!mapSupported) {setError(`Chưa hỗ trợ chỉnh đường bao EPSG:${mapCrs ?? 'chưa đọc'}; không tự đoán CRS.`);return}
    if (candidatePoints.length<4) {setError('Chọn tấm thực tế hoặc mở tấm ngoại lệ để chỉnh đỉnh.');return}
    setDrawing(false);setVertexEditing(true);setActiveVertex(0);setMapEditSession(n=>n+1);setError('Kéo các đỉnh trên bản đồ; xem lại rồi Áp dụng vào bản nhập. Có thể chọn đỉnh theo số nếu các điểm gần nhau.')
  }
  const beginDraw = () => {
    if (!canEdit) return
    if (!mapSupported) {setError(`Chưa hỗ trợ vẽ EPSG:${mapCrs ?? 'chưa đọc'}; không gửi longitude/latitude làm X/Y.`);return}
    setForm(emptyAsBuiltForm());setEditing(null);setDrawPoints([]);setDrawing(true);setVertexEditing(false);setMapEditSession(n=>n+1);setDirty(true);setShowActual(true);setError('Bấm ít nhất 3 đỉnh trên bản đồ rồi Kết thúc đường bao. Chưa thêm tấm hoặc lưu máy chủ.')
  }
  const addMapPoint = (lng:number,lat:number) => {
    if (!canEdit || !drawing) return
    try {if(drawPoints.length>=8194)throw new Error('Đạt giới hạn 8194 đỉnh trước khép vòng.');const p=engineeringPoint(lng,lat,mapCrs!);setDrawPoints(points=>[...points,p])}catch(e){setError((e as Error).message)}
  }
  const finishDraw = () => { if (!canEdit || !drawing) return;try {const ring=closeFootprint(drawPoints);setForm(f=>({...f,footprint:ring.map(p=>`${p.x} ${p.y}`).join('\n')}));setDrawing(false);setVertexEditing(true);setActiveVertex(0);setMapEditSession(n=>n+1);setError('Đã khép đường bao bản nhập; nhập mã/nguồn/số đo hoặc lý do chưa biết, rồi Áp dụng.')}catch(e){setError((e as Error).message)} }
  const moveVertex = (index:number,lng:number,lat:number) => {
    if (!canEdit || !vertexEditing) return
    try {const ring=moveFootprintVertex(candidatePoints,index,lng,lat,mapCrs!);setForm(f=>({...f,footprint:ring.map(p=>`${p.x} ${p.y}`).join('\n')}));setDirty(true)}catch(e){setError((e as Error).message)}
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
    selectedKeys,focusedPlanKey,plannedSlabs,captureSource,setCaptureSource:(value:string)=>{if(canEdit)setCaptureSource(value)},toggleDesign,chooseAll,chooseSegment,confirmSelected,editDesign,
    focusDesign:(key:string)=>{if(canEdit&&plannedSlabs.some(s=>s.key===key))setFocusedPlanKey(key)},clearSelection:()=>{if(canEdit){setSelectedKeys([]);setError('')}},
    ranges:sourceDisplay?.segmentRanges || null, candidatePoints,vertexEditing,drawing,mapEditSession,activeVertex,selectVertex:(index:number)=>{if(canEdit&&Number.isInteger(index)&&index>=0&&index<candidatePoints.length-1)setActiveVertex(index)},mapCrs,mapSupported,canEdit,scope,beginVertices,beginDraw,addMapPoint,finishDraw,moveVertex,mapError:(text:string)=>setError(text),
    stopMapEdit:()=>{setVertexEditing(false);setDrawing(false)},
    cancel: () => { if (!pending && !busy) { setActive(false); setSlabs([]); setForm(emptyAsBuiltForm()); setDirty(false);setVertexEditing(false);setDrawing(false);setSelectedKeys([]);setError('') } },
    remove: (index: number) => { if (canEdit) { setSlabs(s => s.filter((_, i) => i !== index)); setForm(emptyAsBuiltForm()); setEditing(null); setDirty(false);setVertexEditing(false);setDrawing(false);setError('') } },
    newSlab: () => { if (canEdit) { setForm(emptyAsBuiltForm()); setEditing(null); setDirty(false);setVertexEditing(false);setDrawing(false);setError('') } }
  }
}
