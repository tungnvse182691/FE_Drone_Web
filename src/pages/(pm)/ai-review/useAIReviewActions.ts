import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TriageCase } from './types'
import { useAIReviewSurveyActions } from './useAIReviewSurveyActions'
import { triageService } from '../../../api/services/triageService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'

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
  setIsDetailModalOpen?: (open: boolean) => void
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
  currentNotes,
  setIsDetailModalOpen
}: UseAIReviewActionsProps) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const isCurrent = () => mounted.current && useAuthStore.getState().user === user
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Modal target case & reason states
  const [targetTriageCase, setTargetTriageCase] = useState<TriageCase | null>(null)

  // Modal Kết luận Không có khiếm khuyết NO_DEFECT (Bắt buộc lý do theo BR-39)
  const [isNoDefectModalOpen, setIsNoDefectModalOpen] = useState<boolean>(false)
  const [noDefectReason, setNoDefectReason] = useState<string>('')

  // Modal Công bố kết quả sửa chữa cho người dân 
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false)
  const [publishPublicNote, setPublishPublicNote] = useState<string>('')

  // Sub-hook: Survey actions
  const surveyActions = useAIReviewSurveyActions({
    setCases,
    selectedCase,
    showToast,
    targetTriageCase,
    setTargetTriageCase,
    setIsDetailModalOpen
  })

  // Handlers for Triage Decision Actions
  const handleVerifyDefect = async (c?: TriageCase) => {
    const target = c || selectedCase
    const isFieldIntake = target.source === 'CITIZEN' || target.source === 'PATROL'
    const outcome = isFieldIntake ? 'NEEDS_EVIDENCE' : 'CONFIRMED'

    const updates: Partial<TriageCase> = {
      status: outcome === 'NEEDS_EVIDENCE' ? 'AWAITING_EVIDENCE' : 'VERIFIED',
      status_label: outcome === 'NEEDS_EVIDENCE' ? 'Chờ đo đạc hiện trường' : 'Đã xác minh (Verified)',
      conclusion: outcome === 'NEEDS_EVIDENCE' ? 'NEEDS_EVIDENCE' : 'DEFECT_FOUND',
      conclusion_reason: currentNotes || (outcome === 'NEEDS_EVIDENCE'
        ? 'Phản ánh hiện trường hợp lệ. Đã duyệt yêu cầu đo đạc thực tế (Dài x Rộng x Sâu) để lập hồ sơ kỹ thuật.'
        : 'Đã xác minh hư hỏng đạt tiêu chí kích hoạt sửa chữa.'),
      pm_notes: currentNotes || (outcome === 'NEEDS_EVIDENCE'
        ? 'Đã duyệt yêu cầu đo đạc hiện trường.'
        : 'Đã xác minh hư hỏng đạt tiêu chí kích hoạt sửa chữa.')
    }

    try {
      const res = await triageService.concludeCase(target.id, {
        outcome,
        reason: updates.conclusion_reason,
        version: target.version
      })

      if (!isCurrent()) return
      // Cập nhật state sau khi Backend CSDL thật đã ghi nhận thành công
      setCases((prev) =>
        prev.map((item) =>
          item.id === target.id || item.code === target.code
            ? {
                ...item,
                ...res,
                project_name: item.project_name
              }
            : item
        )
      )

      showToast(
        outcome === 'NEEDS_EVIDENCE'
          ? `Đã ghi nhận yêu cầu bổ sung bằng chứng cho hồ sơ [${target.code}]. Chưa tạo hoặc giao nhiệm vụ đo đạc.`
          : `Đã ghi nhận kết luận từ server cho hồ sơ [${target.code}].`
      )
    } catch (e: any) {
      console.error('❌ Lỗi khi gửi xác minh tới backend:', e)
      if (!isCurrent()) return
      if (e.serverCase) setCases(prev => prev.map(item => item.id === e.serverCase.id ? { ...item, ...e.serverCase, project_name: item.project_name } : item))
      const errorMsg = e?.response?.data?.message || e?.message || 'Lỗi khi gửi xác minh tới backend'
      showToast(`❌ Lỗi Backend: ${errorMsg}`)
    }
  }

  const handleOpenNoDefectModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setNoDefectReason(
      target.conclusion_reason ||
        'Hình ảnh phản ánh bóng râm/vết nước mặt đường, không phải khiếm khuyết kết cấu.'
    )
    setIsNoDefectModalOpen(true)
  }

  const handleRejectDefect = () => {
    handleOpenNoDefectModal(selectedCase)
  }

  // Điều phối chuyển sang Fast Track (WF-05): Tự động truyền hồ sơ đang chọn
  const handleNavigateFastTrack = (c?: TriageCase) => {
    const target = c || selectedCase
    navigate(
      `${basePath}/fast-track?defectCode=${encodeURIComponent(target.code)}&caseId=${encodeURIComponent(target.id)}`,
      {
        state: { targetDefect: target }
      }
    )
  }

  const handleConfirmNoDefect = async () => {
    const finalReason =
      noDefectReason.trim() ||
      'Hình ảnh phản ánh bóng râm/vết nước mặt đường, không phải khiếm khuyết kết cấu.'
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    const targetCode = targetTriageCase ? targetTriageCase.code : selectedCase.code

    const updates: Partial<TriageCase> = {
      status: 'REJECTED',
      status_label: 'Báo sai (No Defect)',
      conclusion: 'NO_DEFECT',
      conclusion_reason: finalReason,
      pm_notes: `[NO_DEFECT - BR-39] ${finalReason}`
    }

    try {
      const res = await triageService.concludeCase(targetId, {
        outcome: 'NO_DEFECT',
        reason: finalReason,
        version: targetTriageCase?.version || selectedCase.version
      })

      if (!isCurrent()) return
      // Cập nhật state sau khi Backend CSDL thật đã ghi nhận thành công
      setCases((prev) =>
        prev.map((c) =>
          c.id === targetId || c.code === targetCode
            ? {
                ...c,
                ...res,
                project_name: c.project_name
              }
            : c
        )
      )

      // Đóng modal lý do từ chối và đóng luôn modal/drawer thẩm định để trả về danh sách
      setIsNoDefectModalOpen(false)
      setIsDetailModalOpen?.(false)

      showToast(
        `Đã ghi nhận kết luận Từ chối (Không có khiếm khuyết) cho hồ sơ [${targetCode}]!`
      )
    } catch (e: any) {
      console.error('❌ Lỗi khi gửi kết luận tới backend:', e)
      if (!isCurrent()) return
      if (e.serverCase) setCases(prev => prev.map(item => item.id === e.serverCase.id ? { ...item, ...e.serverCase, project_name: item.project_name } : item))
      const errorMsg = e?.response?.data?.message || e?.message || 'Lỗi khi gửi kết luận tới backend'
      showToast(`❌ Lỗi Backend: ${errorMsg}`)
    }
  }

  // OUT_OF_SCOPE Conclusion
  const handleConclusionOutOfScope = async (c?: TriageCase) => {
    const target = c || selectedCase
    const updates: Partial<TriageCase> = {
      status: 'REJECTED',
      status_label: 'Ngoài phạm vi',
      conclusion: 'OUT_OF_SCOPE',
      conclusion_reason: 'Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.',
      pm_notes:
        '[OUT_OF_SCOPE] Vị trí nằm ngoài phạm vi bảo hành. Đã chuyển hồ sơ sang cơ quan quản lý đường bộ địa phương.'
    }

    try {
      const res = await triageService.concludeCase(target.id, {
        outcome: 'NO_DEFECT',
        reason: updates.conclusion_reason,
        version: target.version
      })

      if (!isCurrent()) return
      // Cập nhật state sau khi Backend CSDL thật đã ghi nhận thành công
      setCases((prev) =>
        prev.map((item) =>
          item.id === target.id || item.code === target.code
            ? {
                ...item,
                ...res,
                project_name: item.project_name
              }
            : item
        )
      )

      // Đóng modal/drawer thẩm định và trả về danh sách
      setIsDetailModalOpen?.(false)

      showToast(`Đã phân loại hồ sơ [${target.code}] là NGOÀI PHẠM VI BẢO HÀNH (OUT_OF_SCOPE).`)
    } catch (e: any) {
      console.error('❌ Lỗi khi gửi kết luận ngoài phạm vi tới backend:', e)
      if (!isCurrent()) return
      if (e.serverCase) setCases(prev => prev.map(item => item.id === e.serverCase.id ? { ...item, ...e.serverCase, project_name: item.project_name } : item))
      const errorMsg = e?.response?.data?.message || e?.message || 'Lỗi khi gửi kết luận tới backend'
      showToast(`❌ Lỗi Backend: ${errorMsg}`)
    }
  }

  // Reset conclusion to PENDING for re-evaluating
  const handleResetConclusion = () => {
    showToast('Chưa có command mở lại kết luận Case trong contract. Không thay đổi trạng thái server; hãy bổ sung bằng chứng theo quy trình được phép.')
  }

  // Publish Public Result 
  const handleOpenPublishModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setPublishPublicNote(
      'Đơn vị bảo hành Hoàng Hải đã tiếp nhận và đưa vị trí này vào kế hoạch kiểm tra / sửa chữa. Cảm ơn thông tin phản ánh của Quý công dân.'
    )
    setIsPublishModalOpen(true)
  }

  const handleConfirmPublishResult = async () => {
    const target = targetTriageCase || selectedCase
    const nowTime =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString('vi-VN')

    try {
      const result = await triageService.publishCase(target.id, {
        summary: publishPublicNote,
        version: target.version,
        reportIds: target.report_ids && target.report_ids.length > 0 ? target.report_ids : undefined
      })

      if (!isCurrent()) return
      setCases((prev) =>
        prev.map((c) =>
          c.id === target.id
            ? {
                ...c,
                ...result,
                project_name: c.project_name,
                is_published: true,
                published_at: nowTime,
                public_notice: publishPublicNote
              }
            : c
        )
      )

      showToast(
        `Đã công bố kết quả tiếp nhận & tiến độ xử lý hồ sơ [${target.code}] cho người dân thành công!`
      )
      setIsPublishModalOpen(false)
    } catch (e: any) {
      console.error('❌ Lỗi khi xuất bản kết quả tới backend:', e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Lỗi khi xuất bản kết quả tới backend'
      showToast(`❌ Lỗi Backend: ${errorMsg}`)
    }
  }

  const handleExecuteMerge = () => {
    showToast('Gợi ý trùng không tự gộp hồ sơ. Hãy chọn các Case và dùng Liên kết báo cáo để gửi command có version hợp lệ.')
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
