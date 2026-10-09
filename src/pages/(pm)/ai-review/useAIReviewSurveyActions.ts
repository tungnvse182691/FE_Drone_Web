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
  const [surveyAssignedCrew, setSurveyAssignedCrew] = useState<string>(
    'Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)'
  )
  const [surveySlaHours, setSurveySlaHours] = useState<number>(24)

  const handleOpenRequestSurveyModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setSurveyReason(
      target.survey_assignment?.reason ||
        'Ảnh hiện trường chưa rõ độ sâu/kích thước hư hỏng, cần tổ kỹ sư đo đạc kiểm tra bổ sung.'
    )
    setSurveyMode('MEASURE_ONLY')
    setSurveyAssignedCrew('Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)')
    setSurveySlaHours(24)
    setIsRequestSurveyModalOpen(true)
  }

  const handleConfirmRequestSurvey = async () => {
    const finalReason =
      surveyReason.trim() ||
      'Ảnh hiện trường chưa rõ độ sâu/kích thước hư hỏng, cần tổ kỹ sư đo đạc kiểm tra bổ sung.'
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    const targetCode = targetTriageCase ? targetTriageCase.code : selectedCase.code
    const nowTime =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString('vi-VN')

    const updates: Partial<TriageCase> = {
      status: 'NEED_SURVEY',
      status_label: 'Cần đo đạc',
      conclusion: 'NEED_SURVEY',
      survey_assignment: {
        mode: surveyMode,
        reason: finalReason,
        assigned_crew: surveyAssignedCrew,
        sla_hours: surveySlaHours,
        created_at: nowTime
      },
      pm_notes: `${(targetTriageCase?.pm_notes || selectedCase.pm_notes) ? (targetTriageCase?.pm_notes || selectedCase.pm_notes) + '\n' : ''}[LỆNH ĐO ĐẠC WF-11] Hình thức: ${
        surveyMode === 'MEASURE_ONLY' ? 'Đo đạc hiện trường' : 'Bay quét Drone bổ sung'
      }. Đơn vị: ${surveyAssignedCrew}. Hạn SLA: ${surveySlaHours}h. Lý do: ${finalReason}`
    }

    setCases((prev) =>
      prev.map((c) =>
        c.id === targetId || c.code === targetCode
          ? {
              ...c,
              ...updates
            }
          : c
      )
    )

    try {
      await triageService.updateCase(targetId, updates)
    } catch (e) {
      console.warn('Could not sync updateCase to triageService', e)
    }

    try {
      const existingTasksRaw = localStorage.getItem('roadguard_field_tasks')
      const existingTasks = existingTasksRaw ? JSON.parse(existingTasksRaw) : []
      const newTask = {
        id: `FT-${Date.now()}`,
        code: `TASK-${targetCode.replace('#', '')}`,
        defectId: targetId,
        defectCode: targetCode.replace('#', ''),
        title: `Đo đạc bổ sung: ${targetTriageCase?.defect_title || selectedCase.defect_title}`,
        mode: surveyMode,
        stationing: targetTriageCase?.stationing || selectedCase.stationing,
        assignedTo: surveyAssignedCrew,
        reason: finalReason,
        slaHours: surveySlaHours,
        status: 'ASSIGNED',
        createdAt: nowTime
      }
      localStorage.setItem('roadguard_field_tasks', JSON.stringify([newTask, ...existingTasks]))
    } catch (e) {
      console.warn('Could not save field task to localStorage', e)
    }

    // Đóng popup xác nhận và đóng luôn modal/drawer thẩm định để trả PM về trang danh sách
    setIsRequestSurveyModalOpen(false)
    setIsDetailModalOpen?.(false)

    showToast(
      `Đã phát lệnh đo đạc [WF-11] cho hồ sơ [${targetCode}]! Chuyển trạng thái sang Cần đo đạc.`
    )
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
