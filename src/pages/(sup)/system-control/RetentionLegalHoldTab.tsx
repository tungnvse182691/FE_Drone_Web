import React from 'react'
import { LegalHoldProject, DataDeletionRequest } from '../../../types/domain'
import { LegalHoldCard } from './LegalHoldCard'
import { DeletionRequestsCard } from './DeletionRequestsCard'

interface RetentionLegalHoldTabProps {
  legalHoldProjects: LegalHoldProject[]
  deletionRequests: DataDeletionRequest[]
  isSupervisor: boolean
  handleToggleLegalHold: (projectId: string) => void
  handleRejectDeletion: (requestId: string) => void
  handleApprovePurge: (requestId: string) => void
}

export const RetentionLegalHoldTab: React.FC<RetentionLegalHoldTabProps> = ({
  legalHoldProjects,
  deletionRequests,
  isSupervisor,
  handleToggleLegalHold,
  handleRejectDeletion,
  handleApprovePurge
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
      {/* Cột trái (5 cols): Cơ chế Đóng băng pháp lý (Legal Hold) */}
      <LegalHoldCard
        legalHoldProjects={legalHoldProjects}
        isSupervisor={isSupervisor}
        handleToggleLegalHold={handleToggleLegalHold}
      />

      {/* Cột phải (7 cols): Thẩm duyệt yêu cầu xóa dữ liệu (Deletion Requests) */}
      <DeletionRequestsCard
        deletionRequests={deletionRequests}
        isSupervisor={isSupervisor}
        handleRejectDeletion={handleRejectDeletion}
        handleApprovePurge={handleApprovePurge}
      />
    </div>
  )
}
