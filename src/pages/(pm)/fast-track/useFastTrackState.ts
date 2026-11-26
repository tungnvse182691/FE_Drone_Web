import { useAuthStore } from '../../../store/authStore'
import { exportError } from '../../../api/services/projectExportService'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProjectOption } from './types'
import { fastTrackService } from '../../../api/services/fastTrackService'
import { useFastTrackPolicy } from './useFastTrackPolicy'
import { useFastTrackDispatch } from './useFastTrackDispatch'

export const useFastTrackState = (isSupervisor = false) => {
  const [params,setParams]=useSearchParams(),requestedProject=params.get('projectId') || ''
  const epoch=useAuthStore(s=>s.authEpoch)
  const [projectError,setProjectError]=useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }, [epoch])

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // Tải danh sách dự án thật từ GET /api/v1/projects
  useEffect(() => {
    let isMounted = true
    setProjects([]);setSelectedProjectId('');setProjectError('')
    fastTrackService.getProjects().then((projs) => {
      if (!isMounted) return
      if (projs.length > 0) {
        setProjects(projs)
        const requested=requestedProject ? projs.find(p=>p.id===requestedProject):projs[0]
        if(!requested){setProjectError('Dự án trong liên kết không thuộc danh sách được phép đọc.');return}
        setSelectedProjectId(requested.id)
      } else {
        setProjects([])
        setSelectedProjectId('')
      }
    }).catch(e=>{if(isMounted)setProjectError(exportError(e))})
    return () => {
      isMounted = false
    }
  }, [epoch,requestedProject])

  const policy = useFastTrackPolicy(selectedProjectId, showToast)
  const dispatch = useFastTrackDispatch(selectedProjectId, showToast)

  const handleProjectChange = (newProjectId: string) => {
    setSelectedProjectId(newProjectId)
    const next=new URLSearchParams(params);next.set('projectId',newProjectId);if(newProjectId!==selectedProjectId){next.delete('defectId');next.delete('itemId');next.delete('open')}setParams(next,{replace:true})
  }
  useEffect(()=>{if(params.get('open')!=='prepare' || !selectedProjectId || selectedProjectId!==requestedProject || dispatch.dispatchLoading)return;const defect=params.get('defectId'),item=params.get('itemId'),row=dispatch.defects.find(r=>item?r.itemId===item&&(!defect||r.defectId===defect):r.defectId===defect||r.id===defect);if(row){dispatch.setDetailDefect(row);const next=new URLSearchParams(params);next.delete('open');setParams(next,{replace:true})}},[params,selectedProjectId,requestedProject,dispatch.dispatchLoading,dispatch.defects])

  return {
    projectError,
    policyError: policy.policyError,
    dispatchError: dispatch.dispatchError,
    dispatchLoading: dispatch.dispatchLoading,
    projects,
    selectedProjectId,
    handleProjectChange,
    toastMessage,
    setToastMessage,
    showToast,
    // Policy states
    policyEditor: policy.policyEditor,
    handleReadHistory: policy.handleReadHistory,
    ruleSelection: policy.ruleSelection,
    setRuleSelection: policy.setRuleSelection,
    currentPolicy: policy.currentPolicy,
    policyHistory: policy.policyHistory,
    auditLogs: policy.auditLogs,
    roadCoverage: policy.roadCoverage,
    selectCoverageScope: policy.selectCoverageScope,
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
