import React from 'react'
import {
  SplitSquareVertical,
  Sliders,
  Grid
} from 'lucide-react'
import { SegmentItem, SlabItem, BranchItem } from './types'
import { SidebarSegmentsTab } from './SidebarSegmentsTab'
import { SidebarWidthProfileTab } from './SidebarWidthProfileTab'
import { SidebarSlabsTab } from './SidebarSlabsTab'
import { SidebarFooterKpis } from './SidebarFooterKpis'
import type { usePavementWorkflow } from './usePavementWorkflow'

export interface AlignmentSidebarProps {
  segmentPlanning?: boolean
  segmentSetStatus?: string
  pavementWorkflow?: ReturnType<typeof usePavementWorkflow>
  rightTab: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS'
  onSetRightTab: (tab: 'SEGMENTS' | 'WIDTH_PROFILE' | 'SLABS') => void
  segments: SegmentItem[]
  selectedSegmentId: string | null
  onSelectSegment: (seg: SegmentItem) => void
  splitDistance: number
  onSetSplitDistance: (val: number) => void
  splitSortOrder: 'asc' | 'desc'
  onSetSplitSortOrder: (val: 'asc' | 'desc') => void
  onApplyAutoSplit: () => void
  onOpenAddSegmentModal: () => void
  onSelectAllRoute: () => void
  currentCoords?: [number, number][]
  currentKmPoints: number[]
  importedLengthKm: number
  stripWidthMeters: number | string
  onSetStripWidthMeters: (val: number | string) => void
  slabLengthM: number | string
  onSetSlabLengthM: (val: number | string) => void
  slabThicknessCm: number | string
  onSetSlabThicknessCm: (val: number | string) => void
  syncJointWithSlab: boolean
  onSetSyncJointWithSlab: (val: boolean) => void
  contractionSpacingM: number | string
  onSetContractionSpacingM: (val: number | string) => void
  expansionSpacingM: number | string
  onSetExpansionSpacingM: (val: number | string) => void
  expansionGapMm: number | string
  onSetExpansionGapMm: (val: number | string) => void
  onOpenSplitModal: (seg: SegmentItem) => void
  onEditSegment: (seg: SegmentItem) => void
  onDeleteSegment: (id: string) => void
  onSnapSegment: (id: string) => void
  onUpdateSegmentWidth: (id: string, width: number) => void
  onUpdateAllWidths: (width: number) => void
  slabs: SlabItem[]
  showToast: (msg: string) => void
  // Quản lý Tuyến nhánh
  branches?: BranchItem[]
  selectedTargetType?: 'MAINLINE' | string
  onSelectTargetType?: (type: 'MAINLINE' | string) => void
  onOpenAddBranchModal?: () => void
  onDeleteBranch?: (branchId: string) => void
  onClearAllSegments?: () => void
  onClearMainline?: () => void
  onOpenImportModal?: () => void
  mainlineLengthKm?: number
  alignmentStatus?: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  editingDisabled?: boolean
  isSupervisor?: boolean
}

export const AlignmentSidebar: React.FC<AlignmentSidebarProps> = ({
  rightTab,
  pavementWorkflow,
  segmentPlanning = false, segmentSetStatus,
  onSetRightTab,
  segments,
  selectedSegmentId,
  onSelectSegment,
  splitDistance,
  onSetSplitDistance,
  splitSortOrder,
  onSetSplitSortOrder,
  onApplyAutoSplit,
  onOpenAddSegmentModal,
  onSelectAllRoute,
  currentCoords = [],
  currentKmPoints,
  importedLengthKm,
  stripWidthMeters,
  onSetStripWidthMeters,
  slabLengthM,
  onSetSlabLengthM,
  slabThicknessCm,
  onSetSlabThicknessCm,
  syncJointWithSlab,
  onSetSyncJointWithSlab,
  contractionSpacingM,
  onSetContractionSpacingM,
  expansionSpacingM,
  onSetExpansionSpacingM,
  expansionGapMm,
  onSetExpansionGapMm,
  onOpenSplitModal,
  onEditSegment,
  onDeleteSegment,
  onSnapSegment,
  onUpdateSegmentWidth,
  onUpdateAllWidths,
  slabs,
  showToast,
  branches = [],
  selectedTargetType = 'MAINLINE',
  onSelectTargetType,
  onOpenAddBranchModal,
  onDeleteBranch,
  onClearAllSegments,
  onClearMainline,
  onOpenImportModal,
  mainlineLengthKm,
  alignmentStatus,
  isSupervisor,
  editingDisabled = false
}) => {
  return (
    <div className="xl:col-span-4 flex flex-col gap-3">
      <div className="bg-white rounded-xl p-4 shadow-2xs border border-brand-border flex flex-col gap-3">
        {/* Tabs: Segments vs Road Width Profile vs Slabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
          <button
            type="button"
            onClick={() => onSetRightTab('SEGMENTS')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightTab === 'SEGMENTS'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-brand-gold" />
            <span className="truncate">Phân đoạn</span>
            <span className="text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-brand-gold">
              {segments.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSetRightTab('WIDTH_PROFILE')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightTab === 'WIDTH_PROFILE'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-brand-gold" />
            <span className="truncate">Bề rộng (m)</span>
          </button>
          <button
            type="button"
            onClick={() => onSetRightTab('SLABS')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightTab === 'SLABS'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-brand-gold" />
            <span className="truncate">Tấm & Khe</span>
          </button>
        </div>

        {/* TAB CONTENT: SEGMENTS */}
        {rightTab === 'SEGMENTS' && (
          <SidebarSegmentsTab
            segmentPlanning={segmentPlanning}
            segmentSetStatus={segmentSetStatus}
            segments={segments}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={onSelectSegment}
            splitDistance={splitDistance}
            onSetSplitDistance={onSetSplitDistance}
            splitSortOrder={splitSortOrder}
            onSetSplitSortOrder={onSetSplitSortOrder}
            onApplyAutoSplit={onApplyAutoSplit}
            onOpenAddSegmentModal={onOpenAddSegmentModal}
            onSelectAllRoute={onSelectAllRoute}
            currentCoords={currentCoords}
            currentKmPoints={currentKmPoints}
            importedLengthKm={importedLengthKm}
            slabLengthM={slabLengthM}
            onOpenSplitModal={onOpenSplitModal}
            onEditSegment={onEditSegment}
            onDeleteSegment={onDeleteSegment}
            onSnapSegment={onSnapSegment}
            branches={branches}
            selectedTargetType={selectedTargetType}
            onSelectTargetType={onSelectTargetType}
            onOpenAddBranchModal={onOpenAddBranchModal}
            onDeleteBranch={onDeleteBranch}
            onClearAllSegments={onClearAllSegments}
            onClearMainline={onClearMainline}
            onOpenImportModal={onOpenImportModal}
            mainlineLengthKm={mainlineLengthKm}
            alignmentStatus={alignmentStatus}
            isSupervisor={isSupervisor || editingDisabled}
          />
        )}

        {/* TAB CONTENT: ROAD WIDTH PROFILE */}
        {rightTab === 'WIDTH_PROFILE' && (
          <SidebarWidthProfileTab
            segments={segments}
            selectedSegmentId={selectedSegmentId}
            onUpdateSegmentWidth={onUpdateSegmentWidth}
            onUpdateAllWidths={onUpdateAllWidths}
            isReadOnly={alignmentStatus !== 'DRAFT' || isSupervisor || editingDisabled}
          />
        )}

        {/* TAB CONTENT: SLABS & JOINTS CONFIG */}
        {rightTab === 'SLABS' && (
          <fieldset disabled={isSupervisor || editingDisabled} className="min-w-0 border-0 p-0 m-0">
          <SidebarSlabsTab
            serverSnapshot={!!pavementWorkflow?.display}
            stripWidthMeters={stripWidthMeters}
            onSetStripWidthMeters={onSetStripWidthMeters}
            segments={segments}
            selectedSegmentId={selectedSegmentId}
            slabLengthM={slabLengthM}
            onSetSlabLengthM={onSetSlabLengthM}
            slabThicknessCm={slabThicknessCm}
            onSetSlabThicknessCm={onSetSlabThicknessCm}
            syncJointWithSlab={syncJointWithSlab}
            onSetSyncJointWithSlab={onSetSyncJointWithSlab}
            contractionSpacingM={contractionSpacingM}
            onSetContractionSpacingM={onSetContractionSpacingM}
            expansionSpacingM={expansionSpacingM}
            onSetExpansionSpacingM={onSetExpansionSpacingM}
            expansionGapMm={expansionGapMm}
            onSetExpansionGapMm={onSetExpansionGapMm}
            slabs={slabs}
            showToast={showToast}
          />
          </fieldset>
        )}
        {rightTab === 'SLABS' && pavementWorkflow && <>
          {!isSupervisor && <button type="button" disabled={pavementWorkflow.busy || (!pavementWorkflow.pending && !!pavementWorkflow.disabledReason)} title={pavementWorkflow.disabledReason} onClick={() => { void pavementWorkflow.save() }} className="px-3 py-2 rounded-lg border border-brand-gold text-brand-dark text-xs font-semibold disabled:opacity-50">{pavementWorkflow.busy ? 'Đang lưu/đọc lại…' : pavementWorkflow.actionLabel}</button>}
          {(pavementWorkflow.message || pavementWorkflow.disabledReason || pavementWorkflow.scopeMessage) && <p role="status" className="text-xs text-slate-600">{[pavementWorkflow.message, !isSupervisor && (pavementWorkflow.disabledReason || pavementWorkflow.scopeMessage)].filter(Boolean).join(' ')}</p>}
        </>}
      </div>

      {/* KPI TỔNG KẾT DƯỚI SIDEBAR */}
      <SidebarFooterKpis
        segments={segments}
        importedLengthKm={importedLengthKm}
        alignmentStatus={selectedTargetType === 'MAINLINE' ? alignmentStatus : 'DRAFT'}
      />
    </div>
  )
}
