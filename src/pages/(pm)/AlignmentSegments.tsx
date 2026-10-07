import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { alignmentService } from '../../api/services'

import { AlignmentHeader } from './alignment/AlignmentHeader'
import { AlignmentMap } from './alignment/AlignmentMap'
import { AlignmentSidebar } from './alignment/AlignmentSidebar'
import { AlignmentModals } from './alignment/AlignmentModals'
import { useAlignmentState } from './alignment/useAlignmentState'
import { SEGMENT_COLORS, PM_ASSIGNED_PROJECTS } from './alignment/data'

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
    selectedProjectId,
    activeProject,
    alignmentStatus,
    handleSwitchProject,
    handleSubmitAlignment,
    handleLockAlignment,
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
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-4 h-4" />
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
      <AlignmentHeader
        basePath={basePath}
        alignmentStatus={alignmentStatus}
        activeProject={activeProject}
        selectedProjectId={selectedProjectId}
        assignedProjects={PM_ASSIGNED_PROJECTS}
        importedLengthKm={importedLengthKm}
        isSupervisor={isSupervisor}
        onSwitchProject={handleSwitchProject}
        onOpenImportModal={() => importState.setIsImportModalOpen(true)}
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
          mainlineLengthKm={importedLengthKm}
        />
      </section>
    </div>
  )
}

export default AlignmentSegments


