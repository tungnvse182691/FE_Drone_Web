import React from 'react'
import { SegmentItem, AssignedProjectOption } from './types'
import { AlignmentImportModal } from './AlignmentImportModal'
import { AlignmentEditModal } from './AlignmentEditModal'
import { AlignmentAddModal } from './AlignmentAddModal'
import { AlignmentSplitModal } from './AlignmentSplitModal'

export const SEGMENT_COLORS = [
  '#0284C7', // Sky Blue
  '#D97706', // Amber
  '#059669', // Emerald Green
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0D9488', // Teal
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#2563EB'  // Blue
]

export interface AlignmentModalsProps {
  // Import Modal
  isImportModalOpen: boolean
  onCloseImportModal: () => void
  importTab: 'FILE' | 'MANUAL'
  onSetImportTab: (tab: 'FILE' | 'MANUAL') => void
  onLoadPreset: (name: string, dist: number) => void
  onProcessGeoJsonFile: (file: File) => void
  manualCoordsText: string
  onSetManualCoordsText: (text: string) => void
  onProcessManualCoordinates: (text: string) => void
  activeProject: AssignedProjectOption

  // Edit Segment Modal
  editingSegment: SegmentItem | null
  onCloseEditSegment: () => void
  onChangeEditingSegment: (seg: SegmentItem) => void
  onSaveEditedSegment: (e: React.FormEvent) => void

  // Add Segment Modal
  isAddSegmentModalOpen: boolean
  onCloseAddSegmentModal: () => void
  newSegForm: {
    code: string
    startKm: number
    endKm: number
    roadWidthM: number
    laneCount: number
    surfaceMaterial: string
    color: string
  }
  onChangeNewSegForm: (form: any) => void
  onCreateNewSegment: (e: React.FormEvent) => void
  segmentsCount: number

  // Split Segment Modal
  splitModalSegment: SegmentItem | null
  onCloseSplitModal: () => void
  customSplitKm: number
  onChangeCustomSplitKm: (km: number) => void
  onSplitSegmentSubmit: (e: React.FormEvent) => void
}

export const AlignmentModals: React.FC<AlignmentModalsProps> = ({
  isImportModalOpen,
  onCloseImportModal,
  importTab,
  onSetImportTab,
  onLoadPreset,
  onProcessGeoJsonFile,
  manualCoordsText,
  onSetManualCoordsText,
  onProcessManualCoordinates,
  activeProject,

  editingSegment,
  onCloseEditSegment,
  onChangeEditingSegment,
  onSaveEditedSegment,

  isAddSegmentModalOpen,
  onCloseAddSegmentModal,
  newSegForm,
  onChangeNewSegForm,
  onCreateNewSegment,
  segmentsCount,

  splitModalSegment,
  onCloseSplitModal,
  customSplitKm,
  onChangeCustomSplitKm,
  onSplitSegmentSubmit
}) => {
  return (
    <>
      {/* 1. Modal nạp file GeoJSON / KML / Chuỗi tọa độ thủ công (WF-02) */}
      <AlignmentImportModal
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        importTab={importTab}
        onSetImportTab={onSetImportTab}
        onLoadPreset={onLoadPreset}
        onProcessGeoJsonFile={onProcessGeoJsonFile}
        manualCoordsText={manualCoordsText}
        onSetManualCoordsText={onSetManualCoordsText}
        onProcessManualCoordinates={onProcessManualCoordinates}
        activeProject={activeProject}
      />

      {/* 2. Modal chỉnh sửa phân đoạn (Edit Segment Modal) */}
      <AlignmentEditModal
        segment={editingSegment}
        colors={SEGMENT_COLORS}
        onClose={onCloseEditSegment}
        onChangeSegment={onChangeEditingSegment}
        onSave={onSaveEditedSegment}
      />

      {/* 3. Modal thêm mới phân đoạn (Add Segment Modal) */}
      <AlignmentAddModal
        isOpen={isAddSegmentModalOpen}
        colors={SEGMENT_COLORS}
        segmentsCount={segmentsCount}
        newSegForm={newSegForm}
        onClose={onCloseAddSegmentModal}
        onChangeNewSegForm={onChangeNewSegForm}
        onCreateNewSegment={onCreateNewSegment}
      />

      {/* 4. Modal tách phân đoạn (Split Segment Modal) */}
      <AlignmentSplitModal
        segment={splitModalSegment}
        customSplitKm={customSplitKm}
        onClose={onCloseSplitModal}
        onChangeCustomSplitKm={onChangeCustomSplitKm}
        onSubmit={onSplitSegmentSubmit}
      />
    </>
  )
}
