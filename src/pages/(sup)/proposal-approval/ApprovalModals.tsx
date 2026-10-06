import React from 'react'
import { RepairItemDetail } from './types'
import { DecisionModal } from './DecisionModal'
import { DispatchModal } from './DispatchModal'
import { BatchApproveModal } from './BatchApproveModal'
import { DefectPhotoModal } from './DefectPhotoModal'

export interface ApprovalModalsProps {
  activeModalItem: RepairItemDetail | null
  onCloseDecisionModal: () => void
  modalFeedbackType: 'EVIDENCE' | 'RECONSIDER' | 'REJECT'
  setModalFeedbackType: (type: 'EVIDENCE' | 'RECONSIDER' | 'REJECT') => void
  modalNotes: string
  setModalNotes: (notes: string) => void
  modalDirectives: { [key: string]: boolean }
  setModalDirectives: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
  onSubmitDecisionModal: () => void
  onViewPhoto: (item: RepairItemDetail) => void

  isDispatchModalOpen: boolean
  onCloseDispatchModal: () => void
  packageCode: string
  items: RepairItemDetail[]
  stats: {
    total: number
    approved: number
    evidence: number
    reconsider: number
    rejected: number
    pending: number
    percent: number
    approvedArea: number
    totalProposedArea: number
  }
  dispatchDeadline: string
  setDispatchDeadline: (dl: string) => void
  dispatchNotice: string
  setDispatchNotice: (notice: string) => void
  onConfirmDispatch: () => void

  isBatchApproveConfirmOpen: boolean
  onCloseBatchApproveConfirm: () => void
  onBatchApproveAll: () => void

  viewingPhotoItem: RepairItemDetail | null
  onCloseViewingPhoto: () => void
}

export const ApprovalModals: React.FC<ApprovalModalsProps> = ({
  activeModalItem,
  onCloseDecisionModal,
  modalFeedbackType,
  setModalFeedbackType,
  modalNotes,
  setModalNotes,
  modalDirectives,
  setModalDirectives,
  onSubmitDecisionModal,
  onViewPhoto,

  isDispatchModalOpen,
  onCloseDispatchModal,
  packageCode,
  items,
  stats,
  dispatchDeadline,
  setDispatchDeadline,
  dispatchNotice,
  setDispatchNotice,
  onConfirmDispatch,

  isBatchApproveConfirmOpen,
  onCloseBatchApproveConfirm,
  onBatchApproveAll,

  viewingPhotoItem,
  onCloseViewingPhoto
}) => {
  return (
    <>
      {/* MODAL 1: REQUEST EVIDENCE / RECONSIDER / REJECTION MODAL */}
      <DecisionModal
        activeModalItem={activeModalItem}
        onClose={onCloseDecisionModal}
        modalFeedbackType={modalFeedbackType}
        setModalFeedbackType={setModalFeedbackType}
        modalNotes={modalNotes}
        setModalNotes={setModalNotes}
        modalDirectives={modalDirectives}
        setModalDirectives={setModalDirectives}
        onSubmit={onSubmitDecisionModal}
        onViewPhoto={onViewPhoto}
      />

      {/* MODAL 2: DISPATCH WORK ORDER MODAL */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={onCloseDispatchModal}
        packageCode={packageCode}
        items={items}
        stats={stats}
        dispatchDeadline={dispatchDeadline}
        setDispatchDeadline={setDispatchDeadline}
        dispatchNotice={dispatchNotice}
        setDispatchNotice={setDispatchNotice}
        onConfirmDispatch={onConfirmDispatch}
      />

      {/* MODAL 3: BATCH APPROVE ALL CONFIRMATION MODAL */}
      <BatchApproveModal
        isOpen={isBatchApproveConfirmOpen}
        onClose={onCloseBatchApproveConfirm}
        packageCode={packageCode}
        stats={stats}
        onConfirm={onBatchApproveAll}
      />

      {/* MODAL 4: DEFECT ORIGINAL PHOTO & EXIF LIGHTBOX MODAL */}
      <DefectPhotoModal
        viewingPhotoItem={viewingPhotoItem}
        onClose={onCloseViewingPhoto}
      />
    </>
  )
}
export default ApprovalModals
