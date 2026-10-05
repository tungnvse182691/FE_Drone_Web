import React from 'react'
import type { ProposalWorkPackage, UnassignedDefectItem, RouteSegmentOption } from './types'
import { CreateProposalModal } from './CreateProposalModal'
import { ProposalPDFPreviewModal } from './ProposalPDFPreviewModal'
import { ProposalDetailModal } from './ProposalDetailModal'

export interface ProposalModalsProps {
  // Create Modal
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
  formPackageName: string
  setFormPackageName: (name: string) => void
  formRouteId: string
  handleRouteChange: (routeId: string) => void
  availableRoutes: { id: string; name: string; code: string }[]
  formSegmentId: string
  handleSegmentChange: (segId: string) => void
  currentRouteSegments: RouteSegmentOption[]
  currentSegment: RouteSegmentOption | undefined
  currentRoute: { id: string; name: string; code: string } | undefined
  formContractor: string
  setFormContractor: (c: string) => void
  formDurationDays: number
  setFormDurationDays: (d: number) => void
  formTechnicalMethod: string
  setFormTechnicalMethod: (method: string) => void
  unassignedDefects: UnassignedDefectItem[]
  handleToggleDefect: (id: string) => void
  modalCalculations: { count: number; description: string }
  handleSaveDraft: (andSubmit: boolean) => void

  // PDF Preview Modal
  isPDFPreviewModalOpen: boolean
  setIsPDFPreviewModalOpen: (open: boolean) => void
  packages: ProposalWorkPackage[]
  showToast: (msg: string) => void

  // Detail Modal
  selectedPackageForDetail: ProposalWorkPackage | null
  setSelectedPackageForDetail: React.Dispatch<React.SetStateAction<ProposalWorkPackage | null>>
  isSupervisor: boolean
  isPM: boolean
  handleQuickApprove: (id: string, code: string) => void
  handleSubmitDraftPackage: (id: string, code: string) => void
}

export const ProposalModals: React.FC<ProposalModalsProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  formPackageName,
  setFormPackageName,
  formRouteId,
  handleRouteChange,
  availableRoutes,
  formSegmentId,
  handleSegmentChange,
  currentRouteSegments,
  currentSegment,
  currentRoute,
  formContractor,
  setFormContractor,
  formDurationDays,
  setFormDurationDays,
  formTechnicalMethod,
  setFormTechnicalMethod,
  unassignedDefects,
  handleToggleDefect,
  modalCalculations,
  handleSaveDraft,
  isPDFPreviewModalOpen,
  setIsPDFPreviewModalOpen,
  packages,
  showToast,
  selectedPackageForDetail,
  setSelectedPackageForDetail,
  isSupervisor,
  isPM,
  handleQuickApprove,
  handleSubmitDraftPackage,
}) => {
  return (
    <>
      <CreateProposalModal
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        formPackageName={formPackageName}
        setFormPackageName={setFormPackageName}
        formRouteId={formRouteId}
        handleRouteChange={handleRouteChange}
        availableRoutes={availableRoutes}
        formSegmentId={formSegmentId}
        handleSegmentChange={handleSegmentChange}
        currentRouteSegments={currentRouteSegments}
        currentSegment={currentSegment}
        currentRoute={currentRoute}
        formContractor={formContractor}
        setFormContractor={setFormContractor}
        formDurationDays={formDurationDays}
        setFormDurationDays={setFormDurationDays}
        formTechnicalMethod={formTechnicalMethod}
        setFormTechnicalMethod={setFormTechnicalMethod}
        unassignedDefects={unassignedDefects}
        handleToggleDefect={handleToggleDefect}
        modalCalculations={modalCalculations}
        handleSaveDraft={handleSaveDraft}
      />

      <ProposalPDFPreviewModal
        isPDFPreviewModalOpen={isPDFPreviewModalOpen}
        setIsPDFPreviewModalOpen={setIsPDFPreviewModalOpen}
        packages={packages}
        showToast={showToast}
      />

      <ProposalDetailModal
        selectedPackageForDetail={selectedPackageForDetail}
        setSelectedPackageForDetail={setSelectedPackageForDetail}
        isSupervisor={isSupervisor}
        isPM={isPM}
        handleQuickApprove={handleQuickApprove}
        handleSubmitDraftPackage={handleSubmitDraftPackage}
      />
    </>
  )
}
