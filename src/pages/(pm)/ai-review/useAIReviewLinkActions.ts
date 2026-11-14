import React, { useState, useRef } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
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

  const linking = useRef(false)
  const canLink = () => useAuthStore.getState().user?.role === RoleCode.PROJECT_MANAGER
  const handleOpenLinkReportsModal = () => {
    if (!canLink()) return
    if (selectedReportIds.length < 2) { showToast('Chọn ít nhất hai Case để liên kết.'); return }
    setLinkMasterCaseId(selectedReportIds[0]); setLinkAuditNotes(triageService.pendingD2(selectedReportIds[0], 'report-links')?.body.reason || ''); setIsLinkReportsModalOpen(true)
  }
  const handleConfirmLinkReports = async () => {
    if (!canLink() || linking.current) return
    if (!selectedReportIds.includes(linkMasterCaseId) || selectedReportIds.length < 2 || !linkAuditNotes.trim()) { showToast('Chọn Case chính và nhập lý do liên kết.'); return }
    const selected = cases.filter(c => selectedReportIds.includes(c.id))
    if (selected.length !== selectedReportIds.length || !selected[0]?.project_id || selected.some(c => c.project_id !== selected[0].project_id)) { showToast('Chỉ liên kết Case cùng dự án đã phân công.'); return }
    const session = getCaseSessionKey()
    linking.current = true
    try {
      await triageService.linkDuplicateReports(linkMasterCaseId, selectedReportIds.filter(id => id !== linkMasterCaseId), linkAuditNotes)
      const refreshed = await triageService.getCases()
      if (session !== getCaseSessionKey()) return
      setCases(refreshed); setSelectedReportIds([]); setIsLinkReportsModalOpen(false)
      showToast('Đã đọc lại danh sách sau liên kết Report. Chưa công bố kết quả.')
    } catch (error: any) {
      if (session === getCaseSessionKey()) showToast(error.response?.data?.detail || error.message)
    } finally { linking.current = false }
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
