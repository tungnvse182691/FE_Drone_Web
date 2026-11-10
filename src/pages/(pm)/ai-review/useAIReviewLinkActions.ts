import React, { useState } from 'react'
import { TriageCase } from './types'
import { triageService } from '../../../api/services/triageService'

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
  showToast,
  setCases,
  selectedCaseId,
  filteredCases
}: UseAIReviewLinkActionsProps) => {
  // Multi-select cho bảng tiếp nhận phản ánh người dân (Link Reports)
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])

  // Modal Liên kết báo trùng (Link Reports - PA04)
  const [isLinkReportsModalOpen, setIsLinkReportsModalOpen] = useState<boolean>(false)
  const [linkMasterCaseId, setLinkMasterCaseId] = useState<string>('')
  const [linkAuditNotes, setLinkAuditNotes] = useState<string>('')

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

  // Giữ entry point cũ nhưng không tạo kết quả liên kết cục bộ.
  const handleOpenLinkReportsModal = () => {}
  const handleConfirmLinkReports = () => {}

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

  return {
    selectedReportIds,
    setSelectedReportIds,
    isLinkReportsModalOpen,
    setIsLinkReportsModalOpen,
    linkMasterCaseId,
    setLinkMasterCaseId,
    linkAuditNotes,
    setLinkAuditNotes,
    handleToggleSelectReport,
    handleSelectAllReports,
    handleOpenLinkReportsModal,
    handleConfirmLinkReports,
    handleUnlinkReport
  }
}
