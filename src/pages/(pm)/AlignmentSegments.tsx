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
    draftWorkflow,
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


  const fieldClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50'
  const draftControls = <div className="space-y-3 text-xs border-t border-slate-200 pt-3">
    <fieldset disabled={draftWorkflow.busy || !!draftWorkflow.pending} className="space-y-3 min-w-0">
      <label className="block">Tuyến đường
        <select aria-label="Tuyến đường" className={fieldClass} value={draftWorkflow.form.sectionId} onChange={e => draftWorkflow.setForm(f => ({ ...f, sectionId: e.target.value }))}>
          <option value="">Chọn tuyến từ máy chủ</option>
          {geometryRead.context?.roadSections.map(road => <option key={road.roadSectionId} value={road.roadSectionId}>{road.name || road.code}</option>)}
        </select>
      </label>
      <label className="block">Hồ sơ hệ tọa độ nguồn
        <select aria-label="Hồ sơ hệ tọa độ nguồn" className={fieldClass} value={draftWorkflow.form.profileId} onChange={e => draftWorkflow.setForm(f => ({ ...f, profileId: e.target.value }))}>
          <option value="">Chọn hồ sơ CRS từ máy chủ</option>
          {geometryRead.profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.code || 'Hồ sơ chưa có tên'} – {profile.definition?.sourceSrid}</option>)}
        </select>
      </label>
      <p>Tọa độ được giữ theo trục EN, đơn vị mét của hồ sơ phù hợp engineering CRS; không tự chuyển datum hoặc trục. Preview bản đồ không chứng nhận độ chính xác kỹ thuật.</p>
      <div className="grid grid-cols-2 gap-3">
        <label>Lý trình gốc (m)<input aria-label="Lý trình gốc (m)" type="number" className={fieldClass} value={draftWorkflow.form.origin} onChange={e => draftWorkflow.setForm(f => ({ ...f, origin: e.target.value }))} /></label>
        <label>Bề rộng khảo sát (m)<input aria-label="Bề rộng khảo sát (m)" type="number" className={fieldClass} value={draftWorkflow.form.surveyWidth} onChange={e => draftWorkflow.setForm(f => ({ ...f, surveyWidth: e.target.value }))} /></label>
      </div>
      <label className="block">Bề rộng theo khoảng: mỗi dòng Từ (m), Đến (m), Rộng (m)<textarea aria-label="Bề rộng theo khoảng" rows={3} className={fieldClass} value={draftWorkflow.form.widths} onChange={e => draftWorkflow.setForm(f => ({ ...f, widths: e.target.value }))} /></label>
      <label className="block">Lý do thay đổi<textarea aria-label="Lý do thay đổi" className={fieldClass} value={draftWorkflow.form.reason} onChange={e => draftWorkflow.setForm(f => ({ ...f, reason: e.target.value }))} /></label>
    </fieldset>
    {draftWorkflow.saveReason && <p role="status" className="text-slate-600">{draftWorkflow.saveReason}</p>}
    <button type="button" disabled={!!draftWorkflow.saveReason || draftWorkflow.busy || !!draftWorkflow.pending || draftWorkflow.conflict} onClick={() => { void draftWorkflow.save() }} className="px-3 py-2 rounded-lg bg-brand-gold text-white disabled:opacity-50">Lưu bản nháp</button>
  </div>

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
          <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* MODALS */}
      <AlignmentModals
        isImportModalOpen={importState.isImportModalOpen}
        draftControls={draftControls}
        importDisabled={draftWorkflow.busy || !!draftWorkflow.pending}
        onCloseImportModal={() => importState.setIsImportModalOpen(false)}
        importTab={importState.importTab}
        onSetImportTab={importState.setImportTab}
        onLoadPreset={importState.handleLoadPreset}
        onProcessGeoJsonFile={importState.processGeoJSONFile}
        manualCoordsText={importState.manualCoordsText}
        onSetManualCoordsText={importState.setManualCoordsText}
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
        onCreateNewSegment={segmentsState.handleCreateNewSegment}
        segmentsCount={activeSegments.length}

        splitModalSegment={segmentsState.splitModalSegment}
        onCloseSplitModal={() => segmentsState.setSplitModalSegment(null)}
        customSplitKm={segmentsState.customSplitKm}
        onChangeCustomSplitKm={segmentsState.setCustomSplitKm}
        onSplitSegmentSubmit={handleSplitSegmentSubmit}
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
      <section className="flex flex-wrap items-center gap-3 text-xs">
        <button type="button" onClick={geometryRead.retry} disabled={geometryRead.loading} className="border rounded-lg px-3 py-2">Tải lại từ máy chủ</button>
        {geometryRead.loading && <p role="status">Đang tải danh sách dự án...</p>}
        {geometryRead.error && <p role="alert" className="text-rose-700">{geometryRead.error}</p>}
        {!geometryRead.loading && !geometryRead.error && geometryRead.projects.length === 0 && <p>Không có dự án trong phạm vi tài khoản.</p>}
        {geometryRead.geometryError && <p role="alert" className="text-rose-700">{geometryRead.geometryError}</p>}
        {geometryRead.context?.roadSections.map(road => <button key={road.roadSectionId} type="button" disabled={geometryRead.geometryLoading || !road.currentVersionId} onClick={() => { geometryRead.openGeometry(road.roadSectionId, road.currentVersionId) }} className="border rounded-lg px-3 py-2">Đọc tuyến {road.name || road.code}</button>)}
        {geometryRead.geometryLoading && <p role="status">Đang đọc geometry đã chọn...</p>}
        {geometryRead.geometry && <p>Hình học từ máy chủ: {Number.isFinite(geometryRead.geometry.lengthMeters) ? `${geometryRead.geometry.lengthMeters} m` : 'Chưa có chiều dài'}</p>}
        {geometryRead.geometry && !geometryRead.geometry.wgs84Centerline && <p>Chưa có hình học WGS84 từ máy chủ để vẽ tuyến lên bản đồ.</p>}
      </section>
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
        <p>Lưu bản nháp, xem trước và xác nhận là các bước riêng; trạng thái luôn đọc từ máy chủ.</p>
        {geometryRead.profileError && <p role="alert" className="text-rose-700">{geometryRead.profileError}</p>}
        {draftWorkflow.message && <p role="status">{draftWorkflow.message}</p>}
        {draftWorkflow.hydrateReadError && <button type="button" disabled={draftWorkflow.busy || geometryRead.draftLoading} onClick={draftWorkflow.retryHydrate} className="border rounded-lg px-3 py-2">Đọc lại bản nháp đã lưu</button>}
        {draftWorkflow.pending && <div className="space-y-2">
          <p>{draftWorkflow.pending.receipt ? 'Lệnh đã được tiếp nhận; cần đọc lại kết quả.' : 'Yêu cầu trước cần được đối chiếu trước khi gửi nội dung mới.'}</p>
          <button type="button" disabled={draftWorkflow.busy || draftWorkflow.conflict} onClick={() => { void draftWorkflow.retryCommand() }} className="border rounded-lg px-3 py-2">{draftWorkflow.pending.receipt ? 'Đọc lại kết quả' : 'Gửi lại đúng yêu cầu'}</button>
          {draftWorkflow.pending.rejected && <button type="button" disabled={draftWorkflow.busy} onClick={draftWorkflow.reviseRejected} className="ml-2 border rounded-lg px-3 py-2">Sửa đầu vào sau lỗi từ chối</button>}
        </div>}
        {draftWorkflow.conflict && <div>
          <p>Bản nhập được giữ nguyên. Hãy đọc lại hồ sơ và quyết định trước khi tiếp tục.</p>
          <button type="button" onClick={() => { void draftWorkflow.reviewConflict() }} disabled={draftWorkflow.busy} className="border rounded-lg px-3 py-2">Đọc phiên bản mới</button>
          <button type="button" disabled={!draftWorkflow.freshVersion || draftWorkflow.busy || geometryRead.draftLoading || !geometryRead.context || draftWorkflow.pending?.duplicate} onClick={draftWorkflow.acceptVersion} className="ml-2 border rounded-lg px-3 py-2">Giữ bản nhập và dùng phiên bản mới</button>
        </div>}
        {geometryRead.draftId && <a className="underline" href={`/sup/projects/${selectedProjectId}/alignment?draftId=${encodeURIComponent(geometryRead.draftId)}${geometryRead.roadReference && geometryRead.versionReference ? `&roadSectionId=${encodeURIComponent(geometryRead.roadReference)}&routeVersionId=${encodeURIComponent(geometryRead.versionReference)}` : ''}`}>Liên kết hồ sơ cho Giám sát</a>}
        {!isSupervisor && geometryRead.draft && !draftWorkflow.pending && <button type="button" disabled={draftWorkflow.busy} className="border rounded-lg px-3 py-2" onClick={() => geometryRead.openDraft('')}>Tạo bản nháp khác</button>}
        {geometryRead.draftLoading && <p role="status">Đang đọc bản nháp và readiness...</p>}
        {geometryRead.draftError && <p role="alert" className="text-rose-700">{geometryRead.draftError}</p>}
        {geometryRead.draft && <p>Hồ sơ tuyến {geometryRead.draft.data.roadName || geometryRead.draft.data.roadCode || ''}: {geometryRead.draft.data.status === 'CONFIRMED' ? 'Đã xác nhận theo máy chủ' : 'Bản nháp chưa xác nhận'}.</p>}
        {geometryRead.readiness && <p>Readiness: {geometryRead.readiness.ready ? 'Đủ điều kiện theo kiểm tra máy chủ' : 'Chưa đủ điều kiện'}; {geometryRead.readiness.missingFields.join(', ')} {geometryRead.readiness.errors.join(', ')}</p>}
        <button type="button" disabled={!geometryRead.draft || draftWorkflow.busy || !!draftWorkflow.pending || draftWorkflow.conflict} onClick={() => { void draftWorkflow.loadPreview() }} className="border rounded-lg px-3 py-2">Xem trước và kiểm tra điều kiện</button>
        {draftWorkflow.preview && <p>Preview máy chủ: {draftWorkflow.preview.lengthMeters} m; {(draftWorkflow.preview.warnings || []).join(', ')}. Chưa phải xác nhận tuyến.</p>}
        {isSupervisor && <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label>Ngày hiệu lực xác nhận<input aria-label="Ngày hiệu lực xác nhận" type="datetime-local" className={fieldClass} value={draftWorkflow.effectiveFrom} onChange={e => draftWorkflow.setEffectiveFrom(e.target.value)} /></label>
          <label>Lý do xác nhận<input aria-label="Lý do xác nhận" className={fieldClass} value={draftWorkflow.reason} onChange={e => draftWorkflow.setReason(e.target.value)} /></label>
          {draftWorkflow.confirmReason && <p className="text-slate-600">{draftWorkflow.confirmReason}</p>}
        </div>}
        <p>Phân đoạn/pavement chưa được nối khi vòng nhập và xác nhận chưa đủ điều kiện.</p>
      </section>
      <AlignmentHeader
        basePath={basePath}
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
        saveDisabledReason={draftWorkflow.saveReason || (draftWorkflow.pending || draftWorkflow.conflict ? 'Cần đối chiếu yêu cầu/phiên bản cũ.' : '')}
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
          segments={segmentsState.segments}
          importedLengthKm={importedLengthKm}
          slabLengthM={slabLengthM}
          slabThicknessCm={slabThicknessCm}
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

        <fieldset disabled className="xl:col-span-4 min-w-0 border-0 p-0 m-0" title="Phân đoạn/pavement chờ vòng xác nhận và đầu vào chính thức">
        <AlignmentSidebar
          rightTab={rightTab}
          onSetRightTab={setRightTab}
          segments={activeSegments}
          selectedSegmentId={segmentsState.selectedSegmentId}
          onSelectSegment={segmentsState.handleSelectSegment}
          splitDistance={activeSplitDistance}
          onSetSplitDistance={handleSetSplitDistance}
          splitSortOrder={segmentsState.splitSortOrder}
          onSetSplitSortOrder={segmentsState.setSplitSortOrder}
          onApplyAutoSplit={handleApplyAutoSplit}
          onOpenAddSegmentModal={() => {}}
          onSelectAllRoute={handleSelectAllRoute}
          currentCoords={currentCoords}
          currentKmPoints={currentKmPoints}
          importedLengthKm={activeLengthKm}
          slabLengthM={slabLengthM}
          onSetSlabLengthM={setSlabLengthM}
          slabThicknessCm={slabThicknessCm}
          onSetSlabThicknessCm={setSlabThicknessCm}
          syncJointWithSlab={syncJointWithSlab}
          onSetSyncJointWithSlab={setSyncJointWithSlab}
          contractionSpacingM={contractionSpacingM}
          onSetContractionSpacingM={setContractionSpacingM}
          expansionSpacingM={expansionSpacingM}
          onSetExpansionSpacingM={setExpansionSpacingM}
          expansionGapMm={expansionGapMm}
          onSetExpansionGapMm={setExpansionGapMm}
          onOpenSplitModal={(seg) => {
            segmentsState.setSplitModalSegment(seg)
            segmentsState.setCustomSplitKm(parseFloat(((seg.startKm + seg.endKm) / 2).toFixed(3)))
          }}
          onEditSegment={(seg) => segmentsState.setEditingSegment({ ...seg })}
          onDeleteSegment={handleDeleteSegment}
          onSnapSegment={handleSnapSegment}
          onUpdateSegmentWidth={handleUpdateSegmentWidth}
          onUpdateAllWidths={handleUpdateAllWidths}
          slabs={segmentsState.slabs}
          showToast={showToast}
          branches={branches}
          selectedTargetType={selectedTargetType}
          onSelectTargetType={setSelectedTargetType}
          onOpenAddBranchModal={() => setIsAddBranchModalOpen(true)}
          onDeleteBranch={handleDeleteBranch}
          onClearAllSegments={segmentsState.handleClearAllSegments}
          onClearMainline={handleClearMainline}
          onOpenImportModal={() => importState.setIsImportModalOpen(true)}
          mainlineLengthKm={importedLengthKm}
          alignmentStatus={alignmentStatus}
          isSupervisor={isSupervisor}
        />
        </fieldset>
      </section>
    </div>
  )
}

export default AlignmentSegments


