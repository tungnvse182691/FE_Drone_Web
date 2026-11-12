import React from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { alignmentService } from '../../api/services'
import { Icon } from '../../components/ui/Icon'

import { AlignmentHeader } from './alignment/AlignmentHeader'
import { AlignmentMap } from './alignment/AlignmentMap'
import { AlignmentSidebar } from './alignment/AlignmentSidebar'
import { AlignmentModals } from './alignment/AlignmentModals'
import { useAlignmentState } from './alignment/useAlignmentState'
import { SEGMENT_COLORS, PM_ASSIGNED_PROJECTS } from './alignment/data'
import { AlignmentApprovalList } from './alignment/AlignmentApprovalList'
import { useGeometrySubmission } from './alignment/useGeometrySubmission'
import { useSegmentSetWorkflow } from './alignment/useSegmentSetWorkflow'
import { AlignmentAddBranchModal } from './alignment/AlignmentAddBranchModal'

export type { SegmentItem, SlabItem, AssignedProjectOption } from './alignment/types'
export { PM_ASSIGNED_PROJECTS } from './alignment/data'

// Retain references required by invariants
void maplibregl
void getMapLibreStyle
void useAuthStore
void RoleCode
void alignmentService

export const AlignmentSegments: React.FC = () => {
  const {
    isSupervisor,
    basePath,
    urlProjectId,
    selectedProjectId,
    assignedProjects,
    activeProject,
    geometryRead,
    pavementWorkflow,
    draftWorkflow,
    localDraftDirty, markLocalDraft, markWidthDraft,
    fileDraft, draftContentSaved,
    alignmentStatus,
    handleSwitchProject,
    handleSubmitAlignment,
    handleClearMainline,
    toastMessage,
    setToastMessage,
    showToast,
    rightTab,
    setRightTab,
    stripWidthMeters,
    setStripWidthMeters,
    slabLengthM,
    setSlabLengthM,
    slabThicknessCm,
    setSlabThicknessCm,
    contractionSpacingM,
    setContractionSpacingM,
    expansionSpacingM,
    setExpansionSpacingM,
    expansionGapMm,
    setExpansionGapMm,
    syncJointWithSlab,
    setSyncJointWithSlab,
    branches,
    branchesTotalLengthKm,
    totalProjectLengthKm,
    branchesCount,
    selectedTargetType,
    setSelectedTargetType,
    isAddBranchModalOpen,
    setIsAddBranchModalOpen,
    handleAddBranch,
    isMainline,
    currentBranch,
    activeSegments,
    activeLengthKm,
    activeSplitDistance,
    handleSetSplitDistance,
    handleApplyAutoSplit,
    handleSplitSegmentSubmit,
    handleUpdateSegmentWidth,
    handleUpdateAllWidths,
    handleSnapSegment,
    handleSaveEditedSegment,
    handleDeleteSegment,
    handleDeleteBranch,
    currentCoords,
    currentKmPoints,
    importedLengthKm,
    segmentsState,
    mapState,
    importState
  } = useAlignmentState()

  const submissionWorkflow = useGeometrySubmission(selectedProjectId, geometryRead, draftContentSaved, showToast)
  const submitted = geometryRead.submission?.status === 'SUBMITTED' || geometryRead.draft?.data.status === 'SUBMITTED'
  const contentLocked = !!geometryRead.geometry || submissionWorkflow.busy || !!submissionWorkflow.held || submitted || !!geometryRead.submission && geometryRead.submission.status !== 'REJECTED' || geometryRead.submissionLoading || !!geometryRead.submissionError || !geometryRead.submissionReady
  const segmentWorkflow = useSegmentSetWorkflow(selectedProjectId, geometryRead.roadReference, geometryRead.versionReference,
    geometryRead.geometry, isMainline, activeSplitDistance, segmentsState.setSplitDistance, showToast)
  const segmentRows = isMainline && rightTab === 'SEGMENTS' ? segmentWorkflow.display : null
  const displayedSegments = segmentRows || (draftContentSaved && isMainline ? activeSegments.map(segment => ({ ...segment, statusText: 'BẢN NHÁP ĐÃ LƯU' })) : activeSegments)
  const segmentCount = !isMainline ? activeSegments.length : segmentWorkflow.loading || segmentWorkflow.error ? null
    : segmentWorkflow.preview?.value.segments.length ?? segmentWorkflow.snapshot?.data.segments.length ?? null
  const segmentCountMessage = segmentWorkflow.loading ? 'Đang đọc…' : segmentWorkflow.error ? 'Lỗi đọc set' : 'Chưa chọn set'
  React.useEffect(() => {
    if (segmentRows) {
      const selected = segmentRows.some(segment => segment.id === segmentsState.selectedSegmentId) ? segmentsState.selectedSegmentId : 'ALL'
      if (selected !== segmentsState.selectedSegmentId) segmentsState.setSelectedSegmentId(selected)
      mapState.syncMap(segmentRows, selected, currentCoords, currentKmPoints, branches)
    }
  }, [segmentRows, currentCoords, currentKmPoints, segmentsState.selectedSegmentId])

  const missingDraftInput = [
    !geometryRead.context ? 'phạm vi tuyến từ máy chủ' : '',
    !draftWorkflow.form.sectionId ? 'tuyến đường trong dự án' : '',
    importState.hasUnverifiedFile || !draftWorkflow.form.profileId ? 'hồ sơ hệ tọa độ, trục và đơn vị có nguồn' : '',
    !draftWorkflow.form.origin.trim() ? 'lý trình gốc' : '',
    !draftWorkflow.form.surveyWidth.trim() ? 'bề rộng khảo sát' : '',
    !draftWorkflow.form.widths.trim() ? 'các khoảng bề rộng' : '',
    !draftWorkflow.form.reason.trim() ? 'lý do thay đổi' : ''
  ].filter(Boolean)

  const workflowActions = <>
    {(geometryRead.currentRoutes || []).length > 0 && <select aria-label="Tuyến hiện hành từ máy chủ" value={(geometryRead.currentRoutes || []).some(route => route.roadSectionId === geometryRead.roadReference && route.currentVersionId === geometryRead.versionReference) ? `${geometryRead.roadReference}:${geometryRead.versionReference}` : ''} disabled={geometryRead.contextLoading || draftWorkflow.busy || segmentWorkflow.busy || !!segmentWorkflow.held} onChange={event => { const route = geometryRead.currentRoutes.find(route => `${route.roadSectionId}:${route.currentVersionId}` === event.target.value); if (route) geometryRead.openGeometry(route.roadSectionId, route.currentVersionId) }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">
      <option value="">{geometryRead.roadReference ? geometryRead.geometry?.isCurrent === false ? 'Đang xem phiên bản tuyến lịch sử' : 'Đang xem phiên bản tuyến khác' : 'Chọn tuyến hiện hành để xem'}</option>
      {geometryRead.currentRoutes.map(route => <option key={route.roadSectionId} value={`${route.roadSectionId}:${route.currentVersionId}`}>{route.code} — {route.name}</option>)}
    </select>}

    {isSupervisor && geometryRead.submission?.status === 'SUBMITTED' && <button type="button" disabled={!submissionWorkflow.canReject || submissionWorkflow.busy || !!submissionWorkflow.held || draftWorkflow.busy || !!draftWorkflow.pending} onClick={submissionWorkflow.openReject} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Từ chối</button>}

    {!isSupervisor && <button type="button" disabled={submissionWorkflow.busy || !!submissionWorkflow.held || !!submissionWorkflow.reason || draftWorkflow.busy || !!draftWorkflow.pending} title={submissionWorkflow.reason} onClick={()=>{void submissionWorkflow.submit()}} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">{geometryRead.submission?.status === 'REJECTED' ? 'Trình lại' : 'Trình Giám sát'}</button>}
    {submissionWorkflow.held && <button type="button" disabled={submissionWorkflow.busy || submissionWorkflow.held.rejected} onClick={()=>{void submissionWorkflow.submit(true)}} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">{submissionWorkflow.held.received?'Đọc lại hồ sơ trình':'Gửi lại đúng yêu cầu trình'}</button>}
    {submissionWorkflow.held?.rejected && <button type="button" disabled={submissionWorkflow.busy} onClick={submissionWorkflow.revise} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Đọc lại, sửa yêu cầu trình bị từ chối</button>}

    {(geometryRead.submissionError || geometryRead.error || geometryRead.geometryError || geometryRead.draftError || geometryRead.profileError || segmentWorkflow.error) && <button type="button" disabled={geometryRead.loading || draftWorkflow.busy} onClick={() => { geometryRead.retry(); pavementWorkflow.retry(); segmentWorkflow.reload() }} className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs border border-slate-200">Tải lại</button>}
    {isSupervisor && draftWorkflow.reviewNeedsRetry && geometryRead.draft?.data.status === 'SUBMITTED' && <button type="button" disabled={draftWorkflow.busy || !!draftWorkflow.pending || draftWorkflow.conflict} onClick={draftWorkflow.retryPreview} className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs border border-slate-200">Thử lại xem xét hồ sơ</button>}
    {draftWorkflow.hydrateReadError && <button type="button" disabled={draftWorkflow.busy || geometryRead.draftLoading} onClick={draftWorkflow.retryHydrate} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Đọc lại bản đã lưu</button>}
    {draftWorkflow.pending && <button type="button" disabled={draftWorkflow.busy || draftWorkflow.conflict} onClick={() => { void draftWorkflow.retryCommand() }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">{draftWorkflow.pending.receipt ? 'Đọc lại kết quả' : 'Gửi lại đúng yêu cầu'}</button>}
    {draftWorkflow.pending?.rejected && <button type="button" disabled={draftWorkflow.busy} onClick={draftWorkflow.reviseRejected} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Sửa bản nhập</button>}
    {draftWorkflow.conflict && <>
      <button type="button" disabled={draftWorkflow.busy} onClick={() => { void draftWorkflow.reviewConflict() }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Đọc hồ sơ đối chiếu</button>
      <button type="button" disabled={!draftWorkflow.freshVersion || draftWorkflow.busy || geometryRead.draftLoading || !geometryRead.context || draftWorkflow.pending?.duplicate} onClick={draftWorkflow.acceptVersion} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Giữ bản nhập, dùng phiên bản vừa đọc</button>
    </>}
    {segmentWorkflow.enabled && <>
      <select aria-label="Segment set máy chủ" value={segmentWorkflow.setId} disabled={segmentWorkflow.busy || !!segmentWorkflow.held} onChange={event => segmentWorkflow.openSet(event.target.value)} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">
        <option value="">{segmentWorkflow.sets.length ? 'Chọn segment set / bản mới' : 'Chưa có segment set trong CSDL'}</option>
        {segmentWorkflow.sets.map(set => <option key={set.id} value={set.id}>{set.id} · {set.status}</option>)}
      </select>
      {!isSupervisor && <>
        <button type="button" disabled={segmentWorkflow.busy || !!segmentWorkflow.held} onClick={() => segmentWorkflow.openSet('')} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Bản phân đoạn mới</button>
        <button type="button" disabled={!segmentWorkflow.editable || !segmentWorkflow.preview} onClick={() => { void segmentWorkflow.save() }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">{segmentWorkflow.snapshot ? 'Lưu sửa segment set DRAFT' : 'Lưu segment set DRAFT'}</button>
        <button type="button" disabled={!segmentWorkflow.editable || !segmentWorkflow.snapshot || !!segmentWorkflow.preview} onClick={segmentWorkflow.openPublish} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Publish segment set</button>
        {segmentWorkflow.held && <button type="button" disabled={segmentWorkflow.busy} onClick={segmentWorkflow.openHeldSet} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Mở set của yêu cầu đang chờ</button>}
        {segmentWorkflow.held && <button type="button" disabled={segmentWorkflow.busy || segmentWorkflow.held.conflict || segmentWorkflow.held.rejected} onClick={() => { void segmentWorkflow.retry() }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">{segmentWorkflow.held.receipt ? 'GET lại segment set đã lưu' : 'Gửi lại đúng yêu cầu phân đoạn'}</button>}
        {(segmentWorkflow.held?.conflict || segmentWorkflow.held?.rejected) && <>
          <button type="button" disabled={segmentWorkflow.busy} onClick={() => { void segmentWorkflow.review() }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Đọc segment set đối chiếu</button>
          <button type="button" disabled={segmentWorkflow.busy || !segmentWorkflow.reviewed} onClick={segmentWorkflow.revise} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Chấp nhận hồ sơ vừa đọc, sửa ý định</button>
        </>}
      </>}
    </>}

  </>

  // Nếu vai trò Supervisor truy cập danh mục menu /sup/alignment mà chưa chọn dự án: hiển thị danh sách thẩm duyệt thay vì trỏ thẳng vào 1 tuyến
  if (isSupervisor && !urlProjectId) {
    return <AlignmentApprovalList />
  }

  const handleSelectAllRoute = () => {
    if (isMainline) {
      segmentsState.handleSelectAllRoute(currentCoords)
    } else if (currentBranch) {
      segmentsState.setSelectedSegmentId('ALL')
      if (currentBranch.coords && currentBranch.coords.length > 0) {
        mapState.handleFitBounds(currentBranch.coords)
      }
      showToast(`Đang chọn Toàn tuyến nhánh: [${currentBranch.code}] ${currentBranch.name}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {draftWorkflow.reasonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form role="dialog" aria-modal="true" aria-labelledby="draft-reason-title" onSubmit={event => { event.preventDefault(); void (draftWorkflow.pending ? draftWorkflow.retryCommand() : draftWorkflow.save(true)) }} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <h3 id="draft-reason-title" className="font-bold text-slate-900 text-base">Lý do cập nhật</h3>
            <label className="text-sm text-slate-700 flex flex-col gap-2">
              Lý do cập nhật
              <textarea autoFocus rows={3} disabled={draftWorkflow.busy || !!draftWorkflow.pending} value={draftWorkflow.form.reason} onChange={event => draftWorkflow.setForm(old => ({ ...old, reason: event.target.value }))} className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-brand-gold" />
            </label>
            {draftWorkflow.reasonError && <p role="alert" className="text-xs text-rose-700">{draftWorkflow.reasonError}</p>}
            {draftWorkflow.message && <p role="status" className="text-xs text-slate-600">{draftWorkflow.message}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" disabled={draftWorkflow.busy} onClick={draftWorkflow.cancelReason} className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Hủy</button>
              <button type="submit" disabled={draftWorkflow.busy || draftWorkflow.conflict || !!draftWorkflow.pending?.rejected} className="px-4 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold disabled:opacity-50">{draftWorkflow.busy ? 'Đang lưu…' : draftWorkflow.pending ? draftWorkflow.pending.receipt ? 'Đọc lại kết quả' : 'Gửi lại đúng yêu cầu' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      )}
      {isSupervisor && draftWorkflow.confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form role="dialog" aria-modal="true" aria-labelledby="confirm-geometry-title" onSubmit={event => { event.preventDefault(); void draftWorkflow.confirm() }} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <h3 id="confirm-geometry-title" className="font-bold text-slate-900 text-base">Xác nhận tim tuyến</h3>
            <label className="text-sm text-slate-700 flex flex-col gap-2">
              Ngày giờ hiệu lực <span className="text-xs text-slate-500">Múi giờ Asia/Ho_Chi_Minh (+07:00)</span>
              <input autoFocus type="datetime-local" disabled={draftWorkflow.busy || !!draftWorkflow.pending} value={draftWorkflow.effectiveFrom} onChange={event => { draftWorkflow.setEffectiveFrom(event.target.value); draftWorkflow.setConfirmInputError('') }} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-brand-gold" />
            </label>
            <label className="text-sm text-slate-700 flex flex-col gap-2">
              Lý do xác nhận
              <textarea rows={3} disabled={draftWorkflow.busy || !!draftWorkflow.pending} value={draftWorkflow.reason} onChange={event => { draftWorkflow.setReason(event.target.value); draftWorkflow.setConfirmInputError('') }} className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-brand-gold" />
            </label>
            {draftWorkflow.confirmInputError && <p role="alert" className="text-xs text-rose-700">{draftWorkflow.confirmInputError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" disabled={draftWorkflow.busy} onClick={draftWorkflow.cancelConfirm} className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Hủy</button>
              <button type="submit" disabled={draftWorkflow.busy || !!draftWorkflow.pending || !!draftWorkflow.conflict} className="px-4 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold disabled:opacity-50">{draftWorkflow.busy ? 'Đang xác nhận…' : 'Xác nhận'}</button>
            </div>
          </form>
        </div>
      )}
      {segmentWorkflow.reasonOpen && !isSupervisor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form role="dialog" aria-modal="true" aria-labelledby="publish-segments-title" onSubmit={event => { event.preventDefault(); void segmentWorkflow.publish() }} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <h3 id="publish-segments-title" className="font-bold text-slate-900 text-base">Publish segment set {segmentWorkflow.setId}</h3>
            <label className="text-sm text-slate-700 flex flex-col gap-2">Lý do publish
              <textarea autoFocus rows={3} disabled={segmentWorkflow.busy} value={segmentWorkflow.reason} onChange={event => segmentWorkflow.setReason(event.target.value)} className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-brand-gold" />
            </label>
            {segmentWorkflow.message && <p role="status" className="text-xs text-slate-600">{segmentWorkflow.message}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" disabled={segmentWorkflow.busy} onClick={segmentWorkflow.closeReason} className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Hủy</button>
              <button type="submit" disabled={segmentWorkflow.busy || !!segmentWorkflow.held} className="px-4 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold disabled:opacity-50">Publish</button>
            </div>
          </form>
        </div>
      )}
      {submissionWorkflow.rejectOpen && <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><form role="dialog" aria-modal="true" aria-label="Từ chối hồ sơ tuyến" onSubmit={event => { event.preventDefault(); void submissionWorkflow.reject() }} className="bg-white rounded-2xl p-6 max-w-md w-full flex flex-col gap-4"><h2 className="font-bold">Từ chối hồ sơ tuyến</h2><label className="text-xs">Lý do từ chối (bắt buộc, tối đa 2.000 ký tự)<textarea required maxLength={2000} value={submissionWorkflow.rejectReason} disabled={submissionWorkflow.busy || !!submissionWorkflow.held} onChange={event => submissionWorkflow.setRejectReason(event.target.value)} className="mt-1 border rounded-lg p-2 w-full" /></label>{(submissionWorkflow.rejectError || submissionWorkflow.error) && <p role="alert" className="text-xs text-rose-700">{submissionWorkflow.rejectError || submissionWorkflow.error}</p>}<div className="flex justify-end gap-2"><button type="button" disabled={submissionWorkflow.busy} onClick={submissionWorkflow.closeReject} className="border rounded-lg px-3 py-2 text-xs">Đóng</button><button type="submit" disabled={submissionWorkflow.busy || !!submissionWorkflow.held || !submissionWorkflow.canReject} className="border rounded-lg px-3 py-2 text-xs">Từ chối</button></div></form></div>}
      {/* MODALS */}
      <fieldset disabled={contentLocked && alignmentStatus !== 'CONFIRMED'} className="border-0 p-0 m-0 min-w-0">
      <AlignmentModals
        isImportModalOpen={!contentLocked && importState.isImportModalOpen}
        importDisabled={contentLocked || draftWorkflow.busy || !!draftWorkflow.pending}
        importStatus={importState.readMessage ? `${importState.readMessage}${missingDraftInput.length ? ` Cần nguồn được xác minh cho: ${missingDraftInput.join('; ')}.` : draftWorkflow.saveReason ? ` ${draftWorkflow.saveReason}` : ''}` : ''}
        onCloseImportModal={() => importState.setIsImportModalOpen(false)}
        importTab={importState.importTab}
        onSetImportTab={importState.setImportTab}
        onLoadPreset={importState.handleLoadPreset}
        onProcessGeoJsonFile={importState.processGeoJSONFile}
        manualCoordsText={importState.manualCoordsText}
        onSetManualCoordsText={text => { importState.setManualCoordsText(text); markLocalDraft() }}
        onProcessManualCoordinates={importState.processManualCoordinates}
        activeProject={activeProject}

        editingSegment={contentLocked ? null : segmentsState.editingSegment}
        onCloseEditSegment={() => segmentsState.setEditingSegment(null)}
        onChangeEditingSegment={segmentsState.setEditingSegment}
        onSaveEditedSegment={handleSaveEditedSegment}

        isAddSegmentModalOpen={!contentLocked && segmentsState.isAddSegmentModalOpen}
        onCloseAddSegmentModal={() => segmentsState.setIsAddSegmentModalOpen(false)}
        newSegForm={segmentsState.newSegForm}
        onChangeNewSegForm={segmentsState.setNewSegForm}
        onCreateNewSegment={event => { segmentsState.handleCreateNewSegment(event); markWidthDraft() }}
        segmentsCount={activeSegments.length}

        splitModalSegment={segmentsState.splitModalSegment}
        onCloseSplitModal={() => segmentsState.setSplitModalSegment(null)}
        customSplitKm={segmentsState.customSplitKm}
        onChangeCustomSplitKm={segmentsState.setCustomSplitKm}
        onSplitSegmentSubmit={event => { if (segmentWorkflow.enabled && isMainline) { event.preventDefault(); segmentWorkflow.split(segmentsState.customSplitKm); segmentsState.setSplitModalSegment(null) } else { handleSplitSegmentSubmit(event); markWidthDraft() } }}
      />

      {/* MODAL TẠO TUYẾN NHÁNH MỚI */}
      <AlignmentAddBranchModal
        isOpen={!contentLocked && isAddBranchModalOpen}
        onClose={() => setIsAddBranchModalOpen(false)}
        onAddBranch={input => { if (!contentLocked) handleAddBranch(input) }}
        mainlineLengthKm={importedLengthKm}
        stationOriginKm={activeProject.stationOriginKm}
        currentCoords={currentCoords}
        currentKmPoints={currentKmPoints}
      />

      </fieldset>
      {/* TOP HEADER */}
      <AlignmentHeader
        basePath={basePath}
        workflowActions={workflowActions}
        loading={geometryRead.loading || geometryRead.draftLoading || geometryRead.geometryLoading}
        statusMessage={[geometryRead.submission?.status === 'REJECTED' ? `Đã từ chối — lượt ${geometryRead.submission.currentReview?.number}: ${geometryRead.submission.currentReview?.rejectionReason}` : '', geometryRead.submission?.previousRejection ? `Quyết định trước — lượt ${geometryRead.submission.previousRejection.number}: ${geometryRead.submission.previousRejection.rejectionReason}` : '', submitted ? 'Đã trình — chờ Giám sát xác nhận' : geometryRead.submissionReady && !geometryRead.submission ? 'Chưa có hồ sơ trình' : '', geometryRead.submissionError, submissionWorkflow.error, geometryRead.context && geometryRead.context.engineeringUtmSrid == null ? 'Dự án chưa cấu hình CRS kỹ thuật; bản nhập được giữ. Chưa hỗ trợ cập nhật CRS dự án cũ tại đây.' : '', !isSupervisor && fileDraft ? draftWorkflow.saveDisabledReason : '', segmentWorkflow.enabled && (segmentWorkflow.loading ? 'Đang đọc segment set…' : segmentWorkflow.error || segmentWorkflow.message || (segmentWorkflow.snapshot ? `Segment set ${segmentWorkflow.setId}: ${segmentWorkflow.snapshot.data.status}` : 'Chưa chọn segment set server; khoảng bề rộng chưa phải phân đoạn đã lưu.')), draftWorkflow.message, draftWorkflow.preview ? `Bản đã lưu xem trước: ${draftWorkflow.preview.lengthMeters.toLocaleString()} m; ${geometryRead.readiness?.ready ? 'máy chủ cho phép xác nhận' : 'máy chủ chưa cho phép xác nhận'}.` : '', geometryRead.error || geometryRead.geometryError || geometryRead.draftError || geometryRead.profileError, !submitted && localDraftDirty && !draftContentSaved ? 'Đang chỉnh bản nháp cục bộ — chưa lưu máy chủ.' : draftContentSaved ? 'Tọa độ và thông số khớp bản nháp đã GET từ máy chủ; chưa xác nhận tuyến.' : ''].filter(Boolean).join(' ')}
        serverDraftStatus={geometryRead.draft?.data.status}
        alignmentStatus={submitted ? 'SUBMITTED' : alignmentStatus}
        activeProject={activeProject}
        selectedProjectId={selectedProjectId}
        assignedProjects={assignedProjects}
        importedLengthKm={importedLengthKm}
        branchesTotalLengthKm={branchesTotalLengthKm}
        totalProjectLengthKm={totalProjectLengthKm}
        branchesCount={branchesCount}
        currentCoords={currentCoords}
        isSupervisor={isSupervisor}
        onSwitchProject={handleSwitchProject}
        onOpenImportModal={() => { if (!contentLocked) importState.setIsImportModalOpen(true) }}
        onClearMainline={() => { if (!contentLocked) handleClearMainline() }}
        onSubmitAlignment={handleSubmitAlignment}
        onLockAlignment={draftWorkflow.openConfirm}
        commandBusy={draftWorkflow.busy || submissionWorkflow.busy}
        saveDisabledReason={(submissionWorkflow.held ? 'Yêu cầu trước đang chờ đối chiếu. Nếu máy chủ đã từ chối rõ ràng, hãy chủ động đọc lại/sửa yêu cầu trước khi sửa tiếp.' : contentLocked ? 'Hồ sơ đã khóa hoặc chưa đọc được lookup; không được sửa.' : '') || draftWorkflow.saveDisabledReason || (draftWorkflow.pending || draftWorkflow.conflict ? 'Cần đối chiếu yêu cầu/phiên bản cũ.' : '')}
        confirmDisabledReason={draftWorkflow.confirmReason || (draftWorkflow.pending || draftWorkflow.conflict ? 'Cần đối chiếu yêu cầu/phiên bản cũ.' : '')}
      />

      {/* WORKSPACE GRID: MAP + SIDEBAR */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <AlignmentMap
          mapContainerRef={mapState.mapContainerRef}
          mapRef={mapState.mapRef}
          mapLayer={mapState.mapLayer}
          onSetMapLayer={mapState.setMapLayer}
          showSlabsAndJoints={mapState.showSlabsAndJoints}
          onToggleSlabsAndJoints={() => {
            const next = !mapState.showSlabsAndJoints
            mapState.setShowSlabsAndJoints(next)
            showToast(next ? 'Đã BẬT lớp Tấm bê tông, Khe co giãn & 2 Mép đường' : 'Đã TẮT lớp Tấm & Khe BTXM')
          }}
          cursorPos={mapState.cursorPos}
          rulerActive={mapState.rulerActive}
          onToggleRuler={() => {
            mapState.setRulerActive(!mapState.rulerActive)
            mapState.setRulerPoints([])
            showToast(mapState.rulerActive ? 'Đã tắt thước đo.' : 'Bật thước đo: Bấm chọn 2 điểm trên bản đồ để đo cự ly.')
          }}
          onSelectAllRoute={handleSelectAllRoute}
          selectedSegmentId={segmentsState.selectedSegmentId}
          segments={segmentRows || pavementWorkflow.previewBase?.segments || segmentsState.segments}
          importedLengthKm={importedLengthKm}
          slabLengthM={slabLengthM}
          slabThicknessCm={slabThicknessCm}
          pavementPreview={mapState.pavementPreview}
          pavementStatus={pavementWorkflow.display?.label}
          contractionSpacingM={contractionSpacingM}
          expansionSpacingM={expansionSpacingM}
          expansionGapMm={expansionGapMm}
          branches={branches}
          selectedTargetType={selectedTargetType}
          currentBranch={currentBranch}
          // Chế độ chấm điểm trên bản đồ
          isPickingOnMap={mapState.isPickingOnMap}
          pickedCoords={mapState.pickedCoords}
          detectedDivergeStation={mapState.detectedDivergeStation}
          onRemoveLastPickedCoord={mapState.removeLastPickedCoord}
          onClearAllPickedCoords={mapState.clearAllPickedCoords}
          onFinishPickingCoords={mapState.finishPickingCoords}
          onCancelPickingCoords={mapState.cancelPickingCoords}
        />

        <AlignmentSidebar
          segmentCount={segmentCount}
          segmentCountMessage={segmentCountMessage}
          stripWidthMeters={stripWidthMeters}
          onSetStripWidthMeters={setStripWidthMeters}
          rightTab={rightTab}
          onSetRightTab={setRightTab}
          segments={rightTab === 'SLABS' ? pavementWorkflow.display?.segments || activeSegments : displayedSegments}
          selectedSegmentId={segmentsState.selectedSegmentId}
          onSelectSegment={segmentsState.handleSelectSegment}
          splitDistance={activeSplitDistance}
          onSetSplitDistance={handleSetSplitDistance}
          splitSortOrder={segmentsState.splitSortOrder}
          onSetSplitSortOrder={segmentsState.setSplitSortOrder}
          onApplyAutoSplit={() => { if (segmentWorkflow.enabled && isMainline) void segmentWorkflow.loadPreview(); else { handleApplyAutoSplit(); markWidthDraft() } }}
          onOpenAddSegmentModal={() => segmentsState.setIsAddSegmentModalOpen(true)}
          onSelectAllRoute={handleSelectAllRoute}
          currentCoords={currentCoords}
          currentKmPoints={currentKmPoints}
          importedLengthKm={activeLengthKm}
          slabLengthM={slabLengthM}
          onSetSlabLengthM={value => { setSlabLengthM(value); markLocalDraft() }}
          slabThicknessCm={slabThicknessCm}
          onSetSlabThicknessCm={value => { setSlabThicknessCm(value); markLocalDraft() }}
          syncJointWithSlab={syncJointWithSlab}
          onSetSyncJointWithSlab={setSyncJointWithSlab}
          contractionSpacingM={contractionSpacingM}
          onSetContractionSpacingM={value => { setContractionSpacingM(value); markLocalDraft() }}
          expansionSpacingM={expansionSpacingM}
          onSetExpansionSpacingM={value => { setExpansionSpacingM(value); markLocalDraft() }}
          expansionGapMm={expansionGapMm}
          onSetExpansionGapMm={value => { setExpansionGapMm(value); markLocalDraft() }}
          onOpenSplitModal={(seg) => {
            segmentsState.setSplitModalSegment(seg)
            segmentsState.setCustomSplitKm((seg.startKm + seg.endKm) / 2)
          }}
          onEditSegment={(seg) => segmentsState.setEditingSegment({ ...seg })}
          onDeleteSegment={id => { handleDeleteSegment(id); markWidthDraft() }}
          onSnapSegment={id => { handleSnapSegment(id); markWidthDraft() }}
          onUpdateSegmentWidth={(id, width) => { handleUpdateSegmentWidth(id, width); markWidthDraft() }}
          onUpdateAllWidths={width => { handleUpdateAllWidths(width); markWidthDraft() }}
          slabs={segmentsState.slabs}
          showToast={message => showToast(`${message} — bản chỉnh cục bộ, chưa lưu máy chủ.`)}
          branches={branches}
          selectedTargetType={selectedTargetType}
          onSelectTargetType={setSelectedTargetType}
          onOpenAddBranchModal={() => setIsAddBranchModalOpen(true)}
          onDeleteBranch={handleDeleteBranch}
          onClearAllSegments={() => { segmentsState.handleClearAllSegments(); markWidthDraft() }}
          onClearMainline={() => { if (!contentLocked) handleClearMainline() }}
          onOpenImportModal={() => { if (!contentLocked) importState.setIsImportModalOpen(true) }}
          mainlineLengthKm={importedLengthKm}
          alignmentStatus={submitted ? 'SUBMITTED' : alignmentStatus}
          isSupervisor={isSupervisor}
          segmentPlanning={segmentWorkflow.enabled && isMainline && segmentWorkflow.editable}
          draftContentSaved={draftContentSaved && isMainline}
          segmentSetStatus={isMainline ? segmentWorkflow.preview ? 'PREVIEW' : segmentWorkflow.snapshot?.data.status : undefined}
          pavementWorkflow={pavementWorkflow}
          editingDisabled={submitted || (contentLocked && alignmentStatus !== 'CONFIRMED') || pavementWorkflow.busy || draftWorkflow.busy || !!draftWorkflow.pending || draftWorkflow.conflict}
        />
      </section>
    </div>
  )
}

export default AlignmentSegments


