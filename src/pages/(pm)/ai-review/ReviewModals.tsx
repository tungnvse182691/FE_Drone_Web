import React from 'react'
import type { TriageCase } from './types'
import { SpatialMergeModal } from './SpatialMergeModal'
import { GisMapModal } from './GisMapModal'
import { PhotoZoomModal } from './PhotoZoomModal'
import { LinkReportsModal } from './LinkReportsModal'
import { TriageProjectModal } from './TriageProjectModal'
import { NoDefectModal } from './NoDefectModal'
import { PublishModal } from './PublishModal'
import { RequestSurveyModal } from './RequestSurveyModal'

export interface ReviewModalsProps {
  selectedCase: TriageCase
  targetTriageCase: TriageCase | null
  cases: TriageCase[]
  selectedReportIds: string[]
  mockProjects: { id: string; code: string; name: string; start_km: number; end_km: number }[]

  // Modal 1: Merge
  isMergeModalOpen: boolean
  setIsMergeModalOpen: (open: boolean) => void
  onExecuteMerge: () => void

  // Modal 2: GIS
  isGISModalOpen: boolean
  setIsGISModalOpen: (open: boolean) => void
  modalMapType: 'SATELLITE' | 'STREET'
  setModalMapType: (type: 'SATELLITE' | 'STREET') => void
  modalMapContainerRef: React.RefObject<HTMLDivElement | null>

  // Modal 3: Photo Zoom
  isPhotoZoomModalOpen: boolean
  setIsPhotoZoomModalOpen: (open: boolean) => void

  // Modal 4: Link Reports
  isLinkReportsModalOpen: boolean
  setIsLinkReportsModalOpen: (open: boolean) => void
  linkMasterCaseId: string
  setLinkMasterCaseId: (id: string) => void
  linkAuditNotes: string
  setLinkAuditNotes: (notes: string) => void
  onConfirmLinkReports: () => void

  // Modal 5: Triage Project
  isTriageProjectModalOpen: boolean
  setIsTriageProjectModalOpen: (open: boolean) => void
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  onConfirmTriageProject: () => void

  // Modal 6: No Defect
  isNoDefectModalOpen: boolean
  setIsNoDefectModalOpen: (open: boolean) => void
  noDefectReason: string
  setNoDefectReason: (r: string) => void
  onConfirmNoDefect: () => void

  // Modal 7: Publish Result
  isPublishModalOpen: boolean
  setIsPublishModalOpen: (open: boolean) => void
  publishPublicNote: string
  setPublishPublicNote: (note: string) => void
  onConfirmPublishResult: () => void

  // Modal 8: Request Survey
  isRequestSurveyModalOpen: boolean
  setIsRequestSurveyModalOpen: (open: boolean) => void
  surveyMode: 'MEASURE_ONLY' | 'DRONE_RESURVEY'
  setSurveyMode: (m: 'MEASURE_ONLY' | 'DRONE_RESURVEY') => void
  surveyReason: string
  setSurveyReason: React.Dispatch<React.SetStateAction<string>>
  surveyAssignedCrew: string
  setSurveyAssignedCrew: (crew: string) => void
  surveySlaHours: number
  setSurveySlaHours: (hours: number) => void
  onConfirmRequestSurvey: () => void
}

export const ReviewModals: React.FC<ReviewModalsProps> = ({
  selectedCase,
  targetTriageCase,
  cases,
  selectedReportIds,
  mockProjects,
  isMergeModalOpen,
  setIsMergeModalOpen,
  onExecuteMerge,
  isGISModalOpen,
  setIsGISModalOpen,
  modalMapType,
  setModalMapType,
  modalMapContainerRef,
  isPhotoZoomModalOpen,
  setIsPhotoZoomModalOpen,
  isLinkReportsModalOpen,
  setIsLinkReportsModalOpen,
  linkMasterCaseId,
  setLinkMasterCaseId,
  linkAuditNotes,
  setLinkAuditNotes,
  onConfirmLinkReports,
  isTriageProjectModalOpen,
  setIsTriageProjectModalOpen,
  selectedProjectId,
  setSelectedProjectId,
  onConfirmTriageProject,
  isNoDefectModalOpen,
  setIsNoDefectModalOpen,
  noDefectReason,
  setNoDefectReason,
  onConfirmNoDefect,
  isPublishModalOpen,
  setIsPublishModalOpen,
  publishPublicNote,
  setPublishPublicNote,
  onConfirmPublishResult,
  isRequestSurveyModalOpen,
  setIsRequestSurveyModalOpen,
  surveyMode,
  setSurveyMode,
  surveyReason,
  setSurveyReason,
  surveyAssignedCrew,
  setSurveyAssignedCrew,
  surveySlaHours,
  setSurveySlaHours,
  onConfirmRequestSurvey,
}) => {
  return (
    <>
      {/* MODAL 1: GỘP PHẢN ÁNH TRÙNG LẶP KHÔNG GIAN */}
      <SpatialMergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        selectedCase={selectedCase}
        onExecuteMerge={onExecuteMerge}
      />

      {/* MODAL 2: BẢN ĐỒ GIS PREVIEW */}
      <GisMapModal
        isOpen={isGISModalOpen}
        onClose={() => setIsGISModalOpen(false)}
        selectedCase={selectedCase}
        modalMapType={modalMapType}
        setModalMapType={setModalMapType}
        modalMapContainerRef={modalMapContainerRef}
      />

      {/* MODAL 3: PHÓNG TO ẢNH HIỆN TRƯỜNG */}
      <PhotoZoomModal
        isOpen={isPhotoZoomModalOpen}
        onClose={() => setIsPhotoZoomModalOpen(false)}
        selectedCase={selectedCase}
      />

      {/* MODAL 4: LIÊN KẾT BÁO TRÙNG PHẢN ÁNH (PA04) */}
      <LinkReportsModal
        isOpen={isLinkReportsModalOpen}
        onClose={() => setIsLinkReportsModalOpen(false)}
        cases={cases}
        selectedReportIds={selectedReportIds}
        linkMasterCaseId={linkMasterCaseId}
        setLinkMasterCaseId={setLinkMasterCaseId}
        linkAuditNotes={linkAuditNotes}
        setLinkAuditNotes={setLinkAuditNotes}
        onConfirmLinkReports={onConfirmLinkReports}
      />

      {/* MODAL 5: ĐIỀU PHỐI GÁN VÀO DỰ ÁN BẢO HÀNH (PA03) */}
      <TriageProjectModal
        isOpen={isTriageProjectModalOpen}
        onClose={() => setIsTriageProjectModalOpen(false)}
        targetTriageCase={targetTriageCase}
        mockProjects={mockProjects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        onConfirmTriageProject={onConfirmTriageProject}
      />

      {/* MODAL 6: KẾT LUẬN KHÔNG CÓ KHIẾM KHUYẾT (NO_DEFECT - PA05, BR-39) */}
      <NoDefectModal
        isOpen={isNoDefectModalOpen}
        onClose={() => setIsNoDefectModalOpen(false)}
        targetTriageCase={targetTriageCase}
        noDefectReason={noDefectReason}
        setNoDefectReason={setNoDefectReason}
        onConfirmNoDefect={onConfirmNoDefect}
      />

      {/* MODAL 7: CÔNG BỐ TIẾN ĐỘ CHO NGƯỜI DÂN (PA07) */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        targetTriageCase={targetTriageCase}
        publishPublicNote={publishPublicNote}
        setPublishPublicNote={setPublishPublicNote}
        onConfirmPublishResult={onConfirmPublishResult}
      />

      {/* MODAL 8: LỆNH KHẢO SÁT & ĐO ĐẠC BỔ SUNG HIỆN TRƯỜNG (WF-11) */}
      <RequestSurveyModal
        isOpen={isRequestSurveyModalOpen}
        onClose={() => setIsRequestSurveyModalOpen(false)}
        targetTriageCase={targetTriageCase}
        surveyMode={surveyMode}
        setSurveyMode={setSurveyMode}
        surveyReason={surveyReason}
        setSurveyReason={setSurveyReason}
        surveyAssignedCrew={surveyAssignedCrew}
        setSurveyAssignedCrew={setSurveyAssignedCrew}
        surveySlaHours={surveySlaHours}
        setSurveySlaHours={setSurveySlaHours}
        onConfirmRequestSurvey={onConfirmRequestSurvey}
      />
    </>
  )
}
