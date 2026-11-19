import React from 'react'
import { RepairItemDetail } from './types'
import { BatchApproveModal } from './BatchApproveModal'
import { DefectPhotoModal } from './DefectPhotoModal'

export interface ApprovalModalsProps {
  packageCode: string
  stats: { total: number; approved: number; evidence: number; reconsider: number; rejected: number; pending: number; percent: number; approvedArea: number; totalProposedArea: number }
  onViewPhoto: (item: RepairItemDetail) => void

  isBatchApproveConfirmOpen: boolean
  onCloseBatchApproveConfirm: () => void
  onBatchApproveAll: () => void

  viewingPhotoItem: RepairItemDetail | null
  onCloseViewingPhoto: () => void
}

export const ApprovalModals: React.FC<ApprovalModalsProps> = ({
  packageCode,
  stats,
  isBatchApproveConfirmOpen,
  onCloseBatchApproveConfirm,
  onBatchApproveAll,

  viewingPhotoItem,
  onCloseViewingPhoto
}) => {
  return (
    <>
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
