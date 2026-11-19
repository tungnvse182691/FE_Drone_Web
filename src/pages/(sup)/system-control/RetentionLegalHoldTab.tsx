import React from 'react'
import { LegalHoldProject } from '../../../types/domain'
import { LegalHoldCard } from './LegalHoldCard'

interface RetentionLegalHoldTabProps {
  legalHoldProjects: LegalHoldProject[]
  isSupervisor: boolean
  handleToggleLegalHold: (projectId: string) => void
  onOpenLegalHoldModal?: (project: LegalHoldProject) => void
  onViewProjectDetail?: (project: LegalHoldProject) => void
}

/** BE chỉ có đánh giá lưu trữ (retention evaluations), cơ sở lưu trữ theo tệp và phong tỏa pháp lý (holds); không có luồng yêu cầu/duyệt xóa dữ liệu. */
export const RetentionLegalHoldTab: React.FC<RetentionLegalHoldTabProps> = ({ legalHoldProjects, isSupervisor, handleToggleLegalHold, onOpenLegalHoldModal, onViewProjectDetail }) => (
  <div className="grid grid-cols-1 gap-5 items-start w-full">
    <LegalHoldCard
      legalHoldProjects={legalHoldProjects}
      isSupervisor={isSupervisor}
      handleToggleLegalHold={handleToggleLegalHold}
      onOpenLegalHoldModal={onOpenLegalHoldModal}
      onViewProjectDetail={onViewProjectDetail}
    />
  </div>
)
