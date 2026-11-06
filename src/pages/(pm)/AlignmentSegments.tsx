import React, { useState } from 'react'
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

  const [draftReference, setDraftReference] = useState('')

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
        {geometryRead.context?.roadSections.map(road => <button key={road.roadSectionId} type="button" disabled={geometryRead.geometryLoading || !road.currentVersionId} onClick={() => { void geometryRead.read(road.roadSectionId, road.currentVersionId) }} className="border rounded-lg px-3 py-2">Đọc tuyến {road.name || road.code}</button>)}
        {geometryRead.geometryLoading && <p role="status">Đang đọc geometry đã chọn...</p>}
        {geometryRead.geometry && <p>Phiên bản máy chủ: {geometryRead.geometry.routeVersionId}; metadata {geometryRead.geometry.metadataStatus || 'Chưa đủ dữ liệu'}; {Number.isFinite(geometryRead.geometry.lengthMeters) ? `${geometryRead.geometry.lengthMeters} m` : 'Chưa có chiều dài'}</p>}
      </section>
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
        <p>Phạm vi tuyến phải được đọc từ máy chủ. Chưa đủ context/CRS để lưu hoặc xác nhận tuyến; không dùng dữ liệu cục bộ làm hồ sơ chính thức.</p>
        {geometryRead.profileError && <p role="alert" className="text-rose-700">{geometryRead.profileError}</p>}
        <p>Hồ sơ CRS: {geometryRead.profilesLoading ? 'Đang tải...' : geometryRead.profileError ? 'Chưa tải được' : geometryRead.profiles.map(profile => `${profile.code || profile.id} (${profile.status || 'Chưa xác định'})`).join(', ') || 'Chưa có hồ sơ CRS'}</p>
        <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); geometryRead.openDraft(draftReference.trim()) }}>
          <label htmlFor="geometry-draft-reference">ID bản nháp từ máy chủ</label>
          <input id="geometry-draft-reference" value={draftReference} onChange={e => setDraftReference(e.target.value)} className="border rounded-lg px-3 py-2" />
          <button type="submit" disabled={!draftReference.trim() || geometryRead.draftLoading} className="border rounded-lg px-3 py-2">Mở bản nháp</button>
        </form>
        {geometryRead.draftLoading && <p role="status">Đang đọc bản nháp và readiness...</p>}
        {geometryRead.draftError && <p role="alert" className="text-rose-700">{geometryRead.draftError}</p>}
        {geometryRead.draft && <p>Bản nháp {geometryRead.draft.data.id}: {geometryRead.draft.data.status}; phiên bản {geometryRead.draft.data.version || 'Chưa có'}; CRS nguồn {geometryRead.draft.data.sourceCrs}. Chưa phải tuyến đã xác nhận.</p>}
        {geometryRead.readiness && <p>Readiness: {geometryRead.readiness.ready ? 'Đủ điều kiện theo kiểm tra máy chủ' : 'Chưa đủ điều kiện'}; {geometryRead.readiness.missingFields.join(', ')} {geometryRead.readiness.errors.join(', ')}</p>}
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


