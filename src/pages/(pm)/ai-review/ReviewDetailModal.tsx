import type { CaseEvidenceRequestState } from './useCaseEvidenceRequest'
import React from 'react'
import { ReviewDetailDrawer } from './ReviewDetailDrawer'
import { TriageCase } from './types'

export interface ReviewDetailModalProps {
  evidenceRequest?: CaseEvidenceRequestState
  loading?: boolean
  error?: string
  onRetry?: () => void
  isOpen: boolean
  onClose: () => void
  selectedCase: TriageCase
  setSelectedCaseId: (id: string) => void
  cases: TriageCase[]
  detailViewMode: 'PHOTO' | 'GIS_MAP' | 'SIDE_BY_SIDE'
  setDetailViewMode: (mode: 'PHOTO' | 'GIS_MAP' | 'SIDE_BY_SIDE') => void
  drawerMapContainerRef: React.RefObject<HTMLDivElement | null>
  currentSeverity: 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  setCurrentSeverity: (s: 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void
  currentUrgency: 'UNKNOWN' | 'NORMAL' | 'URGENT' | 'EMERGENCY'
  setCurrentUrgency: (u: 'UNKNOWN' | 'NORMAL' | 'URGENT' | 'EMERGENCY') => void
  currentArea: number
  setCurrentArea: (a: number) => void
  currentDepth: number
  setCurrentDepth: (d: number) => void
  currentNotes: string
  setCurrentNotes: (n: string) => void
  isSupervisor?: boolean
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
  loading = false, error = '', onRetry,
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
        className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || error || !drawerProps.selectedCase.id ? <div className="p-6 space-y-3">
          {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : <p role="status" className="text-sm text-slate-500">Đang tải chi tiết hồ sơ...</p>}
          {error && <button type="button" onClick={onRetry} className="text-xs underline">Thử lại</button>}
          <button type="button" onClick={onClose} className="text-xs px-3 py-2 border rounded-lg">Đóng lại</button>
        </div> : <ReviewDetailDrawer {...drawerProps} onClose={onClose} />}
      </div>
    </div>
  )
}
