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
    alignmentStatus,
    handleSwitchProject,
    handleSubmitAlignment,
    handleLockAlignment,
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
    <button type="button" disabled={geometryRead.loading || draftWorkflow.busy} onClick={() => { geometryRead.retry(); pavementWorkflow.retry() }} className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs border border-slate-200">Tải lại</button>
    {geometryRead.draft && <button type="button" disabled={draftWorkflow.busy || !!draftWorkflow.pending || draftWorkflow.conflict} onClick={() => { void draftWorkflow.loadPreview() }} className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs border border-slate-200">Xem trước bản đã lưu</button>}
    {draftWorkflow.hydrateReadError && <button type="button" disabled={draftWorkflow.busy || geometryRead.draftLoading} onClick={draftWorkflow.retryHydrate} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Đọc lại bản đã lưu</button>}
    {draftWorkflow.pending && <button type="button" disabled={draftWorkflow.busy || draftWorkflow.conflict} onClick={() => { void draftWorkflow.retryCommand() }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">{draftWorkflow.pending.receipt ? 'Đọc lại kết quả' : 'Gửi lại đúng yêu cầu'}</button>}
    {draftWorkflow.pending?.rejected && <button type="button" disabled={draftWorkflow.busy} onClick={draftWorkflow.reviseRejected} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Sửa bản nhập</button>}
    {draftWorkflow.conflict && <>
      <button type="button" disabled={draftWorkflow.busy} onClick={() => { void draftWorkflow.reviewConflict() }} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Đọc hồ sơ đối chiếu</button>
      <button type="button" disabled={!draftWorkflow.freshVersion || draftWorkflow.busy || geometryRead.draftLoading || !geometryRead.context || draftWorkflow.pending?.duplicate} onClick={draftWorkflow.acceptVersion} className="h-8 px-3 rounded-lg border border-slate-200 text-xs">Giữ bản nhập, dùng phiên bản vừa đọc</button>
    </>}
    {geometryRead.draftId && !isSupervisor && <a className="text-xs underline" href={`/sup/projects/${selectedProjectId}/alignment?draftId=${encodeURIComponent(geometryRead.draftId)}${pavementWorkflow.layoutId ? `&layoutId=${encodeURIComponent(pavementWorkflow.layoutId)}` : ''}${geometryRead.roadReference && geometryRead.versionReference ? `&roadSectionId=${encodeURIComponent(geometryRead.roadReference)}&routeVersionId=${encodeURIComponent(geometryRead.versionReference)}` : ''}`}>Hồ sơ cho Giám sát</a>}
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
      {/* MODALS */}
      <AlignmentModals
        isImportModalOpen={importState.isImportModalOpen}
        importDisabled={draftWorkflow.busy || !!draftWorkflow.pending}
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

        editingSegment={segmentsState.editingSegment}
        onCloseEditSegment={() => segmentsState.setEditingSegment(null)}
        onChangeEditingSegment={segmentsState.setEditingSegment}
        onSaveEditedSegment={handleSaveEditedSegment}

        isAddSegmentModalOpen={segmentsState.isAddSegmentModalOpen}
        onCloseAddSegmentModal={() => segmentsState.setIsAddSegmentModalOpen(false)}
        newSegForm={segmentsState.newSegForm}
        onChangeNewSegForm={segmentsState.setNewSegForm}
        onCreateNewSegment={event => { segmentsState.handleCreateNewSegment(event); markWidthDraft() }}
        segmentsCount={activeSegments.length}

        splitModalSegment={segmentsState.splitModalSegment}
        onCloseSplitModal={() => segmentsState.setSplitModalSegment(null)}
        customSplitKm={segmentsState.customSplitKm}
        onChangeCustomSplitKm={segmentsState.setCustomSplitKm}
        onSplitSegmentSubmit={event => { handleSplitSegmentSubmit(event); markWidthDraft() }}
      />

      {/* MODAL TẠO TUYẾN NHÁNH MỚI */}
      <AlignmentAddBranchModal
        isOpen={isAddBranchModalOpen}
        onClose={() => setIsAddBranchModalOpen(false)}
        onAddBranch={handleAddBranch}
        mainlineLengthKm={importedLengthKm}
        stationOriginKm={activeProject.stationOriginKm}
        currentCoords={currentCoords}
        currentKmPoints={currentKmPoints}
      />

      {/* TOP HEADER */}
      <AlignmentHeader
        basePath={basePath}
        workflowActions={workflowActions}
        loading={geometryRead.loading || geometryRead.draftLoading || geometryRead.geometryLoading}
        statusMessage={[draftWorkflow.message, draftWorkflow.preview ? `Bản đã lưu xem trước: ${draftWorkflow.preview.lengthMeters.toLocaleString()} m; ${geometryRead.readiness?.ready ? 'máy chủ cho phép xác nhận' : 'máy chủ chưa cho phép xác nhận'}.` : '', geometryRead.error || geometryRead.geometryError || geometryRead.draftError || geometryRead.profileError, localDraftDirty ? 'Đang chỉnh bản nháp cục bộ — chưa lưu máy chủ.' : ''].filter(Boolean).join(' ')}
        serverDraftStatus={geometryRead.draft?.data.status}
        alignmentStatus={alignmentStatus}
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
        onOpenImportModal={() => importState.setIsImportModalOpen(true)}
        onClearMainline={handleClearMainline}
        onSubmitAlignment={handleSubmitAlignment}
        onLockAlignment={handleLockAlignment}
        commandBusy={draftWorkflow.busy}
        saveDisabledReason={draftWorkflow.saveDisabledReason || (draftWorkflow.pending || draftWorkflow.conflict ? 'Cần đối chiếu yêu cầu/phiên bản cũ.' : '')}
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
          segments={pavementWorkflow.previewBase?.segments || segmentsState.segments}
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
          stripWidthMeters={stripWidthMeters}
          onSetStripWidthMeters={setStripWidthMeters}
          rightTab={rightTab}
          onSetRightTab={setRightTab}
          segments={rightTab === 'SLABS' ? pavementWorkflow.display?.segments || activeSegments : activeSegments}
          selectedSegmentId={segmentsState.selectedSegmentId}
          onSelectSegment={segmentsState.handleSelectSegment}
          splitDistance={activeSplitDistance}
          onSetSplitDistance={handleSetSplitDistance}
          splitSortOrder={segmentsState.splitSortOrder}
          onSetSplitSortOrder={segmentsState.setSplitSortOrder}
          onApplyAutoSplit={() => { handleApplyAutoSplit(); markWidthDraft() }}
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
            segmentsState.setCustomSplitKm(parseFloat(((seg.startKm + seg.endKm) / 2).toFixed(3)))
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
          onClearMainline={handleClearMainline}
          onOpenImportModal={() => importState.setIsImportModalOpen(true)}
          mainlineLengthKm={importedLengthKm}
          alignmentStatus={alignmentStatus}
          isSupervisor={isSupervisor}
          pavementWorkflow={pavementWorkflow}
          editingDisabled={pavementWorkflow.busy || draftWorkflow.busy || !!draftWorkflow.pending || draftWorkflow.conflict}
        />
      </section>
    </div>
  )
}

export default AlignmentSegments


