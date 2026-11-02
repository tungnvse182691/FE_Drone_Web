import { useState, useEffect, useCallback } from 'react'
import { ProjectOption } from './types'
import { fastTrackService } from '../../../api/services/fastTrackService'
import { useFastTrackPolicy } from './useFastTrackPolicy'
import { useFastTrackDispatch } from './useFastTrackDispatch'

export const useFastTrackState = (isSupervisor = false) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }, [])

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // Tải danh sách dự án thật từ GET /api/v1/projects
  useEffect(() => {
    let isMounted = true
    fastTrackService.getProjects().then((projs) => {
      if (!isMounted) return
      if (projs.length > 0) {
        setProjects(projs)
        setSelectedProjectId(projs[0].id)
      } else {
        setProjects([])
        setSelectedProjectId('')
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const policy = useFastTrackPolicy(selectedProjectId, showToast)
  const dispatch = useFastTrackDispatch(selectedProjectId, showToast)

  const handleProjectChange = (newProjectId: string) => {
    setSelectedProjectId(newProjectId)
  }

  return {
    projects,
    selectedProjectId,
    handleProjectChange,
    toastMessage,
    setToastMessage,
    showToast,
    // Policy states
    currentPolicy: policy.currentPolicy,
    policyHistory: policy.policyHistory,
    auditLogs: policy.auditLogs,
    roadCoverage: policy.roadCoverage,
    isRoadCoverageModalOpen: policy.isRoadCoverageModalOpen,
    setIsRoadCoverageModalOpen: policy.setIsRoadCoverageModalOpen,
    handleConfirmRoadCoverage: policy.handleConfirmRoadCoverage,
    coverageError: policy.coverageError,
    isSubmittingCoverage: policy.isSubmittingCoverage,
    formVersionName: policy.formVersionName,
    setFormVersionName: policy.setFormVersionName,
    formMaxArea: policy.formMaxArea,
    setFormMaxArea: policy.setFormMaxArea,
    formMaxDepth: policy.formMaxDepth,
    setFormMaxDepth: policy.setFormMaxDepth,
    formPolicyNote: policy.formPolicyNote,
    setFormPolicyNote: policy.setFormPolicyNote,
    isPolicyModalOpen: policy.isPolicyModalOpen,
    setIsPolicyModalOpen: policy.setIsPolicyModalOpen,
    isAuditModalOpen: policy.isAuditModalOpen,
    setIsAuditModalOpen: policy.setIsAuditModalOpen,
    handleApplyPolicy: policy.handleApplyPolicy,
    handleActivateDraft: policy.handleActivateDraft,
    // Dispatch states
    crewTeams: dispatch.crewTeams,
    defects: dispatch.defects,
    selectedDefectIds: dispatch.selectedDefectIds,
    setSelectedDefectIds: dispatch.setSelectedDefectIds,
    crewFilter: dispatch.crewFilter,
    setCrewFilter: dispatch.setCrewFilter,
    statusFilter: dispatch.statusFilter,
    setStatusFilter: dispatch.setStatusFilter,
    isDispatchModalOpen: dispatch.isDispatchModalOpen,
    setIsDispatchModalOpen: dispatch.setIsDispatchModalOpen,
    selectedDispatchCrew: dispatch.selectedDispatchCrew,
    setSelectedDispatchCrew: dispatch.setSelectedDispatchCrew,
    dispatchNotes: dispatch.dispatchNotes,
    setDispatchNotes: dispatch.setDispatchNotes,
    detailDefect: dispatch.detailDefect,
    setDetailDefect: dispatch.setDetailDefect,
    filteredDefects: dispatch.filteredDefects,
    selectedItems: dispatch.selectedItems,
    hasViolationItem: dispatch.hasViolationItem,
    handleToggleSelect: dispatch.handleToggleSelect,
    handleSelectAll: dispatch.handleSelectAll,
    handleRemoveViolationItems: dispatch.handleRemoveViolationItems,
    handleAssignCrew: dispatch.handleAssignCrew,
    handleExecuteDispatch: dispatch.handleExecuteDispatch
  }
}
