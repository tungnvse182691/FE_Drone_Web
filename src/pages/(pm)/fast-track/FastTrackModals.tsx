import React from 'react'
import {
  PolicyThresholdConfig,
  DefectItem,
  CrewTeam,
  AuditLogItem
} from './types'
import { PolicyModal } from './PolicyModal'
import { AuditModal } from './AuditModal'
import { DefectDetailModal } from './DefectDetailModal'
import { FastTrackDispatchModal } from './FastTrackDispatchModal'

interface FastTrackModalsProps {
  isPolicyModalOpen: boolean
  setIsPolicyModalOpen: (open: boolean) => void
  currentPolicy: PolicyThresholdConfig | null
  formVersionName: string
  setFormVersionName: (v: string) => void
  formMaxArea: string
  setFormMaxArea: (v: string) => void
  formMaxDepth: string
  setFormMaxDepth: (v: string) => void
  formPolicyNote: string
  setFormPolicyNote: (v: string) => void
  handleApplyPolicy: (shouldPublish: boolean) => void
  isAuditModalOpen: boolean
  setIsAuditModalOpen: (open: boolean) => void
  auditLogs: AuditLogItem[]
  detailDefect: DefectItem | null
  setDetailDefect: (defect: DefectItem | null) => void
  isDispatchModalOpen: boolean
  setIsDispatchModalOpen: (open: boolean) => void
  selectedDefectIds: string[]
  selectedItems: DefectItem[]
  selectedDispatchCrew: string
  setSelectedDispatchCrew: (crew: string) => void
  crewTeams: CrewTeam[]
  dispatchNotes: string
  setDispatchNotes: (notes: string) => void
  handleExecuteDispatch: () => void
}

export const FastTrackModals: React.FC<FastTrackModalsProps> = ({
  isPolicyModalOpen,
  setIsPolicyModalOpen,
  currentPolicy,
  formVersionName,
  setFormVersionName,
  formMaxArea,
  setFormMaxArea,
  formMaxDepth,
  setFormMaxDepth,
  formPolicyNote,
  setFormPolicyNote,
  handleApplyPolicy,
  isAuditModalOpen,
  setIsAuditModalOpen,
  auditLogs,
  detailDefect,
  setDetailDefect,
  isDispatchModalOpen,
  setIsDispatchModalOpen,
  selectedDefectIds,
  selectedItems,
  selectedDispatchCrew,
  setSelectedDispatchCrew,
  crewTeams,
  dispatchNotes,
  setDispatchNotes,
  handleExecuteDispatch
}) => {
  return (
    <>
      {currentPolicy && (
        <PolicyModal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
          currentPolicy={currentPolicy}
          formVersionName={formVersionName}
          setFormVersionName={setFormVersionName}
          formMaxArea={formMaxArea}
          setFormMaxArea={setFormMaxArea}
          formMaxDepth={formMaxDepth}
          setFormMaxDepth={setFormMaxDepth}
          formPolicyNote={formPolicyNote}
          setFormPolicyNote={setFormPolicyNote}
          handleApplyPolicy={(action) => handleApplyPolicy(action === 'ACTIVATE')}
        />
      )}

      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
      />

      <DefectDetailModal
        detailDefect={detailDefect}
        onClose={() => setDetailDefect(null)}
      />

      <FastTrackDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        selectedDefectIds={selectedDefectIds}
        selectedItems={selectedItems}
        selectedDispatchCrew={selectedDispatchCrew}
        setSelectedDispatchCrew={setSelectedDispatchCrew}
        crewTeams={crewTeams}
        dispatchNotes={dispatchNotes}
        setDispatchNotes={setDispatchNotes}
        handleExecuteDispatch={handleExecuteDispatch}
        currentPolicy={currentPolicy}
      />
    </>
  )
}
