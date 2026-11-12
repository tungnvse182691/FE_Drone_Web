import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { alignmentService, type RoadGeometryVersionView } from '../../../api/services/alignmentService'
import { publishedSetForRoute, segmentSetService, type SegmentDefinition, type SegmentPreview, type SegmentPins, type SegmentSummary } from '../../../api/services/segmentSetService'
import { pendingSegment, reviseSegment, runSegment, type SegmentIntent } from '../../../api/services/segmentSetCommands'
import { previewCenterlineCoordinates } from './alignmentImportHelpers'
import type { SegmentItem } from './types'

export function segmentDefinition(distanceKm: number, boundaries?: number[]): SegmentDefinition {
  const targetLengthMeters = distanceKm * 1000
  if (!Number.isFinite(targetLengthMeters) || targetLengthMeters <= 0) throw new Error('Cần PM chọn cự ly chia đoạn hữu hạn lớn hơn 0.')
  if (boundaries && (boundaries.length < 2 || boundaries[0] !== 0 || boundaries.some((x, i) => !Number.isFinite(x) || i > 0 && x <= boundaries[i - 1]))) throw new Error('Mốc offset phải tăng liên tục từ 0.')
  return { targetLengthMeters, remainderMode: 'KEEP', ...(boundaries ? { boundariesMeters: boundaries } : {}) }
}
export function segmentRows(value: { segments: SegmentPreview['segments'] }, label: string, geometry?: RoadGeometryVersionView | null): SegmentItem[] {
  return value.segments.map(s => ({ id: s.id || `preview-${s.sequence}`, code: s.id ? `${s.sequence} · ${s.id}` : `Preview ${s.sequence}`,
    startKm: s.startStationMeters / 1000, endKm: s.endStationMeters / 1000, lengthKm: s.lengthMeters / 1000,
    serverCoordinates: s.wgs84Geometry?.coordinates || (geometry?.engineeringSrid === 32648 ? previewCenterlineCoordinates(s.metricGeometry.coordinates, geometry.engineeringSrid) : []),
    roadWidthM: geometry?.widthProfile?.filter(w => w.fromOffsetMeters < s.toOffsetMeters && w.toOffsetMeters > s.fromOffsetMeters).every((w, _, all) => w.widthMeters === all[0]?.widthMeters) ? geometry.widthProfile.find(w => w.fromOffsetMeters <= s.fromOffsetMeters && w.toOffsetMeters > s.fromOffsetMeters)?.widthMeters ?? Number.NaN : Number.NaN, laneCount: Number.NaN, surfaceMaterial: '', status: 'VALID', statusText: label, color: '#C9A227' }))
}
export function useSegmentSetWorkflow(projectId: string, roadSectionId: string, routeVersionId: string,
  geometry: RoadGeometryVersionView | null, mainline: boolean, distanceKm: number, restoreDistance: (n: number) => void, notify: (text: string) => void) {
  const [params, setParams] = useSearchParams(), auth = useAuthStore(), epoch = auth.authEpoch, actorId = auth.user?.id
  const distanceRef = useRef(distanceKm); distanceRef.current = distanceKm
  const setId = params.get('segmentSetId') || '', pins: SegmentPins = { projectId, roadSectionId, routeVersionId }
  const routeKey = `${epoch}:${auth.user?.id}:${projectId}:${roadSectionId}:${routeVersionId}`, key = `${routeKey}:${setId}`
  const selection = useRef(key); selection.current = key
  const refs = useRef({ restoreDistance, notify }); refs.current = { restoreDistance, notify }
  const [loadedKey, setLoadedKey] = useState(''), [loading, setLoading] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('')
  const [sets, setSets] = useState<SegmentSummary[]>([]), [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof segmentSetService.read>> | null>(null)
  const [preview, setPreview] = useState<{ value: SegmentPreview; input: SegmentDefinition } | null>(null)
  const [journalScope, setJournalScope] = useState('')
  const [held, setHeld] = useState<ReturnType<typeof pendingSegment>>(null), [busy, setBusy] = useState(false), [reload, setReload] = useState(0)
  const [reasonOpen, setReasonOpen] = useState(false), [reason, setReason] = useState(''), [reviewed, setReviewed] = useState(false)
  const attempt = useRef(0), running = useRef(false)
  const newSetRoute = useRef('')
  const validRoute = !!projectId && !!roadSectionId && !!routeVersionId
  useEffect(() => { newSetRoute.current = '' }, [routeKey])
  const routeMatches = geometry?.projectId === projectId && geometry.roadSectionId === roadSectionId && geometry.routeVersionId === routeVersionId && geometry.metadataStatus === 'COMPLETE'
  const confirmationRead = !!geometry?.approvedBy && Number.isFinite(Date.parse(geometry?.approvedAt || ''))
  useEffect(() => {
    let active = true; attempt.current++; running.current = false
    setBusy(false); setReasonOpen(false); setReason(''); setPreview(null); setSnapshot(null); setSets([]); setHeld(null); setMessage(''); setReviewed(false); setError(''); setLoading(validRoute); setLoadedKey('')
    if (!validRoute) return
    setJournalScope(key)
    try { setHeld(pendingSegment(pins)) } catch (e) { setError((e as Error).message) }
    ;(async () => {
      const rows = await segmentSetService.list(pins)
      const published = publishedSetForRoute(rows, routeVersionId)
      const value = setId ? await segmentSetService.read(pins, setId) : null
      if (!active || selection.current !== key || useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actorId) return
      setSets(rows); setSnapshot(value); setLoadedKey(key)
      if (!published) setMessage('PM chưa công bố phân đoạn')
      if (value?.data.definition) refs.current.restoreDistance(value.data.definition.targetLengthMeters / 1000)
    })().catch(e => { if (active) setError(`Không đọc được segment set: HTTP ${e?.response?.status || ''} ${e?.response?.data?.code || e.message}`) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false; attempt.current++ }
  }, [key, reload])
  const freshScope = loadedKey === key
  const currentSnapshot = freshScope ? snapshot : null, currentPreview = freshScope ? preview : null
  useEffect(() => {
    if (!setId && params.get('roadSectionId') === roadSectionId && params.get('routeVersionId') === routeVersionId && routeMatches && freshScope && !loading && !error && newSetRoute.current !== routeKey && !held && !params.get('layoutId')) {
      const published = publishedSetForRoute(sets, routeVersionId)
      if (published) setParams(current => {
        if (current.get('segmentSetId') || current.get('layoutId')) return current
        const next = new URLSearchParams(current); next.set('segmentSetId', published.id); return next
      }, { replace: true })
    }
  }, [key, routeMatches, freshScope, loading, error, sets, held, params])
  const publishedSet = freshScope ? publishedSetForRoute(sets, routeVersionId) : null
  const selectionLabel = currentPreview ? 'Đang xem preview — chưa lưu, chưa áp dụng.' : currentSnapshot?.data.status === 'DRAFT' ? 'Đang xem bản nháp — chưa áp dụng.' : currentSnapshot?.data.status === 'PUBLISHED' ? 'Đang xem bộ phân đoạn đã công bố.' : currentSnapshot?.data.status === 'SUPERSEDED' ? 'Đang xem bộ phân đoạn lịch sử — đã thay thế.' : 'Chưa chọn bản phân đoạn.'
  const publicationLabel = publishedSet ? `Bộ đang công bố: ${publishedSet.id}` : 'PM chưa công bố phân đoạn'
  const editable = auth.user?.role === RoleCode.PROJECT_MANAGER && mainline && routeMatches && confirmationRead && freshScope && !loading && !error && (!currentSnapshot || currentSnapshot.data.status === 'DRAFT') && !busy && !held
  const openSet = (id: string) => {
    if (busy || held) { refs.current.notify('Đối chiếu command đang chờ trước khi đổi segment set.'); return }
    newSetRoute.current = id ? '' : routeKey
    const next = new URLSearchParams(params); if (id) next.set('segmentSetId', id); else next.delete('segmentSetId')
    next.delete('layoutId'); setPreview(null); setSnapshot(null); setParams(next)
  }
  const begin = () => {
    if (running.current) return null
    running.current = true; setBusy(true)
    const n = ++attempt.current, selected = key
    return () => selection.current === selected && attempt.current === n && useAuthStore.getState().authEpoch === epoch && useAuthStore.getState().user?.id === actorId
  }
  const fail = (e: any, current: () => boolean) => {
    if (!current()) return
    setJournalScope(key)
    try { setHeld(pendingSegment(pins)) } catch { /* Surface original error; no replacement mutation. */ }
    const text = `Phân đoạn: ${e?.response ? `HTTP ${e.response.status} ${e.response.data?.code || ''}` : e.message}`
    setMessage(text); refs.current.notify(text)
  }
  const loadPreview = async (boundaries?: number[]) => {
    if (!editable) { refs.current.notify('Cần PM, hình học đã xác nhận COMPLETE và segment set DRAFT hoặc bản mới để preview.'); return }
    const current = begin(); if (!current) return
    setPreview(null)
    try {
      const input = { ...segmentDefinition(distanceRef.current, boundaries), remainderMode: currentSnapshot?.data.definition?.remainderMode || 'KEEP' }, value = await segmentSetService.preview(pins, input)
      if (value.totalLengthMeters !== geometry!.lengthMeters || value.segments.at(-1)?.toOffsetMeters !== geometry!.lengthMeters) throw new Error('Preview không khớp chiều dài route server.')
      if (current()) { setPreview({ value, input }); setMessage(`Preview máy chủ: ${value.segments.length} phân đoạn; chưa lưu segment set.`) }
    } catch (e) { fail(e, current) } finally { if (current()) { running.current = false; setBusy(false) } }
  }
  const save = async () => {
    if (!editable || !currentPreview) { refs.current.notify('Cần xem trước phân đoạn từ máy chủ trước khi lưu.'); return }
    if (distanceKm * 1000 !== currentPreview.input.targetLengthMeters) { refs.current.notify('Cự ly đã đổi; xem trước lại trước khi lưu.'); return }
    await execute(currentSnapshot ? { pins, kind: 'edit', setId, etag: currentSnapshot.etag, input: currentPreview.input } : { pins, kind: 'create', input: currentPreview.input })
  }
  const execute = async (intent?: SegmentIntent) => {
    if (auth.user?.role !== RoleCode.PROJECT_MANAGER || !mainline) return
    const current = begin(); if (!current) return
    try {
      const pending = pendingSegment(pins)
      const heldSetId = pending?.receipt?.id || (pending?.intent.kind !== 'create' ? pending?.intent.setId : '')
      if (pending && setId && heldSetId !== setId) throw new Error(`Yêu cầu đang chờ thuộc set ${heldSetId || 'mới'}; mở đúng reference trước khi retry.`)
      if (!pending) {
        if (!intent || !routeMatches || !confirmationRead || !freshScope || error || loading) throw new Error('Chưa có đúng route/segment set đã đọc.')
        const route = await alignmentService.readConfirmedGeometry(projectId, roadSectionId, routeVersionId)
        if (route.projectId !== projectId || route.roadSectionId !== roadSectionId || route.routeVersionId !== routeVersionId || route.lengthMeters !== geometry!.lengthMeters || route.metadataStatus !== 'COMPLETE' || !route.approvedBy || !Number.isFinite(Date.parse(route.approvedAt || ''))) throw new Error('Route hoặc dữ liệu xác nhận thay đổi; hãy đọc lại.')
        if (intent.kind !== 'create') {
          const fresh = await segmentSetService.read(pins, intent.setId)
          if (fresh.etag !== intent.etag || fresh.data.status !== 'DRAFT') throw new Error('ETag/trạng thái set thay đổi; đọc hồ sơ và chủ động đối chiếu trước khi ghi.')
        }
        if (intent.kind === 'publish') {
          const published = (await segmentSetService.list(pins)).filter(s => s.status === 'PUBLISHED')
          if (!route.isCurrent || published.length > 1 || (published[0]?.id ?? null) !== intent.input.expectedPublishedSetId) throw new Error('Publication đã thay đổi; đọc hồ sơ và đối chiếu trước khi publish.')
        }
        if (!current()) return
      }
      const result = await runSegment(pins, intent)
      if (!current()) return
      setSnapshot(result); setHeld(null); setPreview(null); setReasonOpen(false)
      const next = new URLSearchParams(params); next.set('segmentSetId', result.data.id); next.delete('layoutId'); setParams(next)
      setReload(n => n + 1)
      const text = `Đã GET segment set ${result.data.id} ${result.data.status}: ${result.data.segments.length} phân đoạn server.`
      setMessage(text); refs.current.notify(text)
    } catch (e) { fail(e, current) } finally { if (current()) { running.current = false; setBusy(false) } }
  }
  const publish = async () => {
    if (!editable || !currentSnapshot || currentPreview) return
    if (!reason.trim()) { setMessage('Cần PM nhập lý do publish, không chỉ khoảng trắng.'); return }
    const published = sets.filter(s => s.status === 'PUBLISHED')
    if (published.length > 1) { setMessage('Publication không duy nhất; cần đối chiếu.'); return }
    await execute({ pins, kind: 'publish', setId, etag: currentSnapshot.etag, input: { expectedPublishedSetId: published[0]?.id ?? null, reason: reason.trim() } })
  }
  const review = async () => {
    const current = begin(); if (!current) return
    try {
      const pending = pendingSegment(pins), id = pending?.intent.kind !== 'create' ? pending?.intent.setId : setId
      if (pending && setId && id !== setId) throw new Error('Mở đúng set của yêu cầu đang chờ trước khi đối chiếu.')
      const value = id ? await segmentSetService.read(pins, id) : null, rows = await segmentSetService.list(pins)
      if (current()) { setSnapshot(value); setSets(rows); setReviewed(true); setMessage(`Hồ sơ đối chiếu: ${value?.data.id || 'bản mới'}, ${value?.data.status || ''}, ETag ${value?.etag || ''}. Publication: ${rows.filter(s => s.status === 'PUBLISHED').map(s => s.id).join(', ') || 'chưa có'}. Chưa thay ý định cũ.`) }
    } catch (e) { fail(e, current) } finally { if (current()) { running.current = false; setBusy(false) } }
  }
  const revise = () => {
    if (!reviewed) return
    try { reviseSegment(pins); setHeld(null); setPreview(null); setReasonOpen(false); setReviewed(false); setMessage('Đã chấp nhận hồ sơ vừa đọc; cần preview lại trước ý định ghi mới.') } catch (e) { setMessage((e as Error).message) }
  }
  const display = currentPreview ? segmentRows(currentPreview.value, 'PREVIEW MÁY CHỦ — CHƯA LƯU', geometry) : currentSnapshot ? segmentRows(currentSnapshot.data, `SEGMENT SET ${currentSnapshot.data.status}`, geometry) : null
  return { selectionLabel, publicationLabel, publishedSet, enabled: validRoute, editable, loading, busy, error, message, setId, sets: freshScope ? sets : [], snapshot: currentSnapshot, preview: currentPreview, display, held: journalScope === key ? held : null, reviewed,
    openSet, openHeldSet: () => { if (busy || !held) return; const id = held.receipt?.id || (held.intent.kind !== 'create' ? held.intent.setId : ''); const next = new URLSearchParams(params); if (id) next.set('segmentSetId', id); else next.delete('segmentSetId'); next.delete('layoutId'); setParams(next) }, loadPreview, save, publish, retry: () => execute(), reload: () => setReload(n => n + 1), review, revise,
    reasonOpen, reason, setReason, closeReason: () => { if (!busy) setReasonOpen(false) }, openPublish: () => { if (editable && currentSnapshot && !currentPreview) { setReason(''); setReasonOpen(true) } },
    split: (stationKm: number) => {
      const rows = currentPreview?.value.segments || currentSnapshot?.data.segments
      if (!editable) { refs.current.notify('Chỉ PM được tách segment set DRAFT trên đúng route đã đọc.'); return }
      if (!rows?.length || !Number.isFinite(geometry?.stationOriginMeters) || rows.some(s => ![s.startStationMeters, s.endStationMeters, s.fromOffsetMeters, s.toOffsetMeters].every(Number.isFinite) || Math.abs(s.startStationMeters - geometry!.stationOriginMeters! - s.fromOffsetMeters) > 1e-9 || Math.abs(s.endStationMeters - geometry!.stationOriginMeters! - s.toOffsetMeters) > 1e-9)) {
        refs.current.notify('Chưa hỗ trợ ánh xạ lý trình/offset này; cần mốc server liên tục theo stationOriginMeters, không tự suy từ CRS nguồn.'); return
      }
      const offset = stationKm * 1000 - geometry!.stationOriginMeters!
      if (!(offset > 0 && offset < geometry!.lengthMeters)) { refs.current.notify('Mốc tách phải nằm trong phạm vi lý trình server.'); return }
      const bounds = [0, ...rows.map(s => s.toOffsetMeters)]
      if (bounds.includes(offset)) { refs.current.notify('Mốc tách đã có trong phân đoạn.'); return }
      void loadPreview([...bounds, offset].sort((a, b) => a - b))
    }
  }
}
