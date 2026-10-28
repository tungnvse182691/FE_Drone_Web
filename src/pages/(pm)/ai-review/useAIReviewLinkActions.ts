import React, { useState } from 'react'
import { mockProjects } from '../../../data/mockData'
import { TriageCase } from './types'
import { triageService } from '../../../api/services/triageService'
import { projectService } from '../../../api/services/projectService'

export interface UseAIReviewLinkActionsProps {
  cases: TriageCase[]
  setCases: React.Dispatch<React.SetStateAction<TriageCase[]>>
  selectedCaseId: string
  setSelectedCaseId: (id: string) => void
  setExpandedMasterIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  filteredCases: TriageCase[]
}

export const useAIReviewLinkActions = ({
  cases,
  setCases,
  selectedCaseId,
  setSelectedCaseId,
  setExpandedMasterIds,
  showToast,
  filteredCases
}: UseAIReviewLinkActionsProps) => {
  // Multi-select cho bảng tiếp nhận phản ánh người dân (Link Reports)
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])

  // Modal Liên kết báo trùng (Link Reports - PA04)
  const [isLinkReportsModalOpen, setIsLinkReportsModalOpen] = useState<boolean>(false)
  const [linkMasterCaseId, setLinkMasterCaseId] = useState<string>('')
  const [linkAuditNotes, setLinkAuditNotes] = useState<string>('')

  // Modal Điều phối dự án (Triage Case - PA03)
  const [isTriageProjectModalOpen, setIsTriageProjectModalOpen] = useState<boolean>(false)
  const [targetTriageCase, setTargetTriageCase] = useState<TriageCase | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('prj-ql1a-02')

  // Multi-select for Citizen Reports Table
  const handleToggleSelectReport = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAllReports = () => {
    const currentIds = filteredCases.map((c) => c.id)
    if (selectedReportIds.length === currentIds.length) {
      setSelectedReportIds([])
    } else {
      setSelectedReportIds(currentIds)
    }
  }

  // Link Duplicate Reports Modal (PA04, BR-30, BR-31)
  const handleOpenLinkReportsModal = () => {
    if (selectedReportIds.length < 2) {
      showToast('Vui lòng chọn ít nhất 2 phản ánh để thực hiện liên kết báo trùng!')
      return
    }
    setLinkMasterCaseId(selectedReportIds[0])
    setLinkAuditNotes(
      'Liên kết báo trùng: Các phản ánh được ghi nhận cùng một vị trí hư hỏng lân cận, hợp nhất bằng chứng ảnh và mô tả hiện trường.'
    )
    setIsLinkReportsModalOpen(true)
  }

  const handleConfirmLinkReports = () => {
    if (!linkMasterCaseId) {
      showToast('Vui lòng chọn hồ sơ gốc tiếp nhận chính!')
      return
    }
    const master = cases.find((c) => c.id === linkMasterCaseId)
    if (!master) return

    const secondaryIds = selectedReportIds.filter((id) => id !== linkMasterCaseId)
    const secondaryCodes = cases.filter((c) => secondaryIds.includes(c.id)).map((c) => c.code)

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === linkMasterCaseId) {
          const updatedLinkedCodes = Array.from(new Set([...(c.linked_report_ids || []), ...secondaryCodes]))
          return {
            ...c,
            linked_report_ids: updatedLinkedCodes,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[LIÊN KẾT BÁO TRÙNG PA04] Đã gộp hồ sơ từ: ${secondaryCodes.join(', ')}. Ghi chú: ${linkAuditNotes}`
          }
        }
        if (secondaryIds.includes(c.id)) {
          return {
            ...c,
            status: 'MERGED',
            status_label: 'Đã gộp trùng',
            master_case_id: master.id,
            pm_notes: `Đã liên kết báo trùng vào hồ sơ chính ${master.code} (Theo PA04). Ghi chú: ${linkAuditNotes}`
          }
        }
        return c
      })
    )

    setExpandedMasterIds((prev) => Array.from(new Set([...prev, linkMasterCaseId])))
    setIsLinkReportsModalOpen(false)
    setSelectedReportIds([])
    setSelectedCaseId(linkMasterCaseId)
    showToast(
      `Đã liên kết thành công ${secondaryIds.length} phản ánh vào hồ sơ chính [${master.code}]!`
    )
  }

  // Tách hồ sơ con khỏi hồ sơ Master (Unlink - Tuân thủ BR-30, BR-31, API-023)
  const handleUnlinkReport = async (secondaryIdentifier: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const target = cases.find((c) => c.id === secondaryIdentifier || c.code === secondaryIdentifier)
    const targetCode = target ? target.code : secondaryIdentifier
    const targetId = target ? target.id : secondaryIdentifier
    const masterId = target?.master_case_id || selectedCaseId

    try {
      await triageService.unlinkReport(targetId, masterId)
      // Tải lại 100% dữ liệu từ Backend CSDL
      const refreshed = await triageService.getCases()
      setCases(refreshed)
      showToast(`Đã tách phản ánh [${targetCode.slice(0, 8)}] thành hồ sơ độc lập trong CSDL thành công!`)
    } catch (err: any) {
      console.error('❌ Lỗi khi tách hồ sơ qua API:', err)
      showToast(`❌ Lỗi tách hồ sơ: ${err?.message || 'Không thể tách báo cáo khỏi hồ sơ'}`)
    }
  }

  // Triage Project Assignment Modal (PA03)
  const handleOpenTriageProject = (c: TriageCase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setTargetTriageCase(c)
    setSelectedProjectId(c.project_id || 'prj-ql1a-02')
    setIsTriageProjectModalOpen(true)
  }

  const handleConfirmTriageProject = async (
    verificationMethod: 'FIELD' | 'DRONE' | 'EXISTING_EVIDENCE' = 'FIELD',
    reason: string = ''
  ) => {
    if (!targetTriageCase) return

    let projectName = 'Dự án đã chỉ định'
    try {
      const realProjects = projectService.getProjects()
      const found = realProjects.find(
        (p) => p.id === selectedProjectId || p.code === selectedProjectId
      )
      if (found) projectName = found.name
      else {
        const mockProj = mockProjects.find((p) => p.id === selectedProjectId)
        if (mockProj) projectName = mockProj.name
      }
    } catch {}

    const targetIds =
      selectedReportIds.includes(targetTriageCase.id) && selectedReportIds.length > 1
        ? selectedReportIds
        : [targetTriageCase.id]

    const methodLabels: Record<string, string> = {
      FIELD: 'Khảo sát đo đạc hiện trường (FIELD)',
      DRONE: 'Bay quét Drone bổ sung (DRONE)',
      EXISTING_EVIDENCE: 'Thẩm định bằng chứng hiện có (EXISTING_EVIDENCE)'
    }

    // Gọi API Candidate3 /api/v1/cases/{caseId}/triage (API-024)
    try {
      for (const id of targetIds) {
        const item = cases.find((c) => c.id === id) || targetTriageCase
        await triageService.triageCase(id, {
          projectId: selectedProjectId,
          verificationMethod,
          reason: reason.trim() || undefined,
          version: item?.version
        })
      }

      setCases((prev) =>
        prev.map((c) => {
          if (targetIds.includes(c.id)) {
            return {
              ...c,
              project_id: selectedProjectId,
              project_name: projectName,
              is_assigned: true,
              status: 'PENDING',
              status_label: 'Chờ PM thẩm định',
              pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[ĐIỀU PHỐI DỰ ÁN API-024] Giám sát đã gán vào dự án: ${projectName}. Định hướng xác minh: ${methodLabels[verificationMethod] || verificationMethod}${reason ? `. Chỉ đạo: "${reason}"` : ''}`
            }
          }
          return c
        })
      )

      setIsTriageProjectModalOpen(false)
      setSelectedReportIds([])
      showToast(`Đã điều phối ${targetIds.length} hồ sơ vào dự án "${projectName}" thành công!`)
    } catch (err: any) {
      console.error('❌ Lỗi khi điều phối ca tới backend:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi gọi API-024 điều phối ca'
      showToast(`❌ Lỗi Backend: ${errorMsg}`)
    }
  }

  return {
    selectedReportIds,
    setSelectedReportIds,
    isLinkReportsModalOpen,
    setIsLinkReportsModalOpen,
    linkMasterCaseId,
    setLinkMasterCaseId,
    linkAuditNotes,
    setLinkAuditNotes,
    isTriageProjectModalOpen,
    setIsTriageProjectModalOpen,
    targetTriageCase,
    setTargetTriageCase,
    selectedProjectId,
    setSelectedProjectId,
    handleToggleSelectReport,
    handleSelectAllReports,
    handleOpenLinkReportsModal,
    handleConfirmLinkReports,
    handleUnlinkReport,
    handleOpenTriageProject,
    handleConfirmTriageProject
  }
}
