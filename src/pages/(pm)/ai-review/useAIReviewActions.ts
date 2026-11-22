import { caseNoDefectService } from '../../../api/services/caseNoDefectService'
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
  applyCaseReadback: (value: TriageCase) => void
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
  applyCaseReadback,
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
  const epoch = useAuthStore.getState().authEpoch
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const isCurrent = () => mounted.current && useAuthStore.getState().authEpoch === epoch
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
  const handleVerifyDefect = async (_c?: TriageCase) => {
    showToast('Chưa đủ nguồn Defect đã xác minh và bằng chứng để kết luận có lỗi. Chưa gửi lệnh CONFIRMED.')
  }

  const handleOpenNoDefectModal = (c?: TriageCase) => {
    const target = c || selectedCase
    if (isSupervisor || !target.project_id || target.case_status !== 'OPEN' && !caseNoDefectService.pending(target.id)) { showToast('Chỉ PM được kết luận Case OPEN đã phân công.'); return }
    setTargetTriageCase(target)
    setNoDefectReason(caseNoDefectService.pending(target.id)?.body.reason || '')
    setIsNoDefectModalOpen(true)
  }

  useEffect(() => {
    if (isSupervisor || !selectedCase.id || !selectedCase.project_id) return
    try {
      const held = caseNoDefectService.pending(selectedCase.id)
      if (held?.projectId === selectedCase.project_id) {
        setTargetTriageCase(selectedCase); setNoDefectReason(held.body.reason); setIsNoDefectModalOpen(true)
      }
    } catch (e) { showToast((e as Error).message) }
  }, [selectedCase.id, epoch])

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

  const selectedRef = useRef(selectedCase.id); selectedRef.current = selectedCase.id
  const handleConfirmNoDefect = async (evidenceId?: string) => {
    const target = targetTriageCase || selectedCase, currentId = selectedCase.id
    if (target.id !== currentId) throw new Error('Hồ sơ đang chọn đã thay đổi; mở lại đúng Case trước khi kết luận.')
    const pending = caseNoDefectService.pending(target.id)
    const result = await caseNoDefectService.request(target.id, pending?.projectId || target.project_id || '', pending?.body.reason || noDefectReason, pending?.version || target.etag || target.version || '', pending?.body.evidenceIds[0] || evidenceId || '')
    if (!isCurrent() || selectedRef.current !== currentId) return
    setCases(prev => prev.map(c => c.id === result.record.id ? {...result.record, project_name: c.project_name} : c))
    setIsNoDefectModalOpen(false)
    setIsDetailModalOpen?.(false)
    showToast(result.verified ? 'Đã GET xác nhận kết luận Không có lỗi. Chưa công bố cho người phản ánh.' : 'Đã đọc trạng thái mới nhất; không gửi lại kết luận cũ.')
  }

  const handleReviewNoDefect = async () => {
    const target = targetTriageCase || selectedCase, id = selectedCase.id
    if (target.id !== id) throw new Error('Hồ sơ đang chọn đã thay đổi; chưa đối chiếu lệnh khác Case.')
    const fresh = await caseNoDefectService.reviewRejected(target.id, target.project_id || '')
    if (!isCurrent() || selectedRef.current !== id) return
    setTargetTriageCase(fresh)
    setCases(prev => prev.map(c => c.id === fresh.id ? {...fresh, project_name: c.project_name} : c))
  }

  // OUT_OF_SCOPE Conclusion
  const handleConclusionOutOfScope = async (c?: TriageCase) => {
    showToast('Chưa có contract kết luận OUT_OF_SCOPE hoặc chuyển cơ quan khác. Chưa gửi lệnh; không thay bằng NO_DEFECT.')
  }

  const handleResetConclusion = (c?: TriageCase) => {
    // Case đã OPEN (BE tự mở lại khi có bổ sung) thì không cần lệnh mở lại: thẩm định tiếp theo trạng thái OPEN.
    if ((c || selectedCase)?.case_status === 'OPEN') {
      showToast('Hồ sơ đang ở trạng thái OPEN: tiếp tục thẩm định ở khung bên dưới, không cần mở lại kết luận.')
      return
    }
    showToast('Chưa có command mở lại kết luận Case trong contract. Không thay đổi trạng thái server; hãy bổ sung bằng chứng theo quy trình được phép.')
  }

  // Publish Public Result 
  const handleOpenPublishModal = (c?: TriageCase) => {
    const target = c || selectedCase
    if (useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER || !target.project_id) { showToast('Chỉ PM được công bố kết quả Case đã phân công.'); return }
    setTargetTriageCase(target)
    setPublishPublicNote(triageService.pendingD2(target.id, 'publications')?.body.summary || '')
    setIsPublishModalOpen(true)
  }

  const publicationScope = `${useAuthStore.getState().authEpoch}:${user?.id}:${user?.role}:${selectedCase.id}:${selectedCase.project_id}`
  const latestPublication = useRef({ scope: publicationScope })
  if (latestPublication.current.scope !== publicationScope) latestPublication.current = { scope: publicationScope }
  const publishing = useRef(false)
  const handleConfirmPublishResult = async (reportIds: string[] = []) => {
    if (publishing.current || useAuthStore.getState().user?.role !== RoleCode.PROJECT_MANAGER) return
    const target = targetTriageCase || selectedCase
    if (!publishPublicNote.trim()) { showToast('Vui lòng nhập nội dung công bố.'); return }

    if (target.id !== selectedCase.id || target.project_id !== selectedCase.project_id || latestPublication.current.scope !== publicationScope) { showToast('Hồ sơ đang mở đã thay đổi; mở lại công bố cho đúng Case.'); return }
    const publicationContext = latestPublication.current
    const publicationEpoch = useAuthStore.getState().authEpoch
    publishing.current = true
    try {
      const result = await triageService.publishCase(target.id, {
        summary: publishPublicNote,
        version: target.version,
        reportIds
      })

      if (!isCurrent() || useAuthStore.getState().authEpoch !== publicationEpoch || latestPublication.current !== publicationContext) return
      applyCaseReadback(result)
      setTargetTriageCase(result)

      showToast(
        `Đã công bố kết quả tiếp nhận & tiến độ xử lý hồ sơ [${target.code}] cho người dân thành công!`
      )
      setIsPublishModalOpen(false)
    } catch (e: any) {
      console.error('❌ Lỗi khi xuất bản kết quả tới backend:', e)
      if (!isCurrent() || useAuthStore.getState().authEpoch !== publicationEpoch || latestPublication.current !== publicationContext) return
      const errorMsg = e?.response?.data?.message || e?.message || 'Lỗi khi xuất bản kết quả tới backend'
      showToast(`❌ Lỗi Backend: ${errorMsg}`)
    } finally { publishing.current = false }
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
    handleReviewNoDefect,
    handleConclusionOutOfScope,
    handleResetConclusion,
    handleOpenPublishModal,
    handleConfirmPublishResult,
    handleExecuteMerge
  }
}
