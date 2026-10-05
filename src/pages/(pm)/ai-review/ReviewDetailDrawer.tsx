import React from 'react'
import type { TriageCase } from './types'
import { DrawerHeader } from './DrawerHeader'
import { DrawerDecisionBanners } from './DrawerDecisionBanners'
import { DrawerMediaViewer } from './DrawerMediaViewer'
import { DrawerClusterDeduplication } from './DrawerClusterDeduplication'
import { DrawerReporterInfo } from './DrawerReporterInfo'
import { DrawerMergedReportsList } from './DrawerMergedReportsList'
import { DrawerDecisionForm } from './DrawerDecisionForm'
import { DrawerFooter } from './DrawerFooter'

export interface ReviewDetailDrawerProps {
  selectedCase: TriageCase
  setSelectedCaseId: (id: string) => void
  cases: TriageCase[]
  detailViewMode: 'PHOTO' | 'GIS_MAP'
  setDetailViewMode: (mode: 'PHOTO' | 'GIS_MAP') => void
  drawerMapContainerRef: React.RefObject<HTMLDivElement | null>
  currentSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  setCurrentSeverity: (s: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void
  currentUrgency: 'NORMAL' | 'URGENT' | 'EMERGENCY'
  setCurrentUrgency: (u: 'NORMAL' | 'URGENT' | 'EMERGENCY') => void
  currentArea: number
  setCurrentArea: (a: number) => void
  currentDepth: number
  setCurrentDepth: (d: number) => void
  currentNotes: string
  setCurrentNotes: (n: string) => void
  onVerifyDefect: (c?: TriageCase) => void
  onOpenNoDefectModal: (c?: TriageCase) => void
  onConclusionOutOfScope: (c?: TriageCase) => void
  onResetConclusion: (c?: TriageCase) => void
  onOpenRequestSurveyModal: (c?: TriageCase) => void
  onOpenPublishModal: (c?: TriageCase) => void
  onNavigateFastTrack: (c: TriageCase) => void
  onUnlinkReport: (childId: string) => void
  onOpenTriageProject: (c: TriageCase) => void
  onOpenGISModal: () => void
  onOpenPhotoZoomModal: () => void
  onOpenMergeModal: (c: TriageCase) => void
  onToggleClusterItem: (code: string) => void
  onClose?: () => void
  onCloseTab?: () => void
}

export const ReviewDetailDrawer: React.FC<ReviewDetailDrawerProps> = ({
  selectedCase,
  setSelectedCaseId,
  cases,
  detailViewMode,
  setDetailViewMode,
  drawerMapContainerRef,
  currentSeverity,
  setCurrentSeverity,
  currentUrgency,
  setCurrentUrgency,
  currentArea,
  setCurrentArea,
  currentDepth,
  setCurrentDepth,
  currentNotes,
  setCurrentNotes,
  onVerifyDefect,
  onOpenNoDefectModal,
  onConclusionOutOfScope,
  onResetConclusion,
  onOpenRequestSurveyModal,
  onOpenPublishModal,
  onNavigateFastTrack,
  onUnlinkReport,
  onOpenTriageProject,
  onOpenGISModal,
  onOpenPhotoZoomModal,
  onOpenMergeModal,
  onToggleClusterItem,
  onClose,
  onCloseTab,
}) => {
  const handleClose = onClose || onCloseTab

  return (
    <div className="w-full bg-white flex flex-col h-full max-h-[90vh] overflow-hidden rounded-2xl">
      {/* Modal Header */}
      <DrawerHeader
        selectedCase={selectedCase}
        onOpenPhotoZoomModal={onOpenPhotoZoomModal}
        handleClose={handleClose}
      />

      {/* Modal Body - Scrollable */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Ảnh, Bản đồ, Người phản ánh, Nhóm gộp trùng */}
          <div className="lg:col-span-7 space-y-4">
            <DrawerDecisionBanners
              selectedCase={selectedCase}
              setSelectedCaseId={setSelectedCaseId}
              onUnlinkReport={onUnlinkReport}
              onResetConclusion={onResetConclusion}
            />

            <DrawerMediaViewer
              selectedCase={selectedCase}
              detailViewMode={detailViewMode}
              setDetailViewMode={setDetailViewMode}
              drawerMapContainerRef={drawerMapContainerRef}
              onOpenPhotoZoomModal={onOpenPhotoZoomModal}
              onOpenGISModal={onOpenGISModal}
            />

            <DrawerClusterDeduplication
              selectedCase={selectedCase}
              onToggleClusterItem={onToggleClusterItem}
              onOpenMergeModal={onOpenMergeModal}
            />

            <DrawerReporterInfo
              selectedCase={selectedCase}
              onOpenTriageProject={onOpenTriageProject}
            />

            <DrawerMergedReportsList
              selectedCase={selectedCase}
              cases={cases}
              onUnlinkReport={onUnlinkReport}
            />
          </div>

          {/* RIGHT COLUMN: Biểu mẫu quyết định kỹ thuật & hành động thẩm định */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
            <DrawerDecisionForm
              selectedCase={selectedCase}
              currentSeverity={currentSeverity}
              setCurrentSeverity={setCurrentSeverity}
              currentUrgency={currentUrgency}
              setCurrentUrgency={setCurrentUrgency}
              currentArea={currentArea}
              setCurrentArea={setCurrentArea}
              currentDepth={currentDepth}
              setCurrentDepth={setCurrentDepth}
              currentNotes={currentNotes}
              setCurrentNotes={setCurrentNotes}
              onVerifyDefect={onVerifyDefect}
              onOpenNoDefectModal={onOpenNoDefectModal}
              onConclusionOutOfScope={onConclusionOutOfScope}
              onOpenRequestSurveyModal={onOpenRequestSurveyModal}
              onOpenPublishModal={onOpenPublishModal}
              onNavigateFastTrack={onNavigateFastTrack}
            />
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <DrawerFooter handleClose={handleClose} />
    </div>
  )
}
