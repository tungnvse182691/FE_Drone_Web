import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { alignmentService, type GeometryDraftInput } from '../../../api/services/alignmentService'
import { acceptFreshDraftVersion, pendingDraftCommand, reviseRejectedDraftCommand, runDraftCommand } from '../../../api/services/geometryDraftCommands'
import { GeometryCommandUiError, geometryCommandErrorMessage } from '../../../api/services/geometryCommandErrors'
import type { useGeometryReadModel } from './useGeometryReadModel'
import { validateCoordinateDraft, RoadGuardDraftValidationError, type CoordinateDraftSource } from './roadGuardDraftImportHelpers'

type ReadModel = ReturnType<typeof useGeometryReadModel>
export interface GeometryDraftForm {
  sectionId: string; profileId: string; origin: string; surveyWidth: string; widths: string; reason: string
}
const emptyForm: GeometryDraftForm = { sectionId: '', profileId: '', origin: '', surveyWidth: '', widths: '', reason: '' }
export function coordinateDraftInput(form: GeometryDraftForm, text: string, model: Pick<ReadModel, 'context' | 'profiles'>, fileDraft?: CoordinateDraftSource | null, requireReason = true): GeometryDraftInput {
  const context = model.context
  if (!context) throw new GeometryCommandUiError('Chưa tải được phạm vi tuyến và engineering CRS từ máy chủ.')
  const roads = context.roadSections.filter(section => section.roadSectionId === form.sectionId)
  if (!form.sectionId || roads.length !== 1) throw new GeometryCommandUiError('Hãy chọn đúng một tuyến từ phạm vi máy chủ đã trả về.')
  const road = roads[0]
  const profile = model.profiles.find(profile => profile.id === form.profileId && profile.projectId === context.projectId)
  const definition = profile?.definition
  if (fileDraft && (fileDraft.sourceCrs !== context.engineeringUtmSrid || ![32648, 32649].includes(fileDraft.sourceCrs))) {
    throw new GeometryCommandUiError('sourceCrs của Draft JSON không khớp engineering CRS dự án từ máy chủ.')
  }
  if (!fileDraft && (!definition || definition.sourceSrid !== context.engineeringUtmSrid || ![32648, 32649].includes(definition.sourceSrid) || definition.axisOrder !== 'EN' || definition.metresPerUnit !== 1)) {
    throw new GeometryCommandUiError('Cần hồ sơ CRS cùng engineering SRID, trục EN và đơn vị mét. Chưa có adapter được xác minh cho lựa chọn khác.')
  }
  if (!fileDraft && (!definition?.datum || !definition.projection || !definition.sourceReference || !/^[0-9a-f]{64}$/i.test(definition.sourceChecksum || '') || definition.sampleOnly !== false)) {
    throw new GeometryCommandUiError('Hồ sơ CRS chưa đủ nguồn hoặc chỉ là mẫu; không dùng làm dữ liệu tuyến chính thức.')
  }
  const rows = (value: string, count: number) => value.trim().split(/\r?\n/).map(line => {
    const cells = line.trim().split(/[,;\s]+/)
    if (cells.length !== count || cells.some(cell => !cell || !Number.isFinite(Number(cell)))) throw new GeometryCommandUiError('Mỗi dòng phải có đủ các số hữu hạn theo nhãn nhập.')
    return cells.map(Number)
  })
  const coordinates = rows(text, 2).map(([x, y]) => ({ x, y }))
  if (coordinates.length < 2 || coordinates.length > 100000) throw new GeometryCommandUiError('Tim tuyến cần 2–100000 điểm.')
  let length = 0
  for (let i = 1; i < coordinates.length; i++) {
    const distance = Math.hypot(coordinates[i].x - coordinates[i - 1].x, coordinates[i].y - coordinates[i - 1].y)
    if (!(distance > 0) || !Number.isFinite(distance)) throw new GeometryCommandUiError('Hai đỉnh liền kề phải khác nhau và có khoảng cách hữu hạn.')
    length += distance
  }
  if (!Number.isFinite(length)) throw new GeometryCommandUiError('Chiều dài không hợp lệ.')
  if (!form.origin.trim() || !Number.isFinite(Number(form.origin)) || !form.surveyWidth.trim() || !(Number(form.surveyWidth) > 0) || !Number.isFinite(Number(form.surveyWidth))) {
    throw new GeometryCommandUiError('Cần lý trình gốc, bề rộng khảo sát và lý do thay đổi có nguồn.')
  }
  let end = 0
  const widthProfile = (fileDraft ? fileDraft.widthProfile.map(w => [w.fromOffsetMeters, w.toOffsetMeters, w.widthMeters]) : rows(form.widths, 3)).map(([fromOffsetMeters, toOffsetMeters, widthMeters]) => {
    if (fromOffsetMeters !== end || !(toOffsetMeters > fromOffsetMeters) || !(widthMeters > 0) || widthMeters > Number(form.surveyWidth)) throw new GeometryCommandUiError('Các khoảng bề rộng phải liên tiếp và nằm trong bề rộng khảo sát.')
    end = toOffsetMeters
    return { fromOffsetMeters, toOffsetMeters, widthMeters }
  })
  if (Math.abs(end - length) > 1e-7) throw new GeometryCommandUiError('Khoảng bề rộng phải phủ đúng chiều dài tim tuyến đã nhập.')
  const input: GeometryDraftInput = { sourceKind: 'COORDINATES', sourceCrs: fileDraft ? fileDraft.sourceCrs : definition!.sourceSrid, stationOriginMeters: Number(form.origin), coordinates, widthProfile, surveyWidthMeters: Number(form.surveyWidth), changeReason: fileDraft ? form.reason : form.reason.trim(), roadCode: road.code, roadName: road.name }
  if (requireReason && !form.reason.trim()) throw new GeometryCommandUiError('changeReason: cần PM nhập lý do cập nhật; GET draft không trả lý do gốc.')
  if (fileDraft) {
    try { validateCoordinateDraft(input, requireReason); return input }
    catch (error) { throw new GeometryCommandUiError(error instanceof RoadGuardDraftValidationError ? error.message : 'Không kiểm tra được bản chỉnh Draft JSON.') }
  }
  return input
}

export function useGeometryDraftWorkflow(projectId: string, model: ReadModel, coordinatesText: string, setCoordinatesText: (text: string) => void, showToast: (message: string) => void, sourceUnverified = false, fileDraft?: CoordinateDraftSource | null) {
  const { user, authEpoch } = useAuthStore()
  const [form, setForm] = useState<GeometryDraftForm>(emptyForm)
  const [reasonModalOpen, setReasonModalOpen] = useState(false)
  const [reasonError, setReasonError] = useState('')
  const [awaitingDraftId, setAwaitingDraftId] = useState('')
  const [hydrateReadError, setHydrateReadError] = useState(false)
  const acceptedDraft = useRef(''), acceptedVersion = useRef(''), awaitingAcknowledgement = useRef(false)
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const [pending, setPending] = useState<ReturnType<typeof pendingDraftCommand>>(null)
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof alignmentService.previewGeometryDraft>> | null>(null)
  const [previewVersion, setPreviewVersion] = useState('')
  const [conflict, setConflict] = useState(false), [freshVersion, setFreshVersion] = useState(false)
  const [effectiveFrom, setEffectiveFrom] = useState(''), [confirmReason, setConfirmReason] = useState('')
  const selection = useRef({ projectId, draftId: model.draftId, version: model.draft?.etag, authEpoch })
  selection.current = { projectId, draftId: model.draftId, version: model.draft?.etag, authEpoch }
  const attempt = useRef(0), running = useRef(false), hydrated = useRef('')
  useEffect(() => {
    attempt.current++; running.current = false; hydrated.current = ''; acceptedDraft.current = ''; acceptedVersion.current = ''; awaitingAcknowledgement.current = false; setAwaitingDraftId(''); setHydrateReadError(false)
    setReasonModalOpen(false); setReasonError('')
    setForm(emptyForm); setCoordinatesText(''); setPreview(null); setPreviewVersion(''); setMessage(''); setBusy(false); setConflict(false); setFreshVersion(false); setEffectiveFrom(''); setConfirmReason('')
    try {
      const held = projectId ? pendingDraftCommand(projectId) : null
      setPending(held); setConflict(!!held?.conflict)
      if (held?.receipt && !model.draftId) {
        const receipt = held.receipt
        if (receipt.projectId === projectId && 'routeVersionId' in receipt && receipt.roadSectionId && held.command.kind === 'confirm') model.openConfirmed(held.command.draftId, receipt)
        else if (receipt.projectId === projectId && 'id' in receipt) model.openDraft(receipt.id)
      }
    }
    catch { setMessage('Không đọc được yêu cầu cũ. Cần đối chiếu trước khi gửi lệnh mới.'); setPending(null) }
    return () => { attempt.current++ }
  }, [projectId, authEpoch])
  useEffect(() => {
    attempt.current++; if (!awaitingAcknowledgement.current) { running.current = false; setBusy(false) }
    if (!model.draftId) { acceptedDraft.current = ''; acceptedVersion.current = ''; awaitingAcknowledgement.current = false; setAwaitingDraftId(''); setHydrateReadError(false) }
    setPreview(null); setPreviewVersion('')
    if (awaitingAcknowledgement.current && model.draftId === acceptedDraft.current || hydrated.current === model.draftId) return
    hydrated.current = ''
    setForm(emptyForm); setCoordinatesText('')
    setReasonModalOpen(false); setReasonError('')
  }, [model.draftId])
  useEffect(() => {
    const draft = model.draft?.data
    if ((awaitingAcknowledgement.current || hydrateReadError) && model.draftId === acceptedDraft.current) {
      if (model.draftLoading) return
      const sameDraft = draft?.id === acceptedDraft.current && draft.projectId === projectId
      if (sameDraft || model.draftError) {
        awaitingAcknowledgement.current = false; setAwaitingDraftId(''); running.current = false; setBusy(false)
        hydrated.current = acceptedDraft.current // The unsent input remains owned by the user.
        if (!sameDraft) {
          setHydrateReadError(true)
          const text = 'Đã lưu thành công nhưng chưa tải lại được bản nháp. Bản nhập được giữ; hãy thử đọc lại.'
          setMessage(text); showToast(text)
        } else {
          setHydrateReadError(false)
          const matches = acceptedVersion.current === 'CONFIRMED' ? draft!.status === 'CONFIRMED' : model.draft?.etag === acceptedVersion.current
          if (!matches) {
            setConflict(true); setFreshVersion(false); setPreview(null); setPreviewVersion('')
            const text = 'Đã lưu; bản nháp vừa đọc có phiên bản khác. Bản nhập được giữ để đối chiếu.'
            setMessage(text); showToast(text)
          } else setMessage(acceptedVersion.current === 'CONFIRMED' ? 'Đã đọc lại hồ sơ đã xác nhận từ máy chủ.' : 'Đã đọc lại bản nháp đã lưu. Bản nhập được giữ.')
        }
        return
      }
      return
    }
    if (!draft || draft.projectId !== projectId || draft.id !== model.draftId || hydrated.current === draft.id) return
    hydrated.current = draft.id
    setForm(old => ({ ...old, sectionId: draft.roadSectionId || '', origin: Number.isFinite(draft.stationOriginMeters) ? String(draft.stationOriginMeters) : '', surveyWidth: Number.isFinite(draft.surveyWidthMeters) ? String(draft.surveyWidthMeters) : '', widths: (draft.widthProfile || []).map(w => `${w.fromOffsetMeters}, ${w.toOffsetMeters}, ${w.widthMeters}`).join('\n') }))
    if (draft.sourceKind === 'COORDINATES') setCoordinatesText((draft.editedCoordinates || draft.originalCoordinates || []).map(p => `${p.x}, ${p.y}`).join('\n'))
  }, [model.draft, model.draftId, model.draftLoading, model.draftError, projectId])
  useEffect(() => {
    if (!pending) return
    if (pending.command.kind === 'confirm') {
      setConfirmReason(pending.command.input.reason || '')
      const date = new Date(pending.command.input.effectiveFrom)
      if (Number.isFinite(date.getTime())) setEffectiveFrom(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
      return
    }
    const input = pending.command.input
    setForm(old => ({ ...old, sectionId: pending.command.kind === 'create' ? pending.command.sectionId : model.draft?.data.roadSectionId || '', origin: String(input.stationOriginMeters), surveyWidth: String(input.surveyWidthMeters), widths: input.widthProfile.map(w => `${w.fromOffsetMeters}, ${w.toOffsetMeters}, ${w.widthMeters}`).join('\n'), reason: input.changeReason || '' }))
    setCoordinatesText((input.coordinates || []).map(p => `${p.x}, ${p.y}`).join('\n'))
  }, [pending])
  const draft = model.draft?.data
  const draftVersion = model.draft?.etag
  let saveReason = ''
  let input: GeometryDraftInput | null = null
  try {
    if (hydrateReadError) throw new GeometryCommandUiError('Bản nháp đã lưu nhưng chưa tải lại được. Hãy thử đọc lại trước khi gửi lệnh mới.')
    if (awaitingDraftId) throw new GeometryCommandUiError('Đang nạp đúng bản nháp vừa lưu. Chưa gửi lệnh mới.')
    if (user?.role !== RoleCode.PROJECT_MANAGER) throw new GeometryCommandUiError('Chỉ PM được lưu hoặc sửa bản nháp.')
    if (model.draftId && (!draft || draft.id !== model.draftId || draft.projectId !== projectId)) throw new GeometryCommandUiError('Cần đọc đúng bản nháp trước khi sửa.')
    if (draft && draft.status !== 'DRAFT') throw new GeometryCommandUiError('Bản nháp đã xác nhận, không được sửa.')
    if (draft && draft.sourceKind !== 'COORDINATES') throw new GeometryCommandUiError('Bản nháp dùng hình học native; hồ sơ đọc chưa đủ thông tin tuyến và hiệu chỉnh để sửa an toàn.')
    if (draft && !model.draft?.etag) throw new GeometryCommandUiError('Chưa đọc được phiên bản bản nháp.')
    if (sourceUnverified && !fileDraft) throw new GeometryCommandUiError('Đã đọc tệp, chưa lưu: chưa có mapping hệ tọa độ, trục và đơn vị được xác minh cho tệp này.')
    if (model.context?.projectId !== projectId) throw new GeometryCommandUiError('Chưa tải đúng context dự án từ máy chủ.')
    if (draft && (!draft.roadSectionId || form.sectionId !== draft.roadSectionId)) throw new GeometryCommandUiError('Tuyến đích phải khớp road section của bản nháp đang sửa.')
    input = coordinateDraftInput(form, coordinatesText, model, fileDraft, false)
  } catch (error) { saveReason = error instanceof GeometryCommandUiError ? error.message : 'Không kiểm tra được bản nhập. Hãy kiểm tra lại thông tin nguồn.' }
  const saveDisabledReason = saveReason
  if (!saveReason && !form.reason.trim()) saveReason = 'changeReason: cần PM nhập lý do cập nhật; GET draft không trả lý do gốc.'
  const section = draft?.roadSectionId ? model.context?.roadSections.find(section => section.roadSectionId === draft.roadSectionId) : undefined
  const readiness = model.readiness
  const confirmGate = hydrateReadError ? 'Hồ sơ đã lưu nhưng chưa tải lại được. Hãy thử đọc lại.' : user?.role !== RoleCode.SUPERVISOR ? 'Chỉ Giám sát được xác nhận.'
    : draft?.status === 'CONFIRMED' ? 'Hồ sơ đã được xác nhận từ máy chủ.'
    : !draft || draft.status !== 'DRAFT' || !model.draft?.etag ? 'Cần bản nháp DRAFT và phiên bản từ máy chủ.'
    : !model.context || !section?.currentVersionId ? 'Chưa đọc được tuyến/phiên bản hiện tại từ context máy chủ.'
    : !readiness?.ready || readiness.missingFields.length || readiness.errors.length ? 'Readiness máy chủ chưa cho phép xác nhận.'
    : !preview || previewVersion !== model.draft.etag ? 'Cần xem trước đúng phiên bản bản nháp.'
    : !effectiveFrom || !Number.isFinite(Date.parse(effectiveFrom)) || !confirmReason.trim() ? 'Cần ngày hiệu lực và lý do xác nhận.' : ''
  const begin = () => {
    if (running.current || awaitingAcknowledgement.current) return null
    running.current = true; setBusy(true)
    const id = ++attempt.current, selected = { ...selection.current }
    return () => attempt.current === id && selection.current.projectId === selected.projectId && selection.current.draftId === selected.draftId && selection.current.authEpoch === selected.authEpoch && useAuthStore.getState().authEpoch === selected.authEpoch
  }
  const notify = (text: string) => { setMessage(text); showToast(text) }
  const failure = async (error: any, current: () => boolean) => {
    if (!current()) return
    console.warn('[Geometry command]', { status: error?.response?.status, code: error?.response?.data?.code, correlationId: error?.response?.data?.correlationId })
    let held: ReturnType<typeof pendingDraftCommand>
    try { held = pendingDraftCommand(projectId) } catch { notify('Không đọc được yêu cầu đang chờ. Cần đối chiếu trước khi gửi lệnh mới.'); return }
    setPending(held)
    const status = error?.response?.status
    const text = geometryCommandErrorMessage(error, useAuthStore.getState().isAuthenticated, held)
    if ([409, 412, 428].includes(status)) {
      setConflict(true); setFreshVersion(false); setPreview(null); setPreviewVersion('')
      try {
        if (model.draftId) await alignmentService.getGeometryDraft(projectId, model.draftId)
        await alignmentService.readProjectContext(projectId)
        if (current()) { setFreshVersion(true); model.retry() }
      } catch { /* The draft input remains untouched; explicit retry stays available. */ }
      if (!current()) return
      notify(text)
    } else notify(text)
  }
  const complete = async (result: Awaited<ReturnType<typeof runDraftCommand>>, current: () => boolean) => {
    if (!current()) return
    setReasonModalOpen(false); setReasonError('')
    setPending(null); setPreview(null); setPreviewVersion(''); setHydrateReadError(false); awaitingAcknowledgement.current = true
    if (result.kind === 'confirm') { acceptedDraft.current = result.draftId; acceptedVersion.current = 'CONFIRMED'; setAwaitingDraftId(result.draftId); model.openConfirmed(result.draftId, result.geometry) }
    else { acceptedDraft.current = result.draft.data.id; acceptedVersion.current = result.draft.etag; setAwaitingDraftId(result.draft.data.id); model.openDraft(result.draft.data.id) }
    model.retry()
    notify(result.kind === 'confirm' ? 'Đã xác nhận và đọc lại geometry từ máy chủ.' : 'Đã lưu và đọc lại bản nháp từ máy chủ. Chưa xác nhận tuyến.')
  }
  const save = async (submitReason = false) => {
    if (awaitingAcknowledgement.current || selection.current.draftId !== model.draftId || selection.current.version !== draftVersion) { notify('Đang nạp đúng bản nháp vừa lưu. Chưa gửi lệnh mới.'); return }
    if (saveDisabledReason || !input || pending || conflict) { notify(saveDisabledReason || 'Cần đối chiếu yêu cầu hoặc phiên bản cũ trước.'); return }
    if (!form.reason.trim()) {
      setReasonModalOpen(true)
      if (submitReason) setReasonError('Vui lòng nhập lý do cập nhật, không chỉ khoảng trắng.')
      return
    }
    const current = begin(); if (!current) return
    try { await complete(await runDraftCommand(projectId, draft ? { kind: 'update', draftId: draft.id, etag: draftVersion!, input } : { kind: 'create', sectionId: form.sectionId, input }), current) }
    catch (error) { await failure(error, current) }
    finally { if (current() && !awaitingAcknowledgement.current) { running.current = false; setBusy(false) } }
  }
  const retryCommand = async () => {
    const current = begin(); if (!current) return
    try { await complete(await runDraftCommand(projectId), current) }
    catch (error) { await failure(error, current) }
    finally { if (current() && !awaitingAcknowledgement.current) { running.current = false; setBusy(false) } }
  }
  const loadPreview = async () => {
    if (![RoleCode.PROJECT_MANAGER, RoleCode.SUPERVISOR].includes(user?.role as RoleCode)) { notify('Chỉ PM hoặc Giám sát được xem trước tuyến.'); return }
    if (!draft || !model.draft?.etag || pending || conflict) { notify('Cần bản nháp đã đọc và giải quyết yêu cầu cũ trước khi xem trước.'); return }
    const current = begin(); if (!current) return
    try {
      const value = await alignmentService.previewGeometryDraft(projectId, draft.id, model.draft.etag)
      if (!Number.isFinite(value?.lengthMeters) || !(value.lengthMeters > 0)) throw new GeometryCommandUiError('Preview chưa có chiều dài hợp lệ từ máy chủ.')
      if (current() && selection.current.version === model.draft.etag) { setPreview(value); setPreviewVersion(model.draft.etag) }
      const ready = await alignmentService.readDraftReadiness(projectId, draft.id)
      if (current() && selection.current.version === model.draft.etag) { model.setReadiness(ready); notify('Đã đọc preview/readiness từ máy chủ. Preview chưa phải xác nhận tuyến.') }
    } catch (error) { await failure(error, current) }
    finally { if (current() && !awaitingAcknowledgement.current) { running.current = false; setBusy(false) } }
  }
  const confirm = async () => {
    if (confirmGate || pending || conflict) { notify(confirmGate || 'Cần đối chiếu yêu cầu/phiên bản cũ trước.'); return }
    const current = begin(); if (!current) return
    try {
      const [fresh, ready, context] = await Promise.all([alignmentService.getGeometryDraft(projectId, draft!.id), alignmentService.readDraftReadiness(projectId, draft!.id), alignmentService.readProjectContext(projectId)])
      if (!current()) return
      const road = context.roadSections.find(road => road.roadSectionId === draft!.roadSectionId)
      if (fresh.etag !== model.draft!.etag || road?.currentVersionId !== section!.currentVersionId) {
        setConflict(true); setFreshVersion(true); model.retry(); throw new GeometryCommandUiError('Phiên bản đã thay đổi. Hãy xem lại trước khi xác nhận.')
      }
      if (fresh.data.status !== 'DRAFT' || !ready.ready || ready.missingFields.length || ready.errors.length) throw new GeometryCommandUiError('Bản nháp/readiness không còn đủ điều kiện xác nhận.')
      await complete(await runDraftCommand(projectId, { kind: 'confirm', draftId: draft!.id, etag: fresh.etag, input: { expectedCurrentVersionId: road!.currentVersionId, effectiveFrom: new Date(effectiveFrom).toISOString(), reason: confirmReason.trim() } }), current)
    } catch (error) { await failure(error, current) }
    finally { if (current() && !awaitingAcknowledgement.current) { running.current = false; setBusy(false) } }
  }
  const reviewConflict = async () => {
    const current = begin(); if (!current) return
    setFreshVersion(false)
    try {
      if (model.draftId) await alignmentService.getGeometryDraft(projectId, model.draftId)
      await alignmentService.readProjectContext(projectId)
      if (current()) { setFreshVersion(true); model.retry() }
    } catch { if (current()) notify('Chưa đọc được phiên bản mới. Bản nhập vẫn được giữ.') }
    finally { if (current() && !awaitingAcknowledgement.current) { running.current = false; setBusy(false) } }
  }
  const retryHydrate = () => {
    if (!hydrateReadError || running.current || awaitingAcknowledgement.current || model.draftLoading) return
    awaitingAcknowledgement.current = true; setAwaitingDraftId(acceptedDraft.current)
    setHydrateReadError(false); setBusy(true); model.retry()
  }
  const acceptVersion = () => {
    if (!freshVersion || pending?.duplicate || model.draftLoading || !model.context || model.draftId && !model.draft) return
    if (pending) acceptFreshDraftVersion(projectId)
    setPending(null); setConflict(false); setPreview(null); setPreviewVersion(''); notify('Đã giữ bản nhập và chọn phiên bản máy chủ mới. Hãy kiểm tra rồi lưu/xem trước lại.')
  }
  const reviseRejected = () => { reviseRejectedDraftCommand(projectId); setPending(null); notify('Đã giữ bản nhập để sửa sau lỗi từ chối. Hãy kiểm tra nội dung trước khi lưu ý định mới.') }
  const cancelReason = () => { if (!running.current) { setReasonModalOpen(false); setReasonError('') } }
  return { form, setForm, reasonModalOpen, reasonError, cancelReason, saveDisabledReason, busy, message, hydrateReadError, retryHydrate, pending, conflict, freshVersion, saveReason, confirmReason: confirmGate, save, confirm, loadPreview, retryCommand, reviseRejected, reviewConflict, acceptVersion, preview, effectiveFrom, setEffectiveFrom, reason: confirmReason, setReason: setConfirmReason }
}
