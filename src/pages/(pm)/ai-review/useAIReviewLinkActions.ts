import React, { useState } from 'react'
import { TriageCase } from './types'
import { triageService, getCaseSessionKey } from '../../../api/services/triageService'

export interface UseAIReviewLinkActionsProps {
  cases: TriageCase[]
  setCases: React.Dispatch<React.SetStateAction<TriageCase[]>>
  selectedCaseId: string
  setSelectedCaseId: (id: string) => void
  setExpandedMasterIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  filteredCases: TriageCase[]
  reloadCases: () => void
}

export const useAIReviewLinkActions = ({
  cases,
  setCases,
  selectedCaseId,
  setSelectedCaseId,
  setExpandedMasterIds,
  showToast,
  filteredCases,
  reloadCases
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

  const handleConfirmLinkReports = async () => {
    if (!linkMasterCaseId || selectedReportIds.length < 2) { showToast('Chọn Case chính và ít nhất một Case nguồn.'); return }
    try {
      await triageService.linkDuplicateReports(linkMasterCaseId, selectedReportIds.filter(id => id !== linkMasterCaseId), linkAuditNotes)
      reloadCases()
      setIsLinkReportsModalOpen(false)
      setSelectedReportIds([])
      showToast('Server đã xác nhận liên kết báo cáo. Đang tải lại hồ sơ.')
    } catch (error: any) {
      showToast(error?.response?.data?.code || error.message || 'Không thể liên kết; giữ bản nháp để đối chiếu.')
    }
  }

  // Tách hồ sơ con khỏi hồ sơ Master (Unlink - Tuân thủ BR-30, BR-31, API-023)
  const handleUnlinkReport = async (secondaryIdentifier: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const session = getCaseSessionKey()
    const masterId = selectedCaseId
    if (!masterId) throw new Error('Chưa xác định được Case để tách Report.')
    await triageService.splitReport(masterId, secondaryIdentifier, 'PM yêu cầu tách Report đã chọn khỏi Case')
    const updated = await triageService.getCaseById(masterId)
    if (!updated) throw new Error('Đã gửi lệnh tách nhưng chưa đọc lại được Case nguồn.')
    const refreshed = await triageService.getCases()
    if (session !== getCaseSessionKey()) throw new Error('Phiên đã thay đổi; bỏ phản hồi tách cũ.')
    setCases(refreshed)

  }

  // Triage Project Assignment Modal (PA03)
  const handleOpenTriageProject = (c: TriageCase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setTargetTriageCase(c)
    setSelectedProjectId(c.project_id || '')
    setIsTriageProjectModalOpen(true)
  }

  const handleConfirmTriageProject = async (
    verificationMethod: 'FIELD' | 'DRONE' | 'EXISTING_EVIDENCE',
    reason: string
  ) => {
    if (!targetTriageCase) return

    const projectName = selectedProjectId

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
        const item = cases.find((c) => c.id === id)
        if (!item?.version) throw new Error('Thiếu snapshot Case đã chọn.')
        await triageService.triageCase(id, {
          projectId: selectedProjectId,
          verificationMethod,
          reason: reason.trim() || undefined,
          version: item?.version
        })
      }

      reloadCases()

      setIsTriageProjectModalOpen(false)
      setSelectedReportIds([])
      showToast(`Đã điều phối ${targetIds.length} hồ sơ vào dự án "${projectName}" thành công!`)
    } catch (err: any) {
      console.error('❌ Lỗi khi điều phối ca tới backend:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi điều phối ca vào dự án'
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
    handleUnlinkReportLegacy: (reportId: string, event?: React.MouseEvent) => handleUnlinkReport(reportId, event).catch(error => showToast(error?.message || 'Không thể tách Report.')),
    handleOpenTriageProject,
    handleConfirmTriageProject
  }
}
