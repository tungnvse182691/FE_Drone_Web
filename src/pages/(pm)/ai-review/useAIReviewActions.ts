import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TriageCase } from './types'
import { useAIReviewSurveyActions } from './useAIReviewSurveyActions'

export interface UseAIReviewActionsProps {
  cases: TriageCase[]
  setCases: React.Dispatch<React.SetStateAction<TriageCase[]>>
  selectedCase: TriageCase
  setExpandedMasterIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  setIsMergeModalOpen: (open: boolean) => void
  currentSeverity: TriageCase['severity']
  currentUrgency: TriageCase['urgency']
  currentArea: number
  currentDepth: number
  currentNotes: string
}

export const useAIReviewActions = ({
  cases,
  setCases,
  selectedCase,
  setExpandedMasterIds,
  showToast,
  setIsMergeModalOpen,
  currentSeverity,
  currentUrgency,
  currentArea,
  currentDepth,
  currentNotes
}: UseAIReviewActionsProps) => {
  const navigate = useNavigate()

  // Modal target case & reason states
  const [targetTriageCase, setTargetTriageCase] = useState<TriageCase | null>(null)

  // Modal Kết luận Không có khiếm khuyết NO_DEFECT (Bắt buộc lý do theo BR-39)
  const [isNoDefectModalOpen, setIsNoDefectModalOpen] = useState<boolean>(false)
  const [noDefectReason, setNoDefectReason] = useState<string>('')

  // Modal Công bố kết quả sửa chữa cho người dân (PA07)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false)
  const [publishPublicNote, setPublishPublicNote] = useState<string>('')

  // Sub-hook: Survey actions
  const surveyActions = useAIReviewSurveyActions({
    setCases,
    selectedCase,
    showToast,
    targetTriageCase,
    setTargetTriageCase
  })

  // Handlers for Triage Decision Actions
  const handleVerifyDefect = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'VERIFIED',
              status_label: 'Đã xác minh (Verified)',
              conclusion: 'DEFECT_FOUND',
              severity: currentSeverity,
              urgency: currentUrgency,
              area_sqm: currentArea,
              max_depth_cm: currentDepth,
              pm_notes: currentNotes || 'Đã xác minh hư hỏng đạt tiêu chí kích hoạt sửa chữa.'
            }
          : item
      )
    )
    showToast(
      `Đã xác minh hợp lệ hồ sơ [${target.code}]! Đã tạo khiếm khuyết OPEN sẵn sàng đưa vào lệnh sửa chữa (WF-05).`
    )
  }

  const handleOpenNoDefectModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setNoDefectReason('')
    setIsNoDefectModalOpen(true)
  }

  const handleRejectDefect = () => {
    handleOpenNoDefectModal(selectedCase)
  }

  // Điều phối chuyển sang Fast Track (WF-05): Tự động truyền hồ sơ đang chọn
  const handleNavigateFastTrack = (c?: TriageCase) => {
    const target = c || selectedCase
    navigate(
      `/pm/fast-track?defectCode=${encodeURIComponent(target.code)}&caseId=${encodeURIComponent(target.id)}`,
      {
        state: { targetDefect: target }
      }
    )
  }

  const handleConfirmNoDefect = () => {
    if (!noDefectReason.trim()) {
      showToast('Lỗi BR-39: Bắt buộc nhập lý do giải trình kỹ thuật khi kết luận NO_DEFECT!')
      return
    }
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    setCases((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              status: 'REJECTED',
              status_label: 'Báo sai (No Defect)',
              conclusion: 'NO_DEFECT',
              conclusion_reason: noDefectReason,
              pm_notes: `[NO_DEFECT - BR-39] ${noDefectReason}`
            }
          : c
      )
    )
    setIsNoDefectModalOpen(false)
    showToast(
      `Đã ghi nhận kết luận NO_DEFECT cho hồ sơ [${targetTriageCase?.code || selectedCase.code}] (Tuân thủ BR-39)!`
    )
  }

  // OUT_OF_SCOPE Conclusion
  const handleConclusionOutOfScope = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'REJECTED',
              status_label: 'Ngoài phạm vi',
              conclusion: 'OUT_OF_SCOPE',
              conclusion_reason: 'Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.',
              pm_notes:
                '[OUT_OF_SCOPE] Vị trí nằm ngoài phạm vi bảo hành. Đã chuyển hồ sơ sang cơ quan quản lý đường bộ địa phương.'
            }
          : item
      )
    )
    showToast(`Đã phân loại hồ sơ [${target.code}] là NGOÀI PHẠM VI BẢO HÀNH (OUT_OF_SCOPE).`)
  }

  // Reset conclusion to PENDING for re-evaluating
  const handleResetConclusion = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'PENDING',
              status_label: 'Chờ thẩm định',
              conclusion: null,
              conclusion_reason: undefined
            }
          : item
      )
    )
    showToast(`Đã mở lại trạng thái chờ thẩm định cho hồ sơ [${target.code}].`)
  }

  // Publish Public Result (PA07)
  const handleOpenPublishModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setPublishPublicNote(
      'Đơn vị bảo hành Hoàng Hải đã tiếp nhận và đưa vị trí này vào kế hoạch kiểm tra / sửa chữa. Cảm ơn thông tin phản ánh của Quý công dân.'
    )
    setIsPublishModalOpen(true)
  }

  const handleConfirmPublishResult = () => {
    const target = targetTriageCase || selectedCase
    const nowTime =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString('vi-VN')
    setCases((prev) =>
      prev.map((c) =>
        c.id === target.id
          ? {
              ...c,
              is_published: true,
              published_at: nowTime,
              public_notice: publishPublicNote
            }
          : c
      )
    )
    showToast(
      `Đã công bố kết quả tiếp nhận & tiến độ xử lý hồ sơ [${target.code}] lên Ứng dụng Di động Citizen (PA07)!`
    )
    setIsPublishModalOpen(false)
  }

  const handleExecuteMerge = () => {
    const selectedDups = selectedCase.cluster_duplicates?.filter((d) => d.selected) || []
    if (selectedDups.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 hồ sơ trùng lặp để gộp!')
      return
    }

    const dupCodes = selectedDups.map((d) => d.code)
    setCases((prev) =>
      prev.map((c) => {
        if (dupCodes.includes(c.code)) {
          return {
            ...c,
            status: 'MERGED',
            status_label: 'Đã gộp trùng',
            master_case_id: selectedCase.id,
            pm_notes: `Đã tự động gộp dữ liệu vào hồ sơ chính ${selectedCase.code}`
          }
        }
        if (c.id === selectedCase.id) {
          const updatedDups = (c.cluster_duplicates || []).map((dup) =>
            dupCodes.includes(dup.code) ? { ...dup, selected: false, is_merged: true } : dup
          )
          const updatedLinked = Array.from(new Set([...(c.linked_report_ids || []), ...dupCodes]))
          return {
            ...c,
            linked_report_ids: updatedLinked,
            cluster_duplicates: updatedDups,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[GỘP CỤM SPATIAL] Đã tích hợp bằng chứng từ ${dupCodes.join(', ')}`
          }
        }
        return c
      })
    )
    setExpandedMasterIds((prev) => Array.from(new Set([...prev, selectedCase.id])))
    setIsMergeModalOpen(false)
    showToast(`Gộp thành công ${selectedDups.length} phản ánh lân cận vào hồ sơ gốc [${selectedCase.code}]!`)
  }

  return {
    targetTriageCase,
    setTargetTriageCase,
    isNoDefectModalOpen,
    setIsNoDefectModalOpen,
    noDefectReason,
    setNoDefectReason,
    isPublishModalOpen,
    setIsPublishModalOpen,
    publishPublicNote,
    setPublishPublicNote,
    isRequestSurveyModalOpen: surveyActions.isRequestSurveyModalOpen,
    setIsRequestSurveyModalOpen: surveyActions.setIsRequestSurveyModalOpen,
    surveyMode: surveyActions.surveyMode,
    setSurveyMode: surveyActions.setSurveyMode,
    surveyReason: surveyActions.surveyReason,
    setSurveyReason: surveyActions.setSurveyReason,
    surveyAssignedCrew: surveyActions.surveyAssignedCrew,
    setSurveyAssignedCrew: surveyActions.setSurveyAssignedCrew,
    surveySlaHours: surveyActions.surveySlaHours,
    setSurveySlaHours: surveyActions.setSurveySlaHours,
    handleOpenRequestSurveyModal: surveyActions.handleOpenRequestSurveyModal,
    handleConfirmRequestSurvey: surveyActions.handleConfirmRequestSurvey,
    handleVerifyDefect,
    handleRejectDefect,
    handleNavigateFastTrack,
    handleOpenNoDefectModal,
    handleConfirmNoDefect,
    handleConclusionOutOfScope,
    handleResetConclusion,
    handleOpenPublishModal,
    handleConfirmPublishResult,
    handleExecuteMerge
  }
}
