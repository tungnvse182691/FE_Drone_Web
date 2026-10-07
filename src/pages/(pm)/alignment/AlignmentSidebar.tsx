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

export interface AlignmentSidebarProps {
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
  currentKmPoints: number[]
  importedLengthKm: number
  slabLengthM: number
  onSetSlabLengthM: (val: number) => void
  slabThicknessCm: number
  onSetSlabThicknessCm: (val: number) => void
  syncJointWithSlab: boolean
  onSetSyncJointWithSlab: (val: boolean) => void
  contractionSpacingM: number
  onSetContractionSpacingM: (val: number) => void
  expansionSpacingM: number
  onSetExpansionSpacingM: (val: number) => void
  expansionGapMm: number
  onSetExpansionGapMm: (val: number) => void
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
  mainlineLengthKm?: number
}

export const AlignmentSidebar: React.FC<AlignmentSidebarProps> = ({
  rightTab,
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
  currentKmPoints,
  importedLengthKm,
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
  mainlineLengthKm
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
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              v2.2
            </span>
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
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              TCVN
            </span>
          </button>
        </div>

        {/* TAB CONTENT: SEGMENTS */}
        {rightTab === 'SEGMENTS' && (
          <SidebarSegmentsTab
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
            mainlineLengthKm={mainlineLengthKm}
          />
        )}

        {/* TAB CONTENT: ROAD WIDTH PROFILE */}
        {rightTab === 'WIDTH_PROFILE' && (
          <SidebarWidthProfileTab
            segments={segments}
            selectedSegmentId={selectedSegmentId}
            onUpdateSegmentWidth={onUpdateSegmentWidth}
            onUpdateAllWidths={onUpdateAllWidths}
          />
        )}

        {/* TAB CONTENT: SLABS & JOINTS CONFIG */}
        {rightTab === 'SLABS' && (
          <SidebarSlabsTab
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
        )}
      </div>

      {/* KPI TỔNG KẾT DƯỚI SIDEBAR */}
      <SidebarFooterKpis
        segments={segments}
        importedLengthKm={importedLengthKm}
      />
    </div>
  )
}
