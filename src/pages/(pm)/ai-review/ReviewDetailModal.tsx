import React from 'react'
import { ReviewDetailDrawer } from './ReviewDetailDrawer'
import { TriageCase } from './types'

export interface ReviewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCase: TriageCase
  setSelectedCaseId: (id: string) => void
  cases: TriageCase[]
  detailViewMode: 'PHOTO' | 'GIS_MAP'
  setDetailViewMode: (mode: 'PHOTO' | 'GIS_MAP') => void
  drawerMapContainerRef: React.RefObject<HTMLDivElement | null>
  currentSeverity: TriageCase['severity']
  setCurrentSeverity: (s: TriageCase['severity']) => void
  currentUrgency: TriageCase['urgency']
  setCurrentUrgency: (u: TriageCase['urgency']) => void
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
  onNavigateFastTrack: (c?: TriageCase) => void
  onUnlinkReport: (code: string) => void
  onOpenTriageProject: (c: TriageCase) => void
  onOpenGISModal: () => void
  onOpenPhotoZoomModal: () => void
  onOpenMergeModal: (c: TriageCase) => void
  onToggleClusterItem: (code: string) => void
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  isOpen,
  onClose,
  ...drawerProps
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <ReviewDetailDrawer {...drawerProps} onClose={onClose} />
      </div>
    </div>
  )
}
