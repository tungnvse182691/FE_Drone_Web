import { useState } from 'react'
import { TriageCase } from './types'
import { triageService } from '../../../api/services/triageService'

export interface UseAIReviewSurveyActionsProps {
  setCases: React.Dispatch<React.SetStateAction<TriageCase[]>>
  selectedCase: TriageCase
  showToast: (msg: string) => void
  targetTriageCase: TriageCase | null
  setTargetTriageCase: (c: TriageCase | null) => void
  setIsDetailModalOpen?: (open: boolean) => void
}

export const useAIReviewSurveyActions = ({
  setCases,
  selectedCase,
  showToast,
  targetTriageCase,
  setTargetTriageCase,
  setIsDetailModalOpen
}: UseAIReviewSurveyActionsProps) => {
  // Modal Yêu cầu đo đạc bổ sung / Bay drone lại (WF-11 / NEEDS_MEASUREMENT)
  const [isRequestSurveyModalOpen, setIsRequestSurveyModalOpen] = useState<boolean>(false)
  const [surveyMode, setSurveyMode] = useState<'MEASURE_ONLY' | 'DRONE_RESURVEY'>('MEASURE_ONLY')
  const [surveyReason, setSurveyReason] = useState<string>('')
  const [surveyAssignedCrew, setSurveyAssignedCrew] = useState<string>('')
  const [surveySlaHours, setSurveySlaHours] = useState<number>(24)

  const handleOpenRequestSurveyModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setSurveyReason(
      target.conclusion_reason || ''
    )
    setSurveyMode('MEASURE_ONLY')
    setSurveyAssignedCrew('')
    setSurveySlaHours(24)
    setIsRequestSurveyModalOpen(true)
  }

  const handleConfirmRequestSurvey = async () => {
    const finalReason = surveyReason.trim()
    if (!finalReason) { showToast('Vui lòng nhập lý do yêu cầu bổ sung.'); return }
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    const targetCode = targetTriageCase ? targetTriageCase.code : selectedCase.code
    try {
      const result = await triageService.concludeCase(targetId, {
        outcome: 'NEEDS_EVIDENCE', reason: finalReason,
        version: targetTriageCase?.version || selectedCase.version
      })
      setCases(prev => prev.map(item => item.id === targetId ? { ...item, ...result, project_name: item.project_name } : item))
      showToast(`Đã ghi nhận yêu cầu bổ sung bằng chứng cho ${targetCode}. Chưa tạo/giao FIELD (P2-07).`)
      setIsRequestSurveyModalOpen(false)
    } catch (error: any) {
      if (error.serverCase) setCases(prev => prev.map(item => item.id === targetId ? { ...item, ...error.serverCase, project_name: item.project_name } : item))
      showToast(error.message || 'Không thể ghi nhận yêu cầu bổ sung bằng chứng.')
    }
  }

  return {
    isRequestSurveyModalOpen,
    setIsRequestSurveyModalOpen,
    surveyMode,
    setSurveyMode,
    surveyReason,
    setSurveyReason,
    surveyAssignedCrew,
    setSurveyAssignedCrew,
    surveySlaHours,
    setSurveySlaHours,
    handleOpenRequestSurveyModal,
    handleConfirmRequestSurvey
  }
}
